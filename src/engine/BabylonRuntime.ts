import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core"

export interface RuntimeConfig {
  canvas: HTMLCanvasElement
  clearColor?: { r: number; g: number; b: number; a: number }
  lightIntensity?: number
  createGround?: boolean
  createDefaultLights?: boolean
  createDefaultCamera?: boolean
}

export class BabylonRuntime {
  public engine: Engine | null = null
  public scene: Scene | null = null
  public camera: ArcRotateCamera | null = null
  public light: HemisphericLight | null = null

  private resizeHandler: (() => void) | null = null

  initialize(config: RuntimeConfig) {
    if (this.engine) {
      this.dispose()
    }

    this.engine = new Engine(config.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    })

    this.scene = new Scene(this.engine)
    if (config.clearColor) {
      const c = config.clearColor
      this.scene.clearColor.set(c.r, c.g, c.b, c.a)
    } else {
      this.scene.clearColor.set(0.1, 0.1, 0.1, 1)
    }

    if (config.createDefaultCamera !== false) {
      this.camera = new ArcRotateCamera(
        "camera",
        -Math.PI / 2,
        Math.PI / 2.5,
        10,
        Vector3.Zero(),
        this.scene
      )
      this.camera.attachControl(config.canvas, true)
      this.camera.lowerRadiusLimit = 0.5
      this.camera.upperRadiusLimit = 200
    }

    if (config.createDefaultLights !== false) {
      this.light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene)
      this.light.intensity = config.lightIntensity ?? 0.65
      this.light.diffuse.set(1.0, 0.72, 0.55)
      this.light.groundColor.set(0.22, 0.18, 0.24)
      this.light.specular.set(0.08, 0.08, 0.08)
    }

    if (config.createGround) {
      const ground = MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, this.scene)
      const groundMaterial = new StandardMaterial("groundMat", this.scene)
      groundMaterial.diffuseColor.set(0.7, 0.7, 0.7)
      groundMaterial.specularColor.set(0, 0, 0)
      ground.material = groundMaterial
    }

    this.engine.runRenderLoop(() => {
      this.scene?.render()
    })

    this.resizeHandler = () => {
      this.engine?.resize()
    }
    window.addEventListener("resize", this.resizeHandler)
  }

  dispose() {
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler)
      this.resizeHandler = null
    }
    if (this.engine) {
      this.engine.dispose()
      this.engine = null
    }
    this.scene = null
    this.camera = null
    this.light = null
  }
}
export const babylonRuntime = new BabylonRuntime()
