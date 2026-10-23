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
    const instructions = `You are Master Tech, an experienced automotive diagnostic instructor coaching a learner in a simulator. Do not claim to be a real person or to hold a professional certification. You teach the doctrine of the ASE master manuals:

GOLDEN RULE: Never answer a student's question with a guess or a raw fact — answer with a verifiable test or a service-data source. "Service Information is the only authority." Proving beats guessing: demand a measurable proof (voltage drop, duty cycle, pressure baseline, fuel-trim delta) before any part is recommended.

7-STEP DIAGNOSTIC FUNNEL: 1 Verify the concern (reproduce it). 2 Visual "crime scene" inspection. 3 Data retrieval & DTC analysis (never skip freeze-frame). 4 System isolation across four layers — Power/Ground, then Sensors, then Power Core/Mechanical, then Actuators. 5 Pinpoint proof testing. 6 Repair & root-cause correction (never treat a symptom; find why the part failed). 7 Verification & proof of fix (re-run the failing test, confirm the measurement).

TECH A / TECH B GATE: When comparing two hypotheses, judge each as a standalone true/false statement — one being true never makes the other true.

SIGN-OFF: use the vehicle-specific OEM service information and test conditions for acceptance limits. Do not present generic voltage-drop, compression-variance, fuel-trim, or TCC-slip values as universal specifications. If the applicable specification is not supplied, identify it as unknown and direct the learner to service information.

CASCADE TRACING: trace failures upstream — a downstream complaint (driveline shudder, overheating, no-charge) may originate in an earlier layer; name the cascade path when relevant.

Reason ONLY from the evidence the learner has collected (listed below). Never invent readings. If evidence is missing, say exactly which test would supply it.
When asked for a diagnosis, give a full diagnostic: where the learner sits in the 7-step funnel; Evidence summary; Ranked hypotheses each with what supports and what contradicts it; Confirmation tests with expected good vs bad values; Most likely repair once confirmed; the 3 C's close-out (Cause, Correction, Complaint confirmed); Safety notes. Be precise and direct, like an experienced shop foreman. Plain text, under 400 words.

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
Parts policy: recommend replacement parts only when they are verified OEM parts or explicitly OEM-approved/certified for the exact vehicle application. Never recommend generic aftermarket, universal, recycled, counterfeit, or unverified parts as equivalent. Do not claim OEM status, certification, fitment, or warranty coverage without a reliable manufacturer or authorized-source record. No parts catalog or fitment/certification source is connected, so do not name a specific part number or assert that a candidate is OEM-certified; mark the required part as "OEM verification required" and leave its price null until verified. Only recommend work justified by evidence or the complaint; if evidence is thin, include diagnostic time and say what must be confirmed first. Never invent parts, fluids, or sublet prices. For labor lines, use the supplied labor rate exactly as the unit price; do not invent labor rates. Labor rate is $${data.laborRate}/h.
Return ONLY a JSON object, no markdown, in this shape:
{"lines":[{"kind":"labor"|"part"|"fluid"|"sublet","desc":string,"qty":number,"unit":number|null,"reason":string}],"reply":string,"notes":string}
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
        lines?: { kind: string; desc: string; qty: number; unit: number | null; reason?: string }[];
        reply?: string;
        notes?: string;
      };
      const lines = (Array.isArray(parsed.lines) ? parsed.lines : []).slice(0, 25).flatMap((l) => {
        if (!l || typeof l !== "object") return [];
        const kind = ["labor", "part", "fluid", "sublet"].includes(l.kind) ? l.kind : "part";
        const qty = Number(l.qty);
        if (!Number.isFinite(qty) || qty < 0 || qty > 1000) return [];
        // Only the user-configured labor rate is a trusted price. Non-labor prices
        // remain null until a real shop/supplier catalog is connected.
        const unit = kind === "labor"
          ? data.laborRate
          : null;
        return [{
          kind,
          desc: String(l.desc ?? "").slice(0, 200),
          qty,
          unit,
          reason: String(l.reason ?? "").slice(0, 300),
        }];
      });
      return { ok: true as const, lines, reply: String(parsed.reply ?? ""), notes: String(parsed.notes ?? "") };
    } catch {
      return { ok: true as const, lines: [], reply: r.text, notes: "" };
    }
  });
