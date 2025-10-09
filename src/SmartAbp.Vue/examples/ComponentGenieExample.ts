/**
 * ComponentGenie集成示例
 * 🧠 展示如何在SmartAbp项目中使用AI增强的组件注册系统
 */

import { globalComponentRegistry } from '@smartabp/lowcode-shared'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 示例：注册带AI分析的组件
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const sampleFormComponent = `
<template>
  <el-form :model="form" :rules="rules" @submit="handleSubmit">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" placeholder="请输入用户名" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" type="email" placeholder="请输入邮箱" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const form = reactive({
  username: '',
  email: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }]
}

const handleSubmit = () => {
  console.log('提交表单:', form)
}

const handleReset = () => {
  form.username = ''
  form.email = ''
}
</script>
`

const sampleDataTableComponent = `
<template>
  <el-table :data="tableData" style="width: 100%">
    <el-table-column prop="name" label="姓名" width="180" />
    <el-table-column prop="email" label="邮箱" width="180" />
    <el-table-column prop="role" label="角色" />
    <el-table-column label="操作">
      <template #default="{ row }">
        <el-button size="small" @click="handleEdit(row)">编辑</el-button>
        <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tableData = ref([
  { name: '张三', email: 'zhangsan@example.com', role: '管理员' },
  { name: '李四', email: 'lisi@example.com', role: '用户' }
])

const handleEdit = (row: any) => {
  console.log('编辑:', row)
}

const handleDelete = (row: any) => {
  console.log('删除:', row)
}
</script>
`

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 使用示例：注册组件并获得AI分析
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function runComponentGenieExample() {
  console.log('🚀 ComponentGenie集成示例开始...')
  
  // 1. 注册表单组件（AI会自动分析）
  await globalComponentRegistry.register({
    name: 'UserForm',
    displayName: '用户表单',
    description: '用户信息输入表单',
    category: 'form', // 手动分类
    priority: 'medium',
    dependencies: [],
    bundle: '@smartabp/examples',
    lazy: false,
    preload: true,
    version: '1.0.0',
    tags: ['form', 'user', 'input'],
    sourceCode: sampleFormComponent // ✨ AI会分析这个源代码
  })
  
  // 2. 注册数据表格组件（AI会自动分析）
  await globalComponentRegistry.register({
    name: 'UserTable',
    displayName: '用户数据表格',
    description: '用户数据展示表格',
    category: 'basic', // 手动分类，AI可能会建议'data'
    priority: 'high',
    dependencies: [],
    bundle: '@smartabp/examples',
    lazy: false,
    preload: true,
    version: '1.0.0',
    tags: ['table', 'data', 'user'],
    sourceCode: sampleDataTableComponent // ✨ AI会分析这个源代码
  })
  
  // 3. 直接使用ComponentGenie进行分析演示
  console.log('\n📊 直接AI分析演示:')
  
  // 直接分析表单组件
  const userFormAnalysis = analyzeComponent('UserForm', sampleFormComponent)
  console.log(`\n🧠 UserForm AI分析:`)
  console.log(`   分类: ${userFormAnalysis.category}`)
  console.log(`   置信度: ${(userFormAnalysis.confidence * 100).toFixed(1)}%`)
  console.log(`   优化建议数: ${userFormAnalysis.suggestions.length}`)
  userFormAnalysis.suggestions.forEach((suggestion: any, index: number) => {
    console.log(`   ${index + 1}. [${suggestion.type}] ${suggestion.message}`)
  })
  
  // 直接分析表格组件
  const userTableAnalysis = analyzeComponent('UserTable', sampleDataTableComponent)  
  console.log(`\n🧠 UserTable AI分析:`)
  console.log(`   分类: ${userTableAnalysis.category}`)
  console.log(`   置信度: ${(userTableAnalysis.confidence * 100).toFixed(1)}%`)
  console.log(`   优化建议数: ${userTableAnalysis.suggestions.length}`)
  userTableAnalysis.suggestions.forEach((suggestion: any, index: number) => {
    console.log(`   ${index + 1}. [${suggestion.type}] ${suggestion.message}`)
  })
  
  // 4. 使用ComponentGenie的全局统计
  const { getAIStatistics } = await import('@smartabp/lowcode-shared')
  const aiStats = getAIStatistics()
  console.log('\n📈 ComponentGenie全局统计:')
  console.log(`   已分析组件: ${aiStats.totalAnalyzed}个`)
  console.log(`   平均置信度: ${(aiStats.averageConfidence * 100).toFixed(1)}%`)
  console.log(`   分类分布:`, aiStats.categoryDistribution)
  console.log(`   独特模式: ${aiStats.uniquePatterns}个`)
  console.log(`   学习数据点: ${aiStats.learningDataPoints}个`)
  
  console.log('\n✅ ComponentGenie集成示例完成！')
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 Vue组合式API使用示例
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function useComponentAI() {
  /**
   * 实时AI分析组件代码
   */
  const analyzeComponentCode = (name: string, code: string) => {
    return analyzeComponent(name, code)
  }
  
  /**
   * 获取AI优化建议
   */
  const getOptimizationSuggestions = (name: string, code: string) => {
    const analysis = analyzeComponent(name, code)
    return analysis.suggestions
  }
  
  /**
   * 预测最佳组件分类
   */
  const predictBestCategory = (code: string) => {
    const { predictCategory } = require('@smartabp/lowcode-shared')
    return predictCategory(code)
  }
  
  /**
   * 批量分析组件
   */
  const analyzeBatch = async (components: Array<{name: string, code: string}>) => {
    const { analyzeBatch: batchAnalyze } = await import('@smartabp/lowcode-shared')
    return batchAnalyze(components)
  }
  
  return {
    analyzeComponentCode,
    getOptimizationSuggestions,
    predictBestCategory,
    analyzeBatch
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💡 在Vue组件中的使用示例
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
// 在Vue组件中使用ComponentGenie
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useComponentAI } from '@/examples/ComponentGenieExample'

const { getOptimizationSuggestions, getAISuggestedCategory } = useComponentAI()

const currentComponent = ref('UserForm')
const suggestions = ref([])
const aiCategory = ref('')

onMounted(() => {
  // 获取AI优化建议
  suggestions.value = getOptimizationSuggestions(currentComponent.value)
  
  // 获取AI推荐分类
  aiCategory.value = getAISuggestedCategory(currentComponent.value)
  
  console.log(`🧠 ${currentComponent.value} AI建议:`, suggestions.value)
  console.log(`🎯 AI推荐分类: ${aiCategory.value}`)
})
</script>

<template>
  <div class="component-ai-panel">
    <h3>🧠 AI组件分析</h3>
    <p>组件: {{ currentComponent }}</p>
    <p>AI推荐分类: {{ aiCategory }}</p>
    
    <div class="ai-suggestions" v-if="suggestions.length">
      <h4>💡 优化建议:</h4>
      <ul>
        <li v-for="(suggestion, index) in suggestions" :key="index">
          <span class="tag">{{ suggestion.type }}</span>
          {{ suggestion.message }}
          <small>(影响: {{ suggestion.impact }}/5, 难度: {{ suggestion.difficulty }}/5)</small>
        </li>
      </ul>
    </div>
  </div>
</template>
*/
