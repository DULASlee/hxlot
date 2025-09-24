<!-- 
基于企业级模板库的业务规则引擎
适用场景: 企业级业务规则定义、执行、监控
依赖项: Vue 3, SmartAbp低代码引擎, Element Plus
核心功能: 规则建模、条件配置、动作定义、规则执行、性能监控
-->

<template>
  <div class="business-rules-engine">
    <!-- 工具栏 -->
    <div class="engine-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button
            :type="activeTab === 'rules' ? 'primary' : 'default'"
            size="small"
            @click="activeTab = 'rules'"
          >
            规则管理
          </el-button>
          <el-button
            :type="activeTab === 'conditions' ? 'primary' : 'default'"
            size="small"
            @click="activeTab = 'conditions'"
          >
            条件配置
          </el-button>
          <el-button
            :type="activeTab === 'actions' ? 'primary' : 'default'"
            size="small"
            @click="activeTab = 'actions'"
          >
            动作定义
          </el-button>
          <el-button
            :type="activeTab === 'execution' ? 'primary' : 'default'"
            size="small"
            @click="activeTab = 'execution'"
          >
            执行监控
          </el-button>
        </el-button-group>
      </div>
      
      <div class="toolbar-right">
        <el-button
          size="small"
          @click="validateAllRules"
        >
          验证规则
        </el-button>
        <el-button
          size="small"
          :disabled="!selectedRules.length"
          @click="executeSelectedRules"
        >
          执行规则
        </el-button>
        <el-button
          size="small"
          type="primary"
          @click="showAddRuleDialog = true"
        >
          新增规则
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="engine-content">
      <!-- 规则管理 -->
      <div
        v-if="activeTab === 'rules'"
        class="rules-management"
      >
        <div class="content-header">
          <h4>业务规则列表</h4>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索规则..."
              size="small"
              clearable
              style="width: 200px"
            />
            <el-select
              v-model="filterEntity"
              placeholder="筛选实体"
              size="small"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="entity in availableEntities"
                :key="entity.id"
                :label="entity.displayName"
                :value="entity.name"
              />
            </el-select>
          </div>
        </div>
        
        <div class="rules-table">
          <el-table
            :data="filteredRules"
            stripe
            height="400"
            @selection-change="handleRuleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="50"
            />
            
            <el-table-column
              prop="name"
              label="规则名称"
              min-width="150"
            >
              <template #default="{ row }">
                <div class="rule-name">
                  <span :class="{ 'rule-disabled': !row.isActive }">{{ row.name }}</span>
                  <el-tag
                    v-if="row.hasError"
                    type="danger"
                    size="small"
                    class="rule-error-tag"
                  >
                    错误
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column
              prop="entityName"
              label="关联实体"
              width="120"
            />
            
            <el-table-column
              prop="type"
              label="规则类型"
              width="100"
            >
              <template #default="{ row }">
                <el-tag
                  :type="getRuleTypeTagType(row.type) as any"
                  size="small"
                >
                  {{ getRuleTypeLabel(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column
              prop="priority"
              label="优先级"
              width="80"
            />
            
            <el-table-column
              prop="isActive"
              label="状态"
              width="80"
            >
              <template #default="{ row }">
                <el-switch
                  v-model="row.isActive"
                  size="small"
                  @change="updateRuleStatus(row)"
                />
              </template>
            </el-table-column>
            
            <el-table-column
              label="最后执行"
              width="160"
            >
              <template #default="{ row }">
                <div
                  v-if="row.lastExecutionResult"
                  class="execution-info"
                >
                  <div class="execution-status">
                    <el-icon
                      :class="row.lastExecutionResult.success ? 'success-icon' : 'error-icon'"
                    >
                      <Check v-if="row.lastExecutionResult.success" />
                      <Close v-else />
                    </el-icon>
                    <span>{{ row.lastExecutionResult.executionTime }}ms</span>
                  </div>
                  <div class="execution-time">
                    {{ formatTime(row.lastExecutionResult.timestamp) }}
                  </div>
                </div>
                <span
                  v-else
                  class="no-execution"
                >未执行</span>
              </template>
            </el-table-column>
            
            <el-table-column
              label="操作"
              width="120"
              fixed="right"
            >
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button
                    size="small"
                    text
                    @click="editRule(row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    size="small"
                    text
                    @click="duplicateRule(row)"
                  >
                    复制
                  </el-button>
                  <el-button
                    size="small"
                    text
                    type="danger"
                    @click="deleteRule(row.id)"
                  >
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 条件配置 -->
      <div
        v-else-if="activeTab === 'conditions'"
        class="conditions-config"
      >
        <div class="content-header">
          <h4>条件配置器</h4>
        </div>
        
        <div class="condition-builder">
          <div class="entity-selector">
            <el-form-item label="目标实体">
              <el-select
                v-model="conditionConfig.entityName"
                placeholder="选择实体"
                style="width: 200px"
                @change="loadEntityFields"
              >
                <el-option
                  v-for="entity in availableEntities"
                  :key="entity.id"
                  :label="entity.displayName"
                  :value="entity.name"
                />
              </el-select>
            </el-form-item>
          </div>
          
          <div
            v-if="conditionConfig.entityName"
            class="conditions-list"
          >
            <div
              v-for="(condition, index) in conditionConfig.conditions"
              :key="index"
              class="condition-item"
            >
              <div class="condition-row">
                <el-select
                  v-model="condition.field"
                  placeholder="选择字段"
                  style="width: 150px"
                  size="small"
                >
                  <el-option
                    v-for="field in entityFields"
                    :key="field.name"
                    :label="field.displayName"
                    :value="field.name"
                  />
                </el-select>
                
                <el-select
                  v-model="condition.operator"
                  placeholder="选择操作符"
                  style="width: 120px"
                  size="small"
                >
                  <el-option
                    label="等于"
                    value="equals"
                  />
                  <el-option
                    label="不等于"
                    value="not_equals"
                  />
                  <el-option
                    label="大于"
                    value="greater_than"
                  />
                  <el-option
                    label="小于"
                    value="less_than"
                  />
                  <el-option
                    label="包含"
                    value="contains"
                  />
                  <el-option
                    label="为空"
                    value="is_null"
                  />
                  <el-option
                    label="不为空"
                    value="is_not_null"
                  />
                </el-select>
                
                <el-input
                  v-model="condition.value"
                  placeholder="输入值"
                  style="width: 150px"
                  size="small"
                />
                
                <el-select
                  v-if="index < conditionConfig.conditions.length - 1"
                  v-model="condition.logicalOperator"
                  placeholder="逻辑操作"
                  style="width: 80px"
                  size="small"
                >
                  <el-option
                    label="AND"
                    value="AND"
                  />
                  <el-option
                    label="OR"
                    value="OR"
                  />
                </el-select>
                
                <el-button
                  size="small"
                  type="danger"
                  text
                  @click="removeCondition(index)"
                >
                  删除
                </el-button>
              </div>
            </div>
            
            <el-button
              size="small"
              type="primary"
              text
              @click="addCondition"
            >
              添加条件
            </el-button>
          </div>
          
          <div
            v-if="conditionConfig.conditions.length > 0"
            class="condition-preview"
          >
            <h5>条件预览</h5>
            <div class="preview-text">
              {{ generateConditionText() }}
            </div>
          </div>
        </div>
      </div>

      <!-- 动作定义 -->
      <div
        v-else-if="activeTab === 'actions'"
        class="actions-config"
      >
        <div class="content-header">
          <h4>动作定义器</h4>
        </div>
        
        <div class="action-builder">
          <div class="action-types">
            <div
              v-for="actionType in actionTypes"
              :key="actionType.type"
              class="action-type-card"
              :class="{ 'action-type-selected': selectedActionType === actionType.type }"
              @click="selectActionType(actionType.type)"
            >
              <div class="action-icon">
                {{ actionType.icon }}
              </div>
              <div class="action-name">
                {{ actionType.name }}
              </div>
              <div class="action-description">
                {{ actionType.description }}
              </div>
            </div>
          </div>
          
          <div
            v-if="selectedActionType"
            class="action-config"
          >
            <div class="config-section">
              <h5>{{ getActionTypeName(selectedActionType) }}配置</h5>
              
              <!-- 字段更新动作 -->
              <div
                v-if="selectedActionType === 'update_field'"
                class="field-update-config"
              >
                <el-form
                  label-width="100px"
                  size="small"
                >
                  <el-form-item label="目标字段">
                    <el-select
                      v-model="actionConfig.targetField"
                      style="width: 200px"
                    >
                      <el-option
                        v-for="field in entityFields"
                        :key="field.name"
                        :label="field.displayName"
                        :value="field.name"
                      />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="新值">
                    <el-input
                      v-model="actionConfig.newValue"
                      placeholder="输入新值或表达式"
                      style="width: 300px"
                    />
                  </el-form-item>
                </el-form>
              </div>
              
              <!-- 发送通知动作 -->
              <div
                v-else-if="selectedActionType === 'send_notification'"
                class="notification-config"
              >
                <el-form
                  label-width="100px"
                  size="small"
                >
                  <el-form-item label="通知类型">
                    <el-select
                      v-model="actionConfig.notificationType"
                      style="width: 150px"
                    >
                      <el-option
                        label="邮件"
                        value="email"
                      />
                      <el-option
                        label="短信"
                        value="sms"
                      />
                      <el-option
                        label="系统通知"
                        value="system"
                      />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="接收人">
                    <el-input
                      v-model="actionConfig.recipients"
                      placeholder="输入接收人列表"
                      style="width: 300px"
                    />
                  </el-form-item>
                  
                  <el-form-item label="消息模板">
                    <el-input
                      v-model="actionConfig.messageTemplate"
                      type="textarea"
                      :rows="3"
                      placeholder="输入消息模板"
                      style="width: 300px"
                    />
                  </el-form-item>
                </el-form>
              </div>
              
              <!-- 执行脚本动作 -->
              <div
                v-else-if="selectedActionType === 'execute_script'"
                class="script-config"
              >
                <el-form
                  label-width="100px"
                  size="small"
                >
                  <el-form-item label="脚本类型">
                    <el-select
                      v-model="actionConfig.scriptType"
                      style="width: 150px"
                    >
                      <el-option
                        label="JavaScript"
                        value="javascript"
                      />
                      <el-option
                        label="C#"
                        value="csharp"
                      />
                      <el-option
                        label="SQL"
                        value="sql"
                      />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="脚本内容">
                    <el-input
                      v-model="actionConfig.scriptContent"
                      type="textarea"
                      :rows="6"
                      placeholder="输入脚本代码"
                      style="width: 400px"
                    />
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 执行监控 -->
      <div
        v-else-if="activeTab === 'execution'"
        class="execution-monitor"
      >
        <div class="content-header">
          <h4>规则执行监控</h4>
          <div class="header-actions">
            <el-button
              size="small"
              @click="refreshExecutionLog"
            >
              刷新日志
            </el-button>
            <el-button
              size="small"
              @click="clearExecutionLog"
            >
              清空日志
            </el-button>
          </div>
        </div>
        
        <div class="execution-stats">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-number">
                  {{ executionStats.totalRules }}
                </div>
                <div class="stat-label">
                  总规则数
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-number">
                  {{ executionStats.activeRules }}
                </div>
                <div class="stat-label">
                  活跃规则
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-number">
                  {{ executionStats.executionCount }}
                </div>
                <div class="stat-label">
                  执行次数
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card class="stat-card">
                <div class="stat-number">
                  {{ executionStats.successRate }}%
                </div>
                <div class="stat-label">
                  成功率
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        
        <div class="execution-log">
          <el-table
            :data="executionLog"
            height="300"
            stripe
          >
            <el-table-column
              prop="timestamp"
              label="执行时间"
              width="160"
            >
              <template #default="{ row }">
                {{ formatTime(row.timestamp) }}
              </template>
            </el-table-column>
            
            <el-table-column
              prop="ruleName"
              label="规则名称"
              min-width="150"
            />
            
            <el-table-column
              prop="success"
              label="状态"
              width="80"
            >
              <template #default="{ row }">
                <el-tag
                  :type="row.success ? 'success' : 'danger'"
                  size="small"
                >
                  {{ row.success ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column
              prop="executionTime"
              label="耗时(ms)"
              width="100"
            />
            
            <el-table-column
              prop="error"
              label="错误信息"
              min-width="200"
            >
              <template #default="{ row }">
                <span
                  v-if="!row.success && row.error"
                  class="error-message"
                >
                  {{ row.error }}
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 新增规则对话框 -->
    <el-dialog
      v-model="showAddRuleDialog"
      title="新增业务规则"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="addRuleFormRef"
        :model="newRuleForm"
        :rules="newRuleFormRules"
        label-width="100px"
      >
        <el-form-item
          label="规则名称"
          prop="name"
        >
          <el-input
            v-model="newRuleForm.name"
            placeholder="请输入规则名称"
          />
        </el-form-item>
        
        <el-form-item
          label="关联实体"
          prop="entityName"
        >
          <el-select
            v-model="newRuleForm.entityName"
            placeholder="选择实体"
            style="width: 100%"
          >
            <el-option
              v-for="entity in availableEntities"
              :key="entity.id"
              :label="entity.displayName"
              :value="entity.name"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item
          label="规则类型"
          prop="type"
        >
          <el-select
            v-model="newRuleForm.type"
            placeholder="选择规则类型"
            style="width: 100%"
          >
            <el-option
              label="验证规则"
              value="validation"
            />
            <el-option
              label="业务规则"
              value="business"
            />
            <el-option
              label="计算规则"
              value="calculation"
            />
            <el-option
              label="工作流规则"
              value="workflow"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item
          label="优先级"
          prop="priority"
        >
          <el-input-number
            v-model="newRuleForm.priority"
            :min="1"
            :max="100"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item
          label="描述"
          prop="description"
        >
          <el-input
            v-model="newRuleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入规则描述"
          />
        </el-form-item>
        
        <el-form-item label="执行时机">
          <el-checkbox-group v-model="newRuleForm.executionTiming">
            <el-checkbox label="创建前">
              创建前
            </el-checkbox>
            <el-checkbox label="创建后">
              创建后
            </el-checkbox>
            <el-checkbox label="更新前">
              更新前
            </el-checkbox>
            <el-checkbox label="更新后">
              更新后
            </el-checkbox>
            <el-checkbox label="删除前">
              删除前
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddRuleDialog = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="confirmAddRule"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'
import { type EntityDefinition } from '@/stores/lowcode/entityModeling'
import { logger } from '@/utils/logger'

// Props接口定义（暂时未使用）
// interface Props {
//   entity?: EntityDefinition
//   rules?: BusinessRule[]
// }

// Events
const emit = defineEmits<{
  'rule-added': [rule: BusinessRule]
  'rule-updated': [rule: BusinessRule]
  'rule-deleted': [ruleId: string]
  'rule-executed': [ruleId: string, result: any]
}>()

// 业务规则接口定义
interface BusinessRule {
  id: string
  name: string
  entityName: string
  description: string
  type: 'validation' | 'business' | 'calculation' | 'workflow'
  priority: number
  isActive: boolean
  hasError: boolean
  conditions: Array<{
    id: number
    field: string
    operator: string
    value: string
    logicalOperator?: string
  }>
  actions: Array<{
    id: number
    type: string
    target: string
    value: string
  }>
  executionTiming: string[]
  lastExecutionResult?: {
    success: boolean
    executionTime: number
    timestamp: number
    error?: string
  }
}

// Store - 暂时注释未使用
// const entityStore = useEntityModelingStore()

// 响应式数据
const addRuleFormRef = ref()
const activeTab = ref<'rules' | 'conditions' | 'actions' | 'execution'>('rules')

// 搜索和筛选
const searchKeyword = ref('')
const filterEntity = ref('')

// 规则相关
const businessRules = ref<BusinessRule[]>([])
const selectedRules = ref<BusinessRule[]>([])

// 条件配置
const conditionConfig = ref({
  entityName: '',
  conditions: [] as Array<{
    field: string
    operator: string
    value: string
    logicalOperator: string
  }>
})

// 动作配置
const selectedActionType = ref('')
const actionConfig = ref<Record<string, any>>({})

// UI状态
const showAddRuleDialog = ref(false)

// 表单数据
const newRuleForm = ref({
  name: '',
  entityName: '',
  type: 'validation' as const,
  priority: 50,
  description: '',
  executionTiming: [] as string[]
})

// 执行统计
const executionStats = ref({
  totalRules: 0,
  activeRules: 0,
  executionCount: 0,
  successRate: 0
})

// 执行日志
const executionLog = ref<Array<{
  timestamp: number
  ruleId: string
  ruleName: string
  success: boolean
  executionTime: number
  error?: string
}>>([])

// 动作类型定义
const actionTypes = ref([
  {
    type: 'update_field',
    name: '更新字段',
    icon: '📝',
    description: '更新实体字段值'
  },
  {
    type: 'send_notification',
    name: '发送通知',
    icon: '📧',
    description: '发送邮件、短信或系统通知'
  },
  {
    type: 'execute_script',
    name: '执行脚本',
    icon: '⚡',
    description: '执行自定义脚本代码'
  },
  {
    type: 'trigger_workflow',
    name: '触发工作流',
    icon: '🔄',
    description: '启动业务工作流程'
  }
])

// 表单验证规则
const newRuleFormRules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' }
  ],
  entityName: [
    { required: true, message: '请选择关联实体', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择规则类型', trigger: 'change' }
  ]
}

// 计算属性
const availableEntities = computed((): EntityDefinition[] => {
  // 模拟实体数据，确保类型正确
  return [] as EntityDefinition[]
})

const entityFields = computed(() => {
  // 模拟字段数据
  return [] as Array<{ name: string; displayName: string; type: string }>
})

const filteredRules = computed(() => {
  let rules = businessRules.value
  
  if (searchKeyword.value) {
    rules = rules.filter(rule =>
      rule.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }
  
  if (filterEntity.value) {
    rules = rules.filter(rule => rule.entityName === filterEntity.value)
  }
  
  return rules
})

// 方法
const handleRuleSelectionChange = (selection: BusinessRule[]) => {
  selectedRules.value = selection
}

const updateRuleStatus = (rule: BusinessRule) => {
  logger?.info('更新规则状态', { ruleId: rule.id, isActive: rule.isActive })
  emit('rule-updated', rule)
}

const editRule = (rule: BusinessRule) => {
  // 编辑规则逻辑
  logger?.info('编辑规则', { ruleId: rule.id })
}

const duplicateRule = (rule: BusinessRule) => {
  const newRule: BusinessRule = {
    ...rule,
    id: `rule_${Date.now()}`,
    name: `${rule.name}_副本`,
    isActive: false
  }
  
  businessRules.value.push(newRule)
  emit('rule-added', newRule)
  
  ElMessage.success('规则复制成功')
  logger?.info('复制规则', { originalId: rule.id, newId: newRule.id })
}

const deleteRule = async (ruleId: string) => {
  try {
    const rule = businessRules.value.find(r => r.id === ruleId)
    if (!rule) return
    
    await ElMessageBox.confirm(
      `确定要删除规则 "${rule.name}" 吗？`,
      '确认删除',
      { type: 'warning' }
    )
    
    const index = businessRules.value.findIndex(r => r.id === ruleId)
    if (index > -1) {
      businessRules.value.splice(index, 1)
    }
    
    emit('rule-deleted', ruleId)
    ElMessage.success('规则删除成功')
    logger?.info('删除规则', { ruleId })
  } catch (error: unknown) {
    // 用户取消删除或其他错误
    if (error instanceof Error) {
      logger?.error('删除规则过程出错', { error: error.message, ruleId })
    }
  }
}

const loadEntityFields = () => {
  conditionConfig.value.conditions = []
}

const addCondition = () => {
  conditionConfig.value.conditions.push({
    field: '',
    operator: 'equals',
    value: '',
    logicalOperator: 'AND'
  })
}

const removeCondition = (index: number) => {
  conditionConfig.value.conditions.splice(index, 1)
}

const generateConditionText = () => {
  return conditionConfig.value.conditions
    .map((condition, index) => {
      const text = `${condition.field} ${getOperatorLabel(condition.operator)} ${condition.value}`
      return index > 0 ? ` ${condition.logicalOperator} ${text}` : text
    })
    .join('')
}

const selectActionType = (type: string) => {
  selectedActionType.value = type
  actionConfig.value = {}
}

const validateAllRules = () => {
  // 验证所有规则的逻辑完整性
  const validationResults: Array<{ ruleId: string; isValid: boolean; errors: string[] }> = []
  
  businessRules.value.forEach(rule => {
    const errors: string[] = []
    
    if (rule.conditions.length === 0) {
      errors.push('规则缺少条件')
    }
    
    if (rule.actions.length === 0) {
      errors.push('规则缺少动作')
    }
    
    validationResults.push({
      ruleId: rule.id,
      isValid: errors.length === 0,
      errors
    })
  })
  
  const invalidRules = validationResults.filter(r => !r.isValid)
  
  if (invalidRules.length === 0) {
    ElMessage.success('所有规则验证通过')
  } else {
    ElMessage.warning(`发现 ${invalidRules.length} 个无效规则`)
  }
  
  logger?.info('规则验证完成', { totalRules: businessRules.value.length, invalidCount: invalidRules.length })
}

const executeSelectedRules = async () => {
  if (selectedRules.value.length === 0) {
    ElMessage.warning('请选择要执行的规则')
    return
  }
  
  for (const rule of selectedRules.value) {
    await executeRule(rule)
  }
  
  ElMessage.success(`已执行 ${selectedRules.value.length} 个规则`)
}

const executeRule = async (rule: BusinessRule) => {
  const startTime = performance.now()
  
  try {
    // 模拟规则执行
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
    
    const executionTime = Math.round(performance.now() - startTime)
    const success = Math.random() > 0.1 // 90% 成功率
    
    // 更新规则执行结果
    rule.lastExecutionResult = {
      success,
      executionTime,
      timestamp: Date.now(),
      error: success ? undefined : '模拟执行错误'
    }
    
    // 添加到执行日志
    executionLog.value.unshift({
      timestamp: Date.now(),
      ruleId: rule.id,
      ruleName: rule.name,
      success,
      executionTime,
      error: rule.lastExecutionResult.error
    })
    
    emit('rule-executed', rule.id, rule.lastExecutionResult)
    
    logger?.info('规则执行完成', { ruleId: rule.id, success, executionTime })
  } catch (error) {
    logger?.error('规则执行失败', { error: String(error), ruleId: rule.id })
  }
}

const confirmAddRule = async () => {
  try {
    await addRuleFormRef.value?.validate()
    
    const newRule: BusinessRule = {
      id: `rule_${Date.now()}`,
      name: newRuleForm.value.name,
      entityName: newRuleForm.value.entityName,
      description: newRuleForm.value.description,
      type: newRuleForm.value.type,
      priority: newRuleForm.value.priority,
      isActive: true,
      hasError: false,
      conditions: [],
      actions: [],
      executionTiming: newRuleForm.value.executionTiming
    }
    
    businessRules.value.push(newRule)
    emit('rule-added', newRule)
    
    showAddRuleDialog.value = false
    
    // 重置表单
    newRuleForm.value = {
      name: '',
      entityName: '',
      type: 'validation',
      priority: 50,
      description: '',
      executionTiming: []
    }
    
    ElMessage.success('规则创建成功')
    logger?.info('创建业务规则', { rule: newRule })
  } catch (error) {
    logger?.error('创建规则失败', error)
  }
}

const refreshExecutionLog = () => {
  // 刷新执行日志
  logger?.info('刷新执行日志')
}

const clearExecutionLog = () => {
  executionLog.value = []
  ElMessage.success('执行日志已清空')
}

// 工具方法
const getRuleTypeTagType = (type: string) => {
  const typeMap: Record<string, string> = {
    'validation': 'warning',
    'business': 'primary',
    'calculation': 'success',
    'workflow': 'info'
  }
  return typeMap[type] || 'default'
}

const getRuleTypeLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    'validation': '验证',
    'business': '业务',
    'calculation': '计算',
    'workflow': '工作流'
  }
  return labelMap[type] || type
}

const getActionTypeName = (type: string) => {
  const actionType = actionTypes.value.find(a => a.type === type)
  return actionType?.name || type
}

const getOperatorLabel = (operator: string) => {
  const labelMap: Record<string, string> = {
    'equals': '等于',
    'not_equals': '不等于',
    'greater_than': '大于',
    'less_than': '小于',
    'contains': '包含',
    'is_null': '为空',
    'is_not_null': '不为空'
  }
  return labelMap[operator] || operator
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// 生命周期
onMounted(() => {
  // 初始化执行统计
  executionStats.value = {
    totalRules: businessRules.value.length,
    activeRules: businessRules.value.filter(r => r.isActive).length,
    executionCount: 0,
    successRate: 0
  }
  
  logger?.info('业务规则引擎初始化完成')
})
</script>

<style scoped>
.business-rules-engine {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
}

.engine-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color);
  background: var(--el-bg-color-page);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.engine-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.content-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rules-table {
  background: white;
  border-radius: 6px;
  overflow: hidden;
}

.rule-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rule-disabled {
  color: var(--el-text-color-placeholder);
}

.rule-error-tag {
  font-size: 10px;
}

.execution-info {
  font-size: 12px;
}

.execution-status {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.success-icon {
  color: var(--el-color-success);
}

.error-icon {
  color: var(--el-color-danger);
}

.execution-time {
  color: var(--el-text-color-regular);
}

.no-execution {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.condition-builder {
  background: white;
  padding: 16px;
  border-radius: 6px;
}

.entity-selector {
  margin-bottom: 16px;
}

.conditions-list {
  margin-bottom: 16px;
}

.condition-item {
  margin-bottom: 12px;
}

.condition-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.condition-preview {
  margin-top: 16px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

.condition-preview h5 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 600;
}

.preview-text {
  font-family: monospace;
  font-size: 12px;
  color: var(--el-text-color-primary);
}

.action-builder {
  background: white;
  padding: 16px;
  border-radius: 6px;
}

.action-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.action-type-card {
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.action-type-card:hover {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.action-type-selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.action-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.action-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.action-description {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.action-config {
  padding: 16px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
}

.config-section h5 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
}

.execution-monitor {
  background: white;
  padding: 16px;
  border-radius: 6px;
}

.execution-stats {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  padding: 16px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.execution-log {
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  overflow: hidden;
}

.error-message {
  color: var(--el-color-danger);
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .action-types {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .condition-row {
    flex-wrap: wrap;
  }
}
</style>
