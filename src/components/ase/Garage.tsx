import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { InspectionPoint } from "@/lib/sim/types";

export function Garage({
  points,
  onUse,
}: {
  points: InspectionPoint[];
  onUse: () => void;
}) {
  const [open, setOpen] = useState<string | null>(points[0]?.id ?? null);

  useEffect(() => {
    onUse();
  }, [onUse]);

  const active = points.find((p) => p.id === open);

  return (
    <div className="panel-instrument overflow-hidden">
      <div className="border-b border-border bg-panel px-4 py-3">
        <span className="font-display text-sm font-bold uppercase tracking-[0.18em]">
          Virtual garage · inspection
        </span>
        <p className="label-tech mt-1">Select a system to inspect</p>
      </div>

      <div className="grid gap-0 md:grid-cols-[15rem_1fr]">
        <div className="border-b border-border p-3 md:border-b-0 md:border-r">
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
            {points.map((p) => (
              <button
                key={p.id}
                onClick={() => setOpen(p.id)}
                className={`flex items-center justify-between rounded-sm border px-3 py-2 text-left text-sm transition-colors ${
                  open === p.id
                    ? "border-primary bg-accent"
                    : "border-border bg-panel hover:bg-accent"
                }`}
              >
                <span>
                  <span className="block">{p.label}</span>
                  <span className="label-tech">{p.system}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {active ? (
            <>
              <div className="flex items-center gap-2">
                {active.abnormal ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-ok" />
                )}
                <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                  {active.label}
                </h3>
              </div>
              <ul className="mt-4 space-y-2">
                {active.findings.map((f) => (
                  <li
                    key={f}
                    className="rounded-sm border border-border bg-panel px-3 py-2 text-sm text-muted-foreground"
                  >
                    {f}
                  </li>
                ))}
              </ul>
              {active.measurement && (
                <p
                  className={`readout mt-4 rounded-sm border px-3 py-2 text-sm ${
                    active.abnormal
                      ? "border-destructive/60 bg-destructive/10 text-destructive"
                      : "border-border bg-panel text-signal"
                  }`}
                >
                  {active.measurement}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a system.</p>
          )}
        </div>
      </div>
    </div>
  );
}
