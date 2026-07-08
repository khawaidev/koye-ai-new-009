import { Play, Save, Folder, Eye, Download } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"

interface BuilderHeaderProps {
    projectName: string
    activeTab: 'files' | 'preview'
    onTabChange: (tab: 'files' | 'preview') => void
    onSave?: () => void
    hasUnsavedChanges?: boolean
    onDownload?: () => void
    onPublish?: () => void
    onPlay?: () => void
    isPlaying?: boolean
}

export function BuilderHeader({ projectName, activeTab, onTabChange, onSave, hasUnsavedChanges, onDownload, onPublish, onPlay, isPlaying }: BuilderHeaderProps) {

    return (
        <div className="h-14 border-b-2 border-border bg-background flex items-center justify-between px-3 sm:px-6 shrink-0 font-mono text-foreground">
            <div className="flex items-center gap-3 min-w-0">
                {/* Left: Files/Preview Toggles */}
                <div className="flex bg-muted/50 border border-border p-1 rounded-md">
                    <button
                        onClick={() => onTabChange('files')}
                        className={cn(
                            "flex items-center gap-2 px-2 sm:px-3 py-1.5 text-xs font-mono font-bold rounded-sm transition-colors",
                            activeTab === 'files' 
                                ? "bg-background text-foreground shadow-sm" 
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Folder className="w-3.5 h-3.5" />
                        FILES
                    </button>
                    <button
                        onClick={() => onTabChange('preview')}
                        className={cn(
                            "flex items-center gap-2 px-2 sm:px-3 py-1.5 text-xs font-mono font-bold rounded-sm transition-colors",
                            activeTab === 'preview' 
                                ? "bg-background text-foreground shadow-sm" 
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        PREVIEW
                    </button>
                </div>

                <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

                {/* Right of Toggles: Project Name */}
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-foreground truncate max-w-[160px] sm:max-w-none">{projectName}</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {onSave && hasUnsavedChanges && (
                    <Button
                        onClick={onSave}
                        className="bg-green-500 text-white border-green-600 hover:bg-green-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] font-mono text-xs font-bold flex items-center gap-2 px-3 h-7 border-2 transition-all rounded-md"
                    >
                        <Save className="h-3.5 w-3.5" />
                        SAVE
                    </Button>
                )}

                {/* Download icon left of publish */}
                {onDownload && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDownload}
                        className="h-7 w-7 hover:bg-muted text-foreground border border-border bg-muted/50 transition-colors rounded-md"
                        title="Download Project Files"
                    >
                        <Download className="h-3.5 w-3.5" />
                    </Button>
                )}

                {onPlay && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onPlay}
                        className={cn(
                            "h-7 w-7 hover:bg-muted text-foreground border border-border bg-muted/50 transition-colors rounded-md",
                            isPlaying && "bg-foreground text-background hover:bg-foreground/90"
                        )}
                        title={isPlaying ? "Back to File Preview" : "Play Game"}
                    >
                        <Play className="h-3.5 w-3.5" />
                    </Button>
                )}

                {/* Extreme Right: Publish btn */}
                {onPublish && (
                    <Button
                        onClick={onPublish}
                        className="bg-foreground text-background border-foreground hover:bg-muted-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] font-mono text-xs font-bold flex items-center gap-2 px-3 h-7 border-2 transition-all rounded-md"
                    >
                        PUBLISH
                    </Button>
                )}
            </div>
        </div>
    )
}
