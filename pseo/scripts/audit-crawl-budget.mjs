/**
 * Fail if sitemap invites Google onto noindex/bulk PSEO, or caps are blown.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SOMATIC_INDEXABLE_CAP,
  DREAM_INDEX_CAP,
  pullAllowlistUrls,
  pathnameOf,
} from "../lib/crawl-budget.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PSEO = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const SOMATIC_HUBS = new Set([
  "https://oneirox.com/somatic/",
  "https://oneirox.com/somatic/phase/n1/",
  "https://oneirox.com/somatic/phase/n2/",
  "https://oneirox.com/somatic/phase/n3/",
  "https://oneirox.com/somatic/phase/rem/",
]);

function locs(file) {
  const xml = fs.readFileSync(file, "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

function robotsMeta(html) {
  const m = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i);
  return (m?.[1] || "").toLowerCase();
}

function publicFile(url) {
  const p = pathnameOf(url);
  const rel = p.endsWith("/") ? p.slice(1) + "index.html" : p.slice(1);
  return path.join(PUBLIC, rel);
}

function main() {
  const fails = [];
  const somaticAllow = new Set(pullAllowlistUrls(path.join(PSEO, "data", "indexable-allowlist.json")));
  const dreamAllow = new Set(pullAllowlistUrls(path.join(PSEO, "data", "dream-allowlist.json")));

  const somaticSm = locs(path.join(PUBLIC, "sitemap-somatic.xml"));
  const dreamSm = locs(path.join(PUBLIC, "sitemap-dreams.xml"));
  const robots = fs.readFileSync(path.join(PUBLIC, "robots.txt"), "utf8");

  if (!robots.includes("Disallow: /somatic/")) {
    fails.push("robots.txt missing Disallow: /somatic/");
  }
  if (!robots.includes("Disallow: /dreams/*/*/")) {
    fails.push("robots.txt missing Disallow: /dreams/*/*/");
  }

  const somaticRows = somaticSm.filter((u) => !SOMATIC_HUBS.has(u));
  if (somaticRows.length > SOMATIC_INDEXABLE_CAP) {
    fails.push(`somatic sitemap rows ${somaticRows.length} > cap ${SOMATIC_INDEXABLE_CAP}`);
  }
  for (const u of somaticRows) {
    if (!somaticAllow.has(u)) fails.push(`somatic sitemap not on allowlist: ${u}`);
  }
  if (dreamSm.length > DREAM_INDEX_CAP) {
    fails.push(`dreams sitemap ${dreamSm.length} > cap ${DREAM_INDEX_CAP}`);
  }
  for (const u of dreamSm) {
    if (!dreamAllow.has(u)) fails.push(`dreams sitemap not on allowlist: ${u}`);
  }

  for (const u of [...somaticSm, ...dreamSm]) {
    const file = publicFile(u);
    if (!fs.existsSync(file)) {
      fails.push(`sitemap loc missing file: ${u}`);
      continue;
    }
    const meta = robotsMeta(fs.readFileSync(file, "utf8"));
    if (meta.includes("noindex")) fails.push(`sitemap loc is noindex: ${u}`);
  }

  if (fails.length) {
    console.error(`Crawl-budget FAIL (${fails.length})`);
    for (const f of fails.slice(0, 40)) console.error(" ", f);
    if (fails.length > 40) console.error(`  … ${fails.length - 40} more`);
    process.exit(1);
  }
  console.log(
    `Crawl-budget OK: somatic sitemap ${somaticSm.length} · dreams sitemap ${dreamSm.length} · bulk Disallow present`
  );
}

main();
