import { useEffect, useRef, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { loadProjectFilesFromStorage } from "../services/projectFiles"
import { getAllVFSFiles } from "../services/vfs"
import { useAppStore } from "../store/useAppStore"
import { bootWebContainer } from "../editor-runtime/WebContainerManager"
import { ProjectLoader } from "../editor-runtime/ProjectLoader"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, Check, ClipboardCopy, Wrench, X, ChevronDown, ChevronUp } from "lucide-react"

export function GameRunner() {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const { projectId: routeProjectId } = useParams()
    const [searchParams] = useSearchParams()
    const { user } = useAuth()
    const { setGeneratedFiles, githubConnection } = useAppStore()

    const projectId = routeProjectId || searchParams.get("projectId")
    const [isLoading, setIsLoading] = useState(true)
    const [iframeUrl, setIframeUrl] = useState<string>("")
    const [engineState, setEngineState] = useState<"stopped" | "booting" | "installing" | "starting" | "playing">("stopped")
    const [statusText, setStatusText] = useState("Initializing...")

    // Load project files on mount
    useEffect(() => {
        if (!projectId) return

        const initProject = async () => {
            try {
                setIsLoading(true)
                setStatusText("Loading files...")

                let files: Record<string, string> = {}
                const vfsFiles = await getAllVFSFiles(projectId)
                if (Object.keys(vfsFiles).length > 0) {
                    files = vfsFiles
                } else if (user) {
                    const r2 = await loadProjectFilesFromStorage(projectId, user.id, githubConnection)
                    if (Object.keys(r2).length > 0) files = r2
                }
                
                if (Object.keys(files).length === 0) {
                    const storageKey = `project_${projectId}_files`
                    const savedData = localStorage.getItem(storageKey)
                    if (savedData) {
                        try {
                            const parsed = JSON.parse(savedData)
                            if (parsed.files && Object.keys(parsed.files).length > 0) files = parsed.files
                        } catch (error) {}
                    }
                }
                
                setGeneratedFiles(files)

                setStatusText("Booting WebContainer...")
                setEngineState("booting")
                const webcontainer = await bootWebContainer()
                const projLoader = new ProjectLoader(webcontainer)
                
                setStatusText("Loading files into container...")
                const finalFiles = await projLoader.loadProject("Koye Project", files)

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
                console.error('Error starting game runner:', error)
                setStatusText(`Failed to start: ${error}`)
            }
        }

        initProject()
    }, [projectId, user, githubConnection, setGeneratedFiles])

    return (
        <div className="fixed inset-0 bg-black w-full h-full overflow-hidden flex items-center justify-center">
            {isLoading && (
                <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-4" />
                    <div className="text-white font-mono text-sm">{statusText}</div>
                </div>
            )}
            
            {iframeUrl && (
                <iframe 
                    ref={iframeRef}
                    src={iframeUrl} 
                    className="w-full h-full bg-white border-none"
                    allow="cross-origin-isolated"
                />
            )}
        </div>
    )
}
