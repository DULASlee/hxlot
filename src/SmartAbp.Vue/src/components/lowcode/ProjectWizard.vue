<template>
  <div class="project-wizard">
    <el-card>
      <template #header>
        <span>项目向导</span>
      </template>
      
      <div class="content">
        <el-empty description="项目向导功能开发中" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 临时简化组件
interface Props {
  projectConfig?: any
}

defineProps<Props>()

// const emit = defineEmits<{
//   'project-created': [project: any]
// }>() // 暂时注释未使用
</script>

<style scoped>
.project-wizard {
  height: 100%;
}

.content {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
