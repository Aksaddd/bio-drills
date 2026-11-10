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

## Read & Learn (`read/`)

The first module on the home page: the whole unit as reading comprehension. Eight chapters (the drill's eight subjects), 36 short passages written from the slides and HW 3, about a minute of reading each. After each passage come **Check yourself** questions about what was just read, shown one at a time, right in the text. Answering 3 (or all, if fewer) unlocks the next passage; the rest are bonus practice, and *Skip the questions* is always there. Key terms are bold with a soft highlight. The chapter ends with a score and links to the next chapter, the drill, or reading it again.

- **Figures and activities from the slides:** 43 figures cropped from the lecture and clicker slides (`read/img/`, rendered with their labels), plus an activity in nearly every passage (`play` in `read/chapters.js`, engine in `read/play.js`):
  - **Label the diagram** (5): the slide's own figure with its labels removed (`*-bare.jpg`); tap a label, then the **?** where it goes. Covers the signal transduction model, phytochrome's de-etiolation pathway, acid growth, the pathogen defenses figure (HR + SAR) and the maize/parasitoid wasp figure.
  - **Experiment labs** (3): the coleoptile experiments (predict, then watch Darwin & Darwin's caps and shields and Boysen-Jensen's gelatin and mica), the lettuce-seed red/far-red switch (free play plus a predict quiz), and a night-length lab (slider plus red/far-red flashes, with 3 missions for short-day and long-day plants).
  - **Put in order**, **match**, **sort**, the clicker **trait table** (cuticle / vascular tissue / seeds / flowers), **flip cards**, and a morning-glory **time-lapse**.
  - A perfect first try earns Dexter XP (as an Easy answer) with confetti; every activity can be replayed. Done activities are saved in `bio-read-v1` under `w`.
- **Content:** `read/chapters.js` (`window.READ`). Each section is `{ h, html, qs }`, where `qs` lists question ids from the drill bank (`drill/questions.js`), so there's one source of truth for questions, answers and explanations. 159 of the bank's questions appear in the reading (all but a few figure-only and duplicate ones; Bio-pardy clues stay on the board).
- **Progress:** saved per device as `bio-read-v1` (`{ chapterId: { at, finished, a: { questionId: { ok, p, o } } } }`); a finished chapter shows every passage and answer. Each answer is also written into the drill's progress (`bio-u3-progress-v1`: history, stats, Missed list, today's count), so the drill knows what you've learned and a miss shows up in its Missed tab. Answers fire `bio:correct` / `bio:wrong` like the drill, so Dexter follows along and earns XP and gold.

## Highlights and notes (Read & Learn)

To highlight, select text in any passage. A toolbar offers four colors (yellow, green, blue, pink) and ✎ Note. Tap a highlight to edit its note, change its color or delete it; highlights with a note show a small ✎.

- **On touch screens:** turn on ✏️ Highlight in the chapter's top bar first. Otherwise press-and-hold looks words up.
- **Notebook:** 🗒 Notes lists the chapter's highlights and notes. *My notebook* on the chapter list collects all of them. Tap any item to jump to it.
- **Storage:** saved per device as `bio-notes-v1`, by passage and character offsets (`read/notes.js`).

## Try again

Every answered question can be tried again:
- **Drill and HW 3:** the *Try this question again* button reshuffles the options. The new answer replaces the old one in the round's score, and the question's history keeps both.
- **Read & Learn:** *↻ Try again* under any answered question. A right answer after a retry shows "Correct on try 2!".

## Reading badges and the Badge Case

Finishing a Read & Learn chapter earns that chapter's badge:
- **The badges:** Moss, Frond, Bloom, Sprout, Ripening, Moonlight, Thorn and Spore. They're original SVG badges in `assets/wardrobe.js`, in a new `badge` wardrobe slot that can't be bought.
- **Earning one:** a celebration screen offers *Pin it on Dexter*, and the badge is then worn on his chest in every form.
- **Badge Case:** Dexter's panel has a new **Badges** tab, a trainer-style red case with 8 slots. Locked slots show only the badge's silhouette and which chapter earns it. Tap a badge to pin it on Dexter or take it off. Earned badges also appear in the Closet.
- **Elsewhere in Read & Learn:** the chapter list shows the case as a strip, and finished chapters show their badge.
- **Syncing:** badges sync from `bio-read-v1` whenever a page loads (`syncBadges()` in `assets/buddy.js`), so chapters finished earlier count too.

## Press and hold a word

On every page, press and hold any word for about half a second (finger, mouse or pen) to get a card with its definition, its word parts (each root's meaning and Greek or Latin origin, linked to the Word Roots page) and its literal meaning. The word is highlighted while the card is open; tap anywhere to close it. A hold never counts as a tap, so holding an answer option doesn't pick it. Plurals and Latin plurals work (sporangia, hyphae, sori, stomata), as do multi-word terms (abscisic acid, alternation of generations, systemic acquired resistance).

- `assets/lexicon.js`: the course dictionary, about 160 terms with definitions and word parts.
- `assets/lookup.js`: the engine. When a word isn't in the dictionary, it uses the Word Roots list (`roots/roots.js` example terms), then the glossary, then finds known roots inside the word. The data loads on the first hold. A one-time tip (`bio-lookup-tip`) points the feature out.

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
- **Study pal:** on any page with questions (drills, Lab Practical / HW 3, Word Roots drill, Bio-pardy, mock exam), the corner icon becomes a bigger Dexter who stays with the student: beside the question card on wide screens (he moves with it as you scroll and change questions), in the bottom corner on phones. While you read he plays, switching games about every 15 seconds: batting his yarn ball, chasing a butterfly, hunting a toy mouse, chasing a laser dot, swatting a feather wand, pouncing on a falling leaf, sitting in a cardboard box, or chasing his tail (hover him to see what he's up to). Each game has its own cat body language, since Dexter is drawn as separate parts (head, ears, eyes, tail, torso, front paws; worn items move with the right part): he swats the yarn with a paw, tracks the butterfly with his head and eyes and rears up on his hind legs, crouches and butt-wiggles before pouncing on the mouse, jerks his head after each jump of the laser dot, swats up at the feather with alternating paws, tilts his head at the falling leaf then pins it, peeks around from the box, and looks back over his shoulder at his tail. He blinks and flicks his ears now and then. After 45 seconds with no interaction he takes a cat nap (closed eyes, floating z's) and wakes when you do something. When you pick an answer he scurries over to it; a right answer makes him hop and meow with his tail straight up and ears perked; a wrong one flattens his ears, drops his tail and makes him lose his toy (it rolls away and comes back). Tap him for the Closet, Shop and Progress.
- **Move Dexter:** drag him (or the corner icon) anywhere on the screen and he stays there ("I'll sit here!"). Keyboard users can focus him and nudge him with the arrow keys (Shift for bigger steps). He still runs over to each answer you pick, then goes back to his spot. The spot is saved per device as a fraction of the screen (`<prefix>-dexter-v1-spot`), so it survives resizing and rotating, and the same spot is used for the corner icon and the study pal. Progress → *Where Dexter sits* has *Put him back beside my questions* to undo it. A tap still opens the Closet; only a real drag (8 px or more) moves him. The code is `makeMovable()` in `assets/buddy.js`.
- **Cat body and poses:** Dexter has a real cat body under his chibi head, drawn in three poses (`sitBody`, `standBody` and `lieBody` in `assets/buddy.js`):
  - **Sitting:** haunches, two front legs, hind feet and a tail around his side. Used in the Closet, the dock and most games.
  - **Standing:** side view on four legs. He trots on all fours whenever he travels (to an answer, or back to his spot): diagonal legs swing together, his body bobs, his tail streams and he faces the way he's going. He also hunts the mouse, the laser dot and his own tail on all fours, with tensed hind legs.
  - **Lying:** a curled loaf for naps, paws tucked and tail wrapped around.
  - Hats, glasses, neckwear and badges move with his head. Outfits are mapped onto the side of his standing or lying body.
- **Weight:** a slider in the Closet goes from Slim through Just right, Well fed and Chubby to Absolute chonk (0.75–1.5, saved as `weight` in his state). It widens his body, belly, haunches and legs in every pose.
- **Expressions:** Dexter's eyes (and mouth) show his mood. Everyday eyes for the yarn; wide, sparkly wonder eyes with raised brows and a little "o" mouth for the butterfly and the leaf; big dilated pupils while hunting the laser, feather and his tail; lowered, focused lids and angled brows while stalking the mouse; heavy content lids in the box; relaxed closed eyes when napping. A right answer gives happy ^ ^ eyes and an open smile; a wrong one gives droopy eyes, worried brows, a tear and a wobbly frown. He greets you with happy eyes and looks sparkly-eyed at himself in the Closet and Shop. The newborn keeps his eyes shut except to react. The code is `eye()`, `mouth()` and `ACT_EYES` in `assets/buddy.js`.
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
