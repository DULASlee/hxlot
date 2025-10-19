using System;
using System.Collections.Generic;

namespace SmartAbp.DevKit.Core.Types;

/// <summary>
/// 实体Schema定义
/// </summary>
public class EntitySchema
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<PropertySchema> Properties { get; set; } = new();
    public List<RelationshipSchema>? Relationships { get; set; }
    public List<IndexSchema>? Indexes { get; set; }
    public List<ConstraintSchema>? Constraints { get; set; }
}

/// <summary>
/// 属性Schema定义
/// </summary>
public class PropertySchema
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public bool IsKey { get; set; }
    public bool IsUnique { get; set; }
    public object? DefaultValue { get; set; }
    public List<ValidationRule>? Validation { get; set; }
}

/// <summary>
/// 关系Schema定义
/// </summary>
public class RelationshipSchema
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid FromEntityId { get; set; }
    public Guid ToEntityId { get; set; }
    public RelationType Type { get; set; }
    public string? NavigationProperty { get; set; }
    public string? ForeignKey { get; set; }
}

/// <summary>
/// 索引Schema定义
/// </summary>
public class IndexSchema
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<string> Columns { get; set; } = new();
    public bool IsUnique { get; set; }
    public bool IsClustered { get; set; }
}

/// <summary>
/// 约束Schema定义
/// </summary>
public class ConstraintSchema
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ConstraintType Type { get; set; }
    public string Expression { get; set; } = string.Empty;
}

/// <summary>
/// 验证规则
/// </summary>
public class ValidationRule
{
    public string Name { get; set; } = string.Empty;
    public Func<object?, bool> Validator { get; set; } = _ => true;
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// 关系类型
/// </summary>
public enum RelationType
{
    OneToOne = 0,
    OneToMany = 1,
    ManyToOne = 2,
    ManyToMany = 3
}

/// <summary>
/// 约束类型
/// </summary>
public enum ConstraintType
{
    Check,
    Unique,
    ForeignKey,
    PrimaryKey
}

/// <summary>
/// 代码生成结果
/// </summary>
public class GenerationResult
{
    public bool Success { get; set; }
    public string Code { get; set; } = string.Empty;
    public EntitySchema Metadata { get; set; } = new();
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public PerformanceMetrics? Performance { get; set; }
}

/// <summary>
/// 性能指标
/// </summary>
public class PerformanceMetrics
{
    public long TotalTime { get; set; }
    public Dictionary<string, long> WorkstationTimes { get; set; } = new();
}

/// <summary>
/// 验证结果
/// </summary>
public class ValidationResult
{
    public bool IsValid { get; set; }
    public List<ValidationError> Errors { get; set; } = new();
    public List<ValidationWarning> Warnings { get; set; } = new();

    public static ValidationResult Success() => new() { IsValid = true };
    public static ValidationResult Fail(string error) => new()
    {
        IsValid = false,
        Errors = new List<ValidationError>
        {
            new() { Code = "E000", Message = error, Severity = "error" }
        }
    };
}

/// <summary>
/// 验证错误
/// </summary>
public class ValidationError
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Path { get; set; }
    public string Severity { get; set; } = "error";
}

/// <summary>
/// 验证警告
/// </summary>
public class ValidationWarning
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Path { get; set; }
    public string Severity { get; set; } = "warning";
}

/// <summary>
/// AI生成上下文
/// </summary>
public class GenerationContext
{
    public EntitySchema EntitySchema { get; set; } = new();
    public string TargetFramework { get; set; } = "backend"; // backend | frontend | fullstack
    public string TemplateEngine { get; set; } = "handlebars"; // handlebars | tsmorph | roslyn
    public Dictionary<string, object>? Options { get; set; }
}

/// <summary>
/// AI流水线配置
/// </summary>
public class AIFlowConfig
{
    public List<WorkstationConfig> Workstations { get; set; } = new();
    public List<QualityGateConfig> QualityGates { get; set; } = new();
    public ValidationConfig OutputValidation { get; set; } = new();
}

/// <summary>
/// 流水线工位配置
/// </summary>
public class WorkstationConfig
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public WorkstationType Type { get; set; }
    public Func<WorkstationInput, Task<WorkstationOutput>> Handler { get; set; } = _ => Task.FromResult(new WorkstationOutput());
    public object? InputSchema { get; set; }
    public object? OutputSchema { get; set; }
    public List<Func<WorkstationOutput, Task<QualityCheckResult>>>? QualityChecks { get; set; }
}

/// <summary>
/// 工位类型
/// </summary>
public enum WorkstationType
{
    Metadata,
    Backend,
    Frontend,
    Quality
}

/// <summary>
/// 工位输入
/// </summary>
public class WorkstationInput
{
    public GenerationContext Context { get; set; } = new();
    public List<WorkstationOutput> PreviousOutputs { get; set; } = new();
    public EntitySchema Metadata { get; set; } = new();
}

/// <summary>
/// 工位输出
/// </summary>
public class WorkstationOutput
{
    public string Code { get; set; } = string.Empty;
    public EntitySchema Metadata { get; set; } = new();
    public string WorkstationId { get; set; } = string.Empty;
    public long ExecutionTime { get; set; }
    public Dictionary<string, object> AdditionalData { get; set; } = new();
}

/// <summary>
/// 质量检查结果
/// </summary>
public class QualityCheckResult
{
    public bool Passed { get; set; }
    public List<string> Errors { get; set; } = new();

    public static QualityCheckResult Success() => new() { Passed = true };
    public static QualityCheckResult Fail(params string[] errors) => new()
    {
        Passed = false,
        Errors = errors.ToList()
    };
}

/// <summary>
/// 质量门禁配置
/// </summary>
public class QualityGateConfig
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Func<WorkstationOutput, Task<QualityCheckResult>> Checker { get; set; } = _ => Task.FromResult(QualityCheckResult.Success());
}

/// <summary>
/// 验证配置
/// </summary>
public class ValidationConfig
{
    public bool Enabled { get; set; } = true;
    public List<string> Rules { get; set; } = new();
}

/// <summary>
/// 流水线状态
/// </summary>
public class FlowState
{
    public GenerationContext Context { get; set; } = new();
    public string CurrentWorkstation { get; set; } = string.Empty;
    public Dictionary<string, WorkstationOutput> WorkstationOutputs { get; set; } = new();
    public List<string> Errors { get; set; } = new();
    public long StartTime { get; set; }
}

