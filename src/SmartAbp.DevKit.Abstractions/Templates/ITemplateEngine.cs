namespace SmartAbp.DevKit.Abstractions.Templates;

/// <summary>
/// 模板引擎接口，用于渲染代码生成模板
/// </summary>
public interface ITemplateEngine
{
    /// <summary>
    /// 异步渲染模板
    /// </summary>
    /// <param name="templateName">模板名称</param>
    /// <param name="data">模板数据</param>
    /// <returns>渲染结果</returns>
    Task<string> RenderAsync(string templateName, object data);

    /// <summary>
    /// 注册模板
    /// </summary>
    /// <param name="name">模板名称</param>
    /// <param name="content">模板内容</param>
    void RegisterTemplate(string name, string content);
}
