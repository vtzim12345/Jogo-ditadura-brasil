import { Ctx, panel, text, wrap, rect, rr, clamp } from '../../core/gfx';
import { Input } from '../../core/input';
import { AudioSys } from '../../core/audio';
import { SaveData } from '../../core/save';
import { SHOP, USABLE } from '../../data/shop';
import { ARCHIVE } from '../../data/archive';

export function drawTopHUD(ctx: Ctx, W: number, save: SaveData, objective: string, chapter: string, hoverMenu: boolean) {
  // top strip
  rect(ctx, 0, 0, W, 52, 'rgba(10,12,18,0.82)');
  rect(ctx, 0, 52, W, 2, 'rgba(217,164,65,0.5)');
  // hearts
  let x = 16;
  for (let i = 0; i < save.maxLives; i++) { text(ctx, i < save.lives ? '♥' : '♡', x, 34, 20, i < save.lives ? '#e0564a' : '#5a4045', 'left', '700'); x += 22; }
  x += 10;
  text(ctx, '◉ ' + save.clues.length + ' pistas', x, 33, 15, '#7fd0c0', 'left', '700'); x += 118;
  text(ctx, 'Cr$ ' + save.resources, x, 33, 15, '#e0c98a', 'left', '700'); x += 96;
  // suspicion bar
  const bw = 150, bx = x, by = 18;
  text(ctx, 'Suspeita', bx, 14, 11, '#9fb0bc', 'left', '600');
  panel(ctx, bx, by, bw, 16, 'rgba(0,0,0,0.5)', '#4a5560', 4, 1);
  const s = clamp(save.suspicion, 0, 100) / 100;
  const col = save.suspicion >= 70 ? '#e0564a' : save.suspicion >= 40 ? '#e0a24a' : '#5aa05a';
  rr(ctx, bx + 2, by + 2, (bw - 4) * s, 12, 3); ctx.fillStyle = col; ctx.fill();
  // menu button
  const mb = { x: W - 120, y: 10, w: 104, h: 32 };
  rr(ctx, mb.x, mb.y, mb.w, mb.h, 6); ctx.fillStyle = hoverMenu ? '#d9a441' : 'rgba(217,164,65,0.18)'; ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = '#d9a441'; ctx.stroke();
  text(ctx, 'MENU  ☷', mb.x + mb.w / 2, mb.y + 21, 14, hoverMenu ? '#1a1206' : '#d9a441', 'center', '800');
  // objective banner
  const oy = 60;
  panel(ctx, 12, oy, Math.min(560, W - 24), 30, 'rgba(10,12,18,0.7)', 'rgba(217,164,65,0.4)', 6, 1);
  text(ctx, '▸ ' + chapter, 24, oy + 20, 12, '#9fb0bc', 'left', '700');
  text(ctx, objective, 24, oy + 20 + 0, 12, '#9fb0bc', 'left', '700');
  panel(ctx, 12, oy + 34, Math.min(560, W - 24), 26, 'rgba(217,164,65,0.10)', 'rgba(217,164,65,0.35)', 6, 1);
  text(ctx, '◉ Objetivo: ' + objective, 24, oy + 51, 13, '#f4e6b8', 'left', '700');
}

export function menuBtnHit(input: Input, W: number): boolean {
  return input.hit(W - 120, 10, 104, 32, 'menutop');
}

type Tab = 'missao' | 'pistas' | 'inv' | 'loja' | 'arquivo' | 'config';
const TABS: [Tab, string][] = [['missao', 'Missão'], ['pistas', 'Diário'], ['inv', 'Inventário'], ['loja', 'Loja'], ['arquivo', 'Arquivo'], ['config', 'Config']];

export class MenuUI {
  tab: Tab = 'missao';
  archiveSel: string | null = null;
  toast = '';
  private toastT = 0;
  objective = ''; premise = '';

  open(objective: string, premise: string) { this.objective = objective; this.premise = premise; this.tab = 'missao'; this.archiveSel = null; }

  // returns: 'close' | 'reveal' | null
  update(dt: number, input: Input, W: number, H: number, save: SaveData, audio: AudioSys): string | null {
    if (this.toastT > 0) this.toastT -= dt;
    const P = this.panelRect(W, H);
    if (input.hit(P.x + P.w - 44, P.y + 12, 32, 32, 'mclose')) { audio.sfxSelect(); return 'close'; }
    // tabs
    const tw = (P.w - 32) / TABS.length;
    TABS.forEach((tt, i) => { if (input.hit(P.x + 16 + i * tw, P.y + 52, tw - 6, 34, 'tab' + tt[0])) { this.tab = tt[0]; this.archiveSel = null; audio.sfxSelect(); } });
    if (this.tab === 'loja') return this.upShop(input, P, save, audio);
    if (this.tab === 'inv') return this.upInv(input, P, save, audio);
    if (this.tab === 'arquivo') this.upArchive(input, P, save, audio);
    if (this.tab === 'config') this.upConfig(input, P, save, audio);
    return null;
  }

  private setToast(s: string) { this.toast = s; this.toastT = 2.2; }

  private upShop(input: Input, P: any, save: SaveData, audio: AudioSys): null {
    SHOP.forEach((it, i) => {
      const y = P.y + 100 + i * 66;
      if (input.hit(P.x + P.w - 150, y + 14, 120, 38, 'buy' + it.id)) {
        if (save.resources < it.price) { this.setToast('Recursos insuficientes.'); audio.sfxAlert(); return; }
        save.resources -= it.price; audio.sfxConfirm();
        if (it.kind === 'life') { save.lives = Math.min(save.maxLives, save.lives + (it.value || 1)); this.setToast('Vida recuperada.'); }
        else if (it.kind === 'susp') { save.suspicion = clamp(save.suspicion - (it.value || 0), 0, 100); this.setToast('Suspeita reduzida.'); }
        else { save.items[it.id] = (save.items[it.id] || 0) + 1; this.setToast(it.name + ' adquirido.'); }
      }
    });
    return null;
  }

  private upInv(input: Input, P: any, save: SaveData, audio: AudioSys): string | null {
    const ids = Object.keys(save.items).filter((k) => (save.items[k] || 0) > 0 && USABLE[k]);
    let r: string | null = null;
    ids.forEach((id, i) => {
      const y = P.y + 100 + i * 60;
      if (input.hit(P.x + P.w - 150, y + 8, 120, 36, 'use' + id)) {
        save.items[id]--; audio.sfxConfirm();
        if (id === 'lupa') { save.flags['hintNext'] = true; this.setToast('Lupa usada: pistas reveladas.'); r = 'reveal'; }
      }
    });
    return r;
  }

  private upArchive(input: Input, P: any, save: SaveData, audio: AudioSys) {
    const ids = save.archive.filter((a) => ARCHIVE[a]);
    if (this.archiveSel) { if (input.hit(P.x + 16, P.y + 96, 90, 30, 'abk')) { this.archiveSel = null; audio.sfxSelect(); } return; }
    ids.forEach((id, i) => { if (input.hit(P.x + 16, P.y + 100 + i * 44, P.w - 32, 40, 'ar' + id)) { this.archiveSel = id; audio.sfxSelect(); } });
  }

  private upConfig(input: Input, P: any, save: SaveData, audio: AudioSys) {
    const sl = (id: string, y: number, get: () => number, set: (v: number) => void) => {
      const bx = P.x + 200, bw = P.w - 260;
      if (input.pointer.down && input.hover(bx, y - 8, bw, 26)) set(clamp((input.pointer.x - bx) / bw, 0, 1));
    };
    sl('m', P.y + 120, () => save.settings.music, (v) => save.settings.music = v);
    sl('s', P.y + 170, () => save.settings.sfx, (v) => save.settings.sfx = v);
    sl('t', P.y + 220, () => (save.settings.textSpeed - 0.5) / 1.5, (v) => save.settings.textSpeed = 0.5 + v * 1.5);
    // toggle: reduzir efeitos de movimento
    if (input.hit(P.x + 200, P.y + 260, 120, 30, 'rmtoggle')) { save.settings.reduceMotion = !save.settings.reduceMotion; audio.sfxSelect(); }
  }

  private panelRect(W: number, H: number) { const w = Math.min(820, W - 24), h = Math.min(500, H - 24); return { x: W / 2 - w / 2, y: H / 2 - h / 2, w, h }; }

  draw(ctx: Ctx, W: number, H: number, save: SaveData, input: Input) {
    rect(ctx, 0, 0, W, H, 'rgba(4,5,8,0.85)');
    const P = this.panelRect(W, H);
    panel(ctx, P.x, P.y, P.w, P.h, 'rgba(16,19,27,0.99)', '#d9a441', 12, 2);
    text(ctx, 'DIÁRIO DE INVESTIGAÇÃO', P.x + 20, P.y + 34, 18, '#d9a441', 'left', '800');
    rr(ctx, P.x + P.w - 44, P.y + 12, 32, 32, 6); ctx.fillStyle = 'rgba(224,86,74,0.2)'; ctx.fill(); ctx.strokeStyle = '#e0564a'; ctx.lineWidth = 1.5; ctx.stroke();
    text(ctx, '✕', P.x + P.w - 28, P.y + 33, 18, '#e0564a', 'center', '800');
    const tw = (P.w - 32) / TABS.length;
    TABS.forEach((tt, i) => {
      const active = this.tab === tt[0];
      rr(ctx, P.x + 16 + i * tw, P.y + 52, tw - 6, 34, 6);
      ctx.fillStyle = active ? '#d9a441' : 'rgba(255,255,255,0.06)'; ctx.fill();
      if (input.hover(P.x + 16 + i * tw, P.y + 52, tw - 6, 34) && !active) { ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 1; ctx.stroke(); }
      text(ctx, tt[1], P.x + 16 + i * tw + (tw - 6) / 2, P.y + 74, 13, active ? '#1a1206' : '#c9d4dc', 'center', '700');
    });
    if (this.tab === 'missao') this.drMissao(ctx, P, save);
    else if (this.tab === 'pistas') this.drPistas(ctx, P, save);
    else if (this.tab === 'inv') this.drInv(ctx, P, save);
    else if (this.tab === 'loja') this.drShop(ctx, P, save);
    else if (this.tab === 'arquivo') this.drArchive(ctx, P, save);
    else this.drConfig(ctx, P, save);
    if (this.toastT > 0) { panel(ctx, P.x + P.w / 2 - 160, P.y + P.h - 44, 320, 32, 'rgba(217,164,65,0.9)', '#fff', 6, 1); text(ctx, this.toast, P.x + P.w / 2, P.y + P.h - 22, 14, '#1a1206', 'center', '800'); }
  }

  private drMissao(ctx: Ctx, P: any, save: SaveData) {
    text(ctx, 'PREMISSA', P.x + 24, P.y + 116, 14, '#9fb0bc', 'left', '800');
    let y = P.y + 138; for (const l of wrap(ctx, this.premise, 15, P.w - 48, '500')) { text(ctx, l, P.x + 24, y, 15, '#e8e4d8', 'left', '500'); y += 22; }
    y += 14; text(ctx, 'OBJETIVO ATUAL', P.x + 24, y, 14, '#9fb0bc', 'left', '800'); y += 24;
    for (const l of wrap(ctx, this.objective, 16, P.w - 48, '600')) { text(ctx, l, P.x + 24, y, 16, '#f4e6b8', 'left', '700'); y += 24; }
    y += 16; text(ctx, 'Escolhas até agora: ' + Object.keys(save.choices).length + ' · Enigmas resolvidos: ' + save.solved.length, P.x + 24, y, 13, '#9fb0bc', 'left', '500');
  }

  private drPistas(ctx: Ctx, P: any, save: SaveData) {
    if (save.clues.length === 0) { text(ctx, 'Nenhuma pista ainda. Explore e investigue os cenários.', P.x + 24, P.y + 120, 15, '#9fb0bc', 'left', '500'); return; }
    let y = P.y + 104;
    for (const id of save.clues) {
      const c = save.clueData[id]; if (!c) continue;
      if (y > P.y + P.h - 60) break;
      panel(ctx, P.x + 16, y, P.w - 32, 52, 'rgba(255,255,255,0.04)', 'rgba(127,208,192,0.4)', 6, 1);
      text(ctx, '[' + c.cat.toUpperCase() + '] ' + c.title, P.x + 28, y + 20, 14, '#7fd0c0', 'left', '800');
      wrap(ctx, c.text, 12, P.w - 60, '500').slice(0, 1).forEach((l) => text(ctx, l, P.x + 28, y + 40, 12, '#c9d4dc', 'left', '500'));
      y += 58;
    }
  }

  private drInv(ctx: Ctx, P: any, save: SaveData) {
    const ids = Object.keys(save.items).filter((k) => (save.items[k] || 0) > 0);
    if (ids.length === 0) { text(ctx, 'Inventário vazio. Adquira itens na Loja.', P.x + 24, P.y + 120, 15, '#9fb0bc', 'left', '500'); return; }
    ids.forEach((id, i) => {
      const y = P.y + 100 + i * 60; const u = USABLE[id];
      panel(ctx, P.x + 16, y, P.w - 32, 52, 'rgba(255,255,255,0.04)', '#6a5a3a', 6, 1);
      text(ctx, (u ? u.glyph : '▣') + '  ' + (u ? u.name : id) + '  x' + save.items[id], P.x + 30, y + 22, 15, '#e8e4d8', 'left', '700');
      if (u) { wrap(ctx, u.desc, 11, P.w - 220, '500').slice(0, 1).forEach((l) => text(ctx, l, P.x + 30, y + 40, 11, '#9fb0bc', 'left', '500'));
        rr(ctx, P.x + P.w - 150, y + 8, 120, 36, 6); ctx.fillStyle = '#3a6a3a'; ctx.fill(); text(ctx, 'USAR', P.x + P.w - 90, y + 31, 14, '#fff', 'center', '800'); }
    });
  }

  private drShop(ctx: Ctx, P: any, save: SaveData) {
    text(ctx, 'Recursos disponíveis: Cr$ ' + save.resources, P.x + 24, P.y + 112, 14, '#e0c98a', 'left', '800');
    SHOP.forEach((it, i) => {
      const y = P.y + 100 + i * 66;
      panel(ctx, P.x + 16, y, P.w - 32, 58, 'rgba(255,255,255,0.04)', '#6a5a3a', 6, 1);
      text(ctx, it.glyph + '  ' + it.name, P.x + 30, y + 22, 15, '#f4e6b8', 'left', '800');
      wrap(ctx, it.desc, 11, P.w - 320, '500').slice(0, 2).forEach((l, k) => text(ctx, l, P.x + 30, y + 38 + k * 14, 11, '#9fb0bc', 'left', '500'));
      const can = save.resources >= it.price;
      rr(ctx, P.x + P.w - 150, y + 14, 120, 38, 6); ctx.fillStyle = can ? '#3a6a3a' : '#3a3a3a'; ctx.fill();
      text(ctx, 'Cr$ ' + it.price, P.x + P.w - 90, y + 38, 14, can ? '#fff' : '#7a7a7a', 'center', '800');
    });
  }

  private drArchive(ctx: Ctx, P: any, save: SaveData) {
    if (this.archiveSel && ARCHIVE[this.archiveSel]) {
      const e = ARCHIVE[this.archiveSel];
      rr(ctx, P.x + 16, P.y + 96, 90, 30, 6); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); text(ctx, '‹ Voltar', P.x + 61, P.y + 116, 13, '#c9d4dc', 'center', '700');
      text(ctx, e.title, P.x + 120, P.y + 116, 17, '#d9a441', 'left', '800');
      const tagc = e.tag === 'HISTÓRICO' ? '#5aa05a' : '#e0a24a';
      text(ctx, e.tag + ' · ' + e.year, P.x + 120, P.y + 136, 12, tagc, 'left', '800');
      let y = P.y + 166; for (const l of wrap(ctx, e.text, 15, P.w - 60, '500')) { if (y > P.y + P.h - 30) break; text(ctx, l, P.x + 24, y, 15, '#e8e4d8', 'left', '500'); y += 23; }
      return;
    }
    const ids = save.archive.filter((a) => ARCHIVE[a]);
    ids.forEach((id, i) => {
      const e = ARCHIVE[id]; const y = P.y + 100 + i * 44;
      if (y > P.y + P.h - 30) return;
      panel(ctx, P.x + 16, y, P.w - 32, 40, 'rgba(255,255,255,0.04)', 'rgba(217,164,65,0.35)', 6, 1);
      text(ctx, e.title, P.x + 30, y + 25, 14, '#e8e4d8', 'left', '700');
      text(ctx, e.tag, P.x + P.w - 30, y + 25, 11, e.tag === 'HISTÓRICO' ? '#5aa05a' : '#e0a24a', 'right', '800');
    });
  }

  private drConfig(ctx: Ctx, P: any, save: SaveData) {
    const bar = (label: string, y: number, v: number) => {
      text(ctx, label, P.x + 24, y + 6, 15, '#e8e4d8', 'left', '600');
      const bx = P.x + 200, bw = P.w - 260;
      panel(ctx, bx, y - 8, bw, 20, 'rgba(0,0,0,0.5)', '#4a5560', 4, 1);
      rr(ctx, bx + 2, y - 6, (bw - 4) * clamp(v, 0, 1), 16, 3); ctx.fillStyle = '#d9a441'; ctx.fill();
    };
    bar('Música', P.y + 120, save.settings.music);
    bar('Efeitos', P.y + 170, save.settings.sfx);
    bar('Velocidade do texto', P.y + 220, (save.settings.textSpeed - 0.5) / 1.5);
    // toggle: reduzir movimento (partículas/tremor/flash)
    text(ctx, 'Reduzir efeitos de movimento', P.x + 24, P.y + 281, 15, '#e8e4d8', 'left', '600');
    const on = !!save.settings.reduceMotion;
    rr(ctx, P.x + 200, P.y + 260, 120, 30, 8); ctx.fillStyle = on ? '#3a6a3a' : 'rgba(255,255,255,0.08)'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = on ? '#5aa05a' : '#6a5a3a'; ctx.stroke();
    text(ctx, on ? 'ATIVADO' : 'DESATIVADO', P.x + 260, P.y + 281, 13, on ? '#cfe8cf' : '#c9d4dc', 'center', '800');
    text(ctx, 'Controles: WASD/setas mover · E interagir · ESC menu · mouse nos enigmas', P.x + 24, P.y + 320, 13, '#9fb0bc', 'left', '500');
  }
}
