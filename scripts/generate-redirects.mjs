/**
 * Generate / refresh curated redirects helpers.
 * Does NOT dump legacy blog posts onto homepage (SEO damage).
 * Semantic post→pillar maps live in public/_redirects and are preserved
 * by scripts/cleanup-redirects-seo.mjs + fix-redirects-order.mjs.
 *
 * Run: node scripts/generate-redirects.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outPath = path.join(root, "public", "_redirects");

const PAGE_TARGETS = {
  "terms-of-use": "/terms/",
  "privacy-policy-the-vault-of-shadows": "/privacy/",
  "sensory-dream-mapper-decode-what-your-body-felt-while-you-slept":
    "/tools/oneirox-dream-mapper",
  "our-philosophy": "/methodology/",
};

const SITEMAP_ALIASES = [
  ["/post-sitemap.xml", "/sitemap.xml"],
  ["/page-sitemap.xml", "/sitemap.xml"],
  ["/category-sitemap.xml", "/sitemap.xml"],
  ["/author-sitemap.xml", "/sitemap.xml"],
  ["/sitemap_index.xml", "/sitemap.xml"],
  ["/main-sitemap.xsl", "/sitemap.xml"],
  ["/wp-sitemap.xml", "/sitemap.xml"],
];

function toRedirectLine(from, to) {
  const src = from.startsWith("/") ? from : `/${from}`;
  const base = src.split("?")[0];
  const hasExtension = /\.[a-z0-9]+$/i.test(base);
  const hasWildcard = src.includes("*");
  const normalized =
    hasExtension || hasWildcard ? src : src.endsWith("/") ? src : `${src}/`;
  return `${normalized} ${to} 301`;
}

const existing = fs.existsSync(outPath) ? fs.readFileSync(outPath, "utf8") : "";
const kept = new Map();
for (const line of existing.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const [from, to, status] = t.split(/\s+/);
  if (!from || !to) continue;
  kept.set(from, `${from} ${to} ${status || "301"}`);
}

for (const [slug, to] of Object.entries(PAGE_TARGETS)) {
  kept.set(`/${slug}/`, toRedirectLine(slug, to));
}
for (const [from, to] of SITEMAP_ALIASES) {
  kept.set(from, `${from} ${to} 301`);
}

// Never reintroduce mass homepage / WP system dumps here.
console.log(
  "generate-redirects.mjs: merged PAGE_TARGETS + sitemap aliases into existing _redirects map."
);
console.log(
  "Refusing mass post→/ and wp-admin/feed/tag→/ dumps. Run cleanup-redirects-seo.mjs + fix-redirects-order.mjs next."
);
console.log(`Map size (in-memory merge only): ${kept.size}`);
console.log("No file rewrite performed — use cleanup-redirects-seo.mjs to mutate _redirects.");
