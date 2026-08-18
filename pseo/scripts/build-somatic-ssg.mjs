/**
 * Safe PSEO SSG: enrich-aware typed shells + optional modules.
 * Indexable top-N only in sitemap; uniqueness audit must pass first.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildEegSvg } from "../lib/chart-svg.mjs";
import { markIndexable } from "../lib/rank.mjs";
import { buildZoneSvg } from "../lib/compose.mjs";
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
    <p class="sx-decode-hint">${esc(entry.decode_hint || "")}</p>
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
  <p>${esc(entry.felt_on_waking)}</p>
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
  const key = shellKey(entry);
  const tpl = templates[key] || templates.eeg_baseline;
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

const PHASE_HUB = {
  n1: {
    h2: "Map hypnagogic body signals in N1 sleep",
    lead: "N1 is the theta gate into sleep (4–7 Hz). The body still reports falling, hypnic jerks, limb-float, and onset breathing pauses — residue of the wake-to-sleep switch, not a dream plot.",
    h2_2: "Indexed N1 utilities — onset, fragmentation, awakening",
    description: (n) =>
      `Hypnagogic body signals in N1 (theta 4–7 Hz): jerks, limb-float, exploding-head bursts, onset pauses. ${n} indexed somatic utilities — Oneirox.`,
  },
  n2: {
    h2: "Map spindle-stage body signals in N2 sleep",
    lead: "N2 is the sigma window (11–16 Hz): spindles, K-complex, bruxism, periodic limb movements, pre-REM atonia ramp. The readout is muscle and EEG — not a symbol dictionary.",
    h2_2: "Indexed N2 utilities — onset, mid-cycle, fragmentation, awakening",
    description: (n) =>
      `N2 body signals (sigma 11–16 Hz): bruxism, PLM, alpha intrusion, pre-REM atonia ramp. ${n} indexed somatic utilities — Oneirox.`,
  },
  n3: {
    h2: "Map slow-wave body residue in N3 sleep",
    lead: "N3 is delta (0.5–2 Hz). Confusional motor residue at N3-exit is a stage-shift in the body, not a story the cortex finished telling.",
    h2_2: "Indexed N3 utilities — slow-wave exit and motor residue",
    description: (n) =>
      `N3 slow-wave body residue (delta 0.5–2 Hz): confusional arousal motor leftover at stage exit. ${n} indexed somatic utilit${n === 1 ? "y" : "ies"} — Oneirox.`,
  },
  rem: {
    h2: "Map REM atonia and somatic residue during dreaming sleep",
    lead: "REM runs theta (4–8 Hz) with spinal atonia, phasic twitches, thermoregulatory blunting, and paralysis at the wake border. The body is the metric. The dream narrative is secondary.",
    h2_2: "Indexed REM utilities — onset, mid-cycle, fragmentation, awakening",
    description: (n) =>
      `REM somatic metrics (theta 4–8 Hz): atonia failure, sleep paralysis, hypnopompic surge, distal twitches. ${n} indexed utilities — Oneirox.`,
  },
};

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
      H2: "Read the body's sleep-phase metrics, not dream symbols",
      LEAD: `Each utility is a unique EEG/atonia/marker readout for one symptom × phase × context. ${indexable.length} pages are in the index; the rest stay noindex until density is enough.`,
      H2_2: "Indexed utilities across N1, N2, N3, and REM",
      ESSAY: phaseHubEssayHtml("all", "somatic", indexable, {
        h2: "Read the body's sleep-phase metrics, not dream symbols",
        lead: `Indexed dataset: ${indexable.length} high-density utilities. Full DB held offline from index until promoted.`,
        h2_2: "Indexed utilities across N1, N2, N3, and REM",
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
    const copy = PHASE_HUB[slug];
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
        DESCRIPTION: copy.description(list.length),
        CANONICAL: `${SITE}/somatic/phase/${slug}/`,
        JSON_LD: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Oneirox ${label} Somatic Utilities`,
          url: `${SITE}/somatic/phase/${slug}/`,
          numberOfItems: list.length,
        }),
        H2: copy.h2,
        LEAD: copy.lead,
        H2_2: copy.h2_2,
        ESSAY: phaseHubEssayHtml(slug, label, list, copy),
        PHASE_LINKS: phaseLinks,
        LINK_LIST: links,
      })
    );
  }
}

function writeSitemap(entries) {
  const indexable = entries.filter((e) => e.indexable);
  const hubKey = indexable.map((e) => `${e.slug_symptom}/${e.slug_phase}/${e.slug_context}`).join("|");
  const urls = [
    { loc: `${SITE}/somatic/`, priority: "0.8", key: `hub-all:${hubKey}` },
    { loc: `${SITE}/somatic/phase/n1/`, priority: "0.7", key: `hub-n1:${hubKey}` },
    { loc: `${SITE}/somatic/phase/n2/`, priority: "0.7", key: `hub-n2:${hubKey}` },
    { loc: `${SITE}/somatic/phase/n3/`, priority: "0.7", key: `hub-n3:${hubKey}` },
    { loc: `${SITE}/somatic/phase/rem/`, priority: "0.7", key: `hub-rem:${hubKey}` },
    ...indexable.map((e) => ({
      loc: pageUrl(e),
      priority: "0.65",
      key: `${e.id}|${e.title}|${e.density_score}|${(e.somatic_markers || []).join(",")}`,
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
  const urls = entries.filter((e) => e.indexable).map((e) => pageUrl(e));
  writeAllowlistIfChanged(path.join(PSEO, "data", "indexable-allowlist.json"), urls);
}

function main() {
  if (!fs.existsSync(MATRIX)) {
    console.error("Missing matrix. Run: npm run pseo:expand && npm run pseo:enrich");
    process.exit(1);
  }
  let matrix = JSON.parse(fs.readFileSync(MATRIX, "utf8"));
  let entries = matrix.entries || [];
  if (!entries.some((e) => e.indexable)) {
    entries = markIndexable(entries, INDEXABLE_CAP);
    matrix = { ...matrix, entries, indexable_count: INDEXABLE_CAP };
    fs.writeFileSync(MATRIX, JSON.stringify(matrix, null, 2));
  }

  if (!entries.some((e) => e.mechanism_bullets?.length)) {
    console.error("Matrix not enriched. Run: npm run pseo:enrich");
    process.exit(1);
  }

  const templates = {
    eeg_baseline: fs.readFileSync(TPL.eeg_baseline, "utf8"),
    phase_disruption: fs.readFileSync(TPL.phase_disruption, "utf8"),
    atonia_risk: fs.readFileSync(TPL.atonia_risk, "utf8"),
    sparse_minimal: fs.readFileSync(TPL.sparse_minimal, "utf8"),
  };
  templates.transmitter_focus = templates.eeg_baseline;
  templates.somatic_map = templates.eeg_baseline;
  templates.compare_related = templates.phase_disruption;

  const tplHub = fs.readFileSync(TPL_HUB, "utf8");
  const byId = Object.fromEntries(entries.map((e) => [e.id, e]));

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
