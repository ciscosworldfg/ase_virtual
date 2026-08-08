import type { FailureCondition, Vehicle } from "./types";

export interface SimState {
  rpm: number;
  throttle: number; // 0-100
  speed: number; // km/h
  coolant: number; // C
  running: boolean;
  brake: boolean;
  elapsed: number; // seconds
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
}

export const initialState = (v: Vehicle): SimState => ({
  rpm: v.idleRpm,
  throttle: 0,
  speed: 0,
  coolant: 24,
  running: false,
  brake: false,
  elapsed: 0,
});

/**
 * Advances the physical model one tick. Deliberately simple, but the
 * relationships between throttle, load, rpm and speed are consistent so the
 * scan tool never shows contradictory numbers.
 */
export function stepSim(
  state: SimState,
  vehicle: Vehicle,
  failure: FailureCondition,
  dt: number,
): SimState {
  if (!state.running) {
    return { ...state, rpm: 0, speed: Math.max(0, state.speed - 30 * dt), throttle: 0 };
  }

  const powerLoss = failure.effects.powerLoss ?? 0;
  const targetRpm =
    vehicle.idleRpm +
    (state.throttle / 100) * (vehicle.redline - vehicle.idleRpm) * (1 - powerLoss * 0.6);

  const rough = failure.effects.roughIdle ?? 0;
  const idleWobble =
    state.throttle < 8 ? Math.sin(state.elapsed * 11) * 70 * rough : 0;

  const rpm = state.rpm + (targetRpm - state.rpm) * Math.min(1, dt * 2.4) + idleWobble * dt * 4;

  const accel = (state.throttle / 100) * 34 * (1 - powerLoss);
  const drag = state.speed * 0.35 + (state.brake ? 55 : 0);
  const speed = Math.max(0, state.speed + (accel - drag) * dt);

  const coolantTarget = 92 + (failure.effects.coolantOffset ?? 0);
  const coolant = state.coolant + (coolantTarget - state.coolant) * dt * 0.06;

  return {
    ...state,
    rpm: Math.max(vehicle.idleRpm * 0.9, Math.min(vehicle.redline, rpm)),
    speed: Math.min(180, speed),
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
  const load = Math.min(
    99,
    Math.max(
      state.running ? 14 : 0,
      state.throttle * 0.85 + (state.rpm / vehicle.redline) * 22,
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
  };
}
