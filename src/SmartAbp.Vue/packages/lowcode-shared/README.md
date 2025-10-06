# @smartabp/lowcode-shared

> 🏗️ SmartAbp低代码引擎基础设施包 - 统一Schema v1.0.0 + 内存安全工具

## 📦 包概览

`@smartabp/lowcode-shared` 是SmartAbp低代码引擎的**核心基础设施包**，为所有其他低代码包提供统一的类型系统、工具函数、验证系统、缓存管理、内存监控等基础能力。

### 🎯 核心定位

- **🔥 统一Schema系统**: 前后端统一的元数据模型
- **✅ 验证系统**: 基于 `@smartabp/metadata-core` 的企业级验证
- **📦 版本管理**: Schema版本管理和兼容性检查
- **💾 缓存管理**: 高性能缓存系统
- **🧠 内存管理**: 全局内存监控和优化
- **🎨 主题系统**: 统一的主题管理
- **🔧 工具函数**: 高质量的工具函数库

### 📊 包统计

- **291个导出API** (types/functions/classes)
- **11个核心模块**
- **0技术债务** (0 TODO/FIXME)
- **100% TypeScript** (类型安全)
- **Tree-Shakable** (按需加载)

## 🚀 快速开始

### 安装

```bash
# 在Monorepo内部使用
pnpm add @smartabp/lowcode-shared@workspace:*
```

### 基础使用

```typescript
// 方式1: 导入所有功能（适合小项目）
import { UnifiedSchemaValidator, UnifiedCacheManager } from '@smartabp/lowcode-shared'

// 方式2: 按需导入（推荐，Tree-Shaking优化）
import { UnifiedSchemaValidator } from '@smartabp/lowcode-shared/validation'
import { UnifiedCacheManager } from '@smartabp/lowcode-shared/cache'
import { GlobalMemoryMonitor } from '@smartabp/lowcode-shared/memory'
```

## 📚 模块导出

### 🔍 验证系统 (`/validation`)

```typescript
import {
  UnifiedSchemaValidator,
  validateUnifiedEntity,
  validateUnifiedModule,
  checkEntityCompatibility,
  diffEntitySchema,
  type UnifiedValidationResult,
} from '@smartabp/lowcode-shared/validation'

// 验证实体
const result = await validateUnifiedEntity(entity)
if (!result.success) {
  console.error('验证失败:', result.errors)
}

// 兼容性检查
const compatibility = await checkEntityCompatibility(oldEntity, newEntity)
if (compatibility.hasBreakingChanges) {
  console.warn('发现破坏性变更:', compatibility.breakingChanges)
}

// Schema差异对比
const diff = await diffEntitySchema(oldEntity, newEntity)
const changelog = generateChangelog(diff)
```

### 📦 版本管理 (`/version`)

```typescript
import {
  SchemaVersionManager,
  useSchemaVersion,
  compareVersions,
  type SemanticVersion,
} from '@smartabp/lowcode-shared/version'

// Vue组件中使用
const { currentVersion, isOutdated, checkVersion } = useSchemaVersion()

// 版本比较
const result = compareVersions('1.0.0', '2.0.0')
// result: 'older' | 'same' | 'newer'
```

### 💾 缓存管理 (`/cache`)

```typescript
import { UnifiedCacheManager } from '@smartabp/lowcode-shared/cache'

const cache = new UnifiedCacheManager({
  maxSize: 1000,
  ttl: 5 * 60 * 1000, // 5分钟
})

// 设置缓存
cache.set('key', value, { ttl: 10000 })

// 获取缓存
const cachedValue = cache.get('key')

// 缓存统计
const stats = cache.getStats()
console.log(`命中率: ${stats.hitRate * 100}%`)
```

### 🧠 内存管理 (`/memory`)

```typescript
import { GlobalMemoryMonitor } from '@smartabp/lowcode-shared/memory'

const monitor = GlobalMemoryMonitor.getInstance()

// 启动监控
monitor.startMonitoring()

// 获取内存状态
const status = monitor.getMemoryStatus()
console.log(`内存使用: ${status.usedHeapSize / 1024 / 1024} MB`)

// 监听内存警告
monitor.on('warning', (warning) => {
  console.warn('内存警告:', warning.message)
})
```

### 🚀 事件系统 (`/events`)

```typescript
import { UnifiedEventBus } from '@smartabp/lowcode-shared/events'

const eventBus = new UnifiedEventBus()

// 订阅事件
eventBus.on('schema:updated', (data) => {
  console.log('Schema已更新:', data)
})

// 发布事件
eventBus.emit('schema:updated', { entityName: 'User' })
```

### 📋 日志系统 (`/logging`)

```typescript
import { LogPolicyManager } from '@smartabp/lowcode-shared/logging'

const logManager = new LogPolicyManager({
  level: 'info',
  maxLogs: 1000,
})

// 记录日志
logManager.log('info', 'Schema验证通过', { entityName: 'User' })

// 查询日志
const logs = logManager.query({ level: 'error' })
```

### 🔥 错误处理 (`/error`)

```typescript
import { GlobalErrorHandler } from '@smartabp/lowcode-shared/error'

const errorHandler = new GlobalErrorHandler({
  onError: (error, context) => {
    console.error('全局错误:', error)
  },
})

// 启用全局错误处理
errorHandler.install()
```

### 🎨 主题系统 (`/theme`)

```typescript
import { ThemeManager, type ThemeTokens } from '@smartabp/lowcode-shared/theme'

const themeManager = new ThemeManager()

// 切换主题
themeManager.setTheme('dark')

// 获取主题令牌
const tokens = themeManager.getTokens()
console.log('主色:', tokens.colors.primary)
```

### 🎣 Composables (`/composables`)

```typescript
import { useValidation } from '@smartabp/lowcode-shared/composables'

// Vue组件中使用
const {
  validate,
  errors,
  isValidating,
  validationSummary,
} = useValidation(entityRef, {
  realtime: true,
  debounce: 500,
})

// 触发验证
await validate()
```

### 🔧 工具函数 (`/utils`)

```typescript
import {
  camelCase,
  pascalCase,
  chunk,
  groupBy,
  deepClone,
  deepMerge,
} from '@smartabp/lowcode-shared/utils'

// 字符串工具
const className = camelCase('user-profile-card') // userProfileCard
const componentName = pascalCase('user-profile-card') // UserProfileCard

// 数组工具
const chunks = chunk([1, 2, 3, 4, 5], 2) // [[1,2], [3,4], [5]]
const grouped = groupBy(users, 'role') // { admin: [...], user: [...] }

// 对象工具
const cloned = deepClone(complexObject)
const merged = deepMerge(obj1, obj2)
```

### 📋 类型系统 (`/types`)

```typescript
import type {
  UnifiedModuleMetadata,
  UnifiedEntityDefinition,
  UnifiedEntityField,
  UnifiedValidationRule,
} from '@smartabp/lowcode-shared/types'

// 使用统一类型
const entity: UnifiedEntityDefinition = {
  name: 'User',
  displayName: '用户',
  fields: [...],
  // ...
}
```

### 🌐 国际化 (`/i18n`)

```typescript
import {
  translateValidationMessage,
  ValidationMessageKey,
} from '@smartabp/lowcode-shared/i18n'

// 翻译验证错误
const message = translateValidationMessage(
  ValidationMessageKey.REQUIRED,
  { field: '用户名' },
  'zh-CN'
)
// "用户名 不能为空"
```

## 🏗️ 包结构

```
@smartabp/lowcode-shared/
├── validation/          # 验证系统
├── version/            # 版本管理
├── cache/              # 缓存管理
├── memory/             # 内存监控
├── events/             # 事件总线
├── logging/            # 日志系统
├── error/              # 错误处理
├── theme/              # 主题系统
├── components/         # 组件基础
├── composables/        # Vue组合式API
├── utils/              # 工具函数
├── types/              # 类型定义
└── i18n/               # 国际化
```

## 🔧 构建配置

### Tsup配置

本包使用 `tsup` 构建，支持：

- ✅ ESM + CommonJS双格式
- ✅ TypeScript类型声明
- ✅ 代码分割（Code Splitting）
- ✅ Tree-Shaking优化
- ✅ Source Map支持

### 子路径导出 (Subpath Exports)

支持按需导入，优化包体积：

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./validation": "./dist/validation/index.js",
    "./cache": "./dist/cache/index.js",
    // ... 其他子模块
  }
}
```

## 📊 性能优化

### Tree-Shaking

```typescript
// ✅ 推荐：只导入需要的功能
import { camelCase } from '@smartabp/lowcode-shared/utils'

// ⚠️ 不推荐：导入整个包
import { camelCase } from '@smartabp/lowcode-shared'
```

### 缓存优化

```typescript
// 使用缓存减少重复计算
const cache = new UnifiedCacheManager()

function expensiveOperation(key: string) {
  const cached = cache.get(key)
  if (cached) return cached
  
  const result = /* 计算... */
  cache.set(key, result)
  return result
}
```

### 内存优化

```typescript
// 启用内存监控
const monitor = GlobalMemoryMonitor.getInstance()
monitor.startMonitoring({
  warningThreshold: 100 * 1024 * 1024, // 100MB
  criticalThreshold: 200 * 1024 * 1024, // 200MB
})
```

## 🧪 测试

```bash
# 运行测试
pnpm test

# 测试覆盖率
pnpm test:coverage

# 类型检查
pnpm type-check
```

## 📦 依赖关系

### 核心依赖

- `@smartabp/metadata-core` (workspace:*) - 元数据核心包
- `zod` (^4.1.11) - Schema验证库

### Peer依赖

- `vue` (^3.3.0) - Vue 3框架

## 🔗 相关包

- [`@smartabp/metadata-core`](../metadata-core) - 元数据核心包
- [`@smartabp/lowcode-core`](../lowcode-core) - 低代码核心引擎
- [`@smartabp/lowcode-designer`](../lowcode-designer) - 可视化设计器

## 📝 开发规范

### 导出规范

- ✅ 使用命名导出 (Named Exports)
- ✅ 类型使用 `type` 关键字导出
- ✅ 为每个模块创建独立的 `index.ts`
- ✅ 主包 `index.ts` 统一导出所有模块

### 类型安全

- ✅ 100% TypeScript覆盖
- ✅ 严格类型检查 (`strict: true`)
- ❌ 禁止 `as any`
- ❌ 禁止 `@ts-ignore`

### 性能要求

- ✅ 函数时间复杂度 ≤ O(n log n)
- ✅ 避免不必要的对象创建
- ✅ 使用缓存优化重复计算
- ✅ 大数据量使用流式处理

## 📄 License

MIT © SmartAbp Team

---

**🔥 打造业界顶尖的低代码基础设施包！**

