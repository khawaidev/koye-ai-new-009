import { ArcRotateCamera, DirectionalLight, Engine, HemisphericLight, Scene, SceneLoader, Vector3 } from "@babylonjs/core"
import "@babylonjs/loaders"
import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { loadProjectFilesFromStorage } from "../services/projectFiles"
import { getAllVFSFiles } from "../services/vfs"
import { useAppStore } from "../store/useAppStore"
import { useAgentToolStore } from "../store/useAgentToolStore"

import { gameScriptRunner } from "../services/gameScriptRunner"

export function ProjectEngineRender() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const canvasWrapperRef = useRef<HTMLDivElement>(null)
    const engineRef = useRef<Engine | null>(null)
    const sceneRef = useRef<Scene | null>(null)
    const [searchParams] = useSearchParams()
    const { user } = useAuth()
    const { generatedFiles, setGeneratedFiles, githubConnection } = useAppStore()

    const projectId = searchParams.get("projectId")
    const projectName = searchParams.get("name") || "Project"
    const [isLoading, setIsLoading] = useState(true)
    const [hasLoadedFiles, setHasLoadedFiles] = useState(false)
    const isDeviceMode = searchParams.get("device") === "1" || searchParams.get("device") === "true"
    const [showDeviceModal, setShowDeviceModal] = useState(false)
    const [runtimeErrors, setRuntimeErrors] = useState<Array<{ timestamp: number; source: string; message: string; stack?: string }>>([])
    const [showErrors, setShowErrors] = useState(false)
    const lastLoggedErrorIndexRef = useRef(0)

    const pushRuntimeError = (err: { source: string; message: string; stack?: string }) => {
        const entry = { timestamp: Date.now(), source: err.source, message: err.message, stack: err.stack }
        setRuntimeErrors(prev => {
            const next = [...prev, entry].slice(-50)
            try {
                if (projectId) localStorage.setItem(`koye_runtime_errors_${projectId}`, JSON.stringify(next))
            } catch {
            }
            return next
        })
        setShowErrors(true)
        console.error(`[GameRuntimeError:${err.source}]`, err.message, err.stack || "")
        try {
            window.opener?.postMessage({ type: "KOYE_GAME_RUNTIME_ERROR", projectId, error: entry }, "*")
        } catch {
        }
    }

    useEffect(() => {
        const onError = (event: ErrorEvent) => {
            const message = event.message || "Unknown error"
            const stack = (event.error && typeof event.error === "object" && "stack" in event.error) ? String((event.error as any).stack || "") : undefined
            pushRuntimeError({ source: "window", message, stack })
        }

        const onUnhandledRejection = (event: PromiseRejectionEvent) => {
            const reason = event.reason
            const message = reason instanceof Error ? reason.message : String(reason || "Unhandled rejection")
            const stack = reason instanceof Error ? reason.stack : undefined
            pushRuntimeError({ source: "promise", message, stack })
        }

        window.addEventListener("error", onError)
        window.addEventListener("unhandledrejection", onUnhandledRejection)
        return () => {
            window.removeEventListener("error", onError)
            window.removeEventListener("unhandledrejection", onUnhandledRejection)
        }
    }, [])

    const [viewMode, setViewMode] = useState<"Desktop" | "Mobile">(() => {
        const viewParam = searchParams.get("view")
        if (viewParam === "mobile") return "Mobile"
        if (viewParam === "desktop") return "Desktop"
        // Load saved view mode preference from localStorage
        const saved = localStorage.getItem(`render_viewMode_${projectId}`)
        return (saved === "Desktop" || saved === "Mobile") ? saved : "Desktop"
    })

    // Save view mode preference to localStorage when it changes
    useEffect(() => {
        if (projectId) {
            localStorage.setItem(`render_viewMode_${projectId}`, viewMode)
        }
    }, [viewMode, projectId])

    // Load project files on mount — prefer VFS (local, includes sandbox-synced changes)
    useEffect(() => {
        if (!projectId || isDeviceMode) return

        const loadFiles = async () => {
            try {
                // 1. Try VFS first (local IndexedDB — includes sandbox preview changes)
                const vfsFiles = await getAllVFSFiles(projectId)
                if (Object.keys(vfsFiles).length > 0) {
                    console.log(`[EngineRender] Loaded ${Object.keys(vfsFiles).length} files from VFS`)
                    setGeneratedFiles(vfsFiles)
                    setHasLoadedFiles(true)
                    return
                }

                // 2. Fallback: if VFS is empty but user is logged in, load from R2
                if (user) {
                    const files = await loadProjectFilesFromStorage(projectId, user.id, githubConnection)
                    if (Object.keys(files).length > 0) {
                        console.log(`[EngineRender] Loaded ${Object.keys(files).length} files from R2`)
                        setGeneratedFiles(files)
                        setHasLoadedFiles(true)
                        return
                    }
                }

                // 3. Fallback: localStorage
                const storageKey = `project_${projectId}_files`
                const savedData = localStorage.getItem(storageKey)
                if (savedData) {
                    try {
                        const parsed = JSON.parse(savedData)
                        if (parsed.files && Object.keys(parsed.files).length > 0) {
                            setGeneratedFiles(parsed.files)
                        }
                    } catch (error) {
                        console.error('Error loading from localStorage:', error)
                    }
                }
            } catch (error) {
                console.error('Error loading project files:', error)
            } finally {
                setHasLoadedFiles(true)
            }
        }

        loadFiles()
    }, [projectId, user, githubConnection, setGeneratedFiles, isDeviceMode])

    useEffect(() => {
        if (!projectId || !isDeviceMode) return
        if (!import.meta.hot) return

        const storageKey = `koye_device_files_${projectId}`
        const cached = sessionStorage.getItem(storageKey)
        if (cached) {
            try {
                const parsed = JSON.parse(cached) as Record<string, string>
                if (parsed && Object.keys(parsed).length > 0) {
                    setGeneratedFiles(parsed)
                    setHasLoadedFiles(true)
                }
            } catch {
            }
        }

        const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`

        import.meta.hot.on("koye-device-sync:snapshot", (payload: any) => {
            if (!payload || payload.projectId !== projectId || payload.requestId !== requestId) return
            if (!payload.files || typeof payload.files !== "object") return
            try {
                sessionStorage.setItem(storageKey, JSON.stringify(payload.files))
            } catch {
            }
            setGeneratedFiles(payload.files)
            setHasLoadedFiles(true)
        })

        import.meta.hot.on("koye-device-sync:update", (payload: any) => {
            if (!payload || payload.projectId !== projectId) return
            if (!payload.files || typeof payload.files !== "object") return
            try {
                sessionStorage.setItem(storageKey, JSON.stringify(payload.files))
            } catch {
            }
            window.location.reload()
        })

        import.meta.hot.send("koye-device-sync:request", { projectId, requestId })
    }, [projectId, isDeviceMode, setGeneratedFiles])

    // Listen for live sync signals from BroadcastChannel (IndexedDB VFS updates in builder)
    useEffect(() => {
        if (!projectId || isDeviceMode) return

        const channel = new BroadcastChannel("koye_vfs_sync")
        let reloadTimeout: ReturnType<typeof setTimeout> | null = null

        channel.onmessage = (event) => {
            if (event.data && event.data.projectId === projectId) {
                console.log("[EngineRender] Received VFS change event:", event.data.type)
                
                // Debounce reload to avoid continuous refreshing during active editing/typing
                if (reloadTimeout) clearTimeout(reloadTimeout)
                reloadTimeout = setTimeout(() => {
                    console.log("[EngineRender] Reloading window for live sync...")
                    window.location.reload()
                }, 500)
            }
        }

        return () => {
            channel.close()
            if (reloadTimeout) clearTimeout(reloadTimeout)
        }
    }, [projectId, isDeviceMode])

    useEffect(() => {
        if (!canvasRef.current || !hasLoadedFiles) return

        const initEngine = async () => {
            try {
                setIsLoading(true)

                // Initialize Babylon.js engine
                const engine = new Engine(canvasRef.current!, true, {
                    preserveDrawingBuffer: true,
                    stencil: true,
                })
                engineRef.current = engine

                // Create scene
                const scene = new Scene(engine)
                scene.clearColor.set(0.1, 0.1, 0.1, 1) // Dark background
                sceneRef.current = scene

                // Create camera
                const camera = new ArcRotateCamera(
                    "camera",
                    -Math.PI / 2,
                    Math.PI / 2.5,
                    10,
                    Vector3.Zero(),
                    scene
                )
                camera.attachControl(canvasRef.current!, true)
                camera.lowerRadiusLimit = 1
                camera.upperRadiusLimit = 100

                // Create light
                const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene)
                light.intensity = 0.65
                light.diffuse.set(1.0, 0.72, 0.55)
                light.groundColor.set(0.22, 0.18, 0.24)
                light.specular.set(0.08, 0.08, 0.08)

                const envLight = new HemisphericLight("envLight", new Vector3(0, 1, 0), scene)
                envLight.intensity = 0.22
                envLight.diffuse.set(0.45, 0.5, 0.62)
                envLight.groundColor.set(0.14, 0.12, 0.18)
                envLight.specular.set(0.0, 0.0, 0.0)

                const keyLight = new DirectionalLight("keyLight", new Vector3(-1, -2, -1), scene)
                keyLight.position = new Vector3(8, 12, 8)
                keyLight.intensity = 0.9
                keyLight.diffuse.set(1.0, 0.76, 0.58)
                keyLight.specular.set(0.08, 0.08, 0.08)

                // Bind script runner
                gameScriptRunner.bind(scene, engine)
                gameScriptRunner.onLogs((logs) => {
                    const startIndex = lastLoggedErrorIndexRef.current
                    lastLoggedErrorIndexRef.current = logs.length
                    for (const entry of logs.slice(startIndex)) {
                        if (entry.level !== "error") continue
                        pushRuntimeError({ source: "script", message: entry.message })
                    }
                })

                // Load project assets (NO placeholders)
                const currentFiles = useAppStore.getState().generatedFiles
                const mergedFiles = useAgentToolStore.getState().getMergedFiles(currentFiles)
                await loadProjectAssets(scene, mergedFiles)

                // Automatically start game logic
                try {
                    gameScriptRunner.play(mergedFiles)
                } catch (e) {
                    const msg = e instanceof Error ? e.message : String(e)
                    const stack = e instanceof Error ? e.stack : undefined
                    pushRuntimeError({ source: "engine", message: msg, stack })
                }

                // Start render loop
                engine.runRenderLoop(() => {
                    scene.render()
                })

                // Handle window resize
                const handleResize = () => {
                    engine.resize()
                }
                window.addEventListener("resize", handleResize)

                // Watch canvas wrapper for size changes (e.g. switching Desktop/Mobile view)
                let resizeObserver: ResizeObserver | null = null
                const observeTarget = canvasWrapperRef.current ?? canvasRef.current?.parentElement
                if (observeTarget) {
                    resizeObserver = new ResizeObserver(() => {
                        engine.resize()
                    })
                    resizeObserver.observe(observeTarget)
                }

                setIsLoading(false)

                return () => {
                    gameScriptRunner.unbind()
                    window.removeEventListener("resize", handleResize)
                    if (resizeObserver) resizeObserver.disconnect()
                    scene.dispose()
                    engine.dispose()
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err)
                const stack = err instanceof Error ? err.stack : undefined
                pushRuntimeError({ source: "init", message: msg, stack })
                setIsLoading(false)
            }
        }

        const cleanup = initEngine()

        return () => {
            cleanup.then(fn => fn && fn())
        }
    }, [hasLoadedFiles]) // Only run when files finish loading, don't re-run on generatedFiles or viewMode change (prevents re-initialization loops and preserves JS-added UI)

    const loadProjectAssets = async (scene: Scene, files: Record<string, string>) => {
        // Process 3D models (.glb, .gltf, .obj)
        const modelFiles = Object.entries(files).filter(([path]) => {
            const ext = path.split('.').pop()?.toLowerCase()
            return ext === 'glb' || ext === 'gltf' || ext === 'obj'
        })

        for (const [path, content] of modelFiles) {
            try {
                if (content && (content.startsWith('http') || content.startsWith('data:') || content.startsWith('blob:'))) {
                    await SceneLoader.ImportMeshAsync("", "", content, scene)
                }
            } catch (err) {
                console.error(`Error loading model ${path}:`, err)
            }
        }

        // Process textures/images (.png, .jpg)
        const imageFiles = Object.entries(files).filter(([path]) => {
            const ext = path.split('.').pop()?.toLowerCase()
            return ext === 'png' || ext === 'jpg' || ext === 'jpeg'
        })

        // Process audio files (.mp3, .wav)
        const audioFiles = Object.entries(files).filter(([path]) => {
            const ext = path.split('.').pop()?.toLowerCase()
            return ext === 'mp3' || ext === 'wav' || ext === 'ogg'
        })

        console.log(`Loaded: ${modelFiles.length} models, ${imageFiles.length} images, ${audioFiles.length} audio files`)

        // NO PLACEHOLDERS - Scene stays empty if no assets
    }

    const deviceUrl = (() => {
        if (!projectId) return ""
        const url = new URL(window.location.href)
        url.hostname = "10.155.21.204" // Use the provided local IP address
        url.port = window.location.port // Keep the current port
        url.pathname = "/project-engine-render"
        url.search = ""
        url.searchParams.set("projectId", projectId)
        url.searchParams.set("name", projectName)
        url.searchParams.set("view", "mobile")
        url.searchParams.set("device", "1")
        return url.toString()
    })()

    const qrSrc = deviceUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(deviceUrl)}`
        : ""

    return (
        <div className="fixed inset-0 bg-black flex flex-col">
            <div className={`flex flex-col flex-1 ${showDeviceModal ? "pointer-events-none blur-sm" : ""}`}>
                <div className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <h1 className="text-sm font-mono text-white">
                            {projectName}
                        </h1>
                        {isLoading && (
                            <span className="text-xs text-gray-400 font-mono animate-pulse">
                                Loading...
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {viewMode === "Mobile" && !isDeviceMode && (
                            <button
                                onClick={() => setShowDeviceModal(true)}
                                className="bg-gray-800 border border-gray-700 text-gray-200 text-xs px-2 py-1 rounded outline-none hover:bg-gray-700"
                                type="button"
                            >
                                View in device
                            </button>
                        )}
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value as "Desktop" | "Mobile")}
                            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2 py-1 rounded outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="Desktop">Desktop View</option>
                            <option value="Mobile">Mobile View</option>
                        </select>
                    </div>
                </div>

                <div className={`flex-1 relative overflow-hidden bg-[#0a0a0a] flex items-center justify-center ${viewMode === "Desktop" ? "p-0" : "p-4 sm:p-8"}`}>
                    <div
                        ref={canvasWrapperRef}
                        className={`relative transition-all duration-500 ease-in-out flex items-center justify-center bg-black overflow-hidden m-auto ${
                            viewMode === "Desktop"
                                ? "w-full h-full"
                                : "w-full max-w-[850px] aspect-[19.5/9] rounded-[2.5rem] shadow-lg shrink-0"
                        }`}
                        style={viewMode === "Mobile" ? { maxHeight: "85%" } : undefined}
                    >
                        <canvas
                            ref={canvasRef}
                            key="render-canvas"
                            className={`block w-full h-full ${viewMode === "Mobile" ? "rounded-[2.5rem]" : ""}`}
                            style={{ outline: "none", touchAction: "none" }}
                        />
                    </div>
                </div>
            </div>

            {runtimeErrors.length > 0 && (
                <div className="absolute left-3 bottom-3 z-[60] max-w-[720px] w-[min(720px,calc(100%-1.5rem))]">
                    <div className="rounded-xl border border-white/10 bg-black/80 backdrop-blur-md shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                            <div className="text-xs font-mono font-bold text-white">Runtime Errors</div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowErrors((v) => !v)}
                                    className="text-xs font-mono text-gray-200 hover:text-white px-2 py-1 rounded hover:bg-white/5"
                                >
                                    {showErrors ? "Hide" : "Show"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRuntimeErrors([])
                                        setShowErrors(false)
                                        try {
                                            if (projectId) localStorage.removeItem(`koye_runtime_errors_${projectId}`)
                                        } catch {
                                        }
                                    }}
                                    className="text-xs font-mono text-gray-200 hover:text-white px-2 py-1 rounded hover:bg-white/5"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                        {showErrors && (
                            <div className="max-h-56 overflow-y-auto">
                                <pre className="whitespace-pre-wrap break-words text-[11px] leading-relaxed font-mono text-gray-200 px-3 py-2">
{runtimeErrors.map((e) => {
    const time = new Date(e.timestamp).toLocaleTimeString()
    const head = `[${time}] (${e.source}) ${e.message}`
    return e.stack ? `${head}\n${e.stack}\n` : `${head}\n`
}).join("\n")}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showDeviceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-gray-950 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <div className="text-sm font-mono font-bold text-white">View on device</div>
                            <button
                                onClick={() => setShowDeviceModal(false)}
                                className="text-gray-300 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/5"
                                type="button"
                            >
                                Close
                            </button>
                        </div>
                        <div className="p-5 flex flex-col items-center gap-4">
                            {qrSrc ? (
                                <img
                                    src={qrSrc}
                                    alt="Device QR"
                                    className="h-60 w-60 rounded-xl bg-white p-2"
                                />
                            ) : (
                                <div className="h-60 w-60 rounded-xl bg-white/5 border border-white/10" />
                            )}
                            <div className="w-full text-xs text-gray-300 font-mono">
                                Device should be connected to the same network.
                            </div>
                            <input
                                value={deviceUrl}
                                readOnly
                                className="w-full text-xs font-mono bg-gray-900 border border-gray-700 text-gray-200 px-3 py-2 rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
