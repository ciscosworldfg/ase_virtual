import type { Scenario } from "./types";

/** A5 Brakes, A6 Electrical/Electronic and A7 HVAC scenarios. */
export const SYSTEMS_SCENARIOS: Scenario[] = [
  /* ------------------------------------------------------------------ A5 */
  {
    id: "corolla-abs-light",
    title: "ABS Light On, Pedal Drops at Low Speed",
    vehicleId: "corolla-2015",
    category: "A5",
    difficulty: "Intermediate",
    estimatedMinutes: 13,
    customerName: "Angela Sowers",
    customerMood: "Nervous about safety",
    complaint:
      "The ABS light is on and sometimes when I'm almost stopped the brake pedal drops and buzzes like it's doing that anti-lock thing on dry pavement.",
    interview: [
      { q: "When did it begin?", a: "About two weeks ago. The light came on first, then the pedal thing started." },
      { q: "When exactly does the pedal drop?", a: "Coming to a stop, maybe under 10 mph, on perfectly dry road." },
      { q: "Does it stop normally otherwise?", a: "Yes, normal braking feels fine." },
      { q: "Any recent work?", a: "I had a wheel bearing replaced on the left front about a month ago." },
      { q: "Any noises?", a: "No grinding or squealing." },
      { q: "Other lights?", a: "The traction control light comes on with the ABS light." },
    ],
    failure: {
      id: "wss-signal-loss",
      name: "Left front wheel speed sensor signal dropout from a damaged tone ring",
      system: "Brakes",
      effects: {},
    },
    codes: [],
    freezeFrame: {},
    testDriveEvents: [
      { atSecond: 9, label: "Normal braking above 15 mph", detail: "Pedal firm, no pulsation" },
      { atSecond: 18, label: "False ABS activation", detail: "Pedal drops with motor buzz below 10 mph on dry pavement" },
      { atSecond: 26, label: "Lamp stays illuminated", detail: "ABS and traction lamps remain on for the rest of the drive" },
    ],
    audioProfile: {
      id: "abs-pump",
      label: "ABS pump cycling on dry pavement",
      description: "Rapid motor buzz with pedal pulsation at very low speed. Synthesized for training.",
      synthetic: true,
    },
    warningLights: ["ABS", "Traction control"],
    inspection: [
      {
        id: "front-brakes",
        system: "Brakes",
        label: "Front brake assemblies",
        findings: ["Pads 8 mm, even wear", "Rotor surfaces smooth", "Calipers slide freely"],
        measurement: "Rotor thickness 24.6 mm (discard 22.0 mm)",
        abnormal: false,
      },
      {
        id: "tone-ring",
        system: "Brakes",
        label: "Left front hub & tone ring",
        findings: ["Two teeth on the magnetic encoder ring show impact damage", "Sensor mounting face clean and seated", "Damage consistent with the recent bearing replacement"],
        abnormal: true,
      },
      {
        id: "fluid",
        system: "Brakes",
        label: "Brake fluid",
        findings: ["Level at MAX", "Fluid amber and clear"],
        measurement: "Moisture content 1.4 %",
        abnormal: false,
      },
      {
        id: "rear",
        system: "Brakes",
        label: "Rear brakes",
        findings: ["Shoes and drums within spec", "Parking brake adjusts correctly"],
        abnormal: false,
      },
    ],
    testPoints: [
      { id: "wss-lf", label: "LF wheel speed sensor supply → ground", location: "Brakes", dcVolts: 11.9, note: "Supply voltage correct" },
      { id: "wss-lf-sig", label: "LF wheel speed sensor signal", location: "Brakes", dcVolts: 1.4, note: "Signal drops out intermittently while the wheel is rotated by hand" },
      { id: "wss-rf-sig", label: "RF wheel speed sensor signal", location: "Brakes", dcVolts: 1.4, note: "Stable square-wave signal, no dropouts" },
    ],
    hideScanTool: true,
    tools: [
      {
        kind: "codes",
        id: "abs-codes",
        title: "ABS module scan",
        hint: "Chassis codes read from the ABS/EBCM — they do not appear in a generic powertrain scan",
        module: "ABS / EBCM",
        codes: [
          { code: "C0035", description: "Left Front Wheel Speed Sensor Circuit", status: "Current — 11 fail counts", freeze: "LF 0 mph while RF 9 mph, vehicle in motion" },
          { code: "C0031", description: "Left Front Wheel Speed Sensor Circuit Range/Performance", status: "History — 3 fail counts" },
        ],
      },
      {
        kind: "gauge",
        id: "wss-data",
        title: "Wheel speed comparison",
        hint: "Compare all four wheel speed PIDs during a slow roll — a healthy set tracks within 2 mph",
        sets: [
          {
            id: "roll",
            label: "Rolling at 8 mph",
            condition: "Dry pavement, steady low-speed roll",
            readings: [
              { label: "LF wheel speed", measured: "9 → 0 → 8 mph erratic", spec: "Within 2 mph of the others", abnormal: true, note: "A momentary drop to zero at low speed is exactly what makes the module think a wheel is locking." },
              { label: "RF wheel speed", measured: "8 mph steady", spec: "Within 2 mph", abnormal: false },
              { label: "LR wheel speed", measured: "8 mph steady", spec: "Within 2 mph", abnormal: false },
              { label: "RR wheel speed", measured: "8 mph steady", spec: "Within 2 mph", abnormal: false },
            ],
          },
        ],
      },
      {
        kind: "gauge",
        id: "brake-measure",
        title: "Brake measurement & fluid test",
        hint: "Micrometer, pad gauge and electronic brake fluid tester",
        sets: [
          {
            id: "friction",
            label: "Friction & rotors",
            readings: [
              { label: "LF pad thickness", measured: "8.1 mm", spec: "Min 3.0 mm", abnormal: false },
              { label: "RF pad thickness", measured: "8.0 mm", spec: "Min 3.0 mm", abnormal: false },
              { label: "Front rotor thickness", measured: "24.6 mm", spec: "Discard below 22.0 mm", abnormal: false },
              { label: "Rotor thickness variation", measured: "0.008 mm", spec: "Max 0.015 mm", abnormal: false },
              { label: "Lateral runout", measured: "0.03 mm", spec: "Max 0.05 mm", abnormal: false },
            ],
          },
          {
            id: "fluid",
            label: "Brake fluid",
            readings: [
              { label: "Moisture content", measured: "1.4 %", spec: "Below 3.0 %", abnormal: false },
              { label: "Boiling point", measured: "228 °C", spec: "Above 205 °C", abnormal: false, note: "Fluid is serviceable — this is not a fade or pedal-travel concern." },
            ],
          },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is causing the false ABS activation?",
        principle:
          "ABS acts on what the wheel speed sensors report. A sensor that momentarily reads zero looks identical to a locking wheel, so the module releases pressure.",
        options: [
          { id: "a", text: "Left front wheel speed signal dropout from a damaged tone ring", correct: true, reasoning: "The LF speed PID drops to zero while the other three stay steady, the C0035 code matches, and the encoder ring shows impact damage from the recent bearing job." },
          { id: "b", text: "Air in the brake hydraulic system", correct: false, reasoning: "The pedal is firm during normal braking and drops only when the ABS motor cycles. Air produces a spongy pedal all the time." },
          { id: "c", text: "Warped front rotors", correct: false, reasoning: "Thickness variation and runout both measure well within spec, and rotor problems cause pulsation under braking, not ABS lamps." },
          { id: "d", text: "Failed master cylinder", correct: false, reasoning: "A bypassing master cylinder causes a slowly sinking pedal at rest and sets no wheel speed codes." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "How do you confirm the sensor circuit before ordering parts?",
        principle: "Compare the suspect circuit against a known-good identical circuit under the same conditions.",
        options: [
          { id: "a", text: "Graph all four wheel speed PIDs while slowly rotating each wheel and watch for dropouts", correct: true, reasoning: "Correct. Side-by-side comparison shows exactly which wheel loses signal and at what point in rotation — which also distinguishes a bad sensor from a damaged ring." },
          { id: "b", text: "Replace the ABS module", correct: false, reasoning: "The module is reporting the fault accurately. Replacing it is expensive and would change nothing." },
          { id: "c", text: "Bleed the brakes", correct: false, reasoning: "There is no hydraulic symptom and bleeding does not affect wheel speed data." },
          { id: "d", text: "Machine the rotors", correct: false, reasoning: "Rotor measurements are in spec and unrelated to an ABS lamp." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "The signal drops out at the same two points of every wheel rotation. What repair is correct?",
        principle: "A defect that repeats at a fixed point in rotation is mechanical, not electrical.",
        options: [
          { id: "a", text: "Replace the left front hub assembly with its integrated tone ring, clear ABS codes, and verify all four wheel speeds track together on a road test", correct: true, reasoning: "Correct. Dropouts locked to the same rotational positions are the damaged teeth passing the sensor. On this vehicle the ring is part of the hub." },
          { id: "b", text: "Replace the wheel speed sensor only", correct: false, reasoning: "The sensor reads correctly except when the damaged teeth pass — the sensor is not the failed part." },
          { id: "c", text: "Clear the code and monitor", correct: false, reasoning: "This is a safety system that is falsely releasing brake pressure. It cannot be released unrepaired." },
          { id: "d", text: "Replace both front hubs", correct: false, reasoning: "The right front tracks perfectly. Replacing it is an unsupported upsell." },
        ],
      },
    ],
    rootCause:
      "Damaged magnetic encoder (tone) ring on the left front hub, causing wheel speed dropouts that the ABS module interprets as wheel lockup.",
    repair:
      "Replace the left front hub assembly, clear ABS codes, and verify all four wheel speed PIDs track within 2 mph on a road test with no false activation.",
    lesson:
      "ABS is only as good as its wheel speed data. When a customer reports ABS activation on dry pavement, compare all four wheel speed PIDs before touching hydraulics. Dropouts that repeat at the same rotational position mean a damaged tone ring; dropouts that vary randomly point to the sensor or its wiring.",
  },
  {
    id: "ram-brake-fade",
    title: "Long Pedal and Fade Down Grades",
    vehicleId: "ram1500-2016",
    category: "A5",
    difficulty: "Advanced",
    estimatedMinutes: 14,
    customerName: "Owen Pratt",
    customerMood: "Tows a trailer, safety focused",
    complaint:
      "Coming down the pass with the trailer, the pedal went almost to the floor and the truck barely slowed. After it cooled off it felt normal again.",
    interview: [
      { q: "When did it begin?", a: "First time was two trips ago. It's happened twice now, both times on long descents." },
      { q: "Does it happen in normal driving?", a: "No, around town it feels fine." },
      { q: "How long since the fluid was changed?", a: "Never, as far as I know. Truck has 131,000 miles." },
      { q: "Any leaks?", a: "No puddles anywhere." },
      { q: "Any warning lights?", a: "None." },
      { q: "Any noises?", a: "A hot smell after the descent, but no grinding." },
    ],
    failure: {
      id: "fluid-boil-fade",
      name: "Moisture-saturated brake fluid boiling under sustained heat, plus a seized right rear caliper slide",
      system: "Brakes",
      effects: {},
    },
    codes: [],
    freezeFrame: {},
    testDriveEvents: [
      { atSecond: 8, label: "Cold pedal normal", detail: "Firm pedal, 45 mm travel to full effort" },
      { atSecond: 20, label: "Heat buildup on repeated stops", detail: "Rotor temperatures climbing unevenly, right rear noticeably hotter" },
      { atSecond: 30, label: "Pedal travel increases", detail: "Travel grows to 78 mm after sustained braking, recovers when cool" },
    ],
    audioProfile: {
      id: "brake-heat",
      label: "Hot brake system",
      description: "Faint friction hiss with heat ticking after sustained braking. Synthesized for training.",
      synthetic: true,
    },
    warningLights: [],
    inspection: [
      {
        id: "rr-caliper",
        system: "Brakes",
        label: "Right rear caliper",
        findings: ["One slide pin seized in the bracket", "Inboard pad worn far more than outboard", "Bracket boots torn"],
        measurement: "RR inboard pad 3.2 mm, outboard 8.4 mm",
        abnormal: true,
      },
      {
        id: "fluid",
        system: "Brakes",
        label: "Brake fluid condition",
        findings: ["Fluid dark, level at MIN", "No external leaks anywhere in the system"],
        measurement: "Moisture 4.6 %",
        abnormal: true,
      },
      {
        id: "front",
        system: "Brakes",
        label: "Front brakes",
        findings: ["Pads 7 mm even", "Rotors within thickness spec", "Calipers slide freely"],
        abnormal: false,
      },
      {
        id: "lines",
        system: "Brakes",
        label: "Lines & hoses",
        findings: ["No swelling or chafing", "No restriction found on release test"],
        abnormal: false,
      },
    ],
    testPoints: [
      { id: "bat", label: "Battery positive → negative", location: "Battery", dcVolts: 12.6, runningDcVolts: 14.2 },
      { id: "brake-switch", label: "Brake switch output → ground", location: "Brakes", dcVolts: 12.4, note: "Switch operates correctly" },
    ],
    hideScanTool: true,
    tools: [
      {
        kind: "gauge",
        id: "fluid-test",
        title: "Brake fluid boiling point test",
        hint: "Electronic tester at the master cylinder plus a boil test on a drawn sample",
        sets: [
          {
            id: "fluid",
            label: "Fluid analysis",
            readings: [
              { label: "Moisture content", measured: "4.6 %", spec: "Below 3.0 %", abnormal: true, note: "Brake fluid is hygroscopic. Above 3 % the wet boiling point falls far enough to vaporize during sustained braking." },
              { label: "Wet boiling point", measured: "162 °C", spec: "Above 205 °C", abnormal: true },
              { label: "Copper content", measured: "212 ppm", spec: "Below 200 ppm", abnormal: true, note: "High copper indicates corrosion inhibitors are depleted." },
            ],
          },
        ],
      },
      {
        kind: "gauge",
        id: "pedal-thermal",
        title: "Pedal travel & rotor temperature",
        hint: "Pedal travel gauge plus infrared thermometer at each rotor after a controlled descent",
        sets: [
          {
            id: "cold",
            label: "Cold system",
            readings: [
              { label: "Pedal travel to full effort", measured: "45 mm", spec: "40–55 mm", abnormal: false },
              { label: "LF rotor temp", measured: "38 °C", spec: "Within 30 °C side to side", abnormal: false },
              { label: "RR rotor temp", measured: "41 °C", spec: "Within 30 °C side to side", abnormal: false },
            ],
          },
          {
            id: "hot",
            label: "After sustained braking",
            condition: "Ten controlled stops from 45 mph",
            readings: [
              { label: "Pedal travel to full effort", measured: "78 mm", spec: "40–55 mm", abnormal: true, note: "Travel that grows with heat and recovers when cool is vapor in the fluid, not a mechanical fault." },
              { label: "LR rotor temp", measured: "184 °C", spec: "Within 30 °C side to side", abnormal: false },
              { label: "RR rotor temp", measured: "312 °C", spec: "Within 30 °C side to side", abnormal: true, note: "A dragging caliper adds heat the system was never designed to shed." },
            ],
          },
        ],
      },
      {
        kind: "fluid",
        id: "fluid-visual",
        title: "Brake fluid visual comparison",
        hint: "Compare a reservoir sample against new DOT 3 fluid",
        samples: [
          {
            id: "in-service",
            label: "Reservoir sample",
            color: "#4d3512",
            condition: "Dark brown, slightly cloudy, fine dark sediment",
            smell: "Sharp, chemically degraded",
            verdict: "Saturated and contaminated fluid — the direct cause of a heat-dependent long pedal.",
            abnormal: true,
          },
          {
            id: "new",
            label: "New DOT 3",
            color: "#e0cf8a",
            condition: "Pale straw, clear",
            smell: "Neutral",
            verdict: "Reference sample.",
            abnormal: false,
          },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "Why does the pedal go long only during long descents?",
        principle:
          "A symptom that appears with heat and disappears when cool is a thermal property problem — most often fluid vaporization.",
        options: [
          { id: "a", text: "Moisture-saturated fluid boiling under heat, worsened by a seized rear caliper slide adding excess heat", correct: true, reasoning: "4.6 % moisture drops the boiling point to 162 °C while the dragging right rear reaches 312 °C. Vapor compresses; fluid does not — that is the long pedal that recovers when cool." },
          { id: "b", text: "Failed brake booster", correct: false, reasoning: "A booster failure makes the pedal hard and high effort, and it does not come and go with temperature." },
          { id: "c", text: "Worn front pads", correct: false, reasoning: "Front pads measure 7 mm with even wear and pad thickness does not change pedal travel this way." },
          { id: "d", text: "Master cylinder internal bypass", correct: false, reasoning: "A bypassing master cylinder sinks the pedal under steady pressure regardless of temperature." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "What confirms the diagnosis?",
        principle: "Measure the property in question directly rather than inferring it.",
        options: [
          { id: "a", text: "Test the fluid's moisture content and boiling point, then compare rotor temperatures side to side after a controlled descent", correct: true, reasoning: "Correct. One test proves the fluid can boil at the temperatures reached; the other proves why the system is reaching them." },
          { id: "b", text: "Replace the master cylinder", correct: false, reasoning: "Nothing in the evidence implicates the master cylinder, and the symptom is temperature dependent." },
          { id: "c", text: "Adjust the parking brake", correct: false, reasoning: "It does not affect service brake pedal travel and would not explain the heat pattern." },
          { id: "d", text: "Road test without the trailer", correct: false, reasoning: "Removing the load makes the symptom less likely to appear, which hides the fault instead of confirming it." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What repair addresses both findings?",
        principle: "Correct every contributor. Fresh fluid in a system that still overheats will degrade again quickly.",
        options: [
          { id: "a", text: "Service or replace the right rear caliper and hardware, replace the rear pads, then completely flush the system with fresh specified fluid and verify boiling point and pedal travel hot", correct: true, reasoning: "Correct. Repair the heat source, then replace the degraded fluid, then verify by measuring the same values hot that failed before." },
          { id: "b", text: "Flush the brake fluid only", correct: false, reasoning: "New fluid in a system with a dragging caliper will be cooked again within a few trips." },
          { id: "c", text: "Install larger rotors", correct: false, reasoning: "Modifying the system does not address contaminated fluid or a seized slide pin." },
          { id: "d", text: "Top off the reservoir and advise the customer to downshift", correct: false, reasoning: "Advising around a safety defect instead of repairing it is not an acceptable outcome." },
        ],
      },
    ],
    rootCause:
      "Brake fluid saturated to 4.6 % moisture boiling under sustained braking heat, aggravated by a seized right rear caliper slide pin generating excess heat.",
    repair:
      "Service the right rear caliper and hardware, replace rear pads, flush the entire system with fresh specified fluid, then verify boiling point, even rotor temperatures and hot pedal travel.",
    lesson:
      "Brake fade that appears with heat and clears when cool is fluid vaporization until proven otherwise. Moisture content above 3 % is enough to cause it under load. Measure fluid condition on any high-mileage vehicle with a heat-related pedal complaint, and always look for the component adding the extra heat.",
  },

  /* ------------------------------------------------------------------ A6 */
  {
    id: "cruze-parasitic-draw",
    title: "Dead Battery Every Few Days",
    vehicleId: "cruze-2016",
    category: "A6",
    difficulty: "Advanced",
    estimatedMinutes: 15,
    customerName: "Sheila Mott",
    customerMood: "Out of patience, second shop",
    complaint:
      "If I don't drive it for two or three days it won't start. The last shop put in a new battery and it did it again.",
    interview: [
      { q: "When did it begin?", a: "About two months ago, right after I had an aftermarket remote start put in." },
      { q: "How long does it take to go dead?", a: "Two to three days sitting." },
      { q: "Does it crank slowly or not at all?", a: "Just clicks. Totally dead." },
      { q: "What has been replaced?", a: "A new battery and they said the alternator tested fine." },
      { q: "Any electrical oddities?", a: "Sometimes the dash lights flicker when I first unlock it." },
      { q: "Any warning lights while driving?", a: "None while I'm driving." },
    ],
    failure: {
      id: "parasitic-draw-module",
      name: "Body control module kept awake by an aftermarket remote start circuit",
      system: "Electrical",
      effects: { chargingVoltage: 14.3 },
    },
    codes: [],
    freezeFrame: {},
    testDriveEvents: [
      { atSecond: 10, label: "Charging system normal", detail: "System voltage steady at 14.3 V under load" },
      { atSecond: 20, label: "No dimming under accessory load", detail: "Headlights and blower do not pull voltage down" },
      { atSecond: 28, label: "No driveability symptoms", detail: "Complaint is present only at rest" },
    ],
    audioProfile: {
      id: "electrical-quiet",
      label: "Normal running vehicle",
      description: "No abnormal sounds; this fault is only measurable electrically. Synthesized for training.",
      synthetic: true,
    },
    warningLights: [],
    inspection: [
      {
        id: "battery",
        system: "Electrical",
        label: "Battery & terminals",
        findings: ["Battery three months old", "Terminals clean and tight", "Case in good condition"],
        measurement: "Load test: passes, 610 CCA of 600 rated",
        abnormal: false,
      },
      {
        id: "aftermarket",
        system: "Electrical",
        label: "Aftermarket wiring",
        findings: ["Remote start module tapped into the ignition harness behind the dash", "T-taps used, one connection loose", "Module has no ground isolation relay"],
        abnormal: true,
      },
      {
        id: "charging",
        system: "Electrical",
        label: "Charging system",
        findings: ["Belt correct tension", "Alternator output steady", "Diode ripple within limits"],
        measurement: "14.3 V at 2000 rpm, AC ripple 0.03 V",
        abnormal: false,
      },
      {
        id: "grounds",
        system: "Electrical",
        label: "Chassis grounds",
        findings: ["Main engine ground clean", "Body grounds tight, no corrosion"],
        abnormal: false,
      },
    ],
    testPoints: [
      { id: "bat-rest", label: "Battery voltage after 3 days rest", location: "Battery", dcVolts: 9.8, note: "Discharged well below the 12.4 V minimum" },
      { id: "draw-total", label: "Total current draw, modules asleep", location: "Battery", dcVolts: 0, note: "Measured with a clamp meter: 385 mA (spec below 50 mA)" },
      { id: "bcm-feed", label: "BCM battery feed → ground", location: "Body", dcVolts: 12.4, runningDcVolts: 14.3 },
      { id: "starter-vd", label: "Voltage drop, battery positive to starter during crank", location: "Starting", dcVolts: 0.28, note: "Within the 0.5 V limit — cables are good" },
    ],
    tools: [
      {
        kind: "gauge",
        id: "parasitic",
        title: "Parasitic draw test",
        hint: "Low-current clamp on the negative cable; let every module time out before reading, then pull fuses one at a time",
        sets: [
          {
            id: "initial",
            label: "Initial draw",
            condition: "5 minutes after doors closed and locked",
            readings: [
              { label: "Total draw", measured: "1.42 A", spec: "Modules still awake — no conclusion yet", abnormal: false, note: "Reading this early is the most common parasitic-draw mistake. Modules must be allowed to time out." },
            ],
          },
          {
            id: "settled",
            label: "After 45 minute timeout",
            condition: "All modules asleep, hood switch defeated",
            readings: [
              { label: "Total draw", measured: "385 mA", spec: "Below 50 mA", abnormal: true },
              { label: "Predicted days to no-start", measured: "2.4 days", spec: "—", abnormal: true, note: "Matches the customer's description precisely, which confirms you are chasing the right fault." },
            ],
          },
          {
            id: "fuse-pull",
            label: "Fuse isolation",
            condition: "Pulling fuses one at a time while watching the clamp",
            readings: [
              { label: "IP fuse 22 — BCM", measured: "Draw drops to 41 mA", spec: "Below 50 mA", abnormal: true, note: "The BCM circuit owns essentially all of the excess draw." },
              { label: "Radio fuse", measured: "No change", spec: "—", abnormal: false },
              { label: "Trailer fuse", measured: "No change", spec: "—", abnormal: false },
            ],
          },
        ],
      },
      {
        kind: "gauge",
        id: "voltage-drop",
        title: "Voltage drop testing",
        hint: "Measure across each connection while the circuit carries current — resistance only shows up under load",
        sets: [
          {
            id: "drops",
            label: "Charging & starting circuits",
            readings: [
              { label: "Alternator B+ to battery positive", measured: "0.11 V", spec: "Max 0.20 V", abnormal: false },
              { label: "Alternator case to battery negative", measured: "0.06 V", spec: "Max 0.20 V", abnormal: false },
              { label: "Battery positive to starter, cranking", measured: "0.28 V", spec: "Max 0.50 V", abnormal: false },
              { label: "Engine block to battery negative, cranking", measured: "0.09 V", spec: "Max 0.20 V", abnormal: false, note: "Every drop is in spec — the charging and starting circuits are not the problem." },
            ],
          },
        ],
      },
      {
        kind: "network",
        id: "network-scan",
        title: "Module communication scan",
        hint: "Full network scan with the vehicle at rest, looking for modules that never enter sleep mode",
        busNote:
          "Bus activity continues indefinitely after the key is removed. A module that keeps transmitting keeps every other module awake — which is why total draw stays high.",
        modules: [
          { name: "ECM", address: "0x7E0", status: "ok", note: "Enters sleep after 12 minutes as designed" },
          { name: "TCM", address: "0x7E1", status: "ok", note: "Sleeps normally" },
          { name: "BCM", address: "0x241", status: "intermittent", note: "Continues transmitting wake messages indefinitely with the key out" },
          { name: "Instrument cluster", address: "0x243", status: "ok", note: "Sleeps once bus traffic stops" },
          { name: "ABS", address: "0x28", status: "ok", note: "Sleeps normally" },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is causing the repeated dead battery?",
        principle:
          "A parasitic draw diagnosis is a subtraction problem: measure total draw with everything asleep, then remove circuits until the number falls.",
        options: [
          { id: "a", text: "Excessive parasitic draw on the BCM circuit, kept awake by the aftermarket remote start installation", correct: true, reasoning: "385 mA against a 50 mA limit, the draw collapses when the BCM fuse is pulled, the BCM never sleeps on the bus, and the symptom began right after the aftermarket install." },
          { id: "b", text: "Defective battery", correct: false, reasoning: "The battery is three months old and passes a load test at above its rated CCA." },
          { id: "c", text: "Failing alternator", correct: false, reasoning: "Output is 14.3 V with low ripple and every charging voltage drop is in spec. An alternator problem also would not discharge a parked vehicle here." },
          { id: "d", text: "Corroded engine ground", correct: false, reasoning: "Ground voltage drop measures 0.09 V under cranking load, well within limits." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "The BCM fuse pull drops the draw. What is the correct next step?",
        principle: "Isolating the circuit is not the same as identifying the component. Separate the factory circuit from anything added to it.",
        options: [
          { id: "a", text: "Disconnect the aftermarket remote start harness and re-measure the draw on the same circuit", correct: true, reasoning: "Correct. This distinguishes a genuinely failed BCM from a BCM being held awake by an added device — a difference of about a thousand dollars to the customer." },
          { id: "b", text: "Replace the BCM", correct: false, reasoning: "The BCM shares its circuit with the aftermarket install. Condemning it without isolating the add-on risks replacing a good module." },
          { id: "c", text: "Install a battery disconnect switch", correct: false, reasoning: "That is a workaround that leaves the fault in place and inconveniences the customer daily." },
          { id: "d", text: "Install a larger battery", correct: false, reasoning: "A larger battery only delays the failure; the draw remains." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "With the remote start unplugged, the draw falls to 28 mA. What repair should be performed?",
        principle: "Correct the added fault and verify against the specification, not against the customer's impression.",
        options: [
          { id: "a", text: "Correct or remove the aftermarket remote start wiring with proper connections and isolation, then verify draw below 50 mA after a full module timeout", correct: true, reasoning: "Correct. 28 mA with the device removed proves the factory system is healthy. Repair the installation properly, then re-verify with the clamp meter after modules sleep." },
          { id: "b", text: "Replace the BCM and the battery", correct: false, reasoning: "Both are proven good. This is exactly the guesswork that caused the customer to lose faith in the first shop." },
          { id: "c", text: "Clean and re-torque all grounds", correct: false, reasoning: "Good practice, but every ground already tested in spec and grounds do not cause a parasitic draw." },
          { id: "d", text: "Return the vehicle and advise driving it more often", correct: false, reasoning: "That is not a repair — the fault and the customer's complaint both remain." },
        ],
      },
    ],
    rootCause:
      "Improperly installed aftermarket remote start holding the BCM circuit awake, producing a 385 mA parasitic draw that discharges the battery in about two days.",
    repair:
      "Repair or remove the aftermarket remote start wiring with soldered, isolated connections, then verify parasitic draw below 50 mA after all modules time out.",
    lesson:
      "Parasitic draw testing has a strict order: let the modules sleep, measure total draw with a low-current clamp, then subtract circuits by pulling fuses. Never read the meter in the first few minutes — every module is still awake and the number is meaningless. And when a circuit shared with an aftermarket device is implicated, isolate the add-on before condemning a factory module.",
  },
  {
    id: "escape-module-comm",
    title: "Multiple Warning Lights and No Communication",
    vehicleId: "escape-2019",
    category: "A6",
    difficulty: "Master",
    estimatedMinutes: 16,
    customerName: "Derek Nolan",
    customerMood: "Overwhelmed by the dash",
    complaint:
      "Half the dash lit up at once — ABS, traction, power steering, everything. It drives, but the shop said their scanner couldn't talk to it.",
    interview: [
      { q: "When did it begin?", a: "All at once, on a rainy morning about a week ago." },
      { q: "Does it come and go?", a: "It cleared once after a couple of days of dry weather, then came back." },
      { q: "Any recent work or damage?", a: "It went through a deep puddle around the time it started." },
      { q: "How does it drive?", a: "It drives, but the steering feels heavier and the speedometer sometimes reads zero." },
      { q: "Any smell or noise?", a: "No." },
      { q: "Has anyone scanned it?", a: "They tried. They said no communication with several modules." },
    ],
    failure: {
      id: "can-bus-corrosion",
      name: "Water intrusion corroding a CAN bus connector, taking down the high-speed segment",
      system: "Electrical",
      effects: {},
    },
    codes: [],
    freezeFrame: {},
    testDriveEvents: [
      { atSecond: 8, label: "Multiple lamps illuminated", detail: "ABS, traction, EPS and cluster warnings all active" },
      { atSecond: 16, label: "Speedometer dropout", detail: "Speedometer intermittently falls to zero while moving" },
      { atSecond: 26, label: "Symptoms worsen over bumps", detail: "Warnings flicker when the vehicle is disturbed, suggesting a physical connection fault" },
    ],
    audioProfile: {
      id: "electrical-quiet-2",
      label: "Normal running vehicle",
      description: "No abnormal mechanical sounds; the fault is electrical only. Synthesized for training.",
      synthetic: true,
    },
    warningLights: ["ABS", "Traction control", "EPS", "Cluster warning"],
    inspection: [
      {
        id: "connector",
        system: "Electrical",
        label: "Underbody harness connector",
        findings: ["Green corrosion on two terminals", "Seal displaced, water inside the connector shell", "Terminals loose in the cavity"],
        abnormal: true,
      },
      {
        id: "battery",
        system: "Electrical",
        label: "Battery & charging",
        findings: ["Battery good", "Charging steady", "Terminals clean"],
        measurement: "12.6 V rest / 14.2 V running",
        abnormal: false,
      },
      {
        id: "grounds",
        system: "Electrical",
        label: "Grounds",
        findings: ["Body grounds tight", "Voltage drops in spec"],
        abnormal: false,
      },
      {
        id: "fuses",
        system: "Electrical",
        label: "Fuses & relays",
        findings: ["No open fuses", "Module power feeds present at every module"],
        abnormal: false,
      },
    ],
    testPoints: [
      { id: "can-h", label: "CAN High → ground (key on)", location: "Network", dcVolts: 4.4, note: "Should rest near 2.6 V — pulled high, consistent with a short or corrosion" },
      { id: "can-l", label: "CAN Low → ground (key on)", location: "Network", dcVolts: 0.3, note: "Should rest near 2.4 V" },
      { id: "can-term", label: "CAN High → CAN Low resistance (battery disconnected)", location: "Network", ohms: 118, note: "Spec 60 Ω with two 120 Ω terminating resistors in parallel — reading 118 Ω means only one resistor is in the circuit" },
      { id: "abs-feed", label: "ABS module power feed → ground", location: "Brakes", dcVolts: 12.5, note: "Power is present; the module simply cannot talk" },
    ],
    tools: [
      {
        kind: "network",
        id: "bus-scan",
        title: "Network topology scan",
        hint: "Scan every module and map which ones respond — the pattern of failures locates the break",
        busNote:
          "The modules that dropped off all sit downstream of the same underbody connector. When several unrelated modules fail together but their power and grounds are good, suspect the network, not the modules.",
        modules: [
          { name: "PCM", address: "0x7E0", status: "ok", note: "Responds normally — upstream of the fault" },
          { name: "Instrument cluster", address: "0x720", status: "ok", note: "Responds, but reports missing data from other modules" },
          { name: "ABS", address: "0x760", status: "no-response", note: "Power and ground verified good at the module" },
          { name: "EPS", address: "0x730", status: "no-response", note: "Power and ground verified good at the module" },
          { name: "Restraints (RCM)", address: "0x737", status: "intermittent", note: "Responds only when the harness is undisturbed" },
        ],
      },
      {
        kind: "gauge",
        id: "bus-electrical",
        title: "CAN bus electrical test",
        hint: "Resistance across the bus with power removed, then rest voltages with the key on",
        sets: [
          {
            id: "resistance",
            label: "Terminating resistance",
            condition: "Battery disconnected, measured at the DLC",
            readings: [
              { label: "CAN High to CAN Low", measured: "118 Ω", spec: "60 Ω (two 120 Ω resistors in parallel)", abnormal: true, note: "Only one terminating resistor is present — the bus is physically split." },
              { label: "CAN High to ground", measured: "2.4 kΩ", spec: "Above 1 kΩ", abnormal: false },
            ],
          },
          {
            id: "voltage",
            label: "Rest voltages",
            condition: "Key on, engine off",
            readings: [
              { label: "CAN High at rest", measured: "4.4 V", spec: "2.5–2.7 V", abnormal: true },
              { label: "CAN Low at rest", measured: "0.3 V", spec: "2.3–2.5 V", abnormal: true, note: "Both lines out of range in opposite directions is the signature of a corrupted or shorted segment." },
            ],
          },
        ],
      },
      {
        kind: "codes",
        id: "u-codes",
        title: "Stored network codes",
        hint: "U-codes describe who cannot hear whom — read them as a map, not a parts list",
        module: "PCM and cluster (the modules still responding)",
        codes: [
          { code: "U0121", description: "Lost Communication With ABS Control Module", status: "Current" },
          { code: "U0131", description: "Lost Communication With Power Steering Control Module", status: "Current" },
          { code: "U0151", description: "Lost Communication With Restraints Control Module", status: "Intermittent" },
          { code: "U0100", description: "Lost Communication With ECM/PCM", status: "History — set while the bus was fully down" },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "Several modules do not respond but all have power and ground. What is the root cause?",
        principle:
          "When multiple unrelated modules fail simultaneously, look for what they share — a network segment, a shared feed, or a shared ground — not for multiple failed modules.",
        options: [
          { id: "a", text: "Corroded CAN bus connector from water intrusion, splitting the high-speed segment", correct: true, reasoning: "118 Ω instead of 60 Ω proves one terminating resistor is isolated, the failed modules all sit past the same underbody connector, the connector is full of water and corrosion, and symptoms track weather and vibration." },
          { id: "b", text: "Three failed modules", correct: false, reasoning: "Three unrelated modules failing on the same rainy morning is not a realistic coincidence, and every one has verified power and ground." },
          { id: "c", text: "Failed PCM", correct: false, reasoning: "The PCM is one of the modules still communicating normally." },
          { id: "d", text: "Discharged battery", correct: false, reasoning: "Battery and charging both test good, and low voltage would not change bus terminating resistance." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "What test pinpoints the location of the break?",
        principle: "Bus terminating resistance measured at different points splits the network in half repeatedly until the fault is bracketed.",
        options: [
          { id: "a", text: "Measure CAN High to CAN Low resistance at successive connectors to isolate which segment lost its terminating resistor", correct: true, reasoning: "Correct. 60 Ω on one side and 120 Ω on the other brackets the break to the connector between them — a fast, decisive divide-and-conquer test." },
          { id: "b", text: "Replace the ABS module first since it holds the most codes", correct: false, reasoning: "Code count does not indicate the failed part. The ABS module cannot talk because the wire is broken." },
          { id: "c", text: "Reflash all modules", correct: false, reasoning: "You cannot reflash a module you cannot communicate with, and this is a physical wiring fault." },
          { id: "d", text: "Clear all U-codes and road test", correct: false, reasoning: "Clearing the codes deletes the map you are using to locate the fault." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "The corroded underbody connector is the break. What repair is correct?",
        principle: "Repair the connection to factory standard and seal out the cause, then verify the bus electrically and with a full network scan.",
        options: [
          { id: "a", text: "Repair the harness with new sealed terminals and proper connector seals, verify 60 Ω across the bus, then confirm every module responds on a full network scan", correct: true, reasoning: "Correct. Restoring the seal prevents the recurrence, and verification means both the correct terminating resistance and every module answering." },
          { id: "b", text: "Apply dielectric grease to the corroded terminals and reassemble", correct: false, reasoning: "Grease over corroded terminals does not restore conductivity and the fault returns with the next wet week." },
          { id: "c", text: "Replace the ABS and EPS modules", correct: false, reasoning: "Both modules are functional. The fault is between them and the rest of the network." },
          { id: "d", text: "Splice the CAN wires together with T-taps", correct: false, reasoning: "Twisted-pair CAN wiring requires proper repair technique; T-taps introduce reflections and unsealed points of future corrosion." },
        ],
      },
    ],
    rootCause:
      "Water intrusion corroded an underbody CAN bus connector, splitting the high-speed network and isolating the ABS, EPS and restraints modules along with one terminating resistor.",
    repair:
      "Repair the harness connector with sealed terminals, restore weather sealing, verify 60 Ω bus terminating resistance and confirm full module communication on a network scan.",
    lesson:
      "U-codes are a map of who cannot hear whom, not a list of parts to replace. When several modules drop off at once and each has good power and ground, measure bus terminating resistance: 60 Ω is healthy, 120 Ω means a segment is isolated, and 40 Ω means an extra resistor or module is loading the bus. Then divide the network in half at each connector until the break is bracketed.",
  },

  /* ------------------------------------------------------------------ A7 */
  {
    id: "sonata-ac-warm",
    title: "A/C Blows Warm at Idle",
    vehicleId: "sonata-2016",
    category: "A7",
    difficulty: "Intermediate",
    estimatedMinutes: 13,
    customerName: "Rosa Delgado",
    customerMood: "Uncomfortable in summer traffic",
    complaint:
      "The air conditioning is cold on the highway but as soon as I'm stuck in traffic it turns warm. Then it cools again once I get moving.",
    interview: [
      { q: "When did it begin?", a: "This summer. Last year it worked fine." },
      { q: "Is it always warm?", a: "No — that's the strange part. It's cold when I'm driving faster." },
      { q: "Any recent work?", a: "A shop added refrigerant last month. It helped for a week." },
      { q: "Any noises?", a: "The compressor clicks on and off a lot when I'm sitting still." },
      { q: "Any warning lights?", a: "No lights." },
      { q: "Does the engine ever run hot?", a: "The temperature gauge creeps up a bit in traffic too." },
    ],
    failure: {
      id: "ac-overcharge-fan",
      name: "System overcharged with refrigerant plus a failed condenser fan, causing high-side pressure cutout at idle",
      system: "HVAC",
      effects: { coolantOffset: 6 },
    },
    codes: [],
    freezeFrame: {},
    testDriveEvents: [
      { atSecond: 8, label: "Cold at road speed", detail: "Vent temperature 6 °C with ram air over the condenser" },
      { atSecond: 18, label: "Warm at idle", detail: "Vent temperature climbs to 22 °C after 90 seconds at a standstill" },
      { atSecond: 27, label: "Compressor short cycling", detail: "Clutch cycles every 4 seconds on high-side pressure" },
    ],
    audioProfile: {
      id: "ac-cycle",
      label: "Compressor short cycling",
      description: "Repeated clutch engagement clicks at short intervals while stationary. Synthesized for training.",
      synthetic: true,
    },
    warningLights: [],
    inspection: [
      {
        id: "condenser",
        system: "HVAC",
        label: "Condenser & cooling fan",
        findings: ["Condenser fins clean and unobstructed", "Condenser fan does not spin with A/C requested", "Fan spins freely by hand"],
        abnormal: true,
      },
      {
        id: "compressor",
        system: "HVAC",
        label: "Compressor & clutch",
        findings: ["Clutch engages and disengages", "No oil residue at the shaft seal", "Belt correct tension"],
        abnormal: false,
      },
      {
        id: "cabin-filter",
        system: "HVAC",
        label: "Cabin air filter & blower",
        findings: ["Filter clean", "Blower delivers full airflow on all speeds"],
        abnormal: false,
      },
      {
        id: "cooling",
        system: "Cooling",
        label: "Engine cooling system",
        findings: ["Coolant level correct", "Radiator fan operates on engine temperature", "No leaks"],
        abnormal: false,
      },
    ],
    testPoints: [
      { id: "fan-feed", label: "Condenser fan feed → ground (A/C on)", location: "HVAC", dcVolts: 12.4, note: "Voltage present at the fan connector — supply side is good" },
      { id: "fan-gnd", label: "Condenser fan ground → battery negative", location: "Grounds", dcVolts: 0.03, continuity: true },
      { id: "fan-motor", label: "Condenser fan motor windings", location: "HVAC", ohms: "OL", note: "Open winding — the motor has failed internally" },
      { id: "pressure-switch", label: "A/C pressure switch signal → ground", location: "HVAC", dcVolts: 2.8, note: "Switch responds correctly to pressure changes" },
    ],
    hideScanTool: true,
    tools: [
      {
        kind: "gauge",
        id: "manifold",
        title: "Refrigerant manifold gauge set",
        hint: "High and low side pressures with ambient temperature recorded — pressures are meaningless without ambient",
        sets: [
          {
            id: "idle",
            label: "Idle, doors open, max A/C",
            condition: "Ambient 32 °C, blower on high",
            readings: [
              { label: "Low side pressure", measured: "68 psi", spec: "35–45 psi", abnormal: true },
              { label: "High side pressure", measured: "395 psi", spec: "220–270 psi", abnormal: true, note: "Both sides high means the system cannot reject heat — overcharge, condenser airflow loss, or both." },
              { label: "Vent temperature", measured: "22 °C", spec: "4–10 °C", abnormal: true },
              { label: "Compressor cycle rate", measured: "Every 4 s on high-pressure cutout", spec: "Continuous or long cycles", abnormal: true },
            ],
          },
          {
            id: "cruise",
            label: "2000 rpm with ram air",
            condition: "Ambient 32 °C, airflow across the condenser",
            readings: [
              { label: "Low side pressure", measured: "44 psi", spec: "35–45 psi", abnormal: false },
              { label: "High side pressure", measured: "281 psi", spec: "220–270 psi", abnormal: true, note: "Still high even with airflow — that residual excess is the overcharge, separate from the fan failure." },
              { label: "Vent temperature", measured: "6 °C", spec: "4–10 °C", abnormal: false },
            ],
          },
        ],
      },
      {
        kind: "actuator",
        id: "hvac-actuators",
        title: "HVAC actuator & relay tests",
        hint: "Bidirectional commands to the climate module while watching the physical response",
        actuators: [
          {
            id: "cond-fan",
            name: "Condenser fan relay",
            command: "Command fan on, high speed",
            expected: "Fan runs at high speed, current draw 8–12 A",
            actual: "Relay clicks, 12.4 V present at the motor, motor does not turn, 0 A draw",
            abnormal: true,
          },
          {
            id: "compressor-clutch",
            name: "Compressor clutch",
            command: "Command clutch engage",
            expected: "Clutch engages and holds",
            actual: "Clutch engages, then drops out on high-side pressure",
            abnormal: false,
          },
          {
            id: "blend-door",
            name: "Blend door actuator",
            command: "Sweep full cold to full hot",
            expected: "Position feedback sweeps 0–100 %, vent temperature follows",
            actual: "Feedback sweeps 0–100 % smoothly, temperature tracks command",
            abnormal: false,
          },
          {
            id: "mode-door",
            name: "Mode door actuator",
            command: "Cycle vent / bi-level / floor / defrost",
            expected: "Airflow moves to each outlet as commanded",
            actual: "All modes correct",
            abnormal: false,
          },
        ],
      },
      {
        kind: "gauge",
        id: "charge-check",
        title: "Recovery & charge weight",
        hint: "Recover the charge into a scale-equipped machine and compare against the underhood label",
        sets: [
          {
            id: "recovered",
            label: "Recovered charge",
            readings: [
              { label: "Recovered refrigerant weight", measured: "820 g", spec: "600 g ±25 g per underhood label", abnormal: true, note: "Overcharged by roughly 37 % — consistent with an unmeasured top-off." },
              { label: "Non-condensable gas content", measured: "1.8 %", spec: "Below 2 %", abnormal: false },
              { label: "Refrigerant identification", measured: "R-134a, 98.2 % pure", spec: "R-134a", abnormal: false },
            ],
          },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "Why does the system cool at speed but not at idle?",
        principle:
          "The condenser rejects heat using airflow. At road speed ram air supplies it; at idle only the fan does. A symptom that appears exactly when the fan is the only airflow source implicates the fan.",
        options: [
          { id: "a", text: "Failed condenser fan motor combined with an overcharged system", correct: true, reasoning: "The fan motor is open-circuit with power and ground present, and recovery shows 820 g against a 600 g specification. High pressure on both sides at idle and a residual high side at speed match both faults." },
          { id: "b", text: "Low refrigerant charge", correct: false, reasoning: "Both gauge readings are high, not low, and recovery weighed 37 % more refrigerant than specified." },
          { id: "c", text: "Failed blend door actuator", correct: false, reasoning: "The blend door sweeps correctly and vent temperature follows the command in the actuator test." },
          { id: "d", text: "Failed compressor", correct: false, reasoning: "The compressor builds excessive pressure, which proves it is pumping. It cycles off on high pressure to protect itself." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "What is the correct way to verify the refrigerant charge?",
        principle: "Charge is a weight, not a pressure. Pressures only suggest; the scale proves.",
        options: [
          { id: "a", text: "Recover the entire charge into a machine with a scale and compare the weight against the underhood label", correct: true, reasoning: "Correct. It is the only accurate method, and it also reveals contamination and non-condensable gases at the same time." },
          { id: "b", text: "Add refrigerant until the low side reads 40 psi", correct: false, reasoning: "Charging to pressure on an already overcharged system makes the problem worse and is not an accepted procedure." },
          { id: "c", text: "Judge by sight glass clarity", correct: false, reasoning: "Most modern systems have no sight glass, and clarity cannot distinguish correct charge from overcharge." },
          { id: "d", text: "Feel the temperature of the lines by hand", correct: false, reasoning: "A rough indicator at best and no substitute for a measured weight." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What repair addresses the complaint completely?",
        principle: "Fix every contributor and verify with the same measurements that identified the fault.",
        options: [
          { id: "a", text: "Replace the condenser fan motor, evacuate the system and recharge to the specified weight, then verify pressures and vent temperature at idle and at 2000 rpm", correct: true, reasoning: "Correct. Both faults contributed to the high-side pressure, and verification must include the idle condition where the customer's complaint occurs." },
          { id: "b", text: "Recover the excess refrigerant only", correct: false, reasoning: "Without the fan, the condenser still cannot reject heat at idle and the complaint returns on the first hot day in traffic." },
          { id: "c", text: "Replace the compressor and the fan", correct: false, reasoning: "The compressor is proven functional by the excessive pressure it develops." },
          { id: "d", text: "Replace the fan motor only", correct: false, reasoning: "The remaining overcharge keeps the high side above specification even with good airflow, shortening compressor life." },
        ],
      },
    ],
    rootCause:
      "Open-circuit condenser fan motor removing the only source of condenser airflow at idle, combined with a 37 % refrigerant overcharge from an unmeasured top-off.",
    repair:
      "Replace the condenser fan motor, recover and evacuate the system, recharge to the labeled weight, and verify high/low side pressures and vent temperature at both idle and 2000 rpm.",
    lesson:
      "A/C that cools at speed but not at idle is a condenser airflow problem until proven otherwise, because ram air is masking the fault. Never diagnose charge level by pressure alone — recover and weigh it. And record ambient temperature with every pressure reading; the same numbers mean completely different things at 18 °C and 35 °C.",
  },
  {
    id: "escape-blend-door",
    title: "Cold Air on the Driver's Side Only",
    vehicleId: "escape-2019",
    category: "A7",
    difficulty: "Beginner",
    estimatedMinutes: 11,
    customerName: "Nadia Cheval",
    customerMood: "Mildly irritated, commutes daily",
    complaint:
      "My side blows cold no matter what temperature I set, but the passenger side gets hot just fine. There's also a clicking behind the dash when I first start it.",
    interview: [
      { q: "When did it begin?", a: "Two weeks ago. It started with the clicking, then my side stopped getting warm." },
      { q: "Does the passenger side work?", a: "Yes, perfectly. That's what's so odd." },
      { q: "Is the engine reaching temperature?", a: "The gauge sits right in the middle like always." },
      { q: "When do you hear the clicking?", a: "For maybe fifteen seconds after startup, and when I change the temperature." },
      { q: "Any warning lights?", a: "None." },
      { q: "Any recent work?", a: "Nothing at all." },
    ],
    failure: {
      id: "blend-door-actuator",
      name: "Driver-side blend door actuator with stripped gears",
      system: "HVAC",
      effects: {},
    },
    codes: [],
    freezeFrame: {},
    testDriveEvents: [
      { atSecond: 6, label: "Clicking on startup", detail: "Rapid clicking from behind the left side of the dash for about 15 seconds" },
      { atSecond: 15, label: "Driver vent stays cold", detail: "Driver vent 14 °C with heat commanded" },
      { atSecond: 24, label: "Passenger vent responds", detail: "Passenger vent reaches 52 °C with heat commanded" },
    ],
    audioProfile: {
      id: "actuator-click",
      label: "Actuator gear clicking",
      description: "Fast repeating plastic click from the HVAC housing during actuator travel. Synthesized for training.",
      synthetic: true,
    },
    warningLights: [],
    inspection: [
      {
        id: "hvac-case",
        system: "HVAC",
        label: "HVAC housing & actuators",
        findings: ["Clicking traced to the driver-side blend actuator", "Actuator arm does not move when the temperature is changed", "Passenger actuator moves smoothly through its travel"],
        abnormal: true,
      },
      {
        id: "coolant",
        system: "Cooling",
        label: "Cooling system & heater hoses",
        findings: ["Both heater hoses hot to the touch", "Coolant level correct", "Thermostat holding temperature"],
        measurement: "Heater inlet 86 °C, outlet 79 °C",
        abnormal: false,
      },
      {
        id: "filter",
        system: "HVAC",
        label: "Cabin filter & airflow",
        findings: ["Filter clean", "Equal airflow at both sides"],
        abnormal: false,
      },
      {
        id: "control",
        system: "HVAC",
        label: "Climate control head",
        findings: ["All buttons respond", "Display shows commanded temperature correctly on both zones"],
        abnormal: false,
      },
    ],
    testPoints: [
      { id: "act-feed", label: "Driver blend actuator feed → ground", location: "HVAC", dcVolts: 5.0, note: "Reference voltage present" },
      { id: "act-fb", label: "Driver blend actuator feedback signal", location: "HVAC", dcVolts: 4.7, note: "Feedback stuck at the full-cold end of travel and never changes with commands" },
      { id: "pass-fb", label: "Passenger blend actuator feedback signal", location: "HVAC", dcVolts: 2.4, note: "Sweeps 0.5–4.5 V normally with commands" },
    ],
    hideScanTool: true,
    tools: [
      {
        kind: "actuator",
        id: "blend-tests",
        title: "HVAC actuator sweep tests",
        hint: "Command each actuator through its full travel and compare feedback voltage to physical movement",
        actuators: [
          {
            id: "driver-blend",
            name: "Driver blend door actuator",
            command: "Sweep full cold to full hot",
            expected: "Feedback sweeps 0.5–4.5 V, door travels fully, vent temperature rises",
            actual: "Feedback frozen at 4.7 V, audible clicking, no door movement, vent stays at 14 °C",
            abnormal: true,
          },
          {
            id: "pass-blend",
            name: "Passenger blend door actuator",
            command: "Sweep full cold to full hot",
            expected: "Feedback sweeps 0.5–4.5 V, vent temperature rises",
            actual: "Feedback sweeps 0.6–4.4 V, vent reaches 52 °C",
            abnormal: false,
          },
          {
            id: "mode",
            name: "Mode door actuator",
            command: "Cycle all modes",
            expected: "Airflow moves between outlets",
            actual: "All modes function correctly",
            abnormal: false,
          },
          {
            id: "recirc",
            name: "Recirculation door actuator",
            command: "Toggle fresh / recirculate",
            expected: "Door moves, airflow source changes",
            actual: "Operates normally",
            abnormal: false,
          },
        ],
      },
      {
        kind: "gauge",
        id: "vent-temps",
        title: "Dual-zone vent temperature comparison",
        hint: "Thermometer in each center vent with both zones commanded to maximum heat",
        sets: [
          {
            id: "heat",
            label: "Both zones on max heat",
            condition: "Engine at operating temperature, blower on medium",
            readings: [
              { label: "Driver vent temperature", measured: "14 °C", spec: "Above 50 °C", abnormal: true },
              { label: "Passenger vent temperature", measured: "52 °C", spec: "Above 50 °C", abnormal: false, note: "One zone working correctly proves coolant temperature, heater core flow and blower are all fine." },
              { label: "Heater core inlet", measured: "86 °C", spec: "Above 80 °C", abnormal: false },
              { label: "Heater core outlet", measured: "79 °C", spec: "Within 15 °C of inlet", abnormal: false },
            ],
          },
        ],
      },
      {
        kind: "codes",
        id: "hvac-codes",
        title: "Climate control module codes",
        hint: "Codes stored in the HVAC module rather than the powertrain module",
        module: "HVAC / Climate Control Module",
        codes: [
          { code: "B1251", description: "Air Temperature Door Circuit Failure — Driver Side", status: "Current — 9 fail counts", freeze: "Commanded position 100 %, actual feedback 0 %" },
        ],
      },
    ],
    steps: [
      {
        id: "root-cause",
        stage: "root-cause",
        prompt: "What is the most likely root cause?",
        principle:
          "In a dual-zone system, one working zone proves everything shared between the zones is good. Focus only on what is unique to the failed side.",
        options: [
          { id: "a", text: "Failed driver-side blend door actuator with stripped gears", correct: true, reasoning: "Clicking traced to that actuator, feedback frozen at one end of travel, no physical movement, a matching B1251 code, and a passenger side that works perfectly." },
          { id: "b", text: "Plugged heater core", correct: false, reasoning: "The heater core serves both zones, and the passenger side reaches 52 °C. Inlet and outlet temperatures also confirm good flow." },
          { id: "c", text: "Low coolant level", correct: false, reasoning: "Coolant is at the correct level and one zone delivers full heat." },
          { id: "d", text: "Failed climate control head", correct: false, reasoning: "The control head commands both zones correctly and the module logged an accurate actuator-specific code." },
        ],
      },
      {
        id: "next-test",
        stage: "next-test",
        prompt: "What test confirms the actuator rather than its circuit?",
        principle: "Prove the actuator receives a valid command and reference voltage before condemning it — otherwise you may be replacing a good part on a broken circuit.",
        options: [
          { id: "a", text: "Command a full sweep while monitoring feedback voltage and verifying reference voltage and ground at the actuator connector", correct: true, reasoning: "Correct. Valid reference voltage, a valid command, and feedback that never changes means the actuator itself has failed internally." },
          { id: "b", text: "Replace the actuator immediately because of the clicking", correct: false, reasoning: "The clicking is strong evidence, but verifying supply and command first takes two minutes and prevents a wrong part." },
          { id: "c", text: "Flush the heater core", correct: false, reasoning: "Heater core flow is already proven good by the passenger-side temperature." },
          { id: "d", text: "Replace the thermostat", correct: false, reasoning: "Engine temperature and heater inlet temperature are both correct." },
        ],
      },
      {
        id: "repair",
        stage: "repair",
        prompt: "What repair should be performed?",
        principle: "Replace the failed component, then run the system's own calibration so the module knows the new travel limits.",
        options: [
          { id: "a", text: "Replace the driver-side blend door actuator, perform the HVAC actuator calibration procedure, then verify both vents reach specification", correct: true, reasoning: "Correct. Skipping calibration leaves the module using the old stored travel limits, which often produces a temperature error even with a new actuator." },
          { id: "b", text: "Replace the actuator and clear the code", correct: false, reasoning: "Clearing the code is not calibration. The module must relearn the door's end stops." },
          { id: "c", text: "Replace the entire HVAC housing", correct: false, reasoning: "The housing and doors are fine — only the actuator failed." },
          { id: "d", text: "Set the driver zone to hot and disconnect the actuator", correct: false, reasoning: "Forcing a door position is not a repair and leaves the customer with no temperature control." },
        ],
      },
    ],
    rootCause:
      "Driver-side blend door actuator with stripped internal gears, unable to move the temperature door despite receiving a valid command.",
    repair:
      "Replace the driver-side blend door actuator, run the HVAC actuator calibration, clear the B1251 code, and verify both vents reach specification on max heat and max cool.",
    lesson:
      "In dual-zone climate systems, a working zone is a built-in known-good reference. Anything shared — coolant temperature, heater core, blower, control head — is already proven by the side that works. Compare the failed side against it and diagnose only what differs. Always calibrate a replacement actuator so the module learns the correct end stops.",
  },
];
