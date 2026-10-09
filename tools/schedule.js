// ------------------------------------------------------------- scheduling
//
// Accelerated Anki for exam week. Three grades:
//
//   missed     straight back into this session, at the back of the deck.
//              The card is due now and its ladder resets to the bottom.
//   shaky      back in an hour. Steps one rung down the ladder.
//   confident  climbs the ladder: 4 hours, then 8, then a day. Three
//              confident answers in a row and a card is seen about once a
//              day; it never goes longer than that before the exam.
//
// This block is pure (no Scriptable APIs) so tools/schedule.test.mjs can run
// it under Node exactly as the phone runs it. build.mjs pastes it verbatim
// into the generated script.

const HOUR = 60 * 60 * 1000;
const LADDER_HOURS = [4, 8, 24];
const SHAKY_HOURS = 1;
// New cards introduced per calendar day by the plain "Review" session.
const NEW_PER_DAY = 25;

/** A card's stored state, or the state of a card never seen. */
function cardState(progress, id) {
  return (progress.cards && progress.cards[id]) || null;
}

/** Applies one grade, made at time `now` (ms), to a card's stored state. */
function schedule(state, rating, now) {
  const s = state
    ? { ...state }
    : { step: 0, due: now, seen: 0, lapses: 0, first: now };
  s.seen = (s.seen || 0) + 1;
  s.last = now;
  s.rating = rating;

  if (rating === "missed") {
    s.step = 0;
    s.lapses = (s.lapses || 0) + 1;
    s.due = now;
  } else if (rating === "shaky") {
    s.step = Math.max((s.step || 0) - 1, 0);
    s.due = now + SHAKY_HOURS * HOUR;
  } else if (rating === "confident") {
    const step = Math.min(s.step || 0, LADDER_HOURS.length - 1);
    s.due = now + LADDER_HOURS[step] * HOUR;
    s.step = Math.min(step + 1, LADDER_HOURS.length - 1);
    // Reaching the top rung once means it has been answered confidently at
    // every spacing the ladder has.
    if (step === LADDER_HOURS.length - 1) s.solid = true;
  } else {
    throw new Error("unknown rating " + rating);
  }
  return s;
}

/** Local calendar day as yyyy-mm-dd (UTC would roll the day over early for
 *  anyone studying at night west of Greenwich). */
function isoDay(ms) {
  const d = new Date(ms);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}

/** How many new cards have been started today. */
function newToday(progress, now) {
  const today = isoDay(now);
  let n = 0;
  for (const id in progress.cards || {}) {
    const s = progress.cards[id];
    if (s && s.first && isoDay(s.first) === today) n++;
  }
  return n;
}

/**
 * The cards a session should show, in order.
 *
 *   due      seen before and due now: tested (★) first, then most overdue.
 *   fresh    never seen, in deck order (the course's own order), tested
 *            first within each week so the exam questions arrive early.
 *
 * `limitNew` caps the fresh cards (the daily allowance); pass Infinity for
 * a filtered session such as one week or tested-only.
 */
function buildQueue(cards, progress, now, filter, limitNew) {
  const due = [];
  const fresh = [];
  for (const c of cards) {
    if (filter && !filter(c)) continue;
    const s = cardState(progress, c.id);
    if (!s) fresh.push(c);
    else if (s.due <= now) due.push({ c, s });
  }
  due.sort((a, b) =>
    (b.c.starred - a.c.starred) || (a.s.due - b.s.due) || (a.c.n - b.c.n));
  fresh.sort((a, b) =>
    (a.week - b.week) || (b.starred - a.starred) || (a.n - b.n));
  const allow = Math.max(0, Math.min(fresh.length, limitNew));
  return {
    due: due.map((x) => x.c),
    fresh: fresh.slice(0, allow),
    freshLeft: fresh.length - allow,
  };
}

/** Counts for the widget and the start menu. `nextCard` is what the widget
 *  shows: the first card a Review session would open on. */
function summary(cards, progress, now) {
  let due = 0, unseen = 0, solid = 0, upcoming = Infinity;
  for (const c of cards) {
    const s = cardState(progress, c.id);
    if (!s) { unseen++; continue; }
    if (s.solid) solid++;
    if (s.due <= now) due++;
    else if (s.due < upcoming) upcoming = s.due;
  }
  const newLeft = Math.max(0, Math.min(unseen, NEW_PER_DAY - newToday(progress, now)));
  const q = buildQueue(cards, progress, now, null, newLeft);
  const nextCard = q.due[0] || q.fresh[0] || null;
  return { due, unseen, newLeft, solid, total: cards.length, nextCard, upcoming };
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
