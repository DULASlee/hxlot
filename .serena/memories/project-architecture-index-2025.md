# SmartAbp 项目架构知识库索引 - 2025年更新

## 项目概览
- **项目名称**: Baobab.SmartAbp
- **技术栈**: TypeScript + Vue.js 3 + ASP.NET Core + ABP Framework
- **架构模式**: 微内核 + 插件式低代码引擎
- **最后更新**: 2025年1月

## 架构决策记录 (ADR)

### 核心技术栈选择
- **文档**: `doc/architecture/adr/0001-technology-stack-selection.md`
- **决策**: ASP.NET Core + Vue.js 3 + TypeScript
- **状态**: 已接受 ✅
- **关键决策**:
  - 后端采用ABP Framework提供企业级基础设施
  - 前端使用Vue 3 Composition API + Element Plus
  - 低代码引擎采用微内核+插件架构

### 前端架构设计
- **文档**: `doc/architecture/adr/0002-frontend-architecture-decisions.md`
- **关键组件**:
  - 低代码设计器 (`packages/lowcode-designer/`)
  - 核心引擎 (`packages/lowcode-core/`)
  - 运行时渲染器

### 后端架构设计  
- **文档**: `doc/architecture/adr/0003-backend-architecture-decisions.md`
- **架构**: 领域驱动设计(DDD) + CQRS模式

### 低代码引擎架构
- **文档**: `doc/architecture/adr/0005-lowcode-engine-architecture.md`
- **核心架构**:
  ```
  微内核架构 =
    ├── kernel/ (事件总线、缓存、日志、性能监控、插件管理)
    ├── plugins/ (Vue3生成器、SFC编译器、路由生成器、状态管理生成器)
    ├── runtime/ (Worker池、元数据流水线、沙箱、渲染引擎)
    └── adapters/ (日志适配、缓存适配、监控适配)
  ```

### 增量代码生成
- **文档**: `doc/architecture/adr/0006-incremental-code-generation.md`
- **策略**: 支持模块化和增量式代码生成

### 性能优化策略
- **文档**: `doc/architecture/adr/0009-performance-optimization.md`
- **关键指标**:
  - 代码生成并发度 ≤ 5
  - 缓存命中率 > 50%
  - 完整监控埋点

### AI代码质量保证
- **文档**: `doc/architecture/adr/0011-ai-code-quality-assurance.md`
- **质量要求**:
  - 插件代码覆盖率 ≥ 80%
  - 生成代码必须通过ESLint检查
  - 禁止生产环境使用动态代码执行

### P1后端代码生成引擎
- **文档**: `doc/architecture/adr/0012-p1-backend-code-generation-engine.md`
- **实现**: SmartAbp.CodeGenerator项目

### 插件化策略架构
- **文档**: `doc/architecture/adr/0013-pluggable-strategy-architecture.md`
- **接口规范**: 所有插件必须实现LowCodePlugin接口

### 企业级内存监控
- **文档**: `doc/architecture/adr/0014-enterprise-memory-monitoring.md`
- **监控范围**: 内存使用、性能指标、错误追踪

### 可视化设计器架构
- **文档**: `doc/architecture/adr/0015-visual-designer-architecture.md`
- **组件**: 拖拽设计器、属性检查器、组件面板

### 低代码引擎Monorepo重构
- **文档**: `doc/architecture/adr/0016-lowcode-engine-monorepo-refactoring.md`
- **重构结果**: 分离为lowcode-core和lowcode-designer包

## 核心组件架构

### 低代码核心引擎 (`packages/lowcode-core/`)
- **清单写入器**: `SmartAbpManifestWriter` - 生成Vue组件、路由、菜单文件
- **进度跟踪**: `useCodeGenerationProgress` - 基于SignalR的实时进度跟踪
- **类型定义**: 严格的TypeScript接口定义

### 低代码设计器 (`packages/lowcode-designer/`)
- **验证系统**: 
  - `WizardValidator` - 多步骤验证
  - `zod-schemas.ts` - Zod模式验证
  - 危险内容检测 (XSS/SQL注入防护)
- **模块向导**: `ModuleWizardView` - 完整的模块创建流程
- **性能优化**: 缓存管理、虚拟滚动、并发控制

### 前端主应用 (`src/SmartAbp.Vue/src/`)
- **视图结构**: 
  - `views/codegen/` - 代码生成相关视图
  - `views/designer/` - 设计器相关视图
- **工具函数**: 认证、主题、国际化等

### 后端代码生成器 (`src/SmartAbp.CodeGenerator/`)
- **代码生成服务**: `CodeGenerationAppService`
- **验证服务**: 模块元数据验证、实体定义验证
- **质量检查**: 代码质量验证接口

## 安全机制

### 已实现的安全特性
1. **强类型验证**: Zod模式验证系统
2. **危险内容检测**: 防止XSS和SQL注入
3. **命名规范验证**: PascalCase、正则表达式验证
4. **输入清理**: 长度限制、字符过滤
5. **生产环境安全**: 禁止动态代码执行

### 安全策略
- **开发环境**: 受控预览 (iframe + Worker + CSP)
- **生产环境**: 严格禁止eval和new Function
- **依赖管理**: 第三方依赖必须在插件元数据中声明

## 性能指标

### 代码生成性能
- **并发控制**: 默认并发度 ≤ 5
- **缓存策略**: 多级缓存 (内存 → 本地存储 → 分布式缓存)
- **超时控制**: 代码生成/编译必须设置超时

### 监控指标
- **时延**: 代码生成响应时间
- **成功率**: 生成成功比例
- **缓存命中率**: 目标 > 50%
- **并发度**: 实时并发监控

## 开发规范

### 插件开发要求
1. 必须实现LowCodePlugin接口
2. metadata信息必须完整准确
3. canHandle方法必须保持幂等
4. validate方法不得空实现

### 命名规范
- 插件类名以`*Plugin`结尾
- 生成器以`-generator`结尾
- 文件命名使用kebab-case格式

### 代码质量标准
- 插件代码覆盖率 ≥ 80%
- 生成代码必须通过ESLint检查
- 完整的错误处理和日志记录

## 项目文件索引
- **完整索引**: `.serena/project_files_index.txt`
- **ADR文档**: `.serena/adr_documents.txt`

## 最近更新内容
1. ✅ 安全缺陷修复 - 实现了完整的验证和清理机制
2. ✅ 强类型验证 - Zod模式验证系统
3. ✅ 危险内容检测 - XSS和SQL注入防护
4. ✅ 性能优化 - 缓存和并发控制
5. ✅ 代码质量保证 - AI辅助代码审查

---
**创建时间**: 2025-01-20  
**最后更新**: 2025-01-20  
**维护者**: 架构团队