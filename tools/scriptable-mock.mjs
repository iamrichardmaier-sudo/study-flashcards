// A small stand-in for the parts of Scriptable's API the script uses, so the
// generated script can be run under Node: the widget path, the start menu,
// the review WebView and the progress file. Argument types are checked the
// way Scriptable checks them, so a wrong call fails here rather than on the
// phone.

import { readFileSync } from "node:fs";

export function makeEnv({ runsInWidget = false, widgetFamily = "small", alerts = [], onPresent, files = {} } = {}) {
  const log = { alerts: [], widget: null, completed: false, html: null };
  const fs = new Map(Object.entries(files));

  const need = (cond, msg) => { if (!cond) throw new TypeError(msg); };

  function fileManager(root) {
    return {
      documentsDirectory: () => root,
      joinPath: (a, b) => { need(typeof a === "string" && typeof b === "string", "joinPath needs strings"); return a + "/" + b; },
      fileExists: (p) => fs.has(p),
      readString: (p) => { need(fs.has(p), "no file " + p); return fs.get(p); },
      writeString: (p, s) => { need(typeof s === "string", "writeString needs a string"); fs.set(p, s); },
      isFileStoredIniCloud: () => root === "/icloud",
      isFileDownloaded: () => true,
      downloadFileFromiCloud: async () => {},
    };
  }

  class Color { constructor(hex, alpha) { need(typeof hex === "string" && /^#[0-9a-f]{6}$/i.test(hex), "bad colour " + hex); this.hex = hex; this.alpha = alpha; } }
  class Font {
    constructor(name, size) { need(typeof name === "string" && typeof size === "number", "Font(name, size)"); this.name = name; this.size = size; }
    static boldSystemFont(n) { return new Font("bold", n); }
    static semiboldSystemFont(n) { return new Font("semibold", n); }
    static systemFont(n) { return new Font("system", n); }
  }
  class Size { constructor(w, h) { need(typeof w === "number" && typeof h === "number", "Size(w, h)"); this.width = w; this.height = h; } }

  class Stack {
    constructor() { this.items = []; }
    addText(s) { need(typeof s === "string", "addText needs a string, got " + typeof s); const t = { text: s, centerAlignText() {} }; this.items.push(t); return t; }
    addStack() { const s = new Stack(); this.items.push(s); return s; }
    addSpacer(n) { need(n === undefined || typeof n === "number", "addSpacer(number?)"); this.items.push({ spacer: n }); }
    centerAlignContent() {}
    setPadding(...a) { need(a.length === 4 && a.every((x) => typeof x === "number"), "setPadding(4 numbers)"); }
  }
  class ListWidget extends Stack {}

  class Alert {
    constructor() { this.actions = []; this.title = ""; this.message = ""; }
    addAction(s) { this.actions.push(s); }
    addDestructiveAction(s) { this.actions.push(s); }
    addCancelAction(s) { this.cancel = s; }
    async presentAlert() {
      const pick = alerts.shift();
      const entry = { title: this.title, message: this.message, actions: this.actions.slice() };
      log.alerts.push(entry);
      if (pick === undefined) return this.cancel ? -1 : 0;
      if (typeof pick === "function") return pick(entry);
      if (typeof pick === "string") {
        const k = this.actions.findIndex((a) => a.startsWith(pick));
        if (k === -1) throw new Error(`no action starting "${pick}" in ${JSON.stringify(this.actions)}`);
        return k;
      }
      return pick;
    }
  }

  class WebView {
    async loadHTML(html) { need(typeof html === "string", "loadHTML needs a string"); log.html = html; this.html = html; }
    async present(full) { this.results = onPresent ? await onPresent(this) : []; }
    async evaluateJavaScript(js) {
      need(js === "JSON.stringify(results)", "unexpected evaluate: " + js);
      return JSON.stringify(this.results || []);
    }
  }

  const globals = {
    config: { runsInWidget, widgetFamily },
    Script: {
      name: () => "ECON 381",
      setWidget: (w) => { log.widget = w; },
      complete: () => { log.completed = true; },
    },
    FileManager: { iCloud: () => fileManager("/icloud"), local: () => fileManager("/local") },
    Alert, WebView, ListWidget, Color, Font, Size,
    Safari: { open() {} },
  };
  return { globals, log, fs };
}

export async function runScript(path, opts) {
  const env = makeEnv(opts);
  const src = readFileSync(path, "utf8");
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const names = Object.keys(env.globals);
  await new AsyncFunction(...names, src)(...names.map((n) => env.globals[n]));
  return env;
}
