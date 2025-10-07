import type { PagedResultDto } from '@smartabp/lowcode-shared'
import { request } from '@smartabp/lowcode-shared'
import type {
    BusinessRuleDto,
    BusinessRuleExecutionResultDto,
    BusinessRuleStatsDto,
    BusinessRuleValidationResultDto,
    CreateBusinessRuleDto,
    EntityDefinitionDto,
    EntityFieldDto,
    ExecuteBusinessRuleDto,
    GetBusinessRulesInput,
    UpdateBusinessRuleDto
} from './types/business-rule'

/**
 * 业务规则API客户端
 * 企业级业务规则引擎的前端API封装
 */
export class BusinessRuleApi {
    private readonly baseUrl = '/api/business-rules'

    /**
     * 获取业务规则列表
     */
    async getList(input: GetBusinessRulesInput): Promise<PagedResultDto<BusinessRuleDto>> {
        return await request.get<PagedResultDto<BusinessRuleDto>>(this.baseUrl, {
            params: input
        })
    }

    /**
     * 根据ID获取业务规则
     */
    async get(id: string): Promise<BusinessRuleDto> {
        return await request.get<BusinessRuleDto>(`${this.baseUrl}/${id}`)
    }

    /**
     * 创建业务规则
     */
    async create(input: CreateBusinessRuleDto): Promise<BusinessRuleDto> {
        return await request.post<BusinessRuleDto>(this.baseUrl, input)
    }

    /**
     * 更新业务规则
     */
    async update(id: string, input: UpdateBusinessRuleDto): Promise<BusinessRuleDto> {
        return await request.put<BusinessRuleDto>(`${this.baseUrl}/${id}`, input)
    }

    /**
     * 删除业务规则
     */
    async delete(id: string): Promise<void> {
        return await request.delete(`${this.baseUrl}/${id}`)
    }

    /**
     * 执行业务规则
     */
    async executeRules(input: ExecuteBusinessRuleDto): Promise<BusinessRuleExecutionResultDto[]> {
        return await request.post<BusinessRuleExecutionResultDto[]>(`${this.baseUrl}/execute`, input)
    }

    /**
     * 验证业务规则
     */
    async validateRule(id: string): Promise<BusinessRuleValidationResultDto> {
        return await request.post<BusinessRuleValidationResultDto>(`${this.baseUrl}/${id}/validate`)
    }

    /**
     * 批量验证所有业务规则
     */
    async validateAllRules(): Promise<BusinessRuleValidationResultDto[]> {
        return await request.post<BusinessRuleValidationResultDto[]>(`${this.baseUrl}/validate-all`)
    }

    /**
     * 获取业务规则统计信息
     */
    async getStats(): Promise<BusinessRuleStatsDto> {
        return await request.get<BusinessRuleStatsDto>(`${this.baseUrl}/stats`)
    }

    /**
     * 获取可用实体列表
     */
    async getAvailableEntities(): Promise<EntityDefinitionDto[]> {
        return await request.get<EntityDefinitionDto[]>(`${this.baseUrl}/entities`)
    }

    /**
     * 获取指定实体的字段列表
     */
    async getEntityFields(entityName: string): Promise<EntityFieldDto[]> {
        return await request.get<EntityFieldDto[]>(`${this.baseUrl}/entities/${entityName}/fields`)
    }

    /**
     * 批量更新规则状态
     */
    async batchUpdateStatus(ruleIds: string[], isActive: boolean): Promise<void> {
        return await request.put(`${this.baseUrl}/batch-status`, {
            ruleIds,
            isActive
        })
    }

    /**
     * 复制规则
     */
    async duplicateRule(id: string): Promise<BusinessRuleDto> {
        return await request.post<BusinessRuleDto>(`${this.baseUrl}/${id}/duplicate`)
    }

    /**
     * 批量删除规则
     */
    async batchDelete(ruleIds: string[]): Promise<void> {
        return await request.delete(`${this.baseUrl}/batch`, {
            data: { ruleIds }
        })
    }

    /**
     * 导出规则配置
     */
    async exportRules(ruleIds: string[]): Promise<ExportRulesResultDto> {
        return await request.post<ExportRulesResultDto>(`${this.baseUrl}/export`, ruleIds)
    }

    /**
     * 导入规则配置
     */
    async importRules(input: ImportRulesInputDto): Promise<ImportRulesResultDto> {
        return await request.post<ImportRulesResultDto>(`${this.baseUrl}/import`, input)
    }
}

/**
 * 导出结果DTO
 */
export interface ExportRulesResultDto {
    exportTime: string
    version: string
    rules: BusinessRuleDto[]
}

/**
 * 导入输入DTO
 */
export interface ImportRulesInputDto {
    rules: ImportRuleDataDto[]
}

/**
 * 导入规则数据DTO
 */
export interface ImportRuleDataDto {
    name: string
    entityName: string
    description: string
    type: string
    priority: number
    conditions: BusinessRuleConditionDto[]
    actions: BusinessRuleActionDto[]
    executionTiming: string[]
}

/**
 * 导入结果DTO
 */
export interface ImportRulesResultDto {
    totalCount: number
    successCount: number
    failureCount: number
    errors: string[]
}

/**
 * 业务规则条件DTO
 */
export interface BusinessRuleConditionDto {
    id: number
    field: string
    operator: string
    value: string
    logicalOperator?: string
}

/**
 * 业务规则动作DTO
 */
export interface BusinessRuleActionDto {
    id: number
    type: string
    target: string
    value: string
    parameters: Record<string, any>
}

// 创建API实例
export const businessRuleApi = new BusinessRuleApi()
