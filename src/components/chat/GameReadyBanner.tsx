/**
 * GameReadyBanner
 *
 * Shown in the chat interface when the agent detects the project is runnable.
 * Shows status during auto-run → error fixing → ready, then displays a Play button.
 */

import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, CheckCircle2, Loader2, Play, RefreshCw, X } from "lucide-react"
import type { GameRunState } from "../../services/gameReadyDetector"

interface GameReadyBannerProps {
  state: GameRunState
  errorCount?: number
  fixAttempt?: number
  projectId?: string
  onPlay: () => void
  onDismiss: () => void
}

const STATE_CONFIG: Record<
  GameRunState,
  { icon: React.ReactNode; label: string; sublabel?: string; accent: string; iconColor: string }
> = {
  idle: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    label: "Preparing game...",
    accent: "bg-muted border-border",
    iconColor: "text-foreground/60",
  },
  running: {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    label: "Running your game...",
    sublabel: "Checking for errors",
    accent: "bg-muted border-border",
    iconColor: "text-foreground/60",
  },
  fixing: {
    icon: <RefreshCw className="h-4 w-4 animate-spin" />,
    label: "Fixing errors...",
    accent: "bg-amber-500/10 border-amber-500/30",
    iconColor: "text-amber-500",
  },
  ready: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: "Game is ready!",
    sublabel: "No errors detected",
    accent: "bg-foreground text-background",
    iconColor: "text-background",
  },
  failed: {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "Could not fix all errors",
    sublabel: "Check the builder for details",
    accent: "bg-red-500/10 border-red-500/30",
    iconColor: "text-red-500",
  },
}

export function GameReadyBanner({
  state,
  errorCount,
  fixAttempt,
  projectId,
  onPlay,
  onDismiss,
}: GameReadyBannerProps) {
  const config = STATE_CONFIG[state]

  return (
    <AnimatePresence>
      <motion.div
        key="game-ready-banner"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className={`
          w-full rounded-2xl border bg-muted/50 backdrop-blur-sm p-4 flex items-center gap-3 my-3
        `}
      >
        {/* Status Icon */}
        <div className={`shrink-0 ${config.iconColor}`}>{config.icon}</div>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">
            {config.label}
            {state === "fixing" && fixAttempt !== undefined && (
              <span className="text-muted-foreground font-normal ml-1">
                (attempt {fixAttempt})
              </span>
            )}
          </p>
          {state === "fixing" && errorCount !== undefined && errorCount > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Found {errorCount} error{errorCount !== 1 ? "s" : ""}, auto-fixing...
            </p>
          )}
          {config.sublabel && state !== "fixing" && (
            <p className="text-xs text-muted-foreground mt-0.5">{config.sublabel}</p>
          )}
        </div>

        {/* Play Button (only when ready) */}
        {state === "ready" && (
          <motion.button
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", damping: 18, stiffness: 300 }}
            onClick={onPlay}
            className="
              shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl
              bg-background hover:bg-muted active:bg-muted/80
              text-foreground text-sm font-semibold transition-colors border border-border
              dark:bg-foreground dark:text-background dark:hover:bg-muted dark:border-foreground/20
            "
          >
            <Play className="h-4 w-4 fill-current" />
            Play
          </motion.button>
        )}

        {/* Failed — open game button */}
        {state === "failed" && projectId && (
          <a
            href={`/play/${projectId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-background hover:bg-muted border border-border
              text-xs font-medium text-foreground transition-colors
            "
          >
            Open Game
          </a>
        )}

        {/* Dismiss */}
        {(state === "ready" || state === "failed") && (
          <button
            onClick={onDismiss}
            className="shrink-0 p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
