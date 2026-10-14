import { ShieldCheck } from "lucide-react";
import { PROTOCOLS, SIGNOFF_THRESHOLDS } from "@/lib/study/protocols";

export function FieldProtocols() {
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Procedure cards distilled from your diagnostic protocols. A Master Tech doesn't hope a part
        fixes the car — they use measurable data to prove a component is out of spec before a single
        bolt is turned.
      </p>

      <div className="panel-instrument mt-5 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border bg-panel px-4 py-3">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="font-display text-sm font-bold uppercase tracking-[0.18em]">
            Sign-off thresholds
          </span>
          <span className="label-tech ml-auto">The job isn't done until it's proven</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="label-tech px-4 py-2 font-medium">System</th>
              <th className="label-tech px-4 py-2 font-medium">Required test</th>
              <th className="label-tech px-4 py-2 font-medium">Absolute proof threshold</th>
            </tr>
          </thead>
          <tbody>
            {SIGNOFF_THRESHOLDS.map((t) => (
              <tr key={t.system} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-2.5">{t.system}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{t.test}</td>
                <td className="readout px-4 py-2.5 text-primary">{t.threshold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {PROTOCOLS.map((p) => (
          <article key={p.id} className="panel-instrument p-5">
            <div className="flex items-baseline gap-2">
              {p.code && <span className="readout text-primary">{p.code}</span>}
              <h3 className="font-display text-base font-bold uppercase tracking-wide">{p.title}</h3>
            </div>
            <p className="label-tech mt-1">
              {p.phase} · {p.source}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{p.summary}</p>
            <ol className="mt-4 space-y-2.5">
              {p.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="label-tech mt-0.5 shrink-0 text-primary">{s.step}</span>
                  <span className="text-muted-foreground">{s.action}</span>
                </li>
              ))}
            </ol>
            {p.proof && (
              <div className="mt-4 rounded-sm border border-signal/40 bg-signal/5 p-3">
                <p className="label-tech text-signal">Proof standard</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.proof}</p>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
