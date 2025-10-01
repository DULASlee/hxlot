<template>
  <div class="test-view-container">
    <h1>Entity Designer PoC Test View</h1>
    <p>This view is for testing the EntityDesigner.vue component in isolation.</p>
    <hr />
    <EntityDesigner />
  </div>
</template>

<script setup lang="ts">
import EntityDesigner from "../../components/CodeGenerator/EntityDesigner.vue"
</script>

<style scoped>
.test-view-container {
  padding: 20px;
  font-family: sans-serif;
}
hr {
  margin: 20px 0;
}
</style>
