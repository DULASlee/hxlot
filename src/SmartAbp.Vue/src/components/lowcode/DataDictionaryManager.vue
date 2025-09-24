<template>
  <div class="data-dictionary-manager">
    <el-card>
      <template #header>
        <span>数据字典管理</span>
      </template>
      
      <div class="content">
        <el-empty description="数据字典管理功能开发中" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 临时简化组件
interface Props {
  dictionaries?: any[]
}

defineProps<Props>()

// const emit = defineEmits<{
//   'dictionary-added': [dictionary: any]
// }>() // 暂时注释未使用
</script>

<style scoped>
.data-dictionary-manager {
  height: 100%;
}
.content {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
