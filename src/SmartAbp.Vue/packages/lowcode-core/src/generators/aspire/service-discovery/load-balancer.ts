// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 负载均衡器实现
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// @module @smartabp/lowcode-core/generators/aspire/service-discovery/load-balancer
//
// 📋 功能：
//   - 轮询负载均衡器
//   - 加权轮询负载均衡器
//   - 随机负载均衡器
//   - 最少连接数负载均衡器
//
// 🏆 质量标准：
//   - 高效的负载均衡算法
//   - 100%类型安全
//   - 完整的错误处理
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { LoadBalancer, ServiceInstance } from './types'

/**
 * 轮询负载均衡器
 * 
 * @description
 * 按顺序轮流选择可用的服务实例
 * 
 * @example
 * ```typescript
 * const lb = new RoundRobinLoadBalancer()
 * const instance = lb.selectInstance(instances)
 * ```
 */
export class RoundRobinLoadBalancer implements LoadBalancer {
    private currentIndex = 0
    private unavailableInstances = new Set<string>()

    selectInstance(instances: ServiceInstance[]): ServiceInstance | null {
        const availableInstances = instances.filter(
            instance => instance.health === 'UP' && !this.unavailableInstances.has(instance.instanceId)
        )

        if (availableInstances.length === 0) {
            return null
        }

        const instance = availableInstances[this.currentIndex % availableInstances.length]
        this.currentIndex = (this.currentIndex + 1) % availableInstances.length
        return instance || null // 处理undefined情况
    }

    updateInstanceWeight(instanceId: string, weight: number): void {
        // 轮询负载均衡器不需要权重
    }

    markInstanceUnavailable(instanceId: string): void {
        this.unavailableInstances.add(instanceId)
    }

    markInstanceAvailable(instanceId: string): void {
        this.unavailableInstances.delete(instanceId)
    }
}

/**
 * 加权轮询负载均衡器
 * 
 * @description
 * 根据实例权重进行加权轮询选择
 * 权重越高的实例被选中的概率越大
 * 
 * @example
 * ```typescript
 * const lb = new WeightedRoundRobinLoadBalancer()
 * lb.updateInstanceWeight('instance-1', 100)
 * lb.updateInstanceWeight('instance-2', 200)
 * const instance = lb.selectInstance(instances)
 * ```
 */
export class WeightedRoundRobinLoadBalancer implements LoadBalancer {
    private instanceWeights = new Map<string, number>()
    private currentWeights = new Map<string, number>()
    private unavailableInstances = new Set<string>()

    selectInstance(instances: ServiceInstance[]): ServiceInstance | null {
        const availableInstances = instances.filter(
            instance => instance.health === 'UP' && !this.unavailableInstances.has(instance.instanceId)
        )

        if (availableInstances.length === 0) {
            return null
        }

        let selectedInstance: ServiceInstance | null = null
        let maxCurrentWeight = -1

        // 计算每个实例的当前权重
        for (const instance of availableInstances) {
            const weight = this.instanceWeights.get(instance.instanceId) ?? instance.weight ?? 1
            const currentWeight = this.currentWeights.get(instance.instanceId) || 0
            const newCurrentWeight = currentWeight + weight

            this.currentWeights.set(instance.instanceId, newCurrentWeight)

            if (newCurrentWeight > maxCurrentWeight) {
                maxCurrentWeight = newCurrentWeight
                selectedInstance = instance
            }
        }

        // 调整选中实例的当前权重
        if (selectedInstance) {
            const totalWeight = availableInstances.reduce(
                (sum, inst) => sum + (this.instanceWeights.get(inst.instanceId) ?? inst.weight ?? 1),
                0
            )
            this.currentWeights.set(
                selectedInstance.instanceId,
                maxCurrentWeight - totalWeight
            )
        }

        return selectedInstance
    }

    updateInstanceWeight(instanceId: string, weight: number): void {
        this.instanceWeights.set(instanceId, weight)
    }

    markInstanceUnavailable(instanceId: string): void {
        this.unavailableInstances.add(instanceId)
    }

    markInstanceAvailable(instanceId: string): void {
        this.unavailableInstances.delete(instanceId)
    }
}

