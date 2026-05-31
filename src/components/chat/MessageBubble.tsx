import React from "react"
import ReactMarkdown from "react-markdown"
import { cn } from "../../lib/utils"
import { PixelImage } from "../ui/pixel-image"
import { SquareLoader } from "../ui/SquareLoader"
import { ChevronDown, ChevronRight, Brain } from "lucide-react"
import { ChatAvatar } from "./VoiceChatLayout"

interface MessageBubbleProps {
  role: "user" | "assistant"
  content: string
  images?: string[]
  isThinking?: boolean
  className?: string
}

export function MessageBubble({
  role,
  content,
  images,
  isThinking = false,
  className,
}: MessageBubbleProps) {
  const [isThinkingExpanded, setIsThinkingExpanded] = React.useState(false)
  const isUser = role === "user"
  const agentState = isThinking ? "thinking" : "idle"
  
  let displayContent = content
  let thinkingContent = ""
  
  const thinkMatch = content.match(/<think>([\s\S]*?)(?:<\/think>|$)/i)
  if (thinkMatch) {
    thinkingContent = thinkMatch[1].trim()
    displayContent = content.replace(/<think>[\s\S]*?(?:<\/think>|$)/i, "").trim()
  }

  // Also catch edge case where streaming just starts with <think
  if (!thinkMatch && content.startsWith("<think")) {
    thinkingContent = content.replace("<think", "").replace(">", "").trim()
    displayContent = ""
  }

  return (
    <div
      className={cn(
        "flex gap-4",
        isUser ? "justify-end" : "flex-row",
        className
      )}
    >
      {!isUser && <ChatAvatar role={role} agentState={agentState} />}

      <div
        className={cn(
          "flex flex-col gap-3",
          isUser ? "items-end max-w-[78%] md:max-w-[68%]" : "items-start max-w-[88%]"
        )}
      >
        {images && images.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {images.map((img, idx) => (
              <PixelImage
                key={idx}
                src={img}
                alt={`Attachment ${idx + 1}`}
                className="h-36 w-36 rounded-lg border border-border shadow-md"
              />
            ))}
          </div>
        )}

        <div
          className={cn(
            "transition-all font-chat tracking-[-0.01em] text-[16px] md:text-[16px] font-[400] leading-[1.8]",
            isUser
              ? "max-w-fit rounded-[22px] rounded-br-md border border-border/60 bg-[#EFEEEB] px-3.5 py-1.5 text-foreground dark:border-white/5 dark:bg-[#2A2A2A] dark:text-[#F8F8F6]"
              : "px-1 py-1 text-foreground bg-transparent"
          )}
        >
          {isThinking ? (
            <div className="flex items-center gap-2 px-1 py-1">
              <SquareLoader />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {thinkingContent && (
                <div className="mb-2 w-full max-w-full">
                  <button 
                    onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                    className="flex items-center gap-2 text-[12px] text-muted-foreground/80 hover:text-foreground/80 transition-colors py-1.5 px-3 bg-muted/40 rounded-lg border border-border/50 w-fit max-w-full"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span className="font-medium">Thought Process</span>
                    {isThinkingExpanded ? <ChevronDown className="w-3.5 h-3.5 ml-1" /> : <ChevronRight className="w-3.5 h-3.5 ml-1" />}
                  </button>
                  {isThinkingExpanded && (
                    <div className="mt-2 text-[13px] text-muted-foreground/70 bg-muted/20 border border-border/30 rounded-lg p-3 max-h-[300px] overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed break-words">
                      {thinkingContent}
                    </div>
                  )}
                </div>
              )}
              {displayContent && (
                <div className={cn(
              "prose-headings:text-foreground prose-headings:font-semibold prose-headings:mb-2 prose-headings:mt-3",
              "prose-p:text-foreground prose-p:leading-[1.8] prose-p:text-[16px] md:prose-p:text-[16px] prose-p:font-[400]",
              isUser ? "prose-p:my-0.5 dark:prose-p:text-[#F8F8F6]" : "prose-p:my-2",
              "prose-strong:text-foreground prose-strong:font-semibold",
              "prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[13px] prose-code:font-mono prose-code:border-0",
              "prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4 prose-pre:my-3",
              "prose-ul:text-foreground prose-ul:my-2 prose-ul:space-y-1",
              "prose-ol:text-foreground prose-ol:my-2 prose-ol:space-y-1",
              "prose-li:text-foreground prose-li:leading-[1.75]",
              "prose-a:text-foreground prose-a:underline prose-a:underline-offset-2",
              "prose-blockquote:text-foreground prose-blockquote:border-l-foreground prose-blockquote:pl-4 prose-blockquote:my-2"
            )}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => {
                    return (
                      <p className={cn("leading-[1.8] text-[16px] md:text-[16px] font-[400] font-chat", isUser ? "my-0.5 text-foreground dark:text-[#F8F8F6]" : "my-2 text-foreground")}>
                        {React.Children.map(children, (child) => {
                          if (typeof child === "string") {
                            const parts = child.split(/(@[a-zA-Z0-9_./-]+\.[a-zA-Z0-9]+)/g)
                            return parts.map((part, i) => {
                              if (part.match(/^@[a-zA-Z0-9_./-]+\.[a-zA-Z0-9]+$/)) {
                                return (
                                  <span
                                    key={i}
                                    className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium text-xs"
                                  >
                                    {part}
                                  </span>
                                )
                              }
                              return part
                            })
                          }
                          return child
                        })}
                      </p>
                    )
                  },
                  code: ({ children, className }) => {
                    const isInline = !className
                    return isInline ? (
                      <code className="bg-muted text-foreground px-1.5 py-0.5 rounded-md text-[13px] font-mono">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-transparent text-foreground px-0 py-0 text-[14px] font-mono">
                        {children}
                      </code>
                    )
                  },
                  pre: ({ children }) => (
                    <pre className="bg-muted border border-border p-4 rounded-lg overflow-x-auto my-3 text-[14px] font-mono leading-relaxed">
                      {children}
                    </pre>
                  ),
                }}
              >
                {displayContent.replace(/\[STEP:\s*\d+\]/g, "")}
              </ReactMarkdown>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
