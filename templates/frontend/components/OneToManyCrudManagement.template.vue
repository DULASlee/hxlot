<!-- 
AI_TEMPLATE_INFO:
模板类型: Vue 一对多CRUD管理组件 (极简版)
适用场景: 主子表数据管理，如订单-订单项
基于模板: CrudManagement.template.vue (简化版)
关系类型: OneToMany (1:N)
依赖组件: Element Plus (el-table, el-tabs, el-form)
技术路线: 极简实现，不搞复杂功能
生成规则:
  - MasterEntityName: 主表实体名称
  - DetailEntityName: 子表实体名称
  - ForeignKeyField: 外键字段名
-->

<template>
  <div class="one-to-many-management">
    <!-- 主表区域 -->
    <el-card class="master-card" header="{{MasterEntityName}}管理">
      <!-- 主表搜索 -->
      <el-form :inline="true" class="search-form">
        <el-form-item>
          <el-input v-model="searchKeyword" placeholder="搜索{{MasterEntityName}}" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchMasterData">搜索</el-button>
          <el-button @click="handleCreateMaster">新增</el-button>
        </el-form-item>
      </el-form>

      <!-- 主表表格 -->
      <el-table 
        :data="masterList" 
        v-loading="masterLoading"
        @current-change="handleMasterSelect"
        highlight-current-row
      >
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="code" label="编码" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEditMaster(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDeleteMaster(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 子表区域 -->
    <el-card class="detail-card" header="{{DetailEntityName}}管理" v-if="selectedMaster">
      <template #header>
        <div class="detail-header">
          <span>{{DetailEntityName}}管理 - {{ selectedMaster.name }}</span>
          <el-button type="primary" size="small" @click="handleCreateDetail">
            新增{{DetailEntityName}}
          </el-button>
        </div>
      </template>

      <!-- 子表表格 -->
      <el-table :data="detailList" v-loading="detailLoading">
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEditDetail(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDeleteDetail(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 主表编辑对话框 -->
    <el-dialog v-model="masterDialogVisible" :title="masterDialogTitle" width="500px">
      <el-form :model="masterForm" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="masterForm.name" />
        </el-form-item>
        <el-form-item label="编码" required>
          <el-input v-model="masterForm.code" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="masterDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleMasterSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 子表编辑对话框 -->
    <el-dialog v-model="detailDialogVisible" :title="detailDialogTitle" width="400px">
      <el-form :model="detailForm" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="detailForm.name" />
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="detailForm.quantity" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="detailDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDetailSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 主表状态
const masterList = ref([])
const masterLoading = ref(false)
const selectedMaster = ref(null)
const searchKeyword = ref('')

// 子表状态  
const detailList = ref([])
const detailLoading = ref(false)

// 主表对话框
const masterDialogVisible = ref(false)
const masterDialogTitle = ref('')
const masterForm = ref({ name: '', code: '' })

// 子表对话框
const detailDialogVisible = ref(false)
const detailDialogTitle = ref('')
const detailForm = ref({ name: '', quantity: 1 })

// 主表方法
const fetchMasterData = async () => {
  masterLoading.value = true
  try {
    // TODO: 调用API
    console.log('获取主表数据')
    masterList.value = [
      { id: '1', name: '示例{{MasterEntityName}}1', code: 'DEMO001' }
    ]
  } finally {
    masterLoading.value = false
  }
}

const fetchDetailData = async () => {
  if (!selectedMaster.value) return
  
  detailLoading.value = true
  try {
    // TODO: 调用API
    console.log('获取子表数据')
    detailList.value = [
      { id: '1', name: '示例{{DetailEntityName}}1', quantity: 2 }
    ]
  } finally {
    detailLoading.value = false
  }
}

const handleMasterSelect = (currentRow) => {
  selectedMaster.value = currentRow
  if (currentRow) {
    fetchDetailData()
  }
}

const handleCreateMaster = () => {
  masterDialogTitle.value = '新增{{MasterEntityName}}'
  masterForm.value = { name: '', code: '' }
  masterDialogVisible.value = true
}

const handleEditMaster = (row) => {
  masterDialogTitle.value = '编辑{{MasterEntityName}}'
  masterForm.value = { ...row }
  masterDialogVisible.value = true
}

const handleMasterSubmit = () => {
  // TODO: 保存主表数据
  console.log('保存主表', masterForm.value)
  masterDialogVisible.value = false
  fetchMasterData()
  ElMessage.success('保存成功')
}

const handleDeleteMaster = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除吗？', '提示')
    // TODO: 删除API
    console.log('删除主表', row.id)
    ElMessage.success('删除成功')
    fetchMasterData()
  } catch {
    // 用户取消
  }
}

const handleCreateDetail = () => {
  detailDialogTitle.value = '新增{{DetailEntityName}}'
  detailForm.value = { 
    name: '', 
    quantity: 1,
    {{ForeignKeyField}}: selectedMaster.value?.id
  }
  detailDialogVisible.value = true
}

const handleEditDetail = (row) => {
  detailDialogTitle.value = '编辑{{DetailEntityName}}'
  detailForm.value = { ...row }
  detailDialogVisible.value = true
}

const handleDetailSubmit = () => {
  // TODO: 保存子表数据
  console.log('保存子表', detailForm.value)
  detailDialogVisible.value = false
  fetchDetailData()
  ElMessage.success('保存成功')
}

const handleDeleteDetail = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除吗？', '提示')
    // TODO: 删除API
    console.log('删除子表', row.id)
    ElMessage.success('删除成功')
    fetchDetailData()
  } catch {
    // 用户取消
  }
}

// 初始化
fetchMasterData()
</script>

<style scoped>
.one-to-many-management {
  padding: 20px;
}

.master-card, .detail-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 16px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>