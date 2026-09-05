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
const dreamLfPath = path.join(ROOT, "pseo/data/dream-lf-matrix.json");
const dreamLf = fs.existsSync(dreamLfPath)
  ? JSON.parse(fs.readFileSync(dreamLfPath, "utf8"))
  : { entries: [] };

function tok(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s\-']/g, " ")
    .split(/[\s\-_]+/)
    .filter((t) => t.length > 2);
}

function withStems(terms) {
  const out = [...terms];
  for (const t of terms) {
    if (t === "snakes" || t === "serpent") out.push("snake");
    if (t === "snake") out.push("snakes");
    if (t === "bitten" || t === "bites" || t === "bit") out.push("bite", "bitten");
    if (t === "bite") out.push("bitten", "bit");
    if (t === "teeth") out.push("tooth");
    if (t === "tooth") out.push("teeth");
    if (t === "chasing" || t === "chased") out.push("chase");
    if (t === "falling" || t === "fell") out.push("fall");
  }
  return uniq(out);
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function decodeHtml(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlText(s) {
  return decodeHtml(String(s || "").replace(/<[^>]+>/g, " "));
}

function firstMatch(source, re) {
  return (String(source).match(re) || [])[1] || "";
}

const docs = [];

for (const e of somatic.entries || []) {
  const href = `/somatic/${e.slug_symptom}/${e.slug_phase}/${e.slug_context}/`;
  const markers = e.somatic_markers || [];
  const zones = e.body_zones || [];
  const terms = withStems(
    uniq([
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
    ])
  );

  docs.push({
    id: e.id,
    kind: "somatic",
    href,
    title: e.title,
    h1: e.title,
    summary: (e.felt_on_waking || e.summary || "").slice(0, 180),
    blurb: (e.felt_on_waking || e.summary || "").slice(0, 180),
    category: "somatic",
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
  const terms = withStems(
    uniq([
      ...tok(e.title),
      ...tok(e.slug),
      ...tok(e.category),
      ...tok(e.kicker),
      ...tok(e.lead),
      ...tok(e.signal),
      ...tok(variantQs),
      ...tok((e.body_paragraphs || []).slice(0, 1).join(" ")),
    ])
  );

  docs.push({
    id: `dream:${e.slug}`,
    kind: "dream",
    href,
    title: e.title,
    h1: e.title,
    summary: (e.signal || e.lead || "").slice(0, 180),
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

for (const e of dreamLf.entries || []) {
  if (!e.parent_slug || !e.slug) continue;
  const href = `/dreams/${e.parent_slug}/${e.slug}/`;
  const variantQs = (e.variants || []).map((v) => v.q).join(" ");
  const terms = withStems(
    uniq([
      ...tok(e.title),
      ...tok(e.slug),
      ...tok(e.parent_slug),
      ...tok(e.kicker),
      ...tok(e.lead),
      ...tok(e.signal),
      ...tok(e.mechanism_key),
      ...tok(variantQs),
      ...tok((e.body_paragraphs || []).slice(0, 1).join(" ")),
    ])
  );

  docs.push({
    id: `dream-lf:${e.parent_slug}/${e.slug}`,
    kind: "dream-lf",
    href,
    title: e.title,
    h1: e.title,
    summary: (e.signal || e.lead || "").slice(0, 180),
    blurb: (e.signal || e.lead || "").slice(0, 180),
    phase: "",
    context: "",
    markers: [],
    zones: [],
    category: e.parent_slug || "",
    terms,
    indexable: !!e.indexable,
    rank: e.indexable ? 5 : 40,
    density: e.indexable ? 90 : 50,
  });
}

/* Restored and other standalone indexable pages are not represented in the
 * PSEO matrices. Read only sitemap-listed metadata, never full article bodies. */
const sitemapPath = path.join(ROOT, "public", "sitemap-core.xml");
const existingHrefs = new Set(docs.map((doc) => doc.href));
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const locs = [...sitemap.matchAll(/<loc>https:\/\/oneirox\.com([^<]+)<\/loc>/g)]
    .map((match) => match[1]);

  for (const href of locs) {
    if (existingHrefs.has(href) || !href.endsWith("/")) continue;
    const file = path.join(ROOT, "public", href.replace(/^\//, ""), "index.html");
    if (!fs.existsSync(file)) continue;

    const html = fs.readFileSync(file, "utf8");
    const robots = firstMatch(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
    if (/noindex/i.test(robots)) continue;

    const title = htmlText(firstMatch(html, /<title>([\s\S]*?)<\/title>/i));
    const h1 = htmlText(firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)) || title;
    const summary = decodeHtml(firstMatch(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i));
    if (!title || !h1) continue;

    const pathBits = href.split("/").filter(Boolean);
    const category = pathBits[0] === "dreams" ? (pathBits[1] || "dreams") : "standalone dream article";
    docs.push({
      id: `static:${href}`,
      kind: "article",
      href,
      title,
      h1,
      summary,
      blurb: summary,
      category,
      phase: "",
      context: "",
      markers: [],
      zones: [],
      terms: withStems(uniq([...tok(title), ...tok(h1), ...tok(category), ...tok(summary), ...tok(pathBits.join(" "))])),
      indexable: true,
      rank: 4,
      density: 100,
    });
    existingHrefs.add(href);
  }
}

const payload = {
  generated_at: new Date().toISOString(),
  version: 2,
  count: docs.length,
  docs,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(payload));
console.log(`wrote ${OUT} (${docs.length} docs)`);
