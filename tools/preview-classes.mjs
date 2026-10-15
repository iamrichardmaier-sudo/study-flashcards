// End-to-end check of the class pages, with screenshots.
//
//   node tools/build.mjs && node tools/preview-classes.mjs [outDir]
//
// Opens site/ in headless Chromium at desktop and phone sizes: the landing
// page, each class's Flashcards (a short session by keyboard), Practice (one
// question), every tool (with a few clicks), and the class switcher on the
// ECON 381 app. Fails on any page error or console error.

import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({ chromium } = require(join(execSync("npm root -g").toString().trim(), "playwright")));
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = process.argv[2] || join(root, ".preview");
mkdirSync(out, { recursive: true });
const url = (f) => pathToFileURL(join(root, "site", f)).href;
const browser = await chromium.launch();
const errors = [];

async function page(viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(`${p.url()}: ${e.message}`));
  p.on("console", (m) => {
    // Google Fonts can't load offline; that's not ours.
    if (m.type() === "error" && !/fonts\.(googleapis|gstatic)/.test(m.text() + (m.location().url || ""))) errors.push(`${p.url()}: ${m.text()}`);
  });
  return p;
}

const TOOLS = {
  econ210: ["linkedin", "network", "star", "bullets"],
  econ378: ["dist", "clt", "ci", "test"],
  econ380: ["consumer", "market", "monopoly", "games"],
  ihum242: ["map", "timeline", "figures"],
};

for (const [vw, size] of [["desk", { width: 1280, height: 860 }], ["phone", { width: 390, height: 844 }]]) {
  const p = await page(size);
  await p.goto(url("classes.html"));
  assert.equal(await p.locator(".cl").count(), 5, "landing lists five classes");
  await p.screenshot({ path: join(out, `classes-${vw}.png`), fullPage: true });

  for (const [id, tools] of Object.entries(TOOLS)) {
    await p.goto(url(`${id}.html`));
    await p.waitForSelector(".st-tab");
    assert.ok(await p.locator(".cn-btn").count() >= 1, `${id}: class switcher`);
    await p.screenshot({ path: join(out, `${id}-cards-${vw}.png`) });
    // a short flashcard session by keyboard
    await p.keyboard.press("Enter");
    await p.waitForSelector(".fc");
    for (let k = 0; k < 3; k++) { await p.keyboard.press(" "); await p.keyboard.press("ArrowRight"); }
    await p.keyboard.press(" ");
    if (vw === "desk") await p.screenshot({ path: join(out, `${id}-session-${vw}.png`) });
    await p.keyboard.press("Escape");
    // practice: answer one
    await p.goto(url(`${id}.html#practice`));
    await p.keyboard.press("Enter");
    await p.keyboard.press("a");
    await p.waitForSelector(".explain, .pill");
    if (vw === "desk") await p.screenshot({ path: join(out, `${id}-practice-${vw}.png`) });
    // the switcher menu opens with every class
    await p.locator(".cn-btn:visible").first().click();
    assert.equal(await p.locator(".cn-menu a").count(), 6, `${id}: switcher lists all classes + home`);
    await p.keyboard.press("Escape");
    // every tool
    for (const t of tools) {
      await p.goto(url(`${id}.html#tools/${t}`));
      await p.waitForSelector(".tool-h");
      for (const b of await p.locator(".tool-body .btn.solid, .tool-body .btn").all().then((a) => a.slice(0, 2))) {
        if (await b.isVisible() && await b.isEnabled() && !/Delete|Export/.test(await b.innerText())) await b.click();
      }
      if (t === "map") await p.locator("svg.plot").first().click({ position: { x: 300, y: 200 } });
      if (t === "figures") { await p.locator(".opt").first().click(); await p.locator(".opt").nth(6).click(); }
      await p.waitForTimeout(80);
      await p.screenshot({ path: join(out, `${id}-${t}-${vw}.png`), fullPage: vw === "desk" });
    }
  }

  // ECON 381 gains only the switcher
  await p.goto(url("index.html"));
  await p.waitForSelector(".cn-btn");
  await p.locator(".cn-btn:visible").first().click();
  assert.equal(await p.locator(".cn-menu a").count(), 6, "ECON 381: switcher lists all classes");
  await p.screenshot({ path: join(out, `econ381-switcher-${vw}.png`) });
  await p.context().close();
}

await browser.close();
if (errors.length) {
  console.error("Errors:\n  " + [...new Set(errors)].join("\n  "));
  process.exit(1);
}
console.log("Class pages OK. Screenshots in " + out);
