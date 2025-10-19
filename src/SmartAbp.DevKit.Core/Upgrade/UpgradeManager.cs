using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core.Upgrade;

/// <summary>
/// 升级管理器（负责管理DevKit框架和生成代码的升级流程）
/// </summary>
public class UpgradeManager : IUpgradeManager
{
    private readonly ILogger<UpgradeManager> _logger;
    private readonly IBackupManager _backupManager;
    private readonly ICodeGenerator _codeGenerator;
    private readonly string _upgradeHistoryPath;

    public UpgradeManager(
        ILogger<UpgradeManager> logger,
        IBackupManager backupManager,
        ICodeGenerator codeGenerator,
        string? upgradeHistoryPath = null)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _backupManager = backupManager ?? throw new ArgumentNullException(nameof(backupManager));
        _codeGenerator = codeGenerator ?? throw new ArgumentNullException(nameof(codeGenerator));
        _upgradeHistoryPath = upgradeHistoryPath ?? Path.Combine(".lowcode", "upgrades");

        // 确保升级历史目录存在
        Directory.CreateDirectory(_upgradeHistoryPath);
    }

    /// <summary>
    /// 检查是否需要升级
    /// </summary>
    /// <param name="config">低代码配置</param>
    /// <returns>升级检查结果</returns>
    public async Task<UpgradeCheckResult> CheckUpgradeAsync(LowCodeConfig config)
    {
        try
        {
            _logger.LogInformation("Checking upgrade for module: {ModuleName}", config.ModuleName);

            var result = new UpgradeCheckResult
            {
                ModuleName = config.ModuleName,
                NeedsUpgrade = false,
                Changes = new List<UpgradeChange>()
            };

            // 步骤1: 读取当前配置的版本历史
            var history = await LoadUpgradeHistoryAsync(config.ModuleName);

            // 步骤2: 检测配置变更
            var configChanges = await DetectConfigChangesAsync(config, history);
            result.Changes.AddRange(configChanges);

            // 步骤3: 检测模板变更
            var templateChanges = await DetectTemplateChangesAsync(config, history);
            result.Changes.AddRange(templateChanges);

            // 步骤4: 检测结构变更
            var structureChanges = await DetectStructureChangesAsync(config, history);
            result.Changes.AddRange(structureChanges);

            // 判断是否需要升级
            result.NeedsUpgrade = result.Changes.Count > 0;

            // 计算升级风险等级
            result.RiskLevel = CalculateRiskLevel(result.Changes);

            _logger.LogInformation(
                "Upgrade check completed. NeedsUpgrade: {NeedsUpgrade}, Changes: {ChangeCount}, RiskLevel: {RiskLevel}",
                result.NeedsUpgrade,
                result.Changes.Count,
                result.RiskLevel);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check upgrade for module: {ModuleName}", config.ModuleName);
            throw;
        }
    }

    /// <summary>
    /// 执行升级
    /// </summary>
    /// <param name="config">低代码配置</param>
    /// <param name="createBackup">是否创建备份</param>
    /// <returns>升级结果</returns>
    public async Task<UpgradeResult> PerformUpgradeAsync(LowCodeConfig config, bool createBackup = true)
    {
        var upgradeId = Guid.NewGuid();
        var startTime = DateTime.UtcNow;
        Backup? backup = null;

        try
        {
            _logger.LogInformation(
                "Starting upgrade for module: {ModuleName}, UpgradeId: {UpgradeId}, CreateBackup: {CreateBackup}",
                config.ModuleName,
                upgradeId,
                createBackup);

            var result = new UpgradeResult
            {
                UpgradeId = upgradeId,
                ModuleName = config.ModuleName,
                IsSuccess = false,
                StartTime = startTime
            };

            // 步骤1: 检查是否需要升级
            var checkResult = await CheckUpgradeAsync(config);
            if (!checkResult.NeedsUpgrade)
            {
                _logger.LogInformation("No upgrade needed for module: {ModuleName}", config.ModuleName);
                result.IsSuccess = true;
                result.Message = "No upgrade needed";
                result.EndTime = DateTime.UtcNow;
                return result;
            }

            result.UpgradeSteps = checkResult.Changes.Select(c => new UpgradeStep
            {
                StepName = c.ChangeDescription,
                Status = UpgradeStepStatus.Pending
            }).ToList();

            // 步骤2: 创建备份
            if (createBackup)
            {
                _logger.LogInformation("Creating backup before upgrade...");
                backup = await _backupManager.CreateBackupAsync(
                    config,
                    $"Pre-upgrade backup for {config.ModuleName}");

                result.BackupId = backup.BackupId;
                _logger.LogInformation("Backup created successfully: {BackupId}", backup.BackupId);
            }

            // 步骤3: 执行升级操作
            await ExecuteUpgradeStepsAsync(config, checkResult.Changes, result);

            // 步骤4: 保存升级历史
            await SaveUpgradeHistoryAsync(config, upgradeId, checkResult.Changes);

            result.IsSuccess = true;
            result.Message = "Upgrade completed successfully";
            result.EndTime = DateTime.UtcNow;

            _logger.LogInformation(
                "Upgrade completed successfully. Module: {ModuleName}, UpgradeId: {UpgradeId}, Duration: {Duration}ms",
                config.ModuleName,
                upgradeId,
                (result.EndTime - result.StartTime).TotalMilliseconds);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Upgrade failed for module: {ModuleName}, UpgradeId: {UpgradeId}", config.ModuleName, upgradeId);

            // 尝试回滚到备份
            if (backup != null)
            {
                _logger.LogWarning("Attempting to restore backup: {BackupId}", backup.BackupId);
                var rollbackResult = await _backupManager.RestoreBackupAsync(backup);

                if (rollbackResult.IsSuccess)
                {
                    _logger.LogInformation("Backup restored successfully after upgrade failure");
                }
                else
                {
                    _logger.LogError("Failed to restore backup: {Error}", rollbackResult.ErrorMessage);
                }
            }

            return new UpgradeResult
            {
                UpgradeId = upgradeId,
                ModuleName = config.ModuleName,
                IsSuccess = false,
                Message = $"Upgrade failed: {ex.Message}",
                ErrorDetails = ex.ToString(),
                BackupId = backup?.BackupId,
                StartTime = startTime,
                EndTime = DateTime.UtcNow
            };
        }
    }

    /// <summary>
    /// 回滚升级
    /// </summary>
    /// <param name="backupId">备份ID</param>
    /// <returns>回滚结果</returns>
    public async Task<Result> RollbackUpgradeAsync(Guid backupId)
    {
        try
        {
            _logger.LogInformation("Rolling back to backup: {BackupId}", backupId);

            // 查找备份
            var allBackups = await _backupManager.ListBackupsAsync();
            var backup = allBackups.FirstOrDefault(b => b.BackupId == backupId);

            if (backup == null)
            {
                return Result.Failure($"Backup not found: {backupId}");
            }

            // 恢复备份
            var result = await _backupManager.RestoreBackupAsync(backup);

            if (result.IsSuccess)
            {
                _logger.LogInformation("Rollback completed successfully");
            }
            else
            {
                _logger.LogError("Rollback failed: {Error}", result.ErrorMessage);
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to rollback to backup: {BackupId}", backupId);
            return Result.Failure("Rollback failed", ex);
        }
    }

    /// <summary>
    /// 获取升级历史
    /// </summary>
    /// <param name="moduleName">模块名称</param>
    /// <returns>升级历史记录列表</returns>
    public async Task<List<UpgradeHistory>> GetUpgradeHistoryAsync(string moduleName)
    {
        var history = await LoadUpgradeHistoryAsync(moduleName);
        return history;
    }

    #region Private Methods

    /// <summary>
    /// 检测配置变更
    /// </summary>
    private async Task<List<UpgradeChange>> DetectConfigChangesAsync(LowCodeConfig config, List<UpgradeHistory> history)
    {
        var changes = new List<UpgradeChange>();

        // 如果没有历史记录，说明是首次生成，不需要升级
        if (history.Count == 0)
        {
            return changes;
        }

        // 获取最后一次升级的配置快照
        var lastHistory = history.OrderByDescending(h => h.UpgradeTime).FirstOrDefault();
        if (lastHistory?.ConfigSnapshot == null)
        {
            return changes;
        }

        // 比较实体数量变化
        var oldEntityCount = lastHistory.ConfigSnapshot.Entities.Count;
        var newEntityCount = config.Entities.Count;

        if (oldEntityCount != newEntityCount)
        {
            changes.Add(new UpgradeChange
            {
                ChangeType = UpgradeChangeType.EntityCountChanged,
                ChangeDescription = $"Entity count changed from {oldEntityCount} to {newEntityCount}",
                Severity = UpgradeSeverity.Medium
            });
        }

        // 比较每个实体的变化
        foreach (var entity in config.Entities)
        {
            var oldEntity = lastHistory.ConfigSnapshot.Entities.FirstOrDefault(e => e.EntityName == entity.EntityName);

            if (oldEntity == null)
            {
                // 新增实体
                changes.Add(new UpgradeChange
                {
                    ChangeType = UpgradeChangeType.EntityAdded,
                    ChangeDescription = $"Entity added: {entity.EntityName}",
                    Severity = UpgradeSeverity.High,
                    AffectedEntity = entity.EntityName
                });
            }
            else
            {
                // 检测属性变化
                var propertyChanges = DetectPropertyChanges(oldEntity, entity);
                changes.AddRange(propertyChanges);
            }
        }

        // 检测删除的实体
        foreach (var oldEntity in lastHistory.ConfigSnapshot.Entities)
        {
            if (!config.Entities.Any(e => e.EntityName == oldEntity.EntityName))
            {
                changes.Add(new UpgradeChange
                {
                    ChangeType = UpgradeChangeType.EntityRemoved,
                    ChangeDescription = $"Entity removed: {oldEntity.EntityName}",
                    Severity = UpgradeSeverity.Critical,
                    AffectedEntity = oldEntity.EntityName
                });
            }
        }

        await Task.CompletedTask;
        return changes;
    }

    /// <summary>
    /// 检测属性变化
    /// </summary>
    private List<UpgradeChange> DetectPropertyChanges(EntityDefinition oldEntity, EntityDefinition newEntity)
    {
        var changes = new List<UpgradeChange>();

        // 检测新增属性
        foreach (var prop in newEntity.Properties)
        {
            if (!oldEntity.Properties.Any(p => p.Name == prop.Name))
            {
                changes.Add(new UpgradeChange
                {
                    ChangeType = UpgradeChangeType.PropertyAdded,
                    ChangeDescription = $"Property added: {newEntity.EntityName}.{prop.Name}",
                    Severity = UpgradeSeverity.Medium,
                    AffectedEntity = newEntity.EntityName
                });
            }
        }

        // 检测删除的属性
        foreach (var oldProp in oldEntity.Properties)
        {
            if (!newEntity.Properties.Any(p => p.Name == oldProp.Name))
            {
                changes.Add(new UpgradeChange
                {
                    ChangeType = UpgradeChangeType.PropertyRemoved,
                    ChangeDescription = $"Property removed: {newEntity.EntityName}.{oldProp.Name}",
                    Severity = UpgradeSeverity.High,
                    AffectedEntity = newEntity.EntityName
                });
            }
        }

        // 检测属性类型变化
        foreach (var prop in newEntity.Properties)
        {
            var oldProp = oldEntity.Properties.FirstOrDefault(p => p.Name == prop.Name);
            if (oldProp != null && oldProp.Type != prop.Type)
            {
                changes.Add(new UpgradeChange
                {
                    ChangeType = UpgradeChangeType.PropertyTypeChanged,
                    ChangeDescription = $"Property type changed: {newEntity.EntityName}.{prop.Name} from {oldProp.Type} to {prop.Type}",
                    Severity = UpgradeSeverity.Critical,
                    AffectedEntity = newEntity.EntityName
                });
            }
        }

        return changes;
    }

    /// <summary>
    /// 检测模板变更
    /// </summary>
    private async Task<List<UpgradeChange>> DetectTemplateChangesAsync(LowCodeConfig config, List<UpgradeHistory> history)
    {
        var changes = new List<UpgradeChange>();

        // 检测模板文件的修改时间
        var templatePaths = new[]
        {
            config.TemplateConfig.BackendTemplatePath,
            config.TemplateConfig.FrontendTemplatePath
        };

        foreach (var templatePath in templatePaths)
        {
            if (Directory.Exists(templatePath))
            {
                var templateFiles = Directory.GetFiles(templatePath, "*", SearchOption.AllDirectories);
                foreach (var file in templateFiles)
                {
                    var fileInfo = new FileInfo(file);

                    // 如果模板文件在最后一次升级之后被修改过
                    var lastUpgradeTime = history.OrderByDescending(h => h.UpgradeTime).FirstOrDefault()?.UpgradeTime ?? DateTime.MinValue;
                    if (fileInfo.LastWriteTimeUtc > lastUpgradeTime)
                    {
                        changes.Add(new UpgradeChange
                        {
                            ChangeType = UpgradeChangeType.TemplateUpdated,
                            ChangeDescription = $"Template file updated: {Path.GetRelativePath(templatePath, file)}",
                            Severity = UpgradeSeverity.Medium
                        });
                    }
                }
            }
        }

        await Task.CompletedTask;
        return changes;
    }

    /// <summary>
    /// 检测结构变更
    /// </summary>
    private async Task<List<UpgradeChange>> DetectStructureChangesAsync(LowCodeConfig config, List<UpgradeHistory> history)
    {
        var changes = new List<UpgradeChange>();

        // 检测目标层级变化
        var lastHistory = history.OrderByDescending(h => h.UpgradeTime).FirstOrDefault();
        if (lastHistory?.ConfigSnapshot != null)
        {
            if (lastHistory.ConfigSnapshot.CurrentLayer != config.CurrentLayer)
            {
                changes.Add(new UpgradeChange
                {
                    ChangeType = UpgradeChangeType.LayerChanged,
                    ChangeDescription = $"Target layer changed from {lastHistory.ConfigSnapshot.CurrentLayer} to {config.CurrentLayer}",
                    Severity = UpgradeSeverity.High
                });
            }
        }

        await Task.CompletedTask;
        return changes;
    }

    /// <summary>
    /// 执行升级步骤
    /// </summary>
    private async Task ExecuteUpgradeStepsAsync(LowCodeConfig config, List<UpgradeChange> changes, UpgradeResult result)
    {
        foreach (var change in changes)
        {
            var step = result.UpgradeSteps.FirstOrDefault(s => s.StepName == change.ChangeDescription);
            if (step != null)
            {
                step.Status = UpgradeStepStatus.Running;
            }

            try
            {
                _logger.LogInformation("Executing upgrade step: {ChangeDescription}", change.ChangeDescription);

                // 根据变更类型执行相应的升级操作
                switch (change.ChangeType)
                {
                    case UpgradeChangeType.EntityAdded:
                    case UpgradeChangeType.PropertyAdded:
                    case UpgradeChangeType.PropertyTypeChanged:
                        // 重新生成代码
                        await RegenerateCodeAsync(config, change);
                        break;

                    case UpgradeChangeType.TemplateUpdated:
                        // 使用新模板重新生成
                        await RegenerateCodeAsync(config, change);
                        break;

                    case UpgradeChangeType.LayerChanged:
                        // 生成新层级的代码
                        await RegenerateCodeAsync(config, change);
                        break;

                    default:
                        _logger.LogWarning("Unsupported upgrade change type: {ChangeType}", change.ChangeType);
                        break;
                }

                if (step != null)
                {
                    step.Status = UpgradeStepStatus.Completed;
                    step.Message = "Step completed successfully";
                }

                _logger.LogInformation("Upgrade step completed: {ChangeDescription}", change.ChangeDescription);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Upgrade step failed: {ChangeDescription}", change.ChangeDescription);

                if (step != null)
                {
                    step.Status = UpgradeStepStatus.Failed;
                    step.Message = $"Step failed: {ex.Message}";
                }

                throw;
            }
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// 重新生成代码
    /// </summary>
    private async Task RegenerateCodeAsync(LowCodeConfig config, UpgradeChange change)
    {
        _logger.LogInformation("Regenerating code for change: {ChangeDescription}", change.ChangeDescription);

        // 创建生成上下文
        var context = new GenerationContext
        {
            Config = config,
            TargetLayer = config.CurrentLayer,
            GenerationMode = GenerationMode.Upgrade,
            Metadata = new Dictionary<string, object>
            {
                { "UpgradeChange", change }
            }
        };

        // 执行代码生成
        var result = await _codeGenerator.GenerateAsync(context);

        if (!result.IsSuccess)
        {
            throw new InvalidOperationException($"Code generation failed: {result.ErrorMessage}");
        }

        _logger.LogInformation("Code regenerated successfully for change: {ChangeDescription}", change.ChangeDescription);
    }

    /// <summary>
    /// 加载升级历史
    /// </summary>
    private async Task<List<UpgradeHistory>> LoadUpgradeHistoryAsync(string moduleName)
    {
        var historyFile = Path.Combine(_upgradeHistoryPath, $"{moduleName}-history.json");

        if (!File.Exists(historyFile))
        {
            return new List<UpgradeHistory>();
        }

        try
        {
            var json = await File.ReadAllTextAsync(historyFile);
            var history = JsonSerializer.Deserialize<List<UpgradeHistory>>(json);
            return history ?? new List<UpgradeHistory>();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load upgrade history for module: {ModuleName}", moduleName);
            return new List<UpgradeHistory>();
        }
    }

    /// <summary>
    /// 保存升级历史
    /// </summary>
    private async Task SaveUpgradeHistoryAsync(LowCodeConfig config, Guid upgradeId, List<UpgradeChange> changes)
    {
        var history = await LoadUpgradeHistoryAsync(config.ModuleName);

        var newRecord = new UpgradeHistory
        {
            UpgradeId = upgradeId,
            ModuleName = config.ModuleName,
            UpgradeTime = DateTime.UtcNow,
            Changes = changes,
            ConfigSnapshot = config
        };

        history.Add(newRecord);

        var historyFile = Path.Combine(_upgradeHistoryPath, $"{config.ModuleName}-history.json");
        var json = JsonSerializer.Serialize(history, new JsonSerializerOptions { WriteIndented = true });
        await File.WriteAllTextAsync(historyFile, json);

        _logger.LogDebug("Saved upgrade history for module: {ModuleName}", config.ModuleName);
    }

    /// <summary>
    /// 计算升级风险等级
    /// </summary>
    private UpgradeRiskLevel CalculateRiskLevel(List<UpgradeChange> changes)
    {
        if (!changes.Any())
        {
            return UpgradeRiskLevel.None;
        }

        var hasCritical = changes.Any(c => c.Severity == UpgradeSeverity.Critical);
        if (hasCritical)
        {
            return UpgradeRiskLevel.High;
        }

        var hasHigh = changes.Any(c => c.Severity == UpgradeSeverity.High);
        if (hasHigh || changes.Count >= 5)
        {
            return UpgradeRiskLevel.Medium;
        }

        return UpgradeRiskLevel.Low;
    }

    #endregion
}

