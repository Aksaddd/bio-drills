// Bio Drills · Study buddy
// An original long-necked leafy dino that grows up through the plant life cycle as the student answers correctly.
// Every correct answer (main drill, HW 3 drill, Word Roots, Bio-pardy) = +1 level. It evolves at
// milestones. Wrong answers never hurt it. Saved on this device only ("bio-buddy-v1").
// Pages announce a correct answer with: window.dispatchEvent(new CustomEvent("bio:correct"))
// All artwork below is drawn here as SVG.
(() => {
  const KEY = "bio-buddy-v1", OFF_KEY = "bio-buddy-off";
  // An original long-necked leafy dino. It hatches from a seed-egg, then plants grow on its back
  // in the order they evolved: moss → ferns → seedlings → flowers → a whole tree.
  const STAGES = [
    { at: 0, name: "Pip", form: "Seed-egg", color: "#c9a46a",
      fact: "Pip is still inside its seed. A seed holds an embryo, a food supply and a protective seed coat, so it can wait (dormancy) until conditions are right." },
    { at: 5, name: "Sprig", form: "Mossy hatchling", color: "#5fb37a",
      fact: "The fuzz on Sprig's back is moss. In mosses the green gametophyte (n) is the main plant, and fertilization needs water so sperm can swim to the egg." },
    { at: 15, name: "Frondo", form: "Fern-back", color: "#3f9e6a",
      fact: "Ferns grow on Frondo's back. Ferns have xylem and phloem and a dominant sporophyte; the brown dots under a frond are sori, clusters of sporangia. The curl on its tail is a fiddlehead." },
    { at: 35, name: "Sproutle", form: "Seedling-back", color: "#7cc35a",
      fact: "Seedlings sprout along Sproutle's back. Each one's first two round leaves are cotyledons (seed leaves): one in monocots, two in eudicots." },
    { at: 70, name: "Blossaur", form: "Flower-back", color: "#e86aa6",
      fact: "Flowers bloom on Blossaur's back. Flowers are modified leaves (sepals, petals, stamens, carpels), and double fertilization makes a 2n zygote plus 3n endosperm." },
    { at: 120, name: "Grovewalker", form: "Walking forest", color: "#6d8f4e",
      fact: "A whole tree grows on Grovewalker's back. Lignin-stiffened xylem lets trees grow tall. That's the top of the plant tree of life; every right answer still levels it up." }
  ];
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const load = () => { try { return Object.assign({ xp: 0, nick: "" }, JSON.parse(localStorage.getItem(KEY) || "{}")) } catch (e) { return { xp: 0, nick: "" } } };
  const save = s => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch (e) { } };
  const off = () => { try { return localStorage.getItem(OFF_KEY) === "1" } catch (e) { return false } };
  const stageOf = xp => { let k = 0; STAGES.forEach((s, i) => { if (xp >= s.at) k = i }); return k };
  const nextAt = k => STAGES[k + 1] ? STAGES[k + 1].at : null;
  const level = xp => xp + 1;

  // ===== Artwork (viewBox 0 0 120 120), side view facing right. An original character.
  // Design rules: readable silhouette per stage, clean dark outlines, a limited palette (grass greens,
  // cream, one pink accent), cel shading (one shadow tone + highlights), and proportions that go from
  // round and big-eyed to long-necked, angular and majestic.
  const OL = "#24331f", GREEN = "#6cc36e", GREEN_D = "#4a9a57", GREEN_DD = "#3a7f47", LIGHT = "#a8e6a3", CREAM = "#f3e8c6", CREAM_D = "#d9c79a", PINK = "#ff8fb8", OW = 2.2;
  const ln = `stroke="${OL}" stroke-width="${OW}" stroke-linejoin="round"`;
  let uidN = 0;
  // Leaf with a midrib and side veins
  const leaf = (x, y, len, rot, fill, shade) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 C${len * .35} ${-len * .32} ${len * .8} ${-len * .3} ${len} 0 C${len * .8} ${len * .3} ${len * .35} ${len * .32} 0 0Z" fill="${fill}" ${ln}/><path d="M${len * .15} ${len * .02} C${len * .45} ${len * .2} ${len * .75} ${len * .16} ${len * .95} ${len * .02}Z" fill="${shade || "rgba(0,0,0,.14)"}"/><path d="M2 0 L${len * .85} 0" stroke="${OL}" stroke-width="1" opacity=".6"/>${[.3, .5, .7].map(t => `<path d="M${len * t} 0 l${len * .09} ${-len * .1} M${len * t} 0 l${len * .09} ${len * .1}" stroke="${OL}" stroke-width=".7" opacity=".45"/>`).join("")}</g>`;
  // Fern frond: a curved midrib with paired leaflets (pinnae), spore dots (sori) under some
  function frond(x, y, len, rot, fill, sori) {
    let p = "";
    for (let i = 1; i <= 7; i++) {
      const t = i / 8, px = len * t, w = len * .2 * (1 - t * .65);
      p += `<ellipse cx="${px}" cy="${-w * .55}" rx="${w * .55}" ry="${w * .3}" transform="rotate(-35 ${px} ${-w * .55})" fill="${fill}" stroke="${OL}" stroke-width="1"/>` +
        `<ellipse cx="${px}" cy="${w * .55}" rx="${w * .55}" ry="${w * .3}" transform="rotate(35 ${px} ${w * .55})" fill="${fill}" stroke="${OL}" stroke-width="1"/>` +
        (sori && i % 2 ? `<circle cx="${px + 1}" cy="${w * .5}" r=".9" fill="#8a5a2b"/>` : "");
    }
    return `<g transform="translate(${x} ${y}) rotate(${rot})">${p}<path d="M0 0 Q${len * .5} ${-len * .04} ${len} 0" stroke="${OL}" stroke-width="1.6" fill="none"/></g>`;
  }
  // Clusters with one outline around the whole group (outline layer, then fills on top)
  const cluster = (cs, fill, shade, hi) => cs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${OL}" stroke="${OL}" stroke-width="${OW * 2}"/>`).join("") +
    cs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${shade}"/>`).join("") +
    cs.map(([x, y, r]) => `<circle cx="${x - r * .12}" cy="${y - r * .18}" r="${r * .82}" fill="${fill}"/>`).join("") +
    (hi ? cs.map(([x, y, r]) => `<circle cx="${x - r * .35}" cy="${y - r * .42}" r="${r * .22}" fill="${hi}" opacity=".85"/>`).join("") : "");
  const plate = (x, y, h, w, rot) => `<g transform="rotate(${rot} ${x} ${y})"><path d="M${x - w / 2} ${y} L${x} ${y - h} L${x + w / 2} ${y}Z" fill="${GREEN_DD}" ${ln}/><path d="M${x} ${y - h + 2} L${x + w / 2 - 1.5} ${y - .5} L${x} ${y - .5}Z" fill="${OL}" opacity=".18"/><path d="M${x} ${y - h + 3} L${x} ${y - 1}" stroke="${LIGHT}" stroke-width="1" opacity=".55"/></g>`;
  const flower = (x, y, r) => `${[0, 72, 144, 216, 288].map(a => `<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y - r * .9}" rx="${r * .55}" ry="${r * .9}" fill="${PINK}" stroke="${OL}" stroke-width="1.3"/><ellipse cx="${x + r * .15}" cy="${y - r * .75}" rx="${r * .2}" ry="${r * .5}" fill="#ffc2d8"/></g>`).join("")}<circle cx="${x}" cy="${y}" r="${r * .48}" fill="#ffd54f" stroke="${OL}" stroke-width="1.2"/>${[[-.15, -.1], [.15, .05], [0, .18]].map(([dx, dy]) => `<circle cx="${x + dx * r}" cy="${y + dy * r}" r="${r * .08 + .3}" fill="#e09a1a"/>`).join("")}`;
  function eyeAt(x, y, r, mode) {
    if (mode === "wise") return `<path d="M${x - r} ${y + r * .2} q${r} ${-r * 1.3} ${r * 2} 0" stroke="${OL}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M${x - r * .7} ${y + r * .9} q${r * .7} ${r * .4} ${r * 1.4} 0" stroke="${OL}" stroke-width="1" fill="none" opacity=".5"/><path d="M${x - r * 1.1} ${y - r * 2.3} L${x + r * 1.3} ${y - r * 1.8}" stroke="${OL}" stroke-width="2" stroke-linecap="round"/>`;
    return `<ellipse cx="${x}" cy="${y}" rx="${r * .82}" ry="${r}" fill="${OL}"/><ellipse cx="${x + r * .1}" cy="${y + r * .45}" rx="${r * .45}" ry="${r * .3}" fill="#3d5a8a" opacity=".8"/><circle cx="${x + r * .3}" cy="${y - r * .4}" r="${r * .38}" fill="#fff"/><circle cx="${x - r * .35}" cy="${y + r * .35}" r="${r * .14}" fill="#fff"/>` +
      (mode === "brow" ? `<path d="M${x - r * 1.1} ${y - r * 1.55} L${x + r * 1.2} ${y - r * 1.15}" stroke="${OL}" stroke-width="2" stroke-linecap="round"/><path d="M${x - r * .9} ${y - r * 1.05} q${r * .9} ${-r * .5} ${r * 1.8} 0" stroke="${OL}" stroke-width="1" fill="none" opacity=".55"/>` : "");
  }
  // The dino, built from proportions. a = 0 (round baby) … 1 (long, angular adult). spots = back markings.
  function dino(u, o) {
    const { bx, by, rx, ry, hx, hy, hr, eye, leg, legW, neck, a, eyeMode, tail, spots = 0 } = o;
    const headRx = hr * (1 + .38 * a), headRy = hr * (1 - .14 * a), hcx = hx + hr * .32 * a;
    const tailD = `M${bx - rx * .7} ${by - ry * .35} C${bx - rx - tail * .45} ${by - ry * .4} ${bx - rx - tail * .85} ${by - ry * .9} ${bx - rx - tail} ${by - ry * 1.6} C${bx - rx - tail * .6} ${by - ry * .3} ${bx - rx - tail * .2} ${by + ry * .5} ${bx - rx * .55} ${by + ry * .55}Z`;
    const legTop = by + ry * .35;
    const L = (x, far) => {
      const top = legTop, h = leg, w = legW;
      const toes = [-.3, 0, .3].map(t => `<ellipse cx="${x + t * w + w * .08}" cy="${top + h - 1.2}" rx="${w * .16}" ry="${w * .13}" fill="${CREAM}" stroke="${OL}" stroke-width="1"/>`).join("");
      return `<rect x="${x - w / 2}" y="${top}" width="${w}" height="${h}" rx="${w / 2}" fill="${far ? GREEN_D : GREEN}"/>
        <rect x="${x - w / 2}" y="${top}" width="${w * .38}" height="${h}" rx="${w * .19}" fill="${far ? GREEN_DD : GREEN_D}"/>
        <rect x="${x - w / 2}" y="${top}" width="${w}" height="${h}" rx="${w / 2}" fill="none" ${ln}/>${toes}`;
    };
    const nx0 = bx + rx * .5, ny0 = by - ry * .55, c1x = bx + rx * .95, c1y = by - ry * 1.3, c2x = hx - hr * .9, c2y = hy + hr * 1.4, nx1 = hx - hr * .3, ny1 = hy + hr * .35;
    const neckD = `M${nx0} ${ny0} C${c1x} ${c1y} ${c2x} ${c2y} ${nx1} ${ny1}`;
    // markings: darker leaf-shaped spots along the top of the back
    const marks = Array.from({ length: spots }, (_, i) => { const t = -.62 + i * (1.1 / Math.max(1, spots - 1)), x = bx + rx * t, y = by - ry * Math.sqrt(1 - t * t) * .62; return `<ellipse cx="${x}" cy="${y}" rx="${2.8 + (i % 2)}" ry="1.8" transform="rotate(${t * 40} ${x} ${y})" fill="${GREEN_D}"/>` }).join("");
    const scutes = [-.35, -.1, .15, .4].map(t => `<path d="M${bx + rx * t} ${by + ry * .42} q1.5 ${ry * .32} 0 ${ry * .58}" stroke="${CREAM_D}" stroke-width="1.2" fill="none"/>`).join("");
    const defs = `<clipPath id="${u}cb"><ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${ry}"/></clipPath><clipPath id="${u}ch"><ellipse cx="${hcx}" cy="${hy}" rx="${headRx}" ry="${headRy}"/></clipPath><clipPath id="${u}ct"><path d="${tailD}"/></clipPath>`;
    return {
      defs,
      back: `<path d="${tailD}" fill="${GREEN}"/><g clip-path="url(#${u}ct)"><path d="M${bx - rx - tail} ${by - ry * 1.2} C${bx - rx - tail * .5} ${by + ry * .1} ${bx - rx * .8} ${by + ry * .4} ${bx - rx * .4} ${by + ry * .7} L${bx - rx * .4} ${by + ry * 2} L${bx - rx - tail * 1.2} ${by + ry * 2}Z" fill="${GREEN_D}"/></g><path d="${tailD}" fill="none" ${ln}/>
        ${L(bx - rx * .55, true)}${L(bx + rx * .35, true)}`,
      body: `<ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${ry}" fill="${GREEN}"/>
        <g clip-path="url(#${u}cb)">
          <ellipse cx="${bx + rx * .05}" cy="${by + ry * .95}" rx="${rx * 1.2}" ry="${ry * .9}" fill="${GREEN_D}"/>
          <path d="M${bx - rx * .62} ${by + ry * .4} Q${bx + rx * .05} ${by + ry * 1.12} ${bx + rx * .75} ${by + ry * .3} L${bx + rx} ${by + ry * 2} L${bx - rx} ${by + ry * 2}Z" fill="${CREAM}"/>
          ${scutes}${marks}
          <ellipse cx="${bx - rx * .32}" cy="${by - ry * .55}" rx="${rx * .32}" ry="${ry * .16}" fill="${LIGHT}" opacity=".75"/>
        </g>
        <ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${ry}" fill="none" ${ln}/>
        ${L(bx - rx * .25, false)}${L(bx + rx * .65, false)}
        <path d="${neckD}" stroke="${OL}" stroke-width="${neck + OW * 2}" fill="none" stroke-linecap="round"/>
        <path d="${neckD}" stroke="${GREEN_D}" stroke-width="${neck}" fill="none" stroke-linecap="round"/>
        <path d="${neckD}" stroke="${GREEN}" stroke-width="${neck * .62}" fill="none" stroke-linecap="round" transform="translate(-${neck * .14} -${neck * .16})"/>
        <path d="${neckD}" stroke="${LIGHT}" stroke-width="${neck * .14}" fill="none" stroke-linecap="round" opacity=".7" transform="translate(-${neck * .3} -${neck * .3})" stroke-dasharray="${neck * 1.2} ${neck * 2.6}"/>
        <ellipse cx="${hcx}" cy="${hy}" rx="${headRx}" ry="${headRy}" fill="${GREEN}"/>
        <g clip-path="url(#${u}ch)">
          <ellipse cx="${hcx}" cy="${hy + headRy * .95}" rx="${headRx * 1.1}" ry="${headRy * .6}" fill="${GREEN_D}"/>
          <ellipse cx="${hcx + headRx * .15}" cy="${hy + headRy * .62}" rx="${headRx * .55}" ry="${headRy * .25}" fill="${CREAM}"/>
          <ellipse cx="${hcx - headRx * .3}" cy="${hy - headRy * .55}" rx="${headRx * .32}" ry="${headRy * .16}" fill="${LIGHT}" opacity=".8"/>
        </g>
        <ellipse cx="${hcx}" cy="${hy}" rx="${headRx}" ry="${headRy}" fill="none" ${ln}/>
        ${eyeAt(hx + hr * .12, hy - hr * .22, eye, eyeMode)}
        <circle cx="${hcx + headRx * .78}" cy="${hy - headRy * .18}" r="${.9 + a * .4}" fill="${OL}"/>
        <ellipse cx="${hx - hr * .05}" cy="${hy + hr * .4}" rx="${hr * .28}" ry="${hr * .15}" fill="#ff7a9a" opacity=".55"/>
        <path d="M${hcx + headRx * .55} ${hy + headRy * .3} q${hr * .22} ${hr * .2} ${hr * .45} 0" stroke="${OL}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`,
      head: { x: hcx, y: hy, rx: headRx, ry: headRy }
    };
  }
  function art(k) {
    const u = "bb" + (++uidN);
    const shadow = (cx, w) => `<ellipse cx="${cx}" cy="111" rx="${w}" ry="4" fill="#000" opacity=".14"/>`;
    let g = "", defs = "";
    if (k === 0) {   // Pip: a round seed-egg, a big-eyed baby peeking out, one sprout
      const egg = "M58 108 C38 108 31 93 32 79 C33 62 44 50 58 50 C72 50 83 62 84 79 C85 93 78 108 58 108Z";
      defs = `<clipPath id="${u}ce"><path d="${egg}"/></clipPath><clipPath id="${u}cp"><ellipse cx="60" cy="52" rx="15" ry="13"/></clipPath>`;
      g = `${shadow(58, 24)}
        <path d="${egg}" fill="${CREAM}"/><g clip-path="url(#${u}ce)"><ellipse cx="66" cy="104" rx="30" ry="22" fill="${CREAM_D}"/><ellipse cx="44" cy="72" rx="6" ry="10" fill="#fffaf0" opacity=".8"/>
        ${[[45, 90, 4], [70, 96, 3.4], [64, 84, 2.6], [74, 78, 2.8], [52, 100, 2.2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${GREEN}" stroke="${OL}" stroke-width="1.2"/><circle cx="${x - r * .3}" cy="${y - r * .3}" r="${r * .3}" fill="${LIGHT}"/>`).join("")}</g>
        <path d="${egg}" fill="none" ${ln}/>
        <ellipse cx="60" cy="52" rx="15" ry="13" fill="${GREEN}"/><g clip-path="url(#${u}cp)"><ellipse cx="60" cy="63" rx="16" ry="7" fill="${GREEN_D}"/><ellipse cx="55" cy="45" rx="5" ry="2.5" fill="${LIGHT}" opacity=".8"/></g><ellipse cx="60" cy="52" rx="15" ry="13" fill="none" ${ln}/>
        <path d="M37 67 L43 61 L49 68 L55 60 L61 68 L67 60 L73 67 L79 62 L83 69 L83 74 L37 74Z" fill="${CREAM}"/><path d="M37 67 L43 61 L49 68 L55 60 L61 68 L67 60 L73 67 L79 62 L83 69" fill="none" ${ln}/>
        ${eyeAt(64, 49, 4.6)}<ellipse cx="57" cy="56" rx="3.6" ry="2" fill="#ff7a9a" opacity=".55"/><path d="M66 56 q1.6 1.6 3.2 0" stroke="${OL}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path d="M60 39 L60 32" stroke="${OL}" stroke-width="2.2" stroke-linecap="round"/>${leaf(60, 32, 11, -35, "#8bd06a")}${leaf(60, 32, 9, -150, "#8bd06a")}`;
    } else if (k === 1) {   // Sprig: very round, big head, short neck, stubby legs, moss clumps, one sprout
      const d = dino(u, { bx: 54, by: 84, rx: 21, ry: 16, hx: 80, hy: 60, hr: 13, eye: 4.6, leg: 11, legW: 9, neck: 11, a: 0, tail: 14, spots: 0 });
      defs = d.defs;
      g = `${shadow(56, 30)}${d.back}${d.body}
        ${cluster([[39, 71, 4.3], [46, 67.5, 5], [54, 66.5, 5.2], [62, 68, 4.6], [68, 71.5, 3.6]], "#5aa843", "#3f8530", "#9ad87a")}
        ${[[44, 64], [57, 63], [66, 66]].map(([x, y]) => `<path d="M${x} ${y} l0 -3" stroke="#8a5a2b" stroke-width="1.1" stroke-linecap="round"/><ellipse cx="${x}" cy="${y - 4}" rx="1.2" ry="1.7" fill="#b07a3c" stroke="${OL}" stroke-width=".7"/>`).join("")}
        <path d="M80 47 L80 41" stroke="${OL}" stroke-width="2" stroke-linecap="round"/>${leaf(80, 41, 10, -40, "#8bd06a")}`;
    } else if (k === 2) {   // Frondo: a fan of fern fronds, fiddlehead tail, back markings
      const d = dino(u, { bx: 52, by: 84, rx: 23, ry: 16, hx: 85, hy: 52, hr: 12, eye: 4.2, leg: 13, legW: 9.5, neck: 10.5, a: .15, tail: 18, spots: 3 });
      defs = d.defs;
      g = `${shadow(55, 32)}${d.back}
        ${frond(42, 72, 26, -128, "#2f8a5c", true)}${frond(52, 70, 30, -94, "#3fa36f", false)}${frond(62, 71, 26, -62, "#2f8a5c", true)}${frond(36, 76, 18, -150, "#3fa36f", false)}
        ${d.body}
        <path d="M13 65 C8 62 9 55 14 55 C18 55 18 60 15 61" stroke="${OL}" stroke-width="5.4" fill="none" stroke-linecap="round"/><path d="M13 65 C8 62 9 55 14 55 C18 55 18 60 15 61" stroke="${GREEN}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        ${[[11, 60], [16, 66]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2" ry="1.2" fill="#3fa36f" stroke="${OL}" stroke-width=".8"/>`).join("")}`;
    } else if (k === 3) {   // Sproutle: longer neck, a hint of snout, seedlings with cotyledons, more markings
      const d = dino(u, { bx: 52, by: 84, rx: 25, ry: 16.5, hx: 88, hy: 44, hr: 11.5, eye: 3.8, leg: 15, legW: 10, neck: 10, a: .4, tail: 22, spots: 4 });
      defs = d.defs;
      const sprout = (x, y, h) => `<path d="M${x} ${y} Q${x - 1} ${y - h / 2} ${x} ${y - h}" stroke="${OL}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M${x} ${y} Q${x - 1} ${y - h / 2} ${x} ${y - h}" stroke="#7cb342" stroke-width="1" fill="none"/>
        <g transform="rotate(-22 ${x - 4.5} ${y - h - 1})"><ellipse cx="${x - 4.5}" cy="${y - h - 1}" rx="5.4" ry="3.3" fill="#8bc34a" stroke="${OL}" stroke-width="1.4"/><ellipse cx="${x - 3.8}" cy="${y - h - .1}" rx="3.6" ry="1.5" fill="#6aa034"/><path d="M${x - 9} ${y - h - 1} L${x - 1} ${y - h - 1}" stroke="${OL}" stroke-width=".7" opacity=".5"/></g>
        <g transform="rotate(22 ${x + 4.5} ${y - h - 1})"><ellipse cx="${x + 4.5}" cy="${y - h - 1}" rx="5.4" ry="3.3" fill="#8bc34a" stroke="${OL}" stroke-width="1.4"/><ellipse cx="${x + 5.2}" cy="${y - h - .1}" rx="3.6" ry="1.5" fill="#6aa034"/><path d="M${x + 1} ${y - h - 1} L${x + 9} ${y - h - 1}" stroke="${OL}" stroke-width=".7" opacity=".5"/></g>
        <path d="M${x - 3} ${y + .5} q3 -2.4 6 0" fill="#8a5a2b" stroke="${OL}" stroke-width="1"/>`;
      g = `${shadow(55, 34)}${d.back}${d.body}${sprout(38, 72, 9)}${sprout(49, 68, 12)}${sprout(60, 68, 10)}${sprout(70, 71, 7)}`;
    } else if (k === 4) {   // Blossaur: taller and angular, shaded leaf-plates, flowers, a flower crown
      const d = dino(u, { bx: 50, by: 82, rx: 27, ry: 17, hx: 91, hy: 36, hr: 11, eye: 3.4, leg: 17, legW: 10.5, neck: 10.5, a: .7, tail: 26, eyeMode: "brow", spots: 5 });
      defs = d.defs;
      g = `${shadow(54, 36)}${d.back}
        ${plate(30, 72, 10, 9, -38)}${plate(40, 67, 13, 10, -20)}${plate(52, 65.5, 15, 11, 0)}${plate(64, 67, 13, 10, 18)}
        ${d.body}
        ${leaf(36, 69, 10, -150, "#5fae45")}${leaf(68, 68, 10, -30, "#5fae45")}
        ${flower(42, 66, 4.6)}${flower(57, 64, 5.4)}${flower(14, 54, 4)}
        ${flower(d.head.x - 2, d.head.y - d.head.ry - 2, 4.4)}
        ${[[26, 50], [76, 50], [33, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#ffd54f" stroke="${OL}" stroke-width=".6"/>`).join("")}`;
    } else {   // Grovewalker: large, long neck held high, plates, a leafy flowering tree rooted on its back
      const d = dino(u, { bx: 50, by: 82, rx: 30, ry: 18.5, hx: 95, hy: 26, hr: 10.5, eye: 3, leg: 19, legW: 12, neck: 12, a: 1, tail: 30, eyeMode: "wise", spots: 6 });
      defs = d.defs;
      const trunk = "M47 66 C49 58 49 52 46 44 C44 38 41 34 38 31 M48 52 C53 47 58 44 64 39 M47 58 C43 56 39 56 35 58";
      g = `${shadow(54, 40)}${d.back}
        ${plate(26, 72, 12, 10, -40)}${plate(68, 66, 13, 10, 22)}${plate(76, 60, 11, 9, 35)}
        ${d.body}
        <path d="M38 67 C42 64 45 64 47 66 C50 63 54 63 58 66 C61 64 64 65 66 68" stroke="${OL}" stroke-width="5.2" fill="none" stroke-linecap="round"/><path d="M38 67 C42 64 45 64 47 66 C50 63 54 63 58 66 C61 64 64 65 66 68" stroke="#7a5536" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="${trunk}" stroke="${OL}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="${trunk}" stroke="#7a5536" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M46 62 C47 56 47 51 44 45" stroke="#a07650" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <path d="M48 60 l-2 1 M46 52 l2 -1 M45 47 l-2 .5" stroke="${OL}" stroke-width=".9" opacity=".6"/>
        ${cluster([[40, 30, 10.5], [52, 22, 12], [64, 28, 10.5], [32, 38, 8.5], [49, 35, 9.5], [70, 37, 7.5], [58, 34, 8]], "#58b05a", "#3d8a45", "#9ed98e")}
        ${[[37, 26], [52, 16], [64, 24], [30, 36], [47, 32], [70, 35], [58, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.3" fill="${PINK}" stroke="${OL}" stroke-width="1"/><circle cx="${x - .6}" cy="${y - .6}" r=".7" fill="#ffe0ec"/>`).join("")}
        ${cluster([[36, 68, 2.6], [61, 67, 2.4]], "#5aa843", "#3f8530")}`;
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
.bb-plus{position:fixed;z-index:46;font:700 15px -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;color:#248a3d;pointer-events:none;animation:bbPlus 1.1s ease forwards;white-space:nowrap}
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
@keyframes bbPlus{0%{opacity:0;transform:translateY(0)}15%{opacity:1}100%{opacity:0;transform:translateY(-44px)}}
@keyframes bbFade{from{opacity:0}} @keyframes bbUp{from{opacity:0;transform:translateY(20px) scale(.97)}}
@keyframes bbFlickOld{0%,12%{opacity:1;filter:none}20%{opacity:1;filter:brightness(0) invert(1)}30%{opacity:0}38%{opacity:1}46%{opacity:0}52%{opacity:1}58%{opacity:0}62%{opacity:1}66%{opacity:0}69%{opacity:1}72%,100%{opacity:0;filter:brightness(0) invert(1)}}
@keyframes bbFlickNew{0%,28%{opacity:0;filter:brightness(0) invert(1)}30%{opacity:1}38%{opacity:0}46%{opacity:1}52%{opacity:0}58%{opacity:1}62%{opacity:0}66%{opacity:1}69%{opacity:0}72%,86%{opacity:1;filter:brightness(0) invert(1)}100%{opacity:1;filter:none}}
@keyframes bbGlow{0%,60%{opacity:0;transform:scale(.6)}80%{opacity:1;transform:scale(1.2)}100%{opacity:0;transform:scale(1.5)}}
@keyframes bbBurst{0%{opacity:1;transform:translate(0,0) rotate(0)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(var(--r))}}
@media (prefers-reduced-motion:reduce){.bb-dock .bb-pic,.bb-card .bb-big,.bb-evo.done .new{animation:none}.bb-evo .old{animation:none;opacity:0}.bb-evo .new{animation:none;opacity:1}.bb-evo .glow{display:none}}`;

  // ===== Dock (bottom-right) with a ring that fills toward the next evolution
  function ringPct(xp) { const k = stageOf(xp), a = STAGES[k].at, b = nextAt(k); return b === null ? 1 : (xp - a) / (b - a) }
  function paintDock() {
    let d = $("bbDock");
    if (off()) { if (d) d.remove(); document.body.classList.remove("bb-on"); return }
    const s = load(), k = stageOf(s.xp), C = 2 * Math.PI * 30;
    if (!d) { d = document.createElement("button"); d.id = "bbDock"; d.type = "button"; d.className = "bb-dock"; d.onclick = openCard; document.body.appendChild(d) }
    document.body.classList.add("bb-on");
    d.setAttribute("aria-label", `Study buddy: ${name(s)}, level ${level(s.xp)}. Open`);
    d.innerHTML = `<svg class="bb-ring" viewBox="0 0 64 64"><circle class="t" cx="32" cy="32" r="30"/><circle class="f" cx="32" cy="32" r="30" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - ringPct(s.xp))}"/></svg>
      <span class="bb-pic">${art(k)}</span><span class="bb-lv">Lv ${level(s.xp)}</span>`;
  }
  const name = s => s.nick || STAGES[stageOf(s.xp)].name;

  // ===== Card: the buddy up close, progress to the next evolution, its biology, the evolution line
  let veil = null;
  function openCard() {
    if (veil) return;
    const s = load(), k = stageOf(s.xp), st = STAGES[k], nx = nextAt(k);
    veil = document.createElement("div"); veil.className = "bb-veil";
    const pct = Math.round(ringPct(s.xp) * 100);
    veil.innerHTML = `<div class="bb-card" role="dialog" aria-modal="true" aria-labelledby="bbName">
      <div class="bb-big">${art(k)}</div>
      <h3 id="bbName">${esc(name(s))}</h3>
      <p class="bb-sub">Level ${level(s.xp)} · ${esc(st.form)}${s.nick ? ` · ${esc(st.name)}` : ""} · ${s.xp} right answer${s.xp === 1 ? "" : "s"}</p>
      <div class="bb-bar"><i style="width:${pct}%"></i></div>
      <p class="bb-next">${nx === null ? "Fully grown! Every right answer still raises its level." : `${nx - s.xp} more right answer${nx - s.xp === 1 ? "" : "s"} until it evolves`}</p>
      <div class="bb-fact"><b>The biology</b>${esc(st.fact)}</div>
      <div class="bb-line" aria-label="Evolution line">${STAGES.map((x, i) => `<div class="${i > k ? "lock" : ""}${i === k ? " cur" : ""}">${art(i)}<span>${i > k ? `at ${x.at}` : esc(x.name)}</span></div>`).join("")}</div>
      <div class="bb-acts"><button type="button" id="bbRename">Rename</button><button type="button" id="bbHide">Hide buddy</button><button type="button" class="pri" id="bbClose">Keep studying</button></div>
      <p class="bb-next" style="margin:12px 0 0">Every right answer in the drills, Word Roots and Bio-pardy levels it up. Wrong answers never hurt it.</p>
    </div>`;
    veil.onclick = e => { if (e.target === veil) closeCard() };
    document.body.appendChild(veil);
    $("bbClose").onclick = closeCard; $("bbClose").focus();
    $("bbRename").onclick = () => { const n = prompt("Name your study buddy:", s.nick || st.name); if (n === null) return; const t = load(); t.nick = n.trim().slice(0, 24); save(t); closeCard(); paintDock(); openCard() };
    $("bbHide").onclick = () => { setEnabled(false); closeCard() };
  }
  function closeCard() { if (veil) { veil.remove(); veil = null } }
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeCard() } });

  // ===== A correct answer: +1 level, hop, and evolve at a milestone
  function gain() {
    const s = load(), before = stageOf(s.xp); s.xp += 1; save(s);
    if (off()) return;
    paintDock();
    const d = $("bbDock"); if (!d) return;
    d.classList.remove("hop"); void d.offsetWidth; d.classList.add("hop");
    const r = d.getBoundingClientRect(), p = document.createElement("span");
    p.className = "bb-plus"; p.textContent = `Lv ${level(s.xp)}!`; p.style.left = (r.left + 6) + "px"; p.style.top = (r.top - 8) + "px";
    document.body.appendChild(p); setTimeout(() => p.remove(), 1200);
    const after = stageOf(s.xp);
    if (after > before) setTimeout(() => evolve(before, after), 700);
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

  function mount() { const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st); paintDock() }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
  window.BioBuddy = { enabled: () => !off(), setEnabled, open: openCard, art, STAGES };
})();
