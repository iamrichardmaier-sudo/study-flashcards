# ECON 210 (Career Prep) — Feature Spec

BYU ECON 210 is a 1-credit seminar covering résumés, course planning, networking, graduate school, and alumni career talks (consulting, finance, data science, government, law, tech, policy, VC, nonprofits). UNC's equivalent econ career-prep course adds: personal branding, LinkedIn, cover letters, elevator pitches, interview skills, mock interviews, and offer/HR basics. Career prep is action-oriented, so the highest-value features are tools and trackers, not flashcards.

## Top Features (ordered by value)

1. **LinkedIn Profile Checklist & Scorer** — Interactive checklist across headline, About section, experience bullets, skills, photo, and custom URL, with a live completeness/quality score and section-by-section tips. Richard explicitly asked for a "LinkedIn connector" feature; this is the version that works without API access and drives the single highest-leverage career asset for an econ major.

2. **Networking Contact Tracker** — Log every alumni speaker and professional contact: name, firm, role, how met, conversation notes, and a follow-up reminder date. ECON 210 is built around alumni talks — capturing and following up on those contacts is the course's core skill, and students lose it without a system.

3. **STAR Story Builder** — Guided prompts to draft Situation/Task/Action/Result stories drawn from econ coursework, jobs, and projects, saved per-competency (leadership, teamwork, analytical problem-solving, failure). Behavioral interviews are the dominant screening format for consulting, finance, and tech roles econ majors target.

4. **Econ Career Path Explorer** — Interactive cards for the paths BYU alumni actually take (management/economic consulting, IB, data science, government/policy, law, tech, VC, nonprofits): typical entry roles, key skills to build, recruiting timelines, and salary bands. Turns the seminar's alumni talks into a persistent reference.

5. **Mock Interview Question Bank** — Self-scored practice mode (same pattern as existing Practice Tests tab) with behavioral questions plus econ-specific technical ones (market sizing, basic DCF walkthrough, "explain a regression," policy analysis cases). Interview skills are an explicit course topic.

6. **Resume Bullet Optimizer** — Paste resume bullets; get heuristic checks for strong action verbs, quantified results, and length, with before/after rewrite examples. Résumé work is a core ECON 210 assignment.

**Implementation notes:** All features store data in localStorage (no backend, consistent with the existing app). Keep Flashcards/Practice tabs as-is for the small set of memorizable content (HR terms, recruiting timelines); audio tab holds alumni-talk summaries.
