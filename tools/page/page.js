// The review page shared by the phone (Scriptable) and the website. Each
// host fills these in: the phone injects one session's cards when it builds
// the page; the website starts with none and calls startSession() from its
// menu.
let CARDS = /*__CARDS__*/[];
const WEEKS = /*__WEEKS__*/[];
let PRACTICE = /*__PRACTICE__*/false;
// Page text and behaviour that differ between a touch screen and a keyboard.
const UI = Object.assign({
  tipFront: 'Tap to flip',
  tipBack: 'Left = Missed  \u00b7  Right = Confident',
  thirds: true,
}, /*__UI__*/{});
const LADDER = [4, 8, 24];
let results = [];
let later = [];              // shaky cards waiting out their hour: {card, at}
let i = 0, flipped = false;
// Where each card sits on the ladder, so the Confident button can say how
// long it will be gone. Kept in step with the scheduler.
let steps = {};
let wakeTimer = null;

/** Starts a fresh session on these cards. */
function startSession(cards, practice) {
  CARDS = cards.slice();
  PRACTICE = !!practice;
  results = [];
  later = [];
  i = 0;
  steps = {};
  CARDS.forEach(function (c) { steps[c.id] = c.step || 0; });
  clearTimeout(wakeTimer);
  document.querySelector('#done').style.display = 'none';
  document.querySelector('#app').style.display = 'flex';
  render();
}

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
  $('#tip').textContent = UI.tipFront;
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
  $('#tip').textContent = UI.tipBack;
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
  // The next card isn't on screen for another moment; a second press in
  // that gap must not grade it unseen.
  flipped = false;
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
  if (window.ECON_HOST) { window.ECON_HOST.ping(path); return; }
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
    wakeTimer = setTimeout(function wake() {
      if (later.some(function (x) { return x.at <= Date.now(); })) {
        $('#done').style.display = 'none';
        $('#app').style.display = 'flex';
        render();
      } else wakeTimer = setTimeout(wake, 30000);
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
  if (!flipped || !UI.thirds) { flip(); return; }
  const x = e.clientX / scroll.clientWidth;
  if (x < 0.30) grade('missed');
  else if (x > 0.70) grade('confident');
  else flip();
});

if (CARDS.length) startSession(CARDS, PRACTICE);
