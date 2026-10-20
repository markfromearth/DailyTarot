export class RitualAudio {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const bufferSize = Math.floor(ctx.sampleRate * 0.08); // 80ms of friction noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Natural textured paper grain noise
      data[i] = (Math.random() * 2 - 1) * 0.65;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  public playShuffleChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [528, 660, 792, 1056];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.04, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.95);
    });
  }

  /**
   * Plays a crisp, physical card "flick" / "peel" sound mimicking peeling a card from a deck.
   * Combines high-passed snap click, resonant paper friction slide ("shwip"), and a subtle low-mid cardstock body thud.
   */
  public playCardSelect(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Paper Friction / Slide Whoosh ("shwip" - card sliding against cardstock)
    try {
      const noiseBuffer = this.getNoiseBuffer(ctx);
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.Q.setValueAtTime(1.8, now);
      bandpass.frequency.setValueAtTime(2600, now);
      bandpass.frequency.exponentialRampToValueAtTime(1100, now + 0.055);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.003);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      noiseNode.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseNode.start(now);
      noiseNode.stop(now + 0.065);
    } catch {
      // BufferSource fallback
    }

    // 2. Crisp Card Edge Snap / Flick Transient (high-frequency click)
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(1800, now);
    snapOsc.frequency.exponentialRampToValueAtTime(450, now + 0.014);

    snapGain.gain.setValueAtTime(0.0001, now);
    snapGain.gain.linearRampToValueAtTime(0.06, now + 0.002);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.018);

    // 3. Cardstock Body Thud (low-mid resonance of heavy linen tarot card)
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(190, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(85, now + 0.03);

    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.linearRampToValueAtTime(0.04, now + 0.003);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.038);
  }
}

export const ritualAudio = new RitualAudio();
