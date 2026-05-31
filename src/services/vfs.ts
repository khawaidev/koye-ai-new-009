/**
 * Virtual File System (VFS) Service
 * 
 * Handles local persistence of project file contents in IndexedDB.
 * This prevents UI lag by keeping large file contents out of the React/Zustand 
 * state tree and avoids the 5MB localStorage limit.
 * 
 * The VFS is the "local source of truth" for the current session's file contents.
 */

const DB_NAME = "koye_vfs"
const DB_VERSION = 1
const STORE_NAME = "file_contents"

let dbPromise: Promise<IDBDatabase> | null = null

// Broadcast Channel for live syncing across tabs/windows
const syncChannel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("koye_vfs_sync") : null

function broadcastChange(projectId: string, type: "create" | "update" | "delete" | "rename", details: any) {
  if (syncChannel) {
    syncChannel.postMessage({
      projectId,
      type,
      details,
      timestamp: Date.now()
    })
  }
}

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    } catch (e) {
      reject(e)
    }
  })

  return dbPromise
}

/**
 * Save file content to VFS
 * @param projectId Current project ID
 * @param path File path
 * @param content String content or URL
 */
export async function saveVFSFile(projectId: string, path: string, content: string): Promise<void> {
  const db = await openDb()
  const key = `${projectId}:${path}`
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    store.put(content, key)
    tx.oncomplete = () => {
      broadcastChange(projectId, "update", { path })
      resolve()
    }
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Get file content from VFS
 * @param projectId Current project ID
 * @param path File path
 */
export async function getVFSFile(projectId: string, path: string): Promise<string | null> {
  const db = await openDb()
  const key = `${projectId}:${path}`
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(key)
    
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Delete a file from VFS
 */
export async function deleteVFSFile(projectId: string, path: string): Promise<void> {
  const db = await openDb()
  const key = `${projectId}:${path}`
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    store.delete(key)
    
    tx.oncomplete = () => {
      broadcastChange(projectId, "delete", { path })
      resolve()
    }
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Clear all files for a specific project from VFS
 */
export async function clearProjectVFS(projectId: string): Promise<void> {
  const db = await openDb()
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAllKeys()
    
    request.onsuccess = () => {
      const keys = request.result as string[]
      const projectPrefix = `${projectId}:`
      for (const key of keys) {
        if (typeof key === "string" && key.startsWith(projectPrefix)) {
          store.delete(key)
        }
      }
    }
    tx.oncomplete = () => {
      broadcastChange(projectId, "delete", { all: true })
      resolve()
    }
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Bulk save files to VFS
 */
export async function bulkSaveVFS(projectId: string, files: Record<string, string>): Promise<void> {
  const db = await openDb()
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    
    for (const [path, content] of Object.entries(files)) {
      store.put(content, `${projectId}:${path}`)
    }
    
    tx.oncomplete = () => {
      broadcastChange(projectId, "update", { paths: Object.keys(files) })
      resolve()
    }
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Get ALL files for a project from VFS.
 * Returns a Record<path, content>.
 */
export async function getAllVFSFiles(projectId: string): Promise<Record<string, string>> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAllKeys()
    const result: Record<string, string> = {}
    const projectPrefix = `${projectId}:`

    request.onsuccess = () => {
      const keys = (request.result as string[]).filter(
        k => typeof k === "string" && k.startsWith(projectPrefix)
      )
      if (keys.length === 0) {
        resolve(result)
        return
      }

      let pending = keys.length
      for (const key of keys) {
        const getReq = store.get(key)
        getReq.onsuccess = () => {
          const path = key.substring(projectPrefix.length)
          if (getReq.result !== undefined) {
            result[path] = getReq.result
          }
          if (--pending === 0) resolve(result)
        }
        getReq.onerror = () => {
          if (--pending === 0) resolve(result)
        }
      }
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Atomic rename: copy content to new path, delete old path.
 */
export async function renameVFSFile(projectId: string, oldPath: string, newPath: string): Promise<void> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    const oldKey = `${projectId}:${oldPath}`
    const newKey = `${projectId}:${newPath}`

    const getReq = store.get(oldKey)
    getReq.onsuccess = () => {
      if (getReq.result !== undefined) {
        store.put(getReq.result, newKey)
        store.delete(oldKey)
      }
    }
    tx.oncomplete = () => {
      broadcastChange(projectId, "rename", { oldPath, newPath })
      resolve()
    }
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Bulk rename: move all files under oldPrefix to newPrefix.
 * Used for folder renames/moves.
 */
export async function moveVFSFiles(projectId: string, oldPrefix: string, newPrefix: string): Promise<void> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAllKeys()

    request.onsuccess = () => {
      const keys = request.result as string[]
      const projectKeyPrefix = `${projectId}:${oldPrefix}`
      for (const key of keys) {
        if (typeof key === "string" && key.startsWith(projectKeyPrefix)) {
          const getReq = store.get(key)
          getReq.onsuccess = () => {
            const relativePath = key.substring(`${projectId}:`.length)
            const newPath = newPrefix + relativePath.substring(oldPrefix.length)
            store.put(getReq.result, `${projectId}:${newPath}`)
            store.delete(key)
          }
        }
      }
    }
    tx.oncomplete = () => {
      broadcastChange(projectId, "rename", { oldPrefix, newPrefix, isFolder: true })
      resolve()
    }
    tx.onerror = () => reject(tx.error)
  })
}
