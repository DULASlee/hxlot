<template>
  <div class="theme-demo">
    <div class="demo-header">
      <h1>企业级多主题样式系统演示</h1>
      <p>展示完整的主题切换功能，包括顶部导航栏、主菜单、副菜单和一键暗黑模式</p>
    </div>

    <div class="demo-content">
      <div class="demo-section">
        <h2>主题切换控制</h2>
        <div class="theme-controls">
          <div class="control-group">
            <label>快速主题切换：</label>
            <div class="theme-buttons">
              <button
                v-for="theme in availableThemes"
                :key="theme.value"
                class="theme-button"
                :class="{ active: currentTheme === theme.value }"
                :style="{ backgroundColor: theme.color }"
                @click="setTheme(theme.value as ThemeType)"
              >
                <i :class="theme.icon" />
                {{ theme.label }}
              </button>
            </div>
          </div>

          <div class="control-group">
            <label>一键暗黑模式：</label>
            <button
              class="dark-mode-toggle"
              :class="{ active: isDarkMode }"
              @click="toggleDarkMode"
            >
              <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'" />
              {{ isDarkMode ? '切换到浅色' : '切换到暗黑' }}
            </button>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h2>主题效果预览</h2>
        <div class="preview-grid">
          <div class="preview-card">
            <h3>顶部导航栏</h3>
            <div class="navbar-preview">
              <div class="nav-item">
                <i class="fas fa-home" />
                首页
              </div>
              <div class="nav-item active">
                <i class="fas fa-tachometer-alt" />
                仪表盘
              </div>
              <div class="nav-item">
                <i class="fas fa-users" />
                用户管理
              </div>
            </div>
          </div>

          <div class="preview-card">
            <h3>侧边栏菜单</h3>
            <div class="sidebar-preview">
              <div class="sidebar-item">
                <i class="fas fa-tachometer-alt" />
                <span>仪表盘</span>
              </div>
              <div class="sidebar-item active">
                <i class="fas fa-users" />
                <span>用户管理</span>
                <i class="fas fa-chevron-down" />
              </div>
              <div class="submenu">
                <div class="submenu-item">
                  <i class="fas fa-list" />
                  <span>用户列表</span>
                </div>
                <div class="submenu-item active">
                  <i class="fas fa-user-tag" />
                  <span>角色管理</span>
                </div>
              </div>
              <div class="sidebar-item">
                <i class="fas fa-project-diagram" />
                <span>项目管理</span>
              </div>
            </div>
          </div>

          <div class="preview-card">
            <h3>UI组件</h3>
            <div class="components-preview">
              <button class="btn btn-primary">
                主要按钮
              </button>
              <button class="btn btn-secondary">
                次要按钮
              </button>
              <button class="btn btn-success">
                成功按钮
              </button>
              <button class="btn btn-warning">
                警告按钮
              </button>
              <button class="btn btn-danger">
                危险按钮
              </button>

              <div class="card-preview">
                <h4>卡片标题</h4>
                <p>这是一个示例卡片内容，展示当前主题的样式效果。</p>
              </div>
            </div>
          </div>

          <div class="preview-card">
            <h3>表单元素</h3>
            <div class="form-preview">
              <div class="form-group">
                <label>输入框</label>
                <input
                  type="text"
                  placeholder="请输入内容"
                >
              </div>
              <div class="form-group">
                <label>下拉选择</label>
                <select>
                  <option>选项一</option>
                  <option>选项二</option>
                  <option>选项三</option>
                </select>
              </div>
              <div class="form-group">
                <label>文本域</label>
                <textarea placeholder="请输入多行文本" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h2>当前主题信息</h2>
        <div class="theme-info">
          <div class="info-item">
            <label>主题名称：</label>
            <span>{{ currentThemeConfig.name }}</span>
          </div>
          <div class="info-item">
            <label>主题值：</label>
            <span>{{ currentTheme }}</span>
          </div>
          <div class="info-item">
            <label>暗黑模式：</label>
            <span>{{ isDarkMode ? '开启' : '关闭' }}</span>
          </div>
          <div class="info-item">
            <label>当前是否暗黑：</label>
            <span>{{ isCurrentThemeDark ? '是' : '否' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores';
import type { ThemeType } from '@/composables/useDesignSystem';

export default defineComponent({
  name: 'ThemeDemo',
  setup() {
    const themeStore = useThemeStore();
    const { currentTheme, isDarkMode, isCurrentThemeDark, currentThemeConfig } = storeToRefs(themeStore);
    const { setTheme, toggleDarkMode } = themeStore;

    const availableThemes = computed(() => [
      { value: 'light', label: '浅色', color: '#ffffff', icon: 'fas fa-sun' },
      { value: 'dark', label: '暗黑', color: '#111827', icon: 'fas fa-moon' },
      { value: 'tech-blue', label: '科技蓝', color: '#1976d2', icon: 'fas fa-laptop-code' },
      { value: 'deep-green', label: '深绿色', color: '#2e7d32', icon: 'fas fa-leaf' },
      { value: 'light-purple', label: '浅紫色', color: '#7e57c2', icon: 'fas fa-palette' },
      { value: 'auto', label: '自动', color: '#f5f5f5', icon: 'fas fa-circle-half-stroke' },
    ]);

    return {
      currentTheme,
      isDarkMode,
      isCurrentThemeDark,
      currentThemeConfig,
      availableThemes,
      setTheme,
      toggleDarkMode,
    };
  },
});
</script>

<style scoped>
.theme-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
}

.demo-header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin-bottom: 16px;
}

.demo-header p {
  font-size: 1.1rem;
  color: var(--theme-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.demo-section {
  background-color: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.demo-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin-bottom: 20px;
  border-bottom: 2px solid var(--theme-border-base);
  padding-bottom: 8px;
}

.theme-controls {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-group label {
  font-weight: 500;
  color: var(--theme-text-primary);
}

.theme-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.theme-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--theme-shadow-md);
}

.theme-button.active {
  border-color: var(--theme-brand-primary);
  box-shadow: 0 0 0 2px var(--theme-brand-primary-alpha);
}

.dark-mode-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: var(--theme-bg-component);
  border: 2px solid var(--theme-border-base);
  border-radius: var(--radius-md);
  color: var(--theme-text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark-mode-toggle:hover {
  background-color: var(--theme-bg-hover);
}

.dark-mode-toggle.active {
  background-color: var(--theme-brand-primary);
  color: white;
  border-color: var(--theme-brand-primary);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.preview-card {
  background-color: var(--theme-bg-elevated);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-md);
  padding: 20px;
}

.preview-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin-bottom: 16px;
}

.navbar-preview {
  display: flex;
  gap: 8px;
  background-color: var(--theme-bg-navbar);
  padding: 12px;
  border-radius: var(--radius-md);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  color: var(--theme-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: var(--theme-bg-hover);
}

.nav-item.active {
  background-color: var(--theme-bg-accent);
  color: var(--theme-brand-primary);
}

.sidebar-preview {
  background-color: var(--theme-bg-sidebar);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--theme-text-sidebar);
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-item:hover {
  background-color: var(--theme-bg-sidebar-hover);
}

.sidebar-item.active {
  background-color: var(--theme-bg-sidebar-active);
  color: var(--theme-text-sidebar-active);
}

.submenu {
  background-color: rgba(0, 0, 0, 0.1);
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px 8px 32px;
  color: var(--theme-text-sidebar);
  cursor: pointer;
  transition: all 0.2s ease;
}

.submenu-item:hover {
  background-color: var(--theme-bg-sidebar-hover);
}

.submenu-item.active {
  background-color: var(--theme-bg-sidebar-active);
  color: var(--theme-text-sidebar-active);
}

.components-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--theme-brand-primary);
  color: white;
}

.btn-secondary {
  background-color: var(--theme-text-secondary);
  color: white;
}

.btn-success {
  background-color: var(--theme-success);
  color: white;
}

.btn-warning {
  background-color: var(--theme-warning);
  color: white;
}

.btn-danger {
  background-color: var(--theme-danger);
  color: white;
}

.card-preview {
  background-color: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-top: 16px;
}

.card-preview h4 {
  margin: 0 0 8px 0;
  color: var(--theme-text-primary);
}

.card-preview p {
  margin: 0;
  color: var(--theme-text-secondary);
}

.form-preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-weight: 500;
  color: var(--theme-text-primary);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 8px 12px;
  background-color: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-md);
  color: var(--theme-text-primary);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--theme-brand-primary);
  box-shadow: 0 0 0 2px var(--theme-brand-primary-alpha);
}

.theme-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item label {
  font-weight: 500;
  color: var(--theme-text-secondary);
}

.info-item span {
  color: var(--theme-text-primary);
  font-weight: 600;
}

@media (max-width: 768px) {
  .theme-demo {
    padding: 16px;
  }

  .demo-header h1 {
    font-size: 2rem;
  }

  .theme-buttons {
    grid-template-columns: 1fr;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }

  .control-group {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
