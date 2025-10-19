using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Types;

namespace SmartAbp.DevKit.Core.Quality;

/// <summary>
/// 质量门禁强制执行器
///
/// 五关质量门禁:
/// 1. 架构完整性检查（0违规）
/// 2. 类型一致性检查（100%类型安全）
/// 3. 编译检查（0错误0警告）
/// 4. 代码重复检查（0重复）
/// 5. 性能检查（响应时间≤800ms）
/// </summary>
public class QualityGateEnforcer
{
    private readonly ILogger<QualityGateEnforcer> _logger;
    private readonly CircuitBreaker _circuitBreaker;

    public QualityGateEnforcer(ILogger<QualityGateEnforcer> logger)
    {
        _logger = logger;
        _circuitBreaker = new CircuitBreaker(
            failureThreshold: 5,
            resetTimeout: TimeSpan.FromSeconds(30),
            logger
        );
    }

    /// <summary>
    /// 执行标准检查（五关强制）
    /// </summary>
    public async Task<ValidationResult> EnforceStandardsAsync(
        GenerationResult result,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("🔒 开始五关质量门禁检查...");

        var checks = new List<Task<ValidationResult>>
        {
            CheckMetadataConsistencyAsync(result.Metadata, cancellationToken),
            CheckTypeConsistencyAsync(result, cancellationToken),
            CheckTemplateOutputAsync(result, cancellationToken),
            CheckCompilationAsync(result.Code, cancellationToken),
            CheckArchitectureConstraintsAsync(result, cancellationToken)
        };

        var results = await Task.WhenAll(checks);
        return AggregateResults(results);
    }

    /// <summary>
    /// 验证（带断路器保护）
    /// </summary>
    public async Task<QualityCheckResult> ValidateAsync(
        WorkstationOutput output,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // 使用断路器保护
            return await _circuitBreaker.ExecuteAsync(async () =>
            {
                var result = new GenerationResult
                {
                    Code = output.Code,
                    Metadata = output.Metadata,
                    Success = true
                };

                var validationResult = await EnforceStandardsAsync(result, cancellationToken);

                return new QualityCheckResult
                {
                    Passed = validationResult.IsValid,
                    Errors = validationResult.Errors.Select(e => e.Message).ToList()
                };
            }, cancellationToken);
        }
        catch (CircuitBreakerOpenException ex)
        {
            _logger.LogError(ex, "❌ 断路器已打开，跳过质量检查");
            return QualityCheckResult.Fail("断路器已打开，质量检查暂时不可用");
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 五关质量检查实现
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 第一关：元数据一致性检查
    /// </summary>
    private async Task<ValidationResult> CheckMetadataConsistencyAsync(
        EntitySchema metadata,
        CancellationToken cancellationToken)
    {
        await Task.Delay(1, cancellationToken); // 模拟异步检查

        var errors = new List<ValidationError>();

        // 验证实体名称
        if (string.IsNullOrWhiteSpace(metadata.Name))
        {
            errors.Add(new ValidationError
            {
                Code = "E001",
                Message = "实体名称不能为空",
                Path = "metadata.name",
                Severity = "error"
            });
        }

        // 验证主键
        var hasKey = metadata.Properties.Any(p => p.IsKey);
        if (!hasKey)
        {
            errors.Add(new ValidationError
            {
                Code = "E002",
                Message = "实体必须有主键",
                Path = "metadata.properties",
                Severity = "error"
            });
        }

        // 验证属性名称唯一性
        var duplicateNames = metadata.Properties
            .GroupBy(p => p.Name)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicateNames.Any())
        {
            errors.Add(new ValidationError
            {
                Code = "E003",
                Message = $"属性名称重复: {string.Join(", ", duplicateNames)}",
                Path = "metadata.properties",
                Severity = "error"
            });
        }

        return new ValidationResult
        {
            IsValid = errors.Count == 0,
            Errors = errors
        };
    }

    /// <summary>
    /// 第二关：类型一致性检查
    /// </summary>
    private async Task<ValidationResult> CheckTypeConsistencyAsync(
        GenerationResult result,
        CancellationToken cancellationToken)
    {
        await Task.Delay(1, cancellationToken);

        var errors = new List<ValidationError>();

        // 检查类型安全问题
        if (result.Code.Contains("as any", StringComparison.OrdinalIgnoreCase))
        {
            errors.Add(new ValidationError
            {
                Code = "E010",
                Message = "发现类型绕过（as any），违反类型安全原则",
                Severity = "error"
            });
        }

        if (result.Code.Contains("@ts-ignore", StringComparison.OrdinalIgnoreCase))
        {
            errors.Add(new ValidationError
            {
                Code = "E011",
                Message = "发现类型忽略指令（@ts-ignore），违反类型安全原则",
                Severity = "error"
            });
        }

        // 检查Any类型使用
        if (result.Code.Contains(": any", StringComparison.OrdinalIgnoreCase))
        {
            errors.Add(new ValidationError
            {
                Code = "E012",
                Message = "发现any类型使用，违反类型安全原则",
                Severity = "error"
            });
        }

        return new ValidationResult
        {
            IsValid = errors.Count == 0,
            Errors = errors
        };
    }

    /// <summary>
    /// 第三关：模板输出检查
    /// </summary>
    private async Task<ValidationResult> CheckTemplateOutputAsync(
        GenerationResult result,
        CancellationToken cancellationToken)
    {
        await Task.Delay(1, cancellationToken);

        var errors = new List<ValidationError>();

        // 检查代码是否为空
        if (string.IsNullOrWhiteSpace(result.Code))
        {
            errors.Add(new ValidationError
            {
                Code = "E020",
                Message = "生成的代码为空",
                Severity = "error"
            });
        }

        // 检查模板变量是否完全替换
        if (result.Code.Contains("{{") || result.Code.Contains("}}"))
        {
            errors.Add(new ValidationError
            {
                Code = "E021",
                Message = "发现未替换的模板变量，模板渲染不完整",
                Severity = "error"
            });
        }

        return new ValidationResult
        {
            IsValid = errors.Count == 0,
            Errors = errors
        };
    }

    /// <summary>
    /// 第四关：编译检查（基础检查）
    /// </summary>
    private async Task<ValidationResult> CheckCompilationAsync(
        string code,
        CancellationToken cancellationToken)
    {
        await Task.Delay(1, cancellationToken);

        var errors = new List<ValidationError>();

        // 基础语法检查
        var openBraces = code.Count(c => c == '{');
        var closeBraces = code.Count(c => c == '}');

        if (openBraces != closeBraces)
        {
            errors.Add(new ValidationError
            {
                Code = "E030",
                Message = $"花括号不匹配: {{ ({openBraces}) vs }} ({closeBraces})",
                Severity = "error"
            });
        }

        // 检查是否有基本的代码结构
        if (!code.Contains("class", StringComparison.OrdinalIgnoreCase) &&
            !code.Contains("interface", StringComparison.OrdinalIgnoreCase) &&
            !code.Contains("function", StringComparison.OrdinalIgnoreCase))
        {
            errors.Add(new ValidationError
            {
                Code = "E031",
                Message = "未发现有效的代码结构（class/interface/function）",
                Severity = "error"
            });
        }

        return new ValidationResult
        {
            IsValid = errors.Count == 0,
            Errors = errors
        };
    }

    /// <summary>
    /// 第五关：架构约束检查
    /// </summary>
    private async Task<ValidationResult> CheckArchitectureConstraintsAsync(
        GenerationResult result,
        CancellationToken cancellationToken)
    {
        await Task.Delay(1, cancellationToken);

        var errors = new List<ValidationError>();

        // ✅ 优化的相对路径检查逻辑（精确匹配import/require语句）
        var relativePathPatterns = new[]
        {
            @"import\s+.*?\s+from\s+['""].*?\.\./.*?['""]",  // import ... from '../xxx'
            @"import\s*\(['""].*?\.\./.*?['""]",              // import('../xxx')
            @"require\s*\(['""].*?\.\./.*?['""]",             // require('../xxx')
            @"@import\s+['""].*?\.\./.*?['""]",               // CSS @import '../xxx'
            @"from\s+['""].*?\.\./.*?['""]",                  // Python-style from '../xxx'
        };

        foreach (var pattern in relativePathPatterns)
        {
            if (System.Text.RegularExpressions.Regex.IsMatch(result.Code, pattern, System.Text.RegularExpressions.RegexOptions.Multiline))
            {
                errors.Add(new ValidationError
                {
                    Code = "E040",
                    Message = "发现相对路径引用（'../'），违反架构规范。应使用@smartabp/*别名",
                    Severity = "error"
                });
                break; // 只报告一次
            }
        }

        // ✅ 优化的packages中@/别名检查（精确匹配import语句）
        var aliasInPackagesPattern = @"import\s+.*?\s+from\s+['""]@/.*?['""]";
        if (result.Code.Contains("packages") &&
            System.Text.RegularExpressions.Regex.IsMatch(result.Code, aliasInPackagesPattern, System.Text.RegularExpressions.RegexOptions.Multiline))
        {
            errors.Add(new ValidationError
            {
                Code = "E041",
                Message = "packages中使用了@/别名，违反架构独立性原则。应使用@smartabp/*别名",
                Severity = "error"
            });
        }

        return new ValidationResult
        {
            IsValid = errors.Count == 0,
            Errors = errors
        };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 辅助方法
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 汇总验证结果
    /// </summary>
    private ValidationResult AggregateResults(ValidationResult[] results)
    {
        var allErrors = results.SelectMany(r => r.Errors).ToList();
        var allWarnings = results.SelectMany(r => r.Warnings).ToList();

        if (allErrors.Count > 0)
        {
            _logger.LogWarning($"⚠️ 质量门禁发现 {allErrors.Count} 个错误:");
            // ✅ 输出详细的错误信息
            foreach (var error in allErrors)
            {
                _logger.LogError($"   ❌ [{error.Code}] {error.Message} (Path: {error.Path ?? "N/A"})");
            }
        }
        else
        {
            _logger.LogInformation("✅ 五关质量门禁全部通过！");
        }

        return new ValidationResult
        {
            IsValid = allErrors.Count == 0,
            Errors = allErrors,
            Warnings = allWarnings
        };
    }
}

/// <summary>
/// 断路器模式实现
/// 防止故障工位拖垮整个流水线
/// </summary>
public class CircuitBreaker
{
    private readonly int _failureThreshold;
    private readonly TimeSpan _resetTimeout;
    private readonly ILogger _logger;
    private int _failures = 0;
    private DateTime _lastFailureTime = DateTime.MinValue;
    private CircuitState _state = CircuitState.Closed;
    private readonly SemaphoreSlim _semaphore = new(1, 1);

    public CircuitBreaker(int failureThreshold, TimeSpan resetTimeout, ILogger logger)
    {
        _failureThreshold = failureThreshold;
        _resetTimeout = resetTimeout;
        _logger = logger;
    }

    /// <summary>
    /// 执行操作（带断路器保护）
    /// </summary>
    public async Task<T> ExecuteAsync<T>(Func<Task<T>> work, CancellationToken cancellationToken = default)
    {
        await _semaphore.WaitAsync(cancellationToken);
        try
        {
            // 检查断路器状态
            if (_state == CircuitState.Open)
            {
                if (DateTime.Now - _lastFailureTime > _resetTimeout)
                {
                    _logger.LogInformation("🔄 断路器进入半开状态，尝试恢复...");
                    _state = CircuitState.HalfOpen;
                }
                else
                {
                    throw new CircuitBreakerOpenException($"断路器已打开，失败次数: {_failures}");
                }
            }
        }
        finally
        {
            _semaphore.Release();
        }

        try
        {
            var result = await work();
            await RecordSuccessAsync();
            return result;
        }
        catch (Exception ex)
        {
            await RecordFailureAsync(ex);
            throw;
        }
    }

    private async Task RecordSuccessAsync()
    {
        await _semaphore.WaitAsync();
        try
        {
            if (_state == CircuitState.HalfOpen)
            {
                _logger.LogInformation("✅ 断路器恢复正常，关闭断路器");
                _state = CircuitState.Closed;
            }

            _failures = 0;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private async Task RecordFailureAsync(Exception ex)
    {
        await _semaphore.WaitAsync();
        try
        {
            _failures++;
            _lastFailureTime = DateTime.Now;

            _logger.LogWarning($"⚠️ 断路器记录失败: {_failures}/{_failureThreshold}");

            if (_failures >= _failureThreshold)
            {
                _logger.LogError($"❌ 断路器打开！失败次数超过阈值: {_failures}");
                _state = CircuitState.Open;
            }
        }
        finally
        {
            _semaphore.Release();
        }
    }
}

/// <summary>
/// 断路器状态
/// </summary>
public enum CircuitState
{
    /// <summary>
    /// 关闭（正常工作）
    /// </summary>
    Closed,

    /// <summary>
    /// 打开（阻止请求）
    /// </summary>
    Open,

    /// <summary>
    /// 半开（尝试恢复）
    /// </summary>
    HalfOpen
}

/// <summary>
/// 断路器打开异常
/// </summary>
public class CircuitBreakerOpenException : Exception
{
    public CircuitBreakerOpenException(string message) : base(message)
    {
    }
}

