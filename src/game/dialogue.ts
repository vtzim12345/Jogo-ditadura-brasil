import { Ctx, panel, text, wrap, rect } from '../core/gfx';
import { drawPortrait } from './sprites';
import { CHARACTERS } from '../data/characters';

export class DialogueBox {
  who = ''; name = ''; emo = 'normal'; full = ''; shown = 0;
  active = false; done = false; speed = 1; heroId = 'antonio';
  private acc = 0;

  open(who: string, text: string, emo = 'normal', heroId = 'antonio') {
    this.heroId = heroId;
    this.who = who === 'hero' ? heroId : who;
    const c = CHARACTERS[this.who];
    this.name = c ? c.name : '';
    if (this.who === 'narrator') this.name = '';
    this.emo = emo; this.full = text; this.shown = 0; this.acc = 0;
    this.active = true; this.done = false;
  }
  close() { this.active = false; }

  // returns true if a click advanced past a completed line
  update(dt: number, wantAdvance: boolean, wantFast: boolean): boolean {
    if (!this.active) return false;
    if (!this.done) {
      const cps = 42 * this.speed * (wantFast ? 4 : 1);
      this.acc += dt * cps;
      while (this.acc >= 1 && this.shown < this.full.length) { this.shown++; this.acc -= 1; }
      if (this.shown >= this.full.length) this.done = true;
      if (wantAdvance && !this.done) { this.shown = this.full.length; this.done = true; return false; }
      return false;
    }
    if (wantAdvance) return true;
    return false;
  }

  draw(ctx: Ctx, W: number, H: number, t: number) {
    if (!this.active) return;
    const isNarr = this.who === 'narrator';
    const bx = 40, bw = W - 80, bh = 132, by = H - bh - 24;
    panel(ctx, bx, by, bw, bh, 'rgba(12,15,22,0.94)', '#d9a441', 10, 2);
    let tx = bx + 24;
    if (!isNarr) {
      const c = CHARACTERS[this.who];
      const ps = 96;
      panel(ctx, bx + 16, by + bh / 2 - ps / 2, ps, ps, '#1c222c', '#8a7a4a', 6, 2);
      if (c) drawPortrait(ctx, c.palette, bx + 16 + 4, by + bh / 2 - ps / 2 + 4, ps - 8, this.emo);
      tx = bx + 16 + ps + 20;
    }
    if (this.name) {
      rect(ctx, tx - 6, by + 12, ctx.measureText(this.name).width + 24, 0, '#000');
      text(ctx, this.name, tx, by + 30, 17, '#d9a441', 'left', '800');
    }
    const shownText = this.full.slice(0, this.shown);
    const lines = wrap(ctx, shownText, 18, bw - (tx - bx) - 40, '500');
    let ly = by + (this.name ? 56 : 40);
    for (const ln of lines) { text(ctx, ln, tx, ly, 18, isNarr ? '#cfe0e8' : '#e8e4d8', 'left', isNarr ? '400' : '500'); ly += 26; }
    // continue indicator
    if (this.done && Math.sin(t * 0.006) > -0.2) {
      text(ctx, '▼', bx + bw - 30, by + bh - 18, 18, '#d9a441', 'center', '700');
    }
    // controls hint
    text(ctx, 'ESPAÇO/toque: avançar', bx + bw - 20, by + 22, 11, 'rgba(232,228,216,0.5)', 'right', '400');
  }
}
