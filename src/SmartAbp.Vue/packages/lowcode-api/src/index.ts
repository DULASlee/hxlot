// re-export generated client when available
// Phase 1C: 暂时注释，等NSwag配置到此package后再启用
// export * from './client.generated'

// ============================================================================
// 类型定义导出
// ============================================================================
export * from "./types/index.js"
export type { TableSchema } from "./types/index.js"

// ============================================================================
// HTTP客户端导出
// ============================================================================
export * from "./http-client"
export { createHttpClient, http } from "./http-client"
export type { ApiError, ApiResponse, HttpClient, HttpClientConfig } from "./http-client"

// ============================================================================
// 代码生成器API导出
// ============================================================================
export * from "./code-generator.js"
export { codeGeneratorApi } from "./code-generator.js"

// 代码生成统计和用户配置
export * from "./code-gen-stats.js"
export { codeGenStatsApi, userProfileApi } from "./code-gen-stats.js"

// 生成历史（旧版，保留向后兼容）
export { generationHistoryApi as legacyGenerationHistoryApi } from "./generation-history.js"

// 业务规则引擎API
export { businessRuleApi } from "./business-rule.js"
export type { BusinessRuleApi } from "./business-rule.js"
export type {
  BusinessRuleActionDto,
  BusinessRuleConditionDto, BusinessRuleDto, BusinessRuleExecutionResultDto, BusinessRuleStatsDto,
  BusinessRuleValidationResultDto,
  CreateBusinessRuleDto, GetBusinessRulesInput, UpdateBusinessRuleDto
} from "./types/business-rule.js"

// 业务规则相关实体/字段DTO（用于UI消费）
export type { EntityDefinitionDto, EntityFieldDto } from "./types/business-rule.js"

// 行业模板配置API
export { industryTemplateApi } from "./industryTemplate.js"
export type { IndustryTemplateConfigDto, IndustryTemplateGenerationResultDto } from "./industryTemplate.js"

// ============================================================================
// DDD生成器API导出（Day 7 新增）
// ============================================================================
export * from "./ddd-generator.js"
export { dddGeneratorApi } from "./ddd-generator.js"
export type {
  AggregateDefinitionDto, BusinessRuleDefinitionDto, DddDefinitionDto, DomainEventDefinitionDto, DomainMethodDefinitionDto, DomainServiceDefinitionDto, GeneratedDddSolutionDto,
  GeneratedFileDto, PropertyDefinitionDto, RepositoryDefinitionDto, ValueObjectDefinitionDto
} from "./ddd-generator.js"

// ============================================================================
// CQRS生成器API导出（Day 8 新增）
// ============================================================================
export * from "./cqrs-generator.js"
export { cqrsGeneratorApi } from "./cqrs-generator.js"
export type {
  CommandDefinitionDto, CqrsDefinitionDto, EventDefinitionDto, GeneratedCqrsSolutionDto, ParameterDefinitionDto, QueryDefinitionDto
} from "./cqrs-generator.js"

// ============================================================================
// 实体建模API导出（v9.0 审计修复）
// ============================================================================
export * from "./entity-modeling.js"
export {
  addField, createEntity, createRelation, deleteEntity, deleteField, deleteRelation, getAllEntities, getAllRelations, getEntityById,
  getEntityByName, updateEntity, updateField, updateRelation, validateSchema
} from "./entity-modeling.js"
export type {
  CreateOrUpdateEntityDefinitionDto,
  CreateOrUpdateEntityFieldDto,
  CreateOrUpdateEntityRelationDto, EntityDefinition,
  EntityField,
  EntityRelation, SchemaValidationResult, ValidationRule
} from "./entity-modeling.js"

// ============================================================================
// Composables导出（Task 1.2 新增）
// ============================================================================
export * from "./composables/index.js"
export {
  createApiCall,
  createCodeGenApiCall, createLoadingWrapper,

  // 统一API调用
  useApiCall,
  // 错误处理
  useApiError,

  // Loading管理
  useApiLoading
} from "./composables/index.js"

// ============================================================================
// 模板管理API导出（Phase 3 - Task 3.1 新增）
// ============================================================================
export * from "./template-api.js"
export { TemplateApi, templateApi } from "./template-api.js"

// ============================================================================
// 代码生成历史API导出（Phase 3 - Task 3.2.1 新增）
// ============================================================================
export * from "./generation-history-api.js"
export { GenerationHistoryApi, generationHistoryApi } from "./generation-history-api.js"

// ============================================================================
// 兼容性接口（向后兼容）
// ============================================================================
import { codeGeneratorApi } from "./code-generator.js"

interface CompatTemplate {
  id: string
  name: string
  description: string
}

/**
 * 数据库API - 兼容性接口
 * @deprecated 请直接使用 codeGeneratorApi
 */
export const databaseApi = {
  /**
   * 获取模板列表
   * @deprecated 请使用 codeGeneratorApi.getTemplates()
   */
  getTemplates: async (): Promise<CompatTemplate[]> => {
    const templates = await codeGeneratorApi.getTemplates()
    return templates.map((t: { id: string; name: string; description?: string }) => ({
      id: t.id,
      name: t.name,
      description: t.description || ''
    }))
  },
}

// 重新导出dtos（已在上面导出）
// export * from './dtos';
