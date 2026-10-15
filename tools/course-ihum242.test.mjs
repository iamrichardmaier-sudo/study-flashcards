// node --test tools/course-ihum242.test.mjs
//
// IHUM 242's enriched deck and practice set: every card carries the full
// ECON 381-style small print, connections are real and reciprocal, every
// graph draws, dates stated on cards agree with the data behind the class
// tools (classes/ihum242.js: DYN, EVENTS, FIGURES, PLACES), and the practice
// questions are well formed.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");

const meta = (await import(new URL("courses/ihum242/course.mjs", root))).default;
const cards = (await import(new URL("courses/ihum242/cards.mjs", root))).default;
const practice = (await import(new URL("courses/ihum242/practice.mjs", root))).default;
const byId = new Map(cards.map((c) => [c.id, c]));

// The class tools' data, loaded the way tools/classes.test.mjs loads it.
let cfg = null;
vm.runInNewContext(read("classes/ihum242.js"), {
  window: { Study: { h() {}, esc: String, fmt: String, course: (c) => { cfg = c; } } }, Math, JSON, Date,
});
// Plain copies: arrays made in another vm context fail deepStrictEqual on their prototype.
const { DYN, EVENTS, FIGURES, PLACES } = JSON.parse(JSON.stringify(cfg.data));

// The shared graph library plus this class's graphs.
const gsb = { window: {} };
vm.runInNewContext(read("tools/graphs.js") + "\n" + read("tools/graphs/ihum242.js"), gsb);
const GRAPHS = gsb.window.GRAPHS;
const plain = (v) => JSON.parse(JSON.stringify(v));

const graphKey = (g) => (typeof g === "string" ? g : g.key);
const drawGraph = (g) => GRAPHS[graphKey(g)]((typeof g === "object" && g.args) || {});
const text = (c) => JSON.stringify(c);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every year (or year range) stated right after `key` as "key (1234…" or, unless parenOnly, "key in 1234". */
function yearsAfter(key, s, parenOnly) {
  const re = new RegExp(esc(key) + "[^()\\d.;<]{0,14}?" + (parenOnly ? "\\(" : "(?:\\(|\\bin\\s+)") + "(?:c\\.\\s*)?(\\d{3,4})(?:\\s*–\\s*(?:c\\.\\s*)?(\\d{3,4}))?(?!\\d)", "g");
  const out = [];
  for (const m of s.matchAll(re)) out.push([Number(m[1]), m[2] ? Number(m[2]) : null, m[0]]);
  return out;
}

const ORIGINAL_IDS = ["umma", "hijra", "quran", "hadith", "pillars", "caliph", "sunnishia", "sharia", "ulama", "madrasa",
  "waqf", "dhimmi", "wisdom", "falsafa", "sufism", "umayyad", "abbasid", "mamluk", "gunpowder", "devshirme", "millet",
  "qasida", "ghazal", "adab", "muqarnas", "arabesque", "mosqueparts", "tanzimat", "nahda", "modernism", "sykes", "orientalism"];

test("course is marked enriched and the deck keeps its 32 cards in order", () => {
  assert.equal(meta.enriched, true);
  assert.deepEqual(cards.map((c) => c.id), ORIGINAL_IDS);
  cards.forEach((c, k) => assert.equal(c.n, k + 1, `${c.id} out of order`));
});

test("every card has the full small print", () => {
  for (const c of cards) {
    const at = `card ${c.id}`;
    for (const f of ["id", "term", "simple", "example"]) assert.ok(typeof c[f] === "string" && c[f].trim(), `${at}: missing ${f}`);
    assert.ok(c.week >= 1 && c.week <= meta.units.length, `${at}: bad unit`);
    // One sentence: no full stop followed by a new capitalized sentence
    // (abbreviations like "c." and "e.g." aside).
    const flat = c.simple.replace(/\b(c|e\.g|i\.e|St|al)\.\s/g, "");
    assert.ok(!/[.!?]\s+[A-Z‘“]/.test(flat), `${at}: simple should be one sentence`);
    assert.ok(Array.isArray(c.more) && c.more.length >= 2 && c.more.length <= 3, `${at}: more needs 2–3 paragraphs`);
    assert.ok(Array.isArray(c.connections) && c.connections.length >= 2 && c.connections.length <= 5, `${at}: 2–5 connections`);
    if (c.played) assert.ok(c.played.length >= 2 && c.played.length <= 4, `${at}: played needs 2–4 steps`);
    if (c.numbers) {
      assert.ok(c.numbersSource && /Source|Britannica|Pew|GASTAT/.test(c.numbersSource), `${at}: numbers need a named source`);
      for (const row of c.numbers) assert.ok(Array.isArray(row) && row.length === 2 && row[0] && row[1], `${at}: numbers rows are [label, value]`);
    }
  }
  const n = (f) => cards.filter((c) => c[f]).length;
  assert.ok(n("graph") >= cards.length / 2, "at least half the cards have a graph");
  assert.ok(n("played") >= cards.length * 0.75, "most cards play the idea out");
});

test("HTML in cards and questions balances", () => {
  for (const item of [...cards, ...practice.questions]) {
    const s = text(item);
    for (const tag of ["b", "i", "sub", "sup", "span", "em"]) {
      const open = (s.match(new RegExp(`<${tag}[ >]`, "g")) || []).length;
      const close = (s.match(new RegExp(`</${tag}>`, "g")) || []).length;
      assert.equal(open, close, `${item.id}: unbalanced <${tag}>`);
    }
  }
});

test("connections exist, are distinct and reciprocal", () => {
  for (const c of cards) {
    assert.equal(new Set(c.connections).size, c.connections.length, `${c.id}: repeated connection`);
    for (const x of c.connections) {
      assert.notEqual(x, c.id, `${c.id} connects to itself`);
      assert.ok(byId.has(x), `${c.id}: connection ${x} doesn't exist`);
      assert.ok(byId.get(x).connections.includes(c.id), `${c.id} → ${x} isn't reciprocal`);
    }
  }
});

test("every graph exists, draws and has a caption", () => {
  const used = new Set();
  for (const item of [...cards, ...practice.questions]) {
    if (!item.graph) continue;
    const key = graphKey(item.graph);
    assert.ok(key.startsWith("ihum242"), `${item.id}: graph ${key} isn't an IHUM 242 graph`);
    assert.equal(typeof GRAPHS[key], "function", `${item.id}: graph ${key} doesn't exist`);
    const g = drawGraph(item.graph);
    assert.ok(String(g.svg).startsWith("<svg") && g.svg.endsWith("</svg>"), `${item.id}: ${key} didn't draw`);
    assert.ok(g.cap && g.cap.length > 20, `${item.id}: ${key} has no caption`);
    assert.ok(!/NaN|undefined/.test(g.svg), `${item.id}: ${key} drew NaN/undefined`);
    used.add(key);
  }
  // Every IHUM 242 graph is used somewhere.
  for (const key of Object.keys(GRAPHS).filter((k) => k.startsWith("ihum242") && typeof GRAPHS[k] === "function")) {
    assert.ok(used.has(key), `graph ${key} is never used`);
  }
});

test("highlight arguments name things the graphs know", () => {
  const dyn = new Set(DYN.map((d) => d[0]));
  const cities = new Set(GRAPHS.ihum242Cities.map((c) => c[0]));
  const modern = new Set(GRAPHS.ihum242ModernMod.map((m) => m[0]));
  for (const item of [...cards, ...practice.questions]) {
    const g = item.graph;
    if (!g || typeof g !== "object" || !g.args || g.args.hi == null) continue;
    const his = [].concat(g.args.hi);
    if (g.key === "ihum242Timeline") for (const h of his) assert.ok(dyn.has(h), `${item.id}: no dynasty ${h}`);
    if (g.key === "ihum242Map") for (const h of his) assert.ok(cities.has(h), `${item.id}: no city ${h}`);
    if (g.key === "ihum242Modern") for (const h of his) assert.ok(modern.has(h), `${item.id}: no modern event ${h}`);
  }
});

test("the timeline graph's dynasties match the Timeline tool's DYN", () => {
  assert.deepEqual(plain(GRAPHS.ihum242Dyn.map((d) => [d[0], d[2], d[3]])), DYN.map((d) => [d[0], d[1], d[2]]));
});

test("the map graph's cities sit where the Map game puts them", () => {
  const P = new Map(PLACES.cities.map((p) => [p[0], p]));
  for (const c of GRAPHS.ihum242Cities) {
    assert.ok(P.has(c[0]), `${c[0]} isn't in PLACES`);
    assert.equal(c[1], P.get(c[0])[1], `${c[0]} longitude`);
    assert.equal(c[2], P.get(c[0])[2], `${c[0]} latitude`);
  }
});

test("the modern-era graph's years match the Timeline tool's EVENTS", () => {
  for (const [y, label] of GRAPHS.ihum242ModernMod) {
    const ev = EVENTS.filter((e) => e[0] === y);
    // 1876 (the Ottoman constitution) is not in EVENTS; the rest must be.
    if (y === 1876) continue;
    assert.ok(ev.length, `${y} ${label}: not in EVENTS`);
  }
});

test("dynasty date ranges on cards agree with DYN", () => {
  const alias = { "Umayyad": "Umayyad caliphate", "Abbasid": "Abbasid caliphate", "Umayyads of Córdoba": "Umayyads of Córdoba",
    "Mamluk": "Mamluk sultanate", "Ottoman": "Ottoman", "Safavid": "Safavid", "Mughal": "Mughal", "Rashidun": "Rashidun",
    "Fatimid": "Fatimid", "Great Seljuk": "Great Seljuk", "Ayyubid": "Ayyubid", "Nasrid": "Nasrid", "Ilkhanate": "Ilkhanate" };
  let checked = 0;
  for (const [name, a, b] of DYN) {
    for (const c of cards) {
      for (const [y1, y2, m] of yearsAfter(alias[name], text(c), true)) {
        if (y2 == null) continue;
        assert.deepEqual([y1, y2], [a, b], `${c.id}: "${m}" vs DYN ${name} ${a}–${b}`);
        checked++;
      }
    }
  }
  // Numbers rows such as ["Abbasid caliphate", "750–1258"] or ["Ottoman", "c. 1299–1922"].
  for (const [name, a, b] of DYN) {
    for (const c of cards) for (const [label, value] of c.numbers || []) {
      if (label !== alias[name] && label !== name) continue;
      const ys = (value.match(/\d{3,4}/g) || []).map(Number);
      assert.deepEqual(ys, [a, b], `${c.id}: numbers "${label}: ${value}" vs DYN ${a}–${b}`);
      checked++;
    }
  }
  // Córdoba's branch is written "Córdoba (756–1031)".
  for (const c of cards) for (const [y1, y2, m] of yearsAfter("Córdoba", text(c), true)) {
    if (y2 == null) continue;
    assert.deepEqual([y1, y2], [756, 1031], `${c.id}: "${m}"`);
    checked++;
  }
  assert.ok(checked >= 8, `only ${checked} dynasty ranges found on cards`);
});

test("event and battle years on cards agree with EVENTS and PLACES", () => {
  // keyword on a card → the event in EVENTS (by its title) that dates it
  const fromEvents = [
    ["Hijra", "Hijra to Medina"], ["Karbala", "Karbala"], ["Dome of the Rock", "Dome of the Rock"],
    ["Iberia", "Conquest of Iberia"], ["founded Baghdad", "Baghdad founded"], ["Baghdad founded", "Baghdad founded"],
    ["Manzikert", "Manzikert"], ["‘Ayn Jalut", "‘Ayn Jalut"], ["Tanzimat", "Tanzimat"], ["Sykes–Picot", "Sykes–Picot"],
    ["Orientalism", "Orientalism"], ["Süleymaniye Mosque, Istanbul", "Süleymaniye"], ["Constantinople taken", "Constantinople"],
  ];
  const year = (title) => {
    const ev = EVENTS.filter((e) => e[2].includes(title));
    assert.equal(ev.length, 1, `EVENTS has ${ev.length} entries for ${title}`);
    return ev[0][0];
  };
  const pairs = fromEvents.map(([k, title]) => [k, year(title)]);
  // Battles in the map game: "Yarmuk (636)" etc.
  for (const [label] of PLACES.battles) {
    const m = label.match(/^(.+?) \((\d{3,4})/);
    for (const k of m[1].split(" / ")) pairs.push([k, Number(m[2])]);
  }
  let checked = 0;
  for (const [key, y] of pairs) {
    for (const c of cards) {
      for (const [y1, y2, m] of yearsAfter(key, text(c))) {
        assert.ok(y1 === y || y2 === y, `${c.id}: "${m}" vs data year ${y} for ${key}`);
        checked++;
      }
    }
  }
  // Numbers rows that name an event.
  const rows = cards.flatMap((c) => (c.numbers || []).map((r) => [c.id, r[0], r[1]]));
  for (const [id, label, value] of rows) {
    for (const [key, y] of pairs) {
      if (!label.startsWith(key)) continue;
      const ys = (value.match(/\d{3,4}/g) || []).map(Number);
      assert.ok(ys.includes(y), `${id}: numbers "${label}: ${value}" vs data year ${y}`);
      checked++;
    }
  }
  assert.ok(checked >= 10, `only ${checked} event years found on cards`);
});

test("life dates on cards agree with FIGURES", () => {
  let checked = 0;
  for (const [name, dates] of FIGURES) {
    const short = name.replace(/ \(.*\)$/, "");
    const re = new RegExp(esc(short) + "\\s*\\(([^()]*\\d{3,4}[^()]*)\\)", "g");
    for (const c of cards) {
      for (const m of text(c).matchAll(re)) {
        if (!/^(c\. )?\d{3,4}–(c\. )?\d{3,4}$/.test(m[1])) continue;   // e.g. "(d. 1092)" is not a life span
        assert.equal(m[1], dates, `${c.id}: ${short} (${m[1]}) vs FIGURES ${dates}`);
        checked++;
      }
    }
  }
  assert.ok(checked >= 5, `only ${checked} life spans found on cards`);
});

test("Rashidun reign dates are consistent across cards and graph", () => {
  const caliph = byId.get("caliph");
  const reigns = Object.fromEntries(caliph.numbers.slice(0, 4));
  assert.deepEqual(reigns, { "Abu Bakr": "632–634", "‘Umar": "634–644", "‘Uthman": "644–656", "‘Ali": "656–661" });
  const svg = GRAPHS.ihum242Succession().svg;
  for (const r of Object.values(reigns)) assert.ok(svg.includes(r), `succession graph lacks ${r}`);
});

test("practice questions are well formed", () => {
  const secs = new Set(practice.sections.map((s) => s.id));
  const ids = new Set();
  const perSection = {};
  for (const q of practice.questions) {
    assert.ok(!ids.has(q.id), `duplicate question ${q.id}`);
    ids.add(q.id);
    assert.ok(secs.has(q.section), `${q.id}: unknown section`);
    perSection[q.section] = (perSection[q.section] || 0) + 1;
    assert.equal(q.kind, "one", `${q.id}: kind`);
    assert.equal(q.options.filter((o) => o.right).length, 1, `${q.id}: exactly one right option`);
    assert.equal(new Set(q.options.map((o) => o.t)).size, q.options.length, `${q.id}: repeated option`);
    for (const o of q.options) assert.ok(o.why && o.why.length > 15, `${q.id}: option "${o.t}" needs a why`);
    assert.ok(q.pattern && q.pattern.length > 40, `${q.id}: pattern`);
    assert.ok(Array.isArray(q.steps) && q.steps.length >= 3 && q.steps.length <= 5, `${q.id}: 3–5 steps`);
    assert.ok(Array.isArray(q.cards) && q.cards.length >= 2, `${q.id}: related cards`);
    for (const id of q.cards) assert.ok(byId.has(id), `${q.id}: card ${id} doesn't exist`);
    const unit = meta.units.findIndex((u) => u.id === q.section) + 1;
    assert.equal(q.week, unit, `${q.id}: week should match its section's unit`);
  }
  for (const s of practice.sections) {
    const n = perSection[s.id] || 0;
    assert.equal(s.sub, `${n} question${n === 1 ? "" : "s"}`, `section ${s.id} count label`);
  }
});
