import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runResponses } from "./ai.server";

const Ctx = z.object({
  vehicle: z.string().max(300),
  category: z.string().max(40),
  complaint: z.string().max(1000),
  evidence: z.array(z.string().max(300)).max(60),
  toolsUsed: z.array(z.string().max(40)).max(30),
  liveData: z.record(z.union([z.number(), z.boolean(), z.string()])),
});

export const askMasterTech = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    Ctx.extend({
      history: z
        .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
        .max(20),
      question: z.string().min(2).max(1000),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const instructions = `You are Master Tech, an ASE-certified master automotive technician coaching a learner in a diagnostic simulator.
Reason ONLY from the evidence the learner has collected (listed below). Never invent readings. If evidence is missing, say exactly which test would supply it.
When asked for a diagnosis, give a full diagnostic: Evidence summary, Ranked hypotheses (each with what supports / contradicts it), Confirmation tests (with expected good vs bad values), Most likely repair once confirmed, Safety notes. Be precise and direct, like an experienced shop foreman. Plain text, under 400 words.

Vehicle: ${data.vehicle}
ASE area: ${data.category}
Customer complaint: ${data.complaint}
Stages completed: ${data.toolsUsed.join(", ") || "none"}
Collected evidence:
${data.evidence.map((e) => `- ${e}`).join("\n") || "- none yet"}
Live simulation data: ${JSON.stringify(data.liveData)}`;

    const input = [
      ...data.history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: data.question },
    ];
    return runResponses(instructions, input);
  });

export const serviceRoleplay = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    Ctx.extend({ customerMessage: z.string().min(3).max(2000), laborRate: z.number().min(0).max(1000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const instructions = `You are a professional automotive service advisor at a repair shop. The user is role-playing a customer describing a complaint.
Using the customer's words plus the technician's collected evidence, produce a repair estimate and a reply to the customer.
Rules: only recommend work justified by the evidence or the complaint; if evidence is thin, include diagnostic time and say what must be confirmed first. Use realistic US parts prices and labor-guide hours. Labor rate is $${data.laborRate}/h.
Respond with ONLY a JSON object, no markdown, in this shape:
{"lines":[{"kind":"labor"|"part"|"fluid"|"sublet","desc":string,"qty":number,"unit":number,"reason":string}],"reply":string,"notes":string}
For labor lines, qty is hours and unit is the labor rate. "reply" is what you say to the customer (friendly, plain language, 80-160 words, explains findings, cost, and next steps). "notes" is a one-line internal note for the technician.

Vehicle: ${data.vehicle}
ASE area: ${data.category}
Original complaint on file: ${data.complaint}
Technician evidence:
${data.evidence.map((e) => `- ${e}`).join("\n") || "- none collected yet"}
Live data: ${JSON.stringify(data.liveData)}`;

    const r = await runResponses(instructions, `Customer says: ${data.customerMessage}`);
    if (!r.ok) return r;
    const m = r.text.match(/\{[\s\S]*\}/);
    try {
      const parsed = JSON.parse(m ? m[0] : r.text) as {
        lines?: { kind: string; desc: string; qty: number; unit: number; reason?: string }[];
        reply?: string;
        notes?: string;
      };
      const lines = (parsed.lines ?? []).slice(0, 25).map((l) => ({
        kind: ["labor", "part", "fluid", "sublet"].includes(l.kind) ? l.kind : "part",
        desc: String(l.desc ?? "").slice(0, 200),
        qty: Number(l.qty) || 0,
        unit: Number(l.unit) || 0,
        reason: String(l.reason ?? "").slice(0, 300),
      }));
      return { ok: true as const, lines, reply: String(parsed.reply ?? ""), notes: String(parsed.notes ?? "") };
    } catch {
      return { ok: true as const, lines: [], reply: r.text, notes: "" };
    }
  });
