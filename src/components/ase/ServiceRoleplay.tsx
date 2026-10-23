import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MessageSquare, User } from "lucide-react";
import type { LiveDataFrame } from "@/lib/sim/engine";
import type { Scenario, Vehicle } from "@/lib/sim/types";
import { serviceRoleplay } from "@/lib/service.functions";
import { buildCtx } from "./MasterTechPanel";

type Line = { kind: string; desc: string; qty: number; unit: number | null; reason: string };
type Turn = { customer: string; reply?: string; lines?: Line[]; notes?: string; error?: string };

export function ServiceRoleplay({
  scenario,
  vehicle,
  data,
  toolsUsed,
}: {
  scenario: Scenario;
  vehicle: Vehicle;
  data: LiveDataFrame;
  toolsUsed: string[];
}) {
  const run = useServerFn(serviceRoleplay);
  const [text, setText] = useState("");
  const [rate, setRate] = useState(145);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const $ = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  const submit = async () => {
    const msg = text.trim();
    if (msg.length < 3 || loading) return;
    setText("");
    setLoading(true);
    const idx = turns.length;
    setTurns((t) => [...t, { customer: msg }]);
    try {
      const r = await run({ data: { ...buildCtx(scenario, vehicle, data, toolsUsed), customerMessage: msg, laborRate: rate } });
      setTurns((t) => t.map((x, i) => (i !== idx ? x : r.ok ? { ...x, reply: r.reply, lines: r.lines, notes: r.notes } : { ...x, error: r.error })));
    } catch {
      setTurns((t) => t.map((x, i) => (i === idx ? { ...x, error: "The service advisor couldn't be reached." } : x)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-instrument p-5">
      <span className="label-tech text-signal">Service desk roleplay</span>
      <h2 className="mt-1 font-display text-xl font-bold uppercase tracking-wide">You're the customer</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Describe your complaint in your own words. The AI service advisor uses the technician's evidence to write an estimate and reply.
      </p>

      <div className="mt-4 space-y-4">
        {turns.map((t, i) => {
          const lines = t.lines ?? [];
          const laborSubtotal = lines.reduce((s, l) => s + (l.kind === "labor" && l.unit !== null ? l.qty * l.unit : 0), 0);
          const hasUnpricedItems = lines.some((l) => l.kind !== "labor" && l.unit === null);
          return (
            <div key={i} className="space-y-3">
              <div className="ml-auto flex max-w-[85%] gap-2 rounded-sm border border-primary/40 bg-primary/10 px-3 py-2 text-sm">
                <User className="mt-0.5 h-4 w-4 shrink-0" /> {t.customer}
              </div>
              {t.error && <p className="text-xs text-destructive">{t.error}</p>}
              {t.lines && t.lines.length > 0 && (
                <div className="rounded-sm border border-border bg-panel p-3">
                  <span className="label-tech">AI estimate</span>
                  <table className="mt-2 w-full text-xs">
                    <tbody>
                      {t.lines.map((l, j) => (
                        <tr key={j} className="border-b border-border/50 align-top">
                          <td className="py-1.5 pr-2 capitalize text-muted-foreground">{l.kind}</td>
                          <td className="pr-2">
                            {l.desc}
                            {l.reason && <div className="text-muted-foreground">{l.reason}</div>}
                          </td>
                          <td className="readout pr-2 text-right">{l.qty}{l.kind === "labor" ? " h" : ""}</td>
                          <td className="readout text-right">{l.unit === null ? "Price required" : $(l.qty * l.unit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-2 flex justify-between font-display font-bold">
                    <span>Labor subtotal</span>
                    <span className="readout text-primary">{$(laborSubtotal)}</span>
                  </div>
                  {hasUnpricedItems && (
                    <p className="mt-2 text-xs text-caution">
                      Parts, fluids, and sublet items are not priced. Add verified shop/supplier prices before presenting a complete estimate.
                    </p>
                  )}
                  {t.notes && <p className="mt-2 text-xs text-muted-foreground">Tech note: {t.notes}</p>}
                </div>
              )}
              {t.reply && (
                <div className="flex max-w-[92%] gap-2 whitespace-pre-wrap rounded-sm border border-border bg-panel px-3 py-2 text-sm text-muted-foreground">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t.reply}
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Service advisor is writing your estimate…
          </p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="e.g. My check engine light came on and it idles rough at stoplights…"
          className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
        <div className="flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs">
            Labor rate $/h
            <input type="number" value={rate} onChange={(e) => setRate(+e.target.value || 0)} className="readout w-20 rounded-sm border border-border bg-background px-2 py-1" />
          </label>
          <button
            onClick={submit}
            disabled={loading || text.trim().length < 3}
            className="rounded-sm bg-primary px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-50"
          >
            Talk to service advisor
          </button>
        </div>
      </div>
    </div>
  );
}
