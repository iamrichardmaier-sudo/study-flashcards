// Model 2 · Loanable funds (Week 2)

(function () {
  var F = CH.fmt;
  var S = ENGINE.funds;

  function view(states) {
    var qmax = 0, qmin = 0, rmax = 0, rmin = 0;
    states.forEach(function (p) {
      if (!p) return;
      var o = S(p);
      qmax = Math.max(qmax, p.i0 * 1.08, o.S * 1.25);
      qmin = Math.min(qmin, o.S * 1.25);
      rmax = Math.max(rmax, p.i0 / p.b * 1.1, o.r * 1.25);
      rmin = Math.min(rmin, o.r * 1.3);
    });
    return { qmax: qmax, qmin: qmin, rmax: rmax, rmin: rmin };
  }

  function graph(p, ghost, target, hide) {
    var o = S(p), v = view([p, ghost, target]);
    var f = CH.frame({ w: 600, h: 320, x: [v.qmin, v.qmax], y: [v.rmin, v.rmax], xLabel: "loanable funds (S, I)", yLabel: "real interest rate r",
                       pad: { l: 52, r: 20, t: 18, b: 40 } });
    var inv = function (q) { return function (r) { return q.i0 - q.b * r; }; };
    var s = "";
    var invLine = function (q, cls) {
      var pts = [];
      for (var k = 0; k <= 40; k++) { var r = v.rmin + (v.rmax - v.rmin) * k / 40; pts.push([inv(q)(r), r]); }
      return CH.line(f, pts.filter(function (pt) { return pt[0] >= v.qmin && pt[0] <= v.qmax; }), cls);
    };
    if (ghost) {
      var g = S(ghost);
      if (ghost.i0 !== p.i0 || ghost.b !== p.b) s += invLine(ghost, "c1 faint dash");
      s += CH.vline(f, g.S, "c2 faint dash");
      s += CH.text(f, g.S, v.rmax, "S₁", "k2", "middle", 0, 12);
    }
    s += invLine(p, "c1");
    s += CH.text(f, Math.max(v.qmin, Math.min(v.qmax * 0.97, inv(p)(v.rmin + (v.rmax - v.rmin) * 0.12))), v.rmin + (v.rmax - v.rmin) * 0.12, "I(r)", "k1", "end", -4, -6);
    s += CH.vline(f, o.S, "c2");
    s += CH.text(f, o.S, v.rmax, (ghost ? "S₂" : "S") + " = " + F(o.S, 1), "k2", "start", 6, 12);
    if (ghost) {
      var g2 = S(ghost);
      if (Math.abs(g2.S - o.S) > 1e-9) s += CH.arrow(f.sx(g2.S), f.sy(v.rmax * 0.82), f.sx(o.S) + (o.S > g2.S ? -6 : 6), f.sy(v.rmax * 0.82));
    }
    if (hide.indexOf("r") === -1) {
      s += CH.hline(f, o.r, "c4 dash faint", o.I) + CH.dot(f, o.I, o.r);
      if (ghost) { var g3 = S(ghost); if (Math.abs(g3.r - o.r) > 1e-9) s += CH.dot(f, g3.I, g3.r, "solid4"); }
      s += CH.text(f, o.I, o.r, "r = " + F(o.r, 2) + "%, I = " + F(o.I, 1), "b", "start", 9, -10);
    } else {
      s += CH.text(f, v.qmax * 0.5, v.rmax * 0.55, "r = ?", "k1 big");
    }
    return { svg: CH.svg(f, s, "loanable funds"), cap: "Saving doesn't depend on r here, so supply is vertical. The real interest rate moves until investment demand equals national saving." };
  }

  function line(p, ghost, target, hide) {
    var Gmax = Math.max(p.G * 2, p.G + 1);
    var pts = [];
    for (var k = 0; k <= 40; k++) { var G = Gmax * k / 40; pts.push([G, S(Object.assign({}, p, { G: G })).r]); }
    var o = S(p);
    var marks = hide.indexOf("r") === -1 ? [{ x: p.G, y: o.r, label: "now: G = " + F(p.G, 0) + ", r = " + F(o.r, 2) + "%", lcls: "b" }] : [];
    if (ghost && ghost.G !== p.G) marks.push({ x: ghost.G, y: S(ghost).r, cls: "solid4" });
    return CH.lineChart({ title: "r as G changes", series: [{ name: "r for each level of G", pts: pts, cls: "c2" }],
      xLabel: "government purchases G", yLabel: "r (%)", marks: marks });
  }

  function bars(p, ghost, target, hide) {
    var o = S(p);
    var rows = [{ label: "Output Y", sub: F(o.Y, 1), parts: [
      { name: "C", value: o.C, cls: "solid1" }, { name: "I", value: o.I, cls: "solid3" }, { name: "G", value: o.G, cls: "solid2" }] }];
    var sp = [{ name: "Private", value: o.Spriv, cls: "solid1" }];
    var neg = [];
    if (o.Spub >= 0) sp.push({ name: "Public", value: o.Spub, cls: "solid2" });
    else neg.push({ name: "Public (deficit)", value: o.Spub, lcls: "k2" });
    rows.push({ label: "Saving S", sub: F(o.S, 1), parts: sp, neg: neg });
    if (hide.indexOf("r") !== -1) rows = rows.slice(1);
    return CH.barChart({ title: "Where output and saving go", share: false, rows: rows, fmt: function (v) { return F(v, 1); }, pct: false });
  }

  MODELS.push({
    id: "funds", week: 2, title: "Loanable funds",
    short: "Saving meets investment; the real interest rate clears the market",
    base: { Y: 8000, c0: 1000, mpc: 2 / 3, T: 2000, G: 2500, i0: 1200, b: 100 },
    inputs: [
      { key: "G", label: "Government purchases G", min: 0, max: 4000, step: 10 },
      { key: "T", label: "Taxes T", min: 0, max: 4000, step: 10 },
      { key: "mpc", label: "MPC", min: 0.05, max: 0.95, step: 0.01 },
      { key: "c0", label: "Autonomous consumption", min: 0, max: 2500, step: 10 },
      { key: "i0", label: "Investment demand (intercept)", min: 600, max: 2400, step: 10 },
      { key: "Y", label: "Output Y̅", min: 6000, max: 10000, step: 10 },
    ],
    solve: S,
    kpis: [
      { key: "Y", label: "Output Y", d: 1 },
      { key: "r", label: "Real rate r", d: 2, unit: "%" },
      { key: "I", label: "Investment I", d: 1 },
      { key: "S", label: "National saving S", d: 1 },
      { key: "Spriv", label: "Private Y − T − C", d: 1 },
      { key: "Spub", label: "Public T − G", d: 1 },
      { key: "C", label: "Consumption C", d: 1 },
    ],
    graph: graph, line: line, bars: bars,
    lineTitle: "Crowding out, traced", barsTitle: "Output and saving",
    forms: [
      { name: "Goods market", html: "<i>Y̅</i> = <i>C</i>(<i>Y̅</i> − <i>T</i>) + <i>I</i>(<i>r</i>) + <i>G</i>",
        note: "Y is fixed by factors (Model 1), so r is the only thing that can adjust." },
      { name: "Linear version used in problems", html: "<i>C</i> = <i>c</i><sub>0</sub> + MPC(<i>Y</i> − <i>T</i>),  <i>I</i> = <i>i</i><sub>0</sub> − <i>b r</i>",
        note: "MPC = ∂C/∂(Y − T), between 0 and 1 (Practice Q18: give the sentence and the derivative)." },
      { name: "National saving", html: "<i>S</i> = <i>Y</i> − <i>C</i> − <i>G</i> = (<i>Y</i> − <i>T</i> − <i>C</i>) + (<i>T</i> − <i>G</i>)",
        note: "Private saving plus public saving. Add and subtract T to split it." },
      { name: "Equilibrium", html: "<i>S</i> = <i>I</i>(<i>r</i>)  ⇒  <i>r</i> = (<i>i</i><sub>0</sub> − <i>S</i>) / <i>b</i>",
        note: "The same answer as solving the goods-market equation for r." },
      { name: "Fiscal changes", html: "Δ<i>G</i> = <i>x</i>: Δ<i>S</i> = −<i>x</i>  Δ<i>T</i> = <i>x</i>: Δ<i>S</i> = (1 − MPC)<i>x</i>  both: Δ<i>S</i> = −(1 − MPC)<i>x</i>",
        note: "A tax rise cuts consumption by MPC·x, so private saving falls by only (1 − MPC)x." },
    ],
    statics: {
      inputs: [{ key: "G", label: "G up" }, { key: "T", label: "T up" }, { key: "c0", label: "Consumer confidence up" },
               { key: "i0", label: "Investment demand up" }, { key: "Y", label: "Output Y̅ up" }],
      outputs: [{ key: "r", label: "r" }, { key: "I", label: "I" }, { key: "S", label: "S" }, { key: "C", label: "C" }],
    },
    facts: {
      cold: [
        "National saving S = Y − C − G = private + public saving. Equilibrium: S = I(r).",
        "Graph: r on the vertical axis, saving a vertical line, investment demand sloping down.",
        "Higher G lowers saving, raises r and cuts investment one-for-one: crowding out (Textbook Figure 3-9).",
        "Higher consumer confidence (C up at every income) also lowers saving: r up, I down.",
      ],
      traps: [
        "Shifting the wrong curve: G moves saving, not investment demand.",
        "Using Y instead of Y − T inside the consumption function.",
        "Forgetting that a tax rise lowers private saving by MPC·ΔT.",
      ],
    },
    scenarios: [
      {
        id: "beta-xi", title: "Beta Xi VII: the equilibrium rate", source: "Practice exam Part 2 Q3(c) · 7 pts",
        blurb: "Y = K<sup>0.5</sup>L<sup>0.5</sup> with K = 169, L = 225; C = 10 + 0.5(Y − T); I = 100 − 2r; G = T = 10.",
        base: { A: 1, alpha: 0.5, K: 169, L: 225, c0: 10, mpc: 0.5, T: 10, G: 10, i0: 100, b: 2 },
        steps: [
          { say: "Beta Xi VII: <b>Y = K<sup>0.5</sup>L<sup>0.5</sup></b>, K = 169, L = 225, <b>C = 10 + 0.5(Y − T)</b>, <b>I = 100 − 2r</b>, G = T = 10.", hide: ["r", "I", "Y"] },
          { say: "Output comes from the factors first.",
            predict: { kind: "num", q: "What is Y?", key: "Y", tol: 0.001 }, hide: ["r", "I"],
            math: ["Y = 169<sup>0.5</sup> × 225<sup>0.5</sup> = 13 × 15 = <b>195</b>"] },
          { say: "Write the goods-market equation, then solve for r.",
            predict: { kind: "num", q: "What is the real interest rate r?", key: "r", tol: 0.002 }, hide: ["I"],
            math: ["Y = C + I + G", "195 = 10 + 0.5(195 − 10) + 100 − 2r + 10 = 212.5 − 2r", "2r = 17.5 ⇒ <b>r = 8.75</b>"] },
          { say: "Investment at that rate.",
            predict: { kind: "num", q: "What is investment I?", key: "I", tol: 0.002 }, hide: [],
            math: ["I = 100 − 2(8.75) = <b>82.5</b>", "Check: S = 195 − 102.5 − 10 = 82.5 = I ✓"] },
          { say: "Suppose the government raises G to 20 with taxes unchanged.",
            predict: { kind: "dir", key: "r", q: "The real interest rate…" }, set: { G: 20 },
            math: [function (o) { return "S = 195 − 102.5 − 20 = " + F(o.S, 1) + "; r = (100 − " + F(o.S, 1) + ")/2 = <b>" + F(o.r, 2) + "</b>"; }],
            why: "Saving shifts left by 10; investment falls by the same 10. Crowding out." },
        ],
        exam: { pts: "7 points", lines: [
          "Y = 169<sup>0.5</sup>225<sup>0.5</sup> = 195.",
          "195 = 10 + 0.5(185) + 100 − 2r + 10 ⇒ r = 8.75.",
          "I = 100 − 2(8.75) = 82.5." ] },
      },
      {
        id: "ch4-3", title: "Cutting G from 2,500 to 2,000", source: "Chapter 4 #3 (assigned)",
        blurb: "Y = 8,000, G = 2,500, T = 2,000, C = 1,000 + (2/3)(Y − T), I = 1,200 − 100r.",
        base: { Y: 8000, c0: 1000, mpc: 2 / 3, T: 2000, G: 2500, i0: 1200, b: 100 },
        steps: [
          { say: "Y = 8,000, G = 2,500, T = 2,000, <b>C = 1,000 + (2/3)(Y − T)</b>, <b>I = 1,200 − 100r</b>.", hide: ["r", "I", "S", "Spriv", "Spub"] },
          { say: "Saving, piece by piece.",
            predict: { kind: "num", q: "National saving S?", key: "S", tol: 0.001 }, hide: ["r", "I"],
            math: ["C = 1,000 + (2/3)(6,000) = 5,000", "Private = 8,000 − 2,000 − 5,000 = 1,000", "Public = 2,000 − 2,500 = −500", "<b>S = 500</b>"] },
          { say: "Set S = I(r).",
            predict: { kind: "num", q: "Equilibrium r (percent)?", key: "r", tol: 0.001 }, hide: [],
            math: ["1,200 − 100r = 500 ⇒ <b>r = 7%</b>, I = 500"] },
          { say: "The government cuts G by 500 to 2,000.",
            predict: { kind: "dir", key: "r", q: "The real interest rate…" }, set: { G: 2000 },
            math: ["Public saving = 2,000 − 2,000 = 0; S = 1,000", "1,200 − 100r = 1,000 ⇒ <b>r = 2%</b>, I = 1,000"],
            why: "Less government borrowing frees saving for private investment: crowding out in reverse." },
        ],
        exam: { pts: "Problem set", lines: [
          "(a) Private 1,000, public −500, national 500.  (b) r = 7%, I = 500.",
          "(c) G = 2,000: national saving 1,000.  (d) r = 2%, I = 1,000.",
          "Graph: label r on the vertical axis, both saving lines, both equilibria and the direction of the shift." ] },
      },
      {
        id: "balanced-budget", title: "A balanced-budget increase", source: "Chapter 4 #4 (assigned)",
        blurb: "Raise G and T by the same 100. Does a balanced budget leave the interest rate alone?",
        base: { Y: 8000, c0: 1000, mpc: 2 / 3, T: 2000, G: 2500, i0: 1200, b: 100 },
        steps: [
          { say: "The Chapter 4 #3 economy at r = 7%. Now raise <b>G and T both by 100</b>." },
          { say: "Start with the government's own saving.",
            predict: { kind: "dir", key: "Spub", q: "Public saving T − G…" }, set: { G: 2600, T: 2100 },
            math: ["T − G = 2,100 − 2,600 = −500, unchanged"] },
          { say: "Households pay 100 more in tax.",
            predict: { kind: "num", q: "By how much does private saving fall? (positive number)", value: function (o) { return 1000 - o.Spriv; }, tol: 0.002 },
            math: ["C falls by MPC × 100 = 66.7", "Private saving falls by (1 − MPC) × 100 = <b>33.3</b>"] },
          { say: "So national saving fell.",
            predict: { kind: "dir", key: "r", q: "The real interest rate…", from: "base" },
            math: [function (o) { return "S = " + F(o.S, 1) + "; r = (1,200 − " + F(o.S, 1) + ")/100 = <b>" + F(o.r, 2) + "%</b>"; }],
            why: "The government spends all 100; households only cut spending by 66.7. The other 33.3 comes out of investment. If MPC = 1 nothing changes; if MPC = 0, investment falls by the full 100." },
        ],
        exam: { pts: "Problem set", lines: [
          "Public saving unchanged. Private saving falls (1 − MPC)x.",
          "National saving and investment fall by (1 − MPC)x; r rises." ] },
      },
      {
        id: "tax-hike", title: "A $100 billion tax increase", source: "Chapter 4 · real-world",
        blurb: "Congress raises taxes $100B to cut the deficit. MPC = 0.6. What happens to saving, r and investment?",
        base: { Y: 5000, c0: 200, mpc: 0.6, T: 1000, G: 1000, i0: 1800, b: 100 },
        steps: [
          { say: "An economy in $ billions: Y = 5,000, G = T = 1,000, MPC = 0.6, I = 1,800 − 100r. Right now r = 4%." },
          { say: "Taxes rise by <b>$100B</b>.", set: { T: 1100 },
            predict: { kind: "num", q: "Change in public saving ($B)?", value: function (o) { return o.Spub - 0; }, tol: 0.002 },
            math: ["T − G rises from 0 to <b>+100</b>"] },
          { say: "Households pay that 100 out of disposable income.",
            predict: { kind: "num", q: "Change in national saving ($B)?", value: function (o) { return o.S - 1400; }, tol: 0.002 },
            math: ["Consumption falls 0.6 × 100 = 60, so private saving falls 40", "ΔS = +100 − 40 = <b>+60</b> = (1 − MPC)ΔT"] },
          { say: "More saving in the loanable funds market.",
            predict: { kind: "dir", key: "I", q: "Investment…", from: "base" },
            math: [function (o) { return "r = " + F(o.r, 2) + "% (from 4%), I = " + F(o.I, 0) + " (+60)"; }],
            why: "Deficit reduction crowds investment back in. The size depends on how much of the tax comes out of consumption." },
        ],
        exam: { pts: "Short answer", lines: [
          "Public saving +100, private saving −40, national saving +60.",
          "r falls; investment rises by 60." ] },
      },
    ],
  });
})();
