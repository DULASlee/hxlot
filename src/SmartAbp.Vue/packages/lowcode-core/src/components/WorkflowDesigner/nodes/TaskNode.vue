<template>
  <div class="bpmn-node task-node" :class="{ selected: isSelected }">
    <Handle type="target" :position="Position.Top" />
    <div class="node-icon">
      <el-icon :size="20"><Document /></el-icon>
    </div>
    <div class="node-label">{{ data.label || '任务' }}</div>
    <div class="node-status" v-if="data.status" :class="`status-${data.status}`">
      <el-icon :size="12">
        <component :is="getStatusIcon(data.status)" />
      </el-icon>
    </div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { ElIcon } from 'element-plus'
import { Document, Check, Loading, Close } from '@element-plus/icons-vue'

interface Props {
  data: {
    label?: string
    status?: 'pending' | 'running' | 'completed' | 'failed'
    [key: string]: any
  }
  selected?: boolean
}

const props = defineProps<Props>()
const isSelected = computed(() => props.selected)

const getStatusIcon = (status: string) => {
  const icons: Record<string, any> = {
    pending: Loading,
    running: Loading,
    completed: Check,
    failed: Close
  }
  return icons[status] || Check
}
</script>

<style scoped>
.task-node {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border-radius: 8px;
  min-width: 120px;
  min-height: 60px;
  padding: 12px;
}

.node-status {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.3);
}

.status-pending {
  background: rgba(230, 162, 60, 0.9);
}

.status-running {
  background: rgba(64, 158, 255, 0.9);
  animation: pulse 1.5s infinite;
}

.status-completed {
  background: rgba(103, 194, 58, 0.9);
}

.status-failed {
  background: rgba(245, 108, 108, 0.9);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
</style>

