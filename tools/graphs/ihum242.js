// IHUM 242 card graphs, added to the shared library (tools/graphs.js) with
// its drawing helpers (window.GRAPHKIT). Same style as the ECON 381 graphs:
// unit colour (c1/k1/box1/solid1), orange (c2/k2/box2), green (c3/k3/box3),
// ink (c4, box, solid4).
//
// Plain ES5 on purpose: no backticks, no "${".
(function () {
  var K = window.GRAPHKIT, G = window.GRAPHS;
  var svg = K.svg, t = K.t, ln = K.ln, dot = K.dot, rect = K.rect, curve = K.curve, area = K.area, scale = K.scale;

  function has(list, v) {
    if (!list) return false;
    if (typeof list === 'string') return list === v;
    for (var k = 0; k < list.length; k++) if (list[k] === v) return true;
    return false;
  }
  function arrow(x1, y1, x2, y2, cls) { return ln(x1, y1, x2, y2, cls || 'c4', true); }

  // ------------------------------------------------------- dynasty timeline
  // Same date ranges as the Timeline tool (classes/ihum242.js, DYN).
  var DYN = [
    ['Rashidun', 'Rashidun', 632, 661], ['Umayyad', 'Umayyad', 661, 750], ['Abbasid', 'Abbasid', 750, 1258],
    ['Umayyads of Córdoba', 'Umayyad, Spain', 756, 1031], ['Fatimid', 'Fatimid', 909, 1171],
    ['Great Seljuk', 'Great Seljuk', 1037, 1194], ['Ayyubid', 'Ayyubid', 1171, 1250], ['Mamluk', 'Mamluk', 1250, 1517],
    ['Nasrid', 'Nasrid', 1232, 1492], ['Ilkhanate', 'Ilkhanate', 1256, 1335],
    ['Ottoman', 'Ottoman', 1299, 1922], ['Safavid', 'Safavid', 1501, 1736], ['Mughal', 'Mughal', 1526, 1857],
  ];
  G.ihum242Dyn = DYN;

  G.ihum242Timeline = function (a) {
    a = a || {};
    var sx = scale(600, 1950, 98, 306), rowH = 14.5, top = 10;
    var o = '';
    [700, 1000, 1300, 1600, 1900].forEach(function (y) {
      o += ln(sx(y), top - 4, sx(y), top + DYN.length * rowH + 2, 'c4 dash faint');
      o += t(sx(y), top + DYN.length * rowH + 14, String(y), 'lb', 'middle');
    });
    DYN.forEach(function (d, k) {
      var y = top + k * rowH, on = has(a.hi, d[0]);
      var x0 = sx(d[2]), w = Math.max(3, sx(d[3]) - sx(d[2]));
      o += rect(x0, y + 2, w, rowH - 5, on ? 'solid1' : 'solid4', 2);
      o += t(92, y + rowH - 4, d[1], on ? 'k1' : 'lb', 'end');
      if (on) {
        var lab = d[2] + '–' + d[3];
        // The dates go after the bar, or before it when the bar runs to the edge.
        o += sx(d[3]) + 52 < 312 ? t(sx(d[3]) + 4, y + rowH - 4, lab, 'k1', 'start') : t(x0 - 4, y + rowH - 4, lab, 'k1', 'end');
      }
    });
    var cap = a.cap || 'Major dynasties, 632–1922 CE. Several overlap: after c. 950 the Abbasid caliph in Baghdad reigned while regional dynasties ruled.';
    return { svg: svg(o, top + DYN.length * rowH + 20), cap: cap };
  };

  // ------------------------------------------------------- schematic map
  var CITIES = [
    // name, lon, lat, label dx, label dy, anchor
    ['Mecca', 39.83, 21.42, -6, 4, 'end'], ['Medina', 39.61, 24.47, -6, 4, 'end'],
    ['Jerusalem', 35.22, 31.78, -6, 6, 'end'], ['Damascus', 36.29, 33.51, -6, -1, 'end'],
    ['Baghdad', 44.37, 33.31, 0, -7, 'middle'], ['Cairo', 31.24, 30.04, 0, 13, 'middle'],
    ['Córdoba', -4.78, 37.89, 6, 4, 'start'], ['Fez', -5.0, 34.03, 6, 4, 'start'],
    ['Istanbul', 28.98, 41.01, 6, 3, 'start'],
    ['Konya', 32.49, 37.87, -6, 4, 'end'], ['Isfahan', 51.67, 32.65, 6, 5, 'start'],
    ['Samarkand', 66.96, 39.65, 0, -7, 'middle'], ['Delhi', 77.21, 28.61, -6, 6, 'end'],
  ];
  G.ihum242Cities = CITIES;

  G.ihum242Map = function (a) {
    a = a || {};
    var sx = scale(-10, 80, 12, 308), sy = scale(19, 44, 188, 10);
    var o = rect(6, 2, 308, 192, 'box', 8);
    [['Iberia', -4, 42], ['N. Africa', 3, 30.5], ['Arabia', 50, 20], ['Iran', 57, 37], ['India', 72, 21.5]].forEach(function (r) {
      o += t(sx(r[1]), sy(r[2]), r[0], 'it faint', 'middle');
    });
    if (a.route) {
      var A = CITIES[0], B = CITIES[1];
      o += curve([[sx(A[1]) + 4, sy(A[2]) - 3], [sx(A[1]) + 13, sy((A[2] + B[2]) / 2)], [sx(B[1]) + 5, sy(B[2]) + 3]], 'c4', true);
      o += t(sx(A[1]) + 18, sy((A[2] + B[2]) / 2) + 4, 'hijra, 622', 'k2', 'start');
    }
    CITIES.forEach(function (c) {
      var on = !a.hi || has(a.hi, c[0]);
      var x = sx(c[1]), y = sy(c[2]);
      o += '<circle cx="' + K.r(x) + '" cy="' + K.r(y) + '" r="' + (on && a.hi ? 4 : 3) + '" class="' + (on ? (a.hi ? 'solid1' : 'dot') : 'solid4') + '"/>';
      o += t(x + c[3], y + c[4], c[0], on ? (a.hi ? 'k1' : '') : 'lb', c[5]);
    });
    return { svg: svg(o, 196), cap: a.cap || 'Schematic, not to scale: key cities of the classical Islamic world placed by longitude and latitude (10° W to 80° E).' };
  };

  // ------------------------------------------------------- succession
  G.ihum242Succession = function (a) {
    a = a || {};
    var sOn = a.hi !== 'shia', hOn = a.hi !== 'sunni';
    var o = rect(95, 6, 130, 28, 'box', 10) + t(160, 24, 'Muhammad (d. 632)', 'b', 'middle');
    o += curve([[160, 34], [160, 42], [82, 42], [82, 52]], 'c4', true);
    o += curve([[160, 42], [240, 42], [240, 52]], 'c4', true);
    o += t(82, 64, 'Sunni view', sOn ? 'k1' : 'lb', 'middle') + t(240, 64, 'Shi‘i view', hOn ? 'k2' : 'lb', 'middle');
    var L = [['Abu Bakr', '632–634'], ['‘Umar', '634–644'], ['‘Uthman', '644–656'], ['‘Ali', '656–661']];
    var R = [['‘Ali', 'designated by Muhammad'], ['Hasan', '2nd Imam'], ['Husayn', 'killed at Karbala, 680'], ['Imams of his line', 'Twelver: 12th hidden 874']];
    for (var k = 0; k < 4; k++) {
      var y = 72 + k * 40;
      o += rect(14, y, 136, 26, sOn ? 'box1' : 'box', 7) + t(22, y + 17, L[k][0], sOn ? 'k1' : 'b', 'start') + t(142, y + 17, L[k][1], 'lb', 'end');
      o += rect(170, y, 140, 26, hOn ? 'box2' : 'box', 7) + t(178, y + 12, R[k][0], hOn ? 'k2' : 'b', 'start') + t(178, y + 23, R[k][1], 'lb', 'start');
      if (k < 3) { o += arrow(82, y + 27, 82, y + 38) + arrow(298, y + 27, 298, y + 38); }
    }
    o += t(82, 232, 'community’s choice; all four', 'lb', 'middle') + t(82, 243, '“rightly guided” (Rashidun)', 'lb', 'middle');
    o += t(240, 232, 'leadership (imamate) belongs', 'lb', 'middle') + t(240, 243, 'to ‘Ali and his descendants', 'lb', 'middle');
    return { svg: svg(o, 248), cap: 'Both sides accept the same four men as historical caliphs; they differ on whether ‘Ali should have led first and on who holds religious authority after him.' };
  };

  // ------------------------------------------------------- sources of law
  G.ihum242LawLadder = function (a) {
    a = a || {};
    var rows = [['quran', 'Qur’an', 'revealed text'], ['sunna', 'Sunna', 'Prophet’s practice, known via hadith'],
      ['ijma', 'Ijma‘', 'consensus of qualified scholars'], ['qiyas', 'Qiyas', 'analogy from a known ruling']];
    var o = '';
    rows.forEach(function (r, k) {
      var x = 14 + k * 22, y = 10 + k * 40, on = !a.hi || a.hi === r[0];
      o += rect(x, y, 200, 32, on ? 'box1' : 'box', 8);
      o += t(x + 10, y + 14, (k + 1) + '. ' + r[1], on ? 'k1' : 'b', 'start') + t(x + 10, y + 26, r[2], 'lb', 'start');
      if (k < 3) o += curve([[x + 200, y + 16], [x + 214, y + 16], [x + 214, y + 38]], 'c4', true);
    });
    o += rect(14, 172, 296, 56, 'box2', 8);
    o += t(22, 188, 'Fiqh = the jurist’s reasoning (ijtihad) on these', 'k2', 'start');
    o += t(22, 203, 'No clear answer at one rung? Go down to the next.', '', 'start');
    o += t(22, 218, 'Twelver Shi‘i usul: Qur’an, Sunna (incl. Imams), ijma‘, ‘aql', 'lb', 'start');
    return { svg: svg(o, 232), cap: 'The classical Sunni sources of law (usul al-fiqh), as systematized after al-Shafi‘i (d. 820). Higher sources control the lower.' };
  };

  // ------------------------------------------------------- five pillars
  G.ihum242Pillars = function (a) {
    a = a || {};
    var P = [['shahada', 'Shahada', 'witness', 'of faith'], ['salat', 'Salat', 'prayer', '5 daily'], ['zakat', 'Zakat', 'alms', '2.5%'],
      ['sawm', 'Sawm', 'fasting', 'Ramadan'], ['hajj', 'Hajj', 'to Mecca', 'if able']];
    var o = area([[14, 50], [160, 10], [306, 50]], 'fill1') + curve([[14, 50], [160, 10], [306, 50]], 'c1');
    o += t(160, 40, 'Islam (“submission”)', 'k1', 'middle');
    o += rect(14, 52, 292, 8, 'solid4', 2);
    P.forEach(function (p, k) {
      var x = 17 + k * 58, on = !a.hi || a.hi === p[0];
      o += rect(x, 64, 52, 100, on ? 'box1' : 'box', 4);
      o += t(x + 26, 92, p[1], on ? 'k1' : 'b', 'middle');
      o += t(x + 26, 112, p[2], 'lb', 'middle') + t(x + 26, 126, p[3], 'lb', 'middle');
    });
    o += rect(14, 168, 292, 8, 'solid4', 2);
    return { svg: svg(o, 182), cap: 'The five ritual duties shared by Sunnis and Shi‘is (Shi‘i theology groups the obligations a little differently).' };
  };

  // ------------------------------------------------------- madhhabs
  G.ihum242Madhhabs = function (a) {
    a = a || {};
    var M = [['hanafi', 'Hanafi', 'Abu Hanifa (d. 767)', 'Turkey, C. & S. Asia'],
      ['maliki', 'Maliki', 'Malik (d. 795)', 'North & West Africa'],
      ['shafii', 'Shafi‘i', 'al-Shafi‘i (d. 820)', 'Egypt, E. Africa, SE Asia'],
      ['hanbali', 'Hanbali', 'Ibn Hanbal (d. 855)', 'Arabian Peninsula']];
    var o = t(160, 14, 'Sunni schools of law', 'b', 'middle');
    M.forEach(function (m, k) {
      var x = 14 + (k % 2) * 150, y = 22 + Math.floor(k / 2) * 64, on = !a.hi || a.hi === m[0];
      o += rect(x, y, 142, 56, on ? 'box1' : 'box', 8);
      o += t(x + 8, y + 17, m[1], on ? 'k1' : 'b', 'start');
      o += t(x + 8, y + 32, m[2], '', 'start') + t(x + 8, y + 47, m[3], 'lb', 'start');
    });
    var on = !a.hi || a.hi === 'jafari';
    o += rect(14, 156, 292, 40, on ? 'box2' : 'box', 8);
    o += t(22, 172, 'Shi‘i (Twelver): Ja‘fari', on ? 'k2' : 'b', 'start') + t(22, 188, 'after Imam Ja‘far al-Sadiq (d. 765); Iran, Iraq', 'lb', 'start');
    return { svg: svg(o, 202), cap: 'Each school is a method and body of rulings, not a sect: Sunnis regard all four as legitimate. Regions are where each predominates today.' };
  };

  // ------------------------------------------------------- isnad / silsila
  G.ihum242Isnad = function (a) {
    a = a || {};
    var sil = a.mode === 'silsila';
    var chain = sil
      ? [['the Prophet', 'source of the path'], ['‘Ali (or Abu Bakr)', 'first link'], ['founding shaykh', 'e.g. al-Jilani, Naqshband'], ['your shaykh', 'living master'], ['disciple (murid)', 'initiated into the order']]
      : [['the Prophet', 'said, did or approved'], ['Companion', 'saw or heard it'], ['Successor', 'heard it from him'], ['later transmitters', '“X told me that Y said…”'], ['compiler', 'e.g. al-Bukhari (d. 870)']];
    var o = t(84, 14, sil ? 'Silsila (chain)' : 'Isnad (chain)', 'k1', 'middle');
    chain.forEach(function (c, k) {
      var y = 22 + k * 40;
      o += rect(14, y, 140, 27, 'box1', 8) + t(84, y + 12, c[0], 'b', 'middle') + t(84, y + 23, c[1], 'lb', 'middle');
      if (k < chain.length - 1) o += arrow(84, y + 28, 84, y + 39);
    });
    if (sil) {
      o += rect(176, 70, 134, 84, 'box2', 8);
      o += t(243, 90, 'What passes down', 'k2', 'middle') + t(243, 106, 'blessing (baraka),', 'lb', 'middle');
      o += t(243, 119, 'the order’s dhikr,', 'lb', 'middle') + t(243, 132, 'the right to guide', 'lb', 'middle');
      o += arrow(176, 112, 158, 112);
    } else {
      o += rect(176, 58, 134, 70, 'box2', 8);
      o += t(243, 76, 'Matn (text)', 'k2', 'middle') + t(243, 93, 'the report itself:', 'lb', 'middle') + t(243, 106, 'what was said', 'lb', 'middle') + t(243, 119, 'or done', 'lb', 'middle');
      o += rect(176, 140, 134, 58, 'box', 8);
      o += t(243, 157, 'Critics grade it', 'b', 'middle') + t(243, 172, 'sahih (sound), hasan', 'lb', 'middle') + t(243, 185, '(good), da‘if (weak)', 'lb', 'middle');
      o += arrow(176, 92, 158, 92);
    }
    return { svg: svg(o, 214), cap: sil ? 'A Sufi order traces its teaching master to master back to the Prophet, as a hadith traces its words.'
      : 'A hadith = isnad + matn. Scholars judged a report largely by its chain: were the transmitters reliable, and could they have met?' };
  };

  // ------------------------------------------------------- translation
  G.ihum242Translation = function () {
    var o = '';
    var B = [['Greek', 'Aristotle, Galen, Ptolemy, Euclid', 'box'], ['Syriac', 'Christian scholars, often the bridge', 'box'],
      ['Arabic', 'Abbasid Baghdad, 8th–10th c.', 'box1'], ['Latin', 'Toledo, 12th c.; Gerard of Cremona', 'box3']];
    B.forEach(function (b, k) {
      var y = 8 + k * 48;
      o += rect(14, y, 186, 36, b[2], 8) + t(24, y + 15, b[0], k === 2 ? 'k1' : (k === 3 ? 'k3' : 'b'), 'start') + t(24, y + 29, b[1], 'lb', 'start');
      if (k < 3) o += arrow(107, y + 37, 107, y + 47);
    });
    o += curve([[200, 26], [214, 26], [214, 110], [203, 110]], 'c4 dash', true);
    o += t(218, 62, 'some texts', 'lb', 'start') + t(218, 74, 'went straight', 'lb', 'start') + t(218, 86, 'Greek→Arabic', 'lb', 'start');
    o += rect(226, 120, 84, 46, 'box2', 8) + t(268, 136, 'Persian &', 'k2', 'middle') + t(268, 148, 'Indian works,', 'lb', 'middle') + t(268, 160, 'numerals', 'lb', 'middle');
    o += arrow(226, 130, 203, 130);
    o += t(160, 202, 'Arabic scholars added commentary and new work, not just copies.', 'lb', 'middle');
    return { svg: svg(o, 208), cap: 'The translation movement: Greek learning, often through Syriac, into Arabic under the Abbasids, and later from Arabic into Latin.' };
  };

  // ------------------------------------------------------- falsafa vs kalam
  G.ihum242FalsafaKalam = function () {
    var o = '';
    o += rect(14, 8, 140, 112, 'box1', 8) + t(84, 26, 'Falsafa', 'k1', 'middle');
    o += t(84, 42, 'starts from Greek', 'lb', 'middle') + t(84, 54, 'demonstrative reason', 'lb', 'middle');
    o += t(84, 74, 'al-Kindi, al-Farabi,', '', 'middle') + t(84, 88, 'Ibn Sina, Ibn Rushd', '', 'middle');
    o += t(84, 108, 'e.g. world is eternal', 'lb', 'middle');
    o += rect(166, 8, 140, 112, 'box2', 8) + t(236, 26, 'Kalam', 'k2', 'middle');
    o += t(236, 42, 'starts from revelation;', 'lb', 'middle') + t(236, 54, 'reason defends doctrine', 'lb', 'middle');
    o += t(236, 74, 'Mu‘tazila: reason,', '', 'middle') + t(236, 88, 'free will; Ash‘aris', '', 'middle');
    o += t(236, 108, 'e.g. world created in time', 'lb', 'middle');
    o += rect(14, 140, 292, 30, 'box', 8) + t(160, 159, 'al-Ghazali, Incoherence of the Philosophers', 'b', 'middle');
    o += arrow(84, 140, 84, 123) + t(92, 135, 'critique', 'lb', 'start');
    o += rect(14, 192, 292, 30, 'box1', 8) + t(160, 211, 'Ibn Rushd, Incoherence of the Incoherence', 'k1', 'middle');
    o += arrow(236, 192, 236, 173) + t(244, 186, 'reply', 'lb', 'start');
    return { svg: svg(o, 228), cap: 'Two rational traditions. Al-Ghazali, himself an Ash‘ari theologian, attacked the philosophers; Ibn Rushd replied about a century later.' };
  };

  // ------------------------------------------------------- waqf
  G.ihum242Waqf = function () {
    var o = '';
    o += rect(14, 8, 120, 40, 'box', 8) + t(74, 25, 'Founder (waqif)', 'b', 'middle') + t(74, 39, 'gives up ownership', 'lb', 'middle');
    o += arrow(134, 28, 182, 28);
    o += rect(184, 8, 122, 40, 'box1', 8) + t(245, 25, 'Property', 'k1', 'middle') + t(245, 39, 'shops, land, baths', 'lb', 'middle');
    o += arrow(245, 48, 245, 70);
    o += t(253, 63, 'rent', 'lb', 'start');
    o += rect(184, 72, 122, 40, 'box1', 8) + t(245, 89, 'Income', 'k1', 'middle') + t(245, 103, 'in perpetuity', 'lb', 'middle');
    o += arrow(245, 112, 245, 134);
    o += rect(14, 136, 292, 52, 'box3', 8) + t(160, 154, 'Beneficiaries named in the deed', 'k3', 'middle');
    o += t(160, 170, 'madrasa · mosque · hospital · fountain', '', 'middle') + t(160, 182, 'or the founder’s family (family waqf)', 'lb', 'middle');
    o += rect(14, 72, 140, 40, 'box2', 8) + t(84, 89, 'Administrator', 'k2', 'middle') + t(84, 103, '(mutawalli); qadi oversees', 'lb', 'middle');
    o += arrow(154, 92, 182, 92);
    return { svg: svg(o, 194), cap: 'A waqf locks property out of the market for good and dedicates its income to the purpose the founder names.' };
  };

  // ------------------------------------------------------- millet
  G.ihum242Millet = function () {
    var o = rect(90, 8, 140, 32, 'box', 10) + t(160, 22, 'Sultan', 'b', 'middle') + t(160, 34, 'Ottoman state and courts', 'lb', 'middle');
    var M = [['Greek Orthodox', 'Patriarch of', 'Constantinople'], ['Armenian', 'Armenian', 'Patriarch'], ['Jewish', 'Chief Rabbi', '(Hahambaşı)']];
    M.forEach(function (m, k) {
      var x = 14 + k * 100;
      o += curve([[160, 40], [160, 52], [x + 46, 52], [x + 46, 64]], 'c4', true);
      o += rect(x, 66, 92, 56, 'box1', 8) + t(x + 46, 84, m[0], 'k1', 'middle') + t(x + 46, 100, m[1], 'lb', 'middle') + t(x + 46, 113, m[2], 'lb', 'middle');
    });
    o += rect(14, 134, 292, 48, 'box2', 8);
    o += t(160, 152, 'Inside each community: its own leaders', 'k2', 'middle');
    o += t(160, 168, 'marriage, divorce, inheritance, schools, taxes', 'lb', 'middle');
    return { svg: svg(o, 188), cap: 'The communities as formalized in the 19th century. Earlier arrangements were more local and varied than a single "system".' };
  };

  // ------------------------------------------------------- mosque plans
  G.ihum242MosquePlan = function (a) {
    a = a || {};
    var o = '';
    if (a.type === 'iwan') {
      o += t(14, 12, 'Mecca ↑', 'k2', 'start');
      o += rect(60, 20, 200, 170, 'box', 4);
      o += ln(60, 20, 260, 20, 'c2') + t(160, 15, 'qibla wall', 'k2', 'middle');
      o += rect(110, 78, 100, 62, 'fill1', 2) + t(160, 113, 'courtyard', 'it', 'middle');
      o += rect(122, 24, 76, 26, 'box1', 3) + t(160, 41, 'dome chamber', 'lb', 'middle');
      o += rect(136, 50, 48, 28, 'box1', 3) + t(160, 68, 'iwan', 'k1', 'middle');
      o += rect(136, 140, 48, 28, 'box1', 3) + t(160, 158, 'iwan', 'k1', 'middle');
      o += rect(70, 94, 40, 30, 'box1', 3) + t(90, 113, 'iwan', 'k1', 'middle');
      o += rect(210, 94, 40, 30, 'box1', 3) + t(230, 113, 'iwan', 'k1', 'middle');
      [[66, 26], [66, 148], [214, 26], [214, 148]].forEach(function (p) { o += rect(p[0], p[1], 40, 34, 'box', 2); });
      o += t(86, 47, 'rooms', 'lb', 'middle') + t(234, 47, 'rooms', 'lb', 'middle') + t(86, 169, 'rooms', 'lb', 'middle') + t(234, 169, 'rooms', 'lb', 'middle');
      o += curve([[184, 64], [272, 64]], 'c4') + t(276, 61, 'qibla', 'b', 'start') + t(276, 73, 'iwan', 'b', 'start');
      o += t(160, 204, 'an iwan on each axis of the courtyard', 'lb', 'middle');
      return { svg: svg(o, 210), cap: 'The four-iwan plan, used for Iranian mosques (Friday Mosque of Isfahan) and for madrasas, with teaching rooms around the court.' };
    }
    o += t(14, 14, 'Mecca ↑', 'k2', 'start') + t(114, 14, 'qibla wall', 'k2', 'middle');
    o += rect(24, 22, 180, 160, 'box', 3);
    o += ln(24, 22, 204, 22, 'c2');
    o += '<path d="M106 22 A8 8 0 0 0 122 22" class="c2"/>';
    o += rect(127, 24, 9, 10, 'solid2', 1);
    for (var r = 0; r < 3; r++) for (var c = 0; c < 9; c++) o += '<circle cx="' + (36 + c * 19.5) + '" cy="' + (52 + r * 13) + '" r="1.8" class="solid4"/>';
    o += t(114, 100, 'prayer hall (columns)', 'lb', 'middle');
    o += ln(24, 106, 204, 106, 'c4 dash');
    o += rect(50, 112, 128, 64, 'fill1', 2) + t(114, 134, 'courtyard (sahn)', 'it', 'middle');
    o += '<circle cx="114" cy="154" r="5" class="box1"/>';
    o += rect(104, 182, 20, 16, 'solid1', 2);
    o += curve([[114, 30], [114, 40], [212, 40]], 'c4') + t(216, 44, 'mihrab', 'b', 'start');
    o += curve([[136, 29], [212, 29]], 'c4') + t(216, 32, 'minbar', 'b', 'start');
    o += curve([[119, 154], [212, 154]], 'c4') + t(216, 152, 'ablution', 'b', 'start') + t(216, 164, 'fountain', 'b', 'start');
    o += curve([[124, 190], [212, 190]], 'c4') + t(216, 194, 'minaret', 'b', 'start');
    o += t(216, 72, 'rows of', 'lb', 'start') + t(216, 84, 'worshippers', 'lb', 'start') + t(216, 96, 'face the wall', 'lb', 'start');
    return { svg: svg(o, 202), cap: 'A hypostyle ("many columns") congregational mosque, schematic: the long qibla wall faces Mecca, so worshippers stand in wide rows.' };
  };

  // ------------------------------------------------------- muqarnas
  G.ihum242Muqarnas = function () {
    var o = '';
    function niche(x, y, w, h, cls) {
      var m = x + w / 2;
      return '<path d="M' + x + ' ' + (y + h) + ' L' + x + ' ' + (y + h * 0.45) + ' Q' + x + ' ' + y + ' ' + m + ' ' + y +
        ' Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + h * 0.45) + ' L' + (x + w) + ' ' + (y + h) + ' Z" class="' + cls + '"/>';
    }
    // Tiers widen as they rise: each one corbels out over the one below.
    var tiers = [[3, 124], [4, 96], [5, 68], [6, 40]], w = 26, h = 26;
    tiers.forEach(function (tr, k) {
      var n = tr[0], y = tr[1], x0 = 120 - n * w / 2;
      for (var i = 0; i < n; i++) o += niche(x0 + i * w, y, w, h, k % 2 ? 'box1' : 'box');
    });
    o += rect(30, 12, 180, 24, 'fill1', 2) + t(120, 28, 'dome or ceiling', 'k1', 'middle');
    o += rect(66, 152, 108, 14, 'solid4', 2) + t(120, 180, 'wall corner or arch below', 'lb', 'middle');
    o += curve([[218, 150], [218, 46]], 'c4', true);
    o += t(226, 78, 'tiers of', 'k2', 'start') + t(226, 91, 'small niches', 'k2', 'start') + t(226, 104, 'step outward', 'k2', 'start') + t(226, 117, 'as they rise', 'k2', 'start');
    return { svg: svg(o, 186), cap: 'Muqarnas, in elevation (schematic): rows of small niches, each tier projecting over the last, bridge a square or arch to a curved dome.' };
  };

  // ------------------------------------------------------- qasida
  G.ihum242Qasida = function () {
    var P = [['Nasib', 'prelude:', 'deserted camp'], ['Rahil', 'journey:', 'camel, desert'], ['Gharad', 'purpose:', 'praise, boast']];
    var o = '';
    P.forEach(function (p, k) {
      var x = 14 + k * 104;
      o += rect(x, 14, 88, 64, k === 2 ? 'box1' : 'box', 8) + t(x + 44, 34, p[0], k === 2 ? 'k1' : 'b', 'middle');
      o += t(x + 44, 52, p[1], 'lb', 'middle') + t(x + 44, 66, p[2], 'lb', 'middle');
      if (k < 2) o += arrow(x + 89, 46, x + 103, 46);
    });
    o += t(14, 104, 'Every line (bayt): two half-lines, one meter, one rhyme', 'b', 'start');
    for (var k = 0; k < 4; k++) {
      var y = 116 + k * 16;
      o += rect(14, y, 128, 8, 'solid4', 2) + rect(150, y, 128, 8, 'solid4', 2) + rect(280, y - 2, 24, 12, 'box2', 3) + t(292, y + 8, '-li', 'k2', 'middle');
    }
    o += t(14, 194, 'monorhyme: the same rhyme closes every line of the poem', 'lb', 'start');
    return { svg: svg(o, 200), cap: 'The classical tripartite ode, as later critics described it (Ibn Qutayba, 9th c.); many qasidas vary or drop parts.' };
  };

  // ------------------------------------------------------- ghazal
  G.ihum242Ghazal = function () {
    var o = t(14, 14, 'Ghazal: couplets (bayts), each a closed thought', 'b', 'start');
    var rows = [['1', true, true, ''], ['2', false, true, ''], ['3', false, true, ''], ['…', false, true, ''], ['last', false, true, 'pen name (takhallus)']];
    rows.forEach(function (r, k) {
      var y = 28 + k * 30;
      o += t(30, y + 13, r[0], 'lb', 'end');
      o += rect(36, y + 4, 110, 10, 'solid4', 2) + (r[1] ? rect(122, y + 1, 24, 16, 'box2', 3) : '');
      o += rect(152, y + 4, 110, 10, 'solid4', 2) + rect(238, y + 1, 24, 16, 'box2', 3);
      if (r[3]) o += t(36, y + 28, r[3], 'k1', 'start');
    });
    o += t(270, 46, 'rhyme +', 'k2', 'start') + t(270, 58, 'refrain', 'k2', 'start') + t(270, 70, '(radif)', 'lb', 'start');
    o += t(14, 196, 'Persian ghazals typically run about 5–15 couplets.', 'lb', 'start');
    return { svg: svg(o, 202), cap: 'The opening couplet rhymes in both lines; then only the second line of each couplet carries the rhyme and refrain. The poet signs the last.' };
  };

  // ------------------------------------------------------- modern era
  var MOD = [[1798, 'Napoleon invades Egypt'], [1839, 'Tanzimat begins (Gülhane edict)'], [1876, 'Ottoman constitution'],
    [1916, 'Sykes–Picot agreement'], [1924, 'Ottoman caliphate abolished'], [1947, 'Partition of India; Pakistan'],
    [1978, 'Said, Orientalism'], [1979, 'Iranian Revolution']];
  G.ihum242ModernMod = MOD;
  G.ihum242Modern = function (a) {
    a = a || {};
    var o = ln(64, 10, 64, 10 + MOD.length * 23 - 8, 'c4');
    MOD.forEach(function (m, k) {
      var y = 14 + k * 23, on = has(a.hi, m[0]);
      o += '<circle cx="64" cy="' + y + '" r="' + (on ? 5 : 3.2) + '" class="' + (on ? 'solid1' : 'solid4') + '"/>';
      o += t(52, y + 4, String(m[0]), on ? 'k1' : 'b', 'end');
      o += t(76, y + 4, m[1], on ? 'k1' : '', 'start');
    });
    return { svg: svg(o, MOD.length * 23 + 6), cap: a.cap || 'Landmarks of the modern era, from the first colonial shock to the postcolonial critique.' };
  };

  // ------------------------------------------------------- population
  G.ihum242Population = function () {
    var sx = scale(0, 100, 92, 300);
    var o = t(14, 14, 'Muslims as a share of world population', 'b', 'start');
    [['2010', 23.9], ['2020', 25.6]].forEach(function (r, k) {
      var y = 24 + k * 30;
      o += rect(sx(0), y, sx(100) - sx(0), 20, 'box', 4) + rect(sx(0), y, sx(r[1]) - sx(0), 20, 'solid1', 4);
      o += t(84, y + 14, r[0], 'b', 'end') + t(sx(r[1]) + 5, y + 14, r[1] + '%', 'k1', 'start');
    });
    o += t(14, 106, 'Within Islam: Sunni and Shi‘i (approx.)', 'b', 'start');
    var y = 116;
    o += rect(sx(0), y, sx(87) - sx(0), 22, 'solid1', 4) + rect(sx(87), y, sx(90) - sx(87), 22, 'fill1', 0) + rect(sx(90), y, sx(100) - sx(90), 22, 'solid2', 4);
    o += t(84, y + 15, 'all Muslims', 'b', 'end');
    o += t(sx(40), y + 15, 'Sunni 87–90%', 'w', 'middle');
    o += t(300, y + 38, 'Shi‘i 10–13%', 'k2', 'end');
    o += t(14, 178, '≈ 2.0 billion Muslims in 2020 (+347 million since 2010)', 'lb', 'start');
    return { svg: svg(o, 186), cap: 'Pew Research Center estimates (2025 for 2010–2020 shares; 2009 for the Sunni–Shi‘i range, which is approximate).' };
  };
})();
