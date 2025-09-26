<template>
  <el-drawer
    :model-value="showPropertyPanel"
    title="Properties"
    direction="rtl"
    :with-header="true"
    :size="320"
    @close="closePanel"
  >
    <div class="property-panel-content">
      <p>Property panel content goes here.</p>
      <pre v-if="context">{{ context }}</pre>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceStore } from '@/stores/modules/workspace'

defineProps<{
  context?: object
}>()

const workspaceStore = useWorkspaceStore()
const showPropertyPanel = computed(() => workspaceStore.showPropertyPanel)

const closePanel = () => {
  workspaceStore.togglePropertyPanel()
}
</script>

<style scoped>
.property-panel-content {
  padding: 20px;
}
</style>
