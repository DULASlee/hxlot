using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Permissions.Logging
{
    /// <summary>
    /// 企业级日志服务选项
    /// </summary>
    public class EnterpriseLoggingOptions
    {
        /// <summary>
        /// 日志级别
        /// </summary>
        public LogLevel LogLevel { get; set; } = LogLevel.Information;

        /// <summary>
        /// 是否启用结构化日志
        /// </summary>
        public bool EnableStructuredLogging { get; set; } = true;

        /// <summary>
        /// 日志提供程序
        /// </summary>
        public List<string> Providers { get; set; } = new List<string> { "Console", "File", "Elasticsearch" };

        /// <summary>
        /// 日志文件路径
        /// </summary>
        public string LogFilePath { get; set; } = "logs/enterprise-{Date}.log";

        /// <summary>
        /// Elasticsearch连接字符串
        /// </summary>
        public string ElasticsearchConnectionString { get; set; } = "http://localhost:9200";

        /// <summary>
        /// 日志保留天数
        /// </summary>
        public int RetentionDays { get; set; } = 30;

        /// <summary>
        /// 是否启用性能日志
        /// </summary>
        public bool EnablePerformanceLogging { get; set; } = true;

        /// <summary>
        /// 性能日志阈值（毫秒）
        /// </summary>
        public int PerformanceThresholdMs { get; set; } = 1000;

        /// <summary>
        /// 是否启用审计日志
        /// </summary>
        public bool EnableAuditLogging { get; set; } = true;

        /// <summary>
        /// 审计日志包含的属性
        /// </summary>
        public List<string> AuditLogProperties { get; set; } = new List<string> { "UserId", "UserName", "Action", "EntityType", "EntityId" };
    }

    /// <summary>
    /// 日志级别枚举
    /// </summary>
    public enum LogLevel
    {
        Trace = 0,
        Debug = 1,
        Information = 2,
        Warning = 3,
        Error = 4,
        Critical = 5
    }

    /// <summary>
    /// 日志提供程序枚举
    /// </summary>
    public enum LogProvider
    {
        Console,
        File,
        Elasticsearch,
        ApplicationInsights,
        Seq
    }

    /// <summary>
    /// 日志条目模型
    /// </summary>
    public class LogEntry
    {
        /// <summary>
        /// 日志ID
        /// </summary>
        public string Id { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// 时间戳
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// 日志级别
        /// </summary>
        public LogLevel Level { get; set; }

        /// <summary>
        /// 日志类别
        /// </summary>
        public string Category { get; set; } = string.Empty;

        /// <summary>
        /// 消息
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// 异常信息
        /// </summary>
        public string? Exception { get; set; }

        /// <summary>
        /// 属性字典
        /// </summary>
        public Dictionary<string, object> Properties { get; set; } = new Dictionary<string, object>();

        /// <summary>
        /// 用户ID
        /// </summary>
        public string? UserId { get; set; }

        /// <summary>
        /// 请求ID
        /// </summary>
        public string? RequestId { get; set; }

        /// <summary>
        /// 机器名
        /// </summary>
        public string MachineName { get; set; } = Environment.MachineName;

        /// <summary>
        /// 进程ID
        /// </summary>
        public int ProcessId { get; set; } = Environment.ProcessId;
    }

    /// <summary>
    /// 性能日志模型
    /// </summary>
    public class PerformanceLog
    {
        /// <summary>
        /// 操作名称
        /// </summary>
        public string OperationName { get; set; } = string.Empty;

        /// <summary>
        /// 开始时间
        /// </summary>
        public DateTime StartTime { get; set; }

        /// <summary>
        /// 结束时间
        /// </summary>
        public DateTime EndTime { get; set; }

        /// <summary>
        /// 执行时间（毫秒）
        /// </summary>
        public double DurationMs { get; set; }

        /// <summary>
        /// 是否超过阈值
        /// </summary>
        public bool IsOverThreshold { get; set; }

        /// <summary>
        /// 附加数据
        /// </summary>
        public Dictionary<string, object> AdditionalData { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// 审计日志模型
    /// </summary>
    public class AuditLog
    {
        /// <summary>
        /// 审计ID
        /// </summary>
        public string Id { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// 用户ID
        /// </summary>
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// 用户名
        /// </summary>
        public string UserName { get; set; } = string.Empty;

        /// <summary>
        /// 操作
        /// </summary>
        public string Action { get; set; } = string.Empty;

        /// <summary>
        /// 实体类型
        /// </summary>
        public string EntityType { get; set; } = string.Empty;

        /// <summary>
        /// 实体ID
        /// </summary>
        public string EntityId { get; set; } = string.Empty;

        /// <summary>
        /// 旧值
        /// </summary>
        public string? OldValue { get; set; }

        /// <summary>
        /// 新值
        /// </summary>
        public string? NewValue { get; set; }

        /// <summary>
        /// 时间戳
        /// </summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// IP地址
        /// </summary>
        public string? IpAddress { get; set; }

        /// <summary>
        /// 用户代理
        /// </summary>
        public string? UserAgent { get; set; }
    }

    /// <summary>
    /// 企业级日志服务接口
    /// </summary>
    public interface IEnterpriseLoggingService
    {
        /// <summary>
        /// 记录日志
        /// </summary>
        /// <param name="level">日志级别</param>
        /// <param name="category">日志类别</param>
        /// <param name="message">消息</param>
        /// <param name="exception">异常</param>
        /// <param name="properties">属性</param>
        Task LogAsync(LogLevel level, string category, string message, Exception? exception = null, Dictionary<string, object>? properties = null);

        /// <summary>
        /// 记录跟踪日志
        /// </summary>
        Task LogTraceAsync(string category, string message, Dictionary<string, object>? properties = null);

        /// <summary>
        /// 记录调试日志
        /// </summary>
        Task LogDebugAsync(string category, string message, Dictionary<string, object>? properties = null);

        /// <summary>
        /// 记录信息日志
        /// </summary>
        Task LogInformationAsync(string category, string message, Dictionary<string, object>? properties = null);

        /// <summary>
        /// 记录警告日志
        /// </summary>
        Task LogWarningAsync(string category, string message, Exception? exception = null, Dictionary<string, object>? properties = null);

        /// <summary>
        /// 记录错误日志
        /// </summary>
        Task LogErrorAsync(string category, string message, Exception? exception = null, Dictionary<string, object>? properties = null);

        /// <summary>
        /// 记录严重错误日志
        /// </summary>
        Task LogCriticalAsync(string category, string message, Exception? exception = null, Dictionary<string, object>? properties = null);

        /// <summary>
        /// 记录性能日志
        /// </summary>
        Task LogPerformanceAsync(string operationName, DateTime startTime, DateTime endTime, Dictionary<string, object>? additionalData = null);

        /// <summary>
        /// 记录审计日志
        /// </summary>
        Task LogAuditAsync(AuditLog auditLog);

        /// <summary>
        /// 获取日志
        /// </summary>
        Task<List<LogEntry>> GetLogsAsync(DateTime startTime, DateTime endTime, LogLevel? level = null, string? category = null);

        /// <summary>
        /// 获取性能日志
        /// </summary>
        Task<List<PerformanceLog>> GetPerformanceLogsAsync(DateTime startTime, DateTime endTime, string? operationName = null);

        /// <summary>
        /// 获取审计日志
        /// </summary>
        Task<List<AuditLog>> GetAuditLogsAsync(DateTime startTime, DateTime endTime, string? userId = null, string? action = null);

        /// <summary>
        /// 清理过期日志
        /// </summary>
        Task CleanupOldLogsAsync(int retentionDays);
    }

    /// <summary>
    /// 企业级日志服务实现
    /// </summary>
    public class EnterpriseLoggingService : IEnterpriseLoggingService, ITransientDependency
    {
        private readonly EnterpriseLoggingOptions _options;
        private readonly ILogger<EnterpriseLoggingService> _logger;
        private readonly List<LogEntry> _logEntries = new List<LogEntry>();
        private readonly List<PerformanceLog> _performanceLogs = new List<PerformanceLog>();
        private readonly List<AuditLog> _auditLogs = new List<AuditLog>();

        public EnterpriseLoggingService(
            ILogger<EnterpriseLoggingService> logger)
        {
            _logger = logger;
            _options = new EnterpriseLoggingOptions();
        }

        public async Task LogAsync(LogLevel level, string category, string message, Exception? exception = null, Dictionary<string, object>? properties = null)
        {
            try
            {
                var logEntry = new LogEntry
                {
                    Level = level,
                    Category = category,
                    Message = message,
                    Exception = exception?.ToString()
                };

                if (properties != null)
                {
                    foreach (var prop in properties)
                    {
                        logEntry.Properties[prop.Key] = prop.Value;
                    }
                }

                _logEntries.Add(logEntry);

                // 根据配置记录到不同的提供程序
                await WriteToProviders(logEntry);

                _logger.LogInformation($"[{level}] {category}: {message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "记录日志时发生错误");
            }
        }

        public async Task LogTraceAsync(string category, string message, Dictionary<string, object>? properties = null)
        {
            await LogAsync(LogLevel.Trace, category, message, null, properties);
        }

        public async Task LogDebugAsync(string category, string message, Dictionary<string, object>? properties = null)
        {
            await LogAsync(LogLevel.Debug, category, message, null, properties);
        }

        public async Task LogInformationAsync(string category, string message, Dictionary<string, object>? properties = null)
        {
            await LogAsync(LogLevel.Information, category, message, null, properties);
        }

        public async Task LogWarningAsync(string category, string message, Exception? exception = null, Dictionary<string, object>? properties = null)
        {
            await LogAsync(LogLevel.Warning, category, message, exception, properties);
        }

        public async Task LogErrorAsync(string category, string message, Exception? exception = null, Dictionary<string, object>? properties = null)
        {
            await LogAsync(LogLevel.Error, category, message, exception, properties);
        }

        public async Task LogCriticalAsync(string category, string message, Exception? exception = null, Dictionary<string, object>? properties = null)
        {
            await LogAsync(LogLevel.Critical, category, message, exception, properties);
        }

        public async Task LogPerformanceAsync(string operationName, DateTime startTime, DateTime endTime, Dictionary<string, object>? additionalData = null)
        {
            try
            {
                if (!_options.EnablePerformanceLogging)
                    return;

                var duration = (endTime - startTime).TotalMilliseconds;
                var isOverThreshold = duration > _options.PerformanceThresholdMs;

                var performanceLog = new PerformanceLog
                {
                    OperationName = operationName,
                    StartTime = startTime,
                    EndTime = endTime,
                    DurationMs = duration,
                    IsOverThreshold = isOverThreshold
                };

                if (additionalData != null)
                {
                    foreach (var data in additionalData)
                    {
                        performanceLog.AdditionalData[data.Key] = data.Value;
                    }
                }

                _performanceLogs.Add(performanceLog);

                if (isOverThreshold)
                {
                    await LogWarningAsync("Performance", $"操作 '{operationName}' 执行时间超过阈值: {duration}ms");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "记录性能日志时发生错误");
            }
        }

        public async Task LogAuditAsync(AuditLog auditLog)
        {
            try
            {
                if (!_options.EnableAuditLogging)
                    return;

                _auditLogs.Add(auditLog);
                await LogInformationAsync("Audit", $"用户 {auditLog.UserName} 执行了 {auditLog.Action} 操作");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "记录审计日志时发生错误");
            }
        }

        public async Task<List<LogEntry>> GetLogsAsync(DateTime startTime, DateTime endTime, LogLevel? level = null, string? category = null)
        {
            return await Task.FromResult(_logEntries.FindAll(log =>
                log.Timestamp >= startTime &&
                log.Timestamp <= endTime &&
                (level == null || log.Level == level) &&
                (category == null || log.Category.Contains(category))));
        }

        public async Task<List<PerformanceLog>> GetPerformanceLogsAsync(DateTime startTime, DateTime endTime, string? operationName = null)
        {
            return await Task.FromResult(_performanceLogs.FindAll(log =>
                log.StartTime >= startTime &&
                log.EndTime <= endTime &&
                (operationName == null || log.OperationName.Contains(operationName))));
        }

        public async Task<List<AuditLog>> GetAuditLogsAsync(DateTime startTime, DateTime endTime, string? userId = null, string? action = null)
        {
            return await Task.FromResult(_auditLogs.FindAll(log =>
                log.Timestamp >= startTime &&
                log.Timestamp <= endTime &&
                (userId == null || log.UserId == userId) &&
                (action == null || log.Action.Contains(action))));
        }

        public async Task CleanupOldLogsAsync(int retentionDays)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);

                _logEntries.RemoveAll(log => log.Timestamp < cutoffDate);
                _performanceLogs.RemoveAll(log => log.StartTime < cutoffDate);
                _auditLogs.RemoveAll(log => log.Timestamp < cutoffDate);

                await LogInformationAsync("Logging", $"清理了 {retentionDays} 天前的日志数据");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "清理日志时发生错误");
            }
        }

        private async Task WriteToProviders(LogEntry logEntry)
        {
            foreach (var provider in _options.Providers)
            {
                try
                {
                    switch (provider.ToLower())
                    {
                        case "console":
                            Console.WriteLine($"[{logEntry.Timestamp:yyyy-MM-dd HH:mm:ss}] [{logEntry.Level}] {logEntry.Category}: {logEntry.Message}");
                            break;

                        case "file":
                            // 这里可以实现文件日志写入逻辑
                            break;

                        case "elasticsearch":
                            // 这里可以实现Elasticsearch日志写入逻辑
                            break;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"写入日志到提供程序 '{provider}' 时发生错误");
                }
            }
        }
    }

    /// <summary>
    /// 日志服务扩展方法
    /// </summary>
    public static class EnterpriseLoggingServiceExtensions
    {
        /// <summary>
        /// 添加企业级日志服务
        /// </summary>
        public static IServiceCollection AddEnterpriseLoggingService(
            this IServiceCollection services,
            Action<EnterpriseLoggingOptions>? configureOptions = null)
        {
            if (configureOptions != null)
            {
                services.Configure(configureOptions);
            }

            services.AddTransient<IEnterpriseLoggingService, EnterpriseLoggingService>();
            return services;
        }
    }
}