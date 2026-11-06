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

 /**
  * Active Level 1 categories only. L1 remains in the category type for
  * deferred Level 2 work, but must not enter Level 1 menus or progress.
  */
export const ASE_CATEGORIES: { id: Exclude<AseCategory, "L1">; name: string }[] = [
  { id: "A1", name: "Engine Repair" },
  { id: "A2", name: "Automatic Transmission" },
  { id: "A3", name: "Manual Drivetrain & Axles" },
  { id: "A4", name: "Suspension & Steering" },
  { id: "A5", name: "Brakes" },
  { id: "A6", name: "Electrical / Electronic" },
  { id: "A7", name: "Heating & Air Conditioning" },
  { id: "A8", name: "Engine Performance" },
];

export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Master";