// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 服务发现类型定义
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// @module @smartabp/lowcode-core/generators/aspire/service-discovery/types
//
// 📋 功能：
//   - 服务发现核心类型定义
//   - Consul配置类型
//   - Eureka配置类型
//   - 负载均衡器接口
//
// 🏆 质量标准：
//   - 100%类型安全
//   - 完整的JSDoc注释
//   - 遵循TypeScript最佳实践
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 服务发现提供者类型
 */
export type ServiceDiscoveryProvider = 'consul' | 'eureka' | 'dns' | 'static' | 'kubernetes' | 'nacos'

/**
 * 服务实例信息
 */
export interface ServiceInstance {
    /** 实例ID */
    instanceId: string
    /** 服务名称 */
    serviceName: string
    /** 主机地址 */
    host: string
    /** 端口 */
    port: number
    /** 是否启用SSL */
    secure: boolean
    /** 实例元数据 */
    metadata: Record<string, string>
    /** 健康状态 */
    health: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN'
    /** 权重（负载均衡使用）*/
    weight: number
    /** 数据中心 */
    datacenter?: string
    /** 可用区 */
    zone?: string
    /** 版本 */
    version: string
    /** 注册时间 */
    registrationTime: Date
    /** 最后心跳时间 */
    lastHeartbeat: Date
}

/**
 * 服务发现配置
 */
export interface ServiceDiscoveryConfig {
    /** 提供者类型 */
    provider: ServiceDiscoveryProvider
    /** 服务注册中心地址 */
    registryUrl: string
    /** 启用服务注册 */
    enableRegistration: boolean
    /** 启用服务发现 */
    enableDiscovery: boolean
    /** 心跳间隔（秒）*/
    heartbeatInterval: number
    /** 健康检查间隔（秒）*/
    healthCheckInterval: number
    /** 服务元数据 */
    metadata: Record<string, string>
    /** 负载均衡策略 */
    loadBalancingStrategy: 'round_robin' | 'random' | 'weighted_round_robin' | 'least_connections' | 'consistent_hash'
    /** 故障转移配置 */
    failover: {
        /** 启用故障转移 */
        enabled: boolean
        /** 重试次数 */
        maxRetries: number
        /** 重试间隔（毫秒）*/
        retryInterval: number
        /** 熔断阈值 */
        circuitBreakerThreshold: number
    }
    /** 服务过滤器 */
    serviceFilters: ServiceFilter[]
}

/**
 * 服务过滤器
 */
export interface ServiceFilter {
    /** 过滤器名称 */
    name: string
    /** 过滤器类型 */
    type: 'include' | 'exclude' | 'version' | 'metadata' | 'health'
    /** 过滤条件 */
    conditions: Record<string, any>
    /** 优先级 */
    priority: number
}

/**
 * Consul特定配置
 */
export interface ConsulServiceDiscoveryConfig extends ServiceDiscoveryConfig {
    consul: {
        /** Consul地址 */
        host: string
        /** Consul端口 */
        port: number
        /** ACL Token */
        aclToken?: string
        /** 数据中心 */
        datacenter: string
        /** 启用TLS */
        enableTls: boolean
        /** TLS配置 */
        tls?: {
            /** 证书文件路径 */
            certFile: string
            /** 私钥文件路径 */
            keyFile: string
            /** CA证书路径 */
            caFile: string
            /** 跳过证书验证 */
            skipVerify: boolean
        }
        /** 服务标签 */
        tags: string[]
        /** 检查配置 */
        check: {
            /** HTTP检查URL */
            http?: string
            /** TCP检查地址 */
            tcp?: string
            /** 检查间隔 */
            interval: string
            /** 超时时间 */
            timeout: string
            /** 初始状态 */
            status: 'passing' | 'warning' | 'critical'
        }
    }
}

/**
 * Eureka特定配置
 */
export interface EurekaServiceDiscoveryConfig extends ServiceDiscoveryConfig {
    eureka: {
        /** Eureka服务器URL */
        serviceUrl: string
        /** 应用名称 */
        appName: string
        /** 实例主机名 */
        hostname: string
        /** 虚拟主机名 */
        vipAddress: string
        /** 安全虚拟主机名 */
        secureVipAddress: string
        /** 续约间隔（秒）*/
        renewalIntervalInSecs: number
        /** 持续时间（秒）*/
        durationInSecs: number
        /** 启用健康检查 */
        healthCheckEnabled: boolean
        /** 健康检查URL */
        healthCheckUrl: string
        /** 状态页面URL */
        statusPageUrl: string
        /** 主页URL */
        homePageUrl: string
    }
}

/**
 * 负载均衡器接口
 */
export interface LoadBalancer {
    /** 选择服务实例 */
    selectInstance(instances: ServiceInstance[]): ServiceInstance | null
    /** 更新实例权重 */
    updateInstanceWeight(instanceId: string, weight: number): void
    /** 标记实例不可用 */
    markInstanceUnavailable(instanceId: string): void
    /** 恢复实例可用性 */
    markInstanceAvailable(instanceId: string): void
}

