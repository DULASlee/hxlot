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
          :index="item.path + '_submenu'"
        >
          <template #title>
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            :index="item.path"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            🏠 {{ item.title }} 首页
          </el-menu-item>
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

// Complete menu structure matching the routes
const menuItems = ref([
  {
    path: '/codegen',
    title: '代码生成入口',
    icon: MagicStick,
    children: []
  },
  {
    path: '/CodeGen/ultra-simple',
    title: '极简代码生成',
    icon: MagicStick,
    children: []
  },
  {
    path: '/lowcode',
    title: '专业工作台',
    icon: MagicStick,
    children: [
      { path: '/lowcode/entity-modeling', title: '实体建模', icon: DataBoard, children: [] },
      { path: '/lowcode/design', title: '可视化设计', icon: Brush, children: [] },
      { path: '/lowcode/generation', title: '代码生成', icon: MagicStick, children: [] },
      { path: '/lowcode/theme', title: '主题定制', icon: Brush, children: [] },
      { path: '/lowcode/workflows', title: '工作流', icon: DataBoard, children: [] },
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
