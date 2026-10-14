import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, RefreshCw, XCircle } from "lucide-react";
import {
  EXAM_AREAS,
  EXAM_QUESTIONS,
  type ExamArea,
  readExamScores,
  writeExamScore,
} from "@/lib/study/exam-bank";

export function PracticeExam() {
  const [area, setArea] = useState<ExamArea | "ALL">("ALL");
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [firstTry, setFirstTry] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState<Record<string, number | undefined>>({});

  useEffect(() => {
    setBest(readExamScores() as Record<string, number | undefined>);
  }, []);

  const questions = useMemo(
    () => (area === "ALL" ? EXAM_QUESTIONS : EXAM_QUESTIONS.filter((q) => q.area === area)),
    [area],
  );

  const start = (a: ExamArea | "ALL") => {
    setArea(a);
    setStarted(true);
    setIdx(0);
    setPicked(null);
    setFirstTry(0);
    setWrong(0);
    setDone(false);
  };

  const pick = (id: string) => {
    if (picked) return;
    setPicked(id);
    const correct = id === questions[idx].correct;
    if (correct) setFirstTry((n) => n + 1);
    else setWrong((n) => n + 1);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      const pct = Math.round((firstTry / questions.length) * 100);
      if (area !== "ALL") writeExamScore(area, pct);
      setBest(readExamScores() as Record<string, number | undefined>);
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
  };

  if (!started) {
    return (
      <div>
        <p className="text-sm text-muted-foreground">
          Master practice exam in the ASE style. Every statement is judged as a standalone
          true/false — the rule: if both technicians are independently correct, the answer is
          always <span className="text-foreground">both</span>. Rationale follows every answer.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => start("ALL")}
            className="panel-instrument p-4 text-left transition-colors hover:bg-accent"
          >
            <span className="font-display text-base font-bold uppercase tracking-wide">
              Full comprehensive
            </span>
            <span className="label-tech mt-1 block">{EXAM_QUESTIONS.length} questions · A1–A8</span>
            <span className="label-tech mt-2 block text-primary">Start mock master exam →</span>
          </button>
          {EXAM_AREAS.map((a) => {
            const count = EXAM_QUESTIONS.filter((q) => q.area === a.id).length;
            const b = best[a.id];
            return (
              <button
                key={a.id}
                onClick={() => start(a.id)}
                className="panel-instrument p-4 text-left transition-colors hover:bg-accent"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-base font-bold tracking-wide">{a.id}</span>
                  {b !== undefined && <span className="readout text-xs text-primary">best {b}%</span>}
                </div>
                <span className="label-tech mt-1 block">{a.name}</span>
                <span className="label-tech mt-2 block text-muted-foreground">{count} questions</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((firstTry / questions.length) * 100);
    return (
      <div className="panel-instrument p-6 text-center">
        <p className="label-tech">Mock exam complete · {area === "ALL" ? "A1–A8" : area}</p>
        <p className="readout mt-3 text-5xl font-bold text-primary">{pct}%</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {firstTry} first-try correct · {wrong} missed · {questions.length} questions
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          {pct >= 80
            ? "Shop-foreman standard. The doctrine is holding: every answer was backed by a measurement, not a hunch."
            : "Review the rationales you missed, then re-run the exam. Distractors look right — the condition decides."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => start(area)}
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4" /> Run it again
          </button>
          <button
            onClick={() => setStarted(false)}
            className="rounded-sm border border-border bg-panel px-4 py-2 text-sm"
          >
            Choose another area
          </button>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const correct = picked === q.correct;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStarted(false)}
          className="label-tech inline-flex items-center gap-1 rounded-sm border border-border bg-panel px-2.5 py-1.5 hover:bg-accent"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Exit
        </button>
        <span className="label-tech">
          {q.area} · question {idx + 1}/{questions.length}
        </span>
        <span className="label-tech ml-auto">
          {firstTry} correct · {wrong} missed
        </span>
      </div>
      <div className="mt-2 h-1 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-signal transition-all"
          style={{ width: `${((idx + (picked ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="panel-instrument mt-4 p-5">
        <p className="text-base leading-relaxed">{q.prompt}</p>
        {q.kind === "techab" && (
          <div className="mt-4 space-y-2">
            <p className="rounded-sm border border-border bg-panel px-3 py-2 text-sm">
              <span className="label-tech mr-2 text-primary">Tech A</span>
              {q.techA}
            </p>
            <p className="rounded-sm border border-border bg-panel px-3 py-2 text-sm">
              <span className="label-tech mr-2 text-primary">Tech B</span>
              {q.techB}
            </p>
          </div>
        )}
        <div className="mt-4 space-y-2">
          {q.options.map((o) => {
            const isPicked = picked === o.id;
            const isCorrect = o.id === q.correct;
            const revealed = picked !== null;
            return (
              <button
                key={o.id}
                disabled={revealed}
                onClick={() => pick(o.id)}
                className={`flex w-full items-start gap-3 rounded-sm border px-3 py-2.5 text-left text-sm transition-colors ${
                  revealed && isCorrect
                    ? "border-signal bg-signal/10"
                    : isPicked
                      ? "border-destructive bg-destructive/10"
                      : "border-border bg-panel hover:bg-accent"
                } ${revealed ? "cursor-default" : ""}`}
              >
                <span className="label-tech mt-0.5 shrink-0 font-bold">{o.id}</span>
                <span className="flex-1">{o.text}</span>
                {revealed && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-signal" />}
                {revealed && isPicked && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="mt-4 rounded-sm border border-border bg-background p-4">
            <p className="label-tech text-primary">{correct ? "Correct" : "Not proven — read the proof"}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{q.rationale}</p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            disabled={picked === null}
            onClick={next}
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            {idx + 1 >= questions.length ? "Finish exam" : "Next question"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
