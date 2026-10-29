import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/ase/SiteNav";
import { useProfile } from "@/lib/progress";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your training path | AISE Virtual" },
      {
        name: "description",
        content:
          "Tell AISE Virtual your goal and experience level so the diagnostic simulator and dashboard adapt to you.",
      },
      { property: "og:title", content: "Set up your training path | AISE Virtual" },
      {
        property: "og:description",
        content: "Choose your goal and experience level to tailor the diagnostic simulator.",
      },
    ],
  }),
  component: Onboarding,
});

const GOALS = [
  "Become an automotive technician",
  "Prepare for ASE exams",
  "Improve diagnostic skills",
  "Learn DIY maintenance",
  "Train employees",
  "Improve automotive sales skills",
  "Become a service advisor",
];

const LEVELS = [
  "Complete beginner",
  "DIY",
  "Student",
  "Apprentice",
  "Technician",
  "Master-level technician",
];

function Onboarding() {
  const { setOnboarding } = useProfile();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);

  const submit = () => {
    if (!goal || !level) return;
    setOnboarding(goal, level);
    void navigate({ to: goal === "Learn DIY maintenance" ? "/diy" : "/dashboard" });
  };

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
          What are you here to accomplish?
        </h1>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {GOALS.map((g) => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              className={`panel-instrument px-4 py-3 text-left text-sm transition-colors ${
                goal === g ? "border-primary bg-accent" : "hover:bg-accent"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <h2 className="mt-12 font-display text-2xl font-bold uppercase tracking-wide">
          Your experience
        </h2>
        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`panel-instrument px-4 py-3 text-left text-sm transition-colors ${
                level === l ? "border-primary bg-accent" : "hover:bg-accent"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <button
          onClick={submit}
          disabled={!goal || !level}
          className="mt-10 rounded-sm bg-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Build my dashboard
        </button>
        <p className="mt-4 text-xs text-muted-foreground">
          Your profile is stored locally in this browser for the MVP.
        </p>
      </main>
    </div>
  );
}
