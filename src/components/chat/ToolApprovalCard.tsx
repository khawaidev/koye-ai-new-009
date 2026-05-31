/**
 * ToolApprovalCard
 *
 * Rendered in the chat interface when the agent calls a file-modifying tool.
 * Shows a banner with:
 * - Tool type label
 * - Reject (✗) and Approve (✓) buttons
 *
 * Below the banner, renders SandboxDiffCard for each affected file.
 */

import { AnimatePresence, motion } from "framer-motion"
import { Check, File, FileMinus, FilePlus, Pencil, X } from "lucide-react"
import { useState } from "react"
import { useAgentToolStore } from "../../store/useAgentToolStore"
import type { SandboxChange } from "../../types/agentTools"
import { SandboxDiffCard } from "./SandboxDiffCard"

interface ToolApprovalCardProps {
  toolCallId: string
  toolName: string
  changes: SandboxChange[]
  onApprove: (toolCallId: string) => void
  onReject: (toolCallId: string) => void
}

const TOOL_LABELS: Record<string, string> = {
  create_file: "Create File",
  create_folder: "Create Folder",
  delete_file: "Delete File",
  delete_folder: "Delete Folder",
  edit_file: "Edit File",
  rename_file: "Rename File",
  move_file: "Move File",
  copy_file: "Copy File",
  replace_code: "Replace Code",
  search_codebase: "Search Codebase",
}

export function ToolApprovalCard({
  toolCallId,
  toolName,
  changes,
  onApprove,
  onReject,
}: ToolApprovalCardProps) {
  const { approveChange, rejectChange } = useAgentToolStore()
  const [isResolved, setIsResolved] = useState(false)
  const [resolution, setResolution] = useState<"approved" | "rejected" | null>(null)

  const label = TOOL_LABELS[toolName] ?? toolName
  const primary = changes[0]
  const primaryFileName = primary?.path?.split("/").pop() || primary?.path || label
  const PrimaryIcon =
    primary?.type === "create" ? FilePlus :
    primary?.type === "delete" ? FileMinus :
    primary?.type === "edit" ? Pencil :
    File

  const handleApprove = () => {
    setIsResolved(true)
    setResolution("approved")
    onApprove(toolCallId)
  }

  const handleReject = () => {
    setIsResolved(true)
    setResolution("rejected")
    onReject(toolCallId)
  }

  const handleIndividualApprove = (changeId: string) => {
    approveChange(changeId)
  }

  const handleIndividualReject = (changeId: string) => {
    rejectChange(changeId)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full my-3"
    >
      {/* ── Per-File Diff Cards ── */}
      {changes.length > 0 && (
        <div className="space-y-1.5">
          {changes.map((change) => (
            <SandboxDiffCard
              key={change.id}
              change={change}
              isResolved={isResolved}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

