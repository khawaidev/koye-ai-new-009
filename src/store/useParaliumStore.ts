import { create } from "zustand"
import { persist } from "zustand/middleware"
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

  // Search approval gate
  // When true, the UI shows an Approve/Reject bar before the first search fires
  searchApprovalPending: boolean
  // gameIndex → category → images (current page for that game)
  searchedImagesByGame: Record<number, Record<string, BingImageResult[]>>
  // gameIndex → category → current page index
  imagePageIndicesByGame: Record<number, Record<string, number>>
  // How many games have been searched so far (0–3)
  searchedGameCount: number
  // Which game tab the user is currently viewing in the selector
  viewingGameIndex: number

  // Phase 3: Image search results (active page, forwarded from viewingGameIndex)
  searchedImages: Record<string, BingImageResult[]> // category → 5 images (current page)
  imagePageIndices: Record<string, number> // category → current page index

  // Phase 4: User selection
  selectedImages: Record<string, BingImageResult> // category → chosen image
  // Which game tab each selection was made in (category → gameIndex)
  selectedImageSources: Record<string, number>

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

  // Search approval
  setSearchApprovalPending: (pending: boolean) => void

  // Multi-game search
  setSearchedImagesForGame: (gameIndex: number, category: string, images: BingImageResult[]) => void
  setImagePageIndexForGame: (gameIndex: number, category: string, index: number) => void
  setViewingGameIndex: (index: number) => void
  incrementSearchedGameCount: () => void

  // Legacy single-game (still used by page nav helpers)
  setSearchedImages: (category: string, images: BingImageResult[]) => void
  setImagePageIndex: (category: string, index: number) => void
  clearSearchedImages: () => void
  clearAllImageState: () => void

  selectImage: (category: string, image: BingImageResult, gameIndex: number) => void
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

  // Sync active-view images from a specific game
  syncViewFromGame: (gameIndex: number) => void

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
  searchApprovalPending: false,
  searchedImagesByGame: {} as Record<number, Record<string, BingImageResult[]>>,
  imagePageIndicesByGame: {} as Record<number, Record<string, number>>,
  searchedGameCount: 0,
  viewingGameIndex: 0,
  searchedImages: {} as Record<string, BingImageResult[]>,
  imagePageIndices: {} as Record<string, number>,
  selectedImages: {} as Record<string, BingImageResult>,
  selectedImageSources: {} as Record<string, number>,
  imageDescriptions: {} as Record<string, string>,
  gamePlanMarkdown: "",
  codingTasks: [] as CodingTask[],
  currentTaskIndex: 0,
}

export const useParaliumStore = create<ParaliumState>()(
  persist(
    (set, get) => ({
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

  setSearchApprovalPending: (searchApprovalPending) =>
    set({ searchApprovalPending }),

  // ── Multi-game storage ────────────────────────────────────────────────────

  setSearchedImagesForGame: (gameIndex, category, images) =>
    set((s) => {
      const prev = s.searchedImagesByGame[gameIndex] || {}
      const updated = {
        ...s.searchedImagesByGame,
        [gameIndex]: { ...prev, [category]: images },
      }
      // If this is the currently viewed game, also update the active view
      const activeView =
        gameIndex === s.viewingGameIndex
          ? { searchedImages: { ...s.searchedImages, [category]: images } }
          : {}
      return { searchedImagesByGame: updated, ...activeView }
    }),

  setImagePageIndexForGame: (gameIndex, category, index) =>
    set((s) => {
      const prev = s.imagePageIndicesByGame[gameIndex] || {}
      const updated = {
        ...s.imagePageIndicesByGame,
        [gameIndex]: { ...prev, [category]: index },
      }
      const activeView =
        gameIndex === s.viewingGameIndex
          ? { imagePageIndices: { ...s.imagePageIndices, [category]: index } }
          : {}
      return { imagePageIndicesByGame: updated, ...activeView }
    }),

  setViewingGameIndex: (viewingGameIndex) =>
    set((s) => {
      const gameImages = s.searchedImagesByGame[viewingGameIndex] || {}
      const gamePageIndices = s.imagePageIndicesByGame[viewingGameIndex] || {}
      return {
        viewingGameIndex,
        searchedImages: gameImages,
        imagePageIndices: gamePageIndices,
      }
    }),

  incrementSearchedGameCount: () =>
    set((s) => ({ searchedGameCount: s.searchedGameCount + 1 })),

  syncViewFromGame: (gameIndex) =>
    set((s) => ({
      searchedImages: s.searchedImagesByGame[gameIndex] || {},
      imagePageIndices: s.imagePageIndicesByGame[gameIndex] || {},
      viewingGameIndex: gameIndex,
    })),

  // ── Legacy helpers (used by cache page nav) ───────────────────────────────

  setSearchedImages: (category, images) =>
    set((s) => ({
      searchedImages: { ...s.searchedImages, [category]: images },
    })),

  setImagePageIndex: (category, index) =>
    set((s) => ({
      imagePageIndices: { ...s.imagePageIndices, [category]: index },
    })),

  clearSearchedImages: () =>
    set({ searchedImages: {}, imagePageIndices: {} }),

  clearAllImageState: () =>
    set({
      searchedImages: {},
      imagePageIndices: {},
      selectedImages: {},
      selectedImageSources: {},
      searchedImagesByGame: {},
      imagePageIndicesByGame: {},
      searchedGameCount: 0,
      viewingGameIndex: 0,
      currentSearchGameIndex: 0,
    }),

  // ── Selection ─────────────────────────────────────────────────────────────

  selectImage: (category, image, gameIndex) =>
    set((s) => ({
      selectedImages: { ...s.selectedImages, [category]: image },
      selectedImageSources: { ...s.selectedImageSources, [category]: gameIndex },
    })),

  deselectImage: (category) =>
    set((s) => {
      const nextSel = { ...s.selectedImages }
      const nextSrc = { ...s.selectedImageSources }
      delete nextSel[category]
      delete nextSrc[category]
      return { selectedImages: nextSel, selectedImageSources: nextSrc }
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
    }),
    {
      name: "paralium-storage",
    }
  )
)
