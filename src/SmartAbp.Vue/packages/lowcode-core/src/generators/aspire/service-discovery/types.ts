/**
 * 服务发现相关类型定义
 * 
 * 目的：为 service-discovery-enhancer.ts 提供强类型
 */

/**
 * Consul服务信息
 */
export interface ConsulServiceInfo {
  Service: {
    ID: string
    Service: string
    Address: string
    Port: number
    Tags?: string[]
    Meta?: Record<string, string>
  }
  Checks?: Array<{
    Status: string
  }>
}

/**
 * Consul服务发现响应（数组）
 */
export type ConsulServiceResponse = ConsulServiceInfo[]

/**
 * Eureka实例信息
 */
export interface EurekaInstance {
  instanceId: string
  hostName?: string
  app?: string
  ipAddr?: string
  status?: string
  port?: {
    $: number
    '@enabled'?: string
  }
  securePort?: {
    $?: number
    '@enabled'?: string
  }
  dataCenterInfo?: {
    name?: string
  }
  metadata?: Record<string, unknown>
}

/**
 * Eureka服务发现响应
 */
export interface EurekaServiceResponse {
  application?: {
    name?: string
    instance?: EurekaInstance[]
  }
}

/**
 * 统一的服务实例信息
 */
export interface ServiceInstance {
  instanceId: string
  serviceName: string
  host: string
  port: number
  secure: boolean
  metadata?: Record<string, string>
  health?: 'healthy' | 'unhealthy' | 'unknown' | 'UP' | 'DOWN'
  weight?: number
  version?: string
}

export interface ConsulServiceDiscoveryConfig {
  provider: 'consul'
  consul: { host: string; port: number; tags?: string[] }
  loadBalancingStrategy?: 'round_robin' | 'weighted_round_robin'
  healthCheckInterval?: number
}

export interface EurekaServiceDiscoveryConfig {
  provider: 'eureka'
  eureka: { serviceUrl: string }
  loadBalancingStrategy?: 'round_robin' | 'weighted_round_robin'
  healthCheckInterval?: number
}

export type LoadBalancer = any

export interface ServiceDiscoveryConfig {
  provider: 'consul' | 'eureka'
  loadBalancingStrategy?: 'round_robin' | 'weighted_round_robin'
  healthCheckInterval?: number
}

export type ServiceFilter = { type: string; conditions: Record<string, any> }

