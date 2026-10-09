// End-to-end check of the generated script, with screenshots.
//
//   node tools/preview.mjs [outDir]
//
// Runs scriptable/econ381-review.js against the Scriptable stand-in, opens
// the review page it produces in headless Chromium at iPhone size, and
// drives it the way a thumb would: flip, grade, peek at a connection. Then
// checks that the grades reached the progress file with the right
// schedule, renders every one of the 126 answers looking for layout
// overflow, and builds the widget.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { runScript } from "./scriptable-mock.mjs";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

// Playwright from this project if installed, otherwise the global install.
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  const globalRoot = execSync("npm root -g").toString().trim();
  ({ chromium } = require(join(globalRoot, "playwright")));
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = join(root, "scriptable/econ381-review.js");
const out = process.argv[2] || join(root, ".preview");
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM || undefined,
});
const PHONE = { width: 390, height: 844 };

async function openPage(html) {
  const page = await browser.newPage({ viewport: PHONE, deviceScaleFactor: 2, hasTouch: false });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.setContent(html, { waitUntil: "load" });
  return { page, errors };
}

const shot = (page, name) => page.screenshot({ path: join(out, name + ".png") });

/** Screenshot the whole answer, however long, by growing the viewport. */
async function tallShot(page, name) {
  const h = await page.evaluate("document.querySelector('#card').scrollHeight + 260");
  await page.setViewportSize({ width: PHONE.width, height: Math.max(PHONE.height, h) });
  await shot(page, name);
  await page.setViewportSize(PHONE);
}

// ------------------------------------------------- 1. a real review session

const pings = [];
const review = await runScript(SCRIPT, {
  alerts: ["Review"],
  onPresent: async (wv) => {
    const { page, errors } = await openPage(wv.html);
    await shot(page, "01-front");
    const first = await page.evaluate("CARDS[0].id");

    await page.click("#scroll");                       // flip
    await shot(page, "02-back-top");
    await tallShot(page, "03-back-full");
    await page.click(".btn.missed");
    await page.waitForTimeout(250);

    await page.click("#scroll");
    await page.click(".btn.shaky");
    await page.waitForTimeout(250);

    await page.click("#scroll");
    // Peek at a connection before grading.
    if (await page.$(".link")) {
      await page.click(".link");
      await page.waitForTimeout(300);
      await shot(page, "04-connection-peek");
      await page.click("#peek");
      await page.waitForTimeout(250);
    }
    await page.click(".btn.confident");
    await page.waitForTimeout(250);

    // Missed goes to the back of the deck, so it comes round again.
    const last = await page.evaluate("CARDS[CARDS.length - 1].id");
    assert.equal(last, first, "missed card should be requeued at the back");
    const waiting = await page.evaluate("later.length");
    assert.equal(waiting, 1, "shaky card should be waiting out its hour");

    const results = await page.evaluate("results");
    // Replay the grades through the live handler the way the page's iframe
    // pings would arrive, then let the dismissal pass re-apply them (it must
    // not double count).
    results.forEach((r, seq) => {
      const url = `econ381://grade?id=${encodeURIComponent(r.id)}&rating=${r.rating}&seq=${seq}&t=${r.t}`;
      pings.push(wv.shouldAllowRequest({ url }));
    });
    assert.deepEqual(errors, [], "page errors: " + errors.join("; "));
    await page.close();
    return results;
  },
});

assert.ok(review.log.completed, "script should call Script.complete()");
assert.ok(pings.every((p) => p === false), "econ381:// requests must be blocked");
const progress = JSON.parse(review.fs.get("/icloud/econ381-progress.json"));
const graded = Object.entries(progress.cards);
assert.equal(graded.length, 3, "three cards graded");
const byRating = Object.fromEntries(graded.map(([id, s]) => [s.rating, s]));
const H = 3600 * 1000;
assert.ok(Math.abs(byRating.missed.due - byRating.missed.last) < 1000, "missed is due now");
assert.equal(byRating.shaky.due - byRating.shaky.last, 1 * H, "shaky is due in an hour");
assert.equal(byRating.confident.due - byRating.confident.last, 4 * H, "confident is due in 4 hours");
assert.ok(graded.every(([, s]) => s.seen === 1), "replayed grades must not be applied twice");
console.log("✓ review session: grades saved with the right schedule");

// ------------------------------- 2. cram every card, checking each answer

const showcase = ["gdp", "cpi-vs-deflator", "cobb-douglas", "loanable-funds", "crowding-out",
  "hyperinflation", "quantity-theory", "ss-unemployment-rate", "minimum-wage", "solow-diagram",
  "golden-saving", "lf-fall", "china", "fisher-effect", "cd-marginal", "m1"];
const cram = await runScript(SCRIPT, {
  files: { "/icloud/econ381-progress.json": JSON.stringify(progress) },
  alerts: ["Cram"],
  onPresent: async (wv) => {
    const { page, errors } = await openPage(wv.html);
    assert.equal(await page.evaluate("CARDS.length"), 126);
    const problems = [];
    for (let k = 0; k < 126; k++) {
      const info = await page.evaluate(`(() => {
        i = ${k}; render();
        const front = document.querySelector('#card').scrollWidth;
        flip();
        const c = CARDS[i];
        const card = document.querySelector('#card');
        const bad = [...card.querySelectorAll('*')].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.right > window.innerWidth + 1 || r.left < -1;
        });
        const overflow = bad.length ? bad.slice(0, 3).map((el) => el.tagName + ' "' + (el.textContent || '').slice(0, 30) + '"').join(', ') : '';
        const svg = card.querySelector('.graph svg');
        let escapes = '';
        if (svg) {
          const box = svg.getBoundingClientRect();
          const out = [...svg.querySelectorAll('path,line,text,circle,rect')].filter((el) => !el.closest('defs')).filter((el) => {
            const r = el.getBoundingClientRect();
            return r.top < box.top - 2 || r.bottom > box.bottom + 2 || r.left < box.left - 2 || r.right > box.right + 2;
          });
          escapes = out.slice(0, 3).map((el) => el.tagName + ' "' + (el.textContent || '').slice(0, 20) + '"').join(', ');
        }
        return { id: c.id, n: c.n, escapes, wantGraph: !!c.graph, hasGraph: !!card.querySelector('.graph svg'),
                 overflow, sections: card.querySelectorAll('.sect').length };
      })()`);
      if (info.overflow) problems.push(`#${info.n} ${info.id}: sticks out past the screen edge: ${info.overflow}`);
      if (info.escapes) problems.push(`#${info.n} ${info.id}: graph drawing leaves its box: ${info.escapes}`);
      if (info.wantGraph && !info.hasGraph) problems.push(`#${info.n} ${info.id}: graph didn't render`);
      if (info.sections < 2) problems.push(`#${info.n} ${info.id}: only ${info.sections} detail sections`);
      if (showcase.includes(info.id)) await tallShot(page, `card-${String(info.n).padStart(3, "0")}-${info.id}`);
    }
    await page.evaluate("i = 0; render()");
    await page.evaluate("const c = CARDS.find((x) => x.id === 'crowding-out'); CARDS.splice(CARDS.indexOf(c), 1); CARDS.unshift(c); i = 0; render()");
    await shot(page, "05-front-crowding-out");
    await page.evaluate("i = CARDS.length; render()");
    await shot(page, "06-done");
    assert.deepEqual(errors, [], "page errors: " + errors.join("; "));
    if (problems.length) throw new Error("Layout problems:\n  " + problems.join("\n  "));
    await page.close();
    return [{ id: "gdp", rating: "missed", t: Date.now() }];   // cram must ignore this
  },
});
const after = JSON.parse(cram.fs.get("/icloud/econ381-progress.json"));
assert.deepEqual(after, progress, "cram must not change the schedule");
console.log("✓ cram: all 126 answers render without overflow; nothing rescheduled");

// ------------------------------------------------------------ 3. widgets

for (const family of ["small", "medium"]) {
  const w = await runScript(SCRIPT, {
    runsInWidget: true,
    widgetFamily: family,
    files: { "/icloud/econ381-progress.json": JSON.stringify(progress) },
  });
  assert.ok(w.log.widget, "widget built");
  const texts = [];
  (function walk(s) { for (const it of s.items) { if (it.text) texts.push(it.text); if (it.items) walk(it); } })(w.log.widget);
  assert.ok(texts.includes("ECON 381"));
  assert.ok(w.log.widget.url.startsWith("scriptable:///run?scriptName="));
  writeFileSync(join(out, `widget-${family}.txt`), texts.join("\n") + "\n");
  console.log(`✓ ${family} widget: ${texts.join(" | ")}`);
}

// A fresh install (no progress file) must also build.
const fresh = await runScript(SCRIPT, { runsInWidget: true });
assert.ok(fresh.log.widget);
console.log("✓ fresh-install widget");

// Menu text on a fresh install.
const menu = await runScript(SCRIPT, { alerts: [undefined] });
console.log("✓ start menu: " + menu.log.alerts[0].actions.join(" · "));

await browser.close();
console.log("Screenshots in " + out);
