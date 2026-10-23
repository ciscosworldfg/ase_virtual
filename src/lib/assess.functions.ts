import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runResponses } from "./ai.server";

const Input = z.object({
  symptom: z.string().min(3).max(2000),
  vehicle: z.string().max(300),
  complaint: z.string().max(1000),
  category: z.string().max(40),
  toolsUsed: z.array(z.string().max(40)).max(20),
  codes: z.array(z.string().max(120)).max(20),
  liveData: z.record(z.union([z.number(), z.boolean()])),
});

export const assessSymptom = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const instructions = `You are Master Tech, an ASE master automotive technician coaching a learner.
Produce a grounded, step-by-step diagnostic assessment using ONLY the simulation evidence provided.
Rules: never invent measurements; cite exact values from the live data when you use them; do not state the root cause as fact — rank hypotheses and give the confirmation test for each; flag which evidence is still missing.
Format in plain text with these headings: Symptom summary, Evidence on hand, Hypotheses (ranked), Next tests (numbered, each with expected good vs bad result), Safety notes. Keep it under 350 words.`;

    const input = `Learner's symptom description: ${data.symptom}
Vehicle: ${data.vehicle}
ASE area: ${data.category}
Customer complaint: ${data.complaint}
Tools the learner has used so far: ${data.toolsUsed.join(", ") || "none"}
Codes retrieved: ${data.toolsUsed.includes("scan") ? data.codes.join("; ") || "none stored" : "not yet scanned"}
Current live simulation data: ${JSON.stringify(data.liveData)}`;

    // All Gemini requests go through the shared server-only helper.
    // GEMINI_API_KEY remains on the server and is never sent to the browser.
    const result = await runResponses(instructions, input);
    if (!result.ok) {
      return { ok: false as const, error: result.error };
    }

    return { ok: true as const, text: result.text };
  });
