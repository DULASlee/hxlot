<template>
  <div class="global-loading-overlay">
    <!-- Loading animation will be added here -->
    <p>Loading...</p>
  </div>
</template>

<script setup lang="ts">
// Logic to be implemented later
</script>

<style scoped>
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
</style>
