/**
 * Script Discovery
 *
 * Finds runnable .js / .ts scripts in the project VFS,
 * prioritising main.js > index.js > game.js > alphabetical.
 */

import type { ScriptAttachment } from "./ScriptContext"

export class ScriptDiscovery {
  /**
   * Return all .js/.ts files that are NOT already attached to a mesh,
   * sorted by entry-point priority.
   */
  findUnattachedScripts(
    projectFiles: Record<string, string>,
    attachments: ScriptAttachment[]
  ): string[] {
    const allScripts = Object.keys(projectFiles).filter(
      (path) => path.endsWith(".js") || path.endsWith(".ts")
    )

    const attachedPaths = new Set(attachments.map((a) => a.scriptPath))
    const unattached = allScripts.filter((path) => !attachedPaths.has(path))

    const getPriority = (path: string) => {
      const lower = path.toLowerCase()
      if (lower.includes("main.js") || lower.includes("main.ts")) return 0
      if (lower.includes("index.js") || lower.includes("index.ts")) return 1
      if (lower.includes("game.js") || lower.includes("game.ts")) return 2
      return 3
    }

    unattached.sort((a, b) => {
      const pA = getPriority(a)
      const pB = getPriority(b)
      if (pA !== pB) return pA - pB
      return a.localeCompare(b)
    })

    return unattached
  }
}
