import { useEffect, useState } from "react";
import type { TestPoint } from "@/lib/sim/types";

type Mode = "DCV" | "ACV" | "OHM" | "CONT";

export function Multimeter({
  testPoints,
  engineRunning,
  onUse,
}: {
  testPoints: TestPoint[];
  engineRunning: boolean;
  onUse: () => void;
}) {
  const [mode, setMode] = useState<Mode>("DCV");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    onUse();
  }, [onUse]);

  const tp = testPoints.find((t) => t.id === selected);

  const reading = (): string => {
    if (!tp) return "----";
    switch (mode) {
      case "DCV": {
        const v = engineRunning && tp.runningDcVolts !== undefined ? tp.runningDcVolts : tp.dcVolts;
        if (v === undefined) return "0.00 V";
        return v === "OL" ? "OL" : `${v.toFixed(2)} V`;
      }
      case "ACV":
        return tp.acVolts !== undefined ? `${tp.acVolts.toFixed(2)} V~` : "0.00 V~";
      case "OHM":
        if (tp.ohms === undefined) return "OL";
        return tp.ohms === "OL" ? "OL" : `${tp.ohms} Ω`;
      case "CONT":
        return tp.continuity ? "BEEP · 0.2 Ω" : tp.ohms === "OL" ? "OPEN" : "NO BEEP";
    }
  };

  return (
    <div className="panel-instrument overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-panel px-4 py-3">
        <span className="font-display text-sm font-bold uppercase tracking-[0.18em]">
          Digital Multimeter
        </span>
        <span className="label-tech">{engineRunning ? "Engine running" : "Key off"}</span>
      </div>

      <div className="p-4">
        <div className="rounded-sm border border-signal/40 bg-signal/10 px-4 py-6 text-center">
          <div className="readout text-4xl font-semibold text-signal">{reading()}</div>
          <div className="label-tech mt-2">{mode} mode</div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {(["DCV", "ACV", "OHM", "CONT"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-sm border px-2 py-2 font-display text-xs font-semibold uppercase tracking-wider transition-colors ${
                mode === m
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <span className="label-tech">Place probes on a test point</span>
          <div className="mt-2 space-y-2">
            {testPoints.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={`w-full rounded-sm border px-3 py-2 text-left text-sm transition-colors ${
                  selected === t.id
                    ? "border-primary bg-accent"
                    : "border-border bg-panel hover:bg-accent"
                }`}
              >
                <span className="block">{t.label}</span>
                <span className="label-tech">{t.location}</span>
              </button>
            ))}
          </div>
        </div>

        {tp?.note && (
          <p className="mt-4 rounded-sm border border-caution/50 bg-caution/10 px-3 py-2 text-xs text-caution">
            {tp.note}
          </p>
        )}
      </div>
    </div>
  );
}
