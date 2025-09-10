<template>
  <div class="theme-test-page">
    <div class="test-header">
      <h1>主题测试页面</h1>
      <p>当前主题: {{ themeStore.currentTheme }}</p>
      <p>暗黑模式: {{ themeStore.isDarkMode ? '开启' : '关闭' }}</p>
    </div>

    <div class="test-controls">
      <h2>主题切换测试</h2>
      <div class="theme-buttons">
        <button 
          v-for="theme in availableThemes" 
          :key="theme.value"
          :class="{ active: themeStore.currentTheme === theme.value }"
          class="theme-btn"
          @click="setTheme(theme.value as ThemeType)"
        >
          {{ theme.label }}
        </button>
      </div>
      
      <div class="dark-mode-control">
        <label>
          <input 
            v-model="themeStore.isDarkMode" 
            type="checkbox" 
            @change="themeStore.toggleDarkMode()"
          >
          暗黑模式
        </label>
      </div>
    </div>

    <div class="test-samples">
      <h2>样式测试</h2>
      
      <div class="sample-card">
        <h3>颜色测试</h3>
        <div class="color-grid">
          <div class="color-item bg-primary">
            主色
          </div>
          <div class="color-item bg-component">
            组件背景
          </div>
          <div class="color-item bg-elevated">
            提升背景
          </div>
          <div class="color-item text-primary">
            主要文本
          </div>
          <div class="color-item text-secondary">
            次要文本
          </div>
          <div class="color-item border-base">
            边框
          </div>
        </div>
      </div>

      <div class="sample-card">
        <h3>按钮测试</h3>
        <div class="button-group">
          <button class="btn btn-primary">
            主要按钮
          </button>
          <button class="btn btn-secondary">
            次要按钮
          </button>
          <button class="btn btn-outline">
            边框按钮
          </button>
        </div>
      </div>

      <div class="sample-card">
        <h3>表单测试</h3>
        <div class="form-group">
          <input
            type="text"
            placeholder="输入文本"
            class="form-input"
          >
          <select class="form-select">
            <option>选择选项</option>
            <option>选项1</option>
            <option>选项2</option>
          </select>
        </div>
      </div>
    </div>

    <div class="debug-info">
      <h2>调试信息</h2>
      <div class="debug-item">
        <strong>DOM主题类:</strong> {{ getDocumentThemeClasses() }}
      </div>
      <div class="debug-item">
        <strong>data-theme:</strong> {{ getDataTheme() }}
      </div>
      <div class="debug-item">
        <strong>--theme-brand-primary:</strong> {{ getThemeVariable('--theme-brand-primary') }}
      </div>
      <div class="debug-item">
        <strong>--theme-bg-component:</strong> {{ getThemeVariable('--theme-bg-component') }}
      </div>
      <div class="debug-item">
        <strong>--theme-text-primary:</strong> {{ getThemeVariable('--theme-text-primary') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useThemeStore } from '@/stores'
import type { ThemeType } from '@/composables/useDesignSystem'

const themeStore = useThemeStore()

const availableThemes = computed(() => [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '暗黑' },
  { value: 'tech-blue', label: '科技蓝' },
  { value: 'deep-green', label: '深绿色' },
  { value: 'light-purple', label: '浅紫色' },
  { value: 'auto', label: '自动' },
])

const setTheme = (theme: ThemeType) => {
  console.log('Setting theme to:', theme)
  themeStore.setTheme(theme)
  // 强制重新获取调试信息
  setTimeout(() => {
    debugInfo.value++
  }, 100)
}

const debugInfo = ref(0)

const getDocumentThemeClasses = () => {
  debugInfo.value // 触发响应式更新
  const classes = Array.from(document.documentElement.classList)
  return classes.filter(cls => cls.startsWith('theme-')).join(', ') || '无'
}

const getDataTheme = () => {
  debugInfo.value // 触发响应式更新
  return document.documentElement.getAttribute('data-theme') || '无'
}

const getThemeVariable = (varName: string) => {
  debugInfo.value // 触发响应式更新
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '未定义'
}

onMounted(() => {
  console.log('ThemeTestView mounted')
  console.log('Current theme:', themeStore.currentTheme)
  console.log('Dark mode:', themeStore.isDarkMode)
})
</script>

<style scoped>
.theme-test-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-header {
  background: var(--theme-bg-component);
  color: var(--theme-text-primary);
  padding: 24px;
  border-radius: 8px;
  border: 1px solid var(--theme-border-base);
  margin-bottom: 24px;
}

.test-controls {
  background: var(--theme-bg-component);
  color: var(--theme-text-primary);
  padding: 24px;
  border-radius: 8px;
  border: 1px solid var(--theme-border-base);
  margin-bottom: 24px;
}

.theme-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.theme-btn {
  padding: 8px 16px;
  border: 1px solid var(--theme-border-base);
  border-radius: 6px;
  background: var(--theme-bg-component);
  color: var(--theme-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-btn:hover {
  background: var(--theme-bg-hover);
}

.theme-btn.active {
  background: var(--theme-brand-primary);
  color: var(--theme-text-inverse);
  border-color: var(--theme-brand-primary);
}

.dark-mode-control {
  margin-top: 16px;
}

.dark-mode-control label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--theme-text-primary);
  cursor: pointer;
}

.test-samples {
  margin-bottom: 24px;
}

.sample-card {
  background: var(--theme-bg-component);
  color: var(--theme-text-primary);
  padding: 24px;
  border-radius: 8px;
  border: 1px solid var(--theme-border-base);
  margin-bottom: 16px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.color-item {
  padding: 16px;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
  border: 1px solid var(--theme-border-base);
}

.bg-primary {
  background: var(--theme-brand-primary);
  color: var(--theme-text-inverse);
}

.bg-component {
  background: var(--theme-bg-component);
  color: var(--theme-text-primary);
}

.bg-elevated {
  background: var(--theme-bg-elevated);
  color: var(--theme-text-primary);
}

.text-primary {
  background: var(--theme-bg-elevated);
  color: var(--theme-text-primary);
}

.text-secondary {
  background: var(--theme-bg-elevated);
  color: var(--theme-text-secondary);
}

.border-base {
  background: var(--theme-bg-elevated);
  color: var(--theme-text-primary);
  border: 2px solid var(--theme-border-base);
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--theme-brand-primary);
  color: var(--theme-text-inverse);
  border-color: var(--theme-brand-primary);
}

.btn-primary:hover {
  background: var(--theme-brand-primary-hover);
  border-color: var(--theme-brand-primary-hover);
}

.btn-secondary {
  background: var(--theme-bg-elevated);
  color: var(--theme-text-primary);
  border-color: var(--theme-border-base);
}

.btn-secondary:hover {
  background: var(--theme-bg-hover);
}

.btn-outline {
  background: transparent;
  color: var(--theme-brand-primary);
  border-color: var(--theme-brand-primary);
}

.btn-outline:hover {
  background: var(--theme-brand-primary);
  color: var(--theme-text-inverse);
}

.form-group {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.form-input,
.form-select {
  padding: 10px 16px;
  border: 1px solid var(--theme-border-base);
  border-radius: 6px;
  background: var(--theme-bg-component);
  color: var(--theme-text-primary);
  font-size: 14px;
  min-width: 200px;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--theme-brand-primary);
  box-shadow: 0 0 0 2px var(--theme-brand-primary-light);
}

.debug-info {
  background: var(--theme-bg-component);
  color: var(--theme-text-primary);
  padding: 24px;
  border-radius: 8px;
  border: 1px solid var(--theme-border-base);
  font-family: monospace;
}

.debug-item {
  margin-bottom: 8px;
  padding: 4px 0;
  border-bottom: 1px solid var(--theme-border-base);
}

.debug-item:last-child {
  border-bottom: none;
}

.debug-item strong {
  color: var(--theme-brand-primary);
}
</style>
