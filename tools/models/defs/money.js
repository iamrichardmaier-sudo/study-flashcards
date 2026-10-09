// Model 3 · Money, inflation & Fisher (Week 3)

(function () {
  var F = CH.fmt;
  var Mn = ENGINE.money;

  function graph(p, ghost, target, hide) {
    var o = Mn(p);
    var hid = function (k) { return hide.indexOf(k) !== -1; };
    if (p.vk != null) return velocity(p, o, ghost, target, hid);
    if (p.iGiven != null) return fisher(p, o, ghost, target, hid);
    return realSide(p, o, ghost, target, hid);
  }

  // The real side: r from S = I(r). Money growth never touches this picture.
  function realSide(p, o, ghost, target, hid) {
    var states = [p, ghost, target].filter(Boolean).map(function (q) { return { q: q, o: Mn(q) }; });
    var rs = states.map(function (x) { return x.o.r; });
    var rlo = Math.min(0, Math.min.apply(null, rs)) - 2, rhi = Math.max.apply(null, rs) + 8;
    var xlo = Math.min.apply(null, states.map(function (x) { return Math.min(x.q.a - x.q.b * rhi, x.o.S); }));
    var xhi = Math.max.apply(null, states.map(function (x) { return Math.max(x.q.a - x.q.b * rlo, x.o.S); }));
    var pad = (xhi - xlo) * 0.06;
    var f = CH.frame({ w: 600, h: 320, x: [xlo - pad, xhi + pad], y: [rlo, rhi], xLabel: "loanable funds", yLabel: "real rate r (%)" });
    var s = "";
    var I = function (q) { return function (S) { return (q.a - S) / q.b; }; };
    if (ghost) { var g = Mn(ghost); s += CH.vline(f, g.S, "c2 faint dash"); }
    s += CH.fn(f, I(p), xlo - pad, xhi + pad, "c1");
    s += CH.text(f, xhi, I(p)(xhi), "I(r) = " + F(p.a, 0) + (p.b === 1 ? " \u2212 r" : " \u2212 " + F(p.b, 0) + "r"), "k1", "end", -4, -8);
    s += CH.vline(f, o.S, "c2") + CH.text(f, o.S, rhi, "S = " + F(o.S, 0), "k2", "start", 6, 12);
    if (!hid("r")) {
      s += CH.dot(f, o.S, o.r) + CH.text(f, o.S, o.r, "r = " + F(o.r, 1) + "%", "b", "start", 9, -8);
      if (ghost) { var g2 = Mn(ghost); if (g2.r !== o.r) s += CH.dot(f, g2.S, g2.r, "solid4"); }
    }
    return { svg: CH.svg(f, s, "real side"), cap: "The real side sets r from S = I(r). Money growth then sets inflation, and Fisher adds the two: i = r + \u03c0." };
  }

  // Fisher: i = r + π, a 45° line through r.
  function fisher(p, o, ghost, target, hid) {
    var pmax = Math.max(12, o.pi * 1.6, ghost ? Mn(ghost).pi * 1.6 : 0);
    var imax = pmax + Math.max(6, o.r * 1.6);
    var f = CH.frame({ w: 600, h: 320, x: [0, pmax], y: [0, imax], xLabel: "inflation π (%)", yLabel: "nominal rate i (%)" });
    var s = "";
    if (ghost) { var g = Mn(ghost); s += CH.fn(f, function (x) { return g.r + x; }, 0, pmax, "c4 faint dash"); }
    s += CH.fn(f, function (x) { return o.r + x; }, 0, pmax, "c1");
    s += CH.text(f, pmax * 0.97, o.r + pmax * 0.97, "i = r + π", "k1", "end", -6, 14);
    if (!hid("pi") && !hid("r")) {
      s += CH.dot(f, o.pi, o.i) + CH.vline(f, o.pi, "c4 dash faint", o.i) + CH.hline(f, o.i, "c4 dash faint", o.pi);
      s += CH.text(f, o.pi, o.i, "π = " + F(o.pi, 1) + ", i = " + F(o.i, 1) + ", r = " + F(o.r, 1), "b", "start", 9, -8);
      if (ghost) { var g2 = Mn(ghost); if (g2.pi !== o.pi || g2.i !== o.i) s += CH.dot(f, g2.pi, g2.i, "solid4"); }
    } else s += CH.text(f, pmax * 0.4, imax * 0.6, "π = ?, r = ?", "k1 big");
    return { svg: CH.svg(f, s, "Fisher"), cap: "Fisher effect: one more point of expected inflation means one more point on the nominal rate, with the real rate unchanged." };
  }

  // Velocity rises with the nominal rate when money demand falls with i.
  function velocity(p, o, ghost, target, hid) {
    var imax = Math.max(16, (ghost ? Mn(ghost).i : 0) * 1.4, o.i * 1.4, target ? Mn(target).i * 1.4 : 0);
    var vmax = p.vk * Math.sqrt(imax) * 1.15;
    var f = CH.frame({ w: 600, h: 320, x: [0, imax], y: [0, vmax], xLabel: "nominal rate i (%)", yLabel: "velocity V" });
    var s = CH.fn(f, function (i) { return p.vk * Math.sqrt(i); }, 0.05, imax, "c1", 120);
    s += CH.text(f, imax * 0.97, p.vk * Math.sqrt(imax * 0.97), "V = " + F(p.vk, p.vk % 1 ? 1 : 0) + "√i", "k1", "end", -4, 16);
    if (ghost) { var g = Mn(ghost); if (g.i !== o.i) s += CH.dot(f, g.i, g.V, "solid4") + CH.arrow(f.sx(g.i), f.sy(g.V), f.sx(o.i) - 5, f.sy(o.V) + 3); }
    if (!hid("V")) s += CH.dot(f, o.i, o.V) + CH.text(f, o.i, o.V, "i = " + F(o.i, 1) + ", V = " + F(o.V, 2), "b", "start", 9, 14);
    else s += CH.text(f, imax * 0.4, vmax * 0.55, "V = ?", "k1 big");
    return { svg: CH.svg(f, s, "velocity"), cap: "Money pays no interest, so a higher nominal rate means people hold less of it and spend it faster: velocity rises." };
  }

  function line(p, ghost, target, hide, sc) {
    if (sc && sc.id === "hyper") return germany();
    var o = Mn(p);
    var path = function (pi, P0) { var pts = []; for (var t = 0; t <= 10; t++) pts.push([t, P0 * Math.pow(1 + pi / 100, t)]); return pts; };
    var P0 = o.P != null && hide.indexOf("P") === -1 ? o.P : 100;
    var series = [];
    if (ghost) series.push({ name: "before (π = " + F(Mn(ghost).pi, 1) + "%)", pts: path(Mn(ghost).pi, P0), cls: "c4 dash faint" });
    series.push({ name: hide.indexOf("pi") === -1 ? "price level at π = " + F(o.pi, 1) + "%" : "price level", pts: hide.indexOf("pi") === -1 ? path(o.pi, P0) : [], cls: "c2" });
    if (!series[series.length - 1].pts.length) series[series.length - 1].pts = [[0, P0], [10, P0]];
    return CH.lineChart({ title: "Price level over ten years", series: series, xLabel: "years", yLabel: o.P != null ? "P" : "P (start = 100)", x: [0, 10] });
  }

  function germany() {
    var d = [[0, 4.2], [1, 65], [2, 493], [3, 17972], [4, 353412], [5, 9.89e7], [6, 4.2e12]];
    var lab = ["1914", "Jan 1920", "Jul 1922", "Jan 1923", "Jul 1923", "Sep 1923", "Nov 1923"];
    return CH.lineChart({ title: "German marks per US dollar", series: [{ name: "marks per $ (log scale)", pts: d, cls: "c2" }],
      x: [0, 6], y: [1, 1e13], logY: true, xLabel: "", yLabel: "marks per $",
      xTicks: [0, 1, 2, 3, 4, 5, 6], xFmt: function (v) { return lab[v] || ""; },
      yFmt: function (v) { var e = Math.round(Math.log10(v)); return e === 0 ? "1" : "10^" + e; },
      marks: [{ x: 6, y: 4.2e12, label: "4.2 trillion", lcls: "k2", anchor: "end", dx: -8, dy: 4 }, { x: 0, y: 4.2, label: "4.2", lcls: "b" }] });
  }

  function bars(p, ghost, target, hide) {
    var o = Mn(p);
    var hid = function (k) { return hide.indexOf(k) !== -1; };
    if (hid("pi")) return "";
    var rows = [];
    rows.push({ label: "%ΔM + %ΔV", sub: F(p.gM + (p.gV || 0), 1) + "%", parts: [
      { name: "π", value: o.pi, cls: "solid2" }, { name: "%ΔY", value: p.gY, cls: "solid1" }] });
    if (!hid("r")) {
      var parts = [], neg = [];
      if (o.r >= 0) parts.push({ name: "r", value: o.r, cls: "solid3" }); else neg.push({ name: "r", value: o.r, lcls: "k3" });
      parts.push({ name: "π", value: o.pi, cls: "solid2" });
      rows.push({ label: "Nominal i", sub: F(o.i, 1) + "%", parts: parts, neg: neg });
    }
    return CH.barChart({ title: "Growth and Fisher decompositions", rows: rows, fmt: function (v) { return F(v, 1) + "%"; }, pct: false });
  }

  MODELS.push({
    id: "money", week: 3, title: "Money, inflation & Fisher",
    short: "Quantity theory, velocity, and nominal versus real interest rates",
    base: { Ys: 500, C: 350, G: 60, a: 95, b: 1, gM: 2, gY: 0, gV: 0, M: 1000, V: 2, Yl: 500 },
    inputs: [
      { key: "gM", label: "Money growth %ΔM", min: 0, max: 30, step: 0.5 },
      { key: "gY", label: "Real growth %ΔY", min: 0, max: 8, step: 0.1 },
      { key: "G", label: "Government purchases G", min: 40, max: 80, step: 1 },
      { key: "M", label: "Money supply M", min: 200, max: 3000, step: 10 },
      { key: "V", label: "Velocity V (constant)", min: 0.5, max: 6, step: 0.1 },
    ],
    solve: Mn,
    kpis: [
      { key: "pi", label: "Inflation π", d: 2, unit: "%" },
      { key: "r", label: "Real rate r", d: 2, unit: "%" },
      { key: "i", label: "Nominal rate i", d: 2, unit: "%" },
      { key: "V", label: "Velocity V", d: 2 },
      { key: "P", label: "Price level P", d: 2 },
      { key: "I", label: "Investment I", d: 1 },
    ],
    graph: graph, line: line, bars: bars,
    lineTitle: "The price level over time", barsTitle: "Where the percentages come from",
    forms: [
      { name: "Quantity equation", html: "<i>M</i> × <i>V</i> = <i>P</i> × <i>Y</i>",
        note: "An identity until you assume V is constant. Then, with Y fixed by factors, P moves one-for-one with M." },
      { name: "In growth rates", html: "%Δ<i>M</i> + %Δ<i>V</i> = π + %Δ<i>Y</i>  ⇒  π = %Δ<i>M</i> − %Δ<i>Y</i> (constant V)",
        note: "Nominal GDP grows at money growth plus velocity growth." },
      { name: "Money demand", html: "(<i>M</i>/<i>P</i>)<sup><i>d</i></sup> = <i>kY</i> ⇒ <i>V</i> = 1/<i>k</i>;   (<i>M</i>/<i>P</i>)<sup><i>d</i></sup> = 0.2<i>Y</i>/√<i>i</i> ⇒ <i>V</i> = 5√<i>i</i>",
        note: "If money demand falls with the nominal rate, velocity rises with it. Match the units of i the problem uses." },
      { name: "Fisher equation", html: "<i>i</i> = <i>r</i> + π<sup><i>e</i></sup>;   <i>r</i><sup>ex ante</sup> = <i>i</i> − <i>E</i>[π],  <i>r</i><sup>ex post</sup> = <i>i</i> − π",
        note: "Fisher effect: πᵉ up one point, i up one point, r unchanged." },
      { name: "Combined classical model", html: "<i>S</i> = <i>I</i>(<i>r</i>) → <i>r</i>;  %Δ<i>M</i> − %Δ<i>Y</i> → π;  <i>i</i> = <i>r</i> + π",
        note: "G moves r and I, not inflation. Money growth moves inflation and i, not r. The classical dichotomy." },
      { name: "Target money growth", html: "%Δ<i>M</i> = π* + <i>g</i>",
        note: "With constant velocity, money must grow at the inflation target plus real growth." },
    ],
    statics: {
      inputs: [{ key: "G", label: "G up" }, { key: "gM", label: "Money growth up" }, { key: "gY", label: "Real growth up" },
               { key: "M", label: "Money supply M up" }, { key: "V", label: "Velocity V up" }],
      outputs: [{ key: "r", label: "r" }, { key: "I", label: "I" }, { key: "pi", label: "π" }, { key: "i", label: "i" }, { key: "P", label: "P" }],
    },
    facts: {
      cold: [
        "MV = PY. With V constant and Y fixed, prices move one-for-one with money.",
        "π = money growth − real growth (constant V).",
        "i = r + expected π. The real rate doesn't change when inflation changes.",
        "Classical dichotomy: nominal variables do not affect real variables (the reverse statement is false, Practice Q20).",
        "Seigniorage is an inflation tax on people who hold money (Q15).",
      ],
      traps: [
        "Saying G changes inflation. G changes r and I; money growth changes inflation.",
        "Forgetting to add inflation to r to get i.",
        "Entering i as 0.04 when the formula uses i in percent.",
        "Confusing the monetary base (currency + reserves) with M1.",
      ],
    },
    scenarios: [
      {
        id: "ps3", title: "PS3 combined model", source: "Problem Set 3 · likely long problem",
        blurb: "Y = 500, C = 350, G = 60, I(r) = 95 − r, MV = PY with constant V. Money grows 2%.",
        base: { Ys: 500, C: 350, G: 60, a: 95, b: 1, gM: 2, gY: 0, M: 1000, V: 2, Yl: 500 },
        steps: [
          { say: "Y = 500, C = 350, G = 60, <b>I(r) = 95 − r</b>, constant V, Y fixed. The Fed grows money <b>2%</b> a year.", hide: ["pi", "r", "i", "I"] },
          { say: "Inflation comes from the money side alone.",
            predict: { kind: "num", q: "Inflation π (%)?", key: "pi", tol: 0.001 }, hide: ["r", "i", "I"],
            math: ["V and Y constant ⇒ π = %ΔM = <b>2%</b>"] },
          { say: "The real rate comes from the real side alone.",
            predict: { kind: "num", q: "Real interest rate r (%)?", key: "r", tol: 0.001 }, hide: ["i"],
            math: ["S = 500 − 350 − 60 = 90", "95 − r = 90 ⇒ <b>r = 5%</b>, I = 90"] },
          { say: "Fisher puts them together.",
            predict: { kind: "num", q: "Nominal rate i (%)?", key: "i", tol: 0.001 }, hide: [],
            math: ["i = r + π = 5 + 2 = <b>7%</b>"] },
          { say: "Government spending rises to <b>G = 65</b>.", set: { G: 65 },
            predict: { kind: "dir", key: "pi", q: "Inflation…" },
            math: ["S = 500 − 350 − 65 = 85 ⇒ r = 10%, I = 85", "π = 2% (money growth didn't change)", "<b>i = 10 + 2 = 12%</b>"],
            why: "Spending crowds out investment and raises r, but inflation stays at 2%. The classical dichotomy in action." },
        ],
        exam: { pts: "Likely long problem", lines: [
          "(a) π = %ΔM = 2%.  (b) S = 90 ⇒ r = 5%, I = 90.  (c) i = 5 + 2 = 7%.",
          "(d) G = 65: S = 85, r = 10%, I = 85, i = 12%; π still 2%.",
          "Say why: r from the real side, π from money growth, i by Fisher." ] },
      },
      {
        id: "wiknam", title: "Wiknam", source: "Chapter 6 #1 (assigned)",
        blurb: "Velocity is constant, real GDP grows 3%, money grows 8%, and the nominal rate is 9%.",
        base: { gM: 8, gY: 3, iGiven: 9, Ys: 0, C: 0, G: 0, a: 0, b: 1 },
        steps: [
          { say: "In Wiknam velocity is constant, real GDP grows <b>3%</b>, money grows <b>8%</b>, and the nominal interest rate is <b>9%</b>.", hide: ["pi", "r"] },
          { say: "Nominal GDP growth = %ΔM + %ΔV.",
            predict: { kind: "num", q: "Nominal GDP growth (%)?", key: "nomGDPgrowth", tol: 0.001 },
            math: ["%Δ(PY) = 8 + 0 = <b>8%</b>"] },
          { say: "Split that 8% into inflation and real growth.",
            predict: { kind: "num", q: "Inflation π (%)?", key: "pi", tol: 0.001 }, hide: ["r"],
            math: ["π = 8 − 3 = <b>5%</b>"] },
          { say: "Fisher, solved for r.",
            predict: { kind: "num", q: "Real interest rate r (%)?", key: "r", tol: 0.001 }, hide: [],
            math: ["r = i − π = 9 − 5 = <b>4%</b>"] },
          { say: "The central bank speeds money growth to <b>10%</b>, and people expect it, so the nominal rate goes to 11%.", set: { gM: 10, iGiven: 11 },
            predict: { kind: "dir", key: "r", q: "The real rate…" },
            math: ["π = 10 − 3 = 7", "r = 11 − 7 = <b>4%</b>, unchanged"],
            why: "The Fisher effect: two more points of inflation, two more points on i, the same r." },
        ],
        exam: { pts: "Problem set", lines: ["(a) 8%.  (b) π = 8 − 3 = 5%.  (c) r = 9 − 5 = 4%."] },
      },
      {
        id: "velocity", title: "Velocity rises with i", source: "Chapter 6 #3 · Practice Q11",
        blurb: "(M/P)<sup>d</sup> = 0.2Y/√i, so V = 5√i. Y = 1,000, M = 1,200.",
        base: { vk: 5, iGiven: 4, M: 1200, Yl: 1000, gM: 0, gY: 0, Ys: 0, C: 0, G: 0, a: 0, b: 1 },
        steps: [
          { say: "Money demand is <b>(M/P)<sup>d</sup> = 0.2Y/√i</b>. Velocity is V = PY/M = Y/(M/P).", hide: ["V", "P"],
            math: ["V = PY / M = Y / (0.2Y/√i) = <b>5√i</b>"] },
          { say: "The nominal rate is 4 (percent).",
            predict: { kind: "num", q: "Velocity V?", key: "V", tol: 0.001 }, hide: ["P"],
            math: ["V = 5√4 = <b>10</b>"] },
          { say: "Y = 1,000 and M = 1,200.",
            predict: { kind: "num", q: "Price level P?", key: "P", tol: 0.001 }, hide: [],
            math: ["P = MV / Y = 1,200 × 10 / 1,000 = <b>12</b>"] },
          { say: "Expected inflation rises 5 points, so i goes to 9 (Fisher). M and Y don't change.", set: { iGiven: 9 },
            predict: { kind: "num", q: "New price level P?", key: "P", tol: 0.001 },
            math: ["V = 5√9 = 15", "P = 1,200 × 15 / 1,000 = <b>18</b> (+50%)"],
            why: "A higher nominal rate makes people economize on money: they spend balances, velocity rises, and so do prices." },
          { say: "The Fed wants to keep P at 12 with i = 9.", set: { M: 800 },
            predict: { kind: "num", q: "What money supply M does that take?", value: function (o, p) { return p.M; }, tol: 0.001 },
            math: ["M = PY / V = 12 × 1,000 / 15 = <b>800</b>"] },
        ],
        exam: { pts: "Problem set + Q11", lines: [
          "V = 5√i: i = 4 gives V = 10, P = 12; i = 9 gives V = 15, P = 18.",
          "Holding P at 12 takes M = 800.",
          "Practice Q11: (M/P)<sup>d</sup> = 2Y/√i, i = 4 ⇒ V = √4/2 = 1. Y doesn't matter." ] },
      },
      {
        id: "hyper", title: "German hyperinflation, 1922–23", source: "Lecture 5 · real-world",
        blurb: "A government that can't tax or borrow prints money. Watch inflation, the nominal rate and velocity.",
        base: { Ys: 500, C: 350, G: 60, a: 95, b: 1, gM: 5, gY: 3, M: 1000, vk: 0.5, Yl: 500, iGiven: null },
        steps: [
          { say: "Before the war: money grows <b>5%</b>, real output <b>3%</b>.",
            math: [function (o) { return "π = 5 − 3 = " + F(o.pi, 0) + "%, i = r + π = " + F(o.i, 0) + "%"; }] },
          { say: "Reparations and war debts: the government covers its deficit by printing. Money growth jumps to <b>50%</b>.", set: { gM: 50 },
            predict: { kind: "num", q: "Inflation π (%)?", key: "pi", tol: 0.001 },
            math: [function (o) { return "π = 50 − 3 = <b>" + F(o.pi, 0) + "%</b>; i = 5 + 47 = " + F(o.i, 0) + "%"; }],
            why: "Seigniorage: the government's revenue is an inflation tax on everyone holding marks." },
          { say: "Printing accelerates to <b>500%</b>. Holding cash now costs a fortune.", set: { gM: 500 },
            predict: { kind: "dir", key: "V", q: "Velocity, how fast marks change hands…" },
            math: [function (o) { return "i = " + F(o.i, 0) + "%, V = 0.5√i = " + F(o.V, 1); }],
            why: "Workers were paid twice a day and spent the money at lunch. Real money balances fell to about a tenth of their 1922 level." },
          { say: "November 1923: the Rentenmark and a balanced budget. Printing stops; money growth back to <b>3%</b>.", set: { gM: 3 },
            predict: { kind: "num", q: "Inflation π (%)?", key: "pi", tol: 0.001 },
            math: ["π = 3 − 3 = <b>0%</b>"],
            why: "Hyperinflations end with fiscal reform that removes the need for seigniorage. A new currency alone isn't enough." },
        ],
        exam: { pts: "Short answer", lines: [
          "Starts: governments finance large deficits by printing money (seigniorage = inflation tax).",
          "Ends: fiscal reform that removes the need to print.",
          "Money and prices rose together by many orders of magnitude (log scale)." ] },
      },
    ],
  });
})();
