// 🚨 SECURITY TYPES - CRITICAL: Use proper security interfaces for type safety
// Security Alert System
export interface RealTimeAlert {
  id: string
  message: string
  severity: "Critical" | "High" | "Medium" | "Low"
  timestamp: string
  isAcknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
}

export interface SecurityIssue {
  id: string
  description: string
  status: "Open" | "Closed"
}

// Enhanced Security Alert Types for Real-time System
export interface SecurityAlert extends RealTimeAlert {
  type?: string
  userId?: string
  location?: string
  details?: Record<string, any>
  description?: string
  userInfo?: {
    displayName: string
    email: string
    department: string
    roles: string[]
  }
  context?: {
    sessionId: string
    ipAddress: string
    userAgent: string
    timeZone: string
  }
  recommendedActions?: string[]
}

export interface AlertNotification extends RealTimeAlert {
  type?: "error" | "warning" | "info" | "success"
  duration?: number
  actions?: Array<{
    text: string
    handler: () => void
  }>
}

export enum SecurityAlertType {
  VULNERABILITY = "VULNERABILITY",
  LOGIN_ATTEMPT = "LOGIN_ATTEMPT",
  OFF_HOURS_ACCESS = "OffHoursAccess",
  PERMISSION_ESCALATION = "PermissionEscalation",
  MULTIPLE_FAILED_ATTEMPTS = "MultipleFailedAttempts",
  SENSITIVE_DATA_ACCESS = "SensitiveDataAccess",
  SUSPICIOUS_ACTIVITY = "SuspiciousActivity",
}

export enum AlertSeverity {
  CRITICAL = "Critical",
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}

// Enhanced Security Dashboard Types
export interface SecurityMetrics {
  overallScore: number
  openIssues: number
  complianceScore?: number
  todayRiskEvents?: number
  permissionChanges?: number
  abnormalLogins?: number
  riskEventsTrend?: number
  permissionChangesTrend?: number
  abnormalLoginsTrend?: number
  complianceScoreTrend?: number
}

export interface PermissionTrendData {
  date: string
  count: number
  permissions?: number
  risks?: number
  users?: number
  failed?: number
}

export interface RiskDistributionData {
  risk: string
  count: number
  level?: string
  percentage?: number
  color?: string
}

export interface AbnormalBehavior {
  id: string
  description: string
  userId?: string
  timestamp?: string
  severity?: string
  userName?: string
  behaviorType?: string
  riskLevel?: string
  details?: Record<string, any>
  actionRequired?: boolean
}

export interface ComplianceIssue {
  id: string
  description: string
  type?: string
  status?: "Open" | "Closed" | "InProgress"
  severity?: string
  affectedUsers?: number
  detectedAt?: Date
  recommendations?: string[]
}

export interface DashboardConfig {
  refreshInterval: number
  autoRefresh?: boolean
  theme?: string
  enableRealTimeAlerts?: boolean
  enableNotifications?: boolean
  layout?: {
    columns: number
    showSidebar: boolean
    compactMode: boolean
    showMetrics: boolean
    showAlerts: boolean
    showCharts: boolean
    showBehaviorAnalysis: boolean
    showCompliance: boolean
  }
}
