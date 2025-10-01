<template>
  <div class="k8s-dashboard">
    <el-page-header
      content="K8s监控"
      @back="goBack"
    >
      <template #extra>
        <el-space>
          <el-select
            v-model="selectedNamespace"
            placeholder="选择命名空间"
            style="width: 200px"
          >
            <el-option
              label="default"
              value="default"
            />
            <el-option
              label="kube-system"
              value="kube-system"
            />
            <el-option
              label="smartabp"
              value="smartabp"
            />
          </el-select>
          <el-button
            type="primary"
            :icon="Refresh"
            @click="refreshData"
          >
            刷新
          </el-button>
        </el-space>
      </template>
    </el-page-header>

    <el-divider />

    <!-- 集群摘要 -->
    <el-row
      :gutter="20"
      class="cluster-summary"
    >
      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card shadow="hover">
          <div class="summary-item">
            <el-icon
              :size="32"
              color="#409EFF"
            >
              <grid />
            </el-icon>
            <div class="summary-content">
              <div class="summary-label">
                节点总数
              </div>
              <div class="summary-value">
                {{ clusterSummary.totalNodes }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card shadow="hover">
          <div class="summary-item">
            <el-icon
              :size="32"
              color="#67C23A"
            >
              <box />
            </el-icon>
            <div class="summary-content">
              <div class="summary-label">
                Pod总数
              </div>
              <div class="summary-value">
                {{ clusterSummary.totalPods }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card shadow="hover">
          <div class="summary-item">
            <el-icon
              :size="32"
              color="#E6A23C"
            >
              <cpu />
            </el-icon>
            <div class="summary-content">
              <div class="summary-label">
                CPU使用率
              </div>
              <div class="summary-value">
                {{ clusterSummary.cpuUsage }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col
        :xs="24"
        :sm="12"
        :md="6"
      >
        <el-card shadow="hover">
          <div class="summary-item">
            <el-icon
              :size="32"
              color="#F56C6C"
            >
              <memo />
            </el-icon>
            <div class="summary-content">
              <div class="summary-label">
                内存使用率
              </div>
              <div class="summary-value">
                {{ clusterSummary.memoryUsage }}%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 资源列表 -->
    <el-tabs
      v-model="activeTab"
      class="resource-tabs"
    >
      <!-- Pods -->
      <el-tab-pane
        label="Pods"
        name="pods"
      >
        <el-table
          :data="pods"
          stripe
        >
          <el-table-column
            prop="name"
            label="Pod名称"
            width="300"
          />
          <el-table-column
            prop="namespace"
            label="命名空间"
            width="150"
          />
          <el-table-column
            prop="status"
            label="状态"
            width="120"
          >
            <template #default="{ row }">
              <el-tag
                :type="getStatusTagType(row.status)"
                size="small"
              >
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="cpuUsage"
            label="CPU使用"
            width="120"
          >
            <template #default="{ row }">
              {{ row.cpuUsage }}%
            </template>
          </el-table-column>
          <el-table-column
            prop="memoryUsage"
            label="内存使用"
            width="120"
          >
            <template #default="{ row }">
              {{ row.memoryUsage }}%
            </template>
          </el-table-column>
          <el-table-column
            prop="restarts"
            label="重启次数"
            width="100"
          />
          <el-table-column
            prop="age"
            label="运行时长"
            width="150"
          />
          <el-table-column
            label="操作"
            width="200"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                size="small"
                @click="viewPodLogs(row)"
              >
                查看日志
              </el-button>
              <el-button
                link
                type="warning"
                size="small"
                @click="restartPod(row)"
              >
                重启
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Deployments -->
      <el-tab-pane
        label="Deployments"
        name="deployments"
      >
        <el-table
          :data="deployments"
          stripe
        >
          <el-table-column
            prop="name"
            label="Deployment名称"
            width="300"
          />
          <el-table-column
            prop="namespace"
            label="命名空间"
            width="150"
          />
          <el-table-column
            prop="replicas"
            label="副本数"
            width="120"
          >
            <template #default="{ row }">
              {{ row.ready }}/{{ row.desired }}
            </template>
          </el-table-column>
          <el-table-column
            prop="available"
            label="可用副本"
            width="120"
          />
          <el-table-column
            prop="age"
            label="创建时长"
            width="150"
          />
          <el-table-column
            label="操作"
            width="200"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                size="small"
                @click="scaleDeployment(row)"
              >
                扩缩容
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Services -->
      <el-tab-pane
        label="Services"
        name="services"
      >
        <el-table
          :data="services"
          stripe
        >
          <el-table-column
            prop="name"
            label="Service名称"
            width="300"
          />
          <el-table-column
            prop="namespace"
            label="命名空间"
            width="150"
          />
          <el-table-column
            prop="type"
            label="类型"
            width="150"
          />
          <el-table-column
            prop="clusterIP"
            label="Cluster IP"
            width="150"
          />
          <el-table-column
            prop="externalIP"
            label="External IP"
            width="150"
          />
          <el-table-column
            prop="ports"
            label="端口"
            width="200"
          />
          <el-table-column
            prop="age"
            label="创建时长"
            width="150"
          />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- Pod日志查看对话框 -->
    <el-dialog
      v-model="logsDialogVisible"
      title="Pod日志"
      width="1000px"
      top="5vh"
    >
      <div class="logs-container">
        <div class="logs-toolbar">
          <el-space>
            <el-input
              v-model="logSearchKeyword"
              placeholder="搜索日志..."
              clearable
              style="width: 300px"
            />
            <el-switch
              v-model="autoScrollLogs"
              active-text="自动滚动"
            />
            <el-button @click="downloadLogs">
              下载日志
            </el-button>
          </el-space>
        </div>
        <pre
          ref="logsContentRef"
          class="logs-content"
        >{{ podLogs }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh, Grid, Box, Cpu, Memo } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

/**
 * K8s监控面板
 * 提供Kubernetes资源监控、Pod日志查看
 */

const router = useRouter()
const logsContentRef = ref<HTMLPreElement>()

// 数据状态
const selectedNamespace = ref('default')
const activeTab = ref('pods')

// 集群摘要
const clusterSummary = ref({
  totalNodes: 5,
  totalPods: 48,
  cpuUsage: 62.3,
  memoryUsage: 71.5,
})

// Pods数据
const pods = ref([
  {
    name: 'smartabp-web-7d8f9c5b6d-xz9qw',
    namespace: 'default',
    status: 'Running',
    cpuUsage: 45.6,
    memoryUsage: 62.3,
    restarts: 0,
    age: '2d 5h',
  },
  {
    name: 'smartabp-codegen-5c8d7b4a3e-abc123',
    namespace: 'default',
    status: 'Running',
    cpuUsage: 28.3,
    memoryUsage: 48.7,
    restarts: 1,
    age: '1d 12h',
  },
  {
    name: 'smartabp-ops-6f9e8c7d5b-def456',
    namespace: 'default',
    status: 'Running',
    cpuUsage: 15.2,
    memoryUsage: 32.1,
    restarts: 0,
    age: '8h',
  },
])

// Deployments数据
const deployments = ref([
  {
    name: 'smartabp-web',
    namespace: 'default',
    ready: 3,
    desired: 3,
    available: 3,
    age: '5d',
  },
  {
    name: 'smartabp-codegen',
    namespace: 'default',
    ready: 2,
    desired: 2,
    available: 2,
    age: '5d',
  },
  {
    name: 'smartabp-ops',
    namespace: 'default',
    ready: 1,
    desired: 1,
    available: 1,
    age: '1d',
  },
])

// Services数据
const services = ref([
  {
    name: 'smartabp-web-svc',
    namespace: 'default',
    type: 'LoadBalancer',
    clusterIP: '10.96.0.100',
    externalIP: '192.168.1.100',
    ports: '80:30080/TCP',
    age: '5d',
  },
  {
    name: 'smartabp-codegen-svc',
    namespace: 'default',
    type: 'ClusterIP',
    clusterIP: '10.96.0.101',
    externalIP: '<none>',
    ports: '8080:30081/TCP',
    age: '5d',
  },
])

// Pod日志
const logsDialogVisible = ref(false)
const podLogs = ref('')
const logSearchKeyword = ref('')
const autoScrollLogs = ref(true)

// 返回上一页
const goBack = () => {
  router.back()
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, any> = {
    Running: 'success',
    Pending: 'warning',
    Failed: 'danger',
    Unknown: 'info',
  }
  return typeMap[status] || ''
}

// 刷新数据
const refreshData = () => {
  console.log('刷新K8s数据')
  // TODO: 调用后端API
}

// 查看Pod日志
const viewPodLogs = (_pod: any) => {
  podLogs.value = `[2025-10-01 14:30:25] INFO: Application started successfully
[2025-10-01 14:30:26] INFO: Listening on port 8080
[2025-10-01 14:30:27] DEBUG: Database connection established
[2025-10-01 14:30:28] INFO: Ready to accept requests
[2025-10-01 14:31:15] INFO: Processing request: GET /api/users
[2025-10-01 14:31:16] INFO: Request completed in 85ms
[2025-10-01 14:32:00] WARNING: High memory usage detected: 72%
[2025-10-01 14:33:45] ERROR: Database query timeout
[2025-10-01 14:33:46] INFO: Retrying database connection...
[2025-10-01 14:33:47] INFO: Database connection restored
`
  logsDialogVisible.value = true
  // TODO: 调用后端API获取实时日志
}

// 重启Pod
const restartPod = (pod: any) => {
  ElMessage.warning(`确定要重启 ${pod.name} 吗？`)
  // TODO: 调用后端API
}

// 扩缩容Deployment
const scaleDeployment = (deployment: any) => {
  ElMessage.info(`开始扩缩容 ${deployment.name}`)
  // TODO: 调用后端API
}

// 下载日志
const downloadLogs = () => {
  const blob = new Blob([podLogs.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pod-logs-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// 自动滚动日志
watch(autoScrollLogs, (enabled) => {
  if (enabled && logsContentRef.value) {
    logsContentRef.value.scrollTop = logsContentRef.value.scrollHeight
  }
})

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.k8s-dashboard {
  width: 100%;
}

.cluster-summary {
  margin: 20px 0;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-content {
  flex: 1;
}

.summary-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.resource-tabs {
  margin-top: 20px;
}

.logs-container {
  height: 600px;
  display: flex;
  flex-direction: column;
}

.logs-toolbar {
  padding: 10px;
  background-color: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color);
}

.logs-content {
  flex: 1;
  padding: 16px;
  margin: 0;
  overflow-y: auto;
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}
</style>

