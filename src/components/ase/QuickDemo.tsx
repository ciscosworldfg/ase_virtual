import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, Timer, XCircle } from "lucide-react";

const DEMO_SECONDS = 60;

type DemoStep =
  | { kind: "complaint" }
  | { kind: "evidence"; tool: string; finding: string; detail: string }
  | { kind: "decide" };

const STEPS: DemoStep[] = [
  { kind: "complaint" },
  {
    kind: "evidence",
    tool: "Scan tool",
    finding: "P0171 — System Too Lean (Bank 1)",
    detail: "Freeze frame captured at 742 rpm, coolant 88 °C, STFT +16.4%.",
  },
  {
    kind: "evidence",
    tool: "Live data",
    finding: "STFT +18% at idle, +4% at 2,500 rpm",
    detail: "The lean correction is worst at idle and nearly disappears with speed — the classic unmetered-air signature.",
  },
  {
    kind: "evidence",
    tool: "Garage inspection",
    finding: "Hissing near the PCV hose; hose soft and oil-soaked",
    detail: "Pinch the hose and idle smooths out for a moment.",
  },
  { kind: "decide" },
];

const CHOICES = [
  { id: "o2", label: "Failed upstream oxygen sensor", correct: false, why: "An O2 sensor fault wouldn't change with engine speed like this, and the PCV hose is physically hissing." },
  { id: "pcv", label: "Vacuum leak at the PCV hose", correct: true, why: "Lean at idle that improves with rpm plus a hissing, oil-soaked PCV hose — the evidence converges here." },
  { id: "pump", label: "Weak fuel pump", correct: false, why: "A weak pump gets worse under load, not better. Trims improved at 2,500 rpm." },
];

export function QuickDemo() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  const running = step > 0 && !done;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => Math.min(e + 1, DEMO_SECONDS)), 1000);
    return () => clearInterval(t);
  }, [running]);

  const current = STEPS[step];
  const choice = useMemo(() => CHOICES.find((c) => c.id === picked), [picked]);

  const reset = () => {
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
          <div className="text-center">
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              A customer rolls in with a rough idle and a check-engine light. You get the complaint,
              three pieces of evidence, and one decision — in about a minute.
            </p>
            <button
              onClick={() => setStep(1)}
              className="mt-5 rounded-sm bg-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start the demo
            </button>
          </div>
        )}

        {current?.kind === "complaint" && (
          <DemoCard
            kicker="Customer complaint · 2018 Honda Accord"
            title="“The engine runs rough and the check-engine light is on. It's worst when I'm sitting at a red light.”"
            body="A real technician starts here — symptoms, not guesses. Collect evidence before committing."
            onNext={() => setStep(2)}
            nextLabel="Pull the codes"
          />
        )}

        {current?.kind === "evidence" && (
          <DemoCard
            kicker={current.tool}
            title={current.finding}
            body={current.detail}
            onNext={() => setStep((s) => s + 1)}
            nextLabel={step < STEPS.length - 1 ? "Gather more evidence" : "Make the call"}
          />
        )}

        {current?.kind === "decide" && !done && (
          <div>
            <span className="label-tech text-signal">Your diagnosis</span>
            <p className="mt-2 text-sm text-muted-foreground">
              What is the most likely root cause?
            </p>
            <div className="mt-4 space-y-2">
              {CHOICES.map((c) => (
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

        {done && choice && (
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
                params={{ scenarioId: "accord-vacuum-leak" }}
                className="flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Run the full simulation <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={reset}
                className="flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 font-display text-xs font-bold uppercase tracking-[0.14em] hover:bg-accent"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Try again
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
