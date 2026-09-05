import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicDir = path.join(root, "public");
const slugs = [
  "dreaming-about-someone-you-havent-seen-in-years",
  "dream-about-someone-texting-you-meaning",
  "dream-about-someone-you-dont-talk-to-anymore-meaning",
  "dream-about-big-snake-meaning-interpretation",
  "dream-about-a-dog-in-your-house",
  "dream-about-someone-confessing-love-meaning",
  "dream-about-someone-ignoring-you-meaning",
  "dream-about-saving-a-dog",
  "dream-about-head-injury-meaning",
  "dream-about-someone-helping-you-meaning",
];
const restoredRedirects = new Set([
  "/dreaming-about-someone-you-havent-seen-in-years/",
  "/dream-about-big-snake-meaning-interpretation/",
]);
const redirects = fs.readFileSync(path.join(publicDir, "_redirects"), "utf8");
const sitemap = fs.readFileSync(path.join(publicDir, "sitemap-core.xml"), "utf8");
const failures = [];

for (const slug of slugs) {
  const url = `https://oneirox.com/${slug}/`;
  const file = path.join(publicDir, slug, "index.html");
  if (!fs.existsSync(file)) {
    failures.push(`${slug}: missing static page`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  if ((html.match(/<h1\b/gi) || []).length !== 1) failures.push(`${slug}: expected one H1`);
  if ((html.match(/<link\s+rel="canonical"/gi) || []).length !== 1 || !html.includes(`href="${url}"`)) {
    failures.push(`${slug}: missing self-canonical`);
  }
  if (!html.includes('name="robots" content="index,follow"')) failures.push(`${slug}: not index,follow`);
  if (!/<title>[^<]+<\/title>/i.test(html)) failures.push(`${slug}: missing title`);
  if (!/<meta\s+name="description"\s+content="[^"]+">/i.test(html)) failures.push(`${slug}: missing description`);
  if (!html.includes('<div class="dm-prose dm-prose--gold">')) failures.push(`${slug}: missing static article body`);
  if (!sitemap.includes(`<loc>${url}</loc>`)) failures.push(`${slug}: absent from core sitemap`);
}

for (const source of restoredRedirects) {
  if (new RegExp(`^${source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m").test(redirects)) {
    failures.push(`${source}: redirect remains`);
  }
}

const expectedInbound = [
  ["dreams/recurring-dreams/index.html", "/dreaming-about-someone-you-havent-seen-in-years/"],
  ["dreams/snakes/index.html", "/dream-about-big-snake-meaning-interpretation/"],
  ["dreams/dogs/index.html", "/dream-about-a-dog-in-your-house/"],
  ["dreams/dogs/index.html", "/dream-about-saving-a-dog/"],
];
for (const [file, href] of expectedInbound) {
  const html = fs.readFileSync(path.join(publicDir, file), "utf8");
  if (!html.includes(`href="${href}"`)) failures.push(`${file}: missing contextual link to ${href}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Historical restores OK: ${slugs.length} pages`);
