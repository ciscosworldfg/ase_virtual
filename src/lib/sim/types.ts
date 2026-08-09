export type AseCategory =
  | "A1"
  | "A2"
  | "A3"
  | "A4"
  | "A5"
  | "A6"
  | "A7"
  | "A8"
  | "L1";

export const ASE_CATEGORIES: { id: AseCategory; name: string }[] = [
  { id: "A1", name: "Engine Repair" },
  { id: "A2", name: "Automatic Transmission" },
  { id: "A3", name: "Manual Drivetrain & Axles" },
  { id: "A4", name: "Suspension & Steering" },
  { id: "A5", name: "Brakes" },
  { id: "A6", name: "Electrical / Electronic" },
  { id: "A7", name: "Heating & Air Conditioning" },
  { id: "A8", name: "Engine Performance" },
  { id: "L1", name: "Advanced Engine Performance" },
];

export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Master";

export type EngineLayout =
  | "I3"
  | "I4"
  | "I5"
  | "I6"
  | "V6"
  | "V8"
  | "V10"
  | "V12"
  | "Rotary"
  | "Hybrid"
  | "PHEV"
  | "EV";

export type Induction =
  | "Naturally Aspirated"
  | "Turbocharged"
  | "Twin Turbo"
  | "Supercharged";

export type FuelSystem =
  | "Carburetor"
  | "Throttle Body Injection"
  | "Multi-Port Injection"
  | "Direct Injection"
  | "Hybrid"
  | "Electric";

export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  engine: string;
  layout: EngineLayout;
  displacement: number | null;
  induction: Induction;
  fuelSystem: FuelSystem;
  transmission: string;
  driveType: "FWD" | "RWD" | "AWD" | "4WD";
  mileage: number;
  tech: string[];
  redline: number;
  idleRpm: number;
}

/** A discrete failure the simulation can inject into a vehicle. */
export interface FailureCondition {
  id: string;
  name: string;
  system: string;
  /** how the failure warps the live data model */
  effects: {
    misfireRate?: number; // 0-1
    stftIdle?: number;
    ltftIdle?: number;
    stftCruise?: number;
    ltftCruise?: number;
    coolantOffset?: number;
    oilPressureFactor?: number;
    chargingVoltage?: number;
    powerLoss?: number; // 0-1
    roughIdle?: number; // 0-1
    vibrationOnBraking?: number;
    noiseAtSpeed?: string;
  };
}

export interface TestPoint {
  id: string;
  label: string;
  location: string;
  /** value read when meter is in the given mode */
  dcVolts?: number | "OL";
  acVolts?: number;
  ohms?: number | "OL";
  continuity?: boolean;
  runningDcVolts?: number;
  note?: string;
}

export interface InspectionPoint {
  id: string;
  system: string;
  label: string;
  findings: string[];
  measurement?: string;
  abnormal: boolean;
}

export interface DtcCode {
  code: string;
  description: string;
  pending?: boolean;
}

export interface McqOption {
  id: string;
  text: string;
  correct: boolean;
  /** why this answer is right or wrong, in master-tech voice */
  reasoning: string;
}

export interface McqStep {
  id: string;
  stage: "root-cause" | "next-test" | "repair" | "verification";
  prompt: string;
  options: McqOption[];
  principle: string;
}

/* ---------------------------------------------------------------------------
 * Category-specific diagnostic instrumentation.
 * Every ASE area gets its own bench tools rather than reusing the OBD-II
 * scanner and DMM built for engine work.
 * ------------------------------------------------------------------------- */

export interface GaugeReading {
  label: string;
  measured: string;
  spec: string;
  abnormal: boolean;
  note?: string;
}

export interface GaugeSet {
  id: string;
  label: string;
  /** operating condition the readings were taken under */
  condition?: string;
  readings: GaugeReading[];
}

export type ToolPanel =
  | {
      kind: "fluid";
      id: string;
      title: string;
      hint: string;
      samples: {
        id: string;
        label: string;
        /** css color for the sample swatch */
        color: string;
        condition: string;
        smell: string;
        verdict: string;
        abnormal: boolean;
      }[];
    }
  | {
      kind: "gauge";
      id: string;
      title: string;
      hint: string;
      sets: GaugeSet[];
    }
  | {
      kind: "codes";
      id: string;
      title: string;
      hint: string;
      module: string;
      codes: { code: string; description: string; status: string; freeze?: string }[];
    }
  | {
      kind: "network";
      id: string;
      title: string;
      hint: string;
      modules: {
        name: string;
        address: string;
        status: "ok" | "no-response" | "intermittent";
        note: string;
      }[];
      busNote?: string;
    }
  | {
      kind: "actuator";
      id: string;
      title: string;
      hint: string;
      actuators: {
        id: string;
        name: string;
        command: string;
        expected: string;
        actual: string;
        abnormal: boolean;
      }[];
    }
  | {
      kind: "vibration";
      id: string;
      title: string;
      hint: string;
      analysis: string;
      samples: { speed: number; amplitude: number; note: string }[];
    };

export interface Scenario {
  id: string;
  title: string;
  vehicleId: string;
  category: AseCategory;
  difficulty: Difficulty;
  estimatedMinutes: number;
  complaint: string;
  customerName: string;
  customerMood: string;
  /** answers the virtual customer gives — never reveals the diagnosis */
  interview: { q: string; a: string }[];
  failure: FailureCondition;
  codes: DtcCode[];
  freezeFrame: Record<string, string>;
  testDriveEvents: { atSecond: number; label: string; detail: string }[];
  audioProfile: {
    id: string;
    label: string;
    description: string;
    synthetic: true;
  };
  warningLights: string[];
  inspection: InspectionPoint[];
  testPoints: TestPoint[];
  steps: McqStep[];
  rootCause: string;
  repair: string;
  lesson: string;
}
