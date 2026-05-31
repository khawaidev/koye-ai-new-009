import { useState, useMemo, useEffect, useRef } from "react"
import { Save, X } from "lucide-react"
import { detectFileType, getFileExtension } from "../../utils/fileTypeDetection"
import { useAppStore } from "../../store/useAppStore"
import { useAgentToolStore } from "../../store/useAgentToolStore"
import { useAuth } from "../../hooks/useAuth"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

interface CodeViewerProps {
  content: string
  fileName: string
  path?: string
}

export function CodeViewer({ content: initialContent, fileName, path }: CodeViewerProps) {
  const filePath = path || fileName
  const { addGeneratedFile, generatedFiles, currentProject, githubConnection } = useAppStore()
  const { user } = useAuth()
  const [editedContent, setEditedContent] = useState(initialContent)
  const [isDirty, setIsDirty] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const initialContentRef = useRef(initialContent)

  // Reactively subscribe to sandbox changes (this triggers re-render when sandbox mutates)
  const sandboxChanges = useAgentToolStore(s => s.sandboxChanges)
  const mergedFiles = useAgentToolStore(s => s.getMergedFiles(generatedFiles))

  // Update content when initialContent changes (file selection changed)
  useEffect(() => {
    initialContentRef.current = initialContent
    setEditedContent(initialContent)
    setIsDirty(false)
  }, [initialContent, filePath])

  // Also update if the file content changes in the store OR sandbox (from external save / agent edit / undo-redo)
  useEffect(() => {
    if (filePath && mergedFiles[filePath] !== undefined) {
      const mergedContent = mergedFiles[filePath]
      const isFocused = document.activeElement === textareaRef.current

      // Only sync if content differs and user is not actively typing in this editor
      if (mergedContent !== editedContent && !isFocused) {
        initialContentRef.current = mergedContent
        setEditedContent(mergedContent)
        setIsDirty(false)
      }
    }
  }, [mergedFiles, filePath, editedContent])

  const fileType = useMemo(() => detectFileType(filePath), [filePath])
  const extension = useMemo(() => getFileExtension(filePath), [filePath])

  // Map extensions to language names for display
  const language = useMemo(() => {
    const ext = extension.toLowerCase()
    const langMap: Record<string, string> = {
      js: "JavaScript",
      jsx: "JSX",
      ts: "TypeScript",
      tsx: "TSX",
      py: "Python",
      java: "Java",
      cpp: "C++",
      c: "C",
      h: "C Header",
      hpp: "C++ Header",
      cs: "C#",
      go: "Go",
      rs: "Rust",
      rb: "Ruby",
      php: "PHP",
      swift: "Swift",
      kt: "Kotlin",
      dart: "Dart",
      r: "R",
      scala: "Scala",
      clj: "Clojure",
      hs: "Haskell",
      vue: "Vue",
      svelte: "Svelte",
      html: "HTML",
      css: "CSS",
      scss: "SCSS",
      sass: "SASS",
      less: "Less",
      json: "JSON",
      xml: "XML",
      yaml: "YAML",
      yml: "YAML",
      toml: "TOML",
      ini: "INI",
      sh: "Shell",
      bash: "Bash",
      sql: "SQL",
      graphql: "GraphQL",
      gql: "GraphQL",
      lua: "Lua",
      md: "Markdown",
      markdown: "Markdown",
      txt: "Plain Text",
      log: "Log",
      dockerfile: "Dockerfile",
      makefile: "Makefile",
      cmake: "CMake",
      gitignore: "Git Ignore",
      gitattributes: "Git Attributes"
    }
    return langMap[ext] || ext.toUpperCase() || "Text"
  }, [extension])

  // Count lines for display
  const lineCount = useMemo(() => {
    return editedContent.split('\n').length
  }, [editedContent])

  // Compute changed lines for green overlay
  const changedLineIndices = useMemo(() => {
    const pendingChange = sandboxChanges.find(c => c.status === 'pending' && (c.path === filePath || c.newPath === filePath))
    
    if (!pendingChange) return new Set<number>()
    if (pendingChange.type === 'create') {
      return new Set(editedContent.split('\n').map((_, i) => i))
    }
    if (!pendingChange.originalContent) return new Set<number>()

    const origLines = pendingChange.originalContent.split('\n')
    const newLines = editedContent.split('\n')
    const changed = new Set<number>()

    // Simple heuristic: lines not in the original file exactly are considered "changed"
    const origSet = new Set(origLines)
    newLines.forEach((line, i) => {
      if (line.trim() !== '' && !origSet.has(line)) {
        changed.add(i)
      }
    })
    return changed
  }, [editedContent, filePath, sandboxChanges])

  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop
    }
    if (overlayRef.current) {
      overlayRef.current.scrollTop = e.currentTarget.scrollTop
      overlayRef.current.scrollLeft = e.currentTarget.scrollLeft
    }
  }

  // Debounced update to store/VFS
  const debouncedUpdateRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debouncedUpdateRef.current) clearTimeout(debouncedUpdateRef.current)
    }
  }, [])

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setEditedContent(newContent)
    setIsDirty(newContent !== initialContentRef.current)

    // Debounce updating the store and VFS immediately
    if (debouncedUpdateRef.current) clearTimeout(debouncedUpdateRef.current)
    debouncedUpdateRef.current = setTimeout(() => {
      if (filePath) {
        addGeneratedFile(filePath, newContent)

        // Keep selectedAsset in sync
        const { setSelectedAsset, selectedAsset } = useAppStore.getState()
        if (selectedAsset && (selectedAsset as any).path === filePath) {
          setSelectedAsset({
            ...selectedAsset,
            content: newContent
          } as any)
        }
      }
    }, 500)
  }

  // Handle save
  const handleSave = async () => {
    if (!filePath) return

    addGeneratedFile(filePath, editedContent)
    initialContentRef.current = editedContent
    setIsDirty(false)

    // Update the selectedAsset in store to reflect the change
    const { setSelectedAsset, selectedAsset } = useAppStore.getState()
    if (selectedAsset && (selectedAsset as any).path === filePath) {
      setSelectedAsset({
        ...selectedAsset,
        content: editedContent
      } as any)
    }

    // Also save to project if connected
    if (currentProject && user) {
      try {
        const { saveSingleProjectFile } = await import("../../services/projectFiles")
        await saveSingleProjectFile(
          currentProject.id,
          user.id,
          currentProject.name,
          filePath,
          editedContent,
          githubConnection
        )
        console.log(`Saved file ${filePath} to project: ${currentProject.name}`)
      } catch (error) {
        console.error("Error saving file to project:", error)
      }
    }
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if textarea is focused or no input is focused
      if (document.activeElement?.tagName === 'INPUT' && document.activeElement !== textareaRef.current) {
        return
      }

      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (isDirty && filePath) {
          handleSave()
        }
      }

      // Escape to cancel (revert changes) - only if textarea is focused
      if (e.key === 'Escape' && isDirty && document.activeElement === textareaRef.current) {
        if (confirm('Discard changes?')) {
          setEditedContent(initialContentRef.current)
          setIsDirty(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDirty, editedContent, initialContent, filePath])

  // Format content with line numbers for display
  const formattedContent = useMemo(() => {
    const lines = editedContent.split('\n')
    return lines.map((line, index) => ({
      number: index + 1,
      content: line
    }))
  }, [editedContent])

  return (
    <div className="flex h-full flex-col bg-background border-2 border-border font-mono">
      {/* File Header */}
      <div className="border-b-2 border-border px-4 py-2 flex items-center justify-between shrink-0 bg-muted/50">
        <div className="flex items-center gap-3">
          <span className="text-foreground font-mono text-xs font-bold">{fileName}</span>
          {language && (
            <span className="text-muted-foreground font-mono text-xs px-2 py-0.5 bg-muted/30 rounded">
              {language}
            </span>
          )}
          {isDirty && (
            <span className="text-orange-600 font-mono text-xs px-2 py-0.5 bg-orange-50 rounded border border-orange-200">
              • unsaved
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-muted-foreground font-mono text-xs">
            <span>{lineCount} lines</span>
            <span>{editedContent.length} chars</span>
          </div>
          {isDirty && filePath && (
            <div className="flex items-center gap-2 ml-4">
              <Button
                onClick={handleSave}
                className="bg-foreground text-background hover:bg-muted-foreground font-mono text-xs font-bold px-3 py-1.5 border-2 border-border shadow-[2px_2px_0px_0px_currentColor] hover:shadow-[1px_1px_0px_0px_currentColor] transition-all"
                title="Save (Ctrl+S)"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                SAVE
              </Button>
              <Button
                onClick={() => {
                  if (confirm('Discard changes?')) {
                    setEditedContent(initialContentRef.current)
                    setIsDirty(false)
                  }
                }}
                variant="outline"
                className="border-2 border-border bg-background text-foreground hover:bg-muted font-mono text-xs font-bold px-3 py-1.5 shadow-[2px_2px_0px_0px_currentColor] hover:shadow-[1px_1px_0px_0px_currentColor] transition-all"
                title="Discard (Esc)"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Code Editor with Line Numbers */}
      <div className="flex-1 overflow-hidden bg-background relative flex">
        {/* Line Numbers (synced scroll) */}
        <div 
          ref={lineNumbersRef}
          className="bg-muted/50 border-r-2 border-border px-3 py-2 text-right text-muted-foreground font-mono text-xs select-none z-10 overflow-hidden shrink-0"
          style={{ minWidth: '3.5rem' }}
        >
          {formattedContent.map((line) => (
            <div key={line.number} className="leading-6">
              {line.number}
            </div>
          ))}
          {/* Extra padding to allow scrolling past the end slightly */}
          <div className="h-4"></div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Overlay for line highlights (synced scroll) */}
          <div 
            ref={overlayRef}
            className="absolute inset-0 px-4 py-2 pointer-events-none font-mono text-sm leading-6 whitespace-pre text-transparent overflow-hidden"
            aria-hidden="true"
          >
            {formattedContent.map((line, index) => {
              const isChanged = changedLineIndices.has(index)
              return (
                <div key={index} className={cn("min-h-[1.5rem] min-w-max", isChanged ? "bg-green-500/20 rounded-[2px]" : "")}>
                  {line.content || '\u00A0'}
                </div>
              )
            })}
            <div className="h-4"></div>
          </div>

          <textarea
            ref={textareaRef}
            value={editedContent}
            onChange={handleContentChange}
            onScroll={handleScroll}
            className="absolute inset-0 w-full h-full px-4 py-2 font-mono text-sm text-foreground bg-transparent resize-none outline-none border-none leading-6 whitespace-pre overflow-auto"
            style={{
              fontFamily: 'monospace',
              tabSize: 2,
            }}
            spellCheck={false}
            placeholder="Start typing..."
          />
        </div>
      </div>

      {/* Footer with hints */}
      {isDirty ? (
        <div className="border-t-2 border-border px-4 py-2 bg-muted/50 text-muted-foreground font-mono text-xs">
          <span>Press <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded">Ctrl+S</kbd> to save, <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded">Esc</kbd> to discard</span>
        </div>
      ) : changedLineIndices.size > 0 ? (
        <div className="border-t-2 border-green-500/30 px-4 py-2 bg-green-500/10 text-green-600/80 font-mono text-xs flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500/80" />
          <span>{changedLineIndices.size} lines modified by AI agent (pending approval)</span>
        </div>
      ) : null}
    </div>
  )
}
