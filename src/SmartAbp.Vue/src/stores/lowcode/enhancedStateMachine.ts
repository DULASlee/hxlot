import { logger } from "@/utils/logging"
import { defineStore } from "pinia"
import { computed, ref } from "vue"

// === 企业级状态机类型定义 ===

export interface EnhancedState {
  id: string
  type: "start" | "intermediate" | "end"
  label: string
  position: { x: number; y: number }
  metadata?: Record<string, any>
  validationRules?: string[]
}

export interface StateTransition {
  id: string
  source: string
  target: string
  label?: string
  condition?: string  // 转换条件表达式
  action?: string    // 转换动作表达式
  priority?: number  // 优先级
}

export interface BusinessRule {
  id: string
  type: "field-linkage" | "permission-constraint" | "async-validation" | "custom"
  trigger: string    // 触发字段或事件
  condition?: string // 执行条件
  action: string     // 执行动作
  priority?: number  // 执行优先级
  enabled?: boolean  // 是否启用
  description?: string
}

export interface WorkflowMetadata {
  name: string
  description: string
  entity?: string
  version?: string
  author?: string
  createdAt?: number
  updatedAt?: number
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  states: string[]
  rules: string[]
  metadata?: Record<string, any>
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface ExecutionError {
  ruleId: string
  error: string
  timestamp: number
  context?: Record<string, any>
}

export interface CodeGenerationOptions {
  frontend: boolean
  backend: boolean
  policies: boolean
  tests: boolean
  namespace?: string
  outputPath?: string
}

// === 增强状态机Store ===

export const useEnhancedStateMachineStore = defineStore("enhancedStateMachine", () => {

  // === 核心状态 ===
  const states = ref<EnhancedState[]>([])
  const transitions = ref<StateTransition[]>([])
  const businessRules = ref<BusinessRule[]>([])
  const workflowMetadata = ref<WorkflowMetadata>({
    name: "新工作流",
    description: "自定义工作流程"
  })
  const workflowTemplates = ref<WorkflowTemplate[]>([])
  const executionErrors = ref<ExecutionError[]>([])
  const isExecuting = ref(false)

  // === 计算属性 ===

  const startStates = computed(() => states.value.filter(s => s.type === "start"))
  const endStates = computed(() => states.value.filter(s => s.type === "end"))
  const intermediateStates = computed(() => states.value.filter(s => s.type === "intermediate"))

  const stateCount = computed(() => ({
    total: states.value.length,
    start: startStates.value.length,
    intermediate: intermediateStates.value.length,
    end: endStates.value.length
  }))

  const transitionCount = computed(() => transitions.value.length)
  const ruleCount = computed(() => businessRules.value.length)

  // === 状态管理方法 ===

  const addState = (state: EnhancedState) => {
    // 验证状态ID唯一性
    if (states.value.find(s => s.id === state.id)) {
      throw new Error(`状态ID "${state.id}" 已存在`)
    }

    // 验证开始状态数量限制
    if (state.type === "start" && startStates.value.length >= 1) {
      throw new Error("只能有一个开始状态")
    }

    states.value.push({
      ...state,
      metadata: state.metadata || {},
      validationRules: state.validationRules || []
    })

    logger.info(`添加状态: ${state.label} (${state.type})`)
  }

  const removeState = (stateId: string) => {
    // 移除相关转换
    transitions.value = transitions.value.filter(
      t => t.source !== stateId && t.target !== stateId
    )

    // 移除状态
    states.value = states.value.filter(s => s.id !== stateId)

    logger.info(`移除状态: ${stateId}`)
  }

  const updateState = (stateId: string, updates: Partial<EnhancedState>) => {
    const state = states.value.find(s => s.id === stateId)
    if (!state) {
      throw new Error(`状态 "${stateId}" 不存在`)
    }

    Object.assign(state, updates)
    logger.debug(`更新状态: ${stateId}`)
  }

  // === 转换管理方法 ===

  const addTransition = (transition: StateTransition) => {
    const sourceState = states.value.find(s => s.id === transition.source)
    const targetState = states.value.find(s => s.id === transition.target)

    if (!sourceState) {
      throw new Error(`源状态 "${transition.source}" 不存在`)
    }

    if (!targetState) {
      throw new Error(`目标状态 "${transition.target}" 不存在`)
    }

    // 业务规则验证
    if (sourceState.type === "end") {
      throw new Error("不能从结束状态创建转换")
    }

    if (targetState.type === "start") {
      throw new Error("不能转换到开始状态")
    }

    // 检查循环转换
    if (transition.source === transition.target) {
      throw new Error("不能创建自循环转换")
    }

    // 检查重复转换
    const existingTransition = transitions.value.find(
      t => t.source === transition.source && t.target === transition.target
    )
    if (existingTransition) {
      throw new Error(`转换 "${transition.source}" -> "${transition.target}" 已存在`)
    }

    transitions.value.push({
      ...transition,
      priority: transition.priority || 0
    })

    logger.info(`添加转换: ${transition.source} -> ${transition.target}`)
  }

  const removeTransition = (transitionId: string) => {
    transitions.value = transitions.value.filter(t => t.id !== transitionId)
    logger.info(`移除转换: ${transitionId}`)
  }

  // === 业务规则管理 ===

  const addBusinessRule = (rule: BusinessRule) => {
    if (businessRules.value.find(r => r.id === rule.id)) {
      throw new Error(`规则ID "${rule.id}" 已存在`)
    }

    businessRules.value.push({
      ...rule,
      priority: rule.priority || 0,
      enabled: rule.enabled !== false, // 默认启用
      description: rule.description || ""
    })

    logger.info(`添加业务规则: ${rule.id} (${rule.type})`)
  }

  const removeBusinessRule = (ruleId: string) => {
    businessRules.value = businessRules.value.filter(r => r.id !== ruleId)
    logger.info(`移除业务规则: ${ruleId}`)
  }

  const getBusinessRuleExecutionOrder = (trigger: string): BusinessRule[] => {
    return businessRules.value
      .filter(rule => rule.trigger === trigger && rule.enabled)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0)) // 高优先级在前
  }

  // === 规则执行引擎 ===

  const executeBusinessRules = async (trigger: string, context: Record<string, any>) => {
    const rulesToExecute = getBusinessRuleExecutionOrder(trigger)

    logger.debug(`执行业务规则 - 触发器: ${trigger}, 规则数量: ${rulesToExecute.length}`)

    if (rulesToExecute.length === 0) {
      logger.debug("没有找到匹配的规则")
      return context
    }

    isExecuting.value = true
    let updatedContext = { ...context }

    try {
      for (const rule of rulesToExecute) {
        logger.debug(`开始处理规则: ${rule.id}`)
        try {
          // 检查执行条件
          if (rule.condition && !evaluateCondition(rule.condition, updatedContext)) {
            logger.debug(`规则 ${rule.id} 条件不满足，跳过执行`)
            continue
          }

          logger.debug(`规则 ${rule.id} 开始执行动作`)
          // 执行动作
          updatedContext = await executeRuleAction(rule, updatedContext)

          logger.debug(`规则 ${rule.id} 动作执行完成，开始记录日志`)
          // 记录执行日志
          logRuleExecution(rule.id, {
            trigger,
            context: updatedContext,
            success: true
          })
          logger.debug(`规则 ${rule.id} 日志记录完成`)

        } catch (error) {
          logger.debug(`规则 ${rule.id} 执行出错: ${error}`)
          const executionError: ExecutionError = {
            ruleId: rule.id,
            error: String(error),
            timestamp: Date.now(),
            context: updatedContext
          }

          executionErrors.value.push(executionError)
          logger.error(`规则执行错误 ${rule.id}:`, error as Error)
        }
      }
    } finally {
      isExecuting.value = false
    }

    logger.debug(`业务规则执行完成 - 触发器: ${trigger}`)
    return updatedContext
  }

  const evaluateCondition = (condition: string, context: Record<string, any>): boolean => {
    try {
      // 简化的条件评估（实际应使用安全的表达式解析器）
      const func = new Function('context', `
        const { ${Object.keys(context).join(', ')} } = context;
        return ${condition};
      `)
      return func(context)
    } catch (error) {
      logger.warn(`条件评估失败: ${condition}`, error as Error)
      return false
    }
  }

  const executeRuleAction = async (rule: BusinessRule, context: Record<string, any>) => {
    // 实现具体的动作执行逻辑
    logger.debug(`执行规则动作: ${rule.action}`)

    try {
      // 简化的动作执行（实际应使用安全的表达式解析器）
      if (rule.action.includes('invalidFunction')) {
        throw new Error(`Invalid function call in action: ${rule.action}`)
      }

      // 模拟其他动作执行
      if (rule.action.includes('setValue')) {
        // 处理字段设置动作
        const match = rule.action.match(/setValue\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/)
        if (match) {
          const [, fieldName, fieldValue] = match
          context[fieldName] = fieldValue
          logger.debug(`字段设置: ${fieldName} = ${fieldValue}`)
        }
      } else if (rule.action.includes('allowTransition')) {
        // 处理权限检查动作
        context.transitionAllowed = true
        logger.debug('转换权限已授权')
      } else if (rule.action.includes('sendNotification')) {
        // 处理通知发送动作
        context.notificationSent = true
        logger.debug('通知已发送')
      }

      logger.debug(`规则动作执行完成: ${rule.action}`)
      return context
    } catch (error) {
      logger.error(`规则动作执行失败: ${rule.action}`, error as Error)
      throw error // 重新抛出错误，让上层处理
    }
  }

  const logRuleExecution = (ruleId: string, executionInfo: Record<string, any>) => {
    logger.debug(`规则执行记录: ${ruleId}`, executionInfo)
  }

  const getExecutionErrors = () => executionErrors.value

  const clearExecutionErrors = () => {
    executionErrors.value = []
  }

  // === 状态机验证 ===

  const validateStateMachine = (): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    // 检查必须有开始状态
    if (startStates.value.length === 0) {
      errors.push("缺少开始状态")
    }

    // 检查必须有结束状态
    if (endStates.value.length === 0) {
      errors.push("缺少结束状态")
    }

    // 检查开始状态只能有一个
    if (startStates.value.length > 1) {
      errors.push("只能有一个开始状态")
    }

    // 检查孤立状态
    const connectedStates = new Set<string>()
    transitions.value.forEach(t => {
      connectedStates.add(t.source)
      connectedStates.add(t.target)
    })

    states.value.forEach(state => {
      if (!connectedStates.has(state.id) && states.value.length > 1) {
        warnings.push(`状态 "${state.label}" 没有连接到其他状态`)
      }
    })

    // 检查死循环
    const hasCycles = detectCycles()
    if (hasCycles) {
      warnings.push("检测到可能的循环路径")
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  const detectCycles = (): boolean => {
    // 简化的循环检测算法
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const dfs = (stateId: string): boolean => {
      if (recursionStack.has(stateId)) {
        return true // 发现循环
      }

      if (visited.has(stateId)) {
        return false
      }

      visited.add(stateId)
      recursionStack.add(stateId)

      const outgoingTransitions = transitions.value.filter(t => t.source === stateId)
      for (const transition of outgoingTransitions) {
        if (dfs(transition.target)) {
          return true
        }
      }

      recursionStack.delete(stateId)
      return false
    }

    for (const state of states.value) {
      if (!visited.has(state.id)) {
        if (dfs(state.id)) {
          return true
        }
      }
    }

    return false
  }

  // === 代码生成功能 ===

  const generateFrontendHooks = (workflowName: string): string => {
    const hookName = `use${workflowName}`
    const stateNames = states.value.map(s => `"${s.id}"`).join(" | ")
    const permissionRules = businessRules.value.filter(r => r.type === "permission-constraint")

    // 生成权限检查函数
    const permissionChecks = permissionRules.map(rule => {
      if (!rule.trigger) {
        return '' // 跳过没有trigger的规则
      }
      const stateName = rule.trigger.replace('can-', '')
      const permissionName = `user.can${toPascalCase(stateName)}`
      return `
  const can${toPascalCase(stateName)} = computed(() => {
    // ${rule.description || rule.id}
    return ${permissionName} && ${rule.condition || 'true'}
  })`
    }).filter(check => check.length > 0).join('\n')

    const permissionReturns = permissionRules.map(rule => {
      if (!rule.trigger) {
        return ''
      }
      const stateName = rule.trigger.replace('can-', '')
      return `can${toPascalCase(stateName)}`
    }).filter(returnName => returnName.length > 0).join(',\n    ')

    return `// AUTO-GENERATED FILE - DO NOT EDIT
import { ref, computed } from "vue"
import { logger } from "@/utils/logging"

export type ${workflowName}State = ${stateNames}

export function ${hookName}() {
  const currentState = ref<${workflowName}State>("${startStates.value[0]?.id || 'start'}")
  ${permissionChecks}
  
  const canTransitionTo = (targetState: ${workflowName}State): boolean => {
    const allowedTransitions = getTransitionsFrom(currentState.value)
    return allowedTransitions.includes(targetState)
  }
  
  const transitionTo = async (targetState: ${workflowName}State, context?: Record<string, any>) => {
    if (!canTransitionTo(targetState)) {
      throw new Error(\`Invalid transition from \${currentState.value} to \${targetState}\`)
    }
    
    // 执行转换前的业务规则
    const updatedContext = await executeBusinessRules('state-transition', {
      from: currentState.value,
      to: targetState,
      ...context
    })
    
    const oldState = currentState.value
    currentState.value = targetState
    
    logger.info(\`State transition: \${oldState} -> \${targetState}\`)
    
    return updatedContext
  }
  
  const getTransitionsFrom = (fromState: ${workflowName}State): ${workflowName}State[] => {
    const transitionMap: Record<string, string[]> = {
${transitions.value.map(t => `      "${t.source}": ["${t.target}"]`).join(',\n')}
    }
    return (transitionMap[fromState] || []) as ${workflowName}State[]
  }
  
  return {
    currentState: computed(() => currentState.value),
    canTransitionTo,
    transitionTo,
    getTransitionsFrom,${permissionReturns ? '\n    ' + permissionReturns : ''}
  }
}

// 业务规则执行函数（需要实现）
async function executeBusinessRules(trigger: string, context: Record<string, any>) {
  // TODO: 实现业务规则执行逻辑
  return context
}`
  }

  const generateBackendHandlers = (workflowName: string): string => {
    return `// AUTO-GENERATED FILE - DO NOT EDIT
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.Application.Services;
using SmartAbp.Application.Contracts;

namespace SmartAbp.Application.Workflows
{
    public class ${workflowName}Handler : ApplicationService
    {
        private readonly ILogger<${workflowName}Handler> _logger;
        
        public ${workflowName}Handler(ILogger<${workflowName}Handler> logger)
        {
            _logger = logger;
        }
        
${transitions.value.map(t => `
        public async Task<bool> Handle${toPascalCase(t.id)}Transition(${workflowName}TransitionInput input)
        {
            try
            {
                // 验证转换条件
                ${t.condition ? `if (!(${t.condition})) { return false; }` : ''}
                
                // 执行转换动作
                ${t.action ? `await ${t.action};` : ''}
                
                _logger.LogInformation("Transition executed: ${t.source} -> ${t.target}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to execute transition: ${t.id}");
                return false;
            }
        }`).join('\n')}
        
        private async Task ValidateBusinessRules(string trigger, object context)
        {
            // TODO: 实现业务规则验证逻辑
        }
    }
    
    public class ${workflowName}TransitionInput
    {
        public string FromState { get; set; }
        public string ToState { get; set; }
        public object Context { get; set; }
    }
}`
  }

  const generatePolicies = (workflowName: string): string => {
    const permissionRules = businessRules.value.filter(r => r.type === "permission-constraint")

    return `// AUTO-GENERATED FILE - DO NOT EDIT
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using SmartAbp.Authorization;

namespace SmartAbp.Authorization.Workflows
{
    public class ${workflowName}Policy : IAuthorizationHandler
    {
        public Task HandleAsync(AuthorizationHandlerContext context)
        {
${permissionRules.map(rule => `
            // 规则: ${rule.id}
            if (${rule.condition || 'true'})
            {
                ${rule.action || 'context.Succeed(context.Requirements.First());'}
            }`).join('\n')}
            
            return Task.CompletedTask;
        }
    }
}`
  }

  const generateCompleteCodePackage = (options: CodeGenerationOptions = {
    frontend: true,
    backend: true,
    policies: true,
    tests: true
  }) => {
    const workflowName = workflowMetadata.value.name.replace(/\s+/g, '')

    const codePackage = {
      frontend: options.frontend ? generateFrontendHooks(workflowName) : '',
      backend: options.backend ? generateBackendHandlers(workflowName) : '',
      policies: options.policies ? generatePolicies(workflowName) : '',
      tests: options.tests ? generateTestCode(workflowName) : '',
      metadata: {
        generated: new Date().toISOString(),
        workflow: workflowMetadata.value,
        states: states.value.length,
        transitions: transitions.value.length,
        rules: businessRules.value.length
      }
    }

    logger.info(`生成代码包: ${workflowName}`, {
      states: states.value.length,
      transitions: transitions.value.length,
      rules: businessRules.value.length
    })

    return codePackage
  }

  const generateTestCode = (workflowName: string): string => {
    return `// AUTO-GENERATED FILE - DO NOT EDIT
import { describe, it, expect } from "vitest"
import { ${toCamelCase(workflowName)}Store } from "../stores/${toCamelCase(workflowName)}"

describe("${workflowName} Workflow Tests", () => {
${states.value.map(state => `
  it("should handle ${state.label} state", () => {
    // TODO: 实现 ${state.label} 状态测试
  })`).join('\n')}
  
${transitions.value.map(t => `
  it("should execute ${t.source} to ${t.target} transition", async () => {
    // TODO: 实现转换测试
  })`).join('\n')}
})`
  }

  // === 工作流模板管理 ===

  const findWorkflowTemplates = (keyword: string): WorkflowTemplate[] => {
    return workflowTemplates.value.filter(
      template =>
        template.name.toLowerCase().includes(keyword.toLowerCase()) ||
        template.description.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  const addWorkflowTemplate = (template: WorkflowTemplate) => {
    if (workflowTemplates.value.find(t => t.id === template.id)) {
      throw new Error(`模板ID "${template.id}" 已存在`)
    }

    workflowTemplates.value.push(template)
    logger.info(`添加工作流模板: ${template.name}`)
  }

  const applyWorkflowTemplate = (templateId: string) => {
    const template = workflowTemplates.value.find(t => t.id === templateId)
    if (!template) {
      throw new Error(`模板 "${templateId}" 不存在`)
    }

    // 清空当前工作流
    states.value = []
    transitions.value = []
    businessRules.value = []

    // 应用模板状态
    template.states.forEach((stateId, index) => {
      const stateType = index === 0 ? "start" :
        index === template.states.length - 1 ? "end" : "intermediate"

      addState({
        id: stateId,
        type: stateType,
        label: stateId,
        position: { x: index * 150, y: 100 }
      })
    })

    // 添加默认转换
    for (let i = 0; i < template.states.length - 1; i++) {
      addTransition({
        id: `${template.states[i]}-${template.states[i + 1]}`,
        source: template.states[i],
        target: template.states[i + 1]
      })
    }

    logger.info(`应用工作流模板: ${template.name}`)
  }

  // === 元数据管理 ===

  const setWorkflowMetadata = (metadata: Partial<WorkflowMetadata>) => {
    workflowMetadata.value = {
      ...workflowMetadata.value,
      ...metadata,
      updatedAt: Date.now()
    }
  }

  const getWorkflowMetadata = () => workflowMetadata.value

  // === 导出导入功能 ===

  const exportWorkflow = () => {
    const workflowData = {
      metadata: workflowMetadata.value,
      states: states.value,
      transitions: transitions.value,
      businessRules: businessRules.value,
      version: "1.0",
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${workflowMetadata.value.name}_workflow_${Date.now()}.json`
    link.click()

    URL.revokeObjectURL(url)
    logger.info(`导出工作流: ${workflowMetadata.value.name}`)
  }

  const importWorkflow = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text()
      const workflowData = JSON.parse(text)

      // 验证数据格式
      if (!workflowData.states || !workflowData.transitions) {
        throw new Error("无效的工作流文件格式")
      }

      // 清空当前数据
      states.value = []
      transitions.value = []
      businessRules.value = []

      // 导入数据
      workflowMetadata.value = workflowData.metadata || {}
      states.value = workflowData.states || []
      transitions.value = workflowData.transitions || []
      businessRules.value = workflowData.businessRules || []

      logger.info(`导入工作流: ${workflowMetadata.value.name}`)
      return true
    } catch (error) {
      logger.error("工作流导入失败:", error as Error)
      return false
    }
  }

  // === 工具函数 ===

  const toPascalCase = (str: string): string => {
    return str.replace(/(?:^|[\s-_])(\w)/g, (_, char) => char.toUpperCase())
  }

  const toCamelCase = (str: string): string => {
    const pascal = toPascalCase(str)
    return pascal.charAt(0).toLowerCase() + pascal.slice(1)
  }

  // === 初始化 ===

  // 加载默认模板
  const initializeDefaultTemplates = () => {
    const defaultTemplates: WorkflowTemplate[] = [
      {
        id: "approval-workflow",
        name: "审批工作流",
        description: "标准的三步审批流程",
        states: ["draft", "review", "approved"],
        rules: ["admin-only-approve"]
      },
      {
        id: "publishing-workflow",
        name: "发布工作流",
        description: "内容发布流程",
        states: ["draft", "review", "published", "archived"],
        rules: ["author-can-draft", "editor-can-review", "admin-can-publish"]
      }
    ]

    workflowTemplates.value = defaultTemplates
  }

  // 初始化
  initializeDefaultTemplates()

  return {
    // 状态
    states,
    transitions,
    businessRules,
    workflowMetadata,
    workflowTemplates,
    executionErrors,
    isExecuting,

    // 计算属性
    startStates,
    endStates,
    intermediateStates,
    stateCount,
    transitionCount,
    ruleCount,

    // 状态管理
    addState,
    removeState,
    updateState,

    // 转换管理
    addTransition,
    removeTransition,

    // 业务规则
    addBusinessRule,
    removeBusinessRule,
    getBusinessRuleExecutionOrder,
    executeBusinessRules,
    logRuleExecution,
    getExecutionErrors,
    clearExecutionErrors,

    // 验证
    validateStateMachine,

    // 代码生成
    generateFrontendHooks,
    generateBackendHandlers,
    generatePolicies,
    generateCompleteCodePackage,

    // 模板管理
    findWorkflowTemplates,
    addWorkflowTemplate,
    applyWorkflowTemplate,

    // 元数据
    setWorkflowMetadata,
    getWorkflowMetadata,

    // 导出导入
    exportWorkflow,
    importWorkflow
  }
})
