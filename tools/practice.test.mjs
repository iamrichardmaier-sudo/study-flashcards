// node --test tools/practice.test.mjs
//
// The practice midterm drill: every number in a right option is re-derived
// from the exam's own setup, and every numeric wrong option is re-derived
// from the one slip its diagnosis names, so "you used W instead of W/P"
// really is what produces the number shown.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const src = readFileSync(new URL("./practice/questions.js", import.meta.url), "utf8");
const ctx = {};
vm.runInNewContext(src + "\nout.P = EXAM;", { out: ctx });
const P = ctx.P;
const Q = Object.fromEntries(P.questions.map((q) => [q.id, q]));

/** The number in an option's text (first one after "=" or "≈"), commas removed. */
function num(t) {
  const m = t.replace(/<[^>]+>/g, "").replace(/,/g, "").replace(/−/g, "-").match(/[=≈]\s*(-?[\d.]+)/);
  assert.ok(m, "no number in " + t);
  return Number(m[1]);
}
const right = (q) => num(q.options.find((o) => o.right).t);
const wrong = (q) => q.options.filter((o) => !o.right).map((o) => num(o.t));
/** `want` (in order of the wrong options) matches the shown numbers to the shown precision. */
function same(shown, want) {
  assert.equal(shown.length, want.length);
  shown.forEach((s, k) => {
    const dp = (String(s).split(".")[1] || "").length;
    assert.ok(Math.abs(s - want[k]) <= 0.5 * Math.pow(10, -dp) + 1e-9, `option ${k}: shows ${s}, slip gives ${want[k]}`);
  });
}
const pow = Math.pow;

test("35 questions: 20 from Part 1, 15 from Part 2, ids unique", () => {
  assert.equal(P.questions.filter((q) => q.section === "p1").length, 20);
  assert.equal(P.questions.length, 35);
  assert.equal(new Set(P.questions.map((q) => q.id)).size, 35);
});

test("answer key: the select-all and pick-one answers match the PDF", () => {
  const letters = (q) => q.options.map((o, k) => (o.right ? "abcd"[k] : "")).join("");
  assert.equal(letters(Q["p1-01"]), "c");
  assert.equal(letters(Q["p1-08"]), "bc");
  assert.equal(letters(Q["p1-13"]), "abcd");
  assert.equal(letters(Q["p1-16"]), "c");
  for (const [id, ans] of [["p1-04", "True"], ["p1-09", "False"], ["p1-17", "False"], ["p1-20", "False"]]) {
    assert.equal(Q[id].options.find((o) => o.right).t, ans, id);
  }
});

test("Q11 velocity: V = i^0.5 / 2 = 1, and each slip", () => {
  const i = 4, Y = 775;
  assert.equal(right(Q["p1-11"]), pow(i, 0.5) / 2);
  same(wrong(Q["p1-11"]), [pow(i, 0.5), 2 * pow(i, 0.5), Y / 2]);
});

test("Part 2 Q1: golden rule k and s", () => {
  const a = 0.3, d = 0.07;
  const k = pow(a / d, 1 / (1 - a));
  same([right(Q["p2-1a-k"])], [k]);
  same(wrong(Q["p2-1a-k"]), [a / d, pow(a / d, 1 - a), pow(d / a, 1 / (1 - a))]);
  same([right(Q["p2-1a-s"])], [d * k / pow(k, a)]);
  same(wrong(Q["p2-1a-s"]), [1 - a, d, 1]);
});

test("Part 2 Q2(a): u1 and u2, and each slip", () => {
  const f = 0.28, s = 0.02, L0 = 15, U0 = 0.067 * L0;
  const U1 = Math.round(U0), E1 = L0 - U1 + 1, L1 = L0 + 1;
  same([right(Q["p2-2a-u1"])], [U1 / L1]);
  same(wrong(Q["p2-2a-u1"]), [U1 / L0, U1 / (L0 - U1), (U1 + 1) / L1]);
  const U2 = (1 - f) * U1 + s * E1;
  same([right(Q["p2-2a-u2"])], [U2 / L1]);
  same(wrong(Q["p2-2a-u2"]), [((1 - f) * U1 + s * (E1 - 1)) / L1, (f * U1 + s * E1) / L1, s / (s + f)]);
});

test("Part 2 Q3(a): labor demand L = 3,069.7, and each slip", () => {
  const K = 1000, W = 5, P_ = 2, mplCoef = 5 * 0.7 * pow(K, 0.3);
  same([right(Q["p2-3a"])], [pow(mplCoef / (W / P_), 1 / 0.3)]);
  same(wrong(Q["p2-3a"]), [pow(mplCoef / W, 1 / 0.3), pow(5 * pow(K, 0.3) / (W / P_), 1 / 0.3), mplCoef / (W / P_)]);
});

test("Part 2 Q3(b): alpha, K and A backed out, and each slip", () => {
  const Y = 150, L = 200, MPL = 0.5, MPK = 0.5;
  const a = 1 - MPL * L / Y;
  assert.ok(Math.abs(a - 1 / 3) < 1e-12);
  const K = a * Y / MPK;
  same([right(Q["p2-3b-k"])], [K]);
  same(wrong(Q["p2-3b-k"]), [(2 / 3) * Y / MPK, Y / MPK, a * Y * MPK]);
  const A = Y / (pow(K, a) * pow(L, 1 - a));
  same([right(Q["p2-3b-A"])], [A]);
  same(wrong(Q["p2-3b-A"]), [Y / (pow(K, 1 - a) * pow(L, a)), Y / (pow(Y / MPK, a) * pow(L, 1 - a)), 1 / A]);
});

test("Part 2 Q3(c): Y, r, I on Beta Xi VII, and each slip", () => {
  const K = 169, L = 225, G = 10, T = 10;
  const Y = pow(K, 0.5) * pow(L, 0.5);
  same([right(Q["p2-3c-y"])], [Y]);
  same(wrong(Q["p2-3c-y"]), [K * L, K + L, (K + L) / 2]);
  const r = (10 + 0.5 * (Y - T) + 100 + G - Y) / 2;
  same([right(Q["p2-3c-r"])], [r]);
  same(wrong(Q["p2-3c-r"]), [(10 + 0.5 * (Y - T) + 100 - Y) / 2, (10 + 0.5 * Y + 100 + G - Y) / 2, -r]);
  const I = 100 - 2 * r;
  same([right(Q["p2-3c-i"])], [I]);
  same(wrong(Q["p2-3c-i"]), [100 + 2 * r, 100 - r, 100 - 2 * (10 + 0.5 * Y + 100 + G - Y) / 2]);
  // saving equals investment
  assert.equal(Y - (10 + 0.5 * (Y - T)) - G, I);
});
