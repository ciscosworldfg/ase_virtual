export type AiResult = { ok: true; text: string } | { ok: false; error: string };

/** Streams a Responses call through Lovable AI Gateway and returns the final text. */
export async function runResponses(instructions: string, input: unknown): Promise<AiResult> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return { ok: false, error: "AI is not configured." };

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
    return { ok: false, error: msg };
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let text = "";
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
        else if (ev.type === "error" || ev.type === "response.failed")
          return { ok: false, error: ev.error?.message ?? ev.response?.error?.message ?? "AI error." };
      } catch {}
    }
  }
  if (!text.trim()) return { ok: false, error: "The model returned no answer." };
  return { ok: true, text };
}
