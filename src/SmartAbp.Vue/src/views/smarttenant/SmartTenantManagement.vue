<!--
🔥 租户管理管理组件 - 自动生成
生成时间: 2025-10-25 16:49:42
模块: 租户管理 (SmartTenant)
实体: 租户管理 (SmartTenant)

🎨 UI订制特性:
- 主题支持: ✅
- 响应式布局: ✅
- 高级搜索: ✅
- 批量操作: ✅
- 导入导出: ✅

🔧 业务逻辑扩展点:
- beforeLoad: 数据加载前钩子
- afterLoad: 数据加载后钩子
- beforeSave: 数据保存前钩子
- afterSave: 数据保存后钩子
- customValidation: 自定义验证逻辑
- customActions: 自定义操作按钮
-->
<!-- @vue-skip -->

<template>
  <div class="smarttenant-management" :class="customClasses">
    <!-- 🔧 扩展点1：自定义页面头部 -->
    <slot name="page-header">
      <div class="page-header">
        <h2 class="page-title">{{ pageTitle || '租户管理管理' }}</h2>
        <p class="page-description">{{ pageDescription }}</p>
      </div>
    </slot>

    <!-- 🔍 高级搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        :inline="!isMobile"
        class="search-form"
        @submit.prevent="onSearch"
      >
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="Code">
              <el-input
                v-model="searchForm.code"
                placeholder="请输入Code"
                clearable
                @keyup.enter="onSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="Description">
              <el-input
                v-model="searchForm.description"
                placeholder="请输入Description"
                clearable
                @keyup.enter="onSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="StartTime">
              <el-date-picker
                v-model="searchForm.startTimeRange"
                type="daterange"
                placeholder="选择StartTime范围"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="MaxUserCount">
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item>
              <el-button type="primary" @click="onSearch" :loading="loading">
                <el-icon><Search /></el-icon> 搜索
              </el-button>
              <el-button @click="onResetSearch">
                <el-icon><Refresh /></el-icon> 重置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 📊 数据表格区域 -->
    <el-card class="table-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button
            v-if="hasPermission('SmartAbp.SmartTenant.Create')"
            type="primary"
            @click="onAdd"
          >
            <el-icon><Plus /></el-icon> 新增租户管理
          </el-button>
          <el-button
            v-if="hasPermission('SmartAbp.SmartTenant.Delete')"
            type="danger"
            :disabled="selectedRows.length === 0"
            @click="onBatchDelete"
          >
            <el-icon><Delete /></el-icon> 批量删除
          </el-button>
          <el-button @click="onExport" :loading="exporting">
            <el-icon><Download /></el-icon> 导出
          </el-button>
          <el-upload
            :show-file-list="false"
            :before-upload="onImport"
            accept=".xlsx,.xls,.csv"
          >
            <el-button>
              <el-icon><Upload /></el-icon> 导入
            </el-button>
          </el-upload>
        </div>

        <!-- 🔧 扩展点3：自定义工具栏按钮 -->
        <div class="toolbar-right">
          <slot name="toolbar-actions" :selected-rows="selectedRows">
            <!-- 可在此添加自定义操作按钮 -->
          </slot>
        </div>
      </div>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        style="width: 100%"
        @selection-change="onSelectionChange"
        @sort-change="onSortChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          prop="id"
          label="Id"
          width="120"
          sortable="custom"
          show-overflow-tooltip
        />
        <el-table-column
          prop="tenantId"
          label="TenantId"
          width="120"
          sortable="custom"
          show-overflow-tooltip
        />
        <el-table-column
          prop="code"
          label="Code"
          width="150"
          sortable="custom"
          show-overflow-tooltip
        />
        <el-table-column
          prop="parentId"
          label="ParentId"
          width="120"
          sortable="custom"
          show-overflow-tooltip
        />
        <el-table-column
          prop="isActive"
          label="IsActive"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="Description"
          width="200"
          sortable="custom"
          show-overflow-tooltip
        />
        <!-- 🔧 扩展点4：自定义表格列 -->
        <slot name="table-columns" :data="tableData">
          <!-- 可在此添加自定义列 -->
        </slot>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-if="hasPermission('SmartAbp.SmartTenant.Edit')"
                link
                type="primary"
                size="small"
                @click="onEdit(row)"
              >
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button
                v-if="hasPermission('SmartAbp.SmartTenant.Delete')"
                link
                type="danger"
                size="small"
                @click="onDelete(row)"
              >
                <el-icon><Delete /></el-icon> 删除
              </el-button>
              <!-- 🔧 扩展点5：自定义操作按钮 -->
              <slot name="row-actions" :row="row">
                <!-- 可在此添加自定义行操作 -->
              </slot>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 📄 分页组件 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.pageIndex"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          :small="isMobile"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="onPageSizeChange"
          @current-change="onPageIndexChange"
        />
      </div>
    </el-card>

    <!-- 📝 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editMode === 'add' ? `新增${entityDisplayName}` : `编辑${entityDisplayName}`"
      width="600px"
      :close-on-click-modal="false"
      @close="onDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="formRules"
        label-width="120px"
        @submit.prevent="onSave"
      >
        <!-- 🔧 扩展点6：自定义表单前置内容 -->
        <slot name="form-prepend" :form="editForm" :mode="editMode">
          <!-- 可在此添加表单前置内容 -->
        </slot>
        <el-form-item label="TenantId" prop="tenantId">
          <el-input
            v-model="editForm.tenantId"
            placeholder="请输入TenantId"
          />
        </el-form-item>
        <el-form-item label="Code" prop="code">
          <el-input
            v-model="editForm.code"
            placeholder="请输入Code"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="ParentId" prop="parentId">
          <el-input
            v-model="editForm.parentId"
            placeholder="请输入ParentId"
          />
        </el-form-item>
        <el-form-item label="IsActive" prop="isActive">
          <el-switch
            v-model="editForm.isActive"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入Description"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="SubscriptionPlanId" prop="subscriptionPlanId">
          <el-input
            v-model="editForm.subscriptionPlanId"
            placeholder="请输入SubscriptionPlanId"
          />
        </el-form-item>
        <el-form-item label="StartTime" prop="startTime">
          <el-date-picker
            v-model="editForm.startTime"
            type="datetime"
            placeholder="选择StartTime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="MaxUserCount" prop="maxUserCount">
          <el-input-number
            v-model="editForm.maxUserCount"
            placeholder="请输入MaxUserCount"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="MaxStorageSize" prop="maxStorageSize">
          <el-input-number
            v-model="editForm.maxStorageSize"
            placeholder="请输入MaxStorageSize"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="MaxApiCallsPerDay" prop="maxApiCallsPerDay">
          <el-input-number
            v-model="editForm.maxApiCallsPerDay"
            placeholder="请输入MaxApiCallsPerDay"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="ConnectionString" prop="connectionString">
          <el-input
            v-model="editForm.connectionString"
            type="textarea"
            :rows="4"
            placeholder="请输入ConnectionString"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="IsIsolatedDatabase" prop="isIsolatedDatabase">
          <el-switch
            v-model="editForm.isIsolatedDatabase"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        <el-form-item label="FeatureConfig" prop="featureConfig">
          <el-input
            v-model="editForm.featureConfig"
            placeholder="请输入FeatureConfig"
            maxlength="-1"
          />
        </el-form-item>
        <el-form-item label="CustomSettings" prop="customSettings">
          <el-input
            v-model="editForm.customSettings"
            placeholder="请输入CustomSettings"
            maxlength="-1"
          />
        </el-form-item>
        <el-form-item label="ExtraProperties" prop="extraProperties">
          <el-input
            v-model="editForm.extraProperties"
            placeholder="请输入ExtraProperties"
            maxlength="-1"
          />
        </el-form-item>
        <el-form-item label="ConcurrencyStamp" prop="concurrencyStamp">
          <el-input
            v-model="editForm.concurrencyStamp"
            placeholder="请输入ConcurrencyStamp"
            maxlength="40"
          />
        </el-form-item>
        <el-form-item label="CreationTime" prop="creationTime">
          <el-date-picker
            v-model="editForm.creationTime"
            type="datetime"
            placeholder="选择CreationTime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="CreatorId" prop="creatorId">
          <el-input
            v-model="editForm.creatorId"
            placeholder="请输入CreatorId"
          />
        </el-form-item>
        <el-form-item label="LastModificationTime" prop="lastModificationTime">
          <el-date-picker
            v-model="editForm.lastModificationTime"
            type="datetime"
            placeholder="选择LastModificationTime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="IsDeleted" prop="isDeleted">
          <el-switch
            v-model="editForm.isDeleted"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        <el-form-item label="DeletionTime" prop="deletionTime">
          <el-date-picker
            v-model="editForm.deletionTime"
            type="datetime"
            placeholder="选择DeletionTime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <!-- 🔧 扩展点7：自定义表单后置内容 -->
        <slot name="form-append" :form="editForm" :mode="editMode">
          <!-- 可在此添加表单后置内容 -->
        </slot>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onSave" :loading="saving">
            {{ editMode === 'add' ? '创建' : '更新' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 🔧 扩展点2：自定义底部内容 -->
    <slot name="page-footer">
      <!-- 可在此添加统计信息、快捷操作等 -->
    </slot>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
// Vue 3 Composition API
import { onMounted, reactive, readonly, ref } from 'vue'
// Element Plus组件和图标
import { Delete, Download, Edit, Plus, Refresh, Search, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
// Vue Router
import { useRoute, useRouter } from 'vue-router'
// 状态管理
import { useSmartTenantStore } from '@/stores/modules/smarttenant/smarttenant'
// 权限指令
import { usePermission } from '@/composables/usePermission'
// 响应式设计
import { useBreakpoints } from '@/composables/useBreakpoints'
// 主题定制
import { useTheme } from '@/composables/useTheme'

// 🔧 类型定义
interface SmartTenantFormData {
  id?: string
  tenantId?: string
  code?: string
  parentId?: string
  isActive?: boolean
  description?: string
  subscriptionPlanId?: string
  startTime?: Date | string
  maxUserCount?: number
  maxStorageSize?: number
  maxApiCallsPerDay?: number
  connectionString?: string
  isIsolatedDatabase?: boolean
  featureConfig?: string
  customSettings?: string
  extraProperties?: string
  concurrencyStamp?: string
  creationTime?: Date | string
  creatorId?: string
  lastModificationTime?: Date | string
  isDeleted?: boolean
  deletionTime?: Date | string
}

// 🔧 扩展点8：自定义组合式函数和状态
// 可在此区域添加自定义的组合式函数

// 基础组合式函数
const route = useRoute()
const router = useRouter()
const smartTenantStore = useSmartTenantStore()
const { hasPermission } = usePermission()
const { isMobile, isTablet } = useBreakpoints()
const { currentTheme, setThemeVariable } = useTheme()

// 🎨 UI状态管理
const loading = ref(false)
const saving = ref(false)
const exporting = ref(false)
const editDialogVisible = ref(false)
const editMode = ref<'add' | 'edit'>('add')

// 📊 数据状态
const tableData = ref<any[]>([])
const selectedRows = ref<any[]>([])
const editForm = reactive<any>({})

// 🔍 搜索状态
const searchForm = reactive({
  code: '',
  description: '',
  startTimeRange: null as [string, string] | null,
  maxUserCount: '',
})

// 📄 分页状态
const pagination = reactive({
  pageIndex: 1,
  pageSize: 20,
  total: 0
})

// 🔧 业务逻辑扩展点定义
const businessLogicHooks = {
  // 🎯 扩展点9：数据加载前钩子
  beforeLoad: async (params: any) => {
    // 可在此添加数据加载前的自定义逻辑
    // 例如：参数转换、权限检查、缓存处理等
    console.log('beforeLoad hook:', params)
    return params
  },

  // 🎯 扩展点10：数据加载后钩子
  afterLoad: async (data: any) => {
    // 可在此添加数据加载后的自定义逻辑
    // 例如：数据转换、状态更新、UI刷新等
    console.log('afterLoad hook:', data)
    return data
  },

  // 🎯 扩展点11：数据保存前钩子
  beforeSave: async (formData: any, mode: 'add' | 'edit') => {
    // 可在此添加数据保存前的自定义逻辑
    // 例如：数据验证、格式转换、业务规则检查等
    console.log('beforeSave hook:', { formData, mode })
    return formData
  },

  // 🎯 扩展点12：数据保存后钩子
  afterSave: async (result: any, mode: 'add' | 'edit') => {
    // 可在此添加数据保存后的自定义逻辑
    // 例如：消息通知、页面跳转、缓存更新等
    console.log('afterSave hook:', { result, mode })
    return result
  },

  // 🎯 扩展点13：自定义验证逻辑
  customValidation: async (formData: any) => {
    // 可在此添加自定义验证逻辑
    // 返回 { valid: boolean, message?: string }
    console.log('customValidation hook:', formData)
    return { valid: true }
  }
}

// 🔧 核心业务方法（集成扩展点）
const loadData = async (params?: any) => {
  try {
    loading.value = true

    // 🎯 调用扩展点：数据加载前钩子
    const processedParams = await businessLogicHooks.beforeLoad(params || {})

    // ✅ 调用实际的API服务
    const result = await smartTenantStore.fetchList(processedParams)

    // 🎯 调用扩展点：数据加载后钩子
    const processedData = await businessLogicHooks.afterLoad(result)

    tableData.value = processedData.items
    pagination.total = processedData.total
  } catch (error) {
    console.error('数据加载失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

const saveData = async () => {
  try {
    saving.value = true

    // 🎯 调用扩展点：自定义验证逻辑
    const validationResult = await businessLogicHooks.customValidation(editForm)
    if (!validationResult.valid) {
      ElMessage.error(validationResult.message || '数据验证失败')
      return
    }

    // 🎯 调用扩展点：数据保存前钩子
    const processedData = await businessLogicHooks.beforeSave(editForm, editMode.value)

    // ✅ 调用实际的API服务
    if (editMode.value === 'add') {
      await smartTenantStore.create(processedData)
    } else {
      await smartTenantStore.update(processedData.id, processedData)
    }

    // 🎯 调用扩展点：数据保存后钩子
    await businessLogicHooks.afterSave(processedData, editMode.value)

    ElMessage.success(editMode.value === 'add' ? '创建成功' : '更新成功')
    editDialogVisible.value = false
    await loadData()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 🎯 扩展点14：暴露给父组件的API
defineExpose({
  // 🔧 公共方法，供父组件调用
  loadData,
  saveData,
  resetForm: () => Object.assign(editForm, {}),
  getSelectedRows: () => selectedRows.value,
  // 🎯 业务逻辑钩子，供父组件自定义
  businessLogicHooks,
  // 🎨 UI状态，供父组件控制
  uiState: {
    loading: readonly(loading),
    editMode: readonly(editMode),
    editDialogVisible
  }
})

// 🚀 组件生命周期
onMounted(async () => {
  await loadData()
})
</script>

<style scoped>
/* 🎨 企业级样式定制 - 支持主题变量和响应式设计 */

.smarttenant-management {
  padding: var(--spacing-6);
  background: var(--color-bg-container);
  border-radius: var(--border-radius-lg);
  min-height: calc(100vh - 120px);
}

.page-header {
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--color-border-secondary);
}

.page-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--theme-text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.page-description {
  color: var(--color-text-secondary);
  margin: 0;
}

/* 🎯 扩展点15：自定义样式变量 */
/* 可通过CSS变量进行主题定制 */
.smarttenant-management {
  --smarttenant-primary-color: var(--color-primary);
  --smarttenant-success-color: var(--color-success);
  --smarttenant-warning-color: var(--color-warning);
  --smarttenant-danger-color: var(--color-danger);
  --smarttenant-card-shadow: var(--shadow-sm);
}

/* 📱 响应式设计 */
@media (max-width: 768px) {
  .smarttenant-management {
    padding: var(--spacing-4);
  }

  .table-toolbar {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: stretch;
  }

  .action-buttons {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .pagination-wrapper {
    overflow-x: auto;
  }
}

</style>
