<template>
  <div
    class="assembly-item"
    :class="itemClasses"
  >
    <div class="item-header">
      <div class="item-info">
        <h4 class="item-name">
          {{ registryItem.config.displayName }}
        </h4>
        <span class="item-version">v{{ registryItem.config.version }}</span>
        <span
          class="item-status"
          :class="statusClass"
        >{{ statusText }}</span>
      </div>
      <div class="item-actions">
        <button
          v-if="isLoaded"
          class="btn btn-warning btn-sm"
          :disabled="isLoading"
          @click="$emit('unload')"
        >
          卸载
        </button>
        <button
          v-else
          class="btn btn-primary btn-sm"
          :disabled="isLoading || !registryItem.config.enabled"
          @click="$emit('load')"
        >
          加载
        </button>
        <button
          class="btn btn-secondary btn-sm"
          :disabled="isLoading || !isLoaded"
          @click="$emit('reload')"
        >
          重载
        </button>
        <button
          class="btn btn-sm"
          :class="toggleButtonClass"
          @click="$emit('toggle')"
        >
          {{ registryItem.config.enabled ? '禁用' : '启用' }}
        </button>
        <button
          class="btn btn-outline btn-sm"
          @click="$emit('edit')"
        >
          编辑
        </button>
      </div>
    </div>

    <div class="item-content">
      <p
        v-if="registryItem.config.description"
        class="item-description"
      >
        {{ registryItem.config.description }}
      </p>

      <div class="item-meta">
        <div class="meta-item">
          <span class="meta-label">名称:</span>
          <code class="meta-value">{{ registryItem.config.name }}</code>
        </div>
        <div class="meta-item">
          <span class="meta-label">入口:</span>
          <code class="meta-value">{{ registryItem.config.entry }}</code>
        </div>
        <div
          v-if="registryItem.config.dependencies.length > 0"
          class="meta-item"
        >
          <span class="meta-label">依赖:</span>
          <div class="dependencies">
            <span
              v-for="dep in registryItem.config.dependencies"
              :key="dep"
              class="dependency-tag"
            >
              {{ dep }}
            </span>
          </div>
        </div>
      </div>

      <div class="item-stats">
        <div class="stat">
          <span class="stat-label">加载次数:</span>
          <span class="stat-value">{{ registryItem.loadCount }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">错误次数:</span>
          <span class="stat-value error">{{ registryItem.errorCount }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">注册时间:</span>
          <span class="stat-value">{{ formatDate(registryItem.registeredAt) }}</span>
        </div>
        <div
          v-if="registryItem.lastLoadedAt"
          class="stat"
        >
          <span class="stat-label">最后加载:</span>
          <span class="stat-value">{{ formatDate(registryItem.lastLoadedAt) }}</span>
        </div>
      </div>

      <div
        v-if="registryItem.lastError"
        class="item-error"
      >
        <div class="error-header">
          <span class="error-icon">⚠️</span>
          <strong>最后错误:</strong>
        </div>
        <pre class="error-message">{{ registryItem.lastError }}</pre>
      </div>

      <div
        v-if="registryItem.instance"
        class="item-health"
      >
        <div
          class="health-status"
          :class="healthClass"
        >
          <span class="health-icon">{{ healthIcon }}</span>
          <span>健康状态: {{ registryItem.instance.health?.status || 'Unknown' }}</span>
          <span class="last-check">
            最后检查: {{ registryItem.instance.health?.lastCheck ? formatDate(registryItem.instance.health.lastCheck) :
              'Never' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AssemblyRegistryItem } from '../../core/assembly/assembly-registry';

interface Props {
  registryItem: AssemblyRegistryItem
  isLoading?: boolean
}

const props = defineProps<Props>()
defineEmits<{
  load: []
  unload: []
  reload: []
  toggle: []
  edit: []
}>()

// 计算属性
const isLoaded = computed(() => props.registryItem.instance !== undefined)
const isEnabled = computed(() => props.registryItem.config.enabled)
const hasError = computed(() => !!props.registryItem.lastError)

// CSS类名计算
const itemClasses = computed(() => ({
  'loaded': isLoaded.value,
  'enabled': isEnabled.value,
  'error': hasError.value,
  'disabled': !isEnabled.value
}))

const statusClass = computed(() => {
  if (!isEnabled.value) return 'status-disabled'
  if (hasError.value) return 'status-error'
  if (isLoaded.value) return 'status-loaded'
  return 'status-ready'
})

const statusText = computed(() => {
  if (!isEnabled.value) return '已禁用'
  if (hasError.value) return '错误'
  if (isLoaded.value) return '已加载'
  return '就绪'
})

const toggleButtonClass = computed(() =>
  isEnabled.value ? 'btn-warning' : 'btn-success'
)

const healthClass = computed(() => {
  const health = props.registryItem.instance?.health
  if (!health) return 'health-unknown'

  switch (health.status) {
    case 'healthy': return 'health-healthy'
    case 'unhealthy': return 'health-unhealthy'
    default: return 'health-unknown'
  }
})

const healthIcon = computed(() => {
  const health = props.registryItem.instance?.health
  if (!health) return '❓'

  switch (health.status) {
    case 'healthy': return '✅'
    case 'unhealthy': return '❌'
    default: return '❓'
  }
})

// 工具函数
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped>
.assembly-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 10px;
  background: white;
  transition: all 0.2s ease;
}

.assembly-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.assembly-item.loaded {
  border-left: 4px solid #28a745;
}

.assembly-item.error {
  border-left: 4px solid #dc3545;
}

.assembly-item.disabled {
  opacity: 0.6;
  background: #f8f9fa;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.item-version {
  background: #6c757d;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.item-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-ready {
  background: #ffc107;
  color: #212529;
}

.status-loaded {
  background: #28a745;
  color: white;
}

.status-error {
  background: #dc3545;
  color: white;
}

.status-disabled {
  background: #6c757d;
  color: white;
}

.item-actions {
  display: flex;
  gap: 5px;
}

.item-content {
  padding: 15px 20px;
}

.item-description {
  margin: 0 0 15px 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.item-meta {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px 15px;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.meta-item {
  display: contents;
}

.meta-label {
  font-weight: 500;
  color: #495057;
}

.meta-value {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.85rem;
}

.dependencies {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.dependency-tag {
  background: #e9ecef;
  color: #495057;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.8rem;
}

.item-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.85rem;
  color: #6c757d;
}

.stat-value {
  font-size: 0.85rem;
  font-weight: 500;
}

.stat-value.error {
  color: #dc3545;
}

.item-error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
}

.error-header {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
}

.error-icon {
  font-size: 0.9rem;
}

.error-message {
  margin: 0;
  font-size: 0.8rem;
  color: #721c24;
  white-space: pre-wrap;
  word-break: break-all;
}

.item-health {
  margin-top: 10px;
}

.health-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.health-healthy {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.health-unhealthy {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.health-unknown {
  background: #e2e3e5;
  color: #383d41;
  border: 1px solid #d6d8db;
}

.health-icon {
  font-size: 1rem;
}

.last-check {
  margin-left: auto;
  font-size: 0.8rem;
  opacity: 0.7;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-outline {
  background: transparent;
  border: 1px solid #6c757d;
  color: #6c757d;
}

.btn:hover:not(:disabled) {
  opacity: 0.8;
}
</style>