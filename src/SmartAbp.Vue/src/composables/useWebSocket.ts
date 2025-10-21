// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WebSocket客户端封装（基于SignalR）
// 用于数字大屏实时数据推送
// 创建日期: 2025-10-21
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { ref, onUnmounted } from 'vue'
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr'
import { ElMessage } from 'element-plus'

/**
 * WebSocket连接选项
 */
export interface UseWebSocketOptions {
  /** SignalR Hub的URL */
  url: string
  /** 连接成功回调 */
  onConnected?: () => void
  /** 连接断开回调 */
  onDisconnected?: (error?: Error) => void
  /** 正在重连回调 */
  onReconnecting?: () => void
  /** 重连成功回调 */
  onReconnected?: () => void
}

/**
 * WebSocket客户端Composable
 * 
 * @example
 * ```typescript
 * const { connect, disconnect, on, invoke, isConnected } = useWebSocket({
 *   url: 'http://localhost:5000/hubs/production-line',
 *   onConnected: () => console.log('Connected'),
 *   onDisconnected: () => console.log('Disconnected')
 * })
 * 
 * // 连接
 * await connect()
 * 
 * // 订阅事件
 * on('ProductionLineDataUpdated', (data) => {
 *   console.log('收到实时数据', data)
 * })
 * 
 * // 调用服务端方法
 * await invoke('SubscribeProductionLine', 'line-001')
 * ```
 */
export function useWebSocket(options: UseWebSocketOptions) {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 状态管理
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /** SignalR连接实例 */
  const connection = ref<HubConnection | null>(null)
  
  /** 是否已连接 */
  const isConnected = ref(false)
  
  /** 连接错误信息 */
  const error = ref<string | null>(null)
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 连接管理
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 连接到SignalR Hub
   * 
   * ✅ 自动重连机制（指数退避：1s, 2s, 4s, 8s, 16s）
   * ✅ 完整的生命周期回调
   * ✅ 友好的错误提示
   */
  const connect = async () => {
    try {
      // 1. 创建SignalR连接
      connection.value = new HubConnectionBuilder()
        .withUrl(options.url)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // 指数退避：1s, 2s, 4s, 8s, 16s
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 16000)
          }
        })
        .configureLogging(LogLevel.Information)
        .build()
      
      // 2. 注册生命周期事件
      
      // 连接关闭
      connection.value.onclose((error) => {
        isConnected.value = false
        console.error('[WebSocket] 连接关闭', error)
        ElMessage.error('WebSocket连接已断开')
        options.onDisconnected?.(error)
      })
      
      // 正在重连
      connection.value.onreconnecting((error) => {
        console.warn('[WebSocket] 正在重连...', error)
        ElMessage.warning('WebSocket正在重连...')
        options.onReconnecting?.()
      })
      
      // 重连成功
      connection.value.onreconnected((connectionId) => {
        console.log('[WebSocket] 重连成功', connectionId)
        ElMessage.success('WebSocket重连成功')
        options.onReconnected?.()
      })
      
      // 3. 启动连接
      await connection.value.start()
      isConnected.value = true
      
      console.log('[WebSocket] 连接成功')
      ElMessage.success('WebSocket连接成功')
      options.onConnected?.()
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
      console.error('[WebSocket] 连接失败', err)
      ElMessage.error(`WebSocket连接失败: ${error.value}`)
    }
  }
  
  /**
   * 断开WebSocket连接
   */
  const disconnect = async () => {
    if (connection.value) {
      await connection.value.stop()
      isConnected.value = false
      console.log('[WebSocket] 连接已断开')
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 事件订阅
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 订阅Hub事件
   * 
   * @param eventName 事件名称
   * @param callback 事件回调函数
   * 
   * @example
   * ```typescript
   * on('ProductionLineDataUpdated', (data) => {
   *   console.log('收到实时数据', data)
   * })
   * ```
   */
  const on = (eventName: string, callback: (...args: any[]) => void) => {
    connection.value?.on(eventName, callback)
  }
  
  /**
   * 取消订阅Hub事件
   * 
   * @param eventName 事件名称
   */
  const off = (eventName: string) => {
    connection.value?.off(eventName)
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 方法调用
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 调用Hub服务端方法
   * 
   * @param methodName 方法名称
   * @param args 方法参数
   * @returns 服务端返回值
   * 
   * @example
   * ```typescript
   * // 订阅产线数据
   * await invoke('SubscribeProductionLine', 'line-001')
   * 
   * // 获取当前数据
   * const data = await invoke('GetCurrentData', 'line-001')
   * ```
   */
  const invoke = async (methodName: string, ...args: any[]) => {
    if (!connection.value || !isConnected.value) {
      throw new Error('WebSocket未连接')
    }
    return await connection.value.invoke(methodName, ...args)
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 生命周期
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // 组件卸载时自动断开连接
  onUnmounted(() => {
    disconnect()
  })
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 返回API
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  return {
    /** 连接到WebSocket */
    connect,
    /** 断开WebSocket连接 */
    disconnect,
    /** 订阅Hub事件 */
    on,
    /** 取消订阅Hub事件 */
    off,
    /** 调用Hub服务端方法 */
    invoke,
    /** 是否已连接 */
    isConnected,
    /** 连接错误信息 */
    error
  }
}

