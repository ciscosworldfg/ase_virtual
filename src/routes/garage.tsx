import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/ase/SiteNav";

export const Route = createFileRoute("/garage")({
  head: () => ({
    meta: [
      { title: "AISE Virtual — 3D Engine Lab" },
      {
        name: "description",
        content:
          "Interactive generic engine training model with selectable components, simulated diagnostic scenarios, and a separately configured read-only OBD-II bridge.",
      },
    ],
  }),
  component: GaragePage,
});

function GaragePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border bg-card px-4 py-2 text-xs text-muted-foreground">
          <strong className="text-foreground">Training model:</strong> generic V6 geometry, not OEM CAD or a verified Honda J35A6. Current lab functions: orbit, zoom, pan, exploded view, component selection, and simulated DTC highlighting. Running mechanical animation, four-stroke timing, verified J35A6 geometry, and transmission modeling are not yet implemented. Live readings require a separately configured read-only bridge.
        </div>
        <iframe
          src="/engine-lab/index.html"
          title="AISE Virtual interactive 3D engine lab"
          className="min-h-[75vh] w-full flex-1 border-0"
          loading="eager"
        />
      </main>
    </div>
  );
}
