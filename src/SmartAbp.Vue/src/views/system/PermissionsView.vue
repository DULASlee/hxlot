<template>
  <div class="permissions-management">
    <header class="page-header">
      <h1>{{ pageTitle }}</h1>
      <p class="page-description">管理系统权限和权限分配</p>
    </header>
    
    <main class="page-content">
      <el-card class="content-card">
        <template #header>
          <div class="card-header">
            <span>权限列表</span>
            <el-button type="primary" size="small" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              添加权限
            </el-button>
          </div>
        </template>
        
        <div class="placeholder-content">
          <el-empty 
            description="权限管理功能正在开发中..." 
            :image-size="120"
          >
            <template #description>
              <p>此页面为占位组件，权限管理功能将在后续版本中实现</p>
            </template>
          </el-empty>
        </div>
      </el-card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 页面标题
const pageTitle = ref('权限管理')

// 创建权限处理
const handleCreate = () => {
  ElMessage.info('权限管理功能正在开发中，敬请期待！')
}
</script>

<style scoped>
.permissions-management {
  padding: var(--spacing-4);
  background: var(--theme-bg-component);
}

.page-header {
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--theme-border-base);
}

.page-header h1 {
  margin: 0 0 var(--spacing-2) 0;
  color: var(--theme-text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.page-description {
  margin: 0;
  color: var(--theme-text-secondary);
  font-size: 0.875rem;
}

.page-content {
  min-height: 400px;
}

.content-card {
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--theme-border-light);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-weight: 600;
  color: var(--theme-text-primary);
}

.placeholder-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
</style>
