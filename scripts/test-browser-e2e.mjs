import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

function startStaticServer() {
  const mime = { ".css": "text/css", ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".woff2": "font/woff2" };
  const server = http.createServer((req, res) => {
    let pathname = decodeURIComponent((req.url || "/").split("?")[0]);
    if (pathname === "/" || pathname.endsWith("/")) pathname += "index.html";
    const file = path.resolve(publicDir, `.${pathname}`);
    if (!file.startsWith(publicDir + path.sep) || !fs.existsSync(file)) {
      res.writeHead(404); res.end("Not found"); return;
    }
    res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, base: `http://127.0.0.1:${server.address().port}` })));
}

const { server, base } = await startStaticServer();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() !== "error") return;
  const source = message.location().url;
  if (!source || source.startsWith(base)) errors.push(`console: ${message.text()}`);
});

try {
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 15000 });
  if (await page.locator("h1").count() !== 1) throw new Error("homepage must expose one H1");
  if (await page.locator('link[rel="canonical"]').getAttribute("href") !== "https://oneirox.com/") throw new Error("homepage canonical mismatch");
  for (const href of ["/lab/", "/notes/", "/dreams/", "/about/", "/methodology/"]) {
    if (await page.locator(`a[href="${href}"]`).count() === 0) throw new Error(`missing homepage link ${href}`);
  }

  await page.locator('a[href="/dreams/"]').first().click();
  await page.waitForURL(/\/dreams\/$/, { timeout: 5000 });
  if (await page.locator("h1").count() !== 1) throw new Error("dreams navigation failed");

  await page.goto(`${base}/decode/`, { waitUntil: "commit", timeout: 15000 });
  const decodeInput = page.locator('textarea[aria-label="Describe your dream"]');
  if (!(await page.locator(".onx-decode-offline").isVisible())) throw new Error("paused Decode status is not visible");
  if (await decodeInput.isVisible() || !(await decodeInput.isDisabled())) throw new Error("paused Decode form must remain hidden and disabled");
  if (!(await page.locator('button[type="submit"]').isDisabled())) throw new Error("paused Decode submit must stay disabled");

  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 15000 });
  const search = page.locator("#lab-search-input");
  await search.fill("snake bit me");
  await search.press("Enter");
  const result = page.locator('[data-lab-search-results] .onx-lab-search__hit-title a').first();
  await result.waitFor({ state: "visible", timeout: 5000 });
  if (await result.getAttribute("href") !== "/dreams/snakes/bitten/") throw new Error("Lab Search ranking regression");

  await page.goto(`${base}/lab/sleep-cycles/`, { waitUntil: "networkidle", timeout: 15000 });
  await page.locator("#cyc-calc-btn").click();
  if (await page.locator("#cyc-results .onx-cyc-result").count() !== 4) throw new Error("sleep calculator did not render four planning options");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 15000 });
  const mobile = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    inputVisible: !!document.querySelector("#lab-search-input"),
    buttonVisible: !!document.querySelector("[data-lab-search-run]"),
  }));
  if (mobile.overflow || !mobile.inputVisible || !mobile.buttonVisible) throw new Error(`mobile layout regression ${JSON.stringify(mobile)}`);

  if (errors.length) throw new Error(errors.join("; "));
  console.log("Browser E2E PASS: homepage, navigation, paused Decode UI, Lab Search, calculator, mobile, console");
} finally {
  await browser.close();
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
}
