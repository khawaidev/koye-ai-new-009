import { Navigate, Route, Routes } from "react-router-dom"
import "./App.css"
import { ToastProvider } from "./components/ui/toast"
import { WorkflowManager } from "./components/workflow/WorkflowManager"
import { AnimationsLibrary } from "./pages/AnimationsLibrary"
import { Dashboard } from "./pages/Dashboard"
import { GameEngine } from "./pages/GameEngine"
import { GameRunner } from "./pages/GameRunner"
import { LandingPage } from "./pages/LandingPage"
import { Login } from "./pages/Login"
import { Phaser2DGameEngine } from "./pages/Phaser2DGameEngine"
import { SignUp } from "./pages/SignUp"
import { UpgradeModal } from "./pages/Pricing"
import { ProjectFiles } from "./pages/ProjectFiles"
import { useAppStore } from "./store/useAppStore"

function App() {
  console.log("App component rendering")
  const { isUpgradeModalOpen, setIsUpgradeModalOpen } = useAppStore()
  return (
    <ToastProvider>
      <UpgradeModal open={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/play/:projectId" element={<GameRunner />} />
        <Route path="/game-engine" element={<GameEngine />} />
        <Route path="/phaser-2d-engine" element={<Phaser2DGameEngine />} />
        <Route path="/animations" element={<AnimationsLibrary />} />
        <Route path="/app" element={<WorkflowManager />} />
        <Route path="/app/project/:projectId/files" element={<ProjectFiles />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}

export default App
