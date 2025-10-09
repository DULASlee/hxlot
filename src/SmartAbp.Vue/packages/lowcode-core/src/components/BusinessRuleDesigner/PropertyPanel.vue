<template>
  <div class="property-panel">
    <!-- 面板标题 -->
    <div class="panel-header">
      <el-icon>
        <Setting />
      </el-icon>
      <span>属性配置</span>
    </div>

    <!-- 无选中节点提示 -->
    <div
      v-if="!selectedNode"
      class="panel-empty"
    >
      <el-empty description="请选择一个节点进行配置" />
    </div>

    <!-- 节点属性表单 -->
    <div
      v-else
      class="panel-content"
    >
      <!-- 基础信息 -->
      <div class="property-section">
        <div class="section-title">
          基础信息
        </div>
        <el-form
          label-position="top"
          size="small"
        >
          <el-form-item label="节点ID">
            <el-input
              v-model="selectedNode.id"
              disabled
            />
          </el-form-item>
          <el-form-item label="节点标签">
            <el-input
              v-model="selectedNode.data.label"
              placeholder="请输入节点标签"
              @input="onPropertyChange"
            />
          </el-form-item>
          <el-form-item label="节点类型">
            <el-tag :type="(getNodeTypeTagType(selectedNode.type) as any)">
              {{ getNodeTypeLabel(selectedNode.type) }}
            </el-tag>
          </el-form-item>
          <el-form-item label="节点描述">
            <el-input
              v-model="selectedNode.data.description"
              type="textarea"
              :rows="2"
              placeholder="请输入节点描述"
              @input="onPropertyChange"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 条件节点特有配置 -->
      <div
        v-if="selectedNode.type === 'condition'"
        class="property-section"
      >
        <div class="section-title">
          条件配置
        </div>
        <el-form
          label-position="top"
          size="small"
        >
          <el-form-item label="条件表达式">
            <el-input
              v-model="selectedNode.data.expression"
              type="textarea"
              :rows="3"
              placeholder="例如: entity.status == 'approved'"
              @input="onPropertyChange"
            />
            <div class="form-item-tip">
              支持JavaScript表达式，可使用entity、user等上下文变量
            </div>
          </el-form-item>
        </el-form>
      </div>

      <!-- 动作节点特有配置 -->
      <div
        v-if="selectedNode.type === 'action'"
        class="property-section"
      >
        <div class="section-title">
          动作配置
        </div>
        <el-form
          label-position="top"
          size="small"
        >
          <el-form-item label="动作类型">
            <el-select
              v-model="selectedNode.data.actionType"
              placeholder="选择动作类型"
              @change="onActionTypeChange"
            >
              <el-option
                label="设置字段值"
                value="SetFieldValue"
              />
              <el-option
                label="显示消息"
                value="ShowMessage"
              />
              <el-option
                label="调用API"
                value="CallAPI"
              />
              <el-option
                label="验证字段"
                value="ValidateField"
              />
            </el-select>
          </el-form-item>

          <!-- SetFieldValue 参数 -->
          <template v-if="selectedNode.data.actionType === 'SetFieldValue'">
            <el-form-item label="字段名">
              <el-input
                v-model="actionParams.field"
                placeholder="例如: status"
                @input="onPropertyChange"
              />
            </el-form-item>
            <el-form-item label="字段值">
              <el-input
                v-model="actionParams.value"
                placeholder="例如: approved"
                @input="onPropertyChange"
              />
            </el-form-item>
          </template>

          <!-- ShowMessage 参数 -->
          <template v-if="selectedNode.data.actionType === 'ShowMessage'">
            <el-form-item label="消息内容">
              <el-input
                v-model="actionParams.message"
                type="textarea"
                :rows="2"
                placeholder="请输入消息内容"
                @input="onPropertyChange"
              />
            </el-form-item>
            <el-form-item label="消息类型">
              <el-select
                v-model="actionParams.type"
                @change="onPropertyChange"
              >
                <el-option
                  label="信息"
                  value="info"
                />
                <el-option
                  label="成功"
                  value="success"
                />
                <el-option
                  label="警告"
                  value="warning"
                />
                <el-option
                  label="错误"
                  value="error"
                />
              </el-select>
            </el-form-item>
          </template>

          <!-- CallAPI 参数 -->
          <template v-if="selectedNode.data.actionType === 'CallAPI'">
            <el-form-item label="API地址">
              <el-input
                v-model="actionParams.url"
                placeholder="/api/..."
                @input="onPropertyChange"
              />
            </el-form-item>
            <el-form-item label="请求方法">
              <el-select
                v-model="actionParams.method"
                @change="onPropertyChange"
              >
                <el-option
                  label="GET"
                  value="GET"
                />
                <el-option
                  label="POST"
                  value="POST"
                />
                <el-option
                  label="PUT"
                  value="PUT"
                />
                <el-option
                  label="DELETE"
                  value="DELETE"
                />
              </el-select>
            </el-form-item>
          </template>

          <!-- ValidateField 参数 -->
          <template v-if="selectedNode.data.actionType === 'ValidateField'">
            <el-form-item label="验证字段">
              <el-input
                v-model="actionParams.field"
                placeholder="例如: email"
                @input="onPropertyChange"
              />
            </el-form-item>
            <el-form-item label="验证规则">
              <el-checkbox-group
                v-model="actionParams.rules"
                @change="onPropertyChange"
              >
                <el-checkbox label="required">
                  必填
                </el-checkbox>
                <el-checkbox label="email">
                  邮箱格式
                </el-checkbox>
                <el-checkbox label="min:6">
                  最小长度6
                </el-checkbox>
                <el-checkbox label="max:50">
                  最大长度50
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </template>
        </el-form>
      </div>

      <!-- 决策节点特有配置 -->
      <div
        v-if="selectedNode.type === 'decision'"
        class="property-section"
      >
        <div class="section-title">
          分支配置
        </div>
        <el-form
          label-position="top"
          size="small"
        >
          <div class="form-item-tip">
            多路分支决策功能待实现...
          </div>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="panel-actions">
        <el-button
          type="primary"
          size="small"
          @click="saveProperties"
        >
          <el-icon>
            <Check />
          </el-icon>
          保存
        </el-button>
        <el-button
          size="small"
          @click="resetProperties"
        >
          <el-icon>
            <RefreshLeft />
          </el-icon>
          重置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, RefreshLeft, Setting } from '@element-plus/icons-vue'
import { getGlobalLogger } from '@smartabp/lowcode-shared'
import {
  ElButton,
  ElCheckbox,
  ElCheckboxGroup,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElIcon,
  ElInput,
  ElMessage,
  ElOption,
  ElSelect,
  ElTag
} from 'element-plus'
import { ref, watch } from 'vue'
import type { ActionParams, RuleNode, RuleNodeType } from './types'

const logger = getGlobalLogger()

// Props
const props = defineProps<{
  selectedNode: RuleNode | null
}>()

// Emits
const emit = defineEmits<{
  (e: 'update-node', node: RuleNode): void
}>()

// 动作参数（响应式绑定）
const actionParams = ref<Record<string, any>>({})

// 监听选中节点变化
watch(
  () => props.selectedNode,
  (newNode) => {
    if (newNode?.data.actionParams) {
      actionParams.value = { ...newNode.data.actionParams }
    } else {
      actionParams.value = {}
    }
  },
  { immediate: true }
)

/**
 * 获取节点类型标签
 */
const getNodeTypeLabel = (type: RuleNodeType): string => {
  const labels: Record<RuleNodeType, string> = {
    start: '开始节点',
    end: '结束节点',
    condition: '条件节点',
    action: '动作节点',
    decision: '决策节点'
  }
  return labels[type] || '未知'
}

/**
 * 获取节点类型标签样式
 */
const getNodeTypeTagType = (type: RuleNodeType): string => {
  const types: Record<RuleNodeType, string> = {
    start: 'info',
    end: 'danger',
    condition: 'primary',
    action: 'success',
    decision: 'warning'
  }
  return types[type] || 'info'
}

/**
 * 动作类型改变
 */
const onActionTypeChange = () => {
  // 重置动作参数
  actionParams.value = {}
  onPropertyChange()
}

/**
 * 属性变更
 */
const onPropertyChange = () => {
  if (!props.selectedNode) return

  // 同步动作参数到节点数据
  if (props.selectedNode.type === 'action' && props.selectedNode.data.actionType) {
    props.selectedNode.data.actionParams = {
      ...actionParams.value,
      actionType: props.selectedNode.data.actionType
    } as ActionParams
  }

  logger.debug('📝 属性变更', {
    nodeId: props.selectedNode.id,
    data: props.selectedNode.data
  })
}

/**
 * 保存属性
 */
const saveProperties = () => {
  if (!props.selectedNode) return

  emit('update-node', props.selectedNode)
  ElMessage.success('✅ 属性已保存')

  logger.info('💾 保存节点属性', {
    nodeId: props.selectedNode.id,
    data: props.selectedNode.data
  })
}

/**
 * 重置属性
 */
const resetProperties = () => {
  if (!props.selectedNode) return

  // 重置为初始值（简化实现）
  ElMessage.info('重置功能待完善')

  logger.debug('🔄 重置节点属性', {
    nodeId: props.selectedNode.id
  })
}
</script>

<style scoped>
.property-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border-left: 1px solid #dcdfe6;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #dcdfe6;
}

.panel-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.property-section {
  margin-bottom: 24px;
}

.property-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.form-item-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin-top: 4px;
}

.panel-actions {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #dcdfe6;
  background-color: #fafafa;
}

/* 表单样式覆盖 */
:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item__label) {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__inner) {
  font-size: 13px;
}

:deep(.el-textarea__inner) {
  font-size: 13px;
}

/* 滚动条样式 */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background-color: #c0c4cc;
}
</style>
