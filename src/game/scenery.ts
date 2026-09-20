import { Ctx, rect, rng, vgrad, text, shade, mix } from '../core/gfx';

export interface SceneVisual {
  biome: string;         // street|home|school|newsroom|radio|theater|factory|gov|prison|protest|office|barracks|police|library|union|printshop|camarim|archive|plaza|ending
  mood: 'calm' | 'tense' | 'hope' | 'heavy';
  year: number;
  worldW: number;        // world pixel width
}

// palette per mood for sky/ambient
function sky(mood: string): [string, string] {
  switch (mood) {
    case 'calm': return ['#7fa8c9', '#d8c9a8'];
    case 'hope': return ['#8fb4d6', '#e6d5b0'];
    case 'heavy': return ['#1c2230', '#3a3140'];
    default: return ['#2c3550', '#5a4a55']; // tense dusk
  }
}
function ambientTint(mood: string): string {
  switch (mood) {
    case 'heavy': return 'rgba(10,12,20,0.42)';
    case 'tense': return 'rgba(20,20,40,0.22)';
    case 'hope': return 'rgba(255,230,180,0.06)';
    default: return 'rgba(0,0,0,0)';
  }
}

const H = 540; // virtual height
const GROUND = 430;

// RGB de uma cor hex (para brilhos de neon).
function neonRgb(hex: string): [number, number, number] {
  let s = hex.replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Paleta distinta por ambiente interno: parede / rodapé / piso.
// Cada bioma tem cor própria para que nenhum cenário pareça igual a outro.
type IPal = { wall: string; wains: string; floor: string };
const INTERIOR_PAL: Record<string, IPal> = {
  home:      { wall: '#6b5a44', wains: '#4a3b2c', floor: '#3b3126' },
  school:    { wall: '#3d5247', wains: '#2c3a30', floor: '#33403a' },
  newsroom:  { wall: '#4c515b', wains: '#33363c', floor: '#34363c' },
  radio:     { wall: '#3e2f42', wains: '#2a1f2e', floor: '#332838' },
  theater:   { wall: '#2a1c26', wains: '#1c1219', floor: '#241820' },
  factory:   { wall: '#3a3f45', wains: '#262a30', floor: '#2a2b30' },
  prison:    { wall: '#2b2f36', wains: '#23262c', floor: '#24262b' },
  office:    { wall: '#5a6152', wains: '#3f4438', floor: '#463d2e' },
  barracks:  { wall: '#565f45', wains: '#3c4230', floor: '#3a3c30' },
  police:    { wall: '#445046', wains: '#2e352e', floor: '#333833' },
  library:   { wall: '#4a3f30', wains: '#342c20', floor: '#3b3126' },
  union:     { wall: '#5a3f38', wains: '#3e2b26', floor: '#3b3126' },
  printshop: { wall: '#3a3d44', wains: '#282b30', floor: '#2e3034' },
  camarim:   { wall: '#4a3a42', wains: '#33272e', floor: '#3a2f34' },
  archive:   { wall: '#463b2c', wains: '#31281d', floor: '#382f22' },
};

// gov é tratado como repartição/escritório institucional (não mais rua).
function interiorKind(biome: string): string | null {
  const b = biome === 'gov' ? 'office' : biome;
  return INTERIOR_PAL[b] ? b : null;
}

export function drawScene(ctx: Ctx, v: SceneVisual, camX: number, W: number, t: number) {
  const [s1, s2] = sky(v.mood);
  vgrad(ctx, 0, 0, W, GROUND, [[0, s1], [1, s2]]);

  const ik = interiorKind(v.biome);
  const outdoorCity = v.biome === 'street' || v.biome === 'protest' || v.biome === 'ending';
  const isPark = v.biome === 'plaza';

  if (outdoorCity) drawCity(ctx, v, camX, W, t);
  else if (isPark) drawPark(ctx, v, camX, W, t);
  else if (ik) drawInterior(ctx, v, camX, W, t, ik);
  else drawCity(ctx, v, camX, W, t); // fallback seguro

  // ground / floor color por ambiente
  const groundCol = ik ? INTERIOR_PAL[ik].floor : (isPark ? '#3a4a30' : '#2a2b30');
  rect(ctx, 0, GROUND, W, H - GROUND, groundCol);
  rect(ctx, 0, GROUND, W, 3, 'rgba(255,255,255,0.06)');
  const go = -camX * 0.7;
  ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 1;
  for (let gx = (go % 48); gx < W; gx += 48) { ctx.beginPath(); ctx.moveTo(gx, GROUND + 6); ctx.lineTo(gx - 10, H); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.beginPath(); ctx.moveTo(0, GROUND + 22); ctx.lineTo(W, GROUND + 22); ctx.stroke();

  // wet reflection sheen when raining (ruas)
  if (v.mood === 'tense' || v.mood === 'heavy') {
    const gg = ctx.createLinearGradient(0, GROUND, 0, H);
    gg.addColorStop(0, 'rgba(120,140,180,0.10)'); gg.addColorStop(1, 'rgba(120,140,180,0)');
    ctx.fillStyle = gg; ctx.fillRect(0, GROUND, W, H - GROUND);
    if (outdoorCity) {
      const off2 = -camX * 0.7;
      const neonCols = ['#e0b23c', '#d98c4a', '#4aa0c0', '#c14a5a', '#5aa06a'];
      for (let i = -1; i < 12; i++) {
        const sx = i * 240 + off2 + 110;
        if (sx < -40 || sx > W + 40) continue;
        const neon = neonCols[((i % neonCols.length) + neonCols.length) % neonCols.length];
        const [r, g, b] = neonRgb(neon);
        const rg = ctx.createLinearGradient(0, GROUND, 0, GROUND + 74);
        rg.addColorStop(0, `rgba(${r},${g},${b},0.30)`); rg.addColorStop(1, `rgba(${r},${g},${b},0)`);
        const wob = Math.sin(t * 0.003 + i) * 3;
        ctx.fillStyle = rg; ctx.fillRect(sx - 15 + wob, GROUND, 30, 74);
        ctx.fillStyle = mix(neon, '#0d0f14', 0.4); ctx.globalAlpha = 0.18;
        ctx.fillRect(sx - 20 + wob, GROUND + 2, 40, 3); ctx.globalAlpha = 1;
      }
    }
  }

  // atmospheric fog band near horizon (depth)
  const fog = ctx.createLinearGradient(0, GROUND - 90, 0, GROUND);
  const fogC = v.mood === 'heavy' ? '30,34,46' : v.mood === 'hope' ? '235,220,190' : '150,160,180';
  fog.addColorStop(0, `rgba(${fogC},0)`); fog.addColorStop(1, `rgba(${fogC},0.16)`);
  ctx.fillStyle = fog; ctx.fillRect(0, GROUND - 90, W, 90);

  const tint = ambientTint(v.mood);
  if (tint !== 'rgba(0,0,0,0)') { ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H); }
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H * 0.95);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function poster(year: number): string {
  if (year <= 1963) return 'REFORMAS JA';
  if (year <= 1965) return 'ORDEM E PROGRESSO';
  if (year <= 1968) return 'ABAIXO A CENSURA';
  if (year <= 1974) return 'AME-O OU DEIXE-O';
  if (year <= 1979) return 'ANISTIA JA';
  return 'DIRETAS JA';
}

function drawCity(ctx: Ctx, v: SceneVisual, camX: number, W: number, t: number) {
  const off = -camX * 0.3;
  for (let i = -1; i < 18; i++) {
    const px = i * 150 + off;
    const bw = 90 + (i % 3) * 30; const bh = 150 + (i * 53 % 90);
    rect(ctx, px, GROUND - bh, bw, bh, v.mood === 'heavy' ? '#20232e' : '#4a5062');
    for (let wy = GROUND - bh + 12; wy < GROUND - 12; wy += 20)
      for (let wx = px + 10; wx < px + bw - 8; wx += 18) {
        const lit = ((i * 7 + wx + wy) % 5 === 0);
        rect(ctx, wx, wy, 8, 10, lit ? 'rgba(230,200,120,0.55)' : 'rgba(0,0,0,0.35)');
      }
  }
  const off2 = -camX * 0.7;
  const shops = ['PADARIA ESTRELA', 'BAR DO JORGE', 'MERCEARIA', 'ALFAIATE', 'FARMÁCIA', 'RELOJOARIA', 'ARMAZÉM'];
  const brickCols = ['#6a4436', '#5a4a3a', '#734231', '#54463c', '#7a5038'];
  const neonCols = ['#e0b23c', '#d98c4a', '#4aa0c0', '#c14a5a', '#5aa06a'];
  for (let i = -1; i < 12; i++) {
    const px = i * 240 + off2;
    const bw = 220, bh = 190 + (i * 37 % 70);
    const base = brickCols[((i % brickCols.length) + brickCols.length) % brickCols.length];
    rect(ctx, px, GROUND - bh, bw, bh, base);
    rect(ctx, px, GROUND - bh, bw, 8, shade(base, 0.14));
    ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 1;
    for (let by = GROUND - bh + 10, row = 0; by < GROUND - 92; by += 12, row++) {
      ctx.beginPath(); ctx.moveTo(px, by); ctx.lineTo(px + bw, by); ctx.stroke();
      const o = row % 2 ? 0 : 22;
      for (let bx = px + o; bx < px + bw; bx += 44) { ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + 12); ctx.stroke(); }
    }
    const rr2 = rng(1000 + i * 13);
    ctx.fillStyle = 'rgba(20,26,30,0.16)';
    for (let k = 0; k < 3; k++) { const sx = px + 20 + rr2() * (bw - 60), sy = GROUND - bh + 20 + rr2() * (bh - 120); ctx.beginPath(); ctx.ellipse(sx, sy, 14 + rr2() * 18, 22 + rr2() * 26, 0, 0, 6.28); ctx.fill(); }
    ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 1.2;
    const cx = px + 30 + rr2() * (bw - 60); let cy = GROUND - bh + 14;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    for (let s = 0; s < 5; s++) { cy += 14 + rr2() * 10; ctx.lineTo(cx + (rr2() - 0.5) * 22, cy); } ctx.stroke();
    for (let wy = GROUND - bh + 20; wy < GROUND - 100; wy += 46)
      for (let wx = px + 16; wx < px + bw - 20; wx += 52) {
        rect(ctx, wx, wy, 34, 30, '#2b2f3a');
        const lit = ((i + wx + wy) % 3 === 0);
        rect(ctx, wx + 3, wy + 3, 28, 24, lit ? 'rgba(240,210,130,0.5)' : 'rgba(120,130,150,0.25)');
        rect(ctx, wx + 16, wy, 2, 30, '#3a2f26');
        if (lit) { rect(ctx, wx + 3, wy + 3, 28, 4, 'rgba(255,235,180,0.35)'); }
      }
    rect(ctx, px + 20, GROUND - 90, bw - 40, 90, '#3a2c22');
    rect(ctx, px + 30, GROUND - 82, 70, 60, '#4b3a2c');
    rect(ctx, px + 34, GROUND - 82, 62, 4, shade('#4b3a2c', 0.2));
    rect(ctx, px + 110, GROUND - 82, bw - 150, 60, '#26313a');
    rect(ctx, px + 110, GROUND - 82, bw - 150, 8, 'rgba(150,180,210,0.18)');
    const name = shops[(((i + 5) % shops.length) + shops.length) % shops.length];
    const neon = neonCols[((i % neonCols.length) + neonCols.length) % neonCols.length];
    rect(ctx, px + 24, GROUND - 118, bw - 48, 22, '#161a22');
    ctx.strokeStyle = neon; ctx.lineWidth = 1; ctx.strokeRect(px + 24, GROUND - 118, bw - 48, 22);
    text(ctx, name, px + bw / 2, GROUND - 102, 13, neon, 'center', '800');
    if (v.mood === 'tense' || v.mood === 'heavy') {
      const gg = ctx.createRadialGradient(px + bw / 2, GROUND - 107, 4, px + bw / 2, GROUND - 107, 70);
      const [nr, ng, nb] = neonRgb(neon);
      gg.addColorStop(0, `rgba(${nr},${ng},${nb},0.35)`); gg.addColorStop(1, `rgba(${nr},${ng},${nb},0)`);
      ctx.fillStyle = gg; ctx.fillRect(px + bw / 2 - 70, GROUND - 177, 140, 140);
    }
    if (i % 2 === 0) {
      rect(ctx, px + bw - 60, GROUND - 200, 46, 60, '#c9c1ad');
      ctx.save(); ctx.beginPath(); ctx.rect(px + bw - 60, GROUND - 200, 46, 60); ctx.clip();
      text(ctx, poster(v.year), px + bw - 37, GROUND - 168, 8, '#5a2b26', 'center', '800');
      ctx.restore();
      ctx.strokeStyle = '#7a6f58'; ctx.lineWidth = 1; ctx.strokeRect(px + bw - 60, GROUND - 200, 46, 60);
    }
  }
  const off3 = -camX * 0.7;
  ctx.strokeStyle = 'rgba(20,20,24,0.8)'; ctx.lineWidth = 1.4;
  for (let i = 0; i < 10; i++) {
    const px = i * 240 + 60 + off3;
    rect(ctx, px, GROUND - 150, 5, 150, '#26221c');
    rect(ctx, px - 18, GROUND - 150, 40, 5, '#26221c');
    if (v.mood === 'tense' || v.mood === 'heavy') {
      const g = ctx.createRadialGradient(px + 22, GROUND - 148, 2, px + 22, GROUND - 148, 60);
      g.addColorStop(0, 'rgba(255,210,120,0.5)'); g.addColorStop(1, 'rgba(255,210,120,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px + 22, GROUND - 148, 60, 0, Math.PI * 2); ctx.fill();
    }
    rect(ctx, px + 20, GROUND - 150, 5, 8, '#e8c56a');
    ctx.beginPath(); ctx.moveTo(px + 2, GROUND - 148);
    ctx.quadraticCurveTo(px + 120, GROUND - 128, px + 240, GROUND - 148); ctx.stroke();
  }
  drawCar(ctx, 320 + off2, GROUND - 6, v.year, v.mood);
  if (v.biome === 'protest') drawCrowd(ctx, off2, t);
}

// Praça / parque ao ar livre: árvores, coreto, bancos — bem diferente da rua comercial.
function drawPark(ctx: Ctx, v: SceneVisual, camX: number, W: number, t: number) {
  const off = -camX * 0.3;
  // prédios distantes suaves
  for (let i = -1; i < 14; i++) {
    const px = i * 190 + off;
    const bh = 90 + (i * 41 % 60);
    rect(ctx, px, GROUND - bh, 150, bh, v.mood === 'heavy' ? '#242833' : '#586074');
  }
  // coreto central
  const off2 = -camX * 0.6;
  const gx = 380 + off2;
  rect(ctx, gx - 70, GROUND - 20, 140, 20, '#6a5236');
  for (let c = 0; c < 5; c++) rect(ctx, gx - 60 + c * 30, GROUND - 120, 8, 100, '#caa06a');
  ctx.fillStyle = v.mood === 'heavy' ? '#5a2f2f' : '#8a3a3a';
  ctx.beginPath(); ctx.moveTo(gx - 80, GROUND - 118); ctx.lineTo(gx, GROUND - 170); ctx.lineTo(gx + 80, GROUND - 118); ctx.closePath(); ctx.fill();
  // árvores + bancos ao longo do calçadão
  const off3 = -camX * 0.7;
  for (let i = -1; i < 12; i++) {
    const px = i * 230 + off3 + 60;
    rect(ctx, px, GROUND - 90, 16, 90, '#4a3320'); // tronco
    ctx.fillStyle = v.mood === 'heavy' ? '#26402a' : (v.mood === 'hope' ? '#4a7a44' : '#375a38');
    ctx.beginPath(); ctx.arc(px + 8, GROUND - 110, 46, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(px - 20, GROUND - 92, 34, 0, 7); ctx.arc(px + 36, GROUND - 92, 34, 0, 7); ctx.fill();
    // banco
    rect(ctx, px + 70, GROUND - 26, 60, 8, '#5a4632');
    rect(ctx, px + 74, GROUND - 18, 6, 18, '#4a3626'); rect(ctx, px + 120, GROUND - 18, 6, 18, '#4a3626');
  }
  // poste com globo
  for (let i = 0; i < 8; i++) {
    const px = i * 300 + 140 + off3;
    rect(ctx, px, GROUND - 120, 5, 120, '#2a2620');
    ctx.fillStyle = '#e8d08a'; ctx.beginPath(); ctx.arc(px + 2, GROUND - 126, 8, 0, 7); ctx.fill();
    if (v.mood === 'tense' || v.mood === 'heavy') {
      const g = ctx.createRadialGradient(px + 2, GROUND - 126, 2, px + 2, GROUND - 126, 50);
      g.addColorStop(0, 'rgba(255,220,150,0.4)'); g.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px + 2, GROUND - 126, 50, 0, 7); ctx.fill();
    }
  }
}

function drawCar(ctx: Ctx, x: number, y: number, year: number, mood: string) {
  const body = mood === 'heavy' ? '#3a3f33' : (year < 1970 ? '#6a5b3a' : '#37414a');
  rect(ctx, x, y - 26, 96, 20, body);
  rect(ctx, x + 16, y - 40, 60, 16, body);
  rect(ctx, x + 22, y - 37, 22, 12, '#9fb4c4');
  rect(ctx, x + 48, y - 37, 22, 12, '#9fb4c4');
  rect(ctx, x, y - 12, 96, 6, '#1c1e22');
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + 22, y - 6, 8, 0, 7); ctx.arc(x + 74, y - 6, 8, 0, 7); ctx.fill();
  rect(ctx, x + 92, y - 24, 5, 6, '#e8c56a');
}

function drawCrowd(ctx: Ctx, off: number, t: number) {
  const cols = ['#8a6b4a', '#6a5540', '#7a5a48', '#5f4a3a'];
  for (let i = 0; i < 24; i++) {
    const x = (i * 46 + off * 0.9) % 2000;
    const bob = Math.sin(t * 0.004 + i) * 3;
    rect(ctx, x, GROUND - 44 + bob, 12, 40, cols[i % 4]);
    rect(ctx, x + 1, GROUND - 56 + bob, 10, 12, '#c8a888');
    if (i % 3 === 0) { rect(ctx, x - 2, GROUND - 78 + bob, 16, 12, '#d8cfb8'); }
  }
}

function drawInterior(ctx: Ctx, v: SceneVisual, camX: number, W: number, t: number, kind: string) {
  const off = -camX * 0.5;
  const pal = INTERIOR_PAL[kind] || INTERIOR_PAL.home;
  const wall = v.mood === 'heavy' ? mix(pal.wall, '#14161c', 0.4) : pal.wall;
  rect(ctx, 0, 60, W, GROUND - 60, wall);
  rect(ctx, 0, 60, W, 10, 'rgba(0,0,0,0.25)');
  // leve gradiente vertical na parede (profundidade)
  const wg = ctx.createLinearGradient(0, 60, 0, GROUND);
  wg.addColorStop(0, 'rgba(255,255,255,0.05)'); wg.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = wg; ctx.fillRect(0, 60, W, GROUND - 60);
  // rodapé
  rect(ctx, 0, GROUND - 60, W, 60, v.mood === 'heavy' ? mix(pal.wains, '#0e1014', 0.35) : pal.wains);
  const put = (x: number, draw: () => void) => { ctx.save(); ctx.translate(x + off, 0); draw(); ctx.restore(); };
  for (let i = -1; i < 8; i++) {
    const bx = i * 300;
    switch (kind) {
      case 'home': put(bx, () => homeProps(ctx, v)); break;
      case 'school': put(bx, () => schoolProps(ctx)); break;
      case 'newsroom': put(bx, () => newsProps(ctx)); break;
      case 'radio': put(bx, () => radioProps(ctx)); break;
      case 'theater': put(bx, () => theaterProps(ctx, t)); break;
      case 'factory': put(bx, () => factoryProps(ctx, t)); break;
      case 'prison': put(bx, () => prisonProps(ctx)); break;
      case 'office': put(bx, () => officeProps(ctx)); break;
      case 'barracks': put(bx, () => barracksProps(ctx)); break;
      case 'police': put(bx, () => policeProps(ctx)); break;
      case 'library': put(bx, () => libraryProps(ctx)); break;
      case 'union': put(bx, () => unionProps(ctx)); break;
      case 'printshop': put(bx, () => printshopProps(ctx, t)); break;
      case 'camarim': put(bx, () => camarimProps(ctx)); break;
      case 'archive': put(bx, () => archiveProps(ctx)); break;
    }
  }
}

function win(ctx: Ctx, x: number, y: number, lit = true) {
  rect(ctx, x, y, 70, 90, '#2b2f3a');
  rect(ctx, x + 4, y + 4, 62, 82, lit ? 'rgba(150,180,210,0.5)' : 'rgba(60,70,90,0.4)');
  rect(ctx, x + 33, y, 4, 90, '#3a2f26'); rect(ctx, x, y + 43, 70, 4, '#3a2f26');
}
// Bandeira do Brasil estilizada (verde/amarelo/azul), sem lema para simplicidade.
function brazilFlag(ctx: Ctx, x: number, y: number, w: number, h: number) {
  rect(ctx, x, y, w, h, '#1f7a3d');
  ctx.fillStyle = '#e8c53a';
  ctx.beginPath(); ctx.moveTo(x + w / 2, y + 6); ctx.lineTo(x + w - 8, y + h / 2); ctx.lineTo(x + w / 2, y + h - 6); ctx.lineTo(x + 8, y + h / 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#173a6a'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.18, 0, 7); ctx.fill();
}
function homeProps(ctx: Ctx, v: SceneVisual) {
  win(ctx, 40, 100, v.mood !== 'heavy');
  rect(ctx, 150, 250, 90, 60, '#7a4632');
  rect(ctx, 150, 235, 90, 18, '#8a5238');
  rect(ctx, 20, 200, 30, 130, '#5a3f2a');
  for (let i = 0; i < 4; i++) rect(ctx, 24, 210 + i * 30, 22, 6, ['#8a2f2f','#2f5a8a','#2f8a5a','#8a7a2f'][i]);
  rect(ctx, 250, 120, 46, 36, '#2a2118'); rect(ctx, 254, 124, 38, 28, '#98a8b8');
}
function schoolProps(ctx: Ctx) {
  rect(ctx, 30, 110, 150, 80, '#25352a');
  ctx.strokeStyle = '#c9c4b4'; ctx.lineWidth = 2; ctx.strokeRect(30, 110, 150, 80);
  text(ctx, 'LIBERDADE', 105, 155, 16, 'rgba(230,230,220,0.7)', 'center', '700');
  for (let d = 0; d < 3; d++) { rect(ctx, 40 + d * 90, 300, 60, 26, '#6a4a2c'); rect(ctx, 40 + d * 90, 326, 60, 30, '#5a3f22'); }
}
function newsProps(ctx: Ctx) {
  rect(ctx, 40, 280, 120, 40, '#4a3220');
  rect(ctx, 70, 250, 44, 30, '#20242c');
  rect(ctx, 74, 246, 36, 8, '#30343c');
  for (let i = 0; i < 6; i++) rect(ctx, 76 + i * 5, 254, 3, 3, '#c9c4b4');
  rect(ctx, 200, 120, 90, 70, '#c9c1ad');
  text(ctx, 'REDACAO', 245, 108, 14, '#e8e4d8', 'center', '800');
}
function radioProps(ctx: Ctx) {
  rect(ctx, 60, 240, 90, 80, '#3a2c1e');
  rect(ctx, 72, 256, 66, 40, '#20242c');
  ctx.fillStyle = '#e8c56a'; ctx.beginPath(); ctx.arc(105, 276, 14, 0, 7); ctx.fill();
  rect(ctx, 200, 130, 40, 90, '#20242c');
  ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(220, 130, 14, 0, 7); ctx.fill();
  text(ctx, 'ON AIR', 250, 110, 14, '#c1443a', 'center', '800');
}
function theaterProps(ctx: Ctx, t: number) {
  rect(ctx, 20, 80, 260, 250, '#2a1c26');
  for (let i = 0; i < 6; i++) { rect(ctx, 20 + i * 22, 80, 20, 250, i % 2 ? '#6a1f24' : '#7a2b30'); }
  const glow = Math.abs(Math.sin(t * 0.002));
  ctx.fillStyle = `rgba(255,220,140,${0.15 + glow * 0.2})`;
  ctx.beginPath(); ctx.moveTo(150, 90); ctx.lineTo(90, 330); ctx.lineTo(210, 330); ctx.closePath(); ctx.fill();
}
function factoryProps(ctx: Ctx, t: number) {
  for (let i = 0; i < 4; i++) { rect(ctx, 30 + i * 70, 120, 50, 200, '#3a3f45'); rect(ctx, 36 + i * 70, 130, 38, 20, '#20242c'); }
  const s = Math.sin(t * 0.006) * 10;
  rect(ctx, 40, 90, 220, 8, '#2a2e34');
  rect(ctx, 120 + s, 96, 12, 30, '#6a707a');
}
function prisonProps(ctx: Ctx) {
  rect(ctx, 0, 60, 400, GROUND - 60, '#22262c');
  ctx.strokeStyle = '#0d0f14'; ctx.lineWidth = 8;
  for (let x = 40; x < 380; x += 40) { ctx.beginPath(); ctx.moveTo(x, 80); ctx.lineTo(x, GROUND - 20); ctx.stroke(); }
  ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(20, 90); ctx.lineTo(380, 90); ctx.stroke();
  rect(ctx, 198, 80, 2, 40, '#111');
  const g = ctx.createRadialGradient(199, 128, 2, 199, 128, 70);
  g.addColorStop(0, 'rgba(255,220,150,0.5)'); g.addColorStop(1, 'rgba(255,220,150,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(199, 128, 70, 0, 7); ctx.fill();
  rect(ctx, 196, 122, 6, 8, '#f0d99a');
}
// Escritório / repartição (gov): mesa grande, arquivos, bandeira, retrato, relógio.
function officeProps(ctx: Ctx) {
  // painel de madeira na parede
  rect(ctx, 0, 150, 300, 90, 'rgba(60,45,28,0.35)');
  brazilFlag(ctx, 40, 96, 44, 30);
  // retrato oficial
  rect(ctx, 110, 96, 34, 40, '#2a2118'); rect(ctx, 114, 100, 26, 32, '#8a99a8');
  // relógio de parede
  ctx.fillStyle = '#e8e2d2'; ctx.beginPath(); ctx.arc(210, 116, 16, 0, 7); ctx.fill();
  ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(210, 116); ctx.lineTo(210, 106); ctx.moveTo(210, 116); ctx.lineTo(219, 116); ctx.stroke();
  // mesa executiva
  rect(ctx, 60, 270, 170, 50, '#3a2a1a'); rect(ctx, 60, 264, 170, 8, '#4a3520');
  // luminária de mesa
  rect(ctx, 90, 244, 4, 20, '#20242c'); ctx.fillStyle = '#e8c56a'; ctx.beginPath(); ctx.moveTo(80, 244); ctx.lineTo(104, 244); ctx.lineTo(96, 232); ctx.lineTo(88, 232); ctx.closePath(); ctx.fill();
  // arquivo de aço
  rect(ctx, 250, 230, 44, 90, '#5a6068');
  for (let i = 0; i < 3; i++) { rect(ctx, 254, 238 + i * 28, 36, 22, '#464b52'); rect(ctx, 268, 246 + i * 28, 8, 4, '#20242c'); }
}
// Quartel: armários metálicos, mapa, bandeira, beliche (sem armas à mostra).
function barracksProps(ctx: Ctx) {
  brazilFlag(ctx, 30, 96, 40, 28);
  // mapa na parede
  rect(ctx, 96, 96, 90, 66, '#c9c4a8'); ctx.strokeStyle = '#5a6a4a'; ctx.lineWidth = 1;
  for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(100 + k * 22, 100); ctx.lineTo(110 + k * 22, 158); ctx.stroke(); }
  ctx.strokeStyle = '#8a4a3a'; ctx.beginPath(); ctx.moveTo(100, 130); ctx.lineTo(182, 122); ctx.stroke();
  // armários
  for (let i = 0; i < 3; i++) { rect(ctx, 30 + i * 46, 220, 40, 100, '#4a5240'); rect(ctx, 34 + i * 46, 226, 32, 90, '#3c4230'); ctx.fillStyle = '#20242c'; ctx.beginPath(); ctx.arc(60 + i * 46, 270, 3, 0, 7); ctx.fill(); }
  // beliche
  rect(ctx, 200, 250, 90, 12, '#5a4632'); rect(ctx, 200, 300, 90, 12, '#5a4632');
  rect(ctx, 204, 240, 82, 12, '#8a8270'); rect(ctx, 204, 290, 82, 12, '#8a8270');
}
// Delegacia: balcão, mural de procurados, cela lateral, relógio.
function policeProps(ctx: Ctx) {
  // mural de avisos
  rect(ctx, 30, 100, 100, 76, '#8a8268');
  for (let k = 0; k < 4; k++) rect(ctx, 38 + (k % 2) * 46, 108 + Math.floor(k / 2) * 34, 40, 28, '#d8d2c0');
  text(ctx, 'PROCURADOS', 80, 96, 9, '#c9c4b4', 'center', '800');
  // balcão de atendimento
  rect(ctx, 40, 280, 150, 40, '#3a4238'); rect(ctx, 40, 272, 150, 10, '#4a5246');
  // cela lateral com grades
  rect(ctx, 230, 120, 66, 200, '#20242a');
  ctx.strokeStyle = '#0d0f14'; ctx.lineWidth = 5;
  for (let x = 236; x < 296; x += 16) { ctx.beginPath(); ctx.moveTo(x, 130); ctx.lineTo(x, 316); ctx.stroke(); }
}
// Biblioteca: estantes cheias de livros, escada, mesa de leitura.
function libraryProps(ctx: Ctx) {
  for (let s = 0; s < 2; s++) {
    const sx = 20 + s * 150;
    rect(ctx, sx, 100, 120, 220, '#3a2c1c');
    for (let sh = 0; sh < 5; sh++) {
      const sy = 108 + sh * 42;
      rect(ctx, sx + 4, sy + 34, 112, 6, '#2a2014');
      for (let bk = 0; bk < 12; bk++) {
        const bc = ['#8a2f2f','#2f5a8a','#2f7a4a','#8a6a2f','#5a3f7a','#7a4a2f'][(sh + bk) % 6];
        rect(ctx, sx + 6 + bk * 9, sy + 8 + (bk % 3), 7, 26 - (bk % 3), bc);
      }
    }
  }
  // escada
  rect(ctx, 132, 150, 6, 170, '#5a4632'); rect(ctx, 160, 150, 6, 170, '#5a4632');
  for (let r = 0; r < 5; r++) rect(ctx, 132, 170 + r * 30, 34, 5, '#5a4632');
}
// Sindicato: tribuna, fileiras de cadeiras, faixa, bandeira.
function unionProps(ctx: Ctx) {
  // faixa
  rect(ctx, 30, 92, 240, 26, '#b83a3a');
  text(ctx, 'SINDICATO — UNIÃO', 150, 110, 13, '#f4ead2', 'center', '800');
  // tribuna
  rect(ctx, 40, 250, 50, 70, '#4a3320'); rect(ctx, 36, 244, 58, 10, '#5a4028');
  // microfone
  rect(ctx, 62, 224, 3, 26, '#20242c'); ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(63, 224, 6, 0, 7); ctx.fill();
  // fileiras de cadeiras
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const cx = 150 + c * 34, cy = 260 + r * 22;
    rect(ctx, cx, cy, 24, 10, '#5a4632'); rect(ctx, cx, cy - 16, 24, 16, '#6a5238');
  }
}
// Gráfica: prensa, jornais empilhados, folhas penduradas para secar.
function printshopProps(ctx: Ctx, t: number) {
  // prensa
  rect(ctx, 30, 200, 140, 120, '#2e343c'); rect(ctx, 40, 210, 120, 60, '#20242c');
  const roll = Math.sin(t * 0.005) * 6;
  rect(ctx, 50 + roll, 220, 100, 12, '#6a707a'); rect(ctx, 50, 244, 100, 8, '#4a5058');
  ctx.fillStyle = '#8a8270'; ctx.beginPath(); ctx.arc(100, 226, 14, 0, 7); ctx.fill();
  // pilhas de jornal
  for (let i = 0; i < 4; i++) rect(ctx, 200 + i * 4, 300 - i * 5, 70, 6 + i, '#c9c1ad');
  // varal de folhas secando
  ctx.strokeStyle = '#7a6f58'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(190, 120); ctx.lineTo(300, 132); ctx.stroke();
  for (let i = 0; i < 4; i++) { rect(ctx, 200 + i * 26, 122 + i * 3, 22, 30, '#e6e0d0'); }
}
// Camarim: espelho com lâmpadas, arara de figurinos, banqueta.
function camarimProps(ctx: Ctx) {
  // espelho iluminado
  rect(ctx, 40, 110, 90, 120, '#20242c'); rect(ctx, 46, 116, 78, 108, 'rgba(180,200,220,0.35)');
  ctx.fillStyle = '#f0e6b0';
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(52 + i * 14, 106, 4, 0, 7); ctx.fill(); }
  // mesinha de maquiagem
  rect(ctx, 40, 250, 100, 40, '#4a3628');
  for (let i = 0; i < 4; i++) rect(ctx, 52 + i * 18, 236, 8, 14, ['#b83a5a','#c98a3a','#3a8a6a','#7a4a8a'][i]);
  // arara de figurinos
  ctx.strokeStyle = '#5a4632'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(200, 130); ctx.lineTo(290, 130); ctx.stroke();
  rect(ctx, 200, 128, 4, 100, '#5a4632'); rect(ctx, 286, 128, 4, 100, '#5a4632');
  const cols = ['#7a2f4a', '#2f5a7a', '#6a5a2f', '#4a2f6a'];
  for (let i = 0; i < 4; i++) { rect(ctx, 210 + i * 20, 134, 16, 80, cols[i]); rect(ctx, 214 + i * 20, 130, 8, 8, '#8a8270'); }
}
// Arquivo/depósito: prateleiras de caixas de processo, lâmpada única.
function archiveProps(ctx: Ctx) {
  for (let s = 0; s < 2; s++) {
    const sx = 20 + s * 160;
    rect(ctx, sx, 110, 130, 210, '#31281d');
    for (let sh = 0; sh < 4; sh++) {
      const sy = 120 + sh * 50;
      rect(ctx, sx + 4, sy + 42, 122, 6, '#241c12');
      for (let bx = 0; bx < 4; bx++) {
        rect(ctx, sx + 8 + bx * 30, sy + 6, 26, 34, '#9a8a68');
        rect(ctx, sx + 12 + bx * 30, sy + 12, 18, 6, '#6a5a3a');
      }
    }
  }
  rect(ctx, 198, 80, 2, 34, '#111');
  const g = ctx.createRadialGradient(199, 120, 2, 199, 120, 64);
  g.addColorStop(0, 'rgba(255,220,150,0.4)'); g.addColorStop(1, 'rgba(255,220,150,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(199, 120, 64, 0, 7); ctx.fill();
  rect(ctx, 196, 114, 6, 8, '#f0d99a');
}

export const GROUND_Y = GROUND;
export const V_H = H;
