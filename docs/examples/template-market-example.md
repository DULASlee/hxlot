# SmartAbp 模板市场实战示例

## 📋 概述

本文档提供SmartAbp模板市场和智能推荐系统的完整实战示例，帮助开发者快速上手。

## 🎯 场景一：创建企业项目管理系统

### 需求分析

我们要创建一个企业项目管理系统，包含以下功能：
- 项目CRUD管理
- 任务审批工作流
- 数据统计仪表板
- 权限管理

### 步骤1：获取智能推荐

```typescript
import { 
  IntelligentRecommendationEngine,
  useTemplateMarketStore 
} from '@smartabp/lowcode-core'

// 1. 定义项目特征
const projectFeatures = {
  entityCount: 3,              // 项目、任务、团队成员
  hasWorkflow: true,           // 需要审批流程
  hasComplexRules: false,      // 业务规则相对简单
  hasAuth: true,               // 需要权限管理
  uiFramework: 'Vue3',
  backendFramework: 'ABP',
  complexity: 'medium'
}

// 2. 获取智能推荐
const engine = new IntelligentRecommendationEngine()
const recommendations = engine.recommendTemplates(projectFeatures)

console.log('🎯 获得以下推荐:')
recommendations.forEach((rec, index) => {
  console.log(`${index + 1}. ${rec.title}`)
  console.log(`   ${rec.description}`)
  console.log(`   置信度: ${(rec.confidence * 100).toFixed(0)}%`)
  console.log(`   优先级: ${rec.priority}/5`)
  console.log('')
})

// 输出示例:
// 🎯 获得以下推荐:
// 1. CRUD基础模板
//    适合您的项目的标准CRUD操作模板
//    置信度: 90%
//    优先级: 5/5
//
// 2. 审批工作流模板
//    包含完整审批流程的工作流模板
//    置信度: 85%
//    优先级: 4/5
```

### 步骤2：浏览模板市场

```typescript
const marketStore = useTemplateMarketStore()

// 1. 加载所有模板
await marketStore.loadTemplates()

console.log('📦 模板市场共有 ${marketStore.templates.length} 个模板')

// 2. 按分类浏览
const categories = marketStore.categories
console.log('📂 可用分类:', categories)
// 输出: ['基础功能', '业务流程', 'UI组件']

// 3. 筛选CRUD相关模板
marketStore.updateFilter({
  category: '基础功能',
  tags: ['CRUD']
})

console.log('🔍 CRUD模板:')
marketStore.filteredTemplates.forEach(template => {
  console.log(`- ${template.displayName}`)
  console.log(`  ${template.description}`)
  console.log(`  ⭐ ${template.rating} (${template.reviewCount}条评价)`)
  console.log(`  📥 ${template.downloads}次下载`)
  console.log('')
})
```

### 步骤3：查看模板详情

```typescript
// 1. 加载CRUD模板详情
await marketStore.loadTemplateDetail('crud-basic')

const detail = marketStore.currentTemplate

console.log('📖 模板详情:')
console.log('名称:', detail.displayName)
console.log('版本:', detail.version)
console.log('作者:', detail.author)
console.log('是否官方:', detail.isOfficial ? '是' : '否')
console.log('')
console.log('说明文档:')
console.log(detail.readme)
console.log('')
console.log('依赖项:', detail.dependencies)
console.log('更新日志:', detail.changeLog)
```

### 步骤4：下载并应用模板

```typescript
// 1. 下载模板
const template = await marketStore.downloadTemplate('crud-basic')

console.log(`✅ 模板 "${template.displayName}" 下载成功！`)
console.log(`📊 该模板已被下载 ${template.downloads} 次`)

// 2. 应用模板到项目实体
// TODO: 集成到实际的代码生成流程
// 示例配置:
const entityConfig = {
  entityName: 'Project',
  displayName: '项目',
  fields: [
    { name: 'name', type: 'string', displayName: '项目名称', required: true },
    { name: 'description', type: 'string', displayName: '项目描述' },
    { name: 'startDate', type: 'date', displayName: '开始日期' },
    { name: 'endDate', type: 'date', displayName: '结束日期' },
    { name: 'status', type: 'enum', displayName: '状态', 
      options: ['待开始', '进行中', '已完成', '已取消'] }
  ]
}

// applyTemplate(template, entityConfig)
```

### 步骤5：评价模板

```typescript
// 使用后给予评价
await marketStore.rateTemplate(
  'crud-basic',
  5,
  '非常好用！10分钟就完成了项目的CRUD功能，节省了大量时间！'
)

console.log('✅ 评价提交成功，感谢您的反馈！')
```

## 🎯 场景二：优化现有代码

### 需求分析

我们有一个用户服务代码，需要检查是否有优化空间。

### 原始代码

```typescript
// UserService.ts
export class UserService {
  // 问题1: 返回类型使用any
  async getUsers(): any {
    const users = await this.fetchFromDatabase()
    return users
  }
  
  // 问题2: SQL注入风险
  async getUserById(userId: string) {
    const sql = "SELECT * FROM Users WHERE id = " + userId
    return await this.db.ExecuteSql(sql)
  }
  
  // 问题3: 大列表性能问题
  renderUserList() {
    const users = this.getUsers()
    return `
      <div v-for="user in users" :key="user.id">
        <UserCard :user="user" />
      </div>
    `
  }
}
```

### 步骤1：获取优化建议

```typescript
const engine = new IntelligentRecommendationEngine()

// 读取代码文件
const code = fs.readFileSync('UserService.ts', 'utf-8')

// 获取优化建议
const optimizations = engine.suggestOptimizations(code, 'typescript')

console.log('⚡ 代码优化建议:')
optimizations.forEach((opt, index) => {
  console.log(`\n${index + 1}. ${opt.title}`)
  console.log(`   ${opt.description}`)
  console.log(`   💭 ${opt.reason}`)
  console.log(`   优先级: ${opt.priority}/5 (${opt.priority >= 4 ? '⚡ 高优先级' : '✅ 常规'})`)
  console.log(`   置信度: ${(opt.confidence * 100).toFixed(0)}%`)
  
  if (opt.actionable) {
    console.log(`   🔧 可自动修复`)
  }
})

// 输出示例:
// ⚡ 代码优化建议:
//
// 1. 修复SQL注入风险
//    检测到字符串拼接SQL，存在注入风险
//    💭 应使用参数化查询
//    优先级: 5/5 (⚡ 高优先级)
//    置信度: 95%
//    🔧 可自动修复
//
// 2. 改善类型安全
//    检测到2处使用any类型
//    💭 建议使用具体类型替代any
//    优先级: 3/5 (✅ 常规)
//    置信度: 80%
//    🔧 可自动修复
```

### 步骤2：应用优化建议

```typescript
// 优化后的代码
export interface User {
  id: string
  name: string
  email: string
  role: string
}

export class UserService {
  // ✅ 修复1: 明确返回类型
  async getUsers(): Promise<User[]> {
    const users = await this.fetchFromDatabase()
    return users
  }
  
  // ✅ 修复2: 使用参数化查询
  async getUserById(userId: string): Promise<User | null> {
    const sql = "SELECT * FROM Users WHERE id = @userId"
    const result = await this.db.ExecuteSql(sql, { userId })
    return result[0] || null
  }
  
  // ✅ 修复3: 使用虚拟滚动
  renderUserList() {
    const users = this.getUsers()
    return `
      <virtual-list :data="users" :item-height="80">
        <template #default="{ item }">
          <UserCard :user="item" />
        </template>
      </virtual-list>
    `
  }
}
```

### 步骤3：验证优化效果

```typescript
// 重新检查优化后的代码
const optimizedCode = fs.readFileSync('UserService.ts', 'utf-8')
const newOptimizations = engine.suggestOptimizations(optimizedCode, 'typescript')

console.log(`\n📊 优化前: ${optimizations.length} 个问题`)
console.log(`📊 优化后: ${newOptimizations.length} 个问题`)
console.log(`✅ 改进: ${optimizations.length - newOptimizations.length} 个问题已修复`)

if (newOptimizations.length === 0) {
  console.log('🎉 恭喜！代码已达到最佳实践标准！')
}
```

## 🎯 场景三：大型项目最佳实践检查

### 项目结构

```
src/
├── services/
│   ├── user_service.ts (650行)
│   ├── order_service.ts (450行)
│   └── product_service.ts (380行)
├── components/
│   ├── user_management.vue (520行)
│   └── dashboard.vue (350行)
└── utils/
    ├── helpers.ts (280行)
    └── validators.ts (150行)
```

### 步骤1：批量检查所有文件

```typescript
const engine = new IntelligentRecommendationEngine()

const files = [
  { name: 'user_service.ts', lines: 650, type: 'typescript' },
  { name: 'order_service.ts', lines: 450, type: 'typescript' },
  { name: 'user_management.vue', lines: 520, type: 'vue' }
]

console.log('🔍 最佳实践检查:')

files.forEach(file => {
  const suggestions = engine.suggestBestPractices({
    fileName: file.name,
    fileType: file.type,
    codeLines: file.lines
  })
  
  if (suggestions.length > 0) {
    console.log(`\n📄 ${file.name}:`)
    suggestions.forEach(sug => {
      console.log(`  💡 ${sug.title}`)
      console.log(`     ${sug.description}`)
    })
  }
})

// 输出示例:
// 🔍 最佳实践检查:
//
// 📄 user_service.ts:
//   💡 考虑拆分大文件
//      文件有650行，建议拆分
//   💡 使用PascalCase命名
//      建议使用PascalCase而非snake_case
//
// 📄 user_management.vue:
//   💡 考虑拆分大文件
//      文件有520行，建议拆分
```

### 步骤2：生成改进报告

```typescript
interface ImprovementReport {
  totalFiles: number
  filesWithIssues: number
  totalSuggestions: number
  byPriority: {
    high: number
    medium: number
    low: number
  }
  topSuggestions: Recommendation[]
}

function generateImprovementReport(files: any[]): ImprovementReport {
  const allSuggestions: Recommendation[] = []
  
  files.forEach(file => {
    const code = fs.readFileSync(file.path, 'utf-8')
    const opts = engine.suggestOptimizations(code, file.type)
    const bps = engine.suggestBestPractices({
      fileName: file.name,
      fileType: file.type,
      codeLines: code.split('\n').length
    })
    
    allSuggestions.push(...opts, ...bps)
  })
  
  const report: ImprovementReport = {
    totalFiles: files.length,
    filesWithIssues: new Set(allSuggestions.map(s => s.id)).size,
    totalSuggestions: allSuggestions.length,
    byPriority: {
      high: allSuggestions.filter(s => s.priority >= 4).length,
      medium: allSuggestions.filter(s => s.priority === 3).length,
      low: allSuggestions.filter(s => s.priority < 3).length
    },
    topSuggestions: allSuggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5)
  }
  
  return report
}

// 生成并显示报告
const report = generateImprovementReport(files)

console.log('\n📊 项目改进报告:')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`文件总数: ${report.totalFiles}`)
console.log(`有问题的文件: ${report.filesWithIssues}`)
console.log(`建议总数: ${report.totalSuggestions}`)
console.log('')
console.log('按优先级分类:')
console.log(`  ⚡ 高优先级: ${report.byPriority.high}`)
console.log(`  ⚠️  中优先级: ${report.byPriority.medium}`)
console.log(`  ℹ️  低优先级: ${report.byPriority.low}`)
console.log('')
console.log('🔝 Top 5 改进建议:')
report.topSuggestions.forEach((sug, index) => {
  console.log(`${index + 1}. ${sug.title} (优先级: ${sug.priority}/5)`)
})
```

## 💡 实用技巧

### 技巧1：定期运行智能检查

```typescript
// 在CI/CD流程中集成
async function runIntelligentCheck() {
  const engine = new IntelligentRecommendationEngine()
  const files = getAllSourceFiles()
  
  let criticalIssues = 0
  
  for (const file of files) {
    const code = fs.readFileSync(file.path, 'utf-8')
    const optimizations = engine.suggestOptimizations(code, file.type)
    
    // 统计关键问题
    criticalIssues += optimizations.filter(opt => opt.priority >= 4).length
  }
  
  if (criticalIssues > 0) {
    console.error(`❌ 发现 ${criticalIssues} 个高优先级问题，构建失败！`)
    process.exit(1)
  }
  
  console.log('✅ 智能检查通过！')
}
```

### 技巧2：集成到编辑器

```typescript
// VS Code扩展示例
vscode.workspace.onDidChangeTextDocument(async (event) => {
  const document = event.document
  const code = document.getText()
  
  const optimizations = engine.suggestOptimizations(
    code,
    document.languageId
  )
  
  // 在编辑器中显示建议
  showInlineSuggestions(optimizations)
})
```

### 技巧3：自动修复

```typescript
function autoFix(code: string, recommendation: Recommendation): string {
  const { fixType } = recommendation.action?.payload || {}
  
  switch (fixType) {
    case 'sql-injection':
      return code.replace(
        /ExecuteSql\(".*?" \+ (\w+)\)/g,
        'ExecuteSql("...WHERE id = @$1", { $1 })'
      )
      
    case 'remove-console':
      return code.replace(/console\.(log|warn|error)\(.*?\);?/g, '')
      
    case 'type-any':
      // 更复杂的类型推导...
      return code
      
    default:
      return code
  }
}
```

## 📚 学习资源

- [智能推荐引擎API文档](./intelligent-recommendation-guide.md)
- [模板市场使用指南](./template-market-guide.md)
- [代码质量最佳实践](./best-practices.md)

## 🎉 总结

通过本示例，您学习了：

1. ✅ 如何使用智能推荐获取模板建议
2. ✅ 如何浏览和使用模板市场
3. ✅ 如何获取代码优化建议
4. ✅ 如何进行最佳实践检查
5. ✅ 如何生成改进报告

立即开始使用SmartAbp智能推荐系统，提升您的开发效率！

---

**示例维护**: SmartAbp团队  
**最后更新**: 2025-10-03
