import type { Scenario } from "./types";
import { CHASSIS_SCENARIOS } from "./scenarios-chassis";
import { SYSTEMS_SCENARIOS } from "./scenarios-systems";

const ENGINE_SCENARIOS: Scenario[] = [
  {
    id: "accord-vacuum-leak",
    title: "Rough Idle & Check Engine Light",
    vehicleId: "accord-2018",
    category: "A8",
    difficulty: "Intermediate",
    estimatedMinutes: 12,
    customerName: "Denise Alvarado",
    customerMood: "Concerned, in a hurry",
    complaint:
      "The engine started running rough yesterday. The check engine light came on and it feels worse when I'm sitting at a red light.",
    interview: [
      {
        q: "When did it begin?",
        a: "Yesterday morning. It was fine on Friday, then Saturday it started shaking at the stoplight.",
      },
      {
        q: "Is it worse cold or hot?",
        a: "Honestly it shakes either way, but it's the worst when I'm just sitting there idling.",
      },
      {
        q: "Does it happen under acceleration?",
        a: "Not really — once I'm moving it kind of smooths out.",
      },
      {
        q: "Has anything been repaired recently?",
        a: "I had the intake cleaned and a hose replaced at a quick-lube place about two weeks ago.",
      },
      {
        q: "Does the warning light stay on?",
        a: "It's on all the time now. It blinked once but mostly it just stays lit.",
      },
      {
        q: "Is the vehicle losing power?",
        a: "It feels a little weak pulling away from a stop, but on the highway it seems normal.",
      },
    ],
    failure: {
      id: "intake-vacuum-leak",
      name: "Post-MAF intake manifold vacuum leak (cracked PCV hose)",
      system: "Air Induction",
      effects: {
        stftIdle: 22,
        ltftIdle: 19,
        stftCruise: 4,
        ltftCruise: 6,
        roughIdle: 0.6,
        misfireRate: 0.12,
        powerLoss: 0.1,
      },
    },
    codes: [
      { code: "P0171", description: "System Too Lean (Bank 1)" },
      { code: "P0300", description: "Random/Multiple Cylinder Misfire Detected", pending: true },
    ],
    freezeFrame: {
      "Engine RPM": "712 rpm",
      "Calculated Load": "24 %",
      "Coolant Temp": "89 °C",
      "Short Term Fuel Trim": "+21.9 %",
      "Long Term Fuel Trim": "+18.8 %",
      "Vehicle Speed": "0 km/h",
      "Throttle Position": "13 %",
    },
    testDriveEvents: [
      { atSecond: 4, label: "Idle instability", detail: "RPM oscillating 640–780 with visible shake" },
      { atSecond: 12, label: "Hesitation off idle", detail: "Brief stumble during initial tip-in" },
      { atSecond: 22, label: "Smooths out under load", detail: "Idle roughness disappears above 2000 rpm" },
    ],
    audioProfile: {
      id: "lean-rough-idle",
      label: "Rough idle with intermittent hiss",
      description:
        "Uneven idle pulses with a steady high-frequency hiss that changes with throttle. Synthesized for training.",
      synthetic: true,
    },
    warningLights: ["MIL"],
    inspection: [
      {
        id: "intake",
        system: "Air Intake",
        label: "Intake ducting & PCV plumbing",
        findings: [
          "Hard plastic PCV hose shows a hairline crack near the manifold nipple",
          "Audible hiss increases when hose is flexed",
        ],
        measurement: "Manifold vacuum: 14.2 inHg (spec 18–22 inHg)",
        abnormal: true,
      },
      {
        id: "battery",
        system: "Electrical",
        label: "Battery & charging",
        findings: ["Terminals clean", "Case in good condition"],
        measurement: "12.58 V key off / 14.1 V running",
        abnormal: false,
      },
      {
        id: "engine-bay",
        system: "Engine Bay",
        label: "General engine bay",
        findings: ["No fluid leaks", "Belt in good condition", "Coil boots seated"],
        abnormal: false,
      },
      {
        id: "fluids",
        system: "Fluids",
        label: "Fluid levels",
        findings: ["Oil at full, clean", "Coolant at MAX", "Brake fluid normal"],
        abnormal: false,
      },
      {
        id: "exhaust",
        system: "Exhaust",
        label: "Exhaust system",
        findings: ["No leaks at manifold or flex pipe", "No soot at tailpipe"],
        abnormal: false,
      },
    ],
    testPoints: [
      { id: "bat-pos", label: "Battery positive → negative", location: "Battery", dcVolts: 12.58, runningDcVolts: 14.1, ohms: "OL" },
      { id: "coil1", label: "Coil 1 power feed → ground", location: "Ignition", dcVolts: 12.4, runningDcVolts: 13.9, ohms: 0.8 },
      { id: "map-sig", label: "MAP sensor signal → ground", location: "Sensors", dcVolts: 4.6, runningDcVolts: 2.1, note: "Key-on high, idle signal elevated vs expected 1.2 V" },
      { id: "eng-ground", label: "Engine block → battery negative", location: "Grounds", dcVolts: 0.02, ohms: 0.2, continuity: true },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is the most likely root cause?",
        principle:
          "Fuel trims that are strongly positive at idle and near-normal at cruise point to unmetered air entering after the MAF — the leak is a large percentage of airflow at idle and a small percentage at cruise.",
        options: [
          { id: "a", text: "Failed oxygen sensor", correct: false, reasoning: "The O2 sensor is reporting lean and the PCM is correcting for it. A failed sensor usually produces trims that do not track engine load in a logical pattern." },
          { id: "b", text: "Unmetered air (vacuum) leak after the MAF", correct: true, reasoning: "Positive trims at idle that fall off at cruise, low manifold vacuum, and an audible hiss all point to unmetered air." },
          { id: "c", text: "Failed fuel injector", correct: false, reasoning: "A single dead injector produces a cylinder-specific misfire code, not a bank-wide lean condition that improves with load." },
          { id: "d", text: "Low fuel pressure", correct: false, reasoning: "Low fuel pressure typically goes lean worst under high load, not at idle where demand is lowest." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "What test should you perform next to confirm your hypothesis?",
        principle:
          "Confirm before you condemn. A confirmation test must be able to prove the hypothesis wrong.",
        options: [
          { id: "a", text: "Replace the oxygen sensor and re-test", correct: false, reasoning: "Parts swapping is not a test. It costs the customer money and proves nothing." },
          { id: "b", text: "Smoke test the intake system", correct: true, reasoning: "Smoke testing pressurizes the intake and makes an unmetered-air leak directly visible — a pass/fail confirmation." },
          { id: "c", text: "Replace spark plugs", correct: false, reasoning: "Plugs may be a contributor to misfire, but nothing in the evidence indicates ignition wear." },
          { id: "d", text: "Reflash the ECU", correct: false, reasoning: "There is no evidence of a software concern, and reflashing erases the diagnostic data you need." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "The smoke test shows smoke escaping at the PCV hose. What repair should be performed?",
        principle:
          "Repair the failed component and address the reason it failed, then verify with data — not just by clearing the light.",
        options: [
          { id: "a", text: "Replace the cracked PCV hose and re-verify fuel trims", correct: true, reasoning: "Correct. Replace the failed part, then confirm trims fall within roughly ±10 % at idle before returning the vehicle." },
          { id: "b", text: "Seal the crack with silicone tape", correct: false, reasoning: "A temporary seal on a heat-cycled hose will fail again and is not an acceptable repair." },
          { id: "c", text: "Clear the codes and return the vehicle", correct: false, reasoning: "Clearing codes without repair guarantees the customer comes back — and destroys your diagnostic data." },
          { id: "d", text: "Replace the intake manifold assembly", correct: false, reasoning: "Replacing good parts alongside the failed one is not a repair, it's an upsell." },
        ],
      },
    ],
    rootCause: "Cracked PCV hose allowing unmetered air into the intake manifold downstream of the MAF sensor.",
    repair: "Replace PCV hose, clear codes, verify fuel trims return to within ±10 % at idle over a full drive cycle.",
    lesson:
      "Fuel trim behavior across load is one of the most powerful diagnostic signals available. Trims strongly positive at idle and near zero at cruise indicate a fixed-volume air leak. Trims positive across all loads more often indicate a fuel delivery or metering problem. Always compare idle trims to cruise trims before condemning a sensor.",
  },
  {
    id: "f150-misfire-coil",
    title: "Flashing MIL Under Acceleration",
    vehicleId: "f150-2015",
    category: "A8",
    difficulty: "Advanced",
    estimatedMinutes: 15,
    customerName: "Ray Whitcomb",
    customerMood: "Frustrated, works the truck daily",
    complaint:
      "It stumbles bad when I get on it with a load in the bed, and the light flashes at me. At idle it's mostly fine.",
    interview: [
      { q: "When did it begin?", a: "Started about a week ago, gets worse when it's damp out." },
      { q: "Does it happen under acceleration?", a: "Every time I put my foot in it going up the grade." },
      { q: "Does it happen at idle?", a: "Sometimes a little shake, but nothing like when I'm pulling." },
      { q: "Has anything been repaired?", a: "Plugs were done about 20,000 miles ago at a shop." },
      { q: "Does the warning light stay on?", a: "It flashes when it stumbles, then just stays on after." },
      { q: "Is the vehicle losing power?", a: "Feels like it falls flat on its face when it acts up." },
    ],
    failure: {
      id: "coil-breakdown-load",
      name: "Cylinder 4 ignition coil breaking down under load",
      system: "Ignition System",
      effects: { misfireRate: 0.35, powerLoss: 0.3, roughIdle: 0.2, stftIdle: 5, ltftIdle: 3 },
    },
    codes: [
      { code: "P0304", description: "Cylinder 4 Misfire Detected" },
      { code: "P0300", description: "Random/Multiple Cylinder Misfire Detected" },
    ],
    freezeFrame: {
      "Engine RPM": "3180 rpm",
      "Calculated Load": "84 %",
      "Coolant Temp": "94 °C",
      "Short Term Fuel Trim": "+4.7 %",
      "Long Term Fuel Trim": "+2.3 %",
      "Vehicle Speed": "68 km/h",
      "Throttle Position": "71 %",
    },
    testDriveEvents: [
      { atSecond: 6, label: "Clean idle", detail: "Idle quality within normal range" },
      { atSecond: 15, label: "Misfire under load", detail: "Heavy stumble above 60 % throttle, MIL flashing" },
      { atSecond: 26, label: "Recovers off throttle", detail: "Misfire counter stops incrementing at light load" },
    ],
    audioProfile: {
      id: "load-misfire",
      label: "Load-dependent misfire",
      description: "Rhythmic exhaust puff and power loss appearing only under heavy throttle. Synthesized for training.",
      synthetic: true,
    },
    warningLights: ["MIL (flashing)"],
    inspection: [
      { id: "engine-bay", system: "Engine Bay", label: "Coils & boots", findings: ["Cylinder 4 boot shows carbon tracking", "Remaining boots clean"], abnormal: true },
      { id: "intake", system: "Air Intake", label: "Intake ducting", findings: ["Clamps tight, no cracks"], measurement: "Manifold vacuum: 19.6 inHg", abnormal: false },
      { id: "fluids", system: "Fluids", label: "Fluid levels", findings: ["Oil slightly dark but at level", "Coolant normal"], abnormal: false },
      { id: "exhaust", system: "Exhaust", label: "Exhaust", findings: ["No leaks found"], abnormal: false },
      { id: "battery", system: "Electrical", label: "Battery & charging", findings: ["Healthy"], measurement: "12.61 V / 14.3 V running", abnormal: false },
    ],
    testPoints: [
      { id: "bat-pos", label: "Battery positive → negative", location: "Battery", dcVolts: 12.61, runningDcVolts: 14.3, ohms: "OL" },
      { id: "coil4-pwr", label: "Coil 4 power feed → ground", location: "Ignition", dcVolts: 12.5, runningDcVolts: 14.1, ohms: 0.6, note: "Supply is good — the driver and coil primary are the suspects" },
      { id: "coil4-prim", label: "Coil 4 primary winding", location: "Ignition", ohms: 3.9, note: "Spec 0.4–0.7 Ω — reading is high" },
      { id: "coil1-prim", label: "Coil 1 primary winding (known good)", location: "Ignition", ohms: 0.55 },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is the most likely root cause?",
        principle: "Load-dependent misfire on a single cylinder points to an ignition component that breaks down as cylinder pressure and required firing voltage rise.",
        options: [
          { id: "a", text: "Ignition coil on cylinder 4 breaking down under load", correct: true, reasoning: "Cylinder-specific code, carbon tracking on the boot, and out-of-spec primary resistance all agree." },
          { id: "b", text: "Clogged catalytic converter", correct: false, reasoning: "A restricted cat causes progressive power loss and high backpressure, not a single-cylinder misfire code." },
          { id: "c", text: "Failed MAF sensor", correct: false, reasoning: "A MAF fault would skew fuel trims across the bank; trims here are near zero." },
          { id: "d", text: "Worn timing chain", correct: false, reasoning: "Chain wear produces cam/crank correlation codes and affects all cylinders." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "What test best confirms the coil before replacing it?",
        principle: "Substitution tests must move the fault with the part, otherwise you have proven nothing.",
        options: [
          { id: "a", text: "Swap coil 4 with coil 1 and see if the misfire follows", correct: true, reasoning: "If P0301 replaces P0304, the fault moved with the coil — a definitive confirmation." },
          { id: "b", text: "Clear codes and drive it again", correct: false, reasoning: "Reproducing the fault is not the same as isolating it." },
          { id: "c", text: "Replace all eight coils", correct: false, reasoning: "Shotgunning parts is expensive and hides the real failure mode." },
          { id: "d", text: "Perform a cooling system pressure test", correct: false, reasoning: "Unrelated system — no evidence of a cooling concern." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "The misfire follows the coil. What is the correct repair?",
        principle: "Address the failed part and the secondary damage it caused, then verify under the same conditions that produced the fault.",
        options: [
          { id: "a", text: "Replace the failed coil and its carbon-tracked boot, then road test under load", correct: true, reasoning: "Correct. A tracked boot will destroy a new coil, and verification must reproduce the original load condition." },
          { id: "b", text: "Replace the coil only and return the vehicle", correct: false, reasoning: "The carbon-tracked boot provides a path to ground and will cause a repeat failure." },
          { id: "c", text: "Replace the spark plug only", correct: false, reasoning: "The plug is not what failed; primary resistance was out of spec." },
          { id: "d", text: "Replace the PCM", correct: false, reasoning: "No evidence of a driver circuit failure — the coil primary itself tested bad." },
        ],
      },
    ],
    rootCause: "Cylinder 4 ignition coil with high primary resistance breaking down under high cylinder pressure, aggravated by a carbon-tracked boot.",
    repair: "Replace coil and boot on cylinder 4, inspect plug, verify no misfire counts under a loaded road test.",
    lesson:
      "A flashing MIL means catalyst-damaging misfire — stop and diagnose immediately. Misfires that appear only under load point to ignition system breakdown, because required firing voltage climbs with cylinder pressure. A component that tests fine at idle can still fail at 80 % load.",
  },
  {
    id: "camry-brake-pulsation",
    title: "Steering Wheel Shake When Braking",
    vehicleId: "camry-2012",
    category: "A5",
    difficulty: "Beginner",
    estimatedMinutes: 9,
    customerName: "Marcus Bell",
    customerMood: "Calm, wants a straight answer",
    complaint:
      "When I brake coming off the highway, the steering wheel shakes in my hands. It's fine if I'm braking slow around town.",
    interview: [
      { q: "When did it begin?", a: "Maybe a month ago, and it's gotten a bit worse." },
      { q: "Does it happen at low speed?", a: "Barely. It's really only from highway speeds." },
      { q: "Do you hear any noise?", a: "No squealing or grinding that I've noticed." },
      { q: "Has anything been repaired?", a: "Front brakes were done maybe two years back." },
      { q: "Does the warning light stay on?", a: "No lights at all on the dash." },
      { q: "Is the vehicle pulling to one side?", a: "No, it stops straight. It just shakes." },
    ],
    failure: {
      id: "front-rotor-thickness-variation",
      name: "Front brake rotor thickness variation (lateral runout)",
      system: "Brakes",
      effects: { vibrationOnBraking: 0.7 },
    },
    codes: [],
    freezeFrame: {},
    testDriveEvents: [
      { atSecond: 8, label: "Normal acceleration", detail: "No driveline vibration under power" },
      { atSecond: 18, label: "Pulsation at highway braking", detail: "Steering wheel oscillation felt at 100→50 km/h braking" },
      { atSecond: 27, label: "Low-speed braking normal", detail: "No pulsation felt below 40 km/h" },
    ],
    audioProfile: {
      id: "brake-pulsation",
      label: "Brake pulsation feedback",
      description: "Cyclic pad-to-rotor contact sound rising with wheel speed. Synthesized for training.",
      synthetic: true,
    },
    warningLights: [],
    inspection: [
      { id: "brakes", system: "Brakes", label: "Front brake assembly", findings: ["Pad material 6 mm, even wear", "Visible burnish rings on rotor face", "Caliper slides move freely"], measurement: "Rotor thickness variation: 0.041 mm (spec max 0.015 mm)", abnormal: true },
      { id: "wheels", system: "Wheels", label: "Wheels & tires", findings: ["Tread even, no cupping", "Balance weights present"], abnormal: false },
      { id: "suspension", system: "Suspension", label: "Front suspension", findings: ["Ball joints tight", "No play in tie rods", "Wheel bearings quiet"], abnormal: false },
      { id: "fluids", system: "Fluids", label: "Brake fluid", findings: ["Level at MAX, fluid clear"], abnormal: false },
    ],
    testPoints: [
      { id: "bat-pos", label: "Battery positive → negative", location: "Battery", dcVolts: 12.54, runningDcVolts: 13.9, ohms: "OL" },
      { id: "abs-sensor-fl", label: "Front-left wheel speed sensor", location: "Brakes", acVolts: 0.62, ohms: 1180, note: "Within spec — ABS circuit healthy" },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is the most likely root cause?",
        principle: "Vibration only present while braking implicates the brake system; vibration present while driving implicates tires, wheels, or driveline.",
        options: [
          { id: "a", text: "Tire imbalance", correct: false, reasoning: "An imbalance produces vibration at a given speed whether or not you are braking." },
          { id: "b", text: "Front rotor thickness variation", correct: true, reasoning: "Measured variation of 0.041 mm is nearly triple spec and produces pulsation that grows with speed." },
          { id: "c", text: "Worn wheel bearing", correct: false, reasoning: "A bad bearing hums and changes with cornering load, not with brake application." },
          { id: "d", text: "ABS module fault", correct: false, reasoning: "No ABS codes, no warning lamp, and the wheel speed sensor tests within spec." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "What measurement confirms this before you sell the repair?",
        principle: "Measure with the correct instrument against a published specification — never by feel alone.",
        options: [
          { id: "a", text: "Measure rotor thickness variation with a micrometer at 8 points", correct: true, reasoning: "Correct. Multiple points around the rotor face reveal variation a single reading would miss." },
          { id: "b", text: "Road test again at higher speed", correct: false, reasoning: "You already reproduced the concern; repeating it adds no new data." },
          { id: "c", text: "Rebalance the wheels", correct: false, reasoning: "That is a repair attempt, not a diagnostic measurement." },
          { id: "d", text: "Scan for ABS codes only", correct: false, reasoning: "Useful as a check, but it cannot confirm a mechanical rotor condition." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What repair should be performed?",
        principle: "Restore the friction surfaces and control the cause of runout, then verify.",
        options: [
          { id: "a", text: "Replace or machine front rotors, service the hub face, torque wheels to spec in a star pattern", correct: true, reasoning: "Correct. A dirty hub face or uneven lug torque is the usual reason runout returns." },
          { id: "b", text: "Replace pads only", correct: false, reasoning: "New pads on a varying rotor surface will pulsate again quickly." },
          { id: "c", text: "Replace the caliper", correct: false, reasoning: "The caliper slides move freely — no evidence of a seized caliper." },
          { id: "d", text: "Replace the front struts", correct: false, reasoning: "Suspension inspection was normal and struts do not cause braking pulsation." },
        ],
      },
    ],
    rootCause: "Front brake rotors with thickness variation beyond specification, producing pulsation felt through the steering wheel under braking.",
    repair: "Machine or replace front rotors, clean hub mounting faces, install pads, torque lug nuts to specification, verify with a road test.",
    lesson:
      "Isolate a vibration by when it occurs. Braking-only vibration = brake system. Speed-related vibration regardless of braking = tire, wheel, or driveline. Cornering-related noise = wheel bearing. Getting this triage right in the first two minutes saves an hour of misdirected work.",
  },
  {
    id: "silverado-charging",
    title: "Battery Light and Dim Headlights",
    vehicleId: "silverado-2019",
    category: "A6",
    difficulty: "Intermediate",
    estimatedMinutes: 11,
    customerName: "Tina Okafor",
    customerMood: "Worried about getting stranded",
    complaint:
      "The battery light flickers on when I'm idling and my headlights go dim. It's already died on me once in a parking lot.",
    interview: [
      { q: "When did it begin?", a: "About two weeks ago, right after a cold snap." },
      { q: "Is it worse at idle?", a: "Yes — at a stop the lights dim, and it clears up a bit when I drive." },
      { q: "Has anything been repaired?", a: "Someone put a new battery in it last month." },
      { q: "Does the warning light stay on?", a: "It flickers, it doesn't stay solid." },
      { q: "Any noises from the engine bay?", a: "There's a faint whine sometimes, but I might be imagining it." },
      { q: "Is the vehicle losing power?", a: "No, it drives fine. It's just the electrical stuff." },
    ],
    failure: {
      id: "high-resistance-ground",
      name: "High-resistance alternator-to-body ground strap",
      system: "Electrical",
      effects: { chargingVoltage: 12.9 },
    },
    codes: [{ code: "P0562", description: "System Voltage Low" }],
    freezeFrame: {
      "Engine RPM": "612 rpm",
      "Calculated Load": "19 %",
      "Coolant Temp": "88 °C",
      "Control Module Voltage": "12.9 V",
      "Vehicle Speed": "0 km/h",
      "Throttle Position": "11 %",
    },
    testDriveEvents: [
      { atSecond: 5, label: "Voltage sag at idle", detail: "System voltage drops to 12.9 V with load applied" },
      { atSecond: 16, label: "Partial recovery", detail: "Voltage rises to 13.4 V at 2000 rpm — still below spec" },
      { atSecond: 25, label: "Lamp flicker", detail: "Charge indicator flickers when returning to idle" },
    ],
    audioProfile: {
      id: "alt-bearing-whine",
      label: "Faint accessory whine",
      description: "Low-amplitude rotational whine tracking engine speed. Synthesized for training.",
      synthetic: true,
    },
    warningLights: ["Charging system"],
    inspection: [
      { id: "battery", system: "Electrical", label: "Battery & cables", findings: ["Battery is new and holds surface charge", "Positive terminal clean", "Ground strap to body shows green corrosion"], measurement: "12.44 V key off / 12.9 V running", abnormal: true },
      { id: "engine-bay", system: "Engine Bay", label: "Belt & pulleys", findings: ["Belt tension normal", "No pulley wobble"], abnormal: false },
      { id: "fuse-box", system: "Electrical", label: "Underhood fuse box", findings: ["No blown fuses", "No heat damage at terminals"], abnormal: false },
      { id: "fluids", system: "Fluids", label: "Fluid levels", findings: ["All levels normal"], abnormal: false },
    ],
    testPoints: [
      { id: "bat-static", label: "Battery positive → negative (key off)", location: "Battery", dcVolts: 12.44, runningDcVolts: 12.9 },
      { id: "alt-b", label: "Alternator B+ → alternator case", location: "Charging", dcVolts: 12.5, runningDcVolts: 14.4, note: "Alternator output at the case is correct" },
      { id: "ground-drop", label: "Alternator case → battery negative (voltage drop, engine running)", location: "Grounds", dcVolts: 1.42, note: "Spec max 0.2 V — excessive drop on the ground path" },
      { id: "pos-drop", label: "Alternator B+ → battery positive (voltage drop)", location: "Charging", dcVolts: 0.08, note: "Within spec" },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is the most likely root cause?",
        principle: "When the alternator produces correct voltage at its own case but the battery does not see it, the fault is in the circuit between them.",
        options: [
          { id: "a", text: "Failed alternator", correct: false, reasoning: "The alternator measured 14.4 V at its own terminals — it is producing correctly." },
          { id: "b", text: "Defective new battery", correct: false, reasoning: "A weak battery would not cause a 1.42 V drop across the ground path." },
          { id: "c", text: "High-resistance ground path between alternator and battery", correct: true, reasoning: "A 1.42 V drop where spec is 0.2 V is the fault — the corroded ground strap is consuming charging voltage." },
          { id: "d", text: "Parasitic draw from an aftermarket accessory", correct: false, reasoning: "A parasitic draw discharges a parked vehicle; it does not lower running system voltage." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "Which test isolates this fault most directly?",
        principle: "Voltage drop testing measures resistance where it matters — under load, in the live circuit.",
        options: [
          { id: "a", text: "Voltage drop test each leg of the charging circuit under load", correct: true, reasoning: "Correct. It pinpoints exactly which conductor or connection is consuming voltage." },
          { id: "b", text: "Measure battery resistance with an ohmmeter", correct: false, reasoning: "Ohmmeters measure unloaded resistance and routinely miss high-resistance connections." },
          { id: "c", text: "Replace the alternator and retest", correct: false, reasoning: "Replacing a component that already tested good wastes the customer's money." },
          { id: "d", text: "Load test the battery only", correct: false, reasoning: "Useful baseline, but it cannot explain a charging circuit voltage drop." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What repair should be performed?",
        principle: "Restore the conductor, protect the connection, then re-measure the drop to prove the repair.",
        options: [
          { id: "a", text: "Replace the corroded ground strap, clean mating surfaces, re-measure voltage drop", correct: true, reasoning: "Correct. Verification means re-measuring below 0.2 V and confirming charging voltage near 14.2 V." },
          { id: "b", text: "Add a second battery", correct: false, reasoning: "Adding capacity does not fix a circuit that cannot deliver charging current." },
          { id: "c", text: "Replace the alternator and battery together", correct: false, reasoning: "Both tested serviceable. This is parts replacement, not repair." },
          { id: "d", text: "Clear the code and monitor", correct: false, reasoning: "The customer has already been stranded once. This is a safety-relevant no-start risk." },
        ],
      },
    ],
    rootCause: "Corroded, high-resistance alternator-to-body ground strap causing 1.42 V drop and low system voltage.",
    repair: "Replace ground strap, clean and protect mating surfaces, verify voltage drop under 0.2 V and charging voltage of roughly 14.2 V at 2000 rpm.",
    lesson:
      "Charging complaints are circuit problems as often as they are component problems. Always measure voltage drop on both the positive and ground legs under load before condemning an alternator. Available voltage at the battery is what matters, not what the alternator makes at its own case.",
  },
];

export const SCENARIOS: Scenario[] = [
  ...ENGINE_SCENARIOS,
  ...CHASSIS_SCENARIOS,
  ...SYSTEMS_SCENARIOS,
];

export const scenarioById = (id: string) => SCENARIOS.find((s) => s.id === id);
