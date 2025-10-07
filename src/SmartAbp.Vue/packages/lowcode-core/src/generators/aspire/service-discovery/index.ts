/**
 * @fileoverview Service Discovery Module Entry Point
 * @module @smartabp/lowcode-core/generators/aspire/service-discovery
 * 
 * 服务发现模块统一导出
 */

// 类型定义
export type {
    ConsulServiceDiscoveryConfig,
    EurekaServiceDiscoveryConfig,
    LoadBalancer, ServiceDiscoveryConfig, ServiceDiscoveryProvider, ServiceFilter, ServiceInstance
} from './types'

// 负载均衡器
export {
    RoundRobinLoadBalancer,
    WeightedRoundRobinLoadBalancer
} from './load-balancer'

// 服务发现增强器
export { ServiceDiscoveryEnhancer } from './service-discovery-enhancer'

