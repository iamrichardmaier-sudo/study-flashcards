// Builds the deck and the Scriptable script.
//
//   node tools/build.mjs
//
// Reads cards/src/week*.mjs, checks them, writes cards/econ381.json (the
// whole deck as plain data) and scriptable/econ381-review.js (the one file
// that gets pasted into Scriptable, with the deck, graphs and scheduler
// embedded).

import { readFileSync, writeFileSync } from "node:fs";
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
writeFileSync(join(root, "scriptable/econ381-review.js"), script);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(0) + " KB";
const count = (f) => cards.filter((c) => c[f] && (!Array.isArray(c[f]) || c[f].length)).length;
console.log(
  `Built ${cards.length} cards (${starred} ★) → scriptable/econ381-review.js (${kb(script)})\n` +
  `  with graph: ${count("graph")}, numbers: ${count("numbers")}, played out: ${count("played")}, ` +
  `example: ${count("example")}, connections: ${count("connections")}`,
);
