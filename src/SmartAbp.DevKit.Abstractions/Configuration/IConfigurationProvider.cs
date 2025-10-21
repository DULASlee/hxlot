namespace SmartAbp.DevKit.Abstractions.Configuration;

/// <summary>
/// 配置提供者接口，用于获取DevKit配置信息
/// </summary>
public interface IConfigurationProvider
{
    /// <summary>
    /// 获取DevKit配置
    /// </summary>
    /// <returns>配置信息</returns>
    Task<DevKitConfiguration> GetConfigurationAsync();
}

/// <summary>
/// DevKit配置信息
/// </summary>
public class DevKitConfiguration
{
    public string NamespacePrefix { get; set; } = string.Empty;
    public string DomainOutputPath { get; set; } = string.Empty;
    public string ApplicationOutputPath { get; set; } = string.Empty;
    public string FrontendOutputPath { get; set; } = string.Empty;
    public Dictionary<string, string> CustomSettings { get; set; } = new();
}
