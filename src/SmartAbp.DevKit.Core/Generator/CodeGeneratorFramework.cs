using System;
using System.Threading.Tasks;
using HandlebarsDotNet;
using Microsoft.Extensions.Logging;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// 代码生成器框架基类
/// Phase 2核心组件 - 统一的生成器抽象
/// </summary>
public abstract class CodeGeneratorFramework
{
    protected readonly ILogger Logger;
    protected HandlebarsTemplate<object, object>? Template;

    protected CodeGeneratorFramework(ILogger logger)
    {
        Logger = logger;
    }

    /// <summary>
    /// 编译Handlebars模板
    /// </summary>
    protected void CompileTemplate(string templateSource)
    {
        Template = Handlebars.Compile(templateSource);
        Logger.LogInformation("模板编译成功");
    }

    /// <summary>
    /// 生成代码（抽象方法，子类实现）
    /// </summary>
    public abstract Task<string> GenerateAsync(object metadata);

    /// <summary>
    /// 验证生成的代码
    /// </summary>
    protected virtual bool Validate(string generatedCode)
    {
        return !string.IsNullOrWhiteSpace(generatedCode);
    }
}

