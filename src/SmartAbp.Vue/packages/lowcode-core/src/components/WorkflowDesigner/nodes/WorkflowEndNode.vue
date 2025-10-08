<template>
  <div class="bpmn-node end-node" :class="{ selected: isSelected }">
    <Handle type="target" :position="Position.Top" />
    <div class="node-icon">
      <el-icon :size="24"><CircleCheck /></el-icon>
    </div>
    <div class="node-label">{{ data.label || '结束' }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { ElIcon } from 'element-plus'
import { CircleCheck } from '@element-plus/icons-vue'

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
.end-node {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  border: 3px solid #fff;
}
</style>

