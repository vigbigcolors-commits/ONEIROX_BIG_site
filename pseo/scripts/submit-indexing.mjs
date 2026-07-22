/**
 * Optional Google Indexing API submitter for somatic URLs.
 * Primary discovery remains sitemap. Indexing API often limited to JobPosting/BroadcastEvent.
 *
 * Usage:
 *   set GOOGLE_APPLICATION_CREDENTIALS=path/to/sa.json
 *   node pseo/scripts/submit-indexing.mjs [--limit=10] [--dry-run]
 *
 * Log: pseo/data/indexing-log.sqlite (or .jsonl fallback)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSign } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PSEO = path.resolve(__dirname, "..");
const SITEMAP = path.join(ROOT, "public", "sitemap-somatic.xml");
const ALLOWLIST = path.join(PSEO, "data", "indexable-allowlist.json");
const LOG_SQLITE = path.join(PSEO, "data", "indexing-log.sqlite");
const LOG_JSONL = path.join(PSEO, "data", "indexing-log.jsonl");
const DAILY_CAP = 2000;

function parseArgs(argv) {
  let limit = 10;
  let dryRun = false;
  for (const a of argv) {
    if (a.startsWith("--limit=")) limit = Number(a.slice(8));
    if (a === "--dry-run") dryRun = true;
  }
  return { limit, dryRun };
}

function extractUrls(xml) {
  const urls = [];
  const re = /<loc>(https:\/\/oneirox\.com\/somatic\/[^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml))) urls.push(m[1]);
  return urls;
}

function loadCredentials() {
  const p = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!p || !fs.existsSync(p)) {
    return null;
  }
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
  if (!res.ok) {
    throw new Error(`Token error: ${JSON.stringify(data)}`);
  }
  return data.access_token;
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

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
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

async function main() {
  const { limit, dryRun } = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(SITEMAP)) {
    console.error("Missing public/sitemap-somatic.xml — run pseo:build first");
    process.exit(1);
  }
  let urls = [];
  if (fs.existsSync(ALLOWLIST)) {
    const allow = JSON.parse(fs.readFileSync(ALLOWLIST, "utf8"));
    urls = (allow.urls || []).map((x) => x.url);
    console.log(`Using indexable allowlist (${urls.length})`);
  } else {
    urls = extractUrls(fs.readFileSync(SITEMAP, "utf8")).filter((u) =>
      /\/somatic\/.+\/.+\/.+\/$/.test(u)
    );
  }

  const log = (await openSqlite()) || openJsonlLog();
  console.log(`Log backend: ${log.type}`);
  console.log(`URLs in sitemap (utility pages): ${urls.length}`);

  const todayCount = log.countToday();
  const remaining = Math.max(0, DAILY_CAP - todayCount);
  const batch = urls.filter((u) => !log.get(u)?.http_code || log.get(u)?.http_code >= 400).slice(0, Math.min(limit, remaining));

  if (remaining <= 0) {
    console.error("Daily cap reached (2000). Try tomorrow or use GSC sitemap.");
    process.exit(1);
  }

  if (dryRun) {
    console.log(`[dry-run] Would submit ${batch.length} URLs (cap remaining ${remaining})`);
    batch.slice(0, 5).forEach((u) => console.log(" ", u));
    return;
  }

  const sa = loadCredentials();
  if (!sa) {
    console.error(
      "GOOGLE_APPLICATION_CREDENTIALS not set or file missing.\n" +
        "Fallback: submit sitemap in Google Search Console.\n" +
        "Re-run with --dry-run to preview URL batch."
    );
    // Still write a pilot manifest for manual GSC inspection
    const pilot = urls.slice(0, Math.min(10, limit));
    const pilotPath = path.join(PSEO, "data", "indexing-pilot-urls.txt");
    fs.writeFileSync(pilotPath, pilot.join("\n") + "\n");
    console.log(`Wrote pilot list → ${pilotPath}`);
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
        "403 Permission denied — Indexing API likely unavailable for this URL type. Stop and use GSC sitemap."
      );
      hardStop = true;
    }
    await sleep(200);
  }

  console.log(`Done. Submitted ${submitted}. Log: ${log.type === "sqlite" ? LOG_SQLITE : LOG_JSONL}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
