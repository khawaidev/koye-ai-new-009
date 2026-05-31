import { getApiKeys } from "../lib/apiFallback"

const CEREBRAS_API_KEYS = getApiKeys("VITE_CEREBRAS_API_KEY")
const CEREBRAS_API_BASE = "https://api.cerebras.ai/v1"

export interface CerebrasMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export async function* sendMessageToCerebrasStream(
  model: string,
  messages: CerebrasMessage[],
  maxTokens?: number
): AsyncGenerator<string, void, unknown> {
  if (CEREBRAS_API_KEYS.length === 0) {
    throw new Error("Cerebras API key is required. Set VITE_CEREBRAS_API_KEY or VITE_CEREBRAS_API_KEY1..N in your .env file")
  }

  let lastError: Error | null = null

  for (const apiKey of CEREBRAS_API_KEYS) {
    try {
      const body: Record<string, unknown> = {
        model,
        messages,
        stream: true,
      }

      if (maxTokens) body.max_tokens = maxTokens

      if (model === "gpt-oss-120b") {
        body.reasoning_effort = "medium"
        body.reasoning_format = "hidden"
      }

      console.log(`📤 Cerebras API Request to model: ${model}`)

      const response = await fetch(`${CEREBRAS_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errMsg = `Cerebras API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        if ([401, 402, 403, 429, 503].includes(response.status)) {
          lastError = new Error(errMsg)
          continue
        }
        throw new Error(errMsg)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body stream")

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === "data: [DONE]") continue
          if (!trimmed.startsWith("data: ")) continue

          try {
            const json = JSON.parse(trimmed.slice(6))
            const delta = json.choices?.[0]?.delta?.content
            if (delta) {
              yield delta
            }
          } catch {
            // Skip malformed event payloads
          }
        }
      }

      if (buffer.trim() && buffer.trim() !== "data: [DONE]" && buffer.trim().startsWith("data: ")) {
        try {
          const json = JSON.parse(buffer.trim().slice(6))
          const delta = json.choices?.[0]?.delta?.content
          if (delta) yield delta
        } catch {
          // Skip malformed event payloads
        }
      }

      return
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const errMsg = lastError.message.toLowerCase()
      if (
        errMsg.includes("401") ||
        errMsg.includes("402") ||
        errMsg.includes("403") ||
        errMsg.includes("429") ||
        errMsg.includes("503") ||
        errMsg.includes("quota") ||
        errMsg.includes("insufficient") ||
        errMsg.includes("failed to fetch")
      ) {
        continue
      }
      throw lastError
    }
  }

  throw lastError || new Error("All Cerebras API keys failed")
}
