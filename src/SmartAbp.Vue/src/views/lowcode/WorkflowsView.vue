<template>
  <div class="workflows-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工作流管理</span>
          <el-button type="primary">新建工作流</el-button>
        </div>
      </template>
      <div class="workflows-content">
        <el-empty description="工作流功能开发中..." />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 工作流管理页面 - 占位实现
</script>

<style scoped>
.workflows-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>