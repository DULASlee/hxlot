using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;

namespace SmartAbp.CodeGenerator.Core.FileOperations;

/// <summary>
/// 文件冲突解决器
/// 修复自检发现的致命缺陷：缺少冲突解决机制
/// 提供智能的文件冲突检测和解决策略
/// </summary>
public class FileConflictResolver
{
    private readonly ILogger<FileConflictResolver> _logger;

    public FileConflictResolver(ILogger<FileConflictResolver> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// 解决文件冲突
    /// </summary>
    /// <param name="filePath">文件路径</param>
    /// <param name="newContent">新内容</param>
    /// <param name="strategy">冲突解决策略</param>
    /// <returns>冲突解决结果</returns>
    public async Task<FileConflictResolution> ResolveConflictAsync(
        string filePath,
        string newContent,
        ConflictResolutionStrategy strategy = ConflictResolutionStrategy.Auto)
    {
        var resolution = new FileConflictResolution
        {
            FilePath = filePath,
            Strategy = strategy
        };

        try
        {
            if (!File.Exists(filePath))
            {
                resolution.Action = ConflictAction.Create;
                resolution.Reason = "文件不存在，将创建新文件";
                return resolution;
            }

            var existingContent = await File.ReadAllTextAsync(filePath, Encoding.UTF8);
            resolution.ExistingContentHash = ComputeContentHash(existingContent);
            resolution.NewContentHash = ComputeContentHash(newContent);

            _logger.LogDebug("检测文件冲突: {FilePath}, 策略: {Strategy}", filePath, strategy);

            // 内容相同检查
            if (existingContent == newContent)
            {
                resolution.Action = ConflictAction.Skip;
                resolution.Reason = "文件内容完全相同，跳过写入";
                _logger.LogDebug("文件内容相同，跳过写入: {FilePath}", filePath);
                return resolution;
            }

            // 根据策略决定处理方式
            switch (strategy)
            {
                case ConflictResolutionStrategy.Auto:
                    return await ResolveAutoAsync(filePath, existingContent, newContent, resolution);

                case ConflictResolutionStrategy.Overwrite:
                    resolution.Action = ConflictAction.Overwrite;
                    resolution.Reason = "强制覆盖策略";
                    break;

                case ConflictResolutionStrategy.Backup:
                    resolution.Action = ConflictAction.Backup;
                    resolution.Reason = "备份后覆盖策略";
                    break;

                case ConflictResolutionStrategy.Skip:
                    resolution.Action = ConflictAction.Skip;
                    resolution.Reason = "跳过策略";
                    break;

                case ConflictResolutionStrategy.Merge:
                    return await ResolveMergeAsync(filePath, existingContent, newContent, resolution);

                case ConflictResolutionStrategy.Fail:
                    resolution.Action = ConflictAction.Fail;
                    resolution.Reason = "检测到冲突，策略为失败";
                    resolution.ErrorMessage = "文件冲突：文件已存在且内容不同";
                    break;

                default:
                    throw new ArgumentException($"未知的冲突解决策略: {strategy}");
            }

            _logger.LogInformation("文件冲突解决: {FilePath} -> {Action} ({Reason})", 
                filePath, resolution.Action, resolution.Reason);

            return resolution;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "文件冲突解决失败: {FilePath}", filePath);
            resolution.Action = ConflictAction.Fail;
            resolution.ErrorMessage = $"冲突解决异常: {ex.Message}";
            return resolution;
        }
    }

    /// <summary>
    /// 自动冲突解决策略
    /// </summary>
    private async Task<FileConflictResolution> ResolveAutoAsync(
        string filePath,
        string existingContent,
        string newContent,
        FileConflictResolution resolution)
    {
        try
        {
            // 1. 检查是否为生成代码的更新
            if (IsGeneratedCodeUpdate(existingContent, newContent))
            {
                resolution.Action = ConflictAction.Overwrite;
                resolution.Reason = "检测到生成代码更新，自动覆盖";
                return resolution;
            }

            // 2. 检查是否可以智能合并
            var mergeResult = await TrySmartMergeAsync(existingContent, newContent);
            if (mergeResult.CanMerge)
            {
                resolution.Action = ConflictAction.Merge;
                resolution.MergedContent = mergeResult.MergedContent;
                resolution.Reason = "检测到可自动合并的更改";
                resolution.MergeDetails = mergeResult.MergeDetails;
                return resolution;
            }

            // 3. 检查文件类型和重要性
            var fileType = DetermineFileType(filePath);
            switch (fileType)
            {
                case GeneratedFileType.ApplicationService:
                case GeneratedFileType.Controller:
                case GeneratedFileType.Repository:
                case GeneratedFileType.Entity:
                    resolution.Action = ConflictAction.Backup;
                    resolution.Reason = $"重要的业务文件({fileType})，备份后更新";
                    break;

                case GeneratedFileType.Dto:
                case GeneratedFileType.Interface:
                case GeneratedFileType.Configuration:
                    resolution.Action = ConflictAction.Overwrite;
                    resolution.Reason = $"数据传输对象({fileType})，直接覆盖";
                    break;

                case GeneratedFileType.Migration:
                case GeneratedFileType.Seed:
                    resolution.Action = ConflictAction.Skip;
                    resolution.Reason = $"数据库相关文件({fileType})，跳过以避免数据问题";
                    break;

                default:
                    resolution.Action = ConflictAction.Backup;
                    resolution.Reason = "未知文件类型，备份后更新";
                    break;
            }

            return resolution;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "自动冲突解决失败，使用备份策略: {FilePath}", filePath);
            resolution.Action = ConflictAction.Backup;
            resolution.Reason = "自动解决失败，使用备份策略";
            return resolution;
        }
    }

    /// <summary>
    /// 合并冲突解决策略
    /// </summary>
    private async Task<FileConflictResolution> ResolveMergeAsync(
        string filePath,
        string existingContent,
        string newContent,
        FileConflictResolution resolution)
    {
        try
        {
            var mergeResult = await TrySmartMergeAsync(existingContent, newContent);
            
            if (mergeResult.CanMerge)
            {
                resolution.Action = ConflictAction.Merge;
                resolution.MergedContent = mergeResult.MergedContent;
                resolution.Reason = "成功合并文件内容";
                resolution.MergeDetails = mergeResult.MergeDetails;
            }
            else
            {
                resolution.Action = ConflictAction.Fail;
                resolution.ErrorMessage = "无法自动合并文件内容，需要手动解决";
                resolution.Reason = "合并失败";
            }

            return resolution;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "合并操作失败: {FilePath}", filePath);
            resolution.Action = ConflictAction.Fail;
            resolution.ErrorMessage = $"合并操作异常: {ex.Message}";
            return resolution;
        }
    }

    /// <summary>
    /// 智能合并尝试
    /// </summary>
    private async Task<SmartMergeResult> TrySmartMergeAsync(string existingContent, string newContent)
    {
        var result = new SmartMergeResult();

        try
        {
            // 1. 简单情况：只是添加内容
            if (newContent.Contains(existingContent))
            {
                result.CanMerge = true;
                result.MergedContent = newContent;
                result.MergeDetails = "新内容包含现有内容，直接使用新内容";
                return result;
            }

            // 2. 基于行的智能合并
            var existingLines = existingContent.Split('\n', StringSplitOptions.None);
            var newLines = newContent.Split('\n', StringSplitOptions.None);

            var mergedLines = new List<string>();
            var mergeConflicts = new List<string>();

            // 简单的三路合并逻辑
            var maxLines = Math.Max(existingLines.Length, newLines.Length);
            for (int i = 0; i < maxLines; i++)
            {
                var existingLine = i < existingLines.Length ? existingLines[i] : null;
                var newLine = i < newLines.Length ? newLines[i] : null;

                if (existingLine == newLine)
                {
                    // 相同行，直接添加
                    if (existingLine != null)
                    {
                        mergedLines.Add(existingLine);
                    }
                }
                else if (existingLine == null)
                {
                    // 新增行
                    mergedLines.Add(newLine!);
                    result.MergeDetails += $"新增行 {i + 1}: {newLine}\n";
                }
                else if (newLine == null)
                {
                    // 删除行 - 在代码生成场景中，倾向于保留现有内容
                    mergedLines.Add(existingLine);
                    result.MergeDetails += $"保留现有行 {i + 1}: {existingLine}\n";
                }
                else
                {
                    // 冲突行 - 对于代码生成，检查是否为注释或import
                    if (IsNonConflictingChange(existingLine, newLine))
                    {
                        mergedLines.Add(newLine); // 使用新版本
                        result.MergeDetails += $"更新行 {i + 1}: {existingLine} -> {newLine}\n";
                    }
                    else
                    {
                        // 真正的冲突
                        mergeConflicts.Add($"行 {i + 1}: '{existingLine}' vs '{newLine}'");
                    }
                }
            }

            // 如果有无法解决的冲突，标记为无法合并
            if (mergeConflicts.Any())
            {
                result.CanMerge = false;
                result.ConflictDetails = string.Join("\n", mergeConflicts);
                return result;
            }

            result.CanMerge = true;
            result.MergedContent = string.Join('\n', mergedLines);
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "智能合并过程异常");
            result.CanMerge = false;
            result.ConflictDetails = $"合并过程异常: {ex.Message}";
            return result;
        }
    }

    /// <summary>
    /// 检查是否为生成代码的更新
    /// </summary>
    private bool IsGeneratedCodeUpdate(string existingContent, string newContent)
    {
        // 检查是否包含代码生成标记
        var generationMarkers = new[]
        {
            "// <auto-generated",
            "// This code was generated by",
            "// Generated by SmartAbp.CodeGenerator",
            "/// <summary>",
            "/// This file is auto-generated"
        };

        var hasGenerationMarker = generationMarkers.Any(marker =>
            existingContent.Contains(marker, StringComparison.OrdinalIgnoreCase) ||
            newContent.Contains(marker, StringComparison.OrdinalIgnoreCase));

        if (hasGenerationMarker)
        {
            _logger.LogDebug("检测到代码生成标记，判断为生成代码更新");
            return true;
        }

        // 检查文件结构相似性（超过80%相似认为是更新）
        var similarity = CalculateContentSimilarity(existingContent, newContent);
        if (similarity > 0.8)
        {
            _logger.LogDebug("内容相似度 {Similarity:P0}，判断为生成代码更新", similarity);
            return true;
        }

        return false;
    }

    /// <summary>
    /// 检查是否为非冲突性更改
    /// </summary>
    private bool IsNonConflictingChange(string existingLine, string newLine)
    {
        // 注释行的更改通常不是冲突
        if (existingLine.Trim().StartsWith("//") && newLine.Trim().StartsWith("//"))
        {
            return true;
        }

        // using 语句的更改
        if (existingLine.Trim().StartsWith("using ") && newLine.Trim().StartsWith("using "))
        {
            return true;
        }

        // 空行处理
        if (string.IsNullOrWhiteSpace(existingLine) || string.IsNullOrWhiteSpace(newLine))
        {
            return true;
        }

        // 只有空白差异
        if (existingLine.Trim() == newLine.Trim())
        {
            return true;
        }

        return false;
    }

    /// <summary>
    /// 计算内容相似度
    /// </summary>
    private double CalculateContentSimilarity(string content1, string content2)
    {
        if (content1 == content2) return 1.0;
        if (string.IsNullOrEmpty(content1) || string.IsNullOrEmpty(content2)) return 0.0;

        var lines1 = content1.Split('\n').Select(l => l.Trim()).Where(l => !string.IsNullOrEmpty(l)).ToArray();
        var lines2 = content2.Split('\n').Select(l => l.Trim()).Where(l => !string.IsNullOrEmpty(l)).ToArray();

        var commonLines = lines1.Intersect(lines2).Count();
        var totalLines = Math.Max(lines1.Length, lines2.Length);

        return totalLines > 0 ? (double)commonLines / totalLines : 0.0;
    }

    /// <summary>
    /// 确定文件类型
    /// </summary>
    private GeneratedFileType DetermineFileType(string filePath)
    {
        var fileName = Path.GetFileName(filePath).ToLowerInvariant();
        var directory = Path.GetDirectoryName(filePath)?.ToLowerInvariant() ?? string.Empty;

        if (fileName.Contains("appservice") || fileName.Contains("applicationservice"))
            return GeneratedFileType.ApplicationService;
        
        if (fileName.Contains("controller"))
            return GeneratedFileType.Controller;
        
        if (fileName.Contains("repository"))
            return GeneratedFileType.Repository;
        
        if (fileName.Contains("dto") || fileName.EndsWith("dto.cs"))
            return GeneratedFileType.Dto;
        
        if (fileName.StartsWith("i") && fileName.EndsWith(".cs") && !fileName.Contains("dto"))
            return GeneratedFileType.Interface;
        
        if (directory.Contains("migrations") || fileName.Contains("migration"))
            return GeneratedFileType.Migration;
        
        if (directory.Contains("entities") || directory.Contains("domain"))
            return GeneratedFileType.Entity;
        
        if (fileName.Contains("configuration") || fileName.Contains("config"))
            return GeneratedFileType.Configuration;
        
        if (fileName.Contains("seed") || directory.Contains("seed"))
            return GeneratedFileType.Seed;

        return GeneratedFileType.Unknown;
    }

    /// <summary>
    /// 计算内容哈希
    /// </summary>
    private string ComputeContentHash(string content)
    {
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(content));
        return Convert.ToHexString(hashBytes);
    }
}

#region 枚举和数据传输对象

/// <summary>
/// 冲突解决策略
/// </summary>
public enum ConflictResolutionStrategy
{
    /// <summary>自动决定最佳策略</summary>
    Auto,
    /// <summary>直接覆盖</summary>
    Overwrite,
    /// <summary>备份后覆盖</summary>
    Backup,
    /// <summary>跳过冲突文件</summary>
    Skip,
    /// <summary>尝试智能合并</summary>
    Merge,
    /// <summary>失败并报错</summary>
    Fail
}

/// <summary>
/// 冲突处理动作
/// </summary>
public enum ConflictAction
{
    /// <summary>创建新文件</summary>
    Create,
    /// <summary>覆盖现有文件</summary>
    Overwrite,
    /// <summary>备份后覆盖</summary>
    Backup,
    /// <summary>跳过处理</summary>
    Skip,
    /// <summary>合并内容</summary>
    Merge,
    /// <summary>处理失败</summary>
    Fail
}

/// <summary>
/// 生成文件类型
/// </summary>
public enum GeneratedFileType
{
    Unknown,
    ApplicationService,
    Controller,
    Repository,
    Entity,
    Dto,
    Interface,
    Configuration,
    Migration,
    Seed
}

/// <summary>
/// 文件冲突解决结果
/// </summary>
public class FileConflictResolution
{
    public string FilePath { get; set; } = string.Empty;
    public ConflictResolutionStrategy Strategy { get; set; }
    public ConflictAction Action { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public string? MergedContent { get; set; }
    public string? MergeDetails { get; set; }
    public string? ExistingContentHash { get; set; }
    public string? NewContentHash { get; set; }

    public bool IsSuccess => Action != ConflictAction.Fail && string.IsNullOrEmpty(ErrorMessage);
}

/// <summary>
/// 智能合并结果
/// </summary>
public class SmartMergeResult
{
    public bool CanMerge { get; set; }
    public string? MergedContent { get; set; }
    public string MergeDetails { get; set; } = string.Empty;
    public string? ConflictDetails { get; set; }
}

#endregion
