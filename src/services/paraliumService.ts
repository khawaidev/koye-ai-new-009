import guideParaliumOrchestrator from "./guides/guide-for-paralium-orchestrator.md?raw"
import { Blackboard } from "./paralium/blackboard"
import { ExecutiveAgent } from "./paralium/executiveAgent"
import { DiscoveryAgent } from "./paralium/agents/discoveryAgent"
import { ResearchAgent } from "./paralium/agents/researchAgent"
import { PlanningAgent } from "./paralium/agents/planningAgent"
import { CodingAgent } from "./paralium/agents/codingAgent"
import { AssetAgent } from "./paralium/agents/assetAgent"
import { QAAgent } from "./paralium/agents/qaAgent"
import { DebugAgent } from "./paralium/agents/debugAgent"
import { useParaliumStore } from "../store/useParaliumStore"

export class ParaliumService {
  private static instance: ParaliumService
  
  public blackboard: Blackboard
  public executiveAgent: ExecutiveAgent
  
  // Specialists
  public discoveryAgent: DiscoveryAgent
  public researchAgent: ResearchAgent
  public planningAgent: PlanningAgent
  public codingAgent: CodingAgent
  public assetAgent: AssetAgent
  public qaAgent: QAAgent
  public debugAgent: DebugAgent

  private constructor() {
    // Generate a project ID or get from app store
    const projectId = "default-project" 
    
    this.blackboard = new Blackboard(projectId)
    
    // Connect Blackboard to UI Store
    this.blackboard.subscribe((state) => {
      useParaliumStore.getState().setBlackboardState(state)
    })

    this.executiveAgent = new ExecutiveAgent(this.blackboard)
    
    this.discoveryAgent = new DiscoveryAgent(this.blackboard)
    this.researchAgent = new ResearchAgent(this.blackboard)
    this.planningAgent = new PlanningAgent(this.blackboard)
    this.codingAgent = new CodingAgent(this.blackboard)
    this.assetAgent = new AssetAgent(this.blackboard)
    this.qaAgent = new QAAgent(this.blackboard)
    this.debugAgent = new DebugAgent(this.blackboard)
    
    // In a full implementation, agents would subscribe to the blackboard's message bus
    // to listen for tasks directed to them.
    // We simulate that by passing them directly to a router or letting the executive call them.
    this.setupMessageListener()
  }

  public static getInstance(): ParaliumService {
    if (!ParaliumService.instance) {
      ParaliumService.instance = new ParaliumService()
    }
    return ParaliumService.instance
  }

  public async startPipeline(initialIdea: string): Promise<void> {
    // 1. Send the initial idea to the Discovery Agent
    await this.discoveryAgent.processIdea(initialIdea)
    
    // 2. Start the Executive Agent loop
    await this.executiveAgent.start()
  }
  
  public stopPipeline(): void {
    this.executiveAgent.stop()
  }

  private setupMessageListener(): void {
    let lastMessageCount = 0
    
    this.blackboard.subscribe(async (state) => {
      if (state.agentMessages.length > lastMessageCount) {
        // Process new messages
        for (let i = lastMessageCount; i < state.agentMessages.length; i++) {
           const msg = state.agentMessages[i]
           if (msg.type === 'request' && msg.to !== 'all') {
               // Route task execution request to appropriate agent
               const taskId = msg.content.taskId
               if (!taskId) continue

               switch(msg.to) {
                   case 'discovery': break; // Discovery handles own entry point
                   case 'research': await this.researchAgent.performResearch(); break;
                   case 'planning': await this.planningAgent.generatePlanAndTaskGraph(); break;
                   case 'coding': await this.codingAgent.executeTask(taskId); break;
                   case 'asset': await this.assetAgent.executeTask(taskId); break;
                   case 'qa': await this.qaAgent.verifyTask(taskId); break;
                   case 'debug': await this.debugAgent.executeTask(taskId); break;
               }
           }
        }
        lastMessageCount = state.agentMessages.length
      }
    })
  }
}

// Export singleton instance methods for backward compatibility with UI triggers if needed
export const paraliumService = ParaliumService.getInstance()

export async function startParaliumPipeline(ideaData: string) {
  await paraliumService.startPipeline(ideaData)
}

// Export other functions that the UI might still be calling directly (stubbed out if they're now autonomous)
export async function searchNextReferenceGame() {
  console.log("Research agent handles this now automatically, or via message.")
  return -1
}

export function loadNextPageFromCache() { return false; }
export function loadPreviousPageFromCache() { return false; }

export async function resumeParaliumPipelineAfterSelection() {
   // The UI would call this after user selects images
   // The Executive Agent should detect `state.selectedReferences.length > 0` and spawn Planning.
   console.log("User finished selection. Executive Agent should pick this up on next tick.")
}

export function getParaliumIdeaIntakePrompt() {
  return guideParaliumOrchestrator;
}

export function checkIdeaComplete(response: string): string | null {
  const marker = "[PARALIUM_IDEA_COMPLETE]"
  const idx = response.indexOf(marker)
  if (idx !== -1) {
    return response.substring(idx + marker.length).trim()
  }
  return null
}
