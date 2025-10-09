# 微AI 2.0 迁移与兼容性方案

## 📋 文档说明

**版本**: 1.0.0  
**更新日期**: 2025-10-10  
**分支**: feature/micro-ai-2.0  
**作者**: AI首席架构师

本文档提供从旧组件系统平滑迁移到微AI 2.0的完整方案。

---

## 🚨 核心问题

### 问题分析

目前项目中存在**两套组件注册系统**：

1. **旧系统（main分支）**：
   - 基于传统的Vue3组件导入
   - 手动管理组件引用
   - 无统一注册机制

2. **微AI 2.0（feature分支）**：
   - VirtualAssembly虚拟程序集
   - ComponentRegistry统一注册
   - 插件系统与钩子机制

**冲突点**：
- ❌ 两套系统无法直接兼容
- ❌ 代码路径引用方式不同
- ❌ 组件加载机制完全不同

---

## 🎯 解决方案：渐进式迁移策略

### 策略1：向后兼容模式（推荐）

**核心思想**：微AI 2.0支持旧系统组件，逐步迁移

#### 实现方案

```typescript
// src/SmartAbp.Vue/packages/lowcode-shared/src/compatibility/LegacyBridge.ts

/**
 * 兼容性桥接层
 * 使旧组件能在微AI 2.0中使用
 */
import { App, Component } from 'vue'
import { globalComponentRegistry } from '../components/ComponentRegistry'

export class LegacyComponentBridge {
  /**
   * 注册旧系统的Vue组件到微AI 2.0
   */
  static registerLegacyComponent(
    app: App,
    name: string,
    component: Component,
    options?: {
      category?: string
      priority?: 'low' | 'medium' | 'high'
    }
  ) {
    // 1. 注册到微AI 2.0 Registry
    globalComponentRegistry.register({
      name,
      displayName: name,
      category: options?.category || 'legacy',
      priority: options?.priority || 'medium',
      bundle: '@app/legacy',
      path: '', // 直接使用组件对象，不需要路径
      lazy: false,
      preload: false,
      component // 直接传递组件对象
    })

    // 2. 同时注册到Vue app（保持兼容）
    app.component(name, component)
  }

  /**
   * 批量注册旧组件
   */
  static registerLegacyComponents(
    app: App,
    components: Record<string, Component>
  ) {
    Object.entries(components).forEach(([name, component]) => {
      this.registerLegacyComponent(app, name, component)
    })
  }

  /**
   * 自动扫描并注册Vue app中的组件
   */
  static autoMigrate(app: App) {
    const globalComponents = (app as any)._context.components
    
    Object.entries(globalComponents).forEach(([name, component]) => {
      if (!globalComponentRegistry.getMetadata(name)) {
        this.registerLegacyComponent(app, name, component as Component, {
          category: 'auto-migrated',
          priority: 'low'
        })
      }
    })
  }
}
```

#### 使用方法

```typescript
// main.ts - 应用启动时

import { createApp } from 'vue'
import { LegacyComponentBridge } from '@smartabp/lowcode-shared/compatibility'
import App from './App.vue'

// 旧组件（保持不变）
import UserList from './components/user/UserList.vue'
import ProductTable from './components/product/ProductTable.vue'

const app = createApp(App)

// ✅ 方法1：手动注册旧组件
LegacyComponentBridge.registerLegacyComponent(app, 'UserList', UserList, {
  category: 'business',
  priority: 'high'
})

// ✅ 方法2：批量注册
LegacyComponentBridge.registerLegacyComponents(app, {
  UserList,
  ProductTable
})

// ✅ 方法3：自动迁移（扫描所有已注册组件）
app.mount('#app')
LegacyComponentBridge.autoMigrate(app)

// 现在旧组件可以通过微AI 2.0访问了
import { Components } from '@smartabp/lowcode-shared'
const UserListComponent = Components.UserList // ✨ 自动可用
```

---

### 策略2：逐步替换模式

**核心思想**：新功能使用微AI 2.0，旧功能保持不变

#### 实现步骤

**第1步：标记组件类型**

```typescript
// types/component-migration.d.ts

declare module '@smartabp/lowcode-shared' {
  interface ComponentMetadata {
    /**
     * 组件来源
     */
    source?: 'legacy' | 'micro-ai-2.0'
    
    /**
     * 迁移状态
     */
    migrationStatus?: 'pending' | 'in-progress' | 'completed'
  }
}
```

**第2步：创建迁移追踪器**

```typescript
// src/SmartAbp.Vue/packages/lowcode-shared/src/compatibility/MigrationTracker.ts

export class MigrationTracker {
  private migrations = new Map<string, {
    from: string
    to: string
    status: 'pending' | 'completed'
    date?: Date
  }>()

  /**
   * 标记组件开始迁移
   */
  startMigration(componentName: string, fromPath: string, toPath: string) {
    this.migrations.set(componentName, {
      from: fromPath,
      to: toPath,
      status: 'pending'
    })
  }

  /**
   * 标记组件迁移完成
   */
  completeMigration(componentName: string) {
    const migration = this.migrations.get(componentName)
    if (migration) {
      migration.status = 'completed'
      migration.date = new Date()
    }
  }

  /**
   * 生成迁移报告
   */
  generateReport() {
    const pending = Array.from(this.migrations.values())
      .filter(m => m.status === 'pending')
    
    const completed = Array.from(this.migrations.values())
      .filter(m => m.status === 'completed')

    return {
      total: this.migrations.size,
      pending: pending.length,
      completed: completed.length,
      progress: (completed.length / this.migrations.size * 100).toFixed(1) + '%',
      pendingList: pending,
      completedList: completed
    }
  }
}

export const globalMigrationTracker = new MigrationTracker()
```

**第3步：迁移具体组件**

```typescript
// 旧方式（需要逐步迁移）
import UserList from '@/components/user/UserList.vue'

// 新方式（微AI 2.0）
import { Components } from '@smartabp/lowcode-shared'
const UserList = Components.UserList
```

---

### 策略3：并行运行模式（开发期）

**核心思想**：两套系统同时存在，通过特性开关切换

#### 实现方案

```typescript
// src/SmartAbp.Vue/src/config/feature-flags.ts

export const featureFlags = {
  /**
   * 启用微AI 2.0
   */
  useMicroAI2: import.meta.env.VITE_USE_MICRO_AI_2 === 'true',
  
  /**
   * 严格模式（禁用旧系统）
   */
  strictMode: import.meta.env.VITE_MICRO_AI_STRICT === 'true',
  
  /**
   * 调试模式
   */
  debug: import.meta.env.DEV
}

// 组件加载适配器
export function loadComponent(name: string) {
  if (featureFlags.useMicroAI2) {
    // 使用微AI 2.0
    return Components[name]
  } else {
    // 使用旧系统
    return import(`@/components/${name}.vue`)
  }
}
```

**.env.development**
```bash
# 开发环境：启用微AI 2.0
VITE_USE_MICRO_AI_2=true
VITE_MICRO_AI_STRICT=false
```

**.env.production**
```bash
# 生产环境：保持旧系统（稳定）
VITE_USE_MICRO_AI_2=false
VITE_MICRO_AI_STRICT=false
```

---

## 📋 迁移检查清单

### 阶段1：准备（1周）

- [ ] **创建feature分支** ✅
  ```bash
  git checkout -b feature/micro-ai-2.0
  ```

- [ ] **安装兼容层**
  - [ ] 创建 `LegacyComponentBridge`
  - [ ] 创建 `MigrationTracker`
  - [ ] 配置特性开关

- [ ] **盘点旧组件**
  ```bash
  find src/components -name "*.vue" > migration-list.txt
  ```

- [ ] **制定迁移优先级**
  - 高优先级：核心业务组件
  - 中优先级：通用组件
  - 低优先级：临时组件

### 阶段2：试点迁移（1周）

- [ ] **选择试点组件**（3-5个）
  - [ ] UserList（业务组件）
  - [ ] BaseButton（通用组件）
  - [ ] DataTable（复杂组件）

- [ ] **执行迁移**
  1. 使用LegacyBridge注册
  2. 验证功能正常
  3. 性能对比测试
  4. 标记为已迁移

- [ ] **问题记录与解决**

### 阶段3：批量迁移（2-3周）

- [ ] **按模块迁移**
  - [ ] User模块（5个组件）
  - [ ] Product模块（8个组件）
  - [ ] Order模块（6个组件）
  - ...

- [ ] **每个模块完成后**
  - [ ] 功能测试
  - [ ] 集成测试
  - [ ] 性能测试
  - [ ] 更新文档

### 阶段4：清理与优化（1周）

- [ ] **移除旧系统代码**
  - [ ] 删除旧的组件导入
  - [ ] 清理未使用的imports
  - [ ] 移除兼容层代码

- [ ] **性能优化**
  - [ ] 启用预加载
  - [ ] 配置缓存策略
  - [ ] 优化打包体积

- [ ] **文档更新**
  - [ ] 更新组件使用文档
  - [ ] 更新开发指南
  - [ ] 更新最佳实践

### 阶段5：上线与监控（1周）

- [ ] **灰度发布**
  - [ ] 10%用户 → 观察1天
  - [ ] 50%用户 → 观察2天
  - [ ] 100%用户 → 全量上线

- [ ] **性能监控**
  - [ ] 组件加载时间
  - [ ] 缓存命中率
  - [ ] 错误率

- [ ] **合并到main分支**
  ```bash
  git checkout main
  git merge feature/micro-ai-2.0
  git push origin main
  ```

---

## 🔧 常见问题与解决方案

### Q1: 旧组件无法在微AI 2.0中使用？

**解决方案**：
```typescript
// 使用LegacyBridge注册
import { LegacyComponentBridge } from '@smartabp/lowcode-shared/compatibility'

LegacyComponentBridge.registerLegacyComponent(app, 'OldComponent', OldComponent)

// 现在可以使用了
const OldComp = Components.OldComponent
```

### Q2: 路径引用冲突？

**解决方案**：
```typescript
// 旧路径
import UserList from '@/components/user/UserList.vue'

// 迁移：在ComponentRegistry中注册正确路径
registerComponent({
  name: 'UserList',
  path: './src/components/user/UserList.vue', // 完整路径
  bundle: '@app/components'
})
```

### Q3: 性能下降？

**解决方案**：
```typescript
// 启用预加载
await Components.preload(['UserList', 'ProductTable'])

// 启用性能监控插件
await globalPluginManager.register(createPerformancePlugin({
  slowLoadThreshold: 500,
  enableAutoReport: true
}))
```

### Q4: TypeScript类型错误？

**解决方案**：
```bash
# 重新生成类型文件
npm run type-gen

# 重启TS服务器
# VSCode: Ctrl+Shift+P > TypeScript: Restart TS Server
```

---

## 🚀 推荐迁移路径

### 方案A：激进模式（适合新项目）

```
Week 1: 全面切换微AI 2.0
Week 2: 清理旧代码
Week 3: 性能优化
Week 4: 上线
```

### 方案B：稳健模式（适合生产项目）✅ 推荐

```
Week 1-2: 准备 + 试点（5个组件）
Week 3-5: 批量迁移（按模块，每周1-2个模块）
Week 6: 清理与优化
Week 7: 灰度发布
Week 8: 全量上线
```

### 方案C：保守模式（适合关键业务）

```
Month 1: 新功能使用微AI 2.0
Month 2: 非关键模块迁移
Month 3: 关键模块迁移
Month 4: 全面替换
```

---

## 📊 迁移进度追踪

### 使用MigrationTracker

```typescript
import { globalMigrationTracker } from '@smartabp/lowcode-shared/compatibility'

// 开始迁移
globalMigrationTracker.startMigration(
  'UserList',
  '@/components/user/UserList.vue',
  'Components.UserList'
)

// 完成迁移
globalMigrationTracker.completeMigration('UserList')

// 生成报告
const report = globalMigrationTracker.generateReport()
console.log(report)
// {
//   total: 50,
//   pending: 20,
//   completed: 30,
//   progress: '60.0%'
// }
```

---

## 🎯 成功标准

### 技术指标

- ✅ 所有组件成功迁移（100%）
- ✅ TypeScript 0错误
- ✅ 性能无退化（<=5%）
- ✅ 测试覆盖率>=80%

### 业务指标

- ✅ 功能完整性100%
- ✅ 用户体验无变化
- ✅ 错误率<0.1%
- ✅ 平均响应时间<500ms

---

## 📚 相关文档

- [微AI 2.0 详细开发计划](./微AI2.0详细开发计划.md)
- [微AI 2.0 API文档](./微AI2.0_API文档.md)
- [微AI 2.0 最佳实践](./微AI2.0最佳实践.md)
- [微AI 2.0 使用指南](./微AI2.0使用指南.md)

---

**采用渐进式迁移策略，确保平滑过渡到微AI 2.0！** 🚀

