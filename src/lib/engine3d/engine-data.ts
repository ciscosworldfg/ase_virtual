/** Plain data for the 3D Engine Lab (ported from the Garage source). No React, no three.js. */

export type FuelType = "port" | "gdi" | "diesel";

export interface EngineFamily {
  id: string;
  label: string;
  v: boolean;
  n: number;
  fuel: FuelType;
  vvt: boolean;
  egr: boolean;
  turbo: boolean;
  knock: boolean;
  thr: boolean;
  dpf?: boolean;
  blurb: string;
}

export const ENGINE_FAMILIES: EngineFamily[] = [
  { id: "v6", label: "Generic V6", v: true, n: 6, fuel: "port", vvt: true, egr: true, turbo: false, knock: true, thr: true,
    blurb: "Generic educational V6: two banks of three cylinders, 60° here. Gasoline, port injection, coil-on-plug, variable cam timing." },
  { id: "v4", label: "Generic V4", v: true, n: 4, fuel: "port", vvt: false, egr: true, turbo: false, knock: true, thr: true,
    blurb: "Compact 4-cylinder in a V layout (two banks of two, 60° here). Gasoline, port injection, coil-on-plug." },
  { id: "modern", label: "Inline-4 turbo GDI", v: false, n: 4, fuel: "gdi", vvt: true, egr: false, turbo: true, knock: true, thr: true,
    blurb: "Generic inline-4 turbo gasoline with direct injection and variable cam timing." },
  { id: "diesel", label: "Inline-4 diesel", v: false, n: 4, fuel: "diesel", vvt: false, egr: true, turbo: true, knock: false, thr: false, dpf: true,
    blurb: "Generic inline-4 turbo common-rail diesel: compression ignition, glow plugs, EGR and particulate filter." },
];

/** Families shown in the picker but with no procedural geometry yet. */
export const UNSUPPORTED_FAMILIES = ["Inline-6", "V8", "Rotary", "Hybrid / EV"];

export const RECOGNITION: Record<string, string> = {
  alt: "Vented aluminum housing, mounting ears and grooved belt pulley.",
  int: "Curved intake runners fed from a common plenum.",
  thr: "Open circular bore, brass butterfly plate and black actuator housing.",
  maf: "Intake tube with a sensor probe and electrical connector.",
  coil: "Black coil housing, rubber plug boot and side connector.",
  plug: "White ribbed ceramic, hex nut, threaded shell and electrode.",
  inj: "Metal nozzle, two rubber O-rings and a side electrical connector.",
  ect: "Cast housing, coolant hose neck and a threaded sensor.",
  crk: "Probe nose, mounting tab and electrical connector.",
  cam: "Probe nose, mounting tab and electrical connector.",
  map: "Pressure probe and keyed connector.",
  oilp: "Threaded brass base, hex nut and electrical connector.",
  knk: "Ring-shaped sensing body with a center mounting bore.",
  vvt: "Cylindrical metal spool, mounting flange and electrical connector.",
  cov: "Ribbed cover with coil openings, flange bolts and oil filler cap.",
  head: "Cast head with intake/exhaust port openings and flange bolts.",
  exh: "Curved exhaust runners converging into a collector.",
  rail: "Metal fuel tube with injector outlets and mounting tabs.",
  pan: "Sump body, bolted flange and drain plug.",
  pulley: "Grooved belt rim, damper hub and center retaining bolt.",
  block: "Cast crankcase with flanges, ribs and bolt heads.",
  egr: "Metal valve base, cylindrical actuator and exhaust passage.",
};

export const LABEL_NAMES: Record<string, string> = {
  block: "Engine block", pan: "Oil pan", alt: "Alternator", int: "Intake manifold", thr: "Throttle body",
  ect: "Coolant sensor", maf: "MAF sensor", crk: "Crank sensor", cov0: "Valve cover · B1", cov1: "Valve cover · B2", turbo: "Turbocharger",
};

const T: Record<string, string> = {
  P0010: "“A” Camshaft Position Actuator Circuit (Bank 1)", P0011: "“A” Camshaft Timing Over-Advanced/Performance (Bank 1)",
  P0020: "“A” Camshaft Position Actuator Circuit (Bank 2)", P0021: "“A” Camshaft Timing Over-Advanced/Performance (Bank 2)",
  P0016: "Crankshaft/Camshaft Position Correlation (Bank 1 Sensor A)", P0087: "Fuel Rail/System Pressure Too Low",
  P0101: "Mass Air Flow Circuit Range/Performance", P0102: "Mass Air Flow Circuit Low", P0103: "Mass Air Flow Circuit High",
  P0106: "MAP/Barometric Pressure Range/Performance", P0107: "MAP Circuit Low", P0108: "MAP Circuit High",
  P0117: "Coolant Temp Circuit Low", P0118: "Coolant Temp Circuit High", P0121: "Throttle/Pedal Position Sensor A Range/Performance",
  P0122: "Throttle/Pedal Position Sensor A Circuit Low", P0123: "Throttle/Pedal Position Sensor A Circuit High",
  P0128: "Coolant Thermostat (Temp Below Regulating Temp)", P0171: "System Too Lean (Bank 1)", P0174: "System Too Lean (Bank 2)",
  P0190: "Fuel Rail Pressure Sensor Circuit", P0191: "Fuel Rail Pressure Sensor Range/Performance", P0234: "Turbo/Supercharger Overboost",
  P0236: "Turbo Boost Sensor A Range/Performance", P0299: "Turbo/Supercharger Underboost", P0300: "Random/Multiple Cylinder Misfire",
  P0325: "Knock Sensor 1 Circuit (Bank 1)", P0327: "Knock Sensor 1 Circuit Low (Bank 1)", P0330: "Knock Sensor 2 Circuit (Bank 2)",
  P0335: "Crankshaft Position Sensor A Circuit", P0336: "Crankshaft Position Sensor A Range/Performance",
  P0340: "Camshaft Position Sensor A Circuit (Bank 1)", P0341: "Camshaft Position Sensor A Range/Performance (Bank 1)",
  P0345: "Camshaft Position Sensor A Circuit (Bank 2)", P0401: "EGR Flow Insufficient", P0402: "EGR Flow Excessive",
  P0420: "Catalyst Efficiency Below Threshold (Bank 1)", P0430: "Catalyst Efficiency Below Threshold (Bank 2)",
  P0520: "Engine Oil Pressure Sensor/Switch Circuit", P0521: "Engine Oil Pressure Sensor Range/Performance",
  P0522: "Engine Oil Pressure Sensor Low", P0523: "Engine Oil Pressure Sensor High", P0562: "System Voltage Low", P0563: "System Voltage High",
  P0670: "Glow Plug Module Control Circuit", P2002: "Diesel Particulate Filter Efficiency Below Threshold (Bank 1)",
  P2135: "Throttle/Pedal Position Sensor A/B Voltage Correlation",
};

export const pc = (base: number, n: number) => "P" + String(base + n).padStart(4, "0");

/** SAE generic DTC title; cylinder-indexed codes are generated. */
export function dtcTitle(code: string): string {
  if (T[code]) return T[code]!;
  const num = Number(code.slice(1));
  for (const [base, fn] of [
    [300, (n: number) => `Cylinder ${n} Misfire Detected`],
    [200, (n: number) => `Injector Circuit/Open – Cylinder ${n}`],
    [350, (n: number) => `Ignition Coil ${"ABCDEFGH"[n - 1]} Primary/Secondary Circuit`],
    [670, (n: number) => `Cylinder ${n} Glow Plug Circuit`],
  ] as const) {
    const n = num - base;
    if (n >= 1 && n <= 8) return fn(n);
  }
  return "";
}

export const FIX: Record<string, string[]> = {
  coil: ["Read freeze frame: note rpm, load, temp when the misfire set.", "Swap this coil with a neighbour; clear nothing, re-test under the same conditions.", "If the misfire follows the coil, test its supply voltage, ground and driver signal, then replace the coil.", "Inspect the plug: a worn plug can kill a coil."],
  plug: ["Remove the coil, then the plug (engine cold, clean the well first).", "Check gap, electrode wear, oil, fuel or coolant fouling; the deposits point to the real cause.", "Replace as a set to spec; torque correctly.", "Re-test misfire counters (Mode 06/live data)."],
  inj: ["Check injector circuit: connector, supply voltage and pulse with a noid light or scope.", "Measure resistance against spec (injector off the circuit).", "Run a balance/flow test before replacing; check fuel pressure first.", "Verify fuel trims and misfire counts after repair."],
  glow: ["Measure glow plug resistance and current draw.", "Check the glow plug relay/module and supply voltage.", "Replace failed plugs; remove carefully (seized plugs snap).", "Confirm cold-start and clear the code only after repair."],
  maf: ["Compare MAF g/s at idle and 2500 rpm with spec/known-good.", "Inspect the intake for leaks after the sensor and a dirty air filter.", "Clean only with MAF-safe cleaner; check 5 V reference, ground and signal.", "Replace only if readings stay implausible after leaks are ruled out."],
  thr: ["Look for carbon build-up; clean with throttle-body cleaner (key off).", "Scan live throttle angle vs pedal: both should track smoothly.", "Check reference, ground and signal wires.", "Perform the throttle relearn after cleaning or replacement."],
  egr: ["Check for a stuck valve or clogged passages (carbon).", "Command the valve with a scan tool per procedure and watch MAP change.", "Clean passages or replace the valve; check the vacuum/electric actuator.", "Verify with live EGR data and an EGR monitor drive cycle."],
  turbo: ["Inspect the whole charge-air path for leaks, loose clamps and split hoses first.", "Check the wastegate/vane actuator moves freely and the boost sensor reads plausibly.", "Check oil supply, shaft play and wheel damage.", "Only then replace the turbo; fix the cause of oil/debris first."],
  dpf: ["Review soot load, differential pressure and regeneration history.", "Fix upstream problems: injectors, EGR, misfires, short trips.", "Run a forced regeneration with a scan tool (qualified operator, safe area).", "Clean or replace the filter only if pressure stays high."],
  map: ["Compare key-on MAP with barometric pressure.", "Check the hose/port for cracks or blockage.", "Check reference, ground, signal.", "Replace if the reading does not track real vacuum/boost."],
  cam: ["Check connector, wiring and air gap.", "Scope the signal and compare to the crank signal.", "Check the reluctor/tone wheel for damage.", "Check cam timing before replacing the sensor."],
  crk: ["Check connector, wiring, and sensor gap/mounting.", "Measure sensor resistance or scope the signal while cranking.", "Inspect the tone wheel for missing teeth or debris.", "Replace the sensor only if the signal is dropped or absent."],
  alt: ["Measure battery voltage: key-off, then idle (about 13.5–14.8 V is typical).", "Check belt condition and tension, and the cable ends and grounds.", "Voltage-drop test the charge cable and ground.", "Load-test the alternator before replacing."],
  ect: ["Compare scanned coolant temp with an infrared reading when cold.", "Check thermostat opening temperature and coolant level.", "Check sensor wiring and reference voltage.", "Replace the thermostat (stuck open) or sensor as proven by test."],
  oilp: ["Verify real oil pressure with a mechanical gauge first.", "Check oil level and grade.", "If pressure is good, check sensor wiring and the sensor.", "Low real pressure means stop and investigate bearings/pump."],
  knk: ["Check torque and connector; the mounting torque affects the signal.", "Inspect wiring for oil-soaked insulation or chafing.", "Check for a real knock (carbon, fuel quality, timing).", "Replace the sensor only after those checks."],
  vvt: ["Check oil level and condition first.", "Check the solenoid resistance and the filter screen.", "Command the solenoid and watch cam angle change.", "Inspect the phaser or timing chain stretch if the response is slow."],
  rail: ["Check the fuel pressure against spec at key-on and under load.", "Check the supply side: tank pump, filter, regulator.", "Test the pressure sensor against a gauge.", "Inspect for leaks before replacing rail components."],
  int: ["Smoke-test the intake for leaks.", "Inspect gaskets, vacuum hoses and PCV.", "Check fuel trims at idle vs 2500 rpm: a leak shrinks with rpm.", "Replace gaskets or the manifold once the leak is located."],
  head: ["Do a cylinder compression and leak-down test.", "Check for coolant in the oil, oil in the coolant and combustion gases in the coolant.", "Inspect the head for cracks and warpage before reassembly.", "Follow the service manual torque sequence."],
  cov: ["Inspect for oil leaks and gasket condition.", "Check the PCV valve and hoses.", "Replace the gasket; torque in sequence.", "Re-check for leaks and lean codes."],
  exh: ["Check for exhaust leaks (soot trails, ticking when cold).", "Inspect studs and gaskets for cracks.", "Rule out misfire and fuel faults before blaming the catalyst.", "Repair leaks upstream of the O2 sensors first."],
  pan: ["Check the oil level and look for leaks and metal debris.", "Verify oil pressure with a gauge if codes are set.", "Replace the gasket or pan as needed.", "Refill with the correct oil and check for leaks."],
  hpp: ["Check low-pressure supply pressure and filter first.", "Compare actual vs commanded rail pressure on a scan tool.", "Inspect the pump drive (cam lobe wear).", "Replace the pump only after the supply side is confirmed good."],
  pulley: ["Check belt condition and alignment.", "Inspect the damper rubber for separation.", "Replace if wobbling or cracked.", "Re-check charging voltage."],
  block: ["Perform compression and leak-down tests.", "Check oil consumption and coolant loss.", "Inspect with a borescope if needed.", "Mechanical repair needs the service manual."],
};

export const partType = (id: string) => id.replace(/\d+$/, "");