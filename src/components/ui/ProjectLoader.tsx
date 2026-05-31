import "./ProjectLoader.css"

export function ProjectLoader() {
  return (
    <div className="fixed inset-0 bg-background text-foreground flex items-center justify-center z-[9999]">
      <div className="loader"></div>
    </div>
  )
}
