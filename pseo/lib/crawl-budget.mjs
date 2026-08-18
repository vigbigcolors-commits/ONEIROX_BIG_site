/**
 * Crawl-budget lock: sitemap = allowlist only; lastmod only on content hash change;
 * robots.txt Disallow for bulk PSEO (noindex is not a crawl-budget tool).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PSEO = path.resolve(__dirname, "..");
const ROOT = path.resolve(__dirname, "../..");
const LASTMOD_STORE = path.join(PSEO, "data", "sitemap-lastmod.json");
const SOMATIC_ALLOW = path.join(PSEO, "data", "indexable-allowlist.json");
const DREAM_ALLOW = path.join(PSEO, "data", "dream-allowlist.json");

export const SOMATIC_INDEXABLE_CAP = 50;
export const DREAM_INDEX_CAP = 50;
export const INDEX_PING_DAILY_CAP = 50;

export function pathnameOf(urlOrPath) {
  const s = String(urlOrPath || "");
  if (s.startsWith("https://")) return new URL(s).pathname;
  return s.startsWith("/") ? s : `/${s}`;
}

export function pullAllowlistUrls(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const allow = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return (allow.urls || [])
    .map((x) => (typeof x === "string" ? x : x?.url))
    .filter((u) => typeof u === "string" && u.startsWith("https://"));
}

let lastmodCache = null;

function loadStore() {
  if (lastmodCache) return lastmodCache;
  if (!fs.existsSync(LASTMOD_STORE)) {
    lastmodCache = {};
    return lastmodCache;
  }
  try {
    lastmodCache = JSON.parse(fs.readFileSync(LASTMOD_STORE, "utf8"));
  } catch {
    lastmodCache = {};
  }
  return lastmodCache;
}

export function flushLastmodStore() {
  if (!lastmodCache) return;
  fs.writeFileSync(LASTMOD_STORE, JSON.stringify(lastmodCache, null, 2) + "\n");
}

export function stableLastmod(loc, contentKey) {
  const today = new Date().toISOString().slice(0, 10);
  const hash = crypto
    .createHash("sha256")
    .update(String(contentKey || loc))
    .digest("hex")
    .slice(0, 16);
  const store = loadStore();
  const prev = store[loc];
  if (prev && prev.hash === hash && prev.lastmod) return prev.lastmod;
  store[loc] = { hash, lastmod: today };
  return today;
}

export function writeAllowlistIfChanged(filePath, urls) {
  const next = [...urls];
  if (fs.existsSync(filePath)) {
    const prev = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (JSON.stringify(prev.urls || []) === JSON.stringify(next)) return next.length;
  }
  fs.writeFileSync(
    filePath,
    JSON.stringify({ generated_at: new Date().toISOString(), urls: next }, null, 2) + "\n"
  );
  return next.length;
}

function allowLine(pathname) {
  const p = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const parts = p.split("/").filter(Boolean);
  if (parts.length <= 1) return `Allow: ${p}$`;
  if (parts[0] === "dreams" && parts.length === 1) return `Allow: /dreams/$`;
  if (parts[0] === "dreams" && parts.length === 2) return `Allow: ${p}$`;
  return `Allow: ${p}`;
}

export function writeRobotsTxt() {
  const somatic = pullAllowlistUrls(SOMATIC_ALLOW).map(pathnameOf);
  const dreams = pullAllowlistUrls(DREAM_ALLOW).map(pathnameOf);
  const somaticAllows = [...new Set(somatic.map(allowLine))];
  const dreamAllows = [...new Set(dreams.map(allowLine))];
  const lines = [
    "User-agent: *",
    "Allow: /",
    "",
    "# Do not Disallow /ru/: those paths 301 via _redirects. Blocking them leaves old URLs stuck.",
    "# Crawl budget: bulk PSEO is Disallow. noindex still spends crawl if linked.",
    "Allow: /somatic/$",
    "Allow: /somatic/phase/",
    "Allow: /somatic/assets/",
    ...somaticAllows,
    "Disallow: /somatic/",
    "",
    "Allow: /dreams/$",
    "Allow: /dreams/assets/",
    ...dreamAllows.filter((line) => line !== "Allow: /dreams/$"),
    "Disallow: /dreams/*/*/",
    "",
    "Sitemap: https://oneirox.com/sitemap.xml",
    "",
  ];
  fs.writeFileSync(path.join(ROOT, "public", "robots.txt"), lines.join("\n"));
}

export function sitemapUrlXml(loc, lastmod, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export function isFollowableSomaticPath(href, allowPathSet) {
  const p = pathnameOf(href);
  if (p === "/somatic/" || p.startsWith("/somatic/phase/") || p.startsWith("/somatic/assets/")) {
    return true;
  }
  return allowPathSet.has(p) || allowPathSet.has(p.endsWith("/") ? p : `${p}/`);
}

export function relForTarget(indexableTarget) {
  return indexableTarget ? "" : ' rel="nofollow"';
}
