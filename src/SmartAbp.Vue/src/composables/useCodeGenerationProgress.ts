import { ref, reactive, onUnmounted } from "vue"
import * as signalR from "@microsoft/signalr"
import { ElMessage } from "element-plus"

export interface ProgressUpdate {
  sessionId: string
  generationType: string
  status: string
  progressPercentage: number
  currentStep: string
  timestamp: string
  message?: string
  filesGenerated: number
  totalFiles: number
  elapsedTime: {
    totalMilliseconds: number
  }
  errorMessage?: string
}

export interface GenerationCompletion {
  sessionId: string
  isSuccess: boolean
  generationType: string
  filesGenerated: number
  linesOfCode: number
  totalTime: {
    totalMilliseconds: number
  }
  completedAt: string
  errorMessage?: string
  result?: any
}

export interface ProgressState {
  isConnected: boolean
  isConnecting: boolean
  currentSessions: Map<string, ProgressUpdate>
  completedSessions: Map<string, GenerationCompletion>
}

/**
 * Vue composable for real-time code generation progress tracking
 */
export function useCodeGenerationProgress() {
  const connection = ref<signalR.HubConnection | null>(null)

  const state = reactive<ProgressState>({
    isConnected: false,
    isConnecting: false,
    currentSessions: new Map(),
    completedSessions: new Map(),
  })

  /**
   * Initialize SignalR connection
   */
  const connect = async () => {
    if (state.isConnecting || state.isConnected) {
      return
    }

    state.isConnecting = true

    try {
      // Create SignalR connection
      connection.value = new signalR.HubConnectionBuilder()
        .withUrl("/hubs/code-generation-progress", {
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount === 0) return 0
            if (retryContext.previousRetryCount === 1) return 2000
            if (retryContext.previousRetryCount === 2) return 10000
            return 30000
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build()

      // Set up event handlers
      setupEventHandlers()

      // Start connection
      await connection.value.start()

      state.isConnected = true
      state.isConnecting = false

      console.log("✅ Connected to CodeGenerationProgressHub")
    } catch (error) {
      console.error("❌ Failed to connect to CodeGenerationProgressHub:", error)
      state.isConnecting = false

      ElMessage.error({
        message: "Failed to connect to real-time progress tracking",
        duration: 5000,
      })
    }
  }

  /**
   * Setup SignalR event handlers
   */
  const setupEventHandlers = () => {
    if (!connection.value) return

    // Handle progress updates
    connection.value.on("ProgressUpdate", (progress: ProgressUpdate) => {
      console.log("📊 Progress Update:", progress)

      state.currentSessions.set(progress.sessionId, progress)

      // Show notification for important milestones
      if (progress.progressPercentage === 0) {
        ElMessage.info({
          message: `Started ${progress.generationType} generation`,
          duration: 2000,
        })
      }
    })

    // Handle generation completion
    connection.value.on("GenerationCompleted", (completion: GenerationCompletion) => {
      console.log("✅ Generation Completed:", completion)

      // Move from current to completed
      state.currentSessions.delete(completion.sessionId)
      state.completedSessions.set(completion.sessionId, completion)

      // Show completion notification
      if (completion.isSuccess) {
        ElMessage.success({
          message: `${completion.generationType} generation completed successfully!`,
          duration: 4000,
        })
      } else {
        ElMessage.error({
          message: `${completion.generationType} generation failed: ${completion.errorMessage}`,
          duration: 6000,
        })
      }
    })

    // Handle connection events
    connection.value.onreconnecting(() => {
      console.log("🔄 Reconnecting to CodeGenerationProgressHub...")
      state.isConnected = false
    })

    connection.value.onreconnected(() => {
      console.log("✅ Reconnected to CodeGenerationProgressHub")
      state.isConnected = true
    })

    connection.value.onclose(() => {
      console.log("❌ Disconnected from CodeGenerationProgressHub")
      state.isConnected = false
    })
  }

  /**
   * Join a generation session to receive updates
   */
  const joinSession = async (sessionId: string) => {
    if (!connection.value || !state.isConnected) {
      await connect()
    }

    try {
      await connection.value?.invoke("JoinGenerationSession", sessionId)
      console.log(`📡 Joined generation session: ${sessionId}`)
    } catch (error) {
      console.error("Failed to join generation session:", error)
    }
  }

  /**
   * Leave a generation session
   */
  const leaveSession = async (sessionId: string) => {
    try {
      await connection.value?.invoke("LeaveGenerationSession", sessionId)
      console.log(`📡 Left generation session: ${sessionId}`)

      // Clean up local state
      state.currentSessions.delete(sessionId)
    } catch (error) {
      console.error("Failed to leave generation session:", error)
    }
  }

  /**
   * Get progress for a specific session
   */
  const getSessionProgress = (sessionId: string): ProgressUpdate | null => {
    return state.currentSessions.get(sessionId) || null
  }

  /**
   * Get completion info for a specific session
   */
  const getSessionCompletion = (sessionId: string): GenerationCompletion | null => {
    return state.completedSessions.get(sessionId) || null
  }

  /**
   * Format elapsed time for display
   */
  const formatElapsedTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  /**
   * Get all active sessions
   */
  const getActiveSessions = () => {
    return Array.from(state.currentSessions.values())
  }

  /**
   * Get all completed sessions
   */
  const getCompletedSessions = () => {
    return Array.from(state.completedSessions.values())
  }

  /**
   * Clear completed sessions
   */
  const clearCompletedSessions = () => {
    state.completedSessions.clear()
  }

  /**
   * Disconnect from SignalR hub
   */
  const disconnect = async () => {
    try {
      await connection.value?.stop()
      connection.value = null
      state.isConnected = false
      state.isConnecting = false
      console.log("📡 Disconnected from CodeGenerationProgressHub")
    } catch (error) {
      console.error("Error disconnecting from hub:", error)
    }
  }

  // Auto-connect on composable initialization
  connect()

  // Cleanup on component unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    // State
    isConnected: () => state.isConnected,
    isConnecting: () => state.isConnecting,

    // Methods
    connect,
    disconnect,
    joinSession,
    leaveSession,
    getSessionProgress,
    getSessionCompletion,
    getActiveSessions,
    getCompletedSessions,
    clearCompletedSessions,

    // Utilities
    formatElapsedTime,
  }
}
