/**
 * Paralium Service — End-to-end agentic game building pipeline
 *
 * Orchestrates: Gemini Flash (chat) → Bing Image Search → SkillBoss GPT-5.1 (vision)
 *             → LaysoAI Opus 4.7 Thinking (plan) → LaysoAI GPT-5.3-Codex (code)
 */

import { searchBingImages, downloadImageAsBlob, type BingImageResult } from "./bingImageSearch"
import { sendVisionToSkillBoss } from "./skillbossapi"
import { sendMessageToLaysoAIStream, type LaysoAIMessage } from "./laysoai"
import { useParaliumStore, SCREEN_CATEGORIES, type ScreenCategory, type CodingTask } from "../store/useParaliumStore"
import { uuidv4 } from "../lib/uuid"

// Import guide files as raw strings (Vite ?raw)
import guideImageScreens from "./guides/guide-for-game-image-screens.md?raw"
import guideGamePlan from "./guides/guide-for-generating-game-plan.md?raw"
import guideCodingGame from "./guides/guide-for-coding-game.md?raw"

// ─── Constants ───────────────────────────────────────────────────────────────

const PARALIUM_SYSTEM_PROMPT = `You are KOYE AI's Paralium Mode — a premium end-to-end agentic game building assistant for 3D action games built with Babylon.js.

Your current phase is IDEA INTAKE. Your job is to understand the user's game idea deeply by asking structured questions in batches.

RULES:
1. Ask 3-5 focused questions per batch. Don't overwhelm the user.
2. Questions should cover: core gameplay, setting/theme, art style, characters, enemies, levels, progression, unique mechanics.
3. After each batch of answers, decide if you have ENOUGH information to build a first prototype.
4. When you have enough info (typically after 2-4 batches), output the marker [PARALIUM_IDEA_COMPLETE] followed by a structured summary of the collected information.
5. The summary after [PARALIUM_IDEA_COMPLETE] must be a well-organized markdown section covering:
   - Game title / working name
   - Genre (3D action, hack-and-slash, shooter, platformer, etc.)
   - Setting and theme
   - Player character description
   - Core gameplay mechanics
   - Enemy types
   - Level/environment description
   - Win/lose conditions
   - Art style direction
   - Special features or unique mechanics
6. Be encouraging and enthusiastic. This is a premium feature.
7. Do NOT ask about 2D games. This is exclusively for 3D action games using Babylon.js.
8. Keep responses concise but thorough.

Start by welcoming the user to Paralium mode and asking the first batch of questions about their 3D action game idea.`

const FIND_GAMES_PROMPT = `Based on the following game idea, identify exactly 3 famous, well-known video games that are in the same category/genre/type. These should be popular games that people would recognize and whose screenshots are widely available online.

Game idea:
{IDEA_DATA}

Respond with ONLY a JSON array of 3 game names, nothing else. Example: ["Call of Duty", "Halo", "Destiny"]`

// ─── Phase 1: Idea Intake (Gemini Flash chat — handled by ChatInterface stream) ─

/**
 * Check if the AI response signals that idea intake is complete.
 * Returns the structured idea data if complete, null otherwise.
 */
export function checkIdeaComplete(text: string): string | null {
  const marker = "[PARALIUM_IDEA_COMPLETE]"
  const idx = text.indexOf(marker)
  if (idx === -1) return null
  return text.substring(idx + marker.length).trim()
}

/**
 * Get the system prompt for Paralium idea intake phase.
 */
export function getParaliumIdeaIntakePrompt(): string {
  return PARALIUM_SYSTEM_PROMPT
}

// ─── Phase 2: Find Reference Games ──────────────────────────────────────────

/**
 * Identify 3 famous games similar to the user's game idea.
 * Uses Gemini Flash via the normal streaming path (caller streams to Gemini).
 */
export function buildFindGamesPrompt(ideaData: string): string {
  return FIND_GAMES_PROMPT.replace("{IDEA_DATA}", ideaData)
}

/**
 * Parse the AI's response to extract game names.
 */
export function parseGameNames(response: string): string[] {
  try {
    // Try to find a JSON array in the response
    const jsonMatch = response.match(/\[[\s\S]*?\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return parsed.slice(0, 3).map(String)
      }
    }
  } catch (e) {
    console.warn("[Paralium] Failed to parse game names JSON, trying fallback")
  }

  // Fallback: extract quoted strings
  const matches = response.match(/"([^"]+)"/g)
  if (matches && matches.length >= 3) {
    return matches.slice(0, 3).map((s) => s.replace(/"/g, ""))
  }

  // Last resort: split by newlines/commas
  const lines = response
    .split(/[\n,]/)
    .map((s) => s.replace(/^\d+[\.\)]\s*/, "").trim())
    .filter((s) => s.length > 2 && s.length < 60)

  return lines.slice(0, 3)
}

// ─── Phase 3: Parallel Image Search ─────────────────────────────────────────

/**
 * Search for game screen images for a single game across all 12 categories.
 * Runs all 12 searches in parallel.
 * Returns results map: { category: BingImageResult[] }
 */
export async function searchGameScreensForGame(
  gameName: string,
  onProgress?: (category: string, count: number) => void
): Promise<Record<string, BingImageResult[]>> {
  const store = useParaliumStore.getState()

  console.log(`[Paralium] Searching game screens for: "${gameName}"`)

  const searchPromises = SCREEN_CATEGORIES.map(async (category) => {
    const query = `${gameName} ${category}`
    try {
      const results = await searchBingImages(query)
      // Take top 3 results
      const top3 = results.slice(0, 3)
      store.setSearchedImages(category, top3)
      onProgress?.(category, top3.length)
      console.log(`[Paralium] Found ${top3.length} images for "${query}"`)
      return { category, images: top3 }
    } catch (error) {
      console.warn(`[Paralium] Search failed for "${query}":`, error)
      store.setSearchedImages(category, [])
      onProgress?.(category, 0)
      return { category, images: [] }
    }
  })

  const results = await Promise.all(searchPromises)

  const resultMap: Record<string, BingImageResult[]> = {}
  for (const r of results) {
    resultMap[r.category] = r.images
  }

  return resultMap
}

// ─── Phase 5: Image Analysis via SkillBoss GPT-5.1 ─────────────────────────

/**
 * Analyze all selected images using SkillBoss Vision API.
 * Downloads each image, converts to base64, sends to GPT-5.1 with the guide.
 */
export async function analyzeSelectedImages(
  onProgress?: (category: string, status: "downloading" | "analyzing" | "done" | "error") => void
): Promise<Record<string, string>> {
  const store = useParaliumStore.getState()
  const selectedImages = store.selectedImages
  const descriptions: Record<string, string> = {}

  for (const category of SCREEN_CATEGORIES) {
    const selectedImage = selectedImages[category]
    if (!selectedImage) {
      console.warn(`[Paralium] No image selected for "${category}", skipping`)
      continue
    }

    try {
      onProgress?.(category, "downloading")

      // Download image as blob using CORS-safe method
      const imageUrl = selectedImage.originalUrl || selectedImage.thumbnailUrl
      const blob = await downloadImageAsBlob(imageUrl)

      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          resolve(result.split(",")[1]) // Strip data:image/...;base64, prefix
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      const mimeType = blob.type || "image/png"

      onProgress?.(category, "analyzing")

      // Send to SkillBoss GPT-5.1 with guide
      const userPrompt = `Analyze this ${category} screenshot. Follow the guide instructions exactly. Provide a hyper-detailed description of every visual element for UI recreation.`

      const description = await sendVisionToSkillBoss(
        guideImageScreens,
        base64,
        mimeType,
        userPrompt
      )

      descriptions[category] = description
      store.setImageDescription(category, description)
      onProgress?.(category, "done")

      console.log(`[Paralium] Analyzed "${category}" — ${description.length} chars`)
    } catch (error) {
      console.error(`[Paralium] Failed to analyze "${category}":`, error)
      onProgress?.(category, "error")
      descriptions[category] = `[Analysis failed for ${category}]`
      store.setImageDescription(category, descriptions[category])
    }
  }

  return descriptions
}

// ─── Phase 6: Game Plan Generation via Opus 4.7 Thinking ────────────────────

/**
 * Generate the full game plan using LaysoAI Opus 4.7 Thinking.
 * Streams the response and returns the full plan markdown.
 */
export async function generateGamePlan(
  ideaData: string,
  imageDescriptions: Record<string, string>,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const store = useParaliumStore.getState()

  // Build the descriptions section
  const descriptionsText = SCREEN_CATEGORIES.map((cat) => {
    const desc = imageDescriptions[cat] || "[No description available]"
    return `### ${cat}\n${desc}`
  }).join("\n\n---\n\n")

  const messages: LaysoAIMessage[] = [
    {
      role: "system",
      content: guideGamePlan,
    },
    {
      role: "user",
      content: `## User Game Idea Data\n\n${ideaData}\n\n---\n\n## Screen Descriptions (Visual References)\n\n${descriptionsText}\n\n---\n\nPlease generate the COMPLETE game development plan as specified in the guide. Output a single markdown document.`,
    },
  ]

  let fullPlan = ""

  try {
    for await (const chunk of sendMessageToLaysoAIStream(
      "claude-opus-4.7-thinking",
      messages,
      0.7,
      16000
    )) {
      fullPlan += chunk
      onChunk?.(chunk)
    }
  } catch (error) {
    console.error("[Paralium] Opus 4.7 failed to generate game plan:", error)
    throw new Error("Failed to generate game plan. Please try again later.")
  }

  store.setGamePlan(fullPlan)
  return fullPlan
}

// ─── Phase 7: Asset Prompt Generation ───────────────────────────────────────

/**
 * Generate text prompts for all game assets using Claude Sonnet 4.5 Thinking.
 * Dispatch them in parallel to the respective services.
 */
export async function generateAndDispatchAssetPrompts(gamePlan: string): Promise<void> {
  // We'll implement this based on the guide file we create later.
  console.log("TODO: Implement generateAndDispatchAssetPrompts");
}

// ─── Phase 7: Code Generation Loop via GPT-5.3-Codex ───────────────────────

/**
 * Parse the task list from the coding model's first response.
 */
export function parseTaskList(response: string): CodingTask[] {
  const startMarker = "[TASK_LIST_START]"
  const endMarker = "[TASK_LIST_END]"

  const startIdx = response.indexOf(startMarker)
  const endIdx = response.indexOf(endMarker)

  let taskSection: string
  if (startIdx !== -1 && endIdx !== -1) {
    taskSection = response.substring(startIdx + startMarker.length, endIdx)
  } else {
    // Fallback: try to find numbered tasks
    taskSection = response
  }

  const taskRegex = /Task\s+(\d+):\s*(.+?)(?:\s*[—–-]\s*(.+))?$/gm
  const tasks: CodingTask[] = []
  let match: RegExpExecArray | null

  while ((match = taskRegex.exec(taskSection)) !== null) {
    tasks.push({
      id: uuidv4(),
      name: match[2].trim(),
      purpose: match[3]?.trim() || match[2].trim(),
      status: "pending",
      outputFiles: [],
    })
  }

  return tasks
}

/**
 * Parse file outputs from a task completion response.
 * Returns array of { path, content }.
 */
export function parseFileOutputs(
  response: string
): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = []
  const fileRegex = /\[FILE:\s*([^\]]+)\]\s*\n([\s\S]*?)(?=\[FILE:|$|\[TASK_COMPLETE)/g
  let match: RegExpExecArray | null

  while ((match = fileRegex.exec(response)) !== null) {
    const filePath = match[1].trim()
    let content = match[2].trim()
    // Strip markdown code fences if present
    content = content.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "")
    files.push({ path: filePath, content })
  }

  return files
}

/**
 * Run the coding task loop: sends tasks one-by-one to Claude Sonnet 4.5.
 * Each task produces files, then the next task is auto-triggered.
 */
export async function runCodingLoop(
  gamePlan: string,
  onTaskStart?: (taskIndex: number, taskName: string) => void,
  onFileCreated?: (path: string, content: string) => void,
  onTaskComplete?: (taskIndex: number) => void,
  onChunk?: (chunk: string) => void,
  onAllComplete?: () => void
): Promise<void> {
  const store = useParaliumStore.getState()

  // Step 1: Get the task list
  const taskListMessages: LaysoAIMessage[] = [
    { role: "system", content: guideCodingGame },
    {
      role: "user",
      content: `Here is the complete game development plan. Please read it carefully and output the task list as specified in the guide.\n\n${gamePlan}`,
    },
  ]

  let taskListResponse = ""
  for await (const chunk of sendMessageToLaysoAIStream(
    "claude-sonnet-4-5-20250929",
    taskListMessages,
    0.5,
    4000
  )) {
    taskListResponse += chunk
    onChunk?.(chunk)
  }

  const tasks = parseTaskList(taskListResponse)
  if (tasks.length === 0) {
    throw new Error("Coding model failed to produce a task list")
  }

  store.setCodingTasks(tasks)
  console.log(`[Paralium] Parsed ${tasks.length} coding tasks`)

  // Step 2: Execute tasks one by one
  const conversationHistory: LaysoAIMessage[] = [
    { role: "system", content: guideCodingGame },
    {
      role: "user",
      content: `Here is the complete game development plan:\n\n${gamePlan}`,
    },
    {
      role: "assistant",
      content: taskListResponse,
    },
  ]

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    store.setCurrentTaskIndex(i)
    store.updateCodingTask(task.id, { status: "in_progress" })
    onTaskStart?.(i, task.name)

    const taskPrompt = `Execute Task ${i + 1}: ${task.name} — ${task.purpose}\n\nGenerate ALL complete files for this task using the [FILE: path] format. Mark completion with [TASK_COMPLETE: Task ${i + 1}].`

    conversationHistory.push({ role: "user", content: taskPrompt })

    let taskResponse = ""
    try {
      for await (const chunk of sendMessageToLaysoAIStream(
        "claude-sonnet-4-5-20250929",
        conversationHistory,
        0.5,
        12000
      )) {
        taskResponse += chunk
        onChunk?.(chunk)
      }

      // Parse files from response
      const files = parseFileOutputs(taskResponse)
      const filePaths: string[] = []

      for (const file of files) {
        onFileCreated?.(file.path, file.content)
        filePaths.push(file.path)
      }

      store.updateCodingTask(task.id, {
        status: "done",
        outputFiles: filePaths,
      })

      conversationHistory.push({ role: "assistant", content: taskResponse })
      onTaskComplete?.(i)

      console.log(
        `[Paralium] Task ${i + 1}/${tasks.length} complete — ${files.length} files`
      )
    } catch (error) {
      console.error(`[Paralium] Task ${i + 1} failed:`, error)
      store.updateCodingTask(task.id, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      })
      // Continue to next task even if one fails
      conversationHistory.push({
        role: "assistant",
        content: taskResponse || "[Task failed due to error]",
      })
    }
  }

  store.setPhase("complete", "All coding tasks complete!")
  onAllComplete?.()
}

// ─── Master Pipeline Orchestrator ──────────────────────────────────────────

/**
 * Runs phases 2 through 7 in the background.
 * Assumes ideaData is already collected from Phase 1.
 */
export async function startParaliumPipeline(ideaData: string) {
  const store = useParaliumStore.getState()
  
  store.setIdeaData(ideaData)
  
  try {
    // Phase 2: Find games
    store.setPhase("finding_games", "Identifying reference games...")
    
    // Use the existing LaysoAI for a quick fast-path or just use the stream manually
    const findPrompt = buildFindGamesPrompt(ideaData)
    let findResponse = ""
    for await (const chunk of sendMessageToLaysoAIStream(
      "gemini-3.5-flash",
      [{ role: "user", content: findPrompt }],
      0.2,
      500
    )) {
      findResponse += chunk
    }
    
    const games = parseGameNames(findResponse)
    if (games.length < 3) {
      games.push("Genshin Impact", "Devil May Cry 5", "Elden Ring") // Fallbacks
    }
    store.setReferenceGames(games)
    console.log("[Paralium] Reference games:", games)
    
    // Phase 3: Image Search
    store.setPhase("searching_images", `Searching UI screens for ${games[0]}...`)
    store.setCurrentSearchGameIndex(0)
    await searchGameScreensForGame(games[0])
    
    // Phase 4: User Selection (Waiting state)
    // The UI (ParaliumImageSelector) will pop up now.
    store.setPhase("selecting_images", "Waiting for you to select screen ideas...")
    
  } catch (error) {
    console.error("[Paralium] Pipeline error:", error)
    store.setPhase("idle", "Pipeline failed.")
  }
}

/**
 * Resumes the pipeline after the user selects images.
 */
export async function resumeParaliumPipelineAfterSelection() {
  const store = useParaliumStore.getState()
  
  try {
    // Phase 5: Analyze Images
    store.setPhase("analyzing_images", "Vision AI is analyzing selected screens...")
    await analyzeSelectedImages((category, status) => {
      store.setPhaseMessage(`Analyzing ${category}... (${status})`)
    })
    
    // Phase 6: Generate Plan
    store.setPhase("generating_plan", "Opus 4.7 Thinking is architecting the game plan...")
    const plan = await generateGamePlan(
      store.ideaData,
      store.imageDescriptions,
      () => {
        // Just let it stream to store, UI card will pulse
      }
    )
    
    // Phase 7: Coding Loop
    store.setPhase("coding_game", "Claude Sonnet 4.5 is building your game...")
    await runCodingLoop(
      plan,
      (idx, name) => store.setPhaseMessage(`Task ${idx + 1}: ${name}`),
      (path, content) => {
        // Save to project VFS
        const { useAppStore } = require("../store/useAppStore")
        useAppStore.getState().addGeneratedFile(path, content)
      },
      undefined,
      undefined,
      () => {
        store.setPhase("complete", "Game fully built and ready to play!")
      }
    )
    
  } catch (error) {
    console.error("[Paralium] Pipeline error during resume:", error)
    store.setPhase("idle", "Pipeline failed during code generation.")
  }
}
