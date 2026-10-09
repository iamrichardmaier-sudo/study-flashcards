// End-to-end check of the website build, with screenshots.
//
//   node tools/preview-web.mjs [outDir]
//
// Opens web/econ381.html in headless Chromium inside the same kind of
// skeleton the Artifact publisher wraps it in, and uses it the way a person
// would: the Home tab, flashcards by keyboard, every model dashboard, every
// walkthrough to the end, free play, the Progress tab. Outside claude.ai
// there's no account store, so most of it exercises the browser-storage
// path; a stand-in store covers the account path at the end.

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
const errors = [];

async function newPage(viewport, init) {
  const ctx = await browser.newContext({ viewport: viewport || { width: 1280, height: 860 }, deviceScaleFactor: 2 });
  // No outside network here: the web font falls back to the system face.
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await ctx.route("https://econ381.test/**", (r) => r.fulfill({ contentType: "text/html", body: html }));
  if (init) await ctx.addInitScript(init.fn, init.arg);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("https://econ381.test/");
  return { ctx, page };
}

const { page } = await newPage();
const shot = (name, opts) => page.screenshot({ path: join(out, "web-" + name + ".png"), ...(opts || {}) });
const stored = () => page.evaluate("JSON.parse(localStorage.getItem('econ381-progress') || '{\"cards\":{}}')");
const visible = (sel) => page.evaluate((s) => { const el = document.querySelector(s); return !!el && !el.closest("[hidden]") && getComputedStyle(el).display !== "none"; }, sel);
const settle = () => page.waitForTimeout(260);
const inSession = () => page.evaluate("document.querySelector('#shell').hidden");

// ----------------------------------------------------------------- home
assert.ok(await visible("#tab-home"), "opens on Home");
assert.match(await page.textContent("#h-primary"), /Learn 25 new cards/);
assert.equal(await page.textContent("#h-learn"), "25");
assert.equal(await page.evaluate("document.querySelectorAll('#h-models .hm').length"), 6, "six model cards on Home");
await shot("01-home", { fullPage: true });

// ------------------------------------------------- keyboard flashcards
await page.keyboard.press("Enter");
assert.ok(await inSession(), "Enter on Home starts what the big button says");
const first = await page.evaluate("CARDS[0].id");
await page.keyboard.press("Enter");
assert.equal(await page.evaluate("flipped"), true, "Enter flips the front");
await page.keyboard.press("Enter");
assert.equal(await page.evaluate("flipped"), false, "Enter on the back flips it back");
await page.keyboard.press("ArrowRight");
assert.equal(await page.evaluate("flipped"), true, "→ flips the front");
await shot("02-card-back");
await page.keyboard.press("ArrowRight");
await settle();
let p = await stored();
assert.equal(p.cards[first].due - p.cards[first].last, 4 * H, "→ = Confident, back in 4 hours");

const second = await page.evaluate("CARDS[i].id");
await page.keyboard.press("Enter");
await page.keyboard.press("ArrowLeft");
await settle();
p = await stored();
assert.equal(p.cards[second].due - p.cards[second].last, 1 * H, "← = Shaky, back in 1 hour");

const third = await page.evaluate("CARDS[i].id");
await page.keyboard.press("Enter");
await page.keyboard.press("ArrowUp");
await settle();
assert.equal((await stored()).cards[third].rating, "missed", "↑ = Missed");
assert.equal(await page.evaluate("CARDS[CARDS.length - 1].id"), third, "missed goes to the back");
const fourth = await page.evaluate("CARDS[i].id");
await page.keyboard.press("Enter");
await page.keyboard.press("ArrowDown");
await settle();
assert.equal((await stored()).cards[fourth].rating, "missed", "↓ = Missed");
const fifth = await page.evaluate("CARDS[i].id");
await page.keyboard.press("ArrowLeft");
assert.ok(!(await stored()).cards[fifth], "arrows on the front don't grade");
await page.keyboard.press("Enter");
await page.evaluate("document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', repeat: true }))");
assert.ok(!(await stored()).cards[fifth], "a held key doesn't grade");
await page.click(".btn.confident");
await settle();
assert.equal((await stored()).cards[fifth].rating, "confident", "buttons still grade");

await page.keyboard.press("Escape");
assert.ok(!(await inSession()) && (await visible("#tab-home")), "Esc returns to Home");
assert.equal(await page.textContent("#h-due"), "2", "the two missed cards are due");
assert.match(await page.textContent("#h-streak"), /1\s*day/, "studying today starts a streak");
console.log("✓ Home + keyboard flashcards: Enter/→ flip, → Confident, ← Shaky, ↑↓ Missed, Esc home, streak");

await page.reload();
assert.equal(await page.textContent("#h-due"), "2", "progress survives a reload");
console.log("✓ progress survives a reload");

// ---------------------------------------------------------- review tab
await page.click('.tabbtn[data-tab="review"]');
assert.ok(await visible("#tab-review"));
await shot("03-review", { fullPage: true });
const before = JSON.stringify((await stored()).cards);
await page.click("#r-cram");
assert.equal(await page.evaluate("CARDS.length"), 126);
await page.keyboard.press("Enter");
await page.keyboard.press("ArrowUp");
await settle();
assert.equal(JSON.stringify((await stored()).cards), before, "cram doesn't reschedule");
await page.keyboard.press("Escape");
assert.ok(await visible("#tab-review"), "Esc returns to the tab the session started from");
await page.click('#r-weeks [data-week="4"]');
assert.ok(await page.evaluate("CARDS.every((c) => c.week === 4)"), "week button reviews that week");
await page.evaluate("i = CARDS.length; render()");
await page.keyboard.press("Enter");
assert.ok(!(await inSession()), "Enter on the done screen returns");
console.log("✓ Review tab: cram, week, done screen");

// -------------------------------------------- every card still fits
for (const [w, h] of [[1280, 860], [390, 844]]) {
  await page.setViewportSize({ width: w, height: h });
  await page.click('.tabbtn[data-tab="review"]');
  await page.click("#r-cram");
  const bad = await page.evaluate(`(() => {
    const bad = [];
    for (let k = 0; k < CARDS.length; k++) {
      i = k; render(); flip();
      const o = [...document.querySelectorAll('#card *')].filter((el) => { const r = el.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1; });
      if (o.length) bad.push(CARDS[k].id);
    }
    return bad;
  })()`);
  assert.deepEqual(bad, [], `cards overflow at ${w}px`);
  await page.keyboard.press("Escape");
}
await page.setViewportSize({ width: 1280, height: 860 });
console.log("✓ all 126 answers fit at 1280px and 390px");

// -------------------------------------------------------------- models
await page.click('.tabbtn[data-tab="models"]');
assert.ok(await visible("#tab-models"));
const modelIds = await page.evaluate("MODELS.map((m) => m.id)");
assert.equal(modelIds.length, 6);

/** Checks the dashboard draws, nothing pokes out of the page or out of its
 *  chart, and the numbers aren't NaN. */
async function checkDashboard(where) {
  const r = await page.evaluate(() => {
    const bad = [];
    const vw = document.documentElement.clientWidth;
    document.querySelectorAll("#models *").forEach((el) => {
      if (el.closest("svg") && el.tagName !== "svg") return;
      // Rows built to scroll sideways on their own (the model chips, wide tables).
      if (el.closest(".mdl-chips, .tbl")) return;
      const b = el.getBoundingClientRect();
      if (b.width && (b.right > vw + 1 || b.left < -1)) bad.push(el.tagName + "." + el.className);
    });
    document.querySelectorAll("#mdl-graph svg, #mdl-line svg, #mdl-bars svg").forEach((svg) => {
      const box = svg.getBoundingClientRect();
      svg.querySelectorAll("text,line,path,circle,rect").forEach((el) => {
        if (el.closest("defs")) return;
        const b = el.getBoundingClientRect();
        if (b.top < box.top - 3 || b.bottom > box.bottom + 3 || b.left < box.left - 3 || b.right > box.right + 3)
          bad.push("svg " + el.tagName + " '" + (el.textContent || "").slice(0, 24) + "'");
      });
    });
    const text = document.querySelector("#models").innerText;
    if (/NaN|undefined|Infinity/.test(text)) bad.push("NaN/undefined in text");
    if (document.documentElement.scrollWidth > vw) bad.push("page scrolls sideways");
    return bad.slice(0, 6);
  });
  assert.deepEqual(r, [], where);
}

let walked = 0;
for (const id of modelIds) {
  await page.click(`.mchip[data-model="${id}"]`);
  await page.waitForTimeout(80);
  assert.ok(await page.$("#mdl-graph svg"), id + " graph");
  await checkDashboard(id + " free play");

  // Free play: move the first slider and the numbers move.
  const kpiBefore = await page.textContent("#mdl-kpis");
  await page.evaluate(() => {
    const s = document.querySelector('#mdl-panel input[type="range"]');
    s.value = String(Number(s.min) + (Number(s.max) - Number(s.min)) * 0.8);
    s.dispatchEvent(new Event("input", { bubbles: true }));
  });
  assert.notEqual(await page.textContent("#mdl-kpis"), kpiBefore, id + ": a slider moves the numbers");
  await checkDashboard(id + " after slider");

  for (const tab of ["forms", "statics", "facts"]) {
    await page.click(`#mdl-seg [data-tab="${tab}"]`);
    if (tab === "statics") assert.ok(await page.$("#mdl-tab table td.up, #mdl-tab table td.down"), id + " statics table has arrows");
  }

  const scs = await page.evaluate((m) => MODELS.find((x) => x.id === m).scenarios.map((s) => s.id), id);
  for (const [n, sid] of scs.entries()) {
    await page.click(`[data-sc="${sid}"]`);
    let guard = 0, answered = 0;
    while (!(await page.$(".exam")) && guard++ < 30) {
      if (await page.$(".ask")) {
        const turn = answered++ % 3;
        if (await page.$("#pred-num")) {
          if (turn === 2) await page.click('[data-act="skip"]');
          else { await page.fill("#pred-num", turn === 0 ? "1" : "99999"); await page.press("#pred-num", "Enter"); }
        } else if (turn === 1 && (await page.$(".keyhint")) && /falls/.test(await page.textContent(".ask"))) {
          await page.keyboard.press("ArrowUp");      // answer a direction by key
        } else {
          const choices = await page.$$(".choice");
          await choices[turn % choices.length].click();
        }
        await page.waitForSelector(".fb", { timeout: 2000 });
        await page.waitForTimeout(700);
        await checkDashboard(`${id}/${sid} after a reveal`);
        if (n === 0 && answered === 1) await page.screenshot({ path: join(out, `web-model-${id}.png`) });
      } else {
        await page.waitForTimeout(700);
        await page.click('[data-act="next"]');
      }
    }
    assert.ok(await page.$(".exam"), `${id}/${sid} reaches the exam card`);
    walked++;
  }
}
const prog = await stored();
const doneCount = Object.values(prog.models || {}).filter((x) => x.done).length;
assert.equal(doneCount, 24, "all 24 walkthroughs are recorded as done");
assert.ok((prog.missed || []).length > 0, "missed predictions are kept for the Progress tab");
console.log(`✓ Models: 6 dashboards, free play, forms/statics/facts, ${walked} walkthroughs played to the exam card`);

// The right answer is accepted: Gamma Epsilon's 3,069.7.
await page.click('.mchip[data-model="production"]');
await page.click('[data-sc="gamma-epsilon"]');
for (let k = 0; k < 3; k++) { await page.waitForTimeout(700); await page.click('[data-act="next"]'); }
await page.fill("#pred-num", "3069.7");
await page.press("#pred-num", "Enter");
assert.match(await page.textContent(".fb"), /Right/, "the right number is marked right");
// Enter moves on once the answer is shown.
await page.waitForTimeout(700);
await page.evaluate(() => document.activeElement && document.activeElement.blur());
const stepBefore = await page.evaluate(() => document.querySelectorAll(".pd.done").length);
await page.keyboard.press("Enter");
assert.equal(await page.evaluate(() => document.querySelectorAll(".pd.done").length), stepBefore + 1, "Enter advances the walkthrough");
console.log("✓ right answers are accepted; Enter advances");

// ------------------------------------------------------------- progress
await page.click('.tabbtn[data-tab="progress"]');
assert.match(await page.textContent("#p-body"), /Predictions you missed lately/);
await shot("04-progress", { fullPage: true });
await page.click('[data-m="reset"]');
await page.click('[data-m="reset-no"]');
assert.ok(Object.keys((await stored()).cards).length > 0, "cancel keeps progress");
await page.click('[data-m="reset"]');
await page.click('[data-m="reset-yes"]');
assert.equal(Object.keys((await stored()).cards).length, 0, "reset clears progress");
console.log("✓ Progress tab, reset with confirm");

// --------------------------------------------------- phone-width layout
await page.setViewportSize({ width: 390, height: 844 });
await page.click('.tabbtn[data-tab="home"]');
await shot("05-home-phone", { fullPage: true });
await page.click('.tabbtn[data-tab="models"]');
for (const id of modelIds) {
  await page.click(`.mchip[data-model="${id}"]`);
  await page.waitForTimeout(60);
  await checkDashboard(id + " at 390px");
}
await page.click('.mchip[data-model="solow"]');
await page.click('[data-sc="war"]');
await page.waitForTimeout(700);
await page.click('[data-act="next"]');
await page.click(".choice");
await page.waitForTimeout(800);
await shot("06-model-phone", { fullPage: true });
await page.setViewportSize({ width: 1280, height: 860 });
console.log("✓ every dashboard fits at phone width");

// ------------------------------------------- saving to the account store
async function accountRun(storeMode) {
  const { ctx, page: pg } = await newPage(null, { fn: (storeMode) => {
    const KEY = "__mock_db";
    const read = () => JSON.parse(sessionStorage.getItem(KEY) || "{}");
    let calls = Number(sessionStorage.getItem("__mock_calls") || 0);
    const db = { collection(path) { return { doc(id) { const full = path + "/" + id; return {
      async get() { const d = read()[full]; return { exists: !!d, data: () => d }; },
      set(data) {
        calls++; sessionStorage.setItem("__mock_calls", String(calls));
        if (storeMode === "hang" && calls === 1) return new Promise(() => {});
        if (storeMode === "flaky" && calls === 1) return Promise.reject({ code: "resource_exhausted" });
        const all = read(); all[full] = JSON.parse(JSON.stringify(data)); sessionStorage.setItem(KEY, JSON.stringify(all));
        return Promise.resolve();
      } }; } }; } };
    window.claude = { use: async (name) => (name === "db" ? db : name === "user" ? { id: async () => "u_test" } : null) };
  }, arg: storeMode });
  await pg.waitForFunction("document.querySelector('.store-note').textContent.includes('account')");
  assert.equal(await pg.evaluate("sessionStorage.getItem('__mock_calls')"), null, "nothing to write on open");
  await pg.keyboard.press("Enter");
  const id = await pg.evaluate("CARDS[0].id");
  await pg.keyboard.press("Enter");
  await pg.keyboard.press("ArrowRight");
  assert.match(await pg.textContent("#flash"), /Confident\s*back in 4 hours/);
  await pg.waitForFunction((id) => {
    const d = JSON.parse(sessionStorage.getItem("__mock_db") || "{}")["data/users/u_test/econ381"];
    return d && JSON.parse(d.progress).cards[id];
  }, id, { timeout: 30000 });
  // A walkthrough finished is saved to the account too.
  await pg.keyboard.press("Escape");
  await pg.click('.tabbtn[data-tab="models"]');
  await pg.click('[data-sc="four-shocks"]');
  for (let k = 0; k < 12 && !(await pg.$(".exam")); k++) {
    await pg.waitForTimeout(700);
    if (await pg.$(".ask")) { await pg.click('[data-act="skip"]'); await pg.waitForTimeout(700); }
    await pg.click('[data-act="next"]');
  }
  await pg.waitForFunction(() => {
    const d = JSON.parse(sessionStorage.getItem("__mock_db") || "{}")["data/users/u_test/econ381"];
    return d && (JSON.parse(d.progress).models || {})["four-shocks"];
  }, null, { timeout: 30000 });
  // A fresh browser on the same account sees it all.
  await pg.evaluate("localStorage.clear()");
  await pg.reload();
  await pg.waitForFunction("document.querySelector('#h-learn').textContent === '24'");
  await pg.click('.tabbtn[data-tab="progress"]');
  assert.match(await pg.textContent("#p-body"), /Immigration, earthquake[\s\S]*?predictions|done/);
  await ctx.close();
}
await accountRun("ok");
console.log("✓ account store: grades and walkthroughs saved; a fresh browser sees them");
await accountRun("flaky");
console.log("✓ account store refuses one write: retried and saved");
await accountRun("hang");
console.log("✓ account store write hangs: times out, retried and saved");

// ------------------------------------------- the posted site (Supabase)
// site/index.html is what GitHub Pages serves. Its saving goes to Supabase;
// here Supabase is faked at the network layer so the page's real fetch code runs.
{
  const site = readFileSync(join(root, "site/index.html"), "utf8");
  assert.ok(site.startsWith("<!doctype html>"), "site is a full document");
  const SB = "https://fphpcfecgnfoogfaeihu.supabase.co";
  const phoneCard = await page.evaluate("CARDS[5].id");
  const db = { row: { cards: { [phoneCard]: { step: 2, due: Date.now() + 864e5, seen: 2, lapses: 0, first: 1, last: Date.now() - 5000 } } }, writes: 0 };
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await ctx.route("https://iamrichardmaier-sudo.github.io/**", (r) => r.fulfill({ contentType: "text/html", body: site }));
  await ctx.route(SB + "/**", async (r) => {
    const req = r.request(), url = req.url();
    const json = (status, body) => r.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    if (url.includes("/auth/v1/token")) {
      const b = JSON.parse(req.postData());
      if (b.password !== "right") return json(400, { error: "invalid_grant", error_description: "Invalid login credentials" });
      return json(200, { access_token: "tok", refresh_token: "ref", expires_in: 3600, user: { id: "u1", email: b.email } });
    }
    assert.equal(req.headers()["authorization"], "Bearer tok");
    if (req.method() === "GET") return json(200, db.row ? [{ data: db.row }] : []);
    const b = JSON.parse(req.postData());
    assert.equal(b.user_id, "u1");
    db.row = b.data; db.writes++;
    return r.fulfill({ status: 201, body: "" });
  });
  const sp = await ctx.newPage();
  sp.on("pageerror", (e) => errors.push(String(e)));
  await sp.goto("https://iamrichardmaier-sudo.github.io/study-flashcards/");
  await sp.waitForSelector("#signin:not([hidden])");
  await sp.screenshot({ path: join(out, "web-site-signin.png") });
  await sp.fill("#si-email", "me@example.com");
  await sp.fill("#si-pass", "wrong");
  await sp.click("#si-go");
  await sp.waitForFunction("document.querySelector('#si-err').textContent.length > 0");
  await sp.fill("#si-pass", "right");
  await sp.click("#si-go");
  await sp.waitForSelector("#signin", { state: "hidden" });
  await sp.waitForTimeout(300);
  const local = await sp.evaluate("JSON.parse(localStorage.getItem('econ381-progress') || '{}')");
  assert.ok(local.cards && local.cards[phoneCard], "the phone's grade came down on sign-in");
  assert.ok(!(await sp.evaluate("localStorage.getItem('econ381-session')")).includes("right"), "the password is never stored");

  await sp.click("#h-primary");
  const graded = await sp.evaluate("CARDS[0].id");
  await sp.keyboard.press("Enter"); await sp.keyboard.press("ArrowRight");
  await sp.waitForTimeout(260);
  for (let k = 0; k < 40 && !(db.row.cards[graded]); k++) await sp.waitForTimeout(100);
  assert.ok(db.row.cards[graded], "the web grade went up to Supabase");
  assert.ok(db.row.cards[phoneCard], "without dropping the phone's grade");
  await sp.keyboard.press("Escape");

  // The phone grades something else meanwhile; a reload stays signed in and picks it up.
  const phone2 = await sp.evaluate("CARDS[7].id");
  db.row = { ...db.row, cards: { ...db.row.cards, [phone2]: { step: 1, due: Date.now() + 4 * H, seen: 1, lapses: 0, first: 2, last: Date.now() } } };
  await sp.reload();
  await sp.waitForTimeout(500);
  assert.ok(await sp.evaluate("document.querySelector('#signin').hidden"), "still signed in after a reload");
  const after = await sp.evaluate("JSON.parse(localStorage.getItem('econ381-progress'))");
  assert.ok(after.cards[phone2] && after.cards[graded], "reload merged the phone's newer grade");

  await sp.click('[data-tab="progress"]');
  await sp.click('[data-m="signout"]');
  await sp.click('[data-tab="home"]');
  assert.ok(await sp.evaluate("!document.querySelector('#signin').hidden"), "signing out shows the form again");
  await ctx.close();
  console.log("✓ posted site: Supabase sign-in, pull on sign-in and reload, merged push, sign out");
}

const real = errors.filter((e) => !/ERR_FAILED/.test(e));
assert.deepEqual(real, [], "page errors: " + real.join("; "));
await browser.close();
console.log("Screenshots in " + out);
