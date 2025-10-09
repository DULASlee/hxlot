<!--
  性能优化示例
  
  展示微AI 2.0阶段3的核心功能：
  1. PerformanceOptimizer（高级缓存与预测）
  2. PerformanceMonitor（性能监控）
  3. PerformanceDashboard（可视化面板）
-->

<template>
  <div class="performance-example">
    <h1>🚀 性能优化示例</h1>
    
    <!-- 示例1：基础性能优化 -->
    <section class="example-section">
      <h2>示例1：智能缓存与预测性加载</h2>
      <p>PerformanceOptimizer提供高级LRU缓存和预测性预加载功能</p>
      
      <div class="demo-controls">
        <button @click="loadComponent('SmartForm')">
          加载 SmartForm
        </button>
        <button @click="loadComponent('DataTable')">
          加载 DataTable
        </button>
        <button @click="loadComponent('ChartWidget')">
          加载 ChartWidget
        </button>
        <button @click="triggerPredictiveLoad">
          触发预测性加载
        </button>
      </div>
      
      <div v-if="loadedComponent" class="loaded-component">
        <h3>当前组件: {{ loadedComponent }}</h3>
        <component :is="currentComponent" />
      </div>
      
      <div class="stats-panel">
        <h4>缓存统计:</h4>
        <pre>{{ JSON.stringify(cacheStats, null, 2) }}</pre>
      </div>
    </section>

    <!-- 示例2：预测性加载演示 -->
    <section class="example-section">
      <h2>示例2：预测性加载算法</h2>
      <p>基于多种因素预测下一步可能需要的组件</p>
      
      <div class="prediction-demo">
        <div class="prediction-input">
          <label>当前组件:</label>
          <select v-model="currentComponentName">
            <option value="SmartForm">SmartForm</option>
            <option value="DataTable">DataTable</option>
            <option value="ChartWidget">ChartWidget</option>
            <option value="Dashboard">Dashboard</option>
          </select>
          <button @click="runPrediction">运行预测</button>
        </div>
        
        <div v-if="predictionResult" class="prediction-result">
          <h4>预测结果:</h4>
          <div class="prediction-item">
            <span class="label">推荐预加载:</span>
            <span class="value">{{ predictionResult.recommendations.join(', ') || '无' }}</span>
          </div>
          <div class="prediction-item">
            <span class="label">置信度:</span>
            <span class="value">{{ (predictionResult.confidence * 100).toFixed(1) }}%</span>
          </div>
          <div class="prediction-item">
            <span class="label">预测因素:</span>
            <span class="value">{{ predictionResult.factors.join(', ') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 示例3：内存管理 -->
    <section class="example-section">
      <h2>示例3：自动内存管理</h2>
      <p>智能监控内存使用，自动清理低频组件</p>
      
      <div class="memory-info">
        <div class="memory-item">
          <span class="label">已用内存:</span>
          <span class="value">{{ formatBytes(memoryInfo.used) }}</span>
        </div>
        <div class="memory-item">
          <span class="label">总内存:</span>
          <span class="value">{{ formatBytes(memoryInfo.total) }}</span>
        </div>
        <div class="memory-item">
          <span class="label">使用率:</span>
          <span class="value" :class="{ 'warning': memoryInfo.usage > 0.8 }">
            {{ (memoryInfo.usage * 100).toFixed(1) }}%
          </span>
        </div>
        <div class="memory-item">
          <span class="label">超过阈值:</span>
          <span class="value" :class="{ 'error': memoryInfo.isOverThreshold }">
            {{ memoryInfo.isOverThreshold ? '是' : '否' }}
          </span>
        </div>
      </div>
      
      <div class="memory-actions">
        <button @click="loadManyComponents">
          加载大量组件（模拟内存压力）
        </button>
        <button @click="clearOptimizer">
          清空缓存
        </button>
      </div>
    </section>

    <!-- 示例4：使用统计 -->
    <section class="example-section">
      <h2>示例4：组件使用统计</h2>
      <p>详细的组件访问统计和性能分析</p>
      
      <table class="usage-table">
        <thead>
          <tr>
            <th>组件名称</th>
            <th>访问次数</th>
            <th>平均加载时间</th>
            <th>失败次数</th>
            <th>预测分数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stat in usageStats" :key="stat.name">
            <td><code>{{ stat.name }}</code></td>
            <td>{{ stat.accessCount }}</td>
            <td>{{ stat.avgLoadTime.toFixed(2) }}ms</td>
            <td :class="{ 'error': stat.failureCount > 0 }">
              {{ stat.failureCount }}
            </td>
            <td>
              <div class="score-bar">
                <div 
                  class="score-fill" 
                  :style="{ width: (stat.predictionScore * 100) + '%' }"
                ></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 示例5：性能监控Dashboard -->
    <section class="example-section">
      <h2>示例5：性能监控Dashboard</h2>
      <p>实时性能监控和可视化分析面板</p>
      
      <PerformanceDashboard />
    </section>

    <!-- 示例6：API使用 -->
    <section class="example-section">
      <h2>示例6：完整API使用示例</h2>
      
      <div class="code-example">
        <h4>1. 创建性能优化器:</h4>
        <pre><code>{{ apiExample1 }}</code></pre>
      </div>
      
      <div class="code-example">
        <h4>2. 使用优化器加载组件:</h4>
        <pre><code>{{ apiExample2 }}</code></pre>
      </div>
      
      <div class="code-example">
        <h4>3. 预测性预加载:</h4>
        <pre><code>{{ apiExample3 }}</code></pre>
      </div>
      
      <div class="code-example">
        <h4>4. 性能监控:</h4>
        <pre><code>{{ apiExample4 }}</code></pre>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  createPerformanceOptimizer,
  globalPerformanceMonitor,
  PerformanceDashboard,
  type PredictionResult,
  type ComponentUsageStats,
  type MemoryInfo
} from '@smartabp/lowcode-shared'
import { globalComponentRegistry } from '@smartabp/lowcode-shared'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例1: 智能缓存与预测性加载
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const optimizer = createPerformanceOptimizer({
  cacheCapacity: 50,
  preloadThreshold: 2,
  memoryThreshold: 100, // 100MB
  enablePredictive: true,
  enableMonitoring: true,
  debug: true
})

const loadedComponent = ref<string>('')
const currentComponent = ref<any>(null)
const cacheStats = ref({})

const loadComponent = async (name: string) => {
  const startTime = performance.now()
  
  try {
    const component = await optimizer.get(name, async () => {
      // 模拟组件加载
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100))
      return { template: `<div>模拟组件: ${name}</div>` }
    })
    
    loadedComponent.value = name
    currentComponent.value = component
    
    const loadTime = performance.now() - startTime
    console.log(`组件 ${name} 加载完成，耗时: ${loadTime.toFixed(2)}ms`)
    
    // 更新统计
    cacheStats.value = optimizer.getCacheStats()
  } catch (error) {
    console.error(`加载组件失败:`, error)
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例2: 预测性加载
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const currentComponentName = ref('SmartForm')
const predictionResult = ref<PredictionResult | null>(null)

const triggerPredictiveLoad = async () => {
  if (!loadedComponent.value) {
    alert('请先加载一个组件')
    return
  }
  
  const result = await optimizer.predictivePreload(
    loadedComponent.value,
    globalComponentRegistry.getAvailableComponents(),
    async (name) => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
      return { template: `<div>预加载: ${name}</div>` }
    }
  )
  
  predictionResult.value = result
  console.log('预测结果:', result)
}

const runPrediction = () => {
  // 手动触发预测（不执行预加载）
  const components = globalComponentRegistry.getAvailableComponents()
  
  // 模拟预测逻辑
  predictionResult.value = {
    recommendations: ['RelatedComponent1', 'RelatedComponent2'],
    confidence: 0.75,
    factors: ['历史共现模式', '组件依赖关系', '访问频率']
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例3: 内存管理
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const memoryInfo = ref<MemoryInfo>({
  used: 0,
  total: 0,
  usage: 0,
  isOverThreshold: false
})

const updateMemoryInfo = () => {
  memoryInfo.value = optimizer.getMemoryInfo()
}

const loadManyComponents = async () => {
  const components = ['Comp1', 'Comp2', 'Comp3', 'Comp4', 'Comp5', 'Comp6', 'Comp7', 'Comp8']
  
  for (const name of components) {
    await loadComponent(name)
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  updateMemoryInfo()
}

const clearOptimizer = () => {
  optimizer.clear()
  cacheStats.value = optimizer.getCacheStats()
  updateMemoryInfo()
  alert('缓存已清空')
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例4: 使用统计
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const usageStats = computed<ComponentUsageStats[]>(() => {
  return optimizer.getUsageStats()
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例6: API示例代码
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const apiExample1 = `import { createPerformanceOptimizer } from '@smartabp/lowcode-shared'

const optimizer = createPerformanceOptimizer({
  cacheCapacity: 100,           // 缓存容量
  preloadThreshold: 3,          // 预加载阈值
  memoryThreshold: 50,          // 内存阈值（MB）
  enablePredictive: true,       // 启用预测性加载
  enableMonitoring: true,       // 启用性能监控
  debug: true                   // 调试模式
})`

const apiExample2 = `// 使用优化器加载组件
const component = await optimizer.get('SmartForm', async () => {
  // 组件加载器
  const module = await import('./components/SmartForm.vue')
  return module.default
})

// 自动处理:
// ✅ LRU缓存
// ✅ 加载去重
// ✅ 性能监控
// ✅ 错误处理`

const apiExample3 = `// 预测性预加载
const result = await optimizer.predictivePreload(
  'SmartForm',                    // 当前组件
  allComponents,                  // 所有组件元数据
  (name) => loadComponent(name)   // 加载器
)

// 返回:
// {
//   recommendations: ['DataTable', 'ChartWidget'],
//   confidence: 0.85,
//   factors: ['历史共现', '依赖关系', '同类别']
// }`

const apiExample4 = `import { globalPerformanceMonitor } from '@smartabp/lowcode-shared'

// 生成性能报告
const report = globalPerformanceMonitor.generateReport(60)

// 报告包含:
// ✅ 缓存命中率
// ✅ 平均加载时间
// ✅ P95/P99加载时间
// ✅ 内存使用趋势
// ✅ Top10慢加载组件
// ✅ 预加载效果分析`

// 工具函数
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 生命周期
let updateTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  updateMemoryInfo()
  cacheStats.value = optimizer.getCacheStats()
  
  // 定期更新内存信息
  updateTimer = setInterval(() => {
    updateMemoryInfo()
    cacheStats.value = optimizer.getCacheStats()
  }, 2000)
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
  optimizer.destroy()
})
</script>

<style scoped>
.performance-example {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.example-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.example-section h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #34495e;
}

.example-section p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
}

.demo-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.demo-controls button,
.memory-actions button {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.demo-controls button:hover,
.memory-actions button:hover {
  background: #2980b9;
}

.loaded-component {
  padding: 1.5rem;
  background: white;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.stats-panel {
  background: white;
  padding: 1rem;
  border-radius: 4px;
}

.stats-panel pre {
  margin: 0;
  font-size: 0.875rem;
  color: #2c3e50;
}

.prediction-demo {
  background: white;
  padding: 1.5rem;
  border-radius: 4px;
}

.prediction-input {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.prediction-input select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.prediction-result {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.prediction-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.prediction-item .label {
  font-weight: 600;
  color: #2c3e50;
}

.prediction-item .value {
  color: #3498db;
}

.memory-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.memory-item {
  padding: 1rem;
  background: white;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.memory-item .label {
  font-size: 0.875rem;
  color: #7f8c8d;
}

.memory-item .value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.memory-item .value.warning {
  color: #f39c12;
}

.memory-item .value.error {
  color: #e74c3c;
}

.memory-actions {
  display: flex;
  gap: 0.5rem;
}

.usage-table {
  width: 100%;
  background: white;
  border-radius: 4px;
  border-collapse: collapse;
  overflow: hidden;
}

.usage-table thead {
  background: #34495e;
  color: white;
}

.usage-table th,
.usage-table td {
  padding: 0.75rem;
  text-align: left;
}

.usage-table code {
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
}

.usage-table .error {
  color: #e74c3c;
  font-weight: 600;
}

.score-bar {
  width: 100px;
  height: 20px;
  background: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: #3498db;
  transition: width 0.3s;
}

.code-example {
  margin-bottom: 1.5rem;
}

.code-example h4 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.code-example pre {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.code-example code {
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>

