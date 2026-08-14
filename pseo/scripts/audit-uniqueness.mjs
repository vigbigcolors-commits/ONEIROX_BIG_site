/**
 * Uniqueness audit — fail build if near-duplicate prose across rows.
 * Checks title, summary, mechanism bullets, decode_hint among ALL rows
 * (strict on indexable; warn+fail if any indexable pair too similar).
 *
 * Usage: node pseo/scripts/audit-uniqueness.mjs [--fail-threshold=0.42]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MATRIX = path.join(__dirname, "../data/somatic-matrix.json");

function argNum(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split("=")[1]) : fallback;
}

const FAIL = argNum("fail-threshold", 0.42);

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shingles(text, n = 3) {
  const words = normalize(text).split(" ").filter(Boolean);
  const set = new Set();
  if (words.length < n) {
    if (words.length) set.add(words.join(" "));
    return set;
  }
  for (let i = 0; i <= words.length - n; i++) {
    set.add(words.slice(i, i + n).join(" "));
  }
  return set;
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

function proseBlob(entry) {
  return [
    entry.title,
    entry.summary,
    entry.decode_hint,
    entry.felt_on_waking,
    entry.decode_use,
    ...(entry.mechanism_bullets || []),
  ].join(" ");
}

function main() {
  if (!fs.existsSync(MATRIX)) {
    console.error("Missing matrix");
    process.exit(1);
  }
  const matrix = JSON.parse(fs.readFileSync(MATRIX, "utf8"));
  const entries = matrix.entries || [];
  const indexable = entries.filter((e) => e.indexable);
  const targets = indexable.length ? indexable : entries.slice(0, 50);

  const blobs = targets.map((e) => ({
    id: e.id,
    set: shingles(proseBlob(e), 3),
    text: normalize(proseBlob(e)).slice(0, 160),
  }));

  const failures = [];
  for (let i = 0; i < blobs.length; i++) {
    for (let j = i + 1; j < blobs.length; j++) {
      const score = jaccard(blobs[i].set, blobs[j].set);
      if (score >= FAIL) {
        failures.push({
          a: blobs[i].id,
          b: blobs[j].id,
          score: Number(score.toFixed(3)),
        });
      }
    }
  }

  // Also ensure every indexable has enrichment
  const missing = indexable.filter(
    (e) =>
      !e.summary ||
      !e.mechanism_bullets?.length ||
      !e.layout_profile ||
      !e.modules_present?.length
  );

  if (missing.length) {
    console.error(
      `Uniqueness/enrichment FAIL: ${missing.length} indexable rows missing enrichment fields`
    );
    missing.slice(0, 5).forEach((e) => console.error(" -", e.id));
    process.exit(1);
  }

  if (failures.length) {
    console.error(
      `Uniqueness FAIL: ${failures.length} near-duplicate pairs (threshold ${FAIL})`
    );
    failures.slice(0, 12).forEach((f) => {
      console.error(`  ${f.score}  ${f.a}  ↔  ${f.b}`);
    });
    process.exit(1);
  }

  console.log(
    `Uniqueness OK: ${targets.length} indexable prose blobs, threshold ${FAIL}, 0 near-dups`
  );
}

main();
