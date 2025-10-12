<template>
  <div class="test-view-container">
    <h1>CodeGen Entity Designer PoC Test View</h1>
    <p>This view is for testing the CodeGenEntityDesigner.vue component in isolation.</p>
    <hr />
    <CodeGenEntityDesigner />
  </div>
</template>

<script setup lang="ts">
import CodeGenEntityDesigner from "../../components/CodeGenerator/CodeGenEntityDesigner.vue"
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
