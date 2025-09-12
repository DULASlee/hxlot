// Manifest Writer - 模块清单写入器和菜单聚合器
// 负责生成代码文件、更新路由、注入菜单

import {
  ModuleManifest,
  RouteConfig,
  MenuConfig,
  MenuItemConfig,
  GeneratedFile,
  ManifestWriter,
  MenuAggregator,
  RuntimeMenuInjector,
} from "../types/manifest"

/**
 * 模块清单写入器 - 核心实现类
 */
export class SmartAbpManifestWriter implements ManifestWriter {
  private menuAggregator: MenuAggregator
  private runtimeInjector: RuntimeMenuInjector

  constructor() {
    this.menuAggregator = new SmartAbpMenuAggregator()
    this.runtimeInjector = new SmartAbpRuntimeMenuInjector()
  }

  /**
   * 写入模块清单并生成所有相关文件
   */
  async writeManifest(manifest: ModuleManifest): Promise<void> {
    try {
      console.log(`[ManifestWriter] 开始写入模块: ${manifest.name}`)

      // 1. 生成代码文件
      const generatedFiles = await this.generateFiles(manifest)
      console.log(`[ManifestWriter] 生成了 ${generatedFiles.length} 个文件`)

      // 2. 更新路由配置
      await this.updateRouter(manifest.routes)
      console.log(`[ManifestWriter] 更新了 ${manifest.routes.length} 个路由`)

      // 3. 更新菜单配置
      if (manifest.menuConfig) {
        await this.updateMenus(manifest.menuConfig)
        console.log(`[ManifestWriter] 更新了菜单配置`)
      }

      // 4. 聚合菜单并注入运行时
      this.menuAggregator.addModule(manifest)
      const menuTree = this.menuAggregator.generateMenuTree()
      this.runtimeInjector.inject(menuTree)

      console.log(`[ManifestWriter] 模块 ${manifest.name} 写入完成`)
    } catch (error) {
      console.error(`[ManifestWriter] 写入模块失败:`, error)
      throw error
    }
  }

  /**
   * 生成模块相关的所有文件
   */
  async generateFiles(manifest: ModuleManifest): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = []
    const moduleName = manifest.name
    const entityName = manifest.name // 假设实体名与模块名相同

    // 生成 Vue 组件文件
    files.push(
      this.generateListView(moduleName, entityName, manifest.displayName),
      this.generateManagementView(moduleName, entityName, manifest.displayName),
      this.generateStore(moduleName, entityName),
    )

    // 生成路由配置文件
    files.push(this.generateRouteConfig(manifest.routes))

    // 生成菜单配置文件
    if (manifest.menuConfig) {
      files.push(this.generateMenuConfig(manifest.menuConfig, moduleName))
    }

    return files
  }

  /**
   * 生成列表视图组件
   */
  private generateListView(
    moduleName: string,
    entityName: string,
    displayName: string,
  ): GeneratedFile {
    const content = `<template>
  <div class="${moduleName.toLowerCase()}-list">
    <div class="page-header">
      <h1>📋 ${displayName}列表</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增${displayName.replace("管理", "")}
      </el-button>
    </div>

    <div class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="请输入搜索关键词" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" :loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="creationTime" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.creationTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { use${entityName}Store } from '@/stores/modules/${moduleName.toLowerCase()}'
import { formatDate } from '@/utils/date'

const ${moduleName.toLowerCase()}Store = use${entityName}Store()

const loading = ref(false)
const tableData = ref([])

const searchForm = reactive({
  keyword: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

const loadData = async () => {
  loading.value = true
  try {
    const result = await ${moduleName.toLowerCase()}Store.getList({
      ...searchForm,
      skipCount: (pagination.current - 1) * pagination.pageSize,
      maxResultCount: pagination.pageSize
    })
    tableData.value = result.items
    pagination.total = result.totalCount
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  // 跳转到新增页面或打开弹窗
  console.log('新增${displayName.replace("管理", "")}')
}

const handleEdit = (row: any) => {
  // 跳转到编辑页面或打开弹窗
  console.log('编辑', row)
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(\`确定要删除"\${row.name}"吗？\`, '确认删除', {
      type: 'warning'
    })
    await ${moduleName.toLowerCase()}Store.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  searchForm.keyword = ''
  pagination.current = 1
  loadData()
}

const handleSizeChange = () => {
  pagination.current = 1
  loadData()
}

const handleCurrentChange = () => {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.${moduleName.toLowerCase()}-list {
  padding: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.search-bar {
  margin-bottom: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
`

    return {
      path: `src/views/${moduleName.toLowerCase()}/${moduleName}ListView.vue`,
      content,
      type: "component",
    }
  }

  /**
   * 生成管理视图组件
   */
  private generateManagementView(
    moduleName: string,
    entityName: string,
    displayName: string,
  ): GeneratedFile {
    const content = `<template>
  <div class="${moduleName.toLowerCase()}-management">
    <div class="page-header">
      <h1>⚙️ ${displayName}</h1>
    </div>

    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="数据管理" name="data">
        <${entityName}DataManagement />
      </el-tab-pane>
      <el-tab-pane label="权限配置" name="permissions">
        <${entityName}PermissionConfig />
      </el-tab-pane>
      <el-tab-pane label="系统设置" name="settings">
        <${entityName}SystemSettings />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 子组件（这里使用动态组件，实际项目中需要创建对应组件）
const ${entityName}DataManagement = () => import('./${entityName}DataManagement.vue')
const ${entityName}PermissionConfig = () => import('./${entityName}PermissionConfig.vue')
const ${entityName}SystemSettings = () => import('./${entityName}SystemSettings.vue')

const activeTab = ref('data')
</script>

<style scoped>
.${moduleName.toLowerCase()}-management {
  padding: 16px;
}

.page-header {
  margin-bottom: 16px;
}
</style>
`

    return {
      path: `src/views/${moduleName.toLowerCase()}/${moduleName}Management.vue`,
      content,
      type: "component",
    }
  }

  /**
   * 生成 Pinia Store
   */
  private generateStore(moduleName: string, entityName: string): GeneratedFile {
    const content = `import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PagedResultDto, ListResultDto } from '@/types/abp'

export interface ${entityName} {
  id: string
  name: string
  creationTime: string
  lastModificationTime?: string
}

export interface Create${entityName}Input {
  name: string
}

export interface Update${entityName}Input {
  name: string
}

export interface Get${entityName}ListInput {
  keyword?: string
  skipCount?: number
  maxResultCount?: number
}

export const use${entityName}Store = defineStore('${moduleName.toLowerCase()}', () => {
  // State
  const items = ref<${entityName}[]>([])
  const loading = ref(false)
  const total = ref(0)

  // Getters
  const itemCount = computed(() => items.value.length)
  const hasItems = computed(() => items.value.length > 0)

  // Actions
  const getList = async (input: Get${entityName}ListInput = {}): Promise<PagedResultDto<${entityName}>> => {
    loading.value = true
    try {
      // TODO: 替换为实际的 API 调用
      const response = await fetch('/api/services/app/${entityName}/GetList', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input)
      })

      if (!response.ok) {
        throw new Error('获取列表失败')
      }

      const result: PagedResultDto<${entityName}> = await response.json()
      items.value = result.items
      total.value = result.totalCount

      return result
    } catch (error) {
      console.error('获取${entityName}列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const get = async (id: string): Promise<${entityName}> => {
    try {
      // TODO: 替换为实际的 API 调用
      const response = await fetch(\`/api/services/app/${entityName}/Get?id=\${id}\`)

      if (!response.ok) {
        throw new Error('获取详情失败')
      }

      return await response.json()
    } catch (error) {
      console.error('获取${entityName}详情失败:', error)
      throw error
    }
  }

  const create = async (input: Create${entityName}Input): Promise<${entityName}> => {
    try {
      // TODO: 替换为实际的 API 调用
      const response = await fetch('/api/services/app/${entityName}/Create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input)
      })

      if (!response.ok) {
        throw new Error('创建失败')
      }

      const result = await response.json()
      items.value.unshift(result)
      total.value += 1

      return result
    } catch (error) {
      console.error('创建${entityName}失败:', error)
      throw error
    }
  }

  const update = async (id: string, input: Update${entityName}Input): Promise<${entityName}> => {
    try {
      // TODO: 替换为实际的 API 调用
      const response = await fetch(\`/api/services/app/${entityName}/Update?id=\${id}\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input)
      })

      if (!response.ok) {
        throw new Error('更新失败')
      }

      const result = await response.json()
      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value[index] = result
      }

      return result
    } catch (error) {
      console.error('更新${entityName}失败:', error)
      throw error
    }
  }

  const deleteItem = async (id: string): Promise<void> => {
    try {
      // TODO: 替换为实际的 API 调用
      const response = await fetch(\`/api/services/app/${entityName}/Delete?id=\${id}\`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('删除失败')
      }

      const index = items.value.findIndex(item => item.id === id)
      if (index !== -1) {
        items.value.splice(index, 1)
        total.value -= 1
      }
    } catch (error) {
      console.error('删除${entityName}失败:', error)
      throw error
    }
  }

  // 重置状态
  const reset = () => {
    items.value = []
    loading.value = false
    total.value = 0
  }

  return {
    // State
    items,
    loading,
    total,

    // Getters
    itemCount,
    hasItems,

    // Actions
    getList,
    get,
    create,
    update,
    delete: deleteItem,
    reset
  }
})
`

    return {
      path: `src/stores/modules/${moduleName.toLowerCase()}.ts`,
      content,
      type: "store",
    }
  }

  /**
   * 生成路由配置
   */
  private generateRouteConfig(routes: RouteConfig[]): GeneratedFile {
    const content = `// Auto-generated route configuration
// 自动生成的路由配置文件

import type { RouteRecordRaw } from 'vue-router'

export const moduleRoutes: RouteRecordRaw[] = ${JSON.stringify(routes, null, 2)}
`

    return {
      path: "src/router/modules/generated-routes.ts",
      content,
      type: "route",
    }
  }

  /**
   * 生成菜单配置
   */
  private generateMenuConfig(menuConfig: MenuConfig, moduleName: string): GeneratedFile {
    const content = `// Auto-generated menu configuration
// 自动生成的菜单配置文件

export const ${moduleName.toLowerCase()}MenuConfig = ${JSON.stringify(menuConfig, null, 2)}
`

    return {
      path: `src/config/menus/${moduleName.toLowerCase()}-menu.ts`,
      content,
      type: "menu",
    }
  }

  /**
   * 更新路由配置
   */
  async updateRouter(routes: RouteConfig[]): Promise<void> {
    // TODO: 实现路由更新逻辑
    console.log("[ManifestWriter] 更新路由配置:", routes)
  }

  /**
   * 更新菜单配置
   */
  async updateMenus(menuConfig: MenuConfig): Promise<void> {
    // TODO: 实现菜单更新逻辑
    console.log("[ManifestWriter] 更新菜单配置:", menuConfig)
  }
}

/**
 * 菜单聚合器 - 负责聚合多个模块的菜单
 */
export class SmartAbpMenuAggregator implements MenuAggregator {
  private modules = new Map<string, ModuleManifest>()

  addModule(manifest: ModuleManifest): void {
    this.modules.set(manifest.name, manifest)
    console.log(`[MenuAggregator] 添加模块菜单: ${manifest.name}`)
  }

  removeModule(moduleName: string): void {
    this.modules.delete(moduleName)
    console.log(`[MenuAggregator] 移除模块菜单: ${moduleName}`)
  }

  generateMenuTree(): MenuItemConfig[] {
    const menuItems: MenuItemConfig[] = []

    for (const [moduleName, manifest] of this.modules) {
      if (manifest.menuConfig && manifest.menuConfig.features.includes("showInMenu")) {
        const menuItem: MenuItemConfig = {
          key: moduleName.toLowerCase(),
          title: manifest.displayName,
          path: manifest.routes[0]?.path || `/${moduleName}`,
          icon: manifest.menuConfig.icon,
          roles: manifest.routes[0]?.meta.requiredRoles,
          children: this.generateChildMenus(manifest.routes),
        }
        menuItems.push(menuItem)
      }
    }

    // 按 order 排序
    return menuItems.sort((a, b) => {
      const orderA = this.modules.get(a.key)?.order || 999
      const orderB = this.modules.get(b.key)?.order || 999
      return orderA - orderB
    })
  }

  private generateChildMenus(routes: RouteConfig[]): MenuItemConfig[] {
    return routes
      .filter((route) => route.meta.showInMenu)
      .map((route) => ({
        key: route.meta.menuKey,
        title: route.meta.title,
        path: route.path,
        icon: route.meta.icon,
        roles: route.meta.requiredRoles,
      }))
  }

  injectRuntimeMenus(): void {
    const menuTree = this.generateMenuTree()
    // TODO: 注入到运行时菜单系统
    console.log("[MenuAggregator] 生成菜单树:", menuTree)
  }
}

/**
 * 运行时菜单注入器 - 负责将菜单注入到运行时系统
 */
export class SmartAbpRuntimeMenuInjector implements RuntimeMenuInjector {
  private currentMenus: MenuItemConfig[] = []

  inject(menus: MenuItemConfig[]): void {
    this.currentMenus = menus
    // TODO: 实现运行时菜单注入逻辑
    console.log("[RuntimeMenuInjector] 注入菜单:", menus)

    // 触发菜单更新事件
    window.dispatchEvent(
      new CustomEvent("menu-updated", {
        detail: { menus },
      }),
    )
  }

  remove(moduleNames: string[]): void {
    this.currentMenus = this.currentMenus.filter((menu) => !moduleNames.includes(menu.key))
    console.log("[RuntimeMenuInjector] 移除菜单:", moduleNames)
  }

  refresh(): void {
    // 重新注入当前菜单
    this.inject(this.currentMenus)
  }
}

// 导出单例实例
export const manifestWriter = new SmartAbpManifestWriter()
export const menuAggregator = new SmartAbpMenuAggregator()
export const runtimeMenuInjector = new SmartAbpRuntimeMenuInjector()
