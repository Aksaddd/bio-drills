# Creature Art Brief: Evolving Study Companions

**Project:** Bio Drills, a study web app (multiple-choice drills, word roots, a quiz game) for a college plant and fungal biology course. More courses are planned.

**Role:** Creature designer and illustrator (freelance or contract)

**What you'll make:** Original collectible creatures that hatch, level up and evolve as the student answers questions correctly.

---

## 1. The one-paragraph pitch

Every correct answer gives the student's companion a level. At milestones it evolves into a new form. The creature is the reward loop: it should make a student want to answer one more question. It's also a teaching tool, because each form is grounded in something real from the course, so watching it grow reinforces the material. We want the craft and readability of the best monster-collecting games, with designs that are **100% original**.

---

## 2. Non-negotiables (read first)

1. **Original work only.** Take inspiration from the design *principles* of the genre (Section 4). Do not take characters, silhouettes, signature features, names, color schemes, poses or items from Pokémon, Digimon, Monster Hunter, Palworld, Yo-kai Watch or any other franchise.
   - **The swap test:** if someone could recolor or rename a design and you'd recognize the source, it fails. Changing color, flipping a pose or adding an accessory does **not** make a derivative design original.
   - Avoid genre trademarks: capture balls, type-icon badges, "Who's that…?" framing, trainer imagery and franchise lettering.
   - Generic concepts are fine and encouraged: a turtle, a dinosaur, a fox, a mushroom, a tree. Only someone's *specific execution* is protected.
2. **No AI-generated final assets.** You may use reference photos and your own sketches. Any generative-AI use, including for ideation, must be disclosed up front. Final art must be your own hand-made work.
3. **IP assignment.** All deliverables are work-for-hire, or assigned to us in full, with a written originality warranty: you created the work and it doesn't copy a third party.
4. **Teaching accuracy.** If a form represents a real organism or structure (a fern's sori, a moss sporophyte, a mushroom's gills), it must be correct enough that a biology instructor wouldn't wince. We'll supply a fact sheet and review every stage.

---

## 3. Who this is for

- **Primary user:** a college student cramming for an exam, often on a phone, often late at night, sometimes in dark mode.
- **Tone:** warm, encouraging, a little funny. Never babyish, never edgy-for-its-own-sake.
- **Emotional goal:** "I made this grow." Pride and attachment, not guilt. **Wrong answers never hurt the creature.** No sad, sick or withered states.

---

## 4. Design principles (the craft standard)

### 4.1 Silhouette first
Every form must be identifiable as a **solid black shape** at 48 px. We'll test this literally: we fill your art with black and ask people to tell the forms apart.
- Give each form one **signature feature** that dominates the outline: a sprout, a fan of fronds, a crown, a tree.
- Adjacent evolution stages must have clearly **different** silhouettes while staying recognizably the same family.

### 4.2 Shape language sets personality
| Shape | Reads as | Use it for |
|---|---|---|
| Circles, soft curves | Safe, friendly, young | Baby and early stages |
| Triangles, points | Strong, bold, alert | Late stages, "power" details (plates, crests) |
| Squares, blocks | Sturdy, steady, wise | Defensive or elder forms |

Each line should move from **round → more angular and structured** as it evolves. Don't make it aggressive; we want "majestic," not "menacing."

### 4.3 Color carries meaning
- **2–3 colors per creature** plus outline: one dominant hue (about 60%), one secondary (about 30%), one accent (about 10%).
- **The dominant hue signals the creature's subject domain** (Section 6). Keep it consistent across the whole line, so the student recognizes the family at a glance.
- Must read on **white (#ffffff / #f5f5f7) and on black (#000 / #1c1c1e)**. Test both.
- **Color-blind safe:** forms must be distinguishable in grayscale and under deuteranopia and protanopia simulation. Never rely on red vs. green alone.

### 4.4 Grounded in something real
Every creature starts from a real anchor: an animal, a plant, a fungus, a cell, a historical scientist's instrument, a folklore motif. For this course, **the evolution line should mirror the biology**. Example from our current companion: it hatches from a seed, then moss, ferns, seedlings, flowers and finally a whole tree grow on its back, in the order those plants evolved.

### 4.5 Evolution is told through proportion
| Stage | Head : body | Eyes | Limbs / neck | Detail density |
|---|---|---|---|---|
| Baby | Large head, round body | Big, high-set, two highlights | Stubby, short | Lowest |
| Juvenile | Head shrinks relative to body | Medium | Lengthening | Medium |
| Adult / final | Smaller head, larger frame | Smaller, can gain brows or lids | Long, sturdy, confident stance | Highest (but still restrained) |

Growth in **power, age and size should be visible without any text**. Each stage should also look bigger on screen, even though all stages render in the same box.

### 4.6 Restraint in line and detail
- **Clean, consistent outline** (we use a dark green-black, about 2 px at 120 px canvas). Outline the outer silhouette; interior lines thinner and lighter.
- **Cel shading:** one shadow tone plus one highlight per material. No gradients, no noise textures, no photo textures.
- Details must earn their place: if a detail disappears at 48 px, it's decoration, not identity. Keep it but don't rely on it.
- A good test: could a 12-year-old draw it from memory after seeing it twice?

### 4.7 Balance cute, cool and weird
Across a full roster (Section 6), aim for roughly **50% cute, 30% cool, 20% delightfully weird**, so every student finds a favorite. Within one line, the baby skews cute and the final form skews cool.

### 4.8 Expressiveness at tiny sizes
The creature appears as a **50 px button** in the corner of every page. Faces must read at that size: eyes, a blush mark, a mouth. Supply a "happy" variant used during level-ups. No neutral or sad states.

---

## 5. How the creature lives in the app (functional requirements)

| Moment | What happens | What we need from you |
|---|---|---|
| Idle (always on screen) | Sits in the bottom-right corner, gently bobbing | Idle pose per form; optional 2-frame breathing |
| Correct answer | Hops, "Lv 7!" pops up | "Happy" pose per form (squash and stretch friendly) |
| Evolution (milestone) | Full-screen moment: glows, flickers between old and new silhouettes, bursts into the new form with leaves and petals | Clean silhouettes (we animate the flicker), a reveal pose, and 3–6 themed particle shapes (leaves, spores, petals) |
| Buddy card | Large view (170 px) with name, level, progress bar, the evolution line and a one-sentence biology fact | Hero pose per form; locked-stage silhouettes must still look good as flat gray shapes |
| Dark mode | Same art on black backgrounds | Outline and palette that hold up on both |

**Evolution pacing (current):** 6 forms, unlocking at **0, 5, 15, 35, 70 and 120** correct answers. The early forms come fast so the student gets hooked, and the later ones are earned. The final form must feel like a payoff.

---

## 6. Roster plan (scope for this contract)

**Phase 1 (this contract):** three starter lines for the plant and fungi course. The student picks one at the start, and each line has 6 forms.

| Line | Domain | Real-world anchor (suggested, not prescribed) | Dominant hue |
|---|---|---|---|
| A | Plants: land plants → seeds → flowers | A gentle, long-necked herbivore that grows plants on its back (our current placeholder) | Leaf green |
| B | Fungi: spores → hyphae → mushrooms → lichens | A burrowing or forest-floor animal tied to decomposition and mycelium networks | Earthy brown, cream, with a bioluminescent accent |
| C | Plant signals: light, hormones, tropisms | A nocturnal or sun-tracking creature (phototropism, circadian rhythms, phytochrome red/far-red) | Sunny gold with deep blue |

**Phase 2 (future):** lines for other courses (cell biology, genetics, anthropology). Each domain gets its own dominant hue, so the system scales.

For each line, the six forms should each map to a **real concept from the course**, and we'll give you the concept list. Example for line A: *seed → moss (gametophyte) → fern (sporophyte, sori) → seedling (cotyledons) → flower (double fertilization) → tree (lignin, xylem)*.

---

## 7. Naming guidelines

- 1–3 syllables for babies, up to 4 for final forms. Easy to say aloud.
- Built from **real word roots tied to the biology** where possible (e.g., *frond*, *spor-*, *myc-*, *photo-*). This doubles as vocabulary practice.
- Must not match or closely echo any existing franchise creature name. We'll run a search, and you should too.
- No trademark-style suffixes borrowed from other franchises.

---

## 8. Deliverables and technical specs

**Per form (6 forms × 3 lines = 18 forms in Phase 1):**
1. **Vector master** (SVG or AI): side or three-quarter view, facing **right**, on a 120 × 120 artboard, grounded on a shared baseline (feet at y ≈ 108), with a soft contact shadow on its own layer.
2. Layers separated and named: `outline`, `base`, `shade`, `highlight`, `eyes`, `accessories`, `shadow`. We recolor and animate by layer.
3. **Poses:** idle, happy (hop-ready), and a hero pose for the card.
4. **Silhouette PNG** (pure black, transparent background) for the evolution flicker.
5. **Palette sheet** per line: hex values for dominant, secondary, accent, shade and highlight tones.
6. **Particle set** per line: 3–6 small shapes for the evolution burst.

**Per line:**
- Evolution **turnaround sheet**: all 6 forms side by side at the same scale, plus a silhouette row underneath.
- **Size test sheet**: each form at 38, 50, 120 and 220 px, on light and dark backgrounds.
- A short **concept note** (2–3 sentences per form): the real-world anchor and the biology it represents.

**File constraints:** each SVG under 12 KB after optimization (SVGO). Avoid raster embeds, filters and blend modes, because they render inconsistently on phones. Use a limited number of gradients, ideally none.

---

## 9. Process and milestones

| # | Milestone | You deliver | We review for |
|---|---|---|---|
| 1 | Kickoff | Questions about the course facts and audience | — |
| 2 | Exploration | **30+ silhouette thumbnails** across the three lines, black shapes only | Readability, variety, originality |
| 3 | Line roughs | 6-form rough lineups for the 2–3 strongest directions per line | Proportion progression, story of growth |
| 4 | Color comps | 2 palette options per line on light and dark backgrounds | Domain color coding, contrast, color-blind check |
| 5 | Finals | Clean vector forms, poses, silhouettes | The checklist below |
| 6 | Integration support | Small fixes after we drop the art into the app | How it looks at 50 px in the real UI |

We'll do an **originality review** at milestones 2, 3 and 5: we compare designs side by side against the closest-looking existing creatures we can find, and revise anything that's too close.

---

## 10. Acceptance checklist (every form must pass)

- [ ] Identifiable as a black silhouette at 48 px, and distinct from its neighbors in the line
- [ ] Clearly the same family as the rest of its line
- [ ] Reads as older and more powerful than the previous form, through proportion alone
- [ ] Dominant color matches its domain; 2–3 colors plus outline
- [ ] Works on white and on black; passes the grayscale and color-blind checks
- [ ] Face readable at 50 px; happy pose included
- [ ] The real-world anchor and biology concept are accurate (instructor-approved)
- [ ] Passes the swap test: not a recolor or rework of any existing franchise creature
- [ ] Layered, named, under 12 KB, faces right, on the shared baseline
- [ ] No AI-generated final art; originality warranty signed

---

## 11. Portfolio and trial task (for hiring)

**Look for:** a creature or mascot portfolio with *original* characters, clear silhouettes, evolution or growth sheets, and flat or cel-shaded vector work. Bonus points for scientific illustration or educational game experience.

**Paid trial (about 4–6 hours):** design **one 3-stage line** (baby → juvenile → final) for the *Fungi* domain, grounded in real mycology (spore → mycelium → mushroom). Deliver a color turnaround, a silhouette row, and a 50 px size test on light and dark backgrounds. We judge it with the checklist in Section 10.

---

## 12. Reference: the current placeholder

The app already ships a placeholder line we drew in code (`assets/buddy.js`), a leafy baby sauropod: **Pip → Sprig → Frondo → Sproutle → Blossaur → Grovewalker**. It shows the mechanics, sizes and tone we're aiming for. You're welcome to redesign it completely. It's a starting point, not a style to match.
