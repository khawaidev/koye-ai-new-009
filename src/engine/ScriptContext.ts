/**
 * Script Context
 *
 * Defines the types and data structures used across the engine modules.
 */

export interface ScriptLifecycle {
  start?: () => void
  update?: (deltaTime: number) => void
  /** Fixed-timestep update (physics-friendly) */
  fixedUpdate?: (deltaTime: number) => void
  /** Runs after all update() calls */
  lateUpdate?: (deltaTime: number) => void
  /** Called when the viewport resizes */
  onResize?: () => void
  /** Called when the game is paused */
  onPause?: () => void
  /** Called when the game is resumed */
  onResume?: () => void
  destroy?: () => void
}

export interface ScriptAttachment {
  /** The mesh/node ID this script is attached to */
  meshId: string
  /** The file path inside the project VFS */
  scriptPath: string
}

export interface RunningScript {
  attachment: ScriptAttachment
  lifecycle: ScriptLifecycle
}

export type EngineState = "editor" | "playing" | "paused"

/**
 * The context object injected into every user script via `setup(ctx)`.
 */
export interface RuntimeContext {
  BABYLON: any
  GUI: any
  scene: any
  engine: any
  mesh: any
  camera: any
  canvas: HTMLCanvasElement | null
  console: {
    log: (...args: any[]) => void
    warn: (...args: any[]) => void
    error: (...args: any[]) => void
  }
  getFileUrl: (path: string) => string
  // ── AI helper API ──
  /** Create a mesh by type (box, sphere, ground, cylinder, plane, capsule) */
  create: (type: string, name: string, options?: Record<string, any>) => any
  /** Find a mesh/node in the scene by name */
  find: (name: string) => any
  /** Dispose a mesh and its material */
  destroy: (meshOrName: any) => void
  /** Load a texture from a project file */
  loadTexture: (path: string) => any
  /** Load a GLB/GLTF model from a project file */
  loadModel: (path: string) => Promise<any>
}
