import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2 } from "lucide-react";
import type { LiveDataFrame } from "@/lib/sim/engine";
import type { Scenario, Vehicle } from "@/lib/sim/types";
import { assessSymptom } from "@/lib/assess.functions";

export function SymptomAssessment({
  scenario,
  vehicle,
  data,
  toolsUsed,
}: {
  scenario: Scenario;
  vehicle?: Vehicle;
  data: LiveDataFrame;
  toolsUsed: string[];
}) {
  const run = useServerFn(assessSymptom);
  const [symptom, setSymptom] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (symptom.trim().length < 3 || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await run({
        data: {
          symptom: symptom.trim(),
          vehicle: vehicle
            ? `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.engine}, ${vehicle.transmission}, ${vehicle.mileage} mi`
            : scenario.vehicleId,
          complaint: scenario.complaint,
          category: scenario.category,
          toolsUsed,
          codes: scenario.codes.map((c) => `${c.code} ${c.description}`),
          liveData: { ...data },
        },
      });
      if (r.ok) setResult(r.text);
      else setError(r.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-instrument overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-panel px-4 py-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-display text-sm font-bold uppercase tracking-[0.18em]">
          AI Symptom Assessment
        </span>
      </div>
      <div className="space-y-3 p-4">
        <textarea
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          placeholder="Describe what you're observing, e.g. 'rough idle that smooths out above 2,000 rpm, lean trims'"
          className="min-h-20 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          maxLength={2000}
        />
        <button
          onClick={submit}
          disabled={loading || symptom.trim().length < 3}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-50"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {loading ? "Analyzing live data…" : "Assess from live data"}
        </button>
        {error && (
          <p className="rounded-sm border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {result && (
          <div className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-sm border border-border bg-panel px-3 py-2 text-sm text-muted-foreground">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
