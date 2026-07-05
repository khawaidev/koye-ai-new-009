import { motion } from "framer-motion"
import { Sparkles, Loader2, CheckCircle2, AlertCircle, PlayCircle, Network } from "lucide-react"
import { useParaliumStore } from "../../store/useParaliumStore"
import { cn } from "../../lib/utils"
import { useEffect, useRef } from "react"

export function ParaliumStatusCard() {
  const { blackboardState, getCurrentPhaseMessage } = useParaliumStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll the activity log
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [blackboardState?.agentMessages])

  if (!blackboardState) return null

  const phaseMessage = getCurrentPhaseMessage()
  const isDiscovery = !blackboardState.discoveryComplete
  
  // Parse task graph data if available
  let tasks: any[] = []
  try {
     if (blackboardState.taskGraphData) {
         const parsed = JSON.parse(blackboardState.taskGraphData)
         tasks = parsed.map((entry: any) => entry[1])
     }
  } catch (e) {
     console.error("Failed to parse task graph data", e)
  }

  return (
    <div className="w-full max-w-3xl mx-auto my-6 bg-zinc-950/80 border border-purple-500/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.1)]">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-900/40 to-transparent border-b border-purple-500/20 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-purple-100">Paralium V3 Agentic Core</h3>
        <span className="text-sm text-purple-300/80 ml-auto flex items-center gap-2">
          {blackboardState.overallProgress < 100 && (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          )}
          {phaseMessage}
        </span>
      </div>

      <div className="p-6">
        
        {/* Discovery Confidence Dashboard */}
        {isDiscovery && blackboardState.confidenceScores && (
           <div className="mb-6 p-4 rounded-lg bg-zinc-900/50 border border-white/5">
              <h4 className="text-sm font-medium text-zinc-300 mb-3">Discovery Confidence</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <ConfidenceMeter label="Gameplay" score={blackboardState.confidenceScores.gameplay} />
                 <ConfidenceMeter label="Visuals" score={blackboardState.confidenceScores.visuals} />
                 <ConfidenceMeter label="Narrative" score={blackboardState.confidenceScores.narrative} />
                 <ConfidenceMeter label="Technical" score={blackboardState.confidenceScores.technical} />
                 <ConfidenceMeter label="Scope" score={blackboardState.confidenceScores.scope} />
                 <ConfidenceMeter label="OVERALL" score={blackboardState.confidenceScores.overall} isPrimary />
              </div>
           </div>
        )}

        {/* Overall Progress */}
        {!isDiscovery && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-zinc-400 mb-2">
                 <span>Project Progress</span>
                 <span>{blackboardState.overallProgress}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 transition-all duration-500"
                    style={{ width: `${blackboardState.overallProgress}%` }}
                 />
              </div>
            </div>
        )}

        {/* Task Graph Visualization */}
        {!isDiscovery && tasks.length > 0 && (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-400" />
              Active Task Graph
            </h4>
            
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {tasks.map((task) => {
                const isRunning = task.status === "running"
                const isDone = task.status === "done"
                const isFailed = task.status === "failed"
                
                return (
                  <div 
                    key={task.id}
                    className={cn(
                      "flex flex-col p-3 rounded-lg border text-sm transition-all duration-300",
                      isRunning ? "bg-purple-500/10 border-purple-500/30" : 
                      isFailed ? "bg-red-500/10 border-red-500/30" : "bg-zinc-900/50 border-white/5",
                      isDone && "opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : isFailed ? (
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      ) : isRunning ? (
                        <Loader2 className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
                      ) : (
                        <PlayCircle className="w-4 h-4 text-zinc-600 shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className={cn("font-medium truncate", 
                           isRunning ? "text-purple-200" : 
                           isFailed ? "text-red-200" : "text-zinc-300"
                        )}>
                          [{task.assignedAgent.toUpperCase()}] {task.label}
                        </div>
                        {task.error && (
                          <div className="text-xs text-red-400 truncate mt-0.5">
                            {task.error.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Live Agent Activity Log */}
        <div className="border-t border-white/5 pt-4">
            <h4 className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Agent Activity Log</h4>
            <div 
               ref={scrollRef}
               className="h-32 overflow-y-auto custom-scrollbar rounded bg-black/40 border border-white/5 p-3 space-y-2 text-xs font-mono"
            >
               {blackboardState.agentMessages.length === 0 ? (
                  <span className="text-zinc-600">Awaiting agent activity...</span>
               ) : (
                  blackboardState.agentMessages.map((msg) => (
                     <div key={msg.id} className="flex gap-2">
                        <span className="text-zinc-500 shrink-0">
                           {new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' })}
                        </span>
                        <span className={cn(
                           "shrink-0 font-bold",
                           msg.from === 'executive' ? 'text-purple-400' :
                           msg.from === 'debug' ? 'text-red-400' :
                           msg.from === 'qa' ? 'text-green-400' :
                           'text-blue-400'
                        )}>
                           [{msg.from}]:
                        </span>
                        <span className={cn(
                           "break-words",
                           msg.type === 'error' ? 'text-red-300' : 'text-zinc-300'
                        )}>
                           {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                        </span>
                     </div>
                  ))
               )}
            </div>
        </div>

      </div>
    </div>
  )
}

function ConfidenceMeter({ label, score, isPrimary = false }: { label: string, score: number, isPrimary?: boolean }) {
   return (
      <div>
         <div className="flex justify-between text-xs mb-1">
            <span className={isPrimary ? "text-purple-300 font-bold" : "text-zinc-400"}>{label}</span>
            <span className={isPrimary ? "text-purple-300" : "text-zinc-500"}>{score}%</span>
         </div>
         <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div 
               className={cn(
                  "h-full transition-all duration-1000",
                  score >= 75 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500",
                  isPrimary && "bg-gradient-to-r from-purple-500 to-fuchsia-500"
               )}
               style={{ width: `${score}%` }}
            />
         </div>
      </div>
   )
}
