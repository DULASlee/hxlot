# SmartAbp 装配件系统

企业级装配件管理系统，支持动态模块加载、依赖管理、健康检查和插件扩展。

## 功能特性

- ✅ **动态模块加载** - 支持运行时加载和卸载装配件
- ✅ **依赖管理** - 自动处理装配件间的依赖关系
- ✅ **健康检查** - 实时监控装配件状态
- ✅ **插件系统** - 可扩展的插件架构
- ✅ **配置管理** - 支持多种存储后端
- ✅ **事件系统** - 完整的事件生命周期管理
- ✅ **类型安全** - 完整的TypeScript支持
- ✅ **性能监控** - 内置性能指标收集

## 快速开始

### 安装

```bash
npm install @smartabp/assembly-system
```

### 基本用法

```typescript
import { createDefaultAssemblyManager } from '@/core/assembly'

// 创建装配件管理器
const manager = await createDefaultAssemblyManager()

// 注册装配件
await manager.registerAssembly({
  name: 'my-assembly',
  version: '1.0.0',
  type: 'module',
  entry: './assemblies/my-assembly.js',
  enabled: true,
  dependencies: [],
  metadata: {
    description: '我的装配件',
    author: '开发者',
    category: 'utility'
  }
})

// 加载装配件
const instance = await manager.loadAssembly('my-assembly')

// 使用装配件
const result = await instance.execute({ data: 'test' })

// 卸载装配件
await manager.unloadAssembly('my-assembly')
```

## 核心概念

### 装配件配置 (AssemblyConfig)

装配件的配置定义：

```typescript
interface AssemblyConfig {
  name: string           // 唯一标识符
  version: string        // 版本号
  type: 'module' | 'component' | 'service'  // 装配件类型
  entry: string          // 入口文件路径或URL
  enabled: boolean       // 是否启用
  dependencies: string[] // 依赖的装配件名称
  metadata: Metadata     // 元数据信息
  config: any           // 配置选项
}
```

### 装配件实例 (AssemblyInstance)

加载后的装配件实例：

```typescript
interface AssemblyInstance {
  name: string
  config: AssemblyConfig
  loaded: boolean
  enabled: boolean
  instance: any
  error?: Error
}
```

### 事件系统

装配件系统提供完整的事件生命周期：

```typescript
// 监听特定事件
manager.on('loaded', (event) => {
  console.log(`装配件 ${event.assemblyName} 加载完成`)
})

// 监听所有事件
manager.on('*', (event) => {
  console.log(`事件: ${event.type} - ${event.assemblyName}`)
})
```

支持的事件类型：
- `registered` - 装配件注册
- `unregistered` - 装配件注销
- `loading` - 开始加载
- `loaded` - 加载完成
- `unloading` - 开始卸载
- `unloaded` - 卸载完成
- `enabled` - 启用
- `disabled` - 禁用
- `error` - 错误发生
- `health-changed` - 健康状态变化

## 插件系统

### 内置插件

系统提供多个内置插件：

```typescript
import { 
  LoggingPlugin, 
  PerformancePlugin, 
  SecurityPlugin 
} from '@/core/assembly/plugins'

// 安装插件
const pluginManager = new PluginManager(manager)
pluginManager.install(new LoggingPlugin({ logLevel: 'info' }))
pluginManager.install(new PerformancePlugin())
pluginManager.install(new SecurityPlugin())
```

### 自定义插件

创建自定义插件：

```typescript
import { AssemblyPlugin } from '@/core/assembly/plugins'

class MyPlugin implements AssemblyPlugin {
  name = 'my-plugin'
  version = '1.0.0'

  install(manager) {
    // 插件安装逻辑
    manager.on('loaded', this.handleLoaded.bind(this))
  }

  uninstall() {
    // 插件卸载逻辑
  }

  private handleLoaded(event) {
    console.log('装配件加载:', event.assemblyName)
  }
}
```

## 存储适配器

### 本地存储 (LocalStorage)

```typescript
const manager = await createAssemblyManager({
  storage: {
    type: 'localStorage',
    options: {
      prefix: 'assembly_'
    }
  }
})
```

### IndexedDB 存储

```typescript
const manager = await createAssemblyManager({
  storage: {
    type: 'indexedDB',
    options: {
      database: 'assembly_db',
      version: 1
    }
  }
})
```

### 远程存储

```typescript
const manager = await createAssemblyManager({
  storage: {
    type: 'remote',
    options: {
      baseUrl: 'https://api.example.com/assemblies',
      authToken: 'your-token'
    }
  }
})
```

## 依赖管理

### 依赖图分析

```typescript
// 构建依赖图
const graph = manager.buildDependencyGraph()

// 检查循环依赖
if (graph.hasCycles) {
  console.warn('检测到循环依赖')
}

// 获取根节点（无依赖的装配件）
console.log('根装配件:', graph.roots.map(node => node.name))
```

### 拓扑排序

```typescript
import { topologicalSort } from '@/core/assembly/utils'

const sorted = topologicalSort(graph)
console.log('加载顺序:', sorted)
```

## 健康检查

### 手动检查

```typescript
const health = await manager.checkAssemblyHealth('my-assembly')
console.log('健康状态:', health.status)
console.log('详细信息:', health.details)
```

### 自动监控

```typescript
// 启用健康检查（默认开启）
const manager = await createAssemblyManager({
  enableHealthChecks: true,
  healthCheckInterval: 30000 // 30秒检查一次
})
```

## 高级功能

### 装配件热重载

```typescript
// 重新加载装配件（保持状态）
const newInstance = await manager.reloadAssembly('my-assembly')
```

### 批量操作

```typescript
// 批量加载装配件
const instances = await Promise.all(
  ['assembly1', 'assembly2', 'assembly3'].map(name => 
    manager.loadAssembly(name)
  )
)

// 批量卸载
await Promise.all(
  instances.map(instance => 
    manager.unloadAssembly(instance.name)
  )
)
```

### 装配件隔离

```typescript
// 创建独立的装配件管理器实例
const isolatedManager = await createAssemblyManager({
  storage: {
    type: 'localStorage',
    options: {
      prefix: 'isolated_'
    }
  }
})
```

## 错误处理

### 异常捕获

```typescript
try {
  await manager.loadAssembly('problematic-assembly')
} catch (error) {
  console.error('加载失败:', error)
  
  // 获取详细的错误信息
  const instance = manager.getAssembly('problematic-assembly')
  if (instance && instance.error) {
    console.error('具体错误:', instance.error)
  }
}
```

### 重试机制

```typescript
const manager = await createAssemblyManager({
  loaderOptions: {
    retryCount: 3,
    retryDelay: 1000
  }
})
```

## 性能优化

### 缓存策略

```typescript
const manager = await createAssemblyManager({
  loaderOptions: {
    cacheEnabled: true,
    cacheTTL: 300000 // 5分钟缓存
  }
})
```

### 懒加载

```typescript
// 禁用自动加载，按需加载装配件
const manager = await createAssemblyManager({
  autoLoad: false
})

// 在需要时加载
await manager.loadAssembly('heavy-assembly')
```

## 示例

### 创建简单的装配件

```typescript
// assemblies/simple-assembly.js
export class SimpleAssembly {
  async initialize() {
    console.log('SimpleAssembly 初始化')
  }

  async execute(data) {
    return { result: `处理数据: ${data}` }
  }

  async healthCheck() {
    return { status: 'healthy' }
  }
}
```

### 使用装配件系统

```typescript
import { createDefaultAssemblyManager } from '@/core/assembly'

async function demo() {
  const manager = await createDefaultAssemblyManager()
  
  // 注册装配件
  await manager.registerAssembly({
    name: 'simple-assembly',
    version: '1.0.0',
    type: 'module',
    entry: './assemblies/simple-assembly.js',
    enabled: true
  })
  
  // 加载并使用
  const instance = await manager.loadAssembly('simple-assembly')
  const result = await instance.instance.execute('测试数据')
  
  console.log('执行结果:', result)
}

demo()
```

## API 参考

### AssemblyManager 类

主要方法：
- `registerAssembly(config)` - 注册装配件
- `unregisterAssembly(name)` - 注销装配件
- `loadAssembly(name)` - 加载装配件
- `unloadAssembly(name)` - 卸载装配件
- `reloadAssembly(name)` - 重新加载装配件
- `enableAssembly(name)` - 启用装配件
- `disableAssembly(name)` - 禁用装配件
- `getAssembly(name)` - 获取装配件实例
- `checkAssemblyHealth(name)` - 健康检查
- `buildDependencyGraph()` - 构建依赖图

### 事件系统

事件类型：
- `registered`, `unregistered`
- `loading`, `loaded`, `unloading`, `unloaded`
- `enabled`, `disabled`
- `error`, `health-changed`

## 开发指南

### 项目结构

```
src/core/assembly/
├── index.ts              # 主入口
├── assembly-types.ts     # 类型定义
├── assembly-manager.ts   # 管理器实现
├── assembly-loader.ts    # 加载器实现
├── assembly-config.ts    # 配置管理
├── assembly-utils.ts     # 工具函数
├── storage-adapters/     # 存储适配器
│   ├── index.ts
│   ├── localStorage.ts
│   ├── indexedDB.ts
│   └── remote.ts
├── plugins/              # 插件系统
│   ├── index.ts
│   ├── logging.ts
│   ├── performance.ts
│   └── security.ts
├── components/           # Vue组件
│   └── AssemblyForm.vue
└── examples/             # 示例代码
    └── sample-assembly.ts
```

### 开发环境设置

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建项目
npm run build
```

## 许可证

MIT License

## 支持

如有问题或建议，请提交 Issue 或联系开发团队。