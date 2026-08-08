import { useEffect, useState } from "react";
import type { Scenario } from "@/lib/sim/types";

export function CustomerChat({
  scenario,
  onUse,
}: {
  scenario: Scenario;
  onUse: () => void;
}) {
  const [asked, setAsked] = useState<number[]>([]);

  useEffect(() => {
    onUse();
  }, [onUse]);

  return (
    <div className="panel-instrument overflow-hidden">
      <div className="border-b border-border bg-panel px-4 py-3">
        <span className="font-display text-sm font-bold uppercase tracking-[0.18em]">
          Customer interview
        </span>
        <p className="label-tech mt-1">
          {scenario.customerName} · {scenario.customerMood}
        </p>
      </div>

      <div className="space-y-3 p-4">
        <Bubble who="customer">{scenario.complaint}</Bubble>

        {asked.map((i) => {
          const item = scenario.interview[i]!;
          return (
            <div key={i} className="space-y-3">
              <Bubble who="tech">{item.q}</Bubble>
              <Bubble who="customer">{item.a}</Bubble>
            </div>
          );
        })}

        <div className="pt-2">
          <span className="label-tech">Ask a question</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {scenario.interview.map((q, i) =>
              asked.includes(i) ? null : (
                <button
                  key={q.q}
                  onClick={() => setAsked((a) => [...a, i])}
                  className="rounded-sm border border-border bg-panel px-3 py-1.5 text-xs transition-colors hover:bg-accent"
                >
                  {q.q}
                </button>
              ),
            )}
          </div>
          {asked.length === scenario.interview.length && (
            <p className="mt-3 text-xs text-muted-foreground">
              The customer describes symptoms only. Confirm everything with your own testing.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Bubble({ who, children }: { who: "tech" | "customer"; children: React.ReactNode }) {
  const tech = who === "tech";
  return (
    <div className={`flex ${tech ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[85%] rounded-sm px-3 py-2 text-sm ${
          tech
            ? "border border-primary/40 bg-primary/10"
            : "border border-border bg-panel text-muted-foreground"
        }`}
      >
        {children}
      </p>
    </div>
  );
}
