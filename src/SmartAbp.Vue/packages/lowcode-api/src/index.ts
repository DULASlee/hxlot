// ============================================================================
// 类型定义导出
// ============================================================================
export * from "./types/index"
export type { TableSchema } from "./types/index"

// ============================================================================
// HTTP客户端导出
// ============================================================================
export * from "./http-client"
export { createHttpClient, http } from "./http-client"
export type { ApiError, ApiResponse, HttpClient, HttpClientConfig } from "./http-client"

// ============================================================================
// 代码生成器API导出
// ============================================================================
export * from "./code-generator"
export { codeGeneratorApi } from "./code-generator"

// 代码生成统计和用户配置
export * from "./code-gen-stats"
export { codeGenStatsApi, userProfileApi } from "./code-gen-stats"

// 生成历史
export * from "./generation-history"
export { generationHistoryApi } from "./generation-history"

// 业务规则引擎API
export { businessRuleApi } from "./business-rule"
export type { BusinessRuleApi } from "./business-rule"
export type {
  BusinessRuleActionDto,
  BusinessRuleConditionDto, BusinessRuleDto, BusinessRuleExecutionResultDto, BusinessRuleStatsDto,
  BusinessRuleValidationResultDto,
  CreateBusinessRuleDto, GetBusinessRulesInput, UpdateBusinessRuleDto
} from "./types/business-rule"

// 业务规则相关实体/字段DTO（用于UI消费）
export type { EntityDefinitionDto, EntityFieldDto } from "./types/business-rule"

// 行业模板配置API
export { industryTemplateApi } from "./industryTemplate"
export type { IndustryTemplateConfigDto } from "./industryTemplate"

// ============================================================================
// DDD生成器API导出（Day 7 新增）
// ============================================================================
export * from "./ddd-generator"
export { dddGeneratorApi } from "./ddd-generator"
export type {
  AggregateDefinitionDto, BusinessRuleDefinitionDto, DddDefinitionDto, DomainEventDefinitionDto, DomainMethodDefinitionDto, DomainServiceDefinitionDto, GeneratedDddSolutionDto,
  GeneratedFileDto, PropertyDefinitionDto, RepositoryDefinitionDto, ValueObjectDefinitionDto
} from "./ddd-generator"

// ============================================================================
// CQRS生成器API导出（Day 8 新增）
// ============================================================================
export * from "./cqrs-generator"
export { cqrsGeneratorApi } from "./cqrs-generator"
export type {
  CommandDefinitionDto, CqrsDefinitionDto, EventDefinitionDto, GeneratedCqrsSolutionDto, ParameterDefinitionDto, QueryDefinitionDto
} from "./cqrs-generator"

// ============================================================================
// 实体建模API导出（v9.0 审计修复）
// ============================================================================
export * from "./entity-modeling"
export {
  addField, createEntity, createRelation, deleteEntity, deleteField, deleteRelation, getAllEntities, getAllRelations, getEntityById,
  getEntityByName, updateEntity, updateField, updateRelation, validateSchema
} from "./entity-modeling"
export type {
  CreateOrUpdateEntityDefinitionDto,
  CreateOrUpdateEntityFieldDto,
  CreateOrUpdateEntityRelationDto, EntityDefinition,
  EntityField,
  EntityRelation, SchemaValidationResult, ValidationRule
} from "./entity-modeling"

// ============================================================================
// Composables导出（Task 1.2 新增）
// ============================================================================
export * from "./composables"
export {
  createApiCall,
  createCodeGenApiCall, createLoadingWrapper,

  // 统一API调用
  useApiCall,
  // 错误处理
  useApiError,

  // Loading管理
  useApiLoading
} from "./composables"

// ============================================================================
// 兼容性接口（向后兼容）
// ============================================================================
import { codeGeneratorApi } from "./code-generator"

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
