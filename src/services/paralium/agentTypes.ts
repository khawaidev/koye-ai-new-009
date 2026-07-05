export type AgentType = 
  | 'executive'
  | 'discovery'
  | 'research'
  | 'planning'
  | 'coding'
  | 'asset'
  | 'qa'
  | 'debug'

export type AgentAction = 
  | 'start_discovery'
  | 'ask_question'
  | 'fast_track'
  | 'start_research'
  | 'generate_plan'
  | 'generate_code'
  | 'generate_asset'
  | 'run_qa'
  | 'run_debug'
  | 'wait_for_user'
  | 'complete'

export interface AgentMessage {
  id: string
  from: AgentType
  to: AgentType | 'all'
  type: 'request' | 'response' | 'info' | 'error'
  content: any
  timestamp: number
}

export interface GameIdea {
  rawInput: string
  title?: string
  genre?: string
  setting?: string
  coreMechanics?: string[]
  playerCharacter?: string
  enemyTypes?: string[]
  winLoseConditions?: string
  specialFeatures?: string[]
}

export interface DesignDNA {
  colorPalette: string[]
  artDirection: string
  animationStyle: string
  cameraStyle: string
  uiStyle: string
}

export interface ReferenceGame {
  name: string
  relevanceReason: string
}

export interface SelectedReference {
  category: string
  url: string
  sourceGame: string
  description?: string
}

export interface ErrorRecord {
  id: string
  taskId: string
  type: 'syntax' | 'runtime' | 'missing_dependency' | 'logic' | 'other'
  message: string
  stackTrace?: string
  context?: any
  timestamp: number
}

export interface FailurePattern {
  id: string
  errorType: string
  symptomKeywords: string[]
  resolutionSteps: string[]
  successRate: number
}

export interface GamePlan {
  vision: string
  prototypeScope: string
  coreLoop: string
  systems: string[]
  assets: AssetRequirement[]
  scenes: string[]
}

export interface AssetRequirement {
  id: string
  type: 'image' | 'model' | 'audio' | 'video'
  name: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'pending' | 'generating' | 'ready' | 'failed'
  url?: string
}

export interface FileEntry {
  path: string
  content: string
  hash: string
  lastModified: number
  generatedByTaskId: string
}

export interface AssetEntry {
  id: string
  url: string
  type: string
  metadata: any
  generatedByTaskId: string
}
