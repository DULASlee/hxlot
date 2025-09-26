using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Services.V9;
using System.Text;

namespace SmartAbp.CodeGenerator.Core.Templates;

/// <summary>
/// 务实的模板服务 - 专注于可靠性和实用性
/// 整合路径解析和变量替换功能
/// </summary>
public class PragmaticTemplateService
{
    private readonly ReliableTemplatePathResolver _pathResolver;
    private readonly SimpleVariableReplacer _variableReplacer;
    private readonly ILogger<PragmaticTemplateService> _logger;

    public PragmaticTemplateService(
        ReliableTemplatePathResolver pathResolver,
        SimpleVariableReplacer variableReplacer,
        ILogger<PragmaticTemplateService> logger)
    {
        _pathResolver = pathResolver;
        _variableReplacer = variableReplacer;
        _logger = logger;
    }

    /// <summary>
    /// 渲染模板 - 完整的模板处理流程
    /// </summary>
    /// <param name="templateName">模板名称，如 "Entity.template.cs"</param>
    /// <param name="metadata">模块元数据</param>
    /// <param name="entity">实体数据（可选）</param>
    /// <returns>渲染后的代码内容</returns>
    public async Task<TemplateRenderResult> RenderTemplateAsync(
        string templateName, 
        ModuleMetadataDto metadata, 
        EnhancedEntityModelDto? entity = null)
    {
        try
        {
            _logger.LogInformation("开始渲染模板: {TemplateName}", templateName);

            // 1. 解析模板路径
            string templatePath;
            try
            {
                templatePath = _pathResolver.GetTemplatePath(templateName);
                _logger.LogDebug("模板路径解析成功: {TemplatePath}", templatePath);
            }
            catch (Exception ex)
            {
                return TemplateRenderResult.Failed($"模板路径解析失败: {ex.Message}");
            }

            // 2. 读取模板内容
            string templateContent;
            try
            {
                templateContent = await File.ReadAllTextAsync(templatePath, Encoding.UTF8);
                _logger.LogDebug("模板内容读取成功，长度: {Length} 字符", templateContent.Length);
            }
            catch (Exception ex)
            {
                return TemplateRenderResult.Failed($"模板文件读取失败: {ex.Message}");
            }

            // 3. 变量替换
            string renderedContent;
            try
            {
                renderedContent = _variableReplacer.ReplaceVariables(templateContent, metadata, entity);
                _logger.LogDebug("变量替换成功，输出长度: {Length} 字符", renderedContent.Length);
            }
            catch (TemplateException ex)
            {
                return TemplateRenderResult.Failed($"模板变量替换失败: {ex.Message}");
            }
            catch (Exception ex)
            {
                return TemplateRenderResult.Failed($"模板渲染过程出现异常: {ex.Message}");
            }

            // 4. 基础验证
            var validationResult = ValidateRenderedContent(renderedContent, templateName);
            if (!validationResult.IsValid)
            {
                return TemplateRenderResult.Failed($"渲染内容验证失败: {validationResult.ErrorMessage}");
            }

            _logger.LogInformation("模板渲染成功: {TemplateName}", templateName);
            return TemplateRenderResult.Success(renderedContent, templatePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "模板渲染出现未预期的异常: {TemplateName}", templateName);
            return TemplateRenderResult.Failed($"模板渲染失败: {ex.Message}");
        }
    }

    /// <summary>
    /// 批量渲染模板
    /// </summary>
    /// <param name="templateRequests">模板渲染请求列表</param>
    /// <returns>渲染结果列表</returns>
    public async Task<List<TemplateRenderResult>> RenderTemplatesAsync(
        List<TemplateRenderRequest> templateRequests)
    {
        var results = new List<TemplateRenderResult>();

        foreach (var request in templateRequests)
        {
            var result = await RenderTemplateAsync(request.TemplateName, request.Metadata, request.Entity);
            results.Add(result);

            // 如果有失败的模板，记录但继续处理其他模板
            if (!result.IsSuccess)
            {
                _logger.LogWarning("模板渲染失败: {TemplateName}, 错误: {Error}", 
                    request.TemplateName, result.ErrorMessage);
            }
        }

        var successCount = results.Count(r => r.IsSuccess);
        var failureCount = results.Count - successCount;

        _logger.LogInformation("批量模板渲染完成: 成功 {SuccessCount}, 失败 {FailureCount}", 
            successCount, failureCount);

        return results;
    }

    /// <summary>
    /// 验证渲染内容
    /// </summary>
    private ContentValidationResult ValidateRenderedContent(string content, string templateName)
    {
        var result = new ContentValidationResult();

        try
        {
            // 基础验证
            if (string.IsNullOrWhiteSpace(content))
            {
                result.IsValid = false;
                result.ErrorMessage = "渲染后的内容为空";
                return result;
            }

            // 检查是否还有未替换的变量占位符
            var unreplacedVariables = System.Text.RegularExpressions.Regex.Matches(content, @"\{\{([^}]+)\}\}");
            if (unreplacedVariables.Count > 0)
            {
                var unreplacedList = string.Join(", ", 
                    unreplacedVariables.Cast<System.Text.RegularExpressions.Match>()
                        .Select(m => m.Value)
                        .Distinct());

                result.IsValid = false;
                result.ErrorMessage = $"发现未替换的变量: {unreplacedList}";
                return result;
            }

            // 对于 C# 文件，进行基础语法检查
            if (templateName.EndsWith(".cs", StringComparison.OrdinalIgnoreCase) ||
                templateName.Contains(".template.cs"))
            {
                var syntaxCheck = ValidateCSharpBasicSyntax(content);
                if (!syntaxCheck.IsValid)
                {
                    result.IsValid = false;
                    result.ErrorMessage = syntaxCheck.ErrorMessage;
                    return result;
                }
            }

            result.IsValid = true;
            return result;
        }
        catch (Exception ex)
        {
            result.IsValid = false;
            result.ErrorMessage = $"内容验证过程出现异常: {ex.Message}";
            return result;
        }
    }

    /// <summary>
    /// 基础 C# 语法验证
    /// </summary>
    private ContentValidationResult ValidateCSharpBasicSyntax(string csharpCode)
    {
        var result = new ContentValidationResult { IsValid = true };

        try
        {
            // 基础语法检查（非严格，主要检查明显的语法错误）
            var issues = new List<string>();

            // 检查大括号匹配
            var openBraces = csharpCode.Count(c => c == '{');
            var closeBraces = csharpCode.Count(c => c == '}');
            if (openBraces != closeBraces)
            {
                issues.Add($"大括号不匹配: 开 {openBraces} vs 闭 {closeBraces}");
            }

            // 检查小括号匹配
            var openParens = csharpCode.Count(c => c == '(');
            var closeParens = csharpCode.Count(c => c == ')');
            if (openParens != closeParens)
            {
                issues.Add($"小括号不匹配: 开 {openParens} vs 闭 {closeParens}");
            }

            // 检查是否包含必要的基础结构
            if (csharpCode.Contains("class ") || csharpCode.Contains("interface "))
            {
                if (!csharpCode.Contains("namespace "))
                {
                    issues.Add("缺少 namespace 声明");
                }
            }

            if (issues.Any())
            {
                result.IsValid = false;
                result.ErrorMessage = "C# 代码基础语法问题: " + string.Join("; ", issues);
            }

            return result;
        }
        catch (Exception ex)
        {
            result.IsValid = false;
            result.ErrorMessage = $"C# 语法验证过程出现异常: {ex.Message}";
            return result;
        }
    }

    /// <summary>
    /// 获取所有可用的模板
    /// </summary>
    public List<string> GetAvailableTemplates()
    {
        try
        {
            return _pathResolver.GetAvailableTemplates();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取可用模板列表失败");
            return new List<string>();
        }
    }

    /// <summary>
    /// 验证模板服务配置
    /// </summary>
    public async Task<TemplateServiceValidationResult> ValidateConfigurationAsync()
    {
        var result = new TemplateServiceValidationResult();

        try
        {
            // 验证路径解析器
            var pathValidation = _pathResolver.ValidateConfiguration();
            result.PathResolverValid = pathValidation.IsValid;
            result.PathValidationDetails = pathValidation.GetValidationSummary();

            // 验证可用模板
            var availableTemplates = GetAvailableTemplates();
            result.AvailableTemplatesCount = availableTemplates.Count;
            result.AvailableTemplates = availableTemplates;

            // 测试基础模板渲染
            if (availableTemplates.Any())
            {
                try
                {
                    var testMetadata = new ModuleMetadataDto 
                    { 
                        Name = "TestModule", 
                        Namespace = "Test.Namespace" 
                    };
                    
                    var testTemplate = availableTemplates.First();
                    var testResult = await RenderTemplateAsync(testTemplate, testMetadata);
                    result.CanRenderTemplates = testResult.IsSuccess;
                    result.RenderTestError = testResult.IsSuccess ? null : testResult.ErrorMessage;
                }
                catch (Exception ex)
                {
                    result.CanRenderTemplates = false;
                    result.RenderTestError = ex.Message;
                }
            }

            result.IsFullyValid = result.PathResolverValid && 
                                 result.AvailableTemplatesCount > 0 && 
                                 result.CanRenderTemplates;

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "模板服务配置验证失败");
            result.IsFullyValid = false;
            result.ValidationError = ex.Message;
            return result;
        }
    }
}

#region 数据传输对象

/// <summary>
/// 模板渲染请求
/// </summary>
public class TemplateRenderRequest
{
    public string TemplateName { get; set; } = string.Empty;
    public ModuleMetadataDto Metadata { get; set; } = new();
    public EnhancedEntityModelDto? Entity { get; set; }
}

/// <summary>
/// 模板渲染结果
/// </summary>
public class TemplateRenderResult
{
    public bool IsSuccess { get; set; }
    public string? RenderedContent { get; set; }
    public string? TemplatePath { get; set; }
    public string? ErrorMessage { get; set; }

    public static TemplateRenderResult Success(string content, string templatePath)
    {
        return new TemplateRenderResult
        {
            IsSuccess = true,
            RenderedContent = content,
            TemplatePath = templatePath
        };
    }

    public static TemplateRenderResult Failed(string errorMessage)
    {
        return new TemplateRenderResult
        {
            IsSuccess = false,
            ErrorMessage = errorMessage
        };
    }
}

/// <summary>
/// 内容验证结果
/// </summary>
public class ContentValidationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// 模板服务验证结果
/// </summary>
public class TemplateServiceValidationResult
{
    public bool IsFullyValid { get; set; }
    public bool PathResolverValid { get; set; }
    public string PathValidationDetails { get; set; } = string.Empty;
    public int AvailableTemplatesCount { get; set; }
    public List<string> AvailableTemplates { get; set; } = new();
    public bool CanRenderTemplates { get; set; }
    public string? RenderTestError { get; set; }
    public string? ValidationError { get; set; }

    public string GetValidationSummary()
    {
        var summary = new List<string>();
        
        summary.Add($"整体状态: {(IsFullyValid ? "✅ 有效" : "❌ 无效")}");
        summary.Add($"路径解析器: {(PathResolverValid ? "✅ 有效" : "❌ 无效")}");
        summary.Add($"可用模板数量: {AvailableTemplatesCount}");
        summary.Add($"模板渲染测试: {(CanRenderTemplates ? "✅ 通过" : "❌ 失败")}");
        
        if (!string.IsNullOrEmpty(RenderTestError))
        {
            summary.Add($"渲染测试错误: {RenderTestError}");
        }
        
        if (!string.IsNullOrEmpty(ValidationError))
        {
            summary.Add($"验证错误: {ValidationError}");
        }

        summary.Add("\n路径验证详情:");
        summary.Add(PathValidationDetails);

        return string.Join("\n", summary);
    }
}

#endregion
