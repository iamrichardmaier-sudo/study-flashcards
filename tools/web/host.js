// The website's side of the review page: what the Scriptable script does on
// the phone (start menu, scheduling, saving), done in the browser.
//
// The shared page (tools/page/page.js) hands every grade to
// window.ECON_HOST.ping(); this file applies the scheduler from
// tools/schedule.js (pasted above it by build.mjs, the same code the phone
// runs) and saves the result.
//
// Saving: to the viewer's private store on their claude.ai account when the
// page runs there (Artifact `db` capability), and always to localStorage as
// well, so a signed-out visit or a failed write still keeps the session.

(function () {
  const DECK = /*__DECK__*/ null;
  const ALL = DECK.cards;
  const BY_ID = Object.fromEntries(ALL.map((c) => [c.id, c]));
  const LOCAL_KEY = "econ381-progress";

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
  const plain = (html) => { const d = document.createElement("div"); d.innerHTML = html; return d.textContent; };

  let progress = { cards: {} };
  let mode = "review";          // "review" saves grades; "cram" doesn't
  let where = "local";          // where progress is being kept: "local" | "account"

  // ---------------------------------------------------------------- storage

  function localLoad() {
    try {
      const d = JSON.parse(localStorage.getItem(LOCAL_KEY) || "null");
      return d && d.cards ? d : null;
    } catch (e) {
      return null;
    }
  }

  function localSave() {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(progress)); } catch (e) { /* private window */ }
  }

  /** Per card, keep whichever copy was graded last. Study days take the
   *  larger count, walkthroughs count as done if either copy finished them,
   *  and the missed-prediction lists are combined. */
  function merge(other) {
    if (!other) return;
    for (const id in other.cards || {}) {
      const a = progress.cards[id], b = other.cards[id];
      if (BY_ID[id] && (!a || (b.last || 0) > (a.last || 0))) progress.cards[id] = b;
    }
    progress.days = progress.days || {};
    for (const d in other.days || {}) progress.days[d] = Math.max(progress.days[d] || 0, other.days[d]);
    progress.models = progress.models || {};
    for (const id in other.models || {}) {
      const a = progress.models[id], b = other.models[id];
      if (!a || (b.at || 0) > (a.at || 0)) progress.models[id] = b;
    }
    const seen = new Set();
    progress.missed = (progress.missed || []).concat(other.missed || [])
      .filter((m) => { const k = m.at + m.q; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => b.at - a.at).slice(0, 40);
    if (other.last && (!progress.last || (other.last.at || 0) > (progress.last.at || 0))) progress.last = other.last;
  }

  let docRef = null;
  let writing = false, dirty = false, retryTimer = null;
  let saveState = "idle";        // "idle" | "saving" | "saved" | "retrying" | "local"
  let savedAt = 0;

  /** A store call that hasn't answered in this long counts as failed, so
   *  one stuck write can never hold up every save after it. */
  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject({ code: "timeout" }), ms)),
    ]);
  }

  function setSaveState(state) {
    saveState = state;
    if (state === "saved") savedAt = Date.now();
    renderSaveState();
  }

  // Failures that mean this view can never write to the account store.
  const FINAL = ["invalid_argument", "not_granted", "revoked", "capability_disabled",
    "capability_removed", "quota_exceeded"];

  /** One write at a time; grades made while a write is in flight are folded
   *  into the next one. A failed or stuck write is retried rather than
   *  given up on, so a hiccup costs a few seconds, not the session. */
  async function accountSave() {
    if (!docRef) return;
    if (writing) { dirty = true; return; }
    writing = true;
    clearTimeout(retryTimer);
    setSaveState("saving");
    try {
      do {
        dirty = false;
        await withTimeout(docRef.set({ progress: JSON.stringify(progress), updated: Date.now() }), 10000);
      } while (dirty);
      writing = false;
      setSaveState("saved");
    } catch (e) {
      writing = false;
      if (FINAL.includes(e && e.code)) {
        docRef = null;
        where = "local";
        setSaveState("local");
        renderStoreNote();
      } else {
        // Timeout, rate limit or a passing outage: try again shortly. The
        // browser copy holds everything meanwhile.
        setSaveState("retrying");
        retryTimer = setTimeout(accountSave, 4000 + Math.random() * 3000);
      }
    }
  }

  function save() {
    localSave();
    if (docRef) accountSave();
    else setSaveState("local");
  }

  async function connectAccount() {
    try {
      if (!window.claude || !window.claude.use) return setSaveState("local");
      const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
      if (!db || !user) return setSaveState("local");
      const id = await user.id();
      if (!id) return setSaveState("local");
      const ref = db.collection("data/users/" + id).doc("econ381");
      const snap = await withTimeout(ref.get(), 10000);
      let remote = { cards: {} };
      if (snap.exists) {
        try { remote = JSON.parse((snap.data() || {}).progress || "{}") || remote; } catch (e) { /* unreadable */ }
      }
      merge(remote);
      docRef = ref;
      where = "account";
      localSave();
      // Write only when this browser holds grades the account doesn't.
      const keys = ["cards", "days", "models", "missed"];
      // Empty and missing count as the same, so opening the page with nothing
      // new writes nothing.
      const norm = (v) => (v && (Array.isArray(v) ? v.length : Object.keys(v).length) ? JSON.stringify(v) : "");
      const differs = keys.some((k) => norm(progress[k]) !== norm(remote && remote[k]));
      if (differs) accountSave();
      else setSaveState("saved");
      refreshTab();
      renderStoreNote();
    } catch (e) {
      setSaveState("local");
    }
  }

  // ---------------------------------------------------------------- grading

  window.ECON_HOST = {
    ping(path) {
      if (!path.startsWith("grade")) return;
      const q = new URLSearchParams(path.split("?")[1] || "");
      const id = q.get("id"), rating = q.get("rating"), t = Number(q.get("t")) || Date.now();
      if (mode === "cram" || !BY_ID[id]) return;
      if (!["missed", "shaky", "confident"].includes(rating)) return;
      progress.cards[id] = schedule(progress.cards[id], rating, t);
      studied(t);
      save();
    },
  };

  /** One more thing done today, for the streak. */
  function studied(t) {
    progress.days = progress.days || {};
    const d = isoDay(t || Date.now());
    progress.days[d] = (progress.days[d] || 0) + 1;
  }

  /** Days in a row with something studied, counting back from today (or
   *  from yesterday, so a streak isn't lost before today's first card). */
  function streak() {
    const days = progress.days || {};
    let t = Date.now(), n = 0;
    if (!days[isoDay(t)]) t -= 86400000;
    while (days[isoDay(t)]) { n++; t -= 86400000; }
    return n;
  }


  // ---------------------------------------------------------------- sessions

  /** What the page needs about a card: the card, its ladder step, and the
   *  terms and definitions of the cards it connects to (for the peek). */
  function forPage(card) {
    const links = (card.connections || [])
      .map((id) => BY_ID[id]).filter(Boolean)
      .map((c) => ({ id: c.id, term: c.term, simple: c.simple, formula: c.formula || "", week: c.week }));
    const s = progress.cards[card.id];
    return { ...card, links, step: s ? s.step : 0 };
  }

  function reviewQueue(filter, limit) {
    const q = buildQueue(ALL, progress, Date.now(), filter, limit);
    return interleave(q.due, q.fresh);
  }

  let tabBefore = "home";

  /** A flashcard session takes the whole screen; Esc returns to the tab it
   *  was started from. */
  function begin(cards, cram) {
    if (!cards.length) return;
    mode = cram ? "cram" : "review";
    $("#quit").textContent = cram ? "Cram · nothing is rescheduled" : "Esc for the menu";
    tabBefore = currentTab;
    $("#shell").hidden = true;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    startSession(cards.map(forPage), cram);
    renderSaveState();
  }

  function inSession() { return $("#shell").hidden; }

  function endSession() {
    hidePeek();
    clearTimeout(wakeTimer);
    $("#app").style.display = "none";
    $("#done").style.display = "none";
    $("#shell").hidden = false;
    showTab(tabBefore);
  }

  // ---------------------------------------------------------------- tabs

  let currentTab = "home";

  function showTab(name) {
    currentTab = name;
    document.querySelectorAll("#shell .view").forEach((v) => { v.hidden = v.id !== "tab-" + name; });
    document.querySelectorAll(".tabbtn").forEach((b) => b.setAttribute("aria-current", b.dataset.tab === name ? "page" : "false"));
    $("#shell").scrollTop = 0;
    if (name === "home") renderHome();
    if (name === "review") renderReview();
    if (name === "progress") renderProgress();
    if (name === "models") ensureModels();
    renderSaveState();
  }

  /** Redraw the open tab without moving it, after the account answers. */
  function refreshTab() {
    if (inSession()) return;
    if (currentTab === "home") renderHome();
    if (currentTab === "review") renderReview();
    if (currentTab === "progress") renderProgress();
  }

  function timeOf(ms) {
    return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  /** Where the last grade went, shown on Home and along the top of a
   *  session, so a save that isn't landing is visible straight away. */
  function renderSaveState() {
    const account = where === "account";
    const label = {
      idle: "",
      saving: "Saving…",
      saved: account ? "Saved to your account ✓" : "",
      retrying: "Can’t reach your account · retrying (kept in this browser meanwhile)",
      local: "Saved in this browser only",
    }[saveState];
    if (mode !== "cram" && inSession()) {
      $("#quit").textContent = "Esc for the menu" + (label ? " · " + label : "");
    }
    document.querySelectorAll(".save-state").forEach((el) => {
      el.textContent = label + (saveState === "saved" && savedAt ? " at " + timeOf(savedAt) : "");
    });
  }

  function renderStoreNote() {
    const t = where === "account"
      ? "Progress is saved to your claude.ai account, so it follows you to any computer you sign in on. It's separate from the phone app's progress."
      : "Progress is saved in this browser only. Open this page while signed in to claude.ai to keep it on your account.";
    document.querySelectorAll(".store-note").forEach((el) => { el.textContent = t; });
  }

  // ------------------------------------------------------------------ home

  const ICON = {
    layers: '<path d="M12.8 2.2a2 2 0 0 0-1.6 0L2.6 6.1a1 1 0 0 0 0 1.8l8.6 3.9a2 2 0 0 0 1.6 0l8.6-3.9a1 1 0 0 0 0-1.8z"/><path d="m2 12.6 9.2 4.2a2 2 0 0 0 1.6 0L22 12.6"/><path d="m2 17.6 9.2 4.2a2 2 0 0 0 1.6 0L22 17.6"/>',
    cap: '<path d="M21.4 10.9a1 1 0 0 0 0-1.8l-8.6-3.9a2 2 0 0 0-1.6 0L2.6 9.1a1 1 0 0 0 0 1.8l8.6 3.9a2 2 0 0 0 1.6 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
    play: '<path d="M6 3l14 9-14 9z"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
  };
  const icon = (n, cls) => `<svg class="ic ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;

  function modelStats(m) {
    const done = m.scenarios.filter((s) => (progress.models || {})[s.id] && progress.models[s.id].done).length;
    return { done, total: m.scenarios.length };
  }

  /** The single most useful next thing, chosen for him: cards that are
   *  owed, then an unfinished walkthrough, then the first model not done. */
  function primaryAction(st) {
    if (st.due) return { label: `Review ${st.due} card${st.due === 1 ? "" : "s"}`, sub: st.newLeft ? `plus ${st.newLeft} new` : "due now", icon: "layers", act: "review" };
    if (st.newLeft) return { label: `Learn ${st.newLeft} new card${st.newLeft === 1 ? "" : "s"}`, sub: "today's new cards, tested ones first", icon: "cap", act: "review" };
    const last = progress.last;
    if (last && last.scenario && !((progress.models || {})[last.scenario] || {}).done) {
      const m = MODELS.find((x) => x.id === last.model), sc = m && m.scenarios.find((x) => x.id === last.scenario);
      if (sc) return { label: "Continue: " + sc.title, sub: m.title, icon: "play", act: "model", model: m.id, scenario: sc.id };
    }
    const next = MODELS.find((m) => modelStats(m).done < m.scenarios.length);
    if (next) {
      const sc = next.scenarios.find((s) => !((progress.models || {})[s.id] || {}).done);
      return { label: "Walk through " + sc.title, sub: next.title + " · " + sc.source, icon: "chart", act: "model", model: next.id, scenario: sc.id };
    }
    return { label: "Cram the tested cards", sub: "Everything is caught up", icon: "layers", act: "tested" };
  }

  function renderHome() {
    const now = Date.now();
    const st = summary(ALL, progress, now);
    const n = streak();
    $("#h-streak").innerHTML = `<svg class="ic ${n ? "lit" : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4.1 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg><b>${n}</b><span>day${n === 1 ? "" : "s"}</span>`;

    const pa = primaryAction(st);
    const btn = $("#h-primary");
    btn.dataset.act = pa.act;
    btn.dataset.model = pa.model || "";
    btn.dataset.scenario = pa.scenario || "";
    btn.innerHTML = `<span class="pl">${icon(pa.icon)}<span><b>${esc(pa.label)}</b><small>${esc(pa.sub)}</small></span></span><span class="pr"><kbd>Enter</kbd>${icon("chev")}</span>`;

    $("#h-learn").textContent = st.newLeft;
    $("#h-due").textContent = st.due;
    $("#h-wave").textContent = !st.due && st.upcoming < Infinity
      ? `next card back at ${timeOf(st.upcoming)}` : "";
    $("#h-solid").textContent = `${st.solid} of ${st.total} solid`;
    const seen = st.total - st.unseen;
    const pct = (x) => (100 * x / st.total).toFixed(2) + "%";
    $("#h-bar").innerHTML = `<span style="width:${pct(st.solid)};background:#2E7D52"></span><span style="width:${pct(seen - st.solid)};background:var(--primary)"></span>`;

    $("#h-models").innerHTML = MODELS.map((m) => {
      const ms = modelStats(m), w = DECK.weeks[m.week - 1];
      return `<button type="button" class="hm" data-model="${m.id}" style="--c:${w.color}">` +
        `<span class="wk">Week ${m.week}</span><span class="nm">${esc(m.title)}</span>` +
        `<span class="mini"><span style="width:${(100 * ms.done / ms.total).toFixed(0)}%"></span></span>` +
        `<span class="ct">${ms.done ? ms.done + " of " + ms.total + " walkthroughs" : ms.total + " walkthroughs"}</span></button>`;
    }).join("");
    renderStoreNote();
  }

  // ---------------------------------------------------------------- review

  function renderReview() {
    const st = summary(ALL, progress, Date.now());
    const owed = st.due + st.newLeft;
    const b = $("#r-review");
    b.disabled = owed === 0;
    if (owed) {
      const parts = [];
      if (st.due) parts.push(st.due + " due");
      if (st.newLeft) parts.push(st.newLeft + " new");
      b.innerHTML = `<span class="pl">${icon("layers")}<span><b>Review ${parts.join(" + ")}</b><small>Starting with ${esc(plain(st.nextCard.term))}${st.nextCard.starred ? " ★" : ""}</small></span></span><span class="pr"><kbd>Enter</kbd>${icon("chev")}</span>`;
    } else {
      b.innerHTML = `<span class="pl">${icon("check")}<span><b>All caught up</b><small>${st.upcoming < Infinity ? "Next card comes due at " + timeOf(st.upcoming) + ". Cram a week below meanwhile." : "Cram a week below to keep going."}</small></span></span>`;
    }
    const tested = reviewQueue((c) => c.starred, Infinity);
    $("#r-tested").innerHTML = `★ Tested cards only<small>${tested.length ? tested.length + " due or new of the 65 on the practice midterm" : "All 65 caught up · crams them instead"}</small>`;
    $("#r-weeks").innerHTML = DECK.weeks.map((w, k) => {
      const cs = ALL.filter((c) => c.week === k + 1);
      const q = reviewQueue((c) => c.week === k + 1, Infinity);
      const solid = cs.filter((c) => (progress.cards[c.id] || {}).solid).length;
      const seenW = cs.filter((c) => progress.cards[c.id]).length;
      return `<button class="hm" type="button" data-week="${k + 1}" style="--c:${w.color}">` +
        `<span class="wk">Week ${k + 1}</span><span class="nm">${esc(w.title)}</span>` +
        `<span class="mini"><span style="width:${(100 * seenW / cs.length).toFixed(1)}%"></span></span>` +
        `<span class="ct">${q.length ? q.length + " to review" : "caught up · cram"} · ${solid}/${cs.length} solid</span></button>`;
    }).join("");
  }

  // -------------------------------------------------------------- progress

  function renderProgress(confirming) {
    const st = summary(ALL, progress, Date.now());
    const weeks = DECK.weeks.map((w, k) => {
      const cs = ALL.filter((c) => c.week === k + 1);
      const seen = cs.filter((c) => progress.cards[c.id]).length;
      const solid = cs.filter((c) => (progress.cards[c.id] || {}).solid).length;
      return `<div class="row"><span class="lbl">Week ${k + 1} · ${esc(w.title)}</span><span class="val">${seen}/${cs.length} seen · ${solid} solid</span></div>`;
    }).join("");
    const hard = ALL.map((c) => ({ c, s: progress.cards[c.id] }))
      .filter((x) => x.s && x.s.lapses > 0)
      .sort((a, b) => b.s.lapses - a.s.lapses).slice(0, 8)
      .map((x) => `<li>${esc(plain(x.c.term))} <span class="dim">missed ${x.s.lapses}×</span></li>`).join("");
    const models = MODELS.map((m) => {
      const rows = m.scenarios.map((s) => {
        const r = (progress.models || {})[s.id];
        return `<li class="${r && r.done ? "done" : ""}">${r && r.done ? icon("check") : '<span class="dot0"></span>'}<span>${esc(s.title)}</span>` +
          `<span class="dim">${r && r.done ? (r.total ? r.right + "/" + r.total + " predictions" : "done") : "not yet"}</span></li>`;
      }).join("");
      return `<div class="pm"><p class="pm-h" style="color:${DECK.weeks[m.week - 1].color}">${esc(m.title)}</p><ul>${rows}</ul></div>`;
    }).join("");
    const missed = (progress.missed || []).slice(0, 10).map((x) => {
      const m = MODELS.find((y) => y.id === x.model), sc = m && m.scenarios.find((y) => y.id === x.scenario);
      return `<li>${x.q} <span class="dim">${sc ? esc(sc.title) : ""}</span></li>`;
    }).join("");
    $("#p-body").innerHTML =
      `<section class="card pad"><p class="sec">Flashcards · ${st.solid} of ${st.total} solid · ${st.unseen} not seen</p>${weeks}` +
      (hard ? `<p class="sec gap">Cards missed most</p><ul class="plain">${hard}</ul>` : "") + "</section>" +
      `<section class="card pad"><p class="sec">Model walkthroughs</p><div class="pms">${models}</div>` +
      (missed ? `<p class="sec gap">Predictions you missed lately</p><ul class="plain">${missed}</ul>` : "") + "</section>" +
      `<section class="card pad"><p class="sec">Reset</p>` + (confirming
        ? `<div class="m-confirm"><span>Reset all 126 cards and every walkthrough? This can't be undone.</span><button class="yes" type="button" data-m="reset-yes">Reset</button><button type="button" data-m="reset-no">Cancel</button></div>`
        : `<button class="m-small danger" type="button" data-m="reset">Reset all progress…</button>`) +
      `<p class="store-note dim"></p></section>`;
    renderStoreNote();
  }

  // ---------------------------------------------------------------- models

  let modelsMounted = false;

  /** The dashboard is built the first time the tab opens. */
  function ensureModels() {
    if (modelsMounted) return;
    modelsMounted = true;
    MODELUI.mount($("#models"), {
      modelProgress: () => progress.models || {},
      remember: (model, scenario) => { progress.last = { model, scenario: scenario || null, at: Date.now() }; localSave(); },
      missedPrediction: (x) => {
        progress.missed = [{ ...x, at: Date.now() }].concat(progress.missed || []).slice(0, 40);
      },
      scenarioDone: (x) => {
        progress.models = progress.models || {};
        progress.models[x.scenario] = { done: true, right: x.right, total: x.total, at: Date.now() };
        studied();
        save();
      },
    });
  }

  function openModels(modelId, scenarioId) {
    showTab("models");
    if (modelId) MODELUI.open(modelId, scenarioId);
  }

  // ---------------------------------------------------------------- clicks

  function startReview() {
    const st = summary(ALL, progress, Date.now());
    begin(reviewQueue(null, st.newLeft), false);
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.closest("#toMenu") || b.id === "toMenu") return endSession();
    if (b.classList.contains("tabbtn")) {
      if (b.dataset.tab === "models") return openModels(null);
      return showTab(b.dataset.tab);
    }
    if (!$("#shell").contains(b)) return;
    if (b.id === "h-primary") {
      const a = b.dataset.act;
      if (a === "review") return startReview();
      if (a === "model") return openModels(b.dataset.model, b.dataset.scenario);
      if (a === "tested") return begin(shuffle(ALL.filter((c) => c.starred)), true);
    }
    if (b.id === "r-review") return startReview();
    if (b.id === "h-learn-btn") return startReview();
    if (b.id === "r-tested" || b.id === "h-tested") {
      const q = reviewQueue((c) => c.starred, Infinity);
      return q.length ? begin(q, false) : begin(shuffle(ALL.filter((c) => c.starred)), true);
    }
    if (b.id === "r-cram") return begin(shuffle(ALL.slice()), true);
    if (b.dataset.week) {
      const k = Number(b.dataset.week);
      const q = reviewQueue((c) => c.week === k, Infinity);
      return q.length ? begin(q, false) : begin(shuffle(ALL.filter((c) => c.week === k)), true);
    }
    if (b.dataset.model && b.classList.contains("hm")) return openModels(b.dataset.model);
    if (b.dataset.m === "reset") return renderProgress(true);
    if (b.dataset.m === "reset-no") return renderProgress();
    if (b.dataset.m === "reset-yes") {
      progress = { cards: {}, days: progress.days || {} };
      save();
      return renderProgress();
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("#logo") && inSession()) endSession();
  });

  // ---------------------------------------------------------------- keys

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!inSession()) {
      if (currentTab === "models") { MODELUI.handleKey(e); return; }
      // Enter on Home or Review starts what the big button says, unless a
      // control already has the focus.
      if (e.key === "Enter" && (!document.activeElement || document.activeElement === document.body)) {
        const big = currentTab === "home" ? $("#h-primary") : currentTab === "review" ? $("#r-review") : null;
        if (big && !big.disabled) { e.preventDefault(); big.click(); }
      }
      return;
    }
    const k = e.key;
    const arrows = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
    if (k === "Escape") { e.preventDefault(); if (peekOpen()) hidePeek(); else endSession(); return; }
    if ($("#done").style.display === "flex") {
      if (k === "Enter") { e.preventDefault(); endSession(); }
      return;
    }
    if (peekOpen()) {
      if (k === "Enter" || arrows.includes(k)) { e.preventDefault(); hidePeek(); }
      return;
    }
    if (k !== "Enter" && !arrows.includes(k)) return;
    e.preventDefault();
    if (e.repeat) return;                        // holding a key must not grade a run of cards
    if (!flipped) {
      if (k === "Enter" || k === "ArrowRight") flip();
      return;
    }
    if (k === "Enter") flip();
    else if (k === "ArrowRight") grade("confident");
    else if (k === "ArrowLeft") grade("shaky");
    else grade("missed");
  });

  // Key labels on the grade buttons.
  const keyFor = { missed: "↑↓", shaky: "←", confident: "→" };
  document.querySelectorAll("footer .btn").forEach((b) => {
    const kbd = document.createElement("kbd");
    kbd.textContent = keyFor[b.dataset.act];
    b.firstChild.after(kbd);
  });

  // ---------------------------------------------------------------- start

  merge(localLoad());
  $("#app").style.display = "none";
  showTab("home");
  connectAccount();
})();
