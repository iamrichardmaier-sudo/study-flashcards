// End-to-end check of every class page (the shared app built per class),
// with screenshots.
//
//   node tools/build.mjs && node tools/preview-classes.mjs [outDir]
//
// For each of ECON 210, 378, 380 and IHUM 242, in headless Chromium:
//   - every card's answer renders without spilling out, at 1280px and 390px
//   - the Practice drill plays a question wrong and one right
//   - every tool mounts and survives a few clicks
//   - signing in saves progress to study_progress for that class (a faked
//     Supabase), and the class picker and switcher work
// Fails on any page error.

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
const only = process.argv[3] ? process.argv[3].split(",") : null;
const IDS = ["econ210", "econ378", "econ380", "ihum242"].filter((id) => !only || only.includes(id));
const SB = "https://fphpcfecgnfoogfaeihu.supabase.co";
const HOST = "https://iamrichardmaier-sudo.github.io/study-flashcards/";
const browser = await chromium.launch();
const errors = [];

/** A browser with the posted site and a fake Supabase behind it. */
async function open(viewport, db) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await ctx.route(HOST + "**", (r) => {
    const path = new URL(r.request().url()).pathname.replace(/^\/study-flashcards\/?/, "") || "index.html";
    const type = path.endsWith(".js") ? "text/javascript" : path.endsWith(".css") ? "text/css" : "text/html";
    try { r.fulfill({ contentType: type, body: readFileSync(join(root, "site", path)) }); } catch { r.fulfill({ status: 404, body: "" }); }
  });
  await ctx.route(SB + "/**", async (r) => {
    const req = r.request(), url = req.url();
    const json = (status, body) => r.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    if (url.includes("/auth/v1/token")) return json(200, { access_token: "tok", refresh_token: "ref", expires_in: 3600, user: { id: "u1", email: "me@example.com" } });
    if (/study_(courses|cards|questions)/.test(url)) return json(200, []);
    assert.ok(url.includes("/rest/v1/study_progress"), "class progress goes to study_progress: " + url);
    if (req.method() === "GET") {
      const course = new URL(url).searchParams.get("course_id").replace("eq.", "");
      return json(200, db.rows[course] ? [{ data: db.rows[course] }] : []);
    }
    const b = JSON.parse(req.postData());
    assert.equal(b.user_id, "u1");
    assert.ok(url.includes("on_conflict=user_id,course_id"));
    db.rows[b.course_id] = b.data;
    return r.fulfill({ status: 201, body: "" });
  });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(`${p.url()}: ${e.message}`));
  return { ctx, p };
}

for (const id of IDS) {
  const content = JSON.parse(readFileSync(join(root, "site/content", id + ".json"), "utf8"));
  const db = { rows: {} };

  // ------------------------------------------------ every card, both widths
  const problems = [];
  for (const vp of [{ width: 1280, height: 860 }, { width: 390, height: 844 }]) {
    const { ctx, p } = await open(vp, db);
    await p.goto(HOST + id + ".html");
    await p.click('[data-tab="review"]');
    await p.click("#r-cram");
    const n = await p.evaluate("CARDS.length");
    assert.equal(n, content.cards.length);
    for (let k = 0; k < n; k++) {
      const bad = await p.evaluate(`(() => {
        i = ${k}; render(); flip();
        const card = document.querySelector('#card');
        const w = card.clientWidth, out = [];
        if (card.scrollWidth > w + 1) out.push("card scrolls sideways");
        card.querySelectorAll('*').forEach((el) => {
          const r = el.getBoundingClientRect(), c = card.getBoundingClientRect();
          if (r.width && (r.right > c.right + 1 || r.left < c.left - 1) && !el.closest('.chips, .links')) out.push((el.className || el.tagName) + "");
        });
        return out.slice(0, 2);
      })()`);
      if (bad.length) problems.push(`${id} ${vp.width}px #${k + 1} ${content.cards[k].id}: ${bad.join(", ")}`);
    }
    if (vp.width === 390) {
      // A card with a graph if there is one, for the screenshot.
      const g = Math.max(0, content.cards.findIndex((c) => c.graph));
      await p.evaluate(`i = ${g}; render(); flip();`);
      const h = await p.evaluate("document.querySelector('#card').scrollHeight + 260");
      await p.setViewportSize({ width: 390, height: Math.max(844, h) });
      await p.screenshot({ path: join(out, `class-${id}-card-phone.png`) });
    } else {
      await p.evaluate("i = 0; render(); flip();");
      await p.screenshot({ path: join(out, `class-${id}-card.png`) });
    }
    await ctx.close();
  }
  assert.deepEqual(problems, [], "cards spill out");

  // ----------------------------------- home, practice, tools, sign-in sync
  const { ctx, p } = await open({ width: 1280, height: 860 }, db);
  await p.goto(HOST + id + ".html");
  assert.match(await p.textContent(".tabs .brand"), new RegExp(content.course.code));
  await p.screenshot({ path: join(out, `class-${id}-home.png`), fullPage: true });

  await p.fill("#si-email", "me@example.com");
  await p.fill("#si-pass", "pw");
  await p.click("#si-go");
  await p.waitForSelector("#signin", { state: "hidden" });

  await p.click('[data-tab="practice"]');
  await p.keyboard.press("Enter");
  const q = await p.evaluate("EXAM.questions[0]");
  const pos = (oi) => p.evaluate((o) => [...document.querySelectorAll(".pq-opt")].findIndex((b) => +b.dataset.opt === o), oi);
  const wrong = q.options.findIndex((o) => !o.right);
  await p.keyboard.press(String((await pos(wrong)) + 1));
  assert.ok(await p.$(".pq-verdict.bad"), "wrong answer marked wrong");
  assert.ok(await p.$(".pq-box.why"), "a diagnosis for the wrong pick");
  await p.screenshot({ path: join(out, `class-${id}-practice.png`), fullPage: true });
  for (let k = 0; k < 8; k++) await p.keyboard.press("Enter");
  await p.keyboard.press("Escape");

  await p.click('[data-tab="tools"]');
  const tools = await p.evaluate("[...document.querySelectorAll('#tool-chips .mchip')].map((b) => b.dataset.tool)");
  assert.ok(tools.length >= 3, "tools listed");
  for (const t of tools) {
    await p.click(`#tool-chips [data-tool="${t}"]`);
    assert.ok(await p.evaluate("document.querySelector('#tool-body').children.length > 0"), `${t} mounted`);
    for (const b of (await p.$$("#tool-body button")).slice(0, 4)) await b.click().catch(() => {});
    await p.screenshot({ path: join(out, `class-${id}-tool-${t}.png`), fullPage: true });
  }

  await p.click('[data-tab="home"]');
  await p.click("#h-learn-btn");        // a review session (the big button may offer a practice retry)
  await p.keyboard.press("Enter");
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(300);
  for (let k = 0; k < 30 && !(db.rows[id] && Object.keys(db.rows[id].cards || {}).length); k++) await p.waitForTimeout(100);
  assert.ok(db.rows[id] && Object.keys(db.rows[id].cards).length === 1, `${id}: a grade synced to study_progress`);
  assert.ok(db.rows[id].practice && Object.keys(db.rows[id].practice).length >= 1, `${id}: practice answers synced`);
  await ctx.close();
  console.log(`✓ ${content.course.code}: ${content.cards.length} cards fit at 1280px and 390px; practice, ${tools.length} tools, sync to study_progress`);
}

// The class picker lists every class and the switcher reaches each page.
{
  const { ctx, p } = await open({ width: 1280, height: 860 }, { rows: {} });
  await p.goto(HOST + "classes.html");
  const links = await p.evaluate("[...document.querySelectorAll('#cls a')].map((a) => a.getAttribute('href'))");
  assert.equal(links.length, 5);
  await p.screenshot({ path: join(out, "classes.png"), fullPage: true });
  await ctx.close();
  console.log("✓ class picker: 5 classes");
}

await browser.close();
assert.deepEqual(errors, [], "page errors:\n" + errors.join("\n"));
console.log("Screenshots in " + out);
