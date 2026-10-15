// ECON 380 practice questions, in the ECON 381 drill schema (see tools/practice/questions.js).
//
//   pattern  the general method, shown first after answering
//   steps    the worked solution, revealed one step at a time
//   cards    related flashcards (ids in courses/econ380/cards.mjs)
//   graph    optional diagram (tools/graphs/econ380.js)
//
// Every numeric wrong option is what one named slip produces;
// tools/course-econ380.test.mjs re-derives each of them.
export default {
  "heading": "Practice questions",
  "title": "ECON 380 practice",
  "sections": [
    { "id": "cons", "title": "Consumer theory", "sub": "4 questions" },
    { "id": "prod", "title": "Production & cost", "sub": "2 questions" },
    { "id": "mkt", "title": "Markets & welfare", "sub": "2 questions" },
    { "id": "power", "title": "Monopoly", "sub": "2 questions" },
    { "id": "game", "title": "Game theory", "sub": "2 questions" }
  ],
  "questions": [
    {
      "id": "m1", "section": "cons", "label": "Q1", "week": 1, "kind": "one",
      "prompt": "U = x<sup>0.5</sup>y<sup>0.5</sup>, I = 100, p<sub>x</sub> = 2, p<sub>y</sub> = 5. Optimal x?",
      "options": [
        { "t": "x = 25", "right": true, "why": "x* = aI/p<sub>x</sub> = 0.5 × 100/2: half the budget, $50, buys 25 units at $2." },
        { "t": "x = 50", "why": "That’s I/p<sub>x</sub>: you spent the whole budget on x. Cobb–Douglas spends only the share a = 0.5 on x." },
        { "t": "x = 10", "why": "You divided by p<sub>y</sub> instead of p<sub>x</sub>: 0.5 × 100/5. That’s the optimal <i>y</i>, not x." },
        { "t": "x = 20", "why": "That’s I/p<sub>y</sub>, the most y you could buy (the budget line’s y-intercept), not the optimal x." }
      ],
      "pattern": "<b>Cobb–Douglas demand: spend a fixed share on each good.</b> With U = x<sup>a</sup>y<sup>1−a</sup>, x* = aI/p<sub>x</sub> and y* = (1 − a)I/p<sub>y</sub>. If you forget the formula, use tangency (MRS = p<sub>x</sub>/p<sub>y</sub>) plus the budget line.",
      "steps": [
        "Read off a = 0.5 (exponents add to 1, so no normalising needed).",
        "Spending on x = aI = 0.5 × 100 = $50.",
        "x* = 50 / p<sub>x</sub> = 50 / 2 = <b>25</b>. (And y* = 50 / 5 = 10.)",
        "Check by tangency: MRS = y/x = 10/25 = 0.4 = p<sub>x</sub>/p<sub>y</sub> = 2/5 ✓, and 2(25) + 5(10) = 100 ✓."
      ],
      "cards": ["cddemand", "tangency", "mrs"],
      "graph": { "key": "econ380Budget", "args": { "mode": "opt" } }
    },
    {
      "id": "m2", "section": "cons", "label": "Q2", "week": 1, "kind": "one",
      "prompt": "The price of a <i>normal</i> good rises. The substitution and income effects on its quantity…",
      "options": [
        { "t": "Both reduce quantity", "right": true, "why": "The substitution effect of an own-price rise is always ≤ 0; real income falls, and a normal good is bought less when income falls." },
        { "t": "Substitution reduces it; income raises it", "why": "That’s the pattern for an <i>inferior</i> good, where lower real income means buying more. A normal good’s income effect goes the same way as the substitution effect." },
        { "t": "Both raise it", "why": "Two sign slips: the substitution effect never raises quantity when the good’s own price rises, and for a normal good falling real income lowers quantity too." },
        { "t": "Substitution raises it; income reduces it", "why": "The substitution effect got its sign flipped. It always moves you <i>away</i> from the good that became relatively dearer." }
      ],
      "pattern": "<b>Sign the two effects separately.</b> Substitution: always opposite to the price change (price up ⇒ quantity down). Income: a price rise makes you poorer, so normal goods fall and inferior goods rise. Total = substitution + income.",
      "steps": [
        "Substitution effect: x is now relatively dearer, so along the old indifference curve you buy less x. Negative.",
        "Income effect: the price rise cuts real income.",
        "Normal good: lower income ⇒ less x. Negative.",
        "Both reduce quantity, so demand for a normal good always slopes down."
      ],
      "cards": ["slutsky", "goods", "hicks"],
      "graph": "econ380PriceEffects"
    },
    {
      "id": "m3", "section": "cons", "label": "Q3", "week": 1, "kind": "one",
      "prompt": "A Giffen good must be…",
      "options": [
        { "t": "Inferior, with an income effect larger than the substitution effect", "right": true, "why": "Only then can a price rise raise quantity demanded: the (positive) income effect outweighs the (negative) substitution effect." },
        { "t": "Normal, with a large income effect", "why": "For a normal good the income effect of a price rise also cuts quantity, so it reinforces the substitution effect and demand slopes down." },
        { "t": "A luxury good", "why": "Luxuries are normal goods (income elasticity &gt; 1), so they can’t be Giffen. Giffen goods are inferior: think staple foods for the very poor." },
        { "t": "Any good with inelastic demand", "why": "This confuses a small response with a wrong-signed one. Inelastic demand still slopes down (−1 &lt; ε &lt; 0); Giffen demand slopes up." }
      ],
      "pattern": "<b>Giffen = upward-sloping demand.</b> Since the substitution effect always pushes quantity down when price rises, an increase is only possible if the income effect pushes up (inferior good) <i>and</i> is bigger. Every Giffen good is inferior; almost no inferior good is Giffen.",
      "steps": [
        "Write total = substitution (≤ 0) + income.",
        "For total &gt; 0 we need income &gt; 0 when price rises, so the good must be inferior.",
        "And the income effect must be larger in size than the substitution effect.",
        "That needs a big budget share and few substitutes, like rice for very poor households in Hunan (Jensen &amp; Miller, 2008)."
      ],
      "cards": ["goods", "slutsky", "elas"],
      "graph": "econ380Engel"
    },
    {
      "id": "m4", "section": "mkt", "label": "Q4", "week": 3, "kind": "one",
      "prompt": "Demand P = 100 − 2Q, supply P = 10 + Q. A $6 per-unit tax is imposed. Deadweight loss?",
      "options": [
        { "t": "6", "right": true, "why": "Q falls from 30 to 28. DWL = ½ × 6 × (30 − 28) = 6." },
        { "t": "12", "why": "You used base × height, 6 × 2, and forgot the ½: the DWL is a triangle, not a rectangle." },
        { "t": "168", "why": "That’s tax revenue, 6 × 28. Revenue goes to the government; it’s a transfer, not a loss." },
        { "t": "0", "why": "A tax drives a wedge between what buyers pay and sellers get, so trades worth more than they cost (units 29 and 30) stop happening." }
      ],
      "pattern": "<b>Tax DWL = ½ × tax × fall in quantity.</b> Find the old Q (S = D), then the new Q from D = S + t (or P<sub>b</sub> − P<sub>s</sub> = t). The triangle sits between the curves from the new Q to the old Q.",
      "steps": [
        "No tax: 100 − 2Q = 10 + Q, so Q = 30, P = 40.",
        "With the tax: 100 − 2Q = 10 + Q + 6, so 3Q = 84 and Q = 28.",
        "The wedge at Q = 28 is the tax, 6; the triangle’s base is 30 − 28 = 2.",
        "DWL = ½ × 6 × 2 = <b>6</b>. (Check: surplus 1,350 before; 784 + 392 + 168 = 1,344 after.)"
      ],
      "cards": ["dwl", "csps", "incidence"],
      "graph": "econ380Tax"
    },
    {
      "id": "m5", "section": "mkt", "label": "Q5", "week": 3, "kind": "one",
      "prompt": "Same market (P = 100 − 2Q, P = 10 + Q, $6 tax). What price do buyers now pay?",
      "options": [
        { "t": "$44", "right": true, "why": "Q = 28, so P<sub>b</sub> = 100 − 56 = 44. Buyers bear $4 of the $6 because demand is the steeper (less elastic) curve." },
        { "t": "$46", "why": "You added the whole tax to the old price (40 + 6), as if buyers bore all of it. Sellers bear part too, because supply isn’t perfectly elastic." },
        { "t": "$38", "why": "That’s the price sellers keep, 44 − 6, read off the supply curve instead of demand." },
        { "t": "$40", "why": "That’s the pre-tax equilibrium price: you didn’t shift anything." }
      ],
      "pattern": "<b>Buyers’ price comes off the demand curve at the new quantity.</b> Find the after-tax Q, then P<sub>b</sub> = D(Q) and P<sub>s</sub> = P<sub>b</sub> − t. The split of the tax follows the slopes: buyers’ share = demand slope / (demand slope + supply slope).",
      "steps": [
        "After-tax quantity (from Q4): Q = 28.",
        "Buyers’ price from demand: P<sub>b</sub> = 100 − 2(28) = <b>44</b>.",
        "Sellers keep P<sub>s</sub> = 44 − 6 = 38.",
        "Split: buyers +4, sellers −2. Shares 2/(2 + 1) = 2/3 and 1/3, matching the slopes 2 and 1."
      ],
      "cards": ["incidence", "elas", "dwl"],
      "graph": { "key": "econ380Tax", "args": { "mode": "incidence" } }
    },
    {
      "id": "m6", "section": "power", "label": "Q6", "week": 4, "kind": "one",
      "prompt": "Monopoly: demand P = 100 − 2Q, MC = 20. Profit-maximizing Q and P?",
      "options": [
        { "t": "Q = 20, P = 60", "right": true, "why": "MR = 100 − 4Q = 20, so Q = 20; read P off demand: 100 − 40 = 60." },
        { "t": "Q = 40, P = 20", "why": "You set P = MC on the demand curve (100 − 2Q = 20). That’s the competitive outcome, not the monopolist’s." },
        { "t": "Q = 20, P = 20", "why": "Right quantity, but you read the price off MC (where MR = MC) instead of off the demand curve." },
        { "t": "Q = 25, P = 50", "why": "You set MR = 0: that maximises revenue and ignores cost." }
      ],
      "pattern": "<b>Monopoly: MR = MC for Q, then demand for P.</b> With linear demand P = a − bQ, MR = a − 2bQ (same intercept, twice the slope). Never read the price off MR or MC.",
      "steps": [
        "MR = 100 − 4Q.",
        "MR = MC: 100 − 4Q = 20, so Q = 20.",
        "Price from demand: P = 100 − 2(20) = 60. Answer: <b>Q = 20, P = 60</b>.",
        "Profit = (60 − 20) × 20 = 800; DWL against competition (Q = 40) = ½ × 40 × 20 = 400."
      ],
      "cards": ["mrmc", "lerner", "dwl"],
      "graph": "econ380Monopoly"
    },
    {
      "id": "m7", "section": "power", "label": "Q7", "week": 4, "kind": "one",
      "prompt": "A monopolist faces |ε| = 4 at its optimum and MC = 30. Price?",
      "options": [
        { "t": "40", "right": true, "why": "(P − MC)/P = 1/4, so P = MC/(1 − 1/4) = 30 × 4/3 = 40." },
        { "t": "37.5", "why": "You marked MC up by 1/4 of <i>cost</i> (30 × 1.25). The Lerner index is a share of <i>price</i>." },
        { "t": "120", "why": "You multiplied MC by |ε|. The markup factor is |ε|/(|ε| − 1) = 4/3, not 4." },
        { "t": "30", "why": "That’s competitive pricing, P = MC. A monopolist marks up unless demand is perfectly elastic." }
      ],
      "pattern": "<b>Inverse-elasticity rule:</b> (P − MC)/P = 1/|ε|, so P = MC/(1 − 1/|ε|) = MC × |ε|/(|ε| − 1). The markup is a fraction of price, and only works for |ε| &gt; 1.",
      "steps": [
        "Lerner: (P − 30)/P = 1/4.",
        "Rearrange: P − 30 = P/4, so (3/4)P = 30.",
        "P = 30 × 4/3 = <b>40</b>.",
        "Check: (40 − 30)/40 = 0.25 = 1/4 ✓. As a markup on cost that’s 33%, not 25%."
      ],
      "cards": ["lerner", "mrmc", "elas"]
    },
    {
      "id": "m8", "section": "prod", "label": "Q8", "week": 2, "kind": "one",
      "prompt": "F(K, L) = K<sup>0.3</sup>L<sup>0.8</sup> has…",
      "options": [
        { "t": "Increasing returns to scale", "right": true, "why": "0.3 + 0.8 = 1.1 &gt; 1: doubling both inputs multiplies output by 2<sup>1.1</sup> ≈ 2.14." },
        { "t": "Constant returns to scale", "why": "CRS needs the exponents to add to exactly 1; here they add to 1.1." },
        { "t": "Decreasing returns to scale", "why": "You judged each exponent alone (both are below 1). Returns to scale depends on their <i>sum</i>." },
        { "t": "Diminishing returns to scale, because each exponent is below 1", "why": "Exponents below 1 mean diminishing <i>marginal products</i> (one input at a time), a different idea from returns to scale (all inputs together)." }
      ],
      "pattern": "<b>Cobb–Douglas returns to scale: add the exponents.</b> F(tK, tL) = t<sup>α+β</sup>F(K, L): α + β &gt; 1 increasing, = 1 constant, &lt; 1 decreasing. Each exponent below 1 only tells you each marginal product diminishes.",
      "steps": [
        "Scale both inputs by t: (tK)<sup>0.3</sup>(tL)<sup>0.8</sup> = t<sup>1.1</sup>K<sup>0.3</sup>L<sup>0.8</sup>.",
        "Output scales by t<sup>1.1</sup>, more than t.",
        "So <b>increasing returns to scale</b>, even though MP<sub>K</sub> and MP<sub>L</sub> each diminish."
      ],
      "cards": ["rts", "mrts", "costmin"],
      "graph": { "key": "econ380Isoquant", "args": { "mode": "scale" } }
    },
    {
      "id": "m9", "section": "prod", "label": "Q9", "week": 2, "kind": "one",
      "prompt": "A competitive firm’s price is below minimum AVC but above zero. In the short run it should…",
      "options": [
        { "t": "Shut down and lose only its fixed cost", "right": true, "why": "Producing would lose the fixed cost plus the part of variable cost that revenue doesn’t cover." },
        { "t": "Produce where P = MC", "why": "That rule applies only while P ≥ min AVC. Below it, revenue doesn’t even cover variable cost." },
        { "t": "Produce where AC is lowest", "why": "Firms choose output by P = MC, not by minimising AC; and below min AVC producing anything loses more than shutting." },
        { "t": "Raise its price", "why": "A competitive firm is a price taker: at a higher price it would sell nothing." }
      ],
      "pattern": "<b>Short run: compare price with min AVC.</b> P ≥ min AVC: produce where P = MC (even at a loss if P &lt; min ATC). P &lt; min AVC: shut down; the loss is just the fixed cost, which is sunk either way.",
      "steps": [
        "Fixed cost is paid whether or not the firm produces, so ignore it for the decision.",
        "If P &lt; AVC at every output, each unit sold adds more cost than revenue.",
        "Example (running firm, FC = 32, min AVC = 11): at P = 8, producing q = 2 loses 40; shutting loses 32.",
        "So <b>shut down</b>."
      ],
      "cards": ["shutdown", "mcac", "lrcomp"],
      "graph": { "key": "econ380Costs", "args": { "mode": "shutdown" } }
    },
    {
      "id": "m10", "section": "game", "label": "Q10", "week": 5, "kind": "one",
      "prompt": "In a one-shot prisoner’s dilemma, the Nash equilibrium is…",
      "options": [
        { "t": "Both defect, even though both cooperating would make each better off", "right": true, "why": "Defect is dominant for each player; the equilibrium is Pareto-dominated by mutual cooperation." },
        { "t": "Both cooperate", "why": "That’s the best <i>joint</i> outcome, but each player gains by deviating to defect, so it isn’t an equilibrium." },
        { "t": "One cooperates, one defects", "why": "The cooperator isn’t best-responding: switching to defect raises their payoff." },
        { "t": "There is no Nash equilibrium", "why": "(Defect, Defect) is a Nash equilibrium, and the unique one, because defect is dominant for both." }
      ],
      "pattern": "<b>Find best responses cell by cell.</b> In a prisoner’s dilemma defect is a dominant strategy for both, so (defect, defect) is the unique equilibrium, and it is worse for both than (cooperate, cooperate).",
      "steps": [
        "Take the pricing game: (High, High) = (10, 10), (Low, High) = (12, 2), (High, Low) = (2, 12), (Low, Low) = (5, 5).",
        "Against High, Low pays 12 &gt; 10; against Low, Low pays 5 &gt; 2. Low (defect) is dominant.",
        "Same for the other player, so the equilibrium is <b>(Low, Low)</b>.",
        "Both would prefer (High, High): 10 &gt; 5 each. Individually rational, collectively worse."
      ],
      "cards": ["pd", "dominant", "nash"],
      "graph": { "key": "econ380Matrix", "args": { "game": "pd", "show": "coop" } }
    },
    {
      "id": "m11", "section": "game", "label": "Q11", "week": 5, "kind": "one",
      "prompt": "Cournot duopoly: P = 120 − Q, both firms MC = 0. Each firm produces…",
      "options": [
        { "t": "40", "right": true, "why": "q = (a − c)/(3b) = 120/3 = 40. Q = 80, P = 40." },
        { "t": "60", "why": "You split the competitive output (Q = 120, where P = MC = 0) between the two firms. That’s the Bertrand outcome, not Cournot." },
        { "t": "30", "why": "You split the monopoly output (60) evenly: that’s the collusive outcome, and each firm would want to expand from it." },
        { "t": "20", "why": "You took (a − c)/(3b) = 40 as total output and halved it. 40 is already <i>each</i> firm’s quantity." }
      ],
      "pattern": "<b>Cournot: best responses, then solve together.</b> Each firm maximises profit on its residual demand: q<sub>1</sub> = (a − c − bq<sub>2</sub>)/(2b). With symmetric firms set q<sub>1</sub> = q<sub>2</sub>: q* = (a − c)/(3b) each.",
      "steps": [
        "Firm 1’s profit: (120 − q<sub>1</sub> − q<sub>2</sub>)q<sub>1</sub>. Set its derivative to zero: 120 − 2q<sub>1</sub> − q<sub>2</sub> = 0.",
        "Best response: q<sub>1</sub> = (120 − q<sub>2</sub>)/2, and by symmetry q<sub>2</sub> = (120 − q<sub>1</sub>)/2.",
        "Symmetric solution: q = (120 − q)/2, so q = <b>40</b> each.",
        "Q = 80, P = 40: between monopoly (Q = 60) and competition (Q = 120)."
      ],
      "cards": ["cournot", "nash", "bertrand"],
      "graph": "econ380Cournot"
    },
    {
      "id": "m12", "section": "cons", "label": "Q12", "week": 1, "kind": "one",
      "prompt": "For U = x<sup>a</sup>y<sup>1−a</sup>, the MRS (MU<sub>x</sub>/MU<sub>y</sub>) is…",
      "options": [
        { "t": "(a/(1 − a))·(y/x)", "right": true, "why": "MU<sub>x</sub> = aU/x and MU<sub>y</sub> = (1 − a)U/y; divide and U cancels." },
        { "t": "(a/(1 − a))·(x/y)", "why": "You flipped the ratio of goods. MU<sub>x</sub> = aU/x has x in the denominator, so x ends up on the bottom." },
        { "t": "a/(1 − a)", "why": "You dropped the y/x term (as if both marginal utilities were constant), so the MRS wouldn’t diminish along the curve." },
        { "t": "p<sub>x</sub>/p<sub>y</sub>", "why": "That’s what the MRS <i>equals at the optimum</i>, not its formula." }
      ],
      "pattern": "<b>MRS = MU<sub>x</sub>/MU<sub>y</sub>.</b> For Cobb–Douglas, each marginal utility is its exponent times U over that good: MU<sub>x</sub> = aU/x. Divide and simplify; the MRS should fall as x rises.",
      "steps": [
        "MU<sub>x</sub> = a x<sup>a−1</sup>y<sup>1−a</sup> = aU/x.",
        "MU<sub>y</sub> = (1 − a) x<sup>a</sup>y<sup>−a</sup> = (1 − a)U/y.",
        "MRS = (aU/x) / ((1 − a)U/y) = <b>(a/(1 − a))·(y/x)</b>.",
        "Check with a = 0.5 at (25, 10): MRS = 1 × 10/25 = 0.4, which falls as x rises ✓."
      ],
      "cards": ["mrs", "tangency", "cddemand"],
      "graph": { "key": "econ380Budget", "args": { "mode": "mrs" } }
    }
  ]
};
