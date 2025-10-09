/**
 * 🚀 Code Generators API Module Entry
 * 
 * 统一导出所有代码生成器API
 * 
 * @module @smartabp/lowcode-api/generators
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 代码生成器API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { codeGeneratorApi } from './code-generator.js'
// Note: 类型定义从 types/index 导出，不在 code-generator.ts 中

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ DDD生成器API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { dddGeneratorApi } from './ddd-generator.js'
export type {
  AggregateDefinitionDto, BusinessRuleDefinitionDto, DddDefinitionDto, DomainEventDefinitionDto,
  DomainMethodDefinitionDto, DomainServiceDefinitionDto, GeneratedDddSolutionDto,
  GeneratedFileDto, PropertyDefinitionDto, RepositoryDefinitionDto, ValueObjectDefinitionDto
} from './ddd-generator.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚡ CQRS生成器API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { cqrsGeneratorApi } from './cqrs-generator.js'
export type {
  CommandDefinitionDto, CqrsDefinitionDto, EventDefinitionDto, GeneratedCqrsSolutionDto, ParameterDefinitionDto, QueryDefinitionDto
} from './cqrs-generator.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 实体建模API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  addField, createEntity, createRelation, deleteEntity, deleteField, deleteRelation, getAllEntities, getAllRelations, getEntityById,
  getEntityByName, updateEntity, updateField, updateRelation, validateSchema
} from './entity-modeling.js'

export type {
  CreateOrUpdateEntityDefinitionDto,
  CreateOrUpdateEntityFieldDto,
  CreateOrUpdateEntityRelationDto, EntityDefinition,
  EntityField,
  EntityRelation, SchemaValidationResult,
  ValidationRule
} from './entity-modeling.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 代码生成统计API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { codeGenStatsApi, userProfileApi } from './code-gen-stats.js'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📜 生成历史API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { generationHistoryApi } from './generation-history.js'

