import { useState } from "react";
import { FileText, Printer } from "lucide-react";

const ROWS = [
  {
    id: "verify",
    step: "1. Verify Complaint",
    hint: "Describe the exact symptom — under what condition does it happen?",
  },
  {
    id: "visual",
    step: "2. Visual Inspection",
    hint: "Fluid levels, belts, hoses, leaks, loose connectors.",
  },
  {
    id: "spec",
    step: "3. Service Info Spec",
    hint: "What is the OE specification? Cite the source.",
  },
  {
    id: "measure",
    step: "4. Actual Measurement",
    hint: "What did you measure — V, Ω, PSI, rpm, %?",
  },
  {
    id: "conclusion",
    step: "5. Conclusion",
    hint: "Pass, fail, or needs repair — with the threshold that decides.",
  },
];

export function DiagnosticWorksheet() {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [vehicle, setVehicle] = useState("");
  const [date, setDate] = useState("");

  const set = (id: string, v: string) => setFields((f) => ({ ...f, [id]: v }));

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        The lab worksheet template — use one for every diagnostic session. Fill it in as you work a
        scenario in the simulator, then print it for your records. Every "out of spec" finding must
        be supported by the document that proves the specification.
      </p>

      <div className="mt-5 flex justify-end print:hidden">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Printer className="h-4 w-4" /> Print worksheet
        </button>
      </div>

      <div className="panel-instrument mt-3 p-5">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="font-display text-base font-bold uppercase tracking-wide">
            Diagnostic lab worksheet
          </h3>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="label-tech">Vehicle / RO</span>
            <input
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="2016 Accord 2.4L · RO #1042"
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="label-tech">Date</span>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="YYYY-MM-DD"
              className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-4 space-y-3">
          {ROWS.map((r) => (
            <label key={r.id} className="block">
              <span className="label-tech">{r.step}</span>
              <span className="ml-2 text-xs text-muted-foreground">{r.hint}</span>
              <textarea
                value={fields[r.id] ?? ""}
                onChange={(e) => set(r.id, e.target.value)}
                rows={2}
                className="mt-1 w-full resize-y rounded-sm border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <p className="label-tech text-primary">The 3 C's close-out</p>
          <div className="mt-3 space-y-3">
            {[
              { id: "complaint", label: "Complaint", placeholder: "Vehicle hesitates under heavy load." },
              { id: "cause", label: "Cause", placeholder: "Found #4 ignition coil resistance at 25k ohms (spec 12k)." },
              { id: "correction", label: "Correction", placeholder: "Replaced #4 coil; verified spark intensity and performed load-test drive." },
            ].map((c) => (
              <label key={c.id} className="block">
                <span className="label-tech">{c.label}</span>
                <input
                  value={fields[c.id] ?? ""}
                  onChange={(e) => set(c.id, e.target.value)}
                  placeholder={c.placeholder}
                  className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
