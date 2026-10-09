// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: chart-line;

/**
 * ECON 381 — Midterm 1 flashcards for Scriptable (iOS)
 * ---------------------------------------------------------------------------
 * GENERATED FILE. Edit tools/review-template.js, tools/schedule.js,
 * tools/graphs.js or cards/src/*.mjs and run `node tools/build.mjs`.
 *
 * Built on the same pattern as the Wazn Arabic review script: two modes in
 * one file.
 *
 *   WIDGET   Shows how many cards are due and the next term. Tapping it
 *            launches the review session below.
 *
 *   IN APP   A full-screen review session. Tap to flip. Once the answer is
 *            showing, grade it with the buttons along the bottom (or tap the
 *            LEFT third for Missed and the RIGHT third for Confident):
 *
 *              Missed     to the back of the deck, comes round again now
 *              Shaky      back in an hour
 *              Confident  4 hours, then 8, then once a day
 *
 *            The answer side has the term's simplest definition and, in
 *            smaller print, extra detail, connected cards, a real-world
 *            example, real numbers, a worked example and a graph.
 *
 * Everything is in this one file: the 126 cards, the graphs and the
 * scheduler. There is no account and nothing to sign in to. Your progress is
 * a small JSON file in Scriptable's iCloud folder (local storage if iCloud is
 * off), so it survives re-pasting a newer version of this script.
 *
 * SETUP
 *   1. Scriptable → + → paste this file → name it "ECON 381".
 *   2. Run it once.
 *   3. Home screen → add a Scriptable widget → choose this script.
 *      Set "When Interacting" to "Run Script".
 */

// ---------------------------------------------------------------- config

const PROGRESS_FILE = "econ381-progress.json";

const CREAM = "#FDF8F2";
const INK = "#2B2118";
const BRAND = "#1F4E8C";

/*__SCHEDULE__*/

// ------------------------------------------------------------------ data

const DECK = /*__DECK__*/ null;
const GRAPH_SRC = /*__GRAPHS__*/ "";
// The review page itself, shared with the website build (tools/page/).
const PAGE = /*__PAGE__*/ null;

const CARDS = DECK.cards;
const BY_ID = Object.fromEntries(CARDS.map((c) => [c.id, c]));
const WEEKS = DECK.weeks;

// --------------------------------------------------------------- storage

/** iCloud when it's on, so progress follows you between devices and
 *  survives re-pasting the script; the local folder when it isn't. */
function storage() {
  try {
    const fm = FileManager.iCloud();
    fm.documentsDirectory();
    return fm;
  } catch (e) {
    return FileManager.local();
  }
}

function progressPath(fm) {
  return fm.joinPath(fm.documentsDirectory(), PROGRESS_FILE);
}

async function readProgress(fm) {
  const p = progressPath(fm);
  try {
    if (!fm.fileExists(p)) return null;
    if (fm.isFileStoredIniCloud && fm.isFileStoredIniCloud(p) && !fm.isFileDownloaded(p)) {
      await fm.downloadFileFromiCloud(p);
    }
    const data = JSON.parse(fm.readString(p));
    return data && data.cards ? data : null;
  } catch (e) {
    return null;
  }
}

/** The iCloud copy, or the local one if a save ever had to fall back to it
 *  (whichever holds the more recent grade). */
async function loadProgress() {
  const latest = (d) => Math.max(0, ...Object.values(d.cards).map((s) => s.last || 0));
  const copies = [await readProgress(storage()), await readProgress(FileManager.local())]
    .filter(Boolean)
    .sort((a, b) => latest(b) - latest(a));
  return copies[0] || { cards: {} };
}

function saveProgress(progress) {
  const body = JSON.stringify(progress);
  try {
    const fm = storage();
    fm.writeString(progressPath(fm), body);
  } catch (e) {
    // iCloud refused the write: keep the session's grades locally rather
    // than losing them.
    const fm = FileManager.local();
    fm.writeString(progressPath(fm), body);
  }
}

// ------------------------------------------------------------------ sync
//
// The same progress the website keeps, in the Supabase project the Arabic
// app (Wazn) uses. The phone signs in with the Wazn login it already keeps
// in the Keychain (wazn.email / wazn.password, shared with the Wazn
// scripts), pulls the website's progress, combines it with its own
// (mergeProgress: the latest grade per card wins) and pushes the result.
// Without a login or a connection everything still works from iCloud.

const SUPABASE_URL = "https://fphpcfecgnfoogfaeihu.supabase.co";
// Publishable key, meant to ship to apps; row-level security keeps each
// person's row private.
const SUPABASE_KEY = "sb_publishable_UFHFJ-b988nrZ_QP2AbQ4g_64Jq_5s2";
const KEY_EMAIL = "wazn.email";
const KEY_PASSWORD = "wazn.password";

async function credentials(promptIfMissing) {
  if (Keychain.contains(KEY_EMAIL) && Keychain.contains(KEY_PASSWORD)) {
    return { email: Keychain.get(KEY_EMAIL), password: Keychain.get(KEY_PASSWORD) };
  }
  if (!promptIfMissing) return null;
  const a = new Alert();
  a.title = "Sign in to sync";
  a.message = "Your Arabic app (Wazn) email and password. Kept in the iOS Keychain on this phone only.";
  a.addTextField("Email", "");
  a.addSecureTextField("Password");
  a.addAction("Sign in");
  a.addCancelAction("Cancel");
  if ((await a.presentAlert()) === -1) return null;
  const email = a.textFieldValue(0).trim(), password = a.textFieldValue(1);
  if (!email || !password) return null;
  Keychain.set(KEY_EMAIL, email);
  Keychain.set(KEY_PASSWORD, password);
  return { email, password };
}

async function signIn(promptIfMissing) {
  const creds = await credentials(promptIfMissing);
  if (!creds) return null;
  const req = new Request(SUPABASE_URL + "/auth/v1/token?grant_type=password");
  req.method = "POST";
  req.headers = { apikey: SUPABASE_KEY, "Content-Type": "application/json" };
  req.body = JSON.stringify({ email: creds.email, password: creds.password });
  let res = null;
  try { res = await req.loadJSON(); } catch (e) { return null; }   // offline
  if (!res || !res.access_token) {
    // A changed password: forget it so the next sign-in asks again.
    if (promptIfMissing) { Keychain.remove(KEY_EMAIL); Keychain.remove(KEY_PASSWORD); }
    return null;
  }
  return { token: res.access_token, userId: res.user && res.user.id };
}

function authHeaders(sess) {
  return { apikey: SUPABASE_KEY, Authorization: "Bearer " + sess.token, "Content-Type": "application/json" };
}

async function pullRemote(sess) {
  const req = new Request(SUPABASE_URL + "/rest/v1/econ381_progress?select=data");
  req.headers = authHeaders(sess);
  const rows = await req.loadJSON();
  if (!Array.isArray(rows)) throw new Error("couldn't read progress");
  return rows[0] ? rows[0].data : null;
}

/** Pull, combine, push: whatever the website graded comes in, and
 *  whatever the phone graded goes up. Returns whether it got through. */
async function syncNow(sess, progress) {
  if (!sess) return false;
  try {
    mergeProgress(progress, await pullRemote(sess));
    saveProgress(progress);
    const req = new Request(SUPABASE_URL + "/rest/v1/econ381_progress?on_conflict=user_id");
    req.method = "POST";
    req.headers = Object.assign(authHeaders(sess), { Prefer: "resolution=merge-duplicates,return=minimal" });
    req.body = JSON.stringify({ user_id: sess.userId, data: progress });
    await req.load();
    const code = req.response && req.response.statusCode;
    return !code || code < 300;
  } catch (e) {
    return false;   // offline: iCloud has it, the next run syncs
  }
}

// ---------------------------------------------------------------- widget

function timeOf(ms) {
  const d = new Date(ms);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return h + ":" + m + ap;
}

/** Plain text of a term, for places that can't render the HTML it may hold
 *  (subscripts in "Real GDP<sub>t</sub>" and the like). */
function plain(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&[a-z]+;/g, "");
}

function buildWidget(stats) {
  const w = new ListWidget();
  w.backgroundColor = new Color(CREAM);
  w.setPadding(14, 14, 12, 14);
  const big = config.widgetFamily === "medium" || config.widgetFamily === "large";

  const header = w.addStack();
  header.centerAlignContent();
  const title = header.addText("ECON 381");
  title.font = Font.boldSystemFont(11);
  title.textColor = new Color(BRAND);
  header.addSpacer();
  const owed = stats.due + stats.newLeft;
  if (owed > 0) {
    const badge = header.addText(String(owed));
    badge.font = Font.boldSystemFont(13);
    badge.textColor = new Color(BRAND);
  }

  w.addSpacer(6);

  const card = stats.nextCard;
  if (!card) {
    const t = w.addText("All caught up");
    t.font = Font.semiboldSystemFont(15);
    t.textColor = new Color(INK);
    w.addSpacer(2);
    const s = w.addText(
      stats.upcoming < Infinity ? "Next card at " + timeOf(stats.upcoming) : "Nothing due right now.",
    );
    s.font = Font.systemFont(11);
    s.textColor = new Color(INK);
    s.textOpacity = 0.6;
  } else {
    const week = WEEKS[card.week - 1];
    const wk = w.addText((card.starred ? "★ " : "") + "WEEK " + card.week);
    wk.font = Font.boldSystemFont(9);
    wk.textColor = new Color(week.color);
    w.addSpacer(2);

    const term = w.addText(plain(card.term));
    term.font = new Font("Georgia-Bold", big ? 24 : 19);
    term.textColor = new Color(INK);
    term.minimumScaleFactor = 0.55;
    term.lineLimit = 3;

    w.addSpacer(4);
    const parts = [];
    if (stats.due) parts.push(stats.due + " due");
    if (stats.newLeft) parts.push(stats.newLeft + " new");
    const hint = w.addText(parts.join(" · ") + " · tap to review");
    hint.font = Font.systemFont(10);
    hint.textColor = new Color(INK);
    hint.textOpacity = 0.6;
  }

  w.addSpacer();

  // Progress toward every card answered confidently at a full day's spacing.
  const bar = w.addStack();
  bar.size = new Size(0, 4);
  bar.cornerRadius = 2;
  bar.backgroundColor = new Color(INK, 0.09);
  const fillWidth = Math.round((big ? 300 : 130) * (stats.solid / stats.total));
  if (fillWidth > 0) {
    const fill = bar.addStack();
    fill.size = new Size(fillWidth, 4);
    fill.cornerRadius = 2;
    fill.backgroundColor = new Color(BRAND);
  }
  bar.addSpacer();
  w.addSpacer(3);
  const solid = w.addText(stats.solid + "/" + stats.total + " solid");
  solid.font = Font.systemFont(9);
  solid.textColor = new Color(INK);
  solid.textOpacity = 0.45;

  // Tapping anywhere runs this same script, which then falls into review mode.
  w.url = "scriptable:///run?scriptName=" + encodeURIComponent(Script.name());
  if (stats.due === 0 && stats.newLeft === 0 && stats.upcoming < Infinity) {
    w.refreshAfterDate = new Date(stats.upcoming + 60 * 1000);
  }
  return w;
}

// -------------------------------------------------------- review session

/** What the page needs about one card: the card itself plus the terms and
 *  one-line definitions of the cards it connects to, so a connection can be
 *  peeked at without leaving the session. */
function forPage(card) {
  const links = (card.connections || [])
    .map((id) => BY_ID[id])
    .filter(Boolean)
    .map((c) => ({ id: c.id, term: c.term, simple: c.simple, formula: c.formula || "", week: c.week }));
  return { ...card, links };
}

function reviewHTML(cards, mode) {
  const practice = mode === "cram";
  // Cards go in as JSON rather than templated into markup, and every "<" is
  // escaped so nothing in a card can close the script tag early.
  const json = (v) => JSON.stringify(v).replace(/</g, "\\u003c");
  const fill = (src, marker, value) => src.split(marker).join(value);

  let js = PAGE.js;
  js = fill(js, "/*__CARDS__*/[]", json(cards.map(forPage)));
  js = fill(js, "/*__WEEKS__*/[]", json(WEEKS));
  js = fill(js, "/*__PRACTICE__*/false", practice ? "true" : "false");
  let body = PAGE.body;
  body = fill(body, "__QUIT__", practice ? "Cram \u00b7 nothing is rescheduled" : "Swipe down when you\u2019re done");
  body = fill(body, "__DONE_ACTIONS__", '<p style="opacity:.45;font-size:13px">Swipe down to save and close.</p>');

  return '<!doctype html>\n<html><head><meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">\n' +
    "<style>\n" + PAGE.css + "</style></head>\n<body>\n" + body +
    "\n<script>\n" + GRAPH_SRC.replace(/<\/script/gi, "<\\/script") + "\n</script>\n<script>\n" + js + "</script>\n</body></html>";
}

// ------------------------------------------------------------- session run

async function pick(title, message, options) {
  const a = new Alert();
  a.title = title;
  if (message) a.message = message;
  for (const o of options) a.addAction(o);
  a.addCancelAction("Cancel");
  return a.presentAlert();
}

async function tell(title, message) {
  const a = new Alert();
  a.title = title;
  a.message = message;
  a.addAction("OK");
  await a.presentAlert();
}

/** The start menu. Returns {cards, mode} or null if cancelled. */
async function chooseSession(progress, sess) {
  const now = Date.now();
  const st = summary(CARDS, progress, now);
  const starred = (c) => c.starred;
  const tested = buildQueue(CARDS, progress, now, starred, Infinity);
  const testedCount = tested.due.length + tested.fresh.length;

  const options = [];
  const actions = [];
  if (st.due + st.newLeft > 0) {
    const parts = [];
    if (st.due) parts.push(st.due + " due");
    if (st.newLeft) parts.push(st.newLeft + " new");
    options.push("Review " + parts.join(" + "));
    actions.push("review");
  }
  if (testedCount > 0) {
    options.push("★ Tested cards only (" + testedCount + ")");
    actions.push("tested");
  }
  options.push("One week…");
  actions.push("week");
  options.push("Cram all " + CARDS.length + " · no scheduling");
  actions.push("cram");
  options.push("Progress & reset…");
  actions.push("stats");
  if (!sess) {
    options.push("Sign in to sync with the website…");
    actions.push("signin");
  }

  let message = st.solid + " of " + st.total + " solid" + (sess ? " · synced" : "");
  if (st.due + st.newLeft === 0) {
    message = "All caught up" +
      (st.upcoming < Infinity ? " · next card at " + timeOf(st.upcoming) : "") +
      "\n" + message;
  }
  const choice = await pick("ECON 381 · Midterm 1", message, options);
  if (choice === -1) return null;
  const act = actions[choice];

  if (act === "signin") return { signin: true };
  if (act === "review") {
    const q = buildQueue(CARDS, progress, now, null, st.newLeft);
    return { cards: interleave(q.due, q.fresh), mode: "review" };
  }
  if (act === "tested") {
    return { cards: interleave(tested.due, tested.fresh), mode: "review" };
  }
  if (act === "week") {
    const labels = WEEKS.map((w, k) => {
      const q = buildQueue(CARDS, progress, now, (c) => c.week === k + 1, Infinity);
      const n = q.due.length + q.fresh.length;
      return "Week " + (k + 1) + ": " + w.title + (n ? " (" + n + ")" : " ✓");
    });
    const k = await pick("Which week?", "Due and new cards from that week only.", labels);
    if (k === -1) return null;
    const q = buildQueue(CARDS, progress, now, (c) => c.week === k + 1, Infinity);
    if (q.due.length + q.fresh.length === 0) {
      const again = await pick(
        "Week " + (k + 1) + " is caught up",
        "Nothing in it is due. Cram it anyway? That won't change its schedule.",
        ["Cram week " + (k + 1)],
      );
      if (again === -1) return null;
      return { cards: shuffle(CARDS.filter((c) => c.week === k + 1)), mode: "cram" };
    }
    return { cards: interleave(q.due, q.fresh), mode: "review" };
  }
  if (act === "cram") {
    return { cards: shuffle(CARDS.slice()), mode: "cram" };
  }
  if (act === "stats") {
    await showStats(progress);
    return null;
  }
  return null;
}

async function showStats(progress) {
  const now = Date.now();
  const st = summary(CARDS, progress, now);
  const lines = WEEKS.map((w, k) => {
    const cs = CARDS.filter((c) => c.week === k + 1);
    const seen = cs.filter((c) => progress.cards[c.id]).length;
    const solid = cs.filter((c) => (progress.cards[c.id] || {}).solid).length;
    return "Week " + (k + 1) + ": " + seen + "/" + cs.length + " seen · " + solid + " solid";
  });
  // The cards missed most, worth a look in the notes.
  const hard = CARDS
    .map((c) => ({ c, s: progress.cards[c.id] }))
    .filter((x) => x.s && x.s.lapses > 0)
    .sort((a, b) => b.s.lapses - a.s.lapses)
    .slice(0, 5)
    .map((x) => "• " + plain(x.c.term) + " (" + x.s.lapses + "×)");
  const msg = lines.join("\n") +
    "\n\n" + st.unseen + " never seen · " + st.due + " due now" +
    (hard.length ? "\n\nMissed most:\n" + hard.join("\n") : "");

  const a = new Alert();
  a.title = st.solid + " of " + st.total + " solid";
  a.message = msg;
  a.addAction("OK");
  a.addDestructiveAction("Reset all progress");
  const choice = await a.presentAlert();
  if (choice === 1) {
    const sure = new Alert();
    sure.title = "Reset everything?";
    sure.message = "Every card goes back to new. This can't be undone.";
    sure.addDestructiveAction("Reset");
    sure.addCancelAction("Cancel");
    if ((await sure.presentAlert()) === 0) {
      const fresh = { cards: {}, days: progress.days || {}, resetAt: Date.now() };
      for (const k in progress) delete progress[k];
      Object.assign(progress, fresh);
      saveProgress(progress);
      await tell("Reset", "All 126 cards are new again.");
    }
  }
}

async function runReview() {
  const progress = await loadProgress();
  let sess = await signIn(false);
  if (sess && !(await syncNow(sess, progress))) sess = null;
  let session = await chooseSession(progress, sess);
  while (session && session.signin) {
    sess = await signIn(true);
    if (sess && (await syncNow(sess, progress))) await tell("Synced", "This phone and the website now share progress.");
    else { sess = null; await tell("Couldn't sign in", "Check the email and password (the ones you use for Wazn) and your connection."); }
    session = await chooseSession(progress, sess);
  }
  if (!session || !session.cards.length) { if (sess) await syncNow(sess, progress); return; }
  const practice = session.mode === "cram";

  // The page shows "Confident · in N hours" from each card's ladder step.
  const cards = session.cards.map((c) => {
    const s = progress.cards[c.id];
    return { ...c, step: s ? s.step : 0 };
  });

  const applied = new Set();
  function apply(seq, id, rating, t) {
    if (practice || applied.has(seq) || !BY_ID[id]) return;
    if (!["missed", "shaky", "confident"].includes(rating)) return;
    progress.cards[id] = schedule(progress.cards[id], rating, t || Date.now());
    progress.days = progress.days || {};
    const day = isoDay(t || Date.now());
    progress.days[day] = (progress.days[day] || 0) + 1;
    applied.add(seq);
    try {
      saveProgress(progress);
    } catch (e) {
      applied.delete(seq);   // the pass after dismissal will try again
    }
  }

  const wv = new WebView();
  await wv.loadHTML(reviewHTML(cards, session.mode));

  // The page can't call into Scriptable mid-session, so it navigates to an
  // econ381:// URL and this handler intercepts it. Returning false blocks
  // the navigation and leaves the session on screen untouched.
  wv.shouldAllowRequest = (request) => {
    const url = String((request && request.url) || "");
    if (!url.startsWith("econ381://")) return true;
    if (url.startsWith("econ381://grade")) {
      const get = (k) => {
        const m = url.match(new RegExp("[?&]" + k + "=([^&]+)"));
        return m ? decodeURIComponent(m[1]) : null;
      };
      apply(Number(get("seq")), get("id"), get("rating"), Number(get("t")));
    }
    return false;
  };

  // present() resolves when the sheet is dismissed; the page is still alive
  // and its list of grades can be read back. Anything the live saves missed
  // is applied now, in order, so a session abandoned halfway still counts.
  await wv.present(true);

  let graded = [];
  try {
    const raw = await wv.evaluateJavaScript("JSON.stringify(results)", false);
    const parsed = JSON.parse(raw || "[]");
    if (Array.isArray(parsed)) graded = parsed;
  } catch (e) {
    /* nothing graded, or the page was gone */
  }
  graded.forEach((r, seq) => apply(seq, r.id, r.rating, r.t));
  if (sess && !practice) await syncNow(sess, progress);
}

// ------------------------------------------------------------------ main

if (config.runsInWidget) {
  const progress = await loadProgress();
  try {
    const sess = await signIn(false);
    if (sess) { mergeProgress(progress, await pullRemote(sess)); saveProgress(progress); }
  } catch (e) { /* offline: the iCloud copy is fine */ }
  Script.setWidget(buildWidget(summary(CARDS, progress, Date.now())));
  Script.complete();
} else {
  await runReview();
  Script.complete();
}
