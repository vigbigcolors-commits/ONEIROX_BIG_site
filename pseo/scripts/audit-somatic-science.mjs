/**
 * Somatic indexability gate.
 *
 * Gold is the only source allowed to nominate an indexable Somatic row.
 * Default mode protects that boundary while the reviewed prose migration is in
 * progress. --strict additionally requires every reviewed metadata field.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SOMATIC_INDEXABLE_CAP } from "../lib/crawl-budget.mjs";
import {
  isSomaticBuildEligible,
  missingSomaticReviewFields,
  somaticEntryKey,
} from "../lib/somatic-science.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, "../data");
const GOLD = path.join(DATA, "somatic-matrix.gold.json");
const MATRIX = path.join(DATA, "somatic-matrix.json");
const strict = process.argv.includes("--strict");

function read(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function main() {
  const gold = read(GOLD).entries || [];
  const generated = read(MATRIX).entries || [];
  const failures = [];
  const migration = [];
  const goldByKey = new Map();
  const curated = [];
  const buildEligible = [];

  for (const entry of gold) {
    const entryKey = somaticEntryKey(entry);
    if (goldByKey.has(entryKey) && entry.indexable === true) {
      failures.push(`duplicate indexable canonical/slug combination in Gold: ${entryKey}`);
    }
    goldByKey.set(entryKey, entry);
    if (entry.indexable !== true) continue;
    curated.push(entry);
    const missing = missingSomaticReviewFields(entry);
    if (entry.science_reviewed_core !== true) {
      const message = `${entryKey}: science_reviewed_core=false`;
      if (strict) failures.push(`curated Gold row is not science reviewed: ${message}`);
      else migration.push(message);
    }
    if (missing.length) {
      const message = `${entryKey}: ${missing.join(", ")}`;
      if (strict) failures.push(`reviewed indexable row missing required fields: ${message}`);
      else migration.push(message);
    }
    if (isSomaticBuildEligible(entry)) buildEligible.push(entry);
  }

  if (curated.length > SOMATIC_INDEXABLE_CAP) {
    failures.push(`Gold indexable count ${curated.length} exceeds SOMATIC_INDEXABLE_CAP ${SOMATIC_INDEXABLE_CAP}`);
  }

  const curatedKeys = new Set(curated.map(somaticEntryKey));
  const buildEligibleKeys = new Set(buildEligible.map(somaticEntryKey));
  const generatedByKey = new Map();
  for (const entry of generated) {
    const entryKey = somaticEntryKey(entry);
    if (generatedByKey.has(entryKey) && entry.indexable === true) {
      failures.push(`duplicate indexable canonical/slug combination in generated matrix: ${entryKey}`);
    }
    generatedByKey.set(entryKey, entry);
    if (entry.indexable !== true) continue;
    if (!goldByKey.has(entryKey)) {
      failures.push(`generated/non-Gold row is indexable: ${entryKey}`);
      continue;
    }
    if (!curatedKeys.has(entryKey)) {
      failures.push(`generated row is indexable without explicit Gold nomination: ${entryKey}`);
    }
  }

  for (const entry of buildEligible) {
    const entryKey = somaticEntryKey(entry);
    const generatedEntry = generatedByKey.get(entryKey);
    if (!generatedEntry) {
      failures.push(`build-eligible Gold entry missing from generated matrix: ${entryKey}`);
    } else if (generatedEntry.indexable !== true) {
      failures.push(`build-eligible Gold entry missing from generated indexable set: ${entryKey}`);
    }
  }

  if (failures.length) {
    console.error(`Somatic science audit FAIL (${failures.length})`);
    failures.forEach((failure) => console.error(` - ${failure}`));
    process.exit(1);
  }

  console.log(
    `Somatic science audit OK: ${curated.length} curated Gold nominations · ${buildEligibleKeys.size} build-eligible rows · cap ${SOMATIC_INDEXABLE_CAP}${strict ? ", strict reviewed metadata" : ", migration-safe metadata gate"}`
  );
  if (migration.length) {
    console.warn(`EXPECTED MIGRATION BLOCKER: ${migration.length} reviewed metadata gaps. Run npm run pseo:audit:somatic-science:strict after migration.`);
    migration.slice(0, 12).forEach((item) => console.warn(` - ${item}`));
  }
}

main();
