using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core.Upgrade;

/// <summary>
/// 备份管理器（负责创建备份、恢复备份、管理备份历史）
/// </summary>
public class BackupManager : IBackupManager
{
    private readonly ILogger<BackupManager> _logger;
    private readonly string _backupRootPath;

    public BackupManager(ILogger<BackupManager> logger, string? backupRootPath = null)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _backupRootPath = backupRootPath ?? Path.Combine(".lowcode", "backups");

        // 确保备份目录存在
        Directory.CreateDirectory(_backupRootPath);
    }

    /// <summary>
    /// 创建完整备份（配置文件 + 生成的代码文件）
    /// </summary>
    /// <param name="config">低代码配置</param>
    /// <param name="description">备份描述</param>
    /// <returns>备份信息</returns>
    public async Task<Backup> CreateBackupAsync(LowCodeConfig config, string? description = null)
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var backupId = Guid.NewGuid();
        var backupDir = Path.Combine(_backupRootPath, timestamp);

        try
        {
            _logger.LogInformation(
                "Creating backup for module: {ModuleName}, BackupId: {BackupId}",
                config.ModuleName,
                backupId);

            // 创建备份目录
            Directory.CreateDirectory(backupDir);

            var backup = new Backup
            {
                BackupId = backupId,
                Timestamp = timestamp,
                Path = backupDir,
                Description = description ?? $"Backup for {config.ModuleName} at {DateTime.UtcNow}"
            };

            var backedUpFiles = new List<string>();

            // 步骤1: 备份配置文件
            var configBackupCount = await BackupConfigFilesAsync(config, backupDir);
            backedUpFiles.Add($"Config files: {configBackupCount}");

            // 步骤2: 备份生成的代码文件
            var codeBackupCount = await BackupGeneratedFilesAsync(config, backupDir);
            backedUpFiles.Add($"Generated code files: {codeBackupCount}");

            // 步骤3: 保存备份元数据
            await SaveBackupMetadataAsync(backup, config, backupDir);

            // 步骤4: 创建压缩包（可选，节省空间）
            var zipPath = await CreateZipArchiveAsync(backupDir);
            if (!string.IsNullOrEmpty(zipPath))
            {
                backedUpFiles.Add($"Zip archive: {Path.GetFileName(zipPath)}");

                // 删除原始目录，只保留压缩包
                Directory.Delete(backupDir, recursive: true);
                backup.Path = zipPath;
            }

            // 计算备份大小
            backup.SizeBytes = CalculateBackupSize(backup.Path);
            backup.FileCount = configBackupCount + codeBackupCount;

            _logger.LogInformation(
                "Backup created successfully. Size: {SizeMB:F2}MB, Files: {FileCount}",
                backup.SizeBytes / 1024.0 / 1024.0,
                backup.FileCount);

            return backup;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create backup for module: {ModuleName}", config.ModuleName);

            // 清理失败的备份
            if (Directory.Exists(backupDir))
            {
                try
                {
                    Directory.Delete(backupDir, recursive: true);
                }
                catch
                {
                    // 忽略清理错误
                }
            }

            throw;
        }
    }

    /// <summary>
    /// 恢复备份
    /// </summary>
    /// <param name="backup">备份信息</param>
    /// <returns>恢复结果</returns>
    public async Task<Result> RestoreBackupAsync(Backup backup)
    {
        try
        {
            _logger.LogInformation(
                "Restoring backup: {BackupId}, Timestamp: {Timestamp}",
                backup.BackupId,
                backup.Timestamp);

            // 检查备份是否存在
            if (!File.Exists(backup.Path) && !Directory.Exists(backup.Path))
            {
                return Result.Failure($"Backup not found: {backup.Path}");
            }

            string restoreDir;

            // 如果是压缩包，先解压
            if (backup.Path.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
            {
                restoreDir = Path.Combine(Path.GetTempPath(), $"restore_{backup.BackupId}");
                Directory.CreateDirectory(restoreDir);

                _logger.LogDebug("Extracting backup archive to: {Path}", restoreDir);
                ZipFile.ExtractToDirectory(backup.Path, restoreDir, overwriteFiles: true);
            }
            else
            {
                restoreDir = backup.Path;
            }

            // 读取备份元数据
            var metadata = await LoadBackupMetadataAsync(restoreDir);
            if (metadata == null)
            {
                return Result.Failure("Backup metadata not found");
            }

            // 步骤1: 恢复配置文件
            await RestoreConfigFilesAsync(restoreDir, metadata);

            // 步骤2: 恢复生成的代码文件
            await RestoreGeneratedFilesAsync(restoreDir, metadata);

            // 清理临时目录
            if (restoreDir != backup.Path && Directory.Exists(restoreDir))
            {
                Directory.Delete(restoreDir, recursive: true);
            }

            _logger.LogInformation("Backup restored successfully");
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to restore backup: {BackupId}", backup.BackupId);
            return Result.Failure($"Restore failed: {ex.Message}");
        }
    }

    /// <summary>
    /// 删除备份
    /// </summary>
    /// <param name="backup">备份信息</param>
    public async Task DeleteBackupAsync(Backup backup)
    {
        try
        {
            _logger.LogInformation("Deleting backup: {BackupId}", backup.BackupId);

            if (File.Exists(backup.Path))
            {
                File.Delete(backup.Path);
            }
            else if (Directory.Exists(backup.Path))
            {
                Directory.Delete(backup.Path, recursive: true);
            }

            _logger.LogInformation("Backup deleted successfully");
            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete backup: {BackupId}", backup.BackupId);
            throw;
        }
    }

    /// <summary>
    /// 列出所有备份
    /// </summary>
    /// <returns>备份列表</returns>
    public async Task<List<Backup>> ListBackupsAsync()
    {
        var backups = new List<Backup>();

        try
        {
            if (!Directory.Exists(_backupRootPath))
            {
                return backups;
            }

            // 查找所有备份目录和压缩包
            var backupDirs = Directory.GetDirectories(_backupRootPath);
            var backupZips = Directory.GetFiles(_backupRootPath, "*.zip");

            foreach (var dir in backupDirs)
            {
                var metadata = await LoadBackupMetadataAsync(dir);
                if (metadata != null)
                {
                    backups.Add(metadata);
                }
            }

            foreach (var zip in backupZips)
            {
                // 从压缩包中读取元数据
                var metadata = await LoadBackupMetadataFromZipAsync(zip);
                if (metadata != null)
                {
                    backups.Add(metadata);
                }
            }

            // 按时间戳降序排序（最新的在前）
            backups = backups.OrderByDescending(b => b.Timestamp).ToList();

            _logger.LogDebug("Found {Count} backups", backups.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list backups");
        }

        return backups;
    }

    /// <summary>
    /// 清理旧备份（保留最近N个备份）
    /// </summary>
    /// <param name="keepCount">保留的备份数量</param>
    /// <returns>删除的备份数量</returns>
    public async Task<int> CleanupOldBackupsAsync(int keepCount = 10)
    {
        var allBackups = await ListBackupsAsync();
        var backupsToDelete = allBackups.Skip(keepCount).ToList();

        foreach (var backup in backupsToDelete)
        {
            await DeleteBackupAsync(backup);
        }

        _logger.LogInformation(
            "Cleaned up {Count} old backups, kept {KeepCount} recent backups",
            backupsToDelete.Count,
            keepCount);

        return backupsToDelete.Count;
    }

    #region Private Methods

    /// <summary>
    /// 备份配置文件
    /// </summary>
    private async Task<int> BackupConfigFilesAsync(LowCodeConfig config, string backupDir)
    {
        var configDir = Path.Combine(backupDir, "configs");
        Directory.CreateDirectory(configDir);

        var count = 0;

        // 备份主配置文件
        var configPath = Path.Combine(".lowcode", "configs", $"{config.ModuleName}-config.json");
        if (File.Exists(configPath))
        {
            var destPath = Path.Combine(configDir, Path.GetFileName(configPath));
            File.Copy(configPath, destPath, overwrite: true);
            count++;
        }

        // 备份其他相关配置文件（如果有）
        var configsDir = Path.Combine(".lowcode", "configs");
        if (Directory.Exists(configsDir))
        {
            foreach (var file in Directory.GetFiles(configsDir, $"{config.ModuleName}*.json"))
            {
                var destPath = Path.Combine(configDir, Path.GetFileName(file));
                if (!File.Exists(destPath))  // 避免重复备份
                {
                    File.Copy(file, destPath, overwrite: true);
                    count++;
                }
            }
        }

        _logger.LogDebug("Backed up {Count} config files", count);
        await Task.CompletedTask;
        return count;
    }

    /// <summary>
    /// 备份生成的代码文件
    /// </summary>
    private async Task<int> BackupGeneratedFilesAsync(LowCodeConfig config, string backupDir)
    {
        var codeDir = Path.Combine(backupDir, "code");
        Directory.CreateDirectory(codeDir);

        var count = 0;

        // 备份后端代码（假设在src/目录下）
        var backendPaths = new[]
        {
            Path.Combine("src", "SmartAbp.Application", config.ModuleName),
            Path.Combine("src", "SmartAbp.HttpApi", config.ModuleName),
            Path.Combine("src", "SmartAbp.Domain", config.ModuleName)
        };

        foreach (var path in backendPaths)
        {
            if (Directory.Exists(path))
            {
                var destPath = Path.Combine(codeDir, "backend", Path.GetFileName(path));
                CopyDirectory(path, destPath);
                count += Directory.GetFiles(destPath, "*", SearchOption.AllDirectories).Length;
            }
        }

        // 备份前端代码（假设在src/SmartAbp.Vue/src/views/目录下）
        var frontendPath = Path.Combine("src", "SmartAbp.Vue", "src", "views", config.ModuleName.ToLower());
        if (Directory.Exists(frontendPath))
        {
            var destPath = Path.Combine(codeDir, "frontend", config.ModuleName.ToLower());
            CopyDirectory(frontendPath, destPath);
            count += Directory.GetFiles(destPath, "*", SearchOption.AllDirectories).Length;
        }

        _logger.LogDebug("Backed up {Count} code files", count);
        await Task.CompletedTask;
        return count;
    }

    /// <summary>
    /// 保存备份元数据
    /// </summary>
    private async Task SaveBackupMetadataAsync(Backup backup, LowCodeConfig config, string backupDir)
    {
        var metadata = new BackupMetadata
        {
            BackupId = backup.BackupId,
            Timestamp = backup.Timestamp,
            ModuleName = config.ModuleName,
            CurrentLayer = config.CurrentLayer,
            Description = backup.Description ?? string.Empty,
            FileCount = backup.FileCount,
            SizeBytes = backup.SizeBytes,
            CreatedAt = DateTime.UtcNow
        };

        var metadataPath = Path.Combine(backupDir, "backup-metadata.json");
        var json = JsonSerializer.Serialize(metadata, new JsonSerializerOptions { WriteIndented = true });
        await File.WriteAllTextAsync(metadataPath, json);

        _logger.LogDebug("Saved backup metadata to: {Path}", metadataPath);
    }

    /// <summary>
    /// 加载备份元数据
    /// </summary>
    private async Task<Backup?> LoadBackupMetadataAsync(string backupDir)
    {
        var metadataPath = Path.Combine(backupDir, "backup-metadata.json");
        if (!File.Exists(metadataPath))
        {
            return null;
        }

        try
        {
            var json = await File.ReadAllTextAsync(metadataPath);
            var metadata = JsonSerializer.Deserialize<BackupMetadata>(json);

            if (metadata == null)
            {
                return null;
            }

            return new Backup
            {
                BackupId = metadata.BackupId,
                Timestamp = metadata.Timestamp,
                Path = backupDir,
                FileCount = metadata.FileCount,
                SizeBytes = metadata.SizeBytes,
                Description = metadata.Description
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load backup metadata from: {Path}", metadataPath);
            return null;
        }
    }

    /// <summary>
    /// 从压缩包加载备份元数据
    /// </summary>
    private async Task<Backup?> LoadBackupMetadataFromZipAsync(string zipPath)
    {
        try
        {
            using var archive = ZipFile.OpenRead(zipPath);
            var metadataEntry = archive.GetEntry("backup-metadata.json");

            if (metadataEntry == null)
            {
                return null;
            }

            using var stream = metadataEntry.Open();
            using var reader = new StreamReader(stream);
            var json = await reader.ReadToEndAsync();
            var metadata = JsonSerializer.Deserialize<BackupMetadata>(json);

            if (metadata == null)
            {
                return null;
            }

            return new Backup
            {
                BackupId = metadata.BackupId,
                Timestamp = metadata.Timestamp,
                Path = zipPath,
                FileCount = metadata.FileCount,
                SizeBytes = new FileInfo(zipPath).Length,
                Description = metadata.Description
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load backup metadata from zip: {Path}", zipPath);
            return null;
        }
    }

    /// <summary>
    /// 恢复配置文件
    /// </summary>
    private async Task RestoreConfigFilesAsync(string backupDir, Backup metadata)
    {
        var configDir = Path.Combine(backupDir, "configs");
        if (!Directory.Exists(configDir))
        {
            _logger.LogWarning("Config directory not found in backup");
            return;
        }

        var destDir = Path.Combine(".lowcode", "configs");
        Directory.CreateDirectory(destDir);

        foreach (var file in Directory.GetFiles(configDir))
        {
            var destPath = Path.Combine(destDir, Path.GetFileName(file));
            File.Copy(file, destPath, overwrite: true);
            _logger.LogDebug("Restored config file: {File}", Path.GetFileName(file));
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// 恢复生成的代码文件
    /// </summary>
    private async Task RestoreGeneratedFilesAsync(string backupDir, Backup metadata)
    {
        var codeDir = Path.Combine(backupDir, "code");
        if (!Directory.Exists(codeDir))
        {
            _logger.LogWarning("Code directory not found in backup");
            return;
        }

        // 恢复后端代码
        var backendDir = Path.Combine(codeDir, "backend");
        if (Directory.Exists(backendDir))
        {
            foreach (var moduleDir in Directory.GetDirectories(backendDir))
            {
                var moduleName = Path.GetFileName(moduleDir);
                var destPath = Path.Combine("src", "SmartAbp.Application", moduleName);

                if (Directory.Exists(destPath))
                {
                    Directory.Delete(destPath, recursive: true);
                }

                CopyDirectory(moduleDir, destPath);
                _logger.LogDebug("Restored backend module: {Module}", moduleName);
            }
        }

        // 恢复前端代码
        var frontendDir = Path.Combine(codeDir, "frontend");
        if (Directory.Exists(frontendDir))
        {
            foreach (var moduleDir in Directory.GetDirectories(frontendDir))
            {
                var moduleName = Path.GetFileName(moduleDir);
                var destPath = Path.Combine("src", "SmartAbp.Vue", "src", "views", moduleName);

                if (Directory.Exists(destPath))
                {
                    Directory.Delete(destPath, recursive: true);
                }

                CopyDirectory(moduleDir, destPath);
                _logger.LogDebug("Restored frontend module: {Module}", moduleName);
            }
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// 创建压缩包
    /// </summary>
    private async Task<string> CreateZipArchiveAsync(string sourceDir)
    {
        var zipPath = $"{sourceDir}.zip";

        try
        {
            ZipFile.CreateFromDirectory(sourceDir, zipPath, CompressionLevel.Optimal, includeBaseDirectory: false);
            _logger.LogDebug("Created zip archive: {Path}", zipPath);
            return zipPath;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to create zip archive");
            return string.Empty;
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// 计算备份大小
    /// </summary>
    private long CalculateBackupSize(string path)
    {
        if (File.Exists(path))
        {
            return new FileInfo(path).Length;
        }

        if (Directory.Exists(path))
        {
            return Directory.GetFiles(path, "*", SearchOption.AllDirectories)
                .Sum(f => new FileInfo(f).Length);
        }

        return 0;
    }

    /// <summary>
    /// 递归复制目录
    /// </summary>
    private void CopyDirectory(string sourceDir, string destDir)
    {
        Directory.CreateDirectory(destDir);

        // 复制文件
        foreach (var file in Directory.GetFiles(sourceDir))
        {
            var destFile = Path.Combine(destDir, Path.GetFileName(file));
            File.Copy(file, destFile, overwrite: true);
        }

        // 递归复制子目录
        foreach (var subDir in Directory.GetDirectories(sourceDir))
        {
            var destSubDir = Path.Combine(destDir, Path.GetFileName(subDir));
            CopyDirectory(subDir, destSubDir);
        }
    }

    #endregion
}

/// <summary>
/// IBackupManager接口
/// </summary>
public interface IBackupManager
{
    /// <summary>
    /// 创建备份
    /// </summary>
    Task<Backup> CreateBackupAsync(LowCodeConfig config, string? description = null);

    /// <summary>
    /// 恢复备份
    /// </summary>
    Task<Result> RestoreBackupAsync(Backup backup);

    /// <summary>
    /// 删除备份
    /// </summary>
    Task DeleteBackupAsync(Backup backup);

    /// <summary>
    /// 列出所有备份
    /// </summary>
    Task<List<Backup>> ListBackupsAsync();

    /// <summary>
    /// 清理旧备份
    /// </summary>
    Task<int> CleanupOldBackupsAsync(int keepCount = 10);
}

/// <summary>
/// 备份元数据（用于序列化）
/// </summary>
internal class BackupMetadata
{
    public Guid BackupId { get; set; }
    public string Timestamp { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public TargetLayer CurrentLayer { get; set; }
    public string Description { get; set; } = string.Empty;
    public int FileCount { get; set; }
    public long SizeBytes { get; set; }
    public DateTime CreatedAt { get; set; }
}

