import { useEffect, useMemo, useRef, useState } from "react";
import { Gauge, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Cluster } from "./Cluster";
import { EngineAudio, cylinderCount } from "@/lib/sim/audio";
import { computeLiveData, initialState, stepSim, type SimState } from "@/lib/sim/engine";
import type { Scenario, Vehicle } from "@/lib/sim/types";

export function TestDrive({
  scenario,
  vehicle,
  state,
  setState,
  onUse,
}: {
  scenario: Scenario;
  vehicle: Vehicle;
  state: SimState;
  setState: (updater: (s: SimState) => SimState) => void;
  onUse: () => void;
}) {
  const [audioOn, setAudioOn] = useState(false);
  const [perspective, setPerspective] = useState<"cabin" | "exterior">("cabin");
  const [distance, setDistance] = useState(6);
  const audio = useRef<EngineAudio | null>(null);
  const data = useMemo(
    () => computeLiveData(state, vehicle, scenario.failure),
    [state, vehicle, scenario.failure],
  );

  useEffect(() => {
    onUse();
  }, [onUse]);

  useEffect(() => {
    if (!audioOn) {
      audio.current?.stop();
      audio.current = null;
      return;
    }
    const engine = new EngineAudio();
    engine.start(cylinderCount(vehicle.layout));
    audio.current = engine;
    return () => {
      engine.stop();
      audio.current = null;
    };
  }, [audioOn, vehicle.layout]);

  useEffect(() => {
    audio.current?.update({
      rpm: state.rpm,
      throttle: state.throttle,
      load: data.load,
      speed: state.speed,
      cylinders: cylinderCount(vehicle.layout),
      running: state.running,
      profileId: scenario.audioProfile.id,
      gear: data.gear,
      shifting: data.shifting,
      slip: data.slip,
      drivelineHz: data.drivelineHz,
      perspective,
      distance,
    });
  }, [
    state,
    data.load,
    data.gear,
    data.shifting,
    data.slip,
    data.drivelineHz,
    scenario.audioProfile.id,
    vehicle.layout,
    perspective,
    distance,
  ]);

  useEffect(() => {
    if (!state.running) return;
    const id = window.setInterval(() => {
      setState((s) => stepSim(s, vehicle, scenario.failure, 0.1));
    }, 100);
    return () => window.clearInterval(id);
  }, [state.running, setState, vehicle, scenario.failure]);

  const triggered = scenario.testDriveEvents.filter((e) => e.atSecond <= state.elapsed);
  const activeWarnings = state.running ? scenario.warningLights : [];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <div className="panel-instrument overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-panel px-4 py-3">
          <span className="font-display text-sm font-bold uppercase tracking-[0.18em]">
            Virtual test drive
          </span>
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-sm border border-border text-xs">
              {(["cabin", "exterior"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPerspective(p)}
                  className={`px-2.5 py-1 capitalize ${
                    perspective === p
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setAudioOn((a) => !a)}
              className="flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent"
            >
              {audioOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              {audioOn ? "Audio on" : "Audio off"}
            </button>
          </div>
        </div>


        <Road speed={state.speed} running={state.running} />

        <div className="border-t border-border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                setState((s) => ({ ...s, running: !s.running, throttle: 0, elapsed: s.elapsed }))
              }
              className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground"
            >
              {state.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {state.running ? "Stop engine" : "Start engine"}
            </button>
            <button
              onClick={() => setState(() => initialState(vehicle))}
              className="flex items-center gap-2 rounded-sm border border-border px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] hover:bg-accent"
            >
              <RotateCcw className="h-4 w-4" /> Repeat drive
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="label-tech">Accelerator</span>
                <span className="readout text-xs text-primary">{state.throttle}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={state.throttle}
                disabled={!state.running}
                onChange={(e) => setState((s) => ({ ...s, throttle: Number(e.target.value) }))}
                className="mt-2 w-full accent-[var(--primary)]"
              />
            </div>
            <div>
              <span className="label-tech">Brake</span>
              <button
                onMouseDown={() => setState((s) => ({ ...s, brake: true, throttle: 0 }))}
                onMouseUp={() => setState((s) => ({ ...s, brake: false }))}
                onMouseLeave={() => setState((s) => ({ ...s, brake: false }))}
                onTouchStart={() => setState((s) => ({ ...s, brake: true, throttle: 0 }))}
                onTouchEnd={() => setState((s) => ({ ...s, brake: false }))}
                className={`mt-2 w-full rounded-sm border px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] ${
                  state.brake
                    ? "border-destructive bg-destructive/20 text-destructive"
                    : "border-border hover:bg-accent"
                }`}
              >
                Hold to brake
              </button>
            </div>
          </div>

          <p className="mt-4 rounded-sm border border-border bg-panel px-3 py-2 text-xs text-muted-foreground">
            <Gauge className="mr-1.5 inline h-3.5 w-3.5 text-signal" />
            Audio profile: <strong>{scenario.audioProfile.label}</strong> —{" "}
            {scenario.audioProfile.description}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Cluster
          data={data}
          vehicle={vehicle}
          warningLights={activeWarnings}
          running={state.running}
        />
        <div className="panel-instrument p-4">
          <span className="label-tech">Drive observations</span>
          <ul className="mt-3 space-y-2">
            {triggered.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Start the engine and drive to observe symptoms.
              </li>
            )}
            {triggered.map((e) => (
              <li key={e.label} className="rounded-sm border border-border bg-panel px-3 py-2">
                <span className="text-sm font-semibold">{e.label}</span>
                <p className="text-xs text-muted-foreground">{e.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Road({ speed, running }: { speed: number; running: boolean }) {
  const duration = Math.max(0.25, 6 - Math.min(5.6, speed / 22));
  return (
    <div className="relative h-56 overflow-hidden bg-[linear-gradient(180deg,oklch(0.24_0.02_252),oklch(0.17_0.012_250))] sm:h-72">
      <div className="absolute inset-x-0 top-1/3 h-px bg-border" />
      <div className="absolute inset-x-0 bottom-0 top-1/3 bg-[linear-gradient(180deg,oklch(0.2_0.008_250),oklch(0.14_0.006_250))]">
        <div
          className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,var(--color-muted-foreground)_0_28px,transparent_28px_70px)] opacity-70"
          style={
            running && speed > 1
              ? { animation: `road ${duration}s linear infinite` }
              : undefined
          }
        />
      </div>
      <style>{`@keyframes road { from { background-position-y: 0 } to { background-position-y: 98px } }`}</style>
      <div className="absolute left-4 top-4">
        <span className="label-tech">{running ? "Simulation active" : "Vehicle stationary"}</span>
      </div>
    </div>
  );
}
