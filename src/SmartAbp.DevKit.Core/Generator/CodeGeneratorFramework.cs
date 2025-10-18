using System.Threading.Tasks;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// 代码生成器框架基类（泛型版本）
/// Phase 2核心组件 - 统一的生成器抽象
/// </summary>
/// <typeparam name="TInput">输入元数据类型</typeparam>
/// <typeparam name="TOutput">生成结果类型</typeparam>
public abstract class CodeGeneratorFramework<TInput, TOutput>
{
    /// <summary>
    /// 生成代码（抽象方法，子类实现）
    /// </summary>
    public abstract Task<TOutput> GenerateAsync(TInput input);

    /// <summary>
    /// 验证输入数据
    /// </summary>
    public virtual Task<ValidationResult> ValidateInputAsync(TInput input)
    {
        return Task.FromResult(ValidationResult.Success());
    }
}

/// <summary>
/// 验证结果
/// </summary>
public class ValidationResult
{
    public bool IsValid { get; private set; }
    public string ErrorMessage { get; private set; } = string.Empty;

    private ValidationResult(bool isValid, string errorMessage = "")
    {
        IsValid = isValid;
        ErrorMessage = errorMessage;
    }

    public static ValidationResult Success() => new(true);
    public static ValidationResult Fail(string errorMessage) => new(false, errorMessage);
}

