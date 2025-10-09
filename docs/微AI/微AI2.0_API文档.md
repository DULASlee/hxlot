# 微AI 2.0 API 文档

## 📋 文档说明

**版本**: 2.0.0  
**更新日期**: 2025-10-09  
**作者**: AI首席架构师

本文档提供微AI 2.0完整的API参考，包括：
- 虚拟程序集（Virtual Assembly）
- 类型生成器（Type Definition Generator）
- 性能优化器（Performance Optimizer）
- 插件系统（Plugin System）
- 开发者工具（DevTools）

---

## 🌟 核心API

### VirtualAssembly

虚拟程序集是微AI 2.0的核心，提供类似C#程序集的全局组件可见性。

#### 创建虚拟程序集

```typescript
import { createVirtualAssembly, globalComponentRegistry } from '@smartabp/lowcode-shared'

const Components = createVirtualAssembly(globalComponentRegistry, {
  debug: true,
  enablePerformanceMonitoring: true,
  cacheSize: 100,
  loadingDelay: 200,
  loadingTimeout: 30000
})
```

#### 配置选项

```typescript
interface VirtualAssemblyOptions {
  /**
   * 调试模式
   * @default import.meta.env.DEV
   */
  debug?: boolean

  /**
   * 启用性能监控
   * @default true
   */
  enablePerformanceMonitoring?: boolean

  /**
   * LRU缓存大小
   * @default 100
   */
  cacheSize?: number

  /**
   * 加载延迟（毫秒）
   * @default 200
   */
  loadingDelay?: number

  /**
   * 加载超时（毫秒）
   * @default 30000
   */
  loadingTimeout?: number
}
```

#### 使用组件

```typescript
import { Components } from '@smartabp/lowcode-shared'

// 1. 直接访问（推荐）
const SmartForm = Components.SmartForm

// 2. 动态访问
const componentName = 'SmartTable'
const SmartTable = Components[componentName]

// 3. 检查存在性
if ('SmartButton' in Components) {
  const SmartButton = Components.SmartButton
}

// 4. 列出所有组件
const allComponents = Object.keys(Components)
```

#### 实例方法

##### `preload(componentNames: string[]): Promise<void>`

预加载组件

```typescript
const assembly = new VirtualAssembly(registry)
await assembly.preload(['SmartForm', 'SmartTable'])
```

##### `clearCache(): void`

清空缓存

```typescript
assembly.clearCache()
```

##### `getStats(): VirtualAssemblyStats`

获取统计信息

```typescript
const stats = assembly.getStats()
console.log(stats)
// {
//   totalLoads: 150,
//   cacheHits: 120,
//   cacheMisses: 30,
//   cacheSize: 50,
//   avgLoadTime: 125.5
// }
```

---

## 📝 类型生成器

### TypeDefinitionGenerator

自动生成TypeScript类型声明文件。

#### 创建生成器

```typescript
import { 
  TypeDefinitionGenerator, 
  globalComponentRegistry 
} from '@smartabp/lowcode-shared'

const generator = new TypeDefinitionGenerator(globalComponentRegistry, {
  outputPath: 'types/components.d.ts',
  moduleName: '@smartabp/lowcode-shared',
  includeComments: true,
  includeExamples: true,
  prettify: true
})
```

#### 配置选项

```typescript
interface TypeGeneratorOptions {
  /**
   * 输出文件路径
   */
  outputPath: string

  /**
   * 模块名称
   * @default '@smartabp/lowcode-shared'
   */
  moduleName?: string

  /**
   * 包含注释
   * @default true
   */
  includeComments?: boolean

  /**
   * 包含使用示例
   * @default false
   */
  includeExamples?: boolean

  /**
   * 格式化输出
   * @default true
   */
  prettify?: boolean
}
```

#### 生成类型文件

```typescript
// 一次性生成
const result = await generator.generateFile()
console.log(result.success) // true
console.log(result.path)    // 'types/components.d.ts'

// 监听模式（开发环境）
await generator.watch((result) => {
  console.log('类型文件已更新:', result.path)
})
```

#### 辅助函数

```typescript
// 快速生成
import { generateTypes } from '@smartabp/lowcode-shared'

await generateTypes(globalComponentRegistry, {
  outputPath: 'types/components.d.ts'
})
```

---

## ⚡ 性能优化器

### PerformanceOptimizer

智能缓存和预测性加载。

#### 创建优化器

```typescript
import { PerformanceOptimizer } from '@smartabp/lowcode-shared'

const optimizer = new PerformanceOptimizer({
  lfuWeight: 0.6,
  lruWeight: 0.4,
  maxCacheSize: 100,
  enablePreloading: true,
  preloadThreshold: 0.7
})
```

#### 配置选项

```typescript
interface PerformanceOptimizerOptions {
  /**
   * LFU权重
   * @default 0.6
   */
  lfuWeight?: number

  /**
   * LRU权重
   * @default 0.4
   */
  lruWeight?: number

  /**
   * 最大缓存大小
   * @default 100
   */
  maxCacheSize?: number

  /**
   * 启用预加载
   * @default true
   */
  enablePreloading?: boolean

  /**
   * 预加载阈值
   * @default 0.7
   */
  preloadThreshold?: number
}
```

#### 核心方法

##### `get(key: string): Component | undefined`

智能获取组件

```typescript
const component = optimizer.get('SmartForm')
```

##### `set(key: string, value: Component): void`

缓存组件

```typescript
optimizer.set('SmartForm', formComponent)
```

##### `predictNextComponents(context: LoadContext): string[]`

预测下一步需要的组件

```typescript
const predictions = optimizer.predictNextComponents({
  currentRoute: '/users/list',
  userBehavior: ['view_list', 'click_filter'],
  timeOfDay: new Date().getHours(),
  deviceType: 'desktop',
  networkSpeed: 'fast'
})
// ['UserForm', 'FilterPanel', 'ExportButton']
```

##### `autoManageMemory(): void`

自动内存管理

```typescript
// 自动清理低价值缓存
optimizer.autoManageMemory()
```

---

## 🧩 插件系统

### PluginManager

插件管理器提供完整的插件生命周期管理。

#### 创建管理器

```typescript
import { createPluginManager } from '@smartabp/lowcode-shared'

const manager = createPluginManager({
  autoEnable: true,
  strictMode: true,
  debug: true
})
```

#### 配置选项

```typescript
interface PluginManagerOptions {
  /**
   * 自动启用插件
   * @default true
   */
  autoEnable?: boolean

  /**
   * 严格模式（依赖检查）
   * @default true
   */
  strictMode?: boolean

  /**
   * 调试模式
   * @default false
   */
  debug?: boolean
}
```

#### 核心方法

##### `register(plugin: Plugin): Promise<void>`

注册插件

```typescript
import { createPerformancePlugin } from '@smartabp/lowcode-shared'

await manager.register(createPerformancePlugin({
  slowLoadThreshold: 500
}))
```

##### `unregister(pluginId: string): Promise<void>`

卸载插件

```typescript
await manager.unregister('builtin.performance')
```

##### `enable(pluginId: string): Promise<void>`

启用插件

```typescript
await manager.enable('builtin.security')
```

##### `disable(pluginId: string): Promise<void>`

禁用插件

```typescript
await manager.disable('builtin.analytics')
```

##### `triggerHook(type: PluginHookType, data?: any, target?: string): Promise<void>`

触发钩子

```typescript
await manager.triggerHook('afterComponentLoad', {
  duration: 125,
  fromCache: false
}, 'SmartForm')
```

#### 插件接口

```typescript
interface Plugin {
  metadata: PluginMetadata
  install(manager: PluginManager): void | Promise<void>
  uninstall?(): void | Promise<void>
  hooks?: Partial<Record<PluginHookType, PluginHookHandler>>
}

interface PluginMetadata {
  id: string
  name: string
  version: string
  description?: string
  author?: string
  dependencies?: string[]
  tags?: string[]
  enabled?: boolean
  config?: Record<string, any>
}
```

#### 钩子类型

```typescript
type PluginHookType =
  | 'beforeInit'           // 初始化前
  | 'afterInit'            // 初始化后
  | 'beforeComponentLoad'  // 组件加载前
  | 'afterComponentLoad'   // 组件加载后
  | 'beforeComponentMount' // 组件挂载前
  | 'afterComponentMount'  // 组件挂载后
  | 'beforeDestroy'        // 销毁前
  | 'afterDestroy'         // 销毁后
  | 'onError'              // 错误时
  | 'onPerformance'        // 性能监控
  | 'onCustom'             // 自定义钩子
```

---

## 🔌 内置插件

### 1. PerformancePlugin

性能监控插件

```typescript
import { createPerformancePlugin } from '@smartabp/lowcode-shared'

const perfPlugin = createPerformancePlugin({
  slowLoadThreshold: 500,      // 慢加载阈值
  enableAutoReport: true,      // 自动报告
  reportInterval: 60,          // 报告间隔（秒）
  enableWarnings: true         // 启用警告
})

await globalPluginManager.register(perfPlugin)
```

**功能**：
- 慢加载组件自动警告
- 缓存命中率监控
- 错误率告警
- 自动性能报告

### 2. SecurityPlugin

安全检查插件

```typescript
import { createSecurityPlugin } from '@smartabp/lowcode-shared'

const secPlugin = createSecurityPlugin({
  enableXSSProtection: true,        // XSS防护
  componentWhitelist: ['SafeComp'], // 白名单
  componentBlacklist: ['DangerComp'], // 黑名单
  enableAccessControl: true,        // 访问控制
  strictMode: false                 // 严格模式
})

await globalPluginManager.register(secPlugin)
```

**功能**：
- 组件白名单/黑名单
- XSS防护（危险字符检测）
- 访问控制审计
- 安全事件日志

### 3. AnalyticsPlugin

分析统计插件

```typescript
import { createAnalyticsPlugin } from '@smartabp/lowcode-shared'

const analyticsPlugin = createAnalyticsPlugin({
  enableTracking: true,      // 启用追踪
  autoSendInterval: 30,      // 自动发送间隔
  batchSize: 50,             // 批量大小
  endpoint: '/api/analytics', // 远程端点
  enableLocalStorage: true   // 本地存储
})

await globalPluginManager.register(analyticsPlugin)
```

**功能**：
- 组件加载次数统计
- 用户行为追踪
- 事件批量发送
- 本地存储持久化

---

## 🛠️ 开发者工具

### DevToolsPanel

可视化开发者工具面板

```vue
<template>
  <DevToolsPanel />
</template>

<script setup>
import { DevToolsPanel } from '@smartabp/lowcode-shared'
</script>
```

**功能**：
- 🌳 组件树可视化
- 🧩 插件管理
- ⚡ 性能监控面板
- 📋 事件日志查看

---

## 📊 性能监控

### PerformanceMonitor

实时性能监控

```typescript
import { globalPerformanceMonitor } from '@smartabp/lowcode-shared'

// 记录加载
globalPerformanceMonitor.recordLoad('SmartForm', 125, false)

// 记录错误
globalPerformanceMonitor.recordError('SmartTable', new Error('Failed'))

// 生成报告
const report = globalPerformanceMonitor.generateReport(60)
console.log(report)
```

#### 报告结构

```typescript
interface PerformanceReport {
  period: number              // 统计周期（秒）
  totalLoads: number          // 总加载次数
  avgLoadTime: number         // 平均加载时间
  cacheHitRate: number        // 缓存命中率
  errorRate: number           // 错误率
  slowestComponents: Array<{  // 最慢组件
    name: string
    count: number
    avgLoadTime: number
  }>
  popularComponents: Array<{  // 热门组件
    name: string
    count: number
  }>
}
```

---

## 🎯 最佳实践

### 1. 组件注册

```typescript
import { registerComponent } from '@smartabp/lowcode-shared'

// ✅ 推荐：完整的元数据
registerComponent({
  name: 'SmartForm',
  displayName: '智能表单',
  category: 'form',
  priority: 'high',
  dependencies: ['BaseComponent'],
  bundle: '@smartabp/lowcode-core',
  lazy: true,
  preload: false,
  version: '1.0.0',
  tags: ['form', 'input', 'validation']
})

// ❌ 不推荐：最小化元数据
registerComponent({
  name: 'MyComponent',
  displayName: '我的组件',
  category: 'misc',
  bundle: '@smartabp/lowcode-core'
})
```

### 2. 类型声明使用

```typescript
// ✅ 推荐：启用IDE智能提示
import { Components } from '@smartabp/lowcode-shared'

// TypeScript会自动提示所有可用组件
const form = Components.SmartForm // ✨ 自动补全

// ❌ 不推荐：绕过类型系统
const form = (Components as any)['SmartForm']
```

### 3. 性能优化

```typescript
// ✅ 推荐：使用预加载
import { Components } from '@smartabp/lowcode-shared'

// 路由切换前预加载
router.beforeEach(async (to, from, next) => {
  const optimizer = globalPerformanceOptimizer
  const predictions = optimizer.predictNextComponents({
    currentRoute: to.path
  })
  
  await Promise.all(
    predictions.map(name => Components[name])
  )
  
  next()
})
```

### 4. 插件开发

```typescript
// ✅ 推荐：完整的插件实现
export class MyPlugin implements Plugin {
  metadata = {
    id: 'my.plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'A custom plugin',
    dependencies: [], // 声明依赖
    enabled: true
  }

  async install(manager: PluginManager) {
    // 初始化逻辑
  }

  async uninstall() {
    // 清理逻辑
  }

  hooks = {
    afterComponentLoad: async (context) => {
      // 钩子处理
    }
  }
}
```

---

## 🔧 故障排查

### 常见问题

#### Q1: 组件加载失败

```typescript
// 检查组件是否已注册
import { globalComponentRegistry } from '@smartabp/lowcode-shared'

const metadata = globalComponentRegistry.getMetadata('SmartForm')
if (!metadata) {
  console.error('组件未注册')
}
```

#### Q2: 类型提示不生效

```bash
# 重新生成类型文件
npm run type-gen

# 重启TypeScript服务器
# VSCode: Ctrl+Shift+P > TypeScript: Restart TS Server
```

#### Q3: 插件钩子不触发

```typescript
// 检查插件状态
const plugin = globalPluginManager.getPlugin('my.plugin')
console.log(plugin?.status) // 应为 'enabled'

// 检查钩子注册
const stats = globalPluginManager.getStats()
console.log(stats)
```

---

## 📚 相关文档

- [微AI 2.0 详细开发计划](./微AI2.0详细开发计划.md)
- [微AI 2.0 使用指南](./微AI2.0使用指南.md)
- [微AI 2.0 阶段4实施报告](./微AI2.0阶段4实施报告.md)
- [最佳实践指南](./微AI2.0最佳实践.md)

---

**微AI 2.0 - 让组件管理像C#程序集一样优雅！** 🚀

