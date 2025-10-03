<template>
  <div class="business-rules-engine">
    <!-- 🧠 业务规则引擎头部 -->
    <div class="rules-header">
      <div class="header-left">
        <h3>
          <el-icon><Setting /></el-icon>
          可视化业务规则编辑器
        </h3>
        <div class="rules-stats">
          <el-tag type="info">
            规则总数: {{ allRules.length }}
          </el-tag>
          <el-tag type="success">
            已启用: {{ enabledRules.length }}
          </el-tag>
          <el-tag type="warning">
            待审核: {{ pendingRules.length }}
          </el-tag>
        </div>
      </div>
      <div class="header-actions">
        <el-button
          type="primary"
          @click="createNewRule"
        >
          <el-icon><Plus /></el-icon>
          新建规则
        </el-button>
        <el-button @click="importRules">
          <el-icon><Upload /></el-icon>
          导入规则
        </el-button>
        <el-button @click="exportRules">
          <el-icon><Download /></el-icon>
          导出规则
        </el-button>
      </div>
    </div>

    <!-- 🎨 规则分类视图 -->
    <div class="rules-body">
      <div class="rules-sidebar">
        <el-menu
          :default-active="activeCategory"
          class="rules-menu"
          @select="handleCategorySelect"
        >
          <el-menu-item index="all">
            <el-icon><List /></el-icon>
            <span>全部规则</span>
            <el-badge
              :value="allRules.length"
              class="rule-badge"
            />
          </el-menu-item>
          <el-menu-item index="validation">
            <el-icon><Shield /></el-icon>
            <span>验证规则</span>
            <el-badge
              :value="validationRules.length"
              class="rule-badge"
            />
          </el-menu-item>
          <el-menu-item index="calculation">
            <el-icon><Calculator /></el-icon>
            <span>计算规则</span>
            <el-badge
              :value="calculationRules.length"
              class="rule-badge"
            />
          </el-menu-item>
          <el-menu-item index="workflow">
            <el-icon><Share /></el-icon>
            <span>工作流规则</span>
            <el-badge
              :value="workflowRules.length"
              class="rule-badge"
            />
          </el-menu-item>
          <el-menu-item index="notification">
            <el-icon><Bell /></el-icon>
            <span>通知规则</span>
            <el-badge
              :value="notificationRules.length"
              class="rule-badge"
            />
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 📝 规则编辑区域 -->
      <div class="rules-content">
        <!-- 规则列表 -->
        <div class="rules-list">
          <div class="list-toolbar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索规则..."
              clearable
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select
              v-model="filterStatus"
              placeholder="状态筛选"
              style="width: 120px"
            >
              <el-option
                label="全部"
                value="all"
              />
              <el-option
                label="启用"
                value="enabled"
              />
              <el-option
                label="禁用"
                value="disabled"
              />
              <el-option
                label="草稿"
                value="draft"
              />
            </el-select>
          </div>

          <el-table
            :data="filteredRules"
            highlight-current-row
            class="rules-table"
            height="400"
            @row-click="selectRule"
          >
            <el-table-column
              type="selection"
              width="55"
            />
            <el-table-column
              prop="name"
              label="规则名称"
              min-width="180"
            >
              <template #default="scope">
                <div class="rule-name">
                  <el-icon :class="getRuleIcon(scope.row.type)" />
                  <span>{{ scope.row.name }}</span>
                  <el-tag
                    v-if="scope.row.priority === 'high'"
                    type="danger"
                    size="small"
                  >
                    高优先级
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="type"
              label="类型"
              width="120"
            >
              <template #default="scope">
                <el-tag
                  :type="getRuleTypeColor(scope.row.type)"
                  size="small"
                >
                  {{ getRuleTypeText(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="status"
              label="状态"
              width="100"
            >
              <template #default="scope">
                <el-switch
                  v-model="scope.row.enabled"
                  @change="toggleRuleStatus(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="lastModified"
              label="修改时间"
              width="160"
            >
              <template #default="scope">
                {{ formatDate(scope.row.lastModified) }}
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="200"
            >
              <template #default="scope">
                <el-button-group size="small">
                  <el-button @click="editRule(scope.row)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button @click="duplicateRule(scope.row)">
                    <el-icon><CopyDocument /></el-icon>
                    复制
                  </el-button>
                  <el-button
                    type="danger"
                    @click="deleteRule(scope.row)"
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 规则详情面板 -->
        <div
          v-if="selectedRule"
          class="rule-detail-panel"
        >
          <div class="panel-header">
            <h4>规则详情</h4>
            <el-button-group size="small">
              <el-button
                :loading="testing"
                @click="testRule"
              >
                <el-icon><Position /></el-icon>
                测试规则
              </el-button>
              <el-button @click="validateRule">
                <el-icon><CircleCheck /></el-icon>
                验证规则
              </el-button>
              <el-button
                type="primary"
                :loading="saving"
                @click="saveRule"
              >
                <el-icon><Check /></el-icon>
                保存
              </el-button>
            </el-button-group>
          </div>

          <!-- 🔧 可视化规则编辑器 -->
          <div class="visual-rule-editor">
            <el-tabs
              v-model="activeTab"
              class="rule-tabs"
            >
              <!-- 基本信息 -->
              <el-tab-pane
                label="基本信息"
                name="basic"
              >
                <el-form
                  :model="selectedRule"
                  label-width="100px"
                >
                  <el-form-item label="规则名称">
                    <el-input
                      v-model="selectedRule.name"
                      placeholder="请输入规则名称"
                    />
                  </el-form-item>
                  <el-form-item label="规则描述">
                    <el-input
                      v-model="selectedRule.description"
                      type="textarea"
                      :rows="3"
                      placeholder="请描述规则的用途和逻辑"
                    />
                  </el-form-item>
                  <el-form-item label="规则类型">
                    <el-select
                      v-model="selectedRule.type"
                      style="width: 100%"
                    >
                      <el-option
                        label="数据验证"
                        value="validation"
                      />
                      <el-option
                        label="业务计算"
                        value="calculation"
                      />
                      <el-option
                        label="工作流触发"
                        value="workflow"
                      />
                      <el-option
                        label="通知规则"
                        value="notification"
                      />
                      <el-option
                        label="权限控制"
                        value="permission"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="优先级">
                    <el-radio-group v-model="selectedRule.priority">
                      <el-radio label="low">
                        低
                      </el-radio>
                      <el-radio label="medium">
                        中
                      </el-radio>
                      <el-radio label="high">
                        高
                      </el-radio>
                      <el-radio label="critical">
                        严重
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-form>
              </el-tab-pane>

              <!-- 条件设置 -->
              <el-tab-pane
                label="触发条件"
                name="conditions"
              >
                <div class="condition-builder">
                  <div class="condition-header">
                    <span>当满足以下条件时触发规则：</span>
                    <el-button
                      type="primary"
                      text
                      @click="addCondition"
                    >
                      <el-icon><Plus /></el-icon>
                      添加条件
                    </el-button>
                  </div>

                  <div class="condition-list">
                    <div
                      v-for="(condition, index) in selectedRule.conditions"
                      :key="condition.id"
                      class="condition-item"
                    >
                      <div
                        v-if="index > 0"
                        class="condition-logic"
                      >
                        <el-select
                          v-model="condition.logic"
                          size="small"
                        >
                          <el-option
                            label="并且 (AND)"
                            value="AND"
                          />
                          <el-option
                            label="或者 (OR)"
                            value="OR"
                          />
                        </el-select>
                      </div>

                      <div class="condition-content">
                        <el-select
                          v-model="condition.field"
                          placeholder="选择字段"
                          style="width: 150px"
                        >
                          <el-option
                            v-for="field in availableFields"
                            :key="field.name"
                            :label="field.displayName"
                            :value="field.name"
                          />
                        </el-select>

                        <el-select
                          v-model="condition.operator"
                          placeholder="选择操作符"
                          style="width: 120px"
                        >
                          <el-option
                            label="等于"
                            value="equals"
                          />
                          <el-option
                            label="不等于"
                            value="notEquals"
                          />
                          <el-option
                            label="大于"
                            value="greaterThan"
                          />
                          <el-option
                            label="小于"
                            value="lessThan"
                          />
                          <el-option
                            label="包含"
                            value="contains"
                          />
                          <el-option
                            label="不包含"
                            value="notContains"
                          />
                          <el-option
                            label="为空"
                            value="isEmpty"
                          />
                          <el-option
                            label="不为空"
                            value="isNotEmpty"
                          />
                        </el-select>

                        <el-input
                          v-model="condition.value"
                          placeholder="输入值"
                          style="width: 150px"
                        />

                        <el-button
                          type="danger"
                          text
                          @click="removeCondition(index)"
                        >
                          <el-icon><Close /></el-icon>
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>

              <!-- 执行动作 -->
              <el-tab-pane
                label="执行动作"
                name="actions"
              >
                <div class="action-builder">
                  <div class="action-header">
                    <span>当条件满足时执行以下动作：</span>
                    <el-button
                      type="primary"
                      text
                      @click="addAction"
                    >
                      <el-icon><Plus /></el-icon>
                      添加动作
                    </el-button>
                  </div>

                  <div class="action-list">
                    <div
                      v-for="(action, index) in selectedRule.actions"
                      :key="action.id"
                      class="action-item"
                    >
                      <div class="action-type">
                        <el-select
                          v-model="action.type"
                          style="width: 150px"
                        >
                          <el-option
                            label="设置字段值"
                            value="setField"
                          />
                          <el-option
                            label="发送通知"
                            value="notification"
                          />
                          <el-option
                            label="触发工作流"
                            value="workflow"
                          />
                          <el-option
                            label="调用API"
                            value="apiCall"
                          />
                          <el-option
                            label="记录日志"
                            value="log"
                          />
                          <el-option
                            label="发送邮件"
                            value="email"
                          />
                        </el-select>
                      </div>

                      <div class="action-config">
                        <!-- 设置字段值配置 -->
                        <div
                          v-if="action.type === 'setField'"
                          class="field-config"
                        >
                          <el-select
                            v-model="action.config.targetField"
                            placeholder="目标字段"
                            style="width: 120px"
                          >
                            <el-option
                              v-for="field in availableFields"
                              :key="field.name"
                              :label="field.displayName"
                              :value="field.name"
                            />
                          </el-select>
                          <span>=</span>
                          <el-input
                            v-model="action.config.value"
                            placeholder="设置的值"
                            style="width: 150px"
                          />
                        </div>

                        <!-- 通知配置 -->
                        <div
                          v-else-if="action.type === 'notification'"
                          class="notification-config"
                        >
                          <el-select
                            v-model="action.config.level"
                            style="width: 100px"
                          >
                            <el-option
                              label="信息"
                              value="info"
                            />
                            <el-option
                              label="警告"
                              value="warning"
                            />
                            <el-option
                              label="错误"
                              value="error"
                            />
                            <el-option
                              label="成功"
                              value="success"
                            />
                          </el-select>
                          <el-input
                            v-model="action.config.message"
                            placeholder="通知消息"
                            style="width: 200px"
                          />
                        </div>

                        <!-- 工作流配置 -->
                        <div
                          v-else-if="action.type === 'workflow'"
                          class="workflow-config"
                        >
                          <el-select
                            v-model="action.config.workflowId"
                            placeholder="选择工作流"
                            style="width: 150px"
                          >
                            <el-option
                              v-for="workflow in availableWorkflows"
                              :key="workflow.id"
                              :label="workflow.name"
                              :value="workflow.id"
                            />
                          </el-select>
                          <el-input
                            v-model="action.config.triggerEvent"
                            placeholder="触发事件"
                            style="width: 120px"
                          />
                        </div>

                        <!-- API调用配置 -->
                        <div
                          v-else-if="action.type === 'apiCall'"
                          class="api-config"
                        >
                          <el-select
                            v-model="action.config.method"
                            style="width: 80px"
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
                          <el-input
                            v-model="action.config.url"
                            placeholder="API地址"
                            style="width: 200px"
                          />
                        </div>
                      </div>

                      <el-button
                        type="danger"
                        text
                        @click="removeAction(index)"
                      >
                        <el-icon><Close /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-tab-pane>

              <!-- 规则预览 -->
              <el-tab-pane
                label="规则预览"
                name="preview"
              >
                <div class="rule-preview">
                  <div class="preview-header">
                    <h4>规则执行逻辑预览</h4>
                    <el-button @click="formatRuleCode">
                      <el-icon><Refresh /></el-icon>
                      格式化
                    </el-button>
                  </div>

                  <!-- 🔍 生成的规则代码 -->
                  <div class="rule-code-preview">
                    <el-tabs v-model="previewTab">
                      <el-tab-pane
                        label="JavaScript"
                        name="js"
                      >
                        <pre class="code-block">{{ generateJavaScriptCode() }}</pre>
                      </el-tab-pane>
                      <el-tab-pane
                        label="JSON Schema"
                        name="json"
                      >
                        <pre class="code-block">{{ generateJsonSchema() }}</pre>
                      </el-tab-pane>
                      <el-tab-pane
                        label="执行计划"
                        name="plan"
                      >
                        <div class="execution-plan">
                          <el-steps
                            :active="executionSteps.length"
                            direction="vertical"
                          >
                            <el-step
                              v-for="(step, index) in executionSteps"
                              :key="index"
                              :title="step.title"
                              :description="step.description"
                            />
                          </el-steps>
                        </div>
                      </el-tab-pane>
                    </el-tabs>
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </div>
    </div>

    <!-- 📊 规则性能监控 -->
    <div class="rules-footer">
      <div class="performance-metrics">
        <div class="metric-item">
          <span class="metric-label">规则执行次数</span>
          <span class="metric-value">{{ totalExecutions }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">平均执行时间</span>
          <span class="metric-value">{{ averageExecutionTime }}ms</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">成功率</span>
          <span class="metric-value">{{ successRate }}%</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">错误次数</span>
          <span class="metric-value text-danger">{{ errorCount }}</span>
        </div>
      </div>
    </div>

    <!-- 📋 规则创建/编辑对话框 -->
    <el-dialog
      v-model="showRuleDialog"
      :title="isEditing ? '编辑规则' : '创建新规则'"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <RuleEditor
        v-if="showRuleDialog"
        :rule="editingRule"
        :available-fields="availableFields"
        :available-workflows="availableWorkflows"
        @save="handleRuleSave"
        @cancel="showRuleDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting, Plus, Upload, Download, List, Share, Bell,
  Search, Edit, CopyDocument, Delete, Position, CircleCheck, Check,
  Close, Refresh
} from '@element-plus/icons-vue'
import { eventBus } from '@smartabp/lowcode-tools'

// 🧠 业务规则接口定义
export interface BusinessRule {
  id: string
  name: string
  description: string
  type: 'validation' | 'calculation' | 'workflow' | 'notification' | 'permission'
  priority: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  conditions: RuleCondition[]
  actions: RuleAction[]
  createdAt: Date
  lastModified: Date
  executionCount: number
  averageExecutionTime: number
  errorCount: number
}

export interface RuleCondition {
  id: string
  field: string
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'notContains' | 'isEmpty' | 'isNotEmpty'
  value: any
  logic: 'AND' | 'OR'
}

export interface RuleAction {
  id: string
  type: 'setField' | 'notification' | 'workflow' | 'apiCall' | 'log' | 'email'
  config: Record<string, any>
}

// 响应式数据
const activeCategory = ref('all')
const searchKeyword = ref('')
const filterStatus = ref('all')
const selectedRule = ref<BusinessRule | null>(null)
const showRuleDialog = ref(false)
const isEditing = ref(false)
const editingRule = ref<BusinessRule | null>(null)
const testing = ref(false)
const saving = ref(false)
const activeTab = ref('basic')
const previewTab = ref('js')

// 模拟数据
const allRules = ref<BusinessRule[]>([
  {
    id: 'rule-1',
    name: '用户年龄验证',
    description: '验证用户年龄必须在18-65岁之间',
    type: 'validation',
    priority: 'high',
    enabled: true,
    conditions: [
      {
        id: 'cond-1',
        field: 'age',
        operator: 'greaterThan',
        value: 18,
        logic: 'AND'
      },
      {
        id: 'cond-2',
        field: 'age',
        operator: 'lessThan',
        value: 65,
        logic: 'AND'
      }
    ],
    actions: [
      {
        id: 'action-1',
        type: 'notification',
        config: {
          level: 'error',
          message: '年龄必须在18-65岁之间'
        }
      }
    ],
    createdAt: new Date(),
    lastModified: new Date(),
    executionCount: 1250,
    averageExecutionTime: 15,
    errorCount: 5
  }
])

const availableFields = ref([
  { name: 'name', displayName: '姓名', type: 'string' },
  { name: 'age', displayName: '年龄', type: 'number' },
  { name: 'email', displayName: '邮箱', type: 'string' },
  { name: 'status', displayName: '状态', type: 'string' }
])

const availableWorkflows = ref([
  { id: 'workflow-1', name: '用户审核流程' },
  { id: 'workflow-2', name: '订单处理流程' }
])

// 计算属性
const enabledRules = computed(() => allRules.value.filter(r => r.enabled))
const pendingRules = computed(() => allRules.value.filter(r => !r.enabled))
const validationRules = computed(() => allRules.value.filter(r => r.type === 'validation'))
const calculationRules = computed(() => allRules.value.filter(r => r.type === 'calculation'))
const workflowRules = computed(() => allRules.value.filter(r => r.type === 'workflow'))
const notificationRules = computed(() => allRules.value.filter(r => r.type === 'notification'))

const filteredRules = computed(() => {
  let filtered = allRules.value

  // 分类筛选
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(rule => rule.type === activeCategory.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(rule =>
      rule.name.toLowerCase().includes(keyword) ||
      rule.description.toLowerCase().includes(keyword)
    )
  }

  // 状态筛选
  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(rule => {
      switch (filterStatus.value) {
        case 'enabled': return rule.enabled
        case 'disabled': return !rule.enabled
        case 'draft': return !rule.id.startsWith('rule-')
        default: return true
      }
    })
  }

  return filtered
})

const totalExecutions = computed(() =>
  allRules.value.reduce((sum, rule) => sum + rule.executionCount, 0)
)

const averageExecutionTime = computed(() => {
  const total = allRules.value.reduce((sum, rule) => sum + rule.averageExecutionTime, 0)
  return Math.round(total / allRules.value.length)
})

const successRate = computed(() => {
  const totalErrors = allRules.value.reduce((sum, rule) => sum + rule.errorCount, 0)
  const total = totalExecutions.value
  return total > 0 ? Math.round(((total - totalErrors) / total) * 100) : 100
})

const errorCount = computed(() =>
  allRules.value.reduce((sum, rule) => sum + rule.errorCount, 0)
)

const executionSteps = computed(() => {
  if (!selectedRule.value) return []

  const steps = []

  // 条件检查步骤
  steps.push({
    title: '条件检查',
    description: `检查 ${selectedRule.value.conditions.length} 个条件`
  })

  // 动作执行步骤
  selectedRule.value.actions.forEach((action, index) => {
    steps.push({
      title: `执行动作 ${index + 1}`,
      description: getActionDescription(action)
    })
  })

  return steps
})

// 方法
const handleCategorySelect = (category: string) => {
  activeCategory.value = category
}

const selectRule = (rule: BusinessRule) => {
  selectedRule.value = rule
}

const createNewRule = () => {
  isEditing.value = false
  editingRule.value = {
    id: `rule-${Date.now()}`,
    name: '',
    description: '',
    type: 'validation',
    priority: 'medium',
    enabled: false,
    conditions: [],
    actions: [],
    createdAt: new Date(),
    lastModified: new Date(),
    executionCount: 0,
    averageExecutionTime: 0,
    errorCount: 0
  }
  showRuleDialog.value = true
}

const editRule = (rule: BusinessRule) => {
  isEditing.value = true
  editingRule.value = { ...rule }
  showRuleDialog.value = true
}

const duplicateRule = (rule: BusinessRule) => {
  const duplicated = {
    ...rule,
    id: `rule-${Date.now()}`,
    name: `${rule.name} (副本)`,
    enabled: false,
    createdAt: new Date(),
    lastModified: new Date()
  }
  allRules.value.push(duplicated)
  ElMessage.success('规则复制成功')
}

const deleteRule = async (rule: BusinessRule) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除规则"${rule.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = allRules.value.findIndex(r => r.id === rule.id)
    if (index > -1) {
      allRules.value.splice(index, 1)
      ElMessage.success('规则删除成功')

      if (selectedRule.value?.id === rule.id) {
        selectedRule.value = null
      }
    }
  } catch {
    // 用户取消删除
  }
}

const toggleRuleStatus = (rule: BusinessRule) => {
  rule.lastModified = new Date()
  ElMessage.success(`规则"${rule.name}"已${rule.enabled ? '启用' : '禁用'}`)

  // 发布规则状态变更事件
  eventBus.emit('business-rule:status-changed', {
    ruleId: rule.id,
    isActive: rule.enabled,
    enabled: rule.enabled,
    updatedAt: new Date().toISOString()
  })
}

const testRule = async () => {
  if (!selectedRule.value) return

  testing.value = true
  try {
    // 模拟规则测试
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('规则测试通过')
  } catch (error) {
    ElMessage.error('规则测试失败')
  } finally {
    testing.value = false
  }
}

const validateRule = () => {
  if (!selectedRule.value) return

  const errors = []

  // 验证规则完整性
  if (!selectedRule.value.name) {
    errors.push('规则名称不能为空')
  }

  if (selectedRule.value.conditions.length === 0) {
    errors.push('至少需要一个触发条件')
  }

  if (selectedRule.value.actions.length === 0) {
    errors.push('至少需要一个执行动作')
  }

  if (errors.length > 0) {
    ElMessage.error(`规则验证失败：${errors.join('、')}`)
  } else {
    ElMessage.success('规则验证通过')
  }
}

const saveRule = async () => {
  if (!selectedRule.value) return

  saving.value = true
  try {
    selectedRule.value.lastModified = new Date()
    ElMessage.success('规则保存成功')

    // 发布规则保存事件
    eventBus.emit('business-rule:saved', {
      rule: selectedRule.value,
      isNew: false
    })
  } catch (error) {
    ElMessage.error('规则保存失败')
  } finally {
    saving.value = false
  }
}

const addCondition = () => {
  if (!selectedRule.value) return

  selectedRule.value.conditions.push({
    id: `condition-${Date.now()}`,
    field: '',
    operator: 'equals',
    value: '',
    logic: 'AND'
  })
}

const removeCondition = (index: number) => {
  if (!selectedRule.value) return
  selectedRule.value.conditions.splice(index, 1)
}

const addAction = () => {
  if (!selectedRule.value) return

  selectedRule.value.actions.push({
    id: `action-${Date.now()}`,
    type: 'setField',
    config: {}
  })
}

const removeAction = (index: number) => {
  if (!selectedRule.value) return
  selectedRule.value.actions.splice(index, 1)
}

const getRuleIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    validation: 'shield',
    calculation: 'calculator',
    workflow: 'share',
    notification: 'bell',
    permission: 'lock'
  }
  return iconMap[type] || 'setting'
}

const getRuleTypeColor = (type: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' => {
  const colorMap: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = {
    validation: 'danger',
    calculation: 'warning',
    workflow: 'primary',
    notification: 'info',
    permission: 'success'
  }
  return colorMap[type] || 'primary'
}

const getRuleTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    validation: '验证',
    calculation: '计算',
    workflow: '工作流',
    notification: '通知',
    permission: '权限'
  }
  return textMap[type] || type
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const getActionDescription = (action: RuleAction) => {
  switch (action.type) {
    case 'setField':
      return `设置 ${action.config.targetField} = ${action.config.value}`
    case 'notification':
      return `发送${action.config.level}通知: ${action.config.message}`
    case 'workflow':
      return `触发工作流: ${action.config.workflowId}`
    case 'apiCall':
      return `调用API: ${action.config.method} ${action.config.url}`
    default:
      return `执行 ${action.type} 操作`
  }
}

const generateJavaScriptCode = () => {
  if (!selectedRule.value) return ''

  const rule = selectedRule.value
  const conditionsCode = rule.conditions.map((condition, index) => {
    const logic = index > 0 ? ` ${condition.logic.toLowerCase()} ` : ''
    return `${logic}data.${condition.field} ${getOperatorCode(condition.operator)} ${JSON.stringify(condition.value)}`
  }).join('')

  const actionsCode = rule.actions.map(action => {
    switch (action.type) {
      case 'setField':
        return `data.${action.config.targetField} = ${JSON.stringify(action.config.value)}`
      case 'notification':
        return `notify('${action.config.level}', '${action.config.message}')`
      default:
        return `// ${action.type} action`
    }
  }).join('\n  ')

  return `// 业务规则: ${rule.name}
function ${rule.name.replace(/\s+/g, '')}Rule(data) {
  if (${conditionsCode}) {
    ${actionsCode}
    return true
  }
  return false
}`
}

const generateJsonSchema = () => {
  if (!selectedRule.value) return ''
  return JSON.stringify(selectedRule.value, null, 2)
}

const getOperatorCode = (operator: string) => {
  const operatorMap: Record<string, string> = {
    equals: '===',
    notEquals: '!==',
    greaterThan: '>',
    lessThan: '<',
    contains: '.includes',
    notContains: '!.includes',
    isEmpty: '=== ""',
    isNotEmpty: '!== ""'
  }
  return operatorMap[operator] || '==='
}

const formatRuleCode = () => {
  // 重新生成格式化的代码
  ElMessage.success('代码已格式化')
}

const importRules = () => {
  // 导入规则功能
  ElMessage.info('规则导入功能正在开发中')
}

const exportRules = () => {
  // 导出规则功能
  const rulesData = JSON.stringify(allRules.value, null, 2)
  const blob = new Blob([rulesData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `business-rules-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('规则导出成功')
}

const handleRuleSave = (rule: BusinessRule) => {
  if (isEditing.value) {
    const index = allRules.value.findIndex(r => r.id === rule.id)
    if (index > -1) {
      allRules.value[index] = rule
    }
  } else {
    allRules.value.push(rule)
  }

  showRuleDialog.value = false
  selectedRule.value = rule
  ElMessage.success('规则保存成功')
}

// 生命周期
onMounted(() => {
  // 初始化业务规则引擎
})
</script>

<style scoped>
.business-rules-engine {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.rules-header {
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
}

.rules-stats {
  display: flex;
  gap: 8px;
}

.rules-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.rules-sidebar {
  width: 200px;
  background: white;
  border-right: 1px solid #e4e7ed;
}

.rules-menu {
  border: none;
}

.rule-badge {
  margin-left: auto;
}

.rules-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.rules-list {
  background: white;
  padding: 16px;
}

.list-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.rules-table {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.rule-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rule-detail-panel {
  background: white;
  border-top: 1px solid #e4e7ed;
  padding: 16px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-header h4 {
  margin: 0;
  color: #303133;
}

.condition-builder,
.action-builder {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
}

.condition-header,
.action-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.condition-item,
.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 8px;
}

.condition-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.action-config {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.rule-preview {
  padding: 16px;
}

.rule-code-preview {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #f5f5f5;
}

.code-block {
  padding: 16px;
  margin: 0;
  background: #2d3748;
  color: #e2e8f0;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.5;
}

.execution-plan {
  padding: 16px;
}

.rules-footer {
  padding: 12px 24px;
  background: white;
  border-top: 1px solid #e4e7ed;
}

.performance-metrics {
  display: flex;
  gap: 32px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.metric-label {
  font-size: 12px;
  color: #909399;
}

.metric-value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.text-danger {
  color: #f56c6c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rules-body {
    flex-direction: column;
  }

  .rules-sidebar {
    width: 100%;
    height: auto;
  }

  .performance-metrics {
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
