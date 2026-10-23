import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Search, ShieldCheck, ShoppingCart, Wrench, BookOpen } from "lucide-react";
import type { ReactNode, ComponentType } from "react";
import { SiteNav } from "@/components/ase/SiteNav";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [
    { title: "Automotive Resources | LAT" },
    { name: "description", content: "Vehicle recalls, technical service information, parts research, repair price references, and professional shop tools." },
  ]}),
  component: AutomotiveResources,
});

function Card({ icon: Icon, title, description, children }: {
  icon: ComponentType<{ className?: string }>; title: string; description: string; children: ReactNode;
}) {
  return <section className="panel-instrument flex h-full flex-col p-5">
    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
    <h2 className="mt-4 font-display text-xl font-bold uppercase tracking-wide">{title}</h2>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    <div className="mt-5 flex flex-col items-start gap-3">{children}</div>
  </section>;
}
function OutLink({ href, children }: { href: string; children: ReactNode }) {
  return <a className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline" href={href} target="_blank" rel="noreferrer">{children}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>;
}
function AutomotiveResources() {
  return <div className="min-h-screen"><SiteNav /><main className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
    <p className="label-tech text-primary">LAT · REFERENCE DESK</p>
    <h1 className="mt-3 font-display text-3xl font-bold uppercase tracking-wide sm:text-5xl">Automotive Resources</h1>
    <p className="mt-4 max-w-3xl text-muted-foreground">Start with official safety information, research parts and repair costs, and find professional shop tools. External websites maintain their own data, prices, and terms.</p>
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card icon={ShieldCheck} title="Recalls & TSBs" description="Check the VIN for open safety recalls. Technical service bulletins are not the same as recalls.">
        <OutLink href="https://www.nhtsa.gov/recalls">NHTSA recall lookup</OutLink>
        <OutLink href="https://www.nhtsa.gov/resources-investigations-recalls">NHTSA investigations and resources</OutLink>
        <OutLink href="https://www.nhtsa.gov/report-a-safety-problem">Report a safety problem</OutLink>
      </Card>
      <Card icon={ShoppingCart} title="Parts Finder" description="Compare fitment, part numbers, warranties, shipping, and returns. Confirm exact fitment before ordering.">
        <OutLink href="https://www.rockauto.com/">RockAuto</OutLink>
        <OutLink href="https://www.autozone.com/">AutoZone</OutLink>
        <OutLink href="https://www.oreillyauto.com/">O'Reilly Auto Parts</OutLink>
        <OutLink href="https://www.napaonline.com/">NAPA Auto Parts</OutLink>
      </Card>
      <Card icon={Search} title="Repair Price References" description="Use estimates as a starting point. Compare the same repair scope, labor, part quality, fees, taxes, and warranty.">
        <OutLink href="https://repairpal.com/estimator">RepairPal estimator</OutLink>
        <p className="text-xs leading-5 text-muted-foreground">LAT does not currently receive live supplier inventory or pricing from these links.</p>
      </Card>
    </div>
    <section className="mt-8 rounded-sm border border-primary/40 bg-panel p-6 sm:p-8">
      <p className="label-tech text-primary">PROFESSIONAL SHOP TOOL · EXTERNAL SERVICE</p>
      <h2 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide">ShopOS Shop Management</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Explore a separate shop-management platform for repair orders, estimates, invoicing, technician workflows, and shop operations. This is an external link; LAT is not integrated with ShopOS.</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">Check the official site for current availability, features, and pricing. Do not assume live parts inventory or supplier pricing is available.</p>
      <a className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" href="https://shopos.work/" target="_blank" rel="noreferrer">Explore ShopOS <ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
    </section>
    <section className="mt-8 panel-instrument p-5 sm:p-6">
      <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
      <h2 className="mt-3 font-display text-xl font-bold uppercase tracking-wide">Technician Repair Exchange</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">A community repair library for vehicle details, customer symptoms, DTCs, tests and measurements, root-cause findings, repairs, and post-repair verification. Submissions must be reviewed and stripped of customer-identifying information before public release.</p>
      <a className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline" href="/repair-exchange">Submit or review a repair case <Wrench className="h-4 w-4" aria-hidden="true" /></a>
    </section>
  </main></div>;
}
