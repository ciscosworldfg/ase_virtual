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
      error: "Gemini is not configured on the server. Add GEMINI_API_KEY to the Vercel Production environment and redeploy.",
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
    },
  );

  const payload = await res.json().catch(() => null) as {
    error?: { message?: string; status?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  } | null;

  if (!res.ok) {
    let message = payload?.error?.message ?? "Gemini request failed.";
    if (res.status === 400) message = "Gemini rejected the request. Check the API key's API restrictions and request settings.";
    else if (res.status === 401 || res.status === 403) message = "Gemini rejected the API key or its permissions. Verify the key in Google AI Studio and that the Generative Language API is enabled.";
    else if (res.status === 429) message = "Gemini quota or rate limit reached. Check the project's Gemini API quota and billing status.";
    return { ok: false, error: message };
  }

  const text = (payload?.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) return { ok: false, error: "Gemini returned no answer. Try again or check the API quota." };
  return { ok: true, text };
}
