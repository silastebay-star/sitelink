// IndexedDB utilities for offline data storage
const DB_NAME = "rapid_site_connect"
const DB_VERSION = 1

export interface OfflineTask {
  id: string
  action: "create" | "update" | "delete"
  entity: string
  data: any
  timestamp: number
}

export interface Conflict {
  id: string
  entity: string
  localData: any
  serverData: any
  timestamp: string
}

class OfflineStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores for offline data
        if (!db.objectStoreNames.contains("pending_sync")) {
          db.createObjectStore("pending_sync", { keyPath: "id", autoIncrement: true })
        }

        if (!db.objectStoreNames.contains("cached_data")) {
          const store = db.createObjectStore("cached_data", { keyPath: "key" })
          store.createIndex("timestamp", "timestamp", { unique: false })
        }

        if (!db.objectStoreNames.contains("conflicts")) {
          db.createObjectStore("conflicts", { keyPath: "id", autoIncrement: true })
        }
      }
    })
  }

  async addPendingSync(task: Omit<OfflineTask, "id">): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["pending_sync"], "readwrite")
      const store = transaction.objectStore("pending_sync")
      const request = store.add({ ...task, id: Date.now().toString() })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingSync(): Promise<OfflineTask[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["pending_sync"], "readonly")
      const store = transaction.objectStore("pending_sync")
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async clearPendingSync(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["pending_sync"], "readwrite")
      const store = transaction.objectStore("pending_sync")
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async cacheData(key: string, data: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cached_data"], "readwrite")
      const store = transaction.objectStore("cached_data")
      const request = store.put({
        key,
        data,
        timestamp: Date.now(),
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getCachedData(key: string): Promise<any> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["cached_data"], "readonly")
      const store = transaction.objectStore("cached_data")
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result?.data)
      request.onerror = () => reject(request.error)
    })
  }

  async storeConflict(conflict: Omit<Conflict, "id">): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["conflicts"], "readwrite")
      const store = transaction.objectStore("conflicts")
      const request = store.add({ ...conflict, id: Date.now().toString() })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getConflicts(): Promise<Conflict[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["conflicts"], "readonly")
      const store = transaction.objectStore("conflicts")
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async clearConflict(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["conflicts"], "readwrite")
      const store = transaction.objectStore("conflicts")
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export const offlineStorage = new OfflineStorage()
