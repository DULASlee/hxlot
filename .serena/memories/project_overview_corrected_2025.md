# SmartAbp 项目概览 - 2025年真实评估

## 项目简介
SmartAbp是一个基于ABP框架的企业级全栈低代码开发平台，包含完整的代码生成引擎和权限管理系统。

## 技术栈

### 后端技术栈
- **.NET**: .NET 8
- **框架**: ABP vNext Framework
- **ORM**: Entity Framework Core
- **数据库**: SQL Server/PostgreSQL/MySQL (多数据库支持)
- **代码生成**: Roslyn AST + 29个专业代码生成器
- **缓存**: Redis分布式缓存
- **消息队列**: RabbitMQ
- **实时通信**: SignalR

### 前端技术栈
- **框架**: Vue 3.5.13 + TypeScript 5.8 + Vite 7.0.6
- **UI组件库**: Element Plus 2.8.8
- **状态管理**: Pinia 3.0.3
- **路由**: Vue Router 4.x
- **工具库**: VueUse, Axios, Day.js, ECharts, Monaco Editor
- **测试**: Vitest 3.2.4 + Cypress 15.1.0
- **构建**: Vite + ESLint 9.34.0 + Prettier 3.6.2

### 低代码引擎
- **架构**: 微内核 + 插件架构
- **后端生成器**: 29个专业代码生成器 (DDD、CQRS、缓存、质量、测试等)
- **前端设计器**: 可视化设计器 + 元数据驱动运行时
- **Monorepo**: 5个专业包 (@smartabp/lowcode-*)

## 项目结构
```
src/
├── SmartAbp.Vue/                 # Vue前端应用
├── SmartAbp.CodeGenerator/       # 29个专业代码生成器
├── SmartAbp.Application/         # 应用层 (包含完整权限系统)
├── SmartAbp.Domain/              # 域层
├── SmartAbp.HttpApi/             # API层
├── SmartAbp.Web/                 # Web层
├── SmartAbp.EntityFrameworkCore/ # EF Core层
└── test/                         # 测试项目
```

## 核心功能模块

### 已完整实现的功能
- ✅ **代码生成引擎**: 29个专业生成器，支持DDD、CQRS、微服务等
- ✅ **权限管理系统**: OptimizedPermissionInheritanceEngine + Redis缓存
- ✅ **用户管理**: 完整的用户CRUD和角色分配
- ✅ **可视化设计器**: Vue3组件设计器
- ✅ **实时通信**: SignalR集成
- ✅ **认证授权**: JWT + OpenIddict
- ✅ **审计日志**: 完整的操作审计
- ✅ **风险分析**: 智能风险评估系统
- ✅ **合规报告**: SOX、GDPR合规支持

### 部分实现的功能
- 🔶 **组织架构管理**: 基础实现存在，需要UI优化
- 🔶 **数据权限过滤**: 引擎存在，需要EF Core集成
- 🔶 **高级权限矩阵**: 基础UI存在，需要批量操作等增强

## 开发命令

### 前端开发
```bash
cd src/SmartAbp.Vue
npm run dev              # 开发服务器
npm run build           # 生产构建
npm run type-check      # TypeScript类型检查
npm run lint            # ESLint检查和修复
npm run test:coverage   # 测试覆盖率
npm run cypress:open    # E2E测试
```

### 后端开发
```bash
cd src/SmartAbp.Web
dotnet run              # 运行Web应用
dotnet build            # 构建项目
dotnet test             # 运行测试
```

### 代码生成
```bash
npm run codegen         # 运行代码生成
npm run module:add      # 添加新模块
```

## 质量保证
- **测试覆盖率**: ≥80% (Vitest + C8)
- **代码质量**: ESLint 9.34.0 + TypeScript严格模式
- **E2E测试**: Cypress 15.1.0
- **性能监控**: Lighthouse + Bundle分析
- **安全检查**: 内置安全验证工具

## 开发规范
- **代码风格**: Prettier 3.6.2 + ESLint
- **提交规范**: Husky + lint-staged
- **TypeScript**: 严格模式，100%类型安全
- **Vue3**: Composition API + `<script setup>`
- **Element Plus**: 企业级UI组件库集成

## 性能指标
- **构建时间**: Vite 7.0.6高性能构建
- **包大小**: Tree-shaking优化
- **运行时性能**: Vue 3.5.13 + 现代浏览器优化
- **代码生成**: Roslyn AST高性能生成

## 部署环境
- **开发环境**: Vite dev server + .NET Kestrel
- **生产环境**: Docker + Kubernetes支持
- **CI/CD**: GitHub Actions集成
- **监控**: 完整的性能和错误监控