// 引擎统一导出入口
// 支持按需加载，优化包体积

export { RuleExecutionEngine } from './ruleExecutionEngine'
export type { BusinessRule, RuleCondition } from './ruleExecutionEngine'

export { WorkflowEngine } from './WorkflowEngine'
export type { WorkflowDefinition, WorkflowNode, WorkflowTransition } from './WorkflowEngine'

export { IntelligentRecommendationEngine } from './IntelligentRecommendationEngine'

export { ActionExecutor, ActionExecutorRegistry } from './actionExecutor'
export type { IActionExecutor, ActionExecutorContext, RuleContext } from './actionExecutor'

