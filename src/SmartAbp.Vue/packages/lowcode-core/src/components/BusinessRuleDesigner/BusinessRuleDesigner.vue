<template>
  <div class="business-rule-designer">
    <!-- 顶部工具栏 -->
    <div class="designer-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" size="small" @click="addNode('condition')">
          <el-icon>
            <Plus />
          </el-icon>
          添加条件
        </el-button>
        <el-button type="success" size="small" @click="addNode('action')">
          <el-icon>
            <Setting />
          </el-icon>
          添加动作
        </el-button>
        <el-button size="small" @click="validateRules">
          <el-icon>
            <Check />
          </el-icon>
          验证规则
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-button size="small" @click="saveRules">
          <el-icon>
            <Document />
          </el-icon>
          保存
        </el-button>
        <el-button size="small" @click="exportRules">
          <el-icon>
            <Download />
          </el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- Vue Flow 画布 -->
    <div class="designer-canvas">
      <VueFlow v-model:nodes="nodes" v-model:edges="edges" :default-viewport="{ zoom: 1.5 }" :min-zoom="0.2"
        :max-zoom="4" fit-view-on-init @node-click="onNodeClick" @edge-click="onEdgeClick" @pane-click="onPaneClick">
        <!-- 背景网格 -->
        <Background pattern-color="#aaa" :gap="16" />

        <!-- 控制器 -->
        <Controls />

        <!-- 小地图（暂不启用，避免外部依赖未安装导致类型错误） -->
      </VueFlow>
    </div>

    <!-- 状态栏 -->
    <div class="designer-statusbar">
      <span>节点数: {{ nodes.length }}</span>
      <span>连接数: {{ edges.length }}</span>
      <span v-if="selectedNodeId">已选择: {{ getSelectedNodeLabel() }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Document, Download, Plus, Setting } from '@element-plus/icons-vue'
import { getGlobalLogger } from '@smartabp/lowcode-shared'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { VueFlow } from '@vue-flow/core'
import { ElButton, ElIcon, ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
// import { useEnhancedStateMachineStore } from '../../stores/enhancedStateMachine' // 未使用，保留以备将来使用
import type { RuleEdge, RuleNode, RuleNodeData, RuleNodeType } from './types'

const logger = getGlobalLogger()

// Vue Flow 实例
// 使用 v-model 双向绑定 nodes/edges，避免直接绑定事件签名不匹配

// Store
// const stateMachineStore = useEnhancedStateMachineStore() // 未使用，保留以备将来使用

// 状态
const nodes = ref<RuleNode[]>([])
const edges = ref<RuleEdge[]>([])
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)
const nodeIdCounter = ref(0)

/**
 * 添加节点
 */
const addNode = (type: RuleNodeType) => {
  const id = `node-${++nodeIdCounter.value}`

  // 创建节点数据
  const nodeData: RuleNodeData = {
    label: getNodeLabel(type),
    type,
    description: `${getNodeLabel(type)}节点`
  }

  // 创建节点
  const newNode: RuleNode = {
    id,
    type,
    position: getNextNodePosition(),
    data: nodeData,
    style: {
      width: '180px',
      border: `2px solid ${getNodeColor(type)}`,
      borderRadius: '8px',
      padding: '10px',
      backgroundColor: '#fff'
    }
  }

  nodes.value.push(newNode)
  logger.info('✅ 添加节点', { id, type })
}

/**
 * 获取节点标签
 */
const getNodeLabel = (type: RuleNodeType): string => {
  const labels: Record<RuleNodeType, string> = {
    condition: '条件判断',
    action: '执行动作',
    decision: '分支决策',
    start: '开始',
    end: '结束'
  }
  return labels[type] || '未知节点'
}

/**
 * 获取节点颜色
 */
const getNodeColor = (type: RuleNodeType): string => {
  const colors: Record<RuleNodeType, string> = {
    condition: '#409eff',
    action: '#67c23a',
    decision: '#e6a23c',
    start: '#909399',
    end: '#f56c6c'
  }
  return colors[type] || '#909399'
}

/**
 * 获取下一个节点位置
 */
const getNextNodePosition = () => {
  const baseX = 100
  const baseY = 100
  const offsetX = 250
  const offsetY = 150

  const count = nodes.value.length
  const row = Math.floor(count / 3)
  const col = count % 3

  return {
    x: baseX + col * offsetX,
    y: baseY + row * offsetY
  }
}

/**
 * 节点点击事件
 */
const onNodeClick = (event: any) => {
  const nodeId = event.node?.id
  if (nodeId) {
    selectedNodeId.value = nodeId
    selectedEdgeId.value = null
    logger.debug('🔍 选择节点', { nodeId })
  }
}

/**
 * 边点击事件
 */
const onEdgeClick = (event: any) => {
  const edgeId = event.edge?.id
  if (edgeId) {
    selectedEdgeId.value = edgeId
    selectedNodeId.value = null
    logger.debug('🔍 选择连线', { edgeId })
  }
}

/**
 * 画布点击事件
 */
const onPaneClick = () => {
  selectedNodeId.value = null
  selectedEdgeId.value = null
}

/**
 * 获取选中节点标签
 */
const getSelectedNodeLabel = (): string => {
  if (!selectedNodeId.value) return ''
  const node = nodes.value.find(n => n.id === selectedNodeId.value)
  return node?.data.label || ''
}

/**
 * 验证规则
 */
const validateRules = () => {
  const errors: string[] = []

  // 检查是否有节点
  if (nodes.value.length === 0) {
    errors.push('至少需要一个节点')
  }

  // 检查开始节点
  const startNodes = nodes.value.filter(n => n.type === 'start')
  if (startNodes.length === 0) {
    errors.push('缺少开始节点')
  } else if (startNodes.length > 1) {
    errors.push('只能有一个开始节点')
  }

  // 检查结束节点
  const endNodes = nodes.value.filter(n => n.type === 'end')
  if (endNodes.length === 0) {
    errors.push('缺少结束节点')
  }

  // 检查孤立节点
  const connectedNodeIds = new Set<string>()
  edges.value.forEach(edge => {
    connectedNodeIds.add(edge.source)
    connectedNodeIds.add(edge.target)
  })

  nodes.value.forEach(node => {
    if (!connectedNodeIds.has(node.id) && nodes.value.length > 1) {
      errors.push(`节点 "${node.data.label}" 未连接`)
    }
  })

  if (errors.length === 0) {
    ElMessage.success('✅ 规则验证通过！')
  } else {
    ElMessage.error({
      message: `❌ 验证失败：${errors.join('；')}`,
      duration: 5000
    })
  }

  logger.info('🔍 规则验证', { errors })
}

/**
 * 保存规则
 */
const saveRules = () => {
  try {
    // 同步到Store
    // TODO: 转换为enhancedStateMachine格式
    logger.info('💾 保存规则', {
      nodeCount: nodes.value.length,
      edgeCount: edges.value.length
    })

    ElMessage.success('✅ 规则已保存！')
  } catch (error) {
    logger.error('❌ 保存失败', error)
    ElMessage.error('保存失败')
  }
}

/**
 * 导出规则
 */
const exportRules = () => {
  try {
    const data = {
      nodes: nodes.value,
      edges: edges.value,
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString()
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `business-rules-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    logger.info('📥 导出规则', { nodeCount: nodes.value.length })
    ElMessage.success('✅ 规则已导出！')
  } catch (error) {
    logger.error('❌ 导出失败', error)
    ElMessage.error('导出失败')
  }
}

/**
 * 初始化
 */
onMounted(() => {
  logger.info('🚀 业务规则设计器已加载')

  // 添加默认的开始和结束节点
  addNode('start')
  addNode('end')
})
</script>

<style scoped>
.business-rule-designer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f7fa;
}

.designer-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 8px;
}

.designer-canvas {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.designer-statusbar {
  display: flex;
  gap: 20px;
  padding: 8px 16px;
  background-color: #fff;
  border-top: 1px solid #dcdfe6;
  font-size: 12px;
  color: #606266;
}

/* Vue Flow 样式覆盖 */
:deep(.vue-flow__node) {
  cursor: pointer;
  transition: all 0.2s;
}

:deep(.vue-flow__node:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

:deep(.vue-flow__node.selected) {
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.3);
}

:deep(.vue-flow__edge) {
  cursor: pointer;
}

:deep(.vue-flow__edge.selected path) {
  stroke: #409eff;
  stroke-width: 2;
}
</style>
