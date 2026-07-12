/**
 * Script Compiler
 *
 * Compiles user-authored script source code into lifecycle hooks
 * that the engine can call each frame.
 */

import type { AbstractMesh, Scene, Engine } from "@babylonjs/core"
import * as BabylonCore from "@babylonjs/core"
import * as BabylonGUI from "@babylonjs/gui"

import type { ScriptLifecycle, RuntimeContext } from "./ScriptContext"
import type { ScriptLogger } from "./ScriptLogger"
import { ScriptValidator } from "./ScriptValidator"

export class ScriptCompiler {
  private validator = new ScriptValidator()

  /**
   * Compile a user script string into lifecycle hooks.
   */
  compile(
    source: string,
    mesh: AbstractMesh | null,
    scene: Scene,
    engine: Engine,
    camera: any,
    canvas: HTMLCanvasElement | null,
    projectFiles: Record<string, string>,
    logger: ScriptLogger,
    scriptPath: string
  ): ScriptLifecycle {
    // ── Validate (soft — warn but don't block) ──
    this.validator.validateAndWarn(source, scriptPath, logger)

    // ── Build sandboxed console ──
    const scriptConsole = logger.createScriptConsole()

    // ── Wrap GUI to intercept invalid CSS values ──
    const robustGUI = new Proxy(BabylonGUI, {
      get(target, prop, receiver) {
        const val = Reflect.get(target, prop, receiver)
        if (typeof val === "function" && val.prototype instanceof BabylonGUI.Control) {
          return class WrappedControl extends (val as any) {
            set background(bgVal: string) {
              if (bgVal && typeof bgVal === "string" && bgVal.includes("linear-gradient")) {
                const content = bgVal.replace(/^linear-gradient\([^,]+,\s*/i, "")
                const match =
                  content.match(/(#[a-fA-F0-9]{3,8}|rgba?\(.*?\)|[a-zA-Z]+)/) ||
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
      },
    })

    // ── getFileUrl resolver ──
    const getFileUrl = (path: string): string => {
      const normalized = path.replace(/\\/g, "/").trim()
      const cleanPath = normalized.replace(/^res:\/\//, "").replace(/^\/+/, "")
      const candidates = [
        normalized,
        cleanPath,
        "/" + cleanPath,
        "public/" + cleanPath,
        "/public/" + cleanPath,
        "res://" + cleanPath,
      ]
      for (const candidate of candidates) {
        if (projectFiles[candidate]) {
          return projectFiles[candidate]
        }
      }
      logger.push("warn", `File not found in VFS: ${path}`)
      return path
    }

    // ── AI Helper API (Priority 7) ──
    const createHelper = (type: string, name: string, options: Record<string, any> = {}): any => {
      const builders: Record<string, () => any> = {
        box: () => BabylonCore.MeshBuilder.CreateBox(name, options, scene),
        sphere: () => BabylonCore.MeshBuilder.CreateSphere(name, options, scene),
        ground: () => BabylonCore.MeshBuilder.CreateGround(name, options, scene),
        cylinder: () => BabylonCore.MeshBuilder.CreateCylinder(name, options, scene),
        plane: () => BabylonCore.MeshBuilder.CreatePlane(name, options, scene),
        capsule: () => BabylonCore.MeshBuilder.CreateCapsule(name, options, scene),
        torus: () => BabylonCore.MeshBuilder.CreateTorus(name, options, scene),
        disc: () => BabylonCore.MeshBuilder.CreateDisc(name, options, scene),
      }
      const builder = builders[type.toLowerCase()]
      if (!builder) {
        logger.push("warn", `Unknown mesh type "${type}". Supported: ${Object.keys(builders).join(", ")}`)
        return null
      }
      return builder()
    }

    const findHelper = (name: string): any => {
      return scene.getMeshByName(name) || scene.getMeshById(name) || scene.getNodeByName(name) || null
    }

    const destroyHelper = (meshOrName: any): void => {
      const target = typeof meshOrName === "string" ? findHelper(meshOrName) : meshOrName
      if (target && typeof target.dispose === "function") {
        if (target.material) target.material.dispose()
        target.dispose()
      }
    }

    const loadTextureHelper = (path: string): any => {
      return new BabylonCore.Texture(getFileUrl(path), scene)
    }

    const loadModelHelper = async (path: string): Promise<any> => {
      const url = getFileUrl(path)
      return BabylonCore.SceneLoader.ImportMeshAsync("", "", url, scene)
    }

    // ── Build context ──
    const ctx: RuntimeContext = {
      BABYLON: BabylonCore,
      GUI: robustGUI,
      scene,
      engine,
      mesh,
      camera,
      canvas,
      console: scriptConsole,
      getFileUrl,
      create: createHelper,
      find: findHelper,
      destroy: destroyHelper,
      loadTexture: loadTextureHelper,
      loadModel: loadModelHelper,
    }

    // ── Preprocess source ──
    let processedSource = source
    processedSource = processedSource.replace(/import\s+[\s\S]*?from\s+['"].*?['"]\s*;?/g, "")
    processedSource = processedSource.replace(/import\s+['"].*?['"]\s*;?/g, "")
    processedSource = processedSource.replace(/export\s+default\s+/g, "const __default_export__ = ")
    processedSource = processedSource.replace(/export\s+(function|const|let|var|class)\s+/g, "$1 ")
    processedSource = processedSource.replace(/export\s+\{[\s\S]*?\}\s*;?/g, "")

    // ── Wrap and execute ──
    const wrappedSource = `
      "use strict";
      const { BABYLON, GUI, scene, engine, mesh, camera, canvas, console, getFileUrl, create, find, destroy, loadTexture, loadModel } = ctx;

      ${processedSource}

      if (typeof __default_export__ !== "undefined") {
        if (typeof __default_export__ === "function") {
          return __default_export__(ctx);
        }
        return __default_export__;
      }

      if (typeof setup === "function") {
        return setup(ctx);
      }

      return {
        start: typeof start === "function" ? start : undefined,
        update: typeof update === "function" ? update : undefined,
        destroy: typeof destroy === "function" ? destroy : undefined,
      };
    `

    const factory = new Function("ctx", wrappedSource)
    const result = factory(ctx)

    if (!result || typeof result !== "object") {
      throw new Error(
        "Script must return an object with start/update/destroy methods, or define a setup() function"
      )
    }

    return result as ScriptLifecycle
  }
}
