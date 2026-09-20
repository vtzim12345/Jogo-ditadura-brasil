// Local save (localStorage) — investigation game state.
export type Difficulty = 'facil' | 'normal' | 'dificil';

export interface SaveData {
  version: number;
  difficulty: Difficulty;
  character: string | null;
  room: number;                 // index into campaign.rooms
  flags: Record<string, boolean>;
  clues: string[];              // collected clue ids
  clueData: Record<string, { title: string; text: string; cat: string }>;
  solved: string[];             // solved puzzle ids
  items: Record<string, number>;// inventory counts
  resources: number;            // currency (Cruzeiros)
  lives: number;
  maxLives: number;
  suspicion: number;            // 0..100
  choices: Record<string, string>;
  archive: string[];            // unlocked archive ids
  introSeen: number[];          // room indexes whose intro was shown
  missionStage: Record<string, number>; // etapa atual de cada missão (por id)
  settings: { music: number; sfx: number; audioOn: boolean; textSpeed: number; reduceMotion: boolean };
}

const KEY = 'ditadura_vozes_save_v2';

export function defaultSave(): SaveData {
  return {
    version: 2, difficulty: 'normal', character: null, room: 0,
    flags: {}, clues: [], clueData: {}, solved: [], items: {},
    resources: 15, lives: 3, maxLives: 3, suspicion: 0,
    choices: {}, archive: ['periodo', 'ai5'], introSeen: [], missionStage: {},
    settings: { music: 0.5, sfx: 0.7, audioOn: true, textSpeed: 1, reduceMotion: false }
  };
}

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (d && d.version === 2) { const base = defaultSave(); return { ...base, ...d, settings: { ...base.settings, ...(d.settings || {}) } }; }
  } catch {}
  return null;
}
export function writeSave(d: SaveData) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
}
export function clearSave() { try { localStorage.removeItem(KEY); } catch {} }
export function hasSave(): boolean { return !!loadSave(); }

// Apply difficulty presets to a fresh save.
export function applyDifficulty(d: SaveData, diff: Difficulty) {
  d.difficulty = diff;
  if (diff === 'facil') { d.maxLives = 5; d.lives = 5; d.resources = 30; }
  else if (diff === 'normal') { d.maxLives = 3; d.lives = 3; d.resources = 15; }
  else { d.maxLives = 2; d.lives = 2; d.resources = 6; }
}

// Suspicion multiplier by difficulty.
export function suspMul(d: Difficulty): number {
  return d === 'facil' ? 0.5 : d === 'normal' ? 1 : 1.5;
}
// Puzzle attempts before losing a life.
export function puzzleAttempts(d: Difficulty): number {
  return d === 'facil' ? 5 : d === 'normal' ? 4 : 3;
}
// Auto-show a puzzle hint?
export function autoHint(d: Difficulty): boolean { return d === 'facil'; }
// Hidden props visible without the magnifier item?
export function autoRevealHidden(d: Difficulty): boolean { return d === 'facil'; }
