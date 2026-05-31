/**
 * Game Script Runner Service
 * 
 * Executes user-authored JavaScript scripts that control the Babylon.js scene.
 * Uses `new Function()` for fast, direct access to the Babylon API.
 * 
 * Script Contract:
 * ```js
 * // A script file must return an object with lifecycle hooks
 * function setup(ctx) {
 *   // ctx.scene, ctx.engine, ctx.mesh, ctx.GUI, ctx.getFileUrl(path)
 *   return {
 *     start() { // called once when Play is pressed },
 *     update(deltaTime) { // called every frame },
 *     destroy() { // called when Stop is pressed },
 *   }
 * }
 * ```
 */

import type { Scene, AbstractMesh, Engine } from "@babylonjs/core"
import * as BabylonCore from "@babylonjs/core"
import * as BabylonGUI from "@babylonjs/gui"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ScriptLifecycle {
  start?: () => void
  update?: (deltaTime: number) => void
  destroy?: () => void
}

export interface ScriptAttachment {
  /** The mesh/node ID this script is attached to */
  meshId: string
  /** The file path inside the project VFS */
  scriptPath: string
}

interface RunningScript {
  attachment: ScriptAttachment
  lifecycle: ScriptLifecycle
}

export interface SceneSnapshot {
  meshStates: Map<string, {
    positionX: number
    positionY: number
    positionZ: number
    rotationX: number
    rotationY: number
    rotationZ: number
    scalingX: number
    scalingY: number
    scalingZ: number
    isVisible: boolean
  }>
}

export type EngineState = "editor" | "playing" | "paused"

// ─── Console capture ─────────────────────────────────────────────────────────

export type LogEntry = {
  level: "log" | "warn" | "error"
  message: string
  timestamp: number
}

// ─── Script Runner ───────────────────────────────────────────────────────────

export class GameScriptRunner {
  private scene: Scene | null = null
  private engine: Engine | null = null
  private state: EngineState = "editor"
  private runningScripts: RunningScript[] = []
  private attachments: ScriptAttachment[] = []
  private snapshot: SceneSnapshot | null = null
  private observerKey: any = null
  private logs: LogEntry[] = []
  private onLogsChanged?: (logs: LogEntry[]) => void
  private onStateChanged?: (state: EngineState) => void
  private projectFiles: Record<string, string> = {}

  constructor() {}

  // ── Initialization ──────────────────────────────────────────────────────

  /** Bind to a live Babylon scene & engine */
  bind(scene: Scene, engine: Engine) {
    this.scene = scene
    this.engine = engine
    this.pushLog("log", "Script runner bound to scene")
  }

  /** Unbind & cleanup */
  unbind() {
    this.stop()
    this.scene = null
    this.engine = null
  }

  // ── Attachment management ───────────────────────────────────────────────

  /** Attach a script file to a mesh */
  attachScript(meshId: string, scriptPath: string) {
    // Remove existing attachment for same mesh
    this.attachments = this.attachments.filter(a => a.meshId !== meshId)
    this.attachments.push({ meshId, scriptPath })
    this.pushLog("log", `Attached "${scriptPath}" to mesh "${meshId}"`)
  }

  /** Detach a script from a mesh */
  detachScript(meshId: string) {
    this.attachments = this.attachments.filter(a => a.meshId !== meshId)
    this.pushLog("log", `Detached script from mesh "${meshId}"`)
  }

  /** Get all current attachments */
  getAttachments(): ScriptAttachment[] {
    return [...this.attachments]
  }

  /** Get attachment for a specific mesh */
  getAttachmentForMesh(meshId: string): ScriptAttachment | undefined {
    return this.attachments.find(a => a.meshId === meshId)
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  /** Enter Play mode: snapshot scene → compile scripts → call start() */
  async play(projectFiles: Record<string, string>) {
    if (!this.scene || !this.engine) {
      this.pushLog("error", "Cannot play: no scene bound")
      return
    }
    if (this.state === "playing") return

    this.projectFiles = projectFiles

    // 1. Snapshot current scene state
    this.snapshot = this.takeSnapshot()
    this.pushLog("log", "Scene state saved")

    // 2. Compile and run all attached scripts
    this.runningScripts = []
    for (const attachment of this.attachments) {
      const scriptSource = projectFiles[attachment.scriptPath]
      if (!scriptSource) {
        this.pushLog("warn", `Script file not found: ${attachment.scriptPath}`)
        continue
      }

      const mesh = this.scene.getMeshById(attachment.meshId)
        || this.scene.getMeshByName(attachment.meshId)
      if (!mesh) {
        this.pushLog("warn", `Mesh not found: ${attachment.meshId}`)
        continue
      }

      try {
        const lifecycle = this.compileScript(scriptSource, mesh)
        this.runningScripts.push({ attachment, lifecycle })
        this.pushLog("log", `Compiled "${attachment.scriptPath}" for "${mesh.name}"`)
      } catch (err: any) {
        this.pushLog("error", `Compile error in "${attachment.scriptPath}": ${err.message}`)
      }
    }

    // 2.5 Auto-discover scene-level scripts (not attached to any mesh)
    const sceneScripts = this.autoDiscoverScripts()
    for (const scriptPath of sceneScripts) {
      const scriptSource = projectFiles[scriptPath]
      if (!scriptSource) continue

      try {
        const lifecycle = this.compileScript(scriptSource, null)
        // Use a dummy attachment for tracking
        this.runningScripts.push({ attachment: { meshId: "scene-level", scriptPath }, lifecycle })
        this.pushLog("log", `Compiled scene-level script "${scriptPath}"`)
      } catch (err: any) {
        this.pushLog("error", `Compile error in "${scriptPath}": ${err.message}`)
      }
    }

    // 3. Call start() on all scripts
    for (const rs of this.runningScripts) {
      try {
        rs.lifecycle.start?.()
      } catch (err: any) {
        this.pushLog("error", `start() error in "${rs.attachment.scriptPath}": ${err.message}`)
      }
    }

    // 4. Register the update loop
    this.observerKey = this.scene.onBeforeRenderObservable.add(() => {
      if (this.state !== "playing") return
      const dt = this.engine!.getDeltaTime() / 1000 // seconds
      for (const rs of this.runningScripts) {
        try {
          rs.lifecycle.update?.(dt)
        } catch (err: any) {
          this.pushLog("error", `update() error in "${rs.attachment.scriptPath}": ${err.message}`)
        }
      }
    })

    this.state = "playing"
    this.onStateChanged?.(this.state)
    this.pushLog("log", `▶ Playing (${this.runningScripts.length} scripts)`)
  }

  /** Pause the update loop (scripts stop ticking but scene stays) */
  pause() {
    if (this.state !== "playing") return
    this.state = "paused"
    this.onStateChanged?.(this.state)
    this.pushLog("log", "⏸ Paused")
  }

  /** Resume from pause */
  resume() {
    if (this.state !== "paused") return
    this.state = "playing"
    this.onStateChanged?.(this.state)
    this.pushLog("log", "▶ Resumed")
  }

  /** Stop: destroy scripts → restore scene snapshot */
  stop() {
    if (this.state === "editor") return

    // 1. Call destroy() on all scripts
    for (const rs of this.runningScripts) {
      try {
        rs.lifecycle.destroy?.()
      } catch (err: any) {
        this.pushLog("error", `destroy() error in "${rs.attachment.scriptPath}": ${err.message}`)
      }
    }
    this.runningScripts = []

    // 2. Remove the render observer
    if (this.observerKey && this.scene) {
      this.scene.onBeforeRenderObservable.remove(this.observerKey)
      this.observerKey = null
    }

    // 3. Restore scene state from snapshot
    if (this.snapshot && this.scene) {
      this.restoreSnapshot(this.snapshot)
      this.pushLog("log", "Scene state restored")
    }
    this.snapshot = null

    this.state = "editor"
    this.onStateChanged?.(this.state)
    this.pushLog("log", "⏹ Stopped")
  }

  // ── Script compilation ──────────────────────────────────────────────────

  /** Find all .js and .ts files that are not already attached, sorted by priority */
  private autoDiscoverScripts(): string[] {
    const allScripts = Object.keys(this.projectFiles).filter(path => 
      path.endsWith(".js") || path.endsWith(".ts")
    )
    
    const attachedPaths = new Set(this.attachments.map(a => a.scriptPath))
    const unattached = allScripts.filter(path => !attachedPaths.has(path))
    
    // Sort by priority: main > index > game > alphabetical
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

  /**
   * Compiles a user script string into lifecycle hooks.
   * The script receives: scene, mesh, engine, Vector3, console
   */
  private compileScript(source: string, mesh: AbstractMesh | null): ScriptLifecycle {
    // Build a sandboxed console that captures output
    const scriptConsole = {
      log: (...args: any[]) => this.pushLog("log", args.map(String).join(" ")),
      warn: (...args: any[]) => this.pushLog("warn", args.map(String).join(" ")),
      error: (...args: any[]) => this.pushLog("error", args.map(String).join(" ")),
    }

    // Wrap GUI to intercept invalid property values like linear gradients
    const robustGUI = new Proxy(BabylonGUI, {
      get(target, prop, receiver) {
        const val = Reflect.get(target, prop, receiver)
        if (typeof val === "function" && val.prototype instanceof BabylonGUI.Control) {
          return class WrappedControl extends (val as any) {
            set background(bgVal: string) {
              if (bgVal && typeof bgVal === "string" && bgVal.includes("linear-gradient")) {
                const content = bgVal.replace(/^linear-gradient\([^,]+,\s*/i, "")
                const match = content.match(/(#[a-fA-F0-9]{3,8}|rgba?\(.*?\)|[a-zA-Z]+)/) ||
                              bgVal.match(/(#[a-fA-F0-9]{3,8}|rgba?\(.*?\)|[a-zA-Z]+)/)
                super.background = match ? match[0] : "#FFD700"
              } else {
                super.background = bgVal
              }
            }
            get background(): string {
              return super.background
            }
          }
        }
        return val
      }
    })

    // Context object passed to the script
    const ctx = {
      scene: this.scene,
      mesh: mesh,
      engine: this.engine,
      console: scriptConsole,
      BabylonCore,
      GUI: robustGUI,
      getFileUrl: (path: string) => {
        const normalized = path.replace(/\\/g, "/").trim()
        const cleanPath = normalized.replace(/^res:\/\//, "").replace(/^\/+/, "")
        
        const candidates = [
          normalized,
          cleanPath,
          "/" + cleanPath,
          "public/" + cleanPath,
          "/public/" + cleanPath,
          "res://" + cleanPath
        ]
        
        for (const candidate of candidates) {
          if (this.projectFiles[candidate]) {
            return this.projectFiles[candidate]
          }
        }
        
        this.pushLog("warn", `File not found in VFS: ${path}`)
        return path
      }
    }

    // Preprocess the user script source to strip out ES Module syntax (imports/exports)
    // which throws SyntaxErrors when run inside new Function()
    let processedSource = source

    // 1. Remove ES module imports
    processedSource = processedSource.replace(/import\s+[\s\S]*?from\s+['"].*?['"]\s*;?/g, "")
    processedSource = processedSource.replace(/import\s+['"].*?['"]\s*;?/g, "")

    // 2. Convert export default to local constant assignment
    processedSource = processedSource.replace(/export\s+default\s+/g, "const __default_export__ = ")

    // 3. Remove "export" modifier from functions, variables, classes
    processedSource = processedSource.replace(/export\s+(function|const|let|var|class)\s+/g, "$1 ")

    // 4. Remove named export statements (e.g. export { setup };)
    processedSource = processedSource.replace(/export\s+\{[\s\S]*?\}\s*;?/g, "")

    // Wrap the user code so it returns lifecycle hooks
    const wrappedSource = `
      "use strict";
      const { scene, mesh, engine, console, BabylonCore, GUI, getFileUrl } = ctx;
      const { Vector3, Color3, Color4, Quaternion, Matrix, MeshBuilder, StandardMaterial, Texture } = BabylonCore;
      
      ${processedSource}

      // Handle __default_export__ if defined
      if (typeof __default_export__ !== "undefined") {
        if (typeof __default_export__ === "function") {
          return __default_export__(ctx);
        }
        return __default_export__;
      }

      // The script must define a setup() function or we try to find lifecycle methods at top level
      if (typeof setup === "function") {
        return setup(ctx);
      }

      // Fallback: if the script defines start/update/destroy at top level
      return {
        start: typeof start === "function" ? start : undefined,
        update: typeof update === "function" ? update : undefined,
        destroy: typeof destroy === "function" ? destroy : undefined,
      };
    `

    const factory = new Function("ctx", wrappedSource)
    const result = factory(ctx)

    if (!result || typeof result !== "object") {
      throw new Error("Script must return an object with start/update/destroy methods, or define a setup() function")
    }

    return result as ScriptLifecycle
  }

  // ── Scene snapshot / restore ────────────────────────────────────────────

  private takeSnapshot(): SceneSnapshot {
    const meshStates = new Map<string, SceneSnapshot["meshStates"] extends Map<string, infer V> ? V : never>()  // eslint-disable-line

    if (this.scene) {
      for (const mesh of this.scene.meshes) {
        meshStates.set(mesh.id, {
          positionX: mesh.position.x,
          positionY: mesh.position.y,
          positionZ: mesh.position.z,
          rotationX: mesh.rotation.x,
          rotationY: mesh.rotation.y,
          rotationZ: mesh.rotation.z,
          scalingX: mesh.scaling.x,
          scalingY: mesh.scaling.y,
          scalingZ: mesh.scaling.z,
          isVisible: mesh.isVisible,
        })
      }
    }

    return { meshStates }
  }

  private restoreSnapshot(snapshot: SceneSnapshot) {
    if (!this.scene) return

    for (const mesh of this.scene.meshes) {
      const saved = snapshot.meshStates.get(mesh.id)
      if (saved) {
        mesh.position.set(saved.positionX, saved.positionY, saved.positionZ)
        mesh.rotation.set(saved.rotationX, saved.rotationY, saved.rotationZ)
        mesh.scaling.set(saved.scalingX, saved.scalingY, saved.scalingZ)
        mesh.isVisible = saved.isVisible
      }
    }
  }

  // ── Log management ──────────────────────────────────────────────────────

  private pushLog(level: LogEntry["level"], message: string) {
    const entry: LogEntry = { level, message, timestamp: Date.now() }
    this.logs.push(entry)
    // Keep last 500 entries
    if (this.logs.length > 500) this.logs = this.logs.slice(-500)
    this.onLogsChanged?.(this.getLogs())
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
    this.onLogsChanged?.(this.getLogs())
  }

  getState(): EngineState {
    return this.state
  }

  // ── Callbacks ───────────────────────────────────────────────────────────

  onLogs(cb: (logs: LogEntry[]) => void) {
    this.onLogsChanged = cb
  }

  onState(cb: (state: EngineState) => void) {
    this.onStateChanged = cb
  }
}

// Singleton instance
export const gameScriptRunner = new GameScriptRunner()
