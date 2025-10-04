import { http } from './http-client'

/**
 * 🔥 DDD领域驱动设计生成器API
 * 
 * 功能：
 * 1. DDD领域模型代码生成
 * 2. 聚合根、值对象、领域事件生成
 * 3. 领域服务和仓储生成
 * 4. CQRS模式代码生成
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
  isPrivateSetter?: boolean
}

export interface DomainMethodDefinitionDto {
  name: string
  returnType: string
  parameters: PropertyDefinitionDto[]
  description?: string
  isVirtual?: boolean
}

export interface DomainEventDefinitionDto {
  name: string
  properties: PropertyDefinitionDto[]
  description?: string
  aggregateType?: string
}

export interface BusinessRuleDefinitionDto {
  name: string
  description?: string
  condition?: string
  errorMessage?: string
  expression?: string
}

export interface AggregateDefinitionDto {
  name: string
  properties: PropertyDefinitionDto[]
  description?: string
  keyType?: string
  isMultiTenant?: boolean
  isSoftDelete?: boolean
  hasExtraProperties?: boolean
  domainMethods?: DomainMethodDefinitionDto[]
  domainEvents?: DomainEventDefinitionDto[]
  businessRules?: BusinessRuleDefinitionDto[]
}

export interface ValueObjectDefinitionDto {
  name: string
  properties: PropertyDefinitionDto[]
  description?: string
  isImmutable?: boolean
  implementsEquality?: boolean
}

export interface DomainServiceDefinitionDto {
  name: string
  methods: DomainMethodDefinitionDto[]
  description?: string
  dependencies?: string[]
  isStateless?: boolean
}

export interface RepositoryDefinitionDto {
  name: string
  aggregateType: string
  keyType?: string
  implementsStandardMethods?: boolean
  supportsSpecifications?: boolean
}

export interface DddDefinitionDto {
  moduleName: string
  aggregates: AggregateDefinitionDto[]
  valueObjects: ValueObjectDefinitionDto[]
  domainEvents: DomainEventDefinitionDto[]
  domainServices: DomainServiceDefinitionDto[]
  repositories: RepositoryDefinitionDto[]
  useMultiTenancy?: boolean
  useSoftDelete?: boolean
  useAuditing?: boolean
  useExtraProperties?: boolean
  defaultKeyType?: string
}

export interface GeneratedFileDto {
  relativePath: string
  content: string
  language: string
}

export interface GeneratedDddSolutionDto {
  moduleName: string
  files: GeneratedFileDto[]
  aggregateCount: number
  entityCount: number
  valueObjectCount: number
  domainEventCount: number
  repositoryCount: number
  domainServiceCount: number
  specificationCount: number
  generatedAt: string
  generationTimeMs: number
  totalLinesOfCode: number
  success: boolean
  message: string
}

// ================================
// DDD生成器API
// ================================

export const dddGeneratorApi = {
  /**
   * 生成DDD领域模型代码
   * @param definition DDD领域定义
   * @returns 生成结果
   */
  async generateDddDomain(definition: DddDefinitionDto): Promise<GeneratedDddSolutionDto> {
    return await http.post<GeneratedDddSolutionDto>(
      '/api/code-generator/generate-ddd-domain',
      definition
    )
  },

  /**
   * 验证DDD定义
   * @param definition DDD领域定义
   * @returns 验证结果
   */
  async validateDddDefinition(definition: DddDefinitionDto): Promise<{
    isValid: boolean
    errors: Array<{ field: string; message: string; severity: 'Error' | 'Warning' }>
    suggestions: Array<{ message: string; autoFixAvailable: boolean }>
  }> {
    return await http.post<{
      isValid: boolean
      errors: Array<{ field: string; message: string; severity: 'Error' | 'Warning' }>
      suggestions: Array<{ message: string; autoFixAvailable: boolean }>
    }>('/api/code-generator/validate-ddd-definition', definition)
  },

  /**
   * 获取DDD模板示例
   * @returns DDD模板列表
   */
  async getDddTemplates(): Promise<Array<{
    id: string
    name: string
    description: string
    definition: Partial<DddDefinitionDto>
  }>> {
    return await http.get<Array<{
      id: string
      name: string
      description: string
      definition: Partial<DddDefinitionDto>
    }>>('/api/code-generator/ddd-templates')
  }
}

