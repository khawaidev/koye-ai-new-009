import { getApiKeys } from "../lib/apiFallback"

const NVIDIA_API_KEYS = getApiKeys("VITE_NVIDIA_API_KEY")
const NVIDIA_API_BASE = "https://integrate.api.nvidia.com/v1"

// Use backend proxy to avoid CORS issues in browser
const BACKEND_URL = import.meta.env.VITE_NVIDIA_PROXY_URL || "/api/nvidia"
const USE_PROXY = true

export interface NvidiaMessage {
  role: "system" | "user" | "assistant"
  content: string
}

/**
 * Send a streaming chat completion to NVIDIA NIM API (SSE)
 * Yields text chunks as they arrive.
 * Uses backend proxy to avoid CORS issues in browser.
 */
export async function* sendMessageToNvidiaStream(
  model: string,
  messages: NvidiaMessage[],
  temperature: number = 1.0,
  maxTokens?: number,
  options?: { reasoningEnabled?: boolean; topP?: number; seed?: number }
): AsyncGenerator<string, void, unknown> {
  if (NVIDIA_API_KEYS.length === 0) {
    throw new Error("NVIDIA API key is required. Set VITE_NVIDIA_API_KEY in your .env file")
  }

  let lastError: Error | null = null

  for (const apiKey of NVIDIA_API_KEYS) {
    try {
      const body: any = {
        model,
        messages,
        temperature,
        top_p: options?.topP ?? 1,
        max_tokens: maxTokens || 16384,
        seed: options?.seed ?? 42,
        stream: true,
      }
      if (options?.reasoningEnabled) body.reasoning = { enabled: true }

      console.log(`📤 NVIDIA API Request to model: ${model}`)

      // Use proxy URL to avoid CORS in browser
      const url = USE_PROXY ? `${BACKEND_URL}/v1/chat/completions` : `${NVIDIA_API_BASE}/chat/completions`
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      
      // Pass API key via headers (both x-api-key for custom local proxy and Authorization for direct/Vite proxy)
      headers["Authorization"] = `Bearer ${apiKey}`
      headers["x-api-key"] = apiKey

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errMsg = `NVIDIA API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
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
        errMsg.includes("err_failed") ||
        errMsg.includes("cors")
      ) {
        continue
      }
      throw lastError
    }
  }

  throw lastError || new Error("All NVIDIA API keys failed")
}
