<template>
  <div class="visual-component-palette">
    <el-card>
      <template #header>
        <span>组件面板</span>
      </template>
      
      <div class="content">
        <el-empty description="组件面板功能开发中" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 临时简化组件
interface Props {
  components?: any[]
}

defineProps<Props>()

// const emit = defineEmits<{
//   'component-selected': [component: any]
// }>() // 暂时注释未使用
</script>

<style scoped>
.visual-component-palette {
  height: 100%;
}
.content {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
