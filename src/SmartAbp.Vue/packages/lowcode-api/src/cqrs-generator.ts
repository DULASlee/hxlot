import { http } from './http-client'

/**
 * 🔥 CQRS模式代码生成器API
 * 
 * 功能：
 * 1. Command代码生成（创建、更新、删除命令）
 * 2. Query代码生成（单条查询、列表查询、分页查询）
 * 3. Handler代码生成（命令处理器、查询处理器）
 * 4. Validator代码生成（FluentValidation验证器）
 * 5. MediatR集成代码生成
 * 
 * @author SmartAbp架构师团队
 * @version 1.0.0
 */

// ================================
// DTO类型定义
// ================================

export interface PropertyDefinitionDto {
  name: string
  type: string
  isRequired?: boolean
  defaultValue?: string
  validation?: string
  description?: string
}

export interface ParameterDefinitionDto {
  name: string
  type: string
  isOptional?: boolean
  defaultValue?: string
}

export interface CommandDefinitionDto {
  name: string
  description?: string
  returnType?: string
  properties: PropertyDefinitionDto[]
  requiresTransaction?: boolean
  requiresAuthorization?: boolean
}

export interface QueryDefinitionDto {
  name: string
  description?: string
  returnType: string
  parameters: ParameterDefinitionDto[]
  isPaged?: boolean
  isCacheable?: boolean
}

export interface EventDefinitionDto {
  name: string
  description?: string
  properties: PropertyDefinitionDto[]
  isIntegrationEvent?: boolean
}

export interface CqrsDefinitionDto {
  moduleName: string
  namespace: string
  commands: CommandDefinitionDto[]
  queries: QueryDefinitionDto[]
  events?: EventDefinitionDto[]
}

export interface GeneratedCqrsSolutionDto {
  moduleName: string
  files: Record<string, string>
  commandCount: number
  queryCount: number
  eventCount: number
  generatedAt: string
  sessionId: string
}

// ================================
// CQRS生成器API
// ================================

export const cqrsGeneratorApi = {
  /**
   * 生成CQRS模式代码
   * @param definition CQRS定义
   * @returns 生成结果
   */
  async generateCqrs(definition: CqrsDefinitionDto): Promise<GeneratedCqrsSolutionDto> {
    return await http.post<GeneratedCqrsSolutionDto>(
      '/api/code-generator/generate-cqrs',
      definition
    )
  },

  /**
   * 验证CQRS定义
   * @param definition CQRS定义
   * @returns 验证结果
   */
  async validateCqrsDefinition(definition: CqrsDefinitionDto): Promise<{
    isValid: boolean
    errors: Array<{ field: string; message: string; severity: 'Error' | 'Warning' }>
    suggestions: Array<{ message: string; autoFixAvailable: boolean }>
  }> {
    return await http.post<{
      isValid: boolean
      errors: Array<{ field: string; message: string; severity: 'Error' | 'Warning' }>
      suggestions: Array<{ message: string; autoFixAvailable: boolean }>
    }>('/api/code-generator/validate-cqrs-definition', definition)
  },

  /**
   * 获取CQRS模板示例
   * @returns CQRS模板列表
   */
  async getCqrsTemplates(): Promise<Array<{
    id: string
    name: string
    description: string
    definition: Partial<CqrsDefinitionDto>
  }>> {
    return await http.get<Array<{
      id: string
      name: string
      description: string
      definition: Partial<CqrsDefinitionDto>
    }>>('/api/code-generator/cqrs-templates')
  },

  /**
   * 获取Command模板
   * @param commandType 命令类型：Create, Update, Delete
   * @returns Command模板
   */
  async getCommandTemplate(commandType: 'Create' | 'Update' | 'Delete'): Promise<CommandDefinitionDto> {
    return await http.get<CommandDefinitionDto>(
      `/api/code-generator/command-template/${commandType}`
    )
  },

  /**
   * 获取Query模板
   * @param queryType 查询类型：Single, List, Paged
   * @returns Query模板
   */
  async getQueryTemplate(queryType: 'Single' | 'List' | 'Paged'): Promise<QueryDefinitionDto> {
    return await http.get<QueryDefinitionDto>(
      `/api/code-generator/query-template/${queryType}`
    )
  }
}

