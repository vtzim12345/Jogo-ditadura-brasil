// Data model for the investigation campaigns.
export interface Line { who: string; text: string; emo?: string; }

export interface ClueDef { id: string; title: string; text: string; cat: ClueCat; }
export type ClueCat = 'documento' | 'foto' | 'nome' | 'data' | 'local' | 'codigo' | 'gravacao' | 'objeto';

export interface Reward { resources?: number; life?: number; item?: string; archive?: string; }

export interface ChoiceOpt {
  key: string; label: string; hint?: string;
  result: string;            // narration shown after choosing
  suspicion?: number;        // delta
  reward?: Reward;
  setFlag?: string;
  clue?: ClueDef;
}
export interface ChoiceDef { id: string; prompt: string; options: ChoiceOpt[]; }

export type PuzzleKind = 'cipher' | 'doc' | 'news' | 'code' | 'photo' | 'radio';

export interface PuzzleDef {
  id: string; kind: PuzzleKind; title: string; brief: string; hint: string;
  // config per kind (only relevant fields used):
  cipherText?: string; cipherShift?: number; cipherPlain?: string;     // cipher
  docText?: string; docTarget?: string[]; docPrompt?: string;          // doc (words to click)
  newsA?: string[]; newsB?: string[]; newsAnswer?: number;             // news (index of altered line)
  codeLen?: number; codeAnswer?: string; codeHint?: string;            // code lock
  photoScene?: string; photoHot?: [number, number, number]; photoPrompt?: string; // photo (x,y,r in 0..1)
  radioTarget?: number; radioMsg?: string;                             // radio (0..100 freq)
  onSolve?: { clue?: ClueDef; reward?: Reward; setFlag?: string; say?: Line[]; archive?: string; };
}

export type PropKind = 'talk' | 'clue' | 'reward' | 'puzzle' | 'choice' | 'exit' | 'look'
  | 'door' | 'drawer' | 'radio' | 'window';   // FASE 4: props de gameplay

export interface Prop {
  id: string; x: number; kind: PropKind; label: string; glyph?: string;
  py?: number;               // altura do prop (topo de plataforma); default = chão
  hidden?: boolean;          // rewards exploration; needs magnifier on normal/hard
  once?: boolean;            // default true for most; consumed after use
  requires?: string;         // flag id that must be true to interact
  needCalm?: boolean;        // refuses if suspicion >= 70
  say?: Line[];
  clue?: ClueDef;
  reward?: Reward;
  puzzle?: PuzzleDef;
  choice?: ChoiceDef;
  to?: number;               // exit target room index; -1 = ending
  gate?: string;             // flag required for exit; else shows lockedSay
  lockedSay?: Line[];
  suspicion?: number;        // delta on interact
  setFlag?: string;          // flag set after interacting (clue/reward/talk/look)
  needItem?: string;         // item necessário para abrir (door/drawer)
  consumesItem?: boolean;    // consome o item ao usar (ex.: chave de uso único)
}

// Plataforma sólida (colisão one-way: pousa por cima, atravessa por baixo).
export interface Platform { x: number; y: number; w: number; kind?: 'crate' | 'ledge' | 'desk' | 'scaffold' | 'roof' | 'stair'; }
// Patrulha inimiga (militar/vigia) percorrendo um trecho.
export interface Patrol { x0: number; x1: number; y?: number; speed?: number; kind?: 'soldier' | 'agent' | 'cop'; }

// --- Sistema de missões (objetivo principal + subobjetivos dinâmicos por etapa) ---
export type ObjTrigger =
  | { t: 'flag'; v: string }      // save.flags[v] verdadeiro
  | { t: 'prop'; v: string }      // prop com id v foi usado
  | { t: 'clue'; v: string }      // pista v coletada
  | { t: 'solve'; v: string }     // enigma v resolvido
  | { t: 'choice'; v: string }    // escolha v tomada
  | { t: 'item'; v: string }      // item v no inventário
  | { t: 'evade' };               // sobreviveu/escapou de um alerta
export interface SubObjective { id: string; label: string; on: ObjTrigger; optional?: boolean; }
export interface MissionStage { objective: string; subs: SubObjective[]; reward?: Reward; say?: Line[]; setFlag?: string; }
export interface Mission { id: string; title: string; stages: MissionStage[]; }

export interface Room {
  id: string; biome: string; mood: string; year: number; worldW: number;
  title: string; sub: string; objective: string;
  intro?: Line[];
  props: Prop[];
  platforms?: Platform[];    // rotas verticais (se ausente, geradas por bioma)
  patrols?: Patrol[];        // vigias (se ausente, geradas conforme bioma/mood)
  flat?: boolean;            // desativa geração automática de plataformas
  tip?: string;              // dica de tutorial mostrada ao entrar
  mission?: Mission;         // missão encenada (se ausente, gerada a partir dos props)
}

export interface Campaign {
  char: string; name: string; role: string; premise: string;
  rooms: Room[];
}
