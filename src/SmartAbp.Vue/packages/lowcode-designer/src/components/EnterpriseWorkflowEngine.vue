<template>
  <div class="workflow-engine">
    <!-- 🔄 工作流引擎头部 -->
    <div class="workflow-header">
      <div class="header-left">
        <h3>
          <el-icon><Share /></el-icon>
          企业级工作流引擎
        </h3>
        <div class="workflow-stats">
          <el-tag type="primary">
            活跃流程: {{ activeWorkflows.length }}
          </el-tag>
          <el-tag type="success">
            已完成: {{ completedWorkflows.length }}
          </el-tag>
          <el-tag type="warning">
            等待中: {{ pendingWorkflows.length }}
          </el-tag>
          <el-tag type="danger">
            异常: {{ errorWorkflows.length }}
          </el-tag>
        </div>
      </div>
      <div class="header-actions">
        <el-button
          type="primary"
          @click="createNewWorkflow"
        >
          <el-icon><Plus /></el-icon>
          新建工作流
        </el-button>
        <el-button @click="importWorkflow">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
        <el-button @click="exportWorkflow">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 🎨 工作流主体 -->
    <div class="workflow-body">
      <!-- 左侧工作流列表 -->
      <div class="workflow-sidebar">
        <div class="sidebar-header">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索工作流..."
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="workflow-list">
          <div
            v-for="workflow in filteredWorkflows"
            :key="workflow.id"
            class="workflow-item"
            :class="{ active: selectedWorkflow?.id === workflow.id }"
            @click="selectWorkflow(workflow)"
          >
            <div class="workflow-info">
              <div class="workflow-name">
                {{ workflow.name }}
              </div>
              <div class="workflow-status">
                <el-tag
                  :type="getStatusColor(workflow.status)"
                  size="small"
                >
                  {{ getStatusText(workflow.status) }}
                </el-tag>
              </div>
            </div>
            <div class="workflow-meta">
              <span class="node-count">{{ workflow.nodes.length }} 节点</span>
              <span class="update-time">{{ formatRelativeTime(workflow.lastModified) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 中央设计画布 -->
      <div class="workflow-canvas">
        <div class="canvas-toolbar">
          <div class="toolbar-left">
            <el-button-group size="small">
              <el-button @click="zoomOut">
                <el-icon><ZoomOut /></el-icon>
              </el-button>
              <el-button @click="resetZoom">
                {{ Math.round(canvasZoom * 100) }}%
              </el-button>
              <el-button @click="zoomIn">
                <el-icon><ZoomIn /></el-icon>
              </el-button>
            </el-button-group>

            <el-divider direction="vertical" />

            <el-button-group size="small">
              <el-button @click="fitToScreen">
                <el-icon><FullScreen /></el-icon>
                适应屏幕
              </el-button>
              <el-button @click="toggleGrid">
                <el-icon><Grid /></el-icon>
                网格 {{ showGrid ? 'ON' : 'OFF' }}
              </el-button>
            </el-button-group>
          </div>

          <div class="toolbar-center">
            <el-select
              v-model="canvasMode"
              size="small"
              style="width: 120px"
            >
              <el-option
                label="设计模式"
                value="design"
              />
              <el-option
                label="预览模式"
                value="preview"
              />
              <el-option
                label="调试模式"
                value="debug"
              />
            </el-select>
          </div>

          <div class="toolbar-right">
            <el-button-group size="small">
              <el-button
                :loading="validating"
                @click="validateWorkflow"
              >
                <el-icon><CircleCheck /></el-icon>
                验证
              </el-button>
              <el-button
                :loading="simulating"
                @click="simulateWorkflow"
              >
                <el-icon><VideoPlay /></el-icon>
                模拟执行
              </el-button>
              <el-button
                type="primary"
                :loading="deploying"
                @click="deployWorkflow"
              >
                <el-icon><Promotion /></el-icon>
                部署
              </el-button>
            </el-button-group>
          </div>
        </div>

        <!-- 🎨 可视化工作流设计画布 -->
        <div class="canvas-container">
          <div
            class="workflow-canvas-area"
            :style="canvasStyle"
            @drop="handleNodeDrop"
            @dragover="handleDragOver"
            @click="handleCanvasClick"
          >
            <!-- 网格背景 -->
            <div
              v-if="showGrid"
              class="grid-background"
            />

            <!-- 工作流节点 -->
            <div
              v-for="node in selectedWorkflow?.nodes || []"
              :key="node.id"
              class="workflow-node"
              :class="[
                `node-${node.type}`,
                {
                  selected: selectedNode?.id === node.id,
                  executing: executingNodes.includes(node.id),
                  error: errorNodes.includes(node.id)
                }
              ]"
              :style="getNodeStyle(node)"
              @click="selectNode(node)"
              @mousedown="startNodeDrag(node, $event)"
            >
              <div class="node-header">
                <el-icon :class="getNodeIcon(node.type)" />
                <span class="node-title">{{ node.name }}</span>
                <div class="node-actions">
                  <el-button
                    text
                    size="small"
                    @click="editNode(node)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button
                    text
                    size="small"
                    type="danger"
                    @click="deleteNode(node)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>

              <div class="node-body">
                <div class="node-description">
                  {{ node.description }}
                </div>
                <div
                  v-if="node.config"
                  class="node-config"
                >
                  <div
                    v-for="(value, key) in node.config"
                    :key="key"
                    class="config-item"
                  >
                    <span class="config-key">{{ key }}:</span>
                    <span class="config-value">{{ value }}</span>
                  </div>
                </div>
              </div>

              <!-- 节点连接点 -->
              <div class="node-connectors">
                <div
                  v-for="connector in getNodeConnectors(node)"
                  :key="connector.id"
                  class="connector"
                  :class="connector.type"
                  :style="connector.style"
                  @mousedown="startConnection(node, connector, $event)"
                />
              </div>
            </div>

            <!-- 连接线 -->
            <svg
              class="connections-svg"
              :width="canvasSize.width"
              :height="canvasSize.height"
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#409eff"
                  />
                </marker>
              </defs>

              <path
                v-for="connection in selectedWorkflow?.connections || []"
                :key="connection.id"
                :d="getConnectionPath(connection)"
                class="connection-path"
                :class="{
                  active: selectedConnection?.id === connection.id,
                  executing: executingConnections.includes(connection.id)
                }"
                marker-end="url(#arrowhead)"
                @click="selectConnection(connection)"
              />
            </svg>

            <!-- 拖拽连接线预览 -->
            <svg
              v-if="draggingConnection"
              class="drag-connection-svg"
            >
              <path
                :d="dragConnectionPath"
                class="drag-connection-path"
                stroke-dasharray="5,5"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="workflow-properties">
        <div class="properties-header">
          <h4>属性配置</h4>
        </div>

        <div class="properties-content">
          <!-- 工作流属性 -->
          <div
            v-if="!selectedNode && selectedWorkflow"
            class="workflow-props"
          >
            <el-form
              :model="selectedWorkflow"
              label-width="80px"
            >
              <el-form-item label="流程名称">
                <el-input v-model="selectedWorkflow.name" />
              </el-form-item>
              <el-form-item label="流程描述">
                <el-input
                  v-model="selectedWorkflow.description"
                  type="textarea"
                  :rows="3"
                />
              </el-form-item>
              <el-form-item label="触发方式">
                <el-select v-model="selectedWorkflow.triggerType">
                  <el-option
                    label="手动触发"
                    value="manual"
                  />
                  <el-option
                    label="定时触发"
                    value="scheduled"
                  />
                  <el-option
                    label="事件触发"
                    value="event"
                  />
                  <el-option
                    label="条件触发"
                    value="condition"
                  />
                </el-select>
              </el-form-item>
            </el-form>
          </div>

          <!-- 节点属性 -->
          <div
            v-if="selectedNode"
            class="node-props"
          >
            <el-form
              :model="selectedNode"
              label-width="80px"
            >
              <el-form-item label="节点名称">
                <el-input v-model="selectedNode.name" />
              </el-form-item>
              <el-form-item label="节点类型">
                <el-select
                  v-model="selectedNode.type"
                  disabled
                >
                  <el-option
                    label="开始节点"
                    value="start"
                  />
                  <el-option
                    label="任务节点"
                    value="task"
                  />
                  <el-option
                    label="决策节点"
                    value="decision"
                  />
                  <el-option
                    label="并行节点"
                    value="parallel"
                  />
                  <el-option
                    label="结束节点"
                    value="end"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="节点描述">
                <el-input
                  v-model="selectedNode.description"
                  type="textarea"
                  :rows="2"
                />
              </el-form-item>

              <!-- 动态配置表单 -->
              <div
                v-if="selectedNode.type === 'task'"
                class="task-config"
              >
                <el-form-item label="执行者">
                  <el-select v-model="selectedNode.config.assignee">
                    <el-option
                      label="指定用户"
                      value="user"
                    />
                    <el-option
                      label="指定角色"
                      value="role"
                    />
                    <el-option
                      label="动态分配"
                      value="dynamic"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="超时时间">
                  <el-input-number
                    v-model="selectedNode.config.timeout"
                    :min="1"
                    :max="10080"
                    controls-position="right"
                  />
                  <span style="margin-left: 8px">分钟</span>
                </el-form-item>
              </div>

              <div
                v-if="selectedNode.type === 'decision'"
                class="decision-config"
              >
                <el-form-item label="判断条件">
                  <el-input
                    v-model="selectedNode.config.condition"
                    placeholder="例如: amount > 1000"
                  />
                </el-form-item>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>

    <!-- 节点工具面板 -->
    <div class="node-palette">
      <div class="palette-header">
        <h4>节点组件</h4>
      </div>
      <div class="palette-content">
        <div
          v-for="nodeType in nodeTypes"
          :key="nodeType.type"
          class="palette-node"
          draggable="true"
          @dragstart="handleNodeDragStart(nodeType, $event)"
        >
          <el-icon :class="nodeType.icon" />
          <span>{{ nodeType.name }}</span>
        </div>
      </div>
    </div>

    <!-- 🎯 工作流执行监控 -->
    <div
      v-if="isMonitoring"
      class="execution-monitor"
    >
      <div class="monitor-header">
        <h4>执行监控</h4>
        <el-button
          text
          @click="stopMonitoring"
        >
          <el-icon><VideoClose /></el-icon>
          停止监控
        </el-button>
      </div>
      <div class="execution-log">
        <div
          v-for="log in executionLogs"
          :key="log.id"
          class="log-entry"
          :class="log.level"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-node">{{ log.nodeId }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
    CircleCheck,
    Delete,
    Download,
    Edit,
    FullScreen, Grid,
    Plus,
    Promotion,
    Search,
    Share,
    Upload,
    VideoPlay,
    ZoomIn,
    ZoomOut,
} from '@element-plus/icons-vue'
import { eventBus } from '@smartabp/lowcode-tools'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, onUnmounted, ref } from 'vue'

// 🔄 工作流状态机接口
export interface WorkflowNode {
  id: string
  name: string
  type: 'start' | 'task' | 'decision' | 'parallel' | 'end' | 'gateway' | 'subprocess'
  description: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  config: Record<string, any>
  inputPorts: NodePort[]
  outputPorts: NodePort[]
  status: 'pending' | 'executing' | 'completed' | 'error' | 'skipped'
}

export interface NodePort {
  id: string
  type: 'input' | 'output'
  name: string
  position: 'top' | 'right' | 'bottom' | 'left'
  dataType?: string
}

export interface WorkflowConnection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
  condition?: string
  style?: Record<string, any>
}

export interface Workflow {
  id: string
  name: string
  description: string
  version: string
  status: 'draft' | 'active' | 'completed' | 'error' | 'suspended'
  triggerType: 'manual' | 'scheduled' | 'event' | 'condition'
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  variables: Record<string, any>
  createdAt: Date
  lastModified: Date
  executionCount: number
  averageExecutionTime: number
}

export interface ExecutionLog {
  id: string
  nodeId: string
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: Date
  data?: any
}

// 响应式数据
const searchKeyword = ref('')
const selectedWorkflow = ref<Workflow | null>(null)
const selectedNode = ref<WorkflowNode | null>(null)
const selectedConnection = ref<WorkflowConnection | null>(null)
const canvasZoom = ref(1)
const showGrid = ref(true)
const canvasMode = ref('design')
const validating = ref(false)
const simulating = ref(false)
const deploying = ref(false)
const isMonitoring = ref(false)
const draggingConnection = ref(false)
const dragConnectionPath = ref('')
const executingNodes = ref<string[]>([])
const executingConnections = ref<string[]>([])
const errorNodes = ref<string[]>([])

// 画布状态
const canvasSize = ref({ width: 1200, height: 800 })

// 节点类型定义
const nodeTypes = ref([
  { type: 'start', name: '开始', icon: 'play', color: '#67c23a' },
  { type: 'task', name: '任务', icon: 'document', color: '#409eff' },
  { type: 'decision', name: '决策', icon: 'switch-button', color: '#e6a23c' },
  { type: 'parallel', name: '并行', icon: 'share', color: '#909399' },
  { type: 'gateway', name: '网关', icon: 'connection', color: '#f56c6c' },
  { type: 'subprocess', name: '子流程', icon: 'folder', color: '#8b5cf6' },
  { type: 'end', name: '结束', icon: 'circle-check', color: '#67c23a' }
])

// 模拟工作流数据
const allWorkflows = ref<Workflow[]>([
  {
    id: 'workflow-1',
    name: '用户注册审核流程',
    description: '新用户注册后的审核工作流',
    version: '1.0.0',
    status: 'active',
    triggerType: 'event',
    nodes: [
      {
        id: 'start-1',
        name: '开始',
        type: 'start',
        description: '用户提交注册申请',
        position: { x: 100, y: 100 },
        size: { width: 120, height: 60 },
        config: {},
        inputPorts: [],
        outputPorts: [{ id: 'out-1', type: 'output', name: '下一步', position: 'right' }],
        status: 'pending'
      },
      {
        id: 'task-1',
        name: '信息验证',
        type: 'task',
        description: '验证用户提交的信息',
        position: { x: 300, y: 100 },
        size: { width: 140, height: 80 },
        config: {
          assignee: 'system',
          timeout: 30,
          autoComplete: true
        },
        inputPorts: [{ id: 'in-1', type: 'input', name: '输入', position: 'left' }],
        outputPorts: [
          { id: 'out-success', type: 'output', name: '验证通过', position: 'right' },
          { id: 'out-fail', type: 'output', name: '验证失败', position: 'bottom' }
        ],
        status: 'pending'
      }
    ],
    connections: [
      {
        id: 'conn-1',
        sourceNodeId: 'start-1',
        sourcePortId: 'out-1',
        targetNodeId: 'task-1',
        targetPortId: 'in-1'
      }
    ],
    variables: {
      userId: '',
      userInfo: {},
      approvalStatus: 'pending'
    },
    createdAt: new Date(),
    lastModified: new Date(),
    executionCount: 156,
    averageExecutionTime: 45000
  }
])

const executionLogs = ref<ExecutionLog[]>([])

// 计算属性
const filteredWorkflows = computed(() => {
  if (!searchKeyword.value) return allWorkflows.value

  return allWorkflows.value.filter(workflow =>
    workflow.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    workflow.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const activeWorkflows = computed(() => allWorkflows.value.filter(w => w.status === 'active'))
const completedWorkflows = computed(() => allWorkflows.value.filter(w => w.status === 'completed'))
const pendingWorkflows = computed(() => allWorkflows.value.filter(w => w.status === 'draft'))
const errorWorkflows = computed(() => allWorkflows.value.filter(w => w.status === 'error'))

const canvasStyle = computed(() => ({
  transform: `scale(${canvasZoom.value})`,
  transformOrigin: 'top left',
  width: `${canvasSize.value.width}px`,
  height: `${canvasSize.value.height}px`
}))

// 方法
const selectWorkflow = (workflow: Workflow) => {
  selectedWorkflow.value = workflow
  selectedNode.value = null
  selectedConnection.value = null
}

const selectNode = (node: WorkflowNode) => {
  selectedNode.value = node
  selectedConnection.value = null
}

const selectConnection = (connection: WorkflowConnection) => {
  selectedConnection.value = connection
  selectedNode.value = null
}

const createNewWorkflow = () => {
  const newWorkflow: Workflow = {
    id: `workflow-${Date.now()}`,
    name: '新工作流',
    description: '',
    version: '1.0.0',
    status: 'draft',
    triggerType: 'manual',
    nodes: [],
    connections: [],
    variables: {},
    createdAt: new Date(),
    lastModified: new Date(),
    executionCount: 0,
    averageExecutionTime: 0
  }

  allWorkflows.value.push(newWorkflow)
  selectedWorkflow.value = newWorkflow
  ElMessage.success('新工作流创建成功')
}

const validateWorkflow = async () => {
  if (!selectedWorkflow.value) return

  validating.value = true
  try {
    // 验证工作流完整性
    const errors = []

    // 检查是否有开始节点
    const startNodes = selectedWorkflow.value.nodes.filter(n => n.type === 'start')
    if (startNodes.length === 0) {
      errors.push('缺少开始节点')
    } else if (startNodes.length > 1) {
      errors.push('开始节点不能超过一个')
    }

    // 检查是否有结束节点
    const endNodes = selectedWorkflow.value.nodes.filter(n => n.type === 'end')
    if (endNodes.length === 0) {
      errors.push('缺少结束节点')
    }

    // 检查孤立节点
    const connectedNodes = new Set()
    selectedWorkflow.value.connections.forEach(conn => {
      connectedNodes.add(conn.sourceNodeId)
      connectedNodes.add(conn.targetNodeId)
    })

    const isolatedNodes = selectedWorkflow.value.nodes.filter(n =>
      n.type !== 'start' && n.type !== 'end' && !connectedNodes.has(n.id)
    )

    if (isolatedNodes.length > 0) {
      errors.push(`发现 ${isolatedNodes.length} 个孤立节点`)
    }

    if (errors.length > 0) {
      ElMessage.error(`工作流验证失败：${errors.join('、')}`)
    } else {
      ElMessage.success('工作流验证通过')
    }

  } finally {
    validating.value = false
  }
}

const simulateWorkflow = async () => {
  if (!selectedWorkflow.value) return

  simulating.value = true
  isMonitoring.value = true
  executionLogs.value = []

  try {
    // 模拟工作流执行
    const nodes = selectedWorkflow.value.nodes
    const startNode = nodes.find(n => n.type === 'start')

    if (startNode) {
      await simulateNodeExecution(startNode)
    }

    ElMessage.success('工作流模拟执行完成')
  } catch (error) {
    ElMessage.error('工作流模拟执行失败')
  } finally {
    simulating.value = false
  }
}

const simulateNodeExecution = async (node: WorkflowNode) => {
  executingNodes.value.push(node.id)

  // 添加执行日志
  executionLogs.value.push({
    id: `log-${Date.now()}`,
    nodeId: node.id,
    level: 'info',
    message: `开始执行节点: ${node.name}`,
    timestamp: new Date()
  })

  // 模拟执行时间
  await new Promise(resolve => setTimeout(resolve, 1000))

  executingNodes.value = executingNodes.value.filter(id => id !== node.id)

  executionLogs.value.push({
    id: `log-${Date.now()}`,
    nodeId: node.id,
    level: 'success',
    message: `节点执行完成: ${node.name}`,
    timestamp: new Date()
  })
}

const deployWorkflow = async () => {
  if (!selectedWorkflow.value) return

  deploying.value = true
  try {
    selectedWorkflow.value.status = 'active'
    selectedWorkflow.value.lastModified = new Date()

    ElMessage.success('工作流部署成功')

    // 发布部署事件
    eventBus.emit('workflow:deployed', {
      workflowId: selectedWorkflow.value.id,
      version: selectedWorkflow.value.version,
      deployedAt: new Date().toISOString()
    })

  } finally {
    deploying.value = false
  }
}

const handleNodeDrop = (event: DragEvent) => {
  event.preventDefault()

  const nodeTypeData = event.dataTransfer?.getData('application/json')
  if (nodeTypeData) {
    const nodeType = JSON.parse(nodeTypeData)
    addNodeToCanvas(nodeType, {
      x: event.offsetX / canvasZoom.value,
      y: event.offsetY / canvasZoom.value
    })
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleCanvasClick = (event: MouseEvent) => {
  // 点击空白区域时取消选择
  if (event.target === event.currentTarget) {
    selectedNode.value = null
    selectedConnection.value = null
  }
}

const addNodeToCanvas = (nodeType: any, position: { x: number; y: number }) => {
  if (!selectedWorkflow.value) return

  const newNode: WorkflowNode = {
    id: `node-${Date.now()}`,
    name: nodeType.name,
    type: nodeType.type,
    description: `${nodeType.name}节点`,
    position,
    size: { width: 120, height: 60 },
    config: {},
    inputPorts: nodeType.type !== 'start' ? [
      { id: `in-${Date.now()}`, type: 'input', name: '输入', position: 'left' }
    ] : [],
    outputPorts: nodeType.type !== 'end' ? [
      { id: `out-${Date.now()}`, type: 'output', name: '输出', position: 'right' }
    ] : [],
    status: 'pending'
  }

  selectedWorkflow.value.nodes.push(newNode)
  selectedNode.value = newNode

  ElMessage.success(`${nodeType.name}节点添加成功`)
}

const getNodeStyle = (node: WorkflowNode) => ({
  left: `${node.position.x}px`,
  top: `${node.position.y}px`,
  width: `${node.size.width}px`,
  height: `${node.size.height}px`
})

const getNodeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    start: 'video-play',
    task: 'document',
    decision: 'switch-button',
    parallel: 'share',
    gateway: 'connection',
    subprocess: 'folder',
    end: 'circle-check'
  }
  return iconMap[type] || 'setting'
}

const getNodeConnectors = (node: WorkflowNode) => {
  const connectors: Array<{id: string, type: string, position: any, style: any}> = []

  // 输入连接点
  node.inputPorts.forEach(port => {
    connectors.push({
      id: port.id,
      type: 'input',
      position: port.position,
      style: getConnectorStyle(port.position, node.size)
    })
  })

  // 输出连接点
  node.outputPorts.forEach(port => {
    connectors.push({
      id: port.id,
      type: 'output',
      position: port.position,
      style: getConnectorStyle(port.position, node.size)
    })
  })

  return connectors
}

const getConnectorStyle = (position: string, size: { width: number; height: number }) => {
  const offset = 6 // 连接点大小的一半

  switch (position) {
    case 'top':
      return { top: `-${offset}px`, left: `${size.width / 2 - offset}px` }
    case 'right':
      return { top: `${size.height / 2 - offset}px`, right: `-${offset}px` }
    case 'bottom':
      return { bottom: `-${offset}px`, left: `${size.width / 2 - offset}px` }
    case 'left':
      return { top: `${size.height / 2 - offset}px`, left: `-${offset}px` }
    default:
      return {}
  }
}

const getConnectionPath = (_connection: WorkflowConnection) => {
  // 计算连接线路径（简化版）
  return `M 100 100 Q 200 50 300 100`
}

const getStatusColor = (status: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' => {
  const colorMap: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = {
    draft: 'info',
    active: 'success',
    completed: 'primary',
    error: 'danger',
    suspended: 'warning'
  }
  return colorMap[status] || 'primary'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    draft: '草稿',
    active: '活跃',
    completed: '已完成',
    error: '错误',
    suspended: '已暂停'
  }
  return textMap[status] || status
}

const formatRelativeTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date))
}

const handleNodeDragStart = (nodeType: any, event: DragEvent) => {
  event.dataTransfer?.setData('application/json', JSON.stringify(nodeType))
}

const zoomIn = () => {
  canvasZoom.value = Math.min(canvasZoom.value * 1.2, 3)
}

const zoomOut = () => {
  canvasZoom.value = Math.max(canvasZoom.value / 1.2, 0.1)
}

const resetZoom = () => {
  canvasZoom.value = 1
}

const fitToScreen = () => {
  // 自适应屏幕大小
  canvasZoom.value = 0.8
}

const toggleGrid = () => {
  showGrid.value = !showGrid.value
}

const stopMonitoring = () => {
  isMonitoring.value = false
  executingNodes.value = []
  executingConnections.value = []
}

const editNode = (node: WorkflowNode) => {
  selectedNode.value = node
}

const deleteNode = async (node: WorkflowNode) => {
  if (!selectedWorkflow.value) return

  try {
    await ElMessageBox.confirm(
      `确定要删除节点"${node.name}"吗？`,
      '确认删除',
      { type: 'warning' }
    )

    const index = selectedWorkflow.value.nodes.findIndex(n => n.id === node.id)
    if (index > -1) {
      selectedWorkflow.value.nodes.splice(index, 1)

      // 删除相关连接
      selectedWorkflow.value.connections = selectedWorkflow.value.connections.filter(
        conn => conn.sourceNodeId !== node.id && conn.targetNodeId !== node.id
      )

      if (selectedNode.value?.id === node.id) {
        selectedNode.value = null
      }

      ElMessage.success('节点删除成功')
    }
  } catch {
    // 用户取消
  }
}

const startNodeDrag = (_node: WorkflowNode, event: MouseEvent) => {
  // 实现节点拖拽逻辑
  event.stopPropagation()
}

const startConnection = (_node: WorkflowNode, _connector: any, event: MouseEvent) => {
  // 实现连接线拖拽逻辑
  event.stopPropagation()
  draggingConnection.value = true
}

const importWorkflow = () => {
  ElMessage.info('工作流导入功能正在开发中')
}

const exportWorkflow = () => {
  if (!selectedWorkflow.value) {
    ElMessage.warning('请先选择要导出的工作流')
    return
  }

  const workflowData = JSON.stringify(selectedWorkflow.value, null, 2)
  const blob = new Blob([workflowData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `workflow-${selectedWorkflow.value.name}-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('工作流导出成功')
}

// 生命周期
onMounted(() => {
  // 初始化第一个工作流
  if (allWorkflows.value.length > 0) {
    selectedWorkflow.value = allWorkflows.value[0] || null
  } else {
    selectedWorkflow.value = null
  }
})

onUnmounted(() => {
  stopMonitoring()
})
</script>

<style scoped>
.workflow-engine {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.workflow-header {
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
}

.workflow-stats {
  display: flex;
  gap: 8px;
}

.workflow-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.workflow-sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.workflow-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.workflow-item {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.workflow-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.workflow-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.workflow-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.workflow-name {
  font-weight: 500;
  color: #303133;
}

.workflow-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.workflow-canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.canvas-toolbar {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: auto;
  background: #fafbfc;
}

.workflow-canvas-area {
  position: relative;
  min-width: 100%;
  min-height: 100%;
  background: white;
}

.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(to right, #e4e7ed 1px, transparent 1px),
    linear-gradient(to bottom, #e4e7ed 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

.workflow-node {
  position: absolute;
  background: white;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}

.workflow-node:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.15);
}

.workflow-node.selected {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.workflow-node.executing {
  border-color: #67c23a;
  animation: pulse 1s infinite;
}

.workflow-node.error {
  border-color: #f56c6c;
  background: #fef0f0;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(103, 194, 58, 0); }
  100% { box-shadow: 0 0 0 0 rgba(103, 194, 58, 0); }
}

.node-header {
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-title {
  flex: 1;
  font-weight: 500;
  font-size: 12px;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.workflow-node:hover .node-actions {
  opacity: 1;
}

.node-body {
  padding: 8px 12px;
}

.node-description {
  font-size: 11px;
  color: #606266;
  margin-bottom: 4px;
}

.node-config {
  font-size: 10px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.config-key {
  color: #909399;
}

.config-value {
  color: #303133;
  font-weight: 500;
}

.node-connectors {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.connector {
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid #409eff;
  background: white;
  border-radius: 50%;
  pointer-events: all;
  cursor: crosshair;
  opacity: 0;
  transition: opacity 0.2s;
}

.workflow-node:hover .connector {
  opacity: 1;
}

.connector.input {
  border-color: #67c23a;
}

.connector.output {
  border-color: #409eff;
}

.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.connection-path {
  fill: none;
  stroke: #409eff;
  stroke-width: 2;
  pointer-events: stroke;
  cursor: pointer;
}

.connection-path:hover {
  stroke: #66b1ff;
  stroke-width: 3;
}

.connection-path.active {
  stroke: #409eff;
  stroke-width: 3;
}

.connection-path.executing {
  stroke: #67c23a;
  stroke-width: 3;
  animation: dash 2s linear infinite;
  stroke-dasharray: 10 5;
}

@keyframes dash {
  to {
    stroke-dashoffset: -15;
  }
}

.drag-connection-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 2;
}

.drag-connection-path {
  fill: none;
  stroke: #409eff;
  stroke-width: 2;
  opacity: 0.6;
}

.workflow-properties {
  width: 300px;
  background: white;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.properties-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.properties-header h4 {
  margin: 0;
  color: #303133;
}

.properties-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.node-palette {
  position: fixed;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  width: 120px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.palette-header {
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
  text-align: center;
}

.palette-header h4 {
  margin: 0;
  font-size: 12px;
  color: #303133;
}

.palette-content {
  padding: 8px;
}

.palette-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 6px;
  cursor: grab;
  transition: all 0.2s;
  font-size: 11px;
  text-align: center;
}

.palette-node:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.palette-node:active {
  cursor: grabbing;
}

.execution-monitor {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  height: 200px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.monitor-header {
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.monitor-header h4 {
  margin: 0;
  font-size: 12px;
  color: #303133;
}

.execution-log {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.log-entry {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 2px;
  margin-bottom: 2px;
  display: flex;
  gap: 8px;
}

.log-entry.info {
  background: #f0f9ff;
  color: #1f2937;
}

.log-entry.success {
  background: #f0f9f0;
  color: #1f2937;
}

.log-entry.warning {
  background: #fef9e7;
  color: #1f2937;
}

.log-entry.error {
  background: #fef0f0;
  color: #1f2937;
}

.log-time {
  color: #909399;
  min-width: 60px;
}

.log-node {
  color: #409eff;
  min-width: 60px;
}

.log-message {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .workflow-properties {
    width: 250px;
  }

  .node-palette {
    display: none;
  }
}

@media (max-width: 768px) {
  .workflow-body {
    flex-direction: column;
  }

  .workflow-sidebar {
    width: 100%;
    height: 200px;
  }

  .workflow-properties {
    width: 100%;
    height: 200px;
  }
}
</style>
