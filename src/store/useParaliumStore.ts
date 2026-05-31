import { create } from "zustand"
import type { BingImageResult } from "../services/bingImageSearch"

// All 12 mandatory screen categories for 3D action games
export const SCREEN_CATEGORIES = [
  "splash screen",
  "loading screen",
  "main menu screen",
  "lobby screen",
  "character selection screen",
  "gameplay HUD",
  "battle UI",
  "pause menu",
  "victory screen",
  "defeat screen",
  "reward screen",
  "settings screen",
] as const

export type ScreenCategory = (typeof SCREEN_CATEGORIES)[number]

export type ParaliumPhase =
  | "idle"
  | "idea_intake"
  | "finding_games"
  | "searching_images"
  | "selecting_images"
  | "analyzing_images"
  | "generating_plan"
  | "coding_game"
  | "complete"

export interface CodingTask {
  id: string
  name: string
  purpose: string
  status: "pending" | "in_progress" | "done" | "failed"
  outputFiles: string[] // paths of files created by this task
  error?: string
}

export interface ParaliumState {
  // Pipeline phase
  phase: ParaliumPhase
  phaseMessage: string // Human-readable status message

  // Phase 1: Idea intake
  ideaData: string // Structured idea info collected from user Q&A
  questionBatchCount: number // How many rounds of questions have been asked

  // Phase 2: Reference games
  referenceGames: string[] // 3 famous game names
  currentSearchGameIndex: number // 0, 1, or 2 — which game is being searched

  // Phase 3: Image search results
  searchedImages: Record<string, BingImageResult[]> // category → 3 images

  // Phase 4: User selection
  selectedImages: Record<string, BingImageResult> // category → chosen image

  // Phase 5: Image descriptions from GPT-5.1
  imageDescriptions: Record<string, string> // category → description text

  // Phase 6: Game plan
  gamePlanMarkdown: string

  // Phase 7: Coding loop
  codingTasks: CodingTask[]
  currentTaskIndex: number

  // Actions
  setPhase: (phase: ParaliumPhase, message?: string) => void
  setPhaseMessage: (message: string) => void
  setIdeaData: (data: string) => void
  incrementQuestionBatch: () => void
  setReferenceGames: (games: string[]) => void
  setCurrentSearchGameIndex: (index: number) => void
  setSearchedImages: (category: string, images: BingImageResult[]) => void
  clearSearchedImages: () => void
  selectImage: (category: string, image: BingImageResult) => void
  deselectImage: (category: string) => void
  setImageDescription: (category: string, description: string) => void
  setGamePlan: (markdown: string) => void
  setCodingTasks: (tasks: CodingTask[]) => void
  updateCodingTask: (taskId: string, updates: Partial<CodingTask>) => void
  setCurrentTaskIndex: (index: number) => void
  nextTask: () => void

  // Computed helpers
  allCategoriesSelected: () => boolean
  getSelectedCount: () => number

  // Reset
  resetParalium: () => void
}

const initialState = {
  phase: "idle" as ParaliumPhase,
  phaseMessage: "",
  ideaData: "",
  questionBatchCount: 0,
  referenceGames: [],
  currentSearchGameIndex: 0,
  searchedImages: {} as Record<string, BingImageResult[]>,
  selectedImages: {} as Record<string, BingImageResult>,
  imageDescriptions: {} as Record<string, string>,
  gamePlanMarkdown: "",
  codingTasks: [] as CodingTask[],
  currentTaskIndex: 0,
}

export const useParaliumStore = create<ParaliumState>((set, get) => ({
  ...initialState,

  setPhase: (phase, message) =>
    set({ phase, phaseMessage: message || "" }),

  setPhaseMessage: (phaseMessage) => set({ phaseMessage }),

  setIdeaData: (ideaData) => set({ ideaData }),

  incrementQuestionBatch: () =>
    set((s) => ({ questionBatchCount: s.questionBatchCount + 1 })),

  setReferenceGames: (referenceGames) => set({ referenceGames }),

  setCurrentSearchGameIndex: (currentSearchGameIndex) =>
    set({ currentSearchGameIndex }),

  setSearchedImages: (category, images) =>
    set((s) => ({
      searchedImages: { ...s.searchedImages, [category]: images },
    })),

  clearSearchedImages: () => set({ searchedImages: {} }),

  selectImage: (category, image) =>
    set((s) => ({
      selectedImages: { ...s.selectedImages, [category]: image },
    })),

  deselectImage: (category) =>
    set((s) => {
      const next = { ...s.selectedImages }
      delete next[category]
      return { selectedImages: next }
    }),

  setImageDescription: (category, description) =>
    set((s) => ({
      imageDescriptions: { ...s.imageDescriptions, [category]: description },
    })),

  setGamePlan: (gamePlanMarkdown) => set({ gamePlanMarkdown }),

  setCodingTasks: (codingTasks) => set({ codingTasks }),

  updateCodingTask: (taskId, updates) =>
    set((s) => ({
      codingTasks: s.codingTasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    })),

  setCurrentTaskIndex: (currentTaskIndex) => set({ currentTaskIndex }),

  nextTask: () =>
    set((s) => ({
      currentTaskIndex: Math.min(
        s.currentTaskIndex + 1,
        s.codingTasks.length - 1
      ),
    })),

  allCategoriesSelected: () => {
    const sel = get().selectedImages
    return SCREEN_CATEGORIES.every((cat) => sel[cat] != null)
  },

  getSelectedCount: () => Object.keys(get().selectedImages).length,

  resetParalium: () => set({ ...initialState }),
}))
