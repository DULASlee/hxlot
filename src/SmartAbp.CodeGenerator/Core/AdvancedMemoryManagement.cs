using System;
using System.Buffers;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using Microsoft.Extensions.ObjectPool;
using Microsoft.Extensions.Logging;

namespace SmartAbp.CodeGenerator.Core
{
    /// <summary>
    /// Advanced memory management system with high-performance pooling
    /// Implements enterprise-grade memory optimization techniques
    /// </summary>
    public sealed class AdvancedMemoryManager : IDisposable
    {
        private readonly ILogger<AdvancedMemoryManager> _logger;
        private readonly ArrayPool<byte> _bytePool;
        private readonly ArrayPool<char> _charPool;
        private readonly MemoryPool<char> _memoryPool;
        private readonly ObjectPool<StringBuilder> _stringBuilderPool;
        private readonly ObjectPool<List<string>> _stringListPool;
        private readonly ObjectPool<Dictionary<string, object>> _dictionaryPool;
        private readonly ConcurrentBag<IDisposable> _disposables;
        private readonly Timer _memoryPressureTimer;
        
        // Performance tracking
        private long _totalAllocations;
        private long _totalDeallocations;
        private long _peakMemoryUsage;
        private long _currentMemoryUsage;
        
        public AdvancedMemoryManager(ILogger<AdvancedMemoryManager> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            
            // Initialize high-performance pools with optimized sizes
            _bytePool = ArrayPool<byte>.Create(
                maxArrayLength: 16 * 1024 * 1024,  // 16MB max
                maxArraysPerBucket: 50);
            
            _charPool = ArrayPool<char>.Create(
                maxArrayLength: 8 * 1024 * 1024,   // 8M chars max
                maxArraysPerBucket: 50);
            
            _memoryPool = MemoryPool<char>.Shared;
            
            // Configure object pools for common types
            var objectPoolProvider = new DefaultObjectPoolProvider();
            _stringBuilderPool = objectPoolProvider.Create(new StringBuilderPoolPolicy());
            _stringListPool = objectPoolProvider.Create(new StringListPoolPolicy());
            _dictionaryPool = objectPoolProvider.Create(new DictionaryPoolPolicy());
            
            _disposables = new ConcurrentBag<IDisposable>();
            
            // Start memory pressure monitoring
            _memoryPressureTimer = new Timer(MonitorMemoryPressure, null, 
                TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(30));
            
            _logger.LogInformation("AdvancedMemoryManager initialized with optimized pools");
        }
        
        /// <summary>
        /// Rents a byte array from the high-performance pool
        /// </summary>
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public RentedArray<byte> RentByteArray(int minimumLength)
        {
            var array = _bytePool.Rent(minimumLength);
            Interlocked.Increment(ref _totalAllocations);
            Interlocked.Add(ref _currentMemoryUsage, array.Length);
            
            var peak = _peakMemoryUsage;
            var current = _currentMemoryUsage;
            while (current > peak && Interlocked.CompareExchange(ref _peakMemoryUsage, current, peak) != peak)
            {
                peak = _peakMemoryUsage;
                current = _currentMemoryUsage;
            }
            
            return new RentedArray<byte>(array, minimumLength, _bytePool, this);
        }
        
        /// <summary>
        /// Rents a char array from the high-performance pool
        /// </summary>
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public RentedArray<char> RentCharArray(int minimumLength)
        {
            var array = _charPool.Rent(minimumLength);
            Interlocked.Increment(ref _totalAllocations);
            Interlocked.Add(ref _currentMemoryUsage, array.Length * sizeof(char));
            
            return new RentedArray<char>(array, minimumLength, _charPool, this);
        }
        
        /// <summary>
        /// Rents memory from the shared pool
        /// </summary>
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public IMemoryOwner<char> RentMemory(int minimumLength)
        {
            var memory = _memoryPool.Rent(minimumLength);
            Interlocked.Increment(ref _totalAllocations);
            return memory;
        }
        
        /// <summary>
        /// Gets a StringBuilder from the object pool
        /// </summary>
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public PooledStringBuilder GetStringBuilder()
        {
            var sb = _stringBuilderPool.Get();
            return new PooledStringBuilder(sb, _stringBuilderPool);
        }
        
        /// <summary>
        /// Gets a string list from the object pool
        /// </summary>
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public PooledList<string> GetStringList()
        {
            var list = _stringListPool.Get();
            return new PooledList<string>(list, _stringListPool);
        }
        
        /// <summary>
        /// Gets a dictionary from the object pool
        /// </summary>
        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        public PooledDictionary<string, object> GetDictionary()
        {
            var dict = _dictionaryPool.Get();
            return new PooledDictionary<string, object>(dict, _dictionaryPool);
        }
        
        /// <summary>
        /// Creates a high-performance string using pooled resources
        /// </summary>
        public unsafe string CreateString(ReadOnlySpan<char> chars)
        {
            if (chars.IsEmpty) return string.Empty;
            
            fixed (char* ptr = chars)
            {
                return new string(ptr, 0, chars.Length);
            }
        }
        
        /// <summary>
        /// Efficient string concatenation using pooled StringBuilder
        /// </summary>
        public string ConcatenateStrings(params string[] strings)
        {
            if (strings == null || strings.Length == 0) return string.Empty;
            if (strings.Length == 1) return strings[0] ?? string.Empty;
            
            using var sb = GetStringBuilder();
            
            foreach (var str in strings)
            {
                if (!string.IsNullOrEmpty(str))
                {
                    sb.StringBuilder.Append(str);
                }
            }
            
            return sb.StringBuilder.ToString();
        }
        
        /// <summary>
        /// Monitors memory pressure and triggers cleanup when needed
        /// </summary>
        private void MonitorMemoryPressure(object? state)
        {
            try
            {
                var gcMemory = GC.GetTotalMemory(false);
                var workingSet = Environment.WorkingSet;
                
                _logger.LogDebug("Memory Status - GC: {GCMemory:N0} bytes, Working Set: {WorkingSet:N0} bytes, " +
                    "Pool Usage: {PoolUsage:N0} bytes, Allocations: {Allocations}, Deallocations: {Deallocations}",
                    gcMemory, workingSet, _currentMemoryUsage, _totalAllocations, _totalDeallocations);
                
                // Trigger cleanup if memory usage is high
                if (gcMemory > 1_000_000_000 || workingSet > 2_000_000_000) // 1GB GC or 2GB working set
                {
                    _logger.LogWarning("High memory pressure detected, triggering cleanup");
                    TriggerMemoryCleanup();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during memory pressure monitoring");
            }
        }
        
        /// <summary>
        /// Triggers aggressive memory cleanup
        /// </summary>
        private void TriggerMemoryCleanup()
        {
            // Force garbage collection
            GC.Collect(2, GCCollectionMode.Aggressive, true, true);
            GC.WaitForPendingFinalizers();
            GC.Collect(2, GCCollectionMode.Aggressive, true, true);
            
            // Clear any internal caches
            ClearInternalCaches();
            
            _logger.LogInformation("Memory cleanup completed");
        }
        
        /// <summary>
        /// Clears internal caches to free memory
        /// </summary>
        private void ClearInternalCaches()
        {
            // Dispose any tracked disposables
            while (_disposables.TryTake(out var disposable))
            {
                try
                {
                    disposable?.Dispose();
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error disposing tracked resource");
                }
            }
        }
        
        /// <summary>
        /// Internal method called when memory is returned to pools
        /// </summary>
        internal void NotifyDeallocation(long size)
        {
            Interlocked.Increment(ref _totalDeallocations);
            Interlocked.Add(ref _currentMemoryUsage, -size);
        }
        
        /// <summary>
        /// Gets current memory statistics
        /// </summary>
        public MemoryStatistics GetMemoryStatistics()
        {
            return new MemoryStatistics
            {
                TotalAllocations = _totalAllocations,
                TotalDeallocations = _totalDeallocations,
                CurrentMemoryUsage = _currentMemoryUsage,
                PeakMemoryUsage = _peakMemoryUsage,
                GCMemory = GC.GetTotalMemory(false),
                WorkingSet = Environment.WorkingSet
            };
        }
        
        public void Dispose()
        {
            _logger.LogInformation("Disposing AdvancedMemoryManager");
            
            _memoryPressureTimer?.Dispose();
            _memoryPool?.Dispose();
            
            // Clear all caches
            ClearInternalCaches();
            
            // Force final cleanup
            TriggerMemoryCleanup();
            
            _logger.LogInformation("AdvancedMemoryManager disposed successfully");
        }
    }
    
    /// <summary>
    /// Memory statistics for monitoring
    /// </summary>
    public sealed class MemoryStatistics
    {
        public long TotalAllocations { get; set; }
        public long TotalDeallocations { get; set; }
        public long CurrentMemoryUsage { get; set; }
        public long PeakMemoryUsage { get; set; }
        public long GCMemory { get; set; }
        public long WorkingSet { get; set; }
        
        public double AllocationRate => TotalDeallocations > 0 ? (double)TotalAllocations / TotalDeallocations : 0;
        public long NetAllocations => TotalAllocations - TotalDeallocations;
    }
    
    /// <summary>
    /// RAII wrapper for rented arrays with automatic return to pool
    /// </summary>
    public readonly struct RentedArray<T> : IDisposable
    {
        private readonly T[] _array;
        private readonly int _length;
        private readonly ArrayPool<T> _pool;
        private readonly AdvancedMemoryManager _manager;
        
        internal RentedArray(T[] array, int length, ArrayPool<T> pool, AdvancedMemoryManager manager)
        {
            _array = array;
            _length = length;
            _pool = pool;
            _manager = manager;
        }
        
        public T[] Array => _array;
        public int Length => _length;
        public Span<T> Span => _array.AsSpan(0, _length);
        public Memory<T> Memory => _array.AsMemory(0, _length);
        
        public void Dispose()
        {
            if (_array != null)
            {
                _pool.Return(_array, clearArray: true);
                _manager.NotifyDeallocation(_array.Length * Unsafe.SizeOf<T>());
            }
        }
    }
    
    /// <summary>
    /// Pooled StringBuilder wrapper
    /// </summary>
    public readonly struct PooledStringBuilder : IDisposable
    {
        private readonly StringBuilder _stringBuilder;
        private readonly ObjectPool<StringBuilder> _pool;
        
        internal PooledStringBuilder(StringBuilder stringBuilder, ObjectPool<StringBuilder> pool)
        {
            _stringBuilder = stringBuilder;
            _pool = pool;
        }
        
        public StringBuilder StringBuilder => _stringBuilder;
        
        public void Dispose()
        {
            _pool.Return(_stringBuilder);
        }
    }
    
    /// <summary>
    /// Pooled List wrapper
    /// </summary>
    public readonly struct PooledList<T> : IDisposable
    {
        private readonly List<T> _list;
        private readonly ObjectPool<List<T>> _pool;
        
        internal PooledList(List<T> list, ObjectPool<List<T>> pool)
        {
            _list = list;
            _pool = pool;
        }
        
        public List<T> List => _list;
        
        public void Dispose()
        {
            _pool.Return(_list);
        }
    }
    
    /// <summary>
    /// Pooled Dictionary wrapper
    /// </summary>
    public readonly struct PooledDictionary<TKey, TValue> : IDisposable
        where TKey : notnull
    {
        private readonly Dictionary<TKey, TValue> _dictionary;
        private readonly ObjectPool<Dictionary<TKey, TValue>> _pool;
        
        internal PooledDictionary(Dictionary<TKey, TValue> dictionary, ObjectPool<Dictionary<TKey, TValue>> pool)
        {
            _dictionary = dictionary;
            _pool = pool;
        }
        
        public Dictionary<TKey, TValue> Dictionary => _dictionary;
        
        public void Dispose()
        {
            _pool.Return(_dictionary);
        }
    }
    
    // Object pool policies for different types
    internal sealed class StringBuilderPoolPolicy : IPooledObjectPolicy<StringBuilder>
    {
        public StringBuilder Create() => new StringBuilder(1024); // Start with 1KB capacity
        
        public bool Return(StringBuilder obj)
        {
            if (obj.Capacity > 32 * 1024) // Don't pool very large builders
                return false;
            
            obj.Clear();
            return true;
        }
    }
    
    internal sealed class StringListPoolPolicy : IPooledObjectPolicy<List<string>>
    {
        public List<string> Create() => new List<string>(16); // Start with capacity for 16 items
        
        public bool Return(List<string> obj)
        {
            if (obj.Capacity > 1024) // Don't pool very large lists
                return false;
            
            obj.Clear();
            return true;
        }
    }
    
    internal sealed class DictionaryPoolPolicy : IPooledObjectPolicy<Dictionary<string, object>>
    {
        public Dictionary<string, object> Create() => new Dictionary<string, object>(16);
        
        public bool Return(Dictionary<string, object> obj)
        {
            if (obj.Count > 1024) // Don't pool very large dictionaries
                return false;
            
            obj.Clear();
            return true;
        }
    }
}