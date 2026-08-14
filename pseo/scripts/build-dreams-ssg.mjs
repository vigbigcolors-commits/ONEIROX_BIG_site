/**
 * Dream Meaning PSEO vertical — SSG builder.
 * Renders public/dreams/{slug}/index.html (26 authored pillar pages) + hub.
 * Content lives in pseo/data/dream-meaning-matrix.json (authored, not combinatorial).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PSEO = path.resolve(__dirname, "..");
const MATRIX = path.join(PSEO, "data", "dream-meaning-matrix.json");
const OUT_DIR = path.join(ROOT, "public", "dreams");
const SITE = "https://oneirox.com";
const PUBLISHED = "2026-08-14";

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pageUrl(entry) {
  return `${SITE}/dreams/${entry.slug}/`;
}

function jsonLd(entry) {
  const url = pageUrl(entry);
  const graph = [
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: entry.title,
      description: entry.meta_description,
      url,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      author: { "@type": "Person", name: "Vigen G.R." },
      isPartOf: { "@id": `${SITE}/#website` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Oneirox", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Dream Meaning", item: `${SITE}/dreams/` },
        { "@type": "ListItem", position: 3, name: entry.title, item: url },
      ],
    },
  ];
  if ((entry.variants || []).length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: entry.variants.map((v) => ({
        "@type": "Question",
        name: v.q,
        acceptedAnswer: { "@type": "Answer", text: v.a },
      })),
    });
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

function variantsHtml(entry) {
  const items = (entry.variants || [])
    .map(
      (v, i) => `      <details class="dm-variant"${i === 0 ? " open" : ""}>
        <summary>${esc(v.q)}</summary>
        <p>${esc(v.a)}</p>
      </details>`
    )
    .join("\n");
  if (!items) return "";
  return `    <section class="dm-variants" aria-label="Scenario variants">
      <h2>By scenario</h2>
${items}
    </section>`;
}

function relatedHtml(entry) {
  const cards = [];
  for (const s of entry.related_somatic || []) {
    cards.push(
      `      <a class="dm-related-card" href="${esc(s.href)}"><span class="dm-related-card__eyebrow">Somatic marker</span><span class="dm-related-card__label">${esc(s.label)}</span></a>`
    );
  }
  if (entry.related_mechanics) {
    cards.push(
      `      <a class="dm-related-card" href="${esc(entry.related_mechanics.href)}"><span class="dm-related-card__eyebrow">REM mechanics</span><span class="dm-related-card__label">${esc(entry.related_mechanics.label)}</span></a>`
    );
  }
  if (!cards.length) return "";
  return `    <section class="dm-related" aria-label="Related reading">
      <h2>Related reading</h2>
${cards.join("\n")}
    </section>`;
}

function bodyParagraphsHtml(entry) {
  return (entry.body_paragraphs || [])
    .map((p) => `      <p>${esc(p)}</p>`)
    .join("\n");
}

function pageHtml(entry) {
  const url = pageUrl(entry);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>${esc(entry.meta_title)}</title>
  <meta name="description" content="${esc(entry.meta_description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index,follow">
  <link rel="stylesheet" href="/css/fonts.css">
  <link rel="stylesheet" href="/dreams/assets/dream-meaning.css">
  <script type="application/ld+json">
  ${jsonLd(entry)}
  </script>
</head>
<body class="dm-body">
  <header class="dm-top">
    <a class="dm-brand" href="/">Oneirox</a>
    <nav class="dm-nav" aria-label="Dream Meaning">
      <a href="/dreams/">Dream Meaning</a>
      <a href="/mechanics/rem/">REM mechanics</a>
      <a href="/#decode">Decode</a>
    </nav>
  </header>
  <main class="dm-main">
    <p class="dm-breadcrumb"><a href="/">Oneirox</a> · <a href="/dreams/">Dream Meaning</a> · ${esc(entry.title)}</p>
    <p class="dm-kicker">${esc(entry.kicker)}</p>
    <h1 class="dm-title">${esc(entry.title)}</h1>
    <p class="dm-lead">${esc(entry.lead)}</p>

    <section class="dm-signal" aria-label="Signal">
      <span class="dm-signal__tag">SIGNAL</span>
      <p>${esc(entry.signal)}</p>
    </section>

    <div class="dm-prose">
      <h2>What's actually happening</h2>
${bodyParagraphsHtml(entry)}
    </div>

${variantsHtml(entry)}

    <section class="dm-morning" aria-label="Morning prompt">
      <h2>MORNING — what to ask yourself</h2>
      <p>${esc(entry.morning_prompt)}</p>
    </section>

    <section class="dm-cta">
      <h2>Decode this dream directly</h2>
      <p>Paste the dream as you remember it. Oneirox reads it for the mechanism underneath — one SIGNAL / BODY / MORNING breakdown, not a symbol list.</p>
      <a class="dm-btn" href="/#decode">Open Decode →</a>
    </section>

${relatedHtml(entry)}

    <p class="dm-disclaimer">Educational neuroscience and dream-research synthesis. Not medical or psychological advice. Persistent nightmares, panic, or distress deserve a conversation with a clinician.</p>
  </main>
  <footer class="dm-foot">
    <a href="/dreams/">Dream Meaning</a> · <a href="/mechanics/rem/">REM mechanics</a> · <a href="/somatic/">Somatic utilities</a> · <a href="/#decode">Decode</a>
  </footer>
</body>
</html>
`;
}

function writePage(entry) {
  const dir = path.join(OUT_DIR, entry.slug);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, "index.html"), pageHtml(entry));
}

const CATEGORY_ORDER = [
  "Body & appearance",
  "Threat & anxiety",
  "People & relationships",
  "Situational stress",
  "Places & symbols",
  "Meta & educational",
];

function hubHtml(entries) {
  const byCategory = new Map();
  for (const cat of CATEGORY_ORDER) byCategory.set(cat, []);
  for (const e of entries) {
    if (!byCategory.has(e.category)) byCategory.set(e.category, []);
    byCategory.get(e.category).push(e);
  }

  const groups = [...byCategory.entries()]
    .filter(([, list]) => list.length)
    .map(([cat, list]) => {
      const cards = list
        .map((e) => `      <a class="dm-hub-card" href="/dreams/${e.slug}/">${esc(e.title)}</a>`)
        .join("\n");
      return `    <section class="dm-hub-group" aria-label="${esc(cat)}">
      <h2>${esc(cat)}</h2>
      <div class="dm-hub-grid">
${cards}
      </div>
    </section>`;
    })
    .join("\n");

  const url = `${SITE}/dreams/`;
  const ld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Oneirox Dream Meaning Library",
    url,
    numberOfItems: entries.length,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>Dream Meaning Library — Mechanism, Not Superstition | Oneirox</title>
  <meta name="description" content="What ${entries.length} of the most-searched dreams actually mean, explained through REM neuroscience — teeth falling out, being chased, snakes, sleep paralysis, and more.">
  <link rel="canonical" href="${url}">
  <link rel="stylesheet" href="/css/fonts.css">
  <link rel="stylesheet" href="/dreams/assets/dream-meaning.css">
  <script type="application/ld+json">${ld}</script>
</head>
<body class="dm-body">
  <header class="dm-top">
    <a class="dm-brand" href="/">Oneirox</a>
    <nav class="dm-nav" aria-label="Dream Meaning">
      <a href="/dreams/" aria-current="page">Dream Meaning</a>
      <a href="/mechanics/rem/">REM mechanics</a>
      <a href="/#decode">Decode</a>
    </nav>
  </header>
  <main class="dm-main">
    <p class="dm-kicker">Dream symbol library — mechanism-first</p>
    <h1 class="dm-title">What your dream is actually doing</h1>
    <p class="dm-lead dm-hub-lead">${entries.length} of the most-searched dream themes on the internet, each explained through the specific REM mechanism behind it — memory consolidation, threat simulation, autonomic arousal, atonia — instead of a fixed symbol dictionary. Pick the dream you actually had.</p>

${groups}

    <section class="dm-cta">
      <h2>Had a dream that isn't listed here?</h2>
      <p>Decode reads the dream you actually write, in full, for the mechanism underneath — not a keyword lookup.</p>
      <a class="dm-btn" href="/#decode">Open Decode →</a>
    </section>
  </main>
  <footer class="dm-foot">
    <a href="/mechanics/rem/">REM mechanics</a> · <a href="/somatic/">Somatic utilities</a> · <a href="/#decode">Decode</a>
  </footer>
</body>
</html>
`;
}

function writeHub(entries) {
  ensureDir(OUT_DIR);
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), hubHtml(entries));
}

function writeSitemap(entries) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE}/dreams/`, priority: "0.9" },
    ...entries.map((e) => ({ loc: pageUrl(e), priority: "0.85" })),
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
    path.join(ROOT, "public", "sitemap-dreams.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
  );
  return urls.length;
}

function writeDreamAllowlist(entries) {
  const urls = [
    `${SITE}/dreams/`,
    ...entries.map((e) => pageUrl(e)),
  ];
  fs.writeFileSync(
    path.join(PSEO, "data", "dream-allowlist.json"),
    JSON.stringify({ generated_at: new Date().toISOString(), urls }, null, 2)
  );
  return urls.length;
}

function main() {
  if (!fs.existsSync(MATRIX)) {
    console.error("Missing dream-meaning-matrix.json");
    process.exit(1);
  }
  const matrix = JSON.parse(fs.readFileSync(MATRIX, "utf8"));
  const entries = matrix.entries || [];
  if (!entries.length) {
    console.error("dream-meaning-matrix.json has no entries");
    process.exit(1);
  }

  if (fs.existsSync(OUT_DIR)) {
    for (const name of fs.readdirSync(OUT_DIR)) {
      if (name === "assets") continue;
      fs.rmSync(path.join(OUT_DIR, name), { recursive: true, force: true });
    }
  }
  ensureDir(path.join(OUT_DIR, "assets"));
  fs.copyFileSync(
    path.join(PSEO, "assets", "dream-meaning.css"),
    path.join(OUT_DIR, "assets", "dream-meaning.css")
  );

  for (const entry of entries) writePage(entry);
  writeHub(entries);
  const sm = writeSitemap(entries);
  const al = writeDreamAllowlist(entries);

  console.log(
    `Dream Meaning SSG: ${entries.length} pillar pages · sitemap URLs ${sm} · allowlist ${al}`
  );
}

main();
