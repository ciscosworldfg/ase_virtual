import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AudioLines,
  Cable,
  ClipboardList,
  Gauge,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { QuickDemo } from "@/components/ase/QuickDemo";
import { SiteNav } from "@/components/ase/SiteNav";
import { SCENARIOS } from "@/lib/sim/scenarios";
import { vehicleById, vehicleName } from "@/lib/sim/vehicles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ASE Virtual — Automotive Diagnostic & Skills Studio" },
      {
        name: "description",
        content:
          "An AI-era virtual automotive laboratory: hear the vehicle, drive it, scan it, measure it, and prove the root cause before you touch a wrench.",
      },
      { property: "og:title", content: "ASE Virtual — Master the diagnosis before you touch the car" },
      {
        property: "og:description",
        content:
          "Virtual test drives, OBD-II live data, multimeter testing and evidence-based diagnostic scoring for ASE-aligned training.",
      },
    ],
  }),
  component: Landing,
});

const flow = [
  { icon: ClipboardList, title: "Customer complaint", body: "Interview a virtual customer who describes symptoms — never the diagnosis." },
  { icon: Gauge, title: "Virtual test drive", body: "Drive the vehicle, watch the cluster, feel the fault appear under load." },
  { icon: Activity, title: "Scan tool", body: "Read codes, freeze frame and live data that move with the simulation." },
  { icon: Cable, title: "Measure it", body: "Place multimeter probes on real test points and interpret voltage drop." },
  { icon: Wrench, title: "Prove the cause", body: "Choose cause, confirmation test and repair — guessing scores lower." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <section className="hero-surface relative overflow-hidden border-b border-border">
        <div className="tech-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:py-28">
          <p className="label-tech text-primary">The AI-powered virtual automotive diagnostic laboratory</p>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Master the diagnosis before you touch the car.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Diagnose real-world problems, test vehicles, interpret scan data, and build
            technician-level skill in a simulator that scores your reasoning — not your guessing.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/onboarding"
              className="rounded-sm bg-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start diagnostic training
            </Link>
            <Link
              to="/scenarios"
              className="rounded-sm border border-border bg-card px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.14em] transition-colors hover:bg-accent"
            >
              Explore the simulator
            </Link>
          </div>

          <div className="mt-14 grid gap-3 sm:grid-cols-3 lg:max-w-3xl">
            {[
              { k: "Simulated systems", v: "16" },
              { k: "Scoring dimensions", v: "6" },
              { k: "ASE-aligned areas", v: "A1–A8 + L1" },
            ].map((s) => (
              <div key={s.k} className="panel-instrument px-5 py-4">
                <div className="readout text-2xl font-semibold text-primary">{s.v}</div>
                <div className="label-tech mt-1">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
              Try a diagnosis right now
            </h2>
            <p className="mt-2 text-muted-foreground">
              No account, no setup. Work one real fault from complaint to root cause in about a
              minute — then take the same car into the full simulator with the scan tool,
              multimeter and test drive.
            </p>
          </div>
          <QuickDemo />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
          One loop, done properly
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every scenario walks the same professional sequence. The platform tracks which evidence
          you actually gathered before you committed to an answer.
        </p>
        <ol className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {flow.map((f, i) => (
            <li key={f.title} className="panel-instrument p-5">
              <div className="flex items-center justify-between">
                <f.icon className="h-5 w-5 text-signal" />
                <span className="readout text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-4 font-display text-base font-semibold uppercase tracking-wide">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-panel">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
                Live scenario library
              </h2>
              <p className="mt-2 text-muted-foreground">
                Curated vehicle configurations with independently modeled failures.
              </p>
            </div>
            <Link to="/scenarios" className="text-sm font-semibold text-primary hover:underline">
              View all scenarios →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {SCENARIOS.map((s) => {
              const v = vehicleById(s.vehicleId);
              return (
                <Link
                  key={s.id}
                  to="/scenario/$scenarioId"
                  params={{ scenarioId: s.id }}
                  className="panel-instrument group p-5 transition-colors hover:border-primary/60"
                >
                  <span className="label-tech text-signal">{s.category} · {s.difficulty}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold leading-tight">{s.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">{v ? vehicleName(v) : ""}</p>
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{s.complaint}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="panel-instrument p-6">
            <AudioLines className="h-5 w-5 text-primary" />
            <h3 className="mt-4 font-display text-lg font-semibold uppercase tracking-wide">
              Synthesized engine audio
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sound responds to RPM, throttle, load and the injected failure. All audio in this MVP
              is generated in-browser and clearly labeled as synthetic — it is not a recording of a
              real vehicle.
            </p>
          </div>
          <div className="panel-instrument p-6">
            <ShieldAlert className="h-5 w-5 text-caution" />
            <h3 className="mt-4 font-display text-lg font-semibold uppercase tracking-wide">
              Simulation, not a repair manual
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              ASE Virtual is independent ASE-aligned preparation and training software. It is not
              affiliated with or endorsed by ASE, and it does not issue certification. Always follow
              manufacturer service information and safety procedures on a real vehicle.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        ASE Virtual · Educational simulation software · ASE-aligned preparation, not official ASE
        certification
      </footer>
    </div>
  );
}
