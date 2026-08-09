import type { Scenario } from "./types";

/**
 * A2 Automatic Transmission, A3 Manual Drive Train & Axles and
 * A4 Suspension & Steering scenarios. Same structure and quality bar as the
 * engine-performance scenarios — only the bench tooling differs.
 */
export const CHASSIS_SCENARIOS: Scenario[] = [
  /* ------------------------------------------------------------------ A2 */
  {
    id: "odyssey-slipping-3rd",
    title: "Slipping On the 2–3 Upshift",
    vehicleId: "odyssey-2016",
    category: "A2",
    difficulty: "Intermediate",
    estimatedMinutes: 14,
    customerName: "Marcus Bell",
    customerMood: "Worried about a big bill",
    complaint:
      "When it shifts out of second the engine revs up before it catches. It's been getting worse and now it feels like it slips every time.",
    interview: [
      { q: "When did it begin?", a: "About a month ago, just once in a while. Now it's every drive." },
      { q: "Is it worse cold or hot?", a: "It's fine the first couple of minutes, then it starts once it warms up." },
      { q: "Does it happen under acceleration?", a: "Mostly when I'm accelerating normally. If I baby it, it's not as bad." },
      { q: "Has anything been serviced recently?", a: "I've never had the transmission fluid changed. It's got 118,000 miles." },
      { q: "Any warning lights?", a: "The check engine light came on last week and stayed on." },
      { q: "Any noises or leaks?", a: "There's a spot on my driveway, kind of reddish-brown." },
    ],
    failure: {
      id: "clutch-pack-wear-3rd",
      name: "Worn 3rd clutch pack with low line pressure from a leaking sealing ring",
      system: "Automatic Transmission",
      effects: { powerLoss: 0.18, roughIdle: 0.1 },
    },
    codes: [
      { code: "P0733", description: "Gear 3 Incorrect Ratio" },
      { code: "P0748", description: "Pressure Control Solenoid A Electrical", pending: true },
    ],
    freezeFrame: {
      "Engine RPM": "3480 rpm",
      "Vehicle Speed": "38 km/h",
      "Calculated Load": "44 %",
      "Trans Fluid Temp": "94 °C",
      "Commanded Gear": "3",
      "Actual Ratio": "1.94 (expected 1.02)",
      "TCC Slip": "312 rpm",
    },
    testDriveEvents: [
      { atSecond: 6, label: "Clean 1–2 shift", detail: "Engine speed drops cleanly, no flare" },
      { atSecond: 14, label: "Flare on 2–3", detail: "Engine rises ~700 rpm before gear engages" },
      { atSecond: 26, label: "Harsh reengagement", detail: "Gear catches abruptly after the flare" },
    ],
    audioProfile: {
      id: "trans-flare",
      label: "Engine flare during upshift",
      description: "Engine speed rises without a matching road-speed increase, then drops as the gear catches. Synthesized for training.",
      synthetic: true,
    },
    warningLights: ["MIL", "D indicator flashing"],
    inspection: [
      {
        id: "pan",
        system: "Transmission",
        label: "Transmission pan & case",
        findings: ["Damp film at the right-side axle seal", "Pan magnet coated with fine clutch material", "No metal chunks present"],
        measurement: "Fluid level 6 mm below the hot full mark",
        abnormal: true,
      },
      {
        id: "mounts",
        system: "Drivetrain",
        label: "Engine & trans mounts",
        findings: ["Mounts intact, no separation", "No excessive engine movement under load"],
        abnormal: false,
      },
      {
        id: "cooler",
        system: "Cooling",
        label: "Transmission cooler lines",
        findings: ["Lines secure, no restriction", "Cooler flow verified"],
        abnormal: false,
      },
      {
        id: "wiring",
        system: "Electrical",
        label: "Transmission harness connector",
        findings: ["Connector clean and locked", "No fluid wicking into the harness", "Terminals tight"],
        abnormal: false,
      },
    ],
    testPoints: [
      { id: "spc-a", label: "Pressure control solenoid A → ground", location: "Transmission", dcVolts: 12.4, ohms: 5.4, note: "Coil resistance in spec (5–6 Ω)" },
      { id: "shift-b", label: "Shift solenoid B → ground", location: "Transmission", dcVolts: 12.4, ohms: 12.8, note: "In spec (11–15 Ω)" },
      { id: "tcm-gnd", label: "TCM ground → battery negative", location: "Grounds", dcVolts: 0.03, continuity: true },
    ],
    tools: [
      {
        kind: "fluid",
        id: "atf",
        title: "ATF condition analysis",
        hint: "Pull the dipstick, wipe onto white paper and evaluate color, clarity and odor",
        samples: [
          {
            id: "atf-sample",
            label: "Transmission fluid",
            color: "#5a2415",
            condition: "Dark brown, opaque, suspended dark particles on the paper wipe",
            smell: "Distinct burnt odor",
            verdict: "Fluid is well past service life and carries friction material — consistent with clutch pack wear already in progress.",
            abnormal: true,
          },
          {
            id: "engine-oil",
            label: "Engine oil (reference)",
            color: "#8a6a22",
            condition: "Amber, translucent, no particles",
            smell: "Normal petroleum odor",
            verdict: "Engine oil condition is normal — it is being compared only to rule out cross-contamination.",
            abnormal: false,
          },
        ],
      },
      {
        kind: "gauge",
        id: "line-pressure",
        title: "Line pressure test",
        hint: "0–400 psi gauge installed at the line pressure tap; test at idle in each range and at stall",
        sets: [
          {
            id: "idle-d",
            label: "Idle in Drive",
            condition: "Engine at idle, brakes applied, fluid at 90 °C",
            readings: [
              { label: "Line pressure", measured: "58 psi", spec: "72–86 psi", abnormal: true, note: "Low across the board points to an internal leak or pump/regulator concern, not a single solenoid." },
              { label: "Idle speed", measured: "690 rpm", spec: "650–750 rpm", abnormal: false },
            ],
          },
          {
            id: "stall",
            label: "Stall test",
            condition: "Brakes locked, throttle to WOT for under 5 seconds",
            readings: [
              { label: "Line pressure at stall", measured: "121 psi", spec: "160–185 psi", abnormal: true },
              { label: "Stall speed", measured: "2740 rpm", spec: "2200–2500 rpm", abnormal: true, note: "High stall speed means slippage inside the transmission, not converter lockup failure." },
            ],
          },
          {
            id: "reverse",
            label: "Idle in Reverse",
            condition: "Engine at idle, brakes applied",
            readings: [
              { label: "Line pressure", measured: "96 psi", spec: "115–140 psi", abnormal: true },
            ],
          },
        ],
      },
      {
        kind: "codes",
        id: "tcm-codes",
        title: "TCM code & data review",
        hint: "Codes read directly from the transmission control module, not just the generic OBD-II list",
        module: "TCM (Transmission Control Module)",
        codes: [
          { code: "P0733", description: "Gear 3 Incorrect Ratio", status: "Current — 4 fail counts", freeze: "Input 3480 rpm / output 1794 rpm at the moment of the fault" },
          { code: "P0748", description: "Pressure Control Solenoid A Electrical", status: "History only — no fail counts this cycle" },
          { code: "P0841", description: "Transmission Fluid Pressure Sensor/Switch A Range/Performance", status: "Current — 2 fail counts" },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is the most likely root cause?",
        principle:
          "A ratio code tells you a gear slipped. Line pressure tells you whether the hydraulic system could hold it. Low pressure in every range points upstream of any single shift circuit.",
        options: [
          { id: "a", text: "Failed shift solenoid B", correct: false, reasoning: "Solenoid resistance is in spec and the transmission still commands and enters 3rd — it simply cannot hold it. A dead solenoid produces a missing gear, not a flare." },
          { id: "b", text: "Worn 3rd clutch pack with low line pressure from an internal leak", correct: true, reasoning: "Low pressure in every range, high stall speed, burnt fluid carrying friction material and a 3rd-gear ratio fault all describe hydraulic loss plus consumed clutch material." },
          { id: "c", text: "Low engine power causing perceived slip", correct: false, reasoning: "Engine data is normal and the ratio code proves input speed and output speed disagree — that is genuine mechanical slip." },
          { id: "d", text: "Faulty torque converter clutch solenoid", correct: false, reasoning: "TCC slip is a symptom of the same pressure loss, and TCC faults do not cause a 2–3 upshift flare." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "You have burnt fluid and low pressure. What is the next step before quoting a repair?",
        principle: "Establish whether the loss is external, an easily serviced restriction, or internal wear — that decision changes the repair by thousands of dollars.",
        options: [
          { id: "a", text: "Drop the pan, inspect the filter and magnet, and check the pressure again with a known-good gauge", correct: true, reasoning: "Correct. A collapsed or clogged filter can cause low pressure and is cheap to fix. The magnet's contents tell you how much clutch material has already been lost." },
          { id: "b", text: "Replace the transmission assembly", correct: false, reasoning: "That may be the outcome, but condemning a unit before pan inspection risks replacing a transmission for a $40 filter." },
          { id: "c", text: "Perform a fluid flush and return the vehicle", correct: false, reasoning: "A flush does not restore worn clutch material and cannot correct a hydraulic leak. Sending it out this way guarantees a comeback." },
          { id: "d", text: "Replace pressure control solenoid A because of P0748", correct: false, reasoning: "P0748 is history-only with no current fail counts, and the solenoid tested in spec. That is parts swapping." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "The pan shows heavy friction material and pressure stays low with a new filter. What repair is correct?",
        principle: "Repair the failure, replace the contaminated fluid path, and verify with the same measurements that condemned it.",
        options: [
          { id: "a", text: "Overhaul or replace the transmission, flush the cooler and lines, then re-verify line pressure and shift ratios", correct: true, reasoning: "Correct. Clutch debris circulates through the cooler; leaving it in place contaminates the repaired unit. Verification means re-running the pressure test, not just clearing codes." },
          { id: "b", text: "Change the fluid and add a friction modifier", correct: false, reasoning: "Additives do not restore consumed clutch material, and the pressure loss remains." },
          { id: "c", text: "Replace both shift solenoids", correct: false, reasoning: "Both solenoids tested in spec and neither explains low pressure in every range." },
          { id: "d", text: "Clear the codes and monitor", correct: false, reasoning: "The failure is mechanical and progressive. Monitoring only delays the repair and risks a stranded customer." },
        ],
      },
    ],
    rootCause:
      "Worn 3rd clutch pack combined with internal hydraulic leakage, producing low line pressure in every range and a 2–3 upshift flare.",
    repair:
      "Overhaul or replace the transmission, flush the cooler and lines to remove circulating friction material, refill with the specified ATF, and verify line pressure and gear ratios on a road test.",
    lesson:
      "A ratio code identifies which gear slipped; it does not identify why. Always follow it with a line pressure test in every range. Low pressure everywhere means pump, regulator or internal leakage. Pressure that is correct in every range except one means the circuit for that gear — a solenoid, seal or clutch pack. Fluid condition then tells you how much life has already been consumed.",
  },
  {
    id: "altima-harsh-shift",
    title: "Harsh Engagement and Judder",
    vehicleId: "altima-2017",
    category: "A2",
    difficulty: "Advanced",
    estimatedMinutes: 15,
    customerName: "Priya Raghavan",
    customerMood: "Skeptical, was told to replace the whole unit",
    complaint:
      "It shudders like driving over rumble strips when I accelerate gently around 40 mph, and it bangs into gear when I put it in Drive.",
    interview: [
      { q: "When did it begin?", a: "Maybe six weeks ago. Another shop told me the transmission is done." },
      { q: "When exactly does the shudder happen?", a: "Light throttle, around 40 to 45. If I press harder it goes away." },
      { q: "Is it worse cold or hot?", a: "Worse once it's warmed up and I'm cruising." },
      { q: "Has anything been serviced?", a: "A quick-lube place topped off the fluid last year with something universal." },
      { q: "Any warning lights?", a: "No lights at all, which is why I'm confused." },
      { q: "Any noises?", a: "No whining or grinding, just the shudder and the clunk into Drive." },
    ],
    failure: {
      id: "tcc-shudder",
      name: "Torque converter clutch shudder from degraded, incorrect-spec fluid",
      system: "Automatic Transmission",
      effects: { roughIdle: 0.2, powerLoss: 0.05 },
    },
    codes: [{ code: "P0741", description: "Torque Converter Clutch Circuit Performance", pending: true }],
    freezeFrame: {
      "Engine RPM": "1620 rpm",
      "Vehicle Speed": "68 km/h",
      "Calculated Load": "26 %",
      "Trans Fluid Temp": "88 °C",
      "TCC Duty Cycle": "88 %",
      "TCC Slip": "64 rpm oscillating",
    },
    testDriveEvents: [
      { atSecond: 8, label: "Firm engagement into Drive", detail: "Noticeable clunk when selecting Drive from Park" },
      { atSecond: 18, label: "Shudder under light throttle", detail: "Rapid 12–15 Hz vibration between 38 and 46 mph" },
      { atSecond: 27, label: "Shudder clears under load", detail: "Vibration disappears when throttle increases and the converter unlocks" },
    ],
    audioProfile: {
      id: "tcc-shudder",
      label: "Light-throttle drivetrain shudder",
      description: "Low-frequency pulsing under light cruise that clears with throttle input. Synthesized for training.",
      synthetic: true,
    },
    warningLights: [],
    inspection: [
      {
        id: "pan",
        system: "Transmission",
        label: "CVT fluid & pan",
        findings: ["Fluid dark and thin", "Service sticker shows a universal ATF top-off", "Pan magnet lightly coated, no chunks"],
        measurement: "Fluid at correct level, viscosity visibly thinner than reference",
        abnormal: true,
      },
      {
        id: "mounts",
        system: "Drivetrain",
        label: "Powertrain mounts",
        findings: ["Front mount intact", "No hydraulic mount leakage", "Movement within limits"],
        abnormal: false,
      },
      {
        id: "axles",
        system: "Drivetrain",
        label: "Front axles",
        findings: ["Boots intact", "No play in the inner joints"],
        abnormal: false,
      },
      {
        id: "plugs",
        system: "Engine",
        label: "Ignition system",
        findings: ["Plugs replaced 12,000 miles ago", "No misfire counts on any cylinder"],
        abnormal: false,
      },
    ],
    testPoints: [
      { id: "tcc-sol", label: "TCC solenoid → ground", location: "Transmission", dcVolts: 12.3, ohms: 11.6, note: "In spec (10–14 Ω)" },
      { id: "trans-gnd", label: "Trans case → battery negative", location: "Grounds", dcVolts: 0.02, continuity: true },
    ],
    tools: [
      {
        kind: "fluid",
        id: "cvt-fluid",
        title: "CVT fluid condition analysis",
        hint: "Compare the in-service sample against a new fluid reference on white paper",
        samples: [
          {
            id: "in-service",
            label: "In-service fluid",
            color: "#6b4a20",
            condition: "Brown, hazy, thin on the paper wipe with a wide spread ring",
            smell: "Slightly burnt",
            verdict: "Non-specification fluid with degraded friction characteristics — the exact condition that causes converter clutch shudder.",
            abnormal: true,
          },
          {
            id: "new-ref",
            label: "New OE-spec fluid",
            color: "#2f8ac7",
            condition: "Clear blue-green, thick even bead on paper",
            smell: "Neutral",
            verdict: "Reference sample. Note the difference in both color and how far the fluid spreads.",
            abnormal: false,
          },
        ],
      },
      {
        kind: "gauge",
        id: "tcc-slip",
        title: "TCC slip & duty monitor",
        hint: "Graph engine rpm against input shaft rpm while holding a steady light-throttle cruise",
        sets: [
          {
            id: "cruise",
            label: "42 mph light throttle",
            condition: "Converter clutch commanded on, 88 % duty",
            readings: [
              { label: "TCC slip", measured: "38–92 rpm oscillating", spec: "0–20 rpm steady", abnormal: true, note: "Oscillating slip while locked is the electronic signature of shudder." },
              { label: "TCC duty cycle", measured: "88 %", spec: "80–95 %", abnormal: false, note: "The module is commanding lockup correctly — the clutch is not holding it." },
              { label: "Fluid temperature", measured: "88 °C", spec: "70–100 °C", abnormal: false },
            ],
          },
          {
            id: "wot",
            label: "Heavy throttle",
            condition: "Converter clutch commanded off",
            readings: [
              { label: "TCC slip", measured: "480 rpm steady", spec: "Unlocked — slip expected", abnormal: false },
              { label: "Vibration", measured: "None reported", spec: "None", abnormal: false, note: "Symptom absent whenever the clutch is unlocked — that is the key correlation." },
            ],
          },
        ],
      },
      {
        kind: "gauge",
        id: "line-pressure",
        title: "Line pressure test",
        hint: "Verify the hydraulic system can support lockup before condemning the converter",
        sets: [
          {
            id: "idle",
            label: "Idle in Drive",
            readings: [
              { label: "Line pressure", measured: "78 psi", spec: "70–85 psi", abnormal: false },
              { label: "Secondary pressure", measured: "412 psi", spec: "390–450 psi", abnormal: false, note: "Hydraulics are healthy — this is not a pressure failure." },
            ],
          },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is the most likely root cause of the shudder?",
        principle:
          "A symptom that appears only when the converter clutch is applied, with healthy line pressure and correct duty command, isolates the friction interface — not the control circuit.",
        options: [
          { id: "a", text: "Internal transmission failure requiring replacement", correct: false, reasoning: "Line and secondary pressures are in spec, there is no ratio error and no metal in the pan. Nothing supports internal mechanical failure." },
          { id: "b", text: "Torque converter clutch shudder caused by degraded, non-specification fluid", correct: true, reasoning: "The vibration exists only while the clutch is locked, duty command is correct, pressures are normal, and the fluid is the wrong specification and burnt — a classic friction-interface problem." },
          { id: "c", text: "Engine misfire under light load", correct: false, reasoning: "No misfire counts, no codes and the vibration is tied to converter lockup state, not cylinder events." },
          { id: "d", text: "Worn front CV joints", correct: false, reasoning: "CV wear shows as a clicking noise on turns and vibration that tracks road speed, not converter lockup." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "How do you confirm the converter clutch is the source before selling anything?",
        principle: "Confirm by controlling the variable: if disabling the suspect component eliminates the symptom, you have proof.",
        options: [
          { id: "a", text: "Command the TCC off with the scan tool while the shudder is occurring and confirm it disappears", correct: true, reasoning: "Correct. Turning the clutch off during the symptom is a direct, reversible confirmation that costs the customer nothing." },
          { id: "b", text: "Replace the torque converter", correct: false, reasoning: "That is the repair, not the test — and it may not even be needed if the fluid is the cause." },
          { id: "c", text: "Replace the spark plugs to rule out misfire", correct: false, reasoning: "Misfire has already been ruled out by data. Replacing good parts to eliminate a possibility is guessing." },
          { id: "d", text: "Road test on a different road surface", correct: false, reasoning: "The symptom is already reproducible and load-correlated. A different surface adds no diagnostic value." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "Commanding the TCC off eliminates the shudder. What repair should be performed first?",
        principle: "Correct the cause of the friction failure with the least invasive repair that has a documented success rate, then verify with the same slip data.",
        options: [
          { id: "a", text: "Perform a full fluid exchange with the correct OE-specification fluid, then re-verify TCC slip on a road test", correct: true, reasoning: "Correct. Wrong-spec fluid is the documented cause of TCC shudder and a proper exchange resolves it in most cases. Verification means slip back under 20 rpm while locked." },
          { id: "b", text: "Replace the transmission assembly", correct: false, reasoning: "Nothing in the pressure or ratio data supports replacing a functional unit — this is exactly the overselling the customer already suspected." },
          { id: "c", text: "Add a shudder-fix additive and release the vehicle", correct: false, reasoning: "An additive on top of wrong-spec fluid masks the concern without correcting the fluid chemistry." },
          { id: "d", text: "Replace the TCC solenoid", correct: false, reasoning: "The solenoid is in spec electrically and duty cycle is being commanded correctly." },
        ],
      },
    ],
    rootCause:
      "Torque converter clutch shudder caused by degraded, non-specification transmission fluid with incorrect friction characteristics.",
    repair:
      "Full fluid exchange with the specified OE fluid, road test verification that TCC slip stays under 20 rpm while locked, and customer education on fluid specification.",
    lesson:
      "Shudder that appears only under light throttle at a steady speed and clears with more throttle is converter clutch shudder until proven otherwise. Confirm by commanding the clutch off during the symptom. The most common cause is not a failed converter — it is the wrong fluid. Verify fluid specification before quoting a transmission.",
  },

  /* ------------------------------------------------------------------ A3 */
  {
    id: "wrangler-driveline-vibration",
    title: "Driveline Vibration Above 45 MPH",
    vehicleId: "wrangler-2018",
    category: "A3",
    difficulty: "Intermediate",
    estimatedMinutes: 13,
    customerName: "Colt Menendez",
    customerMood: "Practical, wants it fixed right",
    complaint:
      "There's a vibration in the floor that starts around 45 and gets worse the faster I go. New tires didn't fix it.",
    interview: [
      { q: "When did it begin?", a: "Right after I put a small lift kit on it about two months ago." },
      { q: "Does the speed matter?", a: "Starts near 45 and gets worse all the way up. It doesn't come and go." },
      { q: "Does braking change it?", a: "No — braking makes no difference at all." },
      { q: "Does turning change it?", a: "No. It's the same going straight or on a curve." },
      { q: "Have you tried anything?", a: "New tires, balanced twice. Same vibration." },
      { q: "Any noises?", a: "A little clunk when I shift from Reverse to Drive." },
    ],
    failure: {
      id: "u-joint-driveline-angle",
      name: "Worn rear U-joint with excessive driveline operating angle after a lift",
      system: "Drive Train",
      effects: { noiseAtSpeed: "Speed-related driveline vibration", powerLoss: 0.02 },
    },
    codes: [],
    freezeFrame: {},
    testDriveEvents: [
      { atSecond: 10, label: "Smooth to 40 mph", detail: "No perceptible vibration below 40" },
      { atSecond: 18, label: "Vibration onset", detail: "Floor and seat vibration begins near 45 mph" },
      { atSecond: 28, label: "Amplitude grows with speed", detail: "Vibration intensity increases continuously with road speed, unaffected by throttle or braking" },
    ],
    audioProfile: {
      id: "driveline-vibration",
      label: "Speed-related driveline vibration",
      description: "Low-frequency rumble that rises in both pitch and amplitude with road speed. Synthesized for training.",
      synthetic: true,
    },
    warningLights: [],
    inspection: [
      {
        id: "driveshaft",
        system: "Drive Train",
        label: "Rear driveshaft & U-joints",
        findings: ["Rear U-joint has perceptible radial play by hand", "Rust-colored dust around one bearing cap", "Front joint tight"],
        measurement: "Rear joint play: 0.6 mm (spec: no perceptible play)",
        abnormal: true,
      },
      {
        id: "pinion",
        system: "Axle",
        label: "Rear pinion & yoke",
        findings: ["Pinion nut torque intact", "No pinion bearing play", "Yoke runout within limits"],
        abnormal: false,
      },
      {
        id: "diff-fluid",
        system: "Axle",
        label: "Differential housing",
        findings: ["No leaks at the pinion seal or cover", "Vent hose clear"],
        abnormal: false,
      },
      {
        id: "tires",
        system: "Wheels",
        label: "Tires & balance",
        findings: ["Recent balance weights present on all four", "Even tread, no cupping", "Runout within limits"],
        abnormal: false,
      },
    ],
    testPoints: [],
    hideScanTool: true,
    hideMultimeter: true,
    tools: [
      {
        kind: "vibration",
        id: "vibration-analyzer",
        title: "Driveline vibration analyzer",
        hint: "Accelerometer on the transmission tailshaft; hold each speed steady for five seconds",
        analysis:
          "Amplitude rises continuously with road speed and does not peak-and-fall the way a tire imbalance does. Frequency tracks driveshaft speed at roughly 2.6× wheel speed — that is second-order driveline, not first-order tire.",
        samples: [
          { speed: 30, amplitude: 8, note: "Baseline, no complaint" },
          { speed: 40, amplitude: 14, note: "Barely perceptible" },
          { speed: 50, amplitude: 42, note: "Clearly felt in the floor" },
          { speed: 60, amplitude: 68, note: "Strong, matches the customer description" },
          { speed: 70, amplitude: 91, note: "Continues climbing — no resonance peak" },
        ],
      },
      {
        kind: "gauge",
        id: "driveline-angles",
        title: "Driveline angle measurement",
        hint: "Digital inclinometer on the transmission output, driveshaft and pinion flanges with the vehicle at ride height",
        sets: [
          {
            id: "rear",
            label: "Rear driveshaft",
            condition: "Vehicle at curb ride height, tires on the ground",
            readings: [
              { label: "Transmission output angle", measured: "3.1°", spec: "0–3°", abnormal: false },
              { label: "Driveshaft angle", measured: "8.4°", spec: "—", abnormal: false },
              { label: "Rear pinion angle", measured: "2.2°", spec: "Within 1° of trans output", abnormal: true, note: "Working angle mismatch after the lift loads the U-joints unevenly through every rotation." },
              { label: "Front joint working angle", measured: "5.3°", spec: "1–3°", abnormal: true },
              { label: "Rear joint working angle", measured: "6.2°", spec: "1–3°", abnormal: true },
            ],
          },
        ],
      },
      {
        kind: "fluid",
        id: "diff-fluid-sample",
        title: "Differential fluid inspection",
        hint: "Pull a sample from the fill plug and inspect for metal, water and odor",
        samples: [
          {
            id: "rear-diff",
            label: "Rear differential",
            color: "#3f3a1c",
            condition: "Dark olive, translucent, no visible metal glitter",
            smell: "Normal gear oil sulfur odor",
            verdict: "Gear oil is due for service by mileage but shows no sign of gear or bearing failure — the differential is not the vibration source.",
            abnormal: false,
          },
          {
            id: "transfer-case",
            label: "Transfer case",
            color: "#7a5a2a",
            condition: "Amber-brown, clear, no particles",
            smell: "Normal",
            verdict: "Transfer case fluid is in acceptable condition with no chain wear debris.",
            abnormal: false,
          },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is the most likely root cause?",
        principle:
          "Vibration that grows continuously with speed and is unaffected by braking or steering is driveline. Tire and wheel problems normally peak in a speed band; driveline problems keep climbing.",
        options: [
          { id: "a", text: "Tire imbalance", correct: false, reasoning: "New tires balanced twice, no cupping, and the amplitude never peaks and falls the way an imbalance does." },
          { id: "b", text: "Worn rear U-joint aggravated by excessive driveline angle after the lift", correct: true, reasoning: "Measurable joint play, working angles well beyond 3°, symptom onset immediately after the lift and a continuously rising amplitude curve all agree." },
          { id: "c", text: "Warped brake rotors", correct: false, reasoning: "Braking makes no difference to the vibration, which rules the brake system out immediately." },
          { id: "d", text: "Failing wheel bearing", correct: false, reasoning: "A bearing produces noise that changes with cornering load. This vibration is identical straight and in a curve." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "What test best confirms the diagnosis?",
        principle: "Match the measured frequency to a rotating component's speed — that identifies which part is producing the vibration rather than guessing.",
        options: [
          { id: "a", text: "Measure vibration frequency and compare it to driveshaft rotational speed", correct: true, reasoning: "Correct. If the frequency equals driveshaft rpm order rather than tire rpm order, the driveline is confirmed as the source." },
          { id: "b", text: "Rebalance the tires a third time", correct: false, reasoning: "Two balances have already been performed with no change. Repeating a failed test is not diagnosis." },
          { id: "c", text: "Replace the rear differential", correct: false, reasoning: "Differential fluid is clean and no bearing play exists. That is an expensive guess." },
          { id: "d", text: "Scan for chassis codes", correct: false, reasoning: "Mechanical driveline wear sets no codes — a clean scan proves nothing here." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What repair addresses both the failure and the reason it failed?",
        principle: "Replacing a worn part without correcting the condition that wore it out produces a repeat failure.",
        options: [
          { id: "a", text: "Replace the worn U-joints and correct pinion angle with shims so working angles fall within 1–3°", correct: true, reasoning: "Correct. New joints alone would wear out again at 6° working angles. Correcting the angle is what makes the repair last." },
          { id: "b", text: "Replace both U-joints only", correct: false, reasoning: "The lift-induced angle is what destroyed the original joints. New joints will fail the same way." },
          { id: "c", text: "Install a driveshaft damper", correct: false, reasoning: "Masking a vibration with a damper leaves the mechanical wear and excessive angle in service." },
          { id: "d", text: "Remove the lift kit", correct: false, reasoning: "Unnecessary — the lift is serviceable once driveline angles are corrected with shims or a correction kit." },
        ],
      },
    ],
    rootCause:
      "Worn rear U-joint caused by excessive driveline working angles introduced when the suspension lift changed pinion geometry.",
    repair:
      "Replace both driveshaft U-joints, install pinion shims to bring working angles into the 1–3° range, and verify with an inclinometer and a road test using the vibration analyzer.",
    lesson:
      "Triage vibration by what changes it. Braking-only means brakes. Cornering-sensitive noise means wheel bearings. Speed-related vibration that keeps growing and ignores throttle and braking means driveline. Then match frequency to component speed — driveshaft turns roughly three times faster than the tires, so the vibration frequency tells you which one you are feeling.",
  },
  {
    id: "ram-transfer-case",
    title: "4WD Won't Engage, Clunk on Turns",
    vehicleId: "ram1500-2016",
    category: "A3",
    difficulty: "Advanced",
    estimatedMinutes: 14,
    customerName: "Janet Fowler",
    customerMood: "Needs it working before winter",
    complaint:
      "I push the 4WD button and the light just blinks and never stays on. There's also a clicking sound when I turn hard into my driveway.",
    interview: [
      { q: "When did it begin?", a: "The clicking started this summer. The 4WD problem I noticed last week when I tried it." },
      { q: "Does the 4WD light do anything?", a: "It flashes for about ten seconds and then goes out. Nothing changes in how it drives." },
      { q: "When does the clicking happen?", a: "Only when I turn the wheel most of the way and I'm moving slowly." },
      { q: "Louder in one direction?", a: "Definitely louder turning left." },
      { q: "Any leaks?", a: "There's a greasy mess behind the front wheel on the driver's side." },
      { q: "Any other lights?", a: "No, just the 4WD one blinking." },
    ],
    failure: {
      id: "transfer-case-shift-motor",
      name: "Failed transfer case encoder motor plus a torn outer CV boot on the left front axle",
      system: "Drive Train",
      effects: { noiseAtSpeed: "Clicking on tight turns" },
    },
    codes: [],
    freezeFrame: {},
    testDriveEvents: [
      { atSecond: 8, label: "4WD request", detail: "Indicator flashes, no change in driveline behavior" },
      { atSecond: 16, label: "Clicking on tight left turn", detail: "Rhythmic click that speeds up with wheel rotation" },
      { atSecond: 24, label: "Straight-line normal", detail: "No noise or vibration driving straight" },
    ],
    audioProfile: {
      id: "cv-click",
      label: "Rhythmic clicking on tight turns",
      description: "Sharp repeating click that tracks wheel speed only during tight low-speed turns. Synthesized for training.",
      synthetic: true,
    },
    warningLights: ["4WD indicator flashing"],
    inspection: [
      {
        id: "cv",
        system: "Drive Train",
        label: "Left front CV axle",
        findings: ["Outer boot split at the accordion pleats", "Grease slung across the inner fender and control arm", "Roughness felt when rotating the joint at full articulation"],
        measurement: "Boot clamp intact, boot torn approximately 25 mm",
        abnormal: true,
      },
      {
        id: "transfer",
        system: "Transfer Case",
        label: "Transfer case & shift motor",
        findings: ["Encoder motor housing corroded at the connector", "Motor does not move the shift fork when commanded", "Case fluid at correct level"],
        abnormal: true,
      },
      {
        id: "front-diff",
        system: "Axle",
        label: "Front differential",
        findings: ["No leaks at the axle seals", "Fluid clean, no metal", "Vacuum disconnect operates"],
        abnormal: false,
      },
      {
        id: "driveshaft",
        system: "Drive Train",
        label: "Front driveshaft",
        findings: ["U-joints tight", "No runout", "Center support intact"],
        abnormal: false,
      },
    ],
    testPoints: [
      { id: "motor-feed", label: "Encoder motor power feed → ground", location: "Transfer Case", dcVolts: 12.4, note: "Battery voltage present at the connector when 4WD is requested — the supply side is good" },
      { id: "motor-winding", label: "Encoder motor windings", location: "Transfer Case", ohms: "OL", note: "Open circuit — motor winding failure" },
      { id: "encoder-sig", label: "Encoder position signal → ground", location: "Transfer Case", dcVolts: 0.4, note: "Signal frozen at the 2WD position value and never changes" },
      { id: "tccm-gnd", label: "TCCM ground → battery negative", location: "Grounds", dcVolts: 0.03, continuity: true },
    ],
    tools: [
      {
        kind: "codes",
        id: "tccm-codes",
        title: "Transfer case module scan",
        hint: "Codes read from the TCCM — these never appear in a generic OBD-II powertrain scan",
        module: "TCCM (Transfer Case Control Module)",
        codes: [
          { code: "C0306", description: "Transfer Case Motor Circuit", status: "Current — 6 fail counts", freeze: "Requested 4HI, encoder position unchanged after 5 s" },
          { code: "C0327", description: "Encoder Circuit Performance", status: "Current — 6 fail counts" },
        ],
      },
      {
        kind: "actuator",
        id: "tc-actuator",
        title: "Transfer case actuator tests",
        hint: "Bidirectional control commands sent from the scan tool while watching encoder feedback",
        actuators: [
          {
            id: "shift-4hi",
            name: "Command shift to 4HI",
            command: "TCCM bidirectional — engage 4HI",
            expected: "Encoder position sweeps from 2HI to 4HI within 3 seconds",
            actual: "No encoder movement; motor draws 0.0 A",
            abnormal: true,
          },
          {
            id: "shift-2hi",
            name: "Command shift to 2HI",
            command: "TCCM bidirectional — return to 2HI",
            expected: "Encoder confirms 2HI position",
            actual: "Encoder already reads 2HI; no movement observed",
            abnormal: true,
          },
          {
            id: "front-actuator",
            name: "Front axle disconnect actuator",
            command: "Engage front axle",
            expected: "Actuator engages, position switch confirms",
            actual: "Actuator engages and confirms normally",
            abnormal: false,
          },
        ],
      },
      {
        kind: "fluid",
        id: "tc-fluid",
        title: "Driveline fluid inspection",
        hint: "Sample the transfer case and front differential to rule out internal damage",
        samples: [
          {
            id: "tc",
            label: "Transfer case",
            color: "#8f6b30",
            condition: "Amber, clear, no chain debris",
            smell: "Normal",
            verdict: "No evidence of internal chain or planetary wear — the failure is electromechanical, not mechanical.",
            abnormal: false,
          },
          {
            id: "front-diff",
            label: "Front differential",
            color: "#4a4321",
            condition: "Olive, clear, no glitter",
            smell: "Normal gear oil",
            verdict: "Front differential is healthy.",
            abnormal: false,
          },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "The customer has two concerns. What are the root causes?",
        principle:
          "Two symptoms do not have to share one cause. Treat each complaint as its own diagnosis and prove each independently.",
        options: [
          { id: "a", text: "A failed transfer case encoder motor and, separately, a torn left front CV boot with a worn outer joint", correct: true, reasoning: "The motor winding is open with power present at the connector, and the clicking on tight turns with a split boot and slung grease is a textbook outer CV joint failure. Two independent faults." },
          { id: "b", text: "A single TCCM software fault causing both symptoms", correct: false, reasoning: "A module fault cannot tear a CV boot, and the module is correctly commanding the motor — the motor simply cannot respond." },
          { id: "c", text: "Worn transfer case chain", correct: false, reasoning: "Transfer case fluid is clean with no chain debris and the case never actually shifts to test the chain." },
          { id: "d", text: "Failed front axle disconnect actuator", correct: false, reasoning: "The disconnect actuator commands and confirms normally in the bidirectional test." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "The motor does not respond. What proves the module is not at fault?",
        principle: "Before condemning an actuator, prove it has power, ground and a valid command; before condemning a module, prove the actuator can accept the command.",
        options: [
          { id: "a", text: "Verify battery voltage and ground at the motor connector during the command, then measure motor winding resistance", correct: true, reasoning: "Correct. Power present, ground good, command issued, winding open — that sequence condemns the motor and exonerates the module." },
          { id: "b", text: "Replace the TCCM", correct: false, reasoning: "The module issued the command and logged accurate feedback codes. Replacing it changes nothing." },
          { id: "c", text: "Refill the transfer case", correct: false, reasoning: "Fluid level is correct and fluid does not power the shift motor." },
          { id: "d", text: "Clear codes and retry", correct: false, reasoning: "The fault is a hard open circuit; clearing codes only deletes the fail counts you are using as evidence." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What repair plan should be presented to the customer?",
        principle: "Sell what the evidence supports, prioritize by safety, and quote each concern separately so the customer can make an informed choice.",
        options: [
          { id: "a", text: "Replace the transfer case encoder motor, replace the left front CV axle assembly, then verify 4WD engagement and re-test for noise", correct: true, reasoning: "Correct. Each repair matches a proven fault. A torn boot that has been slinging grease all summer means the joint is contaminated — reboot alone would be a short-lived repair on a high-mileage axle." },
          { id: "b", text: "Replace the transfer case assembly", correct: false, reasoning: "The case is mechanically sound. Only the external shift motor failed." },
          { id: "c", text: "Reboot and repack the CV joint only, and ignore the 4WD concern", correct: false, reasoning: "Ignoring the 4WD failure leaves the customer without four-wheel drive before winter, which is what she came in for." },
          { id: "d", text: "Replace the front differential and the encoder motor", correct: false, reasoning: "The front differential tested clean — adding it is an unsupported upsell." },
        ],
      },
    ],
    rootCause:
      "Open-circuit transfer case encoder motor preventing 4WD engagement, plus an independent torn outer CV boot with a contaminated, worn left front joint.",
    repair:
      "Replace the transfer case encoder motor and the left front CV axle assembly, clear TCCM codes, and verify 4HI engagement with encoder feedback plus a noise-free full-lock turn test.",
    lesson:
      "When a customer reports two symptoms, resist the urge to force one cause. Diagnose each concern to its own proof. Also remember which module holds the data: chassis and driveline faults live in the TCCM or ABS module and will never appear in a generic powertrain scan.",
  },

  /* ------------------------------------------------------------------ A4 */
  {
    id: "outback-pull-wear",
    title: "Pulls Right With Inner Tire Wear",
    vehicleId: "outback-2017",
    category: "A4",
    difficulty: "Intermediate",
    estimatedMinutes: 13,
    customerName: "Hal Brenner",
    customerMood: "Annoyed, already bought two sets of tires",
    complaint:
      "It drifts to the right if I loosen my grip, and the front tires are shot on the inside edge after only 18,000 miles.",
    interview: [
      { q: "When did it begin?", a: "Since I hit a big pothole last winter. It's been that way ever since." },
      { q: "Does the steering wheel sit straight?", a: "No, I hold it about ten degrees left to go straight." },
      { q: "Does it pull under braking?", a: "No, braking is fine and straight." },
      { q: "Any noises?", a: "A little clunk over speed bumps on the right." },
      { q: "What has been done already?", a: "Two sets of tires and a rotation. Nobody mentioned an alignment." },
      { q: "Does the ride feel different?", a: "The right front feels bouncier over dips." },
    ],
    failure: {
      id: "alignment-camber-toe",
      name: "Right front camber and toe out of specification with a worn strut, from pothole impact",
      system: "Suspension & Steering",
      effects: { noiseAtSpeed: "Clunk over bumps, right front" },
    },
    codes: [],
    freezeFrame: {},
    testDriveEvents: [
      { atSecond: 7, label: "Steering wheel off-center", detail: "Wheel held ~10° left to track straight" },
      { atSecond: 15, label: "Drift to the right", detail: "Vehicle moves right at a steady rate on a crowned but neutral surface" },
      { atSecond: 25, label: "Right front float over dips", detail: "Extra rebound oscillation on the right front only" },
    ],
    audioProfile: {
      id: "suspension-clunk",
      label: "Suspension clunk over bumps",
      description: "Single dull clunk from the right front on compression events. Synthesized for training.",
      synthetic: true,
    },
    warningLights: [],
    inspection: [
      {
        id: "tires",
        system: "Wheels",
        label: "Tire wear pattern",
        findings: ["Right front worn to the wear bars on the inner third", "Left front shows lighter inner wear", "Rears wearing evenly"],
        measurement: "RF inner 2/32 in, outer 7/32 in",
        abnormal: true,
      },
      {
        id: "strut",
        system: "Suspension",
        label: "Right front strut",
        findings: ["Oil film down the strut body", "Bounce test shows 3 oscillations", "Upper mount bearing notchy when turned"],
        measurement: "Rebound damping visibly weaker than the left side",
        abnormal: true,
      },
      {
        id: "steering",
        system: "Steering",
        label: "Steering linkage",
        findings: ["Tie rod ends tight, no play", "Rack boots intact", "No play in the intermediate shaft"],
        abnormal: false,
      },
      {
        id: "ps",
        system: "Steering",
        label: "Power steering system",
        findings: ["Electric power steering, no leaks possible", "No assist codes stored", "Effort even both directions"],
        abnormal: false,
      },
    ],
    testPoints: [
      { id: "eps-feed", label: "EPS module power feed → ground", location: "Steering", dcVolts: 12.5, runningDcVolts: 14.0 },
      { id: "eps-gnd", label: "EPS ground → battery negative", location: "Grounds", dcVolts: 0.02, continuity: true },
    ],
    hideScanTool: true,
    tools: [
      {
        kind: "gauge",
        id: "alignment",
        title: "Four-wheel alignment rack",
        hint: "Live alignment readings with the vehicle at curb weight on the rack",
        sets: [
          {
            id: "front",
            label: "Front axle",
            condition: "Curb weight, fuel 3/4, steering wheel centered on the clamp",
            readings: [
              { label: "LF camber", measured: "-0.6°", spec: "-0.5° ±0.75°", abnormal: false },
              { label: "RF camber", measured: "-2.4°", spec: "-0.5° ±0.75°", abnormal: true, note: "Excess negative camber loads the inner tread — this matches the wear pattern exactly." },
              { label: "Cross camber", measured: "1.8°", spec: "Max 0.5°", abnormal: true, note: "Camber split pulls toward the more positive side, which is the right." },
              { label: "LF toe", measured: "+0.08°", spec: "+0.10° ±0.10°", abnormal: false },
              { label: "RF toe", measured: "-0.34°", spec: "+0.10° ±0.10°", abnormal: true, note: "Toe-out scrubs tread away quickly and compounds the camber wear." },
              { label: "LF caster", measured: "3.2°", spec: "3.0° ±0.75°", abnormal: false },
              { label: "RF caster", measured: "1.9°", spec: "3.0° ±0.75°", abnormal: true, note: "Caster split also pulls toward the lower-caster side." },
            ],
          },
          {
            id: "rear",
            label: "Rear axle",
            readings: [
              { label: "LR camber", measured: "-0.8°", spec: "-1.0° ±0.75°", abnormal: false },
              { label: "RR camber", measured: "-0.9°", spec: "-1.0° ±0.75°", abnormal: false },
              { label: "Total toe", measured: "+0.16°", spec: "+0.20° ±0.20°", abnormal: false },
              { label: "Thrust angle", measured: "0.04°", spec: "0° ±0.20°", abnormal: false, note: "Rear geometry is good — the concern is entirely at the front." },
            ],
          },
        ],
      },
      {
        kind: "gauge",
        id: "ride-height",
        title: "Ride height measurement",
        hint: "Measured from the wheel center to the fender lip on a level surface",
        sets: [
          {
            id: "heights",
            label: "All four corners",
            condition: "Level floor, tires at 35 psi, vehicle bounced and settled",
            readings: [
              { label: "Left front", measured: "394 mm", spec: "390–400 mm", abnormal: false },
              { label: "Right front", measured: "379 mm", spec: "390–400 mm", abnormal: true, note: "Low ride height on the right front changes camber and toe dynamically and confirms a suspension component concern, not just an alignment setting." },
              { label: "Left rear", measured: "402 mm", spec: "398–408 mm", abnormal: false },
              { label: "Right rear", measured: "401 mm", spec: "398–408 mm", abnormal: false },
              { label: "Side-to-side front difference", measured: "15 mm", spec: "Max 10 mm", abnormal: true },
            ],
          },
        ],
      },
      {
        kind: "actuator",
        id: "strut-test",
        title: "Strut & shock evaluation",
        hint: "Bounce test and visual leak check at each corner",
        actuators: [
          {
            id: "rf",
            name: "Right front strut",
            command: "Compress and release, count oscillations",
            expected: "Settles within 1 oscillation, no fluid on the body",
            actual: "3 oscillations, oil film on the strut body, notchy upper mount",
            abnormal: true,
          },
          {
            id: "lf",
            name: "Left front strut",
            command: "Compress and release, count oscillations",
            expected: "Settles within 1 oscillation",
            actual: "Settles in 1 oscillation, dry body",
            abnormal: false,
          },
          {
            id: "rear",
            name: "Rear shocks",
            command: "Compress and release, count oscillations",
            expected: "Settles within 1 oscillation",
            actual: "Both settle in 1 oscillation, dry",
            abnormal: false,
          },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is the root cause of the pull and the inner tire wear?",
        principle:
          "Camber and caster splits cause pull; camber and toe errors cause wear patterns. Read the tire, then confirm with the rack.",
        options: [
          { id: "a", text: "Right front camber, caster and toe out of specification with a collapsed strut from pothole impact", correct: true, reasoning: "Excess negative camber and toe-out on the right front match the inner wear precisely; camber and caster splits explain the pull; low ride height and a failed bounce test explain why the geometry moved." },
          { id: "b", text: "Defective tires", correct: false, reasoning: "Two sets of tires wore the same way in the same place. When new parts fail identically, the cause is the vehicle, not the parts." },
          { id: "c", text: "Power steering assist imbalance", correct: false, reasoning: "The electric system has no codes and effort is even in both directions. It also cannot cause inner tread wear." },
          { id: "d", text: "Rear thrust angle error", correct: false, reasoning: "Rear camber, toe and thrust angle are all within specification." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "Before setting the alignment, what must you verify?",
        principle: "Never align a vehicle with worn or damaged suspension components — the settings will not hold and the customer pays twice.",
        options: [
          { id: "a", text: "Inspect and measure ride height and suspension components for wear or damage first", correct: true, reasoning: "Correct. Ride height and component condition define the geometry the rack can actually hold. Aligning around a bad strut just resets the clock on the wear." },
          { id: "b", text: "Set toe to specification and release the vehicle", correct: false, reasoning: "Toe alone will not correct 2.4° of camber, and the settings will drift again with a failed strut." },
          { id: "c", text: "Replace all four tires first", correct: false, reasoning: "New tires on uncorrected geometry will wear out exactly like the last two sets." },
          { id: "d", text: "Road test on a different road to check for road crown", correct: false, reasoning: "Reasonable as a sanity check, but the measured camber and caster splits already explain the pull." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What repair sequence is correct?",
        principle: "Restore hardware, then geometry, then verify with both a measurement and a road test.",
        options: [
          { id: "a", text: "Replace the right front strut assembly, install new front tires, perform a four-wheel alignment to spec, and road test with the steering wheel centered", correct: true, reasoning: "Correct order: hardware first so the geometry can be held, then alignment, then verification. Centering the wheel on the rack is part of the job, not an extra." },
          { id: "b", text: "Perform an alignment only", correct: false, reasoning: "The worn strut and low ride height will let the geometry move again." },
          { id: "c", text: "Replace both front struts and skip the alignment", correct: false, reasoning: "Replacing struts changes geometry — an alignment afterward is mandatory, not optional." },
          { id: "d", text: "Adjust the steering wheel position on the shaft", correct: false, reasoning: "That hides an off-center wheel without correcting the toe error causing it, and it is not an accepted repair." },
        ],
      },
    ],
    rootCause:
      "Pothole impact drove the right front out of camber, caster and toe specification and damaged the right front strut, producing a right pull and rapid inner-edge tire wear.",
    repair:
      "Replace the right front strut assembly and upper mount, install new front tires, perform a four-wheel alignment to specification with the steering wheel centered, and verify with a road test.",
    lesson:
      "Read the tire before you read the rack. Inner-edge wear means excess negative camber or toe-out; feathering means toe; one-sided wear across the tread means camber. Pull is caused by camber and caster splits between sides. And never align a vehicle before verifying ride height and component condition — the alignment can only be as good as the hardware holding it.",
  },
  {
    id: "civic-steering-groan",
    title: "Heavy Steering and a Groan at Low Speed",
    vehicleId: "civic-2014",
    category: "A4",
    difficulty: "Beginner",
    estimatedMinutes: 11,
    customerName: "Tomás Iglesias",
    customerMood: "First-time customer, budget conscious",
    complaint:
      "Parking is a workout now. The wheel is heavy and it makes a groaning noise when I turn it all the way.",
    interview: [
      { q: "When did it begin?", a: "It's been building for a few months, worse in the last two weeks." },
      { q: "Is it heavy all the time?", a: "Worst at parking speeds. On the highway it feels fine." },
      { q: "Is it worse cold or hot?", a: "Worse when I first start it up in the morning." },
      { q: "Any leaks?", a: "There's a small puddle where I park, sort of pinkish." },
      { q: "Any warning lights?", a: "No lights." },
      { q: "Any recent work?", a: "Nothing. I've had it three years and only done oil changes." },
    ],
    failure: {
      id: "ps-low-fluid-pump",
      name: "Low power steering fluid from a leaking high-pressure hose, causing pump aeration",
      system: "Suspension & Steering",
      effects: { noiseAtSpeed: "Groan at low speed steering" },
    },
    codes: [],
    freezeFrame: {},
    testDriveEvents: [
      { atSecond: 6, label: "Heavy effort at parking speed", detail: "Noticeably increased steering effort below 10 mph" },
      { atSecond: 14, label: "Groan at full lock", detail: "Pump groan when holding the wheel against the stop" },
      { atSecond: 24, label: "Normal at road speed", detail: "Effort feels acceptable above 30 mph" },
    ],
    audioProfile: {
      id: "ps-groan",
      label: "Power steering pump groan",
      description: "Low moaning whine that rises with steering effort and disappears when the wheel is centered. Synthesized for training.",
      synthetic: true,
    },
    warningLights: [],
    inspection: [
      {
        id: "ps-res",
        system: "Steering",
        label: "Power steering reservoir",
        findings: ["Fluid below the MIN line", "Fluid foamy and aerated", "Residue trail down the pump body"],
        measurement: "Level 18 mm below MIN cold mark",
        abnormal: true,
      },
      {
        id: "ps-hose",
        system: "Steering",
        label: "High-pressure hose",
        findings: ["Wet seepage at the crimp near the pump outlet", "Fluid slung onto the subframe", "Hose sheath cracked at the bend"],
        abnormal: true,
      },
      {
        id: "belt",
        system: "Engine",
        label: "Accessory drive belt",
        findings: ["Belt tension correct", "No glazing or cracks", "Tensioner within range"],
        abnormal: false,
      },
      {
        id: "front-susp",
        system: "Suspension",
        label: "Front suspension & linkage",
        findings: ["Ball joints tight", "Tie rods tight", "Rack mounting bolts torqued", "Tire pressures 35 psi all around"],
        abnormal: false,
      },
    ],
    testPoints: [
      { id: "bat", label: "Battery positive → negative", location: "Battery", dcVolts: 12.6, runningDcVolts: 14.1 },
    ],
    hideScanTool: true,
    tools: [
      {
        kind: "fluid",
        id: "ps-fluid",
        title: "Power steering fluid inspection",
        hint: "Check level, aeration and contamination with the engine off and cold",
        samples: [
          {
            id: "in-service",
            label: "Reservoir sample",
            color: "#b5606b",
            condition: "Pink, cloudy with visible air bubbles suspended throughout",
            smell: "Slightly burnt",
            verdict: "Aerated fluid cannot transmit hydraulic pressure. Foam in the reservoir means air is being drawn in — usually a low level or a suction-side leak.",
            abnormal: true,
          },
          {
            id: "new",
            label: "New fluid reference",
            color: "#d98b95",
            condition: "Clear pink, no bubbles",
            smell: "Neutral",
            verdict: "Reference sample for comparison.",
            abnormal: false,
          },
        ],
      },
      {
        kind: "gauge",
        id: "ps-pressure",
        title: "Power steering pressure test",
        hint: "Inline gauge with shutoff valve between the pump and the rack — never hold the valve closed more than 5 seconds",
        sets: [
          {
            id: "idle",
            label: "Idle, wheel centered",
            condition: "Engine at idle, fluid topped to MIN for testing",
            readings: [
              { label: "System pressure", measured: "180 psi", spec: "50–200 psi", abnormal: false },
            ],
          },
          {
            id: "lock",
            label: "Full lock",
            condition: "Wheel held against the stop briefly",
            readings: [
              { label: "Relief pressure", measured: "620 psi", spec: "1000–1200 psi", abnormal: true, note: "Low relief pressure with aerated fluid means the pump cannot build pressure — check the fluid condition before condemning the pump." },
            ],
          },
          {
            id: "valve",
            label: "Valve closed test",
            condition: "Shutoff valve closed for 3 seconds at idle",
            readings: [
              { label: "Pump maximum output", measured: "690 psi", spec: "1000–1200 psi", abnormal: true, note: "With the rack isolated, the pump still cannot make pressure — the loss is on the pump/supply side, not the rack." },
            ],
          },
        ],
      },
      {
        kind: "gauge",
        id: "steering-effort",
        title: "Steering effort measurement",
        hint: "Torque wrench on the steering wheel nut, engine running, vehicle on a turn plate",
        sets: [
          {
            id: "effort",
            label: "Effort at parking speed",
            readings: [
              { label: "Turning effort, left", measured: "9.4 Nm", spec: "Max 4.0 Nm", abnormal: true },
              { label: "Turning effort, right", measured: "9.1 Nm", spec: "Max 4.0 Nm", abnormal: true, note: "Effort is high and equal in both directions — a symmetric hydraulic supply problem rather than a one-sided rack fault." },
            ],
          },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is the most likely root cause?",
        principle:
          "Hydraulic assist depends on fluid that is at the right level and free of air. Verify supply before condemning a pump or a rack.",
        options: [
          { id: "a", text: "Failed steering rack", correct: false, reasoning: "Effort is equally high in both directions and the pump cannot build pressure even with the rack isolated by the shutoff valve." },
          { id: "b", text: "Low, aerated fluid caused by a leaking high-pressure hose", correct: true, reasoning: "Level below MIN, visible foam, a wet hose crimp and low pressure with the rack isolated all point to the supply side losing fluid and drawing air." },
          { id: "c", text: "Loose accessory drive belt", correct: false, reasoning: "Belt tension is correct with no glazing, and a slipping belt normally squeals rather than groans at full lock." },
          { id: "d", text: "Worn ball joints increasing steering effort", correct: false, reasoning: "Ball joints are tight, and worn joints produce play and noise, not a hydraulic groan." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "How do you confirm where the pressure loss is before quoting parts?",
        principle: "An inline pressure gauge with a shutoff valve separates pump output from rack demand — the single most decisive hydraulic steering test.",
        options: [
          { id: "a", text: "Install an inline pressure gauge and briefly close the shutoff valve to isolate pump output from the rack", correct: true, reasoning: "Correct. If pressure stays low with the rack isolated, the loss is the pump or its supply. If it comes up to spec, the rack is bypassing internally." },
          { id: "b", text: "Replace the pump because it is noisy", correct: false, reasoning: "The noise is the pump reacting to air in the fluid. Replacing it without correcting the leak means the new pump groans too." },
          { id: "c", text: "Top off the fluid and release the vehicle", correct: false, reasoning: "Topping off without repairing the leak means the customer returns with the same complaint and possibly a destroyed pump." },
          { id: "d", text: "Perform a four-wheel alignment", correct: false, reasoning: "Alignment does not affect hydraulic assist and effort is equal in both directions." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What repair should be performed?",
        principle: "Fix the leak, restore the fluid, purge the air, then re-measure the same values that condemned the system.",
        options: [
          { id: "a", text: "Replace the leaking high-pressure hose, refill with the specified fluid, bleed the air out, then re-test pressure and steering effort", correct: true, reasoning: "Correct. Bleeding matters — trapped air will keep the assist weak and can damage the pump. Verification means pressure back to spec and effort under 4 Nm." },
          { id: "b", text: "Replace the pump and hose together", correct: false, reasoning: "There is no evidence the pump has failed once air is purged. Re-test after the repair before adding a pump." },
          { id: "c", text: "Add stop-leak additive to the reservoir", correct: false, reasoning: "Additives swell seals unpredictably and cannot seal a cracked pressure hose." },
          { id: "d", text: "Replace the steering rack", correct: false, reasoning: "The valve-closed test proved the rack is not where the pressure is going." },
        ],
      },
    ],
    rootCause:
      "Leaking high-pressure power steering hose lowering fluid level and allowing the pump to draw air, which collapses hydraulic assist at low speed.",
    repair:
      "Replace the high-pressure hose, refill with the specified power steering fluid, bleed the system fully, then verify relief pressure and steering effort at the turn plates.",
    lesson:
      "Hydraulic power steering complaints follow a fixed order: level, condition, belt, pressure. Aerated fluid is the tell that air is entering the system, and a pump that groans is almost always a victim rather than the cause. The shutoff-valve pressure test is what separates a pump problem from a rack problem — never guess between them.",
  },
];
