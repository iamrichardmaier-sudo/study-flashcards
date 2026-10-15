// ECON 210 practice questions, in the ECON 381 drill schema (see tools/practice/questions.js).
//
//   pattern  the general rule, shown first after answering
//   steps    the worked reasoning, revealed one step at a time
//   cards    related flashcards (ids in courses/econ210/cards.mjs)
//   graph    optional diagram from tools/graphs/econ210.js
//
// Each wrong option's `why` names the belief that makes it tempting.
// tools/course-econ210.test.mjs re-checks the arithmetic in Q10.
export default {
  heading: "Practice questions",
  title: "ECON 210 practice",
  sections: [
    { id: "net", title: "Networking", sub: "2 questions" },
    { id: "int", title: "Interviews", sub: "3 questions" },
    { id: "doc", title: "Résumé & LinkedIn", sub: "2 questions" },
    { id: "path", title: "Career paths", sub: "1 question" },
    { id: "offer", title: "Offers", sub: "2 questions" },
  ],
  questions: [
    {
      id: "p1", section: "int", label: "Q1", week: 2, kind: "one",
      prompt: "In a STAR answer, which part should get the most time?",
      options: [
        { t: "Action", right: true, why: "What <i>you</i> did, step by step and why, is the evidence the interviewer is scoring." },
        { t: "Situation", why: "The belief that context makes the story impressive. It doesn’t: a long set-up eats the time that should prove your skill. One or two sentences is enough." },
        { t: "Task", why: "The belief that the size of the challenge is the point. The task only frames the problem; it says nothing about what you did about it." },
        { t: "Result", why: "The belief that outcomes are all that matter. Results should be quantified, but without the actions the interviewer can’t tell whether you caused them or were just on the team." },
      ],
      pattern: "<b>STAR time split ≈ 10 / 10 / 60 / 20.</b> Set up fast (S, T), spend most of the answer on your own actions (A) in the first person, and land on a measured result (R).",
      steps: [
        "Ask what the interviewer is trying to predict: how <i>you</i> will act on the job.",
        "Only the Action part shows your behavior directly, so it carries the evidence.",
        "For a two-minute answer that is roughly 12 s situation, 12 s task, 72 s action, 24 s result.",
        "Answer: <b>Action</b>.",
      ],
      cards: ["star", "behavioral"],
      graph: "econ210Star",
    },
    {
      id: "p2", section: "net", label: "Q2", week: 1, kind: "one",
      prompt: "You heard an alumna speak in ECON 210 and want to reach out. Best first message?",
      options: [
        { t: "A short note mentioning her talk, one thing you learned, and a request for a 20-minute call about her path", right: true, why: "Specific, brief, built on a real link, and it asks for advice rather than a job." },
        { t: "Your résumé attached with a request for a referral", why: "The belief that being direct about what you want saves everyone time. A referral puts her reputation on the line for someone she has never spoken to, so it is too big a first ask and usually goes unanswered." },
        { t: "A connection request with no note", why: "The belief that connecting is the same as reaching out. A blank request wastes the one thing you have going for you, the talk she gave, and gives her no reason to reply." },
        { t: "A long message describing your whole background", why: "The belief that more detail makes you more convincing. Busy professionals skim; a long message hides the ask. Keep it under about 120 words." },
      ],
      pattern: "<b>Cold outreach = who you are + the shared link + one small ask + an easy yes.</b> Advice first, referrals later, after a relationship exists.",
      steps: [
        "What’s the link? Her talk in your class: lead with it.",
        "What’s the smallest useful ask? A 20-minute call about her path, not a job or a referral.",
        "Keep it short and make scheduling easy (two time windows).",
        "Only the first option does all three.",
      ],
      cards: ["coldemail", "infoint", "warmintro"],
      graph: { key: "econ210Funnel", args: { hi: "reply" } },
    },
    {
      id: "p3", section: "doc", label: "Q3", week: 3, kind: "one",
      prompt: "Which résumé bullet is strongest?",
      options: [
        { t: "Analyzed 3 years of sales data in R, identifying a pricing change that raised margin 4%", right: true, why: "Action verb, what you did with which tool, and a quantified result." },
        { t: "Responsible for analyzing sales data", why: "The belief that listing your duties shows what you can do. “Responsible for” describes the job, not your effect on it: no tool, no scale, no result." },
        { t: "Helped the team with various data projects", why: "The belief that being a good team member is the thing to show. “Helped” and “various” hide what you personally did and what changed." },
        { t: "I worked hard on data analysis and learned a lot", why: "The belief that effort and growth are results. Résumés skip the first person, and recruiters want outcomes others can see, not how hard it felt." },
      ],
      pattern: "<b>Bullet = action verb + what (and how) + quantified result.</b> If you can’t measure the result, give the scale (how much data, how many people).",
      steps: [
        "Check each bullet for a strong verb: “Analyzed” yes; “Responsible for”, “Helped”, “I worked” no.",
        "Check for the what and the tool: “3 years of sales data in R”.",
        "Check for a result in numbers: “raised margin 4%”. Only the first has all three.",
      ],
      cards: ["bullet", "onepage", "atsresume"],
      graph: "econ210Bullet",
    },
    {
      id: "p4", section: "int", label: "Q4", week: 2, kind: "one",
      prompt: "“How many gas stations are in the U.S.?” What is the interviewer mainly testing?",
      options: [
        { t: "Your structure and how you reason through assumptions", right: true, why: "Market sizing is about a clear, logical breakdown, stated assumptions, clean arithmetic and a sanity check." },
        { t: "Whether you know the exact number", why: "The belief that it’s a trivia question. Nobody expects the figure; a candidate who just recalls a number has shown nothing about how they think." },
        { t: "Your knowledge of the energy industry", why: "The belief that you need industry expertise. The question is chosen precisely because anyone can answer it from first principles (cars, fill-ups, station capacity)." },
        { t: "How quickly you can give a number", why: "The belief that speed signals intelligence. Blurting a number with no structure is a red flag; asking for a moment to lay out your approach is expected." },
      ],
      pattern: "<b>Guesstimates test the logic, not the answer.</b> Choose demand side or supply side, say every assumption out loud with a reason, round, and sanity-check.",
      steps: [
        "Pick an approach: e.g. cars × fill-ups per week ÷ fill-ups one station handles per week.",
        "State rounded assumptions: about 300 million cars, one fill-up a week, about 2,000 fill-ups per station a week.",
        "Compute: 300 million ÷ 2,000 ≈ 150,000 stations; then sanity-check against what you know.",
        "The interviewer scores each of those moves, so the answer is <b>structure and reasoning</b>.",
      ],
      cards: ["sizing", "casei"],
      graph: "econ210Sizing",
    },
    {
      id: "p5", section: "offer", label: "Q5", week: 5, kind: "one",
      prompt: "You get an exploding offer due in 48 hours while you are in final rounds elsewhere. Best move?",
      options: [
        { t: "Thank them, explain the situation honestly, and ask whether a short extension is possible", right: true, why: "Firms often grant reasonable extensions, and honesty keeps the relationship intact either way." },
        { t: "Accept now and back out later if the other offer comes", why: "The belief that an acceptance is just a placeholder. Reneging breaks a commitment the firm planned around; it damages your reputation and can hurt your school’s relationship with the employer." },
        { t: "Ignore the deadline", why: "The belief that firms won’t actually enforce deadlines. They can, and silence reads as lack of interest, so the offer may simply be withdrawn." },
        { t: "Tell the other firm you have an offer and demand a decision in 24 hours", why: "The belief that pressure speeds things up. Telling them is right; asking politely whether they can accelerate works, but a demand rarely does and can end the process." },
      ],
      pattern: "<b>Exploding offer: thank, be honest, ask for a specific extension, then ask the other firm to speed up.</b> Never accept intending to renege.",
      steps: [
        "Thank them and say you’re excited about the offer.",
        "Explain you’re finishing another process and ask for a specific, short extension.",
        "Tell the other firm you have a deadline and ask whether they can accelerate.",
        "Decide by the (possibly extended) deadline on what you know.",
      ],
      cards: ["exploding", "negotiate", "returnoffer"],
      graph: "econ210Deadline",
    },
    {
      id: "p6", section: "doc", label: "Q6", week: 3, kind: "one",
      prompt: "What’s the most valuable change to a LinkedIn headline that reads “Student at Brigham Young University”?",
      options: [
        { t: "Add your target field and a skill or two, e.g. “Economics @ BYU | SQL, R | Aspiring economic consultant”", right: true, why: "The headline shows in search results and on every comment, so it should say what you do and what you want, in words recruiters search for." },
        { t: "Add emojis to stand out", why: "The belief that standing out visually is what matters. In finance and consulting emojis can read as unprofessional, and they add no searchable information." },
        { t: "Leave it. It’s accurate", why: "The belief that accuracy is enough. It is accurate but says nothing about your interests or skills, so you don’t show up when recruiters search for them." },
        { t: "List every course you’ve taken", why: "The belief that more keywords is always better. A transcript is unreadable and truncates; the headline is prime space for focus." },
      ],
      pattern: "<b>Headline = field + searchable skills + target.</b> Write the words a recruiter would type into search, and say what you want next.",
      steps: [
        "Ask who reads the headline: recruiters and alumni in search results, invitations and comments.",
        "Give them field (“Economics @ BYU”), two or three provable skills (“SQL, R”) and a target.",
        "The first option does that; the others decorate, leave it blank, or bury it.",
      ],
      cards: ["liheadline", "liabout"],
      graph: { key: "econ210LinkedIn", args: { hi: "headline" } },
    },
    {
      id: "p7", section: "path", label: "Q7", week: 4, kind: "one",
      prompt: "Which entry path most directly uses ECON 388-style econometrics on litigation and antitrust questions?",
      options: [
        { t: "Economic consulting", right: true, why: "Damages estimates, merger analysis and regressions for expert witnesses are the core of the analyst job." },
        { t: "Investment banking", why: "The belief that any finance-adjacent job uses econometrics. Banking is corporate finance and valuation modeling (DCF, comps, LBO), not regression analysis on legal questions." },
        { t: "Management consulting", why: "The belief that all consulting is the same. Management consulting is strategy and operations, usually Excel-based; economic consulting is the one built around litigation and econometrics." },
        { t: "Law school", why: "The belief that working on legal questions means being a lawyer. Lawyers use economic evidence, but economic consultants are the ones who produce it." },
      ],
      pattern: "<b>Match the work to the skill.</b> Litigation + antitrust + econometrics = economic consulting (Cornerstone, Analysis Group, Compass Lexecon, CRA and others).",
      steps: [
        "Underline the clues: “econometrics”, “litigation”, “antitrust”.",
        "Ask which job’s daily work is running regressions for legal disputes: the economic consulting analyst’s.",
        "Rule out the near misses: banking (valuation), management consulting (strategy), law (uses the evidence, doesn’t build it).",
      ],
      cards: ["econconsult", "mgmtconsult", "ib", "lawschool"],
      graph: { key: "econ210Paths", args: { hi: "econ" } },
    },
    {
      id: "p8", section: "int", label: "Q8", week: 2, kind: "one",
      prompt: "Asked “What’s your greatest weakness?”, the best answer…",
      options: [
        { t: "Names a real, non-fatal weakness and the concrete steps you’re taking to improve it", right: true, why: "It shows self-awareness and that you act on feedback, which is what the question is really about." },
        { t: "“I’m a perfectionist”", why: "The belief that a disguised strength is safe. Interviewers have heard it countless times and read it as evasive, so it costs credibility." },
        { t: "“I don’t really have one”", why: "The belief that admitting a weakness hurts you. Claiming none reads as a lack of self-awareness, which is the trait being tested." },
        { t: "Names a core skill the job requires", why: "The belief that any honest answer is good. Honesty matters, but naming a weakness central to the role (e.g. Excel for an analyst) gives them a reason not to hire you." },
      ],
      pattern: "<b>Weakness = real + not central to the role + evidence of improvement.</b> The question tests self-awareness and coachability, so the improvement steps are the heart of the answer.",
      steps: [
        "Pick something true that isn’t core to the job (e.g. public speaking for a data role).",
        "Give one short example of when it showed.",
        "Spend most of the answer on what you’re doing about it and the progress so far.",
      ],
      cards: ["behavioral", "star"],
    },
    {
      id: "p9", section: "net", label: "Q9", week: 1, kind: "one",
      prompt: "When should you send a thank-you after an informational interview?",
      options: [
        { t: "Within 24 hours", right: true, why: "While the conversation is fresh. Mention something specific you learned." },
        { t: "After you’ve applied to their firm", why: "The belief that the thank-you should be timed to be useful. Tying it to your application makes the thanks feel transactional." },
        { t: "Only if they offered to refer you", why: "The belief that thanks are owed only for favors. They gave you their time; everyone who does should be thanked." },
        { t: "At the end of the semester, in one batch", why: "The belief that the timing doesn’t matter as long as it’s sent. Weeks later they may not remember the conversation, and it signals low interest." },
      ],
      pattern: "<b>Follow-up cadence:</b> thank-you within 24 hours; an update when you act on their advice; a check-in every few months.",
      steps: [
        "Send the thank-you the same or next day, naming one specific thing you learned.",
        "Log the contact and set a follow-up date.",
        "Come back with an update when you have used their advice.",
      ],
      cards: ["followup", "infoint"],
      graph: "econ210Followup",
    },
    {
      id: "p10", section: "offer", label: "Q10", week: 5, kind: "one",
      prompt: "Two offers: A pays $5k more base salary; B has a $10k signing bonus and a 6% 401(k) match vs. A’s 3%. For a first-year comparison you should…",
      options: [
        { t: "Compare total compensation, including the bonus and the match, then weigh learning and exit options", right: true, why: "Base alone ignores real money, and money alone ignores what the job does for your career." },
        { t: "Pick A, since base salary is all that matters", why: "The belief that only base counts. Base matters most in the long run, but in year one a $10k signing bonus and a doubled match are real money that can outweigh a $5k base gap." },
        { t: "Pick B, since signing bonuses always outweigh base", why: "The belief that a big one-time number beats a recurring one. The bonus is paid once, while A’s higher base repeats every year and compounds through raises." },
        { t: "Ignore the money and pick by firm prestige", why: "The belief that brand settles everything. Prestige is one factor among several (learning, people, location, pay), not the whole decision." },
      ],
      pattern: "<b>Total comp = base + bonuses + retirement match + equity + benefits.</b> Compare year one and year two separately: one-time money (signing bonus) wins early, a higher base wins later.",
      steps: [
        "Put numbers on it, say A = $75,000 and B = $70,000 base.",
        "Year 1: A = $75,000 + 3% match $2,250 = $77,250. B = $70,000 + $10,000 + 6% match $4,200 = $84,200. B leads by $6,950.",
        "Year 2: A = $77,250, B = $74,200. A leads by $3,050 a year, before raises.",
        "So compute the totals first, then weigh learning, exit options, location and cost of living.",
      ],
      cards: ["totalcomp", "negotiate", "returnoffer"],
      graph: "econ210Offer",
    },
  ],
};
