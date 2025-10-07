<template>
  <header class="studio-header">
    <div class="header-left">
      <div class="studio-logo">
        <el-icon :size="24">
          <Platform />
        </el-icon>
        <span class="logo-text">LowCode Studio</span>
      </div>
    </div>
    <div class="header-center">
      <!-- Module navigation can go here -->
    </div>
    <div class="header-right">
      <el-button
        text
        @click="$emit('open-template-manager')"
      >
        <el-icon><MagicStick /></el-icon>
        <span>Template Marketplace</span>
      </el-button>
      <el-button
        text
        @click="togglePropertyPanel"
      >
        <el-icon><Monitor /></el-icon>
        <span>Panels</span>
      </el-button>
      <el-button
        text
        @click="toggleMenu"
      >
        <el-icon><Fold /></el-icon>
        <span>Menu</span>
      </el-button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useStudioStore } from '@/stores/modules/studioStore'
import { Platform, Monitor, Fold, MagicStick } from '@element-plus/icons-vue'

const studioStore = useStudioStore()

const emit = defineEmits(['open-template-manager']);

const toggleMenu = () => {
  studioStore.toggleMenu()
}

const togglePropertyPanel = () => {
  studioStore.togglePropertyPanel()
}
</script>

<style scoped>
.studio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid var(--el-border-color);
}
.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.studio-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
</style>
