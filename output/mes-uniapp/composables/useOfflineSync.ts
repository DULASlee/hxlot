// composables/useOfflineSync.ts
/**
 * 离线数据同步Composable
 * @author SmartAbp DevKit Low-Code Engine
 * @since 2025-10-22
 */

import { ref } from 'vue'
import { setStorage, getStorage } from '@/utils/storage'
import { request } from '@/utils/request'

interface OfflineAction {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: string
  data: any
  timestamp: number
  synced: boolean
}

const offlineQueue = ref<OfflineAction[]>(getStorage('offline_queue') || [])
const isSyncing = ref(false)

export function useOfflineSync() {
  /**
   * 添加离线操作到队列
   */
  function addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>) {
    const newAction: OfflineAction = {
      id: `$${Date.now()}-$${Math.random().toString(36).substr(2, 9)}`,
      ...action,
      timestamp: Date.now(),
      synced: false
    }
    
    offlineQueue.value.push(newAction)
    setStorage('offline_queue', offlineQueue.value)
    
    console.log('添加离线操作:', newAction)
  }

  /**
   * 同步离线队列
   */
  async function syncOfflineQueue(): Promise<void> {
    if (isSyncing.value || offlineQueue.value.length === 0) {
      return
    }

    isSyncing.value = true
    
    try {
      const unsyncedActions = offlineQueue.value.filter(a => !a.synced)
      
      for (const action of unsyncedActions) {
        try {
          await syncAction(action)
          action.synced = true
        } catch (error) {
          console.error('同步操作失败:', action, error)
          // 继续同步下一个
        }
      }
      
      // 移除已同步的操作
      offlineQueue.value = offlineQueue.value.filter(a => !a.synced)
      setStorage('offline_queue', offlineQueue.value)
      
      if (unsyncedActions.length > 0) {
        uni.showToast({ title: `同步成功 ($${unsyncedActions.length}条)`, icon: 'success' })
      }
    } finally {
      isSyncing.value = false
    }
  }

  /**
   * 同步单个操作
   */
  async function syncAction(action: OfflineAction): Promise<void> {
    const { type, entity, data } = action
    
    switch (type) {
      case 'CREATE':
        await request({ url: `/api/app/$${entity}`, method: 'POST', data })
        break
      case 'UPDATE':
        await request({ url: `/api/app/$${entity}/$${data.id}`, method: 'PUT', data })
        break
      case 'DELETE':
        await request({ url: `/api/app/$${entity}/$${data.id}`, method: 'DELETE' })
        break
    }
  }

  /**
   * 检查网络状态并自动同步
   */
  function setupAutoSync() {
    // 监听网络状态变化
    uni.onNetworkStatusChange((res) => {
      if (res.isConnected && !res.networkType.includes('none')) {
        console.log('网络恢复，开始同步离线数据')
        syncOfflineQueue()
      }
    })
    
    // 应用启动时同步
    uni.getNetworkType({
      success: (res) => {
        if (res.networkType !== 'none') {
          syncOfflineQueue()
        }
      }
    })
  }

  return {
    offlineQueue,
    isSyncing,
    addOfflineAction,
    syncOfflineQueue,
    setupAutoSync
  }
}
