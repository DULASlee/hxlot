/**
 * Data synchronization utilities with conflict resolution
 */

import { ElMessage } from "element-plus"
import { computed, onUnmounted, ref } from "vue"

/**
 * Conflict resolution strategies
 */
export type ConflictResolutionStrategy = "client-wins" | "server-wins" | "merge" | "manual"

/**
 * Data change interface
 */
export interface DataChange {
  type: "create" | "update" | "delete"
  entity: string
  id: string
  data: any
  timestamp: number
  version?: number
}

/**
 * Sync conflict interface
 */
export interface SyncConflict {
  entity: string
  id: string
  localChange: DataChange
  serverChange: DataChange
  resolution?: ConflictResolutionStrategy
}

/**
 * Sync result interface
 */
export interface SyncResult {
  success: boolean
  conflicts: SyncConflict[]
  errors: string[]
  syncedItems: number
  timestamp: number
}

/**
 * Data synchronizer class
 */
export class DataSynchronizer {
  private pendingChanges: DataChange[] = []
  private syncInProgress = false
  private lastSyncTime = 0
  private conflictResolutionStrategy: ConflictResolutionStrategy = "client-wins"
  // private syncInterval = 30000 // 30 seconds - removed unused variable
  private syncTimer: ReturnType<typeof setInterval> | null = null
  private retryCount = 0
  private maxRetries = 3
  private retryDelay = 1000 // 1 second

  /**
   * Set conflict resolution strategy
   */
  setConflictResolutionStrategy(strategy: ConflictResolutionStrategy): void {
    try {
      // 验证参数
      if (!strategy?.trim()) {
        throw new Error("Conflict resolution strategy is required")
      }

      const validStrategies: ConflictResolutionStrategy[] = [
        "client-wins",
        "server-wins",
        "merge",
        "manual",
      ]
      if (!validStrategies.includes(strategy)) {
        throw new Error(
          `Invalid conflict resolution strategy: ${strategy}. Valid strategies are: ${validStrategies.join(", ")}`,
        )
      }

      this.conflictResolutionStrategy = strategy
      console.log(`🔄 Conflict resolution strategy set to: ${strategy}`)
    } catch (error) {
      console.error("[setConflictResolutionStrategy] 设置冲突解决策略失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to set conflict resolution strategy: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出错误让调用方处理
      throw new Error(`Failed to set conflict resolution strategy: ${errorMessage}`)
    }
  }

  /**
   * Add pending change
   */
  addChange(change: DataChange): void {
    try {
      // 验证参数
      if (!change) {
        throw new Error("Data change is required")
      }

      if (!change.entity?.trim()) {
        throw new Error("Entity name is required")
      }

      if (!change.id?.trim()) {
        throw new Error("Entity ID is required")
      }

      if (!["create", "update", "delete"].includes(change.type)) {
        throw new Error(
          `Invalid change type: ${change.type}. Valid types are: create, update, delete`,
        )
      }

      if (!change.timestamp || change.timestamp <= 0) {
        throw new Error("Valid timestamp is required")
      }

      // 检查是否已存在相同实体的待处理变更
      const existingIndex = this.pendingChanges.findIndex(
        (c) => c.entity === change.entity && c.id === change.id,
      )

      if (existingIndex >= 0) {
        // 合并变更或替换
        const existing = this.pendingChanges[existingIndex]
        if (existing) {
          if (change.timestamp > existing.timestamp) {
            this.pendingChanges[existingIndex] = change
            console.log(`🔄 Updated pending change for ${change.entity}:${change.id}`)
          } else {
            console.log(`⏭️ Skipped older change for ${change.entity}:${change.id}`)
          }
        }
      } else {
        this.pendingChanges.push(change)
        console.log(`➕ Added pending change for ${change.entity}:${change.id}`)
      }

      // 触发自动同步（防抖）
      this.scheduleSync()
    } catch (error) {
      console.error("[addChange] 添加变更失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to add data change: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出错误让调用方处理
      throw new Error(`Failed to add data change: ${errorMessage}`)
    }
  }

  /**
   * Remove pending change
   */
  removeChange(entity: string, id: string): void {
    try {
      // 验证参数
      if (!entity?.trim()) {
        throw new Error("Entity name is required")
      }

      if (!id?.trim()) {
        throw new Error("Entity ID is required")
      }

      const initialLength = this.pendingChanges.length
      this.pendingChanges = this.pendingChanges.filter(
        (change) => !(change.entity === entity && change.id === id),
      )

      const removedCount = initialLength - this.pendingChanges.length
      if (removedCount > 0) {
        console.log(`🗑️ Removed ${removedCount} pending change(s) for ${entity}:${id}`)
      }
    } catch (error) {
      console.error("[removeChange] 移除变更失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to remove data change: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，因为移除失败通常不是致命错误
    }
  }

  /**
   * Sync data with server
   */
  async syncData(): Promise<SyncResult> {
    try {
      if (this.syncInProgress) {
        console.warn("[syncData] 同步已在进行中，跳过本次同步")
        return {
          success: false,
          conflicts: [],
          errors: ["Sync already in progress"],
          syncedItems: 0,
          timestamp: Date.now(),
        }
      }

      if (this.pendingChanges.length === 0) {
        console.log("[syncData] 没有待同步的变更")
        return {
          success: true,
          conflicts: [],
          errors: [],
          syncedItems: 0,
          timestamp: Date.now(),
        }
      }

      this.syncInProgress = true
      console.log(`🔄 Starting data sync with ${this.pendingChanges.length} pending changes`)

      // 模拟服务器同步（实际实现中会调用真实的API）
      const result = await this.performSync()

      if (result.success) {
        // 清除已成功同步的变更
        // 确保syncedItems是字符串数组
        const syncedItems = Array.isArray(result.syncedItems) ? result.syncedItems : []
        this.clearSyncedChanges(syncedItems)
        this.retryCount = 0
        this.lastSyncTime = Date.now()

        console.log(`✅ Data sync completed successfully. Synced ${syncedItems.length} items`)

        if (result.conflicts.length > 0) {
          console.warn(`⚠️ ${result.conflicts.length} conflicts were resolved during sync`)
        }
      } else {
        console.error(`❌ Data sync failed with ${result.errors.length} errors`)

        // 处理重试逻辑
        if (this.retryCount < this.maxRetries) {
          this.retryCount++
          const retryDelay = this.retryDelay * Math.pow(2, this.retryCount - 1) // 指数退避

          console.log(
            `🔄 Scheduling retry ${this.retryCount}/${this.maxRetries} in ${retryDelay}ms`,
          )

          setTimeout(() => {
            this.syncData().catch((error) => {
              console.error("[syncData] 重试同步失败:", error)
            })
          }, retryDelay)
        } else {
          console.error("[syncData] 已达到最大重试次数，停止重试")

          ElMessage.error({
            message: `Data sync failed after ${this.maxRetries} retries. Please check your connection and try again.`,
            duration: 5000,
          })
        }
      }

      this.syncInProgress = false
      return result
    } catch (error) {
      this.syncInProgress = false
      console.error("[syncData] 数据同步失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Data sync failed: ${errorMessage}`,
        duration: 5000,
      })

      return {
        success: false,
        conflicts: [],
        errors: [errorMessage],
        syncedItems: 0,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * Perform actual sync (simulated)
   */
  private async performSync(): Promise<SyncResult> {
    try {
      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      // 模拟随机失败（10%概率）
      if (Math.random() < 0.1) {
        throw new Error("Network error: Connection timeout")
      }

      const conflicts: SyncConflict[] = []
      const errors: string[] = []
      let syncedItems = 0

      // 处理每个待同步的变更
      for (const change of this.pendingChanges) {
        try {
          // 模拟冲突检测（20%概率）
          if (Math.random() < 0.2) {
            const conflict = await this.resolveConflict(change)
            if (conflict) {
              conflicts.push(conflict)
              console.log(`⚠️ Conflict detected for ${change.entity}:${change.id}`)
            }
          } else {
            syncedItems++
            console.log(`✅ Synced ${change.type} for ${change.entity}:${change.id}`)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          errors.push(`Failed to sync ${change.entity}:${change.id}: ${errorMessage}`)
          console.error(`❌ Failed to sync ${change.entity}:${change.id}:`, error)
        }
      }

      return {
        success: errors.length === 0,
        conflicts,
        errors,
        syncedItems,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error("[performSync] 执行同步失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      return {
        success: false,
        conflicts: [],
        errors: [errorMessage],
        syncedItems: 0,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * Resolve sync conflict
   */
  private async resolveConflict(localChange: DataChange): Promise<SyncConflict | null> {
    try {
      // 模拟服务器变更
      const serverChange: DataChange = {
        ...localChange,
        timestamp: localChange.timestamp + 1000, // 服务器版本更新
        version: (localChange.version || 1) + 1,
        data: {
          ...localChange.data,
          _serverModified: true, // 模拟服务器修改
        },
      }

      const conflict: SyncConflict = {
        entity: localChange.entity,
        id: localChange.id,
        localChange,
        serverChange,
      }

      // 根据策略解决冲突
      switch (this.conflictResolutionStrategy) {
        case "client-wins":
          console.log(
            `🔧 Resolving conflict for ${localChange.entity}:${localChange.id} - Client wins`,
          )
          return null // 客户端获胜，不返回冲突

        case "server-wins":
          console.log(
            `🔧 Resolving conflict for ${localChange.entity}:${localChange.id} - Server wins`,
          )
          // 更新本地数据为服务器版本
          this.updateLocalData(serverChange)
          return null // 服务器获胜，不返回冲突

        case "merge":
          console.log(
            `🔧 Resolving conflict for ${localChange.entity}:${localChange.id} - Merge required`,
          )
          // 返回冲突供手动合并
          return conflict

        case "manual":
          console.log(
            `🔧 Resolving conflict for ${localChange.entity}:${localChange.id} - Manual resolution required`,
          )
          return conflict // 返回冲突供手动处理

        default:
          console.warn(
            `⚠️ Unknown conflict resolution strategy: ${this.conflictResolutionStrategy}`,
          )
          return conflict
      }
    } catch (error) {
      console.error("[resolveConflict] 解决冲突失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to resolve sync conflict: ${errorMessage}`,
        duration: 4000,
      })

      // 返回冲突让调用方处理
      return {
        entity: localChange.entity,
        id: localChange.id,
        localChange,
        serverChange: localChange, // 回退到本地变更
      }
    }
  }

  /**
   * Update local data (simulated)
   */
  private updateLocalData(change: DataChange): void {
    try {
      console.log(`🔄 Updating local data for ${change.entity}:${change.id}`)
      // 实际实现中会更新本地存储或状态
    } catch (error) {
      console.error("[updateLocalData] 更新本地数据失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to update local data: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，因为更新失败通常不是致命错误
    }
  }

  /**
   * 清除已成功同步的变更
   */
  clearSyncedChanges(syncedItems: string[]): void {
    try {
      this.pendingChanges = this.pendingChanges.filter(
        change => !syncedItems.includes(change.id)
      )
    } catch (error) {
      console.error("[clearSyncedChanges] 清理已同步变更失败:", error)
    }
  }

  /**
   * Clear synced changes
   * @deprecated 未使用的方法，已移除以消除TypeScript警告
   */
  // private clearSyncedItems(count: number): void {
  //   try {
  //     if (count <= 0) return
  //     if (count >= this.pendingChanges.length) {
  //       this.pendingChanges = []
  //       console.log(`🧹 Cleared all ${count} synced changes`)
  //     } else {
  //       this.pendingChanges = this.pendingChanges.slice(count)
  //       console.log(`🧹 Cleared ${count} synced changes, ${this.pendingChanges.length} remaining`)
  //     }
  //   } catch (error) {
  //     console.error("[clearSyncedChanges] 清理已同步变更失败:", error)
  //     const errorMessage = error instanceof Error ? error.message : String(error)
  //     ElMessage.error({
  //       message: `Failed to clear synced changes: ${errorMessage}`,
  //       duration: 3000,
  //     })
  //   }
  // }

  /**
   * Schedule sync with debouncing
   */
  private scheduleSync(): void {
    try {
      // 简单的防抖实现
      if (this.syncTimer) {
        clearTimeout(this.syncTimer)
      }

      this.syncTimer = setTimeout(() => {
        this.syncData().catch((error) => {
          console.error("[scheduleSync] 定时同步失败:", error)
        })
      }, 2000) // 2秒防抖延迟

      console.log(`⏰ Scheduled sync in 2 seconds`)
    } catch (error) {
      console.error("[scheduleSync] 定时同步失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to schedule sync: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，因为定时失败通常不是致命错误
    }
  }

  /**
   * Get pending changes
   */
  getPendingChanges(): DataChange[] {
    try {
      return [...this.pendingChanges] // 返回副本防止外部修改
    } catch (error) {
      console.error("[getPendingChanges] 获取待处理变更失败:", error)
      return []
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    pendingChanges: number
    syncInProgress: boolean
    lastSyncTime: number
    retryCount: number
    conflictResolutionStrategy: ConflictResolutionStrategy
  } {
    try {
      return {
        pendingChanges: this.pendingChanges.length,
        syncInProgress: this.syncInProgress,
        lastSyncTime: this.lastSyncTime,
        retryCount: this.retryCount,
        conflictResolutionStrategy: this.conflictResolutionStrategy,
      }
    } catch (error) {
      console.error("[getSyncStatus] 获取同步状态失败:", error)
      return {
        pendingChanges: 0,
        syncInProgress: false,
        lastSyncTime: 0,
        retryCount: 0,
        conflictResolutionStrategy: "client-wins",
      }
    }
  }

  /**
   * Force sync
   */
  async forceSync(): Promise<SyncResult> {
    try {
      console.log("🔄 Forcing data sync...")
      return await this.syncData()
    } catch (error) {
      console.error("[forceSync] 强制同步失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Force sync failed: ${errorMessage}`,
        duration: 4000,
      })

      return {
        success: false,
        conflicts: [],
        errors: [errorMessage],
        syncedItems: 0,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    try {
      if (this.syncTimer) {
        clearTimeout(this.syncTimer)
        this.syncTimer = null
      }

      this.pendingChanges = []
      this.syncInProgress = false
      this.retryCount = 0

      console.log("🧹 Data synchronizer cleaned up")
    } catch (error) {
      console.error("[cleanup] 清理失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Failed to cleanup data synchronizer: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，因为清理失败通常不是致命错误
    }
  }
}

/**
 * Composable for data synchronization
 */
export function useDataSync() {
  const synchronizer = new DataSynchronizer()
  const syncStatus = ref(synchronizer.getSyncStatus())
  const pendingChanges = ref<DataChange[]>([])

  /**
   * Update sync status
   */
  const updateSyncStatus = () => {
    try {
      syncStatus.value = synchronizer.getSyncStatus()
      pendingChanges.value = synchronizer.getPendingChanges()
    } catch (error) {
      console.error("[updateSyncStatus] 更新同步状态失败:", error)
    }
  }

  /**
   * Add change
   */
  const addChange = (change: DataChange): void => {
    try {
      synchronizer.addChange(change)
      updateSyncStatus()
    } catch (error) {
      console.error("[addChange] 添加变更失败:", error)
    }
  }

  /**
   * Remove change
   */
  const removeChange = (entity: string, id: string): void => {
    try {
      synchronizer.removeChange(entity, id)
      updateSyncStatus()
    } catch (error) {
      console.error("[removeChange] 移除变更失败:", error)
    }
  }

  /**
   * Sync data
   */
  const syncData = async (): Promise<SyncResult> => {
    try {
      const result = await synchronizer.syncData()
      updateSyncStatus()
      return result
    } catch (error) {
      console.error("[syncData] 同步失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Data sync failed: ${errorMessage}`,
        duration: 5000,
      })

      return {
        success: false,
        conflicts: [],
        errors: [errorMessage],
        syncedItems: 0,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * Force sync
   */
  const forceSync = async (): Promise<SyncResult> => {
    try {
      const result = await synchronizer.forceSync()
      updateSyncStatus()
      return result
    } catch (error) {
      console.error("[forceSync] 强制同步失败:", error)

      const errorMessage = error instanceof Error ? error.message : String(error)

      ElMessage.error({
        message: `Force sync failed: ${errorMessage}`,
        duration: 4000,
      })

      return {
        success: false,
        conflicts: [],
        errors: [errorMessage],
        syncedItems: 0,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * Set conflict resolution strategy
   */
  const setConflictResolutionStrategy = (strategy: ConflictResolutionStrategy): void => {
    try {
      synchronizer.setConflictResolutionStrategy(strategy)
      updateSyncStatus()
    } catch (error) {
      console.error("[setConflictResolutionStrategy] 设置冲突解决策略失败:", error)
    }
  }

  /**
   * Cleanup
   */
  const cleanup = (): void => {
    try {
      synchronizer.cleanup()
      updateSyncStatus()
    } catch (error) {
      console.error("[cleanup] 清理失败:", error)
    }
  }

  // 初始化
  updateSyncStatus()

  // 定时更新状态
  const statusUpdateInterval = setInterval(updateSyncStatus, 5000) // 每5秒更新一次

  // 组件卸载时清理
  onUnmounted(() => {
    try {
      clearInterval(statusUpdateInterval)
      cleanup()
    } catch (error) {
      console.error("[onUnmounted] 卸载时清理失败:", error)
    }
  })

  return {
    syncStatus: computed(() => syncStatus.value),
    pendingChanges: computed(() => pendingChanges.value),
    addChange,
    removeChange,
    syncData,
    forceSync,
    setConflictResolutionStrategy,
    cleanup,
  }
}
