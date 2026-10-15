# ECON 378 (Statistics for Economists) — Interactive Feature Spec

Curriculum baseline (cross-checked syllabi: UPenn ECON 2300, BU EC 507, UCL, HVL BØA115): descriptive stats → probability → random variables/distributions → sampling distributions & CLT → point estimation & confidence intervals → hypothesis testing → simple OLS regression (gateway to ECON 388 Econometrics).

Beyond flashcards/audio/practice tests, the 6 highest-value interactive features:

1. **Distribution Visualizer** — Normal, t, chi-square, F, binomial, Poisson with parameter sliders (μ, σ, df, n, p, λ); shaded areas showing P(X ≤ x), P(a < X < b), and critical values. *Justification: distributions underpin every unit; a visual reference tool replaces table-lookup and builds shape intuition.*

2. **CLT / Sampling Distribution Simulator** — Choose a population (skewed, uniform, bimodal), drag sample-size slider, animate repeated sampling building the distribution of the sample mean. *Justification: sampling distributions are the course's biggest conceptual leap; watching the mean's distribution converge to normal is the fastest way to internalize it.*

3. **Hypothesis Test Step-by-Step Solver** — Enter sample stats (x̄, s, n) or raw data; guided flow: H₀/Hₐ → test statistic → p-value shaded on the t/z curve → decision at α. Covers z, t, one/two-sample, proportions, chi-square. *Justification: mirrors exam problems exactly; teaches the repeatable decision workflow students botch under time pressure.*

4. **Confidence Interval Playground** — Generate dozens of 95% CIs from a known population and visualize which capture the true mean; sliders for confidence level and n. *Justification: makes "95% confident" concrete — the single most-misunderstood idea in inference.*

5. **OLS Regression Visualizer** — Interactive scatterplot (drag points or dial up noise); fitted line, residuals, R², and slope standard error update live; toggle assumption violations (heteroskedasticity, nonlinearity). *Justification: shows least-squares mechanics visually and bridges directly into ECON 388 Econometrics.*

6. **Probability Calculator** — Binomial/Poisson/normal probabilities with the formula shown and worked steps; Bayes-theorem tree visualizer for conditional probability problems. *Justification: computational workhorse for the early probability unit; Bayes trees fix a notorious stumbling block.*

Implementation notes: all six are client-side (vanilla JS + canvas/SVG), no backend needed; features 2 and 4 can share a random-data engine with 5.
