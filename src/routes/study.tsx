import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/ase/SiteNav";
import { PracticeExam } from "@/components/study/PracticeExam";
import { FieldProtocols } from "@/components/study/FieldProtocols";
import { RoadmapTracker } from "@/components/study/RoadmapTracker";
import { DiagnosticWorksheet } from "@/components/study/DiagnosticWorksheet";

export const Route = createFileRoute("/study")({
  head: () => ({
    meta: [
      { title: "Study Hub — exams, protocols & 16-week roadmap | ASE Virtual" },
      {
        name: "description",
        content:
          "ASE exam practice bank with instructor rationale, master diagnostic field protocols, the 16-week mastery roadmap and the digital 7-step diagnostic worksheet.",
      },
      { property: "og:title", content: "Study Hub | ASE Virtual" },
      {
        property: "og:description",
        content:
          "Practice exams A1–A8, field diagnostic protocols, the 16-week mastery roadmap and the digital 7-step worksheet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudyPage,
});

const TABS = [
  { id: "exam", label: "Practice Exam" },
  { id: "protocols", label: "Field Protocols" },
  { id: "roadmap", label: "16-Week Roadmap" },
  { id: "worksheet", label: "Diagnostic Worksheet" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function StudyPage() {
  const [tab, setTab] = useState<TabId>("exam");

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Study Hub</h1>
          <span className="label-tech text-signal">Built from your own ASE master manuals</span>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Practice exams with instructor rationale, the master diagnostic protocols, your 16-week
          mastery roadmap, and the 7-step worksheet you fill in during any live scenario.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-sm px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-panel text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "exam" && <PracticeExam />}
          {tab === "protocols" && <FieldProtocols />}
          {tab === "roadmap" && <RoadmapTracker />}
          {tab === "worksheet" && <DiagnosticWorksheet />}
        </div>
      </main>
    </div>
  );
}
