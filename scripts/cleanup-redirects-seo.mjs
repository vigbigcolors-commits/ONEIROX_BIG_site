/**
 * Technical SEO redirect cleanup (post-migration).
 * Removes misleading homepage redirects and WP legacy → / noise.
 * Keeps semantic equivalents and crawler sitemap aliases.
 *
 * Run: node scripts/cleanup-redirects-seo.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "public", "_redirects");

const KEEP_HOME = new Set(["/ru", "/ru/"]);

const DROP_FROM_EXACT = new Set([
  "/comments/feed/",
  "/wp-login.php",
  "/xmlrpc.php",
  "/feed/",
  "/feed",
]);

// No catch-all wildcards (author/category/ru splat ≠ real equivalents).
const WILDCARD_TAIL = [];

function parseLine(line) {
  const t = line.trim();
  if (!t || t.startsWith("#")) return null;
  const parts = t.split(/\s+/);
  if (parts.length < 3) return null;
  const [from, to, status] = parts;
  return { from, to, status, raw: `${from} ${to} ${status}` };
}

function isDynamic(from) {
  return from.includes("*") || from.includes(":splat") || /:[a-z]/.test(from);
}

function isWpExactNoise(from) {
  return DROP_FROM_EXACT.has(from);
}

function isMisleadingHome(from, to) {
  if (to !== "/") return false;
  if (KEEP_HOME.has(from)) return false;
  if (isWpExactNoise(from)) return true;
  // any other exact → homepage without semantic replacement
  return true;
}

const raw = fs.readFileSync(file, "utf8");
const existing = [];
const seen = new Set();
let removedHome = 0;
let removedWp = 0;
let removedDynWp = 0;

for (const line of raw.split(/\r?\n/)) {
  const p = parseLine(line);
  if (!p) continue;
  if (seen.has(p.from)) continue;
  seen.add(p.from);

  if (isDynamic(p.from)) {
    // Drop all dynamic rows; WILDCARD_TAIL is empty by design.
    if (
      /wp-|trackback|\/feed\/|\/tag\/|\/page\/|\/comments\//.test(p.from) ||
      p.from === "/feed/*" ||
      p.from === "/tag/*" ||
      p.from === "/page/*" ||
      p.from === "/comments/*" ||
      p.from === "/author/*" ||
      p.from === "/category/*" ||
      p.from === "/ru/*"
    ) {
      removedDynWp++;
    }
    continue;
  }

  if (isWpExactNoise(p.from)) {
    removedWp++;
    continue;
  }

  if (isMisleadingHome(p.from, p.to)) {
    removedHome++;
    continue;
  }

  existing.push(p);
}

existing.sort((a, b) => b.from.length - a.from.length);

const header = `# Oneirox WordPress → Cloudflare Pages redirects
# CRITICAL: all static (exact) rules MUST come before any * / :splat rule.
# CF Pages: first dynamic rule switches remaining budget to max 100 dynamic;
# rules past that budget are silently dropped (no build warning).
# Cleaned: node scripts/cleanup-redirects-seo.mjs
# Then order: node scripts/fix-redirects-order.mjs
# ${existing.length} static + ${WILDCARD_TAIL.length} dynamic
# No catch-all author/category/ru wildcards.

`;

const body = [
  ...existing.map((r) => r.raw),
  ...(WILDCARD_TAIL.length
    ? [
        "",
        "# Dynamic / wildcard (must stay last; budget <= 100)",
        "# WP system/tag/feed/admin paths intentionally omitted → natural 404",
        ...WILDCARD_TAIL,
      ]
    : []),
].join("\n");

fs.writeFileSync(file, header + body + "\n", "utf8");

console.log(
  JSON.stringify(
    {
      staticKept: existing.length,
      dynamicKept: WILDCARD_TAIL.length,
      removedHomepageMisleading: removedHome,
      removedWpExact: removedWp,
      removedWpDynamicSeen: removedDynWp,
      totalRules: existing.length + WILDCARD_TAIL.length,
      bytes: Buffer.byteLength(header + body + "\n", "utf8"),
    },
    null,
    2
  )
);
