// node --test tools/course-econ380.test.mjs
//
// ECON 380's enriched deck: every number in a card's "Played out" steps is
// re-derived from the running examples, and every practice question's right
// answer and numeric wrong options are re-derived (each wrong one from the
// slip its `why` names), the way tools/practice.test.mjs checks ECON 381.
// Where the class's own maths (Micro in classes/econ380.js) covers a case,
// the numbers are checked against it too.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const cards = (await import(new URL("courses/econ380/cards.mjs", root))).default;
const P = (await import(new URL("courses/econ380/practice.mjs", root))).default;
const course = (await import(new URL("courses/econ380/course.mjs", root))).default;
const C = Object.fromEntries(cards.map((c) => [c.id, c]));
const Q = Object.fromEntries(P.questions.map((q) => [q.id, q]));

// The class's maths, loaded the way tools/classes.test.mjs loads it.
let cfg = null;
const Study = { h() {}, esc: String, fmt: String, course: (c) => { cfg = c; } };
vm.runInNewContext(readFileSync(new URL("classes/econ380.js", root), "utf8"), { window: { Study }, Math, JSON, Date });
const { Micro } = cfg.math;

/** Card or option text as plain text: no tags, entities decoded, no thousands commas, ASCII minus. */
function plain(s) {
  return s.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/(\d),(\d{3})/g, "$1$2").replace(/−/g, "-");
}
const played = (id) => plain(C[id].played.join(" \n "));
/** The card's worked example shows `v` rounded to `dp` places (as a whole number, not part of a longer one). */
function shows(id, v, dp = 0) {
  const s = Math.abs(v).toFixed(dp);
  const re = new RegExp("(?<![\\d.])" + s.replace(".", "\\.") + "(?!\\.?\\d)");
  assert.ok(re.test(played(id)), `${id}: expected ${s} in the worked example`);
}
const near = (a, b, tol = 1e-9, msg = "") => assert.ok(Math.abs(a - b) <= tol, `${msg} expected ${b}, got ${a}`);
/** All the numbers in an option's text. */
const nums = (t) => (plain(t).match(/-?\d+(\.\d+)?/g) || []).map(Number);
const right = (q) => q.options.find((o) => o.right);
const wrongs = (q) => q.options.filter((o) => !o.right);

// ---------------------------------------------------------------- deck shape

test("29 cards in 5 units, every one carrying the enriched fields", () => {
  assert.equal(course.enriched, true);
  assert.equal(cards.length, 29);
  cards.forEach((c, k) => assert.equal(c.n, k + 1));
  for (const c of cards) {
    assert.ok(c.simple && !/<br/.test(c.simple), `${c.id} simple`);
    assert.ok(Array.isArray(c.more) && c.more.length >= 2 && c.more.length <= 3, `${c.id} more`);
    assert.ok(c.connections.length >= 2 && c.connections.length <= 5, `${c.id} connections`);
    assert.ok(c.example, `${c.id} example`);
    assert.ok(c.graph, `${c.id} graph`);
    if (c.numbers) assert.ok(/Source/.test(c.numbersSource), `${c.id} numbers need a named source`);
  }
  const ids = ["axioms", "mrs", "tangency", "cddemand", "lagrange", "hicks", "slutsky", "goods", "elas", "rts", "mrts", "costmin",
    "mcac", "shutdown", "lrcomp", "csps", "dwl", "incidence", "ceiling", "pareto", "fwt", "mrmc", "lerner", "pricedisc",
    "nash", "dominant", "pd", "cournot", "bertrand"];
  assert.deepEqual(cards.map((c) => c.id), ids);
});

// ------------------------------------------------------ unit 1: consumer

const a = 0.5, I = 100, px = 2, py = 5;
const x0 = a * I / px, y0 = (1 - a) * I / py, U0 = Math.sqrt(x0 * y0);

test("consumer running example: (25, 10), U = 15.81, MRS and tangency", () => {
  assert.equal(x0, 25); assert.equal(y0, 10);
  shows("tangency", x0); shows("tangency", y0);
  near(y0 / x0, px / py, 1e-12, "MRS = price ratio");
  shows("mrs", y0 / x0, 1); shows("mrs", 25 / 10, 1);
  near(Math.sqrt(10 * 25), U0, 1e-12, "(10, 25) is on the same curve");
  shows("mrs", U0, 1);
  // the off-tangency bundle (40, 4) is affordable and worse
  assert.equal(px * 40 + py * 4, I);
  shows("tangency", 4 / 40, 1); shows("tangency", Math.sqrt(160), 1); shows("tangency", U0, 1);
  // matches the class tool's maths
  const m = Micro.consumer(a, I, px, py, 8, "hicks");
  near(m.A.x, x0); near(m.A.y, y0);
});

test("Cobb-Douglas demands: shares, doubling income, doubling py", () => {
  shows("cddemand", x0); shows("cddemand", y0); shows("cddemand", a * I);
  shows("cddemand", a * 2 * I / px); shows("cddemand", (1 - a) * 2 * I / py);
  shows("cddemand", (1 - a) * I / (2 * py));
});

test("lambda = 0.158, and utility rises by that much per extra dollar", () => {
  const MUx = 0.5 * Math.sqrt(y0 / x0), MUy = 0.5 * Math.sqrt(x0 / y0);
  shows("lagrange", MUx, 3); shows("lagrange", MUy, 3);
  const lam = MUx / px;
  near(MUy / py, lam, 1e-12);
  shows("lagrange", lam, 3);
  const x1 = a * 101 / px, y1 = (1 - a) * 101 / py, U1 = Math.sqrt(x1 * y1);
  shows("lagrange", x1, 2); shows("lagrange", y1, 1); shows("lagrange", x1 * y1, 3);
  shows("lagrange", U1, 3); shows("lagrange", U0, 3);
  near(U1 - U0, lam, 5e-4, "dU ≈ λ dI");
});

test("px 2 → 8: Marshallian 6.25, Hicksian 12.5 costing 200, Slutsky split", () => {
  const px2 = 8;
  const xm = a * I / px2, xh = U0 * Math.sqrt(py / px2), yh = xh * px2 / py;
  assert.equal(xm, 6.25); near(xh, 12.5, 1e-9); near(yh, 20, 1e-9);
  shows("hicks", xm, 2); shows("hicks", xh, 1); shows("hicks", yh); shows("hicks", px2 * xh + py * yh);
  shows("slutsky", x0 - xh, 1); shows("slutsky", xh, 1); shows("slutsky", xm, 2);
  const m = Micro.consumer(a, I, px, py, px2, "hicks");
  near(m.B.x, xh, 1e-9); near(m.C.x, xm); near(m.sub, xh - x0, 1e-9); near(m.inc, xm - xh, 1e-9);
  near(m.B.I, 200, 1e-9);
  // the derivative form at px = 2
  const total = -a * I / (px * px);
  const sub = -0.5 * U0 * Math.sqrt(py) / Math.pow(px, 1.5);
  const inc = x0 * a / px;
  shows("slutsky", total, 1); shows("slutsky", sub, 2); shows("slutsky", inc, 2);
  shows("slutsky", Math.sqrt(py), 3); shows("slutsky", Math.pow(px, 1.5), 3);
  near(sub - inc, total, 1e-9, "Slutsky adds up");
});

test("income elasticity: 1 for Cobb-Douglas, -0.8 for the noodles", () => {
  const x120 = a * 120 / px;
  shows("goods", x120);
  near(((x120 - x0) / x0) / (20 / 100), 1);
  shows("goods", (x120 - x0) / x0, 1);
  near(((16 - 20) / 20) / ((2500 - 2000) / 2000), -0.8);
  shows("goods", 0.8, 1);
});

test("price elasticity along P = 100 − 2Q", () => {
  const Qd = (p) => 50 - p / 2, e = (p) => -0.5 * p / Qd(p);
  shows("elas", Qd(40)); shows("elas", e(40), 2); shows("elas", Qd(42)); shows("elas", 40 * Qd(40)); shows("elas", 42 * Qd(42));
  shows("elas", Qd(60)); shows("elas", e(60), 1); shows("elas", Qd(62)); shows("elas", 62 * Qd(62));
  near(e(50), -1); shows("elas", 50 * Qd(50));
  assert.ok(42 * Qd(42) > 40 * Qd(40) && 62 * Qd(62) < 60 * Qd(60), "revenue rule");
  near(Micro.market(100, 2, 10, 1, "none", 0).elasD, e(40), 1e-12);
});

test("money pump: three $1 trades, back to C", () => {
  shows("axioms", 3);
});

// ---------------------------------------------------- unit 2: production

const F = (K, L) => Math.sqrt(K * L);

test("returns to scale, MRTS and the cost-minimising bundle", () => {
  shows("rts", F(40, 10)); shows("rts", F(80, 20)); assert.equal(F(80, 20), 2 * F(40, 10));
  shows("rts", Math.pow(2, 0.3 + 0.8), 2);
  shows("mrts", 40 / 10); shows("mrts", 20 / 20); assert.equal(F(20, 20), 20);
  const w = 4, r = 1, L = 20 / Math.sqrt(w / r), K = (w / r) * L;   // tangency K/L = w/r, so Q = √(w/r)·L
  assert.equal(L, 10); assert.equal(K, 40); assert.equal(F(K, L), 20);
  shows("costmin", w / r); shows("costmin", 10); shows("costmin", 40);
  shows("costmin", w * 10 + r * 40); shows("costmin", (w * 10 + r * 40) / 20);
  shows("costmin", w * 20 + r * 20);
});

const TC = (q) => 32 + q ** 3 - 6 * q * q + 20 * q, MC = (q) => 3 * q * q - 12 * q + 20,
  AVC = (q) => q * q - 6 * q + 20, ATC = (q) => AVC(q) + 32 / q;

test("cost curves: MC meets AVC at (3, 11) and ATC at (4, 20), at their minima", () => {
  near(AVC(3), 11); near(MC(3), 11); near(ATC(4), 20); near(MC(4), 20);
  for (const d of [-0.01, 0.01]) { assert.ok(AVC(3 + d) > AVC(3)); assert.ok(ATC(4 + d) > ATC(4)); }
  shows("mcac", 11); shows("mcac", 20);
});

test("shutdown rule at P = 35, 14.75 and 8", () => {
  near(MC(5), 35); shows("shutdown", 35 * 5); shows("shutdown", TC(5)); shows("shutdown", 35 * 5 - TC(5));
  near(MC(3.5), 14.75);
  shows("shutdown", 14.75 * 3.5, 1); shows("shutdown", TC(3.5), 1); shows("shutdown", TC(3.5) - 14.75 * 3.5, 2);
  assert.ok(TC(3.5) - 14.75 * 3.5 < 32, "staying open loses less than the fixed cost");
  near(MC(2), 8); shows("shutdown", AVC(2)); shows("shutdown", TC(2) - 8 * 2);
});

test("long run: P = 20, 150 firms, then 200", () => {
  shows("lrcomp", ATC(4)); shows("lrcomp", 1000 - 20 * 20); shows("lrcomp", (1000 - 20 * 20) / 4);
  shows("lrcomp", (1200 - 20 * 20) / 4); shows("lrcomp", 1200 - 20 * 20);
});

// ------------------------------------------------------ unit 3: markets

const mk = Micro.market(100, 2, 10, 1, "none", 0);
const tax = Micro.market(100, 2, 10, 1, "tax", 6);
const ceil = Micro.market(100, 2, 10, 1, "ceiling", 34);

test("surplus at the running equilibrium", () => {
  near(mk.Qe, 30); near(mk.Pe, 40); near(mk.CS, 900); near(mk.PS, 450);
  for (const v of [30, 40, 900, 450, 1350]) shows("csps", v);
});

test("$6 tax: Q = 28, Pb = 44, Ps = 38, DWL = 6, incidence 2/3", () => {
  near(tax.Q, 28); near(tax.Pb, 44); near(tax.Ps, 38); near(tax.DWL, 6, 1e-9); near(tax.gov, 168);
  for (const v of [28, 6, 784, 392, 168, 1344, 1350]) shows("dwl", v);
  near(tax.CS, 784); near(tax.PS, 392);
  const tax12 = Micro.market(100, 2, 10, 1, "tax", 12);
  near(tax12.Q, 26); near(tax12.DWL, 24, 1e-9); shows("dwl", 26); shows("dwl", 24);
  for (const v of [28, 44, 38, 4, 2]) shows("incidence", v);
  const eD = 0.5 * 40 / 30, eS = 1 * 40 / 30;
  shows("incidence", eD, 2); shows("incidence", eS, 2); shows("incidence", eS / (eS + eD), 2);
  near(eS / (eS + eD), (tax.Pb - mk.Pe) / 6, 1e-12, "elasticity share = actual share");
  near(tax.buyerShare, 2 / 3, 1e-12);
});

test("$34 ceiling: 24 supplied, 33 demanded, DWL 54", () => {
  near(ceil.Q, 24); near(ceil.shortage, 9); near(ceil.DWL, 54, 1e-9);
  for (const v of [34, 24, 33, 9, 52, 54]) shows("ceiling", v);
});

test("Edgeworth box: MRSs, the diagonal contract curve and the 1 : 1 equilibrium", () => {
  shows("pareto", 2 / 8, 2); shows("pareto", 8 / 2); shows("pareto", Math.sqrt(8 * 2)); shows("pareto", Math.sqrt(5 * 5));
  // contract curve y = x: MRS_A = y/x equals MRS_B = (10 − y)/(10 − x) on it
  for (const x of [2, 5, 7]) near(x / x, (10 - x) / (10 - x));
  const wealth = 8 * 1 + 2 * 1;
  shows("fwt", wealth); shows("fwt", 0.5 * wealth / 1);
  near(0.5 * (2 + 8) / 1 + 0.5 * wealth / 1, 10, 1e-12, "x market clears");
});

// ----------------------------------------------------- unit 4: monopoly

const mono = Micro.monopoly(100, 2, 20);

test("monopoly: Q = 20, P = 60, profit 800, DWL 400, Lerner 2/3", () => {
  near(mono.Qm, 20); near(mono.Pm, 60); near(mono.profit, 800); near(mono.CSm, 400); near(mono.DWL, 400); near(mono.Qc, 40);
  for (const v of [20, 60, 800, 400, 40]) shows("mrmc", v);
  near(mono.lerner, 2 / 3, 1e-12); near(Math.abs(mono.elas), 1.5, 1e-12);
  shows("lerner", Math.abs(mono.elas), 1); shows("lerner", 30 / (1 - 1 / 4));
});

test("third-degree discrimination: adults 60, students 40; perfect discrimination", () => {
  const ad = Micro.monopoly(100, 2, 20), st = Micro.monopoly(60, 2, 20);
  near(ad.Qm, 20); near(ad.Pm, 60); near(st.Qm, 10); near(st.Pm, 40);
  near(Math.abs(ad.elas), 1.5, 1e-12); near(Math.abs(st.elas), 2, 1e-12);
  for (const v of [20, 60, 10, 40, 1.5, 2]) shows("pricedisc", v, v % 1 ? 1 : 0);
  shows("pricedisc", 0.5 * 40 * 80); assert.equal(ad.Qc, 40);
});

// --------------------------------------------------------- unit 5: games

test("games: coordination equilibria, the dominant Low, and the grim-trigger threshold", () => {
  const coord = Micro.nash([[2, 0], [0, 1]], [[2, 0], [0, 1]]);
  assert.equal(JSON.stringify(coord.pure), "[[0,0],[1,1]]"); assert.equal(coord.rowDom, null);
  const A = [[10, 2], [12, 5]], B = [[10, 12], [2, 5]];
  const pd = Micro.nash(A, B);
  assert.equal(JSON.stringify(pd.pure), "[[1,1]]"); assert.equal(pd.rowDom, 1); assert.equal(pd.colDom, 1);
  for (const v of [12, 10, 5, 2]) { shows("dominant", v); shows("pd", v); }
  const d = (12 - 10) / (12 - 5);
  near(10 / (1 - d), 12 + 5 * d / (1 - d), 1e-9, "indifferent at δ = 2/7");
  shows("pd", d, 2);
});

test("Cournot and Bertrand on P = 120 − Q, MC = 0", () => {
  const c = Micro.cournot(120, 1, 0, 0);
  near(c.q1, 40); near(c.Q, 80); near(c.P, 40); near(c.pi1, 1600);
  for (const v of [40, 80, 1600, 60, 3600, 1800, 120]) shows("cournot", v);
  const br = (q2) => (120 - q2) / 2;
  near(br(30), 45); shows("cournot", br(30)); shows("cournot", br(30) * (120 - 30 - br(30)));
  shows("bertrand", 39.99, 2); shows("bertrand", 120 - 39.99, 0); shows("bertrand", Math.round(39.99 * (120 - 39.99) / 100) * 100);
});

// ------------------------------------------------------------- practice

test("practice: 12 questions, one right option each, every option distinct", () => {
  assert.equal(P.questions.length, 12);
  for (const q of P.questions) {
    assert.equal(q.kind, "one");
    assert.equal(q.options.filter((o) => o.right).length, 1, q.id);
    assert.ok(q.pattern && q.steps.length >= 3 && q.steps.length <= 5, `${q.id} pattern and steps`);
    for (const id of q.cards) assert.ok(C[id], `${q.id}: card ${id}`);
  }
});

test("Q1 Cobb-Douglas x*: 25, and each slip", () => {
  assert.deepEqual(nums(right(Q.m1).t), [a * I / px]);
  assert.deepEqual(wrongs(Q.m1).map((o) => nums(o.t)[0]), [I / px, a * I / py, I / py]);
});

test("Q4/Q5 tax: DWL 6, buyers pay 44, and each slip", () => {
  assert.deepEqual(nums(right(Q.m4).t), [tax.DWL]);
  assert.deepEqual(wrongs(Q.m4).map((o) => nums(o.t)[0]), [6 * (mk.Qe - tax.Q), 6 * tax.Q, 0]);
  assert.deepEqual(nums(right(Q.m5).t), [tax.Pb]);
  assert.deepEqual(wrongs(Q.m5).map((o) => nums(o.t)[0]), [mk.Pe + 6, tax.Pb - 6, mk.Pe]);
});

test("Q6 monopoly (20, 60), and each slip", () => {
  assert.deepEqual(nums(right(Q.m6).t), [mono.Qm, mono.Pm]);
  const mrZero = 100 / 4;
  assert.deepEqual(wrongs(Q.m6).map((o) => nums(o.t)), [[mono.Qc, 20], [mono.Qm, 20], [mrZero, 100 - 2 * mrZero]]);
});

test("Q7 Lerner price 40, and each slip", () => {
  const MC_ = 30, e = 4;
  assert.deepEqual(nums(right(Q.m7).t), [MC_ / (1 - 1 / e)]);
  assert.deepEqual(wrongs(Q.m7).map((o) => nums(o.t)[0]), [MC_ * (1 + 1 / e), MC_ * e, MC_]);
});

test("Q8 returns to scale: exponents sum to 1.1", () => {
  assert.ok(0.3 + 0.8 > 1);
  assert.match(right(Q.m8).t, /^Increasing/);
});

test("Q9 shutdown: below min AVC shutting loses less", () => {
  assert.match(right(Q.m9).t, /Shut down/);
  assert.ok(TC(2) - 8 * 2 > 32);
});

test("Q10 prisoner's dilemma: (Low, Low) is the only equilibrium", () => {
  assert.match(right(Q.m10).t, /Both defect/);
  assert.equal(JSON.stringify(Micro.nash([[10, 2], [12, 5]], [[10, 12], [2, 5]]).pure), "[[1,1]]");
});

test("Q11 Cournot 40 each, and each slip", () => {
  const c = Micro.cournot(120, 1, 0, 0), q = (120 - 0) / (3 * 1);
  assert.deepEqual(nums(right(Q.m11).t), [c.q1]);
  assert.equal(q, c.q1);
  // competitive output split; monopoly output split; Cournot quantity halved
  assert.deepEqual(wrongs(Q.m11).map((o) => nums(o.t)[0]), [120 / 2, Micro.monopoly(120, 1, 0).Qm / 2, q / 2]);
});

test("Q12 MRS: the right formula matches MUx/MUy numerically; the slips don't", () => {
  const aa = 0.3, x = 4, y = 9, h = 1e-6;
  const U = (x, y) => Math.pow(x, aa) * Math.pow(y, 1 - aa);
  const mrs = ((U(x + h, y) - U(x - h, y)) / (2 * h)) / ((U(x, y + h) - U(x, y - h)) / (2 * h));
  near(mrs, (aa / (1 - aa)) * (y / x), 1e-6, "right option");
  assert.ok(Math.abs(mrs - (aa / (1 - aa)) * (x / y)) > 0.1);
  assert.ok(Math.abs(mrs - aa / (1 - aa)) > 0.1);
});
