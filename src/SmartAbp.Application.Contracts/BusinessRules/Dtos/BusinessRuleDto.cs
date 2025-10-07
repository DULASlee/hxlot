using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Volo.Abp.Application.Dtos;

namespace SmartAbp.Application.Contracts.BusinessRules.Dtos
{
    /// <summary>
    /// 业务规则DTO
    /// </summary>
    public class BusinessRuleDto : FullAuditedEntityDto<Guid>
    {
        /// <summary>
        /// 规则名称
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// 关联实体名称
        /// </summary>
        public string EntityName { get; set; } = string.Empty;

        /// <summary>
        /// 规则描述
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// 规则类型
        /// </summary>
        public string Type { get; set; } = string.Empty;

        /// <summary>
        /// 优先级
        /// </summary>
        public int Priority { get; set; }

        /// <summary>
        /// 是否激活
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// 是否有错误
        /// </summary>
        public bool HasError { get; set; }

        /// <summary>
        /// 规则条件
        /// </summary>
        public List<BusinessRuleConditionDto> Conditions { get; set; } = new();

        /// <summary>
        /// 规则动作
        /// </summary>
        public List<BusinessRuleActionDto> Actions { get; set; } = new();

        /// <summary>
        /// 执行时机
        /// </summary>
        public List<string> ExecutionTiming { get; set; } = new();

        /// <summary>
        /// 最后执行结果
        /// </summary>
        public BusinessRuleExecutionResultDto? LastExecutionResult { get; set; }

        /// <summary>
        /// 最后执行时间
        /// </summary>
        public DateTime? LastExecutionTime { get; set; }

        /// <summary>
        /// 执行次数
        /// </summary>
        public int ExecutionCount { get; set; }

        /// <summary>
        /// 成功次数
        /// </summary>
        public int SuccessCount { get; set; }

        /// <summary>
        /// 失败次数
        /// </summary>
        public int FailureCount { get; set; }

        /// <summary>
        /// 平均执行时间
        /// </summary>
        public decimal AverageExecutionTime { get; set; }

        /// <summary>
        /// 成功率
        /// </summary>
        public decimal SuccessRate { get; set; }

        /// <summary>
        /// 规则版本
        /// </summary>
        public int Version { get; set; }
    }

    /// <summary>
    /// 创建业务规则DTO
    /// </summary>
    public class CreateBusinessRuleDto
    {
        /// <summary>
        /// 规则名称
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// 关联实体名称
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string EntityName { get; set; } = string.Empty;

        /// <summary>
        /// 规则描述
        /// </summary>
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// 规则类型：validation | business | calculation | workflow
        /// </summary>
        [Required]
        public string Type { get; set; } = string.Empty;

        /// <summary>
        /// 优先级 (1-100)
        /// </summary>
        [Range(1, 100)]
        public int Priority { get; set; } = 50;

        /// <summary>
        /// 规则条件
        /// </summary>
        public List<BusinessRuleConditionDto> Conditions { get; set; } = new();

        /// <summary>
        /// 规则动作
        /// </summary>
        public List<BusinessRuleActionDto> Actions { get; set; } = new();

        /// <summary>
        /// 执行时机
        /// </summary>
        public List<string> ExecutionTiming { get; set; } = new();
    }

    /// <summary>
    /// 更新业务规则DTO
    /// </summary>
    public class UpdateBusinessRuleDto
    {
        /// <summary>
        /// 规则名称
        /// </summary>
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// 规则描述
        /// </summary>
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// 优先级 (1-100)
        /// </summary>
        [Range(1, 100)]
        public int Priority { get; set; }

        /// <summary>
        /// 是否激活
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// 规则条件
        /// </summary>
        public List<BusinessRuleConditionDto> Conditions { get; set; } = new();

        /// <summary>
        /// 规则动作
        /// </summary>
        public List<BusinessRuleActionDto> Actions { get; set; } = new();

        /// <summary>
        /// 执行时机
        /// </summary>
        public List<string> ExecutionTiming { get; set; } = new();
    }

    /// <summary>
    /// 业务规则条件DTO
    /// </summary>
    public class BusinessRuleConditionDto
    {
        /// <summary>
        /// 条件ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// 字段名
        /// </summary>
        public string Field { get; set; } = string.Empty;

        /// <summary>
        /// 操作符：equals | not_equals | greater_than | less_than | contains | is_null | is_not_null
        /// </summary>
        public string Operator { get; set; } = string.Empty;

        /// <summary>
        /// 值
        /// </summary>
        public string Value { get; set; } = string.Empty;

        /// <summary>
        /// 逻辑操作符：AND | OR
        /// </summary>
        public string? LogicalOperator { get; set; }
    }

    /// <summary>
    /// 业务规则动作DTO
    /// </summary>
    public class BusinessRuleActionDto
    {
        /// <summary>
        /// 动作ID
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// 动作类型：update_field | send_notification | execute_script | trigger_workflow
        /// </summary>
        public string Type { get; set; } = string.Empty;

        /// <summary>
        /// 目标
        /// </summary>
        public string Target { get; set; } = string.Empty;

        /// <summary>
        /// 值
        /// </summary>
        public string Value { get; set; } = string.Empty;

        /// <summary>
        /// 配置参数 (JSON格式)
        /// </summary>
        public Dictionary<string, object> Parameters { get; set; } = new();
    }

    /// <summary>
    /// 业务规则执行结果DTO
    /// </summary>
    public class BusinessRuleExecutionResultDto
    {
        /// <summary>
        /// 是否成功
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// 执行时间 (毫秒)
        /// </summary>
        public int ExecutionTime { get; set; }

        /// <summary>
        /// 执行时间戳
        /// </summary>
        public long Timestamp { get; set; }

        /// <summary>
        /// 错误信息
        /// </summary>
        public string? Error { get; set; }

        /// <summary>
        /// 执行详情
        /// </summary>
        public Dictionary<string, object> Details { get; set; } = new();
    }

    /// <summary>
    /// 业务规则执行请求DTO
    /// </summary>
    public class ExecuteBusinessRuleDto
    {
        /// <summary>
        /// 规则ID列表
        /// </summary>
        public List<Guid> RuleIds { get; set; } = new();

        /// <summary>
        /// 执行上下文数据
        /// </summary>
        public Dictionary<string, object> Context { get; set; } = new();
    }

    /// <summary>
    /// 业务规则验证结果DTO
    /// </summary>
    public class BusinessRuleValidationResultDto
    {
        /// <summary>
        /// 是否有效
        /// </summary>
        public bool IsValid { get; set; }

        /// <summary>
        /// 错误列表
        /// </summary>
        public List<string> Errors { get; set; } = new();

        /// <summary>
        /// 警告列表
        /// </summary>
        public List<string> Warnings { get; set; } = new();
    }

    /// <summary>
    /// 业务规则统计DTO
    /// </summary>
    public class BusinessRuleStatsDto
    {
        /// <summary>
        /// 总规则数
        /// </summary>
        public int TotalRules { get; set; }

        /// <summary>
        /// 活跃规则数
        /// </summary>
        public int ActiveRules { get; set; }

        /// <summary>
        /// 总执行次数
        /// </summary>
        public int ExecutionCount { get; set; }

        /// <summary>
        /// 整体成功率
        /// </summary>
        public decimal SuccessRate { get; set; }

        /// <summary>
        /// 平均执行时间
        /// </summary>
        public decimal AverageExecutionTime { get; set; }

        /// <summary>
        /// 今日执行次数
        /// </summary>
        public int TodayExecutionCount { get; set; }

        /// <summary>
        /// 错误规则数
        /// </summary>
        public int ErrorRules { get; set; }
    }

    /// <summary>
    /// 业务规则查询输入DTO
    /// </summary>
    public class GetBusinessRulesInput : PagedAndSortedResultRequestDto
    {
        /// <summary>
        /// 搜索关键词
        /// </summary>
        public string? SearchKeyword { get; set; }

        /// <summary>
        /// 实体名筛选
        /// </summary>
        public string? EntityName { get; set; }

        /// <summary>
        /// 规则类型筛选
        /// </summary>
        public string? Type { get; set; }

        /// <summary>
        /// 是否激活筛选
        /// </summary>
        public bool? IsActive { get; set; }

        /// <summary>
        /// 是否有错误筛选
        /// </summary>
        public bool? HasError { get; set; }
    }
}
