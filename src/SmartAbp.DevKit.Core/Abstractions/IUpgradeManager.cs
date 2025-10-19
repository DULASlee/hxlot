using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core.Abstractions;

/// <summary>
/// 升级管理器接口（负责管理DevKit框架和生成代码的升级流程）
/// </summary>
public interface IUpgradeManager
{
    /// <summary>
    /// 检查是否需要升级
    /// </summary>
    /// <param name="config">低代码配置</param>
    /// <returns>升级检查结果</returns>
    Task<UpgradeCheckResult> CheckUpgradeAsync(LowCodeConfig config);

    /// <summary>
    /// 执行升级
    /// </summary>
    /// <param name="config">低代码配置</param>
    /// <param name="createBackup">是否创建备份</param>
    /// <returns>升级结果</returns>
    Task<UpgradeResult> PerformUpgradeAsync(LowCodeConfig config, bool createBackup = true);

    /// <summary>
    /// 回滚升级
    /// </summary>
    /// <param name="backupId">备份ID</param>
    /// <returns>回滚结果</returns>
    Task<Result> RollbackUpgradeAsync(Guid backupId);

    /// <summary>
    /// 获取升级历史
    /// </summary>
    /// <param name="moduleName">模块名称</param>
    /// <returns>升级历史记录列表</returns>
    Task<List<UpgradeHistory>> GetUpgradeHistoryAsync(string moduleName);
}
