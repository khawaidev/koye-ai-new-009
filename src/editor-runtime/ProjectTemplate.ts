export const getProjectTemplate = (projectName: string = "New Babylon Project") => {
  return {
    "package.json": JSON.stringify({
      name: projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      version: "1.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        preview: "vite preview"
      },
      dependencies: {
        "@babylonjs/core": "^6.36.0",
        "@babylonjs/loaders": "^6.36.0"
      },
      devDependencies: {
        "vite": "^5.0.0",
        "typescript": "^5.0.0"
      }
    }, null, 2),

    "vite.config.ts": `import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    host: true
  }
});
`,

    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        useDefineForClassFields: true,
        module: "ESNext",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true
      },
      include: ["src"]
    }, null, 2),

    "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
    <style>
      body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
      #renderCanvas { width: 100%; height: 100%; touch-action: none; outline: none; }
    </style>
  </head>
  <body>
    <canvas id="renderCanvas"></canvas>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`,

    "src/main.ts": `import { Engine, Scene, FreeCamera, Vector3, HemisphericLight, MeshBuilder } from "@babylonjs/core";
import "@babylonjs/loaders"; // For GLTF/GLB support

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

const createScene = async function () {
    const scene = new Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.12, 0.12, 0.14, 1);

    const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
    box.position.y = 1;

    const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

    return scene;
};

createScene().then(scene => {
    engine.runRenderLoop(() => {
        scene.render();
    });
});

window.addEventListener("resize", () => {
    engine.resize();
});
`
  };
};
