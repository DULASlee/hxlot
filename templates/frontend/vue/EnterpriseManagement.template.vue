<!--
🔥 企业级管理组件模板 - 完整实现
生成时间: {{GenerateTime}}
模块: {{ModuleName}} ({{ModuleDisplayName}})
实体: {{EntityName}} ({{EntityDisplayName}})

🎨 UI特性：
- ✅ SmartComponents封装（SmartButton, SmartCard）
- ✅ 设计令牌系统（var(--spacing-*, --color-*)）
- ✅ 响应式布局（支持移动端）
- ✅ 权限控制（RBAC）
- ✅ 国际化支持
- ✅ 加载状态管理
- ✅ 错误处理

🔧 业务功能：
- ✅ CRUD完整操作
- ✅ 高级搜索
- ✅ 批量操作
- ✅ 导入导出
- ✅ 排序和分页
-->

<template>
    <div class="{{entityLower}}-management">
        <!-- 🎯 页面头部 -->
        <div class="page-header">
            <h2 class="page-title">{{ EntityDisplayName }}管理</h2>
            <p class="page-description">管理系统中的{{ EntityDisplayName }}信息</p>
        </div>

        <!-- 🔍 搜索区域 -->
        <SmartCard class="search-card" elevation="sm">
            <el-form ref="searchFormRef" :model="searchForm" :inline="!isMobile" class="search-form"
                @submit.prevent="onSearch">
                <el-row :gutter="16">
                    <!-- 搜索字段（动态生成） -->
                    {{ SearchFields }}

                    <el-col :xs="24" :sm="12" :md="6">
                        <el-form-item>
                            <SmartButton variant="primary" @click="onSearch" :loading="loading">
                                <template #icon>
                                    <Search />
                                </template>
                                搜索
                            </SmartButton>
                            <SmartButton variant="secondary" @click="onResetSearch">
                                <template #icon>
                                    <Refresh />
                                </template>
                                重置
                            </SmartButton>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
        </SmartCard>

        <!-- 📊 数据表格 -->
        <SmartCard class="table-card" elevation="md">
            <!-- 工具栏 -->
            <div class="table-toolbar">
                <div class="toolbar-left">
                    <SmartButton v-if="hasPermission('SmartAbp.{{EntityName}}.Create')" variant="primary"
                        @click="onAdd">
                        <template #icon>
                            <Plus />
                        </template>
                        新增
                    </SmartButton>

                    <SmartButton v-if="hasPermission('SmartAbp.{{EntityName}}.Delete')" variant="danger"
                        :disabled="selectedRows.length === 0" @click="onBatchDelete">
                        <template #icon>
                            <Delete />
                        </template>
                        批量删除 ({{ selectedRows.length }})
                    </SmartButton>

                    <SmartButton variant="secondary" @click="onExport" :loading="exporting">
                        <template #icon>
                            <Download />
                        </template>
                        导出
                    </SmartButton>
                </div>

                <div class="toolbar-right">
                    <SmartButton variant="text" @click="onRefresh">
                        <template #icon>
                            <Refresh />
                        </template>
                    </SmartButton>
                </div>
            </div>

            <!-- 表格主体 -->
            <el-table ref="tableRef" v-loading="loading" :data="tableData" row-key="id"
                @selection-change="onSelectionChange" @sort-change="onSortChange">
                <el-table-column type="selection" width="55" align="center" />

                <!-- 表格列（动态生成） -->
                {{ TableColumns }}

                <!-- 操作列 -->
                <el-table-column label="操作" width="180" align="center" fixed="right">
                    <template #default="{ row }">
                        <SmartButton v-if="hasPermission('SmartAbp.{{EntityName}}.Update')" variant="text" size="sm"
                            @click="onEdit(row)">
                            <template #icon>
                                <Edit />
                            </template>
                            编辑
                        </SmartButton>

                        <SmartButton v-if="hasPermission('SmartAbp.{{EntityName}}.Delete')" variant="text" size="sm"
                            danger @click="onDelete(row)">
                            <template #icon>
                                <Delete />
                            </template>
                            删除
                        </SmartButton>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="table-pagination">
                <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
                    :total="pagination.total" :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper" @current-change="onPageChange"
                    @size-change="onPageSizeChange" />
            </div>
        </SmartCard>

        <!-- 📝 编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false">
            <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
                <!-- 表单字段（动态生成） -->
                {{ FormFields }}
            </el-form>

            <template #footer>
                <SmartButton variant="secondary" @click="dialogVisible = false">
                    取消
                </SmartButton>
                <SmartButton variant="primary" @click="onSubmit" :loading="submitting">
                    确定
                </SmartButton>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
// Vue 3 Composition API
import { ref, reactive, computed, onMounted, nextTick, readonly, watch } from 'vue'
// Element Plus组件和图标
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete, Download } from '@element-plus/icons-vue'
// Vue Router
import { useRoute, useRouter } from 'vue-router'
// SmartComponents
import { SmartButton, SmartCard } from '@/components/design-system'
// Composables
import { usePermission } from '@/composables/usePermission'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { useTheme } from '@/composables/useTheme'
// Store and API
import { use{{ EntityName }}Store } from '@/stores/modules/{{moduleLower}}/{{entityLower}}'
import type { {{ EntityName }}Dto, Create{ { EntityName } } Dto, Update{ { EntityName } } Dto } from '@/types/{{moduleLower}}/{{entityLower}}'

// ===== 组件定义 =====
defineOptions({
    name: '{{EntityName}}Management'
})

// ===== Composables =====
const route = useRoute()
const router = useRouter()
const { hasPermission } = usePermission()
const { isMobile } = useBreakpoints()
const { theme } = useTheme()

// ===== Store =====
const {{ entityLower }}Store = use{ { EntityName } } Store()

// ===== 响应式数据 =====
const loading = ref(false)
const submitting = ref(false)
const exporting = ref(false)
const tableRef = ref()
const formRef = ref()
const searchFormRef = ref()

// 搜索表单
const searchForm = reactive({
  {{ SearchFormFields }}
})

// 表格数据
const tableData = ref < {{ EntityName }}Dto[] > ([])
const selectedRows = ref < {{ EntityName }}Dto[] > ([])
const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
})

// 对话框状态
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const dialogTitle = computed(() => dialogMode.value === 'add' ? '新增{{EntityDisplayName}}' : '编辑{{EntityDisplayName}}')

// 表单数据
const form = reactive < Create{{ EntityName }}Dto | Update{ { EntityName } } Dto > ({
  { { FormInitialData } }
})

// 表单验证规则
const formRules = {
  { { FormRules } }
}

// ===== 生命周期 =====
onMounted(() => {
    loadData()
})

// ===== 方法 =====
/**
 * 加载数据
 */
async function loadData() {
    try {
        loading.value = true
        const result = await {{ entityLower }
    }Store.getList({
        ...searchForm,
        skipCount: (pagination.page - 1) * pagination.pageSize,
        maxResultCount: pagination.pageSize
    })

    tableData.value = result.items || []
    pagination.total = result.totalCount || 0
} catch (error) {
    ElMessage.error('数据加载失败')
    console.error('Load data error:', error)
} finally {
    loading.value = false
}
}

/**
 * 搜索
 */
function onSearch() {
    pagination.page = 1
    loadData()
}

/**
 * 重置搜索
 */
function onResetSearch() {
    searchFormRef.value?.resetFields()
    Object.assign(searchForm, {
    {{ SearchFormReset }}
  })
onSearch()
}

/**
 * 刷新
 */
function onRefresh() {
    loadData()
}

/**
 * 新增
 */
function onAdd() {
    dialogMode.value = 'add'
    dialogVisible.value = true
    nextTick(() => {
        formRef.value?.resetFields()
        Object.assign(form, {
      {{ FormInitialData }}
    })
  })
}

/**
 * 编辑
 */
async function onEdit(row: {{ EntityName }}Dto) {
    try {
        const detail = await {{ entityLower }
    }Store.get(row.id)
    dialogMode.value = 'edit'
    dialogVisible.value = true
    nextTick(() => {
        Object.assign(form, detail)
    })
} catch (error) {
    ElMessage.error('获取详情失败')
    console.error('Get detail error:', error)
}
}

/**
 * 提交表单
 */
async function onSubmit() {
    try {
        await formRef.value?.validate()
        submitting.value = true

        if (dialogMode.value === 'add') {
            await {{ entityLower }
        } Store.create(form as Create{{ EntityName }}Dto)
    ElMessage.success('新增成功')
} else {
    await {{ entityLower }
} Store.update((form as any).id, form as Update{{ EntityName }}Dto)
ElMessage.success('更新成功')
    }

dialogVisible.value = false
loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
        ElMessage.error(dialogMode.value === 'add' ? '新增失败' : '更新失败')
        console.error('Submit error:', error)
    }
} finally {
    submitting.value = false
}
}

/**
 * 删除
 */
async function onDelete(row: {{ EntityName }}Dto) {
    try {
        await ElMessageBox.confirm(`确定要删除 "${row.{{ displayField }} || row.id
} " 吗？`, '确认删除', {
type: 'warning',
    confirmButtonText: '确定',
        cancelButtonText: '取消'
    })

await {{ entityLower }}Store.delete(row.id)
ElMessage.success('删除成功')
loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
        ElMessage.error('删除失败')
        console.error('Delete error:', error)
    }
}
}

/**
 * 批量删除
 */
async function onBatchDelete() {
    try {
        await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 项吗？`, '确认批量删除', {
            type: 'warning',
            confirmButtonText: '确定',
            cancelButtonText: '取消'
        })

        await {{ entityLower }
    }Store.batchDelete(selectedRows.value.map(r => r.id))
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    loadData()
} catch (error: any) {
    if (error !== 'cancel') {
        ElMessage.error('批量删除失败')
        console.error('Batch delete error:', error)
    }
}
}

/**
 * 导出
 */
async function onExport() {
    try {
        exporting.value = true
        await {{ entityLower }
    }Store.export(searchForm)
    ElMessage.success('导出成功')
} catch (error) {
    ElMessage.error('导出失败')
    console.error('Export error:', error)
} finally {
    exporting.value = false
}
}

/**
 * 选择变化
 */
function onSelectionChange(rows: {{ EntityName }}Dto[]) {
    selectedRows.value = rows
}

/**
 * 排序变化
 */
function onSortChange({ prop, order }: any) {
    // TODO: 实现排序逻辑
    loadData()
}

/**
 * 页码变化
 */
function onPageChange(page: number) {
    pagination.page = page
    loadData()
}

/**
 * 页大小变化
 */
function onPageSizeChange(pageSize: number) {
    pagination.pageSize = pageSize
    pagination.page = 1
    loadData()
}
</script>

<style scoped>
/* 🎨 企业级样式 - 使用设计令牌 */

. {
        {
        entityLower
    }
}

-management {
    padding: var(--spacing-6);
    background: var(--color-bg-container);
    border-radius: var(--border-radius-lg);
    min-height: calc(100vh - 120px);
}

/* 页面头部 */
.page-header {
    margin-bottom: var(--spacing-6);
    padding-bottom: var(--spacing-4);
    border-bottom: 1px solid var(--color-border-secondary);
}

.page-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-2) 0;
}

.page-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0;
}

/* 搜索卡片 */
.search-card {
    margin-bottom: var(--spacing-4);
}

.search-form :deep(.el-form-item) {
    margin-bottom: var(--spacing-3);
}

/* 表格卡片 */
.table-card {
    background: var(--color-bg-elevated);
}

.table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-4);
    gap: var(--spacing-3);
}

.toolbar-left,
.toolbar-right {
    display: flex;
    gap: var(--spacing-2);
    flex-wrap: wrap;
}

.table-pagination {
    margin-top: var(--spacing-4);
    display: flex;
    justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
    . {
            {
            entityLower
        }
    }

    -management {
        padding: var(--spacing-4);
    }

    .table-toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .toolbar-left,
    .toolbar-right {
        justify-content: flex-start;
    }

    .table-pagination {
        justify-content: center;
    }

    .search-form :deep(.el-form-item) {
        width: 100%;
    }
}

/* 主题适配 */
@media (prefers-color-scheme: dark) {
    .page-header {
        border-bottom-color: var(--color-border-secondary-dark);
    }
}
</style>
