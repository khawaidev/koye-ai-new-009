import { Blackboard } from '../blackboard'
import type { AgentMessage } from '../agentTypes'
import type { TaskNode } from '../taskGraph'
import { MemorySystem } from '../memory'

export class DebugAgent {
  private blackboard: Blackboard

  constructor(blackboard: Blackboard) {
    this.blackboard = blackboard
  }

  public async executeTask(debugTaskId: string): Promise<void> {
    const taskGraph = this.blackboard.getTaskGraph()
    const debugTask = taskGraph.getTask(debugTaskId)
    
    if (!debugTask || debugTask.type !== 'debugging') return

    // The dependency of the debug task is the original failed task
    const failedTaskId = debugTask.dependencies[0]
    const failedTask = taskGraph.getTask(failedTaskId)

    if (!failedTask || !failedTask.error) {
       taskGraph.markComplete(debugTaskId, { status: 'no_error_found' })
       return
    }

    try {
      // 1. Root Cause Analysis
      // Look up failure memory for similar past errors
      const match = await MemorySystem.findMatchingFailurePattern(
         failedTask.error.type, 
         this.extractKeywords(failedTask.error.message)
      )

      if (match) {
         // Apply known fix
         this.blackboard.addAgentMessage({
            id: crypto.randomUUID(),
            from: 'debug',
            to: 'all',
            type: 'info',
            content: `Applying known fix pattern: ${match.id}`,
            timestamp: Date.now()
         })
         
         // In a real implementation: execute agent tool calls to modify files based on match.resolutionSteps
         
      } else {
         // Fallback: send error to LLM for novel fix
         // ...
         
         // If successful, save new pattern to memory
         await MemorySystem.saveFailurePattern({
            id: crypto.randomUUID(),
            errorType: failedTask.error.type,
            symptomKeywords: this.extractKeywords(failedTask.error.message),
            resolutionSteps: ['Fix applied by LLM'],
            successRate: 1
         })
      }

      // 2. Mark debug task complete
      taskGraph.markComplete(debugTaskId, { fixed: true })
      
      // 3. Reset the original failed task to ready so it gets retried/re-verified
      taskGraph.updateTaskStatus(failedTaskId, 'ready')

    } catch (error: any) {
      taskGraph.markFailed(debugTaskId, {
         id: crypto.randomUUID(),
         taskId: debugTaskId,
         type: 'other',
         message: error.message || 'Debug process failed',
         timestamp: Date.now()
      })
    }
  }

  private extractKeywords(message: string): string[] {
     // Simple stub
     return message.toLowerCase().split(/[^\w]+/).filter(w => w.length > 4)
  }
}
