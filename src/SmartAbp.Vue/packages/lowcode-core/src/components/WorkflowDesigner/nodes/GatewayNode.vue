<template>
  <div
    class="bpmn-node gateway-node"
    :class="{ selected: isSelected }"
  >
    <Handle
      type="target"
      :position="Position.Top"
    />
    <div class="node-content">
      <div class="node-icon">
        <el-icon :size="20">
          <Operation />
        </el-icon>
      </div>
      <div class="node-label">
        {{ data.label || '决策' }}
      </div>
      <div
        v-if="data.gatewayType"
        class="gateway-type"
      >
        {{ getGatewayTypeLabel(data.gatewayType) }}
      </div>
    </div>
    <Handle
      id="default"
      type="source"
      :position="Position.Bottom"
    />
    <Handle
      id="true"
      type="source"
      :position="Position.Right"
      style="top: 50%"
    />
    <Handle
      id="false"
      type="source"
      :position="Position.Left"
      style="top: 50%"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { ElIcon } from 'element-plus'
import { Operation } from '@element-plus/icons-vue'

interface Props {
  data: {
    label?: string
    gatewayType?: 'exclusive' | 'parallel' | 'inclusive'
    [key: string]: any
  }
  selected?: boolean
}

const props = defineProps<Props>()
const isSelected = computed(() => props.selected)

const getGatewayTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    exclusive: 'XOR',
    parallel: 'AND',
    inclusive: 'OR'
  }
  return labels[type] || 'XOR'
}
</script>

<style scoped>
.gateway-node {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
  transform: rotate(45deg);
  min-width: 80px;
  min-height: 80px;
}

.node-content {
  transform: rotate(-45deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gateway-type {
  font-size: 10px;
  font-weight: bold;
  margin-top: 2px;
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 6px;
  border-radius: 10px;
}
</style>

