<template>
  <div class="workflows-view">
    <h2>Workflow & State Machine Editor</h2>
    <StateMachineEditor />
  </div>
</template>

<script setup lang="ts">
import { StateMachineEditor } from "@smartabp/lowcode-designer"
</script>

<style scoped>
.workflows-view {
  padding: 24px;
  height: 100%;
}
</style>
