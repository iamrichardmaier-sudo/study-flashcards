// node --test tools/course-econ210.test.mjs
//
// ECON 210 · Career Prep: every card carries the full ECON 381-style small
// print, connections are reciprocal, the arithmetic in the worked examples
// (offer comparisons, market sizing, the three-statement walk, STAR timing)
// is right, every graph draws, and the practice set is well formed.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");
const meta = (await import(new URL("courses/econ210/course.mjs", root))).default;
const cards = (await import(new URL("courses/econ210/cards.mjs", root))).default;
const P = (await import(new URL("courses/econ210/practice.mjs", root))).default;
const byId = Object.fromEntries(cards.map((c) => [c.id, c]));

const sb = { window: {} };
vm.runInNewContext(read("tools/graphs.js") + "\n" + read("tools/graphs/econ210.js"), sb);
const G = sb.window.GRAPHS;
const gkey = (g) => (typeof g === "string" ? g : g.key);

/** The 28 cards and their units, as before the upgrade (no cards added or removed). */
const IDS = ["elevator", "infoint", "warmintro", "followup", "coldemail", "behavioral", "star", "casei", "sizing",
  "technical", "superday", "whyus", "atsresume", "bullet", "liheadline", "liabout", "onepage", "mgmtconsult",
  "econconsult", "ib", "datasci", "govpolicy", "econphd", "lawschool", "returnoffer", "exploding", "totalcomp", "negotiate"];
const UNIT = { 1: 5, 2: 7, 3: 5, 4: 7, 5: 4 };

/** Pulls every dollar amount out of a string as numbers. */
const dollars = (s) => [...s.matchAll(/\$([\d,]+)/g)].map((m) => Number(m[1].replace(/,/g, "")));
const plain = (s) => s.replace(/<[^>]+>/g, "");

test("course is enriched and the deck keeps its ids, order and units", () => {
  assert.equal(meta.enriched, true);
  assert.deepEqual(cards.map((c) => c.id), IDS);
  cards.forEach((c, k) => assert.equal(c.n, k + 1, c.id));
  for (const [w, n] of Object.entries(UNIT)) assert.equal(cards.filter((c) => c.week === +w).length, n, `unit ${w}`);
});

test("every card has the full small print", () => {
  for (const c of cards) {
    assert.ok(c.term && c.simple, c.id);
    assert.ok(Array.isArray(c.more) && c.more.length >= 2 && c.more.length <= 3, `${c.id}: more should be 2–3 paragraphs`);
    assert.ok(typeof c.example === "string" && c.example.length > 80, `${c.id}: example`);
    assert.ok(Array.isArray(c.connections) && c.connections.length >= 2 && c.connections.length <= 5, `${c.id}: 2–5 connections`);
    if (c.played) assert.ok(c.played.length >= 2 && c.played.length <= 4, `${c.id}: played is 2–4 steps`);
    if (c.numbers) {
      assert.ok(c.numbersSource && /\d{4}/.test(c.numbersSource), `${c.id}: numbers need a dated source`);
      for (const row of c.numbers) assert.ok(Array.isArray(row) && row.length === 2, `${c.id}: numbers rows are [label, value]`);
    }
    // HTML balances, since it goes straight into innerHTML.
    const text = JSON.stringify(c);
    for (const tag of ["b", "i", "sub", "sup", "span"]) {
      const open = (text.match(new RegExp(`<${tag}[ >]`, "g")) || []).length;
      const close = (text.match(new RegExp(`</${tag}>`, "g")) || []).length;
      assert.equal(open, close, `${c.id}: unbalanced <${tag}>`);
    }
  }
  const n = (f) => cards.filter((c) => c[f]).length;
  assert.ok(n("graph") >= cards.length / 2, "at least half the cards have a graph");
  assert.ok(n("numbers") >= 8, "about a third of the cards have sourced numbers");
  assert.ok(n("played") >= 20, "most cards have a worked example");
});

test("connections exist, aren't self-links, and are reciprocal", () => {
  for (const c of cards) {
    assert.equal(new Set(c.connections).size, c.connections.length, `${c.id}: duplicate connection`);
    for (const x of c.connections) {
      assert.notEqual(x, c.id, `${c.id} connects to itself`);
      assert.ok(byId[x], `${c.id}: unknown connection ${x}`);
      assert.ok(byId[x].connections.includes(c.id), `${c.id} → ${x} is not reciprocal`);
    }
  }
});

test("every card and practice graph draws an svg", () => {
  const specs = [...cards.filter((c) => c.graph).map((c) => c.graph), ...P.questions.filter((q) => q.graph).map((q) => q.graph)];
  for (const g of specs) {
    assert.ok(gkey(g).startsWith("econ210"), `${gkey(g)}: class graphs are prefixed econ210`);
    const out = G[gkey(g)](g.args || {});
    assert.ok(out.svg.startsWith("<svg") && out.svg.endsWith("</svg>") && out.cap, gkey(g));
    assert.ok(!/NaN|undefined/.test(out.svg), `${gkey(g)} drew NaN/undefined`);
  }
});

test("offer comparison arithmetic (totalcomp card, its graph, practice Q10)", () => {
  const A = { base: 75000, sign: 0, match: 0.03 }, B = { base: 70000, sign: 10000, match: 0.06 };
  const yr = (o, y) => o.base + (y === 1 ? o.sign : 0) + o.base * o.match;
  assert.equal(yr(A, 1), 77250);
  assert.equal(yr(B, 1), 84200);
  assert.equal(yr(B, 1) - yr(A, 1), 6950);
  assert.equal(yr(A, 2) - yr(B, 2), 3050);
  assert.equal(yr(A, 1) + yr(A, 2), 154500);
  assert.equal(yr(B, 1) + yr(B, 2), 158400);
  assert.equal(A.base - B.base, 5000, "Q10 says A pays $5k more base");

  const played = byId.totalcomp.played.map(plain).join(" ");
  for (const v of [77250, 84200, 6950, 74200, 3050, 154500, 158400, 2250, 4200]) assert.ok(dollars(played).includes(v), `totalcomp played shows $${v}`);
  const q10 = P.questions.find((q) => q.id === "p10").steps.join(" ");
  for (const v of [77250, 84200, 6950, 74200, 3050]) assert.ok(dollars(q10).includes(v), `Q10 steps show $${v}`);
  const cap = G.econ210Offer().cap;
  assert.ok(dollars(cap).includes(6950) && dollars(cap).includes(3050), "offer graph caption matches");
});

test("negotiation arithmetic", () => {
  const base = 72000, bonus = 5000, rival = 76000;
  assert.equal(base + bonus, 77000);
  assert.equal(base + bonus - rival, 1000);
  assert.equal(rival - base, 4000);
  const played = byId.negotiate.played.map(plain).join(" ");
  for (const v of [72000, 76000, 5000, 77000, 1000, 4000]) assert.ok(dollars(played).includes(v), `negotiate shows $${v}`);
});

test("market sizing, three statements and STAR timing", () => {
  // Coffee shops in Utah.
  const adults = 3.5e6 * 0.7, drinks = adults * 0.1, shops = drinks / 250;
  assert.equal(Math.round(adults), 2450000);
  assert.equal(Math.round(drinks), 245000);
  assert.equal(Math.round(shops), 980);
  assert.equal(Math.round(3.5e6 / 1000), 3500, "one shop per 3,500 people");
  // Gas stations.
  assert.equal(300e6 / 2000, 150000);
  // $10 of depreciation at a 25% tax rate.
  const ni = -10 * (1 - 0.25), cash = ni + 10;
  assert.equal(ni, -7.5);
  assert.equal(cash, 2.5);
  assert.equal(cash - 10, ni, "assets change = equity change");
  // A 2-minute STAR answer at 10/10/60/20.
  assert.deepEqual([10, 10, 60, 20].map((p) => (120 * p) / 100), [12, 12, 72, 24]);
  assert.ok(byId.star.played.join(" ").includes("12 s + 12 s + 72 s + 24 s"));
  // Elevator pitch ≈ 45 s.
  assert.equal(10 + 25 + 10, 45);
});

test("practice: structure, one right answer, diagnoses, patterns and steps", () => {
  const secs = new Set(P.sections.map((s) => s.id));
  const ids = new Set();
  for (const q of P.questions) {
    assert.ok(!ids.has(q.id), `duplicate ${q.id}`);
    ids.add(q.id);
    assert.ok(secs.has(q.section), `${q.id}: unknown section`);
    assert.equal(q.kind, "one");
    assert.equal(q.options.filter((o) => o.right).length, 1, `${q.id}: exactly one right option`);
    for (const o of q.options) assert.ok(o.why && o.why.length > 20, `${q.id}: every option explains itself`);
    for (const o of q.options.filter((o) => !o.right)) assert.match(o.why, /belief/, `${q.id}: a wrong option's why names the mistaken belief`);
    assert.ok(q.pattern, `${q.id}: pattern`);
    assert.ok(q.steps.length >= 3 && q.steps.length <= 5, `${q.id}: 3–5 steps`);
    assert.ok(q.cards.length >= 1 && q.cards.every((id) => byId[id]), `${q.id}: related cards exist`);
    assert.equal(q.week, meta.units.findIndex((u) => u.id === q.section) + 1, `${q.id}: week matches its section`);
  }
  for (const s of P.sections) {
    const n = P.questions.filter((q) => q.section === s.id).length;
    assert.equal(s.sub, `${n} question${n === 1 ? "" : "s"}`, `${s.id}: section count`);
  }
});
