import { promises as fs } from 'fs'
import path from 'node:path'
import type { Manifest } from './schema'

/**
 * CodeWriter
 * 当前仅实现 writeRoutes —— 根据 manifests 生成 routes.generated.ts
 */
export class CodeWriter {
  constructor(private readonly rootDir: string) {}

  async writeRoutes(manifests: Manifest[]): Promise<void> {
    const routeLines: string[] = []

    manifests.forEach((m) => {
      m.routes.forEach((r) => {
        routeLines.push(`  { name: '${r.name}', path: '${r.path}', component: () => import('${r.component}'), meta: ${JSON.stringify(r.meta || {})} }`)
      })
    })

    const content = `// AUTO-GENERATED FILE – DO NOT EDIT.
// Generated at: ${new Date().toISOString()}

import type { RouteRecordRaw } from 'vue-router'

export const generatedRoutes: RouteRecordRaw[] = [
${routeLines.join(',\n')}
]
`

    await this.writeFile('src/appshell/router/routes.generated.ts', content)
  }

  /**
   * 根据 manifests 生成 Pinia Store 注册文件
   */
  async writeStores(manifests: Manifest[]): Promise<void> {
    const imports: string[] = []
    const registrations: string[] = []

    manifests.forEach((m) => {
      m.stores.forEach((s) => {
        imports.push(`import { ${s.symbol} } from '${s.modulePath}'`)
        registrations.push(`    ${s.symbol}, // ${m.name}`)
      })
    })

    const content = `// AUTO-GENERATED FILE – DO NOT EDIT.
// Generated at: ${new Date().toISOString()}

${imports.join('\n')}

export const generatedStores = () => ({
${registrations.join(',\n')}
})
`
    await this.writeFile('src/appshell/stores/stores.generated.ts', content)
  }

  /**
   * 生成生命周期钩子聚合文件（preInit / init / postInit / beforeMount / mounted）
   */
  async writeLifecycles(manifests: Manifest[]): Promise<void> {
    const hooks = ['preInit', 'init', 'postInit', 'beforeMount', 'mounted'] as const
    const sections: string[] = []

    hooks.forEach((hook) => {
      const imports: string[] = []
      const calls: string[] = []
      manifests.forEach((m) => {
        const pathStr = m.lifecycle[hook]
        if (pathStr) {
          const importName = `${m.name}_${hook}`
          imports.push(`import ${importName} from '${pathStr}'`)
          calls.push(`    await ${importName}?.(ctx) // ${m.name}`)
        }
      })

      // 生成每个 hook 的函数
      sections.push(`// ${hook} hooks\n${imports.join('\n')}\n\nexport async function run${hook.charAt(0).toUpperCase() + hook.slice(1)}(ctx: any) {\n  try {\n${calls.join('\n')}\n  } catch (error) {\n    console.error('[Lifecycle] Error in ${hook}:', error)\n    throw error\n  }\n}`)
    })

    const content = `// AUTO-GENERATED FILE – DO NOT EDIT.
// Generated at: ${new Date().toISOString()}

${sections.join('\n\n')}
`
    await this.writeFile('src/appshell/lifecycle.generated.ts', content)
  }

  /**
   * 生成权限策略聚合文件
   */
  async writePolicies(manifests: Manifest[]): Promise<void> {
    const policyMap: Record<string, string> = {}
    manifests.forEach((m) => {
      m.policies.forEach((p) => (policyMap[p] = m.name))
    })

    const content = `// AUTO-GENERATED FILE – DO NOT EDIT.
// Generated at: ${new Date().toISOString()}

export const generatedPolicies = ${JSON.stringify(policyMap, null, 2)}
`
    await this.writeFile('src/appshell/security/policies.generated.ts', content)
  }

  private async writeFile(relPath: string, content: string) {
    const fullPath = path.join(this.rootDir, relPath)
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    await fs.writeFile(fullPath, content, 'utf-8')
  }
}
