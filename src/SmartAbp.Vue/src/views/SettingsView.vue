<template>
  <div class="settings-view">
    <div class="page-header">
      <h1>系统设置</h1>
      <p>配置系统参数和偏好设置</p>
    </div>

    <div class="settings-content">
      <!-- 主题设置 -->
      <div class="settings-section">
        <h2>主题设置</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>界面主题</h3>
            <p>选择您喜欢的界面主题风格</p>
          </div>
          <div class="theme-options">
            <button
              v-for="theme in themes"
              :key="theme.value"
              :class="['theme-option', { active: themeStore.currentTheme === theme.value }]"
              @click="selectTheme(theme.value)"
            >
              <div class="theme-preview" :style="{ background: theme.color }"></div>
              <span>{{ theme.label }}</span>
            </button>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>一键暗黑模式</h3>
            <p>快速切换浅色和深色主题</p>
          </div>
          <button class="toggle-btn" @click="quickToggleDark">
            <svg v-if="themeStore.isDark" viewBox="0 0 24 24">
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
            </svg>
            {{ themeStore.isDark ? '切换到浅色' : '切换到深色' }}
          </button>
        </div>
      </div>

      <!-- 系统配置 -->
      <div class="settings-section">
        <h2>系统配置</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>系统名称</h3>
            <p>自定义系统显示名称</p>
          </div>
          <input
            type="text"
            v-model="systemSettings.name"
            class="setting-input"
          />
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>默认语言</h3>
            <p>设置系统默认语言</p>
          </div>
          <select v-model="systemSettings.language" class="setting-select">
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
            <option value="ja-JP">日本語</option>
          </select>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>时区设置</h3>
            <p>设置系统时区</p>
          </div>
          <select v-model="systemSettings.timezone" class="setting-select">
            <option value="Asia/Shanghai">北京时间 (UTC+8)</option>
            <option value="America/New_York">纽约时间 (UTC-5)</option>
            <option value="Europe/London">伦敦时间 (UTC+0)</option>
            <option value="Asia/Tokyo">东京时间 (UTC+9)</option>
          </select>
        </div>
      </div>

      <!-- 安全设置 -->
      <div class="settings-section">
        <h2>安全设置</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>会话超时</h3>
            <p>设置用户会话超时时间（分钟）</p>
          </div>
          <input
            type="number"
            v-model="securitySettings.sessionTimeout"
            class="setting-input"
            min="5"
            max="1440"
          />
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>密码复杂度</h3>
            <p>启用密码复杂度验证</p>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="securitySettings.passwordComplexity" />
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>登录日志</h3>
            <p>记录用户登录日志</p>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="securitySettings.loginLog" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <!-- 通知设置 -->
      <div class="settings-section">
        <h2>通知设置</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>邮件通知</h3>
            <p>启用系统邮件通知</p>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="notificationSettings.email" />
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>短信通知</h3>
            <p>启用系统短信通知</p>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="notificationSettings.sms" />
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>浏览器通知</h3>
            <p>启用浏览器推送通知</p>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="notificationSettings.browser" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <!-- 保存按钮 -->
      <div class="settings-actions">
        <button class="btn-primary" @click="saveSettings">保存设置</button>
        <button class="btn-secondary" @click="resetSettings">重置默认</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()

// 主题配置
const themes = [
  { label: '浅色主题', value: 'light', color: '#ffffff' },
  { label: '深色主题', value: 'dark', color: '#1a1a2e' },
  { label: '科技蓝', value: 'blue', color: '#0066cc' },
  { label: '自动切换', value: 'auto', color: 'linear-gradient(45deg, #ffffff 50%, #1a1a2e 50%)' }
]

// 系统设置
const systemSettings = ref({
  name: 'SmartAbp 企业管理系统',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai'
})

// 安全设置
const securitySettings = ref({
  sessionTimeout: 30,
  passwordComplexity: true,
  loginLog: true
})

// 通知设置
const notificationSettings = ref({
  email: true,
  sms: false,
  browser: true
})

// 方法
const selectTheme = (theme: string) => {
  themeStore.setTheme(theme as any)
  console.log(`主题已切换: ${theme}`)
}

const quickToggleDark = () => {
  themeStore.toggleTheme()
  console.log(`快速切换主题: ${themeStore.currentTheme}`)
}

const saveSettings = () => {
  // 保存设置到后端或本地存储
  const settings = {
    system: systemSettings.value,
    security: securitySettings.value,
    notification: notificationSettings.value,
    theme: themeStore.currentTheme
  }

  localStorage.setItem('smartabp_settings', JSON.stringify(settings))
  console.log('设置已保存:', settings)
  alert('设置保存成功！')
}

const resetSettings = () => {
  if (confirm('确定要重置所有设置为默认值吗？')) {
    systemSettings.value = {
      name: 'SmartAbp 企业管理系统',
      language: 'zh-CN',
      timezone: 'Asia/Shanghai'
    }

    securitySettings.value = {
      sessionTimeout: 30,
      passwordComplexity: true,
      loginLog: true
    }

    notificationSettings.value = {
      email: true,
      sms: false,
      browser: true
    }

    themeStore.setTheme('light')
    console.log('设置已重置为默认值')
    alert('设置已重置为默认值！')
  }
}
</script>

<style scoped>
.settings-view {
  max-width: 800px;
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

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  padding: 24px;
}

.settings-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border-primary);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border-secondary);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
  margin-right: 20px;
}

.setting-info h3 {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.setting-info p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.setting-input,
.setting-select {
  padding: 8px 12px;
  border: 1px solid var(--color-border-primary);
  border-radius: 6px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  min-width: 200px;
}

.theme-options {
  display: flex;
  gap: 12px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid var(--color-border-primary);
  border-radius: 8px;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-option:hover {
  border-color: var(--color-primary);
}

.theme-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.theme-preview {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--color-border-primary);
}

.theme-option span {
  font-size: 12px;
  font-weight: 500;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: var(--color-primary-hover);
}

.toggle-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-border-primary);
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--color-primary);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.settings-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 24px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}

.btn-secondary:hover {
  background: var(--color-bg-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .setting-info {
    margin-right: 0;
  }

  .setting-input,
  .setting-select {
    width: 100%;
    min-width: auto;
  }

  .theme-options {
    width: 100%;
    justify-content: space-between;
  }

  .theme-option {
    flex: 1;
  }

  .settings-actions {
    flex-direction: column;
  }
}
</style>
