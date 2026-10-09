// Builds the deck and the Scriptable script.
//
//   node tools/build.mjs
//
// Reads cards/src/week*.mjs, checks them, writes cards/econ381.json (the
// whole deck as plain data) and scriptable/econ381-review.js (the one file
// that gets pasted into Scriptable, with the deck, graphs and scheduler
// embedded).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";
import { weeks } from "../cards/src/helpers.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

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
  body: read("tools/page/page.html"),
  js: read("tools/page/page.js"),
};
fill("/*__PAGE__*/ null", JSON.stringify(page));
writeFileSync(join(root, "scriptable/econ381-review.js"), script);

// ------------------------------------------------------------- website
//
// The same review page, plus the web menu, keyboard and saving
// (tools/web/). Written as page content only: the Artifact publisher wraps
// it in its own <html>/<head>/<body> skeleton.

const split = (src, marker, value) => {
  if (!src.includes(marker)) throw new Error(`missing ${marker}`);
  return src.split(marker).join(value);
};
const safe = (s) => s.replace(/<\/script/gi, "<\\/script");
const webUI = {
  tipFront: "Enter or \u2192 to flip \u00b7 or click the card",
  tipBack: "\u2192 Confident  \u00b7  \u2190 Shaky  \u00b7  \u2191\u2193 Missed  \u00b7  Enter flips back",
  thirds: false,
};
let webJs = page.js;
webJs = split(webJs, "/*__WEEKS__*/[]", JSON.stringify(weeks).replace(/</g, "\\u003c"));
webJs = split(webJs, "/*__UI__*/{}", JSON.stringify(webUI));
let webBody = page.body;
webBody = split(webBody, "__QUIT__", "");
webBody = split(webBody, "__DONE_ACTIONS__", '<button class="btn menu" id="toMenu" type="button">Back to menu <kbd>Enter</kbd></button>');
const hostSrc = split(read("tools/web/host.js"), "/*__DECK__*/ null", JSON.stringify(deck).replace(/</g, "\\u003c"));
// The Supabase project the Arabic app uses. The publishable key is meant to
// ship to browsers; row-level security keeps each person's row private.
const SUPABASE = {
  kind: "supabase",
  url: "https://fphpcfecgnfoogfaeihu.supabase.co",
  key: "sb_publishable_UFHFJ-b988nrZ_QP2AbQ4g_64Jq_5s2",
};
const withBackend = (b) => split(hostSrc, '/*__BACKEND__*/ { kind: "artifact" }', JSON.stringify(b));
const host = withBackend({ kind: "artifact" });

// The Models tab: the engine, chart helpers, the six model definitions and
// the dashboard, in that order (each uses the ones before it).
const modelFiles = ["engine.js", "charts.js", "defs/production.js", "defs/funds.js", "defs/money.js",
  "defs/flows.js", "defs/solow.js", "defs/golden.js", "ui.js"];
const modelsJs = "var MODELS = [];\n" + modelFiles.map((f) => read("tools/models/" + f)).join("\n");

const web =
  "<title>ECON 381 Flashcards</title>\n" +
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">\n' +
  "<style>\n" + page.css + "\n" + read("tools/web/web.css") + "\n" + read("tools/models/models.css") + "</style>\n" +
  read("tools/web/web.html") + "\n" + webBody + "\n" +
  "<script>\n" + safe(graphSrc) + "\n</script>\n" +
  "<script>\n" + safe(webJs) + "</script>\n" +
  "<script>\n" + safe(modelsJs) + "\n</script>\n" +
  "<script>\n" + safe(read("tools/schedule.js")) + "\n" + safe(host) + "</script>\n";
mkdirSync(join(root, "web"), { recursive: true });
writeFileSync(join(root, "web/econ381.html"), web);

// The same app as its own website (GitHub Pages), saving to Supabase.
const siteBody = web.replace(safe(host), () => safe(withBackend(SUPABASE)));
if (siteBody === web) throw new Error("couldn't swap the backend for the site build");
const site = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">\n' +
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' +
  '<meta name="description" content="ECON 381 Midterm 1: flashcards and interactive model walkthroughs.">\n' +
  '<meta name="theme-color" content="#FBF8F3">\n' +
  "<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}" +
  "body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n" +
  "</head><body>\n" + siteBody + "</body></html>\n";
mkdirSync(join(root, "site"), { recursive: true });
writeFileSync(join(root, "site/index.html"), site);
writeFileSync(join(root, "site/.nojekyll"), "");
// The same page at the repo root, so GitHub Pages serves the app whether its
// Source is "GitHub Actions" (deploys site/) or "Deploy from a branch" (main, root).
writeFileSync(join(root, "index.html"), site);
writeFileSync(join(root, ".nojekyll"), "");

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(0) + " KB";
const count = (f) => cards.filter((c) => c[f] && (!Array.isArray(c[f]) || c[f].length)).length;
console.log(
  `Built ${cards.length} cards (${starred} ★) → scriptable/econ381-review.js (${kb(script)}), web/econ381.html (${kb(web)}), site/index.html\n` +
  `  with graph: ${count("graph")}, numbers: ${count("numbers")}, played out: ${count("played")}, ` +
  `example: ${count("example")}, connections: ${count("connections")}`,
);
