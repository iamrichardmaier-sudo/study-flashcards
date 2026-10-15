// ECON 378 practice questions, in the ECON 381 drill schema (see tools/practice/questions.js).
export default {
  "heading": "Practice questions",
  "title": "ECON 378 practice",
  "sections": [
    {
      "id": "prob",
      "title": "Probability",
      "sub": "2 questions"
    },
    {
      "id": "dist",
      "title": "Distributions",
      "sub": "2 questions"
    },
    {
      "id": "samp",
      "title": "Sampling & CLT",
      "sub": "2 questions"
    },
    {
      "id": "inf",
      "title": "Inference",
      "sub": "5 questions"
    },
    {
      "id": "reg",
      "title": "Regression",
      "sub": "1 questions"
    }
  ],
  "questions": [
    {
      "id": "q1",
      "section": "dist",
      "label": "Q1",
      "week": 3,
      "kind": "one",
      "prompt": "X ~ N(100, 15²). What is P(X &gt; 130)?",
      "options": [
        {
          "t": "≈ 0.0228",
          "right": true,
          "why": "z = (130 − 100)/15 = 2, and P(Z &gt; 2) = 1 − 0.9772."
        },
        {
          "t": "≈ 0.9772",
          "why": "That’s P(X &lt; 130). The question asks for the upper tail."
        },
        {
          "t": "≈ 0.0455",
          "why": "That’s both tails, P(|Z| &gt; 2). Only the upper tail is asked."
        },
        {
          "t": "≈ 0.1587",
          "why": "That’s P(Z &gt; 1), as if z were 30/30. The z-score divides by σ = 15."
        }
      ]
    },
    {
      "id": "q2",
      "section": "inf",
      "label": "Q2",
      "week": 5,
      "kind": "one",
      "prompt": "n = 36, σ = 12 (known), x̄ = 50. The 95% confidence interval for μ is…",
      "options": [
        {
          "t": "50 ± 3.92",
          "right": true,
          "why": "SE = 12/√36 = 2, so 1.96 × 2 = 3.92."
        },
        {
          "t": "50 ± 23.52",
          "why": "Used σ instead of the standard error σ/√n."
        },
        {
          "t": "50 ± 3.29",
          "why": "1.645 × 2 = 3.29 is the 90% margin."
        },
        {
          "t": "50 ± 0.65",
          "why": "Divided σ by n (12/36) instead of √n."
        }
      ]
    },
    {
      "id": "q3",
      "section": "inf",
      "label": "Q3",
      "week": 5,
      "kind": "one",
      "prompt": "A test gives p = 0.03. Which statement is correct?",
      "options": [
        {
          "t": "If H₀ were true, results at least this extreme would occur about 3% of the time",
          "right": true,
          "why": "That’s the definition: a probability computed assuming H₀."
        },
        {
          "t": "There is a 3% chance H₀ is true",
          "why": "The p-value assumes H₀. It is not the probability that H₀ is true."
        },
        {
          "t": "There is a 97% chance Hₐ is true",
          "why": "Same error in reverse. Frequentist tests don’t give probabilities of hypotheses."
        },
        {
          "t": "The effect is large and important",
          "why": "A small p can come from a tiny effect with a big n. Significance isn’t importance."
        }
      ]
    },
    {
      "id": "q4",
      "section": "inf",
      "label": "Q4",
      "week": 5,
      "kind": "one",
      "prompt": "A Type I error is…",
      "options": [
        {
          "t": "Rejecting H₀ when it is actually true",
          "right": true,
          "why": "Its probability is the significance level α."
        },
        {
          "t": "Failing to reject H₀ when it is false",
          "why": "That’s a Type II error (probability β)."
        },
        {
          "t": "Using the wrong test statistic",
          "why": "That’s just a mistake. Type I/II refer to wrong decisions about H₀."
        },
        {
          "t": "Rejecting Hₐ when it is true",
          "why": "We never “reject Hₐ”. We reject or fail to reject H₀."
        }
      ]
    },
    {
      "id": "q5",
      "section": "samp",
      "label": "Q5",
      "week": 4,
      "kind": "one",
      "prompt": "Incomes are strongly right-skewed. For samples of n = 200, the sampling distribution of x̄ is…",
      "options": [
        {
          "t": "Approximately normal, centered at μ with SD σ/√200",
          "right": true,
          "why": "The CLT: x̄ is approximately normal for large n whatever the population’s shape."
        },
        {
          "t": "Right-skewed like the population",
          "why": "Individual incomes are skewed, but averages of 200 are close to normal (the CLT)."
        },
        {
          "t": "Exactly normal",
          "why": "Only approximately. Exactly normal requires a normal population."
        },
        {
          "t": "Centered at the median",
          "why": "x̄ is unbiased for the <i>mean</i> μ, not the median."
        }
      ]
    },
    {
      "id": "q6",
      "section": "samp",
      "label": "Q6",
      "week": 4,
      "kind": "one",
      "prompt": "To cut the standard error of x̄ in half, the sample size must be…",
      "options": [
        {
          "t": "Multiplied by 4",
          "right": true,
          "why": "SE = σ/√n; √(4n) = 2√n."
        },
        {
          "t": "Doubled",
          "why": "Doubling n divides SE by √2 ≈ 1.41, not 2."
        },
        {
          "t": "Halved",
          "why": "A smaller n makes the SE larger."
        },
        {
          "t": "Multiplied by 2²·σ",
          "why": "σ doesn’t enter how n scales: n × 4 regardless of σ."
        }
      ]
    },
    {
      "id": "q7",
      "section": "prob",
      "label": "Q7",
      "week": 2,
      "kind": "one",
      "prompt": "1% of people have a condition. A test catches 90% of cases and gives a false positive to 5% of healthy people. Given a positive test, the chance the person has the condition is about…",
      "options": [
        {
          "t": "15%",
          "right": true,
          "why": "0.9·0.01 / (0.9·0.01 + 0.05·0.99) = 0.009/0.0585 ≈ 0.154."
        },
        {
          "t": "90%",
          "why": "That’s P(+ | condition), the sensitivity, not P(condition | +)."
        },
        {
          "t": "95%",
          "why": "That’s P(− | healthy). It ignores the low base rate."
        },
        {
          "t": "1%",
          "why": "That’s the prior. A positive test should raise it."
        }
      ]
    },
    {
      "id": "q8",
      "section": "dist",
      "label": "Q8",
      "week": 3,
      "kind": "one",
      "prompt": "X ~ Binomial(5, 0.5). P(X = 2) = ?",
      "options": [
        {
          "t": "0.3125",
          "right": true,
          "why": "C(5,2)·0.5⁵ = 10/32."
        },
        {
          "t": "0.03125",
          "why": "Forgot the C(5,2) = 10 ways to place the successes."
        },
        {
          "t": "0.4",
          "why": "2/5 is a proportion, not a binomial probability."
        },
        {
          "t": "0.5",
          "why": "That’s p for a single trial."
        }
      ]
    },
    {
      "id": "q9",
      "section": "prob",
      "label": "Q9",
      "week": 2,
      "kind": "one",
      "prompt": "Var(X) = 4. What is Var(2X + 3)?",
      "options": [
        {
          "t": "16",
          "right": true,
          "why": "Var(aX + b) = a²Var(X) = 4·4. The constant shifts but doesn’t spread."
        },
        {
          "t": "11",
          "why": "Var(aX + b) isn’t aVar(X) + b. Constants drop out, and a gets squared."
        },
        {
          "t": "8",
          "why": "a must be squared: 2² × 4 = 16."
        },
        {
          "t": "19",
          "why": "Adding 3 doesn’t change the spread, so drop the + 3."
        }
      ]
    },
    {
      "id": "q10",
      "section": "inf",
      "label": "Q10",
      "week": 5,
      "kind": "one",
      "prompt": "Testing H₀: μ = 10 with n = 16, σ unknown. Which reference distribution?",
      "options": [
        {
          "t": "t with 15 degrees of freedom",
          "right": true,
          "why": "σ is estimated by s, so use t with n − 1 df."
        },
        {
          "t": "Standard normal",
          "why": "z needs a known σ (or a very large n)."
        },
        {
          "t": "t with 16 degrees of freedom",
          "why": "One-sample t uses n − 1 = 15 df."
        },
        {
          "t": "Chi-square with 15 df",
          "why": "Chi-square is for variances/counts, not a mean."
        }
      ]
    },
    {
      "id": "q11",
      "section": "reg",
      "label": "Q11",
      "week": 6,
      "kind": "one",
      "prompt": "Cov(x, y) = 6 and Var(x) = 3. The OLS slope of y on x is…",
      "options": [
        {
          "t": "2",
          "right": true,
          "why": "β̂₁ = Cov(x, y)/Var(x) = 6/3."
        },
        {
          "t": "0.5",
          "why": "That’s Var(x)/Cov(x, y), upside down."
        },
        {
          "t": "18",
          "why": "Multiplied instead of dividing."
        },
        {
          "t": "Can’t tell without Var(y)",
          "why": "Var(y) matters for r and R², not the slope."
        }
      ]
    },
    {
      "id": "q12",
      "section": "inf",
      "label": "Q12",
      "week": 5,
      "kind": "one",
      "prompt": "Which change increases the power of a test (all else equal)?",
      "options": [
        {
          "t": "Larger sample size",
          "right": true,
          "why": "The SE shrinks, so a real effect gives a larger test statistic."
        },
        {
          "t": "Smaller α",
          "why": "A stricter α makes rejection harder, so power falls."
        },
        {
          "t": "Larger population σ",
          "why": "More noise means a bigger SE and lower power."
        },
        {
          "t": "Smaller true effect",
          "why": "Smaller effects are harder to detect."
        }
      ]
    }
  ]
};
