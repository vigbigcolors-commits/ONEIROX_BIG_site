/**
 * Cross-links REM mechanics chapters back to their most relevant indexable
 * somatic utility rows (vice-versa of the "Related physiology" module).
 * Idempotent: rewrites only the content between the AUTO-UTILITY-LINKS markers.
 * Usage: node pseo/scripts/link-mechanics-pillars.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const MATRIX = path.join(__dirname, "../data/somatic-matrix.json");

const CHAPTER_FILE = {
  atonia: path.join(ROOT, "public", "mechanics", "rem", "atonia", "index.html"),
  "pgo-autonomic": path.join(ROOT, "public", "mechanics", "rem", "pgo-autonomic", "index.html"),
  "cortex-eeg": path.join(ROOT, "public", "mechanics", "rem", "cortex-eeg", "index.html"),
  "cycle-timing": path.join(ROOT, "public", "mechanics", "rem", "cycle-timing", "index.html"),
};

const MARKER_RE = /<!-- AUTO-UTILITY-LINKS:START -->[\s\S]*?<!-- AUTO-UTILITY-LINKS:END -->/;

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function humanLabel(entry) {
  return `${entry.physiological_symptom} — ${entry.sleep_phase}/${entry.context}`;
}

function main() {
  if (!fs.existsSync(MATRIX)) {
    console.error("Missing matrix. Run: npm run pseo:enrich");
    process.exit(1);
  }
  const matrix = JSON.parse(fs.readFileSync(MATRIX, "utf8"));
  const entries = (matrix.entries || []).filter((e) => e.indexable && e.pillar_key);

  const byPillar = {};
  for (const e of entries) {
    (byPillar[e.pillar_key] ||= []).push(e);
  }
  for (const key of Object.keys(byPillar)) {
    // Prefer symptom diversity: keep only the strongest row per slug_symptom first.
    const sorted = [...byPillar[key]].sort((a, b) => (b.density_score ?? 0) - (a.density_score ?? 0));
    const seenSymptom = new Set();
    const diverse = [];
    const rest = [];
    for (const e of sorted) {
      if (seenSymptom.has(e.slug_symptom)) rest.push(e);
      else {
        seenSymptom.add(e.slug_symptom);
        diverse.push(e);
      }
    }
    byPillar[key] = [...diverse, ...rest];
  }

  let updated = 0;
  for (const [key, file] of Object.entries(CHAPTER_FILE)) {
    if (!fs.existsSync(file)) {
      console.warn(`Skip missing chapter file for pillar "${key}": ${file}`);
      continue;
    }
    const picks = (byPillar[key] || []).slice(0, 4);
    const links = picks
      .map(
        (e) =>
          `        <li><a href="/somatic/${e.slug_symptom}/${e.slug_phase}/${e.slug_context}/">${esc(humanLabel(e))}</a></li>`
      )
      .join("\n");
    const block = `<!-- AUTO-UTILITY-LINKS:START -->\n${links}\n        <!-- AUTO-UTILITY-LINKS:END -->`;
    const html = fs.readFileSync(file, "utf8");
    if (!MARKER_RE.test(html)) {
      console.warn(`No AUTO-UTILITY-LINKS markers found in ${file}`);
      continue;
    }
    const next = html.replace(MARKER_RE, block);
    if (next !== html) {
      fs.writeFileSync(file, next);
      updated++;
    }
    console.log(`Pillar "${key}": ${picks.length} linked rows -> ${path.relative(ROOT, file)}`);
  }
  console.log(`Mechanics cross-links updated: ${updated} file(s).`);
}

main();
