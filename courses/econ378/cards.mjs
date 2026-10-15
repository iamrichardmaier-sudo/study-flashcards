// ECON 378 flashcards, in the ECON 381 card schema (see cards/src/week2.mjs).
//
// Running examples, so the numbers connect across cards:
//   regression data   x = 1, 2, 3, 4, 5;  y = 2, 4, 5, 4, 5
//                     x̄ = 3, ȳ = 4, Sxy = 6, Sxx = 10, Syy = 6
//                     r = 6/√60 = 0.775, β̂₁ = 0.6, β̂₀ = 2.2, SSR = 2.4, R² = 0.6
//   discrete X        P(X = 0, 1, 2, 3) = .1, .3, .4, .2 → E[X] = 1.7, Var = 0.81
//   CI / test         σ = 12, n = 36 → SE = 2;  95% margin 1.96 × 2 = 3.92
//   screening test    prevalence 1%, sensitivity 90%, false-positive rate 5%
//
// tools/course-econ378.test.mjs re-derives every number in `played`.

import { fr, op } from "../../cards/src/helpers.mjs";

const gap = '<span style="display:inline-block;width:14px"></span>';

export default [
  // ------------------------------------------------------- 1 · descriptive
  {
    id: "mean", n: 1, week: 1,
    term: "Sample mean",
    simple: "The sum of the values divided by how many there are: the balance point of the data.",
    formula: `<i>x̄</i>${op("=")}${fr("1", "<i>n</i>")}Σ<i>x</i><sub><i>i</i></sub>`,
    more: [
      "Every value pulls on the mean in proportion to its size, so one extreme value can move it a lot. In a <b>right-skewed</b> distribution (income, wealth, house prices) the long upper tail drags the mean <b>above</b> the median.",
      "The deviations from the mean always sum to zero: Σ(<i>x<sub>i</sub></i> − <i>x̄</i>) = 0. That is what “balance point” means, and why you square deviations before averaging them for the variance.",
      "Exam trap: “the average household” is not the typical household when data are skewed. Report the median too, and say which one you are using.",
    ],
    connections: ["median", "svar", "unbiased", "ev"],
    example: "Household wealth: a few billionaires raise mean net worth enormously but leave the median family untouched. That's why the Fed reports both, and why the gap between them is itself a measure of inequality.",
    numbers: [
      ["Median family net worth, 2022", "$192,900"],
      ["Mean family net worth, 2022", "$1,063,700"],
      ["Mean ÷ median", "≈ 5.5×"],
    ],
    numbersSource: "Federal Reserve, “Changes in U.S. Family Finances from 2019 to 2022” (Survey of Consumer Finances), October 2023; 2022 dollars.",
    played: [
      "Five incomes ($000s): 30, 35, 40, 45, 250. Sum = 400.",
      "x̄ = 400 / 5 = <b>80</b>, but the median is 40: four of the five earn less than the mean.",
      "Drop the 250: x̄ = 150 / 4 = 37.5 and the median = (35 + 40)/2 = 37.5. One outlier moved the mean by 42.5.",
    ],
    graph: "econ378Skew",
  },
  {
    id: "median", n: 2, week: 1,
    term: "Median",
    simple: "The middle value of the sorted data (the average of the two middle values when n is even); half the data lie on each side.",
    more: [
      "The median only cares about <i>order</i>, not size, so it is <b>resistant to outliers</b>: making the largest value ten times bigger leaves it unchanged.",
      "Mean vs. median tells you the shape: mean > median suggests right skew, mean < median left skew, roughly equal suggests symmetry.",
      "Trap: with an even n, the median is the average of the two middle values, not either one of them. And sort first; the middle of the unsorted list means nothing.",
    ],
    connections: ["mean", "iqr", "zscore"],
    example: "The Census Bureau's headline income figure is <b>median</b> household income, because a mean would be pushed up by very high earners and say little about a typical household.",
    numbers: [
      ["Median household income, 2025", "$87,460"],
      ["Median household income, 2024 (revised)", "$85,210"],
      ["Change", "+2.6%"],
    ],
    numbersSource: "U.S. Census Bureau, Income in the United States: 2025 (P60-289), September 2026.",
    played: [
      "Sorted data: 3, 7, 8, 12, 15, 40 (n = 6, even).",
      "Median = (8 + 12)/2 = <b>10</b>. Mean = 85/6 = 14.17.",
      "Change 40 to 400: median still 10; mean jumps to 445/6 = 74.17.",
    ],
    graph: "econ378Skew",
  },
  {
    id: "svar", n: 3, week: 1,
    term: "Sample variance",
    simple: "The average squared distance from the mean, dividing by n − 1; its square root s is the standard deviation.",
    formula: `<i>s</i><sup>2</sup>${op("=")}${fr("Σ(<i>x</i><sub><i>i</i></sub> − <i>x̄</i>)<sup>2</sup>", "<i>n</i> − 1")}`,
    more: [
      "Why n − 1? The deviations are measured from x̄, which is fitted to the same data, so they come out a bit too small. Dividing by n − 1 instead of n exactly corrects this on average: <b>E[s²] = σ²</b>.",
      "n − 1 is the <b>degrees of freedom</b>: once x̄ is fixed, only n − 1 deviations are free (the last one is whatever makes them sum to zero).",
      "Units: s² is in squared units (dollars²), which is hard to read. Report s, which is back in the data's units. Trap: s describes the spread of individual values; s/√n is the spread of x̄.",
    ],
    connections: ["unbiased", "se", "zscore", "varrules"],
    example: "Two funds both average 7% a year. One has s = 2 points, the other s = 15 points. Same mean, very different risk: the standard deviation of returns is the standard first measure of volatility.",
    played: [
      "Data: 2, 4, 6, 8. x̄ = 5. Deviations −3, −1, +1, +3 (sum 0).",
      "Squared: 9 + 1 + 1 + 9 = 20.",
      "s² = 20/(4 − 1) = <b>6.67</b>, s = 2.58. Dividing by n would give 5, too small.",
    ],
    graph: "econ378Deviations",
  },
  {
    id: "zscore", n: 4, week: 1,
    term: "z-score",
    simple: "How many standard deviations a value sits above (+) or below (−) the mean.",
    formula: `<i>z</i>${op("=")}${fr("<i>x</i> − <i>μ</i>", "<i>σ</i>")}`,
    more: [
      "Standardising removes units, so you can compare values from different distributions: a test score, a wage, a height.",
      "If X is normal, z follows the standard normal N(0, 1), so the z-table gives probabilities directly. If X isn't normal, z still measures distance in SDs, but the table's probabilities don't apply.",
      "Trap: for a sample <i>mean</i>, divide by the standard error σ/√n, not by σ. That is the z <i>statistic</i> of a test.",
    ],
    connections: ["normal", "svar", "se", "pval"],
    example: "Comparing exam scores across sections with different difficulty: a 78 in a hard section can be a better result than an 85 in an easy one once each is measured in that section's SDs.",
    played: [
      "Exam 1: score 85, mean 70, SD 10 → z = 15/10 = <b>1.5</b>.",
      "Exam 2: score 90, mean 80, SD 5 → z = 10/5 = <b>2.0</b>.",
      "The 90 is the stronger result: 2 SDs above its mean vs. 1.5.",
    ],
    graph: { key: "econ378Normal", args: { shade: "mark", marks: [[1.5, "exam 1: z = 1.5"], [2, "exam 2: z = 2"]],
      cap: "Both scores on one standard scale. The second sits further into the upper tail." } },
  },
  {
    id: "iqr", n: 5, week: 1,
    term: "IQR & the 1.5×IQR rule",
    simple: "The interquartile range is the spread of the middle 50% of the data; points more than 1.5 IQRs beyond the quartiles are flagged as outliers.",
    formula: `IQR${op("=")}<i>Q</i><sub>3</sub>${op("−")}<i>Q</i><sub>1</sub>`,
    more: [
      "Like the median, the IQR uses order only, so it is resistant to outliers. It is the natural spread measure to pair with the median for skewed data (the SD pairs with the mean).",
      "Fences: below Q1 − 1.5·IQR or above Q3 + 1.5·IQR. A flagged point is a <i>candidate</i> outlier: check it for a data error, but don't delete real extreme values just because the rule flags them.",
      "Trap: the IQR is a distance (Q3 − Q1), not an interval. And the fences are built from the quartiles, not from the median.",
    ],
    connections: ["median", "zscore", "mean"],
    example: "Income inequality is often summarised with percentile ratios rather than the SD, for the same reason the IQR is used: percentiles aren't thrown off by a handful of extreme incomes.",
    numbers: [
      ["Household income, 90th ÷ 10th percentile, 2024", "12.61"],
      ["2023", "12.38 (not statistically different)"],
    ],
    numbersSource: "U.S. Census Bureau, Income in the United States: 2024 (P60-286), September 2025.",
    played: [
      "Q1 = 20, Q3 = 40 → IQR = <b>20</b>; 1.5 × 20 = 30.",
      "Fences: 20 − 30 = −10 and 40 + 30 = 70.",
      "A value of 85 is above 70: flagged as an outlier.",
    ],
    graph: "econ378Box",
  },
  {
    id: "corr", n: 6, week: 1,
    term: "Correlation r",
    simple: "A unit-free number between −1 and 1 measuring how closely two variables move together along a straight line.",
    formula: `<i>r</i>${op("=")}${fr("Cov(<i>x</i>, <i>y</i>)", "<i>s</i><sub><i>x</i></sub><i>s</i><sub><i>y</i></sub>")}`,
    more: [
      "r = ±1: all points on a line. r = 0: no <b>linear</b> association, though there can still be a strong curved one (a U-shape gives r ≈ 0).",
      "r has no units and is symmetric: corr(x, y) = corr(y, x). It is sensitive to outliers, and it says nothing about the slope's size: r = 0.9 can go with a tiny or a huge slope.",
      "Correlation ≠ causation: a third variable (confounder) or reverse causality can produce r without any causal link. In simple regression, r² = R².",
    ],
    connections: ["ols", "r2", "indep", "varrules"],
    example: "Across U.S. counties, ice-cream sales and drowning deaths are positively correlated. Summer heat drives both; banning ice cream would save no one.",
    played: [
      "Running data: x = 1…5, y = 2, 4, 5, 4, 5. x̄ = 3, ȳ = 4.",
      "Σ(x − x̄)(y − ȳ) = 6, Σ(x − x̄)² = 10, Σ(y − ȳ)² = 6.",
      "r = 6 / √(10 × 6) = <b>0.775</b>: a fairly strong positive linear association.",
    ],
    graph: "econ378Corr",
  },

  // ------------------------------------------------------- 2 · probability
  {
    id: "condp", n: 7, week: 2,
    term: "Conditional probability",
    simple: "The probability of A once you know B happened: the share of B's outcomes that are also A.",
    formula: `<i>P</i>(<i>A</i> | <i>B</i>)${op("=")}${fr("<i>P</i>(<i>A</i> ∩ <i>B</i>)", "<i>P</i>(<i>B</i>)")}`,
    more: [
      "Conditioning shrinks the sample space to B. Rearranged, it gives the multiplication rule: P(A ∩ B) = P(A | B)·P(B).",
      "<b>Order matters</b>: P(A | B) ≠ P(B | A) in general. Confusing them (“the prosecutor's fallacy”) is the classic exam trap; Bayes' theorem converts one into the other.",
    ],
    connections: ["indep", "bayes", "ev"],
    example: "The unemployment rate is itself a conditional probability: P(unemployed | in the labor force). Changing the conditioning group (all adults vs. the labor force) changes the number.",
    played: [
      "1,000 workers: 400 college grads, 300 of whom earn over $75k; 150 of the 600 non-grads do too.",
      "P(high) = 450/1,000 = 0.45; P(high | grad) = 300/400 = <b>0.75</b>.",
      "Reverse it: P(grad | high) = 300/450 = 0.667, a different number.",
    ],
    graph: "econ378Venn",
  },
  {
    id: "indep", n: 8, week: 2,
    term: "Independence",
    simple: "A and B are independent when knowing one happened doesn't change the probability of the other.",
    formula: `<i>P</i>(<i>A</i> ∩ <i>B</i>)${op("=")}<i>P</i>(<i>A</i>)·<i>P</i>(<i>B</i>)`,
    more: [
      "Equivalent check: P(A | B) = P(A). Independence is what lets you multiply probabilities, e.g. for repeated trials in the binomial.",
      "Trap: <b>independent ≠ mutually exclusive</b>. Mutually exclusive events (P(A ∩ B) = 0) with positive probabilities are strongly <i>dependent</i>: if one happens, the other can't.",
      "For random variables, independence implies zero covariance, so Var(X + Y) = Var(X) + Var(Y). Zero correlation does not imply independence.",
    ],
    connections: ["condp", "binom", "varrules", "corr"],
    example: "Successive flips of a fair coin are independent: after five heads the chance of heads is still 1/2 (believing otherwise is the gambler's fallacy). Defaults on mortgages in the same city are not: a local downturn hits them together, and models that treated them as close to independent badly underestimated the risk of many defaults at once in 2007–08.",
    played: [
      "Same 1,000 workers: P(high) = 0.45, P(grad) = 0.40.",
      "If independent, P(high ∩ grad) would be 0.45 × 0.40 = 0.18.",
      "Actual: 300/1,000 = 0.30 ≠ 0.18, and P(high | grad) = 0.75 ≠ 0.45. <b>Not independent</b>.",
    ],
    graph: { key: "econ378Venn", args: { indep: true } },
  },
  {
    id: "bayes", n: 9, week: 2,
    term: "Bayes’ theorem",
    simple: "Turns P(B | A) into P(A | B) by weighting with the base rate P(A).",
    formula: `<i>P</i>(<i>A</i> | <i>B</i>)${op("=")}${fr("<i>P</i>(<i>B</i> | <i>A</i>)<i>P</i>(<i>A</i>)", "<i>P</i>(<i>B</i>)")}`,
    more: [
      "The denominator uses the law of total probability: P(B) = P(B | A)P(A) + P(B | A<sup>c</sup>)P(A<sup>c</sup>).",
      "<b>Base-rate fallacy</b>: when the condition is rare, even an accurate test produces mostly false positives, because the healthy group is so much bigger. Easiest way to see it: convert to counts out of 10,000.",
      "Trap: the test's sensitivity, P(+ | sick), is not the chance you're sick given a positive, P(sick | +).",
    ],
    connections: ["condp", "pval", "type12"],
    example: "Fraud screening at a bank: if 1 transaction in 1,000 is fraudulent, even a filter that catches 99% of fraud and wrongly flags only 1% of good transactions will flag about ten good transactions for every real fraud.",
    played: [
      "Out of 10,000 people: 100 have the condition (1%), 9,900 don't.",
      "Positives: 90% × 100 = 90 true; 5% × 9,900 = 495 false.",
      "P(condition | +) = 90/(90 + 495) = 90/585 ≈ <b>0.154</b>.",
    ],
    graph: "econ378Tree",
  },
  {
    id: "ev", n: 10, week: 2,
    term: "Expected value",
    simple: "The probability-weighted average of a random variable's values: its long-run average over many repetitions.",
    formula: `<i>E</i>[<i>X</i>]${op("=")}Σ <i>x</i>·<i>P</i>(<i>X</i> = <i>x</i>)`,
    more: [
      "For continuous X: E[X] = ∫ x f(x) dx. E[X] is the population mean μ; x̄ is its sample counterpart.",
      "Linearity always holds: E[aX + b] = aE[X] + b and E[X + Y] = E[X] + E[Y], even if X and Y are dependent. But E[g(X)] ≠ g(E[X]) in general, e.g. E[X²] ≠ (E[X])².",
      "E[X] need not be a value X can take (a household can't have 1.7 children).",
    ],
    connections: ["varrules", "mean", "binom", "condp"],
    example: "An extended warranty is priced above the expected repair cost: if repairs cost $0 with probability 0.9, $200 with 0.08 and $1,000 with 0.02, the expected cost is $36, so a $60 warranty earns the seller $24 per sale on average.",
    played: [
      "X = job offers: P(0, 1, 2, 3) = 0.1, 0.3, 0.4, 0.2.",
      "E[X] = 0(0.1) + 1(0.3) + 2(0.4) + 3(0.2) = <b>1.7</b>.",
      "E[2X + 3] = 2(1.7) + 3 = 6.4.",
    ],
    graph: "econ378Bars",
  },
  {
    id: "varrules", n: 11, week: 2,
    term: "Variance rules",
    simple: "Adding a constant doesn't change the spread, multiplying by a scales the variance by a², and the variance of a sum includes twice the covariance.",
    formula: `Var(<i>aX</i> + <i>b</i>)${op("=")}<i>a</i><sup>2</sup>Var(<i>X</i>)`,
    more: [
      "Var(X) = E[(X − μ)²] = E[X²] − (E[X])². The second form is the quick way to compute it.",
      "Var(X ± Y) = Var(X) + Var(Y) ± 2Cov(X, Y). If X and Y are independent the covariance term drops out, and note that Var(X − Y) is then a <b>sum</b>, not a difference.",
      "Traps: Var(2X) = 4Var(X), not 2Var(X); and SD(aX) = |a|·SD(X).",
    ],
    connections: ["ev", "svar", "indep", "se", "corr"],
    example: "Diversification: two stocks each with return variance 400 (SD 20%), held 50/50. If independent, the portfolio variance is 0.25(400) + 0.25(400) = 200, SD ≈ 14%. If perfectly correlated, it stays at 20%.",
    played: [
      "Running X: E[X] = 1.7, E[X²] = 0(.1) + 1(.3) + 4(.4) + 9(.2) = 3.7.",
      "Var(X) = 3.7 − 1.7² = <b>0.81</b>, SD = 0.9.",
      "Var(2X + 3) = 4 × 0.81 = 3.24, SD = 1.8. The + 3 adds nothing.",
    ],
    graph: "econ378Shift",
  },

  // ----------------------------------------------------- 3 · distributions
  {
    id: "binom", n: 12, week: 3,
    term: "Binomial(n, p)",
    simple: "The number of successes in n independent trials, each with the same success probability p.",
    formula: `<i>P</i>(<i>X</i> = <i>k</i>)${op("=")}(<sup><i>n</i></sup><sub><i>k</i></sub>)<i>p</i><sup><i>k</i></sup>(1 − <i>p</i>)<sup><i>n</i>−<i>k</i></sup>`,
    more: [
      "Mean np, variance np(1 − p). The C(n, k) counts the orderings in which k successes can occur among n trials; forgetting it is the most common slip.",
      "Conditions (BINS): Binary outcomes, Independent trials, fixed Number of trials, Same p. Sampling without replacement from a small population breaks independence.",
      "For large n (np and n(1 − p) both ≥ 10) it is approximately normal, so a sample proportion p̂ has SE √(p(1 − p)/n): the basis of poll margins of error.",
    ],
    connections: ["indep", "normal", "ev", "pois"],
    example: "Quality control: a plant's defect rate is 2%. In a batch of 50, the number of defective units is Binomial(50, 0.02), so the chance of zero defects is 0.98⁵⁰ ≈ 0.36.",
    played: [
      "Ten job applications, each with a 30% callback chance: X ~ Binomial(10, 0.3).",
      "P(X = 3) = C(10, 3)(0.3)³(0.7)⁷ = 120 × 0.027 × 0.0824 = <b>0.267</b>.",
      "Mean 10 × 0.3 = 3; variance 10 × 0.3 × 0.7 = 2.1, SD 1.45.",
    ],
    graph: { key: "econ378Binom", args: { n: 10, p: 0.3, k: 3 } },
  },
  {
    id: "pois", n: 13, week: 3,
    term: "Poisson(λ)",
    simple: "The number of events in a fixed interval when they occur independently at a constant average rate λ.",
    formula: `<i>P</i>(<i>X</i> = <i>k</i>)${op("=")}${fr("<i>e</i><sup>−λ</sup>λ<sup><i>k</i></sup>", "<i>k</i>!")}`,
    more: [
      "Mean = variance = λ. If the variance in count data is much bigger than the mean (“overdispersion”), the Poisson is the wrong model.",
      "It is the limit of Binomial(n, p) when n is large and p small with np = λ: many chances, each unlikely.",
      "Trap: λ must match the interval. A rate of 3 per 5 minutes is λ = 6 for a 10-minute window.",
    ],
    connections: ["binom", "ev", "chisq"],
    example: "Arrivals at a bank teller or a website's server requests per second are classic Poisson counts; queueing and staffing decisions are built on them.",
    played: [
      "Drive-through arrivals: λ = 3 cars per 5 minutes.",
      "P(X = 0) = e<sup>−3</sup> = 0.050; P(X = 2) = e<sup>−3</sup> × 9/2 = <b>0.224</b>.",
      "P(at least one car) = 1 − 0.050 = 0.950.",
    ],
    graph: { key: "econ378Pois", args: { lam: 3, k: 2 } },
  },
  {
    id: "normal", n: 14, week: 3,
    term: "Normal distribution",
    simple: "The symmetric bell curve, fully described by its mean μ and standard deviation σ.",
    formula: `<i>X</i> ~ <i>N</i>(<i>μ</i>, <i>σ</i><sup>2</sup>)${op("⇒")}<i>Z</i>${op("=")}${fr("<i>X</i> − <i>μ</i>", "<i>σ</i>")} ~ <i>N</i>(0, 1)`,
    more: [
      "68–95–99.7: about 68% of values lie within 1σ of μ, 95% within 2σ (1.96σ exactly), 99.7% within 3σ.",
      "To find a probability: standardise to z, then use the table (which gives the area to the <i>left</i>). Upper tail = 1 − table value.",
      "Trap: notation. N(100, 15²) has variance 225 and SD 15; dividing by 225 instead of 15 is a classic slip. Many real variables (incomes, stock returns) are skewed or fat-tailed, so check before assuming normality.",
    ],
    connections: ["zscore", "clt", "tdist", "binom", "ci"],
    example: "Heights of adult men in a population are roughly normal; so are measurement errors in a well-calibrated machine, which is why quality control uses “3σ” limits.",
    played: [
      "Heights ~ N(70, 3²) inches (roughly).",
      "P(64 < X < 76) = P(−2 < Z < 2) ≈ <b>0.95</b>.",
      "P(X > 73) = P(Z > 1) = 1 − 0.8413 = 0.159.",
    ],
    graph: { key: "econ378Normal", args: { shade: "rule" } },
  },
  {
    id: "tdist", n: 15, week: 3,
    term: "t distribution",
    simple: "A bell curve like the standard normal but with fatter tails, used when σ is unknown and estimated by s.",
    formula: `<i>t</i>${op("=")}${fr("<i>x̄</i> − <i>μ</i>", "<i>s</i> / √<i>n</i>")} ~ <i>t</i><sub><i>n</i>−1</sub>`,
    more: [
      "Using s adds extra uncertainty (s itself varies from sample to sample), so the tails are fatter and critical values are bigger than 1.96. Exact if the population is normal; approximately right for large n otherwise.",
      "One-sample t: df = n − 1. Two-sided 95% critical values: 2.262 at df 9, 2.042 at df 30, 1.96 in the limit.",
      "Trap: using z* = 1.96 with small n and estimated σ makes intervals too narrow and tests reject too often.",
    ],
    connections: ["normal", "ci", "chisq", "se"],
    example: "William Gosset derived it in 1908 while working at Guinness, testing barley and hops with small samples; the brewery made him publish under the pen name “Student”.",
    played: [
      "n = 10, x̄ = 52, s = 5: SE = 5/√10 = 1.581, df = 9.",
      "t* = 2.262 → margin = 2.262 × 1.581 = <b>3.58</b>; CI 52 ± 3.58.",
      "With z* = 1.96 it would be ±3.10: too narrow.",
    ],
    graph: { key: "econ378Tz", args: { df: 3, tc: 3.182 } },
  },
  {
    id: "chisq", n: 16, week: 3,
    term: "Chi-square distribution",
    simple: "The distribution of a sum of k squared independent standard normals: positive, right-skewed, with mean k.",
    formula: `<i>χ</i><sup>2</sup>${op("=")}Σ${fr("(<i>O</i> − <i>E</i>)<sup>2</sup>", "<i>E</i>")}`,
    more: [
      "Mean k, variance 2k; it becomes more symmetric as k grows. (n − 1)s²/σ² is χ² with n − 1 df when the population is normal, which is how tests on a variance work.",
      "Goodness-of-fit and independence tests compare observed counts O with expected counts E; df = categories − 1, or (rows − 1)(columns − 1) for a contingency table. Rule of thumb: every E ≥ 5.",
      "Trap: these tests are one-tailed (upper tail only). A big χ² means a bad fit; a tiny one is not evidence against H₀.",
    ],
    connections: ["tdist", "normal", "pval", "pois"],
    example: "Testing whether a die is fair, whether job-seekers' outcomes are independent of the name on the résumé, or whether the leading digits in a company's accounts follow Benford's law.",
    played: [
      "Die rolled 60 times: 5, 8, 9, 8, 10, 20. Expected 10 each.",
      "χ² = (25 + 4 + 1 + 4 + 0 + 100)/10 = <b>13.4</b>, df = 5.",
      "Critical value at 5%: 11.07. 13.4 > 11.07, so reject “fair”.",
    ],
    graph: { key: "econ378Chisq", args: { k: 5, crit: 11.07, obs: 13.4 } },
  },

  // -------------------------------------------------- 4 · sampling & CLT
  {
    id: "sampdist", n: 17, week: 4,
    term: "Sampling distribution",
    simple: "The distribution of a statistic (like x̄) over all the possible samples of size n you could have drawn.",
    formula: `<i>x̄</i> ~ (mean <i>μ</i>, SD ${fr("<i>σ</i>", "√<i>n</i>")})`,
    more: [
      "Three different distributions to keep apart: the <b>population</b> (σ), one <b>sample</b> (s), and the <b>sampling distribution</b> of the statistic (its SD is the standard error).",
      "x̄ is centred on μ (unbiased), and its spread shrinks with n. Its shape is normal if the population is, and approximately normal for large n anyway (the CLT).",
      "Every confidence interval and test is a statement about where a statistic tends to land across repeated samples.",
    ],
    connections: ["se", "clt", "unbiased", "ciinterp"],
    example: "Each month's unemployment rate comes from one sample of households. Had the Census Bureau drawn a different sample, the number would differ a little: that sample-to-sample variation is the sampling distribution.",
    played: [
      "Hourly wages: μ = $25, σ = $10. Samples of n = 25.",
      "SE = 10/√25 = 2. 95% of sample means fall in 25 ± 1.96(2) = (21.08, 28.92).",
      "P(x̄ > 28) = P(Z > 1.5) = <b>0.067</b>.",
    ],
    graph: { key: "econ378Sampling", args: { pop: true } },
  },
  {
    id: "se", n: 18, week: 4,
    term: "Standard error of x̄",
    simple: "The standard deviation of the sample mean across samples: how far x̄ typically lands from μ.",
    formula: `SE(<i>x̄</i>)${op("=")}${fr("<i>σ</i>", "√<i>n</i>")}${op("≈")}${fr("<i>s</i>", "√<i>n</i>")}`,
    more: [
      "Because of the √n, precision has diminishing returns: <b>quadrupling n halves the SE</b>. Doubling n only divides it by √2 ≈ 1.41.",
      "It comes from the variance rules: Var(x̄) = Var(Σx<sub>i</sub>)/n² = nσ²/n² = σ²/n, using independence.",
      "Trap: σ (spread of individuals) vs σ/√n (spread of the mean). Using σ where the SE belongs makes intervals √n times too wide.",
    ],
    connections: ["sampdist", "svar", "ci", "power", "varrules"],
    example: "The BLS's household survey interviews about 60,000 households a month. A sample that large makes the national unemployment rate precise to within a couple of tenths of a point; state and local rates, from far fewer households, are much noisier.",
    numbers: [
      ["CPS sample per month", "about 60,000 eligible households"],
      ["BLS's usual confidence level", "90% (about ±1.6 standard errors)"],
    ],
    numbersSource: "U.S. Bureau of Labor Statistics, Employment Situation news release and CPS documentation on standard errors (2025–26).",
    played: [
      "σ = 12, n = 36: SE = 12/6 = <b>2</b>.",
      "n = 144 (four times as many): SE = 12/12 = 1, half.",
      "n = 9: SE = 12/3 = 4, double.",
    ],
    graph: { key: "econ378Sampling", args: { ns: [4, 16, 64] } },
  },
  {
    id: "clt", n: 19, week: 4,
    term: "Central Limit Theorem",
    simple: "For large n, the sample mean is approximately normal around μ with SD σ/√n, whatever the shape of the population.",
    formula: `<i>x̄</i>${op("≈")}<i>N</i>(<i>μ</i>, <i>σ</i><sup>2</sup>/<i>n</i>)`,
    more: [
      "Needs independent draws and a finite σ. Rule of thumb n ≥ 30, more for very skewed populations (or n·p ≥ 10 for proportions).",
      "It is about the distribution of <b>x̄</b>, not the data: a large sample of incomes is still skewed, but the mean of that sample is close to normal across repeated samples.",
      "Why it matters: it justifies z and t procedures for means and proportions even when the population isn't normal. See the CLT simulator in Tools.",
    ],
    connections: ["sampdist", "se", "normal", "ci"],
    example: "Daily sales at one store are lumpy and skewed, but a chain's average sales across 200 stores is close to normal, which is what lets analysts put error bands on it.",
    played: [
      "Skewed population (exponential): μ = 50, σ = 50. Sample n = 100.",
      "SE = 50/√100 = 5, and x̄ ≈ N(50, 5²).",
      "P(x̄ > 60) = P(Z > 2) = <b>0.023</b>.",
    ],
    graph: "econ378Clt",
  },
  {
    id: "unbiased", n: 20, week: 4,
    term: "Unbiased estimator",
    simple: "An estimator whose sampling distribution is centred on the true parameter: E[θ̂] = θ.",
    formula: `Bias(<i>θ̂</i>)${op("=")}<i>E</i>[<i>θ̂</i>]${op("−")}<i>θ</i>`,
    more: [
      "x̄ is unbiased for μ; s² (dividing by n − 1) is unbiased for σ²; p̂ is unbiased for p. Dividing by n gives E = (n − 1)σ²/n, biased low.",
      "Unbiased says nothing about precision: an estimator can be unbiased and very noisy. The usual overall yardstick is mean squared error, MSE = Var + Bias², which can favour a slightly biased but much less variable estimator.",
      "Trap: s is <i>not</i> unbiased for σ even though s² is unbiased for σ² (the square root is non-linear).",
    ],
    connections: ["consistent", "svar", "sampdist", "mean"],
    example: "A bathroom scale that reads 2 lb heavy every time is biased but precise; one that is right on average but jumps ±10 lb is unbiased but useless for a single reading.",
    played: [
      "n = 4 data: 2, 4, 6, 8. Σ(x − x̄)² = 20.",
      "Divide by n − 1: 6.67 (unbiased). Divide by n: 5.",
      "On average the divide-by-n version hits only (n − 1)/n = <b>3/4</b> of σ²: 25% too low.",
    ],
    graph: "econ378Bias",
  },
  {
    id: "consistent", n: 21, week: 4,
    term: "Consistent estimator",
    simple: "An estimator that gets arbitrarily close to the true parameter as the sample size grows.",
    formula: `<i>θ̂</i><sub><i>n</i></sub>${op("→")}<i>θ</i> as <i>n</i>${op("→")}∞`,
    more: [
      "Sufficient condition: bias → 0 and variance → 0 as n grows. x̄ is consistent because its variance σ²/n → 0 (the law of large numbers).",
      "Consistency and unbiasedness are different: the divide-by-n variance is biased but consistent (its bias factor (n − 1)/n → 1). An estimator that uses only the first observation is unbiased but not consistent.",
      "In econometrics, consistency is often the property you can actually get (e.g. OLS with exogenous regressors); omitted-variable bias makes OLS inconsistent, and more data does not fix it.",
    ],
    connections: ["unbiased", "se", "clt", "ols"],
    example: "Opinion polls: with more respondents, a random-sample poll's estimate homes in on the true share. A poll that only reaches landline owners is not consistent: more of the same calls converge on the wrong number.",
    played: [
      "σ = 10. n = 25: SE(x̄) = 2. n = 2,500: SE = <b>0.2</b>.",
      "The divide-by-n variance's bias factor: 24/25 = 0.96 at n = 25, 2,499/2,500 = 0.9996 at n = 2,500.",
      "Both shrink toward the truth: consistent.",
    ],
    graph: { key: "econ378Sampling", args: { ns: [10, 40, 160], theta: "θ", xl: "estimate",
      cap: "As n grows, the sampling distribution collapses onto the true θ. That is consistency." } },
  },

  // -------------------------------------------------------- 5 · inference
  {
    id: "ci", n: 22, week: 5,
    term: "Confidence interval for μ",
    simple: "A range of plausible values for μ: the estimate plus or minus a critical value times its standard error.",
    formula: `<i>x̄</i>${op("±")}<i>t</i>*<sub><i>n</i>−1</sub>${fr("<i>s</i>", "√<i>n</i>")}`,
    more: [
      "With σ known (rare) use z*: 1.645 (90%), 1.96 (95%), 2.576 (99%). With σ estimated by s, use t* with n − 1 df. For a proportion: p̂ ± z*√(p̂(1 − p̂)/n).",
      "The margin of error grows with the confidence level and with σ, and shrinks with √n: to halve it, quadruple n.",
      "Traps: using σ instead of σ/√n; and forgetting that the margin covers only <i>sampling</i> error, not bad wording, non-response or a biased sample.",
    ],
    connections: ["ciinterp", "se", "tdist", "pval", "normal"],
    example: "A national poll of about 1,000 adults is usually reported with a margin of about ±3 to ±4 points. Pollsters' published margins are often wider than the textbook formula because weighting inflates the variance (the “design effect”).",
    numbers: [
      ["Gallup sample, April 1–15, 2026", "1,001 adults"],
      ["Reported margin of error (95%)", "±4 points"],
      ["Simple-random-sample formula, p = 0.5", "±3.1 points"],
    ],
    numbersSource: "Gallup topline, poll of April 1–15, 2026 (margin includes design effects for weighting). The ±3.1 is 1.96√(0.25/1,001), computed here.",
    played: [
      "n = 36, σ = 12, x̄ = 50: SE = 12/6 = 2.",
      "95%: 1.96 × 2 = 3.92 → (<b>46.08, 53.92</b>).",
      "If σ were estimated (s = 12): t*<sub>35</sub> = 2.030 → ±4.06.",
    ],
    graph: { key: "econ378Normal", args: { shade: "mid", z: 1.96, area: "95%", zlab: "±1.96 SE",
      cap: "95% of sample means land within 1.96 standard errors of μ, so x̄ ± 1.96·SE catches μ 95% of the time." } },
  },
  {
    id: "ciinterp", n: 23, week: 5,
    term: "What “95% confident” means",
    simple: "If we repeated the sampling many times, about 95% of the intervals built this way would contain μ; any one interval either does or doesn't.",
    more: [
      "The <b>method</b> has a 95% success rate. μ is fixed; it is the interval that varies from sample to sample. So “there is a 95% probability μ is in (46.1, 53.9)” is the standard wrong answer.",
      "Also wrong: “95% of the data lie in the interval” (that's about individuals, not μ) and “95% of sample means lie in this interval” (it's centred on x̄, not μ).",
      "Link to tests: a 95% interval contains exactly the values μ₀ that a two-sided 5% test would not reject.",
    ],
    connections: ["ci", "sampdist", "pval", "type12"],
    example: "The BLS publishes, for each monthly change in the unemployment rate, the change needed to be statistically significant. A rise smaller than that is consistent with no real change: the interval for the change includes zero.",
    numbers: [
      ["One-month change in the unemployment rate, Sept 2025 (unrounded)", "0.12 point"],
      ["Change needed for significance (90%)", "0.21 point"],
      ["Verdict", "not significant"],
    ],
    numbersSource: "U.S. Bureau of Labor Statistics, CPS fact sheet “Statistical significance of changes in the unemployment rate over time” (September 2025 example).",
    played: [
      "Build 20 independent 95% intervals.",
      "Expected number that miss μ: 20 × 0.05 = <b>1</b>.",
      "Chance that all 20 cover μ: 0.95<sup>20</sup> = 0.358.",
    ],
    graph: "econ378Intervals",
  },
  {
    id: "pval", n: 24, week: 5,
    term: "p-value",
    simple: "The probability, assuming H₀ is true, of a test statistic at least as extreme as the one observed.",
    formula: `<i>p</i>${op("=")}<i>P</i>(|<i>Z</i>| ≥ |<i>z</i><sub>obs</sub>| ${op("|")} <i>H</i><sub>0</sub>)`,
    more: [
      "Reject H₀ when p ≤ α. Small p = data that would be surprising if H₀ were true. For a two-sided test, double the one-tail area.",
      "It is <b>not</b> P(H₀ is true), not the probability the result is due to chance, and not a measure of effect size: with huge n, trivially small effects get tiny p-values.",
      "p > α means “fail to reject”, not “H₀ is true”: the test may simply lack power.",
    ],
    connections: ["type12", "zscore", "ciinterp", "power", "bayes"],
    example: "When the Open Science Collaboration re-ran 100 published psychology studies, far fewer came out significant the second time. A p just under 0.05 is weaker evidence than it looks, especially when only significant results get published.",
    numbers: [
      ["Original studies with p < 0.05", "97%"],
      ["Replications with p < 0.05", "36%"],
      ["Studies replicated", "100"],
    ],
    numbersSource: "Open Science Collaboration, “Estimating the reproducibility of psychological science,” Science, August 2015.",
    played: [
      "H₀: μ = 50, σ = 10, n = 25 → SE = 2. Observed x̄ = 54.",
      "z = (54 − 50)/2 = 2. Two-sided p = 2 × (1 − 0.9772) = <b>0.0455</b>.",
      "Reject at α = 0.05, not at α = 0.01. One-sided p would be 0.0228.",
    ],
    graph: { key: "econ378Test", args: { z: 2 } },
  },
  {
    id: "type12", n: 25, week: 5,
    term: "Type I and Type II errors",
    simple: "A Type I error rejects a true H₀ (probability α); a Type II error fails to reject a false H₀ (probability β).",
    formula: `<i>α</i>${op("=")}<i>P</i>(reject ${op("|")} <i>H</i><sub>0</sub> true)${gap}<i>β</i>${op("=")}<i>P</i>(keep ${op("|")} <i>H</i><sub>0</sub> false)`,
    more: [
      "Courtroom analogy: H₀ = innocent. Type I = convicting an innocent person; Type II = acquitting a guilty one.",
      "Holding n fixed, lowering α raises β: moving the cut-off trades one error for the other. Only more data (or a bigger effect) lowers both.",
      "Multiple testing: run 20 tests of true nulls at α = 0.05 and you expect one false positive. Trap: α is P(reject | H₀ true), not P(H₀ true | reject).",
    ],
    connections: ["power", "pval", "ciinterp", "bayes"],
    example: "In 2018, 72 researchers proposed lowering the default significance threshold for new discoveries from 0.05 to 0.005, accepting more Type II errors to cut false positives.",
    numbers: [
      ["Proposed threshold for new discoveries", "p < 0.005"],
      ["Authors", "72"],
    ],
    numbersSource: "Benjamin et al., “Redefine statistical significance,” Nature Human Behaviour 2, January 2018.",
    played: [
      "α = 0.05, 20 independent tests, every H₀ true.",
      "Expected false positives: 20 × 0.05 = 1.",
      "P(at least one) = 1 − 0.95<sup>20</sup> = <b>0.64</b>.",
    ],
    graph: "econ378Errors",
  },
  {
    id: "power", n: 26, week: 5,
    term: "Power",
    simple: "The probability that a test rejects H₀ when H₀ is false: 1 − β.",
    formula: `Power${op("=")}1${op("−")}<i>β</i>`,
    more: [
      "Power rises with a larger sample, a larger true effect, a larger α, and a smaller σ. It always depends on <i>which</i> alternative value is true.",
      "Studies are usually designed for 80% power at the smallest effect worth detecting; that is how sample sizes are chosen.",
      "Low power is doubly bad: real effects get missed, and the ones that do reach significance tend to be overestimates.",
    ],
    connections: ["type12", "se", "pval"],
    example: "A firm's A/B test of a new checkout page needs a big sample to detect a 1-point lift in conversion: with too few visitors, “no significant difference” says little about whether the page works.",
    numbers: [
      ["Median statistical power, neuroscience studies", "21%"],
      ["Meta-analyses examined (published 2011)", "48"],
    ],
    numbersSource: "Button et al., “Power failure: why small sample size undermines the reliability of neuroscience,” Nature Reviews Neuroscience 14, May 2013.",
    played: [
      "H₀: μ = 100 vs Hₐ: μ > 100, σ = 15, n = 36 → SE = 2.5. Reject if x̄ > 100 + 1.645 × 2.5 = 104.11.",
      "If the truth is μ = 106: z = (104.11 − 106)/2.5 = −0.76.",
      "Power = P(Z > −0.76) ≈ <b>0.775</b>, so β ≈ 0.225.",
    ],
    graph: { key: "econ378Errors", args: { mode: "power", d: 2.4 } },
  },

  // ------------------------------------------------------- 6 · regression
  {
    id: "ols", n: 27, week: 6,
    term: "OLS slope and intercept",
    simple: "Ordinary least squares picks the line that minimises the sum of squared residuals.",
    formula: `<i>β̂</i><sub>1</sub>${op("=")}${fr("Σ(<i>x</i> − <i>x̄</i>)(<i>y</i> − <i>ȳ</i>)", "Σ(<i>x</i> − <i>x̄</i>)<sup>2</sup>")}${gap}<i>β̂</i><sub>0</sub>${op("=")}<i>ȳ</i>${op("−")}<i>β̂</i><sub>1</sub><i>x̄</i>`,
    more: [
      "Equivalently β̂₁ = Cov(x, y)/Var(x) = r·s<sub>y</sub>/s<sub>x</sub>. The slope is the predicted change in y for a one-unit increase in x.",
      "With an intercept, the residuals sum to zero and the line passes through (x̄, ȳ).",
      "The slope has a causal reading only if nothing else that moves y is correlated with x (no omitted-variable bias). Regressing x on y does not give 1/β̂₁ unless r = ±1.",
    ],
    connections: ["r2", "corr", "consistent", "varrules"],
    example: "A wage regression of log hourly wage on years of schooling often finds a slope of roughly 0.08–0.10: each extra year goes with roughly 8–10% higher wages. Whether that is the causal return to schooling depends on ability and family background, which are omitted.",
    played: [
      "Running data: Σ(x − x̄)(y − ȳ) = 6, Σ(x − x̄)² = 10 → β̂₁ = <b>0.6</b>.",
      "β̂₀ = 4 − 0.6 × 3 = 2.2, so ŷ = 2.2 + 0.6x.",
      "At x = 3: ŷ = 4.0, y = 5 → residual e = +1.0. All five residuals sum to 0.",
    ],
    graph: "econ378Scatter",
  },
  {
    id: "r2", n: 28, week: 6,
    term: "R²",
    simple: "The share of the variation in y that the regression explains, between 0 and 1.",
    formula: `<i>R</i><sup>2</sup>${op("=")}1${op("−")}${fr("SSR", "SST")}${op("=")}${fr("SSE", "SST")}`,
    more: [
      "SST = Σ(y − ȳ)² (total), SSE = Σ(ŷ − ȳ)² (explained), SSR = Σ(y − ŷ)² (residual), and SST = SSE + SSR. Watch the labels: some textbooks swap what SSE and SSR stand for; check which one is the residual.",
      "In simple regression R² = r². Adding a regressor never lowers R², which is why adjusted R² exists.",
      "Trap: a low R² does not make the slope wrong or insignificant, and a high R² does not make it causal. Wage regressions on individual data typically leave most of the variation unexplained and still estimate precise slopes.",
    ],
    connections: ["ols", "corr", "svar"],
    example: "Years of schooling explain only a modest share of the variation in individual wages: people with the same education earn very different amounts. That is a low R², and it is entirely compatible with schooling having a large, precisely estimated effect.",
    played: [
      "Running data: SST = Σ(y − ȳ)² = 6.",
      "Residuals −0.8, 0.6, 1.0, −0.6, −0.2 → SSR = 0.64 + 0.36 + 1 + 0.36 + 0.04 = 2.4.",
      "R² = 1 − 2.4/6 = <b>0.6</b> = 0.775², i.e. r².",
    ],
    graph: { key: "econ378Scatter", args: { mode: "r2" } },
  },
];
