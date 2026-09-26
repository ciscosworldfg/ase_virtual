import { useMemo, useState } from "react";
import { FileText, Plus, Printer, Trash2 } from "lucide-react";
import type { Scenario, Vehicle, AseCategory } from "@/lib/sim/types";
import type { LiveDataFrame } from "@/lib/sim/engine";
import { vehicleName } from "@/lib/sim/vehicles";

type Kind = "labor" | "part" | "fluid" | "sublet";
interface Line {
  id: string;
  kind: Kind;
  desc: string;
  qty: number;
  unit: number;
  evidence: string;
}
interface CatalogItem {
  kind: Kind;
  desc: string;
  qty: number;
  unit: number;
}

const COMMON: CatalogItem[] = [
  { kind: "labor", desc: "Road test — verify repair", qty: 0.3, unit: 0 },
  { kind: "part", desc: "Shop supplies", qty: 1, unit: 18 },
];

const CATALOG: Record<AseCategory, CatalogItem[]> = {
  A1: [
    { kind: "labor", desc: "Cylinder head gasket R&R", qty: 8.5, unit: 0 },
    { kind: "part", desc: "Head gasket set", qty: 1, unit: 245 },
    { kind: "part", desc: "Head bolts (set)", qty: 1, unit: 68 },
    { kind: "fluid", desc: "Engine coolant (gal)", qty: 2, unit: 24 },
    { kind: "sublet", desc: "Cylinder head resurface / pressure test", qty: 1, unit: 180 },
    { kind: "labor", desc: "Cooling system pressure test", qty: 0.5, unit: 0 },
  ],
  A2: [
    { kind: "labor", desc: "Transmission fluid exchange", qty: 1.2, unit: 0 },
    { kind: "fluid", desc: "ATF / CVT fluid (qt)", qty: 8, unit: 14 },
    { kind: "part", desc: "Shift solenoid", qty: 1, unit: 135 },
    { kind: "labor", desc: "Valve body / solenoid R&R", qty: 3.2, unit: 0 },
    { kind: "labor", desc: "TCM software update & adaptive relearn", qty: 0.8, unit: 0 },
    { kind: "part", desc: "Pan gasket & filter kit", qty: 1, unit: 58 },
  ],
  A3: [
    { kind: "part", desc: "CV axle assembly", qty: 1, unit: 165 },
    { kind: "labor", desc: "CV axle R&R", qty: 1.4, unit: 0 },
    { kind: "part", desc: "Universal joint", qty: 1, unit: 42 },
    { kind: "labor", desc: "Driveshaft U-joint replacement", qty: 1.5, unit: 0 },
    { kind: "fluid", desc: "Gear oil 75W-90 (qt)", qty: 3, unit: 16 },
    { kind: "labor", desc: "Differential pinion bearing overhaul", qty: 6, unit: 0 },
    { kind: "part", desc: "Pinion bearing & seal kit", qty: 1, unit: 210 },
  ],
  A4: [
    { kind: "part", desc: "Strut assembly (each)", qty: 2, unit: 175 },
    { kind: "labor", desc: "Front strut R&R (pair)", qty: 2.4, unit: 0 },
    { kind: "part", desc: "Stabilizer bar link", qty: 1, unit: 38 },
    { kind: "labor", desc: "Stabilizer link R&R", qty: 0.6, unit: 0 },
    { kind: "labor", desc: "Four-wheel alignment", qty: 1.2, unit: 0 },
    { kind: "part", desc: "Inner / outer tie rod end", qty: 1, unit: 55 },
    { kind: "fluid", desc: "Power steering fluid (qt)", qty: 1, unit: 12 },
  ],
  A5: [
    { kind: "part", desc: "Brake pad set (axle)", qty: 1, unit: 85 },
    { kind: "part", desc: "Brake rotor (each)", qty: 2, unit: 78 },
    { kind: "labor", desc: "Pads & rotors R&R (axle)", qty: 1.6, unit: 0 },
    { kind: "part", desc: "Brake caliper (reman)", qty: 1, unit: 95 },
    { kind: "labor", desc: "Caliper R&R & bleed", qty: 1.0, unit: 0 },
    { kind: "fluid", desc: "DOT 3/4 brake fluid (qt)", qty: 1, unit: 16 },
    { kind: "labor", desc: "Brake fluid flush", qty: 0.8, unit: 0 },
    { kind: "part", desc: "Wheel speed sensor", qty: 1, unit: 72 },
  ],
  A6: [
    { kind: "part", desc: "12 V battery", qty: 1, unit: 210 },
    { kind: "labor", desc: "Battery R&R & module relearn", qty: 0.6, unit: 0 },
    { kind: "labor", desc: "Ground circuit repair", qty: 1.0, unit: 0 },
    { kind: "part", desc: "Ground strap / terminal", qty: 1, unit: 28 },
    { kind: "labor", desc: "Parasitic draw isolation", qty: 1.5, unit: 0 },
    { kind: "labor", desc: "CAN bus wiring repair", qty: 1.8, unit: 0 },
    { kind: "part", desc: "Alternator (reman)", qty: 1, unit: 285 },
  ],
  A7: [
    { kind: "labor", desc: "A/C recover, evacuate & recharge", qty: 1.0, unit: 0 },
    { kind: "fluid", desc: "Refrigerant R-134a / R-1234yf (lb)", qty: 1.5, unit: 45 },
    { kind: "part", desc: "Blend door actuator", qty: 1, unit: 68 },
    { kind: "labor", desc: "Blend door actuator R&R & calibrate", qty: 1.2, unit: 0 },
    { kind: "part", desc: "A/C compressor clutch relay", qty: 1, unit: 22 },
    { kind: "labor", desc: "A/C leak test (dye / sniffer)", qty: 0.8, unit: 0 },
  ],
  A8: [
    { kind: "part", desc: "Intake / PCV vacuum hose", qty: 1, unit: 34 },
    { kind: "labor", desc: "Vacuum leak smoke test", qty: 0.8, unit: 0 },
    { kind: "part", desc: "Ignition coil", qty: 1, unit: 78 },
    { kind: "part", desc: "Spark plugs (set)", qty: 1, unit: 64 },
    { kind: "labor", desc: "Ignition coil / plug R&R", qty: 1.1, unit: 0 },
    { kind: "part", desc: "Catalytic converter", qty: 1, unit: 890 },
    { kind: "labor", desc: "Catalytic converter R&R", qty: 1.8, unit: 0 },
  ],
  L1: [],
};

const KIND_LABEL: Record<Kind, string> = { labor: "Labor", part: "Part", fluid: "Fluid", sublet: "Sublet" };
let seq = 0;
const nid = () => `l${++seq}`;

function gatherEvidence(scenario: Scenario, data: LiveDataFrame, toolsUsed: string[]) {
  const ev: string[] = [];
  if (toolsUsed.includes("interview")) ev.push(`Customer: ${scenario.complaint.slice(0, 80)}`);
  if (toolsUsed.includes("scan")) scenario.codes.forEach((c) => ev.push(`DTC ${c.code} — ${c.description}`));
  if (toolsUsed.includes("inspect"))
    scenario.inspection.filter((p) => p.abnormal).forEach((p) => ev.push(`Inspection: ${p.label}${p.measurement ? ` (${p.measurement})` : ""}`));
  for (const t of scenario.tools ?? []) {
    if (!toolsUsed.includes(`tool:${t.id}`)) continue;
    if (t.kind === "gauge")
      t.sets.forEach((s) => s.readings.filter((r) => r.abnormal).forEach((r) => ev.push(`${t.title}: ${r.label} ${r.measured} (spec ${r.spec})`)));
    if (t.kind === "fluid") t.samples.filter((s) => s.abnormal).forEach((s) => ev.push(`${t.title}: ${s.label} — ${s.verdict}`));
    if (t.kind === "codes") t.codes.forEach((c) => ev.push(`${t.module} ${c.code} — ${c.description}`));
    if (t.kind === "actuator") t.actuators.filter((a) => a.abnormal).forEach((a) => ev.push(`${a.name}: ${a.actual} (expected ${a.expected})`));
    if (t.kind === "network") t.modules.filter((m) => m.status !== "ok").forEach((m) => ev.push(`${m.name}: ${m.status}`));
    if (t.kind === "vibration") ev.push(`${t.title}: ${t.analysis.slice(0, 80)}`);
  }
  if (toolsUsed.includes("testdrive") && data.running)
    ev.push(`Live: ${Math.round(data.rpm)} rpm, STFT ${data.stft?.toFixed?.(1) ?? data.stft}%, LTFT ${data.ltft?.toFixed?.(1) ?? data.ltft}%`);
  return ev;
}

export function EstimateBuilder({
  scenario,
  vehicle,
  data,
  toolsUsed,
}: {
  scenario: Scenario;
  vehicle: Vehicle;
  data: LiveDataFrame;
  toolsUsed: string[];
}) {
  const [rate, setRate] = useState(145);
  const [taxPct, setTaxPct] = useState(8.25);
  const [lines, setLines] = useState<Line[]>([]);
  const evidence = useMemo(() => gatherEvidence(scenario, data, toolsUsed), [scenario, data, toolsUsed]);

  const diagHours = useMemo(() => {
    const billable = toolsUsed.filter((t) => t !== "interview");
    return Math.max(0.5, Math.round(billable.length * 0.3 * 10) / 10);
  }, [toolsUsed]);

  const catalog = [...(CATALOG[scenario.category] ?? []), ...COMMON];

  const add = (c: CatalogItem) =>
    setLines((l) => [...l, { id: nid(), ...c, evidence: "" }]);
  const update = (id: string, patch: Partial<Line>) =>
    setLines((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const remove = (id: string) => setLines((l) => l.filter((x) => x.id !== id));

  const price = (x: Line) => (x.kind === "labor" ? x.qty * rate : x.qty * x.unit);
  const labor = diagHours * rate + lines.filter((x) => x.kind === "labor").reduce((s, x) => s + price(x), 0);
  const parts = lines.filter((x) => x.kind !== "labor").reduce((s, x) => s + price(x), 0);
  const tax = (parts * taxPct) / 100;
  const total = labor + parts + tax;
  const unsupported = lines.filter((x) => !x.evidence).length;
  const $ = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="panel-instrument p-5 print:border-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="label-tech text-signal">Service writer · Repair estimate</span>
          <h2 className="mt-1 font-display text-xl font-bold uppercase tracking-wide">
            RO for {scenario.customerName}
          </h2>
          <p className="readout text-xs text-muted-foreground">
            {vehicleName(vehicle)} · {vehicle.engine} · {vehicle.mileage.toLocaleString()} mi
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs hover:bg-accent print:hidden"
        >
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-sm border border-border bg-panel p-3">
          <span className="label-tech">Evidence on file ({evidence.length})</span>
          {evidence.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              No evidence collected yet. Use the tools before writing an estimate — customers pay for findings, not guesses.
            </p>
          ) : (
            <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-xs">
              {evidence.map((e) => (
                <li key={e} className="readout text-muted-foreground">• {e}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-sm border border-border bg-panel p-3 print:hidden">
          <span className="label-tech">Labor guide & parts ({scenario.category})</span>
          <div className="mt-2 max-h-48 space-y-1 overflow-auto">
            {catalog.map((c) => (
              <button
                key={c.desc}
                onClick={() => add(c)}
                className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1 text-left text-xs hover:bg-accent"
              >
                <span>
                  <span className="text-muted-foreground">{KIND_LABEL[c.kind]} · </span>
                  {c.desc}
                </span>
                <span className="readout flex items-center gap-1 text-muted-foreground">
                  {c.kind === "labor" ? `${c.qty} h` : $(c.unit)} <Plus className="h-3 w-3" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs print:hidden">
        <label className="flex items-center gap-2">
          Labor rate $/h
          <input type="number" value={rate} onChange={(e) => setRate(+e.target.value || 0)} className="w-20 rounded-sm border border-border bg-background px-2 py-1 readout" />
        </label>
        <label className="flex items-center gap-2">
          Parts tax %
          <input type="number" step="0.01" value={taxPct} onChange={(e) => setTaxPct(+e.target.value || 0)} className="w-20 rounded-sm border border-border bg-background px-2 py-1 readout" />
        </label>
      </div>

      <table className="mt-4 w-full text-xs">
        <thead className="label-tech text-left">
          <tr className="border-b border-border">
            <th className="py-2">Type</th>
            <th>Description</th>
            <th>Justified by</th>
            <th className="text-right">Qty/Hrs</th>
            <th className="text-right">Amount</th>
            <th className="print:hidden" />
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/50">
            <td className="py-2">Labor</td>
            <td>Diagnostic time (auto from tools used)</td>
            <td className="text-muted-foreground">{toolsUsed.length} tools used</td>
            <td className="readout text-right">{diagHours.toFixed(1)}</td>
            <td className="readout text-right">{$(diagHours * rate)}</td>
            <td className="print:hidden" />
          </tr>
          {lines.map((x) => (
            <tr key={x.id} className="border-b border-border/50">
              <td className="py-2">{KIND_LABEL[x.kind]}</td>
              <td>{x.desc}</td>
              <td>
                <select
                  value={x.evidence}
                  onChange={(e) => update(x.id, { evidence: e.target.value })}
                  className={`w-full max-w-[14rem] rounded-sm border bg-background px-1 py-1 ${x.evidence ? "border-border" : "border-caution/60 text-caution"}`}
                >
                  <option value="">— link evidence —</option>
                  {evidence.map((e) => (
                    <option key={e} value={e}>{e.slice(0, 60)}</option>
                  ))}
                </select>
              </td>
              <td className="text-right">
                <input
                  type="number"
                  step="0.1"
                  value={x.qty}
                  onChange={(e) => update(x.id, { qty: +e.target.value || 0 })}
                  className="w-16 rounded-sm border border-border bg-background px-1 py-1 text-right readout"
                />
              </td>
              <td className="readout text-right">{$(price(x))}</td>
              <td className="text-right print:hidden">
                <button onClick={() => remove(x.id)} aria-label="Remove line" className="p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 ml-auto w-full max-w-xs space-y-1 text-sm">
        <Row k="Labor" v={$(labor)} />
        <Row k="Parts & fluids" v={$(parts)} />
        <Row k={`Tax (${taxPct}%)`} v={$(tax)} />
        <div className="flex justify-between border-t border-border pt-2 font-display text-lg font-bold">
          <span>Total</span>
          <span className="readout text-primary">{$(total)}</span>
        </div>
      </div>

      {unsupported > 0 && (
        <p className="mt-3 flex items-center gap-2 text-xs text-caution">
          <FileText className="h-4 w-4" /> {unsupported} line{unsupported > 1 ? "s" : ""} not linked to evidence — a service
          advisor can't defend unjustified work to the customer.
        </p>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{k}</span>
      <span className="readout text-foreground">{v}</span>
    </div>
  );
}
