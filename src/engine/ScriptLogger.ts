/**
 * Script Logger
 * 
 * Captures and manages runtime log output from user scripts.
 */

export type LogEntry = {
  level: "log" | "warn" | "error"
  message: string
  timestamp: number
}

export class ScriptLogger {
  private logs: LogEntry[] = []
  private onLogsChanged?: (logs: LogEntry[]) => void
  private maxEntries = 500

  push(level: LogEntry["level"], message: string) {
    const entry: LogEntry = { level, message, timestamp: Date.now() }
    this.logs.push(entry)
    if (this.logs.length > this.maxEntries) {
      this.logs = this.logs.slice(-this.maxEntries)
    }
    this.onLogsChanged?.(this.getAll())
  }

  getAll(): LogEntry[] {
    return [...this.logs]
  }

  clear() {
    this.logs = []
    this.onLogsChanged?.(this.getAll())
  }

  onChange(cb: (logs: LogEntry[]) => void) {
    this.onLogsChanged = cb
  }

  /** Build a sandboxed console object for script injection */
  createScriptConsole() {
    return {
      log: (...args: any[]) => this.push("log", args.map(String).join(" ")),
      warn: (...args: any[]) => this.push("warn", args.map(String).join(" ")),
      error: (...args: any[]) => this.push("error", args.map(String).join(" ")),
    }
  }
}
