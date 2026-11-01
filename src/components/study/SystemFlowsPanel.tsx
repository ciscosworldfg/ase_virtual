import { useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";

const FLOWS = {
  Cooling: {
    steps: ["Water pump", "Engine coolant passages", "Thermostat", "Radiator", "Return hose", "Water pump"],
    description: "Heat moves from engine metal into coolant, then to ambient air through the radiator. The thermostat regulates warm-up flow.",
    note: "Never open a hot pressurized cooling system. Verify temperature and flow using the exact vehicle's service procedure.",
  },
  Lubrication: {
    steps: ["Oil pan", "Oil pump", "Oil filter", "Main galleries", "Bearings", "Oil pan"],
    description: "The pump supplies oil through filtration and galleries to bearings; gravity returns it to the sump.",
    note: "Low oil pressure is a stop-and-investigate condition. Do not continue running an engine with an oil-pressure warning.",
  },
  Combustion: {
    steps: ["Air filter", "Throttle body", "Intake manifold", "Cylinder combustion", "Exhaust / catalyst", "Tailpipe"],
    description: "Filtered air is metered, mixed with fuel, compressed and ignited; exhaust aftertreatment reduces regulated emissions.",
    note: "A misfire code does not identify a failed part. Correlate air, fuel, ignition, compression and timing evidence.",
  },
  Transmission: {
    steps: ["Engine torque", "Torque converter / clutch", "Gear set", "Output shaft", "Differential", "Driven wheels"],
    description: "Torque passes through a coupling and selected gear ratio, then through the final drive and differential to the wheels.",
    note: "This is a conceptual power-flow path, not a specific transmission design. Verify the vehicle's actual unit and OEM service information.",
  },
  Electrical: {
    steps: ["Battery", "Starter / alternator", "Fuses & grounds", "Sensors", "Control module", "Actuators"],
    description: "Stored energy supports cranking; the charging system replenishes it. Sensors report conditions and control modules command actuators.",
    note: "Use wiring diagrams and correct loaded tests. Resistance measurements require the circuit to be de-energized as specified.",
  },
} as const;

type FlowName = keyof typeof FLOWS;

export function SystemFlowsPanel() {
  const [flowName, setFlowName] = useState<FlowName>("Cooling");
  const [step, setStep] = useState(0);
  const flow = FLOWS[flowName];

  return (
    <section className="space-y-5">
      <div>
        <p className="label-tech text-signal">Powertrain & vehicle systems</p>
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide">System flow explorer</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Follow the operating path one stage at a time. These are instructional flow maps, not live vehicle telemetry or OEM-specific diagrams.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(FLOWS) as FlowName[]).map((name) => (
          <button key={name} onClick={() => { setFlowName(name); setStep(0); }} className={`rounded-sm border px-4 py-2 text-xs font-bold uppercase tracking-wide ${flowName === name ? "border-primary bg-primary text-primary-foreground" : "border-border bg-panel text-muted-foreground hover:bg-accent"}`}>{name}</button>
        ))}
      </div>
      <div className="panel-instrument p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-xl font-bold uppercase">{flowName} flow</h3>
          <span className="label-tech">STAGE {step + 1} / {flow.steps.length}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{flow.description}</p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {flow.steps.map((name, index) => (
            <button key={`${name}-${index}`} onClick={() => setStep(index)} className={`flex min-h-16 items-center gap-3 rounded-sm border p-3 text-left ${index === step ? "border-primary bg-accent" : "border-border bg-panel"}`}>
              <span className={`readout grid h-8 w-8 shrink-0 place-items-center rounded-sm border ${index === step ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{String(index + 1).padStart(2, "0")}</span>
              <span className="text-sm font-semibold">{name}</span>
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-sm border border-primary/40 bg-panel p-4">
          <p className="label-tech text-signal">Selected stage</p>
          <h4 className="mt-1 font-display text-xl font-bold uppercase">{flow.steps[step]}</h4>
          <p className="mt-2 text-xs text-muted-foreground">{step === 0 ? "Starting point of this flow." : `Receives flow from: ${flow.steps[step - 1]}.`} {step === flow.steps.length - 1 ? "Completes the loop or delivers output." : `Next: ${flow.steps[step + 1]}.`}</p>
        </div>
        <div className="mt-4 flex flex-wrap justify-between gap-2">
          <button onClick={() => setStep(0)} className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs"><RotateCcw className="h-4 w-4"/> Reset</button>
          <button onClick={() => setStep((value) => (value + 1) % flow.steps.length)} className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">Next stage <ArrowRight className="h-4 w-4"/></button>
        </div>
        <p className="mt-4 text-xs leading-6 text-muted-foreground">{flow.note}</p>
      </div>
    </section>
  );
}
