import type { CodegenPlugin, PluginContext, PluginMetadata, ValidationResult, GeneratedCode, Schema } from '../../kernel/types'

export interface RouterGeneratorConfig {
  base?: string
  mode?: 'hash' | 'history'
  lazy?: boolean
  guards?: boolean
  persist?: boolean
  degradeMode?: boolean
  persistKey?: string
}

export class RouterGeneratorPlugin implements CodegenPlugin<Schema, RouterGeneratorConfig, GeneratedCode> {
  readonly metadata: PluginMetadata = {
    name: 'router-generator',
    version: '0.1.0',
    description: '基于Schema的Vue Router代码生成器（骨架版）',
    author: 'SmartAbp Team',
    dependencies: [],
    peerDependencies: ['vue', 'vue-router'],
    target: ['vue3'],
    capabilities: ['generator']
  }

  canHandle(schema: Schema): boolean { return schema.type === 'page' || schema.type === 'layout' }

  async validate(schema: Schema): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = []
    if (!schema.id) errors.push({ code: 'ROUTER_SCHEMA_ID', message: '缺少schema.id', path: 'id', severity: 'error' })
    return { valid: errors.length === 0, errors, warnings: [] }
  }

  async generate(schema: Schema, config: RouterGeneratorConfig = {}, context: PluginContext): Promise<GeneratedCode> {
    const timer = context.monitor.startTimer('router.codegen')
    try {
      const base = config.base ?? '/'
      const mode = config.mode ?? 'history'
      const lazy = config.lazy ?? true
      const guards = config.guards ?? true
      const degradeMode = config.degradeMode ?? true
      const persist = config.persist ?? true
      const persistKey = config.persistKey ?? `__router:last:${schema.id}`

      const code = this.emitRouterCode(schema, { base, mode, lazy, guards, degradeMode, persist, persistKey })

      timer.end({ status: 'success' })
      return {
        code,
        dependencies: ['vue', 'vue-router'],
        metadata: {
          framework: 'vue3',
          language: 'typescript',
          generatedAt: Date.now(),
          checksum: `${schema.id}-${schema.version}`,
          size: code.length
        }
      }
    } catch (e) {
      timer.end({ status: 'error' })
      throw e
    }
  }

  private emitRouterCode(
    schema: Schema,
    opts: { base: string; mode: 'hash' | 'history'; lazy: boolean; guards: boolean; degradeMode: boolean; persist: boolean; persistKey: string }
  ): string {
    const routeName = schema.metadata?.routeName || schema.id
    const componentPath = schema.metadata?.componentPath || '@/views/' + (schema.metadata?.module || 'common') + '/' + routeName + '.vue'
    const importLine = opts.lazy
      ? `const ${routeName} = () => import('${componentPath}')`
      : `import ${routeName} from '${componentPath}'`
    const modeInit = opts.mode === 'hash'
      ? `createWebHashHistory('${opts.base}')`
      : `((typeof window !== 'undefined' && 'pushState' in (window.history||{})) ? createWebHistory('${opts.base}') : ${opts.degradeMode ? `createWebHashHistory('${opts.base}')` : `createWebHistory('${opts.base}')`})`

    const guardsCode = opts.guards ? `
// 守卫：可插拔权限/多租户（运行期由全局 __lowcodeRuntime 提供）
router.beforeEach(async (to, from, next) => {
  try {
    const runtime = (globalThis as any).__lowcodeRuntime
    if (runtime?.auth?.canNavigate) {
      const allowed = await runtime.auth.canNavigate(to, from)
      if (!allowed) {
        const loginPath = runtime.auth.loginPath || '/login'
        return next({ path: loginPath, query: { redirect: to.fullPath } })
      }
    }
    if (runtime?.tenant?.ensureTenant) {
      await runtime.tenant.ensureTenant(to)
    }
    next()
  } catch (e) {
    console.warn('[Router Guard] Error:', e)
    next(false)
  }
})
` : ''

    const storageAdapter = opts.persist ? `
// 持久化适配器：localStorage → sessionStorage → 内存
const __storage = (() => {
  try {
    if (typeof localStorage !== 'undefined') {
      return {
        get: (k: string) => localStorage.getItem(k),
        set: (k: string, v: string) => localStorage.setItem(k, v),
        remove: (k: string) => localStorage.removeItem(k)
      }
    }
  } catch {}
  try {
    if (typeof sessionStorage !== 'undefined') {
      return {
        get: (k: string) => sessionStorage.getItem(k),
        set: (k: string, v: string) => sessionStorage.setItem(k, v),
        remove: (k: string) => sessionStorage.removeItem(k)
      }
    }
  } catch {}
  const mem = new Map<string, string>()
  return {
    get: (k: string) => mem.get(k) || null,
    set: (k: string, v: string) => { mem.set(k, v) },
    remove: (k: string) => { mem.delete(k) }
  }
})()
` : ''

    const persistCode = opts.persist ? `
// 记录最后一次成功路由，用于刷新恢复
router.afterEach((to) => {
  try { __storage.set('${opts.persistKey}', to.fullPath) } catch {}
})

export async function restoreLastRoute(router: any) {
  try {
    const last = __storage.get('${opts.persistKey}')
    if (last) await router.replace(last)
  } catch {}
}
` : ''

    return `import { createRouter, ${opts.mode === 'hash' ? 'createWebHashHistory' : 'createWebHistory, createWebHashHistory'} } from 'vue-router'
${opts.lazy ? '' : '// 非懒加载模式下的直接导入'}
${importLine}

const routes = [
  { path: '${schema.metadata?.routePath || '/' + routeName.toLowerCase()}', name: '${routeName}', component: ${routeName} }
]

const router = createRouter({
  history: ${modeInit},
  routes
})

${guardsCode}
${storageAdapter}
${persistCode}

export default router
`
  }
}

export default RouterGeneratorPlugin


