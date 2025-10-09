<!--
  插件系统示例
  
  展示微AI 2.0阶段4的核心功能：
  1. 插件管理器（PluginManager）
  2. 内置插件（性能、安全、分析）
  3. 开发者工具（DevToolsPanel）
  4. 自定义插件开发
-->

<template>
  <div class="plugin-example">
    <h1>🧩 插件系统示例</h1>
    
    <!-- 示例1：插件管理器基础 -->
    <section class="example-section">
      <h2>示例1：插件管理器基础使用</h2>
      <p>注册、启用、禁用、卸载插件</p>
      
      <div class="demo-controls">
        <button @click="registerBuiltinPlugins">
          注册内置插件
        </button>
        <button @click="enableAllPlugins">
          启用所有插件
        </button>
        <button @click="disableAllPlugins">
          禁用所有插件
        </button>
        <button @click="showPluginStats">
          查看统计
        </button>
      </div>
      
      <div class="plugin-stats">
        <h4>插件统计:</h4>
        <pre>{{ JSON.stringify(pluginStats, null, 2) }}</pre>
      </div>
    </section>

    <!-- 示例2：内置插件 -->
    <section class="example-section">
      <h2>示例2：内置插件功能</h2>
      <p>性能监控、安全检查、分析统计</p>
      
      <div class="builtin-plugins">
        <div class="plugin-demo-card">
          <h3>⚡ 性能监控插件</h3>
          <p>自动监控组件加载性能，提供优化建议</p>
          <ul>
            <li>慢加载组件自动警告（阈值: 500ms）</li>
            <li>缓存命中率监控</li>
            <li>错误率告警</li>
            <li>自动性能报告（60秒间隔）</li>
          </ul>
        </div>
        
        <div class="plugin-demo-card">
          <h3>🛡️ 安全检查插件</h3>
          <p>组件加载安全验证和XSS防护</p>
          <ul>
            <li>组件白名单/黑名单</li>
            <li>XSS防护（危险字符检测）</li>
            <li>访问控制审计</li>
            <li>安全事件日志</li>
          </ul>
          <div class="security-demo">
            <button @click="testSecurityCheck('SafeComponent')">
              测试安全组件
            </button>
            <button @click="testSecurityCheck('<script>alert(1)</script>')">
              测试危险组件
            </button>
          </div>
        </div>
        
        <div class="plugin-demo-card">
          <h3>📊 分析统计插件</h3>
          <p>组件使用统计和用户行为分析</p>
          <ul>
            <li>组件加载次数统计</li>
            <li>用户行为追踪</li>
            <li>事件批量发送</li>
            <li>本地存储持久化</li>
          </ul>
          <button @click="showAnalytics">查看分析数据</button>
          <div v-if="analyticsData" class="analytics-result">
            <pre>{{ JSON.stringify(analyticsData, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </section>

    <!-- 示例3：自定义插件 -->
    <section class="example-section">
      <h2>示例3：自定义插件开发</h2>
      <p>创建你自己的插件扩展微AI功能</p>
      
      <div class="code-example">
        <h4>自定义插件示例代码:</h4>
        <pre><code>{{ customPluginCode }}</code></pre>
      </div>
      
      <button @click="registerCustomPlugin">注册自定义插件</button>
      <button @click="triggerCustomHook">触发自定义钩子</button>
    </section>

    <!-- 示例4：钩子系统 -->
    <section class="example-section">
      <h2>示例4：钩子系统</h2>
      <p>在组件生命周期的关键节点执行自定义逻辑</p>
      
      <div class="hook-demo">
        <h4>可用钩子:</h4>
        <ul class="hook-list">
          <li v-for="hook in availableHooks" :key="hook.type">
            <code>{{ hook.type }}</code>
            <span class="hook-desc">{{ hook.description }}</span>
          </li>
        </ul>
        
        <div class="hook-test">
          <button @click="simulateComponentLoad">模拟组件加载</button>
          <button @click="simulateError">模拟错误</button>
        </div>
        
        <div class="hook-log">
          <h4>钩子执行日志:</h4>
          <div 
            v-for="(log, index) in hookLog" 
            :key="index"
            class="log-item"
          >
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-hook">{{ log.hook }}</span>
            <span class="log-data">{{ log.data }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 示例5：插件通信 -->
    <section class="example-section">
      <h2>示例5：插件间通信</h2>
      <p>插件可以互相发送消息进行协作</p>
      
      <div class="communication-demo">
        <select v-model="targetPluginId">
          <option value="">选择目标插件</option>
          <option value="builtin.performance">性能插件</option>
          <option value="builtin.security">安全插件</option>
          <option value="builtin.analytics">分析插件</option>
        </select>
        
        <input 
          v-model="messageText" 
          placeholder="输入消息内容"
          type="text"
        />
        
        <button @click="sendPluginMessage">发送消息</button>
      </div>
    </section>

    <!-- 示例6：开发者工具 -->
    <section class="example-section full-width">
      <h2>示例6：开发者工具面板</h2>
      <p>可视化管理组件、插件和性能</p>
      
      <DevToolsPanel />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  createPluginManager,
  globalPluginManager,
  createPerformancePlugin,
  createSecurityPlugin,
  createAnalyticsPlugin,
  DevToolsPanel,
  type Plugin,
  type PluginHookContext
} from '@smartabp/lowcode-shared'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例1: 插件管理器基础
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const pluginStats = ref(globalPluginManager.getStats())

const registerBuiltinPlugins = async () => {
  try {
    // 注册性能插件
    await globalPluginManager.register(createPerformancePlugin({
      slowLoadThreshold: 500,
      enableAutoReport: true,
      reportInterval: 60
    }))

    // 注册安全插件
    await globalPluginManager.register(createSecurityPlugin({
      enableXSSProtection: true,
      strictMode: false
    }))

    // 注册分析插件
    await globalPluginManager.register(createAnalyticsPlugin({
      enableTracking: true,
      batchSize: 50
    }))

    pluginStats.value = globalPluginManager.getStats()
    alert('内置插件注册成功！')
  } catch (error) {
    console.error('插件注册失败:', error)
    alert(`插件注册失败: ${error.message}`)
  }
}

const enableAllPlugins = async () => {
  const plugins = globalPluginManager.getAllPlugins()
  for (const plugin of plugins) {
    await globalPluginManager.enable(plugin.plugin.metadata.id)
  }
  pluginStats.value = globalPluginManager.getStats()
  alert('所有插件已启用')
}

const disableAllPlugins = async () => {
  const plugins = globalPluginManager.getAllPlugins()
  for (const plugin of plugins) {
    await globalPluginManager.disable(plugin.plugin.metadata.id)
  }
  pluginStats.value = globalPluginManager.getStats()
  alert('所有插件已禁用')
}

const showPluginStats = () => {
  pluginStats.value = globalPluginManager.getStats()
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例2: 内置插件
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const testSecurityCheck = async (componentName: string) => {
  try {
    await globalPluginManager.triggerHook('beforeComponentLoad', null, componentName)
    alert(`✅ 组件 "${componentName}" 通过安全检查`)
  } catch (error) {
    alert(`❌ 安全检查失败: ${error.message}`)
  }
}

const analyticsData = ref(null)

const showAnalytics = () => {
  const analyticsPlugin = globalPluginManager.getPlugin('builtin.analytics')
  if (analyticsPlugin) {
    analyticsData.value = (analyticsPlugin.plugin as any).getStats()
  } else {
    alert('分析插件未注册或未启用')
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例3: 自定义插件
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const customPluginCode = `class MyCustomPlugin implements Plugin {
  metadata = {
    id: 'my.custom',
    name: '自定义插件',
    version: '1.0.0',
    description: '这是一个自定义插件示例',
    enabled: true
  }

  async install(manager: PluginManager) {
    console.log('[MyCustomPlugin] 插件已安装')
  }

  hooks = {
    afterComponentLoad: async (context) => {
      console.log('[MyCustomPlugin] 组件已加载:', context.target)
    },
    
    onCustom: async (context) => {
      if (context.data?.type === 'greeting') {
        alert('Hello from custom plugin!')
      }
    }
  }
}`

// 创建自定义插件
const customPlugin: Plugin = {
  metadata: {
    id: 'my.custom',
    name: '自定义插件',
    version: '1.0.0',
    description: '这是一个自定义插件示例',
    enabled: true
  },

  async install(manager) {
    console.log('[MyCustomPlugin] 插件已安装')
  },

  hooks: {
    afterComponentLoad: async (context) => {
      console.log('[MyCustomPlugin] 组件已加载:', context.target)
      hookLog.value.unshift({
        timestamp: Date.now(),
        hook: 'afterComponentLoad',
        data: `组件: ${context.target}`
      })
    },
    
    onCustom: async (context) => {
      if (context.data?.type === 'greeting') {
        alert('Hello from custom plugin!')
        hookLog.value.unshift({
          timestamp: Date.now(),
          hook: 'onCustom',
          data: 'greeting触发'
        })
      }
    }
  }
}

const registerCustomPlugin = async () => {
  try {
    await globalPluginManager.register(customPlugin)
    pluginStats.value = globalPluginManager.getStats()
    alert('自定义插件注册成功！')
  } catch (error) {
    alert(`注册失败: ${error.message}`)
  }
}

const triggerCustomHook = async () => {
  await globalPluginManager.triggerHook('onCustom', { type: 'greeting' })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例4: 钩子系统
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const availableHooks = [
  { type: 'beforeInit', description: '初始化前' },
  { type: 'afterInit', description: '初始化后' },
  { type: 'beforeComponentLoad', description: '组件加载前' },
  { type: 'afterComponentLoad', description: '组件加载后' },
  { type: 'beforeComponentMount', description: '组件挂载前' },
  { type: 'afterComponentMount', description: '组件挂载后' },
  { type: 'beforeDestroy', description: '销毁前' },
  { type: 'afterDestroy', description: '销毁后' },
  { type: 'onError', description: '错误时' },
  { type: 'onPerformance', description: '性能监控' },
  { type: 'onCustom', description: '自定义钩子' }
]

const hookLog = ref<Array<{
  timestamp: number
  hook: string
  data: string
}>>([])

const simulateComponentLoad = async () => {
  const componentName = 'TestComponent'
  
  await globalPluginManager.triggerHook('beforeComponentLoad', {}, componentName)
  
  // 模拟加载延迟
  await new Promise(resolve => setTimeout(resolve, 100))
  
  await globalPluginManager.triggerHook('afterComponentLoad', {
    duration: 100,
    fromCache: false
  }, componentName)
  
  hookLog.value.unshift({
    timestamp: Date.now(),
    hook: 'Component Lifecycle',
    data: `${componentName} 加载完成`
  })
}

const simulateError = async () => {
  const error = new Error('这是一个测试错误')
  await globalPluginManager.triggerHook('onError', { error }, 'ErrorComponent')
  
  hookLog.value.unshift({
    timestamp: Date.now(),
    hook: 'onError',
    data: error.message
  })
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例5: 插件通信
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const targetPluginId = ref('')
const messageText = ref('')

const sendPluginMessage = () => {
  if (!targetPluginId.value) {
    alert('请选择目标插件')
    return
  }
  
  if (!messageText.value) {
    alert('请输入消息内容')
    return
  }
  
  globalPluginManager.sendMessage(targetPluginId.value, {
    content: messageText.value,
    from: 'user',
    timestamp: Date.now()
  })
  
  alert(`消息已发送到 ${targetPluginId.value}`)
  messageText.value = ''
}

// 工具函数
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN')
}
</script>

<style scoped>
.plugin-example {
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

.example-section.full-width {
  max-width: none;
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
button {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.demo-controls button:hover,
button:hover {
  background: #2980b9;
}

.plugin-stats pre,
.analytics-result pre,
.code-example pre {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.builtin-plugins {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.plugin-demo-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.plugin-demo-card h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.plugin-demo-card ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
  color: #7f8c8d;
}

.plugin-demo-card li {
  margin-bottom: 0.5rem;
}

.security-demo {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.code-example {
  margin-bottom: 1rem;
}

.code-example h4 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.hook-demo {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.hook-list {
  list-style: none;
  padding: 0;
  margin-bottom: 1.5rem;
}

.hook-list li {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid #ecf0f1;
}

.hook-list code {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  min-width: 180px;
}

.hook-desc {
  color: #7f8c8d;
}

.hook-test {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.hook-log {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.hook-log h4 {
  margin: 0 0 1rem 0;
  color: #ecf0f1;
}

.log-item {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid #34495e;
  font-size: 0.875rem;
}

.log-time {
  color: #95a5a6;
}

.log-hook {
  color: #3498db;
  font-weight: 600;
}

.log-data {
  color: #ecf0f1;
}

.communication-demo {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.communication-demo select,
.communication-demo input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.communication-demo select {
  min-width: 200px;
}

.communication-demo input {
  flex: 1;
}
</style>

