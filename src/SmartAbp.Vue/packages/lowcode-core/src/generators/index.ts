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
export { RelationshipUIGenerator } from './RelationshipUIGenerator'
export { WorkflowCodeGenerator } from './WorkflowCodeGenerator'

// 🚀 增强型Entity生成器 v2.0
export { EnhancedEntityGenerator } from './EnhancedEntityGenerator'
export type {
  EntityGenerationConfig,
  GeneratedEntityCode
} from './EnhancedEntityGenerator'

// 🚀 增强型AppService生成器 v2.0
export { EnhancedAppServiceGenerator } from './EnhancedAppServiceGenerator'
export type {
  AppServiceGenerationConfig,
  GeneratedAppServiceCode
} from './EnhancedAppServiceGenerator'

// 🚀 增强型Vue组件生成器 v2.0
export { EnhancedVueComponentGenerator } from './EnhancedVueComponentGenerator'
export type {
  GeneratedVueComponentCode, VueComponentGenerationConfig
} from './EnhancedVueComponentGenerator'

// 🚀 增强型Pinia Store生成器 v2.0
export { EnhancedPiniaStoreGenerator } from './EnhancedPiniaStoreGenerator'
export type {
  GeneratedPiniaStoreCode,
  PiniaStoreGenerationConfig
} from './EnhancedPiniaStoreGenerator'

// 🚀 增强型API Client生成器 v2.0
export { EnhancedApiClientGenerator } from './EnhancedApiClientGenerator'
export type {
  ApiClientGenerationConfig,
  GeneratedApiClientCode
} from './EnhancedApiClientGenerator'

