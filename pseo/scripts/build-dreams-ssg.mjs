/**
 * Dream Meaning PSEO vertical — SSG builder.
 * Pillars: public/dreams/{slug}/
 * LF children: public/dreams/{parent}/{slug}/
 * Content: dream-meaning-matrix.json + dream-lf-matrix.json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expandDreamLongform, loadGoldBodyHtml } from "../lib/expand-dream-prose.mjs";
import {
  writeRobotsTxt,
  writeAllowlistIfChanged,
  stableLastmod,
  flushLastmodStore,
  sitemapUrlXml,
  relForTarget,
  pullAllowlistUrls,
  pathnameOf,
  isFollowableSomaticPath,
} from "../lib/crawl-budget.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PSEO = path.resolve(__dirname, "..");
const MATRIX = path.join(PSEO, "data", "dream-meaning-matrix.json");
const LF_MATRIX = path.join(PSEO, "data", "dream-lf-matrix.json");
const OUT_DIR = path.join(ROOT, "public", "dreams");
const SITE = "https://oneirox.com";
const PUBLISHED = "2026-08-16";
const DREAM_INDEX_CAP = 50;

let somaticFollowable = new Set();

// Curated historical restorations whose intent is broader or distinct from a
// generated scenario. Keep these links small and attached only to the hub that
// gives the reader useful next reading.
const RESTORED_BY_PILLAR = {
  "recurring-dreams": [
    { href: "/dreaming-about-someone-you-havent-seen-in-years/", label: "Dreaming About Someone You Haven't Seen in Years" },
  ],
  snakes: [
    { href: "/dream-about-big-snake-meaning-interpretation/", label: "Dream About a Big Snake" },
  ],
  dogs: [
    { href: "/dream-about-a-dog-in-your-house/", label: "Dream About a Dog in Your House" },
    { href: "/dream-about-saving-a-dog/", label: "Dream About Saving a Dog" },
  ],
};

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

/** Safe inline links: [anchor](/dreams/.../) or /somatic/ /mechanics/ only. */
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

function sortChildrenForFarm(children) {
  const list = [...(children || [])];
  list.sort((a, b) => {
    const ai = a.indexable ? 0 : 1;
    const bi = b.indexable ? 0 : 1;
    if (ai !== bi) return ai - bi;
    return String(a.slug).localeCompare(String(b.slug));
  });
  const indexable = list.filter((c) => c.indexable);
  const noindex = list.filter((c) => !c.indexable);
  // Prefer indexable/Gold first. Soft-cap noindex shown (nofollow via relForTarget) — UX without huge lists.
  const NOINDEX_CAP = 6;
  return [...indexable, ...noindex.slice(0, NOINDEX_CAP)];
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
        <p>${inlineMdLinks(v.a)}</p>
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
    const follow = isFollowableSomaticPath(s.href, somaticFollowable);
    cards.push(
      `      <a class="dm-related-card" href="${esc(s.href)}"${follow ? "" : ' rel="nofollow"'}><span class="dm-related-card__eyebrow">Somatic marker</span><span class="dm-related-card__label">${esc(s.label)}</span></a>`
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

function nofollowOffAllowlist(html, somaticFollowable) {
  return String(html).replace(/<a href="(\/somatic\/[^"]+)"/g, (full, href) => {
    if (isFollowableSomaticPath(href, somaticFollowable)) return full;
    return `<a href="${href}" rel="nofollow"`;
  });
}

const GOLD_FORBIDDEN_PHRASES = [
  "start with the body, not the Wikipedia of symbols",
  "The circuit we actually track here",
  "that variant is not a second omen",
  "MORNING for Dream About",
  "foggy plot + loud body",
  "Lab Search should land here because",
  "What's actually happening",
  'class="dm-signal"',
  'dm-signal__tag',
  "Map this scenario in the Lab",
  "MORNING — what to ask yourself",
];

function assertGoldHtmlClean(html, entry) {
  const key = `${entry.parent_slug}/${entry.slug}`;
  const hits = GOLD_FORBIDDEN_PHRASES.filter((p) => html.includes(p));
  if (hits.length) {
    throw new Error(`Gold page ${key} still contains legacy phrases: ${hits.join(" | ")}`);
  }
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) {
    throw new Error(`Gold page ${key} must have exactly one H1`);
  }
  if (!html.includes('class="dm-prose dm-prose--gold"')) {
    throw new Error(`Gold page ${key} missing gold article shell`);
  }
  // Legacy chrome must not appear outside shared header/footer.
  for (const cls of ["dm-signal", "dm-variants", "dm-morning", "dm-cta", "dm-siblings", "dm-related", "dm-lead", "dm-kicker"]) {
    if (html.includes(`class="${cls}`) || html.includes(`class='${cls}`)) {
      throw new Error(`Gold page ${key} still renders legacy chrome .${cls}`);
    }
  }
}

function bodyParagraphsHtml(entry) {
  if (entry.article_mode === "gold") {
    const gold = loadGoldBodyHtml(entry);
    if (!gold || !String(gold).trim()) {
      throw new Error(
        `Gold page ${entry.parent_slug}/${entry.slug} has no custom body (file/html missing)`
      );
    }
    // Never append expandDreamLongform / body_paragraphs on gold pages.
    return nofollowOffAllowlist(gold, somaticFollowable);
  }
  const core = (entry.body_paragraphs || [])
    .map((p) => `      <p>${inlineMdLinks(p)}</p>`)
    .join("\n");
  const extra = expandDreamLongform(entry).html;
  return nofollowOffAllowlist(`${core}\n${extra}`, somaticFollowable);
}

function siblingsHtml(siblings, parentTitle, opts = {}) {
  let list = siblings;
  if (Array.isArray(opts.onlySlugs) && opts.onlySlugs.length) {
    const allow = new Set(opts.onlySlugs);
    list = siblings.filter((s) => allow.has(s.slug));
  }
  list = sortChildrenForFarm(list);
  if (!list.length) return "";
  const heading = opts.heading || `More ${parentTitle} scenarios`;
  const links = list
    .map((s) => `      <a class="dm-sibling" href="${esc(lfPath(s))}"${relForTarget(!!s.indexable)}>${esc(s.title)}</a>`)
    .join("\n");
  return `    <section class="dm-siblings" aria-label="More scenarios">
      <h2>${esc(heading)}</h2>
      <div class="dm-sibling-grid">
${links}
      </div>
    </section>`;
}

function pillarChildrenHtml(children) {
  const list = sortChildrenForFarm(children);
  if (!list.length) return "";
  const links = list
    .map((s) => `      <a class="dm-sibling" href="${esc(lfPath(s))}"${relForTarget(!!s.indexable)}>${esc(s.title)}</a>`)
    .join("\n");
  return `    <section class="dm-siblings" aria-label="Scenario pages">
      <h2>Scenario pages</h2>
      <div class="dm-sibling-grid">
${links}
      </div>
    </section>`;
}

function restoredLinksHtml(entry) {
  const items = RESTORED_BY_PILLAR[entry.slug] || [];
  if (!items.length) return "";
  return `    <section class="dm-siblings" aria-label="Related historical articles">
      <h2>Related scenarios</h2>
      <div class="dm-sibling-grid">
${items.map((item) => `      <a class="dm-sibling" href="${item.href}">${esc(item.label)}</a>`).join("\n")}
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
${restoredLinksHtml(entry)}

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
  if (entry.article_mode === "gold") {
    return pageHtmlLfGold(entry, parent);
  }
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

function pageHtmlLfGold(entry, parent) {
  const url = lfUrl(entry);
  const parentTitle = parent?.title || entry.parent_slug;
  const parentPath = `/dreams/${entry.parent_slug}/`;
  // Gold pages: article body exclusively from gold fragment.
  // No lead / SIGNAL / expand / variants / MORNING / Lab CTA / sibling farm / related cards.
  const html = `<!DOCTYPE html>
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
    <h1 class="dm-title">${esc(entry.title)}</h1>

    <article class="dm-prose dm-prose--gold">
${bodyParagraphsHtml(entry)}
    </article>

    <p class="dm-disclaimer">Educational neuroscience and dream-research synthesis. Not medical or psychological advice. Persistent nightmares, panic, or distress deserve a conversation with a clinician.</p>
  </main>
  <footer class="dm-foot">
    <a href="/dreams/">Dream Meaning</a> · <a href="${esc(parentPath)}">${esc(parentTitle)}</a> · <a href="/lab/">Lab</a>
  </footer>
</body>
</html>
`;
  assertGoldHtmlClean(html, entry);
  return html;
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

    <div class="dm-prose">
      <h2>How this library is built</h2>
      <p>I am Vigen G.R. Oneirox Dream Meaning is not a scraped omen table. Each pillar is a mechanism: teeth pages start in the jaw, chase pages start in atonia plus threat simulation, snakes start in amygdala-biased predator schema, sleep paralysis starts at the REM–wake motor lock. Scenario URLs exist only when the verb changes the circuit (bite vs watch, reject vs reunite), not when the title is a synonym farm. Place-memory deep dives that often need their own circuit: <a href="/dreams/being-chased/known-person/">being chased by a known person</a>, a <a href="/dreams/house-dreams/childhood-house/">childhood house dream</a>, and <a href="/dreams/homeland-and-diaspora/mount-ararat/">Mount Ararat in a dream</a>.</p>
      <p>Counts on this hub: ${entries.length} pillars, ${lfCount} scenario pages. Categories: ${esc(CATEGORY_ORDER.join(", "))}. If your night was mostly body (weight, mute, jerk, heat) and almost no plot, skip this library and open Somatic utilities or the Sensory Dream Mapper. If you have both, Lab Search can route you.</p>
      <p>What we refuse: “snake = enemy,” “teeth = money,” “water = emotion” as fixed equations. What we keep: SIGNAL (what the night was doing), BODY (what you still felt), MORNING (one check you can actually do). Then an instrument. Educational neuroscience — not a diagnosis.</p>
      <p>Pillars currently on this hub: ${entries.map((e) => `${esc(e.title)} (${esc(e.kicker || e.slug)})`).join("; ")}.</p>
    </div>

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
  const urls = [
    { loc: `${SITE}/dreams/`, priority: "0.9", key: `hub:${pillars.map((e) => e.slug).join("|")}` },
    ...pillars.map((e) => ({
      loc: pillarUrl(e),
      priority: "0.85",
      key: `${e.slug}|${e.title}|${e.lead || ""}`,
    })),
    ...lfIndexable.map((e) => ({
      loc: lfUrl(e),
      priority: "0.75",
      key: `${e.parent_slug}/${e.slug}|${e.title}|${e.lead || ""}`,
    })),
  ];
  const body = urls.map((u) => sitemapUrlXml(u.loc, stableLastmod(u.loc, u.key), u.priority)).join("\n");
  fs.writeFileSync(
    path.join(ROOT, "public", "sitemap-dreams.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
  );
  flushLastmodStore();
  return urls.length;
}

function writeDreamAllowlist(pillars, lfIndexable) {
  const urls = [
    `${SITE}/dreams/`,
    ...pillars.map((e) => pillarUrl(e)),
    ...lfIndexable.map((e) => lfUrl(e)),
  ];
  return writeAllowlistIfChanged(path.join(PSEO, "data", "dream-allowlist.json"), urls);
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
  somaticFollowable = new Set(
    pullAllowlistUrls(path.join(PSEO, "data", "indexable-allowlist.json")).map(pathnameOf)
  );

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
    const children = (lfByParent.get(entry.slug) || []).map((c) => ({
      ...c,
      indexable: lfIndexableSet.has(`${c.parent_slug}/${c.slug}`),
    }));
    const dir = path.join(OUT_DIR, entry.slug);
    ensureDir(dir);
    fs.writeFileSync(path.join(dir, "index.html"), pageHtmlPillar(entry, children));
  }

  let lfWritten = 0;
  let goldWritten = 0;
  for (const lf of lfEntries) {
    const parent = pillarMap.get(lf.parent_slug);
    if (!parent) {
      console.warn("LF parent missing, skip", lf.parent_slug, lf.slug);
      continue;
    }
    const siblings = (lfByParent.get(lf.parent_slug) || [])
      .filter((s) => s.slug !== lf.slug)
      .map((s) => ({
        ...s,
        indexable: lfIndexableSet.has(`${s.parent_slug}/${s.slug}`),
      }));
    const dir = path.join(OUT_DIR, lf.parent_slug, lf.slug);
    ensureDir(dir);
    const rendered = pageHtmlLf(
      { ...lf, indexable: lfIndexableSet.has(`${lf.parent_slug}/${lf.slug}`) },
      parent,
      siblings
    );
    fs.writeFileSync(path.join(dir, "index.html"), rendered);
    if (lf.article_mode === "gold") {
      // Re-assert from disk so generated HTML — not only in-memory string — is gated.
      assertGoldHtmlClean(fs.readFileSync(path.join(dir, "index.html"), "utf8"), lf);
      goldWritten++;
    }
    lfWritten++;
  }

  fs.writeFileSync(path.join(OUT_DIR, "index.html"), hubHtml(entries, lfByParent));

  const sm = writeSitemap(entries, lfIndexable);
  const al = writeDreamAllowlist(entries, lfIndexable);
  writeRobotsTxt();

  console.log(
    `Dream Meaning SSG: ${entries.length} pillars · ${lfWritten} LF · gold ${goldWritten} · sitemap ${sm} · allowlist ${al} · indexable LF ${lfIndexable.length}`
  );
}

main();
