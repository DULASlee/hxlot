using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Permissions.Configuration
{
    /// <summary>
    /// 企业级配置选项
    /// </summary>
    public class PermissionConfigurationOptions
    {
        /// <summary>
        /// 是否启用动态配置更新
        /// </summary>
        public bool EnableDynamicConfiguration { get; set; } = true;

        /// <summary>
        /// 配置更新间隔（秒）
        /// </summary>
        public int ConfigurationUpdateIntervalSeconds { get; set; } = 300; // 5分钟

        /// <summary>
        /// 配置缓存过期时间（分钟）
        /// </summary>
        public int ConfigurationCacheExpirationMinutes { get; set; } = 60;

        /// <summary>
        /// 配置验证间隔（秒）
        /// </summary>
        public int ConfigurationValidationIntervalSeconds { get; set; } = 3600; // 1小时

        /// <summary>
        /// 是否启用配置热重载
        /// </summary>
        public bool EnableConfigurationHotReload { get; set; } = true;

        /// <summary>
        /// 配置变更通知方式
        /// </summary>
        public ConfigurationNotificationType NotificationType { get; set; } = ConfigurationNotificationType.Log;

        /// <summary>
        /// 配置存储类型
        /// </summary>
        public ConfigurationStorageType StorageType { get; set; } = ConfigurationStorageType.File;
    }

    /// <summary>
    /// 配置通知类型
    /// </summary>
    public enum ConfigurationNotificationType
    {
        Log,
        Email,
        Webhook,
        All
    }

    /// <summary>
    /// 配置存储类型
    /// </summary>
    public enum ConfigurationStorageType
    {
        File,
        Database,
        Redis,
        Consul,
        AzureKeyVault
    }

    /// <summary>
    /// 配置变更事件参数
    /// </summary>
    public class ConfigurationChangedEventArgs : EventArgs
    {
        /// <summary>
        /// 变更的配置项
        /// </summary>
        public string ConfigurationKey { get; set; }

        /// <summary>
        /// 旧值
        /// </summary>
        public string OldValue { get; set; }

        /// <summary>
        /// 新值
        /// </summary>
        public string NewValue { get; set; }

        /// <summary>
        /// 变更时间
        /// </summary>
        public DateTime ChangeTime { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// 变更来源
        /// </summary>
        public string ChangeSource { get; set; }
    }

    /// <summary>
    /// 配置验证结果
    /// </summary>
    public class ConfigurationValidationResult
    {
        /// <summary>
        /// 是否有效
        /// </summary>
        public bool IsValid { get; set; }

        /// <summary>
        /// 错误消息
        /// </summary>
        public List<string> Errors { get; set; } = new List<string>();

        /// <summary>
        /// 警告消息
        /// </summary>
        public List<string> Warnings { get; set; } = new List<string>();

        /// <summary>
        /// 验证时间
        /// </summary>
        public DateTime ValidationTime { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 企业级配置服务接口
    /// </summary>
    public interface IPermissionConfigurationService
    {
        /// <summary>
        /// 获取配置值
        /// </summary>
        /// <typeparam name="T">配置值类型</typeparam>
        /// <param name="key">配置键</param>
        /// <param name="defaultValue">默认值</param>
        /// <returns>配置值</returns>
        T GetValue<T>(string key, T defaultValue = default);

        /// <summary>
        /// 设置配置值
        /// </summary>
        /// <typeparam name="T">配置值类型</typeparam>
        /// <param name="key">配置键</param>
        /// <param name="value">配置值</param>
        Task SetValueAsync<T>(string key, T value);

        /// <summary>
        /// 获取配置节
        /// </summary>
        /// <param name="section">配置节名称</param>
        /// <returns>配置节</returns>
        IConfigurationSection GetSection(string section);

        /// <summary>
        /// 重新加载配置
        /// </summary>
        Task ReloadAsync();

        /// <summary>
        /// 验证配置
        /// </summary>
        Task<ConfigurationValidationResult> ValidateAsync();

        /// <summary>
        /// 获取所有配置键
        /// </summary>
        /// <returns>配置键列表</returns>
        IEnumerable<string> GetAllKeys();

        /// <summary>
        /// 订阅配置变更事件
        /// </summary>
        /// <param name="handler">事件处理器</param>
        IDisposable SubscribeToChanges(EventHandler<ConfigurationChangedEventArgs> handler);

        /// <summary>
        /// 获取配置变更历史
        /// </summary>
        /// <param name="timeWindow">时间窗口</param>
        /// <returns>配置变更历史</returns>
        Task<IEnumerable<ConfigurationChangedEventArgs>> GetConfigurationHistoryAsync(TimeSpan timeWindow);
    }

    /// <summary>
    /// 企业级配置服务实现
    /// </summary>
    public class PermissionConfigurationService : IPermissionConfigurationService, ISingletonDependency
    {
        private readonly IConfiguration _configuration;
        private readonly PermissionConfigurationOptions _options;
        private readonly ILogger<PermissionConfigurationService> _logger;
        private readonly Dictionary<string, object> _configurationCache = new Dictionary<string, object>();
        private readonly List<ConfigurationChangedEventArgs> _configurationHistory = new List<ConfigurationChangedEventArgs>();
        private EventHandler<ConfigurationChangedEventArgs> _configurationChanged;
        private readonly object _lockObject = new object();

        public PermissionConfigurationService(
            IConfiguration configuration,
            IOptions<PermissionConfigurationOptions> options,
            ILogger<PermissionConfigurationService> logger)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _options = options?.Value ?? new PermissionConfigurationOptions();
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public T GetValue<T>(string key, T defaultValue = default)
        {
            try
            {
                lock (_lockObject)
                {
                    // 检查缓存
                    if (_configurationCache.TryGetValue(key, out var cachedValue))
                    {
                        if (cachedValue is T typedValue)
                        {
                            return typedValue;
                        }
                    }

                    // 从配置获取值
                    var value = _configuration.GetValue<T>(key, defaultValue);
                    
                    // 缓存值
                    _configurationCache[key] = value;
                    
                    return value;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting configuration value for key: {Key}", key);
                return defaultValue;
            }
        }

        public async Task SetValueAsync<T>(string key, T value)
        {
            try
            {
                lock (_lockObject)
                {
                    var oldValue = GetValue<T>(key, default(T));
                    
                    // 更新缓存
                    _configurationCache[key] = value;
                    
                    // 记录配置变更历史
                    var changeEvent = new ConfigurationChangedEventArgs
                    {
                        ConfigurationKey = key,
                        OldValue = oldValue?.ToString(),
                        NewValue = value?.ToString(),
                        ChangeSource = "Application"
                    };
                    
                    _configurationHistory.Add(changeEvent);
                    
                    // 保持历史记录在合理范围内
                    if (_configurationHistory.Count > 1000)
                    {
                        _configurationHistory.RemoveAt(0);
                    }
                    
                    // 触发配置变更事件
                    OnConfigurationChanged(changeEvent);
                    
                    _logger.LogInformation("Configuration value set: Key={Key}, OldValue={OldValue}, NewValue={NewValue}", 
                        key, oldValue, value);
                }
                
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting configuration value for key: {Key}", key);
                throw;
            }
        }

        public IConfigurationSection GetSection(string section)
        {
            try
            {
                return _configuration.GetSection(section);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting configuration section: {Section}", section);
                throw;
            }
        }

        public async Task ReloadAsync()
        {
            try
            {
                lock (_lockObject)
                {
                    // 清除缓存
                    _configurationCache.Clear();
                    
                    // 重新加载配置
                    if (_configuration is IConfigurationRoot configurationRoot)
                    {
                        configurationRoot.Reload();
                    }
                    
                    _logger.LogInformation("Configuration reloaded successfully");
                }
                
                await Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reloading configuration");
                throw;
            }
        }

        public async Task<ConfigurationValidationResult> ValidateAsync()
        {
            try
            {
                var result = new ConfigurationValidationResult();
                
                // 验证分布式锁配置
                ValidateDistributedLockConfiguration(result);
                
                // 验证性能监控配置
                ValidatePerformanceMonitoringConfiguration(result);
                
                // 验证内存管理配置
                ValidateMemoryManagementConfiguration(result);
                
                // 验证缓存配置
                ValidateCacheConfiguration(result);
                
                result.IsValid = result.Errors.Count == 0;
                
                _logger.LogInformation("Configuration validation completed: Valid={Valid}, Errors={ErrorCount}, Warnings={WarningCount}", 
                    result.IsValid, result.Errors.Count, result.Warnings.Count);
                
                return await Task.FromResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating configuration");
                return new ConfigurationValidationResult 
                { 
                    IsValid = false, 
                    Errors = new List<string> { "Configuration validation failed: " + ex.Message } 
                };
            }
        }

        public IEnumerable<string> GetAllKeys()
        {
            try
            {
                var keys = new List<string>();
                GetAllKeysRecursive(_configuration, keys, "");
                return keys;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all configuration keys");
                return Enumerable.Empty<string>();
            }
        }

        public IDisposable SubscribeToChanges(EventHandler<ConfigurationChangedEventArgs> handler)
        {
            _configurationChanged += handler;
            return new ConfigurationChangeSubscription(this, handler);
        }

        public async Task<IEnumerable<ConfigurationChangedEventArgs>> GetConfigurationHistoryAsync(TimeSpan timeWindow)
        {
            try
            {
                var cutoffTime = DateTime.UtcNow - timeWindow;
                
                lock (_lockObject)
                {
                    return _configurationHistory
                        .Where(e => e.ChangeTime >= cutoffTime)
                        .OrderByDescending(e => e.ChangeTime)
                        .ToList();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting configuration history");
                return Enumerable.Empty<ConfigurationChangedEventArgs>();
            }
        }

        /// <summary>
        /// 递归获取所有配置键
        /// </summary>
        private void GetAllKeysRecursive(IConfiguration configuration, List<string> keys, string parentPath)
        {
            foreach (var child in configuration.GetChildren())
            {
                var key = string.IsNullOrEmpty(parentPath) ? child.Key : $"{parentPath}:{child.Key}";
                
                if (child.GetChildren().Any())
                {
                    GetAllKeysRecursive(child, keys, key);
                }
                else
                {
                    keys.Add(key);
                }
            }
        }

        /// <summary>
        /// 验证分布式锁配置
        /// </summary>
        private void ValidateDistributedLockConfiguration(ConfigurationValidationResult result)
        {
            var timeout = GetValue<int>("DistributedLocking:Timeout", 10);
            if (timeout <= 0)
            {
                result.Errors.Add("Distributed locking timeout must be greater than 0");
            }
            
            var connectionString = GetValue<string>("DistributedLocking:ConnectionString", "");
            if (string.IsNullOrEmpty(connectionString))
            {
                result.Warnings.Add("Distributed locking connection string is not configured");
            }
        }

        /// <summary>
        /// 验证性能监控配置
        /// </summary>
        private void ValidatePerformanceMonitoringConfiguration(ConfigurationValidationResult result)
        {
            var threshold = GetValue<double>("PermissionPerformanceMonitoring:PerformanceThresholdMs", 100);
            if (threshold <= 0)
            {
                result.Errors.Add("Performance threshold must be greater than 0");
            }
            
            var errorRate = GetValue<double>("PermissionPerformanceMonitoring:ErrorRateThreshold", 5);
            if (errorRate < 0 || errorRate > 100)
            {
                result.Errors.Add("Error rate threshold must be between 0 and 100");
            }
        }

        /// <summary>
        /// 验证内存管理配置
        /// </summary>
        private void ValidateMemoryManagementConfiguration(ConfigurationValidationResult result)
        {
            var warningThreshold = GetValue<long>("MemoryManagement:MemoryWarningThresholdMB", 512);
            var criticalThreshold = GetValue<long>("MemoryManagement:MemoryCriticalThresholdMB", 1024);
            
            if (warningThreshold >= criticalThreshold)
            {
                result.Errors.Add("Memory warning threshold must be less than critical threshold");
            }
            
            if (warningThreshold <= 0)
            {
                result.Errors.Add("Memory warning threshold must be greater than 0");
            }
        }

        /// <summary>
        /// 验证缓存配置
        /// </summary>
        private void ValidateCacheConfiguration(ConfigurationValidationResult result)
        {
            var cacheExpiration = GetValue<int>("PermissionCaching:CacheExpirationMinutes", 60);
            if (cacheExpiration <= 0)
            {
                result.Errors.Add("Cache expiration must be greater than 0");
            }
            
            var maxCacheSize = GetValue<int>("PermissionCaching:MaxCacheSizeMB", 100);
            if (maxCacheSize <= 0)
            {
                result.Errors.Add("Max cache size must be greater than 0");
            }
        }

        /// <summary>
        /// 触发配置变更事件
        /// </summary>
        private void OnConfigurationChanged(ConfigurationChangedEventArgs e)
        {
            _configurationChanged?.Invoke(this, e);
            
            // 根据通知类型发送通知
            switch (_options.NotificationType)
            {
                case ConfigurationNotificationType.Log:
                    _logger.LogInformation("Configuration changed: {Key} from {OldValue} to {NewValue}", 
                        e.ConfigurationKey, e.OldValue, e.NewValue);
                    break;
                case ConfigurationNotificationType.Email:
                    // TODO: 实现邮件通知
                    break;
                case ConfigurationNotificationType.Webhook:
                    // TODO: 实现Webhook通知
                    break;
                case ConfigurationNotificationType.All:
                    _logger.LogInformation("Configuration changed: {Key} from {OldValue} to {NewValue}", 
                        e.ConfigurationKey, e.OldValue, e.NewValue);
                    // TODO: 实现其他通知方式
                    break;
            }
        }

        /// <summary>
        /// 配置变更订阅
        /// </summary>
        private class ConfigurationChangeSubscription : IDisposable
        {
            private readonly PermissionConfigurationService _service;
            private readonly EventHandler<ConfigurationChangedEventArgs> _handler;

            public ConfigurationChangeSubscription(PermissionConfigurationService service, EventHandler<ConfigurationChangedEventArgs> handler)
            {
                _service = service;
                _handler = handler;
            }

            public void Dispose()
            {
                _service._configurationChanged -= _handler;
            }
        }
    }
}