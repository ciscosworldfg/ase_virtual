import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/ase/SiteNav";
import { EngineLab } from "@/components/engine3d/EngineLab";

export const Route = createFileRoute("/engine-lab")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "3D Engine Lab — explore engine components | ASE Virtual" },
      {
        name: "description",
        content:
          "Rotate, explode and inspect a generic procedural 3D engine: component names, related trouble codes and test-then-fix steps.",
      },
      { property: "og:title", content: "3D Engine Lab | ASE Virtual" },
      { property: "og:description", content: "Interactive generic 3D engine model for component recognition training." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EngineLabPage,
});

function EngineLabPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">3D Engine Lab</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Learn to recognize engine components: rotate the model, explode it, and tap any part for what it does,
          related trouble codes and how to test it.
        </p>
        <div className="mt-6">
          <EngineLab />
        </div>
      </main>
    </div>
  );
}