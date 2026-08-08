import { useCallback, useEffect, useState } from "react";
import type { AseCategory, Difficulty } from "./sim/types";

export interface AttemptRecord {
  scenarioId: string;
  category: AseCategory;
  difficulty: Difficulty;
  completedAt: number;
  firstTryCorrect: number;
  totalSteps: number;
  wrongAnswers: number;
  toolsUsed: string[];
  seconds: number;
  score: number;
}

export interface ProfileData {
  goal: string | null;
  experience: string | null;
  name: string;
  attempts: AttemptRecord[];
}

const KEY = "ase-virtual-profile-v1";

const EMPTY: ProfileData = { goal: null, experience: null, name: "Technician", attempts: [] };

function read(): ProfileData {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as ProfileData) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export const SCORE_WEIGHTS = {
  diagnosticAccuracy: 0.3,
  testingProcedure: 0.2,
  evidenceInterpretation: 0.2,
  safety: 0.1,
  repairSelection: 0.1,
  efficiency: 0.1,
};

export function scoreAttempt(input: {
  firstTryCorrect: number;
  totalSteps: number;
  wrongAnswers: number;
  toolsUsed: string[];
  seconds: number;
  estimatedMinutes: number;
}) {
  const accuracy = input.totalSteps ? input.firstTryCorrect / input.totalSteps : 0;
  const expectedTools = ["interview", "testdrive", "inspect", "scan", "meter"];
  const procedure =
    expectedTools.filter((t) => input.toolsUsed.includes(t)).length / expectedTools.length;
  const evidence = Math.max(0, accuracy * 0.6 + procedure * 0.4);
  const safety = input.toolsUsed.includes("inspect") ? 1 : 0.6;
  const repair = input.wrongAnswers === 0 ? 1 : Math.max(0.4, 1 - input.wrongAnswers * 0.2);
  const budget = input.estimatedMinutes * 60;
  const efficiency = Math.max(0.3, Math.min(1, budget / Math.max(60, input.seconds)));

  const w = SCORE_WEIGHTS;
  const total =
    accuracy * w.diagnosticAccuracy +
    procedure * w.testingProcedure +
    evidence * w.evidenceInterpretation +
    safety * w.safety +
    repair * w.repairSelection +
    efficiency * w.efficiency;

  return {
    total: Math.round(total * 100),
    breakdown: [
      { label: "Diagnostic accuracy", value: Math.round(accuracy * 100), weight: w.diagnosticAccuracy },
      { label: "Testing procedure", value: Math.round(procedure * 100), weight: w.testingProcedure },
      { label: "Evidence interpretation", value: Math.round(evidence * 100), weight: w.evidenceInterpretation },
      { label: "Safety", value: Math.round(safety * 100), weight: w.safety },
      { label: "Repair selection", value: Math.round(repair * 100), weight: w.repairSelection },
      { label: "Efficiency", value: Math.round(efficiency * 100), weight: w.efficiency },
    ],
  };
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfile(read());
    setLoaded(true);
  }, []);

  const save = useCallback((next: ProfileData) => {
    setProfile(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setOnboarding = useCallback(
    (goal: string, experience: string) => save({ ...read(), goal, experience }),
    [save],
  );

  const addAttempt = useCallback(
    (attempt: AttemptRecord) => {
      const current = read();
      save({ ...current, attempts: [attempt, ...current.attempts].slice(0, 60) });
    },
    [save],
  );

  const reset = useCallback(() => save(EMPTY), [save]);

  return { profile, loaded, setOnboarding, addAttempt, reset };
}

export function summarize(attempts: AttemptRecord[]) {
  if (!attempts.length) {
    return { overall: 0, accuracy: 0, firstTime: 0, efficiency: 0, safety: 0, byCategory: {} as Record<string, number> };
  }
  const avg = (fn: (a: AttemptRecord) => number) =>
    Math.round(attempts.reduce((s, a) => s + fn(a), 0) / attempts.length);

  const byCategory: Record<string, number> = {};
  for (const a of attempts) {
    const prev = byCategory[a.category];
    byCategory[a.category] = prev === undefined ? a.score : Math.round((prev + a.score) / 2);
  }

  return {
    overall: avg((a) => a.score),
    accuracy: avg((a) => (a.firstTryCorrect / a.totalSteps) * 100),
    firstTime: Math.round(
      (attempts.filter((a) => a.wrongAnswers === 0).length / attempts.length) * 100,
    ),
    efficiency: avg((a) => Math.min(100, Math.round((a.totalSteps * 180) / Math.max(60, a.seconds) * 100) / 1)),
    safety: avg((a) => (a.toolsUsed.includes("inspect") ? 100 : 60)),
    byCategory,
  };
}
