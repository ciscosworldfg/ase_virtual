import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteNav } from "@/components/ase/SiteNav";
import { SCENARIOS } from "@/lib/sim/scenarios";
import { vehicleById, vehicleName } from "@/lib/sim/vehicles";
import { ASE_CATEGORIES } from "@/lib/sim/types";

export const Route = createFileRoute("/scenarios")({
  head: () => ({
    meta: [
      { title: "Diagnostic scenario library | ASE Virtual" },
      {
        name: "description",
        content:
          "Browse virtual diagnostic scenarios by ASE area, difficulty and vehicle — misfires, brake pulsation, charging faults and more.",
      },
      { property: "og:title", content: "Diagnostic scenario library | ASE Virtual" },
      {
        property: "og:description",
        content: "Pick a vehicle and a fault, then run the full diagnostic loop end to end.",
      },
    ],
  }),
  component: ScenarioLibrary,
});

function ScenarioLibrary() {
  const [cat, setCat] = useState<string>("all");
  const [diff, setDiff] = useState<string>("all");

  const list = useMemo(
    () =>
      SCENARIOS.filter(
        (s) => (cat === "all" || s.category === cat) && (diff === "all" || s.difficulty === diff),
      ),
    [cat, diff],
  );

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
          Scenario library
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Each scenario pairs a curated vehicle configuration with an independently modeled failure,
          so the same vehicle can present many different problems.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <FilterGroup
            value={cat}
            onChange={setCat}
            options={[
              { id: "all", label: "All areas" },
              ...ASE_CATEGORIES.map((c) => ({ id: c.id, label: `${c.id} · ${c.name}` })),
            ]}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterGroup
            value={diff}
            onChange={setDiff}
            options={["all", "Beginner", "Intermediate", "Advanced", "Master"].map((d) => ({
              id: d,
              label: d === "all" ? "All levels" : d,
            }))}
          />
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => {
            const v = vehicleById(s.vehicleId);
            return (
              <Link
                key={s.id}
                to="/scenario/$scenarioId"
                params={{ scenarioId: s.id }}
                className="panel-instrument flex flex-col p-5 transition-colors hover:border-primary/60"
              >
                <div className="flex items-center justify-between">
                  <span className="label-tech text-signal">{s.category}</span>
                  <span className="label-tech">{s.difficulty}</span>
                </div>
                <h2 className="mt-3 font-display text-lg font-semibold leading-tight">{s.title}</h2>
                {v && (
                  <p className="readout mt-2 text-xs text-muted-foreground">
                    {vehicleName(v)} · {v.engine}
                  </p>
                )}
                <p className="mt-3 flex-1 text-sm text-muted-foreground">“{s.complaint}”</p>
                <span className="label-tech mt-4 text-primary">
                  Run diagnosis · ~{s.estimatedMinutes} min
                </span>
              </Link>
            );
          })}
        </div>
        {!list.length && (
          <p className="mt-12 text-muted-foreground">
            No scenarios match this filter yet — more areas are being added.
          </p>
        )}
      </main>
    </div>
  );
}

function FilterGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-sm border px-3 py-1.5 text-xs transition-colors ${
            value === o.id
              ? "border-primary bg-primary/15 text-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-accent"
          }`}
        >
          {o.label}
        </button>
      ))}
    </>
  );
}
