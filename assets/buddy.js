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
  function eye(u, x, y, mode) {
    if (mode === "closed") return `<path d="M${x - 6} ${y + 1} Q${x} ${y - 5} ${x + 6} ${y + 1}" stroke="${OL}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    const out = x < 60 ? -1 : 1, m = v => out < 0 ? v : -v;   // m(): mirror x offsets for the right eye
    return `<ellipse cx="${x}" cy="${y + 1.6}" rx="5.8" ry="6.2" fill="url(#${u}iris)" stroke="${OL}" stroke-width="1.8"/>
      <ellipse cx="${x + m(.6)}" cy="${y + 2.2}" rx="1.9" ry="3.3" fill="#1f2a18"/>
      <ellipse cx="${x + m(-2)}" cy="${y - 1.6}" rx="2" ry="2.4" fill="#fff"/><circle cx="${x + m(2.4)}" cy="${y + 4}" r="1" fill="#fff"/>
      <path d="M${x + m(-6.6)} ${y - 6} Q${x} ${y - 5} ${x + m(6.6)} ${y - 6} L${x + m(6.6)} ${y - 2} Q${x} ${y - 3.2} ${x + m(-6.6)} ${y - 2}Z" fill="${FUR}"/><path d="M${x + m(-7.2)} ${y - 1.6} Q${x} ${y - 3.6} ${x + m(7.4)} ${y - 1.2}" stroke="${OL}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M${x + m(-6)} ${y + 6.4} Q${x} ${y + 9.2} ${x + m(5)} ${y + 6.6}" stroke="${OL}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".6"/>
      <path d="M${x + m(-7.8)} ${y - 10.6} L${x + m(6.8)} ${y - 8.4}" stroke="#6b3f17" stroke-width="4.2" stroke-linecap="round"/>`;
  }
  // The kitten at full size, standing on y=108; o: { sc, eyes, tail, extraBack, extraFront, glasses }
  function kitty(u, o) {
    const tail = o.tail === "down"
      ? `M76 100 C90 104 96 98 94 90`
      : `M77 98 C94 96 98 78 92 66 C89 60 84 62 86 67`;
    const body = `<path d="${tail}" stroke="${OL}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="${tail}" stroke="${FUR}" stroke-width="5.6" fill="none" stroke-linecap="round"/>
      ${o.tail === "down" ? "" : `<path d="M90 70 C89 66 86 64 86 67" stroke="${FUR_L}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`}
      <path d="M37 92 Q37 76 60 75 Q83 76 83 92 Q83 109 60 109 Q37 109 37 92Z" fill="${FUR}" ${ln}/>
      <path d="M44 98 Q60 112 76 98 Q74 108 60 108.5 Q46 108 44 98Z" fill="${FUR_D}" opacity=".55"/>
      <path d="M48 84 L52 89 L54 84.5 L57 90 L60 84 L63 90 L66 84.5 L68 89 L72 84 Q74 100 60 106 Q46 100 48 84Z" fill="${FUR_L}"/>
      <path d="M55 96 q5 3 10 0" stroke="${FUR_D}" stroke-width="1.2" fill="none" opacity=".7"/>`;
    const paws = `      <ellipse cx="49.5" cy="105.2" rx="8" ry="5" fill="${FUR_L}" ${ln}/><ellipse cx="70.5" cy="105.2" rx="8" ry="5" fill="${FUR_L}" ${ln}/>
      <path d="M47 104 v3 M52 104 v3 M68 104 v3 M73 104 v3" stroke="${OL}" stroke-width="1.2" stroke-linecap="round"/>`;
    const head = `
      <path d="M35 47 L36.5 15 L43.5 21.5 L41.5 25 L46.5 25.5 L56 33Z" fill="${FUR}" ${ln}/><path d="M39 40 L40 23 L42.5 25.5 L46 27.5 L51 33Z" fill="${PINK}"/>
      <path d="M85 47 L83.5 15 L64 33Z" fill="${FUR}" ${ln}/><path d="M81 40 L80 22.5 L69 33Z" fill="${PINK}"/>
      <path d="M32.5 58 L25 61 L31.5 65 L24.5 69.5 L32 71.5 L28.5 76 L37 75.5 Q43 85 60 85.5 Q77 85 83 75.5 L91.5 76 L88 71.5 L95.5 69.5 L88.5 65 L95 61 L87.5 58 Q88 33 60 32 Q32 33 32.5 58Z" fill="${FUR}" ${ln}/>
      <path d="M37 74 Q47 82.5 60 83 Q73 82.5 83 74 Q77 86 60 86 Q43 86 37 74Z" fill="${FUR_D}" opacity=".55"/>
      <path d="M41 45 L42 27 L50 39 L53 21 L60 37 L66 20.5 L69.5 37 L78 25 L79 45 Q60 39 41 45Z" fill="${FUR_L}" ${ln}/>
      <path d="M50 39 L52 31 M60 37 L64 28 M69.5 37 L74 31" stroke="${FUR_D}" stroke-width="1.4" stroke-linecap="round"/>
      ${eye(u, 48.5, 60, o.eyes)}${eye(u, 71.5, 60, o.eyes)}
      
      <path d="M58.2 67.6 L61.8 67.6 L60 69.8Z" fill="${PINK_D}" stroke="${OL}" stroke-width="1" stroke-linejoin="round"/>
      ${o.eyes === "closed" ? `<path d="M55.4 71 Q57.7 74.4 60 71.2 Q62.3 74.4 64.6 71" stroke="${OL}" stroke-width="1.6" fill="none" stroke-linecap="round"/>` : `<path d="M54.6 71.4 Q57.4 74.2 60 71.4 Q63.4 74.6 66.8 69.6" stroke="${OL}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M61.8 72.9 L63.2 77.4 L64.8 72.2Z" fill="#fff" stroke="${OL}" stroke-width="1.1" stroke-linejoin="round"/>`}
      <path d="M33 66 L22 64 M33 69 L22 70.5 M87 66 L98 64 M87 69 L98 70.5" stroke="${OL}" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>`;
    const glasses = o.glasses ? `<circle cx="48.5" cy="60" r="10" fill="#bfe6ff" fill-opacity=".18" stroke="${OL}" stroke-width="2"/><circle cx="71.5" cy="60" r="10" fill="#bfe6ff" fill-opacity=".18" stroke="${OL}" stroke-width="2"/><path d="M58.5 58.5 Q60 56.5 61.5 58.5" stroke="${OL}" stroke-width="2" fill="none"/><path d="M41 54.5 l3 -2" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/><path d="M64 54.5 l3 -2" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>` : "";
    const sc = o.sc;
    return `<defs><radialGradient id="${u}iris" cx=".5" cy=".6" r=".6"><stop offset="0" stop-color="#9a6a24"/><stop offset=".32" stop-color="#b98a35"/><stop offset=".55" stop-color="#7d9a3c"/><stop offset=".8" stop-color="#3f8a45"/><stop offset="1" stop-color="#2a6436"/></radialGradient></defs>
      <ellipse cx="60" cy="109" rx="${30 * sc}" ry="3.6" fill="#000" opacity=".12"/>
      <g transform="translate(60 109) scale(${sc}) translate(-60 -109)">${o.back || ""}${body}${o.mid || ""}${paws}${head}${glasses}${o.front || ""}</g>${o.over || ""}`;
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
  function art(k, eq) {
    const u = "dx" + (++uidN), g = FORM_GEAR[k], W = window.BioWardrobe, E = eq || load().equip || {};
    // per slot: an item id = wear it · "none" = nothing (even the form's own gear) · unset = the form's own gear
    const worn = slot => E[slot] === "none" ? "" : W && E[slot] && W.byId[E[slot]] ? W.byId[E[slot]].svg : null;
    const pick = slot => { const w = worn(slot); return w !== null ? w : g[slot] ? g[slot]() : "" };
    const face = worn("face");
    const svg = kitty(u, { sc: g.sc, eyes: g.eyes || "open", tail: g.tail, glasses: face === null && !!g.glasses,
      mid: pick("outfit") + pick("neck"), front: (face || "") + (g.extra ? g.extra() : "") + pick("hat"), over: pick("held") + (g.over || "") });
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
.sh-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:var(--c-fill);border-radius:9px;padding:2px;margin:6px 16px 4px}
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
.sh-tabs.pal{margin:2px 16px 10px}
.sh-tabs.sub{margin-top:4px}
.sh-tile .cl-ic{display:grid;place-items:center;height:58px;color:var(--c-muted)} .sh-tile .cl-ic svg{width:30px;height:30px}
.sh-tile.cl.on{border-color:#34c759;background:color-mix(in srgb,#34c759 12%,var(--c-fill))}
.sh-tile.cl.on::after{content:"✓";position:absolute;top:6px;right:8px;font-weight:800;color:#248a3d}
.cl-empty{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;background:var(--c-fill);border-radius:16px;padding:16px;margin:6px 16px 4px}
.cl-empty span{font-size:13.5px;color:var(--c-muted)}
.cl-reset{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:16px 16px 0}
.pal-prog{text-align:center;padding:0 22px}
.bb-shop.still{animation:none}
@media (prefers-reduced-motion:reduce){.bb-say,.bb-yarn,.bb-yarn svg{animation-duration:.01s}.bb-dock .bb-pic,.bb-card .bb-big,.bb-evo.done .new{animation:none}.bb-evo .old{animation:none;opacity:0}.bb-evo .new{animation:none;opacity:1}.bb-evo .glow{display:none}}`;

  // ===== Dock (bottom-right) with a ring that fills toward the next evolution
  function ringPct(pts) { const k = stageOf(pts), a = STAGES[k].at, b = nextAt(k); return b === null ? 1 : (pts - a) / (b - a) }
  function paintDock() {
    let d = $("bbDock");
    if (off()) { if (d) d.remove(); document.body.classList.remove("bb-on"); return }
    const s = load(), k = stageOf(s.pts), C = 2 * Math.PI * 30, mult = XP() ? XP().multiplier(s.streak) : 1;
    if (!d) { d = document.createElement("button"); d.id = "bbDock"; d.type = "button"; d.className = "bb-dock"; d.onclick = () => openPal("closet"); document.body.appendChild(d) }
    document.body.classList.add("bb-on");
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
      <div class="bb-acts"><button type="button" id="bbRename">Rename</button><button type="button" id="bbHide">Hide buddy</button></div>
    </div>`;
  }

  // ===== A correct answer: XP from the question's difficulty × the streak multiplier, then hop / level up / evolve
  const STREAK_CHEERS = { 3: "3 in a row!", 5: "5 in a row!", 10: "10 in a row!", 15: "15 in a row!", 25: "25 in a row!" };
  // Pops float up from the buddy; ones that overlap in time stack upward instead of piling on top of each other
  const live = [];
  function pop(lines, cls) {
    const d = $("bbDock"); if (!d) return;
    const r = d.getBoundingClientRect(), p = document.createElement("span");
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
    const d = $("bbDock"); if (!d) return;
    if (sayEl) sayEl.remove();
    const r = d.getBoundingClientRect(), b = document.createElement("span");
    b.className = "bb-say"; b.textContent = text; b.setAttribute("aria-hidden", "true");
    b.style.right = (innerWidth - r.left + 10) + "px"; b.style.top = (r.top + r.height * .1) + "px";
    document.body.appendChild(b); sayEl = b;
    setTimeout(() => { b.remove(); if (sayEl === b) sayEl = null }, 1500);
  }
  function dropYarn() {
    const d = $("bbDock"); if (!d) return;
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
    paintDock();
    const d = $("bbDock"); if (!d) return;
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
    paintDock();
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
    function closetHTML(s, k) {
      const g = FORM_GEAR[k], cur = s.equip;
      const rows = W.SLOTS.map(sl => {
        const mine = W.ITEMS.filter(i => i.slot === sl.key && s.owned.includes(i.id));
        const hasOwn = sl.key === "face" ? !!g.glasses : !!g[sl.key];
        const opt = (val, label, icon, extra = "") => `<button type="button" class="sh-tile cl${(cur[sl.key] === val || (val === undefined && cur[sl.key] === undefined)) ? " on" : ""}" data-slot="${sl.key}" data-val="${val === undefined ? "" : val}" aria-pressed="${cur[sl.key] === val}">${icon}<b>${label}</b>${extra}</button>`;
        return `<p class="sh-cap">${esc(sl.name)}</p><div class="sh-grid">
          ${hasOwn ? opt(undefined, "Dexter's own", `<span class="cl-ic">${OWN_ICON}</span>`, `<span class="tag">This form's gear</span>`) : ""}
          ${opt("none", "None", `<span class="cl-ic">${NONE_ICON}</span>`, `<span class="tag">${hasOwn ? "Take it off" : "Nothing here"}</span>`)}
          ${mine.map(it => opt(it.id, esc(it.name), `<svg viewBox="${W.VIEW[it.slot]}" aria-hidden="true">${it.svg}</svg>`, `<span class="tag">${esc(it.set)}</span>`)).join("")}
        </div>`;
      }).join("");
      return `<div class="sh-bar"><p class="sh-hint">Tap to dress Dexter. Mix any items you own, keep his own gear, or take it all off.</p></div>
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
      const body = st.tab === "progress" || !W ? progressHTML(s) : st.tab === "shop" ? shopHTML(s) : closetHTML(s, k);
      shop.innerHTML = `<div class="bb-card bb-shop${st.opened ? " still" : ""}" role="dialog" aria-modal="true" aria-labelledby="shTitle">
        <div class="sh-head"><h3 id="shTitle">${esc(name(s))}</h3><span class="sh-gold" aria-label="${s.gold} gold">${COIN}${fmt(s.gold)}</span><button type="button" class="sh-done" id="shDone">Done</button></div>
        <div class="sh-tabs pal" role="tablist">${[["closet", "Closet"], ["shop", "Shop"], ["progress", "Progress"]].map(([key, label]) => `<button type="button" role="tab" aria-selected="${st.tab === key}" data-tab="${key}">${label}</button>`).join("")}</div>
        ${st.tab === "progress" ? "" : `<div class="sh-stage">${art(k, st.tab === "shop" ? st.tryEq : s.equip)}</div>`}
        ${body}
      </div>`;
      $("shDone").onclick = closeShop;
      shop.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { st.tab = b.dataset.tab; st.sel = null; st.tryEq = Object.assign({}, load().equip); paint(); shop.querySelector(".bb-shop").scrollTop = 0 });
      shop.querySelectorAll("[data-sub]").forEach(b => b.onclick = () => keepScroll(() => { st.sub = b.dataset.sub; st.sel = null; st.tryEq = Object.assign({}, load().equip); paint() }));
      if (st.tab === "progress") {
        $("bbRename").onclick = () => { const n = prompt("Name your study buddy:", s.nick || "Dexter"); if (n === null) return; const t = load(); t.nick = n.trim().slice(0, 24); save(t); paintDock(); paint() };
        $("bbHide").onclick = () => { setEnabled(false); closeShop() };
        return;
      }
      if (st.tab === "closet") {
        const set = fn => keepScroll(() => { const t = load(); fn(t); save(t); paint(); paintDock() });
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
  function closeShop() { if (shop) { shop.remove(); shop = null } }
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeShop() });

  function setEnabled(on) { try { on ? localStorage.removeItem(OFF_KEY) : localStorage.setItem(OFF_KEY, "1") } catch (e) { } paintDock() }
  window.addEventListener("bio:correct", gain);
  window.addEventListener("bio:wrong", miss);

  function mount() { const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st); paintDock() }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
  window.BioBuddy = { enabled: () => !off(), setEnabled, soundOn, setSound, open: openCard, openShop, art, STAGES, state: load, level };
})();
