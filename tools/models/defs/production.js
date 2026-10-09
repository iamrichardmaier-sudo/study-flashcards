// Model 1 · Production & factor markets (Week 2)

(function () {
  var F = CH.fmt;
  var P = ENGINE.production;

  function view(states) {
    var Lmax = 0, wmax = 0;
    states.forEach(function (s) {
      if (!s) return;
      var o = P(s);
      Lmax = Math.max(Lmax, o.L * 1.9);
      wmax = Math.max(wmax, o.MPL * 2.2);
    });
    return { Lmax: Lmax, wmax: wmax };
  }

  function graph(p, ghost, target, hide) {
    var o = P(p), v = view([p, ghost, target]);
    var f = CH.frame({ w: 600, h: 320, x: [0, v.Lmax], y: [0, v.wmax], xLabel: "labor L", yLabel: "real wage W/P",
                       pad: { l: 58, r: 20, t: 18, b: 40 } });
    var curve = function (q) {
      return function (L) { return (1 - q.alpha) * q.A * Math.pow(q.K, q.alpha) * Math.pow(L, -q.alpha); };
    };
    var s = "";
    if (ghost) {
      var go = P(ghost);
      s += CH.fn(f, curve(ghost), v.Lmax * 0.03, v.Lmax, "c1 faint dash");
      if (ghost.wReal == null) s += CH.vline(f, go.L, "c2 faint dash");
      else s += CH.hline(f, ghost.wReal, "c2 faint dash");
    }
    s += CH.fn(f, curve(p), v.Lmax * 0.03, v.Lmax, "c1");
    s += CH.text(f, v.Lmax, curve(p)(v.Lmax), "MPL = labor demand", "k1", "end", -4, -9);
    if (p.wReal != null) {
      s += CH.hline(f, p.wReal, "c2 dash");
      s += CH.text(f, v.Lmax, p.wReal, "W/P = " + F(p.wReal, 2), "k2", "end", -4, -7);
    } else {
      s += CH.vline(f, o.L, "c2");
      s += CH.text(f, o.L, v.wmax, "L̅ supply = " + F(o.L, 0), "k2", "start", 6, 14);
    }
    if (hide.indexOf("L") === -1 && hide.indexOf("wReal") === -1) {
      s += CH.vline(f, o.L, "c4 dash faint", o.MPL) + CH.hline(f, o.MPL, "c4 dash faint", o.L);
      if (ghost) {
        var g = P(ghost);
        if (Math.abs(g.L - o.L) / o.L > 0.01 || Math.abs(g.MPL - o.MPL) / o.MPL > 0.01) {
          s += CH.dot(f, g.L, g.MPL, "solid4");
          s += CH.arrow(f.sx(g.L), f.sy(g.MPL), f.sx(o.L), f.sy(o.MPL), "c4");
        }
      }
      s += CH.dot(f, o.L, o.MPL);
      s += CH.text(f, o.L, o.MPL, "L = " + F(o.L, 1) + ", W/P = " + F(o.MPL, 3), "b", "start", 9, -10);
    } else {
      s += CH.text(f, v.Lmax * 0.55, v.wmax * 0.55, "L = ?", "k1 big");
    }
    return { svg: CH.svg(f, s, "labor market"), cap: p.wReal != null
      ? "Firms hire until the marginal product of labor falls to the real wage. The crossing is labor demand at that wage."
      : "With labor supply fixed at L̅, the MPL at L̅ sets the real wage." };
  }

  function line(p, ghost, target, hide) {
    var v = view([p, ghost, target]);
    var o = P(p);
    var Y = function (q) { return function (L) { return q.A * Math.pow(q.K, q.alpha) * Math.pow(L, 1 - q.alpha); }; };
    var pts = [], gpts = [];
    for (var k = 1; k <= 60; k++) {
      var L = v.Lmax * k / 60;
      pts.push([L, Y(p)(L)]);
      if (ghost) gpts.push([L, Y(ghost)(L)]);
    }
    var series = [];
    if (ghost) series.push({ name: "before", pts: gpts, cls: "c4 dash faint" });
    series.push({ name: "Y = A K^α L^(1−α)", pts: pts, cls: "c1" });
    return CH.lineChart({ title: "Output as labor rises", series: series, x: [0, v.Lmax], zero: true,
      xLabel: "labor L", yLabel: "output Y",
      marks: hide.indexOf("L") === -1 ? [{ x: o.L, y: o.Y, label: "Y = " + F(o.Y, 1), lcls: "b" }] : [] });
  }

  function bars(p, ghost, target, hide) {
    var o = P(p);
    var rows = [{ label: "Income now", sub: "Y = " + F(o.Y, 1), parts: [
      { name: "Labor", value: o.laborIncome, cls: "solid1" },
      { name: "Capital", value: o.capIncome, cls: "solid2" }] }];
    if (ghost) {
      var g = P(ghost);
      rows.push({ label: "Before", sub: "Y = " + F(g.Y, 1), parts: [
        { name: "Labor", value: g.laborIncome, cls: "solid4" },
        { name: "Capital", value: g.capIncome, cls: "solid4" }] });
    }
    if (hide.indexOf("laborShare") !== -1) rows = rows.slice(0, 0);
    return rows.length ? CH.barChart({ title: "Who gets the output", share: true, rows: rows, fmt: function (v) { return F(v, 1); } }) : "";
  }

  MODELS.push({
    id: "production", week: 2, title: "Production & factor markets",
    short: "Cobb-Douglas output, labor demand, and the split of income",
    base: { A: 1, alpha: 1 / 3, K: 8000, L: 1000, P: 1 },
    inputs: [
      { key: "A", label: "Productivity A", min: 0.3, max: 6, step: 0.01, log: true },
      { key: "K", label: "Capital K", min: 50, max: 20000, step: 1, log: true },
      { key: "L", label: "Labor supply L", min: 20, max: 8000, step: 1, log: true },
      { key: "alpha", label: "Capital share α", min: 0.1, max: 0.9, step: 0.01 },
      { key: "P", label: "Price level P", min: 0.5, max: 4, step: 0.01 },
    ],
    solve: P,
    kpis: [
      { key: "Y", label: "Output Y", d: 1 },
      { key: "L", label: "Labor L", d: 1 },
      { key: "wReal", label: "Real wage W/P = MPL", d: 3 },
      { key: "rReal", label: "Rental R/P = MPK", d: 4 },
      { key: "laborShare", label: "Labor share", pct: true },
      { key: "W", label: "Nominal wage W", d: 3 },
    ],
    graph: graph, line: line, bars: bars,
    lineTitle: "Production function", barsTitle: "Income shares",
    forms: [
      { name: "General", html: "<i>Y</i> = <i>F</i>(<i>K</i>, <i>L</i>), with constant returns: <i>F</i>(<i>zK</i>, <i>zL</i>) = <i>z</i>·<i>F</i>(<i>K</i>, <i>L</i>)",
        note: "In the long-run model K and L are fixed, so output is fixed by the supply side." },
      { name: "Cobb-Douglas", html: "<i>Y</i> = <i>A K</i><sup>α</sup><i>L</i><sup>1−α</sup>",
        note: "Exponents add to 1, so it has constant returns. α is capital's share of income; A is total factor productivity." },
      { name: "Profit and the hiring rules", html: "Profit = <i>PY</i> − <i>WL</i> − <i>RK</i>  ⇒  MPL = <i>W</i>/<i>P</i>,  MPK = <i>R</i>/<i>P</i>",
        note: "Differentiate profit by L and by K and set each to zero. Use the real wage W/P, not W." },
      { name: "Marginal products", html: "MPL = (1 − α)<i>A K</i><sup>α</sup><i>L</i><sup>−α</sup> = (1 − α)<i>Y</i>/<i>L</i>,  MPK = α<i>Y</i>/<i>K</i>",
        note: "Each marginal product is its exponent times the average product. Keep the exponent: 5 × 0.7 = 3.5." },
      { name: "Labor demand, solved", html: "<i>L</i> = [ (1 − α)<i>A K</i><sup>α</sup> / (<i>W</i>/<i>P</i>) ]<sup>1/α</sup>",
        note: "From MPL = W/P. A higher real wage means fewer workers." },
      { name: "Shares", html: "<i>WL</i>/<i>PY</i> = MPL·<i>L</i>/<i>Y</i> = 1 − α,  <i>RK</i>/<i>PY</i> = α,  <i>Y</i> = MPL·<i>L</i> + MPK·<i>K</i>",
        note: "Constant whatever happens to K or L. Factor payments use up all of output: zero economic profit." },
      { name: "Backing out α and A", html: "1 − α = MPL·<i>L</i>/<i>Y</i>  →  <i>K</i> = α<i>Y</i>/MPK  →  <i>A</i> = <i>Y</i> / (<i>K</i><sup>α</sup><i>L</i><sup>1−α</sup>)",
        note: "Start with the labor share (the exam's hint), then the production function." },
    ],
    statics: {
      inputs: [{ key: "L", label: "More labor (immigration)" }, { key: "K", label: "More capital" },
               { key: "A", label: "Better technology A" }, { key: "P", label: "Higher price level P" }],
      outputs: [{ key: "Y", label: "Y" }, { key: "wReal", label: "W/P" }, { key: "rReal", label: "R/P" },
                { key: "laborShare", label: "Labor share" }, { key: "W", label: "W" }],
    },
    facts: {
      cold: [
        "Firms hire labor until MPL = W/P and rent capital until MPK = R/P.",
        "With Y = A K<sup>α</sup>L<sup>1−α</sup>: labor share = 1 − α, capital share = α, real wage = (1 − α)Y/L.",
        "Whatever is scarcer earns more: more workers lower W/P and raise R/P; less capital does the same; better technology raises both.",
        "Inflation that doubles all prices and wages changes nothing real.",
      ],
      traps: [
        "Using the nominal wage W instead of W/P in the labor demand condition.",
        "Dropping the exponent in MPL (the 0.7 in 3.5 = 5 × 0.7).",
        "Saying the labor share changes when capital rises. Under Cobb-Douglas with competition it doesn't.",
      ],
    },
    scenarios: [
      {
        id: "gamma-epsilon", title: "Gamma Epsilon IV hires workers", source: "Practice exam Part 2 Q3(a) · 6 pts",
        blurb: "Y = 5K<sup>0.3</sup>L<sup>0.7</sup>, K = 1,000, W = 5, P = 2. How many workers do firms hire?",
        base: { A: 5, alpha: 0.3, K: 1000, wReal: 2.5, P: 2 },
        steps: [
          { say: "An uncharted galaxy produces with <b>Y = 5K<sup>0.3</sup>L<sup>0.7</sup></b> and <b>K = 1,000</b>. The nominal wage is <b>W = 5</b> and the price level <b>P = 2</b>. Firms choose L.", hide: ["L", "Y"] },
          { say: "Write the condition before any numbers. That line is where partial credit starts.",
            math: ["Profit = PY − WL − RK", "∂Profit/∂L = 0 ⇒ <b>MPL = W/P</b> = 5 / 2 = <b>2.5</b>"] },
          { say: "Now the marginal product. Bring the exponent down and keep it.",
            math: ["MPL = 0.7 · 5 · K<sup>0.3</sup>L<sup>−0.3</sup> = <b>3.5(1,000)<sup>0.3</sup>L<sup>−0.3</sup></b>",
                   "(1,000)<sup>0.3</sup> = 7.943"] },
          { say: "Set them equal and solve for L.",
            predict: { kind: "num", q: "How many workers do firms hire? (one decimal)", key: "L", tol: 0.003 }, hide: [],
            math: ["3.5(7.943)L<sup>−0.3</sup> = 2.5", "L<sup>0.3</sup> = 3.5 × 7.943 / 2.5 = 11.121",
                   function (o) { return "L = 11.121<sup>1/0.3</sup> = <b>" + F(o.L, 1) + " workers</b>"; }] },
          { say: "The nominal wage rises to <b>W = 6</b>, prices unchanged, so the real wage is 3.",
            predict: { kind: "dir", key: "L", q: "What happens to employment?" }, set: { wReal: 3 },
            math: [function (o) { return "L = (3.5 × 7.943 / 3)<sup>1/0.3</sup> = <b>" + F(o.L, 1) + "</b>"; }],
            why: "Down the labor demand curve: a higher real wage means MPL must be higher, which takes fewer workers." },
          { say: "Back to the original, then <b>double both</b> W and P (W = 10, P = 4).",
            predict: { kind: "dir", key: "L", q: "Compared with the original 3,069.7, employment is…", from: "base" }, set: { wReal: 2.5, P: 4 },
            math: ["W/P = 10/4 = 2.5, the same real wage", function (o) { return "L = <b>" + F(o.L, 1) + "</b>, unchanged"; }],
            why: "Only the real wage matters. Doubling every nominal price is a nominal change." },
        ],
        exam: { pts: "6 points", lines: [
          "Condition first: MPL = W/P = 5/2 = 2.5.",
          "MPL = 5(0.7)K<sup>0.3</sup>L<sup>−0.3</sup> = 3.5(1,000)<sup>0.3</sup>L<sup>−0.3</sup>.",
          "Solve: L<sup>0.3</sup> = 11.121, so L = 11.121<sup>1/0.3</sup> ≈ 3,069.7 workers.",
          "Keep exact values through the steps; round only the answer." ] },
      },
      {
        id: "theta-alpha", title: "Theta Alpha III: back out α and A", source: "Practice exam Part 2 Q3(b) · 7 pts",
        blurb: "Observed Y = 150, L = 200, MPL = MPK = 0.5. Find α, K and A.",
        base: (function () { var b = ENGINE.backOut({ Y: 150, L: 200, MPL: 0.5, MPK: 0.5 }); return { A: b.A, alpha: b.alpha, K: b.K, L: 200, P: 1 }; })(),
        steps: [
          { say: "Theta Alpha III produces with Y = A K<sup>α</sup>L<sup>1−α</sup>. You observe <b>Y = 150</b>, <b>L = 200</b>, <b>MPL = 0.5</b> and <b>MPK = 0.5</b>. The hint: start with the labor share.",
            hide: ["laborShare"] },
          { say: "Labor share = MPL × L / Y, and under Cobb-Douglas that's 1 − α.",
            predict: { kind: "num", q: "What is the labor share? (decimal)", key: "laborShare", tol: 0.004 }, hide: [],
            math: ["1 − α = MPL·L / Y = 0.5(200) / 150 = <b>2/3</b>", "so <b>α = 1/3</b>"] },
          { say: "Capital share = MPK × K / Y = α. Solve for K.",
            predict: { kind: "num", q: "How much capital is there?", value: function (o, p) { return p.K; }, tol: 0.002 },
            math: ["1/3 = 0.5 K / 150", "<b>K = 100</b>"] },
          { say: "Now the production function gives A.",
            predict: { kind: "num", q: "What is A? (three decimals)", value: function (o, p) { return p.A; }, tol: 0.002 },
            math: ["150 = A(100)<sup>1/3</sup>(200)<sup>2/3</sup> = A(4.6416)(34.20)", "<b>A = 150 / 158.74 = 0.945</b>"] },
          { say: "Suppose capital doubles to 200.",
            predict: { kind: "dir", key: "laborShare", q: "What happens to the labor share?" }, set: { K: 200 },
            math: [function (o) { return "Labor share = " + F(o.laborShare, 3) + ", still 1 − α"; },
                   function (o) { return "but the real wage rises to " + F(o.wReal, 3); }],
            why: "More capital raises MPL and the real wage, but the share stays 1 − α. That's Practice Q13(a)." },
        ],
        exam: { pts: "7 points", lines: [
          "Labor share first: 1 − α = MPL·L/Y = 0.5(200)/150 = 2/3, so α = 1/3.",
          "Capital share: α = MPK·K/Y ⇒ K = (1/3)(150)/0.5 = 100.",
          "Production function: A = 150 / (100<sup>1/3</sup>·200<sup>2/3</sup>) = 0.945." ] },
      },
      {
        id: "plague", title: "A plague halves the workforce", source: "Chapter 3 #2 (assigned)",
        blurb: "Y = K<sup>0.5</sup>L<sup>0.5</sup> with 100 units of land and 100 workers. Half the workers die.",
        base: { A: 1, alpha: 0.5, K: 100, L: 100, P: 1 },
        steps: [
          { say: "A medieval economy: <b>Y = K<sup>0.5</sup>L<sup>0.5</sup></b> with K = 100 land and L = 100 labor.",
            math: [function (o) { return "Y = 10 × 10 = <b>" + F(o.Y, 0) + "</b>; MPL = 0.5(K/L)<sup>0.5</sup> = <b>" + F(o.wReal, 2) + "</b>; MPK = <b>" + F(o.rReal, 2) + "</b>"; }] },
          { say: "A plague kills half the workers. Land is untouched.",
            predict: { kind: "num", q: "What is output now? (one decimal)", key: "Y", tol: 0.003 }, set: { L: 50 },
            math: [function (o) { return "Y = 10 × 50<sup>0.5</sup> = 10 × 7.07 = <b>" + F(o.Y, 1) + "</b>"; }] },
          { say: "Each surviving worker now has twice as much land.",
            predict: { kind: "dir", key: "wReal", q: "The real wage…" },
            math: [function (o) { return "MPL = 0.5(100/50)<sup>0.5</sup> = <b>" + F(o.wReal, 3) + "</b>"; }] },
          { say: "And the landowners?",
            predict: { kind: "dir", key: "rReal", q: "The real rental price of land…", from: "base" },
            math: [function (o) { return "MPK = 0.5(50/100)<sup>0.5</sup> = <b>" + F(o.rReal, 3) + "</b>"; }],
            why: "Workers became scarce and land plentiful, so wages rose and rents fell: what happened in Europe after the Black Death." },
          { say: "Last: the labor share.",
            predict: { kind: "dir", key: "laborShare", q: "Compared with before the plague, labor's share of income is…", from: "base" },
            math: ["Labor share = 1 − α = <b>0.5</b> before and after"] },
        ],
        exam: { pts: "Problem set", lines: [
          "Output: 100 → 70.7. Real wage: 0.5 → 0.707. Real rent: 0.5 → 0.354.",
          "Labor share stays 0.5 = 1 − α: the wage rises but total output falls by just enough." ] },
      },
      {
        id: "four-shocks", title: "Immigration, earthquake, technology, inflation", source: "Chapter 3 #1 · Practice Q13",
        blurb: "Four shocks to one economy. Predict the real wage and rental rate each time.",
        base: { A: 1, alpha: 1 / 3, K: 8000, L: 1000, P: 1 },
        steps: [
          { say: "Start at Y = K<sup>1/3</sup>L<sup>2/3</sup> with K = 8,000 and L = 1,000: Y = 2,000, W/P = 1.333, R/P = 0.083." },
          { say: "<b>Immigration</b> raises the labor force 25%.", set: { L: 1250 },
            predict: { kind: "dir", key: "wReal", q: "The real wage…" },
            math: [function (o) { return "W/P = " + F(o.wReal, 3) + ", R/P = " + F(o.rReal, 4); }],
            why: "More workers per machine: MPL falls, MPK rises." },
          { say: "Back to 1,000 workers. An <b>earthquake</b> destroys a third of the capital.", set: { L: 1000, K: 5333 },
            predict: { kind: "dir", key: "rReal", q: "Compared with the start, the real rental rate…", from: "base" },
            math: [function (o) { return "W/P = " + F(o.wReal, 3) + ", R/P = " + F(o.rReal, 4); }],
            why: "Capital became scarce, so it earns more; workers have less to work with, so they earn less." },
          { say: "Capital restored. A <b>technology</b> improvement raises A by 20%.", set: { K: 8000, A: 1.2 },
            predict: { kind: "dir", key: "rReal", q: "Compared with the start, the real rental rate…", from: "base" },
            math: [function (o) { return "W/P = " + F(o.wReal, 3) + " and R/P = " + F(o.rReal, 4) + ": both up 20%"; }] },
          { say: "Technology back to normal. <b>Inflation doubles</b> every price and every nominal income.", set: { A: 1, P: 2 },
            predict: { kind: "dir", key: "wReal", q: "Compared with the start, the real wage…", from: "base" },
            math: [function (o) { return "W = " + F(o.W, 3) + " doubled, but W/P = " + F(o.wReal, 3) + " is unchanged"; }],
            why: "A nominal change. The classical dichotomy: nominal variables don't move real ones." },
        ],
        exam: { pts: "Short answer", lines: [
          "Immigration: W/P falls, R/P rises.  Earthquake: W/P falls, R/P rises.",
          "Technology: both rise.  Inflation: neither changes.",
          "Labor share is 1 − α throughout." ] },
      },
    ],
  });
})();
