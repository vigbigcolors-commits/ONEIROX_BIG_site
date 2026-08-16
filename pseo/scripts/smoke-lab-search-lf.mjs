import fs from "node:fs";

const idx = JSON.parse(fs.readFileSync("public/data/lab-search-index.json", "utf8"));

function tok(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s\-_]+/)
    .filter((t) => t.length > 2);
}

function score(q, doc) {
  const qt = tok(q);
  let s = 0;
  const terms = new Set(doc.terms || []);
  for (const t of qt) if (terms.has(t)) s += 7;
  const slug = String(doc.href || "")
    .replace(/^\/dreams\/|\/$/g, "")
    .replace(/\//g, "-");
  const bits = slug.split("-");
  let hits = 0;
  for (const b of bits) if (b.length > 2 && qt.includes(b)) hits++;
  if (hits >= 2) s += 42;
  else if (hits === 1) s += 22;
  if (doc.indexable) s += 6;
  return s;
}

const queries = [
  "snake bit me in dream",
  "teeth falling out with blood",
  "dog chasing me",
  "falling as I fall asleep",
  "sleep paralysis chest weight",
];

for (const q of queries) {
  const scored = idx.docs
    .filter((d) => d.kind === "dream" || d.kind === "dream-lf")
    .map((d) => ({ href: d.href, kind: d.kind, s: score(q, d) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3);
  console.log("\n" + q);
  for (const r of scored) console.log(" ", r.s, r.kind, r.href);
}
