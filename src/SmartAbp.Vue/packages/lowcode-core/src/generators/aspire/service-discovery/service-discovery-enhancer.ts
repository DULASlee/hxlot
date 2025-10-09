/**
 * @fileoverview ServiceDiscoveryEnhancer - 服务发现核心增强器
 * @module @smartabp/lowcode-core/generators/aspire/service-discovery
 * 
 * 功能：
 * - Consul服务发现集成
 * - Eureka服务发现集成
 * - 健康检查机制
 * - 服务实例缓存
 * - 动态服务更新
 * 
 * 依赖：
 * - types.ts（类型定义）
 * - load-balancer.ts（负载均衡）
 */

import { RoundRobinLoadBalancer, WeightedRoundRobinLoadBalancer } from './load-balancer'
import type {
    ConsulServiceDiscoveryConfig,
    EurekaServiceDiscoveryConfig,
    LoadBalancer,
    ServiceDiscoveryConfig,
    ServiceFilter,
    ServiceInstance
} from './types'

/**
 * 服务发现增强器类
 */
export class ServiceDiscoveryEnhancer {
    private config: ServiceDiscoveryConfig
    private serviceCache: Map<string, ServiceInstance[]>
    private lastUpdateTime: Map<string, number>
    private healthCheckIntervals: Map<string, ReturnType<typeof setInterval>>
    private loadBalancers: Map<string, LoadBalancer>

    constructor(config: ServiceDiscoveryConfig) {
        this.config = config
        this.serviceCache = new Map()
        this.lastUpdateTime = new Map()
        this.healthCheckIntervals = new Map()
        this.loadBalancers = new Map()
    }

    /**
     * 获取服务实例
     */
    async getServiceInstance(
        serviceName: string,
        filter?: ServiceFilter
    ): Promise<ServiceInstance | null> {
        const instances = await this.getServiceInstances(serviceName, filter)

        if (instances.length === 0) {
            return null
        }

        // 获取或创建负载均衡器
        const loadBalancer = this._getOrCreateLoadBalancer(serviceName)

        // 选择一个实例
        return loadBalancer.selectInstance(instances)
    }

    /**
     * 获取所有服务实例
     */
    async getServiceInstances(
        serviceName: string,
        filter?: ServiceFilter
    ): Promise<ServiceInstance[]> {
        // 检查缓存
        if (this._isCacheValid(serviceName)) {
            const cached = this.serviceCache.get(serviceName)!
            return this._applyFilter(cached, filter)
        }

        // 从服务发现中心获取
        const instances = await this._fetchServiceInstances(serviceName)

        // 更新缓存
        this._updateCache(serviceName, instances)

        // 启动健康检查
        this._startHealthCheck(serviceName)

        return this._applyFilter(instances, filter)
    }

    /**
     * 注册服务实例
     */
    async registerService(instance: ServiceInstance): Promise<void> {
        switch (this.config.provider) {
            case 'consul':
                await this._registerToConsul(instance)
                break
            case 'eureka':
                await this._registerToEureka(instance)
                break
            default:
                throw new Error(`Unsupported provider: ${this.config.provider}`)
        }
    }

    /**
     * 注销服务实例
     */
    async deregisterService(serviceId: string): Promise<void> {
        switch (this.config.provider) {
            case 'consul':
                await this._deregisterFromConsul(serviceId)
                break
            case 'eureka':
                await this._deregisterFromEureka(serviceId)
                break
            default:
                throw new Error(`Unsupported provider: ${this.config.provider}`)
        }

        // 清理健康检查
        this._stopHealthCheck(serviceId)
    }

    /**
     * 更新服务健康状态
     */
    async updateHealth(serviceId: string, status: 'UP' | 'DOWN'): Promise<void> {
        const instances = this.serviceCache.get(serviceId)
        if (instances) {
            instances.forEach(instance => {
                if (instance.instanceId === serviceId) {
                    instance.health = status
                }
            })
        }
    }

    /**
     * 清理资源
     */
    dispose(): void {
        // 停止所有健康检查
        this.healthCheckIntervals.forEach((interval) => {
            clearInterval(interval)
        })
        this.healthCheckIntervals.clear()

        // 清理缓存
        this.serviceCache.clear()
        this.lastUpdateTime.clear()
        this.loadBalancers.clear()
    }

    // ==================== 私有方法 ====================

    /**
     * 获取或创建负载均衡器
     */
    private _getOrCreateLoadBalancer(serviceName: string): LoadBalancer {
        let loadBalancer = this.loadBalancers.get(serviceName)

        if (!loadBalancer) {
            const strategy = this.config.loadBalancingStrategy || 'round_robin'

            if (strategy === 'weighted_round_robin') {
                loadBalancer = new WeightedRoundRobinLoadBalancer()
            } else {
                loadBalancer = new RoundRobinLoadBalancer()
            }

            this.loadBalancers.set(serviceName, loadBalancer)
        }

        return loadBalancer
    }

    /**
     * 检查缓存是否有效
     */
    private _isCacheValid(serviceName: string): boolean {
        const lastUpdate = this.lastUpdateTime.get(serviceName)
        if (!lastUpdate) {
            return false
        }

        const cacheTimeout = 30000 // 30秒缓存超时
        return Date.now() - lastUpdate < cacheTimeout
    }

    /**
     * 更新缓存
     */
    private _updateCache(serviceName: string, instances: ServiceInstance[]): void {
        this.serviceCache.set(serviceName, instances)
        this.lastUpdateTime.set(serviceName, Date.now())
    }

    /**
     * 应用过滤器
     */
    private _applyFilter(
        instances: ServiceInstance[],
        filter?: ServiceFilter
    ): ServiceInstance[] {
        if (!filter) {
            return instances.filter(i => i.health === 'UP')
        }

        return instances.filter(instance => {
            // 健康检查
            if (instance.health !== 'UP') {
                return false
            }

            // 类型过滤
            if (filter.type === 'health' && filter.conditions.status) {
                if (instance.health !== filter.conditions.status) {
                    return false
                }
            }

            // 版本过滤
            if (filter.type === 'version' && filter.conditions.version) {
                if (instance.version !== filter.conditions.version) {
                    return false
                }
            }

            // 元数据过滤
            if (filter.type === 'metadata' && filter.conditions) {
                for (const [key, value] of Object.entries(filter.conditions)) {
                    if (instance.metadata[key] !== value) {
                        return false
                    }
                }
            }

            return true
        })
    }

    /**
     * 从服务发现中心获取服务实例
     */
    private async _fetchServiceInstances(serviceName: string): Promise<ServiceInstance[]> {
        switch (this.config.provider) {
            case 'consul':
                return await this._fetchFromConsul(serviceName)
            case 'eureka':
                return await this._fetchFromEureka(serviceName)
            default:
                throw new Error(`Unsupported provider: ${this.config.provider}`)
        }
    }

    /**
     * 从Consul获取服务
     */
    private async _fetchFromConsul(serviceName: string): Promise<ServiceInstance[]> {
        const consulConfig = this.config as ConsulServiceDiscoveryConfig
        const consulAddress = consulConfig.consul.host + ':' + consulConfig.consul.port
        const url = `http://${consulAddress}/v1/health/service/${serviceName}?passing=true`

        try {
            const response = await fetch(url)
            const data = await response.json() as import('./types').ConsulServiceResponse

            return data.map(item => ({
                instanceId: item.Service.ID,
                serviceName: item.Service.Service,
                host: item.Service.Address,
                port: item.Service.Port,
                secure: false,
                metadata: item.Service.Meta || {},
                health: item.Checks.every((c: any) => c.Status === 'passing') ? 'UP' : 'DOWN' as 'UP' | 'DOWN',
                weight: 1,
                version: item.Service.Meta?.version || '1.0.0',
                registrationTime: new Date(),
                lastHeartbeat: new Date()
            }))
        } catch (error) {
            console.error(`Failed to fetch from Consul: ${error}`)
            return []
        }
    }

    /**
     * 从Eureka获取服务
     */
    private async _fetchFromEureka(serviceName: string): Promise<ServiceInstance[]> {
        const eurekaConfig = this.config as EurekaServiceDiscoveryConfig
        const url = `${eurekaConfig.eureka.serviceUrl}/eureka/apps/${serviceName}`

        try {
            const response = await fetch(url, {
                headers: { 'Accept': 'application/json' }
            })
            const data = await response.json() as import('./types').EurekaServiceResponse

            const instances = data.application?.instance || []

            return instances.map(instance => ({
                instanceId: instance.instanceId,
                serviceName: instance.app,
                host: instance.ipAddr,
                port: instance.port['$'],
                secure: instance.securePort?.['@enabled'] === 'true',
                metadata: instance.metadata || {},
                health: instance.status === 'UP' ? 'UP' : 'DOWN' as 'UP' | 'DOWN',
                weight: 1,
                version: instance.metadata?.version || '1.0.0',
                registrationTime: new Date(),
                lastHeartbeat: new Date()
            }))
        } catch (error) {
            console.error(`Failed to fetch from Eureka: ${error}`)
            return []
        }
    }

    /**
     * 注册到Consul
     */
    private async _registerToConsul(instance: ServiceInstance): Promise<void> {
        const consulConfig = this.config as ConsulServiceDiscoveryConfig
        const consulAddress = consulConfig.consul.host + ':' + consulConfig.consul.port
        const url = `http://${consulAddress}/v1/agent/service/register`

        const payload = {
            ID: instance.instanceId,
            Name: instance.serviceName,
            Address: instance.host,
            Port: instance.port,
            Tags: consulConfig.consul.tags || [],
            Meta: instance.metadata,
            Check: {
                HTTP: `http://${instance.host}:${instance.port}/health`,
                Interval: '10s',
                Timeout: '5s'
            }
        }

        await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
    }

    /**
     * 从Consul注销
     */
    private async _deregisterFromConsul(serviceId: string): Promise<void> {
        const consulConfig = this.config as ConsulServiceDiscoveryConfig
        const consulAddress = consulConfig.consul.host + ':' + consulConfig.consul.port
        const url = `http://${consulAddress}/v1/agent/service/deregister/${serviceId}`

        await fetch(url, { method: 'PUT' })
    }

    /**
     * 注册到Eureka
     */
    private async _registerToEureka(instance: ServiceInstance): Promise<void> {
        const eurekaConfig = this.config as EurekaServiceDiscoveryConfig
        const url = `${eurekaConfig.eureka.serviceUrl}/eureka/apps/${instance.serviceName}`

        const payload = {
            instance: {
                instanceId: instance.instanceId,
                app: instance.serviceName,
                ipAddr: instance.host,
                port: { '$': instance.port, '@enabled': true },
                vipAddress: instance.serviceName,
                status: instance.health === 'UP' ? 'UP' : 'DOWN',
                dataCenterInfo: {
                    '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
                    name: 'MyOwn'
                },
                metadata: instance.metadata
            }
        }

        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
    }

    /**
     * 从Eureka注销
     */
    private async _deregisterFromEureka(serviceId: string): Promise<void> {
        const eurekaConfig = this.config as EurekaServiceDiscoveryConfig
        const url = `${eurekaConfig.eureka.serviceUrl}/eureka/apps/${serviceId}`

        await fetch(url, { method: 'DELETE' })
    }

    /**
     * 启动健康检查
     */
    private _startHealthCheck(serviceName: string): void {
        // 如果已经有健康检查在运行，先停止
        this._stopHealthCheck(serviceName)

        const interval = this.config.healthCheckInterval || 30000

        const checkInterval = setInterval(async () => {
            const instances = await this._fetchServiceInstances(serviceName)
            this._updateCache(serviceName, instances)
        }, interval)

        this.healthCheckIntervals.set(serviceName, checkInterval)
    }

    /**
     * 停止健康检查
     */
    private _stopHealthCheck(serviceName: string): void {
        const interval = this.healthCheckIntervals.get(serviceName)
        if (interval) {
            clearInterval(interval)
            this.healthCheckIntervals.delete(serviceName)
        }
    }
}


