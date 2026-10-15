// The class's content, before anything else reads it: the cards and practice
// questions built into this page, swapped for newer ones from Supabase when an
// earlier visit found some (host.js checks study_courses in the background and
// saves them here). The repo copy is the fallback whenever Supabase can't be
// reached.
var CONTENT = /*__CONTENT__*/ { course: "x", version: "", rev: 0 };
var DECK_DATA = /*__DECK__*/ null;
(function () {
  try {
    var c = JSON.parse(localStorage.getItem("study-content-" + CONTENT.course) || "null");
    if (c && c.version !== CONTENT.version && c.rev > CONTENT.rev && c.cards && c.cards.length) {
      DECK_DATA.cards = c.cards;
      if (c.questions && c.questions.length && typeof EXAM !== "undefined") EXAM.questions = c.questions;
      CONTENT.using = c.version;
    }
  } catch (e) { /* no storage: the built-in content stands */ }
})();
