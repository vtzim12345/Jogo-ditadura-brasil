// Unified keyboard + touch input
export class Input {
  keys: Record<string, boolean> = {};
  justPressed: Record<string, boolean> = {};
  // touch analog axis (-1..1) and action flags
  axisX = 0;
  touchInteract = false;
  touchInteractJust = false;
  // ações de toque dedicadas (botões na tela)
  touchJump = false; touchJumpJust = false;
  touchAttack = false; touchAttackJust = false;
  touchCrouch = false;
  touchRun = false;
  pointer = { x: 0, y: 0, down: false, justDown: false, dy: 0, prevY: 0 };
  wheel = 0;
  private clickTargets: { x: number; y: number; w: number; h: number; id: string }[] = [];
  lastClickId: string | null = null;

  constructor(canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (!this.keys[k]) this.justPressed[k] = true;
      this.keys[k] = true;
      if (['arrowleft','arrowright','arrowup','arrowdown',' '].includes(k)) e.preventDefault();
    }, { passive: false });
    window.addEventListener('keyup', (e) => { this.keys[e.key.toLowerCase()] = false; });

    const rectPos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * canvas.width,
        y: ((e.clientY - r.top) / r.height) * canvas.height
      };
    };
    canvas.addEventListener('pointerdown', (e) => {
      const p = rectPos(e); this.pointer.x = p.x; this.pointer.y = p.y;
      this.pointer.down = true; this.pointer.justDown = true; this.pointer.prevY = p.y;
    });
    canvas.addEventListener('pointermove', (e) => {
      const p = rectPos(e); this.pointer.x = p.x; this.pointer.y = p.y;
    });
    window.addEventListener('pointerup', () => { this.pointer.down = false; });
    canvas.addEventListener('wheel', (e) => { this.wheel += e.deltaY; e.preventDefault(); }, { passive: false });
  }

  down(...codes: string[]) { return codes.some((c) => this.keys[c]); }
  pressed(code: string) { return !!this.justPressed[code]; }

  // register a clickable rect this frame; returns true if pointer just clicked inside
  hit(x: number, y: number, w: number, h: number, id = ''): boolean {
    const p = this.pointer;
    const inside = p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;
    if (inside && p.justDown) { this.lastClickId = id; return true; }
    return false;
  }
  hover(x: number, y: number, w: number, h: number): boolean {
    const p = this.pointer;
    return p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;
  }

  dragDelta(): number {
    if (this.pointer.down) { const d = this.pointer.y - this.pointer.prevY; this.pointer.prevY = this.pointer.y; return d; }
    this.pointer.prevY = this.pointer.y; return 0;
  }
  endFrame() {
    this.justPressed = {};
    this.pointer.justDown = false;
    this.touchInteractJust = false;
    this.touchJumpJust = false;
    this.touchAttackJust = false;
    this.wheel = 0;
  }
}
