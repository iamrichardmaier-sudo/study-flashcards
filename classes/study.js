// The shared engine behind the class pages (econ210.html and friends).
//
// A class page loads nav.js, this file, then its own classes/<id>.js, which
// calls Study.course({...}) with:
//
//   id, code, title, blurb, color
//   groups    [{ id, name }]                         card/question groups
//   cards     [{ id, group, term, def, more? }]       flashcards (HTML allowed)
//   practice  [{ id, group, q, options: [{ t, right?, why }], explain }]
//   tools     [{ id, name, blurb, mount(el) }]        interactive tools
//
// and this file builds the page: Flashcards / Practice / Tools tabs, routed by
// the URL hash (#flashcards, #practice, #tools/<tool id>). Everything saves
// to localStorage under "study.<id>.". Helpers for tools (h, chart, slider,
// load/save, fmt) hang off window.Study.
(function () {
  "use strict";

  var C = null;                 // the course
  var app, mainEl, tabBtns = {};
  var keyHandler = null;        // the active view's keyboard handler
  var MIN = 60e3, HOUR = 60 * MIN, DAY = 24 * HOUR;

  // ------------------------------------------------------------ helpers

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

  // ------------------------------------------------------------- shell

  var ICONS = {
    flashcards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.8 2.2a2 2 0 0 0-1.6 0L2.6 6.1a1 1 0 0 0 0 1.8l8.6 3.9a2 2 0 0 0 1.6 0l8.6-3.9a1 1 0 0 0 0-1.8z"/><path d="m2 12.6 9.2 4.2a2 2 0 0 0 1.6 0L22 12.6"/><path d="m2 17.6 9.2 4.2a2 2 0 0 0 1.6 0L22 17.6"/></svg>',
    practice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg>',
    tools: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
  };
  var TABS = [["flashcards", "Flashcards"], ["practice", "Practice"], ["tools", "Tools"]];

  function build() {
    document.title = C.code + " · " + C.title;
    var root = document.documentElement;
    root.style.setProperty("--c", C.color);
    root.style.setProperty("--c-soft", hexA(C.color, 0.1));
    app = document.getElementById("app") || document.body.appendChild(h("div", { id: "app" }));
    var tabs = h("div", { class: "st-tabs", role: "tablist" }, TABS.map(function (t) {
      return (tabBtns[t[0]] = h("button", { type: "button", class: "st-tab", html: ICONS[t[0]] + "<span>" + t[1] + "</span>",
        onclick: function () { location.hash = t[0]; } }));
    }));
    app.appendChild(h("nav", { class: "st-top", "aria-label": "Sections" },
      h("div", { class: "st-top-in" }, h("span", { class: "st-brand", "data-class-nav": "" }), tabs)));
    mainEl = h("main", { class: "st-main" });
    app.appendChild(mainEl);
    window.addEventListener("hashchange", route);
    document.addEventListener("keydown", function (e) {
      if (!keyHandler || e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target && e.target.tagName;
      if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
      keyHandler(e);
    });
    route();
  }

  function hexA(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }

  function head(title, sub) {
    return [
      h("div", { class: "st-phone-nav" }, h("span", { "data-class-nav": "" }), h("a", { href: "classes.html" }, "All classes")),
      h("div", { class: "st-h" }, h("h1", null, title), sub ? h("p", null, sub) : null),
    ];
  }

  function route() {
    var parts = (location.hash.slice(1) || "flashcards").split("/");
    var tab = TABS.some(function (t) { return t[0] === parts[0]; }) ? parts[0] : "flashcards";
    for (var k in tabBtns) tabBtns[k].setAttribute("aria-current", k === tab ? "page" : "false");
    keyHandler = null;
    mainEl.innerHTML = "";
    mainEl.className = "st-main";
    window.scrollTo(0, 0);
    if (tab === "flashcards") cardsMenu();
    else if (tab === "practice") practiceMenu();
    else toolsView(parts[1]);
    // The phone strip gets its switcher after nav.js has run.
    if (window.ClassNav && window.ClassNav.fill) window.ClassNav.fill(mainEl);
  }

  // -------------------------------------------------------- flashcards

  var INTERVAL = [0, HOUR, DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];

  function cardState() { return load("cards", {}); }
  function inGroup(g) { return function (x) { return !g || x.group === g; }; }
  function groupName(id) {
    var g = (C.groups || []).filter(function (x) { return x.id === id; })[0];
    return g ? g.name : "";
  }

  function groupChips(current, onPick, items) {
    var groups = (C.groups || []).filter(function (g) { return items.some(function (x) { return x.group === g.id; }); });
    if (groups.length < 2) return null;
    return h("div", { class: "chips" },
      h("button", { type: "button", class: "chip" + (!current ? " on" : ""), onclick: function () { onPick(null); } }, "All"),
      groups.map(function (g) {
        return h("button", { type: "button", class: "chip" + (current === g.id ? " on" : ""), onclick: function () { onPick(g.id); } }, g.name);
      }));
  }

  var cardGroup = null;
  function cardsMenu() {
    var st = cardState(), now = Date.now();
    var cards = C.cards.filter(inGroup(cardGroup));
    var fresh = cards.filter(function (c) { return !st[c.id]; });
    var due = cards.filter(function (c) { return st[c.id] && st[c.id].due <= now; });
    var solid = cards.filter(function (c) { return st[c.id] && st[c.id].box >= 3; });
    var todo = due.length + Math.min(fresh.length, 15);
    add(mainEl, head(C.code + " · " + C.title, C.blurb));
    add(mainEl, groupChips(cardGroup, function (g) { cardGroup = g; route(); }, C.cards));
    add(mainEl, h("div", { class: "tiles" },
      h("div", { class: "tile" }, h("b", null, fresh.length), h("span", null, "new")),
      h("div", { class: "tile" }, h("b", null, due.length), h("span", null, "due now")),
      h("div", { class: "tile" }, h("b", null, solid.length + "/" + cards.length), h("span", null, "solid"))));
    add(mainEl, h("button", { type: "button", class: "primary", disabled: todo ? null : "disabled",
      onclick: function () {
        var q = shuffle(due).concat(shuffle(fresh).slice(0, 15));
        session(q, true);
      } },
      h("span", null, todo ? "Study " + todo + " card" + (todo === 1 ? "" : "s") : "All caught up",
        h("small", null, todo ? due.length + " due, " + Math.min(fresh.length, 15) + " new" : "Nothing due. Cram below, or come back later.")),
      todo ? h("kbd", null, "Enter") : null));
    add(mainEl, h("div", { class: "row" },
      h("button", { type: "button", class: "btn", onclick: function () { session(shuffle(cards), false); } }, "Cram all " + cards.length + " (shuffled, nothing rescheduled)")));
    add(mainEl, h("p", { class: "dim small", style: "margin:0" },
      "Flip with Space or Enter. Then → Confident, ← Shaky, ↑/↓ Missed (or 3 / 2 / 1). Esc ends the session."));
    add(mainEl, h("p", { class: "sec" }, "All cards"));
    add(mainEl, h("div", { class: "browse" }, cards.map(function (c) {
      var s = st[c.id];
      var lv = !s ? "new" : s.box >= 3 ? "solid" : s.box >= 2 ? "learning" : "shaky";
      return h("details", null, h("summary", null, h("span", { html: c.term }), h("span", { class: "lv" }, lv)),
        h("p", { html: c.def }), c.more ? h("p", { class: "dim", html: c.more }) : null);
    })));
    keyHandler = function (e) {
      if (e.key === "Enter" && todo) { e.preventDefault(); mainEl.querySelector(".primary").click(); }
    };
  }

  function session(queue, scheduled) {
    var total = queue.length, done = 0, flipped = false, tally = { miss: 0, shaky: 0, conf: 0 };
    mainEl.innerHTML = "";
    var bar = h("span", { style: "width:0" });
    var count = h("span", { class: "dim small" });
    var cardEl = h("div", { class: "card fc", tabindex: "0", role: "button", "aria-label": "Flashcard, press Space to flip" });
    var grades = h("div", { class: "grades", hidden: true },
      h("button", { type: "button", class: "g-miss", onclick: function () { grade("miss"); } }, "Missed", h("small", null, "↑ ↓ · again now")),
      h("button", { type: "button", class: "g-shaky", onclick: function () { grade("shaky"); } }, "Shaky", h("small", null, "← · in an hour")),
      h("button", { type: "button", class: "g-conf", onclick: function () { grade("conf"); } }, "Confident", h("small", null, "→ · days later")));
    add(mainEl, [
      h("div", { class: "row spread" }, h("button", { type: "button", class: "btn", onclick: route }, "← End session"), count),
      h("div", { class: "prog" }, bar), cardEl, grades,
    ]);
    cardEl.addEventListener("click", flip);

    function show() {
      if (!queue.length) return finish();
      var c = queue[0];
      flipped = false;
      grades.hidden = true;
      count.textContent = done + " done · " + queue.length + " to go" + (scheduled ? "" : " · cram");
      bar.style.width = (100 * done / Math.max(1, total)) + "%";
      cardEl.innerHTML = "";
      add(cardEl, [h("span", { class: "grp" }, groupName(c.group)), h("div", { class: "term", html: c.term }),
        h("span", { class: "hint" }, "Space or click to flip")]);
      cardEl.focus({ preventScroll: true });
    }
    function flip() {
      if (!queue.length) return;
      var c = queue[0];
      flipped = !flipped;
      cardEl.innerHTML = "";
      if (!flipped) return show();
      add(cardEl, [h("span", { class: "grp" }, groupName(c.group)), h("div", { class: "term", style: "font-size:17px", html: c.term }),
        h("div", { class: "def", html: c.def }), c.more ? h("div", { class: "more", html: c.more }) : null]);
      grades.hidden = false;
    }
    function grade(g) {
      if (!flipped) return;
      var c = queue.shift();
      tally[g]++;
      if (scheduled) {
        var st = cardState(), s = st[c.id] || { box: 0 }, now = Date.now();
        if (g === "miss") { s.box = 0; s.due = now; }
        else if (g === "shaky") { s.box = 1; s.due = now + INTERVAL[1]; }
        else { s.box = Math.min(INTERVAL.length - 1, Math.max(2, s.box + 1)); s.due = now + INTERVAL[s.box]; }
        s.seen = now;
        st[c.id] = s;
        save("cards", st);
      }
      if (g === "miss") queue.push(c); else done++;
      show();
    }
    function finish() {
      keyHandler = function (e) { if (e.key === "Enter" || e.key === "Escape") { e.preventDefault(); route(); } };
      mainEl.innerHTML = "";
      add(mainEl, h("div", { class: "card pad stack" },
        h("p", { class: "sec" }, "Session done"),
        h("div", { class: "big" }, total + " card" + (total === 1 ? "" : "s")),
        h("p", { class: "dim", style: "margin:0" }, tally.conf + " confident · " + tally.shaky + " shaky · " + tally.miss + " missed along the way"),
        h("button", { type: "button", class: "primary", onclick: route }, "Back to cards", h("kbd", null, "Enter"))));
    }
    keyHandler = function (e) {
      var k = e.key;
      if (k === "Escape") { e.preventDefault(); return route(); }
      if (k === " " || k === "Enter") { e.preventDefault(); return flip(); }
      if (!flipped) { if (k === "ArrowRight") { e.preventDefault(); flip(); } return; }
      if (k === "ArrowRight" || k === "3") { e.preventDefault(); grade("conf"); }
      else if (k === "ArrowLeft" || k === "2") { e.preventDefault(); grade("shaky"); }
      else if (k === "ArrowUp" || k === "ArrowDown" || k === "1") { e.preventDefault(); grade("miss"); }
    };
    show();
  }

  // ---------------------------------------------------------- practice

  var practiceGroup = null;
  function practiceMenu() {
    var stats = load("practice", {});
    var qs = (C.practice || []).filter(inGroup(practiceGroup));
    var seen = qs.filter(function (q) { return stats[q.id]; });
    var missed = qs.filter(function (q) { return stats[q.id] && stats[q.id].last === false; });
    var right = seen.filter(function (q) { return stats[q.id].last; }).length;
    add(mainEl, head("Practice", "Multiple choice. Every wrong answer explains the slip behind it."));
    add(mainEl, groupChips(practiceGroup, function (g) { practiceGroup = g; route(); }, C.practice || []));
    add(mainEl, h("div", { class: "tiles" },
      h("div", { class: "tile" }, h("b", null, qs.length), h("span", null, "questions")),
      h("div", { class: "tile" }, h("b", null, seen.length ? Math.round(100 * right / seen.length) + "%" : "—"), h("span", null, "right last time")),
      h("div", { class: "tile" }, h("b", null, missed.length), h("span", null, "to redo"))));
    add(mainEl, h("button", { type: "button", class: "primary", disabled: qs.length ? null : "disabled",
      onclick: function () { quiz(shuffle(qs)); } },
      h("span", null, "Start: all " + qs.length + ", shuffled", h("small", null, "Answer with A–D or 1–4. Enter for the next question.")), h("kbd", null, "Enter")));
    if (missed.length) add(mainEl, h("button", { type: "button", class: "btn", onclick: function () { quiz(shuffle(missed)); } },
      "Redo the " + missed.length + " I got wrong last time"));
    keyHandler = function (e) { if (e.key === "Enter" && qs.length) { e.preventDefault(); quiz(shuffle(qs)); } };
  }

  function quiz(list) {
    var i = 0, score = 0, answered = false, current = null;
    function show() {
      if (i >= list.length) return finish();
      var q = list[i];
      answered = false;
      current = { q: q, opts: shuffle(q.options), btns: [] };
      mainEl.innerHTML = "";
      add(mainEl, h("div", { class: "row spread" }, h("button", { type: "button", class: "btn", onclick: route }, "← Stop"),
        h("span", { class: "dim small" }, "Question " + (i + 1) + " of " + list.length + " · " + score + " right")));
      add(mainEl, h("div", { class: "prog" }, h("span", { style: "width:" + (100 * i / list.length) + "%" })));
      var box = h("div", { class: "card pad stack" },
        groupName(q.group) ? h("span", { class: "sec" }, groupName(q.group)) : null,
        h("p", { class: "q-text", html: q.q }));
      var opts = h("div", { class: "opts" });
      current.opts.forEach(function (o, k) {
        var b = h("button", { type: "button", class: "opt", onclick: function () { answer(k); } },
          h("span", { class: "k" }, "ABCDEFG"[k]), h("span", { html: o.t }));
        current.btns.push(b);
        opts.appendChild(b);
      });
      box.appendChild(opts);
      mainEl.appendChild(box);
      current.box = box;
    }
    function answer(k) {
      if (answered) return;
      answered = true;
      var o = current.opts[k], ok = !!o.right;
      if (ok) score++;
      var stats = load("practice", {});
      var s = stats[current.q.id] || { tries: 0, right: 0 };
      s.tries++; if (ok) s.right++; s.last = ok;
      stats[current.q.id] = s;
      save("practice", stats);
      current.opts.forEach(function (op, j) {
        var b = current.btns[j];
        b.disabled = true;
        if (op.right) b.classList.add("right");
        else if (j === k) b.classList.add("wrong");
        if (op.why && (op.right || j === k)) b.lastChild.appendChild(h("span", { class: "why", html: op.why }));
      });
      add(current.box, [
        h("div", { class: "row" }, h("span", { class: "pill " + (ok ? "good" : "bad") }, ok ? "Right" : "Not quite")),
        current.q.explain ? h("div", { class: "explain", html: current.q.explain }) : null,
        h("button", { type: "button", class: "btn solid", onclick: next }, i + 1 < list.length ? "Next question →" : "See score →"),
      ]);
    }
    function next() { i++; show(); }
    function finish() {
      mainEl.innerHTML = "";
      add(mainEl, h("div", { class: "card pad stack" },
        h("p", { class: "sec" }, "Done"),
        h("div", { class: "big" }, score + " / " + list.length),
        h("p", { class: "dim", style: "margin:0" }, score === list.length ? "Clean sweep." : "The ones you missed are saved under “Redo”."),
        h("button", { type: "button", class: "primary", onclick: route }, "Back to practice", h("kbd", null, "Enter"))));
      keyHandler = function (e) { if (e.key === "Enter") { e.preventDefault(); route(); } };
    }
    keyHandler = function (e) {
      if (i >= list.length) return;
      if (e.key === "Escape") { e.preventDefault(); return route(); }
      if (!answered) {
        var k = "abcdefg".indexOf(e.key.toLowerCase());
        if (k < 0) k = "1234567".indexOf(e.key);
        if (k >= 0 && k < current.opts.length) { e.preventDefault(); answer(k); }
      } else if (e.key === "Enter" || e.key === "ArrowRight") { e.preventDefault(); next(); }
    };
    show();
  }

  // ------------------------------------------------------------- tools

  function toolsView(id) {
    var tools = C.tools || [];
    var tool = tools.filter(function (t) { return t.id === id; })[0];
    if (!tool) {
      add(mainEl, head("Tools", "Interactive tools for " + C.code + ". Anything you enter is saved in this browser."));
      add(mainEl, h("div", { class: "grid2" }, tools.map(function (t, k) {
        return h("button", { type: "button", class: "tool-tile", onclick: function () { location.hash = "tools/" + t.id; } },
          h("span", { class: "n" }, "Tool " + (k + 1)), h("b", null, t.name), h("span", null, t.blurb));
      })));
      return;
    }
    mainEl.className = "st-main wide";
    add(mainEl, h("div", { class: "st-phone-nav" }, h("span", { "data-class-nav": "" }), h("a", { href: "classes.html" }, "All classes")));
    add(mainEl, h("div", { class: "tool-h" },
      h("button", { type: "button", class: "btn", onclick: function () { location.hash = "tools"; } }, "← All tools"),
      h("h2", null, tool.name)));
    if (tool.blurb) add(mainEl, h("p", { class: "dim", style: "margin:-8px 0 0" }, tool.blurb));
    var el = h("div", { class: "stack" });
    mainEl.appendChild(el);
    tool.mount(el);
  }

  // ---------------------------------------------------------------- api

  window.Study = {
    h: h, esc: esc, fmt: fmt, shuffle: shuffle, load: load, save: save,
    slider: slider, select: select, chart: chart, niceTicks: niceTicks,
    course: function (cfg) {
      C = cfg;
      if (document.body) build();
      else document.addEventListener("DOMContentLoaded", build);
    },
  };
})();
