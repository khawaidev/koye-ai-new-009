import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, ChevronLeft, ChevronRight, RefreshCw, Sparkles, X } from "lucide-react"
import { useParaliumStore, SCREEN_CATEGORIES } from "../../store/useParaliumStore"
import { searchGameScreensForGame, loadNextPageFromCache, loadPreviousPageFromCache } from "../../services/paraliumService"
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
  
  // If no images exist across all categories, we are likely in the initial search phase
  const hasAnyImages = SCREEN_CATEGORIES.some(cat => (store.searchedImages[cat]?.length || 0) > 0)
  const showLoadingSpinner = isSearching || !hasAnyImages
  
  const handleSelect = (category: string, image: any) => {
    store.selectImage(category, image)
  }

  const handleNextPage = () => {
    setIsSearching(true)
    try {
      const hasMore = loadNextPageFromCache()
      if (hasMore) {
        setCycleCount(prev => prev + 1)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSearching(false)
    }
  }

  const handlePrevPage = () => {
    setIsSearching(true)
    try {
      const hasLess = loadPreviousPageFromCache()
      if (hasLess) {
        setCycleCount(prev => Math.max(0, prev - 1))
      }
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
          className="relative flex flex-col w-full max-w-7xl max-h-[90vh] bg-zinc-950/90 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/50">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-white" />
                Choose Your Game Screen Ideas
              </h2>
              <p className="text-zinc-400 mt-1">
                Showing references based on <span className="text-white font-semibold">{currentGame}</span>. 
                Select 1 image for each of the 12 categories. ({selectedCount}/12 selected)
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-sm mr-2">Set {cycleCount + 1} of 4</span>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1 border-white/20 text-white hover:bg-white/10 transition-colors"
                onClick={handlePrevPage}
                disabled={isSearching || cycleCount === 0}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1 border-white/20 text-white hover:bg-white/10 transition-colors"
                onClick={handleNextPage}
                disabled={isSearching || cycleCount >= 3}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onAbort}
                className="text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content - Scrollable Grid */}
          <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar" style={{ willChange: 'scroll-position' }}>
            {SCREEN_CATEGORIES.map(category => {
              const images = store.searchedImages[category] || []
              const selectedImage = store.selectedImages[category]

              return (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-semibold text-zinc-200 capitalize border-b border-white/5 pb-2">
                    {category}
                    {selectedImage && <span className="ml-2 text-xs text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/20">Selected</span>}
                  </h3>
                  
                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {images.map((img, idx) => {
                        const isSelected = selectedImage?.originalUrl === img.originalUrl
                        
                        return (
                          <div 
                            key={idx}
                            className={cn(
                              "relative group cursor-pointer rounded-xl overflow-hidden border-2 w-fit",
                              isSelected 
                                ? "border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                                : "border-transparent hover:border-white/20"
                            )}
                            onClick={() => handleSelect(category, img)}
                          >
                            <img 
                              src={img.thumbnailUrl} 
                              alt={`${category} option ${idx + 1}`}
                              className="w-full h-auto object-contain"
                              loading="lazy"
                              decoding="async"
                            />
                            
                            {/* Selection Overlay */}
                            {isSelected && (
                              <div className="absolute inset-0 bg-white/10" />
                            )}
                            
                            {/* Circular Tick */}
                            <div className={cn(
                              "absolute top-3 right-3 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center w-8 h-8",
                              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )}>
                              <CheckCircle2 className={cn(
                                "w-6 h-6",
                                isSelected ? "text-white" : "text-white/50"
                              )} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="aspect-video w-full max-w-sm rounded-xl border border-white/10 bg-zinc-900/50 flex flex-col items-center justify-center text-zinc-500 gap-2">
                      {showLoadingSpinner ? (
                        <>
                          <RefreshCw className="w-6 h-6 animate-spin text-white/50" />
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
                "px-8 py-6 text-lg font-semibold transition-all duration-300 border",
                allSelected 
                  ? "bg-white text-black hover:bg-zinc-200 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)]" 
                  : "bg-zinc-800 text-zinc-500 border-transparent cursor-not-allowed"
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
