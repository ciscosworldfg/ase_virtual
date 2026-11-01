import { useEffect, useRef, useState } from "react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import type { LiveDataFrame } from "@/lib/sim/engine";
import type { DtcCode } from "@/lib/sim/types";

export function ScanTool({
  data,
  codes,
  freezeFrame,
  onUse,
}: {
  data: LiveDataFrame;
  codes: DtcCode[];
  freezeFrame: Record<string, string>;
  onUse: () => void;
}) {
  const [tab, setTab] = useState<"codes" | "freeze" | "live">("codes");
  const [mode, setMode] = useState<"virtual" | "live">("virtual");
  const [cleared, setCleared] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [history, setHistory] = useState<{ t: number; stft: number; ltft: number; rpm: number }[]>([]);
  const tick = useRef(0);

  useEffect(() => {
    onUse();
  }, [onUse]);

  useEffect(() => {
    if (mode !== "virtual") return;
    tick.current += 1;
    setHistory((h) =>
      [...h, { t: tick.current, stft: data.stft, ltft: data.ltft, rpm: data.rpm }].slice(-60),
    );
  }, [data, mode]);

  return (
    <div className="panel-instrument overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-panel px-4 py-3">
        <span className="font-display text-sm font-bold uppercase tracking-[0.18em]">OBD-II Scan Tool</span>
        <div className="inline-flex rounded-sm border border-border bg-background p-1" role="group" aria-label="OBD-II data source">
          <button type="button" aria-pressed={mode === "virtual"} onClick={() => setMode("virtual")} className={mode === "virtual" ? "rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold uppercase text-primary-foreground" : "rounded-sm px-3 py-1.5 text-xs font-semibold uppercase text-muted-foreground"}>Virtual</button>
          <button type="button" aria-pressed={mode === "live"} onClick={() => setMode("live")} className={mode === "live" ? "rounded-sm bg-destructive px-3 py-1.5 text-xs font-semibold uppercase text-destructive-foreground" : "rounded-sm px-3 py-1.5 text-xs font-semibold uppercase text-muted-foreground"}>Real vehicle</button>
        </div>
      </div>
      {mode === "virtual" ? (
        <div className="border-b border-caution/40 bg-caution/10 px-4 py-2 text-xs text-caution">SIMULATED DATA · Virtual vehicle only. Readings respond to the training scenario and test-drive controls.</div>
      ) : (
        <div className="border-b border-border bg-panel px-4 py-2 text-xs text-muted-foreground">LIVE VEHICLE MODE · Awaiting verified ELM327 connection. Simulated readings are hidden.</div>
      )}

      <div className="flex border-b border-border">
        {(["codes", "freeze", "live"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-3 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
              tab === t ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            {t === "codes" ? "Read codes" : t === "freeze" ? "Freeze frame" : "Live data"}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "codes" && (
          <div className="space-y-3">
            {mode === "live" ? (
              <div className="rounded-sm border border-border bg-panel p-4"><p className="font-semibold">Live trouble codes not yet read</p><p className="mt-1 text-sm text-muted-foreground">Connect and initialize the ELM327 adapter before reading stored, pending, or permanent DTCs. Virtual scenario codes are hidden in Real Vehicle mode.</p></div>
            ) : cleared ? (
              <p className="text-sm text-muted-foreground">
                Codes cleared. Note that clearing without repair also erases freeze frame evidence.
              </p>
            ) : codes.length ? (
              codes.map((c) => (
                <div key={c.code} className="rounded-sm border border-border bg-panel px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="readout text-lg font-semibold text-destructive">{c.code}</span>
                    {c.pending && <span className="label-tech text-caution">Pending</span>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No diagnostic trouble codes stored. A concern without codes still requires
                mechanical diagnosis.
              </p>
            )}

            {mode === "virtual" && !cleared && codes.length > 0 && (
              <div>
                {confirming ? (
                  <div className="rounded-sm border border-caution/60 bg-caution/10 p-3">
                    <p className="text-sm">
                      Clearing codes erases freeze frame data you may still need. Continue?
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          setCleared(true);
                          setConfirming(false);
                        }}
                        className="rounded-sm bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground"
                      >
                        Clear codes
                      </button>
                      <button
                        onClick={() => setConfirming(false)}
                        className="rounded-sm border border-border px-3 py-1.5 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirming(true)}
                    className="rounded-sm border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
                  >
                    Clear codes
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "freeze" && (
          <div>
            {mode === "live" ? (
              <p className="text-sm text-muted-foreground">Live freeze-frame data has not been retrieved. It will appear after a verified adapter connection and supported Mode 02 response.</p>
            ) : Object.keys(freezeFrame).length ? (
              <dl className="grid grid-cols-2 gap-2">
                {Object.entries(freezeFrame).map(([k, v]) => (
                  <div key={k} className="rounded-sm border border-border bg-panel px-3 py-2">
                    <dt className="label-tech">{k}</dt>
                    <dd className="readout text-sm">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                No freeze frame stored — this concern did not set an emissions-related code.
              </p>
            )}
          </div>
        )}

        {tab === "live" && (
          <div className="space-y-4">
            {mode === "virtual" ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Pid label="RPM" value={data.rpm} unit="rpm" />
              <Pid label="Load" value={data.load} unit="%" />
              <Pid label="MAF" value={data.maf} unit="g/s" />
              <Pid label="MAP" value={data.map} unit="kPa" />
              <Pid label="STFT" value={data.stft} unit="%" alert={Math.abs(data.stft) > 10} />
              <Pid label="LTFT" value={data.ltft} unit="%" alert={Math.abs(data.ltft) > 10} />
              <Pid label="O2 B1S1" value={data.o2b1s1} unit="V" />
              <Pid label="A/F ratio" value={data.afRatio} unit=":1" />
              <Pid label="Coolant" value={data.coolant} unit="°C" />
              <Pid label="IAT" value={data.iat} unit="°C" />
              <Pid label="TPS" value={data.tps} unit="%" />
              <Pid label="Timing" value={data.timing} unit="° BTDC" />
              <Pid label="Fuel pressure" value={data.fuelPressure} unit="kPa" />
              <Pid label="Voltage" value={data.batteryVoltage} unit="V" alert={data.batteryVoltage < 13.2} />
              <Pid label="Misfires" value={data.misfireCount} unit="ct" alert={data.misfireCount > 0} />
            </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {["RPM", "Load", "MAF", "MAP", "STFT", "LTFT", "O2 B1S1", "A/F ratio", "Coolant", "IAT", "TPS", "Timing", "Fuel pressure", "Voltage", "Misfires"].map((label) => (
                  <div key={label} className="rounded-sm border border-border bg-panel px-3 py-2"><div className="label-tech">{label}</div><div className="readout text-sm text-muted-foreground">—</div><span className="text-[0.65rem] text-muted-foreground">Awaiting live PID</span></div>
                ))}
                <p className="col-span-full text-xs text-muted-foreground">Live values will populate this same dashboard after the ELM327 bridge and ECU responses are verified. Unsupported PIDs remain unavailable.</p>
              </div>
            )}

{mode === "virtual" ? (
            <div className="rounded-sm border border-border bg-panel p-3">
              <span className="label-tech">Fuel trim graph (STFT / LTFT)</span>
              <div className="mt-2 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <YAxis
                      domain={[-30, 30]}
                      width={28}
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="stft"
                      stroke="var(--color-chart-1)"
                      dot={false}
                      isAnimationActive={false}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="ltft"
                      stroke="var(--color-chart-2)"
                      dot={false}
                      isAnimationActive={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            ) : (
              <p className="text-xs text-muted-foreground">Live graph will populate only from verified vehicle readings.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Pid({
  label,
  value,
  unit,
  alert,
}: {
  label: string;
  value: number;
  unit: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-sm border bg-panel px-3 py-2 ${
        alert ? "border-destructive/60" : "border-border"
      }`}
    >
      <div className="label-tech">{label}</div>
      <div className={`readout text-sm ${alert ? "text-destructive" : "text-signal"}`}>
        {value}
        <span className="ml-1 text-[0.65rem] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
