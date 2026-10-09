import { fr, op } from "./helpers.mjs";

const W = 4;

// Running example from the practice exam: s = 0.02, f = 0.28 per period.

export default [
  {
    id: "natural-rate", n: 91, week: W, tags: ["L7"],
    term: "Natural rate of unemployment",
    simple: "The average rate around which actual unemployment fluctuates. In the flows model it's the steady-state rate.",
    more: [
      "It's never zero: frictional unemployment (search) and structural unemployment (wage rigidity) persist even in good times.",
      "The gap between actual and natural unemployment is cyclical unemployment: high in recessions, negative in booms.",
    ],
    connections: ["ss-unemployment-rate", "frictional", "structural", "unemployment-rate", "recession"],
    example: "Before the pandemic, in late 2019, unemployment fell to 3.5%, below most estimates of the natural rate, and inflation stayed calm, which led economists to revise their natural-rate estimates down.",
    numbers: [
      ["Unemployment, Sep 2026", "4.2%"],
      ["CBO noncyclical rate (approx.)", "≈ 4.3–4.4%"],
    ],
    numbersSource: "BLS; Congressional Budget Office estimate of the noncyclical rate of unemployment, approximate.",
    graph: "unemploymentPath",
  },
  {
    id: "separation-rate", n: 92, week: W, starred: true, tags: ["PE P2 Q2"],
    term: "Job separation rate (s)",
    simple: "The fraction of employed workers who lose their jobs each period.",
    more: [
      "Includes layoffs and quits into unemployment. A higher s raises the natural rate.",
      "Policy can lower s: e.g. better matching so jobs last longer.",
    ],
    connections: ["finding-rate", "steady-state-condition", "ss-unemployment-rate"],
    example: "Textbook rough US monthly numbers (Mankiw): about 1% of the employed lose their jobs each month, s ≈ 0.01.",
    played: [
      "E = 9,500 workers, s = 0.02.",
      "Job losses this period = 0.02 × 9,500 = 190.",
    ],
    graph: "flows",
  },
  {
    id: "finding-rate", n: 93, week: W, starred: true, tags: ["PE P2 Q2"],
    term: "Job finding rate (f)",
    simple: "The fraction of unemployed workers who find jobs each period.",
    more: [
      "A higher f lowers the natural rate. Anything that speeds up matching (job boards, less generous or shorter UI, better information) raises f.",
    ],
    connections: ["separation-rate", "steady-state-condition", "frictional", "ui"],
    example: "Textbook rough US monthly numbers (Mankiw): about 20% of the unemployed find a job each month, f ≈ 0.20. Together with s ≈ 0.01, that gives u = 0.01 / 0.21 ≈ 4.8%.",
    played: [
      "U = 500, f = 0.28.",
      "Hires out of unemployment = 0.28 × 500 = 140.",
    ],
    graph: "flows",
  },
  {
    id: "unemployment-dynamics", n: 94, week: W, starred: true, tags: ["PE P2 Q2"],
    term: "Unemployment dynamics",
    simple: "Next period's unemployed = those who stayed unemployed + newly separated workers.",
    formula: `<i>U</i><sub><i>t</i>+1</sub>${op("=")}(1 − <i>f</i>)<i>U</i><sub><i>t</i></sub>${op("+")}<i>s E</i><sub><i>t</i></sub>`,
    more: [
      "Read the pieces: (1 − f)U<sub>t</sub> didn't find a job; sE<sub>t</sub> lost one.",
    ],
    connections: ["employment-dynamics", "steady-state-condition", "stock-flow"],
    played: [
      "L = 10,000. Start U = 1,200, E = 8,800 (u = 12%). s = 0.02, f = 0.28.",
      "U<sub>t+1</sub> = 0.72 × 1,200 + 0.02 × 8,800 = 864 + 176 = <b>1,040</b> (10.4%).",
      "Next: 0.72 × 1,040 + 0.02 × 8,960 = 749 + 179 = 928 (9.3%). Converging toward 667.",
    ],
    graph: "unemploymentPath",
  },
  {
    id: "employment-dynamics", n: 95, week: W, starred: true, tags: ["PE P2 Q2"],
    term: "Employment dynamics",
    simple: "Next period's employed = those who kept their jobs + unemployed who found one.",
    formula: `<i>E</i><sub><i>t</i>+1</sub>${op("=")}(1 − <i>s</i>)<i>E</i><sub><i>t</i></sub>${op("+")}<i>f U</i><sub><i>t</i></sub>`,
    more: [
      "Adds up with the unemployment equation: E<sub>t+1</sub> + U<sub>t+1</sub> = E<sub>t</sub> + U<sub>t</sub> = L (fixed labor force).",
    ],
    connections: ["unemployment-dynamics", "steady-state-condition"],
    played: [
      "E = 8,800, U = 1,200, s = 0.02, f = 0.28.",
      "E<sub>t+1</sub> = 0.98 × 8,800 + 0.28 × 1,200 = 8,624 + 336 = <b>8,960</b>.",
      "Check: 8,960 + 1,040 = 10,000 = L ✓",
    ],
    graph: "unemploymentPath",
  },
  {
    id: "steady-state-condition", n: 96, week: W, starred: true, tags: ["PE P2 Q2b"],
    term: "Steady-state condition",
    simple: "Flows into unemployment equal flows out.",
    formula: `<i>s E</i>${op("=")}<i>f U</i>`,
    more: [
      "When the flows balance, U and E stop changing, even though people keep moving between them every period.",
    ],
    connections: ["ss-unemployment-rate", "separation-rate", "finding-rate"],
    played: [
      "Steady state with L = 10,000, s = 0.02, f = 0.28: U = 667, E = 9,333.",
      "Inflow sE = 0.02 × 9,333 = 187. Outflow fU = 0.28 × 667 = 187 ✓",
    ],
    graph: "flows",
  },
  {
    id: "ss-unemployment-rate", n: 97, week: W, starred: true, tags: ["PE P2 Q2"],
    term: "Steady-state unemployment rate",
    simple: "Substitute E = L − U into sE = fU and solve: the natural rate depends only on s and f.",
    formula: `${fr("<i>U</i>", "<i>L</i>")}${op("=")}${fr("<i>s</i>", "<i>s</i> + <i>f</i>")}`,
    more: [
      "Derivation: s(L − U) = fU → sL = (s + f)U → U/L = s/(s + f).",
      "Policies that lower s or raise f lower the natural rate.",
    ],
    connections: ["steady-state-condition", "natural-rate", "separation-rate", "finding-rate"],
    example: "With the textbook US numbers s = 0.01 and f = 0.20, the steady state is 0.01 / 0.21 ≈ 4.8%, close to US averages.",
    played: [
      "s = 0.02, f = 0.28.",
      "u = 0.02 / (0.02 + 0.28) = 0.02 / 0.30 = <b>6.67%</b>.",
      "If f rises to 0.38: u = 0.02 / 0.40 = 5%.",
    ],
    graph: "unemploymentPath",
  },
  {
    id: "frictional", n: 98, week: W, starred: true, tags: ["PE Q8"],
    term: "Frictional unemployment",
    simple: "Unemployment from the time it takes to match workers and jobs. Updating a résumé or holding out for a good match is frictional.",
    more: [
      "Caused by job search: workers and jobs differ, information is imperfect, and moving takes time. It's partly useful: a good match is more productive.",
      "Sectoral shifts (jobs moving from one industry or region to another) add to it.",
    ],
    connections: ["structural", "finding-rate", "ui", "natural-rate"],
    example: "A new graduate spends six weeks interviewing before accepting an offer, or a nurse moves from Ohio to Texas and needs time to find a hospital job.",
    numbers: [
      ["US job openings, peak (Mar 2022)", "≈ 12 million"],
    ],
    numbersSource: "BLS JOLTS. Even with more openings than unemployed people, unemployment never hit zero: search takes time.",
    graph: "flows",
  },
  {
    id: "structural", n: 99, week: W, starred: true, tags: ["PE Q8"],
    term: "Structural unemployment",
    simple: "Unemployment from wages held above the market-clearing level, so more labor is supplied than demanded. In class: <b>unions</b> and a <b>minimum wage</b> above equilibrium.",
    more: [
      "Unlike frictional unemployment, these workers aren't still searching for a good match: there just aren't enough jobs at the going wage. They wait for openings.",
      "Three sources of the wage rigidity behind it: minimum wages, unions, efficiency wages.",
    ],
    connections: ["wage-rigidity", "unions", "minimum-wage", "efficiency-wages", "frictional"],
    played: [
      "Labor demand: L<sup>d</sup> = 100 − 5w. Supply: L<sup>s</sup> = 40 + 5w. Equilibrium w = 6, L = 70.",
      "Wage floor at w = 8: L<sup>d</sup> = 60, L<sup>s</sup> = 80.",
      "Structural unemployment = 80 − 60 = <b>20</b>.",
    ],
    graph: { key: "wageFloor", args: { label: "wage held above equilibrium" } },
  },
  {
    id: "wage-rigidity", n: 100, week: W, starred: true, tags: ["PE Q8", "BG"],
    term: "Wage rigidity",
    simple: "Wages failing to fall to the level where supply equals demand. It's the source of structural unemployment.",
    more: [
      "Sources: minimum-wage laws, union bargaining, efficiency wages, and the reluctance to cut nominal pay.",
    ],
    connections: ["structural", "minimum-wage", "unions", "efficiency-wages", "benefit-inflation"],
    example: "In the Great Recession, many firms laid workers off rather than cut everyone's pay. Studies of payroll data found nominal wage cuts were rare even when unemployment hit 10%.",
    graph: { key: "wageFloor", args: { label: "rigid wage" } },
  },
  {
    id: "unions", n: 101, week: W, starred: true, tags: ["PE Q8b"],
    term: "Unions and unemployment",
    simple: "Unions can push members' wages above the going rate in non-union workplaces, reducing jobs (structural unemployment).",
    more: [
      "Insiders (union members with jobs) gain; outsiders (those who would like those jobs) lose, and may end up unemployed or in lower-paid non-union work.",
      "Union power differs a lot across countries, one reason European unemployment has often been higher than US unemployment.",
    ],
    connections: ["structural", "wage-rigidity", "minimum-wage"],
    numbers: [
      ["US union membership rate, 2024", "9.9%"],
      ["Mid-1950s", "about one-third"],
    ],
    numbersSource: "BLS Union Members release (2024); historical estimates for the 1950s.",
    graph: { key: "wageFloor", args: { label: "union wage" } },
  },
  {
    id: "minimum-wage", n: 102, week: W, starred: true, tags: ["PE Q8c", "L3"],
    term: "Minimum wage and unemployment",
    simple: "A minimum wage well above equilibrium creates structural unemployment.",
    more: [
      "Matters most for teenagers and low-skill workers, whose equilibrium wage is closest to the floor.",
      "Empirical debate: modest increases (Card & Krueger's New Jersey study, 1994) show small job losses; large ones relative to local wages are riskier.",
    ],
    connections: ["structural", "wage-rigidity", "unions", "wage-compression"],
    example: "The federal minimum has been $7.25 an hour since July 2009, now below market wages in most of the country, so it binds for very few workers. Many states and cities set much higher minimums of $15 or more.",
    numbers: [
      ["Federal minimum wage (since Jul 2009)", "$7.25/hour"],
    ],
    numbersSource: "US Department of Labor.",
    played: [
      "Teen labor market: equilibrium wage $12, 1,000 teens employed.",
      "Minimum set at $16: firms want 800, 1,200 want to work.",
      "400 teens structurally unemployed; 200 jobs lost.",
    ],
    graph: { key: "wageFloor", args: { label: "minimum wage" } },
  },
  {
    id: "efficiency-wages", n: 103, week: W, tags: ["BG"],
    term: "Efficiency wages",
    simple: "Firms pay above market wages to raise productivity: less turnover and more effort. Another source of wage rigidity. (Not in the practice key, so confirm in your notes.)",
    more: [
      "Reasons: well-paid workers quit less (lower hiring and training costs), shirk less (they'd lose a good job), are healthier, and the high wage attracts better applicants.",
      "Because the wage stays high voluntarily, the labor market doesn't clear: structural unemployment without any law or union.",
    ],
    connections: ["wage-rigidity", "structural", "unions"],
    example: "In 1914 Henry Ford doubled pay to $5 a day. Turnover, which had been around 370% a year, collapsed, absenteeism fell, productivity rose, and thousands lined up outside the factory for jobs.",
    graph: { key: "wageFloor", args: { label: "efficiency wage" } },
  },
  {
    id: "ui", n: 104, week: W, starred: true, tags: ["PE Q12"],
    term: "Unemployment insurance (UI)",
    simple: "A program funded by taxes on employers (and employees) that replaces part of an unemployed worker's income, usually 30–50%, for a limited time, usually up to 26 weeks, while they search.",
    more: [
      "Trade-off: it eases hardship and lets people hold out for a better match, but it lowers the urgency to accept a job, so it reduces f and raises frictional unemployment.",
      "Firms with more past layoffs pay higher UI taxes (“experience rating”), which discourages layoffs, but only partially.",
    ],
    connections: ["finding-rate", "frictional", "ss-unemployment-rate"],
    example: "In 2020 the CARES Act added $600 a week on top of state benefits. For many low-wage workers that meant more income on UI than at work, and a lively debate about whether it slowed rehiring.",
    numbers: [
      ["Typical maximum duration", "26 weeks"],
      ["Typical replacement rate", "30–50%"],
      ["CARES Act top-up, 2020", "$600/week"],
    ],
    numbersSource: "US Department of Labor; CARES Act (2020).",
    played: [
      "UI makes the unemployed search longer: f falls from 0.28 to 0.23.",
      "u = 0.02 / (0.02 + 0.23) = 8% (was 6.67%).",
    ],
    graph: "unemploymentPath",
  },
  {
    id: "unemployment-imperfect", n: 105, week: W, starred: true, tags: ["PE Q3"],
    term: "Why the unemployment rate is imperfect",
    simple: "It ignores discouraged workers outside the labor force. If unemployed people give up and leave, the rate falls even though conditions didn't improve.",
    more: [
      "It also ignores underemployment: part-timers who want full-time work and graduates in jobs that don't need a degree.",
      "So economists check the employment-population ratio, prime-age participation and broader rates (U-6) alongside it.",
    ],
    connections: ["discouraged", "epop", "not-in-lf", "unemployment-rate"],
    example: "After the Great Recession, unemployment fell from 10% in 2009 to under 5% by 2016, but part of that fall came from people leaving the labor force; the employment-population ratio recovered much more slowly.",
    played: [
      "E = 90, U = 10: u = 10%, E/pop (pop = 150) = 60%.",
      "2 unemployed give up: u = 8/98 = 8.2%; E/pop still 60%.",
    ],
    graph: "laborForceTree",
  },
];
