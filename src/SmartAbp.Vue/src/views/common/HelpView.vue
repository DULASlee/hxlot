<template>
  <div class="help-view">
    <div class="help-header">
      <h1>帮助中心</h1>
      <p>欢迎使用SmartAbp管理系统，这里为您提供详细的使用指南和帮助文档。</p>
    </div>

    <div class="help-content">
      <div class="help-grid">
        <!-- 快速开始 -->
        <div class="help-card">
          <div class="help-card-header">
            <i class="fas fa-rocket help-icon" />
            <h3>快速开始</h3>
          </div>
          <div class="help-card-content">
            <ul>
              <li><a href="#getting-started">新手指南</a></li>
              <li><a href="#dashboard">仪表盘使用</a></li>
              <li><a href="#navigation">界面导航</a></li>
              <li><a href="#theme">主题切换</a></li>
            </ul>
          </div>
        </div>

        <!-- 用户管理 -->
        <div class="help-card">
          <div class="help-card-header">
            <i class="fas fa-users help-icon" />
            <h3>用户管理</h3>
          </div>
          <div class="help-card-content">
            <ul>
              <li><a href="#user-create">创建用户</a></li>
              <li><a href="#user-edit">编辑用户</a></li>
              <li><a href="#user-roles">角色分配</a></li>
              <li><a href="#user-permissions">权限管理</a></li>
            </ul>
          </div>
        </div>

        <!-- 项目管理 -->
        <div class="help-card">
          <div class="help-card-header">
            <i class="fas fa-project-diagram help-icon" />
            <h3>项目管理</h3>
          </div>
          <div class="help-card-content">
            <ul>
              <li><a href="#project-create">创建项目</a></li>
              <li><a href="#project-manage">项目管理</a></li>
              <li><a href="#project-analysis">项目分析</a></li>
              <li><a href="#project-reports">报表生成</a></li>
            </ul>
          </div>
        </div>

        <!-- 系统设置 -->
        <div class="help-card">
          <div class="help-card-header">
            <i class="fas fa-cog help-icon" />
            <h3>系统设置</h3>
          </div>
          <div class="help-card-content">
            <ul>
              <li><a href="#system-config">系统配置</a></li>
              <li><a href="#theme-settings">主题设置</a></li>
              <li><a href="#backup">数据备份</a></li>
              <li><a href="#security">安全设置</a></li>
            </ul>
          </div>
        </div>

        <!-- 常见问题 -->
        <div class="help-card">
          <div class="help-card-header">
            <i class="fas fa-question-circle help-icon" />
            <h3>常见问题</h3>
          </div>
          <div class="help-card-content">
            <ul>
              <li><a href="#faq-login">登录问题</a></li>
              <li><a href="#faq-permission">权限问题</a></li>
              <li><a href="#faq-performance">性能优化</a></li>
              <li><a href="#faq-troubleshoot">故障排除</a></li>
            </ul>
          </div>
        </div>

        <!-- 联系支持 -->
        <div class="help-card">
          <div class="help-card-header">
            <i class="fas fa-life-ring help-icon" />
            <h3>联系支持</h3>
          </div>
          <div class="help-card-content">
            <ul>
              <li><a href="#contact-email">邮件支持</a></li>
              <li><a href="#contact-phone">电话支持</a></li>
              <li><a href="#contact-ticket">工单系统</a></li>
              <li><a href="#contact-community">社区论坛</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 详细文档 -->
      <div class="help-documentation">
        <h2>详细文档</h2>

        <div
          id="getting-started"
          class="doc-section"
        >
          <h3>新手指南</h3>
          <p>欢迎使用SmartAbp管理系统！本指南将帮助您快速上手。</p>
          <ol>
            <li>首次登录后，您将看到仪表盘页面</li>
            <li>左侧是主要功能菜单，包括用户管理、项目管理等</li>
            <li>右上角是用户菜单和主题切换</li>
            <li>主内容区域会显示相应的功能页面</li>
          </ol>
        </div>

        <div
          id="theme"
          class="doc-section"
        >
          <h3>主题切换</h3>
          <p>系统支持多种主题模式：</p>
          <ul>
            <li><strong>浅色主题</strong>：适合白天使用的明亮主题</li>
            <li><strong>暗黑主题</strong>：适合夜间使用的深色主题</li>
            <li><strong>科技蓝</strong>：具有科技感的蓝色主题</li>
            <li><strong>深绿色</strong>：沉稳的绿色主题</li>
            <li><strong>浅紫色</strong>：优雅的紫色主题</li>
            <li><strong>自动模式</strong>：根据系统偏好自动切换</li>
          </ul>
          <p>点击右上角的主题切换按钮即可快速切换主题。</p>
        </div>

        <div
          id="user-management"
          class="doc-section"
        >
          <h3>用户管理</h3>
          <p>用户管理模块包含以下功能：</p>
          <ul>
            <li>用户列表：查看所有用户信息</li>
            <li>角色管理：管理系统角色和权限</li>
            <li>权限管理：细粒度权限控制</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HelpView',
});
</script>

<style scoped>
.help-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.help-header {
  text-align: center;
  margin-bottom: 40px;
}

.help-header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin-bottom: 16px;
}

.help-header p {
  font-size: 1.1rem;
  color: var(--theme-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.help-card {
  background-color: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-lg);
  padding: 24px;
  transition: all 0.3s ease;
}

.help-card:hover {
  box-shadow: var(--theme-shadow-lg);
  transform: translateY(-2px);
}

.help-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.help-icon {
  font-size: 24px;
  color: var(--theme-brand-primary);
}

.help-card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin: 0;
}

.help-card-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.help-card-content li {
  margin-bottom: 8px;
}

.help-card-content a {
  color: var(--theme-text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
  display: block;
  padding: 4px 0;
}

.help-card-content a:hover {
  color: var(--theme-brand-primary);
}

.help-documentation {
  background-color: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  border-radius: var(--radius-lg);
  padding: 32px;
}

.help-documentation h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin-bottom: 24px;
  border-bottom: 2px solid var(--theme-border-base);
  padding-bottom: 12px;
}

.doc-section {
  margin-bottom: 32px;
}

.doc-section h3 {
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--theme-text-primary);
  margin-bottom: 12px;
}

.doc-section p {
  color: var(--theme-text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.doc-section ul,
.doc-section ol {
  color: var(--theme-text-secondary);
  line-height: 1.6;
  padding-left: 20px;
}

.doc-section ul li,
.doc-section ol li {
  margin-bottom: 8px;
}

/* 响应式设计 */
@media (width <= 768px) {
  .help-view {
    padding: 16px;
  }

  .help-header h1 {
    font-size: 2rem;
  }

  .help-grid {
    grid-template-columns: 1fr;
  }

  .help-card {
    padding: 20px;
  }

  .help-documentation {
    padding: 24px;
  }
}
</style>
