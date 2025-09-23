<template>
  <div class="lowcode-studio-view">
    <h1>低代码工作室</h1>
    <div class="main-content">
      <div class="navigation-panel">
        <router-link to="/studio">
          项目概览
        </router-link>
        <router-link to="/studio/workflows">
          工作流
        </router-link>
        <router-link to="/studio/generation">
          代码生成
        </router-link>
      </div>
      <div class="editor-panel">
        <router-view />
      </div>
      <div class="sidebar">
        <!-- Sidebar content will be dynamic based on the route -->
        <ThemeEditor v-if="$route.path === '/studio'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeEditor from "@/components/lowcode/ThemeEditor.vue"
</script>

<style scoped>
.lowcode-studio-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
}
.main-content {
  display: flex;
  flex-grow: 1;
  gap: 24px;
}
.navigation-panel {
  width: 200px;
  border-right: 1px solid #e0e0e0;
  padding-right: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.editor-panel {
  flex-grow: 1;
}
.sidebar {
  width: 280px;
}
</style>


