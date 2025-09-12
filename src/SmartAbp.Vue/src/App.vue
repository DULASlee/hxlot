<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 认证逻辑已统一移至 `src/router/index.ts` 中的路由守卫，以实现最佳实践并避免冲突。
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
  height: 100vh;

  /* 修复：移除overflow: hidden，改为auto */
  overflow: auto;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  height: 100vh;

  /* 修复：移除overflow: hidden */
  overflow: auto;
}
</style>
