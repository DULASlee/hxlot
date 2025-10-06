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
export { codeGeneratorApi } from '../code-generator'
// Note: 类型定义从 types/index 导出，不在 code-generator.ts 中

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏗️ DDD生成器API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { dddGeneratorApi } from '../ddd-generator'
export type {
  DddDefinitionDto,
  AggregateDefinitionDto,
  ValueObjectDefinitionDto,
  DomainServiceDefinitionDto,
  DomainEventDefinitionDto,
  DomainMethodDefinitionDto,
  PropertyDefinitionDto,
  BusinessRuleDefinitionDto,
  RepositoryDefinitionDto,
  GeneratedDddSolutionDto,
  GeneratedFileDto,
} from '../ddd-generator'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚡ CQRS生成器API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { cqrsGeneratorApi } from '../cqrs-generator'
export type {
  CqrsDefinitionDto,
  CommandDefinitionDto,
  QueryDefinitionDto,
  EventDefinitionDto,
  ParameterDefinitionDto,
  GeneratedCqrsSolutionDto,
} from '../cqrs-generator'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎨 实体建模API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export {
  createEntity,
  updateEntity,
  deleteEntity,
  getEntityById,
  getEntityByName,
  getAllEntities,
  addField,
  updateField,
  deleteField,
  createRelation,
  updateRelation,
  deleteRelation,
  getAllRelations,
  validateSchema,
} from '../entity-modeling'

export type {
  EntityDefinition,
  EntityField,
  EntityRelation,
  CreateOrUpdateEntityDefinitionDto,
  CreateOrUpdateEntityFieldDto,
  CreateOrUpdateEntityRelationDto,
  SchemaValidationResult,
  ValidationRule,
} from '../entity-modeling'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 代码生成统计API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { codeGenStatsApi, userProfileApi } from '../code-gen-stats'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📜 生成历史API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export { generationHistoryApi } from '../generation-history'

