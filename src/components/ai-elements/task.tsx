import { createContext, useContext, useState, type ReactNode } from "react"
import { ChevronDown, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"

// ─── Context ──────────────────────────────────────────────────
interface TaskContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const TaskContext = createContext<TaskContextValue | null>(null)

function useTask() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error("Task components must be used within <Task>")
  return ctx
}

// ─── Task (Root) ──────────────────────────────────────────────
interface TaskProps {
  children: ReactNode
  className?: string
  defaultOpen?: boolean
}

export function Task({ children, className, defaultOpen = true }: TaskProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <TaskContext.Provider value={{ open, setOpen }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TaskContext.Provider>
  )
}

// ─── TaskTrigger ──────────────────────────────────────────────
interface TaskTriggerProps {
  title: string
  className?: string
}

export function TaskTrigger({ title, className }: TaskTriggerProps) {
  const { open, setOpen } = useTask()
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border/60 bg-card/80 dark:bg-[#1a1a18] hover:bg-muted/60 dark:hover:bg-white/5 transition-colors text-left",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Search className="size-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium text-foreground truncate">{title}</span>
      </div>
      <ChevronDown
        className={cn(
          "size-4 text-muted-foreground shrink-0 transition-transform duration-200",
          open && "rotate-180"
        )}
      />
    </button>
  )
}

// ─── TaskContent ──────────────────────────────────────────────
interface TaskContentProps {
  children: ReactNode
  className?: string
}

export function TaskContent({ children, className }: TaskContentProps) {
  const { open } = useTask()
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className={cn("pt-2 pl-3 space-y-1.5", className)}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── TaskItem ─────────────────────────────────────────────────
interface TaskItemProps {
  children: ReactNode
  className?: string
}

export function TaskItem({ children, className }: TaskItemProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 text-sm text-muted-foreground leading-relaxed py-0.5",
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-muted-foreground/50 mt-2 shrink-0" />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

// ─── TaskItemFile ─────────────────────────────────────────────
interface TaskItemFileProps {
  children: ReactNode
  className?: string
}

export function TaskItemFile({ children, className }: TaskItemFileProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/80 dark:bg-white/5 border border-border/60 text-foreground/90 text-xs font-medium",
        className
      )}
    >
      {children}
    </span>
  )
}
