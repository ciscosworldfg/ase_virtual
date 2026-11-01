import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  Gauge,
  GraduationCap,
  ScanLine,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { SiteNav } from "@/components/ase/SiteNav";
import { SCENARIOS } from "@/lib/sim/scenarios";
import { vehicleById, vehicleName } from "@/lib/sim/vehicles";

export const Route = createFileRoute("/workshop")({
  head: () => ({
    meta: [
      { title: "Virtual Workshop | AISE Virtual" },
      {
        name: "description",
        content:
          "AISE Virtual workshop command center for vehicle intake, inspection, diagnostics, repair training, engine exploration and technician development.",
      },
      { property: "og:title", content: "Virtual Workshop | AISE Virtual" },
      {
        property: "og:description",
        content: "One connected automotive shop-training workflow.",
      },
    ],
  }),
  component: Workshop,
});

const stations = [
  {
    number: "01",
    title: "Service reception",
    subtitle: "Customer concern & vehicle intake",
    detail:
      "Start with the customer's concern, gather symptom history and select a training vehicle before deciding what is wrong.",
    icon: ClipboardList,
    to: "/scenarios" as const,
    action: "Open service intake",
  },
  {
    number: "02",
    title: "Inspection bay",
    subtitle: "Visual checks & guided inspection",
    detail:
      "Work through inspection findings and identify what needs to be measured instead of replacing parts based on a guess.",
    icon: ClipboardCheck,
    to: "/scenarios" as const,
    action: "Open inspection scenarios",
  },
  {
    number: "03",
    title: "Diagnostic bay",
    subtitle: "Scan data & electrical testing",
    detail:
      "Practice with the virtual scan tool, freeze-frame examples and multimeter test points inside the guided diagnostic sessions.",
    icon: ScanLine,
    to: "/dashboard" as const,
    action: "Open diagnostic dashboard",
  },
  {
    number: "04",
    title: "Engine laboratory",
    subtitle: "Interactive 3D component study",
    detail:
      "Rotate and inspect the generic engine model, select components, review related DTCs and follow test-before-repair guidance.",
    icon: Gauge,
    to: "/engine-lab" as const,
    action: "Enter 3D Engine Lab",
  },
  {
    number: "05",
    title: "Repair order & service desk",
    subtitle: "Diagnosis, estimate & verification",
    detail:
      "Complete the repair decision and service-desk steps within a scenario, then review the evidence and outcome.",
    icon: Wrench,
    to: "/scenarios" as const,
    action: "Open repair workflow",
  },
  {
    number: "06",
    title: "Technician development",
    subtitle: "ASE-aligned learning & progress",
    detail:
      "Study the A1–A8 learning areas, complete practice work and track your training progress.",
    icon: GraduationCap,
    to: "/study" as const,
    action: "Open Study Hub",
  },
];

function Workshop() {
  const featured = SCENARIOS.slice(0, 4);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:py-10">
        <section className="hero-surface relative overflow-hidden rounded-sm border border-border p-6 sm:p-9">
          <div className="tech-grid pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative">
            <p className="label-tech text-primary">Automotive Industry Shop Experience</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
              <div className="max-w-3xl">
                <h1 className="font-display text-3xl font-bold uppercase tracking-wide sm:text-5xl">
                  Virtual Workshop
                </h1>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  A single shop floor for learning the complete service process:
                  receive the vehicle, understand the concern, inspect, diagnose,
                  plan the repair and verify the result.
                </p>
              </div>
              <Link
                to="/scenarios"
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90"
              >
                Open a repair order <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="panel-instrument p-4">
                <span className="label-tech">Training workflow</span>
                <p className="mt-1 font-display text-xl font-bold">Intake → Verify</p>
              </div>
              <div className="panel-instrument p-4">
                <span className="label-tech">Diagnostic standard</span>
                <p className="mt-1 font-display text-xl font-bold">Evidence first</p>
              </div>
              <div className="panel-instrument p-4">
                <span className="label-tech">Vehicle data modes</span>
                <p className="mt-1 font-display text-xl font-bold">Virtual / Live gated</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="panel-instrument p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold uppercase tracking-wide">
                Shop floor stations
              </h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Each station opens an existing AISE training area. Scenario sessions
              connect the customer interview, inspection, scan tool, meter, diagnosis
              and service desk into one repair workflow.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {stations.map((station) => (
                <Link
                  key={station.number}
                  to={station.to}
                  className="group rounded-sm border border-border bg-panel p-4 transition-colors hover:border-primary/60 hover:bg-accent/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="readout text-xs text-primary">{station.number}</span>
                    <station.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold uppercase tracking-wide">
                    {station.title}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-primary">{station.subtitle}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{station.detail}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                    {station.action} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <section className="panel-instrument p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-bold uppercase tracking-wide">
                  Diagnostic integrity
                </h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>• Simulated readings are identified as simulated.</li>
                <li>• Live vehicle readings must come from a verified adapter response.</li>
                <li>• Unsupported PIDs and modules must remain unavailable, not guessed.</li>
                <li>• Repair decisions require confirmation testing and a retest.</li>
              </ul>
            </section>
            <section className="rounded-sm border border-caution/50 bg-caution/10 p-5">
              <p className="label-tech text-caution">Live adapter status</p>
              <h2 className="mt-2 font-display text-lg font-bold uppercase">
                Android ELM327 bridge not yet implemented
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This build does not yet connect this web dashboard to your Wi-Fi
                dongle. Do not treat the virtual scan data as vehicle data. The
                read-only Android bridge and real-vehicle validation remain required
                before live testing.
              </p>
            </section>
          </aside>
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold uppercase tracking-wide">
                Available repair orders
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose a training scenario to start the shop workflow.
              </p>
            </div>
            <Link to="/scenarios" className="text-sm font-semibold text-primary hover:underline">
              View all scenarios →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((scenario) => {
              const vehicle = vehicleById(scenario.vehicleId);
              return (
                <Link
                  key={scenario.id}
                  to="/scenario/$scenarioId"
                  params={{ scenarioId: scenario.id }}
                  className="panel-instrument p-4 transition-colors hover:border-primary/60"
                >
                  <span className="label-tech text-primary">
                    {scenario.category} · {scenario.difficulty}
                  </span>
                  <h3 className="mt-2 font-display text-base font-bold">{scenario.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {vehicle ? vehicleName(vehicle) : "Training vehicle"}
                  </p>
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                    {scenario.complaint}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold">
                    Start scenario <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <div>
            <h2 className="font-display text-lg font-bold uppercase">Keep building technician skill</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Progress is based on completed training sessions in this browser.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
          >
            <BookOpen className="h-4 w-4" /> View training dashboard
          </Link>
        </section>
      </main>
    </div>
  );
}
