<!-- 
/**
 * MES制造执行系统 - 生产订单管理模板
 * 
 * 基于SmartAbp框架的企业级生产订单管理界面
 * 支持生产计划、工艺路线、质量控制、实时监控
 * 
 * @template ProductionOrderManagement
 * @domain MES制造执行系统
 * @version 1.0.0
 * @author SmartAbp Template Generator
 */
-->

<template>
  <div class="production-order-management">
    <!-- 生产看板 -->
    <div class="production-dashboard">
      <div class="dashboard-cards">
        <div class="kpi-card">
          <div class="kpi-header">
            <h3>今日生产概况</h3>
            <el-tag type="success">{{ formatDate(new Date()) }}</el-tag>
          </div>
          <div class="kpi-metrics">
            <div class="metric-item">
              <div class="metric-icon orders">
                <i class="el-icon-document" />
              </div>
              <div class="metric-data">
                <div class="metric-value">{{ todayStats.orders }}</div>
                <div class="metric-label">生产订单</div>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon production">
                <i class="el-icon-goods" />
              </div>
              <div class="metric-data">
                <div class="metric-value">{{ todayStats.production }}</div>
                <div class="metric-label">完成数量</div>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon efficiency">
                <i class="el-icon-data-line" />
              </div>
              <div class="metric-data">
                <div class="metric-value">{{ todayStats.efficiency }}%</div>
                <div class="metric-label">生产效率</div>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon quality">
                <i class="el-icon-medal" />
              </div>
              <div class="metric-data">
                <div class="metric-value">{{ todayStats.qualityRate }}%</div>
                <div class="metric-label">合格率</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 实时监控 -->
        <div class="monitor-card">
          <div class="monitor-header">
            <h3>
              <i class="el-icon-monitor" />
              实时监控
            </h3>
            <el-button
              size="small"
              icon="el-icon-refresh"
              @click="refreshMonitorData"
              :loading="monitorLoading"
            >
              刷新
            </el-button>
          </div>
          <div class="monitor-content">
            <div class="workstation-status">
              <div
                v-for="station in workstations"
                :key="station.id"
                class="station-item"
                :class="getStationStatusClass(station.status)"
              >
                <div class="station-info">
                  <div class="station-name">{{ station.name }}</div>
                  <div class="station-product">{{ station.currentProduct || '空闲' }}</div>
                </div>
                <div class="station-indicator">
                  <div
                    class="status-dot"
                    :class="station.status"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h2 class="page-title">
          <i class="el-icon-document" />
          生产订单管理
        </h2>
        <div class="quick-filters">
          <el-button-group size="small">
            <el-button
              :type="quickFilter === 'all' ? 'primary' : 'default'"
              @click="setQuickFilter('all')"
            >
              全部 ({{ getOrderCountByStatus('all') }})
            </el-button>
            <el-button
              :type="quickFilter === 'planned' ? 'primary' : 'default'"
              @click="setQuickFilter('planned')"
            >
              计划中 ({{ getOrderCountByStatus('Planned') }})
            </el-button>
            <el-button
              :type="quickFilter === 'production' ? 'primary' : 'default'"
              @click="setQuickFilter('production')"
            >
              生产中 ({{ getOrderCountByStatus('InProduction') }})
            </el-button>
            <el-button
              :type="quickFilter === 'completed' ? 'primary' : 'default'"
              @click="setQuickFilter('completed')"
            >
              已完成 ({{ getOrderCountByStatus('Completed') }})
            </el-button>
          </el-button-group>
        </div>
      </div>
      <div class="toolbar-right">
        <el-button-group>
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="handleCreate"
            v-if="hasPermission('{{EntityName}}.Create')"
          >
            新建订单
          </el-button>
          <el-button
            type="success"
            icon="el-icon-magic-stick"
            @click="handleAutoSchedule"
            v-if="hasPermission('{{EntityName}}.AutoSchedule')"
          >
            智能排产
          </el-button>
          <el-button
            type="warning"
            icon="el-icon-data-analysis"
            @click="showProductionReport"
            v-if="hasPermission('{{EntityName}}.Report')"
          >
            生产报表
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
        <el-form-item label="订单号" prop="orderNumber">
          <el-input
            v-model="searchForm.orderNumber"
            placeholder="输入订单号"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="产品" prop="productId">
          <el-select
            v-model="searchForm.productId"
            placeholder="选择产品"
            clearable
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.productName"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工作站" prop="workstationId">
          <el-select
            v-model="searchForm.workstationId"
            placeholder="选择工作站"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="station in workstations"
              :key="station.id"
              :label="station.name"
              :value="station.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="计划中" value="Planned" />
            <el-option label="已下达" value="Released" />
            <el-option label="生产中" value="InProduction" />
            <el-option label="暂停" value="Suspended" />
            <el-option label="完成" value="Completed" />
            <el-option label="取消" value="Cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划时间" prop="plannedDateRange">
          <el-date-picker
            v-model="searchForm.plannedDateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="计划开始时间"
            end-placeholder="计划结束时间"
            style="width: 320px"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
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

    <!-- 生产订单表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="table-header">
          <div class="table-title">
            <span>生产订单列表</span>
            <el-tag type="info" size="small">
              共 {{ pagination.total }} 条订单
            </el-tag>
          </div>
          <div class="table-tools">
            <el-button
              size="small"
              icon="el-icon-refresh"
              @click="handleRefresh"
            >
              刷新
            </el-button>
            <el-dropdown @command="handleBatchAction" v-if="selectedOrders.length > 0">
              <el-button size="small" type="primary">
                批量操作 ({{ selectedOrders.length }})
                <i class="el-icon-arrow-down" />
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="release" v-if="hasPermission('{{EntityName}}.Release')">
                    <i class="el-icon-right" /> 下达订单
                  </el-dropdown-item>
                  <el-dropdown-item command="start" v-if="hasPermission('{{EntityName}}.Start')">
                    <i class="el-icon-video-play" /> 开始生产
                  </el-dropdown-item>
                  <el-dropdown-item command="suspend" v-if="hasPermission('{{EntityName}}.Suspend')">
                    <i class="el-icon-video-pause" /> 暂停生产
                  </el-dropdown-item>
                  <el-dropdown-item command="cancel" divided v-if="hasPermission('{{EntityName}}.Cancel')">
                    <i class="el-icon-close" /> 取消订单
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>

      <el-table
        ref="tableRef"
        :data="tableData"
        :loading="loading"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column
          prop="orderNumber"
          label="订单号"
          width="130"
          fixed="left"
        >
          <template #default="{ row }">
            <el-link
              type="primary"
              @click="handleView(row)"
              style="font-weight: 600"
            >
              {{ row.orderNumber }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="product"
          label="产品信息"
          min-width="200"
        >
          <template #default="{ row }">
            <div class="product-info">
              <div class="product-name">{{ row.product?.productName }}</div>
              <div class="product-code">{{ row.product?.productCode }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="quantity"
          label="计划数量"
          width="100"
          align="right"
        >
          <template #default="{ row }">
            <span class="quantity-text">{{ row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="completedQuantity"
          label="完成数量"
          width="100"
          align="right"
        >
          <template #default="{ row }">
            <span class="completed-quantity" :class="{ 'completed': row.completedQuantity >= row.quantity }">
              {{ row.completedQuantity || 0 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="progress"
          label="完成进度"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-progress
              :percentage="calculateProgress(row)"
              :stroke-width="6"
              :show-text="true"
              :color="getProgressColor(calculateProgress(row))"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="workstation"
          label="工作站"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="getWorkstationTagType(row.workstation?.status)"
            >
              {{ row.workstation?.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="priority"
          label="优先级"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="getPriorityTagType(row.priority)"
            >
              {{ getPriorityLabel(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="订单状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.status)"
              effect="dark"
            >
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="plannedStartTime"
          label="计划开始"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            <div class="time-info">
              <div class="time-value">{{ formatDateTime(row.plannedStartTime) }}</div>
              <div v-if="isOverdue(row)" class="overdue-warning">
                <i class="el-icon-warning" />
                超期
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="plannedEndTime"
          label="计划完成"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.plannedEndTime) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="actualStartTime"
          label="实际开始"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.actualStartTime">
              {{ formatDateTime(row.actualStartTime) }}
            </span>
            <el-tag v-else size="small" type="info">未开始</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="220"
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
                v-if="hasPermission('{{EntityName}}.Update') && canEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="row.status === 'Planned'"
                size="mini"
                type="success"
                icon="el-icon-right"
                @click="handleRelease(row)"
                v-if="hasPermission('{{EntityName}}.Release')"
              >
                下达
              </el-button>
              <el-button
                v-if="row.status === 'Released'"
                size="mini"
                type="warning"
                icon="el-icon-video-play"
                @click="handleStart(row)"
                v-if="hasPermission('{{EntityName}}.Start')"
              >
                开始
              </el-button>
              <el-button
                v-if="row.status === 'InProduction'"
                size="mini"
                type="info"
                icon="el-icon-video-pause"
                @click="handleSuspend(row)"
                v-if="hasPermission('{{EntityName}}.Suspend')"
              >
                暂停
              </el-button>
              <el-button
                v-if="['Planned', 'Released'].includes(row.status)"
                size="mini"
                type="danger"
                icon="el-icon-close"
                @click="handleCancel(row)"
                v-if="hasPermission('{{EntityName}}.Cancel')"
              >
                取消
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

    <!-- 生产订单表单对话框 -->
    <ProductionOrderFormDialog
      v-model="showFormDialog"
      :order="editingOrder"
      :products="products"
      :workstations="workstations"
      @saved="handleOrderSaved"
    />

    <!-- 订单详情对话框 -->
    <ProductionOrderDetailDialog
      v-model="showDetailDialog"
      :order="viewingOrder"
    />

    <!-- 生产报表对话框 -->
    <ProductionReportDialog
      v-model="showReportDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProductionOrderFormDialog from './ProductionOrderFormDialog.vue'
import ProductionOrderDetailDialog from './ProductionOrderDetailDialog.vue'
import ProductionReportDialog from './ProductionReportDialog.vue'
import { usePermission } from '@/composables/usePermission'
import { useProductionOrderService } from '@/services/productionOrderService'
import { useProductService } from '@/services/productService'
import { useWorkstationService } from '@/services/workstationService'

// 权限检查
const { hasPermission } = usePermission()

// 服务
const orderService = useProductionOrderService()
const productService = useProductService()
const workstationService = useWorkstationService()

// 响应式数据
const loading = ref(false)
const monitorLoading = ref(false)
const tableData = ref([])
const selectedOrders = ref([])
const products = ref([])
const workstations = ref([])
const quickFilter = ref('all')

// 今日统计
const todayStats = ref({
  orders: 0,
  production: 0,
  efficiency: 0,
  qualityRate: 0
})

// 搜索表单
const searchForm = reactive({
  orderNumber: '',
  productId: '',
  workstationId: '',
  status: '',
  plannedDateRange: null
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
const showReportDialog = ref(false)

// 编辑状态
const editingOrder = ref(null)
const viewingOrder = ref(null)

// 实时监控定时器
let monitorTimer = null

// 方法
const loadOrders = async () => {
  try {
    loading.value = true
    const params = {
      ...searchForm,
      skipCount: (pagination.currentPage - 1) * pagination.pageSize,
      maxResultCount: pagination.pageSize
    }
    
    if (quickFilter.value !== 'all') {
      params.status = quickFilter.value === 'planned' ? 'Planned' :
                     quickFilter.value === 'production' ? 'InProduction' :
                     quickFilter.value === 'completed' ? 'Completed' : ''
    }
    
    if (searchForm.plannedDateRange) {
      params.plannedStartTimeFrom = searchForm.plannedDateRange[0]
      params.plannedStartTimeTo = searchForm.plannedDateRange[1]
    }
    
    const result = await orderService.getList(params)
    tableData.value = result.items
    pagination.total = result.totalCount
    
  } catch (error) {
    ElMessage.error('加载生产订单失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const loadProducts = async () => {
  try {
    const result = await productService.getList({ maxResultCount: 1000 })
    products.value = result.items
  } catch (error) {
    console.error('加载产品列表失败：', error)
  }
}

const loadWorkstations = async () => {
  try {
    const result = await workstationService.getList({ maxResultCount: 1000 })
    workstations.value = result.items
  } catch (error) {
    console.error('加载工作站列表失败：', error)
  }
}

const loadTodayStats = async () => {
  try {
    const stats = await orderService.getTodayStatistics()
    todayStats.value = stats
  } catch (error) {
    console.error('加载今日统计失败：', error)
  }
}

const refreshMonitorData = async () => {
  try {
    monitorLoading.value = true
    await Promise.all([
      loadWorkstations(),
      loadTodayStats()
    ])
  } catch (error) {
    ElMessage.error('刷新监控数据失败：' + error.message)
  } finally {
    monitorLoading.value = false
  }
}

const setQuickFilter = (filter) => {
  quickFilter.value = filter
  pagination.currentPage = 1
  loadOrders()
}

const getOrderCountByStatus = (status) => {
  if (status === 'all') return tableData.value.length
  return tableData.value.filter(order => order.status === status).length
}

const handleCreate = () => {
  editingOrder.value = null
  showFormDialog.value = true
}

const handleEdit = (order) => {
  editingOrder.value = { ...order }
  showFormDialog.value = true
}

const handleView = (order) => {
  viewingOrder.value = order
  showDetailDialog.value = true
}

const handleRelease = async (order) => {
  try {
    await orderService.release(order.id)
    ElMessage.success('订单下达成功')
    await loadOrders()
  } catch (error) {
    ElMessage.error('订单下达失败：' + error.message)
  }
}

const handleStart = async (order) => {
  try {
    await orderService.start(order.id)
    ElMessage.success('生产开始')
    await loadOrders()
  } catch (error) {
    ElMessage.error('开始生产失败：' + error.message)
  }
}

const handleSuspend = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确定要暂停订单"${order.orderNumber}"的生产吗？`,
      '确认暂停',
      { type: 'warning' }
    )
    
    await orderService.suspend(order.id)
    ElMessage.success('生产已暂停')
    await loadOrders()
    
  } catch {
    // 用户取消
  }
}

const handleCancel = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消订单"${order.orderNumber}"吗？此操作不可恢复。`,
      '确认取消',
      { type: 'warning' }
    )
    
    await orderService.cancel(order.id)
    ElMessage.success('订单已取消')
    await loadOrders()
    
  } catch {
    // 用户取消
  }
}

const handleAutoSchedule = () => {
  ElMessage.info('智能排产功能开发中...')
}

const showProductionReport = () => {
  showReportDialog.value = true
}

const canEdit = (order) => {
  return ['Planned', 'Released'].includes(order.status)
}

const isOverdue = (order) => {
  if (!order.plannedStartTime || order.status === 'Completed') return false
  return new Date(order.plannedStartTime) < new Date() && order.status === 'Planned'
}

const calculateProgress = (order) => {
  if (!order.quantity || order.quantity === 0) return 0
  return Math.round(((order.completedQuantity || 0) / order.quantity) * 100)
}

// 格式化方法
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return new Date(dateTime).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusLabel = (status) => {
  const labels = {
    'Planned': '计划中',
    'Released': '已下达',
    'InProduction': '生产中',
    'Suspended': '暂停',
    'Completed': '完成',
    'Cancelled': '取消'
  }
  return labels[status] || status
}

const getStatusTagType = (status) => {
  const types = {
    'Planned': 'info',
    'Released': 'primary',
    'InProduction': 'warning',
    'Suspended': 'danger',
    'Completed': 'success',
    'Cancelled': 'info'
  }
  return types[status] || 'default'
}

const getPriorityLabel = (priority) => {
  const labels = {
    'Low': '低',
    'Normal': '中',
    'High': '高',
    'Urgent': '紧急'
  }
  return labels[priority] || priority
}

const getPriorityTagType = (priority) => {
  const types = {
    'Low': 'info',
    'Normal': 'success',
    'High': 'warning',
    'Urgent': 'danger'
  }
  return types[priority] || 'default'
}

const getWorkstationTagType = (status) => {
  const types = {
    'Running': 'success',
    'Idle': 'info',
    'Fault': 'danger',
    'Maintenance': 'warning'
  }
  return types[status] || 'default'
}

const getStationStatusClass = (status) => {
  return `station-${status?.toLowerCase() || 'unknown'}`
}

const getProgressColor = (progress) => {
  if (progress >= 90) return '#67c23a'
  if (progress >= 70) return '#e6a23c'
  if (progress >= 50) return '#409eff'
  return '#f56c6c'
}

// 其他表格操作方法
const handleSearch = () => {
  pagination.currentPage = 1
  loadOrders()
}

const handleReset = () => {
  searchFormRef.value?.resetFields()
  quickFilter.value = 'all'
  pagination.currentPage = 1
  loadOrders()
}

const handleRefresh = () => {
  loadOrders()
  refreshMonitorData()
}

const handleSelectionChange = (selection) => {
  selectedOrders.value = selection
}

const handleSortChange = ({ prop, order }) => {
  searchForm.sorting = order ? `${prop} ${order === 'ascending' ? 'asc' : 'desc'}` : ''
  loadOrders()
}

const handleCurrentChange = () => {
  loadOrders()
}

const handleSizeChange = () => {
  pagination.currentPage = 1
  loadOrders()
}

const handleBatchAction = async (command) => {
  // 批量操作逻辑
  ElMessage.info(`批量${command}功能开发中...`)
}

const handleOrderSaved = () => {
  showFormDialog.value = false
  loadOrders()
}

// 生命周期
onMounted(() => {
  loadOrders()
  loadProducts()
  loadWorkstations()
  loadTodayStats()
  
  // 启动实时监控
  monitorTimer = setInterval(() => {
    refreshMonitorData()
  }, 30000) // 30秒刷新一次
})

onUnmounted(() => {
  if (monitorTimer) {
    clearInterval(monitorTimer)
  }
})
</script>

<style scoped>
.production-order-management {
  padding: 20px;
  background: var(--el-bg-color-page);
  min-height: 100vh;
}

/* 生产看板样式 */
.production-dashboard {
  margin-bottom: 20px;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.kpi-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.kpi-header h3 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.kpi-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon.orders {
  background: var(--el-color-primary-light-8);
}

.metric-icon.production {
  background: var(--el-color-success-light-8);
}

.metric-icon.efficiency {
  background: var(--el-color-warning-light-8);
}

.metric-icon.quality {
  background: var(--el-color-danger-light-8);
}

.metric-icon i {
  font-size: 18px;
}

.metric-icon.orders i {
  color: var(--el-color-primary);
}

.metric-icon.production i {
  color: var(--el-color-success);
}

.metric-icon.efficiency i {
  color: var(--el-color-warning);
}

.metric-icon.quality i {
  color: var(--el-color-danger);
}

.metric-data {
  flex: 1;
}

.metric-value {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}

.metric-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 实时监控样式 */
.monitor-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.monitor-header h3 {
  margin: 0;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.workstation-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.station-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 4px solid var(--el-border-color);
}

.station-item.station-running {
  background: var(--el-color-success-light-9);
  border-left-color: var(--el-color-success);
}

.station-item.station-idle {
  background: var(--el-color-info-light-9);
  border-left-color: var(--el-color-info);
}

.station-item.station-fault {
  background: var(--el-color-danger-light-9);
  border-left-color: var(--el-color-danger);
}

.station-info {
  flex: 1;
}

.station-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.station-product {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.station-indicator {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--el-color-info);
}

.status-dot.Running {
  background: var(--el-color-success);
  animation: pulse 2s infinite;
}

.status-dot.Fault {
  background: var(--el-color-danger);
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.toolbar-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.quick-filters {
  display: flex;
  gap: 8px;
}

/* 表格内容样式 */
.product-info {
  line-height: 1.4;
}

.product-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.product-code {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.quantity-text {
  font-weight: 600;
  color: var(--el-color-primary);
}

.completed-quantity {
  font-weight: 600;
}

.completed-quantity.completed {
  color: var(--el-color-success);
}

.time-info {
  text-align: center;
}

.time-value {
  font-size: 13px;
}

.overdue-warning {
  font-size: 11px;
  color: var(--el-color-danger);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin-top: 2px;
}

/* 搜索和表格卡片样式 */
.search-card,
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

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-cards {
    grid-template-columns: 1fr;
  }
  
  .kpi-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 16px;
  }
  
  .toolbar-left {
    width: 100%;
  }
  
  .kpi-metrics {
    grid-template-columns: 1fr;
  }
  
  .search-form .el-form-item {
    margin-right: 0;
    margin-bottom: 8px;
  }
}
</style>
