<template>
  <div class="page-renderer">
    <!-- 页面头部 -->
    <div v-if="schema?.title || schema?.description" class="page-header">
      <h2 v-if="schema.title" class="page-title">{{ schema.title }}</h2>
      <p v-if="schema.description" class="page-description">{{ schema.description }}</p>
    </div>

    <!-- 搜索栏 -->
    <div v-if="schema?.searchable" class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索..."
        :prefix-icon="SearchIcon"
        clearable
        @input="handleSearch"
      />
      <el-button v-if="schema?.advancedSearch" type="primary" @click="showAdvancedSearch = true">
        高级搜索
      </el-button>
    </div>

    <!-- 筛选器 -->
    <div v-if="schema?.filters?.length" class="filters">
      <template v-for="(filter, index) in schema.filters" :key="index">
        <el-select
          v-if="filter.type === 'select'"
          v-model="filterValues[filter.key]"
          :placeholder="filter.placeholder"
          clearable
          @change="handleFilter"
        >
          <el-option
            v-for="option in filter.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <el-date-picker
          v-else-if="filter.type === 'date'"
          v-model="filterValues[filter.key]"
          type="daterange"
          :placeholder="filter.placeholder"
          @change="handleFilter"
        />

        <el-input
          v-else
          v-model="filterValues[filter.key]"
          :placeholder="filter.placeholder"
          clearable
          @input="handleFilter"
        />
      </template>
    </div>

    <!-- 操作按钮 -->
    <div class="actions" v-if="schema?.actions?.length">
      <el-button
        v-for="(action, index) in schema.actions"
        :key="index"
        :type="(action.type || 'default') as 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'"
        :size="(action.size || 'small') as 'large' | 'default' | 'small'"
        :icon="action.icon"
        :disabled="action.disabled"
        @click="() => emitAction(action)"
      >
        {{ action.label }}
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-if="schema?.columns?.length"
      :data="filteredRows"
      stripe
      :loading="loading"
      :height="schema?.tableHeight || 'auto'"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <!-- 选择列 -->
      <el-table-column
        v-if="schema?.selectable"
        type="selection"
        width="55"
      />

      <!-- 序号列 -->
      <el-table-column
        v-if="schema?.showIndex"
        type="index"
        label="序号"
        width="60"
      />

      <!-- 数据列 -->
      <el-table-column
        v-for="(col, idx) in schema.columns"
        :key="idx"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :sortable="col.sortable"
        :formatter="col.formatter ? (row: any) => formatCellValue(row, col) : undefined"
      >
        <template #default="{ row }" v-if="col.type">
          <!-- 标签类型 -->
          <el-tag
            v-if="col.type === 'tag'"
            :type="getTagType(row[col.prop], col) as 'primary' | 'success' | 'warning' | 'info' | 'danger'"
          >
            {{ row[col.prop] }}
          </el-tag>

          <!-- 开关类型 -->
          <el-switch
            v-else-if="col.type === 'switch'"
            v-model="row[col.prop]"
            @change="(val: string | number | boolean) => handleCellChange(row, col.prop, val)"
          />

          <!-- 链接类型 -->
          <el-link
            v-else-if="col.type === 'link'"
            :href="row[col.prop]"
            target="_blank"
          >
            {{ row[col.prop] }}
          </el-link>

          <!-- 图片类型 -->
          <el-image
            v-else-if="col.type === 'image'"
            :src="row[col.prop]"
            :preview-src-list="[row[col.prop]]"
            style="width: 50px; height: 50px"
            fit="cover"
          />

          <!-- 默认文本 -->
          <span v-else>{{ row[col.prop] }}</span>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column
        v-if="schema?.rowActions?.length"
        label="操作"
        :width="schema.actionColumnWidth || 200"
      >
        <template #default="{ row }">
          <el-button
            v-for="(action, index) in schema.rowActions"
            :key="index"
            :type="(action.type || 'text') as 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'"
            :size="(action.size || 'small') as 'large' | 'default' | 'small'"
            :icon="action.icon"
            @click="() => emitRowAction(action, row)"
          >
            {{ action.label }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="schema?.pagination"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="totalCount"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handlePageSizeChange"
      @current-change="handleCurrentPageChange"
    />

    <!-- 表单渲染 -->
    <el-form
      v-if="schema?.formFields?.length"
      :model="formData"
      :label-width="schema?.labelWidth || '120px'"
      :label-position="schema?.labelPosition || 'right'"
    >
      <el-form-item
        v-for="(field, index) in schema.formFields"
        :key="index"
        :label="field.label"
        :required="field.required"
        :rules="field.rules"
      >
        <component
          :is="getFormComponent(field.type)"
          v-model="formData[field.key]"
          v-bind="field.props"
          :placeholder="field.placeholder"
          @change="(val: any) => handleFormChange(field.key, val)"
        >
          <!-- 选项渲染 -->
          <template v-if="field.options">
            <el-option
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </template>
        </component>
      </el-form-item>
    </el-form>

    <!-- 底部操作 -->
    <div class="footer-actions" v-if="schema?.footerActions?.length">
      <el-button
        v-for="(action, index) in schema.footerActions"
        :key="index"
        :type="(action.type || 'default') as 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'"
        :icon="action.icon"
        @click="() => emitAction(action)"
      >
        {{ action.label }}
      </el-button>
    </div>

    <!-- 高级搜索对话框 -->
    <el-dialog
      v-model="showAdvancedSearch"
      title="高级搜索"
      width="600px"
    >
      <!-- 高级搜索表单 -->
      <el-form :model="advancedSearchForm" label-width="100px">
        <el-form-item
          v-for="(field, index) in schema?.advancedSearchFields"
          :key="index"
          :label="field.label"
        >
          <component
            :is="getFormComponent(field.type)"
            v-model="advancedSearchForm[field.key]"
            v-bind="field.props"
            :placeholder="field.placeholder"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAdvancedSearch = false">取消</el-button>
        <el-button @click="resetAdvancedSearch">重置</el-button>
        <el-button type="primary" @click="handleAdvancedSearch">搜索</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { Search as SearchIcon } from "@element-plus/icons-vue"

// 🚀 企业级元数据驱动页面渲染器 - 支持复杂组件
interface ActionDef {
  label: string
  type?: string
  size?: string
  key?: string
  icon?: any
  disabled?: boolean
}

interface FilterDef {
  key: string
  type: 'select' | 'date' | 'input'
  placeholder?: string
  options?: Array<{ label: string; value: any }>
}

interface ColumnDef {
  prop: string
  label: string
  width?: number
  sortable?: boolean
  type?: 'tag' | 'switch' | 'link' | 'image' | 'text'
  formatter?: (row: any, column: any, cellValue: any) => string
  tagTypes?: Record<string, string>
}

interface FormFieldDef {
  key: string
  label: string
  type: 'input' | 'select' | 'textarea' | 'number' | 'switch' | 'date'
  required?: boolean
  placeholder?: string
  rules?: any[]
  options?: Array<{ label: string; value: any }>
  props?: Record<string, any>
}

interface PageSchema {
  // 页面基本信息
  title?: string
  description?: string

  // 搜索功能
  searchable?: boolean
  advancedSearch?: boolean
  advancedSearchFields?: FormFieldDef[]

  // 筛选器
  filters?: FilterDef[]

  // 操作按钮
  actions?: ActionDef[]
  footerActions?: ActionDef[]
  rowActions?: ActionDef[]
  actionColumnWidth?: number

  // 表格配置
  columns?: ColumnDef[]
  selectable?: boolean
  showIndex?: boolean
  tableHeight?: string | number
  pagination?: boolean

  // 表单配置
  formFields?: FormFieldDef[]
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
}

const props = defineProps<{ schema?: PageSchema }>()
const emit = defineEmits<{
  action: [action: ActionDef, data?: any]
  rowAction: [action: ActionDef, row: any]
  search: [keyword: string]
  filter: [filters: Record<string, any>]
  pageChange: [page: number, size: number]
  selectionChange: [selection: any[]]
  cellChange: [row: any, prop: string, value: any]
  formChange: [key: string, value: any]
}>()

// 数据状态
const rows = ref<any[]>([])
const filteredRows = computed(() => {
  let result = rows.value

  // 应用搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(keyword)
      )
    )
  }

  // 应用筛选
  Object.entries(filterValues.value).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      result = result.filter(row => {
        if (Array.isArray(value)) {
          // 日期范围筛选
          const [start, end] = value
          const rowValue = new Date(row[key])
          return rowValue >= start && rowValue <= end
        }
        return row[key] === value
      })
    }
  })

  return result
})

const loading = ref(false)

// 搜索状态
const searchKeyword = ref('')
const showAdvancedSearch = ref(false)
const advancedSearchForm = ref<Record<string, any>>({})

// 筛选状态
const filterValues = ref<Record<string, any>>({})

// 分页状态
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)

// 表单状态
const formData = ref<Record<string, any>>({})

// 选择状态
const selectedRows = ref<any[]>([])

// 事件处理函数
function emitAction(action: ActionDef) {
  emit('action', action, {
    selectedRows: selectedRows.value,
    formData: formData.value,
    filters: filterValues.value,
    search: searchKeyword.value
  })
}

function emitRowAction(action: ActionDef, row: any) {
  emit('rowAction', action, row)
}

function handleSearch() {
  emit('search', searchKeyword.value)
}

function handleFilter() {
  emit('filter', filterValues.value)
}

function handleAdvancedSearch() {
  Object.assign(filterValues.value, advancedSearchForm.value)
  showAdvancedSearch.value = false
  handleFilter()
}

function resetAdvancedSearch() {
  advancedSearchForm.value = {}
}

function handleSelectionChange(selection: any[]) {
  selectedRows.value = selection
  emit('selectionChange', selection)
}

function handleSortChange(sort: { prop: string; order: string }) {
  // 排序逻辑
  console.log('Sort change:', sort)
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  emit('pageChange', currentPage.value, size)
}

function handleCurrentPageChange(page: number) {
  currentPage.value = page
  emit('pageChange', page, pageSize.value)
}

function handleCellChange(row: any, prop: string, value: any) {
  row[prop] = value
  emit('cellChange', row, prop, value)
}

function handleFormChange(key: string, value: any) {
  formData.value[key] = value
  emit('formChange', key, value)
}

// 工具函数
function formatCellValue(row: any, col: ColumnDef): string {
  if (col.formatter) {
    return col.formatter(row, col, row[col.prop])
  }
  return String(row[col.prop] || '')
}

function getTagType(value: any, col: ColumnDef): string {
  if (col.tagTypes && col.tagTypes[value]) {
    return col.tagTypes[value]
  }
  return 'info'
}

function getFormComponent(type: string): string {
  const componentMap: Record<string, string> = {
    'input': 'el-input',
    'select': 'el-select',
    'textarea': 'el-input',
    'number': 'el-input-number',
    'switch': 'el-switch',
    'date': 'el-date-picker'
  }
  return componentMap[type] || 'el-input'
}

// 生命周期
onMounted(() => {
  // 初始化表单数据
  if (props.schema?.formFields) {
    const initialFormData: Record<string, any> = {}
    props.schema.formFields.forEach(field => {
      initialFormData[field.key] = null
    })
    formData.value = initialFormData
  }

  // 初始化筛选值
  if (props.schema?.filters) {
    const initialFilters: Record<string, any> = {}
    props.schema.filters.forEach(filter => {
      initialFilters[filter.key] = null
    })
    filterValues.value = initialFilters
  }

  // 模拟数据加载
  rows.value = []
  totalCount.value = 0
})
</script>

<style scoped>
/* 🚀 企业级元数据驱动页面渲染器样式 */
.page-renderer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: var(--el-bg-color, #ffffff);
  border-radius: 8px;
}

/* 页面头部 */
.page-header {
  margin-bottom: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
  margin: 0 0 8px 0;
}

.page-description {
  color: var(--el-text-color-secondary, #909399);
  margin: 0;
  line-height: 1.5;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  background: var(--el-fill-color-lighter, #fafcff);
  border-radius: 6px;
}

.search-bar .el-input {
  flex: 1;
  max-width: 400px;
}

/* 筛选器 */
.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px;
  background: var(--el-fill-color-lighter, #fafcff);
  border-radius: 6px;
}

.filters > * {
  min-width: 200px;
}

/* 操作按钮 */
.actions,
.footer-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.actions {
  padding: 8px 0;
}

.footer-actions {
  padding: 16px 0 0 0;
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
  margin-top: 16px;
}

/* 表格样式增强 */
.page-renderer :deep(.el-table) {
  border-radius: 6px;
  overflow: hidden;
}

.page-renderer :deep(.el-table__header) {
  background: var(--el-fill-color-light, #f5f7fa);
}

.page-renderer :deep(.el-table__row:hover) {
  background: var(--el-fill-color-lighter, #fafcff);
}

/* 分页样式 */
.page-renderer :deep(.el-pagination) {
  justify-content: center;
  padding: 16px 0;
}

/* 表单样式增强 */
.page-renderer :deep(.el-form) {
  max-width: 800px;
  margin: 0 auto;
}

.page-renderer :deep(.el-form-item) {
  margin-bottom: 20px;
}

/* 对话框样式 */
.page-renderer :deep(.el-dialog__body) {
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-renderer {
    padding: 12px;
    gap: 12px;
  }

  .search-bar,
  .filters {
    padding: 12px;
  }

  .filters {
    flex-direction: column;
  }

  .filters > * {
    min-width: auto;
    width: 100%;
  }

  .actions,
  .footer-actions {
    justify-content: center;
  }
}

/* 加载状态 */
.page-renderer :deep(.el-loading-mask) {
  border-radius: 6px;
}

/* 空状态样式 */
.page-renderer :deep(.el-table__empty-block) {
  padding: 40px 0;
}

.page-renderer :deep(.el-table__empty-text) {
  color: var(--el-text-color-secondary, #909399);
}
</style>
