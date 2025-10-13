<template>
  <div
    class="end-node rule-node"
    :class="{ selected: data.selected }"
  >
    <div class="node-header">
      <el-icon
        class="node-icon"
        :style="{ color: '#f56c6c' }"
      >
        <VideoPause />
      </el-icon>
      <span class="node-title">{{ data.label || '结束' }}</span>
    </div>
    <div class="node-body">
      <div class="node-description">
        {{ data.description || '工作流结束节点' }}
      </div>
      <div
        v-if="isEndNodeData(data)"
        class="node-info"
      >
        <el-tag type="danger">
          返回: {{ data.returnValue }}
        </el-tag>
      </div>
    </div>
    <Handle
      type="target"
      :position="Position.Left"
      :style="handleStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { VideoPause } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { ElIcon, ElTag } from 'element-plus'
import { computed } from 'vue'
import type { RuleNodeData } from './types'
import { isRuleEndNodeData as isEndNodeData } from '@smartabp/lowcode-core/src/types/business-rule'

interface Props {
  data: RuleNodeData
}

// 使用 defineProps 以启用TS校验，但不强制赋值到局部常量，避免未使用告警
defineProps<Props>()

const handleStyle = computed(() => ({
  width: '10px',
  height: '10px',
  background: '#f56c6c',
  border: '2px solid #fff'
}))
</script>

<style scoped>
.rule-node {
  min-width: 180px;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.end-node.selected {
  border-color: #f56c6c;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.rule-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  border-bottom: 1px solid #fab6b6;
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

.node-info {
  margin-top: 8px;
}
</style>
