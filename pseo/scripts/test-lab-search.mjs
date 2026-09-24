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
const somaticAllowlist = new Set(
  JSON.parse(fs.readFileSync(path.join(ROOT, "pseo/data/indexable-allowlist.json"), "utf8"))
    .urls
);

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


function runQualityBenchmark(ranker) {
  const cases = [
    ["dream","top1","snake bit me",["/dreams/snakes/bitten/"]],
    ["dream","top1","snake in my bed",["/dreams/snakes/in-bed/"]],
    ["dream","top1","I saw a dead snake",["/dreams/snakes/dead-snake/"]],
    ["dream","top1","coiled snake staring at me",["/dreams/snakes/coiled-watching/"]],
    ["dream","top1","dream about snakes",["/dreams/snakes/"]],
    ["dream","top1","my teeth fell out and there was blood",["/dreams/teeth-falling-out/with-blood/"]],
    ["dream","top1","dream about teeth falling out",["/dreams/teeth-falling-out/"]],
    ["dream","top1","someone I know was chasing me",["/dreams/being-chased/known-person/"]],
    ["dream","top1","a dog attacked me in my dream",["/dreams/dogs/attacking/"]],
    ["dream","top1","a cat attacked me",["/dreams/cats/attacking/"]],
    ["dream","top1","I was late for my exam",["/dreams/exam-anxiety-dreams/"]],
    ["dream","top1","I dreamed about my childhood house",["/dreams/house-dreams/childhood-house/"]],
    ["dream","top1","I dreamed about my dead father",["/dreams/death-of-a-loved-one/"]],
    ["dream","top1","my ex texted me in a dream",["/dream-about-someone-texting-you-meaning/"]],
    ["dream","top1","sleep paralysis with a shadow figure in my room",["/dreams/sleep-paralysis/with-presence/"]],
    ["dream","top1","I was falling asleep and suddenly jerked awake",["/dreams/falling/hypnic-onset-jolt/"]],
    ["dream","top1","dream about Mount Ararat",["/dreams/homeland-and-diaspora/mount-ararat/"]],
    ["dream","top1","I was drowning in my dream",["/dreams/water-and-drowning/drowning/"]],
    ["dream","top1","I was naked at work",["/dreams/naked-in-public/workplace/"]],
    ["dream","top1","I was late and missed my flight",["/dreams/being-late/missed-flight/"]],
    ["dream","top1","same nightmare repeating again and again",["/dreams/recurring-dreams/nightmare-loop/"]],
    ["dream","top1","left at the altar in my wedding dream",["/dreams/wedding-and-marriage/left-at-altar/"]],
    ["dream","top1","debt was chasing me",["/dreams/money-and-wealth/debt-chase/"]],
    ["dream","top1","cameras were watching me",["/dreams/being-watched/cameras/"]],
    ["dream","top1","I was pregnant and giving birth",["/dreams/being-pregnant/giving-birth/"]],
    ["dream","top1","I dreamed about a puppy",["/dreams/dogs/puppy/"]],
    ["dream","top1","there was a cat inside my house",["/dreams/cats/inside-house/"]],
    ["dream","top1","I was in the basement of a strange house",["/dreams/house-dreams/basement/"]],
    ["dream","top1","I reunited with my ex",["/dreams/ex-partner/reunion/"]],
    ["dream","top1","I couldn't write anything during my exam",["/dreams/exam-anxiety-dreams/cant-write/"]],

    ["somatic","top1","sleep paralysis awakening",["/somatic/sleep-paralysis-onset/rem/awakening/"]],
    ["somatic","top1","hypnic jerk at sleep onset",["/somatic/hypnic-jerk/n1/onset/"]],
    ["somatic","top1","loud bang in my head while falling asleep",["/somatic/exploding-head-sensory-burst/n1/onset/"]],
    ["somatic","top1","hypnopompic body sensations while waking",["/somatic/hypnopompic-somatic-surge/rem/awakening/"]],
    ["somatic","top1","periodic limb movements during sleep",["/somatic/periodic-limb-movement/n2/fragmentation/"]],
    ["somatic","top1","sleep bruxism jaw grinding during sleep",["/somatic/sleep-related-bruxism/n2/mid-cycle/"]],
    ["somatic","top1","confusional arousal from N3 sleep",["/somatic/n3-confusional-arousal-motor/n3/awakening/"]],
    ["somatic","top1","heart racing as I fall asleep tachycardia",["/somatic/hypnagogic-tachycardia/n1/onset/"]],
    ["somatic","top1","breathing pause as I fall asleep",["/somatic/sleep-onset-apnea-like-pause/n1/onset/"]],
    ["somatic","top1","REM sleep without atonia",["/somatic/rem-atonia-failure/rem/mid-cycle/"]],
    ["somatic","top1","fragmented REM repeated awakenings",["/somatic/fragmented-rem/rem/fragmentation/"]],

    ["typo","top1","snkae bit me",["/dreams/snakes/bitten/"]],
    ["typo","top1","dag attacking me",["/dreams/dogs/attacking/"]],
    ["typo","top1","deaad father in my dream",["/dreams/death-of-a-loved-one/"]],
    ["typo","top1","my childhood hosue",["/dreams/house-dreams/childhood-house/"]],
    ["typo","top1","my ex sent a mesage",["/dream-about-someone-texting-you-meaning/"]],
    ["typo","top1","late for exma",["/dreams/exam-anxiety-dreams/"]],

    ["natural","top3","my jaw was sore when I woke after dreaming my teeth broke",[
      "/somatic/sleep-related-bruxism/n2/mid-cycle/",
      "/dreams/teeth-falling-out/"
    ]],
    ["natural","top3","I couldn't move when I woke and there was a shadow in the room",[
      "/somatic/sleep-paralysis-onset/rem/awakening/",
      "/dreams/sleep-paralysis/with-presence/"
    ]],
    ["natural","top3","I woke from a vivid dream with my heart racing",[
      "/somatic/hypnopompic-somatic-surge/rem/awakening/",
      "/somatic/hypnagogic-tachycardia/n1/onset/"
    ]],
    ["natural","top3","I kept waking all night and remembered separate pieces of dreams",[
      "/somatic/fragmented-rem/rem/fragmentation/"
    ]],
    ["natural","top3","someone chased me but my legs would not move",[
      "/dreams/being-chased/legs-wont-move/",
      "/dreams/being-chased/"
    ]],
    ["natural","top3","an elevator dropped and I woke with a sudden jolt",[
      "/dreams/falling/elevator-drop/",
      "/dreams/falling/hypnic-onset-jolt/"
    ]],
    ["natural","top3","my Armenian grandmother was with me in Armenia",[
      "/dreams/homeland-and-diaspora/armenian-grandmother/",
      "/dreams/homeland-and-diaspora/"
    ]],
    ["natural","top3","there was a black snake somewhere inside my house",[
      "/dreams/snakes/in-house/",
      "/dreams/snakes/"
    ]],

    ["empty","empty","how do I cook pasta",[]],
    ["empty","empty","weather tomorrow in London",[]],
    ["empty","empty","cheap car insurance quote",[]],
    ["empty","empty","javascript sorting algorithm",[]],
    ["empty","empty","football score tonight",[]],
    ["empty","empty","asdf qwerty zxcvbnm nomatchxyz123",[]],
  ].map(([group, mode, q, accept]) => ({ group, mode, q, accept }));

  if (cases.length !== 61) {
    throw new Error(`Lab Search benchmark definition drift: ${cases.length} cases`);
  }

  const hrefs = new Set(idx.docs.map((doc) => doc.href));
  const targetMissing = [];

  for (const test of cases) {
    for (const href of test.accept) {
      if (!hrefs.has(href)) targetMissing.push(`${href} <= ${test.q}`);
    }
  }

  if (targetMissing.length) {
    throw new Error(
      "Lab Search benchmark target missing:\n" + targetMissing.join("\n")
    );
  }

  const groups = {};
  const failures = [];
  let passed = 0;

  for (const test of cases) {
    const hits = ranker.run(test.q);
    const top = hits.slice(0, 3).map((hit) => hit.doc?.href || "");

    let pass = false;
    if (test.mode === "empty") {
      pass = hits.length === 0;
    } else if (test.mode === "top1") {
      pass = !!top[0] && test.accept.includes(top[0]);
    } else if (test.mode === "top3") {
      pass = top.some((href) => test.accept.includes(href));
    }

    groups[test.group] ||= { total: 0, pass: 0 };
    groups[test.group].total++;
    if (pass) {
      groups[test.group].pass++;
      passed++;
    } else {
      failures.push({
        group: test.group,
        mode: test.mode,
        q: test.q,
        accept: test.accept,
        top,
      });
    }
  }

  const accuracy = (passed / cases.length) * 100;
  const summary = Object.entries(groups)
    .map(([name, group]) => `${name} ${group.pass}/${group.total}`)
    .join(" · ");

  console.log(
    `Lab Search quality benchmark: ${passed}/${cases.length} ` +
    `(${accuracy.toFixed(1)}%) · ${summary}`
  );

  if (failures.length) {
    for (const failure of failures) {
      console.log(
        `BENCHMARK FAIL [${failure.group}/${failure.mode}] ${failure.q} ` +
        `=> ${failure.top.join(" | ") || "(empty)"} ` +
        `expected ${failure.accept.join(" | ") || "(empty)"}`
      );
    }
  }

  /* Release target is >=95%, but natural-language wins and out-of-domain
     rejection are protected as hard sub-gates. */
  if (accuracy < 95) {
    throw new Error(
      `Lab Search benchmark below 95%: ${passed}/${cases.length} (${accuracy.toFixed(1)}%)`
    );
  }

  for (const groupName of ["natural", "empty"]) {
    const group = groups[groupName];
    if (!group || group.pass !== group.total) {
      throw new Error(
        `Lab Search ${groupName} regression: ${group?.pass || 0}/${group?.total || 0}`
      );
    }
  }

  return { passed, total: cases.length, accuracy, groups, failures };
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

function validateSomaticScienceGate() {
  const utility = idx.docs.filter((doc) => /^\/somatic\/[^/]+\/[^/]+\/[^/]+\/$/.test(doc.href));
  const hrefs = utility.map((doc) => doc.href);
  const unique = new Set(hrefs);
  const legacy = hrefs.filter((href) => !somaticAllowlist.has(`https://oneirox.com${href}`));
  if (legacy.length) throw new Error(`legacy Somatic utilities in Lab Search: ${legacy.join(", ")}`);
  if (hrefs.length !== 11 || unique.size !== 11 || somaticAllowlist.size !== 11) {
    throw new Error(`reviewed Somatic Lab Search cardinality mismatch: docs=${hrefs.length} unique=${unique.size} allowlist=${somaticAllowlist.size}`);
  }
  for (const url of somaticAllowlist) {
    const href = new URL(url).pathname;
    if (!unique.has(href)) throw new Error(`reviewed Somatic utility missing from Lab Search: ${href}`);
  }
  console.log(`Lab Search Somatic science gate OK: ${hrefs.length} reviewed utilities · 0 legacy violations`);
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
  const externalBase = process.env.LAB_SEARCH_BASE;
  const local = externalBase ? null : await staticServer();
  const base = externalBase || local.base;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/", { waitUntil: "networkidle" });
  const runtime = await page.evaluate(async () => {
    const script = [...document.scripts].find((el) => /lab-search\.js/.test(el.src));
    const response = await fetch("/data/lab-search-index.json", { credentials: "same-origin" });
    return {
      script: script?.src || "",
      hook: !!window.__ONX_LAB_SEARCH__,
      indexStatus: response.status,
      indexVersion: response.ok ? (await response.json()).version : null,
    };
  });
  if (!runtime.hook || runtime.indexStatus !== 200 || runtime.indexVersion !== 2) {
    throw new Error("production/runtime search assets unavailable " + JSON.stringify(runtime));
  }

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
    throw new Error("click dream about snake → " + JSON.stringify(clickSnake));
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
  if (local) local.server.close();
  if (errors.length) throw new Error("page errors: " + errors.join("; "));
}

const ranker = loadRanker();
validateIndexDestinations();
validateSomaticScienceGate();
runQualityBenchmark(ranker);

assertTop(
  ranker,
  "someone close to me",
  "/dreaming-about-someone-you-havent-seen-in-years/",
  "strong person intent"
);

assertTop(
  ranker,
  "dream about someone close to me",
  "/dreaming-about-someone-you-havent-seen-in-years/",
  "explicit strong person intent"
);
assertTop(ranker, "dream about snake", "/dreams/snakes/");
assertTop(ranker, "snake bit me", "/dreams/snakes/bitten/");
assertTop(ranker, "snake in my bed", "/dreams/snakes/in-bed/");
assertTop(ranker, "teeth falling out with blood", "/dreams/teeth-falling-out/with-blood/");
assertTop(ranker, "someone I know was chasing me", "/dreams/being-chased/known-person/");
assertTop(ranker, "sleep paralysis shadow figure", "/dreams/sleep-paralysis/with-presence/");
assertTop(ranker, "falling asleep then sudden jolt", "/dreams/falling/hypnic-onset-jolt/");
assertTop(ranker, "someone I don't talk to anymore", "/dream-about-someone-you-dont-talk-to-anymore-meaning/");
assertTop(ranker, "my dead father", "/dreams/death-of-a-loved-one/");
assertTop(ranker, "black snake in my house", "/dreams/snakes/in-house/");
assertTop(ranker, "dog attacking me", "/dreams/dogs/attacking/");
assertTop(ranker, "late for exam", "/dreams/exam-anxiety-dreams/");
assertTop(ranker, "my ex texted me", "/dream-about-someone-texting-you-meaning/");
assertTop(ranker, "snkae in house", "/dreams/snakes/in-house/");
assertTop(ranker, "sleep paralysis awakening", "/somatic/sleep-paralysis-onset/rem/awakening/");
assertTop(ranker, "hypnic jerk sleep onset", "/somatic/hypnic-jerk/n1/onset/");
assertTop(ranker, "REM sleep without atonia", "/somatic/rem-atonia-failure/rem/mid-cycle/");
assertTop(ranker, "periodic limb movements sleep", "/somatic/periodic-limb-movement/n2/fragmentation/");
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
