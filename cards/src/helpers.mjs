// Small helpers for writing maths in card text. Everything renders as plain
// HTML in the review page (no KaTeX), so the deck works offline.

/** A stacked fraction. */
export const fr = (top, bottom) =>
  `<span class="fr"><span>${top}</span><span>${bottom}</span></span>`;

/** An operator with breathing room. */
export const op = (s) => `<span class="op">${s}</span>`;

export const weeks = [
  { title: "Data and Measurement", color: "#1F4E8C", soft: "rgba(31,78,140,.10)" },
  { title: "National Income, Distribution & Loanable Funds", color: "#138A7E", soft: "rgba(19,138,126,.11)" },
  { title: "Money, Inflation & Monetary Policy", color: "#C25A16", soft: "rgba(194,90,22,.11)" },
  { title: "Unemployment & Labor-Market Flows", color: "#6A4BA8", soft: "rgba(106,75,168,.11)" },
  { title: "Growth & the Solow Model", color: "#2E7D4F", soft: "rgba(46,125,79,.11)" },
];
