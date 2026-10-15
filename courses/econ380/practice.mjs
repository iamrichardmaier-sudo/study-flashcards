// ECON 380 practice questions, in the ECON 381 drill schema (see tools/practice/questions.js).
export default {
  "heading": "Practice questions",
  "title": "ECON 380 practice",
  "sections": [
    {
      "id": "cons",
      "title": "Consumer theory",
      "sub": "4 questions"
    },
    {
      "id": "prod",
      "title": "Production & cost",
      "sub": "2 questions"
    },
    {
      "id": "mkt",
      "title": "Markets & welfare",
      "sub": "2 questions"
    },
    {
      "id": "power",
      "title": "Monopoly",
      "sub": "2 questions"
    },
    {
      "id": "game",
      "title": "Game theory",
      "sub": "2 questions"
    }
  ],
  "questions": [
    {
      "id": "m1",
      "section": "cons",
      "label": "Q1",
      "week": 1,
      "kind": "one",
      "prompt": "U = x<sup>0.5</sup>y<sup>0.5</sup>, I = 100, p<sub>x</sub> = 2, p<sub>y</sub> = 5. Optimal x?",
      "options": [
        {
          "t": "x = 25",
          "right": true,
          "why": "x* = aI/p<sub>x</sub> = 0.5·100/2."
        },
        {
          "t": "x = 50",
          "why": "That’s I/p<sub>x</sub>, spending everything on x. Cobb–Douglas spends the share a = 0.5."
        },
        {
          "t": "x = 10",
          "why": "Used p<sub>y</sub> in place of p<sub>x</sub>: 0.5·100/5."
        },
        {
          "t": "x = 20",
          "why": "I/p<sub>y</sub> is the most y you can buy, not the optimal x."
        }
      ]
    },
    {
      "id": "m2",
      "section": "cons",
      "label": "Q2",
      "week": 1,
      "kind": "one",
      "prompt": "The price of a <i>normal</i> good rises. The substitution and income effects on its quantity…",
      "options": [
        {
          "t": "Both reduce quantity",
          "right": true,
          "why": "Substitution effect is always ≤ 0 for an own-price rise; real income falls and a normal good is bought less."
        },
        {
          "t": "Substitution reduces it; income raises it",
          "why": "That’s the pattern for an <i>inferior</i> good."
        },
        {
          "t": "Both raise it",
          "why": "Only possible in odd cases. The substitution effect never raises quantity when own price rises."
        },
        {
          "t": "Substitution raises it; income reduces it",
          "why": "The substitution effect always moves away from the good that got relatively dearer."
        }
      ]
    },
    {
      "id": "m3",
      "section": "cons",
      "label": "Q3",
      "week": 1,
      "kind": "one",
      "prompt": "A Giffen good must be…",
      "options": [
        {
          "t": "Inferior, with an income effect larger than the substitution effect",
          "right": true,
          "why": "Only then can a price rise raise quantity demanded."
        },
        {
          "t": "Normal, with a large income effect",
          "why": "For a normal good both effects cut quantity when price rises."
        },
        {
          "t": "A luxury good",
          "why": "Luxuries are normal goods (income elasticity &gt; 1)."
        },
        {
          "t": "Any good with inelastic demand",
          "why": "Inelastic demand still slopes down."
        }
      ]
    },
    {
      "id": "m4",
      "section": "mkt",
      "label": "Q4",
      "week": 3,
      "kind": "one",
      "prompt": "Demand P = 100 − 2Q, supply P = 10 + Q. A $6 per-unit tax is imposed. Deadweight loss?",
      "options": [
        {
          "t": "6",
          "right": true,
          "why": "Q falls from 30 to 28. DWL = ½·6·(30 − 28) = 6."
        },
        {
          "t": "12",
          "why": "Forgot the ½: the DWL is a triangle."
        },
        {
          "t": "168",
          "why": "That’s tax revenue, 6 × 28, which goes to the government rather than being lost."
        },
        {
          "t": "0",
          "why": "A tax drives a wedge between the buyer and seller prices, so some trades don’t happen."
        }
      ]
    },
    {
      "id": "m5",
      "section": "mkt",
      "label": "Q5",
      "week": 3,
      "kind": "one",
      "prompt": "Same market (P = 100 − 2Q, P = 10 + Q, $6 tax). What price do buyers now pay?",
      "options": [
        {
          "t": "$44",
          "right": true,
          "why": "Q = 28, P<sub>b</sub> = 100 − 56 = 44. Buyers bear $4 of the $6 because demand is steeper."
        },
        {
          "t": "$46",
          "why": "That assumes buyers bear the whole tax (40 + 6). Sellers bear some too."
        },
        {
          "t": "$38",
          "why": "That’s the price sellers keep: 44 − 6."
        },
        {
          "t": "$40",
          "why": "That’s the pre-tax equilibrium price."
        }
      ]
    },
    {
      "id": "m6",
      "section": "power",
      "label": "Q6",
      "week": 4,
      "kind": "one",
      "prompt": "Monopoly: demand P = 100 − 2Q, MC = 20. Profit-maximizing Q and P?",
      "options": [
        {
          "t": "Q = 20, P = 60",
          "right": true,
          "why": "MR = 100 − 4Q = 20 ⇒ Q = 20; read P off demand: 100 − 40 = 60."
        },
        {
          "t": "Q = 40, P = 20",
          "why": "That’s the competitive outcome, P = MC."
        },
        {
          "t": "Q = 20, P = 20",
          "why": "Price comes from the demand curve, not MC."
        },
        {
          "t": "Q = 25, P = 50",
          "why": "That maximizes revenue (MR = 0) and ignores cost."
        }
      ]
    },
    {
      "id": "m7",
      "section": "power",
      "label": "Q7",
      "week": 4,
      "kind": "one",
      "prompt": "A monopolist faces |ε| = 4 at its optimum and MC = 30. Price?",
      "options": [
        {
          "t": "40",
          "right": true,
          "why": "(P − MC)/P = 1/4 ⇒ P = MC/(1 − 1/4) = 30·4/3."
        },
        {
          "t": "37.5",
          "why": "Marked up MC by 1/4 (30·1.25). The Lerner index is a share of <i>price</i>."
        },
        {
          "t": "120",
          "why": "Multiplied MC by |ε|."
        },
        {
          "t": "30",
          "why": "That’s competitive pricing. A monopolist marks up when demand isn’t perfectly elastic."
        }
      ]
    },
    {
      "id": "m8",
      "section": "prod",
      "label": "Q8",
      "week": 2,
      "kind": "one",
      "prompt": "F(K, L) = K<sup>0.3</sup>L<sup>0.8</sup> has…",
      "options": [
        {
          "t": "Increasing returns to scale",
          "right": true,
          "why": "0.3 + 0.8 = 1.1 &gt; 1."
        },
        {
          "t": "Constant returns to scale",
          "why": "CRS needs the exponents to sum to exactly 1."
        },
        {
          "t": "Decreasing returns to scale",
          "why": "Decreasing needs a sum below 1."
        },
        {
          "t": "Diminishing returns to scale, because each exponent is below 1",
          "why": "Exponents below 1 mean diminishing <i>marginal products</i>, which is a different idea from returns to scale."
        }
      ]
    },
    {
      "id": "m9",
      "section": "prod",
      "label": "Q9",
      "week": 2,
      "kind": "one",
      "prompt": "A competitive firm’s price is below minimum AVC but above zero. In the short run it should…",
      "options": [
        {
          "t": "Shut down and lose only its fixed cost",
          "right": true,
          "why": "Producing would lose fixed cost plus part of variable cost."
        },
        {
          "t": "Produce where P = MC",
          "why": "Only if P ≥ min AVC. Otherwise each unit adds more cost than revenue."
        },
        {
          "t": "Produce where AC is lowest",
          "why": "Firms choose output by P = MC, not by minimizing AC."
        },
        {
          "t": "Raise its price",
          "why": "A competitive firm is a price taker."
        }
      ]
    },
    {
      "id": "m10",
      "section": "game",
      "label": "Q10",
      "week": 5,
      "kind": "one",
      "prompt": "In a one-shot prisoner’s dilemma, the Nash equilibrium is…",
      "options": [
        {
          "t": "Both defect, even though both cooperating would make each better off",
          "right": true,
          "why": "Defect is dominant for each; the equilibrium is Pareto-dominated."
        },
        {
          "t": "Both cooperate",
          "why": "Each player gains by deviating to defect, so it isn’t an equilibrium."
        },
        {
          "t": "One cooperates, one defects",
          "why": "The cooperator would rather defect."
        },
        {
          "t": "There is no Nash equilibrium",
          "why": "(Defect, Defect) is the unique (and dominant-strategy) equilibrium."
        }
      ]
    },
    {
      "id": "m11",
      "section": "game",
      "label": "Q11",
      "week": 5,
      "kind": "one",
      "prompt": "Cournot duopoly: P = 120 − Q, both firms MC = 0. Each firm produces…",
      "options": [
        {
          "t": "40",
          "right": true,
          "why": "q = (a − c)/(3b) = 120/3. Q = 80, P = 40."
        },
        {
          "t": "60",
          "why": "60 each gives Q = 120 and P = 0, the competitive (Bertrand) outcome."
        },
        {
          "t": "30",
          "why": "Splitting the monopoly output (60) evenly is the collusive outcome, not Cournot."
        },
        {
          "t": "20",
          "why": "Too low: the best response to 20 is q = (120 − 20)/2 = 50."
        }
      ]
    },
    {
      "id": "m12",
      "section": "cons",
      "label": "Q12",
      "week": 1,
      "kind": "one",
      "prompt": "For U = x<sup>a</sup>y<sup>1−a</sup>, the MRS (MU<sub>x</sub>/MU<sub>y</sub>) is…",
      "options": [
        {
          "t": "(a/(1 − a))·(y/x)",
          "right": true,
          "why": "MU<sub>x</sub> = aU/x, MU<sub>y</sub> = (1 − a)U/y."
        },
        {
          "t": "(a/(1 − a))·(x/y)",
          "why": "Upside-down ratio of goods. MU<sub>x</sub> falls as x rises, so x goes in the denominator."
        },
        {
          "t": "a/(1 − a)",
          "why": "Missing the y/x term, so the MRS wouldn’t diminish along the curve."
        },
        {
          "t": "p<sub>x</sub>/p<sub>y</sub>",
          "why": "That’s what MRS <i>equals at the optimum</i>, not its definition."
        }
      ]
    }
  ]
};
