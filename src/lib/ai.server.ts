export type AiResult = { ok: true; text: string } | { ok: false; error: string };

/**
 * Calls Google's Gemini API from the server.
 * Preferred deployment variable: GEMINI_API_KEY.
 * Compatibility fallback: LAT_LEARNING_AUTOMOTIVE_TECH.
 * Both variables must be configured as server-side Vercel environment variables;
 * do not prefix either with VITE_ or expose either value to browser code.
 */
export async function runResponses(instructions: string, input: unknown): Promise<AiResult> {
  const key =
    process.env["GEMINI_API_KEY"]?.trim() ||
    process.env["LAT_LEARNING_AUTOMOTIVE_TECH"]?.trim();

  if (!key) {
    return {
      ok: false,
      error:
        "Gemini is not configured on the server. Add GEMINI_API_KEY or LAT_LEARNING_AUTOMOTIVE_TECH as a server-side Vercel environment variable, then redeploy.",
    };
  }

  const messages = Array.isArray(input)
    ? input
    : [{ role: "user", content: String(input ?? "") }];
  const contents = messages.map((item) => {
    const message =
      item && typeof item === "object"
        ? (item as { role?: unknown; content?: unknown })
        : {};
    const role =
      message.role === "assistant" || message.role === "model" ? "model" : "user";
    return {
      role,
      parts: [
        {
          text:
            typeof message.content === "string"
              ? message.content
              : JSON.stringify(message.content ?? ""),
        },
      ],
    };
  });

  let res: Response;
  let payload:
    | {
        error?: { message?: string; status?: string };
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
          finishReason?: string;
        }>;
        promptFeedback?: { blockReason?: string };
      }
    | null;

  try {
    res = await fetch(
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

    payload = (await res.json().catch(() => null)) as typeof payload;
  } catch {
    return {
      ok: false,
      error:
        "Could not reach Gemini. Check the deployment's network/runtime status and try again.",
    };
  }

  if (!res.ok) {
    let message = payload?.error?.message ?? "Gemini request failed.";
    if (res.status === 400) {
      message =
        "Gemini rejected the request. Check the API key's API restrictions and request settings.";
    } else if (res.status === 401 || res.status === 403) {
      message =
        "Gemini rejected the API key or its permissions. Verify the key in Google AI Studio and confirm the Generative Language API is enabled.";
    } else if (res.status === 404) {
      message =
        "The configured Gemini model was not found for this API. Verify model availability for the API version and project.";
    } else if (res.status === 429) {
      message =
        "Gemini quota or rate limit reached. Check the project's Gemini API quota and billing status.";
    } else if (res.status >= 500) {
      message = "Gemini is temporarily unavailable. Try again shortly.";
    }
    return { ok: false, error: message };
  }

  if (payload?.promptFeedback?.blockReason) {
    return {
      ok: false,
      error: `Gemini blocked the prompt (${payload.promptFeedback.blockReason}). Revise the request and try again.`,
    };
  }

  const text = (payload?.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    const reason = payload?.candidates?.[0]?.finishReason;
    return {
      ok: false,
      error: reason
        ? `Gemini returned no answer (finish reason: ${reason}). Try again or check the API quota and safety settings.`
        : "Gemini returned no answer. Try again or check the API quota.",
    };
  }

  return { ok: true, text };
}
