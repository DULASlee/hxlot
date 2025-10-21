/**
 * WebSocket客户端 Composable (基于SignalR)
 * 用于MES实时监控大屏的数据推送
 */
import { ref, onUnmounted } from 'vue'
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr'
import { ElMessage } from 'element-plus'

interface UseWebSocketOptions {
  url: string
  onConnected?: () => void
  onDisconnected?: (error?: Error) => void
  onReconnecting?: () => void
  onReconnected?: () => void
}

export function useWebSocket(options: UseWebSocketOptions) {
  const connection = ref<HubConnection | null>(null)
  const isConnected = ref(false)
  const error = ref<string | null>(null)
  
  /**
   * 连接到SignalR Hub
   */
  const connect = async () => {
    if (connection.value) {
      console.warn('[useWebSocket] 连接已存在，跳过重复连接')
      return
    }

    try {
      console.log(`[useWebSocket] 正在连接到 ${options.url}...`)
      
      connection.value = new HubConnectionBuilder()
        .withUrl(options.url)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // 指数退避重试策略: 1s, 2s, 4s, 8s, 最大30s
            const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000)
            console.log(`[useWebSocket] 重试第${retryContext.previousRetryCount + 1}次，延迟${delay}ms`)
            return delay
          }
        })
        .configureLogging(LogLevel.Information)
        .build()

      // 监听重连事件
      connection.value.onreconnecting((error) => {
        isConnected.value = false
        console.warn('[useWebSocket] 连接断开，正在重新连接...', error)
        ElMessage.warning('连接断开，正在重新连接...')
        options.onReconnecting?.()
      })

      connection.value.onreconnected((connectionId) => {
        isConnected.value = true
        error.value = null
        console.log(`[useWebSocket] 重新连接成功！连接ID: ${connectionId}`)
        ElMessage.success('重新连接成功！')
        options.onReconnected?.()
      })

      connection.value.onclose((err) => {
        isConnected.value = false
        error.value = err?.message || '连接已关闭'
        console.error('[useWebSocket] 连接关闭', err)
        options.onDisconnected?.(err)
      })

      await connection.value.start()
      isConnected.value = true
      error.value = null
      console.log('[useWebSocket] ✅ SignalR连接成功！')
      ElMessage.success('实时数据连接成功！')
      options.onConnected?.()
      
    } catch (err: any) {
      isConnected.value = false
      error.value = err.message
      console.error('[useWebSocket] ❌ 连接失败:', err)
      ElMessage.error(`连接失败: ${err.message}`)
      connection.value = null
    }
  }

  /**
   * 断开连接
   */
  const disconnect = async () => {
    if (!connection.value) {
      return
    }

    try {
      await connection.value.stop()
      console.log('[useWebSocket] 连接已断开')
    } catch (err: any) {
      console.error('[useWebSocket] 断开连接时出错:', err)
    } finally {
      connection.value = null
      isConnected.value = false
      error.value = null
    }
  }

  /**
   * 监听服务端推送的事件
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  const on = <T = any>(eventName: string, callback: (data: T) => void) => {
    if (!connection.value) {
      console.warn(`[useWebSocket] 无法监听事件 ${eventName}：连接未建立`)
      return
    }
    
    connection.value.on(eventName, callback)
    console.log(`[useWebSocket] 已监听事件: ${eventName}`)
  }

  /**
   * 取消监听事件
   * @param eventName 事件名称
   */
  const off = (eventName: string) => {
    if (!connection.value) {
      return
    }
    
    connection.value.off(eventName)
    console.log(`[useWebSocket] 已取消监听事件: ${eventName}`)
  }

  /**
   * 调用服务端方法
   * @param methodName 方法名
   * @param args 参数
   */
  const invoke = async <T = any>(methodName: string, ...args: any[]): Promise<T | void> => {
    if (!connection.value || !isConnected.value) {
      console.error(`[useWebSocket] 无法调用方法 ${methodName}：连接未建立`)
      ElMessage.error('连接未建立，请先连接服务器')
      return
    }

    try {
      const result = await connection.value.invoke<T>(methodName, ...args)
      console.log(`[useWebSocket] ✅ 调用方法 ${methodName} 成功`, result)
      return result
    } catch (err: any) {
      console.error(`[useWebSocket] ❌ 调用方法 ${methodName} 失败:`, err)
      ElMessage.error(`调用失败: ${err.message}`)
      throw err
    }
  }

  // 组件卸载时自动断开连接
  onUnmounted(() => {
    disconnect()
  })

  return {
    connection,
    isConnected,
    error,
    connect,
    disconnect,
    on,
    off,
    invoke
  }
}
