// 代码生成器统一导出入口
// 支持按需加载，优化包体积

export { CqrsCodeGenerator } from './CqrsCodeGenerator'
export type { CqrsCommandConfig, CqrsQueryConfig } from './CqrsCodeGenerator'

export { DddCodeGenerator } from './DddCodeGenerator'
export type { DddEntityConfig, MethodConfig, PropertyConfig } from './DddCodeGenerator'

export { DddDomainEventGenerator } from './DddDomainEventGenerator'
export type { DomainEventConfig, EventHandlerConfig } from './DddDomainEventGenerator'

export { MicroserviceGenerator } from './MicroserviceGenerator'
export type { MicroserviceConfig } from './MicroserviceGenerator'

export { AspireGenerator } from './AspireGenerator'
export type {
  AspireConfiguration,
  AspireGenerationResult,
  AspireServiceDefinition
} from './AspireGenerator'

export { BusinessRuleCodeGenerator } from './BusinessRuleCodeGenerator'
// export { RelationshipUIGenerator } from './RelationshipUIGenerator' // TODO: 修复metadata-core类型问题后恢复
export { WorkflowCodeGenerator } from './WorkflowCodeGenerator'

