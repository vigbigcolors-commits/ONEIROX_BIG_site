/**
 * IndexNow — notify Bing, Yandex, and other IndexNow engines of URL updates.
 * Official protocol (not Google Indexing API abuse).
 *
 * Usage:
 *   node pseo/scripts/submit-indexnow.mjs
 *   node pseo/scripts/submit-indexnow.mjs --dry-run
 *   node pseo/scripts/submit-indexnow.mjs --core   # also ping core pages
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PSEO = path.resolve(__dirname, "..");
const KEY = "5c61214a58c031a09f3b23537027c547";
const HOST = "oneirox.com";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ALLOWLIST = path.join(PSEO, "data", "indexable-allowlist.json");
const LOG = path.join(PSEO, "data", "indexnow-log.jsonl");
const ENDPOINT = "https://api.indexnow.org/indexnow";

const CORE_URLS = [
  "https://oneirox.com/",
  "https://oneirox.com/somatic/",
  "https://oneirox.com/somatic/phase/n1/",
  "https://oneirox.com/somatic/phase/n2/",
  "https://oneirox.com/somatic/phase/n3/",
  "https://oneirox.com/somatic/phase/rem/",
  "https://oneirox.com/methodology/",
  "https://oneirox.com/phase/",
  "https://oneirox.com/tools/oneirox-dream-mapper",
];

function parseArgs(argv) {
  return {
    dryRun: argv.includes("--dry-run"),
    core: argv.includes("--core"),
  };
}

function loadUrls({ core }) {
  const urls = [];
  if (core) urls.push(...CORE_URLS);
  if (fs.existsSync(ALLOWLIST)) {
    const allow = JSON.parse(fs.readFileSync(ALLOWLIST, "utf8"));
    for (const row of allow.urls || []) {
      if (row.url) urls.push(row.url);
    }
  }
  urls.push("https://oneirox.com/somatic/");
  return [...new Set(urls)];
}

async function submitBatch(urlList) {
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  const text = await res.text().catch(() => "");
  return { status: res.status, ok: res.ok || res.status === 200 || res.status === 202, body: text.slice(0, 300) };
}

async function main() {
  const { dryRun } = parseArgs(process.argv.slice(2));
  // Always notify hubs + indexable allowlist (safe top set)
  const all = loadUrls({ core: true });

  console.log(`IndexNow keyLocation: ${KEY_LOCATION}`);
  console.log(`URLs to notify: ${all.length}`);

  if (dryRun) {
    all.slice(0, 8).forEach((u) => console.log(" ", u));
    if (all.length > 8) console.log(" …");
    return;
  }

  // IndexNow accepts up to 10,000 URLs per request — our batch is small
  const result = await submitBatch(all);
  const row = {
    ts: new Date().toISOString(),
    status: result.status,
    count: all.length,
    body: result.body,
  };
  fs.appendFileSync(LOG, JSON.stringify(row) + "\n");
  console.log(`IndexNow response: HTTP ${result.status}`);
  if (!result.ok && result.status !== 202) {
    console.error(result.body || "(empty body)");
    console.error("Check that key file is live after deploy:", KEY_LOCATION);
    process.exitCode = 1;
    return;
  }
  console.log(`Notified engines for ${all.length} URLs (Bing / Yandex / IndexNow partners).`);
  console.log("Next: verify site in Bing Webmaster + Yandex Webmaster (see pseo/launch/).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
