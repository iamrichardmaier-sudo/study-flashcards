// The Practice tab: the practice midterm as a multiple-choice drill.
//
// Each question: pick an answer, then see the general pattern, then (if it
// was wrong) what the option you picked suggests went wrong, then the
// worked solution one step at a time. A miss goes to the back of the
// session and is scheduled like a missed flashcard; a first-try hit climbs
// the same ladder as a confident card (tools/schedule.js).
//
// Questions live in tools/practice/questions.js. The host (tools/web/host.js)
// owns progress and saving and hands this file a few callbacks.

var PRACTICEUI = (function () {
  "use strict";

  var root, host;
  var QS = EXAM.questions;
  var BY = {};
  QS.forEach(function (q, k) { q.n = k; BY[q.id] = q; });

  var view = "menu";                 // "menu" | "ask" | "result" | "done"
  var queue = [], at = 0;
  var order = [];                    // the options of the question on screen, in display order
  var picked = {};                   // option index → true
  var shown = 0;                     // steps revealed so far
  var wasRight = false;
  var tally = { asked: 0, firstTry: 0, missedIds: [] };
  var triedOnce = {};                // question id → already answered this session

  function $(s) { return root.querySelector(s); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function weekColor(w) { return (typeof WEEKS !== "undefined" && WEEKS[w - 1]) || { color: "#1F4E8C", soft: "rgba(31,78,140,.10)" }; }
  function state(id) { return (host.progress().practice || {})[id] || null; }
  function letter(k) { return "ABCDEFGH"[k]; }

  // ------------------------------------------------------------- queues

  /** Seen and due now (most overdue first), then never seen, in exam order. */
  function drillQueue(filter, now) {
    now = now || Date.now();
    var due = [], fresh = [];
    QS.forEach(function (q) {
      if (filter && !filter(q)) return;
      var s = state(q.id);
      if (!s) fresh.push(q);
      else if (s.due <= now) due.push(q);
    });
    due.sort(function (a, b) { return state(a.id).due - state(b.id).due || a.n - b.n; });
    return due.concat(fresh).map(function (q) { return q.id; });
  }

  function stats() {
    var now = Date.now(), seen = 0, right = 0, due = 0, next = Infinity;
    QS.forEach(function (q) {
      var s = state(q.id);
      if (!s) return;
      seen++;
      if (s.rating === "confident") right++;
      if (s.due <= now) due++; else if (s.due < next) next = s.due;
    });
    return { total: QS.length, seen: seen, right: right, due: due, fresh: QS.length - seen, next: next, owed: due + QS.length - seen };
  }

  // --------------------------------------------------------------- menu

  function icon(d) {
    return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
  }
  var I = {
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
  };
  function timeOf(ms) { return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }

  function renderMenu() {
    view = "menu";
    var st = stats();
    var big = st.owed
      ? '<button type="button" class="primary" id="pq-drill"><span class="pl">' + icon(I.pen) + "<span><b>Drill " + st.owed + " question" + (st.owed === 1 ? "" : "s") + "</b><small>" +
        (st.due ? st.due + " to retry" + (st.fresh ? " + " + st.fresh + " new" : "") : "multiple choice · misses come back") +
        '</small></span></span><span class="pr"><kbd>Enter</kbd>' + icon(I.chev) + "</span></button>"
      : '<button type="button" class="primary" id="pq-drill" disabled><span class="pl">' + icon(I.check) + "<span><b>All caught up</b><small>" +
        (st.next < Infinity ? "Next question comes back at " + timeOf(st.next) + ". Take a section again below meanwhile." : "Take a section again below.") +
        "</small></span></span></button>";
    var sections = EXAM.sections.map(function (sec) {
      var qs = QS.filter(function (q) { return q.section === sec.id; });
      var right = qs.filter(function (q) { var s = state(q.id); return s && s.rating === "confident"; }).length;
      var w = weekColor(qs[0].week);
      return '<button type="button" class="hm" data-pq-section="' + sec.id + '" style="--c:' + w.color + '">' +
        '<span class="wk">' + esc(sec.sub) + '</span><span class="nm">' + esc(sec.title) + "</span>" +
        '<span class="mini"><span style="width:' + (100 * right / qs.length).toFixed(0) + '%"></span></span>' +
        '<span class="ct">' + right + " of " + qs.length + " right last time</span></button>";
    }).join("");
    var hard = QS.map(function (q) { return { q: q, s: state(q.id) }; })
      .filter(function (x) { return x.s && x.s.lapses > 0; })
      .sort(function (a, b) { return b.s.lapses - a.s.lapses; }).slice(0, 6)
      .map(function (x) { return "<li>" + esc(sectionShort(x.q)) + " " + esc(x.q.label) + ' <span class="dim">missed ' + x.s.lapses + "×</span></li>"; }).join("");
    root.innerHTML =
      '<div class="h-top"><div><h1>Practice midterm</h1><p>' + esc(EXAM.title) + " · " + QS.length + " questions as multiple choice. Guess, then see the pattern and where it went wrong.</p></div></div>" +
      big + '<p class="save-state dim small"></p>' +
      '<section class="sect-h"><h2>Score</h2><div class="tiles">' +
      '<div class="tile"><p class="tv">' + st.right + '</p><p class="tl">right last time</p></div>' +
      '<div class="tile"><p class="tv">' + st.fresh + '</p><p class="tl">not tried yet</p></div></div>' +
      '<div class="meter"><div class="m-bar"><span style="width:' + (100 * st.right / st.total).toFixed(1) + '%;background:#2E7D52"></span>' +
      '<span style="width:' + (100 * (st.seen - st.right) / st.total).toFixed(1) + '%;background:#C0392B"></span></div>' +
      '<p class="dim small">' + st.right + " of " + st.total + " right on the latest try · " + (st.seen - st.right) + " to fix</p></div></section>" +
      '<section class="sect-h"><h2>Sections</h2><div class="grid3">' + sections + "</div>" +
      '<div class="pair"><button type="button" class="second" id="pq-all">Whole exam in order<small>All ' + QS.length + ", Part 1 then Part 2</small></button>" +
      '<button type="button" class="second" id="pq-wrong"' + (st.seen - st.right ? "" : " disabled") + ">Only the ones I got wrong<small>" + (st.seen - st.right) + " to fix</small></button></div></section>" +
      (hard ? '<section class="sect-h"><h2>Missed most</h2><ul class="plain card pad">' + hard + "</ul></section>" : "") +
      '<section class="sect-h"><h2>Keys</h2><div class="keys card pad">' +
      "<span><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd></span><span>Pick an answer (or A–D)</span>" +
      "<span><kbd>Enter</kbd></span><span>Check a select-all answer · next step · next question</span>" +
      "<span><kbd>Esc</kbd></span><span>Back to this menu (answers are already saved)</span></div></section>";
    host.renderSaveState();
  }

  function sectionShort(q) { return q.section === "p1" ? "Part 1" : "Part 2"; }

  // ------------------------------------------------------------ session

  function start(ids) {
    if (!ids.length) return;
    queue = ids.slice();
    at = 0;
    tally = { asked: 0, firstTry: 0, missedIds: [] };
    triedOnce = {};
    ask();
  }

  function shuffled(n, keep) {
    var a = [];
    for (var k = 0; k < n; k++) a.push(k);
    if (keep) return a;
    for (k = n - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = a[k]; a[k] = a[j]; a[j] = t; }
    return a;
  }

  function current() { return BY[queue[at]]; }

  function ask() {
    var q = current();
    view = "ask";
    picked = {};
    shown = 0;
    // True/False stays in that order; everything else is shuffled each time,
    // so a retry tests the idea and not the position.
    order = shuffled(q.options.length, !!q.tf);
    render();
  }

  function head(q) {
    var w = weekColor(q.week);
    var sec = EXAM.sections.find(function (s) { return s.id === q.section; });
    return '<div class="pq-top"><span class="pq-count">' + (at + 1) + " / " + queue.length + "</span>" +
      '<div class="pq-bar"><span style="width:' + (100 * at / queue.length).toFixed(1) + "%;background:" + w.color + '"></span></div>' +
      '<button type="button" class="m-small" id="pq-quit">Esc · menu</button></div>' +
      '<p class="pq-src" style="color:' + w.color + '">' + esc(sec.title) + " · " + esc(q.label) + " · " + q.pts + " pts" +
      (q.kind === "all" ? ' · <b>select all that apply</b>' : "") + "</p>" +
      (q.setup ? '<p class="pq-setup">' + q.setup + "</p>" : "") +
      '<p class="pq-q">' + q.prompt + "</p>";
  }

  function render() {
    var q = current(), w = weekColor(q.week);
    root.style.setProperty("--wk", w.color);
    root.style.setProperty("--wk-soft", w.soft);
    if (view === "ask") {
      root.innerHTML = '<div class="pq">' + head(q) +
        '<div class="pq-opts' + (q.tf ? " tf" : "") + '">' + order.map(function (oi, k) {
          return '<button type="button" class="pq-opt' + (picked[oi] ? " on" : "") + '" data-opt="' + oi + '">' +
            '<span class="pq-l">' + (q.kind === "all" ? (picked[oi] ? "✓" : letter(k)) : letter(k)) + "</span><span>" + q.options[oi].t + "</span></button>";
        }).join("") + "</div>" +
        (q.kind === "all"
          ? '<button type="button" class="go-btn pq-check" id="pq-check">Check <kbd>Enter</kbd></button>'
          : '<p class="pq-hint dim small">Press 1–' + order.length + " or click an answer</p>") +
        "</div>";
      return;
    }
    // result
    var right = q.options.map(function (o) { return !!o.right; });
    var opts = order.map(function (oi, k) {
      var cls = right[oi] ? " ok" : picked[oi] ? " bad" : " dim";
      var mark = right[oi] ? (picked[oi] || q.kind === "one" ? "✓" : "✓") : picked[oi] ? "✗" : letter(k);
      return '<div class="pq-opt' + cls + (picked[oi] ? " was" : "") + '"><span class="pq-l">' + mark + "</span><span>" + q.options[oi].t +
        (q.kind === "all" && right[oi] && !picked[oi] ? ' <em class="pq-tag">you left this out</em>' : "") +
        (picked[oi] && !right[oi] ? ' <em class="pq-tag">your pick</em>' : "") + "</span></div>";
    }).join("");
    var verdict = wasRight
      ? '<div class="pq-verdict ok">' + icon(I.check) + "<span><b>Right.</b> " + (triedOnce[q.id] > 1 ? "Got it on the retry." : "First try.") + "</span></div>"
      : '<div class="pq-verdict bad"><b>Not quite.</b> <span>' + answerLine(q) + "</span></div>";
    var diag = wasRight ? "" : diagnosis(q);
    var steps = q.steps.map(function (s, k) {
      return '<li class="' + (k === shown - 1 && shown > 1 ? "in" : "") + '"' + (k < shown ? "" : " hidden") + ">" + s + "</li>";
    }).join("");
    var allShown = shown >= q.steps.length;
    var nextLabel = !allShown && !wasRight ? "Next step" : (at + 1 < queue.length ? "Next question" : "Finish");
    var graph = "";
    if (q.graph && typeof GRAPHS !== "undefined") {
      var key = typeof q.graph === "string" ? q.graph : q.graph.key;
      var g = GRAPHS[key] && GRAPHS[key](q.graph.args || {});
      if (g) graph = '<div class="pq-graph">' + g.svg + (g.cap ? '<p class="cap">' + g.cap + "</p>" : "") + "</div>";
    }
    var related = (q.cards || []).map(function (id) { var t = host.cardTerm(id); return t ? '<span class="pq-chip">' + t + "</span>" : ""; }).join("");
    root.innerHTML = '<div class="pq">' + head(q) +
      '<div class="pq-opts done' + (q.tf ? " tf" : "") + '">' + opts + "</div>" + verdict +
      '<section class="pq-box pattern"><p class="pq-h">The pattern</p><div>' + q.pattern + "</div></section>" +
      diag +
      '<section class="pq-box steps"><p class="pq-h">Step by step' + (wasRight && !allShown ? ' <button type="button" class="m-small" id="pq-show">Show the working</button>' : "") + "</p>" +
      '<ol class="pq-steps">' + steps + "</ol>" + (allShown ? graph : "") + "</section>" +
      (related ? '<p class="pq-rel"><span class="dim small">' + (wasRight ? "Flashcards on this:" : "Flashcards on this (marked due again):") + "</span> " + related + "</p>" : "") +
      '<div class="pq-next"><button type="button" class="go-btn" id="pq-next">' + nextLabel + " <kbd>Enter</kbd></button></div>" +
      "</div>";
    var nb = $("#pq-next");
    if (nb && nb.scrollIntoView && !wasRight && shown > 0) nb.scrollIntoView({ block: "nearest" });
  }

  function answerLine(q) {
    var rights = [];
    order.forEach(function (oi, k) { if (q.options[oi].right) rights.push(letter(k)); });
    if (q.tf) return "The answer is <b>" + esc(q.options.find(function (o) { return o.right; }).t) + "</b>.";
    return q.kind === "all"
      ? "The true ones are <b>" + (rights.length ? rights.join(", ") : "none") + "</b>."
      : "The answer is <b>" + rights[0] + "</b>.";
  }

  /** What the picked answer suggests went wrong: the `why` of every option
   *  answered differently from the key. */
  function diagnosis(q) {
    var items = [];
    order.forEach(function (oi, k) {
      var o = q.options[oi];
      if (q.kind === "one") {
        if (picked[oi] && !o.right && o.why) items.push(o.why);
      } else if (!!picked[oi] !== !!o.right && o.why) {
        items.push("<b>" + letter(k) + " " + (o.right ? "is true" : "is false") + ".</b> " + o.why);
      }
    });
    if (!items.length) return "";
    return '<section class="pq-box why"><p class="pq-h">Where it likely went wrong</p>' +
      (items.length === 1 ? "<div>" + items[0] + "</div>" : '<ul class="plain">' + items.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>") +
      "</section>";
  }

  function choose(oi) {
    var q = current();
    if (view !== "ask") return;
    if (q.kind === "all") { picked[oi] = !picked[oi]; render(); return; }
    picked = {}; picked[oi] = true;
    check();
  }

  function check() {
    var q = current();
    if (view !== "ask") return;
    if (q.kind === "all" && !Object.keys(picked).some(function (k) { return picked[k]; }) && !confirmEmpty) {
      // Selecting nothing is a real answer ("none are true"), but make it deliberate.
      confirmEmpty = true;
      var b = $("#pq-check");
      if (b) b.innerHTML = "None are true? Press again <kbd>Enter</kbd>";
      return;
    }
    confirmEmpty = false;
    wasRight = q.options.every(function (o, oi) { return !!o.right === !!picked[oi]; });
    triedOnce[q.id] = (triedOnce[q.id] || 0) + 1;
    tally.asked++;
    if (triedOnce[q.id] === 1 && wasRight) tally.firstTry++;
    if (!wasRight && tally.missedIds.indexOf(q.id) === -1) tally.missedIds.push(q.id);
    host.grade(q.id, wasRight ? "confident" : "missed", wasRight ? [] : (q.cards || []));
    // A miss goes to the back of this session, like a missed flashcard.
    if (!wasRight) queue.push(q.id);
    view = "result";
    shown = wasRight ? 0 : 1;
    render();
    // On a small screen the options fill the view: bring the verdict and
    // the pattern up to where the eye is.
    var v = $(".pq-verdict");
    if (v && v.scrollIntoView && window.innerHeight < 900) v.scrollIntoView({ block: "start" });
  }
  var confirmEmpty = false;

  function next() {
    var q = current();
    if (view !== "result") return;
    if (!wasRight && shown < q.steps.length) { shown++; render(); return; }
    at++;
    if (at >= queue.length) return done();
    ask();
  }

  function done() {
    view = "done";
    var first = Object.keys(triedOnce).length;
    var missed = tally.missedIds.map(function (id) { var q = BY[id]; return "<li>" + esc(sectionShort(q)) + " " + esc(q.label) + "</li>"; }).join("");
    root.innerHTML = '<div class="pq pq-done">' +
      "<h1>Done</h1><p class=\"pq-score\"><b>" + tally.firstTry + " of " + first + "</b> right on the first try</p>" +
      (missed ? '<section class="pq-box why"><p class="pq-h">Missed this round (they come back later)</p><ul class="plain">' + missed + "</ul></section>"
        : '<section class="pq-box pattern"><p class="pq-h">Clean sweep</p><div>Every question right first time. They’ll come back in a few hours to make sure it sticks.</div></section>') +
      '<div class="pq-next"><button type="button" class="go-btn" id="pq-menu">Back to practice <kbd>Enter</kbd></button></div></div>';
  }

  // ------------------------------------------------------------- events

  function onClick(e) {
    var b = e.target.closest("button");
    if (!b || !root.contains(b)) return;
    if (b.id === "pq-drill") return start(drillQueue());
    if (b.id === "pq-all") return start(QS.map(function (q) { return q.id; }));
    if (b.id === "pq-wrong") return start(QS.filter(function (q) { var s = state(q.id); return s && s.rating !== "confident"; }).map(function (q) { return q.id; }));
    if (b.dataset.pqSection) {
      var sid = b.dataset.pqSection;
      return start(QS.filter(function (q) { return q.section === sid; }).map(function (q) { return q.id; }));
    }
    if (b.id === "pq-quit" || b.id === "pq-menu") return renderMenu();
    if (b.dataset.opt != null && view === "ask") return choose(Number(b.dataset.opt));
    if (b.id === "pq-check") return check();
    if (b.id === "pq-next") return next();
    if (b.id === "pq-show") { shown = current().steps.length; render(); }
  }

  function handleKey(e) {
    var k = e.key;
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (view === "menu") {
      if (k === "Enter" && (!document.activeElement || document.activeElement === document.body)) {
        var d = $("#pq-drill");
        if (d && !d.disabled) { e.preventDefault(); d.click(); }
      }
      return;
    }
    if (k === "Escape") { e.preventDefault(); return renderMenu(); }
    if (e.repeat) return;
    if (view === "done") { if (k === "Enter") { e.preventDefault(); renderMenu(); } return; }
    if (view === "ask") {
      var idx = "1234".indexOf(k);
      if (idx === -1) idx = "abcd".indexOf(k.toLowerCase());
      if (k.length === 1 && idx !== -1 && idx < order.length) { e.preventDefault(); return choose(order[idx]); }
      if (current().kind === "all" && k === "Enter") { e.preventDefault(); return check(); }
      return;
    }
    if (view === "result" && (k === "Enter" || k === "ArrowRight")) { e.preventDefault(); next(); }
  }

  function mount(el, h) {
    root = el;
    host = h;
    root.addEventListener("click", onClick);
    renderMenu();
  }

  return {
    mount: mount,
    handleKey: handleKey,
    menu: function () { if (view === "menu" || view === "done") renderMenu(); },
    refresh: function () { if (view === "menu") renderMenu(); },
    stats: stats,
    drill: function () { renderMenu(); start(drillQueue()); },
    inSession: function () { return view === "ask" || view === "result"; },
    questions: QS,
  };
})();
