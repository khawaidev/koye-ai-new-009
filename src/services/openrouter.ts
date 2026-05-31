import { getApiKeys } from "../lib/apiFallback"

const OPENROUTER_API_KEYS = getApiKeys("VITE_OPENROUTER_API_KEY")
const OPENROUTER_API_BASE = "https://openrouter.ai"

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant"
  content: string
}

/**
 * Send a streaming chat completion to OpenRouter API (SSE)
 * Yields text chunks as they arrive.
 */
export async function* sendMessageToOpenRouterStream(
  model: string,
  messages: OpenRouterMessage[],
  temperature: number = 0.8,
  maxTokens?: number,
  options?: { reasoningEnabled?: boolean }
): AsyncGenerator<string, void, unknown> {
  if (OPENROUTER_API_KEYS.length === 0) {
    throw new Error("OpenRouter API key is required. Set VITE_OPENROUTER_API_KEY in your .env file")
  }

  let lastError: Error | null = null

  for (const apiKey of OPENROUTER_API_KEYS) {
    try {
      const body: any = {
        model,
        messages,
        temperature,
        stream: true,
      }
      if (maxTokens) body.max_tokens = maxTokens
      if (options?.reasoningEnabled) body.reasoning = { enabled: true }

      console.log(`📤 OpenRouter API Request to model: ${model}`)

      const response = await fetch(`${OPENROUTER_API_BASE}/api/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin || "https://koye.ai",
          "X-OpenRouter-Title": "KOYE AI",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errMsg = `OpenRouter API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
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

  throw lastError || new Error("All OpenRouter API keys failed")
}

/**
 * Send a non-streaming chat completion to OpenRouter API
 */
export async function sendMessageToOpenRouter(
  model: string,
  messages: OpenRouterMessage[],
  temperature: number = 0.8,
  maxTokens?: number,
  options?: { reasoningEnabled?: boolean }
): Promise<string> {
  if (OPENROUTER_API_KEYS.length === 0) {
    throw new Error("OpenRouter API key is required. Set VITE_OPENROUTER_API_KEY in your .env file")
  }

  let lastError: Error | null = null

  for (const apiKey of OPENROUTER_API_KEYS) {
    try {
      const body: any = {
        model,
        messages,
        temperature,
        stream: false,
      }
      if (maxTokens) body.max_tokens = maxTokens
      if (options?.reasoningEnabled) body.reasoning = { enabled: true }

      console.log(`📤 OpenRouter Non-Streaming Request to model: ${model}`)

      const response = await fetch(`${OPENROUTER_API_BASE}/api/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.origin || "https://koye.ai",
          "X-OpenRouter-Title": "KOYE AI",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errMsg = `OpenRouter API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        if ([401, 402, 403, 429].includes(response.status)) {
          lastError = new Error(errMsg)
          continue
        }
        throw new Error(errMsg)
      }

      const json = await response.json()
      return json.choices?.[0]?.message?.content || ""
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

  throw lastError || new Error("All OpenRouter API keys failed")
}
