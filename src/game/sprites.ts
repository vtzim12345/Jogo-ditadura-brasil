import { Ctx, rect, shade, mix } from '../core/gfx';

export interface CharPalette {
  skin: string; hair: string; shirt: string; pants: string;
  shoes?: string; accent?: string; hat?: string; tie?: string;
  hairStyle?: 'short' | 'long' | 'bun' | 'ponytail' | 'gray' | 'bald' | 'afro' | 'curly' | 'wavy' | 'buzz' | 'braids';
  outfit?: 'shirt' | 'dress' | 'suit' | 'uniform' | 'apron' | 'robe';
  glasses?: boolean; beard?: boolean; mustache?: boolean; scarf?: string;
}

export type Pose = 'idle' | 'walk' | 'talk';

// Detailed pixel-art human. x,y = bottom-center of feet. s = horizontal scale, sy = vertical scale (default s). facing 1/-1.
export function drawChar(ctx: Ctx, p: CharPalette, x: number, y: number, s: number,
  pose: Pose, frame: number, facing: number, sy: number = s) {
  const px = (dx: number, dy: number, w: number, h: number, c: string) => {
    rect(ctx, x + facing * dx * s - (facing < 0 ? w * s : 0), y + dy * sy, w * s, h * sy, c);
  };
  const outfit = p.outfit || 'shirt';
  const hairStyle = p.hairStyle || (outfit === 'dress' ? 'long' : 'short');
  const bob = pose === 'walk' ? Math.sin(frame * 0.4) : (pose === 'idle' ? Math.sin(frame * 0.06) * 0.4 : 0);
  const legSwing = pose === 'walk' ? Math.sin(frame * 0.4) * 2 : 0;
  const armSwing = pose === 'talk' ? (Math.sin(frame * 0.25) > 0 ? -2 : 0) : (pose === 'walk' ? -legSwing : 0);
  const yo = -Math.abs(bob);

  const shirtHi = shade(p.shirt, 0.16), shirtLo = shade(p.shirt, -0.22);
  const skinHi = shade(p.skin, 0.14), skinLo = shade(p.skin, -0.18);
  const hairCol = hairStyle === 'gray' ? mix(p.hair, '#cfc9bd', 0.65) : p.hair;
  const hairHi = shade(hairCol, 0.18), hairLo = shade(hairCol, -0.25);

  // ground shadow (soft, layered)
  ctx.fillStyle = 'rgba(0,0,0,0.30)';
  ctx.beginPath(); ctx.ellipse(x, y + 1, 7.5 * s, 2.6 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.ellipse(x, y + 1, 10 * s, 3.2 * s, 0, 0, Math.PI * 2); ctx.fill();

  // ---------- LOWER BODY ----------
  if (outfit === 'dress' || outfit === 'robe') {
    const col = outfit === 'robe' ? p.pants : p.shirt;
    const lo = shade(col, -0.22), hi = shade(col, 0.14);
    // skirt: trapezoid built from rows
    const topY = -13, botY = -1.5, rows = 12;
    for (let i = 0; i < rows; i++) {
      const tt = i / (rows - 1);
      const wy = topY + (botY - topY) * tt;
      const halfW = 3.2 + tt * 4.8;
      px(-halfW, wy + yo * (1 - tt), halfW * 2, (botY - topY) / rows + 0.6, i % 2 ? col : mix(col, lo, 0.25));
    }
    px(-3.4, -2 + yo * 0, 6.8, 1.4, lo); // hem
    // ankles/shoes peeking
    px(-2.6, -1.5, 2.4, 2, p.shoes || '#2a2118');
    px(0.4, -1.5, 2.4, 2, p.shoes || '#2a2118');
    // vertical highlight
    px(-1, topY + yo, 1.2, botY - topY, shade(hi, 0.05));
  } else {
    const pantHi = shade(p.pants, 0.12), pantLo = shade(p.pants, -0.22);
    // legs with shading
    px(-3, -8 + legSwing * 0.2, 2.8, 8, p.pants);
    px(-3, -8 + legSwing * 0.2, 1, 8, pantHi);
    px(0.9, -8 - legSwing * 0.2, 2.8, 8, p.pants);
    px(2.7, -8 - legSwing * 0.2, 1, 8, pantLo);
    // shoes
    px(-3.4, -1.6 + legSwing * 0.2, 3.4, 2.4, p.shoes || '#2a2118');
    px(0.6, -1.6 - legSwing * 0.2, 3.4, 2.4, p.shoes || '#2a2118');
    px(-3.4, -1.6 + legSwing * 0.2, 3.4, 0.8, shade(p.shoes || '#2a2118', 0.2));
  }

  // ---------- TORSO ----------
  const torsoTop = -20 + yo, torsoH = outfit === 'dress' ? 8 : 12;
  px(-4, torsoTop, 8, torsoH, p.shirt);
  px(-4, torsoTop, 1.4, torsoH, shirtHi);           // left highlight
  px(2.6, torsoTop, 1.4, torsoH, shirtLo);          // right shade
  px(-4, torsoTop, 8, 1.2, shade(p.shirt, 0.1));    // collar line
  if (outfit === 'suit') {
    // jacket over shirt: darker panels + lapels + tie
    const jk = shade(p.shirt, -0.3);
    px(-4, torsoTop, 3, torsoH, jk); px(1, torsoTop, 3, torsoH, jk);
    px(-1, torsoTop, 2, torsoH, '#e8e4d8'); // shirt gap
    if (p.tie) px(-0.6, torsoTop + 1, 1.2, torsoH - 3, p.tie);
    px(-4, torsoTop, 1.8, 4, shade(jk, 0.12)); px(2.2, torsoTop, 1.8, 4, shade(jk, 0.12)); // lapels
  }
  if (outfit === 'uniform') {
    px(-4, torsoTop + 5, 8, 1.6, p.accent || '#3a3020'); // belt
    px(-4, torsoTop, 8, 1.4, shade(p.shirt, 0.2));       // shoulder line
    px(-3.6, torsoTop + 0.4, 1.4, 1.2, '#e0c25a'); px(2.2, torsoTop + 0.4, 1.4, 1.2, '#e0c25a'); // epaulettes
    px(1.8, torsoTop + 2, 1.2, 2.4, '#d9b84a'); // badge
  }
  if (outfit === 'apron') {
    const ap = shade(p.accent || p.shirt, 0.2);
    px(-2.6, torsoTop + 2, 5.2, torsoH - 2, ap);
    px(-2.6, torsoTop + 2, 5.2, 1, shade(ap, 0.15));
  } else if (p.accent && outfit !== 'uniform' && outfit !== 'suit') {
    px(-4, torsoTop + 6, 8, 1.4, p.accent);
  }

  // ---------- ARMS ----------
  const sleeve = outfit === 'suit' ? shade(p.shirt, -0.3) : p.shirt;
  px(-5.6, torsoTop + 1 + armSwing * 0.2, 2, 9, sleeve);
  px(-5.6, torsoTop + 1 + armSwing * 0.2, 0.8, 9, shade(sleeve, 0.15));
  px(3.6, torsoTop + 1 - armSwing * 0.2, 2, 9, sleeve);
  px(4.8, torsoTop + 1 - armSwing * 0.2, 0.8, 9, shade(sleeve, -0.2));
  // hands
  px(-5.6, torsoTop + 9.5 + armSwing * 0.2, 2, 2, p.skin);
  px(3.6, torsoTop + 9.5 - armSwing * 0.2, 2, 2, p.skin);

  // ---------- SCARF (opcional) ----------
  if (p.scarf) {
    const sc = p.scarf, scLo = shade(sc, -0.2), scHi = shade(sc, 0.15);
    px(-3.4, torsoTop - 1.2, 6.8, 2.4, sc);
    px(-3.4, torsoTop - 1.2, 6.8, 0.8, scHi);
    px(facing >= 0 ? 1.2 : -2.4, torsoTop + 0.6, 1.6, 4.5, sc); // ponta pendendo
    px(facing >= 0 ? 1.2 : -2.4, torsoTop + 0.6, 0.6, 4.5, scLo);
  }

  // ---------- NECK + HEAD ----------
  px(-1.5, -22 + yo, 3, 2.4, skinLo);
  const hy = -30 + yo;
  // head base with rounded shading
  px(-3.5, hy, 7, 8, p.skin);
  px(-3.5, hy, 1.4, 8, skinHi);        // left lit cheek
  px(2.1, hy, 1.4, 8, skinLo);         // right shaded cheek
  px(-3.5, hy, 7, 1, skinHi);          // forehead sheen
  px(-3.5, hy + 7, 7, 1, skinLo);      // jaw shade
  // ears
  px(-4, hy + 3, 1, 2, skinLo); px(3, hy + 3, 1, 2, skinLo);

  // ---------- HAIR ----------
  if (hairStyle === 'afro') {
    // halo volumoso arredondado
    px(-5.2, hy - 4.5, 10.4, 6.5, hairCol);
    px(-5.6, hy - 1, 2.8, 8, hairCol); px(2.8, hy - 1, 2.8, 8, hairCol);
    px(-5.2, hy - 4.5, 10.4, 1.6, hairHi);
    for (let i = 0; i < 5; i++) px(-5 + i * 2.1, hy - 5, 2.2, 2.2, i % 2 ? hairHi : hairCol);
  } else if (hairStyle === 'curly') {
    px(-4.6, hy - 3, 9.2, 4.6, hairCol);
    for (let i = 0; i < 4; i++) px(-4.6 + i * 2.4, hy - 4, 2.6, 2.6, i % 2 ? hairHi : hairCol);
    px(-4.6, hy, 1.8, 5.5, hairCol); px(2.8, hy, 1.8, 5.5, hairCol);
  } else if (hairStyle !== 'bald') {
    px(-4, hy - 1, 8, 3, hairCol);          // top
    px(-4, hy - 1, 8, 1, hairHi);
    if (hairStyle === 'short' || hairStyle === 'gray') {
      px(-4, hy, 1.4, 4, hairCol); px(2.6, hy, 1.4, 4, hairCol);
      if (hairStyle === 'gray') { px(-4, hy - 1, 8, 1.2, hairHi); px(-2, hy + 0.5, 4, 0.8, p.skin); } // receding
    } else if (hairStyle === 'buzz') {
      // rente ao crânio
      px(-4, hy - 1, 8, 2, mix(hairCol, p.skin, 0.25));
      px(-3.8, hy + 0.4, 1, 2.4, hairCol); px(2.8, hy + 0.4, 1, 2.4, hairCol);
    } else if (hairStyle === 'long' || hairStyle === 'wavy') {
      const w = hairStyle === 'wavy' ? 2.1 : 1.8;
      px(-4.4, hy, w, 11, hairCol); px(4.6 - w, hy, w, 11, hairCol);   // pass shoulders
      px(-4.4, hy, 0.8, 11, hairHi); px(3.8, hy, 0.8, 11, hairLo);
      if (hairStyle === 'wavy') { for (let i = 0; i < 4; i++) { px(-4.6, hy + 2 + i * 2.5, 1, 1.4, i % 2 ? hairHi : hairLo); px(3.6, hy + 3 + i * 2.5, 1, 1.4, i % 2 ? hairLo : hairHi); } }
    } else if (hairStyle === 'ponytail') {
      px(-4, hy, 1.4, 5, hairCol); px(2.6, hy, 1.4, 5, hairCol);
      px(facing >= 0 ? 3.4 : -4.8, hy + 1, 1.6, 8, hairCol);          // tail behind
    } else if (hairStyle === 'braids') {
      px(-4.2, hy, 1.5, 12, hairCol); px(2.7, hy, 1.5, 12, hairCol);
      for (let i = 0; i < 5; i++) { const c = i % 2 ? hairLo : hairCol; px(-4.2, hy + 1 + i * 2.3, 1.5, 1, mix(c, '#000', 0.2)); px(2.7, hy + 1 + i * 2.3, 1.5, 1, mix(c, '#000', 0.2)); }
      px(-4.2, hy + 12, 1.5, 1.4, '#d9b84a'); px(2.7, hy + 12, 1.5, 1.4, '#d9b84a'); // miçangas
    } else if (hairStyle === 'bun') {
      px(-4, hy, 1.4, 4, hairCol); px(2.6, hy, 1.4, 4, hairCol);
      px(-1.4, hy - 3, 2.8, 2.4, hairCol); px(-1.4, hy - 3, 2.8, 1, hairHi); // top bun
    }
  } else {
    px(-4, hy + 2, 1.2, 3, hairCol); px(2.8, hy + 2, 1.2, 3, hairCol); // side fringe only
  }
  if (p.hat) {
    const ht = p.hat, htHi = shade(ht, 0.16), htLo = shade(ht, -0.2);
    px(-4.6, hy - 1.5, 9.2, 2.6, ht);
    px(-4.6, hy - 1.5, 9.2, 0.9, htHi);
    px(-2.2, hy - 3.2, 4.6, 2, ht); px(-2.2, hy - 3.2, 4.6, 0.7, htHi);
    px(0.4, hy + 0.6, 3.4, 0.9, htLo); // visor toward facing
    px(-0.4, hy - 2.2, 1.6, 1.4, '#d9b84a'); // insignia
  }

  // ---------- FACE ----------
  const eyeC = '#22262f';
  px(-1.9, hy + 3.4, 1.3, 1.6, eyeC);
  px(0.8, hy + 3.4, 1.3, 1.6, eyeC);
  px(-1.9, hy + 3.2, 1.3, 0.5, hairLo); px(0.8, hy + 3.2, 1.3, 0.5, hairLo); // brows
  if (p.glasses) {
    ctx.save(); ctx.strokeStyle = '#20242c'; ctx.lineWidth = Math.max(1, s * 0.5);
    ctx.strokeRect(x + facing * -2.4 * s - (facing < 0 ? 4.2 * s : 0), y + (hy + 3) * sy, 2.2 * s, 2.2 * sy);
    ctx.strokeRect(x + facing * 0.3 * s - (facing < 0 ? 2.2 * s : 0), y + (hy + 3) * sy, 2.2 * s, 2.2 * sy);
    ctx.restore();
  }
  if (p.beard) { px(-3, hy + 5.4, 6, 2.6, hairLo); px(-1.6, hy + 7.4, 3.2, 1.2, hairLo); }
  if (p.mustache) { px(-2, hy + 5.5, 4, 1.2, hairLo); px(-2, hy + 5.5, 1, 1.2, hairCol); }
  // nose hint
  px(-0.3, hy + 4.6, 1, 1.4, skinLo);
  // mouth
  if (pose === 'talk' && Math.sin(frame * 0.5) > 0) px(-0.8, hy + 6.4, 2.6, 1.3, '#7a3b34');
  else px(-0.8, hy + 6.6, 2.4, 0.8, shade(p.skin, -0.3));
}

// Portrait bust for dialogue box. x,y = top-left of the square region, size = px.
export function drawPortrait(ctx: Ctx, p: CharPalette, x: number, y: number, size: number, emotion: string) {
  const u = size / 24;
  const px = (dx: number, dy: number, w: number, h: number, c: string) =>
    rect(ctx, x + dx * u, y + dy * u, w * u, h * u, c);
  const outfit = p.outfit || 'shirt';
  const hairStyle = p.hairStyle || (outfit === 'dress' ? 'long' : 'short');
  const hairCol = hairStyle === 'gray' ? mix(p.hair, '#cfc9bd', 0.65) : p.hair;
  const hairHi = shade(hairCol, 0.18), hairLo = shade(hairCol, -0.28);
  const skinHi = shade(p.skin, 0.14), skinLo = shade(p.skin, -0.2);

  // background gradient
  const g = ctx.createLinearGradient(x, y, x, y + size);
  g.addColorStop(0, '#232a36'); g.addColorStop(1, '#141922');
  ctx.fillStyle = g; ctx.fillRect(x, y, size, size);

  // shoulders / clothing
  const cloth = outfit === 'robe' ? p.pants : p.shirt;
  px(2, 17, 20, 9, cloth);
  px(2, 17, 20, 1.4, shade(cloth, 0.16));
  px(2, 17, 3, 9, shade(cloth, 0.1)); px(19, 17, 3, 9, shade(cloth, -0.22));
  if (outfit === 'suit') {
    const jk = shade(cloth, -0.3);
    px(2, 17, 7, 9, jk); px(15, 17, 7, 9, jk);
    px(10, 17, 4, 9, '#e8e4d8');
    if (p.tie) px(11, 18, 2, 8, p.tie);
  } else if (outfit === 'uniform') {
    px(2, 18, 20, 1.6, p.accent || '#3a3020');
    px(3.5, 18.2, 2, 1.4, '#e0c25a'); px(18.5, 18.2, 2, 1.4, '#e0c25a');
  } else if (outfit === 'apron') {
    px(8, 18, 8, 8, shade(p.accent || cloth, 0.2));
  } else if (p.accent) px(2, 18.4, 20, 1.4, p.accent);

  // neck
  px(9.5, 13.5, 5, 4.5, skinLo);
  px(9.5, 13.5, 5, 1, shade(p.skin, -0.05));
  // head
  px(6, 3.5, 12, 12, p.skin);
  px(6, 3.5, 2, 12, skinHi); px(16, 3.5, 2, 12, skinLo);
  px(6, 3.5, 12, 1.2, skinHi); px(6, 14.3, 12, 1.2, skinLo);
  px(5, 7, 1, 3, skinLo); px(18, 7, 1, 3, skinLo); // ears

  // hair
  if (hairStyle === 'afro') {
    px(3.5, -1.5, 17, 9, hairCol); px(3.5, -1.5, 17, 2, hairHi);
    px(3, 4, 3, 9, hairCol); px(18, 4, 3, 9, hairCol);
    for (let i = 0; i < 6; i++) px(3.5 + i * 2.9, -2.5, 3, 3, i % 2 ? hairHi : hairCol);
  } else if (hairStyle === 'curly') {
    px(4.4, 0.5, 15.2, 5, hairCol);
    for (let i = 0; i < 6; i++) px(4.4 + i * 2.6, -0.5, 3, 3, i % 2 ? hairHi : hairCol);
    px(4, 3.5, 2.4, 7, hairCol); px(17.6, 3.5, 2.4, 7, hairCol);
  } else if (hairStyle !== 'bald') {
    px(5.2, 2, 13.6, 4, hairCol); px(5.2, 2, 13.6, 1.2, hairHi);
    if (hairStyle === 'short' || hairStyle === 'gray') {
      px(5.2, 3.5, 2, 5, hairCol); px(16.8, 3.5, 2, 5, hairCol);
      if (hairStyle === 'gray') px(8, 3.2, 8, 1.2, p.skin);
    } else if (hairStyle === 'buzz') {
      px(5.2, 2, 13.6, 3, mix(hairCol, p.skin, 0.25));
      px(5.4, 3.5, 1.4, 3, hairCol); px(17.2, 3.5, 1.4, 3, hairCol);
    } else if (hairStyle === 'long' || hairStyle === 'wavy') {
      px(4.4, 3, 2.6, 14, hairCol); px(17, 3, 2.6, 14, hairCol);
      px(4.4, 3, 1, 14, hairHi); px(19, 3, 0.6, 14, hairLo);
      if (hairStyle === 'wavy') for (let i = 0; i < 4; i++) { px(4.2, 5 + i * 3, 1.2, 1.6, i % 2 ? hairHi : hairLo); px(18.6, 6 + i * 3, 1.2, 1.6, i % 2 ? hairLo : hairHi); }
    } else if (hairStyle === 'ponytail') {
      px(5.2, 3.5, 2, 6, hairCol); px(16.8, 3.5, 2, 6, hairCol);
      px(2.6, 4, 2, 10, hairCol);
    } else if (hairStyle === 'braids') {
      px(4.4, 3, 2.2, 15, hairCol); px(17.4, 3, 2.2, 15, hairCol);
      for (let i = 0; i < 6; i++) { px(4.4, 4 + i * 2.3, 2.2, 1, mix(hairLo, '#000', 0.2)); px(17.4, 4 + i * 2.3, 2.2, 1, mix(hairLo, '#000', 0.2)); }
    } else if (hairStyle === 'bun') {
      px(5.2, 3.5, 2, 5, hairCol); px(16.8, 3.5, 2, 5, hairCol);
      px(9.5, -0.5, 5, 3, hairCol); px(9.5, -0.5, 5, 1, hairHi);
    }
  } else { px(5.5, 6, 1.6, 4, hairCol); px(16.9, 6, 1.6, 4, hairCol); }
  if (p.hat) {
    px(4.6, 1.5, 14.8, 3.2, p.hat); px(4.6, 1.5, 14.8, 1, shade(p.hat, 0.16));
    px(8, -0.6, 8, 2.6, p.hat); px(10.5, -0.2, 3, 1.4, '#d9b84a');
  }

  // expression-driven brows + mouth
  let browY = 7.2, browTilt = 0, mouthW = 4, mouthY = 12.6, mouthH = 1.3, mc = '#7a3b34';
  if (emotion === 'worried') { browY = 6.8; browTilt = 0.8; mouthW = 3; mouthY = 13; }
  else if (emotion === 'afraid') { browY = 6.2; browTilt = 1.2; mouthH = 2.4; mouthW = 3; }
  else if (emotion === 'determined') { browY = 7.8; browTilt = -0.6; mouthW = 5; }
  else if (emotion === 'sad') { browY = 6.6; browTilt = 1; mouthY = 13.4; }
  else if (emotion === 'surprised') { browY = 5.8; mouthH = 3; mouthW = 3; mouthY = 12.4; }
  else if (emotion === 'angry') { browY = 7.4; browTilt = -1.2; mc = '#6a2f2a'; }
  // brows
  px(7.5, browY + browTilt, 3.6, 1, hairLo);
  px(12.8, browY - browTilt, 3.6, 1, hairLo);
  // eyes with catchlight
  px(8, 9, 2.2, 2.4, '#22262f'); px(13.6, 9, 2.2, 2.4, '#22262f');
  px(8.4, 9.2, 0.8, 0.8, '#cfd6df'); px(14, 9.2, 0.8, 0.8, '#cfd6df');
  if (p.glasses) {
    ctx.strokeStyle = '#20242c'; ctx.lineWidth = Math.max(1, u * 0.6);
    ctx.strokeRect(x + 7.4 * u, y + 8.6 * u, 3.2 * u, 3.2 * u);
    ctx.strokeRect(x + 13.2 * u, y + 8.6 * u, 3.2 * u, 3.2 * u);
    ctx.beginPath(); ctx.moveTo(x + 10.6 * u, y + 10 * u); ctx.lineTo(x + 13.2 * u, y + 10 * u); ctx.stroke();
  }
  // nose
  px(11.2, 10.6, 1.4, 1.8, skinLo);
  if (p.beard) { px(7.5, 12.2, 9, 3, hairLo); px(9.5, 14.6, 5, 1.4, hairLo); }
  if (p.mustache) { px(9, 11.6, 6, 1.4, hairLo); px(9, 11.6, 1.4, 1.4, hairCol); }
  if (p.scarf) { px(2, 16, 20, 3, p.scarf); px(2, 16, 20, 1, shade(p.scarf, 0.15)); px(10, 17, 2.4, 6, shade(p.scarf, -0.1)); }
  // mouth
  px(12 - mouthW / 2, mouthY, mouthW, mouthH, mc);
  // rim light
  px(6, 3.5, 0.8, 12, shade(p.skin, 0.3));
}
