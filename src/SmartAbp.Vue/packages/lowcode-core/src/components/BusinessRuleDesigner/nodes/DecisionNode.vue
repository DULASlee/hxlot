<template>
  <div
    class="decision-node rule-node"
    :class="{ selected: data.selected }"
  >
    <div class="node-header">
      <el-icon
        class="node-icon"
        color="#e6a23c"
      >
        <Operation />
      </el-icon>
      <span class="node-title">{{ data.label || '多路分支' }}</span>
    </div>
    <div class="node-body">
      <div class="node-description">
        {{ data.description || '多条件分支决策' }}
      </div>
      <div
        v-if="data.branches && data.branches.length > 0"
        class="branches-list"
      >
        <div
          v-for="(branch, index) in data.branches"
          :key="index"
          class="branch-item"
        >
          <div class="branch-label">
            分支 {{ index + 1 }}
          </div>
          <code class="branch-condition">{{ formatCondition(branch.condition) }}</code>
        </div>
      </div>
      <div
        v-else
        class="node-warning"
      >
        <el-icon>
          <InfoFilled />
        </el-icon>
        <span>请配置分支条件</span>
      </div>
    </div>
    <Handle
      type="target"
      :position="Position.Left"
      :style="targetHandleStyle"
    />
    <Handle
      v-for="(branch, index) in visibleBranches"
      :id="`branch-${index}`"
      :key="index"
      type="source"
      :position="getBranchPosition(index)"
      :style="getBranchHandleStyle(index)"
    >
      <div
        class="handle-label"
        :style="getHandleLabelStyle(index)"
      >
        {{ branch.label || `分支${index + 1}` }}
      </div>
    </Handle>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled, Operation } from '@element-plus/icons-vue'
import type { RuleNodeData } from '@smartabp/lowcode-core'
import { Handle, Position } from '@vue-flow/core'
import { ElIcon } from 'element-plus'
import { computed } from 'vue'

interface Branch {
  label?: string
  condition: string
}

interface Props {
  data: RuleNodeData & {
    branches?: Branch[]
  }
}

const props = defineProps<Props>()

const visibleBranches = computed(() => {
  if (!props.data.branches || props.data.branches.length === 0) {
    return [
      { label: '默认', condition: 'true' }
    ]
  }
  return props.data.branches
})

const formatCondition = (condition: string): string => {
  if (!condition) return '(空)'
  return condition.length > 30 ? condition.substring(0, 27) + '...' : condition
}

const getBranchPosition = (index: number): Position => {
  const count = visibleBranches.value.length
  if (count <= 2) {
    return index === 0 ? Position.Right : Position.Bottom
  }
  const positions: Position[] = [Position.Right, Position.Bottom, Position.Left]
  return positions[index % 3] || Position.Right
}

const getBranchHandleStyle = (index: number) => {
  const colors = ['#67c23a', '#e6a23c', '#409eff', '#f56c6c']
  return {
    width: '10px',
    height: '10px',
    background: colors[index % colors.length],
    border: '2px solid #fff'
  }
}

const getHandleLabelStyle = (index: number) => {
  const position = getBranchPosition(index)
  const baseStyle: Record<string, string> = {
    position: 'absolute',
    fontSize: '10px',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none'
  }

  switch (position) {
    case Position.Right:
      return { ...baseStyle, right: '-60px', top: '50%', transform: 'translateY(-50%)' }
    case Position.Bottom:
      return { ...baseStyle, left: '50%', bottom: '-22px', transform: 'translateX(-50%)' }
    case Position.Left:
      return { ...baseStyle, left: '-60px', top: '50%', transform: 'translateY(-50%)' }
    default:
      return baseStyle
  }
}

const targetHandleStyle = computed(() => ({
  width: '10px',
  height: '10px',
  background: '#e6a23c',
  border: '2px solid #fff'
}))
</script>

<style scoped>
.rule-node {
  min-width: 220px;
  max-width: 320px;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.decision-node.selected {
  border-color: #e6a23c;
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.3);
}

.rule-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #fdf6ec 0%, #faecd8 100%);
  border-bottom: 1px solid #f5dab1;
  border-radius: 6px 6px 0 0;
}

.node-icon {
  font-size: 18px;
}

.node-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.node-body {
  padding: 12px;
}

.node-description {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-bottom: 8px;
}

.branches-list {
  margin-top: 8px;
}

.branch-item {
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 6px;
}

.branch-item:last-child {
  margin-bottom: 0;
}

.branch-label {
  font-size: 11px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 4px;
}

.branch-condition {
  display: block;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 11px;
  color: #e6a23c;
  word-break: break-all;
  line-height: 1.4;
}

.node-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  background: #fff3e0;
  border: 1px dashed #e6a23c;
  border-radius: 4px;
  font-size: 12px;
  color: #e6a23c;
}

.handle-label {
  background: #e6a23c;
  color: #fff;
}
</style>
