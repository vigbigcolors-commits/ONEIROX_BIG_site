/**
 * Cloudflare Pages: first dynamic (* / :splat) rule causes ALL following
 * rules to count against the 100 dynamic budget; excess is silently dropped.
 * Keep every exact (static) rule before any wildcard.
 *
 * Run: node scripts/fix-redirects-order.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'public', '_redirects');

const FORCE = [
  // RU locale removed — exact static 301s (never put /ru/* before statics)
  ['/ru', '/'],
  ['/ru/', '/'],
  ['/ru/about/', '/about/'],
  ['/ru/methodology/', '/methodology/'],
  // GSC Valid category URLs — better than catch-all home
  ['/category/animals/dog-dreams-meaning/', '/dreams/dogs/'],
  ['/category/animals/cat-dreams-meaning/', '/dreams/cats/'],
  ['/category/control-power/', '/dreams/losing-control/'],
];

const WILDCARD_TAIL = [
  '/comments/* / 301',
  '/author/* /about/ 301',
  '/category/* /dreams/ 301',
  '/wp-admin/* / 301',
  '/wp-content/* / 301',
  '/wp-includes/* / 301',
  '/wp-json/* / 301',
  '/trackback/* / 301',
  '/page/* / 301',
  '/feed/* / 301',
  '/tag/* / 301',
  // last: leftover RU deep paths → strip /ru prefix
  '/ru/* /:splat 301',
];

function parseLine(line) {
  const t = line.trim();
  if (!t || t.startsWith('#')) return null;
  const parts = t.split(/\s+/);
  if (parts.length < 3) return null;
  const [from, to, status] = parts;
  return { from, to, status, raw: `${from} ${to} ${status}` };
}

function isDynamic(from) {
  return from.includes('*') || from.includes(':splat') || from.includes(':');
}

const raw = fs.readFileSync(file, 'utf8');
const existing = [];
const seen = new Set();

for (const line of raw.split(/\r?\n/)) {
  const p = parseLine(line);
  if (!p) continue;
  if (seen.has(p.from)) continue;
  seen.add(p.from);
  existing.push(p);
}

// Apply FORCE (overwrite destination if present)
for (const [from, to] of FORCE) {
  const idx = existing.findIndex((r) => r.from === from);
  const row = { from, to, status: '301', raw: `${from} ${to} 301` };
  if (idx >= 0) existing[idx] = row;
  else {
    existing.push(row);
    seen.add(from);
  }
}

// Drop old wildcard rows; we rebuild the tail
const statics = existing.filter((r) => !isDynamic(r.from));
statics.sort((a, b) => b.from.length - a.from.length);

const header = `# Oneirox WordPress → Cloudflare Pages redirects
# CRITICAL: all static (exact) rules MUST come before any * / :splat rule.
# CF Pages: first dynamic rule switches remaining budget to max 100 dynamic;
# rules past that budget are silently dropped (no build warning).
# Run: node scripts/fix-redirects-order.mjs
# ${statics.length} static + ${WILDCARD_TAIL.length} dynamic

`;

const body = [
  ...statics.map((r) => r.raw),
  '',
  '# Dynamic / wildcard (must stay last; budget ≤ 100)',
  ...WILDCARD_TAIL,
].join('\n');

fs.writeFileSync(file, header + body + '\n', 'utf8');

const dyn = WILDCARD_TAIL.length;
console.log(`Wrote ${statics.length} static + ${dyn} dynamic → public/_redirects`);
if (dyn > 100) console.error('ERROR: dynamic > 100');
const bytes = Buffer.byteLength(header + body + '\n', 'utf8');
console.log(`Size: ${bytes} bytes (CF also caps ~100KB)`);
