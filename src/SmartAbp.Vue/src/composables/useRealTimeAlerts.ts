/**
 * Real-time Security Alerts Composable
 * Stage 5.3 TDD Implementation - Vue 3 Composition API
 */

import { ref, reactive, computed, onUnmounted, readonly } from "vue"
import {
  type SecurityAlert,
  type AlertNotification,
  SecurityAlertType,
  AlertSeverity,
} from "@smartabp/lowcode-designer/types/security"

interface UseRealTimeAlertsOptions {
  enableWebSocket?: boolean
  reconnectAttempts?: number
  reconnectDelay?: number
  enableMocking?: boolean
}

interface ConnectionStatus {
  connected: boolean
  connecting: boolean
  lastConnected: Date | null
  reconnectAttempts: number
  error: string | null
}

export function useRealTimeAlerts(options: UseRealTimeAlertsOptions = {}) {
  const {
    enableWebSocket = true,
    reconnectAttempts = 5,
    reconnectDelay = 3000,
    enableMocking = true,
  } = options

  // State
  const activeAlerts = ref<SecurityAlert[]>([])
  const notifications = ref<AlertNotification[]>([])
  const connectionStatus = reactive<ConnectionStatus>({
    connected: false,
    connecting: false,
    lastConnected: null,
    reconnectAttempts: 0,
    error: null,
  })

  // WebSocket connection
  let websocket: WebSocket | null = null
  let reconnectTimer: NodeJS.Timeout | null = null
  let mockAlertTimer: NodeJS.Timeout | null = null

  // Computed Properties
  const unreadCount = computed(
    () => activeAlerts.value.filter((alert: SecurityAlert) => !alert.isAcknowledged).length,
  )

  const criticalAlerts = computed(() =>
    activeAlerts.value.filter((alert: SecurityAlert) => alert.severity === "Critical"),
  )

  const highPriorityAlerts = computed(() =>
    activeAlerts.value.filter(
      (alert: SecurityAlert) => alert.severity === "High" || alert.severity === "Critical",
    ),
  )

  // Mock Data Generation
  const generateMockAlert = (): SecurityAlert => {
    const alertTypes: SecurityAlertType[] = [
      SecurityAlertType.VULNERABILITY,
      SecurityAlertType.LOGIN_ATTEMPT,
      SecurityAlertType.OFF_HOURS_ACCESS,
      SecurityAlertType.PERMISSION_ESCALATION,
      SecurityAlertType.MULTIPLE_FAILED_ATTEMPTS,
      SecurityAlertType.SENSITIVE_DATA_ACCESS,
      SecurityAlertType.SUSPICIOUS_ACTIVITY,
    ]

    const severities: AlertSeverity[] = [AlertSeverity.LOW, AlertSeverity.MEDIUM, AlertSeverity.HIGH, AlertSeverity.CRITICAL]
    const users = ["John Doe", "Jane Smith", "Alice Johnson", "Bob Wilson", "Carol Brown"]

    const type = alertTypes[Math.floor(Math.random() * alertTypes.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const user = users[Math.floor(Math.random() * users.length)]

    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message: getAlertDescription(type, user),
      description: getAlertDescription(type, user),
      timestamp: new Date().toISOString(),
      userInfo: {
        displayName: user,
        email: `${user.toLowerCase().replace(" ", ".")}@company.com`,
        department: "Engineering",
        roles: ["User"],
      },
      context: {
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        timeZone: "Asia/Shanghai",
      },
      isAcknowledged: false,
      recommendedActions: getRecommendedActions(type),
    }
  }

  const getAlertDescription = (type: SecurityAlertType, user: string): string => {
    const descriptions: Record<SecurityAlertType, string> = {
      [SecurityAlertType.VULNERABILITY]: `High-risk permission access by ${user}`,
      [SecurityAlertType.LOGIN_ATTEMPT]: `Unusual location access detected for ${user}`,
      [SecurityAlertType.OFF_HOURS_ACCESS]: `Off-hours system access by ${user}`,
      [SecurityAlertType.PERMISSION_ESCALATION]: `Permission escalation attempt by ${user}`,
      [SecurityAlertType.MULTIPLE_FAILED_ATTEMPTS]: `Multiple failed login attempts by ${user}`,
      [SecurityAlertType.SENSITIVE_DATA_ACCESS]: `Sensitive data access by ${user}`,
      [SecurityAlertType.SUSPICIOUS_ACTIVITY]: `Suspicious activity detected for ${user}`,
    }
    return descriptions[type]
  }

  const getRecommendedActions = (type: SecurityAlertType): string[] => {
    const actions: Record<SecurityAlertType, string[]> = {
      [SecurityAlertType.VULNERABILITY]: [
        "Review user permissions",
        "Verify business justification",
        "Monitor subsequent activities",
      ],
      [SecurityAlertType.LOGIN_ATTEMPT]: [
        "Verify user location",
        "Check VPN usage",
        "Consider additional authentication",
      ],
      [SecurityAlertType.OFF_HOURS_ACCESS]: [
        "Confirm legitimate business need",
        "Review access logs",
        "Update access policies if needed",
      ],
      [SecurityAlertType.PERMISSION_ESCALATION]: [
        "Immediately review permissions",
        "Lock account if suspicious",
        "Investigate privilege changes",
      ],
      [SecurityAlertType.MULTIPLE_FAILED_ATTEMPTS]: [
        "Check for brute force attacks",
        "Consider account lockout",
        "Review authentication logs",
      ],
      [SecurityAlertType.SENSITIVE_DATA_ACCESS]: [
        "Audit data access patterns",
        "Verify data usage justification",
        "Monitor data export activities",
      ],
      [SecurityAlertType.SUSPICIOUS_ACTIVITY]: [
        "Investigate activity patterns",
        "Review user behavior baseline",
        "Consider temporary restrictions",
      ],
    }
    return actions[type] || ["Review and investigate"]
  }

  // Alert Management Methods
  const addAlert = (alertData: Omit<SecurityAlert, "id" | "timestamp" | "isAcknowledged">): void => {
    const fullAlert: SecurityAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isAcknowledged: false,
    }

    activeAlerts.value.unshift(fullAlert)

    // Create notification for high-priority alerts
    if (fullAlert.severity === "High" || fullAlert.severity === "Critical") {
      createNotification({
        id: `notification_${fullAlert.id}`,
        message: `${fullAlert.severity} security alert: ${alertData.message}`,
        severity: fullAlert.severity,
        timestamp: new Date().toISOString(),
        isAcknowledged: false,
        type: fullAlert.severity === "Critical" ? "error" : "warning",
        duration: fullAlert.severity === "Critical" ? 0 : 10000,
        actions: [
          {
            text: "Acknowledge",
            handler: () => acknowledgeAlert(fullAlert.id),
          },
          {
            text: "Investigate",
            handler: () => investigateAlert(fullAlert.id),
          },
        ],
      })
    }
  }

  const acknowledgeAlert = async (alertId: string): Promise<void> => {
    try {
      const alertIndex = activeAlerts.value.findIndex((alert: SecurityAlert) => alert.id === alertId)
      if (alertIndex === -1) {
        throw new Error("Alert not found")
      }

      if (enableMocking) {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 300))

        activeAlerts.value[alertIndex] = {
          ...activeAlerts.value[alertIndex],
          isAcknowledged: true,
          acknowledgedBy: "Current User",
          acknowledgedAt: new Date().toISOString(),
        }
      } else {
        // TODO: Implement actual API call
        // await alertsApi.acknowledgeAlert(alertId)
        throw new Error("Production API not yet implemented")
      }

      // Remove related notification
      const notificationIndex = notifications.value.findIndex(
        (notification: AlertNotification) => notification.id === `notification_${alertId}`,
      )
      if (notificationIndex !== -1) {
        notifications.value.splice(notificationIndex, 1)
      }
    } catch (error) {
      console.error("Failed to acknowledge alert:", error)
      throw error
    }
  }

  const investigateAlert = async (alertId: string): Promise<void> => {
    try {
      if (enableMocking) {
        // Mock investigation start
        await new Promise((resolve) => setTimeout(resolve, 200))
        console.log(`Starting investigation for alert: ${alertId}`)
      } else {
        // TODO: Implement actual API call
        // await alertsApi.startInvestigation(alertId)
        throw new Error("Production API not yet implemented")
      }
    } catch (error) {
      console.error("Failed to start investigation:", error)
      throw error
    }
  }

  const createNotification = (notification: AlertNotification): void => {
    notifications.value.push(notification)

    // Auto-remove notification after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, notification.duration)
    }
  }

  const removeNotification = (notificationId: string): void => {
    try {
      const index = notifications.value.findIndex((n: AlertNotification) => n.id === notificationId)
      if (index !== -1) {
        notifications.value.splice(index, 1)
      }
    } catch (error) {
      console.error("Failed to remove notification:", error)
      throw error
    }
  }

  // WebSocket Connection Management
  const connectAlertStream = (): void => {
    if (!enableWebSocket) {
      if (enableMocking) {
        startMockAlertGeneration()
      }
      connectionStatus.connected = true
      connectionStatus.lastConnected = new Date()
      return
    }

    if (connectionStatus.connecting || connectionStatus.connected) {
      return
    }

    connectionStatus.connecting = true
    connectionStatus.error = null

    try {
      // TODO: Replace with actual WebSocket endpoint
      const wsUrl = "ws://localhost:44300/hubs/security-alerts"
      websocket = new WebSocket(wsUrl)

      websocket.onopen = () => {
        connectionStatus.connected = true
        connectionStatus.connecting = false
        connectionStatus.lastConnected = new Date()
        connectionStatus.reconnectAttempts = 0
        connectionStatus.error = null
        console.log("Security alerts WebSocket connected")
      }

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === "security_alert") {
            addAlert(data.alert)
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }

      websocket.onclose = () => {
        connectionStatus.connected = false
        connectionStatus.connecting = false

        if (connectionStatus.reconnectAttempts < reconnectAttempts) {
          scheduleReconnect()
        }
      }

      websocket.onerror = (error) => {
        connectionStatus.error = "WebSocket connection failed"
        connectionStatus.connecting = false
        console.error("WebSocket error:", error)
      }
    } catch (error) {
      connectionStatus.connecting = false
      connectionStatus.error = "Failed to create WebSocket connection"
      console.error("WebSocket creation error:", error)

      // Fallback to mock data in development
      if (enableMocking) {
        startMockAlertGeneration()
        connectionStatus.connected = true
        connectionStatus.lastConnected = new Date()
      }
    }
  }

  const disconnectAlertStream = (): void => {
    if (websocket) {
      websocket.close()
      websocket = null
    }

    if (mockAlertTimer) {
      clearInterval(mockAlertTimer)
      mockAlertTimer = null
    }

    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    connectionStatus.connected = false
    connectionStatus.connecting = false
  }

  const scheduleReconnect = (): void => {
    connectionStatus.reconnectAttempts++

    reconnectTimer = setTimeout(() => {
      console.log(`Reconnecting to security alerts (attempt ${connectionStatus.reconnectAttempts})`)
      connectAlertStream()
    }, reconnectDelay)
  }

  const startMockAlertGeneration = (): void => {
    if (mockAlertTimer) return

    // Generate initial mock alerts
    const initialAlerts = Array.from({ length: 3 }, () => generateMockAlert())
    activeAlerts.value = initialAlerts

    // Generate new alerts periodically
    mockAlertTimer = setInterval(() => {
      if (Math.random() < 0.3) {
        // 30% chance of new alert
        const newAlert = generateMockAlert()
        addAlert(newAlert)

        // Limit total alerts to prevent memory issues
        if (activeAlerts.value.length > 50) {
          activeAlerts.value = activeAlerts.value.slice(0, 30)
        }
      }
    }, 15000) // Every 15 seconds
  }

  // Filter and Search
  const filterAlerts = (
    severities: SecurityAlert["severity"][] = [],
    acknowledged?: boolean,
  ): SecurityAlert[] => {
    return activeAlerts.value.filter((alert: SecurityAlert) => {
      const severityMatch = severities.length === 0 || severities.includes(alert.severity)
      const acknowledgedMatch = acknowledged === undefined || alert.isAcknowledged === acknowledged
      return severityMatch && acknowledgedMatch
    })
  }

  // Cleanup on unmount
  onUnmounted(() => {
    disconnectAlertStream()
  })

  return {
    // State
    activeAlerts: readonly(activeAlerts),
    notifications: readonly(notifications),
    connectionStatus: readonly(connectionStatus),

    // Computed
    unreadCount,
    criticalAlerts,
    highPriorityAlerts,

    // Methods
    connectAlertStream,
    disconnectAlertStream,
    acknowledgeAlert,
    investigateAlert,
    addAlert,
    createNotification,
    removeNotification,
    filterAlerts,
  }
}

export type UseRealTimeAlerts = ReturnType<typeof useRealTimeAlerts>
