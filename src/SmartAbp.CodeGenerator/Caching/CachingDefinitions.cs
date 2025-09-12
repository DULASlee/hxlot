using System;
using System.Collections.Generic;
using System.Threading;
using JetBrains.Annotations;

namespace SmartAbp.CodeGenerator.Caching
{
    /// <summary>
    /// Definition for distributed caching solution
    /// </summary>
    public sealed class CachingDefinition
    {
        [PublicAPI]
        public string ModuleName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Namespace { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<CacheStrategyDefinition> CacheStrategies { get; set; } = new List<CacheStrategyDefinition>();
        
        [PublicAPI]
        public CachingConfiguration Configuration { get; set; } = new();
    }
    
    /// <summary>
    /// Cache strategy definition
    /// </summary>
    public sealed class CacheStrategyDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public CacheType Type { get; set; } = CacheType.Redis;
        
        [PublicAPI]
        public TimeSpan DefaultExpiry { get; set; } = TimeSpan.FromMinutes(30);
        
        [PublicAPI]
        public CachePattern Pattern { get; set; } = CachePattern.CacheAside;
    }
    
    /// <summary>
    /// Caching configuration
    /// </summary>
    public sealed class CachingConfiguration
    {
        [PublicAPI]
        public string RedisConnectionString { get; set; } = string.Empty;
        
        [PublicAPI]
        public TimeSpan DefaultExpiry { get; set; } = TimeSpan.FromMinutes(30);
        
        [PublicAPI]
        public bool EnableCompression { get; set; } = true;
        
        [PublicAPI]
        public bool EnableDistributedEvents { get; set; } = true;
    }
    
    /// <summary>
    /// Generated caching solution result
    /// </summary>
    public sealed class GeneratedCachingSolution
    {
        [PublicAPI]
        public string ModuleName { get; set; } = string.Empty;
        
        [PublicAPI]
        public IDictionary<string, string> Files { get; set; } = new Dictionary<string, string>();
        
        [PublicAPI]
        public int CacheStrategyCount { get; set; }
        
        [PublicAPI]
        public DateTime GeneratedAt { get; set; }
    }
    
    /// <summary>
    /// Cache statistics for monitoring
    /// </summary>
    public sealed class CacheStatistics
    {
        private long _hits;
        private long _misses;
        private long _sets;
        private long _deletes;
        private long _errors;
        private long _totalLatencyTicks;
        private long _operationCount;
        
        public long Hits => _hits;
        public long Misses => _misses;
        public long Sets => _sets;
        public long Deletes => _deletes;
        public long Errors => _errors;
        
        public double HitRatio => _hits + _misses > 0 ? (double)_hits / (_hits + _misses) : 0;
        public TimeSpan AverageLatency => _operationCount > 0 ? TimeSpan.FromTicks(_totalLatencyTicks / _operationCount) : TimeSpan.Zero;
        
        public void IncrementHits() => Interlocked.Increment(ref _hits);
        public void IncrementMisses() => Interlocked.Increment(ref _misses);
        public void IncrementSets() => Interlocked.Increment(ref _sets);
        public void IncrementDeletes() => Interlocked.Increment(ref _deletes);
        public void IncrementErrors() => Interlocked.Increment(ref _errors);
        
        public void AddLatency(TimeSpan latency)
        {
            Interlocked.Add(ref _totalLatencyTicks, latency.Ticks);
            Interlocked.Increment(ref _operationCount);
        }
        
        public CacheStatistics Clone() => new()
        {
            _hits = _hits,
            _misses = _misses,
            _sets = _sets,
            _deletes = _deletes,
            _errors = _errors,
            _totalLatencyTicks = _totalLatencyTicks,
            _operationCount = _operationCount
        };
    }
    
    /// <summary>
    /// Cache type enumeration
    /// </summary>
    public enum CacheType
    {
        Memory,
        Redis,
        Hybrid,
        Distributed
    }
    
    /// <summary>
    /// Cache pattern enumeration
    /// </summary>
    public enum CachePattern
    {
        CacheAside,
        WriteThrough,
        WriteBack,
        RefreshAhead
    }
}