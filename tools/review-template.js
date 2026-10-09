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
  // Cards go in as JSON rather than templated into markup, and every "<" is
  // escaped so nothing in a card can close the script tag early.
  const payload = JSON.stringify(cards.map(forPage)).replace(/</g, "\\u003c");
  const weeks = JSON.stringify(WEEKS).replace(/</g, "\\u003c");
  const graphs = GRAPH_SRC.replace(/<\/script/gi, "<\\/script");
  const practice = mode === "cram";

  return `<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<style>
  :root { --ink:${INK}; --cream:${CREAM}; --wk:${BRAND}; --wk-soft:rgba(31,78,140,.10); }
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  html, body { margin:0; height:100%; overflow:hidden;
    background:var(--cream); color:var(--ink);
    font-family:-apple-system,system-ui,sans-serif; user-select:none; -webkit-user-select:none; }
  #app { height:100%; display:flex; flex-direction:column; }
  header { display:flex; align-items:center; gap:10px; padding:12px 16px 2px; }
  #quitline { text-align:center; padding-bottom:2px; }
  #bar { flex:1; height:5px; border-radius:3px; background:rgba(0,0,0,.09); overflow:hidden; }
  #fill { height:100%; width:0%; background:var(--wk); transition:width .25s ease, background .25s; }
  #count { font-size:12px; opacity:.55; font-variant-numeric:tabular-nums; }
  #quit { font-size:11px; opacity:.45; }
  #logo { display:flex; align-items:center; gap:6px; padding:4px 6px 4px 2px;
          font-size:13px; font-weight:800; letter-spacing:.06em; color:var(--wk); transition:color .25s; }
  #logo svg { width:19px; height:19px; }
  main { flex:1; position:relative; display:flex; min-height:0; }
  /* margin:auto centres the card while it is short but still lets it scroll
     once the answer is taller than the screen. */
  #scroll { flex:1; display:flex; overflow-y:auto; -webkit-overflow-scrolling:touch;
            padding:14px 20px 18px; }
  #card { margin:auto; width:100%; max-width:560px; text-align:center; }

  .chips { display:flex; justify-content:center; gap:6px; flex-wrap:wrap; }
  .chip { font-size:10.5px; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
          padding:4px 9px; border-radius:20px; background:var(--wk-soft); color:var(--wk); }
  .chip.star { background:rgba(194,98,42,.13); color:#C2622A; }
  .term { font-family:ui-serif,"New York",Georgia,serif; font-weight:700;
          font-size:36px; line-height:1.18; margin-top:18px; letter-spacing:-.01em; }
  .weekname { font-size:13px; opacity:.5; margin-top:12px; }
  .term.sm { font-size:21px; margin-top:12px; color:var(--wk); }
  .simple { font-size:20px; line-height:1.42; margin-top:10px; }
  .fx { margin:14px auto 0; padding:12px 14px; border-radius:14px; background:var(--wk-soft);
        font-family:ui-serif,"New York",Georgia,serif; font-size:19px; line-height:1.6;
        display:inline-block; max-width:100%; }
  .fx i, .simple i, .detail i, .peek i { font-family:ui-serif,"New York",Georgia,serif; }

  /* hand-built maths: fractions, sums, hats */
  .fr { display:inline-flex; flex-direction:column; vertical-align:middle; text-align:center;
        margin:0 2px; line-height:1.15; }
  .fr > span:first-child { border-bottom:1.3px solid currentColor; padding:0 3px 1px; }
  .fr > span:last-child { padding:1px 3px 0; }
  .fx .fr { font-size:.92em; }
  .op { margin:0 .22em; }
  sub, sup { font-size:.68em; line-height:0; }

  .detail { margin-top:18px; text-align:start; }
  .sect { border-top:1px solid rgba(0,0,0,.09); margin-top:13px; padding-top:10px; }
  .sect h3 { margin:0 0 6px; font-size:10.5px; font-weight:700; opacity:.45;
             letter-spacing:.09em; text-transform:uppercase; }
  .sect p { margin:0; font-size:14px; line-height:1.48; opacity:.86; }
  .sect p + p { margin-top:6px; }
  .row { display:flex; align-items:baseline; justify-content:space-between;
         gap:14px; padding:4px 0; }
  .row .lbl { font-size:13px; opacity:.65; line-height:1.35; }
  .row .val { font-size:16px; font-weight:700; white-space:nowrap; flex:none;
              color:var(--wk); font-variant-numeric:tabular-nums; }
  .src { font-size:11px; opacity:.42; margin-top:4px; line-height:1.35; }
  ol.steps { margin:0; padding-left:20px; font-size:14px; line-height:1.48; }
  ol.steps li { padding:2px 0; opacity:.88; }
  ol.steps li::marker { color:var(--wk); font-weight:700; }
  .links { display:flex; flex-wrap:wrap; gap:6px; }
  .link { font-size:13px; padding:6px 11px; border-radius:20px; border:1px solid var(--wk-soft);
          background:#fff; color:var(--ink); line-height:1.2; }
  .link b { color:var(--wk); font-weight:600; }
  .graph { margin-top:4px; background:#fff; border-radius:14px; padding:8px 6px 4px;
           border:1px solid rgba(0,0,0,.06); }
  .graph svg { width:100%; height:auto; display:block; overflow:visible; }
  .graph .cap { font-size:11.5px; opacity:.55; text-align:center; padding:2px 8px 6px; line-height:1.35; }
  .tags { display:flex; flex-wrap:wrap; gap:5px; justify-content:center; margin-top:18px; }
  .tag { font-size:10.5px; padding:2px 8px; border-radius:20px; border:1px solid rgba(0,0,0,.15); opacity:.6; }
  .tag.pe { border-color:#E8A25E; color:#B4561B; background:#FFF3E6; opacity:1; font-weight:700; }

  /* SVG theme */
  svg .ax { stroke:var(--ink); stroke-width:1.3; fill:none; opacity:.75; }
  svg .grid { stroke:var(--ink); stroke-width:.6; opacity:.12; }
  svg .c1 { stroke:var(--wk); stroke-width:2.6; fill:none; stroke-linecap:round; }
  svg .c2 { stroke:#C2622A; stroke-width:2.6; fill:none; stroke-linecap:round; }
  svg .c3 { stroke:#2E7D52; stroke-width:2.4; fill:none; stroke-linecap:round; }
  svg .c4 { stroke:var(--ink); stroke-width:1.8; fill:none; opacity:.55; stroke-linecap:round; }
  svg .dash { stroke-dasharray:4 4; }
  svg .faint { opacity:.4; }
  svg .dot { fill:var(--ink); }
  svg .fill1 { fill:var(--wk); opacity:.16; }
  svg .fill2 { fill:#C2622A; opacity:.16; }
  svg .fill3 { fill:#2E7D52; opacity:.16; }
  svg .solid1 { fill:var(--wk); }
  svg .solid2 { fill:#C2622A; }
  svg .solid3 { fill:#2E7D52; }
  svg .solid4 { fill:var(--ink); opacity:.35; }
  svg .box { fill:#fff; stroke:var(--ink); stroke-width:1.2; }
  svg .box1 { fill:var(--wk-soft); stroke:var(--wk); stroke-width:1.4; }
  svg .box2 { fill:rgba(194,98,42,.10); stroke:#C2622A; stroke-width:1.4; }
  svg .box3 { fill:rgba(46,125,82,.10); stroke:#2E7D52; stroke-width:1.4; }
  svg text { font-family:-apple-system,system-ui,sans-serif; font-size:11px; fill:var(--ink); }
  svg text.lb { font-size:10px; opacity:.6; }
  svg text.k1 { fill:var(--wk); font-weight:700; }
  svg text.k2 { fill:#C2622A; font-weight:700; }
  svg text.k3 { fill:#2E7D52; font-weight:700; }
  svg text.it { font-family:ui-serif,"New York",Georgia,serif; font-style:italic; font-size:12.5px; }
  svg text.b { font-weight:700; }
  svg text.w { fill:#fff; font-weight:700; }

  #tip { flex:none; text-align:center; font-size:12px; opacity:.45; padding:0 16px 8px; }
  #flash { position:absolute; inset:0; display:flex; align-items:center;
           justify-content:center; font-size:34px; font-weight:800;
           color:#fff; opacity:0; pointer-events:none; transition:opacity .18s; }
  footer { display:flex; gap:9px; padding:0 14px 26px; }
  .btn { flex:1; padding:14px 0 12px; border-radius:15px; font-size:15.5px;
         font-weight:700; color:#fff; text-align:center; line-height:1.15; }
  .btn small { display:block; font-size:10.5px; font-weight:600; opacity:.8; margin-top:2px; }
  .missed { background:#C0392B; }
  .shaky  { background:#D9952B; }
  .confident { background:#2E7D52; }

  #peek { position:absolute; left:0; right:0; bottom:0; background:#fff; border-radius:20px 20px 0 0;
          box-shadow:0 -10px 30px rgba(0,0,0,.14); padding:18px 22px 34px; transform:translateY(105%);
          transition:transform .22s ease, visibility 0s linear .22s; text-align:center; max-height:70%;
          overflow-y:auto; z-index:5; visibility:hidden; pointer-events:none; }
  /* Hidden, it sits just below the card, over the grade buttons: it must not
     catch their taps. */
  #peek.on { transform:none; visibility:visible; pointer-events:auto; transition:transform .22s ease; }
  #peek .grab { width:38px; height:5px; border-radius:3px; background:rgba(0,0,0,.15); margin:-6px auto 12px; }
  #peek .term { font-size:22px; margin-top:8px; }
  #peek .simple { font-size:16px; }
  #peek .fx { font-size:16px; }
  #peek .close { margin-top:16px; font-size:13px; opacity:.5; }

  #done { display:none; flex-direction:column; align-items:center;
          justify-content:center; height:100%; gap:12px; padding:0 30px; text-align:center; }
  #done h2 { font-family:ui-serif,"New York",Georgia,serif; font-size:30px; margin:0; }
  #done p { opacity:.6; margin:0; font-size:15px; line-height:1.45; }
  #done .tally { display:flex; gap:10px; margin:6px 0; }
  #done .tally div { padding:10px 14px; border-radius:14px; color:#fff; font-weight:700; font-size:20px; min-width:74px; }
  #done .tally small { display:block; font-size:10.5px; font-weight:600; opacity:.85; }
</style></head>
<body>
<div id="app">
  <header>
    <span id="logo">
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 5v29h29" stroke-width="2.6"/>
        <path d="M10 29c6-1 9-5 12-11s6-9 11-10" stroke-width="2.6"/>
        <path d="M10 12l23 17" stroke-width="2" opacity=".55"/>
      </svg>ECON 381
    </span>
    <div id="bar"><div id="fill"></div></div>
    <span id="count"></span>
  </header>
  <div id="quitline"><span id="quit">${practice ? "Cram · nothing is rescheduled" : "Swipe down when you’re done"}</span></div>
  <main>
    <div id="scroll"><div id="card"></div></div>
    <div id="flash"></div>
    <div id="peek"></div>
  </main>
  <div id="tip">Tap to flip</div>
  <footer>
    <div class="btn missed" data-act="missed">Missed<small>again now</small></div>
    <div class="btn shaky" data-act="shaky">Shaky<small>in 1 hour</small></div>
    <div class="btn confident" data-act="confident">Confident<small id="confHint">later</small></div>
  </footer>
</div>

<div id="done">
  <h2>Done</h2>
  <p id="doneText"></p>
  <div class="tally">
    <div class="missed"><span id="tM">0</span><small>missed</small></div>
    <div class="shaky"><span id="tS">0</span><small>shaky</small></div>
    <div class="confident"><span id="tC">0</span><small>confident</small></div>
  </div>
  <p id="laterText"></p>
  <p style="opacity:.45;font-size:13px">Swipe down to save and close.</p>
</div>

<script>
${graphs}
</script>
<script>
const CARDS = ${payload};
const WEEKS = ${weeks};
const PRACTICE = ${practice ? "true" : "false"};
const LADDER = [4, 8, 24];
const results = [];
const later = [];            // shaky cards waiting out their hour: {card, at}
const total = CARDS.length;
let i = 0, flipped = false;
// Where each card sits on the ladder, so the Confident button can say how
// long it will be gone. Kept in step with the native scheduler.
const steps = {};
CARDS.forEach(function (c) { steps[c.id] = c.step || 0; });

const $ = function (s) { return document.querySelector(s); };

/** A shaky card whose hour is up goes back in at the front of the queue. */
function releaseLater() {
  const now = Date.now();
  for (let k = later.length - 1; k >= 0; k--) {
    if (later[k].at <= now) {
      CARDS.splice(i, 0, later[k].card);
      later.splice(k, 1);
    }
  }
}

function setWeek(c) {
  const w = WEEKS[c.week - 1];
  const r = document.documentElement.style;
  r.setProperty('--wk', w.color);
  r.setProperty('--wk-soft', w.soft);
}

function chips(c) {
  const w = WEEKS[c.week - 1];
  let h = '<div class="chips"><span class="chip">Week ' + c.week + '</span>';
  if (c.starred) h += '<span class="chip star">★ Tested</span>';
  return h + '</div>';
}

function render() {
  releaseLater();
  const c = CARDS[i];
  if (!c) return finishScreen();
  flipped = false;
  setWeek(c);
  hidePeek();
  $('#tip').textContent = 'Tap to flip';
  const doneCount = results.length;
  $('#count').textContent = Math.min(i + 1, CARDS.length) + '/' + CARDS.length;
  $('#fill').style.width = ((i / Math.max(CARDS.length, 1)) * 100) + '%';
  $('#card').innerHTML = chips(c) +
    '<div class="term">' + c.term + '</div>' +
    '<div class="weekname">' + WEEKS[c.week - 1].title + '</div>';
  $('#scroll').scrollTop = 0;
  $('footer').style.visibility = 'hidden';
}

function flip() {
  const c = CARDS[i];
  if (!c) return;
  flipped = !flipped;
  if (!flipped) return render();
  let h = chips(c) + '<div class="term sm">' + c.term + '</div>';
  h += '<div class="simple">' + c.simple + '</div>';
  if (c.formula) h += '<div class="fx">' + c.formula + '</div>';
  h += detail(c);
  if (c.tags && c.tags.length) {
    h += '<div class="tags">' + c.tags.map(function (t) {
      return '<span class="tag' + (/^PE/.test(t) ? ' pe' : '') + '">' + esc(t) + '</span>';
    }).join('') + '</div>';
  }
  $('#card').innerHTML = h;
  $('#scroll').scrollTop = 0;
  $('#tip').textContent = 'Left = Missed  ·  Right = Confident';
  const step = Math.min(steps[c.id] || 0, LADDER.length - 1);
  $('#confHint').textContent = 'in ' + (LADDER[step] === 24 ? '1 day' : LADDER[step] + ' hours');
  $('footer').style.visibility = 'visible';
}

/* ----------------------------------------------------------- answer detail */

function section(title, body) {
  if (!body) return '';
  return '<div class="sect"><h3>' + title + '</h3>' + body + '</div>';
}

function paras(x) {
  if (!x) return '';
  return (Array.isArray(x) ? x : [x]).map(function (p) { return '<p>' + p + '</p>'; }).join('');
}

/** The answer's small print, in a fixed order. A section with nothing to show
 *  is left out rather than shown empty. */
function detail(c) {
  let d = '';
  d += section('Additional info', paras(c.more));
  if (c.links && c.links.length) {
    d += section('Connections', '<div class="links">' + c.links.map(function (l) {
      return '<span class="link" data-peek="' + l.id + '"><b>' + l.term + '</b></span>';
    }).join('') + '</div>' + (c.connectNote ? '<p style="margin-top:8px">' + c.connectNote + '</p>' : ''));
  }
  d += section('Real-world example', paras(c.example));
  if (c.numbers && c.numbers.length) {
    let rows = c.numbers.map(function (n) {
      return '<div class="row"><span class="lbl">' + n[0] + '</span><span class="val">' + n[1] + '</span></div>';
    }).join('');
    if (c.numbersSource) rows += '<div class="src">' + c.numbersSource + '</div>';
    d += section('By the numbers', rows);
  }
  if (c.played && c.played.length) {
    d += section('Played out', '<ol class="steps">' + c.played.map(function (s) {
      return '<li>' + s + '</li>';
    }).join('') + '</ol>');
  }
  if (c.graph) {
    const g = drawGraph(c.graph);
    if (g) d += section('Graph', '<div class="graph">' + g.svg +
      (g.cap ? '<div class="cap">' + g.cap + '</div>' : '') + '</div>');
  }
  return d ? '<div class="detail">' + d + '</div>' : '';
}

function drawGraph(spec) {
  try {
    const key = typeof spec === 'string' ? spec : spec.key;
    const fn = window.GRAPHS && window.GRAPHS[key];
    return fn ? fn(spec.args || {}) : null;
  } catch (e) {
    return null;
  }
}

/* -------------------------------------------------------- connection peek */

function showPeek(id) {
  const c = CARDS[i];
  const l = (c.links || []).filter(function (x) { return x.id === id; })[0];
  if (!l) return;
  const w = WEEKS[l.week - 1];
  let h = '<div class="grab"></div><div class="chips"><span class="chip" style="background:' + w.soft +
    ';color:' + w.color + '">Week ' + l.week + '</span></div>' +
    '<div class="term" style="color:' + w.color + '">' + l.term + '</div>' +
    '<div class="simple">' + l.simple + '</div>';
  if (l.formula) h += '<div class="fx">' + l.formula + '</div>';
  h += '<div class="close">Tap to close</div>';
  $('#peek').innerHTML = h;
  $('#peek').classList.add('on');
}

function hidePeek() { $('#peek').classList.remove('on'); }
function peekOpen() { return $('#peek').classList.contains('on'); }

/* ----------------------------------------------------------------- grading */

function grade(rating) {
  if (!flipped || !CARDS[i]) return;
  const card = CARDS[i];
  const t = Date.now();
  results.push({ id: card.id, rating: rating, t: t });
  // Handed to Scriptable straight away so it is saved while the session is
  // still open, not only on the way out. The sequence number is what the
  // native side dedupes on: a card that comes round again is graded again.
  ping('grade?id=' + encodeURIComponent(card.id) + '&rating=' + rating +
       '&seq=' + (results.length - 1) + '&t=' + t);
  const colors = { missed: '#C0392B', shaky: '#D9952B', confident: '#2E7D52' };
  flash(rating.charAt(0).toUpperCase() + rating.slice(1), colors[rating]);

  if (rating === 'missed') {
    // Didn't know it: to the back of the deck, so it comes round again this
    // session instead of disappearing.
    steps[card.id] = 0;
    CARDS.splice(i, 1);
    CARDS.push(card);
  } else if (rating === 'shaky') {
    steps[card.id] = Math.max((steps[card.id] || 0) - 1, 0);
    CARDS.splice(i, 1);
    // In cram mode nothing is scheduled, so a shaky card simply goes back a
    // few places; otherwise it waits out its hour.
    if (PRACTICE) CARDS.splice(Math.min(i + 5, CARDS.length), 0, card);
    else later.push({ card: card, at: t + 60 * 60 * 1000 });
  } else {
    steps[card.id] = Math.min((steps[card.id] || 0) + 1, LADDER.length - 1);
    i++;
  }
  setTimeout(render, 170);
}

/** Fires an econ381:// request that the native side intercepts and blocks.
 *  Sent from a hidden iframe so the page itself never navigates. */
function ping(path) {
  const f = document.createElement('iframe');
  f.style.display = 'none';
  f.src = 'econ381://' + path;
  document.body.appendChild(f);
  setTimeout(function () { f.remove(); }, 80);
}

function flash(text, color) {
  const f = $('#flash');
  f.textContent = text;
  f.style.background = color;
  f.style.opacity = '.92';
  setTimeout(function () { f.style.opacity = '0'; }, 160);
}

function finishScreen() {
  $('#app').style.display = 'none';
  $('#done').style.display = 'flex';
  const last = {};
  results.forEach(function (r) { last[r.id] = r.rating; });
  const n = { missed: 0, shaky: 0, confident: 0 };
  results.forEach(function (r) { n[r.rating]++; });
  const seen = Object.keys(last).length;
  $('#doneText').textContent = seen + ' card' + (seen === 1 ? '' : 's') + ' · ' +
    results.length + ' answer' + (results.length === 1 ? '' : 's');
  $('#tM').textContent = n.missed;
  $('#tS').textContent = n.shaky;
  $('#tC').textContent = n.confident;
  if (later.length) {
    const at = Math.min.apply(null, later.map(function (x) { return x.at; }));
    const d = new Date(at);
    let h = d.getHours(); const m = String(d.getMinutes()).padStart(2, '0');
    const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
    $('#laterText').textContent = later.length + ' shaky card' + (later.length === 1 ? '' : 's') +
      ' come' + (later.length === 1 ? 's' : '') + ' back at ' + h + ':' + m + ap +
      '. Leave this open and ' + (later.length === 1 ? 'it' : 'they') + '’ll reappear, or run the script again then.';
    // Wait for them here as well: if the screen is left open, they appear.
    setTimeout(function wake() {
      if (later.some(function (x) { return x.at <= Date.now(); })) {
        $('#done').style.display = 'none';
        $('#app').style.display = 'flex';
        render();
      } else setTimeout(wake, 30000);
    }, 30000);
  } else {
    $('#laterText').textContent = '';
  }
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch];
  });
}

document.addEventListener('click', function (e) {
  if (peekOpen()) { hidePeek(); return; }
  const pk = e.target.closest('[data-peek]');
  if (pk) { showPeek(pk.dataset.peek); return; }
  const act = e.target.closest('[data-act]');
  if (!act) return;
  if (!flipped) { flip(); return; }   // the buttons only grade after the reveal
  grade(act.dataset.act);
});

/* The thirds are worked out from where the tap landed rather than from an
   overlay, so the answer can scroll normally underneath. */
const scroll = $('#scroll');
let dragged = false;
scroll.addEventListener('touchstart', function () { dragged = false; }, { passive: true });
scroll.addEventListener('touchmove', function () { dragged = true; }, { passive: true });
scroll.addEventListener('click', function (e) {
  if (dragged) { dragged = false; return; }       // a tap that ended a scroll is not a grade
  if (e.target.closest('[data-act],[data-peek]')) return;
  if (peekOpen()) return;
  if (!flipped) { flip(); return; }
  const x = e.clientX / scroll.clientWidth;
  if (x < 0.30) grade('missed');
  else if (x > 0.70) grade('confident');
  else flip();
});

render();
</script>
</body></html>`;
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
async function chooseSession(progress) {
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

  let message = st.solid + " of " + st.total + " solid";
  if (st.due + st.newLeft === 0) {
    message = "All caught up" +
      (st.upcoming < Infinity ? " · next card at " + timeOf(st.upcoming) : "") +
      "\n" + message;
  }
  const choice = await pick("ECON 381 · Midterm 1", message, options);
  if (choice === -1) return null;
  const act = actions[choice];

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

/** Due cards first, with new ones folded in every few so a long session
 *  doesn't end on a block of nothing but unfamiliar terms. */
function interleave(due, fresh) {
  if (!due.length) return fresh.slice();
  const out = [];
  let d = 0, f = 0;
  while (d < due.length || f < fresh.length) {
    for (let k = 0; k < 3 && d < due.length; k++) out.push(due[d++]);
    if (f < fresh.length) out.push(fresh[f++]);
  }
  return out;
}

function shuffle(a) {
  for (let k = a.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a;
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
      saveProgress({ cards: {} });
      await tell("Reset", "All 126 cards are new again.");
    }
  }
}

async function runReview() {
  const progress = await loadProgress();
  const session = await chooseSession(progress);
  if (!session || !session.cards.length) return;
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
}

// ------------------------------------------------------------------ main

if (config.runsInWidget) {
  const progress = await loadProgress();
  Script.setWidget(buildWidget(summary(CARDS, progress, Date.now())));
  Script.complete();
} else {
  await runReview();
  Script.complete();
}
