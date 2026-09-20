import './style.css';
import { Input } from './core/input';
import { AudioSys } from './core/audio';
import { loadSave, defaultSave, SaveData, writeSave, clearSave, applyDifficulty, Difficulty } from './core/save';
import { TitleScene, AboutScene, CharSelect, DifficultyScene } from './scenes/menus';
import { EndingScene } from './scenes/ending';
import { AdventureScene } from './game/adv/engine';
import { clear } from './core/gfx';

const VW = 960, VH = 540;
const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = VW; canvas.height = VH;

function fitCanvas() {
  const vv = window.visualViewport;
  const cw = Math.round((vv && vv.width) || window.innerWidth);
  const ch = Math.round((vv && vv.height) || window.innerHeight);
  const scale = Math.min(cw / VW, ch / VH);
  canvas.style.width = Math.round(VW * scale) + 'px';
  canvas.style.height = Math.round(VH * scale) + 'px';
}
window.addEventListener('resize', fitCanvas);
if (window.visualViewport) window.visualViewport.addEventListener('resize', fitCanvas);
// mobile: após girar, o navegador reporta tamanho velho — refaz o encaixe com atraso
window.addEventListener('orientationchange', () => { fitCanvas(); setTimeout(fitCanvas, 250); setTimeout(fitCanvas, 600); });
fitCanvas();

const input = new Input(canvas);
const audio = new AudioSys();

type AppState = 'title' | 'about' | 'select' | 'difficulty' | 'play' | 'ending';
let state: AppState = 'title';

let save: SaveData = loadSave() || defaultSave();
applyAudioSettings();

const title = new TitleScene();
const about = new AboutScene();
const select = new CharSelect();
const difficulty = new DifficultyScene();
const ending = new EndingScene();
let play: AdventureScene | null = null;
let pendingChar: string | null = null;

function applyAudioSettings() {
  audio.setMusicVol(save.settings.music);
  audio.setSfxVol(save.settings.sfx);
  audio.setEnabled(save.settings.audioOn);
}

function launch() {
  play = new AdventureScene(save, () => { ending.reset(save); state = 'ending'; }, () => { state = 'title'; });
  play.enter(audio);
  state = 'play';
}

function startNew(char: string, diff: Difficulty) {
  const settings = save.settings;
  save = defaultSave();
  save.settings = settings;
  save.character = char;
  applyDifficulty(save, diff);
  writeSave(save);
  launch();
}

// ---------- MOBILE CONTROLS ----------
const touchLayer = document.getElementById('touch-layer')!;
let isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

// fábrica de botões tipo gamepad (segurar = ação contínua)
function mkBtn(o: { label: string; size: number; right?: string; bottom?: string; left?: string; font?: number; onDown?: () => void; onUp?: () => void }) {
  const b = document.createElement('div');
  b.className = 'tbtn';
  b.style.width = o.size + 'px'; b.style.height = o.size + 'px';
  if (o.right) b.style.right = o.right;
  if (o.left) b.style.left = o.left;
  if (o.bottom) b.style.bottom = o.bottom;
  b.style.fontSize = (o.font || 15) + 'px';
  b.textContent = o.label;
  b.addEventListener('pointerdown', (e) => {
    e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch {}
    b.classList.add('pressed'); audio.init(); audio.resume(); o.onDown && o.onDown();
  });
  const up = (e: PointerEvent) => { e.preventDefault(); b.classList.remove('pressed'); o.onUp && o.onUp(); };
  b.addEventListener('pointerup', up);
  b.addEventListener('pointercancel', up);
  touchLayer.appendChild(b);
  return b;
}

function buildTouchControls() {
  if (!isTouch) return;
  // ---- direcional analógico (esquerda) ----
  const stick = document.createElement('div');
  stick.className = 'tbtn'; stick.style.left = '18px'; stick.style.bottom = '22px';
  stick.style.width = '128px'; stick.style.height = '128px';
  const knob = document.createElement('div');
  knob.style.cssText = 'position:absolute;width:54px;height:54px;border-radius:50%;background:rgba(217,164,65,.75);left:37px;top:37px;transition:none';
  stick.appendChild(knob);
  const knobLabel = document.createElement('div'); knobLabel.textContent = '◀  ▶';
  knobLabel.style.cssText = 'position:absolute;bottom:-22px;width:100%;text-align:center;font-size:11px;color:#cfc7b2';
  stick.appendChild(knobLabel);
  const R = 44; // curso do direcional
  let cx = 0, active = -1;
  stick.addEventListener('pointerdown', (e) => { e.preventDefault(); active = e.pointerId; cx = e.clientX; try { stick.setPointerCapture(e.pointerId); } catch {} audio.init(); audio.resume(); });
  stick.addEventListener('pointermove', (e) => {
    if (e.pointerId !== active) return;
    const dx = Math.max(-R, Math.min(R, e.clientX - cx));
    input.axisX = dx / R; knob.style.left = (37 + dx * 0.6) + 'px';
  });
  const reset = () => { input.axisX = 0; knob.style.left = '37px'; active = -1; };
  stick.addEventListener('pointerup', reset); stick.addEventListener('pointercancel', reset);
  touchLayer.appendChild(stick);

  // ---- botões de ação (direita), dispostos como um gamepad ----
  // Pular (principal, maior)
  mkBtn({ label: 'PULAR', size: 88, right: '20px', bottom: '20px', font: 14,
    onDown: () => { input.touchJump = true; input.touchJumpJust = true; },
    onUp: () => { input.touchJump = false; } });
  // Golpear
  mkBtn({ label: 'GOLPE', size: 74, right: '118px', bottom: '34px', font: 13,
    onDown: () => { input.touchAttack = true; input.touchAttackJust = true; },
    onUp: () => { input.touchAttack = false; } });
  // Interagir
  mkBtn({ label: 'E', size: 70, right: '30px', bottom: '118px', font: 20,
    onDown: () => { input.touchInteract = true; input.touchInteractJust = true; },
    onUp: () => { input.touchInteract = false; } });
  // Agachar (segurar)
  mkBtn({ label: '▼', size: 62, right: '124px', bottom: '124px', font: 22,
    onDown: () => { input.touchCrouch = true; },
    onUp: () => { input.touchCrouch = false; } });

  updateTouchVisibility();
}
function updateTouchVisibility() {
  touchLayer.style.display = (isTouch && state === 'play' && play && play.mode === 'explore') ? 'block' : 'none';
}
buildTouchControls();

// ---------- ORIENTATION ----------
const orient = document.getElementById('orient-warning')!;
function checkOrient() {
  const portrait = window.innerHeight > window.innerWidth;
  if (isTouch && portrait) orient.classList.add('show'); else orient.classList.remove('show');
}
window.addEventListener('resize', checkOrient);
window.addEventListener('orientationchange', checkOrient);
checkOrient();

// unlock audio on first interaction
function unlock() { audio.init(); audio.resume(); }
window.addEventListener('pointerdown', unlock, { once: true });
window.addEventListener('keydown', unlock, { once: true });

// ---------- LOOP ----------
let last = performance.now();
function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  update(dt); render(now / 1000);
  input.endFrame();
  requestAnimationFrame(frame);
}

function update(dt: number) {
  applyAudioSettings();
  if (state === 'title') {
    const r = title.update(dt, input, VW, VH, audio);
    if (r === 'continue') { save = loadSave() || save; applyAudioSettings(); launch(); }
    else if (r === 'play') { select.selected = 0; state = 'select'; }
    else if (r === 'about') { about.scroll = 0; state = 'about'; }
  } else if (state === 'about') {
    if (about.update(input, VW, VH) === 'back') state = 'title';
  } else if (state === 'select') {
    const chosen = select.update(input, VW, VH, audio);
    if (chosen) { pendingChar = chosen; difficulty.selected = 1; state = 'difficulty'; }
    if (input.pressed('escape')) state = 'title';
  } else if (state === 'difficulty') {
    const r = difficulty.update(input, VW, VH, audio);
    if (r === 'back') state = 'select';
    else if (r) startNew(pendingChar || 'antonio', r);
  } else if (state === 'play' && play) {
    play.update(dt, input, audio, VW, VH);
  } else if (state === 'ending') {
    if (ending.update(dt, input, VW, VH, audio) === 'menu') { state = 'title'; }
  }
  updateTouchVisibility();
}

function render(t: number) {
  clear(ctx, VW, VH, '#0d0f14');
  if (state === 'title') title.draw(ctx, VW, VH);
  else if (state === 'about') about.draw(ctx, VW, VH);
  else if (state === 'select') select.draw(ctx, VW, VH);
  else if (state === 'difficulty') difficulty.draw(ctx, VW, VH);
  else if (state === 'play' && play) play.draw(ctx, VW, VH, t * 1000, input);
  else if (state === 'ending') ending.draw(ctx, VW, VH);
}

requestAnimationFrame(frame);

// expose a debug reset
(window as any).__resetSave = () => { clearSave(); location.reload(); };
