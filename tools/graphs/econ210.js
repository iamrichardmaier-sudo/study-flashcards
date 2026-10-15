// ECON 210 · Career Prep card graphs, on the shared drawing helpers
// (window.GRAPHKIT from tools/graphs.js). Mostly diagrams rather than
// charts: process flows, anatomies and timelines. The one data chart
// (econ210Pay) uses BLS Occupational Outlook Handbook medians for May 2024.
//
// Plain ES5 on purpose (no backticks or template strings): this file is
// pasted into the page's <script> as-is.
(function () {
  var K = window.GRAPHKIT, G = window.GRAPHS;
  var svg = K.svg, t = K.t, ln = K.ln, rect = K.rect, curve = K.curve, dot = K.dot;

  function kfmt(v) { return '$' + (Math.round(v / 100) / 10) + 'k'; }

  // ------------------------------------------------------------ networking

  /** Elevator pitch: present → past → future, then the ask. */
  G.econ210Pitch = function () {
    var cols = [
      ['PRESENT', 'who you are now', 'econ junior', 'at BYU', '≈ 10 s'],
      ['PAST', '1–2 proof points', 'RA: wage', 'data in R', '≈ 25 s'],
      ['FUTURE', 'what you want', 'econ', 'consulting', '≈ 10 s']
    ];
    var o = '';
    cols.forEach(function (c, k) {
      var x = 8 + k * 106;
      o += rect(x, 14, 92, 74, k === 1 ? 'box1' : 'box', 10);
      o += t(x + 46, 32, c[0], k === 1 ? 'k1' : 'b', 'middle');
      o += t(x + 46, 47, c[1], 'lb', 'middle');
      o += t(x + 46, 66, c[2], 'b', 'middle');
      o += t(x + 46, 79, c[3], 'b', 'middle');
      o += t(x + 46, 104, c[4], 'lb', 'middle');
      if (k < 2) o += ln(x + 94, 51, x + 104, 51, 'c4', true);
    });
    o += curve([[160, 112], [160, 130]], 'c2', true);
    o += rect(30, 134, 260, 44, 'box2', 10);
    o += t(160, 152, 'End with the ask', 'k2', 'middle');
    o += t(160, 168, '“Could I ask about your path into …?”', 'lb', 'middle');
    return { svg: svg(o, 186), cap: 'About 45 seconds in all. The past is the longest part because it carries the proof; the ask tells the listener how to help.' };
  };

  /** The networking funnel (illustrative numbers). */
  G.econ210Funnel = function (a) {
    var rows = [['msg', 'Messages sent', 40], ['reply', 'Replies', 16], ['call', 'Conversations', 12],
      ['ref', 'Referrals', 4], ['int', 'Interviews', 2], ['offer', 'Offer', 1]];
    var o = '';
    rows.forEach(function (r, k) {
      var y = 10 + k * 30, w = 10 + 170 * r[2] / 40;
      var on = !a.hi || a.hi === r[0];
      o += t(104, y + 15, r[1], on ? 'b' : 'lb', 'end');
      o += rect(112, y, w, 21, on ? 'solid1' : 'solid4', 5);
      o += t(112 + w + 5, y + 15, String(r[2]), on ? 'k1' : 'lb', 'start');
    });
    return { svg: svg(o, 192), cap: 'Illustrative, not data. Each stage loses most people, so you need volume at the top, and warm, specific outreach raises every conversion rate below it.' };
  };

  /** A 20-minute informational interview as an agenda. */
  G.econ210InfoInt = function () {
    var sx = K.scale(0, 20, 130, 306);
    var rows = [['Thanks + 1-line intro', 0, 2], ['Their path', 2, 7], ['Your 3–5 questions', 7, 16],
      ['Ask who else to meet', 16, 19], ['Wrap up on time', 19, 20]];
    var o = '';
    rows.forEach(function (r, k) {
      var y = 12 + k * 28;
      o += t(124, y + 14, r[0], k === 2 ? 'b' : 'lb', 'end');
      o += rect(sx(r[1]), y, sx(r[2]) - sx(r[1]), 19, k === 2 ? 'solid1' : 'solid4', 4);
    });
    o += ln(130, 156, 306, 156, 'ax');
    [0, 5, 10, 15, 20].forEach(function (m) {
      o += ln(sx(m), 156, sx(m), 160, 'ax') + t(sx(m), 172, String(m), 'lb', 'middle');
    });
    o += t(218, 186, 'minutes', 'it', 'middle');
    o += rect(8, 156, 108, 34, 'box2', 8) + t(62, 170, 'Within 24 h:', 'k2', 'middle') + t(62, 183, 'thank-you note', 'lb', 'middle');
    return { svg: svg(o, 196), cap: 'Most of the time is theirs to talk; your researched questions fill the middle. End on time and ask who else to meet.' };
  };

  /** Follow-up cadence on a timeline. */
  G.econ210Followup = function () {
    var pts = [[30, 'Day 0', 'the call', 'up'], [88, 'Within 24 h', 'thank-you', 'down'],
      [152, '2–4 weeks', '“I acted on', 'up', 'your advice”'], [216, 'Every ~3 mo.', 'short check-in', 'down'],
      [278, 'Later', 'the ask', 'up']];
    var o = ln(18, 96, 300, 96, 'c4', true);
    pts.forEach(function (p, k) {
      o += dot(p[0], 96, k === 4 ? 'solid2' : 'solid1');
      var up = p[3] === 'up';
      var y = up ? 30 : 128;
      o += ln(p[0], up ? 70 : 102, p[0], up ? 90 : 116, 'c4 faint');
      o += t(p[0], y + 12, p[1], k === 4 ? 'k2' : 'k1', 'middle');
      o += t(p[0], y + 26, p[2], 'lb', 'middle');
      if (p[4]) o += t(p[0], y + 38, p[4], 'lb', 'middle');
    });
    o += t(160, 186, 'log every contact with a next date', 'it', 'middle');
    return { svg: svg(o, 196), cap: 'A relationship, not a transaction: give updates and value before you ask for anything. A tracker makes the dates automatic.' };
  };

  // ------------------------------------------------------------ interviews

  /** STAR with its time split. */
  G.econ210Star = function () {
    var rows = [['Situation', 10, '1–2 lines of context'], ['Task', 10, 'your goal or problem'],
      ['Action', 60, 'what YOU did, and why'], ['Result', 20, 'numbers + lesson']];
    var o = '';
    rows.forEach(function (r, k) {
      var y = 14 + k * 42, w = 2.8 * r[1];
      var a = k === 2;
      o += t(82, y + 12, r[0], a ? 'k1' : 'b', 'end');
      o += t(82, y + 25, r[1] + '% · ≈' + Math.round(r[1] * 1.2) + ' s', 'lb', 'end');
      o += rect(90, y, w, 26, a ? 'solid1' : 'solid4', 5);
      if (a) o += t(90 + w / 2, y + 17, r[2], 'w', 'middle');
      else o += t(90 + w + 6, y + 17, r[2], 'lb', 'start');
    });
    o += t(160, 192, 'seconds shown for a 2-minute answer', 'it', 'middle');
    return { svg: svg(o, 200), cap: 'A common rule of thumb: about 10 / 10 / 60 / 20. Set up fast, spend the time on your own actions, end on a measured result.' };
  };

  /** Profitability issue tree. */
  G.econ210CaseTree = function () {
    var o = '';
    o += rect(6, 78, 68, 36, 'box1', 10) + t(40, 100, 'Profit', 'k1', 'middle');
    o += rect(110, 30, 82, 32, 'box3', 10) + t(151, 50, 'Revenue', 'k3', 'middle');
    o += rect(110, 130, 82, 32, 'box2', 10) + t(151, 150, 'Costs', 'k2', 'middle');
    o += curve([[74, 92], [92, 92], [92, 46], [108, 46]], 'c4', true);
    o += curve([[92, 100], [92, 146], [108, 146]], 'c4', true);
    var leaves = [[8, 'Price', 'per unit, mix'], [44, 'Volume', 'units, share'], [108, 'Fixed', 'rent, salaries'], [146, 'Variable', 'per-unit cost']];
    leaves.forEach(function (l, k) {
      var from = k < 2 ? 46 : 146;
      o += curve([[192, from], [206, from], [206, l[0] + 15], [218, l[0] + 15]], 'c4', true);
      o += rect(220, l[0], 92, 30, 'box', 8);
      o += t(266, l[0] + 13, l[1], 'b', 'middle') + t(266, l[0] + 25, l[2], 'lb', 'middle');
    });
    o += t(160, 194, 'π = P × Q − (FC + VC × Q)', 'it', 'middle');
    return { svg: svg(o, 202), cap: 'A MECE issue tree for “profits are falling”: split until each branch is something you can measure, then ask for data branch by branch.' };
  };

  /** Market sizing as a chain of assumptions. */
  G.econ210Sizing = function () {
    var rows = [['', 'Utah population', '≈ 3.5M (assume)'], ['×', 'share who are adults', '70% → 2.45M'],
      ['×', 'buy a café drink on a given day', '10% → 245,000'], ['÷', 'drinks one shop sells a day', '250'],
      ['=', 'coffee shops', '≈ 1,000']];
    var o = '';
    rows.forEach(function (r, k) {
      var y = 8 + k * 37, last = k === 4;
      o += t(28, y + 19, r[0], 'b', 'middle');
      o += rect(44, y, 268, 28, last ? 'box1' : 'box', 8);
      o += t(54, y + 18, r[1], last ? 'k1' : 'lb', 'start');
      o += t(304, y + 18, r[2], last ? 'k1' : 'b', 'end');
    });
    return { svg: svg(o, 196), cap: 'Every number is an assumption you say out loud and round. Then sanity-check: about one shop per 3,500 people feels plausible.' };
  };

  /** How the three statements link. */
  G.econ210ThreeStatements = function () {
    var o = '';
    o += rect(6, 10, 136, 72, 'box1', 10) + t(74, 27, 'Income statement', 'k1', 'middle');
    o += t(74, 44, 'Revenue − expenses', 'lb', 'middle') + t(74, 57, '(incl. D&A, tax)', 'lb', 'middle') + t(74, 73, '= Net income', 'b', 'middle');
    o += rect(178, 10, 136, 72, 'box3', 10) + t(246, 27, 'Cash flow statement', 'k3', 'middle');
    o += t(246, 44, 'Net income', 'lb', 'middle') + t(246, 57, '+ D&A ± working cap.', 'lb', 'middle') + t(246, 73, '= Change in cash', 'b', 'middle');
    o += rect(92, 122, 136, 60, 'box2', 10) + t(160, 139, 'Balance sheet', 'k2', 'middle');
    o += t(160, 156, 'Assets =', 'lb', 'middle') + t(160, 170, 'Liabilities + Equity', 'b', 'middle');
    o += ln(144, 60, 176, 60, 'c4', true);
    o += t(160, 98, 'net income', 'lb', 'middle');
    o += curve([[246, 84], [246, 150], [230, 150]], 'c3', true) + t(252, 116, 'ending cash', 'k3', 'start');
    o += curve([[74, 84], [74, 150], [90, 150]], 'c1', true) + t(68, 116, 'retained', 'k1', 'end') + t(68, 128, 'earnings', 'k1', 'end');
    return { svg: svg(o, 190), cap: 'Net income starts the cash flow statement and adds to retained earnings; ending cash lands on the balance sheet, which must still balance.' };
  };

  /** The usual hiring stages, ending in a superday. */
  G.econ210Stages = function () {
    var st = [['Résumé', 'screen', 'box'], ['First', 'round', 'box'], ['Superday', '3–6 in a day', 'box1'], ['Offer', 'often days', 'box3']];
    var o = '';
    st.forEach(function (s, k) {
      var x = 6 + k * 79;
      o += rect(x, 40, 70, 56, s[2], 10);
      o += t(x + 35, 63, s[0], s[2] === 'box1' ? 'k1' : s[2] === 'box3' ? 'k3' : 'b', 'middle');
      o += t(x + 35, 80, s[1], 'lb', 'middle');
      if (k < 3) o += ln(x + 71, 68, x + 78, 68, 'c4', true);
    });
    o += t(43, 120, 'keywords, GPA,', 'lb', 'middle') + t(43, 133, 'experience', 'lb', 'middle');
    o += t(122, 120, 'fit + basics', 'lb', 'middle') + t(122, 133, '(phone/video)', 'lb', 'middle');
    o += t(201, 120, 'behavioral +', 'lb', 'middle') + t(201, 133, 'technical/case', 'lb', 'middle');
    o += t(280, 120, 'call, then', 'lb', 'middle') + t(280, 133, 'written offer', 'lb', 'middle');
    o += t(160, 22, 'typical banking / consulting process', 'it', 'middle');
    return { svg: svg(o, 146), cap: 'Each round filters on something different. By the superday everyone is qualified, so consistency and fit across every interviewer decide it.' };
  };

  // ------------------------------------------------------------ documents

  /** Anatomy of a strong résumé bullet. */
  G.econ210Bullet = function () {
    var o = '';
    o += t(37, 22, 'action verb', 'k1', 'middle');
    o += t(126, 22, 'what (+ tool)', 'b', 'middle');
    o += t(250, 22, 'quantified result', 'k3', 'middle');
    o += rect(6, 32, 62, 46, 'box1', 8) + t(37, 59, 'Built', 'k1', 'middle');
    o += rect(74, 32, 104, 46, 'box', 8) + t(126, 52, 'a pricing model', 'b', 'middle') + t(126, 67, 'in Excel', 'lb', 'middle');
    o += rect(184, 32, 130, 46, 'box3', 8) + t(249, 52, 'cut quote time 40%', 'k3', 'middle') + t(249, 67, 'for 12 sales reps', 'lb', 'middle');
    o += t(160, 108, 'not', 'it', 'middle');
    o += rect(40, 118, 240, 32, 'box2', 8) + t(160, 138, 'Responsible for pricing quotes', 'k2', 'middle');
    o += ln(60, 134, 260, 134, 'c2');
    o += t(160, 170, 'a duty, with no verb of yours and no result', 'lb', 'middle');
    return { svg: svg(o, 180), cap: 'Verb, then what you did and with what, then what changed, in numbers. The weak version describes the job, not your effect on it.' };
  };

  /** One-page résumé layout and where a first look lands. */
  G.econ210Resume = function () {
    var o = '';
    o += rect(14, 8, 124, 178, 'box', 4);
    o += rect(16, 10, 120, 58, 'fill1', 2);
    o += t(76, 22, 'Name · contact', 'b', 'middle');
    o += t(24, 40, 'EDUCATION', 'k1', 'start') + ln(24, 48, 128, 48, 'c4 faint') + ln(24, 56, 110, 56, 'c4 faint');
    o += t(24, 82, 'EXPERIENCE', 'b', 'start');
    for (var k = 0; k < 6; k++) o += ln(30, 92 + k * 8, k % 3 === 0 ? 126 : 118, 92 + k * 8, 'c4 faint');
    o += t(24, 152, 'LEADERSHIP', 'b', 'start') + ln(30, 160, 118, 160, 'c4 faint');
    o += t(24, 176, 'SKILLS', 'b', 'start') + ln(68, 173, 126, 173, 'c4 faint');
    o += curve([[146, 12], [152, 12], [152, 66], [146, 66]], 'c1');
    o += t(160, 30, 'Top third: what the', 'k1', 'start') + t(160, 44, 'first ~7-second look', 'k1', 'start') + t(160, 58, 'sees: school, GPA, role', 'lb', 'start');
    o += t(160, 98, 'One column, standard', 'b', 'start') + t(160, 112, 'headings, no tables or', 'lb', 'start') + t(160, 126, 'text boxes: easy for an', 'lb', 'start') + t(160, 140, 'ATS and a human to read', 'lb', 'start');
    o += t(160, 170, 'Exactly one page', 'b', 'start');
    return { svg: svg(o, 194), cap: 'Put the strongest, most relevant material where the eye lands first. Education goes on top while you are a student.' };
  };

  /** LinkedIn profile anatomy: headline and About. */
  G.econ210LinkedIn = function (a) {
    var hiH = a.hi !== 'about', hiA = a.hi !== 'headline';
    var o = '';
    o += rect(10, 8, 300, 182, 'box', 10);
    o += rect(10, 8, 300, 36, 'fill1', 10);
    o += '<circle cx="48" cy="48" r="20" class="box1"/>';
    o += t(76, 62, 'Jane Doe', 'b', 'start');
    o += rect(22, 72, 276, 36, hiH ? 'box1' : 'box', 6);
    o += t(30, 87, 'Economics @ BYU | R, SQL, Stata |', hiH ? 'k1' : 'lb', 'start');
    o += t(30, 102, 'Seeking 2027 econ consulting internships', hiH ? 'k1' : 'lb', 'start');
    o += t(22, 124, 'About', 'b', 'start');
    o += rect(22, 129, 276, 36, hiA ? 'box3' : 'box', 6);
    o += t(30, 143, 'I like turning messy data into answers.', hiA ? 'k3' : 'lb', 'start');
    o += t(30, 158, 'As an RA I cleaned 2M wage records…', hiA ? 'k3' : 'lb', 'start');
    o += ln(22, 172, 298, 172, 'c4 dash faint');
    o += t(298, 184, '…see more', 'lb', 'end');
    o += t(22, 184, 'only these lines show first', 'it', 'start');
    return { svg: svg(o, 198), cap: 'The headline travels with you into search results, comments and invitations; the About section has two or three lines to earn the click.' };
  };

  // ------------------------------------------------------------ paths

  /** Recruiting timeline by path (typical; firms vary). */
  G.econ210Timeline = function (a) {
    var cols = ['F', 'Sp', 'F', 'Sp', 'Su', 'F', 'Sp'];
    var x0 = 96, cw = 30;
    var cx = function (c) { return x0 + c * cw; };
    // [id, label, internship recruiting [from,to], full-time recruiting [from,to] or null]
    var rows = [['ib', 'Inv. banking', [1, 2.6], [5, 6]], ['mgmt', 'Mgmt consulting', [2, 3], [5, 6]],
      ['econ', 'Econ consulting', [2, 3.4], [5, 6]], ['data', 'Data / tech', [2, 3.6], [5, 6.6]],
      ['gov', 'Gov / Fed RA', [2.5, 3.8], [5.3, 7]]];
    var o = '';
    o += t(cx(1), 14, 'Sophomore', 'b', 'middle') + t(cx(3), 14, 'Junior', 'b', 'middle') + t(cx(5.5), 14, 'Senior', 'b', 'middle');
    cols.forEach(function (c, k) { o += t(cx(k) + cw / 2, 28, c, 'lb', 'middle'); });
    [2, 4, 5].forEach(function (k) { o += ln(cx(k), 20, cx(k), 172, 'c4 dash faint'); });
    rows.forEach(function (r, k) {
      var y = 38 + k * 26, on = !a.hi || a.hi === r[0];
      o += t(x0 - 6, y + 13, r[1], on ? 'b' : 'lb', 'end');
      o += rect(cx(r[2][0]), y + 2, (r[2][1] - r[2][0]) * cw, 14, on ? 'solid1' : 'solid4', 4);
      o += rect(cx(4) + 6, y + 2, cw - 12, 14, on ? 'solid3' : 'solid4', 4);
      o += rect(cx(r[3][0]), y + 2, (r[3][1] - r[3][0]) * cw, 14, on ? 'solid2' : 'fill2', 4);
    });
    o += rect(8, 176, 10, 10, 'solid1', 2) + t(22, 185, 'internship recruiting', 'lb', 'start');
    o += rect(128, 176, 10, 10, 'solid3', 2) + t(142, 185, 'internship', 'lb', 'start');
    o += rect(198, 176, 10, 10, 'solid2', 2) + t(212, 185, 'full-time recruiting', 'lb', 'start');
    return { svg: svg(o, 194), cap: 'Typical recent US timing for junior-summer internships; it shifts every year and by firm, so check each firm’s dates. Banking runs earliest.' };
  };

  /** Where an economics degree leads, with the skill each path screens on. */
  G.econ210Paths = function (a) {
    var rows = [['mgmt', 'Management consulting', 'case interviews, Excel'], ['econ', 'Economic consulting', 'econometrics, Stata/R'],
      ['ib', 'Investment banking', 'accounting, modeling'], ['data', 'Data / analytics', 'SQL, Python, stats'],
      ['gov', 'Government & policy', 'writing, data, patience'], ['phd', 'Econ PhD (often via RA)', 'math, research, letters'],
      ['law', 'Law school', 'LSAT, GPA, writing']];
    var o = rect(6, 90, 64, 40, 'box1', 10) + t(38, 108, 'Econ', 'k1', 'middle') + t(38, 122, 'degree', 'k1', 'middle');
    rows.forEach(function (r, k) {
      var y = 4 + k * 31, on = !a.hi || a.hi === r[0];
      o += curve([[70, 110], [88, 110], [88, y + 14], [104, y + 14]], on && a.hi ? 'c1' : 'c4 faint');
      o += rect(106, y, 208, 28, on && a.hi ? 'box1' : 'box', 7);
      o += t(114, y + 12, r[1], on ? 'b' : 'lb', 'start');
      o += t(114, y + 24, r[2], 'lb', 'start');
    });
    return { svg: svg(o, 222), cap: 'Common first destinations for econ majors and the skill each one screens on hardest. Paths cross: many RAs go to PhDs, many analysts to MBAs or law.' };
  };

  /** BLS median pay, May 2024. */
  G.econ210Pay = function (a) {
    var rows = [['law', 'Lawyers', 151160], ['econ', 'Economists', 115440], ['data', 'Data scientists', 112590],
      ['fin', 'Financial analysts', 101350], ['mgmt', 'Management analysts', 101190], ['all', 'All occupations', 49500]];
    var o = '';
    var sx = K.scale(0, 160000, 126, 274);
    rows.forEach(function (r, k) {
      var y = 10 + k * 29, on = !a.hi || a.hi === r[0] || r[0] === 'all';
      o += t(120, y + 14, r[1], on && (r[0] !== 'all' || !a.hi) ? 'b' : 'lb', 'end');
      o += rect(sx(0), y, sx(r[2]) - sx(0), 20, r[0] === 'all' ? 'solid4' : on ? 'solid1' : 'solid4', 4);
      o += t(sx(r[2]) + 4, y + 14, kfmt(r[2]), on ? 'k1' : 'lb', 'start');
    });
    return { svg: svg(o, 188), cap: 'Median annual wage, May 2024 (BLS Occupational Outlook Handbook). Medians for all experience levels, not starting pay; most of these roles need more than a bachelor’s to reach the median.' };
  };

  // ------------------------------------------------------------ offers

  /** Two offers' first- and second-year total compensation, stacked. */
  G.econ210Offer = function () {
    // A: $75,000 base, 3% match. B: $70,000 base, $10,000 signing bonus (year 1 only), 6% match.
    var bars = [['A', 1, 75000, 0, 2250], ['B', 1, 70000, 10000, 4200], ['A', 2, 75000, 0, 2250], ['B', 2, 70000, 0, 4200]];
    var sy = K.scale(0, 90000, 160, 30);
    var o = '';
    o += rect(14, 6, 10, 10, 'solid1', 2) + t(28, 15, 'base', 'lb', 'start');
    o += rect(70, 6, 10, 10, 'solid2', 2) + t(84, 15, 'signing bonus', 'lb', 'start');
    o += rect(166, 6, 10, 10, 'solid3', 2) + t(180, 15, '401(k) match', 'lb', 'start');
    bars.forEach(function (b, k) {
      var x = 26 + k * 72 + (k > 1 ? 14 : 0), w = 48, y = 160;
      [[b[2], 'solid1'], [b[3], 'solid2'], [b[4], 'solid3']].forEach(function (p) {
        if (!p[0]) return;
        var h = sy(0) - sy(p[0]);
        y -= h;
        o += rect(x, y, w, h, p[1], 0);
      });
      var tot = b[2] + b[3] + b[4];
      o += t(x + w / 2, y - 5, kfmt(tot), 'b', 'middle');
      o += t(x + w / 2, 174, 'Offer ' + b[0], 'b', 'middle');
    });
    o += t(86, 190, 'year 1', 'it', 'middle') + t(244, 190, 'year 2', 'it', 'middle');
    o += ln(160, 40, 160, 180, 'c4 dash faint');
    return { svg: svg(o, 198), cap: 'B wins year 1 by $6,950 because of the one-time signing bonus; from year 2, A’s higher base wins by $3,050 a year (before raises).' };
  };

  /** Handling an exploding offer. */
  G.econ210Deadline = function () {
    var o = '';
    o += rect(80, 6, 160, 34, 'box2', 10) + t(160, 21, 'Offer: decide in 48 h', 'k2', 'middle') + t(160, 34, 'while final rounds elsewhere', 'lb', 'middle');
    o += ln(160, 40, 160, 54, 'c4', true);
    o += rect(30, 56, 260, 40, 'box1', 10) + t(160, 72, 'Thank them, say you’re excited, and', 'k1', 'middle') + t(160, 87, 'ask for a specific, short extension', 'lb', 'middle');
    o += curve([[110, 96], [110, 108], [82, 108], [82, 118]], 'c3', true);
    o += curve([[210, 96], [210, 108], [238, 108], [238, 118]], 'c2', true);
    o += rect(8, 120, 148, 60, 'box3', 10) + t(82, 136, 'Granted', 'k3', 'middle') + t(82, 151, 'tell the other firm;', 'lb', 'middle') + t(82, 164, 'ask if they can speed up', 'lb', 'middle');
    o += rect(164, 120, 148, 60, 'box2', 10) + t(238, 136, 'Refused', 'k2', 'middle') + t(238, 151, 'decide on what you know;', 'lb', 'middle') + t(238, 164, 'never accept, then renege', 'lb', 'middle');
    return { svg: svg(o, 188), cap: 'Asking is normal and rarely costs the offer. What does cost you is accepting and backing out later.' };
  };

  /** Negotiating: base is fixed by a band, the signing bonus moves. */
  G.econ210Negotiate = function () {
    var sy = K.scale(0, 90000, 160, 26);
    var o = '';
    o += rect(14, 6, 10, 10, 'solid1', 2) + t(28, 15, 'base', 'lb', 'start');
    o += rect(70, 6, 10, 10, 'solid2', 2) + t(84, 15, 'signing bonus', 'lb', 'start');
    o += ln(186, 11, 206, 11, 'c4 dash') + t(210, 15, 'other offer', 'lb', 'start');
    var bars = [['Initial', 72000, 0], ['After asking', 72000, 5000]];
    bars.forEach(function (b, k) {
      var x = 60 + k * 120, w = 64;
      o += rect(x, sy(b[1]), w, sy(0) - sy(b[1]), 'solid1', 0);
      if (b[2]) o += rect(x, sy(b[1] + b[2]), w, sy(b[1]) - sy(b[1] + b[2]), 'solid2', 0);
      if (b[2]) o += t(x + w / 2, sy(b[1]) + 18, kfmt(b[1]), 'w', 'middle') + t(x + w / 2, sy(b[1]) + 34, '+ ' + kfmt(b[2]), 'w', 'middle');
      o += t(x + w / 2, 152, '= ' + kfmt(b[1] + b[2]), 'w', 'middle');
      o += t(x + w / 2, 176, b[0], 'b', 'middle');
    });
    o += ln(40, sy(76000), 300, sy(76000), 'c4 dash');
    o += t(300, sy(76000) - 5, '$76k', 'lb', 'end');
    return { svg: svg(o, 186), cap: 'The base sat at the top of its band, so the firm moved the signing bonus instead: year-one pay went from $72,000 to $77,000.' };
  };
})();
