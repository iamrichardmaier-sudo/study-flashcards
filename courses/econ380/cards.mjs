// ECON 380 flashcards, in the ECON 381 card schema (see cards/src/week2.mjs).
export default [
  {
    "id": "axioms",
    "n": 1,
    "week": 1,
    "term": "Preference axioms",
    "simple": "Complete (any two bundles can be ranked), transitive (A ≿ B and B ≿ C ⇒ A ≿ C). Usually also monotone (more is better) and convex (averages preferred to extremes)."
  },
  {
    "id": "mrs",
    "n": 2,
    "week": 1,
    "term": "MRS",
    "simple": "Marginal rate of substitution: MRS = MU<sub>x</sub>/MU<sub>y</sub>, the rate the consumer will trade y for one more x and stay indifferent. The (absolute) slope of the indifference curve.",
    "more": [
      "Cobb–Douglas x<sup>a</sup>y<sup>1−a</sup>: MRS = (a/(1−a))·(y/x)."
    ]
  },
  {
    "id": "tangency",
    "n": 3,
    "week": 1,
    "term": "Utility-max condition",
    "simple": "Interior optimum: MRS = p<sub>x</sub>/p<sub>y</sub> (equivalently MU<sub>x</sub>/p<sub>x</sub> = MU<sub>y</sub>/p<sub>y</sub>) and the budget is spent: p<sub>x</sub>x + p<sub>y</sub>y = I."
  },
  {
    "id": "cddemand",
    "n": 4,
    "week": 1,
    "term": "Cobb–Douglas demands",
    "simple": "U = x<sup>a</sup>y<sup>1−a</sup> ⇒ x* = aI/p<sub>x</sub>, y* = (1−a)I/p<sub>y</sub>. A constant budget share a goes to x."
  },
  {
    "id": "lagrange",
    "n": 5,
    "week": 1,
    "term": "Lagrange multiplier λ",
    "simple": "In max U(x,y) s.t. p<sub>x</sub>x + p<sub>y</sub>y = I, λ* is the marginal utility of income: how much the maximized utility rises per extra dollar."
  },
  {
    "id": "hicks",
    "n": 6,
    "week": 1,
    "term": "Marshallian vs Hicksian demand",
    "simple": "Marshallian x(p, I): maximizes utility given income. Hicksian h(p, U): minimizes the spending needed to reach utility U. Hicksian demand only has substitution effects."
  },
  {
    "id": "slutsky",
    "n": 7,
    "week": 1,
    "term": "Slutsky equation",
    "simple": "∂x/∂p<sub>x</sub> = ∂h/∂p<sub>x</sub> − x·∂x/∂I. Total effect = substitution effect (always ≤ 0) + income effect.",
    "more": [
      "See the Consumer optimizer tool for the A → B → C decomposition."
    ]
  },
  {
    "id": "goods",
    "n": 8,
    "week": 1,
    "term": "Normal, inferior, Giffen",
    "simple": "Normal: x rises with income. Inferior: x falls with income. Giffen: an inferior good whose income effect outweighs the substitution effect, so demand slopes up."
  },
  {
    "id": "elas",
    "n": 9,
    "week": 1,
    "term": "Price elasticity of demand",
    "simple": "ε = (∂Q/∂P)(P/Q). |ε| &gt; 1 elastic (raising price cuts revenue), |ε| &lt; 1 inelastic. On linear demand, elasticity changes along the curve."
  },
  {
    "id": "rts",
    "n": 10,
    "week": 2,
    "term": "Returns to scale",
    "simple": "Scale all inputs by t: output rises by more than t (increasing), exactly t (constant) or less (decreasing). For K<sup>α</sup>L<sup>β</sup>, compare α + β with 1."
  },
  {
    "id": "mrts",
    "n": 11,
    "week": 2,
    "term": "MRTS",
    "simple": "Marginal rate of technical substitution = MP<sub>L</sub>/MP<sub>K</sub>: the slope of the isoquant."
  },
  {
    "id": "costmin",
    "n": 12,
    "week": 2,
    "term": "Cost-minimization condition",
    "simple": "MP<sub>L</sub>/MP<sub>K</sub> = w/r (isoquant tangent to isocost), equivalently MP<sub>L</sub>/w = MP<sub>K</sub>/r: the last dollar buys the same output from each input."
  },
  {
    "id": "mcac",
    "n": 13,
    "week": 2,
    "term": "MC crosses AC at its minimum",
    "simple": "When MC &lt; AC, average cost falls; when MC &gt; AC it rises. So MC cuts AC (and AVC) at their minimum points."
  },
  {
    "id": "shutdown",
    "n": 14,
    "week": 2,
    "term": "Short-run shutdown rule",
    "simple": "A competitive firm produces where P = MC as long as P ≥ min AVC. Below that it shuts down and loses only its fixed cost."
  },
  {
    "id": "lrcomp",
    "n": 15,
    "week": 2,
    "term": "Long-run competitive equilibrium",
    "simple": "Free entry and exit drive economic profit to zero: P = MC = min AC."
  },
  {
    "id": "csps",
    "n": 16,
    "week": 3,
    "term": "Consumer & producer surplus",
    "simple": "CS: the area below demand and above the price paid. PS: the area above supply and below the price received."
  },
  {
    "id": "dwl",
    "n": 17,
    "week": 3,
    "term": "Deadweight loss",
    "simple": "Total surplus lost compared with the efficient outcome: trades worth more to buyers than they cost sellers that don’t happen (or inefficient trades that do)."
  },
  {
    "id": "incidence",
    "n": 18,
    "week": 3,
    "term": "Tax incidence",
    "simple": "Who bears a tax doesn’t depend on who legally pays it. The less elastic side bears more: the buyers’ share = ε<sub>S</sub>/(ε<sub>S</sub> + |ε<sub>D</sub>|)."
  },
  {
    "id": "ceiling",
    "n": 19,
    "week": 3,
    "term": "Binding price ceiling",
    "simple": "A maximum price below equilibrium: quantity falls to what suppliers offer, causing a shortage and deadweight loss (plus search and queueing costs in practice)."
  },
  {
    "id": "pareto",
    "n": 20,
    "week": 3,
    "term": "Pareto efficiency & the contract curve",
    "simple": "No one can be made better off without making someone worse off. In an Edgeworth box these are the points where the two MRSs are equal: the contract curve."
  },
  {
    "id": "fwt",
    "n": 21,
    "week": 3,
    "term": "First welfare theorem",
    "simple": "Under perfect competition (with no externalities and full information) a competitive equilibrium is Pareto efficient."
  },
  {
    "id": "mrmc",
    "n": 22,
    "week": 4,
    "term": "Monopoly rule",
    "simple": "Produce where MR = MC and charge the price on the demand curve at that quantity. With P = a − bQ, MR = a − 2bQ."
  },
  {
    "id": "lerner",
    "n": 23,
    "week": 4,
    "term": "Lerner index / inverse-elasticity rule",
    "simple": "(P − MC)/P = 1/|ε|. A monopolist always prices on the elastic part of demand (|ε| &gt; 1)."
  },
  {
    "id": "pricedisc",
    "n": 24,
    "week": 4,
    "term": "Price discrimination",
    "simple": "1st degree: each buyer pays their reservation price (no DWL, no CS). 2nd: menus or quantity discounts that buyers self-select. 3rd: different prices for identifiable groups, with the higher price where demand is less elastic."
  },
  {
    "id": "nash",
    "n": 25,
    "week": 5,
    "term": "Nash equilibrium",
    "simple": "A strategy profile where each player’s strategy is a best response to the others’: no one gains by deviating alone."
  },
  {
    "id": "dominant",
    "n": 26,
    "week": 5,
    "term": "Dominant strategy",
    "simple": "A strategy that does strictly better than every alternative <i>whatever</i> the others do. If each player has one, that profile is the (unique) Nash equilibrium."
  },
  {
    "id": "pd",
    "n": 27,
    "week": 5,
    "term": "Prisoner’s dilemma",
    "simple": "Each player has a dominant strategy (defect), but mutual defection is worse for both than mutual cooperation. Individual rationality ≠ collective efficiency."
  },
  {
    "id": "cournot",
    "n": 28,
    "week": 5,
    "term": "Cournot duopoly",
    "simple": "Firms choose quantities simultaneously. With P = a − bQ and equal MC c: q<sub>i</sub> = (a − c)/(3b). Output lies between monopoly and competition."
  },
  {
    "id": "bertrand",
    "n": 29,
    "week": 5,
    "term": "Bertrand duopoly",
    "simple": "Firms choose prices. With identical products and equal constant MC, the equilibrium is P = MC: two firms are enough for the competitive outcome."
  }
];
