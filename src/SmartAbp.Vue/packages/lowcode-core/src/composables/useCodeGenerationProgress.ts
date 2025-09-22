/**
 * 代码生成进度管理组合式函数
 * 提供代码生成进度跟踪、会话管理和实时通信功能
 */

import { ref, reactive, computed, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

/**
 * 代码生成进度接口
 */
export interface CodeGenerationProgress {
  /** 会话ID */
  sessionId: string
  /** 总文件数 */
  totalFiles: number
  /** 已完成文件数 */
  completedFiles: number
  /** 当前文件名 */
  currentFile: string
  /** 当前状态 */
  status: 'idle' | 'generating' | 'completed' | 'error'
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 错误信息 */
  error?: string
  /** 警告信息 */
  warnings: string[]
  /** 进度百分比 */
  progress: number
  /** 估计剩余时间 */
  estimatedTimeRemaining?: number
}

/**
 * WebSocket连接接口
 */
export interface WebSocketConnection {
  /** WebSocket实例 */
  ws: WebSocket | null
  /** 连接状态 */
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  /** 连接URL */
  url: string
  /** 连接时间 */
  connectTime: number
  /** 最后消息时间 */
  lastMessageTime: number
  /** 重连次数 */
  reconnectAttempts: number
  /** 连接ID */
  connectionId: string
}

/**
 * 连接池配置
 */
interface ConnectionPoolConfig {
  maxConnections: number
  idleTimeout: number
  healthCheckInterval: number
}

/**
 * 错误信息接口
 */
interface ProgressError {
  code: string
  message: string
  details?: any
  timestamp: number
  sessionId?: string
}

/**
 * 性能指标接口
 */
interface PerformanceMetrics {
  totalSessions: number
  activeSessions: number
  completedSessions: number
  failedSessions: number
  averageSessionDuration: number
  websocketConnections: number
  messageCount: number
  errorCount: number
}

/**
 * 配置选项接口
 */
interface ProgressConfig {
  enableConnectionPooling?: boolean
  enableAutoRetry?: boolean
  maxRetries?: number
  retryDelay?: number
  enableMemoryProtection?: boolean
  maxErrorLogSize?: number
  enablePerformanceMonitoring?: boolean
  heartbeatInterval?: number
  connectionTimeout?: number
}

/**
 * 代码生成进度管理组合式函数
 */
export function useCodeGenerationProgress(config: ProgressConfig = {}) {
  // 配置选项
  const options = {
    enableConnectionPooling: config.enableConnectionPooling ?? true,
    enableAutoRetry: config.enableAutoRetry ?? true,
    maxRetries: config.maxRetries ?? 3,
    retryDelay: config.retryDelay ?? 1000,
    enableMemoryProtection: config.enableMemoryProtection ?? true,
    maxErrorLogSize: config.maxErrorLogSize ?? 100,
    enablePerformanceMonitoring: config.enablePerformanceMonitoring ?? false,
    heartbeatInterval: config.heartbeatInterval ?? 30000, // 30秒
    connectionTimeout: config.connectionTimeout ?? 5000 // 5秒
  }

  // 进度会话映射表
  const progressSessions = ref<Map<string, CodeGenerationProgress>>(new Map())
  
  // WebSocket连接池
  const connectionPool = ref<Map<string, WebSocketConnection>>(new Map())
  
  // 错误日志
  const errorLog = ref<ProgressError[]>([])
  
  // 性能指标
  const performanceMetrics = reactive<PerformanceMetrics>({
    totalSessions: 0,
    activeSessions: 0,
    completedSessions: 0,
    failedSessions: 0,
    averageSessionDuration: 0,
    websocketConnections: 0,
    messageCount: 0,
    errorCount: 0
  })
  
  // 当前活跃的会话
  const currentSession = ref<string | null>(null)
  
  // 心跳定时器
  let heartbeatTimer: number | null = null
  
  // 健康检查定时器
  let healthCheckTimer: number | null = null
  
  // 重连定时器映射
  const reconnectTimers = ref<Map<string, number>>(new Map())

  // 当前会话的进度
  const currentProgress = computed(() => {
    if (!currentSession.value) return null
    return progressSessions.value.get(currentSession.value) || null
  })

  // 是否正在生成
  const isGenerating = computed(() => {
    return currentProgress.value?.status === 'generating' ?? false
  })

  // 生成进度百分比
  const generationProgress = computed(() => {
    return currentProgress.value?.progress ?? 0
  })

  // 当前状态
  const currentStatus = computed(() => {
    return currentProgress.value?.status ?? 'idle'
  })

  /**
   * 生成会话ID
   */
  const generateSessionId = (): string => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 9)
    return `session_${timestamp}_${random}`
  }

  /**
   * 生成连接ID
   */
  const generateConnectionId = (): string => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 9)
    return `conn_${timestamp}_${random}`
  }

  /**
   * 记录错误信息
   */
  const logError = (code: string, message: string, details?: any, sessionId?: string): void => {
    const error: ProgressError = {
      code,
      message,
      details,
      timestamp: Date.now(),
      sessionId
    }
    
    errorLog.value.push(error)
    
    // 性能监控
    if (options.enablePerformanceMonitoring) {
      performanceMetrics.errorCount++
    }
    
    // 限制错误日志数量，防止内存泄漏
    if (options.enableMemoryProtection && errorLog.value.length > options.maxErrorLogSize) {
      errorLog.value = errorLog.value.slice(-Math.floor(options.maxErrorLogSize / 2))
    }
    
    console.error(`[useCodeGenerationProgress] ${code}: ${message}`, { details, sessionId })
  }

  /**
   * 创建进度会话
   */
  const createSession = (totalFiles: number, sessionId?: string): string => {
    try {
      // 参数验证
      if (typeof totalFiles !== 'number' || totalFiles <= 0) {
        throw new Error('Total files must be a positive number')
      }
      
      const id = sessionId || generateSessionId()
      
      // 检查是否已存在
      if (progressSessions.value.has(id)) {
        throw new Error(`Session with ID '${id}' already exists`)
      }
      
      const now = Date.now()
      const progress: CodeGenerationProgress = {
        sessionId: id,
        totalFiles,
        completedFiles: 0,
        currentFile: '',
        status: 'idle',
        startTime: now,
        warnings: [],
        progress: 0,
      }
      
      progressSessions.value.set(id, progress)
      currentSession.value = id
      
      // 性能监控
      if (options.enablePerformanceMonitoring) {
        performanceMetrics.totalSessions++
        performanceMetrics.activeSessions++
      }
      
      console.log(`📝 Created progress session: ${id} (${totalFiles} files)`)
      
      ElMessage.success({
        message: `Created progress session: ${id}`,
        duration: 2000,
      })
      
      return id
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('CREATE_SESSION_ERROR', 'Failed to create progress session', { 
        error: errorMessage,
        totalFiles,
        sessionId 
      })
      
      ElMessage.error({
        message: `Failed to create progress session: ${errorMessage}`,
        duration: 3000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to create progress session: ${errorMessage}`)
    }
  }

  /**
   * 更新进度
   */
  const updateProgress = (sessionId: string, currentFile: string, progress?: number): void => {
    try {
      // 参数验证
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }
      
      if (!currentFile?.trim()) {
        throw new Error('Current file is required')
      }
      
      const session = progressSessions.value.get(sessionId)
      if (!session) {
        throw new Error(`Session with ID '${sessionId}' not found`)
      }
      
      // 更新进度信息
      session.currentFile = currentFile
      session.completedFiles++
      session.status = 'generating'
      
      // 计算进度百分比
      if (progress !== undefined && progress >= 0 && progress <= 100) {
        session.progress = progress
      } else {
        session.progress = Math.round((session.completedFiles / session.totalFiles) * 100)
      }
      
      // 计算估计剩余时间
      const elapsedTime = Date.now() - session.startTime
      const timePerFile = elapsedTime / session.completedFiles
      const remainingFiles = session.totalFiles - session.completedFiles
      session.estimatedTimeRemaining = Math.round(timePerFile * remainingFiles / 1000) // 秒
      
      // 性能监控
      if (options.enablePerformanceMonitoring) {
        performanceMetrics.messageCount++
      }
      
      console.log(`📈 Updated progress for session ${sessionId}: ${session.progress}% (${session.completedFiles}/${session.totalFiles})`)
      
      // 显示进度消息
      if (session.completedFiles % Math.max(1, Math.floor(session.totalFiles / 10)) === 0) {
        ElMessage.info({
          message: `Progress: ${session.progress}% (${session.completedFiles}/${session.totalFiles})`,
          duration: 2000,
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('UPDATE_PROGRESS_ERROR', 'Failed to update progress', { 
        error: errorMessage,
        sessionId,
        currentFile,
        progress 
      })
      
      ElMessage.error({
        message: `Failed to update progress: ${errorMessage}`,
        duration: 3000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to update progress: ${errorMessage}`)
    }
  }

  /**
   * 标记文件生成完成
   */
  const markFileCompleted = (sessionId: string, fileName: string): void => {
    try {
      // 参数验证
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }
      
      if (!fileName?.trim()) {
        throw new Error('File name is required')
      }
      
      const session = progressSessions.value.get(sessionId)
      if (!session) {
        throw new Error(`Session with ID '${sessionId}' not found`)
      }
      
      // 更新当前文件
      session.currentFile = fileName
      session.completedFiles++
      
      // 计算进度百分比
      session.progress = Math.round((session.completedFiles / session.totalFiles) * 100)
      
      console.log(`✅ Marked file completed for session ${sessionId}: ${fileName} (${session.completedFiles}/${session.totalFiles})`)
      
      // 显示完成消息
      if (session.completedFiles === session.totalFiles) {
        markSessionCompleted(sessionId)
      } else {
        // 定期显示进度
        if (session.completedFiles % Math.max(1, Math.floor(session.totalFiles / 5)) === 0) {
          ElMessage.success({
            message: `Completed: ${fileName} (${session.progress}%)`,
            duration: 2000,
          })
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('MARK_FILE_COMPLETED_ERROR', 'Failed to mark file completed', { 
        error: errorMessage,
        sessionId,
        fileName 
      })
      
      ElMessage.error({
        message: `Failed to mark file completed: ${errorMessage}`,
        duration: 3000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to mark file completed: ${errorMessage}`)
    }
  }

  /**
   * 标记生成错误
   */
  const markError = (sessionId: string, error: string): void => {
    try {
      // 参数验证
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }
      
      if (!error?.trim()) {
        throw new Error('Error message is required')
      }
      
      const session = progressSessions.value.get(sessionId)
      if (!session) {
        throw new Error(`Session with ID '${sessionId}' not found`)
      }
      
      // 更新会话状态
      session.status = 'error'
      session.error = error
      session.endTime = Date.now()
      
      // 性能监控
      if (options.enablePerformanceMonitoring) {
        performanceMetrics.failedSessions++
        performanceMetrics.activeSessions--
      }
      
      console.error(`❌ Marked error for session ${sessionId}: ${error}`)
      
      ElMessage.error({
        message: `Generation error: ${error}`,
        duration: 5000,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('MARK_ERROR_ERROR', 'Failed to mark error', { 
        error: errorMessage,
        sessionId,
        errorMessage: error 
      })
      
      ElMessage.error({
        message: `Failed to mark error: ${errorMessage}`,
        duration: 3000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to mark error: ${errorMessage}`)
    }
  }

  /**
   * 添加警告
   */
  const addWarning = (sessionId: string, warning: string): void => {
    try {
      // 参数验证
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }
      
      if (!warning?.trim()) {
        throw new Error('Warning message is required')
      }
      
      const session = progressSessions.value.get(sessionId)
      if (!session) {
        throw new Error(`Session with ID '${sessionId}' not found`)
      }
      
      // 添加警告信息
      session.warnings.push(warning)
      
      // 限制警告数量，防止内存泄漏
      if (options.enableMemoryProtection && session.warnings.length > 50) {
        session.warnings = session.warnings.slice(-25)
      }
      
      console.warn(`⚠️ Added warning for session ${sessionId}: ${warning}`)
      
      // 显示警告消息
      ElMessage.warning({
        message: `Warning: ${warning}`,
        duration: 3000,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('ADD_WARNING_ERROR', 'Failed to add warning', { 
        error: errorMessage,
        sessionId,
        warning 
      })
      
      ElMessage.error({
        message: `Failed to add warning: ${errorMessage}`,
        duration: 3000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to add warning: ${errorMessage}`)
    }
  }

  /**
   * 获取会话进度
   */
  const getSessionProgress = (sessionId: string): CodeGenerationProgress | null => {
    try {
      // 参数验证
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }
      
      return progressSessions.value.get(sessionId) || null
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('GET_SESSION_PROGRESS_ERROR', 'Failed to get session progress', { 
        error: errorMessage,
        sessionId 
      })
      
      return null
    }
  }

  /**
   * 标记会话完成
   */
  const markSessionCompleted = (sessionId: string): void => {
    try {
      // 参数验证
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }
      
      const session = progressSessions.value.get(sessionId)
      if (!session) {
        throw new Error(`Session with ID '${sessionId}' not found`)
      }
      
      // 更新会话状态
      session.status = 'completed'
      session.endTime = Date.now()
      session.progress = 100
      
      // 性能监控
      if (options.enablePerformanceMonitoring) {
        performanceMetrics.completedSessions++
        performanceMetrics.activeSessions--
        
        // 计算平均会话时长
        const duration = session.endTime - session.startTime
        performanceMetrics.averageSessionDuration = 
          (performanceMetrics.averageSessionDuration * (performanceMetrics.completedSessions - 1) + duration) 
          / performanceMetrics.completedSessions
      }
      
      console.log(`✅ Marked session completed: ${sessionId}`)
      
      ElMessage.success({
        message: `Code generation completed: ${session.completedFiles}/${session.totalFiles} files`,
        duration: 5000,
      })
      
      // 清理完成的会话（可选）
      if (options.enableMemoryProtection) {
        setTimeout(() => {
          cleanupSession(sessionId)
        }, 60000) // 1分钟后清理
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('MARK_SESSION_COMPLETED_ERROR', 'Failed to mark session completed', { 
        error: errorMessage,
        sessionId 
      })
      
      ElMessage.error({
        message: `Failed to mark session completed: ${errorMessage}`,
        duration: 3000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to mark session completed: ${errorMessage}`)
    }
  }

  /**
   * WebSocket连接管理
   */
  const connect = (url: string, protocols?: string | string[]): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // 参数验证
        if (!url?.trim()) {
          throw new Error('WebSocket URL is required')
        }
        
        const connectionId = generateConnectionId()
        
        // 检查连接池限制
        if (options.enableConnectionPooling && connectionPool.value.size >= 5) {
          throw new Error('Maximum number of WebSocket connections reached')
        }
        
        // 创建连接配置
        const connection: WebSocketConnection = {
          ws: null,
          status: 'connecting',
          url,
          connectTime: Date.now(),
          lastMessageTime: Date.now(),
          reconnectAttempts: 0,
          connectionId
        }
        
        // 添加到连接池
        connectionPool.value.set(connectionId, connection)
        
        // 性能监控
        if (options.enablePerformanceMonitoring) {
          performanceMetrics.websocketConnections++
        }
        
        console.log(`🔗 Creating WebSocket connection: ${connectionId}`)
        
        // 创建WebSocket实例
        let ws: WebSocket
        try {
          ws = protocols ? new WebSocket(url, protocols) : new WebSocket(url)
        } catch (wsError) {
          throw new Error(`Failed to create WebSocket: ${wsError instanceof Error ? wsError.message : String(wsError)}`)
        }
        
        // 连接超时处理
        const connectionTimeout = setTimeout(() => {
          if (connection.status === 'connecting') {
            ws.close()
            connection.status = 'error'
            const error = new Error('WebSocket connection timeout')
            logError('CONNECTION_TIMEOUT_ERROR', error.message, { url, connectionId })
            reject(error)
          }
        }, options.connectionTimeout)
        
        // 连接成功
        ws.onopen = (event) => {
          clearTimeout(connectionTimeout)
          connection.ws = ws
          connection.status = 'connected'
          connection.connectTime = Date.now()
          connection.lastMessageTime = Date.now()
          
          console.log(`✅ WebSocket connected: ${connectionId}`)
          
          ElMessage.success({
            message: 'WebSocket connected',
            duration: 2000,
          })
          
          // 启动心跳
          startHeartbeat(connectionId)
          
          resolve(connectionId)
        }
        
        // 收到消息
        ws.onmessage = (event) => {
          connection.lastMessageTime = Date.now()
          
          // 性能监控
          if (options.enablePerformanceMonitoring) {
            performanceMetrics.messageCount++
          }
          
          handleWebSocketMessage(event, connectionId)
        }
        
        // 连接关闭
        ws.onclose = (event) => {
          clearTimeout(connectionTimeout)
          
          console.log(`🔌 WebSocket disconnected: ${connectionId} (code: ${event.code}, reason: ${event.reason})`)
          
          // 更新连接状态
          connection.status = 'disconnected'
          connection.ws = null
          
          // 停止心跳
          stopHeartbeat(connectionId)
          
          // 自动重连
          if (options.enableAutoRetry && connection.reconnectAttempts < options.maxRetries) {
            scheduleReconnect(connectionId, url, protocols)
          } else {
            // 清理连接
            cleanupConnection(connectionId)
            
            ElMessage.warning({
              message: 'WebSocket disconnected',
              duration: 3000,
            })
          }
        }
        
        // 连接错误
        ws.onerror = (error) => {
          clearTimeout(connectionTimeout)
          connection.status = 'error'
          
          const errorMessage = error instanceof ErrorEvent ? error.message : 'WebSocket error occurred'
          logError('WEBSOCKET_ERROR', errorMessage, { url, connectionId }, currentSession.value || undefined)
          
          ElMessage.error({
            message: `WebSocket error: ${errorMessage}`,
            duration: 3000,
          })
          
          reject(new Error(errorMessage))
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        logError('CONNECT_ERROR', 'Failed to create WebSocket connection', { 
          error: errorMessage,
          url 
        })
        
        ElMessage.error({
          message: `Failed to connect: ${errorMessage}`,
          duration: 3000,
        })
        
        reject(error)
      }
    })
  }

  /**
   * 断开WebSocket连接
   */
  const disconnect = (connectionId: string): void => {
    try {
      // 参数验证
      if (!connectionId?.trim()) {
        throw new Error('Connection ID is required')
      }
      
      const connection = connectionPool.value.get(connectionId)
      if (!connection) {
        throw new Error(`Connection with ID '${connectionId}' not found`)
      }
      
      // 停止重连
      const reconnectTimer = reconnectTimers.value.get(connectionId)
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimers.value.delete(connectionId)
      }
      
      // 关闭WebSocket
      if (connection.ws && connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.close(1000, 'Normal closure')
      }
      
      // 清理连接
      cleanupConnection(connectionId)
      
      console.log(`🔌 Disconnected WebSocket: ${connectionId}`)
      
      ElMessage.info({
        message: 'WebSocket disconnected',
        duration: 2000,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('DISCONNECT_ERROR', 'Failed to disconnect WebSocket', { 
        error: errorMessage,
        connectionId 
      })
      
      ElMessage.error({
        message: `Failed to disconnect: ${errorMessage}`,
        duration: 3000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to disconnect: ${errorMessage}`)
    }
  }

  /**
   * 处理WebSocket消息
   */
  const handleWebSocketMessage = (event: MessageEvent, connectionId: string): void => {
    try {
      // 参数验证
      if (!event?.data) {
        throw new Error('Invalid message event')
      }
      
      if (!connectionId?.trim()) {
        throw new Error('Connection ID is required')
      }
      
      const connection = connectionPool.value.get(connectionId)
      if (!connection) {
        throw new Error(`Connection with ID '${connectionId}' not found`)
      }
      
      let data: any
      try {
        data = JSON.parse(event.data)
      } catch (parseError) {
        throw new Error(`Failed to parse message data: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
      }
      
      // 验证消息格式
      if (!data || typeof data !== 'object') {
        throw new Error('Message data must be a valid object')
      }
      
      console.log(`📨 Received WebSocket message:`, data)
      
      // 处理不同类型的消息
      switch (data.type) {
        case 'progress':
          handleProgressMessage(data, connectionId)
          break
        case 'file_completed':
          handleFileCompletedMessage(data, connectionId)
          break
        case 'error':
          handleErrorMessage(data, connectionId)
          break
        case 'warning':
          handleWarningMessage(data, connectionId)
          break
        case 'completed':
          handleCompletedMessage(data, connectionId)
          break
        case 'heartbeat':
          // 心跳响应，更新最后消息时间
          connection.lastMessageTime = Date.now()
          break
        default:
          console.warn(`Unknown message type: ${data.type}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('HANDLE_MESSAGE_ERROR', 'Failed to handle WebSocket message', { 
        error: errorMessage,
        connectionId,
        data: event.data 
      })
      
      // 不抛出错误，避免影响消息处理流程
    }
  }

  /**
   * 处理进度消息
   */
  const handleProgressMessage = (data: any, connectionId: string): void => {
    try {
      if (!data.sessionId || !data.currentFile) {
        throw new Error('Progress message must contain sessionId and currentFile')
      }
      
      updateProgress(data.sessionId, data.currentFile, data.progress)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('HANDLE_PROGRESS_MESSAGE_ERROR', 'Failed to handle progress message', { 
        error: errorMessage,
        connectionId,
        data 
      })
    }
  }

  /**
   * 处理文件完成消息
   */
  const handleFileCompletedMessage = (data: any, connectionId: string): void => {
    try {
      if (!data.sessionId || !data.fileName) {
        throw new Error('File completed message must contain sessionId and fileName')
      }
      
      markFileCompleted(data.sessionId, data.fileName)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('HANDLE_FILE_COMPLETED_MESSAGE_ERROR', 'Failed to handle file completed message', { 
        error: errorMessage,
        connectionId,
        data 
      })
    }
  }

  /**
   * 处理错误消息
   */
  const handleErrorMessage = (data: any, connectionId: string): void => {
    try {
      if (!data.sessionId || !data.error) {
        throw new Error('Error message must contain sessionId and error')
      }
      
      markError(data.sessionId, data.error)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('HANDLE_ERROR_MESSAGE_ERROR', 'Failed to handle error message', { 
        error: errorMessage,
        connectionId,
        data 
      })
    }
  }

  /**
   * 处理警告消息
   */
  const handleWarningMessage = (data: any, connectionId: string): void => {
    try {
      if (!data.sessionId || !data.warning) {
        throw new Error('Warning message must contain sessionId and warning')
      }
      
      addWarning(data.sessionId, data.warning)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('HANDLE_WARNING_MESSAGE_ERROR', 'Failed to handle warning message', { 
        error: errorMessage,
        connectionId,
        data 
      })
    }
  }

  /**
   * 处理完成消息
   */
  const handleCompletedMessage = (data: any, connectionId: string): void => {
    try {
      if (!data.sessionId) {
        throw new Error('Completed message must contain sessionId')
      }
      
      markSessionCompleted(data.sessionId)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('HANDLE_COMPLETED_MESSAGE_ERROR', 'Failed to handle completed message', { 
        error: errorMessage,
        connectionId,
        data 
      })
    }
  }

  /**
   * 启动心跳
   */
  const startHeartbeat = (connectionId: string): void => {
    try {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer)
      }
      
      heartbeatTimer = window.setInterval(() => {
        const connection = connectionPool.value.get(connectionId)
        if (connection && connection.ws && connection.ws.readyState === WebSocket.OPEN) {
          try {
            connection.ws.send(JSON.stringify({ type: 'heartbeat' }))
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            logError('HEARTBEAT_ERROR', 'Failed to send heartbeat', { 
              error: errorMessage,
              connectionId 
            })
          }
        }
      }, options.heartbeatInterval)
      
      console.log(`💓 Started heartbeat for connection: ${connectionId}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('START_HEARTBEAT_ERROR', 'Failed to start heartbeat', { 
        error: errorMessage,
        connectionId 
      })
    }
  }

  /**
   * 停止心跳
   */
  const stopHeartbeat = (connectionId: string): void => {
    try {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer)
        heartbeatTimer = null
        console.log(`💓 Stopped heartbeat for connection: ${connectionId}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('STOP_HEARTBEAT_ERROR', 'Failed to stop heartbeat', { 
        error: errorMessage,
        connectionId 
      })
    }
  }

  /**
   * 计划重连
   */
  const scheduleReconnect = (connectionId: string, url: string, protocols?: string | string[]): void => {
    try {
      // 参数验证
      if (!connectionId?.trim()) {
        throw new Error('Connection ID is required')
      }
      
      if (!url?.trim()) {
        throw new Error('URL is required')
      }
      
      const connection = connectionPool.value.get(connectionId)
      if (!connection) {
        throw new Error(`Connection with ID '${connectionId}' not found`)
      }
      
      // 增加重连次数
      connection.reconnectAttempts++
      
      // 计算重连延迟（指数退避）
      const delay = Math.min(options.retryDelay * Math.pow(2, connection.reconnectAttempts - 1), 30000) // 最大30秒
      
      console.log(`🔄 Scheduling reconnect for connection ${connectionId} (attempt ${connection.reconnectAttempts}, delay: ${delay}ms)`)
      
      // 清除之前的重连定时器
      const existingTimer = reconnectTimers.value.get(connectionId)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }
      
      // 设置新的重连定时器
      const timer = window.setTimeout(() => {
        reconnectTimers.value.delete(connectionId)
        
        console.log(`🔄 Attempting reconnect for connection ${connectionId}`)
        
        connect(url, protocols).then(newConnectionId => {
          console.log(`✅ Reconnected successfully: ${newConnectionId}`)
          
          // 清理旧连接
          cleanupConnection(connectionId)
        }).catch(reconnectError => {
          const errorMessage = reconnectError instanceof Error ? reconnectError.message : String(reconnectError)
          logError('RECONNECT_ERROR', 'Failed to reconnect', { 
            error: errorMessage,
            connectionId,
            attempt: connection.reconnectAttempts 
          })
          
          // 如果还有重试次数，继续重连
          if (connection.reconnectAttempts < options.maxRetries) {
            scheduleReconnect(connectionId, url, protocols)
          } else {
            console.log(`❌ Max reconnection attempts reached for connection ${connectionId}`)
            
            ElMessage.error({
              message: 'Max reconnection attempts reached',
              duration: 3000,
            })
          }
        })
      }, delay)
      
      reconnectTimers.value.set(connectionId, timer)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('SCHEDULE_RECONNECT_ERROR', 'Failed to schedule reconnect', { 
        error: errorMessage,
        connectionId,
        url 
      })
    }
  }

  /**
   * 清理连接
   */
  const cleanupConnection = (connectionId: string): void => {
    try {
      // 参数验证
      if (!connectionId?.trim()) {
        throw new Error('Connection ID is required')
      }
      
      // 停止重连
      const reconnectTimer = reconnectTimers.value.get(connectionId)
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimers.value.delete(connectionId)
      }
      
      // 停止心跳
      if (heartbeatTimer && Array.from(connectionPool.value.keys()).length === 1) {
        clearInterval(heartbeatTimer)
        heartbeatTimer = null
      }
      
      // 从连接池中移除
      const connection = connectionPool.value.get(connectionId)
      if (connection) {
        connectionPool.value.delete(connectionId)
        
        // 性能监控
        if (options.enablePerformanceMonitoring) {
          performanceMetrics.websocketConnections--
        }
        
        console.log(`🧹 Cleaned up connection: ${connectionId}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('CLEANUP_CONNECTION_ERROR', 'Failed to cleanup connection', { 
        error: errorMessage,
        connectionId 
      })
    }
  }

  /**
   * 加入会话
   */
  const joinSession = (sessionId: string, connectionId: string): void => {
    try {
      // 参数验证
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }
      
      if (!connectionId?.trim()) {
        throw new Error('Connection ID is required')
      }
      
      const connection = connectionPool.value.get(connectionId)
      if (!connection || !connection.ws || connection.ws.readyState !== WebSocket.OPEN) {
        throw new Error(`Connection with ID '${connectionId}' is not available`)
      }
      
      // 发送加入会话消息
      const message = JSON.stringify({
        type: 'join_session',
        sessionId
      })
      
      connection.ws.send(message)
      
      console.log(`👋 Joined session ${sessionId} with connection ${connectionId}`)
      
      ElMessage.info({
        message: `Joined session: ${sessionId}`,
        duration: 2000,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('JOIN_SESSION_ERROR', 'Failed to join session', { 
        error: errorMessage,
        sessionId,
        connectionId 
      })
      
      ElMessage.error({
        message: `Failed to join session: ${errorMessage}`,
        duration: 3000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to join session: ${errorMessage}`)
    }
  }

  /**
   * 离开会话
   */
  const leaveSession = (sessionId: string, connectionId: string): void => {
    try {
      // 参数验证
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }
      
      if (!connectionId?.trim()) {
        throw new Error('Connection ID is required')
      }
      
      const connection = connectionPool.value.get(connectionId)
      if (!connection || !connection.ws || connection.ws.readyState !== WebSocket.OPEN) {
        throw new Error(`Connection with ID '${connectionId}' is not available`)
      }
      
      // 发送离开会话消息
      const message = JSON.stringify({
        type: 'leave_session',
        sessionId
      })
      
      connection.ws.send(message)
      
      console.log(`👋 Left session ${sessionId} with connection ${connectionId}`)
      
      ElMessage.info({
        message: `Left session: ${sessionId}`,
        duration: 2000,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('LEAVE_SESSION_ERROR', 'Failed to leave session', { 
        error: errorMessage,
        sessionId,
        connectionId 
      })
      
      ElMessage.error({
        message: `Failed to leave session: ${errorMessage}`,
        duration: 3000,
      })

      // 抛出转换后的错误，让调用方处理
      throw new Error(`Failed to leave session: ${errorMessage}`)
    }
  }

  /**
   * 清理会话
   */
  const cleanupSession = (sessionId: string): void => {
    try {
      // 参数验证
      if (!sessionId?.trim()) {
        throw new Error('Session ID is required')
      }
      
      const session = progressSessions.value.get(sessionId)
      if (!session) {
        console.warn(`Session with ID '${sessionId}' not found for cleanup`)
        return
      }
      
      // 从映射表中移除
      progressSessions.value.delete(sessionId)
      
      // 如果这是当前会话，清空当前会话
      if (currentSession.value === sessionId) {
        currentSession.value = null
      }
      
      console.log(`🧹 Cleaned up session: ${sessionId}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('CLEANUP_SESSION_ERROR', 'Failed to cleanup session', { 
        error: errorMessage,
        sessionId 
      })
    }
  }

  /**
   * 清理所有会话
   */
  const cleanupAllSessions = (): void => {
    try {
      console.log('🧹 Cleaning up all sessions...')
      
      // 清空所有会话
      progressSessions.value.clear()
      currentSession.value = null
      
      // 重置性能指标
      if (options.enablePerformanceMonitoring) {
        Object.assign(performanceMetrics, {
          totalSessions: 0,
          activeSessions: 0,
          completedSessions: 0,
          failedSessions: 0,
          averageSessionDuration: 0
        })
      }
      
      console.log('✅ All sessions cleaned up')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('CLEANUP_ALL_SESSIONS_ERROR', 'Failed to cleanup all sessions', { error: errorMessage })
    }
  }

  /**
   * 获取格式化的持续时间
   */
  const getFormattedDuration = (sessionId: string): string => {
    try {
      // 参数验证
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
   * 获取错误日志
   */
  const getErrorLog = (): ProgressError[] => {
    return [...errorLog.value]
  }

  /**
   * 获取性能指标
   */
  const getPerformanceMetrics = (): PerformanceMetrics => {
    return { ...performanceMetrics }
  }

  /**
   * 获取所有会话
   */
  const getAllSessions = (): CodeGenerationProgress[] => {
    return Array.from(progressSessions.value.values())
  }

  /**
   * 获取活跃会话数
   */
  const getActiveSessionCount = (): number => {
    return Array.from(progressSessions.value.values()).filter(s => s.status === 'generating').length
  }

  /**
   * 获取连接状态
   */
  const getConnectionStatus = (connectionId: string): string => {
    try {
      // 参数验证
      if (!connectionId?.trim()) {
        throw new Error('Connection ID is required')
      }
      
      const connection = connectionPool.value.get(connectionId)
      return connection?.status || 'not_found'
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('GET_CONNECTION_STATUS_ERROR', 'Failed to get connection status', { 
        error: errorMessage,
        connectionId 
      })
      
      return 'error'
    }
  }

  /**
   * 清理所有资源
   */
  const cleanup = (): void => {
    try {
      console.log('🧹 Cleaning up code generation progress resources...')
      
      // 停止所有定时器
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer)
        heartbeatTimer = null
      }
      
      if (healthCheckTimer) {
        clearInterval(healthCheckTimer)
        healthCheckTimer = null
      }
      
      // 停止所有重连定时器
      for (const timer of reconnectTimers.value.values()) {
        clearTimeout(timer)
      }
      reconnectTimers.value.clear()
      
      // 断开所有WebSocket连接
      const connectionIds = Array.from(connectionPool.value.keys())
      for (const connectionId of connectionIds) {
        try {
          disconnect(connectionId)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          logError('CLEANUP_DISCONNECT_ERROR', 'Failed to disconnect during cleanup', { 
            error: errorMessage,
            connectionId 
          })
        }
      }
      
      // 清理所有会话
      cleanupAllSessions()
      
      // 清理错误日志
      errorLog.value = []
      
      // 重置性能指标
      if (options.enablePerformanceMonitoring) {
        Object.assign(performanceMetrics, {
          totalSessions: 0,
          activeSessions: 0,
          completedSessions: 0,
          failedSessions: 0,
          averageSessionDuration: 0,
          websocketConnections: 0,
          messageCount: 0,
          errorCount: 0
        })
      }
      
      console.log('✅ Code generation progress resources cleaned up')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logError('CLEANUP_ERROR', 'Failed to cleanup resources', { error: errorMessage })
      
      // 静默处理，确保资源清理
    }
  }

  // 组件卸载时清理资源
  onUnmounted(() => {
    cleanup()
  })

  // 返回公开的方法和状态
  return {
    // 状态
    progressSessions: readonly(progressSessions),
    connectionPool: readonly(connectionPool),
    currentSession,
    currentProgress,
    isGenerating,
    generationProgress,
    currentStatus,
    
    // 方法
    createSession,
    updateProgress,
    markFileCompleted,
    markError,
    addWarning,
    getSessionProgress,
    markSessionCompleted,
    connect,
    disconnect,
    joinSession,
    leaveSession,
    cleanupSession,
    cleanupAllSessions,
    getFormattedDuration,
    cleanup,
    
    // 调试和监控
    getErrorLog,
    getPerformanceMetrics,
    getAllSessions,
    getActiveSessionCount,
    getConnectionStatus,
  }
}
