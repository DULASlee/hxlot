<!--
🎨 图标系统演示组件
展示如何正确使用Carbon和Material Design图标
-->
<template>
  <div class="icon-demo">
    <h2>🎨 SmartAbp 图标系统演示</h2>
    
    <!-- Element Plus 图标 -->
    <div class="icon-section">
      <h3>Element Plus 图标</h3>
      <div class="icon-grid">
        <div class="icon-item">
          <IconEpUser />
          <span>IconEpUser</span>
        </div>
        <div class="icon-item">
          <IconEpSetting />
          <span>IconEpSetting</span>
        </div>
        <div class="icon-item">
          <IconEpDocument />
          <span>IconEpDocument</span>
        </div>
      </div>
    </div>

    <!-- Carbon 图标 -->
    <div class="icon-section">
      <h3>Carbon (IBM) 图标</h3>
      <div class="icon-grid">
        <div class="icon-item">
          <IconCarbonUser />
          <span>IconCarbonUser</span>
        </div>
        <div class="icon-item">
          <IconCarbonDashboard />
          <span>IconCarbonDashboard</span>
        </div>
        <div class="icon-item">
          <IconCarbonSettings />
          <span>IconCarbonSettings</span>
        </div>
        <div class="icon-item">
          <IconCarbonDocument />
          <span>IconCarbonDocument</span>
        </div>
        <div class="icon-item">
          <IconCarbonFolder />
          <span>IconCarbonFolder</span>
        </div>
        <div class="icon-item">
          <IconCarbonCode />
          <span>IconCarbonCode</span>
        </div>
      </div>
    </div>

    <!-- Material Design 图标 -->
    <div class="icon-section">
      <h3>Material Design 图标</h3>
      <div class="icon-grid">
        <div class="icon-item">
          <IconMdiAccount />
          <span>IconMdiAccount</span>
        </div>
        <div class="icon-item">
          <IconMdiViewDashboard />
          <span>IconMdiViewDashboard</span>
        </div>
        <div class="icon-item">
          <IconMdiCog />
          <span>IconMdiCog</span>
        </div>
        <div class="icon-item">
          <IconMdiFileDocument />
          <span>IconMdiFileDocument</span>
        </div>
        <div class="icon-item">
          <IconMdiFolder />
          <span>IconMdiFolder</span>
        </div>
        <div class="icon-item">
          <IconMdiCodeTags />
          <span>IconMdiCodeTags</span>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="usage-guide">
      <h3>📖 使用说明</h3>
      <div class="code-example">
        <h4>1. 自动导入方式（推荐）</h4>
        <pre><code>&lt;template&gt;
  &lt;IconCarbonUser /&gt;  &lt;!-- Carbon图标 --&gt;
  &lt;IconMdiAccount /&gt;  &lt;!-- Material Design图标 --&gt;
  &lt;IconEpUser /&gt;      &lt;!-- Element Plus图标 --&gt;
&lt;/template&gt;</code></pre>
        
        <h4>2. 手动导入方式</h4>
        <pre><code>&lt;script setup&gt;
import IconCarbonUser from '~icons/carbon/user'
import IconMdiAccount from '~icons/mdi/account'
&lt;/script&gt;</code></pre>
        
        <h4>3. 图标命名规则</h4>
        <ul>
          <li><strong>Carbon:</strong> IconCarbon + PascalCase图标名</li>
          <li><strong>Material:</strong> IconMdi + PascalCase图标名</li>
          <li><strong>Element Plus:</strong> IconEp + PascalCase图标名</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 图标会通过unplugin-icons自动导入，无需手动导入
</script>

<style scoped>
.icon-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.icon-section {
  margin-bottom: 40px;
}

.icon-section h3 {
  color: var(--el-color-primary);
  margin-bottom: 16px;
  font-size: 18px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
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
  word-break: break-all;
}

.usage-guide {
  background: var(--el-bg-color-page);
  padding: 20px;
  border-radius: 8px;
  margin-top: 40px;
}

.usage-guide h3 {
  color: var(--el-color-success);
  margin-bottom: 16px;
}

.code-example h4 {
  color: var(--el-text-color-primary);
  margin: 16px 0 8px 0;
  font-size: 14px;
}

.code-example pre {
  background: var(--el-fill-color-darker);
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 8px 0;
}

.code-example code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.code-example ul {
  margin: 8px 0;
  padding-left: 20px;
}

.code-example li {
  margin: 4px 0;
  color: var(--el-text-color-regular);
}
</style>
</template>
