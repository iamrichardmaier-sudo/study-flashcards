// The Models tab: a dashboard per model, the walkthrough player and free play.
//
// Everything on screen is drawn from the model's own definition
// (tools/models/defs/*.js) and solved by tools/models/engine.js. A walkthrough
// is a list of steps; each step may change some inputs, ask for a
// prediction first, and then show the working. The right answer to every
// prediction is computed from the model at that moment, never typed in.

var MODELUI = (function () {
  "use strict";

  var F = CH.fmt;
  var root, host;
  var model = null;            // the model definition on screen
  var mode = "free";           // "free" | "scenario"
  var sc = null, stepIdx = 0, stage = "shown";
  var cur = null, ghost = null, target = null, hide = [];
  var pinned = null;           // free play's comparison point
  var results = [];            // this walkthrough's predictions
  var anim = null;
  var tab = "forms";

  function $(sel, el) { return (el || root).querySelector(sel); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function merge(a, b) { var o = clone(a); for (var k in b || {}) o[k] = b[k]; return o; }
  function weekColor(w) { return (typeof WEEKS !== "undefined" && WEEKS[w - 1]) || { color: "#1F4E8C", soft: "rgba(31,78,140,.10)" }; }

  // ------------------------------------------------------------- layout

  function mount(el, h) {
    root = el;
    host = h || {};
    root.innerHTML =
      '<div class="mdl-top"><div class="mdl-chips" id="mdl-chips"></div></div>' +
      '<div class="mdl-grid">' +
      '  <div class="mdl-main">' +
      '    <div class="mdl-head"><span class="chip" id="mdl-week"></span><h2 id="mdl-title"></h2><p id="mdl-short"></p></div>' +
      '    <div class="mdl-card mdl-graph"><div id="mdl-graph"></div><p class="cap" id="mdl-cap"></p></div>' +
      '    <div class="kpis" id="mdl-kpis"></div>' +
      '    <div class="mdl-two">' +
      '      <div class="mdl-card"><h3 id="mdl-line-t"></h3><div id="mdl-line"></div></div>' +
      '      <div class="mdl-card"><h3 id="mdl-bars-t"></h3><div id="mdl-bars"></div></div>' +
      "    </div>" +
      '    <div class="mdl-card mdl-tabs"><div class="seg" id="mdl-seg">' +
      '      <button type="button" data-tab="forms">All its forms</button>' +
      '      <button type="button" data-tab="statics">Comparative statics</button>' +
      '      <button type="button" data-tab="facts">Know cold · traps</button></div>' +
      '      <div id="mdl-tab"></div></div>' +
      "  </div>" +
      '  <aside class="mdl-rail"><div class="rail-in">' +
      '    <p class="rail-h">Walkthroughs</p><div id="mdl-scs"></div>' +
      '    <div id="mdl-panel"></div>' +
      "  </div></aside>" +
      "</div>";
    $("#mdl-chips").innerHTML = MODELS.map(function (m, k) {
      var w = weekColor(m.week);
      return '<button type="button" class="mchip" data-model="' + m.id + '" style="--c:' + w.color + '"><span>Week ' + m.week + "</span>" + m.title + "</button>";
    }).join("");
    root.addEventListener("click", onClick);
    root.addEventListener("input", onInput);
    root.addEventListener("keydown", onKey);
    openModel(MODELS[0].id);
  }

  function openModel(id, scId) {
    stopAnim();
    model = MODELS.filter(function (m) { return m.id === id; })[0] || MODELS[0];
    var w = weekColor(model.week);
    root.style.setProperty("--wk", w.color);
    root.style.setProperty("--wk-soft", w.soft);
    root.querySelectorAll(".mchip").forEach(function (b) { b.classList.toggle("on", b.dataset.model === model.id); });
    $("#mdl-week").textContent = "Week " + model.week;
    $("#mdl-title").textContent = model.title;
    $("#mdl-short").innerHTML = model.short;
    $("#mdl-line-t").textContent = model.lineTitle;
    $("#mdl-bars-t").textContent = model.barsTitle;
    if (host.remember) host.remember(model.id);
    renderScenarioList();
    if (scId) startScenario(scId); else startFree();
  }

  function renderScenarioList() {
    var done = (host.modelProgress && host.modelProgress()) || {};
    $("#mdl-scs").innerHTML = model.scenarios.map(function (s, k) {
      var d = done[s.id];
      return '<button type="button" class="sc' + (mode === "scenario" && sc && sc.id === s.id ? " on" : "") + '" data-sc="' + s.id + '">' +
        '<span class="sc-n">' + (d && d.done ? "✓" : k + 1) + "</span>" +
        '<span class="sc-b"><b>' + s.title + '</b><small>' + s.source + "</small></span></button>";
    }).join("") +
      '<button type="button" class="sc free' + (mode === "free" ? " on" : "") + '" data-free="1"><span class="sc-n">↕</span>' +
      '<span class="sc-b"><b>Free play</b><small>Move every input yourself</small></span></button>';
  }

  // ------------------------------------------------------------ drawing

  function draw() {
    var g = model.graph(cur, ghost, target, hide);
    $("#mdl-graph").innerHTML = g.svg;
    $("#mdl-cap").textContent = g.cap || "";
    var o = model.solve(cur);
    var prev = ghost ? model.solve(ghost) : null;
    $("#mdl-kpis").innerHTML = model.kpis.map(function (k) {
      var v = o[k.key];
      var hidden = hide.indexOf(k.key) !== -1;
      var txt = hidden ? "?" : v == null ? "—" : k.pct ? F(v * 100, k.d == null ? 2 : k.d) + "%" : F(v, k.d) + (k.unit || "");
      var delta = "";
      if (!hidden && prev && v != null && prev[k.key] != null && Math.abs(v - prev[k.key]) > 1e-9 * Math.max(1, Math.abs(v))) {
        var up = v > prev[k.key];
        delta = '<span class="dl ' + (up ? "up" : "down") + '">' + (up ? "▲" : "▼") + " from " +
          (k.pct ? F(prev[k.key] * 100, k.d == null ? 2 : k.d) + "%" : F(prev[k.key], k.d)) + "</span>";
      }
      return '<div class="kpi' + (hidden ? " hid" : "") + '"><span class="kl">' + k.label + '</span><span class="kv">' + txt + "</span>" + delta + "</div>";
    }).join("");
    $("#mdl-line").innerHTML = model.line(cur, ghost, target, hide, mode === "scenario" ? sc : null);
    $("#mdl-bars").innerHTML = model.bars(cur, ghost, target, hide) || '<p class="muted">Shown once the answer is revealed.</p>';
    if (tab === "statics") renderTab();
  }

  function renderTab() {
    root.querySelectorAll("#mdl-seg button").forEach(function (b) { b.classList.toggle("on", b.dataset.tab === tab); });
    var h = "";
    if (tab === "forms") {
      h = model.forms.map(function (f) {
        return '<div class="form"><p class="fn">' + f.name + '</p><div class="fx">' + f.html + "</div>" + (f.note ? '<p class="fnote">' + f.note + "</p>" : "") + "</div>";
      }).join("");
    } else if (tab === "statics") {
      var st = model.statics;
      var params = cur;
      h = '<p class="muted">What happens to each result when one input rises, everything else held fixed. Worked out from the model at the current numbers.</p>' +
        '<div class="tbl"><table><thead><tr><th></th>' + st.outputs.map(function (o) { return "<th>" + o.label + "</th>"; }).join("") + "</tr></thead><tbody>";
      st.inputs.forEach(function (inp) {
        if (params[inp.key] == null) return;
        var d = ENGINE.direction(model.solve, params, inp.key, st.outputs.map(function (o) { return o.key; }), inp.step);
        h += "<tr><th>" + inp.label + "</th>" + st.outputs.map(function (o) {
          var v = d[o.key];
          var sym = v === "up" ? "↑" : v === "down" ? "↓" : v === "same" ? "—" : "";
          return '<td class="' + v + '">' + sym + "</td>";
        }).join("") + "</tr>";
      });
      h += "</tbody></table></div>";
    } else {
      h = '<div class="facts"><div><p class="fn">Know this cold</p><ul>' + model.facts.cold.map(function (x) { return "<li>" + x + "</li>"; }).join("") +
        '</ul></div><div class="traps"><p class="fn">Common traps</p><ul>' + model.facts.traps.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div></div>";
    }
    $("#mdl-tab").innerHTML = h;
  }

  // --------------------------------------------------------- animation

  function stopAnim() { if (anim) { cancelAnimationFrame(anim.raf); anim = null; } }

  /** Moves every numeric input from where it is to `next`, redrawing as it
   *  goes, so a shift is seen happening rather than just appearing. */
  function animateTo(next, ghostState, done) {
    stopAnim();
    var from = clone(cur);
    ghost = ghostState;
    target = next;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var t0 = performance.now(), dur = reduce ? 0 : 650;
    var tick = function (now) {
      var u = dur ? Math.min(1, (now - t0) / dur) : 1;
      var e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      var mid = clone(next);
      for (var k in next) {
        if (typeof next[k] === "number" && typeof from[k] === "number") mid[k] = from[k] + (next[k] - from[k]) * e;
      }
      cur = u >= 1 ? clone(next) : mid;
      draw();
      if (u < 1) anim = { raf: requestAnimationFrame(tick) };
      else { anim = null; target = null; draw(); if (done) done(); }
    };
    anim = { raf: requestAnimationFrame(tick) };
  }

  // ---------------------------------------------------------- free play

  function startFree() {
    stopAnim();
    mode = "free"; sc = null;
    cur = clone(model.base); pinned = clone(model.base); ghost = null; target = null; hide = [];
    renderScenarioList();
    renderPanel();
    draw();
    renderTab();
  }

  function sliderPos(inp, v) {
    if (inp.log) return Math.round(1000 * Math.log(v / inp.min) / Math.log(inp.max / inp.min));
    return v;
  }
  function sliderVal(inp, pos) {
    if (inp.log) return inp.min * Math.pow(inp.max / inp.min, pos / 1000);
    return pos;
  }

  function renderPanel() {
    var h = "";
    if (mode === "free") {
      h = '<div class="panel"><p class="rail-h">Free play</p><p class="muted">Drag an input. The faint lines and the ▲▼ arrows compare with your pinned starting point.</p>';
      model.inputs.forEach(function (inp) {
        var v = cur[inp.key];
        h += '<label class="sl"><span><b>' + inp.label + '</b><output id="out-' + inp.key + '">' + F(v, inp.step < 0.01 ? 3 : inp.step < 1 ? 2 : 0) + "</output></span>" +
          '<input type="range" id="sl-' + inp.key + '" data-key="' + inp.key + '" min="' + (inp.log ? 0 : inp.min) + '" max="' + (inp.log ? 1000 : inp.max) +
          '" step="' + (inp.log ? 1 : inp.step) + '" value="' + sliderPos(inp, v) + '"></label>';
      });
      h += '<div class="row2"><button type="button" class="ghost-btn" data-act="pin">Pin as starting point</button><button type="button" class="ghost-btn" data-act="reset">Reset</button></div></div>';
    } else {
      h = playerHTML();
    }
    $("#mdl-panel").innerHTML = h;
    var inp = $("#mdl-panel .num-in");
    if (inp && stage === "ask") setTimeout(function () { try { inp.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 30);
  }

  function onInput(e) {
    var el = e.target;
    if (!el.matches || !el.matches('input[type="range"][data-key]')) return;
    var inp = model.inputs.filter(function (i) { return i.key === el.dataset.key; })[0];
    var v = sliderVal(inp, Number(el.value));
    cur[inp.key] = v;
    ghost = pinned;
    var out = $("#out-" + inp.key);
    if (out) out.textContent = F(v, inp.step < 0.01 ? 3 : inp.step < 1 ? 2 : 0);
    draw();
  }

  // ------------------------------------------------------- walkthroughs

  /** The inputs as they stand when step k opens: the scenario's start plus
   *  every earlier step's change. */
  function stateAt(k) {
    var s = clone(sc.base);
    for (var j = 0; j < k; j++) s = merge(s, sc.steps[j].set);
    return s;
  }
  function hideAt(k) {
    var h = [];
    for (var j = 0; j < k; j++) if (sc.steps[j].hide) h = sc.steps[j].hide.slice();
    return h;
  }

  function startScenario(id) {
    stopAnim();
    sc = model.scenarios.filter(function (s) { return s.id === id; })[0];
    if (!sc) return startFree();
    mode = "scenario"; results = [];
    if (host.remember) host.remember(model.id, sc.id);
    renderScenarioList();
    renderTab();
    enterStep(0);
  }

  function enterStep(k) {
    stopAnim();
    stepIdx = k;
    if (k >= sc.steps.length) { stage = "exam"; ghost = null; renderPanel(); draw(); finish(); return; }
    var st = sc.steps[k];
    cur = stateAt(k); ghost = null; target = null;
    hide = hideAt(k);
    if (st.predict) {
      stage = "ask";
      renderPanel(); draw();
    } else {
      stage = "shown";
      if (st.hide) hide = st.hide.slice();
      var next = merge(cur, st.set);
      renderPanel();
      if (st.set) animateTo(next, clone(cur)); else draw();
    }
  }

  function answerFor(st, before, after) {
    var pr = st.predict;
    var oa = model.solve(after);
    if (pr.kind === "dir") {
      var a, b;
      if (pr.vs) { a = oa[pr.vs]; b = oa[pr.key]; }
      else { a = model.solve(pr.from === "base" ? sc.base : before)[pr.key]; b = oa[pr.key]; }
      var tol = 1e-9 * Math.max(1, Math.abs(a));
      return b > a + tol ? "up" : b < a - tol ? "down" : "same";
    }
    if (pr.kind === "num") return pr.value ? pr.value(oa, after) : oa[pr.key];
    return typeof pr.answer === "function" ? pr.answer(oa, after) : pr.answer;
  }

  function reveal(given) {
    var st = sc.steps[stepIdx];
    var before = clone(cur);
    var after = merge(cur, st.set);
    var right = answerFor(st, before, after);
    var ok;
    if (st.predict.kind === "num") {
      var x = Number(String(given).replace(/[,%\s]/g, ""));
      ok = isFinite(x) && Math.abs(x - right) <= (st.predict.tol || 0.002) * Math.max(1, Math.abs(right));
    } else ok = given === right;
    results.push({ step: stepIdx, ok: ok, q: st.predict.q, given: given, right: right });
    if (!ok && host.missedPrediction) host.missedPrediction({ model: model.id, scenario: sc.id, q: st.predict.q });
    stage = "shown";
    lastGiven = { given: given, right: right, ok: ok };
    if (st.hide) hide = st.hide.slice();
    renderPanel();
    var ghostState = st.predict.from === "base" ? clone(sc.base) : before;
    if (st.set) animateTo(after, ghostState);
    else { ghost = st.predict.from === "base" ? ghostState : null; draw(); }
  }
  var lastGiven = null;

  function finish() {
    var right = results.filter(function (r) { return r.ok; }).length;
    if (host.scenarioDone) host.scenarioDone({ model: model.id, scenario: sc.id, right: right, total: results.length });
    renderScenarioList();
  }

  function mathHTML(st, state) {
    if (!st.math) return "";
    var o = model.solve(state), p = state;
    return '<div class="math">' + st.math.map(function (m) {
      return "<div>" + (typeof m === "function" ? m(o, p) : m) + "</div>";
    }).join("") + "</div>";
  }

  var DIRS = [{ id: "up", label: "↑ Rises", key: "↑" }, { id: "down", label: "↓ Falls", key: "↓" }, { id: "same", label: "— No change", key: "0" }];

  function playerHTML() {
    var n = sc.steps.length;
    var dots = "";
    for (var k = 0; k <= n; k++) dots += '<span class="pd' + (k < stepIdx ? " done" : k === stepIdx ? " on" : "") + '"></span>';
    var h = '<div class="panel player"><div class="ph"><p class="rail-h">' + sc.title + '</p><span class="src">' + sc.source + "</span></div>" +
      '<div class="dots">' + dots + "</div>";
    if (stage === "exam") {
      var right = results.filter(function (r) { return r.ok; }).length;
      h += '<div class="exam"><p class="fn">On the exam · ' + sc.exam.pts + "</p><ol>" + sc.exam.lines.map(function (l) { return "<li>" + l + "</li>"; }).join("") + "</ol></div>" +
        (results.length ? '<p class="score">' + right + " of " + results.length + " predictions right</p>" : "") +
        '<div class="row2"><button type="button" class="ghost-btn" data-act="back">← Back</button><button type="button" class="go" data-act="again">Run it again</button></div>' +
        '<button type="button" class="ghost-btn wide" data-free="1">Free play with this model</button></div>';
      return h;
    }
    var st = sc.steps[stepIdx];
    if (stepIdx === 0) h += '<p class="blurb">' + sc.blurb + "</p>";
    h += '<div class="say">' + st.say + "</div>";
    var after = merge(cur, st.set);
    if (st.predict && stage === "ask") {
      h += '<div class="ask"><p class="q"><span class="tag-predict">Predict</span>' + st.predict.q + "</p>";
      if (st.predict.kind === "num") {
        h += '<form class="numf" data-act="num"><input class="num-in" id="pred-num" inputmode="decimal" autocomplete="off" placeholder="your answer" aria-label="Your answer">' +
          '<button type="submit" class="go">Check</button></form>';
      } else {
        var ch = st.predict.kind === "dir" ? DIRS : st.predict.choices;
        h += '<div class="choices">' + ch.map(function (c) { return '<button type="button" class="choice" data-pick="' + c.id + '">' + c.label + "</button>"; }).join("") + "</div>";
        if (st.predict.kind === "dir") h += '<p class="keyhint">Keys: ↑ rises · ↓ falls · 0 no change</p>';
      }
      h += "</div>";
      h += '<div class="row2"><button type="button" class="ghost-btn" data-act="back"' + (stepIdx ? "" : " disabled") + '>← Back</button><button type="button" class="ghost-btn" data-act="skip">Show me</button></div>';
    } else {
      if (st.predict && lastGiven) {
        var g = lastGiven;
        var show = function (v) {
          if (st.predict.kind === "num") {
            var x = Number(v), a = Math.abs(x);
            // Enough digits to tell 0.0625 from 0.063 and 7.996 from 8.
            return F(x, a >= 100 ? 1 : a >= 1 ? 3 : 4).replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
          }
          var c = (st.predict.kind === "dir" ? DIRS : st.predict.choices).filter(function (x) { return x.id === v; })[0];
          return c ? c.label : v;
        };
        h += '<div class="fb ' + (g.ok ? "ok" : g.given == null ? "skip" : "no") + '">' +
          (g.ok ? "<b>Right.</b> " : g.given == null ? "<b>Answer:</b> " : "<b>Not quite.</b> You said " + show(g.given) + "; ") +
          (g.ok ? "" : "it's <b>" + show(g.right) + "</b>.") + "</div>";
      }
      h += mathHTML(st, after);
      if (st.why) h += '<p class="why">' + st.why + "</p>";
      h += '<div class="row2"><button type="button" class="ghost-btn" data-act="back"' + (stepIdx ? "" : " disabled") + '>← Back</button>' +
        '<button type="button" class="go" data-act="next">' + (stepIdx === n - 1 ? "Finish →" : "Next →") + "</button></div>" +
        '<p class="keyhint">Enter for next</p>';
    }
    return h + "</div>";
  }

  // ------------------------------------------------------------- events

  function onClick(e) {
    var b = e.target.closest("button");
    if (!b || !root.contains(b)) return;
    if (b.dataset.model) return openModel(b.dataset.model);
    if (b.dataset.sc) return startScenario(b.dataset.sc);
    if (b.dataset.free) return startFree();
    if (b.dataset.tab) { tab = b.dataset.tab; return renderTab(); }
    if (b.dataset.pick && stage === "ask") return reveal(b.dataset.pick);
    var a = b.dataset.act;
    if (a === "next") { lastGiven = null; return enterStep(stepIdx + 1); }
    if (a === "back") { lastGiven = null; return enterStep(Math.max(0, stage === "exam" ? sc.steps.length - 1 : stepIdx - 1)); }
    if (a === "skip") return reveal(null);
    if (a === "again") return startScenario(sc.id);
    if (a === "pin") { pinned = clone(cur); ghost = null; return draw(); }
    if (a === "reset") return startFree();
  }

  document.addEventListener("submit", function (e) {
    if (!root || !root.contains(e.target)) return;
    e.preventDefault();
    var v = $("#pred-num").value.trim();
    if (v === "" || stage !== "ask") return;
    reveal(v);
  });

  function onKey(e) {
    // Arrow and number keys answer direction predictions; Enter moves on.
    if (mode !== "scenario") return;
    if (e.target && e.target.closest && e.target.closest("button")) return;   // a focused button handles its own Enter
    var typing = e.target && e.target.matches && e.target.matches("input");
    if (stage === "ask") {
      var st = sc.steps[stepIdx];
      if (typing || !st.predict || st.predict.kind !== "dir") return;
      var pick = e.key === "ArrowUp" ? "up" : e.key === "ArrowDown" ? "down" : e.key === "0" ? "same" : null;
      if (pick) { e.preventDefault(); reveal(pick); }
      return;
    }
    if (e.key === "Enter" && !typing && stage === "shown") { e.preventDefault(); lastGiven = null; enterStep(stepIdx + 1); }
  }

  /** Key presses arrive at the document when nothing in the tab has focus. */
  function handleKey(e) {
    if (!root) return false;
    if (e.target && root.contains(e.target) && e.target !== document.body) return false;
    var before = e.defaultPrevented;
    onKey(e);
    return e.defaultPrevented && !before;
  }

  return { mount: mount, open: openModel, handleKey: handleKey,
           current: function () { return { model: model && model.id, scenario: mode === "scenario" && sc ? sc.id : null }; } };
})();
