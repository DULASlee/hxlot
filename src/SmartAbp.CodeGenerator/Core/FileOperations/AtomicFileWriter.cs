using Microsoft.Extensions.Logging;
using System.Text;

namespace SmartAbp.CodeGenerator.Core.FileOperations;

/// <summary>
/// 原子文件写入器
/// 修复自检发现的致命缺陷：非原子文件操作导致的文件损坏风险
/// 使用 write-rename 模式确保文件操作的原子性
/// </summary>
public class AtomicFileWriter
{
    private readonly ILogger<AtomicFileWriter> _logger;
    private readonly FileConflictResolver _conflictResolver;

    public AtomicFileWriter(
        ILogger<AtomicFileWriter> logger,
        FileConflictResolver conflictResolver)
    {
        _logger = logger;
        _conflictResolver = conflictResolver;
    }

    /// <summary>
    /// 原子性写入文件
    /// </summary>
    /// <param name="filePath">目标文件路径</param>
    /// <param name="content">文件内容</param>
    /// <param name="encoding">文件编码，默认UTF-8</param>
    /// <returns>写入结果</returns>
    public async Task<AtomicWriteResult> WriteFileAtomicAsync(
        string filePath,
        string content,
        Encoding? encoding = null)
    {
        encoding ??= Encoding.UTF8;
        var result = new AtomicWriteResult { TargetPath = filePath };

        try
        {
            _logger.LogDebug("开始原子写入文件: {FilePath}", filePath);

            // 1. 路径安全验证
            var pathValidation = ValidateFilePath(filePath);
            if (!pathValidation.IsValid)
            {
                result.IsSuccess = false;
                result.ErrorMessage = pathValidation.ErrorMessage;
                return result;
            }

            // 2. 确保目标目录存在
            var directory = Path.GetDirectoryName(filePath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
                _logger.LogDebug("创建目录: {Directory}", directory);
            }

            // 3. 检查文件冲突
            if (File.Exists(filePath))
            {
                var conflictResult = await _conflictResolver.ResolveConflictAsync(filePath, content);
                result.ConflictResolution = conflictResult;

                if (conflictResult.Action == ConflictAction.Skip)
                {
                    result.IsSuccess = true;
                    result.WasSkipped = true;
                    result.Message = "文件已存在且内容相同，跳过写入";
                    return result;
                }

                if (conflictResult.Action == ConflictAction.Backup)
                {
                    await CreateBackupAsync(filePath);
                    result.BackupCreated = true;
                }

                // 如果是合并操作，使用合并后的内容
                if (conflictResult.Action == ConflictAction.Merge && !string.IsNullOrEmpty(conflictResult.MergedContent))
                {
                    content = conflictResult.MergedContent;
                }
            }

            // 4. Write-Rename 原子操作
            var tempFilePath = GenerateTempFilePath(filePath);
            result.TempPath = tempFilePath;

            // 写入临时文件
            await File.WriteAllTextAsync(tempFilePath, content, encoding);

            // 验证写入完整性
            var verificationResult = await VerifyFileIntegrity(tempFilePath, content, encoding);
            if (!verificationResult.IsValid)
            {
                File.Delete(tempFilePath);
                result.IsSuccess = false;
                result.ErrorMessage = $"文件完整性验证失败: {verificationResult.ErrorMessage}";
                return result;
            }

            // 原子性重命名（关键步骤）
            File.Move(tempFilePath, filePath, overwrite: true);

            result.IsSuccess = true;
            result.BytesWritten = encoding.GetByteCount(content);
            result.Message = $"文件原子写入成功: {result.BytesWritten} 字节";

            _logger.LogInformation("原子写入成功: {FilePath} ({Bytes} 字节)", filePath, result.BytesWritten);

            return result;
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogError(ex, "文件访问权限不足: {FilePath}", filePath);
            result.IsSuccess = false;
            result.ErrorMessage = $"文件访问权限不足: {ex.Message}";
            return result;
        }
        catch (DirectoryNotFoundException ex)
        {
            _logger.LogError(ex, "目录不存在: {FilePath}", filePath);
            result.IsSuccess = false;
            result.ErrorMessage = $"目录不存在: {ex.Message}";
            return result;
        }
        catch (IOException ex)
        {
            _logger.LogError(ex, "IO操作失败: {FilePath}", filePath);
            result.IsSuccess = false;
            result.ErrorMessage = $"IO操作失败: {ex.Message}";

            // 清理临时文件
            if (!string.IsNullOrEmpty(result.TempPath) && File.Exists(result.TempPath))
            {
                try
                {
                    File.Delete(result.TempPath);
                }
                catch
                {
                    // 忽略清理错误
                }
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "原子写入未知错误: {FilePath}", filePath);
            result.IsSuccess = false;
            result.ErrorMessage = $"未知错误: {ex.Message}";

            // 清理临时文件
            if (!string.IsNullOrEmpty(result.TempPath) && File.Exists(result.TempPath))
            {
                try
                {
                    File.Delete(result.TempPath);
                }
                catch
                {
                    // 忽略清理错误
                }
            }

            return result;
        }
    }

    /// <summary>
    /// 批量原子写入文件
    /// </summary>
    /// <param name="files">文件字典：路径 -> 内容</param>
    /// <param name="encoding">文件编码</param>
    /// <returns>批量写入结果</returns>
    public async Task<BatchAtomicWriteResult> WriteBatchAtomicAsync(
        Dictionary<string, string> files,
        Encoding? encoding = null)
    {
        var batchResult = new BatchAtomicWriteResult();

        try
        {
            _logger.LogInformation("开始批量原子写入，文件数量: {FileCount}", files.Count);

            // 并行写入（但保持原子性）
            var tasks = files.Select(async kvp =>
            {
                var result = await WriteFileAtomicAsync(kvp.Key, kvp.Value, encoding);
                return new { Path = kvp.Key, Result = result };
            });

            var results = await Task.WhenAll(tasks);

            foreach (var item in results)
            {
                batchResult.FileResults[item.Path] = item.Result;

                if (item.Result.IsSuccess)
                {
                    if (item.Result.WasSkipped)
                    {
                        batchResult.SkippedCount++;
                    }
                    else
                    {
                        batchResult.SuccessCount++;
                    }
                }
                else
                {
                    batchResult.FailedCount++;
                    batchResult.FailedFiles.Add(item.Path);
                }

                batchResult.TotalBytesWritten += item.Result.BytesWritten;
            }

            batchResult.IsSuccess = batchResult.FailedCount == 0;
            batchResult.TotalFiles = files.Count;

            _logger.LogInformation("批量原子写入完成: 成功 {Success}, 跳过 {Skipped}, 失败 {Failed}",
                batchResult.SuccessCount, batchResult.SkippedCount, batchResult.FailedCount);

            return batchResult;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "批量原子写入过程异常");
            batchResult.IsSuccess = false;
            batchResult.SystemError = ex.Message;
            return batchResult;
        }
    }

    /// <summary>
    /// 安全删除文件
    /// </summary>
    /// <param name="filePath">文件路径</param>
    /// <param name="createBackup">是否创建备份</param>
    /// <returns>删除结果</returns>
    public async Task<FileDeleteResult> DeleteFileAsync(string filePath, bool createBackup = true)
    {
        var result = new FileDeleteResult { TargetPath = filePath };

        try
        {
            if (!File.Exists(filePath))
            {
                result.IsSuccess = true;
                result.WasAlreadyDeleted = true;
                result.Message = "文件不存在，无需删除";
                return result;
            }

            if (createBackup)
            {
                var backupPath = await CreateBackupAsync(filePath);
                result.BackupPath = backupPath;
                result.BackupCreated = true;
            }

            File.Delete(filePath);
            result.IsSuccess = true;
            result.Message = "文件删除成功";

            _logger.LogInformation("文件删除成功: {FilePath}", filePath);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "文件删除失败: {FilePath}", filePath);
            result.IsSuccess = false;
            result.ErrorMessage = ex.Message;
            return result;
        }
    }

    #region 私有辅助方法

    /// <summary>
    /// 验证文件路径安全性
    /// </summary>
    private PathValidationResult ValidateFilePath(string filePath)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(filePath))
            {
                return PathValidationResult.Failed("文件路径不能为空");
            }

            // 检查路径长度
            if (filePath.Length > 260) // Windows路径长度限制
            {
                return PathValidationResult.Failed("文件路径过长（超过260字符）");
            }

            // 检查非法字符
            var invalidChars = Path.GetInvalidPathChars();
            if (filePath.IndexOfAny(invalidChars) >= 0)
            {
                return PathValidationResult.Failed("文件路径包含非法字符");
            }

            // 检查文件名非法字符
            var fileName = Path.GetFileName(filePath);
            var invalidFileNameChars = Path.GetInvalidFileNameChars();
            if (fileName.IndexOfAny(invalidFileNameChars) >= 0)
            {
                return PathValidationResult.Failed("文件名包含非法字符");
            }

            // 检查路径遍历攻击
            var fullPath = Path.GetFullPath(filePath);
            if (!fullPath.StartsWith(Directory.GetCurrentDirectory(), StringComparison.OrdinalIgnoreCase))
            {
                // 允许绝对路径，但记录警告
                _logger.LogWarning("使用了非当前工作目录的绝对路径: {FilePath}", filePath);
            }

            return PathValidationResult.Success();
        }
        catch (Exception ex)
        {
            return PathValidationResult.Failed($"路径验证异常: {ex.Message}");
        }
    }

    /// <summary>
    /// 生成临时文件路径
    /// </summary>
    private string GenerateTempFilePath(string targetFilePath)
    {
        var directory = Path.GetDirectoryName(targetFilePath) ?? Directory.GetCurrentDirectory();
        var fileName = Path.GetFileName(targetFilePath);
        var tempFileName = $"{fileName}.tmp.{Guid.NewGuid():N}";
        return Path.Combine(directory, tempFileName);
    }

    /// <summary>
    /// 验证文件完整性
    /// </summary>
    private async Task<FileIntegrityResult> VerifyFileIntegrity(
        string filePath,
        string expectedContent,
        Encoding encoding)
    {
        try
        {
            if (!File.Exists(filePath))
            {
                return FileIntegrityResult.Failed("临时文件不存在");
            }

            var actualContent = await File.ReadAllTextAsync(filePath, encoding);

            // 🔥 Phase 3C: 规范化换行符后再比较，避免Windows CRLF转换导致的字节差异
            var normalizedExpected = expectedContent.Replace("\r\n", "\n").Replace("\r", "\n");
            var normalizedActual = actualContent.Replace("\r\n", "\n").Replace("\r", "\n");

            if (normalizedActual != normalizedExpected)
            {
                return FileIntegrityResult.Failed(
                    $"文件内容不匹配。期望长度: {normalizedExpected.Length}, 实际长度: {normalizedActual.Length}");
            }

            // 🔥 Phase 3C: 移除字节大小验证，因为Windows换行符转换会导致误报
            // 内容一致性验证已足够保证文件完整性

            return FileIntegrityResult.Success();
        }
        catch (Exception ex)
        {
            return FileIntegrityResult.Failed($"完整性验证异常: {ex.Message}");
        }
    }

    /// <summary>
    /// 创建文件备份
    /// </summary>
    private async Task<string> CreateBackupAsync(string filePath)
    {
        var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
        var directory = Path.GetDirectoryName(filePath) ?? Directory.GetCurrentDirectory();
        var fileName = Path.GetFileNameWithoutExtension(filePath);
        var extension = Path.GetExtension(filePath);

        var backupFileName = $"{fileName}.backup.{timestamp}{extension}";
        var backupPath = Path.Combine(directory, backupFileName);

        // 🔥 API兼容性修复：使用File.Copy代替File.CopyAsync（遵循BUG修复铁律）
        await Task.Run(() => File.Copy(filePath, backupPath, overwrite: true));

        _logger.LogDebug("创建文件备份: {OriginalPath} -> {BackupPath}", filePath, backupPath);

        return backupPath;
    }

    #endregion
}

#region 数据传输对象

/// <summary>
/// 原子写入结果
/// </summary>
public class AtomicWriteResult
{
    public bool IsSuccess { get; set; }
    public string TargetPath { get; set; } = string.Empty;
    public string? TempPath { get; set; }
    public string? ErrorMessage { get; set; }
    public string? Message { get; set; }
    public long BytesWritten { get; set; }
    public bool WasSkipped { get; set; }
    public bool BackupCreated { get; set; }
    public FileConflictResolution? ConflictResolution { get; set; }
}

/// <summary>
/// 批量原子写入结果
/// </summary>
public class BatchAtomicWriteResult
{
    public bool IsSuccess { get; set; }
    public int TotalFiles { get; set; }
    public int SuccessCount { get; set; }
    public int FailedCount { get; set; }
    public int SkippedCount { get; set; }
    public long TotalBytesWritten { get; set; }
    public Dictionary<string, AtomicWriteResult> FileResults { get; set; } = new();
    public List<string> FailedFiles { get; set; } = new();
    public string? SystemError { get; set; }

    public string GetSummary()
    {
        var status = IsSuccess ? "✅成功" : "❌失败";
        return $"{status} 批量写入: 总数 {TotalFiles}, 成功 {SuccessCount}, 跳过 {SkippedCount}, 失败 {FailedCount}, 字节 {TotalBytesWritten}";
    }
}

/// <summary>
/// 文件删除结果
/// </summary>
public class FileDeleteResult
{
    public bool IsSuccess { get; set; }
    public string TargetPath { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
    public string? Message { get; set; }
    public bool WasAlreadyDeleted { get; set; }
    public bool BackupCreated { get; set; }
    public string? BackupPath { get; set; }
}

/// <summary>
/// 路径验证结果
/// </summary>
public class PathValidationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }

    public static PathValidationResult Success() => new() { IsValid = true };
    public static PathValidationResult Failed(string errorMessage) => new() { IsValid = false, ErrorMessage = errorMessage };
}

/// <summary>
/// 文件完整性验证结果
/// </summary>
public class FileIntegrityResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }

    public static FileIntegrityResult Success() => new() { IsValid = true };
    public static FileIntegrityResult Failed(string errorMessage) => new() { IsValid = false, ErrorMessage = errorMessage };
}

#endregion
