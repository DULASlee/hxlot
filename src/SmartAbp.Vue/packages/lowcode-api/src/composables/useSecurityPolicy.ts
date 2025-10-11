import { ref } from 'vue'
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
 */
export function useSecurityPolicy() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 验证安全策略
   */
  const validateSecurityPolicy = async (
    policy: SecurityPolicy
  ): Promise<SecurityValidationResult> => {
    try {
      loading.value = true
      error.value = null

      const response = await httpClient.post<SecurityValidationResult>(
        '/api/code-generation/security/validate',
        policy
      )

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '安全策略验证失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 生成NetworkPolicy
   */
  const generateNetworkPolicy = async (
    serviceName: string,
    networkPolicy: NetworkPolicy
  ): Promise<GeneratedNetworkPolicy> => {
    try {
      loading.value = true
      error.value = null

      const response = await httpClient.post<GeneratedNetworkPolicy>(
        '/api/code-generation/security/network-policy',
        {
          serviceName,
          networkPolicy
        }
      )

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '生成NetworkPolicy失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 生成RBAC配置
   */
  const generateRBACManifest = async (
    serviceName: string,
    authorization: Authorization
  ): Promise<GeneratedRBACManifest> => {
    try {
      loading.value = true
      error.value = null

      const response = await httpClient.post<GeneratedRBACManifest>(
        '/api/code-generation/security/rbac',
        {
          serviceName,
          authorization
        }
      )

      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '生成RBAC配置失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    validateSecurityPolicy,
    generateNetworkPolicy,
    generateRBACManifest
  }
}

