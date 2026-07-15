import {
  ArrowLeft,
  Box,
  ChevronDown,
  FileCode,
  FileImage,
  FileText,
  Folder,
  Music,
  Play,
  RotateCcw,
  Square
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";
import { loadProjectFilesFromStorage } from "../services/projectFiles";
import { getAllVFSFiles } from "../services/vfs";
import { useAppStore } from "../store/useAppStore";
import { bootWebContainer } from "../editor-runtime/WebContainerManager";
import { ProjectLoader } from "../editor-runtime/ProjectLoader";
import { DependencyScanner } from "../editor-runtime/DependencyScanner";
import { runtimeErrors } from "../editor-runtime/RuntimeErrors";

export function GameEngine() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const projectId = searchParams.get("projectId");
  const projectName = searchParams.get("name") || "New Project";

  // Store
  const { setGeneratedFiles, githubConnection } = useAppStore();

  // UI State
  const [leftPanelTab, setLeftPanelTab] = useState<"FileSystem">("FileSystem");
  const [bottomPanelTab, setBottomPanelTab] = useState<"Output" | "Errors">("Output");
  const [viewMode, setViewMode] = useState<"Desktop" | "Mobile">("Desktop");

  // WebContainer & Project State
  const [projectFiles, setProjectFiles] = useState<Record<string, string>>({});
  const [loader, setLoader] = useState<ProjectLoader | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [engineState, setEngineState] = useState<"stopped" | "booting" | "installing" | "starting" | "playing">("stopped");
  const [consoleLogs, setConsoleLogs] = useState<{ timestamp: number; message: string; type: "log" | "error" | "warn" }[]>([]);
  const [installLogs, setInstallLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState(runtimeErrors.getAll());

  useEffect(() => {
    const unsub = runtimeErrors.subscribe(setErrors);
    return unsub;
  }, []);

  // ── Sync VFS changes to WebContainer for Hot Reload ──────────────────────
  const { generatedFiles } = useAppStore();
  
  useEffect(() => {
    if (!loader || engineState !== "playing") return;
    
    const syncFiles = async () => {
      for (const [path, content] of Object.entries(generatedFiles)) {
        if (projectFiles[path] !== content) {
          try {
             await loader.updateFile(path, content);
             setProjectFiles(prev => ({ ...prev, [path]: content }));
          } catch(e) { console.error("Failed to sync file to WebContainer:", e) }
        }
      }
    };
    syncFiles();
  }, [generatedFiles, loader, engineState, projectFiles]);
  useEffect(() => {
    if (!projectId) return;
    const load = async () => {
      let files = await getAllVFSFiles(projectId);
      if (Object.keys(files).length === 0 && user) {
        files = await loadProjectFilesFromStorage(projectId, user.id, githubConnection);
      }
      setProjectFiles(files);
      setGeneratedFiles(files);
    };
    load().catch(console.error);
  }, [projectId, user, githubConnection, setGeneratedFiles]);

  const addLog = (message: string, type: "log" | "error" | "warn" = "log") => {
    setConsoleLogs(prev => [...prev, { timestamp: Date.now(), message, type }]);
  };

  const handlePlay = async () => {
    if (engineState !== "stopped" && engineState !== "playing") return; // Already transitioning
    
    setEngineState("booting");
    setInstallLogs([]);
    addLog("Booting WebContainer...", "log");

    try {
      const webcontainer = await bootWebContainer();
      const projLoader = new ProjectLoader(webcontainer);
      setLoader(projLoader);

      addLog("Loading project files...", "log");
      const finalFiles = await projLoader.loadProject(projectName, projectFiles);
      setProjectFiles(finalFiles); // Update with template files if it was empty

      // Scan dependencies and ensure they are installed
      // A more robust implementation would hook into package.json changes
      setEngineState("installing");
      addLog("Installing dependencies...", "log");
      
      const exitCode = await projLoader.installDependencies((log) => {
        setInstallLogs(prev => [...prev, log]);
      });

      if (exitCode !== 0) {
        addLog("Failed to install dependencies.", "error");
        setEngineState("stopped");
        return;
      }

      addLog("Dependencies installed. Starting dev server...", "log");
      setEngineState("starting");

      webcontainer.on('server-ready', (port, url) => {
        addLog(`Server ready at ${url}`, "log");
        setIframeUrl(url);
        setEngineState("playing");
      });

      await projLoader.startDevServer((log) => {
        addLog(log, "log");
      });

    } catch (error: any) {
      addLog(`Failed to start: ${error.message}`, "error");
      setEngineState("stopped");
    }
  };

  const handleStop = () => {
    // In a real implementation, we would kill the dev server process
    // For now, we just clear the iframe
    setIframeUrl("");
    setEngineState("stopped");
    addLog("Server stopped.", "log");
  };

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const getFileIcon = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase();
    if (["js", "ts", "json", "html"].includes(ext || "")) return <FileCode className="h-4 w-4 text-yellow-400" />;
    if (["png", "jpg", "jpeg", "svg"].includes(ext || "")) return <FileImage className="h-4 w-4 text-purple-400" />;
    if (["glb", "gltf", "obj"].includes(ext || "")) return <Box className="h-4 w-4 text-cyan-400" />;
    if (["mp3", "wav", "ogg"].includes(ext || "")) return <Music className="h-4 w-4 text-pink-400" />;
    return <FileText className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="flex h-screen flex-col bg-gray-800 overflow-hidden">
      {/* Top Menu Bar */}
      <div className="shrink-0 bg-gray-900 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 min-w-0">
             <span className="text-sm font-semibold text-gray-200 truncate">{projectName}</span>
           </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePlay}
              disabled={engineState !== "stopped" && engineState !== "playing"}
              className={cn("p-2 rounded transition-colors", engineState === "playing" ? "bg-green-600 text-white" : "hover:bg-gray-700 text-gray-300 hover:text-white disabled:opacity-50")}
              title="Start Dev Server"
            >
              <Play className="h-4 w-4" />
            </button>
            <button
              onClick={handleReload}
              disabled={engineState !== "playing"}
              className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white disabled:opacity-50"
              title="Reload Iframe"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={handleStop}
              className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white"
              title="Stop"
            >
              <Square className="h-4 w-4" />
            </button>
            {engineState !== "stopped" && (
              <span className={cn("text-xs px-2 py-0.5 rounded font-mono ml-1 bg-blue-600/20 text-blue-400")}>
                {engineState.toUpperCase()}
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
        <div className="flex w-64 shrink-0 bg-gray-900 border-r border-gray-700 flex-col">
          <div className="flex border-b border-gray-700">
            <button
              className="px-4 py-2 text-xs font-medium border-b-2 transition-colors border-blue-500 text-white"
            >
              FileSystem
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
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
        </div>

        {/* Center Viewport */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-950">
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
              {iframeUrl ? (
                 <iframe 
                   ref={iframeRef}
                   src={iframeUrl} 
                   className={cn(
                     "w-full h-full bg-white border-none",
                     viewMode === "Mobile" && "rounded-[2rem]"
                   )}
                   allow="cross-origin-isolated"
                 />
              ) : (
                <div className="text-gray-500 flex flex-col items-center">
                  <Play className="w-12 h-12 mb-4 opacity-50" />
                  <p>Press Play to start the Dev Server</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="shrink-0 h-64 bg-gray-900 border-t border-gray-700 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-700 items-center">
          {(["Output", "Errors"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setBottomPanelTab(tab)}
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
          <button
            onClick={() => setConsoleLogs([])}
            className="ml-auto mr-2 text-xs text-gray-500 hover:text-gray-300 px-2 py-1"
          >
            Clear
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
          {bottomPanelTab === "Output" && (
            <div className="space-y-0.5">
              {consoleLogs.map((log, i) => (
                <div key={i} className={cn(
                  "px-2 py-0.5 rounded",
                  log.type === "error" && "text-red-400 bg-red-900/10",
                  log.type === "warn" && "text-yellow-400 bg-yellow-900/10",
                  log.type === "log" && "text-gray-300"
                )}>
                  <span className="text-gray-600 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  {log.message}
                </div>
              ))}
              {engineState === "installing" && installLogs.map((log, i) => (
                 <div key={`install-${i}`} className="px-2 py-0.5 text-gray-400">
                   {log}
                 </div>
              ))}
            </div>
          )}
          {bottomPanelTab === "Errors" && (
            <div className="space-y-2">
              {errors.length === 0 ? (
                <div className="text-gray-500 py-2">No errors detected.</div>
              ) : (
                errors.map(err => (
                  <div key={err.id} className="p-2 bg-red-900/10 border border-red-900 rounded">
                     <div className="text-red-400 font-bold">{err.type.toUpperCase()}: {err.message}</div>
                     {err.stack && <pre className="text-red-300 mt-1 whitespace-pre-wrap">{err.stack}</pre>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
