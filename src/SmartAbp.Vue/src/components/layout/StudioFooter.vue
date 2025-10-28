<template>
  <footer class="studio-footer">
    <div class="footer-left">
      <span class="status-indicator">✅ Ready</span>
    </div>
    <div class="footer-right">
      <span>Errors: {{ errors.length }}</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useStudioStore } from '@/stores/modules/studioStore'
import { storeToRefs } from 'pinia'

const studioStore = useStudioStore()
const { errors } = storeToRefs(studioStore)
</script>

<style scoped>
.studio-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  padding: 0 var(--spacing-5);
  border-top: 1px solid var(--el-border-color);
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.footer-left, .footer-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.status-indicator {
  color: #67c23a;
}
</style>
