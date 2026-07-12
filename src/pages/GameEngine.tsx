import { ArcRotateCamera, DirectionalLight, Engine, HemisphericLight, Scene, SceneLoader, Vector3 } from "@babylonjs/core"
import "@babylonjs/loaders"
import {
  ArrowLeft,
  Box,
  Camera,
  ChevronDown,
  Eye,
  EyeOff,
  FileCode,
  FileImage,
  FileText,
  Folder,
  Grid3x3,
  Layers,
  Lightbulb,
  Music,
  Pause,
  Play,
  Square,
  Sun
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { babylonRuntime } from "../engine/BabylonRuntime"
import { useAuth } from "../hooks/useAuth"
import { cn } from "../lib/utils"
import { useAppStore } from "../store/useAppStore"
import { useAgentToolStore } from "../store/useAgentToolStore"
import { getAllVFSFiles } from "../services/vfs"
import { loadProjectFilesFromStorage } from "../services/projectFiles"
import { gameScriptRunner, type LogEntry, type EngineState } from "../services/gameScriptRunner"

interface SceneNode {
  id: string
  name: string
  type: "mesh" | "light" | "camera" | "root"
  visible: boolean
  children?: SceneNode[]
}

export function GameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Engine | null>(null)
  const sceneRef = useRef<Scene | null>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const projectId = searchParams.get("projectId")
  const projectName = searchParams.get("name") || "New Project"

  // Store
  const { generatedFiles, setGeneratedFiles, githubConnection } = useAppStore()

  // UI State
  const [activeMode, setActiveMode] = useState<"2D" | "3D" | "Script" | "AssetLib">("3D")
  const [leftPanelTab, setLeftPanelTab] = useState<"Scene" | "FileSystem">("Scene")
  const [bottomPanelTab, setBottomPanelTab] = useState<"Output" | "Debugger" | "Audio" | "Animation" | "Shader Editor">("Output")
  const [rightPanelTab, setRightPanelTab] = useState<"Inspector" | "Node" | "History">("Inspector")
  const [viewMode, setViewMode] = useState<"Desktop" | "Mobile">("Desktop")
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["root"]))

  // Live engine state
  const [engineState, setEngineState] = useState<EngineState>("editor")
  const [consoleLogs, setConsoleLogs] = useState<LogEntry[]>([])
  const [sceneNodes, setSceneNodes] = useState<SceneNode[]>([])
  const [projectFiles, setProjectFiles] = useState<Record<string, string>>({})

  // Inspector state for the selected node
  const [inspectorPos, setInspectorPos] = useState({ x: 0, y: 0, z: 0 })
  const [inspectorRot, setInspectorRot] = useState({ x: 0, y: 0, z: 0 })
  const [inspectorScale, setInspectorScale] = useState({ x: 1, y: 1, z: 1 })
  const [attachedScript, setAttachedScript] = useState<string>("")

  // ── Load project files from VFS ──────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return
    const load = async () => {
      const vfs = await getAllVFSFiles(projectId)
      if (Object.keys(vfs).length > 0) { setProjectFiles(vfs); setGeneratedFiles(vfs); return }
      if (user) {
        const r2 = await loadProjectFilesFromStorage(projectId, user.id, githubConnection)
        if (Object.keys(r2).length > 0) { setProjectFiles(r2); setGeneratedFiles(r2); return }
      }
    }
    load().catch(console.error)
  }, [projectId, user])

  // ── Build live scene graph from Babylon scene ───────────────────────────
  const rebuildSceneGraph = useCallback(() => {
    const scene = sceneRef.current
    if (!scene) return
    const children: SceneNode[] = []
    for (const m of scene.meshes) {
      if (m.name === "__root__" || m.name.startsWith("BackgroundHelper")) continue
      children.push({ id: m.id, name: m.name || m.id, type: "mesh", visible: m.isVisible })
    }
    for (const l of scene.lights) {
      children.push({ id: l.id, name: l.name || l.id, type: "light", visible: l.isEnabled() })
    }
    for (const c of scene.cameras) {
      children.push({ id: c.id, name: c.name || c.id, type: "camera", visible: true })
    }
    setSceneNodes([{ id: "root", name: "Scene", type: "root", visible: true, children }])
  }, [])

  // ── Sync inspector when selectedNode changes ────────────────────────────
  useEffect(() => {
    if (!selectedNode || !sceneRef.current) return
    const mesh = sceneRef.current.getMeshById(selectedNode)
    if (mesh) {
      setInspectorPos({ x: +mesh.position.x.toFixed(2), y: +mesh.position.y.toFixed(2), z: +mesh.position.z.toFixed(2) })
      setInspectorRot({ x: +(mesh.rotation.x * 180 / Math.PI).toFixed(1), y: +(mesh.rotation.y * 180 / Math.PI).toFixed(1), z: +(mesh.rotation.z * 180 / Math.PI).toFixed(1) })
      setInspectorScale({ x: +mesh.scaling.x.toFixed(2), y: +mesh.scaling.y.toFixed(2), z: +mesh.scaling.z.toFixed(2) })
      const att = gameScriptRunner.getAttachmentForMesh(selectedNode)
      setAttachedScript(att?.scriptPath || "")
    }
  }, [selectedNode])

  // ── Apply inspector changes to mesh ─────────────────────────────────────
  const applyInspector = useCallback(() => {
    if (!selectedNode || !sceneRef.current) return
    const mesh = sceneRef.current.getMeshById(selectedNode)
    if (!mesh) return
    mesh.position.set(inspectorPos.x, inspectorPos.y, inspectorPos.z)
    mesh.rotation.set(inspectorRot.x * Math.PI / 180, inspectorRot.y * Math.PI / 180, inspectorRot.z * Math.PI / 180)
    mesh.scaling.set(inspectorScale.x, inspectorScale.y, inspectorScale.z)
  }, [selectedNode, inspectorPos, inspectorRot, inspectorScale])

  useEffect(() => { applyInspector() }, [applyInspector])

  // ── Wire script runner callbacks ────────────────────────────────────────
  useEffect(() => {
    gameScriptRunner.onLogs(setConsoleLogs)
    gameScriptRunner.onState(setEngineState)
    return () => { gameScriptRunner.onLogs(() => {}); gameScriptRunner.onState(() => {}) }
  }, [])

  // ── Babylon scene init ──────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize Babylon.js engine via shared runtime
    babylonRuntime.initialize({
      canvas: canvasRef.current,
      clearColor: { r: 0.12, g: 0.12, b: 0.14, a: 1 },
      createDefaultLights: false, // We'll add custom lights manually below
    })

    const scene = babylonRuntime.scene!
    const engine = babylonRuntime.engine!
    const camera = babylonRuntime.camera!

    sceneRef.current = scene
    engineRef.current = engine

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

    // Bind the script runner to this scene
    gameScriptRunner.bind(scene, engine, camera, canvasRef.current!)

    // Load 3D assets from project files
    const merged = useAgentToolStore.getState().getMergedFiles(generatedFiles)
    const modelEntries = Object.entries(merged).filter(([p]) => {
      const ext = p.split(".").pop()?.toLowerCase()
      return ext === "glb" || ext === "gltf" || ext === "obj"
    })
    for (const [, url] of modelEntries) {
      if (url && (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:"))) {
        SceneLoader.ImportMeshAsync("", "", url, scene).then(() => rebuildSceneGraph()).catch(console.error)
      }
    }

    // Build initial scene graph after a tick
    setTimeout(rebuildSceneGraph, 200)

    return () => {
      gameScriptRunner.unbind()
      babylonRuntime.dispose()
    }
  }, [generatedFiles])

  // ── Play / Pause / Stop handlers ────────────────────────────────────────
  const handlePlay = () => {
    if (engineState === "paused") { gameScriptRunner.resume(); return }
    const merged = useAgentToolStore.getState().getMergedFiles(generatedFiles)
    gameScriptRunner.play({ ...merged, ...projectFiles })
  }
  const handlePause = () => gameScriptRunner.pause()
  const handleStop = () => { gameScriptRunner.stop(); rebuildSceneGraph() }

  // ── Node helpers ────────────────────────────────────────────────────────
  const toggleNodeVisibility = (nodeId: string) => {
    if (!sceneRef.current) return
    const mesh = sceneRef.current.getMeshById(nodeId)
    if (mesh) { mesh.isVisible = !mesh.isVisible; rebuildSceneGraph() }
  }

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => {
      const s = new Set(prev)
      s.has(nodeId) ? s.delete(nodeId) : s.add(nodeId)
      return s
    })
  }

  const getNodeIcon = (type: SceneNode["type"]) => {
    switch (type) {
      case "mesh": return <Box className="h-3.5 w-3.5 text-blue-400" />
      case "light": return <Sun className="h-3.5 w-3.5 text-yellow-400" />
      case "camera": return <Camera className="h-3.5 w-3.5 text-green-400" />
      default: return <Folder className="h-3.5 w-3.5 text-gray-400" />
    }
  }

  const getFileIcon = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase()
    if (["js", "ts"].includes(ext || "")) return <FileCode className="h-4 w-4 text-yellow-400" />
    if (["png", "jpg", "jpeg", "svg"].includes(ext || "")) return <FileImage className="h-4 w-4 text-purple-400" />
    if (["glb", "gltf", "obj"].includes(ext || "")) return <Box className="h-4 w-4 text-cyan-400" />
    if (["mp3", "wav", "ogg"].includes(ext || "")) return <Music className="h-4 w-4 text-pink-400" />
    return <FileText className="h-4 w-4 text-gray-400" />
  }

  // Get script files for attachment dropdown
  const scriptFiles = Object.keys(projectFiles).filter(p => {
    const ext = p.split(".").pop()?.toLowerCase()
    return ext === "js" || ext === "ts"
  })

  const renderSceneNode = (node: SceneNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 hover:bg-gray-700 cursor-pointer text-sm group",
            selectedNode === node.id && "bg-blue-600/40 border-l-2 border-blue-400"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => setSelectedNode(node.id)}
        >
          {hasChildren ? (
            <button onClick={(e) => { e.stopPropagation(); toggleNodeExpansion(node.id) }} className="p-0.5 hover:bg-gray-600 rounded">
              <ChevronDown className={cn("h-3 w-3 transition-transform", !isExpanded && "-rotate-90")} />
            </button>
          ) : <div className="w-4" />}
          {getNodeIcon(node.type)}
          <span className="text-gray-200 flex-1 truncate">{node.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); toggleNodeVisibility(node.id) }}
            className="p-0.5 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100"
          >
            {node.visible ? <Eye className="h-3 w-3 text-gray-400" /> : <EyeOff className="h-3 w-3 text-gray-600" />}
          </button>
        </div>
        {hasChildren && isExpanded && <div>{node.children!.map(c => renderSceneNode(c, level + 1))}</div>}
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gray-800 overflow-hidden">
      {/* Top Menu Bar */}
      <div className="shrink-0 bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Menu Items */}
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <button className="hover:text-white">Scene</button>
            <button className="hover:text-white">Project</button>
            <button className="hover:text-white">Debug</button>
            <button className="hover:text-white">Editor</button>
            <button className="hover:text-white">Help</button>
          </div>

          {/* Mode Selection */}
          <div className="flex items-center gap-1 bg-gray-800 rounded border border-gray-700 p-1">
            {(["2D", "3D", "Script", "AssetLib"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded transition-colors",
                  activeMode === mode
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePlay}
              className={cn("p-2 rounded transition-colors", engineState === "playing" ? "bg-green-600 text-white" : "hover:bg-gray-700 text-gray-300 hover:text-white")}
              title="Play"
            >
              <Play className="h-4 w-4" />
            </button>
            <button
              onClick={handlePause}
              className={cn("p-2 rounded transition-colors", engineState === "paused" ? "bg-yellow-600 text-white" : "hover:bg-gray-700 text-gray-300 hover:text-white")}
              title="Pause"
            >
              <Pause className="h-4 w-4" />
            </button>
            <button
              onClick={handleStop}
              className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white"
              title="Stop"
            >
              <Square className="h-4 w-4" />
            </button>
            {engineState !== "editor" && (
              <span className={cn("text-xs px-2 py-0.5 rounded font-mono ml-1", engineState === "playing" ? "bg-green-600/20 text-green-400" : "bg-yellow-600/20 text-yellow-400")}>
                {engineState === "playing" ? "▶ PLAYING" : "⏸ PAUSED"}
              </span>
            )}
          </div>

          {/* Platform Selector */}
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as "Desktop" | "Mobile")}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
          >
            <option value="Desktop">Desktop</option>
            <option value="Mobile">Mobile</option>
          </select>

          {/* Back Button */}
          <Button
            onClick={() => navigate("/dashboard?tab=projects")}
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-700 text-xs"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Panel */}
        <div className="hidden lg:flex w-64 shrink-0 bg-gray-900 border-r border-gray-700 flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setLeftPanelTab("Scene")}
              className={cn(
                "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                leftPanelTab === "Scene"
                  ? "border-blue-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              )}
            >
              Scene
            </button>
            <button
              onClick={() => setLeftPanelTab("FileSystem")}
              className={cn(
                "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                leftPanelTab === "FileSystem"
                  ? "border-blue-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              )}
            >
              FileSystem
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {leftPanelTab === "Scene" ? (
              <div className="p-2">
                {sceneNodes.map(node => renderSceneNode(node))}
              </div>
            ) : (
              <div className="p-2">
                <div className="text-xs text-gray-400 mb-2">res://</div>
                <div className="space-y-0.5">
                  {Object.keys(projectFiles).length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-4">No files in project</div>
                  ) : (
                    Object.keys(projectFiles).sort().map(path => (
                      <div key={path} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-800 cursor-pointer text-sm text-gray-300 rounded">
                        {getFileIcon(path)}
                        <span className="truncate">{path}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Viewport */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-950">
          {/* Viewport Header */}
          <div className="shrink-0 bg-gray-900 border-b border-gray-700 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-gray-300 truncate">{projectName}</span>
                <button className="text-gray-500 hover:text-gray-300">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white">
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white">
                  <Layers className="h-4 w-4" />
                </button>
                <button className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white">
                  <Lightbulb className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <select className="bg-gray-800 border border-gray-700 text-gray-300 px-2 py-1 rounded">
                <option>Transform</option>
                <option>View</option>
              </select>
            </div>
          </div>

          {/* 3D Canvas */}
          <div className="flex-1 relative overflow-hidden bg-gray-950 flex items-center justify-center p-4">
            <div 
              className={cn(
                "relative transition-all duration-500 ease-in-out flex items-center justify-center bg-black overflow-hidden",
                viewMode === "Desktop" 
                  ? "w-full h-full" 
                  : "w-full max-w-[800px] aspect-[19.5/9] rounded-[2.5rem] border-[8px] border-zinc-950 shadow-2xl shrink-0"
              )}
              style={viewMode === "Mobile" ? { maxHeight: '85%' } : undefined}
            >
              {viewMode === "Mobile" && (
                <>
                  {/* Front Camera cutout for realism */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-900 rounded-full z-10 shadow-inner pointer-events-none" />
                </>
              )}
              <canvas
                ref={canvasRef}
                className={cn(
                  "w-full h-full object-cover",
                  viewMode === "Mobile" && "rounded-[2rem]"
                )}
                style={{ outline: "none" }}
              />
            </div>
            
            {/* Viewport Label */}
            <div className="absolute top-2 left-2 text-xs text-gray-500 font-mono z-20 pointer-events-none">
              Perspective
            </div>
          </div>
        </div>

        {/* Right Panel - Inspector */}
        <div className="hidden lg:flex w-64 shrink-0 bg-gray-900 border-l border-gray-700 flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {(["Inspector", "Node", "History"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightPanelTab(tab)}
                className={cn(
                  "px-3 py-2 text-xs font-medium border-b-2 transition-colors",
                  rightPanelTab === tab
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-400 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {rightPanelTab === "Inspector" && (
              <div className="space-y-4">
                {selectedNode ? (
                  <>
                    <div className="text-xs font-semibold text-blue-400 border-b border-gray-700 pb-1">{selectedNode}</div>
                    
                    {selectedNode !== "root" && (
                      <>
                        {/* Position */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Position</div>
                          {(["x","y","z"] as const).map(axis => (
                            <div key={axis} className="flex items-center gap-1 mb-1">
                              <span className="text-xs text-gray-400 w-3 uppercase">{axis}</span>
                              <input type="number" step="0.1" value={inspectorPos[axis]}
                                onChange={e => setInspectorPos(p => ({...p, [axis]: +e.target.value}))}
                                className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded" />
                            </div>
                          ))}
                        </div>
                        {/* Rotation */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Rotation (°)</div>
                          {(["x","y","z"] as const).map(axis => (
                            <div key={axis} className="flex items-center gap-1 mb-1">
                              <span className="text-xs text-gray-400 w-3 uppercase">{axis}</span>
                              <input type="number" step="1" value={inspectorRot[axis]}
                                onChange={e => setInspectorRot(p => ({...p, [axis]: +e.target.value}))}
                                className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded" />
                            </div>
                          ))}
                        </div>
                        {/* Scale */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Scale</div>
                          {(["x","y","z"] as const).map(axis => (
                            <div key={axis} className="flex items-center gap-1 mb-1">
                              <span className="text-xs text-gray-400 w-3 uppercase">{axis}</span>
                              <input type="number" step="0.1" value={inspectorScale[axis]}
                                onChange={e => setInspectorScale(p => ({...p, [axis]: +e.target.value}))}
                                className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded" />
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Script Attachment (Available for root too) */}
                    <div className={cn("border-gray-700 pt-1", selectedNode !== "root" && "border-t pt-3")}>
                      <div className="text-xs text-gray-500 mb-1">Script</div>
                      <select
                        value={attachedScript}
                        onChange={e => {
                          const val = e.target.value
                          setAttachedScript(val)
                          if (val) gameScriptRunner.attachScript(selectedNode, val)
                          else gameScriptRunner.detachScript(selectedNode)
                        }}
                        className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
                      >
                        <option value="">None</option>
                        {scriptFiles.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-500 text-center py-8">
                    Select a mesh node to view properties
                  </div>
                )}
              </div>
            )}
            {rightPanelTab === "Node" && (
              <div className="text-xs text-gray-400 text-center py-8">
                Node tab content
              </div>
            )}
            {rightPanelTab === "History" && (
              <div className="text-xs text-gray-400 text-center py-8">
                History tab content
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="shrink-0 h-48 bg-gray-900 border-t border-gray-700 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-700 items-center">
          {(["Output", "Debugger", "Animation"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setBottomPanelTab(tab as any)}
              className={cn(
                "px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                bottomPanelTab === tab
                  ? "border-blue-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
          {bottomPanelTab === "Output" && (
            <button
              onClick={() => { gameScriptRunner.clearLogs(); setConsoleLogs([]) }}
              className="ml-auto mr-2 text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
          {bottomPanelTab === "Output" && (
            <div className="space-y-0.5">
              {consoleLogs.length === 0 ? (
                <div className="text-gray-500 py-2">No output yet. Press Play to run scripts.</div>
              ) : (
                consoleLogs.map((log, i) => (
                  <div key={i} className={cn(
                    "px-2 py-0.5 rounded",
                    log.level === "error" && "text-red-400 bg-red-900/10",
                    log.level === "warn" && "text-yellow-400 bg-yellow-900/10",
                    log.level === "log" && "text-gray-300"
                  )}>
                    <span className="text-gray-600 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    {log.message}
                  </div>
                ))
              )}
            </div>
          )}
          {bottomPanelTab === "Debugger" && (
            <div className="text-gray-500 text-center py-4">Debugger — breakpoints coming soon</div>
          )}
          {bottomPanelTab === "Animation" && (
            <div className="text-gray-500 text-center py-4">Animation editor coming soon</div>
          )}
        </div>
      </div>
    </div>
  )
}
