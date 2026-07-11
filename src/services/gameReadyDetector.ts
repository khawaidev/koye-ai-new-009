/**
 * Game Ready Detector
 *
 * Determines if a set of project files is sufficient to run a game or prototype.
 * Used by the chat interface to trigger auto-run after agent file approval.
 */

export type GameRunState = 'idle' | 'running' | 'fixing' | 'ready' | 'failed'

/**
 * Game entrypoint patterns. If any of these exist in the file map,
 * the project is considered "runnable".
 */
const ENTRYPOINT_PATTERNS = [
  /^index\.html$/i,
  /^main\.(js|ts)$/i,
  /^game\.(js|ts)$/i,
  /^app\.(js|ts)$/i,
  /^src\/main\.(js|ts)$/i,
  /^src\/index\.(js|ts)$/i,
  /^src\/game\.(js|ts)$/i,
]

/**
 * Returns true if the given files constitute a runnable game/prototype.
 * Requires at least one entrypoint file and at least one code file.
 */
export function isProjectRunnable(files: Record<string, string>): boolean {
  const paths = Object.keys(files)
  if (paths.length === 0) return false

  // Must have at least one entrypoint
  const hasEntrypoint = paths.some(p =>
    ENTRYPOINT_PATTERNS.some(pattern => pattern.test(p))
  )
  if (!hasEntrypoint) return false

  // Must have at least one code file with real content
  const codeExtensions = /\.(js|ts|jsx|tsx|html|css)$/i
  const hasCode = paths.some(p =>
    codeExtensions.test(p) && (files[p]?.length ?? 0) > 20
  )

  return hasCode
}

/**
 * Returns the primary entrypoint filename (index.html or main.js etc.)
 */
export function getProjectEntrypoint(files: Record<string, string>): string | null {
  const paths = Object.keys(files)
  for (const pattern of ENTRYPOINT_PATTERNS) {
    const match = paths.find(p => pattern.test(p))
    if (match) return match
  }
  return null
}

/**
 * Builds a prompt for the AI to auto-fix runtime errors.
 */
export function buildAutoFixPrompt(
  errors: Array<{ message: string; source: string; stack?: string }>,
  files: Record<string, string>
): string {
  const errorText = errors
    .slice(0, 5)
    .map(e => `[${e.source}] ${e.message}${e.stack ? '\n' + e.stack : ''}`)
    .join('\n\n')

  const fileList = Object.keys(files)
    .filter(p => /\.(js|ts|jsx|tsx|html|css)$/i.test(p))
    .join(', ')

  return `The game/prototype has runtime errors after being run in the browser. Please fix them automatically.

RUNTIME ERRORS:
${errorText}

PROJECT FILES: ${fileList}

INSTRUCTIONS:
1. Read the relevant files using get_file_contents if needed
2. Fix all the errors using replace_code or edit_file tool calls
3. Be concise - just fix the errors, don't explain
4. Do NOT ask for confirmation - apply the fixes directly`
}
