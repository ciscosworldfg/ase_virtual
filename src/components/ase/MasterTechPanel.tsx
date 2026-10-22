import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Loader2, Send } from "lucide-react";
import type { LiveDataFrame } from "@/lib/sim/engine";
import type { Scenario, Vehicle } from "@/lib/sim/types";
import { askMasterTech } from "@/lib/service.functions";
import { gatherEvidence } from "./EstimateBuilder";

export function buildCtx(scenario: Scenario, vehicle: Vehicle | undefined, data: LiveDataFrame, toolsUsed: string[]) {
  const live: Record<string, number | boolean | string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "number") live[k] = Math.round(v * 100) / 100;
    else if (typeof v === "boolean" || typeof v === "string") live[k] = v;
  }
  return {
    vehicle: vehicle
      ? `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.engine}, ${vehicle.transmission}, ${vehicle.mileage} mi`
      : scenario.vehicleId,
    category: scenario.category,
    complaint: scenario.complaint,
    evidence: gatherEvidence(scenario, data, toolsUsed).map((e) => e.slice(0, 300)),
    toolsUsed,
    liveData: live,
  };
}

type Msg = { role: "user" | "assistant"; content: string };

export function MasterTechPanel({
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
  const ask = useServerFn(askMasterTech);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (q: string) => {
    const question = q.trim();
    if (question.length < 2 || loading) return;
    setInput("");
    setError(null);
    setLoading(true);
    const history = messages.slice(-10);
    setMessages((m) => [...m, { role: "user", content: question }]);
    try {
      const r = await ask({ data: { ...buildCtx(scenario, vehicle, data, toolsUsed), history, question } });
      if (r.ok) setMessages((m) => [...m, { role: "assistant", content: r.text }]);
      else setError(r.error);
    } catch {
      setError("Master Tech couldn't be reached. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-instrument overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-panel px-4 py-3">
        <Bot className="h-4 w-4 text-primary" />
        <span className="font-display text-sm font-bold uppercase tracking-[0.18em]">Master Tech</span>
        <span className="ml-auto label-tech text-muted-foreground">AI · evidence only</span>
      </div>
      <div className="max-h-96 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="max-w-[92%] rounded-sm border border-border bg-panel px-3 py-2 text-sm text-muted-foreground">
            I reason only from evidence you've collected. Gather data, then ask me for a full diagnostic.
          </p>
        )}
        {messages.map((m, i) => (
          <p
            key={i}
            className={`whitespace-pre-wrap rounded-sm px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-auto max-w-[85%] border border-primary/40 bg-primary/10"
                : "max-w-[96%] border border-border bg-panel text-muted-foreground"
            }`}
          >
            {m.content}
          </p>
        ))}
        {loading && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Master Tech is reviewing your evidence…
          </p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border p-3">
        {[
          "Give me a full diagnostic",
          "Where am I in the 7-step funnel?",
          "Suggest the next pinpoint test",
          "Tech A / Tech B check",
          "Verify proof of fix",
        ].map((q) => (
          <button
            key={q}
            disabled={loading}
            onClick={() => send(q)}
            className="rounded-sm border border-border bg-panel px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-50"
          >
            {q}
          </button>
        ))}
        <form
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Master Tech…"
            className="flex-1 rounded-sm border border-border bg-background px-3 py-1.5 text-sm"
          />
          <button disabled={loading} aria-label="Send" className="rounded-sm bg-primary px-3 text-primary-foreground disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
