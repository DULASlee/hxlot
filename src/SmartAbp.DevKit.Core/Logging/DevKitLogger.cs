using System;
using System.Diagnostics;
using System.Threading;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Logging.Models;

namespace SmartAbp.DevKit.Core.Logging;

/// <summary>
/// DevKit自定义Logger（集成到Microsoft.Extensions.Logging，同时写入数据库）
/// </summary>
public class DevKitLogger : ILogger
{
    private readonly string _categoryName;
    private readonly LogChannel _logChannel;
    private readonly LogLevel _minLevel;

    public DevKitLogger(
        string categoryName,
        LogChannel logChannel,
        LogLevel minLevel = LogLevel.Information)
    {
        _categoryName = categoryName ?? throw new ArgumentNullException(nameof(categoryName));
        _logChannel = logChannel ?? throw new ArgumentNullException(nameof(logChannel));
        _minLevel = minLevel;
    }

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull
    {
        return null;  // 简化实现，不支持Scope
    }

    public bool IsEnabled(LogLevel logLevel)
    {
        return logLevel >= _minLevel;
    }

    public void Log<TState>(
        LogLevel logLevel,
        EventId eventId,
        TState state,
        Exception? exception,
        Func<TState, Exception?, string> formatter)
    {
        if (!IsEnabled(logLevel))
        {
            return;
        }

        var message = formatter(state, exception);

        var logEntry = new LogEntry
        {
            Timestamp = DateTime.UtcNow,
            Level = logLevel.ToString(),
            Category = _categoryName,
            Message = message,
            Exception = exception?.ToString(),
            MachineName = Environment.MachineName,
            ProcessId = Environment.ProcessId,
            ThreadId = Environment.CurrentManagedThreadId,
            OperationId = Activity.Current?.Id  // 支持分布式追踪
        };

        // 异步写入通道
        _logChannel.Write(logEntry);
    }
}

/// <summary>
/// DevKit Logger Provider（用于注册到Microsoft.Extensions.Logging）
/// </summary>
[ProviderAlias("DevKit")]
public class DevKitLoggerProvider : ILoggerProvider
{
    private readonly LogChannel _logChannel;
    private readonly LogLevel _minLevel;

    public DevKitLoggerProvider(
        LogChannel logChannel,
        LogLevel minLevel = LogLevel.Information)
    {
        _logChannel = logChannel ?? throw new ArgumentNullException(nameof(logChannel));
        _minLevel = minLevel;
    }

    public ILogger CreateLogger(string categoryName)
    {
        return new DevKitLogger(categoryName, _logChannel, _minLevel);
    }

    public void Dispose()
    {
        // LogChannel由DI容器管理，不在这里释放
    }
}

/// <summary>
/// DevKit Logger Extensions（方便注册）
/// </summary>
public static class DevKitLoggerExtensions
{
    /// <summary>
    /// 添加DevKit日志记录器
    /// </summary>
    /// <param name="builder">日志构建器</param>
    /// <param name="logChannel">日志通道</param>
    /// <param name="minLevel">最小日志级别</param>
    /// <returns>日志构建器</returns>
    public static ILoggingBuilder AddDevKitLogger(
        this ILoggingBuilder builder,
        LogChannel logChannel,
        LogLevel minLevel = LogLevel.Information)
    {
        builder.AddProvider(new DevKitLoggerProvider(logChannel, minLevel));
        return builder;
    }
}

