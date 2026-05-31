import { motion } from "framer-motion"
import { Sparkles, Search, Image as ImageIcon, Brain, FileCode, CheckCircle2, Code2, Loader2, Check } from "lucide-react"
import { useParaliumStore, type ParaliumPhase } from "../../store/useParaliumStore"
import { cn } from "../../lib/utils"

const PHASES: Array<{ id: ParaliumPhase; label: string; icon: any }> = [
  { id: "idea_intake", label: "Idea Intake", icon: Sparkles },
  { id: "finding_games", label: "Finding References", icon: Search },
  { id: "searching_images", label: "Searching Screens", icon: ImageIcon },
  { id: "selecting_images", label: "User Selection", icon: ImageIcon },
  { id: "analyzing_images", label: "Vision Analysis", icon: Brain },
  { id: "generating_plan", label: "Planning Architecture", icon: FileCode },
  { id: "coding_game", label: "Coding Prototype", icon: Code2 },
  { id: "complete", label: "Complete", icon: CheckCircle2 },
]

export function ParaliumStatusCard() {
  const store = useParaliumStore()
  
  if (store.phase === "idle") return null

  const currentIndex = PHASES.findIndex(p => p.id === store.phase)
  
  // For the coding phase, we show specific task progress
  const isCoding = store.phase === "coding_game"
  const currentTask = store.codingTasks[store.currentTaskIndex]

  return (
    <div className="w-full max-w-3xl mx-auto my-6 bg-zinc-950/80 border border-purple-500/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.1)]">
      <div className="p-4 bg-gradient-to-r from-purple-900/40 to-transparent border-b border-purple-500/20 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-purple-100">Paralium Agentic Builder</h3>
        {store.phaseMessage && (
          <span className="text-sm text-purple-300/80 ml-auto flex items-center gap-2">
            {store.phase !== "complete" && store.phase !== "selecting_images" && (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
            {store.phaseMessage}
          </span>
        )}
      </div>

      <div className="p-6">
        {/* Progress Pipeline */}
        <div className="flex flex-wrap gap-2 mb-8">
          {PHASES.map((phase, idx) => {
            const Icon = phase.icon
            const isPast = idx < currentIndex || store.phase === "complete"
            const isCurrent = idx === currentIndex
            
            return (
              <div 
                key={phase.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-500",
                  isCurrent 
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                    : isPast 
                      ? "bg-zinc-800/50 text-zinc-400 border border-white/5" 
                      : "bg-zinc-900/30 text-zinc-600 border border-transparent opacity-50"
                )}
              >
                {isPast ? <Check className="w-3.5 h-3.5" /> : <Icon className={cn("w-3.5 h-3.5", isCurrent && "animate-pulse")} />}
                {phase.label}
              </div>
            )
          })}
        </div>

        {/* Coding Task Progress */}
        {store.codingTasks.length > 0 && (
          <div className="space-y-3 mt-6 border-t border-white/10 pt-6">
            <h4 className="text-sm font-medium text-zinc-300 flex justify-between">
              <span>Code Generation Tasks</span>
              <span className="text-purple-400">{store.currentTaskIndex + 1} / {store.codingTasks.length}</span>
            </h4>
            
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {store.codingTasks.map((task, idx) => {
                const isActive = idx === store.currentTaskIndex && store.phase === "coding_game"
                const isDone = task.status === "done"
                
                return (
                  <div 
                    key={task.id}
                    className={cn(
                      "flex flex-col p-3 rounded-lg border text-sm transition-all duration-300",
                      isActive ? "bg-purple-500/10 border-purple-500/30" : "bg-zinc-900/50 border-white/5",
                      isDone && "opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className={cn("font-medium truncate", isActive ? "text-purple-200" : "text-zinc-300")}>
                          {task.name}
                        </div>
                        {isActive && (
                          <div className="text-xs text-purple-300/70 truncate mt-0.5">
                            {task.purpose}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Output Files */}
                    {isDone && task.outputFiles.length > 0 && (
                      <div className="mt-2 pl-7 flex flex-wrap gap-1.5">
                        {task.outputFiles.map(file => (
                          <span key={file} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-white/5 font-mono">
                            {file.split('/').pop()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
