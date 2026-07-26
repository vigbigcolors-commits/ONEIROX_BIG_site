/**
 * Enrich matrix rows with unique composed fields + related links + layout profile.
 * Usage: node pseo/scripts/enrich-matrix.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  bodyZonesFromMarkers,
  composeDecodeHint,
  composeMechanismBullets,
  composeUniqueSummary,
  composeUniqueTitle,
  chooseLayoutProfile,
  modulesFor,
} from "../lib/compose.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MATRIX = path.join(__dirname, "../data/somatic-matrix.json");

function relatedFor(entry, all) {
  const sameSymptom = all.filter(
    (e) =>
      e.id !== entry.id &&
      e.slug_symptom === entry.slug_symptom &&
      e.indexable
  );
  const samePhase = all.filter(
    (e) =>
      e.id !== entry.id &&
      e.slug_phase === entry.slug_phase &&
      e.utility_type === entry.utility_type &&
      e.indexable
  );
  const picks = [...sameSymptom, ...samePhase]
    .filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i)
    .slice(0, 3)
    .map((e) => e.id);
  return picks;
}

function enrichEntry(entry, all) {
  const body_zones = bodyZonesFromMarkers(entry.somatic_markers);
  const related_ids = relatedFor(entry, all);
  const withZones = { ...entry, body_zones, related_ids };
  const layout_profile = chooseLayoutProfile(withZones);
  const modules_present = modulesFor(withZones, layout_profile);
  const mechanism_bullets = composeMechanismBullets(entry);
  const summary = composeUniqueSummary(entry);
  const title = composeUniqueTitle(entry);
  const decode_hint = composeDecodeHint(entry);
  return {
    ...entry,
    body_zones,
    related_ids,
    layout_profile,
    modules_present,
    mechanism_bullets,
    summary,
    title,
    decode_hint,
  };
}

function main() {
  const matrix = JSON.parse(fs.readFileSync(MATRIX, "utf8"));
  const entries = matrix.entries || [];
  const enriched = entries.map((e) => enrichEntry(e, entries));
  // second pass related using enriched indexable set
  const byId = Object.fromEntries(enriched.map((e) => [e.id, e]));
  for (const e of enriched) {
    e.related_ids = (e.related_ids || []).filter((id) => byId[id]);
    e.layout_profile = chooseLayoutProfile(e);
    e.modules_present = modulesFor(e, e.layout_profile);
  }
  const out = {
    ...matrix,
    version: (matrix.version || 1) + 1,
    enriched_at: new Date().toISOString(),
    entries: enriched,
  };
  fs.writeFileSync(MATRIX, JSON.stringify(out, null, 2));
  const idx = enriched.filter((e) => e.indexable).length;
  console.log(`Enriched ${enriched.length} rows · indexable ${idx}`);
}

main();
