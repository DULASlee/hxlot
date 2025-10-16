import { onMounted, onUnmounted, ref } from 'vue'

export interface Alert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  read: boolean
  severity?: 'low' | 'medium' | 'high' | 'critical'
  description?: string
}

export function useRealTimeAlerts() {
  const alerts = ref<Alert[]>([])
  const unreadCount = ref(0)
  const isConnected = ref(false)

  let eventSource: EventSource | null = null

  const addAlert = (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }
    alerts.value.unshift(newAlert)
    unreadCount.value++
  }

  const markAsRead = (alertId: string | number) => {
    const alert = alerts.value.find(a => a.id === alertId)
    if (alert && !alert.read) {
      alert.read = true
      unreadCount.value--
    }
  }

  const markAllAsRead = () => {
    alerts.value.forEach(alert => {
      if (!alert.read) {
        alert.read = true
      }
    })
    unreadCount.value = 0
  }

  const clearAlerts = () => {
    alerts.value = []
    unreadCount.value = 0
  }

  const connect = () => {
    if (typeof EventSource !== 'undefined') {
      // In real implementation, this would connect to actual SSE endpoint
      isConnected.value = true
    }
  }

  const disconnect = () => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    isConnected.value = false
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  // 为组件提供所需的别名
  const activeAlerts = alerts
  const connectAlertStream = connect
  const disconnectAlertStream = disconnect
  const acknowledgeAlert = markAsRead
  const investigateAlert = (alertId: string | number) => {
    console.log(`Investigating alert: ${alertId}`)
    markAsRead(alertId)
  }

  return {
    alerts,
    unreadCount,
    isConnected,
    addAlert,
    markAsRead,
    markAllAsRead,
    clearAlerts,
    connect,
    disconnect,
    // 组件期望的别名
    activeAlerts,
    connectAlertStream,
    disconnectAlertStream,
    acknowledgeAlert,
    investigateAlert
  }
}
