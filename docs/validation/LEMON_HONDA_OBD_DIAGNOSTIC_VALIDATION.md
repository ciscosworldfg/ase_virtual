# AISE Virtual — Honda OBD-II Diagnostic Validation Dataset

**Status:** Reference test specification only. Not a vehicle diagnosis or proof of a repair.  
**Target vehicle record:** 2005 Honda Pilot V6-3.5L, pending VIN/vehicle-record reconciliation.  
**Source scan app:** Car Scanner ELM OBD2, profile Honda OBD-II / EOBD.  
**Intended use:** First recorded-data test set for AISE Virtual scanner parsing, freeze-frame display, diagnostic learning flow, and later live ELM327 comparison.

## 1. Evidence handling rules

1. Preserve the original Car Scanner reports as separate observations. Do not merge them into one synthetic scan.
2. The All Sensors reports show DTC count 2, while the separate DTC report lists five confirmed codes. Treat this as an unresolved discrepancy until a fresh scan establishes which modules/services were queried and when.
3. The two VIN strings differ in the supplied text. The connection screenshot shows `2HKYF18445H571161`; verify against the vehicle before treating the target vehicle identity as confirmed.
4. Freeze-frame values are historical ECU snapshot values, not current live readings. Never feed them into the live 3D engine channel.
5. Do not clear codes, reset adaptations, run actuator tests, or write to the ECU during this read-only validation.
6. AISE must distinguish: **manual-confirmed for this vehicle**, **generic code definition only**, **vehicle applicability unverified**, **unsupported**, and **not yet tested**.

## 2. Recorded scan evidence

### Connection and ECU

- Adapter and ECU were both reported Connected in Car Scanner.
- Protocol: ISO 9141-2 (5-baud initialization, 10.4 kbaud).
- ECU address shown: 09.
- VIN shown in connection screenshot: `2HKYF18445H571161`.
- MIL: ON.
- All Sensors reports: DTC count 2.
- Separate DTC report: five codes, each shown as Confirmed.

### All Sensors observations

Two separate observations were reported:

| Observation | Module voltage | Calculated load | Coolant temperature |
|---|---:|---:|---:|
| 17:02 | 13.6 V | 35.69% | 186.8°F |
| 17:17 | 13.5 V | 35.29% | 188.6°F |

Fuel system status for ECU #1 and ECU #2: closed loop, using oxygen-sensor feedback. Monitor status included catalyst and oxygen-sensor monitors not completed; preserve the original monitor states rather than inferring a failed component.

### Freeze-frame observation

These values belong to the freeze-frame screen and must be stored/displayed as a snapshot:

| Parameter | Value |
|---|---:|
| Fuel system status | Unknown |
| Calculated engine load | 49.01960784313726% |
| Engine coolant temperature | 159.8°F |
| STFT Bank 1 | -10.9375% |
| LTFT Bank 1 | -16.40625% |
| STFT Bank 2 | -24.21875% |
| LTFT Bank 2 | -17.96875% |
| Intake manifold absolute pressure | 7.106849162343001 psi |
| Engine RPM | 843 rpm |
| Vehicle speed | 1.2427423844747668 mph |
| Timing advance | 2.5° |
| Intake air temperature | 150.8°F |

The screenshot's throttle-position value is cut off; do not invent it. The freeze-frame DTC field is also not legible in the screenshot; do not assume which of the five codes owns this snapshot.

## 3. DTC validation cases

The following five codes were listed as Confirmed in the separate Car Scanner DTC report. Their presence in that report is the test input; it is not independent proof of the underlying component failure.

| Test ID | Reported DTC | Reported description | AISE handling requirement |
|---|---|---|---|
| HONDA-REC-001 | P0017 | Crankshaft position/camshaft position, Bank 1 Sensor B correlation | Parse and display the reported generic definition. Do not assign a Honda-specific diagnostic procedure or claim vehicle fitment until confirmed in the exact 2005 Pilot manual/PCM DTC index. |
| HONDA-REC-002 | P2017 | Intake manifold air control actuator position sensor/switch, Bank 1 circuit high | Parse and display the reported generic definition. Do not assume this exact code/monitor is implemented on this vehicle until confirmed in the exact Honda manual/PCM DTC index. |
| HONDA-REC-003 | P0172 | System too rich, Bank 1 | Display the reported code and link to Honda PGM-FI fuel-trim/air-fuel diagnostic learning. Confirm the exact Honda DTC troubleshooting page and specifications before presenting a vehicle-specific procedure. |
| HONDA-REC-004 | P0175 | System too rich, Bank 2 | Same controls as P0172, with correct Bank 2 identification. Confirm the exact Honda DTC troubleshooting page and specifications before presenting a vehicle-specific procedure. |
| HONDA-REC-005 | C1000 | No description supplied by the scan report | Preserve as manufacturer/module-specific unresolved code. First identify the reporting control module and retrieve its Honda-specific definition. Do not label it ABS, brake, transmission, or any component without that evidence. |

### Important source limitation

LEMON Manuals' generic DTC definition index describes P0017, P0172, P0175, and P2017, but explicitly warns that a generic list does not mean a particular vehicle supports every listed code. Therefore, generic descriptions may be used for parser/label tests only; they are not proof that the 2005 Honda Pilot PCM supports those monitors or that the generic test procedure applies.

## 4. Required LEMON Manuals references

Use these exact 2005 Honda Pilot references as the vehicle-specific knowledge starting point:

- **2005 Honda Pilot — How to Use the HDS:** https://lemon-manuals.la/Honda/2005/Pilot%20V6-3.5L/Repair%20and%20Diagnosis/Powertrain%20Management/Computers%20and%20Control%20Systems/Testing%20and%20Inspection/Scan%20Tool%20Testing%20and%20Procedures/How%20to%20Use%20the%20HDS%20%28Honda%20Diagnostic%20System%29/
  - Record the DTC, freeze data and on-board snapshot data before beginning the indicated troubleshooting procedure.
  - The manual describes freeze data as the engine conditions when the first malfunction, misfire, or fuel-trim malfunction was detected.
- **2005 Honda Pilot — PGM-FI System:** https://lemon-manuals.la/Honda/2005/Pilot%20V6-3.5L/Repair%20and%20Diagnosis/Powertrain%20Management/Computers%20and%20Control%20Systems/Description%20and%20Operation/PGM-FI%20System/
  - Use for the Pilot's PGM-FI system context, including CMP, CKP, ECT, IAT, MAP, air-fuel sensor, fuel-injection duration, and fuel-trim monitoring.
- **LEMON Manuals generic Powertrain DTC definitions (2004 Honda Civic page, generic index only):** https://lemon-manuals.la/Honda/2004/Civic%20EX%2C%204D%20Sedan%2C%20Standard/Repair%20and%20Diagnosis%20%28Single%20Page%29/General%20Information/OEM%20General%20Information/Diagnostic%20Trouble%20Code%20Definitions%20-%20General%20Information/Code%20Definitions/Powertrain%20Systems/
  - This source provides generic definitions for P0017, P0172, P0175 and P2017.
  - It is not the 2005 Pilot's vehicle-specific DTC application list or troubleshooting procedure.

## 5. AISE recorded-data acceptance checks

Before any physical ELM327 testing, AISE must pass these recorded-data checks:

1. Import/store the five DTCs with their original Confirmed status and source report timestamp.
2. Preserve the DTC-count discrepancy (2 versus 5) as two separate observations.
3. Display the two VIN strings as a conflict requiring confirmation; do not silently normalize either.
4. Display the All Sensors observations and freeze-frame snapshot in separate data channels.
5. Display the fuel trims with correct sign, bank, units, and snapshot provenance.
6. Decode P0017, P2017, P0172, and P0175 as generic definitions only unless vehicle-specific applicability is verified.
7. Keep C1000 unresolved until the reporting module and Honda definition are identified.
8. Never claim that a DTC proves a particular part has failed. The learning flow must require a manual-supported diagnostic procedure and confirmation test.
9. Do not mark a test PASS merely because a code label rendered. Record parser correctness, source attribution, vehicle applicability, and diagnostic procedure validation separately.

## 6. Later live ELM327 comparison

Only after the 3D engine and live telemetry integration are ready, perform a separate user-authorized read-only scan. Compare AISE live readings to Car Scanner under the same vehicle state and as close in time as practical. Do not compare historical freeze-frame values as if they were live values.

For every live comparison, capture:
- timestamp and vehicle state (ignition/engine running, idle/load, vehicle stationary/moving);
- adapter connection and ECU protocol;
- PID support status and raw response;
- decoded value, units, and source;
- DTC service/module/source and status;
- any unsupported, timeout, or malformed response.

A successful recorded-data replay is evidence of AISE's offline parser/display behavior only. A successful live comparison is separate evidence of real ELM327 communication. Neither alone proves a repair or root cause.

## 7. Release gate

**No vehicle testing until the 3D engine is complete and its telemetry integration has been verified.** This document does not authorize production deployment, ECU writes, code clearing, or any live vehicle test.
