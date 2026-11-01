# AISE Virtual — Honda Pilot Shop Diagnostic and Repair Workflow

**Status:** Technician workflow and training acceptance specification. This is not a completed vehicle diagnosis, repair authorization, or proof that any component has failed.  
**Target vehicle:** VIN confirmed by the user as `2HKYF18445H571161`. Reported vehicle: 2005 Honda Pilot V6 3.5L. Engine configuration, calibration and code applicability must still be checked against the vehicle and Shop Service Repair Manual before vehicle-specific work.  
**Purpose:** Convert the supplied scan evidence and relevant safety-campaign research into a repeatable shop process inside AISE Virtual, using the vehicle's **Shop Service Repair Manual** as the controlling authority for procedures, wiring diagrams, specifications, torque values and test limits.

## 1. Job intake and vehicle identification — required first

1. User-confirmed VIN on file: `2HKYF18445H571161`. At the vehicle, independently compare it with the windshield VIN and driver's door-jamb certification label before selecting service information or checking campaign eligibility. The earlier conflicting text string is superseded by this user confirmation.
2. Confirm model year, model, engine, transmission, drivetrain, emissions label/calibration ID and any installed equipment.
3. Record mileage, customer complaint, warning lamps, symptoms, recent repairs, battery condition and whether the vehicle is safe to operate.
4. Connect a compatible scan tool and record adapter type, protocol, ECU/module address, software/calibration identifiers, timestamp and battery voltage.
5. Save a complete pre-repair scan of **all accessible modules**, including PCM/PGM-FI, transmission, ABS/VSA, SRS and other equipped modules. Record each DTC's originating module, exact Honda code description, status (current, pending, confirmed, history), occurrence data and freeze-frame/snapshot association.
6. Preserve the original report. Do not clear codes, reset learned values, disconnect the battery, perform actuator tests or write/reprogram modules before the initial evidence is saved and the Shop Service Repair Manual procedure permits it.

**Data integrity note:** The supplied Car Scanner material contains an All Sensors DTC count of 2 and a separate report listing five confirmed DTCs. Keep these as separate source observations until a fresh full-module scan explains the difference. Do not combine them or silently choose one.

## 2. Safety campaign and recall gate

Before road testing or treating a brake/VSA complaint as an ordinary drivability issue:

1. Check the exact VIN with the official Honda recall lookup and NHTSA VIN recall lookup. Record campaign number, affected component, remedy status, completion date and source.
2. Specifically verify whether Honda VSA campaign **13V092000** (campaign references S87/S88/S89) applies and whether its remedy is complete. The campaign involved a VSA control-module electrical capacitor and ground connection; the prescribed remedy was a dealer-installed wiring-harness modification and ground tightening. This is a VIN-eligibility check, not evidence that this vehicle has the defect.
3. Check applicable fuel-tank and steering campaigns shown for this model year, and verify completion by VIN rather than assuming applicability from model year alone.
4. Check driver and passenger airbag inflator campaigns by VIN. A model-year population listing does not prove an open campaign on this individual vehicle.
5. If a safety recall is open, follow Honda's campaign instructions and arrange the authorized remedy. Do not attempt an improvised repair or represent a recall repair as completed without documented proof.
6. If the vehicle has unintended brake application, abnormal brake behavior, VSA warnings with braking symptoms, or uncertain brake integrity, do not road-test it. Follow shop safety policy and arrange inspection/transport as appropriate.

## 3. Diagnostic priority for the supplied codes

The scan report listed these five codes as Confirmed. Their presence is a recorded input, not proof of a failed part. AISE must first confirm that each code is supported by the exact vehicle/module and retrieve the matching Honda procedure from the Shop Service Repair Manual.

### P0172 — System too rich, Bank 1
### P0175 — System too rich, Bank 2

Because both banks were reported rich, investigate shared causes before replacing individual bank-specific parts.

**Procedure:**
1. Confirm both codes in the PCM/PGM-FI with a Honda-capable scan tool. Save freeze-frame data for each code separately if available.
2. Review short- and long-term fuel trims for both banks at the conditions specified by the manual. Preserve sign, units, RPM, load, coolant temperature and operating state.
3. Verify engine temperature plausibility, intake-air temperature, MAP/MAF data (as equipped), oxygen/air-fuel sensor activity, fuel-system status and commanded fuel control using the manual's specifications.
4. Inspect the air intake path and filter, intake ducting, vacuum/PCV plumbing, fuel-vapor purge system, fuel-pressure regulator/system (as equipped), injector leakage and fuel pressure using the exact Honda test procedure.
5. Check for a purge valve stuck open, excessive fuel pressure, leaking injectors, biased sensor inputs, wiring/ground faults or other causes identified by the manual. Do not assume an oxygen sensor is faulty because a rich code is present.
6. Compare Bank 1 and Bank 2 behavior. If both banks show similar rich correction, prioritize shared inputs/fuel delivery; if they differ materially, follow the bank-specific branch of the manual.
7. Perform only the manual-prescribed confirmation tests. Repair the verified cause, then complete the manual's post-repair verification drive/monitor procedure when safe and permitted.
8. Re-scan all modules and document whether the DTCs returned, fuel trims normalized under comparable conditions, monitors completed and the customer symptom was resolved.

**Recorded clue, not diagnosis:** The supplied freeze-frame showed negative fuel trims on both banks (STFT B1 -10.94%, LTFT B1 -16.41%, STFT B2 -24.22%, LTFT B2 -17.97%). Negative trims mean the PCM was subtracting fuel at that snapshot. This supports investigating a rich condition but does not identify its cause. The snapshot is historical and must not be displayed as live engine telemetry.

### P0017 — Crankshaft/camshaft position correlation, Bank 1 Sensor B (generic scan description)

1. Confirm the code and exact Honda definition/application in the PCM DTC index for the verified VIN and calibration. If unsupported or the scan tool's generic label conflicts with Honda service information, flag the discrepancy and stop the vehicle-specific branch.
2. Save freeze-frame and check for related CMP/CKP, misfire, VTC or timing-related codes.
3. Follow the manual's inspection sequence for engine oil level/condition and any specified VTC/oil-pressure prerequisites.
4. Inspect CMP/CKP connectors, harness routing, terminal condition, power, ground and signal integrity using the manual's pinout and electrical specifications.
5. If the manual directs mechanical timing inspection, verify timing-belt installation/indexing, tensioner condition and cam/crank timing marks with the specified procedure and tools.
6. Test sensor signals and mechanical correlation using the Honda-prescribed scan-tool/oscilloscope procedure. Do not replace a sensor or disturb timing components based on the generic code label alone.
7. Repair only the confirmed fault, reassemble to specified torque/procedure, then complete the manual's code-clear and confirmation steps.

### P2017 — Intake manifold air control actuator position sensor/switch, Bank 1 circuit high (generic scan description)

1. Confirm that this exact DTC and monitored system are supported by the verified Pilot PCM/calibration. If Honda's DTC index does not list it for this vehicle, retain it as a scan-tool interpretation requiring investigation, not a confirmed Honda diagnosis.
2. Identify the actual intake-manifold control system fitted to this engine from the Shop Service Repair Manual.
3. Inspect the related connector, terminals, harness, routing, corrosion, damage and possible short-to-voltage.
4. Use the exact wiring diagram and manual procedure to test reference voltage, ground, signal voltage and circuit continuity under the specified conditions.
5. If equipped and the manual permits, test actuator movement and position feedback with the specified scan-tool active test. Keep hands clear of moving linkages.
6. Repair wiring, connector, actuator or sensor only after the relevant test isolates the fault. Do not infer that a high circuit reading automatically means the sensor itself is defective.
7. Complete the manual's post-repair scan and functional verification.

### C1000 — Manufacturer/module-specific code; source not yet identified

1. Identify the module that reported C1000 from a full-system Honda-capable scan. Do not assume it is an ABS/VSA, brake or transmission code.
2. Retrieve the exact Honda description and diagnostic tree for that module and vehicle configuration.
3. Record companion codes, module voltage, communication status, freeze-frame or event data, and relevant warning-lamp behavior.
4. Follow the module-specific wiring, power, ground, network and component tests in the Shop Service Repair Manual.
5. If it originates in ABS/VSA, complete the brake/VSA recall eligibility and safety inspection first. Do not perform road tests if brake behavior is abnormal or safety is uncertain.
6. Do not clear or condemn the module until the prescribed checks are complete. Document the actual root cause and the manual's confirmation criteria.

## 4. Required AISE technician workflow and screens

AISE must present this as a guided job, not a one-click code-to-part replacement:

1. **Vehicle identification:** VIN, year/model/engine/transmission, calibration and equipment confirmation.
2. **Recall and safety check:** VIN-specific campaign lookup, completion status, safety hold and documentation.
3. **Pre-scan:** all-module scan, module ownership, DTC status, freeze-frame and raw source evidence.
4. **Manual lookup:** exact vehicle/module/code procedure, wiring diagram, connector/pin references, specifications and safety warnings.
5. **Guided tests:** technician checklist with measured value, expected manual range, test conditions, pass/fail/not-tested and evidence attachment.
6. **Root-cause decision:** distinguish confirmed fault, possible cause, generic code definition, unsupported code and unresolved result.
7. **Repair plan:** list only repairs supported by completed tests; include required parts, tools, precautions and manual-specified service operations.
8. **Post-repair verification:** code status, live data under comparable conditions, readiness monitors, functional checks and customer complaint confirmation.
9. **Closeout report:** before/after scans, measurements, repair performed, manual reference/revision, technician sign-off and unresolved items.

Every test result must be attributable to a timestamp, vehicle state, module, PID/test, units, source and manual specification. AISE must never invent Honda pinouts, voltage limits, torque values, relearn steps or repair procedures. If the exact Shop Service Repair Manual information is unavailable, clearly mark the step **Manual reference required — do not proceed**.

## 5. Preserve the supplied scan evidence

### Connection and ECU observations
- Car Scanner reported ELM adapter Connected and ECU Connected.
- Protocol reported: ISO 9141-2 (5-baud initialization, 10.4 kbaud).
- ECU address shown: 09.
- VIN confirmed by user: `2HKYF18445H571161`; the earlier conflicting text string is superseded.
- MIL: ON.
- All Sensors reports: DTC count 2.
- Separate DTC report: five codes marked Confirmed.

### Two live-screen observations from the supplied reports
| Time | Adapter voltage | Calculated load | Coolant temperature |
|---|---:|---:|---:|
| 17:02 | 13.6 V | 35.69% | 186.8°F |
| 17:17 | 13.5 V | 35.29% | 188.6°F |

Fuel system status for ECU #1 and ECU #2 was reported closed loop using oxygen-sensor feedback. Catalyst and oxygen-sensor monitors were reported not completed in the supplied monitor list. Preserve the original monitor states; they do not alone prove a failed component.

### Historical freeze-frame snapshot — not live data
| Parameter | Value |
|---|---:|
| Fuel system status | Unknown |
| Calculated engine load | 49.02% |
| Engine coolant temperature | 159.8°F |
| STFT Bank 1 | -10.94% |
| LTFT Bank 1 | -16.41% |
| STFT Bank 2 | -24.22% |
| LTFT Bank 2 | -17.97% |
| Intake manifold absolute pressure | 7.11 psi |
| Engine RPM | 843 rpm |
| Vehicle speed | 1.24 mph |
| Timing advance | 2.5° |
| Intake air temperature | 150.8°F |

Throttle-position value was cut off in the screenshot. The freeze-frame DTC association was not legible. Do not invent either value or assign the snapshot to one of the five codes without evidence.

## 6. Live ELM327 and virtual-mode validation gate

Physical vehicle testing is **blocked until the 3D engine is complete and live telemetry integration has been verified**.

When authorized and ready:
1. Start with read-only communication. Confirm adapter and ECU connection, protocol, module address and supported PID list.
2. Capture raw ELM327 responses and decoded values with timestamps, units and error/timeout states.
3. Compare AISE readings against Car Scanner under the same vehicle state and as close in time as practical.
4. Keep live PIDs, freeze-frame snapshots, stored DTC data and virtual/simulated values in separate data channels.
5. Synchronize the 3D engine only from timestamped live telemetry when a real adapter session is active. In virtual mode, label all values as simulated and do not present them as real vehicle data.
6. Verify RPM, coolant temperature, load and supported sensor values update correctly in the dashboard and 3D engine. Missing or unsupported PIDs must be shown as unavailable, never fabricated.
7. Verify DTC source/module and supported system coverage. Do not claim transmission, ABS/brake or cooling-system code coverage unless the relevant module was actually queried and the returned code was decoded against the correct manual.
8. Do not clear codes, reset adaptations, run active tests or write/reprogram an ECU during this validation unless separately authorized and the service procedure explicitly requires it.

## 7. Acceptance criteria

The workflow is complete only when:
- VIN and vehicle configuration are confirmed.
- VIN-specific recall status and required safety actions are documented.
- The five reported codes are independently re-read and attributed to their originating modules, or their discrepancy is explicitly resolved.
- Exact Honda code applicability and Shop Service Repair Manual procedures are verified for the vehicle.
- Every diagnostic test records actual measured values against manual specifications.
- Root cause is supported by test evidence before a repair is recommended.
- Post-repair scan and confirmation tests meet the manual's criteria.
- Live ELM327, virtual simulation and historical freeze-frame data remain clearly separated.
- The 3D engine accurately reflects verified live telemetry only during a real connected session.

**Current status: NOT DIAGNOSED / NOT REPAIRED / VEHICLE TESTING BLOCKED.** The scan data identifies diagnostic leads, not a confirmed failed part. This document adds the technician workflow and does not authorize production deployment, code clearing, ECU writes or physical vehicle testing.
