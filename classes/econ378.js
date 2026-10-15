// ECON 378 · Statistics for Economists. Cards, practice questions and four
// tools from research/econ378-features.md: distribution visualizer, CLT
// simulator, confidence-interval playground, hypothesis-test solver. The
// maths (Stat) is plain functions, checked in tools/classes.test.mjs.
(function () {
  "use strict";
  var S = window.Study, h = S.h, fmt = S.fmt;

  // ------------------------------------------------------------- maths

  var LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  function lnGamma(z) {
    if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
    z -= 1;
    var x = LANCZOS[0];
    for (var i = 1; i < 9; i++) x += LANCZOS[i] / (z + i);
    var t = z + 7.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }
  // erfc with fractional error below 1.2e-7 (Numerical Recipes' erfcc).
  function erfc(x) {
    var z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    var r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 +
      t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }
  function betacf(x, a, b) {
    var qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    d = 1 / d;
    var hh = d;
    for (var m = 1; m <= 300; m++) {
      var m2 = 2 * m, aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; hh *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d;
      var del = d * c; hh *= del;
      if (Math.abs(del - 1) < 1e-12) break;
    }
    return hh;
  }
  /** Regularized incomplete beta I_x(a, b). */
  function ibeta(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(x, a, b) / a : 1 - bt * betacf(1 - x, b, a) / b;
  }
  /** Regularized lower incomplete gamma P(a, x). */
  function gammaP(a, x) {
    if (x <= 0) return 0;
    var gln = lnGamma(a);
    if (x < a + 1) {
      var ap = a, sum = 1 / a, del = sum;
      for (var n = 0; n < 500; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-14) break; }
      return sum * Math.exp(-x + a * Math.log(x) - gln);
    }
    var b = x + 1 - a, c = 1e300, d = 1 / b, hh = d;
    for (var i = 1; i < 500; i++) {
      var an = -i * (i - a); b += 2;
      d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d; var del2 = d * c; hh *= del2;
      if (Math.abs(del2 - 1) < 1e-14) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - gln) * hh;
  }
  function lnChoose(n, k) { return lnGamma(n + 1) - lnGamma(k + 1) - lnGamma(n - k + 1); }

  var Stat = {
    lnGamma: lnGamma, ibeta: ibeta, gammaP: gammaP,
    normPdf: function (x, mu, sd) { mu = mu || 0; sd = sd || 1; var z = (x - mu) / sd; return Math.exp(-z * z / 2) / (sd * Math.sqrt(2 * Math.PI)); },
    normCdf: function (x, mu, sd) { mu = mu || 0; sd = sd || 1; return 0.5 * erfc(-(x - mu) / (sd * Math.SQRT2)); },
    tPdf: function (x, v) { return Math.exp(lnGamma((v + 1) / 2) - lnGamma(v / 2)) / Math.sqrt(v * Math.PI) * Math.pow(1 + x * x / v, -(v + 1) / 2); },
    tCdf: function (x, v) { var p = 0.5 * ibeta(v / (v + x * x), v / 2, 0.5); return x > 0 ? 1 - p : p; },
    chiPdf: function (x, k) { return x <= 0 ? 0 : Math.exp((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.LN2 - lnGamma(k / 2)); },
    chiCdf: function (x, k) { return gammaP(k / 2, x / 2); },
    fPdf: function (x, a, b) {
      if (x <= 0) return 0;
      return Math.exp(0.5 * (a * Math.log(a * x) + b * Math.log(b) - (a + b) * Math.log(a * x + b)) - Math.log(x) -
        (lnGamma(a / 2) + lnGamma(b / 2) - lnGamma((a + b) / 2)));
    },
    fCdf: function (x, a, b) { return x <= 0 ? 0 : ibeta(a * x / (a * x + b), a / 2, b / 2); },
    binomPmf: function (k, n, p) {
      if (k < 0 || k > n) return 0;
      if (p === 0) return k === 0 ? 1 : 0;
      if (p === 1) return k === n ? 1 : 0;
      return Math.exp(lnChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
    },
    poisPmf: function (k, l) { return k < 0 ? 0 : Math.exp(k * Math.log(l) - l - lnGamma(k + 1)); },
    /** x with cdf(x) = p, by bisection on [lo, hi]. */
    inv: function (cdf, p, lo, hi) {
      for (var i = 0; i < 200; i++) { var mid = (lo + hi) / 2; if (cdf(mid) < p) lo = mid; else hi = mid; }
      return (lo + hi) / 2;
    },
    zCrit: function (p) { return Stat.inv(function (x) { return Stat.normCdf(x); }, p, -12, 12); },
    tCrit: function (p, v) { return Stat.inv(function (x) { return Stat.tCdf(x, v); }, p, -1e3, 1e3); },
    welchDf: function (s1, n1, s2, n2) {
      var a = s1 * s1 / n1, b = s2 * s2 / n2;
      return (a + b) * (a + b) / (a * a / (n1 - 1) + b * b / (n2 - 1));
    },
  };

  function randn() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  // ------------------------------------------------------------ cards

  var groups = [
    { id: "desc", name: "Descriptive" },
    { id: "prob", name: "Probability" },
    { id: "dist", name: "Distributions" },
    { id: "samp", name: "Sampling & CLT" },
    { id: "inf", name: "Inference" },
    { id: "reg", name: "Regression" },
  ];

  var cards = [
    { id: "mean", group: "desc", term: "Sample mean", def: "x̄ = (1/n) Σ x<sub>i</sub>. The balance point of the data. Pulled toward outliers.",
      more: "In a right-skewed distribution (like income) the mean is above the median." },
    { id: "median", group: "desc", term: "Median", def: "The middle value of the sorted data (the average of the two middle values when n is even). Resistant to outliers." },
    { id: "svar", group: "desc", term: "Sample variance", def: "s² = Σ(x<sub>i</sub> − x̄)² / (n − 1). Dividing by n − 1 makes s² an unbiased estimator of σ².",
      more: "n − 1 = degrees of freedom: once x̄ is fixed, only n − 1 deviations are free." },
    { id: "zscore", group: "desc", term: "z-score", def: "z = (x − μ)/σ: how many standard deviations a value sits from the mean." },
    { id: "iqr", group: "desc", term: "IQR & the 1.5×IQR rule", def: "IQR = Q3 − Q1. Points below Q1 − 1.5·IQR or above Q3 + 1.5·IQR are flagged as outliers." },
    { id: "corr", group: "desc", term: "Correlation r", def: "r = Cov(x, y)/(s<sub>x</sub> s<sub>y</sub>), between −1 and 1. Measures <i>linear</i> association only, and correlation ≠ causation." },

    { id: "condp", group: "prob", term: "Conditional probability", def: "P(A | B) = P(A ∩ B) / P(B): the probability of A once you know B happened." },
    { id: "indep", group: "prob", term: "Independence", def: "A and B are independent if P(A ∩ B) = P(A)·P(B), equivalently P(A | B) = P(A)." },
    { id: "bayes", group: "prob", term: "Bayes’ theorem", def: "P(A | B) = P(B | A)·P(A) / P(B), with P(B) = P(B|A)P(A) + P(B|A<sup>c</sup>)P(A<sup>c</sup>).",
      more: "Rare conditions + imperfect tests ⇒ most positives can be false positives (base-rate fallacy)." },
    { id: "ev", group: "prob", term: "Expected value", def: "E[X] = Σ x·P(X = x) (discrete) or ∫ x f(x) dx (continuous). Linear: E[aX + b] = aE[X] + b." },
    { id: "varrules", group: "prob", term: "Variance rules", def: "Var(aX + b) = a²Var(X). Var(X + Y) = Var(X) + Var(Y) + 2Cov(X, Y), so the covariance term drops out when X and Y are independent." },

    { id: "binom", group: "dist", term: "Binomial(n, p)", def: "Number of successes in n independent trials with success probability p. P(X = k) = C(n,k) p<sup>k</sup>(1−p)<sup>n−k</sup>. Mean np, variance np(1−p)." },
    { id: "pois", group: "dist", term: "Poisson(λ)", def: "Counts of events in a fixed interval at constant rate λ. P(X = k) = e<sup>−λ</sup>λ<sup>k</sup>/k!. Mean = variance = λ." },
    { id: "normal", group: "dist", term: "Normal distribution", def: "Bell-shaped, symmetric, described by μ and σ. About 68% / 95% / 99.7% of values lie within 1 / 2 / 3 σ of μ." },
    { id: "tdist", group: "dist", term: "t distribution", def: "Like the standard normal but with fatter tails. Used when σ is estimated by s. Approaches N(0,1) as df → ∞.",
      more: "One-sample t: df = n − 1. Two-sided 95% critical value: 2.262 at df 9, 2.042 at df 30, 1.96 in the limit." },
    { id: "chisq", group: "dist", term: "Chi-square distribution", def: "Sum of k squared independent standard normals. Right-skewed, mean k. Used for variance tests, goodness-of-fit, and independence in contingency tables." },

    { id: "sampdist", group: "samp", term: "Sampling distribution", def: "The distribution of a statistic (like x̄) across all possible samples of size n from the population." },
    { id: "se", group: "samp", term: "Standard error of x̄", def: "SE = σ/√n (estimated by s/√n). Quadrupling n halves the SE." },
    { id: "clt", group: "samp", term: "Central Limit Theorem", def: "For large n, x̄ is approximately N(μ, σ²/n) <i>whatever the population’s shape</i> (as long as σ is finite).",
      more: "Rule of thumb n ≥ 30, more for very skewed populations. See the CLT simulator in Tools." },
    { id: "unbiased", group: "samp", term: "Unbiased estimator", def: "An estimator whose expected value equals the parameter: E[θ̂] = θ. x̄ is unbiased for μ, and s² is unbiased for σ²." },
    { id: "consistent", group: "samp", term: "Consistent estimator", def: "An estimator that converges to the true parameter as n → ∞ (its sampling distribution collapses onto θ)." },

    { id: "ci", group: "inf", term: "Confidence interval for μ", def: "x̄ ± z*·σ/√n (σ known) or x̄ ± t*<sub>n−1</sub>·s/√n (σ unknown).",
      more: "Margin of error grows with confidence level and σ, shrinks with √n." },
    { id: "ciinterp", group: "inf", term: "What “95% confident” means", def: "If we repeated the sampling many times, about 95% of the intervals built this way would contain μ. Any one interval either does or doesn’t." },
    { id: "pval", group: "inf", term: "p-value", def: "The probability, <i>assuming H₀ is true</i>, of a test statistic at least as extreme as the one observed. It is <b>not</b> P(H₀ true).",
      more: "Reject H₀ when p ≤ α." },
    { id: "type12", group: "inf", term: "Type I and Type II errors", def: "Type I: rejecting a true H₀ (probability α). Type II: failing to reject a false H₀ (probability β)." },
    { id: "power", group: "inf", term: "Power", def: "1 − β: the probability of rejecting H₀ when it is false. Rises with n, effect size and α, and falls with σ." },

    { id: "ols", group: "reg", term: "OLS slope and intercept", def: "β̂₁ = Σ(x−x̄)(y−ȳ)/Σ(x−x̄)² = Cov(x,y)/Var(x); β̂₀ = ȳ − β̂₁x̄. Minimizes the sum of squared residuals.",
      more: "With an intercept, residuals sum to zero and the line passes through (x̄, ȳ)." },
    { id: "r2", group: "reg", term: "R²", def: "Share of the variance in y explained by the regression: 1 − SSR/SST. In simple regression, R² = r²." },
  ];

  // --------------------------------------------------------- practice

  var practice = [
    { id: "q1", group: "dist", q: "X ~ N(100, 15²). What is P(X &gt; 130)?",
      options: [
        { t: "≈ 0.0228", right: true, why: "z = (130 − 100)/15 = 2, and P(Z &gt; 2) = 1 − 0.9772." },
        { t: "≈ 0.9772", why: "That’s P(X &lt; 130). The question asks for the upper tail." },
        { t: "≈ 0.0455", why: "That’s both tails, P(|Z| &gt; 2). Only the upper tail is asked." },
        { t: "≈ 0.1587", why: "That’s P(Z &gt; 1), as if z were 30/30. The z-score divides by σ = 15." },
      ] },
    { id: "q2", group: "inf", q: "n = 36, σ = 12 (known), x̄ = 50. The 95% confidence interval for μ is…",
      options: [
        { t: "50 ± 3.92", right: true, why: "SE = 12/√36 = 2, so 1.96 × 2 = 3.92." },
        { t: "50 ± 23.52", why: "Used σ instead of the standard error σ/√n." },
        { t: "50 ± 3.29", why: "1.645 × 2 = 3.29 is the 90% margin." },
        { t: "50 ± 0.65", why: "Divided σ by n (12/36) instead of √n." },
      ] },
    { id: "q3", group: "inf", q: "A test gives p = 0.03. Which statement is correct?",
      options: [
        { t: "If H₀ were true, results at least this extreme would occur about 3% of the time", right: true, why: "That’s the definition: a probability computed assuming H₀." },
        { t: "There is a 3% chance H₀ is true", why: "The p-value assumes H₀. It is not the probability that H₀ is true." },
        { t: "There is a 97% chance Hₐ is true", why: "Same error in reverse. Frequentist tests don’t give probabilities of hypotheses." },
        { t: "The effect is large and important", why: "A small p can come from a tiny effect with a big n. Significance isn’t importance." },
      ] },
    { id: "q4", group: "inf", q: "A Type I error is…",
      options: [
        { t: "Rejecting H₀ when it is actually true", right: true, why: "Its probability is the significance level α." },
        { t: "Failing to reject H₀ when it is false", why: "That’s a Type II error (probability β)." },
        { t: "Using the wrong test statistic", why: "That’s just a mistake. Type I/II refer to wrong decisions about H₀." },
        { t: "Rejecting Hₐ when it is true", why: "We never “reject Hₐ”. We reject or fail to reject H₀." },
      ] },
    { id: "q5", group: "samp", q: "Incomes are strongly right-skewed. For samples of n = 200, the sampling distribution of x̄ is…",
      options: [
        { t: "Approximately normal, centered at μ with SD σ/√200", right: true, why: "The CLT: x̄ is approximately normal for large n whatever the population’s shape." },
        { t: "Right-skewed like the population", why: "Individual incomes are skewed, but averages of 200 are close to normal (the CLT)." },
        { t: "Exactly normal", why: "Only approximately. Exactly normal requires a normal population." },
        { t: "Centered at the median", why: "x̄ is unbiased for the <i>mean</i> μ, not the median." },
      ] },
    { id: "q6", group: "samp", q: "To cut the standard error of x̄ in half, the sample size must be…",
      options: [
        { t: "Multiplied by 4", right: true, why: "SE = σ/√n; √(4n) = 2√n." },
        { t: "Doubled", why: "Doubling n divides SE by √2 ≈ 1.41, not 2." },
        { t: "Halved", why: "A smaller n makes the SE larger." },
        { t: "Multiplied by 2²·σ", why: "σ doesn’t enter how n scales: n × 4 regardless of σ." },
      ] },
    { id: "q7", group: "prob", q: "1% of people have a condition. A test catches 90% of cases and gives a false positive to 5% of healthy people. Given a positive test, the chance the person has the condition is about…",
      options: [
        { t: "15%", right: true, why: "0.9·0.01 / (0.9·0.01 + 0.05·0.99) = 0.009/0.0585 ≈ 0.154." },
        { t: "90%", why: "That’s P(+ | condition), the sensitivity, not P(condition | +)." },
        { t: "95%", why: "That’s P(− | healthy). It ignores the low base rate." },
        { t: "1%", why: "That’s the prior. A positive test should raise it." },
      ] },
    { id: "q8", group: "dist", q: "X ~ Binomial(5, 0.5). P(X = 2) = ?",
      options: [
        { t: "0.3125", right: true, why: "C(5,2)·0.5⁵ = 10/32." },
        { t: "0.03125", why: "Forgot the C(5,2) = 10 ways to place the successes." },
        { t: "0.4", why: "2/5 is a proportion, not a binomial probability." },
        { t: "0.5", why: "That’s p for a single trial." },
      ] },
    { id: "q9", group: "prob", q: "Var(X) = 4. What is Var(2X + 3)?",
      options: [
        { t: "16", right: true, why: "Var(aX + b) = a²Var(X) = 4·4. The constant shifts but doesn’t spread." },
        { t: "11", why: "Var(aX + b) isn’t aVar(X) + b. Constants drop out, and a gets squared." },
        { t: "8", why: "a must be squared: 2² × 4 = 16." },
        { t: "19", why: "Adding 3 doesn’t change the spread, so drop the + 3." },
      ] },
    { id: "q10", group: "inf", q: "Testing H₀: μ = 10 with n = 16, σ unknown. Which reference distribution?",
      options: [
        { t: "t with 15 degrees of freedom", right: true, why: "σ is estimated by s, so use t with n − 1 df." },
        { t: "Standard normal", why: "z needs a known σ (or a very large n)." },
        { t: "t with 16 degrees of freedom", why: "One-sample t uses n − 1 = 15 df." },
        { t: "Chi-square with 15 df", why: "Chi-square is for variances/counts, not a mean." },
      ] },
    { id: "q11", group: "reg", q: "Cov(x, y) = 6 and Var(x) = 3. The OLS slope of y on x is…",
      options: [
        { t: "2", right: true, why: "β̂₁ = Cov(x, y)/Var(x) = 6/3." },
        { t: "0.5", why: "That’s Var(x)/Cov(x, y), upside down." },
        { t: "18", why: "Multiplied instead of dividing." },
        { t: "Can’t tell without Var(y)", why: "Var(y) matters for r and R², not the slope." },
      ] },
    { id: "q12", group: "inf", q: "Which change increases the power of a test (all else equal)?",
      options: [
        { t: "Larger sample size", right: true, why: "The SE shrinks, so a real effect gives a larger test statistic." },
        { t: "Smaller α", why: "A stricter α makes rejection harder, so power falls." },
        { t: "Larger population σ", why: "More noise means a bigger SE and lower power." },
        { t: "Smaller true effect", why: "Smaller effects are harder to detect." },
      ] },
  ];

  // ------------------------------------------------------------ tools

  var SHADE = "rgba(109,75,176,.35)", CURVE = "#6D4BB0";

  // 1. Distribution visualizer
  var DISTS = {
    normal: { name: "Normal", params: [["μ", -10, 10, 0.5, 0], ["σ", 0.2, 10, 0.1, 1]],
      pdf: function (x, p) { return Stat.normPdf(x, p[0], p[1]); }, cdf: function (x, p) { return Stat.normCdf(x, p[0], p[1]); },
      range: function (p) { return [p[0] - 4 * p[1], p[0] + 4 * p[1]]; }, mom: function (p) { return [p[0], p[1] * p[1]]; } },
    t: { name: "Student t", params: [["df", 1, 60, 1, 5]],
      pdf: function (x, p) { return Stat.tPdf(x, p[0]); }, cdf: function (x, p) { return Stat.tCdf(x, p[0]); },
      range: function () { return [-5, 5]; }, mom: function (p) { return [p[0] > 1 ? 0 : NaN, p[0] > 2 ? p[0] / (p[0] - 2) : NaN]; } },
    chisq: { name: "Chi-square", params: [["df", 1, 50, 1, 4]],
      pdf: function (x, p) { return Stat.chiPdf(x, p[0]); }, cdf: function (x, p) { return Stat.chiCdf(x, p[0]); },
      range: function (p) { return [0, Math.max(10, p[0] + 5 * Math.sqrt(2 * p[0]))]; }, mom: function (p) { return [p[0], 2 * p[0]]; } },
    f: { name: "F", params: [["df₁", 1, 50, 1, 5], ["df₂", 1, 60, 1, 20]],
      pdf: function (x, p) { return Stat.fPdf(x, p[0], p[1]); }, cdf: function (x, p) { return Stat.fCdf(x, p[0], p[1]); },
      range: function () { return [0, 5]; },
      mom: function (p) { var a = p[0], b = p[1]; return [b > 2 ? b / (b - 2) : NaN, b > 4 ? 2 * b * b * (a + b - 2) / (a * (b - 2) * (b - 2) * (b - 4)) : NaN]; } },
    binom: { name: "Binomial", discrete: true, params: [["n", 1, 60, 1, 10], ["p", 0.01, 0.99, 0.01, 0.5]],
      pmf: function (k, p) { return Stat.binomPmf(k, p[0], p[1]); },
      range: function (p) { return [0, p[0]]; }, mom: function (p) { return [p[0] * p[1], p[0] * p[1] * (1 - p[1])]; } },
    pois: { name: "Poisson", discrete: true, params: [["λ", 0.2, 30, 0.1, 4]],
      pmf: function (k, p) { return Stat.poisPmf(k, p[0]); },
      range: function (p) { return [0, Math.ceil(p[0] + 5 * Math.sqrt(p[0]) + 3)]; }, mom: function (p) { return [p[0], p[0]]; } },
  };

  function distTool(el) {
    var st = S.load("dist", { d: "normal", mode: "le", a: -1, b: 1.96, p: {} });
    var plot = h("div"), out = h("div", { class: "kv" }), params = h("div", { class: "stack" });
    var aIn = h("input", { type: "number", step: "any", value: st.a, oninput: draw });
    var bIn = h("input", { type: "number", step: "any", value: st.b, oninput: draw });
    var qIn = h("input", { type: "number", step: "any", min: 0, max: 1, value: 0.975, oninput: draw });
    var modeSel = S.select("Probability", [["le", "P(X ≤ b)"], ["ge", "P(X ≥ a)"], ["between", "P(a ≤ X ≤ b)"], ["out", "P(X ≤ a or X ≥ b)"]], st.mode,
      function (v) { st.mode = v; draw(); });
    var sliders = [];
    var distSel = S.select("Distribution", Object.keys(DISTS).map(function (k) { return [k, DISTS[k].name]; }), st.d, function (v) { st.d = v; buildParams(); draw(); });
    function buildParams() {
      params.innerHTML = ""; sliders = [];
      var D = DISTS[st.d], saved = st.p[st.d] || [];
      D.params.forEach(function (p, k) {
        var s = S.slider(p[0], { min: p[1], max: p[2], step: p[3], value: saved[k] != null ? saved[k] : p[4] }, draw);
        sliders.push(s); params.appendChild(s.el);
      });
    }
    function draw() {
      var D = DISTS[st.d], p = sliders.map(function (s) { return s.value; });
      st.p[st.d] = p; st.a = +aIn.value; st.b = +bIn.value; S.save("dist", st);
      var a = +aIn.value, b = +bIn.value, mode = st.mode, r = D.range(p);
      var inRegion = function (x) {
        return mode === "le" ? x <= b : mode === "ge" ? x >= a : mode === "between" ? x >= a && x <= b : x <= a || x >= b;
      };
      var prob, c, ymax = 0, i;
      if (D.discrete) {
        var bars = [];
        for (i = r[0]; i <= r[1]; i++) { var v = D.pmf(i, p); bars.push([i, v]); ymax = Math.max(ymax, v); }
        prob = bars.reduce(function (s, q) { return s + (inRegion(q[0]) ? q[1] : 0); }, 0);
        c = S.chart({ x: [r[0] - 0.6, r[1] + 0.6], y: [0, ymax * 1.12] }).axes({ xlabel: "x", ylabel: "P(X = x)", yfmt: function (v) { return v.toFixed(2); } });
        bars.forEach(function (q) { c.rect(q[0] - 0.4, 0, q[0] + 0.4, q[1], { fill: inRegion(q[0]) ? CURVE : "rgba(43,33,24,.18)", rx: 2 }); });
      } else {
        var N = 300, pts = [], dx = (r[1] - r[0]) / N;
        for (i = 0; i <= N; i++) {
          var x = r[0] + i * dx, y = D.pdf(i === 0 && r[0] === 0 ? dx * 0.02 : x, p);
          pts.push([x, y]);
          if (isFinite(y) && i > N * 0.01) ymax = Math.max(ymax, y);
        }
        ymax = Math.max(ymax, 1e-6);
        var F = function (x) { return D.cdf(x, p); };
        prob = mode === "le" ? F(b) : mode === "ge" ? 1 - F(a) : mode === "between" ? Math.max(0, F(b) - F(a)) : F(a) + 1 - F(Math.max(a, b));
        c = S.chart({ x: r, y: [0, ymax * 1.15] }).axes({ xlabel: "x", ylabel: "density", yfmt: function (v) { return v.toFixed(2); } });
        var shade = function (lo, hi) {
          lo = Math.max(lo, r[0]); hi = Math.min(hi, r[1]);
          if (hi <= lo) return;
          var poly = [[lo, 0]];
          for (var j = 0; j <= 120; j++) { var xx = lo + (hi - lo) * j / 120; poly.push([xx, Math.min(D.pdf(xx || 1e-9, p), ymax * 2)]); }
          poly.push([hi, 0]);
          c.area(poly, { fill: SHADE });
        };
        if (mode === "le") shade(-Infinity, b);
        else if (mode === "ge") shade(a, Infinity);
        else if (mode === "between") shade(a, b);
        else { shade(-Infinity, a); shade(Math.max(a, b), Infinity); }
        c.path(pts.map(function (q) { return [q[0], Math.min(q[1], ymax * 2)]; }), { stroke: CURVE, "stroke-width": 2.5 });
      }
      [["a", a], ["b", b]].forEach(function (q) {
        if ((q[0] === "a" && mode === "le") || (q[0] === "b" && mode === "ge")) return;
        c.line(q[1], 0, q[1], ymax * 1.15, { stroke: "#2B2118", "stroke-dasharray": "4 4", "stroke-width": 1 });
        c.text(q[1], ymax * 1.08, q[0] + " = " + fmt(q[1], 2), { "text-anchor": "middle", "font-size": 11, dx: 0 });
      });
      plot.innerHTML = c.svg();
      var m = D.mom(p), qv = +qIn.value, quant = "—";
      if (qv > 0 && qv < 1) {
        if (D.discrete) {
          var cum = 0;
          for (i = 0; i <= 2000; i++) { cum += D.pmf(i, p); if (cum >= qv - 1e-12) { quant = String(i); break; } }
        } else quant = fmt(Stat.inv(function (x) { return D.cdf(x, p); }, qv, st.d === "normal" ? p[0] - 40 * p[1] : st.d === "t" ? -1e3 : 0, st.d === "normal" ? p[0] + 40 * p[1] : 1e4), 4);
      }
      out.innerHTML = "";
      [[modeSel.input.selectedOptions[0].textContent, fmt(prob, 4)], ["Mean", fmt(m[0], 3)], ["Variance", fmt(m[1], 3)],
        ["SD", fmt(Math.sqrt(m[1]), 3)], ["x with P(X ≤ x) = " + qv, quant]].forEach(function (row, k) {
        out.appendChild(h("span", { style: k === 0 ? "font-weight:700" : "" }, row[0]));
        out.appendChild(h("b", { style: k === 0 ? "font-size:20px;color:" + CURVE : "" }, row[1]));
      });
    }
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "panel card pad" }, distSel.el, params, modeSel.el,
        h("div", { class: "fgrid", style: "grid-template-columns:1fr 1fr" }, h("label", { class: "f" }, "a", aIn), h("label", { class: "f" }, "b", bIn)),
        h("label", { class: "f" }, "Quantile: probability p", qIn),
        h("p", { class: "dim small", style: "margin:0" }, "Critical values: two-sided 5% → p = 0.975; one-sided 5% → p = 0.95.")),
      h("div", { class: "panel" }, plot, h("div", { class: "card pad" }, out))));
    buildParams(); draw();
  }

  // 2. CLT simulator
  var POPS = {
    uniform: { name: "Uniform(0, 10)", mu: 5, sd: 10 / Math.sqrt(12), draw: function () { return 10 * Math.random(); },
      pdf: function (x) { return x >= 0 && x <= 10 ? 0.1 : 0; }, range: [-1, 11] },
    expo: { name: "Right-skewed (exponential, mean 2)", mu: 2, sd: 2, draw: function () { return -2 * Math.log(1 - Math.random()); },
      pdf: function (x) { return x < 0 ? 0 : Math.exp(-x / 2) / 2; }, range: [0, 12] },
    bimodal: { name: "Bimodal (peaks at 2 and 8)", mu: 5, sd: Math.sqrt(0.64 + 9),
      draw: function () { return (Math.random() < 0.5 ? 2 : 8) + 0.8 * randn(); },
      pdf: function (x) { return 0.5 * Stat.normPdf(x, 2, 0.8) + 0.5 * Stat.normPdf(x, 8, 0.8); }, range: [-1, 11] },
    dice: { name: "One die (1–6)", mu: 3.5, sd: Math.sqrt(35 / 12), discrete: [1, 2, 3, 4, 5, 6],
      draw: function () { return 1 + Math.floor(6 * Math.random()); }, range: [0, 7] },
    bern: { name: "Bernoulli p = 0.2 (0 or 1)", mu: 0.2, sd: 0.4, discrete: [0, 1], probs: [0.8, 0.2],
      draw: function () { return Math.random() < 0.2 ? 1 : 0; }, range: [-0.5, 1.5] },
  };
  function cltTool(el) {
    var popKey = "expo", means = [];
    var popPlot = h("div"), plot = h("div"), stats = h("div", { class: "kv" });
    var nS = S.slider("Sample size n", { min: 1, max: 100, value: 5 }, function () { means = []; draw(); });
    var popSel = S.select("Population", Object.keys(POPS).map(function (k) { return [k, POPS[k].name]; }), popKey,
      function (v) { popKey = v; means = []; draw(); });
    function sample(times) {
      var P = POPS[popKey], n = nS.value;
      for (var t = 0; t < times; t++) { var s = 0; for (var i = 0; i < n; i++) s += P.draw(); means.push(s / n); }
      draw();
    }
    function draw() {
      var P = POPS[popKey], n = nS.value, se = P.sd / Math.sqrt(n);
      // population
      var pc;
      if (P.discrete) {
        var probs = P.probs || P.discrete.map(function () { return 1 / P.discrete.length; }), pm = Math.max.apply(null, probs);
        pc = S.chart({ w: 640, h: 170, x: P.range, y: [0, pm * 1.15], m: { l: 20, b: 28, t: 10 } }).axes({ yaxis: false, grid: false });
        P.discrete.forEach(function (v, k) { pc.rect(v - 0.3, 0, v + 0.3, probs[k], { fill: "rgba(43,33,24,.25)" }); });
      } else {
        var pts = [], ym = 0;
        for (var i = 0; i <= 200; i++) { var x = P.range[0] + (P.range[1] - P.range[0]) * i / 200, y = P.pdf(x); pts.push([x, y]); ym = Math.max(ym, y); }
        pc = S.chart({ w: 640, h: 170, x: P.range, y: [0, ym * 1.15], m: { l: 20, b: 28, t: 10 } }).axes({ yaxis: false, grid: false });
        pc.area([[P.range[0], 0]].concat(pts, [[P.range[1], 0]]), { fill: "rgba(43,33,24,.15)" }).path(pts, { stroke: "#85796E" });
      }
      pc.line(P.mu, 0, P.mu, 1e9, { stroke: CURVE, "stroke-dasharray": "4 3" });
      popPlot.innerHTML = pc.svg();
      // sample means
      var lo = P.mu - 4.5 * se, hi = P.mu + 4.5 * se, bins = 40, bw = (hi - lo) / bins, counts = new Array(bins).fill(0);
      means.forEach(function (m) { var b = Math.floor((m - lo) / bw); if (b >= 0 && b < bins) counts[b]++; });
      var dens = counts.map(function (c) { return means.length ? c / (means.length * bw) : 0; });
      var peak = Math.max(Stat.normPdf(0, 0, se), Math.max.apply(null, dens));
      var c = S.chart({ x: [lo, hi], y: [0, peak * 1.15] }).axes({ xlabel: "sample mean x̄", ylabel: "density", yfmt: function (v) { return v.toFixed(2); } });
      dens.forEach(function (d, k) { if (d) c.rect(lo + k * bw, 0, lo + (k + 1) * bw, d, { fill: "rgba(109,75,176,.45)", stroke: "#fff", "stroke-width": 0.5 }); });
      var curve = [];
      for (var j = 0; j <= 200; j++) { var xx = lo + (hi - lo) * j / 200; curve.push([xx, Stat.normPdf(xx, P.mu, se)]); }
      c.path(curve, { stroke: "#2B2118", "stroke-width": 2, "stroke-dasharray": "6 4" });
      plot.innerHTML = c.svg();
      var mm = means.reduce(function (a, b) { return a + b; }, 0) / (means.length || 1);
      var sdm = Math.sqrt(means.reduce(function (a, b) { return a + (b - mm) * (b - mm); }, 0) / Math.max(1, means.length - 1));
      var skew = means.length > 2 ? means.reduce(function (a, b) { return a + Math.pow((b - mm) / (sdm || 1), 3); }, 0) / means.length : NaN;
      stats.innerHTML = "";
      [["Samples drawn", String(means.length)], ["Population μ / σ", fmt(P.mu, 3) + " / " + fmt(P.sd, 3)],
        ["Mean of the x̄s", means.length ? fmt(mm, 3) : "—"], ["SD of the x̄s", means.length > 1 ? fmt(sdm, 3) : "—"],
        ["Theory σ/√n", fmt(se, 3)], ["Skewness of the x̄s", means.length > 2 ? fmt(skew, 2) : "—"]].forEach(function (r) {
        stats.appendChild(h("span", null, r[0])); stats.appendChild(h("b", null, r[1]));
      });
    }
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "panel card pad" }, popSel.el, nS.el,
        h("div", { class: "row" }, [1, 100, 1000].map(function (k) {
          return h("button", { type: "button", class: "btn" + (k === 1000 ? " solid" : ""), onclick: function () { sample(k); } }, "Draw " + k);
        }), h("button", { type: "button", class: "btn", onclick: function () { means = []; draw(); } }, "Reset")),
        stats,
        h("p", { class: "dim small", style: "margin:0" }, "Dashed curve: N(μ, σ²/n), what the CLT predicts. Try the skewed population with n = 2, then n = 30.")),
      h("div", { class: "panel" }, h("p", { class: "sec" }, "Population"), popPlot, h("p", { class: "sec" }, "Distribution of sample means"), plot)));
    draw();
  }

  // 3. Confidence-interval playground
  function ciTool(el) {
    var MU = 50, SIGMA = 10, ivs = [], hits = 0, total = 0;
    var plot = h("div"), stats = h("div", { class: "kv" });
    var reset = function () { ivs = []; hits = 0; total = 0; draw(); };
    var nS = S.slider("Sample size n", { min: 2, max: 100, value: 10 }, reset);
    var cS = S.slider("Confidence level", { min: 50, max: 99, value: 95, fmt: function (v) { return v + "%"; } }, reset);
    var method = "t";
    var mSel = S.select("Method", [["t", "t interval (σ unknown, use s)"], ["z", "z interval (σ = 10 known)"]], method, function (v) { method = v; reset(); });
    function draw1() {
      var n = nS.value, xs = [], s = 0;
      for (var i = 0; i < n; i++) { var x = MU + SIGMA * randn(); xs.push(x); s += x; }
      var m = s / n, sd = Math.sqrt(xs.reduce(function (a, x) { return a + (x - m) * (x - m); }, 0) / (n - 1));
      var p = 1 - (1 - cS.value / 100) / 2;
      var crit = method === "z" ? Stat.zCrit(p) : Stat.tCrit(p, n - 1);
      var moe = crit * (method === "z" ? SIGMA : sd) / Math.sqrt(n);
      var iv = { lo: m - moe, hi: m + moe, m: m };
      iv.hit = iv.lo <= MU && MU <= iv.hi;
      total++; if (iv.hit) hits++;
      ivs.push(iv); if (ivs.length > 60) ivs.shift();
    }
    function run(k) { for (var i = 0; i < k; i++) draw1(); draw(); }
    function draw() {
      var span = 4.2 * SIGMA / Math.sqrt(Math.max(2, nS.value)) * (method === "t" && nS.value < 6 ? 2.5 : 1);
      var c = S.chart({ h: 420, x: [MU - span, MU + span], y: [0, 61], m: { l: 20 } }).axes({ xlabel: "μ", yaxis: false, grid: false });
      c.line(MU, 0, MU, 61, { stroke: "#2B2118", "stroke-width": 1.5 });
      ivs.forEach(function (iv, k) {
        var y = 60 - (ivs.length - 1 - k);
        var col = iv.hit ? "#6D4BB0" : "#C0392B";
        c.line(iv.lo, y, iv.hi, y, { stroke: col, "stroke-width": iv.hit ? 2 : 3 });
        c.dot(iv.m, y, 2.4, { fill: col });
      });
      plot.innerHTML = c.svg();
      stats.innerHTML = "";
      [["Intervals drawn", String(total)], ["Contain μ = 50", total ? hits + " (" + fmt(100 * hits / total, 1) + "%)" : "—"],
        ["Target", cS.value + "%"], ["Critical value", fmt(method === "z" ? Stat.zCrit(1 - (1 - cS.value / 100) / 2) : Stat.tCrit(1 - (1 - cS.value / 100) / 2, nS.value - 1), 3)]]
        .forEach(function (r) { stats.appendChild(h("span", null, r[0])); stats.appendChild(h("b", null, r[1])); });
    }
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "panel card pad" }, h("p", { class: "dim small", style: "margin:0" }, "Population: N(μ = 50, σ = 10). Each line is one sample’s interval. Red ones miss μ."),
        mSel.el, nS.el, cS.el,
        h("div", { class: "row" }, [1, 20, 100].map(function (k) {
          return h("button", { type: "button", class: "btn" + (k === 100 ? " solid" : ""), onclick: function () { run(k); } }, "Draw " + k);
        }), h("button", { type: "button", class: "btn", onclick: reset }, "Reset")),
        stats,
        h("p", { class: "dim small", style: "margin:0" }, "“95% confident” describes the method: over many samples, about 95% of the intervals catch μ. Try a z interval with n = 3 against a t interval.")),
      plot));
    draw();
  }

  // 4. Hypothesis-test solver
  var TESTS = {
    z1: { name: "z test: one mean (σ known)", fields: [["xbar", "x̄", 52.1], ["sigma", "σ", 8], ["n", "n", 40], ["mu0", "μ₀", 50]] },
    t1: { name: "t test: one mean (σ unknown)", fields: [["xbar", "x̄", 52.1], ["s", "s", 8], ["n", "n", 20], ["mu0", "μ₀", 50]] },
    p1: { name: "z test: one proportion", fields: [["x", "successes x", 58], ["n", "n", 100], ["p0", "p₀", 0.5]] },
    t2: { name: "t test: two means (Welch)", fields: [["x1", "x̄₁", 74.2], ["s1", "s₁", 9.1], ["n1", "n₁", 30], ["x2", "x̄₂", 69.8], ["s2", "s₂", 10.4], ["n2", "n₂", 28]] },
  };

  /** Runs a test. Returns { stat, df (null for z), p, crit, steps, decision }. */
  function runTest(type, v, alt, alpha) {
    var stat, se, df = null, steps = [], ns = function (x) { return fmt(x, 4); };
    var sym = alt === "ne" ? "≠" : alt === "gt" ? "&gt;" : "&lt;";
    if (type === "z1" || type === "t1") {
      var sd = type === "z1" ? v.sigma : v.s;
      se = sd / Math.sqrt(v.n);
      stat = (v.xbar - v.mu0) / se;
      if (type === "t1") df = v.n - 1;
      steps.push("H₀: μ = " + v.mu0 + " · Hₐ: μ " + sym + " " + v.mu0);
      steps.push("SE = " + (type === "z1" ? "σ" : "s") + "/√n = " + sd + "/√" + v.n + " = " + ns(se));
      steps.push((df ? "t" : "z") + " = (x̄ − μ₀)/SE = (" + v.xbar + " − " + v.mu0 + ")/" + ns(se) + " = <b>" + ns(stat) + "</b>" + (df ? ", df = n − 1 = " + df : ""));
    } else if (type === "p1") {
      var ph = v.x / v.n;
      se = Math.sqrt(v.p0 * (1 - v.p0) / v.n);
      stat = (ph - v.p0) / se;
      steps.push("H₀: p = " + v.p0 + " · Hₐ: p " + sym + " " + v.p0);
      steps.push("p̂ = x/n = " + v.x + "/" + v.n + " = " + ns(ph));
      steps.push("SE = √(p₀(1 − p₀)/n) = " + ns(se) + " (uses p₀, since we assume H₀)");
      steps.push("z = (p̂ − p₀)/SE = <b>" + ns(stat) + "</b>");
      if (v.n * v.p0 < 10 || v.n * (1 - v.p0) < 10) steps.push("⚠ np₀ or n(1 − p₀) is below 10, so the normal approximation is shaky.");
    } else {
      se = Math.sqrt(v.s1 * v.s1 / v.n1 + v.s2 * v.s2 / v.n2);
      stat = (v.x1 - v.x2) / se;
      df = Stat.welchDf(v.s1, v.n1, v.s2, v.n2);
      steps.push("H₀: μ₁ = μ₂ · Hₐ: μ₁ " + sym + " μ₂");
      steps.push("SE = √(s₁²/n₁ + s₂²/n₂) = " + ns(se));
      steps.push("t = (x̄₁ − x̄₂)/SE = <b>" + ns(stat) + "</b>, Welch df ≈ " + fmt(df, 1));
    }
    var F = df ? function (x) { return Stat.tCdf(x, df); } : function (x) { return Stat.normCdf(x); };
    var Q = df ? function (p) { return Stat.tCrit(p, df); } : function (p) { return Stat.zCrit(p); };
    var p = alt === "ne" ? 2 * (1 - F(Math.abs(stat))) : alt === "gt" ? 1 - F(stat) : F(stat);
    var crit = alt === "ne" ? Q(1 - alpha / 2) : alt === "gt" ? Q(1 - alpha) : Q(alpha);
    var reject = p <= alpha;
    steps.push("p-value = " + (alt === "ne" ? "2·P(" + (df ? "T" : "Z") + " ≥ |" + ns(stat) + "|)" : alt === "gt" ? "P(" + (df ? "T" : "Z") + " ≥ " + ns(stat) + ")" : "P(" + (df ? "T" : "Z") + " ≤ " + ns(stat) + ")") + " = <b>" + ns(p) + "</b>");
    steps.push("Critical value at α = " + alpha + ": " + (alt === "ne" ? "±" : "") + ns(Math.abs(crit) * (alt === "lt" ? -1 : 1)));
    steps.push((reject ? "p ≤ α → <b>reject H₀</b>." : "p &gt; α → <b>fail to reject H₀</b>.") +
      (reject ? " The data are evidence for Hₐ at the " + alpha + " level." : " Not enough evidence for Hₐ, which is not the same as proving H₀."));
    return { stat: stat, df: df, p: p, crit: crit, reject: reject, steps: steps };
  }

  function testTool(el) {
    var st = S.load("test", { type: "t1", alt: "ne", alpha: 0.05, v: {} });
    var fields = h("div", { class: "fgrid", style: "grid-template-columns:1fr 1fr" }), inputs = {};
    var stepsEl = h("ol", { class: "steps" }), plot = h("div"), verdict = h("div", { class: "row" });
    var typeSel = S.select("Test", Object.keys(TESTS).map(function (k) { return [k, TESTS[k].name]; }), st.type, function (v) { st.type = v; build(); run(); });
    var altSel = S.select("Alternative", [["ne", "two-sided (≠)"], ["gt", "right-tailed (>)"], ["lt", "left-tailed (<)"]], st.alt, function (v) { st.alt = v; run(); });
    var aSel = S.select("α", [["0.1", "0.10"], ["0.05", "0.05"], ["0.01", "0.01"]], String(st.alpha), function (v) { st.alpha = +v; run(); });
    function build() {
      fields.innerHTML = ""; inputs = {};
      var saved = st.v[st.type] || {};
      TESTS[st.type].fields.forEach(function (f) {
        inputs[f[0]] = h("input", { type: "number", step: "any", value: saved[f[0]] != null ? saved[f[0]] : f[2], oninput: run });
        fields.appendChild(h("label", { class: "f" }, f[1], inputs[f[0]]));
      });
    }
    function run() {
      var v = {}, ok = true;
      for (var k in inputs) { v[k] = +inputs[k].value; if (!isFinite(v[k]) || inputs[k].value === "") ok = false; }
      st.v[st.type] = v; S.save("test", st);
      var bad = !ok || (v.n != null && v.n < 2) || (v.n1 != null && (v.n1 < 2 || v.n2 < 2)) || v.sigma <= 0 || v.s <= 0 || v.s1 <= 0 || v.s2 <= 0 ||
        (st.type === "p1" && (v.p0 <= 0 || v.p0 >= 1 || v.x < 0 || v.x > v.n));
      stepsEl.innerHTML = ""; verdict.innerHTML = "";
      if (bad) { stepsEl.appendChild(h("li", null, "Fill in every field with valid values (n ≥ 2, SDs > 0, 0 < p₀ < 1).")); plot.innerHTML = ""; return; }
      var r = runTest(st.type, v, st.alt, st.alpha);
      r.steps.forEach(function (s) { stepsEl.appendChild(h("li", { html: s })); });
      verdict.appendChild(h("span", { class: "pill " + (r.reject ? "good" : "ok") }, r.reject ? "Reject H₀" : "Fail to reject H₀"));
      verdict.appendChild(h("span", { class: "dim small" }, (r.df ? "t" : "z") + " = " + fmt(r.stat, 3) + " · p = " + fmt(r.p, 4)));
      var pdf = r.df ? function (x) { return Stat.tPdf(x, r.df); } : function (x) { return Stat.normPdf(x); };
      var R = Math.min(12, Math.max(4.2, Math.abs(r.stat) + 0.8));
      var c = S.chart({ h: 330, x: [-R, R], y: [0, pdf(0) * 1.18] }).axes({ xlabel: r.df ? "t" : "z", yaxis: false });
      var shade = function (lo, hi, fill) {
        var pts = [[lo, 0]];
        for (var j = 0; j <= 100; j++) { var x = lo + (hi - lo) * j / 100; pts.push([x, pdf(x)]); }
        pts.push([hi, 0]); c.area(pts, { fill: fill });
      };
      var rej = "rgba(192,57,43,.18)", pv = SHADE, a = Math.abs(r.crit), t = r.stat;
      if (st.alt === "ne") { shade(-R, -a, rej); shade(a, R, rej); shade(-R, -Math.abs(t), pv); shade(Math.abs(t), R, pv); }
      else if (st.alt === "gt") { shade(r.crit, R, rej); shade(Math.min(t, R), R, pv); }
      else { shade(-R, r.crit, rej); shade(-R, Math.max(t, -R), pv); }
      var curve = [];
      for (var i = 0; i <= 240; i++) { var x = -R + 2 * R * i / 240; curve.push([x, pdf(x)]); }
      c.path(curve, { stroke: CURVE, "stroke-width": 2.5 });
      c.line(t, 0, t, pdf(0) * 1.05, { stroke: "#2B2118", "stroke-width": 2 });
      c.text(t, pdf(0) * 1.09, "statistic " + fmt(t, 2), { "text-anchor": "middle", "font-weight": 700 });
      plot.innerHTML = c.svg();
    }
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "panel card pad" }, typeSel.el, fields, h("div", { class: "fgrid", style: "grid-template-columns:1fr 1fr" }, altSel.el, aSel.el)),
      h("div", { class: "panel" }, verdict, plot,
        h("p", { class: "dim small", style: "margin:0" }, "Light red: rejection region at α. Purple: the p-value area."),
        h("div", { class: "card pad" }, stepsEl))));
    build(); run();
  }

  S.course({
    id: "econ378", code: "ECON 378", title: "Statistics for Economists", color: "#6D4BB0",
    blurb: "Descriptive statistics → probability → sampling → inference → regression.",
    groups: groups, cards: cards, practice: practice,
    tools: [
      { id: "dist", name: "Distribution visualizer", blurb: "Normal, t, χ², F, binomial, Poisson: shade any probability, find critical values.", mount: distTool },
      { id: "clt", name: "CLT simulator", blurb: "Draw thousands of samples from a skewed population and watch x̄ turn normal.", mount: cltTool },
      { id: "ci", name: "Confidence-interval playground", blurb: "See what “95% confident” means: how many intervals catch μ.", mount: ciTool },
      { id: "test", name: "Hypothesis-test solver", blurb: "Step-by-step z and t tests with the p-value shaded on the curve.", mount: testTool },
    ],
    math: { Stat: Stat, runTest: runTest },
  });
})();
