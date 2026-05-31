import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, RefreshCw, Sparkles, AlertCircle } from "lucide-react"
import { useParaliumStore, SCREEN_CATEGORIES } from "../../store/useParaliumStore"
import { searchGameScreensForGame } from "../../services/paraliumService"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

interface ParaliumImageSelectorProps {
  onComplete: () => void
  onAbort: () => void
}

export function ParaliumImageSelector({ onComplete, onAbort }: ParaliumImageSelectorProps) {
  const store = useParaliumStore()
  const [isSearching, setIsSearching] = useState(false)
  const [cycleCount, setCycleCount] = useState(0)
  
  const handleSelect = (category: string, image: any) => {
    store.selectImage(category, image)
  }

  const handleSearchMore = async () => {
    if (cycleCount >= 2) {
      // Abort and tell user to describe idea clearly again
      store.resetParalium()
      onAbort()
      return
    }

    const nextIndex = (store.currentSearchGameIndex + 1) % store.referenceGames.length
    store.setCurrentSearchGameIndex(nextIndex)
    setCycleCount(prev => prev + 1)
    
    setIsSearching(true)
    try {
      const nextGame = store.referenceGames[nextIndex]
      await searchGameScreensForGame(nextGame)
      // We clear the selected images since the options changed
      store.resetParalium() // wait, reset paralium clears EVERYTHING, including phase!
      // Better to just clear selected and searched.
    } catch (e) {
      console.error(e)
    } finally {
      setIsSearching(false)
    }
  }

  // Refined handleSearchMore to NOT reset entire store
  const handleSearchMoreRefined = async () => {
    if (cycleCount >= 2) {
      store.setPhase("idea_intake", "Please describe your game idea clearly again to get better references.")
      onAbort()
      return
    }

    const nextIndex = (store.currentSearchGameIndex + 1) % store.referenceGames.length
    store.setCurrentSearchGameIndex(nextIndex)
    setCycleCount(prev => prev + 1)
    
    setIsSearching(true)
    try {
      const nextGame = store.referenceGames[nextIndex]
      store.clearSearchedImages()
      // Note: we can optionally clear selections here, but keeping them allows mix-and-match
      await searchGameScreensForGame(nextGame)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSearching(false)
    }
  }

  const allSelected = store.allCategoriesSelected()
  const selectedCount = store.getSelectedCount()
  const currentGame = store.referenceGames[store.currentSearchGameIndex]

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="relative flex flex-col w-full max-w-7xl max-h-[90vh] bg-zinc-950/90 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/50">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                Choose Your Game Screen Ideas
              </h2>
              <p className="text-zinc-400 mt-1">
                Showing references based on <span className="text-purple-300 font-semibold">{currentGame}</span>. 
                Select 1 image for each of the 12 categories. ({selectedCount}/12 selected)
              </p>
            </div>
            
            <Button 
              variant="outline" 
              className="gap-2 border-purple-500/30 hover:bg-purple-500/10 transition-colors"
              onClick={handleSearchMoreRefined}
              disabled={isSearching}
            >
              {cycleCount >= 2 ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  Describe idea clearly again
                </>
              ) : (
                <>
                  <RefreshCw className={cn("w-4 h-4", isSearching && "animate-spin")} />
                  Search more design screens
                </>
              )}
            </Button>
          </div>

          {/* Content - Scrollable Grid */}
          <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
            {SCREEN_CATEGORIES.map(category => {
              const images = store.searchedImages[category] || []
              const selectedImage = store.selectedImages[category]

              return (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-200 capitalize border-b border-white/5 pb-2">
                    {category}
                    {selectedImage && <span className="ml-2 text-xs text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">Selected</span>}
                  </h3>
                  
                  {images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {images.map((img, idx) => {
                        const isSelected = selectedImage?.originalUrl === img.originalUrl
                        
                        return (
                          <div 
                            key={idx}
                            className={cn(
                              "relative group cursor-pointer rounded-xl overflow-hidden aspect-video bg-zinc-900 border-2 transition-all duration-200",
                              isSelected 
                                ? "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-[1.02]" 
                                : "border-transparent hover:border-white/20 hover:scale-[1.01]"
                            )}
                            onClick={() => handleSelect(category, img)}
                          >
                            <img 
                              src={img.thumbnailUrl} 
                              alt={`${category} option ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            
                            {/* Selection Overlay */}
                            <div className={cn(
                              "absolute inset-0 transition-opacity duration-200",
                              isSelected ? "bg-purple-500/20" : "bg-black/0 group-hover:bg-black/20"
                            )} />
                            
                            {/* Circular Tick */}
                            <div className={cn(
                              "absolute top-3 right-3 rounded-full bg-black/50 backdrop-blur-sm transition-all duration-200 flex items-center justify-center w-8 h-8",
                              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75 group-hover:opacity-100"
                            )}>
                              <CheckCircle2 className={cn(
                                "w-6 h-6",
                                isSelected ? "text-purple-400" : "text-white/50"
                              )} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="aspect-video w-full max-w-sm rounded-xl border border-white/10 bg-zinc-900/50 flex flex-col items-center justify-center text-zinc-500 gap-2">
                      {isSearching ? (
                        <>
                          <RefreshCw className="w-6 h-6 animate-spin text-purple-400/50" />
                          <span>Searching...</span>
                        </>
                      ) : (
                        <span>No images found</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-zinc-900/50 flex justify-end">
            <Button
              className={cn(
                "px-8 py-6 text-lg font-semibold transition-all duration-300",
                allSelected 
                  ? "bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)]" 
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              )}
              disabled={!allSelected}
              onClick={onComplete}
            >
              Confirm Selection
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
