// The helper kit behind each class's interactive tools (classes/<id>.js).
//
// A class file calls Study.course({ id, tools: [{ id, name, blurb, mount(el) }] })
// and uses the helpers here (h, chart, slider, select, load/save, fmt) to
// build its tools. The app's Tools tab (tools/web/host.js) mounts them.
// Split out of the old classes/study.js page engine, whose cards and practice
// moved to the shared ECON 381 app.
(function () {
  "use strict";

  var C = null;                 // the course the tools belong to

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /** h("div", { class: "x", onclick: fn, html: "<b>raw</b>" }, child, "text", [more]) */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    for (var k in attrs || {}) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "html") el.innerHTML = v;
      else if (k === "text") el.textContent = v;
      else if (k.slice(0, 2) === "on" && typeof v === "function") el.addEventListener(k.slice(2), v);
      else if (k === "value") el.value = v;
      else if (k === "checked") el.checked = !!v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (k) { add(el, k); }); return; }
    el.appendChild(typeof kid === "object" ? kid : document.createTextNode(String(kid)));
  }

  function fmt(x, d) {
    if (x == null || !isFinite(x)) return "—";
    d = d == null ? 2 : d;
    var s = Number(x).toFixed(d);
    if (/^-0(\.0*)?$/.test(s)) s = s.slice(1);
    return s.replace("-", "−");
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i];
      a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var mem = {};
  function key(k) { return "study." + (C ? C.id : "x") + "." + k; }
  function load(k, def) {
    try {
      var v = localStorage.getItem(key(k));
      return v == null ? def : JSON.parse(v);
    } catch (e) { return key(k) in mem ? mem[key(k)] : def; }
  }
  function save(k, v) {
    try { localStorage.setItem(key(k), JSON.stringify(v)); } catch (e) { mem[key(k)] = v; }
  }

  /** A labelled range input: slider("Price", {min, max, step, value, fmt}, onInput). */
  function slider(label, o, on) {
    var out = h("output");
    var inp = h("input", { type: "range", min: o.min, max: o.max, step: o.step || 1, value: o.value, "aria-label": label });
    var show = function () { out.textContent = o.fmt ? o.fmt(+inp.value) : inp.value; };
    inp.addEventListener("input", function () { show(); if (on) on(+inp.value); });
    show();
    var el = h("label", { class: "slider" }, h("span", null, label), out, inp);
    return { el: el, input: inp, get value() { return +inp.value; },
             set: function (v) { inp.value = v; show(); } };
  }

  function select(label, options, value, on) {
    var s = h("select", { onchange: function () { on(s.value); } },
      options.map(function (o) {
        var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o;
        return h("option", { value: v, selected: v === value ? "selected" : null }, t);
      }));
    s.value = value;
    return { el: h("label", { class: "f" }, label, s), input: s };
  }

  function niceTicks(a, b, n) {
    var span = b - a, step = Math.pow(10, Math.floor(Math.log10(span / (n || 5))));
    var err = span / (n || 5) / step;
    if (err >= 7.5) step *= 10; else if (err >= 3.5) step *= 5; else if (err >= 1.5) step *= 2;
    var out = [];
    for (var v = Math.ceil(a / step - 1e-9) * step; v <= b + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }

  var clipN = 0;
  /** An SVG chart built as a string. Data coordinates in, svg() out. */
  function chart(o) {
    var w = o.w || 640, H = o.h || 380;
    var m = Object.assign({ l: 50, r: 16, t: 14, b: 40 }, o.m || {});
    var x0 = o.x[0], x1 = o.x[1], y0 = o.y[0], y1 = o.y[1];
    var X = function (v) { return m.l + (v - x0) / (x1 - x0) * (w - m.l - m.r); };
    var Y = function (v) { return H - m.b - (v - y0) / (y1 - y0) * (H - m.t - m.b); };
    var clip = "clp" + (++clipN);
    var parts = [];
    var at = function (a) {
      var s = "";
      for (var k in a || {}) if (a[k] != null) s += " " + k + '="' + esc(a[k]) + '"';
      return s;
    };
    var pts = function (p) { return p.map(function (q) { return X(q[0]).toFixed(1) + "," + Y(q[1]).toFixed(1); }).join(" "); };
    var c = {
      X: X, Y: Y, w: w, h: H, m: m,
      invert: function (px, py) {
        return [x0 + (px - m.l) / (w - m.l - m.r) * (x1 - x0), y0 + (H - m.b - py) / (H - m.t - m.b) * (y1 - y0)];
      },
      axes: function (ao) {
        ao = ao || {};
        var xt = ao.xticks || niceTicks(x0, x1, ao.nx || 6), yt = ao.yticks || niceTicks(y0, y1, ao.ny || 5);
        var xf = ao.xfmt || function (v) { return String(+v.toFixed(4)); }, yf = ao.yfmt || xf;
        if (ao.grid !== false) yt.forEach(function (v) {
          parts.push('<line x1="' + m.l + '" x2="' + (w - m.r) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="rgba(43,33,24,.07)"/>');
        });
        parts.push('<line x1="' + m.l + '" x2="' + (w - m.r) + '" y1="' + (H - m.b) + '" y2="' + (H - m.b) + '" stroke="#8a7f74"/>');
        if (ao.yaxis !== false) parts.push('<line x1="' + m.l + '" x2="' + m.l + '" y1="' + m.t + '" y2="' + (H - m.b) + '" stroke="#8a7f74"/>');
        xt.forEach(function (v) {
          parts.push('<text x="' + X(v) + '" y="' + (H - m.b + 16) + '" font-size="11" text-anchor="middle" fill="#85796E">' + esc(xf(v)) + "</text>");
        });
        if (ao.yaxis !== false) yt.forEach(function (v) {
          parts.push('<text x="' + (m.l - 6) + '" y="' + (Y(v) + 4) + '" font-size="11" text-anchor="end" fill="#85796E">' + esc(yf(v)) + "</text>");
        });
        if (ao.xlabel) parts.push('<text x="' + (w - m.r) + '" y="' + (H - 6) + '" font-size="12" font-weight="600" text-anchor="end" fill="#2B2118">' + esc(ao.xlabel) + "</text>");
        if (ao.ylabel) parts.push('<text x="' + (m.l + 6) + '" y="' + (m.t + 10) + '" font-size="12" font-weight="600" fill="#2B2118">' + esc(ao.ylabel) + "</text>");
        return c;
      },
      path: function (p, a) { parts.push('<polyline clip-path="url(#' + clip + ')" fill="none" points="' + pts(p) + '"' + at(Object.assign({ stroke: "#2B2118", "stroke-width": 2, "stroke-linejoin": "round" }, a)) + "/>"); return c; },
      area: function (p, a) { parts.push('<polygon clip-path="url(#' + clip + ')" points="' + pts(p) + '"' + at(Object.assign({ stroke: "none" }, a)) + "/>"); return c; },
      line: function (ax, ay, bx, by, a) { parts.push('<line clip-path="url(#' + clip + ')" x1="' + X(ax) + '" y1="' + Y(ay) + '" x2="' + X(bx) + '" y2="' + Y(by) + '"' + at(Object.assign({ stroke: "#2B2118", "stroke-width": 1.5 }, a)) + "/>"); return c; },
      rect: function (ax, ay, bx, by, a) {
        var l = Math.min(X(ax), X(bx)), t = Math.min(Y(ay), Y(by));
        parts.push('<rect clip-path="url(#' + clip + ')" x="' + l + '" y="' + t + '" width="' + Math.abs(X(bx) - X(ax)) + '" height="' + Math.abs(Y(by) - Y(ay)) + '"' + at(a) + "/>");
        return c;
      },
      dot: function (x, y, r, a) { parts.push('<circle cx="' + X(x) + '" cy="' + Y(y) + '" r="' + (r || 4) + '"' + at(Object.assign({ fill: "#2B2118" }, a)) + "/>"); return c; },
      text: function (x, y, s, a) { parts.push("<text" + at(Object.assign({ x: X(x), y: Y(y), "font-size": 12, fill: "#2B2118" }, a)) + ">" + esc(s) + "</text>"); return c; },
      raw: function (s) { parts.push(s); return c; },
      svg: function (extra) {
        return '<svg class="plot" viewBox="0 0 ' + w + " " + H + '" role="img"' + (extra || "") + '><defs><clipPath id="' + clip + '"><rect x="' + m.l +
          '" y="' + m.t + '" width="' + (w - m.l - m.r) + '" height="' + (H - m.t - m.b) + '"/></clipPath></defs>' + parts.join("") + "</svg>";
      },
    };
    return c;
  }

  window.Study = {
    h: h, esc: esc, fmt: fmt, shuffle: shuffle, load: load, save: save,
    slider: slider, select: select, chart: chart, niceTicks: niceTicks,
    course: function (cfg) { C = cfg; window.COURSE_TOOLS = cfg; },
  };
})();
