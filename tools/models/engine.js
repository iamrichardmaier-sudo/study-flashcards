// The six models, as pure functions.
//
// Every number a walkthrough shows comes from here, and
// tools/models.test.mjs checks these against the worked answers in the
// Midterm 1 Master Study Guide, so a walkthrough can't state a number the
// model doesn't produce. No DOM; build.mjs inlines this into the page and
// the tests load it under Node.

var ENGINE = (function () {
  "use strict";

  // ------------------------------------------------- 1. production & factors
  //
  // Y = A K^α L^(1−α). Competitive firms: MPL = W/P, MPK = R/P.
  // If `wReal` is given, L is what firms hire at that real wage (labor
  // demand); otherwise L is the fixed labor supply and the wage is MPL.

  function production(p) {
    var A = p.A, a = p.alpha, K = p.K, P = p.P == null ? 1 : p.P;
    var L = p.wReal != null
      ? Math.pow((1 - a) * A * Math.pow(K, a) / p.wReal, 1 / a)
      : p.L;
    var Y = A * Math.pow(K, a) * Math.pow(L, 1 - a);
    var MPL = (1 - a) * Y / L, MPK = a * Y / K;
    return {
      L: L, Y: Y, MPL: MPL, MPK: MPK,
      wReal: MPL, rReal: MPK,                 // real wage, real rental rate
      W: P * MPL, R: P * MPK,                 // nominal
      laborShare: MPL * L / Y, capShare: MPK * K / Y,
      laborIncome: MPL * L, capIncome: MPK * K,
      yPerL: Y / L, P: P,
    };
  }

  /** Back out α, K and A from observed Y, L, MPL and MPK (PE Q3b). */
  function backOut(o) {
    var alpha = 1 - o.MPL * o.L / o.Y;          // labor share = 1 − α
    var K = alpha * o.Y / o.MPK;                // capital share = MPK·K/Y = α
    var A = o.Y / (Math.pow(K, alpha) * Math.pow(o.L, 1 - alpha));
    return { alpha: alpha, K: K, A: A };
  }

  /** Points on the MPL (labor demand) curve, for the graph. */
  function mplCurve(p, Lmin, Lmax, n) {
    var pts = [];
    for (var k = 0; k <= n; k++) {
      var L = Lmin + (Lmax - Lmin) * k / n;
      pts.push([L, (1 - p.alpha) * p.A * Math.pow(p.K, p.alpha) * Math.pow(L, -p.alpha)]);
    }
    return pts;
  }

  // ------------------------------------------------------- 2. loanable funds
  //
  // C = c0 + mpc (Y − T), I = i0 − b r. Saving S = Y − C − G does not depend
  // on r, so the supply of loanable funds is vertical and r clears the market.
  // Y is either given or comes from Y = A K^α L^(1−α).

  function funds(p) {
    var Y = p.Y != null ? p.Y : p.A * Math.pow(p.K, p.alpha) * Math.pow(p.L, 1 - p.alpha);
    var C = p.c0 + p.mpc * (Y - p.T);
    var Spriv = Y - p.T - C, Spub = p.T - p.G, S = Spriv + Spub;
    var r = (p.i0 - S) / p.b;
    var I = p.i0 - p.b * r;
    return { Y: Y, C: C, Spriv: Spriv, Spub: Spub, S: S, r: r, I: I, G: p.G, T: p.T, YD: Y - p.T };
  }

  // ------------------------------------------------ 3. money, inflation, Fisher
  //
  // Real side: r from S = I(r) as in model 2 (S = Y − C − G, I = a − b r),
  // unless the problem hands you the nominal rate (then r = i − π).
  // Nominal side: %ΔM + %ΔV = π + %ΔY, so with constant V, π = gM − gY.
  // Fisher: i = r + π. Levels: P = M V / Y, with V either constant or
  // V = vk·√i from a money demand (M/P)^d = Y / (vk √i).

  function money(p) {
    var gV = p.gV || 0;
    var pi = p.gM + gV - p.gY;
    var S = p.Ys - p.C - p.G;
    var r = p.iGiven != null ? p.iGiven - pi : (p.a - S) / p.b;
    var I = p.iGiven != null ? null : p.a - p.b * r;
    var i = p.iGiven != null ? p.iGiven : r + pi;
    var V = p.vk != null ? p.vk * Math.sqrt(i) : p.V;
    var P = p.M != null && V != null ? p.M * V / p.Yl : null;
    return { pi: pi, S: p.iGiven != null ? null : S, r: r, I: I, i: i, V: V, P: P,
             nomGDPgrowth: p.gM + gV, k: V ? 1 / V : null };
  }

  // ------------------------------------------------- 4. unemployment flows
  //
  // U(t+1) = (1 − f) U(t) + s E(t);  E(t+1) = (1 − s) E(t) + f U(t).
  // Optional entry and exit (Violet's model): NL(t+1) = (1 − j) NL + q E,
  // E(t+1) = (1 − s − q) E + f U + j NL. Steady state: u = s / (s + f).

  function flows(p) {
    var u = p.s / (p.s + p.f);
    return { uStar: u, inflow: p.s * p.E0, outflow: p.f * p.U0, u0: p.U0 / (p.U0 + p.E0) };
  }

  /** The month-by-month path. `shock` = {t, dE, dU} adds people at month t
   *  (the Supers: the labor force and employment both rise 1 million). */
  function flowsPath(p, T) {
    var U = p.U0, E = p.E0, NL = p.NL0 || 0;
    var j = p.j || 0, q = p.q || 0;
    var out = [];
    for (var t = 0; t <= T; t++) {
      if (p.shock && p.shock.t === t) { E += p.shock.dE || 0; U += p.shock.dU || 0; }
      out.push({ t: t, U: U, E: E, NL: NL, L: U + E, u: U / (U + E) });
      var U1 = (1 - p.f) * U + p.s * E;
      var E1 = (1 - p.s - q) * E + p.f * U + j * NL;
      var NL1 = (1 - j) * NL + q * E;
      U = U1; E = E1; NL = NL1;
    }
    return out;
  }

  // ------------------------------------------------------ 5 & 6. Solow model
  //
  // y = A k^α, i = s y, c = (1 − s) y, Δk = s y − (δ + n) k.

  function solow(p) {
    var A = p.A || 1, a = p.alpha, s = p.s, d = p.delta, n = p.n || 0;
    var kStar = Math.pow(s * A / (d + n), 1 / (1 - a));
    var yStar = A * Math.pow(kStar, a);
    var kGold = Math.pow(a * A / (d + n), 1 / (1 - a));
    var yGold = A * Math.pow(kGold, a);
    return {
      kStar: kStar, yStar: yStar, cStar: (1 - s) * yStar, iStar: s * yStar,
      depStar: (d + n) * kStar,
      kGold: kGold, yGold: yGold, cGold: yGold - (d + n) * kGold,
      sGold: (d + n) * kGold / yGold,
      mpkStar: a * A * Math.pow(kStar, a - 1),
    };
  }

  /** Year-by-year path from k0. `sAfter` switches the saving rate at t = 0
   *  (Sokovia) and `k0` can sit anywhere (a war that shrinks L moves k0 up). */
  function solowPath(p, T) {
    var A = p.A || 1, a = p.alpha, d = p.delta, n = p.n || 0;
    var s = p.sAfter != null ? p.sAfter : p.s;
    var k = p.k0, out = [];
    for (var t = 0; t <= T; t++) {
      var y = A * Math.pow(k, a);
      out.push({ t: t, k: k, y: y, c: (1 - s) * y, i: s * y, dep: (d + n) * k, dk: s * y - (d + n) * k });
      k = k + s * y - (d + n) * k;
    }
    return out;
  }

  /** Steady-state consumption at each saving rate: the golden-rule hump. */
  function cStarBySaving(p, n) {
    var pts = [];
    for (var k = 1; k < n; k++) {
      var s = k / n;
      pts.push([s, solow(Object.assign({}, p, { s: s })).cStar]);
    }
    return pts;
  }

  // ------------------------------------------------- comparative statics
  //
  // Nudge one input, re-solve, and read the direction each output moves.
  // The dashboard's table is built from this, so it always agrees with the
  // model rather than with a hand-typed table.

  function direction(solveFn, params, input, outputs, step) {
    var base = solveFn(params);
    var bumped = Object.assign({}, params);
    var h = step != null ? step : Math.max(Math.abs(params[input]) * 0.01, 1e-4);
    bumped[input] = params[input] + h;
    var next = solveFn(bumped);
    var res = {};
    outputs.forEach(function (o) {
      var a = base[o], b = next[o];
      if (a == null || b == null) { res[o] = "na"; return; }
      var tol = 1e-9 * Math.max(1, Math.abs(a));
      res[o] = b > a + tol ? "up" : b < a - tol ? "down" : "same";
    });
    return res;
  }

  return {
    production: production, backOut: backOut, mplCurve: mplCurve,
    funds: funds, money: money,
    flows: flows, flowsPath: flowsPath,
    solow: solow, solowPath: solowPath, cStarBySaving: cStarBySaving,
    direction: direction,
  };
})();

if (typeof module !== "undefined") module.exports = ENGINE;
