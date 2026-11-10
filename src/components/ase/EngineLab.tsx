import { useState } from "react";
import { Activity, Droplets, Flame, Gauge, Wind } from "lucide-react";

type System = "air" | "fuel" | "coolant" | "oil";
type Part = { id: string; name: string; role: string; check: string };

const PARTS: Part[] = [
  { id: "intake", name: "Intake manifold", role: "Distributes measured air to each cylinder.", check: "Inspect ducting, gaskets, vacuum hoses and manifold pressure." },
  { id: "maf", name: "Mass-airflow sensor (MAF)", role: "Measures incoming air mass for load and fueling calculations.", check: "Compare MAF g/s with engine displacement, RPM and known-good service data." },
  { id: "coil", name: "Ignition coils", role: "Raise battery voltage to the level needed to fire each spark plug.", check: "Check misfire counters, coil power/ground and the OEM test procedure." },
  { id: "injector", name: "Fuel injectors", role: "Meter fuel into each intake port or cylinder, depending on design.", check: "Check injector command, electrical integrity and fuel-pressure specifications." },
  { id: "coolant", name: "Coolant outlet", role: "Routes hot coolant toward the radiator and thermostat circuit.", check: "Compare scan-tool coolant temperature with an independent temperature measurement." },
  { id: "belt", name: "Accessory drive", role: "Transfers crankshaft rotation to accessories such as the alternator and water pump on belt-driven designs.", check: "Inspect belt condition, tension, pulley alignment and noise." },
  { id: "crank", name: "Crankshaft and pistons", role: "Convert combustion pressure into rotating mechanical output.", check: "Use the specified compression or relative-compression procedure if a cylinder concern is suspected." },
];

export function EngineLab({ running, rpm, coolant, load, vehicle, onUse }: {
  running: boolean; rpm: number; coolant: number; load: number; vehicle: string; onUse: () => void;
}) {
  const [selected, setSelected] = useState("crank");
  const [system, setSystem] = useState<System>("air");
  const [explode, setExplode] = useState(0);
  const [motion, setMotion] = useState(true);
  const part = PARTS.find((p) => p.id === selected) ?? PARTS[0];
  const systems: { id: System; label: string; icon: typeof Wind; color: string }[] = [
    { id: "air", label: "Air", icon: Wind, color: "#38bdf8" },
    { id: "fuel", label: "Fuel", icon: Flame, color: "#f59e0b" },
    { id: "coolant", label: "Coolant", icon: Droplets, color: "#22d3ee" },
    { id: "oil", label: "Oil", icon: Activity, color: "#facc15" },
  ];
  const selectedSystem = systems.find((s) => s.id === system)!;

  return (
    <section className="panel-instrument overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-panel px-4 py-3">
        <div>
          <p className="label-tech text-primary">Interactive powertrain lab</p>
          <h2 className="font-display text-lg font-bold uppercase tracking-[0.14em]">3D engine explorer</h2>
        </div>
        <span className={`label-tech ${running ? "text-ok" : "text-muted-foreground"}`}>
          {running ? "ENGINE RUNNING" : "ENGINE OFF"} · {Math.round(rpm).toLocaleString()} RPM
        </span>
      </header>
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.8fr)]">
        <div className="min-w-0 border-b border-border p-3 sm:p-5 xl:border-b-0 xl:border-r">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {systems.map((s) => {
                const Icon = s.icon;
                return <button key={s.id} onClick={() => { setSystem(s.id); onUse(); }} className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-xs font-semibold ${system === s.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"}`}><Icon className="h-3.5 w-3.5" />{s.label}</button>;
              })}
            </div>
            <button onClick={() => { setMotion((v) => !v); onUse(); }} className="rounded-sm border border-border px-2.5 py-1.5 text-xs">{motion ? "Pause motion" : "Resume motion"}</button>
          </div>
          <div className="relative overflow-hidden rounded-md border border-border bg-[#07111d]" style={{ perspective: "1000px" }}>
            <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(#17304a 1px, transparent 1px), linear-gradient(90deg, #17304a 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative mx-auto aspect-[1.2/1] w-full max-w-[760px]" style={{ transform: "rotateX(2deg)" }}>
              <svg viewBox="0 0 720 590" role="img" aria-label={`Interactive engine model with selectable components and ${system} flow highlighted`} className="h-full w-full">
                <defs>
                  <linearGradient id="block-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8ca2b7"/><stop offset=".48" stopColor="#40566b"/><stop offset="1" stopColor="#1d2b3b"/></linearGradient>
                  <linearGradient id="head-metal" x1="0" y1="0" x2="0.9" y2="1"><stop offset="0" stopColor="#c3d0dc"/><stop offset=".5" stopColor="#657b8e"/><stop offset="1" stopColor="#2c3d4e"/></linearGradient>
                  <linearGradient id="dark-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#50677b"/><stop offset="1" stopColor="#172433"/></linearGradient>
                  <filter id="engine-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="12" stdDeviation="9" floodColor="#000" floodOpacity=".45"/></filter>
                </defs>
                <g filter="url(#engine-shadow)" transform={`translate(0 ${explode * -0.08})`}>
                  <path d="M145 218 L238 154 L531 191 L590 241 L590 402 L500 465 L209 429 L145 376Z" fill="#111e2d" stroke="#5c7389" strokeWidth="3"/>
                  <path d="M145 218 L438 249 L531 191 L238 154Z" fill="#8297aa" stroke="#b6c5d1" strokeWidth="2"/>
                  <path d="M438 249 L531 191 L590 241 L500 300Z" fill="#293b4d" stroke="#71869a" strokeWidth="2"/>
                  <path d="M145 218 L438 249 L438 425 L145 376Z" fill="url(#block-metal)" stroke="#a4b6c5" strokeWidth="2"/>
                  <path d="M438 249 L500 300 L500 465 L438 425Z" fill="#243648" stroke="#71869a" strokeWidth="2"/>
                  <path d="M165 206 L244 142 L540 179 L586 222 L501 278 L208 245Z" fill="url(#head-metal)" stroke="#c0ced8" strokeWidth="3" transform={`translate(0 ${-explode * .42})`}/>
                  <path d="M191 202 L256 164 L514 195 L550 222 L487 259 L229 230Z" fill="#1a2a3a" stroke="#8ea2b5" strokeWidth="2" transform={`translate(0 ${-explode * .42})`}/>
                  {[0,1,2,3].map((i) => {
                    const x = 245 + i * 67;
                    const pistonY = 276;
                    return <g key={i} style={{ animation: motion && running ? "engine-piston .55s ease-in-out infinite alternate" : "none", animationDelay: `${i * -0.12}s`, transformBox: "fill-box", transformOrigin: "center" }}>
                      <path d={`M${x-22} 240 l13 -14 h28 l13 14 v110 l-12 12 h-30 l-12 -12Z`} fill="#152433" stroke="#91a5b8" strokeWidth="2" transform={`translate(0 ${-explode * .42})`}/>
                      <rect x={x-16} y={pistonY} width="32" height="50" rx="4" fill="url(#head-metal)" stroke="#d1dbe4" strokeWidth="2"/>
                      <path d={`M${x-13} ${pistonY+8} h26 M${x-13} ${pistonY+14} h26`} stroke="#2c4154" strokeWidth="3"/>
                      <path d={`M${x} ${pistonY+50} L${x+((i%2)?10:-10)} 408`} stroke="#aab9c6" strokeWidth="10" strokeLinecap="round"/>
                      <path d={`M${x} ${pistonY+50} L${x+((i%2)?10:-10)} 408`} stroke="#50677b" strokeWidth="5" strokeLinecap="round"/>
                      <circle cx={x+((i%2)?10:-10)} cy="408" r="12" fill="#182736" stroke="#bdcbd6" strokeWidth="4"/>
                    </g>;
                  })}
                  <path d="M204 414 Q280 438 362 411 T482 414 L482 452 Q350 478 204 444Z" fill="#172738" stroke="#8297aa" strokeWidth="3"/>
                  <path d="M205 430 Q270 448 337 430 T482 430" fill="none" stroke="#c0ced8" strokeWidth="9" strokeLinecap="round"/>
                  <g style={{ transformOrigin: "345px 430px", animation: motion && running ? "engine-crank-spin .7s linear infinite" : "none" }}>
                    <circle cx="345" cy="430" r="24" fill="#172637" stroke="#9fb0be" strokeWidth="7"/>
                    <circle cx="345" cy="430" r="7" fill="#d4dee6"/>
                    <path d="M345 408 L360 385 L378 392 L370 419Z" fill="#72889b" stroke="#d4dee6" strokeWidth="3"/>
                  </g>
                  <g transform={`translate(0 ${-explode * .8})`}>
                    <path d="M182 188 L211 161 L235 171 L205 198Z M470 223 L501 195 L525 205 L495 233Z" fill="#111d2a" stroke="#9aabba" strokeWidth="3"/>
                    <path d="M205 168 L237 142 L270 147 L238 176Z" fill="#25394b" stroke="#9aabba" strokeWidth="2"/>
                    <path d="M440 205 L469 181 L501 188 L472 214Z" fill="#25394b" stroke="#9aabba" strokeWidth="2"/>
                    {[0,1,2,3].map(i => <g key={i} transform={`translate(${225+i*66} ${152-i*1})`}>
                      <rect x="-13" y="-18" width="26" height="53" rx="5" fill={selected === "coil" ? "#38bdf8" : "#152332"} stroke={selected === "coil" ? "#7dd3fc" : "#8ca2b7"} strokeWidth="2"/>
                      <path d="M-7 -10 H7 M-7 -2 H7" stroke="#b7c6d2" strokeWidth="2"/>
                    </g>)}
                  </g>
                  <g transform={`translate(0 ${-explode * .55})`} onClick={() => setSelected("intake")} style={{ cursor: "pointer" }}>
                    <path d="M193 145 Q185 104 222 100 L251 110 L272 134 L253 154 L229 142Z M267 153 Q264 113 300 112 L330 123 L345 146 L323 164 L300 151Z M343 161 Q342 121 378 125 L408 136 L421 159 L400 176 L378 163Z M419 171 Q420 134 455 139 L484 151 L497 173 L475 190 L454 177Z" fill={selected === "intake" ? "#38bdf8" : "url(#dark-metal)"} stroke="#a5b7c6" strokeWidth="3"/>
                    <path d="M209 113 L243 124 M284 126 L318 137 M359 139 L393 150 M436 152 L470 163" stroke="#d2dce5" strokeWidth="3" opacity=".75"/>
                  </g>
                  <g onClick={() => setSelected("maf")} style={{ cursor: "pointer" }}>
                    <path d="M91 166 L176 181 L191 207 L179 231 L93 215Z" fill={selected === "maf" ? "#38bdf8" : "#26394b"} stroke="#9eb1c2" strokeWidth="3"/>
                    <path d="M58 184 L91 166 L93 215 L61 234Z" fill="#152333" stroke="#7d92a6" strokeWidth="3"/>
                    <rect x="104" y="183" width="55" height="23" rx="4" fill="#101c29" stroke="#9eb1c2" strokeWidth="2"/>
                    <path d="M115 188 v13 m8 -13 v13 m8 -13 v13 m8 -13 v13" stroke="#38bdf8" strokeWidth="2"/>
                  </g>
                  <g onClick={() => setSelected("coolant")} style={{ cursor: "pointer" }}>
                    <path d="M503 241 L543 218 L565 232 L526 258Z" fill={selected === "coolant" ? "#22d3ee" : "#344c61"} stroke="#a5b7c6" strokeWidth="3"/>
                    <path d="M542 219 L568 207 L590 221 L565 233Z" fill="#263b4e" stroke="#a5b7c6" strokeWidth="2"/>
                  </g>
                  <g onClick={() => setSelected("belt")} style={{ cursor: "pointer" }}>
                    <path d="M490 300 C570 285 598 336 570 377 C552 404 519 398 509 375" fill="none" stroke={selected === "belt" ? "#38bdf8" : "#111820"} strokeWidth="17"/>
                    <path d="M490 300 C570 285 598 336 570 377 C552 404 519 398 509 375" fill="none" stroke="#71869a" strokeWidth="2" strokeDasharray="4 4"/>
                    <circle cx="505" cy="304" r="22" fill="#1c2d3d" stroke="#b3c2ce" strokeWidth="6"/>
                    <circle cx="570" cy="367" r="26" fill="#1c2d3d" stroke="#b3c2ce" strokeWidth="6"/>
                    <circle cx="570" cy="367" r="7" fill="#b3c2ce"/>
                  </g>
                  {system === "air" && <g fill="none" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" strokeDasharray="10 9" style={{ animation: motion ? "engine-flow 1.2s linear infinite" : "none" }}><path d="M77 197 L155 203 L205 178 L278 158"/><path d="M275 158 L298 151 M275 158 L290 174"/></g>}
                  {system === "fuel" && <g fill="none" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" strokeDasharray="5 8" style={{ animation: motion ? "engine-flow .8s linear infinite" : "none" }}><path d="M218 151 L233 184 L245 224 L245 260 M284 151 L299 190 L312 226 L312 260 M350 161 L365 194 L379 226 L379 260 M417 171 L432 202 L446 232 L446 260"/></g>}
                  {system === "coolant" && <g fill="none" stroke="#22d3ee" strokeWidth="7" strokeLinecap="round" strokeDasharray="9 7" style={{ animation: motion ? "engine-flow 1s linear infinite" : "none" }}><path d="M550 230 L516 252 L497 285 L497 357 L466 385 L439 385"/><path d="M497 285 L467 267"/></g>}
                  {system === "oil" && <g fill="none" stroke="#facc15" strokeWidth="6" strokeLinecap="round" strokeDasharray="3 8" style={{ animation: motion ? "engine-flow 1.6s linear infinite" : "none" }}><path d="M217 443 L217 394 L245 370 L245 324 M217 394 L312 394 L312 324 M312 394 L379 394 L379 324 M379 394 L446 394 L446 324"/></g>}
                  <g fontFamily="monospace" fontSize="12" fontWeight="bold" fill="#e5edf4">
                    <text x="26" y="45">ENGINE ASSEMBLY</text><text x="26" y="63" fill="#8ea6ba" fontWeight="normal">{vehicle}</text>
                    <text x="520" y="45" fill={running ? "#4ade80" : "#94a3b8"}>{running ? "RUNNING" : "STOPPED"}</text>
                    <text x="520" y="63" fill="#8ea6ba" fontWeight="normal">{Math.round(rpm)} RPM</text>
                    <text x="26" y="555" fill={selectedSystem.color}>{selectedSystem.label.toUpperCase()} FLOW</text>
                    <text x="520" y="555" fill="#8ea6ba" fontWeight="normal">LOAD {Math.round(load)}%</text>
                  </g>
                  <g fontFamily="monospace" fontSize="11" fill="#dbeafe">
                    <path d="M118 238 L105 274 L40 274" stroke="#38bdf8" strokeWidth="1.5" fill="none"/><text x="30" y="290">MAF SENSOR</text>
                    <path d="M450 185 L525 132 L594 132" stroke="#38bdf8" strokeWidth="1.5" fill="none"/><text x="530" y="121">IGNITION</text>
                    <path d="M564 348 L620 414 L678 414" stroke="#38bdf8" strokeWidth="1.5" fill="none"/><text x="585" y="432">DRIVE BELT</text>
                  </g>
                </g>
              </svg>
            </div>
            <style>{`@keyframes engine-flow { to { stroke-dashoffset: -38; } } @keyframes engine-piston { from { transform: translateY(-9px); } to { transform: translateY(9px); } } @keyframes engine-crank-spin { to { transform: rotate(360deg); } }`}</style>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#24384b] bg-[#0b1826] px-3 py-2 text-[11px] text-slate-300">
              <span>Illustrative inline model · not an OEM CAD model</span>
              <span>Explode assembly: {explode}%</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label htmlFor="engine-explode" className="text-xs font-semibold text-muted-foreground">Exploded view</label>
            <input id="engine-explode" aria-label="Exploded engine assembly" type="range" min="0" max="100" value={explode} onChange={(e) => { setExplode(Number(e.target.value)); onUse(); }} className="min-w-32 flex-1 accent-primary" />
            <button onClick={() => { setExplode(0); onUse(); }} className="rounded-sm border border-border px-2.5 py-1.5 text-xs">Reset</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {PARTS.map((p) => <button key={p.id} onClick={() => { setSelected(p.id); onUse(); }} className={`rounded-sm border px-2.5 py-1.5 text-xs ${selected === p.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent"}`}>{p.name}</button>)}
          </div>
        </div>
        <aside className="space-y-4 p-4 sm:p-5">
          <div className="rounded-sm border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-primary"><Gauge className="h-4 w-4"/><span className="label-tech">Live simulation state</span></div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div><p className="text-xs text-muted-foreground">Engine speed</p><p className="readout text-xl">{Math.round(rpm).toLocaleString()} <span className="text-xs">RPM</span></p></div>
              <div><p className="text-xs text-muted-foreground">Coolant</p><p className="readout text-xl">{Math.round(coolant)} <span className="text-xs">°C</span></p></div>
              <div><p className="text-xs text-muted-foreground">Calculated load</p><p className="readout text-xl">{Math.round(load)} <span className="text-xs">%</span></p></div>
              <div><p className="text-xs text-muted-foreground">Crank motion</p><p className="readout text-xl">{running && motion ? "ACTIVE" : "STOPPED"}</p></div>
            </div>
          </div>
          <div>
            <p className="label-tech text-primary">Selected component</p>
            <h3 className="mt-1 font-display text-xl font-bold uppercase">{part.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{part.role}</p>
            <div className="mt-4 rounded-sm border border-border bg-panel p-3">
              <p className="label-tech">Diagnostic learning checkpoint</p>
              <p className="mt-1 text-sm">{part.check}</p>
            </div>
          </div>
          <div className="rounded-sm border border-caution/40 bg-caution/5 p-3">
            <p className="text-xs font-semibold text-caution">Training model limitation</p>
            <p className="mt-1 text-xs text-muted-foreground">Component layout is a generic educational illustration. Confirm engine-specific locations, wiring and test limits using the vehicle manufacturer's service information.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
