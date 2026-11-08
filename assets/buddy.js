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

  // ===== Artwork (viewBox 0 0 120 120), side view facing right. uid keeps gradient ids unique.
  let uidN = 0;
  const INK = "#23301f";
  // Head with one big eye (side view), cheek and smile. wise = closed, content eye.
  function head(hx, hy, r, wise) {
    const eye = wise
      ? `<path d="M${hx - 1} ${hy - 2} q3.5 -4 7 0" stroke="${INK}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="${hx + 2.5}" cy="${hy - 2.5}" rx="3.3" ry="4.1" fill="${INK}"/><circle cx="${hx + 3.6}" cy="${hy - 4}" r="1.3" fill="#fff"/>`;
    return `${eye}<ellipse cx="${hx + 1}" cy="${hy + 4.5}" rx="3.6" ry="2.1" fill="#ff7a9a" opacity=".5"/>
      <path d="M${hx + r * .55} ${hy + 3} q2.5 2.6 5 .4" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  }
  const leafShape = (x, y, len, rot, fill, vein) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 C${len * .35} ${-len * .3} ${len * .8} ${-len * .28} ${len} 0 C${len * .8} ${len * .28} ${len * .35} ${len * .3} 0 0Z" fill="${fill}"/>${vein ? `<path d="M1 0 L${len * .9} 0" stroke="${vein}" stroke-width=".9" opacity=".6"/>` : ""}</g>`;
  const flower = (x, y, r, c) => `${[0, 72, 144, 216, 288].map(a => `<ellipse cx="${x}" cy="${y - r}" rx="${r * .62}" ry="${r}" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`).join("")}<circle cx="${x}" cy="${y}" r="${r * .55}" fill="#ffd54f"/>`;
  // The dino: tail, legs, body, belly, neck and head. Returns the head position for decorations.
  function dino(u, o) {
    const { bx = 54, by = 80, rx = 26, ry = 17, hx = 92, hy = 38, neck = 11, wise = false } = o;
    const legs = [[bx - 18, "a"], [bx - 6, "b"], [bx + 8, "a"], [bx + 18, "b"]].map(([x, t]) => `<rect x="${x - 5}" y="${by + 2}" width="10" height="${22 - (t === "b" ? 2 : 0)}" rx="5" fill="url(#${u}${t === "b" ? "d" : "b"})"/><ellipse cx="${x}" cy="${by + 23 - (t === "b" ? 2 : 0)}" rx="5.5" ry="2.4" fill="#f4ecd2"/>`).join("");
    return `<path d="M${bx - rx + 6} ${by - 4} C${bx - rx - 10} ${by - 2} ${bx - rx - 22} ${by - 10} ${bx - rx - 26} ${by - 22} C${bx - rx - 18} ${by - 8} ${bx - rx - 6} ${by + 8} ${bx - rx + 8} ${by + 8}Z" fill="url(#${u}b)"/>
      ${legs}
      <ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${ry}" fill="url(#${u}b)"/>
      <ellipse cx="${bx + 4}" cy="${by + ry * .5}" rx="${rx * .62}" ry="${ry * .38}" fill="#f4ecd2" opacity=".9"/>
      <path d="M${bx + rx * .55} ${by - ry * .45} C${bx + rx * .95} ${by - ry * 1.4} ${hx - 10} ${hy + 14} ${hx - 3} ${hy + 3}" stroke="url(#${u}b)" stroke-width="${neck}" fill="none" stroke-linecap="round"/>
      <ellipse cx="${hx}" cy="${hy}" rx="11.5" ry="9.5" fill="url(#${u}b)"/>
      ${head(hx, hy, 11.5, wise)}`;
  }
  function art(k) {
    const u = "bb" + (++uidN);
    const grad = (id, a, b) => `<linearGradient id="${u}${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
    const defs = `<defs>${grad("b", "#a7e3b5", "#4f9d69")}${grad("d", "#8fcf9f", "#3f8558")}${grad("e", "#f3e0b8", "#c49a5e")}</defs>`;
    const shadow = w => `<ellipse cx="56" cy="108" rx="${w}" ry="4.5" fill="#000" opacity=".12"/>`;
    let g = "";
    if (k === 0) {   // seed-egg with the baby peeking out
      g = `${shadow(22)}
        <path d="M60 104 C40 104 33 90 34 76 C35 60 46 46 60 46 C74 46 85 60 86 76 C87 90 80 104 60 104Z" fill="url(#${u}e)"/>
        ${[[46, 86], [72, 92], [66, 80], [50, 98], [76, 74]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#8fbf6a" opacity=".55"/>`).join("")}
        <path d="M40 66 L46 62 L51 68 L57 61 L63 68 L69 61 L75 67 L80 63" stroke="#a87d45" stroke-width="2" fill="none" stroke-linejoin="round"/>
        <path d="M54 64 C52 54 58 46 66 44" stroke="url(#${u}b)" stroke-width="9" fill="none" stroke-linecap="round"/>
        <ellipse cx="69" cy="42" rx="10" ry="8.5" fill="url(#${u}b)"/>${head(68, 42, 10)}
        <path d="M68 34 C68 29 69 27 70 25" stroke="#4f9d69" stroke-width="1.8" stroke-linecap="round"/>${leafShape(70, 26, 9, -40, "#7cc35a")}${leafShape(70, 26, 8, -150, "#8bd06a")}`;
    } else if (k === 1) {   // hatchling: short neck, moss tufts on its back, one sprout on its head
      g = `<g transform="translate(10 14) scale(.85)">${shadow(30)}${dino(u, { hx: 84, hy: 52, neck: 10 })}
        ${[[36, 64], [44, 61], [52, 60], [60, 61], [68, 64]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${4 + (i % 2)}" fill="${i % 2 ? "#4f9d3a" : "#6dbb4c"}"/>`).join("")}
        <path d="M84 43 C84 38 85 36 86 34" stroke="#3f8558" stroke-width="1.8" stroke-linecap="round"/>${leafShape(86, 35, 9, -35, "#7cc35a")}</g>`;
    } else if (k === 2) {   // ferns along its back, a fiddlehead curl on the tail tip
      g = `<g transform="translate(5 8) scale(.92)">${shadow(32)}${dino(u, { hx: 88, hy: 44, neck: 11 })}
        ${leafShape(40, 64, 22, -125, "#2f8a5c", "#1f5e40")}${leafShape(52, 62, 24, -100, "#3fa36f", "#1f5e40")}${leafShape(64, 63, 22, -72, "#2f8a5c", "#1f5e40")}
        ${[[44, 52], [47, 47], [51, 43]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#8a5a2b"/>`).join("")}
        <path d="M8 58 C4 54 6 48 11 48 C15 48 15 53 12 54" stroke="#3f9e6a" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
    } else if (k === 3) {   // seedlings with cotyledons sprouting on its back
      g = `${shadow(34)}${dino(u, { hx: 92, hy: 38 })}
        ${[[38, 64, 9], [50, 61, 12], [62, 61, 10], [72, 64, 8]].map(([x, y, h]) => `<path d="M${x} ${y} L${x} ${y - h}" stroke="#5f9e2f" stroke-width="2" stroke-linecap="round"/><ellipse cx="${x - 4}" cy="${y - h - 1}" rx="5" ry="3" fill="#8bc34a" transform="rotate(-20 ${x - 4} ${y - h - 1})"/><ellipse cx="${x + 4}" cy="${y - h - 1}" rx="5" ry="3" fill="#8bc34a" transform="rotate(20 ${x + 4} ${y - h - 1})"/>`).join("")}
        <path d="M92 29 L92 23" stroke="#5f9e2f" stroke-width="1.8" stroke-linecap="round"/><ellipse cx="89" cy="22" rx="4" ry="2.4" fill="#8bc34a" transform="rotate(-20 89 22)"/><ellipse cx="95" cy="22" rx="4" ry="2.4" fill="#8bc34a" transform="rotate(20 95 22)"/>`;
    } else if (k === 4) {   // flowers bloom along its back and tail
      g = `${shadow(34)}${dino(u, { hx: 92, hy: 38 })}
        ${leafShape(36, 66, 12, -140, "#5fae45")}${leafShape(70, 65, 12, -40, "#5fae45")}
        ${flower(42, 60, 5.5, "#f48fbf")}${flower(55, 57, 6.5, "#ff9ec7")}${flower(67, 59, 5.5, "#c58cf2")}${flower(12, 58, 4.5, "#f48fbf")}
        ${[[30, 46], [80, 48], [24, 66]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#ffd54f" opacity=".9"/>`).join("")}
        ${flower(97, 28, 3.6, "#ffb3d1")}`;
    } else {   // a whole little tree grows from its back
      g = `${shadow(38)}${dino(u, { bx: 54, by: 82, rx: 29, ry: 18, hx: 96, hy: 34, neck: 12, wise: true })}
        <path d="M52 66 C52 54 50 46 46 38 M51 52 C56 46 60 44 64 40" stroke="#7a5536" stroke-width="5" fill="none" stroke-linecap="round"/>
        ${[[44, 30, 11], [56, 24, 12], [66, 34, 10], [36, 40, 9], [52, 38, 9]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${["#4f9d3a", "#6dbb4c", "#5fae45", "#3f8f3a", "#7cc35a"][i]}"/>`).join("")}
        ${[[42, 26], [58, 20], [68, 32], [36, 38], [50, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#f8bbd0"/>`).join("")}
        ${[[34, 66], [44, 63], [64, 63], [74, 66]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#5fae45"/>`).join("")}`;
    }
    return `<svg viewBox="0 0 120 120" aria-hidden="true">${defs}${g}</svg>`;
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
