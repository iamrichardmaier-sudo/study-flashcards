// ECON 210 flashcards, in the ECON 381 card schema (see cards/src/week2.mjs).
//
//   simple       one plain sentence
//   formula      only where a real structure helps (STAR, bullet, sizing…)
//   more         2–3 short paragraphs: why it matters, how to do it, traps
//   connections  related cards in this class (kept reciprocal; see
//                tools/course-econ210.test.mjs)
//   example      a concrete case for a BYU economics student
//   numbers      real figures only, with numbersSource naming source + date
//   played       a worked example in 2–4 steps
//   graph        a diagram from tools/graphs/econ210.js
//
// Graphs live in tools/graphs/econ210.js. Every number below was checked
// against its source; pay figures are BLS medians for May 2024 (all
// experience levels, not starting salaries).

/** An operator with breathing room (as in cards/src/helpers.mjs). */
const op = (s) => `<span class="op">${s}</span>`;

export default [
  // ------------------------------------------------------------ 1 · Networking
  {
    id: "elevator", n: 1, week: 1,
    term: "Elevator pitch",
    simple: "A 30–60 second answer to “tell me about yourself”: who you are now, what you’ve done that matters, and what you want next.",
    formula: `present${op("→")}past${op("→")}future${op("→")}the ask`,
    more: [
      "It opens almost every networking call, career fair chat and interview, so it is the most-used thing you will ever prepare. A good pitch makes the next ten minutes easier: it hands the listener something to ask about.",
      "<b>Present → past → future.</b> Start with where you are (year, major, focus), give one or two proof points (a job, an RA role, a project with a result), and finish with the specific direction you want, so the listener knows how to help.",
      "<b>Traps:</b> reciting your résumé in order, going past a minute, and ending vaguely (“…so I’m open to anything”). Tailor the last line to the person: the same past points can lead to “econ consulting” or “data analytics”.",
    ],
    connections: ["infoint", "coldemail", "whyus", "liabout", "behavioral"],
    example: "“I’m a junior in economics at BYU, focused on applied micro and data. Last year I was an RA for a labor economist, cleaning about two million wage records in R, and this summer I built a dashboard for a local credit union that their loan team now uses weekly. I’m looking at economic consulting because I like using that kind of evidence on real disputes, and I’d love to hear how you got into antitrust work.”",
    played: [
      "<b>Present</b> (≈10 s): “Junior in econ at BYU, focused on applied micro and data.”",
      "<b>Past</b> (≈25 s): pick the one or two experiences that prove the skill the listener cares about, each with a result.",
      "<b>Future</b> (≈10 s): name the field and the reason in one line.",
      "<b>Ask</b>: end with a question that hands them the floor: “How did you get into …?”",
    ],
    graph: "econ210Pitch",
  },
  {
    id: "infoint", n: 2, week: 1,
    term: "Informational interview",
    simple: "A short conversation (often 15–30 minutes) where you ask a professional about their work and path. You are gathering information, not asking for a job.",
    more: [
      "It is the main way students learn what a job is really like, which firms fit them, and who else to meet. It also builds the relationships that later turn into referrals, and gives you the specifics that make a strong “why this firm?” answer.",
      "<b>Do it well:</b> research the person first (LinkedIn, firm bio), bring 3–5 open questions you couldn’t answer with Google, let them talk, watch the clock and stop on time. Near the end ask, “Is there anyone else you think I should talk to?” Send a thank-you within 24 hours.",
      "<b>Traps:</b> asking for a job or a referral in the first conversation, asking questions the firm’s website answers, and running over the time you asked for.",
    ],
    connections: ["elevator", "coldemail", "warmintro", "followup", "whyus"],
    example: "Questions for a second-year analyst at an economic consulting firm: “What does a typical week on a case look like for you?” · “Which skills from your econ classes do you use most, and which did you have to learn on the job?” · “What surprised you in your first six months?” · “What do the analysts who do best have in common?” · “Who else would you suggest I speak with?”",
    played: [
      "Before: read their LinkedIn and one recent case or report from their firm; write five questions, ranked.",
      "During: one-line intro, then let them tell their path; ask your top questions; at minute 18, “I want to respect your time…”, and ask who else to meet.",
      "After: a thank-you within 24 hours naming one specific thing you learned, and a note in your tracker with a follow-up date.",
    ],
    graph: "econ210InfoInt",
  },
  {
    id: "warmintro", n: 3, week: 1,
    term: "Warm introduction",
    simple: "Being introduced to a contact by someone they already know. Far more likely to get a reply than a cold message.",
    more: [
      "A message that arrives through someone the reader trusts gets read, answered and taken seriously. The introducer is lending you a bit of their credibility, so warm paths lift every later stage too: replies, calls and eventually referrals.",
      "<b>How to get one:</b> ask people who already know you (professors, former managers, mission companions, friends a year ahead) whether they know someone in the field. Make it easy: send a short forwardable paragraph about yourself and what you’re asking for. Alumni networks (LinkedIn’s alumni search, BYU Connect) make “warm-ish” outreach possible: the shared school is the connection.",
      "<b>Traps:</b> asking the introducer to “just pass along my résumé”, and not closing the loop. Always thank the person who introduced you and tell them how it went.",
    ],
    connections: ["infoint", "coldemail", "followup"],
    example: "Your ECON 388 professor co-authored with an economist now at the Federal Reserve Bank of Kansas City. You ask: “Would you be comfortable introducing me? I’m applying for RA jobs and would value 20 minutes on what the role is like. Here’s a two-line blurb you could forward.” The professor’s one-line email gets a reply the same day.",
    played: [
      "Map who you already know: list ten people and ask each, “Who do you know in economic consulting or policy work?”",
      "Ask for the introduction, not the job, and attach a forwardable blurb (who you are, what you’re asking, why them).",
      "After the call, thank both people and tell the introducer one thing you learned.",
    ],
    graph: { key: "econ210Funnel", args: { hi: "ref" } },
  },
  {
    id: "followup", n: 4, week: 1,
    term: "Follow-up cadence",
    simple: "Thank-you within 24 hours; a short update when you act on their advice; a check-in every few months so the relationship stays warm.",
    more: [
      "Most networking value comes from the second and third contact, not the first. People refer students they remember and have seen follow through; a quick update showing you used their advice is the strongest signal you can send.",
      "<b>How:</b> keep a simple tracker (name, firm, how you met, date, what you discussed, next follow-up date). Follow-ups should give something: an update, a congratulations on a deal or promotion, an article tied to what they said.",
      "<b>Traps:</b> only reappearing when you need something, generic “just checking in” notes, and letting a good contact go cold for a year. One unanswered follow-up is fine; after two, wait for a natural reason.",
    ],
    connections: ["infoint", "warmintro", "coldemail"],
    example: "Three weeks after a call, an analyst suggested you learn SQL before applying. You finish a short SQL course and write: “Thanks again for the advice in March. I took it: I just finished a SQL course and used it to rebuild my class project on Utah housing permits. I’m applying for your firm’s summer analyst role next month and wanted to let you know.”",
    played: [
      "Day 0: the call. Log it with a next date.",
      "Within 24 hours: thank-you naming one specific thing you learned.",
      "2–4 weeks: “I acted on your advice” update. Every few months: a short check-in with something of value.",
      "When an application opens: now a referral or a word to the recruiter is a natural ask, because there is a relationship.",
    ],
    graph: "econ210Followup",
  },
  {
    id: "coldemail", n: 5, week: 1,
    term: "Cold outreach message",
    simple: "A brief, specific first message: who you are, the shared link (school, club, talk), one concrete ask (a 20-minute call), and easy scheduling.",
    formula: `who you are${op("+")}the link${op("+")}one small ask${op("+")}easy “yes”`,
    more: [
      "Busy professionals decide in a few seconds whether to answer. Short, specific messages with a real connection and a small, clear ask get replies; long life stories and job requests get ignored.",
      "<b>Do it well:</b> keep it under about 120 words; put the link first (BYU, a talk, a shared employer); ask for advice, never a job, in the first message; offer two or three time windows; follow up once after about a week if there’s no reply.",
      "<b>Traps:</b> attaching a résumé, asking for a referral, copy-pasting the same note with the wrong firm name, and blank LinkedIn connection requests.",
    ],
    connections: ["elevator", "infoint", "warmintro", "followup", "liheadline"],
    example: "Subject: BYU econ student, question about economic consulting<br>“Hi Ms. Larsen, I’m a junior in economics at BYU and saw on LinkedIn that you went from BYU into economic consulting. I’m trying to decide between economic consulting and data roles, and I’d be grateful for 20 minutes to hear how you chose. Would a call next Tuesday or Thursday afternoon work? Thanks for considering it. Sam Park”",
    played: [
      "Weak: “Hi, I’m interested in your company. Can you refer me? Résumé attached.” (No link, a big ask, nothing personal.)",
      "Add the link: “I’m a junior in economics at BYU and saw you went from BYU into economic consulting…”",
      "Shrink the ask: “…20 minutes to hear how you chose economic consulting.”",
      "Make yes easy: two time windows, signed with your full name. About 70 words.",
    ],
    graph: { key: "econ210Funnel", args: { hi: "reply" } },
  },

  // ------------------------------------------------------------ 2 · Interviews
  {
    id: "behavioral", n: 6, week: 2,
    term: "Behavioral interview",
    simple: "Questions about how you acted in past situations (“Tell me about a time…”), on the theory that past behavior predicts future behavior.",
    more: [
      "Nearly every interview, from banking superdays to government panels, includes them. The interviewer is scoring specific competencies: teamwork, leadership, handling conflict or failure, initiative, analytical problem-solving.",
      "<b>Prepare a story bank:</b> 6–8 real stories (a job, an RA project, a mission, a club, a hard class project) each written in STAR form, and map each to the competencies it shows. One good story can answer several questions, so practice flexing it.",
      "<b>Traps:</b> hypotheticals (“I would…”) instead of a real past event, saying “we” throughout so your own role disappears, and failure stories with no lesson or a fake failure.",
    ],
    connections: ["elevator", "star", "superday", "whyus"],
    example: "“Tell me about a time you disagreed with a teammate.” A strong answer: in a group forecasting project, a teammate wanted to drop outliers to improve fit; you showed with a quick robustness check that the result flipped without them, proposed reporting both, and the professor singled out the robustness section. Real, specific, and you end on what you learned.",
    played: [
      "Write a list of 6–8 experiences you could talk about for two minutes.",
      "For each, note which competencies it shows (leadership, conflict, failure, analysis, initiative).",
      "Write each in STAR form with a number in the Result, then practice out loud to time it.",
    ],
    graph: "econ210Star",
  },
  {
    id: "star", n: 7, week: 2,
    term: "STAR method",
    simple: "<b>S</b>ituation, <b>T</b>ask, <b>A</b>ction, <b>R</b>esult: a structure for behavioral answers. Most of the time goes on Action, and the Result is quantified where possible.",
    formula: `Situation${op("→")}Task${op("→")}Action${op("→")}Result`,
    more: [
      "STAR keeps answers short and concrete and makes sure the interviewer hears the two things they are scoring: what <i>you</i> did and what changed because of it.",
      "<b>Proportions:</b> a common rule of thumb is about 10% situation, 10% task, 60% action, 20% result, so a two-minute answer spends over a minute on your own actions. Say “I”, not “we”: the interviewer is hiring you, not your team.",
      "<b>Traps:</b> a long set-up that eats the time, actions with no reasons (“I made a spreadsheet”), and a missing or vague result. End with a number and, if it fits, one line on what you learned.",
    ],
    connections: ["behavioral", "bullet", "superday"],
    example: "<b>S:</b> As a TA for ECON 110, about a third of students were failing the first exam. <b>T:</b> I was asked to run review sessions. <b>A:</b> I pulled the exam data, found most misses were on elasticity, rebuilt the session around five practice problems on it, and added a weekly online quiz with instant feedback. <b>R:</b> Attendance went from 12 to 45 students, and the share failing the second exam fell from 33% to 18%.",
    played: [
      "Start from a weak answer: “We had a hard project and we worked really hard and it turned out well.”",
      "Cut the set-up to one line each for S and T.",
      "Expand A into 3–4 steps you personally took, each with a reason.",
      "Finish R with a number (and a lesson). For a 2-minute answer: about 12 s + 12 s + 72 s + 24 s.",
    ],
    graph: "econ210Star",
  },
  {
    id: "casei", n: 8, week: 2,
    term: "Case interview",
    simple: "A business problem worked through live with the interviewer (profitability, market entry, pricing). Standard in consulting.",
    formula: `profit${op("=")}price${op("×")}volume${op("−")}costs`,
    more: [
      "Consulting firms use cases because the job is exactly this: an unclear business problem, partial data and a client waiting. They are testing structure, math under pressure, business judgment and communication more than the “right” answer.",
      "<b>The flow:</b> clarify the question and goal; ask for a moment and lay out a <b>MECE</b> structure (mutually exclusive, collectively exhaustive), often an issue tree; work through the branches, asking for data; do math out loud; finish with a clear recommendation, risks and next steps.",
      "<b>Traps:</b> forcing a memorized framework onto a problem it doesn’t fit, silent math, losing track of the goal, and ending without a recommendation. Practice live with a partner; reading cases alone isn’t enough.",
    ],
    connections: ["sizing", "mgmtconsult", "superday"],
    example: "“Our client, a regional grocery chain, has seen profits fall 15% in two years. Why, and what should they do?” You split profit into revenue (price, volume per store, store count) and costs (fixed, variable), ask for data, find that volume fell at stores near a new discount competitor, and recommend matching prices on a small set of staples while cutting the slowest-moving lines.",
    played: [
      "Clarify: time frame, what “profit” means (margin or dollars?), and the client’s goal.",
      "Structure: profit = revenue − costs; revenue = price × volume; costs = fixed + variable.",
      "Drill down where the data points: here volume per store fell 12% while prices and costs were flat.",
      "Recommend in one sentence first, then two reasons, risks and next steps.",
    ],
    graph: "econ210CaseTree",
  },
  {
    id: "sizing", n: 9, week: 2,
    term: "Market sizing (guesstimate)",
    simple: "Estimating a quantity from first principles, e.g. “How many coffee shops are in Utah?” by breaking it into population × usage × capacity.",
    formula: `quantity${op("=")}population${op("×")}share${op("×")}use rate${op("÷")}capacity`,
    more: [
      "It shows whether you can take a vague question, build a logical chain of assumptions and do the arithmetic cleanly. It appears inside consulting cases and on its own in consulting, banking and tech interviews.",
      "<b>How:</b> pick an approach (demand side, like people × use, or supply side, like stores × sales), state each assumption out loud with a reason, round aggressively to make the math easy, and sanity-check the answer against something you know.",
      "<b>Traps:</b> silent guessing, false precision (“1,037 shops”), and forgetting a segment such as businesses or tourists. Interviewers care about the logic far more than the final number.",
    ],
    connections: ["casei", "mgmtconsult"],
    example: "“How many gas stations are in the U.S.?” A supply-side approach: about 300 million cars, each fills up about once a week, so roughly 300 million fills a week; a station with 8 pumps handles maybe 2,000 fills a week; 300 million ÷ 2,000 ≈ 150,000 stations. Each line is a stated, rounded assumption.",
    played: [
      "Utah has about 3.5 million people (assume); about 70% are adults: ≈ 2.45 million.",
      "Say 10% of adults buy a café drink on a given day: ≈ 245,000 drinks a day.",
      "A shop sells about 250 drinks a day: 245,000 ÷ 250 ≈ 980, call it about 1,000 shops.",
      "Sanity check: about one shop per 3,500 people, plausible for a state with lots of drive-throughs.",
    ],
    graph: "econ210Sizing",
  },
  {
    id: "technical", n: 10, week: 2,
    term: "Technical interview (finance)",
    simple: "Questions testing accounting and valuation knowledge: walk me through the three statements, a DCF, why EV and not equity value, etc.",
    formula: `EV${op("=")}equity value${op("+")}debt${op("−")}cash`,
    more: [
      "Banking and many corporate finance interviews include a technical round to check you can do the analyst job from day one. Expect: how the three statements link, walking through a DCF, enterprise value vs equity value, and simple “what happens if…” questions.",
      "<b>Core answers:</b> a DCF values a firm as the present value of its projected unlevered free cash flows plus a terminal value, discounted at the WACC. Enterprise value is the value of the whole business to all capital providers, so it pairs with metrics like EBITDA that are before interest; equity value pairs with net income.",
      "<b>Traps:</b> memorizing without understanding (follow-up questions expose it), rambling instead of giving the short answer first, and guessing confidently. “I’m not sure, but here is how I’d reason it” beats a wrong answer.",
    ],
    connections: ["ib", "superday"],
    example: "“Walk me through how $10 of extra depreciation flows through the statements, at a 25% tax rate.” The classic check of whether you understand that depreciation is a non-cash expense that still saves taxes.",
    played: [
      "Income statement: pre-tax income falls $10; tax falls $2.50; net income falls $7.50.",
      "Cash flow: start from net income (−$7.50), add back depreciation (+$10): cash rises $2.50.",
      "Balance sheet: cash +$2.50, PP&amp;E −$10, so assets −$7.50; retained earnings −$7.50, so equity −$7.50. It balances.",
    ],
    graph: "econ210ThreeStatements",
  },
  {
    id: "superday", n: 11, week: 2,
    term: "Superday",
    simple: "A final-round day of back-to-back interviews (often 3–6) at a bank or firm, with the hiring decision made soon after.",
    more: [
      "It is the last filter, and by then every candidate is qualified on paper. Decisions often come from comparing notes across all interviewers, so consistency matters: one weak conversation can outweigh several good ones.",
      "<b>Prepare:</b> your pitch, 6–8 STAR stories, “why this firm and role” with names from your conversations, technicals or cases for the role, and two or three thoughtful questions for each interviewer. Expect to repeat yourself; answer each person fresh.",
      "<b>Traps:</b> fading in the afternoon, contradicting yourself between interviewers, treating the lunch or the junior analyst as “off the record”, and not sending short thank-yous where that is the norm.",
    ],
    connections: ["behavioral", "star", "casei", "technical", "whyus"],
    example: "A bank’s summer analyst superday: four 30-minute interviews (two behavioral and fit with associates, one technical with a VP, one with a managing director), a lunch with current analysts, and a call with offers the same evening or within a few days.",
    played: [
      "The week before: list likely questions for each interview type and rehearse out loud.",
      "The night before: re-read your notes on each person you know at the firm and your “why us”.",
      "On the day: reset between rooms, keep stories consistent, and ask each interviewer something specific to them.",
    ],
    graph: "econ210Stages",
  },
  {
    id: "whyus", n: 12, week: 2,
    term: "“Why this firm?”",
    simple: "An answer that names specifics only this firm has: people you’ve talked to, a practice area, a deal or project, its culture. It shows you did the work.",
    more: [
      "Firms want people who will accept an offer and stay. A specific answer signals real interest and that you understand what the job involves; a generic one (“great culture, great people”) could be said about any firm, so it signals the opposite.",
      "<b>Build it from:</b> conversations with people at the firm (name them, with permission), a practice area or recent case or deal that matches your interests, and something concrete about how the firm trains or staffs analysts. Tie it back to your own story in one line.",
      "<b>Traps:</b> reciting the website, leading with prestige or pay, and naming a person you only exchanged one message with.",
    ],
    connections: ["elevator", "infoint", "behavioral", "superday"],
    example: "“Two reasons. First, your antitrust practice: I read the merger retrospective your team published on hospital mergers, and that’s exactly the applied IO I liked in ECON 381 and 388. Second, talking with Emily Chen and David Ruiz, both BYU alums here, I heard analysts get real modeling work on cases early and rotate across practice areas, which is how I learn best.”",
    played: [
      "Before applying, collect three facts only this firm has (a practice, a project, a person’s experience).",
      "Link each to something in your background.",
      "Deliver two reasons in under a minute, naming people only with their permission.",
    ],
  },

  // ------------------------------------------------------------ 3 · Résumé & LinkedIn
  {
    id: "atsresume", n: 13, week: 3,
    term: "ATS (applicant tracking system)",
    simple: "Software that stores and filters applications. Simple formatting and the job posting’s own keywords help a résumé get through.",
    more: [
      "Large employers receive far more applications than people can read, so recruiters search and filter inside the ATS (Workday, Greenhouse, iCIMS and others), often by keywords, school, graduation date or answers to screening questions. If the software misreads your résumé, a human may never see your best line.",
      "<b>Do it well:</b> one column, standard headings (Education, Experience, Skills), dates on the right, no tables, text boxes, images or key details in headers and footers. Mirror the posting’s exact terms where they truthfully apply (“regression analysis”, “SQL”, “financial modeling”). Use the file type the posting asks for.",
      "<b>Traps:</b> stuffing keywords you can’t back up, fancy two-column templates that scramble when parsed, and relying on online applications alone. A referral or a recruiter who knows your name gets your résumé looked at regardless.",
    ],
    connections: ["bullet", "onepage"],
    example: "A data-analyst posting lists “SQL, Tableau, A/B testing”. Your résumé says “database queries” and “dashboards”. Rewriting a bullet as “Wrote SQL queries and built a Tableau dashboard…” keeps the meaning but now matches the recruiter’s search terms.",
    played: [
      "Copy the posting into a document and highlight its skills and tools.",
      "For each one you genuinely have, use the posting’s exact word somewhere on the résumé.",
      "Check parsing: paste your PDF’s text into a plain editor. If the order is scrambled, simplify the layout.",
    ],
    graph: "econ210Resume",
  },
  {
    id: "bullet", n: 14, week: 3,
    term: "Strong résumé bullet",
    simple: "Action verb + what you did + a quantified result: “Built a pricing model in Excel that cut quote time 40% for 12 sales reps.”",
    formula: `action verb${op("+")}what (and how)${op("+")}quantified result`,
    more: [
      "Recruiters skim, and bullets are where they look for evidence of the skills employers say they want most: problem-solving, teamwork and communication. A bullet that shows a result proves the skill instead of claiming it.",
      "<b>Do it well:</b> start with a strong verb (built, analyzed, led, reduced, forecast); say what you did and with which tool; end with scale or impact in numbers (time saved, accuracy, people served, dollars). If there is no hard number, give scope: “for a 40-person team”, “across 3 years of data”.",
      "<b>Traps:</b> “Responsible for…” or “Helped with…” (describes the job, not your effect), vague adjectives, and invented or inflated numbers. You must be able to explain every figure in an interview.",
    ],
    connections: ["star", "atsresume", "onepage", "liabout"],
    example: "Weak: “Responsible for data entry and reports for the research lab.” Strong: “Cleaned and merged 2M Census wage records in R, cutting the lab’s monthly data-prep time from 3 days to 4 hours.”",
    numbers: [
      ["Employers seeking evidence of problem-solving", "≈ 90%"],
      ["…of teamwork", "≈ 80%"],
      ["…of communication skills", "> 75%"],
    ],
    numbersSource: "NACE Job Outlook 2025 survey of employers (fielded Aug–Sep 2024), attributes sought on new-graduate résumés.",
    played: [
      "Start: “Helped with data for the research lab.”",
      "Verb + what + tool: “Cleaned and merged Census wage records in R…”",
      "Add scale: “…2M records…”. Add the result: “…cutting monthly data-prep time from 3 days to 4 hours.”",
      "Check: could you explain each number in an interview? If not, soften it to scope.",
    ],
    graph: "econ210Bullet",
  },
  {
    id: "liheadline", n: 15, week: 3,
    term: "LinkedIn headline",
    simple: "The line under your name, which shows in search results and comments. Better as a target plus value than just “Student at BYU”.",
    more: [
      "Recruiters search LinkedIn by keywords, and the headline is one of the first fields they see next to your name in results, invitations and every comment you post. Whatever you put there is your one-line introduction to strangers.",
      "<b>Do it well:</b> field + skills + target. Include the words a recruiter would search for (economics, data analysis, SQL, consulting) and what you want next. The field allows up to 220 characters; the first part matters most because it is often truncated.",
      "<b>Traps:</b> the default “Student at Brigham Young University”, buzzwords (“passionate, driven leader”), and listing a target you no longer want. Update it when your goal changes.",
    ],
    connections: ["coldemail", "liabout"],
    example: "Before: “Student at Brigham Young University”. After: “Economics @ BYU | Data analysis in R, SQL, Stata | Seeking 2027 economic consulting internships”.",
    played: [
      "Start with your field and school: “Economics @ BYU”.",
      "Add two or three searchable skills you can prove: “R, SQL, Stata”.",
      "End with the target: “Seeking 2027 economic consulting internships”.",
    ],
    graph: { key: "econ210LinkedIn", args: { hi: "headline" } },
  },
  {
    id: "liabout", n: 16, week: 3,
    term: "LinkedIn About section",
    simple: "A short first-person story: what drives you, what you’re good at (with proof), and what you’re looking for. The first 2–3 lines show before “see more”.",
    more: [
      "It is where a recruiter or alum decides whether you are interesting enough to message. Unlike a résumé, it can show motivation and personality, in your own voice.",
      "<b>Do it well:</b> lead with a hook in the first two lines (they show before “see more”), give one or two proof points with numbers, name the skills and tools you use, and end with what you are looking for and how to reach you. Three short paragraphs is plenty, though the limit is 2,600 characters.",
      "<b>Traps:</b> third-person bios, a wall of buzzwords, and repeating the résumé line by line.",
    ],
    connections: ["elevator", "bullet", "liheadline"],
    example: "“I like turning messy data into answers people can act on. As an RA in BYU’s economics department I cleaned 2M wage records and built the regressions behind a paper on minimum wages. This summer I built a loan dashboard a credit union’s team uses every week. I’m looking for 2027 economic consulting or analytics internships. Happy to talk: sam.park@example.com”",
    played: [
      "Hook (shows before “see more”): what you enjoy doing, in one line.",
      "Proof: one or two results, with numbers.",
      "Close: what you want next and how to contact you.",
    ],
    graph: { key: "econ210LinkedIn", args: { hi: "about" } },
  },
  {
    id: "onepage", n: 17, week: 3,
    term: "One-page résumé",
    simple: "The norm for undergraduates and early-career roles in the US. Recruiters often skim a résumé in seconds, so the most relevant material goes at the top.",
    more: [
      "A first screen is a quick decision about whether to read more, so the top third must carry your strongest signals. One page forces you to choose the evidence that matters for this job.",
      "<b>Layout for a student:</b> name and contact; Education first (school, major, expected graduation, GPA if strong, relevant coursework, honors); Experience with 2–4 bullets each; Leadership and activities; Skills (software, languages) and maybe interests. Reverse chronological order, consistent formatting, 10–12 pt font, and tailored to each application.",
      "<b>Traps:</b> spilling onto page two, shrinking the font to 8 pt to fit, generic objective statements, and high-school items once you have college experience.",
    ],
    connections: ["atsresume", "bullet"],
    example: "An econ junior applying to economic consulting moves “Research Assistant, BYU Economics” above a retail job, adds “Econometrics (ECON 388), Stata, R” to Education, and cuts a high-school award to keep everything on one page.",
    numbers: [
      ["Average initial résumé scan, 2018", "7.4 seconds"],
      ["Same measure, 2012 study", "6 seconds"],
    ],
    numbersSource: "Ladders eye-tracking study (2018) of recruiters’ initial résumé screen, as reported by HR Dive. It measures the first “keep reading?” look, not a full review.",
    played: [
      "Look at the top third: does it show school, major, GPA (if strong) and your most relevant role?",
      "Reorder sections and bullets by relevance to this posting, not by date alone.",
      "Cut the weakest bullet before shrinking margins or font.",
    ],
    graph: "econ210Resume",
  },

  // ------------------------------------------------------------ 4 · Career paths
  {
    id: "mgmtconsult", n: 18, week: 4,
    term: "Management consulting",
    simple: "Advising companies on strategy and operations in project teams. Entry role: business analyst / associate consultant. Screened with case interviews.",
    more: [
      "Analysts join small teams that solve one client problem at a time (cost cutting, pricing, growth strategy), usually for weeks to months, then move to the next. It is broad business training with good exit options, at the cost of long hours and often travel.",
      "<b>Getting in:</b> recruiting for junior-summer internships typically starts in the fall of junior year or before, and full-time offers mostly come as return offers. Firms screen on GPA, leadership and case performance; networking with alumni matters a lot, especially at firms that recruit lightly at BYU.",
      "<b>Traps:</b> starting case practice too late (dozens of live practice cases is normal), and applying only to the three biggest firms when boutique and Big Four advisory practices hire many more analysts.",
    ],
    connections: ["casei", "sizing", "econconsult", "returnoffer"],
    example: "A BYU econ student does a summer internship at a strategy firm’s Dallas office after junior year, works on a pricing project for a retailer, and returns full time as a business analyst after a return offer in August.",
    numbers: [
      ["Management analysts, median pay", "$101,190"],
      ["Projected job growth, 2024–34", "9%"],
      ["Openings per year (projected)", "≈ 98,100"],
    ],
    numbersSource: "BLS Occupational Outlook Handbook, Management Analysts (median wage May 2024; 2024–34 projections). All experience levels, not starting pay.",
    played: [
      "Sophomore year: join a consulting club, start networking with alumni, keep the GPA up.",
      "Summer before junior year: practice cases weekly with a partner; check each firm’s application dates.",
      "Junior fall: apply, interview (cases + fit); summer: intern; senior fall: return offer or full-time recruiting.",
    ],
    graph: { key: "econ210Timeline", args: { hi: "mgmt" } },
  },
  {
    id: "econconsult", n: 19, week: 4,
    term: "Economic consulting",
    simple: "Applying economics and econometrics to litigation, antitrust and regulatory questions (damages, merger effects). Entry role: analyst.",
    more: [
      "Firms such as Cornerstone Research, Analysis Group, Compass Lexecon, CRA, Bates White, Brattle and NERA support expert witnesses (often professors) in lawsuits and regulatory reviews. Analysts clean data, run regressions, build damages models and help write reports.",
      "<b>Getting in:</b> they value econometrics (ECON 388), Stata, R or Python, a strong GPA and clear writing. Expect a case or data exercise and behavioral questions; RA experience is a big plus. Many analysts later go to law school, PhD programs or MBA programs.",
      "<b>Traps:</b> confusing it with management consulting (different firms, different interviews), and underselling coding and writing skills on the résumé.",
    ],
    connections: ["mgmtconsult", "datasci", "govpolicy", "lawschool"],
    example: "In a price-fixing case, an analyst team uses transaction data and a regression with a conspiracy-period dummy to estimate how much prices were raised, which becomes the damages figure in the expert’s report.",
    numbers: [
      ["Economists, median pay", "$115,440"],
      ["…in consulting services (median)", "$102,450"],
      ["Projected job growth, 2024–34", "1%"],
      ["Typical entry education", "Master’s"],
    ],
    numbersSource: "BLS Occupational Outlook Handbook, Economists (median wages May 2024; 2024–34 projections). Consulting-industry median = management, scientific and technical consulting services. Many entry analyst roles at consulting firms hire bachelor’s graduates under other job titles.",
    played: [
      "Take ECON 388 and one more data-heavy elective; learn Stata or R well enough to show code.",
      "Get RA experience or a data project you can describe in STAR form.",
      "Network with BYU alumni at the firms, then apply in junior fall for internships or senior fall for full-time.",
    ],
    graph: { key: "econ210Paths", args: { hi: "econ" } },
  },
  {
    id: "ib", n: 20, week: 4,
    term: "Investment banking",
    simple: "Advising on M&A and raising capital. Entry role: analyst. Heavy financial modelling; recruiting for junior-year summer internships runs very early.",
    more: [
      "Analysts build financial models, valuation analyses and pitch books for mergers, acquisitions and debt or equity raises. Hours are long, pay is high, and the two-year analyst stint is a common launch into private equity, corporate development or business school.",
      "<b>Getting in:</b> recruiting for junior-summer internships at many banks now starts in the sophomore year, so networking needs to start early. Full-time offers mostly come as return offers from that internship. Expect technical questions (accounting, valuation) plus behavioral and “why banking” questions.",
      "<b>Traps:</b> discovering the timeline in junior year, memorizing technical answers without understanding them, and not knowing the difference between groups (coverage vs product) at the banks you target.",
    ],
    connections: ["technical", "returnoffer", "exploding"],
    example: "An analyst on a sell-side M&A deal builds a DCF and comparable-company analysis for a software firm, helps draft the marketing materials sent to potential buyers, and tracks bids in a spreadsheet as the sale process runs.",
    numbers: [
      ["Financial & investment analysts, median pay", "$101,350"],
      ["Projected job growth, 2024–34", "6%"],
    ],
    numbersSource: "BLS Occupational Outlook Handbook, Financial Analysts (median wage May 2024; 2024–34 projections). All experience levels; banking analysts’ pay includes large bonuses not captured well by the median.",
    played: [
      "Freshman/sophomore: finance club, accounting basics, early alumni conversations.",
      "Sophomore spring into junior fall: internship applications and interviews at many banks.",
      "Summer after junior year: internship; return offer decisions usually come at the end of it.",
    ],
    graph: { key: "econ210Timeline", args: { hi: "ib" } },
  },
  {
    id: "datasci", n: 21, week: 4,
    term: "Data science / analytics",
    simple: "Using statistics and programming to answer business questions. Entry roles: data analyst, business analyst, associate data scientist.",
    more: [
      "Economics is a strong base: you know regression, causal inference and how to ask whether a correlation means anything, which many pure programmers don’t. Analysts pull data with SQL, analyze it in Python or R, and present results in dashboards and memos.",
      "<b>Getting in:</b> show skills, not courses. A portfolio (a GitHub repo or a short write-up of a real project with real data) and an internship are the strongest signals. Expect SQL tests, a take-home analysis or a case about a metric.",
      "<b>Traps:</b> listing tools you can’t use under a timed test, projects with no question or conclusion, and ignoring communication: the job is answering questions for non-technical people.",
    ],
    connections: ["econconsult", "econphd"],
    example: "An econ graduate at a Utah tech company runs an A/B test on a new pricing page, uses a difference-in-differences check to rule out a seasonal effect, and writes a one-page memo recommending the rollout.",
    numbers: [
      ["Data scientists, median pay", "$112,590"],
      ["Projected job growth, 2024–34", "34%"],
      ["Openings per year (projected)", "≈ 23,400"],
    ],
    numbersSource: "BLS Occupational Outlook Handbook, Data Scientists (median wage May 2024; 2024–34 projections; all occupations: 3% growth).",
    played: [
      "Pick a real question with public data (e.g. Utah housing permits and prices).",
      "Clean it in SQL/R/Python, analyze it, and make one clear chart.",
      "Publish the code and a one-page write-up; link it from your résumé and LinkedIn.",
    ],
    graph: { key: "econ210Pay", args: { hi: "data" } },
  },
  {
    id: "govpolicy", n: 22, week: 4,
    term: "Government & policy",
    simple: "Economist and analyst roles at agencies, central banks, think tanks and legislative offices. Hiring is often slower and more formal (e.g. USAJOBS).",
    more: [
      "Employers include federal agencies (BLS, BEA, Census, Treasury, CBO, the Fed), state agencies such as Utah’s legislative fiscal analyst’s office, and think tanks. Work ranges from building official statistics to analyzing proposed laws.",
      "<b>Getting in:</b> federal jobs go through USAJOBS with detailed applications, specific qualification questions and long timelines, so apply early and tailor every answer. Internships (including federal Pathways programs and Hill internships) and research-assistant roles at the Fed or think tanks are common entry points and a frequent bridge to a PhD.",
      "<b>Traps:</b> sending a one-page private-sector résumé to USAJOBS (federal résumés need much more detail), and expecting a quick decision.",
    ],
    connections: ["econconsult", "econphd"],
    example: "A BYU econ senior applies in the fall for a two-year research assistant job at a regional Federal Reserve Bank, works on a labor-market research project, and uses that experience and a letter from the economist to apply to PhD programs.",
    numbers: [
      ["Economists in federal government, median", "$141,590"],
      ["All economists, median", "$115,440"],
    ],
    numbersSource: "BLS Occupational Outlook Handbook, Economists, median annual wages by industry, May 2024 (federal government excluding postal service).",
    played: [
      "Junior year: a policy internship (Washington Seminar, a state agency, a think tank).",
      "Senior fall: apply for Fed and think-tank RA roles and watch USAJOBS for entry-level economist postings.",
      "Write the federal résumé: hours per week, dates, and detailed duties that match the posting’s qualifications.",
    ],
    graph: { key: "econ210Timeline", args: { hi: "gov" } },
  },
  {
    id: "econphd", n: 23, week: 4,
    term: "Econ PhD preparation",
    simple: "Strong math (multivariable calculus, linear algebra, real analysis), research experience as an RA, and letters from faculty who know your research work.",
    more: [
      "Economics PhD programs are math-heavy from the first week, and admissions committees look for proof you can handle the math and do research. The strongest applications combine high grades in math and economics, research experience, and detailed letters from economists who have seen your work.",
      "<b>Prepare:</b> take the math (real analysis and linear algebra matter; many take extra math or statistics), work as an RA for a professor, write an honors thesis or research paper, and talk with faculty early. Many applicants spend one to two years as a full-time RA (at the Fed, a think tank or a university “pre-doc”) first.",
      "<b>Traps:</b> skipping real analysis, waiting until senior year to approach faculty, and choosing letter writers by title rather than by how well they know your work.",
    ],
    connections: ["datasci", "govpolicy", "lawschool"],
    example: "A BYU student takes real analysis and linear algebra in the math department, works two years as an RA for a labor economist, co-authors a data appendix, then spends two years as a pre-doctoral fellow before applying to PhD programs.",
    played: [
      "Sophomore year: map the math sequence and start it; ask a professor about RA work.",
      "Junior year: RA work and an honors thesis or research paper.",
      "Senior year or after a pre-doc: applications with three research letters.",
    ],
    graph: { key: "econ210Paths", args: { hi: "phd" } },
  },
  {
    id: "lawschool", n: 24, week: 4,
    term: "Law school route",
    simple: "Admission weighs the LSAT (or GRE at some schools) and GPA heavily, plus a personal statement and letters. Econ is a common pre-law major.",
    more: [
      "Economics builds the analytical reasoning, writing and policy knowledge law schools value, and it connects to antitrust, tax and corporate law. Many economic consulting analysts later go to law school.",
      "<b>Prepare:</b> keep a high GPA, study seriously for the LSAT (scored 120–180; the logic-games section was removed in August 2024), write a personal statement that explains why law, and choose letter writers who know your writing. Working one or more years before applying is common and can strengthen an application.",
      "<b>Traps:</b> going to law school by default without talking to lawyers, and taking on large debt without checking each school’s employment outcomes.",
    ],
    connections: ["econconsult", "econphd"],
    example: "An econ major works two years as an analyst at an economic consulting firm on antitrust cases, then applies to law school with a letter from a supervising principal who describes her writing on expert reports.",
    numbers: [
      ["Lawyers, median pay", "$151,160"],
      ["Projected job growth, 2024–34", "4%"],
    ],
    numbersSource: "BLS Occupational Outlook Handbook, Lawyers (median wage May 2024; 2024–34 projections). Pay varies very widely by employer and school.",
    played: [
      "Talk with three lawyers in different practice areas before committing.",
      "Plan LSAT prep for a semester or summer with a lighter load; take practice tests under time.",
      "Compare schools on employment outcomes and net cost, not ranking alone.",
    ],
    graph: { key: "econ210Pay", args: { hi: "law" } },
  },

  // ------------------------------------------------------------ 5 · Offers
  {
    id: "returnoffer", n: 25, week: 5,
    term: "Return offer",
    simple: "A full-time job offer made to a summer intern at the end of the internship. The main pipeline into many banking and consulting jobs.",
    more: [
      "Firms treat the junior-year internship as a ten-week job interview. A return offer often arrives in August or early fall of senior year, which means much of the full-time hiring at banks and consulting firms happens a year before graduation.",
      "<b>Earn it:</b> treat every task as an audition, ask for feedback mid-summer and act on it, get to know people beyond your team, and keep your work accurate. Attitude and reliability matter as much as brilliance.",
      "<b>Traps:</b> assuming the offer is automatic, coasting after mid-summer reviews, and accepting a return offer you don’t want to “keep options open”, then reneging.",
    ],
    connections: ["mgmtconsult", "ib", "exploding", "totalcomp"],
    example: "A summer analyst at an economic consulting firm asks for feedback in week five, learns her Stata code needs better documentation, fixes it, and gets a return offer in the final week with a deadline in October.",
    numbers: [
      ["Intern conversion rate, 2024–25 interns", "63.1%"],
      ["Interns accepting return offers", "88.3%"],
      ["Acceptance rate a year earlier", "82.8%"],
    ],
    numbersSource: "NACE 2026 Internship & Co-op Survey (fielded Oct 2025–Jan 2026, 284 organizations). Conversion = interns who became full-time hires.",
    played: [
      "Week 1: learn what “good” looks like for your manager.",
      "Mid-summer: ask for feedback directly and fix the main point.",
      "End of summer: if an offer comes, check the deadline and decide with the whole picture (see total comp).",
    ],
    graph: "econ210Timeline",
  },
  {
    id: "exploding", n: 26, week: 5,
    term: "Exploding offer",
    simple: "An offer with a short deadline to accept. You can politely ask for more time, especially if you are mid-process elsewhere.",
    more: [
      "Firms use short deadlines to lock in candidates before competitors can make offers. Asking for a reasonable extension is normal and rarely costs you the offer, especially when you are honest about why and name a date.",
      "<b>How:</b> thank them and say you are excited; explain you are finishing another process; ask for a specific, short extension. Then tell the other firm you have an offer with a deadline and ask whether they can speed up. Check your career center’s policies on offer deadlines.",
      "<b>Traps:</b> accepting and backing out later (reneging damages your reputation with the firm and often your school), going silent past the deadline, and bluffing about offers you don’t have.",
    ],
    connections: ["ib", "returnoffer", "negotiate"],
    example: "“Thank you so much for the offer; I’m excited about the team. I’m in final rounds with one other firm and want to make a decision I can fully commit to. Would it be possible to extend my deadline to Friday the 18th?”",
    played: [
      "Day 0: offer with a 48-hour deadline. Thank them and ask for a specific extension.",
      "Same day: tell the other firm and ask whether they can accelerate.",
      "By the deadline: decide on what you know. If you accept, withdraw from other processes.",
    ],
    graph: "econ210Deadline",
  },
  {
    id: "totalcomp", n: 27, week: 5,
    term: "Total compensation",
    simple: "Base salary + signing bonus + performance bonus + benefits (retirement match, health) + equity. Compare offers on the total, not just base.",
    formula: `total${op("=")}base${op("+")}bonuses${op("+")}retirement match${op("+")}equity${op("+")}benefits`,
    more: [
      "Two offers with the same base can differ by thousands of dollars a year. Signing bonuses are one-time; performance bonuses vary; a 401(k) match is free money only if you contribute enough to get it, and may vest over time; health premiums and equity add more.",
      "<b>Compare well:</b> put each offer’s pieces in a table for year one and year two, adjust for cost of living (Salt Lake vs New York is a big gap), then weigh what money doesn’t capture: what you will learn, exit options, the people, and hours.",
      "<b>Traps:</b> comparing base only, counting a signing bonus every year, ignoring clawback terms (many signing bonuses must be repaid if you leave within a year), and ignoring taxes and cost of living.",
    ],
    connections: ["returnoffer", "negotiate"],
    example: "Offer A: $75,000 base, 3% 401(k) match. Offer B: $70,000 base, $10,000 signing bonus, 6% match. B pays more in year one; A pays more every year after, before raises.",
    numbers: [
      ["Avg. starting salary, Class of 2024 (bachelor’s)", "$65,677"],
      ["Change from Class of 2023", "+2.2%"],
    ],
    numbersSource: "NACE Summer 2025 Salary Survey, final figures for the Class of 2024. Base salary only, all majors.",
    played: [
      "Year 1, A: $75,000 + 3% × $75,000 = $75,000 + $2,250 = <b>$77,250</b>.",
      "Year 1, B: $70,000 + $10,000 + 6% × $70,000 = $70,000 + $10,000 + $4,200 = <b>$84,200</b>. B leads by $6,950.",
      "Year 2 (no signing bonus): A $77,250 vs B $74,200. A leads by $3,050 a year, before raises.",
      "Two-year total: A $154,500 vs B $158,400. The base gap keeps compounding through raises, so A pulls ahead from year 3 on.",
    ],
    graph: "econ210Offer",
  },
  {
    id: "negotiate", n: 28, week: 5,
    term: "Negotiating an offer",
    simple: "Ask respectfully, anchored on facts (a competing offer, market data). Signing bonus, start date and relocation are often more flexible than base salary for new grads.",
    more: [
      "Many entry-level programs pay every analyst in a class the same base, so there is little room there; but signing bonuses, relocation, start dates and sometimes title or office can move. A polite, fact-based question almost never costs an offer.",
      "<b>How:</b> express enthusiasm first; ask an open question (“Is there any flexibility on the package?”); support it with a competing offer or salary data for that role and city; suggest a specific item; and get the final terms in writing.",
      "<b>Traps:</b> ultimatums, invented competing offers, negotiating after you’ve already accepted, and haggling over small amounts with a firm that has said its analyst pay is fixed.",
    ],
    connections: ["exploding", "totalcomp"],
    example: "“I’m excited about this role and would love to join. I have another offer at $76,000 base. Is there any flexibility, for example on the base or a signing bonus, to help close that gap?” The firm’s base is set for the analyst class but it adds a $5,000 signing bonus.",
    played: [
      "Initial offer: $72,000 base. Competing offer: $76,000 base, no bonus.",
      "You ask, with the competing figure. The firm can’t move base (fixed analyst band) but adds a $5,000 signing bonus.",
      "Year one: $72,000 + $5,000 = $77,000, now $1,000 above the competitor. From year two the $4,000 base gap returns, so weigh the rest of the package too.",
    ],
    graph: "econ210Negotiate",
  },
];
