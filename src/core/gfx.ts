// Drawing helpers. Virtual resolution is fixed; scaling handled by main.
export type Ctx = CanvasRenderingContext2D;

export function clear(ctx: Ctx, w: number, h: number, color = '#0d0f14') {
  ctx.fillStyle = color; ctx.fillRect(0, 0, w, h);
}

export function rect(ctx: Ctx, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, Math.ceil(w), Math.ceil(h));
}

export function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function panel(ctx: Ctx, x: number, y: number, w: number, h: number,
  fill = 'rgba(15,18,26,0.92)', border = '#d9a441', r = 8, lw = 2) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = fill; ctx.fill();
  ctx.lineWidth = lw; ctx.strokeStyle = border; ctx.stroke();
}

export function text(ctx: Ctx, s: string, x: number, y: number, size: number,
  color = '#e8e4d8', align: CanvasTextAlign = 'left', weight = '600', font = "'Segoe UI',system-ui,Arial") {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

// wrap text into lines that fit maxW
export function wrap(ctx: Ctx, s: string, size: number, maxW: number, weight = '500'): string[] {
  ctx.font = `${weight} ${size}px 'Segoe UI',system-ui,Arial`;
  const words = s.split(/\s+/); const lines: string[] = []; let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

// gradient vertical
export function vgrad(ctx: Ctx, x: number, y: number, w: number, h: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
}

export function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
export function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }

// ---- color helpers ----
function hexToRgb(h: string): [number, number, number] {
  let s = h.replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  const n = parseInt(s, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}
// amount > 0 lightens toward white, < 0 darkens toward black (range ~ -1..1)
export function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  if (amount >= 0) return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
  const k = 1 + amount;
  return rgbToHex(r * k, g * k, b * k);
}
// blend two hex colors, t=0 -> a, t=1 -> b
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a); const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t));
}

// deterministic pseudo-random for scenery detail placement
export function rng(seed: number) {
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
