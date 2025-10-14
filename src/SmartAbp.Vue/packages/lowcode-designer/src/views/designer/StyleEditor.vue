<template>
  <div class="style-editor">
    <div class="editor-header">
      <h3>样式编辑器</h3>
    </div>
    <div class="editor-content">
      <div
        v-if="selectedComponents && selectedComponents.length > 0"
        class="style-controls"
      >
        <div class="style-group">
          <h4>布局</h4>
          <div class="style-item">
            <label>宽度:</label>
            <input
              type="text"
              placeholder="auto"
            >
          </div>
          <div class="style-item">
            <label>高度:</label>
            <input
              type="text"
              placeholder="auto"
            >
          </div>
        </div>
      </div>
      <div
        v-else
        class="no-selection"
      >
        <p>请选择一个组件</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedComponents?: any[]
}

defineProps<Props>()
</script>

<style scoped>
.style-editor {
  padding: 16px;
}

.editor-header h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
}

.style-group {
  margin-bottom: 16px;
}

.style-group h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.style-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.style-item label {
  flex: 0 0 60px;
  font-size: 12px;
}

.style-item input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  font-size: 12px;
}

.no-selection {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-align: center;
  padding: 20px;
}
</style>
