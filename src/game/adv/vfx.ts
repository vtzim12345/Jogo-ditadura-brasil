// Sistema de efeitos visuais para clima e eventos.
// Partículas procedurais (chuva, névoa, poeira, fumaça, brasas, papel/folhas,
// faíscas) + eventos de tela (flash, tremor/shake, relâmpago, pulso de sirene).
// Sem assets externos; tudo desenhado no Canvas 2D. Respeita 'reduceMotion'.
import { Ctx } from '../../core/gfx';
import { AudioSys } from '../../core/audio';
import { GROUND_Y, V_H } from '../scenery';

const H = V_H; // altura virtual (540)

type P = {
  on: boolean; x: number; y: number; vx: number; vy: number;
  life: number; max: number; size: number; rot: number; vr: number; seed: number;
};

function mkP(): P {
  return { on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1, rot: 0, vr: 0, seed: 0 };
}

// Pool de partículas de tamanho fixo com reaproveitamento.
class Pool {
  ps: P[];
  constructor(cap: number) { this.ps = Array.from({ length: cap }, mkP); }
  spawn(): P | null {
    for (const p of this.ps) if (!p.on) { p.on = true; return p; }
    return null; // pool cheio: descarta (mantém o custo limitado)
  }
  update(fn: (p: P) => void) { for (const p of this.ps) if (p.on) fn(p); }
  clear() { for (const p of this.ps) p.on = false; }
}

// Taxas-alvo de emissão por tipo (partículas por segundo).
interface Rates { rain: number; mist: number; dust: number; smoke: number; ember: number; paper: number; }
const ZERO: Rates = { rain: 0, mist: 0, dust: 0, smoke: 0, ember: 0, paper: 0 };

export class VfxSystem {
  private clock = 0;
  private reduce = false;

  // pools
  private rain = new Pool(300);
  private mist = new Pool(12);
  private dust = new Pool(120);
  private smoke = new Pool(48);
  private ember = new Pool(80);
  private paper = new Pool(60);
  private spark = new Pool(140);

  // taxas atuais x alvo (com rampa suave nas transições de sala)
  private cur: Rates = { ...ZERO };
  private tgt: Rates = { ...ZERO };
  private acc: Rates = { ...ZERO }; // acumuladores de spawn

  private mood = 'calm';
  private biome = 'street';
  private windX = 0;

  // eventos de tela
  private flashCol = '#000'; private flashA = 0; private flashDecay = 3;
  private shakePow = 0; private shakeT = 0; private shakeDur = 1;
  private sirenT = 0; private sirenDur = 0;
  // relâmpago
  private stormOn = false; private lightTimer = 4; private lightA = 0; private lightFlick = 0;
  private pendThunder = -1; private thunderInt = 1;

  // deslocamento do tremor (lido pelo engine ao aplicar translate)
  sx = 0; sy = 0;

  setReduceMotion(on: boolean) { this.reduce = on; }

  // Define clima ambiente conforme bioma + humor da sala.
  setForRoom(biome: string, mood: string) {
    this.biome = biome; this.mood = mood;
    const r: Rates = { ...ZERO };
    // base pelo humor
    if (mood === 'heavy') { r.rain = 150; r.mist = 3; this.stormOn = true; this.windX = -34; }
    else if (mood === 'tense') { r.rain = 60; r.mist = 2; this.stormOn = false; this.windX = -22; }
    else if (mood === 'hope') { r.dust = 26; this.stormOn = false; this.windX = 8; }
    else { r.dust = 14; this.stormOn = false; this.windX = 6; }
    // ajustes por bioma
    switch (biome) {
      case 'factory': r.smoke = 10; r.ember = 22; r.dust = Math.max(r.dust, 18); break;
      case 'prison': r.mist = Math.max(r.mist, 2.2); r.dust = Math.max(r.dust, 10); r.rain = 0; this.stormOn = false; break;
      case 'theater': r.dust = Math.max(r.dust, 30); r.rain = 0; this.stormOn = false; break;
      case 'protest': r.paper = 6; break;
      case 'newsroom': case 'radio': r.dust = Math.max(r.dust, 16); r.rain = 0; this.stormOn = false; break;
      case 'home': case 'school': if (mood !== 'heavy' && mood !== 'tense') r.rain = 0; r.dust = Math.max(r.dust, 12); break;
    }
    this.tgt = r;
    if (this.stormOn) this.lightTimer = 2 + Math.random() * 5;
    // pequena transição de entrada
    this.flash('#05060a', 0.55, 0.5);
  }

  // ---------- EVENTOS ----------
  flash(color: string, dur = 0.4, peak = 0.4) {
    if (this.reduce) peak *= 0.35;
    this.flashCol = color; this.flashA = peak; this.flashDecay = peak / Math.max(0.08, dur);
  }
  shake(power = 1, dur = 0.5) {
    if (this.reduce) return; // respeita redução de movimento
    this.shakePow = Math.max(this.shakePow, power); this.shakeDur = dur; this.shakeT = dur;
  }
  sirenPulse(dur = 1.6) { this.sirenDur = dur; this.sirenT = dur; }
  lightningStrike(intensity = 1) {
    this.lightA = this.reduce ? 0.15 : 0.9; this.lightFlick = 2;
    this.thunderInt = intensity; this.pendThunder = 0.15 + Math.random() * 0.5;
  }

  // Explosão de partículas num ponto (coord. de tela). kind: spark|paper|dust|impact
  burst(x: number, y: number, kind: 'spark' | 'paper' | 'dust' | 'impact', count = 18) {
    const n = this.reduce ? Math.ceil(count * 0.4) : count;
    for (let i = 0; i < n; i++) {
      if (kind === 'paper') {
        const p = this.paper.spawn(); if (!p) break;
        const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 140;
        p.x = x; p.y = y; p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp - 60;
        p.life = 0; p.max = 2.2 + Math.random() * 1.8; p.size = 4 + Math.random() * 6;
        p.rot = Math.random() * 6.28; p.vr = (Math.random() - 0.5) * 8; p.seed = Math.random();
      } else {
        const p = this.spark.spawn(); if (!p) break;
        const a = kind === 'impact' ? (-Math.PI / 2 + (Math.random() - 0.5) * 2.2) : Math.random() * Math.PI * 2;
        const sp = (kind === 'spark' ? 120 : 90) + Math.random() * 180;
        p.x = x; p.y = y; p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
        p.life = 0; p.max = 0.5 + Math.random() * 0.6; p.size = 1.5 + Math.random() * 2.5;
        p.rot = kind === 'dust' ? 1 : (kind === 'impact' ? 2 : 0); p.seed = Math.random();
      }
    }
  }

  // ---------- UPDATE ----------
  update(dt: number, W: number, _H: number, audio?: AudioSys) {
    this.clock += dt;
    const rmul = this.reduce ? 0.3 : 1;

    // rampa das taxas atuais rumo ao alvo
    for (const k of ['rain', 'mist', 'dust', 'smoke', 'ember', 'paper'] as (keyof Rates)[]) {
      this.cur[k] += (this.tgt[k] - this.cur[k]) * Math.min(1, dt * 2.5);
    }

    // spawns ambiente
    this.emit('rain', this.cur.rain * rmul, dt, () => this.spawnRain(W));
    this.emit('mist', this.cur.mist * rmul, dt, () => this.spawnMist(W));
    this.emit('dust', this.cur.dust * rmul, dt, () => this.spawnDust(W));
    this.emit('smoke', this.cur.smoke * rmul, dt, () => this.spawnSmoke(W));
    this.emit('ember', this.cur.ember * rmul, dt, () => this.spawnEmber(W));
    this.emit('paper', this.cur.paper * rmul, dt, () => this.spawnPaper(W));

    // integração das partículas
    this.rain.update((p) => { p.x += p.vx * dt; p.y += p.vy * dt; if (p.y > H) p.on = false; });
    this.mist.update((p) => { p.x += p.vx * dt; p.life += dt; if (p.life > p.max) p.on = false; });
    this.dust.update((p) => { p.life += dt; p.x += p.vx * dt + Math.sin(this.clock * 0.7 + p.seed * 6) * 4 * dt; p.y += p.vy * dt; if (p.life > p.max) p.on = false; });
    this.smoke.update((p) => { p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.size += 14 * dt; if (p.life > p.max) p.on = false; });
    this.ember.update((p) => { p.life += dt; p.x += (p.vx + Math.sin(this.clock * 3 + p.seed * 6) * 12) * dt; p.y += p.vy * dt; if (p.life > p.max) p.on = false; });
    this.paper.update((p) => { p.life += dt; p.vy += 40 * dt; p.x += (p.vx + Math.sin(this.clock * 2 + p.seed * 6) * 24) * dt; p.y += p.vy * dt; p.rot += p.vr * dt; if (p.life > p.max || p.y > H + 20) p.on = false; });
    this.spark.update((p) => { p.life += dt; if (p.rot !== 1) p.vy += 320 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= (1 - dt * 1.5); if (p.life > p.max) p.on = false; });

    // flash decai
    if (this.flashA > 0) { this.flashA = Math.max(0, this.flashA - this.flashDecay * dt); }

    // tremor
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const k = Math.max(0, this.shakeT / this.shakeDur) * this.shakePow;
      this.sx = (Math.random() - 0.5) * 16 * k;
      this.sy = (Math.random() - 0.5) * 10 * k;
      if (this.shakeT <= 0) { this.shakePow = 0; this.sx = 0; this.sy = 0; }
    } else { this.sx = 0; this.sy = 0; }

    // sirene
    if (this.sirenT > 0) this.sirenT -= dt;

    // relâmpago (tempestade)
    if (this.stormOn && !this.reduce) {
      this.lightTimer -= dt;
      if (this.lightTimer <= 0) { this.lightningStrike(0.8 + Math.random() * 0.5); this.lightTimer = 6 + Math.random() * 9; }
    }
    if (this.lightA > 0) {
      this.lightA = Math.max(0, this.lightA - dt * 3.5);
      if (this.lightA < 0.3 && this.lightFlick > 0) { this.lightA = 0.7; this.lightFlick--; }
    }
    if (this.pendThunder >= 0) { this.pendThunder -= dt; if (this.pendThunder < 0) { audio?.sfxThunder(this.thunderInt); } }
  }

  private emit(k: keyof Rates, rate: number, dt: number, spawn: () => void) {
    if (rate <= 0) return;
    this.acc[k] += rate * dt;
    let guard = 0;
    while (this.acc[k] >= 1 && guard++ < 40) { this.acc[k] -= 1; spawn(); }
  }

  private spawnRain(W: number) {
    const p = this.rain.spawn(); if (!p) return;
    p.x = Math.random() * (W + 60) - 30; p.y = -10 - Math.random() * 40;
    const speed = (this.mood === 'heavy' ? 720 : 560) + Math.random() * 180;
    p.vy = speed; p.vx = this.windX * 1.4; p.size = this.mood === 'heavy' ? 16 : 12;
  }
  private spawnMist(W: number) {
    const p = this.mist.spawn(); if (!p) return;
    p.x = Math.random() * W; p.y = GROUND_Y - 60 - Math.random() * 120;
    p.vx = this.windX * 0.5 + (Math.random() - 0.5) * 6; p.life = 0;
    p.max = 7 + Math.random() * 6; p.size = 90 + Math.random() * 120; p.seed = Math.random();
  }
  private spawnDust(W: number) {
    const p = this.dust.spawn(); if (!p) return;
    p.x = Math.random() * W; p.y = 80 + Math.random() * (GROUND_Y - 60);
    p.vx = this.windX * 0.3; p.vy = -4 - Math.random() * 8; p.life = 0;
    p.max = 4 + Math.random() * 4; p.size = 1 + Math.random() * 2; p.seed = Math.random();
  }
  private spawnSmoke(W: number) {
    const p = this.smoke.spawn(); if (!p) return;
    p.x = 40 + Math.random() * (W - 80); p.y = GROUND_Y - 40;
    p.vx = this.windX * 0.4 + (Math.random() - 0.5) * 8; p.vy = -22 - Math.random() * 18;
    p.life = 0; p.max = 3.5 + Math.random() * 2.5; p.size = 14 + Math.random() * 16; p.seed = Math.random();
  }
  private spawnEmber(W: number) {
    const p = this.ember.spawn(); if (!p) return;
    p.x = Math.random() * W; p.y = GROUND_Y - 20 - Math.random() * 40;
    p.vx = this.windX * 0.2; p.vy = -30 - Math.random() * 30; p.life = 0;
    p.max = 1.6 + Math.random() * 1.6; p.size = 1.5 + Math.random() * 2; p.seed = Math.random();
  }
  private spawnPaper(W: number) {
    const p = this.paper.spawn(); if (!p) return;
    p.x = Math.random() * W; p.y = -20; p.vx = this.windX + (Math.random() - 0.5) * 20; p.vy = 30 + Math.random() * 30;
    p.life = 0; p.max = 5 + Math.random() * 3; p.size = 4 + Math.random() * 6; p.rot = Math.random() * 6.28; p.vr = (Math.random() - 0.5) * 5; p.seed = Math.random();
  }

  // ---------- DRAW (camada de fundo: névoa/fumaça atrás do jogador) ----------
  drawBack(ctx: Ctx, W: number, _H: number) {
    // névoa
    this.mist.update((p) => {
      const k = Math.sin((p.life / p.max) * Math.PI); // fade in/out
      const a = 0.10 * k * (this.mood === 'heavy' ? 1.3 : 1);
      if (a <= 0.001) return;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      const c = this.biome === 'prison' ? '150,160,175' : this.mood === 'heavy' ? '120,130,150' : '190,195,205';
      g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
    });
    // fumaça (sobe do chão, atrás)
    this.smoke.update((p) => {
      const a = 0.22 * (1 - p.life / p.max);
      if (a <= 0.001) return;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      g.addColorStop(0, `rgba(60,64,70,${a})`); g.addColorStop(1, 'rgba(60,64,70,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
    });
    void W;
  }

  // ---------- DRAW (camada da frente: chuva, poeira, brasas, papel, eventos) ----------
  drawFront(ctx: Ctx, W: number, H2: number) {
    // poeira/partículas de luz
    this.dust.update((p) => {
      const a = 0.5 * Math.sin((p.life / p.max) * Math.PI);
      if (a <= 0.001) return;
      const c = this.mood === 'hope' || this.biome === 'theater' ? '255,224,150' : '210,214,220';
      ctx.fillStyle = `rgba(${c},${a})`;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    // brasas
    this.ember.update((p) => {
      const a = 0.8 * (1 - p.life / p.max);
      if (a <= 0.001) return;
      ctx.fillStyle = `rgba(255,${140 + Math.floor(80 * Math.random())},60,${a})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
    });
    // chuva (uma única passada de traços)
    if (this.cur.rain > 1) {
      ctx.strokeStyle = this.mood === 'heavy' ? 'rgba(175,195,225,0.42)' : 'rgba(170,190,220,0.32)';
      ctx.lineWidth = this.mood === 'heavy' ? 1.6 : 1.2; ctx.beginPath();
      const dx = this.windX * 0.02;
      this.rain.update((p) => { ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + dx * p.size, p.y + p.size); });
      ctx.stroke();
    }
    // papel / folhas
    this.paper.update((p) => {
      const a = Math.min(1, (p.max - p.life) * 0.8);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = `rgba(210,200,170,${0.85 * a})`;
      ctx.fillRect(-p.size / 2, -p.size * 0.7, p.size, p.size * 1.4);
      ctx.fillStyle = `rgba(120,110,90,${0.5 * a})`;
      ctx.fillRect(-p.size / 2, -1, p.size, 1);
      ctx.restore();
    });
    // faíscas / impacto
    this.spark.update((p) => {
      const a = 1 - p.life / p.max;
      if (a <= 0.001) return;
      const col = p.rot === 1 ? `rgba(200,205,215,${a * 0.7})` : p.rot === 2 ? `rgba(230,120,90,${a})` : `rgba(255,225,150,${a})`;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
    });

    // ---- eventos de tela ----
    // relâmpago (clarão branco-azulado)
    if (this.lightA > 0.001) { ctx.fillStyle = `rgba(210,225,255,${this.lightA * 0.6})`; ctx.fillRect(0, 0, W, H2); }
    // flash colorido
    if (this.flashA > 0.001) { ctx.fillStyle = this.rgba(this.flashCol, this.flashA); ctx.fillRect(0, 0, W, H2); }
    // pulso de sirene (vinheta vermelha pulsante)
    if (this.sirenT > 0) {
      const k = (this.sirenT / this.sirenDur) * (0.5 + 0.5 * Math.sin(this.clock * 14));
      const g = ctx.createRadialGradient(W / 2, H2 / 2, H2 * 0.3, W / 2, H2 / 2, H2 * 0.9);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(150,20,20,${0.4 * Math.max(0, k)})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H2);
    }
  }

  private rgba(hex: string, a: number): string {
    let s = hex.replace('#', '');
    if (s.length === 3) s = s.split('').map((c) => c + c).join('');
    const n = parseInt(s, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  reset() { this.rain.clear(); this.mist.clear(); this.dust.clear(); this.smoke.clear(); this.ember.clear(); this.paper.clear(); this.spark.clear(); this.flashA = 0; this.shakeT = 0; this.sx = 0; this.sy = 0; this.sirenT = 0; this.lightA = 0; }
}
