import { Blackboard } from '../blackboard'
import type { AgentMessage } from '../agentTypes'
import type { TaskNode } from '../taskGraph'
import { executeAgentToolCall } from '../../agentToolExecutor'

export class CodingAgent {
  private blackboard: Blackboard

  constructor(blackboard: Blackboard) {
    this.blackboard = blackboard
  }

  public async executeTask(taskId: string): Promise<void> {
    const taskGraph = this.blackboard.getTaskGraph()
    const task = taskGraph.getTask(taskId)
    
    if (!task || task.type !== 'coding') return

    try {
      // 1. In a real scenario, use LLM (Claude Sonnet 3.5 or Opus) to generate the code
      // based on the task label, project state, and game plan.
      // We will simulate the generation here.
      
      const fileContent = `// Auto-generated code for ${task.label}\nexport const init = () => { console.log("Init ${task.label}"); }`
      const filePath = `/src/game/${task.id}.ts`

      // 2. Execute via existing agentToolExecutor for sandboxing and UI integration
      const result = await executeAgentToolCall({
        id: crypto.randomUUID(),
        tool: 'create_file',
        params: { path: filePath, content: fileContent },
        timestamp: Date.now()
      }, "system")

      if (result.status === 'rejected' || result.error) {
         throw new Error(`File creation failed: ${result.error}`)
      }

      // 3. Mark success and notify QA Agent
      taskGraph.markComplete(taskId, { files: [filePath] })
      
      const message: AgentMessage = {
         id: crypto.randomUUID(),
         from: 'coding',
         to: 'qa',
         type: 'request',
         content: { taskId, action: 'verify_code' },
         timestamp: Date.now()
      }
      this.blackboard.addAgentMessage(message)

    } catch (error: any) {
      taskGraph.markFailed(taskId, {
         id: crypto.randomUUID(),
         taskId,
         type: 'other',
         message: error.message || 'Unknown coding error',
         timestamp: Date.now()
      })
    }
  }
}
