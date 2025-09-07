<template>
  <div class="test-view">
    <div class="page-header">
      <h1>SmartAbp 系统测试</h1>
      <p>测试主框架的各项功能</p>
    </div>

    <div class="test-content">
      <!-- 主题测试 -->
      <div class="test-section">
        <h2>主题系统测试</h2>
        <div class="test-grid">
          <div class="test-card">
            <h3>当前主题状态</h3>
            <div class="status-info">
              <p><strong>当前主题:</strong> {{ themeStore.currentTheme }}</p>
              <p><strong>是否暗黑:</strong> {{ themeStore.isDarkMode ? '是' : '否' }}</p>
              <p><strong>主题类名:</strong> {{ themeStore.currentTheme }}</p>
            </div>
          </div>

          <div class="test-card">
            <h3>主题切换测试</h3>
            <div class="theme-buttons">
              <button
                v-for="theme in themes"
                :key="theme.value"
                :class="['theme-btn', { active: themeStore.currentTheme === theme.value }]"
                @click="switchTheme(theme.value)"
              >
                {{ theme.label }}
              </button>
            </div>
            <button class="dark-toggle-btn" @click="toggleDark">
              {{ themeStore.isDarkMode ? '切换到浅色' : '切换到深色' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 布局测试 -->
      <div class="test-section">
        <h2>布局系统测试</h2>
        <div class="test-grid">
          <div class="test-card">
            <h3>侧边栏状态</h3>
            <div class="status-info">
              <p><strong>侧边栏:</strong> {{ sidebarCollapsed ? '已收起' : '已展开' }}</p>
              <p><strong>副菜单:</strong> {{ showSubmenu ? '显示' : '隐藏' }}</p>
              <p><strong>当前菜单:</strong> {{ activeMenu }}</p>
            </div>
            <div class="layout-buttons">
              <button @click="testSidebar">切换侧边栏</button>
              <button @click="testSubmenu">切换副菜单</button>
            </div>
          </div>

          <div class="test-card">
            <h3>标签页测试</h3>
            <div class="status-info">
              <p><strong>当前标签:</strong> {{ activeTab }}</p>
              <p><strong>标签数量:</strong> {{ tabs.length }}</p>
            </div>
            <div class="tab-buttons">
              <button @click="addTestTab">添加测试标签</button>
              <button @click="closeAllTabs">关闭所有标签</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 路由测试 -->
      <div class="test-section">
        <h2>路由导航测试</h2>
        <div class="test-grid">
          <div class="test-card">
            <h3>系统管理页面</h3>
            <div class="nav-buttons">
              <button @click="navigateTo('/system/users')">用户管理</button>
              <button @click="navigateTo('/system/roles')">角色管理</button>
              <button @click="navigateTo('/system/permissions')">权限管理</button>
            </div>
          </div>

          <div class="test-card">
            <h3>项目管理页面</h3>
            <div class="nav-buttons">
              <button @click="navigateTo('/projects/list')">项目列表</button>
              <button @click="navigateTo('/projects/analysis')">项目分析</button>
            </div>
          </div>

          <div class="test-card">
            <h3>其他页面</h3>
            <div class="nav-buttons">
              <button @click="navigateTo('/profile')">个人中心</button>
              <button @click="navigateTo('/settings')">系统设置</button>
              <button @click="navigateTo('/dashboard')">返回工作台</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能测试 -->
      <div class="test-section">
        <h2>功能测试</h2>
        <div class="test-grid">
          <div class="test-card">
            <h3>本地存储测试</h3>
            <div class="storage-test">
              <input
                type="text"
                v-model="testData"
                placeholder="输入测试数据"
                class="test-input"
              />
              <div class="storage-buttons">
                <button @click="saveToStorage">保存到本地</button>
                <button @click="loadFromStorage">从本地加载</button>
                <button @click="clearStorage">清除数据</button>
              </div>
              <p v-if="storageResult" class="storage-result">{{ storageResult }}</p>
            </div>
          </div>

          <div class="test-card">
            <h3>响应式测试</h3>
            <div class="responsive-test">
              <p><strong>窗口宽度:</strong> {{ windowWidth }}px</p>
              <p><strong>设备类型:</strong> {{ deviceType }}</p>
              <button @click="testResponsive">测试响应式</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 测试结果 -->
      <div class="test-section">
        <h2>测试日志</h2>
        <div class="test-logs">
          <div
            v-for="(log, index) in testLogs"
            :key="index"
            :class="['log-item', log.type]"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
        <button @click="clearLogs" class="clear-logs-btn">清除日志</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores'

const router = useRouter()
const themeStore = useThemeStore()

// 测试数据
const testData = ref('')
const storageResult = ref('')
const windowWidth = ref(window.innerWidth)
const testLogs = ref<Array<{ time: string, message: string, type: string }>>([])

// 模拟布局状态（实际应该从父组件获取）
const sidebarCollapsed = ref(false)
const showSubmenu = ref(false)
const activeMenu = ref('dashboard')
const activeTab = ref('/dashboard')
const tabs = ref([
  { title: '工作台', path: '/dashboard', closable: false }
])

// 主题配置 - 使用统一的主题系统
const themes = [
  { label: '科技蓝', value: 'tech-blue' },
  { label: '深绿色', value: 'deep-green' },
  { label: '淡紫色', value: 'light-purple' },
  { label: '暗黑模式', value: 'dark' }
]

// 计算属性
const deviceType = computed(() => {
  if (windowWidth.value < 768) return '移动设备'
  if (windowWidth.value < 1024) return '平板设备'
  return '桌面设备'
})

// 方法
const addLog = (message: string, type: string = 'info') => {
  testLogs.value.unshift({
    time: new Date().toLocaleTimeString(),
    message,
    type
  })

  // 限制日志数量
  if (testLogs.value.length > 50) {
    testLogs.value = testLogs.value.slice(0, 50)
  }
}

const switchTheme = (theme: string) => {
  themeStore.setTheme(theme as any)
  addLog(`主题已切换到: ${theme}`, 'success')
}

const toggleDark = () => {
  themeStore.toggleDarkMode()
  addLog(`一键暗黑切换: ${themeStore.isDarkMode ? '暗黑模式' : '浅色模式'}`, 'success')
}

const testSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  addLog(`侧边栏${sidebarCollapsed.value ? '已收起' : '已展开'}`, 'info')
}

const testSubmenu = () => {
  showSubmenu.value = !showSubmenu.value
  addLog(`副菜单${showSubmenu.value ? '已显示' : '已隐藏'}`, 'info')
}

const addTestTab = () => {
  const testTab = {
    title: `测试标签 ${tabs.value.length}`,
    path: `/test/${Date.now()}`,
    closable: true
  }
  tabs.value.push(testTab)
  addLog(`添加了测试标签: ${testTab.title}`, 'info')
}

const closeAllTabs = () => {
  const closableCount = tabs.value.filter((tab: any) => tab.closable).length
  tabs.value = tabs.value.filter((tab: any) => !tab.closable)
  addLog(`关闭了 ${closableCount} 个标签页`, 'info')
}

const navigateTo = (path: string) => {
  router.push(path)
  addLog(`导航到: ${path}`, 'info')
}

const saveToStorage = () => {
  if (!testData.value) {
    storageResult.value = '请输入测试数据'
    addLog('保存失败: 数据为空', 'error')
    return
  }

  localStorage.setItem('smartabp_test_data', testData.value)
  storageResult.value = '数据已保存到本地存储'
  addLog(`保存数据到本地存储: ${testData.value}`, 'success')
}

const loadFromStorage = () => {
  const data = localStorage.getItem('smartabp_test_data')
  if (data) {
    testData.value = data
    storageResult.value = '数据已从本地存储加载'
    addLog(`从本地存储加载数据: ${data}`, 'success')
  } else {
    storageResult.value = '本地存储中没有数据'
    addLog('本地存储中没有找到数据', 'warning')
  }
}

const clearStorage = () => {
  localStorage.removeItem('smartabp_test_data')
  testData.value = ''
  storageResult.value = '本地存储数据已清除'
  addLog('本地存储数据已清除', 'info')
}

const testResponsive = () => {
  addLog(`当前窗口宽度: ${windowWidth.value}px, 设备类型: ${deviceType.value}`, 'info')
}

const clearLogs = () => {
  testLogs.value = []
  addLog('测试日志已清除', 'info')
}

// 窗口大小变化监听
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

// 生命周期
onMounted(() => {
  window.addEventListener('resize', handleResize)
  addLog('SmartAbp 系统测试页面已加载', 'success')
  addLog(`当前主题: ${themeStore.currentTheme}`, 'info')
  addLog(`当前路由: ${router.currentRoute.value.path}`, 'info')
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.test-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.page-header p {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin: 0;
}

.test-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.test-section {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  padding: 24px;
}

.test-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border-primary);
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.test-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  padding: 20px;
}

.test-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.status-info {
  margin-bottom: 16px;
}

.status-info p {
  margin: 8px 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.status-info strong {
  color: var(--color-text-primary);
}

.theme-buttons,
.layout-buttons,
.tab-buttons,
.nav-buttons,
.storage-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.theme-btn,
.dark-toggle-btn,
.layout-buttons button,
.tab-buttons button,
.nav-buttons button,
.storage-buttons button {
  padding: 6px 12px;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
}

.theme-btn:hover,
.dark-toggle-btn:hover,
.layout-buttons button:hover,
.tab-buttons button:hover,
.nav-buttons button:hover,
.storage-buttons button:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.theme-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.dark-toggle-btn {
  width: 100%;
  margin-top: 12px;
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.dark-toggle-btn:hover {
  background: var(--color-primary-hover);
}

.test-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.storage-result {
  margin-top: 12px;
  padding: 8px 12px;
  background: var(--color-bg-tertiary);
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.responsive-test p {
  margin: 8px 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.responsive-test strong {
  color: var(--color-text-primary);
}

.responsive-test button {
  padding: 8px 16px;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.responsive-test button:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.test-logs {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  padding: 12px;
  background: var(--color-bg-secondary);
  margin-bottom: 16px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-border-secondary);
  font-size: 14px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: var(--color-text-tertiary);
  font-size: 12px;
  min-width: 80px;
}

.log-message {
  flex: 1;
  color: var(--color-text-secondary);
}

.log-item.success .log-message {
  color: var(--color-success-500);
}

.log-item.error .log-message {
  color: var(--color-error-500);
}

.log-item.warning .log-message {
  color: var(--color-warning-500);
}

.clear-logs-btn {
  padding: 8px 16px;
  border: 1px solid var(--color-error-500);
  border-radius: 4px;
  background: transparent;
  color: var(--color-error-500);
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-logs-btn:hover {
  background: var(--color-error-50);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-grid {
    grid-template-columns: 1fr;
  }

  .theme-buttons,
  .layout-buttons,
  .tab-buttons,
  .nav-buttons,
  .storage-buttons {
    flex-direction: column;
  }

  .theme-btn,
  .layout-buttons button,
  .tab-buttons button,
  .nav-buttons button,
  .storage-buttons button {
    width: 100%;
  }
}
</style>
