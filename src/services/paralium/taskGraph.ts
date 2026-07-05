import type { AgentType, ErrorRecord } from './agentTypes'

export type TaskStatus = 'blocked' | 'ready' | 'running' | 'done' | 'failed' | 'skipped'

export interface TaskNode {
  id: string
  type: 'discovery' | 'research' | 'planning' | 'coding' | 'asset' | 'testing' | 'debugging'
  label: string
  status: TaskStatus
  dependencies: string[] // Task IDs that must complete first
  assignedAgent: AgentType
  priority: number
  retryCount: number
  maxRetries: number
  result: any
  error: ErrorRecord | null
}

export class TaskGraph {
  public nodes: Map<string, TaskNode> = new Map()
  
  constructor() {
    this.nodes = new Map()
  }

  public addTask(task: TaskNode): void {
    if (!this.nodes.has(task.id)) {
      this.nodes.set(task.id, task)
      this.evaluateDependencies()
    }
  }

  public removeTask(taskId: string): void {
    this.nodes.delete(taskId)
    // Remove as dependency from other tasks
    for (const node of this.nodes.values()) {
      node.dependencies = node.dependencies.filter(id => id !== taskId)
    }
    this.evaluateDependencies()
  }

  public getTask(taskId: string): TaskNode | undefined {
    return this.nodes.get(taskId)
  }

  public getAllTasks(): TaskNode[] {
    return Array.from(this.nodes.values())
  }

  public updateTaskStatus(taskId: string, status: TaskStatus, result?: any, error?: ErrorRecord): void {
    const task = this.nodes.get(taskId)
    if (task) {
      task.status = status
      if (result !== undefined) task.result = result
      if (error !== undefined) task.error = error
      this.nodes.set(taskId, task)
      
      if (status === 'done' || status === 'failed' || status === 'skipped') {
        this.evaluateDependencies()
      }
    }
  }

  public markComplete(taskId: string, result: any): void {
    this.updateTaskStatus(taskId, 'done', result)
  }

  public markFailed(taskId: string, error: ErrorRecord): void {
    const task = this.nodes.get(taskId)
    if (task) {
      task.retryCount++
      if (task.retryCount >= task.maxRetries) {
        this.updateTaskStatus(taskId, 'failed', undefined, error)
      } else {
        this.updateTaskStatus(taskId, 'ready', undefined, error) // reset to ready for retry
      }
    }
  }

  public getReadyTasks(): TaskNode[] {
    return Array.from(this.nodes.values()).filter(t => t.status === 'ready')
  }

  public getRunningTasks(): TaskNode[] {
    return Array.from(this.nodes.values()).filter(t => t.status === 'running')
  }

  public getBlockedTasks(): TaskNode[] {
    return Array.from(this.nodes.values()).filter(t => t.status === 'blocked')
  }
  
  public getFailedTasks(): TaskNode[] {
      return Array.from(this.nodes.values()).filter(t => t.status === 'failed')
  }

  public getDoneTasks(): TaskNode[] {
      return Array.from(this.nodes.values()).filter(t => t.status === 'done' || t.status === 'skipped')
  }

  public getMaxParallelBatch(): TaskNode[] {
    // Basic implementation: return all ready tasks.
    // Can be enhanced to limit based on resource/agent capacity.
    return this.getReadyTasks()
  }

  public getCompletionPercentage(): number {
    if (this.nodes.size === 0) return 0
    const completed = this.getDoneTasks().length
    return Math.round((completed / this.nodes.size) * 100)
  }

  private evaluateDependencies(): void {
    for (const node of this.nodes.values()) {
      if (node.status === 'blocked' || node.status === 'ready') {
        const allDepsDone = node.dependencies.every(depId => {
          const depNode = this.nodes.get(depId)
          return depNode && (depNode.status === 'done' || depNode.status === 'skipped')
        })
        
        if (allDepsDone) {
          node.status = 'ready'
        } else {
          node.status = 'blocked'
        }
      }
    }
  }
  
  // Serialize for storage
  public serialize(): string {
    return JSON.stringify(Array.from(this.nodes.entries()))
  }
  
  // Deserialize from storage
  public deserialize(data: string): void {
    try {
      const entries = JSON.parse(data)
      this.nodes = new Map(entries)
    } catch (e) {
      console.error("Failed to deserialize TaskGraph", e)
      this.nodes = new Map()
    }
  }
}
