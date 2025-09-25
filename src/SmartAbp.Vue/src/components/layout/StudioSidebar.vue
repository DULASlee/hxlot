<template>
  <aside
    class="studio-sidebar"
    :class="{ 'collapsed': collapsed }"
  >
    <el-menu
      :default-active="activeMenuKey"
      :collapse="collapsed"
      :unique-opened="true"
      :collapse-transition="false"
      router
    >
      <template
        v-for="item in menuItems"
        :key="item.path"
      >
        <el-sub-menu
          v-if="item.children && item.children.length > 0"
          :index="item.path"
        >
          <template #title>
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.path"
            :index="child.path"
          >
            {{ child.title }}
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item
          v-else
          :index="item.path"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>
            {{ item.title }}
          </template>
        </el-menu-item>
      </template>
    </el-menu>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWorkspaceStore } from '@/stores/modules/workspace'
import { useRouter } from 'vue-router'
import { DataBoard, Brush, MagicStick } from '@element-plus/icons-vue'

const workspaceStore = useWorkspaceStore()
const router = useRouter()

const collapsed = computed({
  get: () => workspaceStore.menuCollapsed,
  set: () => {
    workspaceStore.toggleMenu()
  }
})

const activeMenuKey = computed(() => router.currentRoute.value.path)

// Functional menu items with correct structure
const menuItems = ref([
  {
    path: '/lowcode',
    title: 'LowCode Studio',
    icon: MagicStick,
    children: [
      { path: '/lowcode/entity-modeling', title: 'Entity Modeling', icon: DataBoard, children: [] },
      { path: '/lowcode/design', title: 'Design', icon: Brush, children: [] },
    ]
  }
])
</script>

<style scoped>
.studio-sidebar {
  width: 240px;
  transition: width 0.3s ease;
  border-right: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
}

.studio-sidebar.collapsed {
  width: 64px; /* Corresponds to el-menu collapsed width */
}

.el-menu {
  border-right: none;
}
</style>
