<template>
  <div class="theme-switcher">
    <!-- 主题切换按钮 -->
    <div class="theme-toggle-btn" @click="showThemePanel = !showThemePanel">
      <span class="theme-icon">🎨</span>
      <span class="theme-text">主题</span>
    </div>

    <!-- 主题面板 -->
    <transition name="theme-panel">
      <div v-if="showThemePanel" class="theme-panel" @click.stop>
        <div class="theme-panel-header">
          <h3>选择主题</h3>
          <button class="close-btn" @click="showThemePanel = false">×</button>
        </div>

        <div class="theme-panel-content">
          <!-- 快速切换暗黑模式 -->
          <div class="quick-toggle">
            <div class="toggle-item">
              <span class="toggle-label">暗黑模式</span>
              <div class="toggle-switch" :class="{ active: isDark }" @click="toggleDark">
                <div class="toggle-slider"></div>
              </div>
            </div>
          </div>

          <!-- 主题选择 -->
          <div class="theme-options">
            <h4>主题风格</h4>
            <div class="theme-grid">
              <div
                v-for="themeOption in availableThemes"
                :key="themeOption.key"
                class="theme-option"
                :class="{ active: themeOption.current }"
                @click="setTheme(themeOption.key)"
              >
                <div class="theme-preview" :data-theme="themeOption.key">
                  <div class="preview-header"></div>
                  <div class="preview-sidebar"></div>
                  <div class="preview-content"></div>
                </div>
                <div class="theme-info">
                  <span class="theme-icon">{{ themeOption.icon }}</span>
                  <span class="theme-name">{{ themeOption.name }}</span>
                </div>
                <div v-if="themeOption.current" class="theme-check">✓</div>
              </div>
            </div>
          </div>

          <!-- 自定义设置 -->
          <div class="custom-settings">
            <h4>个性化设置</h4>
            <div class="setting-item">
              <label class="setting-label">
                <input
                  type="checkbox"
                  v-model="followSystemTheme"
                  @change="handleSystemThemeChange"
                >
                跟随系统主题
              </label>
            </div>
            <div class="setting-item">
              <label class="setting-label">
                <input
                  type="checkbox"
                  v-model="enableTransitions"
                  @change="handleTransitionChange"
                >
                启用主题切换动画
              </label>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 遮罩层 -->
    <div
      v-if="showThemePanel"
      class="theme-overlay"
      @click="showThemePanel = false"
    ></div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from '../composables/useTheme'

export default {
  name: 'ThemeSwitcher',
  setup() {
    const {
      currentTheme,
      theme,
      isDark,
      setTheme,
      toggleDark,
      getAvailableThemes,
      watchSystemTheme,
      THEMES
    } = useTheme()

    const showThemePanel = ref(false)
    const followSystemTheme = ref(!localStorage.getItem('app-theme'))
    const enableTransitions = ref(localStorage.getItem('theme-transitions') !== 'false')

    // 可用主题列表
    const availableThemes = computed(() => getAvailableThemes())

    // 处理系统主题跟随
    let systemThemeCleanup = null
    const handleSystemThemeChange = (event) => {
      if (event.target.checked) {
        localStorage.removeItem('app-theme')
        systemThemeCleanup = watchSystemTheme()
      } else {
        if (systemThemeCleanup) {
          systemThemeCleanup()
          systemThemeCleanup = null
        }
        // 保存当前主题
        localStorage.setItem('app-theme', currentTheme.value)
      }
    }

    // 处理动画设置
    const handleTransitionChange = (event) => {
      const enabled = event.target.checked
      enableTransitions.value = enabled
      localStorage.setItem('theme-transitions', enabled.toString())

      // 动态添加/移除动画类
      const root = document.documentElement
      if (enabled) {
        root.classList.add('theme-transitions')
      } else {
        root.classList.remove('theme-transitions')
      }
    }

    // 键盘快捷键
    const handleKeydown = (event) => {
      // Ctrl/Cmd + Shift + T 切换主题面板
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
        event.preventDefault()
        showThemePanel.value = !showThemePanel.value
      }

      // Ctrl/Cmd + Shift + D 切换暗黑模式
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault()
        toggleDark()
      }

      // ESC 关闭主题面板
      if (event.key === 'Escape' && showThemePanel.value) {
        showThemePanel.value = false
      }
    }

    onMounted(() => {
      // 初始化动画设置
      const root = document.documentElement
      if (enableTransitions.value) {
        root.classList.add('theme-transitions')
      }

      // 初始化系统主题跟随
      if (followSystemTheme.value) {
        systemThemeCleanup = watchSystemTheme()
      }

      // 添加键盘事件监听
      document.addEventListener('keydown', handleKeydown)
    })

    onUnmounted(() => {
      if (systemThemeCleanup) {
        systemThemeCleanup()
      }
      document.removeEventListener('keydown', handleKeydown)
    })

    return {
      showThemePanel,
      currentTheme,
      theme,
      isDark,
      availableThemes,
      followSystemTheme,
      enableTransitions,
      setTheme,
      toggleDark,
      handleSystemThemeChange,
      handleTransitionChange
    }
  }
}
</script>

<style scoped>
/* 主题切换按钮 */
.theme-switcher {
  position: relative;
}

.theme-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-bgSecondary);
  border: 1px solid var(--color-borderPrimary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: var(--color-textSecondary);
}

.theme-toggle-btn:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--color-shadowMedium);
}

.theme-icon {
  font-size: 16px;
}

/* 主题面板 */
.theme-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  background: var(--color-bgPrimary);
  border: 1px solid var(--color-borderPrimary);
  border-radius: 12px;
  box-shadow: 0 8px 32px var(--color-shadowHeavy);
  z-index: 1000;
  overflow: hidden;
}

.theme-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--color-bgSecondary);
  border-bottom: 1px solid var(--color-borderPrimary);
}

.theme-panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-textPrimary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--color-textSecondary);
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: var(--color-error);
  color: white;
}

.theme-panel-content {
  padding: 20px;
}

/* 快速切换 */
.quick-toggle {
  margin-bottom: 24px;
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-label {
  font-size: 14px;
  color: var(--color-textPrimary);
  font-weight: 500;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: var(--color-borderPrimary);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-switch.active {
  background: var(--color-primary);
}

.toggle-slider {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(20px);
}

/* 主题选择 */
.theme-options h4,
.custom-settings h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--color-textPrimary);
  font-weight: 600;
}

.theme-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid var(--color-borderPrimary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.theme-option:hover {
  border-color: var(--color-primary);
  background: var(--color-bgSecondary);
}

.theme-option.active {
  border-color: var(--color-primary);
  background: var(--color-bgSecondary);
}

.theme-preview {
  width: 48px;
  height: 32px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--color-borderPrimary);
  flex-shrink: 0;
}

/* 主题预览样式 */
.theme-preview[data-theme="light"] {
  background: #ffffff;
}

.theme-preview[data-theme="light"] .preview-header {
  background: #f7f8fa;
  height: 8px;
}

.theme-preview[data-theme="light"] .preview-sidebar {
  background: #001529;
  width: 12px;
  height: 24px;
  position: absolute;
  top: 8px;
  left: 0;
}

.theme-preview[data-theme="light"] .preview-content {
  background: #ffffff;
  margin-left: 12px;
  height: 24px;
  margin-top: 8px;
}

.theme-preview[data-theme="dark"] {
  background: #1a1a1a;
}

.theme-preview[data-theme="dark"] .preview-header {
  background: #2c2c2c;
  height: 8px;
}

.theme-preview[data-theme="dark"] .preview-sidebar {
  background: #0f0f0f;
  width: 12px;
  height: 24px;
  position: absolute;
  top: 8px;
  left: 0;
}

.theme-preview[data-theme="dark"] .preview-content {
  background: #1a1a1a;
  margin-left: 12px;
  height: 24px;
  margin-top: 8px;
}

.theme-preview[data-theme="blue"] {
  background: #f0f8ff;
}

.theme-preview[data-theme="blue"] .preview-header {
  background: #e6f4ff;
  height: 8px;
}

.theme-preview[data-theme="blue"] .preview-sidebar {
  background: #001a40;
  width: 12px;
  height: 24px;
  position: absolute;
  top: 8px;
  left: 0;
}

.theme-preview[data-theme="blue"] .preview-content {
  background: #f0f8ff;
  margin-left: 12px;
  height: 24px;
  margin-top: 8px;
}

.theme-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.theme-info .theme-icon {
  font-size: 18px;
}

.theme-name {
  font-size: 14px;
  color: var(--color-textPrimary);
  font-weight: 500;
}

.theme-check {
  color: var(--color-primary);
  font-weight: bold;
  font-size: 16px;
}

/* 自定义设置 */
.custom-settings {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-borderPrimary);
}

.setting-item {
  margin-bottom: 12px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-textPrimary);
  cursor: pointer;
}

.setting-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
}

/* 遮罩层 */
.theme-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

/* 动画效果 */
.theme-panel-enter-active,
.theme-panel-leave-active {
  transition: all 0.3s ease;
}

.theme-panel-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.theme-panel-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* 响应式 */
@media (max-width: 768px) {
  .theme-panel {
    width: 280px;
    right: -20px;
  }
}
</style>
