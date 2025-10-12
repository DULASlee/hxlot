# @smartabp/lowcode-shared

> SmartAbp低代码引擎共享包 - 企业级组件注册系统、类型系统和工具库

## 📦 安装

```bash
npm install @smartabp/lowcode-shared
# 或
pnpm add @smartabp/lowcode-shared
# 或
yarn add @smartabp/lowcode-shared
```

## 🚀 快速开始

```typescript
import { 
  registerSharedComponents,
  ComponentRegistry,
  AutoComponentDiscoveryEngine
} from '@smartabp/lowcode-shared'

// 注册共享组件
registerSharedComponents()

// 使用ComponentRegistry
const metadata = ComponentRegistry.getMetadata('SmartForm')

// 启动自动组件发现（开发模式）
const autoDiscovery = new AutoComponentDiscoveryEngine()
autoDiscovery.start()
```

## 📚 核心功能

### 1. 🏗️ 企业级组件注册系统

统一的组件注册、发现和管理中心：

```typescript
import { registerComponent, ComponentRegistry } from '@smartabp/lowcode-shared'

// 注册组件
registerComponent({
  name: 'MyComponent',
  displayName: '我的组件',
  category: 'custom',
  priority: 'high',
  bundle: '@my-org/my-package',
  version: '1.0.0'
})

// 获取组件元数据
const metadata = ComponentRegistry.getMetadata('MyComponent')

// 加载组件
const component = await ComponentRegistry.loadComponent('MyComponent')
```

### 2. 🤖 微AI 2.0自动组件发现

智能扫描和自动注册组件：

```typescript
import { AutoComponentDiscoveryEngine } from '@smartabp/lowcode-shared'

const autoDiscovery = new AutoComponentDiscoveryEngine({
  patterns: ['src/components/**/*.vue'],
  excludes: ['node_modules', 'dist'],
  hotReload: true,
  scanIntervalMs: 5 * 60 * 1000
})

await autoDiscovery.start()
```

### 3. 📋 统一类型系统

集中的类型定义和元数据管理：

```typescript
import type {
  ComponentCategory,
  LoadPriority,
  EntityMetadata,
  ModuleMetadata,
  UnifiedSchema
} from '@smartabp/lowcode-shared'
```

### 4. 🔧 工具函数库

```typescript
import {
  createLogger,
  debounce,
  throttle,
  deepClone,
  mergeDeep
} from '@smartabp/lowcode-shared'

const logger = createLogger({ context: 'MyApp' })
logger.info('Application started')
```

### 5. 🎨 UI组件库

基础UI组件：

- BaseComponent - 基础组件
- ErrorBoundary - 错误边界
- LoadingSpinner - 加载动画
- EmptyState - 空状态
- ... 等

## 🔧 依赖关系

```json
{
  "peerDependencies": {
    "@smartabp/metadata-core": "^1.0.0",
    "vue": "^3.3.0"
  }
}
```

## 📖 文档

- [完整文档](https://docs.smartabp.com/lowcode-shared)
- [组件注册指南](https://docs.smartabp.com/guides/component-registry)
- [微AI 2.0使用指南](https://docs.smartabp.com/guides/auto-discovery)

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](../../CONTRIBUTING.md)

## 📄 许可证

MIT © SmartAbp Team
