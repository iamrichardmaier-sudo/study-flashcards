// node --test tools/
//
// Runs the scheduler exactly as the phone does: tools/schedule.js is the
// same text build.mjs pastes into the Scriptable script.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const src = readFileSync(new URL("./schedule.js", import.meta.url), "utf8");
const S = {};
vm.runInNewContext(src + "\nObject.assign(out, { schedule, buildQueue, summary, newToday, LADDER_HOURS, NEW_PER_DAY });", { out: S });

const H = 60 * 60 * 1000;
const T0 = new Date(2026, 9, 9, 9, 0).getTime();   // 9:00 local

const deck = Array.from({ length: 40 }, (_, k) => ({
  id: "c" + (k + 1), n: k + 1, week: 1 + Math.floor(k / 10), starred: k % 3 === 0,
}));

test("confident climbs the ladder: 4h, 8h, then a day, and stays at a day", () => {
  let s = S.schedule(null, "confident", T0);
  assert.equal(s.due - T0, 4 * H);
  s = S.schedule(s, "confident", T0);
  assert.equal(s.due - T0, 8 * H);
  s = S.schedule(s, "confident", T0);
  assert.equal(s.due - T0, 24 * H);
  assert.equal(s.solid, true);
  s = S.schedule(s, "confident", T0);
  assert.equal(s.due - T0, 24 * H, "capped at one day for exam week");
});

test("missed is due immediately and resets the ladder", () => {
  let s = S.schedule(null, "confident", T0);
  s = S.schedule(s, "confident", T0);
  s = S.schedule(s, "missed", T0 + 5);
  assert.equal(s.due, T0 + 5);
  assert.equal(s.step, 0);
  assert.equal(s.lapses, 1);
  s = S.schedule(s, "confident", T0);
  assert.equal(s.due - T0, 4 * H, "back to the first rung");
});

test("shaky comes back in an hour and steps one rung down", () => {
  let s = S.schedule(null, "confident", T0);       // step 1 (next: 8h)
  s = S.schedule(s, "confident", T0);              // step 2 (next: 24h)
  s = S.schedule(s, "shaky", T0);
  assert.equal(s.due - T0, 1 * H);
  assert.equal(s.step, 1);
  s = S.schedule(s, "confident", T0);
  assert.equal(s.due - T0, 8 * H);
  s = S.schedule(null, "shaky", T0);
  assert.equal(s.step, 0, "never below the bottom rung");
});

test("a confident card is seen about three times a day at most", () => {
  // From a fresh card, answering confidently every time it comes due:
  let s = null, t = T0, looks = 0;
  while (t < T0 + 24 * H) {
    s = S.schedule(s, "confident", t);
    looks++;
    t = s.due;
  }
  assert.equal(looks, 3);   // 9:00, 13:00, 21:00, then tomorrow
});

test("unknown ratings throw", () => {
  assert.throws(() => S.schedule(null, "good", T0));
});

test("queue: due cards first, tested before untested, then most overdue", () => {
  const progress = { cards: {
    c2: { step: 0, due: T0 - 1 * H, first: T0 - 48 * H },
    c4: { step: 0, due: T0 - 3 * H, first: T0 - 48 * H },   // starred, overdue
    c5: { step: 0, due: T0 - 9 * H, first: T0 - 48 * H },
    c6: { step: 1, due: T0 + 2 * H, first: T0 - 48 * H },   // not due yet
  } };
  const q = S.buildQueue(deck, progress, T0, null, Infinity);
  assert.deepEqual([...q.due.map((c) => c.id)], ["c4", "c5", "c2"]);
  assert.ok(!q.due.some((c) => c.id === "c6"));
  assert.ok(!q.fresh.some((c) => progress.cards[c.id]));
});

test("queue: new cards respect the limit, in course order with tested first per week", () => {
  const q = S.buildQueue(deck, { cards: {} }, T0, null, 5);
  assert.equal(q.fresh.length, 5);
  assert.equal(q.freshLeft, 35);
  assert.deepEqual([...q.fresh.map((c) => c.id)], ["c1", "c4", "c7", "c10", "c2"]);
});

test("daily new allowance counts cards first seen today", () => {
  const progress = { cards: {} };
  for (let k = 1; k <= 10; k++) progress.cards["c" + k] = S.schedule(null, "confident", T0);
  assert.equal(S.newToday(progress, T0 + 1 * H), 10);
  const st = S.summary(deck, progress, T0 + 1 * H);
  assert.equal(st.newLeft, S.NEW_PER_DAY - 10);
  assert.equal(st.unseen, 30);
  // Tomorrow the allowance is full again.
  const tomorrow = S.summary(deck, progress, T0 + 26 * H);
  assert.equal(tomorrow.newLeft, S.NEW_PER_DAY);
  assert.equal(tomorrow.due, 10);
});

test("summary names the card a review would open on", () => {
  const progress = { cards: { c9: { step: 0, due: T0 - H, first: T0 - 30 * H } } };
  const st = S.summary(deck, progress, T0);
  assert.equal(st.nextCard.id, "c9");
  assert.equal(st.due, 1);
});
