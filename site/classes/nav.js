// The class switcher shared by every page of the site.
//
//   <script src="classes/nav.js"></script>
//
// One list of classes (window.ClassNav.classes, also used by classes.html).
// On a class page it fills each element marked data-class-nav; on the ECON 381
// app it turns the "ECON 381" brand in the tab bar into the switcher, and on a
// phone (where that bar sits at the bottom) adds a slim strip at the top.
// Links resolve against this script's own folder, so the site works from the
// repo root and from site/ alike. Brings its own styles.
(function () {
  "use strict";
  var CLASSES = [
    { id: "econ210", code: "ECON 210", name: "Career Prep", href: "econ210.html", color: "#2E7D52",
      blurb: "LinkedIn, networking, STAR stories, résumé bullets." },
    { id: "econ378", code: "ECON 378", name: "Statistics for Economists", href: "econ378.html", color: "#6D4BB0",
      blurb: "Distributions, the CLT, confidence intervals, hypothesis tests." },
    { id: "econ380", code: "ECON 380", name: "Intermediate Micro Theory", href: "econ380.html", color: "#B4561B",
      blurb: "Consumer choice, markets and taxes, monopoly, games." },
    { id: "econ381", code: "ECON 381", name: "Intermediate Macro · Midterm 1", href: "./", color: "#1F4E8C",
      blurb: "126 flashcards, the practice midterm, model dashboards." },
    { id: "ihum242", code: "IHUM 242", name: "Islamic Humanities", href: "ihum242.html", color: "#0F766E",
      blurb: "Map game, timeline, key figures and their works." },
  ];

  var script = document.currentScript;
  var base = new URL("..", script ? script.src : location.href);
  var url = function (c) { return new URL(c.href, base).href; };
  var file = location.pathname.split("/").pop() || "index.html";
  var current = null;
  CLASSES.forEach(function (c) {
    var f = c.href === "./" ? "index.html" : c.href;
    if (f === file) current = c;
  });

  var css =
    ".cn-btn{display:inline-flex;align-items:center;gap:8px;border:0;background:transparent;font:inherit;color:inherit;cursor:pointer;" +
    "padding:4px 8px;margin:-4px -8px;border-radius:10px;letter-spacing:inherit;font-weight:inherit;font-size:inherit}" +
    ".cn-btn:hover{background:rgba(43,33,24,.06)}.cn-btn .cn-chev{width:14px;height:14px;opacity:.7;transition:transform .15s}" +
    ".cn-btn[aria-expanded=true] .cn-chev{transform:rotate(180deg)}" +
    ".cn-menu{position:fixed;z-index:1000;min-width:270px;max-width:calc(100vw - 16px);background:#FFFDF9;border:1px solid rgba(43,33,24,.14);" +
    "border-radius:16px;box-shadow:0 18px 40px -16px rgba(43,33,24,.35);padding:6px;font-family:Inter,-apple-system,system-ui,sans-serif;color:#2B2118}" +
    ".cn-menu[hidden]{display:none}" +
    ".cn-menu a{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:11px;color:inherit;text-decoration:none}" +
    ".cn-menu a:hover,.cn-menu a:focus-visible{background:rgba(43,33,24,.06);outline:none}" +
    ".cn-menu a[aria-current=page]{background:rgba(43,33,24,.07)}" +
    ".cn-dot{width:10px;height:10px;border-radius:50%;flex:none}" +
    ".cn-menu b{display:block;font-size:13.5px;font-weight:700;letter-spacing:.02em}" +
    ".cn-menu small{display:block;font-size:12px;color:#85796E;margin-top:1px}" +
    ".cn-menu hr{border:0;border-top:1px solid rgba(43,33,24,.1);margin:5px 4px}" +
    ".cn-strip{display:none}" +
    "@media (max-width:760px){.cn-strip{display:flex;align-items:center;justify-content:space-between;max-width:720px;margin:0 auto;" +
    "padding:10px 20px 0;font-size:13px;font-weight:700;letter-spacing:.04em;color:#1F4E8C}" +
    ".cn-strip a{color:#85796E;text-decoration:none;font-weight:600;letter-spacing:0}}";

  var CHEV = '<svg class="cn-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  var menu, opener;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; });
  }

  function buildMenu() {
    menu = document.createElement("div");
    menu.className = "cn-menu";
    menu.id = "cn-menu";
    menu.hidden = true;
    menu.setAttribute("role", "menu");
    var html = '<a role="menuitem" href="' + esc(new URL("classes.html", base).href) + '"' + (file === "classes.html" ? ' aria-current="page"' : "") +
      '><span class="cn-dot" style="background:#85796E"></span><span><b>All classes</b><small>Pick a class</small></span></a><hr>';
    CLASSES.forEach(function (c) {
      html += '<a role="menuitem" href="' + esc(url(c)) + '"' + (c === current ? ' aria-current="page"' : "") +
        '><span class="cn-dot" style="background:' + c.color + '"></span><span><b>' + esc(c.code) + "</b><small>" + esc(c.name) + "</small></span></a>";
    });
    menu.innerHTML = html;
    document.body.appendChild(menu);
    document.addEventListener("click", function (e) {
      if (!menu.hidden && !menu.contains(e.target) && !(opener && opener.contains(e.target))) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) { e.stopPropagation(); close(); if (opener) opener.focus(); }
    }, true);
    window.addEventListener("resize", close);
  }

  function open(btn) {
    if (!menu) buildMenu();
    opener = btn;
    menu.hidden = false;
    var r = btn.getBoundingClientRect(), w = menu.offsetWidth, h = menu.offsetHeight;
    var left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
    var top = r.bottom + 6;
    if (top + h > window.innerHeight - 8 && r.top - h - 6 > 8) top = r.top - h - 6;
    menu.style.left = left + "px";
    menu.style.top = top + "px";
    btn.setAttribute("aria-expanded", "true");
    var here = menu.querySelector("[aria-current]") || menu.querySelector("a");
    if (here) here.focus();
  }
  function close() {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    if (opener) opener.setAttribute("aria-expanded", "false");
  }

  function makeButton(inner) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "cn-btn";
    b.setAttribute("aria-haspopup", "menu");
    b.setAttribute("aria-expanded", "false");
    b.title = "Switch class";
    b.innerHTML = inner + CHEV;
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      if (menu && !menu.hidden && opener === b) close(); else open(b);
    });
    return b;
  }

  /** Puts a switcher in every empty data-class-nav slot under root (pages
      that re-render call this again). Returns how many slots there were. */
  function fill(root) {
    var slots = (root || document).querySelectorAll("[data-class-nav]");
    slots.forEach(function (s) {
      if (!s.querySelector(".cn-btn")) s.appendChild(makeButton(esc(current ? current.code : "All classes")));
    });
    return slots.length;
  }

  function mount() {
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    if (fill(document)) return;
    // The ECON 381 app: the brand becomes the switcher...
    var brand = document.querySelector(".tabs .brand");
    if (brand) {
      var b = makeButton(brand.innerHTML);
      brand.innerHTML = "";
      brand.appendChild(b);
    }
    // ...and on a phone, where the tab bar is at the bottom, a strip on top.
    var views = document.querySelector(".views");
    if (views) {
      var strip = document.createElement("div");
      strip.className = "cn-strip";
      var all = document.createElement("a");
      all.href = new URL("classes.html", base).href;
      all.textContent = "All classes";
      strip.appendChild(makeButton(esc(current ? current.code : "ECON 381")));
      strip.appendChild(all);
      views.insertBefore(strip, views.firstChild);
    }
  }

  window.ClassNav = { classes: CLASSES, base: base.href, url: url, current: current, fill: fill };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
