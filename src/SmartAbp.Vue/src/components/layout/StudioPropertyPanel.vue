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
import { useStudioStore } from '@/stores/modules/studioStore'

defineProps<{
  context?: object
}>()

const studioStore = useStudioStore()
const showPropertyPanel = computed(() => studioStore.showPropertyPanel)

const closePanel = () => {
  studioStore.togglePropertyPanel()
}
</script>

<style scoped>
.property-panel-content {
  padding: var(--spacing-5);
}
</style>
