import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { loadProjectFilesFromStorage } from "../services/projectFiles"
import { getAllVFSFiles } from "../services/vfs"
import { useAppStore } from "../store/useAppStore"
import { bootWebContainer } from "../editor-runtime/WebContainerManager"
import { ProjectLoader } from "../editor-runtime/ProjectLoader"

export function ProjectEngineRender() {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [searchParams] = useSearchParams()
    const { user } = useAuth()
    const { setGeneratedFiles, githubConnection } = useAppStore()

    const projectId = searchParams.get("projectId")
    const projectName = searchParams.get("name") || "Project"
    const [isLoading, setIsLoading] = useState(true)
    const isDeviceMode = searchParams.get("device") === "1" || searchParams.get("device") === "true"
    const [showDeviceModal, setShowDeviceModal] = useState(false)
    const [statusText, setStatusText] = useState("Initializing...")
    
    const [iframeUrl, setIframeUrl] = useState<string>("")
    const [engineState, setEngineState] = useState<"stopped" | "booting" | "installing" | "starting" | "playing">("stopped")
    
    const [viewMode, setViewMode] = useState<"Desktop" | "Mobile">(() => {
        const viewParam = searchParams.get("view")
        if (viewParam === "mobile") return "Mobile"
        if (viewParam === "desktop") return "Desktop"
        const saved = localStorage.getItem(\`render_viewMode_\${projectId}\`)
        return (saved === "Desktop" || saved === "Mobile") ? saved : "Desktop"
    })

    useEffect(() => {
        if (projectId) {
            localStorage.setItem(\`render_viewMode_\${projectId}\`, viewMode)
        }
    }, [viewMode, projectId])

    useEffect(() => {
        if (!projectId) return

        const initProject = async () => {
            try {
                setIsLoading(true)
                setStatusText("Loading files...")

                let files: Record<string, string> = {}
                
                // If in device mode, we might get files from sessionStorage synced via HMR
                if (isDeviceMode) {
                    const storageKey = \`koye_device_files_\${projectId}\`
                    const cached = sessionStorage.getItem(storageKey)
                    if (cached) {
                        try {
                            const parsed = JSON.parse(cached)
                            if (parsed && Object.keys(parsed).length > 0) files = parsed
                        } catch {}
                    }
                } else {
                    const vfsFiles = await getAllVFSFiles(projectId)
                    if (Object.keys(vfsFiles).length > 0) {
                        files = vfsFiles
                    } else if (user) {
                        const r2 = await loadProjectFilesFromStorage(projectId, user.id, githubConnection)
                        if (Object.keys(r2).length > 0) files = r2
                    }
                    
                    if (Object.keys(files).length === 0) {
                        const storageKey = \`project_\${projectId}_files\`
                        const savedData = localStorage.getItem(storageKey)
                        if (savedData) {
                            try {
                                const parsed = JSON.parse(savedData)
                                if (parsed.files && Object.keys(parsed.files).length > 0) files = parsed.files
                            } catch (error) {}
                        }
                    }
                }
                
                setGeneratedFiles(files)

                setStatusText("Booting WebContainer...")
                setEngineState("booting")
                const webcontainer = await bootWebContainer()
                const projLoader = new ProjectLoader(webcontainer)
                
                setStatusText("Loading files into container...")
                await projLoader.loadProject(projectName, files)

                setStatusText("Installing dependencies...")
                setEngineState("installing")
                await projLoader.installDependencies()

                setStatusText("Starting dev server...")
                setEngineState("starting")

                webcontainer.on('server-ready', (port, url) => {
                    setIframeUrl(url)
                    setEngineState("playing")
                    setIsLoading(false)
                })

                await projLoader.startDevServer()
            } catch (error) {
                console.error('Error starting project engine render:', error)
                setStatusText(\`Failed to start: \${error}\`)
            }
        }

        initProject()
    }, [projectId, user, githubConnection, setGeneratedFiles, isDeviceMode])

    // Device sync logic
    useEffect(() => {
        if (!projectId || !isDeviceMode) return
        if (!import.meta.hot) return

        const storageKey = \`koye_device_files_\${projectId}\`
        const requestId = \`\${Date.now()}-\${Math.random().toString(16).slice(2)}\`

        import.meta.hot.on("koye-device-sync:snapshot", (payload: any) => {
            if (!payload || payload.projectId !== projectId || payload.requestId !== requestId) return
            if (!payload.files || typeof payload.files !== "object") return
            try { sessionStorage.setItem(storageKey, JSON.stringify(payload.files)) } catch {}
            // A full reload might be safer for WebContainer context refresh
            window.location.reload()
        })

        import.meta.hot.on("koye-device-sync:update", (payload: any) => {
            if (!payload || payload.projectId !== projectId) return
            if (!payload.files || typeof payload.files !== "object") return
            try { sessionStorage.setItem(storageKey, JSON.stringify(payload.files)) } catch {}
            window.location.reload()
        })

        import.meta.hot.send("koye-device-sync:request", { projectId, requestId })
    }, [projectId, isDeviceMode])

    useEffect(() => {
        if (!projectId || isDeviceMode) return

        const channel = new BroadcastChannel("koye_vfs_sync")
        let reloadTimeout: ReturnType<typeof setTimeout> | null = null

        channel.onmessage = (event) => {
            if (event.data && event.data.projectId === projectId) {
                if (reloadTimeout) clearTimeout(reloadTimeout)
                reloadTimeout = setTimeout(() => {
                    window.location.reload()
                }, 500)
            }
        }

        return () => {
            channel.close()
            if (reloadTimeout) clearTimeout(reloadTimeout)
        }
    }, [projectId, isDeviceMode])

    const deviceUrl = (() => {
        if (!projectId) return ""
        const url = new URL(window.location.href)
        url.hostname = "10.155.21.204"
        url.pathname = "/project-engine-render"
        url.search = ""
        url.searchParams.set("projectId", projectId)
        url.searchParams.set("name", projectName)
        url.searchParams.set("view", "mobile")
        url.searchParams.set("device", "1")
        return url.toString()
    })()

    const qrSrc = deviceUrl
        ? \`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=\${encodeURIComponent(deviceUrl)}\`
        : ""

    return (
        <div className="fixed inset-0 bg-black flex flex-col">
            <div className={\`flex flex-col flex-1 \${showDeviceModal ? "pointer-events-none blur-sm" : ""}\`}>
                <div className="bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <h1 className="text-sm font-mono text-white">
                            {projectName}
                        </h1>
                        {isLoading && (
                            <span className="text-xs text-gray-400 font-mono animate-pulse">
                                {statusText}
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

                <div className={\`flex-1 relative overflow-hidden bg-[#0a0a0a] flex items-center justify-center \${viewMode === "Desktop" ? "p-0" : "p-4 sm:p-8"}\`}>
                    <div
                        className={\`relative transition-all duration-500 ease-in-out flex items-center justify-center bg-black overflow-hidden m-auto \${
                            viewMode === "Desktop"
                                ? "w-full h-full"
                                : "w-full max-w-[850px] aspect-[19.5/9] rounded-[2.5rem] shadow-lg shrink-0"
                        }\`}
                        style={viewMode === "Mobile" ? { maxHeight: "85%" } : undefined}
                    >
                        {iframeUrl && (
                            <iframe 
                                ref={iframeRef}
                                src={iframeUrl} 
                                className={\`w-full h-full bg-white border-none \${viewMode === "Mobile" ? "rounded-[2.5rem]" : ""}\`}
                                allow="cross-origin-isolated"
                            />
                        )}
                    </div>
                </div>
            </div>

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
