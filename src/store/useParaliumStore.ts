import { create } from "zustand"
import type { BlackboardState } from "../services/paralium/blackboard"

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

export interface ParaliumUIState {
  // ── Connection to Blackboard ──
  blackboardState: BlackboardState | null
  
  // ── UI Interactions ──
  viewingGameIndex: number
  searchApprovalPending: boolean
  phase: "idle" | "selecting_images"
  phaseMessage: string
  referenceGames: string[]
  currentSearchGameIndex: number
  searchedImages: Record<string, any[]>
  selectedImages: Record<string, any | null>
  
  // ── Actions ──
  setBlackboardState: (state: BlackboardState) => void
  setViewingGameIndex: (index: number) => void
  setSearchApprovalPending: (pending: boolean) => void
  setPhase: (phase: ParaliumUIState["phase"], message: string) => void
  setReferenceGames: (games: string[]) => void
  setCurrentSearchGameIndex: (index: number) => void
  setSearchedImages: (category: string, images: any[]) => void
  setSelectedImage: (category: string, image: any | null) => void
  clearAllImageState: () => void
  
  // ── Computed Helpers ──
  getCurrentPhaseMessage: () => string
  allCategoriesSelected: () => boolean
}

export const useParaliumStore = create<ParaliumUIState>((set, get) => ({
  blackboardState: null,
  viewingGameIndex: 0,
  searchApprovalPending: false,
  phase: "idle",
  phaseMessage: "",
  referenceGames: [],
  currentSearchGameIndex: 0,
  searchedImages: {},
  selectedImages: {},

  setBlackboardState: (state) => set({ blackboardState: state }),
  
  setViewingGameIndex: (index) => set({ viewingGameIndex: index }),
  
  setSearchApprovalPending: (pending) => set({ searchApprovalPending: pending }),
  setPhase: (phase, message) => set({ phase, phaseMessage: message }),
  setReferenceGames: (games) => set({ referenceGames: games }),
  setCurrentSearchGameIndex: (index) => set({ currentSearchGameIndex: index }),
  setSearchedImages: (category, images) =>
    set((prev) => ({ searchedImages: { ...prev.searchedImages, [category]: images } })),
  setSelectedImage: (category, image) =>
    set((prev) => ({ selectedImages: { ...prev.selectedImages, [category]: image } })),
  clearAllImageState: () =>
    set({
      searchedImages: {},
      selectedImages: {},
      referenceGames: [],
      currentSearchGameIndex: 0,
      searchApprovalPending: false,
      phase: "idle",
      phaseMessage: "",
    }),

  getCurrentPhaseMessage: () => {
    const state = get().blackboardState
    if (!state) return "Idle"
    
    if (!state.discoveryComplete) return "Idea Intake"
    if (state.referenceGames.length === 0) return "Finding Reference Games"
    if (!state.gamePlan) return "Planning Architecture"
    
    return "Executing Game Plan"
  },

  allCategoriesSelected: () => {
    const state = get().blackboardState
    if (!state) return false
    
    return state.screenCategories.length > 0 && 
           state.selectedReferences.length >= state.screenCategories.length
  }
}))
