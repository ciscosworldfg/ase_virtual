/** 16-week mastery roadmap from the uploaded 16-Week ASE Prep Shop Manual
 *  (2026 edition, modernized with virtual labs and AI fault simulations). */

export interface RoadmapWeek {
  week: string;
  subject: string;
  focus: string;
}

export interface RoadmapPhase {
  id: string;
  title: string;
  weeks: RoadmapWeek[];
}

export const ROADMAP: RoadmapPhase[] = [
  {
    id: "foundations",
    title: "Foundations & mindset",
    weeks: [
      { week: "1", subject: "Foundations & ASE Mindset", focus: "Process, safety & service info usage — PPE, lifting protocols, HV orange cables need Class 0 gloves." },
      { week: "2", subject: "ASE Structure & the 7-Step Funnel", focus: "Tech A/B logic, the 7-step workflow, and the Proving vs. Guessing doctrine." },
    ],
  },
  {
    id: "a1",
    title: "Engine Repair (A1)",
    weeks: [
      { week: "3", subject: "Engine Basics", focus: "Mechanical health — the four layers: air/valve logic, synchronization, combustion core, lubrication/thermal." },
      { week: "4", subject: "Compression & Seal Proof", focus: "Relative compression (ENG-01), leak-down signatures, head-gasket proof." },
      { week: "5", subject: "Cooling & Lubrication", focus: "Cooling system flow, high-speed overheating protocol, oil-pump path." },
    ],
  },
  {
    id: "driveline",
    title: "Driveline (A2/A3)",
    weeks: [
      { week: "6", subject: "ATF Hydraulics", focus: "Fluid inspection: color, smell, contamination. Line pressure and valve body logic." },
      { week: "7", subject: "CVTs & Manual Drivetrain", focus: "Pulley-and-belt logic, TCC slip thresholds, clutch preload/backlash, CV joints." },
    ],
  },
  {
    id: "chassis",
    title: "Chassis & brakes (A4/A5)",
    weeks: [
      { week: "8", subject: "Geometry & Alignment", focus: "Camber, caster, toe — the primary tire-wear killer. Wear-pattern reading." },
      { week: "9", subject: "Brakes & ABS/ESC", focus: "Hydraulic logic, spongy vs. pulsation pedals, ABS electronics." },
    ],
  },
  {
    id: "electrical",
    title: "Electrical & OBD-II (A6/A8)",
    weeks: [
      { week: "10", subject: "Ohm's Law & Circuits", focus: "I = V/R, power/load/ground/protection, the 0.5 V voltage-drop threshold." },
      { week: "11", subject: "Voltage Drop & Networks", focus: "Voltage drop under load, CAN bus U-codes, network faults that mimic performance faults." },
      { week: "12", subject: "PID Analysis", focus: "STFT/LTFT, MAP/MAF, ECT/IAT, misfire counts — freeze-frame discipline." },
    ],
  },
  {
    id: "mastery",
    title: "Integrated master review",
    weeks: [
      { week: "13", subject: "Integrated Faults", focus: "AI-generated trouble scenarios & virtual-lab fault cascades across systems." },
      { week: "14", subject: "Mock Master Exams", focus: "Time management, distractor logic, Tech A/B gating under exam pressure." },
      { week: "15", subject: "Certification Strategy", focus: "3 C's documentation, sign-off thresholds, weak-area drilling." },
      { week: "16", subject: "Black-Box Car Days", focus: "Unknown challenges — plan-to-report mastery from blank worksheet to proven fix." },
    ],
  },
];

export const RUBRIC = [
  { label: "Theory", weight: "25%", detail: "Understanding of system logic and service information sources." },
  { label: "Lab accuracy", weight: "50%", detail: "Every 'out of spec' finding verified by the OE document that proves the specification." },
  { label: "Final exam", weight: "25%", detail: "Comprehensive assessment of A1–A8 competencies." },
];

const KEY = "ase-virtual-roadmap-v1";

export function readRoadmapDone(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function writeRoadmapDone(done: Record<string, boolean>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(done));
  } catch {
    /* storage unavailable */
  }
}
