<template>
  <div class="theme-debug">
    <div class="debug-panel">
      <h1>主题系统调试</h1>
      
      <div class="current-state">
        <h2>当前状态</h2>
        <p><strong>主题:</strong> {{ themeStore.currentTheme }}</p>
        <p><strong>暗黑模式:</strong> {{ themeStore.isDarkMode ? '是' : '否' }}</p>
        <p><strong>当前主题是否为暗黑:</strong> {{ themeStore.isCurrentThemeDark ? '是' : '否' }}</p>
      </div>

      <div class="dom-state">
        <h2>DOM状态</h2>
        <p><strong>data-theme:</strong> {{ dataTheme }}</p>
        <p><strong>主题类:</strong> {{ themeClasses }}</p>
        <p><strong>color-scheme:</strong> {{ colorScheme }}</p>
      </div>

      <div class="css-variables">
        <h2>CSS变量值</h2>
        <div
          v-for="variable in testVariables"
          :key="variable.name"
          class="variable-item"
        >
          <span class="variable-name">{{ variable.name }}:</span>
          <span class="variable-value">{{ variable.value }}</span>
          <div
            class="variable-sample"
            :style="{ [variable.property]: variable.value }"
          />
        </div>
      </div>

      <div class="controls">
        <h2>主题控制</h2>
        <div class="theme-buttons">
          <button 
            v-for="theme in themes" 
            :key="theme.value"
            :class="{ active: themeStore.currentTheme === theme.value }"
            @click="changeTheme(theme.value)"
          >
            {{ theme.name }}
          </button>
        </div>
        
        <div class="dark-mode-toggle">
          <label>
            <input 
              type="checkbox" 
              :checked="themeStore.isDarkMode" 
              @change="toggleDarkMode"
            >
            暗黑模式
          </label>
        </div>

        <div class="manual-controls">
          <button @click="manuallyApplyTheme">
            手动应用主题
          </button>
          <button @click="forceRefresh">
            强制刷新状态
          </button>
        </div>
      </div>

      <div class="visual-test">
        <h2>视觉测试</h2>
        <div class="test-card">
          <div class="card-header">
            卡片标题
          </div>
          <div class="card-body">
            <p>这是一段测试文本，用于验证主题颜色是否正确应用。</p>
            <button class="test-button primary">
              主要按钮
            </button>
            <button class="test-button secondary">
              次要按钮
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useThemeStore } from '@/stores'
import type { ThemeType } from '@/composables/useDesignSystem'

const themeStore = useThemeStore()

// 主题选项
const themes = [
  { name: '浅色', value: 'light' as ThemeType },
  { name: '暗黑', value: 'dark' as ThemeType },
  { name: '科技蓝', value: 'tech-blue' as ThemeType },
  { name: '深绿色', value: 'deep-green' as ThemeType },
  { name: '浅紫色', value: 'light-purple' as ThemeType },
  { name: '自动', value: 'auto' as ThemeType },
]

// 监控的CSS变量
const testVariables = ref([
  { name: '--theme-brand-primary', property: 'color', value: '' },
  { name: '--theme-bg-component', property: 'backgroundColor', value: '' },
  { name: '--theme-text-primary', property: 'color', value: '' },
  { name: '--theme-border-base', property: 'borderColor', value: '' },
  { name: '--theme-bg-navbar', property: 'backgroundColor', value: '' },
])

// DOM状态
const dataTheme = ref('')
const themeClasses = ref('')
const colorScheme = ref('')

// 更新DOM状态
const updateDOMState = () => {
  dataTheme.value = document.documentElement.getAttribute('data-theme') || '无'
  
  const classes = Array.from(document.documentElement.classList)
  themeClasses.value = classes.filter(cls => cls.startsWith('theme-')).join(', ') || '无'
  
  colorScheme.value = document.documentElement.style.colorScheme || 
    getComputedStyle(document.documentElement).colorScheme || '无'
  
  // 更新CSS变量值
  testVariables.value.forEach(variable => {
    variable.value = getComputedStyle(document.documentElement)
      .getPropertyValue(variable.name).trim() || '未定义'
  })
}

// 主题切换
const changeTheme = async (theme: ThemeType) => {
  console.log('🎨 切换主题到:', theme)
  themeStore.setTheme(theme)
  
  // 等待DOM更新
  await nextTick()
  setTimeout(() => {
    updateDOMState()
    console.log('✅ 主题切换完成，DOM状态已更新')
  }, 100)
}

// 暗黑模式切换
const toggleDarkMode = async () => {
  console.log('🌙 切换暗黑模式')
  themeStore.toggleDarkMode()
  
  await nextTick()
  setTimeout(() => {
    updateDOMState()
    console.log('✅ 暗黑模式切换完成')
  }, 100)
}

// 手动应用主题
const manuallyApplyTheme = () => {
  console.log('🔧 手动应用主题')
  themeStore.applyTheme()
  setTimeout(updateDOMState, 100)
}

// 强制刷新状态
const forceRefresh = () => {
  console.log('🔄 强制刷新状态')
  updateDOMState()
}

// 组件挂载时初始化
onMounted(() => {
  console.log('🚀 ThemeDebugView 挂载')
  updateDOMState()
  
  // 设置定时器，定期更新状态
  const interval = setInterval(updateDOMState, 1000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
.theme-debug {
  padding: 24px;
  min-height: 100vh;
  background: var(--theme-bg-body, #f9fafb);
  color: var(--theme-text-primary, #111827);
}

.debug-panel {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.debug-panel h1 {
  color: var(--theme-brand-primary, #0ea5e9);
  margin: 0 0 24px;
}

.debug-panel h2 {
  color: var(--theme-text-primary, #111827);
  margin: 0 0 16px;
  font-size: 20px;
  border-bottom: 2px solid var(--theme-border-base, #e5e7eb);
  padding-bottom: 8px;
}

.current-state,
.dom-state,
.css-variables,
.controls,
.visual-test {
  background: var(--theme-bg-component, #fff);
  border: 1px solid var(--theme-border-base, #e5e7eb);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--theme-shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 5%));
}

.current-state p,
.dom-state p {
  margin: 8px 0;
  font-family: monospace;
  background: var(--theme-bg-sunken, #f3f4f6);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--theme-border-light, #f3f4f6);
}

.variable-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
  padding: 8px;
  background: var(--theme-bg-sunken, #f3f4f6);
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
}

.variable-name {
  font-weight: 600;
  color: var(--theme-brand-primary, #0ea5e9);
  min-width: 200px;
}

.variable-value {
  flex: 1;
  color: var(--theme-text-secondary, #374151);
}

.variable-sample {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--theme-border-base, #e5e7eb);
}

.theme-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.theme-buttons button {
  padding: 8px 16px;
  border: 1px solid var(--theme-border-base, #e5e7eb);
  border-radius: 6px;
  background: var(--theme-bg-component, #fff);
  color: var(--theme-text-primary, #111827);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-buttons button:hover {
  background: var(--theme-bg-hover, rgb(0 0 0 / 4%));
  border-color: var(--theme-brand-primary, #0ea5e9);
}

.theme-buttons button.active {
  background: var(--theme-brand-primary, #0ea5e9);
  color: var(--theme-text-inverse, #fff);
  border-color: var(--theme-brand-primary, #0ea5e9);
}

.dark-mode-toggle {
  margin: 16px 0;
}

.dark-mode-toggle label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
}

.manual-controls {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.manual-controls button {
  padding: 10px 16px;
  border: 1px solid var(--theme-brand-primary, #0ea5e9);
  border-radius: 6px;
  background: var(--theme-brand-primary, #0ea5e9);
  color: var(--theme-text-inverse, #fff);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.manual-controls button:hover {
  background: var(--theme-brand-primary-hover, #0284c7);
  border-color: var(--theme-brand-primary-hover, #0284c7);
}

.test-card {
  border: 1px solid var(--theme-border-base, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
  background: var(--theme-bg-component, #fff);
}

.card-header {
  padding: 16px 20px;
  background: var(--theme-bg-sunken, #f3f4f6);
  border-bottom: 1px solid var(--theme-border-base, #e5e7eb);
  font-weight: 600;
  color: var(--theme-text-primary, #111827);
}

.card-body {
  padding: 20px;
}

.card-body p {
  margin: 0 0 16px;
  color: var(--theme-text-secondary, #374151);
  line-height: 1.6;
}

.test-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 8px;
}

.test-button.primary {
  background: var(--theme-brand-primary, #0ea5e9);
  color: var(--theme-text-inverse, #fff);
  border: 1px solid var(--theme-brand-primary, #0ea5e9);
}

.test-button.primary:hover {
  background: var(--theme-brand-primary-hover, #0284c7);
  border-color: var(--theme-brand-primary-hover, #0284c7);
}

.test-button.secondary {
  background: var(--theme-bg-component, #fff);
  color: var(--theme-text-primary, #111827);
  border: 1px solid var(--theme-border-base, #e5e7eb);
}

.test-button.secondary:hover {
  background: var(--theme-bg-hover, rgb(0 0 0 / 4%));
  border-color: var(--theme-brand-primary, #0ea5e9);
  color: var(--theme-brand-primary, #0ea5e9);
}
</style>
