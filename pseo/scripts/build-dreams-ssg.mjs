/**
 * Dream Meaning PSEO vertical — SSG builder.
 * Pillars: public/dreams/{slug}/
 * LF children: public/dreams/{parent}/{slug}/
 * Content: dream-meaning-matrix.json + dream-lf-matrix.json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PSEO = path.resolve(__dirname, "..");
const MATRIX = path.join(PSEO, "data", "dream-meaning-matrix.json");
const LF_MATRIX = path.join(PSEO, "data", "dream-lf-matrix.json");
const OUT_DIR = path.join(ROOT, "public", "dreams");
const SITE = "https://oneirox.com";
const PUBLISHED = "2026-08-16";
const DREAM_INDEX_CAP = 50;

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

function pillarUrl(entry) {
  return `${SITE}/dreams/${entry.slug}/`;
}

function lfUrl(entry) {
  return `${SITE}/dreams/${entry.parent_slug}/${entry.slug}/`;
}

function lfPath(entry) {
  return `/dreams/${entry.parent_slug}/${entry.slug}/`;
}

function robotsMeta(indexable) {
  return indexable ? "index,follow" : "noindex,follow";
}

function navHtml(current) {
  const dreamsCurrent = current === "dreams" ? ' aria-current="page"' : "";
  return `    <nav class="dm-nav" aria-label="Dream Meaning">
      <a href="/dreams/"${dreamsCurrent}>Dream Meaning</a>
      <a href="/lab/">Lab</a>
      <a href="/#lab-search">Lab Search</a>
    </nav>`;
}

function ctaHtml(kind) {
  const title =
    kind === "lf"
      ? "Map this scenario in the Lab"
      : kind === "hub"
        ? "Had a dream that isn't listed here?"
        : "Work this dream in the Lab";
  const body =
    kind === "hub"
      ? "Paste what you remember into Lab Search — it routes you to the nearest mechanism pages (dream + body), then open Sleep Cycles or the Mapper for the night's timing."
      : "Lab Search matches your wording to mechanism pages. Sleep Cycles times the night. No symbol dictionary.";
  return `    <section class="dm-cta">
      <h2>${esc(title)}</h2>
      <p>${esc(body)}</p>
      <p class="dm-cta-row">
        <a class="dm-btn" href="/#lab-search">Open Lab Search →</a>
        <a class="dm-btn dm-btn--ghost" href="/lab/sleep-cycles/">Sleep Cycles</a>
        <a class="dm-btn dm-btn--ghost" href="/lab/">Lab home</a>
      </p>
    </section>`;
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

function relatedHtml(entry, extras = []) {
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
  for (const x of extras) {
    cards.push(
      `      <a class="dm-related-card" href="${esc(x.href)}"><span class="dm-related-card__eyebrow">${esc(x.eyebrow)}</span><span class="dm-related-card__label">${esc(x.label)}</span></a>`
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

function siblingsHtml(siblings, parentTitle) {
  if (!siblings.length) return "";
  const links = siblings
    .map((s) => `      <a class="dm-sibling" href="${esc(lfPath(s))}">${esc(s.title)}</a>`)
    .join("\n");
  return `    <section class="dm-siblings" aria-label="More scenarios">
      <h2>More ${esc(parentTitle)} scenarios</h2>
      <div class="dm-sibling-grid">
${links}
      </div>
    </section>`;
}

function pillarChildrenHtml(children) {
  if (!children.length) return "";
  const links = children
    .map((s) => `      <a class="dm-sibling" href="${esc(lfPath(s))}">${esc(s.title)}</a>`)
    .join("\n");
  return `    <section class="dm-siblings" aria-label="Scenario pages">
      <h2>Scenario pages</h2>
      <div class="dm-sibling-grid">
${links}
      </div>
    </section>`;
}

function jsonLdPillar(entry) {
  const url = pillarUrl(entry);
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

function jsonLdLf(entry, parent) {
  const url = lfUrl(entry);
  const parentTitle = parent?.title || entry.parent_slug;
  const parentHref = `${SITE}/dreams/${entry.parent_slug}/`;
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
        { "@type": "ListItem", position: 3, name: parentTitle, item: parentHref },
        { "@type": "ListItem", position: 4, name: entry.title, item: url },
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

function pageHtmlPillar(entry, children) {
  const url = pillarUrl(entry);
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
  ${jsonLdPillar(entry)}
  </script>
</head>
<body class="dm-body">
  <header class="dm-top">
    <a class="dm-brand" href="/">Oneirox</a>
${navHtml("pillar")}
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
${pillarChildrenHtml(children)}

    <section class="dm-morning" aria-label="Morning prompt">
      <h2>MORNING — what to ask yourself</h2>
      <p>${esc(entry.morning_prompt)}</p>
    </section>

${ctaHtml("pillar")}
${relatedHtml(entry)}

    <p class="dm-disclaimer">Educational neuroscience and dream-research synthesis. Not medical or psychological advice. Persistent nightmares, panic, or distress deserve a conversation with a clinician.</p>
  </main>
  <footer class="dm-foot">
    <a href="/dreams/">Dream Meaning</a> · <a href="/mechanics/rem/">REM mechanics</a> · <a href="/somatic/">Somatic utilities</a> · <a href="/#lab-search">Lab Search</a>
  </footer>
</body>
</html>
`;
}

function pageHtmlLf(entry, parent, siblings) {
  const url = lfUrl(entry);
  const parentTitle = parent?.title || entry.parent_slug;
  const parentPath = `/dreams/${entry.parent_slug}/`;
  const extras = [
    { href: parentPath, eyebrow: "Pillar", label: parentTitle },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>${esc(entry.meta_title)}</title>
  <meta name="description" content="${esc(entry.meta_description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="${robotsMeta(!!entry.indexable)}">
  <link rel="stylesheet" href="/css/fonts.css">
  <link rel="stylesheet" href="/dreams/assets/dream-meaning.css">
  <script type="application/ld+json">
  ${jsonLdLf(entry, parent)}
  </script>
</head>
<body class="dm-body">
  <header class="dm-top">
    <a class="dm-brand" href="/">Oneirox</a>
${navHtml("lf")}
  </header>
  <main class="dm-main">
    <p class="dm-breadcrumb"><a href="/">Oneirox</a> · <a href="/dreams/">Dream Meaning</a> · <a href="${esc(parentPath)}">${esc(parentTitle)}</a> · ${esc(entry.title)}</p>
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
${siblingsHtml(siblings, parentTitle)}

    <section class="dm-morning" aria-label="Morning prompt">
      <h2>MORNING — what to ask yourself</h2>
      <p>${esc(entry.morning_prompt)}</p>
    </section>

${ctaHtml("lf")}
${relatedHtml(entry, extras)}

    <p class="dm-disclaimer">Educational neuroscience and dream-research synthesis. Not medical or psychological advice. Persistent nightmares, panic, or distress deserve a conversation with a clinician.</p>
  </main>
  <footer class="dm-foot">
    <a href="/dreams/">Dream Meaning</a> · <a href="${esc(parentPath)}">${esc(parentTitle)}</a> · <a href="/#lab-search">Lab Search</a> · <a href="/lab/">Lab</a>
  </footer>
</body>
</html>
`;
}

const CATEGORY_ORDER = [
  "Body & appearance",
  "Threat & anxiety",
  "People & relationships",
  "Situational stress",
  "Places & symbols",
  "Meta & educational",
];

function hubHtml(entries, lfByParent) {
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
        .map((e) => {
          const kids = lfByParent.get(e.slug) || [];
          const kidNote = kids.length
            ? `<span class="dm-hub-card__meta">${kids.length} scenario pages</span>`
            : "";
          return `      <a class="dm-hub-card" href="/dreams/${e.slug}/"><span class="dm-hub-card__title">${esc(e.title)}</span>${kidNote}</a>`;
        })
        .join("\n");
      return `    <section class="dm-hub-group" aria-label="${esc(cat)}">
      <h2>${esc(cat)}</h2>
      <div class="dm-hub-grid">
${cards}
      </div>
    </section>`;
    })
    .join("\n");

  const lfCount = [...lfByParent.values()].reduce((n, a) => n + a.length, 0);
  const url = `${SITE}/dreams/`;
  const ld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Oneirox Dream Meaning Library",
    url,
    numberOfItems: entries.length + lfCount,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>Dream Meaning Library — Mechanism, Not Superstition | Oneirox</title>
  <meta name="description" content="What ${entries.length} of the most-searched dreams actually mean, plus scenario pages explained through REM neuroscience — teeth, chase, snakes, sleep paralysis, and more.">
  <link rel="canonical" href="${url}">
  <link rel="stylesheet" href="/css/fonts.css">
  <link rel="stylesheet" href="/dreams/assets/dream-meaning.css">
  <script type="application/ld+json">${ld}</script>
</head>
<body class="dm-body">
  <header class="dm-top">
    <a class="dm-brand" href="/">Oneirox</a>
${navHtml("dreams")}
  </header>
  <main class="dm-main">
    <p class="dm-kicker">Dream symbol library — mechanism-first</p>
    <h1 class="dm-title">What your dream is actually doing</h1>
    <p class="dm-lead dm-hub-lead">${entries.length} pillar themes and ${lfCount} scenario pages, each explained through the specific REM mechanism behind it — memory consolidation, threat simulation, autonomic arousal, atonia — instead of a fixed symbol dictionary. Pick the dream you actually had.</p>

${groups}

${ctaHtml("hub")}
  </main>
  <footer class="dm-foot">
    <a href="/mechanics/rem/">REM mechanics</a> · <a href="/somatic/">Somatic utilities</a> · <a href="/#lab-search">Lab Search</a>
  </footer>
</body>
</html>
`;
}

function writeSitemap(pillars, lfIndexable) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE}/dreams/`, priority: "0.9" },
    ...pillars.map((e) => ({ loc: pillarUrl(e), priority: "0.85" })),
    ...lfIndexable.map((e) => ({ loc: lfUrl(e), priority: "0.75" })),
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

function writeDreamAllowlist(pillars, lfIndexable) {
  const urls = [
    `${SITE}/dreams/`,
    ...pillars.map((e) => pillarUrl(e)),
    ...lfIndexable.map((e) => lfUrl(e)),
  ];
  fs.writeFileSync(
    path.join(PSEO, "data", "dream-allowlist.json"),
    JSON.stringify({ generated_at: new Date().toISOString(), urls }, null, 2)
  );
  return urls.length;
}

function selectLfIndexable(lfEntries, pillarMap) {
  const baseCount = 1 + pillarMap.size; // hub + pillars
  const lfCap = Math.max(0, DREAM_INDEX_CAP - baseCount);
  const candidates = lfEntries.filter((e) => e.indexable && pillarMap.has(e.parent_slug));
  if (candidates.length <= lfCap) return candidates;

  const byParent = new Map();
  for (const lf of candidates) {
    if (!byParent.has(lf.parent_slug)) byParent.set(lf.parent_slug, []);
    byParent.get(lf.parent_slug).push(lf);
  }

  const picked = [];
  const seen = new Set();

  // First pass: keep breadth across pillars before depth within one pillar.
  for (const [parent, list] of byParent) {
    if (picked.length >= lfCap) break;
    const lf = list[0];
    picked.push(lf);
    seen.add(`${parent}/${lf.slug}`);
  }

  // Second pass: fill remaining slots in original matrix order.
  for (const lf of candidates) {
    if (picked.length >= lfCap) break;
    const key = `${lf.parent_slug}/${lf.slug}`;
    if (seen.has(key)) continue;
    picked.push(lf);
    seen.add(key);
  }

  return picked;
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

  const lfRaw = fs.existsSync(LF_MATRIX)
    ? JSON.parse(fs.readFileSync(LF_MATRIX, "utf8"))
    : { entries: [] };
  const lfEntries = lfRaw.entries || [];
  const pillarMap = new Map(entries.map((e) => [e.slug, e]));
  const lfByParent = new Map();
  for (const lf of lfEntries) {
    if (!lfByParent.has(lf.parent_slug)) lfByParent.set(lf.parent_slug, []);
    lfByParent.get(lf.parent_slug).push(lf);
  }
  for (const [, list] of lfByParent) {
    list.sort((a, b) => a.slug.localeCompare(b.slug));
  }
  const lfIndexable = selectLfIndexable(lfEntries, pillarMap);
  const lfIndexableSet = new Set(lfIndexable.map((e) => `${e.parent_slug}/${e.slug}`));

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

  // Optional sibling-grid styles if missing from CSS — append lightly via existing classes when possible
  const cssPath = path.join(OUT_DIR, "assets", "dream-meaning.css");
  let css = fs.readFileSync(cssPath, "utf8");
  if (!css.includes(".dm-sibling-grid")) {
    css += `

.dm-sibling-grid {
  display: grid;
  gap: 0.6rem;
  margin-top: 0.75rem;
}
.dm-sibling {
  display: block;
  padding: 0.65rem 0;
  border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  text-decoration: none;
  color: inherit;
}
.dm-sibling:hover { opacity: 0.85; }
.dm-hub-card { display: flex; flex-direction: column; gap: 0.25rem; }
.dm-hub-card__meta { font-size: 0.85rem; opacity: 0.7; }
.dm-cta-row { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
.dm-btn--ghost {
  background: transparent;
  border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
}
`;
    fs.writeFileSync(cssPath, css);
    fs.writeFileSync(path.join(PSEO, "assets", "dream-meaning.css"), css);
  }

  for (const entry of entries) {
    const children = lfByParent.get(entry.slug) || [];
    const dir = path.join(OUT_DIR, entry.slug);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, "index.html"), pageHtmlPillar(entry, children));
  }

  let lfWritten = 0;
  for (const lf of lfEntries) {
    const parent = pillarMap.get(lf.parent_slug);
    if (!parent) {
      console.warn("LF parent missing, skip", lf.parent_slug, lf.slug);
      continue;
    }
    const siblings = (lfByParent.get(lf.parent_slug) || []).filter(
      (s) => s.slug !== lf.slug
    );
    const dir = path.join(OUT_DIR, lf.parent_slug, lf.slug);
    ensureDir(dir);
    fs.writeFileSync(
      path.join(dir, "index.html"),
      pageHtmlLf(
        { ...lf, indexable: lfIndexableSet.has(`${lf.parent_slug}/${lf.slug}`) },
        parent,
        siblings
      )
    );
    lfWritten++;
  }

  fs.writeFileSync(path.join(OUT_DIR, "index.html"), hubHtml(entries, lfByParent));

  const sm = writeSitemap(entries, lfIndexable);
  const al = writeDreamAllowlist(entries, lfIndexable);

  console.log(
    `Dream Meaning SSG: ${entries.length} pillars · ${lfWritten} LF · sitemap ${sm} · allowlist ${al} · indexable LF ${lfIndexable.length}`
  );
}

main();
