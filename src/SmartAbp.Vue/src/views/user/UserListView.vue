<!--
AI_GENERATED_COMPONENT: true
Generated at: 2025-09-19T02:08:16.759Z
Template parameters: {"EntityName":"User","entityName":"user","ModuleName":"User","entityDisplayName":"用户管理","kebab-case-name":"user"}
Based on SmartAbp template library
DO NOT EDIT MANUALLY - Regenerate using module wizard
-->

<!-- 
AI_TEMPLATE_INFO:
模板类型: Vue CRUD管理组件
适用场景: 标准的数据管理页面，包含列表、搜索、新增、编辑、删除功能
依赖组件: Element Plus (el-table, el-dialog, el-form等)
权限控制: 基于v-permission指令
生成规则:
  - User: 实体名称（PascalCase）
  - user: 实体名称（camelCase）
  - 用户管理: 实体显示名称
  - User: 模块名称
  - user: 短横线命名
-->

<template>
  <div class="entity-management">
    <!-- 若存在运行时UI配置，则优先使用元数据驱动渲染器 -->
    <MetadataDrivenPageRenderer v-if="schema" :schema="schema" />
    <template v-else>
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">
        <h2>用户管理管理</h2>
        <p class="page-description">管理系统中的用户管理信息</p>
      </div>
      <div class="page-actions">
        <el-button
          v-permission="'User.Create'"
          type="primary"
          :icon="Plus"
          @click="handleCreate"
        >
          新增用户管理
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        :inline="true"
        class="search-form"
      >
        <el-form-item label="名称" prop="filter">
          <el-input
            v-model="searchForm.filter"
            placeholder="请输入用户管理名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="isEnabled">
          <el-select
            v-model="searchForm.isEnabled"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <!-- 表格工具栏 -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button
            v-permission="'User.Delete'"
            type="danger"
            :icon="Delete"
            :disabled="!selectedRows.length"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedRows.length }})
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-tooltip content="刷新数据">
            <el-button :icon="Refresh" circle @click="fetchData" />
          </el-tooltip>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="50" />
        
        <el-table-column
          prop="name"
          label="名称"
          sortable="custom"
          min-width="150"
        >
          <template #default="{ row }">
            <div class="name-cell">
              <span class="name-text">{{ row.name }}</span>
              <el-tag v-if="!row.isEnabled" type="info" size="small">
                已禁用
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          prop="displayName"
          label="显示名称"
          min-width="150"
          show-overflow-tooltip
        />

        <el-table-column
          prop="description"
          label="描述"
          min-width="200"
          show-overflow-tooltip
        />

        <el-table-column
          prop="sort"
          label="排序"
          width="80"
          sortable="custom"
        />

        <el-table-column
          prop="creationTime"
          label="创建时间"
          width="160"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.creationTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-permission="'User.Edit'"
                type="primary"
                size="small"
                text
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="'User.Delete'"
                type="danger"
                size="small"
                text
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="edit-form"
      >
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入用户管理名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="显示名称" prop="displayName">
          <el-input
            v-model="formData.displayName"
            placeholder="请输入显示名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="排序号" prop="sort">
          <el-input-number
            v-model="formData.sort"
            :min="0"
            :max="999999"
            controls-position="right"
            style="width: 150px"
          />
        </el-form-item>

        <el-form-item label="状态" prop="isEnabled">
          <el-switch
            v-model="formData.isEnabled"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
// 模板占位符说明：
// User - 实体名称（PascalCase）
// user - 实体名称（camelCase）
// 用户管理 - 实体显示名称

import { ref, reactive, onMounted, computed } from "vue"
import MetadataDrivenPageRenderer from "@smartabp/lowcode-designer/runtime/MetadataDrivenPageRenderer.vue"
import { uiConfigToPageSchema } from "@smartabp/lowcode-designer/utils/uiConfigMapper"
import { codeGeneratorApi } from "@smartabp/lowcode-api"
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Delete } from '@element-plus/icons-vue'

// 导入说明：以下导入需要根据实际项目结构调整
// import { useUserStore } from '@/stores/modules/user'
// import { formatDateTime } from '@/utils/date'
// import type { UserDto, CreateUserDto, UpdateUserDto } from '@/types/user'

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const selectedRows = ref<any[]>([])

// 元数据驱动页面 Schema（若有 UI 配置，则优先使用该渲染路径）
const schema = ref<any | null>(null)

// 表单引用
const searchFormRef = ref()
const formRef = ref()
const tableRef = ref()

// 搜索表单
const searchForm = reactive({
  filter: '',
  isEnabled: undefined as boolean | undefined
})

// 分页数据
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 排序数据
const sorting = ref('')

// 表格数据
const tableData = ref<any[]>([])

// 对话框数据
const dialogTitle = computed(() => 
  formData.id ? '编辑用户管理' : '新增用户管理'
)

const formData = reactive({
  id: undefined,
  name: '',
  displayName: '',
  description: '',
  sort: 0,
  isEnabled: true
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入用户管理名称', trigger: 'blur' },
    { min: 2, max: 50, message: '名称长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// 方法实现
const fetchData = async () => {
  try {
    loading.value = true
    
    const params = {
      filter: searchForm.filter || undefined,
      isEnabled: searchForm.isEnabled,
      skipCount: (pagination.current - 1) * pagination.pageSize,
      maxResultCount: pagination.pageSize,
      sorting: sorting.value || undefined
    }
    // 避免TS未使用变量错误
    void params

    // TODO: 调用实际的API服务
    // const result = await userStore.fetchList(params)
    // tableData.value = result.items
    // pagination.total = result.totalCount
    
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  searchForm.filter = ''
  searchForm.isEnabled = undefined
  handleSearch()
}

const handleCreate = () => {
  Object.assign(formData, {
    id: undefined,
    name: '',
    displayName: '',
    description: '',
    sort: 0,
    isEnabled: true
  })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  Object.assign(formData, row)
  dialogVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${row.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用删除API
    // await userStore.delete(row.id)
    
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    // 用户取消删除
  }
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 项吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = selectedRows.value.map(row => row.id)
    // 避免TS未使用变量错误
    void ids
    
    // TODO: 调用批量删除API
    // await userStore.deleteMany(ids)
    
    ElMessage.success('批量删除成功')
    fetchData()
  } catch (error) {
    // 用户取消删除
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    
    submitting.value = true
    
    if (formData.id) {
      // TODO: 更新操作
      // await userStore.update(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      // TODO: 创建操作
      // await userStore.create(formData)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
}

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

const handleSortChange = ({ prop, order }: any) => {
  if (order) {
    sorting.value = `${prop} ${order === 'ascending' ? 'asc' : 'desc'}`
  } else {
    sorting.value = ''
  }
  fetchData()
}

const handlePageSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  fetchData()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  fetchData()
}

// 工具函数占位符
const formatDateTime = (date: string) => {
  // TODO: 实现日期格式化
  return date
}

// 生命周期
onMounted(async () => {
  try {
    // 优先从本地 appshell/ui-config 目录加载（构建产物 / HMR 兼容）
    const modules = import.meta.glob("@/appshell/ui-config/*.ui.json", { eager: true }) as Record<string, any>
    const expectedKey = "/src/appshell/ui-config/User.User.ui.json"
    const mod = modules[expectedKey]
    let cfg: any | undefined = mod?.default ?? mod

    // 若本地未命中，则回退到后端接口加载（保证运行时可定制）
    if (!cfg) {
      cfg = await codeGeneratorApi.getUiConfig("User", "User")
    }

    if (cfg) {
      schema.value = uiConfigToPageSchema("User", cfg)
    }
  } catch (_) {
    // 忽略错误，走静态模板渲染
  } finally {
    // 无论是否存在UI配置，均进行一次数据加载（静态模板所需）
    fetchData()
  }
})
</script>

<style scoped>
.entity-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.page-title h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.page-description {
  margin: 0;
  color: var(--el-text-color-regular);
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.table-card {
  margin-bottom: 20px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.edit-form {
  padding: 0 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>