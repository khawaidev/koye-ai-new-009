/**
 * Paralium Service — End-to-end agentic game building pipeline
 *
 * Orchestrates: Gemini Flash (chat) → Bing Image Search → SkillBoss GPT-5.1 (vision)
 *             → LaysoAI Opus 4.7 Thinking (plan) → Claude Sonnet 4.5 (code)
 */

import { searchBingImages, downloadImageAsBlob, type BingImageResult } from "./bingImageSearch"
import { sendVisionToSkillBoss } from "./skillbossapi"
import { sendMessageToLaysoAIStream, type LaysoAIMessage } from "./laysoai"
import { sendMessageToGeminiStream } from "./gemini"
import { useParaliumStore, SCREEN_CATEGORIES, type ScreenCategory, type CodingTask } from "../store/useParaliumStore"
import { uuidv4 } from "../lib/uuid"

// Import guide files as raw strings (Vite ?raw)
import guideImageScreens from "./guides/guide-for-game-image-screens.md?raw"
import guideGamePlan from "./guides/guide-for-generating-game-plan.md?raw"
import guideCodingGame from "./guides/guide-for-coding-game.md?raw"
import guideParaliumOrchestrator from "./guides/guide-for-paralium-orchestrator.md?raw"

// ─── Constants ───────────────────────────────────────────────────────────────

const PARALIUM_SYSTEM_PROMPT = guideParaliumOrchestrator
const PARALIUM_GEMINI_FALLBACK_CHAIN = [
  "gemini-3.1-flash-lite",
  "gemini-3-flash",
  "gemini-3.5-flash",
] as const

const FIND_GAMES_PROMPT = `Based on the following game idea, identify exactly 3 famous, well-known video games that are in the same category/genre/type. These should be popular games that people would recognize and whose screenshots are widely available online.

IMPORTANT: If the game idea already mentions a specific famous game (e.g. "like Mobile Legends", "inspired by Genshin Impact"), you MUST include that game as the FIRST entry in your list, then find 2 more similar games.

Game idea:
{IDEA_DATA}

Respond with ONLY a JSON array of 3 game names, nothing else. Example: ["Mobile Legends", "League of Legends", "Arena of Valor"]`

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
 * Cache key for storing all fetched images per category in sessionStorage.
 */
const CACHE_KEY_PREFIX = "paralium_img_cache_"

function getCacheKey(category: string): string {
  return `${CACHE_KEY_PREFIX}${category.replace(/\s+/g, "_")}`
}

/**
 * Search for game screen images for a single game across all 12 categories.
 * Fetches 20 images per category, caches all in sessionStorage,
 * and shows the first 5 in the store.
 */
export async function searchGameScreensForGame(
  gameName: string,
  onProgress?: (category: string, count: number) => void
): Promise<Record<string, BingImageResult[]>> {
  const store = useParaliumStore.getState()

  console.log(`[Paralium] Searching game screens for: "${gameName}" (fetching 20 per category, caching)`)

  const searchPromises = SCREEN_CATEGORIES.map(async (category) => {
    try {
      const getCategoryQuery = (cat: string) => {
        // Appending "game UI" ensures Pinterest returns actual game interfaces
        switch (cat) {
          case "splash screen": return "game UI splash screen";
          case "loading screen": return "game UI loading screen";
          case "main menu screen": return "game UI main menu";
          case "lobby screen": return "game UI lobby";
          case "character selection screen": return "game UI character selection";
          case "gameplay HUD": return "game UI gameplay HUD";
          case "battle UI": return "game UI battle combat";
          case "pause menu": return "game UI pause menu";
          case "victory screen": return "game UI victory win screen";
          case "defeat screen": return "game UI defeat game over screen";
          case "reward screen": return "game UI reward loot screen";
          case "settings screen": return "game UI settings options menu";
          default: return `game UI ${cat}`;
        }
      }

      const query = getCategoryQuery(category);
      // Exactly ONE API call per category
      const results = await searchBingImages(`${gameName} ${query}`).catch(() => [] as BingImageResult[]);
      
      // Deduplicate and collect up to 20 images
      const seenUrls = new Set<string>();
      const allResults: BingImageResult[] = [];
      
      for (const img of results) {
        const url = img.originalUrl || img.thumbnailUrl;
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          allResults.push(img);
          if (allResults.length >= 20) break;
        }
      }

      // Cache all 20 in sessionStorage
      try {
        sessionStorage.setItem(getCacheKey(category), JSON.stringify(allResults))
      } catch (e) {
        console.warn(`[Paralium] Failed to cache images for "${category}"`, e)
      }

      // Show first 5 in the store
      const firstPage = allResults.slice(0, 5)
      store.setSearchedImages(category, firstPage)
      store.setImagePageIndex(category, 0)
      onProgress?.(category, firstPage.length)
      console.log(`[Paralium] Cached ${allResults.length} images for "${category}", showing first ${firstPage.length}`)
      return { category, images: firstPage }
    } catch (error) {
      console.warn(`[Paralium] Search failed for "${category}":`, error)
      store.setSearchedImages(category, [])
      store.setImagePageIndex(category, 0)
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

/**
 * Load the next page of 5 images from sessionStorage cache for all categories.
 * Returns true if there were more images to show, false if we've exhausted the cache.
 */
export function loadNextPageFromCache(): boolean {
  const store = useParaliumStore.getState()
  let hasMore = false

  for (const category of SCREEN_CATEGORIES) {
    const currentPageIndex = store.imagePageIndices[category] ?? 0
    const nextPage = currentPageIndex + 1
    const start = nextPage * 5
    const end = start + 5

    try {
      const cached = sessionStorage.getItem(getCacheKey(category))
      if (!cached) continue

      const allImages: BingImageResult[] = JSON.parse(cached)
      
      if (start < allImages.length) {
        const pageImages = allImages.slice(start, end)
        store.setSearchedImages(category, pageImages)
        store.setImagePageIndex(category, nextPage)
        hasMore = true
        console.log(`[Paralium] Showing page ${nextPage + 1} for "${category}" (${pageImages.length} images)`)
      } else {
        // No more images for this category, keep showing the last page
        console.log(`[Paralium] No more cached images for "${category}" (total: ${allImages.length})`)
      }
    } catch (e) {
      console.warn(`[Paralium] Failed to load cache for "${category}"`, e)
    }
  }

  return hasMore
}

/**
 * Load the previous page of 5 images from sessionStorage cache for all categories.
 * Returns true if we went back a page, false if we were already at page 0.
 */
export function loadPreviousPageFromCache(): boolean {
  const store = useParaliumStore.getState()
  let hasLess = false

  for (const category of SCREEN_CATEGORIES) {
    const currentPageIndex = store.imagePageIndices[category] ?? 0
    if (currentPageIndex === 0) continue

    const prevPage = currentPageIndex - 1
    const start = prevPage * 5
    const end = start + 5

    try {
      const cached = sessionStorage.getItem(getCacheKey(category))
      if (!cached) continue

      const allImages: BingImageResult[] = JSON.parse(cached)
      
      const pageImages = allImages.slice(start, end)
      store.setSearchedImages(category, pageImages)
      store.setImagePageIndex(category, prevPage)
      hasLess = true
      console.log(`[Paralium] Showing previous page ${prevPage + 1} for "${category}" (${pageImages.length} images)`)
    } catch (e) {
      console.warn(`[Paralium] Failed to load cache for "${category}"`, e)
    }
  }

  return hasLess
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

// ─── Phase 7: Code Generation Loop via Claude Sonnet 4.5 ───────────────────────

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
  
  // Auto-save idea data to the user's project files
  try {
    const { useAppStore } = await import("../store/useAppStore")
    useAppStore.getState().addGeneratedFile("game-idea.md", ideaData)
  } catch (e) {
    console.warn("[Paralium] Could not save idea to project files", e)
  }
  
  try {
    // Phase 2: Find reference games
    store.setPhase("finding_games", "Identifying reference games...")
    
    // Open the image selection UI immediately so user sees the loading spinner
    store.setPhase("selecting_images", "Finding reference games and searching screens...")
    
    const findPrompt = buildFindGamesPrompt(ideaData)
    let findResponse = ""
    
    for await (const chunk of sendMessageToGeminiStream(
      [{ role: "user", parts: [{ text: findPrompt }] }],
      {
        preferredModelId: "gemini-3.1-flash-lite",
        allowedModelIds: ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-3-flash"]
      }
    )) {
      findResponse += chunk
    }
    
    const games = parseGameNames(findResponse)
    if (games.length < 3) {
      games.push("Genshin Impact", "Devil May Cry 5", "Elden Ring") // Fallbacks
    }
    store.setReferenceGames(games)
    console.log("[Paralium] Reference games:", games)
    
    // Auto-save reference games to the user's project
    try {
      const { useAppStore } = await import("../store/useAppStore")
      const referenceContent = `# Reference Games\n\nThe following games were identified as references for your game idea:\n\n${games.map(g => `- *${g}*`).join("\n")}\n`
      useAppStore.getState().addGeneratedFile("reference games.md", referenceContent)
    } catch (e) {
      console.warn("[Paralium] Could not save reference games to project files", e)
    }
    
    // Phase 3: Image Search (1 API call per category = 12 total)
    store.clearAllImageState() // Completely wipe old cache and selections for a fresh start
    store.setCurrentSearchGameIndex(0)
    store.setPhaseMessage("Searching Pinterest for game UI screens...")
    await searchGameScreensForGame(games[0])
    
    store.setPhaseMessage("Waiting for you to select screen ideas...")
    
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
    // Mark the initial game screen as selected for the project
    const { useAppStore } = await import("../store/useAppStore")
    useAppStore.getState().updateCurrentProject({ initialGameScreenSelected: true })

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
