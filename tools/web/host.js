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

  /** Per card, keep whichever copy was graded last. */
  function merge(other) {
    for (const id in (other && other.cards) || {}) {
      const a = progress.cards[id], b = other.cards[id];
      if (BY_ID[id] && (!a || (b.last || 0) > (a.last || 0))) progress.cards[id] = b;
    }
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
      if (JSON.stringify(progress.cards) !== JSON.stringify(remote.cards || {})) accountSave();
      else setSaveState("saved");
      if (!$("#menu").hidden) renderMenu();
      else renderStoreNote();
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
      save();
    },
  };

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

  function begin(cards, cram) {
    if (!cards.length) return;
    mode = cram ? "cram" : "review";
    $("#quit").textContent = cram ? "Cram · nothing is rescheduled" : "Esc for the menu";
    $("#menu").hidden = true;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    startSession(cards.map(forPage), cram);
    renderSaveState();
  }

  function showMenu() {
    hidePeek();
    clearTimeout(wakeTimer);
    $("#app").style.display = "none";
    $("#done").style.display = "none";
    $("#menu").hidden = false;
    $("#menu").scrollTop = 0;
    renderMenu();
    $("#m-review").focus({ preventScroll: true });
  }

  function reviewQueue(filter, limit) {
    const q = buildQueue(ALL, progress, Date.now(), filter, limit);
    return interleave(q.due, q.fresh);
  }

  // ---------------------------------------------------------------- menu

  function timeOf(ms) {
    return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  /** Where the last grade went, shown on the menu and along the top of a
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
    if (mode !== "cram" && $("#menu").hidden) {
      $("#quit").textContent = "Esc for the menu" + (label ? " · " + label : "");
    }
    $("#m-saved").textContent = label + (saveState === "saved" && savedAt ? " at " + timeOf(savedAt) : "");
  }

  function renderStoreNote() {
    $("#m-store").textContent = where === "account"
      ? "Progress is saved to your claude.ai account, so it follows you to any computer you sign in on. It's separate from the phone app's progress."
      : "Progress is saved in this browser only. Open this page while signed in to claude.ai to keep it on your account.";
  }

  function renderMenu() {
    const now = Date.now();
    const st = summary(ALL, progress, now);
    const seen = st.total - st.unseen;

    $("#m-status").textContent = st.due + st.newLeft
      ? `${st.due} due now · ${st.newLeft} new available today · ${st.solid} of ${st.total} solid`
      : `All caught up${st.upcoming < Infinity ? " · next card at " + timeOf(st.upcoming) : ""} · ${st.solid} of ${st.total} solid`;

    // One bar for the whole deck: solid, seen, never seen.
    const pct = (n) => (100 * n / st.total).toFixed(2) + "%";
    $("#m-bar").innerHTML =
      `<span style="width:${pct(st.solid)};background:#2E7D52"></span>` +
      `<span style="width:${pct(seen - st.solid)};background:#1F4E8C"></span>`;
    $("#m-legend").innerHTML =
      `<span><i style="background:#2E7D52"></i>${st.solid} solid</span>` +
      `<span><i style="background:#1F4E8C"></i>${seen - st.solid} learning</span>` +
      `<span><i style="background:rgba(43,33,24,.15)"></i>${st.unseen} not seen yet</span>`;

    const btn = $("#m-review");
    const owed = st.due + st.newLeft;
    btn.disabled = owed === 0;
    if (owed) {
      const parts = [];
      if (st.due) parts.push(st.due + " due");
      if (st.newLeft) parts.push(st.newLeft + " new");
      const next = st.nextCard;
      btn.innerHTML = `<span><b>Review ${parts.join(" + ")}</b><small>Starting with ${esc(plain(next.term))}${next.starred ? " ★" : ""}</small></span><span class="go">Enter ↵</span>`;
    } else {
      btn.innerHTML = `<span><b>All caught up</b><small>${st.upcoming < Infinity ? "Next card comes due at " + timeOf(st.upcoming) + ". Cram a week below in the meantime." : "Cram a week below to keep going."}</small></span>`;
    }

    const tested = reviewQueue((c) => c.starred, Infinity);
    $("#m-tested").innerHTML = `★ Tested cards only<small>${tested.length ? tested.length + " due or new of the 65 on the practice midterm" : "All 65 caught up · crams them instead"}</small>`;

    $("#m-weeks").innerHTML = DECK.weeks.map((w, k) => {
      const cs = ALL.filter((c) => c.week === k + 1);
      const q = reviewQueue((c) => c.week === k + 1, Infinity);
      const solid = cs.filter((c) => (progress.cards[c.id] || {}).solid).length;
      const seenW = cs.filter((c) => progress.cards[c.id]).length;
      return `<button class="m-week" type="button" data-week="${k + 1}" style="--c:${w.color}">` +
        `<span class="wk">WEEK ${k + 1}</span><span class="nm">${esc(w.title)}</span>` +
        `<span class="mini"><span style="width:${(100 * seenW / cs.length).toFixed(1)}%"></span></span>` +
        `<span class="ct">${q.length ? q.length + " to review" : "caught up · cram"} · ${solid}/${cs.length} solid</span></button>`;
    }).join("");

    renderStoreNote();
    renderSaveState();
    if (!$("#stats").hidden) renderStats();
  }

  function renderStats(confirming) {
    const lines = DECK.weeks.map((w, k) => {
      const cs = ALL.filter((c) => c.week === k + 1);
      const seen = cs.filter((c) => progress.cards[c.id]).length;
      const solid = cs.filter((c) => (progress.cards[c.id] || {}).solid).length;
      return `<div class="row"><span class="lbl">Week ${k + 1} · ${esc(w.title)}</span><span class="val">${seen}/${cs.length} seen · ${solid} solid</span></div>`;
    }).join("");
    const hard = ALL.map((c) => ({ c, s: progress.cards[c.id] }))
      .filter((x) => x.s && x.s.lapses > 0)
      .sort((a, b) => b.s.lapses - a.s.lapses).slice(0, 8)
      .map((x) => `<li>${esc(plain(x.c.term))} <span style="opacity:.55">missed ${x.s.lapses}×</span></li>`).join("");
    $("#stats").innerHTML = lines +
      (hard ? `<div><p class="m-h" style="margin-top:6px">Missed most</p><ul>${hard}</ul></div>` : "") +
      (confirming
        ? `<div class="m-confirm"><span>Reset all 126 cards to new? This can't be undone.</span><button class="yes" type="button" data-m="reset-yes">Reset</button><button type="button" data-m="reset-no">Cancel</button></div>`
        : `<div><button class="m-small danger" type="button" data-m="reset">Reset all progress…</button></div>`);
  }

  $("#menu").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.id === "m-review") {
      const st = summary(ALL, progress, Date.now());
      begin(reviewQueue(null, st.newLeft), false);
    } else if (b.id === "m-tested") {
      const q = reviewQueue((c) => c.starred, Infinity);
      if (q.length) begin(q, false);
      else begin(shuffle(ALL.filter((c) => c.starred)), true);
    } else if (b.id === "m-cram") {
      begin(shuffle(ALL.slice()), true);
    } else if (b.dataset.week) {
      const k = Number(b.dataset.week);
      const q = reviewQueue((c) => c.week === k, Infinity);
      if (q.length) begin(q, false);
      else begin(shuffle(ALL.filter((c) => c.week === k)), true);
    } else if (b.id === "m-stats-btn") {
      $("#stats").hidden = !$("#stats").hidden;
      if (!$("#stats").hidden) renderStats();
    } else if (b.dataset.m === "reset") {
      renderStats(true);
    } else if (b.dataset.m === "reset-no") {
      renderStats();
    } else if (b.dataset.m === "reset-yes") {
      progress = { cards: {} };
      save();
      renderMenu();
      renderStats();
    }
  });

  // ---------------------------------------------------------------- keys

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!$("#menu").hidden) return;              // menu buttons handle Enter themselves
    const k = e.key;
    const arrows = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
    if (k === "Escape") { e.preventDefault(); if (peekOpen()) hidePeek(); else showMenu(); return; }
    if ($("#done").style.display === "flex") {
      if (k === "Enter") { e.preventDefault(); showMenu(); }
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

  document.addEventListener("click", (e) => {
    if (e.target.closest("#toMenu")) showMenu();
    else if (e.target.closest("#logo")) showMenu();
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
  showMenu();
  connectAccount();
})();
