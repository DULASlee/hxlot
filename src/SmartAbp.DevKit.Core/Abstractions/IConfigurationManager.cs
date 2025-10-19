using System.Threading.Tasks;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core.Abstractions;

/// <summary>
/// 配置管理器接口（负责加载、保存、验证和迁移配置）
/// </summary>
public interface IConfigurationManager
{
    /// <summary>
    /// 加载配置
    /// </summary>
    /// <param name="configPath">配置文件路径</param>
    /// <returns>配置对象</returns>
    Task<LowCodeConfig> LoadAsync(string configPath);

    /// <summary>
    /// 保存配置
    /// </summary>
    /// <param name="config">配置对象</param>
    /// <param name="configPath">配置文件路径</param>
    Task SaveAsync(LowCodeConfig config, string configPath);

    /// <summary>
    /// 验证配置
    /// </summary>
    /// <param name="config">配置对象</param>
    /// <returns>验证结果</returns>
    ValidationResult Validate(LowCodeConfig config);

    /// <summary>
    /// 自动迁移配置（从旧版本升级到新版本）
    /// </summary>
    /// <param name="config">配置对象</param>
    /// <returns>迁移后的配置</returns>
    Task<LowCodeConfig> MigrateAsync(LowCodeConfig config);

    /// <summary>
    /// 合并配置（用于升级时扩展配置）
    /// </summary>
    /// <param name="baseConfig">基础配置</param>
    /// <param name="extensionConfig">扩展配置</param>
    /// <returns>合并后的配置</returns>
    LowCodeConfig Merge(LowCodeConfig baseConfig, LowCodeConfig extensionConfig);
}

