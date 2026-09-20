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
  const cw = window.innerWidth, ch = window.innerHeight;
  const scale = Math.min(cw / VW, ch / VH);
  canvas.style.width = Math.round(VW * scale) + 'px';
  canvas.style.height = Math.round(VH * scale) + 'px';
}
window.addEventListener('resize', fitCanvas);
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
function buildTouchControls() {
  if (!isTouch) return;
  const stick = document.createElement('div');
  stick.className = 'tbtn'; stick.style.left = '20px'; stick.style.bottom = '20px';
  stick.style.width = '110px'; stick.style.height = '110px';
  const knob = document.createElement('div');
  knob.style.cssText = 'position:absolute;width:46px;height:46px;border-radius:50%;background:rgba(217,164,65,.7);left:32px;top:32px';
  stick.appendChild(knob);
  const knobLabel = document.createElement('div'); knobLabel.textContent = '◀ ▶';
  knobLabel.style.cssText = 'position:absolute;bottom:-20px;width:100%;text-align:center;font-size:11px;color:#cfc7b2';
  stick.appendChild(knobLabel);
  let cx = 0, active = -1;
  stick.addEventListener('pointerdown', (e) => { active = e.pointerId; cx = e.clientX; stick.setPointerCapture(e.pointerId); });
  stick.addEventListener('pointermove', (e) => {
    if (e.pointerId !== active) return;
    const dx = Math.max(-40, Math.min(40, e.clientX - cx));
    input.axisX = dx / 40; knob.style.left = (32 + dx) + 'px';
  });
  const reset = () => { input.axisX = 0; knob.style.left = '32px'; active = -1; };
  stick.addEventListener('pointerup', reset); stick.addEventListener('pointercancel', reset);
  touchLayer.appendChild(stick);

  const act = document.createElement('div');
  act.className = 'tbtn'; act.style.right = '24px'; act.style.bottom = '30px';
  act.style.width = '78px'; act.style.height = '78px'; act.style.fontSize = '15px';
  act.textContent = 'E';
  act.addEventListener('pointerdown', (e) => { e.preventDefault(); input.touchInteract = true; input.touchInteractJust = true; audio.init(); audio.resume(); });
  act.addEventListener('pointerup', () => { input.touchInteract = false; });
  touchLayer.appendChild(act);

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
