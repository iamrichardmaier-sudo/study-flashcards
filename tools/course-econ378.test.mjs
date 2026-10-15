// node --test tools/course-econ378.test.mjs
//
// ECON 378's enriched deck: every number in a card's "Played out" steps is
// re-derived here and must appear in the text as shown, every practice
// answer is recomputed, and every numeric wrong option is rebuilt from the
// one slip its `why` names. Distribution values come from the class's own
// Stat functions (classes/econ378.js), checked against tables in
// tools/classes.test.mjs.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");
const meta = (await import(new URL("courses/econ378/course.mjs", root))).default;
const cards = (await import(new URL("courses/econ378/cards.mjs", root))).default;
const P = (await import(new URL("courses/econ378/practice.mjs", root))).default;
const C = Object.fromEntries(cards.map((c) => [c.id, c]));
const Q = Object.fromEntries(P.questions.map((q) => [q.id, q]));

// The class's maths (normal, t, χ² CDFs and inverses).
let cfg = null;
vm.runInNewContext(read("classes/econ378.js"), { window: { Study: { h() {}, esc: String, fmt: String, course: (c) => { cfg = c; } } }, Math, JSON, Date });
const { Stat } = cfg.math;
const Phi = (z) => Stat.normCdf(z);
const zCrit = (p) => Stat.zCrit(p);
const tCrit = (p, df) => Stat.tCrit(p, df);
const choose = (n, k) => { let c = 1; for (let j = 1; j <= k; j++) c = (c * (n - k + j)) / j; return c; };
const sum = (a) => a.reduce((s, x) => s + x, 0);
const mean = (a) => sum(a) / a.length;

/** Plain text of a step: tags stripped, thousands commas and unicode minus normalised. */
const plain = (s) => s.replace(/<sup>(\d+)<\/sup>/g, "^$1").replace(/<[^>]+>/g, "").replace(/(\d),(\d{3})/g, "$1$2").replace(/−/g, "-");
/** Card `id`'s played step `k` shows `x` rounded to `dp` decimals. */
function shows(id, k, x, dp = 0) {
  const s = plain(C[id].played[k]);
  const want = x.toFixed(dp);
  const re = new RegExp("(^|[^\\d.])" + want.replace(/[.\-]/g, "\\$&") + "(?![\\d])");
  assert.ok(re.test(s), `${id} step ${k + 1}: expected ${want} in "${s}"`);
}
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} expected ${b} ± ${tol}, got ${a}`);

// --------------------------------------------------------------- structure

const IDS = ["mean", "median", "svar", "zscore", "iqr", "corr", "condp", "indep", "bayes", "ev", "varrules",
  "binom", "pois", "normal", "tdist", "chisq", "sampdist", "se", "clt", "unbiased", "consistent",
  "ci", "ciinterp", "pval", "type12", "power", "ols", "r2"];

test("deck: same 28 cards, enriched, every section filled", () => {
  assert.equal(meta.enriched, true);
  assert.deepEqual(cards.map((c) => c.id), IDS);
  cards.forEach((c, k) => {
    assert.equal(c.n, k + 1);
    assert.ok(c.week >= 1 && c.week <= meta.units.length, c.id);
    assert.ok(c.simple && !/\. \S/.test(c.simple.replace(/<[^>]+>/g, "").replace(/\d\.\d/g, "")), `${c.id}: simple should be one sentence`);
    assert.ok(Array.isArray(c.more) && c.more.length >= 2 && c.more.length <= 3, `${c.id}: 2–3 paragraphs`);
    assert.ok(c.example, `${c.id}: example`);
    assert.ok(c.connections.length >= 2 && c.connections.length <= 5, `${c.id}: connections`);
    for (const x of c.connections) { assert.ok(C[x], `${c.id} → ${x}`); assert.notEqual(x, c.id); }
    assert.ok(c.played.length >= 2 && c.played.length <= 4, `${c.id}: played 2–4 steps`);
    if (c.numbers) assert.ok(c.numbersSource && c.numbers.every((r) => r.length === 2), `${c.id}: numbers need a source`);
  });
  const withNumbers = cards.filter((c) => c.numbers).length;
  assert.ok(withNumbers >= 8 && withNumbers <= 12, `about a third with numbers, got ${withNumbers}`);
});

test("graphs: every econ378 diagram draws and the file is plain ES5", () => {
  const src = read("tools/graphs/econ378.js");
  assert.ok(!src.includes("`") && !src.includes("${"), "no template literals");
  const sb = { window: {} };
  vm.runInNewContext(read("tools/graphs.js") + "\n" + src, sb);
  const G = sb.window.GRAPHS;
  const keys = Object.keys(G).filter((k) => k.startsWith("econ378"));
  assert.ok(keys.length >= 12, "at least 12 new diagrams");
  for (const k of keys) {
    const g = G[k]({});
    assert.ok(g.svg.startsWith("<svg") && !/NaN|undefined/.test(g.svg), k);
  }
  for (const c of [...cards, ...P.questions]) {
    if (!c.graph) continue;
    const key = typeof c.graph === "string" ? c.graph : c.graph.key;
    const g = G[key](c.graph.args || {});
    assert.ok(!/NaN|undefined/.test(g.svg), `${c.id}: ${key}`);
  }
});

test("practice: pattern, 3–5 steps, cards, one right option, diagnoses", () => {
  assert.equal(P.questions.length, 12);
  for (const q of P.questions) {
    assert.ok(q.pattern && q.steps.length >= 3 && q.steps.length <= 5, q.id);
    assert.ok(q.cards.length && q.cards.every((x) => C[x]), q.id);
    assert.equal(q.kind, "one");
    assert.equal(q.options.filter((o) => o.right).length, 1, q.id);
    assert.ok(q.options.every((o) => o.why), q.id);
  }
});

// ------------------------------------------------------------ played: unit 1

const RX = [1, 2, 3, 4, 5], RY = [2, 4, 5, 4, 5];
const xb = mean(RX), yb = mean(RY);
const Sxy = sum(RX.map((x, i) => (x - xb) * (RY[i] - yb)));
const Sxx = sum(RX.map((x) => (x - xb) ** 2));
const Syy = sum(RY.map((y) => (y - yb) ** 2));
const b1 = Sxy / Sxx, b0 = yb - b1 * xb;
const resid = RX.map((x, i) => RY[i] - (b0 + b1 * x));

test("descriptive: mean, median, variance, z, IQR, r", () => {
  const inc = [30, 35, 40, 45, 250];
  shows("mean", 0, sum(inc)); shows("mean", 1, mean(inc)); shows("mean", 1, 40);
  const four = [30, 35, 40, 45];
  shows("mean", 2, mean(four), 1); shows("mean", 2, (35 + 40) / 2, 1); shows("mean", 2, mean(inc) - mean(four), 1);

  const d = [3, 7, 8, 12, 15, 40];
  shows("median", 1, (d[2] + d[3]) / 2); shows("median", 1, mean(d), 2);
  shows("median", 2, mean([3, 7, 8, 12, 15, 400]), 2);

  const v = [2, 4, 6, 8], vm_ = mean(v), ss = sum(v.map((x) => (x - vm_) ** 2));
  assert.equal(ss, 20); shows("svar", 1, ss);
  shows("svar", 2, ss / 3, 2); shows("svar", 2, Math.sqrt(ss / 3), 2); shows("svar", 2, ss / 4);

  shows("zscore", 0, (85 - 70) / 10, 1); shows("zscore", 1, (90 - 80) / 5, 1);

  const q1 = 20, q3 = 40, iqr = q3 - q1;
  shows("iqr", 0, iqr); shows("iqr", 0, 1.5 * iqr);
  shows("iqr", 1, q1 - 1.5 * iqr); shows("iqr", 1, q3 + 1.5 * iqr);
  assert.ok(85 > q3 + 1.5 * iqr);

  shows("corr", 1, Sxy); shows("corr", 1, Sxx); shows("corr", 1, Syy);
  shows("corr", 2, Sxy / Math.sqrt(Sxx * Syy), 3);
});

// ------------------------------------------------------------ played: unit 2

test("probability: conditional, independence, Bayes, E[X], Var", () => {
  const N = 1000, grad = 400, gradHigh = 300, nonHigh = 150, high = gradHigh + nonHigh;
  shows("condp", 1, high / N, 2); shows("condp", 1, gradHigh / grad, 2); shows("condp", 2, gradHigh / high, 3);
  shows("indep", 0, high / N, 2); shows("indep", 0, grad / N, 2);
  shows("indep", 1, (high / N) * (grad / N), 2); shows("indep", 2, gradHigh / N, 2);

  const sick = 10000 * 0.01, tp = 0.9 * sick, fp = 0.05 * (10000 - sick);
  shows("bayes", 0, sick); shows("bayes", 0, 10000 - sick);
  shows("bayes", 1, tp); shows("bayes", 1, fp);
  shows("bayes", 2, tp + fp); shows("bayes", 2, tp / (tp + fp), 3);

  const p = [0.1, 0.3, 0.4, 0.2], EX = sum(p.map((q, k) => q * k)), EX2 = sum(p.map((q, k) => q * k * k));
  shows("ev", 1, EX, 1); shows("ev", 2, 2 * EX + 3, 1);
  shows("varrules", 0, EX2, 1); shows("varrules", 1, EX2 - EX ** 2, 2); shows("varrules", 1, Math.sqrt(EX2 - EX ** 2), 1);
  shows("varrules", 2, 4 * (EX2 - EX ** 2), 2); shows("varrules", 2, 2 * Math.sqrt(EX2 - EX ** 2), 1);
});

// ------------------------------------------------------------ played: unit 3

test("distributions: binomial, Poisson, normal, t, χ²", () => {
  const pb = choose(10, 3) * 0.3 ** 3 * 0.7 ** 7;
  shows("binom", 1, choose(10, 3)); shows("binom", 1, 0.3 ** 3, 3); shows("binom", 1, 0.7 ** 7, 4); shows("binom", 1, pb, 3);
  shows("binom", 2, 10 * 0.3); shows("binom", 2, 10 * 0.3 * 0.7, 1); shows("binom", 2, Math.sqrt(2.1), 2);

  const p0 = Math.exp(-3), p2 = Math.exp(-3) * 9 / 2;
  shows("pois", 1, p0, 3); shows("pois", 1, p2, 3); shows("pois", 2, 1 - p0, 3);

  shows("normal", 1, Phi(2) - Phi(-2), 2);
  near((64 - 70) / 3, -2, 1e-12); near((76 - 70) / 3, 2, 1e-12);
  shows("normal", 2, Phi(1), 4); shows("normal", 2, 1 - Phi(1), 3);

  const se = 5 / Math.sqrt(10), t9 = tCrit(0.975, 9);
  shows("tdist", 0, se, 3); shows("tdist", 1, t9, 3); shows("tdist", 1, t9 * se, 2); shows("tdist", 2, 1.96 * se, 2);

  const O = [5, 8, 9, 8, 10, 20], chi = sum(O.map((o) => (o - 10) ** 2 / 10));
  assert.equal(sum(O), 60);
  shows("chisq", 1, chi, 1); shows("chisq", 1, O.length - 1);
  near(Stat.chiCdf(11.07, 5), 0.95, 1e-3, "χ²(5) 5% critical value"); shows("chisq", 2, 11.07, 2);
});

// ------------------------------------------------------------ played: unit 4

test("sampling: sampling distribution, SE, CLT, bias, consistency", () => {
  const se = 10 / Math.sqrt(25);
  shows("sampdist", 1, se); shows("sampdist", 1, 25 - 1.96 * se, 2); shows("sampdist", 1, 25 + 1.96 * se, 2);
  shows("sampdist", 2, (28 - 25) / se, 1); shows("sampdist", 2, 1 - Phi(1.5), 3);

  shows("se", 0, 12 / Math.sqrt(36)); shows("se", 1, 12 / Math.sqrt(144)); shows("se", 2, 12 / Math.sqrt(9));

  shows("clt", 1, 50 / Math.sqrt(100)); shows("clt", 2, (60 - 50) / 5); shows("clt", 2, 1 - Phi(2), 3);

  shows("unbiased", 1, 20 / 3, 2); shows("unbiased", 1, 20 / 4);
  near((4 - 1) / 4, 0.75, 1e-12); shows("unbiased", 2, 25);

  shows("consistent", 0, 10 / Math.sqrt(25)); shows("consistent", 0, 10 / Math.sqrt(2500), 1);
  shows("consistent", 1, 24 / 25, 2); shows("consistent", 1, 2499 / 2500, 4);
});

// ------------------------------------------------------------ played: unit 5

test("inference: CI, coverage, p-value, multiple tests, power", () => {
  const se = 12 / Math.sqrt(36);
  shows("ci", 0, se); shows("ci", 1, zCrit(0.975) * se, 2);
  shows("ci", 1, 50 - 1.96 * se, 2); shows("ci", 1, 50 + 1.96 * se, 2);
  shows("ci", 2, tCrit(0.975, 35), 3); shows("ci", 2, tCrit(0.975, 35) * se, 2);
  // The Gallup row: the simple-random-sample margin for n = 1,001 at p = 0.5.
  near(1.96 * Math.sqrt(0.25 / 1001) * 100, 3.1, 0.05, "SRS margin in points");

  shows("ciinterp", 1, 20 * 0.05); shows("ciinterp", 2, 0.95 ** 20, 3);

  const z = (54 - 50) / (10 / Math.sqrt(25));
  shows("pval", 0, 10 / Math.sqrt(25)); shows("pval", 1, z);
  shows("pval", 1, Phi(2), 4); shows("pval", 1, 2 * (1 - Phi(z)), 4); shows("pval", 2, 1 - Phi(z), 4);

  shows("type12", 1, 20 * 0.05); shows("type12", 2, 1 - 0.95 ** 20, 2);

  const pse = 15 / Math.sqrt(36), cut = 100 + zCrit(0.95) * pse;
  shows("power", 0, pse, 1); shows("power", 0, cut, 2);
  shows("power", 1, (cut - 106) / pse, 2);
  const power = 1 - Phi((cut - 106) / pse);
  shows("power", 2, power, 3); shows("power", 2, 1 - power, 3);
});

// ------------------------------------------------------------ played: unit 6

test("regression: OLS and R² on the running data", () => {
  shows("ols", 0, Sxy); shows("ols", 0, Sxx); shows("ols", 0, b1, 1);
  shows("ols", 1, b0, 1);
  shows("ols", 2, b0 + b1 * 3, 1); shows("ols", 2, resid[2], 1);
  near(sum(resid), 0, 1e-12, "residuals sum to zero");

  const ssr = sum(resid.map((e) => e * e));
  shows("r2", 0, Syy);
  resid.forEach((e) => shows("r2", 1, Math.abs(e), 1));
  shows("r2", 1, ssr, 1);
  shows("r2", 2, 1 - ssr / Syy, 1); shows("r2", 2, Math.sqrt(1 - ssr / Syy), 3);
  near(1 - ssr / Syy, (Sxy / Math.sqrt(Sxx * Syy)) ** 2, 1e-12, "R² = r²");
});

// --------------------------------------------------------------- practice

/** The first number in an option's text. */
const num = (t) => Number(t.replace(/<[^>]+>/g, "").replace(/−/g, "-").match(/-?\d*\.?\d+/)[0]);
const right = (q) => q.options.find((o) => o.right);
const wrongs = (q) => q.options.filter((o) => !o.right);
/** Shown numbers match the slips (in option order) to the precision shown. */
function same(shown, want, id) {
  assert.equal(shown.length, want.length, id);
  shown.forEach((s, k) => {
    const dp = (String(s).split(".")[1] || "").length;
    assert.ok(Math.abs(s - want[k]) <= 0.5 * 10 ** -dp + 1e-9, `${id} option ${k}: shows ${s}, slip gives ${want[k]}`);
  });
}

test("Q1 normal tail and each slip", () => {
  const q = Q.q1, z = (130 - 100) / 15;
  same([num(right(q).t)], [1 - Phi(z)], "q1");
  same(wrongs(q).map((o) => num(o.t)), [Phi(z), 2 * (1 - Phi(z)), 1 - Phi(30 / 30)], "q1");
});

test("Q2 confidence interval and each slip", () => {
  const q = Q.q2, n = 36, s = 12, m = (t) => num(t.replace(/^50 ± /, ""));
  same([m(right(q).t)], [1.96 * s / Math.sqrt(n)], "q2");
  same(wrongs(q).map((o) => m(o.t)), [1.96 * s, zCrit(0.95) * s / Math.sqrt(n), 1.96 * s / n], "q2");
});

test("Q6 standard error scaling", () => {
  const se = (n) => 1 / Math.sqrt(n);
  near(se(4) / se(1), 0.5, 1e-12, "×4 halves");
  near(se(1) / se(2), Math.SQRT2, 1e-12, "doubling divides by √2");
  assert.ok(se(0.5) > se(1), "halving n raises SE");
});

test("Q7 Bayes and each slip", () => {
  const q = Q.q7, post = (0.9 * 0.01) / (0.9 * 0.01 + 0.05 * 0.99);
  same([num(right(q).t)], [100 * post], "q7");
  same(wrongs(q).map((o) => num(o.t)), [90, 100 * (1 - 0.05), 100 * 0.01], "q7");
});

test("Q8 binomial and each slip", () => {
  const q = Q.q8;
  same([num(right(q).t)], [choose(5, 2) * 0.5 ** 5], "q8");
  same(wrongs(q).map((o) => num(o.t)), [0.5 ** 5, 2 / 5, 0.5], "q8");
});

test("Q9 variance of 2X + 3 and each slip", () => {
  const q = Q.q9, v = 4, a = 2, b = 3;
  same([num(right(q).t)], [a * a * v], "q9");
  same(wrongs(q).map((o) => num(o.t)), [a * v + b, a * v, a * a * v + b], "q9");
});

test("Q10 reference distribution df", () => {
  assert.match(right(Q.q10).t, new RegExp(`\\b${16 - 1}\\b`));
  near(tCrit(0.975, 15), 2.131, 1e-3, "t*.975,15 used in the graph");
});

test("Q11 OLS slope and each slip", () => {
  const q = Q.q11, cov = 6, vx = 3, nums = wrongs(q).filter((o) => /\d/.test(o.t)).map((o) => num(o.t));
  same([num(right(q).t)], [cov / vx], "q11");
  same(nums, [vx / cov, cov * vx], "q11");
});

test("Q3 graph: z = 2.17 gives p ≈ 0.03", () => {
  near(2 * (1 - Phi(2.17)), 0.03, 0.0005, "two-sided p");
});
