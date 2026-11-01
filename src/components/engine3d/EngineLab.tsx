import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, Eye, EyeOff, RotateCcw, Undo2 } from "lucide-react";
import {
  ENGINE_FAMILIES,
  FIX,
  RECOGNITION,
  UNSUPPORTED_FAMILIES,
  dtcTitle,
  partType,
} from "@/lib/engine3d/engine-data";
import type { EngineSceneController, LabelPos, PartInfo } from "@/lib/engine3d/scene";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    // Three.js r163+ requires WebGL 2; WebGL 1 alone is not sufficient.
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}

export function EngineLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctl = useRef<EngineSceneController | null>(null);
  const [family, setFamily] = useState("v6");
  const [parts, setParts] = useState<PartInfo[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [labels, setLabels] = useState<LabelPos[]>([]);
  const [explode, setExplode] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [virtualRpm, setVirtualRpm] = useState(850);
  const [virtualRunning, setVirtualRunning] = useState(true);
  const [faultCode, setFaultCode] = useState("P0302");

  useEffect(() => {
    if (!hasWebGL()) {
      setError("WebGL is not available on this browser or device. Try an up-to-date Chrome, Edge, Safari or Firefox, or turn on hardware acceleration.");
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAutoRotate(!reduced);
    let alive = true;
    import("@/lib/engine3d/scene")
      .then(({ createEngineScene }) => {
        if (!alive || !canvasRef.current) return;
        const c = createEngineScene(canvasRef.current, {
          reducedMotion: reduced,
          onSelect: setSelected,
          onParts: setParts,
          onLabels: setLabels,
        });
        c.setFamily("v6");
        ctl.current = c;
        setReady(true);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "The 3D engine could not start."));
    return () => {
      alive = false;
      ctl.current?.dispose();
      ctl.current = null;
    };
  }, []);

  useEffect(() => ctl.current?.setExplode(explode), [explode]);
  useEffect(() => ctl.current?.setAutoRotate(autoRotate), [autoRotate]);
  useEffect(() => ctl.current?.setShowLabels(showLabels), [showLabels]);
  useEffect(() => ctl.current?.setTelemetry({ rpm: virtualRpm, running: virtualRunning }), [virtualRpm, virtualRunning, ready]);
  useEffect(() => ctl.current?.setFaultCodes(faultCode ? [faultCode] : []), [faultCode, ready]);

  const chooseFamily = (id: string) => {
    setFamily(id);
    setExplode(0);
    ctl.current?.setFamily(id);
  };

  const fam = ENGINE_FAMILIES.find((f) => f.id === family)!;
  const sel = parts.find((p) => p.id === selected) ?? null;
  const anyRemoved = parts.some((p) => p.removed);

  return (
    <div className="space-y-4">
      <div role="note" className="flex items-start gap-2 rounded-sm border border-caution/60 bg-caution/10 px-3 py-2 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-caution" />
        <p>
          <strong>Generic instructional model.</strong> These are procedural recognition models, not OEM CAD. Shapes,
          dimensions, cylinder numbering and mounting locations are approximate and do not represent any specific
          vehicle. Always use vehicle-specific service information.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Engine family">
        {ENGINE_FAMILIES.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={family === f.id}
            onClick={() => chooseFamily(f.id)}
            disabled={!ready}
            className={`rounded-sm border px-3 py-1.5 text-sm font-medium ${
              family === f.id ? "border-primary bg-primary/15 text-primary" : "border-border bg-panel hover:bg-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
        {UNSUPPORTED_FAMILIES.map((f) => (
          <button key={f} type="button" disabled className="rounded-sm border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground opacity-60" title="No geometry yet">
            {f} · not supported yet
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-3">
          <div className="panel-instrument relative h-[58vh] min-h-[340px] overflow-hidden" data-scene-ready={ready ? "1" : undefined}>
            {error ? (
              <div role="alert" className="grid h-full place-items-center p-6 text-center">
                <div>
                  <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
                  <p className="mt-3 font-semibold">3D view unavailable</p>
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                  <p className="mt-2 text-sm text-muted-foreground">You can still browse the parts list and inspection details.</p>
                </div>
              </div>
            ) : (
              <>
                <canvas
                  ref={canvasRef}
                  className="h-full w-full touch-none"
                  aria-label={`Interactive 3D ${fam.label} engine model. Drag to rotate, pinch or scroll to zoom, tap a part to inspect it.`}
                  role="img"
                />
                {!ready && <div className="absolute inset-0 grid place-items-center label-tech">Loading 3D engine…</div>}
                <div className="pointer-events-none absolute inset-0">
                  {labels.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => ctl.current?.select(l.id)}
                      aria-label={`Inspect ${l.text}`}
                      style={{ left: l.x, top: l.y }}
                      className={`pointer-events-auto absolute max-w-[160px] truncate rounded-sm border px-2 py-1 text-xs ${
                        l.active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background/85 text-foreground"
                      }`}
                    >
                      {l.text}
                    </button>
                  ))}
                </div>
                <p className="label-tech pointer-events-none absolute bottom-2 left-3 text-[0.6rem]">
                  Drag rotate · pinch/scroll zoom · right-drag or shift-drag pan · tap to inspect
                </p>
              </>
            )}
          </div>

          <section className="panel-instrument space-y-3 p-3" aria-label="Virtual engine operation controls">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="label-tech">Virtual engine operation</h2>
                <p className="text-xs text-muted-foreground">Training simulation only — not live vehicle telemetry.</p>
              </div>
              <button type="button" aria-pressed={virtualRunning} onClick={() => setVirtualRunning((running) => !running)} className="rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-accent">
                {virtualRunning ? "Stop engine" : "Start engine"}
              </button>
            </div>
            <label className="flex items-center gap-3 text-sm">
              <span className="label-tech w-16 shrink-0">RPM</span>
              <input type="range" min={0} max={6000} step={50} value={virtualRpm} onChange={(e) => setVirtualRpm(Number(e.target.value))} disabled={!virtualRunning} className="w-full accent-primary" />
              <span className="readout w-20 text-right">{virtualRunning ? virtualRpm.toLocaleString() : 0} rpm</span>
            </label>
            <label className="flex flex-wrap items-center gap-2 text-sm">
              <span className="label-tech">Inject training fault</span>
              <select value={faultCode} onChange={(e) => setFaultCode(e.target.value)} className="min-w-0 flex-1 rounded-sm border border-border bg-background px-2 py-1.5">
                <option value="">No active fault</option>
                <option value="P0302">P0302 — Cylinder 2 misfire</option>
                <option value="P0101">P0101 — MAF range/performance</option>
                <option value="P0118">P0118 — Coolant temperature circuit high</option>
                <option value="P0335">P0335 — Crankshaft position sensor</option>
                <option value="P0522">P0522 — Oil pressure sensor low</option>
              </select>
            </label>
          </section>

          <div className="panel-instrument flex flex-wrap items-center gap-3 p-3">
            <label className="flex min-w-[200px] flex-1 items-center gap-2 text-sm">
              <span className="label-tech shrink-0">Exploded view</span>
              <input
                type="range"
                min={0}
                max={100}
                value={explode}
                onChange={(e) => setExplode(Number(e.target.value))}
                className="w-full accent-primary"
                aria-valuetext={`${explode}% separation`}
              />
              <span className="readout w-10 text-right text-xs">{explode}%</span>
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} /> Auto-rotate
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} /> Labels
            </label>
            <button type="button" onClick={() => ctl.current?.resetCamera()} className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-accent">
              <Camera className="h-4 w-4" /> Reset camera
            </button>
            <button type="button" onClick={() => { setExplode(0); ctl.current?.reset(); }} className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-accent">
              <RotateCcw className="h-4 w-4" /> Reset model
            </button>
            {anyRemoved && (
              <button type="button" onClick={() => ctl.current?.restoreAll()} className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
                <Undo2 className="h-4 w-4" /> Restore all parts
              </button>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="panel-instrument p-4" aria-live="polite">
            {sel ? (
              <>
                <h2 className="font-display text-lg font-bold">{sel.name}</h2>
                <p className="label-tech mt-1">Recognize it by</p>
                <p className="text-sm text-muted-foreground">{RECOGNITION[partType(sel.id)] ?? "Approximate educational component."}</p>
                <p className="mt-3 text-sm">{sel.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {sel.codes.length ? (
                    [...new Set(sel.codes)].map((c) => (
                      <span key={c} className="rounded-sm border border-border bg-panel px-2 py-1 text-xs">
                        <b className="readout">{c}</b> {dtcTitle(c)}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No direct DTC</span>
                  )}
                </div>
                {FIX[partType(sel.id)] && (
                  <>
                    <h3 className="label-tech mt-4">Test, then fix</h3>
                    <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm">
                      {FIX[partType(sel.id)]!.map((s) => <li key={s}>{s}</li>)}
                    </ol>
                    <p className="mt-2 text-xs text-muted-foreground">Generic procedure. Use vehicle-specific service information for specs.</p>
                  </>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {sel.fixed ? (
                    <p className="text-xs text-muted-foreground">Fixed in this model.</p>
                  ) : (
                    <>
                      <button type="button" onClick={() => ctl.current?.toggleRemove(sel.id)} className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-accent">
                        {sel.removed ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} {sel.removed ? "Restore part" : "Remove part"}
                      </button>
                      <button type="button" onClick={() => ctl.current?.isolate(sel.id)} className="rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-accent">
                        Isolate
                      </button>
                    </>
                  )}
                  <button type="button" onClick={() => ctl.current?.select(null)} className="rounded-sm px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent">
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-lg font-bold">{fam.label}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{fam.blurb}</p>
                <p className="mt-3 text-sm text-muted-foreground">Tap a part in the model or the list to inspect it.</p>
              </>
            )}
          </section>

          <section className="panel-instrument p-2">
            <h2 className="label-tech px-2 py-1">Parts ({parts.length})</h2>
            <ul className="max-h-[40vh] overflow-y-auto">
              {parts.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => ctl.current?.select(p.id)}
                    aria-current={p.id === selected ? "true" : undefined}
                    className={`w-full rounded-sm px-2 py-1.5 text-left text-sm ${
                      p.id === selected ? "bg-primary/15 text-primary" : "hover:bg-accent"
                    } ${p.removed ? "text-muted-foreground line-through" : ""}`}
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}