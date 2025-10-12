# 📚 SmartAbp组件注册系统 - 完整使用指南

> 企业级统一组件注册、发现和管理系统

## 📋 目录

- [概述](#概述)
- [核心概念](#核心概念)
- [快速开始](#快速开始)
- [组件注册](#组件注册)
- [组件使用](#组件使用)
- [微AI 2.0自动发现](#微ai-20自动发现)
- [最佳实践](#最佳实践)
- [故障排查](#故障排查)

---

## 🎯 概述

SmartAbp组件注册系统是一个企业级的统一组件管理解决方案，提供：

- ✅ **统一注册** - 所有组件通过ComponentRegistry集中注册
- ✅ **智能发现** - 微AI 2.0自动扫描和注册组件
- ✅ **元数据管理** - 完整的组件元数据和依赖关系
- ✅ **懒加载支持** - 按需加载，优化性能
- ✅ **热更新** - 开发模式下支持热更新
- ✅ **类型安全** - 完整的TypeScript类型定义

---

## 🏗️ 核心概念

### 1. ComponentRegistry

组件注册中心，负责：
- 组件注册和注销
- 组件元数据管理
- 组件加载和缓存
- 依赖关系解析

### 2. ComponentMetadata

组件元数据，包含：
- 基本信息（名称、显示名称、版本）
- 分类和标签
- 依赖关系
- 加载策略
- 权限控制

### 3. AutoComponentDiscovery

自动组件发现引擎，提供：
- 文件扫描
- AI智能分析
- 自动注册
- 热更新监控

---

## 🚀 快速开始

### 安装依赖

```bash
npm install @smartabp/lowcode-shared @smartabp/lowcode-core @smartabp/lowcode-designer
```

### 基础使用

```typescript
// main.ts
import { 
  registerSharedComponents,
  registerCoreComponents,
  registerDesignerComponents
} from '@smartabp/lowcode-shared'

// 按依赖顺序注册组件
registerSharedComponents()   // 1. 基础组件
registerCoreComponents()     // 2. 核心组件
registerDesignerComponents() // 3. 设计器组件

console.log('✅ 所有组件已注册')
```

---

## 📦 组件注册

### 方式1：手动注册（推荐用于核心组件）

```typescript
import { registerComponent } from '@smartabp/lowcode-shared'

registerComponent({
  // 基本信息
  name: 'SmartFormBuilder',
  displayName: '智能表单构建器',
  version: '1.0.0',
  
  // 分类和标签
  category: 'form',
  tags: ['form', 'builder', 'smart'],
  
  // 依赖关系
  dependencies: ['BaseComponent'],
  bundle: '@smartabp/lowcode-core',
  
  // 加载策略
  priority: 'high',
  lazy: false,
  preload: true,
  
  // 可选：组件实现
  component: () => import('./components/SmartFormBuilder.vue')
})
```

### 方式2：批量注册

```typescript
// packages/lowcode-core/src/index.ts
export function registerCoreComponents(): void {
  const components = [
    {
      name: 'SmartFormBuilder',
      displayName: '智能表单构建器',
      category: 'form',
      // ...
    },
    {
      name: 'WorkflowDesigner',
      displayName: '工作流设计器',
      category: 'workflow',
      // ...
    }
  ]
  
  components.forEach(config => registerComponent(config))
}
```

### 方式3：自动发现（推荐用于业务组件）

```typescript
// main.ts
import { AutoComponentDiscoveryEngine } from '@smartabp/lowcode-shared'

if (import.meta.env.DEV) {
  const autoDiscovery = new AutoComponentDiscoveryEngine({
    patterns: [
      'src/components/**/*.vue',
      'packages/*/src/components/**/*.vue'
    ],
    excludes: ['node_modules', 'dist'],
    hotReload: true
  })
  
  await autoDiscovery.start()
}
```

---

## 🎨 组件使用

### 方式1：通过ComponentRegistry加载

```typescript
import { ComponentRegistry } from '@smartabp/lowcode-shared'

// 获取组件元数据
const metadata = ComponentRegistry.getMetadata('SmartFormBuilder')

// 加载组件
const component = await ComponentRegistry.loadComponent('SmartFormBuilder')

// 在Vue中使用
<component :is="component" />
```

### 方式2：通过虚拟程序集（推荐）

```typescript
import { Components } from '@smartabp/lowcode-shared'

// 直接访问组件（自动加载）
const SmartForm = await Components.SmartForm
const WorkflowDesigner = await Components.WorkflowDesigner

// 在Vue中使用
<component :is="SmartForm" />
```

### 方式3：直接导入（不推荐）

```typescript
// ❌ 不推荐：绕过ComponentRegistry
import SmartForm from './components/SmartForm.vue'

// ✅ 推荐：通过ComponentRegistry
import { Components } from '@smartabp/lowcode-shared'
const SmartForm = await Components.SmartForm
```

---

## 🤖 微AI 2.0自动发现

### 配置选项

```typescript
interface AutoDiscoveryConfig {
  // 扫描模式
  patterns: string[]          // 文件匹配模式
  excludes: string[]          // 排除目录
  
  // 热更新
  hotReload: boolean          // 是否启用热更新
  scanIntervalMs: number      // 扫描间隔（毫秒）
  
  // 性能控制
  maxMemoryMB: number         // 最大内存使用
}
```

### 启动自动发现

```typescript
import { AutoComponentDiscoveryEngine } from '@smartabp/lowcode-shared'

const autoDiscovery = new AutoComponentDiscoveryEngine({
  patterns: [
    'src/SmartAbp.Vue/packages/*/src/components/**/*.vue',
    'src/components/**/*.vue',
    'src/views/**/*.vue'
  ],
  excludes: [
    'node_modules',
    'dist',
    '.git',
    'coverage',
    'tests'
  ],
  hotReload: true,
  scanIntervalMs: 5 * 60 * 1000, // 5分钟
  maxMemoryMB: 200
})

// 启动
await autoDiscovery.start()

// 停止
autoDiscovery.stop()

// 获取发现的组件
const discovered = autoDiscovery.getDiscoveredComponents()
```

### AI智能分析

自动发现引擎会使用AI分析组件：
- 自动提取组件名称
- 分析组件依赖关系
- 推断组件分类
- 生成组件元数据
- 自动注册到ComponentRegistry

---

## 💡 最佳实践

### 1. 组件命名规范

```typescript
// ✅ 推荐：使用PascalCase
registerComponent({ name: 'SmartFormBuilder' })

// ❌ 不推荐：使用kebab-case
registerComponent({ name: 'smart-form-builder' })
```

### 2. 依赖声明

```typescript
// ✅ 推荐：明确声明依赖
registerComponent({
  name: 'AdvancedForm',
  dependencies: ['BaseComponent', 'SmartFormBuilder']
})

// ❌ 不推荐：不声明依赖
registerComponent({
  name: 'AdvancedForm',
  dependencies: []
})
```

### 3. 懒加载策略

```typescript
// ✅ 推荐：大型组件使用懒加载
registerComponent({
  name: 'HeavyComponent',
  lazy: true,
  component: () => import('./HeavyComponent.vue')
})

// ✅ 推荐：核心组件预加载
registerComponent({
  name: 'CoreComponent',
  lazy: false,
  preload: true
})
```

### 4. 分类管理

```typescript
// ✅ 推荐：使用标准分类
const categories = [
  'form',      // 表单组件
  'data',      // 数据组件
  'chart',     // 图表组件
  'layout',    // 布局组件
  'business',  // 业务组件
  'workflow',  // 工作流组件
  'designer'   // 设计器组件
]
```

### 5. 版本管理

```typescript
// ✅ 推荐：使用语义化版本
registerComponent({
  name: 'MyComponent',
  version: '1.2.3'
})

// 检查版本兼容性
const metadata = ComponentRegistry.getMetadata('MyComponent')
if (metadata.version !== '1.2.3') {
  console.warn('版本不匹配')
}
```

---

## 🔧 故障排查

### 问题1：组件未注册

**症状**：
```
Error: Component 'MyComponent' not found in registry
```

**解决方案**：
```typescript
// 1. 检查是否已注册
const metadata = ComponentRegistry.getMetadata('MyComponent')
console.log('组件元数据:', metadata)

// 2. 检查注册顺序
registerSharedComponents()   // 必须先注册
registerCoreComponents()     // 再注册核心
registerDesignerComponents() // 最后注册设计器

// 3. 检查组件名称拼写
registerComponent({ name: 'MyComponent' }) // 注意大小写
```

### 问题2：循环依赖

**症状**：
```
Error: Circular dependency detected: A -> B -> A
```

**解决方案**：
```typescript
// ❌ 错误：循环依赖
registerComponent({
  name: 'ComponentA',
  dependencies: ['ComponentB']
})
registerComponent({
  name: 'ComponentB',
  dependencies: ['ComponentA']
})

// ✅ 正确：重新设计依赖关系
registerComponent({
  name: 'BaseComponent',
  dependencies: []
})
registerComponent({
  name: 'ComponentA',
  dependencies: ['BaseComponent']
})
registerComponent({
  name: 'ComponentB',
  dependencies: ['BaseComponent']
})
```

### 问题3：自动发现不工作

**症状**：
```
AutoComponentDiscovery started but no components found
```

**解决方案**：
```typescript
// 1. 检查文件模式
const autoDiscovery = new AutoComponentDiscoveryEngine({
  patterns: [
    'src/components/**/*.vue',  // 确保路径正确
    '!src/components/**/*.test.vue'  // 排除测试文件
  ]
})

// 2. 检查是否在开发模式
if (import.meta.env.DEV) {
  await autoDiscovery.start()
}

// 3. 启用调试日志
autoDiscovery.enableDebug(true)
```

### 问题4：内存占用过高

**症状**：
```
Memory usage exceeds limit: 250MB / 200MB
```

**解决方案**：
```typescript
// 1. 增加内存限制
const autoDiscovery = new AutoComponentDiscoveryEngine({
  maxMemoryMB: 500  // 增加到500MB
})

// 2. 减少扫描频率
const autoDiscovery = new AutoComponentDiscoveryEngine({
  scanIntervalMs: 10 * 60 * 1000  // 改为10分钟
})

// 3. 排除更多目录
const autoDiscovery = new AutoComponentDiscoveryEngine({
  excludes: [
    'node_modules',
    'dist',
    'coverage',
    'docs',
    'examples'
  ]
})
```

---

## 📊 监控和调试

### 查看已注册组件

```typescript
import { ComponentRegistry } from '@smartabp/lowcode-shared'

// 获取所有组件
const allComponents = ComponentRegistry.getAllComponents()
console.log('已注册组件:', allComponents)

// 按分类查询
const formComponents = ComponentRegistry.getComponentsByCategory('form')
console.log('表单组件:', formComponents)

// 按标签查询
const smartComponents = ComponentRegistry.getComponentsByTag('smart')
console.log('智能组件:', smartComponents)
```

### 性能监控

```typescript
// 启用性能监控
ComponentRegistry.enablePerformanceMonitoring(true)

// 获取性能报告
const report = ComponentRegistry.getPerformanceReport()
console.log('组件加载时间:', report.loadTimes)
console.log('内存使用:', report.memoryUsage)
```

---

## 🔗 相关资源

- [ComponentRegistry API文档](https://docs.smartabp.com/api/component-registry)
- [AutoComponentDiscovery API文档](https://docs.smartabp.com/api/auto-discovery)
- [架构设计文档](../架构设计/SmartAbp企业级低代码引擎系统架构说明书.md)
- [ADR-0005: 低代码引擎架构](../架构设计/adr/0005-低代码引擎架构.md)

---

## 📞 支持

如有问题，请：
- 提交Issue: https://github.com/smartabp/hxlot/issues
- 查看文档: https://docs.smartabp.com
- 联系团队: support@smartabp.com

---

**最后更新**: 2025-10-12  
**版本**: v1.0.0  
**维护者**: SmartAbp Team

