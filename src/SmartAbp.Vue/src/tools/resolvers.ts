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
 * ConflictDetector skeleton – 后续补充路由/Store/Policy 冲突检测
 */
export class ConflictDetector {
  detect(_manifests: Manifest[]): void {
    // TODO: 实现冲突检测逻辑
  }
}
