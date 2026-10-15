// ECON 380 · Intermediate Micro Theory: the class's card and practice graphs,
// added to the shared library (tools/graphs.js) with its drawing helpers.
//
// The numbers match the cards' running examples:
//   consumer   U = x^0.5 y^0.5, I = 100, px = 2, py = 5 → (25, 10); px → 8
//   production Q = K^0.5 L^0.5, w = 4, r = 1, Q = 20 → L = 10, K = 40
//   costs      TC = 32 + q³ − 6q² + 20q: min AVC 11 at q = 3, min ATC 20 at q = 4
//   market     P = 100 − 2Q, P = 10 + Q → Q = 30, P = 40; $6 tax; $34 ceiling
//   monopoly   P = 100 − 2Q, MC = 20 → Q = 20, P = 60
//   games      pricing PD; coordination game; Cournot P = 120 − Q, MC = 0
//
// Plain ES5 on purpose: pasted into the page as-is (no backticks or "${").
(function () {
  var K = window.GRAPHKIT, G = window.GRAPHS;
  var svg = K.svg, t = K.t, ln = K.ln, dot = K.dot, rect = K.rect, curve = K.curve, area = K.area,
    plot = K.plot, scale = K.scale, axes = K.axes, vguide = K.vguide, hguide = K.hguide;
  var X0 = K.X0, Y0 = K.Y0, X1 = K.X1, Y1 = K.Y1;

  /** base with a subscript, then (optionally) more text back on the baseline. */
  function sb(base, s, rest) {
    return base + '<tspan dy="3" font-size="8.5">' + s + '</tspan>' + (rest ? '<tspan dy="-3">' + rest + '</tspan>' : '');
  }
  /** Axes for a panel with its own box (for side-by-side diagrams). */
  function panelAxes(x0, y0, x1, y1, xl, yl) {
    return ln(x0, y1 - 4, x0, y0, 'ax') + ln(x0, y0, x1 + 4, y0, 'ax') +
      t(x1 + 2, y0 + 15, xl, 'it', 'end') + t(x0 + 6, y1 + 2, yl, 'it', 'start');
  }
  /** Two short slashes on the vertical axis: it doesn't start at zero. */
  function brk(x, y) {
    return ln(x - 5, y + 3, x + 5, y - 1, 'c4') + ln(x - 5, y + 7, x + 5, y + 3, 'c4');
  }

  // ---------------------------------------------------------- consumer


  /** Labels a curve just past its right end, on the curve's own height. */
  function endLabel(x, y, s, cls) { return t(x + 4, y + 4, s, cls, 'start'); }
  /** A two-headed arrow between two points. */
  function both(x1, y1, x2, y2) { return curve([[x1, y1], [x2, y2]], 'c4', true) + curve([[x2, y2], [x1, y1]], 'c4', true); }

  G.econ380Budget = function (a) {
    var mode = a.mode || 'opt';
    var o, cap, sx, sy;
    var ic = function (u) { return function (x) { return u * u / x; }; };
    if (mode === 'income') {
      sx = scale(0, 112, X0, X1); sy = scale(0, 44, Y0, Y1);
      o = axes('x', 'y');
      o += ln(sx(0), sy(20), sx(50), sy(0), 'c4') + ln(sx(0), sy(40), sx(100), sy(0), 'c4');
      o += t(X0 - 5, sy(20) + 4, '20', 'lb', 'end') + t(X0 - 5, sy(40) + 4, '40', 'lb', 'end');
      o += t(sx(50), Y0 + 14, '50', 'lb', 'middle') + t(sx(100), Y0 + 14, '100', 'lb', 'middle');
      o += curve(plot(ic(Math.sqrt(250)), 250 / 42, 92, sx, sy, 90), 'c1 faint');
      o += curve(plot(ic(Math.sqrt(1000)), 1000 / 43, 92, sx, sy, 90), 'c1');
      o += endLabel(sx(92), sy(250 / 92), 'U = 15.8', 'lb') + endLabel(sx(92), sy(1000 / 92) - 3, 'U = 31.6', 'k1');
      o += ln(sx(0), sy(0), sx(105), sy(42), 'c2 dash');
      o += t(sx(103), sy(42) - 6, 'expansion path y = 0.4x', 'k2', 'end');
      o += dot(sx(25), sy(10)) + dot(sx(50), sy(20));
      o += t(sx(25) + 6, sy(10) + 13, 'A', 'b') + t(sx(50) + 6, sy(20) + 13, 'B', 'b');
      cap = 'Cobb–Douglas: income doubles from 100 to 200 (budget lines with intercepts 20, 50 and 40, 100) and both goods double, from A (25, 10) to B (50, 20). The optima lie on a ray through the origin: the budget shares never change.';
      return { svg: svg(o), cap: cap };
    }
    var top = mode === 'mrs' ? 32 : mode === 'ic' ? 30 : 26;
    sx = scale(0, 62, X0, X1); sy = scale(0, top, Y0, Y1);
    o = axes('x', 'y');
    if (mode === 'mrs') {
      o += curve(plot(ic(Math.sqrt(250)), 250 / top, 48, sx, sy, 90), 'c1');
      o += endLabel(sx(48), sy(250 / 48), 'U = 15.8', 'k1');
      // tangents: slope −y/x
      o += ln(sx(10 - 3.2), sy(25 + 8), sx(10 + 4), sy(25 - 10), 'c2');
      o += ln(sx(25 - 12), sy(10 + 4.8), sx(25 + 14), sy(10 - 5.6), 'c2');
      o += dot(sx(10), sy(25)) + dot(sx(25), sy(10));
      o += t(sx(10) + 9, sy(25) - 2, 'MRS = 25/10 = 2.5', 'k2');
      o += t(sx(25) + 8, sy(10) - 12, 'MRS = 10/25 = 0.4', 'k2');
      cap = 'The MRS is the slope of the indifference curve (ignoring the sign). For U = x<sup>0.5</sup>y<sup>0.5</sup> it is y/x: steep where x is scarce, flat where x is plentiful. That is diminishing MRS.';
      return { svg: svg(o), cap: cap };
    }
    var curves = [[10, 'U = 10'], [Math.sqrt(250), mode === 'ic' ? 'U = 15.8' : 'U* = 15.8'], [20, 'U = 20']];
    curves.forEach(function (u, k) {
      o += curve(plot(ic(u[0]), u[0] * u[0] / top, 50, sx, sy, 90), k === 1 ? 'c1' : 'c1 faint');
      o += endLabel(sx(50), sy(u[0] * u[0] / 50), u[1], k === 1 ? 'k1' : 'lb');
    });
    if (mode === 'ic') {
      o += ln(sx(10), sy(25), sx(40), sy(6.25), 'c4 dash');
      o += dot(sx(10), sy(25)) + dot(sx(40), sy(6.25)) + dot(sx(25), sy(15.625), 'solid2');
      o += t(sx(10) - 6, sy(25) + 4, 'A', 'b', 'end') + t(sx(40) - 2, sy(6.25) - 8, 'B', 'b', 'end');
      o += t(sx(25) + 7, sy(15.625) - 5, 'average of A and B', 'k2');
      o += curve([[sx(3), sy(2)], [sx(9), sy(8)]], 'c4', true);
      cap = 'Higher curves are better (monotone: the arrow). A (10, 25) and B (40, 6.25) are equally good, but their average (25, 15.6) lies on a higher curve: convex preferences. Curves never cross (transitivity).';
      return { svg: svg(o), cap: cap };
    }
    o += ln(sx(0), sy(20), sx(50), sy(0), 'c2');
    o += t(sx(1.5), sy(20) - 6, 'budget', 'k2');
    o += vguide(sx(25), sy(10), 'x* = 25', 'k1') + hguide(sx(25), sy(10), '10', 'k1');
    o += t(X0 - 5, sy(20) + 4, '20', 'lb', 'end') + t(sx(50), Y0 + 14, '50', 'lb', 'middle');
    o += dot(sx(25), sy(10));
    cap = 'Budget 2x + 5y = 100 (slope −0.4). The best affordable bundle is (25, 10): the indifference curve touches the budget line, so MRS = y/x = 0.4 = p<sub>x</sub>/p<sub>y</sub>. U = 20 is out of reach; U = 10 wastes money.';
    return { svg: svg(o), cap: cap };
  };

  G.econ380PriceEffects = function () {
    var sx = scale(0, 62, X0, X1), sy = scale(0, 42, Y0, Y1);
    var ic = function (k) { return function (x) { return k / x; }; };
    var o = axes('x', 'y');
    o += ln(sx(0), sy(20), sx(50), sy(0), 'c4 faint');
    o += ln(sx(0), sy(20), sx(12.5), sy(0), 'c4');
    o += ln(sx(0), sy(40), sx(25), sy(0), 'c4 dash');
    o += t(X0 - 5, sy(20) + 4, '20', 'lb', 'end') + t(X0 - 5, sy(40) + 4, '40', 'lb', 'end');
    o += curve(plot(ic(250), 250 / 41, 50, sx, sy, 90), 'c1');
    o += curve(plot(ic(62.5), 62.5 / 41, 50, sx, sy, 90), 'c1 faint');
    o += endLabel(sx(50), sy(5), 'U₀ = 15.8', 'k1') + endLabel(sx(50), sy(1.25) - 2, 'U₁ = 7.9', 'lb');
    o += dot(sx(25), sy(10)) + dot(sx(12.5), sy(20)) + dot(sx(6.25), sy(10));
    o += t(sx(25) + 6, sy(10) - 5, 'A', 'b') + t(sx(12.5) + 6, sy(20) - 4, 'B', 'b') + t(sx(6.25) - 5, sy(10) - 6, 'C', 'b', 'end');
    o += ln(sx(25), sy(10), sx(25), Y0, 'c4 dash faint') + ln(sx(12.5), sy(20), sx(12.5), Y0, 'c4 dash faint') + ln(sx(6.25), sy(10), sx(6.25), Y0, 'c4 dash faint');
    o += t(sx(6.25), Y0 + 14, '6.25', 'lb', 'middle') + t(sx(12.5), Y0 + 14, '12.5', 'lb', 'middle') + t(sx(25), Y0 + 14, '25', 'lb', 'middle');
    o += curve([[sx(25), Y0 + 26], [sx(12.5) + 3, Y0 + 26]], 'c4', true) + t(sx(25) + 5, Y0 + 30, 'substitution −12.5', 'k2');
    o += curve([[sx(12.5), Y0 + 42], [sx(6.25) + 3, Y0 + 42]], 'c4', true) + t(sx(12.5) + 5, Y0 + 46, 'income −6.25', 'k3');
    return { svg: svg(o, 236), cap: 'p<sub>x</sub> rises 2 → 8: the budget line pivots in (solid grey). A → B, along the old indifference curve at the new price ratio (dashed compensated line), is the substitution effect; B → C is the income effect. Total: 25 → 6.25.' };
  };

  G.econ380Demand = function () {
    var sx = scale(0, 55, X0, X1), sy = scale(0, 10, Y0, Y1);
    var o = axes('x', 'pₓ');
    var marsh = [], hick = [];
    for (var k = 0; k <= 80; k++) {
      var p = 1.2 + (9.6 - 1.2) * k / 80;
      marsh.push([sx(50 / p), sy(p)]);
      hick.push([sx(Math.sqrt(1250 / p)), sy(p)]);
    }
    o += curve(marsh, 'c1') + curve(hick, 'c2');
    o += endLabel(sx(50 / 1.2), sy(1.2), 'x(p, I)', 'k1');
    o += t(sx(Math.sqrt(1250 / 9.6)) + 5, sy(9.6) + 4, 'h(p, U₀)', 'k2');
    o += dot(sx(25), sy(2)) + dot(sx(12.5), sy(8)) + dot(sx(6.25), sy(8));
    o += hguide(sx(12.5), sy(8), '8') + hguide(sx(25), sy(2), '2');
    o += vguide(sx(6.25), sy(8), '6.25', 'k1') + vguide(sx(12.5), sy(8), '12.5', 'k2') + vguide(sx(25), sy(2), '25');
    o += t(sx(25) + 6, sy(2) - 7, 'A', 'b');
    return { svg: svg(o), cap: 'Ordinary (Marshallian, blue) and compensated (Hicksian, orange) demand both pass through A. At p<sub>x</sub> = 8 compensated demand falls only to 12.5 (substitution); ordinary demand falls to 6.25 (plus the income effect). x is normal, so the Hicksian curve is steeper.' };
  };

  G.econ380Engel = function () {
    var sx = scale(0, 10, X0, X1), sy = scale(0, 10, Y0, Y1);
    var o = axes('income I', 'quantity');
    var lux = function (i) { return 0.115 * i * i; }, unit = function (i) { return 0.8 * i; },
      nec = function (i) { return 3.2 * Math.sqrt(i); }, inf = function (i) { return 1.6 * i - 0.2 * i * i; };
    o += curve(plot(lux, 0, 8, sx, sy), 'c2') + curve(plot(unit, 0, 8, sx, sy), 'c1');
    o += curve(plot(nec, 0, 8, sx, sy), 'c3') + curve(plot(inf, 0, 7.5, sx, sy), 'c4');
    o += endLabel(sx(8), sy(nec(8)), 'necessity', 'k3') + endLabel(sx(8), sy(lux(8)), 'luxury', 'k2');
    o += endLabel(sx(8), sy(unit(8)), 'unit', 'k1') + endLabel(sx(7.5), sy(inf(7.5)), 'inferior', 'b');
    o += ln(sx(4), sy(3.2), sx(4), Y0, 'c4 dash faint') + t(sx(4), Y0 + 14, 'turns inferior', 'lb', 'middle');
    o += dot(sx(4), sy(3.2), 'solid4');
    return { svg: svg(o), cap: 'Engel curves: quantity against income. Necessity: 0 &lt; η &lt; 1; unit: η = 1 (Cobb–Douglas, x = I/4 in the running example); luxury: η &gt; 1. The grey good is normal at low incomes and inferior (η &lt; 0) past the peak. A Giffen good is an inferior good with a large budget share.' };
  };

  G.econ380Elasticity = function () {
    var sx = scale(0, 52, X0, X1), sy = scale(0, 105, Y0, Y1);
    var o = axes('Q', 'P');
    o += ln(sx(0), sy(100), sx(25), sy(50), 'c2') + ln(sx(25), sy(50), sx(50), sy(0), 'c1');
    o += t(sx(15), sy(86), 'elastic: |ε| > 1', 'k2');
    o += t(sx(36), sy(44), 'inelastic: |ε| < 1', 'k1');
    o += dot(sx(20), sy(60)) + t(sx(19), sy(52), '|ε| = 1.5', 'b', 'end');
    o += dot(sx(25), sy(50)) + t(sx(26.5), sy(52), '|ε| = 1', 'b');
    o += dot(sx(30), sy(40)) + t(sx(28.5), sy(33), '|ε| = 0.67', 'b', 'end');
    o += t(X0 - 5, sy(100) + 4, '100', 'lb', 'end');
    return { svg: svg(o), cap: 'Demand P = 100 − 2Q: one straight line, many elasticities, |ε| = (1/2)(P/Q). Above the midpoint (25, 50) a price cut raises revenue; below it, revenue falls. Revenue peaks at 1,250 where |ε| = 1.' };
  };

  // --------------------------------------------------------- production

  G.econ380Isoquant = function (a) {
    var mode = a.mode || 'opt';
    var o, sx, sy;
    if (mode === 'scale') {
      sx = scale(0, 46, X0, X1); sy = scale(0, 100, Y0, Y1);
      o = axes('L', 'K');
      o += curve(plot(function (l) { return 400 / l; }, 4, 38, sx, sy, 90), 'c1 faint');
      o += curve(plot(function (l) { return 1600 / l; }, 16, 38, sx, sy, 90), 'c1');
      o += endLabel(sx(38), sy(400 / 38), 'Q = 20', 'k1') + endLabel(sx(38), sy(1600 / 38), 'Q = 40', 'k1');
      o += ln(sx(0), sy(0), sx(25), sy(100), 'c4 dash');
      o += t(sx(16.5), sy(70), 'ray K = 4L', 'lb', 'end');
      o += dot(sx(10), sy(40)) + dot(sx(20), sy(80));
      o += t(sx(10) + 6, sy(40) + 2, '(10, 40)', 'b') + t(sx(20) + 6, sy(80) + 2, '(20, 80)', 'b');
      return { svg: svg(o), cap: 'Q = K<sup>0.5</sup>L<sup>0.5</sup>: doubling both inputs, (10, 40) → (20, 80), moves from the Q = 20 isoquant to Q = 40. Output doubles too: constant returns to scale.' };
    }
    sx = scale(0, 34, X0, X1); sy = scale(0, 85, Y0, Y1);
    o = axes('L', 'K');
    o += curve(plot(function (l) { return 400 / l; }, 400 / 84, 28, sx, sy, 90), 'c1');
    o += endLabel(sx(28), sy(400 / 28), 'Q = 20', 'k1');
    if (mode === 'mrts') {
      o += ln(sx(10 - 4), sy(40 + 16), sx(10 + 5), sy(40 - 20), 'c2');
      o += ln(sx(20 - 8), sy(20 + 8), sx(20 + 7), sy(20 - 7), 'c2');
      o += dot(sx(10), sy(40)) + dot(sx(20), sy(20));
      o += t(sx(11.5), sy(46), 'MRTS = 40/10 = 4', 'k2');
      o += t(sx(19), sy(9), 'MRTS = 20/20 = 1', 'k2', 'end');
      return { svg: svg(o), cap: 'The slope of the isoquant is the MRTS = MP<sub>L</sub>/MP<sub>K</sub> = K/L. With lots of capital per worker, one more worker replaces 4 units of K; with less capital, only 1.' };
    }
    o += ln(sx(0), sy(80), sx(20), sy(0), 'c2');
    o += t(sx(20) + 4, Y0 - 6, 'isocost 4L + K = 80', 'k2');
    o += vguide(sx(10), sy(40), 'L* = 10', 'k1') + hguide(sx(10), sy(40), '40', 'k1');
    o += t(X0 - 5, sy(80) + 4, '80', 'lb', 'end');
    o += dot(sx(10), sy(40));
    o += dot(sx(20), sy(20), 'solid4') + t(sx(21), sy(28), '(20, 20) costs $100', 'lb');
    return { svg: svg(o), cap: 'Cheapest way to make 20 units: the lowest isocost line (slope −w/r = −4) that touches the isoquant, at L = 10, K = 40, where MRTS = K/L = 4 = w/r. Cost $80.' };
  };

  // the running firm: TC = 32 + q³ − 6q² + 20q
  var MC = function (q) { return 3 * q * q - 12 * q + 20; };
  var AVC = function (q) { return q * q - 6 * q + 20; };
  var ATC = function (q) { return AVC(q) + 32 / q; };

  G.econ380Costs = function (a) {
    var shut = a.mode === 'shutdown';
    var sx = scale(0, 7, X0, X1), sy = scale(0, 60, Y0, Y1);
    var o = axes('q', '$');
    o += curve(plot(ATC, 0.75, 6.3, sx, sy), 'c1') + curve(plot(AVC, 0, 6.3, sx, sy), 'c1 faint');
    o += endLabel(sx(6.3), sy(ATC(6.3)), 'ATC', 'k1') + endLabel(sx(6.3), sy(AVC(6.3)) + 2, 'AVC', 'k1');
    if (shut) {
      o += curve(plot(MC, 0.5, 3, sx, sy), 'c2 faint') + curve(plot(MC, 3, 6, sx, sy), 'c3');
      o += endLabel(sx(6), sy(MC(6)), 'supply', 'k3');
      o += ln(X0, sy(20), X1, sy(20), 'c4 dash faint') + ln(X0, sy(11), X1, sy(11), 'c4 dash faint');
      o += t(X0 - 5, sy(20) + 4, '20', 'lb', 'end') + t(X0 - 5, sy(11) + 4, '11', 'lb', 'end');
      o += t(X0 + 4, sy(20) - 5, 'break-even', 'lb') + t(X0 + 4, sy(11) + 12, 'shutdown', 'lb');
      o += hguide(sx(5), sy(35), '35') + vguide(sx(5), sy(35), '5');
      o += dot(sx(3), sy(11)) + dot(sx(4), sy(20)) + dot(sx(5), sy(35));
      o += t(sx(3), Y0 + 14, '3', 'lb', 'middle') + t(sx(4), Y0 + 14, '4', 'lb', 'middle');
      return { svg: svg(o), cap: 'The firm supplies along MC above min AVC = 11 (green). At P = 35 it makes q = 5 and a profit of 68. Between 11 and 20 it loses money, but less than its fixed cost of 32; below 11 it shuts down.' };
    }
    o += curve(plot(MC, 0.5, 6, sx, sy), 'c2') + endLabel(sx(6), sy(MC(6)), 'MC', 'k2');
    o += dot(sx(3), sy(11)) + dot(sx(4), sy(20));
    o += vguide(sx(3), sy(11), '3') + vguide(sx(4), sy(20), '4') + hguide(sx(3), sy(11), '11') + hguide(sx(4), sy(20), '20');
    return { svg: svg(o), cap: 'TC = 32 + q³ − 6q² + 20q. MC (orange) cuts AVC at its minimum (3, 11) and ATC at its minimum (4, 20). The gap between ATC and AVC is average fixed cost, 32/q, which shrinks as q grows.' };
  };

  G.econ380LongRun = function () {
    // left: the firm; right: the market
    var fx = scale(0, 7, 42, 148), fy = scale(0, 50, Y0, Y1);
    var mx = scale(0, 1000, 194, 304), my = fy;
    var o = panelAxes(42, Y0, 148, Y1, 'q', '$') + panelAxes(194, Y0, 304, Y1, 'Q', 'P');
    o += curve(plot(MC, 0.6, 5, fx, fy), 'c2') + curve(plot(ATC, 0.9, 6.4, fx, fy), 'c1');
    o += t(fx(5) - 5, fy(MC(5)) + 4, 'MC', 'k2', 'end') + t(fx(6.4) + 3, fy(ATC(6.4)) + 4, 'ATC', 'k1');
    o += ln(42, fy(20), 148, fy(20), 'c4 dash') + dot(fx(4), fy(20));
    o += ln(fx(4), fy(20), fx(4), Y0, 'c4 dash faint') + t(fx(4), Y0 + 14, 'q = 4', 'k1', 'middle');
    o += t(37, fy(20) + 4, '20', 'lb', 'end');
    o += t(95, Y0 + 28, 'one firm', 'lb', 'middle');
    o += ln(mx(0), my(50), mx(1000), my(0), 'c1') + t(mx(1000), my(0) - 6, 'D', 'k1', 'end');
    o += ln(194, my(20), 304, my(20), 'c3') + t(198, my(20) + 14, 'LR supply', 'k3');
    o += dot(mx(600), my(20)) + ln(mx(600), my(20), mx(600), Y0, 'c4 dash faint') + t(mx(600), Y0 + 14, '600', 'k1', 'middle');
    o += t(249, Y0 + 28, 'market: 150 firms', 'lb', 'middle');
    return { svg: svg(o, 214), cap: 'Long run: entry and exit set P = min ATC = 20. Each firm makes q = 4 at zero profit; demand Q = 1,000 − 20P decides how many firms there are (600 / 4 = 150).' };
  };

  // ------------------------------------------------------------ markets

  var Dm = function (q) { return 100 - 2 * q; }, Sm = function (q) { return 10 + q; };

  G.econ380Surplus = function () {
    var sx = scale(0, 52, X0, X1), sy = scale(0, 105, Y0, Y1);
    var o = axes('Q', 'P');
    o += area([[sx(0), sy(100)], [sx(30), sy(40)], [sx(0), sy(40)]], 'fill1');
    o += area([[sx(0), sy(40)], [sx(30), sy(40)], [sx(0), sy(10)]], 'fill3');
    o += curve(plot(Dm, 0, 50, sx, sy), 'c1') + curve(plot(Sm, 0, 52, sx, sy), 'c3');
    o += t(sx(50), Y0 - 6, 'D', 'k1', 'end') + t(sx(52), sy(62) - 8, 'S', 'k3', 'end');
    o += t(sx(9), sy(52), 'CS = 900', 'k1', 'middle') + t(sx(9), sy(33), 'PS = 450', 'k3', 'middle');
    o += vguide(sx(30), sy(40), 'Q* = 30') + hguide(sx(30), sy(40), '40');
    o += t(X0 - 5, sy(100) + 4, '100', 'lb', 'end') + t(X0 - 5, sy(10) + 4, '10', 'lb', 'end');
    o += dot(sx(30), sy(40));
    return { svg: svg(o), cap: 'Demand P = 100 − 2Q, supply P = 10 + Q. Consumer surplus (blue) lies under demand and above the price; producer surplus (green) above supply and below it. Total surplus at the equilibrium, 1,350, is the most possible.' };
  };

  G.econ380Tax = function (a) {
    var inc = a.mode === 'incidence';
    var sx = scale(0, 40, X0, X1), sy = scale(25, 55, Y0, Y1);
    var o = axes('Q', 'P') + brk(X0, Y0 - 14);
    o += rect(sx(0), sy(44), sx(28) - sx(0), sy(38) - sy(44), 'fill2', 0);
    o += area([[sx(28), sy(44)], [sx(28), sy(38)], [sx(30), sy(40)]], 'fill1');
    o += curve(plot(Dm, 22.5, 37.5, sx, sy), 'c1') + curve(plot(Sm, 15, 40, sx, sy), 'c3');
    o += curve(plot(function (q) { return Sm(q) + 6; }, 9, 39, sx, sy), 'c3 dash');
    o += t(sx(22.5) + 6, sy(55) + 10, 'D', 'k1');
    o += t(sx(40), sy(50) + 14, 'S', 'k3', 'end') + t(sx(37.5), sy(55) + 10, 'S + $6', 'k3', 'end');
    o += hguide(sx(28), sy(44), '44', 'k1') + hguide(sx(28), sy(38), '38', 'k3');
    o += ln(sx(28), sy(38), sx(28), Y0, 'c4 dash faint') + ln(sx(30), sy(40), sx(30), Y0, 'c4 dash faint');
    o += t(sx(28) - 2, Y0 + 14, '28', 'lb', 'end') + t(sx(30) + 2, Y0 + 14, '30', 'lb', 'start');
    o += dot(sx(28), sy(44)) + dot(sx(28), sy(38)) + dot(sx(30), sy(40), 'solid4');
    o += t(sx(13), sy(41) + 4, 'revenue 6 × 28 = 168', 'k2', 'middle');
    if (inc) {
      o += curve([[sx(33), sy(40)], [sx(33), sy(43.8)]], 'c4', true) + t(sx(33) + 5, sy(42) + 4, 'buyers +4', 'k1');
      o += curve([[sx(33), sy(40)], [sx(33), sy(38.2)]], 'c4', true) + t(sx(33) + 5, sy(37.5) + 6, 'sellers −2', 'k3');
      return { svg: svg(o), cap: 'The $6 wedge: buyers pay 44 (up 4 from 40), sellers keep 38 (down 2). Demand is the less elastic side here, so buyers bear two-thirds, whoever writes the check.' };
    }
    o += t(sx(23.5), sy(27.5), 'DWL = 6', 'k1') + ln(sx(27), sy(30), sx(28.6), sy(39.3), 'c4');
    return { svg: svg(o), cap: 'A $6 tax (the market was at Q = 30, P = 40): quantity falls to 28. The orange rectangle is revenue, a transfer to government; the blue triangle is the deadweight loss, ½ × 6 × 2 = 6, from the 2 units no longer traded.' };
  };

  G.econ380Ceiling = function () {
    var sx = scale(0, 52, X0, X1), sy = scale(0, 105, Y0, Y1);
    var o = axes('Q', 'P');
    o += area([[sx(24), sy(52)], [sx(24), sy(34)], [sx(30), sy(40)]], 'fill2');
    o += curve(plot(Dm, 0, 50, sx, sy), 'c1') + curve(plot(Sm, 0, 52, sx, sy), 'c3');
    o += t(sx(50), Y0 - 6, 'D', 'k1', 'end') + t(sx(52), sy(62) - 8, 'S', 'k3', 'end');
    o += ln(X0, sy(34), X1, sy(34), 'c2') + t(X1, sy(34) + 13, 'ceiling $34', 'k2', 'end');
    o += dot(sx(24), sy(34)) + dot(sx(33), sy(34)) + dot(sx(30), sy(40), 'solid4');
    o += ln(sx(24), sy(52), sx(24), Y0, 'c4 dash faint') + ln(sx(33), sy(34), sx(33), Y0, 'c4 dash faint');
    o += t(sx(24) - 2, Y0 + 14, sb('Q', 'S', ' = 24'), 'lb', 'end') + t(sx(33) + 2, Y0 + 14, sb('Q', 'D', ' = 33'), 'lb', 'start');
    o += both(sx(24) + 3, sy(22), sx(33) - 3, sy(22));
    o += t(sx(28.5), sy(22) + 13, 'shortage 9', 'b', 'middle');
    o += hguide(sx(24), sy(52), '52') + dot(sx(24), sy(52), 'solid4') + t(X0 - 5, sy(34) + 4, '34', 'lb', 'end');
    o += t(sx(22.5), sy(43), 'DWL = 54', 'k2', 'end') + ln(sx(22.6), sy(42), sx(25.5), sy(42), 'c4');
    return { svg: svg(o), cap: 'A $34 ceiling (equilibrium $40): sellers offer 24, buyers want 33. The 6 lost units were worth up to $52 to buyers but cost only $34 or more to make: DWL = ½ × 6 × 18 = 54.' };
  };

  G.econ380Edgeworth = function (a) {
    var L = 78, R = 248, T = 18, B = 188;      // the box, 10 × 10
    var sx = scale(0, 10, L, R), sy = scale(0, 10, B, T);
    var o = rect(L, T, R - L, B - T, 'box', 0);
    o += ln(sx(0), sy(0), sx(10), sy(10), 'c3 dash');
    var cx = sx(2.4) - 4, cy = sy(2.4) - 4;
    o += '<text x="' + K.r(cx) + '" y="' + K.r(cy) + '" class="k3" text-anchor="middle" transform="rotate(-45 ' + K.r(cx) + ' ' + K.r(cy) + ')">contract curve</text>';
    var iA = function (k) { return plot(function (x) { return k / x; }, k / 10, 10, sx, sy, 70); };
    var iB = function (k) { return plot(function (x) { return 10 - k / (10 - x); }, 0, 10 - k / 10, sx, sy, 70); };
    o += curve(iA(16), 'c1') + curve(iB(16), 'c2');
    o += curve(iA(25), 'c1 faint') + curve(iB(25), 'c2 faint');
    if (a.mode === 'ce') o += ln(sx(10), sy(0), sx(0), sy(10), 'c4');
    o += dot(sx(8), sy(2)) + t(sx(8) - 6, sy(2) + 14, 'E', 'b', 'end');
    o += dot(sx(5), sy(5)) + t(sx(6), sy(9.2), a.mode === 'ce' ? 'CE (5, 5)' : '(5, 5)', 'b') + ln(sx(6.3), sy(8.9), sx(5.15), sy(5.35), 'c4 faint');
    o += t(L - 4, B + 12, sb('O', 'A'), 'b', 'end') + t(R + 4, T - 4, sb('O', 'B'), 'b', 'start');
    o += t(R, B + 14, sb('x', 'A', ' →'), 'it', 'end') + t(L - 6, T + 10, sb('y', 'A', ' ↑'), 'it', 'end');
    o += t(L, T - 5, sb('← x', 'B'), 'it', 'start') + t(R + 6, T + 22, sb('y', 'B', ' ↓'), 'it', 'start');
    o += t(R + 6, sy(1.6) + 4, sb('U', 'A'), 'k1') + t(L - 6, sy(8.4) + 4, sb('U', 'B'), 'k2', 'end');
    var cap = a.mode === 'ce'
      ? 'Two people, 10 of each good. At prices 1 : 1 the budget line (black) runs through the endowment E (8, 2); both choose (5, 5), where it is tangent to both indifference curves. The competitive equilibrium is on the contract curve.'
      : 'Two people, 10 of each good; A starts at E (8, 2). Through E, A’s (blue) and B’s (orange) indifference curves cross: the lens between them holds trades both prefer. Efficient points, where the curves are tangent, form the contract curve.';
    return { svg: svg(o, 212), cap: cap };
  };

  // ---------------------------------------------------------- monopoly

  G.econ380Monopoly = function (a) {
    var lerner = a.mode === 'lerner';
    var sx = scale(0, 52, X0, X1), sy = scale(0, 105, Y0, Y1);
    var o = axes('Q', '$');
    if (!lerner) {
      o += rect(sx(0), sy(60), sx(20) - sx(0), sy(20) - sy(60), 'fill1', 0);
      o += area([[sx(20), sy(60)], [sx(20), sy(20)], [sx(40), sy(20)]], 'fill2');
    }
    o += curve(plot(Dm, 0, 50, sx, sy), 'c1') + curve(plot(function (q) { return 100 - 4 * q; }, 0, 25, sx, sy), 'c1 dash');
    o += ln(X0, sy(20), X1, sy(20), 'c2');
    o += t(sx(50), Y0 - 6, 'D', 'k1', 'end') + t(sx(25) + 4, Y0 - 6, 'MR', 'k1');
    o += t(X1, sy(20) - 6, 'MC = 20', 'k2', 'end');
    o += dot(sx(20), sy(20)) + dot(sx(20), sy(60));
    o += vguide(sx(20), sy(60), '20') + hguide(sx(20), sy(60), '60', 'k1') + t(X0 - 5, sy(20) + 4, '20', 'lb', 'end');
    if (lerner) {
      o += both(sx(22), sy(21.5), sx(22), sy(58.5));
      o += t(sx(30), sy(88), 'P − MC = 40', 'k2');
      o += t(sx(30), sy(88) + 14, 'L = 40/60 = 2/3', 'b');
      o += t(sx(30), sy(88) + 28, '|ε| = 1.5 here', 'k1');
      o += ln(sx(29.5), sy(68), sx(22.8), sy(45), 'c4 faint');
      return { svg: svg(o), cap: 'At the monopoly point (20, 60), |ε| = (1/2)(60/20) = 1.5 and the markup is (P − MC)/P = 2/3 = 1/|ε|. The monopolist is on the elastic part of demand.' };
    }
    o += t(sx(6), sy(40), 'profit 800', 'k1', 'middle');
    o += t(sx(26), sy(31), 'DWL 400', 'k2', 'middle');
    o += vguide(sx(40), sy(20), '40') + dot(sx(40), sy(20), 'solid4');
    return { svg: svg(o), cap: 'Demand P = 100 − 2Q, MR = 100 − 4Q (dashed). MR = MC at Q = 20; the price comes from the demand curve, 60. Blue: profit (60 − 20) × 20 = 800. Orange: the deadweight loss of the units competition (Q = 40) would have sold.' };
  };

  G.econ380PriceDisc = function () {
    var ax = scale(0, 50, 42, 160), bx = scale(0, 50, 190, 308), sy = scale(0, 105, Y0, Y1);
    var o = panelAxes(42, Y0, 160, Y1, 'Q', '$') + panelAxes(190, Y0, 308, Y1, 'Q', '$');
    // adults
    o += ln(ax(0), sy(100), ax(50), sy(0), 'c1') + ln(ax(0), sy(100), ax(25), sy(0), 'c1 dash');
    o += ln(42, sy(20), 160, sy(20), 'c2');
    o += dot(ax(20), sy(60)) + ln(ax(20), sy(60), ax(20), Y0, 'c4 dash faint') + ln(42, sy(60), ax(20), sy(60), 'c4 dash faint');
    o += t(ax(20) + 5, sy(60) - 5, '(20, 60)', 'b');
    o += t(101, Y1 + 4, 'Adults', 'b', 'middle') + t(ax(50), Y0 + 14, 'D₁', 'k1', 'middle') + t(ax(25), Y0 + 14, 'MR₁', 'k1', 'middle');
    // students
    o += ln(bx(0), sy(60), bx(30), sy(0), 'c1') + ln(bx(0), sy(60), bx(15), sy(0), 'c1 dash');
    o += ln(190, sy(20), 308, sy(20), 'c2') + t(308, sy(20) - 5, 'MC = 20', 'k2', 'end');
    o += dot(bx(10), sy(40)) + ln(bx(10), sy(40), bx(10), Y0, 'c4 dash faint') + ln(190, sy(40), bx(10), sy(40), 'c4 dash faint');
    o += t(bx(10) + 5, sy(40) - 5, '(10, 40)', 'b');
    o += t(249, Y1 + 4, 'Students', 'b', 'middle') + t(bx(30), Y0 + 14, 'D₂', 'k1', 'middle') + t(bx(15), Y0 + 14, 'MR₂', 'k1', 'middle');
    o += t(37, sy(20) + 4, '20', 'lb', 'end') + t(37, sy(60) + 4, '60', 'lb', 'end');
    return { svg: svg(o, 200), cap: 'Third-degree discrimination: MR = MC = 20 in each market. Adults (P = 100 − 2Q; |ε| = 1.5 at the optimum) pay 60; students (P = 60 − 2Q; |ε| = 2, more elastic) pay 40.' };
  };

  // ------------------------------------------------------------- games

  G.econ380Matrix = function (a) {
    var game = a.game || 'pd';
    var g = game === 'coord'
      ? { rows: ['X', 'Y'], cols: ['X', 'Y'], A: [[2, 0], [0, 1]], B: [[2, 0], [0, 1]], p1: 'Player 1', p2: 'Player 2' }
      : { rows: ['High', 'Low'], cols: ['High', 'Low'], A: [[10, 2], [12, 5]], B: [[10, 12], [2, 5]], p1: 'Firm A', p2: 'Firm B' };
    var x0 = 112, y0 = 50, cw = 92, ch = 52;
    var o = t(x0 + cw, 16, g.p2, 'k2', 'middle');
    o += t(18, y0 + ch + 4, g.p1, 'k1', 'start');
    for (var j = 0; j < 2; j++) o += t(x0 + cw * j + cw / 2, y0 - 10, g.cols[j], 'b', 'middle');
    for (var i = 0; i < 2; i++) {
      o += t(x0 - 8, y0 + ch * i + ch / 2 + 4, g.rows[i], 'b', 'end');
      for (j = 0; j < 2; j++) {
        var rBR = g.A[i][j] === Math.max(g.A[0][j], g.A[1][j]);
        var cBR = g.B[i][j] === Math.max(g.B[i][0], g.B[i][1]);
        var x = x0 + cw * j, y = y0 + ch * i;
        o += rect(x, y, cw, ch, rBR && cBR ? 'box3' : 'box', 0);
        if (a.show === 'coop' && i === 0 && j === 0) o += rect(x + 4, y + 4, cw - 8, ch - 8, 'c4 dash', 4);
        var cx = x + cw / 2, cy = y + ch / 2 + 5;
        o += t(cx - 6, cy, String(g.A[i][j]), rBR ? 'k1' : 'lb', 'end') + t(cx, cy, ',', 'lb', 'middle') + t(cx + 6, cy, String(g.B[i][j]), cBR ? 'k2' : 'lb', 'start');
        if (rBR) o += ln(cx - 22, cy + 4, cx - 6, cy + 4, 'c1');
        if (cBR) o += ln(cx + 6, cy + 4, cx + 22, cy + 4, 'c2');
      }
    }
    var note = game === 'coord' ? 'two equilibria: (X, X) and (Y, Y)' : 'Nash equilibrium: (Low, Low)';
    o += t(x0 + cw, y0 + 2 * ch + 22, note, 'k3', 'middle');
    if (a.show === 'coop') o += t(x0 + cw, y0 + 2 * ch + 38, 'dashed: (High, High) is better for both', 'lb', 'middle');
    var cap = game === 'coord'
      ? 'Underlined payoffs are best responses (blue for player 1, orange for player 2). Green cells, where both are best responses, are Nash equilibria. No player has a dominant strategy here.'
      : 'Payoffs (A, B) in $m. Underlined = best response. Low is best for A in both columns and for B in both rows: a dominant strategy. The green cell is the equilibrium.';
    return { svg: svg(o, a.show === 'coop' ? 206 : 190), cap: cap };
  };


  G.econ380Cournot = function () {
    var sx = scale(0, 132, X0, X1), sy = scale(0, 128, Y0, Y1);
    var o = axes('q₁', 'q₂');
    o += ln(sx(60), sy(0), sx(0), sy(120), 'c1') + ln(sx(0), sy(60), sx(120), sy(0), 'c2');
    o += t(sx(9), sy(112), 'firm 1: q₁ = (120 − q₂)/2', 'k1');
    o += t(sx(122), sy(34), 'firm 2: q₂ = (120 − q₁)/2', 'k2', 'end');
    o += dot(sx(40), sy(40)) + t(sx(46), sy(45), 'Cournot (40, 40)', 'b');
    o += dot(sx(30), sy(30), 'solid4') + t(sx(27), sy(22), 'collusion', 'lb', 'end');
    o += t(X0 - 5, sy(60) + 4, '60', 'lb', 'end') + t(X0 - 5, sy(120) + 4, '120', 'lb', 'end');
    o += t(sx(60), Y0 + 14, '60', 'lb', 'middle') + t(sx(120), Y0 + 14, '120', 'lb', 'middle');
    return { svg: svg(o), cap: 'P = 120 − Q, MC = 0. The best-response lines cross at (40, 40): Q = 80, P = 40. Splitting monopoly output, (30, 30), would pay each more, but each firm’s best response to 30 is 45.' };
  };

  G.econ380Outcomes = function () {
    var sx = scale(0, 128, X0, X1), sy = scale(0, 128, Y0, Y1);
    var o = axes('Q', 'P');
    o += ln(sx(0), sy(120), sx(120), sy(0), 'c1') + t(sx(4), sy(100), 'D', 'k1');
    o += t(X0 + 4, Y0 - 5, 'MC = 0', 'k2');
    o += dot(sx(60), sy(60)) + t(sx(62), sy(60) - 7, 'monopoly', 'b');
    o += dot(sx(80), sy(40)) + t(sx(82), sy(40) - 7, 'Cournot', 'b');
    o += dot(sx(120), sy(0)) + t(sx(120) + 2, Y0 + 14, 'Bertrand', 'b', 'end');
    o += hguide(sx(60), sy(60), '60') + hguide(sx(80), sy(40), '40') + t(X0 - 5, sy(120) + 4, '120', 'lb', 'end');
    o += t(sx(60), Y0 + 14, '60', 'lb', 'middle') + t(sx(80), Y0 + 14, '80', 'lb', 'middle');
    return { svg: svg(o), cap: 'Same demand P = 120 − Q and MC = 0, three market structures. Monopoly (60, 60); Cournot (80, 40) lies between monopoly and competition; Bertrand price-cutting with identical goods drives P to MC (120, 0).' };
  };
})();
