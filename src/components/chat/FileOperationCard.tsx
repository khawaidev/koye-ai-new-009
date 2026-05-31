import {
  Image as ImageIcon,
  FileCode2,
  FileText,
  FileJson2,
  FileType2,
  FileAudio2,
  FileVideo2,
} from "lucide-react"
import { cn } from "../../lib/utils"

export interface FileOperation {
  type: 'create' | 'edit' | 'delete' | 'edit-image'
  path: string
  content?: string
  linesAdded?: number
  linesRemoved?: number
  prompt?: string
  model?: string
}

interface FileOperationCardProps {
  operation: FileOperation
}

function getFileIcon(path: string, type: string) {
  const ext = (path.split(".").pop() || "").toLowerCase()
  const isImage = type === 'edit-image' || /\.(png|jpe?g|gif|webp|svg)$/i.test(path)
  const isVideo = /\.(mp4|webm|mov|mkv)$/i.test(path)
  const isAudio = /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(path)
  
  if (isImage) return ImageIcon
  if (isVideo) return FileVideo2
  if (isAudio) return FileAudio2
  if (ext === "json") return FileJson2
  if (["ts", "tsx", "js", "jsx", "py", "rs", "go", "java", "cpp", "c", "cs", "gd", "lua", "sql", "html", "css", "scss"].includes(ext)) return FileCode2
  if (["md", "txt"].includes(ext)) return FileType2
  return FileText
}

function getIconColor(type: string) {
  switch (type) {
    case 'create': return 'text-emerald-400'
    case 'delete': return 'text-rose-400'
    case 'edit': return 'text-sky-400'
    case 'edit-image': return 'text-violet-400'
    default: return 'text-muted-foreground'
  }
}

export function FileOperationCard({ operation }: FileOperationCardProps) {
  const fileName = operation.path.split("/").pop() || operation.path
  const FileIcon = getFileIcon(operation.path, operation.type)
  const iconColor = getIconColor(operation.type)

  const linesAdded = operation.linesAdded ?? (operation.content ? operation.content.split("\n").length : 0)
  const linesRemoved = operation.linesRemoved ?? 0

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-border/50 bg-muted/30",
        "font-mono text-[11px] leading-none transition-colors hover:bg-muted/50"
      )}
    >
      <FileIcon className={cn("h-3.5 w-3.5 shrink-0", iconColor)} />
      <span className="text-foreground/80 truncate max-w-[120px]" title={operation.path}>
        {fileName}
      </span>
      {(linesAdded > 0 || linesRemoved > 0) && (
        <span className="flex items-center gap-1 shrink-0">
          {linesAdded > 0 && (
            <span className="text-emerald-400/80">+{linesAdded}</span>
          )}
          {linesRemoved > 0 && (
            <span className="text-rose-400/80">-{linesRemoved}</span>
          )}
        </span>
      )}
    </span>
  )
}
