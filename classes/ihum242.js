// IHUM 242 · Islamic Humanities. Cards, practice questions (concepts in
// context and architecture by description) and three tools from
// research/ihum242-features.md: map game, timeline explorer with an
// ordering quiz, and a key-figures matcher.
(function () {
  "use strict";
  var S = window.Study, h = S.h;

  // Cards and practice questions live in courses/ihum242/ (cards.mjs, practice.mjs).

  // ------------------------------------------------------------ tools

  // 1. Map game. A schematic equirectangular map: lon −10…80, lat 8…48.
  var LON = [-10, 80], LAT = [8, 48];
  var WATER = [
    // Mediterranean
    [[-5.6, 36.0], [-4.4, 36.7], [-2.5, 36.8], [-1, 37.6], [-0.4, 39.5], [0.8, 40.8], [2.2, 41.4], [3.2, 42.2], [3.0, 42.9], [4.5, 43.4],
      [5.4, 43.3], [7.3, 43.7], [8.9, 44.4], [9.8, 44.1], [10.3, 43.5], [11.1, 42.4], [12.2, 41.8], [13.6, 41.2], [14.3, 40.8], [15.6, 40.0],
      [15.6, 38.0], [16.5, 38.5], [17.2, 39.9], [18.5, 40.1], [16.9, 41.1], [15.9, 41.9], [13.5, 43.6], [12.3, 45.4], [13.8, 45.6], [14.6, 45.0],
      [15.2, 44.2], [16.4, 43.5], [18.1, 42.6], [19.4, 41.4], [19.5, 40.4], [20.2, 39.5], [21.1, 38.3], [21.7, 36.8], [22.5, 36.4], [23.2, 36.4],
      [23.7, 37.9], [24.0, 38.2], [22.9, 40.6], [24.5, 40.9], [26.4, 40.9], [26.2, 40.0], [27.1, 38.4], [27.4, 37.0], [28.3, 36.7], [30.7, 36.9],
      [32.5, 36.1], [34.6, 36.8], [36.2, 36.6], [35.8, 35.5], [35.5, 33.9], [35.0, 32.8], [34.4, 31.5], [32.3, 31.3], [29.9, 31.2], [27.2, 31.4],
      [25.1, 31.6], [24.0, 32.1], [21.5, 32.9], [20.1, 32.1], [19.0, 30.3], [17.0, 31.0], [15.1, 32.4], [13.2, 32.9], [11.1, 33.2], [10.1, 33.9],
      [10.8, 34.7], [11.1, 35.6], [10.5, 36.5], [11.0, 37.1], [9.9, 37.3], [7.8, 36.9], [5.1, 36.8], [3.1, 36.8], [1.0, 36.5], [-0.6, 35.7],
      [-2.2, 35.1], [-2.9, 35.3], [-4.4, 35.2], [-5.3, 35.9]],
    // Black Sea
    [[29.0, 41.2], [28.0, 41.6], [28.0, 42.5], [27.9, 43.2], [28.7, 44.2], [29.7, 45.2], [30.7, 46.5], [31.8, 46.6], [32.5, 45.4], [33.6, 44.5],
      [35.2, 44.8], [36.5, 45.3], [37.8, 44.7], [39.7, 43.6], [41.6, 41.6], [39.7, 41.0], [37.6, 41.1], [36.3, 41.3], [35.1, 42.0], [33.3, 42.0],
      [31.4, 41.3]],
    // Caspian
    [[48.0, 46.6], [50.0, 46.9], [53.0, 46.6], [51.5, 45.0], [51.3, 44.5], [52.8, 42.5], [53.0, 40.0], [53.9, 37.3], [54.0, 36.9], [51.0, 36.7],
      [49.5, 37.5], [48.9, 38.8], [49.9, 40.4], [48.3, 42.1], [47.5, 43.0], [47.0, 44.5], [47.5, 45.6]],
    // Red Sea, Gulf of Aden, Arabian Sea, Persian Gulf
    [[32.5, 29.9], [32.6, 29.0], [33.8, 27.2], [35.6, 23.9], [36.9, 21.9], [37.2, 19.6], [38.5, 17.9], [39.5, 15.6], [41.2, 14.5], [42.7, 13.0],
      [43.3, 12.4], [43.1, 11.6], [45.0, 10.4], [48.0, 11.2], [51.3, 11.8], [51.0, 10.4], [49.8, 8.0], [77.3, 8.0], [76.2, 10.0], [74.8, 12.9],
      [73.8, 15.5], [72.8, 19.0], [72.6, 21.5], [70.0, 21.0], [69.0, 22.4], [68.5, 23.5], [67.0, 24.8], [64.5, 25.2], [62.3, 25.1], [59.5, 25.4],
      [57.8, 25.6], [56.9, 27.1], [56.3, 27.2], [54.5, 26.6], [52.5, 27.5], [50.8, 28.9], [50.1, 30.1], [48.5, 30.0], [48.0, 29.4], [48.8, 27.7],
      [50.1, 26.4], [50.8, 24.8], [51.6, 25.9], [51.6, 24.5], [52.5, 24.2], [54.4, 24.5], [55.3, 25.3], [56.1, 26.1], [56.4, 24.9], [57.5, 23.8],
      [58.6, 23.6], [59.8, 22.5], [58.8, 20.5], [57.8, 19.0], [56.5, 18.0], [54.0, 17.0], [52.2, 15.6], [49.1, 14.5], [45.0, 12.8], [43.5, 12.7],
      [43.2, 13.3], [42.9, 14.8], [42.5, 16.9], [41.0, 19.5], [39.2, 21.5], [38.0, 24.1], [36.5, 25.8], [35.5, 27.8], [35.0, 29.5], [34.5, 28.5],
      [34.3, 27.8], [33.5, 28.6]],
    // Atlantic
    [[-10, 48], [-4.5, 48], [-2.5, 47.3], [-1.2, 46.0], [-1.5, 43.5], [-3.8, 43.5], [-8.0, 43.7], [-9.3, 43.0], [-8.9, 41.1], [-9.2, 38.7],
      [-9.0, 37.0], [-7.4, 37.2], [-6.3, 36.5], [-5.6, 36.0], [-5.8, 35.8], [-6.8, 34.0], [-7.6, 33.6], [-9.3, 32.5], [-9.6, 30.4], [-10, 29.5]],
  ];
  var ISLANDS = [
    [[12.4, 38.1], [15.6, 38.3], [15.1, 36.7], [12.5, 37.6]],                    // Sicily
    [[8.2, 41.0], [9.7, 41.0], [9.6, 39.1], [8.4, 39.0]],                       // Sardinia
    [[8.6, 42.9], [9.5, 42.8], [9.2, 41.4], [8.7, 41.7]],                       // Corsica
    [[23.5, 35.6], [26.3, 35.3], [24.5, 34.9]],                                 // Crete
    [[32.3, 35.0], [34.6, 35.7], [33.9, 34.6], [32.8, 34.6]],                   // Cyprus
  ];
  var RIVERS = [
    [[31.2, 30.1], [31.1, 28.0], [32.9, 24.1], [33.0, 21.0], [32.5, 15.6]],                  // Nile
    [[38.3, 37.0], [39.0, 35.95], [40.1, 35.3], [41.9, 34.4], [43.3, 33.4], [44.4, 32.5], [46.2, 31.0], [47.4, 31.0], [48.5, 30.0]], // Euphrates → Shatt al-Arab
    [[40.2, 37.9], [43.1, 36.3], [43.9, 34.2], [44.4, 33.3], [46.0, 32.5], [47.4, 31.0]],    // Tigris
    [[73.1, 35.0], [71.9, 32.9], [70.4, 29.5], [68.4, 26.0], [67.5, 24.6]],                 // Indus
  ];
  var PLACES = {
    cities: [
      ["Mecca", 39.83, 21.42, "Birthplace of Muhammad; the Ka‘ba; the hajj."],
      ["Medina", 39.61, 24.47, "Destination of the hijra (622); the first Muslim polity."],
      ["Jerusalem", 35.22, 31.78, "Dome of the Rock (691–692) and al-Aqsa."],
      ["Damascus", 36.29, 33.51, "Umayyad capital; the Great Mosque (early 8th c.)."],
      ["Baghdad", 44.37, 33.31, "Abbasid capital, founded 762; House of Wisdom."],
      ["Cairo", 31.24, 30.04, "Founded by the Fatimids (969); al-Azhar; Mamluk capital."],
      ["Córdoba", -4.78, 37.89, "Capital of Umayyad al-Andalus; the Great Mosque."],
      ["Granada", -3.6, 37.18, "Nasrid kingdom and the Alhambra; fell in 1492."],
      ["Istanbul", 28.98, 41.01, "Constantinople, taken by the Ottomans in 1453."],
      ["Isfahan", 51.67, 32.65, "Safavid capital under Shah ‘Abbas I (from 1598)."],
      ["Delhi", 77.21, 28.61, "Delhi Sultanate and Mughal capital."],
      ["Agra", 78.0, 27.18, "Mughal capital; the Taj Mahal."],
      ["Samarkand", 66.96, 39.65, "Timur’s capital; Silk Road city."],
      ["Bukhara", 64.42, 39.77, "Samanid centre of learning; Ibn Sina’s youth."],
      ["Kairouan", 10.1, 35.68, "Early Arab base in North Africa (670); Great Mosque."],
      ["Fez", -5.0, 34.03, "Al-Qarawiyyin, founded 859."],
      ["Basra", 47.8, 30.5, "Early garrison city; grammar and Mu‘tazila."],
      ["Tabriz", 46.29, 38.08, "First Safavid capital (1501)."],
      ["Konya", 32.49, 37.87, "Seljuk of Rum capital; Rumi’s city."],
      ["Aleppo", 37.16, 36.2, "Hamdanid court of Sayf al-Dawla and al-Mutanabbi."],
    ],
    capitals: [
      ["Umayyad caliphate (661–750)", 36.29, 33.51, "Damascus."],
      ["Abbasid caliphate (from 762)", 44.37, 33.31, "Baghdad."],
      ["Umayyads of al-Andalus (756–1031)", -4.78, 37.89, "Córdoba."],
      ["Fatimid caliphate (from 973)", 31.24, 30.04, "Cairo."],
      ["Mamluk sultanate (1250–1517)", 31.24, 30.04, "Cairo."],
      ["Ottoman Empire (from 1453)", 28.98, 41.01, "Istanbul."],
      ["Safavid Empire under Shah ‘Abbas", 51.67, 32.65, "Isfahan."],
      ["Mughal Empire under Shah Jahan (from 1648)", 77.21, 28.61, "Delhi (Shahjahanabad)."],
      ["Nasrid kingdom (1232–1492)", -3.6, 37.18, "Granada."],
      ["Timurid Empire under Timur", 66.96, 39.65, "Samarkand."],
    ],
    battles: [
      ["Yarmuk (636)", 35.95, 32.75, "Arab armies defeat Byzantium; Syria opens up."],
      ["Qadisiyya (636/637)", 44.4, 31.8, "Arab victory over the Sasanian Persians."],
      ["Karbala (680)", 44.02, 32.62, "Death of Husayn, grandson of Muhammad."],
      ["Tours / Poitiers (732)", 0.5, 46.9, "Frankish victory over an Umayyad raid."],
      ["Talas (751)", 72.2, 42.5, "Abbasids defeat Tang China; paper-making spreads west."],
      ["Manzikert (1071)", 42.5, 39.1, "Seljuks defeat Byzantium; Anatolia opens to Turks."],
      ["Hattin (1187)", 35.45, 32.8, "Saladin defeats the Crusaders, retakes Jerusalem."],
      ["‘Ayn Jalut (1260)", 35.4, 32.55, "Mamluks halt the Mongols."],
      ["Chaldiran (1514)", 44.0, 39.1, "Ottomans defeat the Safavids."],
      ["Panipat (1526)", 76.97, 29.39, "Babur defeats the Delhi Sultanate; Mughal rule begins."],
    ],
  };
  function km(a, b) {
    var R = 6371, rad = Math.PI / 180, dLat = (b[1] - a[1]) * rad, dLon = (b[0] - a[0]) * rad;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  function baseMap() {
    var k = Math.cos(30 * Math.PI / 180), W = 900, H = Math.round(W * (LAT[1] - LAT[0]) / ((LON[1] - LON[0]) * k));
    var c = S.chart({ w: W, h: H, x: LON, y: LAT, m: { l: 0, r: 0, t: 0, b: 0 } });
    c.rect(LON[0], LAT[0], LON[1], LAT[1], { fill: "#EFE4D0" });
    for (var lo = 0; lo <= 80; lo += 10) c.line(lo, LAT[0], lo, LAT[1], { stroke: "rgba(43,33,24,.06)", "stroke-width": 1 });
    for (var la = 10; la <= 40; la += 10) c.line(LON[0], la, LON[1], la, { stroke: "rgba(43,33,24,.06)", "stroke-width": 1 });
    WATER.forEach(function (p) { c.area(p, { fill: "#CFE1EA", stroke: "#9FBFCF", "stroke-width": 1 }); });
    ISLANDS.forEach(function (p) { c.area(p, { fill: "#EFE4D0", stroke: "#9FBFCF", "stroke-width": 1 }); });
    RIVERS.forEach(function (p) { c.path(p, { stroke: "#7FAFC6", "stroke-width": 1.5 }); });
    [["Mediterranean", 18, 34.3], ["Black Sea", 34.5, 43.3], ["Caspian", 50.6, 41.8], ["Red Sea", 38.6, 20.5], ["Persian Gulf", 51.3, 27.1],
      ["Arabian Sea", 63, 16], ["Atlantic", -8.6, 40.5]].forEach(function (l) {
      c.text(l[1], l[2], l[0], { "text-anchor": "middle", "font-size": 11, "font-style": "italic", fill: "#5D8AA0" });
    });
    return c;
  }

  function mapTool(el) {
    var mode = "cities", round = [], idx = 0, score = 0, guess = null, explore = false;
    var best = S.load("mapbest", {});
    var mapEl = h("div"), promptEl = h("div", { class: "card pad stack" });
    var chips = h("div", { class: "chips" });
    function setMode(m) { mode = m; explore = false; start(); }
    function renderChips() {
      chips.innerHTML = "";
      [["cities", "Cities"], ["capitals", "Dynasty capitals"], ["battles", "Battles"]].forEach(function (m) {
        chips.appendChild(h("button", { type: "button", class: "chip" + (mode === m[0] && !explore ? " on" : ""), onclick: function () { setMode(m[0]); } }, m[1]));
      });
      chips.appendChild(h("button", { type: "button", class: "chip" + (explore ? " on" : ""), onclick: function () { explore = true; renderChips(); draw(); prompt(); } }, "Study the map"));
    }
    function start() {
      round = S.shuffle(PLACES[mode]).slice(0, 8); idx = 0; score = 0; guess = null;
      renderChips(); draw(); prompt();
    }
    function draw() {
      var c = baseMap();
      if (explore) {
        PLACES[mode].forEach(function (p) {
          c.dot(p[1], p[2], 4.5, { fill: "#0F766E", stroke: "#fff", "stroke-width": 1.5 });
          c.text(p[1], p[2], p[0].replace(/ \(.*\)$/, ""), { dx: 7, dy: 4, "font-size": 11.5, "font-weight": 700 });
        });
      } else if (guess && idx < round.length) {
        var p = round[idx];
        c.line(guess[0], guess[1], p[1], p[2], { stroke: "#C0392B", "stroke-dasharray": "4 3", "stroke-width": 1.5 });
        c.dot(guess[0], guess[1], 5, { fill: "#C0392B", stroke: "#fff", "stroke-width": 1.5 });
        c.dot(p[1], p[2], 6, { fill: "#0F766E", stroke: "#fff", "stroke-width": 2 });
        c.text(p[1], p[2], p[0].replace(/ \(.*\)$/, ""), { dx: 9, dy: 4, "font-size": 12.5, "font-weight": 800 });
      }
      mapEl.innerHTML = c.svg(' style="cursor:' + (explore ? "default" : "crosshair") + '"');
      var svg = mapEl.querySelector("svg");
      svg.addEventListener("click", function (e) {
        if (explore || guess || idx >= round.length) return;
        var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        var q = pt.matrixTransform(svg.getScreenCTM().inverse());
        guess = c.invert(q.x, q.y);
        var d = km(guess, [round[idx][1], round[idx][2]]);
        guess.d = d; guess.pts = Math.max(0, Math.round(100 - d / 10));
        score += guess.pts;
        draw(); prompt();
      });
    }
    function prompt() {
      promptEl.innerHTML = "";
      if (explore) {
        promptEl.appendChild(h("p", { class: "sec" }, "Study mode"));
        promptEl.appendChild(h("p", { style: "margin:0" }, "All the " + mode + " in this set, labelled. Pick a game above when you’re ready."));
        PLACES[mode].forEach(function (p) { promptEl.appendChild(h("div", { class: "small" }, h("b", null, p[0]), " · ", p[3])); });
        return;
      }
      if (idx >= round.length) {
        var key = mode, pct = Math.round(score / round.length);
        if (!best[key] || pct > best[key]) { best[key] = pct; S.save("mapbest", best); }
        promptEl.appendChild(h("p", { class: "sec" }, "Round done"));
        promptEl.appendChild(h("div", { class: "big" }, score + " / " + round.length * 100));
        promptEl.appendChild(h("p", { class: "dim small", style: "margin:0" }, "Best average for this set: " + best[key] + " per pin."));
        promptEl.appendChild(h("button", { type: "button", class: "btn solid", onclick: start }, "Play again"));
        return;
      }
      var p = round[idx];
      promptEl.appendChild(h("div", { class: "row spread" }, h("p", { class: "sec" }, "Pin " + (idx + 1) + " of " + round.length), h("span", { class: "dim small" }, score + " points")));
      promptEl.appendChild(h("div", { style: "font-size:20px;font-weight:800" }, mode === "capitals" ? "Capital of the " + p[0] : p[0]));
      if (!guess) promptEl.appendChild(h("p", { class: "dim small", style: "margin:0" }, "Click the map where it is."));
      else {
        promptEl.appendChild(h("div", { class: "row" }, h("span", { class: "pill " + (guess.d < 150 ? "good" : guess.d < 500 ? "ok" : "bad") }, Math.round(guess.d) + " km off"),
          h("b", null, "+" + guess.pts)));
        promptEl.appendChild(h("p", { style: "margin:0" }, p[3]));
        promptEl.appendChild(h("button", { type: "button", class: "btn solid", onclick: function () { idx++; guess = null; draw(); prompt(); } },
          idx + 1 < round.length ? "Next →" : "See score →"));
      }
    }
    el.appendChild(chips);
    el.appendChild(h("div", { class: "tool-body", style: "grid-template-columns:1fr minmax(240px,300px)" }, mapEl, promptEl));
    el.appendChild(h("p", { class: "dim small", style: "margin:0" }, "Schematic map (rough coastlines, rivers: Nile, Tigris, Euphrates, Indus). 100 points for a direct hit, 0 beyond 1,000 km."));
    start();
  }

  // 2. Timeline explorer + ordering quiz
  var ERAS = [["early", "Early Islam"], ["caliph", "Caliphates"], ["middle", "Middle period"], ["empires", "Gunpowder empires"], ["modern", "Modern"]];
  var EVENTS = [
    [570, "early", "Traditional birth of Muhammad in Mecca", "The “Year of the Elephant” in tradition."],
    [610, "early", "First revelation on Mount Hira", "Traditionally the beginning of the Qur’an’s revelation."],
    [622, "early", "Hijra to Medina", "Year 1 of the Islamic calendar; the first Muslim community-state."],
    [632, "early", "Death of Muhammad; Abu Bakr becomes caliph", "Start of the Rashidun (rightly guided) caliphs, 632–661."],
    [636, "early", "Battle of Yarmuk", "Byzantine Syria falls to the Arab armies."],
    [656, "early", "First fitna (civil war) begins", "‘Uthman is killed; ‘Ali’s caliphate is contested (656–661)."],
    [661, "caliph", "Umayyad caliphate founded (Damascus)", "Mu‘awiya takes power after ‘Ali’s death."],
    [680, "caliph", "Karbala: death of Husayn", "Defining event of Shi‘i memory, commemorated at ‘Ashura."],
    [692, "caliph", "Dome of the Rock completed", "Built under ‘Abd al-Malik in Jerusalem (691–692)."],
    [711, "caliph", "Conquest of Iberia begins", "Tariq ibn Ziyad crosses at Gibraltar (“Jabal Tariq”)."],
    [750, "caliph", "Abbasid revolution", "The Umayyads are overthrown; power shifts east to Iraq."],
    [756, "caliph", "Umayyad emirate of Córdoba", "‘Abd al-Rahman I, a surviving Umayyad, rules al-Andalus."],
    [762, "caliph", "Baghdad founded by al-Mansur", "The Round City becomes a world center of learning."],
    [830, "caliph", "House of Wisdom flourishes under al-Ma’mun", "Translation of Greek science and philosophy (al-Ma’mun r. 813–833)."],
    [969, "caliph", "Fatimids found Cairo", "An Isma‘ili Shi‘i caliphate rivals Baghdad; al-Azhar follows (970–972)."],
    [1037, "middle", "Death of Ibn Sina", "Author of the Canon of Medicine and the Book of Healing."],
    [1071, "middle", "Battle of Manzikert", "The Seljuks defeat Byzantium; Anatolia opens to the Turks."],
    [1099, "middle", "Crusaders take Jerusalem", "The First Crusade (1096–1099)."],
    [1111, "middle", "Death of al-Ghazali", "Author of the Incoherence of the Philosophers and the Revival of the Religious Sciences."],
    [1187, "middle", "Saladin retakes Jerusalem", "After victory at Hattin."],
    [1198, "middle", "Death of Ibn Rushd", "Commentator on Aristotle; replied to al-Ghazali."],
    [1258, "middle", "Mongols sack Baghdad", "End of the Abbasid caliphate in Baghdad."],
    [1260, "middle", "‘Ayn Jalut", "Mamluks halt the Mongol advance."],
    [1273, "middle", "Death of Rumi", "Poet of the Masnavi; the Mevlevi order follows."],
    [1325, "middle", "Ibn Battuta sets out", "Nearly 30 years of travel across the Islamic world (1325–1354)."],
    [1377, "middle", "Ibn Khaldun writes the Muqaddima", "Theory of history and ‘asabiyya."],
    [1453, "empires", "Ottomans take Constantinople", "Mehmed II; the city becomes Istanbul."],
    [1492, "empires", "Fall of Granada", "End of Muslim rule in Iberia."],
    [1501, "empires", "Safavid dynasty founded", "Shah Isma‘il I makes Twelver Shi‘ism the state religion of Iran."],
    [1517, "empires", "Ottomans conquer Mamluk Egypt", "Selim I; the Ottomans become guardians of Mecca and Medina."],
    [1526, "empires", "Mughal Empire founded", "Babur wins at Panipat."],
    [1557, "empires", "Süleymaniye Mosque completed", "Sinan’s masterpiece for Süleyman the Magnificent."],
    [1598, "empires", "Shah ‘Abbas I moves the capital to Isfahan", "Naqsh-e Jahan square and its mosques follow."],
    [1653, "empires", "Taj Mahal complex completed", "Shah Jahan’s tomb for Mumtaz Mahal in Agra (begun 1632)."],
    [1798, "modern", "Napoleon invades Egypt", "Often taken as the start of the modern colonial encounter."],
    [1839, "modern", "Ottoman Tanzimat reforms begin", "The Gülhane edict."],
    [1857, "modern", "End of the Mughal Empire", "After the Indian Rebellion; British Crown rule from 1858."],
    [1916, "modern", "Sykes–Picot agreement", "Britain and France divide the Ottoman Arab lands."],
    [1924, "modern", "Ottoman caliphate abolished", "By the Grand National Assembly of the new Turkish Republic."],
    [1947, "modern", "Partition of India; Pakistan founded", ""],
    [1978, "modern", "Said publishes Orientalism", ""],
    [1979, "modern", "Iranian Revolution", ""],
    [1988, "modern", "Naguib Mahfouz wins the Nobel Prize", "The first Arabic-language writer to win."],
  ];
  var DYN = [
    ["Rashidun", 632, 661], ["Umayyad", 661, 750], ["Abbasid", 750, 1258], ["Umayyads of Córdoba", 756, 1031], ["Fatimid", 909, 1171],
    ["Great Seljuk", 1037, 1194], ["Ayyubid", 1171, 1250], ["Mamluk", 1250, 1517], ["Nasrid", 1232, 1492], ["Ilkhanate", 1256, 1335],
    ["Ottoman", 1299, 1922], ["Safavid", 1501, 1736], ["Mughal", 1526, 1857],
  ];
  function timelineTool(el) {
    var era = null, quiz = null;
    var bars = h("div"), list = h("div", { class: "list" }), chips = h("div", { class: "chips" }), quizEl = h("div", { class: "card pad stack" });
    var search = h("input", { type: "search", placeholder: "Search events", oninput: renderList });
    function drawBars() {
      var c = S.chart({ w: 900, h: DYN.length * 22 + 40, x: [600, 1950], y: [0, DYN.length], m: { l: 140, t: 6, b: 28, r: 10 } })
        .axes({ xticks: [600, 800, 1000, 1200, 1400, 1600, 1800], yaxis: false, grid: false });
      DYN.forEach(function (d, k) {
        var y = DYN.length - k - 0.15;
        c.rect(d[1], y, d[2], y - 0.7, { fill: "#0F766E", opacity: 0.75, rx: 3 });
        c.raw('<text x="' + (c.m.l - 8) + '" y="' + (c.Y(y - 0.35) + 4) + '" font-size="11.5" text-anchor="end" fill="#2B2118">' + S.esc(d[0]) + "</text>");
        c.raw('<text x="' + (c.X(d[2]) + 4) + '" y="' + (c.Y(y - 0.35) + 4) + '" font-size="10" fill="#85796E">' + d[1] + "–" + d[2] + "</text>");
      });
      bars.innerHTML = c.svg();
    }
    function renderChips() {
      chips.innerHTML = "";
      chips.appendChild(h("button", { type: "button", class: "chip" + (!era ? " on" : ""), onclick: function () { era = null; renderChips(); renderList(); } }, "All"));
      ERAS.forEach(function (e) {
        chips.appendChild(h("button", { type: "button", class: "chip" + (era === e[0] ? " on" : ""), onclick: function () { era = e[0]; renderChips(); renderList(); } }, e[1]));
      });
    }
    function renderList() {
      var q = search.value.toLowerCase();
      list.innerHTML = "";
      EVENTS.filter(function (e) { return (!era || e[1] === era) && (!q || (e[2] + " " + e[3]).toLowerCase().indexOf(q) >= 0); }).forEach(function (e) {
        list.appendChild(h("div", { class: "item" }, h("div", { class: "row" }, h("span", { class: "pill good", style: "min-width:52px;text-align:center" }, e[0]), h("span", { class: "t" }, e[2])),
          e[3] ? h("span", { class: "dim small" }, e[3]) : null));
      });
    }
    function newQuiz() {
      var pool = era ? EVENTS.filter(function (e) { return e[1] === era; }) : EVENTS;
      var pick = [], tries = 0;
      while (pick.length < 5 && tries++ < 500) {
        var e = pool[Math.floor(Math.random() * pool.length)];
        if (pick.indexOf(e) < 0 && !pick.some(function (p) { return p[0] === e[0]; })) pick.push(e);
      }
      quiz = { items: S.shuffle(pick), checked: false };
      renderQuiz();
    }
    function renderQuiz() {
      quizEl.innerHTML = "";
      quizEl.appendChild(h("p", { class: "sec" }, "Ordering quiz" + (era ? " · " + ERAS.filter(function (e) { return e[0] === era; })[0][1] : "")));
      quizEl.appendChild(h("p", { class: "dim small", style: "margin:0" }, "Put these in chronological order, earliest first."));
      var right = quiz.items.slice().sort(function (a, b) { return a[0] - b[0]; });
      quiz.items.forEach(function (e, k) {
        var ok = quiz.checked && right[k] === e;
        quizEl.appendChild(h("div", { class: "item" + (quiz.checked && !ok ? " overdue" : ""), style: "flex-direction:row;align-items:center;gap:8px" },
          h("span", { style: "flex:1" }, e[2], quiz.checked ? h("b", { style: "margin-left:6px;color:" + (ok ? "var(--good)" : "var(--bad)") }, " " + e[0]) : null),
          h("button", { type: "button", class: "btn", disabled: k === 0 || quiz.checked ? "disabled" : null, "aria-label": "Move up", onclick: function () { swap(k, k - 1); } }, "↑"),
          h("button", { type: "button", class: "btn", disabled: k === quiz.items.length - 1 || quiz.checked ? "disabled" : null, "aria-label": "Move down", onclick: function () { swap(k, k + 1); } }, "↓")));
      });
      if (quiz.checked) {
        var n = quiz.items.filter(function (e, k) { return right[k] === e; }).length;
        quizEl.appendChild(h("div", { class: "row" }, h("span", { class: "pill " + (n === 5 ? "good" : "ok") }, n + " / 5 in the right place"),
          h("button", { type: "button", class: "btn solid", onclick: newQuiz }, "New set")));
      } else quizEl.appendChild(h("button", { type: "button", class: "btn solid", onclick: function () { quiz.checked = true; renderQuiz(); } }, "Check order"));
    }
    function swap(a, b) { var t = quiz.items[a]; quiz.items[a] = quiz.items[b]; quiz.items[b] = t; renderQuiz(); }
    el.appendChild(h("p", { class: "sec" }, "Dynasties at a glance"));
    el.appendChild(bars);
    el.appendChild(chips);
    el.appendChild(h("div", { class: "tool-body", style: "grid-template-columns:minmax(260px,380px) 1fr" },
      h("div", { class: "panel" }, quizEl, h("button", { type: "button", class: "btn", onclick: newQuiz }, "New quiz from this era")),
      h("div", { class: "panel" }, search, list)));
    drawBars(); renderChips(); renderList(); newQuiz();
  }

  // 3. Key-figures matcher
  var FIGURES = [
    ["Ibn Sina (Avicenna)", "980–1037", "The Canon of Medicine", "Philosophy & medicine: the “floating man” argument for the self"],
    ["Ibn Rushd (Averroes)", "1126–1198", "The Incoherence of the Incoherence", "Commentaries on Aristotle; harmony of philosophy and revelation"],
    ["al-Ghazali", "1058–1111", "The Incoherence of the Philosophers", "Critique of falsafa; Sufi-inflected renewal in the Revival of the Religious Sciences"],
    ["Rumi", "1207–1273", "The Masnavi", "Persian Sufi poetry; inspiration of the Mevlevi (“whirling”) order"],
    ["Ibn Khaldun", "1332–1406", "The Muqaddima", "‘Asabiyya and the cycle of dynasties"],
    ["al-Ma‘arri", "973–1057", "The Epistle of Forgiveness", "Blind Syrian poet, skeptic and ascetic"],
    ["Ibn Battuta", "1304–c. 1369", "The Rihla (Travels)", "Moroccan traveller across Africa, Asia and the Islamic world"],
    ["al-Khwarizmi", "c. 780–c. 850", "The Compendious Book on Calculation by Completion and Balancing (al-Jabr)", "Algebra; “algorithm” comes from his name"],
    ["al-Farabi", "c. 872–950", "The Virtuous City", "The “Second Teacher” after Aristotle; political philosophy"],
    ["Ibn al-Haytham", "c. 965–c. 1040", "The Book of Optics", "Vision as light entering the eye; experimental method"],
    ["Ferdowsi", "c. 940–1020", "The Shahnameh (Book of Kings)", "Persian national epic"],
    ["Hafez", "c. 1325–1390", "The Divan", "Master of the Persian ghazal, from Shiraz"],
    ["Ibn ‘Arabi", "1165–1240", "The Meccan Revelations", "Andalusian mystic; later linked to “unity of being”"],
    ["Ibn Tufayl", "c. 1105–1185", "Hayy ibn Yaqzan", "Philosophical novel of a man reasoning his way to truth on an island"],
    ["al-Tabari", "839–923", "History of the Prophets and Kings", "Historian and Qur’an commentator"],
    ["Omar Khayyam", "1048–1131", "The Rubaiyat (quatrains)", "Mathematician of cubic equations; poet"],
    ["Naguib Mahfouz", "1911–2006", "The Cairo Trilogy", "Egyptian novelist; Nobel Prize 1988"],
    ["Tayeb Salih", "1929–2009", "Season of Migration to the North", "Sudanese postcolonial novel (1966)"],
    ["Edward Said", "1935–2003", "Orientalism", "Critique of Western representations of the East"],
    ["Sinan", "c. 1490–1588", "The Süleymaniye Mosque", "Chief Ottoman architect under Süleyman"],
  ];
  function figuresTool(el) {
    var mode = "work", set = [], right = [], picked = null, done = {}, misses = 0;
    var board = h("div"), status = h("div", { class: "row" }), chips = h("div", { class: "chips" });
    function start() {
      set = S.shuffle(FIGURES).slice(0, 6);
      right = S.shuffle(set);
      picked = null; done = {}; misses = 0;
      render();
    }
    function render() {
      chips.innerHTML = "";
      [["work", "Figure → work"], ["idea", "Figure → idea"]].forEach(function (m) {
        chips.appendChild(h("button", { type: "button", class: "chip" + (mode === m[0] ? " on" : ""), onclick: function () { mode = m[0]; start(); } }, m[1]));
      });
      board.innerHTML = "";
      var left = h("div", { class: "list" }), rightCol = h("div", { class: "list" });
      set.forEach(function (f) {
        var isDone = done[f[0]];
        left.appendChild(h("button", { type: "button", class: "opt" + (isDone ? " right" : ""), disabled: isDone ? "disabled" : null,
          style: picked === f ? "border-color:var(--c);background:var(--c-soft)" : "",
          onclick: function () { picked = f; render(); } }, h("span", null, h("b", null, f[0]), h("span", { class: "why" }, f[1]))));
      });
      right.forEach(function (f) {
        var isDone = done[f[0]];
        var b = h("button", { type: "button", class: "opt" + (isDone ? " right" : ""), disabled: isDone ? "disabled" : null, onclick: function () {
          if (!picked) return;
          if (picked === f) { done[f[0]] = true; picked = null; render(); }
          else { misses++; b.classList.add("wrong"); setTimeout(function () { b.classList.remove("wrong"); }, 600); status.lastChild.textContent = misses + " miss" + (misses === 1 ? "" : "es"); }
        } }, h("span", null, mode === "work" ? h("i", null, f[2]) : f[3]));
        rightCol.appendChild(b);
      });
      board.appendChild(h("div", { class: "tool-body", style: "grid-template-columns:1fr 1fr" }, left, rightCol));
      var n = Object.keys(done).length;
      status.innerHTML = "";
      status.appendChild(h("span", { class: "pill " + (n === set.length ? "good" : "ok") }, n + " / " + set.length + " matched"));
      status.appendChild(h("span", { class: "dim small" }, misses + " miss" + (misses === 1 ? "" : "es")));
      if (n === set.length) {
        var best = S.load("figbest", null);
        if (best == null || misses < best) S.save("figbest", misses);
        status.appendChild(h("button", { type: "button", class: "btn solid", onclick: start }, "New set"));
      }
    }
    el.appendChild(chips);
    el.appendChild(h("p", { class: "dim small", style: "margin:0" }, "Pick a figure on the left, then what goes with them on the right."));
    el.appendChild(board);
    el.appendChild(status);
    el.appendChild(h("details", { class: "card pad" }, h("summary", { style: "cursor:pointer;font-weight:600" }, "All " + FIGURES.length + " figures"),
      h("div", { class: "list", style: "margin-top:10px" }, FIGURES.map(function (f) {
        return h("div", { class: "small" }, h("b", null, f[0]), " (" + f[1] + "): ", h("i", null, f[2]), ". " + f[3] + ".");
      }))));
    start();
  }

  S.course({
    id: "ihum242", code: "IHUM 242", title: "Islamic Humanities", color: "#0F766E",
    blurb: "Classical Islamic civilization to the modern and postcolonial world.",
    tools: [
      { id: "map", name: "Map game", blurb: "Pin cities, dynasty capitals and battles; scored by distance.", mount: mapTool },
      { id: "timeline", name: "Timeline explorer", blurb: "Dynasties at a glance, " + EVENTS.length + " key events, and an ordering quiz.", mount: timelineTool },
      { id: "figures", name: "Key-figures matcher", blurb: "Match philosophers, poets and scientists to their works and ideas.", mount: figuresTool },
    ],
    data: { PLACES: PLACES, EVENTS: EVENTS, FIGURES: FIGURES, DYN: DYN, km: km },
  });
})();
