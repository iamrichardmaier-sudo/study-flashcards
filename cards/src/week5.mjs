import { fr, op } from "./helpers.mjs";

const W = 5;

// One running Solow economy so the numbers connect across cards:
//   y = k^(1/2)  (α = 1/2 keeps the roots clean), s = 0.3, δ = 0.1
//   k* = (s/δ)^2 = 9, y* = 3, i* = 0.9 = δk*, c* = 2.1
//   golden rule: k_gold = (α/δ)^2 = 25, y = 5, c = 2.5, s_gold = 0.5 = α

export default [
  {
    id: "income-wellbeing", n: 106, week: W, starred: true, tags: ["PE Q7"],
    term: "Income per worker as a measure of well-being",
    simple: "Justified because it is <b>correlated with many other things we care about</b>, and it is <b>easy to compute consistently</b> for many countries.",
    more: [
      "Richer countries have longer lives, lower child mortality, more schooling and more leisure. Income per worker isn't happiness, but it's a strong proxy.",
      "Consistency matters for comparing countries and decades: national accounts are built to common standards; most other measures aren't.",
    ],
    connections: ["gdp-wellbeing", "solow", "per-worker"],
    example: "A child born in a rich country can expect to live into their 80s; in the poorest countries life expectancy is around the low 60s. The ranking by income and the ranking by life expectancy are strikingly similar.",
  },
  {
    id: "solow", n: 107, week: W, tags: ["Ch 9 key concept"],
    term: "Solow growth model",
    simple: "A model of how saving, depreciation, and (in extensions) population growth and technology determine capital per worker and income per worker over time.",
    more: [
      "Core idea: saving adds capital, depreciation wears it out, and diminishing returns mean each new unit of capital adds less. So capital accumulation alone can't keep income growing forever: the economy settles at a <b>steady state</b>.",
      "Long-run growth in income per worker has to come from technology.",
    ],
    connections: ["capital-accumulation", "steady-state", "solow-diagram", "saving-growth"],
    example: "Robert Solow won the 1987 Nobel Prize for this model. It explains why war-damaged Japan and Germany grew so fast after 1945, and why that fast growth slowed.",
    played: [
      "y = k<sup>1/2</sup>, s = 0.3, δ = 0.1, starting at k = 4: y = 2.",
      "Investment 0.3 × 2 = 0.6, depreciation 0.4 → k rises to 4.2.",
      "Repeat: k keeps rising, by less each time, toward k* = 9.",
    ],
    graph: { key: "solow", args: { mode: "basic" } },
  },
  {
    id: "per-worker", n: 108, week: W, starred: true, tags: ["PS5", "PE P2 Q1"],
    term: "Capital per worker and output per worker",
    simple: "Divide everything by L. Constant returns let output per worker depend only on capital per worker.",
    formula: `<i>k</i>${op("=")}${fr("<i>K</i>", "<i>L</i>")},<span style="display:inline-block;width:16px"></span><i>y</i>${op("=")}${fr("<i>Y</i>", "<i>L</i>")}${op("=")}<i>f</i>(<i>k</i>)${op("=")}<i>k</i><sup>α</sup>`,
    more: [
      "Derivation: Y = K<sup>α</sup>L<sup>1−α</sup> → Y/L = K<sup>α</sup>L<sup>−α</sup> = (K/L)<sup>α</sup>.",
      "f(k) is concave: diminishing marginal product of capital per worker.",
    ],
    connections: ["crs", "solow", "capital-accumulation", "cobb-douglas"],
    played: [
      "K = 900, L = 100 → k = 9.",
      "With α = 1/2: y = 9<sup>1/2</sup> = 3. Total output Y = 3 × 100 = 300.",
    ],
    graph: { key: "solow", args: { mode: "basic" } },
  },
  {
    id: "inv-cons-per-worker", n: 109, week: W, starred: true, tags: ["PS5", "PE P2 Q1"],
    term: "Investment and consumption per worker",
    simple: "A fraction s of output is saved and invested; the rest is consumed.",
    formula: `<i>i</i>${op("=")}<i>s f</i>(<i>k</i>),<span style="display:inline-block;width:16px"></span><i>c</i>${op("=")}(1 − <i>s</i>)<i>f</i>(<i>k</i>)`,
    more: [
      "<i>s</i> is the saving rate, exogenous in the Solow model. Closed economy, no government: saving = investment.",
    ],
    connections: ["per-worker", "capital-accumulation", "golden-rule"],
    numbers: [
      ["US gross national saving (approx.)", "≈ 18% of GDP"],
      ["China gross national saving (approx.)", "≈ 43% of GDP"],
    ],
    numbersSource: "IMF/World Bank national accounts, approximate recent levels.",
    played: [
      "k = 9, y = 3, s = 0.3.",
      "i = 0.3 × 3 = <b>0.9</b>; c = 0.7 × 3 = <b>2.1</b>.",
    ],
    graph: { key: "solow", args: { mode: "basic" } },
  },
  {
    id: "depreciation", n: 110, week: W, starred: true, tags: ["PS5", "PE P2 Q1"],
    term: "Depreciation (δ)",
    simple: "The fraction of the capital stock that wears out each period. Depreciation per worker is δk.",
    formula: `depreciation per worker${op("=")}δ<i>k</i>`,
    more: [
      "Proportional to k: the more capital you have, the more you have to replace. That's why δk is a straight line through the origin in the Solow diagram, while investment s f(k) flattens out. They must cross.",
    ],
    connections: ["capital-accumulation", "steady-state", "solow-diagram"],
    example: "A laptop that's useless after four years depreciates at roughly 25% a year; a factory building might last 40 years (about 2.5%). Mankiw's US calibration has δ ≈ 4% for the whole capital stock.",
    played: [
      "k = 9, δ = 0.1 → depreciation = 0.9 per worker per period.",
    ],
    graph: { key: "solow", args: { mode: "basic" } },
  },
  {
    id: "capital-accumulation", n: 111, week: W, starred: true, tags: ["PE P2 Q1", "PS5"],
    term: "Capital accumulation",
    simple: "Next period's capital = what survives depreciation + new investment. Per worker: the change in k is investment minus depreciation.",
    formula: `<i>K</i><sub><i>t</i>+1</sub>${op("=")}(1 − δ)<i>K</i><sub><i>t</i></sub>${op("+")}<i>I</i><sub><i>t</i></sub><span style="display:inline-block;width:14px"></span>Δ<i>k</i>${op("=")}<i>s f</i>(<i>k</i>)${op("−")}δ<i>k</i>`,
    more: [
      "This one equation drives the whole Solow model. If sf(k) > δk, k grows; if sf(k) < δk, k shrinks.",
    ],
    connections: ["stock-flow", "depreciation", "inv-cons-per-worker", "steady-state"],
    played: [
      "k = 4: Δk = 0.3 × 2 − 0.1 × 4 = 0.6 − 0.4 = +0.2.",
      "k = 16: Δk = 0.3 × 4 − 0.1 × 16 = 1.2 − 1.6 = −0.4.",
      "k = 9: Δk = 0.9 − 0.9 = 0 (steady state).",
    ],
    graph: { key: "solow", args: { mode: "basic" } },
  },
  {
    id: "steady-state", n: 112, week: W, tags: ["Ch 9 key concept", "PS5"],
    term: "Steady state",
    simple: "The capital per worker at which investment just covers depreciation, so k stops changing.",
    formula: `<i>s f</i>(<i>k</i>*)${op("=")}δ<i>k</i>*`,
    more: [
      "It's <b>stable</b>: from any starting k, the economy moves toward k*.",
      "In the basic model, income per worker stops growing there; only population and technology growth keep total output growing.",
    ],
    connections: ["ss-capital", "capital-accumulation", "solow-diagram", "golden-rule"],
    played: [
      "0.3 × k<sup>1/2</sup> = 0.1 × k → k<sup>1/2</sup> = 3 → <b>k* = 9</b>.",
    ],
    graph: { key: "solow", args: { mode: "basic" } },
  },
  {
    id: "ss-capital", n: 113, week: W, tags: ["PS5"],
    term: "Steady-state capital per worker",
    simple: "For y = k<sup>α</sup>, solve sk<sup>α</sup> = δk.",
    formula: `<i>k</i>*${op("=")}(${fr("<i>s</i>", "δ")})<sup>1/(1−α)</sup>, <i>y</i>*${op("=")}(${fr("<i>s</i>", "δ")})<sup>α/(1−α)</sup>, <i>c</i>*${op("=")}(1 − <i>s</i>)<i>y</i>*`,
    more: [
      "Higher saving s → higher k* and y*. Higher depreciation δ → lower k* and y*.",
      "With α = 1/3 the exponents are 3/2 and 1/2.",
    ],
    connections: ["steady-state", "saving-growth", "golden-capital-cd"],
    played: [
      "α = 1/2, s = 0.3, δ = 0.1: s/δ = 3.",
      "k* = 3<sup>2</sup> = <b>9</b>; y* = 3<sup>1</sup> = <b>3</b>; c* = 0.7 × 3 = <b>2.1</b>.",
      "With α = 1/3 instead: k* = 3<sup>1.5</sup> = 5.2, y* = 3<sup>0.5</sup> = 1.73.",
    ],
    graph: { key: "solow", args: { mode: "basic" } },
  },
  {
    id: "solow-diagram", n: 114, week: W, starred: true, tags: ["PE P2 Q1b"],
    term: "Solow diagram",
    simple: "k on the horizontal axis; the concave curve sf(k); the straight line δk from the origin. They cross at k*. Left of k*, k rises; right of it, k falls. Label every line and intersection.",
    more: [
      "Exam checklist: axis labels, f(k) (optional but nice), sf(k), δk, k* marked on the axis, arrows showing the direction k moves on each side.",
      "Vertical gap between sf(k) and δk = Δk. Gap between f(k) and sf(k) = consumption.",
    ],
    connections: ["steady-state", "capital-accumulation", "saving-growth", "pop-growth"],
    graph: { key: "solow", args: { mode: "diagram" } },
  },
  {
    id: "saving-growth", n: 115, week: W, starred: true, tags: ["PE Q17", "Ch 9 #5"],
    term: "Saving rate and growth",
    simple: "A higher saving rate raises the steady-state <b>level</b> of income per worker, with only temporarily faster growth. It does <b>not</b> raise the long-run growth rate.",
    more: [
      "Diminishing returns: the extra capital adds less and less until depreciation catches up again at the new, higher k*.",
      "Across countries, high savers are richer (higher level), consistent with the model.",
    ],
    connections: ["ss-capital", "golden-rule", "solow-diagram", "convergence"],
    example: "Singapore and South Korea saved and invested very heavily from the 1960s, grew very fast for decades, and are now rich. But their growth has slowed to rich-country rates, as the model predicts.",
    played: [
      "s rises 0.3 → 0.4 (δ = 0.1).",
      "New k* = 4<sup>2</sup> = 16, y* = 4 (was 3): a 33% higher level.",
      "During the transition y grows fast; once at y* = 4, growth in y returns to zero.",
    ],
    graph: "savingPath",
  },
  {
    id: "golden-rule", n: 116, week: W, starred: true, tags: ["Ch 9 key concept", "PS5", "PE P2 Q1a"],
    term: "Golden rule level of capital",
    simple: "The steady-state capital per worker that <b>maximizes consumption per worker</b>.",
    more: [
      "More capital isn't always better: past some point, the extra output from more capital doesn't even cover the extra depreciation, so you'd have to consume less to keep it.",
      "A policymaker can pick s to land on k_gold.",
    ],
    connections: ["golden-condition", "golden-capital-cd", "golden-saving", "below-above-golden"],
    played: [
      "c* = f(k*) − δk*. Try k* = 9: 3 − 0.9 = 2.1. k* = 25: 5 − 2.5 = <b>2.5</b>. k* = 49: 7 − 4.9 = 2.1.",
      "Consumption peaks at k = 25: the golden rule.",
    ],
    graph: { key: "solow", args: { mode: "golden" } },
  },
  {
    id: "golden-condition", n: 117, week: W, starred: true, tags: ["PE P2 Q1a", "Ch 9 #2d"],
    term: "Golden rule condition",
    simple: "Maximize c* = f(k*) − δk*: set the derivative to zero. At the golden rule, the marginal product of capital equals depreciation.",
    formula: `<i>f</i>′(<i>k</i><sub>gold</sub>)${op("=")}δ<span style="display:inline-block;width:16px"></span>(MPK${op("=")}δ)`,
    more: [
      "Intuition: one more unit of capital adds MPK of output but costs δ of upkeep every period. Keep adding capital while MPK > δ.",
    ],
    connections: ["golden-rule", "mpk", "golden-capital-cd", "below-above-golden"],
    example: "Mankiw's US calibration: capital ≈ 2.5 × GDP, depreciation ≈ 10% of GDP, capital income ≈ 30% of GDP. So δ = 0.1/2.5 = 4% and MPK = 0.3/2.5 = 12%. MPK > δ, so the US has <b>less</b> capital than the golden rule.",
    played: [
      "f(k) = k<sup>1/2</sup>, f′(k) = 0.5 k<sup>−1/2</sup>.",
      "Set 0.5 k<sup>−1/2</sup> = 0.1 → k<sup>1/2</sup> = 5 → <b>k_gold = 25</b>.",
    ],
    graph: { key: "solow", args: { mode: "golden" } },
  },
  {
    id: "golden-capital-cd", n: 118, week: W, starred: true, tags: ["PE P2 Q1a", "PS5"],
    term: "Golden rule capital (Cobb-Douglas)",
    simple: "For y = k<sup>α</sup>, MPK = αk<sup>α−1</sup>. Set it equal to δ and solve.",
    formula: `α<i>k</i><sup>α−1</sup>${op("=")}δ${op("⇒")}<i>k</i><sub>gold</sub>${op("=")}(${fr("α", "δ")})<sup>1/(1−α)</sup>`,
    connections: ["golden-condition", "golden-saving", "ss-capital"],
    played: [
      "α = 1/2, δ = 0.1: k_gold = (0.5/0.1)<sup>2</sup> = 5<sup>2</sup> = <b>25</b>.",
      "α = 1/3, δ = 0.1: k_gold = (3.33)<sup>1.5</sup> = <b>6.09</b>.",
    ],
    graph: { key: "solow", args: { mode: "golden" } },
  },
  {
    id: "golden-saving", n: 119, week: W, starred: true, tags: ["PE P2 Q1a", "PS5"],
    term: "Golden rule saving rate",
    simple: "Plug k_gold into sf(k) = δk. Under Cobb-Douglas the golden-rule saving rate equals α. Show the derivation on the exam: stating it alone loses points.",
    formula: `<i>s</i><sub>gold</sub>${op("=")}α`,
    more: [
      "Derivation: s = δk / f(k) = δk / k<sup>α</sup> = δk<sup>1−α</sup>. At k_gold, k<sup>1−α</sup> = α/δ, so s = δ × α/δ = α.",
      "Intuition: at the golden rule, investment δk exactly equals capital's income MPK × k = αy. So you save capital's share.",
    ],
    connections: ["golden-capital-cd", "capital-share", "golden-rule", "below-above-golden"],
    example: "With α ≈ 1/3, the golden-rule saving rate is about 33%. The US saves well under that (≈ 18% gross), China a bit over it (≈ 43%).",
    played: [
      "α = 1/2, δ = 0.1, k_gold = 25, f(25) = 5.",
      "s = δk / f(k) = (0.1 × 25) / 5 = 2.5 / 5 = <b>0.5 = α</b> ✓",
    ],
    graph: "goldenHump",
  },
  {
    id: "below-above-golden", n: 120, week: W, tags: ["Ch 9 summary", "PS5"],
    term: "Below vs above the golden rule",
    simple: "<b>Below</b> (k* < k_gold): raising saving lowers consumption now and raises it later. <b>Above</b>: cutting saving raises consumption at every date.",
    more: [
      "Below: a genuine trade-off between generations; the current generation must sacrifice.",
      "Above: a free lunch. Cutting s means eating more today, and since you're moving toward the golden rule, steady-state consumption rises too. So a policymaker would never choose to stay above it.",
    ],
    connections: ["golden-rule", "golden-saving", "saving-growth"],
    played: [
      "Below: s = 0.3, c* = 2.1. Raise s to 0.5: c drops right away to 0.5 × 3 = 1.5, then climbs to 2.5.",
      "Above: s = 0.7, k* = 49, c* = 0.3 × 7 = 2.1. Cut s to 0.5: c jumps to 0.5 × 7 = 3.5, then eases down to 2.5 > 2.1.",
    ],
    graph: "goldenHump",
  },
  {
    id: "lf-fall", n: 121, week: W, starred: true, tags: ["PE P2 Q1b", "PS5 (Ch 9 #3)"],
    term: "Fall in the labor force",
    simple: "K unchanged, L falls, so k = K/L jumps above k*. Income per worker jumps up, then declines (negative growth) back to the <b>same</b> steady state. Total output falls.",
    more: [
      "Nothing about s, δ or f changed, so k* is the same. Above k*, depreciation exceeds investment and k falls back.",
      "Watch the per-worker vs total distinction: y goes up then back; Y falls and stays lower.",
    ],
    connections: ["consumption-lf-fall", "steady-state", "capital-accumulation", "pop-growth"],
    example: "The Black Death (1347–51) killed perhaps a third of Europe's population but left buildings, tools and land intact. Output per worker and real wages rose for decades afterwards.",
    played: [
      "K = 900, L = 100 → k = 9 = k*, y = 3, Y = 300.",
      "L falls to 81: k = 900 / 81 = 11.1, y = 3.33 (up), Y = 270 (down).",
      "Over time K falls to 729: k = 9, y = 3 again, Y = 243.",
    ],
    graph: { key: "solowShock", args: { v: "y" } },
  },
  {
    id: "consumption-lf-fall", n: 122, week: W, starred: true, tags: ["PE P2 Q1c"],
    term: "Consumption after a labor-force fall",
    simple: "With s unchanged, c = (1 − s)y follows income: it jumps up, then declines back to its original steady-state level.",
    formula: `<i>c</i>${op("=")}(1 − <i>s</i>)<i>y</i>`,
    connections: ["lf-fall", "inv-cons-per-worker"],
    played: [
      "Before: y = 3, c = 0.7 × 3 = 2.1.",
      "Right after: y = 3.33, c = 2.33.",
      "Long run: y = 3, c = 2.1 again.",
    ],
    graph: { key: "solowShock", args: { v: "c" } },
  },
  {
    id: "pop-growth", n: 123, week: W, tags: ["BG (Lecture 9 slides empty)"],
    term: "Population growth in the Solow model",
    simple: "With population growth n, capital per worker is diluted. Faster population growth lowers steady-state capital and income per worker.",
    formula: `Δ<i>k</i>${op("=")}<i>s f</i>(<i>k</i>)${op("−")}(δ + <i>n</i>)<i>k</i>`,
    more: [
      "Each period, new workers need capital too: break-even investment rises from δk to (δ + n)k.",
      "In this steady state y is constant, but total output Y grows at rate n.",
    ],
    connections: ["capital-accumulation", "steady-state", "pop-ideas", "lf-fall"],
    example: "Across countries, those with faster population growth tend to have lower income per person, as the model predicts (though causation runs both ways).",
    played: [
      "s = 0.3, δ = 0.1, n = 0.02: k* = (0.3 / 0.12)<sup>2</sup> = 2.5<sup>2</sup> = <b>6.25</b>.",
      "y* = 2.5, down from 3 with n = 0.",
    ],
    graph: { key: "solow", args: { mode: "pop" } },
  },
  {
    id: "pop-ideas", n: 124, week: W, starred: true, tags: ["PE Q4"],
    term: "Population growth and ideas",
    simple: "Declining population growth may slow innovation, because fewer people are generating new ideas. (True on the practice exam.)",
    more: [
      "Ideas are non-rival: once invented, everyone can use them. More researchers means more ideas, and those ideas raise A for everybody.",
      "This cuts against the basic Solow result (more people dilutes capital). Both effects are real: one is about capital per worker, the other about the growth of technology.",
    ],
    connections: ["pop-growth", "tfp", "solow"],
    example: "South Korea's fertility rate fell to about 0.72 children per woman in 2023, the lowest in the world. Economists worry that shrinking cohorts of young researchers will slow innovation there and in other aging countries.",
    numbers: [
      ["South Korea fertility rate, 2023", "≈ 0.72"],
      ["Replacement level", "≈ 2.1"],
    ],
    numbersSource: "Statistics Korea.",
  },
  {
    id: "china", n: 125, week: W, starred: true, tags: ["PE Q6", "L8"],
    term: "Why China's growth slowed",
    simple: "Unsustainable policy boosts; accumulated inefficiencies after long fast growth; recessions abroad hurting export demand; nearing its steady state; a pivot to consumption-led growth (lower saving).",
    more: [
      "Solow reading: China's huge investment rates pushed k up fast, so diminishing returns set in and it's closer to its steady state.",
      "Lower saving (a shift toward consumption) lowers k* and slows the transition.",
      "Credit-fueled stimulus, a property bust and an aging, shrinking workforce add to the slowdown.",
    ],
    connections: ["convergence", "saving-growth", "steady-state", "golden-saving"],
    numbers: [
      ["China real GDP growth, 2010", "10.6%"],
      ["2019", "6.0%"],
      ["2025", "5.0%"],
      ["2025 by quarter", "5.4 → 5.2 → 4.8 → 4.5%"],
    ],
    numbersSource: "National Bureau of Statistics of China. BOFIT estimates 2025 growth about 1 point below the official figure.",
    graph: "chinaGrowth",
  },
  {
    id: "convergence", n: 126, week: W, tags: ["L8", "Ch 9"],
    term: "Catch-up (convergence) growth",
    simple: "Economies far below their steady state grow fast as capital accumulates, then slow down. Example: postwar Japan and Germany.",
    more: [
      "Low k means high MPK, so each unit of investment adds a lot of output. As k approaches k*, growth fades.",
      "Conditional convergence: countries converge to <i>their own</i> steady states (set by s, n, δ and technology), not necessarily to the same income level. That's why poor countries don't automatically catch up.",
    ],
    connections: ["solow", "steady-state", "china", "saving-growth"],
    example: "Japan's economy grew around 9–10% a year from the mid-1950s to the early 1970s, and West Germany's “economic miracle” ran about 8% a year in the 1950s. Both slowed to rich-country rates once rebuilt.",
    played: [
      "Same s, δ: k* = 9. Country A starts at k = 1, country B at k = 8.",
      "A: Δk = 0.3 × 1 − 0.1 × 1 = 0.2 (+20%). B: Δk = 0.3 × 2.83 − 0.8 = 0.05 (+0.6%).",
      "The poorer country grows far faster.",
    ],
    graph: "convergence",
  },
];
