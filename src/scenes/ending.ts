import { Ctx, clear, text, panel, wrap, vgrad, rect } from '../core/gfx';
import { Input } from '../core/input';
import { AudioSys } from '../core/audio';

type Phase = 'final' | 'credits' | 'note';

export class EndingScene {
  phase: Phase = 'final';
  t = 0; scroll = 0;
  save: any = null;

  reset(save?: any) { this.phase = 'final'; this.t = 0; this.scroll = 0; if (save) this.save = save; }

  update(dt: number, input: Input, W: number, H: number, audio: AudioSys): string {
    this.t += dt;
    audio.music('hope');
    if (this.phase === 'final') {
      if (input.hit(W / 2 - 110, H - 80, 220, 46, 'efc') || input.pressed(' ')) { this.phase = 'credits'; this.scroll = 0; this.t = 0; audio.sfxConfirm(); }
    } else if (this.phase === 'credits') {
      this.scroll += dt * 42; // auto-scroll
      const d = input.dragDelta(); if (input.pointer.down && d) this.scroll -= d;
      this.scroll -= input.wheel * 0.5;
      if (input.hit(W / 2 - 110, H - 62, 220, 42, 'ecn')) { this.phase = 'note'; audio.sfxConfirm(); }
    } else {
      if (input.hit(W / 2 - 130, H - 66, 260, 46, 'emenu')) { audio.sfxConfirm(); return 'menu'; }
    }
    return '';
  }

  draw(ctx: Ctx, W: number, H: number) {
    if (this.phase === 'final') this.drawFinal(ctx, W, H);
    else if (this.phase === 'credits') this.drawCredits(ctx, W, H);
    else this.drawNote(ctx, W, H);
  }

  private drawFinal(ctx: Ctx, W: number, H: number) {
    vgrad(ctx, 0, 0, W, H, [[0, '#1a2740'], [0.6, '#2a3a58'], [1, '#e6d5b0']]);
    // sunrise glow
    const g = ctx.createRadialGradient(W / 2, H - 40, 20, W / 2, H - 40, H * 0.9);
    g.addColorStop(0, 'rgba(255,220,150,0.5)'); g.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    text(ctx, '1985', W / 2, H / 2 - 140, 58, '#fff', 'center', '900');
    text(ctx, 'O FIM DO REGIME MILITAR', W / 2, H / 2 - 90, 22, '#20242c', 'center', '800');
    wrap(ctx, 'Em 1985, um presidente civil assume e encerra-se o ciclo de 21 anos de regime militar. Em 1988 é promulgada a nova Constituição — a "Constituição Cidadã". Começa a redemocratização do Brasil.', 15, Math.min(680, W - 80), '500')
      .forEach((l, i) => text(ctx, l, W / 2, H / 2 - 56 + i * 22, 15, '#2a2f38', 'center', '500'));
    this.drawStats(ctx, W, H);
    panel(ctx, W / 2 - 110, H - 80, 220, 46, 'rgba(20,24,33,0.85)', '#d9a441', 8, 2);
    text(ctx, 'CRÉDITOS ▶', W / 2, H - 51, 15, '#e8e4d8', 'center', '700');
  }

  private drawStats(ctx: Ctx, W: number, H: number) {
    const s = this.save; if (!s) return;
    const items = [
      ['Pistas coletadas', String((s.clues || []).length)],
      ['Enigmas resolvidos', String((s.solved || []).length)],
      ['Decisões tomadas', String(Object.keys(s.choices || {}).length)],
      ['Arquivos abertos', String((s.archive || []).length)],
      ['Nível de suspeita', Math.round(s.suspicion || 0) + '%'],
      ['Dificuldade', String(s.difficulty || 'normal').toUpperCase()],
    ];
    const bw = 300, bx = W / 2 - bw / 2, by = H - 210, rowH = 20;
    panel(ctx, bx, by, bw, items.length * rowH + 34, 'rgba(20,24,33,0.82)', '#8a7a4a', 8, 1.5);
    text(ctx, 'SEU DOSSIÊ', W / 2, by + 22, 13, '#d9a441', 'center', '800');
    items.forEach((it, i) => {
      const yy = by + 40 + i * rowH;
      text(ctx, it[0], bx + 18, yy, 12, '#cfc7b2', 'left', '500');
      text(ctx, it[1], bx + bw - 18, yy, 12, '#e8e4d8', 'right', '700');
    });
  }

  private drawCredits(ctx: Ctx, W: number, H: number) {
    clear(ctx, W, H, '#0d0f14');
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H - 70); ctx.clip();
    let y = H - this.scroll;
    const line = (s: string, sz: number, c: string, w = '600') => { text(ctx, s, W / 2, y, sz, c, 'center', w); y += sz + 14; };
    line('DITADURA NO BRASIL', 30, '#d9a441', '900');
    line('VOZES DE UM TEMPO', 20, '#cfc7b2', '600'); y += 20;
    line('Trabalho Extra de História', 15, '#e8e4d8', '500');
    line('Tema: Ditadura no Brasil', 15, '#e8e4d8', '500'); y += 20;
    line('Feito por', 13, '#8a7a4a', '500');
    line('Victor Gabriel Silva de Melo', 22, '#e8e4d8', '800');
    line('Nº 39 — Turma 9º B', 15, '#cfc7b2', '500');
    line('Professor: Jefferson', 15, '#cfc7b2', '500');
    line('Escola: PMC', 15, '#cfc7b2', '500'); y += 20;
    line('Pesquisa histórica e desenvolvimento', 13, '#8a7a4a', '500');
    line('Victor Gabriel Silva de Melo', 16, '#e8e4d8', '600'); y += 30;
    line('FONTES HISTÓRICAS', 20, '#d9a441', '800'); y += 6;
    ['Arquivo Nacional', 'CPDOC/FGV', 'Biblioteca Nacional', 'Senado Federal',
     'Câmara dos Deputados', 'Comissão Nacional da Verdade (2014)',
     'Acervos de universidades e museus brasileiros'].forEach(s => line(s, 15, '#cfc7b2', '500'));
    ctx.restore();
    panel(ctx, W / 2 - 110, H - 62, 220, 42, 'rgba(30,36,48,0.96)', '#8a7a4a', 8, 1.5);
    text(ctx, 'NOTA DO PROJETO ▶', W / 2, H - 34, 14, '#e8e4d8', 'center', '700');
  }

  private drawNote(ctx: Ctx, W: number, H: number) {
    clear(ctx, W, H, '#0d0f14');
    let y = 60;
    text(ctx, 'NOTA DO PROJETO', W / 2, y, 24, '#d9a441', 'center', '800'); y += 40;
    const paras = [
      'Este jogo é uma obra educativa criada para estudar a Ditadura no Brasil.',
      'Seu objetivo não é transformar um período marcado por conflitos políticos, censura, repressão, violência e violações de direitos em entretenimento banal.',
      'A proposta é utilizar uma experiência interativa para ajudar o jogador a compreender acontecimentos históricos e diferentes perspectivas sociais durante o período.',
      'As situações apresentadas são representações educativas. Personagens fictícios e situações dramatizadas não devem ser confundidos com acontecimentos ou documentos históricos reais.',
      'As informações históricas apresentadas são baseadas em fontes confiáveis.'
    ];
    paras.forEach(p => { wrap(ctx, p, 16, W - 140, '500').forEach(l => { text(ctx, l, W / 2, y, 16, '#cfc7b2', 'center', '500'); y += 24; }); y += 12; });
    y += 10;
    text(ctx, 'Obrigado por jogar e conhecer um pouco mais da História do Brasil.', W / 2, y, 17, '#d9a441', 'center', '700');
    panel(ctx, W / 2 - 130, H - 66, 260, 46, 'rgba(217,164,65,0.18)', '#d9a441', 8, 2);
    text(ctx, 'VOLTAR AO MENU', W / 2, H - 37, 15, '#e8e4d8', 'center', '700');
  }
}
