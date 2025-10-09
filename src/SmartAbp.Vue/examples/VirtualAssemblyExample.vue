<!--
  虚拟程序集使用示例
  
  展示如何使用微AI 2.0的虚拟程序集功能：
  1. 零配置组件加载
  2. 全局组件可见性
  3. 动态组件切换
  4. 性能监控
-->

<template>
  <div class="virtual-assembly-example">
    <h1>🌟 虚拟程序集示例</h1>
    
    <!-- 示例1：基础使用 -->
    <section class="example-section">
      <h2>示例1：基础使用</h2>
      <p>无需手动import，直接从虚拟程序集获取组件</p>
      
      <div class="component-demo">
        <!-- ✅ 自动加载组件（从虚拟程序集） -->
        <component v-if="BaseButton" :is="BaseButton" @click="handleClick">
          点击我
        </component>
      </div>
      
      <div class="code-snippet">
        <pre><code>{{ basicUsageCode }}</code></pre>
      </div>
    </section>

    <!-- 示例2：动态组件 -->
    <section class="example-section">
      <h2>示例2：动态组件切换</h2>
      <p>根据用户选择动态加载不同组件</p>
      
      <div class="component-selector">
        <button 
          v-for="name in availableComponents" 
          :key="name"
          @click="currentComponent = name"
          :class="{ active: currentComponent === name }"
        >
          {{ name }}
        </button>
      </div>
      
      <div class="component-demo">
        <!-- 动态组件 -->
        <component 
          v-if="DynamicComponent" 
          :is="DynamicComponent" 
          :key="currentComponent"
        />
      </div>
      
      <div class="code-snippet">
        <pre><code>{{ dynamicComponentCode }}</code></pre>
      </div>
    </section>

    <!-- 示例3：条件渲染 -->
    <section class="example-section">
      <h2>示例3：条件渲染（按需加载）</h2>
      <p>只加载显示的组件，节省资源</p>
      
      <div class="toggle-controls">
        <label>
          <input type="checkbox" v-model="showForm" />
          显示表单
        </label>
        <label>
          <input type="checkbox" v-model="showTable" />
          显示表格
        </label>
      </div>
      
      <div class="component-demo">
        <!-- 条件渲染，只加载显示的组件 -->
        <component v-if="showForm && FormComponent" :is="FormComponent" />
        <component v-if="showTable && TableComponent" :is="TableComponent" />
      </div>
      
      <div class="code-snippet">
        <pre><code>{{ conditionalRenderCode }}</code></pre>
      </div>
    </section>

    <!-- 示例4：性能监控 -->
    <section class="example-section">
      <h2>示例4：性能监控</h2>
      <p>查看虚拟程序集的性能统计</p>
      
      <div class="performance-stats">
        <div class="stat-card">
          <div class="stat-label">总加载次数</div>
          <div class="stat-value">{{ stats.totalLoads }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">缓存命中</div>
          <div class="stat-value">{{ stats.cacheHits }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">缓存未命中</div>
          <div class="stat-value">{{ stats.cacheMisses }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">平均加载时间</div>
          <div class="stat-value">{{ stats.avgLoadTime.toFixed(2) }}ms</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">缓存命中率</div>
          <div class="stat-value">{{ cacheHitRate }}%</div>
        </div>
      </div>
      
      <button @click="refreshStats" class="refresh-button">
        刷新统计
      </button>
      
      <div class="code-snippet">
        <pre><code>{{ performanceMonitorCode }}</code></pre>
      </div>
    </section>

    <!-- 示例5：批量预加载 -->
    <section class="example-section">
      <h2>示例5：批量预加载（性能优化）</h2>
      <p>提前加载关键组件，提升用户体验</p>
      
      <div class="preload-demo">
        <button @click="preloadComponents" :disabled="isPreloading">
          {{ isPreloading ? '预加载中...' : '预加载关键组件' }}
        </button>
        
        <div v-if="preloadComplete" class="success-message">
          ✅ 预加载完成！接下来使用这些组件会非常快速。
        </div>
      </div>
      
      <div class="code-snippet">
        <pre><code>{{ preloadCode }}</code></pre>
      </div>
    </section>

    <!-- 示例6：组件检查 -->
    <section class="example-section">
      <h2>示例6：组件存在性检查</h2>
      <p>检查组件是否在虚拟程序集中</p>
      
      <div class="component-check">
        <input 
          v-model="componentToCheck" 
          placeholder="输入组件名称"
          @keyup.enter="checkComponent"
        />
        <button @click="checkComponent">检查</button>
        
        <div v-if="checkResult !== null" class="check-result">
          {{ checkResult ? '✅ 组件存在' : '❌ 组件不存在' }}
        </div>
      </div>
      
      <div class="code-snippet">
        <pre><code>{{ componentCheckCode }}</code></pre>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Components } from '@smartabp/lowcode-shared'
import { VirtualAssembly, globalComponentRegistry } from '@smartabp/lowcode-shared'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例1：基础使用
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BaseButton = Components.BaseButton

const handleClick = () => {
  alert('虚拟程序集组件点击事件！')
}

const basicUsageCode = `import { Components } from '@smartabp/lowcode-shared'

// ✅ 直接从虚拟程序集获取组件
const BaseButton = Components.BaseButton

<template>
  <component :is="BaseButton" @click="handleClick">
    点击我
  </component>
</template>`

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例2：动态组件
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const currentComponent = ref('BaseButton')
const availableComponents = ['BaseButton', 'BaseInput', 'BaseSelect']

const DynamicComponent = computed(() => {
  return Components[currentComponent.value]
})

const dynamicComponentCode = `const currentComponent = ref('BaseButton')

const DynamicComponent = computed(() => {
  return Components[currentComponent.value]
})

<template>
  <select v-model="currentComponent">
    <option value="BaseButton">按钮</option>
    <option value="BaseInput">输入框</option>
    <option value="BaseSelect">选择器</option>
  </select>
  
  <component :is="DynamicComponent" />
</template>`

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例3：条件渲染
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const showForm = ref(false)
const showTable = ref(false)

const FormComponent = computed(() => 
  showForm.value ? Components.BaseForm : null
)

const TableComponent = computed(() => 
  showTable.value ? Components.BaseTable : null
)

const conditionalRenderCode = `const showForm = ref(false)
const showTable = ref(false)

const FormComponent = computed(() => 
  showForm.value ? Components.BaseForm : null
)

<template>
  <label>
    <input type="checkbox" v-model="showForm" />
    显示表单
  </label>
  
  <!-- 只在显示时才加载组件 -->
  <component v-if="showForm" :is="FormComponent" />
</template>`

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例4：性能监控
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const assembly = new VirtualAssembly(globalComponentRegistry, {
  enablePerformanceMonitoring: true,
  debug: true
})

const stats = ref({
  totalLoads: 0,
  cacheHits: 0,
  cacheMisses: 0,
  avgLoadTime: 0
})

const cacheHitRate = computed(() => {
  const total = stats.value.cacheHits + stats.value.cacheMisses
  if (total === 0) return 0
  return ((stats.value.cacheHits / total) * 100).toFixed(2)
})

const refreshStats = () => {
  stats.value = assembly.getStats() as any
}

onMounted(() => {
  refreshStats()
})

const performanceMonitorCode = `import { VirtualAssembly, globalComponentRegistry } from '@smartabp/lowcode-shared'

const assembly = new VirtualAssembly(globalComponentRegistry, {
  enablePerformanceMonitoring: true
})

// 获取性能统计
const stats = assembly.getStats()
console.log('性能统计:', stats)

// 打印性能报告
assembly.printPerformanceReport()`

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例5：批量预加载
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const isPreloading = ref(false)
const preloadComplete = ref(false)

const preloadComponents = async () => {
  isPreloading.value = true
  preloadComplete.value = false
  
  try {
    await assembly.preload([
      'BaseButton',
      'BaseInput',
      'BaseSelect',
      'BaseForm',
      'BaseTable'
    ])
    
    preloadComplete.value = true
    refreshStats()
  } catch (error) {
    console.error('预加载失败:', error)
  } finally {
    isPreloading.value = false
  }
}

const preloadCode = `// 预加载关键组件
await assembly.preload([
  'BaseButton',
  'BaseInput',
  'BaseSelect'
])

// 使用预加载的组件（从缓存加载，极快！）
const button = Components.BaseButton`

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例6：组件检查
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const componentToCheck = ref('')
const checkResult = ref<boolean | null>(null)

const checkComponent = () => {
  checkResult.value = componentToCheck.value in Components
}

const componentCheckCode = `// 检查组件是否存在
const exists = 'BaseButton' in Components  // true
const notExists = 'NonExistent' in Components  // false

// 安全访问组件
const component = Components['BaseButton']
if (component) {
  // 组件存在，使用它
}`
</script>

<style scoped>
.virtual-assembly-example {
  max-width: 1200px;
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

.component-demo {
  padding: 1.5rem;
  background: white;
  border-radius: 4px;
  margin-bottom: 1rem;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-snippet {
  margin-top: 1rem;
}

.code-snippet pre {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
}

.component-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.component-selector button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.component-selector button:hover {
  background: #e9ecef;
}

.component-selector button.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.toggle-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.toggle-controls label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.performance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 4px;
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
}

.refresh-button {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.refresh-button:hover {
  background: #2980b9;
}

.preload-demo button {
  padding: 0.75rem 1.5rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.preload-demo button:hover:not(:disabled) {
  background: #229954;
}

.preload-demo button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #d4edda;
  color: #155724;
  border-radius: 4px;
}

.component-check {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.component-check input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.component-check button {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.check-result {
  padding: 1rem;
  background: white;
  border-radius: 4px;
  font-weight: 500;
}
</style>

