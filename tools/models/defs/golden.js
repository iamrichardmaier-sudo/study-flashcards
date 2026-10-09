// Model 6 · The golden rule (Week 5)

(function () {
  var F = CH.fmt;
  var So = ENGINE.solow;

  function solve(p) {
    var o = So(p);
    o.atGold = Math.abs(o.kStar - o.kGold) / o.kGold < 0.005;
    o.side = o.atGold ? "at" : o.kStar < o.kGold ? "below" : "above";
    o.mpk = o.mpkStar;
    if (p.sAfter != null) {
      var path = ENGINE.solowPath(Object.assign({}, p, { k0: p.k0 != null ? p.k0 : o.kStar }), 200);
      o.cNow = path[0].c; o.c1 = path[1].c; o.k1 = path[1].k;
      var oNew = So(Object.assign({}, p, { s: p.sAfter }));
      o.cLong = oNew.cStar;
      o.cross = path.findIndex(function (x) { return x.c > o.cStar; });
      o.everyDate = path.every(function (x) { return x.c > o.cStar; });
    }
    return o;
  }

  function graph(p, ghost, target, hide) {
    var o = solve(p), A = p.A || 1, n = p.n || 0;
    var hid = function (k) { return hide.indexOf(k) !== -1; };
    var kmax = Math.max(o.kGold, o.kStar) * 2;
    var fk = function (k) { return A * Math.pow(k, p.alpha); };
    var ymax = fk(kmax) * 1.12;
    // Left panel: f(k), δk, s f(k) and the consumption gap.
    var f = CH.frame({ w: 330, h: 300, x: [0, kmax], y: [0, ymax], xLabel: "k", yLabel: "per worker", pad: { l: 44, r: 10, t: 16, b: 38 } });
    var s = f.axes;
    s += CH.fn(f, fk, 0, kmax, "c4", 120) + CH.text(f, kmax, fk(kmax), "f(k)", "lb", "end", -2, -6);
    s += CH.fn(f, function (k) { return p.s * fk(k); }, 0, kmax, "c1", 120) + CH.text(f, kmax, p.s * fk(kmax), "s·f(k)", "k1", "end", -2, 14);
    s += CH.fn(f, function (k) { return (p.delta + n) * k; }, 0, kmax, "c2") ;
    var kd = Math.min(kmax, ymax / (p.delta + n) * 0.95);
    s += CH.text(f, kd, (p.delta + n) * kd, "δk", "k2", "end", -6, 4);
    s += '<line x1="' + f.sx(o.kStar) + '" x2="' + f.sx(o.kStar) + '" y1="' + f.sy(o.yStar) + '" y2="' + f.sy(o.depStar) + '" class="c3" stroke-width="5"/>';
    s += CH.text(f, o.kStar, (o.yStar + o.depStar) / 2, "c*", "k3", "start", 6, 4);
    s += CH.vline(f, o.kStar, "c4 dash faint") + CH.text(f, o.kStar, 0, "k*", "k1", "middle", 0, 30);
    if (!hid("kGold")) {
      var yg = fk(o.kGold), slope = p.delta + n, span = kmax * 0.18;
      s += '<line x1="' + f.sx(o.kGold - span) + '" y1="' + f.sy(yg - slope * span) + '" x2="' + f.sx(o.kGold + span) + '" y2="' + f.sy(yg + slope * span) + '" class="c3 dash"/>';
      if (!o.atGold) s += CH.vline(f, o.kGold, "c3 dash faint") + CH.text(f, o.kGold, 0, "k_gold", "k3", "middle", 0, 30);
      else s += CH.text(f, o.kGold, 0, "= k_gold", "k3", "start", 10, 30);
    }
    // Right panel: steady-state c against the saving rate.
    var hump = ENGINE.cStarBySaving(p, 100);
    var cmax = Math.max.apply(null, hump.map(function (h) { return h[1]; })) * 1.18;
    var g = CH.frame({ w: 290, h: 300, x: [0, 1], y: [0, cmax], xLabel: "saving rate s", yLabel: "c*", pad: { l: 40, r: 12, t: 16, b: 38 },
                       xTicks: [0, 0.2, 0.4, 0.6, 0.8, 1], xFmt: function (v) { return Math.round(v * 100) + "%"; } });
    var t = g.axes + CH.line(g, hump, "c1");
    if (ghost && ghost.s !== p.s) t += CH.dot(g, ghost.s, So(ghost).cStar, "solid4");
    t += CH.dot(g, p.s, o.cStar) + CH.text(g, p.s, o.cStar, "s = " + F(p.s * 100, 0) + "%", "b", p.s > 0.6 ? "end" : "start", p.s > 0.6 ? -8 : 8, 14);
    if (!hid("sGold")) t += CH.vline(g, o.sGold, "c3 dash faint", o.cGold) + CH.dot(g, o.sGold, o.cGold, "solid3") + CH.text(g, o.sGold, o.cGold, "s_gold = α", "k3", "middle", 0, -10);
    var out = CH.raw(630, 300, s + '<g transform="translate(340,0)">' + t + "</g>", "golden rule");
    return { svg: out, cap: "Left: consumption is the gap between f(k) and δk, widest where the slope of f equals δ. Right: steady-state consumption peaks at s = α." };
  }

  function line(p, ghost, target, hide) {
    var o = solve(p);
    if (p.sAfter == null) {
      var hump = ENGINE.cStarBySaving(p, 100);
      return CH.lineChart({ title: "Steady-state consumption by saving rate", series: [{ name: "c* for each s", pts: hump.map(function (h) { return [h[0] * 100, h[1]]; }), cls: "c1" }],
        xLabel: "saving rate s (%)", yLabel: "c*", x: [0, 100], zero: true,
        marks: [{ x: p.s * 100, y: o.cStar, label: "now: c* = " + F(o.cStar, 3), lcls: "b" }].concat(hide.indexOf("sGold") === -1 ? [{ x: o.sGold * 100, y: o.cGold, label: "golden: " + F(o.cGold, 3), lcls: "k3", cls: "solid3", dy: 18 }] : []) });
    }
    var path = ENGINE.solowPath(Object.assign({}, p, { k0: p.k0 != null ? p.k0 : o.kStar }), 60);
    var marks = [{ x: 0, y: path[0].c, label: "c₀ = " + F(path[0].c, 3), lcls: "k2" }];
    if (hide.indexOf("cross") === -1 && o.cross > 0) marks.push({ x: o.cross, y: path[o.cross].c, label: "passes old c* in year " + o.cross, lcls: "b" });
    return CH.lineChart({ title: "Consumption after the switch", series: [{ name: "c, after s changes to " + F(p.sAfter, 2), pts: path.map(function (x) { return [x.t, x.c]; }), cls: "c3" }],
      xLabel: "year", yLabel: "c", x: [0, 60],
      hlines: [{ y: o.cStar, label: "old c* = " + F(o.cStar, 3), cls: "c4 dash faint" }].concat(hide.indexOf("cLong") === -1 ? [{ y: o.cLong, label: "new c* = " + F(o.cLong, 3), lcls: "k3", cls: "c3 dash" }] : []),
      marks: marks });
  }

  function bars(p, ghost, target, hide) {
    var o = solve(p);
    var rows = [{ label: "Steady state now", sub: "s = " + F(p.s * 100, 0) + "%", parts: [
      { name: "c*", value: o.cStar, cls: "solid3" }, { name: "i* = δk*", value: o.iStar, cls: "solid1" }] }];
    if (hide.indexOf("kGold") === -1) rows.push({ label: "Golden rule", sub: "s = " + F(o.sGold * 100, 0) + "%", parts: [
      { name: "c_gold", value: o.cGold, cls: "solid3" }, { name: "δk_gold", value: o.yGold - o.cGold, cls: "solid1" }] });
    return CH.barChart({ title: "Consumption vs investment", rows: rows, share: false, pct: false, fmt: function (v) { return F(v, 3); } });
  }

  MODELS.push({
    id: "golden", week: 5, title: "The golden rule",
    short: "The steady state with the most consumption: MPK = δ and s_gold = α",
    base: { alpha: 0.3, s: 0.2, delta: 0.07, n: 0, A: 1 },
    inputs: [
      { key: "s", label: "Saving rate s", min: 0.05, max: 0.9, step: 0.01 },
      { key: "alpha", label: "Capital share α", min: 0.15, max: 0.7, step: 0.01 },
      { key: "delta", label: "Depreciation δ", min: 0.02, max: 0.2, step: 0.005 },
    ],
    solve: solve,
    kpis: [
      { key: "kStar", label: "k* at this s", d: 3 },
      { key: "cStar", label: "c* at this s", d: 3 },
      { key: "kGold", label: "k_gold", d: 3 },
      { key: "cGold", label: "c_gold", d: 3 },
      { key: "sGold", label: "s_gold", pct: true, d: 1 },
      { key: "mpk", label: "MPK at k* (vs δ)", d: 4 },
    ],
    graph: graph, line: line, bars: bars,
    lineTitle: "Consumption", barsTitle: "Now vs the golden rule",
    forms: [
      { name: "The objective", html: "<i>c</i>* = <i>f</i>(<i>k</i>*) − δ<i>k</i>*",
        note: "In the steady state s f(k*) = δk*, so consumption is output minus what it takes to replace worn-out capital." },
      { name: "The condition", html: "<i>f</i>′(<i>k</i><sub>gold</sub>) = δ  (MPK = δ; with population growth MPK = δ + <i>n</i>)",
        note: "State the optimization condition before substituting numbers." },
      { name: "Cobb-Douglas", html: "α<i>k</i><sup>α−1</sup> = δ  ⇒  <i>k</i><sub>gold</sub> = (α/δ)<sup>1/(1−α)</sup>",
        note: "Raise both sides to 1/(1 − α)." },
      { name: "The saving rate", html: "<i>s</i><sub>gold</sub> = δ<i>k</i><sub>gold</sub> / <i>f</i>(<i>k</i><sub>gold</sub>) = δ<i>k</i><sup>1−α</sup> = δ(α/δ) = <b>α</b>",
        note: "Show this step on the exam: stating s_gold = α alone loses points." },
      { name: "Below vs above", html: "<i>k</i>* < <i>k</i><sub>gold</sub>: save more (c falls now, rises later).  <i>k</i>* > <i>k</i><sub>gold</sub>: save less (c rises at every date).",
        note: "MPK > δ means below the golden rule. Mankiw's US numbers: MPK ≈ 12% > δ ≈ 4%." },
    ],
    statics: {
      inputs: [{ key: "s", label: "Saving rate up" }, { key: "alpha", label: "α up" }, { key: "delta", label: "δ up" }],
      outputs: [{ key: "kStar", label: "k*" }, { key: "cStar", label: "c*" }, { key: "kGold", label: "k_gold" }, { key: "sGold", label: "s_gold" }],
    },
    facts: {
      cold: [
        "Golden rule: the k that maximizes steady-state consumption satisfies f′(k) = δ.",
        "For y = k<sup>α</sup>: k_gold = (α/δ)<sup>1/(1−α)</sup> and s_gold = α.",
        "Below k_gold, raising saving costs consumption now and pays later. Above it, cutting saving raises consumption at every date.",
      ],
      traps: [
        "Forgetting the exponent step for k_gold: raise both sides to 1/(1 − α).",
        "Skipping the derivation of s_gold = α.",
        "PS5(c) writes c₀ = s_gold f(k₀); consumption is (1 − s)f(k), so c₀ = 0.952. The literal version gives investment.",
      ],
    },
    scenarios: [
      {
        id: "mass-gold", title: "1860s Massachusetts: the golden rule", source: "Practice exam Part 2 Q1(a) · 9 pts",
        blurb: "y = k<sup>0.3</sup>, s = 0.3, δ = 0.07. Find k_gold and s_gold.",
        base: { alpha: 0.3, s: 0.3, delta: 0.07, n: 0, A: 1 },
        steps: [
          { say: "Y = K<sup>0.3</sup>L<sup>0.7</sup>, s = 0.3, δ = 0.07. Find the golden-rule capital and saving rate.", hide: ["kGold", "cGold", "sGold"],
            math: ["Per worker: y = k<sup>0.3</sup>, c = (1 − s)f(k) = f(k) − s f(k)", "In steady state s f(k) = δk, so <b>c* = f(k) − δk</b>"] },
          { say: "Maximize c*: set the derivative to zero.",
            predict: { kind: "num", q: "k_gold (three decimals)?", key: "kGold", tol: 0.001 }, hide: ["sGold"],
            math: ["f′(k) − δ = 0 ⇒ 0.3k<sup>−0.7</sup> = 0.07", "k<sup>0.7</sup> = 0.3/0.07 = 4.2857", "k_gold = 4.2857<sup>1/0.7</sup> = <b>7.996</b>"] },
          { say: "Plug k_gold into s f(k) = δk.",
            predict: { kind: "num", q: "s_gold (decimal)?", key: "sGold", tol: 0.001 }, hide: [],
            math: ["s(7.996)<sup>0.3</sup> = 0.07(7.996)", "s = 0.07(7.996)<sup>0.7</sup> = 0.07 × 4.2857 = <b>0.3 = α</b>"] },
          { say: "Massachusetts already saves 30%.",
            predict: { kind: "choice", q: "Is it at the golden rule?", choices: [{ id: "at", label: "Yes, exactly" }, { id: "below", label: "No, below it" }, { id: "above", label: "No, above it" }], answer: function (o) { return o.side; } },
            math: ["s = 0.3 = s_gold, so k* = k_gold = 7.996"] },
        ],
        exam: { pts: "9 points", lines: [
          "c* = f(k) − δk. Condition: f′(k) = δ, i.e. 0.3k<sup>−0.7</sup> = 0.07.",
          "k_gold = (0.3/0.07)<sup>1/0.7</sup> = 7.996.",
          "s_gold = δk<sup>0.7</sup> = 0.07 × 4.2857 = 0.3 = α. Show this step." ] },
      },
      {
        id: "sokovia-gold", title: "Sokovia's golden rule", source: "Problem Set 5 (a)(b)",
        blurb: "y = k<sup>0.4</sup>, δ = 0.1, s = 0.2. Find the steady state and the golden rule.",
        base: { alpha: 0.4, s: 0.2, delta: 0.1, n: 0, A: 1 },
        steps: [
          { say: "Sokovia: <b>y = k<sup>0.4</sup></b>, δ = 0.1, saving rate <b>s = 0.2</b>.", hide: ["kStar", "cStar", "kGold", "cGold", "sGold"] },
          { say: "The steady state first.",
            predict: { kind: "num", q: "k* (three decimals)?", key: "kStar", tol: 0.001 }, hide: ["cStar", "kGold", "cGold", "sGold"],
            math: ["0.2k<sup>0.4</sup> = 0.1k ⇒ k<sup>0.6</sup> = 2", "k* = 2<sup>1/0.6</sup> = <b>3.175</b>, y* = 1.587, c* = 0.8 × 1.587 = <b>1.270</b>"] },
          { say: "Now the golden rule.",
            predict: { kind: "num", q: "k_gold (two decimals)?", key: "kGold", tol: 0.002 }, hide: ["cGold"],
            math: ["0.4k<sup>−0.6</sup> = 0.1 ⇒ k<sup>0.6</sup> = 4", "k_gold = 4<sup>1/0.6</sup> = <b>10.08</b>, s_gold = α = 0.4"] },
          { say: "How much more could Sokovians consume?",
            predict: { kind: "num", q: "Golden-rule consumption c_gold (three decimals)?", key: "cGold", tol: 0.001 }, hide: [],
            math: ["c_gold = (1 − 0.4)(10.08)<sup>0.4</sup> = 0.6 × 2.52 = <b>1.512</b>"],
            why: "Sokovia saves less than α, so it sits below the golden rule: k* = 3.175 < k_gold = 10.08." },
        ],
        exam: { pts: "Problem set", lines: [
          "k* = 2<sup>1/0.6</sup> = 3.175, y* = 1.587, c* = 1.270.",
          "k_gold = 4<sup>1/0.6</sup> = 10.08, s_gold = 0.4; check s = δk<sup>1−α</sup> = 0.1 × 4 = 0.4.",
          "c_gold = 0.6 × 10.08<sup>0.4</sup> = 1.512." ] },
      },
      {
        id: "sokovia-switch", title: "Sokovia switches to s_gold", source: "Problem Set 5 (c)",
        blurb: "At t = 0 Sokovia raises saving from 20% to 40%, starting from k = 3.175. Trace consumption.",
        base: { alpha: 0.4, s: 0.2, delta: 0.1, n: 0, A: 1, sAfter: 0.4, k0: 3.17480 },
        steps: [
          { say: "Sokovia sits at k* = 3.175 with c* = 1.270. At t = 0 it switches to <b>s = 0.4</b>.", hide: ["cross", "cLong"] },
          { say: "The same output, but more of it saved.",
            predict: { kind: "num", q: "Consumption at t = 0, c₀ (three decimals)?", key: "cNow", tol: 0.001 },
            math: ["c₀ = (1 − 0.4)f(k₀) = 0.6 × 1.587 = <b>0.952</b> (down from 1.270)"],
            why: "Note the likely typo in PS5: it writes s_gold f(k₀), which is investment, not consumption." },
          { say: "Capital builds.",
            predict: { kind: "num", q: "Consumption at t = 1 (three decimals)?", key: "c1", tol: 0.001 },
            math: ["k₁ = 3.175 + 0.4(1.587) − 0.1(3.175) = 3.492", "c₁ = 0.6 × 3.492<sup>0.4</sup> = <b>0.989</b>"] },
          { say: "Consumption keeps climbing.",
            predict: { kind: "num", q: "In which year does c first beat the old 1.270?", key: "cross", tol: 0.001 }, hide: [],
            math: ["Year 13, then on toward <b>1.512</b>"],
            why: "Starting below the golden rule, moving to s_gold costs consumption now and pays off later." },
        ],
        exam: { pts: "Problem set", lines: ["c₀ = 0.952 (falls immediately), c₁ = 0.989, passes 1.270 around year 13, converges to 1.512."] },
      },
      {
        id: "above-gold", title: "Above the golden rule", source: "Chapter 9 review question",
        blurb: "y = k<sup>0.5</sup>, δ = 0.1, but the country saves 70%. What happens if it saves less?",
        base: { alpha: 0.5, s: 0.7, delta: 0.1, n: 0, A: 1 },
        steps: [
          { say: "y = k<sup>0.5</sup>, δ = 0.1, and a very high saving rate of <b>70%</b>.",
            math: ["k* = (0.7/0.1)<sup>2</sup> = 49, y* = 7, c* = 0.3 × 7 = <b>2.1</b>"] },
          { say: "Compare k* with the golden rule.",
            predict: { kind: "choice", q: "This economy is…", choices: [{ id: "below", label: "Below the golden rule" }, { id: "above", label: "Above the golden rule" }, { id: "at", label: "At it" }], answer: function (o) { return o.side; } },
            math: ["k_gold = (0.5/0.1)<sup>2</sup> = 25 < k* = 49", "MPK = 0.5(49)<sup>−0.5</sup> = 0.071 < δ = 0.1"] },
          { say: "It cuts saving to s_gold = 0.5 at t = 0.", set: { sAfter: 0.5, k0: 49 },
            predict: { kind: "num", q: "Consumption right away, c₀?", key: "cNow", tol: 0.001 },
            math: ["c₀ = 0.5 × 7 = <b>3.5</b> (up from 2.1)"] },
          { say: "Then capital runs down toward k_gold = 25.",
            predict: { kind: "choice", q: "Compared with the old 2.1, consumption on the way…", choices: [{ id: "always", label: "Stays higher at every date" }, { id: "dips", label: "Dips below 2.1 for a while" }], answer: function (o) { return o.everyDate ? "always" : "dips"; } },
            math: ["c falls from 3.5 toward c_gold = <b>2.5</b>, never below 2.1"],
            why: "Above the golden rule there's no trade-off: saving less raises consumption now and forever. A policymaker would never stay there." },
        ],
        exam: { pts: "Short answer", lines: [
          "If k* > k_gold (MPK < δ), cut saving: consumption rises at every date.",
          "If k* < k_gold, raising saving lowers consumption now and raises it later." ] },
      },
    ],
  });
})();
