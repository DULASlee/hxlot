# SmartAbp 模板市场使用指南

## 📋 概述

SmartAbp模板市场是一个企业级的代码模板管理和分享平台，为开发者提供丰富的预置模板，加速开发效率。

## 🚀 快速开始

### 1. 浏览模板

```typescript
import { useTemplateMarketStore } from '@smartabp/lowcode-core'

const marketStore = useTemplateMarketStore()

// 加载所有模板
await marketStore.loadTemplates()

// 查看所有模板
console.log(marketStore.templates)

// 查看筛选后的模板
console.log(marketStore.filteredTemplates)
```

### 2. 搜索模板

```typescript
// 按关键词搜索
marketStore.searchTemplates('CRUD')

// 按分类筛选
marketStore.updateFilter({ category: '基础功能' })

// 按标签筛选
marketStore.updateFilter({ tags: ['工作流', '审批'] })

// 多条件组合筛选
marketStore.updateFilter({
  category: '业务流程',
  minRating: 4.5,
  isOfficial: true
})
```

### 3. 查看模板详情

```typescript
// 加载模板详情
await marketStore.loadTemplateDetail('crud-basic')

// 访问模板详情
const detail = marketStore.currentTemplate
console.log(detail.readme)
console.log(detail.dependencies)
console.log(detail.reviews)
```

### 4. 下载和使用模板

```typescript
// 下载模板
const template = await marketStore.downloadTemplate('crud-basic')

// 应用模板（示例）
// TODO: 集成到代码生成流程
```

### 5. 评价模板

```typescript
// 对模板进行评分和评论
await marketStore.rateTemplate(
  'crud-basic',
  5,
  '非常好用的CRUD模板，节省了很多时间！'
)
```

## 📊 模板分类

### 基础功能
- **CRUD基础模板**: 标准增删改查操作
- **表单模板**: 各类表单组件
- **列表模板**: 数据列表展示

### 业务流程
- **审批工作流**: 多级审批流程
- **业务规则**: 复杂业务规则引擎
- **状态机**: 状态流转管理

### UI组件
- **仪表板**: 数据可视化看板
- **图表组件**: 各类图表封装
- **表格组件**: 高级数据表格

### 高级架构
- **DDD模板**: 领域驱动设计
- **CQRS模板**: 命令查询分离
- **微服务模板**: 微服务架构

## 🎯 智能推荐

### 自动模板推荐

系统会根据您的项目特征自动推荐合适的模板：

```typescript
import { IntelligentRecommendationEngine } from '@smartabp/lowcode-core'

const engine = new IntelligentRecommendationEngine()

const recommendations = engine.recommendTemplates({
  entityCount: 5,
  hasWorkflow: true,
  hasComplexRules: false,
  hasAuth: true,
  uiFramework: 'Vue3',
  backendFramework: 'ABP',
  complexity: 'medium'
})

recommendations.forEach(rec => {
  console.log(`${rec.title}: ${rec.description}`)
  console.log(`置信度: ${rec.confidence}, 优先级: ${rec.priority}`)
})
```

### 代码优化建议

智能引擎还会分析您的代码并提供优化建议：

```typescript
const code = `
// 您的代码
export function getData(): any {
  // ...
}
`

const optimizations = engine.suggestOptimizations(code, 'typescript')

optimizations.forEach(opt => {
  console.log(`${opt.title}: ${opt.description}`)
  console.log(`原因: ${opt.reason}`)
})
```

## 🏆 最佳实践

### 1. 选择合适的模板

- 优先选择官方认证模板
- 查看模板评分和下载量
- 阅读模板说明和依赖
- 查看用户评价

### 2. 自定义模板

- 基于现有模板进行修改
- 遵循项目命名规范
- 添加完整的文档说明
- 提交到私有仓库共享

### 3. 模板维护

- 定期更新模板版本
- 修复已知问题
- 响应用户反馈
- 保持向后兼容

## 📖 常见问题

### Q: 如何创建自己的模板？

A: 使用模板管理系统创建模板：

```typescript
// TODO: 提供模板创建API
```

### Q: 模板存储在哪里？

A: 
- 公共模板：存储在SmartAbp官方仓库
- 企业私有模板：存储在企业私有仓库
- 本地模板：存储在项目本地

### Q: 模板如何版本管理？

A: 每个模板遵循语义化版本规范(SemVer)：
- 主版本号：不兼容的API变更
- 次版本号：向后兼容的功能新增
- 修订号：向后兼容的问题修正

### Q: 如何贡献模板？

A: 欢迎贡献高质量模板：
1. Fork官方模板仓库
2. 创建您的模板
3. 提交Pull Request
4. 等待审核和合并

## 🔗 相关资源

- [模板开发指南](./template-development-guide.md)
- [智能推荐引擎文档](./intelligent-recommendation-guide.md)
- [私有仓库配置](./private-repository-guide.md)

## 📝 更新日志

### v1.0.0 (2025-10-03)
- ✅ 模板市场基础功能
- ✅ 模板浏览和搜索
- ✅ 模板下载和评价
- ✅ 智能推荐引擎

---

**文档维护**: SmartAbp团队  
**最后更新**: 2025-10-03
