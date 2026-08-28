import type { Scenario } from "./types";

/**
 * Second wave of scenarios. Same structure and quality bar as the original
 * sets — adds depth to A1, A8 and one more case for each chassis/systems area
 * so every ASE category has at least three cars to work through.
 */
export const EXTRA_SCENARIOS: Scenario[] = [
  /* ------------------------------------------------------------------ A1 */
  {
    id: "explorer-coolant-loss",
    title: "Coolant Disappears, No Puddle",
    vehicleId: "explorer-2021",
    category: "A1",
    difficulty: "Advanced",
    estimatedMinutes: 16,
    customerName: "Renee Dobbs",
    customerMood: "Skeptical — two shops already looked at it",
    complaint:
      "I have to add coolant every couple of weeks and nobody can find a leak. Sometimes there's white smoke out the tailpipe when it first starts.",
    interview: [
      { q: "How much coolant are you adding?", a: "About a quart every two weeks." },
      { q: "Do you see anything on the driveway?", a: "Never. That's what's driving me crazy." },
      { q: "Does it overheat?", a: "The gauge creeps up in traffic but it's never pegged." },
      { q: "Any change in how it runs?", a: "It's a little rough for the first thirty seconds, then it smooths out." },
      { q: "Any recent work?", a: "A shop replaced the thermostat six months ago." },
    ],
    failure: {
      id: "head-gasket-seep",
      name: "Head gasket breach into No. 3 cylinder",
      system: "Engine Mechanical",
      effects: { misfireRate: 0.25, roughIdle: 0.35, coolantOffset: 6, powerLoss: 0.08 },
    },
    codes: [
      { code: "P0303", description: "Cylinder 3 Misfire Detected" },
      { code: "P0300", description: "Random/Multiple Cylinder Misfire", pending: true },
    ],
    freezeFrame: {
      "Engine RPM": "742 rpm",
      "Coolant Temp": "38 °C",
      "Calculated Load": "22 %",
      "Misfire Cyl 3": "184 counts / 1000 rev",
      "Fuel Trim B1": "STFT -4 % / LTFT +1 %",
    },
    testDriveEvents: [
      { atSecond: 4, label: "Cold-start stumble", detail: "Rough for roughly 30 seconds, then clears" },
      { atSecond: 18, label: "Sweet exhaust odor", detail: "Coolant odor at the tailpipe during warm-up" },
      { atSecond: 30, label: "Temp creep at idle", detail: "Coolant climbs to 104 °C with the fan on high" },
    ],
    audioProfile: {
      id: "load-misfire",
      label: "Cold-start misfire clearing with heat",
      description: "Uneven firing pulses at cold idle that even out as the cylinder dries. Synthesized for training.",
      synthetic: true,
    },
    warningLights: ["MIL flashing at cold start"],
    inspection: [
      {
        id: "cooling",
        system: "Cooling",
        label: "Radiator, hoses and cap",
        findings: ["No external seepage anywhere on the block or radiator", "Cap holds 15 psi", "Overflow bottle level dropping over time"],
        measurement: "System holds 15 psi for 8 min, then bleeds to 11 psi",
        abnormal: true,
      },
      {
        id: "oil",
        system: "Engine",
        label: "Oil fill cap and dipstick",
        findings: ["No milky emulsion on the cap", "Oil level correct, normal color"],
        abnormal: false,
      },
      {
        id: "plugs",
        system: "Ignition",
        label: "Spark plug condition",
        findings: ["Cylinders 1, 2, 4, 5, 6 normal tan deposits", "Cylinder 3 steam-cleaned white with no deposits at all"],
        abnormal: true,
      },
    ],
    testPoints: [
      { id: "coil3", label: "Coil 3 power feed", location: "Valve cover", dcVolts: 12.5, runningDcVolts: 13.9, note: "Feed is good — ignition supply is not the issue" },
      { id: "inj3", label: "Injector 3 winding", location: "Fuel rail", ohms: 12.1, note: "In spec (11.4–12.6 Ω)" },
    ],
    tools: [
      {
        kind: "gauge",
        id: "block-test",
        title: "Cylinder leakage & combustion gas test",
        hint: "Leak-down at TDC on each cylinder, then a chemical block test on the coolant",
        sets: [
          {
            id: "leakdown",
            label: "Cylinder leak-down",
            condition: "Engine warm, each cylinder at TDC compression, 100 psi applied",
            readings: [
              { label: "Cylinder 1", measured: "6 %", spec: "under 15 %", abnormal: false },
              { label: "Cylinder 3", measured: "24 %", spec: "under 15 %", abnormal: true, note: "Air audible bubbling in the coolant reservoir while pressurized — that is the leak path." },
              { label: "Cylinder 5", measured: "8 %", spec: "under 15 %", abnormal: false },
            ],
          },
          {
            id: "blocktest",
            label: "Combustion gas (block) test",
            condition: "Blue test fluid drawn from the filler neck, engine at idle",
            readings: [
              { label: "Test fluid color", measured: "Turned yellow in 40 s", spec: "Stays blue", abnormal: true },
              { label: "Cooling system pressure at idle", measured: "Rises to 19 psi in 3 min", spec: "Stable near cap rating", abnormal: true },
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
        principle: "Coolant that leaves the system without an external leak has gone into the cylinders, the oil, or the atmosphere as steam.",
        options: [
          { id: "a", text: "Head gasket breach between the coolant jacket and cylinder 3", correct: true, reasoning: "Correct. Steam-cleaned plug on the misfiring cylinder, 24 % leak-down that bubbles into the reservoir, and a positive block test all point at one path." },
          { id: "b", text: "Failed radiator cap", correct: false, reasoning: "A weak cap loses coolant as external overflow — it does not produce combustion gases in the coolant." },
          { id: "c", text: "Cracked intake manifold gasket", correct: false, reasoning: "Possible in principle, but that would not steam-clean a single plug or raise leak-down on that cylinder." },
          { id: "d", text: "Failed ignition coil on cylinder 3", correct: false, reasoning: "A dead coil misfires at all temperatures and never consumes coolant." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "You suspect a head gasket. What confirms the specific cylinder before teardown?",
        principle: "Confirm the leak path and its location, not just its existence.",
        options: [
          { id: "a", text: "Leak-down test each cylinder and listen at the coolant reservoir", correct: true, reasoning: "Correct. Bubbles in the reservoir while a specific cylinder is pressurized localize the breach." },
          { id: "b", text: "Replace the coolant and see if it happens again", correct: false, reasoning: "That is waiting, not testing, and the customer already lost weeks." },
          { id: "c", text: "Run a fuel pressure test", correct: false, reasoning: "Fuel delivery has nothing to do with coolant consumption." },
          { id: "d", text: "Scope the crankshaft sensor", correct: false, reasoning: "The misfire is already identified by cylinder — sensor data adds nothing here." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What is the correct repair path?",
        principle: "Head gasket work is only correct when the sealing surfaces are proven flat and the cause of the failure is addressed.",
        options: [
          { id: "a", text: "Remove the head, check both surfaces for flatness and cracks, resurface as needed, install a new gasket and torque to spec", correct: true, reasoning: "Correct. Reusing a warped head guarantees a repeat failure — measure before assembling." },
          { id: "b", text: "Add head gasket sealer to the cooling system", correct: false, reasoning: "Chemical sealer plugs heater cores and radiators and never survives combustion pressure." },
          { id: "c", text: "Replace the engine", correct: false, reasoning: "The block and rotating assembly are serviceable — this is not proportional to the fault." },
          { id: "d", text: "Replace the coil and plug on cylinder 3", correct: false, reasoning: "Treats the symptom while coolant keeps entering the cylinder." },
        ],
      },
    ],
    rootCause: "Head gasket breach between the cooling jacket and cylinder 3 allowing coolant into the combustion chamber and combustion gases into the coolant.",
    repair: "Remove the cylinder head, verify head and deck flatness, resurface if out of spec, install a new multi-layer steel gasket with new torque-to-yield bolts, refill and bleed, then re-run the block test.",
    lesson:
      "Coolant loss with no external leak has only a few possible destinations. Work them in order: external, into the oil, into the cylinders. A steam-cleaned plug on the exact cylinder that misfires is a hard mechanical clue, and leak-down plus a block test confirms it before you sell an expensive teardown.",
  },

  /* ------------------------------------------------------------------ A8 */
  {
    id: "sonata-catalyst",
    title: "P0420 After a Parts-Store Fix",
    vehicleId: "sonata-2016",
    category: "A8",
    difficulty: "Advanced",
    estimatedMinutes: 15,
    customerName: "Tyrell Ford",
    customerMood: "Frustrated, already spent money",
    complaint:
      "Light came back on. Another shop put in two oxygen sensors and it lasted about a week. I need this to pass inspection.",
    interview: [
      { q: "What was replaced?", a: "Both oxygen sensors, about three weeks ago." },
      { q: "How does it run?", a: "Fine. Maybe a little weak on the highway but nothing bad." },
      { q: "Any smells?", a: "Sometimes it smells like rotten eggs when I get off the freeway." },
      { q: "Fuel economy?", a: "Down maybe two miles a gallon since spring." },
      { q: "Any repairs before that?", a: "It had a misfire last year. Somebody put plugs in it." },
    ],
    failure: {
      id: "catalyst-degraded",
      name: "Thermally damaged catalytic converter substrate",
      system: "Emissions",
      effects: { powerLoss: 0.1, stftCruise: 3.5, ltftCruise: 4.2 },
    },
    codes: [
      { code: "P0420", description: "Catalyst System Efficiency Below Threshold (Bank 1)" },
      { code: "P0171", description: "System Too Lean (Bank 1)", pending: true },
    ],
    freezeFrame: {
      "Engine RPM": "2140 rpm",
      "Vehicle Speed": "94 km/h",
      "Calculated Load": "38 %",
      "Coolant Temp": "91 °C",
      "O2 B1S2": "Switching 0.14–0.79 V",
      "Catalyst Monitor": "Failed, 2 drive cycles",
    },
    testDriveEvents: [
      { atSecond: 8, label: "Downstream sensor mirroring", detail: "Rear O2 swings nearly in step with the front sensor" },
      { atSecond: 20, label: "Soft on hard acceleration", detail: "Mild power loss above 3500 rpm consistent with exhaust restriction" },
      { atSecond: 32, label: "Sulfur odor on deceleration", detail: "Hydrogen-sulfide smell after a highway pull" },
    ],
    audioProfile: {
      id: "exhaust-restriction",
      label: "Restricted exhaust note",
      description: "Muted, congested exhaust tone that flattens at high rpm. Synthesized for training.",
      synthetic: true,
    },
    warningLights: ["MIL"],
    inspection: [
      {
        id: "exhaust",
        system: "Exhaust",
        label: "Converter and piping",
        findings: ["Converter shell discolored blue-gold from overheating", "Light rattle from the substrate when tapped", "No leaks ahead of the converter"],
        abnormal: true,
      },
      {
        id: "sensors",
        system: "Emissions",
        label: "Oxygen sensors",
        findings: ["Both sensors are new, correct part numbers", "Connectors clean and seated"],
        abnormal: false,
      },
      {
        id: "intake",
        system: "Air Induction",
        label: "Intake tract",
        findings: ["No unmetered air leaks found with smoke test", "Air filter clean"],
        abnormal: false,
      },
    ],
    testPoints: [
      { id: "b1s1", label: "Upstream O2 signal", location: "Exhaust manifold", acVolts: 0.42, note: "Active switching 0.1–0.9 V — sensor is working" },
      { id: "b1s2", label: "Downstream O2 signal", location: "Post-converter", acVolts: 0.36, note: "Should be nearly flat near 0.6 V on a healthy converter" },
    ],
    tools: [
      {
        kind: "gauge",
        id: "backpressure",
        title: "Exhaust backpressure & delta-temp",
        hint: "Gauge threaded into the upstream O2 bung, plus infrared temperature across the converter",
        sets: [
          {
            id: "pressure",
            label: "Backpressure",
            condition: "Engine warm, measured at idle and at a steady 2500 rpm",
            readings: [
              { label: "Idle backpressure", measured: "2.1 psi", spec: "under 1.5 psi", abnormal: true },
              { label: "2500 rpm backpressure", measured: "4.8 psi", spec: "under 3 psi", abnormal: true, note: "Rising backpressure with rpm is the signature of a collapsing substrate." },
            ],
          },
          {
            id: "temps",
            label: "Converter delta-temp",
            condition: "IR gun on inlet and outlet after a 2500 rpm hold",
            readings: [
              { label: "Inlet temperature", measured: "486 °C", spec: "—", abnormal: false },
              { label: "Outlet temperature", measured: "492 °C", spec: "Outlet 8–15 % above inlet", abnormal: true, note: "Essentially no temperature rise means the catalyst is not converting." },
            ],
          },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is the root cause of the repeat P0420?",
        principle: "P0420 is a converter efficiency report, not a sensor code — verify the converter's actual work.",
        options: [
          { id: "a", text: "Catalytic converter substrate damaged by the earlier misfire", correct: true, reasoning: "Correct. No delta-temp, elevated backpressure, a rattling and heat-discolored shell, and a downstream sensor that mirrors the upstream one." },
          { id: "b", text: "Defective replacement oxygen sensors", correct: false, reasoning: "Both sensors switch correctly and read plausibly — the data says they are fine." },
          { id: "c", text: "Vacuum leak causing a lean condition", correct: false, reasoning: "Smoke testing found no leak and trims are only mildly positive." },
          { id: "d", text: "Failed thermostat holding the engine cool", correct: false, reasoning: "Coolant reaches 91 °C. Closed loop is achieved normally." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "Before selling a converter, which test carries the most weight?",
        principle: "Prove the converter is not doing its job before replacing an expensive emissions component.",
        options: [
          { id: "a", text: "Measure exhaust backpressure and inlet/outlet delta-temp", correct: true, reasoning: "Correct. Together they show both restriction and lack of conversion — objective and defensible to the customer." },
          { id: "b", text: "Clear the code and drive it for a week", correct: false, reasoning: "The customer needs an inspection pass, and the monitor already failed twice." },
          { id: "c", text: "Swap the downstream sensor again", correct: false, reasoning: "That is the repair the last shop already sold and it failed." },
          { id: "d", text: "Replace the fuel filter", correct: false, reasoning: "Unrelated to catalyst efficiency." },
        ],
      },
      {
        id: "verification",
        stage: "verification",
        prompt: "After replacing the converter, how do you verify the repair?",
        principle: "Verification means the monitor runs and passes, not that the light is off.",
        options: [
          { id: "a", text: "Complete a drive cycle and confirm the catalyst monitor runs and passes with a stable downstream sensor", correct: true, reasoning: "Correct. A flat downstream signal near 0.6 V plus a completed monitor is what an inspection station will see." },
          { id: "b", text: "Clear codes and release the vehicle", correct: false, reasoning: "Readiness monitors will be incomplete and the vehicle will fail inspection." },
          { id: "c", text: "Check that the MIL is off at idle", correct: false, reasoning: "The catalyst monitor only runs under specific drive conditions." },
          { id: "d", text: "Re-scan for pending codes only", correct: false, reasoning: "Absence of pending codes does not mean the monitor completed." },
        ],
      },
    ],
    rootCause: "Catalytic converter substrate thermally damaged by an unrepaired misfire, leaving the converter unable to store oxygen or convert emissions.",
    repair: "Replace the catalytic converter with an OE-grade unit, confirm no remaining misfire or lean condition, then run a full drive cycle so the catalyst monitor completes.",
    lesson:
      "Converters rarely fail on their own — something upstream kills them. Always find and fix what damaged the catalyst, or the new one dies too. Backpressure plus delta-temp gives you evidence, and a completed readiness monitor is the only real verification.",
  },

  /* ------------------------------------------------------------------ A2 */
  {
    id: "altima-cvt-judder",
    title: "CVT Shudder Under Light Throttle",
    vehicleId: "altima-2017",
    category: "A2",
    difficulty: "Advanced",
    estimatedMinutes: 14,
    customerName: "Dana Whitfield",
    customerMood: "Nervous about transmission cost",
    complaint:
      "Around 40 miles an hour it feels like driving over rumble strips, but only when I'm barely on the gas. If I press harder it goes away.",
    interview: [
      { q: "When does it happen?", a: "Light throttle, steady speed, usually 35 to 45." },
      { q: "Cold or warm?", a: "Only after it's been driven twenty minutes or so." },
      { q: "Any lights?", a: "No lights at all." },
      { q: "Service history?", a: "Never touched the transmission. 96,000 miles." },
      { q: "Any towing?", a: "I pulled a small utility trailer a few times last summer." },
    ],
    hideMultimeter: true,
    failure: {
      id: "tcc-shudder-cvt",
      name: "Torque converter clutch shudder from degraded CVT fluid",
      system: "Automatic Transmission",
      effects: { roughIdle: 0.05, powerLoss: 0.04 },
    },
    codes: [],
    freezeFrame: {
      "Engine RPM": "1620 rpm",
      "Vehicle Speed": "64 km/h",
      "Calculated Load": "26 %",
      "CVT Fluid Temp": "88 °C",
      "TCC Slip": "38 rpm oscillating ±22",
      "Secondary Pressure": "612 kPa",
    },
    testDriveEvents: [
      { atSecond: 10, label: "No shudder cold", detail: "Smooth for the first several minutes of driving" },
      { atSecond: 22, label: "Shudder at light throttle", detail: "Rhythmic vibration at 60–70 km/h, ~12 Hz" },
      { atSecond: 30, label: "Clears under throttle", detail: "Vibration disappears when the converter unlocks under load" },
    ],
    audioProfile: {
      id: "trans-flare",
      label: "Converter clutch shudder",
      description: "Low-frequency rhythmic pulse felt more than heard while the clutch slips and grabs. Synthesized for training.",
      synthetic: true,
    },
    warningLights: [],
    inspection: [
      {
        id: "mounts",
        system: "Drivetrain",
        label: "Engine and transaxle mounts",
        findings: ["All mounts intact", "No excess movement under load"],
        abnormal: false,
      },
      {
        id: "tires",
        system: "Chassis",
        label: "Tires and balance",
        findings: ["Even wear, no cupping", "All four balanced within 0.25 oz"],
        abnormal: false,
      },
      {
        id: "cvtpan",
        system: "Transmission",
        label: "CVT pan and cooler",
        findings: ["No leaks", "Cooler flow normal", "Pan magnet holds a light gray paste"],
        abnormal: true,
      },
    ],
    testPoints: [],
    tools: [
      {
        kind: "fluid",
        id: "cvt-fluid",
        title: "CVT fluid condition",
        hint: "Fluid pulled from the check port at operating temperature",
        samples: [
          {
            id: "cvtf",
            label: "CVT fluid",
            color: "#6a4a1c",
            condition: "Brown-green, slightly hazy, fine gray suspension on the wipe",
            smell: "Faint scorched odor",
            verdict: "Fluid has lost its friction modifier package — exactly what causes converter clutch shudder before any hard part fails.",
            abnormal: true,
          },
        ],
      },
      {
        kind: "vibration",
        id: "shudder-analysis",
        title: "Vibration analyzer",
        hint: "Accelerometer on the transaxle case, recorded during a steady-speed light-throttle pull",
        analysis:
          "Vibration frequency stays near 12 Hz and does not scale with road speed. It tracks engine speed with the converter clutch applied, which rules out tire, driveshaft and wheel-bearing sources.",
        samples: [
          { speed: 48, amplitude: 0.2, note: "Clutch not yet applied — no shudder" },
          { speed: 64, amplitude: 0.9, note: "Clutch applied at light throttle — peak shudder" },
          { speed: 80, amplitude: 0.3, note: "Higher load unlocks or fully locks the clutch — shudder fades" },
        ],
      },
      {
        kind: "codes",
        id: "tcm-data",
        title: "TCM data review",
        hint: "No stored codes — this is a data-only review of slip behavior",
        module: "TCM (CVT Control Unit)",
        codes: [
          { code: "—", description: "No stored or pending codes", status: "Monitors complete", freeze: "TCC slip oscillating ±22 rpm around a 38 rpm target during the complaint" },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is the most likely cause of the shudder?",
        principle: "A vibration tied to engine speed rather than road speed lives in the converter or driveline, not the tires.",
        options: [
          { id: "a", text: "Torque converter clutch shudder caused by degraded CVT fluid", correct: true, reasoning: "Correct. It appears only with the clutch applied, tracks engine speed, and the fluid is oxidized with friction material in suspension." },
          { id: "b", text: "Out-of-balance tire", correct: false, reasoning: "A tire vibration scales with road speed and would not disappear under throttle." },
          { id: "c", text: "Worn CV joint", correct: false, reasoning: "CV wear shows up on turns and under acceleration, not at steady light throttle." },
          { id: "d", text: "Engine misfire", correct: false, reasoning: "No codes, no misfire counts, and the engine is smooth in neutral at the same rpm." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "Which test best separates converter shudder from a driveline vibration?",
        principle: "Change one variable at a time: engine speed versus road speed.",
        options: [
          { id: "a", text: "Hold the same road speed in a lower ratio so engine speed changes, and watch whether the vibration follows", correct: true, reasoning: "Correct. If the vibration follows engine speed the source is the converter clutch, not a rotating chassis component." },
          { id: "b", text: "Rebalance all four tires", correct: false, reasoning: "They already measured within spec — this is a guess with labor attached." },
          { id: "c", text: "Replace the CVT outright", correct: false, reasoning: "Nothing yet proves internal hard-part damage." },
          { id: "d", text: "Perform a fuel pressure test", correct: false, reasoning: "Unrelated to a converter clutch complaint." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What repair should be quoted?",
        principle: "Correct the fluid condition first when hard parts still measure serviceable.",
        options: [
          { id: "a", text: "Perform a full CVT fluid exchange with the correct OE-spec fluid, then re-verify slip behavior on a road test", correct: true, reasoning: "Correct. Restoring the friction modifiers usually resolves clutch shudder, and the road test confirms it before any larger repair is discussed." },
          { id: "b", text: "Install a friction additive and release the car", correct: false, reasoning: "Additives outside the fluid specification can change clamp behavior and void coverage." },
          { id: "c", text: "Replace the torque converter", correct: false, reasoning: "Premature — the clutch surface has not been shown to be damaged." },
          { id: "d", text: "Replace the transmission", correct: false, reasoning: "Not supported by any measurement taken." },
        ],
      },
    ],
    rootCause: "Oxidized, friction-modifier-depleted CVT fluid causing torque converter clutch shudder during light-throttle apply.",
    repair: "Full fluid exchange with the specified CVT fluid, reset the fluid deterioration counter, road test at the complaint condition and confirm TCC slip is stable.",
    lesson:
      "Shudder is a slip problem. Decide first whether the vibration follows engine speed or road speed — that single question eliminates half the possible causes. On modern converter clutches, fluid condition is the leading cause, and it is the cheapest correct answer you can offer.",
  },

  /* ------------------------------------------------------------------ A3 */
  {
    id: "outback-diff-whine",
    title: "Whine That Changes With Speed",
    vehicleId: "outback-2017",
    category: "A3",
    difficulty: "Intermediate",
    estimatedMinutes: 13,
    customerName: "Peter Nkemdi",
    customerMood: "Methodical, keeps his own notes",
    complaint:
      "There's a whine that starts around 45 mph and gets louder the faster I go. It's the same whether I'm on the gas or coasting.",
    interview: [
      { q: "Does it change when you turn?", a: "No. Same in a curve either direction." },
      { q: "On or off the throttle?", a: "Both. Coasting down a hill it's still there." },
      { q: "Any vibration?", a: "No shaking, just the noise." },
      { q: "Any service history?", a: "Rear differential fluid has never been changed. 108,000 miles." },
      { q: "Any towing or loads?", a: "I tow a boat about six weekends a year." },
    ],
    hideScanTool: true,
    hideMultimeter: true,
    failure: {
      id: "diff-bearing-wear",
      name: "Worn rear differential pinion bearing",
      system: "Drive Axle",
      effects: { noiseAtSpeed: "Speed-proportional whine from the rear axle" },
    },
    codes: [],
    freezeFrame: {},
    testDriveEvents: [
      { atSecond: 8, label: "Whine begins near 70 km/h", detail: "Rises in pitch directly with road speed" },
      { atSecond: 18, label: "Unchanged on coast", detail: "Noise persists off throttle — not a gear-load noise" },
      { atSecond: 26, label: "Unchanged in turns", detail: "No change loading left or right — rules out wheel bearings" },
    ],
    audioProfile: {
      id: "driveline-vibration",
      label: "Speed-proportional driveline whine",
      description: "Rising whine tied to road speed rather than engine speed. Synthesized for training.",
      synthetic: true,
    },
    warningLights: [],
    inspection: [
      {
        id: "diff",
        system: "Drive Axle",
        label: "Rear differential",
        findings: ["Pinion seal weeping lightly", "Slight roughness felt turning the pinion by hand", "0.09 mm pinion end-play measured with a dial indicator"],
        measurement: "Pinion end-play 0.09 mm (spec: zero, preload only)",
        abnormal: true,
      },
      {
        id: "bearings",
        system: "Chassis",
        label: "Rear wheel bearings",
        findings: ["No play at 12 and 6 o'clock", "No roughness spinning either hub", "Noise unchanged when the vehicle is loaded in a turn"],
        abnormal: false,
      },
      {
        id: "tires",
        system: "Chassis",
        label: "Tire condition",
        findings: ["Even tread, no cupping or feathering", "Correct matched sizes on all four corners"],
        abnormal: false,
      },
    ],
    testPoints: [],
    tools: [
      {
        kind: "fluid",
        id: "gear-oil",
        title: "Differential fluid inspection",
        hint: "Drain a sample into a clear container and inspect for metal",
        samples: [
          {
            id: "rear-diff",
            label: "Rear differential gear oil",
            color: "#3a2a10",
            condition: "Very dark, gritty, with fine glittering metal and one 2 mm bearing-roller flake",
            smell: "Strong sulfur gear-oil odor plus a burnt note",
            verdict: "Metal flake of that size is bearing material — the whine has a mechanical source inside the housing.",
            abnormal: true,
          },
          {
            id: "front-diff",
            label: "Front differential (reference)",
            color: "#7a5a1e",
            condition: "Amber, clear, no debris",
            smell: "Normal gear-oil odor",
            verdict: "Front unit is healthy — a useful baseline for what the rear fluid should look like.",
            abnormal: false,
          },
        ],
      },
      {
        kind: "vibration",
        id: "noise-map",
        title: "Chassis-ear noise mapping",
        hint: "Microphones on the rear differential housing, both rear hubs and the center bearing",
        analysis:
          "Amplitude is highest at the differential housing and drops sharply at both hubs. The frequency scales linearly with road speed and is unaffected by throttle, which fits a pinion bearing rather than a ring-and-pinion mesh problem.",
        samples: [
          { speed: 50, amplitude: 0.15, note: "Below the onset threshold" },
          { speed: 80, amplitude: 0.72, note: "Clear whine at the differential microphone" },
          { speed: 110, amplitude: 1, note: "Loudest at the housing; hubs stay near baseline" },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is causing the whine?",
        principle: "Load-independent, speed-proportional noise is a bearing; load-dependent noise is a gear mesh.",
        options: [
          { id: "a", text: "Worn rear differential pinion bearing", correct: true, reasoning: "Correct. Constant on and off throttle, loudest at the housing, measurable pinion end-play and bearing material in the fluid." },
          { id: "b", text: "Failing rear wheel bearing", correct: false, reasoning: "A wheel bearing changes with cornering load and would be loudest at that hub — neither is true here." },
          { id: "c", text: "Worn ring and pinion gear mesh", correct: false, reasoning: "Gear mesh noise changes noticeably between drive and coast. This noise does not." },
          { id: "d", text: "Tire noise from irregular wear", correct: false, reasoning: "Tread is even and the microphone amplitude points at the housing, not the corners." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "Which test isolates the source most efficiently?",
        principle: "Localize the noise physically before disassembling anything.",
        options: [
          { id: "a", text: "Use chassis ears at the housing and both hubs while road testing on and off throttle", correct: true, reasoning: "Correct. It gives you both location and load behavior in a single test drive." },
          { id: "b", text: "Rotate the tires and re-test", correct: false, reasoning: "Reasonable for a tread-noise complaint, but the tires already inspect clean." },
          { id: "c", text: "Replace the rear differential fluid and see if it quiets", correct: false, reasoning: "Fresh fluid can mask a bearing whine temporarily and destroys your evidence." },
          { id: "d", text: "Scan for chassis codes", correct: false, reasoning: "A mechanical bearing wear condition sets no codes." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What repair do you recommend?",
        principle: "Bearing replacement in a differential is a setup job — preload and pattern have to be re-established.",
        options: [
          { id: "a", text: "Overhaul the differential with new pinion and carrier bearings, set pinion preload and verify the tooth contact pattern", correct: true, reasoning: "Correct. Once metal circulated through the housing, all bearings are suspect and the setup must be re-established to spec." },
          { id: "b", text: "Add heavier-weight gear oil to quiet the noise", correct: false, reasoning: "Masking a failing bearing sets the customer up for a roadside failure." },
          { id: "c", text: "Replace only the pinion seal", correct: false, reasoning: "The seal weep is a symptom of bearing movement, not the cause." },
          { id: "d", text: "Replace both rear wheel bearings", correct: false, reasoning: "The hubs tested good and the noise does not localize there." },
        ],
      },
    ],
    rootCause: "Worn rear differential pinion bearing producing a speed-proportional whine, with bearing material contaminating the gear oil.",
    repair: "Differential overhaul: new pinion and carrier bearings, crush sleeve, pinion seal, correct pinion preload and backlash, verify the contact pattern, refill with the specified gear oil.",
    lesson:
      "Driveline noise diagnosis is about three questions: does it follow road speed or engine speed, does it change with throttle, and does it change with cornering load. Answer those three and you have already eliminated most of the driveline. Fluid inspection then confirms which component is shedding.",
  },

  /* ------------------------------------------------------------------ A4 */
  {
    id: "civic-clunk-bumps",
    title: "Clunk Over Every Bump",
    vehicleId: "civic-2014",
    category: "A4",
    difficulty: "Beginner",
    estimatedMinutes: 11,
    customerName: "Alisha Grant",
    customerMood: "Practical, on a budget",
    complaint:
      "Every time I go over a bump or a manhole cover the front end clunks. It sounds like something's loose under there.",
    interview: [
      { q: "One side or both?", a: "Mostly the passenger side, I think." },
      { q: "Does the steering feel loose?", a: "No, it drives straight and the wheel feels normal." },
      { q: "At speed or slow?", a: "Slow speeds over bumps and speed bumps. Not on the highway." },
      { q: "Any tire wear?", a: "The shop said the tires looked okay last oil change." },
      { q: "Anything replaced?", a: "Nothing. It has 132,000 miles." },
    ],
    hideScanTool: true,
    hideMultimeter: true,
    failure: {
      id: "sway-link-worn",
      name: "Worn front stabilizer bar end links",
      system: "Suspension",
      effects: { noiseAtSpeed: "Metallic clunk over suspension articulation" },
    },
    codes: [],
    freezeFrame: {},
    testDriveEvents: [
      { atSecond: 6, label: "Clunk over a driveway apron", detail: "Single metallic knock from the right front" },
      { atSecond: 16, label: "Quiet on smooth pavement", detail: "No noise when the suspension is not articulating" },
      { atSecond: 24, label: "Repeats on the opposite lean", detail: "Knock repeats when the bar loads in the other direction" },
    ],
    audioProfile: {
      id: "suspension-clunk",
      label: "Metallic suspension knock",
      description: "Sharp single knock as the stabilizer bar takes up free play. Synthesized for training.",
      synthetic: true,
    },
    warningLights: [],
    inspection: [
      {
        id: "links",
        system: "Suspension",
        label: "Stabilizer bar end links",
        findings: ["Right link rattles by hand with clear axial play", "Left link torn boot, grease slung on the strut", "Bar bushings intact"],
        measurement: "Right end link free play approximately 3 mm",
        abnormal: true,
      },
      {
        id: "ball-joints",
        system: "Steering",
        label: "Ball joints and tie rods",
        findings: ["No play with a pry bar at either lower ball joint", "Inner and outer tie rods tight", "Boots intact"],
        abnormal: false,
      },
      {
        id: "struts",
        system: "Suspension",
        label: "Struts and mounts",
        findings: ["No fluid leakage on either strut body", "Mount bearings turn smoothly", "Bounce test settles in one cycle"],
        abnormal: false,
      },
    ],
    testPoints: [],
    tools: [
      {
        kind: "gauge",
        id: "ride-height",
        title: "Ride height & suspension measurement",
        hint: "Measured from wheel center to fender lip on level ground with a full tank",
        sets: [
          {
            id: "heights",
            label: "Ride height",
            condition: "Level lift, unloaded, tires at 33 psi",
            readings: [
              { label: "Left front", measured: "372 mm", spec: "365–380 mm", abnormal: false },
              { label: "Right front", measured: "369 mm", spec: "365–380 mm", abnormal: false },
              { label: "Cross-height difference", measured: "3 mm", spec: "under 10 mm", abnormal: false, note: "Springs are not sagging — this is not a spring or strut height complaint." },
            ],
          },
          {
            id: "play",
            label: "Component free play (dry-park test)",
            condition: "Weight on wheels, helper turning the wheel back and forth",
            readings: [
              { label: "Right stabilizer link", measured: "3.0 mm axial play", spec: "0 mm", abnormal: true },
              { label: "Right lower ball joint", measured: "0 mm", spec: "under 0.5 mm", abnormal: false },
              { label: "Outer tie rod", measured: "0 mm", spec: "0 mm", abnormal: false },
            ],
          },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is causing the clunk?",
        principle: "A noise that only appears when the suspension articulates comes from a component with free play under articulation.",
        options: [
          { id: "a", text: "Worn front stabilizer bar end links", correct: true, reasoning: "Correct. Measurable axial play at the right link, a torn boot on the left, and every other joint tests tight." },
          { id: "b", text: "Worn lower ball joint", correct: false, reasoning: "The dry-park test shows zero play and the boots are intact." },
          { id: "c", text: "Failed strut mount bearing", correct: false, reasoning: "A bad mount bearing produces a groan or bind while steering, not a bump-only clunk, and the bearings turn smoothly." },
          { id: "d", text: "Broken coil spring", correct: false, reasoning: "Ride heights are even and within spec, and the springs inspect intact." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "What is the appropriate way to confirm the source before quoting?",
        principle: "Reproduce the load the road applies, then look for the play.",
        options: [
          { id: "a", text: "Perform a dry-park test with weight on the wheels while an assistant works the steering and suspension", correct: true, reasoning: "Correct. Loading the joints the way the road does exposes the play that a hanging suspension hides." },
          { id: "b", text: "Replace all front suspension components", correct: false, reasoning: "Expensive shotgunning when a single joint shows measurable play." },
          { id: "c", text: "Align the vehicle", correct: false, reasoning: "The customer reports no pull or wear complaint and alignment does not remove a clunk." },
          { id: "d", text: "Road test at highway speed", correct: false, reasoning: "The noise happens at low speed over bumps — highway testing will not reproduce it." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What repair should be performed?",
        principle: "Replace worn links in pairs and torque suspension fasteners at ride height.",
        options: [
          { id: "a", text: "Replace both front stabilizer bar end links, torque to spec, then re-test over the same bumps", correct: true, reasoning: "Correct. The left is already torn and the right has play — pairing them keeps handling balanced, and the re-test verifies the fix." },
          { id: "b", text: "Replace only the right link", correct: false, reasoning: "Leaves a torn-boot link that will be back in a few months." },
          { id: "c", text: "Replace the struts and mounts", correct: false, reasoning: "Both tested serviceable — this is unnecessary cost." },
          { id: "d", text: "Grease the bushings", correct: false, reasoning: "Sealed links cannot be greased and the play is mechanical wear." },
        ],
      },
    ],
    rootCause: "Worn front stabilizer bar end links with free play, knocking as the bar loads and unloads over bumps.",
    repair: "Replace both front stabilizer bar end links, torque fasteners to specification with the suspension at ride height, and road test over the customer's complaint conditions.",
    lesson:
      "Noise complaints get solved on the ground, not in the air. A hanging suspension unloads the very joints you are trying to test. Load the suspension, work it the way the road does, and measure the play you find before quoting a single part.",
  },

  /* ------------------------------------------------------------------ A5 */
  {
    id: "accord-brake-pull",
    title: "Pulls Right When Braking",
    vehicleId: "accord-2018",
    category: "A5",
    difficulty: "Intermediate",
    estimatedMinutes: 12,
    customerName: "Grace Okonjo",
    customerMood: "Safety-focused, drives her kids daily",
    complaint:
      "When I brake hard the car pulls to the right. There's also a burning smell after I drive on the highway.",
    interview: [
      { q: "Does it pull while just driving?", a: "No, only when I press the brake." },
      { q: "How long has it done this?", a: "Two or three weeks and it's getting worse." },
      { q: "Any noises?", a: "A grinding sound from the right front sometimes." },
      { q: "Does the pedal feel different?", a: "It feels okay, maybe a little firmer than before." },
      { q: "Any repairs recently?", a: "Brakes were done a year ago at a quick-lube place." },
    ],
    hideScanTool: true,
    failure: {
      id: "caliper-seized",
      name: "Seized right front caliper slide pins",
      system: "Brakes",
      effects: { vibrationOnBraking: 0.3, powerLoss: 0.05 },
    },
    codes: [],
    freezeFrame: {},
    testDriveEvents: [
      { atSecond: 8, label: "Pull under braking", detail: "Vehicle veers right during a moderate stop" },
      { atSecond: 18, label: "Hot wheel", detail: "Right front wheel measurably hotter after two stops" },
      { atSecond: 28, label: "Odor at the right front", detail: "Hot friction-material smell localized to that corner" },
    ],
    audioProfile: {
      id: "brake-pulsation",
      label: "Dragging brake",
      description: "Low scrubbing sound from a caliper that will not fully release. Synthesized for training.",
      synthetic: true,
    },
    warningLights: [],
    inspection: [
      {
        id: "rf-brake",
        system: "Brakes",
        label: "Right front brake assembly",
        findings: ["Outer pad worn to 2 mm, inner pad at 7 mm", "Slide pins dry and seized in the bracket", "Rotor heat-checked and blued"],
        measurement: "Right front rotor 21.4 mm (discard 22.0 mm)",
        abnormal: true,
      },
      {
        id: "lf-brake",
        system: "Brakes",
        label: "Left front brake assembly",
        findings: ["Both pads at 7 mm and even", "Slides move freely", "Rotor surface normal"],
        measurement: "Left front rotor 23.6 mm (new 25.0 mm)",
        abnormal: false,
      },
      {
        id: "hoses",
        system: "Brakes",
        label: "Flexible brake hoses",
        findings: ["No bulging or cracking", "Right front releases pressure normally when the caliper is cracked open"],
        abnormal: false,
      },
    ],
    testPoints: [
      { id: "abs-rf", label: "Right front wheel speed sensor", location: "Knuckle", acVolts: 0.62, ohms: 1180, note: "Sensor output normal — ABS is not commanding this pull" },
    ],
    tools: [
      {
        kind: "gauge",
        id: "brake-measure",
        title: "Brake measurement & temperature survey",
        hint: "Micrometer on rotors, dial indicator for runout, IR gun on all four wheels after a stop sequence",
        sets: [
          {
            id: "rotors",
            label: "Rotor measurement",
            condition: "Measured at four points around each rotor",
            readings: [
              { label: "RF thickness", measured: "21.4 mm", spec: "min 22.0 mm", abnormal: true },
              { label: "RF lateral runout", measured: "0.14 mm", spec: "under 0.05 mm", abnormal: true },
              { label: "LF thickness", measured: "23.6 mm", spec: "min 22.0 mm", abnormal: false },
            ],
          },
          {
            id: "temps",
            label: "Wheel temperature after three stops",
            condition: "IR readings taken immediately after a 60–0 km/h stop sequence",
            readings: [
              { label: "Right front", measured: "318 °C", spec: "Within 40 °C of the opposite side", abnormal: true, note: "A single hot corner is the clearest evidence of a brake that is not releasing." },
              { label: "Left front", measured: "142 °C", spec: "—", abnormal: false },
              { label: "Rear average", measured: "96 °C", spec: "—", abnormal: false },
            ],
          },
        ],
      },
      {
        kind: "fluid",
        id: "brake-fluid",
        title: "Brake fluid condition",
        hint: "Sample drawn from the master cylinder reservoir with a test strip and moisture meter",
        samples: [
          {
            id: "dot3",
            label: "Brake fluid",
            color: "#6b5a1c",
            condition: "Dark amber, 2.8 % moisture by the meter, copper at 140 ppm",
            smell: "Slightly scorched",
            verdict: "Fluid is due for service and the heat from the dragging caliper has accelerated it, but it is not the cause of the pull.",
            abnormal: true,
          },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is causing the pull under braking?",
        principle: "Uneven braking force between sides comes from unequal apply or unequal release.",
        options: [
          { id: "a", text: "Seized right front caliper slide pins causing uneven pad wear and a dragging brake", correct: true, reasoning: "Correct. Outer pad worn to 2 mm against a 7 mm inner, a 318 °C wheel, and pins seized in the bracket all describe one failure." },
          { id: "b", text: "Collapsed right front brake hose", correct: false, reasoning: "A collapsed hose traps pressure — but this caliper releases normally when cracked open." },
          { id: "c", text: "Failed ABS modulator", correct: false, reasoning: "Wheel speed sensor output is normal and no ABS codes are present." },
          { id: "d", text: "Contaminated brake fluid", correct: false, reasoning: "The fluid is degraded, but degraded fluid affects both sides and does not cause a one-sided pull." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "Which test most directly confirms an unreleased brake?",
        principle: "Heat is work. A brake that will not release converts energy into temperature.",
        options: [
          { id: "a", text: "Compare wheel temperatures side to side immediately after a controlled stop sequence", correct: true, reasoning: "Correct. A large single-corner temperature difference is objective evidence of drag." },
          { id: "b", text: "Bleed the brake system", correct: false, reasoning: "Air in the system causes a soft pedal, not a one-sided pull." },
          { id: "c", text: "Perform a four-wheel alignment", correct: false, reasoning: "The car tracks straight except while braking — that rules out alignment as the cause." },
          { id: "d", text: "Replace the master cylinder", correct: false, reasoning: "A master cylinder fault would affect both front brakes equally." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What is the correct repair?",
        principle: "Brakes are serviced in axle pairs, and hardware is part of the job.",
        options: [
          { id: "a", text: "Replace front pads and rotors as a pair, service or replace the caliper bracket and slide pins with new hardware and correct lubricant, then bed the brakes", correct: true, reasoning: "Correct. The right rotor is under discard thickness, and reusing seized hardware guarantees the complaint returns." },
          { id: "b", text: "Replace only the right front pads", correct: false, reasoning: "The rotor is below discard spec and the seized pins are untouched." },
          { id: "c", text: "Machine the right rotor and reinstall", correct: false, reasoning: "It is already below minimum thickness — machining it is unsafe." },
          { id: "d", text: "Flush the brake fluid and release the vehicle", correct: false, reasoning: "Worth recommending, but it does nothing about a brake that will not release." },
        ],
      },
    ],
    rootCause: "Seized right front caliper slide pins holding the outer pad against the rotor, producing drag, heat, uneven pad wear and a braking pull.",
    repair: "Replace front pads and rotors in an axle set, replace the caliper bracket hardware and slide pins with new boots and high-temperature lubricant, flush the brake fluid, then bed the new friction material.",
    lesson:
      "A braking pull is a comparison problem: measure both sides and let the difference tell you where to look. Temperature, pad thickness and rotor thickness are three cheap measurements that make the answer obvious, and hardware service is what keeps the repair from coming back.",
  },

  /* ------------------------------------------------------------------ A6 */
  {
    id: "prius-hybrid-nostart",
    title: "No Ready Light, Everything Else Works",
    vehicleId: "prius-2020",
    category: "A6",
    difficulty: "Master",
    estimatedMinutes: 18,
    customerName: "Ken Aldrich",
    customerMood: "Calm but stranded",
    complaint:
      "The dash lights up, the radio works, but the READY light never comes on. It just sits there with a red triangle.",
    interview: [
      { q: "Did anything happen before?", a: "It sat for three weeks while I was traveling." },
      { q: "Any warning before that?", a: "None. It was completely normal when I parked it." },
      { q: "Does anything crank or click?", a: "It's a hybrid — nothing cranks. Just no READY." },
      { q: "Have you jumped it?", a: "Yes, off my neighbor's truck. Dash came up brighter but still no READY." },
      { q: "Any service history?", a: "Regular oil changes. The 12-volt battery is original." },
    ],
    hideScanTool: false,
    failure: {
      id: "aux-battery-weak",
      name: "Degraded 12-volt auxiliary battery unable to hold the system relays",
      system: "Electrical",
      effects: { chargingVoltage: 11.4 },
    },
    codes: [
      { code: "P0A0D", description: "High Voltage System Interlock Circuit High" },
      { code: "U0100", description: "Lost Communication With ECM/PCM", pending: true },
      { code: "P0A80", description: "Replace Hybrid Battery Pack", pending: true },
    ],
    freezeFrame: {
      "Aux Battery Voltage": "10.8 V during READY attempt",
      "HV Battery SOC": "58 %",
      "System Main Relay": "Commanded ON, no feedback",
      "Ambient Temp": "14 °C",
    },
    testDriveEvents: [],
    audioProfile: {
      id: "ev-silent",
      label: "Silent hybrid system",
      description: "No combustion sound — verification here is electrical, not audible. Synthesized for training.",
      synthetic: true,
    },
    warningLights: ["Red triangle of death", "Hybrid system warning", "12V battery warning"],
    inspection: [
      {
        id: "aux",
        system: "Electrical",
        label: "12-volt auxiliary battery",
        findings: ["Original battery, date code seven years old", "Case slightly swollen", "Terminals clean and tight"],
        measurement: "Open-circuit voltage 11.6 V after a 40-minute rest",
        abnormal: true,
      },
      {
        id: "hv",
        system: "High Voltage",
        label: "HV service plug and orange cabling",
        findings: ["Service plug seated and latched", "No damage or rodent intrusion on any orange cable", "Interlock connectors seated"],
        abnormal: false,
      },
      {
        id: "grounds",
        system: "Electrical",
        label: "Chassis and inverter grounds",
        findings: ["All ground straps clean and torqued", "No corrosion at the inverter ground"],
        abnormal: false,
      },
    ],
    testPoints: [
      { id: "aux-rest", label: "Aux battery, rested", location: "Rear cargo area", dcVolts: 11.6, note: "A healthy 12 V battery rests above 12.4 V" },
      { id: "aux-load", label: "Aux battery under READY attempt", location: "Rear cargo area", dcVolts: 10.8, runningDcVolts: 10.8, note: "System main relays need a stable supply above 11 V to latch" },
      { id: "relay-coil", label: "System main relay coil feed", location: "HV battery junction", dcVolts: 10.9, note: "Coil is being commanded, but the supply sags below the pickup threshold" },
      { id: "chassis-gnd", label: "Aux negative → chassis", location: "Grounds", dcVolts: 0.02, continuity: true, note: "Ground path is good" },
    ],
    tools: [
      {
        kind: "network",
        id: "bus-scan",
        title: "Module communication scan",
        hint: "Full network scan on the CAN and LIN buses with the system in IG-ON",
        modules: [
          { name: "Hybrid Vehicle Control ECU", address: "0x7E2", status: "ok", note: "Responds, reports main relay commanded with no feedback" },
          { name: "Battery ECU", address: "0x7E3", status: "intermittent", note: "Drops off whenever supply voltage sags below 10.9 V" },
          { name: "Engine ECU", address: "0x7E0", status: "intermittent", note: "U0100 sets during the same voltage sag" },
          { name: "Skid Control ECU", address: "0x7B0", status: "ok", note: "No stored faults" },
        ],
        busNote:
          "Multiple modules dropping together during the same low-voltage event points at a shared supply problem, not several failed modules.",
      },
      {
        kind: "codes",
        id: "hv-codes",
        title: "Hybrid control module codes",
        hint: "Read from the hybrid ECU rather than generic OBD-II",
        module: "Hybrid Vehicle Control ECU",
        codes: [
          { code: "P0A0D", description: "High Voltage System Interlock Circuit High", status: "Current", freeze: "Aux voltage 10.8 V at fault time" },
          { code: "P0A80", description: "Replace Hybrid Battery Pack", status: "Pending — set during low-voltage event", freeze: "HV SOC 58 %, no cell block out of range" },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "Why will the vehicle not enter READY?",
        principle: "On a hybrid, the 12-volt system wakes and latches everything. Fix supply before you believe any high-voltage code.",
        options: [
          { id: "a", text: "Degraded 12-volt auxiliary battery that cannot hold the system main relays closed", correct: true, reasoning: "Correct. Rested 11.6 V, sagging to 10.8 V during the attempt, with multiple modules dropping off together at the same instant." },
          { id: "b", text: "Failed hybrid battery pack", correct: false, reasoning: "P0A80 is pending and set during the low-voltage event; HV SOC is 58 % with no block out of range." },
          { id: "c", text: "Open high-voltage interlock loop", correct: false, reasoning: "The service plug and interlock connectors are all seated — P0A0D set because the module lost supply mid-check." },
          { id: "d", text: "Failed hybrid control ECU", correct: false, reasoning: "It responds on the bus and reports its own relay command correctly." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "What is the correct next step before condemning any high-voltage component?",
        principle: "Never diagnose a network or HV complaint on a weak battery.",
        options: [
          { id: "a", text: "Install a stable power supply, restore correct 12-volt system voltage, then clear codes and retest", correct: true, reasoning: "Correct. With supply guaranteed, the pending HV codes either return as real faults or disappear as artifacts." },
          { id: "b", text: "Quote a hybrid battery pack replacement based on P0A80", correct: false, reasoning: "Selling a pack on a pending code set during a brownout is the most expensive mistake available here." },
          { id: "c", text: "Replace the hybrid control ECU", correct: false, reasoning: "No evidence of module failure — it communicates normally." },
          { id: "d", text: "Disconnect the HV service plug and measure pack voltage", correct: false, reasoning: "Unnecessary HV exposure before the low-voltage cause has been ruled out." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What repair and verification do you perform?",
        principle: "Repair the supply, then prove the downstream faults were artifacts.",
        options: [
          { id: "a", text: "Replace the 12-volt auxiliary battery, verify charging, clear all codes and confirm READY plus no returning HV faults over several cycles", correct: true, reasoning: "Correct. This addresses the proven fault and verifies that the interlock and pack codes do not return." },
          { id: "b", text: "Charge the existing battery and release the vehicle", correct: false, reasoning: "A seven-year-old swollen battery that rests at 11.6 V will strand the customer again." },
          { id: "c", text: "Replace the battery and the hybrid pack together", correct: false, reasoning: "Unjustified cost — the pack has not been shown to be faulty." },
          { id: "d", text: "Clear codes and observe", correct: false, reasoning: "The vehicle does not currently start; there is nothing to observe." },
        ],
      },
    ],
    rootCause: "A failed 12-volt auxiliary battery sagging to 10.8 V during the READY attempt, preventing the system main relays from latching and setting cascading interlock and communication codes.",
    repair: "Replace the 12-volt auxiliary battery with the correct AGM unit, verify the DC-DC converter maintains roughly 14 V, clear all stored codes, and confirm READY with no returning hybrid faults across multiple key cycles.",
    lesson:
      "Low system voltage is the great liar of modern diagnostics. It sets codes in modules that have nothing wrong with them, especially high-voltage and network codes. Prove the 12-volt supply is solid under load first, then re-read codes — half of them are usually gone.",
  },

  /* ------------------------------------------------------------------ A7 */
  {
    id: "escape-ac-intermittent",
    title: "A/C Cold Some Days, Warm Others",
    vehicleId: "escape-2019",
    category: "A7",
    difficulty: "Intermediate",
    estimatedMinutes: 13,
    customerName: "Bianca Ruiz",
    customerMood: "Tired of coming back",
    complaint:
      "Some mornings the air conditioning is ice cold. Other days it blows warm the whole trip. Nobody can catch it doing it.",
    interview: [
      { q: "Any pattern to the bad days?", a: "It seems worse when it's really hot outside." },
      { q: "Does the fan still blow hard?", a: "Yes, airflow is always strong." },
      { q: "Any noises when it's warm?", a: "I hear a click from under the hood every few seconds." },
      { q: "Was it ever serviced?", a: "A shop added refrigerant last summer." },
      { q: "Does it help at highway speed?", a: "A little bit, yes." },
    ],
    hideMultimeter: false,
    failure: {
      id: "ac-overcharge",
      name: "Refrigerant overcharge causing high-pressure cutout cycling",
      system: "HVAC",
      effects: { powerLoss: 0.03, coolantOffset: 4 },
    },
    codes: [{ code: "B1229", description: "A/C High Pressure Switch Circuit — Cutout Events Logged", pending: true }],
    freezeFrame: {
      "Ambient Temp": "34 °C",
      "Evaporator Temp": "13 °C",
      "Head Pressure at Cutout": "3170 kPa",
      "Compressor Cycles": "11 per minute",
      "Cooling Fan": "Commanded high",
    },
    testDriveEvents: [
      { atSecond: 6, label: "Cold at first", detail: "Vent temperature reaches 6 °C briefly" },
      { atSecond: 15, label: "Compressor cutout", detail: "Audible click as the clutch disengages on high pressure" },
      { atSecond: 26, label: "Vent temp climbs", detail: "Vent temperature drifts up to 21 °C during idle in traffic" },
    ],
    audioProfile: {
      id: "ac-cycling",
      label: "Rapid compressor cycling",
      description: "Repeating clutch engage/disengage click with a small engine load change on each cycle. Synthesized for training.",
      synthetic: true,
    },
    warningLights: [],
    inspection: [
      {
        id: "condenser",
        system: "HVAC",
        label: "Condenser and airflow",
        findings: ["Fins clean, no bug pack or debris", "Both cooling fans run at commanded speed", "No fin damage"],
        abnormal: false,
      },
      {
        id: "cabin",
        system: "HVAC",
        label: "Cabin filter and evaporator airflow",
        findings: ["Filter recently replaced", "Strong airflow at all vents", "Blend door moves fully hot to cold"],
        abnormal: false,
      },
      {
        id: "compressor",
        system: "HVAC",
        label: "Compressor and clutch",
        findings: ["Clutch engages instantly when commanded", "No bearing noise", "Rapid cycling observed at idle in high ambient temperature"],
        abnormal: true,
      },
    ],
    testPoints: [
      { id: "hp-switch", label: "High-pressure switch signal", location: "Liquid line", dcVolts: 4.6, note: "Switch opens as pressure rises — the switch is doing its job" },
      { id: "clutch-feed", label: "Compressor clutch feed", location: "Compressor", dcVolts: 0, runningDcVolts: 13.8, note: "Power present when commanded; drops out at each cutout" },
    ],
    tools: [
      {
        kind: "gauge",
        id: "manifold",
        title: "A/C manifold gauge set",
        hint: "Low and high side readings taken at idle and at 1500 rpm with doors open and max A/C",
        sets: [
          {
            id: "idle",
            label: "Idle, 34 °C ambient",
            condition: "Max A/C, recirculate, blower high, doors open",
            readings: [
              { label: "Low side", measured: "410 kPa", spec: "170–275 kPa", abnormal: true },
              { label: "High side", measured: "3080 kPa", spec: "1550–2070 kPa", abnormal: true, note: "Both sides high together is the classic overcharge or condenser-airflow signature — and airflow already checked good." },
              { label: "Vent temperature", measured: "19 °C", spec: "2–8 °C", abnormal: true },
            ],
          },
          {
            id: "1500",
            label: "1500 rpm",
            condition: "Same conditions, engine held at 1500 rpm",
            readings: [
              { label: "High side", measured: "3170 kPa (cutout)", spec: "1550–2070 kPa", abnormal: true },
              { label: "Cycle rate", measured: "11 per minute", spec: "2–4 per minute", abnormal: true },
            ],
          },
        ],
      },
      {
        kind: "actuator",
        id: "hvac-actuators",
        title: "HVAC bidirectional controls",
        hint: "Command each actuator and compare expected to actual response",
        actuators: [
          { id: "blend", name: "Blend door actuator", command: "Sweep full cold to full hot", expected: "Vent temp tracks the command across the full range", actual: "Tracks correctly through the full sweep", abnormal: false },
          { id: "mode", name: "Mode door actuator", command: "Cycle panel / floor / defrost", expected: "Airflow moves to each outlet", abnormal: false, actual: "Correct at every position" },
          { id: "clutch", name: "Compressor clutch", command: "Force engage for 30 s", expected: "Stays engaged for the full command", actual: "Disengages after 5 s on high-pressure cutout", abnormal: true },
          { id: "fans", name: "Cooling fans", command: "Command high speed", expected: "Both fans at high", actual: "Both fans at high, verified by airflow", abnormal: false },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "Why is the system cooling inconsistently?",
        principle: "Both gauge sides high with good condenser airflow means too much refrigerant in the system.",
        options: [
          { id: "a", text: "Refrigerant overcharge from the previous top-off, causing high-pressure cutout cycling", correct: true, reasoning: "Correct. High low side, high high side, good airflow, and cutout events every few seconds when ambient temperature is high." },
          { id: "b", text: "Low refrigerant charge", correct: false, reasoning: "A low charge shows a low low-side reading and a low high side — the opposite of what is measured." },
          { id: "c", text: "Failed blend door actuator", correct: false, reasoning: "The blend door sweeps correctly through its full range under command." },
          { id: "d", text: "Failed compressor", correct: false, reasoning: "The compressor engages instantly and builds pressure well — arguably too well." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "What is the correct way to establish the true charge level?",
        principle: "Charge by weight, never by gauge feel or sight glass.",
        options: [
          { id: "a", text: "Recover and weigh the refrigerant, then compare it to the underhood label specification", correct: true, reasoning: "Correct. Recovery gives an exact number, and the label tells you what it should be — that is a defensible measurement." },
          { id: "b", text: "Vent some refrigerant until pressures look right", correct: false, reasoning: "Illegal, environmentally harmful, and unmeasurable." },
          { id: "c", text: "Add more refrigerant", correct: false, reasoning: "Would deepen the fault the customer is already paying for." },
          { id: "d", text: "Replace the high-pressure switch", correct: false, reasoning: "The switch is correctly protecting the system from real overpressure." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What is the correct service?",
        principle: "Evacuate, weigh in, verify at the complaint condition.",
        options: [
          { id: "a", text: "Recover the charge, evacuate the system, weigh in the exact factory charge with the correct oil, then verify pressures and vent temperature at high ambient temperature", correct: true, reasoning: "Correct. Only a weighed charge and a verification run at the complaint conditions prove the repair." },
          { id: "b", text: "Recover a small amount until the gauges look normal", correct: false, reasoning: "Guessing at charge is how the vehicle got here in the first place." },
          { id: "c", text: "Replace the compressor and receiver-drier", correct: false, reasoning: "No component has been shown to be faulty." },
          { id: "d", text: "Install a larger condenser fan", correct: false, reasoning: "Condenser airflow already tested good." },
        ],
      },
    ],
    rootCause: "Refrigerant overcharge from an unmeasured top-off, driving head pressure into the high-pressure cutout and causing rapid compressor cycling in hot weather.",
    repair: "Recover and weigh the existing charge, evacuate to deep vacuum and confirm it holds, weigh in the factory-specified charge with the correct PAG oil, then verify pressures, cycle rate and vent temperature at high ambient temperature.",
    lesson:
      "An overcharged A/C system looks like a healthy one at idle on a mild day and fails exactly when the customer needs it. Both sides reading high with good airflow is the signature. Always charge by weight — gauges tell you how the system is behaving, not how much refrigerant is in it.",
  },
];
