import { getApiKeys } from "../lib/apiFallback"

const ROUTEWAY_API_KEYS = getApiKeys("VITE_ROUTEWAY_API_KEY")
const ROUTEWAY_API_BASE = "https://api.routeway.ai"

export interface RoutewayMessage {
  role: "system" | "user" | "assistant"
  content: string
}

/**
 * Send a streaming chat completion to Routeway API (SSE)
 * Yields text chunks as they arrive.
 */
export async function* sendMessageToRoutewayStream(
  model: string,
  messages: RoutewayMessage[],
  temperature: number = 0.8,
  maxTokens?: number
): AsyncGenerator<string, void, unknown> {
  if (ROUTEWAY_API_KEYS.length === 0) {
    throw new Error("Routeway API key is required. Set VITE_ROUTEWAY_API_KEY in your .env file")
  }

  let lastError: Error | null = null

  for (const apiKey of ROUTEWAY_API_KEYS) {
    try {
      const body: any = {
        model,
        messages,
        temperature,
        stream: true,
      }
      if (maxTokens) body.max_tokens = maxTokens

      console.log(`📤 Routeway API Request to model: ${model}`)

      const response = await fetch(`${ROUTEWAY_API_BASE}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errMsg = `Routeway API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        if ([401, 402, 403, 429].includes(response.status)) {
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

        // Process SSE lines
        const lines = buffer.split("\n")
        buffer = lines.pop() || "" // Keep incomplete line in buffer

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
            // Skip malformed JSON lines
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim() && buffer.trim() !== "data: [DONE]" && buffer.trim().startsWith("data: ")) {
        try {
          const json = JSON.parse(buffer.trim().slice(6))
          const delta = json.choices?.[0]?.delta?.content
          if (delta) yield delta
        } catch {
          // Skip
        }
      }

      // Successful stream — exit
      return
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const errMsg = lastError.message.toLowerCase()
      if (
        errMsg.includes("401") ||
        errMsg.includes("402") ||
        errMsg.includes("403") ||
        errMsg.includes("429") ||
        errMsg.includes("quota") ||
        errMsg.includes("failed to fetch") ||
        errMsg.includes("err_failed")
      ) {
        continue
      }
      throw lastError
    }
  }

  throw lastError || new Error("All Routeway API keys failed")
}
