# ECON 381 — Scriptable flashcards (iOS)

`econ381-review.js` is one self-contained file: all 126 Midterm 1 cards, their
graphs and the scheduler. It works the same way as the Wazn Arabic review
script, with two modes depending on where it runs.

| Where | What it does |
|---|---|
| **Home-screen widget** | Shows how many cards are due or new, the next term, and how many of the 126 are *solid*. Tapping it opens a review. |
| **Run in Scriptable** | A start menu, then a full-screen session: tap to flip, then grade. |

## Setup

1. Open **Scriptable** → **+** → paste the whole contents of `econ381-review.js`.
2. Name it **ECON 381**.
3. Run it once.
4. Long-press the home screen → **+** → **Scriptable** → pick small or medium.
5. Long-press the widget → **Edit Widget** → **Script**: *ECON 381*, **When Interacting**: *Run Script*.

There's no account and nothing to sign in to. Progress is saved to
`econ381-progress.json` in Scriptable's iCloud folder (or local storage if
iCloud Drive is off for Scriptable). It survives pasting in a newer version of
the script.

## The start menu

- **Review N due + M new**: what's owed now, plus up to 25 new cards a day. Tested (★) cards come first.
- **★ Tested cards only**: due and new cards from the 65 that were on the practice midterm, with no daily cap.
- **One week…**: due and new cards from one week. If that week is caught up, you can cram it instead.
- **Cram all 126 · no scheduling**: a shuffled pass through everything. Nothing is saved or rescheduled.
- **Progress & reset…**: seen and solid counts per week, the cards you've missed most, and a reset.

## Grading

Flip with a tap. Once the answer is showing:

| Button | Tap zone | What happens |
|---|---|---|
| **Missed** | left third | Back of the deck, so it comes round again this session. Its ladder resets. |
| **Shaky** | middle button | Back in **1 hour**, one rung down the ladder. If you're still in the session an hour later, it reappears by itself. |
| **Confident** | right third | Climbs the ladder: back in **4 hours**, then **8 hours**, then **once a day**. |

So a card you know well gets about three looks a day (9am, 1pm, 9pm, …)
and then settles to once a day. Nothing goes longer than a day because the
exam is close. A card counts as **solid** once you've answered it confidently
at the one-day spacing. Tapping the middle of the card flips it back without
grading, and a tap that ends a scroll never grades.

Swipe down to finish. Every grade is saved the moment you make it, so a
session you abandon halfway still counts.

## What each card shows

Front: the term, its week, and ★ if it was tested on the practice midterm.

Back, in this order (any section with nothing to show is left out):

| Section | |
|---|---|
| **Definition** | the simplest form, in large type, plus the formula |
| **Additional info** | nuances, derivations and exam traps |
| **Connections** | related cards. Tap one to peek at its definition without leaving the card. |
| **Real-world example** | |
| **By the numbers** | real figures with their source and date (BEA, BLS, the Fed, CBO and others, as of Oct 2026) |
| **Played out** | a short worked example with numbers. The same economies run through each week, so the numbers connect from card to card. |
| **Graph** | a diagram drawn for the card, in that week's colour |
| Source tags | where the card came from, e.g. `PE Q14` (practice exam) or `Ch 2 #7` |

## Editing the cards

The cards live in `cards/src/week1.mjs` … `week5.mjs`. After editing, run:

```sh
node tools/build.mjs                 # checks the deck, rebuilds the script and cards/econ381.json
node --test tools/schedule.test.mjs  # scheduler tests
node tools/preview.mjs               # runs the script end to end, screenshots in .preview/
```

`build.mjs` refuses to build if a card is missing a field, a connection points
to a card that doesn't exist, a graph doesn't draw, a number has no source,
or the count isn't 126 cards with 65 starred. Then paste the new
`econ381-review.js` over the old one in Scriptable. Your progress is kept.
