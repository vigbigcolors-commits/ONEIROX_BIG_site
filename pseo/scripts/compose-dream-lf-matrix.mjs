/**
 * Merge Wave A + Wave B + Wave C into pseo/data/dream-lf-matrix.json
 * Usage: node pseo/scripts/compose-dream-lf-matrix.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WAVE_A } from "./compose-dream-lf-wave-a.mjs";
import { WAVE_B } from "./compose-dream-lf-wave-b.mjs";
import { WAVE_C } from "./compose-dream-lf-wave-c.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../data/dream-lf-matrix.json");

const entries = [...WAVE_A, ...WAVE_B, ...WAVE_C];
const ids = new Set();
for (const e of entries) {
  const id = `${e.parent_slug}/${e.slug}`;
  if (ids.has(id)) {
    console.error("Duplicate", id);
    process.exit(1);
  }
  ids.add(id);
  for (const k of [
    "parent_slug",
    "slug",
    "title",
    "meta_title",
    "meta_description",
    "kicker",
    "lead",
    "signal",
    "body_paragraphs",
    "morning_prompt",
    "mechanism_key",
    "indexable",
    "wave",
  ]) {
    if (e[k] === undefined || e[k] === null || e[k] === "") {
      console.error("Missing", k, id);
      process.exit(1);
    }
  }
  if (!Array.isArray(e.body_paragraphs) || e.body_paragraphs.length < 2) {
    console.error("body_paragraphs", id);
    process.exit(1);
  }
}

const payload = {
  generated_at: new Date().toISOString(),
  count: entries.length,
  wave_a: entries.filter((e) => e.wave === "A").length,
  wave_b: entries.filter((e) => e.wave === "B").length,
  wave_c: entries.filter((e) => e.wave === "C").length,
  indexable: entries.filter((e) => e.indexable).length,
  entries,
};

fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
console.log(
  `wrote ${OUT} · ${payload.count} entries · A=${payload.wave_a} B=${payload.wave_b} C=${payload.wave_c} indexable=${payload.indexable}`
);
