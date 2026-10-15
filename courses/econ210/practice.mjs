// ECON 210 practice questions, in the ECON 381 drill schema (see tools/practice/questions.js).
export default {
  "heading": "Practice questions",
  "title": "ECON 210 practice",
  "sections": [
    {
      "id": "net",
      "title": "Networking",
      "sub": "2 questions"
    },
    {
      "id": "int",
      "title": "Interviews",
      "sub": "3 questions"
    },
    {
      "id": "doc",
      "title": "Résumé & LinkedIn",
      "sub": "2 questions"
    },
    {
      "id": "path",
      "title": "Career paths",
      "sub": "1 questions"
    },
    {
      "id": "offer",
      "title": "Offers",
      "sub": "2 questions"
    }
  ],
  "questions": [
    {
      "id": "p1",
      "section": "int",
      "label": "Q1",
      "week": 2,
      "kind": "one",
      "prompt": "In a STAR answer, which part should get the most time?",
      "options": [
        {
          "t": "Action",
          "right": true,
          "why": "What <i>you</i> did is what the interviewer is assessing."
        },
        {
          "t": "Situation",
          "why": "Context should be brief, one or two sentences. Long set-ups crowd out the substance."
        },
        {
          "t": "Task",
          "why": "The task frames the challenge. It isn’t evidence of your skill."
        },
        {
          "t": "Result",
          "why": "Results matter and should be quantified, but they follow from the actions you explain."
        }
      ],
      "pattern": "A common rule of thumb: about 10% situation, 10% task, 60% action, 20% result."
    },
    {
      "id": "p2",
      "section": "net",
      "label": "Q2",
      "week": 1,
      "kind": "one",
      "prompt": "You heard an alumna speak in ECON 210 and want to reach out. Best first message?",
      "options": [
        {
          "t": "A short note mentioning her talk, one thing you learned, and a request for a 20-minute call about her path",
          "right": true,
          "why": "Specific, brief, and it asks for advice rather than a job."
        },
        {
          "t": "Your résumé attached with a request for a referral",
          "why": "Asking for a referral before any relationship exists is a big ask and usually gets ignored."
        },
        {
          "t": "A connection request with no note",
          "why": "It misses the chance to remind her where you met and why you’re reaching out."
        },
        {
          "t": "A long message describing your whole background",
          "why": "Busy professionals skim. Keep it under ~120 words with one clear ask."
        }
      ]
    },
    {
      "id": "p3",
      "section": "doc",
      "label": "Q3",
      "week": 3,
      "kind": "one",
      "prompt": "Which résumé bullet is strongest?",
      "options": [
        {
          "t": "Analyzed 3 years of sales data in R, identifying a pricing change that raised margin 4%",
          "right": true,
          "why": "Action verb, tool, and a quantified result."
        },
        {
          "t": "Responsible for analyzing sales data",
          "why": "“Responsible for” describes the job, not what you accomplished."
        },
        {
          "t": "Helped the team with various data projects",
          "why": "“Helped” and “various” are vague. What did you do, and what changed?"
        },
        {
          "t": "I worked hard on data analysis and learned a lot",
          "why": "No first person on résumés, and effort isn’t a result."
        }
      ]
    },
    {
      "id": "p4",
      "section": "int",
      "label": "Q4",
      "week": 2,
      "kind": "one",
      "prompt": "“How many gas stations are in the U.S.?” What is the interviewer mainly testing?",
      "options": [
        {
          "t": "Your structure and how you reason through assumptions",
          "right": true,
          "why": "Market sizing is about a clear, logical breakdown and sanity checks."
        },
        {
          "t": "Whether you know the exact number",
          "why": "Nobody expects the exact figure. A reasonable, well-structured estimate wins."
        },
        {
          "t": "Your knowledge of the energy industry",
          "why": "Industry knowledge helps, but the question is designed to be answerable from first principles."
        },
        {
          "t": "How quickly you can give a number",
          "why": "Rushing without structure is a red flag. Take a moment to lay out your approach."
        }
      ]
    },
    {
      "id": "p5",
      "section": "offer",
      "label": "Q5",
      "week": 5,
      "kind": "one",
      "prompt": "You get an exploding offer due in 48 hours while you are in final rounds elsewhere. Best move?",
      "options": [
        {
          "t": "Thank them, explain the situation honestly, and ask whether a short extension is possible",
          "right": true,
          "why": "Firms often grant reasonable extensions. Honesty preserves the relationship."
        },
        {
          "t": "Accept now and back out later if the other offer comes",
          "why": "Reneging damages your reputation and can burn bridges with the firm and your school’s career center."
        },
        {
          "t": "Ignore the deadline",
          "why": "The offer may simply be withdrawn."
        },
        {
          "t": "Tell the other firm you have an offer and demand a decision in 24 hours",
          "why": "You can let them know and ask whether they can speed up, but demanding a decision rarely works."
        }
      ]
    },
    {
      "id": "p6",
      "section": "doc",
      "label": "Q6",
      "week": 3,
      "kind": "one",
      "prompt": "What’s the most valuable change to a LinkedIn headline that reads “Student at Brigham Young University”?",
      "options": [
        {
          "t": "Add your target field and a skill or two, e.g. “Economics @ BYU | SQL, R | Aspiring economic consultant”",
          "right": true,
          "why": "The headline shows in search and on every comment, so tell people what you do and want."
        },
        {
          "t": "Add emojis to stand out",
          "why": "They can read as unprofessional in finance and consulting and don’t add information."
        },
        {
          "t": "Leave it. It’s accurate",
          "why": "Accurate, but it says nothing about your interests or skills, so you’re invisible in recruiter searches."
        },
        {
          "t": "List every course you’ve taken",
          "why": "Too long to read. The headline is prime space for focus, not a transcript."
        }
      ]
    },
    {
      "id": "p7",
      "section": "path",
      "label": "Q7",
      "week": 4,
      "kind": "one",
      "prompt": "Which entry path most directly uses ECON 388-style econometrics on litigation and antitrust questions?",
      "options": [
        {
          "t": "Economic consulting",
          "right": true,
          "why": "Damages estimates, merger simulations and regression analysis are the bread and butter."
        },
        {
          "t": "Investment banking",
          "why": "IB is mostly corporate finance and modelling (DCF, comps, LBO), not econometrics."
        },
        {
          "t": "Management consulting",
          "why": "More strategy and operations. Analysis is often Excel-based and less econometric."
        },
        {
          "t": "Law school",
          "why": "Lawyers use economic evidence, but economic consultants are the ones who produce it."
        }
      ]
    },
    {
      "id": "p8",
      "section": "int",
      "label": "Q8",
      "week": 2,
      "kind": "one",
      "prompt": "Asked “What’s your greatest weakness?”, the best answer…",
      "options": [
        {
          "t": "Names a real, non-fatal weakness and the concrete steps you’re taking to improve it",
          "right": true,
          "why": "Shows self-awareness and growth."
        },
        {
          "t": "“I’m a perfectionist”",
          "why": "A cliché humble-brag that interviewers have heard countless times."
        },
        {
          "t": "“I don’t really have one”",
          "why": "It reads as a lack of self-awareness."
        },
        {
          "t": "Names a core skill the job requires",
          "why": "Choose something real but not central to the role."
        }
      ]
    },
    {
      "id": "p9",
      "section": "net",
      "label": "Q9",
      "week": 1,
      "kind": "one",
      "prompt": "When should you send a thank-you after an informational interview?",
      "options": [
        {
          "t": "Within 24 hours",
          "right": true,
          "why": "While the conversation is fresh. Mention something specific you learned."
        },
        {
          "t": "After you’ve applied to their firm",
          "why": "Waiting makes the thanks feel transactional."
        },
        {
          "t": "Only if they offered to refer you",
          "why": "Thank everyone who gives you their time."
        },
        {
          "t": "At the end of the semester, in one batch",
          "why": "Too late. The person may not remember the conversation."
        }
      ]
    },
    {
      "id": "p10",
      "section": "offer",
      "label": "Q10",
      "week": 5,
      "kind": "one",
      "prompt": "Two offers: A pays $5k more base salary; B has a $10k signing bonus and a 6% 401(k) match vs. A’s 3%. For a first-year comparison you should…",
      "options": [
        {
          "t": "Compare total compensation, including the bonus and the match, then weigh learning and exit options",
          "right": true,
          "why": "Base alone ignores real money (and non-monetary factors)."
        },
        {
          "t": "Pick A, since base salary is all that matters",
          "why": "Base matters most long-run, but a signing bonus and a bigger match are real money."
        },
        {
          "t": "Pick B, since signing bonuses always outweigh base",
          "why": "A signing bonus is one-time, while base compounds through raises."
        },
        {
          "t": "Ignore the money and pick by firm prestige",
          "why": "Prestige is one factor among several, not the whole decision."
        }
      ]
    }
  ]
};
