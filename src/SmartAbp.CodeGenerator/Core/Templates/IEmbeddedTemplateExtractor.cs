using System.Threading.Tasks;

namespace SmartAbp.CodeGenerator.Core.Templates;

/// <summary>
/// 🏢 企业版特性：内嵌模板资源提取器接口
/// 支持容器化环境零配置部署，自动提取和缓存模板文件
/// </summary>
public interface IEmbeddedTemplateExtractor
{
    /// <summary>
    /// 提取指定的内嵌模板资源到临时目录
    /// </summary>
    /// <param name="templateRelativePath">模板相对路径，如 "backend/Entity.template.cs"</param>
    /// <returns>提取后的临时文件路径，如果提取失败返回null</returns>
    Task<string?> ExtractTemplateAsync(string templateRelativePath);

    /// <summary>
    /// 批量提取所有内嵌模板资源
    /// </summary>
    /// <returns>提取成功的模板数量</returns>
    Task<int> ExtractAllTemplatesAsync();

    /// <summary>
    /// 获取内嵌模板的临时提取目录
    /// </summary>
    /// <returns>临时目录路径</returns>
    string GetTemporaryExtractionPath();

    /// <summary>
    /// 清理临时提取的模板文件
    /// </summary>
    /// <returns>清理的文件数量</returns>
    Task<int> CleanupTemporaryFilesAsync();

    /// <summary>
    /// 检查指定模板是否存在于内嵌资源中
    /// </summary>
    /// <param name="templateRelativePath">模板相对路径</param>
    /// <returns>是否存在</returns>
    bool IsTemplateEmbedded(string templateRelativePath);

    /// <summary>
    /// 获取所有可用的内嵌模板列表
    /// </summary>
    /// <returns>模板相对路径列表</returns>
    Task<List<string>> GetAvailableTemplatesAsync();
}
