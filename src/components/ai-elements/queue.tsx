import React, { createContext, useContext, useState, ReactNode } from "react";
import { ChevronDown, FileText, CheckCircle2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

// --- Types ---

export interface QueueMessagePart {
  type: "text" | "file";
  text?: string;
  filename?: string;
  mediaType?: string;
  url?: string;
}

export interface QueueMessage {
  id: string;
  parts: QueueMessagePart[];
}

export interface QueueTodo {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "completed";
}

// --- Context ---

interface QueueSectionContextType {
  open: boolean;
  setOpen: (val: boolean) => void;
}

const QueueSectionContext = createContext<QueueSectionContextType | null>(null);

function useQueueSection() {
  const ctx = useContext(QueueSectionContext);
  if (!ctx) throw new Error("Must be used within QueueSection");
  return ctx;
}

// --- Components ---

export function Queue({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("w-full space-y-4 font-[var(--chat-font)]", className)}>
      {children}
    </div>
  );
}

export function QueueSection({ children, defaultOpen = true }: { children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <QueueSectionContext.Provider value={{ open, setOpen }}>
      <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
        {children}
      </div>
    </QueueSectionContext.Provider>
  );
}

export function QueueSectionTrigger({ children, className }: { children: ReactNode; className?: string }) {
  const { open, setOpen } = useQueueSection();
  return (
    <button
      onClick={() => setOpen(!open)}
      className={cn("w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left", className)}
    >
      {children}
      <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
    </button>
  );
}

export function QueueSectionLabel({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-sm text-foreground">{label}</span>
      {count !== undefined && (
        <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

export function QueueSectionContent({ children }: { children: ReactNode }) {
  const { open } = useQueueSection();
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="p-3 pt-0">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function QueueList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-2 mt-2", className)}>{children}</div>;
}

export function QueueItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1 p-2 rounded-lg hover:bg-muted/30 transition-colors group", className)}>
      {children}
    </div>
  );
}

export function QueueItemIndicator({ completed }: { completed?: boolean }) {
  return completed ? (
    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
  ) : (
    <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
  );
}

export function QueueItemContent({ children, completed }: { children: ReactNode; completed?: boolean }) {
  return (
    <div className={cn("text-sm font-medium flex-1", completed && "text-muted-foreground line-through")}>
      {children}
    </div>
  );
}

export function QueueItemDescription({ children, completed }: { children: ReactNode; completed?: boolean }) {
  return (
    <div className={cn("text-xs text-muted-foreground ml-6", completed && "opacity-70")}>
      {children}
    </div>
  );
}

export function QueueItemActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {children}
    </div>
  );
}

export function QueueItemAction({ children, onClick, title, ...props }: any) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      {...props}
    >
      {children}
    </button>
  );
}

export function QueueItemAttachment({ children }: { children: ReactNode }) {
  return <div className="flex gap-2 ml-6 mt-2 flex-wrap">{children}</div>;
}

export function QueueItemFile({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded border text-xs text-muted-foreground">
      <FileText className="w-3 h-3" />
      {children}
    </div>
  );
}

export function QueueItemImage({ src, alt }: { src: string; alt?: string }) {
  return (
    <img src={src} alt={alt || "attachment"} className="w-10 h-10 object-cover rounded border" />
  );
}
