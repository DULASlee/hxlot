<template>
  <div
    class="bpmn-node start-node"
    :class="{ selected: isSelected }"
  >
    <div class="node-icon">
      <el-icon :size="24">
        <VideoPlay />
      </el-icon>
    </div>
    <div class="node-label">
      {{ data.label || '开始' }}
    </div>
    <Handle
      type="source"
      :position="Position.Bottom"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { ElIcon } from 'element-plus'
import { VideoPlay } from '@element-plus/icons-vue'

interface Props {
  data: {
    label?: string
    [key: string]: any
  }
  selected?: boolean
}

const props = defineProps<Props>()
const isSelected = computed(() => props.selected)
</script>

<style scoped>
.bpmn-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  min-height: 80px;
  border-radius: 50%;
  background: #67c23a;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  cursor: pointer;
}

.bpmn-node:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.bpmn-node.selected {
  box-shadow: 0 0 0 3px #409eff;
}

.start-node {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.node-label {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  max-width: 70px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

