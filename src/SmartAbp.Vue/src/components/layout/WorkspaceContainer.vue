<template>
  <div
    class="workspace-container"
    :class="containerClass"
  >
    <!-- 工具栏插槽 -->
    <div
      v-if="$slots.toolbar"
      class="workspace-toolbar"
    >
      <slot name="toolbar" />
    </div>

    <!-- 主内容区 -->
    <div class="workspace-body">
      <!-- 左侧面板 -->
      <aside
        v-if="$slots.aside"
        class="workspace-aside"
        :style="asideStyle"
      >
        <slot name="aside" />
      </aside>

      <!-- 中央内容 -->
      <main class="workspace-content">
        <slot />
      </main>

      <!-- 右侧面板 -->
      <aside
        v-if="$slots.properties"
        class="workspace-properties"
        :style="propertiesStyle"
      >
        <slot name="properties" />
      </aside>
    </div>

    <!-- 底部插槽 -->
    <div
      v-if="$slots.footer"
      class="workspace-footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  layout?: 'default' | 'full' | 'sidebar' | 'properties'
  asideWidth?: string
  propertiesWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'default',
  asideWidth: '240px',
  propertiesWidth: '320px'
})

const containerClass = computed(() => `layout-${props.layout}`)
const asideStyle = computed(() => ({ width: props.asideWidth }))
const propertiesStyle = computed(() => ({ width: props.propertiesWidth }))
</script>

<style scoped>
.workspace-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color-page);
}

.workspace-toolbar {
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
}

.workspace-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.workspace-aside,
.workspace-properties {
  overflow-y: auto;
  background-color: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color);
}

.workspace-aside {
  border-right: 1px solid var(--el-border-color);
  border-left: none;
}

.workspace-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.workspace-footer {
  padding: 8px 12px;
  border-top: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
}

/* Layout variations */
.layout-full .workspace-aside,
.layout-full .workspace-properties {
  display: none;
}

.layout-sidebar .workspace-properties {
  display: none;
}

.layout-properties .workspace-aside {
  display: none;
}
</style>
