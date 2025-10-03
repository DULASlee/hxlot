<template>
  <div class="smart-data-table">
    <el-table
      :data="paginatedData"
      :loading="loading"
      v-bind="$attrs"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column v-if="selectable" type="selection" width="55" />
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :sortable="column.sortable"
        :formatter="column.formatter"
      />
      <el-table-column v-if="hasActions" label="操作" :width="actionWidth">
        <template #default="{ row }">
          <slot name="actions" :row="row">
            <el-button size="small" @click="$emit('edit', row)">编辑</el-button>
            <el-button size="small" type="danger" @click="$emit('delete', row)">删除</el-button>
          </slot>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="pagination"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElTable, ElTableColumn, ElPagination, ElButton } from 'element-plus'

interface Column {
  prop: string
  label: string
  width?: string | number
  sortable?: boolean | string
  formatter?: (row: any, column: any, cellValue: any, index: number) => any
}

interface Props {
  data: any[]
  columns: Column[]
  loading?: boolean
  pagination?: boolean
  selectable?: boolean
  currentPage?: number
  pageSize?: number
  total?: number
  hasActions?: boolean
  actionWidth?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pagination: true,
  selectable: false,
  currentPage: 1,
  pageSize: 20,
  total: 0,
  hasActions: true,
  actionWidth: 150
})

const emit = defineEmits<{
  (e: 'selection-change', selection: any[]): void
  (e: 'sort-change', data: any): void
  (e: 'size-change', size: number): void
  (e: 'current-change', page: number): void
  (e: 'edit', row: any): void
  (e: 'delete', row: any): void
}>()

const paginatedData = computed(() => {
  if (!props.pagination) return props.data
  const start = (props.currentPage - 1) * props.pageSize
  return props.data.slice(start, start + props.pageSize)
})

const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

const handleSortChange = (data: any) => {
  emit('sort-change', data)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const handleCurrentChange = (page: number) => {
  emit('current-change', page)
}
</script>

<style scoped>
.smart-data-table {
  width: 100%;
}

.el-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
