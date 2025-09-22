/**
 * 代码生成进度管理组合式函数
 * 提供代码生成进度跟踪、会话管理和实时通信功能
 */

import { ref, reactive, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * 代码生成进度状态接口
 */
export interface CodeGenerationProgress {
  /** 会话ID */
  sessionId: string
  /** 总文件数 */
  totalFiles: number
  /** 已生成文件数 */
  generatedFiles: number
  /** 当前正在生成的文件 */
  currentFile: string
  /** 当前状态 */
  status: 'idle' | 'generating' | 'completed' | 'error'
  /** 进度百分比 */
  percentage: number
  /** 开始时间 */
  startTime: Date
  /** 结束时间 */
  endTime?: Date
  /** 错误信息 */
  error?: string
  /** 警告信息 */
  warnings: string[]
  /** 生成的文件列表 */
  generatedFileList: string[]
}

/**
 * WebSocket连接状态
 */
export interface WebSocketConnection {
  /** WebSocket实例 */
  ws: WebSocket | null
  /** 连接状态 */
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  /** 重连次数 */
  reconnectAttempts: number
  /** 最后错误 */
  lastError?: string
}

/**
 * 代码生成进度管理组合式函数
 */
export function useCodeGenerationProgress() {
  // 当前进度状态
  const currentProgress = ref<CodeGenerationProgress | null>(null)
  
  // WebSocket连接状态
  const connection = reactive<WebSocketConnection>({
    ws: null,
    status: 'disconnected',
    reconnectAttempts: 0,
  })
  
  // 会话映射表
  const sessionMap = ref<Map<string, CodeGenerationProgress>>(new Map())
  
  // 是否正在生成
  const isGenerating = computed(() => currentProgress.value?.status === 'generating')
  
  // 是否已完成
  const isCompleted = computed(() => currentProgress.value?.status === 'completed')
  
  // 是否有错误
  const hasError = computed(() => currentProgress.value?.status === 'error')
  
  // 当前进度百分比
  const progressPercentage = computed(() => currentProgress.value?.percentage || 0)
  
  // WebSocket URL
  const wsUrl = ref<string>('')
  
  // 重连定时器
  let reconnectTimer: number | null = null
  
  // 心跳定时器
  let heartbeatTimer: number | null = null
  
  /**
   * 生成会话ID
   */
  const generateSessionId = (): string => {
    try {
      const timestamp = Date.now().toString(36)
      const random = Math.random().toString(36).substr(2, 9)
      return `gen_${timestamp}_${random}`
    } catch (error) {
      console.error(`[generateSessionId] 生成会话ID失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to generate session ID: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到简单的ID生成
      return `gen_${Date.now()}`
    }
  }
  
  /**
   * 创建新的进度会话
   */
  const createSession = (totalFiles: number): string => {
    try {
      // 验证参数
      if (typeof totalFiles !== 'number' || totalFiles < 0) {
        throw new Error('Total files must be a non-negative number')
      }

      const sessionId = generateSessionId()
      
      const progress: CodeGenerationProgress = {
        sessionId,
        totalFiles,
        generatedFiles: 0,
        currentFile: '',
        status: 'idle',
        percentage: 0,
        startTime: new Date(),
        warnings: [],
        generatedFileList: []
      }
      
      sessionMap.value.set(sessionId, progress)
      currentProgress.value = progress
      
      console.log(`📊 Created new generation session: ${sessionId} with ${totalFiles} files`)
      
      return sessionId
    } catch (error) {
      console.error(`[createSession] 创建会话失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to create session: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to create session: ${errorMessage}`)
    }
  }
  
  /**
   * 更新进度
   */
  const updateProgress = (sessionId: string, update: Partial<CodeGenerationProgress>): void => {
    try {
      // 验证参数
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }

      if (!update || typeof update !== 'object') {
        throw new Error('Update must be a valid object')
      }

      const session = sessionMap.value.get(sessionId)
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`)
      }
      
      // 更新进度数据
      Object.assign(session, update)
      
      // 重新计算百分比
      if (session.totalFiles > 0) {
        session.percentage = Math.round((session.generatedFiles / session.totalFiles) * 100)
      }
      
      // 更新当前会话显示
      if (currentProgress.value?.sessionId === sessionId) {
        currentProgress.value = { ...session }
      }
      
      console.log(`📈 Updated progress for session ${sessionId}: ${session.percentage}% (${session.generatedFiles}/${session.totalFiles})`)
      
      // 显示进度更新消息
      if (update.currentFile) {
        ElMessage.info({
          message: `Generating: ${update.currentFile}`,
          duration: 2000,
        })
      }
    } catch (error) {
      console.error(`[updateProgress] 更新进度失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to update progress: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 标记文件生成完成
   */
  const markFileCompleted = (sessionId: string, fileName: string): void => {
    try {
      // 验证参数
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }

      if (!fileName?.trim()) {
        throw new Error('File name is required')
      }

      const session = sessionMap.value.get(sessionId)
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`)
      }
      
      session.generatedFiles++
      session.generatedFileList.push(fileName)
      
      // 重新计算百分比
      if (session.totalFiles > 0) {
        session.percentage = Math.round((session.generatedFiles / session.totalFiles) * 100)
      }
      
      // 检查是否全部完成
      if (session.generatedFiles >= session.totalFiles) {
        session.status = 'completed'
        session.endTime = new Date()
        
        ElMessage.success({
          message: `Code generation completed successfully! Generated ${session.generatedFiles} files`,
          duration: 5000,
        })
      }
      
      // 更新当前会话显示
      if (currentProgress.value?.sessionId === sessionId) {
        currentProgress.value = { ...session }
      }
      
      console.log(`✅ File completed: ${fileName} (${session.generatedFiles}/${session.totalFiles})`)
    } catch (error) {
      console.error(`[markFileCompleted] 标记文件完成失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to mark file as completed: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 标记生成错误
   */
  const markError = (sessionId: string, error: string): void => {
    try {
      // 验证参数
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }

      if (!error?.trim()) {
        throw new Error('Error message is required')
      }

      const session = sessionMap.value.get(sessionId)
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`)
      }
      
      session.status = 'error'
      session.error = error
      session.endTime = new Date()
      
      // 更新当前会话显示
      if (currentProgress.value?.sessionId === sessionId) {
        currentProgress.value = { ...session }
      }
      
      console.error(`❌ Generation error for session ${sessionId}: ${error}`)
      
      ElMessage.error({
        message: `Code generation failed: ${error}`,
        duration: 5000,
      })
    } catch (updateError) {
      console.error(`[markError] 标记错误失败:`, updateError)
      
      const errorMessage = updateError instanceof Error ? updateError.message : String(updateError)
      
      ElMessage.error({
        message: `Failed to mark error: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 添加警告
   */
  const addWarning = (sessionId: string, warning: string): void => {
    try {
      // 验证参数
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }

      if (!warning?.trim()) {
        throw new Error('Warning message is required')
      }

      const session = sessionMap.value.get(sessionId)
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`)
      }
      
      session.warnings.push(warning)
      
      // 更新当前会话显示
      if (currentProgress.value?.sessionId === sessionId) {
        currentProgress.value = { ...session }
      }
      
      console.warn(`⚠️ Warning for session ${sessionId}: ${warning}`)
      
      ElMessage.warning({
        message: `Warning: ${warning}`,
        duration: 4000,
      })
    } catch (error) {
      console.error(`[addWarning] 添加警告失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to add warning: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 获取会话进度
   */
  const getSessionProgress = (sessionId: string): CodeGenerationProgress | null => {
    try {
      // 验证参数
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }

      return sessionMap.value.get(sessionId) || null
    } catch (error) {
      console.error(`[getSessionProgress] 获取会话进度失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to get session progress: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到null
      return null
    }
  }
  
  /**
   * 获取所有会话
   */
  const getAllSessions = (): CodeGenerationProgress[] => {
    try {
      return Array.from(sessionMap.value.values())
    } catch (error) {
      console.error(`[getAllSessions] 获取所有会话失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to get all sessions: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到空数组
      return []
    }
  }
  
  /**
   * 连接WebSocket
   */
  const connect = (url: string): Promise<void> => {
    try {
      // 验证参数
      if (!url?.trim()) {
        throw new Error('WebSocket URL is required')
      }

      // 验证URL格式
      if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
        throw new Error('Invalid WebSocket URL format. Must start with ws:// or wss://')
      }

      wsUrl.value = url
      
      return new Promise((resolve, reject) => {
        try {
          // 关闭现有连接
          disconnect()
          
          connection.status = 'connecting'
          connection.reconnectAttempts = 0
          
          console.log(`🔗 Connecting to WebSocket: ${url}`)
          
          connection.ws = new WebSocket(url)
          
          connection.ws.onopen = () => {
            try {
              connection.status = 'connected'
              connection.lastError = undefined
              console.log('✅ WebSocket connected')
              
              ElMessage.success({
                message: 'WebSocket connected successfully',
                duration: 3000,
              })
              
              // 开始心跳
              startHeartbeat()
              
              resolve()
            } catch (openError) {
              console.error(`[WebSocket onopen] 连接处理失败:`, openError)
              reject(openError)
            }
          }
          
          connection.ws.onmessage = (event) => {
            try {
              handleWebSocketMessage(event.data)
            } catch (messageError) {
              console.error(`[WebSocket onmessage] 消息处理失败:`, messageError)
            }
          }
          
          connection.ws.onerror = (error) => {
            try {
              connection.status = 'error'
              connection.lastError = error.type || 'Unknown WebSocket error'
              console.error('❌ WebSocket error:', error)
              
              ElMessage.error({
                message: `WebSocket connection error: ${connection.lastError}`,
                duration: 4000,
              })
              
              reject(new Error(`WebSocket connection error: ${connection.lastError}`))
            } catch (errorHandlerError) {
              console.error(`[WebSocket onerror] 错误处理失败:`, errorHandlerError)
              reject(errorHandlerError)
            }
          }
          
          connection.ws.onclose = () => {
            try {
              connection.status = 'disconnected'
              connection.ws = null
              console.log('🔌 WebSocket disconnected')
              
              // 停止心跳
              stopHeartbeat()
              
              // 自动重连
              if (wsUrl.value && connection.reconnectAttempts < 3) {
                scheduleReconnect()
              }
            } catch (closeError) {
              console.error(`[WebSocket onclose] 关闭处理失败:`, closeError)
            }
          }
        } catch (connectionError) {
          console.error(`[connect] WebSocket连接失败:`, connectionError)
          
          const errorMessage = connectionError instanceof Error ? connectionError.message : String(connectionError)
          
          ElMessage.error({
            message: `Failed to connect to WebSocket: ${errorMessage}`,
            duration: 4000,
          })
          
          reject(connectionError)
        }
      })
    } catch (error) {
      console.error(`[connect] 连接失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to establish connection: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to establish connection: ${errorMessage}`)
    }
  }
  
  /**
   * 断开WebSocket连接
   */
  const disconnect = (): void => {
    try {
      if (connection.ws) {
        console.log('🔌 Disconnecting WebSocket')
        
        // 清除重连定时器
        if (reconnectTimer) {
          clearTimeout(reconnectTimer)
          reconnectTimer = null
        }
        
        // 停止心跳
        stopHeartbeat()
        
        // 关闭连接
        connection.ws.close()
        connection.ws = null
        connection.status = 'disconnected'
        connection.reconnectAttempts = 0
        
        ElMessage.info({
          message: 'WebSocket disconnected',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error(`[disconnect] 断开连接失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to disconnect: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 处理WebSocket消息
   */
  const handleWebSocketMessage = (data: string): void => {
    try {
      // 验证参数
      if (!data?.trim()) {
        console.warn('Received empty WebSocket message')
        return
      }

      const message = JSON.parse(data)
      
      // 验证消息格式
      if (!message.type || typeof message.type !== 'string') {
        throw new Error('Invalid message format: missing or invalid type')
      }
      
      if (!message.sessionId || typeof message.sessionId !== 'string') {
        throw new Error('Invalid message format: missing or invalid sessionId')
      }

      console.log(`📨 Received WebSocket message: ${message.type} for session ${message.sessionId}`)
      
      switch (message.type) {
        case 'progress':
          updateProgress(message.sessionId, message.data)
          break
        case 'fileCompleted':
          markFileCompleted(message.sessionId, message.data.fileName)
          break
        case 'error':
          markError(message.sessionId, message.data.error)
          break
        case 'warning':
          addWarning(message.sessionId, message.data.warning)
          break
        default:
          console.warn(`Unknown message type: ${message.type}`)
      }
    } catch (error) {
      console.error(`[handleWebSocketMessage] 处理WebSocket消息失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to handle WebSocket message: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 开始心跳
   */
  const startHeartbeat = (): void => {
    try {
      stopHeartbeat()
      
      heartbeatTimer = window.setInterval(() => {
        try {
          if (connection.ws && connection.status === 'connected') {
            connection.ws.send(JSON.stringify({ type: 'ping' }))
            console.log('💓 Heartbeat sent')
          }
        } catch (heartbeatError) {
          console.error(`[startHeartbeat] 心跳发送失败:`, heartbeatError)
        }
      }, 30000) // 30秒发送一次心跳
      
      console.log('💓 Heartbeat started')
    } catch (error) {
      console.error(`[startHeartbeat] 启动心跳失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to start heartbeat: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 停止心跳
   */
  const stopHeartbeat = (): void => {
    try {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer)
        heartbeatTimer = null
        console.log('💓 Heartbeat stopped')
      }
    } catch (error) {
      console.error(`[stopHeartbeat] 停止心跳失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to stop heartbeat: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 计划重连
   */
  const scheduleReconnect = (): void => {
    try {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      
      connection.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, connection.reconnectAttempts), 30000) // 指数退避，最多30秒
      
      console.log(`🔄 Scheduling reconnect attempt ${connection.reconnectAttempts} in ${delay}ms`)
      
      reconnectTimer = window.setTimeout(() => {
        try {
          if (wsUrl.value && connection.status === 'disconnected') {
            console.log(`🔄 Attempting reconnection ${connection.reconnectAttempts}`)
            connect(wsUrl.value).catch(reconnectError => {
              console.error(`[scheduleReconnect] 重连失败:`, reconnectError)
            })
          }
        } catch (reconnectTimerError) {
          console.error(`[scheduleReconnect] 重连定时器失败:`, reconnectTimerError)
        }
      }, delay)
    } catch (error) {
      console.error(`[scheduleReconnect] 计划重连失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to schedule reconnect: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 加入会话
   */
  const joinSession = (sessionId: string): void => {
    try {
      // 验证参数
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }

      const session = sessionMap.value.get(sessionId)
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`)
      }
      
      currentProgress.value = session
      
      console.log(`👥 Joined session: ${sessionId}`)
      
      ElMessage.success({
        message: `Joined session: ${sessionId}`,
        duration: 3000,
      })
    } catch (error) {
      console.error(`[joinSession] 加入会话失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to join session: ${errorMessage}`,
        duration: 4000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to join session: ${errorMessage}`)
    }
  }
  
  /**
   * 离开会话
   */
  const leaveSession = (sessionId: string): void => {
    try {
      // 验证参数
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }

      if (currentProgress.value?.sessionId === sessionId) {
        currentProgress.value = null
        
        console.log(`👋 Left session: ${sessionId}`)
        
        ElMessage.info({
          message: `Left session: ${sessionId}`,
          duration: 3000,
        })
      }
    } catch (error) {
      console.error(`[leaveSession] 离开会话失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to leave session: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 清理会话
   */
  const cleanupSession = (sessionId: string): void => {
    try {
      // 验证参数
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }

      // 如果当前显示的是这个会话，先离开
      if (currentProgress.value?.sessionId === sessionId) {
        leaveSession(sessionId)
      }
      
      // 从映射表中删除
      const deleted = sessionMap.value.delete(sessionId)
      
      if (deleted) {
        console.log(`🗑️ Cleaned up session: ${sessionId}`)
        
        ElMessage.info({
          message: `Session cleaned up: ${sessionId}`,
          duration: 3000,
        })
      }
    } catch (error) {
      console.error(`[cleanupSession] 清理会话失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to cleanup session: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 清理所有会话
   */
  const cleanupAllSessions = (): void => {
    try {
      const sessionCount = sessionMap.value.size
      
      // 离开当前会话
      if (currentProgress.value) {
        leaveSession(currentProgress.value.sessionId)
      }
      
      // 清空所有会话
      sessionMap.value.clear()
      
      console.log(`🗑️ Cleaned up all ${sessionCount} sessions`)
      
      ElMessage.info({
        message: `All ${sessionCount} sessions cleaned up`,
        duration: 3000,
      })
    } catch (error) {
      console.error(`[cleanupAllSessions] 清理所有会话失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to cleanup all sessions: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响主流程
    }
  }
  
  /**
   * 获取格式化的时间信息
   */
  const getFormattedDuration = (sessionId: string): string => {
    try {
      // 验证参数
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }

      const session = sessionMap.value.get(sessionId)
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`)
      }
      
      const startTime = session.startTime.getTime()
      const endTime = session.endTime ? session.endTime.getTime() : Date.now()
      const duration = endTime - startTime
      
      const seconds = Math.floor(duration / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`
      } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`
      } else {
        return `${seconds}s`
      }
    } catch (error) {
      console.error(`[getFormattedDuration] 获取格式化时间失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to get formatted duration: ${errorMessage}`,
        duration: 3000,
      })

      // 回退到简单的时间显示
      return '0s'
    }
  }
  
  /**
   * 组件卸载时清理资源
   */
  onUnmounted(() => {
    try {
      console.log('🧹 Cleaning up useCodeGenerationProgress')
      
      // 断开WebSocket连接
      disconnect()
      
      // 清理所有会话
      cleanupAllSessions()
    } catch (error) {
      console.error(`[onUnmounted] 清理资源失败:`, error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      ElMessage.error({
        message: `Failed to cleanup resources: ${errorMessage}`,
        duration: 3000,
      })

      // 不抛出错误，避免影响卸载流程
    }
  })
  
  return {
    // 状态
    currentProgress,
    connection,
    sessionMap,
    isGenerating,
    isCompleted,
    hasError,
    progressPercentage,
    
    // 方法
    createSession,
    updateProgress,
    markFileCompleted,
    markError,
    addWarning,
    getSessionProgress,
    getAllSessions,
    connect,
    disconnect,
    joinSession,
    leaveSession,
    cleanupSession,
    cleanupAllSessions,
    getFormattedDuration,
  }
}
