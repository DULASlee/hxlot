<template>
  <div class="ui-customizer-test">
    <h2>UI定制器测试页面</h2>
    <p>这是一个临时的测试页面，用于解决构建依赖问题。</p>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import { defineComponent } from "vue"

export default defineComponent({
  name: "UICustomizerTestView",
  setup() {
    return {}
  },
})
</script>

<style scoped>
.ui-customizer-test {
  padding: 20px;
}
</style>
