import { Link, createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/ase/SiteNav";
import { summarize, useProfile } from "@/lib/progress";
import { ASE_CATEGORIES } from "@/lib/sim/types";
import { SCENARIOS, scenarioById } from "@/lib/sim/scenarios";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Training dashboard | ASE Virtual" },
      {
        name: "description",
        content:
          "Track overall automotive skill, diagnostic accuracy, ASE area progress and recommended training in ASE Virtual.",
      },
      { property: "og:title", content: "Training dashboard | ASE Virtual" },
      {
        property: "og:description",
        content: "Skill score, ASE A1–A8 + L1 progress and weak-area tracking.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { profile, loaded } = useProfile();
  const s = summarize(profile.attempts);

  const weakest = ASE_CATEGORIES.map((c) => ({
    ...c,
    score: s.byCategory[c.id] ?? 0,
  })).sort((a, b) => a.score - b.score)[0];

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
          Training dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          {profile.goal ? `Goal: ${profile.goal} · Level: ${profile.experience}` : "Set your goal in onboarding to tailor recommendations."}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Overall automotive skill" value={s.overall} suffix="/100" primary />
          <Stat label="Diagnostic accuracy" value={s.accuracy} suffix="%" />
          <Stat label="First-time correct rate" value={s.firstTime} suffix="%" />
          <Stat label="Safety score" value={s.safety} suffix="%" />
        </div>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide">ASE progress</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            ASE-aligned preparation. ASE Virtual is not affiliated with or endorsed by ASE and does
            not issue certification.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ASE_CATEGORIES.map((c) => {
              const score = s.byCategory[c.id] ?? 0;
              const total = SCENARIOS.filter((sc) => sc.category === c.id).length;
              const completed = new Set(
                profile.attempts.filter((a) => a.category === c.id).map((a) => a.scenarioId),
              ).size;
              const pct = total ? Math.round((completed / total) * 100) : 0;
              return (
                <div key={c.id} className="panel-instrument p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display font-bold tracking-wide">{c.id}</span>
                    <span className="readout text-sm text-primary">{score}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.name}</p>
                  <div className="mt-3 h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="label-tech">
                      {completed}/{total} scenarios
                    </span>
                    <span className="readout text-xs text-muted-foreground">{pct}% complete</span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-signal" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

        </section>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <section className="panel-instrument p-5">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">
              Recent scenarios
            </h2>
            <div className="mt-4 space-y-2">
              {!loaded || profile.attempts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No sessions recorded yet. Run your first diagnosis to start scoring.
                </p>
              ) : (
                profile.attempts.slice(0, 6).map((a, i) => (
                  <div
                    key={`${a.scenarioId}-${i}`}
                    className="flex items-center justify-between rounded-sm border border-border bg-panel px-3 py-2"
                  >
                    <div>
                      <span className="text-sm">{scenarioById(a.scenarioId)?.title ?? a.scenarioId}</span>
                      <span className="label-tech block">
                        {a.category} · {a.wrongAnswers === 0 ? "clean run" : `${a.wrongAnswers} wrong`}
                      </span>
                    </div>
                    <span className="readout text-primary">{a.score}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="panel-instrument p-5">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">
              Recommended training
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Weakest area: <strong className="text-foreground">{weakest?.id} — {weakest?.name}</strong>
            </p>
            <div className="mt-4 space-y-2">
              {SCENARIOS.filter((sc) => sc.category === weakest?.id)
                .concat(SCENARIOS)
                .slice(0, 3)
                .map((sc) => (
                  <Link
                    key={sc.id}
                    to="/scenario/$scenarioId"
                    params={{ scenarioId: sc.id }}
                    className="block rounded-sm border border-border bg-panel px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    {sc.title}
                    <span className="label-tech block">
                      {sc.category} · {sc.difficulty}
                    </span>
                  </Link>
                ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  primary,
}: {
  label: string;
  value: number;
  suffix: string;
  primary?: boolean;
}) {
  return (
    <div className="panel-instrument p-5">
      <span className="label-tech">{label}</span>
      <div
        className={`readout mt-2 text-4xl font-bold ${primary ? "text-primary" : "text-foreground"}`}
      >
        {value}
        <span className="ml-1 text-sm text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}
