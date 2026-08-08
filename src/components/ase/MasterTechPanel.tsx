import { useState } from "react";
import { Bot } from "lucide-react";
import type { LiveDataFrame } from "@/lib/sim/engine";
import type { Scenario } from "@/lib/sim/types";

/**
 * MASTER TECH reasons only from evidence the user has actually collected in
 * this session. It never invents measurements and never states the root cause
 * outright.
 */
export function MasterTechPanel({
  scenario,
  data,
  toolsUsed,
}: {
  scenario: Scenario;
  data: LiveDataFrame;
  toolsUsed: string[];
}) {
  const [messages, setMessages] = useState<{ who: "tech" | "ai"; text: string }[]>([
    {
      who: "ai",
      text: "I'm Master Tech. I'll reason from the evidence you've actually gathered — nothing more. Gather data, then ask me what it means.",
    },
  ]);

  const evidence = () => {
    const facts: string[] = [];
    if (toolsUsed.includes("interview")) facts.push(`the customer reports: “${scenario.complaint}”`);
    if (toolsUsed.includes("testdrive"))
      facts.push(
        `on the test drive the vehicle showed ${scenario.testDriveEvents[1]?.detail.toLowerCase() ?? "the reported symptom"}`,
      );
    if (toolsUsed.includes("scan"))
      facts.push(
        scenario.codes.length
          ? `stored codes are ${scenario.codes.map((c) => c.code).join(", ")}, with fuel trims at STFT ${data.stft}% / LTFT ${data.ltft}%`
          : "no codes are stored, so this is a mechanical concern you must measure",
      );
    if (toolsUsed.includes("inspect")) {
      const bad = scenario.inspection.find((i) => i.abnormal);
      if (bad) facts.push(`inspection of the ${bad.label.toLowerCase()} was abnormal: ${bad.findings[0]?.toLowerCase()}`);
    }
    if (toolsUsed.includes("meter"))
      facts.push("your meter readings are on the bench and should be compared against specification");
    return facts;
  };

  const ask = (prompt: string) => {
    const facts = evidence();
    let reply: string;
    if (!facts.length) {
      reply =
        "I don't have any evidence from you yet. Interview the customer, drive the vehicle, then pull codes. I won't guess ahead of the data.";
    } else if (prompt.startsWith("What does")) {
      reply = `Based on the available evidence — ${facts.join("; ")} — I'd form a hypothesis, not a conclusion. Ask yourself which single fault explains every one of those observations at once.`;
    } else if (prompt.startsWith("What should I test")) {
      reply = `Your next move should be a test that can prove your hypothesis wrong, not one that just agrees with it. ${
        toolsUsed.includes("meter")
          ? "You've used the meter; compare each reading against the published spec before you commit."
          : "You haven't measured anything yet — put probes on the circuit before condemning a component."
      }`;
    } else {
      reply = `Here's my discipline: separate what you know from what you suspect. Known right now: ${facts.join("; ")}. Everything else is hypothesis until a confirmation test moves it across the line.`;
    }
    setMessages((m) => [...m, { who: "tech", text: prompt }, { who: "ai", text: reply }]);
  };

  return (
    <div className="panel-instrument overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-panel px-4 py-3">
        <Bot className="h-4 w-4 text-primary" />
        <span className="font-display text-sm font-bold uppercase tracking-[0.18em]">
          Master Tech
        </span>
      </div>
      <div className="max-h-72 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <p
            key={i}
            className={`rounded-sm px-3 py-2 text-sm ${
              m.who === "tech"
                ? "ml-auto max-w-[85%] border border-primary/40 bg-primary/10"
                : "max-w-[92%] border border-border bg-panel text-muted-foreground"
            }`}
          >
            {m.text}
          </p>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border p-3">
        {[
          "What does the evidence show so far?",
          "What should I test next?",
          "How do I stay disciplined here?",
        ].map((q) => (
          <button
            key={q}
            onClick={() => ask(q)}
            className="rounded-sm border border-border bg-panel px-3 py-1.5 text-xs hover:bg-accent"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
