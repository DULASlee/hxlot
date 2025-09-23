/**
 * Security related type definitions for lowcode designer
 */

export interface SecurityThreat {
  id: string
  type: "injection" | "xss" | "csrf" | "permission" | "data-leak"
  severity: "low" | "medium" | "high" | "critical"
  description: string
  source: string
  timestamp: number
  status: "detected" | "analyzing" | "resolved" | "false-positive"
  recommendation?: string
}

export interface SecurityVulnerability {
  id: string
  title: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  cveId?: string
  affectedVersions?: string[]
  fixedVersion?: string
  references?: string[]
}

export interface SecurityAlert {
  id: string
  title: string
  message: string
  description?: string
  type: "error" | "warning" | "info"
  severity: "low" | "medium" | "high" | "critical"
  timestamp: number
  acknowledged: boolean
  acknowledgedBy?: string
  source: string
  metadata?: Record<string, any>
}

export interface SecurityConfig {
  enableXssProtection: boolean
  enableCsrfProtection: boolean
  enableSqlInjectionDetection: boolean
  enablePermissionValidation: boolean
  maxUploadSize: number
  allowedFileTypes: string[]
  blockedIpAddresses: string[]
  rateLimit: {
    enabled: boolean
    maxRequests: number
    windowMs: number
  }
}

export interface PermissionRule {
  resource: string
  action: string
  conditions?: Record<string, any>
  effect: "allow" | "deny"
}

export interface SecurityAuditLog {
  id: string
  userId?: string
  action: string
  resource: string
  timestamp: number
  ipAddress: string
  userAgent: string
  success: boolean
  details?: Record<string, any>
}
