<template>
  <div class="enhanced-state-machine">
    <!-- 工作流标题和元数据 -->
    <div class="workflow-header">
      <div class="workflow-info">
        <h3>{{ store.workflowMetadata.name }}</h3>
        <p class="workflow-description">{{ store.workflowMetadata.description }}</p>
        <div class="workflow-stats">
          <el-tag size="small">{{ store.stateCount.total }} 状态</el-tag>
          <el-tag size="small" type="success">{{ store.transitionCount }} 转换</el-tag>
          <el-tag size="small" type="warning">{{ store.ruleCount }} 规则</el-tag>
        </div>
      </div>
      <div class="workflow-actions">
        <el-button 
          size="small" 
          @click="showMetadataDialog = true"
        >
          编辑信息
        </el-button>
        <el-button 
          size="small" 
          type="primary"
          data-testid="generate-code-btn"
          @click="generateCode"
        >
          生成代码
        </el-button>
        <el-dropdown @command="handleTemplateAction">
          <el-button size="small">
            模板 <el-icon><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="save">保存为模板</el-dropdown-item>
              <el-dropdown-item command="load">加载模板</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="state-machine-body">
      <!-- 状态机画布 -->
      <div class="canvas-container">
        <div class="canvas-header">
          <h4>状态机设计器</h4>
          <div class="canvas-tools">
            <el-button-group>
              <el-button size="small" @click="addNewState('start')" :disabled="store.startStates.length > 0">
                <el-icon><plus /></el-icon> 开始状态
              </el-button>
              <el-button size="small" @click="addNewState('intermediate')">
                <el-icon><plus /></el-icon> 中间状态
              </el-button>
              <el-button size="small" @click="addNewState('end')">
                <el-icon><plus /></el-icon> 结束状态
              </el-button>
            </el-button-group>
          </div>
        </div>
        
        <div class="state-machine-canvas" data-testid="state-machine-canvas">
          <!-- 状态节点 -->
          <div 
            v-for="state in store.states" 
            :key="state.id"
            class="state-node"
            :class="`state-${state.type}`"
            :style="{
              left: state.position.x + 'px',
              top: state.position.y + 'px'
            }"
            @click="selectState(state.id)"
          >
            <div class="state-label">{{ state.label }}</div>
            <div class="state-type">{{ getStateTypeLabel(state.type) }}</div>
            <el-button 
              size="small" 
              type="danger" 
              circle 
              class="delete-btn"
              @click.stop="removeState(state.id)"
            >
              <el-icon><close /></el-icon>
            </el-button>
          </div>
          
          <!-- 转换线条 -->
          <svg class="transitions-overlay" :style="canvasStyle">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#409EFF" />
              </marker>
            </defs>
            <line 
              v-for="transition in store.transitions"
              :key="transition.id"
              :x1="getStatePosition(transition.source).x + 50"
              :y1="getStatePosition(transition.source).y + 25"
              :x2="getStatePosition(transition.target).x + 50"
              :y2="getStatePosition(transition.target).y + 25"
              stroke="#409EFF"
              stroke-width="2"
              marker-end="url(#arrowhead)"
              @click="selectTransition(transition.id)"
            />
          </svg>
        </div>
      </div>

      <!-- 侧边栏 -->
      <div class="sidebar">
        <el-tabs v-model="activeTab" class="sidebar-tabs">
          <!-- 状态面板 -->
          <el-tab-pane label="状态" name="states">
            <div class="state-palette" data-testid="state-palette">
              <div class="palette-header">
                <h5>状态类型</h5>
              </div>
              <div class="state-types">
                <div 
                  class="state-type-item"
                  :class="{ disabled: type === 'start' && store.startStates.length > 0 }"
                  v-for="type in ['start', 'intermediate', 'end']"
                  :key="type"
                  @click="addNewState(type as 'start' | 'intermediate' | 'end')"
                >
                  <div :class="`state-icon state-${type}`"></div>
                  <span>{{ getStateTypeLabel(type) }}</span>
                </div>
              </div>
              
              <div class="states-list">
                <h5>当前状态</h5>
                <div 
                  v-for="state in store.states"
                  :key="state.id"
                  class="state-list-item"
                  :class="{ selected: selectedState === state.id }"
                  @click="selectState(state.id)"
                >
                  <div :class="`state-indicator state-${state.type}`"></div>
                  <span class="state-name">{{ state.label }}</span>
                  <el-button 
                    size="small" 
                    type="text" 
                    @click.stop="removeState(state.id)"
                  >
                    <el-icon><delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 转换面板 -->
          <el-tab-pane label="转换" name="transitions">
            <div class="transition-panel" data-testid="transition-panel">
              <div class="panel-header">
                <h5>状态转换</h5>
                <el-button 
                  size="small" 
                  type="primary"
                  @click="showTransitionDialog = true"
                  :disabled="store.states.length < 2"
                >
                  添加转换
                </el-button>
              </div>
              
              <div class="transitions-list">
                <div 
                  v-for="transition in store.transitions"
                  :key="transition.id"
                  class="transition-item"
                  :class="{ selected: selectedTransition === transition.id }"
                  @click="selectTransition(transition.id)"
                >
                  <div class="transition-path">
                    {{ getStateName(transition.source) }} → {{ getStateName(transition.target) }}
                  </div>
                  <div class="transition-condition" v-if="transition.condition">
                    条件: {{ transition.condition }}
                  </div>
                  <div class="transition-action" v-if="transition.action">
                    动作: {{ transition.action }}
                  </div>
                  <el-button 
                    size="small" 
                    type="text" 
                    @click.stop="removeTransition(transition.id)"
                  >
                    <el-icon><delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 业务规则面板 -->
          <el-tab-pane label="规则" name="rules">
            <div class="business-rules-panel" data-testid="business-rules-panel">
              <div class="panel-header">
                <h5>业务规则</h5>
                <el-button 
                  size="small" 
                  type="primary"
                  data-testid="add-rule-btn"
                  @click="showRuleDialog = true"
                >
                  添加规则
                </el-button>
              </div>
              
              <div class="rules-list">
                <div 
                  v-for="rule in store.businessRules"
                  :key="rule.id"
                  class="rule-item"
                  :class="{ disabled: !rule.enabled }"
                >
                  <div class="rule-header">
                    <span class="rule-name">{{ rule.id }}</span>
                    <el-tag size="small" :type="getRuleTypeColor(rule.type)">
                      {{ getRuleTypeLabel(rule.type) }}
                    </el-tag>
                  </div>
                  <div class="rule-details">
                    <div class="rule-trigger">触发: {{ rule.trigger }}</div>
                    <div class="rule-condition" v-if="rule.condition">
                      条件: {{ rule.condition }}
                    </div>
                    <div class="rule-action">动作: {{ rule.action }}</div>
                  </div>
                  <div class="rule-actions">
                    <el-switch 
                      v-model="rule.enabled" 
                      size="small"
                      @change="toggleRule(rule.id)"
                    />
                    <el-button 
                      size="small" 
                      type="text" 
                      @click="removeRule(rule.id)"
                    >
                      <el-icon><delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 代码预览面板 -->
          <el-tab-pane label="代码" name="code">
            <div class="code-preview-panel" data-testid="code-preview-panel">
              <div class="panel-header">
                <h5>代码预览</h5>
                <el-button-group>
                  <el-button 
                    size="small"
                    :type="codeType === 'frontend' ? 'primary' : ''"
                    @click="codeType = 'frontend'"
                  >
                    前端
                  </el-button>
                  <el-button 
                    size="small"
                    :type="codeType === 'backend' ? 'primary' : ''"
                    @click="codeType = 'backend'"
                  >
                    后端
                  </el-button>
                  <el-button 
                    size="small"
                    :type="codeType === 'policies' ? 'primary' : ''"
                    @click="codeType = 'policies'"
                  >
                    策略
                  </el-button>
                </el-button-group>
              </div>
              
              <div class="code-content">
                <pre><code>{{ generatedCode }}</code></pre>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 验证警告 -->
    <div v-if="validationResult && !validationResult.isValid" class="validation-warnings" data-testid="validation-warnings">
      <el-alert
        title="状态机验证警告"
        type="warning"
        :closable="false"
      >
        <div v-for="error in validationResult.errors" :key="error" class="error-item">
          {{ error }}
        </div>
      </el-alert>
    </div>

    <!-- 元数据编辑对话框 -->
    <el-dialog v-model="showMetadataDialog" title="编辑工作流信息" width="500px">
      <el-form :model="metadataForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="metadataForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="metadataForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="实体">
          <el-input v-model="metadataForm.entity" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showMetadataDialog = false">取消</el-button>
        <el-button type="primary" @click="saveMetadata">保存</el-button>
      </template>
    </el-dialog>

    <!-- 转换编辑对话框 -->
    <el-dialog v-model="showTransitionDialog" title="添加状态转换" width="600px">
      <el-form :model="transitionForm" label-width="80px">
        <el-form-item label="源状态">
          <el-select v-model="transitionForm.source" placeholder="选择源状态">
            <el-option 
              v-for="state in sourceStates"
              :key="state.id"
              :label="state.label"
              :value="state.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标状态">
          <el-select v-model="transitionForm.target" placeholder="选择目标状态">
            <el-option 
              v-for="state in targetStates"
              :key="state.id"
              :label="state.label"
              :value="state.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="转换条件">
          <el-input 
            v-model="transitionForm.condition" 
            placeholder="例如: user.role === 'admin'"
          />
        </el-form-item>
        <el-form-item label="执行动作">
          <el-input 
            v-model="transitionForm.action" 
            placeholder="例如: sendNotification('approved')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTransitionDialog = false">取消</el-button>
        <el-button type="primary" @click="saveTransition">保存</el-button>
      </template>
    </el-dialog>

    <!-- 业务规则编辑对话框 -->
    <el-dialog v-model="showRuleDialog" title="添加业务规则" width="600px">
      <el-form :model="ruleForm" label-width="80px">
        <el-form-item label="规则类型">
          <el-select v-model="ruleForm.type" data-testid="rule-type-selector">
            <el-option label="字段联动" value="field-linkage" />
            <el-option label="权限约束" value="permission-constraint" />
            <el-option label="异步验证" value="async-validation" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="规则ID">
          <el-input v-model="ruleForm.id" placeholder="规则唯一标识" />
        </el-form-item>
        <el-form-item label="触发条件">
          <el-input v-model="ruleForm.trigger" placeholder="触发字段或事件" />
        </el-form-item>
        <el-form-item label="执行条件">
          <el-input v-model="ruleForm.condition" placeholder="例如: value > 100" />
        </el-form-item>
        <el-form-item label="执行动作">
          <el-input v-model="ruleForm.action" placeholder="例如: setField('discount', 10)" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="ruleForm.priority" :min="0" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRuleDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  Plus, Close, Delete, ArrowDown
} from "@element-plus/icons-vue"
import { useEnhancedStateMachineStore } from "@/stores/lowcode/enhancedStateMachine"
import { logger } from "@/utils/logging"

const store = useEnhancedStateMachineStore()

// === 响应式状态 ===
const activeTab = ref("states")
const selectedState = ref<string | null>(null)
const selectedTransition = ref<string | null>(null)
const codeType = ref<"frontend" | "backend" | "policies">("frontend")

// 对话框状态
const showMetadataDialog = ref(false)
const showTransitionDialog = ref(false)
const showRuleDialog = ref(false)

// 表单数据
const metadataForm = ref({
  name: "",
  description: "",
  entity: ""
})

const transitionForm = ref({
  source: "",
  target: "",
  condition: "",
  action: ""
})

const ruleForm = ref({
  id: "",
  type: "field-linkage" as const,
  trigger: "",
  condition: "",
  action: "",
  priority: 0
})

// === 计算属性 ===

const canvasStyle = computed(() => ({
  width: "100%",
  height: "400px",
  position: "absolute" as const,
  top: "0",
  left: "0",
  pointerEvents: "none" as const
}))

const sourceStates = computed(() => 
  store.states.filter(s => s.type !== "end")
)

const targetStates = computed(() => 
  store.states.filter(s => s.type !== "start")
)

const validationResult = computed(() => store.validateStateMachine())

const generatedCode = computed(() => {
  const workflowName = store.workflowMetadata.name.replace(/\s+/g, '')
  switch (codeType.value) {
    case "frontend":
      return store.generateFrontendHooks(workflowName)
    case "backend":
      return store.generateBackendHandlers(workflowName)
    case "policies":
      return store.generatePolicies(workflowName)
    default:
      return ""
  }
})

// === 方法 ===

const getStateTypeLabel = (type: string): string => {
  const labels = {
    start: "开始",
    intermediate: "中间",
    end: "结束"
  }
  return labels[type as keyof typeof labels] || type
}

const getRuleTypeLabel = (type: string): string => {
  const labels = {
    "field-linkage": "字段联动",
    "permission-constraint": "权限约束", 
    "async-validation": "异步验证",
    "custom": "自定义"
  }
  return labels[type as keyof typeof labels] || type
}

const getRuleTypeColor = (type: string): "primary" | "success" | "warning" | "info" | "danger" | undefined => {
  const colors: Record<string, "primary" | "success" | "warning" | "info" | "danger"> = {
    "field-linkage": "primary",
    "permission-constraint": "warning",
    "async-validation": "info", 
    "custom": "success"
  }
  return colors[type as keyof typeof colors]
}

const getStateName = (stateId: string): string => {
  const state = store.states.find(s => s.id === stateId)
  return state?.label || stateId
}

const getStatePosition = (stateId: string) => {
  const state = store.states.find(s => s.id === stateId)
  return state?.position || { x: 0, y: 0 }
}

// 状态操作
const addNewState = (type: "start" | "intermediate" | "end") => {
  if (type === "start" && store.startStates.length > 0) {
    ElMessage.warning("只能有一个开始状态")
    return
  }
  
  const stateId = `${type}_${Date.now()}`
  const position = {
    x: store.states.length * 150 + 50,
    y: 100
  }
  
  try {
    store.addState({
      id: stateId,
      type,
      label: `${getStateTypeLabel(type)}${store.states.length + 1}`,
      position
    })
    
    selectedState.value = stateId
    ElMessage.success(`添加${getStateTypeLabel(type)}状态成功`)
  } catch (error) {
    ElMessage.error(String(error))
  }
}

const selectState = (stateId: string) => {
  selectedState.value = stateId
  selectedTransition.value = null
}

const removeState = (stateId: string) => {
  try {
    store.removeState(stateId)
    if (selectedState.value === stateId) {
      selectedState.value = null
    }
    ElMessage.success("删除状态成功")
  } catch (error) {
    ElMessage.error(String(error))
  }
}

// 转换操作
const selectTransition = (transitionId: string) => {
  selectedTransition.value = transitionId
  selectedState.value = null
}

const removeTransition = (transitionId: string) => {
  store.removeTransition(transitionId)
  if (selectedTransition.value === transitionId) {
    selectedTransition.value = null
  }
  ElMessage.success("删除转换成功")
}

const saveTransition = () => {
  if (!transitionForm.value.source || !transitionForm.value.target) {
    ElMessage.error("请选择源状态和目标状态")
    return
  }
  
  try {
    store.addTransition({
      id: `${transitionForm.value.source}_${transitionForm.value.target}_${Date.now()}`,
      source: transitionForm.value.source,
      target: transitionForm.value.target,
      condition: transitionForm.value.condition,
      action: transitionForm.value.action
    })
    
    showTransitionDialog.value = false
    transitionForm.value = { source: "", target: "", condition: "", action: "" }
    ElMessage.success("添加转换成功")
  } catch (error) {
    ElMessage.error(String(error))
  }
}

// 业务规则操作
const saveRule = () => {
  if (!ruleForm.value.id || !ruleForm.value.trigger || !ruleForm.value.action) {
    ElMessage.error("请填写必要的规则信息")
    return
  }
  
  try {
    store.addBusinessRule({
      id: ruleForm.value.id,
      type: ruleForm.value.type,
      trigger: ruleForm.value.trigger,
      condition: ruleForm.value.condition,
      action: ruleForm.value.action,
      priority: ruleForm.value.priority
    })
    
    showRuleDialog.value = false
    ruleForm.value = {
      id: "",
      type: "field-linkage",
      trigger: "",
      condition: "",
      action: "",
      priority: 0
    }
    ElMessage.success("添加业务规则成功")
  } catch (error) {
    ElMessage.error(String(error))
  }
}

const removeRule = (ruleId: string) => {
  store.removeBusinessRule(ruleId)
  ElMessage.success("删除业务规则成功")
}

const toggleRule = (ruleId: string) => {
  logger.debug(`切换规则状态: ${ruleId}`)
}

// 元数据操作
const saveMetadata = () => {
  store.setWorkflowMetadata(metadataForm.value)
  showMetadataDialog.value = false
  ElMessage.success("保存工作流信息成功")
}

// 代码生成
const generateCode = () => {
  const validation = store.validateStateMachine()
  if (!validation.isValid) {
    ElMessage.error("状态机验证失败，请修复错误后重试")
    return
  }
  
  const codePackage = store.generateCompleteCodePackage()
  logger.info("代码生成完成", codePackage.metadata)
  ElMessage.success("代码生成成功")
  
  // 切换到代码预览标签
  activeTab.value = "code"
}

// 模板操作
const handleTemplateAction = (command: string) => {
  switch (command) {
    case "save":
      saveAsTemplate()
      break
    case "load":
      loadTemplate()
      break
  }
}

const saveAsTemplate = async () => {
  try {
    const { value: templateName } = await ElMessageBox.prompt(
      "请输入模板名称",
      "保存为模板",
      { inputValue: store.workflowMetadata.name + "模板" }
    )
    
    if (templateName) {
      store.addWorkflowTemplate({
        id: `template_${Date.now()}`,
        name: templateName,
        description: `基于${store.workflowMetadata.name}创建的模板`,
        states: store.states.map(s => s.id),
        rules: store.businessRules.map(r => r.id)
      })
      
      ElMessage.success("保存模板成功")
    }
  } catch {
    // 用户取消
  }
}

const loadTemplate = async () => {
  const templates = store.workflowTemplates
  if (templates.length === 0) {
    ElMessage.info("暂无可用模板")
    return
  }
  
  // 这里应该显示模板选择对话框
  ElMessage.info("模板加载功能开发中")
}

// 初始化
watch(() => store.workflowMetadata, (metadata) => {
  metadataForm.value = { 
    name: metadata.name || "",
    description: metadata.description || "",
    entity: metadata.entity || ""
  }
}, { immediate: true })

onMounted(() => {
  logger.info("EnhancedStateMachine mounted")
})
</script>

<style scoped>
.enhanced-state-machine {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color-page);
}

.workflow-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
}

.workflow-info h3 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.workflow-description {
  margin: 0 0 8px 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.workflow-stats {
  display: flex;
  gap: 8px;
}

.workflow-actions {
  display: flex;
  gap: 8px;
}

.state-machine-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--el-fill-color-extra-light);
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
}

.canvas-header h4 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.state-machine-canvas {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: 
    radial-gradient(circle, var(--el-border-color-light) 1px, transparent 1px);
  background-size: 20px 20px;
}

.state-node {
  position: absolute;
  width: 100px;
  height: 50px;
  border: 2px solid var(--el-color-primary);
  border-radius: 8px;
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.state-node:hover {
  box-shadow: var(--el-box-shadow);
  transform: scale(1.05);
}

.state-node.state-start {
  border-color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}

.state-node.state-end {
  border-color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}

.state-node.state-intermediate {
  border-color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}

.state-label {
  font-size: 12px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.state-type {
  font-size: 10px;
  color: var(--el-text-color-secondary);
}

.delete-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  min-height: 16px;
  opacity: 0;
  transition: opacity 0.2s;
}

.state-node:hover .delete-btn {
  opacity: 1;
}

.transitions-overlay {
  pointer-events: auto;
}

.transitions-overlay line {
  cursor: pointer;
}

.transitions-overlay line:hover {
  stroke-width: 3;
}

.sidebar {
  width: 320px;
  background: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
}

.sidebar-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sidebar-tabs :deep(.el-tabs__content) {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.palette-header,
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.palette-header h5,
.panel-header h5 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.state-types {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.state-type-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.state-type-item:hover:not(.disabled) {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.state-type-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.state-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.state-icon.state-start {
  background: var(--el-color-success);
}

.state-icon.state-intermediate {
  background: var(--el-color-warning);
}

.state-icon.state-end {
  background: var(--el-color-danger);
}

.states-list,
.transitions-list,
.rules-list {
  max-height: 300px;
  overflow-y: auto;
}

.state-list-item,
.transition-item,
.rule-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.state-list-item:hover,
.transition-item:hover,
.rule-item:hover {
  border-color: var(--el-color-primary);
}

.state-list-item.selected,
.transition-item.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.state-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.state-indicator.state-start {
  background: var(--el-color-success);
}

.state-indicator.state-intermediate {
  background: var(--el-color-warning);
}

.state-indicator.state-end {
  background: var(--el-color-danger);
}

.state-name {
  flex: 1;
  font-size: 14px;
}

.transition-item {
  flex-direction: column;
  align-items: flex-start;
}

.transition-path {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.transition-condition,
.transition-action {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.rule-item {
  flex-direction: column;
  align-items: flex-start;
}

.rule-item.disabled {
  opacity: 0.6;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.rule-name {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.rule-details {
  width: 100%;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.rule-trigger,
.rule-condition,
.rule-action {
  margin: 2px 0;
}

.rule-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 8px;
}

.code-content {
  background: var(--el-fill-color-extra-light);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.code-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.validation-warnings {
  padding: 16px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
}

.error-item {
  color: var(--el-color-warning);
  font-size: 14px;
  margin: 4px 0;
}
</style>
