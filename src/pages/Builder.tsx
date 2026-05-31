import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp, Check, ChevronDown, Pencil, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { cn } from "../lib/utils"
import { BuilderHeader } from "../components/builder/BuilderHeader"
import { BuilderSidebar } from "../components/builder/BuilderSidebar"
import { BuilderWelcomeModal } from "../components/builder/BuilderWelcomeModal"

import { UnifiedViewer } from "../components/ui/UnifiedViewer"
import { Select } from "../components/ui/select"
import { useAuth } from "../hooks/useAuth"
import { deleteProjectFile, loadProjectFilesFromStorage, saveProjectFilesToStorage } from "../services/projectFiles"
import { editImageWithRunway, generateVideoWithRunway, type RunwayImageModel, type RunwayRatio, type RunwayVideoModel, type RunwayVideoRatio } from "../services/runwayml"
import { useAppStore } from "../store/useAppStore"
import { getProjectById } from "../services/supabase"
import { detectFileType } from "../utils/fileTypeDetection"
import { bulkSaveVFS, saveVFSFile, deleteVFSFile } from "../services/vfs"
import { ProjectLoader } from "../components/ui/ProjectLoader"
import { LeftSidebar } from "../components/sidebar/LeftSidebar"
import { AppIcon } from "../components/ui/AppIcon"
import { useAgentToolStore } from "../store/useAgentToolStore"

type HistoryState = {
    files: Record<string, string>
    timestamp: number
}

// Upload overlay state type
export interface UploadFileStatus {
    name: string
    status: 'pending' | 'reading' | 'uploading' | 'success' | 'failed'
    error?: string
}

export interface UploadOverlayState {
    isUploading: boolean
    files: UploadFileStatus[]
}

export function Builder({ projectId: propsProjectId, projectName: propsProjectName, hideSidebar = false }: { projectId?: string, projectName?: string, hideSidebar?: boolean } = {}) {
    const { projectId: routeProjectId } = useParams()
    const [searchParams] = useSearchParams()
    
    // Read hideSidebar from URL params if not provided as prop
    const shouldHideSidebar = hideSidebar || searchParams.get('hideSidebar') === 'true'
    const { user } = useAuth()

    const {
        selectedAsset,
        setSelectedAsset,
        generatedFiles,
        setGeneratedFiles,
        addGeneratedFile,
        githubConnection,
        currentProject,
        setCurrentProject,
        isSidebarOpen,
        setIsSidebarOpen,
        stage,
        setStage,
    } = useAppStore()

    const projectId = propsProjectId || routeProjectId || currentProject?.id
    const projectName = propsProjectName || searchParams.get("name") || currentProject?.name || "Untitled Project"
    const deviceSyncRegisteredRef = useRef(false)
    const deviceSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (!projectId) return
        if (!import.meta.hot) return
        if (deviceSyncRegisteredRef.current) return
        deviceSyncRegisteredRef.current = true

        import.meta.hot.on("koye-device-sync:request", (payload: any) => {
            if (!payload || payload.projectId !== projectId) return
            const requestId = payload.requestId
            if (!requestId) return
            const currentFiles = useAppStore.getState().generatedFiles || {}
            const mergedFiles = useAgentToolStore.getState().getMergedFiles(currentFiles)
            import.meta.hot?.send("koye-device-sync:snapshot", { projectId, requestId, files: mergedFiles })
        })
    }, [projectId])

    useEffect(() => {
        if (!projectId) return
        if (!import.meta.hot) return

        if (deviceSyncTimeoutRef.current) {
            clearTimeout(deviceSyncTimeoutRef.current)
        }

        deviceSyncTimeoutRef.current = setTimeout(() => {
            const currentFiles = useAppStore.getState().generatedFiles || {}
            const mergedFiles = useAgentToolStore.getState().getMergedFiles(currentFiles)
            import.meta.hot?.send("koye-device-sync:update", { projectId, files: mergedFiles })
        }, 400)
    }, [projectId, generatedFiles])

    // Undo/Redo history
    const historyRef = useRef<HistoryState[]>([])
    const historyIndexRef = useRef<number>(-1)
    const [canUndo, setCanUndo] = useState(false)
    const [canRedo, setCanRedo] = useState(false)

    // Auto-save
    const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [_isSaving, setIsSaving] = useState(false)
    const [_lastSaved, setLastSaved] = useState<Date | null>(null)
    const [showWelcome, setShowWelcome] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    // Upload overlay state — controlled by BuilderSidebar, rendered here
    const [uploadState, setUploadState] = useState<UploadOverlayState | null>(null)

    // Track last-saved file contents to only sync changed files
    const lastSavedFilesRef = useRef<Record<string, string>>({})

    // Save current state to history
    const saveToHistory = () => {
        // Get latest generatedFiles from store to avoid closure issues
        const currentFiles = useAppStore.getState().generatedFiles
        const currentState: HistoryState = {
            files: { ...currentFiles },
            timestamp: Date.now()
        }

        // Remove any future history if we're not at the end
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
        }

        historyRef.current.push(currentState)
        historyIndexRef.current = historyRef.current.length - 1

        // Limit history to 50 states
        if (historyRef.current.length > 50) {
            historyRef.current.shift()
            historyIndexRef.current--
        }

        updateUndoRedoState()
    }

    // Initialize history with current state on mount
    useEffect(() => {
        if (historyRef.current.length === 0) {
            saveToHistory()
        }
    }, [])

    // Save to history when generatedFiles changes (but only if not from undo/redo)
    // We use a ref to track if the change is from undo/redo
    const isUndoRedoRef = useRef(false)

    useEffect(() => {
        // Skip saving if this change came from undo/redo
        if (isUndoRedoRef.current) {
            isUndoRedoRef.current = false
            return
        }

        // Only save if history is initialized (not on first mount)
        if (historyRef.current.length > 0) {
            saveToHistory()
        }
    }, [generatedFiles])

    const updateUndoRedoState = () => {
        setCanUndo(historyIndexRef.current > 0)
        setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
    }

    const handleUndo = () => {
        if (historyIndexRef.current > 0) {
            historyIndexRef.current--
            const previousState = historyRef.current[historyIndexRef.current]
            isUndoRedoRef.current = true // Mark as undo/redo operation
            setGeneratedFiles(previousState.files)
            updateUndoRedoState()
        }
    }

    const handleRedo = () => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current++
            const nextState = historyRef.current[historyIndexRef.current]
            isUndoRedoRef.current = true // Mark as undo/redo operation
            setGeneratedFiles(nextState.files)
            updateUndoRedoState()
        }
    }

    const handlePlay = () => {
        console.log("Play project")
        window.open(`/project-engine-render?projectId=${projectId}&name=${encodeURIComponent(projectName)}`, '_blank')
    }

    const [engineErrors, setEngineErrors] = useState<Array<{ timestamp: number; source: string; message: string; stack?: string }>>([])
    const [showEngineErrors, setShowEngineErrors] = useState(false)

    useEffect(() => {
        if (!projectId) return
        try {
            const cached = localStorage.getItem(`koye_runtime_errors_${projectId}`)
            if (cached) {
                const parsed = JSON.parse(cached)
                if (Array.isArray(parsed)) {
                    setEngineErrors(parsed)
                    setShowEngineErrors(parsed.length > 0)
                }
            }
        } catch {
        }
    }, [projectId])

    useEffect(() => {
        if (!projectId) return

        const onMessage = (event: MessageEvent) => {
            const data = event.data as any
            if (!data || data.type !== "KOYE_GAME_RUNTIME_ERROR") return
            if (data.projectId !== projectId) return
            const incoming = data.error
            if (!incoming || typeof incoming !== "object") return

            setEngineErrors(prev => {
                const next = [...prev, incoming].slice(-50)
                try {
                    localStorage.setItem(`koye_runtime_errors_${projectId}`, JSON.stringify(next))
                } catch {
                }
                return next
            })
            setShowEngineErrors(true)
            console.error("[GameRuntimeError]", incoming)
        }

        window.addEventListener("message", onMessage)
        return () => window.removeEventListener("message", onMessage)
    }, [projectId])

    const handleSelectFile = (path: string, _type: "file" | "asset", data?: any) => {
        // Detect file type from path
        const fileTypeInfo = detectFileType(path)
        const fileName = path.split('/').pop() || path

        // Determine the content to display
        const mergedFiles = useAgentToolStore.getState().getMergedFiles(generatedFiles)
        const currentContent = mergedFiles[path]

        // Determine type based on file detection
        let assetType = fileTypeInfo.category

        // Special case: check if it's a folder (no content and exists as prefix)
        if (currentContent === undefined) {
             const isFolder = Object.keys(mergedFiles).some(p => p.startsWith(path + '/'))
             if (isFolder) {
                 assetType = 'folder' as any
             }
        }

        if (assetType === 'text') {
            assetType = 'code' // Treat text files as code for display
        }

        // Resolve the URL from the actual content (covers data URLs, http URLs, blob URLs)
        let resolvedUrl: string | undefined = currentContent && (
            currentContent.startsWith('data:') ||
            currentContent.startsWith('http') ||
            currentContent.startsWith('blob:')
        ) ? currentContent : undefined

        // Fallback: if content is markdown metadata (legacy), try to extract URL from it
        if (!resolvedUrl && currentContent && fileTypeInfo.isBinary) {
            const urlMatch = currentContent.match(/\**URL:\*\*\s*(https?:\/\/[^\s\n*)]+)/i)
                || currentContent.match(/# URL:\s*(https?:\/\/[^\s\n]+)/i)
                || currentContent.match(/(https?:\/\/[^\s\n*)]+)/i)
            if (urlMatch) {
                resolvedUrl = urlMatch[1]
            }
        }

        // Build the asset data, merging any provided data with resolved values
        const assetData = {
            ...(data || {}),
            name: (data?.name) || fileName,
            path: (data?.path) || path,
            type: (data?.type) || (assetType === 'unknown' ? 'code' : assetType),
            content: currentContent,
            url: resolvedUrl || (data?.url) // Prefer freshly resolved URL
        }

        setSelectedAsset(assetData)
    }

    const handleFileCreated = () => {
        // History is automatically saved via useEffect when generatedFiles changes
        // This callback can be used for other side effects if needed
    }

    // Called by BuilderSidebar after a file is immediately synced (upload, create, delete)
    // These actions are synced to BOTH VFS and R2 immediately, so we update both snapshots
    const handleFileSynced = useCallback((path: string, content: string | null) => {
        if (content === null) {
            // File was deleted — remove from snapshots
            delete lastVfsFilesRef.current[path]
            delete lastSavedFilesRef.current[path]
        } else {
            // File was created/updated — update both snapshots
            lastVfsFilesRef.current[path] = content
            lastSavedFilesRef.current[path] = content
        }
        
        // Check if there are STILL any unsaved changes in OTHER files
        const currentFiles = useAppStore.getState().generatedFiles || {}
        const hasChanges = Object.keys(currentFiles).some(p => 
            lastSavedFilesRef.current[p] !== currentFiles[p]
        ) || Object.keys(lastSavedFilesRef.current).some(p => 
            !(p in currentFiles)
        )
        
        setHasUnsavedChanges(hasChanges)
    }, [])

    // Manual save function — saves to R2 when user clicks save button
    const manualSave = useCallback(async () => {
        if (!projectId || !user) return

        setIsSaving(true)
        try {
            // Get latest generatedFiles from store (default to empty object if undefined)
            const currentFiles = useAppStore.getState().generatedFiles || {}

            // Skip if no files to save
            if (Object.keys(currentFiles).length === 0) {
                console.log('No files to save')
                setIsSaving(false)
                return
            }

            // Find files that have actually changed since last save
            const changedFiles: Record<string, string> = {}
            for (const [path, content] of Object.entries(currentFiles)) {
                if (lastSavedFilesRef.current[path] !== content) {
                    changedFiles[path] = content
                }
            }

            // Detect files that were DELETED (exist in snapshot but not in current)
            const deletedPaths: string[] = []
            for (const path of Object.keys(lastSavedFilesRef.current)) {
                if (!(path in currentFiles)) {
                    deletedPaths.push(path)
                }
            }

            if (Object.keys(changedFiles).length === 0 && deletedPaths.length === 0) {
                console.log('No changed files to save')
                setIsSaving(false)
                return
            }

            console.log(`[manual-save] ${Object.keys(changedFiles).length} changed, ${deletedPaths.length} deleted`)

            // Delete removed files from backend
            for (const deletedPath of deletedPaths) {
                deleteProjectFile(projectId, user.id, deletedPath, githubConnection)
                    .then(() => console.log(`[manual-save] Deleted from backend: ${deletedPath}`))
                    .catch(e => console.warn(`[manual-save] Delete failed for ${deletedPath}:`, e))
            }

            // Save ONLY changed files to storage (priority sync)
            await saveProjectFilesToStorage(
                projectId,
                user.id,
                projectName,
                changedFiles,
                githubConnection
            )

            // Update snapshot to mark these files as saved
            lastSavedFilesRef.current = { ...currentFiles }
            setHasUnsavedChanges(false)

            setLastSaved(new Date())
            console.log('Manually saved files to R2')
        } catch (error) {
            console.error('Error manually saving:', error)
        } finally {
            setIsSaving(false)
        }
    }, [projectId, projectName, user, githubConnection])

    // Track unsaved changes when generatedFiles changes (no auto-save to R2)
    useEffect(() => {
        // Skip if this change came from undo/redo or sync
        if (isUndoRedoRef.current) {
            return
        }

        // Only track changes if history is initialized (not on first mount)
        if (historyRef.current.length > 0 && projectId) {
            // Check if there are unsaved changes
            const currentFiles = useAppStore.getState().generatedFiles || {}
            const hasChanges = Object.keys(currentFiles).some(path => 
                lastSavedFilesRef.current[path] !== currentFiles[path]
            ) || Object.keys(lastSavedFilesRef.current).some(path => 
                !(path in currentFiles)
            )
            
            setHasUnsavedChanges(hasChanges)

            // Sync to chat - only file paths, not content (to avoid quota issues)
            try {
                const syncKey = `project_${projectId}_sync`
                const filePaths = Object.keys(generatedFiles)
                localStorage.setItem(syncKey, JSON.stringify({
                    timestamp: Date.now(),
                    sessionId: 'builder',
                    filePaths: filePaths // Only sync paths, not full content
                }))
            } catch {
                // Ignore quota errors for sync
            }
        }
    }, [generatedFiles, projectId])

    // Track last VFS sync to update VFS immediately on staging
    const lastVfsFilesRef = useRef<Record<string, string>>({})

    // Sync sandbox changes to VFS immediately for preview
    const sandboxChanges = useAgentToolStore(s => s.sandboxChanges)
    
    useEffect(() => {
        if (!projectId) return
        
        const mergedFiles = useAgentToolStore.getState().getMergedFiles(generatedFiles)
        
        // Find changed files compared to lastVfsFilesRef
        const changedFiles: Record<string, string> = {}
        for (const [path, content] of Object.entries(mergedFiles)) {
            if (lastVfsFilesRef.current[path] !== content) {
                changedFiles[path] = content
            }
        }
        
        // Find deleted files
        const deletedPaths: string[] = []
        for (const path of Object.keys(lastVfsFilesRef.current)) {
            if (!(path in mergedFiles)) {
                deletedPaths.push(path)
            }
        }
        
        // Sync to VFS immediately
        for (const path of deletedPaths) {
            deleteVFSFile(projectId, path).catch(() => {})
            delete lastVfsFilesRef.current[path]
        }
        
        for (const [path, content] of Object.entries(changedFiles)) {
            saveVFSFile(projectId, path, content).catch(() => {})
            lastVfsFilesRef.current[path] = content
        }
    }, [sandboxChanges, generatedFiles, projectId])

    const [isLoading, setIsLoading] = useState(true)
    const loadedProjectIdRef = useRef<string | null>(null)

    // Load project files on mount or project switch
    // Storage is the SOLE source of truth — no localStorage merge
    useEffect(() => {
        if (projectId && user && loadedProjectIdRef.current !== projectId) {
            loadedProjectIdRef.current = projectId  // Mark this project as loaded
            
            // Immediately clear the old project's files and history so they don't bleed over
            setGeneratedFiles({})
            lastSavedFilesRef.current = {}
            lastVfsFilesRef.current = {}
            historyRef.current = []
            historyIndexRef.current = -1
            setSelectedAsset(null)
            setIsLoading(true)

            const loadFiles = async () => {
                try {
                    // If the project isn't in the store yet (e.g. direct load), fetch it
                    if (!currentProject || currentProject.id !== projectId) {
                        try {
                            const projectData = await getProjectById(projectId)
                            setCurrentProject(projectData)
                        } catch (e) {
                            console.error('Failed to load project metadata', e)
                        }
                    }

                    // Fetch from storage — this is the only source of truth
                    console.log(`Loading project files for ${projectId} from storage...`)
                    const dbFiles = await loadProjectFilesFromStorage(
                        projectId,
                        user.id,
                        githubConnection
                    )

                    const finalFiles = Object.fromEntries(
                        Object.entries(dbFiles).filter(([path]) => !path.includes('.settings.koye'))
                    )

                    if (Object.keys(finalFiles).length > 0) {
                        console.log('Loaded', Object.keys(finalFiles).length, 'files from storage')
                        setGeneratedFiles(finalFiles)
                        // Set the snapshot so manual save doesn't re-upload everything
                        lastSavedFilesRef.current = { ...finalFiles }
                        lastVfsFilesRef.current = { ...finalFiles }
                        setLastSaved(new Date())
                        setHasUnsavedChanges(false) // Mark as saved since loaded from R2
                    } else {
                        console.log('No files found in storage')
                        setGeneratedFiles({})
                        setHasUnsavedChanges(false)
                    }

                    // Update VFS backup (replaces localStorage to avoid 5MB limit and UI lag)
                    if (projectId && Object.keys(finalFiles).length > 0) {
                        try {
                            await bulkSaveVFS(projectId, finalFiles)
                            console.log(`✓ Backed up ${Object.keys(finalFiles).length} files to VFS (IndexedDB)`)
                        } catch (vfsError) {
                            console.warn('Failed to backup to VFS:', vfsError)
                        }
                    }
                } catch (error) {
                    console.error('Error loading project files:', error)
                } finally {
                    // Add a small delay to show the animation
                    setTimeout(() => setIsLoading(false), 1500)
                }
            }

            loadFiles()
        } else if (!projectId) {
            setIsLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId, user?.id])  // Dependency on projectId triggers reload on switch

    // Listen for real-time sync from chat
    useEffect(() => {
        if (!projectId) return

        const syncKey = `project_${projectId}_sync`

        // Check for updates every 2 seconds (reduced frequency)
        const syncInterval = setInterval(() => {
            const syncData = localStorage.getItem(syncKey)
            if (syncData) {
                try {
                    const parsed = JSON.parse(syncData)

                    // Only update if timestamp is newer
                    const lastCheck = localStorage.getItem(`${syncKey}_lastCheck`)
                    const lastCheckTime = lastCheck ? parseInt(lastCheck) : 0

                    if (parsed.timestamp > lastCheckTime) {
                        console.log('Builder: Received sync signal from chat')
                        // We rely on useAppStore for global state, no need to merge via localStorage
                        localStorage.setItem(`${syncKey}_lastCheck`, parsed.timestamp.toString())
                    }
                } catch (error) {
                    console.error('Error syncing from chat:', error)
                }
            }
        }, 2000)

        return () => clearInterval(syncInterval)
    }, [projectId, setGeneratedFiles])

    // Check if opened from chat (show welcome modal)
    useEffect(() => {
        const fromChat = searchParams.get('fromChat')
        const welcomeShownKey = `builder_welcome_shown_${projectId}`
        const hasShownWelcome = localStorage.getItem(welcomeShownKey)

        if (fromChat === 'true' && !hasShownWelcome && !isLoading) {
            setShowWelcome(true)
            localStorage.setItem(welcomeShownKey, 'true')
        }
    }, [projectId, searchParams, isLoading])

    const handleCloseWelcome = () => {
        setShowWelcome(false)
    }

    const selectedPath = (selectedAsset as any)?.path as string | undefined
    const selectedCategory = selectedPath ? detectFileType(selectedPath).category : undefined
    const isSelectedMedia = selectedCategory === "image" || selectedCategory === "video"
    const selectedMediaUrl = ((selectedAsset as any)?.url || (selectedAsset as any)?.content) as string | undefined

    const [isMediaEditorOpen, setIsMediaEditorOpen] = useState(false)
    const [editPrompt, setEditPrompt] = useState("")
    const [isEditingMedia, setIsEditingMedia] = useState(false)
    const [editError, setEditError] = useState<string | null>(null)

    const [imageModel, setImageModel] = useState<RunwayImageModel>("gen4_image_turbo")
    const [imageRatio, setImageRatio] = useState<RunwayRatio>("720:1280")

    const [videoModel, setVideoModel] = useState<RunwayVideoModel>("gen4.5")
    const [videoRatio, setVideoRatio] = useState<RunwayVideoRatio>("720:1280")
    const [videoDuration, setVideoDuration] = useState<number>(10)
    const [videoWithAudio, setVideoWithAudio] = useState<boolean>(true)
    const [videoFrameDataUrl, setVideoFrameDataUrl] = useState<string | null>(null)

    const promptTextareaRef = useRef<HTMLTextAreaElement>(null)

    const MAX_TAGGED_FILES = 2

    const buildMentionTag = useCallback((raw: string, fallbackIndex: number) => {
        const base = raw
            .toLowerCase()
            .replace(/[^a-z0-9_]+/g, "_")
            .replace(/^_+|_+$/g, "")
        const withFallback = base || `ref${fallbackIndex}`
        if (withFallback.length < 3) return `${withFallback}ref`.slice(0, 16)
        return withFallback.slice(0, 16)
    }, [])

    const getMentionedPaths = useCallback((text: string): string[] => {
        const matches = Array.from(text.matchAll(/@([^\s]+)/g)).map((m) => m[1].replace(/[),.;!?]+$/, ""))
        return Array.from(new Set(matches))
    }, [])

    const taggedPaths = useMemo(() => {
        const mentioned = getMentionedPaths(editPrompt)
        const unique = mentioned.filter((p) => p && p !== selectedPath)
        return unique.slice(0, MAX_TAGGED_FILES)
    }, [editPrompt, getMentionedPaths, selectedPath])

    const hasTooManyTags = useMemo(() => {
        const mentioned = getMentionedPaths(editPrompt)
        const unique = mentioned.filter((p) => p && p !== selectedPath)
        return unique.length > MAX_TAGGED_FILES
    }, [editPrompt, getMentionedPaths, selectedPath])

    const getMergedFiles = useAgentToolStore((state) => state.getMergedFiles)
    const mergedFiles = useMemo(() => getMergedFiles(generatedFiles || {}), [getMergedFiles, generatedFiles])

    type MentionItem = { path: string; name: string }
    const mentionCandidates = useMemo<MentionItem[]>(() => {
        const items: MentionItem[] = []
        for (const path of Object.keys(mergedFiles)) {
            if (path === selectedPath) continue
            if (detectFileType(path).category !== "image") continue
            const name = path.split("/").pop() || path
            items.push({ path, name })
        }
        return items.sort((a, b) => a.path.localeCompare(b.path))
    }, [mergedFiles, selectedPath])

    const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
    const [mentionQuery, setMentionQuery] = useState("")
    const [mentionStart, setMentionStart] = useState<number | null>(null)
    const [mentionEnd, setMentionEnd] = useState<number | null>(null)
    const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)

    const filteredMentionCandidates = useMemo(() => {
        const q = mentionQuery.trim().toLowerCase()
        if (!showMentionSuggestions) return []
        const availableSlots = Math.max(0, MAX_TAGGED_FILES - taggedPaths.length)
        if (availableSlots === 0) return []
        if (!q) return mentionCandidates.slice(0, 12)
        const results = mentionCandidates.filter((item) => item.path.toLowerCase().includes(q) || item.name.toLowerCase().includes(q))
        return results.slice(0, 12)
    }, [mentionCandidates, mentionQuery, showMentionSuggestions, taggedPaths.length])

    const closeMentionSuggestions = useCallback(() => {
        setShowMentionSuggestions(false)
        setMentionQuery("")
        setMentionStart(null)
        setMentionEnd(null)
        setSelectedMentionIndex(0)
    }, [])

    const updateMentionSuggestions = useCallback((value: string, caret: number) => {
        const beforeCursor = value.slice(0, caret)
        const atIndex = beforeCursor.lastIndexOf("@")
        if (atIndex === -1) {
            closeMentionSuggestions()
            return
        }
        const query = beforeCursor.slice(atIndex + 1)
        if (/\s/.test(query)) {
            closeMentionSuggestions()
            return
        }
        setMentionStart(atIndex)
        setMentionEnd(caret)
        setMentionQuery(query)
        setShowMentionSuggestions(true)
        setSelectedMentionIndex(0)
    }, [closeMentionSuggestions])

    const insertMention = useCallback((item: MentionItem) => {
        if (mentionStart === null || mentionEnd === null) return
        const currentValue = editPrompt
        const nextValue = `${currentValue.slice(0, mentionStart)}@${item.path} ${currentValue.slice(mentionEnd)}`
        setEditPrompt(nextValue)
        closeMentionSuggestions()
        setTimeout(() => {
            const el = promptTextareaRef.current
            if (!el) return
            const cursor = mentionStart + item.path.length + 2
            el.focus()
            el.setSelectionRange(cursor, cursor)
        }, 0)
    }, [closeMentionSuggestions, editPrompt, mentionEnd, mentionStart])

    const removeTaggedPath = useCallback((path: string) => {
        const next = editPrompt.replaceAll(`@${path} `, "").replaceAll(`@${path}`, "")
        setEditPrompt(next.replace(/\s{2,}/g, " ").trimStart())
    }, [editPrompt])

    const handlePromptKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showMentionSuggestions || filteredMentionCandidates.length === 0) return
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedMentionIndex((prev) => Math.min(prev + 1, filteredMentionCandidates.length - 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedMentionIndex((prev) => Math.max(prev - 1, 0))
        } else if (e.key === "Escape") {
            e.preventDefault()
            closeMentionSuggestions()
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            insertMention(filteredMentionCandidates[selectedMentionIndex])
        }
    }, [closeMentionSuggestions, filteredMentionCandidates, insertMention, selectedMentionIndex, showMentionSuggestions])

    const urlToBase64 = useCallback(async (url: string): Promise<{ base64: string; mimeType: string }> => {
        if (url.startsWith("data:")) {
            const matches = url.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/)
            if (matches) return { mimeType: matches[1], base64: matches[2] }
        }
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Failed to fetch media (HTTP ${response.status})`)
        const blob = await response.blob()
        const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(String(reader.result || "").split(",")[1] || "")
            reader.onerror = () => reject(new Error("Failed to read media"))
            reader.readAsDataURL(blob)
        })
        return { base64, mimeType: blob.type || "application/octet-stream" }
    }, [])

    const resolveTaggedReferenceImages = useCallback(async () => {
        const mentioned = getMentionedPaths(editPrompt)
            .filter((p) => p && p !== selectedPath)
            .slice(0, MAX_TAGGED_FILES)

        const refs: Array<{ base64: string; mimeType?: string; tag?: string }> = []

        for (let index = 0; index < mentioned.length; index++) {
            const path = mentioned[index]
            const content = mergedFiles[path]
            if (!content) continue

            let resolvedUrl: string | undefined = content && (
                content.startsWith("data:") ||
                content.startsWith("http") ||
                content.startsWith("blob:")
            ) ? content : undefined

            if (!resolvedUrl) {
                const urlMatch = content.match(/\**URL:\**\s*(https?:\/\/[^\s\n*)]+)/i)
                    || content.match(/# URL:\s*(https?:\/\/[^\s\n]+)/i)
                    || content.match(/(https?:\/\/[^\s\n*)]+)/i)
                if (urlMatch) resolvedUrl = urlMatch[1]
            }

            if (!resolvedUrl) continue

            const { base64, mimeType } = await urlToBase64(resolvedUrl)
            const tag = buildMentionTag(path.split("/").pop() || `ref${index + 1}`, index + 1)
            refs.push({ base64, mimeType, tag })
        }

        return refs
    }, [MAX_TAGGED_FILES, buildMentionTag, editPrompt, getMentionedPaths, mergedFiles, selectedPath, urlToBase64])

    useEffect(() => {
        if (!isSelectedMedia) {
            setIsMediaEditorOpen(false)
            closeMentionSuggestions()
        }
    }, [closeMentionSuggestions, isSelectedMedia])

    useEffect(() => {
        if (!isMediaEditorOpen) return
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsMediaEditorOpen(false)
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [isMediaEditorOpen])

    useEffect(() => {
        if (!isMediaEditorOpen || selectedCategory !== "video" || !selectedMediaUrl) {
            setVideoFrameDataUrl(null)
            return
        }

        let cancelled = false
        const video = document.createElement("video")
        video.muted = true
        video.playsInline = true
        video.crossOrigin = "anonymous"
        video.src = selectedMediaUrl

        const cleanup = () => {
            try {
                video.pause()
            } catch { }
            video.removeAttribute("src")
            try {
                video.load()
            } catch { }
        }

        const capture = () => {
            if (cancelled) return
            try {
                const canvas = document.createElement("canvas")
                canvas.width = video.videoWidth || 1280
                canvas.height = video.videoHeight || 720
                const ctx = canvas.getContext("2d")
                if (!ctx) return
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                const dataUrl = canvas.toDataURL("image/png")
                setVideoFrameDataUrl(dataUrl)
            } catch {
                setVideoFrameDataUrl(null)
            } finally {
                cleanup()
            }
        }

        const onLoaded = async () => {
            if (cancelled) return
            try {
                video.currentTime = Math.min(0.1, Math.max(0, (video.duration || 1) * 0.05))
            } catch {
                capture()
            }
        }

        const onSeeked = () => capture()
        const onError = () => {
            setVideoFrameDataUrl(null)
            cleanup()
        }

        video.addEventListener("loadeddata", onLoaded)
        video.addEventListener("seeked", onSeeked)
        video.addEventListener("error", onError)

        return () => {
            cancelled = true
            video.removeEventListener("loadeddata", onLoaded)
            video.removeEventListener("seeked", onSeeked)
            video.removeEventListener("error", onError)
            cleanup()
        }
    }, [isMediaEditorOpen, selectedCategory, selectedMediaUrl])

    const handleSubmitMediaEdit = useCallback(async () => {
        if (!selectedCategory || !selectedMediaUrl) return
        if (!editPrompt.trim()) return
        if (hasTooManyTags) return

        setIsEditingMedia(true)
        setEditError(null)
        try {
            if (selectedCategory === "image") {
                const { base64, mimeType } = await urlToBase64(selectedMediaUrl)
                const additionalReferenceImages = await resolveTaggedReferenceImages()
                const resultUrl = await editImageWithRunway(editPrompt.trim(), base64, mimeType, {
                    model: imageModel,
                    ratio: imageRatio,
                    additionalReferenceImages,
                })

                const timestamp = Date.now()
                const editedName = `ed_${String(timestamp).slice(-7)}.png`
                const editedPath = `images/${editedName}`

                addGeneratedFile(editedPath, resultUrl)
                setSelectedAsset({
                    name: editedName,
                    path: editedPath,
                    type: "image",
                    url: resultUrl,
                    content: resultUrl,
                } as any)
            } else if (selectedCategory === "video") {
                const resultUrl = await generateVideoWithRunway(editPrompt.trim(), {
                    model: videoModel,
                    ratio: videoRatio,
                    duration: videoDuration,
                    withAudio: videoWithAudio,
                    promptImage: videoFrameDataUrl || undefined,
                })

                const timestamp = Date.now()
                const editedName = `ed_${String(timestamp).slice(-7)}.mp4`
                const editedPath = `videos/${editedName}`

                addGeneratedFile(editedPath, resultUrl)
                setSelectedAsset({
                    name: editedName,
                    path: editedPath,
                    type: "video",
                    url: resultUrl,
                    content: resultUrl,
                } as any)
            }

            setEditPrompt("")
            setIsMediaEditorOpen(false)
        } catch (err) {
            setEditError(err instanceof Error ? err.message : "Failed to edit media")
        } finally {
            setIsEditingMedia(false)
        }
    }, [addGeneratedFile, editPrompt, hasTooManyTags, imageModel, imageRatio, resolveTaggedReferenceImages, selectedCategory, selectedMediaUrl, setSelectedAsset, urlToBase64, videoDuration, videoFrameDataUrl, videoModel, videoRatio, videoWithAudio])

    if (isLoading) {
        return <ProjectLoader />
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden text-foreground">
            {/* Left Sidebar - Consistent with main app */}
            {!shouldHideSidebar && (
                <div className="shrink-0 transition-all duration-300 relative">
                    <LeftSidebar 
                        isOpen={isSidebarOpen} 
                        stage="build" 
                        setStage={(s) => setStage(s as any)} 
                        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                    />
                </div>
            )}

            {/* Main Builder Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative font-mono">
                <BuilderHeader 
                    projectName={currentProject?.name || "Loading..."}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onPlay={handlePlay}
                    onSave={manualSave}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    hasUnsavedChanges={hasUnsavedChanges}
                />
                
                <div className="flex-1 flex min-h-0 border-t border-border/60 relative overflow-hidden">
                    {/* Left Sidebar - File Explorer */}
                    <BuilderSidebar
                        selectedFile={selectedAsset ? (selectedAsset as any).path : null}
                        onSelectFile={handleSelectFile}
                        onFileCreated={handleFileCreated}
                        projectId={projectId}
                        userId={user?.id}
                        onFileSynced={handleFileSynced}
                        onUploadStateChange={setUploadState}
                    />

                    {/* Middle - Viewer / Upload Overlay */}
                    <div className="flex-1 bg-muted/20 relative min-w-0 border-x border-border/60">
                        <UnifiedViewer />

                        {engineErrors.length > 0 && (
                            <div className="absolute left-4 bottom-4 z-[54] max-w-[720px] w-[min(720px,calc(100%-2rem))]">
                                <div className="rounded-xl border border-border bg-background/95 backdrop-blur-sm shadow-2xl overflow-hidden">
                                    <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                                        <div className="text-xs font-mono font-bold text-foreground">Runtime Errors</div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    const text = engineErrors.map((e) => {
                                                        const time = new Date(e.timestamp).toLocaleTimeString()
                                                        const head = `[${time}] (${e.source}) ${e.message}`
                                                        return e.stack ? `${head}\n${e.stack}` : head
                                                    }).join("\n\n")
                                                    try {
                                                        await navigator.clipboard.writeText(text)
                                                    } catch {
                                                    }
                                                }}
                                                className="text-[11px] font-mono text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted"
                                            >
                                                Copy
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowEngineErrors((v) => !v)}
                                                className="text-[11px] font-mono text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted"
                                            >
                                                {showEngineErrors ? "Hide" : "Show"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEngineErrors([])
                                                    setShowEngineErrors(false)
                                                    try {
                                                        if (projectId) localStorage.removeItem(`koye_runtime_errors_${projectId}`)
                                                    } catch {
                                                    }
                                                }}
                                                className="text-[11px] font-mono text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>
                                    {showEngineErrors && (
                                        <div className="max-h-56 overflow-y-auto">
                                            <pre className="whitespace-pre-wrap break-words text-[11px] leading-relaxed font-mono text-foreground px-3 py-2">
{engineErrors.map((e) => {
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

                        {isSelectedMedia && (
                            <div className="absolute bottom-4 right-4 z-[55]">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMediaEditorOpen(true)
                                        setEditError(null)
                                        setTimeout(() => promptTextareaRef.current?.focus(), 0)
                                    }}
                                    className={cn(
                                        "h-10 px-4 rounded-full flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest",
                                        "bg-foreground text-background border border-foreground/20",
                                        "hover:bg-foreground/90 transition-colors",
                                        isMediaEditorOpen && "opacity-0 pointer-events-none"
                                    )}
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </button>
                            </div>
                        )}

                        <AnimatePresence>
                            {isMediaEditorOpen && isSelectedMedia && (
                                <>
                                    <motion.div
                                        className="absolute inset-0 z-[56] bg-background/40 backdrop-blur-[2px]"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setIsMediaEditorOpen(false)}
                                    />
                                    <motion.div
                                        className="absolute left-3 right-3 bottom-3 z-[57]"
                                        initial={{ y: 32, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 32, opacity: 0 }}
                                        transition={{ type: "spring", damping: 26, stiffness: 260 }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="rounded-2xl border border-border bg-background/95 backdrop-blur-sm shadow-2xl">
                                            <div className="flex items-center justify-between px-4 pt-3">
                                                <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                                    {selectedCategory === "image" ? "Image Edit" : "Video Edit"}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsMediaEditorOpen(false)}
                                                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                                                    aria-label="Close"
                                                >
                                                    <X className="h-4 w-4 text-muted-foreground" />
                                                </button>
                                            </div>

                                            <div className="px-4 pb-4 pt-2">
                                                <div className="relative">
                                                    <textarea
                                                        ref={promptTextareaRef}
                                                        value={editPrompt}
                                                        onChange={(e) => {
                                                            const val = e.target.value
                                                            setEditPrompt(val)
                                                            updateMentionSuggestions(val, e.target.selectionStart ?? val.length)
                                                        }}
                                                        onKeyDown={(e) => {
                                                            handlePromptKeyDown(e)
                                                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                                                e.preventDefault()
                                                                handleSubmitMediaEdit()
                                                            }
                                                        }}
                                                        placeholder="Type to imagine... (use @ to tag project images)"
                                                        disabled={isEditingMedia}
                                                        rows={3}
                                                        className={cn(
                                                            "w-full resize-none rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm text-foreground",
                                                            "placeholder:text-muted-foreground focus:outline-none focus:ring-0",
                                                            isEditingMedia && "opacity-70"
                                                        )}
                                                    />

                                                    {showMentionSuggestions && filteredMentionCandidates.length > 0 && (
                                                        <div className="absolute left-0 right-0 bottom-full mb-2 z-[60]">
                                                            <div className="rounded-xl border border-border bg-background shadow-xl overflow-hidden">
                                                                {filteredMentionCandidates.map((item, idx) => (
                                                                    <button
                                                                        key={item.path}
                                                                        type="button"
                                                                        onClick={() => insertMention(item)}
                                                                        className={cn(
                                                                            "w-full px-3 py-2 text-left font-mono text-xs transition-colors",
                                                                            "hover:bg-muted",
                                                                            idx === selectedMentionIndex && "bg-muted"
                                                                        )}
                                                                    >
                                                                        <div className="flex items-center justify-between gap-3">
                                                                            <span className="truncate text-foreground">{item.name}</span>
                                                                            <span className="truncate text-muted-foreground">{item.path}</span>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {taggedPaths.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {taggedPaths.map((p) => (
                                                            <button
                                                                key={p}
                                                                type="button"
                                                                onClick={() => removeTaggedPath(p)}
                                                                className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 font-mono text-[11px] text-foreground hover:bg-muted transition-colors"
                                                                title={p}
                                                            >
                                                                <span className="max-w-[220px] truncate">{p.split("/").pop() || p}</span>
                                                                <X className="h-3 w-3 text-muted-foreground" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {hasTooManyTags && (
                                                    <div className="mt-2 font-mono text-[11px] text-destructive">
                                                        Tag limit reached (max {MAX_TAGGED_FILES}).
                                                    </div>
                                                )}

                                                {editError && (
                                                    <div className="mt-2 font-mono text-[11px] text-destructive">
                                                        {editError}
                                                    </div>
                                                )}

                                                <div className="mt-4 flex flex-col gap-3">
                                                    {selectedCategory === "image" ? (
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 font-mono text-xs">
                                                                    <span className="text-muted-foreground">Ratio</span>
                                                                    <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0" />
                                                                </div>
                                                                <Select
                                                                    value={imageRatio}
                                                                    onValueChange={(v) => setImageRatio(v as RunwayRatio)}
                                                                    options={[
                                                                        { value: "1024:1024", label: "1:1" },
                                                                        { value: "1360:768", label: "16:9" },
                                                                        { value: "720:1280", label: "9:16" },
                                                                        { value: "1920:1080", label: "HD" },
                                                                        { value: "1080:1920", label: "HD Portrait" },
                                                                        { value: "1080:1080", label: "Square HD" },
                                                                    ]}
                                                                    className="media-dropdown-element"
                                                                />
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 font-mono text-xs">
                                                                    <span className="text-muted-foreground">Model</span>
                                                                    <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0" />
                                                                </div>
                                                                <Select
                                                                    value={imageModel}
                                                                    onValueChange={(v) => setImageModel(v as RunwayImageModel)}
                                                                    options={[
                                                                        { value: "gen4_image_turbo", label: "gen4_image_turbo" },
                                                                        { value: "gen4_image", label: "gen4_image" },
                                                                        { value: "gemini_2.5_flash", label: "gemini_2.5_flash" },
                                                                    ]}
                                                                    className="media-dropdown-element"
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 font-mono text-xs">
                                                                    <span className="text-muted-foreground">Ratio</span>
                                                                    <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0" />
                                                                </div>
                                                                <Select
                                                                    value={videoRatio}
                                                                    onValueChange={(v) => setVideoRatio(v as RunwayVideoRatio)}
                                                                    options={[
                                                                        { value: "1280:720", label: "16:9" },
                                                                        { value: "720:1280", label: "9:16" },
                                                                        { value: "960:960", label: "1:1" },
                                                                        { value: "1104:832", label: "1104:832" },
                                                                        { value: "832:1104", label: "832:1104" },
                                                                        { value: "1584:672", label: "1584:672" },
                                                                    ]}
                                                                    className="media-dropdown-element"
                                                                />
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 font-mono text-xs">
                                                                    <span className="text-muted-foreground">Model</span>
                                                                    <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0" />
                                                                </div>
                                                                <Select
                                                                    value={videoModel}
                                                                    onValueChange={(v) => setVideoModel(v as RunwayVideoModel)}
                                                                    options={[
                                                                        { value: "gen4.5", label: "gen4.5" },
                                                                        { value: "gen4_turbo", label: "gen4_turbo" },
                                                                        { value: "alpha4_turbo", label: "alpha4_turbo" },
                                                                        { value: "gen3a_turbo", label: "gen3a_turbo" },
                                                                        { value: "veo3.1", label: "veo3.1" },
                                                                        { value: "veo3.1_fast", label: "veo3.1_fast" },
                                                                        { value: "veo3", label: "veo3" },
                                                                    ]}
                                                                    className="media-dropdown-element"
                                                                />
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 font-mono text-xs">
                                                                    <span className="text-muted-foreground">Seconds</span>
                                                                    <ChevronDown className="h-3 w-3 text-muted-foreground opacity-0" />
                                                                </div>
                                                                <Select
                                                                    value={String(videoDuration)}
                                                                    onValueChange={(v) => setVideoDuration(Number(v))}
                                                                    options={[
                                                                        { value: "5", label: "5" },
                                                                        { value: "10", label: "10" },
                                                                        { value: "15", label: "15" },
                                                                    ]}
                                                                    className="media-dropdown-element"
                                                                />
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => setVideoWithAudio((prev) => !prev)}
                                                                className={cn(
                                                                    "rounded-full border px-3 py-1.5 font-mono text-xs transition-colors",
                                                                    videoWithAudio
                                                                        ? "border-foreground bg-foreground text-background"
                                                                        : "border-border bg-background text-foreground hover:bg-muted"
                                                                )}
                                                            >
                                                                {videoWithAudio ? "Audio On" : "Audio Off"}
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={handleSubmitMediaEdit}
                                                            disabled={isEditingMedia || !editPrompt.trim() || !selectedMediaUrl || hasTooManyTags}
                                                            className={cn(
                                                                "h-11 w-11 rounded-full flex items-center justify-center transition-all",
                                                                "bg-foreground text-background hover:bg-foreground/90",
                                                                (isEditingMedia || !editPrompt.trim() || !selectedMediaUrl || hasTooManyTags) && "opacity-30 cursor-not-allowed"
                                                            )}
                                                            aria-label="Submit"
                                                        >
                                                            <ArrowUp className={cn("h-5 w-5", isEditingMedia && "opacity-60")} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                        {/* Upload to Project Overlay — covers the viewer area */}
                        {uploadState && uploadState.isUploading && (
                            <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center">
                                <div className="max-w-md w-full p-8">
                                    <div className="flex flex-col items-center mb-8">
                                        <div className="h-14 w-14 rounded-full overflow-hidden border border-border bg-background animate-spin-think mb-4">
                                            <AppIcon className="h-full w-full" alt="Uploading..." />
                                        </div>
                                        <h3 className="font-mono text-lg font-bold text-foreground">
                                            UPLOADING TO PROJECT
                                        </h3>
                                        <p className="font-mono text-xs text-muted-foreground mt-1">
                                            Syncing files to your project
                                        </p>
                                    </div>

                                    <div className="space-y-3 border border-border p-4 bg-background rounded-xl">
                                        {uploadState.files.map((file, idx) => (
                                            <div key={idx} className="flex items-center gap-3 font-mono text-xs">
                                                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                                    {file.status === 'pending' && (
                                                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                                                    )}
                                                    {file.status === 'reading' && (
                                                        <div className="animate-spin h-4 w-4 border-2 border-foreground border-t-transparent rounded-full" />
                                                    )}
                                                    {file.status === 'uploading' && (
                                                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                                                    )}
                                                    {file.status === 'success' && (
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    )}
                                                    {file.status === 'failed' && (
                                                        <X className="h-4 w-4 text-red-600" />
                                                    )}
                                                </div>
                                                <span className="truncate text-foreground flex-1">{file.name}</span>
                                                <span className="text-muted-foreground shrink-0">
                                                    {file.status === 'pending' && 'Waiting...'}
                                                    {file.status === 'reading' && 'Reading...'}
                                                    {file.status === 'uploading' && 'Uploading...'}
                                                    {file.status === 'success' && 'Uploaded ✓'}
                                                    {file.status === 'failed' && 'Failed ✗'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-foreground transition-all duration-500"
                                            style={{ 
                                                width: `${((uploadState.files.filter(f => f.status === 'success' || f.status === 'failed').length) / Math.max(uploadState.files.length, 1)) * 100}%` 
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Welcome Modal */}
            <BuilderWelcomeModal isOpen={showWelcome} onClose={handleCloseWelcome} />
        </div>
    )
}
