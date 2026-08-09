import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplet,
  Gauge,
  Network,
  ScanLine,
  ToggleRight,
} from "lucide-react";
import type { ToolPanel } from "@/lib/sim/types";

const ICONS = {
  fluid: Droplet,
  gauge: Gauge,
  codes: ScanLine,
  network: Network,
  actuator: ToggleRight,
  vibration: Activity,
} as const;

export function ToolBench({ tool, onUse }: { tool: ToolPanel; onUse: () => void }) {
  useEffect(() => {
    onUse();
  }, [onUse]);

  const Icon = ICONS[tool.kind];

  return (
    <div className="panel-instrument overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border bg-panel px-4 py-3">
        <Icon className="h-4 w-4 text-primary" />
        <div>
          <span className="font-display text-sm font-bold uppercase tracking-[0.18em]">
            {tool.title}
          </span>
          <p className="label-tech mt-1">{tool.hint}</p>
        </div>
      </div>
      <div className="p-4">
        {tool.kind === "fluid" && <FluidBench tool={tool} />}
        {tool.kind === "gauge" && <GaugeBench tool={tool} />}
        {tool.kind === "codes" && <CodesBench tool={tool} />}
        {tool.kind === "network" && <NetworkBench tool={tool} />}
        {tool.kind === "actuator" && <ActuatorBench tool={tool} />}
        {tool.kind === "vibration" && <VibrationBench tool={tool} />}
      </div>
    </div>
  );
}

function Verdict({ abnormal, children }: { abnormal: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`flex items-center gap-1.5 text-xs ${abnormal ? "text-destructive" : "text-ok"}`}
    >
      {abnormal ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}

function FluidBench({ tool }: { tool: Extract<ToolPanel, { kind: "fluid" }> }) {
  const [open, setOpen] = useState(tool.samples[0]?.id ?? "");
  const active = tool.samples.find((s) => s.id === open) ?? tool.samples[0];

  return (
    <div className="grid gap-4 md:grid-cols-[13rem_1fr]">
      <div className="space-y-2">
        {tool.samples.map((s) => (
          <button
            key={s.id}
            onClick={() => setOpen(s.id)}
            className={`flex w-full items-center gap-3 rounded-sm border px-3 py-2 text-left text-sm transition-colors ${
              active?.id === s.id ? "border-primary bg-accent" : "border-border bg-panel hover:bg-accent"
            }`}
          >
            <span
              className="h-6 w-6 shrink-0 rounded-full border border-border"
              style={{ background: s.color }}
            />
            {s.label}
          </button>
        ))}
      </div>
      {active && (
        <div className="rounded-sm border border-border bg-panel p-4">
          <div
            className="h-16 w-full rounded-sm border border-border"
            style={{ background: `linear-gradient(90deg, ${active.color}, ${active.color}cc)` }}
          />
          <dl className="mt-4 space-y-2 text-sm">
            <Row k="Color / clarity" v={active.condition} />
            <Row k="Odor" v={active.smell} />
          </dl>
          <p className="mt-3 text-sm text-muted-foreground">{active.verdict}</p>
          <div className="mt-3">
            <Verdict abnormal={active.abnormal}>
              {active.abnormal ? "Outside acceptable condition" : "Within acceptable condition"}
            </Verdict>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="label-tech">{k}</dt>
      <dd className="readout text-right text-sm">{v}</dd>
    </div>
  );
}

function GaugeBench({ tool }: { tool: Extract<ToolPanel, { kind: "gauge" }> }) {
  const [setId, setSetId] = useState(tool.sets[0]?.id ?? "");
  const active = tool.sets.find((s) => s.id === setId) ?? tool.sets[0];

  return (
    <div>
      {tool.sets.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {tool.sets.map((s) => (
            <button
              key={s.id}
              onClick={() => setSetId(s.id)}
              className={`rounded-sm border px-3 py-1.5 text-xs transition-colors ${
                active?.id === s.id
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      {active?.condition && (
        <p className="mt-3 text-xs text-muted-foreground">Condition: {active.condition}</p>
      )}
      <div className="mt-4 space-y-2">
        {active?.readings.map((r) => (
          <div
            key={r.label}
            className={`rounded-sm border bg-panel px-3 py-2.5 ${
              r.abnormal ? "border-destructive/50" : "border-border"
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm">{r.label}</span>
              <span
                className={`readout text-lg font-bold ${r.abnormal ? "text-destructive" : "text-primary"}`}
              >
                {r.measured}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <span className="label-tech">Spec: {r.spec}</span>
              <Verdict abnormal={r.abnormal}>{r.abnormal ? "Out of spec" : "In spec"}</Verdict>
            </div>
            {r.note && <p className="mt-1.5 text-xs text-muted-foreground">{r.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function CodesBench({ tool }: { tool: Extract<ToolPanel, { kind: "codes" }> }) {
  return (
    <div>
      <span className="label-tech">Module: {tool.module}</span>
      <div className="mt-3 space-y-2">
        {tool.codes.map((c) => (
          <div key={c.code} className="rounded-sm border border-border bg-panel px-3 py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="readout text-base font-bold text-destructive">{c.code}</span>
              <span className="label-tech">{c.status}</span>
            </div>
            <p className="mt-1 text-sm">{c.description}</p>
            {c.freeze && <p className="mt-1 text-xs text-muted-foreground">{c.freeze}</p>}
          </div>
        ))}
        {!tool.codes.length && (
          <p className="text-sm text-muted-foreground">No codes stored in this module.</p>
        )}
      </div>
    </div>
  );
}

function NetworkBench({ tool }: { tool: Extract<ToolPanel, { kind: "network" }> }) {
  const color = (s: string) =>
    s === "ok" ? "text-ok" : s === "intermittent" ? "text-caution" : "text-destructive";
  return (
    <div>
      <div className="space-y-2">
        {tool.modules.map((m) => (
          <div
            key={m.address}
            className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border bg-panel px-3 py-2.5"
          >
            <div>
              <span className="text-sm">{m.name}</span>
              <span className="label-tech block">Address {m.address}</span>
              <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
            </div>
            <span className={`readout text-xs uppercase ${color(m.status)}`}>{m.status}</span>
          </div>
        ))}
      </div>
      {tool.busNote && (
        <p className="mt-3 rounded-sm border border-border bg-card p-3 text-xs text-muted-foreground">
          {tool.busNote}
        </p>
      )}
    </div>
  );
}

function ActuatorBench({ tool }: { tool: Extract<ToolPanel, { kind: "actuator" }> }) {
  const [ran, setRan] = useState<string[]>([]);
  return (
    <div className="space-y-2">
      {tool.actuators.map((a) => {
        const done = ran.includes(a.id);
        return (
          <div key={a.id} className="rounded-sm border border-border bg-panel px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-sm">{a.name}</span>
                <span className="label-tech block">Command: {a.command}</span>
              </div>
              <button
                onClick={() => setRan((r) => (r.includes(a.id) ? r : [...r, a.id]))}
                className="rounded-sm border border-primary/60 bg-primary/10 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-[0.14em] text-primary"
              >
                {done ? "Re-run" : "Run test"}
              </button>
            </div>
            {done && (
              <div className="mt-3 space-y-1 border-t border-border pt-2 text-sm">
                <Row k="Expected" v={a.expected} />
                <Row k="Actual" v={a.actual} />
                <div className="pt-1">
                  <Verdict abnormal={a.abnormal}>{a.abnormal ? "Fail" : "Pass"}</Verdict>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function VibrationBench({ tool }: { tool: Extract<ToolPanel, { kind: "vibration" }> }) {
  const max = Math.max(...tool.samples.map((s) => s.amplitude), 1);
  return (
    <div>
      <div className="flex h-40 items-end gap-2 rounded-sm border border-border bg-panel p-3">
        {tool.samples.map((s) => (
          <div key={s.speed} className="flex flex-1 flex-col items-center justify-end gap-2">
            <span className="readout text-[10px] text-muted-foreground">{s.amplitude}</span>
            <div
              className={`w-full rounded-t-sm ${s.amplitude / max > 0.6 ? "bg-destructive" : "bg-primary"}`}
              style={{ height: `${(s.amplitude / max) * 100}%` }}
            />
            <span className="label-tech">{s.speed}</span>
          </div>
        ))}
      </div>
      <p className="label-tech mt-2">Vibration amplitude (IPS × 100) vs road speed (mph)</p>
      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
        {tool.samples.map((s) => (
          <li key={s.speed}>
            <span className="readout text-foreground">{s.speed} mph</span> — {s.note}
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-sm border border-border bg-card p-3 text-sm">{tool.analysis}</p>
    </div>
  );
}
