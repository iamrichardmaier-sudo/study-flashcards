// Builds the deck and the Scriptable script.
//
//   node tools/build.mjs
//
// Reads cards/src/week*.mjs, checks them, writes cards/econ381.json (the
// whole deck as plain data) and scriptable/econ381-review.js (the one file
// that gets pasted into Scriptable, with the deck, graphs and scheduler
// embedded).

import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { weeks } from "../cards/src/helpers.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(0) + " KB";

const cards = [];
for (let w = 1; w <= weeks.length; w++) {
  const mod = await import(join(root, "cards/src", `week${w}.mjs`));
  cards.push(...mod.default);
}

// ---------------------------------------------------------------- checks

const graphSrc = read("tools/graphs.js");
const sandbox = { window: {} };
vm.runInNewContext(graphSrc, sandbox);
const GRAPHS = sandbox.window.GRAPHS;

const EXPECTED_CARDS = 126;
const EXPECTED_STARRED = 65;   // "★ = tested directly on the practice midterm (65 cards)"

const errors = [];
const fail = (c, msg) => errors.push(`#${c.n} ${c.id}: ${msg}`);
const ids = new Map();

cards.forEach((c, k) => {
  if (c.n !== k + 1) fail(c, `out of order (expected n = ${k + 1})`);
  if (ids.has(c.id)) fail(c, `duplicate id (also #${ids.get(c.id)})`);
  ids.set(c.id, c.n);
  for (const f of ["id", "n", "week", "term", "simple"]) if (!c[f]) fail(c, `missing ${f}`);
  if (!Array.isArray(c.tags) || !c.tags.length) fail(c, "missing tags");
  c.starred = !!c.starred;
  // Every card carries at least some small print under the definition.
  if (!c.more && !c.example && !c.played && !c.numbers) fail(c, "no detail sections");
  if (c.numbers && !c.numbersSource) fail(c, "numbers without a source");
  for (const n of c.numbers || []) if (!Array.isArray(n) || n.length !== 2) fail(c, "numbers rows must be [label, value]");
});

for (const c of cards) {
  for (const id of c.connections || []) {
    if (id === c.id) fail(c, "connects to itself");
    else if (!ids.has(id)) fail(c, `connection "${id}" doesn't exist`);
  }
  if (c.graph) {
    const key = typeof c.graph === "string" ? c.graph : c.graph.key;
    if (!GRAPHS[key]) fail(c, `graph "${key}" doesn't exist`);
    else {
      const g = GRAPHS[key](c.graph.args || {});
      if (!g || !String(g.svg).startsWith("<svg")) fail(c, `graph "${key}" didn't draw`);
    }
  }
  // HTML in card text must at least balance its tags, since it goes straight
  // into innerHTML.
  const text = JSON.stringify(c);
  for (const tag of ["b", "i", "sub", "sup", "span"]) {
    const open = (text.match(new RegExp(`<${tag}[ >]`, "g")) || []).length;
    const close = (text.match(new RegExp(`</${tag}>`, "g")) || []).length;
    if (open !== close) fail(c, `unbalanced <${tag}> (${open} open, ${close} close)`);
  }
}

if (cards.length !== EXPECTED_CARDS) errors.push(`expected ${EXPECTED_CARDS} cards, found ${cards.length}`);
const starred = cards.filter((c) => c.starred).length;
if (starred !== EXPECTED_STARRED) errors.push(`expected ${EXPECTED_STARRED} starred cards, found ${starred}`);

if (errors.length) {
  console.error("Deck check failed:\n  " + errors.join("\n  "));
  process.exit(1);
}

// ----------------------------------------------------------------- write

const deck = { title: "ECON 381 · Midterm 1", weeks, cards };
writeFileSync(join(root, "cards/econ381.json"), JSON.stringify(deck, null, 1) + "\n");

let script = read("tools/review-template.js");
const fill = (marker, value) => {
  if (!script.includes(marker)) throw new Error(`template is missing ${marker}`);
  // A function replacement so "$" in the data is never read as a pattern.
  script = script.replace(marker, () => value);
};
fill("/*__SCHEDULE__*/", read("tools/schedule.js").trim());
fill("/*__DECK__*/ null", JSON.stringify(deck));
fill('/*__GRAPHS__*/ ""', JSON.stringify(graphSrc));
const page = {
  css: read("tools/page/page.css"),
  body: read("tools/page/page.html").split("__CODE__").join("ECON 381"),
  js: read("tools/page/page.js"),
};
fill("/*__PAGE__*/ null", JSON.stringify(page));
writeFileSync(join(root, "scriptable/econ381-review.js"), script);

// ------------------------------------------------------------- website
//
// One app for every class: the same review page plus the web menu,
// keyboard, Practice drill and saving (tools/web/, tools/practice/), built
// once per course. ECON 381 adds its Models tab; the other classes add a
// Tools tab with their own interactive tools (classes/<id>.js on
// tools/kit/kit.js). Written as page content only: the Artifact publisher
// and the site wrapper below add the <html>/<head>/<body> skeleton.

const split = (src, marker, value) => {
  if (!src.includes(marker)) throw new Error(`missing ${marker}`);
  return src.split(marker).join(value);
};
const safe = (s) => s.replace(/<\/script/gi, "<\\/script");
const json = (v) => JSON.stringify(v).replace(/</g, "\\u003c");
const webUI = {
  tipFront: "Enter or → to flip · or click the card",
  tipBack: "→ Confident  ·  ← Shaky  ·  ↑↓ Missed  ·  Enter flips back",
  thirds: false,
};
// The Supabase project the Arabic app uses. The publishable key is meant to
// ship to browsers; row-level security keeps each person's rows private.
const SUPABASE = {
  kind: "supabase",
  url: "https://fphpcfecgnfoogfaeihu.supabase.co",
  key: "sb_publishable_UFHFJ-b988nrZ_QP2AbQ4g_64Jq_5s2",
};

/** Checks a practice set: the drill needs one right answer (or a set for
 *  select-all), a diagnosis on every wrong option, and a pattern and steps. */
function checkPractice(P, ids, where, lenient) {
  const seenQ = new Set(), secs = new Set(P.sections.map((x) => x.id));
  const bad = (q, msg) => { throw new Error(`${where} practice ${q.id}: ${msg}`); };
  for (const q of P.questions) {
    if (seenQ.has(q.id)) bad(q, "duplicate id");
    seenQ.add(q.id);
    if (!secs.has(q.section)) bad(q, "unknown section");
    const rights = q.options.filter((o) => o.right).length;
    if (q.kind === "one" && rights !== 1) bad(q, `needs exactly one right option, has ${rights}`);
    if (!["one", "all"].includes(q.kind)) bad(q, "kind must be one or all");
    for (const o of q.options) {
      if (q.kind === "one" && !o.right && !o.why) bad(q, "a wrong option has no diagnosis: " + o.t);
      if (q.kind === "all" && !o.why) bad(q, "select-all options each need a why");
    }
    if (!lenient && (!q.pattern || !q.steps || !q.steps.length)) bad(q, "needs a pattern and steps");
    for (const id of q.cards || []) if (!ids.has(id)) bad(q, `flashcard "${id}" doesn't exist`);
    if (q.graph) {
      const key = typeof q.graph === "string" ? q.graph : q.graph.key;
      if (!GRAPHS[key]) bad(q, `graph "${key}" doesn't exist`);
    }
    const text = JSON.stringify(q);
    for (const tag of ["b", "i", "sub", "sup", "em"]) {
      const open = (text.match(new RegExp(`<${tag}[ >]`, "g")) || []).length;
      const close = (text.match(new RegExp(`</${tag}>`, "g")) || []).length;
      if (open !== close) bad(q, `unbalanced <${tag}>`);
    }
  }
}

/** Checks one class's deck the way the ECON 381 deck is checked above. A
 *  course marked `enriched` must also carry the full small print. */
function checkCourseCards(cs, meta, where) {
  const problems = [], cids = new Map();
  const bad = (c, msg) => problems.push(`${where} #${c.n} ${c.id}: ${msg}`);
  cs.forEach((c, k) => {
    if (c.n !== k + 1) bad(c, `out of order (expected n = ${k + 1})`);
    if (cids.has(c.id)) bad(c, "duplicate id");
    cids.set(c.id, c.n);
    for (const f of ["id", "n", "week", "term", "simple"]) if (!c[f]) bad(c, `missing ${f}`);
    if (!(c.week >= 1 && c.week <= meta.units.length)) bad(c, `unit ${c.week} doesn't exist`);
    c.starred = !!c.starred;
    if (meta.enriched) {
      if (!c.more || !c.more.length) bad(c, "no additional info");
      if (!c.example) bad(c, "no real-world example");
      if (!c.connections || c.connections.length < 2) bad(c, "needs at least 2 connections");
      if (c.numbers && !c.numbersSource) bad(c, "numbers without a source");
    }
    if (c.graph) {
      const key = typeof c.graph === "string" ? c.graph : c.graph.key;
      if (!GRAPHS[key]) bad(c, `graph "${key}" doesn't exist`);
      else {
        const g = GRAPHS[key](c.graph.args || {});
        if (!g || !String(g.svg).startsWith("<svg")) bad(c, `graph "${key}" didn't draw`);
      }
    }
    const text = JSON.stringify(c);
    for (const tag of ["b", "i", "sub", "sup", "span"]) {
      const open = (text.match(new RegExp(`<${tag}[ >]`, "g")) || []).length;
      const close = (text.match(new RegExp(`</${tag}>`, "g")) || []).length;
      if (open !== close) bad(c, `unbalanced <${tag}>`);
    }
  });
  for (const c of cs) for (const x of c.connections || []) {
    if (x === c.id) bad(c, "connects to itself");
    else if (!cids.has(x)) bad(c, `connection "${x}" doesn't exist`);
  }
  if (problems.length) throw new Error(problems.join("\n"));
  return cids;
}

const modelFiles = ["engine.js", "charts.js", "defs/production.js", "defs/funds.js", "defs/money.js",
  "defs/flows.js", "defs/solow.js", "defs/golden.js", "ui.js"];
const modelsJs = "var MODELS = [];\n" + modelFiles.map((f) => read("tools/models/" + f)).join("\n");

/** One class's app as page content, for the given saving backend. */
function appContent({ course, deck, examJs, extraJs, extraCss, backend, content }) {
  let js = page.js;
  js = split(js, "/*__WEEKS__*/[]", json(deck.weeks));
  js = split(js, "/*__UI__*/{}", JSON.stringify(webUI));
  let body = read("tools/page/page.html");
  body = split(body, "__QUIT__", "");
  body = split(body, "__CODE__", course.code);
  body = split(body, "__DONE_ACTIONS__", '<button class="btn menu" id="toMenu" type="button">Back to menu <kbd>Enter</kbd></button>');
  let shell = read("tools/web/web.html");
  shell = split(shell, "__CODE__", course.code);
  shell = split(shell, "__TAGLINE__", course.tagline);
  shell = split(shell, "__PRACTICE__", course.practiceHeading);
  shell = split(shell, "__N__", String(deck.cards.length));
  shell = shell.replace(course.models ? /<!--TOOLS-->[\s\S]*?<!--\/TOOLS-->/ : /<!--MODELS-->[\s\S]*?<!--\/MODELS-->/, "")
    .replace(/<!--\/?(MODELS|TOOLS)-->\n?/g, "");
  let host = read("tools/web/host.js");
  host = host.replace(/\/\*__COURSE__\*\/ \{[^\n]*\};/, () => "/*__COURSE__*/ " + json(course) + ";");
  host = split(host, '/*__BACKEND__*/ { kind: "artifact" }', JSON.stringify(backend));
  return "<title>" + course.code + " · " + course.name + "</title>\n" +
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">\n' +
    "<style>\n" + page.css + "\n" + read("tools/web/web.css") + "\n" + read("tools/models/models.css") + "\n" +
    read("tools/practice/practice.css") + "\n" + (extraCss || "") + "</style>\n" +
    shell + "\n" + body + "\n" +
    "<script>\n" + safe(graphSrc) + "\n</script>\n" +
    "<script>\n" + safe(js) + "</script>\n" +
    "<script>\n" + safe(extraJs) + "\n</script>\n" +
    "<script>\n" + safe(examJs) + "\n" +
      safe(split(split(read("tools/web/content.js"), "/*__DECK__*/ null", json(deck)), '/*__CONTENT__*/ { course: "x", version: "", rev: 0 }', json(content))) +
      "\n" + safe(read("tools/practice/ui.js")) + "\n</script>\n" +
    "<script>\n" + safe(read("tools/schedule.js")) + "\n" + safe(host) + "</script>\n";
}

/** The posted site's full document around an app (with the class switcher). */
function sitePage(content, description) {
  return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' +
    '<meta name="description" content="' + description.replace(/"/g, "&quot;") + '">\n' +
    '<meta name="theme-color" content="#FBF8F3">\n' +
    "<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}" +
    "body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n" +
    "</head><body>\n" + content +
    // The class switcher shared by every class page (classes/nav.js).
    // Website only: the Artifact and Scriptable builds stay self-contained.
    '<script src="classes/nav.js"></script>\n' +
    "</body></html>\n";
}

mkdirSync(join(root, "site/content"), { recursive: true });
// The content's build stamp: when the commit it was built on was made.
// Same for every build of one commit, and later for later commits.
let REV = 0;
try { REV = Number(execSync("git log -1 --format=%ct", { cwd: root }).toString().trim()) || 0; } catch { /* not a git checkout */ }
/** What Supabase holds for a class, and the stamp the page carries. */
function contentOf(course, deck, exam) {
  const body = { course: { id: course.id, code: course.code, name: course.name, color: course.color, tagline: course.tagline, units: deck.weeks },
    cards: deck.cards, exam };
  const version = sha(JSON.stringify(body));
  return { body: { ...body, version, rev: REV }, stamp: { course: course.id, version, rev: REV } };
}
mkdirSync(join(root, "web"), { recursive: true });
const contents = [];          // what goes to Supabase (tools/supabase-sync.mjs)
const sha = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

// ECON 381.
{
  const sb = { window: {} };
  new Function("window", read("tools/practice/questions.js") + "\nwindow.EXAM = EXAM;")(sb.window);
  checkPractice(sb.window.EXAM, ids, "econ381");
  const course = { id: "econ381", code: "ECON 381", name: "Intermediate Macro", color: "#1F4E8C",
    tagline: "Midterm 1 · the terms and the models behind them.", practiceHeading: sb.window.EXAM.heading,
    localKey: "econ381-progress", phone: true, models: true, tools: false };
  const examJs = read("tools/practice/questions.js");
  const content = contentOf(course, deck, sb.window.EXAM);
  const web = appContent({ course, deck, examJs, extraJs: modelsJs, backend: { kind: "artifact" }, content: content.stamp });
  writeFileSync(join(root, "web/econ381.html"), web);
  const siteApp = appContent({ course, deck, examJs, extraJs: modelsJs, backend: { ...SUPABASE, table: "econ381_progress" }, content: content.stamp });
  const site = sitePage(siteApp, "ECON 381 Midterm 1: flashcards, the practice midterm and interactive model walkthroughs.");
  writeFileSync(join(root, "site/index.html"), site);
  writeFileSync(join(root, "index.html"), site);
  contents.push(content);
  console.log(`Built ECON 381: ${cards.length} cards (${starred} ★) → scriptable/econ381-review.js (${kb(script)}), web/econ381.html (${kb(web)}), site/index.html`);
}

// The other classes: courses/<id>/{course,cards,practice}.mjs + classes/<id>.js tools.
const COURSES = ["econ210", "econ378", "econ380", "ihum242"];
for (const id of COURSES) {
  const meta = (await import(join(root, `courses/${id}/course.mjs`))).default;
  const cs = (await import(join(root, `courses/${id}/cards.mjs`))).default;
  const P = (await import(join(root, `courses/${id}/practice.mjs`))).default;
  const where = id;
  const cids = checkCourseCards(cs, meta, where);
  checkPractice(P, cids, where, !meta.enriched);
  const deck = { title: meta.code + " · " + meta.name, weeks: meta.units, cards: cs };
  const exam = { title: P.title, heading: P.heading || "Practice", sections: P.sections, questions: P.questions };
  const course = { id, code: meta.code, name: meta.name, color: meta.color, tagline: meta.tagline,
    practiceHeading: exam.heading, localKey: `study-${id}-progress`, phone: false, models: false, tools: true };
  const extraJs = read("tools/kit/kit.js") + "\n" + read(`classes/${id}.js`);
  const content = contentOf(course, deck, exam);
  const siteApp = appContent({ course, deck, examJs: "var EXAM = " + json(exam) + ";", extraJs, content: content.stamp,
    extraCss: read("tools/kit/kit.css"), backend: { ...SUPABASE, table: "study_progress", course: id } });
  const site = sitePage(siteApp, `${meta.code} ${meta.name}: flashcards, practice questions and interactive tools.`);
  writeFileSync(join(root, `site/${id}.html`), site);
  writeFileSync(join(root, `${id}.html`), site);
  contents.push(content);
  const n = (f) => cs.filter((c) => c[f] && (!Array.isArray(c[f]) || c[f].length)).length;
  console.log(`Built ${meta.code}: ${cs.length} cards (graph ${n("graph")}, connections ${n("connections")}, example ${n("example")}), ${exam.questions.length} questions → site/${id}.html`);
}

// What Supabase holds: one file per class, served next to the site and
// loaded into the study_* tables by tools/supabase-sync.mjs.
for (const c of contents) writeFileSync(join(root, `site/content/${c.body.course.id}.json`), JSON.stringify(c.body) + "\n");

// The class picker and the switcher, copied into site/ so both Pages modes
// serve them.
mkdirSync(join(root, "site/classes"), { recursive: true });
if (!read("classes.html").includes('src="classes/nav.js"')) throw new Error("classes.html doesn't load the class switcher");
copyFileSync(join(root, "classes.html"), join(root, "site/classes.html"));
for (const f of ["nav.js", "study.css"]) copyFileSync(join(root, "classes", f), join(root, "site/classes", f));
writeFileSync(join(root, "site/.nojekyll"), "");
writeFileSync(join(root, ".nojekyll"), "");
