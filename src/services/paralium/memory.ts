import type { BlackboardState } from './blackboard'
import type { FailurePattern } from './agentTypes'

/**
 * Handles persistent memory layers using IndexedDB.
 */
export class MemorySystem {
  private static DB_NAME = 'koye_paralium_memory'
  private static DB_VERSION = 1
  private static STORE_PROJECT = 'project_memory'
  private static STORE_USER = 'user_memory'
  private static STORE_FAILURE = 'failure_memory'

  private static dbPromise: Promise<IDBDatabase> | null = null

  private static openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains(this.STORE_PROJECT)) {
          db.createObjectStore(this.STORE_PROJECT, { keyPath: 'projectId' })
        }
        
        if (!db.objectStoreNames.contains(this.STORE_USER)) {
          db.createObjectStore(this.STORE_USER, { keyPath: 'userId' })
        }
        
        if (!db.objectStoreNames.contains(this.STORE_FAILURE)) {
          // Failure patterns are shared across projects/users for collective learning
          db.createObjectStore(this.STORE_FAILURE, { keyPath: 'id' })
        }
      }

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result)
      }

      request.onerror = (event) => {
        this.dbPromise = null
        reject((event.target as IDBOpenDBRequest).error)
      }
    })

    return this.dbPromise
  }

  // --- Project Memory ---

  public static async saveProjectMemory(projectId: string, state: BlackboardState): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_PROJECT, 'readwrite')
      const store = tx.objectStore(this.STORE_PROJECT)
      const request = store.put({ projectId, state, lastSaved: Date.now() })
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  public static async loadProjectMemory(projectId: string): Promise<BlackboardState | null> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_PROJECT, 'readonly')
      const store = tx.objectStore(this.STORE_PROJECT)
      const request = store.get(projectId)
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.state as BlackboardState)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  // --- Failure Memory ---

  public static async saveFailurePattern(pattern: FailurePattern): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_FAILURE, 'readwrite')
      const store = tx.objectStore(this.STORE_FAILURE)
      const request = store.put(pattern)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  public static async getFailurePatterns(): Promise<FailurePattern[]> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORE_FAILURE, 'readonly')
      const store = tx.objectStore(this.STORE_FAILURE)
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result as FailurePattern[])
      request.onerror = () => reject(request.error)
    })
  }

  public static async findMatchingFailurePattern(errorType: string, keywords: string[]): Promise<FailurePattern | null> {
    const patterns = await this.getFailurePatterns()
    
    // Simple heuristic: find pattern with matching errorType and highest keyword overlap
    let bestMatch: FailurePattern | null = null
    let maxOverlap = 0

    for (const pattern of patterns) {
      if (pattern.errorType === errorType) {
        let overlap = 0
        for (const keyword of keywords) {
          if (pattern.symptomKeywords.includes(keyword)) overlap++
        }
        
        if (overlap > maxOverlap) {
          maxOverlap = overlap
          bestMatch = pattern
        }
      }
    }

    return bestMatch
  }
}
