import { Ctx, clear, rect, text, panel, wrap, vgrad } from '../core/gfx';
import { Input } from '../core/input';
import { AudioSys } from '../core/audio';
import { hasSave } from '../core/save';

// ============= TITLE SCREEN =============
interface TitleBtn { label: string; id: string; y: number; hover?: boolean; }

export class TitleScene {
  btns: TitleBtn[] = [];
  t = 0;

  update(dt: number, input: Input, W: number, H: number, audio: AudioSys) {
    this.t += dt;
    if (!audio.ctx) audio.init();
    audio.resume();
    audio.music('menu');

    const btnW = 260, btnH = 50, startY = H / 2 + 70;
    const list: TitleBtn[] = [];
    let yy = startY;
    if (hasSave()) { list.push({ label: '▶ CONTINUAR', id: 'continue', y: yy }); yy += 62; }
    list.push({ label: hasSave() ? '➕ NOVO JOGO' : '▶ JOGAR', id: 'play', y: yy }); yy += 62;
    list.push({ label: 'ℹ SOBRE', id: 'about', y: yy });

    let result = '';
    for (const b of list) {
      b.hover = input.hover(W / 2 - btnW / 2, b.y, btnW, btnH);
      if (input.hit(W / 2 - btnW / 2, b.y, btnW, btnH, b.id)) { audio.sfxConfirm(); result = b.id; }
    }
    this.btns = list;
    return result;
  }

  draw(ctx: Ctx, W: number, H: number) {
    // dark cinematic bg
    vgrad(ctx, 0, 0, W, H, [[0, '#0d0f14'], [0.5, '#1a1c24'], [1, '#0d0f14']]);
    // subtle building silhouettes at bottom
    for (let i = 0; i < 14; i++) {
      const bx = i * 140 - 20, bh = 100 + (i * 37 % 80);
      rect(ctx, bx, H - bh - 60, 120, bh, '#151820');
      for (let wy = H - bh - 50; wy < H - 70; wy += 28)
        for (let wx = bx + 14; wx < bx + 108; wx += 30)
          rect(ctx, wx, wy, 14, 16, ((i + wx + wy) % 3 === 0) ? 'rgba(230,200,120,0.12)' : 'rgba(0,0,0,0.3)');
    }
    rect(ctx, 0, H - 60, W, 60, '#0a0c10');
    // rain
    ctx.strokeStyle = 'rgba(150,170,200,0.18)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 100; i++) {
      const x = (i * 127 + this.t * 80) % (W + 40) - 20;
      const y = (i * 91 + this.t * 180) % H;
      ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 16);
    }
    ctx.stroke();
    // vignette
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // title
    text(ctx, 'DITADURA NO BRASIL', W / 2, H / 2 - 120, 36, '#d9a441', 'center', '900');
    text(ctx, 'VOZES DE UM TEMPO', W / 2, H / 2 - 78, 22, '#cfc7b2', 'center', '600');
    // student info
    text(ctx, 'Trabalho Extra de História', W / 2, H / 2 - 30, 15, 'rgba(207,199,178,0.7)', 'center', '500');
    text(ctx, 'Victor Gabriel Silva de Melo', W / 2, H / 2 + 6, 18, '#e8e4d8', 'center', '700');
    text(ctx, 'Nº 39 — 9º B   Professor: Jefferson   Escola: PMC', W / 2, H / 2 + 34, 14, 'rgba(207,199,178,0.6)', 'center', '500');

    // buttons
    const btnW = 260, btnH = 50;
    this.btns.forEach(b => {
      const bx = W / 2 - btnW / 2;
      panel(ctx, bx, b.y, btnW, btnH, b.hover ? 'rgba(217,164,65,0.22)' : 'rgba(30,36,48,0.96)', '#8a7a4a', 8, 2);
      text(ctx, b.label, W / 2, b.y + btnH / 2 + 6, 17, '#e8e4d8', 'center', '700');
    });
  }
}

// ============= ABOUT SCREEN =============
export class AboutScene {
  scroll = 0;
  update(input: Input, W: number, H: number): string {
    this.scroll -= input.wheel;
    this.scroll = Math.min(0, this.scroll);
    if (input.hit(20, H - 54, 120, 40, 'abback')) return 'back';
    // touch drag to scroll
    const d = input.dragDelta();
    if (input.pointer.down && d !== 0) this.scroll -= d * 0.6;
    return '';
  }
  draw(ctx: Ctx, W: number, H: number) {
    clear(ctx, W, H, '#0d0f14');
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H - 60); ctx.clip();
    ctx.translate(0, this.scroll);
    let y = 40;
    const h = (s: string, sz: number, c: string, w = '800') => { text(ctx, s, W / 2, y, sz, c, 'center', w); y += sz + 10; };
    h('SOBRE', 28, '#d9a441');
    h('Ditadura no Brasil — Vozes de um Tempo', 18, '#e8e4d8', '600');
    y += 10;
    text(ctx, 'AUTOR', 50, y, 14, '#d9a441', 'left', '800'); y += 22;
    text(ctx, 'Victor Gabriel Silva de Melo', 50, y, 16, '#e8e4d8', 'left', '600'); y += 22;
    text(ctx, 'Nº 39 — Turma 9º B', 50, y, 14, '#cfc7b2', 'left', '500'); y += 20;
    text(ctx, 'Professor: Jefferson', 50, y, 14, '#cfc7b2', 'left', '500'); y += 20;
    text(ctx, 'Escola: PMC', 50, y, 14, '#cfc7b2', 'left', '500'); y += 30;
    text(ctx, 'OBJETIVO', 50, y, 14, '#d9a441', 'left', '800'); y += 22;
    wrap(ctx, 'Este jogo educativo tem como finalidade estudar e compreender o período da Ditadura Militar no Brasil (1964–1985), seus atos institucionais, a censura, a repressão, os movimentos de resistência e o processo de redemocratização, por meio de uma experiência interativa.', 15, W - 100, '500').forEach(l => { text(ctx, l, 50, y, 15, '#cfc7b2', 'left', '500'); y += 21; });
    y += 16;
    text(ctx, 'INTUITO', 50, y, 14, '#d9a441', 'left', '800'); y += 22;
    wrap(ctx, 'O formato de jogo não pretende banalizar sofrimento, violência, repressão ou violações de direitos. A proposta é oferecer uma experiência imersiva para que o jogador compreenda o período a partir de diferentes perspectivas sociais.', 15, W - 100, '500').forEach(l => { text(ctx, l, 50, y, 15, '#cfc7b2', 'left', '500'); y += 21; });
    y += 16;
    text(ctx, 'AVISO', 50, y, 14, '#d9a441', 'left', '800'); y += 22;
    wrap(ctx, 'Personagens fictícios e situações dramatizadas não devem ser confundidos com documentos ou acontecimentos históricos reais. Informações históricas são baseadas em fontes confiáveis, indicadas ao final do jogo.', 15, W - 100, '500').forEach(l => { text(ctx, l, 50, y, 15, '#cfc7b2', 'left', '500'); y += 21; });
    y += 16;
    text(ctx, 'FONTES HISTÓRICAS', 50, y, 14, '#d9a441', 'left', '800'); y += 22;
    const srcs = [
      '• Arquivo Nacional', '• CPDOC/FGV — Centro de Pesquisa e Documentação',
      '• Biblioteca Nacional', '• Senado Federal',
      '• Câmara dos Deputados', '• Comissão Nacional da Verdade (2014)',
      '• Acervos de universidades e museus brasileiros'
    ];
    srcs.forEach(s => { text(ctx, s, 54, y, 14, '#cfc7b2', 'left', '500'); y += 20; });
    y += 16;
    text(ctx, 'COMO FOI FEITO', 50, y, 14, '#d9a441', 'left', '800'); y += 22;
    wrap(ctx, 'Jogo 2D educativo desenvolvido para navegador usando TypeScript + Canvas, sem frameworks externos. Todos os gráficos são gerados por código. A trilha sonora é sintetizada via Web Audio API.', 15, W - 100, '500').forEach(l => { text(ctx, l, 50, y, 15, '#cfc7b2', 'left', '500'); y += 21; });
    y += 30;
    ctx.restore();
    panel(ctx, 20, H - 54, 120, 40, 'rgba(30,36,48,0.96)', '#8a7a4a', 8, 1.5);
    text(ctx, '← VOLTAR', 80, H - 30, 14, '#e8e4d8', 'center', '700');
  }
}

// ============= CHARACTER SELECT =============
import { PLAYABLE, CHARACTERS } from '../data/characters';

export class CharSelect {
  selected = 0;
  private geo(W: number) {
    const n = PLAYABLE.length;
    const cardW = 118, gap = 8, cardH = 200;
    const totalW = n * cardW + (n - 1) * gap;
    const startX = W / 2 - totalW / 2;
    return { cardW, gap, cardH, startX, step: cardW + gap };
  }
  update(input: Input, W: number, H: number, audio: AudioSys): string | null {
    if (input.pressed('arrowleft') || input.pressed('a')) { this.selected = (this.selected - 1 + PLAYABLE.length) % PLAYABLE.length; audio.sfxSelect(); }
    if (input.pressed('arrowright') || input.pressed('d')) { this.selected = (this.selected + 1) % PLAYABLE.length; audio.sfxSelect(); }
    if (input.hit(W / 2 - 130, H - 60, 260, 46, 'csok') || input.pressed('enter')) { audio.sfxConfirm(); return PLAYABLE[this.selected]; }
    const g = this.geo(W), cy = H / 2 - 150;
    PLAYABLE.forEach((id, i) => {
      const cx = g.startX + i * g.step;
      if (input.hit(cx, cy, g.cardW, g.cardH, 'cs' + id)) { this.selected = i; audio.sfxSelect(); }
    });
    return null;
  }
  draw(ctx: Ctx, W: number, H: number) {
    vgrad(ctx, 0, 0, W, H, [[0, '#0d0f14'], [0.5, '#181c26'], [1, '#0d0f14']]);
    text(ctx, 'ESCOLHA SEU PERSONAGEM', W / 2, 56, 24, '#d9a441', 'center', '800');
    const g = this.geo(W), cy = H / 2 - 150;
    PLAYABLE.forEach((id, i) => {
      const cx = g.startX + i * g.step;
      const sel = i === this.selected;
      panel(ctx, cx, cy, g.cardW, g.cardH, sel ? 'rgba(217,164,65,0.18)' : 'rgba(30,36,48,0.9)',
        sel ? '#d9a441' : '#6a6250', 8, sel ? 2.5 : 1.5);
      const c = CHARACTERS[id];
      if (c) {
        drawMiniPortrait(ctx, c.palette, cx + (g.cardW - 92) / 2, cy + 12, 92, 'normal');
        const names = c.name.split(' ');
        text(ctx, names[0], cx + g.cardW / 2, cy + 128, 14, '#e8e4d8', 'center', '700');
        if (names[1]) text(ctx, names.slice(1).join(' '), cx + g.cardW / 2, cy + 146, 11, '#cfc7b2', 'center', '500');
        text(ctx, c.role, cx + g.cardW / 2, cy + 174, 10, '#d9a441', 'center', '500');
      }
    });
    const c = CHARACTERS[PLAYABLE[this.selected]];
    if (c) wrap(ctx, c.bio, 13, W - 160, '500').forEach((l, i) => text(ctx, l, W / 2, cy + g.cardH + 26 + i * 18, 13, '#cfc7b2', 'center', '500'));
    panel(ctx, W / 2 - 130, H - 60, 260, 46, 'rgba(217,164,65,0.18)', '#d9a441', 8, 2);
    text(ctx, 'CONFIRMAR ▶', W / 2, H - 32, 17, '#e8e4d8', 'center', '700');
  }
}

import { drawPortrait } from '../game/sprites';
function drawMiniPortrait(ctx: Ctx, p: any, x: number, y: number, s: number, emo: string) {
  drawPortrait(ctx, p, x, y, s, emo);
}

// ============= DIFFICULTY SELECT =============
import { Difficulty } from '../core/save';
interface DiffDef { id: Difficulty; name: string; tag: string; desc: string; }
const DIFFS: DiffDef[] = [
  { id: 'facil', name: 'FÁCIL', tag: 'Pesquisador iniciante', desc: '5 vidas · mais recursos · dicas automáticas · pistas ocultas visíveis · menos suspeita' },
  { id: 'normal', name: 'NORMAL', tag: 'Testemunha do tempo', desc: '3 vidas · recursos equilibrados · enigmas sem ajuda extra · suspeita padrão' },
  { id: 'dificil', name: 'DIFÍCIL', tag: 'Sob vigilância', desc: '2 vidas · poucos recursos · menos tentativas · suspeita cresce mais rápido' },
];

export class DifficultyScene {
  selected = 1;
  update(input: Input, W: number, H: number, audio: AudioSys): Difficulty | 'back' | null {
    if (input.pressed('arrowup') || input.pressed('w')) { this.selected = (this.selected + DIFFS.length - 1) % DIFFS.length; audio.sfxSelect(); }
    if (input.pressed('arrowdown') || input.pressed('s')) { this.selected = (this.selected + 1) % DIFFS.length; audio.sfxSelect(); }
    const cw = 560, cx = W / 2 - cw / 2, startY = 150;
    for (let i = 0; i < DIFFS.length; i++) {
      if (input.hit(cx, startY + i * 90, cw, 78, 'df' + i)) { this.selected = i; audio.sfxSelect(); }
    }
    if (input.hit(W / 2 - 130, H - 74, 260, 48, 'dfok') || input.pressed('enter')) { audio.sfxConfirm(); return DIFFS[this.selected].id; }
    if (input.hit(20, H - 54, 120, 40, 'dfback') || input.pressed('escape')) return 'back';
    return null;
  }
  draw(ctx: Ctx, W: number, H: number) {
    vgrad(ctx, 0, 0, W, H, [[0, '#0d0f14'], [0.5, '#181c26'], [1, '#0d0f14']]);
    text(ctx, 'ESCOLHA A DIFICULDADE', W / 2, 80, 24, '#d9a441', 'center', '800');
    text(ctx, 'Ela ajusta vidas, recursos, ajuda nos enigmas e o quanto você chama atenção.', W / 2, 112, 13, 'rgba(207,199,178,0.7)', 'center', '500');
    const cw = 560, cx = W / 2 - cw / 2, startY = 150;
    DIFFS.forEach((d, i) => {
      const y = startY + i * 90, sel = i === this.selected;
      panel(ctx, cx, y, cw, 78, sel ? 'rgba(217,164,65,0.18)' : 'rgba(30,36,48,0.9)', sel ? '#d9a441' : '#6a6250', 8, sel ? 2.5 : 1.5);
      text(ctx, d.name, cx + 24, y + 30, 20, sel ? '#d9a441' : '#e8e4d8', 'left', '800');
      text(ctx, d.tag, cx + 24, y + 54, 13, '#cfc7b2', 'left', '600');
      wrap(ctx, d.desc, 12, cw - 220, '500').forEach((l, li) => text(ctx, l, cx + 200, y + 26 + li * 16, 12, '#a8a098', 'left', '500'));
    });
    panel(ctx, W / 2 - 130, H - 74, 260, 48, 'rgba(217,164,65,0.18)', '#d9a441', 8, 2);
    text(ctx, 'COMEÇAR ▶', W / 2, H - 45, 17, '#e8e4d8', 'center', '700');
    panel(ctx, 20, H - 54, 120, 40, 'rgba(30,36,48,0.96)', '#8a7a4a', 8, 1.5);
    text(ctx, '← VOLTAR', 80, H - 30, 14, '#e8e4d8', 'center', '700');
  }
}
