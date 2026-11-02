// Maps only verified scenario-to-model relationships currently supported by the generic engine lab.
// A highlight means "related training system", never a confirmed failed component.
export const GARAGE_PROTOCOL = "aise-garage/v1" as const;

const SCENARIO_PARTS: Record<string, string[]> = {
  "intake-vacuum-leak": ["int", "thr", "map"],
  "coil-breakdown-load": ["coil", "plug"],
  "high-resistance-ground": ["alt", "block"],
  "head-gasket-seep": ["head", "block", "ect"],
  "catalyst-degraded": ["exh"],
};

export function partsForFailure(failureId: string): string[] {
  return SCENARIO_PARTS[failureId] ?? [];
}
