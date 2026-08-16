/**
 * Near-dup audit for dream LF matrix.
 * Fails if any pair shares Jaccard(shingles) above threshold on prose blob.
 *
 * Usage: node pseo/scripts/audit-dream-lf-uniqueness.mjs [--fail-threshold=0.38]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MATRIX = path.join(__dirname, "../data/dream-lf-matrix.json");
const PILLAR = path.join(__dirname, "../data/dream-meaning-matrix.json");

function argNum(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split("=")[1]) : fallback;
}

const FAIL = argNum("fail-threshold", 0.38);

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
  for (let i = 0; i <= words.length - n; i++) set.add(words.slice(i, i + n).join(" "));
  return set;
}

function jaccard(a, b) {
  if (!a.size && !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union ? inter / union : 0;
}

function blob(e) {
  return [
    e.title,
    e.lead,
    e.signal,
    e.morning_prompt,
    e.mechanism_key,
    ...(e.body_paragraphs || []),
    ...(e.variants || []).map((v) => `${v.q} ${v.a}`),
  ].join(" ");
}

function main() {
  if (!fs.existsSync(MATRIX)) {
    console.error("Missing dream-lf-matrix.json");
    process.exit(1);
  }
  const lf = JSON.parse(fs.readFileSync(MATRIX, "utf8"));
  const entries = lf.entries || [];
  if (entries.length < 2) {
    console.error("Need at least 2 LF entries");
    process.exit(1);
  }

  const ids = new Set();
  const mech = new Map();
  for (const e of entries) {
    const id = `${e.parent_slug}/${e.slug}`;
    if (ids.has(id)) {
      console.error("Duplicate id", id);
      process.exit(1);
    }
    ids.add(id);
    const mk = `${e.parent_slug}::${e.mechanism_key || ""}`;
    if (e.mechanism_key) {
      if (mech.has(mk)) {
        console.error("Duplicate mechanism_key under parent", mk, mech.get(mk), id);
        process.exit(1);
      }
      mech.set(mk, id);
    }
  }

  const prepared = entries.map((e) => ({
    id: `${e.parent_slug}/${e.slug}`,
    indexable: !!e.indexable,
    sh: shingles(blob(e)),
  }));

  const fails = [];
  for (let i = 0; i < prepared.length; i++) {
    for (let j = i + 1; j < prepared.length; j++) {
      const sim = jaccard(prepared[i].sh, prepared[j].sh);
      if (sim >= FAIL) {
        fails.push({
          a: prepared[i].id,
          b: prepared[j].id,
          sim: Number(sim.toFixed(3)),
          indexable: prepared[i].indexable || prepared[j].indexable,
        });
      }
    }
  }

  fails.sort((a, b) => b.sim - a.sim);
  const hard = fails.filter((f) => f.indexable);
  console.log(
    `LF uniqueness: ${entries.length} entries · pairs≥${FAIL}: ${fails.length} · indexable-involved: ${hard.length}`
  );
  for (const f of fails.slice(0, 15)) {
    console.log(`  ${f.sim}  ${f.a}  ↔  ${f.b}${f.indexable ? "  [indexable]" : ""}`);
  }

  if (hard.length) {
    console.error("FAIL: near-duplicate indexable LF prose");
    process.exit(1);
  }

  // Also compare LF vs pillar parent prose lightly
  if (fs.existsSync(PILLAR)) {
    const pillars = JSON.parse(fs.readFileSync(PILLAR, "utf8")).entries || [];
    const pMap = new Map(pillars.map((p) => [p.slug, shingles([p.lead, p.signal, ...(p.body_paragraphs || [])].join(" "))]));
    let parentHits = 0;
    for (const e of entries) {
      const ps = pMap.get(e.parent_slug);
      if (!ps) continue;
      const sim = jaccard(shingles(blob(e)), ps);
      if (sim >= FAIL + 0.08) {
        parentHits++;
        console.log(`  parent-sim ${sim.toFixed(3)}  ${e.parent_slug}/${e.slug}`);
      }
    }
    if (parentHits > 5) {
      console.error("FAIL: too many LF pages too close to parent pillar");
      process.exit(1);
    }
  }

  console.log("OK");
}

main();
