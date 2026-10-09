// node --test tools/models.test.mjs
//
// The model engine against the worked answers in the Midterm 1 Master Study
// Guide. Every number a walkthrough states should appear here.

import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const E = require("./models/engine.js");

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ""} expected ${b}, got ${a}`);

test("Gamma Epsilon IV (PE Q3a): firms hire until MPL = W/P → L ≈ 3,069.7", () => {
  const o = E.production({ A: 5, alpha: 0.3, K: 1000, wReal: 5 / 2 });
  near(o.L, 3069.7, 0.1);
  near(o.MPL, 2.5, 1e-9);
});

test("Theta Alpha III (PE Q3b): α = 1/3, K = 100, A = 0.945", () => {
  const b = E.backOut({ Y: 150, L: 200, MPL: 0.5, MPK: 0.5 });
  near(b.alpha, 1 / 3, 1e-12);
  near(b.K, 100, 1e-9);
  near(b.A, 0.945, 0.0005);
});

test("Ch 3 #2: plague halves labor", () => {
  const before = E.production({ A: 1, alpha: 0.5, K: 100, L: 100 });
  near(before.Y, 100, 1e-9); near(before.MPL, 0.5, 1e-9); near(before.MPK, 0.5, 1e-9);
  const after = E.production({ A: 1, alpha: 0.5, K: 100, L: 50 });
  near(after.Y, 70.71, 0.005); near(after.MPL, 0.707, 0.0005); near(after.MPK, 0.354, 0.0005);
  near(after.laborShare, 0.5, 1e-12);
});

test("Ch 3 #1: the four shocks move the real wage and rental rate as the guide's table says", () => {
  const base = { A: 1, alpha: 1 / 3, K: 8000, L: 1000, P: 1 };
  const d = (input) => E.direction(E.production, base, input, ["wReal", "rReal", "laborShare"]);
  assert.deepEqual(d("L"), { wReal: "down", rReal: "up", laborShare: "same" });     // immigration
  const quake = E.direction(E.production, base, "K", ["wReal", "rReal"], -100);   // capital destroyed
  assert.deepEqual(quake, { wReal: "down", rReal: "up" });
  assert.deepEqual(E.direction(E.production, base, "A", ["wReal", "rReal"]), { wReal: "up", rReal: "up" });
  assert.deepEqual(E.direction(E.production, base, "P", ["wReal", "rReal", "W"]), { wReal: "same", rReal: "same", W: "up" });
});

test("Beta Xi VII (PE Q3c): Y = 195, r = 8.75, I = 82.5", () => {
  const o = E.funds({ A: 1, alpha: 0.5, K: 169, L: 225, c0: 10, mpc: 0.5, T: 10, G: 10, i0: 100, b: 2 });
  near(o.Y, 195, 1e-9); near(o.r, 8.75, 1e-9); near(o.I, 82.5, 1e-9);
});

test("Ch 4 #3: G 2,500 → 2,000 moves r from 7% to 2%", () => {
  const p = { Y: 8000, c0: 1000, mpc: 2 / 3, T: 2000, G: 2500, i0: 1200, b: 100 };
  const a = E.funds(p);
  near(a.C, 5000, 1e-9); near(a.Spriv, 1000, 1e-9); near(a.Spub, -500, 1e-9); near(a.S, 500, 1e-9);
  near(a.r, 7, 1e-9); near(a.I, 500, 1e-9);
  const b = E.funds({ ...p, G: 2000 });
  near(b.S, 1000, 1e-9); near(b.r, 2, 1e-9); near(b.I, 1000, 1e-9);
});

test("Ch 4 #4: balanced-budget rise lowers S by (1 − MPC)x", () => {
  const p = { Y: 8000, c0: 1000, mpc: 2 / 3, T: 2000, G: 2500, i0: 1200, b: 100 };
  const b = E.funds({ ...p, G: 2600, T: 2100 });
  near(b.Spub, -500, 1e-9);
  near(b.S - 500, -100 / 3, 1e-9);
  near(b.r, 7 + 1 / 3, 1e-9);
});

test("$100B tax rise with MPC 0.6: S +60, I +60", () => {
  const p = { Y: 5000, c0: 200, mpc: 0.6, T: 1000, G: 1000, i0: 1800, b: 100 };
  const a = E.funds(p), b = E.funds({ ...p, T: 1100 });
  near(b.Spub - a.Spub, 100, 1e-9); near(b.Spriv - a.Spriv, -40, 1e-9);
  near(b.S - a.S, 60, 1e-9); near(b.I - a.I, 60, 1e-9);
  assert.deepEqual(E.direction(E.funds, p, "G", ["r", "I", "C"]), { r: "up", I: "down", C: "same" });
});

test("PS3 combined model: G 60 → 65 moves r 5 → 10, I 90 → 85, i 7 → 12, π stays 2", () => {
  const p = { Ys: 500, C: 350, G: 60, a: 95, b: 1, gM: 2, gY: 0 };
  const a = E.money(p);
  near(a.pi, 2, 1e-9); near(a.r, 5, 1e-9); near(a.I, 90, 1e-9); near(a.i, 7, 1e-9);
  const b = E.money({ ...p, G: 65 });
  near(b.r, 10, 1e-9); near(b.I, 85, 1e-9); near(b.i, 12, 1e-9); near(b.pi, 2, 1e-9);
  assert.deepEqual(E.direction(E.money, p, "G", ["r", "pi", "i"]), { r: "up", pi: "same", i: "up" });
  assert.deepEqual(E.direction(E.money, p, "gM", ["r", "pi", "i"]), { r: "same", pi: "up", i: "up" });
});

test("Wiknam (Ch 6 #1): nominal GDP growth 8, π = 5, r = 4", () => {
  const o = E.money({ gM: 8, gY: 3, iGiven: 9, Ys: 0, C: 0, G: 0, a: 0, b: 1 });
  near(o.nomGDPgrowth, 8, 1e-9); near(o.pi, 5, 1e-9); near(o.r, 4, 1e-9);
});

test("Ch 6 #3: V = 5√i; P 12 → 18; M 800 keeps P at 12", () => {
  const base = { vk: 5, iGiven: 4, M: 1200, Yl: 1000, gM: 0, gY: 0, Ys: 0, C: 0, G: 0, a: 0, b: 1 };
  const a = E.money(base);
  near(a.V, 10, 1e-9); near(a.P, 12, 1e-9);
  const b = E.money({ ...base, iGiven: 9 });
  near(b.V, 15, 1e-9); near(b.P, 18, 1e-9);
  near(E.money({ ...base, iGiven: 9, M: 800 }).P, 12, 1e-9);
});

test("PE Q11: (M/P)^d = 2Y/√i with i = 4 gives V = 1", () => {
  near(E.money({ vk: 0.5, iGiven: 4, M: 1, Yl: 775, gM: 0, gY: 0, Ys: 0, C: 0, G: 0, a: 0, b: 1 }).V, 1, 1e-12);
});

test("The Supers (PE Q2a): u1 = 6.25%, u2 = 6.375%, heading to 6.67%", () => {
  const path = E.flowsPath({ s: 0.02, f: 0.28, U0: 1, E0: 14, shock: { t: 1, dE: 1 } }, 60);
  near(path[1].u, 0.0625, 1e-12);
  near(path[2].U, 1.02, 1e-12); near(path[2].E, 14.98, 1e-12);
  near(path[2].u, 0.06375, 1e-12);
  near(path[60].u, 0.02 / 0.3, 1e-6);
});

test("Violet's model (PE Q2b): entry and exit leave u* = s/(s+f)", () => {
  const path = E.flowsPath({ s: 0.02, f: 0.28, U0: 1, E0: 14, NL0: 5, j: 0.05, q: 0.01 }, 600);
  near(path[600].u, 0.02 / 0.3, 1e-6);
});

test("Separations double or job finding halves: both give 12.5%", () => {
  near(E.flows({ s: 0.04, f: 0.28, U0: 1, E0: 14 }).uStar, 0.125, 1e-12);
  near(E.flows({ s: 0.02, f: 0.14, U0: 1, E0: 14 }).uStar, 0.125, 1e-12);
});

test("1860s Massachusetts (PE Q1a): k* = k_gold = 7.996, s_gold = 0.3", () => {
  const o = E.solow({ alpha: 0.3, s: 0.3, delta: 0.07 });
  near(o.kStar, 7.996, 0.0005); near(o.kGold, 7.996, 0.0005); near(o.sGold, 0.3, 1e-12);
});

test("War (PE Q1b/c): k jumps above k*, then y and c fall back to the same steady state", () => {
  const ss = E.solow({ alpha: 0.3, s: 0.3, delta: 0.07 });
  const path = E.solowPath({ alpha: 0.3, s: 0.3, delta: 0.07, k0: 10 }, 200);
  assert.ok(path[0].y > ss.yStar && path[0].dk < 0);
  for (let t = 1; t < 200; t++) assert.ok(path[t].y < path[t - 1].y, "y falls every year");
  near(path[200].y, ss.yStar, 1e-4); near(path[200].c, ss.cStar, 1e-4);
});

test("Ch 9 #1: country B (s = 0.3) overtakes A (s = 0.1) in year 5", () => {
  const p = { alpha: 1 / 3, delta: 0.2, k0: 1 };
  const A = E.solowPath({ ...p, s: 0.1 }, 60), B = E.solowPath({ ...p, s: 0.3 }, 60);
  near(A[0].c, 0.9, 1e-12); near(B[0].c, 0.7, 1e-12);
  near(B[5].c, 0.784, 0.0005); near(A[5].c, 0.775, 0.0005);
  for (let t = 0; t < 5; t++) assert.ok(B[t].c < A[t].c);
  near(E.solow({ ...p, s: 0.1 }).cStar, 0.636, 0.0005);
  near(E.solow({ ...p, s: 0.3 }).cStar, 0.857, 0.0005);
});

test("Swan Island (Ch 9 #2): y = 100, Δk = 5.5, k* = 216, y* = 120", () => {
  const p = { A: 20, alpha: 1 / 3, s: 0.18, delta: 0.1, k0: 125 };
  const t0 = E.solowPath(p, 1)[0];
  near(t0.y, 100, 1e-9); near(t0.i, 18, 1e-9); near(t0.c, 82, 1e-9); near(t0.dep, 12.5, 1e-9); near(t0.dk, 5.5, 1e-9);
  const ss = E.solow(p);
  near(ss.kStar, 216, 1e-9); near(ss.yStar, 120, 1e-9);
});

test("Sokovia (PS5): k* 3.175, c* 1.270; k_gold 10.08, c_gold 1.512; switch dips to 0.952, passes 1.270 in year 13", () => {
  const p = { alpha: 0.4, s: 0.2, delta: 0.1 };
  const ss = E.solow(p);
  near(ss.kStar, 3.175, 0.0005); near(ss.yStar, 1.587, 0.0005); near(ss.cStar, 1.270, 0.0005);
  near(ss.kGold, 10.08, 0.005); near(ss.sGold, 0.4, 1e-12); near(ss.cGold, 1.512, 0.0005);
  const path = E.solowPath({ ...p, sAfter: 0.4, k0: ss.kStar }, 200);
  near(path[0].c, 0.952, 0.0005);
  near(path[1].k, 3.492, 0.0005); near(path[1].c, 0.989, 0.0005);
  const cross = path.findIndex((x) => x.c > ss.cStar);
  assert.equal(cross, 13, "consumption passes the old level in year 13");
  near(path[200].c, 1.512, 0.0005);
});

test("Above the golden rule: cutting s from 0.7 to 0.5 raises c at every date", () => {
  const p = { alpha: 0.5, s: 0.7, delta: 0.1 };
  const ss = E.solow(p);
  near(ss.kStar, 49, 1e-9); near(ss.cStar, 2.1, 1e-9);
  const path = E.solowPath({ ...p, sAfter: 0.5, k0: 49 }, 200);
  near(path[0].c, 3.5, 1e-9);
  assert.ok(path.every((x) => x.c > 2.1));
  near(path[200].c, 2.5, 1e-4);
});

test("Solow comparative statics: s raises k* and y*, δ and n lower them", () => {
  const p = { alpha: 0.3, s: 0.3, delta: 0.07, n: 0 };
  assert.deepEqual(E.direction(E.solow, p, "s", ["kStar", "yStar", "kGold"]), { kStar: "up", yStar: "up", kGold: "same" });
  assert.deepEqual(E.direction(E.solow, p, "delta", ["kStar", "yStar"]), { kStar: "down", yStar: "down" });
  assert.deepEqual(E.direction(E.solow, p, "n", ["kStar", "yStar"], 0.01), { kStar: "down", yStar: "down" });
});

// ------------------------------------------------ the walkthroughs themselves
//
// Load the model definitions the way the page does and play every step of
// every walkthrough: the prediction's right answer must be a real value,
// every line of working must render, and every chart must draw without NaN.

import { readFileSync } from "node:fs";
import vm from "node:vm";

function loadModels() {
  const ctx = { MODELS: [], WEEKS: [], window: {}, Math, JSON, Object, Number, String, Array, isFinite, console };
  vm.createContext(ctx);
  for (const f of ["models/engine.js", "models/charts.js", "models/defs/production.js", "models/defs/funds.js",
                   "models/defs/money.js", "models/defs/flows.js", "models/defs/solow.js", "models/defs/golden.js"]) {
    vm.runInContext(readFileSync(new URL("./" + f, import.meta.url), "utf8"), ctx, { filename: f });
  }
  return ctx.MODELS;
}

const merge = (a, b) => ({ ...a, ...(b || {}) });

test("six models with four walkthroughs each", () => {
  const M = loadModels();
  assert.deepEqual(M.map((m) => m.id), ["production", "funds", "money", "flows", "solow", "golden"]);
  for (const m of M) assert.equal(m.scenarios.length, 4, m.id);
});

test("every walkthrough step plays: answers are real, working renders, charts draw", () => {
  const M = loadModels();
  const clean = (s, where) => {
    assert.ok(typeof s === "string", where + " should be a string");
    assert.ok(!/NaN|undefined|Infinity/.test(s), where + " contains NaN/undefined: " + s.slice(0, 160));
  };
  let predictions = 0;
  for (const m of M) {
    const draw = (p, ghost, target, hide, sc) => {
      const g = m.graph(p, ghost, target, hide);
      clean(g.svg, `${m.id} graph`);
      clean(m.line(p, ghost, target, hide, sc), `${m.id} line`);
      clean(m.bars(p, ghost, target, hide) || "", `${m.id} bars`);
    };
    draw(m.base, null, null, []);
    for (const sc of m.scenarios) {
      let state = { ...sc.base }, hide = [];
      for (const [k, st] of sc.steps.entries()) {
        const where = `${m.id}/${sc.id} step ${k + 1}`;
        const before = state;
        const after = merge(state, st.set);
        if (st.predict) {
          predictions++;
          const pr = st.predict, o = m.solve(after);
          let ans;
          if (pr.kind === "num") ans = pr.value ? pr.value(o, after) : o[pr.key];
          else if (pr.kind === "dir") {
            const a = pr.vs ? o[pr.vs] : m.solve(pr.from === "base" ? sc.base : before)[pr.key];
            const b = o[pr.key];
            assert.ok(Number.isFinite(a) && Number.isFinite(b), `${where}: dir compares numbers`);
            ans = b > a ? "up" : b < a ? "down" : "same";
          } else ans = typeof pr.answer === "function" ? pr.answer(o, after) : pr.answer;
          if (pr.kind === "num") assert.ok(Number.isFinite(ans), `${where}: numeric answer is ${ans}`);
          else assert.ok(typeof ans === "string" && ans.length, `${where}: answer ${ans}`);
          if (pr.kind === "choice") assert.ok(pr.choices.some((c) => c.id === ans), `${where}: answer ${ans} is one of the choices`);
        }
        if (st.hide) hide = st.hide;
        for (const line of st.math || []) clean(typeof line === "function" ? line(m.solve(after), after) : line, `${where} math`);
        draw(before, null, after, hide, sc);
        draw(after, before, null, hide, sc);
        state = after;
      }
      assert.ok(sc.exam && sc.exam.lines.length, `${m.id}/${sc.id} has an exam card`);
    }
  }
  assert.ok(predictions >= 60, `expected plenty of predictions, found ${predictions}`);
});

test("walkthrough answers match the numbers the guide states", () => {
  const M = loadModels();
  const at = (mid, sid, step) => {
    const m = M.find((x) => x.id === mid), sc = m.scenarios.find((s) => s.id === sid);
    let st = { ...sc.base };
    for (let k = 0; k <= step; k++) st = merge(st, sc.steps[k].set);
    const pr = sc.steps[step].predict, o = m.solve(st);
    return pr.value ? pr.value(o, st) : o[pr.key];
  };
  near(at("production", "gamma-epsilon", 3), 3069.7, 0.1);
  near(at("production", "theta-alpha", 3), 0.945, 0.0005);
  near(at("funds", "beta-xi", 2), 8.75, 1e-9);
  near(at("funds", "tax-hike", 2), 60, 1e-9);
  near(at("money", "ps3", 3), 7, 1e-9);
  near(at("money", "velocity", 3), 18, 1e-9);
  near(at("money", "velocity", 4), 800, 1e-9);
  near(at("flows", "supers", 3), 0.06375, 1e-12);
  near(at("solow", "mass-ss", 2), 7.996, 0.0005);
  assert.equal(at("solow", "a-vs-b", 2), 5);
  near(at("solow", "swan", 3), 216, 1e-9);
  near(at("golden", "sokovia-switch", 1), 0.952, 0.0005);
  assert.equal(at("golden", "sokovia-switch", 3), 13);
});
