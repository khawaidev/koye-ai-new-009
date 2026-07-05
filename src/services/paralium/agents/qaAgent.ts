import { Blackboard } from '../blackboard'
import type { AgentMessage, ErrorRecord } from '../agentTypes'
import type { TaskNode } from '../taskGraph'

export class QAAgent {
  private blackboard: Blackboard

  constructor(blackboard: Blackboard) {
    this.blackboard = blackboard
  }

  public async verifyTask(taskId: string): Promise<void> {
    // In a real implementation, this would:
    // 1. Use gameScriptRunner.ts to compile/run the generated code
    // 2. Parse the console output for Babylon.js errors
    // 3. If errors exist, classify them and pass to DebugAgent
    
    const taskGraph = this.blackboard.getTaskGraph()
    const task = taskGraph.getTask(taskId)
    
    if (!task) return

    // Simulate verification (90% chance of success)
    const hasError = Math.random() > 0.9

    if (hasError) {
       const errorRecord: ErrorRecord = {
          id: crypto.randomUUID(),
          taskId,
          type: 'runtime',
          message: 'BJS - [18:32:01]: Error: Cannot read properties of undefined (reading "position")',
          timestamp: Date.now()
       }
       
       this.blackboard.addErrorRecord(errorRecord)
       
       // Force the original task to failed state
       taskGraph.updateTaskStatus(taskId, 'failed', undefined, errorRecord)

       // The Executive Agent will see this failed task on its next tick
       // and spawn a Debugging task.
    } else {
       // All good
       const message: AgentMessage = {
           id: crypto.randomUUID(),
           from: 'qa',
           to: 'all',
           type: 'info',
           content: `Task ${task.label} passed QA.`,
           timestamp: Date.now()
       }
       this.blackboard.addAgentMessage(message)
    }
  }
}
