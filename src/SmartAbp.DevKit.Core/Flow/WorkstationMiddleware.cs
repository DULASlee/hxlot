using System;
using System.Threading.Tasks;
using SmartAbp.DevKit.Core.Types;

namespace SmartAbp.DevKit.Core.Flow;

/// <summary>
/// 工位中间件接口
/// ⭐ D爷建议：增加中间件管道模式，使流水线可配置化
/// </summary>
public interface IWorkstationMiddleware
{
    string Name { get; }
    int Priority { get; }
    Task<WorkstationOutput> ExecuteAsync(WorkstationInput input, Func<WorkstationInput, Task<WorkstationOutput>> next);
}

/// <summary>
/// 日志记录中间件
/// </summary>
public class LoggingMiddleware : IWorkstationMiddleware
{
    public string Name => "Logging";
    public int Priority => 10;

    public async Task<WorkstationOutput> ExecuteAsync(
        WorkstationInput input,
        Func<WorkstationInput, Task<WorkstationOutput>> next)
    {
        Console.WriteLine($"📝 [{Name}] 开始执行工位");
        var startTime = DateTime.Now;

        try
        {
            var output = await next(input);
            var duration = (DateTime.Now - startTime).TotalMilliseconds;
            Console.WriteLine($"✅ [{Name}] 工位完成: {output.WorkstationId} ({duration}ms)");
            return output;
        }
        catch (Exception ex)
        {
            var duration = (DateTime.Now - startTime).TotalMilliseconds;
            Console.WriteLine($"❌ [{Name}] 工位失败 ({duration}ms) - {ex.Message}");
            throw;
        }
    }
}

/// <summary>
/// 性能监控中间件
/// </summary>
public class PerformanceMiddleware : IWorkstationMiddleware
{
    public string Name => "Performance";
    public int Priority => 20;

    private readonly int _warningThresholdMs;
    private readonly int _errorThresholdMs;

    public PerformanceMiddleware(int warningThresholdMs = 5000, int errorThresholdMs = 10000)
    {
        _warningThresholdMs = warningThresholdMs;
        _errorThresholdMs = errorThresholdMs;
    }

    public async Task<WorkstationOutput> ExecuteAsync(
        WorkstationInput input,
        Func<WorkstationInput, Task<WorkstationOutput>> next)
    {
        var startTime = DateTime.Now;
        var output = await next(input);
        var duration = (DateTime.Now - startTime).TotalMilliseconds;

        if (duration > _errorThresholdMs)
        {
            Console.WriteLine($"🔴 [{Name}] 性能严重超标: {output.WorkstationId} ({duration}ms > {_errorThresholdMs}ms)");
        }
        else if (duration > _warningThresholdMs)
        {
            Console.WriteLine($"⚠️ [{Name}] 性能警告: {output.WorkstationId} ({duration}ms > {_warningThresholdMs}ms)");
        }

        return output;
    }
}

/// <summary>
/// 错误处理中间件
/// </summary>
public class ErrorHandlingMiddleware : IWorkstationMiddleware
{
    public string Name => "ErrorHandling";
    public int Priority => 5; // 最高优先级（最外层）

    public async Task<WorkstationOutput> ExecuteAsync(
        WorkstationInput input,
        Func<WorkstationInput, Task<WorkstationOutput>> next)
    {
        try
        {
            return await next(input);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ [{Name}] 捕获异常: {ex.GetType().Name} - {ex.Message}");

            // 返回错误输出
            return new WorkstationOutput
            {
                Code = $"// Error: {ex.Message}",
                Metadata = input.Metadata,
                WorkstationId = "error"
            };
        }
    }
}

/// <summary>
/// 验证中间件
/// </summary>
public class ValidationMiddleware : IWorkstationMiddleware
{
    public string Name => "Validation";
    public int Priority => 15;

    public async Task<WorkstationOutput> ExecuteAsync(
        WorkstationInput input,
        Func<WorkstationInput, Task<WorkstationOutput>> next)
    {
        // 验证输入
        if (input.Metadata == null)
        {
            Console.WriteLine($"⚠️ [{Name}] 警告: 元数据为空");
        }

        var output = await next(input);

        // 验证输出
        if (string.IsNullOrEmpty(output.Code))
        {
            Console.WriteLine($"⚠️ [{Name}] 警告: 生成的代码为空");
        }

        return output;
    }
}

/// <summary>
/// 中间件管道构建器
/// </summary>
public class MiddlewarePipelineBuilder
{
    private readonly List<IWorkstationMiddleware> _middlewares = new();

    public MiddlewarePipelineBuilder Use(IWorkstationMiddleware middleware)
    {
        _middlewares.Add(middleware);
        return this;
    }

    public MiddlewarePipelineBuilder UseLogging()
    {
        return Use(new LoggingMiddleware());
    }

    public MiddlewarePipelineBuilder UsePerformanceMonitoring(int warningMs = 5000, int errorMs = 10000)
    {
        return Use(new PerformanceMiddleware(warningMs, errorMs));
    }

    public MiddlewarePipelineBuilder UseErrorHandling()
    {
        return Use(new ErrorHandlingMiddleware());
    }

    public MiddlewarePipelineBuilder UseValidation()
    {
        return Use(new ValidationMiddleware());
    }

    /// <summary>
    /// 构建中间件管道
    /// </summary>
    public Func<WorkstationInput, Task<WorkstationOutput>> Build(Func<WorkstationInput, Task<WorkstationOutput>> finalHandler)
    {
        // 按优先级排序
        var sortedMiddlewares = _middlewares.OrderBy(m => m.Priority).ToList();

        // 从后向前构建管道
        Func<WorkstationInput, Task<WorkstationOutput>> pipeline = finalHandler;

        for (int i = sortedMiddlewares.Count - 1; i >= 0; i--)
        {
            var middleware = sortedMiddlewares[i];
            var next = pipeline;
            pipeline = input => middleware.ExecuteAsync(input, next);
        }

        return pipeline;
    }
}

