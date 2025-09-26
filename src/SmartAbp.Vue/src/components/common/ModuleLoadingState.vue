<template>
  <div class="module-loading-state">
    <p>Loading {{ module }}...</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  module: string
}>()
</script>

