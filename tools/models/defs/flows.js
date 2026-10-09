// Model 4 · Unemployment flows (Week 4)

(function () {
  var F = CH.fmt;
  var pc = function (v, d) { return F(v * 100, d == null ? 2 : d) + "%"; };

  function solve(p) {
    var o = ENGINE.flows(p);
    var path = ENGINE.flowsPath(p, 2);
    o.u1 = path[1].u; o.u2 = path[2].u; o.U2 = path[2].U; o.E2 = path[2].E; o.L1 = path[1].L;
    o.L = p.U0 + p.E0;
    return o;
  }

  function graph(p, ghost, target, hide) {
    var o = solve(p);
    var hid = function (k) { return hide.indexOf(k) !== -1; };
    var s = "";
    var hasNL = (p.NL0 || 0) > 0;
    var yE = hasNL ? 110 : 130, yU = yE;
    s += '<rect x="40" y="' + (yE - 44) + '" width="170" height="88" rx="16" class="box3"/>';
    s += '<text x="125" y="' + (yE - 8) + '" class="k3" text-anchor="middle">Employed E</text>';
    s += '<text x="125" y="' + (yE + 18) + '" class="big" text-anchor="middle">' + F(p.E0, 2) + "M</text>";
    s += '<rect x="390" y="' + (yU - 44) + '" width="170" height="88" rx="16" class="box2"/>';
    s += '<text x="475" y="' + (yU - 8) + '" class="k2" text-anchor="middle">Unemployed U</text>';
    s += '<text x="475" y="' + (yU + 18) + '" class="big" text-anchor="middle">' + F(p.U0, 2) + "M</text>";
    s += '<path d="M210 ' + (yE - 26) + ' Q300 ' + (yE - 86) + ' 388 ' + (yU - 26) + '" class="c2" marker-end="url(#mah)"/>';
    s += '<text x="300" y="' + (yE - 66) + '" class="k2" text-anchor="middle">job losses s·E = ' + F(p.s, 3) + " × " + F(p.E0, 2) + " = " + F(p.s * p.E0, 3) + "M</text>";
    s += '<path d="M390 ' + (yU + 26) + ' Q300 ' + (yE + 86) + ' 212 ' + (yE + 26) + '" class="c3" marker-end="url(#mah)"/>';
    s += '<text x="300" y="' + (yE + 80) + '" class="k3" text-anchor="middle">job finding f·U = ' + F(p.f, 3) + " × " + F(p.U0, 2) + " = " + F(p.f * p.U0, 3) + "M</text>";
    if (hasNL) {
      s += '<rect x="215" y="222" width="170" height="56" rx="14" class="box"/>';
      s += '<text x="300" y="246" class="b" text-anchor="middle">Not in labor force</text>';
      s += '<text x="300" y="266" class="lb" text-anchor="middle">NL = ' + F(p.NL0, 2) + "M</text>";
      s += '<path d="M110 ' + (yE + 46) + ' Q120 240 213 246" class="c4" marker-end="url(#mah)"/>';
      s += '<text x="98" y="228" class="lb">exit q·E</text>';
      s += '<path d="M216 262 Q90 270 90 ' + (yE + 48) + '" class="c4 dash" marker-end="url(#mah)"/>';
      s += '<text x="40" y="290" class="lb">entry j·NL (straight into jobs)</text>';
    }
    var line1 = hid("uStar") ? "steady state: s·E = f·U ⇒ u* = s/(s + f) = ?"
      : "steady state: s·E = f·U ⇒ u* = s/(s + f) = " + F(p.s, 3) + "/" + F(p.s + p.f, 3) + " = " + pc(o.uStar);
    s += '<text x="300" y="' + (hasNL ? 26 : 28) + '" class="b" text-anchor="middle">' + line1 + "</text>";
    return { svg: CH.raw(600, 300, s, "worker flows"), cap: "Each month a share s of the employed lose jobs and a share f of the unemployed find one. When the two flows match, unemployment stops changing." };
  }

  function line(p, ghost, target, hide) {
    var T = 36;
    var path = ENGINE.flowsPath(p, T), o = solve(p);
    var series = [];
    if (ghost) series.push({ name: "before", pts: ENGINE.flowsPath(ghost, T).map(function (x) { return [x.t, x.u * 100]; }), cls: "c4 dash faint" });
    var hid = function (k) { return hide.indexOf(k) !== -1; };
    var shown = path.filter(function (x) { return !(hid("u1") && x.t >= 1) && !(hid("u2") && x.t >= 2); });
    series.push({ name: "unemployment rate u", pts: shown.map(function (x) { return [x.t, x.u * 100]; }), cls: "c1" });
    var marks = [];
    if (!hid("u1") && path.length > 1) marks.push({ x: 1, y: path[1].u * 100, label: "t=1: " + pc(path[1].u, 3), lcls: "b" });
    if (!hid("u2") && path.length > 2) marks.push({ x: 2, y: path[2].u * 100, label: "t=2: " + pc(path[2].u, 3), lcls: "b", dy: 16 });
    return CH.lineChart({ title: "Unemployment month by month", series: series, x: [0, T], xLabel: "month", yLabel: "u (%)",
      hlines: hid("uStar") ? [] : [{ y: o.uStar * 100, label: "u* = " + pc(o.uStar), lcls: "k2", cls: "c2 dash" }], marks: marks });
  }

  function bars(p, ghost, target, hide) {
    var o = solve(p);
    var rows = [{ label: "Labor force now", sub: F(o.L, 2) + "M", parts: [
      { name: "E", value: p.E0, cls: "solid3" }, { name: "U", value: p.U0, cls: "solid2" }] }];
    if (hide.indexOf("u2") === -1) rows.push({ label: "Month 2", sub: F(o.U2 + o.E2, 2) + "M", parts: [
      { name: "E", value: o.E2, cls: "solid3" }, { name: "U", value: o.U2, cls: "solid2" }] });
    if (hide.indexOf("uStar") === -1) rows.push({ label: "Steady state", sub: "u* = " + pc(o.uStar), parts: [
      { name: "E", value: 1 - o.uStar, cls: "solid3" }, { name: "U", value: o.uStar, cls: "solid2" }] });
    return CH.barChart({ title: "Employed and unemployed", share: true, rows: rows, fmt: function (v) { return F(v, 2); } });
  }

  MODELS.push({
    id: "flows", week: 4, title: "Unemployment flows",
    short: "Separations, job finding, and the natural rate u* = s/(s + f)",
    base: { s: 0.02, f: 0.28, U0: 1, E0: 14 },
    inputs: [
      { key: "s", label: "Separation rate s", min: 0.005, max: 0.1, step: 0.001 },
      { key: "f", label: "Job finding rate f", min: 0.05, max: 0.6, step: 0.01 },
      { key: "U0", label: "Unemployed now (M)", min: 0.2, max: 4, step: 0.01 },
      { key: "E0", label: "Employed now (M)", min: 5, max: 30, step: 0.1 },
    ],
    solve: solve,
    kpis: [
      { key: "u0", label: "u now", pct: true, d: 3 },
      { key: "u1", label: "u at t = 1", pct: true, d: 3 },
      { key: "u2", label: "u at t = 2", pct: true, d: 3 },
      { key: "uStar", label: "Steady state u*", pct: true, d: 2 },
      { key: "inflow", label: "Into U: s·E (M)", d: 3 },
      { key: "outflow", label: "Out of U: f·U (M)", d: 3 },
    ],
    graph: graph, line: line, bars: bars,
    lineTitle: "The path to the steady state", barsTitle: "The labor force split",
    forms: [
      { name: "Flows", html: "<i>U</i>(<i>t</i>+1) = (1 − <i>f</i>)<i>U</i>(<i>t</i>) + <i>s E</i>(<i>t</i>),  <i>E</i>(<i>t</i>+1) = (1 − <i>s</i>)<i>E</i>(<i>t</i>) + <i>f U</i>(<i>t</i>)",
        note: "U(t+1) uses employment from time t. Track people in millions, then divide by the labor force." },
      { name: "Steady state", html: "<i>s E</i> = <i>f U</i>,  <i>E</i> = <i>L</i> − <i>U</i>  ⇒  <i>U</i>/<i>L</i> = <i>s</i> / (<i>s</i> + <i>f</i>)",
        note: "s(L − U) = fU ⇒ sL = (s + f)U. Higher s or lower f raises the natural rate." },
      { name: "How fast the gap closes", html: "<i>U</i>(<i>t</i>+1) − <i>U</i>* = (1 − <i>s</i> − <i>f</i>)(<i>U</i>(<i>t</i>) − <i>U</i>*)",
        note: "With s + f = 0.30, 30% of the gap closes each month (fixed labor force)." },
      { name: "Violet's model (entry and exit)", html: "<i>NL</i>' = (1 − <i>j</i>)<i>NL</i> + <i>qE</i>;  <i>E</i>' = (1 − <i>s</i> − <i>q</i>)<i>E</i> + <i>fU</i> + <i>jNL</i>",
        note: "Steady state: jNL = qE, which cancels out of the E equation and leaves sE = fU. Same u*." },
    ],
    statics: {
      inputs: [{ key: "s", label: "Separation rate s up" }, { key: "f", label: "Job finding rate f up" }],
      outputs: [{ key: "uStar", label: "u*" }, { key: "u1", label: "u next month" }],
    },
    facts: {
      cold: [
        "Unemployment rate = U / labor force. Discouraged workers are not in the labor force.",
        "Steady state: s·E = f·U, so U/L = s/(s + f).",
        "Structural unemployment comes from wages above market-clearing (unions, minimum wages); frictional from time spent searching.",
        "Unemployment insurance replaces about 30–50% of income, usually for up to 26 weeks.",
      ],
      traps: [
        "Computing the rate with the old labor force. When the labor force grows, divide by the new L.",
        "Forgetting that U(t+1) uses E from time t.",
        "Calling a minimum wage or union wage frictional. They are structural.",
      ],
    },
    scenarios: [
      {
        id: "supers", title: "The Supers join the labor force", source: "Practice exam Part 2 Q2(a) · 10 pts",
        blurb: "s = 0.02, f = 0.28. u = 0.067 with L = 15 million. At t = 1, employment and the labor force each rise 1 million.",
        base: { s: 0.02, f: 0.28, U0: 1, E0: 14 },
        steps: [
          { say: "s = 0.02, f = 0.28. At t = 0 the unemployment rate is about <b>0.067</b> and the labor force is <b>15 million</b>.", hide: ["u1", "u2"],
            math: ["U = 0.067 × 15 ≈ <b>1 million</b>; E = <b>14 million</b>"] },
          { say: "At t = 1 the Supers arrive: employment and the labor force each rise by 1 million; unemployment doesn't change.",
            set: { shock: { t: 1, dE: 1 } }, predict: { kind: "num", q: "Unemployment rate at t = 1? (decimal)", key: "u1", tol: 0.0005 }, hide: ["u2"],
            math: ["E = 15M, U = 1M, L = <b>16M</b>", "u₁ = 1/16 = <b>0.0625</b>"] },
          { say: "Now run the flows one month.",
            predict: { kind: "num", q: "Unemployed at t = 2 (millions)?", key: "U2", tol: 0.0005 },
            math: ["U₂ = (1 − f)U₁ + sE₁ = 0.72(1) + 0.02(15) = <b>1.02M</b>", "E₂ = 0.98(15) + 0.28(1) = 14.98M (L still 16M)"] },
          { say: "Divide by the <b>new</b> labor force.",
            predict: { kind: "num", q: "Unemployment rate at t = 2? (decimal)", key: "u2", tol: 0.0005 }, hide: [],
            math: ["u₂ = 1.02 / 16 = <b>0.06375</b>"] },
          { say: "Where does it end up?",
            predict: { kind: "num", q: "Long-run unemployment rate (%)?", value: function (o) { return o.uStar * 100; }, tol: 0.002 },
            math: ["u* = s/(s + f) = 0.02/0.30 = <b>6.67%</b>: the rate drifts back up"],
            why: "The shock only moved where the economy started. The steady state depends on s and f alone." },
        ],
        exam: { pts: "10 points", lines: [
          "t = 0: U = 1M, E = 14M.  t = 1: L = 16M, u₁ = 1/16 = 0.0625.",
          "U₂ = 0.72(1) + 0.02(15) = 1.02M; u₂ = 1.02/16 = 0.06375.",
          "Trap: divide by the new labor force (16M), not 15M." ] },
      },
      {
        id: "violet", title: "Violet's model: entry and exit", source: "Practice exam Part 2 Q2(b) · 10 pts",
        blurb: "Add people outside the labor force who enter straight into jobs and leave from jobs. Does u* change?",
        base: { s: 0.02, f: 0.28, U0: 1, E0: 14, NL0: 5, j: 0.05, q: 0.01 },
        steps: [
          { say: "Violet adds a pool outside the labor force (NL). People enter directly into jobs at rate j and leave jobs at rate q.",
            math: ["NL(t+1) = (1 − j)NL(t) + qE(t)", "U(t+1) = (1 − f)U(t) + sE(t)", "E(t+1) = (1 − s − q)E(t) + fU(t) + jNL(t)"] },
          { say: "Steady state of the NL equation first.",
            math: ["NL = (1 − j)NL + qE ⇒ <b>jNL = qE</b>"] },
          { say: "Substitute into the employment equation.",
            predict: { kind: "choice", q: "Compared with the baseline s/(s + f), the steady-state unemployment rate is…",
                       choices: [{ id: "same", label: "The same" }, { id: "higher", label: "Higher" }, { id: "lower", label: "Lower" }], answer: "same" },
            math: ["E = (1 − s − q)E + fU + qE = (1 − s)E + fU", "⇒ <b>sE = fU</b>, the original condition", "U/L = <b>s/(s + f) = 6.67%</b>"],
            why: "Entry and exit cancel out of the employment equation and never touch unemployment." },
          { say: "Watch the simulated path: it still settles at 6.67%." },
        ],
        exam: { pts: "10 points", lines: [
          "Set each equation to its steady state; jNL = qE from the NL equation.",
          "Substitute into E: (1 − s)E + fU = E ⇒ sE = fU.",
          "Use E = L − U: u = s/(s + f), identical to the baseline." ] },
      },
      {
        id: "layoffs", title: "A wave of layoffs: s doubles", source: "Week 4 extra practice · 2008–09",
        blurb: "In the Great Recession layoffs spiked. What if the separation rate doubles from 0.02 to 0.04?",
        base: { s: 0.02, f: 0.28, U0: 1, E0: 14 },
        steps: [
          { say: "Start at the steady state: s = 0.02, f = 0.28, u* = 6.67%." },
          { say: "Layoffs double: <b>s = 0.04</b>.", set: { s: 0.04 },
            predict: { kind: "num", q: "New steady-state rate (%)?", value: function (o) { return o.uStar * 100; }, tol: 0.002 },
            math: ["u* = 0.04 / (0.04 + 0.28) = 0.04/0.32 = <b>12.5%</b>"],
            why: "Twice as many people flow in each month; it takes a bigger pool of unemployed for f·U to match." },
          { say: "How quickly does it get there?",
            predict: { kind: "dir", key: "u1", q: "Next month's unemployment rate, compared with today's 6.67%…", vs: "u0" },
            math: [function (o) { return "u₁ = " + pc(o.u1, 3) + ", then " + pc(o.u2, 3) + ", closing 32% of the gap each month"; }] },
        ],
        exam: { pts: "Practice", lines: ["u* = 0.04/0.32 = 12.5%. A higher separation rate raises the natural rate."] },
      },
      {
        id: "ui", title: "Longer searches: f halves", source: "Practice Q12 · unemployment insurance",
        blurb: "Generous unemployment insurance lets people search longer. Suppose the job finding rate falls from 0.28 to 0.14.",
        base: { s: 0.02, f: 0.28, U0: 1, E0: 14 },
        steps: [
          { say: "UI replaces about 30–50% of income for up to 26 weeks while a worker searches. Start at u* = 6.67%." },
          { say: "Searches get longer: <b>f = 0.14</b>.", set: { f: 0.14 },
            predict: { kind: "num", q: "New steady-state rate (%)?", value: function (o) { return o.uStar * 100; }, tol: 0.002 },
            math: ["u* = 0.02 / (0.02 + 0.14) = 0.02/0.16 = <b>12.5%</b>"] },
          { say: "Better job-matching services push f up to <b>0.38</b> instead.", set: { f: 0.38 },
            predict: { kind: "dir", key: "uStar", q: "Compared with the original 6.67%, u*…", from: "base" },
            math: ["u* = 0.02/0.40 = <b>5%</b>"],
            why: "Anything that speeds matching lowers frictional unemployment. The trade-off: UI also supports consumption and allows better matches." },
        ],
        exam: { pts: "Short answer", lines: [
          "UI: funded by taxes on employers (and employees); replaces about 30–50% of income, usually up to 26 weeks.",
          "Lower f ⇒ higher u* = s/(s + f)." ] },
      },
    ],
  });
})();
