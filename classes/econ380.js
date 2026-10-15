// ECON 380 · Intermediate Micro Theory 1. Cards, practice questions and four
// model playgrounds from research/econ380-features.md: consumer optimum with
// the substitution/income split, market with taxes and controls, monopoly vs
// competition, and 2×2 games plus Cournot. The maths (Micro) is plain
// functions, checked in tools/classes.test.mjs.
(function () {
  "use strict";
  var S = window.Study, h = S.h, fmt = S.fmt;

  // ------------------------------------------------------------- maths

  var Micro = {
    /** Cobb–Douglas U = x^a y^(1−a). Price of x moves px → px2.
        Returns bundles A (old), B (compensated), C (new) and the effects on x. */
    consumer: function (a, I, px, py, px2, method) {
      var U = function (x, y) { return Math.pow(x, a) * Math.pow(y, 1 - a); };
      var A = { x: a * I / px, y: (1 - a) * I / py };
      var C = { x: a * I / px2, y: (1 - a) * I / py };
      var B;
      if (method === "slutsky") {
        var I2 = px2 * A.x + py * A.y;            // just enough to buy the old bundle
        B = { x: a * I2 / px2, y: (1 - a) * I2 / py, I: I2 };
      } else {
        var U0 = U(A.x, A.y), k = (1 - a) * px2 / (a * py);   // y/x along the new price ratio
        var x = U0 * Math.pow(1 / k, 1 - a);
        B = { x: x, y: k * x };
        B.I = px2 * B.x + py * B.y;
      }
      A.U = U(A.x, A.y); B.U = U(B.x, B.y); C.U = U(C.x, C.y);
      return { A: A, B: B, C: C, sub: B.x - A.x, inc: C.x - B.x, total: C.x - A.x, U: U };
    },

    /** Linear demand P = a − bQ and supply P = c + dQ, with a policy:
        none | tax | subsidy | ceiling | floor, of size amt. */
    market: function (a, b, c, d, policy, amt) {
      var Qe = (a - c) / (b + d), Pe = a - b * Qe;
      var TS = 0.5 * (a - c) * Qe;
      var r = { Qe: Qe, Pe: Pe, TSe: TS, policy: policy, binding: true, gov: 0 };
      var Pd = function (q) { return a - b * q; }, Psup = function (q) { return c + d * q; };
      if (policy === "tax") {
        var t = Math.min(amt, a - c);
        r.Q = (a - c - t) / (b + d); r.Pb = Pd(r.Q); r.Ps = r.Pb - t;
        r.CS = 0.5 * (a - r.Pb) * r.Q; r.PS = 0.5 * (r.Ps - c) * r.Q; r.gov = t * r.Q;
      } else if (policy === "subsidy") {
        var s = amt;
        r.Q = (a - c + s) / (b + d); r.Pb = Pd(r.Q); r.Ps = r.Pb + s;
        r.CS = 0.5 * (a - r.Pb) * r.Q; r.PS = 0.5 * (r.Ps - c) * r.Q; r.gov = -s * r.Q;
      } else if (policy === "ceiling" && amt < Pe) {
        var Pc = Math.max(amt, c);
        r.Q = (Pc - c) / d; r.Pb = r.Ps = Pc;
        r.CS = a * r.Q - b * r.Q * r.Q / 2 - Pc * r.Q; r.PS = 0.5 * (Pc - c) * r.Q;
        r.shortage = (a - Pc) / b - r.Q;
      } else if (policy === "floor" && amt > Pe) {
        var Pf = Math.min(amt, a);
        r.Q = (a - Pf) / b; r.Pb = r.Ps = Pf;
        r.CS = 0.5 * (a - Pf) * r.Q; r.PS = Pf * r.Q - (c * r.Q + d * r.Q * r.Q / 2);
        r.surplus = (Pf - c) / d - r.Q;
      } else {
        r.binding = policy === "none" ? true : false;
        r.Q = Qe; r.Pb = r.Ps = Pe;
        r.CS = 0.5 * (a - Pe) * Qe; r.PS = 0.5 * (Pe - c) * Qe;
      }
      r.DWL = TS - (r.CS + r.PS + r.gov);
      if (Math.abs(r.DWL) < 1e-9) r.DWL = 0;
      r.elasD = -(1 / b) * (Pe / Qe);
      r.elasS = (1 / d) * (Pe / Qe);
      r.buyerShare = b / (b + d);
      return r;
    },

    /** Linear demand P = a − bQ, constant MC = c. */
    monopoly: function (a, b, c) {
      var Qm = (a - c) / (2 * b), Pm = (a + c) / 2, Qc = (a - c) / b;
      var elas = -(1 / b) * (Pm / Qm);
      return { Qm: Qm, Pm: Pm, Qc: Qc, Pc: c, profit: (Pm - c) * Qm, CSm: 0.5 * (a - Pm) * Qm, CSc: 0.5 * (a - c) * Qc,
        DWL: 0.5 * (Pm - c) * (Qc - Qm), lerner: (Pm - c) / Pm, elas: elas };
    },

    /** 2×2 game. A[i][j] = row player's payoff, B[i][j] = column player's,
        for row strategy i and column strategy j. */
    nash: function (A, B) {
      var rowBR = [[false, false], [false, false]], colBR = [[false, false], [false, false]];
      for (var j = 0; j < 2; j++) {
        var m = Math.max(A[0][j], A[1][j]);
        for (var i = 0; i < 2; i++) rowBR[i][j] = A[i][j] === m;
      }
      for (i = 0; i < 2; i++) {
        var n = Math.max(B[i][0], B[i][1]);
        for (j = 0; j < 2; j++) colBR[i][j] = B[i][j] === n;
      }
      var pure = [];
      for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) if (rowBR[i][j] && colBR[i][j]) pure.push([i, j]);
      var rowDom = A[0][0] > A[1][0] && A[0][1] > A[1][1] ? 0 : A[1][0] > A[0][0] && A[1][1] > A[0][1] ? 1 : null;
      var colDom = B[0][0] > B[0][1] && B[1][0] > B[1][1] ? 0 : B[0][1] > B[0][0] && B[1][1] > B[1][0] ? 1 : null;
      // Mixed: p = P(row plays 0) makes the column player indifferent; q = P(column plays 0) the row player.
      var mixed = null, dp = B[0][0] - B[1][0] - B[0][1] + B[1][1], dq = A[0][0] - A[0][1] - A[1][0] + A[1][1];
      if (dp !== 0 && dq !== 0) {
        var p = (B[1][1] - B[1][0]) / dp, q = (A[1][1] - A[0][1]) / dq;
        if (p > 0 && p < 1 && q > 0 && q < 1) mixed = { p: p, q: q };
      }
      return { rowBR: rowBR, colBR: colBR, pure: pure, rowDom: rowDom, colDom: colDom, mixed: mixed };
    },

    /** Cournot duopoly: P = a − b(q1 + q2), constant marginal costs c1, c2. */
    cournot: function (a, b, c1, c2) {
      var q1 = (a - 2 * c1 + c2) / (3 * b), q2 = (a - 2 * c2 + c1) / (3 * b);
      if (q2 < 0) { q2 = 0; q1 = (a - c1) / (2 * b); }
      if (q1 < 0) { q1 = 0; q2 = (a - c2) / (2 * b); }
      var Q = q1 + q2, P = a - b * Q;
      return { q1: q1, q2: q2, Q: Q, P: P, pi1: (P - c1) * q1, pi2: (P - c2) * q2 };
    },
  };

  // Cards and practice questions live in courses/econ380/ (cards.mjs, practice.mjs).

  // ------------------------------------------------------------ tools

  var COL = { d: "#1F4E8C", s: "#2E7D52", mc: "#B4561B", cs: "rgba(31,78,140,.18)", ps: "rgba(46,125,82,.2)",
    gov: "rgba(201,138,27,.28)", dwl: "rgba(192,57,43,.35)" };
  function kv(el, rows) {
    el.innerHTML = "";
    rows.forEach(function (r) { el.appendChild(h("span", { style: r[2] || "" }, r[0])); el.appendChild(h("b", { style: r[2] || "" }, r[1])); });
  }
  function lineAt(c, x, y, label, opt) {
    c.text(x, y, label, Object.assign({ "font-weight": 700, "font-size": 12 }, opt || {}));
  }

  // 1. Consumer optimizer + substitution/income decomposition
  function consumerTool(el) {
    var st = S.load("consumer", { a: 0.5, I: 100, px: 2, py: 2, px2: 4, method: "hicks" });
    var plot = h("div"), out = h("div", { class: "kv" }), note = h("p", { class: "dim small", style: "margin:0" });
    var sl = {
      a: S.slider("a in U = xᵃy¹⁻ᵃ", { min: 0.1, max: 0.9, step: 0.05, value: st.a, fmt: function (v) { return v.toFixed(2); } }, draw),
      I: S.slider("Income I", { min: 20, max: 200, step: 5, value: st.I }, draw),
      py: S.slider("Price of y", { min: 0.5, max: 10, step: 0.5, value: st.py }, draw),
      px: S.slider("Old price of x", { min: 0.5, max: 10, step: 0.5, value: st.px }, draw),
      px2: S.slider("New price of x", { min: 0.5, max: 10, step: 0.5, value: st.px2 }, draw),
    };
    var meth = S.select("Compensation", [["hicks", "Hicks (same utility as A)"], ["slutsky", "Slutsky (can still afford A)"]], st.method, function (v) { st.method = v; draw(); });
    function draw() {
      for (var k in sl) st[k] = sl[k].value;
      S.save("consumer", st);
      var r = Micro.consumer(st.a, st.I, st.px, st.py, st.px2, st.method);
      var xm = Math.max(st.I / st.px, st.I / st.px2, r.B.I / st.px2) * 1.1, ym = Math.max(st.I / st.py, r.B.I / st.py) * 1.1;
      var c = S.chart({ h: 420, x: [0, xm], y: [0, ym] }).axes({ xlabel: "x", ylabel: "y" });
      var ic = function (U, col, dash) {
        var pts = [];
        for (var i = 1; i <= 240; i++) { var x = xm * i / 240; pts.push([x, Math.pow(U / Math.pow(x, st.a), 1 / (1 - st.a))]); }
        c.path(pts, { stroke: col, "stroke-width": 1.6, "stroke-dasharray": dash || null });
      };
      ic(r.A.U, "#85796E"); ic(r.C.U, "#85796E", "5 4");
      c.line(0, st.I / st.py, st.I / st.px, 0, { stroke: COL.d, "stroke-width": 2.2 });
      c.line(0, st.I / st.py, st.I / st.px2, 0, { stroke: COL.mc, "stroke-width": 2.2 });
      c.line(0, r.B.I / st.py, r.B.I / st.px2, 0, { stroke: COL.mc, "stroke-width": 1.4, "stroke-dasharray": "6 4" });
      [["A", r.A, COL.d], ["B", r.B, "#2B2118"], ["C", r.C, COL.mc]].forEach(function (p) {
        c.dot(p[1].x, p[1].y, 5, { fill: p[2] });
        lineAt(c, p[1].x, p[1].y, " " + p[0], { dx: 6, dy: -6, fill: p[2] });
      });
      c.line(r.A.x, 0, r.A.x, r.A.y, { stroke: COL.d, "stroke-dasharray": "2 3", "stroke-width": 1 });
      c.line(r.B.x, 0, r.B.x, r.B.y, { stroke: "#2B2118", "stroke-dasharray": "2 3", "stroke-width": 1 });
      c.line(r.C.x, 0, r.C.x, r.C.y, { stroke: COL.mc, "stroke-dasharray": "2 3", "stroke-width": 1 });
      plot.innerHTML = c.svg();
      kv(out, [
        ["A: old optimum (x, y)", "(" + fmt(r.A.x) + ", " + fmt(r.A.y) + ")"],
        ["B: compensated (x, y)", "(" + fmt(r.B.x) + ", " + fmt(r.B.y) + ")"],
        ["C: new optimum (x, y)", "(" + fmt(r.C.x) + ", " + fmt(r.C.y) + ")"],
        ["Substitution effect A→B", fmt(r.sub), "color:#2B2118"],
        ["Income effect B→C", fmt(r.inc)],
        ["Total effect A→C", fmt(r.total), "font-weight:800"],
        ["Income needed at B", fmt(r.B.I)],
      ]);
      note.textContent = "Cobb–Douglas: x* = aI/pₓ = " + fmt(st.a, 2) + "·" + st.I + "/" + st.px2 + ". Solid budget: old prices. Orange: new. Dashed orange: new prices with compensated income.";
    }
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "panel card pad" }, sl.a.el, sl.I.el, sl.py.el, sl.px.el, sl.px2.el, meth.el),
      h("div", { class: "panel" }, plot, h("div", { class: "card pad stack" }, out, note))));
    draw();
  }

  // 2. Market with taxes, subsidies and price controls
  function marketTool(el) {
    var st = S.load("market", { a: 100, b: 2, c: 10, d: 1, policy: "tax", amt: 6 });
    var plot = h("div"), out = h("div", { class: "kv" }), msg = h("p", { class: "dim small", style: "margin:0" });
    var sl = {
      a: S.slider("Demand intercept a (P = a − bQ)", { min: 20, max: 200, step: 1, value: st.a }, draw),
      b: S.slider("Demand slope b", { min: 0.2, max: 5, step: 0.1, value: st.b, fmt: function (v) { return v.toFixed(1); } }, draw),
      c: S.slider("Supply intercept c (P = c + dQ)", { min: 0, max: 100, step: 1, value: st.c }, draw),
      d: S.slider("Supply slope d", { min: 0.2, max: 5, step: 0.1, value: st.d, fmt: function (v) { return v.toFixed(1); } }, draw),
      amt: S.slider("Tax / subsidy / price", { min: 0, max: 200, step: 1, value: st.amt }, draw),
    };
    var pol = S.select("Policy", [["none", "None"], ["tax", "Per-unit tax"], ["subsidy", "Per-unit subsidy"], ["ceiling", "Price ceiling"], ["floor", "Price floor"]],
      st.policy, function (v) { st.policy = v; draw(); });
    function draw() {
      for (var k in sl) st[k] = sl[k].value;
      S.save("market", st);
      var a = st.a, b = st.b, c0 = st.c, d = st.d;
      if (a <= c0) { plot.innerHTML = ""; out.innerHTML = ""; msg.textContent = "Demand starts below supply (a ≤ c), so nothing trades. Raise a or lower c."; return; }
      var r = Micro.market(a, b, c0, d, st.policy, st.amt);
      var qmax = Math.max(a / b, r.Q) * 1.05, pmax = a * 1.08;
      var c = S.chart({ h: 420, x: [0, qmax], y: [0, pmax] }).axes({ xlabel: "Q", ylabel: "P" });
      var Pd = function (q) { return a - b * q; }, Psu = function (q) { return c0 + d * q; };
      var Q = r.Q;
      c.area([[0, a], [0, r.Pb], [Q, r.Pb], [Q, Pd(Q)]], { fill: COL.cs });
      c.area([[0, c0], [Q, Psu(Q)], [Q, r.Ps], [0, r.Ps]], { fill: COL.ps });
      if (st.policy === "tax" && r.gov) c.area([[0, r.Ps], [Q, r.Ps], [Q, r.Pb], [0, r.Pb]], { fill: COL.gov });
      if (st.policy === "subsidy" && r.gov) c.rect(0, r.Pb, Q, r.Ps, { fill: "none", stroke: "#C98A1B", "stroke-width": 2, "stroke-dasharray": "5 4" });
      if (r.DWL > 1e-9) c.area([[Q, Pd(Q)], [r.Qe, r.Pe], [Q, Psu(Q)]], { fill: COL.dwl });
      c.line(0, a, a / b, 0, { stroke: COL.d, "stroke-width": 2.5 });
      c.line(0, c0, (pmax - c0) / d, pmax, { stroke: COL.s, "stroke-width": 2.5 });
      lineAt(c, a / b * 0.92, Pd(a / b * 0.92), "D", { fill: COL.d, dy: -8 });
      lineAt(c, Math.min(qmax, (pmax - c0) / d) * 0.9, Psu(Math.min(qmax, (pmax - c0) / d) * 0.9), "S", { fill: COL.s, dx: 8 });
      if ((st.policy === "ceiling" || st.policy === "floor") && r.binding) c.line(0, r.Pb, qmax, r.Pb, { stroke: "#2B2118", "stroke-width": 1.6, "stroke-dasharray": "6 4" });
      c.dot(r.Qe, r.Pe, 4, { fill: "#85796E" });
      if (st.policy === "tax" || st.policy === "subsidy") { c.dot(Q, r.Pb, 4, { fill: COL.d }); c.dot(Q, r.Ps, 4, { fill: COL.s }); }
      plot.innerHTML = c.svg();
      var rows = [
        ["Equilibrium without policy", "Q = " + fmt(r.Qe) + ", P = " + fmt(r.Pe)],
        ["Quantity traded", fmt(Q)],
        ["Price buyers pay / sellers get", fmt(r.Pb) + " / " + fmt(r.Ps)],
        ["Consumer surplus", fmt(r.CS), "color:" + COL.d],
        ["Producer surplus", fmt(r.PS), "color:" + COL.s],
      ];
      if (st.policy === "tax") rows.push(["Tax revenue", fmt(r.gov), "color:#9A6A12"]);
      if (st.policy === "subsidy") rows.push(["Subsidy cost", fmt(-r.gov), "color:#9A6A12"]);
      if (r.shortage) rows.push(["Shortage", fmt(r.shortage)]);
      if (r.surplus) rows.push(["Surplus (unsold)", fmt(r.surplus)]);
      rows.push(["Deadweight loss", fmt(r.DWL), "color:#C0392B;font-weight:800"]);
      rows.push(["Elasticity at equilibrium: demand / supply", fmt(r.elasD) + " / " + fmt(r.elasS)]);
      if (st.policy === "tax" || st.policy === "subsidy") rows.push(["Share borne by buyers", fmt(100 * r.buyerShare, 0) + "%"]);
      kv(out, rows);
      msg.textContent = !r.binding ? "This " + st.policy + " isn’t binding (a ceiling must be below " + fmt(r.Pe) + ", a floor above it), so the market clears as usual." :
        st.policy === "tax" ? "Buyers bear b/(b + d) of the tax: the steeper (less elastic) side bears more." :
        st.policy === "subsidy" ? "Dashed box = what the subsidy costs; part of it is the red DWL from over-production." :
        st.policy === "ceiling" ? "DWL assumes the scarce units go to the buyers who value them most. Random rationing loses more." :
        st.policy === "floor" ? "Assumes producers make only what sells. If the government buys the surplus, losses are larger." : "";
    }
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "panel card pad" }, pol.el, sl.amt.el, sl.a.el, sl.b.el, sl.c.el, sl.d.el),
      h("div", { class: "panel" }, plot, h("div", { class: "card pad stack" }, out, msg))));
    draw();
  }

  // 3. Monopoly vs competition
  function monopolyTool(el) {
    var st = S.load("monopoly", { a: 100, b: 2, c: 20, pd: false });
    var plot = h("div"), out = h("div", { class: "kv" });
    var sl = {
      a: S.slider("Demand intercept a", { min: 20, max: 200, value: st.a }, draw),
      b: S.slider("Demand slope b", { min: 0.2, max: 5, step: 0.1, value: st.b, fmt: function (v) { return v.toFixed(1); } }, draw),
      c: S.slider("Marginal cost (constant)", { min: 0, max: 150, value: st.c }, draw),
    };
    var pd = h("input", { type: "checkbox", checked: st.pd, onchange: draw });
    function draw() {
      for (var k in sl) st[k] = sl[k].value;
      st.pd = pd.checked; S.save("monopoly", st);
      var a = st.a, b = st.b, mc = st.c;
      if (mc >= a) { plot.innerHTML = ""; kv(out, [["MC is above the demand intercept, so nothing is worth producing.", ""]]); return; }
      var r = Micro.monopoly(a, b, mc);
      var c = S.chart({ h: 420, x: [0, a / b * 1.05], y: [0, a * 1.08] }).axes({ xlabel: "Q", ylabel: "P" });
      if (st.pd) {
        c.area([[0, a], [r.Qc, mc], [0, mc]], { fill: COL.gov });
      } else {
        c.area([[0, a], [0, r.Pm], [r.Qm, r.Pm]], { fill: COL.cs });
        c.rect(0, mc, r.Qm, r.Pm, { fill: COL.gov });
        c.area([[r.Qm, r.Pm], [r.Qm, mc], [r.Qc, mc]], { fill: COL.dwl });
      }
      c.line(0, a, a / b, 0, { stroke: COL.d, "stroke-width": 2.5 });
      c.line(0, a, a / (2 * b), 0, { stroke: COL.d, "stroke-width": 1.6, "stroke-dasharray": "6 4" });
      c.line(0, mc, a / b * 1.05, mc, { stroke: COL.mc, "stroke-width": 2.2 });
      lineAt(c, a / b * 0.85, a - b * a / b * 0.85, "D", { fill: COL.d, dy: -8 });
      lineAt(c, a / (2 * b) * 0.9, a - 2 * b * a / (2 * b) * 0.9, "MR", { fill: COL.d, dx: 6 });
      lineAt(c, a / b * 0.98, mc, "MC", { fill: COL.mc, dy: -6, "text-anchor": "end" });
      if (!st.pd) {
        c.dot(r.Qm, r.Pm, 5, { fill: COL.d }); c.line(r.Qm, 0, r.Qm, r.Pm, { stroke: COL.d, "stroke-dasharray": "2 3", "stroke-width": 1 });
        c.dot(r.Qm, mc, 4, { fill: COL.mc });
      }
      c.dot(r.Qc, mc, 5, { fill: "#85796E" });
      plot.innerHTML = c.svg();
      if (st.pd) kv(out, [
        ["Output (perfect price discrimination)", fmt(r.Qc)],
        ["Profit = all surplus", fmt(r.CSc), "color:#9A6A12;font-weight:800"],
        ["Consumer surplus", "0"], ["Deadweight loss", "0", "color:#C0392B"],
        ["Each buyer pays their own reservation price, so output is efficient but buyers keep nothing.", ""],
      ]);
      else kv(out, [
        ["Monopoly: Q, P", fmt(r.Qm) + ", " + fmt(r.Pm)],
        ["Competition: Q, P", fmt(r.Qc) + ", " + fmt(r.Pc)],
        ["Monopoly profit", fmt(r.profit), "color:#9A6A12"],
        ["Consumer surplus: monopoly / competition", fmt(r.CSm) + " / " + fmt(r.CSc), "color:" + COL.d],
        ["Deadweight loss", fmt(r.DWL), "color:#C0392B;font-weight:800"],
        ["Lerner index (P − MC)/P", fmt(r.lerner, 3)],
        ["1/|ε| at the monopoly point", fmt(1 / Math.abs(r.elas), 3)],
      ]);
    }
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "panel card pad" }, sl.a.el, sl.b.el, sl.c.el,
        h("label", { class: "check" }, pd, h("span", null, "Perfect (1st-degree) price discrimination")),
        h("p", { class: "dim small", style: "margin:0" }, "Blue: consumer surplus. Gold: profit. Red: deadweight loss. MR has twice the slope of linear demand.")),
      h("div", { class: "panel" }, plot, h("div", { class: "card pad" }, out))));
    draw();
  }

  // 4. Games: 2×2 Nash solver + Cournot
  var PRESETS = {
    pd: ["Prisoner’s dilemma", ["Cooperate", "Defect"], ["Cooperate", "Defect"], [[3, 0], [5, 1]], [[3, 5], [0, 1]]],
    bos: ["Battle of the sexes", ["Opera", "Football"], ["Opera", "Football"], [[2, 0], [0, 1]], [[1, 0], [0, 2]]],
    mp: ["Matching pennies", ["Heads", "Tails"], ["Heads", "Tails"], [[1, -1], [-1, 1]], [[-1, 1], [1, -1]]],
    chicken: ["Chicken", ["Swerve", "Straight"], ["Swerve", "Straight"], [[0, -1], [1, -10]], [[0, 1], [-1, -10]]],
    stag: ["Stag hunt", ["Stag", "Hare"], ["Stag", "Hare"], [[4, 0], [3, 3]], [[4, 3], [0, 3]]],
  };
  function gameTool(el) {
    var st = S.load("game", { preset: "pd", A: PRESETS.pd[3], B: PRESETS.pd[4], rows: PRESETS.pd[1], cols: PRESETS.pd[2] });
    var table = h("div"), out = h("div", { class: "stack", style: "gap:6px" });
    var presetSel = S.select("Preset", Object.keys(PRESETS).map(function (k) { return [k, PRESETS[k][0]]; }).concat([["custom", "Custom"]]), st.preset, function (v) {
      if (v === "custom") return;
      var p = PRESETS[v]; st = { preset: v, A: p[3].map(function (r) { return r.slice(); }), B: p[4].map(function (r) { return r.slice(); }), rows: p[1], cols: p[2] };
      build();
    });
    function build() {
      S.save("game", st);
      var r = Micro.nash(st.A, st.B);
      var isNE = function (i, j) { return r.pure.some(function (q) { return q[0] === i && q[1] === j; }); };
      var cell = function (i, j) {
        var inp = function (M, key) {
          return h("input", { type: "number", value: M[i][j], "aria-label": key + " payoff", onchange: function (e) {
            M[i][j] = +e.target.value; st.preset = "custom"; presetSel.input.value = "custom"; build();
          }, style: (key === "row" ? r.rowBR : r.colBR)[i][j] ? "font-weight:800;border-color:var(--c)" : "" });
        };
        return h("td", { class: isNE(i, j) ? "ne" : "" }, inp(st.A, "row"), " , ", inp(st.B, "col"));
      };
      table.innerHTML = "";
      table.appendChild(h("table", { class: "mat" },
        h("tr", null, h("th", null, "Row ↓ / Column →"), h("th", null, st.cols[0]), h("th", null, st.cols[1])),
        [0, 1].map(function (i) { return h("tr", null, h("th", null, st.rows[i]), cell(i, 0), cell(i, 1)); })));
      out.innerHTML = "";
      var name = function (i, j) { return "(" + st.rows[i] + ", " + st.cols[j] + ")"; };
      out.appendChild(h("div", null, h("b", null, "Pure-strategy Nash equilibria: "),
        r.pure.length ? r.pure.map(function (q) { return name(q[0], q[1]); }).join(", ") : "none"));
      out.appendChild(h("div", null, h("b", null, "Dominant strategies: "),
        "Row " + (r.rowDom == null ? "has none" : "→ " + st.rows[r.rowDom]) + "; Column " + (r.colDom == null ? "has none" : "→ " + st.cols[r.colDom])));
      out.appendChild(h("div", null, h("b", null, "Mixed-strategy equilibrium: "), r.mixed ?
        "Row plays " + st.rows[0] + " with p = " + fmt(r.mixed.p, 3) + "; Column plays " + st.cols[0] + " with q = " + fmt(r.mixed.q, 3) +
        " (each mix makes the other player indifferent)" : "none with both players strictly mixing"));
      out.appendChild(h("p", { class: "dim small", style: "margin:0" }, "Each cell: row player’s payoff, column player’s payoff. Bold = a best response. Green cell = Nash equilibrium."));
    }
    // Cournot
    var cst = S.load("cournot", { a: 120, b: 1, c1: 0, c2: 0 });
    var cplot = h("div"), cout = h("div", { class: "kv" });
    var csl = {
      a: S.slider("a in P = a − b(q₁ + q₂)", { min: 20, max: 200, value: cst.a }, cdraw),
      b: S.slider("b", { min: 0.2, max: 5, step: 0.1, value: cst.b, fmt: function (v) { return v.toFixed(1); } }, cdraw),
      c1: S.slider("MC of firm 1", { min: 0, max: 100, value: cst.c1 }, cdraw),
      c2: S.slider("MC of firm 2", { min: 0, max: 100, value: cst.c2 }, cdraw),
    };
    function cdraw() {
      for (var k in csl) cst[k] = csl[k].value;
      S.save("cournot", cst);
      var a = cst.a, b = cst.b, c1 = cst.c1, c2 = cst.c2;
      var r = Micro.cournot(a, b, c1, c2);
      var m = Math.max((a - c1) / b, (a - c2) / b, 1) * 0.75;
      var c = S.chart({ w: 520, h: 360, x: [0, m], y: [0, m] }).axes({ xlabel: "q₁", ylabel: "q₂" });
      c.line(0, (a - c1) / b, (a - c1) / (2 * b), 0, { stroke: COL.d, "stroke-width": 2.2 });   // firm 1 BR: q1 = (a − c1 − b q2)/(2b)
      c.line(0, (a - c2) / (2 * b), (a - c2) / b, 0, { stroke: COL.mc, "stroke-width": 2.2 });  // firm 2 BR: q2 = (a − c2 − b q1)/(2b)
      c.dot(r.q1, r.q2, 5, { fill: "#2B2118" });
      lineAt(c, r.q1, r.q2, " Nash", { dx: 6, dy: -6 });
      c.text(m * 0.02, m * 0.95, "Blue: firm 1’s best response. Orange: firm 2’s.", { "font-size": 11, fill: "#85796E" });
      cplot.innerHTML = c.svg();
      kv(cout, [["q₁ / q₂", fmt(r.q1) + " / " + fmt(r.q2)], ["Total Q, price P", fmt(r.Q) + ", " + fmt(r.P)],
        ["Profits π₁ / π₂", fmt(r.pi1) + " / " + fmt(r.pi2)],
        ["Monopoly Q (MC = firm 1’s) for comparison", fmt(Math.max(0, (a - c1) / (2 * b)))],
        ["Competitive Q (P = firm 1’s MC)", fmt(Math.max(0, (a - c1) / b))]]);
    }
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "panel card pad" }, presetSel.el, h("p", { class: "sec" }, "2×2 game"), table),
      h("div", { class: "card pad" }, out)));
    el.appendChild(h("p", { class: "sec", style: "margin-top:10px" }, "Cournot duopoly"));
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "panel card pad" }, csl.a.el, csl.b.el, csl.c1.el, csl.c2.el),
      h("div", { class: "panel" }, cplot, h("div", { class: "card pad" }, cout))));
    build(); cdraw();
  }

  S.course({
    id: "econ380", code: "ECON 380", title: "Intermediate Micro Theory", color: "#B4561B",
    blurb: "Consumer and producer theory, markets and welfare, monopoly, and basic games.",
    tools: [
      { id: "consumer", name: "Consumer optimizer & Slutsky", blurb: "Change a price and split the move into substitution and income effects.", mount: consumerTool },
      { id: "market", name: "Market: taxes, subsidies, controls", blurb: "Surplus areas, incidence and deadweight loss, live.", mount: marketTool },
      { id: "monopoly", name: "Monopoly vs competition", blurb: "MR = MC, profit, DWL, the Lerner rule, perfect price discrimination.", mount: monopolyTool },
      { id: "games", name: "Game solver & Cournot", blurb: "2×2 best responses, pure and mixed Nash equilibria, Cournot reaction functions.", mount: gameTool },
    ],
    math: { Micro: Micro },
  });
})();
