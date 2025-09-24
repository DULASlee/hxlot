<template>
  <div class="business-rules-engine">
    <el-card>
      <template #header>
        <div class="engine-header">
          <h3>
            <i class="el-icon-magic-stick" />
            业务规则引擎
          </h3>
          <div class="engine-actions">
            <el-button-group size="small">
              <el-button
                type="primary"
                icon="el-icon-plus"
                @click="showAddRuleDialog = true"
              >
                新建规则
              </el-button>
              <el-button
                icon="el-icon-upload"
                @click="importRulesFromTemplate"
              >
                导入模板
              </el-button>
              <el-button
                icon="el-icon-cpu"
                @click="testAllRules"
                :loading="testing"
              >
                测试规则
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <!-- 规则分类标签 -->
      <div class="rules-tabs">
        <el-tabs v-model="activeRuleCategory" type="border-card">
          <el-tab-pane label="实体规则" name="entity">
            <div class="entity-rules">
              <div class="rules-toolbar">
                <span class="rules-count">{{ entityRules.length }} 个实体级规则</span>
                <el-button
                  size="small"
                  type="primary"
                  @click="addEntityRule"
                >
                  添加实体规则
                </el-button>
              </div>

              <div class="rules-list">
                <div
                  v-for="rule in entityRules"
                  :key="rule.id"
                  class="rule-card entity-rule"
                  :class="{ active: rule.isActive, error: rule.hasError }"
                >
                  <div class="rule-header">
                    <div class="rule-info">
                      <h4>{{ rule.name }}</h4>
                      <span class="rule-entity">作用于: {{ rule.entityName }}</span>
                    </div>
                    <div class="rule-status">
                      <el-switch
                        v-model="rule.isActive"
                        @change="toggleRule(rule)"
                      />
                      <el-dropdown @command="handleRuleAction" trigger="click">
                        <el-button size="mini" type="text">
                          <i class="el-icon-more" />
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item :command="{action: 'edit', rule}">
                              <i class="el-icon-edit" /> 编辑规则
                            </el-dropdown-item>
                            <el-dropdown-item :command="{action: 'test', rule}">
                              <i class="el-icon-cpu" /> 测试规则
                            </el-dropdown-item>
                            <el-dropdown-item :command="{action: 'duplicate', rule}">
                              <i class="el-icon-document-copy" /> 复制规则
                            </el-dropdown-item>
                            <el-dropdown-item :command="{action: 'delete', rule}" divided>
                              <i class="el-icon-delete" /> 删除规则
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                  <div class="rule-content">
                    <div class="rule-description">{{ rule.description }}</div>
                    <div class="rule-conditions">
                      <div class="condition-label">触发条件:</div>
                      <el-tag
                        v-for="condition in rule.conditions"
                        :key="condition.id"
                        size="small"
                        type="primary"
                      >
                        {{ condition.field }} {{ condition.operator }} {{ condition.value }}
                      </el-tag>
                    </div>
                    <div class="rule-actions-list">
                      <div class="actions-label">执行动作:</div>
                      <el-tag
                        v-for="action in rule.actions"
                        :key="action.id"
                        size="small"
                        type="success"
                      >
                        {{ action.type }}: {{ action.description }}
                      </el-tag>
                    </div>
                  </div>
                  <div v-if="rule.lastExecutionResult" class="rule-result">
                    <div class="result-status" :class="rule.lastExecutionResult.success ? 'success' : 'error'">
                      <i :class="rule.lastExecutionResult.success ? 'el-icon-check' : 'el-icon-close'" />
                      {{ rule.lastExecutionResult.success ? '执行成功' : '执行失败' }}
                    </div>
                    <div class="result-time">
                      {{ formatTime(rule.lastExecutionResult.timestamp) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="字段规则" name="field">
            <div class="field-rules">
              <div class="rules-toolbar">
                <span class="rules-count">{{ fieldRules.length }} 个字段级规则</span>
                <el-button
                  size="small"
                  type="primary"
                  @click="addFieldRule"
                >
                  添加字段规则
                </el-button>
              </div>

              <div class="rules-list">
                <div
                  v-for="rule in fieldRules"
                  :key="rule.id"
                  class="rule-card field-rule"
                  :class="{ active: rule.isActive }"
                >
                  <div class="rule-header">
                    <div class="rule-info">
                      <h4>{{ rule.name }}</h4>
                      <span class="rule-field">{{ rule.entityName }}.{{ rule.fieldName }}</span>
                    </div>
                    <div class="rule-status">
                      <el-switch v-model="rule.isActive" @change="toggleRule(rule)" />
                    </div>
                  </div>
                  <div class="rule-content">
                    <div class="rule-type">
                      <el-tag :type="getValidationTagType(rule.validationType)">
                        {{ getValidationTypeLabel(rule.validationType) }}
                      </el-tag>
                    </div>
                    <div class="rule-expression">{{ rule.expression }}</div>
                    <div class="rule-message">错误消息: {{ rule.errorMessage }}</div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="跨实体规则" name="cross-entity">
            <div class="cross-entity-rules">
              <div class="rules-toolbar">
                <span class="rules-count">{{ crossEntityRules.length }} 个跨实体规则</span>
                <el-button
                  size="small"
                  type="primary"
                  @click="addCrossEntityRule"
                >
                  添加跨实体规则
                </el-button>
              </div>

              <div class="rules-list">
                <div
                  v-for="rule in crossEntityRules"
                  :key="rule.id"
                  class="rule-card cross-entity-rule"
                  :class="{ active: rule.isActive, complex: rule.isComplex }"
                >
                  <div class="rule-header">
                    <div class="rule-info">
                      <h4>{{ rule.name }}</h4>
                      <div class="involved-entities">
                        <el-tag
                          v-for="entityName in rule.involvedEntities"
                          :key="entityName"
                          size="mini"
                          type="info"
                        >
                          {{ entityName }}
                        </el-tag>
                      </div>
                    </div>
                    <div class="rule-status">
                      <el-switch v-model="rule.isActive" @change="toggleRule(rule)" />
                    </div>
                  </div>
                  <div class="rule-content">
                    <div class="rule-description">{{ rule.description }}</div>
                    <div class="rule-logic">
                      <div class="logic-label">业务逻辑:</div>
                      <div class="logic-expression">{{ rule.businessLogic }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="规则模板" name="templates">
            <div class="rule-templates">
              <div class="template-categories">
                <h4>预定义规则模板</h4>
                <div class="template-grid">
                  <div
                    v-for="template in ruleTemplates"
                    :key="template.id"
                    class="template-card"
                    @click="applyRuleTemplate(template)"
                  >
                    <div class="template-icon">
                      <i :class="template.icon" />
                    </div>
                    <div class="template-info">
                      <h4>{{ template.name }}</h4>
                      <p>{{ template.description }}</p>
                      <div class="template-stats">
                        <span>{{ template.rulesCount }} 个规则</span>
                        <span>适用: {{ template.applicableEntities.join(', ') }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <!-- 业务规则编辑对话框 -->
    <el-dialog
      v-model="showRuleDialog"
      :title="editingRule ? '编辑业务规则' : '新建业务规则'"
      width="900px"
    >
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="ruleFormRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规则名称" prop="name">
              <el-input
                v-model="ruleForm.name"
                placeholder="描述性的规则名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规则类型" prop="type">
              <el-select
                v-model="ruleForm.type"
                placeholder="选择规则类型"
                style="width: 100%"
              >
                <el-option label="实体验证规则" value="entity-validation" />
                <el-option label="字段约束规则" value="field-constraint" />
                <el-option label="业务逻辑规则" value="business-logic" />
                <el-option label="数据完整性规则" value="data-integrity" />
                <el-option label="权限控制规则" value="permission-control" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="适用实体" prop="entityName">
          <el-select
            v-model="ruleForm.entityName"
            placeholder="选择适用的实体"
            style="width: 100%"
          >
            <el-option
              v-for="entity in entities"
              :key="entity.id"
              :label="entity.name"
              :value="entity.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="规则描述" prop="description">
          <el-input
            v-model="ruleForm.description"
            type="textarea"
            :rows="2"
            placeholder="详细描述此业务规则的作用和目的"
          />
        </el-form-item>

        <!-- 规则条件配置 -->
        <el-form-item label="触发条件">
          <div class="conditions-builder">
            <div
              v-for="(condition, index) in ruleForm.conditions"
              :key="index"
              class="condition-row"
            >
              <el-select
                v-model="condition.field"
                placeholder="字段"
                style="width: 120px"
              >
                <el-option
                  v-for="field in getEntityFields(ruleForm.entityName)"
                  :key="field.name"
                  :label="field.displayName"
                  :value="field.name"
                />
              </el-select>
              <el-select
                v-model="condition.operator"
                placeholder="操作符"
                style="width: 100px"
              >
                <el-option label="等于" value="equals" />
                <el-option label="不等于" value="not-equals" />
                <el-option label="大于" value="greater-than" />
                <el-option label="小于" value="less-than" />
                <el-option label="包含" value="contains" />
                <el-option label="为空" value="is-null" />
                <el-option label="不为空" value="is-not-null" />
              </el-select>
              <el-input
                v-model="condition.value"
                placeholder="比较值"
                style="width: 150px"
              />
              <el-select
                v-if="index > 0"
                v-model="condition.logicalOperator"
                style="width: 80px"
              >
                <el-option label="且" value="AND" />
                <el-option label="或" value="OR" />
              </el-select>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="removeCondition(index)"
              />
            </div>
            <el-button
              size="small"
              type="dashed"
              icon="el-icon-plus"
              @click="addCondition"
            >
              添加条件
            </el-button>
          </div>
        </el-form-item>

        <!-- 规则动作配置 -->
        <el-form-item label="执行动作">
          <div class="actions-builder">
            <div
              v-for="(action, index) in ruleForm.actions"
              :key="index"
              class="action-row"
            >
              <el-select
                v-model="action.type"
                placeholder="动作类型"
                style="width: 120px"
              >
                <el-option label="设置字段值" value="set-field" />
                <el-option label="显示消息" value="show-message" />
                <el-option label="阻止操作" value="prevent-action" />
                <el-option label="触发事件" value="trigger-event" />
                <el-option label="调用服务" value="call-service" />
                <el-option label="发送通知" value="send-notification" />
              </el-select>
              <el-input
                v-model="action.target"
                placeholder="目标对象"
                style="width: 150px"
              />
              <el-input
                v-model="action.value"
                placeholder="动作值或参数"
                style="width: 200px"
              />
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                @click="removeAction(index)"
              />
            </div>
            <el-button
              size="small"
              type="dashed"
              icon="el-icon-plus"
              @click="addAction"
            >
              添加动作
            </el-button>
          </div>
        </el-form-item>

        <!-- 规则优先级和执行时机 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="执行优先级">
              <el-slider
                v-model="ruleForm.priority"
                :min="1"
                :max="100"
                :step="1"
                show-input
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行时机">
              <el-checkbox-group v-model="ruleForm.executionTiming">
                <el-checkbox label="before-create">创建前</el-checkbox>
                <el-checkbox label="after-create">创建后</el-checkbox>
                <el-checkbox label="before-update">更新前</el-checkbox>
                <el-checkbox label="after-update">更新后</el-checkbox>
                <el-checkbox label="before-delete">删除前</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 高级配置 -->
        <el-collapse v-model="activeCollapse">
          <el-collapse-item title="高级配置" name="advanced">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="异步执行">
                  <el-checkbox v-model="ruleForm.isAsync">
                    启用异步执行
                  </el-checkbox>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="缓存结果">
                  <el-checkbox v-model="ruleForm.cacheResult">
                    缓存规则执行结果
                  </el-checkbox>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="错误处理">
              <el-radio-group v-model="ruleForm.errorHandling">
                <el-radio label="ignore">忽略错误</el-radio>
                <el-radio label="log">记录日志</el-radio>
                <el-radio label="throw">抛出异常</el-radio>
                <el-radio label="retry">重试执行</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="自定义脚本">
              <el-input
                v-model="ruleForm.customScript"
                type="textarea"
                :rows="4"
                placeholder="高级用户可以编写自定义JavaScript脚本"
              />
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showRuleDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="saveRule"
            :loading="savingRule"
          >
            保存规则
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 规则测试结果对话框 -->
    <el-dialog
      v-model="showTestResultDialog"
      title="规则测试结果"
      width="700px"
    >
      <div class="test-results">
        <div class="test-summary">
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">测试规则:</span>
              <span class="stat-value">{{ testResults.totalRules }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">通过:</span>
              <span class="stat-value success">{{ testResults.passed }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">失败:</span>
              <span class="stat-value error">{{ testResults.failed }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">执行时间:</span>
              <span class="stat-value">{{ testResults.executionTime }}ms</span>
            </div>
          </div>
        </div>

        <div class="test-details">
          <div
            v-for="result in testResults.details"
            :key="result.ruleId"
            class="test-result-item"
            :class="result.success ? 'success' : 'error'"
          >
            <div class="result-header">
              <i :class="result.success ? 'el-icon-check' : 'el-icon-close'" />
              <span class="rule-name">{{ result.ruleName }}</span>
              <span class="execution-time">{{ result.executionTime }}ms</span>
            </div>
            <div v-if="!result.success" class="result-error">
              {{ result.error }}
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEntityModelingStore } from '@/stores/lowcode/entityModeling'
import { ElMessage, ElMessageBox } from 'element-plus'

// Store
const entityStore = useEntityModelingStore()

// 响应式数据
const activeRuleCategory = ref('entity')
const showAddRuleDialog = ref(false)
const showRuleDialog = ref(false)
const showTestResultDialog = ref(false)
const testing = ref(false)
const savingRule = ref(false)
const editingRule = ref(null)
const activeCollapse = ref([])

// 规则数据
const entityRules = ref([
  {
    id: 'user-email-unique',
    name: '用户邮箱唯一性检查',
    entityName: 'User',
    description: '确保用户邮箱在系统中唯一',
    isActive: true,
    hasError: false,
    conditions: [
      { id: 1, field: 'Email', operator: 'is-not-null', value: '', logicalOperator: 'AND' }
    ],
    actions: [
      { id: 1, type: 'prevent-action', target: 'Create/Update', value: '邮箱已存在，请使用其他邮箱' }
    ],
    priority: 90,
    executionTiming: ['before-create', 'before-update'],
    lastExecutionResult: {
      success: true,
      timestamp: Date.now() - 3600000,
      message: '规则执行成功'
    }
  },
  {
    id: 'project-date-validation',
    name: '项目日期逻辑检查',
    entityName: 'Project', 
    description: '确保项目结束日期晚于开始日期',
    isActive: true,
    hasError: false,
    conditions: [
      { id: 1, field: 'EndDate', operator: 'less-than', value: 'StartDate' }
    ],
    actions: [
      { id: 1, type: 'show-message', target: 'User', value: '项目结束日期不能早于开始日期' },
      { id: 2, type: 'prevent-action', target: 'Save', value: '阻止保存操作' }
    ],
    priority: 80,
    executionTiming: ['before-create', 'before-update']
  }
])

const fieldRules = ref([
  {
    id: 'phone-format',
    name: '手机号格式验证',
    entityName: 'User',
    fieldName: 'PhoneNumber',
    validationType: 'regex',
    expression: '^1[3-9]\\d{9}$',
    errorMessage: '请输入正确的手机号格式',
    isActive: true
  },
  {
    id: 'budget-range',
    name: '预算范围检查',
    entityName: 'Project',
    fieldName: 'TotalBudget',
    validationType: 'range',
    expression: '1000 <= value <= 999999999',
    errorMessage: '项目预算应在1000-999999999之间',
    isActive: true
  }
])

const crossEntityRules = ref([
  {
    id: 'user-role-consistency',
    name: '用户角色一致性检查',
    description: '确保用户的角色分配符合组织架构约束',
    involvedEntities: ['User', 'Role', 'OrganizationUnit'],
    businessLogic: 'User.OrganizationUnit.AllowedRoles contains User.Roles',
    isActive: true,
    isComplex: true
  },
  {
    id: 'project-budget-approval',
    name: '项目预算审批规则',
    description: '超过一定金额的项目需要上级审批',
    involvedEntities: ['Project', 'User', 'Approval'],
    businessLogic: 'IF Project.TotalBudget > 1000000 THEN RequireApproval(Project.CreatorId.Manager)',
    isActive: true,
    isComplex: true
  }
])

// 规则模板
const ruleTemplates = ref([
  {
    id: 'permission-control-template',
    name: '权限控制规则包',
    description: '完整的权限控制规则模板',
    icon: 'el-icon-lock',
    rulesCount: 8,
    applicableEntities: ['User', 'Role', 'Permission'],
    rules: [
      '用户状态检查规则',
      '角色权限验证规则',
      '权限范围限制规则',
      '用户角色分配规则'
    ]
  },
  {
    id: 'audit-logging-template',
    name: '审计日志规则包',
    description: '完整的审计日志记录规则',
    icon: 'el-icon-document-copy',
    rulesCount: 6,
    applicableEntities: ['*'],
    rules: [
      '创建操作记录规则',
      '更新操作记录规则',
      '删除操作记录规则',
      '敏感操作记录规则'
    ]
  },
  {
    id: 'data-integrity-template',
    name: '数据完整性规则包',
    description: '确保数据完整性和一致性的规则',
    icon: 'el-icon-shield',
    rulesCount: 10,
    applicableEntities: ['*'],
    rules: [
      '外键完整性规则',
      '唯一性约束规则',
      '必填字段验证规则',
      '数据格式验证规则'
    ]
  }
])

// 规则表单
const ruleForm = ref({
  name: '',
  type: 'entity-validation',
  entityName: '',
  description: '',
  conditions: [
    { field: '', operator: 'equals', value: '', logicalOperator: 'AND' }
  ],
  actions: [
    { type: 'show-message', target: '', value: '' }
  ],
  priority: 50,
  executionTiming: ['before-create'],
  isAsync: false,
  cacheResult: false,
  errorHandling: 'log',
  customScript: ''
})

// 表单验证规则
const ruleFormRules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择规则类型', trigger: 'change' }
  ],
  entityName: [
    { required: true, message: '请选择适用实体', trigger: 'change' }
  ]
}

// 测试结果
const testResults = ref({
  totalRules: 0,
  passed: 0,
  failed: 0,
  executionTime: 0,
  details: []
})

// 计算属性
const entities = computed(() => entityStore.entities)

// 方法
const getEntityFields = (entityName) => {
  const entity = entities.value.find(e => e.name === entityName)
  return entity?.fields || []
}

const addEntityRule = () => {
  ruleForm.value = {
    name: '',
    type: 'entity-validation',
    entityName: '',
    description: '',
    conditions: [
      { field: '', operator: 'equals', value: '', logicalOperator: 'AND' }
    ],
    actions: [
      { type: 'show-message', target: '', value: '' }
    ],
    priority: 50,
    executionTiming: ['before-create'],
    isAsync: false,
    cacheResult: false,
    errorHandling: 'log',
    customScript: ''
  }
  editingRule.value = null
  showRuleDialog.value = true
}

const addFieldRule = () => {
  // 添加字段规则的逻辑
  ElMessage.info('字段规则编辑器开发中...')
}

const addCrossEntityRule = () => {
  // 添加跨实体规则的逻辑
  ElMessage.info('跨实体规则编辑器开发中...')
}

const addCondition = () => {
  ruleForm.value.conditions.push({
    field: '',
    operator: 'equals',
    value: '',
    logicalOperator: 'AND'
  })
}

const removeCondition = (index) => {
  ruleForm.value.conditions.splice(index, 1)
}

const addAction = () => {
  ruleForm.value.actions.push({
    type: 'show-message',
    target: '',
    value: ''
  })
}

const removeAction = (index) => {
  ruleForm.value.actions.splice(index, 1)
}

const toggleRule = (rule) => {
  ElMessage.success(`规则"${rule.name}"已${rule.isActive ? '启用' : '禁用'}`)
}

const handleRuleAction = ({ action, rule }) => {
  switch (action) {
    case 'edit':
      editRule(rule)
      break
    case 'test':
      testRule(rule)
      break
    case 'duplicate':
      duplicateRule(rule)
      break
    case 'delete':
      deleteRule(rule)
      break
  }
}

const editRule = (rule) => {
  editingRule.value = rule
  ruleForm.value = { ...rule }
  showRuleDialog.value = true
}

const testRule = async (rule) => {
  try {
    // 模拟规则测试
    const result = await simulateRuleExecution(rule)
    
    ElMessage.success(`规则"${rule.name}"测试${result.success ? '通过' : '失败'}`)
    
    // 更新规则的最后执行结果
    rule.lastExecutionResult = {
      ...result,
      timestamp: Date.now()
    }
    
  } catch (error) {
    ElMessage.error('规则测试失败：' + error.message)
  }
}

const duplicateRule = (rule) => {
  const duplicatedRule = {
    ...rule,
    id: `rule-${Date.now()}`,
    name: `${rule.name} (副本)`,
    isActive: false
  }
  
  entityRules.value.push(duplicatedRule)
  ElMessage.success('规则复制成功')
}

const deleteRule = async (rule) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除规则"${rule.name}"吗？`,
      '确认删除',
      { type: 'warning' }
    )
    
    const index = entityRules.value.findIndex(r => r.id === rule.id)
    if (index > -1) {
      entityRules.value.splice(index, 1)
      ElMessage.success('规则删除成功')
    }
  } catch {
    // 用户取消
  }
}

const saveRule = async () => {
  try {
    savingRule.value = true
    
    // 验证表单
    await ruleFormRef.value?.validate()
    
    if (editingRule.value) {
      // 更新现有规则
      const index = entityRules.value.findIndex(r => r.id === editingRule.value.id)
      if (index > -1) {
        entityRules.value[index] = {
          ...editingRule.value,
          ...ruleForm.value,
          updatedAt: new Date().toISOString()
        }
      }
    } else {
      // 创建新规则
      const newRule = {
        ...ruleForm.value,
        id: `rule-${Date.now()}`,
        isActive: true,
        hasError: false,
        createdAt: new Date().toISOString()
      }
      entityRules.value.push(newRule)
    }
    
    ElMessage.success('业务规则保存成功')
    showRuleDialog.value = false
    
  } catch (error) {
    ElMessage.error('保存规则失败：' + error.message)
  } finally {
    savingRule.value = false
  }
}

const testAllRules = async () => {
  try {
    testing.value = true
    
    const startTime = Date.now()
    const results = []
    
    // 测试所有激活的规则
    const activeRules = [...entityRules.value, ...fieldRules.value, ...crossEntityRules.value]
      .filter(rule => rule.isActive)
    
    for (const rule of activeRules) {
      try {
        const result = await simulateRuleExecution(rule)
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          success: result.success,
          executionTime: result.executionTime,
          error: result.error
        })
      } catch (error) {
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          success: false,
          executionTime: 0,
          error: error.message
        })
      }
    }
    
    const endTime = Date.now()
    
    testResults.value = {
      totalRules: activeRules.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      executionTime: endTime - startTime,
      details: results
    }
    
    showTestResultDialog.value = true
    
  } catch (error) {
    ElMessage.error('规则测试失败：' + error.message)
  } finally {
    testing.value = false
  }
}

const simulateRuleExecution = async (rule) => {
  // 模拟规则执行
  await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
  
  const success = Math.random() > 0.1 // 90% 成功率
  
  return {
    success,
    executionTime: Math.floor(Math.random() * 50 + 10),
    error: success ? null : '模拟执行失败'
  }
}

const applyRuleTemplate = async (template) => {
  try {
    await ElMessageBox.confirm(
      `确定要应用"${template.name}"吗？这将添加 ${template.rulesCount} 个预定义规则。`,
      '确认应用模板',
      { type: 'info' }
    )
    
    // 这里实现规则模板应用逻辑
    ElMessage.success(`已应用规则模板"${template.name}"`)
    
  } catch {
    // 用户取消
  }
}

const importRulesFromTemplate = () => {
  ElMessage.info('从模板导入规则功能开发中...')
}

const getValidationTagType = (type) => {
  const types = {
    'required': 'danger',
    'length': 'warning',
    'range': 'primary',
    'regex': 'success',
    'unique': 'info',
    'custom': 'default'
  }
  return types[type] || 'default'
}

const getValidationTypeLabel = (type) => {
  const labels = {
    'required': '必填验证',
    'length': '长度验证',
    'range': '范围验证',
    'regex': '格式验证',
    'unique': '唯一性验证',
    'custom': '自定义验证'
  }
  return labels[type] || type
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 引用
const ruleFormRef = ref()
</script>

<style scoped>
.business-rules-engine {
  height: 100%;
}

.engine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.engine-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
}

/* 规则列表样式 */
.rules-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.rules-count {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.rule-card.active {
  border-color: var(--el-color-success-light-5);
  background: var(--el-color-success-light-9);
}

.rule-card.error {
  border-color: var(--el-color-danger-light-5);
  background: var(--el-color-danger-light-9);
}

.rule-card.complex {
  border-left: 4px solid var(--el-color-warning);
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.rule-info h4 {
  margin: 0 0 4px 0;
  color: var(--el-text-color-primary);
}

.rule-entity,
.rule-field {
  font-size: 12px;
  color: var(--el-color-primary);
}

.rule-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rule-content {
  margin-bottom: 12px;
}

.rule-description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.rule-conditions,
.rule-actions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-bottom: 8px;
}

.condition-label,
.actions-label,
.logic-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-right: 8px;
}

.rule-type {
  margin-bottom: 8px;
}

.rule-expression {
  font-family: var(--el-font-family-mono, Consolas, monospace);
  font-size: 13px;
  color: var(--el-color-primary);
  background: var(--el-bg-color-page);
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.rule-message {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.rule-result {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--el-bg-color-page);
  border-radius: 6px;
  font-size: 12px;
}

.result-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.result-status.success {
  color: var(--el-color-success);
}

.result-status.error {
  color: var(--el-color-danger);
}

.result-time {
  color: var(--el-text-color-secondary);
}

.involved-entities {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.logic-expression {
  font-family: var(--el-font-family-mono, Consolas, monospace);
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-bg-color-page);
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
}

/* 规则模板样式 */
.rule-templates {
  padding: 16px 0;
}

.template-categories h4 {
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.template-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  gap: 12px;
}

.template-card:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.template-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--el-color-primary-light-8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.template-icon i {
  font-size: 18px;
  color: var(--el-color-primary);
}

.template-info {
  flex: 1;
}

.template-info h4 {
  margin: 0 0 4px 0;
  color: var(--el-text-color-primary);
}

.template-info p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.template-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 条件和动作构建器样式 */
.conditions-builder,
.actions-builder {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.condition-row,
.action-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 测试结果样式 */
.test-results {
  max-height: 60vh;
  overflow-y: auto;
}

.test-summary {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.stat-value.success {
  color: var(--el-color-success);
}

.stat-value.error {
  color: var(--el-color-danger);
}

.test-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.test-result-item {
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}

.test-result-item.success {
  background: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-5);
}

.test-result-item.error {
  background: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger-light-5);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.rule-name {
  flex: 1;
  font-weight: 500;
}

.execution-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.result-error {
  font-size: 13px;
  color: var(--el-color-danger);
  margin-top: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
