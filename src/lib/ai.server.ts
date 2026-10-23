export type AiResult = { ok: true; text: string } | { ok: false; error: string };

/**
 * Calls Google's Gemini API from the server. Keep GEMINI_API_KEY in the
 * deployment environment; never expose it to browser code or commit it.
 */
export async function runResponses(instructions: string, input: unknown): Promise<AiResult> {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) {
    return {
      ok: false,
      error: "AI instructor currently offline. Please use standard diagnostic guides.",
    };
  }

  const messages = Array.isArray(input) ? input : [{ role: "user", content: String(input ?? "") }];
  const contents = messages.map((item) => {
    const message = item && typeof item === "object" ? item as { role?: unknown; content?: unknown } : {};
    const role = message.role === "assistant" || message.role === "model" ? "model" : "user";
    return {
      role,
      parts: [{ text: typeof message.content === "string" ? message.content : JSON.stringify(message.content ?? "") }],
    };
  });

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: instructions }] },
          contents,
          generationConfig: { temperature: 0.2, maxOutputTokens: 1800 },
        }),
        signal: AbortSignal.timeout(20_000),
      },
    );

    const payload = await res.json().catch(() => null) as {
      error?: { message?: string; status?: string };
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    } | null;

    if (!res.ok) {
      if (res.status === 429) {
        return { ok: false, error: "Gemini is busy or its rate limit has been reached. Please use the standard diagnostic guides and try again later." };
      }
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: "The AI instructor is not available because its server configuration needs attention. Please use the standard diagnostic guides." };
      }
      return { ok: false, error: "AI instructor currently offline. Please use standard diagnostic guides." };
    }

    const text = (payload?.candidates?.[0]?.content?.parts ?? [])
      .map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) {
      return { ok: false, error: "Gemini returned no answer. Please use standard diagnostic guides and try again later." };
    }
    return { ok: true, text };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return {
      ok: false,
      error: timedOut
        ? "The AI instructor took too long to respond. Please use standard diagnostic guides and try again."
        : "AI instructor currently offline. Please use standard diagnostic guides.",
    };
  }
}
