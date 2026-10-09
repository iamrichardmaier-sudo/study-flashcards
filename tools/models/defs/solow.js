// Model 5 · Solow growth (Week 5)

(function () {
  var F = CH.fmt;
  var So = ENGINE.solow;

  function solve(p) {
    var o = So(p);
    var A = p.A || 1, k = p.k0;
    o.k0 = k; o.y0 = A * Math.pow(k, p.alpha); o.i0 = p.s * o.y0; o.c0 = (1 - p.s) * o.y0;
    o.dep0 = (p.delta + (p.n || 0)) * k; o.dk0 = o.i0 - o.dep0;
    if (p.s2 != null) {
      var q = Object.assign({}, p, { s: p.s2 }), o2 = So(q);
      o.kStar2 = o2.kStar; o.cStar2 = o2.cStar;
      var A2 = ENGINE.solowPath(p, 60), B2 = ENGINE.solowPath(q, 60);
      o.overtake = B2.findIndex(function (x, t) { return x.c > A2[t].c; });
      o.cA0 = A2[0].c; o.cB0 = B2[0].c;
    }
    return o;
  }

  function view(states) {
    var kmax = 0;
    states.forEach(function (p) { if (!p) return; var o = So(p); kmax = Math.max(kmax, o.kStar * 1.9, p.k0 * 1.3); if (p.s2 != null) kmax = Math.max(kmax, So(Object.assign({}, p, { s: p.s2 })).kStar * 1.6); });
    return kmax;
  }

  function graph(p, ghost, target, hide) {
    var o = solve(p), kmax = view([p, ghost, target]);
    var A = p.A || 1, n = p.n || 0;
    var sf = function (q, s) { return function (k) { return s * (q.A || 1) * Math.pow(k, q.alpha); }; };
    var ymax = Math.max(sf(p, Math.max(p.s, p.s2 || 0))(kmax), (p.delta + n) * kmax * 0.75) * 1.15;
    var f = CH.frame({ w: 600, h: 320, x: [0, kmax], y: [0, ymax], xLabel: "capital per worker k", yLabel: "per worker" });
    var s = "";
    if (ghost) {
      s += CH.fn(f, sf(ghost, ghost.s), 0, kmax, "c1 faint dash", 120);
      if (ghost.delta !== p.delta || (ghost.n || 0) !== n) s += CH.fn(f, function (k) { return (ghost.delta + (ghost.n || 0)) * k; }, 0, kmax, "c2 faint dash");
    }
    s += CH.fn(f, sf(p, p.s), 0, kmax, "c1", 140);
    s += CH.text(f, kmax, sf(p, p.s)(kmax), p.s2 != null ? "A: s·f(k), s = " + F(p.s, 2) : "investment s·f(k)", "k1", "end", -4, p.s2 != null ? 16 : -8);
    if (p.s2 != null) {
      s += CH.fn(f, sf(p, p.s2), 0, kmax, "c3", 140);
      s += CH.text(f, kmax, sf(p, p.s2)(kmax), "B: s·f(k), s = " + F(p.s2, 2), "k3", "end", -4, -8);
    }
    s += CH.fn(f, function (k) { return (p.delta + n) * k; }, 0, kmax, "c2");
    var dlab = n ? "(δ + n)k" : "depreciation δk";
    var kd = Math.min(kmax, ymax / (p.delta + n) * 0.96);
    s += CH.text(f, kd, (p.delta + n) * kd, dlab, "k2", "end", -8, 4);
    if (hide.indexOf("kStar") === -1) {
      s += CH.vline(f, o.kStar, "c4 dash faint", o.iStar) + CH.dot(f, o.kStar, o.iStar);
      s += CH.text(f, o.kStar, 0, "k* = " + F(o.kStar, 3), "k1", "middle", 0, 30);
      if (p.s2 != null) { var o2 = So(Object.assign({}, p, { s: p.s2 })); s += CH.vline(f, o2.kStar, "c4 dash faint", o2.iStar) + CH.dot(f, o2.kStar, o2.iStar, "solid3"); }
    }
    // Where the economy is now, if it isn't at the steady state.
    if (Math.abs(p.k0 - o.kStar) / o.kStar > 0.02) {
      var X = f.sx(p.k0);
      s += CH.vline(f, p.k0, "c2 dash faint") + CH.dot(f, p.k0, o.i0, "solid1") + CH.dot(f, p.k0, o.dep0, "solid2");
      s += CH.text(f, p.k0, 0, "k₀ = " + F(p.k0, 2), "k2", "middle", 0, 30);
      if (hide.indexOf("dk0") === -1) {
        var toward = o.kStar > p.k0 ? 1 : -1;
        var ym = f.sy(Math.min(o.i0, o.dep0) * 0.45);
        s += CH.arrow(X, ym, X + toward * 46, ym, "c4");
        s += CH.text(f, p.k0, Math.min(o.i0, o.dep0) * 0.45, toward > 0 ? "k rises" : "k falls", "lb", toward > 0 ? "start" : "end", toward * 52, 4);
      }
    }
    return { svg: CH.svg(f, s, "Solow diagram"), cap: "Label the axis, both lines and the crossing. Left of k*, investment beats depreciation and k rises; right of it, k falls." };
  }

  function line(p, ghost, target, hide) {
    var T = p.T || 40;
    var path = ENGINE.solowPath(p, T), o = solve(p);
    var series = [], marks = [], hlines = [];
    if (p.s2 != null) {
      var B = ENGINE.solowPath(Object.assign({}, p, { s: p.s2 }), T);
      series.push({ name: "A: c (s = " + F(p.s, 2) + ")", pts: path.map(function (x) { return [x.t, x.c]; }), cls: "c1" });
      series.push({ name: "B: c (s = " + F(p.s2, 2) + ")", pts: B.map(function (x) { return [x.t, x.c]; }), cls: "c3" });
      if (hide.indexOf("overtake") === -1 && o.overtake > 0) marks.push({ x: o.overtake, y: B[o.overtake].c, label: "B overtakes in year " + o.overtake, lcls: "b" });
      return CH.lineChart({ title: "Consumption per worker", series: series, xLabel: "year", yLabel: "c", x: [0, T], marks: marks });
    }
    if (ghost) series.push({ name: "y before", pts: ENGINE.solowPath(ghost, T).map(function (x) { return [x.t, x.y]; }), cls: "c4 dash faint" });
    series.push({ name: "income y", pts: path.map(function (x) { return [x.t, x.y]; }), cls: "c1" });
    series.push({ name: "consumption c", pts: path.map(function (x) { return [x.t, x.c]; }), cls: "c3" });
    hlines.push({ y: o.yStar, label: "y* = " + F(o.yStar, 3), lcls: "k1", cls: "c4 dash faint" });
    return CH.lineChart({ title: "Income and consumption per worker", series: series, xLabel: "year", yLabel: "per worker", x: [0, T], hlines: hlines,
      marks: [{ x: 0, y: path[0].y, label: "y₀ = " + F(path[0].y, 3), lcls: "b" }] });
  }

  function bars(p, ghost, target, hide) {
    var o = solve(p);
    var rows = [{ label: "Now (k₀)", sub: "y = " + F(o.y0, 3), parts: [
      { name: "c", value: o.c0, cls: "solid3" }, { name: "i", value: o.i0, cls: "solid1" }] }];
    rows.push({ label: "Investment vs wear", sub: "Δk = " + F(o.dk0, 3), parts: [
      { name: "i = s·y", value: o.i0, cls: "solid1" }, { name: "δk", value: o.dep0, cls: "solid2" }] });
    if (hide.indexOf("kStar") === -1) rows.push({ label: "Steady state", sub: "y* = " + F(o.yStar, 3), parts: [
      { name: "c*", value: o.cStar, cls: "solid3" }, { name: "i*", value: o.iStar, cls: "solid1" }] });
    rows[1].share = false;
    return CH.barChart({ title: "Output split", rows: rows, share: false, pct: false, fmt: function (v) { return F(v, 3); } });
  }

  MODELS.push({
    id: "solow", week: 5, title: "Solow growth",
    short: "Saving builds capital, depreciation wears it out, and the economy settles at k*",
    base: { alpha: 0.3, s: 0.3, delta: 0.07, n: 0, A: 1, k0: 4 },
    inputs: [
      { key: "s", label: "Saving rate s", min: 0.05, max: 0.9, step: 0.01 },
      { key: "delta", label: "Depreciation δ", min: 0.02, max: 0.2, step: 0.005 },
      { key: "n", label: "Population growth n", min: 0, max: 0.05, step: 0.002 },
      { key: "alpha", label: "Capital share α", min: 0.15, max: 0.7, step: 0.01 },
      { key: "k0", label: "Starting capital k₀", min: 0.5, max: 40, step: 0.1 },
    ],
    solve: solve,
    kpis: [
      { key: "kStar", label: "Steady state k*", d: 3 },
      { key: "yStar", label: "y*", d: 3 },
      { key: "cStar", label: "c* = (1 − s)y*", d: 3 },
      { key: "k0", label: "k now", d: 3 },
      { key: "y0", label: "y now", d: 3 },
      { key: "dk0", label: "Δk now", d: 3 },
    ],
    graph: graph, line: line, bars: bars,
    lineTitle: "The transition", barsTitle: "Where output goes",
    forms: [
      { name: "Per worker", html: "<i>Y</i> = <i>K</i><sup>α</sup><i>L</i><sup>1−α</sup>  ⇒  <i>y</i> = <i>Y</i>/<i>L</i> = <i>k</i><sup>α</sup> = <i>f</i>(<i>k</i>),  <i>k</i> = <i>K</i>/<i>L</i>",
        note: "Constant returns let you divide everything by L." },
      { name: "Allocation", html: "<i>i</i> = <i>s y</i>,  <i>c</i> = (1 − <i>s</i>)<i>y</i>",
        note: "Trap: s goes with investment, (1 − s) with consumption." },
      { name: "Capital accumulation", html: "<i>K</i><sub><i>t</i>+1</sub> = (1 − δ)<i>K</i><sub><i>t</i></sub> + <i>I</i><sub><i>t</i></sub>  ⇒  Δ<i>k</i> = <i>s f</i>(<i>k</i>) − δ<i>k</i>",
        note: "With population growth n the break-even line is (δ + n)k." },
      { name: "Steady state", html: "<i>s f</i>(<i>k</i>*) = δ<i>k</i>*  ⇒  <i>k</i>* = (<i>s</i>/δ)<sup>1/(1−α)</sup>,  <i>y</i>* = (<i>s</i>/δ)<sup>α/(1−α)</sup>,  <i>c</i>* = (1 − <i>s</i>)<i>y</i>*",
        note: "Raise both sides to 1/(1 − α). Don't skip the exponent step." },
      { name: "With unemployment", html: "<i>y</i> = <i>k</i><sup>α</sup>(1 − <i>u</i>)<sup>1−α</sup>,  <i>y</i>* = (<i>s</i>/δ)<sup>α/(1−α)</sup>(1 − <i>u</i>)",
        note: "A lower natural rate raises output now and by more in the long run (Ch 9 #6)." },
    ],
    statics: {
      inputs: [{ key: "s", label: "Saving rate up" }, { key: "delta", label: "Depreciation up" },
               { key: "n", label: "Population growth up", step: 0.005 }, { key: "A", label: "Productivity A up" }],
      outputs: [{ key: "kStar", label: "k*" }, { key: "yStar", label: "y*" }, { key: "cStar", label: "c*" }, { key: "kGold", label: "k_gold" }],
    },
    facts: {
      cold: [
        "y = f(k); Δk = s f(k) − δk. Steady state where s f(k*) = δk*.",
        "A higher saving rate raises the level of income per worker, not the long-run growth rate (Practice Q17).",
        "A one-time fall in workers raises k, so y jumps up, then falls back to the same steady state.",
        "Why income per worker (Q7): it correlates with many things we care about and is easy to compute consistently across countries.",
      ],
      traps: [
        "Saying a higher saving rate raises long-run growth. It raises the level.",
        "In a labor-force shock, shifting the curves. A change in L moves k = K/L along the axis.",
        "Using s on consumption and (1 − s) on investment.",
      ],
    },
    scenarios: [
      {
        id: "mass-ss", title: "1860s Massachusetts: the steady state", source: "Practice exam Part 2 Q1 · graph",
        blurb: "y = k<sup>0.3</sup>, s = 0.3, δ = 0.07. Draw the diagram and find where k settles.",
        base: { alpha: 0.3, s: 0.3, delta: 0.07, n: 0, A: 1, k0: 4 },
        steps: [
          { say: "1860s Massachusetts: <b>Y = K<sup>0.3</sup>L<sup>0.7</sup></b>, saving rate <b>s = 0.3</b>, depreciation <b>δ = 0.07</b>, no population growth or technology.",
            hide: ["kStar", "yStar", "cStar", "dk0"], math: ["Per worker: <b>y = k<sup>0.3</sup></b>", "Δk = 0.3k<sup>0.3</sup> − 0.07k"] },
          { say: "The economy starts at k = 4.",
            predict: { kind: "choice", q: "At k = 4, capital per worker…", choices: [{ id: "up", label: "Rises" }, { id: "down", label: "Falls" }, { id: "same", label: "Stays put" }],
                       answer: function (o) { return o.dk0 > 0 ? "up" : o.dk0 < 0 ? "down" : "same"; } }, hide: ["kStar", "yStar", "cStar"],
            math: [function (o) { return "investment 0.3(4)<sup>0.3</sup> = " + F(o.i0, 3) + " > depreciation 0.07(4) = " + F(o.dep0, 3); }, function (o) { return "Δk = <b>+" + F(o.dk0, 3) + "</b>"; }] },
          { say: "k stops changing where the two lines cross.",
            predict: { kind: "num", q: "Steady-state k* (three decimals)?", key: "kStar", tol: 0.001 }, hide: [],
            math: ["0.3k<sup>0.3</sup> = 0.07k ⇒ k<sup>0.7</sup> = 0.3/0.07 = 4.2857", function (o) { return "k* = 4.2857<sup>1/0.7</sup> = <b>" + F(o.kStar, 3) + "</b>"; }] },
          { say: "Now start the economy at k = 12 instead.", set: { k0: 12 },
            predict: { kind: "choice", q: "From k = 12, capital per worker…", choices: [{ id: "up", label: "Rises" }, { id: "down", label: "Falls" }, { id: "same", label: "Stays put" }],
                       answer: function (o) { return o.dk0 > 0 ? "up" : "down"; } },
            math: [function (o) { return "investment " + F(o.i0, 3) + " < depreciation " + F(o.dep0, 3) + ": Δk = <b>" + F(o.dk0, 3) + "</b>"; }],
            why: "Right of k*, depreciation outruns investment. From either side the economy converges to k*." },
        ],
        exam: { pts: "Graph", lines: [
          "x-axis “capital per worker, k”. Concave s f(k), straight δk from the origin.",
          "Label the crossing k* (= 7.996 here) and draw arrows toward it from both sides.",
          "The key: label the x-axis, every line and every intersection point." ] },
      },
      {
        id: "war", title: "A war cuts the workforce", source: "Practice exam Part 2 Q1(b)(c) · 11 pts",
        blurb: "Massachusetts sits at its steady state. A war permanently cuts the number of workers by a fifth; the capital survives.",
        base: { alpha: 0.3, s: 0.3, delta: 0.07, n: 0, A: 1, k0: 7.9963 },
        steps: [
          { say: "The economy sits at k* ≈ 7.996, where investment equals depreciation." },
          { say: "War: L falls by 20%; K is unchanged. So k = K/L jumps to about 10.", set: { k0: 9.995 },
            predict: { kind: "dir", key: "y0", q: "Income per worker right after the war…" },
            math: ["k′ = K/(0.8L) = 7.996/0.8 = <b>9.995</b>", function (o) { return "y = 9.995<sup>0.3</sup> = <b>" + F(o.y0, 3) + "</b> (was 1.866)"; }],
            why: "Each surviving worker has more capital. (Total output Y still falls: there are fewer workers.)" },
          { say: "At k′ compare the two lines.",
            predict: { kind: "choice", q: "In the years after the war, income per worker…", choices: [{ id: "down", label: "Falls (negative growth)" }, { id: "up", label: "Keeps rising" }, { id: "same", label: "Stays at the new level" }],
                       answer: "down" },
            math: [function (o) { return "depreciation 0.07(9.995) = " + F(o.dep0, 3) + " > investment " + F(o.i0, 3); }, "Δk < 0: k and y fall"] },
          { say: "Where does it end?",
            predict: { kind: "choice", q: "In the long run, y returns to…", choices: [{ id: "same", label: "The same steady state" }, { id: "higher", label: "A higher level" }, { id: "lower", label: "A lower level" }], answer: "same" },
            math: ["k* depends only on s, δ and α, not on L", "y → y* = <b>1.866</b> again; c = (1 − s)y follows the same path"],
            why: "Part (c): consumption per worker jumps up with y, then declines back to its original level." },
        ],
        exam: { pts: "8 + 3 points", lines: [
          "Graph: label k, s f(k), δk and k*; mark k′ to the right of k*; arrow back toward k*.",
          "y jumps up immediately, then falls (negative growth) back to the same steady state.",
          "c = (1 − s)y: jumps up, then declines back to the original level." ] },
      },
      {
        id: "a-vs-b", title: "Country A vs country B", source: "Chapter 9 #1 (assigned)",
        blurb: "Y = K<sup>1/3</sup>L<sup>2/3</sup>, δ = 0.2, both start at k = 1. A saves 10%, B saves 30%.",
        base: { alpha: 1 / 3, s: 0.1, s2: 0.3, delta: 0.2, n: 0, A: 1, k0: 1, T: 25 },
        steps: [
          { say: "Two countries, same technology: y = k<sup>1/3</sup>, δ = 0.2, both at k = 1. <b>A saves 10%</b>, <b>B saves 30%</b>.", hide: ["overtake"] },
          { say: "Year 0: both produce y = 1.",
            predict: { kind: "choice", q: "Who consumes more at first?", choices: [{ id: "A", label: "Country A" }, { id: "B", label: "Country B" }, { id: "same", label: "The same" }], answer: "A" },
            math: ["A: c = 0.9 × 1 = <b>0.9</b>", "B: c = 0.7 × 1 = <b>0.7</b>"] },
          { say: "B's extra saving builds capital; A's capital shrinks toward its lower steady state.",
            predict: { kind: "num", q: "In which year does B's consumption first exceed A's?", key: "overtake", tol: 0.001 }, hide: [],
            math: ["k(t+1) = k(t) + s·y − 0.2k", "Year 5: B 0.784 vs A 0.775 → <b>year 5</b>"] },
          { say: "And in the long run?",
            predict: { kind: "num", q: "B's steady-state consumption c*? (three decimals)", key: "cStar2", tol: 0.002 },
            math: ["A: k* = (0.1/0.2)<sup>1.5</sup> = 0.354, c* = 0.9(0.707) = 0.636", "B: k* = (0.3/0.2)<sup>1.5</sup> = 1.837, c* = 0.7(1.225) = <b>0.857</b>"],
            why: "Saving more costs consumption first and pays off later, because both countries are below the golden rule." },
        ],
        exam: { pts: "Problem set", lines: ["A: c* = 0.636. B: c* = 0.857. B first exceeds A in year 5 (0.784 vs 0.775)."] },
      },
      {
        id: "swan", title: "Swan Island", source: "Chapter 9 #2",
        blurb: "y = 20k<sup>1/3</sup>, k₀ = 125, s = 0.18, δ = 0.1. Where does Swan Island start and where does it go?",
        base: { alpha: 1 / 3, s: 0.18, delta: 0.1, n: 0, A: 20, k0: 125 },
        steps: [
          { say: "Swan Island: <b>y = 20k<sup>1/3</sup></b>, k = 125, saving 18%, depreciation 10%.", hide: ["kStar", "yStar", "cStar", "y0", "dk0"] },
          { say: "Output per worker today.",
            predict: { kind: "num", q: "y today?", key: "y0", tol: 0.001 }, hide: ["kStar", "yStar", "cStar", "dk0"],
            math: ["y = 20 × 125<sup>1/3</sup> = 20 × 5 = <b>100</b>", "i = 18, c = 82, δk = 12.5"] },
          { say: "How fast is capital growing?",
            predict: { kind: "num", q: "Δk this year?", key: "dk0", tol: 0.001 }, hide: ["kStar", "yStar", "cStar"],
            math: ["Δk = 18 − 12.5 = <b>5.5</b>"] },
          { say: "Solve for the steady state.",
            predict: { kind: "num", q: "Steady-state k*?", key: "kStar", tol: 0.001 }, hide: [],
            math: ["0.18 × 20k<sup>1/3</sup> = 0.1k ⇒ k<sup>2/3</sup> = 36", "<b>k* = 216</b>, y* = 20 × 6 = <b>120</b>"] },
        ],
        exam: { pts: "Textbook", lines: ["y = 100, i = 18, c = 82, δk = 12.5, Δk = 5.5.", "k* = 216, y* = 120."] },
      },
    ],
  });
})();
