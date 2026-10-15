// ECON 378 · Statistics for Economists: the class's own diagrams, added to
// the shared library (tools/graphs.js) with its drawing helpers.
//
// Plain ES5 on purpose (no backticks): pasted into the page as-is.
(function () {
  var K = window.GRAPHKIT, G = window.GRAPHS;
  var svg = K.svg, t = K.t, ln = K.ln, dot = K.dot, rect = K.rect, curve = K.curve, area = K.area,
    plot = K.plot, scale = K.scale, axes = K.axes;
  var X0 = K.X0, Y0 = K.Y0, X1 = K.X1, Y1 = K.Y1;

  // ------------------------------------------------------------ maths

  function npdf(z) { return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); }
  function lnGamma(z) {
    var c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    var x = z, y = z, tmp = x + 5.5, ser = 1.000000000190015;
    tmp -= (x + 0.5) * Math.log(tmp);
    for (var j = 0; j < 6; j++) ser += c[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }
  function tpdf(x, v) {
    return Math.exp(lnGamma((v + 1) / 2) - lnGamma(v / 2)) / Math.sqrt(v * Math.PI) * Math.pow(1 + x * x / v, -(v + 1) / 2);
  }
  function chipdf(x, k) {
    return x <= 0 ? 0 : Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.LN2 - lnGamma(k / 2));
  }
  /** Gamma(shape n, scale 1/n): the exact distribution of the mean of n Exponential(1) draws. */
  function meanExp(x, n) {
    return x <= 0 ? 0 : Math.exp(n * Math.log(n) + (n - 1) * Math.log(x) - n * x - lnGamma(n));
  }
  function choose(n, k) { var c = 1; for (var j = 1; j <= k; j++) c = c * (n - k + j) / j; return c; }
  /** A fixed stream of standard normal draws, so every drawing is the same each time. */
  function draws(seed, n) {
    var s = seed, out = [];
    function u() { s = (s * 16807) % 2147483647; return s / 2147483647; }
    for (var k = 0; k < n; k++) out.push(Math.sqrt(-2 * Math.log(u())) * Math.cos(2 * Math.PI * u()));
    return out;
  }
  /** Standardises a list (mean 0, SD 1). */
  function std(v) {
    var m = 0, s = 0;
    v.forEach(function (x) { m += x / v.length; });
    v.forEach(function (x) { s += (x - m) * (x - m) / v.length; });
    return v.map(function (x) { return (x - m) / Math.sqrt(s); });
  }
  function fmt(v) { return String(Math.round(v * 100) / 100).replace('-', '−'); }
  function circle(x, y, rad, cls) {
    return '<circle cx="' + K.r(x) + '" cy="' + K.r(y) + '" r="' + K.r(rad) + '" class="' + cls + '"/>';
  }
  /** The area under f between a and b, closed down to the axis. */
  function under(f, a, b, sx, sy, cls) {
    var pts = plot(f, a, b, sx, sy, 50);
    pts.unshift([sx(a), sy(0)]);
    pts.push([sx(b), sy(0)]);
    return area(pts, cls);
  }
  function tick(x, label, cls) {
    return ln(x, Y0, x, Y0 + 4, 'ax') + t(x, Y0 + 15, label, cls || 'lb', 'middle');
  }

  // ------------------------------------------------- unit 1 · descriptive

  /** Histogram of a skewed (or symmetric) variable with its mean and median. */
  G.econ378Skew = function (a) {
    var mode = a.mode || 'right';
    var sx = scale(0, 4.5, X0, X1), sy = scale(0, 0.75, Y0, Y1 + 10);
    var f, mean, med;
    if (mode === 'sym') {
      f = function (x) { return 1.6 * npdf((x - 2.25) / 0.85) / 0.85 * 0.42; };
      mean = med = 2.25;
    } else {
      // lognormal(0, 0.8): median 1, mean e^0.32
      f = function (x) { return x <= 0 ? 0 : Math.exp(-Math.pow(Math.log(x), 2) / (2 * 0.64)) / (x * 0.8 * Math.sqrt(2 * Math.PI)); };
      med = 1; mean = Math.exp(0.32);
    }
    var o = axes(a.xl || 'income', 'share');
    for (var x = 0; x < 4.5; x += 0.25) {
      var h = f(x + 0.125);
      o += rect(sx(x) + 1, sy(h), sx(0.25) - sx(0) - 2, Y0 - sy(h), 'fill1', 1);
    }
    o += curve(plot(f, 0.02, 4.5, sx, sy, 90), 'c1');
    if (mode === 'sym') {
      o += ln(sx(mean), Y0, sx(mean), Y1 + 6, 'c2');
      o += t(sx(mean) + 5, Y1 + 12, 'mean = median', 'k2', 'start');
      return { svg: svg(o), cap: 'Symmetric data: the mean and the median coincide.' };
    }
    o += ln(sx(med), Y0, sx(med), Y1 + 4, 'c4 dash');
    o += ln(sx(mean), Y0, sx(mean), Y1 + 34, 'c2');
    o += t(sx(med) + 4, Y1 + 12, 'median', 'b', 'start');
    o += t(sx(mean) + 4, Y1 + 42, 'mean', 'k2', 'start');
    o += t(sx(3.4), sy(0.3), 'long right tail', 'lb', 'middle');
    o += t(sx(3.4), sy(0.3) + 12, 'pulls the mean up', 'lb', 'middle');
    return { svg: svg(o), cap: 'Right-skewed data (incomes, wealth, house prices): a few very large values drag the mean above the median.' };
  };

  /** Dot plot of a small sample with each value's deviation from the mean. */
  G.econ378Deviations = function () {
    var xs = [2, 4, 6, 8], m = 5;
    var sx = scale(0, 10, X0, X1);
    var o = ln(X0, 150, X1, 150, 'ax');
    for (var v = 0; v <= 10; v += 2) o += ln(sx(v), 150, sx(v), 154, 'ax') + t(sx(v), 166, v, 'lb', 'middle');
    o += ln(sx(m), 30, sx(m), 150, 'c4 dash');
    o += t(sx(m), 24, 'x̄ = 5', 'b', 'middle');
    xs.forEach(function (x, k) {
      var y = 52 + k * 22, d = x - m;
      o += ln(sx(m), y, sx(x), y, d < 0 ? 'c2' : 'c1') + K.dot(sx(x), y, d < 0 ? 'solid2' : 'solid1');
      o += t(sx(x) + (d < 0 ? -6 : 6), y + 4, (d < 0 ? '−' : '+') + Math.abs(d) + '  (sq. ' + d * d + ')', d < 0 ? 'k2' : 'k1', d < 0 ? 'end' : 'start');
      o += dot(sx(x), 150);
    });
    o += t(160, 190, 's² = (9 + 1 + 1 + 9) ⁄ (4 − 1) = 6.67', 'it', 'middle');
    return { svg: svg(o, 200), cap: 'Deviations from the mean always sum to zero, so they are squared before averaging. Dividing by n − 1 corrects for measuring them from x̄ rather than μ.' };
  };

  /** Box plot with the 1.5 × IQR fences and an outlier. */
  G.econ378Box = function (a) {
    var q1 = a.q1 || 20, md = a.med || 28, q3 = a.q3 || 40, lo = a.lo || 8, hi = a.hi || 62, out = a.out || [85];
    var iqr = q3 - q1, f1 = q1 - 1.5 * iqr, f2 = q3 + 1.5 * iqr;
    var sx = scale(-15, 95, X0 - 20, X1 + 4);
    var y = 96, o = '';
    o += ln(sx(-15), 160, sx(95), 160, 'ax');
    for (var v = 0; v <= 90; v += 20) o += ln(sx(v), 160, sx(v), 164, 'ax') + t(sx(v), 176, v, 'lb', 'middle');
    o += ln(sx(f1), 30, sx(f1), 160, 'c2 dash') + ln(sx(f2), 30, sx(f2), 160, 'c2 dash');
    o += t(sx(f1), 24, 'Q1 − 1.5·IQR = ' + fmt(f1), 'k2', 'start');
    o += t(sx(f2), 24, 'Q3 + 1.5·IQR = ' + fmt(f2), 'k2', 'end');
    o += ln(sx(lo), y, sx(q1), y, 'c4') + ln(sx(q3), y, sx(hi), y, 'c4');
    o += ln(sx(lo), y - 8, sx(lo), y + 8, 'c4') + ln(sx(hi), y - 8, sx(hi), y + 8, 'c4');
    o += rect(sx(q1), y - 18, sx(q3) - sx(q1), 36, 'box1', 3);
    o += ln(sx(md), y - 18, sx(md), y + 18, 'c1');
    o += t(sx(q1), y + 32, 'Q1', 'b', 'middle') + t(sx(q3), y + 32, 'Q3', 'b', 'middle');
    o += t(sx(md), y - 24, 'median', 'k1', 'middle');
    o += ln(sx(q1), y + 42, sx(q3), y + 42, 'c1') + t((sx(q1) + sx(q3)) / 2, y + 55, 'IQR = ' + iqr, 'k1', 'middle');
    out.forEach(function (v) { o += dot(sx(v), y, 'solid2') + t(sx(v), y - 10, 'outlier', 'k2', 'middle'); });
    return { svg: svg(o, 186), cap: 'The box holds the middle 50% of the data. Anything past a fence is flagged as a possible outlier, worth a look rather than automatic deletion.' };
  };

  /** Four small scatter plots with their correlations. */
  G.econ378Corr = function () {
    var panels = [[0.9, 'strong positive'], [-0.6, 'moderate negative'], [0, 'no linear link'], ['u', 'strong, but curved']];
    var o = '';
    panels.forEach(function (p, k) {
      var px = 12 + (k % 2) * 154, py = 10 + Math.floor(k / 2) * 98, w = 142, h = 70;
      o += rect(px, py, w, h, 'box', 6);
      var pts = [];
      if (p[0] === 'u') {
        for (var j = 0; j < 25; j++) { var u = -2 + j / 6; pts.push([u, 0.55 * u * u - 1.1 + (j % 2 ? 0.12 : -0.12) * (j === 12 ? 0 : 1)]); }
        // mirror the jitter so the plot stays exactly symmetric (r = 0)
        pts.forEach(function (q, j) { if (q[0] > 0) q[1] = pts[24 - j][1]; });
      } else {
        var xs = std(draws(11 + k * 7, 26).map(function (x) { return Math.max(-2.2, Math.min(2.2, x)); }));
        var es = std(draws(97 + k * 13, 26)), b = 0;
        xs.forEach(function (x, j) { b += x * es[j] / xs.length; });
        es = std(es.map(function (e, j) { return e - b * xs[j]; }));
        xs.forEach(function (x, j) { pts.push([x, p[0] * x + Math.sqrt(1 - p[0] * p[0]) * es[j]]); });
      }
      var mx = 0, my = 0;
      pts.forEach(function (q) { mx += q[0] / pts.length; my += q[1] / pts.length; });
      var sxy = 0, sxx = 0, syy = 0;
      pts.forEach(function (q) { sxy += (q[0] - mx) * (q[1] - my); sxx += Math.pow(q[0] - mx, 2); syy += Math.pow(q[1] - my, 2); });
      var r = sxy / Math.sqrt(sxx * syy);
      var fx = scale(-2.4, 2.4, px + 6, px + w - 6), fy = scale(-2.6, 2.6, py + h - 4, py + 4);
      pts.forEach(function (q) { o += circle(fx(q[0]), fy(Math.max(-2.5, Math.min(2.5, q[1]))), 2.2, k === 3 ? 'solid2' : 'solid1'); });
      o += t(px + w / 2, py + h + 12, 'r = ' + fmt(Math.abs(r) < 0.005 ? 0 : r), k === 3 ? 'k2' : 'k1', 'middle');
      o += t(px + w / 2, py + h + 23, p[1], 'lb', 'middle');
    });
    return { svg: svg(o, 206), cap: 'r measures how tightly points hug a straight line. A perfect U-shape has r near 0: strong relationship, no linear association.' };
  };

  // -------------------------------------------------- unit 2 · probability

  /** Two events in a sample space; conditioning on B shrinks the space to B. */
  G.econ378Venn = function (a) {
    var o = rect(14, 12, 292, 160, 'box', 10);
    o += t(24, 28, 'all outcomes', 'lb', 'start');
    o += circle(122, 96, 58, 'fill1') + circle(198, 96, 58, a.indep ? 'fill2' : 'fill2');
    o += '<circle cx="122" cy="96" r="58" class="c1"/>' + '<circle cx="198" cy="96" r="58" class="c2"/>';
    o += t(92, 100, 'A', 'k1', 'middle') + t(228, 100, 'B', 'k2', 'middle');
    o += t(160, 92, 'A ∩ B', 'b', 'middle');
    o += t(160, 194, a.indep ? 'independent: P(A ∩ B) = P(A) · P(B)' : 'P(A | B) = P(A ∩ B) ⁄ P(B): the overlap as a share of B', 'it', 'middle');
    return { svg: svg(o, 204), cap: a.indep ? 'Independence: learning that B happened leaves the chance of A unchanged, so A takes the same share of B as of the whole space.' : 'Conditioning on B throws away everything outside B. P(A | B) asks what fraction of B is also A.' };
  };

  /** A probability tree in counts: a screening test on a population. */
  G.econ378Tree = function (a) {
    var N = a.n || 10000, pr = a.prior || 0.01, se = a.sens || 0.9, fp = a.fpr || 0.05;
    var sick = N * pr, well = N - sick, tp = sick * se, fn = sick - tp, fpos = well * fp, tn = well - fpos;
    var c = function (v) { return Math.round(v).toLocaleString('en-US'); };
    var o = '';
    o += rect(110, 6, 100, 26, 'box', 8) + t(160, 23, c(N) + ' people', 'b', 'middle');
    o += curve([[140, 32], [70, 56]], 'c4') + curve([[180, 32], [250, 56]], 'c4');
    o += t(92, 44, fmt(pr * 100) + '%', 'lb', 'end') + t(228, 44, fmt((1 - pr) * 100) + '%', 'lb', 'start');
    o += rect(22, 56, 96, 26, 'box2', 8) + t(70, 73, c(sick) + ' sick', 'k2', 'middle');
    o += rect(202, 56, 96, 26, 'box1', 8) + t(250, 73, c(well) + ' healthy', 'k1', 'middle');
    o += curve([[52, 82], [36, 112]], 'c4') + curve([[88, 82], [104, 112]], 'c4');
    o += curve([[232, 82], [216, 112]], 'c4') + curve([[268, 82], [284, 112]], 'c4');
    o += t(36, 100, fmt(se * 100) + '%', 'lb', 'end') + t(272, 100, fmt((1 - fp) * 100) + '%', 'lb', 'start');
    o += t(110, 100, fmt((1 - se) * 100) + '%', 'lb', 'start') + t(208, 100, fmt(fp * 100) + '%', 'lb', 'end');
    o += rect(6, 112, 62, 34, 'box2', 6) + t(37, 126, c(tp), 'k2', 'middle') + t(37, 139, 'test +', 'lb', 'middle');
    o += rect(76, 112, 62, 34, 'box', 6) + t(107, 126, c(fn), 'b', 'middle') + t(107, 139, 'test −', 'lb', 'middle');
    o += rect(182, 112, 62, 34, 'box1', 6) + t(213, 126, c(fpos), 'k1', 'middle') + t(213, 139, 'test +', 'lb', 'middle');
    o += rect(252, 112, 62, 34, 'box', 6) + t(283, 126, c(tn), 'b', 'middle') + t(283, 139, 'test −', 'lb', 'middle');
    o += t(160, 170, 'P(sick | +) = ' + c(tp) + ' ⁄ (' + c(tp) + ' + ' + c(fpos) + ') ≈ ' + Math.round(100 * tp / (tp + fpos)) + '%', 'it', 'middle');
    o += t(160, 188, 'most positives come from the big healthy group', 'lb', 'middle');
    return { svg: svg(o, 196), cap: 'Bayes in counts: the false positives from the large healthy group outnumber the true positives from the small sick group.' };
  };

  /** Bars for a discrete distribution, with a highlighted bar and the mean as a balance point. */
  function bars(probs, x0, o2) {
    var n = probs.length, top = 0;
    probs.forEach(function (p) { top = Math.max(top, p); });
    var sx = scale(x0 - 0.7, x0 + n - 0.3, X0, X1), sy = scale(0, top * 1.22, Y0, Y1 + 8);
    var w = Math.min(26, (X1 - X0) / n * 0.7);
    var o = axes(o2.xl || 'k', o2.yl || 'P(X = k)');
    var every = n > 14 ? 2 : 1;
    probs.forEach(function (p, k) {
      var x = x0 + k, hi = o2.hi === x;
      o += rect(sx(x) - w / 2, sy(p), w, Y0 - sy(p), hi ? 'solid2' : 'solid1', 2);
      if (k % every === 0) o += t(sx(x), Y0 + 13, x, 'lb', 'middle');
      if (hi || o2.all) o += t(sx(x), sy(p) - 5, p.toFixed(o2.dp || 3).replace(/^0/, ''), hi ? 'k2' : 'lb', 'middle');
    });
    if (o2.mean != null) {
      var mx = sx(o2.mean);
      o += '<path d="M' + K.r(mx) + ' ' + (Y0 + 2) + 'l-6 10h12z" class="solid2"/>';
      o += t(mx, Y0 + 26, o2.meanLabel || ('E[X] = ' + fmt(o2.mean)), 'k2', 'middle');
    }
    return o;
  }

  G.econ378Bars = function (a) {
    var probs = a.probs || [0.1, 0.3, 0.4, 0.2];
    var mean = 0;
    probs.forEach(function (p, k) { mean += p * ((a.x0 || 0) + k); });
    var o = bars(probs, a.x0 || 0, { mean: mean, all: true, dp: 1, xl: a.xl || 'x', yl: a.yl || 'P(X = x)' });
    return { svg: svg(o, 210), cap: a.cap || 'E[X] is the balance point of the bars: Σ x·P(X = x) = 0(.1) + 1(.3) + 2(.4) + 3(.2) = 1.7.' };
  };

  G.econ378Binom = function (a) {
    var n = a.n || 10, p = a.p || 0.3, probs = [];
    for (var k = 0; k <= n; k++) probs.push(choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k));
    var o = bars(probs, 0, { hi: a.k, mean: n * p, meanLabel: 'np = ' + fmt(n * p) });
    return { svg: svg(o, 210), cap: 'Binomial(' + n + ', ' + p + '). Mean np = ' + fmt(n * p) + ', SD √(np(1 − p)) = ' + fmt(Math.sqrt(n * p * (1 - p))) + '.' + (a.k != null ? ' Highlighted: P(X = ' + a.k + ').' : '') };
  };

  G.econ378Pois = function (a) {
    var lam = a.lam || 3, m = a.max || 10, probs = [], f = 1;
    for (var k = 0; k <= m; k++) { if (k) f *= k; probs.push(Math.exp(-lam) * Math.pow(lam, k) / f); }
    var o = bars(probs, 0, { hi: a.k, mean: lam, meanLabel: 'λ = ' + fmt(lam) });
    return { svg: svg(o, 210), cap: 'Poisson(' + lam + '): counts per interval. Mean and variance both equal λ; skewed right for small λ.' + (a.k != null ? ' Highlighted: P(X = ' + a.k + ').' : '') };
  };

  /** X and 2X + 3: shifting moves the bars, scaling stretches them. */
  G.econ378Shift = function () {
    var probs = [0.1, 0.3, 0.4, 0.2];
    var sx = scale(-0.8, 10.6, X0, X1), sy = scale(0, 0.6, Y0, Y1);
    var o = axes('value', 'prob.');
    probs.forEach(function (p, k) {
      o += rect(sx(k) - 10, sy(p), 10, Y0 - sy(p), 'solid1', 2);
      o += rect(sx(2 * k + 3), sy(p), 10, Y0 - sy(p), 'solid2', 2);
    });
    for (var v = 0; v <= 9; v++) o += t(sx(v), Y0 + 13, v, 'lb', 'middle');
    o += t(sx(1.4), sy(0.47), 'X: mean 1.7, SD 0.9', 'k1', 'middle');
    o += t(sx(6.4), sy(0.47) + 16, '2X + 3: mean 6.4, SD 1.8', 'k2', 'middle');
    return { svg: svg(o, 200), cap: 'Same probabilities, new positions. The + 3 shifts every bar (mean up 3, spread unchanged); the × 2 doubles the gaps (SD × 2, variance × 4).' };
  };

  // ------------------------------------------------ unit 3 · distributions

  /** A normal curve with a shaded region; tick labels in x units when mu and sd are given. */
  G.econ378Normal = function (a) {
    var has = a.mu != null && a.sd != null, z = a.z == null ? 1.96 : a.z, m = a.shade || 'none';
    var sx = scale(-3.7, 3.7, X0, X1), sy = scale(0, 0.43, Y0, Y1 + 10);
    var o = '';
    if (m === 'right') o += under(npdf, z, 3.7, sx, sy, 'fill2');
    if (m === 'left') o += under(npdf, -3.7, z, sx, sy, 'fill1');
    if (m === 'mid') o += under(npdf, -z, z, sx, sy, 'fill1');
    if (m === 'two') o += under(npdf, -3.7, -z, sx, sy, 'fill2') + under(npdf, z, 3.7, sx, sy, 'fill2');
    if (m === 'rule') [3, 2, 1].forEach(function (k) { o += under(npdf, -k, k, sx, sy, 'fill1'); });
    o += axes(has ? (a.xl || 'x') : 'z', '');
    o += curve(plot(npdf, -3.7, 3.7, sx, sy, 90), 'c1');
    for (var k = -3; k <= 3; k++) {
      if (m !== 'rule' && m !== 'none' && Math.abs(Math.abs(k) - z) < 0.3) continue;
      if (!has && (m === 'mid' || m === 'two') && k !== 0) continue;
      o += tick(sx(k), has ? fmt(a.mu + k * a.sd) : fmt(k));
    }
    if (m === 'rule') {
      o += t(sx(0), sy(0.1), '68%', 'k1', 'middle');
      o += t(sx(-1.5), sy(0.03), '13.5%', 'lb', 'middle') + t(sx(1.5), sy(0.03), '13.5%', 'lb', 'middle');
      o += t(X1, Y1 + 8, '95% within ±2σ', 'lb', 'end') + t(X1, Y1 + 21, '99.7% within ±3σ', 'lb', 'end');
      o += t(X0 + 4, Y1 + 8, '68% within ±1σ', 'k1', 'start');
      return { svg: svg(o), cap: a.cap || 'The 68–95–99.7 rule: the share of a normal distribution within 1, 2 and 3 standard deviations of the mean.' };
    }
    if (m === 'mark') {
      (a.marks || []).forEach(function (q, j) {
        o += ln(sx(q[0]), Y0, sx(q[0]), sy(npdf(q[0])), j ? 'c2' : 'c1');
        o += t(X1, Y1 + 10 + j * 15, q[1], j ? 'k2' : 'k1', 'end');
      });
      return { svg: svg(o), cap: a.cap || '' };
    }
    if (m !== 'none') {
      var lab = a.zlab || ('z = ' + fmt(z));
      var cuts = m === 'mid' || m === 'two' ? [-z, z] : [z];
      cuts.forEach(function (c) {
        o += ln(sx(c), Y0, sx(c), sy(npdf(c)) - 2, 'c2');
        o += t(sx(c), Y0 + 15, has ? fmt(a.mu + c * a.sd) : (c < 0 ? '−' + fmt(-c) : fmt(c)), 'k2', 'middle');
      });
      if (m === 'right' || m === 'left') o += t(X1, Y1 + 10, lab, 'k2', 'end');
      else o += t(sx(z) + 6, sy(npdf(z)) - 8, lab, 'k2', 'start');
      if (a.area) {
        var ax = m === 'right' || m === 'two' ? sx(Math.min(3.1, z + 0.75)) : sx(0);
        o += t(ax, m === 'right' || m === 'two' ? sy(npdf(z) * 0.5) - 8 : sy(0.12), a.area, m === 'right' || m === 'two' ? 'k2' : 'k1', 'middle');
      }
    }
    return { svg: svg(o), cap: a.cap || '' };
  };

  /** The t distribution against the standard normal, with their 2.5% upper cut-offs. */
  G.econ378Tz = function (a) {
    var df = a.df || 3, tc = a.tc || 3.182;
    var sx = scale(-4.6, 4.6, X0, X1), sy = scale(0, 0.43, Y0, Y1 + 10);
    var tf = function (x) { return tpdf(x, df); };
    var o = under(tf, tc, 4.6, sx, sy, 'fill2') + under(npdf, 1.96, 4.6, sx, sy, 'fill1');
    o += axes('', '');
    o += curve(plot(npdf, -4.6, 4.6, sx, sy, 100), 'c1');
    o += curve(plot(tf, -4.6, 4.6, sx, sy, 100), 'c2');
    o += tick(sx(0), '0');
    o += ln(sx(1.96), Y0, sx(1.96), sy(npdf(1.96)), 'c1') + t(sx(1.96), Y0 + 15, '1.96', 'k1', tc - 1.96 < 0.6 ? 'end' : 'middle');
    var close = tc - 1.96 < 0.6;
    o += ln(sx(tc), Y0, sx(tc), sy(tf(tc)), 'c2') + t(sx(tc) + (close ? 4 : 0), Y0 + (close ? 27 : 15), String(tc), 'k2', close ? 'start' : 'middle');
    o += t(sx(0.35), sy(0.399) - 4, 'N(0, 1)', 'k1', 'start');
    o += t(sx(-1.9), sy(0.11), 't, df = ' + df, 'k2', 'end');
    o += t(sx(3.4), sy(0.07), 'fatter tail', 'k2', 'middle');
    return { svg: svg(o, close ? 210 : null), cap: 'Each curve leaves 2.5% in the upper tail past its own cut-off: 1.96 for the normal, ' + tc + ' for t with ' + df + ' df. As df grows, t closes in on the normal.' };
  };

  /** A chi-square curve with its 5% rejection region and an observed statistic. */
  G.econ378Chisq = function (a) {
    var k = a.k || 5, crit = a.crit || 11.07, obs = a.obs;
    var sx = scale(0, 22, X0, X1), sy = scale(0, 0.18, Y0, Y1 + 10);
    var f = function (x) { return chipdf(x, k); }, g = function (x) { return chipdf(x, 10); };
    var o = under(f, crit, 22, sx, sy, 'fill2') + axes('χ²', '');
    o += curve(plot(g, 0.05, 22, sx, sy, 90), 'c4 dash');
    o += curve(plot(f, 0.05, 22, sx, sy, 90), 'c1');
    [0, 5, 15, 20].forEach(function (v) { o += tick(sx(v), v); });
    o += ln(sx(crit), Y0, sx(crit), sy(f(crit)) - 2, 'c2') + t(sx(crit), Y0 + 15, fmt(crit), 'k2', 'middle');
    o += t(sx(3), sy(f(3)) - 8, 'k = ' + k, 'k1', 'middle');
    o += t(sx(10.5), sy(g(8)) - 10, 'k = 10', 'lb', 'start');
    o += t(sx(17.6), sy(0.05), '5%: reject', 'k2', 'middle');
    if (obs) {
      o += ln(sx(obs), Y0, sx(obs), sy(0.06), 'c4');
      o += t(sx(obs) + 3, sy(0.06) - 4, 'observed ' + fmt(obs), 'b', 'start');
    }
    return { svg: svg(o), cap: 'Chi-square with k df: right-skewed, mean k, variance 2k, and only positive values. Tests use the upper tail.' };
  };

  // --------------------------------------------- unit 4 · sampling & CLT

  /** The CLT: a skewed population and the exact distribution of x̄ for two sample sizes. */
  G.econ378Clt = function (a) {
    var n1 = a.n1 || 4, n2 = a.n2 || 30;
    var sx = scale(0, 3, X0, X1), sy = scale(0, 2.45, Y0, Y1 + 8);
    var pop = function (x) { return Math.exp(-x); };
    var o = axes('value', '');
    o += area([[sx(0), sy(0)]].concat(plot(pop, 0, 3, sx, sy, 60), [[sx(3), sy(0)]]), 'fill2');
    o += curve(plot(pop, 0, 3, sx, sy, 60), 'c2');
    o += curve(plot(function (x) { return meanExp(x, n1); }, 0.01, 3, sx, sy, 120), 'c4');
    o += curve(plot(function (x) { return meanExp(x, n2); }, 0.01, 3, sx, sy, 160), 'c1');
    o += ln(sx(1), Y0, sx(1), Y1 + 2, 'c4 dash faint');
    o += tick(sx(1), 'μ');
    o += t(sx(0.12), sy(1) - 6, 'population', 'k2', 'start');
    o += t(sx(1.55), sy(meanExp(1.55, n1)) - 6, 'x̄, n = ' + n1, 'b', 'start');
    o += t(sx(1.22), sy(1.6), 'x̄, n = ' + n2, 'k1', 'start');
    return { svg: svg(o), cap: 'Population: strongly right-skewed (exponential). The distribution of x̄ loses the skew and narrows as n grows: by n = 30 it is close to normal, centred on μ.' };
  };

  /** Normal sampling distributions narrowing as n grows (SE = σ/√n). */
  G.econ378Sampling = function (a) {
    var ns = a.ns || [4, 16, 64], theta = a.theta || 'μ';
    var sx = scale(-3.4, 3.4, X0, X1);
    // Widest curve gets SE 1.1; the others shrink by √(n₁/n).
    var se0 = 1.1, top = npdf(0) / (se0 * Math.sqrt(ns[0] / ns[ns.length - 1]));
    var sy = scale(0, top * 1.12, Y0, Y1 + 8);
    var o = axes(a.xl || 'x̄', '');
    var cls = ['c4', 'c2', 'c1'], txt = ['b', 'k2', 'k1'];
    var psd = se0 * Math.sqrt(ns[0]);
    if (a.pop) o += curve(plot(function (x) { return npdf(x / psd) / psd; }, -3.4, 3.4, sx, sy, 80), 'c4 dash');
    if (a.pop) o += t(sx(-2.2), sy(npdf(2.2 / psd) / psd) - 6, 'population', 'lb', 'middle');
    ns.forEach(function (n, k) {
      var se = se0 * Math.sqrt(ns[0] / n);
      var f = function (x) { return npdf(x / se) / se; };
      o += curve(plot(f, -3.4, 3.4, sx, sy, 160), cls[k]);
      var lx = se * 1.15;
      o += t(sx(lx) + 4, sy(f(lx)) - 2, (a.lab ? a.lab[k] : 'n = ' + n), txt[k], 'start');
    });
    o += ln(sx(0), Y0, sx(0), Y1 + 2, 'c4 dash faint') + tick(sx(0), theta);
    return { svg: svg(o), cap: a.cap || 'Each fourfold increase in n halves the standard error σ/√n, so the sampling distribution piles up ever closer to the true value.' };
  };

  /** Bias vs variance: where an estimator's sampling distribution is centred, and how wide it is. */
  G.econ378Bias = function () {
    var sx = scale(-3.4, 4.2, X0, X1), sy = scale(0, 0.85, Y0, Y1 + 8);
    var f1 = function (x) { return npdf(x / 1.2) / 1.2; }, f2 = function (x) { return npdf((x - 1.6) / 0.55) / 0.55; };
    var o = axes('estimate', '');
    o += curve(plot(f1, -3.4, 4.2, sx, sy, 100), 'c1') + curve(plot(f2, -3.4, 4.2, sx, sy, 100), 'c2');
    o += ln(sx(0), Y0, sx(0), Y1 + 2, 'c4 dash faint') + tick(sx(0), 'true θ', 'b');
    o += tick(sx(1.6), 'E[θ̂₂]', 'k2');
    o += t(sx(-1.75), sy(f1(-1.6)) - 20, 'unbiased', 'k1', 'end');
    o += t(sx(-1.75), sy(f1(-1.6)) - 8, 'centred on θ', 'lb', 'end');
    o += t(sx(2.2), sy(0.5), 'biased,', 'k2', 'start') + t(sx(2.2), sy(0.5) + 13, 'but precise', 'k2', 'start');
    o += ln(sx(0), sy(0.8), sx(1.6), sy(0.8), 'c2') + ln(sx(1.6), sy(0.8) - 4, sx(1.6), sy(0.8) + 4, 'c2') + t(sx(0.8), sy(0.8) - 5, 'bias', 'k2', 'middle');
    return { svg: svg(o), cap: 'Unbiased means the sampling distribution is centred on the truth. A biased estimator can still land closer on average if its spread is much smaller.' };
  };

  // ---------------------------------------------------- unit 5 · inference

  /** Twenty 95% intervals from twenty samples: most cover μ, about one misses. */
  G.econ378Intervals = function (a) {
    var n = 20, zs = draws(a.seed || 5, n), miss = a.miss == null ? 13 : a.miss;
    zs.forEach(function (z, k) { if (k !== miss) zs[k] = Math.max(-1.85, Math.min(1.85, z)); });
    zs[miss] = 2.3;
    var sx = scale(-4.4, 6, X0 - 24, X1 + 10);
    var o = ln(sx(0), 8, sx(0), 176, 'c4 dash');
    o += t(sx(0), 190, 'true μ (fixed)', 'b', 'middle');
    zs.forEach(function (z, k) {
      var y = 12 + k * 8, hit = Math.abs(z) <= 1.96;
      o += ln(sx(z - 1.96), y, sx(z + 1.96), y, hit ? 'c1' : 'c2');
      o += circle(sx(z), y, 2.2, hit ? 'solid1' : 'solid2');
    });
    o += t(sx(zs[miss] + 1.96) + 4, 12 + miss * 8 + 4, 'misses μ', 'k2', 'start');
    return { svg: svg(o, 198), cap: 'Each line is x̄ ± 1.96·SE from a new sample. The method captures μ 95% of the time; any one interval either contains μ or it doesn’t.' };
  };

  /** A z test: rejection region(s) at α, the observed statistic and its p-value. */
  G.econ378Test = function (a) {
    var two = a.tails !== 'right', alpha = a.alpha || 0.05, zo = a.z == null ? 2 : a.z;
    var crit = two ? (alpha === 0.05 ? 1.96 : 2.576) : 1.645;
    var sx = scale(-3.7, 3.7, X0, X1), sy = scale(0, 0.43, Y0, Y1 + 10);
    var o = under(npdf, crit, 3.7, sx, sy, 'fill2');
    if (two) o += under(npdf, -3.7, -crit, sx, sy, 'fill2');
    o += under(npdf, zo, 3.7, sx, sy, 'fill1');
    if (two) o += under(npdf, -3.7, -zo, sx, sy, 'fill1');
    o += axes('z', '');
    o += curve(plot(npdf, -3.7, 3.7, sx, sy, 90), 'c1');
    o += tick(sx(0), '0');
    o += ln(sx(crit), Y0, sx(crit), sy(npdf(crit)), 'c2') + t(sx(crit) - 3, Y0 + 15, String(crit), 'k2', 'end');
    if (two) o += ln(sx(-crit), Y0, sx(-crit), sy(npdf(crit)), 'c2') + t(sx(-crit), Y0 + 15, '−' + fmt(crit), 'k2', 'middle');
    o += ln(sx(zo), Y0, sx(zo), Y1 + 26, 'c4');
    o += t(X1, Y1 + 20, 'observed z = ' + fmt(zo), 'b', 'end');
    o += t(sx(0), sy(0.14), 'fail to reject H₀', 'lb', 'middle');
    o += t(sx(3.1), sy(0.075), 'reject', 'k2', 'middle');
    if (two) o += t(sx(-3.1), sy(0.075), 'reject', 'k2', 'middle');
    return { svg: svg(o), cap: a.cap || ((two ? 'Two-sided' : 'One-sided') + ' test at α = ' + alpha + ': orange = rejection region' + (two ? ' (' + alpha / 2 + ' in each tail)' : '') + '. Blue = the p-value, the area at least as extreme as the observed z.') };
  };

  /** Type I and II errors: the sampling distribution under H₀ and under Hₐ. */
  G.econ378Errors = function (a) {
    var d = a.d || 2.4, c = 1.645, pw = a.mode === 'power';
    var sx = scale(-3.2, d + 3.2, X0, X1), sy = scale(0, 0.47, Y0, Y1 + 18);
    var f1 = function (x) { return npdf(x - d); };
    var o = '';
    o += under(npdf, c, d + 3.2, sx, sy, 'fill2');
    o += pw ? under(f1, c, d + 3.2, sx, sy, 'fill1') : under(f1, -3.2, c, sx, sy, 'fill3');
    o += axes('test statistic', '');
    o += curve(plot(npdf, -3.2, d + 3.2, sx, sy, 100), 'c4');
    o += curve(plot(f1, -3.2, d + 3.2, sx, sy, 100), 'c1');
    o += ln(sx(c), Y0, sx(c), Y1 + 14, 'c2') + t(sx(c), Y1 + 9, 'critical value', 'k2', 'middle');
    o += tick(sx(0), '0', 'b') + tick(sx(d), 'true effect', 'k1');
    o += t(sx(-1.3), sy(npdf(1.3)) - 10, 'if H₀ true', 'b', 'end');
    o += t(sx(d + 1.3), sy(npdf(1.3)) - 10, 'if Hₐ true', 'k1', 'start');
    o += t(sx(c + 0.45), sy(0.025), 'α', 'k2', 'middle');
    if (pw) o += t(sx(d + 0.3), sy(0.17), 'power', 'k1', 'middle') + t(sx(d + 0.3), sy(0.17) + 12, '1 − β', 'k1', 'middle');
    else o += t(sx(c - 0.45), sy(0.06), 'β', 'k3', 'middle');
    return { svg: svg(o), cap: pw ? 'Power is the share of the Hₐ curve past the critical value. A bigger effect, larger n (narrower curves) or a larger α all push more of it over the line.' : 'Orange (α): H₀ is true but the statistic lands past the cut-off, a Type I error. Green (β): Hₐ is true but it falls short, a Type II error. Moving the cut-off trades one for the other.' };
  };

  // --------------------------------------------------- unit 6 · regression

  /** The running five-point data set with its OLS line. */
  G.econ378Scatter = function (a) {
    var xs = [1, 2, 3, 4, 5], ys = [2, 4, 5, 4, 5], b0 = 2.2, b1 = 0.6;
    var sx = scale(0, 6, X0, X1), sy = scale(0, 6.5, Y0, Y1);
    var o = axes('x', 'y');
    for (var v = 1; v <= 5; v++) o += tick(sx(v), v);
    for (var w = 2; w <= 6; w += 2) o += t(X0 - 5, sy(w) + 4, w, 'lb', 'end');
    o += ln(sx(0.3), sy(b0 + b1 * 0.3), sx(5.8), sy(b0 + b1 * 5.8), 'c1');
    o += t(X1, sy(1), 'ŷ = 2.2 + 0.6x', 'k1', 'end');
    if (a.mode === 'r2') {
      o += ln(sx(0.3), sy(4), sx(5.8), sy(4), 'c4 dash');
      o += t(sx(5.8), sy(4) - 6, 'ȳ = 4', 'lb', 'end');
      o += ln(sx(1) - 9, sy(2), sx(1) - 9, sy(4), 'c4');
      o += ln(sx(1), sy(2.8), sx(1), sy(4), 'c3');
      o += ln(sx(1), sy(2), sx(1), sy(2.8), 'c2');
      o += t(sx(1) - 13, sy(3) + 4, 'y − ȳ', 'b', 'end');
      o += t(sx(1) + 5, sy(3.55), 'ŷ − ȳ', 'k3', 'start');
      o += t(sx(1) + 5, sy(2.3) + 4, 'y − ŷ', 'k2', 'start');
    } else {
      o += ln(sx(3), sy(4), sx(3), sy(5), 'c2');
      o += t(sx(3) - 6, sy(4.5) + 4, 'e = +1', 'k2', 'end');
      o += circle(sx(3), sy(4), 5, 'c4');
      o += t(sx(3) + 7, sy(4) + 14, '(x̄, ȳ) = (3, 4)', 'lb', 'start');
    }
    xs.forEach(function (x, k) { o += dot(sx(x), sy(ys[k])); });
    return { svg: svg(o), cap: a.mode === 'r2' ? 'For each point, total deviation (y − ȳ) = explained (ŷ − ȳ) + residual (y − ŷ). R² = explained share of the total sum of squares: 1 − 2.4/6 = 0.6.' : 'OLS picks the line that minimises the sum of squared vertical gaps (residuals). It always passes through (x̄, ȳ).' };
  };
})();
