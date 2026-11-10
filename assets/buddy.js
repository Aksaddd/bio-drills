// Bio Drills · Study buddy
// Dexter, an original blonde kitten in an anime/chibi style, who grows up as the student answers correctly.
// Every correct answer (main drill, HW 3 drill, Word Roots, Bio-pardy) earns XP based on how difficult the
// question is (assets/xp.js), multiplied by the current win streak. Levels and evolutions follow total XP.
// Wrong answers reset the streak but never take XP away. Saved on this device only ("bio-dexter-v1"). Dexter inherits the XP already earned with the earlier sea-turtle buddy ("bio-buddy-v1").
// Pages announce answers with: window.dispatchEvent(new CustomEvent("bio:correct", { detail })) and "bio:wrong".
// detail describes the question for the difficulty rating: { kind: "drill", q, prev, prevHist } | { kind: "board", val } | { kind: "root", missed }
// All artwork below is drawn here as SVG.
(() => {
  const KEY = "bio-dexter-v1", OFF_KEY = "bio-buddy-off", TURTLE_KEY = "bio-buddy-v1";
  // Dexter: an original blonde kitten (anime/chibi style) who grows up as the student answers correctly.
  // Six forms at the same XP thresholds as before. Each form's card fact ties Dexter to this course: plants, fungi and plant signals.
  const STAGES = [
    { at: 0, name: "Newborn Dexter", form: "Sleepy newborn", color: "#e2aa4a",
      fact: "Newborn Dexter sleeps most of the day, a bit like a dormant seed. Abscisic acid (ABA) keeps a seed dormant until heavy rain, light or a long cold spell signals that it's safe to grow." },
    { at: 100, name: "Kitten Dexter", form: "Curious kitten", color: "#26365e",
      fact: "Kitten Dexter's favorite snack is cat grass: wheat or oat seedlings. They're monocots, with one cotyledon, parallel leaf veins, scattered vascular bundles and fibrous roots." },
    { at: 350, name: "Pouncer Dexter", form: "Playful pouncer", color: "#4f8dff",
      fact: "Catnip makes Dexter pounce because of nepetalactone, a secondary compound the plant makes to repel insect herbivores. It's a chemical defense, like the ones in Ch 39." },
    { at: 900, name: "Fighter Dexter", form: "Fighter", color: "#c0392b",
      fact: "Plants fight back too. The hypersensitive response kills cells around an infection to wall it off, and methylsalicylic acid travels through the phloem to trigger systemic acquired resistance." },
    { at: 1800, name: "Lab Cat Dexter", form: "Lab assistant", color: "#3fa5e8",
      fact: "Lab Cat Dexter's favorite experiment is phototropism. Light makes auxin move to a coleoptile's shaded side; cells there elongate (the acid growth hypothesis) and the shoot bends toward the light." },
    { at: 3200, name: "Professor Dexter", form: "Professor", color: "#2d2f3a",
      fact: "Professor Dexter's big lecture: fungi absorb their food, digesting it outside their bodies with enzymes, and they're more closely related to cats (animals) than to plants." }
  ];

  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // State: pts = total XP · correct = right answers · streak / best = answers right in a row · last = time of last answer
  const OLD_AT = [0, 5, 15, 35, 70, 120];   // v1 evolved by number of right answers
  const STREAK_TTL = 3 * 60 * 60 * 1000;    // a streak cools off after 3 hours away
  function load() {
    let s = {}; try { s = JSON.parse(localStorage.getItem(KEY) || "{}") || {} } catch (e) { }
    if (s.v === undefined && s.xp === undefined) {   // first visit with Dexter: inherit the sea turtle's XP (not its name)
      try { const t = JSON.parse(localStorage.getItem(TURTLE_KEY) || "null"); if (t && t.v === 2) s = { v: 2, pts: t.pts | 0, correct: t.correct | 0, streak: 0, best: t.best | 0, last: 0, nick: "" } } catch (e) { }
    }
    if (s.v !== 2) {   // migrate v1 (xp = count of right answers) without ever moving the buddy back a form
      const n = s.xp | 0; let k = 0; OLD_AT.forEach((t, i) => { if (n >= t) k = i });
      s = { v: 2, pts: Math.max(n * 20, STAGES[k].at), correct: n, streak: 0, best: 0, last: 0, nick: s.nick || "" };
    }
    if (s.streak && Date.now() - (s.last || 0) > STREAK_TTL) s.streak = 0;
    // Gold wallet + wardrobe. First time: a 50-gold welcome gift plus gold for the XP already earned (about 1 gold per 4 XP).
    if (s.gold === undefined) s.gold = 50 + Math.round((s.pts | 0) * .24);
    s.weight = Math.min(1.5, Math.max(.75, +s.weight || 1));
    s.owned = Array.isArray(s.owned) ? s.owned : []; s.equip = s.equip && typeof s.equip === "object" ? s.equip : {};
    return s;
  }
  const save = s => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch (e) { } };
  const off = () => { try { return localStorage.getItem(OFF_KEY) === "1" } catch (e) { return false } };
  const stageOf = pts => { let k = 0; STAGES.forEach((s, i) => { if (pts >= s.at) k = i }); return k };
  const nextAt = k => STAGES[k + 1] ? STAGES[k + 1].at : null;
  // Levels 1–100. Reaching level L takes A·(L−1)^1.5 XP, with Level 100 at 20,000 XP: quick early levels,
  // a long climb at the top. Forms land at Lv 3 (Kitten Dexter), 7, 13, 20 and 30 (Professor Dexter); 30–100 is mastery.
  const MAX_LV = 100, MAX_XP = 20000, LV_A = MAX_XP / Math.pow(MAX_LV - 1, 1.5);
  const lvXP = L => L <= 1 ? 0 : Math.ceil(LV_A * Math.pow(L - 1, 1.5));
  function level(pts) {
    let L = Math.min(MAX_LV, Math.floor(1 + Math.pow(Math.max(0, pts) / LV_A, 2 / 3) + 1e-9));
    while (L < MAX_LV && pts >= lvXP(L + 1)) L++;
    while (L > 1 && pts < lvXP(L)) L--;
    return L;
  }
  const XP = () => window.BioXP;
  const fmt = n => Math.round(n).toLocaleString("en-US");

  // ===== Artwork (viewBox 0 0 120 120): Dexter, an original blonde kitten drawn in an anime/chibi style.
  // Design rules: front-facing chibi proportions (big head, small body), golden-blonde fur with a spiky blonde fringe,
  // big glossy eyes with two highlights, pink blush with hatch marks, an "ω" mouth, thick clean outlines and
  // flat cel shading. He grows from a sleepy newborn into a professor, gaining one piece of gear per form.
  const OL = "#3a2a1e", OW = 2.4;
  const FUR = "#f7d27c", FUR_D = "#e2aa4a", FUR_L = "#fff0c2", PINK = "#e8a08a", PINK_D = "#c9705a";
  const ln = `stroke="${OL}" stroke-width="${OW}" stroke-linejoin="round" stroke-linecap="round"`;
  let uidN = 0;
  const sparkle = (x, y, r, c = "#ffd84a") => `<path d="M${x} ${y - r} Q${x + r * .18} ${y - r * .18} ${x + r} ${y} Q${x + r * .18} ${y + r * .18} ${x} ${y + r} Q${x - r * .18} ${y + r * .18} ${x - r} ${y} Q${x - r * .18} ${y - r * .18} ${x} ${y - r}Z" fill="${c}" stroke="${OL}" stroke-width="1"/>`;
  // Eye expressions. "open" is his everyday look; the study pal switches between the others by mood:
  //   wide (wonder: sparkly, brows up) · dilated (playing/hunting: big round pupils, as real cats' widen) · focus (stalking:
  //   lids lowered toward the nose, big pupils) · sleepy (content: heavy lids, a slow blink) · sad (outer lids droop, worried
  //   brows, a tear) · happy (closed ^ ^ smile) · sleep (relaxed closed lids) · closed (the newborn's sleepy look)
  const EYE = {   // pupil rx/ry, lid drop at outer/inner corner, brow outer/inner y offset, highlight scale
    open: { p: [1.9, 3.3], dO: 0, dI: 0, bO: -10.6, bI: -8.4, hi: 1 },
    wide: { p: [2.6, 3.5], dO: -1.2, dI: -1.2, bO: -13, bI: -12.2, hi: 1.3, star: true },
    dilated: { p: [4.1, 4.7], dO: 0, dI: 0, bO: -11.4, bI: -10, hi: 1.15 },
    focus: { p: [3.4, 4.3], dO: .4, dI: 2.8, bO: -11.6, bI: -6.8, hi: .9 },
    sleepy: { p: [2.6, 3.2], dO: 4.6, dI: 4.2, bO: -9.6, bI: -9.2, hi: .8 },
    sad: { p: [2.8, 3.6], dO: 3.8, dI: 0, bO: -8.2, bI: -12, hi: 1.25, tear: true }
  };
  function eye(u, x, y, mode) {
    if (mode === "closed") return `<path d="M${x - 6} ${y + 1} Q${x} ${y - 5} ${x + 6} ${y + 1}" stroke="${OL}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    if (mode === "happy") return `<path d="M${x - 6.4} ${y + 2.4} Q${x} ${y - 6} ${x + 6.4} ${y + 2.4}" stroke="${OL}" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M${x - 7.4} ${y - 10.4} Q${x} ${y - 13.6} ${x + 7.4} ${y - 10.4}" stroke="#6b3f17" stroke-width="3.6" fill="none" stroke-linecap="round"/>`;
    if (mode === "sleep") return `<path d="M${x - 6.2} ${y + .4} Q${x} ${y + 5.2} ${x + 6.2} ${y + .4}" stroke="${OL}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M${x - 7} ${y - 9.2} Q${x} ${y - 10.6} ${x + 7} ${y - 9.2}" stroke="#6b3f17" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".85"/>`;
    const e = EYE[mode] || EYE.open, out = x < 60 ? -1 : 1, m = v => out < 0 ? v : -v;   // m(): mirror x offsets for the right eye
    const h = e.hi, dO = e.dO, dI = e.dI;
    return `<ellipse cx="${x}" cy="${y + 1.6}" rx="5.8" ry="6.2" fill="url(#${u}iris)" stroke="${OL}" stroke-width="1.8"/>
      <ellipse cx="${x + m(.6)}" cy="${y + 2.2}" rx="${e.p[0]}" ry="${e.p[1]}" fill="#1f2a18"/>
      <ellipse cx="${x + m(-2)}" cy="${y - 1.6}" rx="${2 * h}" ry="${2.4 * h}" fill="#fff"/><circle cx="${x + m(2.4)}" cy="${y + 4}" r="${1 * h}" fill="#fff"/>
      ${e.star ? `<path d="M${x + m(2.6)} ${y - .6} l.7 1.6 1.6 .7 -1.6 .7 -.7 1.6 -.7 -1.6 -1.6 -.7 1.6 -.7Z" fill="#fff"/>` : ""}
      <path d="M${x + m(-6.6)} ${y - 6.4} Q${x} ${y - 5.4} ${x + m(6.6)} ${y - 6.4} L${x + m(6.6)} ${y - 2 + dI} Q${x} ${y - 3.2 + (dO + dI) / 2} ${x + m(-6.6)} ${y - 2 + dO}Z" fill="${FUR}"/><path d="M${x + m(-7.2)} ${y - 1.6 + dO} Q${x} ${y - 3.6 + (dO + dI) / 2} ${x + m(7.4)} ${y - 1.2 + dI}" stroke="${OL}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M${x + m(-6)} ${y + 6.4} Q${x} ${y + 9.2} ${x + m(5)} ${y + 6.6}" stroke="${OL}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".6"/>
      <path d="M${x + m(-7.8)} ${y + e.bO} L${x + m(6.8)} ${y + e.bI}" stroke="#6b3f17" stroke-width="4.2" stroke-linecap="round"/>
      ${e.tear && out < 0 ? `<path d="M${x - 5.2} ${y + 6.6} q-1.6 2.8 0 4 q1.6 -1.2 0 -4Z" fill="#8fd3ff" stroke="${OL}" stroke-width=".9"/>` : ""}`;
  }
  // Mouth to match: happy = open smile, sad = wobbly frown, wide = a little "o", asleep = soft ω, otherwise his grin
  function mouth(mode) {
    if (mode === "closed" || mode === "sleep") return `<path d="M55.4 71 Q57.7 74.4 60 71.2 Q62.3 74.4 64.6 71" stroke="${OL}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    if (mode === "happy") return `<path d="M55 71.2 Q57.5 73.4 60 71.4 Q62.5 73.4 65 71.2 Q64 78.4 60 78.6 Q56 78.4 55 71.2Z" fill="#a8463a" stroke="${OL}" stroke-width="1.6" stroke-linejoin="round"/><path d="M57.2 76.2 Q60 74.6 62.8 76.2 Q61.8 78.2 60 78.3 Q58.2 78.2 57.2 76.2Z" fill="#f08a8a"/>`;
    if (mode === "sad") return `<path d="M55.6 75 Q57.6 72.2 60 73.2 Q62.4 72.2 64.4 75" stroke="${OL}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
    if (mode === "wide") return `<path d="M56.4 71.2 Q58.2 72.6 60 71.4 Q61.8 72.6 63.6 71.2" stroke="${OL}" stroke-width="1.5" fill="none" stroke-linecap="round"/><ellipse cx="60" cy="75" rx="2.2" ry="2.5" fill="#a8463a" stroke="${OL}" stroke-width="1.3"/>`;
    return `<path d="M54.6 71.4 Q57.4 74.2 60 71.4 Q63.4 74.6 66.8 69.6" stroke="${OL}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  }

  // ===== Dexter's body. A real cat body in three poses, with his big chibi head (face, expressions, hats) on top:
  //   sit   front-facing, sitting up: haunches, two front legs, hind feet, tail around the side (the closet, the dock, most games)
  //   stand side view, on four legs (walk cycle when he trots over to an answer, crouches when hunting)
  //   lie   a curled loaf with paws tucked in (cat naps)
  // o.w is his weight (0.75 slim … 1.5 chonky): it widens the body, belly and legs in every pose.
  // Parts keep their class names (dx-torso, dx-tail, dx-pawl, dx-pawr, dx-hindl, dx-hindr, dx-head …) so the study pal can animate them.
  const f1 = n => Math.round(n * 10) / 10;
  function furTail(d, w2) { return `<path d="${d}" stroke="${OL}" stroke-width="${w2 + 4.4}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${FUR}" stroke-width="${w2}" fill="none" stroke-linecap="round"/>` }
  function leg(x, top, bot, wd, cls, far) {   // a leg column (open at the top so it blends into the body) with a paw
    const h = wd / 2, c = far ? FUR_D : FUR;
    return `<g class="${cls}"><path d="M${f1(x - h)} ${top} L${f1(x - h - .3)} ${bot - 4} Q${f1(x - h - 1.4)} ${bot + .6} ${x} ${bot + .6} Q${f1(x + h + 1.4)} ${bot + .6} ${f1(x + h + .3)} ${bot - 4} L${f1(x + h)} ${top}Z" fill="${c}"/>
      <path d="M${f1(x - h)} ${top} L${f1(x - h - .3)} ${bot - 4} Q${f1(x - h - 1.4)} ${bot + .6} ${x} ${bot + .6} Q${f1(x + h + 1.4)} ${bot + .6} ${f1(x + h + .3)} ${bot - 4} L${f1(x + h)} ${top}" fill="none" ${ln}/>
      ${far ? "" : `<path d="M${f1(x - 1.6)} ${bot - 2.4} v2.4 M${f1(x + 1.6)} ${bot - 2.4} v2.4" stroke="${OL}" stroke-width="1.1" stroke-linecap="round"/>`}</g>`;
  }
  function sitBody(o, w) {
    const hx = 16 * w, lw = 7.8 * (.75 + .25 * w), lx = 7.4 * (.75 + .25 * w);
    const tail = o.tail === "down" ? `M${f1(60 + 16 * w)} 105 C${f1(78 + 18 * w)} 111 ${f1(70 + 10 * w)} 112 ${f1(56 - 6 * w)} 110` : `M${f1(60 + 17 * w)} 102 C${f1(74 + 22 * w)} 104 ${f1(84 + 16 * w)} 92 ${f1(82 + 14 * w)} 76 C${f1(81 + 14 * w)} 68 ${f1(76 + 13 * w)} 66 ${f1(77 + 13 * w)} 71`;
    const back = `<g class="dx-tail">${furTail(tail, 5.8)}${o.tail === "down" ? "" : `<path d="M${f1(81 + 14 * w)} 74 C${f1(80 + 14 * w)} 69 ${f1(77 + 13 * w)} 67 ${f1(77 + 13 * w)} 70" stroke="${FUR_L}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`}</g>`;
    const body = `<g class="dx-torso">
      <ellipse cx="${f1(60 - hx)}" cy="99.5" rx="${f1(9.6 * w)}" ry="${f1(8.8 + w)}" fill="${FUR}" ${ln}/><ellipse cx="${f1(60 + hx)}" cy="99.5" rx="${f1(9.6 * w)}" ry="${f1(8.8 + w)}" fill="${FUR}" ${ln}/>
      <path d="M${f1(60 - 12 * w)} 78 Q60 71 ${f1(60 + 12 * w)} 78 C${f1(60 + 17 * w)} 87 ${f1(60 + 19 * w)} 97 ${f1(60 + 16.5 * w)} 104 Q${f1(60 + 13 * w)} 109 60 109 Q${f1(60 - 13 * w)} 109 ${f1(60 - 16.5 * w)} 104 C${f1(60 - 19 * w)} 97 ${f1(60 - 17 * w)} 87 ${f1(60 - 12 * w)} 78Z" fill="${FUR}" ${ln}/>
      <path d="M${f1(60 - 10 * w)} 98 Q60 ${f1(104 + 4 * (w - 1))} ${f1(60 + 10 * w)} 98 Q${f1(60 + 9 * w)} 108 60 108.4 Q${f1(60 - 9 * w)} 108 ${f1(60 - 10 * w)} 98Z" fill="${FUR_D}" opacity=".5"/>
      <path d="M${f1(60 - 8 * w)} 83 L${f1(60 - 5 * w)} 88 L${f1(60 - 3 * w)} 83.6 L${f1(60 - 1.2 * w)} 89 L60 83 L${f1(60 + 1.2 * w)} 89 L${f1(60 + 3 * w)} 83.6 L${f1(60 + 5 * w)} 88 L${f1(60 + 8 * w)} 83 Q${f1(60 + 9 * w)} 98 60 103 Q${f1(60 - 9 * w)} 98 ${f1(60 - 8 * w)} 83Z" fill="${FUR_L}"/>
      <ellipse cx="${f1(60 - hx - 4 * w)}" cy="106.4" rx="6.4" ry="3.6" fill="${FUR_L}" ${ln}/><ellipse cx="${f1(60 + hx + 4 * w)}" cy="106.4" rx="6.4" ry="3.6" fill="${FUR_L}" ${ln}/>
      <path d="M${f1(60 - hx - 8 * w)} 95 q3 -3 7 -3 M${f1(60 + hx + 8 * w)} 95 q-3 -3 -7 -3" stroke="${FUR_D}" stroke-width="1.3" fill="none" stroke-linecap="round"/></g>`;
    const legs = leg(f1(60 - lx), 84, 107.6, lw, "dx-pawl") + leg(f1(60 + lx), 84, 107.6, lw, "dx-pawr");
    return { back, body, legs, head: "translate(60 12) scale(.9) translate(-60 -12)", shadow: 26 * w, outfitMap: "" };
  }
  function standBody(o, w, u) {
    const T = f1(73.5 - 3 * (w - 1)), Bm = f1(99 + 9 * (w - 1)), Rr = f1(99 + 2 * (w - 1)), lw = 7 * (.8 + .2 * w);
    const tail = o.tail === "down" ? `M97 88 C106 92 110 100 104 106` : `M97 84 C107 82 112 70 107 58 C105 53 100 54 101 59`;
    const bodyPath = `M47 85 C47 ${T} 62 ${T} 74 ${T} C88 ${T} ${Rr} 75 ${Rr} 86 C${Rr} ${Bm} 90 ${Bm} 74 ${Bm} C58 ${Bm} 47 97 47 85Z`;
    const back = leg(61, 90, 107.6, lw, "dx-pawr", true) + leg(85, 92, 107.6, lw, "dx-hindr", true) + `<g class="dx-tail">${furTail(tail, 5.8)}</g>`;
    const body = `<g class="dx-torso"><defs><clipPath id="${u}bc"><path d="${bodyPath}"/></clipPath></defs><path d="${bodyPath}" fill="${FUR}" ${ln}/>
      <path d="M58 ${f1(+Bm - 4)} Q74 ${f1(+Bm + 1)} 90 ${f1(+Bm - 5)}" stroke="${FUR_D}" stroke-width="4" fill="none" opacity=".45" stroke-linecap="round"/>
      <path d="M80 ${f1(+T + 3)} q3 4 0 8 M86 ${f1(+T + 4)} q3 4 0 8" stroke="${FUR_D}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".8"/>
      <ellipse cx="89" cy="${f1(90 + 2 * (w - 1))}" rx="${f1(10 * (.85 + .15 * w))}" ry="${f1(10.5 * (.85 + .15 * w))}" fill="${FUR}" ${ln}/>
      <path d="M49 82 Q50 92 57 96 Q53 88 55 80Z" fill="${FUR_L}"/>
      <g class="dx-outfit" clip-path="url(#${u}bc)"></g></g>`;
    const legs = leg(54, 90, 107.6, lw, "dx-pawl") + leg(92, 95, 107.6, lw + 1, "dx-hindl");
    return { back, body, legs, head: "translate(47 87) scale(.82) translate(-60 -86)", shadow: 30 * w, outfitMap: `translate(48 ${T}) scale(${f1(50 / 38 * 100) / 100} ${f1((+Bm - +T) / 32 * 100) / 100}) translate(-41 -76)`, clip: `${u}bc` };
  }
  function lieBody(o, w, u) {
    const rx = f1(34 * (.85 + .15 * w)), ry = f1(12 * (.8 + .25 * w)), cy = f1(108.6 - +ry);
    const bodyPath = `M${f1(66 - +rx)} 108 C${f1(66 - +rx)} ${f1(+cy - +ry * .9)} ${f1(66 + +rx * .6)} ${f1(+cy - +ry * 1.05)} ${f1(66 + +rx)} ${f1(+cy + 2)} C${f1(66 + +rx + 1)} 108.6 ${f1(66 + +rx * .5)} 108.8 66 108.8Z`;
    const back = "";
    const body = `<g class="dx-torso"><defs><clipPath id="${u}bc"><path d="${bodyPath}"/></clipPath></defs><path d="${bodyPath}" fill="${FUR}" ${ln}/>
      <path d="M${f1(66 + +rx * .2)} ${f1(+cy - +ry * .2)} q4 4 0 8 M${f1(66 + +rx * .45)} ${f1(+cy - +ry * .1)} q4 4 0 8" stroke="${FUR_D}" stroke-width="1.4" fill="none" opacity=".8" stroke-linecap="round"/>
      <g class="dx-outfit" clip-path="url(#${u}bc)"></g></g>
      <g class="dx-tail">${furTail(`M${f1(66 + +rx - 2)} 106 C${f1(66 + +rx + 4)} 112 60 112.4 40 110`, 5.4)}</g>`;
    const legs = `<g class="dx-pawl"><ellipse cx="38" cy="106.6" rx="6.6" ry="3.6" fill="${FUR_L}" ${ln}/></g><g class="dx-pawr"><ellipse cx="50" cy="107.4" rx="6.6" ry="3.4" fill="${FUR_L}" ${ln}/></g>`;
    return { back, body, legs, head: "translate(44 106) scale(.78) translate(-60 -86)", shadow: +rx + 4, outfitMap: `translate(${f1(66 - +rx * .7)} ${f1(+cy - +ry)}) scale(${f1(+rx * 1.6 / 38 * 100) / 100} ${f1(+ry * 2 / 32 * 100) / 100}) translate(-41 -76)`, clip: `${u}bc` };
  }
  function drawHead(u, o) {
    return `
      <g class="dx-earl"><path d="M35 47 L36.5 15 L43.5 21.5 L41.5 25 L46.5 25.5 L56 33Z" fill="${FUR}" ${ln}/><path d="M39 40 L40 23 L42.5 25.5 L46 27.5 L51 33Z" fill="${PINK}"/></g>
      <g class="dx-earr"><path d="M85 47 L83.5 15 L64 33Z" fill="${FUR}" ${ln}/><path d="M81 40 L80 22.5 L69 33Z" fill="${PINK}"/></g>
      <path d="M32.5 58 L25 61 L31.5 65 L24.5 69.5 L32 71.5 L28.5 76 L37 75.5 Q43 85 60 85.5 Q77 85 83 75.5 L91.5 76 L88 71.5 L95.5 69.5 L88.5 65 L95 61 L87.5 58 Q88 33 60 32 Q32 33 32.5 58Z" fill="${FUR}" ${ln}/>
      <path d="M37 74 Q47 82.5 60 83 Q73 82.5 83 74 Q77 86 60 86 Q43 86 37 74Z" fill="${FUR_D}" opacity=".55"/>
      <path d="M41 45 L42 27 L50 39 L53 21 L60 37 L66 20.5 L69.5 37 L78 25 L79 45 Q60 39 41 45Z" fill="${FUR_L}" ${ln}/>
      <path d="M50 39 L52 31 M60 37 L64 28 M69.5 37 L74 31" stroke="${FUR_D}" stroke-width="1.4" stroke-linecap="round"/>
      <g class="dx-eyes"><g class="dx-blink">${eye(u, 48.5, 60, o.eyes)}${eye(u, 71.5, 60, o.eyes)}</g></g>
      
      <path d="M58.2 67.6 L61.8 67.6 L60 69.8Z" fill="${PINK_D}" stroke="${OL}" stroke-width="1" stroke-linejoin="round"/>
      ${mouth(o.eyes)}
      <path d="M33 66 L22 64 M33 69 L22 70.5 M87 66 L98 64 M87 69 L98 70.5" stroke="${OL}" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`;
  }

  // The kitten at full size, standing on y=108. o: { sc, eyes, tail, glasses, pose, w, outfit, neck, front, over, back }
  function kitty(u, o) {
    const w = Math.min(1.5, Math.max(.75, +o.w || 1)), pose = o.pose || "sit";
    const P = pose === "stand" ? standBody(o, w, u) : pose === "lie" ? lieBody(o, w, u) : sitBody(o, w);
    const glasses = o.glasses ? `<circle cx="48.5" cy="60" r="10" fill="#bfe6ff" fill-opacity=".18" stroke="${OL}" stroke-width="2"/><circle cx="71.5" cy="60" r="10" fill="#bfe6ff" fill-opacity=".18" stroke="${OL}" stroke-width="2"/><path d="M58.5 58.5 Q60 56.5 61.5 58.5" stroke="${OL}" stroke-width="2" fill="none"/><path d="M41 54.5 l3 -2" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><path d="M64 54.5 l3 -2" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>` : "";
    const sc = o.sc, chonk = 1 + (w - 1) * .08;
    // outfits are drawn for the sitting torso; on the standing/lying body they're mapped onto its side and clipped to it
    let body = P.body;
    if (pose === "sit") body += o.outfit || "";
    else if (o.outfit) body = body.replace('<g class="dx-outfit" clip-path="url(#' + P.clip + ')"></g>', `<g class="dx-outfit" clip-path="url(#${P.clip})"><g transform="${P.outfitMap}">${o.outfit}</g></g>`);
    const neck = o.neck || "", headT = P.head ? ` transform="${P.head}"` : "";
    const headG = `<g${headT}><g transform="translate(60 0) scale(${chonk} 1) translate(-60 0)">${neck ? `<g class="dx-neck">${neck}</g>` : ""}<g class="dx-head">${drawHead(u, o)}${glasses}${o.front || ""}</g></g></g>`;
    const inner = `<ellipse cx="60" cy="109" rx="${f1(P.shadow * sc)}" ry="3.6" fill="#000" opacity=".12"/>
      <g transform="translate(60 109) scale(${sc}) translate(-60 -109)">${o.back || ""}${P.back}${P.body === body ? P.body : body}${P.legs}</g>${headG}${o.over || ""}`;
    return `<defs><radialGradient id="${u}iris" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#9a6a24"/><stop offset=".32" stop-color="#b98a35"/><stop offset=".55" stop-color="#7d9a3c"/><stop offset=".8" stop-color="#3f8a45"/><stop offset="1" stop-color="#2a6436"/></radialGradient></defs>
      ${o.flip ? `<g transform="translate(120 0) scale(-1 1)">${inner}</g>` : inner}`;
  }
  const collar = () => `<path d="M43 80.5 Q60 89 77 80.5" stroke="${OL}" stroke-width="6.4" fill="none" stroke-linecap="round"/><path d="M43 80.5 Q60 89 77 80.5" stroke="#26365e" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <path d="M60 85 v1.6" stroke="${OL}" stroke-width="1.2"/><rect x="56.4" y="86.4" width="7.2" height="9" rx="2.6" fill="#c9d1db" stroke="${OL}" stroke-width="1.3"/><path d="M58.4 89.6 h3.2 M58.4 92.2 h3.2" stroke="#7d8794" stroke-width=".9"/><path d="M57.6 88 l1.4 -.6" stroke="#fff" stroke-width=".9" stroke-linecap="round"/>`;
  const scarf = `<path d="M41 79 Q60 91 79 79 L80 85 Q60 96 40 85Z" fill="#4f8dff" ${ln}/><path d="M70 88 L76 103 L68 101 L65 90Z" fill="#4f8dff" ${ln}/><path d="M45 84 Q60 92 75 84" stroke="#a9c8ff" stroke-width="1.4" fill="none"/>`;
  const headband = `<path d="M33.5 49 Q60 41 86.5 49 L86 55 Q60 47 34 55Z" fill="#c0392b" ${ln}/><path d="M85 50 Q95 47 101 53 Q94 54 91 52 Q97 58 99 64 Q91 59 85 54Z" fill="#c0392b" ${ln}/><circle cx="60" cy="47.6" r="3" fill="#fff" stroke="${OL}" stroke-width="1.2"/>`;
  const bandage = `<g transform="rotate(-20 79 73)"><rect x="73" y="70.6" width="12" height="5" rx="2" fill="#f4e1c1" stroke="${OL}" stroke-width="1.2"/><path d="M78 71.4 v3.4 M80 71.4 v3.4" stroke="#c9a77a" stroke-width=".9"/></g>`;
  const goggles = `<path d="M37 45 Q60 39 83 45" stroke="${OL}" stroke-width="5.4" fill="none"/><path d="M37 45 Q60 39 83 45" stroke="#6b6f7d" stroke-width="3" fill="none"/>
    <rect x="44" y="37" width="13" height="10" rx="5" fill="#9be7ff" ${ln}/><rect x="63" y="37" width="13" height="10" rx="5" fill="#9be7ff" ${ln}/><path d="M47 40 l3 -1.6 M66 40 l3 -1.6" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>`;
  const coat = `<path d="M41.5 86 Q41 77 50 76.5 L70 76.5 Q79 77 78.5 86 Q80 104 70 108 L50 108 Q40 104 41.5 86Z" fill="#fff" ${ln}/><path d="M51 76.6 L60 95 L69 76.6Z" fill="${FUR_L}" stroke="${OL}" stroke-width="1.6" stroke-linejoin="round"/><path d="M51 76.6 L56 88 L49.5 86Z M69 76.6 L64 88 L70.5 86Z" fill="#eef3ff" stroke="${OL}" stroke-width="1.4" stroke-linejoin="round"/><path d="M60 95 V107" stroke="${OL}" stroke-width="1.2"/><circle cx="62.6" cy="99" r="1" fill="${OL}"/><circle cx="62.6" cy="104" r="1" fill="${OL}"/><path d="M69 93 h5 v4 h-5Z" fill="none" stroke="${OL}" stroke-width="1.2"/><path d="M70.5 93 v-3" stroke="#4f8dff" stroke-width="1.8" stroke-linecap="round"/>`;
  const cap = `<path d="M42 30 L60 22 L78 30 L60 38Z" fill="#2d2f3a" ${ln}/><path d="M48 33 L48 39 Q60 44 72 39 L72 33" fill="#2d2f3a" ${ln}/><circle cx="60" cy="30" r="1.6" fill="#ffd84a"/><path d="M60 30 L74 33 L75 43" stroke="#ffd84a" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="75" cy="44.5" r="2" fill="#ffd84a" stroke="${OL}" stroke-width=".9"/>`;
  const yarn = `<circle cx="22" cy="100" r="8.5" fill="#4f8dff" ${ln}/><path d="M15 97 Q22 92 29 99 M16 103 Q23 97 29 104 M19 93 Q24 100 21 108" stroke="#2c5fc4" stroke-width="1.3" fill="none"/><path d="M29 104 Q36 110 44 106" stroke="#4f8dff" stroke-width="1.6" fill="none"/>`;
  const flask = `<path d="M17 84 h8 v6 l7 13 Q33 108 28 108 h-14 Q9 108 10 103 l7 -13Z" fill="#fff" fill-opacity=".85" ${ln}/><path d="M13 99 h16 l2.4 4.4 Q32 106.5 28 106.5 h-14 Q10.5 106.5 11.4 103Z" fill="#7be08f"/><circle cx="19" cy="102" r="1.3" fill="#fff"/><circle cx="23" cy="98" r="1" fill="#fff" opacity=".8"/>`;
  const book = `<path d="M90 98 h20 v9 h-20Z" fill="#4f8dff" ${ln}/><path d="M92 91 h18 v7 h-18Z" fill="#e8455f" ${ln}/><path d="M93 101 h14 M95 94 h12" stroke="#fff" stroke-width="1.2" opacity=".85"/>`;
  // Each form's own gear, by wardrobe slot. Anything bought in the shop and worn replaces the gear in that slot.
  const zzz = `<text x="86" y="40" font-family="sans-serif" font-weight="800" font-size="11" fill="#7a8bd8">z</text><text x="94" y="30" font-family="sans-serif" font-weight="800" font-size="8" fill="#7a8bd8">z</text>`;
  const FORM_GEAR = [
    { sc: .74, eyes: "closed", tail: "down", over: zzz },
    { sc: .8, neck: () => collar() },
    { sc: .86, neck: () => collar(), held: () => yarn },
    { sc: .92, neck: () => collar(), hat: () => headband, extra: () => bandage },
    { sc: .96, neck: () => collar(), hat: () => goggles, extra: () => bandage, held: () => flask },
    { sc: 1, glasses: true, outfit: () => coat, hat: () => cap, held: () => book }
  ];
  // eq: { hat, outfit, face, neck, held } item ids; defaults to what's saved as worn
  function pinnedBadge(E) {   // the badge on his chest, with its sparkle
    const W = window.BioWardrobe, it = W && E.badge && E.badge !== "none" && W.byId[E.badge];
    return it && W.badgeArt ? `<g transform="translate(69 88) scale(.64)">${W.badgeArt(it, completions(it.earn))}</g>` : "";
  }
  function art(k, eq, look) {
    const u = "dx" + (++uidN), g = FORM_GEAR[k], W = window.BioWardrobe, E = eq || load().equip || {};
    // per slot: an item id = wear it · "none" = nothing (even the form's own gear) · unset = the form's own gear
    const worn = slot => E[slot] === "none" ? "" : W && E[slot] && W.byId[E[slot]] ? W.byId[E[slot]].svg : null;
    const pick = slot => { const w = worn(slot); return w !== null ? w : g[slot] ? g[slot]() : "" };
    const face = worn("face");
    const L = look || {};
    const svg = kitty(u, { sc: g.sc, eyes: L.eyes || g.eyes || "open", tail: g.tail, glasses: face === null && !!g.glasses, pose: L.pose, flip: L.flip, w: L.w || load().weight || 1,
      outfit: pick("outfit"), neck: pick("neck") + pinnedBadge(E), front: (face || "") + (g.extra ? g.extra() : "") + pick("hat"), over: L.pose === "stand" || L.pose === "lie" ? (g.over || "") : pick("held") + (g.over || "") });
    return `<svg viewBox="0 0 120 120" aria-hidden="true">${svg}</svg>`;
  }

  // ===== Styles
  const CSS = `
.bb-dock{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:45;width:64px;height:64px;border-radius:50%;border:0;padding:0;cursor:pointer;background:var(--paper,#fff);box-shadow:0 6px 22px rgba(0,0,0,.18);display:grid;place-items:center;-webkit-tap-highlight-color:transparent}
.bb-dock:hover{transform:scale(1.05)} .bb-dock{transition:transform .2s}
.bb-dock .bb-ring{position:absolute;inset:0;transform:rotate(-90deg)}
.bb-dock .bb-ring circle{fill:none;stroke-width:4}
.bb-dock .bb-ring .t{stroke:var(--fill,#e8e8ed)} .bb-dock .bb-ring .f{stroke:#34c759;stroke-linecap:round;transition:stroke-dashoffset .6s ease}
.bb-dock .bb-pic{width:50px;height:50px;animation:bbIdle 3s ease-in-out infinite}
.bb-dock .bb-lv{position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);font:700 10.5px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;background:#1d1d1f;color:#fff;border-radius:980px;padding:2px 7px;white-space:nowrap;font-variant-numeric:tabular-nums}
[data-theme="dark"] .bb-dock .bb-lv{background:#f5f5f7;color:#1d1d1f}
.bb-dock.hop .bb-pic{animation:bbHop .6s cubic-bezier(.3,1.6,.5,1)}
.bb-plus{position:fixed;z-index:46;display:flex;flex-direction:column;align-items:flex-end;gap:2px;font:700 15px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;color:#248a3d;pointer-events:none;animation:bbPlus 1.5s ease forwards;white-space:nowrap;text-align:right;text-shadow:0 1px 0 rgba(255,255,255,.8)}
.bb-plus small{font:600 11.5px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;color:#6e6e73;display:flex;align-items:center;gap:4px}
.bb-plus.hot{color:#ff6b00} .bb-plus.cool{color:#6e6e73}
.bb-plus svg,.bb-streak svg,.bb-stats .fl svg{width:.9em;height:1em;vertical-align:-1px}
[data-theme="dark"] .bb-plus{text-shadow:none} [data-theme="dark"] .bb-plus small{color:#98989f}
.bb-streak{position:absolute;top:-8px;left:-10px;display:inline-flex;align-items:center;gap:1px;font:800 11px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;color:#fff;background:linear-gradient(180deg,#ff9f0a,#ff6b00);border-radius:980px;padding:2px 6px 2px 5px;box-shadow:0 2px 6px rgba(255,107,0,.4);font-variant-numeric:tabular-nums}
.bb-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 12px}
.bb-stats div{background:var(--c-fill);border-radius:12px;padding:8px 4px;display:flex;flex-direction:column;align-items:center}
.bb-stats b{font:700 20px -apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif;font-variant-numeric:tabular-nums;display:flex;align-items:center;gap:2px}
.bb-stats .fl{color:#ff6b00;font-style:normal}
.bb-stats span{font-size:11.5px;color:var(--c-muted)}
.bb-how{text-align:left;background:var(--c-fill);border-radius:14px;padding:10px 14px;margin:0 0 14px;font-size:13.5px}
.bb-how summary{cursor:pointer;font-weight:600;color:var(--c-acc)}
.bb-how p{margin:8px 0 0}
.bb-tiers{list-style:none;margin:8px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:6px}
.bb-tiers li{display:flex;align-items:center;gap:8px;font-variant-numeric:tabular-nums}
.xpb{display:inline-flex;align-items:center;font:700 10.5px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;letter-spacing:.01em;border-radius:980px;padding:2px 8px;text-transform:none;white-space:nowrap}
.xpb.t-easy{background:rgba(52,199,89,.16);color:#1f7a37} .xpb.t-medium{background:rgba(10,132,255,.14);color:#0060c7}
.xpb.t-hard{background:rgba(255,159,10,.18);color:#b25000} .xpb.t-expert{background:rgba(255,55,95,.15);color:#c4153f}
[data-theme="dark"] .xpb.t-easy{color:#30d158} [data-theme="dark"] .xpb.t-medium{color:#409cff} [data-theme="dark"] .xpb.t-hard{color:#ffb340} [data-theme="dark"] .xpb.t-expert{color:#ff6482}
[data-theme="dark"] .bb-plus{color:#30d158}
body.bb-on{padding-bottom:96px}
.bb-veil{position:fixed;inset:0;z-index:110;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;padding:16px;animation:bbFade .2s ease}
.bb-card{--c-bg:#fff;--c-ink:#1d1d1f;--c-muted:#6e6e73;--c-fill:#f2f2f7;--c-acc:#0071e3;width:min(400px,100%);max-height:90vh;overflow:auto;background:var(--c-bg);color:var(--c-ink);border-radius:24px;box-shadow:0 24px 80px rgba(0,0,0,.3);padding:22px 22px 18px;font:15px/1.45 -apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif;letter-spacing:-.015em;text-align:center;animation:bbUp .3s cubic-bezier(.2,.8,.2,1)}
[data-theme="dark"] .bb-card{--c-bg:#1c1c1e;--c-ink:#f5f5f7;--c-muted:#98989f;--c-fill:#2c2c2e;--c-acc:#0a84ff}
.bb-card .bb-big{width:170px;height:170px;margin:0 auto -4px;animation:bbIdle 3s ease-in-out infinite}
.bb-card h3{margin:0;font:700 26px -apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif;letter-spacing:-.03em}
.bb-card .bb-sub{color:var(--c-muted);margin:2px 0 12px;font-size:14px}
.bb-bar{height:8px;border-radius:980px;background:var(--c-fill);overflow:hidden;margin:4px 0 6px}
.bb-bar i{display:block;height:100%;background:linear-gradient(90deg,#34c759,#30d158);border-radius:inherit;transition:width .6s}
.bb-next{font-size:13.5px;color:var(--c-muted);margin:0 0 14px;font-variant-numeric:tabular-nums}
.bb-fact{text-align:left;background:var(--c-fill);border-radius:14px;padding:12px 14px;font-size:14px;margin:0 0 14px}
.bb-fact b{display:block;font-size:12px;color:var(--c-muted);font-weight:600;margin-bottom:2px}
.bb-line{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin:0 0 14px}
.bb-line div{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:10.5px;color:var(--c-muted)}
.bb-line svg{width:46px;height:46px}
.bb-line .lock svg{filter:brightness(0);opacity:.18}
[data-theme="dark"] .bb-line .lock svg{filter:brightness(0) invert(1);opacity:.18}
.bb-line .cur{color:var(--c-ink);font-weight:600}
.bb-acts{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}
.bb-acts button{font-weight:500;font-size:15px;font-family:inherit;border:0;border-radius:980px;padding:9px 16px;cursor:pointer;background:var(--c-fill);color:var(--c-acc)}
.bb-acts .pri{background:var(--c-acc);color:#fff}
/* Evolution */
.bb-evo{position:fixed;inset:0;z-index:120;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:radial-gradient(circle at 50% 45%,#2b3b6b 0%,#0b0f1e 70%);color:#fff;text-align:center;padding:24px;font:17px/1.4 -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;animation:bbFade .3s ease}
.bb-evo .stage{position:relative;width:220px;height:220px}
.bb-evo .stage svg{position:absolute;inset:0;width:100%;height:100%}
.bb-evo .old{animation:bbFlickOld 2.6s ease-in forwards}
.bb-evo .new{opacity:0;animation:bbFlickNew 2.6s ease-in forwards}
.bb-evo .glow{position:absolute;inset:-30px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.9) 0%,rgba(255,255,255,0) 60%);opacity:0;animation:bbGlow 2.6s ease-in forwards}
.bb-evo.done .new{opacity:1;animation:bbIdle 3s ease-in-out infinite} .bb-evo.done .old,.bb-evo.done .glow{display:none}
.bb-evo h2{margin:0;font:700 28px -apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif;letter-spacing:-.03em}
.bb-evo p{margin:0;max-width:34ch;opacity:.9;font-size:15px}
.bb-evo .msg{min-height:1.4em;font-size:18px;opacity:.95}
.bb-evo button{margin-top:6px;font-weight:600;font-size:17px;font-family:inherit;border:0;border-radius:980px;padding:12px 26px;background:#fff;color:#0b0f1e;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .4s}
.bb-evo.done button{opacity:1;pointer-events:auto}
.bb-evo .reveal{opacity:0;transition:opacity .5s} .bb-evo.done .reveal{opacity:1}
.bb-leaf{position:fixed;z-index:121;width:16px;height:10px;border-radius:0 100% 0 100%;pointer-events:none;animation:bbBurst 1.4s ease-out forwards}
@media (max-width:560px){.bb-dock{width:50px;height:50px;right:max(10px,env(safe-area-inset-right,0px));bottom:max(10px,env(safe-area-inset-bottom,0px))}.bb-dock .bb-pic{width:38px;height:38px}.bb-dock .bb-lv{font-size:9.5px;padding:1px 6px;bottom:-5px}}
.bb-say{position:fixed;z-index:47;pointer-events:none;font:800 16px -apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif;color:#1d1d1f;background:#fff;border:2.5px solid #3a2a1e;border-radius:16px;padding:5px 11px;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.15);transform-origin:100% 100%;animation:bbSay 1.5s cubic-bezier(.3,1.6,.5,1) forwards}
.bb-say::after{content:"";position:absolute;right:-9px;bottom:6px;border:7px solid transparent;border-left:10px solid #3a2a1e;border-right:0}
.bb-say::before{content:"";position:absolute;right:-5.5px;bottom:8px;border:5px solid transparent;border-left:7px solid #fff;border-right:0;z-index:1}
[data-theme="dark"] .bb-say{background:#fff;color:#1d1d1f}
.bb-yarn{position:fixed;z-index:47;width:26px;height:26px;pointer-events:none;animation:bbDrop 1.6s cubic-bezier(.3,0,.6,1) forwards}
.bb-yarn svg{width:100%;height:100%;animation:bbRoll 1.6s linear forwards}
.bb-dock.sad .bb-pic{animation:bbSad .5s ease}
@keyframes bbSay{0%{opacity:0;transform:scale(.3) rotate(-8deg)}18%{opacity:1;transform:scale(1.12) rotate(3deg)}30%{transform:scale(1) rotate(-2deg)}42%{transform:rotate(2deg)}54%{transform:rotate(0)}82%{opacity:1}100%{opacity:0;transform:translateY(-8px)}}
@keyframes bbDrop{0%{transform:translate(0,0)}30%{transform:translate(-6px,var(--fall))}45%{transform:translate(-14px,calc(var(--fall) - 14px))}60%{transform:translate(-22px,var(--fall))}70%{transform:translate(-28px,calc(var(--fall) - 5px))}80%{transform:translate(-34px,var(--fall));opacity:1}100%{transform:translate(-70px,var(--fall));opacity:0}}
@keyframes bbRoll{to{transform:rotate(-420deg)}}
@keyframes bbSad{0%,100%{transform:none}25%{transform:translateX(-3px) rotate(-6deg)}50%{transform:translateX(3px) rotate(5deg)}75%{transform:translateX(-2px) rotate(-3deg)}}
@keyframes bbIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes bbHop{0%{transform:translateY(0) scale(1)}35%{transform:translateY(-10px) scale(1.08,.95)}70%{transform:translateY(0) scale(.96,1.04)}100%{transform:none}}
@keyframes bbPlus{0%{opacity:0;transform:translateY(0)}12%{opacity:1}75%{opacity:1}100%{opacity:0;transform:translateY(-40px)}}
@keyframes bbFade{from{opacity:0}} @keyframes bbUp{from{opacity:0;transform:translateY(20px) scale(.97)}}
@keyframes bbFlickOld{0%,12%{opacity:1;filter:none}20%{opacity:1;filter:brightness(0) invert(1)}30%{opacity:0}38%{opacity:1}46%{opacity:0}52%{opacity:1}58%{opacity:0}62%{opacity:1}66%{opacity:0}69%{opacity:1}72%,100%{opacity:0;filter:brightness(0) invert(1)}}
@keyframes bbFlickNew{0%,28%{opacity:0;filter:brightness(0) invert(1)}30%{opacity:1}38%{opacity:0}46%{opacity:1}52%{opacity:0}58%{opacity:1}62%{opacity:0}66%{opacity:1}69%{opacity:0}72%,86%{opacity:1;filter:brightness(0) invert(1)}100%{opacity:1;filter:none}}
@keyframes bbGlow{0%,60%{opacity:0;transform:scale(.6)}80%{opacity:1;transform:scale(1.2)}100%{opacity:0;transform:scale(1.5)}}
@keyframes bbBurst{0%{opacity:1;transform:translate(0,0) rotate(0)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(var(--r))}}
.coin,.sh-tile .coin{width:1em;height:1em;vertical-align:-.14em;margin-right:2px;flex:none}
.bb-stats{grid-template-columns:repeat(4,1fr)!important}
.bb-stats .gold b{color:#b07d0f;display:flex;align-items:center;gap:2px} [data-theme="dark"] .bb-stats .gold b{color:#ffcf33}
.bb-plus .gc{display:inline-flex;align-items:center;color:#b07d0f;margin-left:4px} [data-theme="dark"] .bb-plus .gc{color:#ffcf33}
.bb-plus.buy{color:#b07d0f}
.evo-gold{display:flex!important;align-items:center;justify-content:center;gap:4px;margin:8px 0 0!important;font-weight:700;color:#ffd84a;opacity:1!important}
.bb-shopbtn{width:100%;display:flex;align-items:center;gap:12px;text-align:left;border:0;cursor:pointer;background:linear-gradient(135deg,#fff4d6,#ffe7b0);border-radius:16px;padding:12px 14px;margin:0 0 14px;color:#1d1d1f;font-family:inherit}
[data-theme="dark"] .bb-shopbtn{background:linear-gradient(135deg,#3a2f12,#4a3a12);color:#f5f5f7}
.bb-shopbtn .ic{width:38px;height:38px;border-radius:11px;background:#ffcf33;display:grid;place-items:center;color:#5a3c00;flex:none}
.bb-shopbtn .ic svg{width:22px;height:22px}
.bb-shopbtn b{display:block;font-size:16px} .bb-shopbtn small{display:block;font-size:12.5px;opacity:.75}
.bb-shopbtn .go{margin-left:auto;font-size:24px;opacity:.5}
.bb-shop{width:min(520px,100%);text-align:left;padding:0 0 16px}
.sh-head{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:10px;padding:14px 18px 10px;background:color-mix(in srgb,var(--c-bg) 88%,transparent);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px)}
.sh-head h3{font-size:20px!important;margin:0;flex:1}
.sh-gold{display:inline-flex;align-items:center;gap:3px;font:700 15px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;background:#fff4d6;color:#8a5a00;border-radius:980px;padding:5px 11px;font-variant-numeric:tabular-nums}
[data-theme="dark"] .sh-gold{background:#3a2f12;color:#ffcf33}
.sh-done{border:0;background:none;color:var(--c-acc);font:600 17px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;cursor:pointer}
.sh-stage{height:190px;display:grid;place-items:center;background:radial-gradient(circle at 50% 60%,#fff6dc 0%,var(--c-fill) 70%);margin:0 16px;border-radius:18px}
[data-theme="dark"] .sh-stage{background:radial-gradient(circle at 50% 60%,#3a3420 0%,var(--c-fill) 70%)}
.sh-stage svg{width:180px;height:180px}
.sh-bar{display:flex;align-items:center;gap:10px;min-height:56px;margin:10px 16px 4px}
.sh-sel{flex:1;min-width:0;display:flex;flex-direction:column} .sh-sel b{font-size:16px} .sh-sel span{font-size:13px;color:var(--c-muted);display:flex;align-items:center;gap:2px}
.sh-hint{flex:1;margin:0;color:var(--c-muted);font-size:14px;text-align:center}
.sh-act{border:0;border-radius:980px;background:var(--c-acc);color:#fff;font:600 15px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;padding:10px 18px;cursor:pointer;white-space:nowrap}
.sh-act.ghost{background:var(--c-fill);color:var(--c-acc)} .sh-act:disabled{background:var(--c-fill);color:var(--c-muted);cursor:default}
.sh-tabs{display:grid;grid-template-columns:repeat(var(--tabs,3),1fr);gap:2px;background:var(--c-fill);border-radius:9px;padding:2px;margin:6px 16px 4px}
.sh-tabs button{border:0;background:transparent;color:inherit;border-radius:7px;padding:7px 4px;font:500 14px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;cursor:pointer}
.sh-tabs button[aria-selected="true"]{background:#fff;box-shadow:0 3px 8px rgba(0,0,0,.12)} [data-theme="dark"] .sh-tabs button[aria-selected="true"]{background:#636366}
.sh-cap{margin:14px 18px 6px;font-size:13px;color:var(--c-muted);text-transform:uppercase;letter-spacing:.02em}
.sh-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 16px}
.sh-tile{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;border:2px solid transparent;background:var(--c-fill);border-radius:16px;padding:8px 6px 9px;cursor:pointer;color:inherit;font-family:inherit;text-align:center}
.sh-tile>svg{width:100%;height:58px}
.sh-tile b{font-size:12.5px;line-height:1.2;font-weight:600}
.sh-tile .tag{font-size:10.5px;color:var(--c-muted)}
.sh-tile .pr{display:inline-flex;align-items:center;font:700 12px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;color:#8a5a00;margin-top:2px} [data-theme="dark"] .sh-tile .pr{color:#ffcf33}
.sh-tile.sel{border-color:var(--c-acc);background:color-mix(in srgb,var(--c-acc) 10%,var(--c-fill))}
.sh-tile.on .pr{color:#248a3d} [data-theme="dark"] .sh-tile.on .pr{color:#30d158}
.sh-tile.on::after{content:"✓";position:absolute;top:6px;right:8px;font-weight:800;color:#248a3d}
.sh-note{margin:16px 18px 0;font-size:12.5px;color:var(--c-muted)}
@media (max-width:420px){.sh-grid{grid-template-columns:repeat(3,1fr)}.sh-tile>svg{height:50px}}
.sh-tabs.pal{margin:2px 16px 10px;--tabs:4}
.bc-case{margin:4px 16px 12px;border-radius:20px;padding:14px 14px 16px;background:linear-gradient(160deg,#c62828,#8e1b1b);box-shadow:inset 0 2px 0 rgba(255,255,255,.25),0 6px 18px rgba(142,27,27,.3);color:#fff}
.bc-top{display:flex;align-items:center;justify-content:space-between;font:700 15px -apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif;margin:0 4px 10px;letter-spacing:.02em}
.bc-top small{font:600 12.5px -apple-system,sans-serif;opacity:.85}
.bc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:#1d1d1f;border-radius:14px;padding:10px;box-shadow:inset 0 3px 8px rgba(0,0,0,.6)}
.bc-slot{aspect-ratio:1;border:0;border-radius:12px;background:radial-gradient(circle at 50% 40%,#3a3a3c,#2c2c2e);display:grid;place-items:center;cursor:pointer;padding:6px;position:relative}
.bc-slot svg{width:100%;height:100%;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))}
.bc-n{position:absolute;bottom:2px;right:4px;font:700 10.5px -apple-system,sans-serif;font-style:normal;color:#ffd60a}
.bc-tier{font-style:normal;font-size:11.5px;font-weight:700;border-radius:999px;padding:2px 8px;margin-left:4px;vertical-align:2px;background:#e5e5ea;color:#3a3a3c}
.bc-tier.t1{background:#e3f2ff;color:#0a64c2}.bc-tier.t2{background:#fff4c2;color:#a05a00}.bc-tier.t3{background:linear-gradient(90deg,#ffe066,#ffb300);color:#5a3300}.bc-tier.t4{background:linear-gradient(90deg,#ff375f,#ff9f0a,#ffd60a,#34c759,#0a84ff,#bf5af2);color:#fff;text-shadow:0 1px 1px rgba(0,0,0,.3)}
.bc-slot.lock svg{filter:brightness(0) opacity(.35)}.bc-slot.lock::after{content:"?";position:absolute;color:#8e8e93;font:700 18px -apple-system,sans-serif}
.bc-slot.sel{outline:3px solid #ffd60a;outline-offset:1px}.bc-slot.worn::before{content:"📌";position:absolute;top:-4px;right:-2px;font-size:13px}
.bc-detail{margin:0 16px 14px;background:var(--c-fill);border-radius:16px;padding:12px 14px;display:flex;gap:12px;align-items:center}
.bc-detail svg{width:58px;height:58px;flex:none}.bc-detail b{display:block;font-size:16px}.bc-detail span{font-size:13.5px;opacity:.75}
.bc-detail .sh-act{margin-top:8px}.bc-detail .bc-txt{flex:1}
.bb-badge-won{position:fixed;inset:0;z-index:125;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:radial-gradient(circle at 50% 42%,#4a1414 0%,#0b0f1e 72%);color:#fff;text-align:center;padding:24px;animation:bbFade .3s ease}
.bb-badge-won svg.big{width:150px;height:150px;animation:bcSpin 1.1s cubic-bezier(.2,.9,.3,1.2) both;filter:drop-shadow(0 0 22px rgba(255,214,10,.55))}
.bb-badge-won h3{margin:0;font:800 26px -apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif}.bb-badge-won p{margin:0;opacity:.85;font-size:15px;max-width:340px}
.bb-badge-won .row{display:flex;gap:10px;margin-top:6px}.bb-badge-won button{border:0;border-radius:980px;padding:11px 20px;font:600 16px -apple-system,sans-serif;cursor:pointer;background:#fff;color:#0b0f1e}.bb-badge-won button.ghost{background:rgba(255,255,255,.16);color:#fff}
@keyframes bcSpin{from{transform:rotateY(540deg) scale(.2);opacity:0}to{transform:none;opacity:1}}
.sh-tabs.sub{margin-top:4px}
.sh-tile .cl-ic{display:grid;place-items:center;height:58px;color:var(--c-muted)} .sh-tile .cl-ic svg{width:30px;height:30px}
.sh-tile.cl.on{border-color:#34c759;background:color-mix(in srgb,#34c759 12%,var(--c-fill))}
.sh-tile.cl.on::after{content:"✓";position:absolute;top:6px;right:8px;font-weight:800;color:#248a3d}
.cl-empty{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;background:var(--c-fill);border-radius:16px;padding:16px;margin:6px 16px 4px}
.cl-empty span{font-size:13.5px;color:var(--c-muted)}
.cl-weight{margin:4px 16px 10px;background:var(--c-fill);border-radius:16px;padding:12px 14px}
.cl-wtop{display:flex;justify-content:space-between;align-items:baseline;font-size:15px}.cl-wtop span{color:var(--c-acc);font-weight:600}
.cl-wrow{display:flex;align-items:center;gap:10px;margin:8px 0 6px;font-size:20px}.cl-wrow input{flex:1;accent-color:var(--c-acc)}
.cl-wbtns{display:flex;gap:6px;flex-wrap:wrap}.cl-wbtns button{border:0;border-radius:980px;padding:6px 12px;background:var(--c-bg,#fff);color:var(--c-acc);font:600 13px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;cursor:pointer}
.cl-reset{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:16px 16px 0}
.pal-prog{text-align:center;padding:0 22px}
.bb-shop.still{animation:none}
/* Study pal: Dexter beside the question, playing with yarn */
.bb-pal{position:fixed;left:0;top:0;z-index:58;width:var(--ps,72px);height:var(--ps,72px);border:0;padding:0;margin:0;background:none;cursor:pointer;transition:transform .55s cubic-bezier(.34,1.3,.5,1),opacity .3s;-webkit-tap-highlight-color:transparent}
.bb-palon .bb-dock{display:none}
.bb-pal,.bb-dock{touch-action:none;-webkit-user-select:none;user-select:none;-webkit-user-drag:none;-webkit-touch-callout:none}
.bb-pal.drag,.bb-dock.drag{transition:none;cursor:grabbing;z-index:130}
.bb-pal.drag .bb-palart{transform:translateY(-6px) scale(1.1) rotate(-5deg);filter:drop-shadow(0 12px 14px rgba(0,0,0,.22))}
.bb-dock.drag{transform:scale(1.1);box-shadow:0 14px 30px rgba(0,0,0,.25)}
.bb-spot{margin:14px 0;padding:12px 14px;border-radius:14px;background:var(--c-fill);text-align:left;font-size:14px;line-height:1.4}
.bb-spot b{display:block;font-size:15px}.bb-spot small{display:block;opacity:.7;margin-top:2px}
.bb-spot button{margin-top:8px;border:0;border-radius:980px;padding:7px 14px;background:var(--c-acc);color:#fff;font:600 14px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;cursor:pointer}
.bb-palon.bb-on{padding-bottom:110px}
.bb-pal .bb-palart{position:absolute;inset:0;transform-origin:50% 92%}
.bb-pal .bb-palart svg{width:100%;height:100%;filter:drop-shadow(0 4px 8px rgba(0,0,0,.18))}
.bb-pal .bb-toy{position:absolute;z-index:1;pointer-events:none}
.bb-pal .bb-toy svg{display:block;width:100%;height:100%}
.bb-pal .bb-boxfront{position:absolute;z-index:2;left:2%;right:2%;bottom:-3%;height:40%}
.bb-pal .bb-boxfront svg{display:block;width:100%;height:100%}
.act-yarn .bb-toy{width:27%;height:27%;left:2%;bottom:3%;animation:bbBat 2.6s ease-in-out infinite}
.act-yarn .bb-palart{animation:bbSway 2.6s ease-in-out infinite}
.act-butterfly .bb-toy{width:30%;height:24%;left:34%;top:-6%;animation:bbFly 4.2s ease-in-out infinite}
.act-butterfly .bb-toy .wl{transform-box:fill-box;transform-origin:right center;animation:bbFlap .16s ease-in-out infinite alternate}
.act-butterfly .bb-toy .wr{transform-box:fill-box;transform-origin:left center;animation:bbFlap .16s ease-in-out infinite alternate}
.act-butterfly .bb-palart,.act-leaf .bb-palart{animation:bbWatch 4.2s ease-in-out infinite}
.act-mouse .bb-toy{width:32%;height:19%;left:-14%;bottom:0;animation:bbScamper 3.4s ease-in-out infinite}
.act-mouse .bb-palart{animation:bbCrouch 3.4s ease-in-out infinite}
.act-laser .bb-toy{width:12%;height:12%;left:14%;bottom:5%;animation:bbLaser 2.4s steps(1) infinite}
.act-laser .bb-palart{animation:bbWiggle 1.2s ease-in-out infinite}
.act-feather .bb-toy{width:22%;height:56%;left:-2%;top:-44%;transform-origin:50% 0;animation:bbSwing 1.8s ease-in-out infinite}
.act-feather .bb-palart{animation:bbSwat 1.8s ease-in-out infinite}
.act-leaf .bb-toy{width:26%;height:18%;left:36%;top:-24%;animation:bbLeafFall 4.2s ease-in infinite}
.act-box .bb-palart{animation:bbPeek 3s ease-in-out infinite}
.act-tail .bb-palart{animation:bbTail 3.2s ease-in-out infinite}
.act-nap .bb-palart{animation:bbBreathe 3.2s ease-in-out infinite}
.act-nap .bb-toy{right:-4%;top:-14%;display:flex;gap:1px;font:800 13px -apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif;color:#7a8bd8}
.act-nap .bb-toy .zz{display:inline-block;animation:bbZ 2.4s ease-in-out infinite} .act-nap .bb-toy .zz:nth-child(2){animation-delay:.4s;font-size:1.15em} .act-nap .bb-toy .zz:nth-child(3){animation-delay:.8s;font-size:1.35em}
@keyframes bbFly{0%,100%{transform:translate(-140%,40%) rotate(-10deg)}22%{transform:translate(-50%,-70%) rotate(8deg)}48%{transform:translate(95%,-30%) rotate(-6deg)}68%{transform:translate(45%,70%) rotate(10deg)}84%{transform:translate(-70%,15%) rotate(-4deg)}}
@keyframes bbFlap{from{transform:scaleX(1)}to{transform:scaleX(.25)}}
@keyframes bbWatch{0%,100%{transform:rotate(-5deg)}22%{transform:rotate(-2deg) translateY(-2%)}48%{transform:rotate(6deg)}60%{transform:translateY(-12%) rotate(4deg)}68%{transform:rotate(3deg)}}
@keyframes bbScamper{0%{transform:translateX(0) scaleX(-1)}40%{transform:translateX(-80%) scaleX(-1)}46%{transform:translateX(-80%) scaleX(1)}86%{transform:translateX(30%) scaleX(1)}92%{transform:translateX(30%) scaleX(-1)}100%{transform:translateX(0) scaleX(-1)}}
@keyframes bbCrouch{0%,30%,100%{transform:none}38%{transform:scaleY(.9) translateY(5%)}46%{transform:translate(-9%,-11%) rotate(-9deg)}56%{transform:none}}
@keyframes bbLaser{0%{transform:translate(0,0)}20%{transform:translate(-180%,-140%)}40%{transform:translate(160%,-50%)}60%{transform:translate(-90%,30%)}80%{transform:translate(300%,10%)}}
@keyframes bbWiggle{0%,100%{transform:rotate(0)}20%{transform:rotate(-3deg) scaleY(.96)}40%{transform:rotate(3deg) scaleY(.96)}60%{transform:translate(4%,-8%) rotate(5deg)}80%{transform:none}}
@keyframes bbSwing{0%,100%{transform:rotate(-26deg)}50%{transform:rotate(22deg)}}
@keyframes bbSwat{0%,100%{transform:none}40%{transform:translateY(-6%) rotate(-10deg)}55%{transform:translateY(-2%) rotate(-4deg)}}
@keyframes bbLeafFall{0%{transform:translate(40%,-60%) rotate(0);opacity:0}10%{opacity:1}40%{transform:translate(-60%,120%) rotate(120deg)}70%{transform:translate(30%,300%) rotate(260deg);opacity:1}82%{transform:translate(0,330%) rotate(300deg);opacity:1}100%{transform:translate(0,330%) rotate(300deg);opacity:0}}
@keyframes bbPeek{0%,100%{transform:translateY(17%)}50%{transform:translateY(9%) rotate(3deg)}}
@keyframes bbTail{0%,35%,100%{transform:none}45%{transform:scaleX(-1) translateX(5%)}55%{transform:translateX(5%) rotate(6deg)}65%{transform:scaleX(-1) translateX(-5%) rotate(-6deg)}75%{transform:translateX(-3%)}}
@keyframes bbBreathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.95)}}
@keyframes bbZ{0%{transform:translateY(4px);opacity:0}30%{opacity:1}100%{transform:translateY(-10px);opacity:0}}
.bb-pal .bb-lv{position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);font:700 10.5px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;background:#1d1d1f;color:#fff;border-radius:980px;padding:2px 7px;white-space:nowrap;font-variant-numeric:tabular-nums}
[data-theme="dark"] .bb-pal .bb-lv{background:#f5f5f7;color:#1d1d1f}
.bb-pal .bb-streak{top:-4px;left:-6px}
.bb-pal:hover .bb-palart{animation-duration:1.2s}
.bb-pal.run .bb-palart{animation:bbScurry .26s ease-in-out 3}
.bb-pal.hop .bb-palart{animation:bbHop .6s cubic-bezier(.3,1.6,.5,1)}
.bb-pal.sad .bb-palart{animation:bbPalSad .7s ease}
.bb-pal.lost .bb-toy{animation:bbLost 2.4s ease forwards!important}
.bb-greeting .bb-pal,.bb-greeting .bb-dock{opacity:0;pointer-events:none}
@keyframes bbSway{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg) translateY(-1.5px)}}
@keyframes bbBat{0%,100%{transform:translateX(0) rotate(0)}35%{transform:translateX(-60%) rotate(-280deg)}50%{transform:translateX(-58%) rotate(-270deg)}80%{transform:translateX(6%) rotate(20deg)}}
@keyframes bbScurry{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-7px) rotate(-7deg)}}
@keyframes bbPalSad{0%,100%{transform:none}30%{transform:translateY(3px) scaleY(.94)}60%{transform:rotate(-5deg)}}
@keyframes bbLost{0%{transform:none;opacity:1}35%{transform:translate(-300%,40%) rotate(-560deg);opacity:0}75%{transform:translate(-120%,0) rotate(-300deg);opacity:0}100%{transform:none;opacity:1}}
/* Greeting */
.bb-greet{position:fixed;inset:auto 0 0 0;z-index:120;pointer-events:none}
.bb-greet .gwrap{position:fixed;left:50%;bottom:calc(max(16px,env(safe-area-inset-bottom,0px)) + 6px);width:min(460px,calc(100vw - 20px));display:flex;align-items:flex-end;gap:4px;pointer-events:auto;transform:translateX(-50%);animation:bbWalkIn 1.1s cubic-bezier(.2,.85,.25,1) both}
.bb-greet .gbubble{flex:1;position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:6px;background:#fff;color:#1d1d1f;border-radius:20px;padding:13px 15px;margin-bottom:34px;box-shadow:0 12px 36px rgba(0,0,0,.2);font:15px/1.4 -apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif;letter-spacing:-.012em;animation:bbBubble .45s cubic-bezier(.3,1.5,.5,1) .9s both}
.bb-greet .gbubble b{font:700 17px -apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif}
.bb-greet .gbubble::after{content:"";position:absolute;right:-9px;bottom:22px;border:9px solid transparent;border-left-color:#fff;border-right:0}
[data-theme="dark"] .bb-greet .gbubble{background:#2c2c2e;color:#f5f5f7} [data-theme="dark"] .bb-greet .gbubble::after{border-left-color:#2c2c2e}
.bb-greet .gbtn{border:0;border-radius:980px;background:#0071e3;color:#fff;font:600 14px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;padding:8px 15px;cursor:pointer}
.bb-greet .gdex{flex:none;width:128px;height:128px;border:0;padding:0;background:none;cursor:pointer;animation:bbWalkBob .28s ease-in-out 4,bbWave 1.4s ease-in-out 1.2s 2}
.bb-greet .gdex svg{width:100%;height:100%;filter:drop-shadow(0 6px 12px rgba(0,0,0,.2))}
.bb-greet.leave .gwrap{animation:bbWalkOut .55s ease-in forwards}
@keyframes bbWalkIn{from{opacity:0;transform:translateX(calc(-50% + 70vw))}to{opacity:1;transform:translateX(-50%)}}
@keyframes bbWalkOut{to{opacity:0;transform:translateX(calc(-50% + 45vw)) translateY(30px) scale(.35)}}
@keyframes bbWalkBob{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-8px) rotate(-5deg)}}
@keyframes bbWave{0%,100%{transform:rotate(0)}25%{transform:rotate(-6deg) translateY(-6px)}50%{transform:rotate(5deg)}75%{transform:rotate(-3deg) translateY(-3px)}}
@keyframes bbBubble{from{opacity:0;transform:scale(.6) translateX(30px)}to{opacity:1;transform:none}}
@media (max-width:420px){.bb-greet .gdex{width:104px;height:104px}.bb-greet .gbubble{font-size:14px}}
@media (prefers-reduced-motion:reduce){.bb-pal{transition:none}.bb-pal .bb-palart,.bb-pal .bb-toy,.bb-pal .bb-toy *,.bb-greet .gwrap,.bb-greet .gdex,.bb-greet .gbubble{animation:none!important}}
/* Dexter's body parts: pivot points */
.dx-head{transform-origin:60px 84px}.dx-tail{transform-origin:78px 98px}.dx-earl{transform-origin:45px 36px}.dx-earr{transform-origin:75px 36px}
.dx-pawl{transform-origin:52.6px 86px}.dx-pawr{transform-origin:67.4px 86px}.dx-hindl{transform-origin:92px 95px}.dx-hindr{transform-origin:85px 92px}
.pose-stand .dx-pawl{transform-origin:54px 90px}.pose-stand .dx-pawr{transform-origin:61px 90px}.pose-stand .dx-torso{transform-origin:74px 108px}.pose-stand .dx-tail{transform-origin:97px 84px}
.pose-lie .dx-pawl{transform-origin:38px 106px}.pose-lie .dx-pawr{transform-origin:50px 107px}.pose-lie .dx-torso{transform-origin:66px 108px}.pose-lie .dx-tail{transform-origin:96px 106px}
/* walking on four legs: diagonal pairs swing together, the body bobs, the tail streams */
.bb-pal.moving .dx-pawl,.bb-pal.moving .dx-hindr{animation:bbStride .36s ease-in-out infinite alternate}
.bb-pal.moving .dx-pawr,.bb-pal.moving .dx-hindl{animation:bbStride .36s ease-in-out -.36s infinite alternate-reverse}
.bb-pal.moving .dx-torso{animation:bbBob .18s ease-in-out infinite alternate}.bb-pal.moving .dx-tail{animation:bbTailStream .72s ease-in-out infinite}
.bb-pal.moving .bb-palart{animation:bbBob .18s ease-in-out infinite alternate}
@keyframes bbStride{from{transform:rotate(-22deg)}to{transform:rotate(20deg)}}
@keyframes bbBob{from{transform:translateY(0)}to{transform:translateY(-1.6px)}}
/* hunting on all fours: crouch low, hind legs tense, a little butt wiggle before the pounce */
.pose-stand.act-mouse .dx-hindl,.pose-stand.act-mouse .dx-hindr{animation:bbHindTense 3.4s ease-in-out infinite}
.pose-stand.act-laser .dx-hindl{animation:bbHindTense 2.4s ease-in-out infinite}
@keyframes bbHindTense{0%,30%,100%{transform:none}38%{transform:rotate(14deg) scaleY(.9)}46%{transform:rotate(-18deg)}56%{transform:none}}
.pose-lie .dx-torso{animation:bbBreathe 3.2s ease-in-out infinite}.dx-torso{transform-origin:60px 109px}.dx-eyes{transform-origin:60px 60px}.dx-blink{transform-origin:60px 61px}
/* every awake game: blinks, and a lazy ear flick now and then */
.bb-pal:not(.act-nap) .dx-blink,.bb-greet .dx-blink{animation:bbBlink 4.6s ease-in-out infinite}
.bb-pal .dx-earr{animation:bbEarFlick 6.2s ease-in-out infinite}
/* yarn: looks down at the ball, swats it with the left paw, tail swishes */
.act-yarn .dx-head{animation:bbYarnHead 2.6s ease-in-out infinite}.act-yarn .dx-pawl{animation:bbYarnSwat 2.6s ease-in-out infinite}
.act-yarn .dx-tail{animation:bbTailSway 2.6s ease-in-out infinite}.act-yarn .dx-eyes{animation:bbYarnEyes 2.6s ease-in-out infinite}
/* butterfly: head and eyes follow it, ears swivel, tail tip twitches, then he rears up with both paws */
.act-butterfly .dx-head,.act-leaf .dx-head{animation:bbFlyHead 4.2s ease-in-out infinite}.act-butterfly .dx-eyes{animation:bbFlyEyes 4.2s ease-in-out infinite}
.act-butterfly .dx-pawl{animation:bbRearL 4.2s ease-in-out infinite}.act-butterfly .dx-pawr{animation:bbRearR 4.2s ease-in-out infinite}
.act-butterfly .dx-tail,.act-laser .dx-tail{animation:bbTailTwitch .7s ease-in-out infinite}
.act-butterfly .dx-earl,.act-leaf .dx-earl{animation:bbEarSwivelL 2.1s ease-in-out infinite}.act-butterfly .dx-earr,.act-leaf .dx-earr{animation:bbEarSwivelR 2.1s ease-in-out infinite}
/* toy mouse: hunting crouch, butt wiggle, low tail lash, then both paws reach for the pounce */
.act-mouse .dx-head{animation:bbHuntHead 3.4s ease-in-out infinite}.act-mouse .dx-torso{animation:bbButtWiggle 3.4s ease-in-out infinite}
.act-mouse .dx-tail{animation:bbTailLash 3.4s ease-in-out infinite}.act-mouse .dx-pawl{animation:bbPounceL 3.4s ease-in-out infinite}.act-mouse .dx-pawr{animation:bbPounceR 3.4s ease-in-out infinite}
.act-mouse .dx-earl{transform:rotate(-12deg)}.act-mouse .dx-earr{animation:none;transform:rotate(12deg)}
/* laser dot: eyes and head jerk with every jump, ears pinned forward, a quick paw tap */
.act-laser .dx-head{animation:bbLaserHead 2.4s steps(1) infinite}.act-laser .dx-eyes{animation:bbLaserEyes 2.4s steps(1) infinite}
.act-laser .dx-pawr{animation:bbTap 2.4s ease-in-out infinite}.act-laser .dx-earr{animation:none}
/* feather wand: looks up, swats with one paw then the other, stretching up */
.act-feather .dx-head{animation:bbLookUp 1.8s ease-in-out infinite}.act-feather .dx-pawl{animation:bbSwatUpL 1.8s ease-in-out infinite}
.act-feather .dx-pawr{animation:bbSwatUpR 1.8s ease-in-out infinite}.act-feather .dx-torso{animation:bbStretchUp 1.8s ease-in-out infinite}.act-feather .dx-tail{animation:bbTailSway 1.8s ease-in-out infinite}
/* falling leaf: curious head tilts while it drifts, then pins it with both paws */
.act-leaf .dx-head{animation:bbTiltHead 4.2s ease-in-out infinite}.act-leaf .dx-pawl{animation:bbPinL 4.2s ease-in-out infinite}.act-leaf .dx-pawr{animation:bbPinR 4.2s ease-in-out infinite}
.act-leaf .dx-tail{animation:bbTailSway 4.2s ease-in-out infinite}
/* box: loafing, peeking left and right, ears twitching */
.act-box .dx-eyes{animation:bbGlance 3s ease-in-out infinite}.act-box .dx-earl{animation:bbEarFlickL 3s ease-in-out infinite}.act-box .dx-head{animation:bbBoxHead 3s ease-in-out infinite}
/* chasing his tail: looks back over his shoulder, tail whips, paw swipes at it */
.act-tail .dx-head{animation:bbLookBack 3.2s ease-in-out infinite}.act-tail .dx-tail{animation:bbTailWhip .32s ease-in-out infinite}.act-tail .dx-pawr{animation:bbSwipeTail 3.2s ease-in-out infinite}
/* nap: head droops, slow breathing, the odd ear twitch, tail slowly curling */
.act-nap .dx-head{animation:bbNapHead 3.2s ease-in-out infinite}.act-nap .dx-torso{animation:bbBreathe 3.2s ease-in-out infinite}
.act-nap .dx-earr{animation:bbEarFlick 7s ease-in-out infinite}.act-nap .dx-tail{animation:bbTailCurl 6.4s ease-in-out infinite}
/* answers: tail straight up and ears perked when right; ears flat, tail and head down when wrong; trotting legs when he runs over */
.bb-pal.hop .dx-tail{animation:bbTailUp .9s ease both}.bb-pal.hop .dx-earl,.bb-pal.hop .dx-earr{animation:bbEarPerk .6s ease}
.bb-pal.sad .dx-earl{animation:bbEarFlatL 1.1s ease}.bb-pal.sad .dx-earr{animation:bbEarFlatR 1.1s ease}.bb-pal.sad .dx-tail{animation:bbTailDroop 1.1s ease}.bb-pal.sad .dx-head{animation:bbHeadDroop 1.1s ease}
.bb-pal.run .dx-pawl{animation:bbTrot .26s ease-in-out infinite}.bb-pal.run .dx-pawr{animation:bbTrot .26s ease-in-out .13s infinite}.bb-pal.run .dx-tail{animation:bbTailStream .52s ease-in-out infinite}
/* greeting: a paw wave and a happy tail */
.bb-greet .gdex .dx-pawr{animation:bbPawWave .42s ease-in-out 1.15s 6 alternate}.bb-greet .gdex .dx-tail{animation:bbTailSway 1.4s ease-in-out infinite}.bb-greet .gdex .dx-earl{animation:bbEarPerk .6s ease 1s 2}
@keyframes bbBlink{0%,44%,50%,100%{transform:none}47%{transform:scaleY(.08)}}
@keyframes bbEarFlick{0%,86%,100%{transform:none}89%{transform:rotate(14deg)}92%{transform:rotate(-4deg)}95%{transform:rotate(8deg)}}
@keyframes bbEarFlickL{0%,40%,100%{transform:none}45%{transform:rotate(-14deg)}50%{transform:rotate(4deg)}55%{transform:rotate(-8deg)}}
@keyframes bbYarnHead{0%,100%{transform:rotate(-3deg)}25%{transform:rotate(-9deg) translateY(2px)}45%{transform:rotate(-12deg) translate(-2px,3px)}75%{transform:rotate(-5deg) translateY(1px)}}
@keyframes bbYarnEyes{0%,100%{transform:translate(-1px,1px)}40%{transform:translate(-2.4px,2px)}80%{transform:translate(-.5px,1px)}}
@keyframes bbYarnSwat{0%,18%,48%,100%{transform:none}26%{transform:translate(-6px,-12px) rotate(-28deg)}34%{transform:translate(-10px,-2px) rotate(-12deg)}40%{transform:translate(-4px,0)}}
@keyframes bbTailSway{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(10deg)}}
@keyframes bbTailTwitch{0%,100%{transform:rotate(0)}30%{transform:rotate(9deg)}60%{transform:rotate(-4deg)}}
@keyframes bbFlyHead{0%,100%{transform:rotate(-10deg) translateY(-1px)}22%{transform:rotate(-8deg) translateY(-3px)}48%{transform:rotate(11deg) translateY(-3px)}68%{transform:rotate(7deg)}84%{transform:rotate(-6deg)}}
@keyframes bbFlyEyes{0%,100%{transform:translate(-2px,0)}22%{transform:translate(-2px,-2px)}48%{transform:translate(2.4px,-2px)}68%{transform:translate(2px,1px)}84%{transform:translate(-1.6px,0)}}
@keyframes bbRearL{0%,52%,72%,100%{transform:none}60%{transform:translate(-4px,-26px) rotate(-24deg)}66%{transform:translate(-2px,-20px) rotate(-14deg)}}
@keyframes bbRearR{0%,53%,73%,100%{transform:none}61%{transform:translate(4px,-27px) rotate(24deg)}67%{transform:translate(2px,-20px) rotate(14deg)}}
@keyframes bbEarSwivelL{0%,100%{transform:rotate(0)}50%{transform:rotate(-12deg)}}
@keyframes bbEarSwivelR{0%,100%{transform:rotate(10deg)}50%{transform:rotate(0)}}
@keyframes bbHuntHead{0%,100%{transform:translateY(5px) rotate(-5deg)}40%{transform:translateY(6px) rotate(-8deg)}48%{transform:translate(-3px,-2px) rotate(-10deg)}60%{transform:translateY(4px) rotate(-4deg)}}
@keyframes bbButtWiggle{0%,18%,38%,100%{transform:none}22%{transform:rotate(-3deg) translateX(-1px)}26%{transform:rotate(3deg) translateX(1px)}30%{transform:rotate(-3deg) translateX(-1px)}34%{transform:rotate(3deg) translateX(1px)}}
@keyframes bbTailLash{0%,100%{transform:rotate(30deg)}20%{transform:rotate(40deg)}30%{transform:rotate(22deg)}40%{transform:rotate(44deg)}}
@keyframes bbPounceL{0%,38%,58%,100%{transform:none}46%{transform:translate(-12px,-8px) rotate(-22deg)}52%{transform:translate(-10px,0) rotate(-8deg)}}
@keyframes bbPounceR{0%,39%,59%,100%{transform:none}47%{transform:translate(-6px,-10px) rotate(-18deg)}53%{transform:translate(-6px,0) rotate(-6deg)}}
@keyframes bbLaserHead{0%{transform:rotate(-6deg) translateY(2px)}20%{transform:rotate(-12deg) translateY(-2px)}40%{transform:rotate(9deg) translateY(1px)}60%{transform:rotate(-4deg) translateY(3px)}80%{transform:rotate(12deg) translateY(2px)}}
@keyframes bbLaserEyes{0%{transform:translate(-1px,2px)}20%{transform:translate(-2.6px,-1.6px)}40%{transform:translate(2.4px,0)}60%{transform:translate(-1px,2.4px)}80%{transform:translate(2.8px,1.6px)}}
@keyframes bbTap{0%,55%,75%,100%{transform:none}60%{transform:translate(-4px,-8px) rotate(-16deg)}65%{transform:translate(-5px,0)}70%{transform:translate(-4px,-6px) rotate(-12deg)}}
@keyframes bbLookUp{0%,100%{transform:rotate(-10deg) translateY(-2px)}50%{transform:rotate(-3deg) translateY(-3px)}}
@keyframes bbSwatUpL{0%,22%,48%,100%{transform:none}32%{transform:translate(-6px,-30px) rotate(-32deg)}40%{transform:translate(-3px,-18px) rotate(-16deg)}}
@keyframes bbSwatUpR{0%,62%,90%,100%{transform:none}72%{transform:translate(2px,-30px) rotate(28deg)}80%{transform:translate(1px,-16px) rotate(12deg)}}
@keyframes bbStretchUp{0%,20%,50%,60%,92%,100%{transform:none}32%,72%{transform:scaleY(1.05)}}
@keyframes bbTiltHead{0%,100%{transform:rotate(-13deg)}20%{transform:rotate(13deg)}40%{transform:rotate(-11deg)}58%{transform:rotate(-4deg) translateY(3px)}76%{transform:rotate(0) translateY(5px)}}
@keyframes bbPinL{0%,58%,92%,100%{transform:none}66%{transform:translate(0,-16px) rotate(-14deg)}74%,86%{transform:translate(3px,1px)}}
@keyframes bbPinR{0%,59%,93%,100%{transform:none}67%{transform:translate(0,-16px) rotate(14deg)}75%,87%{transform:translate(-3px,1px)}}
@keyframes bbGlance{0%,20%,100%{transform:none}30%,45%{transform:translateX(-2.6px)}60%,80%{transform:translateX(2.6px)}}
@keyframes bbBoxHead{0%,100%{transform:none}30%{transform:rotate(-6deg)}65%{transform:rotate(6deg)}}
@keyframes bbLookBack{0%,25%,85%,100%{transform:none}38%,72%{transform:rotate(16deg) translateX(4px)}}
@keyframes bbTailWhip{0%,100%{transform:rotate(-16deg)}50%{transform:rotate(26deg)}}
@keyframes bbSwipeTail{0%,34%,46%,56%,68%,100%{transform:none}40%{transform:translate(10px,-10px) rotate(28deg)}62%{transform:translate(12px,-8px) rotate(30deg)}}
@keyframes bbNapHead{0%,100%{transform:rotate(-7deg) translateY(4px)}50%{transform:rotate(-8deg) translateY(5px)}}
@keyframes bbTailCurl{0%,100%{transform:rotate(14deg)}50%{transform:rotate(22deg)}}
@keyframes bbTailUp{0%{transform:none}35%,70%{transform:rotate(-22deg)}100%{transform:none}}
@keyframes bbEarPerk{0%,100%{transform:none}50%{transform:translateY(-3px) scaleY(1.08)}}
@keyframes bbEarFlatL{0%,100%{transform:none}25%,75%{transform:rotate(-38deg) translateY(5px)}}
@keyframes bbEarFlatR{0%,100%{transform:none}25%,75%{transform:rotate(38deg) translateY(5px)}}
@keyframes bbTailDroop{0%,100%{transform:none}25%,75%{transform:rotate(42deg)}}
@keyframes bbHeadDroop{0%,100%{transform:none}25%,75%{transform:rotate(-6deg) translateY(4px)}}
@keyframes bbTrot{0%,100%{transform:none}50%{transform:translateY(-5px) rotate(-8deg)}}
@keyframes bbTailStream{0%,100%{transform:rotate(18deg)}50%{transform:rotate(30deg)}}
@keyframes bbPawWave{from{transform:translate(4px,-26px) rotate(-38deg)}to{transform:translate(7px,-28px) rotate(8deg)}}
@media (prefers-reduced-motion:reduce){.dx-head,.dx-tail,.dx-earl,.dx-earr,.dx-pawl,.dx-pawr,.dx-torso,.dx-eyes,.dx-blink{animation:none!important}}
@media (prefers-reduced-motion:reduce){.bb-say,.bb-yarn,.bb-yarn svg{animation-duration:.01s}.bb-dock .bb-pic,.bb-card .bb-big,.bb-evo.done .new{animation:none}.bb-evo .old{animation:none;opacity:0}.bb-evo .new{animation:none;opacity:1}.bb-evo .glow{display:none}}`;

  // ===== Dock (bottom-right) with a ring that fills toward the next evolution
  function ringPct(pts) { const k = stageOf(pts), a = STAGES[k].at, b = nextAt(k); return b === null ? 1 : (pts - a) / (b - a) }
  function paintDock() { paintDock0(); checkPal(); paintPal() }
  function paintDock0() {
    let d = $("bbDock");
    if (off()) { if (d) d.remove(); document.body.classList.remove("bb-on"); return }
    const s = load(), k = stageOf(s.pts), C = 2 * Math.PI * 30, mult = XP() ? XP().multiplier(s.streak) : 1;
    if (!d) { d = document.createElement("button"); d.id = "bbDock"; d.type = "button"; d.className = "bb-dock"; d.onclick = () => openPal("closet"); document.body.appendChild(d); makeMovable(d, () => 64, (x, y) => { d.style.left = x + "px"; d.style.top = y + "px"; d.style.right = d.style.bottom = "auto" }) }
    document.body.classList.add("bb-on"); dockSpot(d);
    d.setAttribute("aria-label", `Study buddy: ${name(s)}, level ${level(s.pts)}, ${fmt(s.pts)} XP${s.streak >= 3 ? `, ${s.streak} in a row, XP times ${mult}` : ""}. Open`);
    d.innerHTML = `<svg class="bb-ring" viewBox="0 0 64 64"><circle class="t" cx="32" cy="32" r="30"/><circle class="f" cx="32" cy="32" r="30" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - ringPct(s.pts))}"/></svg>
      <span class="bb-pic">${art(k)}</span><span class="bb-lv">Lv ${level(s.pts)}</span>${s.streak >= 3 ? `<span class="bb-streak" title="${s.streak} right in a row">${FLAME}×${mult}</span>` : ""}`;
  }
  const name = s => s.nick || "Dexter";
  const COIN = `<svg class="coin" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#ffcf33" stroke="#b07d0f" stroke-width="1.4"/><circle cx="8" cy="8" r="4.2" fill="none" stroke="#d9a21b" stroke-width="1.2"/><path d="M6.6 5.6 q1.4 -1 2.8 0" stroke="#fff6cf" stroke-width="1.1" fill="none" stroke-linecap="round"/></svg>`;
  const HANGER = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7 a2.2 2.2 0 1 1 2.2 -2.2 c0 1.4 -2.2 1.8 -2.2 3.4 L21 15 a1.4 1.4 0 0 1 -.9 2.5 H3.9 A1.4 1.4 0 0 1 3 15Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  const FLAME = `<svg viewBox="0 0 12 14" aria-hidden="true"><path d="M6 1 C7 4 10 5 10 9 C10 12 8 13 6 13 C4 13 2 12 2 9 C2 7 3 6 4 5 C4 7 5 8 6 8 C6 6 5 4 6 1Z" fill="currentColor"/></svg>`;

  // ===== Progress tab: level, XP, streaks, gold, the next evolution, the biology, the evolution line, how XP works
  function progressHTML(s) {
    const k = stageOf(s.pts), st = STAGES[k], nx = nextAt(k), L = level(s.pts), X = XP();
    const mult = X ? X.multiplier(s.streak) : 1, up = X ? X.nextStreak(s.streak) : null, pct = Math.round(ringPct(s.pts) * 100);
    return `<div class="pal-prog">
      <div class="bb-big">${art(k)}</div>
      <h3 id="bbName">${esc(name(s))}</h3>
      <p class="bb-sub">Level ${L} of ${MAX_LV} · ${esc(st.form)} · ${esc(st.name)}</p>
      <div class="bb-stats">
        <div><b>${fmt(s.pts)}</b><span>total XP</span></div>
        <div><b>${s.streak}${s.streak >= 3 ? `<i class="fl">${FLAME}</i>` : ""}</b><span>in a row · ×${mult}</span></div>
        <div><b>${s.best}</b><span>best streak</span></div>
        <div class="gold"><b>${COIN}${fmt(s.gold)}</b><span>gold</span></div>
      </div>
      <div class="bb-bar"><i style="width:${pct}%"></i></div>
      <p class="bb-next">${nx === null ? (L >= MAX_LV ? "Fully grown and Level 100. You've mastered it all!" : `Fully grown! ${fmt(lvXP(L + 1) - s.pts)} XP to level ${L + 1} of ${MAX_LV}.`) : `Evolves at Lv ${level(nx)} · ${fmt(nx - s.pts)} XP to go · ${fmt(lvXP(L + 1) - s.pts)} XP to level ${L + 1}`}</p>
      ${up ? `<p class="bb-next" style="margin-top:-8px">${s.streak ? `${up.at - s.streak} more right in a row for` : `Get ${up.at} right in a row for`} ×${up.mult} XP</p>` : ""}
      <div class="bb-fact"><b>The biology</b>${esc(st.fact)}</div>
      <div class="bb-line" aria-label="Evolution line">${STAGES.map((x, i) => `<div class="${i > k ? "lock" : ""}${i === k ? " cur" : ""}">${art(i)}<span>${i > k ? `Lv ${level(x.at)}` : esc(x.name)}</span></div>`).join("")}</div>
      <details class="bb-how"><summary>How XP and gold work</summary>
        <p>Every question is rated by how hard it is. Harder questions earn more XP and gold:</p>
        <ul class="bb-tiers">${X ? X.TIERS.map(t => `<li><span class="xpb t-${t.key}">${t.name}</span>${t.xp} XP · ${GOLD_PER[t.key]} gold</li>`).join("") : ""}</ul>
        <p><b>What makes a question harder:</b> EXCEPT/NOT wording, putting steps in order, reading an experiment or a figure, comparing two things or explaining why, five answer choices, long and similar answers, high-value Bio-pardy clues, and questions <i>you</i> missed before. A question you've already gotten right 3+ times earns half.</p>
        <p><b>Win streaks multiply XP and gold:</b> ${X ? X.STREAKS.slice(0, -1).reverse().map(([n, m]) => `${n} in a row ×${m}`).join(" · ") : ""}. A wrong answer resets the streak but never takes anything away. Each evolution adds ${EVOLVE_BONUS} gold.</p>
      </details>
      <div class="bb-spot"><b>Where ${esc(name(s))} sits</b>${getSpot() ? `Right where you put him. He still runs over to each answer you pick, then goes back to his spot.` : `Next to your questions. He runs over to each answer you pick.`}<small>Drag ${esc(name(s))} anywhere on the screen to move him (or focus him and use the arrow keys).</small>${getSpot() ? `<button type="button" id="bbSpotReset">Put him back beside my questions</button>` : ""}</div>
      <div class="bb-acts"><button type="button" id="bbRename">Rename</button><button type="button" id="bbHide">Hide buddy</button></div>
    </div>`;
  }

  // ===== A correct answer: XP from the question's difficulty × the streak multiplier, then hop / level up / evolve
  const STREAK_CHEERS = { 3: "3 in a row!", 5: "5 in a row!", 10: "10 in a row!", 15: "15 in a row!", 25: "25 in a row!" };
  // Pops float up from the buddy; ones that overlap in time stack upward instead of piling on top of each other
  const live = [];
  function pop(lines, cls) {
    const d = anchor(); if (!d) return;
    const r = anchorRect(d), p = document.createElement("span");
    p.className = "bb-plus" + (cls ? " " + cls : ""); p.innerHTML = lines;
    const slot = live.reduce((n, x) => Math.max(n, x.slot + 1), 0);
    p.style.right = (innerWidth - r.right) + "px"; p.style.top = (r.top - 14 - slot * 40) + "px";
    const rec = { slot, p }; live.push(rec);
    document.body.appendChild(p);
    setTimeout(() => { p.remove(); live.splice(live.indexOf(rec), 1) }, 1500);
  }
  // ===== Dexter's reactions: an excited "Meow!" (bubble + a little synthesized meow) or a dropped yarn ball
  const SOUND_KEY = "bio-dexter-sound";
  const soundOn = () => { try { return localStorage.getItem(SOUND_KEY) !== "0" } catch (e) { return true } };
  const setSound = on => { try { on ? localStorage.removeItem(SOUND_KEY) : localStorage.setItem(SOUND_KEY, "0") } catch (e) { } };
  let actx = null;
  function meowSound(stage) {
    if (!soundOn()) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const t = actx.currentTime, base = 520 - stage * 30 + Math.random() * 90, dur = .42 + Math.random() * .12;
      const o = actx.createOscillator(), o2 = actx.createOscillator(), f = actx.createBiquadFilter(), g = actx.createGain();
      o.type = "sawtooth"; o2.type = "triangle";
      for (const [osc, k] of [[o, 1], [o2, 2.01]]) {   // "mee-OW": rise, then fall
        osc.frequency.setValueAtTime(base * .8 * k, t);
        osc.frequency.linearRampToValueAtTime(base * 1.35 * k, t + dur * .35);
        osc.frequency.exponentialRampToValueAtTime(base * .62 * k, t + dur);
      }
      f.type = "bandpass"; f.Q.value = 2.2;
      f.frequency.setValueAtTime(900, t); f.frequency.linearRampToValueAtTime(2200, t + dur * .4); f.frequency.linearRampToValueAtTime(700, t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.32, t + .05); g.gain.setValueAtTime(.32, t + dur * .6); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(f); o2.connect(f); f.connect(g); g.connect(actx.destination);
      o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05);
    } catch (e) { }
  }
  const MEOWS = ["Meow!", "Meow meow!", "MEOW!!", "Mrrrow!", "Meeeow! ♪", "Meow! Nice!"];
  let sayEl = null;
  function say(text) {
    const d = anchor(); if (!d) return;
    if (sayEl) sayEl.remove();
    const r = anchorRect(d), b = document.createElement("span");
    b.className = "bb-say"; b.textContent = text; b.setAttribute("aria-hidden", "true");
    if (r.left < 170) { b.style.left = (r.right + 10) + "px"; b.style.transformOrigin = "0 100%" } else b.style.right = (innerWidth - r.left + 10) + "px";
    b.style.top = (r.top + r.height * .1) + "px";
    document.body.appendChild(b); sayEl = b;
    setTimeout(() => { b.remove(); if (sayEl === b) sayEl = null }, 1500);
  }
  function dropYarn() {
    const d = anchor(); if (!d) return;
    if (d.id === "bbPal") {   // the study pal loses its toy: it rolls away and comes back
      d.classList.remove("hop", "sad", "lost"); void d.offsetWidth; d.classList.add("sad", "lost");
      setTimeout(() => d.classList.remove("lost"), 2500); return;
    }
    const r = d.getBoundingClientRect(), y = document.createElement("span");
    y.className = "bb-yarn"; y.setAttribute("aria-hidden", "true");
    y.innerHTML = `<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="10.5" fill="#4f8dff" stroke="#3a2a1e" stroke-width="2"/><path d="M5 10 Q13 5 21 12 M5 15 Q13 9 21 17 M9 4.5 Q15 13 11 23" stroke="#2c5fc4" stroke-width="1.6" fill="none"/></svg>`;
    y.style.left = (r.left + r.width / 2 - 13) + "px"; y.style.top = (r.top + r.height * .45) + "px";
    y.style.setProperty("--fall", Math.max(20, innerHeight - r.top - r.height * .45 - 30) + "px");
    document.body.appendChild(y);
    d.classList.remove("hop", "sad"); void d.offsetWidth; d.classList.add("sad");
    setTimeout(() => y.remove(), 1700);
  }

  function gain(e) {
    const X = XP(), detail = (e && e.detail) || {};
    const r = X ? X.rate(detail) : { xp: 10, tier: { key: "easy", name: "Easy" } };
    const s = load(), before = stageOf(s.pts), lvBefore = level(s.pts);
    s.streak = (s.streak | 0) + 1; s.best = Math.max(s.best | 0, s.streak); s.last = Date.now(); s.correct = (s.correct | 0) + 1;
    const mult = X ? X.multiplier(s.streak) : 1, earned = Math.round(r.xp * mult);
    s.pts += earned;
    const goldBase = (GOLD_PER[r.tier.key] || 3), coins = Math.max(1, Math.round((r.repeat ? Math.ceil(goldBase / 2) : goldBase) * mult));
    const evolved = stageOf(s.pts) > before;
    s.gold = (s.gold | 0) + coins + (evolved ? EVOLVE_BONUS : 0);
    save(s);
    window.dispatchEvent(new CustomEvent("bio:xp", { detail: { earned, base: r.xp, mult, tier: r.tier, streak: s.streak, pts: s.pts } }));
    if (off()) return;
    paintDock(); visit(); if (palOn) setMood("happy", 1700);
    const d = anchor(); if (!d) return;
    d.classList.remove("hop", "sad"); void d.offsetWidth; d.classList.add("hop");
    say(MEOWS[Math.floor(Math.random() * MEOWS.length)]); meowSound(before);
    const lv = level(s.pts);
    pop(`<b>+${earned} XP <span class="gc">${COIN}+${coins}</span></b><small><span class="xpb t-${r.tier.key}">${esc(r.tier.name)}</span>${mult > 1 ? ` ×${mult} streak` : ""}${lv > lvBefore ? ` · Lv ${lv}!` : ""}</small>`);
    if (STREAK_CHEERS[s.streak]) setTimeout(() => pop(`<b>${FLAME} ${STREAK_CHEERS[s.streak]}</b><small>XP ×${mult} while it lasts</small>`, "hot"), 650);
    const after = stageOf(s.pts);
    if (after > before) setTimeout(() => evolve(before, after), 900);
  }
  function miss() {
    const s = load(), had = s.streak | 0; s.streak = 0; s.last = Date.now(); save(s);
    if (off()) return;
    paintDock(); visit(); if (palOn) setMood("sad", 1900);
    dropYarn();
    if (had >= 3) pop(`<b>Streak ended at ${had}</b><small>No XP lost. Start a new one!</small>`, "cool");
  }
  function evolve(from, to) {
    const s = load(), a = STAGES[from], b = STAGES[to], who = s.nick || "Dexter";
    const ev = document.createElement("div"); ev.className = "bb-evo"; ev.setAttribute("role", "dialog"); ev.setAttribute("aria-modal", "true"); ev.setAttribute("aria-live", "polite");
    ev.innerHTML = `<p class="msg" id="bbMsg">${esc(who)} is starting to glow…</p>
      <div class="stage"><div class="glow"></div><span class="old">${art(from)}</span><span class="new">${art(to)}</span></div>
      <div class="reveal"><h2>${esc(who)} evolved into ${esc(b.name)}!</h2><p class="evo-gold">${COIN} +${EVOLVE_BONUS} gold evolution bonus</p><p style="margin-top:8px">${esc(b.form)} stage · ${esc(b.fact)}</p></div>
      <button type="button" id="bbEvoOk">Keep studying</button>`;
    document.body.appendChild(ev);
    const finish = () => {
      if (ev.classList.contains("done")) return; ev.classList.add("done"); $("bbMsg").textContent = "Congratulations!";
      const r = ev.querySelector(".stage").getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      for (let i = 0; i < 26; i++) {   // a burst of leaves and petals
        const l = document.createElement("i"); l.className = "bb-leaf"; const ang = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 140;
        l.style.left = cx + "px"; l.style.top = cy + "px"; l.style.background = ["#7bd36b", "#34c759", "#f48fbf", "#ffd54f"][i % 4];
        l.style.setProperty("--dx", Math.cos(ang) * dist + "px"); l.style.setProperty("--dy", Math.sin(ang) * dist + "px"); l.style.setProperty("--r", (Math.random() * 540 - 270) + "deg");
        document.body.appendChild(l); setTimeout(() => l.remove(), 1500);
      }
      $("bbEvoOk").focus();
    };
    const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => { const m = $("bbMsg"); if (m && !ev.classList.contains("done")) m.textContent = "Something's happening…" }, 900);
    setTimeout(finish, reduce ? 50 : 2700);
    $("bbEvoOk").onclick = () => ev.remove();
    ev.onclick = e => { if (ev.classList.contains("done") && e.target === ev) ev.remove() };
  }

  // ===== Dexter's Shop: earn gold with right answers, buy hats, outfits and accessories, try them on first
  const GOLD_PER = { easy: 3, medium: 5, hard: 8, expert: 12 }, EVOLVE_BONUS = 50;
  // ===== Dexter's panel (tap Dexter): Closet = dress him however you like · Shop = buy new items · Progress = level and stats
  let shop = null;
  const NONE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M6 18 L18 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
  const OWN_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 l2.2 5.4 5.8 .5 -4.4 3.8 1.4 5.7 L12 15.3 7 18.4 l1.4 -5.7 L4 8.9 l5.8 -.5Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>`;
  function openPal(tab, sub) {
    const W = window.BioWardrobe;
    if (shop) shop.remove();
    const st = { tab: tab || "closet", sub: sub || "hat", sel: null, tryEq: Object.assign({}, load().equip) };
    shop = document.createElement("div"); shop.className = "bb-veil"; document.body.appendChild(shop);
    shop.onclick = e => { if (e.target === shop) closeShop() };
    const SUBS = [["hat", "Hats"], ["outfit", "Outfits"], ["acc", "Accessories"]];
    const slotsFor = key => !W ? [] : key === "acc" ? W.SLOTS.filter(x => x.group === "Accessories") : W.SLOTS.filter(x => x.key === key);
    const keepScroll = fn => { const c = shop.querySelector(".bb-shop"), y = c ? c.scrollTop : 0; fn(); const n = shop.querySelector(".bb-shop"); if (n) n.scrollTop = y };
    function shopTile(it, s) {
      const own = s.owned.includes(it.id), on = s.equip[it.slot] === it.id;
      return `<button type="button" class="sh-tile${st.sel === it.id ? " sel" : ""}${on ? " on" : ""}" data-id="${it.id}" aria-pressed="${st.sel === it.id}">
        <svg viewBox="${W.VIEW[it.slot]}" aria-hidden="true">${it.svg}</svg><b>${esc(it.name)}</b>
        <span class="tag">${esc(it.set)}</span><span class="pr">${on ? "Wearing" : own ? "Owned" : `${COIN}${it.price}`}</span></button>`;
    }
    // Closet: every slot lets you pick one of your items, Dexter's own gear for this form, or nothing at all
    // Badge case: one badge per Read & Learn chapter, like a trainer's case. Earned badges can be pinned on Dexter.
    function badgesHTML(s) {
      const B = W.ITEMS.filter(i => i.slot === "badge"), got = B.filter(i => s.owned.includes(i.id));
      if (!st.bsel || !W.byId[st.bsel]) st.bsel = (s.equip.badge && W.byId[s.equip.badge] ? s.equip.badge : (got[0] || B[0]).id);
      const it = W.byId[st.bsel], own = s.owned.includes(it.id), worn = s.equip.badge === it.id;
      return `<div class="bc-case"><div class="bc-top"><span>BADGE CASE</span><small>${got.length} of ${B.length} earned</small></div>
        <div class="bc-grid">${B.map(i => `<button type="button" class="bc-slot${s.owned.includes(i.id) ? "" : " lock"}${i.id === st.bsel ? " sel" : ""}${s.equip.badge === i.id ? " worn" : ""}" data-id="${i.id}" aria-label="${esc(s.owned.includes(i.id) ? i.name + ", " + W.tier(completions(i.earn)).name : "Locked badge: " + i.chapter)}">${badgeSVG(i, s.owned.includes(i.id) ? completions(i.earn) : 0)}${s.owned.includes(i.id) && completions(i.earn) > 1 ? `<i class="bc-n">×${completions(i.earn)}</i>` : ""}</button>`).join("")}</div></div>
        <div class="bc-detail">${own ? badgeSVG(it, completions(it.earn)) : `<svg viewBox="-13.5 -13.5 27 27" style="filter:brightness(0) opacity(.3)">${it.big}</svg>`}<div class="bc-txt">
          <b>${own ? esc(it.name) : "??? Badge"}${own ? ` <em class="bc-tier t${W.tier(completions(it.earn)).lv}">${W.tier(completions(it.earn)).name}</em>` : ""}</b>
          <span>${own ? (() => { const t = W.tier(completions(it.earn)); return `Finished “${esc(it.chapter)}” ${t.count === 1 ? "once" : t.count + " times"}. ${t.next ? `Finish it ${t.next.at - t.count} more time${t.next.at - t.count > 1 ? "s" : ""} (↺ Restart in the chapter) to make it ${t.next.name}.` : "It can't shine any brighter!"}` })() : `Finish the “${esc(it.chapter)}” chapter in Read & Learn to earn it.`}</span><br>
          ${own ? (worn ? `<button type="button" class="sh-act ghost" id="bcOff">Take it off</button>` : `<button type="button" class="sh-act" id="bcPin">Pin it on ${esc(name(s))}</button>`) : `<a class="sh-act" style="display:inline-block;text-decoration:none" href="/read/index.html#${it.earn}">Read the chapter</a>`}
        </div></div>`;
    }
    const weightLabel = w => w <= .86 ? "Slim" : w <= 1.06 ? "Just right" : w <= 1.21 ? "Well fed" : w <= 1.36 ? "Chubby" : "Absolute chonk";
    function closetHTML(s, k) {
      const g = FORM_GEAR[k], cur = s.equip;
      const rows = W.SLOTS.filter(sl => sl.key !== "badge" || s.owned.some(id => id.startsWith("badge-"))).map(sl => {
        const mine = W.ITEMS.filter(i => i.slot === sl.key && s.owned.includes(i.id));
        const hasOwn = sl.key === "face" ? !!g.glasses : !!g[sl.key];
        const opt = (val, label, icon, extra = "") => `<button type="button" class="sh-tile cl${(cur[sl.key] === val || (val === undefined && cur[sl.key] === undefined)) ? " on" : ""}" data-slot="${sl.key}" data-val="${val === undefined ? "" : val}" aria-pressed="${cur[sl.key] === val}">${icon}<b>${label}</b>${extra}</button>`;
        return `<p class="sh-cap">${esc(sl.name)}</p><div class="sh-grid">
          ${hasOwn ? opt(undefined, "Dexter's own", `<span class="cl-ic">${OWN_ICON}</span>`, `<span class="tag">This form's gear</span>`) : ""}
          ${opt("none", "None", `<span class="cl-ic">${NONE_ICON}</span>`, `<span class="tag">${hasOwn ? "Take it off" : "Nothing here"}</span>`)}
          ${mine.map(it => opt(it.id, esc(it.name), `<svg viewBox="${W.VIEW[it.slot]}" aria-hidden="true">${it.svg}</svg>`, `<span class="tag">${esc(it.set)}</span>`)).join("")}
        </div>`;
      }).join("");
      const wt = s.weight || 1;
      return `<div class="cl-weight"><div class="cl-wtop"><b>Weight</b><span id="clWLabel">${weightLabel(wt)}</span></div>
          <div class="cl-wrow"><span aria-hidden="true">🐈</span><input type="range" id="clWeight" min="75" max="150" step="5" value="${Math.round(wt * 100)}" aria-label="${esc(name(s))}'s weight"><span aria-hidden="true">🍙</span></div>
          <div class="cl-wbtns"><button type="button" data-w="85">Slim</button><button type="button" data-w="100">Just right</button><button type="button" data-w="125">Chubby</button><button type="button" data-w="150">Chonk</button></div></div>
        <div class="sh-bar"><p class="sh-hint">Tap to dress Dexter. Mix any items you own, keep his own gear, or take it all off.</p></div>
        ${s.owned.length ? "" : `<div class="cl-empty"><b>Your closet is empty</b><span>Earn gold with right answers and buy hats, outfits and accessories in the Shop.</span><button type="button" class="sh-act" id="goShop">Visit the Shop</button></div>`}
        ${rows}
        <div class="cl-reset"><button type="button" class="sh-act ghost" id="clDefault">Dexter's own look</button><button type="button" class="sh-act ghost" id="clBare">Take everything off</button></div>`;
    }
    function shopHTML(s) {
      const it = st.sel ? W.byId[st.sel] : null, own = it && s.owned.includes(it.id), on = it && s.equip[it.slot] === it.id;
      let action = `<p class="sh-hint">Tap an item to try it on.</p>`;
      if (it) action = `<div class="sh-sel"><b>${esc(it.name)}</b><span>${esc(it.set)} · ${on ? "Wearing" : own ? "Owned" : `${COIN}${it.price} gold`}</span></div>` + (
        on ? `<button type="button" class="sh-act ghost" id="shOff">Take off</button>`
        : own ? `<button type="button" class="sh-act" id="shWear">Wear</button>`
        : s.gold >= it.price ? `<button type="button" class="sh-act" id="shBuy">Buy for ${it.price}</button>`
        : `<button type="button" class="sh-act" disabled>Need ${it.price - s.gold} more gold</button>`);
      return `<div class="sh-bar">${action}</div>
        <div class="sh-tabs sub" role="tablist">${SUBS.map(([key, label]) => `<button type="button" role="tab" aria-selected="${st.sub === key}" data-sub="${key}">${label}</button>`).join("")}</div>
        ${slotsFor(st.sub).map(sl => `<p class="sh-cap">${esc(sl.name)}</p><div class="sh-grid">${W.ITEMS.filter(i => i.slot === sl.key).map(i => shopTile(i, s)).join("")}</div>`).join("")}
        <p class="sh-note">Earn gold with every right answer: Easy 3 · Medium 5 · Hard 8 · Expert 12, multiplied by your streak, plus ${EVOLVE_BONUS} each time Dexter evolves. Bought items go to your Closet and show up on Dexter in every form.</p>`;
    }
    function paint() {
      const s = load(), k = stageOf(s.pts);
      syncBadges();
      const body = st.tab === "progress" || !W ? progressHTML(s) : st.tab === "shop" ? shopHTML(s) : st.tab === "badges" ? badgesHTML(load()) : closetHTML(s, k);
      shop.innerHTML = `<div class="bb-card bb-shop${st.opened ? " still" : ""}" role="dialog" aria-modal="true" aria-labelledby="shTitle">
        <div class="sh-head"><h3 id="shTitle">${esc(name(s))}</h3><span class="sh-gold" aria-label="${s.gold} gold">${COIN}${fmt(s.gold)}</span><button type="button" class="sh-done" id="shDone">Done</button></div>
        <div class="sh-tabs pal" role="tablist">${[["closet", "Closet"], ["shop", "Shop"], ["badges", "Badges"], ["progress", "Progress"]].map(([key, label]) => `<button type="button" role="tab" aria-selected="${st.tab === key}" data-tab="${key}">${label}</button>`).join("")}</div>
        ${st.tab === "progress" ? "" : `<div class="sh-stage">${art(k, st.tab === "shop" ? st.tryEq : s.equip, { eyes: k === 0 ? "closed" : "wide" })}</div>`}
        ${body}
      </div>`;
      $("shDone").onclick = closeShop;
      shop.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { st.tab = b.dataset.tab; st.sel = null; st.tryEq = Object.assign({}, load().equip); paint(); shop.querySelector(".bb-shop").scrollTop = 0 });
      shop.querySelectorAll("[data-sub]").forEach(b => b.onclick = () => keepScroll(() => { st.sub = b.dataset.sub; st.sel = null; st.tryEq = Object.assign({}, load().equip); paint() }));
      if (st.tab === "progress") {
        $("bbRename").onclick = () => { const n = prompt("Name your study buddy:", s.nick || "Dexter"); if (n === null) return; const t = load(); t.nick = n.trim().slice(0, 24); save(t); paintDock(); paint() };
        $("bbHide").onclick = () => { setEnabled(false); closeShop() };
        if ($("bbSpotReset")) $("bbSpotReset").onclick = () => { setSpot(null); paint() };
        return;
      }
      if (st.tab === "badges") {
        shop.querySelectorAll(".bc-slot").forEach(b => b.onclick = () => keepScroll(() => { st.bsel = b.dataset.id; paint() }));
        if ($("bcPin")) $("bcPin").onclick = () => keepScroll(() => { const t = load(); t.equip.badge = st.bsel; save(t); paint(); paintDock() });
        if ($("bcOff")) $("bcOff").onclick = () => keepScroll(() => { const t = load(); delete t.equip.badge; save(t); paint(); paintDock() });
        return;
      }
      if (st.tab === "closet") {
        const set = fn => keepScroll(() => { const t = load(); fn(t); save(t); paint(); paintDock() });
        // weight: the stage updates live while dragging; the rest of the page when you let go
        const setW = (v, done) => { const t = load(); t.weight = Math.min(1.5, Math.max(.75, v / 100)); save(t); $("clWLabel").textContent = weightLabel(t.weight); $("clWeight").value = Math.round(t.weight * 100); const stg = shop.querySelector(".sh-stage"); if (stg) stg.innerHTML = art(stageOf(t.pts), t.equip, { eyes: stageOf(t.pts) === 0 ? "closed" : "wide" }); if (done) paintDock() };
        $("clWeight").oninput = e => setW(+e.target.value); $("clWeight").onchange = e => setW(+e.target.value, true);
        shop.querySelectorAll("[data-w]").forEach(b => b.onclick = () => setW(+b.dataset.w, true));
        shop.querySelectorAll(".sh-tile.cl").forEach(b => b.onclick = () => set(t => { if (b.dataset.val === "") delete t.equip[b.dataset.slot]; else t.equip[b.dataset.slot] = b.dataset.val }));
        if ($("goShop")) $("goShop").onclick = () => { st.tab = "shop"; paint() };
        $("clDefault").onclick = () => set(t => { t.equip = {} });
        $("clBare").onclick = () => set(t => { t.equip = Object.fromEntries(W.SLOTS.map(x => [x.key, "none"])) });
        return;
      }
      const it = st.sel ? W.byId[st.sel] : null;
      shop.querySelectorAll(".sh-tile[data-id]").forEach(b => b.onclick = () => keepScroll(() => {
        const i = W.byId[b.dataset.id], cur = load().equip;
        st.sel = st.sel === i.id ? null : i.id;
        st.tryEq = Object.assign({}, cur); if (st.sel) st.tryEq[i.slot] = i.id;
        paint();
      }));
      const act = fn => () => keepScroll(() => { fn(); paint(); paintDock() });
      if ($("shBuy")) $("shBuy").onclick = act(() => { const t = load(); if (t.gold < it.price || t.owned.includes(it.id)) return; t.gold -= it.price; t.owned.push(it.id); t.equip[it.slot] = it.id; save(t); st.tryEq = Object.assign({}, t.equip); pop(`<b>New: ${esc(it.name)}!</b><small>${COIN}−${it.price} gold</small>`, "buy") });
      if ($("shWear")) $("shWear").onclick = act(() => { const t = load(); t.equip[it.slot] = it.id; save(t); st.tryEq = Object.assign({}, t.equip) });
      if ($("shOff")) $("shOff").onclick = act(() => { const t = load(); delete t.equip[it.slot]; save(t); st.tryEq = Object.assign({}, t.equip); st.sel = null });
    }
    paint(); st.opened = true; $("shDone").focus();   // the panel animates in once; later repaints don't replay it
  }
  const openShop = sub => openPal("shop", sub), openCard = () => openPal("closet");
  // ===== Reading badges: every finished Read & Learn chapter (saved by read/index.html) earns its badge
  const READ_KEY = KEY.split("-")[0] + "-read-v1";
  // how many times a chapter has been finished (restarting keeps the count; older saves only have "finished")
  function completions(k) { let r = {}; try { r = JSON.parse(localStorage.getItem(READ_KEY) || "{}") || {} } catch (e) { } const c = r[k] || {}; return Math.max(c.done | 0, c.finished ? 1 : 0) }
  const badgeSVG = (it, n, cls) => `<svg${cls ? ` class="${cls}"` : ""} viewBox="-13.5 -13.5 27 27" aria-hidden="true">${window.BioWardrobe.badgeArt(it, n)}</svg>`;
  function syncBadges() {
    const W = window.BioWardrobe; if (!W) return [];
    const s = load(), add = W.ITEMS.filter(i => i.earn && completions(i.earn) > 0 && !s.owned.includes(i.id));
    if (add.length) { add.forEach(i => s.owned.push(i.id)); save(s) }
    return add;
  }
  function badgeWon(item, up) {
    const s = load(), el = document.createElement("div"), n = completions(item.earn), t = window.BioWardrobe.tier(n); el.className = "bb-badge-won"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", up ? "Badge upgraded" : "New badge");
    el.innerHTML = `${badgeSVG(item, n, "big")}${up ? `<h3>Your ${esc(item.name)} is now ${t.name}!</h3><p>You've finished “${esc(item.chapter)}” ${n} times.${t.next ? ` ${t.next.at - n} more to make it ${t.next.name}.` : " It's as legendary as a badge gets."}</p>` : `<h3>You earned the ${esc(item.name)}!</h3><p>For finishing “${esc(item.chapter)}”. It's in ${esc(name(s))}'s Badge Case. Finish the chapter again to make it sparkle.</p>`}
      <div class="row"><button type="button" class="pin">Pin it on ${esc(name(s))}</button><button type="button" class="ghost later">Later</button></div>`;
    document.body.appendChild(el);
    el.querySelector(".pin").onclick = () => { const t = load(); t.equip.badge = item.id; save(t); el.remove(); paintDock(); openPal("badges") };
    el.querySelector(".later").onclick = () => el.remove();
    try { meowSound(stageOf(s.pts)) } catch (e) { }
  }
  window.addEventListener("bio:badge", e => {
    const d = e.detail || {}, W = window.BioWardrobe;
    const added = syncBadges(); added.forEach((i, n) => setTimeout(() => badgeWon(i), n * 300));
    if (d.up && !added.length && W && W.byId["badge-" + d.chapter]) badgeWon(W.byId["badge-" + d.chapter], true);   // a new sparkle tier
    paintDock();
  });
  const openBadges = () => openPal("badges");
  function closeShop() { if (shop) { shop.remove(); shop = null } }
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeShop() });

  // ===== Study pal: on pages with questions, Dexter leaves the corner and stays with the student.
  // He sits beside the question (in the margin on wide screens, bottom corner on phones), bats a yarn ball while she reads,
  // scurries over to the answer she picks to react, then goes back to playing. Tap him for the Closet / Shop / Progress.
  const PAL_YARN = `<svg viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="10.5" fill="#4f8dff" stroke="#3a2a1e" stroke-width="2"/><path d="M5 10 Q13 5 21 12 M5 15 Q13 9 21 17 M9 4.5 Q15 13 11 23" stroke="#2c5fc4" stroke-width="1.6" fill="none"/></svg>`;
  let palOn = false, palAt = null, lastOpt = null, lastOptAt = 0, visiting = 0, rafQ = 0;
  // Playtime: Dexter switches between things cats love to do while the student reads (all toys are original SVG)
  const OLC = "#3a2a1e";
  const TOYS = {
    yarn: PAL_YARN,
    butterfly: `<svg viewBox="0 0 30 24" aria-hidden="true"><g class="wl"><path d="M15 12 C9 2 2 3 3 9 C4 14 10 14 15 12Z" fill="#ff9f43" stroke="${OLC}" stroke-width="1.4"/><path d="M15 12 C10 16 5 20 8 22 C11 23 14 18 15 12Z" fill="#ffc46b" stroke="${OLC}" stroke-width="1.4"/><circle cx="8" cy="8" r="1.4" fill="#fff"/></g><g class="wr"><path d="M15 12 C21 2 28 3 27 9 C26 14 20 14 15 12Z" fill="#ff9f43" stroke="${OLC}" stroke-width="1.4"/><path d="M15 12 C20 16 25 20 22 22 C19 23 16 18 15 12Z" fill="#ffc46b" stroke="${OLC}" stroke-width="1.4"/><circle cx="22" cy="8" r="1.4" fill="#fff"/></g><path d="M15 7 v11" stroke="${OLC}" stroke-width="2" stroke-linecap="round"/><path d="M15 7 l-2.4 -4.4 M15 7 l2.4 -4.4" stroke="${OLC}" stroke-width="1" stroke-linecap="round"/></svg>`,
    mouse: `<svg viewBox="0 0 34 20" aria-hidden="true"><path d="M6 14 Q-1 13 2 6" stroke="#8a8f99" stroke-width="1.8" fill="none" stroke-linecap="round"/><ellipse cx="17" cy="13" rx="11" ry="6.4" fill="#b8bec8" stroke="${OLC}" stroke-width="1.5"/><circle cx="22" cy="7" r="3.6" fill="#ffc2cf" stroke="${OLC}" stroke-width="1.3"/><circle cx="25.6" cy="11.4" r="1.2" fill="${OLC}"/><circle cx="28.2" cy="14" r="1.2" fill="#ff7a9a"/><path d="M27.6 14 l4 -1.2 M27.6 15 l4 1" stroke="${OLC}" stroke-width=".7"/><path d="M12 19 v-2 M20 19 v-2" stroke="${OLC}" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    laser: `<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="#ff3b30" opacity=".22"/><circle cx="10" cy="10" r="4.6" fill="#ff3b30"/><circle cx="8.6" cy="8.6" r="1.5" fill="#fff" opacity=".85"/></svg>`,
    feather: `<svg viewBox="0 0 24 60" aria-hidden="true"><path d="M12 0 V30" stroke="#8b5a2b" stroke-width="2"/><path d="M12 30 C4 37 4 50 12 58 C20 50 20 37 12 30Z" fill="#c084fc" stroke="${OLC}" stroke-width="1.4"/><path d="M12 33 V56 M12 41 l-5 -3 M12 47 l-5 -3 M12 41 l5 -3 M12 47 l5 -3" stroke="#7c3aed" stroke-width="1"/><path d="M12 31 C7 27 5 23 8 20 M12 31 C17 27 19 23 16 20" stroke="#f472b6" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
    leaf: `<svg viewBox="0 0 24 16" aria-hidden="true"><path d="M2 8 C8 0 18 0 22 8 C18 16 8 16 2 8Z" fill="#7cc35a" stroke="${OLC}" stroke-width="1.4"/><path d="M3 8 H21 M9 8 l3 -3 M9 8 l3 3 M15 8 l3 -3 M15 8 l3 3" stroke="#3f8a3a" stroke-width="1"/></svg>`,
    nap: `<span class="zz">z</span><span class="zz">z</span><span class="zz">Z</span>`,
    box: "", tail: ""
  };
  const BOX_FRONT = `<svg viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true"><path d="M2 10 L-4 0 L28 0 L32 10Z M98 10 L104 0 L72 0 L68 10Z" fill="#c98b52" stroke="${OLC}" stroke-width="2.2" stroke-linejoin="round"/><path d="M2 10 H98 L94 49 H6Z" fill="#d9a066" stroke="${OLC}" stroke-width="2.6" stroke-linejoin="round"/><path d="M44 10 V49 M56 10 V49" stroke="#e8c48f" stroke-width="3" opacity=".8"/><path d="M14 22 l6 6 M20 22 l-6 6" stroke="#a8713e" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  const ACTS = ["yarn", "butterfly", "mouse", "laser", "feather", "leaf", "box", "tail"];
  const ACT_LABEL = { yarn: "playing with his yarn ball", butterfly: "chasing a butterfly", mouse: "hunting a toy mouse", laser: "chasing a laser dot", feather: "swatting a feather toy", leaf: "pouncing on a falling leaf", box: "sitting in a box", tail: "chasing his tail", nap: "taking a cat nap" };
  let act = ACTS[Math.random() * ACTS.length | 0], lastMove = Date.now(), mood = null, moodT = 0;
  // Body pose per game: on all fours to hunt the mouse, chase the laser or his tail; curled up to nap; sitting otherwise.
  // While he travels (to an answer, or back to his spot) he stands and trots, facing the way he's going.
  const ACT_POSE = { mouse: "stand", laser: "stand", tail: "stand", nap: "lie" };
  let moving = false, facing = -1, walkT = 0;
  function walkTo(pos, then) {
    const dx = palAt ? pos.x - palAt.x : 0, far = !palAt || Math.hypot(dx, pos.y - palAt.y) > 14;
    if (far) { const f = dx > 2 ? 1 : dx < -2 ? -1 : facing; if (!moving || f !== facing) { moving = true; facing = f; paintPal() } }
    place(pos);
    clearTimeout(walkT); walkT = setTimeout(() => { if (moving && !visiting) { moving = false; paintPal() } if (then) then() }, far ? 600 : 0);
  }
  const ACT_EYES = { yarn: "open", butterfly: "wide", mouse: "focus", laser: "dilated", feather: "dilated", leaf: "wide", box: "sleepy", tail: "dilated", nap: "sleep" };
  function eyesNow(k) {
    if (k === 0) return mood || (act === "nap" ? "sleep" : "closed");   // the newborn's eyes stay shut unless he's reacting
    return mood || ACT_EYES[act] || "open";
  }
  function setMood(m, ms) { mood = m; clearTimeout(moodT); paintPal(); moodT = setTimeout(() => { mood = null; paintPal() }, ms) }
  function setAct(a) { if (a !== act) { act = a; paintPal() } }
  function nextAct() { const pool = ACTS.filter(x => x !== act); setAct(pool[Math.random() * pool.length | 0]) }
  setInterval(() => {   // a new game every 15 s; a cat nap after 45 s without any interaction
    if (!palOn || off() || visiting || document.hidden) return;
    if (act !== "nap" && Date.now() - lastMove > 45000) setAct("nap"); else if (act !== "nap") nextAct();
  }, 15000);
  ["pointerdown", "keydown", "scroll", "touchstart"].forEach(t => addEventListener(t, () => { lastMove = Date.now(); if (act === "nap") nextAct() }, { passive: true, capture: true }));
  const shown = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight };
  const palSize = () => innerWidth >= 900 ? 96 : 72;
  function anchor() { const p = $("bbPal"); return palOn && p ? p : $("bbDock") }
  function anchorRect(d) {   // where Dexter is headed (he may still be moving)
    if (d && d.id === "bbPal" && palAt) { const S = palSize(); return { left: palAt.x, top: palAt.y, right: palAt.x + S, bottom: palAt.y + S, width: S, height: S } }
    return d.getBoundingClientRect();
  }
  function questionCard() {
    const all = [...document.querySelectorAll(".opt")], opt = all.find(shown) || all[0];   // a question below the fold still counts
    return opt ? opt.closest("#card, .card, .clue, article, section") || opt.parentElement : null;
  }
  function home() {
    const S = palSize(), sp = getSpot(), card = questionCard();
    if (sp) return spotXY(sp, S);
    if (card) { const r = card.getBoundingClientRect(); if (r.right + S + 28 <= innerWidth) return { x: r.right + 16, y: Math.min(Math.max(r.top + 30, 70), innerHeight - S - 24) } }
    return { x: innerWidth - S - 14, y: innerHeight - S - 18 };
  }
  function place(pos) { const p = $("bbPal"); palAt = pos; if (p) p.style.transform = `translate(${Math.round(pos.x)}px,${Math.round(pos.y)}px)` }
  function settle() {
    if (!palOn || visiting) return;
    const h = home(); if (palAt && Math.abs(h.x - palAt.x) < 1 && Math.abs(h.y - palAt.y) < 1) return;
    if (!palAt || document.body.classList.contains("bb-scrolling")) place(h); else walkTo(h);
  }
  function checkPal() {
    if (off()) { palOn = false; const p = $("bbPal"); if (p) p.remove(); document.body.classList.remove("bb-palon"); return }
    if (!palOn && document.querySelector(".opt")) { palOn = true; document.body.classList.add("bb-palon"); paintPal(); place(home()) }
  }
  function paintPal() {
    if (!palOn || off()) return;
    const s = load(), k = stageOf(s.pts), mult = XP() ? XP().multiplier(s.streak) : 1;
    let p = $("bbPal");
    if (!p) { p = document.createElement("button"); p.id = "bbPal"; p.type = "button"; p.className = "bb-pal"; p.onclick = () => openPal("closet"); document.body.appendChild(p); makeMovable(p, palSize, (x, y) => place({ x, y })); if (palAt) place(palAt) }
    p.style.setProperty("--ps", palSize() + "px");
    p.setAttribute("aria-label", `Study buddy ${name(s)}, level ${level(s.pts)}, ${ACT_LABEL[act]}. Open closet and shop`); p.title = `${name(s)} is ${ACT_LABEL[act]} · drag to move him`;
    ACTS.concat("nap").forEach(a => p.classList.toggle("act-" + a, a === act));
    const pose = moving ? "stand" : ACT_POSE[act] || "sit";
    ["sit", "stand", "lie"].forEach(x => p.classList.toggle("pose-" + x, x === pose)); p.classList.toggle("moving", moving);
    p.innerHTML = `<span class="bb-toy">${TOYS[act]}</span><span class="bb-palart">${art(k, null, { eyes: moving && !mood ? (k ? "open" : "closed") : eyesNow(k), pose, flip: pose === "stand" && facing > 0 })}</span>${act === "box" ? `<span class="bb-boxfront">${BOX_FRONT}</span>` : ""}<span class="bb-lv">Lv ${level(s.pts)}</span>${s.streak >= 3 ? `<span class="bb-streak" title="${s.streak} right in a row">${FLAME}×${mult}</span>` : ""}`;
  }
  // When she picks an answer, Dexter scurries to it (beside it on wide screens, peeking over its edge on phones)
  function visit() {
    const p = $("bbPal"); if (!palOn || !p || !lastOpt || Date.now() - lastOptAt > 2000 || !document.contains(lastOpt)) return;
    const S = palSize(), r = lastOpt.getBoundingClientRect(), card = questionCard(), cr = card ? card.getBoundingClientRect() : null;
    const pos = cr && cr.right + S + 28 <= innerWidth ? { x: cr.right + 16, y: r.top + r.height / 2 - S * .6 } : { x: Math.min(r.right - S * .8, innerWidth - S - 6), y: r.top + r.height / 2 - S * .85 };
    pos.y = Math.min(Math.max(pos.y, 8), innerHeight - S - 8);
    clearTimeout(visiting); p.classList.remove("run"); void p.offsetWidth; p.classList.add("run");
    moving = true; facing = palAt && pos.x > palAt.x + 2 ? 1 : -1; paintPal(); place(pos);
    setTimeout(() => { if (visiting) { moving = false; paintPal() } }, 650);   // arrives: back to his game's pose to react
    visiting = setTimeout(() => { visiting = 0; p.classList.remove("run"); settle() }, 2300);
  }
  // ===== Moving Dexter: she can drag him (or use arrow keys) anywhere and he stays there. Saved on this device as a
  // fraction of the screen, so the spot survives resizing and rotating; Progress has a button to let him roam again.
  const SPOT_KEY = KEY + "-spot", PAD = 8;
  function getSpot() { try { const v = JSON.parse(localStorage.getItem(SPOT_KEY) || "null"); return v && isFinite(v.fx) && isFinite(v.fy) ? v : null } catch (e) { return null } }
  function setSpot(v) { try { v ? localStorage.setItem(SPOT_KEY, JSON.stringify(v)) : localStorage.removeItem(SPOT_KEY) } catch (e) { } const d = $("bbDock"); if (d) dockSpot(d); clearTimeout(visiting); visiting = 0; settle() }
  const c01 = v => Math.min(1, Math.max(0, v));
  const spotXY = (sp, S) => ({ x: PAD + sp.fx * Math.max(0, innerWidth - S - 2 * PAD), y: PAD + sp.fy * Math.max(0, innerHeight - S - 2 * PAD) });
  const xySpot = (x, y, S) => ({ fx: c01((x - PAD) / Math.max(1, innerWidth - S - 2 * PAD)), fy: c01((y - PAD) / Math.max(1, innerHeight - S - 2 * PAD)) });
  const clampXY = (x, y, S) => ({ x: Math.min(Math.max(x, PAD), innerWidth - S - PAD), y: Math.min(Math.max(y, PAD), innerHeight - S - PAD) });
  function dockSpot(d) {
    const sp = getSpot();
    if (!sp) { d.style.left = d.style.top = d.style.right = d.style.bottom = ""; return }
    const q = spotXY(sp, 64); d.style.left = q.x + "px"; d.style.top = q.y + "px"; d.style.right = d.style.bottom = "auto";
  }
  function makeMovable(el, size, moveTo) {
    let g = null, dragged = 0;
    el.addEventListener("pointerdown", e => {
      if (e.button) return;
      e.preventDefault();   // no text selection or native link drag from what's under him (a tap still clicks)
      const o = el.id === "bbPal" && palAt ? palAt : { x: el.offsetLeft, y: el.offsetTop };   // layout box, ignoring any scale
      g = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: o.x, oy: o.y, moved: false };
      try { el.setPointerCapture(e.pointerId) } catch (err) { }   // keep getting moves even when a fast flick leaves him behind
    });
    el.addEventListener("pointermove", e => {
      if (!g || e.pointerId !== g.id) return;
      const dx = e.clientX - g.sx, dy = e.clientY - g.sy;
      if (!g.moved) {
        if (Math.hypot(dx, dy) < 8) return;   // a tap still opens the Closet; only a real drag moves him
        g.moved = true;
        clearTimeout(visiting); visiting = 0; el.classList.add("drag", "run");
      }
      const q = clampXY(g.ox + dx, g.oy + dy, size()); g.x = q.x; g.y = q.y; moveTo(q.x, q.y);
    });
    const end = e => {
      if (!g || e.pointerId !== g.id) return;
      const was = g; g = null;
      if (!was.moved) return;
      dragged = Date.now(); el.classList.remove("drag", "run");
      if (was.x !== undefined) { setSpot(xySpot(was.x, was.y, size())); say("I'll sit here!") }
    };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
    el.addEventListener("dragstart", e => e.preventDefault());   // no native drag-and-drop ghost (it would cancel our drag)
    el.addEventListener("click", e => { if (Date.now() - dragged < 400) { e.stopImmediatePropagation(); e.preventDefault() } }, true);
    el.addEventListener("keydown", e => {   // arrow keys nudge him (Shift for bigger steps)
      const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!k) return;
      e.preventDefault(); e.stopPropagation();
      const S = size(), o = el.id === "bbPal" && palAt ? palAt : { x: el.offsetLeft, y: el.offsetTop }, step = e.shiftKey ? 80 : 24;
      const q = clampXY(o.x + k[0] * step, o.y + k[1] * step, S); moveTo(q.x, q.y); setSpot(xySpot(q.x, q.y, S));
    });
  }
  const queue = () => { if (rafQ) return; rafQ = requestAnimationFrame(() => { rafQ = 0; checkPal(); settle() }) };
  document.addEventListener("click", e => { const o = e.target.closest && e.target.closest(".opt"); if (o) { lastOpt = o; lastOptAt = Date.now() } }, true);
  addEventListener("scroll", queue, { passive: true }); addEventListener("resize", () => { paintPal(); const d = $("bbDock"); if (d) dockSpot(d); queue() });
  new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true });

  // ===== Greeting: once per visit, Dexter walks in and says hello, then heads to his spot
  const GREET_KEY = KEY + "-greeted";
  function greet() {
    if (off()) return;
    try { if (sessionStorage.getItem(GREET_KEY)) return; sessionStorage.setItem(GREET_KEY, "1") } catch (e) { return }
    const s = load(), k = stageOf(s.pts), nm = name(s), h = new Date().getHours(), L = level(s.pts), nx = nextAt(k);
    const hello = h < 5 ? "Up late studying?" : h < 12 ? "Good morning!" : h < 18 ? "Good afternoon!" : "Good evening!";
    let line;
    if (!s.correct && !s.pts) line = `Hi, I'm ${nm}! Answer questions and I'll grow up with you. Every right answer earns XP, and gold for my closet.`;
    else {
      let days = null; try { const ex = window.BioSettings && window.BioSettings.examDate && window.BioSettings.examDate(); if (ex) days = Math.ceil((ex - Date.now()) / 864e5) } catch (e) { }
      const tip = days !== null && days >= 0 && days <= 7 ? (days === 0 ? "Your exam is today. You've got this!" : `${days} day${days === 1 ? "" : "s"} until your exam. Let's practice!`)
        : nx !== null && nx - s.pts <= 80 ? `Only ${fmt(nx - s.pts)} XP until I evolve!`
        : s.gold >= 60 ? `You have ${fmt(s.gold)} gold. Want to dress me up?`
        : `${fmt(lvXP(L + 1) - s.pts)} XP to Level ${L + 1}. Let's go!`;
      line = `${hello} Welcome back. ${tip}`;
    }
    const g = document.createElement("div"); g.className = "bb-greet"; g.setAttribute("role", "status");
    g.innerHTML = `<div class="gwrap"><div class="gbubble"><b>${esc(nm)}</b><span>${esc(line)}</span><button type="button" class="gbtn">Let's study!</button></div><button type="button" class="gdex" aria-label="Close the greeting">${art(k, null, { eyes: k === 0 ? "closed" : "happy" })}</button></div>`;
    document.body.appendChild(g); document.body.classList.add("bb-greeting");
    let gone = false;
    const leave = () => { if (gone) return; gone = true; g.classList.add("leave"); setTimeout(() => { g.remove(); document.body.classList.remove("bb-greeting") }, 600) };
    g.querySelector(".gbtn").onclick = leave; g.querySelector(".gdex").onclick = leave;
    setTimeout(leave, 8000);
  }

  function setEnabled(on) { try { on ? localStorage.removeItem(OFF_KEY) : localStorage.setItem(OFF_KEY, "1") } catch (e) { } paintDock() }
  window.addEventListener("bio:correct", gain);
  window.addEventListener("bio:wrong", miss);

  function mount() { const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st); syncBadges(); paintDock(); greet() }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
  window.BioBuddy = { enabled: () => !off(), setEnabled, soundOn, setSound, open: openCard, openShop, openBadges, syncBadges, play: a => setAct(a), activity: () => act, art, STAGES, state: load, level };
})();
