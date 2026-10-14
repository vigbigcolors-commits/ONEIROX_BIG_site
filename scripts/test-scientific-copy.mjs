import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "public/index.html",
  "public/js/lab-search.js",
  "public/data/lab-search-index.json",
  "pseo/data/dream-lf-matrix.json",
  "public/dreams/being-chased/legs-wont-move/index.html",
  "public/dreams/being-chased/index.html",
  "public/dreams/dogs/index.html",
  "public/dreams/cheating-dreams/index.html",
  "public/dreams/falling/hypnic-onset-jolt/index.html",
  "public/lab/sleep-cycles/index.html",
  "public/js/lab-sleep-cycles.js",
];

const prohibited = [
  /the most diagnostically accurate dream data/i,
  /which neurobiological process was active during your REM cycle/i,
  /the mechanism your brain was running/i,
  /the question your nervous system was trying to deliver/i,
  /REM atonia is dampening motor output/i,
  /REM atonia signature leaking into narrative/i,
  /waking between cycles \(light sleep\) feels sharp/i,
  /waking mid-cycle triggers sleep inertia/i,
  /to avoid sleep inertia/i,
];

function lint(text) {
  return prohibited.filter((rule) => rule.test(text)).map((rule) => rule.toString());
}

const failures = [];
for (const relative of files) {
  const text = fs.readFileSync(path.join(root, relative), "utf8");
  for (const rule of lint(text)) failures.push(`${relative}: ${rule}`);
}

const positiveFixture = [
  "REM motor inhibition is relevant background, but one dream cannot establish that mechanism.",
  "A remembered dream cannot identify a specific brain state or diagnosis.",
  "Average cycle timing is a planning estimate, not a sleep-stage detector.",
  "Amygdala research can be discussed without measuring an individual brain.",
].join("\n");
const negativeFixture = "REM atonia is dampening motor output; waking mid-cycle triggers sleep inertia.";

if (lint(positiveFixture).length) failures.push("positive fixture was rejected");
if (lint(negativeFixture).length !== 2) failures.push("negative fixture did not trigger both known regressions");

if (failures.length) {
  console.error(`Scientific copy lint FAIL (${failures.length})`);
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log(`Scientific copy lint OK: ${files.length} user-facing sources + positive/negative fixtures`);
