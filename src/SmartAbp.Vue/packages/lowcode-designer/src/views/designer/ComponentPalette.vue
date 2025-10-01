<template>
  <div class="component-palette">
    <h3>组件面板</h3>
    <p>这是一个临时的组件面板占位组件。</p>
  </div>
</template>

<script lang="ts">
// @ts-nocheck
import { defineComponent } from "vue"

export default defineComponent({
  name: "ComponentPalette",
  setup() {
    return {}
  },
})
</script>

<style scoped>
.component-palette {
  padding: 10px;
  border: 1px solid #ddd;
  margin: 5px;
}
</style>
