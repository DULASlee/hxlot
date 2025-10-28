<!--
🧪 简单图标测试组件
直接测试 unplugin-icons 是否工作
-->
<template>
  <div class="simple-icon-test">
    <h2>🎨 图标系统快速测试</h2>

    <div class="test-section">
      <h3>Carbon 图标测试</h3>
      <div class="icon-row">
        <div class="icon-item">
          <component :is="CarbonUser" />
          <span>CarbonUser</span>
        </div>
        <div class="icon-item">
          <component :is="CarbonDashboard" />
          <span>CarbonDashboard</span>
        </div>
        <div class="icon-item">
          <component :is="CarbonSettings" />
          <span>CarbonSettings</span>
        </div>
        <div class="icon-item">
          <component :is="CarbonFolder" />
          <span>CarbonFolder</span>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h3>Material Design 图标测试</h3>
      <div class="icon-row">
        <div class="icon-item">
          <component :is="MdiAccount" />
          <span>MdiAccount</span>
        </div>
        <div class="icon-item">
          <component :is="MdiViewDashboard" />
          <span>MdiViewDashboard</span>
        </div>
        <div class="icon-item">
          <component :is="MdiCog" />
          <span>MdiCog</span>
        </div>
        <div class="icon-item">
          <component :is="MdiFolder" />
          <span>MdiFolder</span>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h3>Element Plus 图标测试</h3>
      <div class="icon-row">
        <div class="icon-item">
          <component :is="EpUser" />
          <span>EpUser</span>
        </div>
        <div class="icon-item">
          <component :is="EpSetting" />
          <span>EpSetting</span>
        </div>
        <div class="icon-item">
          <component :is="EpDocument" />
          <span>EpDocument</span>
        </div>
        <div class="icon-item">
          <component :is="EpFolder" />
          <span>EpFolder</span>
        </div>
      </div>
    </div>

    <div class="test-result">
      <el-alert
        :title="testResult"
        :type="allIconsLoaded ? 'success' : 'warning'"
        :closable="false"
        show-icon
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

// 手动导入图标组件
import CarbonDashboard from '~icons/carbon/dashboard'
import CarbonFolder from '~icons/carbon/folder'
import CarbonSettings from '~icons/carbon/settings'
import CarbonUser from '~icons/carbon/user'

import MdiAccount from '~icons/mdi/account'
import MdiCog from '~icons/mdi/cog'
import MdiFolder from '~icons/mdi/folder'
import MdiViewDashboard from '~icons/mdi/view-dashboard'

import EpDocument from '~icons/ep/document'
import EpFolder from '~icons/ep/folder'
import EpSetting from '~icons/ep/setting'
import EpUser from '~icons/ep/user'

const allIconsLoaded = ref(false)
const testResult = ref('正在检测图标加载状态...')

onMounted(() => {
  // 简单检测图标是否加载成功
  setTimeout(() => {
    const iconElements = document.querySelectorAll('.simple-icon-test svg')
    const loadedCount = iconElements.length

    if (loadedCount >= 12) {
      allIconsLoaded.value = true
      testResult.value = `✅ 图标系统正常！成功加载 ${loadedCount} 个图标`
    } else {
      testResult.value = `⚠️ 部分图标未加载，已加载 ${loadedCount}/12 个图标`
    }
  }, 1000)
})
</script>

<style scoped>
.simple-icon-test {
  padding: var(--spacing-5);
  max-width: 800px;
  margin: 0 auto;
}

.simple-icon-test h2 {
  color: var(--el-color-primary);
  text-align: center;
  margin-bottom: 32px;
}

.test-section {
  margin-bottom: 32px;
}

.test-section h3 {
  color: var(--el-color-success);
  margin-bottom: 16px;
  font-size: 16px;
}

.icon-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-4);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  min-width: 100px;
  transition: all 0.3s ease;
}

.icon-item:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.icon-item svg {
  width: 24px;
  height: 24px;
  margin-bottom: 8px;
  color: var(--el-color-primary);
}

.icon-item span {
  font-size: 12px;
  color: var(--el-text-color-regular);
  text-align: center;
}

.test-result {
  margin-top: 32px;
}
</style>
