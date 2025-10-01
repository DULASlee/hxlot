<template>
  <div class="version-history">
    <div class="history-header">
      <h3>版本历史</h3>
    </div>
    <div class="history-content">
      <div class="history-list">
        <div class="history-item">
          <div class="history-meta">
            <span class="history-time">刚刚</span>
            <span class="history-action">初始版本</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Version History - Placeholder
</script>

<style scoped>
.version-history {
  padding: 16px;
}

.history-header h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  padding: 8px;
  border-radius: 4px;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-light);
}

.history-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.history-time {
  color: var(--el-text-color-secondary);
}

.history-action {
  color: var(--el-text-color-primary);
}
</style>
