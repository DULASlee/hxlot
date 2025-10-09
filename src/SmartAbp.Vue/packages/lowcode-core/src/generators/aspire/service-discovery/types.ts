/**
 * 服务发现相关类型定义
 * 
 * 用于消除service-discovery-enhancer.ts中的as any使用
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
    $: number
    '@enabled'?: string
  }
  metadata?: Record<string, string>
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
  health?: 'healthy' | 'unhealthy' | 'unknown'
}
