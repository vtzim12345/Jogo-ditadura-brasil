import { Ctx, text, panel, rect, rr, clamp, wrap } from '../../core/gfx';
import { Input } from '../../core/input';
import { AudioSys } from '../../core/audio';
import { SaveData, writeSave, suspMul, puzzleAttempts, autoHint, autoRevealHidden } from '../../core/save';
import { drawScene, GROUND_Y } from '../scenery';
import { drawChar } from '../sprites';
import { CHARACTERS } from '../../data/characters';
import { DialogueBox } from '../dialogue';
import { PuzzleHost } from './puzzles';
import { MenuUI, drawTopHUD, menuBtnHit } from './ui';
import { VfxSystem } from './vfx';
import { CAMPAIGNS } from '../../data/campaigns';
import { Campaign, Room, Prop, Line, ClueDef, Reward, Platform, Mission, MissionStage, SubObjective, ObjTrigger } from './types';
import { genPlatforms, genPatrols, drawPlatform, Guard, Shot, MELEE_RANGE } from './world';

// --- constantes de física (px, px/s, px/s²) ---
const GRAV = 2100, MAXFALL = 1360;
const SPD_WALK = 210, SPD_RUN = 360, SPD_CROUCH = 108;
const ACC_GND = 1700, ACC_AIR = 900, FRICTION = 2400;
const JUMP_V = 690, COYOTE = 0.10, JUMP_BUF = 0.12;

type Mode = 'explore' | 'dialogue' | 'puzzle' | 'choice' | 'menu' | 'cine' | 'defeat' | 'ended';
interface PropState extends Prop { used: boolean; }

export class AdventureScene {
  save: SaveData; camp: Campaign;
  mode: Mode = 'explore';
  playerX = 120; camX = 0; facing = 1; frame = 0; moving = false;
  // --- estado do plataformer ---
  playerY = GROUND_Y; vx = 0; vy = 0; onGround = true; crouch = false; running = false;
  private coyoteT = 0; private jumpBufT = 0; private stunT = 0; private dropT = 0;
  private jumpCut = false; private landSquash = 0;
  private standPlat: Platform | null = null;
  platforms: Platform[] = [];
  guards: Guard[] = [];
  detect = 0; private spotCd = 0;
  // --- combate / HP ---
  hp = 4; maxHp = 4; private invulnT = 0; private atkT = 0; private atkCd = 0;
  shots: Shot[] = [];
  private hurtFlash = 0;
  // --- objetivos dinâmicos + subobjetivos ---
  private dynObj: string | null = null; private dynObjT = 0; private anyAlert = false; private calmT = 0;
  private steps: { label: string; id: string; kind: string; done: boolean }[] = [];
  private mission: Mission | null = null; private mStage: MissionStage | null = null; private mStageN = 0;
  private defeatSel = 0;
  private tip = ''; private tipT = 0;
  props: PropState[] = [];
  dlg = new DialogueBox(); puzzle = new PuzzleHost(); menu = new MenuUI();
  private queue: Line[] = []; private afterQueue: null | (() => void) = null;
  private curPuzzleProp: PropState | null = null;
  private curChoice: Prop['choice'] | null = null; private curChoiceProp: PropState | null = null;
  toast = ''; private toastT = 0;
  revealHidden = false;
  private cineLines: string[] = []; private cineT = 0;
  private pendingEnding = false;
  private shake = 0;
  vfx = new VfxSystem();
  private prevSusp = 0;
  onEnding: () => void; onExit: () => void;

  constructor(save: SaveData, onEnding: () => void, onExit: () => void) {
    this.save = save; this.onEnding = onEnding; this.onExit = onExit;
    this.camp = CAMPAIGNS[save.character || 'antonio'];
    this.dlg.speed = save.settings.textSpeed;
    this.prevSusp = save.suspicion;
    this.vfx.setReduceMotion(!!save.settings.reduceMotion);
  }

  get room(): Room { return this.camp.rooms[Math.min(this.save.room, this.camp.rooms.length - 1)]; }

  enter(audio: AudioSys) { this.loadRoom(audio, true); }

  private loadRoom(audio: AudioSys, playIntro: boolean) {
    const r = this.room;
    this.playerX = 120; this.camX = 0; this.facing = 1; this.revealHidden = false;
    // reset físico
    this.playerY = GROUND_Y; this.vx = 0; this.vy = 0; this.onGround = true;
    this.crouch = false; this.running = false; this.coyoteT = 0; this.jumpBufT = 0;
    this.stunT = 0; this.dropT = 0; this.standPlat = null; this.detect = 0; this.spotCd = 0;
    this.jumpCut = false; this.landSquash = 0;
    this.maxHp = this.save.difficulty === 'facil' ? 5 : this.save.difficulty === 'dificil' ? 3 : 4;
    this.hp = this.maxHp; this.invulnT = 0; this.atkT = 0; this.atkCd = 0; this.shots = []; this.hurtFlash = 0;
    this.dynObj = null; this.dynObjT = 0; this.anyAlert = false; this.calmT = 0;
    this.platforms = genPlatforms(r);
    this.guards = genPatrols(r).map((p) => new Guard(p));
    this.loadMission(r);
    this.buildSteps(r);
    this.tip = r.tip || ''; this.tipT = r.tip ? 6 : 0;
    this.props = r.props.map((p) => ({ ...p, used: !!this.save.flags['used_' + p.id] }));
    audio.music(r.mood === 'heavy' ? 'heavy' : r.mood === 'hope' ? 'hope' : r.mood === 'tense' ? 'tense' : 'calm');
    this.vfx.reset();
    this.vfx.setReduceMotion(!!this.save.settings.reduceMotion);
    this.vfx.setForRoom(r.biome, r.mood as any);
    writeSave(this.save);
    if (playIntro && r.intro && !this.save.introSeen.includes(this.save.room)) {
      this.save.introSeen.push(this.save.room);
      this.startQueue(r.intro, null);
    } else this.mode = 'explore';
  }

  private startQueue(lines: Line[], after: null | (() => void)) {
    this.queue = lines.slice(); this.afterQueue = after;
    this.mode = 'dialogue'; this.popQueue();
  }
  private popQueue() {
    if (this.queue.length === 0) { const cb = this.afterQueue; this.afterQueue = null; this.mode = 'explore'; if (cb) cb(); return; }
    const q = this.queue.shift()!;
    this.dlg.open(q.who === 'hero' ? this.save.character! : q.who, q.text, q.emo || 'normal', this.save.character!);
  }

  private setToast(s: string) { this.toast = s; this.toastT = 2.4; }

  private addClue(c: ClueDef) {
    if (!this.save.clues.includes(c.id)) {
      this.save.clues.push(c.id);
      this.save.clueData[c.id] = { title: c.title, text: c.text, cat: c.cat };
      this.setToast('◉ Pista adicionada: ' + c.title);
    }
  }
  private applyReward(r: Reward, audio: AudioSys) {
    if (r.resources) { this.save.resources += r.resources; this.setToast('+ Cr$ ' + r.resources); }
    if (r.life) { this.save.lives = Math.min(this.save.maxLives, this.save.lives + r.life); this.setToast('+' + r.life + ' vida'); }
    if (r.item) { this.save.items[r.item] = (this.save.items[r.item] || 0) + 1; this.setToast('Item obtido'); }
    if (r.archive && !this.save.archive.includes(r.archive)) this.save.archive.push(r.archive);
    audio.sfxStamp();
  }
  private addSusp(d: number) { this.save.suspicion = clamp(this.save.suspicion + d * suspMul(this.save.difficulty), 0, 100); }

  private loseLife(audio: AudioSys) {
    this.save.lives--; audio.sfxAlert();
    this.vfx.setReduceMotion(!!this.save.settings.reduceMotion);
    this.vfx.shake(1, 0.5); this.vfx.flash('#7a1414', 0.5, 0.5);
    this.vfx.burst(this.playerX - this.camX, GROUND_Y - 40, 'impact', 20);
    if (this.save.lives <= 0) {
      this.save.lives = 1; this.save.suspicion = 40;
      this.cineLines = ['Passos no corredor. Uma mão no ombro.', 'Você foi levado para "prestar esclarecimentos".', 'Horas depois, liberado — abalado, mas vivo. Recomece com cautela.'];
      this.cineT = 0; this.mode = 'cine';
    }
    writeSave(this.save);
  }

  // ---------- UPDATE ----------
  update(dt: number, input: Input, audio: AudioSys, W: number, H: number) {
    this.frame += dt * 60 * (this.moving ? 1 : 0.4);
    if (this.toastT > 0) this.toastT -= dt;
    this.vfx.setReduceMotion(!!this.save.settings.reduceMotion);
    this.vfx.update(dt, W, H, audio);
    // sirene ao cruzar limiar de suspeita
    if (this.save.suspicion >= 70 && this.prevSusp < 70) { this.vfx.sirenPulse(1.8); audio.sfxAlert(); }
    this.prevSusp = this.save.suspicion;

    if (this.mode === 'cine') {
      this.cineT += dt;
      const adv = input.pressed(' ') || input.pressed('enter') || input.pointer.justDown;
      if ((adv && this.cineT > 0.5) || this.cineT > 7) { this.mode = 'explore'; this.loadRoom(audio, false); }
      return;
    }
    if (this.mode === 'defeat') { this.updateDefeat(input, audio, W, H); return; }
    if (this.mode === 'menu') {
      const r = this.menu.update(dt, input, W, H, this.save, audio);
      if (r === 'close') { writeSave(this.save); this.mode = 'explore'; }
      else if (r === 'reveal') this.revealHidden = true;
      return;
    }
    if (this.mode === 'ended') return;

    // ESC / MENU button opens diary
    if (input.pressed('escape') || menuBtnHit(input, W)) {
      if (this.mode === 'explore' || this.mode === 'dialogue') { this.menu.open(this.currentObjective(), this.camp.premise); this.mode = 'menu'; return; }
    }
    const advance = input.pressed(' ') || input.pressed('enter') || (input.pointer.justDown && input.pointer.y > H - 170);

    if (this.mode === 'dialogue') {
      const done = this.dlg.update(dt, advance, input.down('shift') || input.touchInteract);
      if (done) { audio.sfxType(); this.popQueue(); }
      return;
    }
    if (this.mode === 'puzzle') {
      this.puzzle.update(dt, input, W, H, audio);
      if (this.puzzle.solved) { this.onPuzzleSolved(audio); return; }
      if (this.puzzle.attempts <= 0) { this.mode = 'explore'; this.loseLife(audio); return; }
      if (this.puzzle.closed) { this.mode = 'explore'; }
      return;
    }
    if (this.mode === 'choice') { this.updateChoice(input, audio, W, H); return; }
    if (this.mode === 'explore') this.updateExplore(dt, input, audio, W, H);
  }

  private visibleProps(): PropState[] {
    const reveal = this.revealHidden || autoRevealHidden(this.save.difficulty);
    return this.props.filter((p) => (!p.hidden || reveal));
  }

  private updateExplore(dt: number, input: Input, audio: AudioSys, W: number, _H: number) {
    if (this.tipT > 0) this.tipT -= dt;
    // ---- entrada de movimento ----
    let dir = 0;
    if (input.down('a', 'arrowleft')) dir -= 1;
    if (input.down('d', 'arrowright')) dir += 1;
    dir += clamp(input.axisX, -1, 1); dir = clamp(dir, -1, 1);
    const wantDown = input.down('s', 'arrowdown');
    // agachar/correr só valem no chão
    this.crouch = this.onGround && input.down('control') && Math.abs(dir) < 0.9;
    this.running = this.onGround && !this.crouch && input.down('shift') && Math.abs(dir) > 0.1;

    // ---- pulo: buffer + coyote ----
    if (input.pressed(' ') || input.pressed('w') || input.pressed('arrowup') || (input.pointer.justDown && input.pointer.y < GROUND_Y - 40)) {
      if (this.onGround && this.standPlat && wantDown) { this.dropT = 0.14; this.onGround = false; this.playerY += 4; } // descer da plataforma
      else this.jumpBufT = JUMP_BUF;
    }
    if (this.jumpBufT > 0 && (this.onGround || this.coyoteT > 0) && this.stunT <= 0) {
      this.vy = -JUMP_V; this.onGround = false; this.coyoteT = 0; this.jumpBufT = 0; this.jumpCut = true;
      this.vfx.burst(this.playerX - this.camX, this.playerY - 2, 'dust', 8); audio.sfxStep();
    }
    if (this.jumpBufT > 0) this.jumpBufT -= dt;
    // ---- pulo de altura variável: soltar o botão corta o impulso (short hop) ----
    const jumpHeld = input.down(' ') || input.down('w') || input.down('arrowup');
    if (this.jumpCut && !jumpHeld && this.vy < -260) this.vy = -260;
    if (this.vy >= 0) this.jumpCut = false;

    // ---- integração horizontal (aceler./atrito) ----
    const maxSpd = this.crouch ? SPD_CROUCH : this.running ? SPD_RUN : SPD_WALK;
    const target = this.stunT > 0 ? this.vx * 0.9 : dir * maxSpd;
    const acc = this.stunT > 0 ? FRICTION * 0.4 : (this.onGround ? ACC_GND : ACC_AIR);
    if (this.stunT > 0) this.stunT -= dt;
    if (Math.abs(target) > Math.abs(this.vx) || Math.sign(target) !== Math.sign(this.vx)) {
      this.vx += clamp(target - this.vx, -acc * dt, acc * dt);
    } else {
      const f = (this.onGround ? FRICTION : ACC_AIR) * dt;
      this.vx += clamp(target - this.vx, -f, f);
    }
    const prevX = this.playerX;
    this.playerX = clamp(this.playerX + this.vx * dt, 50, this.room.worldW - 50);
    if (this.playerX === 50 || this.playerX === this.room.worldW - 50) this.vx = 0;
    this.moving = Math.abs(this.playerX - prevX) > 0.5;
    if (this.moving && this.stunT <= 0) this.facing = this.vx < 0 ? -1 : 1;
    if (this.onGround && this.moving && !this.crouch && Math.random() < dt * (this.running ? 9 : 5)) audio.sfxStep();

    // ---- integração vertical (gravidade + colisão) ----
    const prevFeet = this.playerY;
    this.vy = Math.min(MAXFALL, this.vy + GRAV * dt);
    const descV = this.vy;   // velocidade de descida neste quadro (para squash de pouso)
    this.playerY += this.vy * dt;
    if (this.dropT > 0) this.dropT -= dt;
    let landed = false; this.standPlat = null;
    // plataformas one-way (pousa por cima; atravessa por baixo)
    if (this.vy >= 0 && this.dropT <= 0) {
      for (const pf of this.platforms) {
        if (this.playerX > pf.x - 8 && this.playerX < pf.x + pf.w + 8 &&
            prevFeet <= pf.y + 10 && this.playerY >= pf.y) {
          this.playerY = pf.y; this.vy = 0; landed = true; this.standPlat = pf; break;
        }
      }
    }
    // chão sólido
    if (this.playerY >= GROUND_Y) { this.playerY = GROUND_Y; this.vy = 0; landed = true; this.standPlat = null; }
    const wasAir = !this.onGround;
    this.onGround = landed;
    if (this.onGround) this.coyoteT = COYOTE; else if (this.coyoteT > 0) this.coyoteT -= dt;
    if (this.onGround && wasAir) { this.vfx.burst(this.playerX - this.camX, this.playerY - 2, 'dust', 6); this.landSquash = clamp(descV / 900, 0.25, 1); } // poeira + agachadinha ao pousar
    if (this.landSquash > 0) this.landSquash = Math.max(0, this.landSquash - dt / 0.18);
    // pó contínuo ao correr
    if (this.onGround && this.running && this.moving && !this.save.settings.reduceMotion && Math.random() < dt * 14)
      this.vfx.burst(this.playerX - this.camX - this.facing * 10, this.playerY - 2, 'dust', 1);

    // ---- câmera: seguimento suave com antecipação na direção do movimento ----
    const rm = !!this.save.settings.reduceMotion;
    const lead = rm ? 0 : clamp(this.vx / SPD_RUN, -1, 1) * 110;
    const targetCam = clamp(this.playerX - W / 2 + lead, 0, Math.max(0, this.room.worldW - W));
    this.camX = rm ? targetCam : this.camX + (targetCam - this.camX) * clamp(dt * 6, 0, 1);

    // ---- ruído: correr faz barulho, agachar silencia ----
    const noise = this.stunT > 0 ? 0 : this.crouch ? 0.05 : this.running ? 1 : this.moving ? 0.4 : 0;

    // ---- ataque do jogador (F) ----
    if ((input.pressed('f') || input.pressed('j')) && this.atkCd <= 0 && this.stunT <= 0) {
      this.atkT = 0.22; this.atkCd = 0.42; audio.sfxSelect();
      const hx = this.playerX + this.facing * 30;
      this.vfx.burst(hx - this.camX, this.playerY - 42, 'spark', 6);
      for (const g of this.guards) {
        if (!g.alive) continue;
        if (Math.abs(g.x - hx) < MELEE_RANGE && Math.abs(g.y - this.playerY) < 52) {
          const ko = g.hit(this.facing);
          this.vfx.burst(g.x - this.camX, g.y - 40, 'impact', 10); this.vfx.shake(0.5, 0.25); audio.sfxStamp();
          if (ko) { this.setToast('✓ Militar neutralizado'); this.addSusp(6); }
        }
      }
    }
    if (this.atkT > 0) this.atkT -= dt;
    if (this.atkCd > 0) this.atkCd -= dt;
    if (this.invulnT > 0) this.invulnT -= dt;
    if (this.hurtFlash > 0) this.hurtFlash -= dt;

    // ---- vigias / detecção / combate ----
    this.updateGuards(dt, audio, noise);

    // ---- projéteis ----
    for (const s of this.shots) {
      s.update(dt);
      if (s.alive && Math.abs(s.x - this.playerX) < 16 && Math.abs(s.y - (this.playerY - 40)) < 34) {
        s.alive = false; this.hurt(1, s.x, audio);
      }
    }
    this.shots = this.shots.filter((s) => s.alive);

    // ---- objetivo dinâmico (fuga durante alerta) ----
    const escapeObj = 'FUJA! Saia da área ou neutralize a ameaça.';
    if (this.anyAlert) {
      if (this.dynObj !== escapeObj) { this.dynObj = escapeObj; this.dynObjT = 3; this.setToast('⚠ NOVO OBJETIVO: Fuja!'); }
      this.calmT = 0;
    } else if (this.dynObj) {
      this.calmT += dt;
      if (this.calmT > 3) { this.dynObj = null; this.save.flags['evaded_' + this.room.id] = true; this.setToast('✓ Ameaça dispersada'); }
    }
    if (this.dynObjT > 0) this.dynObjT -= dt;
    this.syncMission(audio);

    // ---- interação (exige estar próximo e na mesma altura) ----
    const near = this.nearProp();
    const interact = input.pressed('e') || input.touchInteractJust ||
      (input.pointer.justDown && input.pointer.y < GROUND_Y + 30 && input.pointer.y > 90 && near != null && Math.abs((near.x - this.camX) - input.pointer.x) < 70);
    if (near && interact) this.interact(near, audio);
  }

  // Atualiza vigias (FSM completa), acumula detecção e aplica dano de contato/tiro.
  private updateGuards(dt: number, audio: AudioSys, noise: number) {
    if (this.spotCd > 0) this.spotCd -= dt;
    let maxSee = 0; this.anyAlert = false;
    for (const g of this.guards) {
      if (!g.alive) continue;
      g.update(dt, this.playerX, this.playerY, this.crouch, noise);
      if (g.see > maxSee) maxSee = g.see;
      if (g.state === 'chase' || g.state === 'alert') this.anyAlert = true;
      if (g.wantMelee) this.hurt(1, g.x, audio);
      if (g.wantShoot) { this.shots.push(new Shot(g.x + g.dir * 24, g.y - 40, g.dir)); audio.sfxThunder(0.4); this.vfx.shake(0.3, 0.2); }
    }
    this.detect = maxSee;
    // primeira vez que entra em alerta: sirene
    if (this.anyAlert && this.spotCd <= 0) { this.spotCd = 3; this.vfx.sirenPulse(1.4); audio.sfxAlert(); this.addSusp(12); }
  }

  // Aplica dano ao jogador (com i-frames), feedback e checa derrota.
  private hurt(dmg: number, fromX: number, audio: AudioSys) {
    if (this.invulnT > 0 || this.mode !== 'explore') return;
    this.hp -= dmg; this.invulnT = 1.1; this.hurtFlash = 0.4;
    const away = this.playerX < fromX ? -1 : 1;
    this.vx = away * 300; this.vy = -220; this.onGround = false; this.stunT = 0.3;
    this.vfx.shake(0.9, 0.4); this.vfx.flash('#7a1414', 0.5, 0.4); audio.sfxThunder(0.5);
    this.setToast('▼ Dano! HP ' + Math.max(0, this.hp) + '/' + this.maxHp);
    if (this.hp <= 0) this.onDefeat(audio);
  }
  private onDefeat(audio: AudioSys) {
    this.save.lives = Math.max(0, this.save.lives - 1); writeSave(this.save);
    audio.sfxAlert(); this.vfx.flash('#000000', 0.6, 0.6);
    this.defeatSel = 0; this.mode = 'defeat';
  }

  // ===== SISTEMA DE MISSÕES =====
  // Define a missão da sala: usa a encenada (r.mission) ou gera uma a partir dos props.
  private loadMission(r: Room) {
    this.mission = r.mission || this.autoMission(r);
    this.mStageN = clamp(this.save.missionStage[this.mission.id] || 0, 0, this.mission.stages.length - 1);
    this.mStage = this.mission.stages[this.mStageN] || null;
  }
  // Gera uma missão de etapa única a partir dos props investigáveis + saída.
  private autoMission(r: Room): Mission {
    const verbs: Record<string, string> = { clue: 'Investigar', puzzle: 'Resolver', choice: 'Decidir', talk: 'Falar com', look: 'Examinar', reward: 'Recolher', exit: 'Seguir para', door: 'Abrir', drawer: 'Vasculhar', radio: 'Sintonizar', window: 'Escapar por' };
    const subs: SubObjective[] = [];
    for (const p of r.props) {
      if (p.hidden) continue;
      const track = ['clue', 'puzzle', 'choice', 'reward', 'drawer', 'radio'].includes(p.kind) || (p.kind === 'talk' && (!!p.clue || !!p.setFlag)) || (p.kind === 'door' && !p.to);
      if (!track) continue;
      let on: ObjTrigger = { t: 'prop', v: p.id };
      if (p.kind === 'puzzle' && p.puzzle) on = { t: 'solve', v: p.puzzle.id };
      else if (p.kind === 'choice' && p.choice) on = { t: 'choice', v: p.choice.id };
      subs.push({ id: p.id, label: (verbs[p.kind] || 'Ver') + ': ' + p.label, on });
      if (subs.length >= 4) break;
    }
    const exit = r.props.find((p) => p.kind === 'exit');
    if (exit) subs.push({ id: exit.id, label: (verbs.exit) + ': ' + exit.label, on: { t: 'prop', v: exit.id }, optional: true });
    return { id: 'auto_' + r.id, title: r.title + ' — ' + r.sub, stages: [{ objective: r.objective, subs }] };
  }
  // Avalia se um gatilho de subobjetivo já foi cumprido, lendo o estado salvo.
  private evalTrigger(on: ObjTrigger): boolean {
    switch (on.t) {
      case 'flag': return !!this.save.flags[on.v];
      case 'prop': return !!this.save.flags['used_' + on.v];
      case 'clue': return this.save.clues.includes(on.v);
      case 'solve': return this.save.solved.includes(on.v);
      case 'choice': return !!this.save.flags[on.v + '_done'];
      case 'item': return (this.save.items[on.v] || 0) > 0;
      case 'evade': return !!this.save.flags['evaded_' + this.room.id];
      default: return false;
    }
  }
  // A cada quadro: recalcula subobjetivos, avança de etapa ao concluí-los e conclui a missão.
  private syncMission(audio: AudioSys) {
    if (!this.mission || !this.mStage) return;
    // missão já concluída numa visita anterior: apenas marca tudo como feito
    if (this.save.flags['mission_' + this.mission.id + '_done']) {
      this.steps = this.mStage.subs.map((s) => ({ label: s.label, id: s.id, kind: s.on.t, done: true }));
      return;
    }
    const stg = this.mStage;
    let allReq = true;
    this.steps = stg.subs.map((s) => {
      const done = this.evalTrigger(s.on);
      if (!done && !s.optional) allReq = false;
      return { label: s.label, id: s.id, kind: s.on.t, done };
    });
    if (stg.subs.length && allReq && this.mode === 'explore') this.advanceStage(audio);
  }
  // Conclui a etapa atual: aplica recompensa/flag/fala e revela o próximo objetivo.
  private advanceStage(audio: AudioSys) {
    const m = this.mission!, stg = this.mStage!;
    if (stg.setFlag) this.save.flags[stg.setFlag] = true;
    if (stg.reward) this.applyReward(stg.reward, audio);
    this.mStageN++;
    this.save.missionStage[m.id] = this.mStageN;
    const next = m.stages[this.mStageN] || null;
    this.mStage = next;
    const reveal = () => {
      if (next) { this.setToast('✓ OBJETIVO CONCLUÍDO'); this.dynObj = null; this.dynObjT = 3; }
      else { this.setToast('★ MISSÃO CUMPRIDA'); this.save.flags['mission_' + m.id + '_done'] = true; }
      writeSave(this.save);
    };
    if (stg.say && stg.say.length) this.startQueue(stg.say, reveal); else reveal();
    // após concluir, recomputa steps para a nova etapa imediatamente
    if (next) this.steps = next.subs.map((s) => ({ label: s.label, id: s.id, kind: s.on.t, done: this.evalTrigger(s.on) }));
    else this.steps = [];
  }
  // Objetivo atual em texto (etapa da missão ou objetivo base da sala).
  private currentObjective(): string { return (this.mStage && this.mStage.objective) || this.room.objective; }

  // Constrói a lista inicial de subobjetivos a partir da missão da sala.
  private buildSteps(_r: Room) {
    if (this.mStage) this.steps = this.mStage.subs.map((s) => ({ label: s.label, id: s.id, kind: s.on.t, done: this.evalTrigger(s.on) }));
    else this.steps = [];
  }

  private defeatRect(i: number, W: number, H: number) { const w = 340, h = 54, gap = 16, y0 = H / 2 + 20; return { x: W / 2 - w / 2, y: y0 + i * (h + gap), w, h }; }
  private updateDefeat(input: Input, audio: AudioSys, W: number, H: number) {
    if (input.pressed('arrowup') || input.pressed('arrowdown') || input.pressed('w') || input.pressed('s')) this.defeatSel = (this.defeatSel + 1) % 2;
    for (let i = 0; i < 2; i++) { const r = this.defeatRect(i, W, H); if (input.hover(r.x, r.y, r.w, r.h)) this.defeatSel = i; if (input.hit(r.x, r.y, r.w, r.h, 'df' + i)) { this.defeatSel = i; this.confirmDefeat(audio); return; } }
    if (input.pressed('enter') || input.pressed(' ')) this.confirmDefeat(audio);
  }
  private confirmDefeat(audio: AudioSys) {
    if (this.defeatSel === 0) { this.save.suspicion = clamp(this.save.suspicion - 20, 0, 100); this.mode = 'explore'; this.loadRoom(audio, false); }
    else { writeSave(this.save); this.onExit(); }
  }

  private nearProp(): PropState | null {
    let best: PropState | null = null; let bd = 70;
    for (const p of this.visibleProps()) {
      if (p.used && this.isConsumable(p)) continue;
      const py = p.py ?? GROUND_Y;
      if (Math.abs(this.playerY - py) > 40) continue;   // precisa estar na mesma altura
      const d = Math.abs(p.x - this.playerX);
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }
  private isConsumable(p: Prop) { return p.kind === 'clue' || p.kind === 'reward' || p.kind === 'puzzle' || p.kind === 'choice' || p.kind === 'drawer'; }

  private markUsed(p: PropState) { this.save.flags['used_' + p.id] = true; if (this.isConsumable(p)) p.used = true; }

  private interact(p: PropState, audio: AudioSys) {
    if (p.requires && !this.save.flags[p.requires]) { this.startQueue(p.lockedSay || [{ who: 'narrator', text: 'Ainda não é hora disso.' }], null); return; }
    if (p.needCalm && this.save.suspicion >= 70) { this.startQueue([{ who: 'narrator', text: 'Há olhos demais por perto. Melhor esperar a poeira baixar (reduza a suspeita).' }], null); audio.sfxAlert(); return; }
    if (p.suspicion) this.addSusp(p.suspicion);
    switch (p.kind) {
      case 'exit': {
        if (p.gate && !this.save.flags[p.gate]) { this.startQueue(p.lockedSay || [{ who: 'narrator', text: 'Ainda há algo a resolver aqui antes de seguir.' }], null); return; }
        audio.sfxDoor();
        const target = p.to ?? -1;
        const go = () => {
          if (target === -1) { this.pendingEnding = true; this.finishEnding(); }
          else { this.save.room = target; writeSave(this.save); this.loadRoom(audio, true); }
        };
        if (p.say && p.say.length) this.startQueue(p.say, go); else go();
        return;
      }
      case 'talk': audio.sfxTalk(); this.startQueue(p.say || [], () => { if (p.clue) this.addClue(p.clue); if (p.reward) this.applyReward(p.reward, audio); if (p.setFlag) this.save.flags[p.setFlag] = true; this.markUsed(p); }); return;
      case 'look': audio.sfxLook(); this.startQueue(p.say || [], () => { if (p.clue) this.addClue(p.clue); if (p.reward) this.applyReward(p.reward, audio); if (p.setFlag) this.save.flags[p.setFlag] = true; this.markUsed(p); }); return;
      case 'clue': audio.sfxLook(); this.startQueue(p.say || [{ who: 'narrator', text: 'Isto pode ser importante.' }], () => { if (p.clue) this.addClue(p.clue); if (p.reward) this.applyReward(p.reward, audio); if (p.setFlag) this.save.flags[p.setFlag] = true; this.markUsed(p); }); return;
      case 'reward': audio.sfxPickup(); this.startQueue(p.say || [], () => { if (p.reward) this.applyReward(p.reward, audio); if (p.clue) this.addClue(p.clue); if (p.setFlag) this.save.flags[p.setFlag] = true; this.markUsed(p); }); return;
      case 'puzzle': {
        audio.sfxSelect();
        if (!p.puzzle) return;
        if (this.save.solved.includes(p.puzzle.id)) { this.startQueue([{ who: 'narrator', text: 'Este enigma já foi resolvido.' }], null); return; }
        const hint = autoHint(this.save.difficulty) || !!this.save.flags['hintNext'];
        this.save.flags['hintNext'] = false;
        this.puzzle.start(p.puzzle, puzzleAttempts(this.save.difficulty), hint);
        this.curPuzzleProp = p; this.mode = 'puzzle'; return;
      }
      case 'choice': { audio.sfxSelect(); if (!p.choice) return; this.curChoice = p.choice; this.curChoiceProp = p; this.mode = 'choice'; return; }
      // ===== FASE 4: props de gameplay =====
      case 'door': {
        if (p.needItem && (this.save.items[p.needItem] || 0) <= 0) { this.startQueue(p.lockedSay || [{ who: 'narrator', text: 'A porta está trancada. Falta a chave.' }], null); audio.sfxAlert(); return; }
        if (p.gate && !this.save.flags[p.gate]) { this.startQueue(p.lockedSay || [{ who: 'narrator', text: 'Ainda não é hora de passar por aqui.' }], null); return; }
        const go = () => {
          if (p.needItem && p.consumesItem) { this.save.items[p.needItem] = Math.max(0, (this.save.items[p.needItem] || 0) - 1); this.setToast('🗝 Chave usada'); }
          if (p.setFlag) this.save.flags[p.setFlag] = true;
          if (p.clue) this.addClue(p.clue);
          if (p.reward) this.applyReward(p.reward, audio);
          this.markUsed(p);
          if (typeof p.to === 'number') { if (p.to === -1) { this.finishEnding(); } else { this.save.room = p.to; writeSave(this.save); this.loadRoom(audio, true); } }
          else writeSave(this.save);
        };
        audio.sfxDoor();
        if (p.say && p.say.length) this.startQueue(p.say, go); else go();
        return;
      }
      case 'drawer': {
        if (p.needItem && (this.save.items[p.needItem] || 0) <= 0) { this.startQueue(p.lockedSay || [{ who: 'narrator', text: 'A gaveta está trancada. Preciso de uma chave.' }], null); audio.sfxAlert(); return; }
        audio.sfxDrawer();
        this.startQueue(p.say || [{ who: 'narrator', text: 'Você abre a gaveta com cuidado.' }], () => {
          if (p.needItem && p.consumesItem) { this.save.items[p.needItem] = Math.max(0, (this.save.items[p.needItem] || 0) - 1); this.setToast('🗝 Chave usada'); }
          if (p.clue) this.addClue(p.clue); if (p.reward) this.applyReward(p.reward, audio); if (p.setFlag) this.save.flags[p.setFlag] = true; this.markUsed(p);
        });
        return;
      }
      case 'radio': {
        audio.sfxRadio();
        if (p.puzzle) {
          if (this.save.solved.includes(p.puzzle.id)) { this.startQueue([{ who: 'narrator', text: 'Você já sintonizou esta transmissão.' }], null); return; }
          const hint = autoHint(this.save.difficulty) || !!this.save.flags['hintNext']; this.save.flags['hintNext'] = false;
          this.puzzle.start(p.puzzle, puzzleAttempts(this.save.difficulty), hint);
          this.curPuzzleProp = p; this.mode = 'puzzle'; return;
        }
        this.startQueue(p.say || [], () => { if (p.clue) this.addClue(p.clue); if (p.reward) this.applyReward(p.reward, audio); if (p.setFlag) this.save.flags[p.setFlag] = true; this.markUsed(p); });
        return;
      }
      case 'window': {
        const escaping = this.anyAlert;
        const go = () => {
          if (escaping) { this.save.flags['evaded_' + this.room.id] = true; this.setToast('✓ Você escapou pela janela'); }
          if (p.setFlag) this.save.flags[p.setFlag] = true;
          if (p.reward) this.applyReward(p.reward, audio);
          this.markUsed(p);
          if (typeof p.to === 'number') { if (p.to === -1) { this.finishEnding(); } else { this.save.room = p.to; writeSave(this.save); this.loadRoom(audio, true); } }
          else writeSave(this.save);
        };
        audio.sfxStep();
        if (p.say && p.say.length) this.startQueue(p.say, go); else go();
        return;
      }
    }
  }

  private onPuzzleSolved(audio: AudioSys) {
    const p = this.curPuzzleProp; this.mode = 'explore';
    if (!p || !p.puzzle) return;
    this.save.solved.push(p.puzzle.id);
    this.applyReward({ resources: 8 }, audio);
    const os = p.puzzle.onSolve;
    this.markUsed(p);
    const after = () => {
      if (os) { if (os.clue) this.addClue(os.clue); if (os.reward) this.applyReward(os.reward, audio); if (os.setFlag) this.save.flags[os.setFlag] = true; if (os.archive && !this.save.archive.includes(os.archive)) this.save.archive.push(os.archive); }
      writeSave(this.save);
    };
    this.setToast('✓ Enigma resolvido!');
    this.vfx.burst(480, GROUND_Y - 90, 'spark', 26); this.vfx.flash('#ffe0a0', 0.45, 0.26); audio.sfxSpark();
    if (os && os.say && os.say.length) this.startQueue(os.say, after); else after();
  }

  private updateChoice(input: Input, audio: AudioSys, W: number, H: number) {
    const c = this.curChoice!; const n = c.options.length;
    c.options.forEach((o, i) => {
      const rct = this.choiceRect(i, n, W, H);
      if (input.hit(rct.x, rct.y, rct.w, rct.h, 'ch' + o.key)) {
        this.save.choices[c.id] = o.key; audio.sfxConfirm();
        if (o.suspicion) this.addSusp(o.suspicion);
        if (o.reward) this.applyReward(o.reward, audio);
        if (o.clue) this.addClue(o.clue);
        if (o.setFlag) this.save.flags[o.setFlag] = true;
        this.save.flags[c.id + '_done'] = true;
        if (this.curChoiceProp) this.markUsed(this.curChoiceProp);
        writeSave(this.save);
        this.mode = 'explore';
        this.startQueue([{ who: 'narrator', text: o.result }], null);
      }
    });
  }
  private choiceRect(i: number, n: number, W: number, H: number) {
    const w = Math.min(720, W - 80), h = 62, gap = 12;
    const totalH = n * h + (n - 1) * gap; const startY = H / 2 - totalH / 2 + 30;
    return { x: W / 2 - w / 2, y: startY + i * (h + gap), w, h };
  }

  private finishEnding() { writeSave(this.save); this.mode = 'ended'; this.onEnding(); }

  // ---------- DRAW ----------
  draw(ctx: Ctx, W: number, H: number, t: number, input: Input) {
    const sh = this.vfx.sx, shy = this.vfx.sy;
    ctx.save(); ctx.translate(sh, shy);
    const r = this.room;
    drawScene(ctx, { biome: r.biome, mood: r.mood as any, year: r.year, worldW: r.worldW }, this.camX, W, t);
    this.vfx.drawBack(ctx, W, H);
    // plataformas (o que se vê é o que colide)
    for (const pf of this.platforms) drawPlatform(ctx, pf, this.camX);
    // props
    if (this.mode === 'explore' || this.mode === 'dialogue' || this.mode === 'menu') {
      const near = this.mode === 'explore' ? this.nearProp() : null;
      for (const p of this.visibleProps()) {
        if (p.used && this.isConsumable(p)) continue;
        this.drawProp(ctx, p, t, p === near);
      }
    }
    // vigias
    if (this.mode === 'explore' || this.mode === 'dialogue') for (const g of this.guards) g.draw(ctx, this.camX);
    for (const s of this.shots) s.draw(ctx, this.camX);
    // player
    if (this.mode !== 'ended') {
      const px = this.playerX - this.camX;
      const pose = this.mode === 'dialogue' ? 'talk' : (this.moving ? 'walk' : 'idle');
      const pal = CHARACTERS[this.save.character!].palette;
      const baseScale = this.crouch ? 2.9 : 3.6;   // agachar reduz a silhueta
      // squash & stretch: estica no ar, achata ao pousar (juice)
      let sqx = 1, sqy = 1;
      if (!this.save.settings.reduceMotion) {
        if (this.landSquash > 0) { sqx = 1 + 0.22 * this.landSquash; sqy = 1 - 0.26 * this.landSquash; }
        else if (!this.onGround) { const st = clamp(-this.vy / 1500, -0.12, 0.18); sqy = 1 + st; sqx = 1 - st * 0.6; }
      }
      const blink = this.invulnT > 0 && Math.floor(this.invulnT * 12) % 2 === 0; // pisca com i-frames
      if (!blink) drawChar(ctx, pal, px, this.playerY, baseScale * sqx, pose, this.frame, this.facing, baseScale * sqy);
      // arco de ataque (F)
      if (this.atkT > 0) {
        const a = this.atkT / 0.22; const hx = px + this.facing * 20;
        ctx.strokeStyle = 'rgba(255,240,180,' + a + ')'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(hx, this.playerY - 40, 30, this.facing > 0 ? -0.9 : 2.2, this.facing > 0 ? 0.9 : 4.0); ctx.stroke();
      }
    }
    ctx.restore();

    // suspicion vignette
    if (this.save.suspicion >= 70) {
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(120,20,20,0.35)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // camada de efeitos frontais (chuva, poeira, brasas, papel, eventos)
    this.vfx.drawFront(ctx, W, H);
    // flash vermelho ao levar dano
    if (this.hurtFlash > 0) { ctx.fillStyle = 'rgba(150,20,20,' + (0.4 * (this.hurtFlash / 0.4)) + ')'; ctx.fillRect(0, 0, W, H); }

    if (this.mode === 'explore' || this.mode === 'dialogue' || this.mode === 'menu') {
      drawTopHUD(ctx, W, this.save, this.dynObj || this.currentObjective(), r.title + ' — ' + r.sub + ' (' + r.year + ')', input.hover(W - 120, 10, 104, 32));
      this.drawHP(ctx, W);
      if (this.mode === 'explore') this.drawSteps(ctx);
    }
    // interaction hint
    if (this.mode === 'explore') {
      const near = this.nearProp();
      if (near) {
        const px = near.x - this.camX; const py = near.py ?? GROUND_Y;
        panel(ctx, px - 90, py - 150, 180, 30, 'rgba(10,12,18,0.9)', '#d9a441', 6, 1);
        text(ctx, '[E] ' + near.label, px, py - 130, 13, '#f4e6b8', 'center', '700');
      } else {
        text(ctx, 'A/D mover · SHIFT correr · ESPAÇO pular · CTRL agachar · F golpear · E interagir · ESC menu', W / 2, H - 16, 11, 'rgba(232,228,216,0.42)', 'center', '500');
      }
      // medidor de detecção (quando há vigias)
      if (this.guards.length && this.detect > 0.02) {
        const bw = 150, bx = W / 2 - bw / 2, by = 150;
        const col = this.detect >= 1 ? '#ff5a4a' : this.detect > 0.5 ? '#e8a53a' : '#e8d24a';
        panel(ctx, bx - 4, by - 4, bw + 8, 20, 'rgba(10,12,18,0.85)', col, 5, 1);
        rect(ctx, bx, by, bw * clamp(this.detect, 0, 1), 12, col);
        text(ctx, this.detect >= 1 ? 'DETECTADO' : this.crouch ? 'oculto' : 'sendo visto', W / 2, by - 8, 11, col, 'center', '800');
      }
      // dica de tutorial ao entrar na sala
      if (this.tipT > 0 && this.tip) {
        const a = Math.min(1, this.tipT);
        panel(ctx, W / 2 - 230, H - 92, 460, 32, 'rgba(16,19,27,' + (0.9 * a) + ')', 'rgba(217,164,65,' + a + ')', 6, 1);
        text(ctx, 'ℹ ' + this.tip, W / 2, H - 71, 12, 'rgba(244,230,184,' + a + ')', 'center', '600');
      }
    }

    if (this.mode === 'dialogue') this.dlg.draw(ctx, W, H, t);
    if (this.mode === 'choice') this.drawChoice(ctx, W, H);
    if (this.mode === 'puzzle') this.puzzle.draw(ctx, W, H, t);
    if (this.mode === 'menu') this.menu.draw(ctx, W, H, this.save, input);
    if (this.mode === 'cine') this.drawCine(ctx, W, H, t);
    if (this.mode === 'defeat') this.drawDefeat(ctx, W, H, input);
    if (this.toastT > 0 && this.mode !== 'menu') {
      const a = Math.min(1, this.toastT);
      panel(ctx, W / 2 - 200, 100, 400, 34, 'rgba(217,164,65,' + (0.92 * a) + ')', '#fff', 6, 1);
      text(ctx, this.toast, W / 2, 122, 14, 'rgba(26,18,6,' + a + ')', 'center', '800');
    }
  }

  private drawHP(ctx: Ctx, W: number) {
    // barra de HP (distinta das vidas/checkpoints do HUD superior)
    const bw = 132, bx = W - bw - 16, by = 46;
    panel(ctx, bx - 4, by - 4, bw + 8, 18, 'rgba(10,12,18,0.85)', '#7a2222', 5, 1);
    const frac = clamp(this.hp / this.maxHp, 0, 1);
    const col = frac > 0.6 ? '#4caf50' : frac > 0.3 ? '#e8a53a' : '#e04a3a';
    rect(ctx, bx, by, bw * frac, 10, col);
    text(ctx, 'HP ' + Math.max(0, this.hp) + '/' + this.maxHp, bx + bw / 2, by + 9, 10, '#f4e6b8', 'center', '800');
  }
  private drawSteps(ctx: Ctx) {
    if (!this.steps.length) return;
    const x = 14, y0 = 78; const w = 232;
    const h = 20 + this.steps.length * 18;
    panel(ctx, x, y0, w, h, 'rgba(12,15,22,0.82)', 'rgba(217,164,65,0.55)', 7, 1);
    text(ctx, 'OBJETIVOS', x + 12, y0 + 16, 11, '#d9a441', 'left', '800');
    this.steps.forEach((s, i) => {
      const yy = y0 + 34 + i * 18;
      const mark = s.done ? '✓' : '□';
      const col = s.done ? 'rgba(140,200,150,0.9)' : '#e8e4d8';
      text(ctx, mark, x + 12, yy, 12, s.done ? '#7fd08a' : '#d9a441', 'left', '800');
      text(ctx, s.label, x + 28, yy, 11, col, 'left', s.done ? '500' : '600');
      if (s.done) { ctx.strokeStyle = 'rgba(160,170,160,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 28, yy - 4); ctx.lineTo(x + w - 12, yy - 4); ctx.stroke(); }
    });
  }
  private drawDefeat(ctx: Ctx, W: number, H: number, input: Input) {
    rect(ctx, 0, 0, W, H, 'rgba(4,4,6,0.86)');
    text(ctx, 'VOCÊ FOI DERROTADO', W / 2, H / 2 - 40, 30, '#e04a3a', 'center', '900');
    text(ctx, 'A luta continua. Levante-se e recomece do ponto seguro.', W / 2, H / 2 - 6, 13, 'rgba(232,228,216,0.7)', 'center', '500');
    const opts = ['▶ Continuar do checkpoint', 'Voltar ao menu'];
    for (let i = 0; i < 2; i++) {
      const r = this.defeatRect(i, W, H); const sel = this.defeatSel === i || input.hover(r.x, r.y, r.w, r.h);
      panel(ctx, r.x, r.y, r.w, r.h, sel ? 'rgba(60,44,20,0.98)' : 'rgba(24,28,36,0.96)', sel ? '#f4c451' : '#8a7a4a', 8, sel ? 2 : 1.5);
      text(ctx, opts[i], W / 2, r.y + 34, 15, sel ? '#ffe6a0' : '#e8e4d8', 'center', '700');
    }
    text(ctx, 'RECONSTITUIÇÃO EDUCATIVA · setas/clique para escolher · ENTER confirma', W / 2, H - 24, 11, 'rgba(232,228,216,0.4)', 'center', '500');
  }

  private drawProp(ctx: Ctx, p: PropState, t: number, near: boolean) {
    const x = p.x - this.camX; const y = p.py ?? GROUND_Y;
    const glyph = p.glyph || (p.kind === 'exit' ? '→' : p.kind === 'puzzle' ? '⌗' : p.kind === 'choice' ? '⚑' : p.kind === 'talk' ? '☺' : p.kind === 'door' ? '▯' : p.kind === 'drawer' ? '▦' : p.kind === 'radio' ? '♫' : p.kind === 'window' ? '⊞' : '◉');
    // pedestal / object
    const col = p.kind === 'exit' ? '#3a5a7a' : p.kind === 'puzzle' ? '#6a4a7a' : p.kind === 'choice' ? '#7a5a3a' : p.kind === 'talk' ? '#3a6a5a' : p.kind === 'door' ? '#5a4632' : p.kind === 'drawer' ? '#6a5232' : p.kind === 'radio' ? '#3a5a5a' : p.kind === 'window' ? '#3a5570' : '#5a5a3a';
    const locked = (p.kind === 'door' || p.kind === 'drawer') && !!p.needItem && (this.save.items[p.needItem] || 0) <= 0;
    if (p.kind === 'talk') { drawChar(ctx, this.npcPal(p.id), x, y, 3.2, 'idle', t * 0.02 + p.x, -1); }
    else { rr(ctx, x - 16, y - 40, 32, 40, 5); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5; ctx.stroke(); text(ctx, glyph, x, y - 14, 18, '#f4e6b8', 'center', '800'); if (locked) text(ctx, '⚿', x + 11, y - 34, 12, '#e8c14a', 'center', '900'); }
    // floating marker
    const bob = Math.sin(t * 0.004 + p.x) * 3;
    const mc = near ? '#ffe08a' : (p.hidden ? '#7fd0c0' : '#d9a441');
    text(ctx, '▾', x, y - 58 + bob, 16, mc, 'center', '800');
    if (near) { ctx.globalAlpha = 0.5; text(ctx, '▾', x, y - 58 + bob, 24, mc, 'center', '800'); ctx.globalAlpha = 1; }
  }
  private npcPal(id: string) { const c = CHARACTERS[id]; return c ? c.palette : CHARACTERS['antonio'].palette; }

  private drawChoice(ctx: Ctx, W: number, H: number) {
    rect(ctx, 0, 0, W, H, 'rgba(4,5,8,0.72)');
    const c = this.curChoice!;
    panel(ctx, W / 2 - 380, 70, 760, 90, 'rgba(16,19,27,0.98)', '#d9a441', 10, 2);
    text(ctx, 'DECISÃO', W / 2, 100, 14, '#d9a441', 'center', '800');
    let yy = 124; for (const l of wrap(ctx, c.prompt, 17, 700, '600')) { text(ctx, l, W / 2, yy, 17, '#f4e6b8', 'center', '600'); yy += 24; }
    const n = c.options.length;
    c.options.forEach((o, i) => {
      const rct = this.choiceRect(i, n, W, H);
      panel(ctx, rct.x, rct.y, rct.w, rct.h, 'rgba(30,36,46,0.96)', '#8a7a4a', 8, 1.5);
      text(ctx, o.label, rct.x + 18, rct.y + 26, 15, '#e8e4d8', 'left', '700');
      if (o.hint) text(ctx, o.hint, rct.x + 18, rct.y + 47, 12, '#9fb0bc', 'left', '500');
    });
  }

  private drawCine(ctx: Ctx, W: number, H: number, t: number) {
    rect(ctx, 0, 0, W, H, '#05060a');
    // slow corridor light
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(40,30,20,0.4)'); g.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    rect(ctx, W / 2 - 2, 0, 4, H, 'rgba(217,164,65,' + (0.1 + 0.05 * Math.sin(t * 0.002)) + ')');
    const idx = Math.min(this.cineLines.length - 1, Math.floor(this.cineT / 2.2));
    let yy = H / 2 - 20;
    for (const l of wrap(ctx, this.cineLines[idx] || '', 18, W - 160, '500')) { text(ctx, l, W / 2, yy, 18, '#d8d2c2', 'center', '500'); yy += 26; }
    text(ctx, 'RECONSTITUIÇÃO EDUCATIVA · sem violência explícita', W / 2, H - 40, 11, 'rgba(232,228,216,0.4)', 'center', '500');
    text(ctx, 'ESPAÇO para continuar', W / 2, H - 20, 12, 'rgba(217,164,65,0.6)', 'center', '600');
  }
}
