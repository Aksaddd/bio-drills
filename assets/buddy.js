// Bio Drills · Study buddy
// An original creature that grows up through the plant life cycle as the student answers correctly.
// Every correct answer (main drill, HW 3 drill, Word Roots, Bio-pardy) = +1 level. It evolves at
// milestones. Wrong answers never hurt it. Saved on this device only ("bio-buddy-v1").
// Pages announce a correct answer with: window.dispatchEvent(new CustomEvent("bio:correct"))
// All artwork below is drawn here as SVG.
(() => {
  const KEY = "bio-buddy-v1", OFF_KEY = "bio-buddy-off";
  const STAGES = [
    { at: 0, name: "Spori", form: "Spore", color: "#c8955a",
      fact: "A spore is a single haploid cell made by meiosis, wrapped in tough sporopollenin. It grows into a gametophyte." },
    { at: 5, name: "Mossling", form: "Moss", color: "#4f9d3a",
      fact: "In mosses the green gametophyte is the main plant. The little stalk and capsule on Mossling's head is the sporophyte, which depends on it for food." },
    { at: 15, name: "Frondle", form: "Fern", color: "#2e8b62",
      fact: "Ferns have vascular tissue (xylem and phloem) and a dominant sporophyte. The brown dots on Frondle's frond are sori: clusters of sporangia." },
    { at: 35, name: "Sapplet", form: "Seedling", color: "#7cb342",
      fact: "A seed is an embryo, a food supply and a seed coat. Sapplet just broke out of its coat; its two round leaves are cotyledons (seed leaves)." },
    { at: 70, name: "Bloomkin", form: "Flower", color: "#e86aa6",
      fact: "Flowers are modified leaves: sepals, petals, stamens and carpels. In double fertilization one sperm makes the zygote and the other makes 3n endosperm." },
    { at: 120, name: "Elderbough", form: "Ancient tree", color: "#8d6e4a",
      fact: "Lignin in xylem lets trees grow tall. Elderbough has reached the top of the plant tree of life. Keep going: every right answer still levels it up." }
  ];
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const load = () => { try { return Object.assign({ xp: 0, nick: "" }, JSON.parse(localStorage.getItem(KEY) || "{}")) } catch (e) { return { xp: 0, nick: "" } } };
  const save = s => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch (e) { } };
  const off = () => { try { return localStorage.getItem(OFF_KEY) === "1" } catch (e) { return false } };
  const stageOf = xp => { let k = 0; STAGES.forEach((s, i) => { if (xp >= s.at) k = i }); return k };
  const nextAt = k => STAGES[k + 1] ? STAGES[k + 1].at : null;
  const level = xp => xp + 1;

  // ===== Artwork (viewBox 0 0 120 120). uid keeps gradient ids unique when several are on the page.
  let uidN = 0;
  function face(cx, cy, s, mood) {
    const e = 7 * s, eh = 8.5 * s;
    const eyes = mood === "wise"
      ? `<path d="M${cx - 14 * s} ${cy + 1 * s} q${4 * s} ${-5 * s} ${8 * s} 0 M${cx + 6 * s} ${cy + 1 * s} q${4 * s} ${-5 * s} ${8 * s} 0" stroke="#2b2118" stroke-width="${2.4 * s}" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="${cx - 9 * s}" cy="${cy}" rx="${e / 2 + .6}" ry="${eh / 2}" fill="#2b2118"/><ellipse cx="${cx + 9 * s}" cy="${cy}" rx="${e / 2 + .6}" ry="${eh / 2}" fill="#2b2118"/>
         <circle cx="${cx - 7.8 * s}" cy="${cy - 1.8 * s}" r="${1.7 * s}" fill="#fff"/><circle cx="${cx + 10.2 * s}" cy="${cy - 1.8 * s}" r="${1.7 * s}" fill="#fff"/>`;
    return `${eyes}<ellipse cx="${cx - 15 * s}" cy="${cy + 6 * s}" rx="${4 * s}" ry="${2.4 * s}" fill="#ff7a9a" opacity=".45"/><ellipse cx="${cx + 15 * s}" cy="${cy + 6 * s}" rx="${4 * s}" ry="${2.4 * s}" fill="#ff7a9a" opacity=".45"/>
      <path d="M${cx - 3.5 * s} ${cy + 6 * s} q${3.5 * s} ${3.2 * s} ${7 * s} 0" stroke="#2b2118" stroke-width="${1.8 * s}" fill="none" stroke-linecap="round"/>`;
  }
  const leaf = (x, y, r, rot, c1, c2) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 C${r * .5} ${-r * .55} ${r * 1.1} ${-r * .45} ${r * 1.4} 0 C${r * 1.1} ${r * .45} ${r * .5} ${r * .55} 0 0Z" fill="${c1}"/><path d="M${r * .1} 0 L${r * 1.25} 0" stroke="${c2}" stroke-width="1" opacity=".6"/></g>`;
  function art(k) {
    const u = "bb" + (++uidN), g = (id, a, b) => `<radialGradient id="${u}${id}" cx="40%" cy="32%" r="75%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
    const shadow = `<ellipse cx="60" cy="108" rx="${[20, 26, 28, 28, 30, 36][k]}" ry="5" fill="#000" opacity=".12"/>`;
    let body = "";
    if (k === 0) body = `<defs>${g("b", "#f7e2b5", "#c08a4f")}</defs>${shadow}
      <path d="M60 50 C78 50 86 64 86 78 C86 94 75 104 60 104 C45 104 34 94 34 78 C34 64 42 50 60 50Z" fill="url(#${u}b)"/>
      ${[[46, 68], [70, 62], [76, 84], [44, 92], [58, 96], [66, 74]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#a8743f" opacity=".45"/>`).join("")}
      <path d="M60 50 C58 43 63 40 61 34" stroke="#c08a4f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${face(60, 80, .8)}`;
    else if (k === 1) body = `<defs>${g("b", "#a8e07f", "#3f8f3a")}</defs>${shadow}
      <path d="M60 30 C66 30 66 40 64 48" stroke="#8a5a2b" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="60" cy="27" rx="5.5" ry="7.5" fill="#b07a3c"/><path d="M55 22 Q60 15 65 22Z" fill="#7a4f22"/>
      <path d="M30 80 C30 58 44 46 60 46 C76 46 90 58 90 80 C90 97 77 106 60 106 C43 106 30 97 30 80Z" fill="url(#${u}b)"/>
      ${[[38, 56], [46, 49], [55, 46], [65, 46], [74, 49], [82, 56], [34, 64], [86, 64]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${5 + (i % 3)}" fill="${i % 2 ? "#5fae45" : "#79c457"}"/>`).join("")}
      ${leaf(30, 86, 10, 200, "#5fae45", "#2f6e2a")}${leaf(90, 86, 10, -20, "#5fae45", "#2f6e2a")}
      ${face(60, 80, .95)}`;
    else if (k === 2) body = `<defs>${g("b", "#8fe0b4", "#2a7f57")}</defs>${shadow}
      <path d="M60 46 C60 34 56 26 64 20 C72 14 80 22 75 28 C71 33 65 29 68 25" stroke="#2f8a5c" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M32 82 C32 60 44 44 60 44 C76 44 88 60 88 82 C88 98 76 107 60 107 C44 107 32 98 32 82Z" fill="url(#${u}b)"/>
      <g transform="translate(86 74) rotate(-35)"><path d="M0 0 C10 -6 26 -6 34 0 C26 6 10 6 0 0Z" fill="#3fa36f"/>${[6, 12, 18, 24].map(x => `<circle cx="${x}" cy="2.4" r="1.6" fill="#8a5a2b"/>`).join("")}</g>
      ${leaf(34, 88, 11, 205, "#3fa36f", "#1f5e40")}
      ${face(60, 78, 1)}`;
    else if (k === 3) body = `<defs>${g("b", "#d7f5a6", "#7cb342")}${g("c", "#c79a64", "#7a5230")}</defs>${shadow}
      <path d="M60 46 C60 38 60 34 60 30" stroke="#5f9e2f" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="46" cy="30" rx="15" ry="9" fill="#8bc34a" transform="rotate(-18 46 30)"/><ellipse cx="74" cy="30" rx="15" ry="9" fill="#8bc34a" transform="rotate(18 74 30)"/>
      <path d="M60 32 C56 24 58 18 60 14 C62 18 64 24 60 32Z" fill="#6aa83a"/>
      <path d="M33 78 C33 58 45 44 60 44 C75 44 87 58 87 78 L87 82 L33 82Z" fill="url(#${u}b)"/>
      <path d="M31 80 L37 74 L43 81 L50 73 L57 81 L64 73 L71 81 L78 74 L84 81 L89 77 C90 96 78 107 60 107 C42 107 30 96 31 80Z" fill="url(#${u}c)"/>
      ${face(60, 66, .95)}`;
    else if (k === 4) body = `<defs>${g("b", "#e4f7c9", "#8cc66a")}</defs>${shadow}
      ${[0, 72, 144, 216, 288].map(a => `<ellipse cx="60" cy="18" rx="9" ry="14" fill="#f48fbf" transform="rotate(${a} 60 30)"/>`).join("")}
      <circle cx="60" cy="30" r="8" fill="#ffd54f"/>${[[57, 28], [62, 31], [60, 26]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#f9a825"/>`).join("")}
      <path d="M32 80 C32 60 44 46 60 46 C76 46 88 60 88 80 C88 97 76 107 60 107 C44 107 32 97 32 80Z" fill="url(#${u}b)"/>
      ${leaf(32, 84, 12, 200, "#6db34a", "#2f6e2a")}${leaf(88, 84, 12, -20, "#6db34a", "#2f6e2a")}
      ${[[22, 50], [96, 44], [100, 70], [18, 76]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#ffd54f" opacity=".85"/>`).join("")}
      ${face(60, 78, 1)}`;
    else body = `<defs>${g("b", "#c9a77c", "#6d4c30")}${g("m", "#b6e39a", "#5fa045")}</defs>${shadow}
      <path d="M44 50 C40 38 32 32 24 30 M40 40 C36 30 38 22 42 16 M76 50 C80 38 88 32 96 30 M80 40 C84 30 82 22 78 16" stroke="#6d4c30" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      ${[[24, 28], [42, 14], [96, 28], [78, 14], [32, 22], [88, 22]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${7 + (i % 2) * 2}" fill="${i % 2 ? "#6db34a" : "#8bc34a"}"/>`).join("")}
      ${[[26, 24], [44, 12], [94, 26], [80, 10]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#f8bbd0"/>`).join("")}
      <path d="M28 82 C28 58 42 44 60 44 C78 44 92 58 92 82 C92 99 78 108 60 108 C42 108 28 99 28 82Z" fill="url(#${u}b)"/>
      <path d="M38 99 C42 92 50 90 56 93 C60 89 66 89 70 93 C76 91 82 94 83 100 C76 107 46 107 38 99Z" fill="url(#${u}m)"/>
      <path d="M36 66 q4 6 0 12 M84 64 q-4 6 0 12" stroke="#5a3d25" stroke-width="1.6" fill="none" opacity=".5"/>
      ${face(60, 70, 1.05, "wise")}`;
    return `<svg viewBox="0 0 120 120" aria-hidden="true">${body}</svg>`;
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
