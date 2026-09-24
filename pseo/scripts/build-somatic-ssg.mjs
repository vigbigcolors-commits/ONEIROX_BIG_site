/**
 * Safe PSEO SSG: enrich-aware typed shells + optional modules.
 * Indexable top-N only in sitemap; uniqueness audit must pass first.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildEegSvg } from "../lib/chart-svg.mjs";
import { buildZoneSvg } from "../lib/compose.mjs";
import { isSomaticBuildEligible, somaticEntryKey } from "../lib/somatic-science.mjs";
import { phaseHubEssayHtml, utilityEssayHtml } from "../lib/expand-somatic-prose.mjs";
import {
  writeRobotsTxt,
  writeAllowlistIfChanged,
  stableLastmod,
  flushLastmodStore,
  sitemapUrlXml,
  relForTarget,
} from "../lib/crawl-budget.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PSEO = path.resolve(__dirname, "..");
const MATRIX = path.join(PSEO, "data", "somatic-matrix.json");
const GOLD = path.join(PSEO, "data", "somatic-matrix.gold.json");
const TPL_HUB = path.join(PSEO, "templates", "somatic-hub.html");
const TPL_REVIEWED = path.join(PSEO, "templates", "somatic-reviewed.html");
const CTA = fs.readFileSync(
  path.join(PSEO, "templates", "partials", "cta-hard.html"),
  "utf8"
);
const OUT_DIR = path.join(ROOT, "public", "somatic");
const SITE = "https://oneirox.com";

const TPL = {
  eeg_baseline: path.join(PSEO, "templates", "somatic-eeg-baseline.html"),
  phase_disruption: path.join(PSEO, "templates", "somatic-phase-disruption.html"),
  atonia_risk: path.join(PSEO, "templates", "somatic-atonia-risk.html"),
  transmitter_focus: path.join(PSEO, "templates", "somatic-eeg-baseline.html"),
  somatic_map: path.join(PSEO, "templates", "somatic-eeg-baseline.html"),
  compare_related: path.join(PSEO, "templates", "somatic-phase-disruption.html"),
  sparse_minimal: path.join(PSEO, "templates", "somatic-sparse.html"),
};

const PHASE_BASE = {
  N1: { band: "theta", hz: "4–7 Hz" },
  N2: { band: "sigma", hz: "11–16 Hz" },
  N3: { band: "delta", hz: "0.5–2 Hz" },
  REM: { band: "theta", hz: "4–8 Hz" },
};

const TX_BLURB = {
  GABA: "inhibitory cortical/spinal brake",
  glycine: "spinal motor inhibition",
  acetylcholine: "REM-linked cortical drive",
  norepinephrine: "wake-pressure aminergic return",
  serotonin: "sensory-gate modulation",
  dopamine: "salience without waking story",
  orexin: "wake-promotion destabilizer",
  histamine: "arousal readiness bias",
  glutamate: "excitatory push",
  adenosine: "homeostatic sleep pressure",
  melatonin: "circadian gate bias",
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

/** Safe inline links: [anchor](/dreams|somatic|mechanics/...) */
function inlineMdLinks(text) {
  const src = String(text ?? "");
  const re = /\[([^\]]+)\]\((\/(?:dreams|somatic|mechanics)\/[^)\s]+)\)/g;
  let out = "";
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    out += esc(src.slice(last, m.index));
    out += `<a href="${esc(m[2])}">${esc(m[1])}</a>`;
    last = m.index + m[0].length;
  }
  out += esc(src.slice(last));
  return out;
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

function mechanismHtml(entry) {
  const bullets = (entry.mechanism_bullets || [])
    .map((b) => `<li>${esc(b)}</li>`)
    .join("");
  if (!bullets) return "";
  return `<section class="sx-mechanism" data-module="mechanism">
  <details open>
    <summary>Mechanism stack</summary>
    <ol class="sx-mechanism__list">${bullets}</ol>
    <p class="sx-decode-hint">${inlineMdLinks(entry.decode_hint || "")}</p>
  </details>
</section>`;
}

function txCardsHtml(entry) {
  const cards = (entry.neurotransmitters_involved || [])
    .map((t) => {
      const blurb = TX_BLURB[t] || "tagged in this dataset row";
      return `<article class="sx-tx-card"><h3>${esc(t)}</h3><p>${esc(blurb)}</p></article>`;
    })
    .join("");
  if (!cards) return "";
  return `<section class="sx-tx" data-module="tx_cards" aria-label="Transmitters"><h2>Transmitter focus</h2><div class="sx-tx-grid">${cards}</div></section>`;
}

function zoneMapHtml(entry) {
  const zones = entry.body_zones || [];
  if (!zones.length) return "";
  return `<section class="sx-zones" data-module="zone_map" aria-label="Body zones">
  <h2>Somatic map</h2>
  <div class="sx-zones__wrap">
    ${buildZoneSvg(zones)}
    <ul class="sx-zones__list">${zones.map((z) => `<li>${esc(z)}</li>`).join("")}</ul>
  </div>
</section>`;
}

function relatedHtml(entry, byId) {
  const ids = entry.related_ids || [];
  if (!ids.length) return "";
  const links = ids
    .map((id) => byId[id])
    .filter(Boolean)
    .map((e) => {
      const href = `/somatic/${e.slug_symptom}/${e.slug_phase}/${e.slug_context}/`;
      return `<li><a href="${href}"${relForTarget(!!e.indexable)}>${esc(e.title)}</a></li>`;
    })
    .join("");
  if (!links) return "";
  return `<section class="sx-related" data-module="related"><h2>Related metric rows</h2><ul>${links}</ul></section>`;
}

function stepperHtml(entry) {
  const markers = entry.somatic_markers || [];
  if (!markers.length) return "";
  const steps = markers
    .slice(0, 3)
    .map(
      (m, i) =>
        `<label class="sx-step"><input type="checkbox" data-step="${i}" /> <span>${esc(m)}</span></label>`
    )
    .join("");
  return `<section class="sx-stepper" data-module="stepper" aria-label="Marker check">
  <h2>Which markers match waking recall?</h2>
  <div class="sx-stepper__list">${steps}</div>
  <p class="sx-stepper__out" id="sx-step-out" hidden>Matches noted — open Lab Search with this somatic context.</p>
  <a class="sx-stepper__cta" href="/#lab-search">Search with body context →</a>
</section>`;
}

function feltOnWakingHtml(entry) {
  if (!entry.felt_on_waking) return "";
  return `<section class="sx-felt" data-module="felt_on_waking" aria-label="Felt on waking">
  <h2>Felt on waking</h2>
  <p>${inlineMdLinks(entry.felt_on_waking)}</p>
</section>`;
}

function decodeUseHtml(entry) {
  if (!entry.decode_use) return "";
  return `<section class="sx-decode-use" data-module="decode_use" aria-label="How Lab Search uses this row">
  <h2>How Lab Search uses this row</h2>
  <p>${esc(entry.decode_use)}</p>
</section>`;
}

function pillarHtml(entry) {
  if (!entry.pillar_href) return "";
  return `<section class="sx-pillar" data-module="physiology_pillar" aria-label="Related physiology">
  <h2>Related physiology</h2>
  <p>This row connects to <a href="${entry.pillar_href}">${esc(entry.pillar_label)}</a> — ${esc(entry.pillar_blurb)}.</p>
</section>`;
}

function voteHtml() {
  return `<section class="sx-vote" data-module="useful_vote" aria-label="Was this useful">
  <p class="sx-vote__q">Was this utility useful?</p>
  <div class="sx-vote__actions">
    <button type="button" class="sx-vote__btn" data-vote="yes">Yes</button>
    <button type="button" class="sx-vote__btn" data-vote="no">Not really</button>
  </div>
  <p class="sx-vote__msg" hidden>Saved on this device only.</p>
</section>`;
}

function extraModules(entry, byId) {
  const mods = new Set(entry.modules_present || []);
  const parts = [];
  if (mods.has("mechanism")) parts.push(mechanismHtml(entry));
  if (mods.has("tx_cards")) parts.push(txCardsHtml(entry));
  if (mods.has("zone_map")) parts.push(zoneMapHtml(entry));
  if (mods.has("felt_on_waking")) parts.push(feltOnWakingHtml(entry));
  if (mods.has("related")) parts.push(relatedHtml(entry, byId));
  if (mods.has("physiology_pillar")) parts.push(pillarHtml(entry));
  if (mods.has("decode_use")) parts.push(decodeUseHtml(entry));
  if (mods.has("stepper")) parts.push(stepperHtml(entry));
  if (mods.has("useful_vote")) parts.push(voteHtml());
  return parts.filter(Boolean).join("\n");
}

function shellKey(entry) {
  const layout = entry.layout_profile || entry.utility_type || "eeg_baseline";
  if (layout in TPL) return layout;
  if (entry.utility_type in TPL) return entry.utility_type;
  return "eeg_baseline";
}

function writeUtility(entry, templates, byId) {
  if (isSomaticBuildEligible(entry)) {
    writeReviewedUtility(entry, templates.reviewed);
    return;
  }
  const key = shellKey(entry);
  const tpl = templates[key] || templates.eeg_baseline;
  const dir = path.join(
    OUT_DIR,
    entry.slug_symptom,
    entry.slug_phase,
    entry.slug_context
  );
  const existing = path.join(dir, "index.html");
  if (fs.existsSync(existing)) {
    const html = fs.readFileSync(existing, "utf8");
    if (
      html.includes(`<link rel="canonical" href="${pageUrl(entry)}">`) &&
      html.includes('<meta name="robots" content="noindex,follow">')
    ) {
      return;
    }
  }
  ensureDir(dir);
  const base = PHASE_BASE[entry.sleep_phase] || PHASE_BASE.N2;
  const robots = "noindex,follow";
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
    LAYOUT: esc(entry.layout_profile || entry.utility_type),
    SUMMARY: esc(entry.summary),
    SOMATIC_READOUT: esc(somaticReadout(entry)),
    EEG_SVG: buildEegSvg(entry),
    TX_LIST: listItems(entry.neurotransmitters_involved),
    TX_INLINE: esc((entry.neurotransmitters_involved || []).join(", ")),
    MARKER_LIST: listItems(entry.somatic_markers),
    SOURCE_LIST: listItems(entry.sources),
    DENSITY: String(entry.density_score ?? "—"),
    MODULES_EXTRA: extraModules(entry, byId) + "\n" + utilityEssayHtml(entry),
    CTA_HARD: CTA,
  });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

function reviewedLinks(entry) {
  if (!entry.reviewed_mechanics_links.length) return "";
  return `<section class="sx-panel"><h2>Related physiology</h2><ul>${entry.reviewed_mechanics_links
    .map((link) => `<li><a href="${esc(link.href)}">${esc(link.label)}</a></li>`)
    .join("")}</ul></section>`;
}

function reviewedCitations(entry) {
  return entry.citations
    .map((citation) => `<li><a href="https://pubmed.ncbi.nlm.nih.gov/${esc(citation.pmid)}/" rel="noopener noreferrer" target="_blank">${esc(citation.label)}</a></li>`)
    .join("");
}

function writeReviewedUtility(entry, tpl) {
  const dir = path.join(OUT_DIR, entry.slug_symptom, entry.slug_phase, entry.slug_context);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, "index.html"), fill(tpl, {
    TITLE: esc(entry.reviewed_title),
    DESCRIPTION: esc(entry.reviewed_description),
    CANONICAL: pageUrl(entry),
    JSON_LD: reviewedJsonLd(entry),
    ESTABLISHED: esc(entry.evidence_sections.established),
    SUPPORTED_HYPOTHESIS: esc(entry.evidence_sections.supported_hypothesis),
    LIMITATION: esc(entry.evidence_sections.unknown_or_limitation),
    OBSERVABLE_FACTS: listItems(entry.observable_facts),
    MECHANICS_LINKS: reviewedLinks(entry),
    SAFETY_BOUNDARY: esc(entry.safety_boundary),
    CITATIONS: reviewedCitations(entry),
  }));
}

const PHASE_HUB = {
  n1: {
    title: "Sleep-onset phenomena",
    lead: "Sleep onset is a gradual transition rather than a single measurable instant from subjective experience. These reviewed guides cover body and sensory phenomena reported around falling asleep without claiming that a sensation identifies an exact sleep stage.",
  },
  n2: {
    title: "Movement phenomena during sleep",
    lead: "Some movement phenomena are commonly observed during NREM sleep, but a subjective report cannot determine the exact sleep stage. These guides separate observable behavior from laboratory measurement and diagnosis.",
  },
  n3: {
    title: "Confusional arousal and deep-NREM awakening",
    lead: "Confusional arousals are incomplete awakenings from NREM sleep. The guide focuses on observable behavior and clinical boundaries rather than reconstructing an EEG from memory.",
  },
  rem: {
    title: "REM-related motor and awakening phenomena",
    lead: "REM sleep includes characteristic motor inhibition, but subjective experiences do not directly measure REM physiology. These guides separate sleep paralysis, RSWA, awakening sensations, and fragmented sleep from unsupported mechanism claims.",
  },
};

function writeHubs(tpl, entries) {
  const indexable = entries.filter(isSomaticBuildEligible);
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
        `<a href="/somatic/${e.slug_symptom}/${e.slug_phase}/${e.slug_context}/">${esc(e.reviewed_title)}</a>`
    )
    .join("\n");

  ensureDir(OUT_DIR);
  fs.writeFileSync(
    path.join(OUT_DIR, "index.html"),
    fill(tpl, {
      TITLE: "Somatic sleep phenomena: evidence-based guides",
      DESCRIPTION: "Reviewed guides to body sensations and motor phenomena around sleep. Each page separates established evidence, plausible explanations, limits of inference, and safety boundaries.",
      CANONICAL: `${SITE}/somatic/`,
      JSON_LD: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Somatic sleep phenomena: evidence-based guides",
        url: `${SITE}/somatic/`,
        numberOfItems: indexable.length,
      }),
      H2: "Reviewed somatic sleep guides",
      LEAD: "Reviewed guides to body sensations and motor phenomena around sleep. Each page separates established evidence, plausible explanations, limits of inference, and safety boundaries.",
      H2_2: "Reviewed guides",
      ESSAY: "",
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
    const copy = PHASE_HUB[slug];
    const links = list
      .map(
        (e) =>
          `<a href="/somatic/${e.slug_symptom}/${e.slug_phase}/${e.slug_context}/">${esc(e.reviewed_title)}</a>`
      )
      .join("\n");
    fs.writeFileSync(
      path.join(dir, "index.html"),
      fill(tpl, {
        TITLE: copy.title,
        DESCRIPTION: copy.lead,
        CANONICAL: `${SITE}/somatic/phase/${slug}/`,
        JSON_LD: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: copy.title,
          url: `${SITE}/somatic/phase/${slug}/`,
          numberOfItems: list.length,
        }),
        H2: copy.title,
        LEAD: copy.lead,
        H2_2: "Reviewed guides",
        ESSAY: "",
        PHASE_LINKS: phaseLinks,
        LINK_LIST: links,
      })
    );
  }
}

function writeSitemap(entries) {
  const indexable = entries.filter(isSomaticBuildEligible);
  const reviewedKey = (e) => `${e.id}|${e.reviewed_title}|${e.reviewed_description}|${JSON.stringify(e.evidence_sections)}|${JSON.stringify(e.observable_facts)}|${JSON.stringify(e.citations)}|${e.safety_boundary}|${JSON.stringify(e.reviewed_mechanics_links)}`;
  const hubKey = indexable.map(reviewedKey).join("|");
  const urls = [
    { loc: `${SITE}/somatic/`, priority: "0.8", key: `hub-all:${hubKey}` },
    { loc: `${SITE}/somatic/phase/n1/`, priority: "0.7", key: `hub-n1:${hubKey}` },
    { loc: `${SITE}/somatic/phase/n2/`, priority: "0.7", key: `hub-n2:${hubKey}` },
    { loc: `${SITE}/somatic/phase/n3/`, priority: "0.7", key: `hub-n3:${hubKey}` },
    { loc: `${SITE}/somatic/phase/rem/`, priority: "0.7", key: `hub-rem:${hubKey}` },
    ...indexable.map((e) => ({
      loc: pageUrl(e),
      priority: "0.65",
      key: reviewedKey(e),
    })),
  ];
  const body = urls.map((u) => sitemapUrlXml(u.loc, stableLastmod(u.loc, u.key), u.priority)).join("\n");
  fs.writeFileSync(
    path.join(ROOT, "public", "sitemap-somatic.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
  );
  flushLastmodStore();
  return urls.length;
}

function writeAllowlist(entries) {
  const urls = entries.filter(isSomaticBuildEligible).map((e) => pageUrl(e));
  writeAllowlistIfChanged(path.join(PSEO, "data", "indexable-allowlist.json"), urls);
}

function reviewedJsonLd(entry) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: entry.reviewed_title,
    description: entry.reviewed_description,
    url: pageUrl(entry),
  });
}

function curatedIndexableKeys() {
  const gold = JSON.parse(fs.readFileSync(GOLD, "utf8"));
  return new Set(
    (gold.entries || [])
      .filter(isSomaticBuildEligible)
      .map(somaticEntryKey)
  );
}

function main() {
  if (!fs.existsSync(MATRIX)) {
    console.error("Missing matrix. Run: npm run pseo:expand && npm run pseo:enrich");
    process.exit(1);
  }
  const matrix = JSON.parse(fs.readFileSync(MATRIX, "utf8"));
  const curated = curatedIndexableKeys();
  // Gold is authoritative. This build-time projection never writes or promotes
  // generated rows; it only reflects explicit reviewed Gold selections.
  const entries = (matrix.entries || []).map((entry) => ({
    ...entry,
    indexable: curated.has(somaticEntryKey(entry)),
  }));

  if (!entries.some((e) => e.mechanism_bullets?.length)) {
    console.error("Matrix not enriched. Run: npm run pseo:enrich");
    process.exit(1);
  }

  const templates = {
    eeg_baseline: fs.readFileSync(TPL.eeg_baseline, "utf8"),
    phase_disruption: fs.readFileSync(TPL.phase_disruption, "utf8"),
    atonia_risk: fs.readFileSync(TPL.atonia_risk, "utf8"),
    sparse_minimal: fs.readFileSync(TPL.sparse_minimal, "utf8"),
    reviewed: fs.readFileSync(TPL_REVIEWED, "utf8"),
  };
  templates.transmitter_focus = templates.eeg_baseline;
  templates.somatic_map = templates.eeg_baseline;
  templates.compare_related = templates.phase_disruption;

  const tplHub = fs.readFileSync(TPL_HUB, "utf8");
  const byId = Object.fromEntries(entries.map((e) => [e.id, e]));

  ensureDir(path.join(OUT_DIR, "assets"));
  fs.copyFileSync(
    path.join(PSEO, "assets", "somatic-utility.css"),
    path.join(OUT_DIR, "assets", "somatic-utility.css")
  );
  fs.copyFileSync(
    path.join(PSEO, "assets", "somatic-utility.js"),
    path.join(OUT_DIR, "assets", "somatic-utility.js")
  );

  for (const entry of entries) writeUtility(entry, templates, byId);
  writeHubs(tplHub, entries);
  const sm = writeSitemap(entries);
  writeAllowlist(entries);
  writeRobotsTxt();

  const idx = entries.filter((e) => e.indexable).length;
  const layouts = {};
  for (const e of entries.filter((x) => x.indexable)) {
    layouts[e.layout_profile] = (layouts[e.layout_profile] || 0) + 1;
  }
  console.log(
    `Safe SSG: ${entries.length} DB pages · ${idx} indexable · sitemap URLs ${sm}`
  );
  console.log("Indexable layouts:", layouts);
}

main();
