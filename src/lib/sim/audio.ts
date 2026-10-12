/**
 * Engine audio system.
 *
 * IMPORTANT: every sound produced here is SYNTHESIZED with the Web Audio API.
 * These are training placeholders, not recordings of real vehicles. The
 * interface is shaped so real recorded samples can be swapped in later.
 *
 * The model is built the way an engine actually makes sound:
 *   firing frequency = rpm / 60 * cylinders / 2   (4-stroke)
 * A harmonic-rich periodic wave at that frequency gives the combustion pulse
 * train, a half-order oscillator adds the crank-rotation beat that makes V8s
 * lope, filtered noise supplies intake and exhaust turbulence, and separate
 * noise beds add road and wind as speed rises. Failure profiles modulate the
 * same signal path instead of layering unrelated tones.
 *
 * Spatialisation: the exhaust is split into left and right tailpipe paths with
 * a small inter-pipe delay and detune so it images across the stereo field,
 * intake sits slightly right of centre, road noise is wide, and a
 * cabin/exterior mix plus distance attenuation model where the listener is
 * standing relative to the vehicle.
 */

export interface AudioParams {
  rpm: number;
  throttle: number;
  load: number;
  speed: number;
  cylinders: number;
  running: boolean;
  profileId: string;
  /** current gear, 1-indexed */
  gear?: number;
  /** true while a shift is in progress — cuts the exhaust and adds the breath */
  shifting?: boolean;
  /** converter slip, 0 locked … 1 fully slipping */
  slip?: number;
  /** propshaft first-order frequency, Hz */
  drivelineHz?: number;
  /** listening position */
  perspective?: "cabin" | "exterior";
  /** distance from the vehicle in metres (exterior listening) */
  distance?: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Harmonic weights of a combustion pulse train — steep, slightly odd-biased. */
function buildEngineWave(ctx: AudioContext, cylinders: number) {
  const n = 32;
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  const bite = cylinders <= 4 ? 1.15 : cylinders >= 8 ? 0.8 : 0.95;
  for (let h = 1; h < n; h++) {
    const decay = Math.pow(h, -1.15 * bite);
    const oddBias = h % 2 === 1 ? 1 : 0.62;
    imag[h] = decay * oddBias;
  }
  return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
}

function noiseBuffer(ctx: AudioContext, brown: boolean) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

export class EngineAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  /** cabin glass/panel damping + distance air absorption */
  private spaceFilter: BiquadFilterNode | null = null;

  private fire: OscillatorNode | null = null;
  private fireDetune: OscillatorNode | null = null;
  private halfOrder: OscillatorNode | null = null;
  private fireGain: GainNode | null = null;
  private halfGain: GainNode | null = null;
  private bodyFilter: BiquadFilterNode | null = null;
  private exhaustPeak: BiquadFilterNode | null = null;
  private pipeLeft: GainNode | null = null;
  private pipeRight: GainNode | null = null;
  private panL: StereoPannerNode | null = null;
  private panR: StereoPannerNode | null = null;

  private intakeGain: GainNode | null = null;
  private intakeFilter: BiquadFilterNode | null = null;
  private roadGain: GainNode | null = null;
  private roadFilter: BiquadFilterNode | null = null;

  private whine: OscillatorNode | null = null;
  private whineGain: GainNode | null = null;

  private modOsc: OscillatorNode | null = null;
  private modDepth: GainNode | null = null;

  /** low-frequency driveline shake, panned centre-rear */
  private driveline: OscillatorNode | null = null;
  private drivelineGain: GainNode | null = null;

  /** cycle-to-cycle combustion variation (cents / gain) */
  private jitterPitch: GainNode | null = null;
  private jitterAmp: GainNode | null = null;
  /** exhaust gas pulses: noise gated at the firing rate */
  private pulseOsc: OscillatorNode | null = null;
  private pulseDepth: GainNode | null = null;
  private chuffGain: GainNode | null = null;
  private chuffFilter: BiquadFilterNode | null = null;
  /** valvetrain tick, heard close to the engine */
  private tickGain: GainNode | null = null;
  private tickOsc: OscillatorNode | null = null;
  /** overrun pops / crackle */
  private popGain: GainNode | null = null;
  /** structure-borne boom inside the cabin */
  private cabinBoom: BiquadFilterNode | null = null;

  private cylinders = 4;
  private started = false;

  start(cylinders = 4) {
    if (this.started) return;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    void ctx.resume();
    this.cylinders = cylinders;

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    const spaceFilter = ctx.createBiquadFilter();
    spaceFilter.type = "lowpass";
    spaceFilter.frequency.value = 18000;
    spaceFilter.Q.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 6;
    comp.attack.value = 0.005;
    comp.release.value = 0.16;
    const cabinBoom = ctx.createBiquadFilter();
    cabinBoom.type = "lowshelf";
    cabinBoom.frequency.value = 140;
    cabinBoom.gain.value = 0;
    master.connect(cabinBoom).connect(spaceFilter).connect(comp).connect(ctx.destination);

    /* ---------------------------------------------------------- combustion */
    const wave = buildEngineWave(ctx, cylinders);
    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = "lowpass";
    bodyFilter.frequency.value = 700;
    bodyFilter.Q.value = 0.7;

    const exhaustPeak = ctx.createBiquadFilter();
    exhaustPeak.type = "peaking";
    exhaustPeak.frequency.value = 96;
    exhaustPeak.Q.value = 1.1;
    exhaustPeak.gain.value = 8;

    const fireGain = ctx.createGain();
    fireGain.gain.value = 0.34;
    bodyFilter.connect(exhaustPeak).connect(fireGain);

    /* ------------------------------------------- stereo tailpipe imaging */
    // left pipe is dry; right pipe runs a short delay and a touch of detune so
    // the two banks beat against each other instead of collapsing to mono
    const panL = ctx.createStereoPanner();
    panL.pan.value = -0.62;
    const pipeLeft = ctx.createGain();
    pipeLeft.gain.value = 0.55;
    fireGain.connect(pipeLeft).connect(panL).connect(master);

    const panR = ctx.createStereoPanner();
    panR.pan.value = 0.62;
    const pipeDelay = ctx.createDelay(0.05);
    pipeDelay.delayTime.value = 0.0062;
    const pipeRight = ctx.createGain();
    pipeRight.gain.value = 0.55;
    fireGain.connect(pipeDelay).connect(pipeRight).connect(panR).connect(master);

    const fire = ctx.createOscillator();
    fire.setPeriodicWave(wave);
    fire.frequency.value = 40;
    fire.connect(bodyFilter);

    const fireDetune = ctx.createOscillator();
    fireDetune.setPeriodicWave(wave);
    fireDetune.frequency.value = 40;
    fireDetune.detune.value = 9;
    const detuneGain = ctx.createGain();
    detuneGain.gain.value = 0.45;
    fireDetune.connect(detuneGain).connect(bodyFilter);

    // half-engine-order: one crank revolution, gives the lope/rumble
    const halfOrder = ctx.createOscillator();
    halfOrder.type = "sine";
    halfOrder.frequency.value = 20;
    const halfGain = ctx.createGain();
    halfGain.gain.value = 0.12;
    halfOrder.connect(halfGain).connect(master);

    /* ------------------------------- combustion jitter (no two firings match) */
    const jitterSrc = ctx.createBufferSource();
    jitterSrc.buffer = noiseBuffer(ctx, false);
    jitterSrc.loop = true;
    const jitterLp = ctx.createBiquadFilter();
    jitterLp.type = "lowpass";
    jitterLp.frequency.value = 9;
    jitterLp.Q.value = 0.3;
    jitterSrc.connect(jitterLp);
    const jitterPitch = ctx.createGain();
    jitterPitch.gain.value = 0;
    jitterLp.connect(jitterPitch);
    jitterPitch.connect(fire.detune);
    jitterPitch.connect(fireDetune.detune);
    const jitterAmp = ctx.createGain();
    jitterAmp.gain.value = 0;
    jitterLp.connect(jitterAmp).connect(fireGain.gain);

    /* ------------------------------- exhaust gas pulses ("chuff"/"burble") */
    const chuffSrc = ctx.createBufferSource();
    chuffSrc.buffer = noiseBuffer(ctx, false);
    chuffSrc.loop = true;
    const chuffFilter = ctx.createBiquadFilter();
    chuffFilter.type = "bandpass";
    chuffFilter.frequency.value = 220;
    chuffFilter.Q.value = 0.8;
    const chuffGain = ctx.createGain();
    chuffGain.gain.value = 0;
    chuffSrc.connect(chuffFilter).connect(chuffGain).connect(exhaustPeak);
    const pulseOsc = ctx.createOscillator();
    pulseOsc.type = "sawtooth";
    pulseOsc.frequency.value = 40;
    const pulseDepth = ctx.createGain();
    pulseDepth.gain.value = 0;
    pulseOsc.connect(pulseDepth).connect(chuffGain.gain);

    /* ------------------------------------------------------ valvetrain tick */
    const tickSrc = ctx.createBufferSource();
    tickSrc.buffer = noiseBuffer(ctx, false);
    tickSrc.loop = true;
    const tickHp = ctx.createBiquadFilter();
    tickHp.type = "bandpass";
    tickHp.frequency.value = 4200;
    tickHp.Q.value = 2;
    const tickGain = ctx.createGain();
    tickGain.gain.value = 0;
    const tickOsc = ctx.createOscillator();
    tickOsc.type = "square";
    tickOsc.frequency.value = 20;
    const tickDepth = ctx.createGain();
    tickDepth.gain.value = 1;
    tickOsc.connect(tickDepth).connect(tickGain.gain);
    const tickPan = ctx.createStereoPanner();
    tickPan.pan.value = 0.1;
    tickSrc.connect(tickHp).connect(tickGain).connect(tickPan).connect(master);

    /* ------------------------------------------------- overrun pops/crackle */
    const popSrc = ctx.createBufferSource();
    popSrc.buffer = noiseBuffer(ctx, false);
    popSrc.loop = true;
    const popFilter = ctx.createBiquadFilter();
    popFilter.type = "bandpass";
    popFilter.frequency.value = 650;
    popFilter.Q.value = 0.7;
    const popGain = ctx.createGain();
    popGain.gain.value = 0;
    popSrc.connect(popFilter).connect(popGain).connect(exhaustPeak);

    /* -------------------------------------------------------------- intake */
    const intake = ctx.createBufferSource();
    intake.buffer = noiseBuffer(ctx, false);
    intake.loop = true;
    const intakeFilter = ctx.createBiquadFilter();
    intakeFilter.type = "bandpass";
    intakeFilter.frequency.value = 1400;
    intakeFilter.Q.value = 0.9;
    const intakeGain = ctx.createGain();
    intakeGain.gain.value = 0;
    const intakePan = ctx.createStereoPanner();
    intakePan.pan.value = 0.28;
    intake.connect(intakeFilter).connect(intakeGain).connect(intakePan).connect(master);

    /* ---------------------------------------------------------- road/wind */
    const road = ctx.createBufferSource();
    road.buffer = noiseBuffer(ctx, true);
    road.loop = true;
    const roadFilter = ctx.createBiquadFilter();
    roadFilter.type = "lowpass";
    roadFilter.frequency.value = 500;
    const roadGain = ctx.createGain();
    roadGain.gain.value = 0;
    road.connect(roadFilter).connect(roadGain);
    // wide stereo bed: same source, opposite pans, one side delayed
    const roadPanL = ctx.createStereoPanner();
    roadPanL.pan.value = -0.85;
    const roadPanR = ctx.createStereoPanner();
    roadPanR.pan.value = 0.85;
    const roadDelay = ctx.createDelay(0.05);
    roadDelay.delayTime.value = 0.011;
    roadGain.connect(roadPanL).connect(master);
    roadGain.connect(roadDelay).connect(roadPanR).connect(master);

    /* -------------------------------------------------- accessory bearing */
    const whine = ctx.createOscillator();
    whine.type = "triangle";
    whine.frequency.value = 900;
    const whineGain = ctx.createGain();
    whineGain.gain.value = 0;
    const whinePan = ctx.createStereoPanner();
    whinePan.pan.value = -0.35;
    whine.connect(whineGain).connect(whinePan).connect(master);

    /* --------------------------------------------- driveline shake (rear) */
    const driveline = ctx.createOscillator();
    driveline.type = "sine";
    driveline.frequency.value = 18;
    const drivelineGain = ctx.createGain();
    drivelineGain.gain.value = 0;
    driveline.connect(drivelineGain).connect(master);

    /* ------------------------------------ amplitude modulation (roughness) */
    const modOsc = ctx.createOscillator();
    modOsc.type = "sine";
    modOsc.frequency.value = 8;
    const modDepth = ctx.createGain();
    modDepth.gain.value = 0;
    modOsc.connect(modDepth).connect(fireGain.gain);

    fire.start();
    fireDetune.start();
    halfOrder.start();
    intake.start();
    road.start();
    whine.start();
    driveline.start();
    modOsc.start();
    jitterSrc.start();
    chuffSrc.start();
    pulseOsc.start();
    tickSrc.start();
    tickOsc.start();
    popSrc.start();

    Object.assign(this, {
      ctx,
      master,
      spaceFilter,
      fire,
      fireDetune,
      halfOrder,
      fireGain,
      halfGain,
      bodyFilter,
      exhaustPeak,
      pipeLeft,
      pipeRight,
      panL,
      panR,
      intakeGain,
      intakeFilter,
      roadGain,
      roadFilter,
      whine,
      whineGain,
      driveline,
      drivelineGain,
      modOsc,
      modDepth,
      jitterPitch,
      jitterAmp,
      pulseOsc,
      pulseDepth,
      chuffGain,
      chuffFilter,
      tickGain,
      tickOsc,
      popGain,
      cabinBoom,
      started: true,
    });
  }

  update(p: AudioParams) {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.fire || !this.fireDetune || !this.halfOrder) return;
    const t = ctx.currentTime;
    const cyl = Math.max(2, p.cylinders || this.cylinders);
    const throttle = p.throttle / 100;
    const load = clamp(p.load / 100, 0, 1);
    const shifting = !!p.shifting;
    const slip = clamp(p.slip ?? 0, 0, 1);

    // 4-stroke firing frequency
    const fireHz = clamp((p.rpm / 60) * (cyl / 2), 14, 420);
    // revs glide rather than jump; a touch slower while the converter slips so
    // the note "floats" instead of snapping between gears
    const glide = shifting ? 0.09 : 0.04 + slip * 0.05;
    this.fire.frequency.setTargetAtTime(fireHz, t, glide);
    this.fireDetune.frequency.setTargetAtTime(fireHz, t, glide);
    this.halfOrder.frequency.setTargetAtTime(clamp(p.rpm / 120, 8, 120), t, glide + 0.02);

    this.pulseOsc?.frequency.setTargetAtTime(fireHz, t, glide);
    this.tickOsc?.frequency.setTargetAtTime(clamp((p.rpm / 120) * cyl, 4, 400), t, glide);

    // Real combustion varies cycle to cycle: idle wanders more (lumpy, alive),
    // load evens it out. A perfect oscillator is what makes synth engines buzz.
    const run = p.running ? 1 : 0;
    const idleness = clamp(1 - (p.rpm - 600) / 2400, 0, 1) * (1 - throttle * 0.7);
    this.jitterPitch?.gain.setTargetAtTime(run * (6 + idleness * 28), t, 0.2);
    this.jitterAmp?.gain.setTargetAtTime(run * (0.03 + idleness * 0.09), t, 0.2);

    // Exhaust is gas pulses, not a pure tone: noise gated at the firing rate.
    // Dominant at idle/light load (burble); under throttle the pulse merges into
    // a broadband roar centred higher.
    this.chuffFilter?.frequency.setTargetAtTime(180 + throttle * 420 + (p.rpm / 1000) * 60, t, 0.1);
    const chuff = run * (0.18 + throttle * 0.22);
    this.chuffGain?.gain.setTargetAtTime(chuff * 0.5, t, 0.1);
    this.pulseDepth?.gain.setTargetAtTime(chuff * 0.5, t, 0.1);

    /* --------------------------------------------- perspective / distance */
    const cabin = (p.perspective ?? "cabin") === "cabin";
    const distance = clamp(p.distance ?? (cabin ? 1 : 6), 1, 40);
    // inverse-distance law (-6 dB per doubling), 2 m reference
    const attenuation = cabin ? 0.85 : clamp(2 / distance, 0.05, 1);
    // cabin glass rolls off the top end; outside, air absorption is gentle and
    // only noticeable past ~10 m
    const spaceHz = cabin ? 3200 : clamp(16000 - distance * 260, 5000, 16000);
    this.spaceFilter?.frequency.setTargetAtTime(spaceHz, t, 0.2);
    // inside, the firewall passes mostly low-frequency structure-borne boom
    this.cabinBoom?.gain.setTargetAtTime(cabin ? 5 : 0, t, 0.2);

    // valve tick: only audible with the hood near you and the engine light
    const tickLevel = cabin ? 0.004 : clamp(0.02 * (2 / distance), 0, 0.02);
    this.tickGain?.gain.setTargetAtTime(run * tickLevel * (1 - throttle * 0.6), t, 0.15);

    // overrun: throttle shut at high revs → unburnt fuel pops in the exhaust
    if (this.popGain && p.running && throttle < 0.03 && p.rpm > 2200 && !shifting) {
      const pops = Math.random() < 0.55 ? 1 + Math.floor(Math.random() * 2) : 0;
      for (let i = 0; i < pops; i++) {
        const at = t + Math.random() * 0.09;
        const peak = 0.25 + Math.random() * 0.35;
        this.popGain.gain.setValueAtTime(peak, at);
        this.popGain.gain.setTargetAtTime(0, at + 0.004, 0.012);
      }
    }

    // stereo image: inside, both pipes sit behind you (narrow); outside up
    // close the pipes are wide apart, and the image collapses toward a point
    // source as you walk away
    const width = cabin ? 0.28 : clamp(0.9 - (distance - 1) * 0.03, 0.15, 0.9);
    this.panL?.pan.setTargetAtTime(-width, t, 0.2);
    this.panR?.pan.setTargetAtTime(width, t, 0.2);

    // overall level: idle is a quiet burble, throttle opens it up ~10 dB.
    // With the engine off but the car still rolling you still hear tyres/wind.
    const rolling = clamp(p.speed / 140, 0, 1);
    const shiftDuck = shifting ? 0.55 : 1;
    const level = p.running
      ? (0.07 + throttle * 0.28 + load * 0.06) * shiftDuck * attenuation
      : Math.max(0.0001, rolling * 0.08 * attenuation);
    this.master.gain.setTargetAtTime(level, t, shifting ? 0.04 : 0.1);

    // the airbox/exhaust brighten as the throttle plate opens
    this.bodyFilter?.frequency.setTargetAtTime(
      900 + throttle * 2800 * (shifting ? 0.5 : 1) + (p.rpm / 1000) * 260,
      t,
      shifting ? 0.05 : 0.09,
    );
    this.exhaustPeak?.gain.setTargetAtTime(6 + throttle * 5 - (shifting ? 3 : 0), t, 0.1);
    this.halfGain?.gain.setTargetAtTime(p.running ? 0.05 + (1 - throttle) * 0.03 : 0, t, 0.1);

    // pipes: tighter stereo image inside the cabin, wider from outside, and
    // silent with the engine shut off so only tyre/wind noise remains
    const combustion = p.running ? 1 : 0;
    const pipeBalance = 0.5 + Math.sin(p.rpm / 900) * 0.04;
    this.pipeLeft?.gain.setTargetAtTime(
      (cabin ? 0.5 : 0.62) * pipeBalance * 2 * combustion,
      t,
      0.15,
    );
    this.pipeRight?.gain.setTargetAtTime(
      (cabin ? 0.5 : 0.62) * (1 - pipeBalance) * 2 * combustion,
      t,
      0.15,
    );

    // intake roar tracks rpm and throttle; the shift itself adds the short
    // "breath" of air as the throttle is momentarily unloaded
    this.intakeFilter?.frequency.setTargetAtTime(900 + (p.rpm / 1000) * 700, t, 0.1);
    const leanHiss = p.profileId === "lean-rough-idle" ? 0.045 * (1 - throttle) : 0;
    const vacuumHiss = p.profileId === "vacuum-leak" ? 0.05 * (1 - throttle) : 0;
    const shiftBreath = shifting ? 0.03 * throttle : 0;
    this.intakeGain?.gain.setTargetAtTime(
      p.running
        ? (0.012 + throttle * 0.055 + leanHiss + vacuumHiss + shiftBreath) * (cabin ? 0.7 : 1.1)
        : 0,
      t,
      shifting ? 0.06 : 0.12,
    );

    // tire and wind noise — dominant in the cabin, falls away outside
    const spd = clamp(p.speed / 140, 0, 1);
    this.roadFilter?.frequency.setTargetAtTime(320 + spd * 1400, t, 0.15);
    this.roadGain?.gain.setTargetAtTime(spd * (cabin ? 0.1 : 0.05), t, 0.15);

    // accessory / bearing tones
    const bearing = p.profileId === "alt-bearing-whine" ? 0.02 + load * 0.015 : 0;
    this.whine?.frequency.setTargetAtTime(clamp((p.rpm / 60) * 3.1 * 2.4, 200, 4200), t, 0.08);
    this.whineGain?.gain.setTargetAtTime(p.running ? bearing : 0, t, 0.12);

    // driveline first-order shake, felt mostly inside at road speed
    const dHz = clamp(p.drivelineHz ?? 0, 0, 90);
    const driveShake =
      p.profileId === "driveline-vibration" && p.running && p.speed > 20
        ? clamp((p.speed - 20) / 90, 0, 1) * 0.05
        : 0;
    if (dHz > 1) this.driveline?.frequency.setTargetAtTime(dHz, t, 0.1);
    this.drivelineGain?.gain.setTargetAtTime(driveShake * (cabin ? 1 : 0.4), t, 0.2);

    // roughness / misfire: amplitude notches at a sub-firing rate
    let modHz = 0;
    let depth = 0;
    if (p.profileId === "lean-rough-idle" && p.rpm < 1200) {
      modHz = clamp(p.rpm / 60 / 2, 3, 14);
      depth = 0.11;
    } else if (p.profileId === "load-misfire") {
      modHz = clamp((p.rpm / 60) * (cyl / 2) / cyl, 4, 30);
      depth = 0.05 + load * 0.16;
    } else if (p.profileId === "trans-flare") {
      modHz = 1.4;
      depth = 0.04 + slip * 0.05;
    } else if (p.profileId === "brake-pulsation") {
      modHz = clamp(p.speed / 12, 1, 18);
      depth = 0.05;
    } else if (p.profileId === "driveline-vibration") {
      modHz = clamp(dHz > 1 ? dHz : p.speed / 6, 2, 40);
      depth = 0.06;
    }
    if (modHz > 0) this.modOsc?.frequency.setTargetAtTime(modHz, t, 0.08);
    this.modDepth?.gain.setTargetAtTime(p.running ? depth : 0, t, 0.12);
  }

  stop() {
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      this.master?.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
      [this.fire, this.fireDetune, this.halfOrder, this.whine, this.driveline, this.modOsc, this.pulseOsc, this.tickOsc].forEach(
        (o) => o?.stop(ctx.currentTime + 0.2),
      );
      window.setTimeout(() => void ctx.close(), 300);
    } catch {
      /* already closed */
    }
    this.ctx = null;
    this.started = false;
  }
}

/** Cylinder count implied by an engine layout, for the firing-order model. */
export function cylinderCount(layout: string): number {
  const map: Record<string, number> = {
    I3: 3,
    I4: 4,
    I5: 5,
    I6: 6,
    V6: 6,
    V8: 8,
    V10: 10,
    V12: 12,
    Rotary: 2,
    Hybrid: 4,
    PHEV: 4,
    EV: 0,
  };
  return map[layout] ?? 4;
}
