/**
 * Safe PSEO SSG: DB matrix → typed UI shells.
 * - Indexable top-N: robots index,follow + sitemap
 * - Rest: noindex,follow + out of sitemap (open later by flipping indexable)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildEegSvg } from "../lib/chart-svg.mjs";
import { markIndexable } from "../lib/rank.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PSEO = path.resolve(__dirname, "..");
const MATRIX = path.join(PSEO, "data", "somatic-matrix.json");
const TPL_HUB = path.join(PSEO, "templates", "somatic-hub.html");
const CTA = fs.readFileSync(
  path.join(PSEO, "templates", "partials", "cta-hard.html"),
  "utf8"
);
const OUT_DIR = path.join(ROOT, "public", "somatic");
const SITE = "https://oneirox.com";
const INDEXABLE_CAP = 50;

const TPL = {
  eeg_baseline: path.join(PSEO, "templates", "somatic-eeg-baseline.html"),
  phase_disruption: path.join(PSEO, "templates", "somatic-phase-disruption.html"),
  atonia_risk: path.join(PSEO, "templates", "somatic-atonia-risk.html"),
};

const PHASE_BASE = {
  N1: { band: "theta", hz: "4–7 Hz" },
  N2: { band: "sigma", hz: "11–16 Hz" },
  N3: { band: "delta", hz: "0.5–2 Hz" },
  REM: { band: "theta", hz: "4–8 Hz" },
};

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fill(tpl, map) {
  let out = tpl;
  for (const [k, v] of Object.entries(map)) {
    out = out.split(`{{${k}}}`).join(String(v));
  }
  return out;
}

function listItems(arr) {
  return (arr || []).map((x) => `<li>${esc(x)}</li>`).join("\n");
}

function pageUrl(entry) {
  return `${SITE}/somatic/${entry.slug_symptom}/${entry.slug_phase}/${entry.slug_context}/`;
}

function somaticReadout(entry) {
  const e = entry.eeg_frequency_hz_range;
  return `Dataset readout: ${entry.physiological_symptom} in ${entry.sleep_phase} (${entry.context}). Cortical window ${e.min}–${e.max} Hz (${e.band}). Atonia=${entry.atonia_state}. Markers drive the text below — not dream-symbol meanings.`;
}

function jsonLd(entry) {
  if (!entry.indexable) {
    // Still emit minimal WebApplication for local UI; Google should honor noindex
  }
  const url = pageUrl(entry);
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${url}#app`,
    name: entry.title,
    url,
    description: entry.summary,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    isPartOf: { "@id": `${SITE}/#website` },
  });
}

function description(entry) {
  const e = entry.eeg_frequency_hz_range;
  return `${entry.physiological_symptom} · ${entry.sleep_phase} · ${e.min}–${e.max} Hz ${e.band}. Somatic metric utility — Oneirox.`;
}

function writeUtility(entry, templates) {
  const type = entry.utility_type in templates ? entry.utility_type : "eeg_baseline";
  const tpl = templates[type];
  const dir = path.join(
    OUT_DIR,
    entry.slug_symptom,
    entry.slug_phase,
    entry.slug_context
  );
  ensureDir(dir);
  const base = PHASE_BASE[entry.sleep_phase] || PHASE_BASE.N2;
  const robots = entry.indexable ? "index,follow" : "noindex,follow";
  const html = fill(tpl, {
    TITLE: esc(entry.title),
    DESCRIPTION: esc(description(entry)),
    CANONICAL: pageUrl(entry),
    ROBOTS: robots,
    INDEXABLE: entry.indexable ? "true" : "false",
    JSON_LD: entry.indexable ? jsonLd(entry) : "{}",
    CHART_SEED: String(entry.chart_seed),
    GAUGE_ATONIA: String(entry.gauge_atonia ?? 50),
    GAUGE_AROUSAL: String(entry.gauge_arousal ?? 50),
    GAUGE_COHERENCE: String(entry.gauge_coherence ?? 50),
    EEG_MIN: String(entry.eeg_frequency_hz_range.min),
    EEG_MAX: String(entry.eeg_frequency_hz_range.max),
    EEG_BAND: esc(entry.eeg_frequency_hz_range.band),
    BASE_BAND: esc(base.band),
    BASE_HZ: esc(base.hz),
    PHASE: esc(entry.sleep_phase),
    PHASE_SLUG: entry.slug_phase,
    CONTEXT: esc(entry.context),
    ATONIA: esc(entry.atonia_state),
    UTILITY_TYPE: esc(entry.utility_type),
    SUMMARY: esc(entry.summary),
    SOMATIC_READOUT: esc(somaticReadout(entry)),
    EEG_SVG: buildEegSvg(entry),
    TX_LIST: listItems(entry.neurotransmitters_involved),
    TX_INLINE: esc((entry.neurotransmitters_involved || []).join(", ")),
    MARKER_LIST: listItems(entry.somatic_markers),
    SOURCE_LIST: listItems(entry.sources),
    DENSITY: String(entry.density_score ?? "—"),
    CTA_HARD: CTA,
  });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

function writeHubs(tpl, entries) {
  const indexable = entries.filter((e) => e.indexable);
  const byPhase = { n1: [], n2: [], n3: [], rem: [] };
  for (const e of indexable) byPhase[e.slug_phase]?.push(e);

  const phaseLinks = `
    <nav class="sx-phase-links" aria-label="Phases">
      <a href="/somatic/phase/n1/">N1</a>
      <a href="/somatic/phase/n2/">N2</a>
      <a href="/somatic/phase/n3/">N3</a>
      <a href="/somatic/phase/rem/">REM</a>
    </nav>`;

  const mainLinks = indexable
    .map(
      (e) =>
        `<a href="/somatic/${e.slug_symptom}/${e.slug_phase}/${e.slug_context}/">${esc(e.title)}</a>`
    )
    .join("\n");

  ensureDir(OUT_DIR);
  fs.writeFileSync(
    path.join(OUT_DIR, "index.html"),
    fill(tpl, {
      TITLE: "Somatic sleep metric utilities",
      DESCRIPTION: `Indexed dataset: ${indexable.length} high-density utilities (safe crawl budget). Full DB held offline from index until promoted.`,
      CANONICAL: `${SITE}/somatic/`,
      JSON_LD: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Oneirox Somatic Metric Utilities",
        url: `${SITE}/somatic/`,
        numberOfItems: indexable.length,
      }),
      PHASE_LINKS: phaseLinks,
      LINK_LIST: mainLinks + "\n" + CTA,
    })
  );

  for (const [slug, label] of [
    ["n1", "N1"],
    ["n2", "N2"],
    ["n3", "N3"],
    ["rem", "REM"],
  ]) {
    const list = byPhase[slug] || [];
    const dir = path.join(OUT_DIR, "phase", slug);
    ensureDir(dir);
    const links = list
      .map(
        (e) =>
          `<a href="/somatic/${e.slug_symptom}/${e.slug_phase}/${e.slug_context}/">${esc(e.title)}</a>`
      )
      .join("\n");
    fs.writeFileSync(
      path.join(dir, "index.html"),
      fill(tpl, {
        TITLE: `${label} indexed somatic utilities`,
        DESCRIPTION: `High-density ${label} metric utilities currently open to indexing (${list.length}).`,
        CANONICAL: `${SITE}/somatic/phase/${slug}/`,
        JSON_LD: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Oneirox ${label} Somatic Utilities`,
          url: `${SITE}/somatic/phase/${slug}/`,
          numberOfItems: list.length,
        }),
        PHASE_LINKS: phaseLinks,
        LINK_LIST: links,
      })
    );
  }
}

function writeSitemap(entries) {
  const today = new Date().toISOString().slice(0, 10);
  const indexable = entries.filter((e) => e.indexable);
  const urls = [
    { loc: `${SITE}/somatic/`, priority: "0.8" },
    { loc: `${SITE}/somatic/phase/n1/`, priority: "0.7" },
    { loc: `${SITE}/somatic/phase/n2/`, priority: "0.7" },
    { loc: `${SITE}/somatic/phase/n3/`, priority: "0.7" },
    { loc: `${SITE}/somatic/phase/rem/`, priority: "0.7" },
    ...indexable.map((e) => ({ loc: pageUrl(e), priority: "0.65" })),
  ];
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n");
  fs.writeFileSync(
    path.join(ROOT, "public", "sitemap-somatic.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
  );
  return urls.length;
}

function writeRobotsAllowlist(entries) {
  const indexable = entries.filter((e) => e.indexable);
  const allows = indexable.map(
    (e) =>
      `Allow: /somatic/${e.slug_symptom}/${e.slug_phase}/${e.slug_context}/`
  );
  const text = `User-agent: *
Allow: /

# Safe PSEO crawl budget: bulk somatic DB is noindex in HTML.
# Hub + phase indexes + top density rows are explicitly allowed.
Allow: /somatic/$
Allow: /somatic/phase/

${allows.join("\n")}

# Oneirox is a web application (Dream Decoder), not an article blog.
Sitemap: https://oneirox.com/sitemap.xml
`;
  fs.writeFileSync(path.join(ROOT, "public", "robots.txt"), text);
}

function main() {
  if (!fs.existsSync(MATRIX)) {
    console.error("Missing matrix. Run: npm run pseo:expand");
    process.exit(1);
  }
  let matrix = JSON.parse(fs.readFileSync(MATRIX, "utf8"));
  let entries = matrix.entries || [];
  if (!entries.some((e) => e.indexable)) {
    entries = markIndexable(entries, INDEXABLE_CAP);
    matrix = { ...matrix, entries, indexable_count: INDEXABLE_CAP };
    fs.writeFileSync(MATRIX, JSON.stringify(matrix, null, 2));
  }

  const templates = {
    eeg_baseline: fs.readFileSync(TPL.eeg_baseline, "utf8"),
    phase_disruption: fs.readFileSync(TPL.phase_disruption, "utf8"),
    atonia_risk: fs.readFileSync(TPL.atonia_risk, "utf8"),
  };
  const tplHub = fs.readFileSync(TPL_HUB, "utf8");

  if (fs.existsSync(OUT_DIR)) {
    for (const name of fs.readdirSync(OUT_DIR)) {
      if (name === "assets") continue;
      fs.rmSync(path.join(OUT_DIR, name), { recursive: true, force: true });
    }
  }
  ensureDir(path.join(OUT_DIR, "assets"));
  fs.copyFileSync(
    path.join(PSEO, "assets", "somatic-utility.css"),
    path.join(OUT_DIR, "assets", "somatic-utility.css")
  );
  fs.copyFileSync(
    path.join(PSEO, "assets", "somatic-utility.js"),
    path.join(OUT_DIR, "assets", "somatic-utility.js")
  );

  for (const entry of entries) writeUtility(entry, templates);
  writeHubs(tplHub, entries);
  const sm = writeSitemap(entries);
  writeRobotsAllowlist(entries);

  const idx = entries.filter((e) => e.indexable).length;
  console.log(
    `Safe SSG: ${entries.length} DB pages · ${idx} indexable · sitemap URLs ${sm}`
  );
}

main();
