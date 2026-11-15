// Outpost Zero v2 - design an outpost, predict what fails, stress-test it. Plain JS, no build step.
const MAX = 20, COLS = 6, ROWS = 4, HAB = 9, BAT = 5;
const DIFF = { easy: { n: 'Cadet', b: 20, fl: .1, du: .1 }, normal: { n: 'Pilot', b: 16, fl: .18, du: .15 }, hard: { n: 'Commander', b: 13, fl: .28, du: .22 } };
const SITES = {
  moon: { key: 'moon', name: 'Moon, south pole region', sun: 1, rad: 2.2, night: true,
    blurb: 'Full sunlight by day, then long dark nights. No air to stop radiation.',
    fact: 'A lunar night lasts about 14 Earth days (shortened here). The Moon has no atmosphere, so its surface gets roughly twice the daily radiation dose measured on Mars.' },
  mars: { key: 'mars', name: 'Mars, Jezero region', sun: .5, rad: 1, night: false,
    blurb: 'Sunlight is about half as strong, and dust storms can block it.',
    fact: 'Mars gets less than half the sunlight Earth does, and dust storms can dim it much more. Its thin atmosphere helps a bit against radiation.' }
};
const MOD = {
  sun: { n: 'Solar array', c: 2, t: 'SUN', col: '#ffcf9e', d: 'Makes 3 power in daylight', real: 'The International Space Station runs on large solar arrays.' },
  bat: { n: 'Battery', c: 1, t: 'BAT', col: '#3fa7a0', d: 'Stores 5 power for night and storms', real: 'Spacecraft in Earth\u2019s shadow rely on batteries to keep systems running.' },
  o2: { n: 'Oxygen plant', c: 3, t: 'O2', col: '#8fd3ff', d: 'Makes 4 oxygen, uses 2 power', real: 'The ISS makes oxygen from water using electricity.' },
  gh: { n: 'Greenhouse', c: 3, t: 'GRO', col: '#9be36a', d: 'Grows 3 food, uses 2 power', real: 'Astronauts have grown lettuce, radishes and chile peppers on the ISS.' },
  wall: { n: 'Regolith wall', c: 2, t: 'WALL', col: '#c49a72', d: 'Each blocks about 22% of radiation', real: 'Researchers study using Moon and Mars soil (regolith) as a radiation shield.' }
};
const FACTS = { 3: 'Each ISS astronaut uses roughly 0.8 kg of oxygen a day.', 8: 'Space radiation includes solar particle events (flares) and galactic cosmic rays.', 13: 'A Mars day (a sol) is about 24 hours 39 minutes long.', 18: 'NASA\u2019s Artemis program aims to return people to the Moon and prepare for Mars.' };
const PRED = { '': 'Choose a prediction...', power: 'Power will run short', o2: 'Oxygen will run out', food: 'Food will run out', rad: 'Radiation will hurt the crew', none: 'Nothing will go wrong' };
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = { get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
const today = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const CFG = { diff: 'normal', seed: today(), name: store.get('name', '') };
let BUDGET = 16, S = null, R = null, timer = null;
const count = k => S.grid.filter(x => x === k).length;
const spent = () => S.grid.reduce((a, x) => a + (x && x !== 'hab' ? MOD[x].c : 0), 0);
const stars = n => '\u2605'.repeat(n) + '\u2606'.repeat(3 - n);

function home() {
  clearTimeout(timer); S = null;
  $('#app').innerHTML = `<div class="box"><h2>Your job</h2><p>Four astronauts are landing. Design their outpost with limited build points, predict what will go wrong, then run a ${MAX}-sol stress test.</p>
  <p><label>Your name <input value="${esc(CFG.name)}" maxlength="30" oninput="CFG.name=this.value;store.set('name',this.value)"></label></p>
  <div class="tools">${Object.entries(DIFF).map(([k, d]) => `<button class="${CFG.diff === k ? 'on' : ''}" onclick="CFG.diff='${k}';home()">${d.n}: ${d.b} points</button>`).join('')}</div>
  <p><label>Challenge code <input type="number" value="${CFG.seed}" oninput="CFG.seed=+this.value||today()"></label></p>
  <p class="log">Same code means the same nights, storms and flares. Share it so classmates can compare designs fairly.</p></div>
  <div class="choose">${Object.values(SITES).map(s => { const b = store.get('best:' + s.key + CFG.diff, null); return `<button class="box" onclick="pickSite('${s.key}')"><h2>${s.name}</h2>${s.blurb}<p class="log">${b ? 'Best: ' + stars(b.stars) + ' ' + b.score : 'No score yet'}</p></button>`; }).join('')}</div>`;
}
function pickSite(k) { BUDGET = DIFF[CFG.diff].b; S = { site: SITES[k], grid: Array(COLS * ROWS).fill(null), pick: 'sun', pred: '' }; S.grid[HAB] = 'hab'; build(); }
function tile(x, i) {
  if (x === 'hab') return `<div class="t" style="background:#e8f1ff" title="Habitat">HAB</div>`;
  if (!x) return `<button class="t e" aria-label="Build here" onclick="place(${i})">+</button>`;
  return `<button class="t" style="background:${MOD[x].col}" aria-label="Remove ${MOD[x].n}" onclick="place(${i})">${MOD[x].t}</button>`;
}
function build() {
  const left = BUDGET - spent();
  $('#app').innerHTML = `<div class="sky ${S.site.key}"><b>${S.site.name}</b><b>${left} points left</b></div><div class="ground"></div>
  <div class="box"><h2>Pick a part, then tap an empty plot</h2><div class="tools">${Object.entries(MOD).map(([k, m]) =>
    `<button class="${S.pick === k ? 'on' : ''}" onclick="S.pick='${k}';build()" title="${m.d}"><span class="sw" style="background:${m.col}"></span>${m.n} (${m.c})</button>`).join('')}</div>
  <p class="log">${MOD[S.pick].d}. Tap a placed part to remove it. The habitat itself uses 1 power.</p>
  <div class="grid">${S.grid.map(tile).join('')}</div>
  <p class="log">${S.site.fact}</p>
  <p><label>Prediction <select onchange="S.pred=this.value">${Object.entries(PRED).map(([k, v]) => `<option value="${k}" ${S.pred === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label></p>
  <button class="go" onclick="launch()">Launch ${MAX}-sol test</button> <span class="log">Code ${CFG.seed} / ${DIFF[CFG.diff].n}</span></div>
  <details class="box"><summary>Real-world science behind each part</summary><ul>${Object.values(MOD).map(m => `<li><b>${m.n}:</b> ${m.real}</li>`).join('')}</ul>
  <p class="log">Learn more: <a href="https://science.nasa.gov/moon/">NASA Moon</a>, <a href="https://science.nasa.gov/mars/">NASA Mars</a>, <a href="https://www.nasa.gov/humans-in-space/artemis/">Artemis</a>. Values in this game are simplified.</p></details>
  <button onclick="home()">Back</button>`;
}
function place(i) {
  if (S.grid[i]) S.grid[i] = null; else if (MOD[S.pick].c <= BUDGET - spent()) S.grid[i] = S.pick;
  build();
}
function launch() {
  const r = rng(CFG.seed + (S.site.key === 'mars' ? 7 : 0)), D = DIFF[CFG.diff], flares = new Set(), dust = new Set();
  for (let s = 2; s <= MAX; s++) if (r() < D.fl) flares.add(s);
  if (S.site.key === 'mars') for (let s = 3; s <= MAX; s++) if (r() < D.du) { [s, s + 1, s + 2].forEach(v => dust.add(v)); s += 5; }
  R = { sol: 1, h: 100, o2: 30, food: 30, bat: BAT * count('bat'), flares, dust, hist: [], log: [], fact: '', st: { power: 0, o2: 0, food: 0, flare: 0, first: '' } };
  tick();
}
const cond = s => ({ night: S.site.night && ((s - 1) % 9) >= 6, dust: R.dust.has(s), flare: R.flares.has(s) });
function tick() {
  const s = R.sol, c = cond(s);
  const gen = count('sun') * 3 * S.site.sun * (c.night ? 0 : 1) * (c.dust ? .25 : 1);
  const dem = 1 + 2 * count('o2') + 2 * count('gh'), avail = gen + R.bat;
  const f = Math.min(1, avail / dem);
  R.bat = clamp(avail - dem * f, 0, BAT * count('bat'));
  let dmg = 0, note = [];
  const bad = k => { if (!R.st.first) R.st.first = k; };
  if (f < 1) { R.st.power++; note.push('Power shortage'); bad('power'); }
  let o = R.o2 + 4 * count('o2') * f - 4;
  if (o < 0) { dmg += 25; R.st.o2++; note.push('Out of oxygen'); bad('o2'); o = 0; }
  let fd = R.food + 3 * count('gh') * f - 4;
  if (fd < 0) { dmg += 10; R.st.food++; note.push('Out of food'); bad('food'); fd = 0; }
  R.o2 = clamp(o, 0, 100); R.food = clamp(fd, 0, 100);
  dmg += S.site.rad * 3 * (c.flare ? 3.5 : 1) * Math.pow(.78, count('wall'));
  if (c.flare) { note.push('Solar flare'); if (count('wall') < 3) { R.st.flare++; bad('rad'); } }
  R.h = clamp(R.h - dmg + (dmg < 4 ? 2 : 0), 0, 100);
  R.hist.push([R.h, R.o2, R.food]);
  R.log.unshift(`Sol ${s}: ${note.join(', ') || 'all systems normal'}`);
  if (FACTS[s]) R.fact = FACTS[s];
  show(c, gen, dem);
  if (R.h <= 0) return finish(false);
  if (s >= MAX) return finish(true);
  R.sol++; timer = setTimeout(tick, 380);
}
function meter(l, v, col) { return `<div class="m"><span>${l}</span><div class="bar"><i style="width:${clamp(v, 0, 100)}%;background:${col}"></i></div><span>${Math.round(v)}</span></div>`; }
function show(c, gen, dem) {
  $('#app').innerHTML = `<div class="sky ${S.site.key}"><b>Sol ${R.sol} of ${MAX}</b><b>Testing</b></div><div class="ground"></div>
  <div class="box">${meter('Health', R.h, R.h > 40 ? '#8be59a' : '#ff5e6c')}${meter('Oxygen', R.o2, '#8fd3ff')}${meter('Food', R.food, '#9be36a')}${meter('Battery', R.bat / (BAT * Math.max(1, count('bat'))) * 100, '#ffcf9e')}
  <p>${c.night ? '<span class="tag">Night</span>' : ''}${c.dust ? '<span class="tag">Dust storm</span>' : ''}${c.flare ? '<span class="tag bad">Solar flare</span>' : ''}<span class="tag">Power in ${gen.toFixed(1)}, out ${dem}</span></p>
  ${R.log.slice(0, 4).map(l => `<p class="log">${l}</p>`).join('')}${R.fact ? `<p class="log ok">Did you know? ${R.fact}</p>` : ''}</div>`;
}
function chart() {
  const L = ['#8be59a', '#8fd3ff', '#9be36a'];
  return `<svg viewBox="0 0 300 100" role="img" aria-label="Health, oxygen and food over time">${[0, 1, 2].map(k =>
    `<polyline fill="none" stroke="${L[k]}" stroke-width="${k ? 2 : 3}" stroke-dasharray="${k === 2 ? '4 3' : ''}" points="${R.hist.map((p, i) => `${5 + i * 290 / (MAX - 1)},${98 - p[k] * .94}`).join(' ')}"/>`).join('')}</svg>
  <p class="log">Bold green: health. Blue: oxygen. Dashed green: food.</p>`;
}
const WHY = {
  power: 'Your first problem was power. Real outposts size solar panels and batteries for the worst case, not the average day.',
  o2: 'Your first problem was oxygen. Engineers treat air as the top priority, since a crew has minutes without it.',
  food: 'Your first problem was food. Plants take time to grow, so greenhouses are built early.',
  rad: 'Your first problem was radiation. Walls of regolith (moon soil) are a real idea for blocking it, and flares come with little warning.'
};
function copyRes() {
  try { navigator.clipboard.writeText(R.share).then(() => { $('#cp').textContent = 'Copied!'; }); } catch (e) { $('#cp').textContent = 'Copy not supported'; }
}
function finish(win) {
  const st = !win ? 0 : 1 + (R.h >= 60 ? 1 : 0) + (R.h >= 60 && spent() <= BUDGET - 3 ? 1 : 0);
  const score = Math.round((win ? 200 : R.sol * 5) + R.h * 5 + (BUDGET - spent()) * 20 + st * 100);
  const key = 'best:' + S.site.key + CFG.diff, best = store.get(key, null), isBest = !best || score > best.score;
  if (isBest) store.set(key, { score, stars: st });
  store.set('tries', store.get('tries', 0) + 1);
  const design = Object.keys(MOD).map(k => `${MOD[k].t}x${count(k)}`).join(' ');
  R.share = `Outpost Zero | ${DIFF[CFG.diff].n} | ${S.site.name} | code ${CFG.seed} | ${stars(st)} | score ${score} | ${design}`;
  const first = R.st.first || 'none', pOk = S.pred && S.pred === first;
  $('#app').innerHTML = `<div class="sky ${S.site.key}"><b>${win ? 'Test passed' : 'Test failed on sol ' + R.sol}</b><b>${spent()}/${BUDGET} points</b></div><div class="ground"></div>
  <div class="box"><h2>${win ? 'Your design survived!' : 'Your crew did not make it.'}</h2>
  <p class="big">${stars(st)} Score ${score}${isBest ? ' (new best!)' : ''}</p>${chart()}
  <ul><li>${win ? `Final health ${Math.round(R.h)}%. Power shortages: ${R.st.power} sols. Flare hits with weak walls: ${R.st.flare}.` : WHY[R.st.first] || WHY.rad}</li>
  <li>${S.pred ? (pOk ? 'Your prediction was right. Good engineering instinct!' : `Your prediction missed. First problem: ${first === 'none' ? 'nothing went wrong' : PRED[first].toLowerCase()}.`) : 'Tip: make a prediction before launching to test your instincts.'}</li>
  <li>Every point spent on one part is a point not spent on another. That trade-off is the heart of mission design.</li>
  <li class="log">Stars: 1 for surviving, 2 for health 60% or more, 3 for also saving 3+ build points.</li></ul>
  <div class="row"><button class="go" onclick="build()">Improve my design</button><button onclick="home()">Change location</button><button id="cp" onclick="copyRes()">Copy my result</button></div></div>
  ${win ? `<div class="box cert"><h2>Mission certificate</h2><p>${esc(CFG.name || 'Junior Astronaut')} designed a ${S.site.name} outpost that survived ${MAX} sols on ${DIFF[CFG.diff].n} level. ${stars(st)} Score ${score}. Challenge code ${CFG.seed}.</p></div><button onclick="window.print()">Print certificate</button>` : ''}`;
}
home();
