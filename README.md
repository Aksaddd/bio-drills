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

`assets/buddy.js` adds **Dexter**, an original blonde kitten drawn as SVG in an anime/chibi style (the same companion as on the Bio 2010 site), living in the bottom-right corner of every practice page. Every correct answer in the main drill, the HW 3 drill, Word Roots and Bio-pardy earns XP based on the question's difficulty, multiplied by the current win streak (see "XP and difficulty" below). He grows up at 100, 350, 900, 1,800 and 3,200 XP: **Newborn** → **Kitten** → **Pouncer** → **Fighter** → **Lab Cat** → **Professor Dexter**. Each form's card ties Dexter to this course (seed dormancy, monocot cat grass, catnip's chemical defense, plant immunity, phototropism, fungi). He meows on a right answer (the sound can be switched off in Settings) and drops his yarn ball on a miss. Saved as `bio-dexter-v1`; the first time he loads he inherits the XP earned with the earlier sea-turtle buddy. Wrong answers never hurt it. Tap it for its card (progress, evolution line, rename, hide). It can be switched off in Settings. Saved per device as `bio-buddy-v1`.

Pages announce a correct answer with `window.dispatchEvent(new CustomEvent("bio:correct"))`.

## Gold and Dexter's Shop

Every right answer also earns **gold**: Easy 3, Medium 5, Hard 8, Expert 12, multiplied by the win streak (half for questions already answered right 3+ times), plus 50 gold each time Dexter evolves. New players start with a 50-gold welcome gift (plus gold for any XP already earned).

**Tap Dexter** (the corner buddy) to open his panel, with three tabs: **Closet** (the default: dress him), **Shop** (buy items) and **Progress** (level, XP, streaks, gold, the biology, the evolution line, rename or hide). Gold buys items in the Shop: 13 hats, 11 outfits and 20 accessories (glasses, neckwear, things to hold), grouped in themed sets: Police, Firefighter, Construction, Chef, Farmer, Doctor, Pilot, School, Festival, Cozy, Formal, Party, Ranch, Botanist and Royal. In the Shop, tap an item to try it on, then buy, wear or take it off. In the **Closet**, each slot (hat, outfit, glasses, neckwear, held item) offers any item she owns, **Dexter's own** (that form's built-in gear, like the professor's cap) or **None** (nothing, even hiding the built-in gear), plus *Dexter's own look* and *Take everything off*, so she can dress him however she wants. Worn items replace each form's own gear slot by slot and show on Dexter everywhere: the corner buddy, his card, the evolution scene and the evolution line.

The catalog is `assets/wardrobe.js`. Items are drawn once in Dexter's full-size "kitten space" (120 × 120), so they fit all six forms. To add one, append `{ id, slot, name, set, price, svg }` (slots: `hat`, `outfit`, `face`, `neck`, `held`); ids are saved in progress, so never reuse one. Wallet, owned items and worn items are saved with Dexter (`bio-dexter-v1`: `gold`, `owned`, `equip`).

## Dexter greets you and studies with you

- **Greeting:** the first page of each visit (once per browser session), Dexter walks in wearing his current outfit and says hello in a speech bubble: an introduction on the very first visit, then a time-of-day welcome with one tip (days until the exam, XP until he evolves, gold to spend, or XP to the next level). Tap him or *Let's study!* to send him to his spot; he also leaves on his own after 8 seconds.
- **Study pal:** on any page with questions (drills, Lab Practical / HW 3, Word Roots drill, Bio-pardy, mock exam), the corner icon becomes a bigger Dexter who stays with the student: beside the question card on wide screens (he moves with it as you scroll and change questions), in the bottom corner on phones. While you read he plays, switching games about every 15 seconds: batting his yarn ball, chasing a butterfly, hunting a toy mouse, chasing a laser dot, swatting a feather wand, pouncing on a falling leaf, sitting in a cardboard box, or chasing his tail (hover him to see what he's up to). After 45 seconds with no interaction he takes a cat nap (closed eyes, floating z's) and wakes when you do something. When you pick an answer he scurries over to it; a right answer makes him hop and meow, a wrong one makes him lose his toy (it rolls away and comes back). Tap him for the Closet, Shop and Progress.
- Both respect *Reduce motion* and switch off with *Show study buddy* in Settings. The code is in `assets/buddy.js` (search for "Study pal" and "Greeting").

## XP and difficulty

`assets/xp.js` rates every question and turns it into XP (it runs in Node too, for calibration):

| Tier | XP | Share of the drill |
|---|---|---|
| Easy | 10 | 44% |
| Medium | 20 | 38% |
| Hard | 35 | 13% |
| Expert | 50 | 4% |

The score adds up what makes a question hard: the professor's clicker question or a homework concept (+1), EXCEPT/NOT wording (+2), putting steps in order (+2), several numbered statements or blanks (+1), reading an experiment or a figure (+1 each), comparing two things or explaining why/how (+1 each), five choices, long similar answers or "All of the above" (+1 each), a long question (+1), and the Bio-pardy dollar value. It also adds the student's own history: missed it last time, or usually misses it (+1). Score 0–1 is Easy, 2–3 Medium, 4–5 Hard, 6+ Expert. A question already answered right 3+ times earns half XP. Word roots are Easy (Medium for a root missed before).

**Win streaks** (right answers in a row, across every module) multiply XP: 3 in a row ×1.25, 5 ×1.5, 10 ×2, 15 ×2.5, 25 ×3. A wrong answer resets the streak but never removes XP; a streak also cools off after 3 hours away. Levels run from 1 to 100 and follow total XP: level L needs about 20,000 × ((L−1)/99)^1.5 XP, so the forms arrive at Lv 3, 7, 13, 20 and 30 and Level 100 (20,000 XP) is a long-term mastery goal. Each drill question shows its tier and XP; hover or long-press the badge for the reasons.

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
