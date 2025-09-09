import type { Manifest } from './schema'

/**
 * DependencyResolver
 * 简化版：仅根据 dependsOn 做拓扑排序，检测循环依赖并抛错。
 */
export class DependencyResolver {
  private manifests = new Map<string, Manifest>()

  constructor(manifests: Manifest[]) {
    manifests.forEach((m) => this.manifests.set(m.name, m))
  }

  /**
   * 按模块 order+拓扑顺序返回排序后的清单数组
   */
  topoSort(): Manifest[] {
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const sorted: Manifest[] = []

    const visit = (name: string, stack: string[] = []) => {
      if (visited.has(name)) return
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${[...stack, name].join(' -> ')}`)
      }
      const manifest = this.manifests.get(name)
      if (!manifest) {
        throw new Error(`Missing manifest: ${name}`)
      }
      visiting.add(name)
      for (const dep of manifest.dependsOn ?? []) {
        visit(dep, [...stack, name])
      }
      visiting.delete(name)
      visited.add(name)
      sorted.push(manifest)
    }

    // 先按 order 排序，保证同层模块顺序稳定
    const ordered = [...this.manifests.values()].sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
    ordered.forEach((m) => visit(m.name))

    return sorted
  }
}

/**
 * ConflictDetector
 * 用于检测 Manifest 集合中的路由名称 / 路由路径 / Store id / 权限策略 的冲突。
 * 任何重复都会抛出异常，阻止代码生成。
 */
export class ConflictDetector {
  // 使用 Map 记录首次出现的位置，便于后续报错信息中指出冲突来源
  private routeNames = new Map<string, string>()
  private routePaths = new Map<string, string>()
  private storeIds = new Map<string, string>()
  private policies = new Map<string, string>()

  detect(manifests: Manifest[]): void {
    manifests.forEach((manifest) => {
      // ==== 路由冲突检查 ====
      manifest.routes.forEach((route) => {
        // 路由名称
        if (this.routeNames.has(route.name)) {
          const first = this.routeNames.get(route.name)!
          throw new Error(`路由名称冲突: "${route.name}" 在模块 "${first}" 和 "${manifest.name}" 中重复`)
        }
        this.routeNames.set(route.name, manifest.name)

        // 路由路径（归一化处理末尾 /）
        const normPath = route.path.replace(/\/+$/, '')
        if (this.routePaths.has(normPath)) {
          const first = this.routePaths.get(normPath)!
          throw new Error(`路由路径冲突: "${normPath}" 在模块 "${first}" 和 "${manifest.name}" 中重复`)
        }
        this.routePaths.set(normPath, manifest.name)
      })

      // ==== Store id 冲突检查 ====
      manifest.stores.forEach((store) => {
        if (this.storeIds.has(store.id)) {
          const first = this.storeIds.get(store.id)!
          throw new Error(`Store id 冲突: "${store.id}" 在模块 "${first}" 和 "${manifest.name}" 中重复`)
        }
        this.storeIds.set(store.id, manifest.name)
      })

      // ==== 权限策略冲突检查 ====
      manifest.policies.forEach((policy) => {
        if (this.policies.has(policy)) {
          const first = this.policies.get(policy)!
          throw new Error(`权限策略冲突: "${policy}" 在模块 "${first}" 和 "${manifest.name}" 中重复`)
        }
        this.policies.set(policy, manifest.name)
      })
    })
  }
}
