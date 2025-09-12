# ADR-0013: 插件化策略架构设计

## 状态
已接受

## 上下文
P1阶段需要支持多前端框架(Vue.js、React)的代码生成，要求架构具备高度可扩展性，支持策略模式解耦，实现插件化架构。

## 决策
采用策略模式(Strategy Pattern)实现插件化代码生成架构，支持运行时策略注册和切换。

### 核心设计

#### 1. 策略接口定义
```typescript
export interface IGenerationStrategy {
  name: string
  version: string
  supportedFrameworks: string[]
  
  generateRoutes(manifests: EnterpriseManifest[], context: GenerationContext): Promise<GeneratedFile[]>
  generateStores(manifests: EnterpriseManifest[], context: GenerationContext): Promise<GeneratedFile[]>
  generateLifecycles(manifests: EnterpriseManifest[], context: GenerationContext): Promise<GeneratedFile[]>
  generatePolicies(manifests: EnterpriseManifest[], context: GenerationContext): Promise<GeneratedFile[]>
  
  validate(manifests: EnterpriseManifest[]): Promise<ValidationResult>
  cleanup(): Promise<void>
}
```

#### 2. Vue.js策略实现
- **路由生成**: 支持懒加载、权限检查、依赖预加载
- **Store生成**: Pinia集成，支持开发工具和调试
- **生命周期**: Vue应用生命周期钩子管理
- **权限策略**: Composition API权限检查，指令支持

#### 3. React策略实现
- **路由生成**: React Router v6，Suspense懒加载
- **Store生成**: Redux Toolkit，TypeScript支持
- **生命周期**: React组件生命周期管理
- **权限策略**: Hook-based权限检查

#### 4. 策略管理器
```typescript
export class PluginableStrategyManager {
  private strategies = new Map<string, IGenerationStrategy>()
  private activeStrategies = new Set<string>()

  registerStrategy(strategy: IGenerationStrategy): void
  unregisterStrategy(name: string): void
  async generateAll(manifests: EnterpriseManifest[], context: GenerationContext): Promise<void>
  async validateAll(manifests: EnterpriseManifest[]): Promise<boolean>
}
```

### 架构优势

#### 1. 高度解耦
- 策略独立实现，互不影响
- 支持运行时动态加载和卸载
- 清晰的接口契约，易于测试

#### 2. 可扩展性
- 新框架支持只需实现策略接口
- 支持第三方策略插件
- 版本化策略管理

#### 3. 并行处理
```typescript
// 并行执行各策略
const tasks = Array.from(requiredFrameworks).map(async (framework) => {
  const strategy = this.strategies.get(framework)
  const frameworkContext = { ...context, framework }
  
  // 并行生成各类型文件
  await Promise.all([
    strategy.generateRoutes(frameworkManifests, frameworkContext),
    strategy.generateStores(frameworkManifests, frameworkContext),
    strategy.generateLifecycles(frameworkManifests, frameworkContext),
    strategy.generatePolicies(frameworkManifests, frameworkContext)
  ])
})

await Promise.all(tasks)
```

### Vue.js策略特性

#### 路由生成
```typescript
// 支持懒加载和权限检查
const componentImport = route.meta?.lazyLoad 
  ? `defineAsyncComponent(() => import('${route.component}'))`
  : `() => import('${route.component}')`

// 路由守卫集成
beforeEnter: [
  ${route.meta?.policy ? `checkPolicy('${route.meta.policy}')` : ''},
  ${route.meta?.preload ? 'preloadDependencies' : ''}
].filter(Boolean)
```

#### Store生成
```typescript
// Pinia集成和开发工具支持
export const pinia = createPinia()

if (import.meta.env.DEV) {
  pinia.use(({ store }: PiniaPluginContext) => {
    store.$subscribe((mutation, state) => {
      console.log(`[Store] ${mutation.storeId}: ${mutation.type}`, mutation)
    })
  })
}
```

#### 权限策略
```typescript
// Composition API权限检查
export function usePermissions() {
  const policyService = inject(POLICY_SERVICE_KEY)
  
  return {
    hasPolicy: (policy: string) => policyService.hasPolicy(policy),
    hasAnyPolicy: (policies: string[]) => policyService.hasAnyPolicy(policies),
    canAccess: (policy?: string) => policy ? policyService.hasPolicy(policy) : true
  }
}

// Vue指令支持
export const vPermission = {
  mounted(el: HTMLElement, binding: { value: string | string[] }) {
    const policies = Array.isArray(binding.value) ? binding.value : [binding.value]
    const hasPermission = policyService.hasAnyPolicy(policies)
    
    if (!hasPermission) {
      el.style.display = 'none'
    }
  }
}
```

### React策略特性

#### 路由生成
```typescript
// React Router v6 + Suspense
{
  id: 'user-list',
  path: '/users',
  element: <Suspense fallback={<div>Loading...</div>}>
    <UserListComponent />
  </Suspense>,
  loader: async ({ params }) => {
    await checkPolicy('User.Read')
    return { params }
  }
}
```

#### Store生成
```typescript
// Redux Toolkit配置
export const reactStore = configureStore({
  reducer: {
    users: usersSlice.reducer,
    auth: authSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
})
```

## 结果
- **多框架支持**: 统一接口支持Vue.js和React
- **高性能**: 并行生成，策略独立优化
- **可维护**: 清晰的策略分离，易于调试和测试
- **可扩展**: 支持第三方策略插件
- **类型安全**: 完整的TypeScript类型定义

## 实现指南

### 添加新策略
1. 实现`IGenerationStrategy`接口
2. 注册到策略管理器
3. 添加框架特定的生成逻辑
4. 实现验证和清理方法

### 策略验证
```typescript
async validate(manifests: EnterpriseManifest[]): Promise<ValidationResult> {
  const errors: string[] = []
  const warnings: string[] = []
  
  // 框架特定验证逻辑
  for (const manifest of manifests) {
    // 检查组件路径、命名约定等
  }
  
  return { isValid: errors.length === 0, errors, warnings, suggestions: [] }
}
```

## 相关ADR
- ADR-0001: 技术栈选择
- ADR-0010: 设计模式应用
- ADR-0012: P1阶段后端代码生成引擎

## 参考资料
- [策略模式设计](https://refactoring.guru/design-patterns/strategy)
- [Vue.js 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [React Router v6](https://reactrouter.com/en/main)