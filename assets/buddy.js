// Bio Drills · Study buddy
// An original sea turtle (inspired by the World Turtle myth) whose shell grows a forest as the student answers correctly.
// Every correct answer (main drill, HW 3 drill, Word Roots, Bio-pardy) earns XP based on how difficult the
// question is (assets/xp.js), multiplied by the current win streak. Levels and evolutions follow total XP.
// Wrong answers reset the streak but never take XP away. Saved on this device only ("bio-buddy-v1").
// Pages announce answers with: window.dispatchEvent(new CustomEvent("bio:correct", { detail })) and "bio:wrong".
// detail describes the question for the difficulty rating: { kind: "drill", q, prev, prevHist } | { kind: "board", val } | { kind: "root", missed }
// All artwork below is drawn here as SVG.
(() => {
  const KEY = "bio-buddy-v1", OFF_KEY = "bio-buddy-off";
  // An original sea turtle inspired by the World Turtle myth (the land grows on a great turtle's back).
  // Its shell is colonized the way real land is, by ecological succession:
  // bare rock + lichens → mosses → ferns → shrubs and flowers → young trees → a layered climax forest.
  const STAGES = [
    { at: 0, name: "Pebble", form: "Bare-rock hatchling", color: "#6f7f8a",
      fact: "Succession starts on bare rock. Lichens (a fungus plus a photosynthetic partner) are pioneer species: their acids break rock down into the first soil." },
    { at: 100, name: "Mossback", form: "Moss stage", color: "#5fae4f",
      fact: "Mosses move in next. The green carpet is the gametophyte (n); the tiny stalks are sporophytes. No true roots or vascular tissue, and sperm need water to swim." },
    { at: 350, name: "Fernshell", form: "Fern stage", color: "#3f8a3a",
      fact: "With more soil, ferns arrive. They have xylem and phloem and a dominant sporophyte; the brown dots under the fronds are sori, clusters of sporangia." },
    { at: 900, name: "Thicket", form: "Shrub stage", color: "#e9785f",
      fact: "Seed plants take over. Pollen frees them from needing water for fertilization, and flowers and fruits (angiosperms) attract pollinators and spread seeds." },
    { at: 1800, name: "Grovekin", form: "Young-tree stage", color: "#52616c",
      fact: "Saplings race upward toward light. Lignin-stiffened xylem lets them grow tall, and auxin from each tip keeps a main shoot dominant (apical dominance)." },
    { at: 3200, name: "Forestback", form: "Climax forest", color: "#3f8a3a",
      fact: "A climax community: canopy, understory and forest floor. Xylem and lignin let trees stand tall, and fungi and lichens recycle nutrients for the whole ecosystem." }
  ];
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // State: pts = total XP · correct = right answers · streak / best = answers right in a row · last = time of last answer
  const OLD_AT = [0, 5, 15, 35, 70, 120];   // v1 evolved by number of right answers
  const STREAK_TTL = 3 * 60 * 60 * 1000;    // a streak cools off after 3 hours away
  function load() {
    let s = {}; try { s = JSON.parse(localStorage.getItem(KEY) || "{}") || {} } catch (e) { }
    if (s.v !== 2) {   // migrate v1 (xp = count of right answers) without ever moving the buddy back a form
      const n = s.xp | 0; let k = 0; OLD_AT.forEach((t, i) => { if (n >= t) k = i });
      s = { v: 2, pts: Math.max(n * 20, STAGES[k].at), correct: n, streak: 0, best: 0, last: 0, nick: s.nick || "" };
    }
    if (s.streak && Date.now() - (s.last || 0) > STREAK_TTL) s.streak = 0;
    return s;
  }
  const save = s => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch (e) { } };
  const off = () => { try { return localStorage.getItem(OFF_KEY) === "1" } catch (e) { return false } };
  const stageOf = pts => { let k = 0; STAGES.forEach((s, i) => { if (pts >= s.at) k = i }); return k };
  const nextAt = k => STAGES[k + 1] ? STAGES[k + 1].at : null;
  // Levels 1–100. Reaching level L takes A·(L−1)^1.5 XP, with Level 100 at 20,000 XP: quick early levels,
  // a long climb at the top. Forms land at Lv 3 (Mossback), 7, 13, 20 and 30 (Forestback); 30–100 is mastery.
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

  // ===== Artwork (viewBox 0 0 120 120), side view facing right. An original character.
  // Design rules: a sea turtle (flippers, smooth domed shell, round beakless face), distinct silhouette per
  // stage, clean dark outlines, palette of Slate Gray / Leaf Green / Terracotta Coral (+ sea-green skin, sand),
  // cel shading, and proportions going from round and big-eyed to broad, low and ancient.
  const OL = "#22302b", OW = 2.2;
  const SLATE = "#6f7f8a", SLATE_D = "#52616c", SLATE_L = "#98a7b1";
  const SKIN = "#8fcfb4", SKIN_D = "#66a98e", SKIN_L = "#bfe8d6";
  const LEAF = "#5fae4f", LEAF_D = "#3f8a3a", LEAF_L = "#9ad27f";
  const CORAL = "#e9785f", CORAL_L = "#f6a58f", SAND = "#ecdfc0", SAND_D = "#d8c597", WATER = "#7cc4e8";
  const ln = `stroke="${OL}" stroke-width="${OW}" stroke-linejoin="round"`;
  let uidN = 0;
  const leaf = (x, y, len, rot, fill) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 C${len * .35} ${-len * .32} ${len * .8} ${-len * .3} ${len} 0 C${len * .8} ${len * .3} ${len * .35} ${len * .32} 0 0Z" fill="${fill}" ${ln}/><path d="M2 0 L${len * .85} 0" stroke="${OL}" stroke-width=".9" opacity=".55"/></g>`;
  function frond(x, y, len, rot, fill, sori) {   // fern frond: midrib + paired leaflets, sori on some
    let p = "";
    for (let i = 1; i <= 7; i++) {
      const t = i / 8, px = len * t, w = len * .2 * (1 - t * .65);
      p += `<ellipse cx="${px}" cy="${-w * .55}" rx="${w * .55}" ry="${w * .3}" transform="rotate(-35 ${px} ${-w * .55})" fill="${fill}" stroke="${OL}" stroke-width="1"/><ellipse cx="${px}" cy="${w * .55}" rx="${w * .55}" ry="${w * .3}" transform="rotate(35 ${px} ${w * .55})" fill="${fill}" stroke="${OL}" stroke-width="1"/>` +
        (sori && i % 2 ? `<circle cx="${px + 1}" cy="${w * .5}" r=".9" fill="#7a4f2b"/>` : "");
    }
    return `<g transform="translate(${x} ${y}) rotate(${rot})">${p}<path d="M0 0 Q${len * .5} ${-len * .04} ${len} 0" stroke="${OL}" stroke-width="1.5" fill="none"/></g>`;
  }
  // Circles merged under one outline (outline layer, shade layer, fill layer, highlights)
  const cluster = (cs, fill, shade, hi) => cs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${OL}" stroke="${OL}" stroke-width="${OW * 2}"/>`).join("") +
    cs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${shade}"/>`).join("") +
    cs.map(([x, y, r]) => `<circle cx="${x - r * .12}" cy="${y - r * .18}" r="${r * .8}" fill="${fill}"/>`).join("") +
    (hi ? cs.map(([x, y, r]) => `<circle cx="${x - r * .35}" cy="${y - r * .42}" r="${r * .2}" fill="${hi}" opacity=".85"/>`).join("") : "");
  const blossom = (x, y, r) => `${[0, 72, 144, 216, 288].map(a => `<ellipse cx="${x}" cy="${y - r * .85}" rx="${r * .5}" ry="${r * .85}" fill="${CORAL}" stroke="${OL}" stroke-width="1" transform="rotate(${a} ${x} ${y})"/>`).join("")}<circle cx="${x}" cy="${y}" r="${r * .42}" fill="#ffd27a" stroke="${OL}" stroke-width=".9"/>`;
  const berry = (x, y, r = 1.8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${CORAL}" stroke="${OL}" stroke-width="1"/><circle cx="${x - r * .35}" cy="${y - r * .35}" r="${r * .3}" fill="${CORAL_L}"/>`;
  function eyeAt(x, y, r, mode) {
    if (mode === "wise") return `<path d="M${x - r} ${y + r * .2} q${r} ${-r * 1.3} ${r * 2} 0" stroke="${OL}" stroke-width="2.3" fill="none" stroke-linecap="round"/><path d="M${x - r * .7} ${y + r * .95} q${r * .7} ${r * .4} ${r * 1.4} 0" stroke="${OL}" stroke-width="1" fill="none" opacity=".5"/><path d="M${x - r * 1.2} ${y - r * 2.1} Q${x} ${y - r * 2.6} ${x + r * 1.3} ${y - r * 1.9}" stroke="${OL}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    return `<ellipse cx="${x}" cy="${y}" rx="${r * .82}" ry="${r}" fill="${OL}"/><ellipse cx="${x + r * .1}" cy="${y + r * .45}" rx="${r * .45}" ry="${r * .3}" fill="#2f6f8f" opacity=".85"/><circle cx="${x + r * .3}" cy="${y - r * .4}" r="${r * .38}" fill="#fff"/><circle cx="${x - r * .35}" cy="${y + r * .35}" r="${r * .14}" fill="#fff"/>`;
  }
  // Flipper: a long, rounded paddle (sea turtle), drawn pointing along +x then rotated
  const paddle = (x, y, len, w, rot, fill, shade) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 ${-w * .5} C${len * .35} ${-w * 1.05} ${len * .85} ${-w * .7} ${len} ${-w * .05} C${len * .8} ${w * .45} ${len * .35} ${w * .75} 0 ${w * .5}Z" fill="${fill}" ${ln}/><path d="M${len * .15} ${w * .35} C${len * .45} ${w * .55} ${len * .75} ${w * .35} ${len * .93} ${w * .02}" stroke="${shade}" stroke-width="${w * .35}" fill="none" stroke-linecap="round" opacity=".9"/>${[.35, .6].map(t => `<circle cx="${len * t}" cy="${-w * .15}" r="${w * .13}" fill="${SKIN_L}" opacity=".8"/>`).join("")}</g>`;
  // The turtle. cx/by: shell center and base; rx/ry: shell size; head at hx,hy with radius hr; a: age 0..1
  function turtle(u, o) {
    const { cx, by, rx, ry, hx, hy, hr, eye, eyeMode, fl, stone } = o;
    const dome = `M${cx - rx} ${by} A${rx} ${ry} 0 0 1 ${cx + rx} ${by} Z`;
    const topY = x => by - ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
    const neckD = `M${cx + rx * .72} ${by - ry * .18} C${cx + rx * .95} ${by - ry * .32} ${hx - hr * 1.1} ${hy + hr * .3} ${hx - hr * .2} ${hy + hr * .15}`;
    const scutes = stone
      ? [[-.45, .45], [-.1, .7], [.3, .5], [-.3, .25], [.15, .2], [.5, .25]].map(([dx, dy], i) => `<circle cx="${cx + dx * rx}" cy="${by - dy * ry}" r="${1.1 + (i % 3) * .5}" fill="${SLATE_D}" opacity=".7"/>`).join("")
      : `<path d="M${cx - rx * .55} ${by - 1} Q${cx - rx * .5} ${by - ry * .55} ${cx - rx * .2} ${by - ry * .8} M${cx + rx * .1} ${by - 1} Q${cx + rx * .05} ${by - ry * .5} ${cx + rx * .25} ${by - ry * .85} M${cx - rx * .8} ${by - ry * .35} Q${cx} ${by - ry * .5} ${cx + rx * .85} ${by - ry * .3}" stroke="${SLATE_D}" stroke-width="1.2" fill="none" opacity=".75"/>`;
    return {
      defs: `<clipPath id="${u}cs"><path d="${dome}"/></clipPath><clipPath id="${u}ch"><ellipse cx="${hx}" cy="${hy}" rx="${hr * 1.08}" ry="${hr * .9}"/></clipPath>`,
      topY,
      far: `${paddle(cx - rx * .55, by + 2, rx * .55, rx * .26, 160, SKIN_D, OL)}${paddle(cx + rx * .45, by + 1, fl * .9, rx * .3, 35, SKIN_D, OL)}
        <path d="M${cx - rx * .95} ${by + 1} q-6 1 -8 4 q5 1 9 -1Z" fill="${SKIN}" ${ln}/>`,
      shell: `<path d="M${cx - rx} ${by} L${cx + rx} ${by} Q${cx + rx - 1} ${by + 6} ${cx + rx - 7} ${by + 7} L${cx - rx + 7} ${by + 7} Q${cx - rx + 1} ${by + 6} ${cx - rx} ${by}Z" fill="${SAND}" ${ln}/>
        <path d="M${cx - rx + 9} ${by + 3.5} L${cx + rx - 9} ${by + 3.5}" stroke="${SAND_D}" stroke-width="1.2"/>
        <path d="${neckD}" stroke="${OL}" stroke-width="${hr * .95 + OW * 2}" fill="none" stroke-linecap="round"/><path d="${neckD}" stroke="${SKIN}" stroke-width="${hr * .95}" fill="none" stroke-linecap="round"/>
        <path d="${dome}" fill="${SLATE}"/>
        <g clip-path="url(#${u}cs)"><ellipse cx="${cx + rx * .1}" cy="${by + ry * .25}" rx="${rx * 1.1}" ry="${ry * .5}" fill="${SLATE_D}"/>${scutes}<ellipse cx="${cx - rx * .35}" cy="${by - ry * .72}" rx="${rx * .3}" ry="${ry * .14}" fill="${SLATE_L}" opacity=".8"/></g>
        <path d="${dome}" fill="none" ${ln}/>`,
      head: `<ellipse cx="${hx}" cy="${hy}" rx="${hr * 1.08}" ry="${hr * .9}" fill="${SKIN}"/>
        <g clip-path="url(#${u}ch)"><ellipse cx="${hx}" cy="${hy + hr * .8}" rx="${hr * 1.2}" ry="${hr * .5}" fill="${SKIN_D}"/>${[[-.45, -.45], [-.1, -.65], [-.6, .05]].map(([dx, dy]) => `<circle cx="${hx + dx * hr}" cy="${hy + dy * hr}" r="${hr * .13}" fill="${SKIN_L}"/>`).join("")}</g>
        <ellipse cx="${hx}" cy="${hy}" rx="${hr * 1.08}" ry="${hr * .9}" fill="none" ${ln}/>
        ${eyeAt(hx + hr * .2, hy - hr * .18, eye, eyeMode)}
        <ellipse cx="${hx - hr * .05}" cy="${hy + hr * .42}" rx="${hr * .24}" ry="${hr * .13}" fill="${CORAL}" opacity=".45"/>
        <path d="M${hx + hr * .55} ${hy + hr * .35} q${hr * .25} ${hr * .2} ${hr * .45} -.1" stroke="${OL}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <circle cx="${hx + hr * .98}" cy="${hy - hr * .05}" r=".8" fill="${OL}"/>`,
      near: `${paddle(cx - rx * .62, by + 4, rx * .5, rx * .24, 172, SKIN, SKIN_D)}${paddle(cx + rx * .55, by + 4, fl, rx * .3, 22, SKIN, SKIN_D)}`
    };
  }
  const sand = (cx, w) => `<ellipse cx="${cx}" cy="106" rx="${w}" ry="7" fill="${SAND}" ${ln}/><ellipse cx="${cx + 4}" cy="108" rx="${w * .8}" ry="3.6" fill="${SAND_D}"/>${[[-.6, -1], [.5, 0], [.1, 2]].map(([d, y]) => `<circle cx="${cx + d * w}" cy="${105 + y}" r=".9" fill="${SAND_D}"/>`).join("")}`;
  // moss carpet hugging the top of the shell, from fraction f0 to f1 of the shell width
  const moss = (t, cx, rx, f0, f1, r, n) => cluster(Array.from({ length: n }, (_, i) => { const x = cx + rx * (f0 + (f1 - f0) * i / (n - 1)); return [x, t(x) + r * .35, r * (.8 + (i % 3) * .14)] }), LEAF, LEAF_D, LEAF_L);
  function art(k) {
    const u = "bb" + (++uidN);
    let g = "", defs = "";
    if (k === 0) {   // Pebble: a round bare-stone hatchling with lichen spots
      const T = turtle(u, { cx: 54, by: 92, rx: 21, ry: 19, hx: 81, hy: 84, hr: 11, eye: 4.6, fl: 15, stone: true });
      defs = T.defs;
      const lichen = [[44, 80, 3.2, CORAL], [58, 76, 2.4, LEAF_L], [64, 86, 2.8, CORAL], [49, 89, 2, LEAF_L], [55, 82, 1.6, CORAL_L]];
      g = `${sand(56, 36)}${T.far}${T.shell}${lichen.map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${OL}" stroke-width="1"/><circle cx="${x + r * .5}" cy="${y + r * .3}" r="${r * .45}" fill="${c}" stroke="${OL}" stroke-width=".8"/>`).join("")}${T.near}${T.head}`;
    } else if (k === 1) {   // Mossback: a carpet of moss with sporophyte stalks, the first fern at the back
      const T = turtle(u, { cx: 52, by: 92, rx: 26, ry: 18, hx: 86, hy: 82, hr: 10, eye: 4.2, fl: 18 });
      defs = T.defs;
      const stalks = [[44, 2], [55, 3], [63, 2]].map(([x, h]) => { const y = T.topY(x) - 2; return `<path d="M${x} ${y} L${x + .5} ${y - 7 - h}" stroke="${OL}" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="${x + .6}" cy="${y - 9 - h}" rx="1.5" ry="2.3" fill="#b07a3c" stroke="${OL}" stroke-width=".9"/>` }).join("");
      g = `${sand(54, 40)}${T.far}${T.shell}${cluster([[29, 86, 3.4], [33, 83, 3]], LEAF, LEAF_D, LEAF_L)}${moss(T.topY, 52, 26, -.82, .82, 4.6, 9)}${stalks}${T.near}${T.head}`;
    } else if (k === 2) {   // Fernshell: moss rim plus a fan of fern fronds and grass
      const T = turtle(u, { cx: 50, by: 92, rx: 28, ry: 18.5, hx: 87, hy: 81, hr: 9.6, eye: 3.9, fl: 20 });
      defs = T.defs;
      const fr = [[36, -150, 20], [43, -120, 24], [51, -95, 27], [59, -70, 24], [66, -42, 19]].map(([x, rot, len], i) => frond(x, T.topY(x) + 3, len, rot, i % 2 ? LEAF : LEAF_D, i % 2 === 0)).join("");
      g = `${sand(52, 42)}${T.far}${T.shell}${fr}${moss(T.topY, 50, 28, -.9, .9, 3.6, 11)}${T.near}${T.head}`;
    } else if (k === 3) {   // Thicket: shrubs with coral flowers and berries, ferns at the edges
      const T = turtle(u, { cx: 50, by: 92, rx: 30, ry: 19, hx: 88, hy: 81, hr: 9.2, eye: 3.6, fl: 21 });
      defs = T.defs;
      const shrub = (x, r) => { const y = T.topY(x) - r * .6; return cluster([[x - r * .7, y + r * .3, r * .7], [x, y - r * .2, r], [x + r * .75, y + r * .25, r * .72]], LEAF, LEAF_D, LEAF_L) };
      g = `${sand(52, 44)}${T.far}${T.shell}${cluster([[23, 88, 3.6], [27, 84, 3.4], [76, 84, 3.4], [79, 87, 3]], LEAF_D, "#2f6e2c", LEAF_L)}
        ${shrub(37, 7)}${shrub(62, 7.5)}${shrub(50, 8.5)}
        ${blossom(34, T.topY(34) - 9, 2.6)}${blossom(53, T.topY(53) - 14, 2.8)}${blossom(65, T.topY(65) - 10, 2.5)}
        ${berry(44, T.topY(44) - 6)}${berry(58, T.topY(58) - 8)}${berry(70, T.topY(70) - 4, 1.5)}
        ${moss(T.topY, 50, 30, -.92, .92, 3, 12)}${T.near}${T.head}`;
    } else if (k === 4) {   // Grovekin: three young trees of different heights (tallest at the back), shrubs below
      const T = turtle(u, { cx: 50, by: 92, rx: 31, ry: 19.5, hx: 89, hy: 81, hr: 9, eye: 3.4, fl: 22 });
      defs = T.defs;
      const tree = (x, h, r) => { const y = T.topY(x) + 1, top = y - h; return `<path d="M${x} ${y} L${x} ${top + r * .5}" stroke="${OL}" stroke-width="5" stroke-linecap="round"/><path d="M${x} ${y} L${x} ${top + r * .5}" stroke="${SLATE}" stroke-width="2.6" stroke-linecap="round"/>${cluster([[x - r * .55, top + r * .35, r * .7], [x, top, r * .9], [x + r * .55, top + r * .35, r * .7]], LEAF, LEAF_D, LEAF_L)}` };
      g = `${sand(52, 46)}${T.far}${T.shell}${tree(36, 32, 9)}${tree(64, 22, 8)}${tree(50, 18, 7)}
        ${cluster([[30, T.topY(30) - 2, 5], [72, T.topY(72) - 1, 4.5], [43, T.topY(43) - 2, 4.5], [57, T.topY(57) - 2, 4.8]], LEAF, LEAF_D, LEAF_L)}
        ${blossom(43, T.topY(43) - 6, 2.3)}${berry(72, T.topY(72) - 4, 1.5)}${berry(30, T.topY(30) - 5, 1.5)}
        ${moss(T.topY, 50, 31, -.94, .94, 2.8, 13)}${T.near}${T.head}`;
    } else {   // Forestback: a whole layered forest (floor, understory, rolling canopy of many trees) and a little spring
      const T = turtle(u, { cx: 50, by: 93, rx: 35, ry: 21, hx: 93, hy: 82, hr: 8.8, eye: 3.1, fl: 23, eyeMode: "wise" });
      defs = T.defs;
      // nine trees of uneven heights spread over the whole shell: the canopy line rises and dips like a hillside
      const trunks = [[20, 12, 5.5], [27, 22, 6.5], [34, 15, 6], [41, 27, 7], [48, 19, 6.5], [55, 25, 7], [62, 16, 6], [69, 21, 6.5], [76, 12, 5.5]];
      const trunkSvg = trunks.map(([x, h]) => { const y = T.topY(x) + 1; return `<path d="M${x} ${y} L${x} ${y - h}" stroke="${OL}" stroke-width="4.6" stroke-linecap="round"/><path d="M${x} ${y} L${x} ${y - h}" stroke="${SLATE}" stroke-width="2.3" stroke-linecap="round"/>` }).join("");
      const crown = ([x, h, r], i) => { const y = T.topY(x) - h; return [[x - r * .55, y + r * .3, r * .62], [x, y - r * .1, r * .8], [x + r * .55, y + r * .3, r * .62]] };
      const back = trunks.filter((_, i) => i % 2 === 1).flatMap(crown), front = trunks.filter((_, i) => i % 2 === 0).flatMap(crown);
      g = `${sand(52, 50)}${T.far}${T.shell}${trunkSvg}
        ${cluster(back, LEAF_D, "#2f6e2c", null)}${cluster(front, LEAF, LEAF_D, LEAF_L)}
        ${trunks.filter((_, i) => i % 3 === 1).map(([x, h]) => berry(x + 2, T.topY(x) - h + 1, 1.6)).join("")}${berry(48, T.topY(48) - 21, 1.6)}${berry(69, T.topY(69) - 18, 1.5)}
        ${frond(18, 90, 10, -170, LEAF_D, true)}${frond(80, 86, 10, -12, LEAF_D, true)}
        ${cluster([[29, T.topY(29) - 3, 4.2], [41, T.topY(41) - 3, 4.6], [58, T.topY(58) - 3, 4.6], [70, T.topY(70) - 3, 4.2]], LEAF, LEAF_D, LEAF_L)}
        ${blossom(36, T.topY(36) - 6, 2.2)}${blossom(64, T.topY(64) - 7, 2.3)}
        ${moss(T.topY, 50, 35, -.95, .95, 2.7, 15)}
        ${[[33, T.topY(33) + 1.5], [55, T.topY(55) + 1.5], [72, T.topY(72) + 1.5]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2" ry="1" fill="${CORAL}" stroke="${OL}" stroke-width=".7" transform="rotate(-20 ${x} ${y})"/>`).join("")}
        <path d="M20 ${T.topY(20) + 2} q-3 4 -2 9 q1 4 -1 7" stroke="${OL}" stroke-width="4.4" fill="none" stroke-linecap="round"/><path d="M20 ${T.topY(20) + 2} q-3 4 -2 9 q1 4 -1 7" stroke="${WATER}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        ${T.near}${T.head}`;
    }
    return `<svg viewBox="0 0 120 120" aria-hidden="true"><defs>${defs}</defs>${g}</svg>`;
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
@keyframes bbIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes bbHop{0%{transform:translateY(0) scale(1)}35%{transform:translateY(-10px) scale(1.08,.95)}70%{transform:translateY(0) scale(.96,1.04)}100%{transform:none}}
@keyframes bbPlus{0%{opacity:0;transform:translateY(0)}12%{opacity:1}75%{opacity:1}100%{opacity:0;transform:translateY(-40px)}}
@keyframes bbFade{from{opacity:0}} @keyframes bbUp{from{opacity:0;transform:translateY(20px) scale(.97)}}
@keyframes bbFlickOld{0%,12%{opacity:1;filter:none}20%{opacity:1;filter:brightness(0) invert(1)}30%{opacity:0}38%{opacity:1}46%{opacity:0}52%{opacity:1}58%{opacity:0}62%{opacity:1}66%{opacity:0}69%{opacity:1}72%,100%{opacity:0;filter:brightness(0) invert(1)}}
@keyframes bbFlickNew{0%,28%{opacity:0;filter:brightness(0) invert(1)}30%{opacity:1}38%{opacity:0}46%{opacity:1}52%{opacity:0}58%{opacity:1}62%{opacity:0}66%{opacity:1}69%{opacity:0}72%,86%{opacity:1;filter:brightness(0) invert(1)}100%{opacity:1;filter:none}}
@keyframes bbGlow{0%,60%{opacity:0;transform:scale(.6)}80%{opacity:1;transform:scale(1.2)}100%{opacity:0;transform:scale(1.5)}}
@keyframes bbBurst{0%{opacity:1;transform:translate(0,0) rotate(0)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(var(--r))}}
@media (prefers-reduced-motion:reduce){.bb-dock .bb-pic,.bb-card .bb-big,.bb-evo.done .new{animation:none}.bb-evo .old{animation:none;opacity:0}.bb-evo .new{animation:none;opacity:1}.bb-evo .glow{display:none}}`;

  // ===== Dock (bottom-right) with a ring that fills toward the next evolution
  function ringPct(pts) { const k = stageOf(pts), a = STAGES[k].at, b = nextAt(k); return b === null ? 1 : (pts - a) / (b - a) }
  function paintDock() {
    let d = $("bbDock");
    if (off()) { if (d) d.remove(); document.body.classList.remove("bb-on"); return }
    const s = load(), k = stageOf(s.pts), C = 2 * Math.PI * 30, mult = XP() ? XP().multiplier(s.streak) : 1;
    if (!d) { d = document.createElement("button"); d.id = "bbDock"; d.type = "button"; d.className = "bb-dock"; d.onclick = openCard; document.body.appendChild(d) }
    document.body.classList.add("bb-on");
    d.setAttribute("aria-label", `Study buddy: ${name(s)}, level ${level(s.pts)}, ${fmt(s.pts)} XP${s.streak >= 3 ? `, ${s.streak} in a row, XP times ${mult}` : ""}. Open`);
    d.innerHTML = `<svg class="bb-ring" viewBox="0 0 64 64"><circle class="t" cx="32" cy="32" r="30"/><circle class="f" cx="32" cy="32" r="30" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - ringPct(s.pts))}"/></svg>
      <span class="bb-pic">${art(k)}</span><span class="bb-lv">Lv ${level(s.pts)}</span>${s.streak >= 3 ? `<span class="bb-streak" title="${s.streak} right in a row">${FLAME}×${mult}</span>` : ""}`;
  }
  const name = s => s.nick || STAGES[stageOf(s.pts)].name;
  const FLAME = `<svg viewBox="0 0 12 14" aria-hidden="true"><path d="M6 1 C7 4 10 5 10 9 C10 12 8 13 6 13 C4 13 2 12 2 9 C2 7 3 6 4 5 C4 7 5 8 6 8 C6 6 5 4 6 1Z" fill="currentColor"/></svg>`;

  // ===== Card: the buddy up close, progress to the next evolution, its biology, the evolution line
  let veil = null;
  function openCard() {
    if (veil) return;
    const s = load(), k = stageOf(s.pts), st = STAGES[k], nx = nextAt(k), L = level(s.pts), X = XP();
    const mult = X ? X.multiplier(s.streak) : 1, up = X ? X.nextStreak(s.streak) : null;
    veil = document.createElement("div"); veil.className = "bb-veil";
    const pct = Math.round(ringPct(s.pts) * 100);
    veil.innerHTML = `<div class="bb-card" role="dialog" aria-modal="true" aria-labelledby="bbName">
      <div class="bb-big">${art(k)}</div>
      <h3 id="bbName">${esc(name(s))}</h3>
      <p class="bb-sub">Level ${L} of ${MAX_LV} · ${esc(st.form)}${s.nick ? ` · ${esc(st.name)}` : ""}</p>
      <div class="bb-stats">
        <div><b>${fmt(s.pts)}</b><span>total XP</span></div>
        <div><b>${s.streak}${s.streak >= 3 ? `<i class="fl">${FLAME}</i>` : ""}</b><span>in a row · ×${mult}</span></div>
        <div><b>${s.best}</b><span>best streak</span></div>
      </div>
      <div class="bb-bar"><i style="width:${pct}%"></i></div>
      <p class="bb-next">${nx === null ? (L >= MAX_LV ? "Fully grown and Level 100. You've mastered it all!" : `Fully grown! ${fmt(lvXP(L + 1) - s.pts)} XP to level ${L + 1} of ${MAX_LV}.`) : `${fmt(nx - s.pts)} XP until it evolves · ${fmt(lvXP(L + 1) - s.pts)} XP to level ${L + 1}`}</p>
      ${up ? `<p class="bb-next" style="margin-top:-8px">${s.streak ? `${up.at - s.streak} more right in a row for` : `Get ${up.at} right in a row for`} ×${up.mult} XP</p>` : ""}
      <div class="bb-fact"><b>The biology</b>${esc(st.fact)}</div>
      <div class="bb-line" aria-label="Evolution line">${STAGES.map((x, i) => `<div class="${i > k ? "lock" : ""}${i === k ? " cur" : ""}">${art(i)}<span>${i > k ? `${fmt(x.at)} XP` : esc(x.name)}</span></div>`).join("")}</div>
      <details class="bb-how"><summary>How XP works</summary>
        <p>Every question is rated by how hard it is. Harder questions earn more XP:</p>
        <ul class="bb-tiers">${X ? X.TIERS.map(t => `<li><span class="xpb t-${t.key}">${t.name}</span>${t.xp} XP</li>`).join("") : ""}</ul>
        <p><b>What makes a question harder:</b> EXCEPT/NOT wording, putting steps in order, reading an experiment or a figure, comparing two things or explaining why, five answer choices, long and similar answers, high-value Bio-pardy clues, and questions <i>you</i> missed before. A question you've already gotten right 3+ times earns half XP.</p>
        <p><b>Win streaks multiply XP:</b> ${X ? X.STREAKS.slice(0, -1).reverse().map(([n, m]) => `${n} in a row ×${m}`).join(" · ") : ""}. A wrong answer resets the streak but never takes XP away.</p>
      </details>
      <div class="bb-acts"><button type="button" id="bbRename">Rename</button><button type="button" id="bbHide">Hide buddy</button><button type="button" class="pri" id="bbClose">Keep studying</button></div>
    </div>`;
    veil.onclick = e => { if (e.target === veil) closeCard() };
    document.body.appendChild(veil);
    $("bbClose").onclick = closeCard; $("bbClose").focus();
    $("bbRename").onclick = () => { const n = prompt("Name your study buddy:", s.nick || st.name); if (n === null) return; const t = load(); t.nick = n.trim().slice(0, 24); save(t); closeCard(); paintDock(); openCard() };
    $("bbHide").onclick = () => { setEnabled(false); closeCard() };
  }
  function closeCard() { if (veil) { veil.remove(); veil = null } }
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeCard() } });

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
  function gain(e) {
    const X = XP(), detail = (e && e.detail) || {};
    const r = X ? X.rate(detail) : { xp: 10, tier: { key: "easy", name: "Easy" } };
    const s = load(), before = stageOf(s.pts), lvBefore = level(s.pts);
    s.streak = (s.streak | 0) + 1; s.best = Math.max(s.best | 0, s.streak); s.last = Date.now(); s.correct = (s.correct | 0) + 1;
    const mult = X ? X.multiplier(s.streak) : 1, earned = Math.round(r.xp * mult);
    s.pts += earned; save(s);
    window.dispatchEvent(new CustomEvent("bio:xp", { detail: { earned, base: r.xp, mult, tier: r.tier, streak: s.streak, pts: s.pts } }));
    if (off()) return;
    paintDock();
    const d = $("bbDock"); if (!d) return;
    d.classList.remove("hop"); void d.offsetWidth; d.classList.add("hop");
    const lv = level(s.pts);
    pop(`<b>+${earned} XP</b><small><span class="xpb t-${r.tier.key}">${esc(r.tier.name)}</span>${mult > 1 ? ` ×${mult} streak` : ""}${lv > lvBefore ? ` · Lv ${lv}!` : ""}</small>`);
    if (STREAK_CHEERS[s.streak]) setTimeout(() => pop(`<b>${FLAME} ${STREAK_CHEERS[s.streak]}</b><small>XP ×${mult} while it lasts</small>`, "hot"), 650);
    const after = stageOf(s.pts);
    if (after > before) setTimeout(() => evolve(before, after), 900);
  }
  function miss() {
    const s = load(), had = s.streak | 0; s.streak = 0; s.last = Date.now(); save(s);
    if (off()) return;
    paintDock();
    if (had >= 3) pop(`<b>Streak ended at ${had}</b><small>No XP lost. Start a new one!</small>`, "cool");
  }
  function evolve(from, to) {
    const s = load(), a = STAGES[from], b = STAGES[to], who = s.nick || a.name;
    const ev = document.createElement("div"); ev.className = "bb-evo"; ev.setAttribute("role", "dialog"); ev.setAttribute("aria-modal", "true"); ev.setAttribute("aria-live", "polite");
    ev.innerHTML = `<p class="msg" id="bbMsg">${esc(who)} is starting to glow…</p>
      <div class="stage"><div class="glow"></div><span class="old">${art(from)}</span><span class="new">${art(to)}</span></div>
      <div class="reveal"><h2>${esc(who)} grew into ${esc(b.name)}!</h2><p style="margin-top:8px">${esc(b.form)} stage · ${esc(b.fact)}</p></div>
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

  function setEnabled(on) { try { on ? localStorage.removeItem(OFF_KEY) : localStorage.setItem(OFF_KEY, "1") } catch (e) { } paintDock() }
  window.addEventListener("bio:correct", gain);
  window.addEventListener("bio:wrong", miss);

  function mount() { const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st); paintDock() }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
  window.BioBuddy = { enabled: () => !off(), setEnabled, open: openCard, art, STAGES, state: load, level };
})();
