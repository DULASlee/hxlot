/**
 * 示例：使用Schema驱动生成 Router 与 Store 代码
 */
import RouterGeneratorPlugin, { type RouterGeneratorConfig } from '../plugins/router-generator'
import StoreGeneratorPlugin, { type StoreGeneratorConfig } from '../plugins/store-generator'
import type { PluginContext, Schema } from '../kernel/types'

const pageSchema: Schema = {
  id: 'UserManagement',
  version: '1.0.0',
  type: 'page',
  metadata: {
    routeName: 'UserManagement',
    routePath: '/admin/users',
    module: 'user',
    componentPath: '@/views/user/UserManagementView.vue'
  }
}

const storeSchema: Schema = {
  id: 'user',
  version: '1.0.0',
  type: 'module',
  metadata: {
    storeName: 'user',
    state: ['list', 'loading', 'total']
  }
}

const context: PluginContext = {
  eventBus: {} as any,
  cache: {} as any,
  logger: console as any,
  monitor: {
    startTimer: () => ({ end: () => 0, getCurrentDuration: () => 0 }),
    recordMetric: () => {},
    recordDuration: () => {},
    recordCount: () => {},
    recordGauge: () => {},
    getMetrics: () => [],
    getAggregatedMetrics: () => ({ name: '', count: 0, sum: 0, avg: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0 }),
    getHealthMetrics: () => ({}),
    destroy: () => {}
  } as any,
  config: {
    get: <T = any>(_key: string, defaultValue?: T): T => (defaultValue as T) ?? (undefined as unknown as T),
    set: () => {},
    has: () => false,
    delete: () => false,
    getEnv: () => 'dev',
    isDevelopment: () => true,
    isProduction: () => false,
    watch: () => () => {},
    validate: () => ({ valid: true, errors: [], warnings: [] }),
    reload: async () => {}
  },
  getPlugin: () => undefined,
  executePlugin: async () => ({} as any),
  createChildContext: () => (context as any)
}

async function main() {
  const routerPlugin = new RouterGeneratorPlugin()
  const storePlugin = new StoreGeneratorPlugin()

  const routerConfig: RouterGeneratorConfig = { guards: true, persist: true, degradeMode: true }
  const storeConfig: StoreGeneratorConfig = { persist: true }

  const routerCode = await routerPlugin.generate(pageSchema, routerConfig, context)
  const storeCode = await storePlugin.generate(storeSchema, storeConfig, context)

  console.log('--- Router Code ---\n', routerCode.code)
  console.log('--- Store Code ---\n', storeCode.code)
}

void main()


