/**
 * Game Script Runner Service
 * 
 * Executes user-authored JavaScript scripts that control the Babylon.js scene.
 * Delegates to split sub-modules (ScriptCompiler, ScriptLogger, SnapshotManager, ScriptDiscovery).
 */

import type { Scene, Engine } from "@babylonjs/core"
import { ScriptLogger, type LogEntry } from "../engine/ScriptLogger"
import { SnapshotManager, type SceneSnapshot } from "../engine/SnapshotManager"
import { ScriptDiscovery } from "../engine/ScriptDiscovery"
import { ScriptCompiler } from "../engine/ScriptCompiler"
import type { ScriptLifecycle, ScriptAttachment, RunningScript, EngineState } from "../engine/ScriptContext"

export class GameScriptRunner {
  private scene: Scene | null = null
  private engine: Engine | null = null
  private camera: any = null
  private canvas: HTMLCanvasElement | null = null
  
  private state: EngineState = "editor"
  private runningScripts: RunningScript[] = []
  private attachments: ScriptAttachment[] = []
  private snapshot: SceneSnapshot | null = null
  
  private renderObserver: any = null
  private resizeObserver: () => void = () => {}
  
  private logger = new ScriptLogger()
  private snapshotManager = new SnapshotManager()
  private discovery = new ScriptDiscovery()
  private compiler = new ScriptCompiler()
  
  private projectFiles: Record<string, string> = {}
  private onLogsChanged?: (logs: LogEntry[]) => void
  private onStateChanged?: (state: EngineState) => void

  constructor() {
    // Pipe internal logger events to external listeners
    this.logger.onChange((logs) => {
      this.onLogsChanged?.(logs)
    })
  }

  // ── Initialization ──────────────────────────────────────────────────────

  /** Bind to a live Babylon scene, engine, camera, and canvas */
  bind(scene: Scene, engine: Engine, camera?: any, canvas?: HTMLCanvasElement) {
    this.scene = scene
    this.engine = engine
    this.camera = camera ?? null
    this.canvas = canvas ?? null

    // Register viewport resize listener for scripts (Priority 5)
    this.resizeObserver = () => {
      if (this.state !== "playing") return
      for (const rs of this.runningScripts) {
        try {
          rs.lifecycle.onResize?.()
        } catch (err: any) {
          this.logger.push("error", `onResize() error in "${rs.attachment.scriptPath}": ${err.message}`)
        }
      }
    }
    window.addEventListener("resize", this.resizeObserver)

    this.logger.push("log", "Script runner bound to scene")
  }

  /** Unbind & cleanup */
  unbind() {
    this.stop()
    window.removeEventListener("resize", this.resizeObserver)
    this.scene = null
    this.engine = null
    this.camera = null
    this.canvas = null
  }

  // ── Attachment management ───────────────────────────────────────────────

  attachScript(meshId: string, scriptPath: string) {
    this.attachments = this.attachments.filter(a => a.meshId !== meshId)
    this.attachments.push({ meshId, scriptPath })
    this.logger.push("log", `Attached "${scriptPath}" to mesh "${meshId}"`)
  }

  detachScript(meshId: string) {
    this.attachments = this.attachments.filter(a => a.meshId !== meshId)
    this.logger.push("log", `Detached script from mesh "${meshId}"`)
  }

  getAttachments(): ScriptAttachment[] {
    return [...this.attachments]
  }

  getAttachmentForMesh(meshId: string): ScriptAttachment | undefined {
    return this.attachments.find(a => a.meshId === meshId)
  }

  // ── Lifecycle (Priority 5: Extended API) ───────────────────────────────────

  async play(projectFiles: Record<string, string>) {
    if (!this.scene || !this.engine) {
      this.logger.push("error", "Cannot play: no scene bound")
      return
    }
    if (this.state === "playing") return

    this.projectFiles = projectFiles

    // 1. Snapshot current scene state
    this.snapshot = this.snapshotManager.take(this.scene)
    this.logger.push("log", "Scene state saved")

    // 2. Compile and run all attached scripts
    this.runningScripts = []
    for (const attachment of this.attachments) {
      const scriptSource = projectFiles[attachment.scriptPath]
      if (!scriptSource) {
        this.logger.push("warn", `Script file not found: ${attachment.scriptPath}`)
        continue
      }

      const mesh = this.scene.getMeshById(attachment.meshId) || this.scene.getMeshByName(attachment.meshId)
      if (!mesh) {
        this.logger.push("warn", `Mesh not found: ${attachment.meshId}`)
        continue
      }

      try {
        const lifecycle = this.compiler.compile(
          scriptSource,
          mesh,
          this.scene,
          this.engine,
          this.camera,
          this.canvas,
          projectFiles,
          this.logger,
          attachment.scriptPath
        )
        this.runningScripts.push({ attachment, lifecycle })
        this.logger.push("log", `Compiled "${attachment.scriptPath}" for "${mesh.name}"`)
      } catch (err: any) {
        this.logger.push("error", `Compile error in "${attachment.scriptPath}": ${err.message}`)
      }
    }

    // 2.5 Auto-discover scene-level scripts (e.g., main.js)
    const sceneScripts = this.discovery.findUnattachedScripts(projectFiles, this.attachments)
    for (const scriptPath of sceneScripts) {
      const scriptSource = projectFiles[scriptPath]
      if (!scriptSource) continue

      try {
        const lifecycle = this.compiler.compile(
          scriptSource,
          null,
          this.scene,
          this.engine,
          this.camera,
          this.canvas,
          projectFiles,
          this.logger,
          scriptPath
        )
        this.runningScripts.push({ attachment: { meshId: "scene-level", scriptPath }, lifecycle })
        this.logger.push("log", `Compiled scene-level script "${scriptPath}"`)
      } catch (err: any) {
        this.logger.push("error", `Compile error in "${scriptPath}": ${err.message}`)
      }
    }

    // 3. Call start() on all scripts
    for (const rs of this.runningScripts) {
      try {
        rs.lifecycle.start?.()
      } catch (err: any) {
        this.logger.push("error", `start() error in "${rs.attachment.scriptPath}": ${err.message}`)
      }
    }

    // 4. Register the update loops (regular, fixed, late) (Priority 5)
    let accumulator = 0
    const fixedTimeStep = 1 / 50 // 50Hz (0.02s)

    this.renderObserver = this.scene.onBeforeRenderObservable.add(() => {
      if (this.state !== "playing") return
      const dt = this.engine!.getDeltaTime() / 1000 // seconds

      // Regular update loop
      for (const rs of this.runningScripts) {
        try {
          rs.lifecycle.update?.(dt)
        } catch (err: any) {
          this.logger.push("error", `update() error in "${rs.attachment.scriptPath}": ${err.message}`)
        }
      }

      // Fixed update loop (for physics-like updates at constant interval)
      accumulator += dt
      while (accumulator >= fixedTimeStep) {
        for (const rs of this.runningScripts) {
          try {
            rs.lifecycle.fixedUpdate?.(fixedTimeStep)
          } catch (err: any) {
            this.logger.push("error", `fixedUpdate() error in "${rs.attachment.scriptPath}": ${err.message}`)
          }
        }
        accumulator -= fixedTimeStep
      }

      // Late update loop (runs after all movements)
      for (const rs of this.runningScripts) {
        try {
          rs.lifecycle.lateUpdate?.(dt)
        } catch (err: any) {
          this.logger.push("error", `lateUpdate() error in "${rs.attachment.scriptPath}": ${err.message}`)
        }
      }
    })

    this.state = "playing"
    this.onStateChanged?.(this.state)
    this.logger.push("log", `▶ Playing (${this.runningScripts.length} scripts)`)
  }

  /** Pause the update loops and notify scripts */
  pause() {
    if (this.state !== "playing") return
    this.state = "paused"

    for (const rs of this.runningScripts) {
      try {
        rs.lifecycle.onPause?.()
      } catch (err: any) {
        this.logger.push("error", `onPause() error in "${rs.attachment.scriptPath}": ${err.message}`)
      }
    }

    this.onStateChanged?.(this.state)
    this.logger.push("log", "⏸ Paused")
  }

  /** Resume loops and notify scripts */
  resume() {
    if (this.state !== "paused") return
    this.state = "playing"

    for (const rs of this.runningScripts) {
      try {
        rs.lifecycle.onResume?.()
      } catch (err: any) {
        this.logger.push("error", `onResume() error in "${rs.attachment.scriptPath}": ${err.message}`)
      }
    }

    this.onStateChanged?.(this.state)
    this.logger.push("log", "▶ Resumed")
  }

  /** Stop: destroy scripts → restore scene snapshot */
  stop() {
    if (this.state === "editor") return

    // 1. Call destroy() on all scripts
    for (const rs of this.runningScripts) {
      try {
        rs.lifecycle.destroy?.()
      } catch (err: any) {
        this.logger.push("error", `destroy() error in "${rs.attachment.scriptPath}": ${err.message}`)
      }
    }
    this.runningScripts = []

    // 2. Remove the render observer
    if (this.renderObserver && this.scene) {
      this.scene.onBeforeRenderObservable.remove(this.renderObserver)
      this.renderObserver = null
    }

    // 3. Restore scene state from snapshot
    if (this.snapshot && this.scene) {
      this.snapshotManager.restore(this.scene, this.snapshot)
      this.logger.push("log", "Scene state restored")
    }
    this.snapshot = null

    this.state = "editor"
    this.onStateChanged?.(this.state)
    this.logger.push("log", "⏹ Stopped")
  }

  // ── Log and state management ────────────────────────────────────────────

  getLogs(): LogEntry[] {
    return this.logger.getAll()
  }

  clearLogs() {
    this.logger.clear()
  }

  getState(): EngineState {
    return this.state
  }

  onLogs(cb: (logs: LogEntry[]) => void) {
    this.onLogsChanged = cb
  }

  onState(cb: (state: EngineState) => void) {
    this.onStateChanged = cb
  }
}

// Singleton instance
export const gameScriptRunner = new GameScriptRunner()
export type { LogEntry }
