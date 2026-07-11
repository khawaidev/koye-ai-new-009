import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from "../ai-elements/task"
import { cn } from "../../lib/utils"

export interface SearchToolTask {
  /** Tool call id */
  id: string
  /** The query being searched */
  query?: string
  /** Whether the search is in progress */
  inProgress: boolean
  /** List of files that have been scanned / matched */
  scannedFiles: string[]
  /** List of files that have been read */
  readFiles: string[]
  /** When the search started */
  startedAt: number
}

interface SearchToolCardProps {
  task: SearchToolTask
  className?: string
}

/**
 * Card that mimics the search-tool UI shown when the agent uses
 * `search_codebase` on the user's project. Renders in the chat
 * interface while the search/read steps are in progress.
 */
export function SearchToolCard({ task, className }: SearchToolCardProps) {
  const query = task.query || ""
  const scannedCount = task.scannedFiles.length
  const inProgress = task.inProgress

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "w-full max-w-3xl mx-auto my-3 rounded-xl border border-border/60 bg-card/60 dark:bg-[#1a1a18]/80 backdrop-blur-sm shadow-sm",
        className
      )}
    >
      <Task className="w-full" defaultOpen={inProgress}>
        <TaskTrigger
          title={
            inProgress
              ? `Searching project files…`
              : scannedCount > 0
                ? `Found matches in ${scannedCount} ${scannedCount === 1 ? "file" : "files"}`
                : `Searched for "${query}"`
          }
        />
        <TaskContent>
          {/* Initial search step */}
          {query && (
            <TaskItem>
              <span>Searching</span>
              <TaskItemFile>
                <span className="text-foreground/80 font-mono">
                  "{query}"
                </span>
              </TaskItemFile>
            </TaskItem>
          )}

          {/* Scanning files (in progress) */}
          {inProgress && scannedCount === 0 && (
            <TaskItem>
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="text-muted-foreground"
              >
                Scanning project files…
              </motion.span>
            </TaskItem>
          )}

          {/* List scanned files as task items */}
          {task.scannedFiles.map((file, idx) => (
            <TaskItem key={`scan-${idx}`}>
              <span className="text-muted-foreground">Scanning</span>
              <TaskItemFile>
                <FileChip file={file} />
              </TaskItemFile>
            </TaskItem>
          ))}

          {/* Reading matched files */}
          {task.readFiles.map((file, idx) => (
            <TaskItem key={`read-${idx}`}>
              <span className="text-muted-foreground">Read</span>
              <TaskItemFile>
                <FileChip file={file} />
              </TaskItemFile>
            </TaskItem>
          ))}

          {/* Final summary while in progress */}
          {inProgress && scannedCount > 0 && (
            <TaskItem>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="text-muted-foreground"
              >
                Compiling matches…
              </motion.span>
            </TaskItem>
          )}
        </TaskContent>
      </Task>
    </motion.div>
  )
}

function FileChip({ file }: { file: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-foreground/90">
      <span className="size-3 rounded-sm bg-foreground/20 shrink-0" />
      <span>{file}</span>
    </span>
  )
}

/**
 * Hook-style store for active search tool tasks in the chat.
 * Tracks the most recent search_codebase invocation in real-time.
 */
export class SearchToolTracker {
  private static instance: SearchToolTracker
  private tasks: Map<string, SearchToolTask> = new Map()
  private listeners: Set<(tasks: SearchToolTask[]) => void> = new Set()

  static getInstance(): SearchToolTracker {
    if (!SearchToolTracker.instance) {
      SearchToolTracker.instance = new SearchToolTracker()
    }
    return SearchToolTracker.instance
  }

  subscribe(listener: (tasks: SearchToolTask[]) => void): () => void {
    this.listeners.add(listener)
    listener(Array.from(this.tasks.values()))
    return () => this.listeners.delete(listener)
  }

  private notify() {
    const tasks = Array.from(this.tasks.values())
    this.listeners.forEach((l) => l(tasks))
  }

  startSearch(toolCallId: string, query?: string) {
    this.tasks.set(toolCallId, {
      id: toolCallId,
      query,
      inProgress: true,
      scannedFiles: [],
      readFiles: [],
      startedAt: Date.now(),
    })
    this.notify()
  }

  setQuery(toolCallId: string, query: string) {
    const task = this.tasks.get(toolCallId)
    if (task) {
      task.query = query
      this.notify()
    }
  }

  addScannedFiles(toolCallId: string, files: string[]) {
    const task = this.tasks.get(toolCallId)
    if (task) {
      const unique = new Set([...task.scannedFiles, ...files])
      task.scannedFiles = Array.from(unique)
      this.notify()
    }
  }

  addReadFile(toolCallId: string, file: string) {
    const task = this.tasks.get(toolCallId)
    if (task) {
      if (!task.readFiles.includes(file)) {
        task.readFiles = [...task.readFiles, file]
      }
      this.notify()
    }
  }

  completeSearch(toolCallId: string) {
    const task = this.tasks.get(toolCallId)
    if (task) {
      task.inProgress = false
      this.notify()
      // Auto-remove after 10s so users have time to see the results
      setTimeout(() => {
        this.tasks.delete(toolCallId)
        this.notify()
      }, 10000)
    }
  }

  clear() {
    this.tasks.clear()
    this.notify()
  }

  getTasks(): SearchToolTask[] {
    return Array.from(this.tasks.values())
  }
}

export function useSearchToolTasks(): SearchToolTask[] {
  const [tasks, setTasks] = useState<SearchToolTask[]>([])
  useEffect(() => {
    const tracker = SearchToolTracker.getInstance()
    return tracker.subscribe(setTasks)
  }, [])
  return tasks
}
