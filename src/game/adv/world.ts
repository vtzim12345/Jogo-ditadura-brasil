import { Ctx, rect, rr, shade, text } from '../../core/gfx';
import { Platform, Patrol, Room } from './types';
import { GROUND_Y } from '../scenery';

// PRNG determinístico a partir de string (mesma sala => mesmo layout).
function seed(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function platKindFor(biome: string): Platform['kind'] {
  switch (biome) {
    case 'factory': return 'scaffold';
    case 'street': case 'protest': case 'plaza': return 'roof';
    case 'newsroom': case 'office': case 'printshop': return 'desk';
    case 'gov': case 'barracks': case 'police': return 'ledge';
    case 'library': case 'archive': return 'ledge';
    default: return 'crate';
  }
}

// Gera plataformas (rotas verticais) coerentes com o bioma, quando a sala não define as próprias.
export function genPlatforms(room: Room): Platform[] {
  if (room.platforms) return room.platforms;
  if (room.flat) return [];
  const rnd = seed('plat_' + room.id);
  const out: Platform[] = [];
  const W = room.worldW;
  const kind = platKindFor(room.biome);
  const tiers = [GROUND_Y - 104, GROUND_Y - 178];
  const n = 3 + Math.floor(rnd() * 3); // 3..5
  for (let i = 0; i < n; i++) {
    const seg = (W - 520) / n;
    const x = 300 + i * seg + rnd() * (seg * 0.4);
    const y = tiers[i % 2] - (rnd() < 0.3 ? 40 : 0);
    const w = 92 + Math.floor(rnd() * 70);
    out.push({ x, y, w, kind });
  }
  // Rota vertical GARANTIDA: escada de degraus alcanáveis (térreo -> alto),
  // para que sempre exista um caminho de subida coerente (nível vertical).
  const sx = Math.round(W * 0.42);
  out.push({ x: sx, y: GROUND_Y - 92, w: 108, kind });
  out.push({ x: sx + 128, y: GROUND_Y - 164, w: 108, kind });
  out.push({ x: sx + 256, y: GROUND_Y - 232, w: 120, kind: 'ledge' });
  return out;
}

// Gera patrulhas (vigias) em ambientes públicos/tensos, quando a sala não define.
export function genPatrols(room: Room): Patrol[] {
  if (room.patrols) return room.patrols;
  const publicBiome = ['street', 'protest', 'gov', 'barracks', 'police'].includes(room.biome);
  const tense = room.mood === 'tense' || room.mood === 'heavy';
  if (!publicBiome || !tense) return [];
  const rnd = seed('pat_' + room.id);
  const kind: Patrol['kind'] = room.biome === 'barracks' || room.biome === 'gov' ? 'soldier' : room.biome === 'police' ? 'cop' : 'agent';
  const out: Patrol[] = [];
  const count = 1 + Math.floor(rnd() * 2); // 1..2
  for (let i = 0; i < count; i++) {
    const cx = 520 + i * 520 + rnd() * 160;
    const span = 150 + rnd() * 130;
    out.push({ x0: cx - span, x1: cx + span, y: GROUND_Y, speed: 40 + rnd() * 30, kind });
  }
  return out;
}

export const VISION = 250;    // alcance do cone de visão
export const VISION_H = 74;   // tolerância vertical
export const HEAR = 210;      // alcance auditivo (ruído)
export const MELEE_RANGE = 40;
export const SHOOT_MIN = 100, SHOOT_MAX = 360;

export type GuardState = 'patrol' | 'suspicious' | 'alert' | 'chase' | 'search' | 'return';

// Projetil disparado por soldados (sem sangue — apenas faísca/traçador).
export class Shot {
  x: number; y: number; vx: number; alive = true; life = 1.2;
  constructor(x: number, y: number, dir: number) { this.x = x; this.y = y; this.vx = dir * 620; }
  update(dt: number) { this.x += this.vx * dt; this.life -= dt; if (this.life <= 0) this.alive = false; }
  draw(ctx: Ctx, camX: number) {
    const gx = this.x - camX;
    rect(ctx, gx - 8 * Math.sign(this.vx), this.y - 1, 12, 3, '#ffd27a');
    rect(ctx, gx - 2, this.y - 1, 4, 3, '#fff2c8');
  }
}

// Vigia com máquina de estados completa: patrulha → suspeita → alerta → perseguição → ataque → busca → retorno.
export class Guard {
  x: number; dir = 1; kind: Patrol['kind'];
  x0: number; x1: number; homeX: number; speed: number; chaseSpeed: number; y: number;
  see = 0; state: GuardState = 'patrol';
  pauseT = 0; frame = 0; alertT = 0; searchT = 0; atkCd = 0;
  lastX = 0; hp = 2; alive = true; stun = 0; hitFlash = 0;
  wantMelee = false; wantShoot = false; muzzle = 0;
  constructor(p: Patrol) {
    this.x = (p.x0 + p.x1) / 2; this.x0 = p.x0; this.x1 = p.x1; this.homeX = this.x;
    this.speed = p.speed ?? 50; this.chaseSpeed = this.speed * 2.4 + 60;
    this.y = p.y ?? GROUND_Y; this.kind = p.kind || 'agent';
    this.dir = Math.random() < 0.5 ? -1 : 1; this.lastX = this.x;
  }
  private moveToward(tx: number, spd: number, dt: number) {
    const d = tx - this.x;
    if (Math.abs(d) < 4) return;
    this.dir = d < 0 ? -1 : 1;
    this.x += this.dir * spd * dt;
  }
  // px,py = jogador; hidden = agachado/coberto; noise = 0..1 (correr faz barulho).
  update(dt: number, px: number, py: number, hidden: boolean, noise: number) {
    this.wantMelee = false; this.wantShoot = false;
    this.frame += dt * 60;
    if (this.muzzle > 0) this.muzzle -= dt;
    if (this.hitFlash > 0) this.hitFlash -= dt;
    if (this.atkCd > 0) this.atkCd -= dt;
    if (!this.alive) return;
    if (this.stun > 0) { this.stun -= dt; return; }

    const dxAbs = Math.abs(px - this.x);
    const dxFront = (px - this.x) * this.dir;
    const dyOk = Math.abs(py - this.y) < VISION_H;
    const inCone = dxFront > 0 && dxFront < VISION && dyOk;
    const dist = Math.hypot(px - this.x, py - this.y);
    // percepção: visão (mais forte de perto) + audição (ruído)
    const visRate = inCone ? (hidden ? 0.4 : 1.2) * (1 - dxFront / (VISION * 1.4)) + 0.15 : 0;
    const hearRate = (dist < HEAR ? noise * (1 - dist / HEAR) * 0.9 : 0);
    const gain = Math.max(visRate, hearRate);
    if (gain > 0) this.see = Math.min(1, this.see + dt * gain);
    else this.see = Math.max(0, this.see - dt * 0.6);

    switch (this.state) {
      case 'patrol':
      case 'suspicious': {
        // patrulha
        if (this.pauseT > 0) this.pauseT -= dt;
        else {
          this.x += this.dir * this.speed * dt;
          if (this.x <= this.x0) { this.x = this.x0; this.dir = 1; this.pauseT = 0.8; }
          else if (this.x >= this.x1) { this.x = this.x1; this.dir = -1; this.pauseT = 0.8; }
        }
        if (this.see > 0.35) { this.state = 'suspicious'; if (dyOk || dist < HEAR) this.dir = px >= this.x ? 1 : -1; }
        if (this.see <= 0.35 && this.state === 'suspicious') this.state = 'patrol';
        if (this.see >= 1) { this.state = 'alert'; this.alertT = 0.5; this.lastX = px; }
        break;
      }
      case 'alert': {
        // breve congelamento antes de correr
        this.dir = px >= this.x ? 1 : -1; this.lastX = px;
        this.alertT -= dt; if (this.alertT <= 0) this.state = 'chase';
        break;
      }
      case 'chase': {
        if (this.see > 0.4) this.lastX = px;
        this.moveToward(this.lastX, this.chaseSpeed, dt);
        // ataque corpo-a-corpo
        if (dxAbs < MELEE_RANGE && dyOk && this.atkCd <= 0) { this.wantMelee = true; this.atkCd = 0.85; }
        // disparo (apenas soldado, à distância, alinhado)
        else if (this.kind === 'soldier' && dyOk && dxAbs > SHOOT_MIN && dxAbs < SHOOT_MAX && this.atkCd <= 0 && this.see > 0.5) {
          this.wantShoot = true; this.atkCd = 1.5; this.muzzle = 0.12; this.dir = px >= this.x ? 1 : -1;
        }
        if (this.see < 0.2) { this.state = 'search'; this.searchT = 2.6; }
        break;
      }
      case 'search': {
        this.moveToward(this.lastX, this.speed * 1.4, dt);
        if (Math.abs(this.x - this.lastX) < 8) { this.searchT -= dt; if (Math.sin(this.frame * 0.08) > 0.98) this.dir *= -1; }
        if (this.see >= 1) { this.state = 'chase'; this.lastX = px; }
        if (this.searchT <= 0) this.state = 'return';
        break;
      }
      case 'return': {
        this.moveToward(this.homeX, this.speed * 1.2, dt);
        if (Math.abs(this.x - this.homeX) < 10) { this.state = 'patrol'; this.pauseT = 0.4; }
        if (this.see >= 1) { this.state = 'chase'; this.lastX = px; }
        break;
      }
    }
    this.x = Math.max(30, this.x);
  }
  // Recebe golpe do jogador. Retorna true se foi neutralizado.
  hit(dir: number): boolean {
    if (!this.alive) return false;
    this.hp -= 1; this.stun = 0.55; this.hitFlash = 0.28;
    this.x += dir * 18;
    if (this.hp <= 0) { this.alive = false; return true; }
    // ao ser atingido, entra em perseguição
    if (this.state === 'patrol' || this.state === 'suspicious') { this.state = 'chase'; this.see = 1; }
    return false;
  }
  draw(ctx: Ctx, camX: number) {
    const gx = this.x - camX, gy = this.y;
    if (!this.alive) { // neutralizado (caído, sem sangue)
      const uni = this.kind === 'soldier' ? '#4a5240' : this.kind === 'cop' ? '#33413a' : '#2e2e36';
      rr(ctx, gx - 18, gy - 8, 36, 8, 3); ctx.fillStyle = shade(uni, -0.15); ctx.fill();
      ctx.fillStyle = '#caa98a'; ctx.beginPath(); ctx.arc(gx + 18, gy - 5, 5, 0, 7); ctx.fill();
      return;
    }
    // cone de visão conforme estado
    const alertLike = this.state === 'chase' || this.state === 'alert' || this.state === 'attack' as any;
    const coneCol = alertLike ? 'rgba(220,60,50,0.22)' : this.state === 'suspicious' || this.state === 'search' ? 'rgba(230,180,60,0.18)' : 'rgba(180,200,220,0.12)';
    ctx.fillStyle = coneCol;
    ctx.beginPath();
    ctx.moveTo(gx, gy - 60);
    ctx.lineTo(gx + this.dir * VISION, gy - 60 - VISION_H);
    ctx.lineTo(gx + this.dir * VISION, gy - 60 + VISION_H);
    ctx.closePath(); ctx.fill();
    // corpo
    const uni = this.kind === 'soldier' ? '#4a5240' : this.kind === 'cop' ? '#33413a' : '#2e2e36';
    const running = this.state === 'chase' || this.state === 'return' || this.state === 'search';
    const bob = Math.sin(this.frame * (running ? 0.5 : 0.2) + this.x) * (running ? 3 : 1.5);
    rr(ctx, gx - 9, gy - 52 + bob, 18, 34, 3); ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : uni; ctx.fill();
    rect(ctx, gx - 9, gy - 52 + bob, 18, 6, shade(uni, 0.15));
    ctx.fillStyle = '#caa98a'; ctx.beginPath(); ctx.arc(gx, gy - 58 + bob, 6, 0, 7); ctx.fill();
    rect(ctx, gx - 7, gy - 64 + bob, 14, 4, shade(uni, -0.1));
    rect(ctx, gx + this.dir * 2, gy - 62 + bob, this.dir * 6, 3, shade(uni, -0.2));
    // pernas (passada quando corre)
    const step = running ? Math.sin(this.frame * 0.5) * 5 : 0;
    rect(ctx, gx - 6 - step, gy - 18, 5, 18, shade(uni, -0.2));
    rect(ctx, gx + 1 + step, gy - 18, 5, 18, shade(uni, -0.2));
    // fuzil + fogacho (soldado)
    if (this.kind === 'soldier') {
      rect(ctx, gx + this.dir * 4, gy - 40 + bob, this.dir * 20, 3, '#20232a');
      if (this.muzzle > 0) { ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(gx + this.dir * 26, gy - 39 + bob, 5, 0, 7); ctx.fill(); }
    }
    // ícone de estado
    const ic = this.state === 'chase' || this.state === 'alert' ? '!' : this.state === 'suspicious' || this.state === 'search' ? '?' : '';
    if (ic) text(ctx, ic, gx, gy - 74 + bob, 20, ic === '!' ? '#ff5a4a' : '#e8c14a', 'center', '900');
  }
}

// Desenha uma plataforma coerente com seu tipo (o que se vê é o que colide).
export function drawPlatform(ctx: Ctx, p: Platform, camX: number) {
  const x = p.x - camX, y = p.y, w = p.w;
  switch (p.kind) {
    case 'scaffold': {
      rect(ctx, x, y, w, 8, '#6a707a'); rect(ctx, x, y, w, 3, '#8a919a');
      for (let i = 0; i <= 1; i++) { const lx = x + 6 + i * (w - 16); rect(ctx, lx, y + 8, 6, GROUND_Y - y - 8, '#4a5058'); }
      for (let cy = y + 20; cy < GROUND_Y; cy += 26) rect(ctx, x + 6, cy, w - 16, 4, 'rgba(20,24,28,0.5)');
      break; }
    case 'roof': {
      rect(ctx, x, y, w, 12, '#5a4636'); rect(ctx, x, y, w, 4, '#6a5644');
      for (let bx = x; bx < x + w; bx += 16) rect(ctx, bx, y + 4, 2, 8, 'rgba(0,0,0,0.25)');
      rect(ctx, x, y + 12, w, 6, 'rgba(0,0,0,0.3)');
      break; }
    case 'desk': {
      rect(ctx, x, y, w, 10, '#4a3624'); rect(ctx, x, y, w, 3, '#5a4230');
      rect(ctx, x + 6, y + 10, 8, 40, '#3a2a1a'); rect(ctx, x + w - 14, y + 10, 8, 40, '#3a2a1a');
      break; }
    case 'ledge': {
      rect(ctx, x, y, w, 12, '#6b6f76'); rect(ctx, x, y, w, 4, '#82868d');
      rect(ctx, x, y + 12, w, 5, 'rgba(0,0,0,0.28)');
      break; }
    case 'stair': {
      const steps = 5; const sw = w / steps;
      for (let i = 0; i < steps; i++) rect(ctx, x + i * sw, y, sw + 1, 12, '#5a5560');
      break; }
    default: { // crate: caixotes empilhados
      const cn = Math.max(1, Math.round(w / 46));
      for (let i = 0; i < cn; i++) {
        const cx = x + i * (w / cn);
        rr(ctx, cx + 2, y, w / cn - 4, 44, 3); ctx.fillStyle = '#7a5a34'; ctx.fill();
        ctx.strokeStyle = '#4a3820'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 4, y + 2); ctx.lineTo(cx + w / cn - 6, y + 42);
        ctx.moveTo(cx + w / cn - 6, y + 2); ctx.lineTo(cx + 4, y + 42); ctx.strokeStyle = 'rgba(60,44,24,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
      }
      rect(ctx, x, y - 1, w, 3, 'rgba(255,240,200,0.15)');
    }
  }
}
