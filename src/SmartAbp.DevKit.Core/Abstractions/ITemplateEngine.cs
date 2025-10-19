using System.Threading.Tasks;

namespace SmartAbp.DevKit.Core.Abstractions;

/// <summary>
/// 模板引擎接口（负责模板加载、编译和渲染）
/// </summary>
public interface ITemplateEngine
{
    /// <summary>
    /// 加载模板
    /// </summary>
    /// <param name="templatePath">模板路径（相对路径，如"Backend/AppService.hbs"）</param>
    /// <returns>模板对象</returns>
    Task<Template> LoadTemplateAsync(string templatePath);

    /// <summary>
    /// 渲染模板
    /// </summary>
    /// <param name="template">模板对象</param>
    /// <param name="data">数据对象</param>
    /// <returns>渲染后的字符串</returns>
    Task<string> RenderAsync(Template template, object data);

    /// <summary>
    /// 注册Partial模板（用于模板复用）
    /// </summary>
    /// <param name="name">Partial名称</param>
    /// <param name="content">Partial内容</param>
    void RegisterPartial(string name, string content);

    /// <summary>
    /// 注册自定义Helper（用于模板中的自定义逻辑）
    /// </summary>
    /// <param name="name">Helper名称</param>
    /// <param name="helper">Helper委托</param>
    void RegisterHelper(string name, Delegate helper);

    /// <summary>
    /// 清除缓存（用于开发环境热重载）
    /// </summary>
    void ClearCache();
}

/// <summary>
/// 模板对象
/// </summary>
public class Template
{
    /// <summary>
    /// 模板路径
    /// </summary>
    public required string Path { get; set; }

    /// <summary>
    /// 模板内容
    /// </summary>
    public required string Content { get; set; }

    /// <summary>
    /// 编译后的模板（Handlebars编译结果）
    /// </summary>
    public object? CompiledTemplate { get; set; }

    /// <summary>
    /// 模板哈希（用于缓存验证）
    /// </summary>
    public string? Hash { get; set; }
}

