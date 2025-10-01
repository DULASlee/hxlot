<template>
  <div class="layer-manager">
    <div class="layer-header">
      <h3>图层管理</h3>
    </div>
    <div class="layer-list">
      <div
        v-for="(component, index) in components"
        :key="component.id || index"
        class="layer-item"
      >
        {{ component.name || `Component ${index + 1}` }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  components?: any[]
}

defineProps<Props>()
</script>

<style scoped>
.layer-manager {
  padding: 16px;
}

.layer-header h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
}

.layer-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.layer-item {
  padding: 8px 12px;
  border-radius: 4px;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-light);
  cursor: pointer;
}

.layer-item:hover {
  background: var(--el-color-primary-light-9);
}
</style>
