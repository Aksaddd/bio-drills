# Bio Drills

Multiple-choice study drills for **Bi 239**: Ch 29 (Plant Diversity I), Ch 30 (Plant Diversity II), Ch 31 (Fungi) and Ch 39 (Plant Responses to Internal and External Signals). Built from the course's lecture slides, clicker questions and Homework 3. It uses the same engine and approach as [anthro-drills](https://github.com/Aksaddd/anthro-drills).

Everything is plain static HTML, CSS and JavaScript, with no build step and no server code.

The landing page follows the anthro site's organization: an exam panel whose modules always come in the same order. **Multiple-Choice Drill → Bio-pardy → Word Roots → HW 3 (multiple choice + answer key) → Mock Exam → Review List**. Then "How it works" with the color legend, and the sources table (★ from the professor, ✎ practice written from the slides).

The look follows Apple's design language: the system font (San Francisco), `#f5f5f7` backgrounds, Apple blue (`#0071e3`) for anything tappable, borderless white cards, pill buttons, iOS segmented controls and frosted bars and menus.

| Module | Folder | What it is |
|---|---|---|
| Landing | `index.html` | Frosted nav, countdown to the exam (Wed, Nov 11, 2:00 pm; changeable per device), **Continue** (resumes the drill used last at its weakest subject), module bar, exam panel |
| Multiple-Choice Drill | `drill/` | 203 questions in 8 subject tabs, plus **Mixed**, **Missed** and **Progress**. **Group by: Source** practices chosen sources together |
| Bio-pardy | `board/` | A Jeopardy-style board: 6 categories × 5 values, one hidden ×2 tile |
| Word Roots | `roots/` | 94 Greek and Latin roots, sorted into the drill's 8 subjects, with a drill for all of them or one subject at a time (`roots/roots.js`). Missed roots are saved: retry the ones missed in a round from its summary, or the whole missed list from the start card or a subject |
| HW 3 | `hw3/` | Its own drill (like anthro's Classification): the 89 HW 3 questions in 5 tabs that follow the homework's sections, with separate progress (`bio-hw3-v1`). `hw3/key.html` is the answer key, **answers hidden by default** |
| Mock Exam | `mock/` | A fresh 50- or 100-question exam each time from the drill, 40% from HW 3. Change answers until you submit; flagged questions go to the Review List |
| Review List | `review/` | Every question marked ⚑ for review, from both drills and mock exams |

## Settings

Every page has **Settings** at the top: in the home page's nav bar, and beside "← All drills" on the other pages. It opens an iOS-style sheet (`assets/settings.js`, loaded in each page's `<head>` so the theme applies before the page paints):

- **Appearance**: Light (the default), Dark, or Automatic (follows the device). Saved as `bio-theme`. Dark mode uses Apple's dark system colors (`:root[data-theme="dark"]` in `assets/drill.css`).
- **Exam date**: drives the home-page countdown. The default (Wed, Nov 11, 2:00 pm) is `DEFAULT_EXAM` in `assets/settings.js`. A change is saved per device as `bio-exam-date` and can be reset.
- **Reading font** and **text size**, shared with the drill's Options menu (`bio-reading`).

## Study buddy

`assets/buddy.js` adds an original character drawn in the file as SVG: a baby long-necked leafy dino that lives in the bottom-right corner of every practice page. Every correct answer in the main drill, the HW 3 drill, Word Roots and Bio-pardy earns XP based on the question's difficulty, multiplied by the current win streak (see "XP and difficulty" below). It evolves at 100, 350, 900, 1,800 and 3,200 XP as plants grow on its back in the order they evolved: **Pip** (seed-egg) → **Sprig** (mossy hatchling) → **Frondo** (ferns) → **Sproutle** (seedlings) → **Blossaur** (flowers) → **Grovewalker** (a whole tree). Each form comes with the biology behind it. Art direction: a distinct silhouette for each stage, clean dark outlines with flat color (grass green, cream and one pink accent), and proportions that go from round, big-headed and big-eyed to long-necked, angular and majestic. Wrong answers never hurt it. Tap it for its card (progress, evolution line, rename, hide). It can be switched off in Settings. Saved per device as `bio-buddy-v1`.

Pages announce a correct answer with `window.dispatchEvent(new CustomEvent("bio:correct"))`.

## XP and difficulty

`assets/xp.js` rates every question and turns it into XP (it runs in Node too, for calibration):

| Tier | XP | Share of the drill |
|---|---|---|
| Easy | 10 | 44% |
| Medium | 20 | 38% |
| Hard | 35 | 13% |
| Expert | 50 | 4% |

The score adds up what makes a question hard: the professor's clicker question or a homework concept (+1), EXCEPT/NOT wording (+2), putting steps in order (+2), several numbered statements or blanks (+1), reading an experiment or a figure (+1 each), comparing two things or explaining why/how (+1 each), five choices, long similar answers or "All of the above" (+1 each), a long question (+1), and the Bio-pardy dollar value. It also adds the student's own history: missed it last time, or usually misses it (+1). Score 0–1 is Easy, 2–3 Medium, 4–5 Hard, 6+ Expert. A question already answered right 3+ times earns half XP. Word roots are Easy (Medium for a root missed before).

**Win streaks** (right answers in a row, across every module) multiply XP: 3 in a row ×1.25, 5 ×1.5, 10 ×2, 15 ×2.5, 25 ×3. A wrong answer resets the streak but never removes XP; a streak also cools off after 3 hours away. Levels follow total XP (level L needs 10·(L−1)² XP). Each drill question shows its tier and XP; hover or long-press the badge for the reasons.

## Subject tabs

Land plants · Seedless vascular · Seed plants · Signals · Hormones · Light & time · Stress & defense · Fungi

## Where the questions come from

| Deck | Count | Source |
|---|---|---|
| `HW` | 89 | Homework 3. The professor's questions, rewritten as multiple choice; questions with several parts become one question per part. Answers are written from the slides. |
| `C29` `C30` `C31` `C39` | 17 · 8 · 15 · 17 | The professor's clicker decks, with the answer keys from the slide notes |
| `LS` | 27 | Practice on Ch 39 lecture-slide details the homework doesn't ask about directly |
| `AP` | 30 | Bio-pardy clues (an optional deck the student can switch out of the drill) |

The Ch 39 answers come straight from the lecture slides. There were no lecture slides for Ch 29–31, so those answers follow the clicker questions and the Campbell *Biology* chapters they come from. Homework questions 29–35 aren't in the homework file.

## How progress is saved

Progress is saved **in the student's own browser** (`localStorage`). Nothing is sent to a server, and there are no accounts. Every key starts with `bio-`, so this site never mixes with anthro-drills even on the same domain. The main drill uses `bio-u3-progress-v1`, the HW 3 drill `bio-hw3-v1`, and the mock exam `bio-mock-v1` / `bio-mock-history-v1`.

## Add questions

Questions live in `drill/questions.js`, one line each. The Homework 3 rows, figures and topics live in `drill/shared.js`, because both the main drill and the HW 3 drill read them:

```js
["Tag shown above the question", "Question text?", "Correct answer", ["Wrong 1", "Wrong 2", "Wrong 3"], "Explanation", "figureKey or empty", "topicKey"],
```

- **Append new questions to the end of a deck.** Progress is stored by position, so inserting in the middle shifts saved history onto the wrong questions.
- `topicKey` is one of `L V S T H P D F` (see `TOPICS` at the top of the file).
- Figures live in `drill/img/` and are listed in `FIG`.
- Questions may contain small bits of HTML (`<sub>`, `<sup>`, `<i>`).
- For a new course unit, copy `drill/` to a new folder and give it a new `storageKey`.

**After changing questions, run:**

```bash
node tools/build.js
```

This rebuilds `review/bank.js` (Review List) and `mock/bank.js` (Mock Exam). Also update the counts on the landing page (`data-total` and the "Where the questions come from" list).

The "Why not …?" notes after a wrong answer come from `assets/glossary.js`: add a term there to explain a wrong option.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Publish it on Vercel

1. Push this folder to a GitHub repository.
2. On <https://vercel.com/new>, import the repository.
3. Set **Framework Preset** to **Other**, leave **Build Command** empty, and leave **Output Directory** as the project root.
4. Deploy. Every later push redeploys automatically.

Vercel Web Analytics is wired in with the plain-HTML snippet. Turn on **Analytics** for the project in the Vercel dashboard to collect anonymous page views. Drill progress never leaves the browser.

## A note on content

The question figures are cropped from course slides. They're shared here as a study aid and aren't official course material.
