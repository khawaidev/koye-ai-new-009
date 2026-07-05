import { Blackboard } from './blackboard'
import { MemorySystem } from './memory'
import type { AgentAction, AgentType, AgentMessage } from './agentTypes'
import type { TaskNode } from './taskGraph'
import { uuidv4 } from '../../lib/uuid'

export interface ExecutiveDecision {
  action: AgentAction
  agent: AgentType
  priority: number
  reasoning: string
  dependencies: string[]
  canRunParallel: boolean
}

export class ExecutiveAgent {
  private blackboard: Blackboard
  private isRunning: boolean = false
  private loopIntervalId: any = null

  constructor(blackboard: Blackboard) {
    this.blackboard = blackboard
  }

  public async start(): Promise<void> {
    if (this.isRunning) return
    this.isRunning = true
    
    // Load state from persistent memory if it exists
    const savedState = await MemorySystem.loadProjectMemory(this.blackboard.getState().projectId)
    if (savedState) {
      this.blackboard.loadState(savedState)
      this.log('Executive Agent started (resumed from memory).')
    } else {
      this.log('Executive Agent started (new project).')
    }

    // Start the evaluation loop (e.g., tick every 2 seconds)
    this.loopIntervalId = setInterval(() => this.tick(), 2000)
  }

  public stop(): void {
    this.isRunning = false
    if (this.loopIntervalId) {
      clearInterval(this.loopIntervalId)
      this.loopIntervalId = null
    }
    this.log('Executive Agent stopped.')
  }

  private async tick(): Promise<void> {
    if (!this.isRunning) return

    const state = this.blackboard.getState()
    const taskGraph = this.blackboard.getTaskGraph()

    // 1. Evaluate current state and decide what to do next
    const decision = await this.evaluateStateAndDecide()

    if (decision) {
      this.log(`Decision made: ${decision.action} by ${decision.agent}. Reasoning: ${decision.reasoning}`)
      this.executeDecision(decision)
    }

    // 2. Dispatch ready tasks from the TaskGraph
    const readyTasks = taskGraph.getReadyTasks()
    for (const task of readyTasks) {
      this.dispatchTask(task)
    }
    
    // 3. Auto-save state
    await MemorySystem.saveProjectMemory(state.projectId, this.blackboard.getState())
  }

  private async evaluateStateAndDecide(): Promise<ExecutiveDecision | null> {
    const state = this.blackboard.getState()
    const taskGraph = this.blackboard.getTaskGraph()

    // This is a simplified heuristic fallback.
    // In a full implementation, this calls the LLM (e.g., gemma-4-31b) with the current Blackboard state
    // to ask "What should we do next?".

    // If discovery is not complete, we need the Discovery Agent
    if (!state.discoveryComplete) {
      // Check if discovery task is already running/ready
      const hasDiscoveryTask = taskGraph.getAllTasks().some(t => t.type === 'discovery' && (t.status === 'ready' || t.status === 'running'))
      if (!hasDiscoveryTask) {
         return {
           action: 'start_discovery',
           agent: 'discovery',
           priority: 100,
           reasoning: 'Project idea needs clarity before we can proceed.',
           dependencies: [],
           canRunParallel: false
         }
      }
      return null
    }

    // If discovery is complete but we have no reference games, we need the Research Agent
    if (state.discoveryComplete && state.referenceGames.length === 0) {
       const hasResearchTask = taskGraph.getAllTasks().some(t => t.type === 'research' && (t.status === 'ready' || t.status === 'running'))
       if (!hasResearchTask) {
         return {
           action: 'start_research',
           agent: 'research',
           priority: 90,
           reasoning: 'Need to find reference games based on the clear idea.',
           dependencies: [],
           canRunParallel: false
         }
       }
       return null
    }
    
    // If research is done but no game plan, Planning Agent
    if (state.referenceGames.length > 0 && !state.gamePlan) {
        // Assume user selection happens before this via UI intercept
        if (state.selectedReferences.length > 0) {
           const hasPlanningTask = taskGraph.getAllTasks().some(t => t.type === 'planning' && (t.status === 'ready' || t.status === 'running'))
           if (!hasPlanningTask) {
             return {
               action: 'generate_plan',
               agent: 'planning',
               priority: 80,
               reasoning: 'Have references, need architecture and task graph.',
               dependencies: [],
               canRunParallel: false
             }
           }
        }
        return null
    }

    // If we have a game plan, the Planning Agent should have populated the TaskGraph with coding/asset tasks.
    // The tick() method already dispatches ready tasks.
    // We just need to check for failed tasks to invoke the Debug Agent.
    const failedTasks = taskGraph.getFailedTasks()
    if (failedTasks.length > 0) {
        // For each failed task, see if a debug task is already handling it
        for (const failedTask of failedTasks) {
            const isBeingDebugged = taskGraph.getAllTasks().some(t => t.type === 'debugging' && t.dependencies.includes(failedTask.id))
            if (!isBeingDebugged) {
               return {
                   action: 'run_debug',
                   agent: 'debug',
                   priority: 100, // Highest priority
                   reasoning: `Task ${failedTask.label} failed. Need to analyze and fix.`,
                   dependencies: [failedTask.id],
                   canRunParallel: false
               }
            }
        }
    }

    return null
  }

  private executeDecision(decision: ExecutiveDecision): void {
    const taskGraph = this.blackboard.getTaskGraph()
    
    // Create a new task node based on the decision
    const newTask: TaskNode = {
      id: uuidv4(),
      type: this.mapActionToTaskType(decision.action),
      label: `Execute: ${decision.action}`,
      status: 'ready',
      dependencies: decision.dependencies,
      assignedAgent: decision.agent,
      priority: decision.priority,
      retryCount: 0,
      maxRetries: 3,
      result: null,
      error: null
    }

    taskGraph.addTask(newTask)
  }

  private mapActionToTaskType(action: AgentAction): TaskNode['type'] {
    switch (action) {
      case 'start_discovery': return 'discovery'
      case 'ask_question': return 'discovery'
      case 'fast_track': return 'discovery'
      case 'start_research': return 'research'
      case 'generate_plan': return 'planning'
      case 'generate_code': return 'coding'
      case 'generate_asset': return 'asset'
      case 'run_qa': return 'testing'
      case 'run_debug': return 'debugging'
      default: return 'planning' // fallback
    }
  }

  private dispatchTask(task: TaskNode): void {
    const taskGraph = this.blackboard.getTaskGraph()
    taskGraph.updateTaskStatus(task.id, 'running')
    
    this.log(`Dispatching task ${task.label} to ${task.assignedAgent} agent.`)
    
    // Send a message via Blackboard to the specific agent
    const message: AgentMessage = {
      id: uuidv4(),
      from: 'executive',
      to: task.assignedAgent,
      type: 'request',
      content: { taskId: task.id },
      timestamp: Date.now()
    }
    this.blackboard.addAgentMessage(message)
    
    // In the actual implementation, the respective Agent class instances would
    // be listening to the blackboard for messages directed to them, and they
    // would pick up the task.
  }

  private log(msg: string): void {
    console.log(`[Executive Agent] ${msg}`)
    // Also record in blackboard agent messages for UI transparency
    this.blackboard.addAgentMessage({
        id: uuidv4(),
        from: 'executive',
        to: 'all',
        type: 'info',
        content: msg,
        timestamp: Date.now()
    })
  }
}
