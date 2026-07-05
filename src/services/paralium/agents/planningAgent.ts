import { Blackboard } from '../blackboard'
import type { GamePlan, DesignDNA, AgentMessage } from '../agentTypes'
import type { TaskNode } from '../taskGraph'
import { sendMessageToLaysoAIStream } from '../../laysoai'
import { uuidv4 } from '../../../lib/uuid'
import guideGamePlan from '../../guides/guide-for-generating-game-plan.md?raw'

export class PlanningAgent {
  private blackboard: Blackboard

  constructor(blackboard: Blackboard) {
    this.blackboard = blackboard
  }

  public async generatePlanAndTaskGraph(): Promise<void> {
    const state = this.blackboard.getState()
    if (!state.gameIdea) return

    // 1. Generate the Game Plan (Opus 4.7 Thinking)
    const planString = await this.requestGamePlan(state)
    const gamePlan = this.parseGamePlan(planString)
    this.blackboard.setGamePlan(gamePlan)
    
    // 2. Generate Design DNA
    const dna = await this.generateDesignDNA(state)
    this.blackboard.setDesignDNA(dna)

    // 3. Populate Task Graph with Coding & Asset tasks
    this.populateTaskGraph(gamePlan)

    // Notify executive
    const message: AgentMessage = {
       id: crypto.randomUUID(),
       from: 'planning',
       to: 'executive',
       type: 'info',
       content: 'Planning complete. Task graph populated.',
       timestamp: Date.now()
    }
    this.blackboard.addAgentMessage(message)
  }

  private async requestGamePlan(state: any): Promise<string> {
    const descriptionsText = state.selectedReferences.map((ref: any) => {
      return `### ${ref.category}\n${ref.description || 'No description'}`
    }).join("\n\n---\n\n")

    const messages = [
      { role: "system", content: guideGamePlan },
      { role: "user", content: `## User Game Idea Data\n\n${JSON.stringify(state.gameIdea)}\n\n---\n\n## Screen Descriptions (Visual References)\n\n${descriptionsText}\n\n---\n\nPlease generate the COMPLETE game development plan as specified in the guide. Output a single markdown document.` }
    ] as any[]

    let fullPlan = ""
    try {
      for await (const chunk of sendMessageToLaysoAIStream(
        "claude-opus-4.7-thinking",
        messages,
        0.7,
        16000
      )) {
        fullPlan += chunk
      }
    } catch (error) {
      console.error("[PlanningAgent] Failed to generate plan:", error)
      fullPlan = "# Fallback Plan\n..."
    }
    return fullPlan
  }

  private parseGamePlan(planString: string): GamePlan {
    // Stub: In a full implementation, parse the markdown into the GamePlan structure
    return {
      vision: "Parsed Vision",
      prototypeScope: "Parsed Scope",
      coreLoop: "Parsed Loop",
      systems: ["PlayerController", "EnemyAI"],
      assets: [],
      scenes: ["MainScene"]
    }
  }

  private async generateDesignDNA(state: any): Promise<DesignDNA> {
    // Stub: Ask LLM to extract design DNA from selected references
    return {
      colorPalette: ["#000000", "#FFFFFF"],
      artDirection: "Cyberpunk neon",
      animationStyle: "Snappy, anime-style",
      cameraStyle: "Third-person over shoulder",
      uiStyle: "Minimalist, glowing borders"
    }
  }

  private populateTaskGraph(plan: GamePlan): void {
    const taskGraph = this.blackboard.getTaskGraph()
    
    // Create base scene task
    const sceneTaskId = uuidv4()
    taskGraph.addTask({
      id: sceneTaskId,
      type: 'coding',
      label: 'Create MainScene Structure',
      status: 'ready',
      dependencies: [],
      assignedAgent: 'coding',
      priority: 90,
      retryCount: 0,
      maxRetries: 3,
      result: null,
      error: null
    })

    // Create parallel tasks for systems
    plan.systems.forEach(sys => {
      taskGraph.addTask({
        id: uuidv4(),
        type: 'coding',
        label: `Implement ${sys}`,
        status: 'blocked',
        dependencies: [sceneTaskId], // depends on scene
        assignedAgent: 'coding',
        priority: 80,
        retryCount: 0,
        maxRetries: 3,
        result: null,
        error: null
      })
    })

    // Create parallel asset tasks
    plan.assets.forEach(asset => {
      taskGraph.addTask({
        id: uuidv4(),
        type: 'asset',
        label: `Generate Asset: ${asset.name}`,
        status: 'ready',
        dependencies: [], // assets can generate immediately
        assignedAgent: 'asset',
        priority: 70,
        retryCount: 0,
        maxRetries: 3,
        result: null,
        error: null
      })
    })
  }
}
