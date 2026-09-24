import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false as const, error: "AI is not configured." };

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

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions,
        input,
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
      }),
    });

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      let msg = `AI request failed (${res.status}).`;
      if (res.status === 402) msg = "AI credits are used up for this workspace. Add credits to continue.";
      else if (res.status === 429) msg = "Too many requests right now — please wait a moment and try again.";
      else {
        try {
          msg = JSON.parse(body)?.error?.message ?? msg;
        } catch {}
      }
      return { ok: false as const, error: msg };
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let text = "";
    let reasoning = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") text += ev.delta;
          else if (ev.type === "response.reasoning_summary_text.delta") reasoning += ev.delta;
          else if (ev.type === "error" || ev.type === "response.failed")
            return { ok: false as const, error: ev.error?.message ?? ev.response?.error?.message ?? "AI error." };
        } catch {}
      }
    }
    if (!text.trim()) {
      return reasoning
        ? { ok: true as const, text: reasoning }
        : { ok: false as const, error: "The model returned no assessment." };
    }
    return { ok: true as const, text };
  });
