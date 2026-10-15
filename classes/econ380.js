// ECON 380 · Intermediate Micro Theory 1. Cards, practice questions and four
// model playgrounds from research/econ380-features.md: consumer optimum with
// the substitution/income split, market with taxes and controls, monopoly vs
// competition, and 2×2 games plus Cournot. The maths (Micro) is plain
// functions, checked in tools/classes.test.mjs.
(function () {
  "use strict";
  var S = window.Study, h = S.h, fmt = S.fmt;

  // ------------------------------------------------------------- maths

  var Micro = {
    /** Cobb–Douglas U = x^a y^(1−a). Price of x moves px → px2.
        Returns bundles A (old), B (compensated), C (new) and the effects on x. */
    consumer: function (a, I, px, py, px2, method) {
      var U = function (x, y) { return Math.pow(x, a) * Math.pow(y, 1 - a); };
      var A = { x: a * I / px, y: (1 - a) * I / py };
      var C = { x: a * I / px2, y: (1 - a) * I / py };
      var B;
      if (method === "slutsky") {
        var I2 = px2 * A.x + py * A.y;            // just enough to buy the old bundle
        B = { x: a * I2 / px2, y: (1 - a) * I2 / py, I: I2 };
      } else {
        var U0 = U(A.x, A.y), k = (1 - a) * px2 / (a * py);   // y/x along the new price ratio
        var x = U0 * Math.pow(1 / k, 1 - a);
        B = { x: x, y: k * x };
        B.I = px2 * B.x + py * B.y;
      }
      A.U = U(A.x, A.y); B.U = U(B.x, B.y); C.U = U(C.x, C.y);
      return { A: A, B: B, C: C, sub: B.x - A.x, inc: C.x - B.x, total: C.x - A.x, U: U };
    },

    /** Linear demand P = a − bQ and supply P = c + dQ, with a policy:
        none | tax | subsidy | ceiling | floor, of size amt. */
    market: function (a, b, c, d, policy, amt) {
      var Qe = (a - c) / (b + d), Pe = a - b * Qe;
      var TS = 0.5 * (a - c) * Qe;
      var r = { Qe: Qe, Pe: Pe, TSe: TS, policy: policy, binding: true, gov: 0 };
      var Pd = function (q) { return a - b * q; }, Psup = function (q) { return c + d * q; };
      if (policy === "tax") {
        var t = Math.min(amt, a - c);
        r.Q = (a - c - t) / (b + d); r.Pb = Pd(r.Q); r.Ps = r.Pb - t;
        r.CS = 0.5 * (a - r.Pb) * r.Q; r.PS = 0.5 * (r.Ps - c) * r.Q; r.gov = t * r.Q;
      } else if (policy === "subsidy") {
        var s = amt;
        r.Q = (a - c + s) / (b + d); r.Pb = Pd(r.Q); r.Ps = r.Pb + s;
        r.CS = 0.5 * (a - r.Pb) * r.Q; r.PS = 0.5 * (r.Ps - c) * r.Q; r.gov = -s * r.Q;
      } else if (policy === "ceiling" && amt < Pe) {
        var Pc = Math.max(amt, c);
        r.Q = (Pc - c) / d; r.Pb = r.Ps = Pc;
        r.CS = a * r.Q - b * r.Q * r.Q / 2 - Pc * r.Q; r.PS = 0.5 * (Pc - c) * r.Q;
        r.shortage = (a - Pc) / b - r.Q;
      } else if (policy === "floor" && amt > Pe) {
        var Pf = Math.min(amt, a);
        r.Q = (a - Pf) / b; r.Pb = r.Ps = Pf;
        r.CS = 0.5 * (a - Pf) * r.Q; r.PS = Pf * r.Q - (c * r.Q + d * r.Q * r.Q / 2);
        r.surplus = (Pf - c) / d - r.Q;
      } else {
        r.binding = policy === "none" ? true : false;
        r.Q = Qe; r.Pb = r.Ps = Pe;
        r.CS = 0.5 * (a - Pe) * Qe; r.PS = 0.5 * (Pe - c) * Qe;
      }
      r.DWL = TS - (r.CS + r.PS + r.gov);
      if (Math.abs(r.DWL) < 1e-9) r.DWL = 0;
      r.elasD = -(1 / b) * (Pe / Qe);
      r.elasS = (1 / d) * (Pe / Qe);
      r.buyerShare = b / (b + d);
      return r;
    },

    /** Linear demand P = a − bQ, constant MC = c. */
    monopoly: function (a, b, c) {
      var Qm = (a - c) / (2 * b), Pm = (a + c) / 2, Qc = (a - c) / b;
      var elas = -(1 / b) * (Pm / Qm);
      return { Qm: Qm, Pm: Pm, Qc: Qc, Pc: c, profit: (Pm - c) * Qm, CSm: 0.5 * (a - Pm) * Qm, CSc: 0.5 * (a - c) * Qc,
        DWL: 0.5 * (Pm - c) * (Qc - Qm), lerner: (Pm - c) / Pm, elas: elas };
    },

    /** 2×2 game. A[i][j] = row player's payoff, B[i][j] = column player's,
        for row strategy i and column strategy j. */
    nash: function (A, B) {
      var rowBR = [[false, false], [false, false]], colBR = [[false, false], [false, false]];
      for (var j = 0; j < 2; j++) {
        var m = Math.max(A[0][j], A[1][j]);
        for (var i = 0; i < 2; i++) rowBR[i][j] = A[i][j] === m;
      }
      for (i = 0; i < 2; i++) {
        var n = Math.max(B[i][0], B[i][1]);
        for (j = 0; j < 2; j++) colBR[i][j] = B[i][j] === n;
      }
      var pure = [];
      for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) if (rowBR[i][j] && colBR[i][j]) pure.push([i, j]);
      var rowDom = A[0][0] > A[1][0] && A[0][1] > A[1][1] ? 0 : A[1][0] > A[0][0] && A[1][1] > A[0][1] ? 1 : null;
      var colDom = B[0][0] > B[0][1] && B[1][0] > B[1][1] ? 0 : B[0][1] > B[0][0] && B[1][1] > B[1][0] ? 1 : null;
      // Mixed: p = P(row plays 0) makes the column player indifferent; q = P(column plays 0) the row player.
      var mixed = null, dp = B[0][0] - B[1][0] - B[0][1] + B[1][1], dq = A[0][0] - A[0][1] - A[1][0] + A[1][1];
      if (dp !== 0 && dq !== 0) {
        var p = (B[1][1] - B[1][0]) / dp, q = (A[1][1] - A[0][1]) / dq;
        if (p > 0 && p < 1 && q > 0 && q < 1) mixed = { p: p, q: q };
      }
      return { rowBR: rowBR, colBR: colBR, pure: pure, rowDom: rowDom, colDom: colDom, mixed: mixed };
    },

    /** Cournot duopoly: P = a − b(q1 + q2), constant marginal costs c1, c2. */
    cournot: function (a, b, c1, c2) {
      var q1 = (a - 2 * c1 + c2) / (3 * b), q2 = (a - 2 * c2 + c1) / (3 * b);
      if (q2 < 0) { q2 = 0; q1 = (a - c1) / (2 * b); }
      if (q1 < 0) { q1 = 0; q2 = (a - c2) / (2 * b); }
      var Q = q1 + q2, P = a - b * Q;
      return { q1: q1, q2: q2, Q: Q, P: P, pi1: (P - c1) * q1, pi2: (P - c2) * q2 };
    },
  };

  // ------------------------------------------------------------ cards

  var groups = [
    { id: "cons", name: "Consumer theory" },
    { id: "prod", name: "Production & cost" },
    { id: "mkt", name: "Markets & welfare" },
    { id: "power", name: "Monopoly" },
    { id: "game", name: "Game theory" },
  ];

  var cards = [
    { id: "axioms", group: "cons", term: "Preference axioms", def: "Complete (any two bundles can be ranked), transitive (A ≿ B and B ≿ C ⇒ A ≿ C). Usually also monotone (more is better) and convex (averages preferred to extremes)." },
    { id: "mrs", group: "cons", term: "MRS", def: "Marginal rate of substitution: MRS = MU<sub>x</sub>/MU<sub>y</sub>, the rate the consumer will trade y for one more x and stay indifferent. The (absolute) slope of the indifference curve.",
      more: "Cobb–Douglas x<sup>a</sup>y<sup>1−a</sup>: MRS = (a/(1−a))·(y/x)." },
    { id: "tangency", group: "cons", term: "Utility-max condition", def: "Interior optimum: MRS = p<sub>x</sub>/p<sub>y</sub> (equivalently MU<sub>x</sub>/p<sub>x</sub> = MU<sub>y</sub>/p<sub>y</sub>) and the budget is spent: p<sub>x</sub>x + p<sub>y</sub>y = I." },
    { id: "cddemand", group: "cons", term: "Cobb–Douglas demands", def: "U = x<sup>a</sup>y<sup>1−a</sup> ⇒ x* = aI/p<sub>x</sub>, y* = (1−a)I/p<sub>y</sub>. A constant budget share a goes to x." },
    { id: "lagrange", group: "cons", term: "Lagrange multiplier λ", def: "In max U(x,y) s.t. p<sub>x</sub>x + p<sub>y</sub>y = I, λ* is the marginal utility of income: how much the maximized utility rises per extra dollar." },
    { id: "hicks", group: "cons", term: "Marshallian vs Hicksian demand", def: "Marshallian x(p, I): maximizes utility given income. Hicksian h(p, U): minimizes the spending needed to reach utility U. Hicksian demand only has substitution effects." },
    { id: "slutsky", group: "cons", term: "Slutsky equation", def: "∂x/∂p<sub>x</sub> = ∂h/∂p<sub>x</sub> − x·∂x/∂I. Total effect = substitution effect (always ≤ 0) + income effect.",
      more: "See the Consumer optimizer tool for the A → B → C decomposition." },
    { id: "goods", group: "cons", term: "Normal, inferior, Giffen", def: "Normal: x rises with income. Inferior: x falls with income. Giffen: an inferior good whose income effect outweighs the substitution effect, so demand slopes up." },
    { id: "elas", group: "cons", term: "Price elasticity of demand", def: "ε = (∂Q/∂P)(P/Q). |ε| &gt; 1 elastic (raising price cuts revenue), |ε| &lt; 1 inelastic. On linear demand, elasticity changes along the curve." },

    { id: "rts", group: "prod", term: "Returns to scale", def: "Scale all inputs by t: output rises by more than t (increasing), exactly t (constant) or less (decreasing). For K<sup>α</sup>L<sup>β</sup>, compare α + β with 1." },
    { id: "mrts", group: "prod", term: "MRTS", def: "Marginal rate of technical substitution = MP<sub>L</sub>/MP<sub>K</sub>: the slope of the isoquant." },
    { id: "costmin", group: "prod", term: "Cost-minimization condition", def: "MP<sub>L</sub>/MP<sub>K</sub> = w/r (isoquant tangent to isocost), equivalently MP<sub>L</sub>/w = MP<sub>K</sub>/r: the last dollar buys the same output from each input." },
    { id: "mcac", group: "prod", term: "MC crosses AC at its minimum", def: "When MC &lt; AC, average cost falls; when MC &gt; AC it rises. So MC cuts AC (and AVC) at their minimum points." },
    { id: "shutdown", group: "prod", term: "Short-run shutdown rule", def: "A competitive firm produces where P = MC as long as P ≥ min AVC. Below that it shuts down and loses only its fixed cost." },
    { id: "lrcomp", group: "prod", term: "Long-run competitive equilibrium", def: "Free entry and exit drive economic profit to zero: P = MC = min AC." },

    { id: "csps", group: "mkt", term: "Consumer & producer surplus", def: "CS: the area below demand and above the price paid. PS: the area above supply and below the price received." },
    { id: "dwl", group: "mkt", term: "Deadweight loss", def: "Total surplus lost compared with the efficient outcome: trades worth more to buyers than they cost sellers that don’t happen (or inefficient trades that do)." },
    { id: "incidence", group: "mkt", term: "Tax incidence", def: "Who bears a tax doesn’t depend on who legally pays it. The less elastic side bears more: the buyers’ share = ε<sub>S</sub>/(ε<sub>S</sub> + |ε<sub>D</sub>|)." },
    { id: "ceiling", group: "mkt", term: "Binding price ceiling", def: "A maximum price below equilibrium: quantity falls to what suppliers offer, causing a shortage and deadweight loss (plus search and queueing costs in practice)." },
    { id: "pareto", group: "mkt", term: "Pareto efficiency & the contract curve", def: "No one can be made better off without making someone worse off. In an Edgeworth box these are the points where the two MRSs are equal: the contract curve." },
    { id: "fwt", group: "mkt", term: "First welfare theorem", def: "Under perfect competition (with no externalities and full information) a competitive equilibrium is Pareto efficient." },

    { id: "mrmc", group: "power", term: "Monopoly rule", def: "Produce where MR = MC and charge the price on the demand curve at that quantity. With P = a − bQ, MR = a − 2bQ." },
    { id: "lerner", group: "power", term: "Lerner index / inverse-elasticity rule", def: "(P − MC)/P = 1/|ε|. A monopolist always prices on the elastic part of demand (|ε| &gt; 1)." },
    { id: "pricedisc", group: "power", term: "Price discrimination", def: "1st degree: each buyer pays their reservation price (no DWL, no CS). 2nd: menus or quantity discounts that buyers self-select. 3rd: different prices for identifiable groups, with the higher price where demand is less elastic." },

    { id: "nash", group: "game", term: "Nash equilibrium", def: "A strategy profile where each player’s strategy is a best response to the others’: no one gains by deviating alone." },
    { id: "dominant", group: "game", term: "Dominant strategy", def: "A strategy that does strictly better than every alternative <i>whatever</i> the others do. If each player has one, that profile is the (unique) Nash equilibrium." },
    { id: "pd", group: "game", term: "Prisoner’s dilemma", def: "Each player has a dominant strategy (defect), but mutual defection is worse for both than mutual cooperation. Individual rationality ≠ collective efficiency." },
    { id: "cournot", group: "game", term: "Cournot duopoly", def: "Firms choose quantities simultaneously. With P = a − bQ and equal MC c: q<sub>i</sub> = (a − c)/(3b). Output lies between monopoly and competition." },
    { id: "bertrand", group: "game", term: "Bertrand duopoly", def: "Firms choose prices. With identical products and equal constant MC, the equilibrium is P = MC: two firms are enough for the competitive outcome." },
  ];

  // --------------------------------------------------------- practice

  var practice = [
    { id: "m1", group: "cons", q: "U = x<sup>0.5</sup>y<sup>0.5</sup>, I = 100, p<sub>x</sub> = 2, p<sub>y</sub> = 5. Optimal x?",
      options: [
        { t: "x = 25", right: true, why: "x* = aI/p<sub>x</sub> = 0.5·100/2." },
        { t: "x = 50", why: "That’s I/p<sub>x</sub>, spending everything on x. Cobb–Douglas spends the share a = 0.5." },
        { t: "x = 10", why: "Used p<sub>y</sub> in place of p<sub>x</sub>: 0.5·100/5." },
        { t: "x = 20", why: "I/p<sub>y</sub> is the most y you can buy, not the optimal x." },
      ] },
    { id: "m2", group: "cons", q: "The price of a <i>normal</i> good rises. The substitution and income effects on its quantity…",
      options: [
        { t: "Both reduce quantity", right: true, why: "Substitution effect is always ≤ 0 for an own-price rise; real income falls and a normal good is bought less." },
        { t: "Substitution reduces it; income raises it", why: "That’s the pattern for an <i>inferior</i> good." },
        { t: "Both raise it", why: "Only possible in odd cases. The substitution effect never raises quantity when own price rises." },
        { t: "Substitution raises it; income reduces it", why: "The substitution effect always moves away from the good that got relatively dearer." },
      ] },
    { id: "m3", group: "cons", q: "A Giffen good must be…",
      options: [
        { t: "Inferior, with an income effect larger than the substitution effect", right: true, why: "Only then can a price rise raise quantity demanded." },
        { t: "Normal, with a large income effect", why: "For a normal good both effects cut quantity when price rises." },
        { t: "A luxury good", why: "Luxuries are normal goods (income elasticity &gt; 1)." },
        { t: "Any good with inelastic demand", why: "Inelastic demand still slopes down." },
      ] },
    { id: "m4", group: "mkt", q: "Demand P = 100 − 2Q, supply P = 10 + Q. A $6 per-unit tax is imposed. Deadweight loss?",
      options: [
        { t: "6", right: true, why: "Q falls from 30 to 28. DWL = ½·6·(30 − 28) = 6." },
        { t: "12", why: "Forgot the ½: the DWL is a triangle." },
        { t: "168", why: "That’s tax revenue, 6 × 28, which goes to the government rather than being lost." },
        { t: "0", why: "A tax drives a wedge between the buyer and seller prices, so some trades don’t happen." },
      ] },
    { id: "m5", group: "mkt", q: "Same market (P = 100 − 2Q, P = 10 + Q, $6 tax). What price do buyers now pay?",
      options: [
        { t: "$44", right: true, why: "Q = 28, P<sub>b</sub> = 100 − 56 = 44. Buyers bear $4 of the $6 because demand is steeper." },
        { t: "$46", why: "That assumes buyers bear the whole tax (40 + 6). Sellers bear some too." },
        { t: "$38", why: "That’s the price sellers keep: 44 − 6." },
        { t: "$40", why: "That’s the pre-tax equilibrium price." },
      ] },
    { id: "m6", group: "power", q: "Monopoly: demand P = 100 − 2Q, MC = 20. Profit-maximizing Q and P?",
      options: [
        { t: "Q = 20, P = 60", right: true, why: "MR = 100 − 4Q = 20 ⇒ Q = 20; read P off demand: 100 − 40 = 60." },
        { t: "Q = 40, P = 20", why: "That’s the competitive outcome, P = MC." },
        { t: "Q = 20, P = 20", why: "Price comes from the demand curve, not MC." },
        { t: "Q = 25, P = 50", why: "That maximizes revenue (MR = 0) and ignores cost." },
      ] },
    { id: "m7", group: "power", q: "A monopolist faces |ε| = 4 at its optimum and MC = 30. Price?",
      options: [
        { t: "40", right: true, why: "(P − MC)/P = 1/4 ⇒ P = MC/(1 − 1/4) = 30·4/3." },
        { t: "37.5", why: "Marked up MC by 1/4 (30·1.25). The Lerner index is a share of <i>price</i>." },
        { t: "120", why: "Multiplied MC by |ε|." },
        { t: "30", why: "That’s competitive pricing. A monopolist marks up when demand isn’t perfectly elastic." },
      ] },
    { id: "m8", group: "prod", q: "F(K, L) = K<sup>0.3</sup>L<sup>0.8</sup> has…",
      options: [
        { t: "Increasing returns to scale", right: true, why: "0.3 + 0.8 = 1.1 &gt; 1." },
        { t: "Constant returns to scale", why: "CRS needs the exponents to sum to exactly 1." },
        { t: "Decreasing returns to scale", why: "Decreasing needs a sum below 1." },
        { t: "Diminishing returns to scale, because each exponent is below 1", why: "Exponents below 1 mean diminishing <i>marginal products</i>, which is a different idea from returns to scale." },
      ] },
    { id: "m9", group: "prod", q: "A competitive firm’s price is below minimum AVC but above zero. In the short run it should…",
      options: [
        { t: "Shut down and lose only its fixed cost", right: true, why: "Producing would lose fixed cost plus part of variable cost." },
        { t: "Produce where P = MC", why: "Only if P ≥ min AVC. Otherwise each unit adds more cost than revenue." },
        { t: "Produce where AC is lowest", why: "Firms choose output by P = MC, not by minimizing AC." },
        { t: "Raise its price", why: "A competitive firm is a price taker." },
      ] },
    { id: "m10", group: "game", q: "In a one-shot prisoner’s dilemma, the Nash equilibrium is…",
      options: [
        { t: "Both defect, even though both cooperating would make each better off", right: true, why: "Defect is dominant for each; the equilibrium is Pareto-dominated." },
        { t: "Both cooperate", why: "Each player gains by deviating to defect, so it isn’t an equilibrium." },
        { t: "One cooperates, one defects", why: "The cooperator would rather defect." },
        { t: "There is no Nash equilibrium", why: "(Defect, Defect) is the unique (and dominant-strategy) equilibrium." },
      ] },
    { id: "m11", group: "game", q: "Cournot duopoly: P = 120 − Q, both firms MC = 0. Each firm produces…",
      options: [
        { t: "40", right: true, why: "q = (a − c)/(3b) = 120/3. Q = 80, P = 40." },
        { t: "60", why: "60 each gives Q = 120 and P = 0, the competitive (Bertrand) outcome." },
        { t: "30", why: "Splitting the monopoly output (60) evenly is the collusive outcome, not Cournot." },
        { t: "20", why: "Too low: the best response to 20 is q = (120 − 20)/2 = 50." },
      ] },
    { id: "m12", group: "cons", q: "For U = x<sup>a</sup>y<sup>1−a</sup>, the MRS (MU<sub>x</sub>/MU<sub>y</sub>) is…",
      options: [
        { t: "(a/(1 − a))·(y/x)", right: true, why: "MU<sub>x</sub> = aU/x, MU<sub>y</sub> = (1 − a)U/y." },
        { t: "(a/(1 − a))·(x/y)", why: "Upside-down ratio of goods. MU<sub>x</sub> falls as x rises, so x goes in the denominator." },
        { t: "a/(1 − a)", why: "Missing the y/x term, so the MRS wouldn’t diminish along the curve." },
        { t: "p<sub>x</sub>/p<sub>y</sub>", why: "That’s what MRS <i>equals at the optimum</i>, not its definition." },
      ] },
  ];

  // ------------------------------------------------------------ tools

  var COL = { d: "#1F4E8C", s: "#2E7D52", mc: "#B4561B", cs: "rgba(31,78,140,.18)", ps: "rgba(46,125,82,.2)",
    gov: "rgba(201,138,27,.28)", dwl: "rgba(192,57,43,.35)" };
  function kv(el, rows) {
    el.innerHTML = "";
    rows.forEach(function (r) { el.appendChild(h("span", { style: r[2] || "" }, r[0])); el.appendChild(h("b", { style: r[2] || "" }, r[1])); });
  }
  function lineAt(c, x, y, label, opt) {
    c.text(x, y, label, Object.assign({ "font-weight": 700, "font-size": 12 }, opt || {}));
  }

  // 1. Consumer optimizer + substitution/income decomposition
  function consumerTool(el) {
    var st = S.load("consumer", { a: 0.5, I: 100, px: 2, py: 2, px2: 4, method: "hicks" });
    var plot = h("div"), out = h("div", { class: "kv" }), note = h("p", { class: "dim small", style: "margin:0" });
    var sl = {
      a: S.slider("a in U = xᵃy¹⁻ᵃ", { min: 0.1, max: 0.9, step: 0.05, value: st.a, fmt: function (v) { return v.toFixed(2); } }, draw),
      I: S.slider("Income I", { min: 20, max: 200, step: 5, value: st.I }, draw),
      py: S.slider("Price of y", { min: 0.5, max: 10, step: 0.5, value: st.py }, draw),
      px: S.slider("Old price of x", { min: 0.5, max: 10, step: 0.5, value: st.px }, draw),
      px2: S.slider("New price of x", { min: 0.5, max: 10, step: 0.5, value: st.px2 }, draw),
    };
    var meth = S.select("Compensation", [["hicks", "Hicks (same utility as A)"], ["slutsky", "Slutsky (can still afford A)"]], st.method, function (v) { st.method = v; draw(); });
    function draw() {
      for (var k in sl) st[k] = sl[k].value;
      S.save("consumer", st);
      var r = Micro.consumer(st.a, st.I, st.px, st.py, st.px2, st.method);
      var xm = Math.max(st.I / st.px, st.I / st.px2, r.B.I / st.px2) * 1.1, ym = Math.max(st.I / st.py, r.B.I / st.py) * 1.1;
      var c = S.chart({ h: 420, x: [0, xm], y: [0, ym] }).axes({ xlabel: "x", ylabel: "y" });
      var ic = function (U, col, dash) {
        var pts = [];
        for (var i = 1; i <= 240; i++) { var x = xm * i / 240; pts.push([x, Math.pow(U / Math.pow(x, st.a), 1 / (1 - st.a))]); }
        c.path(pts, { stroke: col, "stroke-width": 1.6, "stroke-dasharray": dash || null });
      };
      ic(r.A.U, "#85796E"); ic(r.C.U, "#85796E", "5 4");
      c.line(0, st.I / st.py, st.I / st.px, 0, { stroke: COL.d, "stroke-width": 2.2 });
      c.line(0, st.I / st.py, st.I / st.px2, 0, { stroke: COL.mc, "stroke-width": 2.2 });
      c.line(0, r.B.I / st.py, r.B.I / st.px2, 0, { stroke: COL.mc, "stroke-width": 1.4, "stroke-dasharray": "6 4" });
      [["A", r.A, COL.d], ["B", r.B, "#2B2118"], ["C", r.C, COL.mc]].forEach(function (p) {
        c.dot(p[1].x, p[1].y, 5, { fill: p[2] });
        lineAt(c, p[1].x, p[1].y, " " + p[0], { dx: 6, dy: -6, fill: p[2] });
      });
      c.line(r.A.x, 0, r.A.x, r.A.y, { stroke: COL.d, "stroke-dasharray": "2 3", "stroke-width": 1 });
      c.line(r.B.x, 0, r.B.x, r.B.y, { stroke: "#2B2118", "stroke-dasharray": "2 3", "stroke-width": 1 });
      c.line(r.C.x, 0, r.C.x, r.C.y, { stroke: COL.mc, "stroke-dasharray": "2 3", "stroke-width": 1 });
      plot.innerHTML = c.svg();
      kv(out, [
        ["A: old optimum (x, y)", "(" + fmt(r.A.x) + ", " + fmt(r.A.y) + ")"],
        ["B: compensated (x, y)", "(" + fmt(r.B.x) + ", " + fmt(r.B.y) + ")"],
        ["C: new optimum (x, y)", "(" + fmt(r.C.x) + ", " + fmt(r.C.y) + ")"],
        ["Substitution effect A→B", fmt(r.sub), "color:#2B2118"],
        ["Income effect B→C", fmt(r.inc)],
        ["Total effect A→C", fmt(r.total), "font-weight:800"],
        ["Income needed at B", fmt(r.B.I)],
      ]);
      note.textContent = "Cobb–Douglas: x* = aI/pₓ = " + fmt(st.a, 2) + "·" + st.I + "/" + st.px2 + ". Solid budget: old prices. Orange: new. Dashed orange: new prices with compensated income.";
    }
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "panel card pad" }, sl.a.el, sl.I.el, sl.py.el, sl.px.el, sl.px2.el, meth.el),
      h("div", { class: "panel" }, plot, h("div", { class: "card pad stack" }, out, note))));
    draw();
  }

  // 2. Market with taxes, subsidies and price controls
  function marketTool(el) {
    var st = S.load("market", { a: 100, b: 2, c: 10, d: 1, policy: "tax", amt: 6 });
    var plot = h("div"), out = h("div", { class: "kv" }), msg = h("p", { class: "dim small", style: "margin:0" });
    var sl = {
      a: S.slider("Demand intercept a (P = a − bQ)", { min: 20, max: 200, step: 1, value: st.a }, draw),
      b: S.slider("Demand slope b", { min: 0.2, max: 5, step: 0.1, value: st.b, fmt: function (v) { return v.toFixed(1); } }, draw),
      c: S.slider("Supply intercept c (P = c + dQ)", { min: 0, max: 100, step: 1, value: st.c }, draw),
      d: S.slider("Supply slope d", { min: 0.2, max: 5, step: 0.1, value: st.d, fmt: function (v) { return v.toFixed(1); } }, draw),
      amt: S.slider("Tax / subsidy / price", { min: 0, max: 200, step: 1, value: st.amt }, draw),
    };
    var pol = S.select("Policy", [["none", "None"], ["tax", "Per-unit tax"], ["subsidy", "Per-unit subsidy"], ["ceiling", "Price ceiling"], ["floor", "Price floor"]],
      st.policy, function (v) { st.policy = v; draw(); });
    function draw() {
      for (var k in sl) st[k] = sl[k].value;
      S.save("market", st);
      var a = st.a, b = st.b, c0 = st.c, d = st.d;
      if (a <= c0) { plot.innerHTML = ""; out.innerHTML = ""; msg.textContent = "Demand starts below supply (a ≤ c), so nothing trades. Raise a or lower c."; return; }
      var r = Micro.market(a, b, c0, d, st.policy, st.amt);
      var qmax = Math.max(a / b, r.Q) * 1.05, pmax = a * 1.08;
      var c = S.chart({ h: 420, x: [0, qmax], y: [0, pmax] }).axes({ xlabel: "Q", ylabel: "P" });
      var Pd = function (q) { return a - b * q; }, Psu = function (q) { return c0 + d * q; };
      var Q = r.Q;
      c.area([[0, a], [0, r.Pb], [Q, r.Pb], [Q, Pd(Q)]], { fill: COL.cs });
      c.area([[0, c0], [Q, Psu(Q)], [Q, r.Ps], [0, r.Ps]], { fill: COL.ps });
      if (st.policy === "tax" && r.gov) c.area([[0, r.Ps], [Q, r.Ps], [Q, r.Pb], [0, r.Pb]], { fill: COL.gov });
      if (st.policy === "subsidy" && r.gov) c.rect(0, r.Pb, Q, r.Ps, { fill: "none", stroke: "#C98A1B", "stroke-width": 2, "stroke-dasharray": "5 4" });
      if (r.DWL > 1e-9) c.area([[Q, Pd(Q)], [r.Qe, r.Pe], [Q, Psu(Q)]], { fill: COL.dwl });
      c.line(0, a, a / b, 0, { stroke: COL.d, "stroke-width": 2.5 });
      c.line(0, c0, (pmax - c0) / d, pmax, { stroke: COL.s, "stroke-width": 2.5 });
      lineAt(c, a / b * 0.92, Pd(a / b * 0.92), "D", { fill: COL.d, dy: -8 });
      lineAt(c, Math.min(qmax, (pmax - c0) / d) * 0.9, Psu(Math.min(qmax, (pmax - c0) / d) * 0.9), "S", { fill: COL.s, dx: 8 });
      if ((st.policy === "ceiling" || st.policy === "floor") && r.binding) c.line(0, r.Pb, qmax, r.Pb, { stroke: "#2B2118", "stroke-width": 1.6, "stroke-dasharray": "6 4" });
      c.dot(r.Qe, r.Pe, 4, { fill: "#85796E" });
      if (st.policy === "tax" || st.policy === "subsidy") { c.dot(Q, r.Pb, 4, { fill: COL.d }); c.dot(Q, r.Ps, 4, { fill: COL.s }); }
      plot.innerHTML = c.svg();
      var rows = [
        ["Equilibrium without policy", "Q = " + fmt(r.Qe) + ", P = " + fmt(r.Pe)],
        ["Quantity traded", fmt(Q)],
        ["Price buyers pay / sellers get", fmt(r.Pb) + " / " + fmt(r.Ps)],
        ["Consumer surplus", fmt(r.CS), "color:" + COL.d],
        ["Producer surplus", fmt(r.PS), "color:" + COL.s],
      ];
      if (st.policy === "tax") rows.push(["Tax revenue", fmt(r.gov), "color:#9A6A12"]);
      if (st.policy === "subsidy") rows.push(["Subsidy cost", fmt(-r.gov), "color:#9A6A12"]);
      if (r.shortage) rows.push(["Shortage", fmt(r.shortage)]);
      if (r.surplus) rows.push(["Surplus (unsold)", fmt(r.surplus)]);
      rows.push(["Deadweight loss", fmt(r.DWL), "color:#C0392B;font-weight:800"]);
      rows.push(["Elasticity at equilibrium: demand / supply", fmt(r.elasD) + " / " + fmt(r.elasS)]);
      if (st.policy === "tax" || st.policy === "subsidy") rows.push(["Share borne by buyers", fmt(100 * r.buyerShare, 0) + "%"]);
      kv(out, rows);
      msg.textContent = !r.binding ? "This " + st.policy + " isn’t binding (a ceiling must be below " + fmt(r.Pe) + ", a floor above it), so the market clears as usual." :
        st.policy === "tax" ? "Buyers bear b/(b + d) of the tax: the steeper (less elastic) side bears more." :
        st.policy === "subsidy" ? "Dashed box = what the subsidy costs; part of it is the red DWL from over-production." :
        st.policy === "ceiling" ? "DWL assumes the scarce units go to the buyers who value them most. Random rationing loses more." :
        st.policy === "floor" ? "Assumes producers make only what sells. If the government buys the surplus, losses are larger." : "";
    }
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "panel card pad" }, pol.el, sl.amt.el, sl.a.el, sl.b.el, sl.c.el, sl.d.el),
      h("div", { class: "panel" }, plot, h("div", { class: "card pad stack" }, out, msg))));
    draw();
  }

  // 3. Monopoly vs competition
  function monopolyTool(el) {
    var st = S.load("monopoly", { a: 100, b: 2, c: 20, pd: false });
    var plot = h("div"), out = h("div", { class: "kv" });
    var sl = {
      a: S.slider("Demand intercept a", { min: 20, max: 200, value: st.a }, draw),
      b: S.slider("Demand slope b", { min: 0.2, max: 5, step: 0.1, value: st.b, fmt: function (v) { return v.toFixed(1); } }, draw),
      c: S.slider("Marginal cost (constant)", { min: 0, max: 150, value: st.c }, draw),
    };
    var pd = h("input", { type: "checkbox", checked: st.pd, onchange: draw });
    function draw() {
      for (var k in sl) st[k] = sl[k].value;
      st.pd = pd.checked; S.save("monopoly", st);
      var a = st.a, b = st.b, mc = st.c;
      if (mc >= a) { plot.innerHTML = ""; kv(out, [["MC is above the demand intercept, so nothing is worth producing.", ""]]); return; }
      var r = Micro.monopoly(a, b, mc);
      var c = S.chart({ h: 420, x: [0, a / b * 1.05], y: [0, a * 1.08] }).axes({ xlabel: "Q", ylabel: "P" });
      if (st.pd) {
        c.area([[0, a], [r.Qc, mc], [0, mc]], { fill: COL.gov });
      } else {
        c.area([[0, a], [0, r.Pm], [r.Qm, r.Pm]], { fill: COL.cs });
        c.rect(0, mc, r.Qm, r.Pm, { fill: COL.gov });
        c.area([[r.Qm, r.Pm], [r.Qm, mc], [r.Qc, mc]], { fill: COL.dwl });
      }
      c.line(0, a, a / b, 0, { stroke: COL.d, "stroke-width": 2.5 });
      c.line(0, a, a / (2 * b), 0, { stroke: COL.d, "stroke-width": 1.6, "stroke-dasharray": "6 4" });
      c.line(0, mc, a / b * 1.05, mc, { stroke: COL.mc, "stroke-width": 2.2 });
      lineAt(c, a / b * 0.85, a - b * a / b * 0.85, "D", { fill: COL.d, dy: -8 });
      lineAt(c, a / (2 * b) * 0.9, a - 2 * b * a / (2 * b) * 0.9, "MR", { fill: COL.d, dx: 6 });
      lineAt(c, a / b * 0.98, mc, "MC", { fill: COL.mc, dy: -6, "text-anchor": "end" });
      if (!st.pd) {
        c.dot(r.Qm, r.Pm, 5, { fill: COL.d }); c.line(r.Qm, 0, r.Qm, r.Pm, { stroke: COL.d, "stroke-dasharray": "2 3", "stroke-width": 1 });
        c.dot(r.Qm, mc, 4, { fill: COL.mc });
      }
      c.dot(r.Qc, mc, 5, { fill: "#85796E" });
      plot.innerHTML = c.svg();
      if (st.pd) kv(out, [
        ["Output (perfect price discrimination)", fmt(r.Qc)],
        ["Profit = all surplus", fmt(r.CSc), "color:#9A6A12;font-weight:800"],
        ["Consumer surplus", "0"], ["Deadweight loss", "0", "color:#C0392B"],
        ["Each buyer pays their own reservation price, so output is efficient but buyers keep nothing.", ""],
      ]);
      else kv(out, [
        ["Monopoly: Q, P", fmt(r.Qm) + ", " + fmt(r.Pm)],
        ["Competition: Q, P", fmt(r.Qc) + ", " + fmt(r.Pc)],
        ["Monopoly profit", fmt(r.profit), "color:#9A6A12"],
        ["Consumer surplus: monopoly / competition", fmt(r.CSm) + " / " + fmt(r.CSc), "color:" + COL.d],
        ["Deadweight loss", fmt(r.DWL), "color:#C0392B;font-weight:800"],
        ["Lerner index (P − MC)/P", fmt(r.lerner, 3)],
        ["1/|ε| at the monopoly point", fmt(1 / Math.abs(r.elas), 3)],
      ]);
    }
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "panel card pad" }, sl.a.el, sl.b.el, sl.c.el,
        h("label", { class: "check" }, pd, h("span", null, "Perfect (1st-degree) price discrimination")),
        h("p", { class: "dim small", style: "margin:0" }, "Blue: consumer surplus. Gold: profit. Red: deadweight loss. MR has twice the slope of linear demand.")),
      h("div", { class: "panel" }, plot, h("div", { class: "card pad" }, out))));
    draw();
  }

  // 4. Games: 2×2 Nash solver + Cournot
  var PRESETS = {
    pd: ["Prisoner’s dilemma", ["Cooperate", "Defect"], ["Cooperate", "Defect"], [[3, 0], [5, 1]], [[3, 5], [0, 1]]],
    bos: ["Battle of the sexes", ["Opera", "Football"], ["Opera", "Football"], [[2, 0], [0, 1]], [[1, 0], [0, 2]]],
    mp: ["Matching pennies", ["Heads", "Tails"], ["Heads", "Tails"], [[1, -1], [-1, 1]], [[-1, 1], [1, -1]]],
    chicken: ["Chicken", ["Swerve", "Straight"], ["Swerve", "Straight"], [[0, -1], [1, -10]], [[0, 1], [-1, -10]]],
    stag: ["Stag hunt", ["Stag", "Hare"], ["Stag", "Hare"], [[4, 0], [3, 3]], [[4, 3], [0, 3]]],
  };
  function gameTool(el) {
    var st = S.load("game", { preset: "pd", A: PRESETS.pd[3], B: PRESETS.pd[4], rows: PRESETS.pd[1], cols: PRESETS.pd[2] });
    var table = h("div"), out = h("div", { class: "stack", style: "gap:6px" });
    var presetSel = S.select("Preset", Object.keys(PRESETS).map(function (k) { return [k, PRESETS[k][0]]; }).concat([["custom", "Custom"]]), st.preset, function (v) {
      if (v === "custom") return;
      var p = PRESETS[v]; st = { preset: v, A: p[3].map(function (r) { return r.slice(); }), B: p[4].map(function (r) { return r.slice(); }), rows: p[1], cols: p[2] };
      build();
    });
    function build() {
      S.save("game", st);
      var r = Micro.nash(st.A, st.B);
      var isNE = function (i, j) { return r.pure.some(function (q) { return q[0] === i && q[1] === j; }); };
      var cell = function (i, j) {
        var inp = function (M, key) {
          return h("input", { type: "number", value: M[i][j], "aria-label": key + " payoff", onchange: function (e) {
            M[i][j] = +e.target.value; st.preset = "custom"; presetSel.input.value = "custom"; build();
          }, style: (key === "row" ? r.rowBR : r.colBR)[i][j] ? "font-weight:800;border-color:var(--c)" : "" });
        };
        return h("td", { class: isNE(i, j) ? "ne" : "" }, inp(st.A, "row"), " , ", inp(st.B, "col"));
      };
      table.innerHTML = "";
      table.appendChild(h("table", { class: "mat" },
        h("tr", null, h("th", null, "Row ↓ / Column →"), h("th", null, st.cols[0]), h("th", null, st.cols[1])),
        [0, 1].map(function (i) { return h("tr", null, h("th", null, st.rows[i]), cell(i, 0), cell(i, 1)); })));
      out.innerHTML = "";
      var name = function (i, j) { return "(" + st.rows[i] + ", " + st.cols[j] + ")"; };
      out.appendChild(h("div", null, h("b", null, "Pure-strategy Nash equilibria: "),
        r.pure.length ? r.pure.map(function (q) { return name(q[0], q[1]); }).join(", ") : "none"));
      out.appendChild(h("div", null, h("b", null, "Dominant strategies: "),
        "Row " + (r.rowDom == null ? "has none" : "→ " + st.rows[r.rowDom]) + "; Column " + (r.colDom == null ? "has none" : "→ " + st.cols[r.colDom])));
      out.appendChild(h("div", null, h("b", null, "Mixed-strategy equilibrium: "), r.mixed ?
        "Row plays " + st.rows[0] + " with p = " + fmt(r.mixed.p, 3) + "; Column plays " + st.cols[0] + " with q = " + fmt(r.mixed.q, 3) +
        " (each mix makes the other player indifferent)" : "none with both players strictly mixing"));
      out.appendChild(h("p", { class: "dim small", style: "margin:0" }, "Each cell: row player’s payoff, column player’s payoff. Bold = a best response. Green cell = Nash equilibrium."));
    }
    // Cournot
    var cst = S.load("cournot", { a: 120, b: 1, c1: 0, c2: 0 });
    var cplot = h("div"), cout = h("div", { class: "kv" });
    var csl = {
      a: S.slider("a in P = a − b(q₁ + q₂)", { min: 20, max: 200, value: cst.a }, cdraw),
      b: S.slider("b", { min: 0.2, max: 5, step: 0.1, value: cst.b, fmt: function (v) { return v.toFixed(1); } }, cdraw),
      c1: S.slider("MC of firm 1", { min: 0, max: 100, value: cst.c1 }, cdraw),
      c2: S.slider("MC of firm 2", { min: 0, max: 100, value: cst.c2 }, cdraw),
    };
    function cdraw() {
      for (var k in csl) cst[k] = csl[k].value;
      S.save("cournot", cst);
      var a = cst.a, b = cst.b, c1 = cst.c1, c2 = cst.c2;
      var r = Micro.cournot(a, b, c1, c2);
      var m = Math.max((a - c1) / b, (a - c2) / b, 1) * 0.75;
      var c = S.chart({ w: 520, h: 360, x: [0, m], y: [0, m] }).axes({ xlabel: "q₁", ylabel: "q₂" });
      c.line(0, (a - c1) / b, (a - c1) / (2 * b), 0, { stroke: COL.d, "stroke-width": 2.2 });   // firm 1 BR: q1 = (a − c1 − b q2)/(2b)
      c.line(0, (a - c2) / (2 * b), (a - c2) / b, 0, { stroke: COL.mc, "stroke-width": 2.2 });  // firm 2 BR: q2 = (a − c2 − b q1)/(2b)
      c.dot(r.q1, r.q2, 5, { fill: "#2B2118" });
      lineAt(c, r.q1, r.q2, " Nash", { dx: 6, dy: -6 });
      c.text(m * 0.02, m * 0.95, "Blue: firm 1’s best response. Orange: firm 2’s.", { "font-size": 11, fill: "#85796E" });
      cplot.innerHTML = c.svg();
      kv(cout, [["q₁ / q₂", fmt(r.q1) + " / " + fmt(r.q2)], ["Total Q, price P", fmt(r.Q) + ", " + fmt(r.P)],
        ["Profits π₁ / π₂", fmt(r.pi1) + " / " + fmt(r.pi2)],
        ["Monopoly Q (MC = firm 1’s) for comparison", fmt(Math.max(0, (a - c1) / (2 * b)))],
        ["Competitive Q (P = firm 1’s MC)", fmt(Math.max(0, (a - c1) / b))]]);
    }
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "panel card pad" }, presetSel.el, h("p", { class: "sec" }, "2×2 game"), table),
      h("div", { class: "card pad" }, out)));
    el.appendChild(h("p", { class: "sec", style: "margin-top:10px" }, "Cournot duopoly"));
    el.appendChild(h("div", { class: "tool-body" },
      h("div", { class: "panel card pad" }, csl.a.el, csl.b.el, csl.c1.el, csl.c2.el),
      h("div", { class: "panel" }, cplot, h("div", { class: "card pad" }, cout))));
    build(); cdraw();
  }

  S.course({
    id: "econ380", code: "ECON 380", title: "Intermediate Micro Theory", color: "#B4561B",
    blurb: "Consumer and producer theory, markets and welfare, monopoly, and basic games.",
    groups: groups, cards: cards, practice: practice,
    tools: [
      { id: "consumer", name: "Consumer optimizer & Slutsky", blurb: "Change a price and split the move into substitution and income effects.", mount: consumerTool },
      { id: "market", name: "Market: taxes, subsidies, controls", blurb: "Surplus areas, incidence and deadweight loss, live.", mount: marketTool },
      { id: "monopoly", name: "Monopoly vs competition", blurb: "MR = MC, profit, DWL, the Lerner rule, perfect price discrimination.", mount: monopolyTool },
      { id: "games", name: "Game solver & Cournot", blurb: "2×2 best responses, pure and mixed Nash equilibria, Cournot reaction functions.", mount: gameTool },
    ],
    math: { Micro: Micro },
  });
})();
