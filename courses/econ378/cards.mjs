// ECON 378 flashcards, in the ECON 381 card schema (see cards/src/week2.mjs).
export default [
  {
    "id": "mean",
    "n": 1,
    "week": 1,
    "term": "Sample mean",
    "simple": "x̄ = (1/n) Σ x<sub>i</sub>. The balance point of the data. Pulled toward outliers.",
    "more": [
      "In a right-skewed distribution (like income) the mean is above the median."
    ]
  },
  {
    "id": "median",
    "n": 2,
    "week": 1,
    "term": "Median",
    "simple": "The middle value of the sorted data (the average of the two middle values when n is even). Resistant to outliers."
  },
  {
    "id": "svar",
    "n": 3,
    "week": 1,
    "term": "Sample variance",
    "simple": "s² = Σ(x<sub>i</sub> − x̄)² / (n − 1). Dividing by n − 1 makes s² an unbiased estimator of σ².",
    "more": [
      "n − 1 = degrees of freedom: once x̄ is fixed, only n − 1 deviations are free."
    ]
  },
  {
    "id": "zscore",
    "n": 4,
    "week": 1,
    "term": "z-score",
    "simple": "z = (x − μ)/σ: how many standard deviations a value sits from the mean."
  },
  {
    "id": "iqr",
    "n": 5,
    "week": 1,
    "term": "IQR & the 1.5×IQR rule",
    "simple": "IQR = Q3 − Q1. Points below Q1 − 1.5·IQR or above Q3 + 1.5·IQR are flagged as outliers."
  },
  {
    "id": "corr",
    "n": 6,
    "week": 1,
    "term": "Correlation r",
    "simple": "r = Cov(x, y)/(s<sub>x</sub> s<sub>y</sub>), between −1 and 1. Measures <i>linear</i> association only, and correlation ≠ causation."
  },
  {
    "id": "condp",
    "n": 7,
    "week": 2,
    "term": "Conditional probability",
    "simple": "P(A | B) = P(A ∩ B) / P(B): the probability of A once you know B happened."
  },
  {
    "id": "indep",
    "n": 8,
    "week": 2,
    "term": "Independence",
    "simple": "A and B are independent if P(A ∩ B) = P(A)·P(B), equivalently P(A | B) = P(A)."
  },
  {
    "id": "bayes",
    "n": 9,
    "week": 2,
    "term": "Bayes’ theorem",
    "simple": "P(A | B) = P(B | A)·P(A) / P(B), with P(B) = P(B|A)P(A) + P(B|A<sup>c</sup>)P(A<sup>c</sup>).",
    "more": [
      "Rare conditions + imperfect tests ⇒ most positives can be false positives (base-rate fallacy)."
    ]
  },
  {
    "id": "ev",
    "n": 10,
    "week": 2,
    "term": "Expected value",
    "simple": "E[X] = Σ x·P(X = x) (discrete) or ∫ x f(x) dx (continuous). Linear: E[aX + b] = aE[X] + b."
  },
  {
    "id": "varrules",
    "n": 11,
    "week": 2,
    "term": "Variance rules",
    "simple": "Var(aX + b) = a²Var(X). Var(X + Y) = Var(X) + Var(Y) + 2Cov(X, Y), so the covariance term drops out when X and Y are independent."
  },
  {
    "id": "binom",
    "n": 12,
    "week": 3,
    "term": "Binomial(n, p)",
    "simple": "Number of successes in n independent trials with success probability p. P(X = k) = C(n,k) p<sup>k</sup>(1−p)<sup>n−k</sup>. Mean np, variance np(1−p)."
  },
  {
    "id": "pois",
    "n": 13,
    "week": 3,
    "term": "Poisson(λ)",
    "simple": "Counts of events in a fixed interval at constant rate λ. P(X = k) = e<sup>−λ</sup>λ<sup>k</sup>/k!. Mean = variance = λ."
  },
  {
    "id": "normal",
    "n": 14,
    "week": 3,
    "term": "Normal distribution",
    "simple": "Bell-shaped, symmetric, described by μ and σ. About 68% / 95% / 99.7% of values lie within 1 / 2 / 3 σ of μ."
  },
  {
    "id": "tdist",
    "n": 15,
    "week": 3,
    "term": "t distribution",
    "simple": "Like the standard normal but with fatter tails. Used when σ is estimated by s. Approaches N(0,1) as df → ∞.",
    "more": [
      "One-sample t: df = n − 1. Two-sided 95% critical value: 2.262 at df 9, 2.042 at df 30, 1.96 in the limit."
    ]
  },
  {
    "id": "chisq",
    "n": 16,
    "week": 3,
    "term": "Chi-square distribution",
    "simple": "Sum of k squared independent standard normals. Right-skewed, mean k. Used for variance tests, goodness-of-fit, and independence in contingency tables."
  },
  {
    "id": "sampdist",
    "n": 17,
    "week": 4,
    "term": "Sampling distribution",
    "simple": "The distribution of a statistic (like x̄) across all possible samples of size n from the population."
  },
  {
    "id": "se",
    "n": 18,
    "week": 4,
    "term": "Standard error of x̄",
    "simple": "SE = σ/√n (estimated by s/√n). Quadrupling n halves the SE."
  },
  {
    "id": "clt",
    "n": 19,
    "week": 4,
    "term": "Central Limit Theorem",
    "simple": "For large n, x̄ is approximately N(μ, σ²/n) <i>whatever the population’s shape</i> (as long as σ is finite).",
    "more": [
      "Rule of thumb n ≥ 30, more for very skewed populations. See the CLT simulator in Tools."
    ]
  },
  {
    "id": "unbiased",
    "n": 20,
    "week": 4,
    "term": "Unbiased estimator",
    "simple": "An estimator whose expected value equals the parameter: E[θ̂] = θ. x̄ is unbiased for μ, and s² is unbiased for σ²."
  },
  {
    "id": "consistent",
    "n": 21,
    "week": 4,
    "term": "Consistent estimator",
    "simple": "An estimator that converges to the true parameter as n → ∞ (its sampling distribution collapses onto θ)."
  },
  {
    "id": "ci",
    "n": 22,
    "week": 5,
    "term": "Confidence interval for μ",
    "simple": "x̄ ± z*·σ/√n (σ known) or x̄ ± t*<sub>n−1</sub>·s/√n (σ unknown).",
    "more": [
      "Margin of error grows with confidence level and σ, shrinks with √n."
    ]
  },
  {
    "id": "ciinterp",
    "n": 23,
    "week": 5,
    "term": "What “95% confident” means",
    "simple": "If we repeated the sampling many times, about 95% of the intervals built this way would contain μ. Any one interval either does or doesn’t."
  },
  {
    "id": "pval",
    "n": 24,
    "week": 5,
    "term": "p-value",
    "simple": "The probability, <i>assuming H₀ is true</i>, of a test statistic at least as extreme as the one observed. It is <b>not</b> P(H₀ true).",
    "more": [
      "Reject H₀ when p ≤ α."
    ]
  },
  {
    "id": "type12",
    "n": 25,
    "week": 5,
    "term": "Type I and Type II errors",
    "simple": "Type I: rejecting a true H₀ (probability α). Type II: failing to reject a false H₀ (probability β)."
  },
  {
    "id": "power",
    "n": 26,
    "week": 5,
    "term": "Power",
    "simple": "1 − β: the probability of rejecting H₀ when it is false. Rises with n, effect size and α, and falls with σ."
  },
  {
    "id": "ols",
    "n": 27,
    "week": 6,
    "term": "OLS slope and intercept",
    "simple": "β̂₁ = Σ(x−x̄)(y−ȳ)/Σ(x−x̄)² = Cov(x,y)/Var(x); β̂₀ = ȳ − β̂₁x̄. Minimizes the sum of squared residuals.",
    "more": [
      "With an intercept, residuals sum to zero and the line passes through (x̄, ȳ)."
    ]
  },
  {
    "id": "r2",
    "n": 28,
    "week": 6,
    "term": "R²",
    "simple": "Share of the variance in y explained by the regression: 1 − SSR/SST. In simple regression, R² = r²."
  }
];
