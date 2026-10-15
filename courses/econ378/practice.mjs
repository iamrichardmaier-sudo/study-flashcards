// ECON 378 practice questions, in the ECON 381 drill schema (see tools/practice/questions.js).
//
//   pattern  the general rule, shown first after answering
//   steps    the worked solution, revealed one step at a time
//   cards    related flashcards (ids in courses/econ378/cards.mjs)
//   graph    optional diagram (tools/graphs.js + tools/graphs/econ378.js)
//
// Each wrong option's `why` names the one slip that produces it;
// tools/course-econ378.test.mjs re-derives the right answers and every
// numeric wrong option from that slip.
export default {
  "heading": "Practice questions",
  "title": "ECON 378 practice",
  "sections": [
    { "id": "prob", "title": "Probability", "sub": "2 questions" },
    { "id": "dist", "title": "Distributions", "sub": "2 questions" },
    { "id": "samp", "title": "Sampling & CLT", "sub": "2 questions" },
    { "id": "inf", "title": "Inference", "sub": "5 questions" },
    { "id": "reg", "title": "Regression", "sub": "1 questions" }
  ],
  "questions": [
    {
      "id": "q1", "section": "dist", "label": "Q1", "week": 3, "kind": "one",
      "prompt": "X ~ N(100, 15²). What is P(X &gt; 130)?",
      "options": [
        { "t": "≈ 0.0228", "right": true, "why": "z = (130 − 100)/15 = 2, and P(Z &gt; 2) = 1 − 0.9772." },
        { "t": "≈ 0.9772", "why": "That’s the table value Φ(2) = P(X &lt; 130), the lower tail. The question asks for the upper tail, 1 − Φ(2)." },
        { "t": "≈ 0.0455", "why": "That’s both tails, P(|Z| &gt; 2) = 2 × 0.0228. Only the upper tail is asked." },
        { "t": "≈ 0.1587", "why": "That’s P(Z &gt; 1): treating the 30-point gap as one standard deviation. 30 points is 30/15 = 2 SDs." }
      ],
      "pattern": "<b>Normal probabilities: standardise, then read the table.</b> z = (x − μ)/σ, with σ the SD (the square root of the 15² in the notation). The table gives the area to the <i>left</i>; an upper tail is 1 minus it.",
      "steps": [
        "N(100, 15²) means μ = 100 and σ = 15 (variance 225).",
        "z = (130 − 100)/15 = 30/15 = <b>2</b>.",
        "Table: Φ(2) = 0.9772 is P(Z &lt; 2).",
        "Upper tail: P(X &gt; 130) = 1 − 0.9772 = <b>0.0228</b>."
      ],
      "cards": ["normal", "zscore"],
      "graph": { "key": "econ378Normal", "args": { "shade": "right", "z": 2, "mu": 100, "sd": 15, "area": "2.28%", "zlab": "x = 130 is z = 2", "xl": "x",
        "cap": "The upper tail past 130, two SDs above the mean, holds 2.28% of the distribution." } }
    },
    {
      "id": "q2", "section": "inf", "label": "Q2", "week": 5, "kind": "one",
      "prompt": "n = 36, σ = 12 (known), x̄ = 50. The 95% confidence interval for μ is…",
      "options": [
        { "t": "50 ± 3.92", "right": true, "why": "SE = 12/√36 = 2, so 1.96 × 2 = 3.92." },
        { "t": "50 ± 23.52", "why": "1.96 × 12: used σ itself instead of the standard error σ/√n = 2." },
        { "t": "50 ± 3.29", "why": "1.645 × 2 = 3.29 is the 90% margin. 95% needs z* = 1.96." },
        { "t": "50 ± 0.65", "why": "1.96 × 12/36: divided σ by n instead of √n." }
      ],
      "pattern": "<b>CI for μ with σ known: x̄ ± z*·σ/√n.</b> z* = 1.645 (90%), 1.96 (95%), 2.576 (99%). The spread that matters is the standard error of x̄, not σ.",
      "steps": [
        "Standard error: σ/√n = 12/√36 = 12/6 = 2.",
        "95% critical value: z* = 1.96.",
        "Margin: 1.96 × 2 = 3.92.",
        "Interval: 50 ± 3.92 = (46.08, 53.92)."
      ],
      "cards": ["ci", "se", "ciinterp"],
      "graph": { "key": "econ378Normal", "args": { "shade": "mid", "z": 1.96, "area": "95%", "zlab": "±1.96 SE" } }
    },
    {
      "id": "q3", "section": "inf", "label": "Q3", "week": 5, "kind": "one",
      "prompt": "A test gives p = 0.03. Which statement is correct?",
      "options": [
        { "t": "If H₀ were true, results at least this extreme would occur about 3% of the time", "right": true, "why": "That’s the definition: a probability computed assuming H₀." },
        { "t": "There is a 3% chance H₀ is true", "why": "Flips the conditioning: p is P(data this extreme | H₀), not P(H₀ | data)." },
        { "t": "There is a 97% chance Hₐ is true", "why": "The same flip, stated for Hₐ. A p-value is not a probability that either hypothesis is true." },
        { "t": "The effect is large and important", "why": "Confuses significance with size. A small p can come from a tiny effect measured with a big n." }
      ],
      "pattern": "<b>A p-value is computed assuming H₀ is true.</b> It is P(a statistic at least this extreme | H₀): it says how surprising the data would be under H₀, not how likely H₀ is, and not how big the effect is.",
      "steps": [
        "Write the definition: p = P(statistic at least as extreme as observed | H₀ true).",
        "The conditioning is on H₀, so it can’t be the probability <i>of</i> H₀ (or of Hₐ).",
        "Size of effect isn’t in it: p depends on effect ÷ standard error, and the SE shrinks with n.",
        "So the only correct reading is the first: under H₀, results this extreme happen about 3% of the time."
      ],
      "cards": ["pval", "type12", "bayes"],
      "graph": { "key": "econ378Test", "args": { "z": 2.17 } }
    },
    {
      "id": "q4", "section": "inf", "label": "Q4", "week": 5, "kind": "one",
      "prompt": "A Type I error is…",
      "options": [
        { "t": "Rejecting H₀ when it is actually true", "right": true, "why": "Its probability is the significance level α." },
        { "t": "Failing to reject H₀ when it is false", "why": "Swaps the two errors: that’s a Type II error (probability β)." },
        { "t": "Using the wrong test statistic", "why": "That’s just a mistake in method. Type I/II refer to wrong <i>decisions</i> about H₀." },
        { "t": "Rejecting Hₐ when it is true", "why": "Tests never “reject Hₐ”: the decision is always reject or fail to reject H₀." }
      ],
      "pattern": "<b>Errors are wrong decisions about H₀.</b> Type I: reject a true H₀ (false positive, probability α). Type II: keep a false H₀ (false negative, probability β). Power = 1 − β.",
      "steps": [
        "List the two possible truths (H₀ true / false) and the two decisions (reject / don’t).",
        "Reject when H₀ is true → <b>Type I</b>, chance α.",
        "Don’t reject when H₀ is false → Type II, chance β.",
        "Courtroom: Type I convicts the innocent; Type II acquits the guilty."
      ],
      "cards": ["type12", "power", "pval"],
      "graph": "econ378Errors"
    },
    {
      "id": "q5", "section": "samp", "label": "Q5", "week": 4, "kind": "one",
      "prompt": "Incomes are strongly right-skewed. For samples of n = 200, the sampling distribution of x̄ is…",
      "options": [
        { "t": "Approximately normal, centered at μ with SD σ/√200", "right": true, "why": "The CLT: x̄ is approximately normal for large n whatever the population’s shape." },
        { "t": "Right-skewed like the population", "why": "Confuses the population’s shape with x̄’s. Individual incomes are skewed, but averages of 200 are close to normal." },
        { "t": "Exactly normal", "why": "Over-reads the CLT: it gives an approximation. x̄ is exactly normal only when the population is normal." },
        { "t": "Centered at the median", "why": "x̄ is unbiased for the <i>mean</i> μ. In skewed data μ and the median differ." }
      ],
      "pattern": "<b>CLT: for large n, x̄ ≈ N(μ, σ²/n) whatever the population’s shape.</b> Three facts: centre μ (unbiased), spread σ/√n, shape approximately normal.",
      "steps": [
        "Centre: E[x̄] = μ, the population mean, not the median.",
        "Spread: SD(x̄) = σ/√200.",
        "Shape: n = 200 is large, so the CLT makes x̄ approximately normal even though incomes are skewed.",
        "Approximately, not exactly: exact normality needs a normal population."
      ],
      "cards": ["clt", "sampdist", "se", "median"],
      "graph": "econ378Clt"
    },
    {
      "id": "q6", "section": "samp", "label": "Q6", "week": 4, "kind": "one",
      "prompt": "To cut the standard error of x̄ in half, the sample size must be…",
      "options": [
        { "t": "Multiplied by 4", "right": true, "why": "SE = σ/√n; √(4n) = 2√n." },
        { "t": "Doubled", "why": "Treats SE as σ/n. Doubling n divides the SE by √2 ≈ 1.41, not 2." },
        { "t": "Halved", "why": "Gets the direction backwards: a smaller n makes the SE larger (by √2)." },
        { "t": "Multiplied by 2²·σ", "why": "Mixes σ into the scaling. The ratio SE<sub>new</sub>/SE<sub>old</sub> = √(n<sub>old</sub>/n<sub>new</sub>) doesn’t involve σ: n × 4 for any σ." }
      ],
      "pattern": "<b>SE = σ/√n, so precision grows with √n.</b> To divide the SE by k, multiply n by k². Halving the SE costs four times the data.",
      "steps": [
        "Want σ/√n<sub>new</sub> = ½ · σ/√n.",
        "So √n<sub>new</sub> = 2√n.",
        "Square both sides: n<sub>new</sub> = <b>4n</b>."
      ],
      "cards": ["se", "sampdist", "ci"],
      "graph": { "key": "econ378Sampling", "args": { "ns": [4, 16, 64] } }
    },
    {
      "id": "q7", "section": "prob", "label": "Q7", "week": 2, "kind": "one",
      "prompt": "1% of people have a condition. A test catches 90% of cases and gives a false positive to 5% of healthy people. Given a positive test, the chance the person has the condition is about…",
      "options": [
        { "t": "15%", "right": true, "why": "0.9·0.01 / (0.9·0.01 + 0.05·0.99) = 0.009/0.0585 ≈ 0.154." },
        { "t": "90%", "why": "That’s P(+ | condition), the sensitivity: the conditional the wrong way round." },
        { "t": "95%", "why": "That’s P(− | healthy) = 1 − 0.05, the specificity. It ignores the low base rate." },
        { "t": "1%", "why": "That’s the prior, before the test. A positive result should raise it." }
      ],
      "pattern": "<b>Bayes: P(A | +) = P(+ | A)P(A) / P(+).</b> With a rare condition, count in a population of 10,000: false positives from the huge healthy group swamp the true positives.",
      "steps": [
        "Out of 10,000: 100 have it, 9,900 don’t.",
        "True positives: 0.90 × 100 = 90.",
        "False positives: 0.05 × 9,900 = 495.",
        "P(condition | +) = 90/(90 + 495) = 90/585 ≈ <b>0.154</b>, about 15%."
      ],
      "cards": ["bayes", "condp"],
      "graph": "econ378Tree"
    },
    {
      "id": "q8", "section": "dist", "label": "Q8", "week": 3, "kind": "one",
      "prompt": "X ~ Binomial(5, 0.5). P(X = 2) = ?",
      "options": [
        { "t": "0.3125", "right": true, "why": "C(5,2)·0.5⁵ = 10/32." },
        { "t": "0.03125", "why": "0.5⁵ = 1/32 is one particular order. Forgot the C(5,2) = 10 orders in which 2 successes can fall." },
        { "t": "0.4", "why": "2/5 is the share of trials that succeed, not a binomial probability." },
        { "t": "0.5", "why": "That’s p, the chance for a single trial." }
      ],
      "pattern": "<b>Binomial: P(X = k) = C(n, k)p<sup>k</sup>(1 − p)<sup>n−k</sup>.</b> The product of p’s gives one particular sequence; C(n, k) counts how many sequences have exactly k successes.",
      "steps": [
        "One particular sequence with 2 successes and 3 failures: 0.5² × 0.5³ = 1/32.",
        "Number of such sequences: C(5, 2) = 5!/(2!·3!) = 10.",
        "P(X = 2) = 10/32 = <b>0.3125</b>."
      ],
      "cards": ["binom", "indep"],
      "graph": { "key": "econ378Binom", "args": { "n": 5, "p": 0.5, "k": 2 } }
    },
    {
      "id": "q9", "section": "prob", "label": "Q9", "week": 2, "kind": "one",
      "prompt": "Var(X) = 4. What is Var(2X + 3)?",
      "options": [
        { "t": "16", "right": true, "why": "Var(aX + b) = a²Var(X) = 4·4. The constant shifts but doesn’t spread." },
        { "t": "11", "why": "2 × 4 + 3: applied the rule for means, E[aX + b] = aE[X] + b, to the variance." },
        { "t": "8", "why": "2 × 4: dropped the constant correctly but forgot to square a." },
        { "t": "19", "why": "2² × 4 + 3: squared a correctly but kept the + 3, which doesn’t change spread." }
      ],
      "pattern": "<b>Var(aX + b) = a²Var(X).</b> Adding a constant moves every value equally (no change in spread); scaling by a scales deviations by a, so squared deviations by a².",
      "steps": [
        "The + 3 shifts everything: no effect on the variance.",
        "The × 2 doubles every deviation, so squared deviations ×4.",
        "Var(2X + 3) = 2² × 4 = <b>16</b> (SD 4, twice the old SD of 2)."
      ],
      "cards": ["varrules", "ev"],
      "graph": "econ378Shift"
    },
    {
      "id": "q10", "section": "inf", "label": "Q10", "week": 5, "kind": "one",
      "prompt": "Testing H₀: μ = 10 with n = 16, σ unknown. Which reference distribution?",
      "options": [
        { "t": "t with 15 degrees of freedom", "right": true, "why": "σ is estimated by s, so use t with n − 1 df." },
        { "t": "Standard normal", "why": "Ignores that σ is estimated. z needs a known σ (or a very large n)." },
        { "t": "t with 16 degrees of freedom", "why": "Used n instead of n − 1: one df is used up estimating the mean." },
        { "t": "Chi-square with 15 df", "why": "Right df, wrong family: χ² is for variances and counts, not a mean." }
      ],
      "pattern": "<b>Mean, σ unknown → t with n − 1 df.</b> Replacing σ by s adds uncertainty, so the reference distribution has fatter tails than the normal; df = n − 1 for one sample.",
      "steps": [
        "The parameter is a mean, so the statistic is (x̄ − 10)/SE.",
        "σ is unknown → SE = s/√n → t, not z.",
        "One-sample df = n − 1 = 16 − 1 = <b>15</b>."
      ],
      "cards": ["tdist", "normal", "chisq"],
      "graph": { "key": "econ378Tz", "args": { "df": 15, "tc": 2.131 } }
    },
    {
      "id": "q11", "section": "reg", "label": "Q11", "week": 6, "kind": "one",
      "prompt": "Cov(x, y) = 6 and Var(x) = 3. The OLS slope of y on x is…",
      "options": [
        { "t": "2", "right": true, "why": "β̂₁ = Cov(x, y)/Var(x) = 6/3." },
        { "t": "0.5", "why": "3/6 = Var(x)/Cov(x, y): the ratio upside down." },
        { "t": "18", "why": "6 × 3: multiplied instead of dividing." },
        { "t": "Can’t tell without Var(y)", "why": "Var(y) is needed for r and R², not for the slope of y on x." }
      ],
      "pattern": "<b>OLS slope = Cov(x, y)/Var(x).</b> Same as Σ(x − x̄)(y − ȳ)/Σ(x − x̄)². Var(y) only enters r = Cov/(s<sub>x</sub>s<sub>y</sub>) and R².",
      "steps": [
        "Write the formula: β̂₁ = Cov(x, y)/Var(x).",
        "Plug in: 6/3 = <b>2</b>.",
        "Read it: each one-unit rise in x goes with a 2-unit rise in predicted y."
      ],
      "cards": ["ols", "corr", "r2"],
      "graph": "econ378Scatter"
    },
    {
      "id": "q12", "section": "inf", "label": "Q12", "week": 5, "kind": "one",
      "prompt": "Which change increases the power of a test (all else equal)?",
      "options": [
        { "t": "Larger sample size", "right": true, "why": "The SE shrinks, so a real effect gives a larger test statistic." },
        { "t": "Smaller α", "why": "Gets the trade-off backwards: a stricter α moves the cut-off out, so rejection is harder and power falls." },
        { "t": "Larger population σ", "why": "More noise means a bigger SE and a smaller test statistic: power falls." },
        { "t": "Smaller true effect", "why": "A smaller effect sits closer to H₀, so it is harder to detect: power falls." }
      ],
      "pattern": "<b>Power = P(reject H₀ | H₀ false).</b> It rises with n, the true effect size and α, and falls with σ: anything that pushes the test statistic further from 0 or lowers the bar raises it.",
      "steps": [
        "The statistic is roughly effect ÷ (σ/√n).",
        "Larger n → smaller SE → larger statistic → more likely past the cut-off. <b>Power up.</b>",
        "Smaller α raises the cut-off; larger σ or a smaller effect shrinks the statistic. All lower power."
      ],
      "cards": ["power", "type12", "se"],
      "graph": { "key": "econ378Errors", "args": { "mode": "power" } }
    }
  ]
};
