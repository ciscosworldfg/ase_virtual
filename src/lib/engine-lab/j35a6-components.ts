/**
 * AISE Virtual — J35A6 V6 engine-lab component catalogue.
 *
 * This is the data foundation for the exploded engine viewer. It deliberately
 * separates verified component purpose from vehicle-specific fitment details:
 * connector pinouts, exact positions, and service torques must be confirmed
 * against the correct Honda service information before being taught as specs.
 */

export type EngineSystem =
  | "fuel-injection"
  | "ignition"
  | "air-intake"
  | "engine-management"
  | "cooling"
  | "lubrication"
  | "valvetrain"
  | "mechanical";

export type ComponentKind =
  | "injector"
  | "sensor"
  | "actuator"
  | "mechanical"
  | "fluid-path"
  | "electrical";

export interface EngineComponent {
  id: string;
  name: string;
  system: EngineSystem;
  kind: ComponentKind;
  quantity: number;
  location: string;
  function: string;
  operatingPrinciple: string;
  inspectionPoints: string[];
  relatedIds: string[];
  /** True when this item should be visually emphasized in the first learning pass. */
  priority: "critical" | "high" | "standard";
  /** Position and fitment are instructional placeholders until calibrated to OEM data. */
  placementStatus: "conceptual" | "oem-verified";
}

const component = (
  item: EngineComponent,
): EngineComponent => Object.freeze(item);

export const J35A6_ENGINE: {
  vehicle: string;
  engine: string;
  configuration: string;
  cylinders: number;
  fuel: string;
  components: EngineComponent[];
} = {
  vehicle: "2005 Honda Pilot EX",
  engine: "J35A6",
  configuration: "3.5 L SOHC V6",
  cylinders: 6,
  fuel: "Gasoline",
  components: [
    component({
      id: "fuel-rail",
      name: "Fuel rail",
      system: "fuel-injection",
      kind: "fluid-path",
      quantity: 1,
      location: "Along the intake-side injector bank",
      function: "Distributes pressurized fuel to the six injectors.",
      operatingPrinciple: "Fuel pressure is maintained by the vehicle fuel-delivery system; the PCM commands injector pulse width.",
      inspectionPoints: ["Fuel leaks", "Damaged rail or retaining hardware", "Injector seal condition"],
      relatedIds: ["injector-1", "injector-2", "injector-3", "injector-4", "injector-5", "injector-6"],
      priority: "critical",
      placementStatus: "conceptual",
    }),
    ...Array.from({ length: 6 }, (_, index) =>
      component({
        id: `injector-${index + 1}`,
        name: `Fuel injector ${index + 1}`,
        system: "fuel-injection",
        kind: "injector",
        quantity: 1,
        location: `Cylinder ${index + 1} injector position`,
        function: "Meters and atomizes fuel into the intake port for its cylinder.",
        operatingPrinciple: "An electrically controlled solenoid opens the injector for a PCM-calculated pulse duration.",
        inspectionPoints: ["Connector lock and terminal condition", "Harness continuity using the correct procedure", "Fuel leakage and seal condition", "Command/current waveform where equipped"],
        relatedIds: ["fuel-rail", "pcm", "ect-1", "map-sensor"],
        priority: "critical",
        placementStatus: "conceptual",
      }),
    ),
    component({
      id: "pcm",
      name: "Powertrain control module (PCM)",
      system: "engine-management",
      kind: "electrical",
      quantity: 1,
      location: "Vehicle body-mounted control module; not on the engine assembly",
      function: "Processes sensor inputs and controls fuel, ignition, emissions and other engine functions.",
      operatingPrinciple: "Uses calibrated logic and input signals to command injectors, ignition coils and actuators.",
      inspectionPoints: ["Power and ground integrity", "Connector condition", "DTCs and freeze-frame data", "Relevant input and output data"],
      relatedIds: ["injector-1", "map-sensor", "ect-1", "crank-sensor", "cam-sensor"],
      priority: "critical",
      placementStatus: "conceptual",
    }),
    ...[
      ["map-sensor", "Manifold absolute pressure (MAP) sensor", "Measures intake-manifold absolute pressure for engine-load calculation."],
      ["tps", "Throttle position sensor (TPS)", "Reports throttle-plate position to the PCM."],
      ["iat", "Intake air temperature (IAT) sensor", "Measures incoming-air temperature for air-density and fueling corrections."],
      ["ect-1", "Engine coolant temperature (ECT) sensor 1", "Reports engine coolant temperature to the PCM."],
      ["ect-2", "Engine coolant temperature (ECT) sensor 2", "Provides a second coolant-temperature measurement for the vehicle's control and indication strategy; verify its exact circuit role in OEM wiring information."],
      ["crank-sensor", "Crankshaft position (CKP) sensor", "Provides crankshaft position and speed information for timing and engine-speed calculation."],
      ["cam-sensor", "Camshaft position (CMP) sensor", "Provides camshaft phase information for synchronization and valve-timing control."],
      ["knock-sensor", "Knock sensor", "Detects engine-block vibration associated with combustion knock so the PCM can adjust ignition timing."],
      ["o2-upstream", "Upstream air-fuel / oxygen sensors", "Monitor exhaust oxygen before the catalytic converters for fuel-control feedback."],
      ["o2-downstream", "Downstream oxygen sensors", "Monitor exhaust oxygen after the catalytic converters, primarily for catalyst monitoring."],
      ["vtec-oil-pressure", "VTEC oil pressure switch", "Confirms the commanded VTEC oil-pressure state; its signal is not a direct measurement of engine oil pressure."],
      ["egr-position", "EGR valve / position feedback", "Controls or reports exhaust-gas recirculation, depending on the fitted valve design."],
    ].map(([id, name, fn]) =>
      component({
        id,
        name,
        system: "engine-management",
        kind: id === "egr-position" ? "actuator" : "sensor",
        quantity: id === "o2-upstream" || id === "o2-downstream" ? 2 : 1,
        location: "OEM-positioned sensor or actuator; exact bank, connector and mounting point require service-manual verification",
        function: fn,
        operatingPrinciple: "The component converts a physical condition or PCM command into an electrical signal or controlled action.",
        inspectionPoints: ["Connector and harness condition", "Power, ground and signal checks per wiring diagram", "Scan-data plausibility", "Circuit testing before component replacement"],
        relatedIds: ["pcm"],
        priority: ["ect-1", "crank-sensor", "cam-sensor", "map-sensor", "vtec-oil-pressure"].includes(id) ? "critical" : "high",
        placementStatus: "conceptual",
      }),
    ),
    component({
      id: "ignition-coils",
      name: "Ignition coil assemblies",
      system: "ignition",
      kind: "electrical",
      quantity: 6,
      location: "One coil assembly per cylinder",
      function: "Generate the high voltage required to fire each spark plug.",
      operatingPrinciple: "The PCM controls coil primary charging and triggering; the coil transforms primary voltage into high secondary voltage.",
      inspectionPoints: ["Coil connector and boot", "Oil or moisture in plug wells", "Primary control and power supply", "Secondary insulation and spark-plug condition"],
      relatedIds: ["spark-plugs", "pcm", "crank-sensor", "cam-sensor"],
      priority: "high",
      placementStatus: "conceptual",
    }),
    component({
      id: "spark-plugs",
      name: "Spark plugs",
      system: "ignition",
      kind: "mechanical",
      quantity: 6,
      location: "One spark plug per cylinder, beneath each ignition coil",
      function: "Ignite the compressed air-fuel mixture.",
      operatingPrinciple: "A high-voltage discharge jumps the electrode gap and initiates combustion.",
      inspectionPoints: ["Correct application and gap", "Electrode wear", "Insulator deposits", "Evidence of oil, fuel or coolant contamination"],
      relatedIds: ["ignition-coils"],
      priority: "high",
      placementStatus: "conceptual",
    }),
    ...[
      ["water-pump", "Water pump", "Circulates coolant through the engine and cooling circuit."],
      ["thermostat", "Thermostat", "Regulates coolant flow to help control engine operating temperature."],
      ["water-passage", "Coolant water passage", "Routes coolant between the engine, heads and external cooling components."],
      ["radiator", "Radiator", "Transfers heat from engine coolant to outside air."],
      ["radiator-cap", "Radiator pressure cap", "Maintains specified system pressure and controls coolant recovery through the cap system."],
    ].map(([id, name, fn]) =>
      component({
        id, name, system: "cooling", kind: "mechanical", quantity: 1,
        location: "Cooling-system assembly; exploded placement to be calibrated from OEM diagrams",
        function: fn,
        operatingPrinciple: "Part of the pressurized liquid-cooling circuit; coolant flow and heat transfer depend on engine temperature and system pressure.",
        inspectionPoints: ["Coolant leaks", "Hose and sealing condition", "Flow restriction", "Correct coolant and bleeding procedure"],
        relatedIds: ["ect-1", "ect-2"],
        priority: "high",
        placementStatus: "conceptual",
      }),
    ),
    ...[
      ["oil-pump", "Engine oil pump", "Draws oil from the sump and supplies pressurized lubrication to engine galleries."],
      ["oil-filter", "Engine oil filter", "Removes contaminants from circulating engine oil."],
      ["oil-screen", "Oil pickup screen", "Screens debris before oil enters the pump."],
      ["oil-pan", "Oil pan", "Stores the engine oil supply."],
      ["oil-pressure-switch", "Oil pressure switch", "Signals an oil-pressure warning state; it is not a graduated pressure sensor."],
    ].map(([id, name, fn]) =>
      component({
        id, name, system: "lubrication", kind: "mechanical", quantity: 1,
        location: "Lower-engine lubrication assembly; exact position requires OEM diagram calibration",
        function: fn,
        operatingPrinciple: "Supports oil storage, pickup, filtration and pressure-fed lubrication.",
        inspectionPoints: ["Leaks and sealing surfaces", "Oil contamination", "Pickup restriction", "Pressure verification with a mechanical gauge when diagnosing pressure"],
        relatedIds: ["oil-pump", "oil-filter", "oil-screen", "oil-pan"],
        priority: "high",
        placementStatus: "conceptual",
      }),
    ),
    component({
      id: "valvetrain",
      name: "SOHC V6 valvetrain assemblies",
      system: "valvetrain",
      kind: "mechanical",
      quantity: 2,
      location: "One cylinder-head assembly per bank",
      function: "Operates intake and exhaust valves in the correct sequence.",
      operatingPrinciple: "Camshaft rotation acts through the valvetrain to open and close valves in synchronization with crankshaft rotation.",
      inspectionPoints: ["Cam and rocker wear", "Valve clearance per OEM procedure", "Oil supply", "Timing and synchronization"],
      relatedIds: ["cam-sensor", "vtec-oil-pressure", "timing-belt"],
      priority: "high",
      placementStatus: "conceptual",
    }),
    component({
      id: "timing-belt",
      name: "Timing belt and drive components",
      system: "mechanical",
      kind: "mechanical",
      quantity: 1,
      location: "Timing drive at engine end",
      function: "Synchronizes crankshaft and camshaft rotation.",
      operatingPrinciple: "A toothed belt maintains the designed mechanical relationship between crankshaft and camshaft timing.",
      inspectionPoints: ["Belt condition and contamination", "Tensioner and idler condition", "Timing marks and service interval"],
      relatedIds: ["valvetrain", "crank-sensor", "cam-sensor"],
      priority: "critical",
      placementStatus: "conceptual",
    }),
  ],
};

export const J35A6_COMPONENTS = J35A6_ENGINE.components;

export const getJ35A6Component = (id: string): EngineComponent | undefined =>
  J35A6_COMPONENTS.find((item) => item.id === id);

export const getJ35A6ComponentsBySystem = (
  system: EngineSystem,
): EngineComponent[] =>
  J35A6_COMPONENTS.filter((item) => item.system === system);

export const getJ35A6PriorityComponents = (): EngineComponent[] =>
  J35A6_COMPONENTS.filter((item) => item.priority === "critical");
