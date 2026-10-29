import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { OctagonX, ShieldAlert } from "lucide-react";
import { SiteNav } from "@/components/ase/SiteNav";
import { CustomerChat } from "@/components/ase/CustomerChat";
import { TestDrive } from "@/components/ase/TestDrive";
import { Garage } from "@/components/ase/Garage";
import { EngineLab } from "@/components/ase/EngineLab";
import { ScanTool } from "@/components/ase/ScanTool";
import { Multimeter } from "@/components/ase/Multimeter";
import { ToolBench } from "@/components/ase/ToolBench";
import { AnswerPanel } from "@/components/ase/AnswerPanel";
import { MasterTechPanel } from "@/components/ase/MasterTechPanel";
import { EstimateBuilder } from "@/components/ase/EstimateBuilder";
import { ServiceRoleplay } from "@/components/ase/ServiceRoleplay";
import { SymptomAssessment } from "@/components/ase/SymptomAssessment";
import { scenarioById } from "@/lib/sim/scenarios";
import { vehicleById, vehicleName } from "@/lib/sim/vehicles";
import { computeLiveData, initialState, type SimState } from "@/lib/sim/engine";
import { scoreAttempt, useProfile } from "@/lib/progress";

export const Route = createFileRoute("/scenario/$scenarioId")({
  loader: ({ params }) => {
    const scenario = scenarioById(params.scenarioId);
    if (!scenario) throw notFound();
    return { title: scenario.title, complaint: scenario.complaint };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Scenario unavailable | ASE Virtual" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.title} | ASE Virtual diagnostic session`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.complaint.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.complaint.slice(0, 155) },
      ],
    };
  },
  component: Session,
});

const BASE_STAGES = [
  { id: "interview", label: "Customer" },
  { id: "testdrive", label: "Test drive" },
  { id: "engine", label: "3D Engine Lab" },
  { id: "inspect", label: "Garage" },
  { id: "scan", label: "Scan tool" },
  { id: "meter", label: "Multimeter" },
  { id: "diagnose", label: "Diagnosis" },
] as const;

type Stage = string;


function Session() {
  const { scenarioId } = Route.useParams();
  const scenario = scenarioById(scenarioId)!;
  const vehicle = vehicleById(scenario.vehicleId)!;
  const { addAttempt } = useProfile();

  const STAGES = useMemo(() => {
    const toolStages = (scenario.tools ?? []).map((t) => ({ id: `tool:${t.id}`, label: t.title }));
    return [
      ...BASE_STAGES.filter((s) => {
        if (s.id === "scan" && scenario.hideScanTool) return false;
        if (s.id === "meter" && scenario.hideMultimeter) return false;
        return s.id !== "diagnose";
      }).map((s) => ({ id: s.id as string, label: s.label as string })),
      ...toolStages,
      { id: "diagnose", label: "Diagnosis" },
      { id: "service", label: "Service desk" },
    ];
  }, [scenario]);

  const [stage, setStage] = useState<Stage>("interview");

  const [state, setState] = useState<SimState>(() => initialState(vehicle));
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const [firstTry, setFirstTry] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [result, setResult] = useState<ReturnType<typeof scoreAttempt> | null>(null);
  const [stopped, setStopped] = useState(false);

  const markUsed = useCallback((tool: string) => {
    setToolsUsed((t) => (t.includes(tool) ? t : [...t, tool]));
  }, []);

  const useInterview = useCallback(() => markUsed("interview"), [markUsed]);
  const useDrive = useCallback(() => markUsed("testdrive"), [markUsed]);
  const useEngine = useCallback(() => markUsed("engine"), [markUsed]);
  const useInspect = useCallback(() => markUsed("inspect"), [markUsed]);
  const useScan = useCallback(() => markUsed("scan"), [markUsed]);
  const useMeter = useCallback(() => markUsed("meter"), [markUsed]);

  const data = useMemo(
    () => computeLiveData(state, vehicle, scenario.failure),
    [state, vehicle, scenario.failure],
  );

  const finish = () => {
    const seconds = Math.round((Date.now() - startedAt) / 1000);
    // Areas that do not use the OBD-II scanner or DMM should not be penalised
    // for skipping stages that were never offered.
    const scoringTools = [
      ...toolsUsed,
      ...(scenario.hideScanTool ? ["scan"] : []),
      ...(scenario.hideMultimeter ? ["meter"] : []),
    ];
    const scored = scoreAttempt({
      firstTryCorrect: firstTry,
      totalSteps: scenario.steps.length,
      wrongAnswers: wrong,
      toolsUsed: scoringTools,
      seconds,
      estimatedMinutes: scenario.estimatedMinutes,
    });

    setResult(scored);
    addAttempt({
      scenarioId: scenario.id,
      category: scenario.category,
      difficulty: scenario.difficulty,
      completedAt: Date.now(),
      firstTryCorrect: firstTry,
      totalSteps: scenario.steps.length,
      wrongAnswers: wrong,
      toolsUsed,
      seconds,
      score: scored.total,
    });
  };

  if (stopped) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <main className="mx-auto max-w-2xl px-4 py-20 text-center">
          <OctagonX className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide">
            Simulation stopped
          </h1>
          <p className="mt-2 text-muted-foreground">
            All simulated systems are shut down. No progress was recorded for this session.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setStopped(false)}
              className="rounded-sm border border-border px-4 py-2 text-sm hover:bg-accent"
            >
              Resume
            </button>
            <Link to="/scenarios" className="rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Back to library
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="label-tech text-signal">
              {scenario.category} · {scenario.difficulty}
            </span>
            <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide">
              {scenario.title}
            </h1>
            <p className="readout mt-1 text-sm text-muted-foreground">
              {vehicleName(vehicle)} · {vehicle.engine} · {vehicle.transmission} ·{" "}
              {vehicle.driveType} · {vehicle.mileage.toLocaleString()} mi
            </p>
          </div>
          <button
            onClick={() => setStopped(true)}
            className="flex items-center gap-2 rounded-sm border border-destructive/60 bg-destructive/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-destructive"
          >
            <OctagonX className="h-4 w-4" /> Stop simulation
          </button>
        </div>

        <nav className="mt-6 flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStage(s.id)}
              className={`rounded-sm border px-3 py-2 font-display text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                stage === s.id
                  ? "border-primary bg-primary/15 text-primary"
                  : toolsUsed.includes(s.id)
                    ? "border-ok/50 bg-ok/10 text-ok"
                    : "border-border bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-4">
            {stage === "interview" && <CustomerChat scenario={scenario} onUse={useInterview} />}
            {stage === "testdrive" && (
              <TestDrive
                scenario={scenario}
                vehicle={vehicle}
                state={state}
                setState={setState}
                onUse={useDrive}
              />
            )}
            {stage === "inspect" && <Garage points={scenario.inspection} onUse={useInspect} />}
            {stage === "engine" && <EngineLab running={state.running} rpm={state.rpm} coolant={state.coolant} load={data.load} vehicle={vehicleName(vehicle)} onUse={useEngine} />}
            {stage === "scan" && (
              <ScanTool
                data={data}
                codes={scenario.codes}
                freezeFrame={scenario.freezeFrame}
                onUse={useScan}
              />
            )}
            {stage === "meter" && (
              <Multimeter
                testPoints={scenario.testPoints}
                engineRunning={state.running}
                onUse={useMeter}
              />
            )}
            {(scenario.tools ?? []).map(
              (t) =>
                stage === `tool:${t.id}` && (
                  <ToolBench key={t.id} tool={t} onUse={() => markUsed(`tool:${t.id}`)} />
                ),
            )}

            {stage === "service" && (
              <>
                <ServiceRoleplay scenario={scenario} vehicle={vehicle} data={data} toolsUsed={toolsUsed} />
                <EstimateBuilder scenario={scenario} vehicle={vehicle} data={data} toolsUsed={toolsUsed} />
              </>
            )}
            {stage === "diagnose" &&
              (result ? (
                <SessionResult scenario={scenario} result={result} />
              ) : (
                <AnswerPanel
                  steps={scenario.steps}
                  onFirstTry={() => setFirstTry((f) => f + 1)}
                  onWrong={() => setWrong((w) => w + 1)}
                  onFinish={finish}
                />
              ))}
          </div>

          <aside className="space-y-4">
            <MasterTechPanel scenario={scenario} vehicle={vehicle} data={data} toolsUsed={toolsUsed} />
            <SymptomAssessment scenario={scenario} vehicle={vehicle} data={data} toolsUsed={toolsUsed} />
            <div className="panel-instrument p-4">
              <span className="label-tech">Evidence collected</span>
              <ul className="mt-3 space-y-1.5 text-sm">
                {STAGES.filter((s) => s.id !== "diagnose" && s.id !== "service").map((s) => (
                  <li key={s.id} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className={toolsUsed.includes(s.id) ? "text-ok" : "text-muted-foreground"}>
                      {toolsUsed.includes(s.id) ? "collected" : "pending"}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Answering without collecting evidence lowers your testing-procedure score.
              </p>
            </div>
            <div className="rounded-sm border border-caution/50 bg-caution/10 p-4 text-xs text-caution">
              <ShieldAlert className="mb-1.5 h-4 w-4" />
              Simulation only. Do not treat these steps as service instructions for a real vehicle.
              Always follow manufacturer procedures and lifting/electrical safety rules.
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function SessionResult({
  scenario,
  result,
}: {
  scenario: ReturnType<typeof scenarioById> & object;
  result: ReturnType<typeof scoreAttempt>;
}) {
  return (
    <div className="panel-instrument p-6">
      <span className="label-tech text-ok">Diagnosis complete</span>
      <div className="mt-3 flex items-end gap-3">
        <span className="readout text-5xl font-bold text-primary">{result.total}</span>
        <span className="label-tech pb-2">Skill score</span>
      </div>

      <div className="mt-6 space-y-2">
        {result.breakdown.map((b) => (
          <div key={b.label}>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {b.label} · {Math.round(b.weight * 100)}%
              </span>
              <span className="readout">{b.value}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${b.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3 text-sm">
        <p>
          <strong className="font-display uppercase tracking-wide">Root cause: </strong>
          {scenario.rootCause}
        </p>
        <p>
          <strong className="font-display uppercase tracking-wide">Repair & verification: </strong>
          {scenario.repair}
        </p>
        <p className="rounded-sm border border-border bg-panel p-3 text-muted-foreground">
          <strong className="text-foreground">Lesson: </strong>
          {scenario.lesson}
        </p>
      </div>

      <div className="mt-6 flex gap-2">
        <Link
          to="/dashboard"
          className="rounded-sm bg-primary px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground"
        >
          View dashboard
        </Link>
        <Link
          to="/scenarios"
          className="rounded-sm border border-border px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.14em] hover:bg-accent"
        >
          Next scenario
        </Link>
      </div>
    </div>
  );
}
