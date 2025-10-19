using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.Extensions.Logging;

namespace SmartAbp.DevKit.Core.Logging.Models;

/// <summary>
/// 日志条目实体（EF Core实体，支持SQL Server和PostgreSQL）
/// </summary>
[Table("DevKit_Logs")]
public class LogEntry
{
    /// <summary>
    /// 日志ID（主键，自增）
    /// </summary>
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    /// <summary>
    /// 日志时间戳
    /// </summary>
    [Required]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// 日志级别（Information, Warning, Error等）
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string Level { get; set; } = LogLevel.Information.ToString();

    /// <summary>
    /// 日志类别（如：CodeGeneratorEngine, UpgradeManager等）
    /// </summary>
    [Required]
    [MaxLength(200)]
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// 日志消息
    /// </summary>
    [Required]
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// 异常信息（可选）
    /// </summary>
    public string? Exception { get; set; }

    /// <summary>
    /// 额外属性（JSON格式，存储Dictionary<string, object>）
    /// </summary>
    public string? Properties { get; set; }

    /// <summary>
    /// 关联的操作ID（用于追踪整个操作的所有日志）
    /// </summary>
    [MaxLength(50)]
    public string? OperationId { get; set; }

    /// <summary>
    /// 机器名称
    /// </summary>
    [MaxLength(100)]
    public string? MachineName { get; set; }

    /// <summary>
    /// 进程ID
    /// </summary>
    public int? ProcessId { get; set; }

    /// <summary>
    /// 线程ID
    /// </summary>
    public int? ThreadId { get; set; }
}

/// <summary>
/// 性能日志条目实体
/// </summary>
[Table("DevKit_PerformanceLogs")]
public class PerformanceLogEntry
{
    /// <summary>
    /// 性能日志ID（主键，自增）
    /// </summary>
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    /// <summary>
    /// 记录时间
    /// </summary>
    [Required]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// 操作名称（如：Generate_AppService, Upgrade_Layer1ToLayer2等）
    /// </summary>
    [Required]
    [MaxLength(200)]
    public string OperationName { get; set; } = string.Empty;

    /// <summary>
    /// 耗时（毫秒）
    /// </summary>
    [Required]
    public long DurationMs { get; set; }

    /// <summary>
    /// 内存占用（字节）
    /// </summary>
    public long? MemoryUsageBytes { get; set; }

    /// <summary>
    /// CPU使用率（百分比）
    /// </summary>
    public double? CpuUsagePercent { get; set; }

    /// <summary>
    /// 操作状态（Success, Failed, Warning）
    /// </summary>
    [MaxLength(20)]
    public string Status { get; set; } = "Success";

    /// <summary>
    /// 额外元数据（JSON格式）
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// 关联的操作ID
    /// </summary>
    [MaxLength(50)]
    public string? OperationId { get; set; }
}

/// <summary>
/// 升级历史记录实体
/// </summary>
[Table("DevKit_UpgradeHistory")]
public class UpgradeHistoryEntry
{
    /// <summary>
    /// 升级历史ID（主键）
    /// </summary>
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// 升级时间
    /// </summary>
    [Required]
    public DateTime UpgradeTime { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// 模块名称
    /// </summary>
    [Required]
    [MaxLength(200)]
    public string ModuleName { get; set; } = string.Empty;

    /// <summary>
    /// 源层级
    /// </summary>
    [Required]
    public int FromLayer { get; set; }

    /// <summary>
    /// 目标层级
    /// </summary>
    [Required]
    public int ToLayer { get; set; }

    /// <summary>
    /// 升级状态（Success, Failed, RolledBack）
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Success";

    /// <summary>
    /// 备份ID（关联的备份）
    /// </summary>
    public Guid? BackupId { get; set; }

    /// <summary>
    /// 升级耗时（毫秒）
    /// </summary>
    public long DurationMs { get; set; }

    /// <summary>
    /// 生成的文件数量
    /// </summary>
    public int GeneratedFileCount { get; set; }

    /// <summary>
    /// 备注信息
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// 详细报告（JSON格式）
    /// </summary>
    public string? ReportJson { get; set; }
}

/// <summary>
/// 文件哈希存储实体（用于增量生成）
/// </summary>
[Table("DevKit_FileHashes")]
public class FileHashEntry
{
    /// <summary>
    /// 文件路径（主键）
    /// </summary>
    [Key]
    [MaxLength(500)]
    public string Path { get; set; } = string.Empty;

    /// <summary>
    /// 文件哈希（SHA256）
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string Hash { get; set; } = string.Empty;

    /// <summary>
    /// 最后更新时间
    /// </summary>
    [Required]
    public DateTime LastModified { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// 文件大小（字节）
    /// </summary>
    public long FileSize { get; set; }

    /// <summary>
    /// 文件类型
    /// </summary>
    [MaxLength(50)]
    public string? FileType { get; set; }
}

