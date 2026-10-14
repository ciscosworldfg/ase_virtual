/** Practice exam bank grounded in the student's uploaded ASE Master Technician study guides:
 *  the Student Workbook Practice Bank, the A1-A9 Integration Manual, and the Master Diagnostic
 *  Logic deck (Proving vs. Guessing, the 7-Step Funnel, Tech A/B logic gate, sign-off thresholds). */

export type ExamArea = "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7" | "A8";

export interface ExamOption {
  id: string;
  text: string;
}

export interface ExamQuestion {
  id: string;
  area: ExamArea;
  kind: "mcq" | "techab";
  prompt: string;
  /** Tech A / Tech B statements (kind === "techab") */
  techA?: string;
  techB?: string;
  options: ExamOption[];
  correct: string;
  rationale: string;
}

const TECH_AB: ExamOption[] = [
  { id: "A", text: "Tech A only" },
  { id: "B", text: "Tech B only" },
  { id: "C", text: "Both Tech A and Tech B" },
  { id: "D", text: "Neither Tech A nor Tech B" },
];

function q(
  id: string,
  area: ExamArea,
  prompt: string,
  options: ExamOption[],
  correct: string,
  rationale: string,
): ExamQuestion {
  return { id, area, kind: "mcq", prompt, options, correct, rationale };
}

function tab(id: string, area: ExamArea, prompt: string, techA: string, techB: string, correct: string, rationale: string): ExamQuestion {
  return { id, area, kind: "techab", prompt, techA, techB, options: TECH_AB, correct, rationale };
}

const A1: ExamOption[] = [
  { id: "A", text: "A leaking intake valve" },
  { id: "B", text: "A leaking exhaust valve" },
  { id: "C", text: "Worn piston rings" },
  { id: "D", text: "A blown head gasket" },
];

const ABCD: ExamOption[] = [
  { id: "A", text: "A" },
  { id: "B", text: "B" },
  { id: "C", text: "C" },
  { id: "D", text: "D" },
];

export const EXAM_QUESTIONS: ExamQuestion[] = [
  // ---------- A1 Engine Repair ----------
  q("a1-1", "A1", "A technician is performing a cylinder leakage (leak-down) test. Air is heard coming from the tailpipe. This indicates:", A1, "B",
    "Air from the tailpipe = exhaust valve. Air from the intake = intake valve. Bubbles in the coolant = head gasket. Every escape route has its own signature."),
  tab("a1-2", "A1",
    "A relative compression test (ENG-01) via scan tool shows cylinder 3 at 74% while the other three read about 100%.",
    "The imbalance proves a mechanical breach in the engine's Combustion Core (Layer 3) and eliminates electrical or fuel issues as the primary root cause.",
    "The test alone proves the head gasket is blown.",
    "A",
    "Relative compression narrows the failure to Layer 3 (Combustion). It does NOT identify which seal breached — rings, valve, or gasket all look similar. Follow up with a leak-down or block test before condemning parts."),
  tab("a1-3", "A1",
    "An engine overheats rapidly and emits white exhaust smoke. A block tester shows combustion gases in the radiator.",
    "A blown head gasket is the likely cause — adjacent-cylinder compression loss and coolant contamination are the classic signature.",
    "Worn piston rings are the likely cause.",
    "A",
    "Tech B is the distractor: worn rings burn oil (blue smoke) but rarely cause rapid coolant overheating. White smoke + combustion gas in the radiator = seal breach in Layer 3."),
  q("a1-4", "A1", "A 'U' code reports camshaft/crankshaft correlation loss. Which engine layer does this most directly implicate?", ABCD, "B",
    "Layer 2 — Synchronization (timing belt/chain, gears, tensioners). Cam/crank correlation loss means the cam has drifted from the crank; on an interference engine, a 'Synchronization Snap' destroys the engine."),

  // ---------- A2 Automatic Transmission ----------
  q("a2-1", "A2", "An automatic transmission has a slipping concern only when the vehicle is cold. Which is the most likely cause?", ABCD, "B",
    "Hardened internal seals. As the fluid warms up, the seals expand and seal better — that is why the slip disappears. Fluid-condition faults are condition-dependent; read the condition first."),
  tab("a2-2", "A2",
    "A scan tool shows a TCC slip RPM PID of 140 rpm while the torque converter is commanded locked.",
    "The internal torque converter clutch has failed.",
    "A low fluid level explains the reading and a top-off is the repair.",
    "A",
    "TCC slip greater than 100 rpm when locked is the manual's proof threshold for an internal torque converter clutch failure. Fluid level checks are Step 2 (visual), but they don't explain a locked-converter slip number above spec."),
  tab("a2-3", "A2",
    "ATF inspection shows the fluid is black with a burnt, acrid smell.",
    "The fluid has oxidized or the clutches have been slipping — expect a valve body or internal friction fault.",
    "Coolant has contaminated the fluid.",
    "A",
    "Color code from the lab manual: red = good, black/burnt = oxidation or slipping, milky/pink = coolant contamination. Match the finding to the statement — 'milkiness' is the coolant tell, not 'black and burnt'."),

  // ---------- A3 Manual Drivetrain ----------
  q("a3-1", "A3", "A vehicle makes a growling noise that changes with engine speed when the clutch pedal is depressed. Which is the most likely cause?", ABCD, "B",
    "The release (throw-out) bearing — it is only under load when the pedal is depressed. Pilot bearing noise appears with the pedal out; input shaft bearing noise does not change with the pedal."),
  tab("a3-2", "A3",
    "A clutch slips under load. Inspection through the opening shows the disk soaked in oil.",
    "The friction material is simply worn out and the disk must be replaced.",
    "The oil likely came from a rear main seal breach, and the root cause must be found before installing a new disk.",
    "B",
    "The 'Seal Breach' cascade: a head-gasket-to-oil failure can send oil down the rear main seal, soaking the clutch disk. Replacing the disk without fixing the oil source guarantees a comeback."),
  tab("a3-3", "A3",
    "A front-wheel-drive car clicks on tight turns. The CV boot is torn with grease splatter on the wheel.",
    "Lack of lubrication and dirt intrusion damaged the CV joint.",
    "Differential backlash is out of specification.",
    "A",
    "Torn boots leak grease and let dirt in — the joint runs dry and clicks. Backlash is diagnosed with a dial indicator at the differential, not from a clicking front corner on turns."),

  // ---------- A4 Suspension & Steering ----------
  tab("a4-1", "A4",
    "A vehicle pulls to the right during braking only.",
    "A restricted left-front brake hose could be the cause.",
    "A worn right-front strut rod bushing could be the cause.",
    "C",
    "Both are true. A restricted hose prevents pressure from releasing/applying evenly, and worn bushings allow control-arm movement under braking force. Evaluate each Tech A/B statement as a standalone true/false — if both are true, the answer is always 'both'."),
  tab("a4-2", "A4",
    "Both front tires show wear concentrated on the inside edges.",
    "Excessive camber (inward tilt) is the likely cause.",
    "Incorrect toe is the likely cause.",
    "A",
    "Edge wear points to camber. Toe wear feathers across the tread — the manual calls toe 'the primary tire-wear killer,' but its signature is feathering across the tread, not one clean worn edge."),

  // ---------- A5 Brakes ----------
  q("a5-1", "A5", "The brake pedal pulsates only when the brakes are applied. This is most likely caused by:", ABCD, "B",
    "Out-of-round rear drums or warped front rotors. Pulsation is a mechanical runout issue — air gives a soft/spongy pedal, a failed cup gives a low pedal, worn pads give noise and long stopping distances."),
  tab("a5-2", "A5",
    "A brake pedal feels spongy.",
    "Air in the hydraulic system could be the cause.",
    "An internal master cylinder bypass could be the cause.",
    "C",
    "Both are true. The hydraulic logic: the master cylinder creates the pressure, and it is lost either to compressible air or past a bypassing cup. Bleed first; if the pedal still sinks, prove the master cylinder."),

  // ---------- A6 Electrical ----------
  q("a6-1", "A6", "A circuit has 12 volts and 2 ohms of resistance. What is the current flow?", ABCD, "C",
    "Ohm's Law: I = V / R. 12 / 2 = 6 amps. The exam always includes Ohm's Law arithmetic — do it, don't guess."),
  tab("a6-2", "A6",
    "A starter clicks audibly but does not crank the engine. A voltage drop test on the positive battery cable reads 2.5 V during cranking.",
    "The starter solenoid is engaging but the motor is internally seized — the starter has failed.",
    "The voltage drop indicates excessive resistance in the positive battery cable.",
    "B",
    "The click proves the control circuit works. A 2.5 V drop starves the high-current circuit — the manual's maximum acceptable drop across a high-current starting cable is under 0.5 V. Replace the cable before condemning the starter."),
  q("a6-3", "A6", "What is the master's maximum acceptable voltage drop across any connection in a high-current circuit?", [
    { id: "A", text: "0.1 V" },
    { id: "B", text: "0.5 V" },
    { id: "C", text: "1.0 V" },
    { id: "D", text: "2.5 V" },
  ], "B",
    "The golden threshold: under 0.5 V across any high-current connection. Anything higher is excessive resistance — prove it with the DMM under load, not by feel."),

  // ---------- A7 HVAC ----------
  q("a7-1", "A7", "During an A/C system test, the high-side pressure is very high and the low-side pressure is also higher than normal. The most likely cause is:", ABCD, "B",
    "A failed cooling fan. Both sides reading high means heat is not leaving the condenser — a lack of airflow across it. A restriction gives high high-side with LOW low-side; a low charge gives low both."),
  tab("a7-2", "A7",
    "A customer complains the A/C blows warm no matter where the temperature dial is set.",
    "The blend door is the gatekeeper of cabin temperature and a stuck door explains the complaint.",
    "Refrigerant flows compressor → condenser → expansion device → evaporator, so a failed compressor would explain warm air at any setting.",
    "C",
    "Both statements are true. The blend door governs cabin temperature, and the refrigerant cycle order is correct — either fault can produce warm vents. That is exactly why the Tech A/B gate evaluates each statement independently."),

  // ---------- A8 Engine Performance ----------
  q("a8-1", "A8", "A scan tool shows a Long Term Fuel Trim (LTFT) of +25%. This indicates the PCM is:", ABCD, "A",
    "Adding fuel to compensate for a lean condition. Positive trim = adding fuel (vacuum leak is the classic cause); negative = subtracting. ±10% under load is the sign-off threshold — +25% is far out of spec."),
  tab("a8-2", "A8",
    "An engine idles perfectly but misfires severely under heavy acceleration and high load.",
    "A weak ignition coil is failing to push a spark across the plug gap under high cylinder pressures.",
    "A restricted fuel system (lean condition) is failing to deliver the volume of fuel required for high-load volumetric efficiency.",
    "C",
    "Both are correct — the manual's 'heavy-load misfire' case. Heavy load maximizes ignition resistance AND fuel volume demand, so both faults manifest identically. Pull freeze frame data, then prove with a fuel pressure test under load or ignition waveform analysis."),
  q("a8-3", "A8", "For a diagnostic sign-off on fuel/air (A8) mixture control, the combined STFT/LTFT correction must be within what limit under load?", [
    { id: "A", text: "±2%" },
    { id: "B", text: "±5%" },
    { id: "C", text: "±10%" },
    { id: "D", text: "±25%" },
  ], "C",
    "±10% under load is the sign-off threshold. The job isn't done until the system is re-tested under load and verified against the spec — prove it."),
];

export const EXAM_AREAS: { id: ExamArea; name: string }[] = [
  { id: "A1", name: "Engine Repair" },
  { id: "A2", name: "Automatic Transmission" },
  { id: "A3", name: "Manual Drivetrain & Axles" },
  { id: "A4", name: "Suspension & Steering" },
  { id: "A5", name: "Brakes" },
  { id: "A6", name: "Electrical / Electronic" },
  { id: "A7", name: "Heating & Air Conditioning" },
  { id: "A8", name: "Engine Performance" },
];

/** Best score per area, persisted locally. */
export interface ExamScores {
  [area: string]: number | undefined;
}

const SCORES_KEY = "ase-virtual-exam-scores-v1";

export function readExamScores(): ExamScores {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(SCORES_KEY) ?? "{}") as ExamScores;
  } catch {
    return {};
  }
}

export function writeExamScore(area: ExamArea, pct: number) {
  const scores = readExamScores();
  const prev = scores[area] ?? -1;
  if (pct > prev) {
    scores[area] = pct;
    try {
      window.localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
    } catch {
      /* storage unavailable */
    }
  }
}
