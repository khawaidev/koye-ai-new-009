import type { ModelMode } from "../types"
import { sendMessageToOpenRouterStream } from "./openrouter"
import { sendMessageToLaysoAIStream, type LaysoAIMessage } from "./laysoai"
import { sendMessageToClodStream, type ClodMessage } from "./clodapi"
import { sendMessageToCerebrasStream, type CerebrasMessage } from "./cerebras"

export type OrchestratorIntent = "orchestrator" | "general_chatting" | "game_coding" | "initial_prototype" | "playable_game_active"

export interface ModelSwitchInfo {
  intent: OrchestratorIntent
  modelName: string
  displayName: string
  preferredModelId?: string
  allowedModelIds?: string[]
  thinkingLevel?: "low" | "medium" | "high"
}

interface OrchestratorRouteOptions {
  mode?: ModelMode
  selectedModelId?: string
  repeatedErrorCount?: number // to trigger game_coding fallback to gpt-5.2
}

/**
 * Classify user intent using strict heuristic matching.
 */
export async function classifyIntent(
  userMessage: string,
  hasImages: boolean = false
): Promise<OrchestratorIntent> {
  const text = userMessage.toLowerCase()

  // Strict prototype triggers
  const prototypeKeywords = [
    "full game prototype",
    "end to end planner",
    "initial full game plan",
    "design document",
    "prototype blueprint"
  ]
  const isPrototype = prototypeKeywords.some(kw => text.includes(kw))
  if (isPrototype && text.length > 30) {
    console.log("[Orchestrator] Strict match → initial_prototype")
    return "initial_prototype"
  }

  // Playable game active triggers
  const playableKeywords = [
    "playable game active",
    "after paralium",
    "post prototype",
    "now play the game"
  ]
  const isPlayable = playableKeywords.some(kw => text.includes(kw))
  if (isPlayable) {
     return "playable_game_active"
  }

  // Strict coding triggers
  const gameCodingStrongRegex = /(export class|function |=>|multiplayer networking|physics engine|shader code|complex algorithm|refactor this|debug this error|fix this bug|type error|stack trace|referenceerror|typeerror)/i
  const isCoding = gameCodingStrongRegex.test(text)
  
  if (isCoding || text.includes("```") || (text.length > 150 && text.includes("code"))) {
    console.log("[Orchestrator] Strict match → game_coding")
    return "game_coding"
  }

  console.log("[Orchestrator] Defaulting to general_chatting")
  return "general_chatting"
}

// Model Hierarchy Lists
const ORCHESTRATOR_MODELS = [
  "gemma-4-31b",
  "gemma-4-26b",
  "gemma-3-27b",
] as const

const GENERAL_CHATTING_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
] as const

export function getModelInfo(intent: OrchestratorIntent, isHeavy: boolean = false): ModelSwitchInfo {
  switch (intent) {
    case "orchestrator":
      return {
        intent,
        modelName: "gemma-4-31b",
        displayName: "Gemma 4 31B (Orchestrator)",
        preferredModelId: ORCHESTRATOR_MODELS[0],
        allowedModelIds: [...ORCHESTRATOR_MODELS],
      }
    case "initial_prototype":
      return {
        intent,
        modelName: "claude-opus-4.7-thinking",
        displayName: "Claude Opus 4.7 Thinking (LaysoAI)",
        preferredModelId: "claude-opus-4.7-thinking",
      }
    case "playable_game_active":
      if (isHeavy) {
        return {
           intent,
           modelName: "claude-sonnet-4-5-20250929",
           displayName: "Claude Sonnet 4.5",
           preferredModelId: "claude-sonnet-4-5-20250929"
        }
      }
      return {
         intent,
         modelName: "claude-sonnet-4-5-20250929",
         displayName: "Claude Sonnet 4.5",
         preferredModelId: "claude-sonnet-4-5-20250929"
      }
    case "game_coding":
      if (isHeavy) {
        return {
          intent,
          modelName: "claude-sonnet-4-5-20250929",
          displayName: "Claude Sonnet 4.5",
          preferredModelId: "claude-sonnet-4-5-20250929",
        }
      }
      return {
        intent,
        modelName: "gemini-3.1-flash-lite",
        displayName: "Gemini 3.1 Flash Lite",
        preferredModelId: "gemini-3.1-flash-lite",
      }
    case "general_chatting":
    default:
      return {
        intent: "general_chatting",
        modelName: "gemini-3.1-flash-lite",
        displayName: "Gemini 3.1 Flash Lite",
        preferredModelId: GENERAL_CHATTING_MODELS[0],
        allowedModelIds: [...GENERAL_CHATTING_MODELS],
      }
  }
}

/**
 * Convert Gemini-format messages to standard system/user/assistant format
 */
export function convertToStandardMessages(
  geminiMessages: Array<{
    role: "user" | "model"
    parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>
  }>
): Array<{ role: "system" | "assistant" | "user"; content: string }> {
  const standardMessages: Array<{ role: "system" | "assistant" | "user"; content: string }> = []
  let systemInjected = false

  for (const msg of geminiMessages) {
    const textParts = msg.parts
      .filter((p) => p.text)
      .map((p) => p.text!)
      .join("\n")

    if (textParts) {
      if (
        !systemInjected &&
        msg.role === "user" &&
        textParts.startsWith("SYSTEM INSTRUCTION:")
      ) {
        standardMessages.push({
          role: "system",
          content: textParts.replace(/^SYSTEM INSTRUCTION:\s*/i, "").trim(),
        })
        systemInjected = true
        continue
      }

      standardMessages.push({
        role: msg.role === "model" ? "assistant" : "user",
        content: textParts,
      })
    }
  }

  return standardMessages
}
export const convertToHyperrealMessages = convertToStandardMessages

export async function* routeMessageStream(
  geminiMessages: Array<{
    role: "user" | "model"
    parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>
  }>,
  options: OrchestratorRouteOptions = {},
  onModelSwitch?: (info: ModelSwitchInfo) => void
): AsyncGenerator<string, OrchestratorIntent, unknown> {
  const selectedMode: ModelMode = options.mode || "auto"
  const selectedModelId = options.selectedModelId

  if (selectedMode === "models" && selectedModelId) {
    const isGeminiSDKModel = selectedModelId.startsWith("gemini") && !selectedModelId.includes("preview") || selectedModelId.startsWith("gemma")
    const isClodModel = selectedModelId === "qwen-3-235B-a22b-thinking-2507" || selectedModelId === "Qwen 3 235B A22B Thinking 2507"
    const isOpenRouterModel = [
      "moonshotai/kimi-k2.6:free",
      "nvidia/nemotron-3-super-120b-a12b:free",
      "poolside/laguna-m.1:free",
      "openai/gpt-oss-120b:free",
      "deepseek/deepseek-v4-flash:free",
      "z-ai/glm-4.5-air:free",
    ].includes(selectedModelId)
    const isCerebrasModel = [
      "gpt-oss-120b",
    ].includes(selectedModelId)
    const isLaysoModel = [
      "deepseek-v4-pro",
      "gemini-3-pro-preview",
      "gemini-3.1-pro-preview-thinking",
      "gpt-5.2",
      "claude-opus-4.5",
      "claude-opus-4.7-thinking",
      "claude-opus-4-7-thinking",
      "claude-sonnet-4.5",
      "claude-sonnet-4-5-20250929",
    ].includes(selectedModelId)
    
    onModelSwitch?.({
      intent: "game_coding",
      modelName: selectedModelId,
      displayName: selectedModelId,
      preferredModelId: selectedModelId,
      allowedModelIds: [selectedModelId],
      thinkingLevel: (selectedModelId === "gemini-3.1-flash-lite" || selectedModelId === "gemini-3.5-flash") ? "medium" : undefined
    })

    if (isGeminiSDKModel) {
      return "game_coding"
    } else if (isClodModel) {
      const msgs = convertToStandardMessages(geminiMessages) as ClodMessage[]
      for await (const chunk of sendMessageToClodStream(msgs)) {
        yield chunk
      }
      return "game_coding"
    } else if (isCerebrasModel) {
      const msgs = convertToStandardMessages(geminiMessages) as CerebrasMessage[]
      for await (const chunk of sendMessageToCerebrasStream(selectedModelId, msgs)) {
        yield chunk
      }
      return "game_coding"
    } else if (isLaysoModel) {
      const msgs = convertToStandardMessages(geminiMessages) as LaysoAIMessage[]
      for await (const chunk of sendMessageToLaysoAIStream(selectedModelId, msgs)) {
        yield chunk
      }
      return "game_coding"
    } else if (isOpenRouterModel) {
      const msgs = convertToStandardMessages(geminiMessages) as any[]
      for await (const chunk of sendMessageToOpenRouterStream(selectedModelId, msgs)) {
        yield chunk
      }
      return "game_coding"
    } else {
      const msgs = convertToStandardMessages(geminiMessages) as any[]
      for await (const chunk of sendMessageToOpenRouterStream(selectedModelId, msgs)) {
        yield chunk
      }
      return "game_coding"
    }
  }

  const lastMsg = geminiMessages[geminiMessages.length - 1]
  const userText = lastMsg?.parts.filter(p => p.text).map(p => p.text!).join(" ") || ""
  const hasImages = lastMsg?.parts.some(p => p.inlineData) || false

  const isHeavy = userText.length > 800 || userText.includes("heavy task") || userText.includes("complex") || (options.repeatedErrorCount && options.repeatedErrorCount >= 2) || false
  let intent = await classifyIntent(userText, hasImages)

  // Mode overrides
  if (selectedMode === "auto" && intent === "general_chatting") {
    intent = "orchestrator"
  } else if (selectedMode === "paralium") {
    // Paralium chat uses general chatting for the Idea Intake phase.
    // Downstream heavy tasks are triggered automatically via marker [PARALIUM_IDEA_COMPLETE]
    // so we lock the intent to general chatting for standard interactions.
    intent = "general_chatting"
  } else if (selectedMode === "fast") {
     // Fast mode tries to keep everything in fast Gemini fallback chain
     if (intent === "initial_prototype" || intent === "playable_game_active" || intent === "orchestrator") {
        intent = "game_coding"
     }
  }

  const modelInfo = getModelInfo(intent, isHeavy)

  // ─── INITIAL PROTOTYPE (PARALIUM MODE) ────────────────────────────────────────────────────────
  if (intent === "initial_prototype") {
    onModelSwitch?.(modelInfo)
    const msgs = convertToStandardMessages(geminiMessages) as LaysoAIMessage[]
    try {
      for await (const chunk of sendMessageToLaysoAIStream("claude-opus-4.7-thinking", msgs)) {
        yield chunk
      }
    } catch (e) {
      console.warn("[Orchestrator] LaysoAI opus failed, trying claude-sonnet-4-5-20250929 fallback", e)
      onModelSwitch?.({ ...modelInfo, modelName: "claude-sonnet-4-5-20250929", displayName: "Claude Sonnet 4.5" })
      for await (const chunk of sendMessageToLaysoAIStream("claude-sonnet-4-5-20250929", msgs)) {
        yield chunk
      }
    }
    return intent
  }

  // ─── PLAYABLE GAME ACTIVE ──────────────────────────────────────────────────────
  if (intent === "playable_game_active") {
    onModelSwitch?.(modelInfo)
    const msgs = convertToStandardMessages(geminiMessages) as LaysoAIMessage[]
    try {
       const targetModel = modelInfo.preferredModelId || "claude-sonnet-4-5-20250929"
       for await (const chunk of sendMessageToLaysoAIStream(targetModel, msgs)) {
         yield chunk
       }
    } catch(e) {
       console.warn("[Orchestrator] Playable active layso error, trying Gemini fallback", e)
       onModelSwitch?.({ ...modelInfo, modelName: "gemini-3-flash-live", displayName: "Gemini 3 Flash Live" })
       return "game_coding"
    }
    return intent
  }

  // ─── GAME CODING ──────────────────────────────────────────────────────────────
  if (intent === "game_coding") {
    if (isHeavy) {
      onModelSwitch?.({ ...modelInfo, modelName: "claude-sonnet-4-5-20250929", displayName: "Claude Sonnet 4.5 (Heavy)", allowedModelIds: ["claude-sonnet-4-5-20250929"] })
      const msgs = convertToStandardMessages(geminiMessages) as LaysoAIMessage[]
      try {
        for await (const chunk of sendMessageToLaysoAIStream("claude-sonnet-4-5-20250929", msgs)) {
          yield chunk
        }
      } catch (e) {
        return "game_coding" // Will fallback to Gemini
      }
      return intent
    } else {
      onModelSwitch?.({ ...modelInfo, modelName: "gemini-3-flash-live", displayName: "Gemini 3 Flash Live (Coding)", allowedModelIds: ["gemini-3-flash-live"] })
      return "game_coding"
    }
  }

  // ─── GENERAL CHATTING & ORCHESTRATOR ──────────────────────────────────────────
  // Will return the intent so that ChatInterface streams it via Gemini SDK.
  // We don't catch the Gemini exhaustion here directly because the stream doesn't yield from Gemini SDK here.
  // Wait, if we return the intent, `ChatInterface.tsx` calls `sendMessageToGeminiStream` which uses `geminiSmartRouter.ts`.
  // `geminiSmartRouter` throws `ALL_GEMINI_KEYS_DAY_EXHAUSTED` or `ALL_GEMINI_KEYS_MINUTE_EXHAUSTED`.
  // But wait, if it throws inside `ChatInterface.tsx`, `ChatInterface` will surface the error, NOT fall back to Clod!
  // To allow cross-provider fallback from Gemini -> Clod -> Gemini, we MUST intercept it.
  
  onModelSwitch?.(modelInfo)
  return intent
}
