import { ref, computed } from 'vue'

export interface SecurityMetrics {
  totalThreats: number
  resolvedThreats: number
  activeIncidents: number
  securityScore: number
  // 组件期望的附加属性
  todayRiskEvents?: number
  riskEventsTrend?: number
  permissionChanges?: number
  permissionChangesTrend?: number
  abnormalLogins?: number
  abnormalLoginsTrend?: number
  complianceScore?: number
  complianceScoreTrend?: number
}

export interface PermissionTrendData {
  date: string
  permissions: number
  violations: number
  risks: number // 🔧 必需属性，确保类型安全
}

export interface RiskDistributionData {
  level: string
  count: number
  percentage: number
}

export interface AbnormalBehavior {
  id: string
  userId: string
  userName: string
  action: string
  riskLevel: 'low' | 'medium' | 'high'
  timestamp: Date
  behaviorType: string // 🔧 必需属性，确保类型安全
  description: string // 🔧 必需属性，确保类型安全
}

export interface ComplianceData {
  framework: string
  status: 'compliant' | 'non-compliant' | 'pending'
  score: number
  lastCheck: Date
}

export function useSecurityDashboard() {
  const securityMetrics = ref<SecurityMetrics>({
    totalThreats: 0,
    resolvedThreats: 0,
    activeIncidents: 0,
    securityScore: 100
  })

  const permissionTrendData = ref<PermissionTrendData[]>([])
  const riskDistributionData = ref<RiskDistributionData[]>([])
  const abnormalBehaviors = ref<AbnormalBehavior[]>([])
  const complianceData = ref<ComplianceData[]>([])

  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const securityStatus = computed(() => {
    if (securityMetrics.value.securityScore >= 90) return 'excellent'
    if (securityMetrics.value.securityScore >= 70) return 'good'
    if (securityMetrics.value.securityScore >= 50) return 'warning'
    return 'critical'
  })

  const loadDashboardData = async () => {
    isLoading.value = true
    error.value = null
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      securityMetrics.value = {
        totalThreats: 125,
        resolvedThreats: 98,
        activeIncidents: 3,
        securityScore: 87,
        todayRiskEvents: 12,
        riskEventsTrend: -2,
        permissionChanges: 45,
        permissionChangesTrend: 5,
        abnormalLogins: 8,
        abnormalLoginsTrend: -1,
        complianceScore: 92,
        complianceScoreTrend: 1
      }

      permissionTrendData.value = [
        { date: '2025-01-01', permissions: 1250, violations: 5, risks: 5 },
        { date: '2025-01-02', permissions: 1300, violations: 3, risks: 3 },
        { date: '2025-01-03', permissions: 1275, violations: 7, risks: 7 }
      ]

      riskDistributionData.value = [
        { level: 'Low', count: 85, percentage: 68 },
        { level: 'Medium', count: 30, percentage: 24 },
        { level: 'High', count: 10, percentage: 8 }
      ]

      abnormalBehaviors.value = [
        { id: '1', userId: 'user1', userName: 'Alice', action: 'Login from new IP', riskLevel: 'high', timestamp: new Date(), behaviorType: 'Login Anomaly', description: 'Login from an unusual geographic location.' },
        { id: '2', userId: 'user2', userName: 'Bob', action: 'Mass data export', riskLevel: 'high', timestamp: new Date(), behaviorType: 'Data Exfiltration', description: 'Attempted to export a large volume of sensitive data.' }
      ]

      complianceData.value = [
        { framework: 'GDPR', status: 'compliant', score: 95, lastCheck: new Date() },
        { framework: 'SOX', status: 'pending', score: 70, lastCheck: new Date() }
      ]

    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
    } finally {
      isLoading.value = false
    }
  }

  const refreshMetrics = async () => {
    await loadDashboardData()
  }

  return {
    securityMetrics,
    permissionTrendData,
    riskDistributionData,
    abnormalBehaviors,
    complianceData,
    isLoading,
    error,
    securityStatus,
    loadDashboardData,
    refreshMetrics
  }
}
