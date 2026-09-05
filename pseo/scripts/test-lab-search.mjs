/**
 * Lab Search regression tests (ranking + browser form behavior).
 * Usage: node pseo/scripts/test-lab-search.mjs
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC = path.join(ROOT, "public");
const idx = JSON.parse(fs.readFileSync(path.join(PUBLIC, "data/lab-search-index.json"), "utf8"));

function loadRanker() {
  const src = fs.readFileSync(path.join(PUBLIC, "js/lab-search.js"), "utf8");
  const sandbox = {
    console,
    document: { readyState: "complete", querySelectorAll: () => [], addEventListener() {} },
    window: {},
    globalThis: {},
    fetch: () => Promise.resolve({ ok: true, json: async () => idx }),
    setTimeout,
    clearTimeout,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  const api = sandbox.__ONX_LAB_SEARCH__;
  if (!api) throw new Error("Lab Search test hook missing");
  return {
    run(q) {
      const sig = api.extractSignals(q);
      return api.rankResults(idx.docs, sig);
    },
  };
}

function assertTop(ranker, q, expectHref, label) {
  const hits = ranker.run(q);
  const top = hits[0]?.doc?.href;
  if (top !== expectHref) {
    throw new Error(
      `${label || q}: expected ${expectHref}, got ${top || "(empty)"} · ` +
        JSON.stringify(hits.slice(0, 3).map((h) => ({ href: h.doc.href, score: h.score })))
    );
  }
}

function assertEmpty(ranker, q) {
  const hits = ranker.run(q);
  if (hits.length) {
    throw new Error(`expected no match for “${q}”, got ${hits[0].doc.href}`);
  }
}

function validateIndexDestinations() {
  let broken = 0;
  const samples = [];
  for (const d of idx.docs) {
    const href = d.href;
    if (!href || href.includes("wp-") || href.includes("/ru/")) {
      broken++;
      samples.push(href);
      continue;
    }
    const file = path.join(PUBLIC, href.replace(/^\//, ""), "index.html");
    const fileAlt = path.join(PUBLIC, href.replace(/^\//, "").replace(/\/$/, "") + ".html");
    if (!fs.existsSync(file) && !fs.existsSync(fileAlt)) {
      broken++;
      if (samples.length < 12) samples.push(href);
    }
  }
  if (broken) throw new Error(`index broken destinations: ${broken} e.g. ${samples.join(", ")}`);
}

async function staticServer() {
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".png": "image/png",
  };
  const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    if (urlPath.endsWith("/")) urlPath += "index.html";
    if (urlPath === "/") urlPath = "/index.html";
    const file = path.join(PUBLIC, urlPath.replace(/^\//, ""));
    if (!file.startsWith(PUBLIC) || !fs.existsSync(file)) {
      res.writeHead(404);
      res.end("missing");
      return;
    }
    res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}

async function browserTests() {
  const { server, base } = await staticServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/", { waitUntil: "networkidle" });

  async function search(q, how) {
    await page.fill("#lab-search-input", q);
    const before = await page.evaluate(() => ({
      y: document.querySelector("#lab-search-input").getBoundingClientRect().y,
      scrollY: window.scrollY,
    }));
    if (how === "enter") {
      await page.focus("#lab-search-input");
      await page.keyboard.press("Enter");
    } else {
      await page.click("[data-lab-search-run]");
    }
    await page.waitForTimeout(900);
    const after = await page.evaluate(() => {
      const box = document.querySelector("[data-lab-search-results]");
      const a = box.querySelector(".onx-lab-search__hit-title a");
      const empty = box.querySelector(".onx-lab-search__empty");
      const btn = document.querySelector("[data-lab-search-run]");
      return {
        hidden: box.hidden,
        href: a && a.getAttribute("href"),
        empty: !!(empty && empty.textContent),
        emptyText: empty ? empty.textContent.trim().slice(0, 120) : "",
        cta: box.textContent.includes("Open result"),
        btnBusy: btn.disabled,
        btnText: btn.textContent.trim(),
        hasLive: box.getAttribute("aria-live") === "polite",
        inputFocused: document.activeElement === document.querySelector("#lab-search-input"),
        inputY: document.querySelector("#lab-search-input").getBoundingClientRect().y,
        scrollY: window.scrollY,
      };
    });
    return { ...after, before };
  }

  const clickSnake = await search("dream about snake", "click");
  if (clickSnake.href !== "/dreams/snakes/") {
    throw new Error("click dream about snake → " + clickSnake.href);
  }
  if (!clickSnake.cta || clickSnake.hidden || !clickSnake.hasLive) {
    throw new Error("click UX incomplete " + JSON.stringify(clickSnake));
  }
  if (clickSnake.inputY !== clickSnake.before.y || clickSnake.scrollY !== clickSnake.before.scrollY) {
    throw new Error("click changed input position or page scroll " + JSON.stringify(clickSnake));
  }

  const enterBite = await search("snake bit me", "enter");
  if (enterBite.href !== "/dreams/snakes/bitten/") {
    throw new Error("enter snake bit me → " + enterBite.href);
  }
  if (!enterBite.inputFocused || enterBite.inputY !== enterBite.before.y || enterBite.scrollY !== enterBite.before.scrollY) {
    throw new Error("enter changed input position or focus " + JSON.stringify(enterBite));
  }

  await page.fill("#lab-search-input", "a");
  await page.focus("#lab-search-input");
  await page.keyboard.down("Shift");
  await page.keyboard.press("Enter");
  await page.keyboard.up("Shift");
  const shiftVal = await page.evaluate(() => document.querySelector("#lab-search-input").value);
  if (!shiftVal.includes("\n")) throw new Error("Shift+Enter did not insert newline");

  const unknown = await search("asdf qwerty zxcvbnm nomatchxyz123", "click");
  if (!unknown.empty || !/No strong match/i.test(unknown.emptyText)) {
    throw new Error("unknown should fallback, got " + JSON.stringify(unknown));
  }
  if (unknown.btnBusy) throw new Error("button stuck disabled");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  const mobile = await search("dream about snake", "enter");
  if (mobile.href !== "/dreams/snakes/") throw new Error("mobile snake → " + mobile.href);
  const mobileLayout = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    inputY: document.querySelector("#lab-search-input").getBoundingClientRect().y,
  }));
  if (mobileLayout.overflow || mobileLayout.inputY !== mobile.before.y || mobile.scrollY !== mobile.before.scrollY) {
    throw new Error("mobile layout shifted " + JSON.stringify({ mobile, mobileLayout }));
  }

  await browser.close();
  server.close();
  if (errors.length) throw new Error("page errors: " + errors.join("; "));
}

const ranker = loadRanker();
validateIndexDestinations();
assertTop(ranker, "dream about snake", "/dreams/snakes/");
assertTop(ranker, "snake bit me", "/dreams/snakes/bitten/");
assertTop(ranker, "snake in my bed", "/dreams/snakes/in-bed/");
assertTop(ranker, "teeth falling out with blood", "/dreams/teeth-falling-out/with-blood/");
assertTop(ranker, "someone I know was chasing me", "/dreams/being-chased/known-person/");
assertTop(ranker, "sleep paralysis shadow figure", "/dreams/sleep-paralysis/with-presence/");
assertTop(ranker, "falling asleep then sudden jolt", "/dreams/falling/hypnic-onset-jolt/");
assertTop(ranker, "someone I don't talk to anymore", "/dream-about-someone-you-dont-talk-to-anymore-meaning/");
assertTop(ranker, "my dead father", "/dreams/death-of-a-loved-one/");
assertTop(ranker, "black snake in my house", "/dreams/snakes/");
assertTop(ranker, "dog attacking me", "/dreams/dogs/attacking/");
assertTop(ranker, "late for exam", "/dreams/exam-anxiety-dreams/");
assertTop(ranker, "my ex texted me", "/dream-about-someone-texting-you-meaning/");
assertTop(ranker, "snkae in house", "/dreams/snakes/");
assertEmpty(ranker, "asdf qwerty zxcvbnm nomatchxyz123");

const requiredQueries = [
  "someone close to me",
  "someone I don't talk to anymore",
  "my dead father",
  "black snake in my house",
  "dog attacking me",
  "late for exam",
  "my ex texted me",
  "snkae in house",
];
for (const query of requiredQueries) {
  const href = ranker.run(query)[0]?.doc?.href;
  if (!href) throw new Error(`required query returned no result: ${query}`);
  console.log(`${query} => ${href}`);
}
await browserTests();
console.log("Lab Search tests OK");
