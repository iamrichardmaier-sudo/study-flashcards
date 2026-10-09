// End-to-end check of the website build, with screenshots.
//
//   node tools/preview-web.mjs [outDir]
//
// Opens web/econ381.html in headless Chromium inside the same kind of
// skeleton the Artifact publisher wraps it in. Outside claude.ai there's no
// account store, so this exercises the browser-storage path.

import { mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
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
const content = readFileSync(join(root, "web/econ381.html"), "utf8");
const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
  "<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style>" +
  "</head><body>" + content + "</body></html>";

const H = 3600 * 1000;
const browser = await chromium.launch();
// A real origin, so localStorage works the way it does on the live page.
const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 });
await ctx.route("https://econ381.test/**", (r) => r.fulfill({ contentType: "text/html", body: html }));
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto("https://econ381.test/");

const shot = (name) => page.screenshot({ path: join(out, "web-" + name + ".png") });
const stored = () => page.evaluate("JSON.parse(localStorage.getItem('econ381-progress') || '{\"cards\":{}}')");
const visible = (sel) => page.evaluate(`!document.querySelector('${sel}').hidden && getComputedStyle(document.querySelector('${sel}')).display !== 'none'`);
const settle = () => page.waitForTimeout(260);

// -------------------------------------------------------------- menu
assert.ok(await visible("#menu"), "opens on the menu");
assert.match(await page.textContent("#m-review"), /Review 25 new/);
await shot("01-menu");

// ------------------------------------------------- keyboard grading
await page.keyboard.press("Enter");                       // start the review
assert.ok(!(await visible("#menu")), "Enter on the menu starts the review");
const first = await page.evaluate("CARDS[0].id");
await shot("02-front");

await page.keyboard.press("Enter");
assert.equal(await page.evaluate("flipped"), true, "Enter flips the front");
await page.keyboard.press("Enter");
assert.equal(await page.evaluate("flipped"), false, "Enter on the back flips it back");
await page.keyboard.press("ArrowRight");
assert.equal(await page.evaluate("flipped"), true, "→ flips the front");
await page.screenshot({ path: join(out, "web-03-back.png"), fullPage: false });
await page.keyboard.press("ArrowRight");                  // confident
await settle();
let p = await stored();
assert.equal(p.cards[first].rating, "confident");
assert.equal(p.cards[first].due - p.cards[first].last, 4 * H, "→ = Confident, back in 4 hours");

const second = await page.evaluate("CARDS[i].id");
await page.keyboard.press("Enter");
await page.keyboard.press("ArrowLeft");                   // shaky
await settle();
p = await stored();
assert.equal(p.cards[second].due - p.cards[second].last, 1 * H, "← = Shaky, back in 1 hour");
assert.equal(await page.evaluate("later.length"), 1, "shaky waits out its hour");

const third = await page.evaluate("CARDS[i].id");
await page.keyboard.press("Enter");
await page.keyboard.press("ArrowUp");                     // missed
await settle();
p = await stored();
assert.equal(p.cards[third].rating, "missed", "↑ = Missed");
assert.equal(await page.evaluate("CARDS[CARDS.length - 1].id"), third, "missed goes to the back of the deck");

const fourth = await page.evaluate("CARDS[i].id");
await page.keyboard.press("Enter");
await page.keyboard.press("ArrowDown");                   // missed
await settle();
p = await stored();
assert.equal(p.cards[fourth].rating, "missed", "↓ = Missed");

// Arrows on the front don't grade; a held key doesn't grade a run of cards.
const fifth = await page.evaluate("CARDS[i].id");
await page.keyboard.press("ArrowLeft");
await page.keyboard.press("ArrowUp");
assert.equal(await page.evaluate("flipped"), false);
assert.ok(!(await stored()).cards[fifth], "← and ↑ on the front do nothing");
await page.keyboard.press("Enter");
await page.evaluate("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', repeat: true }))");
assert.ok(!(await stored()).cards[fifth], "a held key doesn't grade");

// Clicking the card flips both ways (no thirds on the web).
await page.click("#scroll", { position: { x: 60, y: 300 } });
assert.equal(await page.evaluate("flipped"), false, "click on the back flips it back");
await page.click("#scroll", { position: { x: 60, y: 300 } });
assert.equal(await page.evaluate("flipped"), true);
await page.click(".btn.confident");
await settle();
assert.equal((await stored()).cards[fifth].rating, "confident", "buttons still grade");

// Esc returns to the menu, which now counts the session.
await page.keyboard.press("Escape");
assert.ok(await visible("#menu"));
assert.match(await page.textContent("#m-status"), /2 due now/);
console.log("✓ keyboard: Enter/→ flip, Enter flips back, → Confident, ← Shaky, ↑↓ Missed; Esc to menu");

// ----------------------------------------------- persists on reload
await page.reload();
assert.ok(await visible("#menu"));
assert.match(await page.textContent("#m-status"), /2 due now/);
assert.equal(Object.keys((await stored()).cards).length, 5);
console.log("✓ progress survives a reload");

// --------------------------------------------- cram changes nothing
const before = JSON.stringify(await stored());
await page.click("#m-cram");
assert.equal(await page.evaluate("CARDS.length"), 126);
await page.keyboard.press("Enter");
await page.keyboard.press("ArrowUp");
await settle();
assert.equal(JSON.stringify(await stored()), before, "cram doesn't reschedule");
await page.keyboard.press("Escape");
console.log("✓ cram leaves the schedule alone");

// ------------------------------------------- week, done screen, stats
await page.click('.m-week[data-week="4"]');
assert.ok(await page.evaluate("CARDS.every((c) => c.week === 4)"), "week button reviews that week");
await page.evaluate("i = CARDS.length; render()");
assert.ok(await visible("#done"));
await shot("04-done");
await page.keyboard.press("Enter");
assert.ok(await visible("#menu"), "Enter on the done screen returns to the menu");

await page.click("#m-stats-btn");
assert.match(await page.textContent("#stats"), /Missed most/);
await shot("05-progress");
await page.click('[data-m="reset"]');
await page.click('[data-m="reset-no"]');
assert.equal(Object.keys((await stored()).cards).length, 5, "cancel keeps progress");
await page.click('[data-m="reset"]');
await page.click('[data-m="reset-yes"]');
assert.equal(Object.keys((await stored()).cards).length, 0, "reset clears progress");
assert.match(await page.textContent("#m-review"), /Review 25 new/);
console.log("✓ week review, done screen, progress panel, reset with confirm");

// ------------------------------------- every card, desktop and phone
for (const [w, h] of [[1280, 860], [390, 844]]) {
  await page.setViewportSize({ width: w, height: h });
  await page.click("#m-cram");
  const problems = await page.evaluate(`(() => {
    const bad = [];
    for (let k = 0; k < CARDS.length; k++) {
      i = k; render(); flip();
      const out = [...document.querySelectorAll('#card *')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right > window.innerWidth + 1 || r.left < -1;
      });
      if (out.length) bad.push(CARDS[k].id);
      if (CARDS[k].graph && !document.querySelector('#card .graph svg')) bad.push(CARDS[k].id + ' (graph)');
    }
    if (document.documentElement.scrollWidth > window.innerWidth) bad.push('page scrolls sideways');
    return bad;
  })()`);
  assert.deepEqual(problems, [], `layout problems at ${w}px: ${problems.join(", ")}`);
  await page.evaluate("const c = CARDS.find((x) => x.id === 'solow-diagram'); i = CARDS.indexOf(c); render(); flip()");
  await shot(`06-back-${w}`);
  await page.keyboard.press("Escape");
  if (w === 390) await shot("07-menu-390");
}
console.log("✓ all 126 answers fit at 1280px and 390px");

assert.deepEqual(errors, [], "page errors: " + errors.join("; "));
await browser.close();
console.log("Screenshots in " + out);
