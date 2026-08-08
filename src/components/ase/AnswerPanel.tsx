import { useState } from "react";
import { CheckCircle2, GraduationCap, XCircle } from "lucide-react";
import type { McqStep } from "@/lib/sim/types";

export function AnswerPanel({
  steps,
  onFinish,
  onFirstTry,
  onWrong,
}: {
  steps: McqStep[];
  onFinish: () => void;
  onFirstTry: () => void;
  onWrong: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  const step = steps[index];
  if (!step) return null;

  const option = step.options.find((o) => o.id === picked);
  const correct = option?.correct === true;

  const submit = (id: string) => {
    setPicked(id);
    const opt = step.options.find((o) => o.id === id);
    if (opt?.correct) {
      if (!attempted) onFirstTry();
    } else {
      setAttempted(true);
      onWrong();
    }
  };

  const next = () => {
    if (index === steps.length - 1) {
      onFinish();
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
    setAttempted(false);
  };

  return (
    <div className="panel-instrument overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-panel px-4 py-3">
        <span className="font-display text-sm font-bold uppercase tracking-[0.18em]">
          Diagnostic decision
        </span>
        <span className="label-tech">
          Step {index + 1} / {steps.length}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-semibold">{step.prompt}</h3>

        <div className="mt-4 space-y-2">
          {step.options.map((o, i) => {
            const isPicked = picked === o.id;
            const state =
              picked === null
                ? "idle"
                : isPicked
                  ? o.correct
                    ? "right"
                    : "wrong"
                  : correct && o.correct
                    ? "right"
                    : "idle";
            return (
              <button
                key={o.id}
                disabled={correct}
                onClick={() => submit(o.id)}
                className={`flex w-full items-start gap-3 rounded-sm border px-3 py-3 text-left text-sm transition-colors ${
                  state === "right"
                    ? "border-ok bg-ok/10"
                    : state === "wrong"
                      ? "border-destructive bg-destructive/10"
                      : "border-border bg-panel hover:bg-accent"
                }`}
              >
                <span className="readout mt-0.5 text-xs text-muted-foreground">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{o.text}</span>
                {state === "right" && <CheckCircle2 className="h-4 w-4 shrink-0 text-ok" />}
                {state === "wrong" && <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
              </button>
            );
          })}
        </div>

        {option && (
          <div
            className={`mt-5 rounded-sm border p-4 ${
              correct ? "border-ok/50 bg-ok/5" : "border-destructive/50 bg-destructive/5"
            }`}
          >
            <span className="label-tech flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" /> Diagnostic review
            </span>
            <p className="mt-2 text-sm">
              <strong>Your answer:</strong> {option.text}
              <br />
              <strong>Result:</strong> {correct ? "Correct." : "Incorrect."}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <strong className="text-foreground">Master technician reasoning: </strong>
              {option.reasoning}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <strong className="text-foreground">Principle: </strong>
              {step.principle}
            </p>

            {correct ? (
              <button
                onClick={next}
                className="mt-4 rounded-sm bg-primary px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground"
              >
                {index === steps.length - 1 ? "Complete diagnosis" : "Continue"}
              </button>
            ) : (
              <button
                onClick={() => setPicked(null)}
                className="mt-4 rounded-sm border border-border px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] hover:bg-accent"
              >
                Return to the simulation and try this step again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
