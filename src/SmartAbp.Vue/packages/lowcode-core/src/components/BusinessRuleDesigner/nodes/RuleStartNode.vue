<template>
  <div class="start-node rule-node" :class="{ selected: data.selected }">
    <div class="node-header">
      <el-icon class="node-icon" color="#909399">
        <VideoPlay />
      </el-icon>
      <span class="node-title">{{ data.label || '开始' }}</span>
    </div>
    <div class="node-body">
      <div class="node-description">{{ data.description || '工作流起始节点' }}</div>
    </div>
    <Handle type="source" :position="Position.Right" :style="handleStyle" />
  </div>
</template>

<script setup lang="ts">
import { VideoPlay } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { ElIcon } from 'element-plus'
import { computed } from 'vue'
import type { RuleNodeData } from '../types'

interface Props {
  data: RuleNodeData
}

const props = defineProps<Props>()

const handleStyle = computed(() => ({
  width: '10px',
  height: '10px',
  background: '#909399',
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

.rule-node.selected {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.rule-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  border-bottom: 1px solid #dcdfe6;
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
}
</style>
