# Bio Drills

Multiple-choice study drills for **Bi 239**: Ch 29 (Plant Diversity I), Ch 30 (Plant Diversity II), Ch 31 (Fungi) and Ch 39 (Plant Responses to Internal and External Signals). Built from the course's lecture slides, clicker questions and Homework 3. It uses the same engine and approach as [anthro-drills](https://github.com/Aksaddd/anthro-drills).

Everything is plain static HTML, CSS and JavaScript, with no build step and no server code.

| Page | Folder | What it is |
|---|---|---|
| Landing | `index.html` | Exam countdown (the student sets the date on her device), a **Continue** button that opens the weakest subject, and progress for every activity |
| Drill | `drill/` | 203 questions in 8 subject tabs, plus **Mixed**, **Missed** and **Progress** tabs. **Group by: Source** practices one or more sources together (e.g. just HW 3) |
| HW 3 answer key | `hw3/` | Every Homework 3 question as multiple choice, with the answer and an explanation. Has a *Hide answers* quiz mode and is print-friendly |
| Bio-pardy | `board/` | A Jeopardy-style board: 6 categories × 5 values, one hidden ×2 tile |
| Word roots | `roots/` | 59 Greek and Latin roots behind course terms, with a drill: mark roots mastered or for review |
| Review list | `review/` | Every question marked ⚑ for review, in one place |

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

Progress is saved **in the student's own browser** (`localStorage`). Nothing is sent to a server, and there are no accounts. Every key starts with `bio-`, so this site never mixes with anthro-drills even on the same domain. The drill uses `bio-u3-progress-v1`.

## Add questions

All questions live in `drill/questions.js`, one line each:

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

This rebuilds `review/bank.js` for the Review list. Also update the counts on the landing page (`data-total` and the "Where the questions come from" list).

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
