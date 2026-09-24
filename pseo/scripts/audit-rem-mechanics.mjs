/** Read-only source audit for the four REM mechanics pages. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { somaticEntryKey } from "../lib/somatic-science.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SOURCE = path.join(ROOT, "content", "mechanics", "rem.json");
const HUB_SOURCE = path.join(ROOT, "content", "mechanics", "rem-hub.html");
const GOLD = path.join(ROOT, "pseo", "data", "somatic-matrix.gold.json");
const EXPECTED = new Set(["atonia", "pgo-autonomic", "cortex-eeg", "cycle-timing"]);
const EXPECTED_RELATIONSHIPS = {
  atonia: [
    "sleep-paralysis-onset--rem--awakening",
    "rem-atonia-failure--rem--mid-cycle",
  ],
  "pgo-autonomic": [],
  "cortex-eeg": [],
  "cycle-timing": [
    "hypnopompic-somatic-surge--rem--awakening",
    "fragmented-rem--rem--fragmentation",
  ],
};

function main() {
  const source = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
  const hub = fs.readFileSync(HUB_SOURCE, "utf8");

  const hubRequired = [
    '<link rel="canonical" href="https://oneirox.com/mechanics/rem/">',
    '<meta name="robots" content="index,follow">',
    "/mechanics/rem/atonia/",
    "/mechanics/rem/pgo-autonomic/",
    "/mechanics/rem/cortex-eeg/",
    "/mechanics/rem/cycle-timing/",
  ];

  for (const token of hubRequired) {
    if (!hub.includes(token)) failures.push(`REM hub missing ${token}`);
  }

  if ((hub.match(/<h1\b/g) || []).length !== 1) {
    failures.push("REM hub must contain exactly one H1");
  }

  for (const forbidden of [
    "hard physiology",
    "PGO storm",
    "90-minute gate",
    "densest dream buffer",
    "pontine spikes become the visual reel",
    "Decode scores mechanism",
    "threat rehearsal",
  ]) {
    if (hub.includes(forbidden)) failures.push(`REM hub contains forbidden claim: ${forbidden}`);
  }

  const pages = source.pages || [];
  const failures = [];
  const slugs = new Set();
  const canonicals = new Set();
  const gold = JSON.parse(fs.readFileSync(GOLD, "utf8"));
  const nominated = new Set(
    (gold.entries || []).filter((entry) => entry.indexable === true).map(somaticEntryKey)
  );

  if (pages.length !== EXPECTED.size) failures.push(`expected ${EXPECTED.size} pages, got ${pages.length}`);
  for (const page of pages) {
    if (!EXPECTED.has(page.slug)) failures.push(`unsupported mechanics slug: ${page.slug}`);
    if (slugs.has(page.slug)) failures.push(`duplicate slug: ${page.slug}`);
    slugs.add(page.slug);
    if (canonicals.has(page.canonical)) failures.push(`duplicate canonical: ${page.canonical}`);
    canonicals.add(page.canonical);
    if (page.canonical !== `https://oneirox.com/mechanics/rem/${page.slug}/`) {
      failures.push(`wrong canonical for ${page.slug}: ${page.canonical}`);
    }
    for (const field of [
      "title", "meta_description", "h1", "lead", "author", "date_published", "date_modified",
      "kicker", "json_ld_headline", "disclaimer", "body_prefix_html", "body_suffix_html",
      "content_html", "related_heading",
    ]) {
      if (!String(page[field] || "").trim()) failures.push(`${page.slug} missing ${field}`);
    }
    if (page.robots !== "index,follow") failures.push(`${page.slug} robots must be index,follow`);
    if (!page.cta?.heading || !page.cta?.body || !Array.isArray(page.cta.links) || !page.cta.links.length) {
      failures.push(`${page.slug} missing CTA source fields`);
    }
    for (const link of page.cta?.links || []) {
      if (!link.href || !link.label || !String(link.href).startsWith("/")) {
        failures.push(`${page.slug} invalid CTA link`);
      }
    }
    const sourceText = JSON.stringify(page);
    for (const forbidden of [
      "autonomic chaos",
      "Likely hardware read",
      "panic theater",
      "map to PGO/autonomic load",
      "Mechanism-first reading starts there",
    ]) {
      if (sourceText.includes(forbidden)) {
        failures.push(`${page.slug} contains overclaim language: ${forbidden}`);
      }
    }
    if (sourceText.includes("AUTO-UTILITY-LINKS")) failures.push(`${page.slug} contains AUTO-UTILITY-LINKS`);
    if (/{{[^}]+}}/.test(sourceText)) failures.push(`${page.slug} contains unresolved template token`);
    if (sourceText.includes("public/")) failures.push(`${page.slug} source must not reference public/`);
    if (page.main_before_related_html || page.main_after_related_html) {
      failures.push(`${page.slug} retains deprecated duplicated main HTML fields`);
    }
    for (const token of ["<h1", "rm-cta", "rm-related", "rm-disclaimer"]) {
      if (page.content_html.includes(token)) failures.push(`${page.slug} content_html contains ${token}`);
    }
    if (page.content_html.includes('<p class="rm-kicker"')) {
      failures.push(`${page.slug} content_html contains the page kicker wrapper`);
    }
    const relationshipKeys = new Set();
    for (const link of page.somatic_relationships || []) {
      const match = String(link.href).match(/^\/somatic\/([^/]+)\/([^/]+)\/([^/]+)\/$/);
      if (!match) {
        failures.push(`${page.slug} invalid Somatic relationship: ${link.href}`);
        continue;
      }
      const relationshipKey = `${match[1]}--${match[2]}--${match[3]}`;
      if (relationshipKeys.has(relationshipKey)) failures.push(`${page.slug} duplicate Somatic relationship: ${link.href}`);
      relationshipKeys.add(relationshipKey);
      if (!nominated.has(relationshipKey)) failures.push(`${page.slug} relationship is not a Gold nomination: ${link.href}`);
    }
    const expectedRelationships = EXPECTED_RELATIONSHIPS[page.slug] || [];
    if (
      relationshipKeys.size !== expectedRelationships.length ||
      expectedRelationships.some((relationshipKey) => !relationshipKeys.has(relationshipKey))
    ) {
      failures.push(`${page.slug} does not match its explicit Somatic relationship mapping`);
    }
    const mechanicsTargets = new Set();
    for (const link of page.mechanics_links || []) {
      const target = String(link.href).match(/^\/mechanics\/rem\/([^/]+)\/$/)?.[1];
      if (!target || !EXPECTED.has(target)) {
        failures.push(`${page.slug} unsupported mechanics target: ${link.href}`);
      }
      if (mechanicsTargets.has(link.href)) failures.push(`${page.slug} duplicate mechanics link: ${link.href}`);
      mechanicsTargets.add(link.href);
    }
    if (page.slug === "cycle-timing" && !page.content_html.includes("rm-night-scrub")) {
      failures.push("cycle-timing missing interactive markup");
    }
  }
  for (const slug of EXPECTED) if (!slugs.has(slug)) failures.push(`missing expected slug: ${slug}`);
  if (failures.length) {
    console.error(`REM mechanics source audit FAIL (${failures.length})`);
    failures.forEach((failure) => console.error(` - ${failure}`));
    process.exit(1);
  }
  console.log(`REM mechanics source audit OK: ${pages.length} pages В· ${nominated.size} Gold nominations`);
}

main();
