using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Core;

namespace SmartAbp.CodeGenerator.Caching
{
    /// <summary>
    /// Advanced distributed caching generator with Redis integration
    /// </summary>
    public sealed class DistributedCachingGenerator
    {
        private readonly ILogger<DistributedCachingGenerator> _logger;
        private readonly AdvancedMemoryManager _memoryManager;
        
        public DistributedCachingGenerator(
            ILogger<DistributedCachingGenerator> logger,
            AdvancedMemoryManager memoryManager)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _memoryManager = memoryManager ?? throw new ArgumentNullException(nameof(memoryManager));
        }
        
        public async Task<GeneratedCachingSolution> GenerateCachingSolutionAsync(CachingDefinition definition)
        {
            _logger.LogInformation("Generating distributed caching solution for {ModuleName}", definition.ModuleName);
            
            var files = new Dictionary<string, string>();
            
            // 1. Cache Service Interface
            files["Caching/ICacheService.cs"] = await GenerateCacheServiceInterfaceAsync(definition);
            
            // 2. Redis Implementation
            files["Caching/RedisCacheService.cs"] = await GenerateRedisCacheServiceAsync(definition);
            
            // 3. Hybrid Cache (L1 + L2)
            files["Caching/HybridCacheService.cs"] = await GenerateHybridCacheServiceAsync(definition);
            
            // 4. Cache Configuration
            files["Caching/CachingConfiguration.cs"] = await GenerateCachingConfigurationAsync(definition);
            
            // 5. Cache Extensions
            files["Caching/CachingExtensions.cs"] = await GenerateCachingExtensionsAsync(definition);
            
            return new GeneratedCachingSolution
            {
                ModuleName = definition.ModuleName,
                Files = files,
                CacheStrategyCount = definition.CacheStrategies?.Count ?? 0,
                GeneratedAt = DateTime.UtcNow
            };
        }
        
        private async Task<string> GenerateCacheServiceInterfaceAsync(CachingDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine($@"using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace {definition.Namespace}.Caching
{{
    /// <summary>
    /// High-performance distributed cache service interface
    /// </summary>
    public interface ICacheService
    {{
        Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
        Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default);
        Task RemoveAsync(string key, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default);
        
        Task<IDictionary<string, T?>> GetManyAsync<T>(IEnumerable<string> keys, CancellationToken cancellationToken = default);
        Task SetManyAsync<T>(IDictionary<string, T> keyValues, TimeSpan? expiry = null, CancellationToken cancellationToken = default);
        Task RemoveManyAsync(IEnumerable<string> keys, CancellationToken cancellationToken = default);
        
        Task<T> GetOrSetAsync<T>(string key, Func<CancellationToken, Task<T>> factory, TimeSpan? expiry = null, CancellationToken cancellationToken = default);
        Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default);
        
        Task<CacheStatistics> GetStatisticsAsync(CancellationToken cancellationToken = default);
    }}
}}");
            
            return await Task.FromResult(sb.ToString());
        }
        
        private async Task<string> GenerateRedisCacheServiceAsync(CachingDefinition definition)
        {
            using var code = _memoryManager.GetStringBuilder();
            var sb = code.StringBuilder;
            
            sb.AppendLine($@"using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Diagnostics;

namespace {definition.Namespace}.Caching
{{
    /// <summary>
    /// High-performance Redis cache service implementation
    /// </summary>
    public sealed class RedisCacheService : ICacheService, IDisposable
    {{
        private readonly IDatabase _database;
        private readonly ILogger<RedisCacheService> _logger;
        private readonly CacheStatistics _statistics;
        private readonly ActivitySource _activitySource;
        private volatile bool _disposed;
        
        public RedisCacheService(IConnectionMultiplexer connection, ILogger<RedisCacheService> logger)
        {{
            _database = connection.GetDatabase();
            _logger = logger;
            _statistics = new CacheStatistics();
            _activitySource = new ActivitySource(""RedisCacheService"");
        }}
        
        public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
        {{
            using var activity = _activitySource.StartActivity(""Cache.Get"");
            var stopwatch = Stopwatch.StartNew();
            
            try
            {{
                var value = await _database.StringGetAsync(key);
                if (!value.HasValue)
                {{
                    _statistics.IncrementMisses();
                    return default(T);
                }}
                
                var result = JsonSerializer.Deserialize<T>(value!);
                _statistics.IncrementHits();
                return result;
            }}
            catch (Exception ex)
            {{
                _statistics.IncrementErrors();
                _logger.LogError(ex, ""Error getting cache value for key: {{Key}}"", key);
                return default(T);
            }}
            finally
            {{
                _statistics.AddLatency(stopwatch.Elapsed);
            }}
        }}
        
        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken cancellationToken = default)
        {{
            try
            {{
                var serializedValue = JsonSerializer.Serialize(value);
                await _database.StringSetAsync(key, serializedValue, expiry);
                _statistics.IncrementSets();
            }}
            catch (Exception ex)
            {{
                _statistics.IncrementErrors();
                _logger.LogError(ex, ""Error setting cache value for key: {{Key}}"", key);
                throw;
            }}
        }}
        
        public async Task<T> GetOrSetAsync<T>(string key, Func<CancellationToken, Task<T>> factory, TimeSpan? expiry = null, CancellationToken cancellationToken = default)
        {{
            var cachedValue = await GetAsync<T>(key, cancellationToken);
            if (cachedValue != null) return cachedValue;
            
            var value = await factory(cancellationToken);
            if (value != null)
            {{
                await SetAsync(key, value, expiry, cancellationToken);
            }}
            return value;
        }}
        
        public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
        {{
            await _database.KeyDeleteAsync(key);
            _statistics.IncrementDeletes();
        }}
        
        public async Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
        {{
            return await _database.KeyExistsAsync(key);
        }}
        
        public async Task<CacheStatistics> GetStatisticsAsync(CancellationToken cancellationToken = default)
        {{
            return _statistics.Clone();
        }}
        
        // Additional methods implementation...
        public Task<IDictionary<string, T?>> GetManyAsync<T>(IEnumerable<string> keys, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task SetManyAsync<T>(IDictionary<string, T> keyValues, TimeSpan? expiry = null, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task RemoveManyAsync(IEnumerable<string> keys, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        
        public void Dispose()
        {{
            if (!_disposed)
            {{
                _activitySource?.Dispose();
                _disposed = true;
            }}
        }}
    }}
}}");
            
            return await Task.FromResult(sb.ToString());
        }
        
        private async Task<string> GenerateHybridCacheServiceAsync(CachingDefinition definition) => 
            await Task.FromResult("// Hybrid cache implementation with L1+L2 strategy");
        
        private async Task<string> GenerateCachingConfigurationAsync(CachingDefinition definition) => 
            await Task.FromResult("// Caching configuration classes");
        
        private async Task<string> GenerateCachingExtensionsAsync(CachingDefinition definition) => 
            await Task.FromResult("// Extension methods for caching");
    }
}