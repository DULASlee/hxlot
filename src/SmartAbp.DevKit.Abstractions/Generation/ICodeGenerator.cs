namespace SmartAbp.DevKit.Abstractions.Generation;

/// <summary>
/// 代码生成器接口，用于生成各层代码
/// </summary>
public interface ICodeGenerator
{
    /// <summary>
    /// 异步生成代码
    /// </summary>
    /// <param name="input">生成输入参数</param>
    /// <returns>生成结果</returns>
    Task<GenerationResult> GenerateAsync(GenerationInput input);
}

/// <summary>
/// 代码生成输入参数
/// </summary>
public class GenerationInput
{
    public Guid EntityId { get; set; }
    public GenerationOptions Options { get; set; } = new();
}

/// <summary>
/// 代码生成选项
/// </summary>
public class GenerationOptions
{
    public bool GenerateDomain { get; set; } = true;
    public bool GenerateApplication { get; set; } = true;
    public bool GenerateFrontend { get; set; } = true;
    public string NamespacePrefix { get; set; } = string.Empty;
    public string OutputBasePath { get; set; } = string.Empty;
}

/// <summary>
/// 代码生成结果
/// </summary>
public class GenerationResult
{
    public bool Success { get; set; }
    public Dictionary<string, string> GeneratedFiles { get; set; } = new();
    public List<string> Errors { get; set; } = new();
}
