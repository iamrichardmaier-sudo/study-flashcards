// ECON 210 · Career Prep. Cards, practice questions and the four career
// tools from research/econ210-features.md: LinkedIn checklist & scorer,
// networking tracker, STAR story builder, résumé bullet checker.
(function () {
  "use strict";
  var S = window.Study, h = S.h;

  // ------------------------------------------------------------ cards

  var groups = [
    { id: "net", name: "Networking" },
    { id: "int", name: "Interviews" },
    { id: "doc", name: "Résumé & LinkedIn" },
    { id: "path", name: "Career paths" },
    { id: "offer", name: "Offers" },
  ];

  var cards = [
    { id: "elevator", group: "net", term: "Elevator pitch",
      def: "A 30–60 second answer to “tell me about yourself”: who you are now, what you’ve done that matters, and what you want next.",
      more: "Present → past → future. End on the specific thing you’re looking for, so the listener knows how to help." },
    { id: "infoint", group: "net", term: "Informational interview",
      def: "A short conversation (often 15–30 minutes) where you ask a professional about their work and path. You are gathering information, not asking for a job.",
      more: "Come with 3–5 researched questions, keep to the time you asked for, and send a thank-you within 24 hours." },
    { id: "warmintro", group: "net", term: "Warm introduction",
      def: "Being introduced to a contact by someone they already know. Far more likely to get a reply than a cold message.",
      more: "Alumni networks (BYU’s included) make “warm-ish” outreach possible: the shared school is the connection." },
    { id: "followup", group: "net", term: "Follow-up cadence",
      def: "Thank-you within 24 hours; a short update when you act on their advice; a check-in every few months so the relationship stays warm.",
      more: "Log every contact with a follow-up date, which is what the Networking tracker tool is for." },
    { id: "coldemail", group: "net", term: "Cold outreach message",
      def: "A brief, specific first message: who you are, the shared link (school, club, talk), one concrete ask (a 20-minute call), and easy scheduling.",
      more: "Keep it under ~120 words. Ask for advice, never for a job, in the first message." },

    { id: "behavioral", group: "int", term: "Behavioral interview",
      def: "Questions about how you acted in past situations (“Tell me about a time…”), on the theory that past behavior predicts future behavior.",
      more: "Answer with a STAR story. Have 6–8 stories ready that can flex across competencies." },
    { id: "star", group: "int", term: "STAR method",
      def: "<b>S</b>ituation, <b>T</b>ask, <b>A</b>ction, <b>R</b>esult: a structure for behavioral answers. Most of the time goes on Action, and the Result is quantified where possible.",
      more: "Say “I”, not “we”, for the actions. The interviewer is hiring you, not your team." },
    { id: "casei", group: "int", term: "Case interview",
      def: "A business problem worked through live with the interviewer (profitability, market entry, pricing). Standard in consulting.",
      more: "They are testing structure, math under pressure, and communication more than the “right” answer." },
    { id: "sizing", group: "int", term: "Market sizing (guesstimate)",
      def: "Estimating a quantity from first principles, e.g. “How many coffee shops are in Utah?” by breaking it into population × usage × capacity.",
      more: "State your assumptions out loud, round aggressively, and sanity-check the final number." },
    { id: "technical", group: "int", term: "Technical interview (finance)",
      def: "Questions testing accounting and valuation knowledge: walk me through the three statements, a DCF, why EV and not equity value, etc.",
      more: "A DCF values a firm as the present value of its projected free cash flows plus a terminal value, discounted at the WACC." },
    { id: "superday", group: "int", term: "Superday",
      def: "A final-round day of back-to-back interviews (often 3–6) at a bank or firm, with the hiring decision made soon after." },
    { id: "whyus", group: "int", term: "“Why this firm?”",
      def: "An answer that names specifics only this firm has: people you’ve talked to, a practice area, a deal or project, its culture. It shows you did the work.",
      more: "Name-drop the people from your informational interviews (with their permission)." },

    { id: "atsresume", group: "doc", term: "ATS (applicant tracking system)",
      def: "Software that stores and filters applications. Simple formatting and the job posting’s own keywords help a résumé get through.",
      more: "Avoid text in images, tables or headers/footers for key information." },
    { id: "bullet", group: "doc", term: "Strong résumé bullet",
      def: "Action verb + what you did + a quantified result: “Built a pricing model in Excel that cut quote time 40% for 12 sales reps.”",
      more: "Not “Responsible for…”, which describes the job rather than what you achieved." },
    { id: "liheadline", group: "doc", term: "LinkedIn headline",
      def: "The line under your name, which shows in search results and comments. Better as a target plus value than just “Student at BYU”.",
      more: "e.g. “Economics @ BYU | Data analysis (R, SQL) | Seeking 2027 consulting internships”." },
    { id: "liabout", group: "doc", term: "LinkedIn About section",
      def: "A short first-person story: what drives you, what you’re good at (with proof), and what you’re looking for. The first 2–3 lines show before “see more”." },
    { id: "onepage", group: "doc", term: "One-page résumé",
      def: "The norm for undergraduates and early-career roles in the US. Recruiters often skim a résumé in seconds, so the most relevant material goes at the top.",
      more: "Education first while in school; GPA if strong; relevant coursework and skills sections are fair game." },

    { id: "mgmtconsult", group: "path", term: "Management consulting",
      def: "Advising companies on strategy and operations in project teams. Entry role: business analyst / associate consultant. Screened with case interviews.",
      more: "Recruiting for junior-summer internships typically starts early in junior year or before. Check each firm’s timeline." },
    { id: "econconsult", group: "path", term: "Economic consulting",
      def: "Applying economics and econometrics to litigation, antitrust and regulatory questions (damages, merger effects). Entry role: analyst.",
      more: "Values Stata/R/Python, econometrics (ECON 388) and clear writing." },
    { id: "ib", group: "path", term: "Investment banking",
      def: "Advising on M&A and raising capital. Entry role: analyst. Heavy financial modelling; recruiting for junior-year summer internships runs very early.",
      more: "Many full-time offers come as return offers from the junior-year internship." },
    { id: "datasci", group: "path", term: "Data science / analytics",
      def: "Using statistics and programming to answer business questions. Entry roles: data analyst, business analyst, associate data scientist.",
      more: "Build a portfolio: a GitHub repo or a write-up of a real project with real data beats a list of courses." },
    { id: "govpolicy", group: "path", term: "Government & policy",
      def: "Economist and analyst roles at agencies, central banks, think tanks and legislative offices. Hiring is often slower and more formal (e.g. USAJOBS).",
      more: "Research-assistant roles at the Fed or think tanks are a common bridge to a PhD." },
    { id: "econphd", group: "path", term: "Econ PhD preparation",
      def: "Strong math (multivariable calculus, linear algebra, real analysis), research experience as an RA, and letters from faculty who know your research work.",
      more: "Many applicants spend 1–2 years as a full-time RA first." },
    { id: "lawschool", group: "path", term: "Law school route",
      def: "Admission weighs the LSAT (or GRE at some schools) and GPA heavily, plus a personal statement and letters. Econ is a common pre-law major." },

    { id: "returnoffer", group: "offer", term: "Return offer",
      def: "A full-time job offer made to a summer intern at the end of the internship. The main pipeline into many banking and consulting jobs." },
    { id: "exploding", group: "offer", term: "Exploding offer",
      def: "An offer with a short deadline to accept. You can politely ask for more time, especially if you are mid-process elsewhere." },
    { id: "totalcomp", group: "offer", term: "Total compensation",
      def: "Base salary + signing bonus + performance bonus + benefits (retirement match, health) + equity. Compare offers on the total, not just base.",
      more: "Also weigh learning, exit options, location and cost of living." },
    { id: "negotiate", group: "offer", term: "Negotiating an offer",
      def: "Ask respectfully, anchored on facts (a competing offer, market data). Signing bonus, start date and relocation are often more flexible than base salary for new grads." },
  ];

  // --------------------------------------------------------- practice

  var practice = [
    { id: "p1", group: "int", q: "In a STAR answer, which part should get the most time?",
      options: [
        { t: "Action", right: true, why: "What <i>you</i> did is what the interviewer is assessing." },
        { t: "Situation", why: "Context should be brief, one or two sentences. Long set-ups crowd out the substance." },
        { t: "Task", why: "The task frames the challenge. It isn’t evidence of your skill." },
        { t: "Result", why: "Results matter and should be quantified, but they follow from the actions you explain." },
      ], explain: "A common rule of thumb: about 10% situation, 10% task, 60% action, 20% result." },
    { id: "p2", group: "net", q: "You heard an alumna speak in ECON 210 and want to reach out. Best first message?",
      options: [
        { t: "A short note mentioning her talk, one thing you learned, and a request for a 20-minute call about her path", right: true, why: "Specific, brief, and it asks for advice rather than a job." },
        { t: "Your résumé attached with a request for a referral", why: "Asking for a referral before any relationship exists is a big ask and usually gets ignored." },
        { t: "A connection request with no note", why: "It misses the chance to remind her where you met and why you’re reaching out." },
        { t: "A long message describing your whole background", why: "Busy professionals skim. Keep it under ~120 words with one clear ask." },
      ] },
    { id: "p3", group: "doc", q: "Which résumé bullet is strongest?",
      options: [
        { t: "Analyzed 3 years of sales data in R, identifying a pricing change that raised margin 4%", right: true, why: "Action verb, tool, and a quantified result." },
        { t: "Responsible for analyzing sales data", why: "“Responsible for” describes the job, not what you accomplished." },
        { t: "Helped the team with various data projects", why: "“Helped” and “various” are vague. What did you do, and what changed?" },
        { t: "I worked hard on data analysis and learned a lot", why: "No first person on résumés, and effort isn’t a result." },
      ] },
    { id: "p4", group: "int", q: "“How many gas stations are in the U.S.?” What is the interviewer mainly testing?",
      options: [
        { t: "Your structure and how you reason through assumptions", right: true, why: "Market sizing is about a clear, logical breakdown and sanity checks." },
        { t: "Whether you know the exact number", why: "Nobody expects the exact figure. A reasonable, well-structured estimate wins." },
        { t: "Your knowledge of the energy industry", why: "Industry knowledge helps, but the question is designed to be answerable from first principles." },
        { t: "How quickly you can give a number", why: "Rushing without structure is a red flag. Take a moment to lay out your approach." },
      ] },
    { id: "p5", group: "offer", q: "You get an exploding offer due in 48 hours while you are in final rounds elsewhere. Best move?",
      options: [
        { t: "Thank them, explain the situation honestly, and ask whether a short extension is possible", right: true, why: "Firms often grant reasonable extensions. Honesty preserves the relationship." },
        { t: "Accept now and back out later if the other offer comes", why: "Reneging damages your reputation and can burn bridges with the firm and your school’s career center." },
        { t: "Ignore the deadline", why: "The offer may simply be withdrawn." },
        { t: "Tell the other firm you have an offer and demand a decision in 24 hours", why: "You can let them know and ask whether they can speed up, but demanding a decision rarely works." },
      ] },
    { id: "p6", group: "doc", q: "What’s the most valuable change to a LinkedIn headline that reads “Student at Brigham Young University”?",
      options: [
        { t: "Add your target field and a skill or two, e.g. “Economics @ BYU | SQL, R | Aspiring economic consultant”", right: true, why: "The headline shows in search and on every comment, so tell people what you do and want." },
        { t: "Add emojis to stand out", why: "They can read as unprofessional in finance and consulting and don’t add information." },
        { t: "Leave it. It’s accurate", why: "Accurate, but it says nothing about your interests or skills, so you’re invisible in recruiter searches." },
        { t: "List every course you’ve taken", why: "Too long to read. The headline is prime space for focus, not a transcript." },
      ] },
    { id: "p7", group: "path", q: "Which entry path most directly uses ECON 388-style econometrics on litigation and antitrust questions?",
      options: [
        { t: "Economic consulting", right: true, why: "Damages estimates, merger simulations and regression analysis are the bread and butter." },
        { t: "Investment banking", why: "IB is mostly corporate finance and modelling (DCF, comps, LBO), not econometrics." },
        { t: "Management consulting", why: "More strategy and operations. Analysis is often Excel-based and less econometric." },
        { t: "Law school", why: "Lawyers use economic evidence, but economic consultants are the ones who produce it." },
      ] },
    { id: "p8", group: "int", q: "Asked “What’s your greatest weakness?”, the best answer…",
      options: [
        { t: "Names a real, non-fatal weakness and the concrete steps you’re taking to improve it", right: true, why: "Shows self-awareness and growth." },
        { t: "“I’m a perfectionist”", why: "A cliché humble-brag that interviewers have heard countless times." },
        { t: "“I don’t really have one”", why: "It reads as a lack of self-awareness." },
        { t: "Names a core skill the job requires", why: "Choose something real but not central to the role." },
      ] },
    { id: "p9", group: "net", q: "When should you send a thank-you after an informational interview?",
      options: [
        { t: "Within 24 hours", right: true, why: "While the conversation is fresh. Mention something specific you learned." },
        { t: "After you’ve applied to their firm", why: "Waiting makes the thanks feel transactional." },
        { t: "Only if they offered to refer you", why: "Thank everyone who gives you their time." },
        { t: "At the end of the semester, in one batch", why: "Too late. The person may not remember the conversation." },
      ] },
    { id: "p10", group: "offer", q: "Two offers: A pays $5k more base salary; B has a $10k signing bonus and a 6% 401(k) match vs. A’s 3%. For a first-year comparison you should…",
      options: [
        { t: "Compare total compensation, including the bonus and the match, then weigh learning and exit options", right: true, why: "Base alone ignores real money (and non-monetary factors)." },
        { t: "Pick A, since base salary is all that matters", why: "Base matters most long-run, but a signing bonus and a bigger match are real money." },
        { t: "Pick B, since signing bonuses always outweigh base", why: "A signing bonus is one-time, while base compounds through raises." },
        { t: "Ignore the money and pick by firm prestige", why: "Prestige is one factor among several, not the whole decision." },
      ] },
  ];

  // ------------------------------------------------------------ tools

  // 1. LinkedIn checklist & scorer
  var LI = [
    { sec: "Photo & banner", items: [
      ["photo", 8, "Professional headshot", "Face fills ~60% of the frame, plain background, you look approachable."],
      ["banner", 3, "Custom background banner", "Campus, city skyline, or something tied to your field, not the default."] ] },
    { sec: "Headline", items: [
      ["hlfield", 8, "Names your field or target role", "e.g. “Economics @ BYU | Aspiring data analyst”."],
      ["hlskill", 5, "Includes 1–3 concrete skills", "R, SQL, Excel modelling, Spanish…"] ] },
    { sec: "About", items: [
      ["about", 8, "About section written (3–5 short paragraphs)", "First person, in your own voice."],
      ["abouthook", 5, "First 2 lines hook the reader", "Only ~2 lines show before “see more”."],
      ["aboutask", 4, "Says what you’re looking for", "Internship type, industry, timing."] ] },
    { sec: "Experience", items: [
      ["exp", 8, "Every role listed with dates", "Jobs, research assistantships, TA roles, mission service, leadership."],
      ["expbullets", 8, "2–4 bullets per role with results", "Same style as the résumé: verb + action + number."],
      ["media", 3, "A project, paper or presentation attached", "Featured section or media on a role."] ] },
    { sec: "Education & skills", items: [
      ["edu", 5, "Education with major, expected graduation and relevant courses", "ECON 378, 380, 381, 388…"],
      ["skills", 6, "5+ skills listed, top 3 pinned", "Pin the skills that match the jobs you want."],
      ["endorse", 3, "At least one recommendation or endorsements", "Ask a professor, TA supervisor or manager."] ] },
    { sec: "Settings & activity", items: [
      ["url", 5, "Custom URL (linkedin.com/in/your-name)", "Put it on your résumé."],
      ["open", 3, "“Open to work” preferences set (recruiters only if you prefer)", "Lets recruiters filter for you."],
      ["active", 2, "Posted or commented in the last month", "Light, thoughtful activity keeps you visible."] ] },
  ];

  function linkedinTool(el) {
    var st = S.load("linkedin", {});
    var scoreEl = h("div", { class: "big" }), barEl = h("span"), tipEl = h("p", { class: "dim small", style: "margin:0" });
    var secBars = [];
    var total = LI.reduce(function (a, s) { return a + s.items.reduce(function (b, i) { return b + i[1]; }, 0); }, 0);
    function update() {
      var got = 0, missing = [];
      LI.forEach(function (s, k) {
        var sg = 0, sw = 0;
        s.items.forEach(function (i) { sw += i[1]; if (st[i[0]]) sg += i[1]; else missing.push(i); });
        got += sg;
        secBars[k].style.width = (100 * sg / sw) + "%";
      });
      var pct = Math.round(100 * got / total);
      scoreEl.textContent = pct + " / 100";
      barEl.style.width = pct + "%";
      missing.sort(function (a, b) { return b[1] - a[1]; });
      tipEl.innerHTML = missing.length ? "<b>Biggest win next:</b> " + S.esc(missing[0][2]) + " (+" + missing[0][1] + ")." : "Profile complete. Keep it current each semester.";
      S.save("linkedin", st);
    }
    var hl = h("input", { type: "text", placeholder: "Paste your headline", value: S.load("headline", "") });
    var hlOut = h("div", { class: "stack", style: "gap:4px" });
    function checkHeadline() {
      var t = hl.value.trim(); S.save("headline", t);
      var checks = [
        [t.length > 0 && t.length <= 220, "Fits in 220 characters (" + t.length + ")"],
        [!/^\s*student at [^|•·]*$/i.test(t) && t.length > 0, "More than just “Student at …”"],
        [/(econ|analyst|consult|financ|data|policy|research|bank|law|market|strategy|product)/i.test(t), "Names a field or target role"],
        [/[|•·,]/.test(t), "Separates ideas (| or ·) so it scans"],
        [/\b(R|SQL|Python|Stata|Excel|Tableau|Spanish|Portuguese|Arabic|modeling|modelling|VBA)\b/.test(t), "Mentions a concrete skill"],
      ];
      hlOut.innerHTML = "";
      checks.forEach(function (c) { hlOut.appendChild(h("div", { class: "row small" }, h("span", { class: "pill " + (c[0] ? "good" : "bad") }, c[0] ? "✓" : "✗"), c[1])); });
    }
    hl.addEventListener("input", checkHeadline);
    var left = h("div", { class: "panel" },
      h("div", { class: "card pad stack" }, h("p", { class: "sec" }, "Profile score"), scoreEl, h("div", { class: "meter" }, barEl), tipEl),
      h("div", { class: "card pad stack" }, h("p", { class: "sec" }, "Headline tester"), hl, hlOut));
    var right = h("div", { class: "card pad stack" }, LI.map(function (s, k) {
      var b = h("span");
      secBars[k] = b;
      return h("div", null,
        h("div", { class: "row spread" }, h("p", { class: "sec" }, s.sec), h("div", { class: "meter", style: "width:90px" }, b)),
        s.items.map(function (i) {
          var cb = h("input", { type: "checkbox", checked: !!st[i[0]], onchange: function () { st[i[0]] = cb.checked; update(); } });
          return h("label", { class: "check" }, cb, h("span", null, i[2] + " ", h("span", { class: "dim small" }, "+" + i[1]), h("small", null, i[3])));
        }));
    }));
    el.appendChild(h("div", { class: "tool-body" }, left, right));
    update(); checkHeadline();
  }

  // 2. Networking contact tracker
  function networkTool(el) {
    var list = S.load("contacts", []);
    var editing = null;
    var today = function () { return new Date().toISOString().slice(0, 10); };
    var plus = function (days) { var d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };
    var F = {
      name: h("input", { type: "text", placeholder: "Jane Smith" }),
      firm: h("input", { type: "text", placeholder: "Firm" }),
      role: h("input", { type: "text", placeholder: "Role" }),
      how: h("select", null, ["Alumni talk (ECON 210)", "Coffee chat", "Career fair", "Class / professor", "LinkedIn", "Referral", "Other"].map(function (o) { return h("option", null, o); })),
      met: h("input", { type: "date" }),
      next: h("input", { type: "date" }),
      notes: h("textarea", { placeholder: "What you talked about, advice, names they mentioned, what you promised to send…" }),
    };
    var saveBtn = h("button", { type: "button", class: "btn solid", onclick: commit }, "Save contact");
    var listEl = h("div", { class: "list" });
    var filter = h("input", { type: "search", placeholder: "Search contacts", oninput: render });
    function reset() {
      editing = null;
      F.name.value = F.firm.value = F.role.value = F.notes.value = "";
      F.met.value = today(); F.next.value = plus(14);
      saveBtn.textContent = "Save contact";
    }
    function commit() {
      if (!F.name.value.trim()) { F.name.focus(); return; }
      var c = { id: editing || String(Date.now()), name: F.name.value.trim(), firm: F.firm.value.trim(), role: F.role.value.trim(),
        how: F.how.value, met: F.met.value, next: F.next.value, notes: F.notes.value.trim() };
      list = list.filter(function (x) { return x.id !== c.id; }).concat([c]);
      S.save("contacts", list); reset(); render();
    }
    function render() {
      var q = filter.value.toLowerCase(), t = today();
      listEl.innerHTML = "";
      var shown = list.filter(function (c) { return !q || JSON.stringify(c).toLowerCase().indexOf(q) >= 0; })
        .sort(function (a, b) { return (a.next || "9999").localeCompare(b.next || "9999"); });
      if (!shown.length) listEl.appendChild(h("p", { class: "dim small" }, list.length ? "No matches." : "No contacts yet. Log the next alumni speaker you hear."));
      shown.forEach(function (c) {
        var over = c.next && c.next <= t;
        listEl.appendChild(h("div", { class: "item" + (over ? " overdue" : "") },
          h("div", { class: "row spread" }, h("span", { class: "t" }, c.name), over ? h("span", { class: "pill bad" }, "follow up now") :
            c.next ? h("span", { class: "pill ok" }, "follow up " + c.next) : null),
          h("span", { class: "dim small" }, [c.role, c.firm].filter(Boolean).join(" · ") + " · " + c.how + (c.met ? " · met " + c.met : "")),
          c.notes ? h("span", null, c.notes) : null,
          h("div", { class: "row" },
            h("button", { type: "button", class: "btn", onclick: function () {
              c.next = plus(90); S.save("contacts", list); render();
            } }, "Followed up → next in 90 days"),
            h("button", { type: "button", class: "btn", onclick: function () {
              editing = c.id; ["name", "firm", "role", "how", "met", "next", "notes"].forEach(function (k) { F[k].value = c[k] || ""; });
              saveBtn.textContent = "Update contact"; F.name.focus();
            } }, "Edit"),
            h("button", { type: "button", class: "btn danger", onclick: function () {
              if (!confirm("Delete " + c.name + "?")) return;
              list = list.filter(function (x) { return x !== c; }); S.save("contacts", list); render();
            } }, "Delete"))));
      });
    }
    function csv() {
      var cols = ["name", "firm", "role", "how", "met", "next", "notes"];
      var rows = [cols.join(",")].concat(list.map(function (c) {
        return cols.map(function (k) { return '"' + String(c[k] || "").replace(/"/g, '""') + '"'; }).join(",");
      }));
      var a = h("a", { href: URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" })), download: "econ210-contacts.csv" });
      document.body.appendChild(a); a.click(); a.remove();
    }
    var form = h("div", { class: "card pad stack" }, h("p", { class: "sec" }, "Log a contact"),
      h("div", { class: "fgrid" },
        h("label", { class: "f" }, "Name", F.name), h("label", { class: "f" }, "Firm", F.firm), h("label", { class: "f" }, "Role", F.role),
        h("label", { class: "f" }, "How you met", F.how), h("label", { class: "f" }, "Date met", F.met), h("label", { class: "f" }, "Follow up on", F.next)),
      h("label", { class: "f" }, "Notes", F.notes),
      h("div", { class: "row" }, saveBtn, h("button", { type: "button", class: "btn", onclick: reset }, "Clear")));
    el.appendChild(h("div", { class: "tool-body" }, form,
      h("div", { class: "panel" }, h("div", { class: "row" }, filter, h("button", { type: "button", class: "btn", onclick: csv }, "Export CSV")), listEl)));
    reset(); render();
  }

  // 3. STAR story builder
  var COMPETENCIES = [
    ["leadership", "Leadership", "Tell me about a time you led a group toward a goal."],
    ["teamwork", "Teamwork", "Tell me about a time you worked with a difficult teammate."],
    ["analytical", "Analytical problem-solving", "Tell me about a time you used data to solve a problem."],
    ["failure", "Failure", "Tell me about a time you failed. What did you learn?"],
    ["initiative", "Initiative", "Tell me about a time you went beyond what was asked."],
    ["conflict", "Conflict / persuasion", "Tell me about a time you changed someone’s mind."],
    ["pressure", "Pressure / deadlines", "Tell me about a time you had too much to do and too little time."],
  ];
  var STAR = [
    ["s", "Situation", "Where and when? One or two sentences of context."],
    ["t", "Task", "What was your responsibility or the challenge?"],
    ["a", "Action", "What did YOU do, step by step? Use “I”. This is most of the answer."],
    ["r", "Result", "What happened? Quantify it. What did you learn?"],
  ];
  function starTool(el) {
    var stories = S.load("stories", []);
    var cur = null;
    var comp = h("select", null, COMPETENCIES.map(function (c) { return h("option", { value: c[0] }, c[1]); }));
    var title = h("input", { type: "text", placeholder: "Short title, e.g. “Fixed the club budget”" });
    var prompt = h("p", { class: "dim small", style: "margin:0" });
    var boxes = {}, counts = {};
    var checks = h("div", { class: "stack", style: "gap:4px" });
    var list = h("div", { class: "list" });
    comp.addEventListener("change", function () { prompt.textContent = "Typical question: " + COMPETENCIES.filter(function (c) { return c[0] === comp.value; })[0][2]; });
    function words(s) { return (s.trim().match(/\S+/g) || []).length; }
    function analyze() {
      var all = 0;
      STAR.forEach(function (p) { var n = words(boxes[p[0]].value); all += n; counts[p[0]].textContent = n + " words"; });
      var a = boxes.a.value, r = boxes.r.value;
      var res = [
        [all >= 120 && all <= 330, "Length fits a 1.5–2.5 minute answer (" + all + " words)"],
        [words(a) >= 0.4 * Math.max(1, all), "Action is at least 40% of the story"],
        [/\bI\b/.test(a) && (a.match(/\bwe\b/gi) || []).length <= (a.match(/\bI\b/g) || []).length, "Action says “I” more than “we”"],
        [/\d/.test(r), "Result includes a number"],
        [/learn|realiz|since then|now I|next time/i.test(r), "Result says what you learned"],
      ];
      checks.innerHTML = "";
      res.forEach(function (c) { checks.appendChild(h("div", { class: "row small" }, h("span", { class: "pill " + (c[0] ? "good" : "ok") }, c[0] ? "✓" : "…"), c[1])); });
    }
    function clear() { cur = null; title.value = ""; STAR.forEach(function (p) { boxes[p[0]].value = ""; }); analyze(); }
    function commit() {
      if (!title.value.trim()) { title.focus(); return; }
      var s = { id: cur || String(Date.now()), comp: comp.value, title: title.value.trim() };
      STAR.forEach(function (p) { s[p[0]] = boxes[p[0]].value; });
      stories = stories.filter(function (x) { return x.id !== s.id; }).concat([s]);
      S.save("stories", stories); cur = s.id; renderList();
    }
    function renderList() {
      list.innerHTML = "";
      COMPETENCIES.forEach(function (c) {
        var mine = stories.filter(function (s) { return s.comp === c[0]; });
        list.appendChild(h("div", { class: "item" },
          h("div", { class: "row spread" }, h("span", { class: "t" }, c[1]), h("span", { class: "pill " + (mine.length ? "good" : "bad") }, mine.length + " stor" + (mine.length === 1 ? "y" : "ies"))),
          mine.map(function (s) {
            return h("div", { class: "row spread" }, h("span", null, s.title), h("span", { class: "row" },
              h("button", { type: "button", class: "btn", onclick: function () {
                cur = s.id; comp.value = s.comp; title.value = s.title; STAR.forEach(function (p) { boxes[p[0]].value = s[p[0]] || ""; });
                comp.dispatchEvent(new Event("change")); analyze(); window.scrollTo(0, 0);
              } }, "Open"),
              h("button", { type: "button", class: "btn danger", onclick: function () {
                if (!confirm("Delete “" + s.title + "”?")) return;
                stories = stories.filter(function (x) { return x !== s; }); S.save("stories", stories); if (cur === s.id) clear(); renderList();
              } }, "Delete")));
          })));
      });
    }
    var editor = h("div", { class: "card pad stack" },
      h("div", { class: "fgrid" }, h("label", { class: "f" }, "Competency", comp), h("label", { class: "f" }, "Title", title)), prompt,
      STAR.map(function (p) {
        boxes[p[0]] = h("textarea", { placeholder: p[2], oninput: analyze });
        counts[p[0]] = h("span", { class: "dim small" });
        return h("label", { class: "f" }, h("span", { class: "row spread" }, p[1], counts[p[0]]), boxes[p[0]]);
      }),
      h("div", { class: "row" }, h("button", { type: "button", class: "btn solid", onclick: commit }, "Save story"),
        h("button", { type: "button", class: "btn", onclick: clear }, "New story")));
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "panel" }, h("div", { class: "card pad stack" }, h("p", { class: "sec" }, "Checks"), checks),
        h("p", { class: "sec" }, "Your story bank"), list),
      editor));
    comp.dispatchEvent(new Event("change")); analyze(); renderList();
  }

  // 4. Résumé bullet checker
  var STRONG = ("achieved analyzed automated built championed coached collaborated conducted created cut decreased delivered " +
    "designed developed directed drove eliminated engineered established evaluated executed expanded forecasted founded generated " +
    "grew identified implemented improved increased initiated launched led managed mentored modeled negotiated optimized organized " +
    "oversaw persuaded pioneered presented produced programmed published raised recruited redesigned reduced researched resolved " +
    "restructured saved scaled secured simplified spearheaded streamlined surveyed taught tested trained transformed translated " +
    "tutored won wrote coordinated estimated quantified audited compiled interviewed").split(" ");
  var WEAK = [/responsible for/i, /\bhelped\b/i, /\bassisted\b/i, /worked on/i, /duties included/i, /\btasked with\b/i, /\bvarious\b/i, /\bparticipated in\b/i];
  function bulletCheck(b) {
    var t = b.replace(/^[\s•\-*–]+/, "").trim();
    var first = (t.split(/\s+/)[0] || "").toLowerCase().replace(/[^a-z]/g, "");
    var words = (t.match(/\S+/g) || []).length;
    var res = [
      [STRONG.indexOf(first) >= 0, STRONG.indexOf(first) >= 0 ? "Starts with a strong verb (“" + first + "”)" : "Start with a strong past-tense verb (Built, Led, Analyzed…)"],
      [!WEAK.some(function (r) { return r.test(t); }), "No weak phrases (responsible for, helped, worked on…)"],
      [/\d/.test(t), "Has a number (%, $, count, time saved)"],
      [words >= 8 && words <= 30, "8–30 words (" + words + ")"],
      [!/\b(I|my|me)\b/.test(t), "No first person (I / my)"],
    ];
    return { text: t, res: res, score: res.filter(function (r) { return r[0]; }).length };
  }
  function bulletTool(el) {
    var ta = h("textarea", { style: "min-height:180px", placeholder: "Paste résumé bullets, one per line", value: S.load("bullets",
      "Responsible for managing the club budget\nAnalyzed 18 months of attendance data in Excel, cutting event costs 22%") });
    var out = h("div", { class: "list" });
    function run() {
      S.save("bullets", ta.value);
      out.innerHTML = "";
      ta.value.split("\n").filter(function (l) { return l.trim(); }).forEach(function (l) {
        var r = bulletCheck(l);
        out.appendChild(h("div", { class: "item" },
          h("div", { class: "row spread" }, h("span", { class: "t" }, r.text), h("span", { class: "pill " + (r.score >= 5 ? "good" : r.score >= 3 ? "ok" : "bad") }, r.score + "/5")),
          r.res.map(function (c) { return h("span", { class: "small " + (c[0] ? "dim" : "") }, (c[0] ? "✓ " : "✗ ") + c[1]); })));
      });
    }
    ta.addEventListener("input", run);
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "card pad stack" }, h("p", { class: "sec" }, "Your bullets"), ta,
        h("p", { class: "dim small", style: "margin:0" }, "Formula: verb + what you did + how + quantified result. “Built X using Y, which did Z (number).”")),
      out));
    run();
  }

  S.course({
    id: "econ210", code: "ECON 210", title: "Career Prep", color: "#2E7D52",
    blurb: "Networking, interviews, résumés and the paths econ majors take.",
    groups: groups, cards: cards, practice: practice,
    tools: [
      { id: "linkedin", name: "LinkedIn checklist & scorer", blurb: "Score your profile section by section and test your headline.", mount: linkedinTool },
      { id: "network", name: "Networking tracker", blurb: "Log alumni speakers and contacts with follow-up reminders.", mount: networkTool },
      { id: "star", name: "STAR story builder", blurb: "Draft and check behavioral-interview stories for each competency.", mount: starTool },
      { id: "bullets", name: "Résumé bullet checker", blurb: "Check bullets for strong verbs, numbers and length.", mount: bulletTool },
    ],
    check: { bulletCheck: bulletCheck },
  });
})();
