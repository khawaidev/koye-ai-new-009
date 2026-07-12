import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { ChevronRight, File, Folder, FolderOpen, X } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { loadProjectFilesFromStorage } from "../services/projectFiles"
import { useAppStore } from "../store/useAppStore"
import { cn } from "../lib/utils"
import { AppIcon } from "../components/ui/AppIcon"

interface FileNode {
  name: string
  path: string
  type: "file" | "folder"
  children?: FileNode[]
}

function buildFileTree(files: Record<string, string>): FileNode[] {
  const root: FileNode[] = []
  const folderMap = new Map<string, FileNode>()

  const paths = Object.keys(files).sort()

  for (const path of paths) {
    const parts = path.split("/")
    let currentLevel = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const currentPath = parts.slice(0, i + 1).join("/")
      const isFolder = i < parts.length - 1

      let node = currentLevel.find((n) => n.name === part && n.type === (isFolder ? "folder" : "file"))

      if (!node) {
        node = {
          name: part,
          path: currentPath,
          type: isFolder ? "folder" : "file",
          children: isFolder ? [] : undefined,
        }
        currentLevel.push(node)
      }

      if (isFolder && node.children) {
        currentLevel = node.children
      }
    }
  }

  return root
}

function TreeNode({
  node,
  selectedPath,
  onSelect,
  depth = 0,
  expandedFolders,
  onToggleFolder,
}: {
  node: FileNode
  selectedPath: string | null
  onSelect: (path: string) => void
  depth?: number
  expandedFolders: Set<string>
  onToggleFolder: (path: string) => void
}) {
  const isExpanded = expandedFolders.has(node.path)
  const isSelected = selectedPath === node.path

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => onToggleFolder(node.path)}
          className={cn(
            "w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm hover:bg-muted/60 transition-colors text-left",
            isSelected && "bg-muted"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 transition-transform", isExpanded && "rotate-90")} />
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-yellow-500" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-yellow-500" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                selectedPath={selectedPath}
                onSelect={onSelect}
                depth={depth + 1}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => onSelect(node.path)}
      className={cn(
        "w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm hover:bg-muted/60 transition-colors text-left",
        isSelected && "bg-muted"
      )}
      style={{ paddingLeft: `${depth * 16 + 28}px` }}
    >
      <File className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{node.name}</span>
    </button>
  )
}

export function ProjectFiles() {
  const { projectId } = useParams()
  const { user } = useAuth()
  const { githubConnection, currentProject } = useAppStore()
  const [files, setFiles] = useState<Record<string, string>>({})
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  const effectiveProjectId = projectId || currentProject?.id

  useEffect(() => {
    if (!effectiveProjectId || !user) return

    const loadFiles = async () => {
      setIsLoading(true)
      try {
        const loadedFiles = await loadProjectFilesFromStorage(
          effectiveProjectId,
          user.id,
          githubConnection
        )
        setFiles(loadedFiles)

        // Auto-select first file if none selected
        if (Object.keys(loadedFiles).length > 0 && !selectedFile) {
          const firstFile = Object.keys(loadedFiles)[0]
          setSelectedFile(firstFile)
          // Expand root folder
          const parts = firstFile.split("/")
          if (parts.length > 1) {
            setExpandedFolders(new Set([parts[0]]))
          }
        }
      } catch (error) {
        console.error("Failed to load project files:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFiles()
  }, [effectiveProjectId, user, githubConnection])

  const fileTree = buildFileTree(files)

  const handleToggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const selectedContent = selectedFile ? files[selectedFile] : null

  // Get file extension for syntax highlighting class
  const getLanguage = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase()
    const langMap: Record<string, string> = {
      js: "javascript",
      jsx: "jsx",
      ts: "typescript",
      tsx: "tsx",
      json: "json",
      html: "html",
      css: "css",
      md: "markdown",
      py: "python",
      txt: "text",
    }
    return langMap[ext || ""] || "text"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project files...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left sidebar - File Tree */}
      <div className="w-72 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <AppIcon alt="Project" className="w-6 h-6 rounded" />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">{currentProject?.name || "Project Files"}</h2>
            <p className="text-xs text-muted-foreground truncate">{Object.keys(files).length} files</p>
          </div>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto p-2">
          {fileTree.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              selectedPath={selectedFile}
              onSelect={setSelectedFile}
              expandedFolders={expandedFolders}
              onToggleFolder={handleToggleFolder}
            />
          ))}
        </div>
      </div>

      {/* Main content - File viewer */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedFile ? (
          <>
            {/* File header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <File className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{selectedFile.split("/").pop()}</p>
                <p className="text-xs text-muted-foreground truncate">{selectedFile}</p>
              </div>
            </div>

            {/* File content */}
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap break-all">
                <code>{selectedContent}</code>
              </pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a file to view its contents</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectFiles
