import { Ctx, panel, text, wrap, rect, rr, clamp } from '../../core/gfx';
import { Input } from '../../core/input';
import { AudioSys } from '../../core/audio';
import { PuzzleDef } from './types';

function caesar(s: string, shift: number): string {
  return s.replace(/[a-z]/gi, (ch) => {
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base);
  });
}
const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

export class PuzzleHost {
  def!: PuzzleDef;
  solved = false; closed = false; hintOn = false;
  attempts = 4; lastWrong = 0;
  // per-kind state
  shift = 0; dials: number[] = []; freq = 50; msgRevealed = false;
  clicked: number[] = []; zoom = 1;
  private wordRects: { w: string; x: number; y: number; ww: number; hh: number }[] = [];

  start(def: PuzzleDef, attempts: number, showHint: boolean) {
    this.def = def; this.solved = false; this.closed = false; this.hintOn = showHint;
    this.attempts = attempts; this.lastWrong = 0;
    this.shift = 0; this.freq = 50; this.msgRevealed = false; this.clicked = []; this.zoom = 1;
    this.dials = new Array(def.codeLen || 3).fill(0);
  }

  private rectPanel(W: number, H: number) {
    const w = Math.min(760, W - 40), h = Math.min(460, H - 40);
    return { x: W / 2 - w / 2, y: H / 2 - h / 2, w, h };
  }

  private wrong(audio: AudioSys) {
    this.attempts--; this.lastWrong = 0.6; audio.sfxAlert();
  }

  update(dt: number, input: Input, W: number, H: number, audio: AudioSys) {
    if (this.lastWrong > 0) this.lastWrong -= dt;
    const P = this.rectPanel(W, H);
    // SAIR
    if (input.hit(P.x + 16, P.y + P.h - 52, 120, 38, 'pzexit')) { this.closed = true; audio.sfxSelect(); return; }
    // HINT
    if (!this.hintOn && input.hit(P.x + 150, P.y + P.h - 52, 130, 38, 'pzhint')) { this.hintOn = true; audio.sfxSelect(); return; }
    switch (this.def.kind) {
      case 'cipher': this.upCipher(input, P, audio); break;
      case 'code': this.upCode(input, P, audio); break;
      case 'doc': this.upDoc(input, P, audio); break;
      case 'news': this.upNews(input, P, audio); break;
      case 'photo': this.upPhoto(input, P, audio); break;
      case 'radio': this.upRadio(input, P, audio); break;
    }
  }

  draw(ctx: Ctx, W: number, H: number, t: number) {
    rect(ctx, 0, 0, W, H, 'rgba(4,5,8,0.82)');
    const P = this.rectPanel(W, H);
    panel(ctx, P.x, P.y, P.w, P.h, 'rgba(16,19,27,0.98)', '#d9a441', 12, 2);
    text(ctx, this.def.title, P.x + 24, P.y + 34, 20, '#d9a441', 'left', '800');
    const bl = wrap(ctx, this.def.brief, 14, P.w - 48, '500');
    let by = P.y + 58; for (const l of bl) { text(ctx, l, P.x + 24, by, 14, '#c9d4dc', 'left', '500'); by += 19; }
    // buttons
    this.btn(ctx, P.x + 16, P.y + P.h - 52, 120, 38, 'SAIR', '#5a4030');
    if (!this.hintOn) this.btn(ctx, P.x + 150, P.y + P.h - 52, 130, 38, 'DICA', '#3a4a5a');
    if (this.hintOn) { const hl = wrap(ctx, 'Dica: ' + this.def.hint, 13, P.w - 300, '500'); let hy = P.y + P.h - 60; for (const l of hl.reverse()) { text(ctx, l, P.x + 300, hy, 13, '#e0c98a', 'left', '500'); hy -= 17; } }
    text(ctx, 'Tentativas: ' + Math.max(0, this.attempts), P.x + P.w - 24, P.y + 30, 13, this.attempts <= 1 ? '#e06a5a' : '#9fb0bc', 'right', '700');
    if (this.lastWrong > 0) text(ctx, 'Não confere. Observe melhor.', P.x + P.w / 2, P.y + P.h - 66, 14, '#e06a5a', 'center', '700');
    const body = P.y + 92;
    switch (this.def.kind) {
      case 'cipher': this.drCipher(ctx, P, body); break;
      case 'code': this.drCode(ctx, P, body); break;
      case 'doc': this.drDoc(ctx, P, body); break;
      case 'news': this.drNews(ctx, P, body); break;
      case 'photo': this.drPhoto(ctx, P, body, t); break;
      case 'radio': this.drRadio(ctx, P, body); break;
    }
  }

  private btn(ctx: Ctx, x: number, y: number, w: number, h: number, label: string, col: string) {
    rr(ctx, x, y, w, h, 7); ctx.fillStyle = col; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke();
    text(ctx, label, x + w / 2, y + h / 2 + 5, 15, '#fff', 'center', '700');
  }

  // ---------- CIPHER ----------
  private upCipher(input: Input, P: any, audio: AudioSys) {
    if (input.hit(P.x + 60, P.y + 250, 60, 44, 'cml')) { this.shift = (this.shift + 25) % 26; audio.sfxType(); }
    if (input.hit(P.x + 130, P.y + 250, 60, 44, 'cmr')) { this.shift = (this.shift + 1) % 26; audio.sfxType(); }
    if (input.hit(P.x + P.w - 220, P.y + 250, 200, 44, 'cok')) {
      const dec = caesar(this.def.cipherText || '', this.shift);
      if (norm(dec) === norm(this.def.cipherPlain || '')) { this.solved = true; audio.sfxConfirm(); }
      else this.wrong(audio);
    }
  }
  private drCipher(ctx: Ctx, P: any, body: number) {
    text(ctx, 'MENSAGEM INTERCEPTADA', P.x + 24, body + 4, 13, '#9fb0bc', 'left', '700');
    panel(ctx, P.x + 24, body + 14, P.w - 48, 60, 'rgba(0,0,0,0.4)', '#4a5560', 6, 1);
    text(ctx, (this.def.cipherText || '').slice(0, 60), P.x + 36, body + 50, 20, '#e8e4d8', 'left', '700', 'monospace');
    text(ctx, 'DECIFRADO (deslocamento ' + this.shift + ')', P.x + 24, body + 100, 13, '#9fb0bc', 'left', '700');
    panel(ctx, P.x + 24, body + 110, P.w - 48, 60, 'rgba(217,164,65,0.10)', '#d9a441', 6, 1);
    text(ctx, caesar(this.def.cipherText || '', this.shift).slice(0, 60), P.x + 36, body + 146, 20, '#f4e6b8', 'left', '800', 'monospace');
    this.btn(ctx, P.x + 60, body + 158, 60, 44, '◀', '#3a4550');
    this.btn(ctx, P.x + 130, body + 158, 60, 44, '▶', '#3a4550');
    this.btn(ctx, P.x + P.w - 220, body + 158, 200, 44, 'CONFIRMAR', '#3a6a3a');
  }

  // ---------- CODE LOCK ----------
  private upCode(input: Input, P: any, audio: AudioSys) {
    const n = this.dials.length; const gap = 90; const startX = P.x + P.w / 2 - (n * gap) / 2 + gap / 2;
    for (let i = 0; i < n; i++) {
      const dx = startX + i * gap;
      if (input.hit(dx - 30, P.y + 150, 60, 40, 'du' + i)) { this.dials[i] = (this.dials[i] + 1) % 10; audio.sfxType(); }
      if (input.hit(dx - 30, P.y + 250, 60, 40, 'dd' + i)) { this.dials[i] = (this.dials[i] + 9) % 10; audio.sfxType(); }
    }
    if (input.hit(P.x + P.w - 220, P.y + P.h - 52, 200, 38, 'lok')) {
      if (this.dials.join('') === (this.def.codeAnswer || '')) { this.solved = true; audio.sfxConfirm(); }
      else this.wrong(audio);
    }
  }
  private drCode(ctx: Ctx, P: any, body: number) {
    text(ctx, this.def.codeHint || 'Combine os números das suas pistas.', P.x + 24, body + 6, 14, '#c9d4dc', 'left', '500');
    const n = this.dials.length; const gap = 90; const startX = P.x + P.w / 2 - (n * gap) / 2 + gap / 2;
    for (let i = 0; i < n; i++) {
      const dx = startX + i * gap;
      this.btn(ctx, dx - 30, P.y + 150, 60, 40, '▲', '#3a4550');
      panel(ctx, dx - 34, P.y + 194, 68, 52, 'rgba(0,0,0,0.5)', '#d9a441', 6, 2);
      text(ctx, String(this.dials[i]), dx, P.y + 232, 34, '#f4e6b8', 'center', '800', 'monospace');
      this.btn(ctx, dx - 30, P.y + 250, 60, 40, '▼', '#3a4550');
    }
    this.btn(ctx, P.x + P.w - 220, P.y + P.h - 52, 200, 38, 'ABRIR', '#3a6a3a');
  }

  // ---------- DOCUMENT ANALYSIS ----------
  private upDoc(input: Input, _P: any, audio: AudioSys) {
    for (const r of this.wordRects) {
      if (input.hit(r.x - 2, r.y - r.hh + 2, r.ww + 4, r.hh + 4, 'w_' + r.w)) {
        const clean = norm(r.w);
        const targets = (this.def.docTarget || []).map(norm);
        if (targets.includes(clean)) {
          if (!this.clicked.includes(this.wordRects.indexOf(r))) this.clicked.push(this.wordRects.indexOf(r));
          audio.sfxStamp();
          const found = this.wordRects.filter((_, i) => this.clicked.includes(i)).map((x) => norm(x.w));
          if (targets.every((tt) => found.includes(tt))) { this.solved = true; audio.sfxConfirm(); }
        } else this.wrong(audio);
        return;
      }
    }
  }
  private drDoc(ctx: Ctx, P: any, body: number) {
    text(ctx, this.def.docPrompt || 'Toque nas informações suspeitas.', P.x + 24, body + 4, 14, '#e0c98a', 'left', '700');
    panel(ctx, P.x + 24, body + 16, P.w - 48, 220, 'rgba(20,18,12,0.7)', '#6a5a3a', 6, 1);
    this.wordRects = [];
    const words = (this.def.docText || '').split(/\s+/);
    let cx = P.x + 42, cy = body + 48; const maxX = P.x + P.w - 42;
    ctx.font = "600 16px 'Courier New',monospace";
    for (const w of words) {
      const ww = ctx.measureText(w).width;
      if (cx + ww > maxX) { cx = P.x + 42; cy += 28; }
      const idx = this.wordRects.length;
      this.wordRects.push({ w, x: cx, y: cy, ww, hh: 18 });
      const done = this.clicked.includes(idx);
      if (done) { rr(ctx, cx - 2, cy - 15, ww + 4, 20, 3); ctx.fillStyle = 'rgba(217,164,65,0.35)'; ctx.fill(); }
      text(ctx, w, cx, cy, 16, done ? '#f4e6b8' : '#d8d2c2', 'left', '600', "'Courier New',monospace");
      cx += ww + ctx.measureText(' ').width;
    }
  }

  // ---------- NEWSPAPER COMPARE ----------
  private upNews(input: Input, P: any, audio: AudioSys) {
    const n = (this.def.newsB || []).length; const colX = P.x + P.w / 2 + 12; const rowH = 34;
    for (let i = 0; i < n; i++) {
      if (input.hit(colX, P.y + 130 + i * rowH, P.w / 2 - 36, rowH - 6, 'nb' + i)) {
        if (i === (this.def.newsAnswer || 0)) { this.solved = true; audio.sfxConfirm(); }
        else this.wrong(audio);
        return;
      }
    }
  }
  private drNews(ctx: Ctx, P: any, body: number) {
    text(ctx, 'Compare as duas edições. Toque na linha que foi ALTERADA ou OMITIDA.', P.x + 24, body + 4, 13, '#e0c98a', 'left', '700');
    const midX = P.x + P.w / 2; const rowH = 34; const top = P.y + 130;
    text(ctx, 'ORIGINAL (redator)', P.x + 24, top - 12, 13, '#9fb0bc', 'left', '700');
    text(ctx, 'PUBLICADO (censurado)', midX + 12, top - 12, 13, '#9fb0bc', 'left', '700');
    const a = this.def.newsA || [], b = this.def.newsB || [];
    for (let i = 0; i < b.length; i++) {
      panel(ctx, P.x + 24, top + i * rowH, P.w / 2 - 36, rowH - 6, 'rgba(0,0,0,0.25)', '#3a4550', 4, 1);
      wrap(ctx, a[i] || '', 12, P.w / 2 - 60).slice(0, 1).forEach((l) => text(ctx, l, P.x + 32, top + i * rowH + 20, 12, '#c9d4dc', 'left', '500'));
      panel(ctx, midX + 12, top + i * rowH, P.w / 2 - 36, rowH - 6, 'rgba(30,20,20,0.35)', '#6a4a4a', 4, 1);
      wrap(ctx, b[i] || '', 12, P.w / 2 - 60).slice(0, 1).forEach((l) => text(ctx, l, midX + 20, top + i * rowH + 20, 12, '#e8d2c2', 'left', '500'));
    }
  }

  // ---------- PHOTO HOTSPOT ----------
  private upPhoto(input: Input, P: any, audio: AudioSys) {
    const fx = P.x + 24, fy = P.y + 108, fw = P.w - 48, fh = 250;
    if (input.wheel) this.zoom = clamp(this.zoom + (input.wheel > 0 ? -0.2 : 0.2), 1, 2.2);
    const h = this.def.photoHot || [0.5, 0.5, 0.08];
    if (input.hit(fx, fy, fw, fh, 'photo')) {
      const px = (input.pointer.x - fx) / fw, py = (input.pointer.y - fy) / fh;
      const d = Math.hypot(px - h[0], py - h[1]);
      if (d < h[2] + 0.03) { this.solved = true; audio.sfxConfirm(); }
      else this.wrong(audio);
    }
  }
  private drPhoto(ctx: Ctx, P: any, body: number, t: number) {
    text(ctx, this.def.photoPrompt || 'Examine a fotografia. Toque no detalhe revelador.', P.x + 24, body - 6, 13, '#e0c98a', 'left', '700');
    const fx = P.x + 24, fy = P.y + 108, fw = P.w - 48, fh = 250;
    ctx.save(); rr(ctx, fx, fy, fw, fh, 6); ctx.clip();
    // sepia photo backdrop
    rect(ctx, fx, fy, fw, fh, '#2a241c');
    for (let i = 0; i < 7; i++) rect(ctx, fx + 20 + i * (fw / 7), fy + 40, 40, fh - 80, i % 2 ? '#3a3226' : '#44392a');
    rect(ctx, fx, fy + fh - 60, fw, 60, '#1f1a13');
    // silhouettes (crowd)
    for (let i = 0; i < 12; i++) { const sx = fx + 24 + i * (fw / 12); rect(ctx, sx, fy + fh - 110, 16, 60, '#15110c'); rect(ctx, sx + 2, fy + fh - 122, 12, 14, '#15110c'); }
    // hidden detail marker (a subtle glint that pulses)
    const h = this.def.photoHot || [0.5, 0.5, 0.08];
    const gx = fx + h[0] * fw, gy = fy + h[1] * fh;
    const a = 0.25 + 0.2 * Math.sin(t * 0.004);
    ctx.fillStyle = `rgba(230,210,140,${a})`; ctx.beginPath(); ctx.arc(gx, gy, 6, 0, Math.PI * 2); ctx.fill();
    // grain
    ctx.fillStyle = 'rgba(0,0,0,0.10)'; for (let i = 0; i < 60; i++) ctx.fillRect(fx + (i * 137 % fw), fy + (i * 79 % fh), 2, 2);
    ctx.restore();
    rr(ctx, fx, fy, fw, fh, 6); ctx.lineWidth = 2; ctx.strokeStyle = '#6a5a3a'; ctx.stroke();
    if (this.hintOn) { ctx.strokeStyle = 'rgba(230,120,90,0.7)'; ctx.beginPath(); ctx.arc(gx, gy, 18, 0, Math.PI * 2); ctx.stroke(); }
  }

  // ---------- RADIO ----------
  private upRadio(input: Input, P: any, audio: AudioSys) {
    const bx = P.x + 40, bw = P.w - 80, by = P.y + 210;
    if (input.hit(P.x + 40, by + 40, 60, 40, 'rfl')) { this.freq = clamp(this.freq - 2, 0, 100); audio.sfxType(); }
    if (input.hit(P.x + P.w - 100, by + 40, 60, 40, 'rfr')) { this.freq = clamp(this.freq + 2, 0, 100); audio.sfxType(); }
    if (input.pointer.down && input.hover(bx, by - 8, bw, 24)) { this.freq = clamp(((input.pointer.x - bx) / bw) * 100, 0, 100); }
    const near = Math.abs(this.freq - (this.def.radioTarget || 50)) < 3;
    this.msgRevealed = near;
    if (near && input.hit(P.x + P.w - 220, P.y + P.h - 52, 200, 38, 'rok')) { this.solved = true; audio.sfxConfirm(); }
  }
  private drRadio(ctx: Ctx, P: any, body: number) {
    text(ctx, 'Sintonize a frequência até o sinal ficar claro.', P.x + 24, body + 4, 14, '#c9d4dc', 'left', '500');
    const bx = P.x + 40, bw = P.w - 80, by = P.y + 210;
    panel(ctx, bx, by - 8, bw, 24, 'rgba(0,0,0,0.5)', '#4a5560', 4, 1);
    for (let i = 0; i <= 100; i += 5) { const x = bx + (i / 100) * bw; rect(ctx, x, by - 4, 1, i % 25 === 0 ? 16 : 8, '#6a7580'); }
    const nx = bx + (this.freq / 100) * bw;
    rect(ctx, nx - 1.5, by - 12, 3, 30, '#d9a441');
    text(ctx, Math.round(this.freq) + ' kHz', bx, by - 18, 13, '#d9a441', 'left', '700');
    this.btn(ctx, P.x + 40, by + 40, 60, 40, '◀', '#3a4550');
    this.btn(ctx, P.x + P.w - 100, by + 40, 60, 40, '▶', '#3a4550');
    const near = Math.abs(this.freq - (this.def.radioTarget || 50)) < 3;
    panel(ctx, P.x + 120, by + 34, P.w - 240, 52, near ? 'rgba(60,120,60,0.25)' : 'rgba(0,0,0,0.4)', near ? '#5aa05a' : '#4a5560', 6, 1);
    if (near) { text(ctx, this.def.radioMsg || '...', P.x + 132, by + 66, 15, '#dff0df', 'left', '700', 'monospace'); this.btn(ctx, P.x + P.w - 220, P.y + P.h - 52, 200, 38, 'ANOTAR', '#3a6a3a'); }
    else text(ctx, '· · ·  ruído  · · ·', P.x + P.w / 2, by + 66, 15, '#7a8590', 'center', '600');
  }
}
