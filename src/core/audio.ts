// Synthesized audio only (WebAudio) - no copyrighted material.
// Ambient pads + simple SFX built from oscillators/noise.
export class AudioSys {
  ctx: AudioContext | null = null;
  master!: GainNode; musicGain!: GainNode; sfxGain!: GainNode;
  musicVol = 0.5; sfxVol = 0.7; enabled = true;
  private musicNodes: OscillatorNode[] = [];
  private started = false;
  private currentMood = '';

  init() {
    if (this.ctx) return;
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const c: AudioContext = new AC();
    this.ctx = c;
    this.master = c.createGain(); this.master.gain.value = 1;
    this.musicGain = c.createGain(); this.musicGain.gain.value = this.musicVol;
    this.sfxGain = c.createGain(); this.sfxGain.gain.value = this.sfxVol;
    this.musicGain.connect(this.master); this.sfxGain.connect(this.master);
    this.master.connect(c.destination);
  }
  resume() { this.ctx?.resume(); }

  setMusicVol(v: number){ this.musicVol=v; if(this.musicGain) this.musicGain.gain.value = this.enabled? v:0; }
  setSfxVol(v: number){ this.sfxVol=v; if(this.sfxGain) this.sfxGain.gain.value = v; }
  setEnabled(on: boolean){ this.enabled=on; if(this.musicGain) this.musicGain.gain.value = on? this.musicVol:0; if(this.master) this.master.gain.value = on?1:0; }

  // ambient drone chord per mood
  music(mood: string) {
    if (!this.ctx || this.currentMood === mood) return;
    this.currentMood = mood;
    this.stopMusic();
    const chords: Record<string, number[]> = {
      calm:   [130.8, 164.8, 196.0],   // C minor-ish warm
      tense:  [110.0, 138.6, 155.6],   // darker
      hope:   [146.8, 185.0, 220.0],   // brighter
      heavy:  [ 98.0, 116.5, 130.8],   // low heavy
      menu:   [123.5, 155.6, 185.0]
    };
    const notes = chords[mood] || chords.menu;
    notes.forEach((f, i) => {
      const o = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      o.type = i === 0 ? 'triangle' : 'sine';
      o.frequency.value = f;
      g.gain.value = 0.0;
      o.connect(g); g.connect(this.musicGain);
      o.start();
      g.gain.linearRampToValueAtTime(0.12 / (i + 1), this.ctx!.currentTime + 2.5);
      // slow vibrato via LFO
      const lfo = this.ctx!.createOscillator(); const lg = this.ctx!.createGain();
      lfo.frequency.value = 0.08 + i * 0.03; lg.gain.value = 1.5;
      lfo.connect(lg); lg.connect(o.frequency); lfo.start();
      this.musicNodes.push(o, lfo);
    });
  }
  stopMusic() {
    this.musicNodes.forEach((n) => { try { n.stop(); } catch {} });
    this.musicNodes = [];
    this.currentMood = '';
  }

  private blip(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.3) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol; o.connect(g); g.connect(this.sfxGain);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
    o.stop(this.ctx.currentTime + dur);
  }
  sfxType() { this.blip(420 + Math.random() * 120, 0.03, 'square', 0.06); }
  sfxSelect() { this.blip(660, 0.08, 'square', 0.2); }
  sfxConfirm() { this.blip(520, 0.09, 'square', 0.22); setTimeout(() => this.blip(780, 0.1, 'square', 0.2), 70); }
  sfxStep() { this.blip(90 + Math.random()*20, 0.05, 'triangle', 0.08); }
  sfxDoor() { this.blip(140, 0.18, 'sawtooth', 0.18); }
  sfxAlert() { this.blip(300, 0.15, 'sawtooth', 0.25); setTimeout(()=>this.blip(240,0.2,'sawtooth',0.22),120); }
  sfxStamp() { this.blip(120, 0.05, 'square', 0.3); setTimeout(()=>this.blip(70,0.12,'square',0.25),40); }

  // ---- feedback de interação ----
  // falar com NPC: duas notas quentes e suaves ("conversa")
  sfxTalk() { this.blip(300, 0.09, 'triangle', 0.16); setTimeout(() => this.blip(360, 0.1, 'triangle', 0.14), 80); }
  // observar/examinar objeto: um toque curto e discreto
  sfxLook() { this.blip(560, 0.06, 'sine', 0.12); }
  // item/recompensa obtida: dois tons ascendentes e brilhantes
  sfxPickup() { this.blip(680, 0.07, 'square', 0.18); setTimeout(() => this.blip(1020, 0.1, 'triangle', 0.16), 70); }
  // abrir gaveta/móvel: deslize de madeira (ruído filtrado curto)
  sfxDrawer() { this.noiseHit(0.22, 900, 0.18); setTimeout(() => this.blip(140, 0.08, 'sawtooth', 0.12), 30); }
  // sintonizar rádio: chiado curto + bip de sintonia
  sfxRadio() { this.noiseHit(0.18, 2600, 0.1); setTimeout(() => this.blip(720, 0.06, 'square', 0.1), 60); setTimeout(() => this.blip(920, 0.05, 'sine', 0.08), 140); }

  // rajada curta de ruído filtrado (madeira/estática) reutilizável
  private noiseHit(dur: number, cutoff: number, vol: number) {
    if (!this.ctx) return;
    const c = this.ctx;
    const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const env = Math.pow(1 - i / data.length, 2);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = c.createBufferSource(); src.buffer = buf;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cutoff;
    const g = c.createGain(); g.gain.value = vol;
    src.connect(lp); lp.connect(g); g.connect(this.sfxGain);
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    src.start(); src.stop(c.currentTime + dur);
  }

  // bright sparkle burst (puzzle solved / discovery)
  sfxSpark() {
    this.blip(880, 0.06, 'triangle', 0.14);
    setTimeout(() => this.blip(1180, 0.07, 'triangle', 0.12), 55);
    setTimeout(() => this.blip(1560, 0.08, 'sine', 0.1), 120);
  }

  // filtered noise rumble for thunder / distant blast (visual-effect cue)
  sfxThunder(intensity = 1) {
    if (!this.ctx) return;
    const c = this.ctx;
    const dur = 0.9 + intensity * 0.6;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const env = Math.pow(1 - i / data.length, 2);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = c.createBufferSource(); src.buffer = buf;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.value = 220 + intensity * 120;
    const g = c.createGain(); g.gain.value = 0.32 * intensity;
    src.connect(lp); lp.connect(g); g.connect(this.sfxGain);
    g.gain.setValueAtTime(0.32 * intensity, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    src.start();
    src.stop(c.currentTime + dur);
  }
}
