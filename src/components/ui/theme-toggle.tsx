import { Moon, Sun } from "lucide-react"
import { cn } from "../../lib/utils"
import { useTheme } from "../theme-provider"

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
                "relative h-10 w-10 flex items-center justify-center border border-border/50 bg-background text-foreground hover:bg-muted transition-all duration-200",
                "rounded-full shadow-sm",
                className
            )}
            title="Toggle Theme"
            aria-label="Toggle Theme"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </button>
    )
}
