// Drawing helpers for the model dashboards: axes with real tick marks, curves
// from data, guides, arrows, and a ghost of the previous state. Every chart
// is plain SVG text, styled by the page's svg classes (c1, c2, dash, faint,
// …), so the model's colour comes from the --wk variable on its container.

var CH = (function () {
  "use strict";

  function r(v) { return Math.round(v * 10) / 10; }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  function fmt(v, d) {
    if (v == null || !isFinite(v)) return "—";
    if (d == null) {
      var a = Math.abs(v);
      d = a >= 1000 ? 0 : a >= 100 ? 1 : a >= 10 ? 2 : a >= 1 ? 3 : 3;
    }
    var s = v.toFixed(d);
    if (Math.abs(v) >= 1000) s = Number(s).toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
    return s.replace(/^-/, "−");
  }

  /** Round-number ticks between lo and hi. */
  function ticks(lo, hi, n) {
    var span = hi - lo;
    if (!(span > 0)) return [lo];
    var step = Math.pow(10, Math.floor(Math.log10(span / n)));
    var err = (n * step) / span;
    if (err <= 0.15) step *= 10; else if (err <= 0.35) step *= 5; else if (err <= 0.75) step *= 2;
    var out = [];
    for (var v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }

  function tickLabel(v) {
    var a = Math.abs(v);
    if (a >= 10000) return (v / 1000).toFixed(0) + "k";
    if (a >= 1000) return v.toLocaleString("en-US");
    if (a === 0) return "0";
    if (a < 0.01) return v.toExponential(0);
    return String(+v.toFixed(a < 1 ? 3 : 2));
  }

  /**
   * A plot frame. Returns scales and the axis markup.
   * o = {w, h, x:[lo,hi], y:[lo,hi], xLabel, yLabel, pad:{l,r,t,b}, log}
   */
  function frame(o) {
    var w = o.w || 560, h = o.h || 300;
    var pad = Object.assign({ l: 52, r: 18, t: 16, b: 38 }, o.pad || {});
    var X0 = pad.l, X1 = w - pad.r, Y0 = h - pad.b, Y1 = pad.t;
    var ylo = o.y[0], yhi = o.y[1];
    var lg = o.logY;
    var tY = lg ? function (v) { return Math.log10(v); } : function (v) { return v; };
    var sx = function (v) { return X0 + (v - o.x[0]) * (X1 - X0) / (o.x[1] - o.x[0]); };
    var sy = function (v) { return Y0 - (tY(v) - tY(ylo)) * (Y0 - Y1) / (tY(yhi) - tY(ylo)); };
    var s = "";
    var xt = o.xTicks || ticks(o.x[0], o.x[1], 6);
    var yt = o.yTicks || (lg ? logTicks(ylo, yhi) : ticks(ylo, yhi, 5));
    yt.forEach(function (v) {
      s += '<line x1="' + X0 + '" x2="' + X1 + '" y1="' + r(sy(v)) + '" y2="' + r(sy(v)) + '" class="grid"/>';
      s += '<text x="' + (X0 - 6) + '" y="' + r(sy(v) + 3.5) + '" class="lb" text-anchor="end">' + (o.yFmt ? o.yFmt(v) : tickLabel(v)) + "</text>";
    });
    xt.forEach(function (v) {
      s += '<line x1="' + r(sx(v)) + '" x2="' + r(sx(v)) + '" y1="' + Y0 + '" y2="' + (Y0 + 4) + '" class="ax"/>';
      s += '<text x="' + r(sx(v)) + '" y="' + (Y0 + 16) + '" class="lb" text-anchor="middle">' + (o.xFmt ? o.xFmt(v) : tickLabel(v)) + "</text>";
    });
    s += '<line x1="' + X0 + '" y1="' + Y1 + '" x2="' + X0 + '" y2="' + Y0 + '" class="ax"/>';
    s += '<line x1="' + X0 + '" y1="' + Y0 + '" x2="' + X1 + '" y2="' + Y0 + '" class="ax"/>';
    if (o.xLabel) s += '<text x="' + X1 + '" y="' + (Y0 + 32) + '" class="it" text-anchor="end">' + o.xLabel + "</text>";
    if (o.yLabel) s += '<text x="' + (X0 + 6) + '" y="' + (Y1 + 2) + '" class="it">' + o.yLabel + "</text>";
    return { w: w, h: h, sx: sx, sy: sy, X0: X0, X1: X1, Y0: Y0, Y1: Y1, axes: s,
             clip: function (y) { return Math.max(Y1, Math.min(Y0, y)); } };
  }

  function logTicks(lo, hi) {
    var out = [];
    for (var p = Math.ceil(Math.log10(lo)); p <= Math.floor(Math.log10(hi)); p++) out.push(Math.pow(10, p));
    if (out.length > 7) out = out.filter(function (_, k) { return k % Math.ceil(out.length / 6) === 0; });
    return out;
  }

  function svg(f, inner, label) {
    return '<svg viewBox="0 0 ' + f.w + " " + f.h + '" role="img"' + (label ? ' aria-label="' + esc(label) + '"' : "") + ">" +
      '<defs><marker id="mah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M0 0L10 5L0 10z" class="arrowhead"/></marker></defs>' + f.axes + inner + "</svg>";
  }

  /** Data points → a path, clipped to the plot box vertically. */
  function line(f, pts, cls, extra) {
    var d = "", pen = false;
    pts.forEach(function (p) {
      var x = f.sx(p[0]), y = f.sy(p[1]);
      if (!isFinite(y) || y < f.Y1 - 0.5 || y > f.Y0 + 0.5) { pen = false; return; }
      d += (pen ? "L" : "M") + r(x) + " " + r(y);
      pen = true;
    });
    return d ? '<path d="' + d + '" class="' + cls + '"' + (extra || "") + "/>" : "";
  }

  function fn(f, g, lo, hi, cls, n) {
    var pts = [];
    n = n || 90;
    for (var k = 0; k <= n; k++) { var x = lo + (hi - lo) * k / n; pts.push([x, g(x)]); }
    return line(f, pts, cls);
  }

  function vline(f, x, cls, y) {
    return '<line x1="' + r(f.sx(x)) + '" x2="' + r(f.sx(x)) + '" y1="' + r(y == null ? f.Y1 : f.clip(f.sy(y))) + '" y2="' + f.Y0 + '" class="' + cls + '"/>';
  }
  function hline(f, y, cls, x) {
    return '<line x1="' + f.X0 + '" x2="' + r(x == null ? f.X1 : f.sx(x)) + '" y1="' + r(f.sy(y)) + '" y2="' + r(f.sy(y)) + '" class="' + cls + '"/>';
  }
  function dot(f, x, y, cls) {
    var X = f.sx(x), Y = f.sy(y);
    if (!isFinite(Y) || Y < f.Y1 - 1 || Y > f.Y0 + 1 || X < f.X0 - 1 || X > f.X1 + 1) return "";
    return '<circle cx="' + r(X) + '" cy="' + r(Y) + '" r="4.5" class="' + (cls || "dot") + '"/>';
  }
  /** A label in plot units, nudged inside the box so it never hangs off. */
  function text(f, x, y, s, cls, anchor, dx, dy) {
    var X = f.sx(x) + (dx || 0), Y = f.sy(y) + (dy || 0);
    var room = s.replace(/<[^>]+>/g, "").length * 6.2;
    if (!anchor || anchor === "start") X = Math.min(X, f.w - 4 - room);
    if (anchor === "end") X = Math.max(X, room + 4);
    Y = Math.max(f.Y1 + 10, Math.min(f.h - 4, Y));
    return '<text x="' + r(X) + '" y="' + r(Y) + '" class="' + (cls || "") + '"' + (anchor ? ' text-anchor="' + anchor + '"' : "") + ">" + s + "</text>";
  }
  function arrow(x1, y1, x2, y2, cls) {
    return '<line x1="' + r(x1) + '" y1="' + r(y1) + '" x2="' + r(x2) + '" y2="' + r(y2) + '" class="' + (cls || "c4") + '" marker-end="url(#mah)"/>';
  }

  /**
   * A line chart from series. spec = {title, x:[lo,hi]?, y:[lo,hi]?, xLabel, yLabel,
   * series:[{name, pts, cls}], marks:[{x, y, label, cls}], hlines:[{y, label, cls}]}
   */
  function lineChart(spec) {
    var xs = [], ys = [];
    spec.series.forEach(function (s) { s.pts.forEach(function (p) { if (isFinite(p[1])) { xs.push(p[0]); ys.push(p[1]); } }); });
    (spec.hlines || []).forEach(function (h) { ys.push(h.y); });
    var xr = spec.x || [Math.min.apply(null, xs), Math.max.apply(null, xs)];
    var lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys);
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    var padY = (hi - lo) * 0.12;
    var yr = spec.y || [spec.zero ? Math.min(0, lo) : lo - padY, hi + padY];
    var f = frame({ w: spec.w || 560, h: spec.h || 230, x: xr, y: yr, xLabel: spec.xLabel, yLabel: spec.yLabel, logY: spec.logY,
                    yFmt: spec.yFmt, pad: { l: 56, r: 16, t: 26, b: 36 } });
    var inner = "";
    (spec.hlines || []).forEach(function (h) {
      inner += hline(f, h.y, h.cls || "c4 dash faint");
      if (h.label) inner += text(f, xr[1], h.y, h.label, h.lcls || "lb", "end", -2, -5);
    });
    spec.series.forEach(function (s) { inner += line(f, s.pts, s.cls || "c1"); });
    (spec.marks || []).forEach(function (m) {
      inner += dot(f, m.x, m.y, m.cls);
      if (m.label) inner += text(f, m.x, m.y, m.label, m.lcls || "lb", m.anchor, m.dx != null ? m.dx : 7, m.dy != null ? m.dy : -8);
    });
    // Legend across the top.
    var lx = f.X0 + 4;
    spec.series.forEach(function (s) {
      if (!s.name) return;
      inner += '<line x1="' + lx + '" x2="' + (lx + 16) + '" y1="11" y2="11" class="' + (s.cls || "c1") + '"/>' +
        '<text x="' + (lx + 21) + '" y="15" class="lb">' + s.name + "</text>";
      lx += 34 + s.name.replace(/<[^>]+>/g, "").length * 6;
    });
    return svg(f, inner, spec.title);
  }

  /**
   * Horizontal stacked bars showing proportions.
   * spec = {rows:[{label, total?, parts:[{name, value, cls}]}], unit, fmt}
   */
  function barChart(spec) {
    var w = spec.w || 560, rowH = 46, top = 8;
    var h = top + spec.rows.length * rowH + 6;
    var X0 = 120, X1 = w - 14;
    var max = 0;
    spec.rows.forEach(function (row) {
      var sum = row.parts.reduce(function (a, p) { return a + Math.max(0, p.value); }, 0);
      max = Math.max(max, spec.share ? 1 : sum);
    });
    if (!(max > 0)) max = 1;
    var s = "";
    spec.rows.forEach(function (row, k) {
      var y = top + k * rowH;
      var sum = row.parts.reduce(function (a, p) { return a + Math.max(0, p.value); }, 0);
      s += '<text x="' + (X0 - 10) + '" y="' + (y + 19) + '" class="b" text-anchor="end">' + row.label + "</text>";
      if (row.sub) s += '<text x="' + (X0 - 10) + '" y="' + (y + 32) + '" class="lb" text-anchor="end">' + row.sub + "</text>";
      var x = X0;
      row.parts.forEach(function (p) {
        var v = Math.max(0, p.value);
        var bw = (X1 - X0) * (spec.share ? (sum ? v / sum : 0) : v / max);
        if (bw <= 0) return;
        s += '<rect x="' + r(x) + '" y="' + (y + 4) + '" width="' + r(Math.max(bw, 0.5)) + '" height="26" rx="4" class="' + p.cls + '"/>';
        var pct = sum ? Math.round(100 * v / sum) : 0;
        var lab = p.name + " " + (spec.fmt ? spec.fmt(p.value) : fmt(p.value)) + (spec.pct === false ? "" : " · " + pct + "%");
        if (bw > lab.length * 6.1 + 10) s += '<text x="' + r(x + 8) + '" y="' + (y + 21) + '" class="w">' + lab + "</text>";
        else if (bw > p.name.length * 6.5 + 8) s += '<text x="' + r(x + 6) + '" y="' + (y + 21) + '" class="w">' + p.name + "</text>";
        x += bw;
      });
      (row.neg || []).forEach(function (p) {
        s += '<text x="' + r(Math.min(x + 6, X1 - 120)) + '" y="' + (y + 21) + '" class="' + (p.lcls || "lb") + '">' + p.name + " " + (spec.fmt ? spec.fmt(p.value) : fmt(p.value)) + "</text>";
      });
    });
    return '<svg viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(spec.title || "proportions") + '">' + s + "</svg>";
  }

  /** A bare SVG with the arrow marker, for drawings that aren't plots. */
  function raw(w, h, inner, label) {
    return '<svg viewBox="0 0 ' + w + " " + h + '" role="img"' + (label ? ' aria-label="' + esc(label) + '"' : "") + ">" +
      '<defs><marker id="mah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M0 0L10 5L0 10z" class="arrowhead"/></marker></defs>' + inner + "</svg>";
  }

  return { raw: raw, fmt: fmt, ticks: ticks, frame: frame, svg: svg, line: line, fn: fn, vline: vline, hline: hline,
           dot: dot, text: text, arrow: arrow, lineChart: lineChart, barChart: barChart, esc: esc };
})();
