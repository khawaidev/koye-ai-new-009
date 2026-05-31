import { ArrowUp, File, FolderClosed, Mic, Plus, Square, X, Paperclip, AtSign, Film, FileText, Zap, Rocket, ChevronDown, ChevronUp, Sparkles, Crown, Check } from "lucide-react"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useAnimationFrame, useMotionValue, useTransform } from "framer-motion"
import { cn } from "../../lib/utils"
import { useAppStore } from "../../store/useAppStore"
import { TaskBar } from "../tasks/TaskBar"
import { PixelImage } from "../ui/pixel-image"
import { usePricing } from "../../hooks/usePricing"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../../components/theme-provider"
import type { ModelMode } from "../../types"

interface ChatInputProps {
  onSend: (message: string, images: File[], mentionedFiles?: string[]) => void
  onStop?: () => void
  disabled?: boolean
  isGenerating?: boolean
  variant?: "hero" | "docked"
  placeholder?: string
  promptChips?: string[]
}

interface FileMention {
  path: string
  name: string
  type: 'file' | 'folder'
}

const MANUAL_MODELS = [

  { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", icon: "/images/aimodels/GEMINI-ICON.png" },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", icon: "/images/aimodels/GEMINI-ICON.png" },
  { id: "claude-opus-4-7-thinking", name: "Claude Opus 4.7 Thinking", icon: "/images/aimodels/CLAUDE-ICON.png" },
  { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5", icon: "/images/aimodels/CLAUDE-ICON.png" },
  { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro", icon: "/images/aimodels/DEEPSEEK-ICON.webp" },
  { id: "moonshotai/kimi-k2.6:free", name: "Kimi K2.6", icon: "/images/aimodels/KIMI.png" },
  { id: 'gpt-oss-120b', name: "GPT OSS 120B", icon: "/images/aimodels/GPT-ICON-WHITE.png"},
  { id: "Qwen 3 235B A22B Thinking 2507", name: "Qwen 3 235B Thinking", icon: "/images/aimodels/Qwen.png" },

] as const

function ShinyText({
  text,
  disabled = false,
  speed = 2,
  className = "",
  color = "#b5b5b5",
  shineColor = "#ffffff",
  spread = 120,
  delay = 0,
}: {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
  color?: string
  shineColor?: string
  spread?: number
  delay?: number
}) {
  const progress = useMotionValue(0)
  const elapsedRef = useRef(0)
  const lastTimeRef = useRef<number | null>(null)
  const animationDuration = speed * 1000
  const delayDuration = delay * 1000

  useAnimationFrame((time) => {
    if (disabled) {
      lastTimeRef.current = null
      return
    }
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time
      return
    }
    const deltaTime = time - lastTimeRef.current
    lastTimeRef.current = time
    elapsedRef.current += deltaTime
    const cycleDuration = animationDuration + delayDuration
    const cycleTime = elapsedRef.current % cycleDuration
    if (cycleTime < animationDuration) {
      const p = (cycleTime / animationDuration) * 100
      progress.set(p)
    } else {
      progress.set(100)
    }
  })

  const backgroundPosition = useTransform(progress, (p) => `${150 - p * 2}% center`)
  const gradientStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }

  return (
    <motion.span className={className} style={{ ...gradientStyle, backgroundPosition }}>
      {text}
    </motion.span>
  )
}

function GleamBorder({ active, roundedClassName = "rounded-xl" }: { active: boolean; roundedClassName?: string }) {
  return (
    <motion.div
      className={cn("absolute inset-0 pointer-events-none", roundedClassName)}
      style={{
        backgroundImage:
          "linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 45%, rgba(255,255,255,0.65) 55%, rgba(255,255,255,0) 100%)",
        backgroundSize: "220% 220%",
        padding: "1px",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
      animate={
        active
          ? { opacity: 1, backgroundPosition: ["0% 100%", "100% 0%"] }
          : { opacity: 0, backgroundPosition: "0% 100%" }
      }
      transition={active ? { duration: 1.35, repeat: Infinity, ease: "linear" } : { duration: 0.15 }}
    />
  )
}

export function ChatInput({
  onSend,
  onStop,
  disabled,
  isGenerating,
  variant = "docked",
  placeholder,
  promptChips = [],
}: ChatInputProps) {
  const {
    currentProject,
    generatedFiles,
    messages,
    selectedModelMode,
    selectedModelId,
    setSelectedModelMode,
    setSelectedModelId,
  } = useAppStore()
  const { subscription } = usePricing()
  const navigate = useNavigate()
  const { theme } = useTheme()

  const [images, setImages] = useState<File[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionSearch, setSuggestionSearch] = useState("")
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [showManualModelList, setShowManualModelList] = useState(false)
  const [inputHeight, setInputHeight] = useState(52)
  const [isInputEmpty, setIsInputEmpty] = useState(true)
  const [isParaliumHovered, setIsParaliumHovered] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const plusMenuRef = useRef<HTMLDivElement>(null)
  const modelSelectorRef = useRef<HTMLDivElement>(null)

  const hasMessages = messages.length > 0
  const isHero = variant === "hero"
  const resolvedPlaceholder = placeholder || (currentProject ? "Describe your game idea.. or use @ to mention files" : "Write a message...")
  const selectedManualModel = MANUAL_MODELS.find((m) => m.id === selectedModelId)
  const selectedManualModelIconClassName = cn(
    "w-4 h-4 object-contain",
    selectedModelId.startsWith("gpt") && theme === "light" ? "invert" : "",
    selectedModelId.startsWith("deepseek") ? "purple" : ""
  )
  const paraliumShineColor = theme === "light" ? "#0b0f19" : "#ffffff"
  const paraliumBaseColor = theme === "light" ? "#6b7280" : "#b5b5b5"

  const showUpgradeButton = React.useMemo(() => {
    const planName = (subscription?.planName || "FREE").toUpperCase()
    const isTrial = subscription?.status === "trial"
    return planName === "FREE" || planName === "INDIE" || isTrial
  }, [subscription?.planName, subscription?.status])

  const upgradeButtonLabel = React.useMemo(() => {
    const planName = (subscription?.planName || "FREE").toUpperCase()
    if (planName === "INDIE") return "Upgrade to Pro"
    if (subscription?.status === "trial") return "Upgrade to Pro"
    return "Upgrade Plan"
  }, [subscription?.planName, subscription?.status])

  // Get available files and folders from project
  const availableFiles = React.useMemo(() => {
    if (!currentProject || !generatedFiles) return []
    const fileKeys = Object.keys(generatedFiles)
    const files = fileKeys.map(path => ({
      path,
      name: path.split('/').pop() || path,
      type: 'file' as const
    }))
    const folders = new Set<string>()
    fileKeys.forEach(path => {
      const parts = path.split('/')
      for (let i = 0; i < parts.length - 1; i++) {
        folders.add(parts.slice(0, i + 1).join('/'))
      }
    })
    const folderItems = Array.from(folders).map(path => ({
      path,
      name: path.split('/').pop() || path,
      type: 'folder' as const
    }))
    return [...folderItems, ...files]
  }, [currentProject, generatedFiles])

  const filteredFiles = React.useMemo(() => {
    if (!suggestionSearch) return availableFiles
    const search = suggestionSearch.toLowerCase()
    return availableFiles.filter(item =>
      item.name.toLowerCase().includes(search) ||
      item.path.toLowerCase().includes(search)
    )
  }, [availableFiles, suggestionSearch])

  const handleSend = () => {
    if (!editorRef.current) return
    const clone = editorRef.current.cloneNode(true) as HTMLDivElement
    const mentions: string[] = []
    const chips = clone.querySelectorAll('.mention-chip')
    chips.forEach((chip) => {
      const path = chip.getAttribute('data-path')
      if (path) {
        mentions.push(path)
        chip.textContent = `@${path} `
      }
    })
    const textContent = clone.textContent || ""
    if (textContent.trim() || images.length > 0 || mentions.length > 0) {
      onSend(textContent, images, mentions)
      editorRef.current.innerHTML = ""
      setIsInputEmpty(true)
      setImages([])
      setShowSuggestions(false)
      setSuggestionSearch("")
      setInputHeight(52) // Collapse to original size
    }
  }

  const applyPromptChip = (text: string) => {
    if (!editorRef.current || disabled || isGenerating) return
    editorRef.current.innerText = text
    setIsInputEmpty(text.length === 0)
    setInputHeight(52)
    editorRef.current.focus()
    const selection = window.getSelection()
    const range = document.createRange()
    range.selectNodeContents(editorRef.current)
    range.collapse(false)
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  const getTextBeforeCursor = (): string | null => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return null
    const range = selection.getRangeAt(0)
    const preRange = document.createRange()
    preRange.selectNodeContents(editorRef.current)
    preRange.setEnd(range.startContainer, range.startOffset)
    const fragment = preRange.cloneContents()
    const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT)
    let fullText = ''
    while (walker.nextNode()) {
      fullText += walker.currentNode.textContent || ''
    }
    return fullText
  }

  const handleInput = () => {
    if (!editorRef.current) return

    const text = editorRef.current.innerText || ""
    setIsInputEmpty(text.length === 0)

    // Auto-resize input based on content
    const newHeight = Math.min(Math.max(editorRef.current.scrollHeight, 52), 200)
    setInputHeight(newHeight)

    const textBeforeCursor = getTextBeforeCursor()
    if (textBeforeCursor === null) return
    const lastAt = textBeforeCursor.lastIndexOf('@')
    if (lastAt !== -1 && currentProject) {
      const query = textBeforeCursor.substring(lastAt + 1)
      if (!query.includes(' ')) {
        setSuggestionSearch(query)
        setShowSuggestions(true)
        setSelectedSuggestionIndex(0)
        return
      }
    }
    setShowSuggestions(false)
  }

  const insertMention = (file: FileMention) => {
    if (!editorRef.current) return
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    const textNode = range.startContainer
    if (textNode.nodeType === Node.TEXT_NODE) {
      const text = textNode.textContent || ""
      const cursorOffset = range.startOffset
      const lastAt = text.substring(0, cursorOffset).lastIndexOf('@')
      if (lastAt !== -1) {
        const chip = document.createElement('span')
        chip.className = 'mention-chip inline-flex items-center gap-1 bg-blue-100 border border-blue-500 rounded px-1 text-blue-700 font-bold mx-1 select-none'
        chip.contentEditable = 'false'
        chip.setAttribute('data-path', file.path)
        chip.innerHTML = `@${file.name} <span class="mention-remove cursor-pointer hover:text-red-600 ml-0.5 opacity-0 transition-opacity">×</span>`
        if (!document.getElementById('mention-styles')) {
          const style = document.createElement('style')
          style.id = 'mention-styles'
          style.textContent = '.mention-chip:hover .mention-remove { opacity: 1 !important; }'
          document.head.appendChild(style)
        }
        const afterText = text.substring(cursorOffset)
        const beforeText = text.substring(0, lastAt)
        const afterNode = document.createTextNode(afterText + '\u00A0')
        const beforeNode = document.createTextNode(beforeText)
        const parent = textNode.parentNode
        if (parent) {
          parent.insertBefore(beforeNode, textNode)
          parent.insertBefore(chip, textNode)
          parent.insertBefore(afterNode, textNode)
          parent.removeChild(textNode)
          const newRange = document.createRange()
          newRange.setStart(afterNode, 1)
          newRange.setEnd(afterNode, 1)
          selection.removeAllRanges()
          selection.addRange(newRange)
        }
      }
    }
    setShowSuggestions(false)
    setSuggestionSearch("")
    editorRef.current.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && filteredFiles.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => prev < filteredFiles.length - 1 ? prev + 1 : prev)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => prev > 0 ? prev - 1 : 0)
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        insertMention(filteredFiles[selectedSuggestionIndex])
        return
      } else if (e.key === 'Escape') {
        setShowSuggestions(false)
        return
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('mention-remove')) {
      const chip = target.closest('.mention-chip')
      if (chip) chip.remove()
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages((prev) => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const triggerMentionMenu = () => {
    setShowPlusMenu(false)
    if (!editorRef.current) return
    editorRef.current.focus()
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const textNode = document.createTextNode('@')
      range.insertNode(textNode)
      range.setStartAfter(textNode)
      range.setEndAfter(textNode)
      selection.removeAllRanges()
      selection.addRange(range)
    } else {
      editorRef.current.innerText += '@'
    }
    setSuggestionSearch("")
    setShowSuggestions(true)
    setSelectedSuggestionIndex(0)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (suggestionsRef.current && !suggestionsRef.current.contains(target)) {
        setShowSuggestions(false)
      }
      if (plusMenuRef.current && !plusMenuRef.current.contains(target)) {
        setShowPlusMenu(false)
      }
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(target)) {
        setShowModelSelector(false)
        setShowManualModelList(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn("space-y-3", isHero ? "mb-0" : "mb-[15px]")}>
      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-mini">
          {images.map((img, idx) => {
            const isImage = img.type.startsWith('image/')
            const isVideo = img.type.startsWith('video/')
            return (
              <div key={idx} className="relative shrink-0 group flex flex-col items-center">
                {isImage ? (
                  <PixelImage
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${idx + 1}`}
                    className="h-16 w-16 rounded-lg border border-black shadow-md object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg border border-black shadow-md flex flex-col items-center justify-center bg-muted/80 text-muted-foreground p-1">
                    {isVideo ? <Film className="h-6 w-6 mb-1 text-foreground" /> : <FileText className="h-6 w-6 mb-1 text-foreground" />}
                    <span className="text-[8px] font-mono leading-tight truncate w-full text-center tracking-tighter" title={img.name}>{img.name}</span>
                  </div>
                )}
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -right-1 -top-1 rounded-full bg-background border border-border p-1 shadow-lg hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
                >
                  <X className="h-3 w-3 text-foreground" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <TaskBar />

      <div className="relative flex items-center">
        <div className="flex-1 relative">
          <div
            className={cn(
              "flex flex-col gap-3 border px-3 py-3 shadow-sm transition-all duration-200",
              inputHeight > 88 || isHero ? "rounded-2xl" : "rounded-xl",
              images.length > 0
                ? "bg-card/95 backdrop-blur-xl border-border shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                : "bg-background border-border",
              isHero && "px-4 py-3 bg-card/90 border-border/70 shadow-[0_20px_50px_rgba(15,15,15,0.08)] dark:bg-[#262625] dark:border-[#323230] dark:shadow-[0_28px_80px_rgba(0,0,0,0.42)]",
              !isHero && "bg-card/88 border-border/80 dark:bg-[#262625] dark:border-[#323230] dark:shadow-[0_16px_40px_rgba(0,0,0,0.26)]",
              "focus-within:border-foreground/15 dark:focus-within:border-[#4d4c49] focus-within:shadow-md"
            )}
            style={{ minHeight: `${Math.max(inputHeight + 38, isHero ? 86 : 108)}px`, height: 'auto' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,text/*,.md,.js,.ts,.jsx,.tsx,.html,.css,.json,.py"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="relative flex-1 flex flex-col min-h-[42px]">
              {isInputEmpty && (
                <div
                  className={cn(
                    "absolute inset-0 pointer-events-none text-muted-foreground/50 font-[var(--chat-font)] tracking-[-0.01em] select-none",
                    isHero ? "text-[17px] leading-7" : "text-[17px] leading-7"
                  )}
                >
                  {resolvedPlaceholder}
                </div>
              )}
              <div
                ref={editorRef}
                contentEditable={!disabled && !isGenerating}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onKeyUp={handleInput}
                onPaste={() => setTimeout(handleInput, 0)}
                onCut={() => setTimeout(handleInput, 0)}
                onClick={handleEditorClick}
                className={cn(
                  "flex-1 bg-transparent border-0 outline-none text-foreground focus:ring-0 focus:outline-none break-all whitespace-pre-wrap overflow-y-auto font-[var(--chat-font)] tracking-[-0.01em]",
                  isHero
                    ? "text-[17px] leading-7 min-h-[44px]"
                    : "text-[17px] leading-7 min-h-[42px]"
                )}
                style={{ minHeight: '24px', maxHeight: '200px' }}
              />
            </div>

            <div className="flex items-center justify-between gap-2 -ml-1.5 -mb-1">
              <div className="relative" ref={plusMenuRef}>
                <button
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  disabled={disabled || isGenerating}
                  className={cn(
                    "shrink-0 flex items-center justify-center w-9 h-9 rounded-full border border-transparent transition-colors disabled:opacity-50",
                    showPlusMenu
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-white/5"
                  )}
                  aria-label="Add attachment"
                >
                  <Plus className={cn("h-5 w-5 transition-transform", showPlusMenu && "rotate-45")} />
                </button>
                <AnimatePresence>
                  {showPlusMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 mb-2 w-52 bg-popover border border-border shadow-lg rounded-2xl overflow-hidden z-50 py-1 dark:bg-[#262625] dark:border-[#323230]"
                    >
                      <button
                        onClick={() => { fileInputRef.current?.click(); setShowPlusMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left dark:hover:bg-white/5"
                      >
                        <Paperclip className="h-4 w-4" />
                        <span>Upload from Device</span>
                      </button>
                      {currentProject && (
                        <button
                          onClick={triggerMentionMenu}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left dark:hover:bg-white/5"
                        >
                          <AtSign className="h-4 w-4" />
                          <span>Mention Project File</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="ml-auto flex items-center gap-1.5">
                <div className="relative" ref={modelSelectorRef}>
                  <button
                    onClick={() => {
                      setShowModelSelector((prev) => {
                        const next = !prev
                        if (!next) {
                          setShowManualModelList(false)
                        }
                        return next
                      })
                    }}
                    className="flex items-center gap-1.5 rounded-full px-3 py-2 text-base text-muted-foreground hover:bg-muted/60 hover:text-foreground dark:hover:bg-white/5 transition-colors group"
                    disabled={disabled || isGenerating}
                    type="button"
                  >
                    <span className={cn(
                      "font-medium tracking-tight hidden sm:block",
                      selectedModelMode === 'models' ? "text-[14px]" : "text-[16px]"
                    )}>
                      {selectedModelMode === "models" ? (
                        <span className="flex items-center gap-2">
                          {selectedManualModel?.icon && (
                            <img
                              src={selectedManualModel.icon}
                              alt={selectedManualModel.name}
                              className={selectedManualModelIconClassName}
                            />
                          )}
                          <span>{selectedManualModel?.name || "Models"}</span>
                        </span>
                      ) : selectedModelMode === "paralium" ? (
                        <ShinyText
                          text="✦ Paralium"
                          speed={2.2}
                          spread={120}
                          color={paraliumBaseColor}
                          shineColor={paraliumShineColor}
                          className="font-semibold tracking-tight"
                        />
                      ) : (
                        (selectedModelMode.charAt(0).toUpperCase() + selectedModelMode.slice(1))
                      )}
                    </span>
                    {hasMessages ? (
                      <ChevronUp className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showModelSelector && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: hasMessages ? 10 : -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: hasMessages ? 10 : -10 }}
                        transition={{ duration: 0.1, ease: "easeOut" }}
                        className={cn(
                          "absolute right-0 w-64 bg-background border border-border shadow-2xl rounded-2xl overflow-hidden z-[60] py-2 dark:bg-[#262625] dark:border-[#323230]",
                          hasMessages ? "bottom-full mb-3" : "top-full mt-3"
                        )}
                      >
                        <div className="px-2 space-y-1">
                          <button
                            onClick={() => { setSelectedModelMode('fast'); setShowManualModelList(false); setShowModelSelector(false); }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] transition-all group",
                              selectedModelMode === 'fast'
                                ? "bg-foreground text-background"
                                : "text-foreground/60 hover:text-foreground hover:bg-muted dark:hover:bg-white/5"
                            )}
                          >
                            <div className="flex-1 text-left">
                              <div className="font-bold leading-tight">Fast</div>
                              <div className={cn("text-[10px] font-mono tracking-tighter transition-colors", selectedModelMode === 'fast' ? "opacity-70" : "text-muted-foreground/60 group-hover:text-muted-foreground")}>Lightning speed responses</div>
                            </div>
                            {selectedModelMode === 'fast' && <Check className="h-3.5 w-3.5 ml-auto" />}
                          </button>

                          <button
                            onClick={() => { setSelectedModelMode('auto'); setShowManualModelList(false); setShowModelSelector(false); }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] transition-all group",
                              selectedModelMode === 'auto'
                                ? "bg-foreground text-background"
                                : "text-foreground/60 hover:text-foreground hover:bg-muted dark:hover:bg-white/5"
                            )}
                          >
                            <div className="flex-1 text-left">
                              <div className="font-bold leading-tight">Auto</div>
                              <div className={cn("text-[10px] font-mono tracking-tighter transition-colors", selectedModelMode === 'auto' ? "opacity-70" : "text-muted-foreground/60 group-hover:text-muted-foreground")}>Smart Orchestrator</div>
                            </div>
                            {selectedModelMode === 'auto' && <Check className="h-3.5 w-3.5 ml-auto" />}
                          </button>

                          <button
                            onClick={() => { setSelectedModelMode('paralium'); setShowManualModelList(false); setShowModelSelector(false); }}
                            className={cn(
                              "w-full relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] transition-all group overflow-hidden",
                              selectedModelMode === 'paralium'
                                ? "bg-foreground text-background"
                                : "text-foreground/60 hover:text-foreground hover:bg-muted dark:hover:bg-white/5"
                            )}
                            onMouseEnter={() => setIsParaliumHovered(true)}
                            onMouseLeave={() => setIsParaliumHovered(false)}
                          >
                            <GleamBorder active={showModelSelector && (selectedModelMode === "paralium" || isParaliumHovered)} roundedClassName="rounded-xl" />
                            <div className="flex-1 text-left">
                              <div className="font-bold leading-tight">Paralium</div>
                              <div className={cn("text-[10px] font-mono tracking-tighter transition-colors", selectedModelMode === 'paralium' ? "opacity-70" : "text-muted-foreground/60 group-hover:text-muted-foreground")}>Premium Agentic Game Builder</div>
                            </div>
                            {selectedModelMode === 'paralium' && <Check className="h-3.5 w-3.5 ml-auto" />}
                          </button>

                          <button
                            onClick={() => { setShowManualModelList((prev) => !prev); }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group",
                              selectedModelMode === 'models' || showManualModelList
                                ? "bg-foreground text-background"
                                : "text-foreground/60 hover:text-foreground hover:bg-muted dark:hover:bg-white/5"
                            )}
                          >
                            <div className="flex-1 text-left">
                              <div className="font-bold leading-tight">Models</div>
                              <div className={cn("text-[10px] font-mono tracking-tighter transition-colors", selectedModelMode === 'models' || showManualModelList ? "opacity-70" : "text-muted-foreground/60 group-hover:text-muted-foreground")}>Manual model selection</div>
                            </div>
                            {selectedModelMode === 'models' || showManualModelList ? <ChevronDown className="h-3.5 w-3.5 ml-auto" /> : null}
                          </button>
                        </div>

                        {(selectedModelMode === 'models' || showManualModelList) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 pt-2 border-t border-border/50 px-2 space-y-1 max-h-56 overflow-y-auto scrollbar-mini"
                          >
                            {MANUAL_MODELS.map(m => (
                              <button
                                key={m.id}
                                onClick={() => {
                                  setSelectedModelMode('models')
                                  setSelectedModelId(m.id)
                                  setShowManualModelList(false)
                                  setShowModelSelector(false)
                                }}
                                className={cn(
                                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all",
                                  selectedModelId === m.id ? "bg-muted font-bold dark:bg-white/10" : "hover:bg-muted/40 dark:hover:bg-white/5"
                                )}
                              >
                                <img
                                  src={m.icon}
                                  alt={m.name}
                                  className={cn(
                                    "w-4 h-4 object-contain",
                                    m.id.startsWith('gpt') && theme === 'light' ? "invert" : "",
                                    m.id.startsWith('deepseek') ? "purple" : ""
                                  )}
                                />
                                <span>{m.name}</span>
                                {selectedModelId === m.id && <Check className="h-3 w-3 ml-auto text-foreground" />}
                              </button>
                            ))}
                          </motion.div>
                        )}

                        {showUpgradeButton && (
                          <div className="mt-2 p-2 px-3 border-t border-border/50">
                            <button
                              onClick={() => navigate('/pricing')}
                              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg"
                            >
                              <Crown className="h-3.5 w-3.5 fill-background" />
                              <span>{upgradeButtonLabel}</span>
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                  disabled={disabled || isGenerating}
                  aria-label="Voice input"
                  onClick={() => console.log("Voice input")}
                >
                  <Mic className="h-4.5 w-4.5" />
                </button>

                {isGenerating ? (
                  <button
                    onClick={onStop}
                    className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 transition-all cursor-pointer"
                    aria-label="Stop generation"
                    type="button"
                  >
                    <Square className="h-3.5 w-3.5 text-white fill-white" />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-foreground hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Send message"
                    type="button"
                  >
                    <ArrowUp className="h-4 w-4 text-background" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {showSuggestions && currentProject && filteredFiles.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute bottom-full left-0 right-0 mb-1 bg-background border-2 border-border shadow-lg max-h-48 overflow-y-auto z-50 rounded-2xl dark:bg-[#262625] dark:border-[#323230]"
            >
              {filteredFiles.map((file, index) => (
                <button
                  key={file.path}
                  onClick={() => insertMention(file)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm flex items-center gap-2 border-b border-border/10 last:border-b-0 transition-colors",
                    index === selectedSuggestionIndex
                      ? "bg-foreground text-background"
                      : "hover:bg-muted dark:hover:bg-white/5 text-foreground"
                  )}
                >
                  {file.type === 'folder' ? <FolderClosed className="h-3.5 w-3.5 shrink-0" /> : <File className="h-3.5 w-3.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{file.name}</div>
                    <div className="text-xs opacity-70 truncate">{file.path}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isHero && promptChips.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {promptChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => applyPromptChip(chip)}
              className="rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60 dark:border-[#323230] dark:bg-[#262625] dark:hover:bg-white/5"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

    </div>
  )
}
