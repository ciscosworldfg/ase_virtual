import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, Timer, XCircle } from "lucide-react";

const DEMO_SECONDS = 60;

interface DemoCase {
  id: string;
  scenarioId: string;
  category: string;
  vehicle: string;
  tagline: string;
  complaint: string;
  evidence: { tool: string; finding: string; detail: string }[];
  choices: { id: string; label: string; correct: boolean; why: string }[];
}

const DEMO_CASES: DemoCase[] = [
  {
    id: "accord",
    scenarioId: "accord-vacuum-leak",
    category: "A8 · Engine Performance",
    vehicle: "2018 Honda Accord",
    tagline: "Rough idle, check-engine light",
    complaint:
      "“The engine runs rough and the check-engine light is on. It's worst when I'm sitting at a red light.”",
    evidence: [
      {
        tool: "Scan tool",
        finding: "P0171 — System Too Lean (Bank 1)",
        detail: "Freeze frame captured at 742 rpm, coolant 88 °C, STFT +16.4%.",
      },
      {
        tool: "Live data",
        finding: "STFT +18% at idle, +4% at 2,500 rpm",
        detail:
          "The lean correction is worst at idle and nearly disappears with speed — the classic unmetered-air signature.",
      },
      {
        tool: "Garage inspection",
        finding: "Hissing near the PCV hose; hose soft and oil-soaked",
        detail: "Pinch the hose and idle smooths out for a moment.",
      },
    ],
    choices: [
      { id: "o2", label: "Failed upstream oxygen sensor", correct: false, why: "An O2 sensor fault wouldn't change with engine speed like this, and the PCV hose is physically hissing." },
      { id: "pcv", label: "Vacuum leak at the PCV hose", correct: true, why: "Lean at idle that improves with rpm plus a hissing, oil-soaked PCV hose — the evidence converges here." },
      { id: "pump", label: "Weak fuel pump", correct: false, why: "A weak pump gets worse under load, not better. Trims improved at 2,500 rpm." },
    ],
  },
  {
    id: "camry",
    scenarioId: "camry-brake-pulsation",
    category: "A5 · Brakes",
    vehicle: "2016 Toyota Camry",
    tagline: "Steering wheel shakes when braking",
    complaint:
      "“When I brake from highway speed the steering wheel shakes in my hands. Around town it's fine.”",
    evidence: [
      {
        tool: "Test drive",
        finding: "Pulsation only above ~70 km/h, pedal kicks back lightly",
        detail: "No pull, no noise at low speed. The shake scales with wheel speed, not engine speed.",
      },
      {
        tool: "Brake measurement",
        finding: "Front rotor thickness variation 0.04 mm (spec max 0.015 mm)",
        detail: "Measured at 8 points around the rotor with a micrometer. Runout is borderline but thickness variation is clearly out.",
      },
      {
        tool: "Visual inspection",
        finding: "Blue heat spots on both front rotors",
        detail: "Rear brakes even and healthy; hoses and calipers move freely.",
      },
    ],
    choices: [
      { id: "tires", label: "Wheel balance / tire defect", correct: false, why: "A balance issue shakes all the time at speed — this one only appears while braking." },
      { id: "rotor", label: "Front rotor thickness variation", correct: true, why: "Speed-dependent pulsation under braking plus measured thickness variation and heat spots — the evidence converges here." },
      { id: "caliper", label: "Seized rear caliper", correct: false, why: "A seized caliper causes pull and a hot wheel, not a steering-wheel shake. Rears measured even and cool." },
    ],
  },
  {
    id: "silverado",
    scenarioId: "silverado-charging",
    category: "A6 · Electrical",
    vehicle: "2015 Chevrolet Silverado",
    tagline: "Battery light, dim headlights",
    complaint:
      "“The battery light comes on and the headlights go dim, mostly at night with the heater on. New battery last month — same problem.”",
    evidence: [
      {
        tool: "Scan tool",
        finding: "P0562 — System Voltage Low",
        detail: "Freeze frame: 11.9 V at 1,850 rpm with headlights and blower on.",
      },
      {
        tool: "Multimeter",
        finding: "13.1 V at the battery, 14.4 V at the alternator B+ stud — engine running",
        detail: "The alternator makes good voltage, but 1.3 V is lost between the stud and the battery.",
      },
      {
        tool: "Voltage-drop test",
        finding: "0.9 V drop across the B+ cable; green corrosion under the insulation",
        detail: "Spec is under 0.2 V. The cable looks fine from the outside.",
      },
    ],
    choices: [
      { id: "alt", label: "Failed alternator", correct: false, why: "The alternator puts out 14.4 V at its own stud — it's doing its job. The voltage never reaches the battery." },
      { id: "cable", label: "Corroded B+ cable (high resistance)", correct: true, why: "Good voltage at the alternator, low at the battery, and a 0.9 V drop across the cable — the evidence converges here." },
      { id: "bat", label: "Defective new battery", correct: false, why: "A bad battery can't explain a 1.3 V difference between the alternator stud and the battery post while running." },
    ],
  },
  {
    id: "altima",
    scenarioId: "altima-cvt-judder",
    category: "A2 · Transmission",
    vehicle: "2017 Nissan Altima",
    tagline: "Shudder under light throttle",
    complaint:
      "“Between 40 and 60 the car shudders like driving over rumble strips, but only when I ease into the gas. Floor it and it's smooth.”",
    evidence: [
      {
        tool: "Test drive",
        finding: "Shudder at 40–60 km/h under light, steady throttle only",
        detail: "Goes away the instant you lift or press harder. Engine rpm stays steady — it doesn't feel like a misfire.",
      },
      {
        tool: "CVT fluid condition",
        finding: "Fluid dark brown, burnt smell, metallic sparkle",
        detail: "CVT fluid should be clear green. This fluid has never been changed at 142,000 km.",
      },
      {
        tool: "TCM data review",
        finding: "Torque-converter slip rpm oscillates 80–140 rpm during the shudder",
        detail: "Lock-up clutch is being commanded on, but it can't hold — it grabs and releases rapidly.",
      },
    ],
    choices: [
      { id: "misfire", label: "Engine misfire under load", correct: false, why: "Rpm stays smooth and steady through the shudder, and it vanishes with more throttle — a misfire gets worse with load." },
      { id: "tcc", label: "Torque-converter clutch shudder (degraded CVT fluid)", correct: true, why: "Light-throttle-only shudder, burnt fluid, and slip rpm oscillating as the clutch grabs and releases — the evidence converges here." },
      { id: "mount", label: "Broken engine mount", correct: false, why: "A mount clunks on throttle transitions; it doesn't produce a sustained rumble-strip shudder in a narrow speed band." },
    ],
  },
];

export function QuickDemo() {
  const [caseId, setCaseId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  const demo = useMemo(() => DEMO_CASES.find((c) => c.id === caseId), [caseId]);
  const running = step > 0 && !done;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => Math.min(e + 1, DEMO_SECONDS)), 1000);
    return () => clearInterval(t);
  }, [running]);

  // step 0 = picker, 1 = complaint, 2..1+evidence.length = evidence, then decide
  const evidenceStep = demo && step >= 2 && step - 2 < demo.evidence.length ? demo.evidence[step - 2] : undefined;
  const deciding = demo && step - 2 === demo.evidence.length;
  const choice = useMemo(() => demo?.choices.find((c) => c.id === picked), [demo, picked]);

  const reset = () => {
    setCaseId(null);
    setStep(0);
    setPicked(null);
    setElapsed(0);
    setDone(false);
  };

  return (
    <div className="panel-instrument overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-panel px-4 py-3">
        <Timer className="h-4 w-4 text-primary" />
        <span className="font-display text-sm font-bold uppercase tracking-[0.18em]">
          60-second diagnostic demo
        </span>
        <span className="ml-auto readout text-sm text-muted-foreground">
          {running || done ? `0:${String(Math.max(0, DEMO_SECONDS - elapsed)).padStart(2, "0")}` : "no sign-up needed"}
        </span>
      </div>

      <div className="p-5">
        {step === 0 && (
          <div>
            <p className="text-sm text-muted-foreground">
              Pick a vehicle. You get the complaint, three pieces of evidence, and one decision —
              in about a minute.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {DEMO_CASES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCaseId(c.id);
                    setStep(1);
                  }}
                  className="rounded-sm border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/60 hover:bg-accent"
                >
                  <span className="label-tech text-signal">{c.category}</span>
                  <span className="mt-1 block text-sm font-semibold">{c.vehicle}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{c.tagline}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {demo && step === 1 && (
          <DemoCard
            kicker={`Customer complaint · ${demo.vehicle}`}
            title={demo.complaint}
            body="A real technician starts here — symptoms, not guesses. Collect evidence before committing."
            onNext={() => setStep(2)}
            nextLabel="Start gathering evidence"
          />
        )}

        {demo && evidenceStep && (
          <DemoCard
            kicker={evidenceStep.tool}
            title={evidenceStep.finding}
            body={evidenceStep.detail}
            onNext={() => setStep((s) => s + 1)}
            nextLabel={step - 2 < demo.evidence.length - 1 ? "Gather more evidence" : "Make the call"}
          />
        )}

        {demo && deciding && !done && (
          <div>
            <span className="label-tech text-signal">Your diagnosis</span>
            <p className="mt-2 text-sm text-muted-foreground">
              What is the most likely root cause?
            </p>
            <div className="mt-4 space-y-2">
              {demo.choices.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setPicked(c.id);
                    setDone(true);
                  }}
                  className="w-full rounded-sm border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:border-primary/60 hover:bg-accent"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {demo && done && choice && (
          <div>
            <div className="flex items-center gap-2">
              {choice.correct ? (
                <CheckCircle2 className="h-5 w-5 text-ok" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              <span
                className={`font-display text-sm font-bold uppercase tracking-[0.14em] ${
                  choice.correct ? "text-ok" : "text-destructive"
                }`}
              >
                {choice.correct ? "Correct — evidence-based call" : "Not supported by the evidence"}
              </span>
              <span className="ml-auto readout text-xs text-muted-foreground">
                finished in {elapsed}s
              </span>
            </div>
            <p className="mt-3 rounded-sm border border-border bg-panel p-3 text-sm text-muted-foreground">
              {choice.why}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/scenario/$scenarioId"
                params={{ scenarioId: demo.scenarioId }}
                className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Run the full simulation <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={reset}
                className="flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 font-display text-xs font-bold uppercase tracking-[0.14em] hover:bg-accent"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Try another vehicle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DemoCard({
  kicker,
  title,
  body,
  onNext,
  nextLabel,
}: {
  kicker: string;
  title: string;
  body: string;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div>
      <span className="label-tech text-signal">{kicker}</span>
      <p className="mt-2 text-lg font-medium leading-snug">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <button
        onClick={onNext}
        className="mt-5 flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
      >
        {nextLabel} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
