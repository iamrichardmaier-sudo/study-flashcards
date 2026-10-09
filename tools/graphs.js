// ECON 381 card graphs.
//
// Each entry returns { svg, cap } for one card's "Graph" section. Drawn as
// inline SVG from code rather than shipped as images, so they take the
// card's week colour (via CSS classes in the page), stay sharp at any size
// and keep the whole deck in one pasteable file.
//
// Plain ES5-ish code on purpose: this file is pasted into the review page's
// <script> as-is, so it must not use backticks or "${".
(function () {
  var W = 320, H = 210;
  var X0 = 42, Y0 = 178, X1 = 304, Y1 = 16;   // plot box: origin bottom-left

  function svg(inner, h) {
    return '<svg viewBox="0 0 ' + W + ' ' + (h || H) + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M0 0L10 5L0 10z" fill="#2B2118" opacity=".7"/></marker></defs>' + inner + '</svg>';
  }
  function t(x, y, s, cls, anchor) {
    return '<text x="' + r(x) + '" y="' + r(y) + '"' + (cls ? ' class="' + cls + '"' : '') +
      (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + s + '</text>';
  }
  function ln(x1, y1, x2, y2, cls, arrow) {
    return '<line x1="' + r(x1) + '" y1="' + r(y1) + '" x2="' + r(x2) + '" y2="' + r(y2) + '" class="' + (cls || 'c4') + '"' +
      (arrow ? ' marker-end="url(#ah)"' : '') + '/>';
  }
  function dot(x, y, cls) { return '<circle cx="' + r(x) + '" cy="' + r(y) + '" r="3.6" class="' + (cls || 'dot') + '"/>'; }
  function rect(x, y, w, h, cls, rx) {
    return '<rect x="' + r(x) + '" y="' + r(y) + '" width="' + r(w) + '" height="' + r(h) + '" rx="' + (rx == null ? 3 : rx) + '" class="' + cls + '"/>';
  }
  function r(v) { return Math.round(v * 10) / 10; }
  function pathD(pts) {
    return pts.map(function (p, k) { return (k ? 'L' : 'M') + r(p[0]) + ' ' + r(p[1]); }).join('');
  }
  function curve(pts, cls, arrow) {
    return '<path d="' + pathD(pts) + '" class="' + cls + '"' + (arrow ? ' marker-end="url(#ah)"' : '') + '/>';
  }
  function area(pts, cls) { return '<path d="' + pathD(pts) + 'Z" class="' + cls + '"/>'; }
  /** Samples f over [a,b] in data units and maps it into the plot box. */
  function plot(f, a, b, sx, sy, n) {
    var pts = [];
    n = n || 60;
    for (var k = 0; k <= n; k++) {
      var x = a + (b - a) * k / n;
      pts.push([sx(x), sy(f(x))]);
    }
    return pts;
  }
  function scale(d0, d1, p0, p1) { return function (v) { return p0 + (v - d0) * (p1 - p0) / (d1 - d0); }; }
  function axes(xl, yl) {
    return ln(X0, Y1 - 4, X0, Y0, 'ax') + ln(X0, Y0, X1 + 4, Y0, 'ax') +
      t(X1 + 2, Y0 + 15, xl, 'it', 'end') + t(X0 + 6, Y1 + 2, yl, 'it', 'start');
  }
  function vguide(x, y, label, cls) {
    return ln(x, y, x, Y0, 'c4 dash faint') + (label ? t(x, Y0 + 14, label, cls || 'it', 'middle') : '');
  }
  function hguide(x, y, label, cls) {
    return ln(X0, y, x, y, 'c4 dash faint') + (label ? t(X0 - 5, y + 4, label, cls || 'it', 'end') : '');
  }

  var G = {};

  // ------------------------------------------------------------ week 1

  G.businessCycle = function () {
    var sx = scale(0, 10, X0, X1), sy = scale(0, 10, Y0, Y1);
    var trend = function (x) { return 2 + 0.62 * x; };
    var act = function (x) { return trend(x) + 1.1 * Math.sin(x * 1.25) - (x > 5.6 && x < 7.6 ? 0.9 * Math.sin((x - 5.6) * Math.PI / 2) : 0); };
    var o = axes('time', 'real GDP');
    o += rect(sx(5.55), Y1, sx(7.1) - sx(5.55), Y0 - Y1, 'fill2', 0);
    o += t((sx(5.55) + sx(7.1)) / 2, Y1 + 12, 'recession', 'k2', 'middle');
    o += curve(plot(trend, 0, 10, sx, sy), 'c4 dash');
    o += curve(plot(act, 0, 10, sx, sy, 120), 'c1');
    o += t(sx(9.9), sy(trend(9.9)) + 16, 'trend', 'lb', 'end');
    o += t(sx(1.9), sy(act(1.3)) - 8, 'actual', 'k1', 'middle');
    return { svg: svg(o), cap: 'Output falls below its trend; the shaded stretch is the recession. Rule of thumb: two quarters of falling real GDP.' };
  };

  G.circularFlow = function () {
    var o = '';
    o += rect(18, 78, 92, 50, 'box1', 12) + t(64, 108, 'Households', 'b', 'middle');
    o += rect(210, 78, 92, 50, 'box2', 12) + t(256, 108, 'Firms', 'b', 'middle');
    o += curve([[64, 74], [64, 30], [256, 30], [256, 72]], 'c1', true);
    o += t(160, 24, 'Spending ($) = expenditure', 'k1', 'middle');
    o += curve([[256, 132], [256, 178], [64, 178], [64, 134]], 'c2', true);
    o += t(160, 194, 'Wages, rent, profit ($) = income', 'k2', 'middle');
    o += curve([[240, 72], [240, 48], [80, 48], [80, 72]], 'c4 dash', true);
    o += t(160, 62, 'goods & services', 'lb', 'middle');
    o += curve([[80, 134], [80, 158], [240, 158], [240, 134]], 'c4 dash', true);
    o += t(160, 152, 'labor & capital', 'lb', 'middle');
    return { svg: svg(o, 205), cap: 'The same dollars measured three ways: what is spent, what is earned, what is produced. All three equal GDP.' };
  };

  G.gdpShares = function (a) {
    var rows = [['C', 'Consumption', 68], ['I', 'Investment', 18], ['G', 'Government', 17], ['NX', 'Net exports', -3]];
    var sx = scale(-10, 75, 92, 300);
    var o = ln(sx(0), 14, sx(0), 186, 'c4');
    rows.forEach(function (row, k) {
      var y = 22 + k * 42;
      var on = !a.hi || a.hi === row[0];
      var x0 = Math.min(sx(0), sx(row[2])), w = Math.abs(sx(row[2]) - sx(0));
      o += rect(x0, y, w, 26, on ? 'solid1' : 'solid4', 5);
      o += t(84, y + 12, row[0], 'b', 'end') + t(84, y + 24, row[1], 'lb', 'end');
      // A negative bar's label goes on the positive side of the zero line, so
      // it never runs into the row's name.
      o += t(row[2] < 0 ? sx(0) + 5 : x0 + w + 4, y + 17, (row[2] > 0 ? '' : '−') + Math.abs(row[2]) + '%', on ? 'k1' : 'lb', 'start');
    });
    return { svg: svg(o, 190), cap: 'Approximate shares of US GDP, 2025 (BEA). Net exports are negative: the US imports more than it exports.' };
  };

  G.stockFlow = function () {
    var o = '';
    o += curve([[96, 40], [96, 22], [150, 22]], 'c4');
    o += rect(140, 16, 22, 12, 'box', 3);
    o += curve([[151, 28], [151, 70]], 'c1', true);
    o += t(160, 52, 'inflow per hour = FLOW', 'k1');
    o += '<path d="M70 70 L84 176 Q86 184 96 184 L224 184 Q234 184 236 176 L250 70" class="c4"/>';
    o += area([[77, 118], [84, 176], [90, 182], [230, 182], [236, 176], [243, 118]], 'fill1');
    o += ln(77, 118, 243, 118, 'c1');
    o += t(160, 156, 'water in the tub = STOCK', 'k1', 'middle');
    o += t(160, 170, '(measured at a moment)', 'lb', 'middle');
    o += curve([[236, 176], [266, 196]], 'c2', true);
    o += t(268, 192, 'outflow', 'k2');
    return { svg: svg(o, 205), cap: 'Investment (a flow) fills the capital stock; depreciation drains it. GDP is a flow, wealth is a stock.' };
  };

  G.valueAdded = function () {
    var steps = [['Farmer', 'wheat', 1, 1], ['Miller', 'flour', 3, 2], ['Baker', 'bread', 5, 2]];
    var o = '';
    var sy = scale(0, 5, 170, 30);
    steps.forEach(function (s, k) {
      var x = 30 + k * 98;
      o += rect(x, sy(s[2]), 70, sy(0) - sy(s[2]), 'solid4', 5);
      o += rect(x, sy(s[2]), 70, sy(0) - sy(s[3]), 'solid1', 5);
      o += t(x + 35, sy(s[2]) - 6, '$' + s[2] + ' ' + s[1], 'b', 'middle');
      o += t(x + 35, 186, s[0], 'lb', 'middle');
      o += t(x + 35, sy(s[2]) + 16, '+' + s[3], 'w', 'middle');
    });
    o += t(300, 22, 'GDP = $5', 'k1', 'end');
    return { svg: svg(o, 196), cap: 'Blue = value added at each stage ($1 + $2 + $2 = $5), which equals the final sale. Adding the full sales ($9) would double count.' };
  };

  G.indexBias = function () {
    var sx = scale(0, 10, X0, X1), sy = scale(100, 132, Y0, Y1);
    var o = axes('years from base', 'index');
    o += curve(plot(function (x) { return 100 + 2.9 * x; }, 0, 10, sx, sy), 'c2');
    o += curve(plot(function (x) { return 100 + 2.6 * x; }, 0, 10, sx, sy), 'c4 dash');
    o += curve(plot(function (x) { return 100 + 2.3 * x; }, 0, 10, sx, sy), 'c1');
    o += t(sx(10), sy(129) - 6, 'Laspeyres (CPI)', 'k2', 'end');
    o += t(sx(10), sy(126) - 6, 'true cost of living', 'lb', 'end');
    o += t(sx(10), sy(123) + 14, 'Paasche (deflator)', 'k1', 'end');
    o += t(X0 - 6, sy(100) + 4, '100', 'lb', 'end');
    return { svg: svg(o), cap: 'Stylised. The fixed basket ignores switching to cheaper goods, so it runs high; the current basket gives too little weight to what got dearer, so it runs low.' };
  };

  G.cpiHistory = function () {
    var d = [[2019, 1.8], [2020, 1.2], [2021, 4.7], [2022, 8.0], [2023, 4.1], [2024, 2.9]];
    var sx = scale(2018.4, 2024.6, X0, X1), sy = scale(0, 9, Y0, Y1);
    var o = axes('', '%');
    [2, 4, 6, 8].forEach(function (v) { o += ln(X0, sy(v), X1, sy(v), 'grid') + t(X0 - 5, sy(v) + 4, v, 'lb', 'end'); });
    d.forEach(function (p) {
      o += rect(sx(p[0]) - 15, sy(p[1]), 30, Y0 - sy(p[1]), p[0] === 2022 ? 'solid2' : 'solid1', 4);
      o += t(sx(p[0]), sy(p[1]) - 5, p[1].toFixed(1), p[0] === 2022 ? 'k2' : 'lb', 'middle');
      o += t(sx(p[0]), Y0 + 14, String(p[0]), 'lb', 'middle');
    });
    return { svg: svg(o, 200), cap: 'US CPI-U inflation, annual average (BLS). 2022 was the highest since 1981.' };
  };

  G.laborForceTree = function () {
    var o = '';
    o += rect(95, 8, 130, 34, 'box', 10) + t(160, 24, 'Adult population', 'b', 'middle') + t(160, 36, '16+, not institutionalised', 'lb', 'middle');
    o += curve([[160, 42], [160, 54], [82, 54], [82, 66]], 'c4', true);
    o += curve([[160, 54], [240, 54], [240, 66]], 'c4', true);
    o += rect(14, 68, 136, 30, 'box1', 10) + t(82, 87, 'Labor force  L', 'k1', 'middle');
    o += rect(170, 68, 140, 30, 'box', 10) + t(240, 87, 'Not in labor force', 'b', 'middle');
    o += curve([[50, 98], [50, 112]], 'c4', true) + curve([[114, 98], [114, 112]], 'c4', true);
    o += rect(14, 114, 70, 46, 'box3', 10) + t(49, 133, 'Employed', 'k3', 'middle') + t(49, 148, 'E', 'it', 'middle');
    o += rect(88, 114, 62, 46, 'box2', 10) + t(119, 133, 'Unem-', 'k2', 'middle') + t(119, 146, 'ployed  U', 'k2', 'middle');
    o += rect(170, 114, 140, 46, 'box', 10) + t(240, 131, 'retirees, students,', 'lb', 'middle') + t(240, 145, 'homemakers,', 'lb', 'middle') + t(240, 156, 'discouraged workers', 'k2', 'middle');
    o += t(82, 182, 'u = U ⁄ (E + U)', 'it', 'middle');
    o += t(240, 182, 'LFPR = L ⁄ adult pop.', 'it', 'middle');
    return { svg: svg(o, 192), cap: 'A discouraged worker who stops searching moves from U to "not in the labor force": the unemployment rate falls though nothing improved.' };
  };

  // ------------------------------------------------------------ week 2

  G.production = function (a) {
    var v = a.x || 'L';
    var sx = scale(0, 10, X0, X1), sy = scale(0, 10, Y0, Y1);
    var f = function (x) { return 3 * Math.pow(x, 0.5); };
    var o = axes(v, 'Y');
    o += curve(plot(f, 0, 10, sx, sy, 80), 'c1');
    [2.2, 7].forEach(function (x0) {
      var m = 1.5 / Math.sqrt(x0);
      o += ln(sx(x0 - 1.6), sy(f(x0) - 1.6 * m), sx(x0 + 1.6), sy(f(x0) + 1.6 * m), 'c2');
      o += dot(sx(x0), sy(f(x0)));
    });
    o += t(sx(2.2) + 4, sy(f(2.2)) + 18, 'steep: high MP' + v, 'k2');
    o += t(sx(7) + 2, sy(f(7)) + 20, 'flatter: low MP' + v, 'k2');
    o += t(sx(9.8), sy(f(9.8)) - 8, 'Y = F(K, L)', 'k1', 'end');
    return { svg: svg(o), cap: 'Holding the other input fixed, each extra unit of ' + v + ' adds less output: diminishing marginal product. The slope is MP' + v + '.' };
  };

  G.factorMarket = function (a) {
    var cap = a.kind === 'capital';
    var v = cap ? 'K' : 'L', price = cap ? 'R/P' : 'W/P', mp = cap ? 'MPK' : 'MPL';
    var sx = scale(0, 10, X0, X1), sy = scale(0, 10, Y0, Y1);
    var d = function (x) { return 9.4 / (0.55 + 0.32 * x); };
    var o = axes(v, price);
    o += curve(plot(d, 1.4, 10, sx, sy), 'c1');
    o += ln(sx(5.5), Y1, sx(5.5), Y0, 'c2');
    o += t(sx(5.5) + 4, Y1 + 10, cap ? 'K̅ supply' : 'L̅ supply', 'k2');
    o += hguide(sx(5.5), sy(d(5.5)), price + '*', 'k1');
    o += dot(sx(5.5), sy(d(5.5)));
    o += t(sx(9.9), sy(d(9.9)) - 8, mp + ' = demand', 'k1', 'end');
    return { svg: svg(o), cap: 'Firms hire ' + v + ' until ' + mp + ' = ' + price + '. With the supply fixed, the ' + mp + ' at that quantity sets the real ' + (cap ? 'rental price' : 'wage') + '.' };
  };

  G.incomeSplit = function (a) {
    var alpha = a.alpha || 1 / 3;
    var cx = 108, cy = 98, R = 76, rr = 44;
    function arc(a0, a1, cls) {
      var p = function (ang, rad) { return [cx + rad * Math.sin(ang), cy - rad * Math.cos(ang)]; };
      var A = p(a0, R), B = p(a1, R), C = p(a1, rr), D = p(a0, rr);
      var big = a1 - a0 > Math.PI ? 1 : 0;
      return '<path class="' + cls + '" d="M' + r(A[0]) + ' ' + r(A[1]) + 'A' + R + ' ' + R + ' 0 ' + big + ' 1 ' + r(B[0]) + ' ' + r(B[1]) +
        'L' + r(C[0]) + ' ' + r(C[1]) + 'A' + rr + ' ' + rr + ' 0 ' + big + ' 0 ' + r(D[0]) + ' ' + r(D[1]) + 'Z"/>';
    }
    var cut = 2 * Math.PI * (1 - alpha);
    var o = arc(0, cut, 'solid1') + arc(cut, 2 * Math.PI - 0.0001, 'solid2');
    o += t(cx, cy + 4, 'Y', 'it b', 'middle');
    o += rect(208, 64, 14, 14, 'solid1', 3) + t(228, 75, 'Labor  1 − α', 'k1');
    o += t(228, 89, '≈ ' + Math.round((1 - alpha) * 100) + '% = WL/PY', 'lb');
    o += rect(208, 108, 14, 14, 'solid2', 3) + t(228, 119, 'Capital  α', 'k2');
    o += t(228, 133, '≈ ' + Math.round(alpha * 100) + '% = RK/PY', 'lb');
    return { svg: svg(o, 186), cap: 'With Cobb-Douglas and competitive markets the pie is split in fixed shares, and the two slices use up all of output.' };
  };

  G.laborShareShift = function () {
    var sx = scale(0, 10, X0, X1), sy = scale(50, 66, Y0, Y1);
    var o = axes('time', 'labor share %');
    o += curve(plot(function (x) { return 63.5 - 0.15 * Math.sin(x * 2.2) - (x > 5 ? 0.9 * (x - 5) : 0); }, 0, 10, sx, sy, 80), 'c1');
    o += hguide(sx(5), sy(63.4), '', '');
    o += t(sx(2.3), sy(64.6), 'roughly flat: Kaldor fact', 'lb', 'middle');
    o += t(sx(9.6), sy(58.6) + 6, 'falls since ~2000', 'k1', 'end');
    o += t(sx(9.6), sy(55) + 4, 'automation, offshoring,', 'lb', 'end');
    o += t(sx(9.6), sy(55) + 16, 'rising markups', 'lb', 'end');
    return { svg: svg(o), cap: 'Stylised. Cobb-Douglas says the share should be constant; the data show a decline, which is why the course asks you for explanations.' };
  };

  G.consumption = function () {
    var sx = scale(0, 10, X0, X1), sy = scale(0, 10, Y0, Y1);
    var o = axes('Y − T', 'C');
    o += curve(plot(function (x) { return x; }, 0, 10, sx, sy), 'c4 dash faint');
    o += curve(plot(function (x) { return 2 + 0.6 * x; }, 0, 10, sx, sy), 'c1');
    o += ln(sx(4), sy(4.4), sx(6.5), sy(4.4), 'c2') + ln(sx(6.5), sy(4.4), sx(6.5), sy(5.9), 'c2');
    o += t(sx(5.25), sy(4.4) + 14, '+$1', 'k2', 'middle') + t(sx(6.5) + 4, sy(5.15) + 4, '+$MPC', 'k2');
    o += t(sx(9.8), sy(7.9) - 8, 'C = C(Y − T)', 'k1', 'end');
    o += t(sx(9.8), sy(9.8) - 6, '45°', 'lb', 'end');
    return { svg: svg(o), cap: 'The slope of the consumption function is the MPC, between 0 and 1: of each extra dollar of disposable income, part is spent and the rest is saved.' };
  };

  G.investment = function () {
    var sx = scale(0, 10, X0, X1), sy = scale(0, 10, Y0, Y1);
    var o = axes('I', 'r');
    var f = function (x) { return 9.5 - 0.85 * x; };
    o += curve(plot(f, 0.5, 10, sx, sy), 'c1');
    o += dot(sx(3), sy(f(3))) + dot(sx(6.5), sy(f(6.5)));
    o += hguide(sx(3), sy(f(3)), 'r₁') + vguide(sx(3), sy(f(3)), 'I₁');
    o += hguide(sx(6.5), sy(f(6.5)), 'r₂') + vguide(sx(6.5), sy(f(6.5)), 'I₂');
    o += t(sx(9.8), sy(f(9.8)) - 8, 'I(r)', 'k1', 'end');
    return { svg: svg(o), cap: 'A higher real interest rate raises the cost of borrowing (or the return given up), so fewer projects pay off and investment falls.' };
  };

  G.loanableFunds = function (a) {
    var sx = scale(0, 10, X0, X1), sy = scale(0, 10, Y0, Y1);
    var f = function (x) { return 9.5 - 0.85 * x; };
    var o = axes('S, I', 'r');
    o += curve(plot(f, 0.5, 10, sx, sy), 'c1');
    o += t(sx(9.8), sy(f(9.8)) - 8, 'I(r)', 'k1', 'end');
    var s1 = 5.5;
    if (!a.shift) {
      o += ln(sx(s1), Y1, sx(s1), Y0, 'c2') + t(sx(s1) + 4, Y1 + 10, 'S = Y̅ − C − G', 'k2');
      o += dot(sx(s1), sy(f(s1))) + hguide(sx(s1), sy(f(s1)), 'r*', 'k1');
      return { svg: svg(o), cap: 'Saving does not depend on r here, so the supply of loanable funds is vertical. The real interest rate moves until investment demand equals it.' };
    }
    var s2 = a.shift === 'left' ? 3.6 : 7.2;
    o += ln(sx(s1), Y1, sx(s1), Y0, 'c2 faint') + t(sx(s1) + 3, Y1 + 10, 'S₁', 'k2');
    o += ln(sx(s2), Y1, sx(s2), Y0, 'c2') + t(sx(s2) + 3, Y1 + 10, 'S₂', 'k2');
    o += curve([[sx(s1) - 2, sy(8.9)], [sx(s2) + (s2 < s1 ? 6 : -6), sy(8.9)]], 'c4', true);
    o += dot(sx(s1), sy(f(s1)), 'solid4') + dot(sx(s2), sy(f(s2)));
    o += hguide(sx(s1), sy(f(s1)), 'r₁') + hguide(sx(s2), sy(f(s2)), 'r₂', 'k1');
    var cap = a.shift === 'left'
      ? (a.cap || 'G rises (or T falls): public saving falls, S shifts left, r rises and investment falls by the same amount. That is crowding out.')
      : (a.cap || 'T rises: public saving rises by ΔT, private saving falls by MPC·ΔT, so S shifts right by (1 − MPC)ΔT; r falls and investment rises.');
    return { svg: svg(o), cap: cap };
  };

  // ------------------------------------------------------------ week 3

  G.hyperinflation = function () {
    var d = [['1914', 4.2], ['Jan 20', 65], ['Jul 22', 493], ['Jan 23', 17972], ['Jul 23', 353412], ['Sep 23', 9.89e7], ['Nov 23', 4.2e12]];
    var sx = scale(0, d.length - 1, X0 + 16, X1 - 6), sy = scale(0, 13, Y0, Y1);
    var o = axes('', 'marks per $ (log)');
    [0, 3, 6, 9, 12].forEach(function (p) {
      o += ln(X0, sy(p), X1, sy(p), 'grid') + t(X0 - 5, sy(p) + 4, p === 0 ? '1' : '10' + '<tspan dy="-5" font-size="8">' + p + '</tspan>', 'lb', 'end');
    });
    var pts = d.map(function (p, k) { return [sx(k), sy(Math.log(p[1]) / Math.LN10)]; });
    o += curve(pts, 'c2');
    pts.forEach(function (p, k) { o += dot(p[0], p[1], 'solid2') + t(p[0], Y0 + 14, d[k][0], 'lb', 'middle'); });
    o += t(pts[6][0] - 6, pts[6][1] + 4, '4.2 trillion', 'k2', 'end');
    return { svg: svg(o, 200), cap: 'German paper marks per US dollar. From 4.2 in 1914 to 4.2 trillion in November 1923: prices rose by roughly a trillion times.' };
  };

  G.moneyAggregates = function () {
    var o = '';
    o += t(16, 30, 'Monetary base', 'b') + t(16, 42, '(the Fed controls)', 'lb');
    o += rect(120, 18, 70, 30, 'solid1', 6) + t(155, 37, 'currency', 'w', 'middle');
    o += rect(192, 18, 110, 30, 'box1', 6) + t(247, 37, 'bank reserves', 'k1', 'middle');
    o += t(16, 92, 'M1', 'b') + t(16, 104, '(spendable money)', 'lb');
    o += rect(120, 80, 70, 30, 'solid1', 6) + t(155, 99, 'currency', 'w', 'middle');
    o += rect(192, 80, 54, 30, 'box3', 6) + t(219, 93, 'check-', 'k3', 'middle') + t(219, 104, 'able', 'k3', 'middle');
    o += rect(248, 80, 54, 30, 'box2', 6) + t(275, 93, 'savings', 'k2', 'middle') + t(275, 104, 'since ’20', 'k2', 'middle');
    o += t(16, 152, 'M2', 'b') + t(16, 164, '= M1 + small time', 'lb') + t(16, 175, 'deposits + money funds', 'lb');
    o += rect(120, 142, 182, 30, 'box', 6) + t(211, 161, 'broader still', 'lb', 'middle');
    o += curve([[155, 50], [155, 76]], 'c4 dash', true);
    return { svg: svg(o, 190), cap: 'Currency is in both. Reserves are in the base but not in M1; deposits are in M1 but not in the base. So the base is NOT "all currency and deposits".' };
  };

  G.quantityTheory = function () {
    var sx = scale(0, 30, X0, X1), sy = scale(0, 30, Y0, Y1);
    var pts = [[2, 1.5], [4, 2.8], [5, 4.2], [7, 5.1], [8, 7.5], [10, 8.2], [12, 10.5], [14, 13.6], [17, 15], [19, 18.5], [22, 19.6], [25, 24.1], [28, 26.5], [3, 3.6], [6, 3.4], [9, 6.2], [15, 12.4]];
    var o = axes('money growth %ΔM', 'π %');
    o += curve(plot(function (x) { return x - 2.5; }, 2.5, 30, sx, sy), 'c4 dash');
    pts.forEach(function (p) { o += dot(sx(p[0]), sy(p[1]), 'solid1'); });
    o += t(sx(29), sy(26.5) - 12, 'π = %ΔM − %ΔY', 'k1', 'end');
    return { svg: svg(o), cap: 'Stylised cross-country picture: countries with faster money growth have higher inflation, about one for one, shifted down by real growth.' };
  };

  G.moneyDemand = function () {
    var sx = scale(0, 10, X0, X1), sy = scale(0, 10, Y0, Y1);
    var f = function (x) { return 9.6 / (0.5 + 0.3 * x) - 0.7; };
    var o = axes('M/P', 'i');
    o += curve(plot(f, 1.5, 10, sx, sy), 'c1');
    o += ln(sx(5), Y1, sx(5), Y0, 'c2') + t(sx(5) + 4, Y1 + 10, '(M/P)ˢ', 'k2');
    o += dot(sx(5), sy(f(5))) + hguide(sx(5), sy(f(5)), 'i*', 'k1');
    o += t(sx(9.8), sy(f(9.8)) - 8, 'L(i, Y)', 'k1', 'end');
    return { svg: svg(o), cap: 'Money pays no interest, so a higher nominal rate means you hold less of it: you spend it faster, and velocity rises.' };
  };

  G.fisher = function () {
    var o = '';
    var sy = scale(0, 8, 168, 20);
    function bar(x, rr, pi, label) {
      var s = rect(x, sy(rr), 64, sy(0) - sy(rr), 'solid3', 4);
      s += rect(x, sy(rr + pi), 64, sy(rr) - sy(rr + pi), 'solid2', 4);
      s += t(x + 32, sy(rr / 2) + 4, 'r = ' + rr, 'w', 'middle');
      s += t(x + 32, sy(rr + pi / 2) + 4, 'π = ' + pi, 'w', 'middle');
      s += t(x + 32, sy(rr + pi) - 6, 'i = ' + (rr + pi) + '%', 'b', 'middle');
      s += t(x + 32, 184, label, 'lb', 'middle');
      return s;
    }
    o += bar(60, 2, 3, 'before') + bar(196, 2, 5, 'expected π +2');
    o += curve([[132, 90], [188, 70]], 'c4', true);
    return { svg: svg(o, 192), cap: 'Fisher effect: when expected inflation rises 2 points, the nominal rate rises 2 points and the real rate (green) stays put.' };
  };

  G.inflationVsRates = function () {
    var o = '';
    var rows = [['Fed funds target', '3.75–4.00%', 'Sep 16, 2026'], ['CPI inflation, 12 mo.', '3.4%', 'Aug 2026'], ['Real policy rate ≈', '+0.5%', 'i − π']];
    rows.forEach(function (row, k) {
      var y = 26 + k * 50;
      o += rect(16, y - 16, 288, 40, k === 2 ? 'box1' : 'box', 10);
      o += t(30, y + 4, row[0], k === 2 ? 'k1' : 'b');
      o += t(290, y + 4, row[1], k === 2 ? 'k1' : 'b', 'end');
      o += t(30, y + 17, row[2], 'lb');
    });
    return { svg: svg(o, 176), cap: 'Using ex post inflation. With expected inflation in place of actual, you get the ex ante real rate instead.' };
  };

  // ------------------------------------------------------------ week 4

  G.flows = function () {
    var o = '';
    o += '<circle cx="78" cy="96" r="50" class="box3"/>' + t(78, 92, 'Employed', 'k3', 'middle') + t(78, 108, 'E', 'it', 'middle');
    o += '<circle cx="242" cy="96" r="50" class="box2"/>' + t(242, 92, 'Unemployed', 'k2', 'middle') + t(242, 108, 'U', 'it', 'middle');
    o += curve([[118, 66], [160, 40], [204, 66]], 'c2', true);
    o += t(160, 32, 'job losses  s · E', 'k2', 'middle');
    o += curve([[204, 126], [160, 152], [118, 126]], 'c3', true);
    o += t(160, 170, 'job finding  f · U', 'k3', 'middle');
    o += t(160, 194, 'steady state: s·E = f·U  ⇒  U/L = s/(s + f)', 'it', 'middle');
    return { svg: svg(o, 202), cap: 'Each period a share s of the employed lose jobs and a share f of the unemployed find one. When the two flows match, unemployment stops changing.' };
  };

  G.unemploymentPath = function () {
    var s = 0.02, f = 0.28, u = 0.12, pts = [];
    var sx = scale(0, 14, X0, X1), sy = scale(0, 13, Y0, Y1);
    for (var k = 0; k <= 14; k++) { pts.push([sx(k), sy(u * 100)]); u = u + s * (1 - u) - f * u; }
    var o = axes('months', 'u %');
    var ss = s / (s + f) * 100;
    o += ln(X0, sy(ss), X1, sy(ss), 'c2 dash') + t(X1, sy(ss) - 6, 'u* = 6.67%', 'k2', 'end');
    o += curve(pts, 'c1');
    pts.forEach(function (p) { o += dot(p[0], p[1], 'solid1'); });
    o += t(X0 - 5, sy(12) + 4, '12', 'lb', 'end');
    return { svg: svg(o), cap: 'Start at 12% with s = 0.02 and f = 0.28: unemployment falls quickly toward s/(s + f) = 6.67% and stays there.' };
  };

  G.wageFloor = function (a) {
    var sx = scale(0, 10, X0, X1), sy = scale(0, 10, Y0, Y1);
    var D = function (x) { return 9.2 - 0.8 * x; }, S = function (x) { return 1 + 0.8 * x; };
    var o = axes('labor', 'W/P');
    o += curve(plot(D, 0.5, 10, sx, sy), 'c1') + t(sx(9.9), sy(D(9.9)) - 8, 'demand', 'k1', 'end');
    o += curve(plot(S, 0, 10, sx, sy), 'c3') + t(sx(9.9), sy(S(9.9)) + 14, 'supply', 'k3', 'end');
    var w = 7.2, ld = (9.2 - w) / 0.8, ls = (w - 1) / 0.8;
    o += ln(X0, sy(w), X1, sy(w), 'c2') + t(X0 + 4, sy(w) - 6, a.label || 'wage floor', 'k2');
    o += dot(sx(ld), sy(w)) + dot(sx(ls), sy(w));
    o += ln(sx(ld), sy(w) + 14, sx(ls), sy(w) + 14, 'c2', true);
    o += t((sx(ld) + sx(ls)) / 2, sy(w) + 28, 'unemployed', 'k2', 'middle');
    o += dot(sx(5.125), sy(D(5.125)), 'solid4');
    return { svg: svg(o), cap: 'With the real wage held above where supply meets demand, more people want work than firms want to hire. The gap is structural unemployment.' };
  };

  // ------------------------------------------------------------ week 5

  G.solow = function (a) {
    var mode = a.mode || 'basic';
    var alpha = 0.5, s = 0.3, d = 0.1, n = 0.04;
    var f = function (k) { return Math.pow(k, alpha); };
    // The golden-rule picture needs room for k_gold = 25 and f(k) itself.
    var kmax = mode === 'golden' ? 40 : 14;
    var sx = scale(0, kmax, X0, X1), sy = scale(0, mode === 'golden' ? 7 : 1.25, Y0, Y1);
    // Straight lines stop where they reach the top of the plot.
    var kTop = mode === 'golden' ? kmax * 0.95 : Math.min(kmax * 0.95, 1.2 / d);
    var kss = function (sv, dd) { return Math.pow(sv / dd, 1 / (1 - alpha)); };
    var o = axes('k', '');
    var cap;
    if (mode === 'basic' || mode === 'diagram') {
      o += curve(plot(function (k) { return s * f(k); }, 0, kmax, sx, sy, 90), 'c1') + t(sx(kmax), sy(s * f(kmax)) + 14, 's f(k)', 'k1', 'end');
      o += curve(plot(function (k) { return d * k; }, 0, kTop, sx, sy), 'c2') + t(sx(kTop) - 6, sy(d * kTop) + 4, 'δk', 'k2', 'end');
      var k1 = kss(s, d);
      o += dot(sx(k1), sy(d * k1)) + vguide(sx(k1), sy(d * k1), 'k*', 'k1');
      o += curve([[sx(2.4), sy(0.36)], [sx(5.4), sy(0.36)]], 'c4', true) + t(sx(2.4), sy(0.36) - 6, 'k rises', 'lb');
      o += curve([[sx(13), sy(0.62)], [sx(10.4), sy(0.62)]], 'c4', true) + t(sx(13), sy(0.62) - 6, 'k falls', 'lb', 'end');
      cap = mode === 'diagram'
        ? 'Label everything: axes (k, and investment/depreciation per worker), s f(k), δk (and f(k) above them if you draw it), the crossing k*, and arrows showing k moving toward it from both sides.'
        : 'Left of k*, investment s f(k) beats depreciation δk and k grows; right of it, depreciation wins. They meet at the steady state.';
    } else if (mode === 'saving') {
      var s2 = 0.4;
      o += curve(plot(function (k) { return s * f(k); }, 0, kmax, sx, sy, 90), 'c1 faint') + t(sx(kmax), sy(s * f(kmax)) + 14, 's₁ f(k)', 'k1', 'end');
      o += curve(plot(function (k) { return s2 * f(k); }, 0, kmax, sx, sy, 90), 'c1') + t(sx(kmax), sy(s2 * f(kmax)) - 6, 's₂ f(k)', 'k1', 'end');
      o += curve(plot(function (k) { return d * k; }, 0, kTop, sx, sy), 'c2');
      var a1 = kss(s, d), a2 = kss(s2, d);
      o += dot(sx(a1), sy(d * a1), 'solid4') + vguide(sx(a1), sy(d * a1), 'k₁*');
      o += dot(sx(a2), sy(d * a2)) + vguide(sx(a2), sy(d * a2), 'k₂*', 'k1');
      cap = 'A higher saving rate lifts s f(k): the steady state moves right, so income per worker ends up higher, but growth stops again once k reaches k₂*.';
    } else if (mode === 'pop') {
      o += curve(plot(function (k) { return s * f(k); }, 0, kmax, sx, sy, 90), 'c1') + t(sx(kmax), sy(s * f(kmax)) + 14, 's f(k)', 'k1', 'end');
      o += curve(plot(function (k) { return d * k; }, 0, kTop, sx, sy), 'c2 faint') + t(sx(kTop) - 6, sy(d * kTop) + 4, 'δk', 'k2', 'end');
      o += curve(plot(function (k) { return (d + n) * k; }, 0, 8.6, sx, sy), 'c2') + t(sx(8.6), sy((d + n) * 8.6) - 6, '(δ + n)k', 'k2', 'end');
      var b1 = kss(s, d), b2 = kss(s, d + n);
      o += dot(sx(b1), sy(d * b1), 'solid4') + vguide(sx(b1), sy(d * b1), 'k*');
      o += dot(sx(b2), sy((d + n) * b2)) + vguide(sx(b2), sy((d + n) * b2), 'k*ₙ', 'k2');
      cap = 'Population growth n is like extra depreciation: new workers need capital too. The break-even line steepens and steady-state k falls.';
    } else {
      var kg = Math.pow(alpha / d, 1 / (1 - alpha));
      o += curve(plot(f, 0, kmax, sx, sy, 90), 'c1') + t(sx(kmax), sy(f(kmax)) - 6, 'f(k)', 'k1', 'end');
      o += curve(plot(function (k) { return d * k; }, 0, kmax * 0.95, sx, sy), 'c2') + t(sx(kmax * 0.95), sy(d * kmax * 0.95) + 14, 'δk', 'k2', 'end');
      o += ln(sx(kg), sy(f(kg)), sx(kg), sy(d * kg), 'c3', false);
      o += t(sx(kg) + 5, sy((f(kg) + d * kg) / 2), 'c* biggest', 'k3');
      o += ln(sx(kg - 3), sy(f(kg) - 3 * d), sx(kg + 3), sy(f(kg) + 3 * d), 'c3 dash');
      o += vguide(sx(kg), sy(d * kg), 'k_gold', 'k3');
      cap = 'Consumption per worker is the gap between f(k) and δk. It is widest where the slope of f(k) equals δ, i.e. MPK = δ.';
    }
    return { svg: svg(o), cap: cap };
  };

  G.solowShock = function (a) {
    var v = a.v || 'y';
    var sx = scale(0, 10, X0, X1), sy = scale(0, 10, Y0, Y1);
    var o = axes('time', v === 'c' ? 'c' : v === 'Y' ? 'Y (total)' : 'y = Y/L');
    var base = 4.2, t0 = 3;
    var path = function (x) { return base + 2.6 * Math.exp(-(x - t0) * 0.55); };
    if (v === 'Y') {
      var Yp = function (x) { return 4.2 + 0.8 * Math.exp(-(x - t0) * 0.55); };
      o += curve([[sx(0), sy(6.4)], [sx(t0), sy(6.4)]], 'c1');
      o += ln(sx(t0), sy(6.4), sx(t0), sy(Yp(t0)), 'c1 dash');
      o += curve(plot(Yp, t0, 10, sx, sy), 'c1');
      o += t(sx(t0), Y0 + 14, 'L falls', 'k2', 'middle');
      o += t(sx(t0) + 6, sy(5.9), 'Y drops with L,', 'k1');
      o += t(sx(t0) + 6, sy(5.3), 'then K shrinks too', 'lb');
      return { svg: svg(o), cap: 'Total output Y falls: fewer workers, and over time less capital. Per-worker output only rises for a while.' };
    }
    o += curve([[sx(0), sy(base)], [sx(t0), sy(base)]], 'c1');
    o += ln(sx(t0), sy(base), sx(t0), sy(base + 2.6), 'c1 dash');
    o += curve(plot(path, t0, 10, sx, sy), 'c1');
    o += ln(X0, sy(base), X1, sy(base), 'c4 dash faint');
    o += t(sx(t0), Y0 + 14, 'L falls', 'k2', 'middle');
    o += t(sx(9.8), sy(base) - 6, 'same steady state', 'lb', 'end');
    o += t(sx(t0) + 6, sy(base + 2.5), v === 'c' ? 'c jumps up' : 'k and y jump up', 'k1');
    o += t(sx(4.6), sy(base + 1.3), 'then falls back', 'lb');
    return { svg: svg(o), cap: v === 'c'
      ? 'With s unchanged, c = (1 − s)y moves with y: it jumps up, then falls back to where it started.'
      : 'Fewer workers share the same capital, so k = K/L jumps above k*. Depreciation then outruns investment and k and y slide back to the old steady state.' };
  };

  G.savingPath = function () {
    var sx = scale(0, 10, X0, X1), sy = scale(0, 10, Y0, Y1);
    var t0 = 3;
    var o = axes('time', 'y');
    o += curve(plot(function (x) { return x < t0 ? 3 : 3 + 3.5 * (1 - Math.exp(-(x - t0) * 0.5)); }, 0, 10, sx, sy, 80), 'c1');
    o += ln(X0, sy(6.5), X1, sy(6.5), 'c4 dash faint');
    o += t(sx(t0), Y0 + 14, 's rises', 'k2', 'middle');
    o += t(sx(9.8), sy(6.5) - 6, 'higher level', 'k1', 'end');
    o += t(sx(4.6), sy(3.6), 'faster growth', 'lb');
    o += t(sx(4.6), sy(2.8), 'only for a while', 'lb');
    return { svg: svg(o), cap: 'A permanent rise in the saving rate gives a burst of growth and a permanently higher level of y, not a permanently higher growth rate.' };
  };

  G.goldenHump = function () {
    var alpha = 0.33;
    var sx = scale(0, 1, X0, X1), sy = scale(0, 1.05, Y0, Y1);
    var c = function (s) { return s <= 0 || s >= 1 ? 0 : (1 - s) * Math.pow(s, alpha / (1 - alpha)) / Math.pow(alpha, alpha / (1 - alpha)) / (1 - alpha); };
    var o = axes('saving rate s', 'c*');
    o += curve(plot(c, 0.001, 0.999, sx, sy, 120), 'c1');
    o += dot(sx(alpha), sy(c(alpha))) + vguide(sx(alpha), sy(c(alpha)), 's_gold = α', 'k3');
    o += t(sx(0.2), sy(0.22), 'below: save more', 'lb', 'middle');
    o += t(sx(0.73), sy(0.92), 'above: save less', 'lb', 'middle');
    return { svg: svg(o), cap: 'Steady-state consumption peaks when the saving rate equals capital’s share α. Saving 0% or 100% both leave nothing to eat.' };
  };

  G.convergence = function () {
    var sx = scale(0, 10, X0, X1), sy = scale(0, 10, Y0, Y1);
    var o = axes('time', 'y');
    o += curve(plot(function (x) { return 8.4 - 0.9 * Math.exp(-x * 0.4); }, 0, 10, sx, sy), 'c4');
    o += curve(plot(function (x) { return 8.4 - 6.5 * Math.exp(-x * 0.4); }, 0, 10, sx, sy), 'c1');
    o += t(sx(0.2), sy(7.5) - 8, 'rich: near steady state', 'lb');
    o += t(sx(0.4), sy(1.9) + 16, 'war-damaged: grows fast', 'k1');
    o += ln(X0, sy(8.4), X1, sy(8.4), 'c4 dash faint');
    return { svg: svg(o), cap: 'An economy far below its steady state has a high return on capital and grows fast; growth slows as it closes the gap (postwar Japan, Germany).' };
  };

  G.chinaGrowth = function () {
    var d = [[2010, 10.6], [2012, 7.9], [2014, 7.4], [2016, 6.8], [2018, 6.7], [2019, 6.0], [2020, 2.2], [2021, 8.4], [2022, 3.0], [2023, 5.2], [2024, 5.0], [2025, 5.0]];
    var sx = scale(-0.6, d.length - 0.4, X0, X1), sy = scale(0, 12, Y0, Y1);
    var o = axes('', '%');
    [4, 8, 12].forEach(function (v) { o += ln(X0, sy(v), X1, sy(v), 'grid') + t(X0 - 5, sy(v) + 4, v, 'lb', 'end'); });
    d.forEach(function (p, k) {
      o += rect(sx(k) - 8, sy(p[1]), 16, Y0 - sy(p[1]), 'solid1', 3);
      o += t(sx(k), Y0 + 13, "'" + String(p[0]).slice(2), 'lb', 'middle');
    });
    o += t(sx(0), sy(10.6) - 5, '10.6', 'k1', 'middle') + t(sx(11), sy(5) - 5, '5.0', 'k1', 'middle');
    return { svg: svg(o, 196), cap: 'China’s official real GDP growth (NBS). From double digits to about 5%; outside estimates put recent years lower still.' };
  };

  G.crs = function () {
    var o = '';
    function grid(x, n, cls) {
      var s = '';
      for (var k = 0; k < n; k++) s += rect(x + (k % 2) * 26, 30 + Math.floor(k / 2) * 26, 22, 22, cls, 4);
      return s;
    }
    o += t(60, 20, 'K, L', 'b', 'middle') + grid(34, 2, 'solid1');
    o += t(60, 100, 'Y', 'b', 'middle') + rect(40, 108, 40, 22, 'solid2', 4);
    o += curve([[110, 70], [190, 70]], 'c4', true) + t(150, 62, '× 2', 'b', 'middle');
    o += t(250, 20, '2K, 2L', 'b', 'middle') + grid(224, 4, 'solid1');
    o += t(250, 100, '2Y', 'b', 'middle') + rect(206, 108, 40, 22, 'solid2', 4) + rect(252, 108, 40, 22, 'solid2', 4);
    o += t(160, 160, 'F(zK, zL) = z · F(K, L)', 'it', 'middle');
    return { svg: svg(o, 172), cap: 'Double every input, get exactly double the output. Cobb-Douglas has this because the exponents α and 1 − α add to 1.' };
  };

  G.wageCompression = function () {
    var sx = scale(0, 10, X0, X1), sy = scale(0, 10, Y0, Y1);
    var o = axes('wage percentile', 'wage growth');
    var pts = [[1, 8.6], [2.5, 7.4], [4, 6.2], [5.5, 5.3], [7, 4.6], [8.5, 4.1], [9.6, 3.8]];
    o += curve(pts.map(function (p) { return [sx(p[0]), sy(p[1])]; }), 'c1');
    pts.forEach(function (p) { o += dot(sx(p[0]), sy(p[1]), 'solid1'); });
    o += t(sx(1), Y0 + 14, '10th', 'lb', 'middle') + t(sx(5.5), Y0 + 14, '50th', 'lb', 'middle') + t(sx(9.6), Y0 + 14, '90th', 'lb', 'middle');
    o += t(sx(1.4), sy(8.6) - 8, 'fastest at the bottom', 'k1');
    return { svg: svg(o), cap: 'Stylised. In the tight post-pandemic labor market, wages rose fastest for the lowest paid, narrowing the gap with the middle and top.' };
  };

  window.GRAPHS = G;
})();
