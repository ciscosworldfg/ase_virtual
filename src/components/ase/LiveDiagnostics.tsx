import { ScanTool } from "./ScanTool";
import { computeLiveData, initialState } from "@/lib/sim/engine";
import { SCENARIOS } from "@/lib/sim/scenarios";
import { vehicleById } from "@/lib/sim/vehicles";

/**
 * Dashboard entry point for the same OBD-II scan tool used inside training scenarios.
 * Virtual mode uses a clearly labeled sample scenario. Real Vehicle mode is the same
 * ScanTool interface and suppresses every simulated value until a verified ELM327
 * bridge supplies actual vehicle readings.
 */
export function LiveDiagnostics() {
  const scenario = SCENARIOS[0];
  const vehicle = scenario ? vehicleById(scenario.vehicleId) : undefined;

  if (!scenario || !vehicle) {
    return <p className="text-sm text-muted-foreground">No virtual vehicle scenario is available.</p>;
  }

  const data = computeLiveData(initialState(vehicle), vehicle, scenario.failure);

  return (
    <ScanTool
      data={data}
      codes={scenario.codes}
      freezeFrame={scenario.freezeFrame}
      onUse={() => undefined}
    />
  );
}
