import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isSomaticBuildEligible } from "../lib/somatic-science.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const GOLD = path.join(__dirname, "../data/somatic-matrix.gold.json");
const MATRIX = path.join(__dirname, "../data/somatic-matrix.json");
const SITE = "https://oneirox.com";
const forbidden = [
  "WebApplication", "HealthApplication", "Dataset readout", "Cortical window",
  "Transmitter focus", "Chart seed", "Density score", "A note from Vigen",
  'data-module="gauges"', 'data-module="tx_cards"', 'data-chart-seed=', 'data-gauge-',
];

function pagePath(entry) {
  return path.join(ROOT, "public", "somatic", entry.slug_symptom, entry.slug_phase, entry.slug_context, "index.html");
}

function main() {
  const gold = JSON.parse(fs.readFileSync(GOLD, "utf8"));
  const matrix = JSON.parse(fs.readFileSync(MATRIX, "utf8"));
  const reviewed = (gold.entries || []).filter(isSomaticBuildEligible);
  const failures = [];
  if (reviewed.length !== 11) failures.push(`expected 11 reviewed pages, got ${reviewed.length}`);
  for (const entry of reviewed) {
    const file = pagePath(entry);
    const url = `${SITE}/somatic/${entry.slug_symptom}/${entry.slug_phase}/${entry.slug_context}/`;
    if (!fs.existsSync(file)) { failures.push(`${entry.id}: generated file missing`); continue; }
    const html = fs.readFileSync(file, "utf8");
    for (const required of [
      `<link rel="canonical" href="${url}">`,
      '<meta name="robots" content="index,follow">', entry.reviewed_title,
      entry.reviewed_description, "ESTABLISHED", "SUPPORTED HYPOTHESIS",
      "What this cannot tell you", "What you can actually observe", "Safety boundary",
      '"@type":"WebPage"',
    ]) if (!html.includes(required)) failures.push(`${entry.id}: missing ${required}`);
    if ((html.match(/<h1\b/g) || []).length !== 1) failures.push(`${entry.id}: expected one H1`);
    if (/{{[^}]+}}/.test(html)) failures.push(`${entry.id}: unresolved template token`);
    for (const citation of entry.citations) {
      if (!html.includes(`https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/`)) failures.push(`${entry.id}: citation PMID ${citation.pmid} missing`);
    }
    for (const link of entry.reviewed_mechanics_links) {
      if (!html.includes(`href="${link.href}"`)) failures.push(`${entry.id}: mechanics link ${link.href} missing`);
    }
    for (const pattern of forbidden) if (html.includes(pattern)) failures.push(`${entry.id}: forbidden legacy pattern ${pattern}`);
  }
  let nonEligibleChecked = 0;
  for (const entry of matrix.entries || []) {
    if (isSomaticBuildEligible(entry)) continue;
    const file = pagePath(entry);
    if (!fs.existsSync(file)) continue;
    nonEligibleChecked++;
    const html = fs.readFileSync(file, "utf8");
    if (!html.includes('<meta name="robots" content="noindex,follow">')) {
      failures.push(`${entry.id}: non-eligible page is missing noindex,follow`);
    }
    if (html.includes('<meta name="robots" content="index,follow">')) {
      failures.push(`${entry.id}: non-eligible page contains index,follow`);
    }
  }
  if (failures.length) {
    console.error(`Reviewed Somatic output audit FAIL (${failures.length})`);
    failures.forEach((failure) => console.error(` - ${failure}`));
    process.exit(1);
  }
  console.log(`Reviewed Somatic output audit OK: ${reviewed.length} reviewed pages · ${nonEligibleChecked} non-eligible existing pages checked`);
}

main();
