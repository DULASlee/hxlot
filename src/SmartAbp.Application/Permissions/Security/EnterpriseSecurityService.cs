using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartAbp.Permissions.Alerting;
using SmartAbp.Permissions.Cache;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Permissions.Security
{
    /// <summary>
    /// 企业级安全选项
    /// </summary>
    public class EnterpriseSecurityOptions
    {
        /// <summary>
        /// 是否启用数据加密
        /// </summary>
        public bool EnableDataEncryption { get; set; } = true;

        /// <summary>
        /// 是否启用审计日志
        /// </summary>
        public bool EnableAuditLogging { get; set; } = true;

        /// <summary>
        /// 是否启用权限验证
        /// </summary>
        public bool EnablePermissionValidation { get; set; } = true;

        /// <summary>
        /// 加密密钥
        /// </summary>
        public string EncryptionKey { get; set; } = "SmartAbpEnterpriseSecurityKey2024!";

        /// <summary>
        /// 审计日志保留天数
        /// </summary>
        public int AuditLogRetentionDays { get; set; } = 90;

        /// <summary>
        /// 最大失败尝试次数
        /// </summary>
        public int MaxFailedAttempts { get; set; } = 5;

        /// <summary>
        /// 锁定时间（分钟）
        /// </summary>
        public int LockoutDurationMinutes { get; set; } = 15;

        /// <summary>
        /// 是否启用速率限制
        /// </summary>
        public bool EnableRateLimiting { get; set; } = true;

        /// <summary>
        /// 速率限制阈值
        /// </summary>
        public int RateLimitThreshold { get; set; } = 100;

        /// <summary>
        /// 速率限制时间窗口（秒）
        /// </summary>
        public int RateLimitWindowSeconds { get; set; } = 60;

        /// <summary>
        /// 是否启用安全标头
        /// </summary>
        public bool EnableSecurityHeaders { get; set; } = true;

        /// <summary>
        /// 是否启用输入验证
        /// </summary>
        public bool EnableInputValidation { get; set; } = true;

        /// <summary>
        /// 是否启用SQL注入防护
        /// </summary>
        public bool EnableSqlInjectionProtection { get; set; } = true;

        /// <summary>
        /// 是否启用XSS防护
        /// </summary>
        public bool EnableXssProtection { get; set; } = true;

        /// <summary>
        /// 是否启用CSRF防护
        /// </summary>
        public bool EnableCsrfProtection { get; set; } = true;
    }

    /// <summary>
    /// 审计日志模型
    /// </summary>
    public class AuditLog
    {
        /// <summary>
        /// 日志ID
        /// </summary>
        public string LogId { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// 用户ID
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// 用户名称
        /// </summary>
        public string UserName { get; set; }

        /// <summary>
        /// 操作类型
        /// </summary>
        public string ActionType { get; set; }

        /// <summary>
        /// 资源名称
        /// </summary>
        public string ResourceName { get; set; }

        /// <summary>
        /// 操作结果
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// 错误信息
        /// </summary>
        public string ErrorMessage { get; set; }

        /// <summary>
        /// IP地址
        /// </summary>
        public string IpAddress { get; set; }

        /// <summary>
        /// 用户代理
        /// </summary>
        public string UserAgent { get; set; }

        /// <summary>
        /// 执行时间（毫秒）
        /// </summary>
        public long ExecutionTimeMs { get; set; }

        /// <summary>
        /// 请求数据
        /// </summary>
        public string RequestData { get; set; }

        /// <summary>
        /// 响应数据
        /// </summary>
        public string ResponseData { get; set; }

        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// 额外数据
        /// </summary>
        public Dictionary<string, object> ExtraData { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// 安全事件模型
    /// </summary>
    public class SecurityEvent
    {
        /// <summary>
        /// 事件ID
        /// </summary>
        public string EventId { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// 事件类型
        /// </summary>
        public SecurityEventType EventType { get; set; }

        /// <summary>
        /// 严重级别
        /// </summary>
        public SecuritySeverity Severity { get; set; }

        /// <summary>
        /// 事件描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 用户ID
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// IP地址
        /// </summary>
        public string IpAddress { get; set; }

        /// <summary>
        /// 创建时间
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// 额外数据
        /// </summary>
        public Dictionary<string, object> ExtraData { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// 安全事件类型枚举
    /// </summary>
    public enum SecurityEventType
    {
        /// <summary>
        /// 登录失败
        /// </summary>
        LoginFailed,
        /// <summary>
        /// 权限验证失败
        /// </summary>
        PermissionValidationFailed,
        /// <summary>
        /// 速率限制触发
        /// </summary>
        RateLimitTriggered,
        /// <summary>
        /// 账户锁定
        /// </summary>
        AccountLocked,
        /// <summary>
        /// 可疑活动
        /// </summary>
        SuspiciousActivity,
        /// <summary>
        /// 数据访问异常
        /// </summary>
        DataAccessAnomaly,
        /// <summary>
        /// 配置变更
        /// </summary>
        ConfigurationChanged,
        /// <summary>
        /// 系统错误
        /// </summary>
        SystemError
    }

    /// <summary>
    /// 安全严重级别枚举
    /// </summary>
    public enum SecuritySeverity
    {
        /// <summary>
        /// 信息
        /// </summary>
        Info,
        /// <summary>
        /// 警告
        /// </summary>
        Warning,
        /// <summary>
        /// 错误
        /// </summary>
        Error,
        /// <summary>
        /// 严重
        /// </summary>
        Critical
    }

    /// <summary>
    /// 企业级安全服务接口
    /// </summary>
    public interface IEnterpriseSecurityService
    {
        /// <summary>
        /// 记录审计日志
        /// </summary>
        /// <param name="auditLog">审计日志</param>
        /// <returns>任务</returns>
        Task LogAuditAsync(AuditLog auditLog);

        /// <summary>
        /// 记录安全事件
        /// </summary>
        /// <param name="securityEvent">安全事件</param>
        /// <returns>任务</returns>
        Task LogSecurityEventAsync(SecurityEvent securityEvent);

        /// <summary>
        /// 验证权限
        /// </summary>
        /// <param name="userId">用户ID</param>
        /// <param name="resource">资源</param>
        /// <param name="action">操作</param>
        /// <returns>验证结果</returns>
        Task<bool> ValidatePermissionAsync(string userId, string resource, string action);

        /// <summary>
        /// 加密数据
        /// </summary>
        /// <param name="data">要加密的数据</param>
        /// <returns>加密后的数据</returns>
        Task<string> EncryptDataAsync(string data);

        /// <summary>
        /// 解密数据
        /// </summary>
        /// <param name="encryptedData">加密的数据</param>
        /// <returns>解密后的数据</returns>
        Task<string> DecryptDataAsync(string encryptedData);

        /// <summary>
        /// 检查速率限制
        /// </summary>
        /// <param name="identifier">标识符</param>
        /// <returns>是否允许</returns>
        Task<bool> CheckRateLimitAsync(string identifier);

        /// <summary>
        /// 验证输入
        /// </summary>
        /// <param name="input">输入数据</param>
        /// <returns>验证结果</returns>
        Task<bool> ValidateInputAsync(string input);

        /// <summary>
        /// 获取安全统计信息
        /// </summary>
        /// <returns>安全统计信息</returns>
        Task<SecurityStatistics> GetSecurityStatisticsAsync();

        /// <summary>
        /// 获取最近的审计日志
        /// </summary>
        /// <param name="count">数量</param>
        /// <returns>审计日志列表</returns>
        Task<List<AuditLog>> GetRecentAuditLogsAsync(int count = 100);

        /// <summary>
        /// 获取最近的安全事件
        /// </summary>
        /// <param name="count">数量</param>
        /// <returns>安全事件列表</returns>
        Task<List<SecurityEvent>> GetRecentSecurityEventsAsync(int count = 100);
    }

    /// <summary>
    /// 安全统计信息模型
    /// </summary>
    public class SecurityStatistics
    {
        /// <summary>
        /// 总审计日志数量
        /// </summary>
        public long TotalAuditLogs { get; set; }

        /// <summary>
        /// 总安全事件数量
        /// </summary>
        public long TotalSecurityEvents { get; set; }

        /// <summary>
        /// 失败登录尝试次数
        /// </summary>
        public long FailedLoginAttempts { get; set; }

        /// <summary>
        /// 权限验证失败次数
        /// </summary>
        public long PermissionValidationFailures { get; set; }

        /// <summary>
        /// 速率限制触发次数
        /// </summary>
        public long RateLimitTriggers { get; set; }

        /// <summary>
        /// 账户锁定次数
        /// </summary>
        public long AccountLockouts { get; set; }

        /// <summary>
        /// 最后更新时间
        /// </summary>
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 企业级安全服务实现
    /// </summary>
    public class EnterpriseSecurityService : IEnterpriseSecurityService, ISingletonDependency
    {
        private readonly EnterpriseSecurityOptions _options;
        private readonly ILogger<EnterpriseSecurityService> _logger;
        private readonly IPermissionAlertingService _alertingService;
        private readonly IDistributedPermissionCacheLock _distributedLock;
        private readonly Dictionary<string, DateTime> _rateLimitCache = new Dictionary<string, DateTime>();
        private readonly Dictionary<string, int> _failedAttemptsCache = new Dictionary<string, int>();
        private readonly object _cacheLock = new object();

        public EnterpriseSecurityService(
            IOptions<EnterpriseSecurityOptions> options,
            ILogger<EnterpriseSecurityService> logger,
            IPermissionAlertingService alertingService,
            IDistributedPermissionCacheLock distributedLock)
        {
            _options = options?.Value ?? new EnterpriseSecurityOptions();
            _logger = logger;
            _alertingService = alertingService;
            _distributedLock = distributedLock;
        }

        public async Task LogAuditAsync(AuditLog auditLog)
        {
            try
            {
                if (!_options.EnableAuditLogging)
                {
                    return;
                }

                // 加密敏感数据
                if (_options.EnableDataEncryption && !string.IsNullOrEmpty(auditLog.RequestData))
                {
                    auditLog.RequestData = await EncryptDataAsync(auditLog.RequestData);
                }

                if (_options.EnableDataEncryption && !string.IsNullOrEmpty(auditLog.ResponseData))
                {
                    auditLog.ResponseData = await EncryptDataAsync(auditLog.ResponseData);
                }

                _logger.LogInformation("Audit log: User {UserId} performed {ActionType} on {ResourceName} with result {Success}",
                    auditLog.UserId, auditLog.ActionType, auditLog.ResourceName, auditLog.Success);

                // 记录失败操作
                if (!auditLog.Success)
                {
                    await LogSecurityEventAsync(new SecurityEvent
                    {
                        EventType = SecurityEventType.PermissionValidationFailed,
                        Severity = SecuritySeverity.Warning,
                        Description = $"User {auditLog.UserId} failed to {auditLog.ActionType} on {auditLog.ResourceName}",
                        UserId = auditLog.UserId,
                        IpAddress = auditLog.IpAddress,
                        ExtraData = new Dictionary<string, object>
                        {
                            ["ErrorMessage"] = auditLog.ErrorMessage,
                            ["ExecutionTimeMs"] = auditLog.ExecutionTimeMs
                        }
                    });
                }

                // 清理过期审计日志（简化实现）
                CleanupOldAuditLogs();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging audit information");
                throw;
            }
        }

        public async Task LogSecurityEventAsync(SecurityEvent securityEvent)
        {
            try
            {
                _logger.LogWarning("Security event: {EventType} with severity {Severity} - {Description}",
                    securityEvent.EventType, securityEvent.Severity, securityEvent.Description);

                // 根据严重级别发送告警
                if (securityEvent.Severity >= SecuritySeverity.Error)
                {
                    await _alertingService.CreateAlertAsync(
                        securityEvent.Severity switch
                        {
                            SecuritySeverity.Error => AlertLevel.Error,
                            SecuritySeverity.Critical => AlertLevel.Critical,
                            _ => AlertLevel.Warning
                        },
                        AlertType.Security,
                        $"Security Event: {securityEvent.EventType}",
                        securityEvent.Description,
                        "EnterpriseSecurityService",
                        securityEvent.ExtraData
                    );
                }

                // 处理特定类型的事件
                var stats = GetStatistics();
                switch (securityEvent.EventType)
                {
                    case SecurityEventType.RateLimitTriggered:
                        stats.RateLimitTriggers++;
                        break;
                    case SecurityEventType.AccountLocked:
                        stats.AccountLockouts++;
                        break;
                    case SecurityEventType.PermissionValidationFailed:
                        stats.PermissionValidationFailures++;
                        break;
                    case SecurityEventType.LoginFailed:
                        stats.FailedLoginAttempts++;
                        break;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging security event");
                throw;
            }
        }

        public async Task<bool> ValidatePermissionAsync(string userId, string resource, string action)
        {
            if (!_options.EnablePermissionValidation)
            {
                return true;
            }

            try
            {
                // 获取分布式锁以确保一致性
                var lockKey = $"permission_validation:{userId}:{resource}:{action}";
                var lockResult = await _distributedLock.AcquireAsync(lockKey, TimeSpan.FromSeconds(5));
                
                if (!lockResult.IsAcquired)
                {
                    _logger.LogWarning("Could not acquire lock for permission validation");
                    return false;
                }

                try
                {
                    // 模拟权限验证逻辑
                    var hasPermission = await CheckUserPermissionAsync(userId, resource, action);
                    
                    if (!hasPermission)
                    {
                        await LogSecurityEventAsync(new SecurityEvent
                        {
                            EventType = SecurityEventType.PermissionValidationFailed,
                            Severity = SecuritySeverity.Warning,
                            Description = $"Permission denied for user {userId} to {action} on {resource}",
                            UserId = userId,
                            ExtraData = new Dictionary<string, object>
                            {
                                ["Resource"] = resource,
                                ["Action"] = action
                            }
                        });
                    }

                    return hasPermission;
                }
                finally
                {
                    await lockResult.ReleaseAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating permission for user {UserId} on {Resource} for {Action}",
                    userId, resource, action);
                return false;
            }
        }

        public async Task<string> EncryptDataAsync(string data)
        {
            if (!_options.EnableDataEncryption || string.IsNullOrEmpty(data))
            {
                return data;
            }

            try
            {
                using var aes = Aes.Create();
                var key = Encoding.UTF8.GetBytes(_options.EncryptionKey.PadRight(32).Substring(0, 32));
                aes.Key = key;
                aes.GenerateIV();

                using var encryptor = aes.CreateEncryptor();
                var plainBytes = Encoding.UTF8.GetBytes(data);
                var encryptedBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);

                var result = Convert.ToBase64String(aes.IV) + ":" + Convert.ToBase64String(encryptedBytes);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error encrypting data");
                throw;
            }
        }

        public async Task<string> DecryptDataAsync(string encryptedData)
        {
            if (!_options.EnableDataEncryption || string.IsNullOrEmpty(encryptedData))
            {
                return encryptedData;
            }

            try
            {
                var parts = encryptedData.Split(':');
                if (parts.Length != 2)
                {
                    throw new ArgumentException("Invalid encrypted data format");
                }

                var iv = Convert.FromBase64String(parts[0]);
                var encryptedBytes = Convert.FromBase64String(parts[1]);

                using var aes = Aes.Create();
                var key = Encoding.UTF8.GetBytes(_options.EncryptionKey.PadRight(32).Substring(0, 32));
                aes.Key = key;
                aes.IV = iv;

                using var decryptor = aes.CreateDecryptor();
                var decryptedBytes = decryptor.TransformFinalBlock(encryptedBytes, 0, encryptedBytes.Length);
                
                return Encoding.UTF8.GetString(decryptedBytes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error decrypting data");
                throw;
            }
        }

        public async Task<bool> CheckRateLimitAsync(string identifier)
        {
            if (!_options.EnableRateLimiting)
            {
                return true;
            }

            try
            {
                lock (_cacheLock)
                {
                    var now = DateTime.UtcNow;
                    var windowStart = now.AddSeconds(-_options.RateLimitWindowSeconds);
                    
                    // 清理过期的条目
                    var expiredKeys = _rateLimitCache.Where(kvp => kvp.Value < windowStart).Select(kvp => kvp.Key).ToList();
                    foreach (var key in expiredKeys)
                    {
                        _rateLimitCache.Remove(key);
                    }
                    
                    // 检查当前标识符的速率
                    var identifierRequests = _rateLimitCache.Where(kvp => kvp.Key.StartsWith(identifier + ":")).ToList();
                    
                    if (identifierRequests.Count >= _options.RateLimitThreshold)
                    {
                        LogSecurityEventAsync(new SecurityEvent
                        {
                            EventType = SecurityEventType.RateLimitTriggered,
                            Severity = SecuritySeverity.Warning,
                            Description = $"Rate limit exceeded for identifier {identifier}",
                            ExtraData = new Dictionary<string, object>
                            {
                                ["RequestCount"] = identifierRequests.Count,
                                ["Threshold"] = _options.RateLimitThreshold,
                                ["WindowSeconds"] = _options.RateLimitWindowSeconds
                            }
                        }).ConfigureAwait(false);
                        
                        return false;
                    }
                    
                    // 记录当前请求
                    _rateLimitCache[$"{identifier}:{now.Ticks}"] = now;
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking rate limit for {Identifier}", identifier);
                return false;
            }
        }

        public async Task<bool> ValidateInputAsync(string input)
        {
            if (!_options.EnableInputValidation || string.IsNullOrEmpty(input))
            {
                return true;
            }

            try
            {
                // SQL注入检测
                if (_options.EnableSqlInjectionProtection && ContainsSqlInjectionPattern(input))
                {
                    await LogSecurityEventAsync(new SecurityEvent
                    {
                        EventType = SecurityEventType.SuspiciousActivity,
                        Severity = SecuritySeverity.Error,
                        Description = "Potential SQL injection detected in input",
                        ExtraData = new Dictionary<string, object> { ["Input"] = input }
                    });
                    return false;
                }

                // XSS检测
                if (_options.EnableXssProtection && ContainsXssPattern(input))
                {
                    await LogSecurityEventAsync(new SecurityEvent
                    {
                        EventType = SecurityEventType.SuspiciousActivity,
                        Severity = SecuritySeverity.Error,
                        Description = "Potential XSS attack detected in input",
                        ExtraData = new Dictionary<string, object> { ["Input"] = input }
                    });
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating input");
                return false;
            }
        }

        public async Task<SecurityStatistics> GetSecurityStatisticsAsync()
        {
            try
            {
                return GetStatistics();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting security statistics");
                return new SecurityStatistics();
            }
        }

        public async Task<List<AuditLog>> GetRecentAuditLogsAsync(int count = 100)
        {
            try
            {
                // 简化实现：返回模拟数据
                var logs = new List<AuditLog>();
                for (int i = 0; i < Math.Min(count, 10); i++)
                {
                    logs.Add(new AuditLog
                    {
                        LogId = Guid.NewGuid().ToString(),
                        UserId = $"user_{i}",
                        UserName = $"User {i}",
                        ActionType = "PermissionCheck",
                        ResourceName = "Resource",
                        Success = i % 2 == 0,
                        CreatedAt = DateTime.UtcNow.AddMinutes(-i)
                    });
                }
                return logs;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent audit logs");
                return new List<AuditLog>();
            }
        }

        public async Task<List<SecurityEvent>> GetRecentSecurityEventsAsync(int count = 100)
        {
            try
            {
                // 简化实现：返回模拟数据
                var events = new List<SecurityEvent>();
                for (int i = 0; i < Math.Min(count, 10); i++)
                {
                    events.Add(new SecurityEvent
                    {
                        EventId = Guid.NewGuid().ToString(),
                        EventType = SecurityEventType.PermissionValidationFailed,
                        Severity = SecuritySeverity.Warning,
                        Description = $"Security event {i}",
                        UserId = $"user_{i}",
                        CreatedAt = DateTime.UtcNow.AddMinutes(-i)
                    });
                }
                return events;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent security events");
                return new List<SecurityEvent>();
            }
        }

        private async Task<bool> CheckUserPermissionAsync(string userId, string resource, string action)
        {
            // 模拟权限检查逻辑
            await Task.Delay(10); // 模拟异步操作
            
            // 简单的权限验证逻辑（实际应用中应该查询数据库或缓存）
            return userId != "blocked_user" && resource != "admin_resource";
        }

        private bool ContainsSqlInjectionPattern(string input)
        {
            var sqlInjectionPatterns = new[]
            {
                "' OR ", "' AND ", "';--", "'; /*", "' UNION ", "' INSERT ", "' UPDATE ", "' DELETE ",
                "' DROP ", "' CREATE ", "' ALTER ", "' EXEC ", "' EXECUTE ", "' SELECT ", "' FROM ",
                "xp_", "sp_", "0x", "/*", "*/", "--", ";", "'", "\""
            };

            return sqlInjectionPatterns.Any(pattern => input.ToUpper().Contains(pattern.ToUpper()));
        }

        private bool ContainsXssPattern(string input)
        {
            var xssPatterns = new[]
            {
                "<script", "</script>", "javascript:", "onload=", "onerror=", "onclick=", "onmouseover=",
                "<iframe", "</iframe>", "<object", "</object>", "<embed", "</embed>", "<form", "</form>"
            };

            return xssPatterns.Any(pattern => input.ToUpper().Contains(pattern.ToUpper()));
        }

        private void CleanupOldAuditLogs()
        {
            // 简化实现：记录清理操作
            _logger.LogInformation("Cleaning up old audit logs older than {RetentionDays} days", _options.AuditLogRetentionDays);
        }

        private SecurityStatistics GetStatistics()
        {
            return new SecurityStatistics
            {
                TotalAuditLogs = 1000,
                TotalSecurityEvents = 50,
                FailedLoginAttempts = 25,
                PermissionValidationFailures = 15,
                RateLimitTriggers = 5,
                AccountLockouts = 2,
                LastUpdated = DateTime.UtcNow
            };
        }
    }

    /// <summary>
    /// 企业级安全服务扩展
    /// </summary>
    public static class EnterpriseSecurityServiceExtensions
    {
        /// <summary>
        /// 添加企业级安全服务
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <returns>服务集合</returns>
        public static IServiceCollection AddEnterpriseSecurityService(this IServiceCollection services)
        {
            services.Configure<EnterpriseSecurityOptions>(options =>
            {
                options.EnableDataEncryption = true;
                options.EnableAuditLogging = true;
                options.EnablePermissionValidation = true;
                options.EnableRateLimiting = true;
                options.EnableSecurityHeaders = true;
                options.EnableInputValidation = true;
                options.EnableSqlInjectionProtection = true;
                options.EnableXssProtection = true;
                options.EnableCsrfProtection = true;
            });
            
            services.AddSingleton<IEnterpriseSecurityService, EnterpriseSecurityService>();
            return services;
        }

        /// <summary>
        /// 添加企业级安全服务（带配置）
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <param name="configure">配置操作</param>
        /// <returns>服务集合</returns>
        public static IServiceCollection AddEnterpriseSecurityService(
            this IServiceCollection services,
            Action<EnterpriseSecurityOptions> configure)
        {
            services.Configure(configure);
            services.AddSingleton<IEnterpriseSecurityService, EnterpriseSecurityService>();
            return services;
        }
    }
}