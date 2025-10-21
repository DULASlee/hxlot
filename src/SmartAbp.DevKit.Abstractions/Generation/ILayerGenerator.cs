namespace SmartAbp.DevKit.Abstractions.Generation;

/// <summary>
/// 分层代码生成器接口（统一抽象）
/// 所有具体生成器必须实现此接口，确保架构一致性
/// </summary>
public interface ILayerGenerator
{
    /// <summary>
    /// 生成器名称（用于日志和调试）
    /// </summary>
    string Name { get; }

    /// <summary>
    /// 目标层级（Domain/Application/Frontend/Tests）
    /// </summary>
    TargetLayer Layer { get; }

    /// <summary>
    /// 生成器优先级（用于排序执行）
    /// </summary>
    int Priority { get; }

    /// <summary>
    /// 生成代码（核心方法）
    /// </summary>
    /// <param name="input">生成输入参数</param>
    /// <returns>生成结果</returns>
    Task<LayerGenerationResult> GenerateAsync(GenerationInput input);

    /// <summary>
    /// 验证输入参数（可选）
    /// </summary>
    /// <param name="input">生成输入参数</param>
    /// <returns>验证结果</returns>
    Task<ValidationResult> ValidateAsync(GenerationInput input);
}

/// <summary>
/// 目标层级枚举
/// </summary>
[Flags]
public enum TargetLayer
{
    None = 0,
    Domain = 1,
    Application = 2,
    Frontend = 4,
    Tests = 8,
    Infrastructure = 16,
    All = Domain | Application | Frontend | Tests | Infrastructure
}

/// <summary>
/// 分层生成结果
/// </summary>
public class LayerGenerationResult
{
    /// <summary>
    /// 生成是否成功
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// 生成的文件列表（路径 → 内容）
    /// </summary>
    public Dictionary<string, string> GeneratedFiles { get; set; } = new();

    /// <summary>
    /// 错误信息列表
    /// </summary>
    public List<string> Errors { get; set; } = new();

    /// <summary>
    /// 警告信息列表
    /// </summary>
    public List<string> Warnings { get; set; } = new();

    /// <summary>
    /// 执行耗时（毫秒）
    /// </summary>
    public long ElapsedMilliseconds { get; set; }

    /// <summary>
    /// 扩展数据
    /// </summary>
    public Dictionary<string, object> ExtensionData { get; set; } = new();
}

/// <summary>
/// 验证结果
/// </summary>
public class ValidationResult
{
    /// <summary>
    /// 验证是否通过
    /// </summary>
    public bool IsValid { get; set; }

    /// <summary>
    /// 验证错误信息
    /// </summary>
    public List<string> Errors { get; set; } = new();

    /// <summary>
    /// 静态工厂方法：成功
    /// </summary>
    public static ValidationResult Success() => new ValidationResult { IsValid = true };

    /// <summary>
    /// 静态工厂方法：失败
    /// </summary>
    public static ValidationResult Failure(params string[] errors) => new ValidationResult
    {
        IsValid = false,
        Errors = errors.ToList()
    };
}

