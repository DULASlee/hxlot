<template>
  <div class="component-property-panel">
    <el-card>
      <template #header>
        <span>组件属性面板</span>
      </template>
      
      <div class="content">
        <el-empty description="组件属性面板功能开发中" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 临时简化组件
interface Props {
  selectedComponent?: any
}

defineProps<Props>()

// const emit = defineEmits<{
//   'property-change': [property: string, value: any]
// }>() // 暂时注释未使用
</script>

<style scoped>
.component-property-panel {
  height: 100%;
}
.content {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
