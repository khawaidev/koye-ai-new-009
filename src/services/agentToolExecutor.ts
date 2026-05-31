/**
 * Agent Tool Executor
 *
 * Executes tool calls in a sandbox (in-memory staging) and, upon approval,
 * commits those changes to R2 + Supabase via the existing projectFiles service.
 *
 * Flow:
 * 1. LLM emits tool call → Parser extracts it
 * 2. executeToolInSandbox() runs the tool against current files, produces SandboxChange[]
 * 3. Changes are staged in useAgentToolStore
 * 4. User approves/rejects via UI
 * 5. On approve → applyApprovedChanges() persists to R2 + updates generatedFiles
 */

import { uuidv4 } from "../lib/uuid"
import { deleteProjectFile, saveSingleProjectFile } from "./projectFiles"
import { saveVFSFile, deleteVFSFile, renameVFSFile } from "./vfs"
import type {
  SandboxChange,
  ToolCall,
  ToolResult,
} from "../types/agentTools"

// ───── Smart Merge Protection ─────

/**
 * Detect when the AI sends a partial snippet via edit_file instead of the full
 * file content, and try to merge it intelligently rather than overwriting.
 *
 * Heuristic:
 * - If newContent has ≥50% as many lines as original → treat as full rewrite (intentional)
 * - If newContent is much smaller → it's probably a partial snippet. Try to find
 *   overlapping "anchor" lines in the original to figure out WHERE the snippet goes,
 *   then splice it in.
 * - If no anchors are found → append the new content at the end (safest fallback).
 */
function smartMergeContent(original: string, newContent: string): string {
  const originalLines = original.split("\n")
  const newLines = newContent.split("\n")

  // If the file is empty/tiny or new content is empty, no merge needed
  if (originalLines.length <= 3 || newLines.length === 0) {
    return newContent
  }

  // If new content is ≥50% the size of original, treat as intentional full rewrite
  const ratio = newLines.length / originalLines.length
  if (ratio >= 0.5) {
    return newContent
  }

  console.warn(
    `[SmartMerge] edit_file sent ${newLines.length} lines for a ${originalLines.length}-line file ` +
    `(${Math.round(ratio * 100)}%). Attempting smart merge instead of full replacement.`
  )

  // Strategy: Find the first and last lines in newContent that also exist in the original.
  // These are our "anchors" — they tell us WHERE in the original the snippet belongs.
  const trimmedOriginalLines = originalLines.map(l => l.trim())

  let firstAnchorOrigIdx = -1
  let lastAnchorOrigIdx = -1
  let firstAnchorNewIdx = -1
  let lastAnchorNewIdx = -1

  // Find first anchor: first non-empty line in newContent that exists in original
  for (let ni = 0; ni < newLines.length; ni++) {
    const trimmed = newLines[ni].trim()
    if (!trimmed || trimmed.length < 3) continue // Skip blank/trivial lines

    const origIdx = trimmedOriginalLines.indexOf(trimmed)
    if (origIdx !== -1) {
      firstAnchorOrigIdx = origIdx
      firstAnchorNewIdx = ni
      break
    }
  }

  // Find last anchor: last non-empty line in newContent that exists in original
  for (let ni = newLines.length - 1; ni >= 0; ni--) {
    const trimmed = newLines[ni].trim()
    if (!trimmed || trimmed.length < 3) continue

    const origIdx = trimmedOriginalLines.lastIndexOf(trimmed)
    if (origIdx !== -1 && origIdx >= firstAnchorOrigIdx) {
      lastAnchorOrigIdx = origIdx
      lastAnchorNewIdx = ni
      break
    }
  }

  // If we found anchors, splice the new content into the original at the anchor positions
  if (firstAnchorOrigIdx !== -1 && lastAnchorOrigIdx !== -1 && firstAnchorOrigIdx <= lastAnchorOrigIdx) {
    // The snippet replaces originalLines[firstAnchorOrigIdx..lastAnchorOrigIdx]
    // But the snippet itself may have extra lines before/after the anchors
    const beforeAnchorNewLines = newLines.slice(0, firstAnchorNewIdx)
    const afterAnchorNewLines = newLines.slice(lastAnchorNewIdx + 1)

    const beforeOriginal = originalLines.slice(0, firstAnchorOrigIdx)
    const afterOriginal = originalLines.slice(lastAnchorOrigIdx + 1)

    const merged = [
      ...beforeOriginal,
      ...beforeAnchorNewLines,
      ...newLines.slice(firstAnchorNewIdx, lastAnchorNewIdx + 1),
      ...afterAnchorNewLines,
      ...afterOriginal,
    ].join("\n")

    console.log(
      `[SmartMerge] Merged snippet at lines ${firstAnchorOrigIdx + 1}-${lastAnchorOrigIdx + 1} ` +
      `of original (${originalLines.length} → ${merged.split("\n").length} lines)`
    )
    return merged
  }

  // No anchors found — the snippet doesn't overlap with the original at all.
  // This likely means the AI is adding entirely new content.
  // Append it at the end rather than replacing everything.
  console.warn(
    `[SmartMerge] No anchor lines found. Appending ${newLines.length} new lines ` +
    `to the end of the file instead of replacing ${originalLines.length} lines.`
  )
  return original + "\n\n" + newContent
}

// ───── Sandbox Execution ─────

/**
 * Execute a tool call in the sandbox (no side effects, no persistence).
 * Returns the sandbox changes produced by the tool.
 */
export function executeToolInSandbox(
  toolCall: ToolCall,
  currentFiles: Record<string, string>
): { changes: SandboxChange[]; result?: ToolResult } {
  const { tool, params, id: toolCallId } = toolCall
  const changes: SandboxChange[] = []

  switch (tool) {
    // ── Create File ──
    case "create_file": {
      const { path, content = "" } = params
      const existing = currentFiles[path]
      changes.push({
        id: uuidv4(),
        toolCallId,
        path,
        type: "create",
        originalContent: existing,
        newContent: content,
        linesAdded: content.split("\n").length,
        linesRemoved: existing ? existing.split("\n").length : 0,
        status: "pending",
      })
      break
    }

    // ── Create Folder ──
    case "create_folder": {
      const { path } = params
      const keepFile = `${path}/.gitkeep`
      changes.push({
        id: uuidv4(),
        toolCallId,
        path: keepFile,
        type: "create",
        newContent: "",
        linesAdded: 0,
        linesRemoved: 0,
        status: "pending",
      })
      break
    }

    // ── Edit File ──
    case "edit_file": {
      // Skip __editImage calls (those are handled separately in ChatInterface)
      if (params.__editImage) break

      const { path, content = "", startLine, endLine } = params
      const original = currentFiles[path] ?? ""
      
      let newContent = content
      
      // If startLine and endLine are provided, replace just that section
      if (startLine !== undefined && endLine !== undefined && original) {
        const lines = original.split('\n')
        // Convert 1-indexed to 0-indexed
        const startIdx = Math.max(0, startLine - 1)
        const endIdx = Math.max(0, endLine)
        
        const before = lines.slice(0, startIdx)
        const after = lines.slice(endIdx)
        
        newContent = [...before, content, ...after].join('\n')
      } else if (original && content) {
        // ── Smart merge protection ──
        // Detect when the AI sends a partial snippet instead of the full file.
        // If the new content is significantly shorter than the original, it's
        // almost certainly a partial edit — NOT a full rewrite.
        newContent = smartMergeContent(original, content)
      }

      const originalLines = original.split("\n").length
      const newLines = newContent.split("\n").length
      changes.push({
        id: uuidv4(),
        toolCallId,
        path,
        type: "edit",
        originalContent: original,
        newContent,
        linesAdded: Math.max(0, newLines - originalLines),
        linesRemoved: Math.max(0, originalLines - newLines),
        status: "pending",
      })
      break
    }

    // ── Delete File ──
    case "delete_file": {
      const { path } = params
      const original = currentFiles[path]
      changes.push({
        id: uuidv4(),
        toolCallId,
        path,
        type: "delete",
        originalContent: original,
        linesAdded: 0,
        linesRemoved: original ? original.split("\n").length : 0,
        status: "pending",
      })
      break
    }

    // ── Delete Folder ──
    case "delete_folder": {
      const { path } = params
      const prefix = path.endsWith("/") ? path : path + "/"
      for (const filePath of Object.keys(currentFiles)) {
        if (filePath.startsWith(prefix) || filePath === path) {
          const original = currentFiles[filePath]
          changes.push({
            id: uuidv4(),
            toolCallId,
            path: filePath,
            type: "delete",
            originalContent: original,
            linesAdded: 0,
            linesRemoved: original ? original.split("\n").length : 0,
            status: "pending",
          })
        }
      }
      break
    }

    // ── Rename File ──
    case "rename_file": {
      const { path, newName } = params
      const lastSlash = path.lastIndexOf("/")
      const dir = lastSlash > 0 ? path.substring(0, lastSlash) : ""
      const newPath = dir ? `${dir}/${newName}` : newName
      const original = currentFiles[path] ?? ""
      changes.push({
        id: uuidv4(),
        toolCallId,
        path,
        type: "rename",
        originalContent: original,
        newContent: original,
        newPath,
        linesAdded: 0,
        linesRemoved: 0,
        status: "pending",
      })
      break
    }

    // ── Move File ──
    case "move_file": {
      const { path, destination } = params
      const original = currentFiles[path] ?? ""
      changes.push({
        id: uuidv4(),
        toolCallId,
        path,
        type: "move",
        originalContent: original,
        newContent: original,
        newPath: destination,
        linesAdded: 0,
        linesRemoved: 0,
        status: "pending",
      })
      break
    }

    // ── Copy File ──
    case "copy_file": {
      const { path, destination } = params
      const original = currentFiles[path] ?? ""
      changes.push({
        id: uuidv4(),
        toolCallId,
        path,
        type: "copy",
        originalContent: original,
        newContent: original,
        newPath: destination,
        linesAdded: original.split("\n").length,
        linesRemoved: 0,
        status: "pending",
      })
      break
    }

    // ── Replace Code ──
    case "replace_code": {
      const { path, search, replace, replaceAll = true } = params
      const original = currentFiles[path] ?? ""
      let newContent: string
      if (replaceAll) {
        newContent = original.split(search).join(replace)
      } else {
        newContent = original.replace(search, replace)
      }
      const originalLines = original.split("\n").length
      const newLines = newContent.split("\n").length
      changes.push({
        id: uuidv4(),
        toolCallId,
        path,
        type: "edit",
        originalContent: original,
        newContent,
        linesAdded: Math.max(0, newLines - originalLines),
        linesRemoved: Math.max(0, originalLines - newLines),
        status: "pending",
      })
      break
    }

    // ── Read-Only: Get File Contents ──
    case "get_file_contents": {
      const { path } = params
      const content = currentFiles[path]
      return {
        changes: [],
        result: {
          toolCallId,
          status: "auto",
          result: content !== undefined
            ? { path, content }
            : { path, error: `File not found: ${path}` },
        },
      }
    }

    // ── Read-Only: List Files ──
    case "list_files": {
      const { path: dirPath } = params
      let filePaths = Object.keys(currentFiles)
      if (dirPath) {
        const prefix = dirPath.endsWith("/") ? dirPath : dirPath + "/"
        filePaths = filePaths.filter((p) => p.startsWith(prefix))
      }
      return {
        changes: [],
        result: {
          toolCallId,
          status: "auto",
          result: { files: filePaths },
        },
      }
    }

    // ── Read-Only: Search Codebase ──
    case "search_codebase": {
      const { query, filePattern } = params
      const results: Array<{ path: string; line: number; text: string }> = []
      const lowerQuery = query.toLowerCase()

      for (const [filePath, content] of Object.entries(currentFiles)) {
        // Skip binary content
        if (content.startsWith("data:") || content.startsWith("http")) continue
        // Optional glob filter (simple prefix match for now)
        if (filePattern && !filePath.includes(filePattern)) continue

        const lines = content.split("\n")
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(lowerQuery)) {
            results.push({ path: filePath, line: i + 1, text: lines[i].trim() })
          }
        }
      }

      return {
        changes: [],
        result: {
          toolCallId,
          status: "auto",
          result: { query, matches: results.slice(0, 50) }, // Cap at 50
        },
      }
    }

    // ── Autonomous: Search Web ──
    case "search_web": {
      // This is handled separately in ChatInterface (existing web search flow)
      return {
        changes: [],
        result: {
          toolCallId,
          status: "auto",
          result: { note: "Web search is handled by the existing [WEB_SEARCH: ...] flow." },
        },
      }
    }

    // ── Autonomous: Background Tasks ──
    case "start_background_task": {
      const { type, prompt, config } = params
      const taskId = uuidv4()
      
      // Dispatch an event that WorkflowManager can intercept to start generation
      if (typeof window !== "undefined") {
        // Dynamic import to avoid circular dependencies with React stores
        import("../store/useTaskStore").then(({ useTaskStore }) => {
          useTaskStore.getState().addTask({
            id: taskId,
            type: type as any,
            status: "pending",
            config: { textPrompt: prompt, ...config },
            createdAt: Date.now(),
            prompt,
          })
          
          window.dispatchEvent(new CustomEvent("user-confirmed-asset-generation", {
            detail: { assetType: type, taskId, config: { textPrompt: prompt, ...config } }
          }))
        })
      }
      
      return {
        changes: [],
        result: {
          toolCallId,
          status: "auto",
          result: { 
            message: `Background task started with ID ${taskId}. Check its status using check_task_status.`,
            taskId
          },
        },
      }
    }

    case "check_task_status": {
      const { taskId } = params
      let statusResult: any = { status: "unknown", message: "Task not found or store unavailable" }
      
      if (typeof window !== "undefined") {
        try {
          // Since it's synchronous execution, we use the already loaded store if possible
          // useTaskStore should be available globally or we can use the default timeout
          const { useTaskStore } = require("../store/useTaskStore")
          const task = useTaskStore.getState().tasks.find((t: any) => t.id === taskId)
          
          if (task) {
            statusResult = {
              taskId: task.id,
              type: task.type,
              status: task.status,
              progress: task.progress,
              resultUrl: task.resultUrl,
              error: task.error
            }
          }
        } catch (e) {
          console.error("Could not check task status:", e)
        }
      }

      return {
        changes: [],
        result: {
          toolCallId,
          status: "auto",
          result: statusResult,
        },
      }
    }
    default:
      console.warn(`[AgentToolExecutor] Unknown tool: ${tool}`)
  }

  return { changes }
}

// ───── Persistence (apply approved changes to R2 + Supabase) ─────

/**
 * Apply a list of approved sandbox changes to real storage.
 * Calls projectFiles.ts functions to persist to R2 + Supabase.
 *
 * @returns A map of path → content for the files that were successfully applied.
 */
export async function applyApprovedChanges(
  changes: SandboxChange[],
  projectId: string,
  userId: string,
  githubConnection: any
): Promise<Record<string, string | null>> {
  const applied: Record<string, string | null> = {}

  const saveWithRetry = async (path: string, content: string) => {
    let lastError: unknown = null
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await saveSingleProjectFile(projectId, userId, "", path, content, githubConnection)
        return
      } catch (error) {
        lastError = error
        console.warn(`[AgentToolExecutor] Save attempt ${attempt} failed for ${path}:`, error)
      }
    }
    throw lastError instanceof Error ? lastError : new Error(`Failed to save ${path}`)
  }

  const deleteWithRetry = async (path: string) => {
    let lastError: unknown = null
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await deleteProjectFile(projectId, userId, path, githubConnection)
        return
      } catch (error) {
        lastError = error
        console.warn(`[AgentToolExecutor] Delete attempt ${attempt} failed for ${path}:`, error)
      }
    }
    throw lastError instanceof Error ? lastError : new Error(`Failed to delete ${path}`)
  }

  for (const change of changes) {
    if (change.status !== "approved") continue

    try {
      switch (change.type) {
        case "create":
        case "edit": {
          const content = change.newContent ?? ""
          await saveWithRetry(change.path, content)
          // Sync to VFS (local filesystem layer)
          await saveVFSFile(projectId, change.path, content).catch(e =>
            console.warn(`[VFS] Failed to sync ${change.path}:`, e)
          )
          applied[change.path] = content
          console.log(`✓ Agent tool applied ${change.type}: ${change.path}`)
          break
        }

        case "delete": {
          await deleteWithRetry(change.path)
          // Sync to VFS
          await deleteVFSFile(projectId, change.path).catch(e =>
            console.warn(`[VFS] Failed to delete ${change.path}:`, e)
          )
          applied[change.path] = null
          console.log(`✓ Agent tool applied delete: ${change.path}`)
          break
        }

        case "rename":
        case "move": {
          if (change.newPath) {
            // Delete old path, create new path
            await deleteWithRetry(change.path)
            const content = change.newContent ?? change.originalContent ?? ""
            await saveWithRetry(change.newPath, content)
            // Sync to VFS
            await renameVFSFile(projectId, change.path, change.newPath).catch(async (e) => {
              console.warn(`[VFS] rename failed, falling back to delete+save:`, e)
              await deleteVFSFile(projectId, change.path).catch(() => {})
              await saveVFSFile(projectId, change.newPath!, content).catch(() => {})
            })
            applied[change.path] = null
            applied[change.newPath] = content
            console.log(`✓ Agent tool applied ${change.type}: ${change.path} → ${change.newPath}`)
          }
          break
        }

        case "copy": {
          if (change.newPath && change.newContent !== undefined) {
            await saveWithRetry(change.newPath, change.newContent)
            // Sync to VFS
            await saveVFSFile(projectId, change.newPath, change.newContent).catch(e =>
              console.warn(`[VFS] Failed to sync copy ${change.newPath}:`, e)
            )
            applied[change.newPath] = change.newContent
            console.log(`✓ Agent tool applied copy: ${change.path} → ${change.newPath}`)
          }
          break
        }
      }
    } catch (error) {
      console.error(`✗ Agent tool failed to apply ${change.type} for ${change.path}:`, error)
    }
  }

  return applied
}

export function applySandboxChangesToFileMap(
  baseFiles: Record<string, string>,
  changes: SandboxChange[]
): Record<string, string> {
  const nextFiles = { ...baseFiles }

  for (const change of changes) {
    switch (change.type) {
      case "create":
      case "edit":
        nextFiles[change.path] = change.newContent ?? ""
        break
      case "delete":
        delete nextFiles[change.path]
        break
      case "rename":
      case "move":
        if (change.newPath) {
          const content = change.newContent ?? change.originalContent ?? nextFiles[change.path] ?? ""
          delete nextFiles[change.path]
          nextFiles[change.newPath] = content
        }
        break
      case "copy":
        if (change.newPath) {
          nextFiles[change.newPath] = change.newContent ?? change.originalContent ?? ""
        }
        break
    }
  }

  return nextFiles
}
