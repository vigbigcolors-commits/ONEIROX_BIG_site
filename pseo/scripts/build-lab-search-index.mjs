/**
 * Build compact Lab Search index from somatic + dream matrices.
 * Output: public/data/lab-search-index.json (client-side, zero API)
 *
 * Usage: node pseo/scripts/build-lab-search-index.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OUT = path.join(ROOT, "public", "data", "lab-search-index.json");

const somatic = JSON.parse(
  fs.readFileSync(path.join(ROOT, "pseo/data/somatic-matrix.json"), "utf8")
);
const dreams = JSON.parse(
  fs.readFileSync(path.join(ROOT, "pseo/data/dream-meaning-matrix.json"), "utf8")
);

function tok(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s\-']/g, " ")
    .split(/[\s\-_]+/)
    .filter((t) => t.length > 2);
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

const docs = [];

for (const e of somatic.entries || []) {
  const href = `/somatic/${e.slug_symptom}/${e.slug_phase}/${e.slug_context}/`;
  const markers = e.somatic_markers || [];
  const zones = e.body_zones || [];
  const terms = uniq([
    ...tok(e.physiological_symptom),
    ...tok(e.title),
    ...markers.flatMap(tok),
    ...zones.flatMap(tok),
    ...tok(e.sleep_phase),
    ...tok(e.context),
    ...tok(e.atonia_state),
    ...tok(e.utility_type),
    ...(e.neurotransmitters_involved || []).flatMap(tok),
    ...tok(e.felt_on_waking),
    ...tok((e.mechanism_bullets || []).slice(0, 2).join(" ")),
  ]);

  docs.push({
    id: e.id,
    kind: "somatic",
    href,
    title: e.title,
    blurb: (e.felt_on_waking || e.summary || "").slice(0, 180),
    phase: String(e.sleep_phase || "").toLowerCase(),
    context: String(e.context || "").toLowerCase(),
    markers,
    zones,
    terms,
    indexable: !!e.indexable,
    rank: e.index_rank || 999,
    density: e.density_score || 0,
  });
}

for (const e of dreams.entries || []) {
  if (!e.slug || e.slug === "why-we-dream") continue;
  const href = `/dreams/${e.slug}/`;
  const variantQs = (e.variants || []).map((v) => v.q).join(" ");
  const terms = uniq([
    ...tok(e.title),
    ...tok(e.slug),
    ...tok(e.category),
    ...tok(e.kicker),
    ...tok(e.lead),
    ...tok(e.signal),
    ...tok(variantQs),
    ...tok((e.body_paragraphs || []).slice(0, 1).join(" ")),
  ]);

  docs.push({
    id: `dream:${e.slug}`,
    kind: "dream",
    href,
    title: e.title,
    blurb: (e.signal || e.lead || "").slice(0, 180),
    phase: "",
    context: "",
    markers: [],
    zones: [],
    category: e.category || "",
    terms,
    indexable: true,
    rank: 0,
    density: 100,
  });
}

const payload = {
  generated_at: new Date().toISOString(),
  version: 1,
  count: docs.length,
  docs,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(payload));
console.log(`wrote ${OUT} (${docs.length} docs)`);
