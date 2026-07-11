import { ArcRotateCamera, DirectionalLight, Engine, HemisphericLight, Scene, SceneLoader, Vector3, WebGPUEngine } from "@babylonjs/core"
import "@babylonjs/loaders"
import { useEffect, useRef, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { loadProjectFilesFromStorage } from "../services/projectFiles"
import { getAllVFSFiles } from "../services/vfs"
import { useAppStore } from "../store/useAppStore"
import { useAgentToolStore } from "../store/useAgentToolStore"
import { gameScriptRunner } from "../services/gameScriptRunner"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, Check, ClipboardCopy, Wrench, X, ChevronDown, ChevronUp } from "lucide-react"

interface RuntimeError {
    timestamp: number
    source: string
    message: string
    stack?: string
}

export function GameRunner() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const engineRef = useRef<Engine | WebGPUEngine | null>(null)
    const sceneRef = useRef<Scene | null>(null)
    const { projectId: routeProjectId } = useParams()
    const [searchParams] = useSearchParams()
    const { user } = useAuth()
    const { setGeneratedFiles, githubConnection } = useAppStore()

    const projectId = routeProjectId || searchParams.get("projectId")
    const [isLoading, setIsLoading] = useState(true)
    const [hasLoadedFiles, setHasLoadedFiles] = useState(false)
    const [runtimeErrors, setRuntimeErrors] = useState<RuntimeError[]>([])
    const [showErrorPopup, setShowErrorPopup] = useState(false)
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
    const [isErrorsExpanded, setIsErrorsExpanded] = useState(true)

    const pushRuntimeError = (err: { source: string; message: string; stack?: string }) => {
        const entry: RuntimeError = { timestamp: Date.now(), source: err.source, message: err.message, stack: err.stack }
        setRuntimeErrors(prev => {
            const next = [...prev, entry].slice(-50)
            try {
                if (projectId) localStorage.setItem(`koye_runtime_errors_${projectId}`, JSON.stringify(next))
            } catch {}
            return next
        })
        // Auto-show the error popup when errors are detected
        setShowErrorPopup(true)
        console.error(`[GameRunnerError:${err.source}]`, err.message, err.stack || "")
        try {
            window.opener?.postMessage({ type: "KOYE_GAME_RUNTIME_ERROR", projectId, error: entry }, "*")
        } catch {}
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
    }, [projectId])

    // Load project files on mount
    useEffect(() => {
        if (!projectId) return

        const loadFiles = async () => {
            try {
                // 1. Try VFS first (local IndexedDB)
                const vfsFiles = await getAllVFSFiles(projectId)
                if (Object.keys(vfsFiles).length > 0) {
                    setGeneratedFiles(vfsFiles)
                    setHasLoadedFiles(true)
                    return
                }

                // 2. Fallback: if VFS is empty but user is logged in, load from R2
                if (user) {
                    const files = await loadProjectFilesFromStorage(projectId, user.id, githubConnection)
                    if (Object.keys(files).length > 0) {
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
    }, [projectId, user, githubConnection, setGeneratedFiles])

    // Initialize Babylon.js Engine (WebGPU prioritized)
    useEffect(() => {
        if (!canvasRef.current || !hasLoadedFiles) return

        const initEngine = async () => {
            try {
                setIsLoading(true)

                let engine: Engine | WebGPUEngine
                const webgpuSupported = await WebGPUEngine.IsSupportedAsync

                if (webgpuSupported) {
                    try {
                        console.log("[GameRunner] Initializing WebGPUEngine...")
                        const webgpu = new WebGPUEngine(canvasRef.current!, {
                            deviceDescriptor: {
                                requiredFeatures: [
                                    "depth-clip-control",
                                    "depth32float-stencil8",
                                    "texture-compression-bc",
                                    "texture-compression-etc2",
                                    "texture-compression-astc",
                                    "timestamp-query",
                                    "indirect-first-instance",
                                ],
                            },
                        })
                        await webgpu.initAsync()
                        engine = webgpu
                    } catch (webgpuErr) {
                        console.warn("[GameRunner] WebGPU initialization failed, falling back to WebGL:", webgpuErr)
                        engine = new Engine(canvasRef.current!, true, {
                            preserveDrawingBuffer: true,
                            stencil: true,
                        })
                    }
                } else {
                    console.log("[GameRunner] WebGPU not supported, using WebGL Engine.")
                    engine = new Engine(canvasRef.current!, true, {
                        preserveDrawingBuffer: true,
                        stencil: true,
                    })
                }

                engineRef.current = engine

                // Create scene
                const scene = new Scene(engine)
                scene.clearColor.set(0.1, 0.1, 0.1, 1)
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

                // Create lights
                const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene)
                light.intensity = 0.65
                const envLight = new HemisphericLight("envLight", new Vector3(0, 1, 0), scene)
                envLight.intensity = 0.22
                const keyLight = new DirectionalLight("keyLight", new Vector3(-1, -2, -1), scene)
                keyLight.intensity = 0.9

                // Bind script runner
                gameScriptRunner.bind(scene, engine)
                gameScriptRunner.onLogs((logs) => {
                    for (const entry of logs) {
                        if (entry.level === "error") {
                            pushRuntimeError({ source: "script", message: entry.message })
                        }
                    }
                })

                // Load project assets
                const currentFiles = useAppStore.getState().generatedFiles
                const mergedFiles = useAgentToolStore.getState().getMergedFiles(currentFiles)
                await loadProjectAssets(scene, mergedFiles)

                // Start game logic
                try {
                    gameScriptRunner.play(mergedFiles)
                } catch (e) {
                    const msg = e instanceof Error ? e.message : String(e)
                    const stack = e instanceof Error ? e.stack : undefined
                    pushRuntimeError({ source: "engine", message: msg, stack })
                }

                // Render loop
                engine.runRenderLoop(() => {
                    scene.render()
                })

                // Resize listener
                const handleResize = () => {
                    engine.resize()
                }
                window.addEventListener("resize", handleResize)

                setIsLoading(false)

                return () => {
                    gameScriptRunner.unbind()
                    window.removeEventListener("resize", handleResize)
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
    }, [hasLoadedFiles])

    const loadProjectAssets = async (scene: Scene, files: Record<string, string>) => {
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
    }

    // ── Copy a single error to clipboard ──
    const handleCopyError = (error: RuntimeError, index: number) => {
        const text = `[${error.source}] ${error.message}${error.stack ? '\n' + error.stack : ''}`
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index)
            setTimeout(() => setCopiedIndex(null), 2000)
        })
    }

    // ── Copy ALL errors to clipboard ──
    const handleCopyAllErrors = () => {
        const text = runtimeErrors
            .map(e => `[${new Date(e.timestamp).toLocaleTimeString()}] (${e.source}) ${e.message}${e.stack ? '\n' + e.stack : ''}`)
            .join('\n\n')
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(-1) // -1 means "all copied"
            setTimeout(() => setCopiedIndex(null), 2000)
        })
    }

    // ── "Fix This" — switch to main chat tab and auto-paste errors ──
    const handleFixThis = () => {
        const errorSummary = runtimeErrors
            .slice(0, 10)
            .map(e => `[${e.source}] ${e.message}${e.stack ? '\n' + e.stack : ''}`)
            .join('\n\n')

        const prefillText = `My game has the following runtime errors. Please fix them:\n\n${errorSummary}`

        // Store the prefill text so the chat interface can pick it up
        try {
            localStorage.setItem('koye_error_prefill', JSON.stringify({
                text: prefillText,
                projectId,
                timestamp: Date.now(),
            }))
        } catch {}

        // Try to focus the opener (main chat window)
        if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: 'KOYE_PREFILL_ERROR', text: prefillText, projectId }, '*')
            window.opener.focus()
        } else {
            // If no opener, navigate to the app with a prefill param
            window.location.href = `/app?errorPrefill=1`
        }
    }

    // ── Clear all errors ──
    const handleClearErrors = () => {
        setRuntimeErrors([])
        setShowErrorPopup(false)
        try {
            if (projectId) localStorage.removeItem(`koye_runtime_errors_${projectId}`)
        } catch {}
    }

    return (
        <div className="fixed inset-0 bg-black w-full h-full overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
                </div>
            )}
            <canvas
                ref={canvasRef}
                className="w-full h-full block"
                style={{ outline: "none", touchAction: "none" }}
            />

            {/* ── Runtime Error Popup ── */}
            <AnimatePresence>
                {showErrorPopup && runtimeErrors.length > 0 && (
                    <motion.div
                        key="error-popup"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 22, stiffness: 300 }}
                        className="absolute bottom-4 left-4 z-[60] w-[min(520px,calc(100%-2rem))]"
                    >
                        <div className="rounded-2xl border border-red-500/20 bg-[#1a1a1a]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                    <span className="text-sm font-semibold text-white">
                                        {runtimeErrors.length} Runtime Error{runtimeErrors.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {/* Collapse / Expand */}
                                    <button
                                        onClick={() => setIsErrorsExpanded(!isErrorsExpanded)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                        title={isErrorsExpanded ? "Collapse" : "Expand"}
                                    >
                                        {isErrorsExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                                    </button>
                                    {/* Close */}
                                    <button
                                        onClick={() => setShowErrorPopup(false)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                        title="Dismiss"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Error list */}
                            {isErrorsExpanded && (
                                <div className="max-h-52 overflow-y-auto">
                                    {runtimeErrors.map((error, i) => (
                                        <div key={i} className="flex items-start gap-2 px-4 py-2.5 border-b border-white/5 last:border-0 group hover:bg-white/[0.02]">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-mono text-red-300 leading-relaxed break-all">
                                                    <span className="text-red-500/60 mr-1">[{error.source}]</span>
                                                    {error.message}
                                                </p>
                                                {error.stack && (
                                                    <pre className="text-[10px] font-mono text-gray-500 mt-1 leading-snug whitespace-pre-wrap break-all max-h-20 overflow-y-auto">
                                                        {error.stack.split('\n').slice(0, 4).join('\n')}
                                                    </pre>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleCopyError(error, i)}
                                                className="shrink-0 p-1 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Copy error"
                                            >
                                                {copiedIndex === i ? <Check className="h-3 w-3 text-emerald-400" /> : <ClipboardCopy className="h-3 w-3" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Action bar */}
                            <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCopyAllErrors}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        {copiedIndex === -1 ? <Check className="h-3 w-3 text-emerald-400" /> : <ClipboardCopy className="h-3 w-3" />}
                                        {copiedIndex === -1 ? 'Copied!' : 'Copy All'}
                                    </button>
                                    <button
                                        onClick={handleClearErrors}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                        Clear
                                    </button>
                                </div>
                                <button
                                    onClick={handleFixThis}
                                    className="
                                        flex items-center gap-2 px-4 py-2 rounded-xl
                                        bg-gradient-to-r from-orange-500 to-red-500
                                        hover:from-orange-400 hover:to-red-400
                                        text-white text-xs font-bold transition-all
                                        shadow-[0_0_20px_rgba(239,68,68,0.25)]
                                        hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]
                                    "
                                >
                                    <Wrench className="h-3.5 w-3.5" />
                                    Fix This
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
