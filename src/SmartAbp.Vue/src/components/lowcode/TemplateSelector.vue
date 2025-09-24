<template>
  <div class="template-selector">
    <el-card>
      <template #header>
        <span>模板选择器</span>
      </template>
      
      <div class="content">
        <el-empty description="模板选择器功能开发中" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 临时简化组件
interface Props {
  templates?: any[]
}

defineProps<Props>()

// const emit = defineEmits<{
//   'template-selected': [template: any]
// }>() // 暂时注释未使用
</script>

<style scoped>
.template-selector {
  height: 100%;
}
.content {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
