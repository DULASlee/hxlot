<template>
  <div class="devtools-panel">
    <div class="panel-header">
      <h2>🛠️ 微AI 2.0 开发者工具</h2>
      <div class="header-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="panel-content">
      <!-- Tab 1: 组件树 -->
      <div
        v-show="activeTab === 'components'"
        class="tab-panel"
      >
        <h3>组件树</h3>
        <div class="component-tree">
          <div
            v-for="comp in componentRegistry"
            :key="comp.name"
            class="component-node"
          >
            <div
              class="node-header"
              @click="toggleNode(comp.name)"
            >
              <span class="expand-icon">{{ expandedNodes.has(comp.name) ? '▼' : '▶' }}</span>
              <span class="component-icon">📦</span>
              <code>{{ comp.name }}</code>
              <span class="component-category">{{ comp.category }}</span>
            </div>
            <div
              v-if="expandedNodes.has(comp.name)"
              class="node-details"
            >
              <div class="detail-item">
                <span class="label">Bundle:</span>
                <code>{{ comp.bundle }}</code>
              </div>
              <div class="detail-item">
                <span class="label">Path:</span>
                <code>{{ (comp as any).path || '-' }}</code>
              </div>
              <div class="detail-item">
                <span class="label">Priority:</span>
                <span :class="['priority-badge', comp.priority]">{{ comp.priority }}</span>
              </div>
              <div
                v-if="comp.dependencies?.length"
                class="detail-item"
              >
                <span class="label">Dependencies:</span>
                <div class="dependencies">
                  <code
                    v-for="dep in comp.dependencies"
                    :key="dep"
                  >{{ dep }}</code>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="componentRegistry.length === 0"
            class="empty-message"
          >
            暂无组件
          </div>
        </div>
      </div>

      <!-- Tab 2: 插件管理 -->
      <div
        v-show="activeTab === 'plugins'"
        class="tab-panel"
      >
        <h3>插件管理</h3>
        <div class="plugin-list">
          <div
            v-for="plugin in pluginList"
            :key="plugin.plugin.metadata.id"
            class="plugin-card"
          >
            <div class="plugin-header">
              <div class="plugin-info">
                <h4>{{ plugin.plugin.metadata.name }}</h4>
                <span class="plugin-id">{{ plugin.plugin.metadata.id }}</span>
              </div>
              <div class="plugin-controls">
                <span :class="['status-badge', plugin.status]">{{ plugin.status }}</span>
                <button 
                  v-if="plugin.status === 'enabled'"
                  class="control-btn"
                  @click="disablePlugin(plugin.plugin.metadata.id)"
                >
                  禁用
                </button>
                <button 
                  v-else-if="plugin.status === 'disabled'"
                  class="control-btn primary"
                  @click="enablePlugin(plugin.plugin.metadata.id)"
                >
                  启用
                </button>
              </div>
            </div>
            <p class="plugin-description">
              {{ plugin.plugin.metadata.description }}
            </p>
            <div class="plugin-meta">
              <span>版本: {{ plugin.plugin.metadata.version }}</span>
              <span v-if="plugin.plugin.metadata.author">作者: {{ plugin.plugin.metadata.author }}</span>
              <span v-if="plugin.installedAt">
                安装时间: {{ formatDate(plugin.installedAt) }}
              </span>
            </div>
            <div
              v-if="plugin.plugin.metadata.tags"
              class="plugin-tags"
            >
              <span
                v-for="tag in plugin.plugin.metadata.tags"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
          <div
            v-if="pluginList.length === 0"
            class="empty-message"
          >
            暂无插件
          </div>
        </div>
      </div>

      <!-- Tab 3: 性能监控 -->
      <div
        v-show="activeTab === 'performance'"
        class="tab-panel"
      >
        <h3>性能监控</h3>
        <div class="performance-stats">
          <div class="stat-card">
            <div class="stat-label">
              缓存命中率
            </div>
            <div class="stat-value">
              {{ formatPercent(cacheHitRate) }}
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">
              平均加载时间
            </div>
            <div class="stat-value">
              {{ avgLoadTime.toFixed(1) }}ms
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">
              总加载次数
            </div>
            <div class="stat-value">
              {{ totalLoads }}
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">
              错误率
            </div>
            <div
              class="stat-value"
              :class="{ 'error-high': errorRate > 0.05 }"
            >
              {{ formatPercent(errorRate) }}
            </div>
          </div>
        </div>
        <div class="performance-chart">
          <h4>最近加载时间</h4>
          <div class="timeline">
            <div 
              v-for="(metric, index) in recentMetrics" 
              :key="index"
              class="timeline-item"
              :title="`${metric.componentName}: ${metric.duration.toFixed(1)}ms`"
            >
              <div 
                class="timeline-bar"
                :style="{ 
                  height: `${(metric.duration / maxDuration) * 100}%`,
                  background: getBarColor(metric.duration)
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 4: 事件日志 -->
      <div
        v-show="activeTab === 'events'"
        class="tab-panel"
      >
        <h3>事件日志</h3>
        <div class="event-log">
          <div 
            v-for="(event, index) in eventLog" 
            :key="index"
            :class="['event-item', event.type]"
          >
            <span class="event-time">{{ formatTime(event.timestamp) }}</span>
            <span :class="['event-type', event.type]">{{ event.type }}</span>
            <span class="event-target">{{ event.target || '-' }}</span>
            <span class="event-data">{{ formatEventData(event.data) }}</span>
          </div>
          <div
            v-if="eventLog.length === 0"
            class="empty-message"
          >
            暂无事件
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { globalComponentRegistry } from '../components/ComponentRegistry'
import { globalPerformanceMonitor } from '../performance/PerformanceMonitor'
import { globalPluginManager } from '../plugins/PluginManager'

// Tabs
const tabs = [
  { id: 'components', label: '组件树', icon: '🌳' },
  { id: 'plugins', label: '插件', icon: '🧩' },
  { id: 'performance', label: '性能', icon: '⚡' },
  { id: 'events', label: '事件', icon: '📋' }
]

const activeTab = ref('components')

// 组件树
const componentRegistry = ref(globalComponentRegistry.getAvailableComponents())
const expandedNodes = ref(new Set<string>())

const toggleNode = (name: string) => {
  if (expandedNodes.value.has(name)) {
    expandedNodes.value.delete(name)
  } else {
    expandedNodes.value.add(name)
  }
}

// 插件管理
const pluginList = ref((globalPluginManager as any).getAllPlugins?.() || [])

const enablePlugin = async (id: string) => {
  const mgr: any = globalPluginManager as any
  if (typeof mgr.enable === 'function') {
    await mgr.enable(id)
  }
  pluginList.value = mgr.getAllPlugins?.() || []
}

const disablePlugin = async (id: string) => {
  const mgr: any = globalPluginManager as any
  if (typeof mgr.disable === 'function') {
    await mgr.disable(id)
  }
  pluginList.value = mgr.getAllPlugins?.() || []
}

// 性能监控
const performanceReport = ref(globalPerformanceMonitor.generateReport(60))
const recentMetrics = ref(globalPerformanceMonitor.getRealtimeMetrics(20).filter(m => m.type === 'load'))

const cacheHitRate = computed(() => performanceReport.value?.cacheHitRate || 0)
const avgLoadTime = computed(() => performanceReport.value?.avgLoadTime || 0)
const totalLoads = computed(() => performanceReport.value?.totalLoads || 0)
const errorRate = computed(() => performanceReport.value?.errorRate || 0)

const maxDuration = computed(() => {
  if (recentMetrics.value.length === 0) return 1
  return Math.max(...recentMetrics.value.map(m => m.duration))
})

const getBarColor = (duration: number) => {
  if (duration < 100) return '#27ae60'
  if (duration < 300) return '#f39c12'
  return '#e74c3c'
}

// 事件日志
const eventLog = ref<Array<{
  type: string
  target?: string
  data?: any
  timestamp: number
}>>([])

// 工具函数
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatTime = (timestamp: number) => {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp))
}

const formatPercent = (value: number) => {
  return `${(value * 100).toFixed(1)}%`
}

const formatEventData = (data: any) => {
  if (!data) return '-'
  if (typeof data === 'string') return data
  return JSON.stringify(data).slice(0, 100)
}

// 定时刷新
let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  refreshTimer = setInterval(() => {
    componentRegistry.value = globalComponentRegistry.getAvailableComponents()
    pluginList.value = (globalPluginManager as any).getAllPlugins?.() || []
    performanceReport.value = globalPerformanceMonitor.generateReport(60)
    recentMetrics.value = globalPerformanceMonitor.getRealtimeMetrics(20).filter(m => m.type === 'load')
  }, 3000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.devtools-panel {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.panel-header {
  background: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  padding: 1rem;
}

.panel-header h2 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #ffffff;
}

.header-tabs {
  display: flex;
  gap: 0.5rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: #cccccc;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.tab-button:hover {
  background: #3e3e42;
}

.tab-button.active {
  background: #007acc;
  color: #ffffff;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.tab-panel h3 {
  margin: 0 0 1rem 0;
  color: #ffffff;
}

/* 组件树 */
.component-tree {
  background: #252526;
  border-radius: 4px;
  padding: 0.5rem;
}

.component-node {
  margin-bottom: 0.5rem;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.node-header:hover {
  background: #2a2d2e;
}

.expand-icon {
  width: 16px;
  color: #858585;
}

.component-icon {
  font-size: 1.2rem;
}

.component-category {
  margin-left: auto;
  padding: 0.25rem 0.5rem;
  background: #3e3e42;
  border-radius: 4px;
  font-size: 0.75rem;
}

.node-details {
  padding: 0.5rem 0 0.5rem 2.5rem;
}

.detail-item {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.detail-item .label {
  color: #858585;
  margin-right: 0.5rem;
}

.priority-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.priority-badge.high {
  background: #d73a49;
  color: #ffffff;
}

.priority-badge.medium {
  background: #f39c12;
  color: #ffffff;
}

.priority-badge.low {
  background: #6c757d;
  color: #ffffff;
}

.dependencies code {
  display: inline-block;
  margin-right: 0.5rem;
  margin-bottom: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #3e3e42;
  border-radius: 4px;
  font-size: 0.75rem;
}

/* 插件管理 */
.plugin-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.plugin-card {
  background: #252526;
  border-radius: 4px;
  padding: 1rem;
}

.plugin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.plugin-info h4 {
  margin: 0 0 0.25rem 0;
  color: #ffffff;
}

.plugin-id {
  font-size: 0.75rem;
  color: #858585;
  font-family: 'Monaco', 'Menlo', monospace;
}

.plugin-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.status-badge.enabled {
  background: #27ae60;
  color: #ffffff;
}

.status-badge.disabled {
  background: #6c757d;
  color: #ffffff;
}

.status-badge.error {
  background: #e74c3c;
  color: #ffffff;
}

.control-btn {
  padding: 0.25rem 0.75rem;
  background: #3e3e42;
  border: none;
  color: #cccccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.control-btn:hover {
  background: #505050;
}

.control-btn.primary {
  background: #007acc;
  color: #ffffff;
}

.plugin-description {
  color: #cccccc;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.plugin-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #858585;
}

.plugin-tags {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.plugin-tags .tag {
  padding: 0.25rem 0.5rem;
  background: #3e3e42;
  border-radius: 4px;
  font-size: 0.75rem;
}

/* 性能监控 */
.performance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #252526;
  border-radius: 4px;
  padding: 1rem;
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #858585;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 600;
  color: #007acc;
}

.stat-value.error-high {
  color: #e74c3c;
}

.performance-chart {
  background: #252526;
  border-radius: 4px;
  padding: 1rem;
}

.performance-chart h4 {
  margin: 0 0 1rem 0;
  color: #ffffff;
}

.timeline {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 150px;
}

.timeline-item {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.timeline-bar {
  width: 100%;
  transition: height 0.3s;
}

/* 事件日志 */
.event-log {
  background: #252526;
  border-radius: 4px;
  padding: 0.5rem;
  max-height: 500px;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
}

.event-item {
  display: grid;
  grid-template-columns: auto auto 1fr 2fr;
  gap: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid #3e3e42;
}

.event-time {
  color: #858585;
}

.event-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.event-type.load {
  background: #007acc;
}

.event-type.cache-hit {
  background: #27ae60;
}

.event-type.error {
  background: #e74c3c;
}

.event-target {
  color: #dcdcaa;
}

.event-data {
  color: #cccccc;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: #858585;
}

code {
  background: #3e3e42;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
}
</style>

