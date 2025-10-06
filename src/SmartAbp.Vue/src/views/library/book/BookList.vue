<template>
  <div class="book-list">
    <el-card>
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="书名">
          <el-input v-model="searchForm.title" placeholder="请输入书名" clearable />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="searchForm.author" placeholder="请输入作者" clearable />
        </el-form-item>
        <el-form-item label="ISBN">
          <el-input v-model="searchForm.isbn" placeholder="请输入ISBN" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作栏 -->
      <div class="toolbar">
        <el-button type="primary" icon="Plus" @click="handleCreate">新增</el-button>
        <el-button type="danger" icon="Delete" :disabled="!selectedRows.length" @click="handleBatchDelete">
          批量删除
        </el-button>
      </div>

      <!-- 数据表格 -->
      <el-table
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="书名" />
        <el-table-column prop="author" label="作者" />
        <el-table-column prop="isbn" label="ISBN" />
        <el-table-column prop="publisher" label="出版社" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="stock" label="库存数量" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 表单对话框 -->
    <BookForm
      v-model:visible="formVisible"
      :book-id="currentId"
      @success="handleFormSuccess"
    />

    <!-- 详情对话框 -->
    <BookDetail
      v-model:visible="detailVisible"
      :book-id="currentId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBookList, deleteBook, deleteBookBatch } from './book-api'
import BookForm from './BookForm.vue'
import BookDetail from './BookDetail.vue'
import type { BookDto, BookPagedRequestDto } from './book.types'

// 搜索表单
const searchForm = ref<BookPagedRequestDto>({})

// 表格数据
const tableData = ref<BookDto[]>([])
const loading = ref(false)
const selectedRows = ref<BookDto[]>([])

// 分页
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0
})

// 对话框
const formVisible = ref(false)
const detailVisible = ref(false)
const currentId = ref<string>()

// 加载数据
async function loadData() {
  loading.value = true
  try {
    const { items, totalCount } = await getBookList({
      ...searchForm.value,
      skipCount: (pagination.value.current - 1) * pagination.value.pageSize,
      maxResultCount: pagination.value.pageSize
    })
    tableData.value = items
    pagination.value.total = totalCount
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  pagination.value.current = 1
  loadData()
}

// 重置
function handleReset() {
  searchForm.value = {}
  handleSearch()
}

// 新增
function handleCreate() {
  currentId.value = undefined
  formVisible.value = true
}

// 编辑
function handleEdit(row: BookDto) {
  currentId.value = row.id
  formVisible.value = true
}

// 查看
function handleView(row: BookDto) {
  currentId.value = row.id
  detailVisible.value = true
}

// 删除
async function handleDelete(row: BookDto) {
  try {
    await ElMessageBox.confirm('确认删除此记录吗？', '提示', {
      type: 'warning'
    })
    await deleteBook(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 条记录吗？`, '提示', {
      type: 'warning'
    })
    await deleteBookBatch(selectedRows.value.map(r => r.id))
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 选择变化
function handleSelectionChange(rows: BookDto[]) {
  selectedRows.value = rows
}

// 分页变化
function handleSizeChange() {
  pagination.value.current = 1
  loadData()
}

function handleCurrentChange() {
  loadData()
}

// 表单成功回调
function handleFormSuccess() {
  formVisible.value = false
  loadData()
}

// 挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.book-list {
  .search-form {
    margin-bottom: 16px;
  }

  .toolbar {
    margin-bottom: 16px;
  }

  .el-pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
