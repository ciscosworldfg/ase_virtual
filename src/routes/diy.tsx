import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { SiteNav } from "@/components/ase/SiteNav";

export const Route = createFileRoute("/diy")({
  head: () => ({
    meta: [
      { title: "DIY Garage — beginner car maintenance lessons | ASE Virtual" },
      {
        name: "description",
        content:
          "Step-by-step beginner lessons: check your oil and coolant, tire pressure, jump-starting, wiper blades and basic brake inspection — with safety warnings first.",
      },
      { property: "og:title", content: "DIY Garage | ASE Virtual" },
      {
        property: "og:description",
        content: "Plain-language, safety-first car maintenance lessons for complete beginners.",
      },
    ],
  }),
  component: DiyGarage,
});

interface Lesson {
  id: string;
  title: string;
  warning?: string;
  steps: string[];
}

const LESSONS: Lesson[] = [
  {
    id: "how-engine-works",
    title: "How an engine works",
    steps: [
      "Air enters through the intake and mixes with fuel.",
      "The piston compresses that mixture inside the cylinder.",
      "A spark ignites it, pushing the piston down — this is the power stroke.",
      "Exhaust gases leave through the exhaust valve and tailpipe.",
      "Four strokes — intake, compression, power, exhaust — repeat thousands of times a minute.",
    ],
  },
  {
    id: "check-oil",
    title: "How to check engine oil",
    warning: "Park on level ground, shut the engine off, and let it cool for a few minutes. Hot components and hot oil cause burns.",
    steps: [
      "Open the hood and locate the dipstick (usually a bright loop handle).",
      "Pull the dipstick out and wipe it clean with a rag.",
      "Reinsert it fully, then pull it out again and read the level.",
      "The oil film should sit between the MIN and MAX marks.",
      "If it is low, add the oil grade listed in your owner's manual a little at a time and re-check.",
    ],
  },
  {
    id: "check-coolant",
    title: "How to check coolant",
    warning: "Never open a radiator cap or coolant reservoir on a hot engine. Pressurized coolant can spray and cause severe burns. Wait until the engine is completely cool.",
    steps: [
      "With the engine cool, find the translucent coolant reservoir.",
      "Read the level against the MIN and MAX lines on the side — do not open the cap to check.",
      "If it is below MIN, add the coolant type specified for your vehicle.",
      "Repeated low coolant means a leak. Have it inspected rather than just topping it up.",
    ],
  },
  {
    id: "tire-pressure",
    title: "How to check tire pressure",
    steps: [
      "Check pressures when the tires are cold, before driving.",
      "Find the recommended pressure on the driver's door jamb sticker — not on the tire sidewall.",
      "Remove the valve cap and press a gauge squarely onto the valve.",
      "Add or release air until the reading matches the placard.",
      "Repeat for all four tires and the spare, then refit the caps.",
    ],
  },
  {
    id: "change-tire",
    title: "How to change a tire safely",
    warning: "Only change a tire on firm, level ground, well away from traffic. Never place any part of your body under a vehicle supported only by a jack.",
    steps: [
      "Turn on hazard lights, apply the parking brake, and chock a wheel at the opposite corner.",
      "Loosen the lug nuts about a quarter turn while the wheel is still on the ground.",
      "Position the jack at the manufacturer's lift point shown in your owner's manual.",
      "Raise the vehicle just enough to lift the tire clear, remove the lug nuts and wheel.",
      "Fit the spare, hand-tighten the lug nuts, lower the vehicle, then torque in a star pattern.",
      "Have the lug torque and the spare's pressure checked as soon as possible.",
    ],
  },
  {
    id: "jump-start",
    title: "How to jump-start a vehicle",
    warning: "Batteries can vent explosive hydrogen gas. Wear eye protection, keep sparks away, and never connect the final negative clamp to the dead battery's negative terminal.",
    steps: [
      "Park the vehicles close but not touching. Both ignitions off.",
      "Red clamp to the dead battery positive, other red clamp to the good battery positive.",
      "Black clamp to the good battery negative.",
      "Final black clamp to an unpainted metal ground point on the dead vehicle's engine — away from the battery.",
      "Start the good vehicle, wait a few minutes, then start the dead vehicle.",
      "Remove the clamps in the exact reverse order.",
    ],
  },
  {
    id: "wipers",
    title: "How to replace wiper blades",
    steps: [
      "Lift the wiper arm away from the glass until it locks upright.",
      "Press the release tab on the blade connector and slide the blade off.",
      "Slide the new blade on until the tab clicks.",
      "Lower the arm gently — a dropped arm can crack the windshield.",
    ],
  },
  {
    id: "brake-inspection",
    title: "Basic brake inspection",
    warning: "This is a visual check only. Brake work is safety-critical — leave repairs to a qualified technician.",
    steps: [
      "Look through the wheel spokes at the brake pad thickness against the rotor.",
      "Less than about 3 mm of friction material means it is time for service.",
      "Check for deep grooves or a lip on the rotor edge.",
      "Note any squealing, grinding or pulsation and describe it to your technician.",
    ],
  },
  {
    id: "maintenance-schedule",
    title: "Basic maintenance schedule",
    steps: [
      "Every fuel stop: glance at tires and any dashboard warnings.",
      "Monthly: tire pressures, engine oil, coolant, washer fluid.",
      "Every oil service: cabin and engine air filters, wiper condition, brake visual.",
      "Annually: brake fluid condition, battery test, suspension and tire wear inspection.",
      "Always defer to the interval table in your owner's manual.",
    ],
  },
];

function DiyGarage() {
  const [open, setOpen] = useState<string>(LESSONS[0]!.id);
  const lesson = LESSONS.find((l) => l.id === open)!;

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">DIY Garage</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Plain-language basics for people who know almost nothing about cars. Safety guidance comes
          first on every procedure.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-[18rem_1fr]">
          <div className="space-y-2">
            {LESSONS.map((l) => (
              <button
                key={l.id}
                onClick={() => setOpen(l.id)}
                className={`w-full rounded-sm border px-3 py-2.5 text-left text-sm transition-colors ${
                  open === l.id
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:bg-accent"
                }`}
              >
                {l.title}
              </button>
            ))}
          </div>

          <article className="panel-instrument p-6">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide">
              {lesson.title}
            </h2>
            {lesson.warning && (
              <p className="mt-4 flex gap-2 rounded-sm border border-destructive/60 bg-destructive/10 p-3 text-sm text-destructive">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <strong>Safety first: </strong>
                  {lesson.warning}
                </span>
              </p>
            )}
            <ol className="mt-6 space-y-3">
              {lesson.steps.map((s, i) => (
                <li key={s} className="flex gap-3 rounded-sm border border-border bg-panel px-4 py-3">
                  <span className="readout text-sm text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm">{s}</span>
                </li>
              ))}
            </ol>
          </article>
        </div>
      </main>
    </div>
  );
}
