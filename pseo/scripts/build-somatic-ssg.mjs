/**
 * Build static somatic PSEO pages from matrix + locked shell.
 * Usage: node pseo/scripts/build-somatic-ssg.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildEegSvg } from "../lib/chart-svg.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PSEO = path.resolve(__dirname, "..");
const MATRIX = path.join(PSEO, "data", "somatic-matrix.json");
const TPL_UTIL = path.join(PSEO, "templates", "somatic-utility.html");
const TPL_HUB = path.join(PSEO, "templates", "somatic-hub.html");
const OUT_DIR = path.join(ROOT, "public", "somatic");
const SITE = "https://oneirox.com";

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
    out = out.split(`{{${k}}}`).join(v);
  }
  return out;
}

function listItems(arr) {
  return arr.map((x) => `<li>${esc(x)}</li>`).join("\n");
}

function pageUrl(entry) {
  return `${SITE}/somatic/${entry.slug_symptom}/${entry.slug_phase}/${entry.slug_context}/`;
}

function jsonLd(entry) {
  const url = pageUrl(entry);
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${url}#app`,
        name: entry.title,
        url,
        description: entry.summary,
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
        isPartOf: { "@id": "https://oneirox.com/#website" },
        about: {
          "@type": "Thing",
          name: `${entry.physiological_symptom} in ${entry.sleep_phase}`,
        },
        featureList: [
          `EEG band ${entry.eeg_frequency_hz_range.band}`,
          `Atonia ${entry.atonia_state}`,
          entry.utility_type,
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
          { "@type": "ListItem", position: 2, name: "Somatic", item: SITE + "/somatic/" },
          {
            "@type": "ListItem",
            position: 3,
            name: entry.sleep_phase,
            item: `${SITE}/somatic/phase/${entry.slug_phase}/`,
          },
          { "@type": "ListItem", position: 4, name: entry.title, item: url },
        ],
      },
    ],
  });
}

function description(entry) {
  const e = entry.eeg_frequency_hz_range;
  return `${entry.physiological_symptom} in ${entry.sleep_phase} (${entry.context}): ${e.min}–${e.max} Hz ${e.band} model with somatic markers. Oneirox neurobiology utility.`;
}

function writeUtility(tpl, entry) {
  const dir = path.join(
    OUT_DIR,
    entry.slug_symptom,
    entry.slug_phase,
    entry.slug_context
  );
  ensureDir(dir);
  const html = fill(tpl, {
    TITLE: esc(entry.title),
    DESCRIPTION: esc(description(entry)),
    CANONICAL: pageUrl(entry),
    JSON_LD: jsonLd(entry),
    CHART_SEED: String(entry.chart_seed),
    GAUGE_ATONIA: String(entry.gauge_atonia ?? 50),
    GAUGE_AROUSAL: String(entry.gauge_arousal ?? 50),
    GAUGE_COHERENCE: String(entry.gauge_coherence ?? 50),
    EEG_MIN: String(entry.eeg_frequency_hz_range.min),
    EEG_MAX: String(entry.eeg_frequency_hz_range.max),
    EEG_BAND: esc(entry.eeg_frequency_hz_range.band),
    PHASE: esc(entry.sleep_phase),
    PHASE_SLUG: entry.slug_phase,
    CONTEXT: esc(entry.context),
    ATONIA: esc(entry.atonia_state),
    UTILITY_TYPE: esc(entry.utility_type),
    SUMMARY: esc(entry.summary),
    EEG_SVG: buildEegSvg(entry),
    TX_LIST: listItems(entry.neurotransmitters_involved),
    MARKER_LIST: listItems(entry.somatic_markers),
    SOURCE_LIST: listItems(entry.sources),
  });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

function writeHubs(tpl, entries) {
  const byPhase = { n1: [], n2: [], n3: [], rem: [] };
  for (const e of entries) {
    byPhase[e.slug_phase]?.push(e);
  }

  const phaseLinks = `
    <nav class="sx-phase-links" aria-label="Phases">
      <a href="/somatic/phase/n1/">N1</a>
      <a href="/somatic/phase/n2/">N2</a>
      <a href="/somatic/phase/n3/">N3</a>
      <a href="/somatic/phase/rem/">REM</a>
    </nav>`;

  // Main hub — sample first 120 + count note (full crawl via phase hubs + sitemap)
  const mainLinks = entries
    .slice(0, 180)
    .map(
      (e) =>
        `<a href="/somatic/${e.slug_symptom}/${e.slug_phase}/${e.slug_context}/">${esc(e.title)}</a>`
    )
    .join("\n");

  ensureDir(OUT_DIR);
  fs.writeFileSync(
    path.join(OUT_DIR, "index.html"),
    fill(tpl, {
      TITLE: "Somatic sleep utilities",
      DESCRIPTION: `Interactive neurobiology utilities: physiological symptom × sleep phase. ${entries.length} modeled pages.`,
      CANONICAL: `${SITE}/somatic/`,
      JSON_LD: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Oneirox Somatic Sleep Utilities",
        url: `${SITE}/somatic/`,
        isPartOf: { "@id": `${SITE}/#website` },
        numberOfItems: entries.length,
      }),
      PHASE_LINKS: phaseLinks,
      LINK_LIST: mainLinks,
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
        TITLE: `${label} somatic utilities`,
        DESCRIPTION: `Physiological sleep utilities modeled in ${label}. ${list.length} pages.`,
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
  const urls = [
    { loc: `${SITE}/somatic/`, priority: "0.8" },
    { loc: `${SITE}/somatic/phase/n1/`, priority: "0.7" },
    { loc: `${SITE}/somatic/phase/n2/`, priority: "0.7" },
    { loc: `${SITE}/somatic/phase/n3/`, priority: "0.7" },
    { loc: `${SITE}/somatic/phase/rem/`, priority: "0.7" },
    ...entries.map((e) => ({
      loc: pageUrl(e),
      priority: "0.6",
    })),
  ];

  // Split if huge — single file is fine for ~1500
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

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
  fs.writeFileSync(path.join(ROOT, "public", "sitemap-somatic.xml"), xml);
}

function main() {
  if (!fs.existsSync(MATRIX)) {
    console.error("Missing matrix. Run: node pseo/scripts/expand-matrix.mjs");
    process.exit(1);
  }
  const matrix = JSON.parse(fs.readFileSync(MATRIX, "utf8"));
  const entries = matrix.entries;
  const tplUtil = fs.readFileSync(TPL_UTIL, "utf8");
  const tplHub = fs.readFileSync(TPL_HUB, "utf8");

  // Clean previous generated symptom trees (keep assets)
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

  let i = 0;
  for (const entry of entries) {
    writeUtility(tplUtil, entry);
    i++;
    if (i % 250 === 0) console.log(`… ${i}/${entries.length}`);
  }
  writeHubs(tplHub, entries);
  writeSitemap(entries);
  console.log(`Built ${entries.length} utility pages + hubs → ${OUT_DIR}`);
  console.log(`Sitemap → public/sitemap-somatic.xml`);
}

main();
