import { createClient } from "./supabase/client"
import { offlineStorage, type OfflineTask } from "./offline-storage"

export class OfflineSync {
  private isProcessing = false
  private maxRetries = 3
  private retryDelay = 1000

  async queueAction(action: Omit<OfflineTask, "id">) {
    await offlineStorage.addPendingSync(action)
    console.log("Queued offline action:", action.entity, action.action)
  }

  async processPendingSync() {
    if (this.isProcessing) return

    this.isProcessing = true
    console.log("Processing pending sync...")

    const pending = await offlineStorage.getPendingSync()
    console.log("Found", pending.length, "pending items")

    for (const task of pending) {
      try {
        await this.executeTaskWithRetry(task)
        await offlineStorage.clearPendingSync(task.id)
        console.log("Synced:", task.entity, task.id)
      } catch (error) {
        console.error("Sync failed for", task.id, error)
        // Leave in queue for next sync attempt
      }
    }

    this.isProcessing = false
  }

  private async executeTaskWithRetry(task: OfflineTask, attempt = 1): Promise<void> {
    try {
      await this.executeTask(task)
    } catch (error) {
      if (attempt < this.maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay * attempt))
        return this.executeTaskWithRetry(task, attempt + 1)
      }
      throw error
    }
  }

  private async executeTask(task: OfflineTask) {
    const supabase = createClient()

    // Check for conflicts before applying
    if (task.action === "update") {
      const conflict = await this.detectConflict(task)
      if (conflict) {
        await this.handleConflict(task, conflict)
        return
      }
    }

    switch (task.action) {
      case "create":
        const { error: createError } = await supabase.from(task.entity).insert(task.data)
        if (createError) throw createError
        break
      case "update":
        const { error: updateError } = await supabase.from(task.entity).update(task.data).eq("id", task.data.id)
        if (updateError) throw updateError
        break
      case "delete":
        const { error: deleteError } = await supabase.from(task.entity).delete().eq("id", task.data.id)
        if (deleteError) throw deleteError
        break
    }
  }

  private async detectConflict(task: OfflineTask): Promise<any> {
    const supabase = createClient()
    const { data } = await supabase.from(task.entity).select("*").eq("id", task.data.id).single()

    if (!data) return null

    // Check if server version is newer than our offline version
    if (data.updated_at && task.data.updated_at) {
      const serverTime = new Date(data.updated_at).getTime()
      const localTime = new Date(task.data.updated_at).getTime()
      if (serverTime > localTime) {
        return data // Conflict detected
      }
    }

    return null
  }

  private async handleConflict(task: OfflineTask, serverData: any) {
    console.warn("Conflict detected for", task.entity, task.data.id)

    // For critical fields, store conflict for manual resolution
    // For non-critical fields, use last-writer-wins
    const criticalEntities = ["permits", "approvals", "compliance"]

    if (criticalEntities.includes(task.entity)) {
      // Store conflict for manual resolution
      await offlineStorage.storeConflict({
        entity: task.entity,
        localData: task.data,
        serverData,
        timestamp: new Date().toISOString(),
      })
    } else {
      // Last-writer-wins for non-critical data
      console.log("Applying last-writer-wins strategy")
      const supabase = createClient()
      await supabase.from(task.entity).update(task.data).eq("id", task.data.id)
    }
  }

  async cacheForOffline(entity: string, data: any) {
    await offlineStorage.cacheData(entity, data)
  }

  async getCachedData(entity: string) {
    return await offlineStorage.getCachedData(entity)
  }

  async getConflicts() {
    return await offlineStorage.getConflicts()
  }

  async resolveConflict(conflictId: string, resolution: "local" | "server" | "merge", mergedData?: any) {
    const conflicts = await this.getConflicts()
    const conflict = conflicts.find((c) => c.id === conflictId)
    if (!conflict) return

    const supabase = createClient()
    let dataToApply = mergedData

    if (resolution === "local") {
      dataToApply = conflict.localData
    } else if (resolution === "server") {
      dataToApply = conflict.serverData
    }

    await supabase.from(conflict.entity).update(dataToApply).eq("id", dataToApply.id)
    await offlineStorage.clearConflict(conflictId)
  }
}

export const offlineSync = new OfflineSync()

// Auto-sync when online
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("Connection restored, syncing...")
    offlineSync.processPendingSync()
  })
}
