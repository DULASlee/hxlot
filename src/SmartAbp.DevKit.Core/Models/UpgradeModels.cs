using System;
using System.Collections.Generic;
using SmartAbp.DevKit.Core.Abstractions;

namespace SmartAbp.DevKit.Core.Models;

/// <summary>
/// 升级检查结果
/// </summary>
public class UpgradeCheckResult
{
    /// <summary>
    /// 模块名称
    /// </summary>
    public string ModuleName { get; set; } = string.Empty;

    /// <summary>
    /// 是否需要升级
    /// </summary>
    public bool NeedsUpgrade { get; set; }

    /// <summary>
    /// 变更列表
    /// </summary>
    public List<UpgradeChange> Changes { get; set; } = new();

    /// <summary>
    /// 升级风险等级
    /// </summary>
    public UpgradeRiskLevel RiskLevel { get; set; }

    /// <summary>
    /// 检查时间
    /// </summary>
    public DateTime CheckTime { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// 升级变更
/// </summary>
public class UpgradeChange
{
    /// <summary>
    /// 变更类型
    /// </summary>
    public UpgradeChangeType ChangeType { get; set; }

    /// <summary>
    /// 变更描述
    /// </summary>
    public string ChangeDescription { get; set; } = string.Empty;

    /// <summary>
    /// 严重程度
    /// </summary>
    public UpgradeSeverity Severity { get; set; }

    /// <summary>
    /// 受影响的实体名称
    /// </summary>
    public string? AffectedEntity { get; set; }

    /// <summary>
    /// 额外的变更详情
    /// </summary>
    public Dictionary<string, object> Details { get; set; } = new();
}

/// <summary>
/// 升级变更类型
/// </summary>
public enum UpgradeChangeType
{
    /// <summary>
    /// 实体数量变化
    /// </summary>
    EntityCountChanged,

    /// <summary>
    /// 实体新增
    /// </summary>
    EntityAdded,

    /// <summary>
    /// 实体删除
    /// </summary>
    EntityRemoved,

    /// <summary>
    /// 属性新增
    /// </summary>
    PropertyAdded,

    /// <summary>
    /// 属性删除
    /// </summary>
    PropertyRemoved,

    /// <summary>
    /// 属性类型变化
    /// </summary>
    PropertyTypeChanged,

    /// <summary>
    /// 模板更新
    /// </summary>
    TemplateUpdated,

    /// <summary>
    /// 层级变化
    /// </summary>
    LayerChanged,

    /// <summary>
    /// 关系变化
    /// </summary>
    RelationshipChanged,

    /// <summary>
    /// 配置变化
    /// </summary>
    ConfigurationChanged
}

/// <summary>
/// 升级严重程度
/// </summary>
public enum UpgradeSeverity
{
    /// <summary>
    /// 低（无破坏性变更）
    /// </summary>
    Low,

    /// <summary>
    /// 中（可能需要手动调整）
    /// </summary>
    Medium,

    /// <summary>
    /// 高（需要重新生成大量代码）
    /// </summary>
    High,

    /// <summary>
    /// 严重（可能导致数据丢失或破坏性变更）
    /// </summary>
    Critical
}

/// <summary>
/// 升级风险等级
/// </summary>
public enum UpgradeRiskLevel
{
    /// <summary>
    /// 无风险
    /// </summary>
    None,

    /// <summary>
    /// 低风险
    /// </summary>
    Low,

    /// <summary>
    /// 中等风险
    /// </summary>
    Medium,

    /// <summary>
    /// 高风险
    /// </summary>
    High
}

/// <summary>
/// 升级结果
/// </summary>
public class UpgradeResult
{
    /// <summary>
    /// 升级唯一标识符
    /// </summary>
    public Guid UpgradeId { get; set; }

    /// <summary>
    /// 模块名称
    /// </summary>
    public string ModuleName { get; set; } = string.Empty;

    /// <summary>
    /// 升级是否成功
    /// </summary>
    public bool IsSuccess { get; set; }

    /// <summary>
    /// 升级消息
    /// </summary>
    public string? Message { get; set; }

    /// <summary>
    /// 错误详情（如果失败）
    /// </summary>
    public string? ErrorDetails { get; set; }

    /// <summary>
    /// 备份ID（如果创建了备份）
    /// </summary>
    public Guid? BackupId { get; set; }

    /// <summary>
    /// 升级步骤列表
    /// </summary>
    public List<UpgradeStep> UpgradeSteps { get; set; } = new();

    /// <summary>
    /// 开始时间
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// 结束时间
    /// </summary>
    public DateTime EndTime { get; set; }

    /// <summary>
    /// 升级持续时间
    /// </summary>
    public TimeSpan Duration => EndTime - StartTime;
}

/// <summary>
/// 升级步骤
/// </summary>
public class UpgradeStep
{
    /// <summary>
    /// 步骤名称
    /// </summary>
    public string StepName { get; set; } = string.Empty;

    /// <summary>
    /// 步骤状态
    /// </summary>
    public UpgradeStepStatus Status { get; set; }

    /// <summary>
    /// 步骤消息
    /// </summary>
    public string? Message { get; set; }

    /// <summary>
    /// 步骤开始时间
    /// </summary>
    public DateTime? StartTime { get; set; }

    /// <summary>
    /// 步骤结束时间
    /// </summary>
    public DateTime? EndTime { get; set; }
}

/// <summary>
/// 升级步骤状态
/// </summary>
public enum UpgradeStepStatus
{
    /// <summary>
    /// 待执行
    /// </summary>
    Pending,

    /// <summary>
    /// 执行中
    /// </summary>
    Running,

    /// <summary>
    /// 已完成
    /// </summary>
    Completed,

    /// <summary>
    /// 失败
    /// </summary>
    Failed,

    /// <summary>
    /// 跳过
    /// </summary>
    Skipped
}

/// <summary>
/// 升级历史记录
/// </summary>
public class UpgradeHistory
{
    /// <summary>
    /// 升级唯一标识符
    /// </summary>
    public Guid UpgradeId { get; set; }

    /// <summary>
    /// 模块名称
    /// </summary>
    public string ModuleName { get; set; } = string.Empty;

    /// <summary>
    /// 升级时间
    /// </summary>
    public DateTime UpgradeTime { get; set; }

    /// <summary>
    /// 变更列表
    /// </summary>
    public List<UpgradeChange> Changes { get; set; } = new();

    /// <summary>
    /// 配置快照（升级时的配置状态）
    /// </summary>
    public LowCodeConfig? ConfigSnapshot { get; set; }

    /// <summary>
    /// 升级是否成功
    /// </summary>
    public bool IsSuccess { get; set; } = true;

    /// <summary>
    /// 备份ID（如果有）
    /// </summary>
    public Guid? BackupId { get; set; }
}


