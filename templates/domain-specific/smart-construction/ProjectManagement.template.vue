<!-- 
/**
 * 智慧工地管理系统 - 项目管理模板
 * 
 * 基于SmartAbp框架的企业级工程项目管理界面
 * 支持项目信息管理、进度跟踪、预算控制、地图定位
 * 
 * @template ProjectManagement
 * @domain 智慧工地管理系统
 * @version 1.0.0
 * @author SmartAbp Template Generator
 */
-->

<template>
  <div class="project-management">
    <!-- 页面头部和统计卡片 -->
    <div class="dashboard-overview">
      <div class="overview-cards">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="el-icon-office-building" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ projectStats.total }}</div>
            <div class="stat-label">总项目数</div>
          </div>
        </div>
        <div class="stat-card active">
          <div class="stat-icon">
            <i class="el-icon-loading" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ projectStats.active }}</div>
            <div class="stat-label">施工中</div>
          </div>
        </div>
        <div class="stat-card completed">
          <div class="stat-icon">
            <i class="el-icon-check" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ projectStats.completed }}</div>
            <div class="stat-label">已完工</div>
          </div>
        </div>
        <div class="stat-card budget">
          <div class="stat-icon">
            <i class="el-icon-money" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatCurrency(projectStats.totalBudget) }}</div>
            <div class="stat-label">总投资额</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h2 class="page-title">
          <i class="el-icon-office-building" />
          工程项目管理
        </h2>
      </div>
      <div class="toolbar-right">
        <el-button-group>
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="handleCreate"
            v-if="hasPermission('{{EntityName}}.Create')"
          >
            新建项目
          </el-button>
          <el-button
            type="success"
            icon="el-icon-map-location"
            @click="showMapView = !showMapView"
          >
            {{ showMapView ? '列表视图' : '地图视图' }}
          </el-button>
          <el-button
            type="warning"
            icon="el-icon-download"
            @click="handleExport"
            v-if="hasPermission('{{EntityName}}.Export')"
          >
            导出报表
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="search-card" shadow="never">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        :inline="true"
        class="search-form"
      >
        <el-form-item label="项目名称" prop="projectName">
          <el-input
            v-model="searchForm.projectName"
            placeholder="输入项目名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="项目编号" prop="projectCode">
          <el-input
            v-model="searchForm.projectCode"
            placeholder="输入项目编号"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="项目类型" prop="projectType">
          <el-select
            v-model="searchForm.projectType"
            placeholder="选择项目类型"
            clearable
            style="width: 120px"
          >
            <el-option label="住宅" value="Residential" />
            <el-option label="商业" value="Commercial" />
            <el-option label="基础设施" value="Infrastructure" />
            <el-option label="工业" value="Industrial" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目状态" prop="status">
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="筹备中" value="Planning" />
            <el-option label="施工中" value="Construction" />
            <el-option label="暂停" value="Suspended" />
            <el-option label="完工" value="Completed" />
            <el-option label="验收" value="Acceptance" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" prop="dateRange">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="handleSearch"
          >
            搜索
          </el-button>
          <el-button
            icon="el-icon-refresh"
            @click="handleReset"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表视图 -->
    <el-card v-if="!showMapView" class="table-card" shadow="never">
      <template #header>
        <div class="table-header">
          <div class="table-title">
            <span>项目列表</span>
            <el-tag type="info" size="small">
              共 {{ pagination.total }} 个项目
            </el-tag>
          </div>
        </div>
      </template>

      <el-table
        ref="tableRef"
        :data="tableData"
        :loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column
          prop="projectCode"
          label="项目编号"
          width="120"
          fixed="left"
        >
          <template #default="{ row }">
            <el-link
              type="primary"
              @click="handleView(row)"
              style="font-weight: 600"
            >
              {{ row.projectCode }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="projectName"
          label="项目名称"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div class="project-info">
              <div class="project-name">{{ row.projectName }}</div>
              <div class="project-location">
                <i class="el-icon-location" />
                {{ row.location }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="projectType"
          label="项目类型"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="getProjectTypeTagType(row.projectType)"
              size="small"
            >
              {{ getProjectTypeLabel(row.projectType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="项目状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.status)"
              size="small"
              effect="dark"
            >
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="progress"
          label="施工进度"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress || 0"
              :stroke-width="6"
              :show-text="true"
              :color="getProgressColor(row.progress)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="totalBudget"
          label="总投资"
          width="120"
          align="right"
        >
          <template #default="{ row }">
            <span class="budget-amount">
              {{ formatCurrency(row.totalBudget) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="startDate"
          label="开工日期"
          width="110"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDate(row.startDate) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="endDate"
          label="竣工日期"
          width="110"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDate(row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="contactPerson"
          label="项目经理"
          width="100"
          align="center"
        />
        <el-table-column
          label="操作"
          width="200"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button-group>
              <el-button
                size="mini"
                icon="el-icon-view"
                @click="handleView(row)"
                v-if="hasPermission('{{EntityName}}.Detail')"
              >
                详情
              </el-button>
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="handleEdit(row)"
                v-if="hasPermission('{{EntityName}}.Update')"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="warning"
                icon="el-icon-data-analysis"
                @click="handleViewProgress(row)"
                v-if="hasPermission('{{EntityName}}.ViewProgress')"
              >
                进度
              </el-button>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="handleDelete(row)"
                v-if="hasPermission('{{EntityName}}.Delete')"
              >
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 地图视图 -->
    <el-card v-if="showMapView" class="map-card" shadow="never">
      <template #header>
        <div class="map-header">
          <span>项目地图分布</span>
          <el-button-group size="small">
            <el-button
              :type="mapMode === 'satellite' ? 'primary' : 'default'"
              @click="mapMode = 'satellite'"
            >
              卫星图
            </el-button>
            <el-button
              :type="mapMode === 'terrain' ? 'primary' : 'default'"
              @click="mapMode = 'terrain'"
            >
              地形图
            </el-button>
          </el-button-group>
        </div>
      </template>
      
      <div class="map-container">
        <div class="map-placeholder">
          <i class="el-icon-map-location" />
          <p>智慧工地项目地图分布</p>
          <p>集成百度地图/高德地图API，显示项目地理位置</p>
        </div>
      </div>
    </el-card>

    <!-- 项目表单对话框 -->
    <ProjectFormDialog
      v-model="showFormDialog"
      :project="editingProject"
      @saved="handleProjectSaved"
    />

    <!-- 项目详情对话框 -->
    <ProjectDetailDialog
      v-model="showDetailDialog"
      :project="viewingProject"
    />

    <!-- 项目进度对话框 -->
    <ProjectProgressDialog
      v-model="showProgressDialog"
      :project="progressProject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProjectFormDialog from './ProjectFormDialog.vue'
import ProjectDetailDialog from './ProjectDetailDialog.vue'
import ProjectProgressDialog from './ProjectProgressDialog.vue'
import { usePermission } from '@/composables/usePermission'
import { useProjectService } from '@/services/projectService'

// 权限检查
const { hasPermission } = usePermission()

// 服务
const projectService = useProjectService()

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const selectedProjects = ref([])
const showMapView = ref(false)
const mapMode = ref('satellite')

// 搜索表单
const searchForm = reactive({
  projectName: '',
  projectCode: '',
  projectType: '',
  status: '',
  dateRange: null
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 对话框状态
const showFormDialog = ref(false)
const showDetailDialog = ref(false)
const showProgressDialog = ref(false)

// 编辑状态
const editingProject = ref(null)
const viewingProject = ref(null)
const progressProject = ref(null)

// 项目统计
const projectStats = ref({
  total: 0,
  active: 0,
  completed: 0,
  totalBudget: 0
})

// 方法
const loadProjects = async () => {
  try {
    loading.value = true
    const params = {
      ...searchForm,
      skipCount: (pagination.currentPage - 1) * pagination.pageSize,
      maxResultCount: pagination.pageSize
    }
    
    if (searchForm.dateRange) {
      params.startDateFrom = searchForm.dateRange[0]
      params.startDateTo = searchForm.dateRange[1]
    }
    
    const result = await projectService.getList(params)
    tableData.value = result.items
    pagination.total = result.totalCount
    
    // 更新统计信息
    updateProjectStats(result.items)
    
  } catch (error) {
    ElMessage.error('加载项目列表失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const updateProjectStats = (projects) => {
  projectStats.value = {
    total: projects.length,
    active: projects.filter(p => p.status === 'Construction').length,
    completed: projects.filter(p => p.status === 'Completed').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.totalBudget || 0), 0)
  }
}

const handleCreate = () => {
  editingProject.value = null
  showFormDialog.value = true
}

const handleEdit = (project) => {
  editingProject.value = { ...project }
  showFormDialog.value = true
}

const handleView = (project) => {
  viewingProject.value = project
  showDetailDialog.value = true
}

const handleViewProgress = (project) => {
  progressProject.value = project
  showProgressDialog.value = true
}

const handleDelete = async (project) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目"${project.projectName}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await projectService.delete(project.id)
    ElMessage.success('项目删除成功')
    await loadProjects()
    
  } catch {
    // 用户取消删除
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadProjects()
}

const handleReset = () => {
  searchFormRef.value?.resetFields()
  pagination.currentPage = 1
  loadProjects()
}

const handleSelectionChange = (selection) => {
  selectedProjects.value = selection
}

const handleCurrentChange = () => {
  loadProjects()
}

const handleSizeChange = () => {
  pagination.currentPage = 1
  loadProjects()
}

const handleExport = async () => {
  try {
    const result = await projectService.export(searchForm)
    const url = window.URL.createObjectURL(new Blob([result]))
    const link = document.createElement('a')
    link.href = url
    link.download = `projects_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('项目数据导出成功')
  } catch (error) {
    ElMessage.error('数据导出失败：' + error.message)
  }
}

const handleProjectSaved = () => {
  showFormDialog.value = false
  loadProjects()
}

// 格式化方法
const formatCurrency = (amount) => {
  if (!amount) return '¥0'
  return `¥${(amount / 10000).toFixed(1)}万`
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const getProjectTypeLabel = (type) => {
  const labels = {
    'Residential': '住宅',
    'Commercial': '商业',
    'Infrastructure': '基础设施',
    'Industrial': '工业'
  }
  return labels[type] || type
}

const getProjectTypeTagType = (type) => {
  const types = {
    'Residential': 'success',
    'Commercial': 'primary',
    'Infrastructure': 'warning',
    'Industrial': 'danger'
  }
  return types[type] || 'default'
}

const getStatusLabel = (status) => {
  const labels = {
    'Planning': '筹备中',
    'Construction': '施工中',
    'Suspended': '暂停',
    'Completed': '完工',
    'Acceptance': '验收'
  }
  return labels[status] || status
}

const getStatusTagType = (status) => {
  const types = {
    'Planning': 'info',
    'Construction': 'primary',
    'Suspended': 'warning',
    'Completed': 'success',
    'Acceptance': 'success'
  }
  return types[status] || 'default'
}

const getProgressColor = (progress) => {
  if (progress >= 90) return '#67c23a'
  if (progress >= 70) return '#e6a23c'
  if (progress >= 50) return '#409eff'
  return '#f56c6c'
}

// 生命周期
onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
.project-management {
  padding: 20px;
  background: var(--el-bg-color-page);
  min-height: 100vh;
}

/* 概览卡片样式 */
.dashboard-overview {
  margin-bottom: 20px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-primary-light-8);
}

.stat-card.active .stat-icon {
  background: var(--el-color-warning-light-8);
}

.stat-card.completed .stat-icon {
  background: var(--el-color-success-light-8);
}

.stat-card.budget .stat-icon {
  background: var(--el-color-danger-light-8);
}

.stat-icon i {
  font-size: 24px;
  color: var(--el-color-primary);
}

.stat-card.active .stat-icon i {
  color: var(--el-color-warning);
}

.stat-card.completed .stat-icon i {
  color: var(--el-color-success);
}

.stat-card.budget .stat-icon i {
  color: var(--el-color-danger);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 搜索卡片样式 */
.search-card {
  margin-bottom: 16px;
}

.search-form {
  margin: 0;
}

/* 表格样式 */
.table-card {
  margin-bottom: 16px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.project-info {
  line-height: 1.4;
}

.project-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.project-location {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.budget-amount {
  font-weight: 600;
  color: var(--el-color-danger);
}

/* 地图样式 */
.map-card {
  height: 600px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-container {
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.map-placeholder {
  text-align: center;
  color: var(--el-text-color-secondary);
}

.map-placeholder i {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--el-color-primary);
}

.map-placeholder p {
  margin: 8px 0;
  font-size: 16px;
}

/* 分页样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 16px;
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 8px;
  }
}
</style>
