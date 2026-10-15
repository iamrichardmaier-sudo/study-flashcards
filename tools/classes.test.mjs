// node --test tools/classes.test.mjs
//
// The other class pages (classes/*.js): every deck and question set is well
// formed, the statistics and micro maths behind the tools match textbook
// values, the numeric practice answers agree with that maths, and the site
// build wires the class switcher into ECON 381 only where it should.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");

/** Runs a course file against a stub Study and returns what it registered. */
function load(id) {
  let cfg = null;
  const Study = { h() {}, esc: String, fmt: String, course: (c) => { cfg = c; } };
  vm.runInNewContext(read(`classes/${id}.js`), { window: { Study }, Math, JSON, Date });
  assert.ok(cfg, `${id} didn't call Study.course`);
  return cfg;
}
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} expected ${b} ± ${tol}, got ${a}`);

const IDS = ["econ210", "econ378", "econ380", "ihum242"];
const C = Object.fromEntries(IDS.map((id) => [id, load(id)]));

for (const id of IDS) {
  test(`${id}: deck, questions and tools are well formed`, () => {
    const c = C[id];
    assert.equal(c.id, id);
    for (const f of ["code", "title", "blurb", "color"]) assert.ok(c[f], `missing ${f}`);
    const groups = new Set(c.groups.map((g) => g.id));
    const seen = new Set();
    assert.ok(c.cards.length >= 20, "at least 20 cards");
    for (const k of c.cards) {
      assert.ok(k.id && k.term && k.def, `card ${k.id} incomplete`);
      assert.ok(!seen.has(k.id), `duplicate card ${k.id}`); seen.add(k.id);
      assert.ok(groups.has(k.group), `card ${k.id} has unknown group ${k.group}`);
    }
    const qs = new Set();
    assert.ok(c.practice.length >= 10, "at least 10 questions");
    for (const q of c.practice) {
      assert.ok(!qs.has(q.id), `duplicate question ${q.id}`); qs.add(q.id);
      assert.ok(groups.has(q.group), `question ${q.id} has unknown group`);
      assert.equal(q.options.filter((o) => o.right).length, 1, `question ${q.id} needs exactly one right option`);
      for (const o of q.options) assert.ok(o.t && o.why, `question ${q.id}: every option needs text and a why`);
      assert.equal(new Set(q.options.map((o) => o.t)).size, q.options.length, `question ${q.id} repeats an option`);
    }
    assert.ok(c.tools.length >= 3, "at least 3 tools");
    for (const t of c.tools) assert.ok(t.id && t.name && t.blurb && typeof t.mount === "function", `tool ${t.id} incomplete`);
    // Card and question HTML goes into innerHTML, so tags must balance.
    const text = JSON.stringify([c.cards, c.practice]);
    for (const tag of ["b", "i", "sub", "sup"]) {
      const open = (text.match(new RegExp(`<${tag}>`, "g")) || []).length;
      const close = (text.match(new RegExp(`</${tag}>`, "g")) || []).length;
      assert.equal(open, close, `unbalanced <${tag}>`);
    }
  });
}

test("econ378: distributions match standard tables", () => {
  const { Stat } = C.econ378.math;
  near(Stat.normCdf(1.96), 0.975, 1e-4, "Φ(1.96)");
  near(Stat.normCdf(-1), 0.158655, 1e-5, "Φ(−1)");
  near(Stat.normCdf(130, 100, 15), 0.97725, 1e-4, "P(X ≤ 130)");
  near(Stat.zCrit(0.975), 1.95996, 1e-4, "z*.975");
  near(Stat.tCrit(0.975, 9), 2.2622, 1e-3, "t*.975,9");
  near(Stat.tCrit(0.975, 30), 2.0423, 1e-3, "t*.975,30");
  near(Stat.tCrit(0.95, 1), 6.3138, 1e-3, "t*.95,1");
  near(Stat.chiCdf(3.841, 1), 0.95, 1e-3, "χ²(1) at 3.841");
  near(Stat.chiCdf(11.070, 5), 0.95, 1e-3, "χ²(5) at 11.07");
  near(Stat.fCdf(3.10, 3, 20), 0.95, 2e-3, "F(3,20) at 3.10");
  near(Stat.binomPmf(2, 5, 0.5), 0.3125, 1e-9, "Bin(5,.5) at 2");
  near(Stat.poisPmf(0, 2), Math.exp(-2), 1e-12, "Pois(2) at 0");
  // pdfs integrate to 1 (crude trapezoid)
  const integ = (f, a, b, n = 20000) => { let s = 0, d = (b - a) / n; for (let i = 0; i < n; i++) s += (f(a + i * d) + f(a + (i + 1) * d)) * d / 2; return s; };
  near(integ((x) => Stat.tPdf(x, 5), -200, 200), 1, 2e-3, "t pdf");
  near(integ((x) => Stat.chiPdf(x, 4), 0, 100), 1, 1e-3, "χ² pdf");
  near(integ((x) => Stat.fPdf(x, 5, 20), 1e-9, 60), 1, 2e-3, "F pdf");
});

test("econ378: the hypothesis-test solver", () => {
  const { runTest } = C.econ378.math;
  const r = runTest("t1", { xbar: 52.1, s: 8, n: 20, mu0: 50 }, "ne", 0.05);
  near(r.stat, 2.1 / (8 / Math.sqrt(20)), 1e-9, "t");
  assert.equal(r.df, 19);
  near(r.p, 0.2548, 2e-3, "two-sided p");
  assert.equal(r.reject, false);
  const z = runTest("z1", { xbar: 103, sigma: 15, n: 100, mu0: 100 }, "gt", 0.05);
  near(z.stat, 2, 1e-9, "z"); near(z.p, 0.02275, 1e-4, "p"); assert.equal(z.reject, true);
  const p = runTest("p1", { x: 58, n: 100, p0: 0.5 }, "ne", 0.05);
  near(p.stat, 1.6, 1e-9, "z for p̂ = .58"); near(p.p, 0.1096, 1e-3, "p");
  const w = runTest("t2", { x1: 10, s1: 2, n1: 10, x2: 8, s2: 2, n2: 10 }, "ne", 0.05);
  near(w.df, 18, 1e-9, "Welch df with equal s and n");
});

test("econ378: numeric practice answers", () => {
  const { Stat } = C.econ378.math;
  near(1 - Stat.normCdf(2), 0.0228, 1e-4, "q1");
  near(1.96 * 12 / 6, 3.92, 1e-9, "q2");
  near(0.9 * 0.01 / (0.9 * 0.01 + 0.05 * 0.99), 0.154, 1e-3, "q7");
});

test("econ380: consumer decomposition", () => {
  const { Micro } = C.econ380.math;
  const r = Micro.consumer(0.5, 100, 2, 2, 4, "hicks");
  near(r.A.x, 25, 1e-9); near(r.C.x, 12.5, 1e-9);
  near(r.B.U, r.A.U, 1e-9, "Hicks keeps utility");
  near(r.B.x, 25 / Math.SQRT2, 1e-9, "Hicks x");
  near(r.sub + r.inc, r.total, 1e-9, "effects add up");
  assert.ok(r.sub < 0 && r.inc < 0, "both effects negative for a normal good");
  const s = Micro.consumer(0.5, 100, 2, 2, 4, "slutsky");
  near(s.B.I, 150, 1e-9, "Slutsky income buys A"); near(s.B.x, 18.75, 1e-9);
});

test("econ380: market policies", () => {
  const { Micro } = C.econ380.math;
  const t = Micro.market(100, 2, 10, 1, "tax", 6);
  near(t.Qe, 30, 1e-9); near(t.Pe, 40, 1e-9);
  near(t.Q, 28, 1e-9); near(t.Pb, 44, 1e-9); near(t.Ps, 38, 1e-9);
  near(t.gov, 168, 1e-9); near(t.DWL, 6, 1e-9);
  near(t.buyerShare, 2 / 3, 1e-9);
  near(Micro.market(100, 2, 10, 1, "subsidy", 6).DWL, 6, 1e-9, "subsidy DWL");
  near(Micro.market(100, 2, 10, 1, "ceiling", 30).DWL, 150, 1e-9, "ceiling DWL");
  near(Micro.market(100, 2, 10, 1, "floor", 50).DWL, 37.5, 1e-9, "floor DWL");
  assert.equal(Micro.market(100, 2, 10, 1, "ceiling", 45).binding, false);
  near(Micro.market(100, 2, 10, 1, "none", 0).DWL, 0, 1e-9);
});

test("econ380: monopoly, games, Cournot", () => {
  const { Micro } = C.econ380.math;
  const m = Micro.monopoly(100, 2, 20);
  near(m.Qm, 20, 1e-9); near(m.Pm, 60, 1e-9); near(m.DWL, 400, 1e-9);
  near(m.lerner, 1 / Math.abs(m.elas), 1e-9, "Lerner = 1/|ε|");
  const pd = Micro.nash([[3, 0], [5, 1]], [[3, 5], [0, 1]]);
  // (JSON: arrays made inside the vm sandbox have another realm's prototype.)
  const pure = (r) => JSON.stringify(r.pure);
  assert.equal(pure(pd), "[[1,1]]"); assert.equal(pd.rowDom, 1); assert.equal(pd.colDom, 1);
  const mp = Micro.nash([[1, -1], [-1, 1]], [[-1, 1], [1, -1]]);
  assert.equal(pure(mp), "[]"); near(mp.mixed.p, 0.5, 1e-9); near(mp.mixed.q, 0.5, 1e-9);
  const bos = Micro.nash([[2, 0], [0, 1]], [[1, 0], [0, 2]]);
  assert.equal(pure(bos), "[[0,0],[1,1]]"); near(bos.mixed.p, 2 / 3, 1e-9); near(bos.mixed.q, 1 / 3, 1e-9);
  const c = Micro.cournot(120, 1, 0, 0);
  near(c.q1, 40, 1e-9); near(c.q2, 40, 1e-9); near(c.P, 40, 1e-9);
});

test("econ210: résumé bullet checker", () => {
  const { bulletCheck } = C.econ210.check;
  assert.equal(bulletCheck("Analyzed 18 months of attendance data in Excel, cutting event costs 22%").score, 5);
  assert.ok(bulletCheck("Responsible for managing the club budget").score <= 2);
});

test("ihum242: map, timeline and figures data", () => {
  const { PLACES, EVENTS, FIGURES, DYN, km } = C.ihum242.data;
  for (const set of Object.values(PLACES)) for (const p of set) {
    assert.ok(p[1] >= -10 && p[1] <= 80 && p[2] >= 8 && p[2] <= 48, `${p[0]} is off the map`);
    assert.ok(p[3], `${p[0]} needs a note`);
  }
  near(km([39.83, 21.42], [39.61, 24.47]), 340, 15, "Mecca–Medina");
  for (let i = 1; i < EVENTS.length; i++) assert.ok(EVENTS[i][0] >= EVENTS[i - 1][0], `events out of order at ${EVENTS[i][2]}`);
  assert.equal(new Set(FIGURES.map((f) => f[0])).size, FIGURES.length, "duplicate figure");
  assert.equal(new Set(FIGURES.map((f) => f[2])).size, FIGURES.length, "duplicate work");
  for (const d of DYN) assert.ok(d[1] < d[2], `${d[0]} dates`);
});

// ------------------------------------------------- smoke test in a fake DOM
//
// No browser here, so a tiny stand-in DOM: enough for study.js, nav.js and
// the tools to render, after which every button is clicked and every input
// and select fires. Catches runtime errors in code the unit tests don't
// reach. (tools/preview-classes.mjs does the real-browser version.)

function fakeDom(page) {
  const listeners = new Map();          // target -> {type: [fn]}
  const on = (t, type, fn) => {
    if (!listeners.has(t)) listeners.set(t, {});
    (listeners.get(t)[type] ||= []).push(fn);
  };
  const fire = (t, type, extra = {}) => {
    const ev = { type, target: t, key: "", preventDefault() {}, stopPropagation() {}, ...extra };
    for (const fn of (listeners.get(t) || {})[type] || []) fn(ev);
  };
  class El {
    constructor(tag) {
      this.tagName = tag.toUpperCase(); this.children = []; this.attrs = {}; this.parent = null;
      this.style = { setProperty() {} }; this.value = ""; this.checked = false; this.disabled = false; this._text = "";
      const cls = new Set();
      this.classList = { add: (c) => cls.add(c), remove: (c) => cls.delete(c), contains: (c) => cls.has(c) };
    }
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === "disabled") this.disabled = true; }
    getAttribute(k) { return this.attrs[k] ?? null; }
    get id() { return this.attrs.id; } set id(v) { this.attrs.id = v; }
    get className() { return this.attrs.class || ""; } set className(v) { this.attrs.class = v; }
    get hidden() { return "hidden" in this.attrs; } set hidden(v) { if (v) this.attrs.hidden = ""; else delete this.attrs.hidden; }
    appendChild(c) { c.parent = this; this.children.push(c); return c; }
    insertBefore(c) { return this.appendChild(c); }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter((x) => x !== this); }
    get firstChild() { return this.children[0] || null; }
    get lastChild() { return this.children[this.children.length - 1] || null; }
    set innerHTML(v) { this.children = []; this._text = String(v); }
    get innerHTML() { return this._text; }
    set textContent(v) { this.children = []; this._text = String(v); }
    get textContent() { return this._text + this.children.map((c) => c.textContent).join(""); }
    get selectedOptions() { return [{ textContent: "option" }]; }
    addEventListener(type, fn) { on(this, type, fn); }
    click() { if (!this.disabled) fire(this, "click"); }
    focus() {} blur() {}
    contains(x) { for (let n = x; n; n = n.parent) if (n === this) return true; return false; }
    getBoundingClientRect() { return { left: 0, top: 0, right: 100, bottom: 30, width: 100, height: 30 }; }
    get offsetWidth() { return 100; } get offsetHeight() { return 100; }
    querySelectorAll(sel) {
      const attr = sel.match(/^\[([\w-]+)\]$/), out = [];
      const walk = (n) => { for (const c of n.children) { if (attr ? attr[1] in c.attrs : false) out.push(c); walk(c); } };
      walk(this);
      return out;
    }
    querySelector(sel) { return this.querySelectorAll(sel)[0] || (attrSel(sel) ? null : new El("svg")); }
  }
  const attrSel = (s) => /^\[[\w-]+\]$/.test(s);
  class Text { constructor(t) { this.children = []; this.attrs = {}; this.text = t; } get textContent() { return this.text; } }
  const body = new El("body"), head = new El("head");
  const app = body.appendChild(new El("div")); app.id = "app";
  const document = {
    body, head, readyState: "complete", documentElement: new El("html"), title: "",
    currentScript: { src: "file:///site/classes/nav.js" },
    createElement: (t) => new El(t), createTextNode: (t) => new Text(t),
    getElementById: (id) => { let hit = null; const w = (n) => { for (const c of n.children) { if (c.attrs.id === id) hit ||= c; w(c); } }; w(body); return hit; },
    querySelector: (s) => body.querySelector(s), querySelectorAll: (s) => body.querySelectorAll(s),
    addEventListener: (type, fn) => on(document, type, fn),
  };
  let hash = "";
  const window = { addEventListener: (type, fn) => on(window, type, fn), scrollTo() {}, innerWidth: 1280, innerHeight: 860 };
  const location = {
    pathname: "/site/" + page, href: "file:///site/" + page,
    get hash() { return hash ? "#" + hash : ""; },
    set hash(v) { hash = String(v).replace(/^#/, ""); fire(window, "hashchange"); },
  };
  const store = {};
  const localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } };
  const ctx = vm.createContext({
    window, document, location, localStorage, URL, Math, JSON, Date, Number, String, Object, Array, Set, Map, isFinite, parseInt,
    setTimeout: () => 0, confirm: () => true, Blob: class {}, Event: class { constructor(t) { this.type = t; } },
  });
  ctx.window.document = document;
  URL.createObjectURL ||= () => "blob:x";
  /** Every element under root (depth first). */
  const all = (root = body) => { const out = []; const w = (n) => { for (const c of n.children) { out.push(c); w(c); } }; w(root); return out; };
  return { ctx, window, document, fire, all, setHash: (v) => { location.hash = v; } };
}

for (const id of IDS) {
  test(`${id}: every view and tool renders and survives every click`, () => {
    const d = fakeDom(`${id}.html`);
    for (const f of ["classes/nav.js", "classes/study.js", `classes/${id}.js`]) vm.runInContext(read(f), d.ctx, { filename: f });
    d.fire(d.document, "DOMContentLoaded");
    assert.ok(d.all().some((e) => e.className.includes("cn-btn")), "switcher mounted");
    const poke = () => {
      for (const e of d.all()) {
        if (e.tagName === "INPUT" || e.tagName === "TEXTAREA") { if (e.attrs.type === "number") e.value = "3"; d.fire(e, "input"); d.fire(e, "change"); }
        if (e.tagName === "SELECT") d.fire(e, "change");
      }
      for (const e of d.all()) if (e.tagName === "BUTTON" && e.parent) e.click();
    };
    const views = ["flashcards", "practice", "tools", ...C[id].tools.map((t) => "tools/" + t.id)];
    for (const v of views) {
      d.setHash(v);
      for (let round = 0; round < 3; round++) poke();
      // the keyboard paths of sessions and quizzes
      d.setHash(v === "flashcards" ? "practice" : "flashcards");
      d.setHash(v);
      for (const key of ["Enter", " ", "ArrowRight", " ", "ArrowLeft", " ", "ArrowUp", "a", "Enter", "1", "Escape"]) d.fire(d.document, "keydown", { key });
    }
  });
}

test("site build: class pages and the switcher", () => {
  const site = read("site/index.html"), artifact = read("web/econ381.html"), rootIndex = read("index.html");
  assert.equal(site.split('<script src="classes/nav.js"></script>').length - 1, 1, "site/index.html loads nav.js once");
  assert.equal(site, rootIndex, "root index.html matches site/index.html");
  assert.ok(!artifact.includes("classes/nav.js"), "the Artifact build stays self-contained");
  assert.ok(!read("scriptable/econ381-review.js").includes("classes/nav.js"), "the Scriptable build stays self-contained");
  for (const f of ["classes.html", "econ210.html", "econ378.html", "econ380.html", "ihum242.html",
    "classes/nav.js", "classes/study.js", "classes/study.css", ...IDS.map((id) => `classes/${id}.js`)]) {
    assert.ok(existsSync(new URL("site/" + f, root)), `site/${f} missing`);
    assert.equal(read("site/" + f), read(f), `site/${f} is stale`);
  }
  for (const id of IDS) assert.ok(read(`${id}.html`).includes(`src="classes/${id}.js"`), `${id}.html loads its course`);
  assert.ok(!existsSync(new URL("arab201.html", root)), "no ARAB 201 page");
});
