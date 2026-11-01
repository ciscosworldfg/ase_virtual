import { useState } from "react";
import { AlertTriangle, Cable, Gauge, ShieldCheck } from "lucide-react";

type DiagnosticMode = "virtual" | "live";

/**
 * Live diagnostics workspace shell.
 *
 * This UI intentionally does not fabricate readings or attempt a browser-to-ELM
 * connection. The Android companion must expose an authenticated native bridge
 * and pass connection/initialization checks before live data can be enabled.
 */
export function LiveDiagnostics() {
  const [mode, setMode] = useState<DiagnosticMode>("virtual");

  return (
    <section className="panel-instrument overflow-hidden" aria-labelledby="diagnostics-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-panel px-4 py-4">
        <div>
          <p className="label-tech text-primary">Automotive Industry Shop Experience</p>
          <h2 id="diagnostics-title" className="mt-1 font-display text-lg font-bold uppercase tracking-wide">
            Diagnostic workspace
          </h2>
        </div>
        <div className="inline-flex rounded-sm border border-border bg-background p-1" role="group" aria-label="Diagnostic mode">
          <button
            type="button"
            aria-pressed={mode === "virtual"}
            onClick={() => setMode("virtual")}
            className={`rounded-sm px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${mode === "virtual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
          >
            Virtual training
          </button>
          <button
            type="button"
            aria-pressed={mode === "live"}
            onClick={() => setMode("live")}
            className={`rounded-sm px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${mode === "live" ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:bg-accent"}`}
          >
            Real vehicle
          </button>
        </div>
      </div>

      {mode === "virtual" ? (
        <div className="flex items-start gap-3 p-5">
          <Gauge className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h3 className="font-display font-semibold uppercase tracking-wide">Training simulator</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Continue using the existing virtual vehicle, simulated scan data, practice scenarios,
              and scoring. This workspace does not change or feed the simulator's scoring engine.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-sm bg-destructive px-3 py-1.5 text-xs font-bold tracking-wider text-destructive-foreground">
              <span className="h-2 w-2 rounded-full bg-white" />
              LIVE VEHICLE MODE SELECTED
            </span>
            <span className="text-xs text-muted-foreground">Not connected</span>
          </div>

          <div className="rounded-sm border border-caution/50 bg-caution/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-caution" />
              <div>
                <h3 className="font-semibold">Android companion not yet verified</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Live readings are locked until the Android ELM327 companion is installed,
                  its secure bridge is connected, and the adapter completes initialization.
                  No simulated values are shown in this mode.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {["Engine RPM", "Vehicle speed", "Coolant temperature", "Engine load", "Throttle", "Adapter voltage"].map((label) => (
              <div key={label} className="rounded-sm border border-border bg-panel px-3 py-3">
                <span className="label-tech">{label}</span>
                <div className="readout mt-2 text-xl text-muted-foreground">—</div>
                <span className="text-xs text-muted-foreground">Awaiting verified live data</span>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              { title: "Stored DTCs · Mode 03", detail: "Not read" },
              { title: "Pending DTCs · Mode 07", detail: "Not read" },
              { title: "Permanent DTCs · Mode 0A", detail: "Not read" },
            ].map((group) => (
              <div key={group.title} className="rounded-sm border border-border bg-panel p-3">
                <h4 className="text-sm font-semibold">{group.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{group.detail}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0 text-signal" />
              <span>Read-only design. No code clearing, actuator commands, or ECU writes.</span>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Cable className="h-4 w-4" />
              Adapter connection unavailable
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Freeze-frame retrieval will remain unavailable until a verified connection and
            supported Mode 02 response are confirmed.
          </p>
        </div>
      )}
    </section>
  );
}
