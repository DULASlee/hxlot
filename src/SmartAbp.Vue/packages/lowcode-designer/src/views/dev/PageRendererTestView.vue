<template>
  <div class="page-renderer-test">
    <h2>页面渲染器测试页面</h2>
    <p>这是一个临时的测试页面，用于解决构建依赖问题。</p>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import { defineComponent } from "vue"

export default defineComponent({
  name: "PageRendererTestView",
  setup() {
    return {}
  },
})
</script>

<style scoped>
.page-renderer-test {
  padding: 20px;
}
</style>
