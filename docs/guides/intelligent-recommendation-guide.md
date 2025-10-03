# SmartAbp 智能推荐引擎使用指南

## 📋 概述

SmartAbp智能推荐引擎是一个基于规则的智能辅助系统，通过分析项目特征和代码质量，提供准确的模板推荐和优化建议，帮助开发者提升开发效率和代码质量。

## 🎯 设计理念

### 为什么选择基于规则而非AI？

**独立技术判断**：基于以下理由，我们选择了基于规则的智能推荐：

1. **可控性强**: 规则明确，结果可预测
2. **可靠性高**: 无AI不确定性和幻觉问题
3. **可解释性**: 推荐原因清晰透明
4. **维护成本低**: 规则易于更新和维护
5. **性能优越**: 无AI模型加载和推理开销

## 🚀 快速开始

### 1. 基本使用

```typescript
import { IntelligentRecommendationEngine } from '@smartabp/lowcode-core'

// 创建推荐引擎实例
const engine = new IntelligentRecommendationEngine()

// 获取推荐
const recommendations = engine.getRecommendations({
  projectFeatures: {
    entityCount: 5,
    hasWorkflow: true,
    hasComplexRules: false,
    hasAuth: true,
    uiFramework: 'Vue3',
    backendFramework: 'ABP',
    complexity: 'medium'
  }
})

// 处理推荐结果
recommendations.forEach(rec => {
  console.log(`[${rec.type}] ${rec.title}`)
  console.log(`  ${rec.description}`)
  console.log(`  原因: ${rec.reason}`)
  console.log(`  置信度: ${(rec.confidence * 100).toFixed(0)}%`)
  console.log(`  优先级: ${rec.priority}/5`)
  
  if (rec.actionable && rec.action) {
    console.log(`  操作: ${rec.action.type}`)
  }
})
```

### 2. 项目特征推荐

```typescript
// 定义项目特征
const projectFeatures = {
  entityCount: 10,           // 实体数量
  hasWorkflow: true,         // 是否需要工作流
  hasComplexRules: true,     // 是否有复杂业务规则
  hasAuth: true,             // 是否需要权限管理
  uiFramework: 'Vue3',       // 前端框架
  backendFramework: 'ABP',   // 后端框架
  complexity: 'complex'      // 项目复杂度: simple | medium | complex
}

// 获取模板推荐
const templateRecs = engine.recommendTemplates(projectFeatures)

templateRecs.forEach(rec => {
  if (rec.actionable && rec.action?.type === 'apply') {
    const templateId = rec.action.payload.templateId
    console.log(`可直接应用模板: ${templateId}`)
  }
})
```

### 3. 代码优化建议

```typescript
const code = `
export class UserService {
  async getUsers(): any {
    const sql = "SELECT * FROM Users WHERE id = " + userId
    return await db.ExecuteSql(sql)
  }
}
`

// 获取优化建议
const optimizations = engine.suggestOptimizations(code, 'typescript')

optimizations.forEach(opt => {
  console.log(`⚠️ ${opt.title}`)
  console.log(`   ${opt.description}`)
  console.log(`   ${opt.reason}`)
  
  if (opt.priority >= 4) {
    console.log(`   ⚡ 高优先级！建议立即处理`)
  }
})
```

### 4. 最佳实践建议

```typescript
// 获取文件最佳实践建议
const bestPractices = engine.suggestBestPractices({
  fileName: 'user_service.ts',
  fileType: 'typescript',
  codeLines: 650
})

bestPractices.forEach(bp => {
  console.log(`💡 ${bp.title}`)
  console.log(`   ${bp.description}`)
})
```

## 📊 推荐类型详解

### 1. 模板推荐 (template)

基于项目特征智能推荐合适的代码模板。

**推荐规则**:

| 项目特征 | 推荐模板 | 置信度 |
|---------|---------|--------|
| 简单项目 + 实体定义 | CRUD基础模板 | 90% |
| 包含工作流 | 审批工作流模板 | 85% |
| 复杂业务规则 | DDD领域驱动设计 | 80% |
| 权限管理 | RBAC权限模板 | 85% |
| 微服务架构 | 微服务模板集 | 75% |

**示例输出**:

```json
{
  "id": "rec-crud-basic",
  "type": "template",
  "title": "CRUD基础模板",
  "description": "适合您的项目的标准CRUD操作模板",
  "reason": "您的项目有实体定义，推荐使用CRUD模板快速生成",
  "confidence": 0.9,
  "priority": 5,
  "actionable": true,
  "action": {
    "type": "apply",
    "payload": { "templateId": "crud-basic" }
  }
}
```

### 2. 代码优化建议 (optimization)

分析代码质量，提供性能、安全、类型安全等方面的优化建议。

**检测规则**:

| 检测项 | 触发条件 | 优先级 | 置信度 |
|-------|---------|-------|--------|
| SQL注入风险 | 字符串拼接SQL | 5 | 95% |
| 虚拟滚动优化 | 大列表渲染 | 3 | 75% |
| any类型滥用 | any使用>3次 | 3 | 80% |
| 未处理Promise | async无await | 4 | 85% |
| 内存泄漏风险 | 事件监听未清理 | 4 | 80% |

**示例输出**:

```json
{
  "id": "sec-sql-injection",
  "type": "optimization",
  "title": "修复SQL注入风险",
  "description": "检测到字符串拼接SQL，存在注入风险",
  "reason": "应使用参数化查询",
  "confidence": 0.95,
  "priority": 5,
  "actionable": true,
  "action": {
    "type": "apply",
    "payload": { "fixType": "sql-injection" }
  }
}
```

### 3. 最佳实践建议 (bestPractice)

基于业界标准和项目规范，提供编码最佳实践建议。

**建议规则**:

| 检测项 | 触发条件 | 建议 |
|-------|---------|-----|
| 文件过大 | >500行 | 拆分文件 |
| 函数过长 | >100行 | 拆分函数 |
| 命名不规范 | snake_case | 使用PascalCase |
| 缺少注释 | 复杂逻辑无注释 | 添加注释 |
| 魔法数字 | 硬编码常量 | 提取为常量 |

## 🎨 在Vue组件中使用

### 集成到开发界面

```vue
<template>
  <div class="recommendation-panel">
    <h3>💡 智能建议</h3>
    
    <div v-for="rec in recommendations" :key="rec.id" class="recommendation-item">
      <div class="rec-header">
        <span class="rec-type">{{ typeLabel(rec.type) }}</span>
        <span class="rec-priority">优先级: {{ rec.priority }}/5</span>
      </div>
      
      <h4>{{ rec.title }}</h4>
      <p>{{ rec.description }}</p>
      <p class="rec-reason">💭 {{ rec.reason }}</p>
      
      <div class="rec-confidence">
        <el-progress 
          :percentage="rec.confidence * 100" 
          :color="confidenceColor(rec.confidence)"
        />
      </div>
      
      <el-button 
        v-if="rec.actionable"
        type="primary"
        size="small"
        @click="applyRecommendation(rec)"
      >
        应用建议
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IntelligentRecommendationEngine } from '@smartabp/lowcode-core'

const engine = new IntelligentRecommendationEngine()
const recommendations = ref([])

onMounted(() => {
  loadRecommendations()
})

const loadRecommendations = () => {
  // 获取当前项目特征
  const features = getCurrentProjectFeatures()
  
  // 获取推荐
  recommendations.value = engine.getRecommendations({
    projectFeatures: features
  })
}

const typeLabel = (type: string) => {
  const labels = {
    template: '📦 模板推荐',
    optimization: '⚡ 优化建议',
    bestPractice: '💡 最佳实践'
  }
  return labels[type] || type
}

const confidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return '#67C23A'
  if (confidence >= 0.6) return '#E6A23C'
  return '#F56C6C'
}

const applyRecommendation = (rec: any) => {
  if (rec.action?.type === 'apply') {
    // 应用推荐
    console.log('应用推荐:', rec.action.payload)
  }
}
</script>
```

## 🔧 自定义推荐规则

### 扩展推荐引擎

```typescript
class CustomRecommendationEngine extends IntelligentRecommendationEngine {
  // 添加自定义模板推荐规则
  recommendTemplates(features: ProjectFeatures): Recommendation[] {
    const recommendations = super.recommendTemplates(features)
    
    // 添加自定义规则
    if (features.entityCount > 20) {
      recommendations.push({
        id: 'rec-batch-operations',
        type: 'template',
        title: '批量操作模板',
        description: '适合大量实体的批量操作模板',
        reason: '检测到实体数量较多，建议使用批量操作提升效率',
        confidence: 0.85,
        priority: 4,
        actionable: true,
        action: {
          type: 'apply',
          payload: { templateId: 'batch-operations' }
        }
      })
    }
    
    return recommendations
  }
  
  // 添加自定义代码检查规则
  suggestOptimizations(code: string, fileType: string): Recommendation[] {
    const recommendations = super.suggestOptimizations(code, fileType)
    
    // 检查自定义模式
    if (code.includes('console.log') && fileType === 'typescript') {
      recommendations.push({
        id: 'opt-remove-console',
        type: 'optimization',
        title: '移除调试代码',
        description: '检测到console.log调试语句',
        reason: '生产代码中应移除调试语句',
        confidence: 0.9,
        priority: 2,
        actionable: true,
        action: {
          type: 'apply',
          payload: { fixType: 'remove-console' }
        }
      })
    }
    
    return recommendations
  }
}
```

## 📈 推荐效果评估

### 统计推荐采纳率

```typescript
class RecommendationTracker {
  private appliedRecommendations: Set<string> = new Set()
  private totalRecommendations: number = 0
  
  trackRecommendation(recId: string) {
    this.totalRecommendations++
  }
  
  trackApplied(recId: string) {
    this.appliedRecommendations.add(recId)
  }
  
  getAdoptionRate(): number {
    return this.appliedRecommendations.size / this.totalRecommendations
  }
  
  getReport() {
    return {
      total: this.totalRecommendations,
      applied: this.appliedRecommendations.size,
      adoptionRate: this.getAdoptionRate(),
      effectiveness: this.getAdoptionRate() >= 0.6 ? '高' : '中'
    }
  }
}
```

## 🏆 最佳实践

### 1. 定期获取推荐

在开发过程中定期获取推荐，而不是等到最后：

```typescript
// 在代码编辑时实时获取建议
const onCodeChange = debounce((code: string) => {
  const optimizations = engine.suggestOptimizations(code, 'typescript')
  displayRecommendations(optimizations)
}, 1000)
```

### 2. 优先处理高优先级建议

```typescript
const criticalRecs = recommendations.filter(rec => rec.priority >= 4)
if (criticalRecs.length > 0) {
  showCriticalAlert(criticalRecs)
}
```

### 3. 追踪推荐效果

```typescript
const tracker = new RecommendationTracker()

recommendations.forEach(rec => {
  tracker.trackRecommendation(rec.id)
  
  if (userApplied(rec)) {
    tracker.trackApplied(rec.id)
  }
})

console.log('采纳率:', tracker.getAdoptionRate())
```

## 📚 相关资源

- [模板市场使用指南](./template-market-guide.md)
- [代码质量分析文档](./code-quality-analyzer-guide.md)
- [最佳实践集合](./best-practices.md)

## 📝 更新日志

### v1.0.0 (2025-10-03)
- ✅ 基于规则的智能推荐引擎
- ✅ 模板推荐功能
- ✅ 代码优化建议
- ✅ 最佳实践建议
- ✅ 置信度和优先级评分

---

**文档维护**: SmartAbp团队  
**最后更新**: 2025-10-03
