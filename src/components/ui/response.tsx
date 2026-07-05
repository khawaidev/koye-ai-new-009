import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "../../lib/utils"

interface ResponseProps {
  content: string
  className?: string
  isStreaming?: boolean
}

export function Response({ content, className, isStreaming }: ResponseProps) {
  return (
    <div className={cn("response-container", className)}>
      <div className="prose prose-lg max-w-none font-ai font-[360] tracking-[-0.015em]
        prose-headings:text-foreground dark:prose-headings:text-white prose-headings:font-semibold 
        prose-p:text-foreground dark:prose-p:text-white prose-p:leading-[1.8] prose-p:text-[16px] md:prose-p:text-[16px]
        prose-ul:text-foreground dark:prose-ul:text-white prose-ol:text-foreground dark:prose-ol:text-white prose-li:text-foreground dark:prose-li:text-white
        prose-strong:text-foreground dark:prose-strong:text-white prose-strong:font-semibold
        prose-code:text-foreground dark:prose-code:text-white prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[13px] prose-code:font-mono
        prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-[18px] prose-pre:p-5
        prose-a:text-foreground dark:prose-a:text-white prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-muted-foreground dark:hover:prose-a:text-white/80
        prose-blockquote:text-foreground dark:prose-blockquote:text-white prose-blockquote:border-l-foreground prose-blockquote:pl-4
        prose-table:text-foreground dark:prose-table:text-white prose-th:text-foreground dark:prose-th:text-white prose-td:text-foreground dark:prose-td:text-white">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mb-4 mt-6 text-foreground dark:text-white first:mt-0 border-b border-border pb-2 origin-top scale-y-[1.05]">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mb-3 mt-5 text-foreground dark:text-white first:mt-0 origin-top scale-y-[1.05]">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold mb-2 mt-4 text-foreground dark:text-white first:mt-0 origin-top scale-y-[1.05]">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-semibold mb-2 mt-3 text-foreground dark:text-white first:mt-0 origin-top scale-y-[1.05]">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="my-4 text-foreground dark:text-white leading-[1.8] text-[16px] md:text-[16px] font-ai font-[360] tracking-[-0.015em] origin-top scale-y-[1.05]">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-outside space-y-2 my-5 ml-6 text-foreground dark:text-white font-ai origin-top scale-y-[1.05]">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside space-y-2 my-5 ml-6 text-foreground dark:text-white font-ai origin-top scale-y-[1.05]">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-foreground dark:text-white leading-[1.8] pl-1 font-ai origin-top scale-y-[1.05]">
                {children}
              </li>
            ),
            code: ({ children, className }) => {
              const isInline = !className
              return isInline ? (
                <code className="bg-muted text-foreground dark:text-white px-1.5 py-0.5 rounded-md text-[13px] font-mono dark:bg-white/5">
                  {children}
                </code>
              ) : (
                <code className="block bg-transparent text-foreground dark:text-white px-0 py-0 text-[14px] font-mono">
                  {children}
                </code>
              )
            },
            pre: ({ children }) => (
              <pre className="bg-muted border border-border p-5 rounded-[18px] overflow-x-auto my-4 text-[14px] font-mono leading-relaxed dark:bg-white/5 dark:border-white/10">
                {children}
              </pre>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-foreground pl-4 my-5 italic text-foreground dark:text-white font-ai origin-top scale-y-[1.05]">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground dark:text-white underline underline-offset-2 hover:text-muted-foreground dark:hover:text-white/80 transition-colors"
              >
                {children}
              </a>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-foreground">
                {children}
              </em>
            ),
            hr: () => (
              <hr className="my-6 border-border" />
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-border rounded-lg">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-muted">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-border">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className="border-b border-border hover:bg-muted/50 transition-colors">
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="px-4 py-3 text-left text-foreground font-semibold border border-border bg-muted text-sm">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 text-foreground border border-border text-sm">
                {children}
              </td>
            ),
          }}
        >
          {content.replace(/\[STEP:\s*\d+\]/g, "")}
        </ReactMarkdown>
      </div>
    </div>
  )
}
