/**
 * Google Indexing API submitter — somatic + Dream Meaning URLs.
 * Primary discovery remains sitemap; API accelerates crawl for new pages.
 * Note: Google officially documents JobPosting/BroadcastEvent; general URLs
 * often return 403 — script stops cleanly and falls back to GSC/sitemap.
 *
 * Usage:
 *   set GOOGLE_APPLICATION_CREDENTIALS=path/to/sa.json
 *   node pseo/scripts/submit-indexing.mjs [--limit=50] [--source=all|dreams|somatic] [--dry-run] [--force]
 *
 * Auto-skips URLs already submitted successfully (see indexing log).
 * Log: pseo/data/indexing-log.sqlite (or .jsonl fallback)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSign } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PSEO = path.resolve(__dirname, "..");
const SITEMAP_SOMATIC = path.join(ROOT, "public", "sitemap-somatic.xml");
const SITEMAP_DREAMS = path.join(ROOT, "public", "sitemap-dreams.xml");
const ALLOWLIST = path.join(PSEO, "data", "indexable-allowlist.json");
const DREAM_ALLOWLIST = path.join(PSEO, "data", "dream-allowlist.json");
const LOG_SQLITE = path.join(PSEO, "data", "indexing-log.sqlite");
const LOG_JSONL = path.join(PSEO, "data", "indexing-log.jsonl");
const DAILY_CAP = 50;

function parseArgs(argv) {
  let limit = 50;
  let dryRun = false;
  let force = false;
  let source = "all";
  for (const a of argv) {
    if (a.startsWith("--limit=")) limit = Number(a.slice(8));
    if (a.startsWith("--source=")) source = a.slice(9);
    if (a === "--dry-run") dryRun = true;
    if (a === "--force") force = true;
  }
  if (!["all", "dreams", "somatic"].includes(source)) source = "all";
  return { limit, dryRun, force, source };
}

function extractLocs(xml) {
  const urls = [];
  const re = /<loc>(https:\/\/oneirox\.com\/[^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml))) urls.push(m[1]);
  return urls;
}

function normalizeAllowlist(raw) {
  const list = raw?.urls || [];
  return list
    .map((x) => (typeof x === "string" ? x : x?.url))
    .filter((u) => typeof u === "string" && u.startsWith("https://"));
}

function loadDreamUrls() {
  if (fs.existsSync(DREAM_ALLOWLIST)) {
    return normalizeAllowlist(JSON.parse(fs.readFileSync(DREAM_ALLOWLIST, "utf8")));
  }
  if (fs.existsSync(SITEMAP_DREAMS)) {
    return extractLocs(fs.readFileSync(SITEMAP_DREAMS, "utf8"));
  }
  return [];
}

function loadSomaticUrls() {
  if (fs.existsSync(ALLOWLIST)) {
    return normalizeAllowlist(JSON.parse(fs.readFileSync(ALLOWLIST, "utf8")));
  }
  if (fs.existsSync(SITEMAP_SOMATIC)) {
    return extractLocs(fs.readFileSync(SITEMAP_SOMATIC, "utf8")).filter((u) =>
      /\/somatic\/.+\/.+\/.+\/$/.test(u)
    );
  }
  return [];
}

function loadUrls(source) {
  const out = [];
  if (source === "all" || source === "dreams") out.push(...loadDreamUrls());
  if (source === "all" || source === "somatic") out.push(...loadSomaticUrls());
  // Dreams first (real search demand), then somatic
  const dreams = out.filter((u) => u.includes("/dreams/"));
  const rest = out.filter((u) => !u.includes("/dreams/"));
  return [...new Set([...dreams, ...rest])];
}

function loadCredentials() {
  const p = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!p || !fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function b64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/indexing",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const unsigned = `${header}.${claim}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  sign.end();
  const sig = sign
    .sign(sa.private_key)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const jwt = `${unsigned}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

async function openSqlite() {
  try {
    const mod = await import("node:sqlite");
    const DatabaseSync = mod.DatabaseSync;
    if (!DatabaseSync) return null;
    ensureDir(path.dirname(LOG_SQLITE));
    const db = new DatabaseSync(LOG_SQLITE);
    db.exec(`CREATE TABLE IF NOT EXISTS indexing_log (
      url TEXT PRIMARY KEY,
      status TEXT,
      http_code INTEGER,
      body TEXT,
      ts TEXT
    )`);
    return {
      type: "sqlite",
      get(url) {
        return db.prepare("SELECT * FROM indexing_log WHERE url = ?").get(url);
      },
      countToday() {
        const day = new Date().toISOString().slice(0, 10);
        const row = db
          .prepare("SELECT COUNT(*) AS c FROM indexing_log WHERE ts LIKE ?")
          .get(`${day}%`);
        return row?.c ?? 0;
      },
      put(url, status, http_code, body) {
        db.prepare(
          `INSERT INTO indexing_log(url, status, http_code, body, ts)
           VALUES(?,?,?,?,?)
           ON CONFLICT(url) DO UPDATE SET status=excluded.status, http_code=excluded.http_code, body=excluded.body, ts=excluded.ts`
        ).run(url, status, http_code, body, new Date().toISOString());
      },
    };
  } catch {
    return null;
  }
}

function openJsonlLog() {
  if (!fs.existsSync(LOG_JSONL)) fs.writeFileSync(LOG_JSONL, "");
  const lines = fs.readFileSync(LOG_JSONL, "utf8").split("\n").filter(Boolean);
  const map = new Map();
  for (const line of lines) {
    try {
      const row = JSON.parse(line);
      map.set(row.url, row);
    } catch {
      /* skip */
    }
  }
  return {
    type: "jsonl",
    get(url) {
      return map.get(url);
    },
    countToday() {
      const day = new Date().toISOString().slice(0, 10);
      let n = 0;
      for (const row of map.values()) {
        if (String(row.ts || "").startsWith(day)) n++;
      }
      return n;
    },
    put(url, status, http_code, body) {
      const row = { url, status, http_code, body, ts: new Date().toISOString() };
      map.set(url, row);
      fs.appendFileSync(LOG_JSONL, JSON.stringify(row) + "\n");
    },
  };
}

async function publishUrl(token, url) {
  const res = await fetch(
    "https://indexing.googleapis.com/v3/urlNotifications:publish",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url, type: "URL_UPDATED" }),
    }
  );
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function needsSubmit(log, url, force) {
  if (force) return true;
  const row = log.get(url);
  if (!row) return true;
  if (row.status === "ok" && row.http_code >= 200 && row.http_code < 300) return false;
  if (row.http_code >= 400) return true;
  return false;
}

async function main() {
  const { limit, dryRun, force, source } = parseArgs(process.argv.slice(2));
  const urls = loadUrls(source);
  if (!urls.length) {
    console.error("No URLs found. Run npm run pseo:build first.");
    process.exit(1);
  }

  const log = (await openSqlite()) || openJsonlLog();
  console.log(`Log backend: ${log.type}`);
  console.log(`Source: ${source} · candidates: ${urls.length}`);

  const todayCount = log.countToday();
  const remaining = Math.max(0, DAILY_CAP - todayCount);
  const pending = urls.filter((u) => needsSubmit(log, u, force));
  const batch = pending.slice(0, Math.min(limit, remaining));

  console.log(`Already ok / skipped: ${urls.length - pending.length}`);
  console.log(`Pending new: ${pending.length} · batch this run: ${batch.length} (cap left ${remaining})`);

  if (remaining <= 0) {
    console.error(`Daily cap reached (${DAILY_CAP}). Try tomorrow or use GSC sitemap.`);
    process.exit(1);
  }

  if (!batch.length) {
    console.log("Nothing new to submit.");
    return;
  }

  if (dryRun) {
    console.log(`[dry-run] Would submit ${batch.length} URLs:`);
    batch.forEach((u) => console.log(" ", u));
    return;
  }

  const sa = loadCredentials();
  if (!sa) {
    console.error(
      "GOOGLE_APPLICATION_CREDENTIALS not set or file missing.\n" +
        "1) Create a Google Cloud service account with Indexing API enabled\n" +
        "2) Add the SA email as Owner in Search Console for oneirox.com\n" +
        "3) set GOOGLE_APPLICATION_CREDENTIALS=path\\to\\sa.json\n" +
        "Fallback: GSC → Sitemaps → submit https://oneirox.com/sitemap-dreams.xml\n" +
        "Also: npm run pseo:indexnow  (Bing/Yandex — works without Google SA)"
    );
    const pilotPath = path.join(PSEO, "data", "indexing-pilot-urls.txt");
    fs.writeFileSync(pilotPath, batch.join("\n") + "\n");
    console.log(`Wrote pending list → ${pilotPath}`);
    process.exitCode = 2;
    return;
  }

  let token = await getAccessToken(sa);
  let submitted = 0;
  let hardStop = false;

  for (const url of batch) {
    if (hardStop) break;
    let attempt = 0;
    let result;
    while (attempt < 4) {
      result = await publishUrl(token, url);
      if (result.status === 401) {
        token = await getAccessToken(sa);
        attempt++;
        continue;
      }
      if (result.status === 429) {
        await sleep(1000 * Math.pow(2, attempt));
        attempt++;
        continue;
      }
      break;
    }

    const status =
      result.status === 403
        ? "forbidden_fallback_gsc"
        : result.ok
          ? "ok"
          : "error";
    log.put(url, status, result.status, result.body.slice(0, 500));
    console.log(`${result.status} ${url}`);
    submitted++;

    if (result.status === 403) {
      console.warn(
        "403 — Indexing API unavailable for this URL type. Stop; use GSC sitemap + IndexNow."
      );
      hardStop = true;
    }
    await sleep(200);
  }

  console.log(
    `Done. Submitted ${submitted}. Log: ${log.type === "sqlite" ? LOG_SQLITE : LOG_JSONL}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
