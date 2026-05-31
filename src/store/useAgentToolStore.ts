/**
 * Agent Tool Store
 *
 * Manages sandbox state (staged file changes) and user approval preferences
 * for the agentic tool system. The sandbox is the in-memory staging area
 * where tool-produced changes live BEFORE the user approves them.
 *
 * The Builder viewer reads from a merged view of
 * `generatedFiles` (real) + `sandboxChanges` (staged) so the user
 * can preview changes instantly, even before approving.
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  SandboxChange,
  ToolApprovalMode,
  ToolApprovalStatus,
  ToolCall,
  ToolResult,
} from "../types/agentTools"

interface AgentToolState {
  // ── Sandbox ──
  /** All staged changes from agent tool calls (not yet committed) */
  sandboxChanges: SandboxChange[]

  // ── Approval ──
  /** Always ask for approval — auto-execute has been removed */
  approvalMode: ToolApprovalMode
  /** Tool calls waiting for user decision */
  pendingToolCalls: ToolCall[]
  /** Results of tool calls (for read-only tools or after approval) */
  toolResults: ToolResult[]

  // ── Actions ──
  addSandboxChange: (change: SandboxChange) => void
  addSandboxChanges: (changes: SandboxChange[]) => void
  removeSandboxChange: (changeId: string) => void

  addPendingToolCall: (toolCall: ToolCall) => void
  removePendingToolCall: (toolCallId: string) => void

  addToolResult: (result: ToolResult) => void

  /** Approve a single sandbox change by ID */
  approveChange: (changeId: string) => void
  /** Reject a single sandbox change by ID */
  rejectChange: (changeId: string) => void
  /** Approve ALL changes for a given tool call ID */
  approveToolCall: (toolCallId: string) => void
  /** Reject ALL changes for a given tool call ID */
  rejectToolCall: (toolCallId: string) => void

  clearSandbox: () => void

  // ── Computed helpers ──
  /** Get all pending (unapproved) changes */
  getPendingChanges: () => SandboxChange[]
  /** Get changes grouped by tool call ID */
  getChangesByToolCall: (toolCallId: string) => SandboxChange[]

  /**
   * Build a merged file map: real files + sandbox overlays.
   * This is what the Builder viewer should use to show previews.
   */
  getMergedFiles: (realFiles: Record<string, string>) => Record<string, string>
}

export const useAgentToolStore = create<AgentToolState>()(
  persist(
    (set, get) => {
      // ── Cross-Tab Sync via BroadcastChannel ──
      const channel = typeof window !== 'undefined' ? new BroadcastChannel('agent-tool-store-sync') : null
      let isSyncing = false

      if (channel) {
        channel.onmessage = (event) => {
          if (event.data?.type === 'SYNC_SANDBOX') {
            isSyncing = true
            set({ sandboxChanges: event.data.payload })
            isSyncing = false
          }
        }
      }

      // Wrapper around set to also broadcast changes
      const setWithBroadcast = (updater: any) => {
        set(updater)
        if (!isSyncing && channel) {
          channel.postMessage({
            type: 'SYNC_SANDBOX',
            payload: get().sandboxChanges
          })
        }
      }

      return {
        sandboxChanges: [],
        approvalMode: "ask_every_time",
        pendingToolCalls: [],
        toolResults: [],

        // ── Sandbox mutations ──
        addSandboxChange: (change) =>
          setWithBroadcast((s: AgentToolState) => ({ sandboxChanges: [...s.sandboxChanges, change] })),

        addSandboxChanges: (changes) =>
          setWithBroadcast((s: AgentToolState) => ({ sandboxChanges: [...s.sandboxChanges, ...changes] })),

        removeSandboxChange: (changeId) =>
          setWithBroadcast((s: AgentToolState) => ({
            sandboxChanges: s.sandboxChanges.filter((c) => c.id !== changeId),
          })),

        // ── Tool calls ──
        addPendingToolCall: (toolCall) =>
          set((s) => ({ pendingToolCalls: [...s.pendingToolCalls, toolCall] })),

        removePendingToolCall: (toolCallId) =>
          set((s) => ({
            pendingToolCalls: s.pendingToolCalls.filter((t) => t.id !== toolCallId),
          })),

        addToolResult: (result) =>
          set((s) => ({ toolResults: [...s.toolResults, result] })),

        // ── Approval ──
        approveChange: (changeId) =>
          setWithBroadcast((s: AgentToolState) => ({
            sandboxChanges: s.sandboxChanges.map((c) =>
              c.id === changeId ? { ...c, status: "approved" as ToolApprovalStatus } : c
            ),
          })),

        rejectChange: (changeId) =>
          setWithBroadcast((s: AgentToolState) => ({
            sandboxChanges: s.sandboxChanges.map((c) =>
              c.id === changeId ? { ...c, status: "rejected" as ToolApprovalStatus } : c
            ),
          })),

        approveToolCall: (toolCallId) =>
          setWithBroadcast((s: AgentToolState) => ({
            sandboxChanges: s.sandboxChanges.map((c) =>
              c.toolCallId === toolCallId
                ? { ...c, status: "approved" as ToolApprovalStatus }
                : c
            ),
            pendingToolCalls: s.pendingToolCalls.filter((t) => t.id !== toolCallId),
          })),

        rejectToolCall: (toolCallId) =>
          setWithBroadcast((s: AgentToolState) => ({
            sandboxChanges: s.sandboxChanges.map((c) =>
              c.toolCallId === toolCallId
                ? { ...c, status: "rejected" as ToolApprovalStatus }
                : c
            ),
            pendingToolCalls: s.pendingToolCalls.filter((t) => t.id !== toolCallId),
          })),

        clearSandbox: () =>
          setWithBroadcast({
            sandboxChanges: [],
            pendingToolCalls: [],
            toolResults: [],
          }),

        // ── Computed ──
        getPendingChanges: () =>
          get().sandboxChanges.filter((c) => c.status === "pending"),

      getChangesByToolCall: (toolCallId) =>
        get().sandboxChanges.filter((c) => c.toolCallId === toolCallId),

      getMergedFiles: (realFiles) => {
        const merged = { ...realFiles }
        const changes = get().sandboxChanges

        for (const change of changes) {
          // Only apply pending or approved changes to the preview
          if (change.status === "rejected") continue

          switch (change.type) {
            case "create":
            case "edit":
            case "copy":
              if (change.newContent !== undefined) {
                const targetPath = change.type === "copy" && change.newPath
                  ? change.newPath
                  : change.path
                merged[targetPath] = change.newContent
              }
              break
            case "delete":
              delete merged[change.path]
              break
            case "rename":
            case "move":
              if (change.newPath) {
                const content = merged[change.path] ?? change.originalContent ?? ""
                delete merged[change.path]
                merged[change.newPath] = change.newContent ?? content
              }
              break
          }
        }

        return merged
      }
    }
  },
  {
    name: "agent-tool-store",
    version: 3,
      // Only persist the approval mode preference, not the volatile sandbox
      partialize: (state) => ({
        approvalMode: state.approvalMode,
      }),
      migrate: (persistedState: any, version: number) => {
        // v3: auto_execute has been removed — force all users to ask_every_time.
        if (version < 3) {
          return { ...persistedState, approvalMode: "ask_every_time" }
        }
        return persistedState
      },
    }
  )
)
