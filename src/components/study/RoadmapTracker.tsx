import { useEffect, useState } from "react";
import { Award, CheckSquare, Square } from "lucide-react";
import { RUBRIC, ROADMAP, readRoadmapDone, writeRoadmapDone } from "@/lib/study/roadmap";

export function RoadmapTracker() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDone(readRoadmapDone());
    setLoaded(true);
  }, []);

  const total = ROADMAP.reduce((n, p) => n + p.weeks.length, 0);
  const completed = Object.values(done).filter(Boolean).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  const toggle = (id: string) => {
    if (!loaded) return;
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    writeRoadmapDone(next);
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Your 16-week mastery syllabus — modernized with virtual labs and AI-generated fault
        simulations. Tick each week as you finish it; progress saves on this device.
      </p>

      <div className="panel-instrument mt-5 p-5">
        <div className="flex items-baseline justify-between">
          <span className="label-tech">Roadmap progress</span>
          <span className="readout text-primary">
            {completed}/{total} weeks
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {ROADMAP.map((phase) => (
          <section key={phase.id} className="panel-instrument p-5">
            <h3 className="font-display text-base font-bold uppercase tracking-wide">{phase.title}</h3>
            <ul className="mt-4 space-y-3">
              {phase.weeks.map((w) => {
                const id = `${phase.id}-${w.week}`;
                const checked = !!done[id];
                return (
                  <li key={id}>
                    <button
                      onClick={() => toggle(id)}
                      className="flex w-full items-start gap-3 rounded-sm border border-border bg-panel px-3 py-2.5 text-left transition-colors hover:bg-accent"
                    >
                      {checked ? (
                        <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                      ) : (
                        <Square className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="flex-1">
                        <span className={`text-sm font-medium ${checked ? "text-muted-foreground line-through" : ""}`}>
                          Week {w.week} · {w.subject}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{w.focus}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <div className="panel-instrument mt-5 p-5">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <h3 className="font-display text-base font-bold uppercase tracking-wide">
            Grading & competency rubric
          </h3>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {RUBRIC.map((r) => (
            <div key={r.label} className="rounded-sm border border-border bg-panel p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">{r.label}</span>
                <span className="readout text-primary">{r.weight}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Exam-day discipline: read the condition first ("under load", "at idle", "when cold") and
          eliminate any answer that doesn't apply to that specific condition. Distractors look right
          but don't address the specific root cause.
        </p>
      </div>
    </div>
  );
}
