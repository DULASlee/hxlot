<template>
  <div class="condition-node rule-node" :class="{ selected: data.selected, error: hasError }">
    <div class="node-header">
      <el-icon class="node-icon" color="#409eff">
        <Share />
      </el-icon>
      <span class="node-title">{{ data.label || '条件判断' }}</span>
      <el-icon v-if="hasError" class="error-icon" color="#f56c6c">
        <Warning />
      </el-icon>
    </div>
    <div class="node-body">
      <div class="node-description">{{ data.description || '根据条件分支执行' }}</div>
      <div v-if="data.expression" class="node-expression">
        <div class="expression-label">条件表达式:</div>
        <code class="expression-code">{{ formatExpression(data.expression) }}</code>
      </div>
      <div v-else class="node-warning">
        <el-icon>
          <InfoFilled />
        </el-icon>
        <span>请配置条件表达式</span>
      </div>
    </div>
    <Handle type="target" :position="Position.Left" :style="targetHandleStyle" />
    <Handle id="true" type="source" :position="Position.Right" :style="trueHandleStyle">
      <div class="handle-label handle-label-true">True</div>
    </Handle>
    <Handle id="false" type="source" :position="Position.Bottom" :style="falseHandleStyle">
      <div class="handle-label handle-label-false">False</div>
    </Handle>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled, Share, Warning } from '@element-plus/icons-vue'
import { Handle, Position } from '@vue-flow/core'
import { ElIcon } from 'element-plus'
import { computed } from 'vue'
import type { RuleNodeData } from '../types'

interface Props {
  data: RuleNodeData
}

const props = defineProps<Props>()

const hasError = computed(() => {
  return !props.data.expression || props.data.expression.trim() === ''
})

const formatExpression = (expr: string | undefined): string => {
  if (!expr) return ''
  return expr.length > 50 ? expr.substring(0, 47) + '...' : expr
}

const targetHandleStyle = computed(() => ({
  width: '10px',
  height: '10px',
  background: '#409eff',
  border: '2px solid #fff'
}))

const trueHandleStyle = computed(() => ({
  width: '10px',
  height: '10px',
  background: '#67c23a',
  border: '2px solid #fff',
  top: '40%'
}))

const falseHandleStyle = computed(() => ({
  width: '10px',
  height: '10px',
  background: '#e6a23c',
  border: '2px solid #fff'
}))
</script>

<style scoped>
.rule-node {
  min-width: 200px;
  max-width: 300px;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.condition-node.selected {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.condition-node.error {
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
  background: linear-gradient(135deg, #ecf5ff 0%, #d9ecff 100%);
  border-bottom: 1px solid #b3d8ff;
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

.error-icon {
  font-size: 16px;
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

.node-expression {
  margin-top: 8px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.expression-label {
  font-size: 11px;
  color: #606266;
  margin-bottom: 4px;
}

.expression-code {
  display: block;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 11px;
  color: #409eff;
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
  position: absolute;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
}

.handle-label-true {
  right: -45px;
  top: 50%;
  transform: translateY(-50%);
  background: #67c23a;
  color: #fff;
}

.handle-label-false {
  left: 50%;
  bottom: -22px;
  transform: translateX(-50%);
  background: #e6a23c;
  color: #fff;
}
</style>
