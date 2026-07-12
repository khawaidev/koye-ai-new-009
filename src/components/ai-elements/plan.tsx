import React, { createContext, useContext, useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

// --- Context ---

interface PlanContextType {
  open: boolean;
  setOpen: (val: boolean) => void;
}

const PlanContext = createContext<PlanContextType | null>(null);

function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("Must be used within Plan");
  return ctx;
}

// --- Components ---

export function Plan({ children, defaultOpen = true, className }: { children: ReactNode; defaultOpen?: boolean; className?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <PlanContext.Provider value={{ open, setOpen }}>
      <div className={cn("w-full rounded-xl border border-border/50 bg-card/50 shadow-sm font-[var(--chat-font)]", className)}>
        {children}
      </div>
    </PlanContext.Provider>
  );
}

export function PlanHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2 p-4", className)}>
      {children}
    </div>
  );
}

export function PlanTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn("font-semibold text-base text-foreground flex items-center", className)}>
      {children}
    </h3>
  );
}

export function PlanDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}

export function PlanTrigger({ className }: { className?: string }) {
  const { open, setOpen } = usePlan();
  return (
    <button
      onClick={() => setOpen(!open)}
      className={cn(
        "flex w-full items-center justify-between mt-2 pt-2 border-t border-border/30 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors",
        className
      )}
    >
      <span>{open ? "Hide details" : "View details"}</span>
      <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
    </button>
  );
}

export function PlanContent({ children, className }: { children: ReactNode; className?: string }) {
  const { open } = usePlan();
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
          <div className={cn("p-4 pt-0 border-t border-border/30", className)}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PlanFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center p-3 bg-muted/20 border-t border-border/30 rounded-b-xl", className)}>
      {children}
    </div>
  );
}

export function PlanAction({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("ml-auto", className)}>
      {children}
    </div>
  );
}
