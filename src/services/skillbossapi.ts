import { getApiKeys } from "../lib/apiFallback"

const SKILLBOSS_API_KEYS = getApiKeys("VITE_SKILLBOSS_API_KEY")
const SKILLBOSS_API_BASE = "https://api.skillboss.co/v1"

export async function* sendMessageToSkillbossStream(
  model: string,
  inputs: any
): AsyncGenerator<string, void, unknown> {
  if (SKILLBOSS_API_KEYS.length === 0) {
    throw new Error("SkillBoss API key is required. Set VITE_SKILLBOSS_API_KEY in your .env file")
  }

  let lastError: Error | null = null

  for (const apiKey of SKILLBOSS_API_KEYS) {
    try {
      const response = await fetch(`${SKILLBOSS_API_BASE}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || "openai/gpt-5.1",
          inputs: inputs,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errMsg = `SkillBoss API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        
        if (response.status === 429 || response.status === 401 || response.status === 403) {
          lastError = new Error(errMsg)
          continue
        }
        throw new Error(errMsg)
      }

      // Read as normal JSON for this run endpoint, assuming it might not stream or streams custom
      // If it doesn't stream, we'll just yield the final result.
      const data = await response.json()
      yield JSON.stringify(data)

      return
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (lastError.message.includes("429") || lastError.message.includes("401") || lastError.message.includes("403")) {
         continue
      }
      throw lastError
    }
  }

  throw lastError || new Error("All SkillBoss API keys failed")
}

// ─── Vision API (chat completions with image input) ──────────────────────────
const SKILLBOSS_CHAT_BASE = "https://api.heybossai.com/v1"

export interface SkillBossVisionMessage {
  role: "system" | "user" | "assistant"
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >
}

/**
 * Send an image + text prompt to SkillBoss GPT-5.1 for vision analysis.
 * Returns the model's text response.
 *
 * @param guideText - System prompt / guide content for the model
 * @param imageBase64 - Base64-encoded image data (without the data:... prefix)
 * @param mimeType  - Image MIME type (e.g. "image/png")
 * @param userPrompt - The user-visible prompt describing what to analyze
 * @param model - Model ID (default: "openai/gpt-5.1")
 */
export async function sendVisionToSkillBoss(
  guideText: string,
  imageBase64: string,
  mimeType: string,
  userPrompt: string,
  model: string = "openai/gpt-5.1"
): Promise<string> {
  if (SKILLBOSS_API_KEYS.length === 0) {
    throw new Error("SkillBoss API key is required. Set VITE_SKILLBOSS_API_KEY in your .env file")
  }

  const messages: SkillBossVisionMessage[] = [
    { role: "system", content: guideText },
    {
      role: "user",
      content: [
        { type: "text", text: userPrompt },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${imageBase64}`,
          },
        },
      ],
    },
  ]

  let lastError: Error | null = null

  for (const apiKey of SKILLBOSS_API_KEYS) {
    try {
      console.log(`[SkillBoss Vision] Sending to ${model}...`)

      const response = await fetch(`${SKILLBOSS_CHAT_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 4000,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errMsg = `SkillBoss Vision API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`

        if ([401, 402, 403, 429].includes(response.status)) {
          lastError = new Error(errMsg)
          console.warn("[SkillBoss Vision] Key exhausted/rate limited, rotating...")
          continue
        }
        throw new Error(errMsg)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      if (!content) {
        throw new Error("SkillBoss Vision returned empty response")
      }

      console.log(`[SkillBoss Vision] Success — ${content.length} chars`)
      return content
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const errMsg = lastError.message.toLowerCase()
      if (
        errMsg.includes("401") ||
        errMsg.includes("402") ||
        errMsg.includes("403") ||
        errMsg.includes("429") ||
        errMsg.includes("quota") ||
        errMsg.includes("failed to fetch")
      ) {
        continue
      }
      throw lastError
    }
  }

  throw lastError || new Error("All SkillBoss API keys failed for vision request")
}
