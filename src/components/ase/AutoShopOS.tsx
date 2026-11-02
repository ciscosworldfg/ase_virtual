import type { ReactNode } from "react";
import { ClipboardList, CreditCard, PackageSearch, Users, Wrench } from "lucide-react";

const modules = [
  { icon: ClipboardList, title: "Estimates & work orders", detail: "Repair estimate drafting is available below. Work-order lifecycle integration is not yet connected.", state: "Estimate draft available" },
  { icon: PackageSearch, title: "Inventory & supplier pricing", detail: "Live stock levels and supplier price feeds are not connected in this release.", state: "Not connected" },
  { icon: Users, title: "Customer & vehicle records", detail: "This session uses the scenario's sample customer and vehicle; no shop-wide customer database is connected.", state: "Scenario data only" },
  { icon: CreditCard, title: "Invoices & POS payments", detail: "No payment processor or live transaction capability is connected.", state: "Not connected" },
];

export function AutoShopOS({ children }: { children: ReactNode }) {
  return (
    <section className="space-y-4" aria-labelledby="autoshopos-title">
      <header className="panel-instrument overflow-hidden border border-primary/40">
        <div className="border-b border-border bg-panel px-5 py-4 sm:px-6">
          <span className="label-tech text-primary">AUTOMOTIVE INDUSTRY SHOP EXPERIENCE</span>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="autoshopos-title" className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
                AutoShopOS
              </h2>
              <p className="mt-1 text-sm font-semibold text-foreground">
                An All-in-One Auto Shop Operating System
              </p>
            </div>
            <span className="rounded-sm border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary">
              POST-DIAGNOSIS WORKFLOW
            </span>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Turn verified diagnostic findings into a customer-facing repair estimate and shop workflow.
            The tools below are currently operating in this training scenario; connected shop services are identified separately.
          </p>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-2">
          {modules.map(({ icon: Icon, title, detail, state }) => (
            <div key={title} className="bg-card p-4">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                <h3 className="font-display text-sm font-bold uppercase tracking-wide">{title}</h3>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
              <p className="mt-2 label-tech text-muted-foreground">{state}</p>
            </div>
          ))}
        </div>
      </header>
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4 text-primary" aria-hidden="true" />
        <h3 className="font-display text-lg font-bold uppercase tracking-wide">Service advisor & repair estimate</h3>
      </div>
      {children}
    </section>
  );
}
