import { getApiKeys } from "../lib/apiFallback"
import { sendMessageToGeminiStream } from "./gemini"

const LAYSOAI_API_BASE = "https://laysoai.com/v1"

function normalizeLaysoModel(model: string): string {
  switch (model) {
    case "gemini-3.1-pro-preview-thinking":
      return "gemini-3-pro-preview"
    case "claude-opus-4.7-thinking":
      return "claude-opus-4-7-thinking"
    default:
      return model
  }
}

export interface LaysoAIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

/**
 * Send a streaming chat completion to LaysoAI API (SSE)
 * Yields text chunks as they arrive.
 */
export async function* sendMessageToLaysoAIStream(
  model: string,
  messages: LaysoAIMessage[],
  temperature: number = 0.8,
  maxTokens?: number
): AsyncGenerator<string, void, unknown> {
  const normalizedModel = normalizeLaysoModel(model)
  const modelLower = normalizedModel.toLowerCase()
  let apiKeys: string[] = []

  if (modelLower.includes("deepseek")) {
    apiKeys = getApiKeys("VITE_LAYSOAI_DEEPSEEK_API_KEY")
  } else if (modelLower.includes("gpt")) {
    apiKeys = getApiKeys("VITE_LAYSOAI_OPENAI_API_KEY")
  } else if (modelLower.includes("claude") || modelLower.includes("opus") || modelLower.includes("sonnet")) {
    apiKeys = getApiKeys("VITE_LAYSOAI_ANTHROPHIC_API_KEY")
    if (apiKeys.length === 0) {
      apiKeys = getApiKeys("VITE_LAYSOAI_ANTHROPIC_API_KEY")
    }
  } else if (modelLower.includes("gemini")) {
    apiKeys = getApiKeys("VITE_LAYSOAI_GEMINI_API_KEY")
  }

  // Fallback to Gemini 3.1 Flash Lite if no keys configured
  if (apiKeys.length === 0) {
    console.warn(`[LaysoAI] No keys found for model ${normalizedModel}. Falling back to Gemini 3.1 Flash Lite (VITE_GEMINI_API_KEY)...`)
    const geminiMsgs = messages.map(m => {
      let role: "user" | "model" = m.role === "assistant" ? "model" : "user"
      let text = m.content
      if (m.role === "system") {
        role = "user"
        text = "SYSTEM INSTRUCTION: " + text
      }
      return {
        role,
        parts: [{ text }]
      }
    })
    for await (const chunk of sendMessageToGeminiStream(geminiMsgs, "gemini-3-flash-live")) {
      yield chunk
    }
    return
  }

  let lastError: Error | null = null

  for (const apiKey of apiKeys) {
    try {
      let body: any = {
        model: normalizedModel,
        stream: true,
      }
      
      let endpoint = ""

      if (modelLower.includes("opus") || modelLower.includes("claude")) {
        endpoint = "/messages"
        // Claude-like expects system prompt separated
        const systemMsg = messages.find(m => m.role === "system")
        if (systemMsg) {
            body.system = systemMsg.content
        }
        body.messages = messages.filter(m => m.role !== "system")
        
        body.max_tokens = maxTokens || 8000
        if (modelLower.includes("thinking")) {
            body.thinking = {
                type: "adaptive"
            }
            body.output_config = {
                effort: modelLower.includes("opus-4-7") ? "high" : "medium"
            }
        }
      } else {
        endpoint = "/chat/completions" // Assuming standard openai-like endpoint for GPT models
        body.messages = messages
        // Workaround for LaysoAI proxy potentially requiring 'input' for some models/configurations
        body.input = messages.map(m => m.content).join("\n")
        if (maxTokens) body.max_tokens = maxTokens
      }

      console.log(`📤 LaysoAI API Request to model: ${normalizedModel}`)

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (endpoint === "/messages") {
        headers["x-api-key"] = apiKey
        headers["anthropic-version"] = "2023-06-01"
      } else {
        headers["Authorization"] = `Bearer ${apiKey}`
      }

      const response = await fetch(`${LAYSOAI_API_BASE}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errMsg = `LaysoAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        // Rotate on credit or rate limit errors
        if ([401, 402, 403, 429].includes(response.status)) {
          lastError = new Error(errMsg)
          console.warn("[LaysoAI] Key exhausted/rate limited, rotating...")
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
            let delta = ""
            
            // Claude uses type: content_block_delta, delta.text
            if (json.type === "content_block_delta" && json.delta?.type === "text_delta") {
                delta = json.delta.text
            } else if (json.choices?.[0]?.delta?.content) {
                // GPT format
                delta = json.choices[0].delta.content
            }
            
            if (delta) {
              yield delta
            }
          } catch {
            // Skip
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim() && buffer.trim() !== "data: [DONE]" && buffer.trim().startsWith("data: ")) {
        try {
          const json = JSON.parse(buffer.trim().slice(6))
          let delta = ""
          if (json.type === "content_block_delta" && json.delta?.type === "text_delta") {
              delta = json.delta.text
          } else if (json.choices?.[0]?.delta?.content) {
              delta = json.choices[0].delta.content
          }
          if (delta) yield delta
        } catch {
          // Skip
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
        errMsg.includes("quota") ||
        errMsg.includes("insufficient") ||
        errMsg.includes("failed to fetch")
      ) {
        continue
      }
      throw lastError
    }
  }

  // Fallback to Gemini 3.1 Flash Lite if all LaysoAI keys fail
  console.warn(`[LaysoAI] All keys failed for model ${normalizedModel}. Falling back to Gemini 3.1 Flash Lite (VITE_GEMINI_API_KEY)...`, lastError)
  const geminiMsgs = messages.map(m => {
    let role: "user" | "model" = m.role === "assistant" ? "model" : "user"
    let text = m.content
    if (m.role === "system") {
      role = "user"
      text = "SYSTEM INSTRUCTION: " + text
    }
    return {
      role,
      parts: [{ text }]
    }
  })
  for await (const chunk of sendMessageToGeminiStream(geminiMsgs, "gemini-3-flash-live")) {
    yield chunk
  }
}
