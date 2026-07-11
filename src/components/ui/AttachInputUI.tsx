import React, { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Paperclip, X, FileText, Film, Image as ImageIcon, Upload, Clipboard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AttachedFile {
  id: string
  file: File
  preview?: string
  type: 'image' | 'video' | 'text' | 'other'
}

interface AttachInputUIProps {
  onFilesAttached: (files: File[]) => void
  onTextPasted?: (text: string) => void
  disabled?: boolean
  maxFiles?: number
  className?: string
}

export function AttachInputUI({
  onFilesAttached,
  onTextPasted,
  disabled = false,
  maxFiles = 10,
  className
}: AttachInputUIProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)

  const getFileType = (file: File): 'image' | 'video' | 'text' | 'other' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('text/') || file.name.match(/\.(md|js|ts|jsx|tsx|html|css|json|py|txt)$/i)) return 'text'
    return 'other'
  }

  const createPreview = (file: File): string | undefined => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      return URL.createObjectURL(file)
    }
    return undefined
  }

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    
    const newFiles: File[] = []
    const existingCount = attachedFiles.length
    
    Array.from(files).forEach((file) => {
      if (existingCount + newFiles.length >= maxFiles) return
      newFiles.push(file)
    })
    
    if (newFiles.length > 0) {
      const attached: AttachedFile[] = newFiles.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        file,
        preview: createPreview(file),
        type: getFileType(file)
      }))
      
      setAttachedFiles((prev) => [...prev, ...attached])
      onFilesAttached(newFiles)
    }
  }, [attachedFiles.length, maxFiles, onFilesAttached])

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (!disabled) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const FileIcon = ({ type }: { type: 'image' | 'video' | 'text' | 'other' }) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-5 w-5" />
      case 'video':
        return <Film className="h-5 w-5" />
      case 'text':
        return <FileText className="h-5 w-5" />
      default:
        return <Paperclip className="h-5 w-5" />
    }
  }

  return (
    <div className={cn("relative", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,text/*,.md,.js,.ts,.jsx,.tsx,.html,.css,.json,.py"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Attached Files Preview */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mb-3 px-1"
          >
            {attachedFiles.map((attached) => (
              <motion.div
                key={attached.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group relative flex items-center gap-2 bg-muted/80 dark:bg-[#262625] border border-border/60 dark:border-[#323230] rounded-xl px-3 py-2 pr-10"
              >
                {attached.preview ? (
                  attached.type === 'image' ? (
                    <img
                      src={attached.preview}
                      alt={attached.file.name}
                      className="h-10 w-10 rounded-lg object-cover border border-border/40"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg border border-border/40 flex items-center justify-center bg-muted/50">
                      <FileIcon type={attached.type} />
                    </div>
                  )
                ) : (
                  <div className="h-10 w-10 rounded-lg border border-border/40 flex items-center justify-center bg-muted/50">
                    <FileIcon type={attached.type} />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                    {attached.file.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {(attached.file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(attached.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 dark:bg-[#0a0a0b]/95 border-2 border-dashed border-foreground/30 dark:border-white/30 rounded-2xl"
          >
            <div className="flex flex-col items-center gap-3 text-foreground/70">
              <Upload className="h-10 w-10" />
              <span className="text-sm font-medium">Drop files here</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attach Menu Button */}
      <div className="relative inline-flex">
        <button
          type="button"
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          disabled={disabled}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200",
            showAttachMenu
              ? "bg-foreground text-background border-foreground"
              : "border-border/60 hover:border-foreground/30 hover:bg-muted/50 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <AnimatePresence>
          {showAttachMenu && !disabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 w-56 bg-background dark:bg-[#1a1a18] border border-border/60 dark:border-[#323230] shadow-xl rounded-2xl overflow-hidden z-50"
            >
              <div className="p-2">
                <button
                  onClick={() => {
                    fileInputRef.current?.click()
                    setShowAttachMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/60 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-foreground/10">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Upload from device</div>
                    <div className="text-xs text-muted-foreground">Images, videos, files</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    // Trigger paste functionality
                    navigator.clipboard.readText().then((text) => {
                      if (text) {
                        onTextPasted?.(text)
                      }
                    })
                    setShowAttachMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted/60 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-foreground/10">
                    <Clipboard className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Paste from clipboard</div>
                    <div className="text-xs text-muted-foreground">Text or images</div>
                  </div>
                </button>
              </div>

              <div className="px-3 py-2 border-t border-border/40 dark:border-[#323230]/40">
                <p className="text-[10px] text-muted-foreground text-center">
                  Supports: JPG, PNG, GIF, MP4, MD, JS, TS, JSON
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Paste handler hook for text input areas
export function usePasteHandler(onPaste: (text: string) => void) {
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardData = e.clipboardData
    
    // Handle text paste
    const textData = clipboardData.getData('text/plain')
    if (textData) {
      e.preventDefault()
      onPaste(textData)
      return
    }

    // Handle image paste
    const imageItems = Array.from(clipboardData.items).filter(
      (item) => item.type.startsWith('image/')
    )
    
    if (imageItems.length > 0) {
      e.preventDefault()
      const _files = imageItems.map((item) => item.getAsFile()).filter(Boolean) as File[]
      // Would need to handle image files separately
    }
  }, [onPaste])

  return handlePaste
}
