# ADR-0016: 低代码引擎Monorepo重构架构决策

## 📋 **状态**
- **状态**: 已接受 (Accepted)
- **决策者**: SmartAbp 架构团队
- **决策日期**: 2025-01-12
- **影响范围**: 全栈低代码引擎架构

## 🎯 **背景与问题**

### 当前痛点
SmartAbp全栈低代码引擎目前面临以下架构问题：

1. **代码分散**: 60个核心文件分布在15个不同目录中
2. **依赖混乱**: 低代码引擎代码与业务代码混合，边界不清
3. **发包困难**: 无法独立发包，难以版本管理和第三方集成
4. **维护复杂**: 模块间依赖关系复杂，重构风险高
5. **扩展受限**: 插件化架构不完善，第三方扩展困难

### 具体文件分布问题
```
当前分散状况:
├── src/lowcode/                    # 引擎内核 (25个文件)
├── src/components/designer/        # 设计器组件 (4个文件)  
├── src/views/codegen/designer/     # 设计器视图 (4个文件)
├── src/components/CodeGenerator/   # 后端代码生成器 (2个文件)
├── src/views/codegen/             # 低代码视图 (5个文件)
├── templates/                     # 代码模板 (15个文件)
└── tools/incremental-generation/  # 增量生成工具 (5个文件)
```

## 🎯 **决策内容**

### 核心决策
**采用Monorepo架构重构全栈低代码引擎，将其拆分为6个独立的npm包。**

### 目标架构（并强制目录约束）
```
packages/
├── @smartabp/lowcode-core          # 🔧 引擎内核包
├── @smartabp/lowcode-designer      # 🎨 可视化设计器包
├── @smartabp/lowcode-codegen       # 🏗️ 代码生成引擎包
├── @smartabp/lowcode-ui-vue        # 🎭 Vue UI组件包
├── @smartabp/lowcode-tools         # 🛠️ 开发工具包
└── @smartabp/lowcode-api           # 🌐 API客户端包
```

【强制目录约束】所有低代码引擎相关代码（内核、插件、运行时、工具、UI、API、类型、示例、测试）必须置于上述 `packages/@smartabp/lowcode-*` 包中，主应用 `src/SmartAbp.Vue/src` 禁止新增或保留任何低代码引擎实现文件，仅允许通过包公开 API 使用。

### 包职责划分

#### 1. @smartabp/lowcode-core
- **职责**: 引擎内核、插件系统、运行时
- **包含文件**: `src/lowcode/kernel/`, `src/lowcode/runtime/`, `src/lowcode/plugins/`
- **依赖关系**: 无外部包依赖（基础包）
- **发布优先级**: 🔴 最高

#### 2. @smartabp/lowcode-designer  
- **职责**: 可视化设计器、实体设计器、拖拽引擎
- **包含文件**: `src/views/codegen/designer/`, `src/components/designer/`, `src/components/CodeGenerator/EntityDesigner.vue`
- **依赖关系**: 依赖 `@smartabp/lowcode-core`
- **发布优先级**: 🟡 高

#### 3. @smartabp/lowcode-codegen
- **职责**: 代码生成、模板系统、Schema导出
- **包含文件**: `templates/`, `src/tools/`, `src/components/designer/schemaExporter.ts`
- **依赖关系**: 依赖 `@smartabp/lowcode-core`
- **发布优先级**: 🟡 高

#### 4. @smartabp/lowcode-ui-vue
- **职责**: Vue UI组件、视图、状态管理
- **包含文件**: `src/views/codegen/`, `src/stores/designer.ts`, `src/composables/`
- **依赖关系**: 依赖 `@smartabp/lowcode-designer`, `@smartabp/lowcode-codegen`
- **发布优先级**: 🟢 中

#### 5. @smartabp/lowcode-tools
- **职责**: 开发工具、CLI、增量生成
- **包含文件**: `tools/incremental-generation/`, `src/plugins/moduleWizardDev.ts`
- **依赖关系**: 依赖 `@smartabp/lowcode-core`
- **发布优先级**: 🔵 低

#### 6. @smartabp/lowcode-api
- **职责**: API客户端、类型定义
- **包含文件**: `src/api/code-generator.ts`, `src/types/`
- **依赖关系**: 无包依赖（独立包）
- **发布优先级**: 🔵 低

## 🏗️ **技术实施方案**

### 1. Monorepo工具选择
- **包管理器**: pnpm (workspace支持)
- **构建工具**: tsup (快速TypeScript构建)
- **构建编排**: turbo (并行构建和缓存)
- **版本管理**: 统一版本号策略

### 2. 包配置标准
```json
{
  "name": "@smartabp/lowcode-*",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### 3. 构建配置
```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['vue', '@vueuse/core', 'element-plus']
})
```

### 4. peerDependencies策略
```json
{
  "peerDependencies": {
    "vue": "^3.0.0",
    "element-plus": "^2.0.0",
    "@vueuse/core": "^10.0.0"
  }
}
```

## 🎯 **架构原则**

### 1. 单一职责原则
每个包都有明确的职责边界，避免功能重叠。

### 2. 依赖倒置原则
```
高层包 → 抽象接口 ← 底层包
```

### 3. 开闭原则
通过插件系统支持扩展，核心包保持稳定。

### 4. 接口隔离原则
每个包只暴露必要的API，隐藏内部实现。

## 📊 **影响分析**

### 正面影响
1. **独立发包**: 支持按需引入，减小bundle大小
2. **版本管理**: 每个包可独立版本控制
3. **第三方集成**: 便于其他项目集成低代码引擎
4. **开发效率**: 清晰的模块边界，降低维护成本
5. **插件生态**: 支持第三方插件开发

### 负面影响
1. **初期复杂性**: 重构期间可能引入不稳定因素
2. **构建时间**: 多包构建可能增加CI时间
3. **学习成本**: 开发者需要适应新的包结构

### 风险缓解
1. **渐进式迁移**: 分阶段迁移，保持功能稳定
2. **自动化测试**: 完善的测试覆盖确保重构质量
3. **文档更新**: 及时更新开发文档和使用指南

## 🔄 **迁移策略**

### 分阶段实施
1. **阶段1**: 基础设施搭建 (2-3天)
2. **阶段2**: 核心包迁移 (5-7天)  
3. **阶段3**: UI组件包迁移 (3-4天)
4. **阶段4**: 工具和API包迁移 (2-3天)
5. **阶段5**: 依赖关系修复 (3-4天)

### 质量保证
- 单元测试覆盖率 ≥ 80%
- 集成测试全部通过
- 性能无明显回退
- Tree-shaking正常工作

## 🎯 **成功标准**

### 技术指标
- [ ] 所有包独立构建成功
- [ ] 主应用功能完全正常
- [ ] 单元测试100%通过
- [ ] E2E测试通过
- [ ] 包大小合理(支持Tree-shaking)
- [ ] TypeScript类型检查无错误

### 业务指标
- [ ] 低代码引擎功能无回退
- [ ] 开发体验无明显下降
- [ ] 支持第三方项目集成
- [ ] 插件开发文档完善

## 🔮 **未来演进**

### 短期目标 (1-3个月)
1. 完成Monorepo重构
2. 发布第一个稳定版本
3. 完善文档和示例

### 中期目标 (3-6个月)  
1. 建立插件生态
2. 支持更多UI框架 (React, Angular)
3. 性能优化和功能增强

### 长期目标 (6-12个月)
1. 建设开发者社区
2. 商业化插件市场
3. 企业级功能增强

## 📚 **相关文档**

- [Serena知识库索引](../serena-knowledge-base/lowcode-engine-index.md)
- [详细迁移计划](../migration/lowcode-engine-migration-plan.md)
- [ADR-0005: 低代码引擎架构](./0005-lowcode-engine-architecture.md)
- [ADR-0015: 可视化设计器架构](./0015-visual-designer-architecture.md)

## 🤝 **决策参与者**

- **提议者**: 首席架构师
- **评审者**: 技术委员会
- **实施者**: 前端团队、后端团队
- **影响者**: 产品团队、测试团队

---

**决策理由**: 当前架构已无法满足独立发包和第三方集成需求，Monorepo重构是必然选择。通过清晰的包职责划分和渐进式迁移策略，可以在保证稳定性的前提下实现架构升级。

**替代方案**: 保持现有架构，但这将限制产品的扩展性和生态发展。

**决策影响**: 这是一个重大架构决策，将影响未来1-2年的技术发展方向。

## 📋 **状态**
- **状态**: 提议 (Proposed)
- **决策者**: SmartAbp 架构团队
- **决策日期**: 2025-01-12
- **影响范围**: 全栈低代码引擎架构

## 🎯 **背景与问题**

### 当前痛点
SmartAbp全栈低代码引擎目前面临以下架构问题：

1. **代码分散**: 60个核心文件分布在15个不同目录中
2. **依赖混乱**: 低代码引擎代码与业务代码混合，边界不清
3. **发包困难**: 无法独立发包，难以版本管理和第三方集成
4. **维护复杂**: 模块间依赖关系复杂，重构风险高
5. **扩展受限**: 插件化架构不完善，第三方扩展困难

### 具体文件分布问题
```
当前分散状况:
├── src/lowcode/                    # 引擎内核 (25个文件)
├── src/components/designer/        # 设计器组件 (4个文件)  
├── src/views/codegen/designer/     # 设计器视图 (4个文件)
├── src/components/CodeGenerator/   # 后端代码生成器 (2个文件)
├── src/views/codegen/             # 低代码视图 (5个文件)
├── templates/                     # 代码模板 (15个文件)
└── tools/incremental-generation/  # 增量生成工具 (5个文件)
```

## 🎯 **决策内容**

### 核心决策
**采用Monorepo架构重构全栈低代码引擎，将其拆分为6个独立的npm包。**

### 目标架构
```
packages/
├── @smartabp/lowcode-core          # 🔧 引擎内核包
├── @smartabp/lowcode-designer      # 🎨 可视化设计器包
├── @smartabp/lowcode-codegen       # 🏗️ 代码生成引擎包
├── @smartabp/lowcode-ui-vue        # 🎭 Vue UI组件包
├── @smartabp/lowcode-tools         # 🛠️ 开发工具包
└── @smartabp/lowcode-api           # 🌐 API客户端包
```

### 包职责划分

#### 1. @smartabp/lowcode-core
- **职责**: 引擎内核、插件系统、运行时
- **包含文件**: `src/lowcode/kernel/`, `src/lowcode/runtime/`, `src/lowcode/plugins/`
- **依赖关系**: 无外部包依赖（基础包）
- **发布优先级**: 🔴 最高

#### 2. @smartabp/lowcode-designer  
- **职责**: 可视化设计器、实体设计器、拖拽引擎
- **包含文件**: `src/views/codegen/designer/`, `src/components/designer/`, `src/components/CodeGenerator/EntityDesigner.vue`
- **依赖关系**: 依赖 `@smartabp/lowcode-core`
- **发布优先级**: 🟡 高

#### 3. @smartabp/lowcode-codegen
- **职责**: 代码生成、模板系统、Schema导出
- **包含文件**: `templates/`, `src/tools/`, `src/components/designer/schemaExporter.ts`
- **依赖关系**: 依赖 `@smartabp/lowcode-core`
- **发布优先级**: 🟡 高

#### 4. @smartabp/lowcode-ui-vue
- **职责**: Vue UI组件、视图、状态管理
- **包含文件**: `src/views/codegen/`, `src/stores/designer.ts`, `src/composables/`
- **依赖关系**: 依赖 `@smartabp/lowcode-designer`, `@smartabp/lowcode-codegen`
- **发布优先级**: 🟢 中

#### 5. @smartabp/lowcode-tools
- **职责**: 开发工具、CLI、增量生成
- **包含文件**: `tools/incremental-generation/`, `src/plugins/moduleWizardDev.ts`
- **依赖关系**: 依赖 `@smartabp/lowcode-core`
- **发布优先级**: 🔵 低

#### 6. @smartabp/lowcode-api
- **职责**: API客户端、类型定义
- **包含文件**: `src/api/code-generator.ts`, `src/types/`
- **依赖关系**: 无包依赖（独立包）
- **发布优先级**: 🔵 低

## 🏗️ **技术实施方案**

### 1. Monorepo工具选择
- **包管理器**: pnpm (workspace支持)
- **构建工具**: tsup (快速TypeScript构建)
- **构建编排**: turbo (并行构建和缓存)
- **版本管理**: 统一版本号策略

### 2. 包配置标准
```json
{
  "name": "@smartabp/lowcode-*",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### 3. 构建配置
```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['vue', '@vueuse/core', 'element-plus']
})
```

### 4. peerDependencies策略
```json
{
  "peerDependencies": {
    "vue": "^3.0.0",
    "element-plus": "^2.0.0",
    "@vueuse/core": "^10.0.0"
  }
}
```

## 🎯 **架构原则**

### 1. 单一职责原则
每个包都有明确的职责边界，避免功能重叠。

### 2. 依赖倒置原则
```
高层包 → 抽象接口 ← 底层包
```

### 3. 开闭原则
通过插件系统支持扩展，核心包保持稳定。

### 4. 接口隔离原则
每个包只暴露必要的API，隐藏内部实现。

## 📊 **影响分析**

### 正面影响
1. **独立发包**: 支持按需引入，减小bundle大小
2. **版本管理**: 每个包可独立版本控制
3. **第三方集成**: 便于其他项目集成低代码引擎
4. **开发效率**: 清晰的模块边界，降低维护成本
5. **插件生态**: 支持第三方插件开发

### 负面影响
1. **初期复杂性**: 重构期间可能引入不稳定因素
2. **构建时间**: 多包构建可能增加CI时间
3. **学习成本**: 开发者需要适应新的包结构

### 风险缓解
1. **渐进式迁移**: 分阶段迁移，保持功能稳定
2. **自动化测试**: 完善的测试覆盖确保重构质量
3. **文档更新**: 及时更新开发文档和使用指南

## 🔄 **迁移策略**

### 分阶段实施
1. **阶段1**: 基础设施搭建 (2-3天)
2. **阶段2**: 核心包迁移 (5-7天)  
3. **阶段3**: UI组件包迁移 (3-4天)
4. **阶段4**: 工具和API包迁移 (2-3天)
5. **阶段5**: 依赖关系修复 (3-4天)

### 质量保证
- 单元测试覆盖率 ≥ 80%
- 集成测试全部通过
- 性能无明显回退
- Tree-shaking正常工作

## 🎯 **成功标准**

### 技术指标
- [ ] 所有包独立构建成功
- [ ] 主应用功能完全正常
- [ ] 单元测试100%通过
- [ ] E2E测试通过
- [ ] 包大小合理(支持Tree-shaking)
- [ ] TypeScript类型检查无错误

### 业务指标
- [ ] 低代码引擎功能无回退
- [ ] 开发体验无明显下降
- [ ] 支持第三方项目集成
- [ ] 插件开发文档完善

## 🔮 **未来演进**

### 短期目标 (1-3个月)
1. 完成Monorepo重构
2. 发布第一个稳定版本
3. 完善文档和示例

### 中期目标 (3-6个月)  
1. 建立插件生态
2. 支持更多UI框架 (React, Angular)
3. 性能优化和功能增强

### 长期目标 (6-12个月)
1. 建设开发者社区
2. 商业化插件市场
3. 企业级功能增强

## 📚 **相关文档**

- [Serena知识库索引](../serena-knowledge-base/lowcode-engine-index.md)
- [详细迁移计划](../migration/lowcode-engine-migration-plan.md)
- [ADR-0005: 低代码引擎架构](./0005-lowcode-engine-architecture.md)
- [ADR-0015: 可视化设计器架构](./0015-visual-designer-architecture.md)

## 🤝 **决策参与者**

- **提议者**: 首席架构师
- **评审者**: 技术委员会
- **实施者**: 前端团队、后端团队
- **影响者**: 产品团队、测试团队

---

**决策理由**: 当前架构已无法满足独立发包和第三方集成需求，Monorepo重构是必然选择。通过清晰的包职责划分和渐进式迁移策略，可以在保证稳定性的前提下实现架构升级。

**替代方案**: 保持现有架构，但这将限制产品的扩展性和生态发展。

**决策影响**: 这是一个重大架构决策，将影响未来1-2年的技术发展方向。

## 📋 **状态**
- **状态**: 提议 (Proposed)
- **决策者**: SmartAbp 架构团队
- **决策日期**: 2025-01-12
- **影响范围**: 全栈低代码引擎架构

## 🎯 **背景与问题**

### 当前痛点
SmartAbp全栈低代码引擎目前面临以下架构问题：

1. **代码分散**: 60个核心文件分布在15个不同目录中
2. **依赖混乱**: 低代码引擎代码与业务代码混合，边界不清
3. **发包困难**: 无法独立发包，难以版本管理和第三方集成
4. **维护复杂**: 模块间依赖关系复杂，重构风险高
5. **扩展受限**: 插件化架构不完善，第三方扩展困难

### 具体文件分布问题
```
当前分散状况:
├── src/lowcode/                    # 引擎内核 (25个文件)
├── src/components/designer/        # 设计器组件 (4个文件)  
├── src/views/codegen/designer/     # 设计器视图 (4个文件)
├── src/components/CodeGenerator/   # 后端代码生成器 (2个文件)
├── src/views/codegen/             # 低代码视图 (5个文件)
├── templates/                     # 代码模板 (15个文件)
└── tools/incremental-generation/  # 增量生成工具 (5个文件)
```

## 🎯 **决策内容**

### 核心决策
**采用Monorepo架构重构全栈低代码引擎，将其拆分为6个独立的npm包。**

### 目标架构
```
packages/
├── @smartabp/lowcode-core          # 🔧 引擎内核包
├── @smartabp/lowcode-designer      # 🎨 可视化设计器包
├── @smartabp/lowcode-codegen       # 🏗️ 代码生成引擎包
├── @smartabp/lowcode-ui-vue        # 🎭 Vue UI组件包
├── @smartabp/lowcode-tools         # 🛠️ 开发工具包
└── @smartabp/lowcode-api           # 🌐 API客户端包
```

### 包职责划分

#### 1. @smartabp/lowcode-core
- **职责**: 引擎内核、插件系统、运行时
- **包含文件**: `src/lowcode/kernel/`, `src/lowcode/runtime/`, `src/lowcode/plugins/`
- **依赖关系**: 无外部包依赖（基础包）
- **发布优先级**: 🔴 最高

#### 2. @smartabp/lowcode-designer  
- **职责**: 可视化设计器、实体设计器、拖拽引擎
- **包含文件**: `src/views/codegen/designer/`, `src/components/designer/`, `src/components/CodeGenerator/EntityDesigner.vue`
- **依赖关系**: 依赖 `@smartabp/lowcode-core`
- **发布优先级**: 🟡 高

#### 3. @smartabp/lowcode-codegen
- **职责**: 代码生成、模板系统、Schema导出
- **包含文件**: `templates/`, `src/tools/`, `src/components/designer/schemaExporter.ts`
- **依赖关系**: 依赖 `@smartabp/lowcode-core`
- **发布优先级**: 🟡 高

#### 4. @smartabp/lowcode-ui-vue
- **职责**: Vue UI组件、视图、状态管理
- **包含文件**: `src/views/codegen/`, `src/stores/designer.ts`, `src/composables/`
- **依赖关系**: 依赖 `@smartabp/lowcode-designer`, `@smartabp/lowcode-codegen`
- **发布优先级**: 🟢 中

#### 5. @smartabp/lowcode-tools
- **职责**: 开发工具、CLI、增量生成
- **包含文件**: `tools/incremental-generation/`, `src/plugins/moduleWizardDev.ts`
- **依赖关系**: 依赖 `@smartabp/lowcode-core`
- **发布优先级**: 🔵 低

#### 6. @smartabp/lowcode-api
- **职责**: API客户端、类型定义
- **包含文件**: `src/api/code-generator.ts`, `src/types/`
- **依赖关系**: 无包依赖（独立包）
- **发布优先级**: 🔵 低

## 🏗️ **技术实施方案**

### 1. Monorepo工具选择
- **包管理器**: pnpm (workspace支持)
- **构建工具**: tsup (快速TypeScript构建)
- **构建编排**: turbo (并行构建和缓存)
- **版本管理**: 统一版本号策略

### 2. 包配置标准
```json
{
  "name": "@smartabp/lowcode-*",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

### 3. 构建配置
```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['vue', '@vueuse/core', 'element-plus']
})
```

### 4. peerDependencies策略
```json
{
  "peerDependencies": {
    "vue": "^3.0.0",
    "element-plus": "^2.0.0",
    "@vueuse/core": "^10.0.0"
  }
}
```

## 🎯 **架构原则**

### 1. 单一职责原则
每个包都有明确的职责边界，避免功能重叠。

### 2. 依赖倒置原则
```
高层包 → 抽象接口 ← 底层包
```

### 3. 开闭原则
通过插件系统支持扩展，核心包保持稳定。

### 4. 接口隔离原则
每个包只暴露必要的API，隐藏内部实现。

## 📊 **影响分析**

### 正面影响
1. **独立发包**: 支持按需引入，减小bundle大小
2. **版本管理**: 每个包可独立版本控制
3. **第三方集成**: 便于其他项目集成低代码引擎
4. **开发效率**: 清晰的模块边界，降低维护成本
5. **插件生态**: 支持第三方插件开发

### 负面影响
1. **初期复杂性**: 重构期间可能引入不稳定因素
2. **构建时间**: 多包构建可能增加CI时间
3. **学习成本**: 开发者需要适应新的包结构

### 风险缓解
1. **渐进式迁移**: 分阶段迁移，保持功能稳定
2. **自动化测试**: 完善的测试覆盖确保重构质量
3. **文档更新**: 及时更新开发文档和使用指南

## 🔄 **迁移策略**

### 分阶段实施
1. **阶段1**: 基础设施搭建 (2-3天)
2. **阶段2**: 核心包迁移 (5-7天)  
3. **阶段3**: UI组件包迁移 (3-4天)
4. **阶段4**: 工具和API包迁移 (2-3天)
5. **阶段5**: 依赖关系修复 (3-4天)

### 质量保证
- 单元测试覆盖率 ≥ 80%
- 集成测试全部通过
- 性能无明显回退
- Tree-shaking正常工作

## 🎯 **成功标准**

### 技术指标
- [ ] 所有包独立构建成功
- [ ] 主应用功能完全正常
- [ ] 单元测试100%通过
- [ ] E2E测试通过
- [ ] 包大小合理(支持Tree-shaking)
- [ ] TypeScript类型检查无错误

### 业务指标
- [ ] 低代码引擎功能无回退
- [ ] 开发体验无明显下降
- [ ] 支持第三方项目集成
- [ ] 插件开发文档完善

## 🔮 **未来演进**

### 短期目标 (1-3个月)
1. 完成Monorepo重构
2. 发布第一个稳定版本
3. 完善文档和示例

### 中期目标 (3-6个月)  
1. 建立插件生态
2. 支持更多UI框架 (React, Angular)
3. 性能优化和功能增强

### 长期目标 (6-12个月)
1. 建设开发者社区
2. 商业化插件市场
3. 企业级功能增强

## 📚 **相关文档**

- [Serena知识库索引](../serena-knowledge-base/lowcode-engine-index.md)
- [详细迁移计划](../migration/lowcode-engine-migration-plan.md)
- [ADR-0005: 低代码引擎架构](./0005-lowcode-engine-architecture.md)
- [ADR-0015: 可视化设计器架构](./0015-visual-designer-architecture.md)

## 🤝 **决策参与者**

- **提议者**: 首席架构师
- **评审者**: 技术委员会
- **实施者**: 前端团队、后端团队
- **影响者**: 产品团队、测试团队

---

**决策理由**: 当前架构已无法满足独立发包和第三方集成需求，Monorepo重构是必然选择。通过清晰的包职责划分和渐进式迁移策略，可以在保证稳定性的前提下实现架构升级。

**替代方案**: 保持现有架构，但这将限制产品的扩展性和生态发展。

**决策影响**: 这是一个重大架构决策，将影响未来1-2年的技术发展方向。
