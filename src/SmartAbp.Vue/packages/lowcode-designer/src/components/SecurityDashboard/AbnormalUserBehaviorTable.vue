<template>
  <div class="behavior-table">
    <el-table
      :data="visibleData"
      style="width: 100%"
      :max-height="400"
      stripe
    >
      <el-table-column prop="userName" label="用户名" width="120" />
      <el-table-column prop="behaviorType" label="行为类型" width="150">
        <template #default="scope">
          <el-tag :type="getBehaviorType(scope.row.behaviorType)">
            {{ getBehaviorLabel(scope.row.behaviorType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column prop="riskLevel" label="风险等级" width="100">
        <template #default="scope">
          <el-tag :type="getRiskType(scope.row.riskLevel)">
            {{ scope.row.riskLevel }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="timestamp" label="时间" width="160">
        <template #default="scope">
          {{ formatTimestamp(scope.row.timestamp) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="handleUserClick(scope.row.userId)"
          >
            查看用户
          </el-button>
          <el-button
            size="small"
            @click="handleBehaviorClick(scope.row)"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer" v-if="data.length > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="data.length"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElTable, ElTableColumn, ElTag, ElButton, ElPagination } from 'element-plus'

interface AbnormalBehavior {
  id: string
  userId: string
  userName: string
  behaviorType: string
  description: string
  timestamp: Date
  riskLevel: string
}

interface Props {
  data: AbnormalBehavior[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'user-click': [userId: string]
  'behavior-click': [behavior: AbnormalBehavior]
}>()

const currentPage = ref(1)
const pageSize = ref(10)

const visibleData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.data.slice(start, end)
})

const getBehaviorType = (type: string): 'success' | 'warning' | 'danger' | 'info' => {
  const types: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    'UnusualHours': 'warning',
    'MultipleFailedLogins': 'danger',
    'UnusualLocation': 'info',
    'BulkDataAccess': 'danger',
    'PrivilegeEscalation': 'danger'
  }
  return types[type] || 'info'
}

const getBehaviorLabel = (type: string) => {
  const labels: Record<string, string> = {
    'UnusualHours': '异常时间访问',
    'MultipleFailedLogins': '多次登录失败',
    'UnusualLocation': '异常地点访问',
    'BulkDataAccess': '批量数据访问',
    'PrivilegeEscalation': '权限提升'
  }
  return labels[type] || type
}

const getRiskType = (level: string): 'success' | 'warning' | 'danger' | 'info' => {
  const types: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    'Low': 'info',
    'Medium': 'warning',
    'High': 'danger',
    'Critical': 'danger'
  }
  return types[level] || 'info'
}

const formatTimestamp = (timestamp: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp))
}

const handleUserClick = (userId: string) => {
  emit('user-click', userId)
}

const handleBehaviorClick = (behavior: AbnormalBehavior) => {
  emit('behavior-click', behavior)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}
</script>

<style scoped lang="scss">
.behavior-table {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.table-footer {
  padding: 16px;
  text-align: center;
  border-top: 1px solid #ebeef5;
}
</style>
