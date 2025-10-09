<template>
  <div class="action-node rule-node" :class="{ selected: data.selected, error: hasError }">
    <div class="node-header">
      <el-icon class="node-icon" color="#67c23a">
        <Setting />
      </el-icon>
      <span class="node-title">{{ data.label || '执行动作' }}</span>
      <el-tag v-if="data.actionType" type="success" size="small">
        {{ getActionTypeLabel(data.actionType) }}
      </el-tag>
    </div>
    <div class="node-body">
      <div class="node-description">{{ data.description || '执行业务操作' }}</div>

      <!-- SetFieldValue -->
      <div v-if="setFieldValueParams" class="action-params">
        <div class="param-item">
          <span class="param-label">字段:</span>
          <span class="param-value">{{ setFieldValueParams.field }}</span>
        </div>
        <div class="param-item">
          <span class="param-label">值:</span>
          <span class="param-value">{{ formatValue(setFieldValueParams.value) }}</span>
        </div>
      </div>

      <!-- ShowMessage -->
      <div v-else-if="showMessageParams" class="action-params">
        <div class="param-item">
          <span class="param-label">消息:</span>
          <span class="param-value">{{ showMessageParams.message }}</span>
        </div>
        <div class="param-item">
          <el-tag :type="getMessageTypeTag(showMessageParams.type)" size="small">
            {{ showMessageParams.type || 'info' }}
          </el-tag>
        </div>
      </div>

      <!-- CallAPI -->
      <div v-else-if="callAPIParams" class="action-params">
        <div class="param-item">
          <span class="param-label">API:</span>
          <code class="param-code">{{ callAPIParams.url }}</code>
        </div>
        <div class="param-item">
          <el-tag type="info" size="small">{{ callAPIParams.method || 'GET' }}</el-tag>
        </div>
      </div>

      <!-- ValidateField -->
      <div v-else-if="validateFieldParams" class="action-params">
        <div class="param-item">
          <span class="param-label">验证:</span>
          <span class="param-value">{{ validateFieldParams.field }}</span>
        </div>
        <div v-if="validateFieldParams.rules" class="param-item">
          <el-tag v-for="rule in validateFieldParams.rules" :key="rule" type="warning" size="small"
            style="margin-right: 4px">
            {{ rule }}
          </el-tag>
        </div>
      </div>

      <!-- 未配置 -->
      <div v-else class="node-warning">
        <el-icon>
          <InfoFilled />
        </el-icon>
        <span>请配置动作类型和参数</span>
      </div>
    </div>
    <Handle type="target" :position="Position.Left" :style="targetHandleStyle" />
    <Handle type="source" :position="Position.Right" :style="sourceHandleStyle" />
  </div>
</template>

<script setup lang="ts">
import { InfoFilled, Setting } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { ElIcon, ElTag } from 'element-plus'
import { computed } from 'vue'
import type { RuleNodeData, SetFieldValueParams, ShowMessageParams, CallAPIParams, ValidateFieldParams, ActionType } from './types'

interface Props {
  data: RuleNodeData
}

const props = defineProps<Props>()

const hasError = computed(() => {
  return !props.data.actionType
})

// 类型守卫计算属性
const setFieldValueParams = computed((): SetFieldValueParams | null => {
  if (props.data.actionType === 'SetFieldValue' && props.data.actionParams?.actionType === 'SetFieldValue') {
    return props.data.actionParams as SetFieldValueParams
  }
  return null
})

const showMessageParams = computed((): ShowMessageParams | null => {
  if (props.data.actionType === 'ShowMessage' && props.data.actionParams?.actionType === 'ShowMessage') {
    return props.data.actionParams as ShowMessageParams
  }
  return null
})

const callAPIParams = computed((): CallAPIParams | null => {
  if (props.data.actionType === 'CallAPI' && props.data.actionParams?.actionType === 'CallAPI') {
    return props.data.actionParams as CallAPIParams
  }
  return null
})

const validateFieldParams = computed((): ValidateFieldParams | null => {
  if (props.data.actionType === 'ValidateField' && props.data.actionParams?.actionType === 'ValidateField') {
    return props.data.actionParams as ValidateFieldParams
  }
  return null
})

const getActionTypeLabel = (type: ActionType): string => {
  const labels: Record<ActionType, string> = {
    SetFieldValue: '设置字段',
    ShowMessage: '显示消息',
    CallAPI: '调用API',
    ValidateField: '验证字段'
  }
  return labels[type] || type
}

const getMessageTypeTag = (type?: 'success' | 'warning' | 'info' | 'error'): 'success' | 'warning' | 'info' | 'danger' => {
  const tags = {
    info: 'info' as const,
    success: 'success' as const,
    warning: 'warning' as const,
    error: 'danger' as const
  }
  return type ? (tags[type] || 'info') : 'info'
}

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '(空)'
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

const targetHandleStyle = computed(() => ({
  width: '10px',
  height: '10px',
  background: '#67c23a',
  border: '2px solid #fff'
}))

const sourceHandleStyle = computed(() => ({
  width: '10px',
  height: '10px',
  background: '#67c23a',
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

.action-node.selected {
  border-color: #67c23a;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.action-node.error {
  border-color: #f56c6c;
  background: #fef0f0;
}

.rule-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e1f3f8 100%);
  border-bottom: 1px solid #b3e19d;
  border-radius: 6px 6px 0 0;
}

.node-icon {
  font-size: 18px;
}

.node-title {
  flex: 1;
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

.action-params {
  margin-top: 8px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 12px;
}

.param-item:last-child {
  margin-bottom: 0;
}

.param-label {
  font-weight: 500;
  color: #606266;
  min-width: 50px;
}

.param-value {
  color: #303133;
  flex: 1;
  word-break: break-all;
}

.param-code {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 11px;
  color: #67c23a;
  background: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  word-break: break-all;
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
</style>
