/**
 * Security Dashboard Composable
 * Stage 5.3 TDD Implementation - Vue 3 Composition API
 */

import { ref, reactive, computed, readonly } from "vue"
import {
  type SecurityMetrics,
  type PermissionTrendData,
  type RiskDistributionData,
  type AbnormalBehavior,
  type ComplianceIssue,
  type DashboardConfig,
} from "@smartabp/lowcode-designer/types/security"

interface UseSecurityDashboardOptions {
  config?: Partial<DashboardConfig>
  enableMocking?: boolean
}

export function useSecurityDashboard(options: UseSecurityDashboardOptions = {}) {
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  // Security Metrics
  const securityMetrics = ref<SecurityMetrics>({
    overallScore: 95,
    openIssues: 0,
    todayRiskEvents: 0,
    permissionChanges: 0,
    abnormalLogins: 0,
    complianceScore: 0,
    riskEventsTrend: 0,
    permissionChangesTrend: 0,
    abnormalLoginsTrend: 0,
    complianceScoreTrend: 0,
  })

  // Chart Data
  const permissionTrendData = ref<PermissionTrendData[]>([])
  const riskDistributionData = ref<RiskDistributionData[]>([])

  // Behavior & Compliance Data
  const abnormalBehaviors = ref<AbnormalBehavior[]>([])
  const complianceData = ref<ComplianceIssue[]>([])

  // Configuration
  const config = reactive<DashboardConfig>({
    refreshInterval: 30000,
    autoRefresh: true,
    enableRealTimeAlerts: true,
    enableNotifications: true,
    theme: "light",
    layout: {
      columns: 2,
      showSidebar: true,
      compactMode: false,
      showMetrics: true,
      showAlerts: true,
      showCharts: true,
      showBehaviorAnalysis: true,
      showCompliance: true,
    },
    ...options.config,
  })

  // Computed Properties
  const isHealthy = computed(() => {
    if (!securityMetrics.value) return false
    const { complianceScore, todayRiskEvents } = securityMetrics.value
    return (complianceScore ?? 0) >= 90 && (todayRiskEvents ?? 0) < 10
  })

  const totalActiveIncidents = computed(() => {
    return (
      abnormalBehaviors.value.length +
      complianceData.value.filter((issue: ComplianceIssue) => issue.status === "Open").length
    )
  })

  const openIssuesCount = computed(
    () =>
      complianceData.value.filter((issue: ComplianceIssue) => issue.status === "Open").length,
  )

  // Mock Data Generation (for testing and development)
  const generateMockSecurityMetrics = (): SecurityMetrics => ({
    overallScore: Math.floor(Math.random() * 20) + 80,
    openIssues: Math.floor(Math.random() * 10) + 1,
    todayRiskEvents: Math.floor(Math.random() * 20) + 5,
    permissionChanges: Math.floor(Math.random() * 15) + 3,
    abnormalLogins: Math.floor(Math.random() * 8) + 1,
    complianceScore: Math.floor(Math.random() * 20) + 80,
    riskEventsTrend: Math.floor(Math.random() * 20) - 10,
    permissionChangesTrend: Math.floor(Math.random() * 10) - 5,
    abnormalLoginsTrend: Math.floor(Math.random() * 6) - 3,
    complianceScoreTrend: Math.floor(Math.random() * 10) - 5,
  })

  const generateMockTrendData = (): PermissionTrendData[] => {
    const data: PermissionTrendData[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      data.push({
        date: date.toISOString().split("T")[0],
        count: Math.floor(Math.random() * 50) + 100,
        permissions: Math.floor(Math.random() * 50) + 100,
        risks: Math.floor(Math.random() * 10) + 2,
        users: Math.floor(Math.random() * 20) + 50,
        failed: Math.floor(Math.random() * 5) + 1,
      })
    }

    return data
  }

  const generateMockRiskDistribution = (): RiskDistributionData[] => [
    { risk: "Low", level: "Low", count: 150, percentage: 60, color: "#67C23A" },
    { risk: "Medium", level: "Medium", count: 75, percentage: 30, color: "#E6A23C" },
    { risk: "High", level: "High", count: 20, percentage: 8, color: "#F56C6C" },
    { risk: "Critical", level: "Critical", count: 5, percentage: 2, color: "#909399" },
  ]

  const generateMockAbnormalBehaviors = (): AbnormalBehavior[] => [
    {
      id: "1",
      userId: "user1",
      userName: "John Doe",
      behaviorType: "UnusualHours",
      description: "Access outside business hours",
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      riskLevel: "Medium",
      details: { location: "Office Network", device: "Desktop" },
      actionRequired: true,
    },
    {
      id: "2",
      userId: "user2",
      userName: "Jane Smith",
      behaviorType: "HighFrequency",
      description: "Unusually high permission requests",
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      riskLevel: "High",
      details: { requestCount: 45, normalRange: "5-10" },
      actionRequired: true,
    },
  ]

  const generateMockComplianceData = (): ComplianceIssue[] => [
    {
      id: "1",
      type: "DataRetention",
      severity: "High",
      description: "Data retention policy violation detected",
      affectedUsers: 25,
      detectedAt: new Date(Date.now() - Math.random() * 86400000),
      status: "Open",
      recommendations: [
        "Review data retention policies",
        "Update user access permissions",
        "Schedule compliance audit",
      ],
    },
    {
      id: "2",
      type: "AccessControl",
      severity: "Medium",
      description: "Excessive administrative permissions",
      affectedUsers: 8,
      detectedAt: new Date(Date.now() - Math.random() * 86400000),
      status: "InProgress",
      recommendations: ["Review admin role assignments", "Implement principle of least privilege"],
    },
  ]

  // API Methods
  const loadDashboardData = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      if (options.enableMocking !== false) {
        // Use mock data for testing/development
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay

        securityMetrics.value = generateMockSecurityMetrics()
        permissionTrendData.value = generateMockTrendData()
        riskDistributionData.value = generateMockRiskDistribution()
        abnormalBehaviors.value = generateMockAbnormalBehaviors()
        complianceData.value = generateMockComplianceData()
      } else {
        // TODO: Replace with actual API calls
        // const [metrics, trends, risks, behaviors, compliance] = await Promise.all([
        //   securityApi.getMetrics(),
        //   securityApi.getTrendData(),
        //   securityApi.getRiskDistribution(),
        //   securityApi.getAbnormalBehaviors(),
        //   securityApi.getComplianceIssues()
        // ])

        throw new Error("Production API not yet implemented")
      }

      lastUpdated.value = new Date()
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load dashboard data"
      console.error("Dashboard data loading error:", err)
    } finally {
      loading.value = false
    }
  }

  const refreshMetrics = async (): Promise<void> => {
    if (loading.value) return
    await loadDashboardData()
  }

  const exportData = async (format: "pdf" | "excel" | "csv"): Promise<void> => {
    try {
      loading.value = true

      // TODO: Implement actual export functionality
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate export delay

      console.log(`Exporting dashboard data as ${format}`)

      // Mock successful export
      if (options.enableMocking !== false) {
        // Simulate file download
        const blob = new Blob(["Mock dashboard data"], { type: "text/plain" })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `security-dashboard-${new Date().toISOString().split("T")[0]}.${format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Export failed"
      console.error("Export error:", err)
    } finally {
      loading.value = false
    }
  }

  const updateConfig = (newConfig: Partial<DashboardConfig>): void => {
    Object.assign(config, newConfig)
  }

  const resetData = (): void => {
    securityMetrics.value = {
      overallScore: 95,
      openIssues: 0,
      todayRiskEvents: 0,
      permissionChanges: 0,
      abnormalLogins: 0,
      complianceScore: 0,
      riskEventsTrend: 0,
      permissionChangesTrend: 0,
      abnormalLoginsTrend: 0,
      complianceScoreTrend: 0,
    }
    permissionTrendData.value = []
    riskDistributionData.value = []
    abnormalBehaviors.value = []
    complianceData.value = []
    error.value = null
    lastUpdated.value = null
  }

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),

    // Data
    securityMetrics: readonly(securityMetrics),
    permissionTrendData: readonly(permissionTrendData),
    riskDistributionData: readonly(riskDistributionData),
    abnormalBehaviors: readonly(abnormalBehaviors),
    complianceData: readonly(complianceData),

    // Configuration
    config: readonly(config),

    // Computed
    isHealthy,
    totalActiveIncidents,
    openIssuesCount,

    // Methods
    loadDashboardData,
    refreshMetrics,
    exportData,
    updateConfig,
    resetData,
  }
}

export type UseSecurityDashboard = ReturnType<typeof useSecurityDashboard>
