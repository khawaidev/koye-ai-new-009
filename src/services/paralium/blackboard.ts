import type { 
  GameIdea, 
  DesignDNA, 
  ReferenceGame, 
  SelectedReference, 
  GamePlan, 
  FileEntry, 
  AssetEntry,
  ErrorRecord, 
  FailurePattern,
  AgentMessage
} from './agentTypes'
import type { ConfidenceScores } from './confidenceEngine'
import { TaskGraph } from './taskGraph'

export interface BlackboardState {
  projectId: string
  gameIdea: GameIdea | null
  designDNA: DesignDNA | null

  // Discovery State
  confidenceScores: ConfidenceScores | null
  discoveryComplete: boolean
  
  // Reference Research
  referenceGames: ReferenceGame[]
  screenCategories: string[]
  selectedReferences: SelectedReference[]
  
  // Planning
  gamePlan: GamePlan | null
  taskGraphData: string // Serialized TaskGraph
  
  // Execution State
  generatedFiles: Record<string, FileEntry>
  generatedAssets: Record<string, AssetEntry>
  
  // Error & Learning
  errorHistory: ErrorRecord[]
  
  // Agent Communication
  agentMessages: AgentMessage[]
  
  // Timestamps & Progress
  phaseTimestamps: Record<string, number>
  overallProgress: number
}

export class Blackboard {
  private state: BlackboardState
  private taskGraph: TaskGraph
  private onChangeCallbacks: ((state: BlackboardState) => void)[] = []

  constructor(projectId: string) {
    this.taskGraph = new TaskGraph()
    this.state = this.getDefaultState(projectId)
  }

  private getDefaultState(projectId: string): BlackboardState {
    return {
      projectId,
      gameIdea: null,
      designDNA: null,
      confidenceScores: null,
      discoveryComplete: false,
      referenceGames: [],
      screenCategories: [],
      selectedReferences: [],
      gamePlan: null,
      taskGraphData: this.taskGraph.serialize(),
      generatedFiles: {},
      generatedAssets: {},
      errorHistory: [],
      agentMessages: [],
      phaseTimestamps: {},
      overallProgress: 0
    }
  }

  public subscribe(callback: (state: BlackboardState) => void): () => void {
    this.onChangeCallbacks.push(callback)
    return () => {
      this.onChangeCallbacks = this.onChangeCallbacks.filter(cb => cb !== callback)
    }
  }

  private notifySubscribers(): void {
    // Update serialized task graph before notifying
    this.state.taskGraphData = this.taskGraph.serialize()
    this.state.overallProgress = this.taskGraph.getCompletionPercentage()
    
    for (const callback of this.onChangeCallbacks) {
      callback({ ...this.state })
    }
  }

  public loadState(state: BlackboardState): void {
    this.state = { ...state }
    this.taskGraph.deserialize(this.state.taskGraphData)
    this.notifySubscribers()
  }

  public getState(): BlackboardState {
    this.state.taskGraphData = this.taskGraph.serialize()
    this.state.overallProgress = this.taskGraph.getCompletionPercentage()
    return { ...this.state }
  }

  public getTaskGraph(): TaskGraph {
    return this.taskGraph
  }

  // --- Mutators ---

  public setGameIdea(idea: GameIdea): void {
    this.state.gameIdea = idea
    this.notifySubscribers()
  }

  public setDesignDNA(dna: DesignDNA): void {
    this.state.designDNA = dna
    this.notifySubscribers()
  }

  public setConfidenceScores(scores: ConfidenceScores): void {
    this.state.confidenceScores = scores
    this.notifySubscribers()
  }

  public setDiscoveryComplete(complete: boolean): void {
    this.state.discoveryComplete = complete
    this.notifySubscribers()
  }

  public setReferenceGames(games: ReferenceGame[]): void {
    this.state.referenceGames = games
    this.notifySubscribers()
  }

  public setScreenCategories(categories: string[]): void {
    this.state.screenCategories = categories
    this.notifySubscribers()
  }

  public addSelectedReference(reference: SelectedReference): void {
    this.state.selectedReferences.push(reference)
    this.notifySubscribers()
  }

  public setGamePlan(plan: GamePlan): void {
    this.state.gamePlan = plan
    this.notifySubscribers()
  }

  public addGeneratedFile(file: FileEntry): void {
    this.state.generatedFiles[file.path] = file
    this.notifySubscribers()
  }

  public addGeneratedAsset(asset: AssetEntry): void {
    this.state.generatedAssets[asset.id] = asset
    this.notifySubscribers()
  }

  public addErrorRecord(error: ErrorRecord): void {
    this.state.errorHistory.push(error)
    this.notifySubscribers()
  }

  public addAgentMessage(message: AgentMessage): void {
    this.state.agentMessages.push(message)
    this.notifySubscribers()
  }

  public setPhaseTimestamp(phase: string, timestamp: number): void {
    this.state.phaseTimestamps[phase] = timestamp
    this.notifySubscribers()
  }
}
