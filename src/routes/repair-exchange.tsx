import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, ShieldAlert, Wrench } from "lucide-react";
import { SiteNav } from "@/components/ase/SiteNav";

export const Route = createFileRoute("/repair-exchange")({
  head: () => ({ meta: [
    { title: "Technician Repair Exchange | LAT" },
    { name: "description", content: "Submit real-world automotive diagnostic cases for review." },
  ]}),
  component: RepairExchange,
});

function RepairExchange() {
  const [notice, setNotice] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const fields = ["Year", "Make", "Model", "Engine", "Mileage", "Submitter type", "DTCs", "Complaint and symptoms", "Tests and measured evidence", "Diagnostic finding", "Repair performed", "Post-repair verification"];
    const body = fields.map((label) => label + ": " + String(f.get(label) || "Not provided")).join("\n\n");
    window.location.href = "mailto:inditechreview@gmail.com?subject=" + encodeURIComponent("LAT Technician Repair Exchange submission") + "&body=" + encodeURIComponent(body);
    setNotice("Your email app should open with the case details. This is not a database submission; cases are not published automatically and require review.");
  }
  return <div className="min-h-screen"><SiteNav /><main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
    <p className="label-tech text-primary">LAT · COMMUNITY KNOWLEDGE</p>
    <h1 className="mt-3 font-display text-3xl font-bold uppercase tracking-wide sm:text-5xl">Technician Repair Exchange</h1>
    <p className="mt-4 max-w-3xl text-muted-foreground">Share the actual diagnostic process—not just the part replaced. Help others learn from real cases, test results, and verified repairs.</p>
    <div className="mt-6 rounded-sm border border-signal/40 bg-panel p-4 text-sm leading-6"><ShieldAlert className="mr-2 inline h-4 w-4 text-primary" aria-hidden="true" /><strong>Privacy:</strong> Do not submit VINs, license plates, customer names, addresses, phone numbers, repair-order numbers, or confidential information.</div>
    <section className="mt-8 panel-instrument p-5 sm:p-7">
      <h2 className="font-display text-xl font-bold uppercase tracking-wide">Submit a case for review</h2>
      <p className="mt-2 text-sm text-muted-foreground">This first version prepares an email for review. It does not yet save cases to a shared searchable database.</p>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Year", "e.g. 2016", true], ["Make", "e.g. Honda", true], ["Model", "e.g. Accord", true],
            ["Engine", "e.g. 2.4L I4", false], ["Mileage", "Approximate mileage", false], ["DTCs", "e.g. P0171", false],
          ].map(([name, placeholder, required]) => <label key={String(name)} className="block text-sm">{String(name)}{required ? " *" : ""}<input name={String(name)} required={Boolean(required)} placeholder={String(placeholder)} className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2" /></label>)}
          <label className="block text-sm">Submitter type<select name="Submitter type" className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2"><option>Technician</option><option>Shop owner / service advisor</option><option>DIY vehicle owner</option><option>Automotive student</option></select></label>
        </div>
        {[
          ["Complaint and symptoms", "When does the problem occur? Cold, hot, idle, acceleration, bumps, braking?", true],
          ["Tests and measured evidence", "Scan data, voltage drop, pressure, resistance, smoke test, visual findings...", false],
          ["Diagnostic finding", "What evidence identified the root cause?", false],
          ["Repair performed", "What was actually repaired?", true],
          ["Post-repair verification", "How did you confirm the original symptom was resolved?", false],
        ].map(([name, placeholder, required]) => <label key={String(name)} className="block text-sm">{String(name)}{required ? " *" : ""}<textarea name={String(name)} required={Boolean(required)} placeholder={String(placeholder)} className="mt-1 min-h-24 w-full rounded-sm border border-input bg-background px-3 py-2" /></label>)}
        <label className="flex items-start gap-3 text-sm leading-5"><input name="privacy" type="checkbox" required className="mt-1" /><span>I removed customer-identifying information and understand this case will be reviewed before publication.</span></label>
        <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"><Mail className="h-4 w-4" aria-hidden="true" />Prepare email submission</button>
        {notice ? <p role="status" className="text-sm text-muted-foreground">{notice}</p> : null}
      </form>
    </section>
    <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><Wrench className="h-4 w-4" aria-hidden="true" />Reports are community-submitted evidence, not manufacturer guarantees or universal repair instructions.</p>
  </main></div>;
}
