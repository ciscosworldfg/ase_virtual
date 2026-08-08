/**
 * Extensible engine audio system.
 *
 * IMPORTANT: every sound produced here is SYNTHESIZED with the Web Audio API.
 * These are training placeholders, not recordings of real vehicles. The
 * interface is shaped so real recorded samples can be swapped in later.
 */

export interface AudioParams {
  rpm: number;
  throttle: number;
  load: number;
  running: boolean;
  profileId: string;
}

export class EngineAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private osc: OscillatorNode | null = null;
  private sub: OscillatorNode | null = null;
  private oscGain: GainNode | null = null;
  private noise: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private started = false;

  start() {
    if (this.started) return;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 40;
    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.25;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    osc.connect(oscGain).connect(lp).connect(master);

    const sub = ctx.createOscillator();
    sub.type = "square";
    sub.frequency.value = 20;
    const subGain = ctx.createGain();
    subGain.gain.value = 0.08;
    sub.connect(subGain).connect(master);

    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2600;
    noise.connect(noiseGain).connect(bp).connect(master);

    osc.start();
    sub.start();
    noise.start();

    this.ctx = ctx;
    this.master = master;
    this.osc = osc;
    this.sub = sub;
    this.oscGain = oscGain;
    this.noise = noise;
    this.noiseGain = noiseGain;
    this.started = true;
  }

  update(p: AudioParams) {
    if (!this.ctx || !this.master || !this.osc || !this.sub || !this.oscGain || !this.noiseGain)
      return;
    const t = this.ctx.currentTime;
    const target = p.running ? 0.14 + (p.throttle / 100) * 0.12 : 0.0001;
    this.master.gain.setTargetAtTime(target, t, 0.12);

    const base = Math.max(18, (p.rpm / 60) * 2);
    this.osc.frequency.setTargetAtTime(base, t, 0.08);
    this.sub.frequency.setTargetAtTime(base / 2, t, 0.08);

    // failure-driven texture
    const hiss =
      p.profileId === "lean-rough-idle" ? 0.05 + (1 - p.throttle / 100) * 0.05 : 0;
    const misfireTexture =
      p.profileId === "load-misfire" ? (p.load / 100) * 0.09 : 0;
    const whine = p.profileId === "alt-bearing-whine" ? 0.03 : 0;
    const brake = p.profileId === "brake-pulsation" ? 0.02 : 0;
    this.noiseGain.gain.setTargetAtTime(
      p.running ? hiss + misfireTexture + whine + brake : 0,
      t,
      0.15,
    );

    // rough combustion modulation
    this.oscGain.gain.setTargetAtTime(
      p.profileId === "lean-rough-idle" && p.throttle < 10 ? 0.16 : 0.25,
      t,
      0.1,
    );
  }

  stop() {
    if (!this.ctx) return;
    try {
      this.osc?.stop();
      this.sub?.stop();
      this.noise?.stop();
      void this.ctx.close();
    } catch {
      /* already closed */
    }
    this.ctx = null;
    this.started = false;
  }
}
