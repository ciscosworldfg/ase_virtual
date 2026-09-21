import type { FailureCondition, Vehicle } from "./types";

export interface SimState {
  rpm: number;
  throttle: number; // 0-100
  speed: number; // km/h
  coolant: number; // C
  running: boolean;
  brake: boolean;
  elapsed: number; // seconds
  /** current gear, 1-indexed */
  gear: number;
  /** seconds remaining in an in-progress shift (0 = fully engaged) */
  shiftTimer: number;
  /** torque converter / clutch slip, 0 = locked, 1 = fully slipping */
  slip: number;
}

export interface LiveDataFrame {
  rpm: number;
  speed: number;
  load: number;
  maf: number;
  map: number;
  stft: number;
  ltft: number;
  o2b1s1: number;
  afRatio: number;
  coolant: number;
  iat: number;
  tps: number;
  timing: number;
  fuelPressure: number;
  batteryVoltage: number;
  oilPressure: number;
  misfireCount: number;
  gear: number;
  shifting: boolean;
  slip: number;
  drivelineHz: number;
}

/** Ratios for a generic 6-speed; close enough for a training model. */
const GEAR_RATIOS = [3.42, 2.05, 1.4, 1.0, 0.8, 0.66];
const FINAL_DRIVE = 3.55;
/** engine rpm per km/h in a 1:1 gear, tuned for a ~660mm rolling diameter */
const RPM_PER_KMH = 9.1;

const gearRatio = (gear: number) =>
  GEAR_RATIOS[Math.min(GEAR_RATIOS.length - 1, Math.max(0, gear - 1))];

/** Engine rpm the driveline would impose at this road speed and gear. */
export function drivelineRpm(speed: number, gear: number) {
  return speed * RPM_PER_KMH * gearRatio(gear) * (FINAL_DRIVE / 3.55);
}

export const initialState = (v: Vehicle): SimState => ({
  rpm: v.idleRpm,
  throttle: 0,
  speed: 0,
  coolant: 24,
  running: false,
  brake: false,
  elapsed: 0,
  gear: 1,
  shiftTimer: 0,
  slip: 1,
});

/**
 * Advances the physical model one tick.
 *
 * The rpm is now derived from the driveline (road speed × gear ratio) blended
 * with converter slip, so that gear changes, coast-down and load changes move
 * the tacho — and therefore the exhaust note — the way a real powertrain does
 * instead of chasing the throttle pedal directly.
 */
export function stepSim(
  state: SimState,
  vehicle: Vehicle,
  failure: FailureCondition,
  dt: number,
): SimState {
  if (!state.running) {
    return {
      ...state,
      rpm: Math.max(0, state.rpm - state.rpm * Math.min(1, dt * 3)),
      speed: Math.max(0, state.speed - 30 * dt),
      throttle: 0,
      gear: 1,
      shiftTimer: 0,
      slip: 1,
    };
  }

  const powerLoss = failure.effects.powerLoss ?? 0;
  const throttle = state.throttle / 100;

  /* ---------------------------------------------------------- road speed */
  const shifting = state.shiftTimer > 0;
  // torque is cut during the shift event, which is what produces the
  // characteristic rpm dip and exhaust "breath" between gears
  const torqueCut = shifting ? 0.12 : 1;
  const gearPull = 1 + (GEAR_RATIOS[0] - gearRatio(state.gear)) * 0.34;
  const accel = throttle * 19 * gearPull * torqueCut * (1 - powerLoss);
  const engineBrake = !state.brake && throttle < 0.05 ? 6 * (1 - state.slip) : 0;
  const drag = state.speed * 0.22 + 1.4 + (state.brake ? 62 : 0) + engineBrake;
  const speed = Math.max(0, Math.min(190, state.speed + (accel - drag) * dt));

  /* ------------------------------------------------------ gear selection */
  let gear = state.gear;
  let shiftTimer = Math.max(0, state.shiftTimer - dt);
  const geared = drivelineRpm(speed, gear);
  const upshiftAt = vehicle.idleRpm + (vehicle.redline - vehicle.idleRpm) * (0.5 + throttle * 0.36);
  const downshiftAt = vehicle.idleRpm * 1.25 + throttle * 900;

  if (!shifting) {
    if (geared > upshiftAt && gear < GEAR_RATIOS.length) {
      gear += 1;
      shiftTimer = 0.42;
    } else if (geared < downshiftAt && gear > 1) {
      gear -= 1;
      shiftTimer = 0.3;
    }
  }

  /* ------------------------------------------- converter slip and engine */
  // fully slipping from a stop, progressively locking as road speed builds
  const lockTarget = Math.min(1, Math.max(0, (speed - 8) / 26));
  const slipTarget = shifting ? 0.85 : Math.max(0.04, 1 - lockTarget) + throttle * 0.12;
  const slip = state.slip + (slipTarget - state.slip) * Math.min(1, dt * (shifting ? 7 : 2.6));

  const freeRpm =
    vehicle.idleRpm +
    throttle * (vehicle.redline - vehicle.idleRpm) * (1 - powerLoss * 0.6) * (shifting ? 0.45 : 1);
  const coupledRpm = Math.max(vehicle.idleRpm * 0.92, drivelineRpm(speed, gear));
  const targetRpm = coupledRpm * (1 - slip) + Math.max(freeRpm, coupledRpm) * slip;

  const rough = failure.effects.roughIdle ?? 0;
  const idleWobble = state.throttle < 8 ? Math.sin(state.elapsed * 11) * 70 * rough : 0;

  // inertia: revs rise faster than they fall, faster still when unloaded
  const rise = targetRpm > state.rpm ? 3.4 + slip * 2.6 : 2.2;
  const rpm =
    state.rpm + (targetRpm - state.rpm) * Math.min(1, dt * rise) + idleWobble * dt * 4;

  const coolantTarget = 92 + (failure.effects.coolantOffset ?? 0);
  const coolant = state.coolant + (coolantTarget - state.coolant) * dt * 0.06;

  return {
    ...state,
    rpm: Math.max(vehicle.idleRpm * 0.9, Math.min(vehicle.redline, rpm)),
    speed,
    gear,
    shiftTimer,
    slip,
    coolant,
    elapsed: state.elapsed + dt,
  };
}

export function computeLiveData(
  state: SimState,
  vehicle: Vehicle,
  failure: FailureCondition,
): LiveDataFrame {
  const idleish = state.throttle < 10 && state.speed < 8;
  const shifting = (state.shiftTimer ?? 0) > 0;
  const slip = state.slip ?? 1;

  // calculated load follows torque demand, and drops away during a shift
  const load = Math.min(
    99,
    Math.max(
      state.running ? 14 : 0,
      (state.throttle * 0.72 + (state.rpm / vehicle.redline) * 26) *
        (shifting ? 0.35 : 1) *
        (1 - slip * 0.18),
    ),
  );

  const stftBase = idleish
    ? (failure.effects.stftIdle ?? 1.5)
    : (failure.effects.stftCruise ?? 1.2);
  const ltftBase = idleish
    ? (failure.effects.ltftIdle ?? 2)
    : (failure.effects.ltftCruise ?? 2.4);

  const flutter = Math.sin(state.elapsed * 3.1) * 1.8;
  const stft = state.running ? stftBase + flutter : 0;
  const ltft = state.running ? ltftBase : 0;

  const maf = state.running ? 2.1 + (load / 100) * (vehicle.displacement ?? 2) * 27 : 0;
  const map = state.running ? 22 + (load / 100) * 78 : 101;

  const o2Swing = Math.sin(state.elapsed * 5.5) * 0.32 + 0.45;
  const leanBias = Math.min(0.35, (stftBase + ltftBase) / 120);
  const o2 = state.running ? Math.max(0.02, o2Swing - leanBias) : 0.02;

  const misfireRate = failure.effects.misfireRate ?? 0;
  const misfireWeight = failure.id.includes("coil") ? load / 100 : idleish ? 1 : 0.2;

  // propshaft / halfshaft first-order frequency — drives vibration cues
  const drivelineHz = (state.speed * RPM_PER_KMH * (FINAL_DRIVE / 3.55)) / 60;

  return {
    rpm: Math.round(state.rpm),
    speed: Math.round(state.speed),
    load: Math.round(load),
    maf: +maf.toFixed(1),
    map: Math.round(map),
    stft: +stft.toFixed(1),
    ltft: +ltft.toFixed(1),
    o2b1s1: +o2.toFixed(2),
    afRatio: +(14.7 + leanBias * 4).toFixed(2),
    coolant: Math.round(state.coolant),
    iat: Math.round(28 + (state.rpm / vehicle.redline) * 12),
    tps: Math.round(state.throttle),
    timing: Math.round(8 + (state.rpm / 1000) * 3.4 - load / 12),
    fuelPressure: +(
      (vehicle.fuelSystem === "Direct Injection" ? 1450 : 380) *
      (0.94 + load / 900)
    ).toFixed(0),
    batteryVoltage: state.running
      ? +(failure.effects.chargingVoltage ?? 14.2).toFixed(2)
      : 12.5,
    oilPressure: state.running
      ? +(
          (18 + (state.rpm / 1000) * 9) * (failure.effects.oilPressureFactor ?? 1)
        ).toFixed(1)
      : 0,
    misfireCount: Math.round(state.elapsed * misfireRate * misfireWeight * 14),
    gear: state.gear ?? 1,
    shifting,
    slip: +slip.toFixed(2),
    drivelineHz: +drivelineHz.toFixed(1),
  };
}
