<template>
  <div class="minimap-component">
    <div class="minimap-header">
      <h4>缩略图</h4>
    </div>
    <div class="minimap-canvas">
      <div class="minimap-viewport">
        <!-- 缩略图内容 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Minimap Component - Placeholder
</script>

<style scoped>
.minimap-component {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 200px;
  height: 120px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.minimap-header {
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.minimap-header h4 {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
}

.minimap-canvas {
  padding: 8px;
  height: calc(100% - 40px);
}

.minimap-viewport {
  width: 100%;
  height: 100%;
  background: var(--el-bg-color-page);
  border-radius: 4px;
  border: 1px dashed var(--el-border-color-light);
}
</style>
