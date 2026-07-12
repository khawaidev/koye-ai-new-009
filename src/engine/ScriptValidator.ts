/**
 * Script Validator (Priority 6)
 *
 * Validates user script source code before execution.
 * Rejects forbidden patterns that conflict with the Koye Engine runtime.
 */

import type { ScriptLogger } from "./ScriptLogger"

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/** Patterns that must NEVER appear in user scripts */
const FORBIDDEN_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /new\s+BABYLON\s*\.\s*Engine\s*\(/,
    message: "Do not create a new Engine — the runtime already owns the engine.",
  },
  {
    pattern: /new\s+BABYLON\s*\.\s*Scene\s*\(/,
    message: "Do not create a new Scene — use the existing `scene` from ctx.",
  },
  {
    pattern: /engine\s*\.\s*runRenderLoop\s*\(/,
    message: "Do not create a render loop — the runtime already manages rendering.",
  },
  {
    pattern: /scene\s*\.\s*enablePhysics\s*\(/,
    message: "Do not initialize physics — the runtime handles physics setup.",
  },
  {
    pattern: /window\s*\.\s*addEventListener\s*\(/,
    message: "Do not use window.addEventListener — use the ctx input API or scene observables instead.",
  },
  {
    pattern: /requestAnimationFrame\s*\(/,
    message: "Do not use requestAnimationFrame — use update(deltaTime) instead.",
  },
  {
    pattern: /setInterval\s*\(/,
    message: "Do not use setInterval — use update(deltaTime) for frame-based logic.",
  },
  {
    pattern: /setTimeout\s*\(/,
    message: "Do not use setTimeout — use update(deltaTime) with a timer variable instead.",
  },
  {
    pattern: /document\s*\.\s*createElement\s*\(/,
    message: "Do not manipulate the DOM — use BABYLON GUI for UI elements.",
  },
  {
    pattern: /document\s*\.\s*getElementById\s*\(/,
    message: "Do not access DOM elements — use the scene and GUI APIs.",
  },
]

export class ScriptValidator {
  /**
   * Check a script source for forbidden patterns.
   * Returns { valid: true } if clean, or { valid: false, errors: [...] } if violations found.
   */
  validate(source: string): ValidationResult {
    const errors: string[] = []

    for (const { pattern, message } of FORBIDDEN_PATTERNS) {
      if (pattern.test(source)) {
        errors.push(message)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate and log warnings. Returns true if the script is safe to run.
   * We log warnings but still allow execution (soft validation) so the user
   * can iterate. Hard-block can be enabled later.
   */
  validateAndWarn(source: string, scriptPath: string, logger: ScriptLogger): boolean {
    const result = this.validate(source)

    if (!result.valid) {
      for (const err of result.errors) {
        logger.push("warn", `[Validator] ${scriptPath}: ${err}`)
      }
    }

    return result.valid
  }
}
