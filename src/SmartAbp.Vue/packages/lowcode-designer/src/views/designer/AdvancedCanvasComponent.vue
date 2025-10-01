<template>
  <div class="advanced-canvas">
    <div class="canvas-wrapper">
      <div class="canvas-content">
        <!-- 画布内容 -->
        <div class="canvas-placeholder">
          <p>可视化设计画布</p>
          <small>拖拽组件到此处开始设计</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Advanced Canvas Component - Placeholder
</script>

<style scoped>
.advanced-canvas {
  width: 100%;
  height: 100%;
  background: var(--el-bg-color);
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
}

.canvas-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-placeholder {
  text-align: center;
  color: var(--el-text-color-secondary);
}

.canvas-placeholder p {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.canvas-placeholder small {
  font-size: 12px;
}
</style>
