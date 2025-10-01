<template>
  <div class="module-wizard-test">
    <h2>模块向导测试页面</h2>
    <p>这是一个临时的测试页面，用于解决构建依赖问题。</p>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import { defineComponent } from "vue"

export default defineComponent({
  name: "ModuleWizardTestView",
  setup() {
    return {}
  },
})
</script>

<style scoped>
.module-wizard-test {
  padding: 20px;
}
</style>
