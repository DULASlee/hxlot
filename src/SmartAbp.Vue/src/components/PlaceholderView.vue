<template>
  <div class="placeholder-view">
    <el-result icon="warning" title="组件开发中" sub-title="该功能正在开发中，敬请期待">
      <template #extra>
        <el-button @click="$router.go(-1)">返回</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
// 占位组件，用于开发中的功能
</script>

<style scoped>
.placeholder-view {
  padding: 40px;
}
</style>
