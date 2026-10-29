import { useEffect, useRef, useState } from "react";
import { Cable, CircleStop, RotateCw } from "lucide-react";
import { Elm327Client, type Transport } from "@/lib/elm327";
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
  const [cleared, setCleared] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [history, setHistory] = useState<{ t: number; stft: number; ltft: number; rpm: number }[]>(
    [],
  );
  const tick = useRef(0);
  const [elm] = useState(() => new Elm327Client());
  const [, setElmRevision] = useState(0);
  const [transport, setTransport] = useState<Transport>("websocket");
  const [bridgeUrl, setBridgeUrl] = useState("ws://localhost:35001");
  const [elmBusy, setElmBusy] = useState(false);

  useEffect(() => {
    const unsubscribe = elm.subscribe(() => setElmRevision((v) => v + 1));
    return () => {
      unsubscribe();
      void elm.disconnect();
    };
  }, [elm]);

  const connectElm = async () => {
    if (
      transport === "websocket" &&
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      bridgeUrl.startsWith("ws://") &&
      !/^ws:\/\/(localhost|127\.0\.0\.1)(:|\/)/i.test(bridgeUrl)
    ) {
      elm.lastError =
        "HTTPS blocks insecure ws:// connections to another device. Use a secure wss:// tunnel or test from a local development page.";
      setElmRevision((v) => v + 1);
      return;
    }
    setElmBusy(true);
    try {
      await elm.connect(transport, bridgeUrl);
    } finally {
      setElmBusy(false);
    }
  };

  const readElmCodes = async () => {
    setElmBusy(true);
    try {
      await elm.readTroubleCodes();
    } catch (error) {
      elm.lastError = error instanceof Error ? error.message : String(error);
      setElmRevision((v) => v + 1);
    } finally {
      setElmBusy(false);
    }
  };

  const clearElmCodes = async () => {
    if (
      !window.confirm(
        "Clear diagnostic trouble codes from the vehicle ECU? This can erase freeze-frame evidence and does not repair the cause.",
      )
    )
      return;
    setElmBusy(true);
    try {
      await elm.clearTroubleCodes();
    } catch (error) {
      elm.lastError = error instanceof Error ? error.message : String(error);
      setElmRevision((v) => v + 1);
    } finally {
      setElmBusy(false);
    }
  };

  useEffect(() => {
    onUse();
  }, [onUse]);

  useEffect(() => {
    tick.current += 1;
    setHistory((h) =>
      [...h, { t: tick.current, stft: data.stft, ltft: data.ltft, rpm: data.rpm }].slice(-60),
    );
  }, [data]);

  return (
    <div className="space-y-4">
      <section className="panel-instrument overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-panel px-4 py-3">
          <div className="flex items-center gap-2">
            <Cable className="h-4 w-4 text-primary" />
            <span className="font-display text-sm font-bold uppercase tracking-[0.18em]">
              Live ELM327 adapter
            </span>
          </div>
          <span
            className={`label-tech ${elm.status === "connected" ? "text-ok" : elm.status === "error" ? "text-destructive" : "text-muted-foreground"}`}
          >
            {elm.status.toUpperCase()} · {elm.telemetry.protocol}
          </span>
        </div>
        <div className="space-y-3 p-4">
          <p className="text-sm text-muted-foreground">
            The standard simulator below remains available. Choose a real adapter only when the
            vehicle is safely parked and the adapter is connected.
          </p>
          <div className="grid gap-2 sm:grid-cols-[10rem_1fr_auto]">
            <select
              aria-label="ELM327 connection type"
              value={transport}
              onChange={(e) => setTransport(e.target.value as Transport)}
              className="rounded-sm border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="websocket">Wi-Fi bridge</option>
              <option value="ble">Bluetooth LE</option>
              <option value="simulator">OBD simulator</option>
            </select>
            {transport === "websocket" ? (
              <input
                aria-label="WebSocket bridge address"
                value={bridgeUrl}
                onChange={(e) => setBridgeUrl(e.target.value)}
                placeholder="ws://localhost:35001"
                className="min-w-0 rounded-sm border border-border bg-background px-3 py-2 text-sm"
              />
            ) : (
              <div className="flex items-center rounded-sm border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                {transport === "ble"
                  ? "Bluetooth LE compatible adapter + supported browser required."
                  : "Synthetic values only — not vehicle data."}
              </div>
            )}
            <button
              disabled={elmBusy || elm.status === "connected" || elm.status === "connecting"}
              onClick={() => void connectElm()}
              className="rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {elmBusy || elm.status === "connecting" ? "Connecting…" : "Connect"}
            </button>
          </div>
          {elm.status === "connected" && (
            <div className="flex flex-wrap gap-2">
              <button
                disabled={elmBusy}
                onClick={() => void readElmCodes()}
                className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-semibold hover:bg-accent disabled:opacity-50"
              >
                <RotateCw className="h-3.5 w-3.5" /> Read stored + pending codes
              </button>
              <button
                disabled={elmBusy}
                onClick={() => void clearElmCodes()}
                className="rounded-sm border border-destructive/50 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                Clear ECU codes…
              </button>
              <button
                disabled={elmBusy}
                onClick={() => void elm.disconnect()}
                className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-semibold hover:bg-accent disabled:opacity-50"
              >
                <CircleStop className="h-3.5 w-3.5" /> Disconnect
              </button>
            </div>
          )}
          {elm.lastError && (
            <p
              role="alert"
              className="rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {elm.lastError}
            </p>
          )}
          {elm.status === "connected" && (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Pid label="ECU RPM" value={elm.telemetry.rpm} unit="rpm" />
                <Pid label="ECU speed" value={elm.telemetry.speed} unit="km/h" />
                <Pid label="Coolant" value={elm.telemetry.coolant} unit="°C" />
                <Pid label="Engine load" value={elm.telemetry.load} unit="%" />
                <Pid label="MAF" value={elm.telemetry.maf} unit="g/s" />
                <Pid
                  label="STFT"
                  value={elm.telemetry.shortTrim}
                  unit="%"
                  alert={elm.telemetry.shortTrim !== null && Math.abs(elm.telemetry.shortTrim) > 10}
                />
                <Pid
                  label="LTFT"
                  value={elm.telemetry.longTrim}
                  unit="%"
                  alert={elm.telemetry.longTrim !== null && Math.abs(elm.telemetry.longTrim) > 10}
                />
                <Pid label="ECU voltage" value={elm.telemetry.voltage} unit="V" />
              </div>
              <p className="text-xs text-muted-foreground">
                {elm.telemetry.milOn === null
                  ? "MIL status not yet reported"
                  : elm.telemetry.milOn
                    ? "Check-engine MIL: ON"
                    : "Check-engine MIL: OFF"}
                {" · "}
                {elm.telemetry.dtcCount === null
                  ? "DTC count unavailable"
                  : `${elm.telemetry.dtcCount} DTC(s) reported by Mode 01 PID 01`}
                {" · "}Last ECU response:{" "}
                {elm.telemetry.heartbeatAt
                  ? new Date(elm.telemetry.heartbeatAt).toLocaleTimeString()
                  : "waiting"}
              </p>
              {elm.troubleCodes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider">
                    Vehicle-reported trouble codes
                  </h3>
                  {elm.troubleCodes.map((c) => (
                    <div
                      key={c.status + c.code}
                      className="rounded-sm border border-border bg-panel px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="readout font-semibold text-destructive">{c.code}</span>
                        <span className="label-tech text-caution">{c.status}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Read-only monitoring until you deliberately select “Clear ECU codes.” Live data
                availability depends on the vehicle and supported OBD-II PIDs.
              </p>
            </>
          )}
        </div>
      </section>
      <div className="panel-instrument overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-panel px-4 py-3">
          <span className="font-display text-sm font-bold uppercase tracking-[0.18em]">
            OBD-II Scan Tool
          </span>
          <span className="label-tech text-ok">Link established</span>
        </div>

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
              {cleared ? (
                <p className="text-sm text-muted-foreground">
                  Codes cleared. Note that clearing without repair also erases freeze frame
                  evidence.
                </p>
              ) : codes.length ? (
                codes.map((c) => (
                  <div key={c.code} className="rounded-sm border border-border bg-panel px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="readout text-lg font-semibold text-destructive">
                        {c.code}
                      </span>
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

              {!cleared && codes.length > 0 && (
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
              {Object.keys(freezeFrame).length ? (
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
                <Pid
                  label="Voltage"
                  value={data.batteryVoltage}
                  unit="V"
                  alert={data.batteryVoltage < 13.2}
                />
                <Pid
                  label="Misfires"
                  value={data.misfireCount}
                  unit="ct"
                  alert={data.misfireCount > 0}
                />
              </div>

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
            </div>
          )}
        </div>
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
  value: number | null;
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
        {value === null ? "—" : value}
        {value !== null && (
          <span className="ml-1 text-[0.65rem] text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
}