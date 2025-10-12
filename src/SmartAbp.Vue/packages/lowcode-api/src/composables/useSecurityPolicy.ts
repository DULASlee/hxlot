import { createSimpleApiComposable } from '@smartabp/lowcode-shared'
import { http as httpClient } from '../http-client.js'

/**
 * 安全策略DTO
 */
export interface SecurityPolicy {
  networkPolicy: NetworkPolicy
  authentication: Authentication
  authorization: Authorization
  secrets: SecretsManagement
  apiSecurity: ApiSecurity
}

export interface NetworkPolicy {
  policyType: string
  ingressRules: NetworkRule[]
  egressRules: NetworkRule[]
  enablePodSelector: boolean
  podSelector: Record<string, string>
}

export interface NetworkRule {
  name: string
  ports: string[]
  protocol: string
  fromCIDR: string[]
  toCIDR: string[]
  fromPodSelector: Record<string, string>
  toPodSelector: Record<string, string>
}

export interface Authentication {
  type: string
  issuer: string
  audience: string
  authority: string
  tokenExpirationMinutes: number
  requireHttpsMetadata: boolean
  validIssuers: string[]
  validAudiences: string[]
}

export interface Authorization {
  type: string
  roles: Role[]
  roleBindings: RoleBinding[]
  policies: Policy[]
}

export interface Role {
  name: string
  permissions: string[]
  labels: Record<string, string>
}

export interface RoleBinding {
  name: string
  roleName: string
  subjects: string[]
  subjectType: string
}

export interface Policy {
  name: string
  effect: string
  actions: string[]
  resources: string[]
  conditions: Record<string, string>
}

export interface SecretsManagement {
  provider: string
  keyVaultName: string
  keyVaultUri: string
  useSystemManagedIdentity: boolean
  secrets: Secret[]
}

export interface Secret {
  name: string
  key: string
  value?: string
  type: string
}

export interface ApiSecurity {
  enableRateLimiting: boolean
  rateLimitPerMinute: number
  enableCORS: boolean
  allowedOrigins: string[]
  allowedMethods: string[]
  allowedHeaders: string[]
  enableApiKey: boolean
  apiKeyHeaderName: string
}

/**
 * 生成结果DTO
 */
export interface GeneratedNetworkPolicy {
  policyName: string
  yamlContent: string
  generatedAt: string
}

export interface GeneratedRBACManifest {
  manifests: Record<string, string>
  roleCount: number
  roleBindingCount: number
  generatedAt: string
}

export interface SecurityValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * 安全策略管理Composable - Day 13
 * 使用工厂函数自动生成，消除样板代码
 */
export function useSecurityPolicy() {
  return createSimpleApiComposable({
    validateSecurityPolicy: {
      endpoint: '/api/code-generation/security/validate',
      method: 'POST',
      errorMessage: '安全策略验证失败'
    },
    generateNetworkPolicy: {
      endpoint: '/api/code-generation/security/network-policy',
      method: 'POST',
      errorMessage: '生成NetworkPolicy失败'
    },
    generateRBACManifest: {
      endpoint: '/api/code-generation/security/rbac',
      method: 'POST',
      errorMessage: '生成RBAC配置失败'
    }
  }, httpClient)
}

