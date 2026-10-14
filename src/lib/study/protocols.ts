/** Field protocol cards distilled from the uploaded diagnostic protocols:
 *  the 7-Step Funnel (Master Diagnostic Logic), ENG-01 relative compression,
 *  ELE-01 voltage drop, the driveline cascade map, and the high-speed
 *  cooling system protocol. */

export interface ProtocolStep {
  step: string;
  action: string;
}

export interface Protocol {
  id: string;
  code?: string;
  title: string;
  phase: string;
  source: string;
  summary: string;
  steps: ProtocolStep[];
  proof?: string;
}

export const PROTOCOLS: Protocol[] = [
  {
    id: "funnel",
    title: "The 7-Step Diagnostic Funnel",
    phase: "Every job, every time",
    source: "Master Diagnostic Logic · A1–A9 Integration Manual",
    summary:
      "The mandatory logic sequence for every concern. Phase 1 gathers facts, Phase 2 isolates and proves, Phase 3 fixes and verifies. Never skip forward to a part.",
    steps: [
      { step: "1 · Verify the Concern", action: "Duplicate the symptom under the same conditions the customer described. Do not rack the car until the fault is confirmed." },
      { step: "2 · Visual Inspection", action: "Check the basics — fuses, belts, fluid levels, loose connectors. Look for the obvious before chasing the complex." },
      { step: "3 · Data Retrieval", action: "Pull all P, B, C and U codes. Capture Freeze Frame data — a digital snapshot of the system at the moment of failure." },
      { step: "4 · System Narrowing", action: "Categorize the failure into the 5 pillars: Mechanical, Electrical, Fuel, Hydraulic, or Network. Narrow the search area." },
      { step: "5 · Pinpoint Test", action: "Use targeted tools — pressure gauges, DMM, scope. Prove the component or circuit is dead with a measurement." },
      { step: "6 · Repair", action: "Perform the service with OE torque specs and procedures. Fix it right the first time; no shortcuts." },
      { step: "7 · Verification", action: "Re-test the system under load. Perform a final drive cycle to prove the root cause is gone." },
    ],
  },
  {
    id: "eng-01",
    code: "ENG-01",
    title: "Relative Compression Test",
    phase: "Phase 2 · Isolation & Proof",
    source: "Diagnostic Protocol: Mastering the Relative Compression Test",
    summary:
      "Evaluates the mechanical health of the engine's Power Core (Layer 3) without removing spark plugs or injectors — the starter's current draw rises against each piston's compression stroke.",
    steps: [
      { step: "Prepare", action: "Connect the scan tool at the OBD-II port. Confirm the battery is fully charged — the test relies on consistent cranking speed." },
      { step: "Access", action: "Navigate to the Engine/A1 module and select the Relative Compression Test from the diagnostic menu." },
      { step: "Execute", action: "Follow the prompts to crank the engine — usually Wide Open Throttle to enter Clear Flood Mode so the engine cannot start." },
      { step: "Read", action: "The tool measures the electrical resistance the starter meets as each piston reaches TDC on the compression stroke. Results display as waveform or percentage data." },
    ],
    proof: "Healthy engine: all cylinders near 100% relative. A cylinder at 75% or lower indicates a mechanical breach — seal breach (head gasket) or worn rings. Variance under 10% passes sign-off. After repair, rerun to confirm the balanced 100% baseline.",
  },
  {
    id: "ele-01",
    code: "ELE-01",
    title: "Voltage Drop Under Load",
    phase: "Phase 2 · Isolation & Proof",
    source: "A1–A9 Integration Manual · Master Diagnostic Logic (A6)",
    summary:
      "A resistance hunt across the high-current path: battery positive terminal → heavy-gauge cable → starter solenoid stud → starter, and battery negative → engine ground strap → chassis. Measured under cranking load, because resistance hides at rest.",
    steps: [
      { step: "Set up", action: "DMM on DC volts across the suspected segment — lead on each side of the connection or cable under test." },
      { step: "Load it", action: "Crank the engine (or run the circuit) so current flows. A voltage drop test at rest proves nothing." },
      { step: "Isolate", action: "Step 4 thinking: separate the high-current circuit from the control circuit. A clicking solenoid proves the control side works." },
      { step: "Judge", action: "Compare the reading to the threshold and fix the cable, connection, or strap — not the component starved by it." },
    ],
    proof: "Maximum acceptable voltage drop across any high-current connection is under 0.5 V. The manual's case study: 2.5 V across the positive cable during cranking — replace the cable before condemning the starter.",
  },
  {
    id: "driveline",
    title: "Driveline Failure Cascades (A2/A3)",
    phase: "System narrowing map",
    source: "Driveline Failure Diagnostics: The Master Integration Map",
    summary:
      "Trace the power path — flywheel/clutch (A3) or torque converter (A2) → transaxle → differential and half-shafts → CV joints and tires — and recognize when a driveline symptom actually originates in the engine layers.",
    steps: [
      { step: "Sync Snap", action: "A broken timing belt/chain stops the camshafts while the crank keeps spinning → total instantaneous loss of power delivery." },
      { step: "Seal Breach", action: "A head gasket failure lets oil reach the rear main seal, soaking the clutch disk → severe slip (A3), or fouls the transmission cooler → contaminated ATF (A2)." },
      { step: "TCC Slip", action: "TCC slip RPM PID above 100 rpm when locked → internal torque converter clutch failure." },
      { step: "Harsh Shifts", action: "Burnt acrid fluid with high TCM line pressure → fluid oxidation or valve body restriction." },
      { step: "CV Clicking", action: "Torn boots, grease splatter on the wheels → lack of lubrication and dirt intrusion." },
    ],
    proof: "Verify: duplicate the vibration or slippage under load · Visual: ATF color/smell or clutch through the inspection hole · Data: P-codes plus Turbine Speed vs Engine RPM · Narrow: mechanical, hydraulic, or external · Pinpoint: flywheel runout or line pressure test to spec · Repair: factory procedure · Verify: final test drive.",
  },
  {
    id: "cooling",
    code: "CL-01",
    title: "High-Speed Overheating Protocol",
    phase: "Phase 2 · Isolation & Proof",
    source: "The High-Speed Cooling System Diagnostic Protocol",
    summary:
      "Overheating at highway speed — but not at idle — means the system cannot move enough heat under high load. Airflow or coolant flow is restricted; the diagnosis targets the load condition, not the gauge.",
    steps: [
      { step: "Verify", action: "Duplicate the symptom at highway speeds. Condition matters: overheats at speed but not at idle points to restricted radiator core or a partially stuck thermostat." },
      { step: "Visual crime scene", action: "Check for debris — leaves, bags — blocking the front of the radiator. Inspect fan operation, coolant level, and visible leaks." },
      { step: "Data", action: "Watch ECT PIDs versus load; a P0128 points at a thermostat that never fully closes the loop." },
      { step: "Pinpoint", action: "Test airflow across the condenser/radiator and coolant flow through the core. Prove the restriction with a measurement before replacing anything." },
      { step: "Verify", action: "Re-test under load at highway speed and confirm temperatures hold within spec." },
    ],
  },
  {
    id: "techab",
    title: "Tech A / Tech B Logic Gate",
    phase: "Exam strategy",
    source: "Master Diagnostic Logic · A1–A9 Integration Manual",
    summary:
      "Every exam statement is a standalone true/false question. Never let one statement's plausibility contaminate the other.",
    steps: [
      { step: "Split", action: "Assess Tech A's hypothesis as its own true/false question. Then assess Tech B's separately." },
      { step: "Gate", action: "A true + B true → answer C (Both). A true + B false → A. B true + A false → B. Both false → D." },
      { step: "Condition first", action: "Read the condition — 'under load', 'at idle', 'when cold'. Eliminate any answer that doesn't apply to that specific condition." },
      { step: "Distractors", action: "ASE distractors look right but don't address the specific root cause. The plausible-but-wrong answer is the trap." },
    ],
  },
  {
    id: "3cs",
    title: "The 3 C's Documentation",
    phase: "The Fix · Documentation",
    source: "A1–A9 Integration Manual · 16-Week Shop Manual",
    summary:
      "Professional documentation that closes every repair order — and every diagnosis you present.",
    steps: [
      { step: "Complaint", action: "The customer's words: 'Vehicle hesitates under heavy load.'" },
      { step: "Cause", action: "The proven fault with its measurement: 'Found #4 ignition coil resistance at 25k ohms (spec 12k).'" },
      { step: "Correction", action: "What was done and how it was verified: 'Replaced #4 coil; verified spark intensity and performed load-test drive.'" },
    ],
    proof: "Every 'out of spec' finding must be supported by a document during verification. 'Because I thought so' is not a valid measurement.",
  },
  {
    id: "cascades",
    title: "Engine Failure Cascade Map",
    phase: "Root-cause thinking",
    source: "Master Diagnostic Logic (p.14)",
    summary:
      "Failures chain across systems. The manual's worked example: a corroded ground cable (A6) starves the electric fuel pump → lean detonation (A8) → melted piston edge and compression loss (A1).",
    steps: [
      { step: "Origin", action: "A6 Electrical — corroded ground cable causes a system-wide voltage drop." },
      { step: "Trigger", action: "A8 Performance — the voltage drop starves the fuel pump, leaning the mixture into severe knock." },
      { step: "Result", action: "A1 Mechanical — extreme heat melts a piston edge; catastrophic compression loss." },
      { step: "Doctrine", action: "A Master Tech traces the cascade backward. A parts-swapper only fixes the piston — and the car comes back." },
    ],
    proof: "Engine layer model: Layer 1 Air/Valve logic (misfires, power loss) · Layer 2 Synchronization (timing snap → destruction) · Layer 3 Combustion core (compression loss, overheating) · Layer 4 Lubrication/thermal (seizure).",
  },
];

/** The sign-off thresholds every diagnosis is judged against. */
export const SIGNOFF_THRESHOLDS = [
  { system: "Electrical (A6)", test: "Identify voltage drop", threshold: "DMM reading < 0.5 V" },
  { system: "Engine mechanical (A1)", test: "Relative compression", threshold: "Waveform / percentage variance < 10%" },
  { system: "Fuel/air (A8)", test: "Mixture control", threshold: "Combined STFT/LTFT within ±10% under load" },
];
