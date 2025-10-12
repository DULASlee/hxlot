# 🤖 微AI 2.0自动组件发现 - 使用指南

> 从半自动驾驶到全自动驾驶 - 智能组件发现与注册系统

## 📋 目录

- [概述](#概述)
- [核心特性](#核心特性)
- [快速开始](#快速开始)
- [配置选项](#配置选项)
- [工作原理](#工作原理)
- [使用场景](#使用场景)
- [性能优化](#性能优化)
- [故障排查](#故障排查)

---

## 🎯 概述

微AI 2.0是SmartAbp低代码平台的智能组件发现系统，提供：

- 🔍 **自动扫描** - 智能扫描项目文件，发现Vue组件
- 🧠 **AI分析** - 使用AI技术分析组件结构和依赖
- 📦 **自动注册** - 自动注册到ComponentRegistry
- ⚡ **热更新** - 开发模式下实时监控文件变化
- 🎯 **零干预** - 无需手动编写注册代码

---

## ✨ 核心特性

### 1. 智能文件扫描

```typescript
// 支持多种文件模式
patterns: [
  'src/components/**/*.vue',           // 主应用组件
  'packages/*/src/components/**/*.vue', // packages组件
  'src/views/**/*.vue'                  // 页面组件
]
```

### 2. AI智能分析

自动分析组件：
- 提取组件名称
- 分析Props和Emits
- 识别依赖关系
- 推断组件分类
- 生成元数据

### 3. 增量更新

- 只扫描变化的文件
- 使用文件哈希检测变化
- 智能缓存机制
- 最小化性能影响

### 4. 内存管理

- 自动内存监控
- 超限自动清理
- LRU缓存策略
- 可配置内存上限

---

## 🚀 快速开始

### 基础使用

```typescript
// main.ts
import { AutoComponentDiscoveryEngine } from '@smartabp/lowcode-shared'

if (import.meta.env.DEV) {
  const autoDiscovery = new AutoComponentDiscoveryEngine()
  await autoDiscovery.start()
  console.log('🤖 微AI 2.0已启动')
}
```

### 自定义配置

```typescript
const autoDiscovery = new AutoComponentDiscoveryEngine({
  // 扫描模式
  patterns: [
    'src/components/**/*.vue',
    'packages/*/src/components/**/*.vue'
  ],
  
  // 排除目录
  excludes: [
    'node_modules',
    'dist',
    '.git',
    'coverage',
    'tests'
  ],
  
  // 热更新
  hotReload: true,
  
  // 扫描间隔（5分钟）
  scanIntervalMs: 5 * 60 * 1000,
  
  // 内存限制（200MB）
  maxMemoryMB: 200
})

await autoDiscovery.start()
```

---

## ⚙️ 配置选项

### AutoDiscoveryConfig

```typescript
interface AutoDiscoveryConfig {
  /** 扫描的文件模式 */
  patterns: string[]
  
  /** 排除的目录 */
  excludes: string[]
  
  /** 是否启用热更新 */
  hotReload: boolean
  
  /** 扫描间隔（毫秒） */
  scanIntervalMs: number
  
  /** 最大内存使用（MB） */
  maxMemoryMB: number
}
```

### 默认配置

```typescript
{
  patterns: [
    'src/components/**/*.vue',
    'src/SmartAbp.Vue/packages/*/src/components/**/*.vue',
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
  scanIntervalMs: 5 * 60 * 1000,  // 5分钟
  maxMemoryMB: 200
}
```

---

## 🔧 工作原理

### 1. 文件扫描

```
启动 → 扫描文件 → 匹配模式 → 排除目录 → 生成文件列表
```

### 2. 组件分析

```
读取文件 → 解析Vue SFC → 提取信息 → AI分析 → 生成元数据
```

### 3. 自动注册

```
生成元数据 → 验证依赖 → 注册到Registry → 触发回调 → 完成
```

### 4. 热更新监控

```
监听文件变化 → 检测修改 → 重新分析 → 更新注册 → 通知应用
```

### 流程图

```
┌─────────────┐
│  启动引擎   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  扫描文件   │◄─────┐
└──────┬──────┘      │
       │             │
       ▼             │
┌─────────────┐      │
│  AI分析     │      │
└──────┬──────┘      │
       │             │
       ▼             │
┌─────────────┐      │
│  自动注册   │      │
└──────┬──────┘      │
       │             │
       ▼             │
┌─────────────┐      │
│  热更新监控 │──────┘
└─────────────┘
```

---

## 💼 使用场景

### 场景1：开发模式自动注册

```typescript
// main.ts
if (import.meta.env.DEV) {
  const autoDiscovery = new AutoComponentDiscoveryEngine({
    hotReload: true,
    scanIntervalMs: 5 * 60 * 1000
  })
  
  await autoDiscovery.start()
  
  // 新建组件后，5分钟内自动发现并注册
}
```

### 场景2：构建时组件发现

```typescript
// scripts/build-time-discovery.js
import { AutoComponentDiscoveryEngine } from '@smartabp/lowcode-shared'

const autoDiscovery = new AutoComponentDiscoveryEngine({
  hotReload: false,
  scanIntervalMs: 0  // 只扫描一次
})

await autoDiscovery.start()

// 生成组件注册代码
const components = autoDiscovery.getDiscoveredComponents()
generateRegistrationCode(components)
```

### 场景3：CLI工具

```bash
# 手动触发组件发现
npm run discover-components

# 输出发现的组件列表
npm run discover-components -- --list

# 生成注册代码
npm run discover-components -- --generate
```

---

## ⚡ 性能优化

### 1. 增量扫描

```typescript
// 只扫描变化的文件
const autoDiscovery = new AutoComponentDiscoveryEngine({
  incrementalScan: true  // 启用增量扫描
})
```

### 2. 内存控制

```typescript
// 设置合理的内存限制
const autoDiscovery = new AutoComponentDiscoveryEngine({
  maxMemoryMB: 200,  // 200MB限制
  enableMemoryMonitoring: true
})

// 监听内存警告
autoDiscovery.on('memory-warning', (usage) => {
  console.warn('内存使用接近限制:', usage)
})
```

### 3. 扫描频率

```typescript
// 根据项目大小调整扫描频率
const autoDiscovery = new AutoComponentDiscoveryEngine({
  // 小项目：更频繁扫描
  scanIntervalMs: 2 * 60 * 1000,  // 2分钟
  
  // 大项目：降低扫描频率
  scanIntervalMs: 10 * 60 * 1000  // 10分钟
})
```

### 4. 排除不必要的目录

```typescript
const autoDiscovery = new AutoComponentDiscoveryEngine({
  excludes: [
    'node_modules',
    'dist',
    'coverage',
    'docs',
    'examples',
    'tests',
    '__tests__',
    '.git',
    '.vscode'
  ]
})
```

---

## 🔍 故障排查

### 问题1：组件未被发现

**症状**：
```
AutoComponentDiscovery started but component 'MyComponent' not found
```

**解决方案**：
```typescript
// 1. 检查文件路径是否匹配
const autoDiscovery = new AutoComponentDiscoveryEngine({
  patterns: [
    'src/components/**/*.vue',  // 确保路径正确
  ]
})

// 2. 检查是否被排除
const autoDiscovery = new AutoComponentDiscoveryEngine({
  excludes: [
    'node_modules',
    // 确保没有排除目标目录
  ]
})

// 3. 启用调试日志
autoDiscovery.enableDebug(true)
await autoDiscovery.start()
```

### 问题2：内存占用过高

**症状**：
```
Memory usage exceeds limit: 250MB / 200MB
```

**解决方案**：
```typescript
// 方案1：增加内存限制
const autoDiscovery = new AutoComponentDiscoveryEngine({
  maxMemoryMB: 500
})

// 方案2：减少扫描频率
const autoDiscovery = new AutoComponentDiscoveryEngine({
  scanIntervalMs: 10 * 60 * 1000  // 10分钟
})

// 方案3：启用增量扫描
const autoDiscovery = new AutoComponentDiscoveryEngine({
  incrementalScan: true
})
```

### 问题3：热更新不工作

**症状**：
```
File changed but component not updated
```

**解决方案**：
```typescript
// 1. 确保启用热更新
const autoDiscovery = new AutoComponentDiscoveryEngine({
  hotReload: true
})

// 2. 检查文件监听
autoDiscovery.on('file-changed', (file) => {
  console.log('文件变化:', file)
})

// 3. 手动触发扫描
await autoDiscovery.scan()
```

### 问题4：AI分析失败

**症状**：
```
AI analysis failed for component 'MyComponent'
```

**解决方案**：
```typescript
// 1. 检查组件格式
// ✅ 正确：标准Vue SFC
<template>
  <div>My Component</div>
</template>

<script setup lang="ts">
// ...
</script>

// ❌ 错误：非标准格式
// 确保组件符合Vue 3规范

// 2. 启用详细日志
autoDiscovery.enableVerboseLogging(true)

// 3. 手动注册失败的组件
registerComponent({
  name: 'MyComponent',
  // ...
})
```

---

## 📊 监控和调试

### 获取发现的组件

```typescript
// 获取所有发现的组件
const components = autoDiscovery.getDiscoveredComponents()
console.log('发现的组件:', components)

// 获取统计信息
const stats = autoDiscovery.getStatistics()
console.log('扫描统计:', stats)
```

### 事件监听

```typescript
// 监听组件发现事件
autoDiscovery.on('component-discovered', (component) => {
  console.log('发现新组件:', component.name)
})

// 监听注册事件
autoDiscovery.on('component-registered', (component) => {
  console.log('组件已注册:', component.name)
})

// 监听错误事件
autoDiscovery.on('error', (error) => {
  console.error('发现错误:', error)
})
```

### 性能监控

```typescript
// 启用性能监控
autoDiscovery.enablePerformanceMonitoring(true)

// 获取性能报告
const report = autoDiscovery.getPerformanceReport()
console.log('扫描时间:', report.scanTime)
console.log('分析时间:', report.analysisTime)
console.log('注册时间:', report.registrationTime)
```

---

## 🔗 相关资源

- [AutoComponentDiscovery API文档](https://docs.smartabp.com/api/auto-discovery)
- [ComponentRegistry使用指南](./component-registry-guide.md)
- [TurboAnalysisEngine文档](https://docs.smartabp.com/api/turbo-engine)
- [架构设计文档](../架构设计/SmartAbp企业级低代码引擎系统架构说明书.md)

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

