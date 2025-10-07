import type { AuditedEntityDto } from '@smartabp/lowcode-shared'

/**
 * 业务规则DTO
 */
export interface BusinessRuleDto extends AuditedEntityDto {
    /** 规则名称 */
    name: string
    /** 关联实体名称 */
    entityName: string
    /** 规则描述 */
    description: string
    /** 规则类型：validation | business | calculation | workflow */
    type: string
    /** 优先级 (1-100) */
    priority: number
    /** 是否激活 */
    isActive: boolean
    /** 是否有错误 */
    hasError: boolean
    /** 规则条件 */
    conditions: BusinessRuleConditionDto[]
    /** 规则动作 */
    actions: BusinessRuleActionDto[]
    /** 执行时机 */
    executionTiming: string[]
    /** 最后执行结果 */
    lastExecutionResult?: BusinessRuleExecutionResultDto
    /** 最后执行时间 */
    lastExecutionTime?: string
    /** 执行次数 */
    executionCount: number
    /** 成功次数 */
    successCount: number
    /** 失败次数 */
    failureCount: number
    /** 平均执行时间 */
    averageExecutionTime: number
    /** 成功率 */
    successRate: number
    /** 规则版本 */
    version: number
}

/**
 * 创建业务规则DTO
 */
export interface CreateBusinessRuleDto {
    /** 规则名称 */
    name: string
    /** 关联实体名称 */
    entityName: string
    /** 规则描述 */
    description: string
    /** 规则类型 */
    type: string
    /** 优先级 */
    priority: number
    /** 规则条件 */
    conditions: BusinessRuleConditionDto[]
    /** 规则动作 */
    actions: BusinessRuleActionDto[]
    /** 执行时机 */
    executionTiming: string[]
}

/**
 * 更新业务规则DTO
 */
export interface UpdateBusinessRuleDto {
    /** 规则名称 */
    name: string
    /** 规则描述 */
    description: string
    /** 优先级 */
    priority: number
    /** 是否激活 */
    isActive: boolean
    /** 规则条件 */
    conditions: BusinessRuleConditionDto[]
    /** 规则动作 */
    actions: BusinessRuleActionDto[]
    /** 执行时机 */
    executionTiming: string[]
}

/**
 * 业务规则条件DTO
 */
export interface BusinessRuleConditionDto {
    /** 条件ID */
    id: number
    /** 字段名 */
    field: string
    /** 操作符 */
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'is_null' | 'is_not_null'
    /** 值 */
    value: string
    /** 逻辑操作符 */
    logicalOperator?: 'AND' | 'OR'
}

/**
 * 业务规则动作DTO
 */
export interface BusinessRuleActionDto {
    /** 动作ID */
    id: number
    /** 动作类型 */
    type: 'update_field' | 'send_notification' | 'execute_script' | 'trigger_workflow'
    /** 目标 */
    target: string
    /** 值 */
    value: string
    /** 配置参数 */
    parameters: Record<string, any>
}

/**
 * 业务规则执行结果DTO
 */
export interface BusinessRuleExecutionResultDto {
    /** 是否成功 */
    success: boolean
    /** 执行时间 (毫秒) */
    executionTime: number
    /** 执行时间戳 */
    timestamp: number
    /** 错误信息 */
    error?: string
    /** 执行详情 */
    details: Record<string, any>
}

/**
 * 业务规则执行请求DTO
 */
export interface ExecuteBusinessRuleDto {
    /** 规则ID列表 */
    ruleIds: string[]
    /** 执行上下文数据 */
    context: Record<string, any>
}

/**
 * 业务规则验证结果DTO
 */
export interface BusinessRuleValidationResultDto {
    /** 是否有效 */
    isValid: boolean
    /** 错误列表 */
    errors: string[]
    /** 警告列表 */
    warnings: string[]
}

/**
 * 业务规则统计DTO
 */
export interface BusinessRuleStatsDto {
    /** 总规则数 */
    totalRules: number
    /** 活跃规则数 */
    activeRules: number
    /** 总执行次数 */
    executionCount: number
    /** 整体成功率 */
    successRate: number
    /** 平均执行时间 */
    averageExecutionTime: number
    /** 今日执行次数 */
    todayExecutionCount: number
    /** 错误规则数 */
    errorRules: number
}

/**
 * 业务规则查询输入DTO
 */
export interface GetBusinessRulesInput {
    /** 页码 */
    skipCount?: number
    /** 页大小 */
    maxResultCount?: number
    /** 排序字段 */
    sorting?: string
    /** 搜索关键词 */
    searchKeyword?: string
    /** 实体名筛选 */
    entityName?: string
    /** 规则类型筛选 */
    type?: string
    /** 是否激活筛选 */
    isActive?: boolean
    /** 是否有错误筛选 */
    hasError?: boolean
}

/**
 * 实体定义DTO
 */
export interface EntityDefinitionDto {
    id: string
    name: string
    displayName: string
    description: string
}

/**
 * 实体字段DTO
 */
export interface EntityFieldDto {
    name: string
    displayName: string
    type: string
}

/**
 * 规则类型定义
 */
export const RULE_TYPES = {
    validation: { label: '验证规则', color: 'warning' },
    business: { label: '业务规则', color: 'primary' },
    calculation: { label: '计算规则', color: 'success' },
    workflow: { label: '工作流规则', color: 'info' }
} as const

/**
 * 操作符定义
 */
export const OPERATORS = {
    equals: { label: '等于', symbol: '=' },
    not_equals: { label: '不等于', symbol: '≠' },
    greater_than: { label: '大于', symbol: '>' },
    less_than: { label: '小于', symbol: '<' },
    contains: { label: '包含', symbol: '∋' },
    is_null: { label: '为空', symbol: '∅' },
    is_not_null: { label: '不为空', symbol: '≠∅' }
} as const

/**
 * 动作类型定义
 */
export const ACTION_TYPES = {
    update_field: {
        label: '更新字段',
        icon: '📝',
        description: '更新实体字段值'
    },
    send_notification: {
        label: '发送通知',
        icon: '📧',
        description: '发送邮件、短信或系统通知'
    },
    execute_script: {
        label: '执行脚本',
        icon: '⚡',
        description: '执行自定义脚本代码'
    },
    trigger_workflow: {
        label: '触发工作流',
        icon: '🔄',
        description: '启动业务工作流程'
    }
} as const

/**
 * 执行时机定义
 */
export const EXECUTION_TIMING = {
    before_create: { label: '创建前', description: '在实体创建之前执行' },
    after_create: { label: '创建后', description: '在实体创建之后执行' },
    before_update: { label: '更新前', description: '在实体更新之前执行' },
    after_update: { label: '更新后', description: '在实体更新之后执行' },
    before_delete: { label: '删除前', description: '在实体删除之前执行' }
} as const
