using System;

namespace SmartAbp.DevKit.Core.Models;

/// <summary>
/// 备份信息模型
/// </summary>
public class Backup
{
    /// <summary>
    /// 备份唯一标识符
    /// </summary>
    public Guid BackupId { get; set; }

    /// <summary>
    /// 备份时间戳（格式：yyyyMMddHHmmss）
    /// </summary>
    public string Timestamp { get; set; } = string.Empty;

    /// <summary>
    /// 备份路径（可能是目录或压缩包）
    /// </summary>
    public string Path { get; set; } = string.Empty;

    /// <summary>
    /// 备份描述
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// 备份文件数量
    /// </summary>
    public int FileCount { get; set; }

    /// <summary>
    /// 备份大小（字节）
    /// </summary>
    public long SizeBytes { get; set; }

    /// <summary>
    /// 备份大小（MB）
    /// </summary>
    public double SizeMB => SizeBytes / 1024.0 / 1024.0;

    /// <summary>
    /// 创建时间
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

