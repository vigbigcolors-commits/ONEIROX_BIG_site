/**
 * Deterministically render reviewed REM mechanics source into public output.
 * Usage: node pseo/scripts/build-rem-mechanics.mjs [--check]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SOURCE = path.join(ROOT, "content", "mechanics", "rem.json");
const ASSET_SOURCE = path.join(ROOT, "pseo", "assets");
const OUT = path.join(ROOT, "public", "mechanics");
const check = process.argv.includes("--check");

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function links(items) {
  return items
    .map((link) => `        <li><a href="${esc(link.href)}">${esc(link.label)}</a></li>`)
    .join("\n");
}

function cta(page) {
  const links = page.cta.links
    .map((link) => {
      const style = link.style ? ` style="${esc(link.style)}"` : "";
      return `      <a class="rm-btn" href="${esc(link.href)}"${style}>${esc(link.label)}</a>`;
    })
    .join("\n");
  return `    <section class="rm-cta">
      <h2>${page.cta.heading}</h2>
      <p>${page.cta.body}</p>
${links}
    </section>`;
}

export function renderRemMechanicsPage(page) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.json_ld_headline,
    url: page.canonical,
    datePublished: page.date_published,
    dateModified: page.date_modified,
    author: { "@type": "Person", name: page.author },
  };
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>${esc(page.title)} | Oneirox</title>
  <meta name="description" content="${esc(page.meta_description)}">
  <link rel="canonical" href="${esc(page.canonical)}">
  <meta name="robots" content="${esc(page.robots)}">
  <link rel="stylesheet" href="/css/fonts.css">
  <link rel="stylesheet" href="/mechanics/assets/rem-mechanics.css">
  <script type="application/ld+json">
  ${JSON.stringify(jsonLd)}
  </script>
</head>
${page.body_prefix_html}
    <p class="rm-kicker">${page.kicker}</p>
    <h1 class="rm-title">${page.h1}</h1>
    <p class="rm-lead">${page.lead}</p>
${page.content_html}
${cta(page)}
    <aside class="rm-related">
      <h2>${page.related_heading}</h2>
      <ul>
${links(page.related_navigation_links)}
${links(page.mechanics_links)}
${links(page.somatic_relationships)}
      </ul>
    </aside>
    <p class="rm-disclaimer">${page.disclaimer}</p>${page.body_suffix_html}`;
  if (html.includes("AUTO-UTILITY-LINKS") || /{{[^}]+}}/.test(html)) {
    throw new Error(`Unresolved mechanics output token for ${page.slug}`);
  }
  return html;
}

function assertRendered(page, html) {
  const allLinks = [
    ...(page.related_navigation_links || []),
    ...(page.mechanics_links || []),
    ...(page.somatic_relationships || []),
    ...(page.cta?.links || []),
  ];
  for (const link of allLinks) {
    if (!html.includes(`href="${esc(link.href)}"`)) {
      throw new Error(`Missing rendered link for ${page.slug}: ${link.href}`);
    }
  }
  if ((html.match(/<h1\b/g) || []).length !== 1) throw new Error(`Expected one H1 for ${page.slug}`);
  if ((html.match(new RegExp(esc(page.disclaimer), "g")) || []).length !== 1) {
    throw new Error(`Expected one disclaimer for ${page.slug}`);
  }
}

function main() {
  const source = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
  const rendered = source.pages.map((page) => ({ page, html: renderRemMechanicsPage(page) }));
  rendered.forEach(({ page, html }) => assertRendered(page, html));
  if (check) {
    for (const { page, html } of rendered) {
      console.log(`CHECK ${page.slug}: ${html.length} bytes`);
    }
    return;
  }
  fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
  for (const name of ["rem-mechanics.css", "rem-mechanics.js"]) {
    fs.copyFileSync(path.join(ASSET_SOURCE, name), path.join(OUT, "assets", name));
  }
  for (const { page, html } of rendered) {
    const target = path.join(OUT, "rem", page.slug, "index.html");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html);
    console.log(`Wrote ${path.relative(ROOT, target)}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
