import { AnimatePresence, motion } from "framer-motion"
import { Bell, Coins, Crown, Folder, Link2, Sparkles, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import appIcon from "../../assets/icon2.png"
import { useAuth } from "../../hooks/useAuth"
import { usePricing } from "../../hooks/usePricing"
import { cn } from "../../lib/utils"
import { uuidv4 } from "../../lib/uuid"
import { generateChatTitle } from "../../services/chatTitleGenerator"
import { getGameDevSystemPrompt } from "../../services/gameDevPrompt"
import { sendMessageToGemini, sendMessageToGeminiStream, sendMessageToGeminiWithThinking, type GeminiRequestOptions } from "../../services/gemini"
import { routeMessageStream, type ModelSwitchInfo, convertToHyperrealMessages } from "../../services/orchestrator"
import { sendMessageToOpenRouter } from "../../services/openrouter"
import { webSearch, formatSearchResultsForContext } from "../../services/searchapi"
import { buildProjectHistoryPrompt, recordSessionToProjectContext } from "../../services/projectContext"
import { loadProjectFilesFromStorage, saveSingleProjectFile } from "../../services/projectFiles"
import { parseR2Url } from "../../services/r2Storage"
import { parseToolCalls, hasToolCalls, extractToolHints, stripToolMarkersForDisplay } from "../../services/agentToolParser"
import { executeToolInSandbox, applyApprovedChanges, applySandboxChangesToFileMap } from "../../services/agentToolExecutor"
import { isProjectRunnable, buildAutoFixPrompt, type GameRunState } from "../../services/gameReadyDetector"
import { useAgentToolStore } from "../../store/useAgentToolStore"
import { isFileModifyingTool, isReadOnlyTool } from "../../types/agentTools"
import type { SandboxChange } from "../../types/agentTools"
import { ToolApprovalCard } from "./ToolApprovalCard"
import { SearchToolCard, useSearchToolTasks, SearchToolTracker } from "./SearchToolCard"
import { GameReadyBanner } from "./GameReadyBanner"
import { createProject, getProjects } from "../../services/supabase"
import type { Message } from "../../store/useAppStore"
import { useAppStore } from "../../store/useAppStore"
import { useGameDevStore } from "../../store/useGameDevStore"
import { getTaskDisplayName, useTaskStore, type TaskConfig, type TaskType } from "../../store/useTaskStore"
import type { Project } from "../../types"
import { TaskProposalCard } from "../tasks/TaskProposalCard"
import { TaskBar } from "../tasks/TaskBar"
import { useTheme } from "../theme-provider"
import { Button } from "../ui/button"
import { AppIcon } from "../ui/AppIcon"
import { ChatInput } from "./ChatInput"
import { MessageBubble } from "./MessageBubble"
import { ResponseMessage } from "./ResponseMessage"
import { VoiceChatLayout } from "./VoiceChatLayout"
import { useParaliumStore, SCREEN_CATEGORIES } from "../../store/useParaliumStore"
import { ParaliumImageSelector } from "./ParaliumImageSelector"
import { ParaliumStatusCard } from "./ParaliumStatusCard"

export function ChatInterface() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const { subscription } = usePricing({ includeUsage: false })
  const {
    messages,
    addMessage,
    setMessages,
    setIsGenerating,
    isGenerating,
    generatingText,
    currentSessionId,
    updateSessionTitle,
    currentProject,
    setCurrentProject,
    setGeneratedFiles,
    addGeneratedFile,
    selectedModelMode,
    selectedModelId,
    setIsUpgradeModalOpen,
  } = useAppStore()

  // Make sure we type this appropriately if it can be pulled from a higher context or context wrapper
  const setStage = useAppStore(state => state.setStage) 

  const {
    isActive: isGameDevActive,
    currentStep: gameDevStep,
    gameType,
    startFlow: startGameDevFlow,
    setStep: setGameDevStep,
    setGameType,
    saveProjectState,
    loadProjectState
  } = useGameDevStore()

  // Get generatedFiles from store when needed for file references
  const getGeneratedFiles = () => useAppStore.getState().generatedFiles

  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [showKoyeText, setShowKoyeText] = useState(true)
  const [isChatLoading, setIsChatLoading] = useState(false)

  // Trigger loading state briefly whenever session changes
  useEffect(() => {
    setIsChatLoading(true)
    const timeout = setTimeout(() => {
      setIsChatLoading(false)
    }, 600) // 600ms fake loading
    return () => clearTimeout(timeout)
  }, [currentSessionId])

  useEffect(() => {
    const interval = setInterval(() => {
      setShowKoyeText(prev => !prev)
    }, 5000)
    return () => clearInterval(interval)
  }, [])



  // Load projects for the workspace dropdown + connect dialog
  useEffect(() => {
    if (!user) {
      setProjects([])
      return
    }

    let cancelled = false
    const loadProjects = async () => {
      setIsLoadingProjects(true)
      try {
        const userProjects = await getProjects(user.id)
        if (!cancelled) setProjects(userProjects)
      } catch (error) {
        console.error("Error loading projects:", error)
      } finally {
        if (!cancelled) setIsLoadingProjects(false)
      }
    }

    loadProjects()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const handleConnectProject = async (project: Project) => {
    // If there was a previous project, save its state first
    if (currentProject) {
      saveProjectState(currentProject.id)
    }

    setCurrentProject(project)
    setShowConnectDialog(false)

    // Load game dev state for the new project
    loadProjectState(project.id)

    // Load project files immediately
    if (user) {
      try {
        console.log('Loading files for connected project:', project.name)
        const files = await loadProjectFilesFromStorage(
          project.id,
          user.id,
          null
        )

        if (Object.keys(files).length > 0) {
          console.log('Loaded project files:', Object.keys(files))
          setGeneratedFiles(files)
        } else {
          console.log('No files found in project, checking localStorage...')
          // Fallback to localStorage
          const storageKey = `project_${project.id}_files`
          const savedData = localStorage.getItem(storageKey)
          if (savedData) {
            try {
              const parsed = JSON.parse(savedData)
              if (parsed.files && Object.keys(parsed.files).length > 0) {
                console.log('Loaded files from localStorage:', Object.keys(parsed.files))
                // Filter out [STORED_IN_DB:...] markers
                const safeFiles = { ...parsed.files }
                for (const [path, content] of Object.entries(safeFiles)) {
                  if (typeof content === 'string' && content.startsWith('[STORED_IN_DB:')) {
                    delete safeFiles[path]
                  }
                }
                setGeneratedFiles(safeFiles)
              } else {
                setGeneratedFiles({})
              }
            } catch (error) {
              console.error('Error loading from localStorage:', error)
              setGeneratedFiles({})
            }
          } else {
            setGeneratedFiles({})
          }
        }
      } catch (error) {
        console.error('Error loading project files:', error)
      }
    }

    // Persist project connection to localStorage
    if (currentSessionId) {
      localStorage.setItem(`project_${currentSessionId}`, JSON.stringify(project))
    }

    // Mark this session as connected to project for sync
    localStorage.setItem(`chat_project_sync_${currentSessionId}`, project.id)
  }


  // Check for pending project connection from Dashboard
  useEffect(() => {
    const pendingProject = localStorage.getItem('pending_project_connection')
    if (pendingProject && currentSessionId) {
      try {
        const project = JSON.parse(pendingProject) as Project

        // Disconnect any previous project
        if (currentProject) {
          saveProjectState(currentProject.id)
          localStorage.removeItem(`project_${currentSessionId}`)
          localStorage.removeItem(`chat_project_sync_${currentSessionId}`)
        }

        // Connect the new project
        setCurrentProject(project)
        loadProjectState(project.id)

        // Persist project connection
        localStorage.setItem(`project_${currentSessionId}`, JSON.stringify(project))
        localStorage.setItem(`chat_project_sync_${currentSessionId}`, project.id)

        // Clear the pending connection
        localStorage.removeItem('pending_project_connection')
      } catch (error) {
        console.error("Error connecting pending project:", error)
        localStorage.removeItem('pending_project_connection')
      }
    }
  }, [currentSessionId, currentProject, setCurrentProject, saveProjectState, loadProjectState])


  // Load project connection on mount AND restore on focus (prevent auto-disconnect)
  useEffect(() => {
    const restoreProjectConnection = () => {
      if (currentSessionId) {
        const savedProject = localStorage.getItem(`project_${currentSessionId}`)
        if (savedProject) {
          try {
            const project = JSON.parse(savedProject)
            // Only restore if store doesn't have a project but localStorage does
            const currentStoreProject = useAppStore.getState().currentProject
            if (!currentStoreProject) {
              console.log("Restoring project connection from localStorage:", project.name)
              setCurrentProject(project)
            }
          } catch (error) {
            console.error("Error loading saved project:", error)
          }
        }
      }
    }

    // Restore on mount if no project is set
    if (!currentProject) {
      restoreProjectConnection()
    }

    // Also restore when window regains focus (handles tab switching, navigation, etc.)
    window.addEventListener("focus", restoreProjectConnection)

    // Also listen for visibility changes (handles browser minimizing/maximizing)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        restoreProjectConnection()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("focus", restoreProjectConnection)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [currentSessionId, currentProject, setCurrentProject])

  // Load project files when project is connected and FILE mode is active
  useEffect(() => {
    if (currentProject && user) {
      const loadFiles = async () => {
        try {
          const files = await loadProjectFilesFromStorage(
            currentProject.id,
            user.id,
            null
          )

          if (Object.keys(files).length > 0) {
            // Merge with existing files, prioritizing loaded project files
            const currentFiles = useAppStore.getState().generatedFiles
            setGeneratedFiles({ ...currentFiles, ...files })
          } else {
            // Fallback to localStorage
            const storageKey = `project_${currentProject.id}_files`
            const savedData = localStorage.getItem(storageKey)
            if (savedData) {
              try {
                const parsed = JSON.parse(savedData)
                if (parsed.files && Object.keys(parsed.files).length > 0) {
                  const currentFiles = useAppStore.getState().generatedFiles
                  // Filter out [STORED_IN_DB:...] markers so we don't accidentally corrupt local state
                  const safeFiles = { ...parsed.files }
                  for (const [path, content] of Object.entries(safeFiles)) {
                    if (typeof content === 'string' && content.startsWith('[STORED_IN_DB:')) {
                      // Remove it from the update so the current valid file remains
                      delete safeFiles[path]
                    }
                  }
                  setGeneratedFiles({ ...currentFiles, ...safeFiles })
                }
              } catch (error) {
                console.error('Error loading from localStorage:', error)
              }
            }
          }
        } catch (error) {
          console.error('Error loading project files:', error)
        }
      }

      loadFiles()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.id, user?.id])


  const handleCreateProject = async () => {
    if (!user || !newProjectName.trim()) return

    setIsCreatingProject(true)

    try {
      // Create project in Supabase
      const newProject = await createProject({
        userId: user.id,
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || "",
      })

      // Update local state
      setProjects((prev) => [newProject, ...prev])
      setCurrentProject(newProject)
      setNewProjectName("")
      setNewProjectDescription("")
      setShowCreateProjectDialog(false)

      // Persist project connection to localStorage
      if (currentSessionId) {
        localStorage.setItem(`project_${currentSessionId}`, JSON.stringify(newProject))
        localStorage.setItem(`chat_project_sync_${currentSessionId}`, newProject.id)
      }
    } catch (error) {
      console.error("Error creating project:", error)
      alert(error instanceof Error ? error.message : "Failed to create project. Please try again.")
    } finally {
      setIsCreatingProject(false)
    }
  }





  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [streamingContent, setStreamingContent] = useState<string>("")
  const [thinkingText, setThinkingText] = useState<string>("")
  const [isThinking, setIsThinking] = useState<boolean>(false)
  const [isImageGenerating, setIsImageGenerating] = useState<boolean>(false)
  const [isSwitchingModel, setIsSwitchingModel] = useState<boolean>(false)
  const [switchingMessage, setSwitchingMessage] = useState<string>("")
  const shouldStopRef = useRef<boolean>(false)
  const titleGeneratedRef = useRef<boolean>(false)
  const [toolExecutionHints, setToolExecutionHints] = useState<string[]>([])
  const searchToolTasks = useSearchToolTasks()
  const pendingStreamBufferRef = useRef<string>("")
  const renderedStreamTextRef = useRef<string>("")
  const streamDrainTimerRef = useRef<number | null>(null)

  // ── Auto-Run Game State ──
  const [gameRunState, setGameRunState] = useState<GameRunState>('idle')
  const [gameRunErrorCount, setGameRunErrorCount] = useState(0)
  const [gameRunFixAttempt, setGameRunFixAttempt] = useState(0)
  const [showGameBanner, setShowGameBanner] = useState(false)
  const autoFixInProgressRef = useRef(false)
  const MAX_AUTO_FIX_ATTEMPTS = 3

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const stopStreamDrain = () => {
    if (streamDrainTimerRef.current !== null) {
      window.clearInterval(streamDrainTimerRef.current)
      streamDrainTimerRef.current = null
    }
  }

  const resetStreamRenderer = () => {
    stopStreamDrain()
    pendingStreamBufferRef.current = ""
    renderedStreamTextRef.current = ""
  }

  const flushStreamImmediately = (finalText?: string) => {
    const next = typeof finalText === "string"
      ? finalText
      : `${renderedStreamTextRef.current}${pendingStreamBufferRef.current}`
    renderedStreamTextRef.current = next
    pendingStreamBufferRef.current = ""
    setStreamingContent(next)
  }

  const startStreamDrain = () => {
    if (streamDrainTimerRef.current !== null) return
    streamDrainTimerRef.current = window.setInterval(() => {
      if (shouldStopRef.current) {
        stopStreamDrain()
        return
      }
      const buf = pendingStreamBufferRef.current
      if (!buf) return

      const match = buf.match(/^(\S+\s*)/)
      const nextPiece = match ? match[1] : buf[0]
      pendingStreamBufferRef.current = buf.slice(nextPiece.length)
      renderedStreamTextRef.current += nextPiece
      setStreamingContent(renderedStreamTextRef.current)
    }, 18)
  }

  const enqueueStreamChunk = (chunk: string) => {
    if (!chunk) return
    pendingStreamBufferRef.current += chunk
    startStreamDrain()
  }

  // Detect image generation state
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "assistant") {
      if (lastMessage.isGeneratingImage) {
        setIsImageGenerating(true)
      } else if (lastMessage.generatedImages) {
        const hasLoadingImages = lastMessage.generatedImages.some(img => !img.url || img.url === "")
        setIsImageGenerating(hasLoadingImages)
      } else {
        setIsImageGenerating(false)
      }
    } else {
      setIsImageGenerating(false)
    }
  }, [messages])

  // Detect game engine trigger phrases (2D and 3D)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== "assistant") return

    const content = lastMessage.content.toLowerCase()

    // Check for 2D game engine trigger phrases
    const engine2DTriggers = [
      "opening 2d game engine",
      "launching 2d game engine",
      "opening phaser game engine",
      "launching phaser engine",
      "opening the 2d game engine now",
      "launching the 2d game engine now",
      "let's test your game in the 2d engine",
      "opening game engine to test your assets"
    ]

    // Check for 3D game engine trigger phrases
    const engine3DTriggers = [
      "opening 3d game engine",
      "launching 3d game engine",
      "opening babylon game engine",
      "launching babylon engine",
      "opening the 3d game engine now",
      "launching the 3d game engine now",
      "let's test your game in the 3d engine",
      "opening game engine to view your 3d models",
      "let's preview your 3d models in the game engine"
    ]

    const shouldOpen2DEngine = engine2DTriggers.some(trigger => content.includes(trigger))
    const shouldOpen3DEngine = engine3DTriggers.some(trigger => content.includes(trigger))

    if (shouldOpen2DEngine) {
      // Open 2D game engine in new tab
      const engineUrl = `${window.location.origin}/phaser-2d-engine`
      window.open(engineUrl, '_blank', 'noopener,noreferrer')
    } else if (shouldOpen3DEngine) {
      // Open 3D game engine in new tab
      const engineUrl = currentProject
        ? `${window.location.origin}/play/${currentProject.id}`
        : `${window.location.origin}/game-engine`
      window.open(engineUrl, '_blank', 'noopener,noreferrer')
    }
  }, [messages])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isGenerating, streamingContent, thinkingText, isThinking, isImageGenerating])

  const handleStop = () => {
    shouldStopRef.current = true
    setIsGenerating(false)
    setIsThinking(false)
    flushStreamImmediately()
    stopStreamDrain()

    // Abort any in-flight API calls (3D model generation, image generation, etc.)
    const controller = (window as any).__generationAbortController
    if (controller) {
      controller.abort()
      delete (window as any).__generationAbortController
    }

    // Save current streaming content if any
    if (streamingContent && streamingMessageId) {
      const assistantMessage: Message = {
        id: streamingMessageId,
        role: "assistant",
        content: streamingContent,
        timestamp: new Date(),
      }
      addMessage(assistantMessage)
    }

    // Clean up
    setStreamingMessageId(null)
    setStreamingContent("")
    setThinkingText("")
    resetStreamRenderer()

    // Note: The streaming loop will check shouldStopRef and break naturally
  }

  const handleSend = async (content: string, images: File[], mentionedFiles: string[] = []) => {
    // Reset title generation flag for new conversations
    const state = useAppStore.getState()
    const currentSession = state.sessions.find(s => s.id === state.currentSessionId)
    if (currentSession && currentSession.messages.length === 0) {
      titleGeneratedRef.current = false
    }

    // Check for Game Dev Flow command
    if (content.trim().toLowerCase() === "/gamedev") {
      startGameDevFlow()
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: "Start Game Dev Flow",
        timestamp: new Date(),
      }
      addMessage(userMessage)

      // Trigger AI to start the flow
      handleSend("Let's start the 3D game development flow. Please ask me about my game description.", [])
      return
    }

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      images: images.length > 0 ? images.map((img) => URL.createObjectURL(img)) : undefined,
      timestamp: new Date(),
    }
    addMessage(userMessage)

    // Check if this is a confirmation message at an asset generation step
    // If so, show a task proposal card instead of triggering immediately
    const confirmationWords = ["proceed", "yes", "confirm", "go ahead", "sure", "do it", "let's go", "generate", "start", "ok", "okay", "yep", "yeah", "affirmative", "approved", "let's do it", "go for it"]
    const contentLower = content.trim().toLowerCase()
    const isConfirmation = confirmationWords.some(word => contentLower === word || contentLower.startsWith(word + " ") || contentLower.startsWith(word + ",") || contentLower.startsWith(word + ".") || contentLower.startsWith(word + "!"))

    if (isConfirmation && isGameDevActive) {
      // Determine what type of asset generation should be triggered based on the game dev step
      const { gameType: storeGameType } = useGameDevStore.getState()
      const currentGameType = storeGameType || gameType

      let assetGenType: TaskType | null = null
      const defaultConfig: TaskConfig = {}

      if (currentGameType === "3d") {
        // 3D flow steps (updated):
        // 7/8 = image confirmation, 11/12 = 3D model confirmation, 20 = animation, 28 = audio
        if (gameDevStep >= 6 && gameDevStep <= 9) {
          assetGenType = "image-generation"
          defaultConfig.imageCount = 4
          defaultConfig.imageResolution = "1024"
        }
        else if (gameDevStep >= 10 && gameDevStep <= 13) {
          assetGenType = "3d-model"
          defaultConfig.modelResolution = "1024"
          defaultConfig.includeTexture = true
          defaultConfig.aiModel = "hitem3d" // default to image-to-3d

          // Try to find the 4 views from recent messages
          const recentMsgs = useAppStore.getState().messages
          const lastImgMsg = recentMsgs.slice().reverse().find(m => m.generatedImages && m.generatedImages.length > 0)
          
          if (lastImgMsg?.generatedImages?.length) {
              const images = lastImgMsg.generatedImages
              
              const front = images.find(img => img.view === 'front')?.url || images[0]?.url
              const left = images.find(img => img.view === 'left')?.url || images[1]?.url
              const right = images.find(img => img.view === 'right')?.url || images[2]?.url
              const back = images.find(img => img.view === 'back')?.url || images[3]?.url
              
              const extractName = (url?: string) => url ? (url.includes('/') ? url.split('/').pop() || url : url) : ""
              
              defaultConfig.sourceImage = extractName(front)
              defaultConfig.leftImage = extractName(left)
              defaultConfig.rightImage = extractName(right)
              defaultConfig.backImage = extractName(back)
          }
        }
        else if (gameDevStep >= 19 && gameDevStep <= 21) assetGenType = "animation-generation"
        else if (gameDevStep >= 27 && gameDevStep <= 29) assetGenType = "audio-generation"
      } else if (currentGameType === "2d") {
        // 2D flow steps (updated):
        // 7/8/9 = image confirmation, 12/13 = sprite, 17/18 = audio
        if (gameDevStep >= 6 && gameDevStep <= 9) {
          assetGenType = "image-generation"
          defaultConfig.imageCount = 4
          defaultConfig.imageResolution = "1024"
        }
        else if (gameDevStep >= 11 && gameDevStep <= 13) assetGenType = "sprite-generation"
        else if (gameDevStep >= 17 && gameDevStep <= 18) assetGenType = "audio-generation"
      }

      if (assetGenType) {
        // Show a task proposal card instead of directly calling API
        useTaskStore.getState().proposeTask(assetGenType, defaultConfig)
        return
      }
    }

    setIsGenerating(true)
    setStreamingContent("")
    setThinkingText("")
    resetStreamRenderer()

    try {
      // Convert images to base64 for Gemini
      const imageParts = await Promise.all(
        images.map(async (file) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              const base64String = reader.result as string
              resolve(base64String.split(",")[1])
            }
            reader.readAsDataURL(file)
          })
          return {
            inlineData: {
              mimeType: file.type,
              data: base64,
            },
          }
        })
      )

      // Handle file references when project is connected (@filename)
      let processedContent = content
      let projectContext = ""

      if (currentProject) {
        const files = getGeneratedFiles() || {}
        const fileList = Object.keys(files)

        // Build a list of existing project files for context
        const existingFilesContext = fileList.length > 0
          ? `\n\nEXISTING PROJECT FILES:\n${fileList.map(f => `- ${f}`).join('\n')}`
          : '\n\n(No files in project yet)'

        // Build project history from previous chat sessions
        const projectHistory = buildProjectHistoryPrompt(currentProject.id)
        const screenStatus = currentProject.initialGameScreenSelected ? "TRUE" : "FALSE"

        // Add project context to inform AI about file operation capabilities
        projectContext = `\n\n[PROJECT CONTEXT]
Connected Project: "${currentProject.name}" (ID: ${currentProject.id})
Initial Game Screens Selected: ${screenStatus} (If FALSE, remind the user to click the 'Search Reference Game Screens' button in the UI to select their game UI references)

${projectHistory}IMPORTANT: You have FULL PERMISSION to create, edit, and delete files in this project.
When the user EXPLICITLY asks you to add code, modify files, or create new files - DO IT using the tool call markers below.
Do NOT just show code snippets - actually save them to the project files.
CRITICAL: Only make file changes when the user explicitly requests them. Do NOT auto-create or auto-edit files based on casual conversation, greetings, or general discussion.
If there is a PROJECT HISTORY section above, use it to understand what has been done in previous chat sessions.
Continue from where the previous sessions left off. Do NOT repeat or re-create work that was already done.

SCRIPT RUNTIME REFERENCE:
If the user asks you to write game logic (.js/.ts), remember:
- Scripts MUST export a \`setup(ctx)\` function or define lifecycle hooks (\`start\`, \`update\`, \`destroy\`) at the top level.
- Context provides: \`ctx.scene\`, \`ctx.engine\`, \`ctx.mesh\`, \`ctx.BabylonCore\`, \`ctx.GUI\`, \`ctx.getFileUrl(path)\`.
- ALWAYS use \`ctx.getFileUrl("filename.png")\` for loading assets from the VFS.
- Scripts are auto-discovered and run. The main entry point is typically \`main.js\`.

PROJECT FILE/FOLDER TOOLS — ALWAYS use the structured format:

STRUCTURED FORMAT (REQUIRED — most reliable):
- [TOOL_CALL: create_file, { "path": "path/to/file.ext", "content": "..." }]
- [TOOL_CALL: edit_file, { "path": "path/to/file.ext", "content": "..." }]
- [TOOL_CALL: delete_file, { "path": "path/to/file.ext" }]
- [TOOL_CALL: create_folder, { "path": "path/to/folder" }]
- [TOOL_CALL: delete_folder, { "path": "path/to/folder" }]
- [TOOL_CALL: rename_file, { "path": "path/to/file.ext", "newName": "new-file.ext" }]
- [TOOL_CALL: move_file, { "path": "path/to/file.ext", "destination": "path/to/new/file.ext" }]
- [TOOL_CALL: copy_file, { "path": "path/to/file.ext", "destination": "path/to/copy.ext" }]
- [TOOL_CALL: get_file_contents, { "path": "path/to/file.ext" }]
- [TOOL_CALL: list_files, { "path": "optional/folder/prefix" }]
- [TOOL_CALL: search_codebase, { "query": "text to find", "filePattern": "optional-hint" }]
- [TOOL_CALL: replace_code, { "path": "path/to/file.ext", "search": "exact old code", "replace": "new code", "replaceAll": true }]

LEGACY (backward compatible) markers — only if structured format fails:
- Create file:   [CREATE_FILE: path/to/file.ext, file content here]
- Edit file:     [EDIT_FILE: path/to/file.ext, complete new file content here]
- Delete file:   [DELETE_FILE: path/to/file.ext]
- Edit image:    [EDIT_IMAGE: path_to_image, instructions_for_edit, preferred_model] (Models: nano-banana-edit, nano-banana-pro-edit)

IMPORTANT: The user will be shown a preview of your changes and must approve them before they are saved.
Changes are staged in a sandbox and visible immediately in the editor preview, but NOT committed until approved.

RULES:
0. CRITICAL UI RULE: Do NOT write tool names like "CREATE_FILE:" or "create_file" in normal chat text. Only emit tool calls using the marker formats above. Keep your human-facing text clean and natural.
1. EDITING EXISTING FILES — USE replace_code AS YOUR PRIMARY TOOL:
   - When the user asks to modify, update, add to, or fix an existing file, you MUST use replace_code.
   - replace_code sends only the exact search string and its replacement — this is SAFE and will NOT destroy the rest of the file.
   - Example: [TOOL_CALL: replace_code, { "path": "src/main.js", "search": "const x = 1;", "replace": "const x = 42;\nconst y = 100;", "replaceAll": false }]
   - For INSERTING new code: search for the line ABOVE or BELOW where you want to insert, then include that line plus the new code in "replace".
   - For REMOVING code: set "replace" to an empty string "".
   - You may emit MULTIPLE replace_code calls in one response for different sections of the same file.
2. edit_file — ONLY for full file rewrites:
   - Use edit_file ONLY when the MAJORITY (>70%) of the file content is changing (e.g., complete rewrite, restructuring the entire file).
   - When using edit_file, include the COMPLETE new file content.
   - NEVER use edit_file for small/medium edits — it replaces the ENTIRE file and can destroy content.
3. When user says "create a new file" - use CREATE_FILE.
4. CRITICAL: When using structured format, ALL string values in the JSON must be properly escaped. Newlines must be \\n, tabs must be \\t, quotes must be \\", and backslashes must be \\\\. Invalid JSON will cause the tool call to fail.
5. If a file was recently discussed, you can continue editing it without the user using @mention.
6. Remember which files you've created/edited in this conversation.
7. When editing images, if the user doesn't specify a model, ask them or use the default (nano-banana-edit). Always provide the full file path.
8. Only create or update a file named "game-context.md" when the user EXPLICITLY asks you to save, track, document, or record their game idea (e.g. "save my game idea", "track this", "update the game context", "document the idea"). Do NOT auto-create this file just because the user mentions the game or discusses ideas casually. When you do create/update it, use CREATE_FILE or EDIT_FILE and fill it with a refined version of the user's idea.
9. If the user asks to modify/update/add details to an existing file, DO NOT stop at read-only tools (like get_file_contents/list_files/search_codebase). In the SAME response, you MUST also emit at least one file-modifying tool call (replace_code/edit_file/etc.) that performs the requested change.
10. Never return only a filename or only read-only tool calls for an edit request. Always include a short natural-language response plus the required file-modifying tool call(s).
11. COMMON MISTAKE TO AVOID: Do NOT use edit_file with just a small snippet of code. That will ERASE the rest of the file. Use replace_code instead for targeted changes.
12. CRITICAL — DO NOT MAKE UNSOLICITED FILE CHANGES: NEVER edit, create, or delete any file UNLESS the user has explicitly and clearly asked you to do so in their latest message. Casual conversation, greetings, questions, or discussions about the game do NOT count as permission to modify files. Only the game-context.md exception in rule 8 applies, and even that requires the user to explicitly request it.

COMPLEXITY SELF-ASSESSMENT:
- You are currently running as Gemini Flash — optimized for fast, lightweight coding tasks.
- If you are CONFIDENT you can handle the user's request correctly, proceed immediately.
- User-requested code is CRITICALLY IMPORTANT — accuracy matters more than speed.
- For complex multi-file systems, large refactors, or deep architectural work, note: "[NEEDS_ADVANCED_MODEL]" in your response so the system can route to a more powerful model if needed.
${existingFilesContext}`

        const fileContents: string[] = []
        const deduplicatedMentions = new Set<string>()

        const attachReferencedFile = async (filePath: string) => {
          if (deduplicatedMentions.has(filePath)) return
          deduplicatedMentions.add(filePath)

          const fileContent = files[filePath] || files[`assets/${filePath}`] || files[`src/${filePath}`] || files[`assets/images/${filePath}`] || files[`assets/models/${filePath}`]
          if (!fileContent) return

          const isImage = /\.(png|jpg|jpeg|webp|gif)$/i.test(filePath)

          if (isImage) {
            let url = fileContent
            if (!url.startsWith("http") && !url.startsWith("data:") && !url.startsWith("blob:")) {
              const urlMatch = url.match(/\**URL:\**\s*(https?:\/\/[^\s\n*)]+)/i) || url.match(/# URL:\s*(https?:\/\/[^\s\n]+)/i)
              if (urlMatch) {
                url = urlMatch[1]
              }
            }

            if (url && (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:'))) {
              try {
                let fetchUrl = url
                const parsedR2 = parseR2Url(fetchUrl)
                const workerUrl = import.meta.env.VITE_R2_WORKER_URL as string | undefined
                if (parsedR2 && workerUrl) {
                  fetchUrl = `${workerUrl.replace(/\/+$/, "")}/file/${parsedR2.userId}/${parsedR2.r2Key}`
                }

                if (fetchUrl.startsWith('data:')) {
                  const parts = fetchUrl.split(',')
                  const mime = parts[0].split(':')[1].split(';')[0]
                  const base64 = parts[1]
                  imageParts.push({ inlineData: { mimeType: mime, data: base64 } })
                } else {
                  const response = await fetch(fetchUrl)
                  if (response.ok) {
                    const blob = await response.blob()
                    const base64 = await new Promise<string>((resolve) => {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        const b64 = reader.result as string
                        resolve(b64.split(",")[1])
                      }
                      reader.readAsDataURL(blob)
                    })
                    imageParts.push({ inlineData: { mimeType: blob.type, data: base64 } })
                  }
                }
                fileContents.push(`[Attached Image File]: ${filePath}`)
                return
              } catch (e) {
                console.error("Failed to fetch image for mention:", e)
              }
            }
          }

          // Fallback to text if not an image or if attach failed
          fileContents.push(`File: ${filePath}\n\`\`\`\n${fileContent}\n\`\`\``)
        }

        // Process explicitly mentioned files
        if (mentionedFiles.length > 0) {
          for (const filePath of mentionedFiles) {
            await attachReferencedFile(filePath)
          }
        }

        // Also check for regex matches in the text (legacy/fallback)
        if (content.includes("@")) {
          const fileRefRegex = /@([^\s]+)/g
          const fileRefs = Array.from(content.matchAll(fileRefRegex))

          for (const match of fileRefs) {
            await attachReferencedFile(match[1])
          }
        }

        // Append file contents to the message
        if (fileContents.length > 0) {
          processedContent = `${content}\n\nReferenced files:\n${fileContents.join("\n\n")}`
        }
      } else {
        projectContext = `\n\n[PROJECT CONTEXT]
You are NOT currently connected to any project.
IMPORTANT RULE: If the user starts describing a game idea or starts to talk anything about building a game, YOU MUST include the EXACT marker "[CONNECT_PROJECT_REQUIRED]" somewhere in your response. This will prompt the user in the UI to connect to a project or create one.`
      }

      // Append project context
      if (projectContext) {
        processedContent = processedContent + projectContext
      }

      // Inject Game Dev System Prompt if active or detecting type
      let systemPrompt = ""
      if (selectedModelMode === "paralium") {
        const { getParaliumIdeaIntakePrompt } = await import("../../services/paraliumService")
        systemPrompt = getParaliumIdeaIntakePrompt()
      } else if (isGameDevActive || gameType === null) {
        systemPrompt = getGameDevSystemPrompt(gameDevStep, gameType, !!currentProject)
      }

      const rawGeminiMessages: Array<{
        role: "user" | "model"
        parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>
      }> = [
          ...(systemPrompt ? [{
            role: "user" as const,
            parts: [{ text: "SYSTEM INSTRUCTION: " + systemPrompt }]
          }] : []),
          ...(Array.isArray(messages) ? messages : []).map((msg) => ({
            role: (msg.role === "user" ? "user" : "model") as "user" | "model",
            parts: [{ text: msg.content }],
          })),
          {
            role: "user" as const,
            parts: [
              ...(processedContent ? [{ text: processedContent }] : []),
              ...imageParts,
            ],
          },
        ]

      // Gemini API strictly requires alternating user/model roles.
      // Collapse any consecutive messages of the same role.
      const geminiMessages: typeof rawGeminiMessages = []
      for (const msg of rawGeminiMessages) {
        // Skip completely empty messages
        if (msg.parts.length === 0 || (msg.parts.length === 1 && !msg.parts[0].text && !msg.parts[0].inlineData)) continue;
        
        if (geminiMessages.length > 0 && geminiMessages[geminiMessages.length - 1].role === msg.role) {
          // Join text parts with double newline if both are text, otherwise just push
          const prevParts = geminiMessages[geminiMessages.length - 1].parts
          const lastPrevPart = prevParts[prevParts.length - 1]
          const firstNewPart = msg.parts[0]
          
          if (lastPrevPart && lastPrevPart.text && firstNewPart && firstNewPart.text) {
             lastPrevPart.text += "\n\n" + firstNewPart.text
             geminiMessages[geminiMessages.length - 1].parts = [...prevParts.slice(0, -1), lastPrevPart, ...msg.parts.slice(1)]
          } else {
             geminiMessages[geminiMessages.length - 1].parts.push(...msg.parts)
          }
        } else {
          geminiMessages.push({ ...msg, parts: [...msg.parts] })
        }
      }

      const assistantMessageId = uuidv4()
      setStreamingMessageId(assistantMessageId)
      shouldStopRef.current = false

      // Show thinking state initially
      setIsThinking(true)

      // Streaming mode: progressive word-by-word rendering
      let accumulatedText = ""
      let preferredModelId: string | undefined
      let geminiRequestOptions: GeminiRequestOptions | undefined

      try {
        // ─── Orchestrator: classify intent and route to optimal model ───
        const orchestratorStream = routeMessageStream(geminiMessages, {
          mode: selectedModelMode,
          selectedModelId,
        }, (info: ModelSwitchInfo) => {
          preferredModelId = info.preferredModelId || info.modelName
          geminiRequestOptions = preferredModelId?.startsWith("gemini") || preferredModelId?.startsWith("gemma")
            ? {
                preferredModelId,
                allowedModelIds: info.allowedModelIds,
                thinkingLevel: info.thinkingLevel,
              }
            : undefined
          if (info.intent !== "general_chatting") {
            setIsSwitchingModel(true)
            setSwitchingMessage(`Routing to ${info.displayName}...`)
            console.log(`[Orchestrator] Switching to ${info.modelName} for ${info.intent}`)
          }
        })

        // Check first yield — if the generator returns intent ("general" or "light_coding"), use existing Gemini streaming
        const firstResult = await orchestratorStream.next()
        let useGeminiDirect = false

        if (firstResult.done) {
          // Generator returned immediately with intent ("general" or "light_coding")
          useGeminiDirect = true
          setIsSwitchingModel(false)
          setSwitchingMessage("")
        }

        // Determine which stream to consume
        const activeStream = useGeminiDirect 
          ? sendMessageToGeminiStream(geminiMessages, geminiRequestOptions || preferredModelId)
          : (async function* () {
              // Yield the first chunk we already got
              if (!firstResult.done && firstResult.value) {
                yield firstResult.value
              }
              // Continue yielding from orchestrator
              yield* orchestratorStream
            })()

        for await (const chunk of activeStream) {
          // Check if stop was requested
          if (shouldStopRef.current) {
            break
          }

          // Once we start receiving chunks, hide thinking and show streaming
          if (accumulatedText === "" && chunk) {
            setIsThinking(false)
            setThinkingText("")
            setIsSwitchingModel(false)
            setSwitchingMessage("")
          }

          accumulatedText += chunk

          // Strip tool markers from display and show tool hints
          if (hasToolCalls(accumulatedText)) {
            const displayText = stripToolMarkersForDisplay(accumulatedText)
            const hints = extractToolHints(accumulatedText)
            setToolExecutionHints(hints)
            flushStreamImmediately(displayText)
          } else {
            enqueueStreamChunk(chunk)
          }

          // Check again after processing chunk
          if (shouldStopRef.current) {
            break
          }
        }

          // Keep progressive rendering and avoid a sudden final jump.
        if (!shouldStopRef.current && accumulatedText) {
          // ─── Web Search Detection & Round-Trip ───
          const webSearchMatch = accumulatedText.match(/\[WEB_SEARCH:\s*(.+?)\]/)
          if (webSearchMatch) {
            const searchQuery = webSearchMatch[1].trim()
            console.log(`[WebSearch] AI triggered search for: "${searchQuery}"`)

            // Strip the [WEB_SEARCH: ...] marker and any text after it from displayed content
            const contentBeforeSearch = accumulatedText.substring(0, webSearchMatch.index).trim()

            // Show a "searching" message
            flushStreamImmediately(contentBeforeSearch || "Let me search the web for that...")
            setIsThinking(true)
            setThinkingText("🔍 Searching the web...")

            try {
              const searchResults = await webSearch(searchQuery)
              console.log(`[WebSearch] Got ${searchResults.organic.length} organic, ${searchResults.images.length} images, ${searchResults.videos.length} videos`)

              // Inject search results into context and re-ask Gemini
              const searchContext = formatSearchResultsForContext(searchResults)

              const enrichedMessages = [
                ...geminiMessages,
                { role: "model" as const, parts: [{ text: accumulatedText }] },
                { role: "user" as const, parts: [{ text: searchContext }] },
              ]

              // Re-stream with search results context
              setIsThinking(false)
              setThinkingText("")

              let enrichedText = ""

              for await (const chunk of sendMessageToGeminiStream(enrichedMessages, geminiRequestOptions || preferredModelId)) {
                if (shouldStopRef.current) break
                enrichedText += chunk
                enqueueStreamChunk(chunk)
              }

              // Save the enriched response with search results attached
              const finalContent = enrichedText || contentBeforeSearch || accumulatedText
              if (finalContent) {
                flushStreamImmediately(finalContent)
              }

              const assistantMessage: Message = {
                id: assistantMessageId,
                role: "assistant",
                content: finalContent.replace(/\[WEB_SEARCH:[^\]]*\]/g, "").trim(),
                webSearchResults: searchResults,
                timestamp: new Date(),
              }
              addStreamingMessage(assistantMessage)

            parseAndExecuteFileOperations(finalContent, assistantMessageId, 0, preferredModelId, geminiRequestOptions)
              parseAndExecuteGameDevSteps(finalContent)
              if (!titleGeneratedRef.current && currentSessionId) {
                titleGeneratedRef.current = true
                generateTitleForSession()
              }
              if (currentProject && currentSessionId) {
                const freshState = useAppStore.getState()
                const session = freshState.sessions.find(s => s.id === currentSessionId)
                if (session) {
                  recordSessionToProjectContext(
                    currentProject.id,
                    currentProject.name,
                    currentSessionId,
                    session.title,
                    session.messages.map(m => ({ role: m.role, content: m.content }))
                  )
                }
              }
            } catch (searchError) {
              console.error("[WebSearch] Search failed:", searchError)
              setIsThinking(false)
              setThinkingText("")

              // Fall back to the original response without search
              const assistantMessage: Message = {
                id: assistantMessageId,
                role: "assistant",
                content: (contentBeforeSearch || accumulatedText).replace(/\[WEB_SEARCH:[^\]]*\]/g, "").trim() +
                  "\n\n*I tried to search the web but encountered an error. Please try again.*",
                timestamp: new Date(),
              }
              addStreamingMessage(assistantMessage)
            }
          } else {
            // ─── Normal (non-search) response ───
            const parsed = parseToolCalls(accumulatedText)
            const finalContent = parsed.toolCalls.length > 0 ? parsed.strippedContent : accumulatedText

            const assistantMessage: Message = {
              id: assistantMessageId,
              role: "assistant",
              content: finalContent.replace(/\[PARALIUM_IDEA_COMPLETE\][\s\S]*/, "").replace(/\[PARALIUM_IMAGE_SEARCH:[^\]]*\]/g, "").trim() || finalContent,
              timestamp: new Date(),
            }
            addStreamingMessage(assistantMessage)

            // --- PARALIUM COMPLETE CHECK ---
            if (selectedModelMode === "paralium") {
              const { useParaliumStore } = await import("../../store/useParaliumStore")
              const store = useParaliumStore.getState()
              
              if (store.phase === "idle") {
                const { checkIdeaComplete, startParaliumPipeline } = await import("../../services/paraliumService")
                const ideaData = checkIdeaComplete(accumulatedText)
                if (ideaData) {
                  // start pipeline async!
                  startParaliumPipeline(ideaData).catch(console.error)
                } else {
                  // Check for explicit AI image search trigger
                  const imageSearchMatch = accumulatedText.match(/\[PARALIUM_IMAGE_SEARCH:\s*(.+?)\]/)
                  if (imageSearchMatch) {
                    const rawGames = imageSearchMatch[1]
                    const regex = /\*(.*?)\*/g
                    const searchGames = Array.from(rawGames.matchAll(regex)).map(m => m[1].trim())
                    if (searchGames.length > 0) {
                      store.clearAllImageState()
                      store.setReferenceGames(searchGames)
                      store.setCurrentSearchGameIndex(0)
                      // Show the approval gate instead of auto-searching
                      store.setSearchApprovalPending(true)
                      store.setPhase("selecting_images", "Waiting for your approval to start the image search...")
                    }
                  }
                }
              }
            }

            // Parse and execute file operations
            parseAndExecuteFileOperations(accumulatedText, assistantMessageId, 0, preferredModelId, geminiRequestOptions)

            // Parse and execute game dev steps (always check for game type detection)
            parseAndExecuteGameDevSteps(accumulatedText)

            // Generate title after first AI response
            if (!titleGeneratedRef.current && currentSessionId) {
              titleGeneratedRef.current = true
              generateTitleForSession()
            }

            // Record project context after each AI response
            if (currentProject && currentSessionId) {
              const freshState = useAppStore.getState()
              const session = freshState.sessions.find(s => s.id === currentSessionId)
              if (session) {
                recordSessionToProjectContext(
                  currentProject.id,
                  currentProject.name,
                  currentSessionId,
                  session.title,
                  session.messages.map(m => ({ role: m.role, content: m.content }))
                )
              }
            }
          }
        } else if (shouldStopRef.current && accumulatedText) {
          // Save partial content if stopped — but do NOT execute file operations.
          // The user explicitly cancelled, so any tool calls in the partial response
          // should be stripped and ignored.
          const { strippedContent } = parseToolCalls(accumulatedText)
          const assistantMessage: Message = {
            id: assistantMessageId,
            role: "assistant",
            content: strippedContent || accumulatedText,
            timestamp: new Date(),
          }
          addStreamingMessage(assistantMessage)

          // NOTE: We intentionally skip parseAndExecuteFileOperations here.
          // The user pressed stop, so file changes from this request are discarded.

          // Generate title after first AI response
          if (!titleGeneratedRef.current && currentSessionId) {
            titleGeneratedRef.current = true
            generateTitleForSession()
          }
        }
      } catch (streamError) {
        console.error("[ChatInterface] Streaming failed:", streamError)
        const errorMsg = streamError instanceof Error ? streamError.message : String(streamError)

        if (errorMsg.includes("CLOD_FORBIDDEN")) {
          setIsThinking(false)
          setIsSwitchingModel(false)
          setSwitchingMessage("")
          const message: Message = {
            id: assistantMessageId,
            role: "assistant",
            content: `Clod rejected the request (403 Forbidden). This usually means your key is valid but does not have access/credits for this model. Details: ${errorMsg}`,
            timestamp: new Date(),
          }
          addMessage(message)
          return
        }

        if (errorMsg.includes("CLOD_API_KEY_REQUIRED") || errorMsg.includes("CLOD_API_KEY_INVALID") || errorMsg.includes("ALL_CLOD_KEYS_INVALID") || errorMsg.includes("CLOD_NO_ELIGIBLE_KEYS")) {
          setIsThinking(false)
          setIsSwitchingModel(false)
          setSwitchingMessage("")
          const message: Message = {
            id: assistantMessageId,
            role: "assistant",
            content: "Clod model request failed. Set a valid VITE_CLOD_API_KEY (or VITE_CLOD_API_KEY1..N) in your .env, then restart the dev server.",
            timestamp: new Date(),
          }
          addMessage(message)
          return
        }

        // Heavy traffic notification for Minute Exhausted
        if (errorMsg.includes("ALL_GEMINI_KEYS_MINUTE_EXHAUSTED")) {
          setIsThinking(false)
          setIsSwitchingModel(false)
          setSwitchingMessage("")
          const quotaErrorMessage: Message = {
            id: assistantMessageId,
            role: "assistant",
            content: "I'm currently experiencing high demand. Please try again in a moment.",
            timestamp: new Date(),
          }
          addMessage(quotaErrorMessage)
          // Display top notification toast as requested
          try {
            // Using a generic alert/toast if available. You might have a toast component in your app.
            // For now, we will add it to the chat as a system message or standard error message.
            const customEvent = new CustomEvent("toast-notification", { detail: { type: "error", message: "Heavy traffic. Upgrade plan or please try again." } })
            window.dispatchEvent(customEvent)
          } catch(e) {}
          return
        }

        // Fallback to Clod API for Day Exhausted
        if (errorMsg.includes("ALL_GEMINI_KEYS_DAY_EXHAUSTED")) {
          setIsSwitchingModel(true)
          setSwitchingMessage("Daily limit reached. Switching to Clod API (Qwen)...")
          setIsThinking(true)
          setThinkingText("Switching to Qwen 3 235B...")

          // Fade out streaming content
          setStreamingContent("")
          await new Promise(resolve => setTimeout(resolve, 800))

          setIsSwitchingModel(false)
          setSwitchingMessage("")
          setIsThinking(false)
          setThinkingText("")

          try {
            const { sendMessageToClodStream } = await import("../../services/clodapi")
            const msgs = convertToHyperrealMessages(geminiMessages) as any[]
            let clodAccumulatedText = ""

            for await (const chunk of sendMessageToClodStream(msgs)) {
              if (shouldStopRef.current) break
              clodAccumulatedText += chunk
              enqueueStreamChunk(chunk)
            }

            if (!shouldStopRef.current && clodAccumulatedText) {
              flushStreamImmediately(clodAccumulatedText)
              const assistantMessage: Message = {
                id: assistantMessageId,
                role: "assistant",
                content: clodAccumulatedText,
                timestamp: new Date(),
              }
              addStreamingMessage(assistantMessage)
              if (!titleGeneratedRef.current && currentSessionId) {
                titleGeneratedRef.current = true
                generateTitleForSession()
              }
            }
            return
          } catch (clodError) {
             const clodErrorMsg = clodError instanceof Error ? clodError.message : String(clodError)
             if (clodErrorMsg.includes("ALL_CLOD_KEYS_DAY_EXHAUSTED")) {
                 // "if all clodapi is day rate limited, then CHANGE TO ANOTHER GEMINI API" -> Tell user to add a key
                 const errorMessage: Message = {
                   id: assistantMessageId,
                   role: "assistant",
                   content: "All available APIs (Gemini & Clod) have exhausted their daily limits. Please add another Gemini API key in your settings.",
                   timestamp: new Date(),
                 }
                 addMessage(errorMessage)
                 return
             }
             if (clodErrorMsg.includes("ALL_CLOD_KEYS_MINUTE_EXHAUSTED") || clodErrorMsg.includes("429")) {
                 const errorMessage: Message = {
                   id: assistantMessageId,
                   role: "assistant",
                   content: "I'm currently experiencing high demand. Please try again in a moment.",
                   timestamp: new Date(),
                 }
                 addMessage(errorMessage)
                 try {
                   const customEvent = new CustomEvent("toast-notification", { detail: { type: "error", message: "Heavy traffic. Upgrade plan or please try again." } })
                   window.dispatchEvent(customEvent)
                 } catch(e) {}
                 return
             }
             console.error("[ChatInterface] Clod fallback streaming failed:", clodError)
          }
        }

        // Check if it's a quota error (429) - might be switching to base model
        const isQuotaError = errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("Quota exceeded")
        const isImageModelQuota = isQuotaError && errorMsg.includes("image") || errorMsg.includes("gemini-2.5-flash-image")

        // If it's an image model quota error, the streaming function will automatically fallback to base model
        // We need to show a smooth transition
        if (isImageModelQuota) {
          // Show switching animation
          setIsSwitchingModel(true)
          setSwitchingMessage("Switching to base model...")
          setIsThinking(true)
          setThinkingText("Model limit reached. Switching to base model for better availability...")

          // Fade out streaming content
          setStreamingContent("")
          await new Promise(resolve => setTimeout(resolve, 800))

          // The streaming function will automatically retry with base model
          // We'll catch it in the next iteration, but for now show thinking
          setIsSwitchingModel(false)
          setSwitchingMessage("")
          setIsThinking(false)
          setThinkingText("")

          // Try to continue with base model streaming
          try {
            // Re-attempt streaming (the function will use base model now)
            let fallbackAccumulatedText = ""

            for await (const chunk of sendMessageToGeminiStream(geminiMessages, geminiRequestOptions || preferredModelId)) {
              if (shouldStopRef.current) break

              fallbackAccumulatedText += chunk
              enqueueStreamChunk(chunk)
            }

            if (!shouldStopRef.current && fallbackAccumulatedText) {
              flushStreamImmediately(fallbackAccumulatedText)
              const assistantMessage: Message = {
                id: assistantMessageId,
                role: "assistant",
                content: fallbackAccumulatedText,
                timestamp: new Date(),
              }
              addStreamingMessage(assistantMessage)

              // Generate title after first AI response
              if (!titleGeneratedRef.current && currentSessionId) {
                titleGeneratedRef.current = true
                generateTitleForSession()
              }

              // Record project context after fallback AI response
              if (currentProject && currentSessionId) {
                const freshState = useAppStore.getState()
                const session = freshState.sessions.find(s => s.id === currentSessionId)
                if (session) {
                  recordSessionToProjectContext(
                    currentProject.id,
                    currentProject.name,
                    currentSessionId,
                    session.title,
                    session.messages.map(m => ({ role: m.role, content: m.content }))
                  )
                }
              }

              parseAndExecuteFileOperations(fallbackAccumulatedText, assistantMessageId, 0, preferredModelId, geminiRequestOptions)
            }
            return
          } catch (fallbackStreamError) {
            console.error("[ChatInterface] Fallback streaming failed:", fallbackStreamError)
            // If fallback streaming also fails, continue to error handling below
          }
        }

        // Check if it's a quota error - if so, show helpful message
        if (isQuotaError && !isImageModelQuota) {
          setIsThinking(false)
          setIsSwitchingModel(false)
          setSwitchingMessage("")
          const quotaErrorMessage: Message = {
            id: assistantMessageId,
            role: "assistant",
            content: "I'm currently experiencing high demand. Please check your API quota or try again in a moment. If you're using the free tier, you may have reached the daily limit.",
            timestamp: new Date(),
          }
          addMessage(quotaErrorMessage)
          return
        }

        // Check if it's a 503 error (model overloaded) - fall back to non-streaming mode
        if (errorMsg.includes("503") || errorMsg.includes("overloaded") || errorMsg.includes("UNAVAILABLE")) {
          // Show switching animation
          setIsSwitchingModel(true)
          setSwitchingMessage("Switching to standard mode...")
          setIsThinking(true)
          setThinkingText("Service overloaded. Switching to standard response mode...")

          // Fade out streaming content
          setStreamingContent("")
          await new Promise(resolve => setTimeout(resolve, 800))

          setIsSwitchingModel(false)
          setSwitchingMessage("")
          setIsThinking(false)
          setThinkingText("")

          try {
            // Fall back to non-streaming mode
            let response = ""
            if (preferredModelId && !preferredModelId.startsWith("gemini")) {
              const openRouterMessages = convertToHyperrealMessages(geminiMessages) as any[]
              response = await sendMessageToOpenRouter(
                preferredModelId,
                openRouterMessages,
                0.8,
                undefined,
                { reasoningEnabled: preferredModelId === "nvidia/nemotron-3-super-120b-a12b:free" }
              )
            } else {
              response = await sendMessageToGemini(geminiMessages, geminiRequestOptions || preferredModelId)
            }

            const assistantMessage: Message = {
              id: assistantMessageId,
              role: "assistant",
              content: response,
              timestamp: new Date(),
            }
            addMessage(assistantMessage)
            
            parseAndExecuteFileOperations(response, assistantMessageId, 0, preferredModelId, geminiRequestOptions)
            parseAndExecuteGameDevSteps(response)

            // Generate title after first AI response
            if (!titleGeneratedRef.current && currentSessionId) {
              titleGeneratedRef.current = true
              generateTitleForSession()
            }

            // Record project context after fallback non-streaming response
            if (currentProject && currentSessionId) {
              const freshState = useAppStore.getState()
              const session = freshState.sessions.find(s => s.id === currentSessionId)
              if (session) {
                recordSessionToProjectContext(
                  currentProject.id,
                  currentProject.name,
                  currentSessionId,
                  session.title,
                  session.messages.map(m => ({ role: m.role, content: m.content }))
                )
              }
            }
            return
          } catch (fallbackError) {
            console.error("[ChatInterface] Non-streaming fallback failed:", fallbackError)
            // If fallback also fails, show error
            const fallbackErrorMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
            const errorMessage: Message = {
              id: assistantMessageId,
              role: "assistant",
              content: fallbackErrorMsg.includes("503") || fallbackErrorMsg.includes("overloaded")
                ? "The service is currently overloaded. Please try again in a few moments."
                : "Sorry, I encountered an error processing your request. Please try again.",
              timestamp: new Date(),
            }
            addMessage(errorMessage)
            return
          }
        }

        // For other errors, try thinking mode as fallback
        setIsSwitchingModel(true)
        setSwitchingMessage("Switching to thinking mode...")
        setIsThinking(true)
        setThinkingText("Analyzing your request...")

        // Fade out streaming content
        setStreamingContent("")
        await new Promise(resolve => setTimeout(resolve, 600))

        setIsSwitchingModel(false)
        setSwitchingMessage("")

        try {
          const { response, thinking } = await sendMessageToGeminiWithThinking(geminiMessages, geminiRequestOptions || preferredModelId)

          setThinkingText(thinking || "Processing complete.")

          // Show thinking text briefly, then show response
          await new Promise(resolve => setTimeout(resolve, 1000))

          setIsThinking(false)
          setThinkingText("")

          const assistantMessage: Message = {
            id: assistantMessageId,
            role: "assistant",
            content: response,
            timestamp: new Date(),
          }
          addMessage(assistantMessage)

          parseAndExecuteFileOperations(response, assistantMessageId, 0, preferredModelId, geminiRequestOptions)
          parseAndExecuteGameDevSteps(response)

          // Generate title after first AI response
          if (!titleGeneratedRef.current && currentSessionId) {
            titleGeneratedRef.current = true
            generateTitleForSession()
          }

          // Record project context after thinking mode response
          if (currentProject && currentSessionId) {
            const freshState = useAppStore.getState()
            const session = freshState.sessions.find(s => s.id === currentSessionId)
            if (session) {
              recordSessionToProjectContext(
                currentProject.id,
                currentProject.name,
                currentSessionId,
                session.title,
                session.messages.map(m => ({ role: m.role, content: m.content }))
              )
            }
          }
        } catch (thinkingError) {
          console.error("[ChatInterface] Thinking mode fallback failed:", thinkingError)
          // If thinking mode also fails, show error
          setIsThinking(false)
          setIsSwitchingModel(false)
          setSwitchingMessage("")
          const thinkingErrorMessage = thinkingError instanceof Error ? thinkingError.message : String(thinkingError)
          const errorMessage: Message = {
            id: assistantMessageId,
            role: "assistant",
            content: thinkingErrorMessage.includes("quota") || thinkingErrorMessage.includes("429")
              ? "API quota exceeded. Please check your billing or try again later."
              : thinkingErrorMessage.includes("503") || thinkingErrorMessage.includes("overloaded")
                ? "The service is currently overloaded. Please try again in a few moments."
                : "Sorry, I encountered an error processing your request. Please try again.",
            timestamp: new Date(),
          }
          addMessage(errorMessage)
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      addMessage(errorMessage)
    } finally {
      stopStreamDrain()
      setIsGenerating(false)
      setStreamingMessageId(null)
      setStreamingContent("")
      setThinkingText("")
      setIsThinking(false)
      setIsSwitchingModel(false)
      setSwitchingMessage("")
      setToolExecutionHints([])
      resetStreamRenderer()
    }
  }

  // Parse and execute file operations from AI response — NEW SANDBOX PIPELINE
  const parseAndExecuteFileOperations = async (
    content: string,
    messageId?: string,
    depth: number = 0,
    preferredModelId?: string,
    geminiRequestOptions?: GeminiRequestOptions
  ) => {
    // Use the new parser to extract tool calls
    const { toolCalls, strippedContent } = parseToolCalls(content)
    if (toolCalls.length === 0) return

    // Separate edit-image calls (handled specially) from file tools
    const editImageCalls = toolCalls.filter(tc => tc.params.__editImage)
    const fileToolCalls = toolCalls.filter(tc => !tc.params.__editImage)

    // Build fileOperations array for message metadata (UI uses this for the compact bars)
    // Prefer real sandbox diff stats (linesAdded/linesRemoved) when available.
    const currentFilesForStats = getGeneratedFiles() || {}
    let sandboxPreviewFilesForStats = { ...currentFilesForStats }
    const statsByToolCallId = new Map<string, SandboxChange[]>()
    for (const tc of fileToolCalls) {
      const { changes } = executeToolInSandbox(tc, sandboxPreviewFilesForStats)
      if (changes.length > 0) {
        statsByToolCallId.set(tc.id, changes)
        sandboxPreviewFilesForStats = applySandboxChangesToFileMap(sandboxPreviewFilesForStats, changes)
      }
    }

    const fileOperations = toolCalls
      .filter(tc => !isReadOnlyTool(tc.tool))
      .map(tc => {
      const changes = statsByToolCallId.get(tc.id) || []
      const primary = changes[0]
      return {
        type: tc.tool === 'create_file' ? 'create' as const
          : tc.tool === 'delete_file' ? 'delete' as const
          : tc.params.__editImage ? 'edit-image' as const
          : 'edit' as const,
        path: tc.params.path,
        content: tc.params.content,
        linesAdded: primary?.linesAdded ?? 0,
        linesRemoved: primary?.linesRemoved ?? 0,
        prompt: tc.params.prompt,
        model: tc.params.model,
      }
    })

    // Update message content: strip markers, attach fileOperations metadata
      if (messageId) {
      const msgs = useAppStore.getState().messages
      const updatedMessages = msgs.map(m =>
        m.id === messageId
          ? {
              ...m,
              content: strippedContent || m.content,
              ...(fileOperations.length > 0 ? { fileOperations } : {}),
            }
          : m
      )
      setMessages(updatedMessages)
    }

    // ── Process file tool calls through the sandbox ──
    const currentFiles = getGeneratedFiles() || {}
    let sandboxPreviewFiles = { ...currentFiles }
    const agentStore = useAgentToolStore.getState()
    const allChanges: SandboxChange[] = []
    const readOnlyResults: Array<{ tool: string; result: unknown }> = []

    for (const toolCall of fileToolCalls) {
      if (isReadOnlyTool(toolCall.tool)) {
        // Read-only tools: execute immediately, no approval needed
        // Deduplicate: avoid re-running if we already have the result in the same stream
        const alreadyRan = agentStore.toolResults.some(r => r.toolCallId === toolCall.id)
        if (!alreadyRan) {
          const { result } = executeToolInSandbox(toolCall, sandboxPreviewFiles)
          if (result) {
            agentStore.addToolResult(result)
            readOnlyResults.push({ tool: toolCall.tool, result: result.result })
            console.log(`[AgentTool] Auto-executed read-only: ${toolCall.tool}`, result.result)

            // Track search/read tool activity for the chat UI
            if (toolCall.tool === "search_codebase") {
              const query = toolCall.params?.query
              const tracker = SearchToolTracker.getInstance()
              tracker.startSearch(toolCall.id, query)
              const filePattern = toolCall.params?.filePattern
              const matchedFiles: string[] = Array.isArray(result?.result?.matches)
                ? Array.from(new Set((result.result.matches as any[]).map((m) => m.path)))
                : Object.keys(sandboxPreviewFiles).filter((p) => !filePattern || p.includes(filePattern))
              tracker.addScannedFiles(toolCall.id, matchedFiles.slice(0, 12))
              tracker.completeSearch(toolCall.id)
            } else if (toolCall.tool === "get_file_contents") {
              const path = toolCall.params?.path
              if (path) {
                const tracker = SearchToolTracker.getInstance()
                tracker.startSearch(toolCall.id, "Reading file")
                tracker.addReadFile(toolCall.id, path)
                tracker.completeSearch(toolCall.id)
              }
            } else if (toolCall.tool === "list_files") {
              const dirPath = toolCall.params?.path || ""
              const tracker = SearchToolTracker.getInstance()
              tracker.startSearch(toolCall.id, dirPath ? `Listing ${dirPath}` : "Listing files")
              const files = Array.isArray(result?.result?.files)
                ? (result.result.files as string[]).slice(0, 12)
                : []
              tracker.addScannedFiles(toolCall.id, files)
              tracker.completeSearch(toolCall.id)
            }
          }
        }
        continue
      }

      if (isFileModifyingTool(toolCall.tool)) {
        // Deduplicate during streaming: if we already have a pending tool call for this exact tool and params, skip
        const isDuplicate = agentStore.pendingToolCalls.some(
          tc => tc.tool === toolCall.tool && 
                JSON.stringify(tc.params) === JSON.stringify(toolCall.params)
        )
        
        if (isDuplicate) continue

        // File-modifying tools: execute in sandbox, stage for approval
        const { changes } = executeToolInSandbox(toolCall, sandboxPreviewFiles)
        if (changes.length > 0) {
          allChanges.push(...changes)
          agentStore.addSandboxChanges(changes)
          agentStore.addPendingToolCall(toolCall)
          sandboxPreviewFiles = applySandboxChangesToFileMap(sandboxPreviewFiles, changes)
        }
      }
    }

    // If model only performed read-only calls during an edit request, continue once with tool results.
    if (
      depth < 1 &&
      fileToolCalls.length > 0 &&
      fileToolCalls.every(tc => isReadOnlyTool(tc.tool)) &&
      allChanges.length === 0
    ) {
      try {
        const state = useAppStore.getState()
        const latestUser = [...state.messages].reverse().find(m => m.role === "user")
        const latestUserText = latestUser?.content || ""
        const toolResultsText = JSON.stringify(readOnlyResults, null, 2)

        const promptText = `You just used read-only tools and did not apply the requested edit.
User request: ${latestUserText}

Tool results:
${toolResultsText}

Now complete the request. REQUIREMENTS:
1) Include a short natural language response.
2) Emit file-modifying tool call(s) to apply the actual change.
3) Do not emit only read-only tool calls.
4) Use structured markers: [TOOL_CALL: edit_file, { "path": "...", "content": "..." }]`

        let continuation = ""

        if (preferredModelId && !preferredModelId.startsWith("gemini")) {
          const openRouterMessages = convertToHyperrealMessages([
            {
              role: "user",
              parts: [{ text: promptText }]
            }
          ])
          continuation = await sendMessageToOpenRouter(
            preferredModelId,
            openRouterMessages,
            0.8,
            undefined,
            { reasoningEnabled: preferredModelId === "nvidia/nemotron-3-super-120b-a12b:free" }
          )
        } else {
          continuation = await sendMessageToGemini([
            {
              role: "user",
              parts: [{ text: promptText }],
            },
          ], geminiRequestOptions || preferredModelId)
        }

        if (continuation?.trim()) {
          await parseAndExecuteFileOperations(continuation, messageId, depth + 1, preferredModelId, geminiRequestOptions)
          return
        }
      } catch (continuationError) {
        console.error("[AgentTool] Continuation pass failed:", continuationError)
      }
    }

    // All changes stay in sandbox — ToolApprovalCards will render for user review.

    // ── Handle EDIT_IMAGE operations (async, special flow) ──
    for (const tc of editImageCalls) {
      const { path, prompt, model } = tc.params
      try {
        const files = getGeneratedFiles() || {}
        let imageUrl = path
        if (files[path]) {
          const fileContent = files[path]
          if (fileContent.startsWith('http') || fileContent.startsWith('data:')) {
            imageUrl = fileContent
          } else {
            const urlMatch = fileContent.match(/# URL: (http[^\n]+)/)
            if (urlMatch) imageUrl = urlMatch[1]
          }
        }

        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
          console.warn("Invalid image URL for editing:", imageUrl)
          continue
        }

        const { editImageWithHyperreal } = await import("../../services/hyperreal")
        let editedUrl = await editImageWithHyperreal(prompt, imageUrl, { model: model as any })

        // Persist to Supabase so it doesn't expire
        if (editedUrl.startsWith("http") && user) {
          try {
            const { createAssetFromUrl } = await import("../../services/assetService")
            const timestamp = Date.now()
            const truncId = String(timestamp).slice(-7)
            const editedName = `ed_${truncId}.png`
            const assetMetadata = await createAssetFromUrl(
              user.id,
              currentProject?.id || null,
              "image",
              editedName,
              editedUrl
            )
            editedUrl = assetMetadata.url
          } catch (saveErr) {
            console.warn("Failed to persist edited image, ignoring:", saveErr)
          }
        }

        const timestamp = Date.now()
        const truncId = String(timestamp).slice(-7)
        const editedName = `images/ed_${truncId}.png`
        const metadataName = `images/ed_${truncId}.md`

        // Save actual image URL to generatedFiles + storage (only when authenticated + connected)
        addGeneratedFile(editedName, editedUrl)
        const proj = currentProject
        const authedUser = user
        if (proj && authedUser) {
          await saveSingleProjectFile(
            proj.id,
            authedUser.id,
            proj.name,
            editedName,
            editedUrl,
            null
          )
        }

        // Save metadata separately as .md
        const newContent = `# Image Asset\n# URL: ${editedUrl}\n# Prompt: ${prompt}`
        if (proj && authedUser) {
          await saveSingleProjectFile(
            proj.id,
            authedUser.id,
            proj.name,
            metadataName,
            newContent,
            null
          )
        }

        addMessage({
          id: uuidv4(),
          role: "assistant",
          content: `✅ Successfully edited image \`${path}\` and saved as \`${editedName}\`.`,
          timestamp: new Date(),
          images: [editedUrl]
        })
        console.log(`AI edited image: ${path} -> ${editedName}`)
      } catch (error) {
        console.error("Error editing image via AI:", error)
        addMessage({
          id: uuidv4(),
          role: "assistant",
          content: `❌ Error editing image \`${path}\`: ${error instanceof Error ? error.message : "Unknown error"}`,
          timestamp: new Date()
        })
      }
    }
  }

  // ── Handler for ToolApprovalCard approve/reject ──
  const handleToolApprove = async (toolCallId: string) => {
    const agentStore = useAgentToolStore.getState()
    const freshAppStore = useAppStore.getState()

    // Snapshot the changes BEFORE calling approveToolCall
    const changesToApply = agentStore.sandboxChanges
      .filter(c => c.toolCallId === toolCallId && (c.status === 'pending' || c.status === 'approved'))
      .map(c => ({ ...c, status: 'approved' as const }))

    console.log(`[handleToolApprove] Executing for ${toolCallId}, found ${changesToApply.length} changes.`)

    // Now mark as approved in the store (UI update)
    agentStore.approveToolCall(toolCallId)

    if (changesToApply.length === 0) {
      console.warn(`[handleToolApprove] No pending changes found for toolCallId: ${toolCallId}`)
      return
    }

    // Persist to R2 + Supabase (if available) or local fallback
    let applied: Record<string, string | null> = {}
    const activeProject = freshAppStore.currentProject
    const activeUserId = freshAppStore.currentUserId || user?.id

    console.log(`[handleToolApprove] Project active: ${!!activeProject}, User active: ${!!activeUserId}`)

    if (activeProject && activeUserId) {
      applied = await applyApprovedChanges(
        changesToApply,
        activeProject.id,
        activeUserId,
        null
      )
    } else {
      console.log(`[handleToolApprove] Skipping real storage sync (No project/user).`)
      for (const c of changesToApply) {
        if (c.type === "delete") applied[c.path] = null
        else if (c.type === "create" || c.type === "edit") applied[c.path] = c.newContent ?? ""
        else if ((c.type === "rename" || c.type === "move") && c.newPath) {
          applied[c.path] = null
          applied[c.newPath] = c.newContent ?? c.originalContent ?? ""
        } else if (c.type === "copy" && c.newPath) {
          applied[c.newPath] = c.newContent ?? c.originalContent ?? ""
        }
      }
    }

    // ── BUGFIX: Update generatedFiles FIRST, then remove sandbox changes ──
    // This prevents the race condition where BuilderSidebar reads an empty merged
    // view because sandbox was cleared before Zustand state propagated.
    const updatedFiles = { ...getGeneratedFiles() }
    for (const [path, content] of Object.entries(applied)) {
      if (content === null) {
        delete updatedFiles[path]
      } else {
        updatedFiles[path] = content
      }
    }
    setGeneratedFiles(updatedFiles)

    if (currentProject && !user) {
      try {
        const storageKey = `project_${currentProject.id}_files`
        localStorage.setItem(storageKey, JSON.stringify({
          files: updatedFiles,
          timestamp: Date.now(),
        }))
      } catch (e) {
        console.warn("Failed to persist fallback project files to localStorage:", e)
      }
    }

    // Remove processed changes from sandbox AFTER store update has been dispatched.
    // A microtask delay ensures Zustand subscribers (BuilderSidebar) receive the
    // updated generatedFiles before the sandbox overlay is cleared.
    await new Promise<void>(resolve => setTimeout(resolve, 0))
    for (const change of changesToApply) {
      agentStore.removeSandboxChange(change.id)
    }

    // ── Auto-Run Game Detection ──
    // After files are committed, check if the project is now runnable
    if (!autoFixInProgressRef.current) {
      triggerAutoRunCheck(updatedFiles)
    }
  }

  // ── Auto-Run Game Logic (Silent Static Validation) ──
  const triggerAutoRunCheck = (files: Record<string, string>) => {
    if (!currentProject) return
    if (!isProjectRunnable(files)) return

    // Show the banner and start the run cycle
    setShowGameBanner(true)
    setGameRunState('running')
    setGameRunFixAttempt(0)

    // Do silent static analysis — no tab opened, no iframe
    silentValidateAndFix(files, 0)
  }

  /**
   * Silently validate project files for syntax errors by attempting
   * to parse JS/TS files with `new Function()`. If errors are found,
   * auto-fix them via AI. Repeat until clean or max attempts reached.
   */
  const silentValidateAndFix = async (
    files: Record<string, string>,
    attempt: number
  ) => {
    if (!currentProject) return

    // Collect syntax errors from JS/TS/HTML files
    const detectedErrors: Array<{ source: string; message: string; stack?: string }> = []

    for (const [path, content] of Object.entries(files)) {
      if (!content) continue
      const ext = path.split('.').pop()?.toLowerCase()

      // Check JS/TS files for syntax errors
      if (ext === 'js' || ext === 'ts' || ext === 'jsx' || ext === 'tsx') {
        try {
          // Strip TypeScript-specific syntax for basic validation
          let cleaned = content
            .replace(/:\s*[A-Z][a-zA-Z<>\[\]|&,\s]*(?=[;=),\n\r}])/g, '') // strip type annotations
            .replace(/\bimport\b.*?(?:from\s*['"].*?['"]|['"].*?['"])\s*;?/g, '') // strip imports
            .replace(/\bexport\b\s*(default\s*)?/g, '') // strip export keywords
            .replace(/\binterface\b[^{]*\{[^}]*\}/g, '') // strip interfaces
            .replace(/\btype\b\s+\w+\s*=\s*[^;]+;/g, '') // strip type aliases

          // Attempt to parse with Function constructor to detect syntax errors
          new Function(cleaned)
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          detectedErrors.push({
            source: `syntax:${path}`,
            message: msg,
          })
        }
      }

      // Check HTML files for basic structure issues
      if (ext === 'html') {
        if (!content.includes('<html') && !content.includes('<!DOCTYPE') && !content.includes('<body')) {
          detectedErrors.push({
            source: `structure:${path}`,
            message: `HTML file may be incomplete — missing <html>, <!DOCTYPE>, or <body> tags`,
          })
        }
      }
    }

    if (detectedErrors.length === 0) {
      // No errors — game is ready!
      setGameRunState('ready')
      return
    }

    if (attempt >= MAX_AUTO_FIX_ATTEMPTS) {
      // Gave up after max attempts
      setGameRunState('failed')
      setGameRunErrorCount(detectedErrors.length)
      return
    }

    // Auto-fix errors
    setGameRunState('fixing')
    setGameRunErrorCount(detectedErrors.length)
    setGameRunFixAttempt(attempt + 1)
    autoFixInProgressRef.current = true

    try {
      const fixPrompt = buildAutoFixPrompt(detectedErrors, files)
      const fixMessages = [{ role: 'user' as const, parts: [{ text: fixPrompt }] }]

      let fixResponse = ''
      for await (const chunk of sendMessageToGeminiStream(fixMessages)) {
        fixResponse += chunk
      }

      if (fixResponse.trim()) {
        // Auto-apply the fixes (no user approval needed for auto-fix loop)
        const { toolCalls } = parseToolCalls(fixResponse)
        const currentFiles = getGeneratedFiles() || {}
        let patchedFiles = { ...currentFiles }

        for (const tc of toolCalls) {
          if (isFileModifyingTool(tc.tool)) {
            const { changes } = executeToolInSandbox(tc, patchedFiles)
            patchedFiles = applySandboxChangesToFileMap(patchedFiles, changes)
            // Persist each change
            if (currentProject && user) {
              await applyApprovedChanges(
                changes.map(c => ({ ...c, status: 'approved' as const })),
                currentProject.id,
                user.id,
                null
              ).catch(() => { /* best-effort */ })
            }
          }
        }

        setGeneratedFiles(patchedFiles)

        // Re-validate after patching
        setGameRunState('running')
        await new Promise(resolve => setTimeout(resolve, 1000))
        await silentValidateAndFix(patchedFiles, attempt + 1)
      } else {
        setGameRunState('failed')
      }
    } catch (e) {
      console.error('[AutoFix] Error during auto-fix:', e)
      setGameRunState('failed')
    } finally {
      autoFixInProgressRef.current = false
    }
  }

  // ── Listen for error prefill messages from GameRunner ──
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'KOYE_PREFILL_ERROR' && event.data.text) {
        // Auto-fill the chat input with the error text from GameRunner
        const editorEl = document.querySelector('[contenteditable="true"]') as HTMLElement
        if (editorEl) {
          editorEl.textContent = event.data.text
          editorEl.dispatchEvent(new Event('input', { bubbles: true }))
          editorEl.focus()

          // Move cursor to end
          const range = document.createRange()
          const sel = window.getSelection()
          range.selectNodeContents(editorEl)
          range.collapse(false)
          sel?.removeAllRanges()
          sel?.addRange(range)
        }
      }
    }

    window.addEventListener('message', handleMessage)

    // Also check for stored prefill on mount (if user navigated here directly)
    try {
      const stored = localStorage.getItem('koye_error_prefill')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Only use if recent (< 30 seconds old)
        if (parsed.text && Date.now() - parsed.timestamp < 30000) {
          setTimeout(() => {
            const editorEl = document.querySelector('[contenteditable="true"]') as HTMLElement
            if (editorEl) {
              editorEl.textContent = parsed.text
              editorEl.dispatchEvent(new Event('input', { bubbles: true }))
              editorEl.focus()
            }
          }, 500)
        }
        localStorage.removeItem('koye_error_prefill')
      }
    } catch {}

    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleToolReject = (toolCallId: string) => {
    const agentStore = useAgentToolStore.getState()
    agentStore.rejectToolCall(toolCallId)

    // Remove rejected changes from sandbox
    const rejectedChanges = agentStore.sandboxChanges.filter(
      c => c.toolCallId === toolCallId && c.status === 'rejected'
    )
    for (const change of rejectedChanges) {
      agentStore.removeSandboxChange(change.id)
    }
  }

  // Parse and execute game dev steps from AI response
  const parseAndExecuteGameDevSteps = (content: string) => {
    // Parse [RESET_FLOW]
    if (content.includes('[RESET_FLOW]')) {
      const { resetFlow } = useGameDevStore.getState()
      resetFlow()
      console.log('Game dev flow has been reset.')
      return
    }

    // Parse [GAME_TYPE: 2D] or [GAME_TYPE: 3D]
    const gameTypeRegex = /\[GAME_TYPE:\s*(2D|3D)\]/i
    const gameTypeMatch = content.match(gameTypeRegex)

    if (gameTypeMatch) {
      const detectedType = gameTypeMatch[1].toLowerCase() as "2d" | "3d"
      if (!isGameDevActive) {
        setGameType(detectedType)
        console.log(`Game type detected: ${detectedType}. Starting game dev flow.`)
      }
    }

    // Parse [STEP: <number>]
    const stepRegex = /\[STEP:\s*(\d+)\]/g
    let match
    let lastStep = -1

    while ((match = stepRegex.exec(content)) !== null) {
      const step = parseInt(match[1], 10)
      if (!isNaN(step)) {
        lastStep = step
      }
    }

    if (lastStep !== -1 && lastStep !== gameDevStep) {
      setGameDevStep(lastStep)
      console.log(`Game Dev Flow advanced to step: ${lastStep}`)
    }
  }

  // Helper to add streaming message
  const addStreamingMessage = (message: Message) => {
    // Add the final assistant message - this will append to existing messages including user messages
    // addMessage already saves to localStorage, so we just use it
    addMessage(message)
  }

  // Sync signal to builder when connected to project (only file paths to prevent QuotaExceededError)
  useEffect(() => {
    if (currentProject && currentSessionId) {
      // Update sync timestamp to notify builder of changes
      // We DO NOT store the full file contents here because large binary files (base64)
      // will quickly exceed the 5MB localStorage quota.
      const syncKey = `project_${currentProject.id}_sync`
      const currentFiles = getGeneratedFiles()
      const filePaths = Object.keys(currentFiles)
      
      try {
        localStorage.setItem(syncKey, JSON.stringify({
          timestamp: Date.now(),
          sessionId: currentSessionId,
          filePaths // Only store paths/keys, not the massive strings
        }))
      } catch (error) {
        console.warn("Could not sync file paths to localStorage", error)
      }
    }
  }, [currentProject, currentSessionId, getGeneratedFiles])

  // Listen for file changes from builder (bidirectional sync via local storage signal)
  // This is mostly disabled because useAppStore already shares generatedFiles.
  useEffect(() => {
    if (!currentProject || !currentSessionId) return

    const syncKey = `project_${currentProject.id}_sync`

    // Check for updates from builder every 2 seconds
    const syncInterval = setInterval(() => {
      const syncData = localStorage.getItem(syncKey)
      if (syncData) {
        try {
          const parsed = JSON.parse(syncData)
          
          // We only use this as a reload signal if the sessionId changed,
          // but we no longer read parsed.files because we don't store them here to avoid quota errors.
          // Since useAppStore is global, Zustand's state is already shared between components.
          const lastCheck = localStorage.getItem(`${syncKey}_chat_lastCheck`)
          const lastCheckTime = lastCheck ? parseInt(lastCheck) : 0

          if (parsed.sessionId !== currentSessionId && parsed.timestamp > lastCheckTime) {
            console.log('Chat: Sync signal received from builder')
            localStorage.setItem(`${syncKey}_chat_lastCheck`, parsed.timestamp.toString())
            // Note: Since we don't pass full files in localStorage anymore due to quota limits,
            // we rely on Zustand's useAppStore to have the right state, or we would trigger a refresh here.
          }
        } catch (error) {
          console.error('Error syncing from builder:', error)
        }
      }
    }, 2000)

    return () => clearInterval(syncInterval)
  }, [currentProject, currentSessionId])

  // Generate title for the current session after first AI response
  const generateTitleForSession = async () => {
    if (!currentSessionId) return

    // Get fresh state to ensure we have the latest messages
    const state = useAppStore.getState()
    const currentSession = state.sessions.find(s => s.id === currentSessionId)
    if (!currentSession) return

    // Only generate if title is still "New Chat" or was generated from first user message
    const currentTitle = currentSession.title
    if (currentTitle !== "New Chat" && !currentTitle.includes("...") && currentTitle.length > 20) {
      // Title already seems to be set, skip
      return
    }

    try {
      // Get all messages including the new assistant message
      const allMessages = state.messages.length > 0 ? state.messages : currentSession.messages
      const assistantMessages = allMessages.filter(m => m.role === "assistant")

      // Only generate if we have at least one assistant message
      if (assistantMessages.length > 0) {
        const generatedTitle = await generateChatTitle(allMessages)
        updateSessionTitle(currentSessionId, generatedTitle)
      }
    } catch (error) {
      console.error("Error generating chat title:", error)
      // Don't throw - title generation failure shouldn't break the app
    }
  }

  // Handle task approval from TaskProposalCard
  const handleTaskApproval = (type: TaskType, config: TaskConfig) => {
    const taskStore = useTaskStore.getState()
    const taskId = uuidv4()

    // Map TaskType to the old assetType format for WorkflowManager compatibility
    let legacyAssetType: string = type
    if (type === "image-generation") legacyAssetType = "images"
    else if (type === "sprite-generation") legacyAssetType = "sprites"
    else if (type === "animation-generation") legacyAssetType = "animations"
    else if (type === "audio-generation") legacyAssetType = "audio"

    // Create the task in the store
    taskStore.addTask({
      id: taskId,
      type,
      status: "running",
      config,
      createdAt: Date.now(),
      startedAt: Date.now(),
    })

    // Clear the proposal
    taskStore.clearProposal()

    // DON'T set isGenerating — let the LLM stay free to chat while the task runs in background
    // The task progress is shown only in the TaskBar above the input

    // Add a brief AI message acknowledging the background task
    // (Moved to WorkflowManager.tsx to combine with the "Saved prompt" message)


    // Dispatch custom event so WorkflowManager can handle the generation
    const event = new CustomEvent('user-confirmed-asset-generation', {
      detail: { assetType: legacyAssetType, userMessage: "", taskId, config }
    })
    window.dispatchEvent(event)
  }

  const handleTaskCancel = () => {
    const state = useTaskStore.getState()
    const proposal = state.pendingProposal

    if (proposal) {
      const taskName = getTaskDisplayName(proposal.type)
      const cancelMsg: Message = {
        id: uuidv4(),
        role: "assistant",
        content: `Task creation **${taskName}** cancelled by user. Please provide further details or changes needed.`,
        timestamp: new Date()
      }
      addMessage(cancelMsg)
    }

    state.clearProposal()
  }

  // Get the pending proposal from task store
  const pendingProposal = useTaskStore((s) => s.pendingProposal)

  // Get pending agent tool calls and sandbox changes
  const pendingAgentToolCalls = useAgentToolStore((s) => s.pendingToolCalls)
  const agentSandboxChanges = useAgentToolStore((s) => s.sandboxChanges)
  const displayName = user?.email?.split("@")[0]?.replace(/[._-]+/g, " ") || "builder"
  const firstName = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours())
  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentHour(new Date().getHours())
    }, 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const timeGreeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening"
  const heroPromptChips: string[] = []

  const paraliumStore = useParaliumStore()
  
  const isSidebarOpen = useAppStore(state => state.isSidebarOpen)

  const creditsBalance = subscription?.creditsBalance ?? 0

  return (
    <>
      {paraliumStore.phase === "selecting_images" && (
        <ParaliumImageSelector 
          onComplete={async () => {
            const { resumeParaliumPipelineAfterSelection } = await import("../../services/paraliumService")
            resumeParaliumPipelineAfterSelection()
          }}
          onAbort={() => {
            paraliumStore.setPhase("idle", "Image selection closed.")
          }}
        />
      )}
    <VoiceChatLayout>
      <div className="flex h-full w-full bg-background overflow-hidden relative flex-row transition-all duration-300">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 h-full items-center justify-center bg-background">
          <div className="w-full max-w-[86rem] h-full flex flex-col min-h-0">
          {/* Terminal Window */}
          <div className="flex-1 flex flex-col bg-background min-h-0 dark:bg-transparent dark:shadow-2xl">
            {/* Title Bar */}
            <div className="px-4 py-2 flex items-center justify-between shrink-0 bg-background relative">
              <div className="flex items-center gap-2" />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Notifications"
                  className={cn(
                    "relative h-9 w-9 rounded-full flex items-center justify-center transition-colors",
                    theme === "dark" ? "hover:bg-white/10 text-white/80" : "hover:bg-muted text-foreground"
                  )}
                >
                  <Bell className="h-4 w-4" />
                  <span className={cn("absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full text-[10px] font-black flex items-center justify-center", theme === "dark" ? "bg-white text-black" : "bg-foreground text-background")}>
                    1
                  </span>
                </button>

                <div className={cn("h-9 px-3 rounded-full border flex items-center gap-2 text-sm font-semibold", theme === "dark" ? "border-white/10 bg-white/[0.03] text-white/90" : "border-border bg-background text-foreground")}>
                  <Coins className={cn("h-4 w-4", theme === "dark" ? "text-white/70" : "text-muted-foreground")} />
                  <span>{creditsBalance}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsUpgradeModalOpen(true)}
                  className={cn(
                    "h-9 px-4 rounded-full text-sm font-semibold transition-colors",
                    theme === "dark"
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-foreground text-background hover:opacity-90"
                  )}
                >
                  Upgrade
                </button>
              </div>
            </div>

            {/* Content Container - Chat */}
            {isChatLoading ? (
              /* Skeletal Loading State for Chat Interface */
              <div className="flex-1 overflow-x-hidden overflow-y-auto px-6 py-8 bg-background min-h-0 flex flex-col gap-10 w-full max-w-4xl mx-auto pointer-events-none">
                {/* Skeleton AI Bubble */}
                <div className="flex items-start gap-4 w-full">
                  <div className="h-10 w-10 rounded-full bg-muted/60 dark:bg-muted/40 animate-pulse shrink-0" />
                  <div className="flex flex-col gap-2 w-full max-w-[80%]">
                    <div className="h-4 w-24 bg-muted/60 dark:bg-muted/40 rounded animate-pulse" />
                    <div className="h-24 w-full bg-muted/60 dark:bg-muted/40 rounded-xl animate-pulse" />
                  </div>
                </div>
                {/* Skeleton User Bubble */}
                <div className="flex items-start gap-4 justify-end w-full">
                  <div className="flex flex-col items-end gap-2 w-full max-w-[80%]">
                    <div className="h-4 w-16 bg-muted/60 dark:bg-muted/40 rounded animate-pulse" />
                    <div className="h-16 w-80 bg-muted/60 dark:bg-muted/40 rounded-xl animate-pulse" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-muted/60 dark:bg-muted/40 animate-pulse shrink-0" />
                </div>
                {/* Skeleton AI Bubble 2 */}
                <div className="flex items-start gap-4 w-full">
                  <div className="h-10 w-10 rounded-full bg-muted/60 dark:bg-muted/40 animate-pulse shrink-0" />
                  <div className="flex flex-col gap-2 w-full max-w-[80%]">
                    <div className="h-4 w-28 bg-muted/60 dark:bg-muted/40 rounded animate-pulse" />
                    <div className="h-32 w-full max-w-2xl bg-muted/60 dark:bg-muted/40 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center pt-[28vh] px-6 bg-background dark:bg-transparent min-h-0 overflow-x-hidden w-full max-w-full">
                <div className="w-full max-w-4xl flex flex-col items-center gap-12 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-center gap-4 text-center">
                    <img src="/images/app/new-icon2.png" alt="KOYE" className="h-[40px] w-[40px] shadow-sm" />
                    <h1 
                      className="text-[40px] sm:text-[48px] leading-tight tracking-[-0.03em] text-foreground dark:text-[#C3C2B7] font-light font-serif italic"
                    >
                      3D Game builder
                    </h1>
                  </div>

                  <div className="w-full max-w-2xl">
                    <ChatInput
                      onSend={handleSend}
                      onStop={handleStop}
                      disabled={isGenerating}
                      isGenerating={isGenerating}
                      variant="hero"
                      placeholder="How can I help you today?"
                      promptChips={heroPromptChips}
                      onCreateProject={() => setShowCreateProjectDialog(true)}
                      onConnectProject={handleConnectProject}
                      projects={projects}
                      isLoadingProjects={isLoadingProjects}
                    />
                  </div>
                  
                  {/* What others build with koye */}
                  <div className="w-full max-w-4xl mt-12 mb-2 overflow-hidden">
                    <p className="text-muted-foreground text-sm font-medium mb-4 text-center">What others build with Koye</p>
                    <div className="flex gap-4 overflow-x-auto scrollbar-none pb-4 snap-x">
                      {[
                        "8253dec-251693246.webp",
                        "OIP-226731792.jpg",
                        "OIP-3285539972.jpg",
                        "maxresdefault-3730074767.jpg",
                        "ss_0df1a7f796753fb6d76e55aff95c042ca88ab3bf.1920x1080-1880673191.jpg",
                        "8253dec-251693246.webp",
                        "OIP-226731792.jpg",
                        "OIP-3285539972.jpg",
                        "maxresdefault-3730074767.jpg",
                        "ss_0df1a7f796753fb6d76e55aff95c042ca88ab3bf.1920x1080-1880673191.jpg"
                      ].map((img, idx) => (
                        <div key={idx} className="shrink-0 snap-center">
                          <img 
                            src={`/images/interface/${img}`} 
                            alt={`Gallery ${idx}`} 
                            className="w-[300px] h-[180px] object-cover rounded-xl shadow-md border border-border/50"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seele-Style Prompt Cards with images */}
                  <div className="w-full max-w-4xl mt-4 mb-12">
                    <p className="text-muted-foreground text-sm font-medium mb-4 text-center">Discover what Koye can do</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { title: "Game Generator", label: "Auto", bg: "bg-gradient-to-br from-indigo-500/20 to-purple-500/20", border: "border-indigo-500/30", prompt: "Create a new 3D game from scratch", img: "8253dec-251693246.webp" },
                        { title: "Custom Game Remake", label: "Remix", bg: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30", prompt: "Remake a classic arcade game in 3D", img: "maxresdefault-3730074767.jpg" },
                        { title: "3D FPS Game", label: "Action", bg: "bg-gradient-to-br from-rose-500/20 to-orange-500/20", border: "border-rose-500/30", prompt: "Build a first person shooter with a sci-fi theme", img: "ss_0df1a7f796753fb6d76e55aff95c042ca88ab3bf.1920x1080-1880673191.jpg" },
                        { title: "Arcade Crossing", label: "Casual", bg: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", prompt: "Create a frogger style road crossing game", img: "OIP-3285539972.jpg" }
                      ].map((card, idx) => (
                        <div 
                          key={idx}
                          onClick={() => handleSend(card.prompt, [])}
                          className={cn(
                            "relative overflow-hidden rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] hover:-translate-y-1 group flex flex-col",
                            card.bg, card.border, "dark:bg-opacity-10"
                          )}
                        >
                          <div className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded-full bg-background/50 border border-border/50 backdrop-blur-sm z-10">
                            {card.label}
                          </div>
                          <img 
                            src={`/images/interface/${card.img}`} 
                            alt={card.title} 
                            className="w-full h-[120px] object-cover"
                          />
                          <div className="p-4 flex flex-1 items-end bg-background/40 backdrop-blur-[2px]">
                            <h3 className="font-semibold text-sm text-foreground/90 group-hover:text-foreground transition-colors">
                              {card.title}
                            </h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Messages state - normal layout */
              <>
                {/* Messages Container */}
                <div className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-mini px-6 md:px-10 py-10 bg-background dark:bg-transparent min-h-0 w-full max-w-full animate-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-8 max-w-[760px] mx-auto w-full">
                    {Array.isArray(messages) && messages.map((message) => {
                      const needsProjectConnection = message.role === "assistant" && message.content.includes('[CONNECT_PROJECT_REQUIRED]')

                      if (message.role === "assistant") {
                        return (
                          <ResponseMessage
                            key={message.id}
                            content={message.content}
                            fileOperations={message.fileOperations}
                            images={message.images}
                            generatedImages={message.generatedImages}
                            sampleImages={message.sampleImages}
                            videos={message.videos}
                            model3dUrl={message.model3dUrl}
                            isGeneratingImage={message.isGeneratingImage}
                            webSearchResults={message.webSearchResults}
                            isWebSearching={message.isWebSearching}
                            showConnectPrompt={needsProjectConnection && !currentProject}
                            onConnectProject={() => setShowConnectDialog(true)}
                            onCreateProject={() => setShowCreateProjectDialog(true)}
                          />
                        )
                      } else {
                        return (
                          <MessageBubble
                            key={message.id}
                            role={message.role}
                            content={message.content}
                            images={message.images}
                          />
                        )
                      }
                    })}

                    {/* Paralium Pipeline Status */}
                    {selectedModelMode === "paralium" && paraliumStore.phase !== "idle" && paraliumStore.phase !== "selecting_images" && (
                      <ParaliumStatusCard />
                    )}

                    {/* Model switching indicator */}
                    {isGenerating && isSwitchingModel && (
                      <ResponseMessage
                        content=""
                        thinking={switchingMessage || "Switching models..."}
                        isThinking={true}
                        isSwitching={true}
                      />
                    )}

                    {/* Thinking state */}
                    {isGenerating && isThinking && !isSwitchingModel && (
                      <ResponseMessage
                        content=""
                        thinking={thinkingText}
                        isThinking={true}
                      />
                    )}

                    {/* Streaming message */}
                    {isGenerating && streamingMessageId && streamingContent && !isThinking && !isSwitchingModel && (
                      <ResponseMessage
                        key={streamingMessageId}
                        content={streamingContent}
                        isStreaming={true}
                      />
                    )}

                    {/* Tool execution shimmer hints */}
                    {isGenerating && toolExecutionHints.length > 0 && (
                      <ResponseMessage
                        content=""
                        thinking={toolExecutionHints[toolExecutionHints.length - 1]}
                        isThinking={true}
                      />
                    )}

                    {/* Agent search/read tool activity — shown inline in the message stream */}
                    {searchToolTasks.length > 0 && (
                      <div className="px-2">
                        {searchToolTasks.map((task) => (
                          <SearchToolCard key={task.id} task={task} />
                        ))}
                      </div>
                    )}

                    {/* Game Ready Banner */}
                    {showGameBanner && currentProject && (
                      <GameReadyBanner
                        state={gameRunState}
                        errorCount={gameRunErrorCount}
                        fixAttempt={gameRunFixAttempt}
                        projectId={currentProject.id}
                        onPlay={() => {
                          window.open(
                            `/play/${currentProject.id}`,
                            '_blank',
                            'noopener,noreferrer'
                          )
                        }}
                        onDismiss={() => {
                          setShowGameBanner(false)
                          setGameRunState('idle')
                        }}
                      />
                    )}

                    {/* Fallback thinking state */}
                    {isGenerating && !streamingMessageId && !isThinking && !streamingContent && !isSwitchingModel && !generatingText && !isImageGenerating && (
                      <MessageBubble
                        role="assistant"
                        content=""
                        isThinking={true}
                      />
                    )}

                    {/* Asset generation loading indicator */}
                    {generatingText && (
                      <ResponseMessage
                        content=""
                        thinking={generatingText}
                        isThinking={true}
                      />
                    )}

                    {/* Agent Tool Approval Cards */}
                    {/* Task Proposal Card */}
                    {pendingProposal && (
                      <div className="py-4">
                        <TaskProposalCard
                          type={pendingProposal.type}
                          config={pendingProposal.config}
                          onApprove={handleTaskApproval}
                          onCancel={handleTaskCancel}
                        />
                      </div>
                    )}
                  </div>

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Container - at bottom when messages exist */}
                <div className="shrink-0 bg-background dark:bg-transparent px-6 md:px-0 py-5 w-full max-w-[760px] mx-auto">
                  {/* Manual Search Trigger */}
                  {selectedModelMode === "paralium" && paraliumStore.phase !== "selecting_images" && currentProject?.initialGameScreenSelected !== true && (
                     <div className="mb-4 flex flex-wrap gap-4 justify-center animate-in slide-in-from-bottom-2">
                       {(getGeneratedFiles()["reference games.md"] || getGeneratedFiles()["reference-games.md"]) && (
                         <Button 
                           onClick={async () => {
                             const fileContent = getGeneratedFiles()["reference games.md"] || getGeneratedFiles()["reference-games.md"];
                             if (!fileContent) return;
                             
                             const regex = /\*(.*?)\*/g;
                             const matches = Array.from(fileContent.matchAll(regex)).map(m => m[1].trim());
                             
                             if (matches.length > 0) {
                               paraliumStore.clearAllImageState();
                               paraliumStore.setReferenceGames(matches);
                               paraliumStore.setPhase("selecting_images", "Waiting for you to select screen ideas...");
                               paraliumStore.setCurrentSearchGameIndex(0);
                             }
                           }} 
                           className="bg-white text-black hover:bg-zinc-200 gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                         >
                           <Sparkles className="w-4 h-4" />
                           Search Reference Game Screens
                         </Button>
                       )}
                       
                       {SCREEN_CATEGORIES.some(cat => (paraliumStore.searchedImages[cat]?.length || 0) > 0) && (
                         <div className="relative group inline-block">
                           <Button 
                             onClick={() => {
                               paraliumStore.setPhase("selecting_images", "Waiting for you to select screen ideas...");
                             }} 
                             variant="outline"
                             className="text-white border-white/20 hover:bg-white/10 gap-2 pr-10"
                           >
                             <Folder className="w-4 h-4" />
                             Open Screen Selection
                           </Button>
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               paraliumStore.clearAllImageState();
                             }}
                             className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/20 text-zinc-400 hover:text-white transition-opacity"
                             title="Clear saved results"
                           >
                             <X className="w-3.5 h-3.5" />
                           </button>
                         </div>
                       )}
                     </div>
                  )}
                  {/* TaskBar — shows active background tasks */}
                  <TaskBar />

                  {/* Agent Tool Approval Banners (above input) */}
                  {pendingAgentToolCalls.length > 0 && (
                    <div className="space-y-2 pb-3">
                      {pendingAgentToolCalls.map((toolCall) => {
                        const changes = agentSandboxChanges.filter(
                          (c) => c.toolCallId === toolCall.id
                        )
                        return (
                          <ToolApprovalCard
                            key={toolCall.id}
                            toolCallId={toolCall.id}
                            toolName={toolCall.tool}
                            changes={changes}
                            onApprove={handleToolApprove}
                            onReject={handleToolReject}
                          />
                        )
                      })}
                    </div>
                  )}
                  <ChatInput
                    onSend={handleSend}
                    onStop={handleStop}
                    disabled={isGenerating}
                    isGenerating={isGenerating}
                    variant="docked"
                    placeholder="Write a message..."
                    onCreateProject={() => setShowCreateProjectDialog(true)}
                    onConnectProject={handleConnectProject}
                    projects={projects}
                    isLoadingProjects={isLoadingProjects}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      </div>
      {/* Connect Project Dialog */}
      {showConnectDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-border w-full max-w-md p-6 shadow-2xl font-mono">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground font-mono">Connect Project</h3>
              <button
                onClick={() => setShowConnectDialog(false)}
                className="p-2 hover:bg-muted rounded"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground font-mono mb-2">
                Select a project to connect to this chat session. All generated files will be saved to this project.
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto border border-border p-2 mb-4">
              {isLoadingProjects ? (
                <div className="text-center py-4 text-muted-foreground font-mono text-sm">
                  Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground font-mono text-sm">
                  No projects found.
                </div>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleConnectProject(project)}
                    className={`w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2 font-mono text-sm transition-colors text-foreground ${currentProject?.id === project.id ? 'bg-muted font-bold' : ''}`}
                  >
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{project.name}</span>
                    {currentProject?.id === project.id && <span className="ml-auto text-xs text-muted-foreground">(Connected)</span>}
                  </button>
                ))
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setShowConnectDialog(false)}
                variant="outline"
                className="border-2 border-foreground bg-background text-foreground hover:bg-muted font-mono text-xs font-bold shadow-[2px_2px_0px_0px_currentColor] hover:shadow-[1px_1px_0px_0px_currentColor]"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Dialog */}
      {showCreateProjectDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-border w-full max-w-md p-6 shadow-2xl font-mono">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground font-mono">Create Project</h3>
              <button
                onClick={() => {
                  setShowCreateProjectDialog(false)
                  setNewProjectName("")
                  setNewProjectDescription("")
                }}
                className="p-2 hover:bg-muted rounded"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>



            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1 font-mono">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="w-full border-2 border-border px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newProjectName.trim()) {
                      handleCreateProject()
                    } else if (e.key === 'Escape') {
                      setShowCreateProjectDialog(false)
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1 font-mono">
                  Description (optional)
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Enter project description"
                  rows={3}
                  className="w-full border-2 border-border px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim() || isCreatingProject}
                  className="flex-1 bg-foreground text-background hover:bg-muted-foreground border-2 border-foreground font-mono text-xs font-bold shadow-[2px_2px_0px_0px_currentColor] hover:shadow-[1px_1px_0px_0px_currentColor] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingProject ? "Creating..." : "Create & Connect"}
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateProjectDialog(false)
                    setNewProjectName("")
                    setNewProjectDescription("")
                  }}
                  variant="outline"
                  className="flex-1 border-2 border-border bg-background text-foreground hover:bg-muted font-mono text-xs font-bold shadow-[2px_2px_0px_0px_currentColor] hover:shadow-[1px_1px_0px_0px_currentColor]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </VoiceChatLayout>
    </>
  )
}
