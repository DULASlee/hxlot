using System;
using System.Diagnostics;
using System.Threading;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.Extensions.ObjectPool;

namespace SmartAbp.CodeGenerator.Core
{
    /// <summary>
    /// Performance counters for tracking code generation metrics
    /// </summary>
    public sealed class PerformanceCounters
    {
        private long _totalGenerations;
        private long _successfulGenerations;
        private long _failedGenerations;
        private long _totalLinesGenerated;
        private long _totalExecutionTimeMs;
        private long _cacheHits;
        private long _cacheMisses;
        private DateTime _lastGenerationTime;
        private long _currentMemoryUsage;

        public long TotalGenerations => _totalGenerations;
        public long SuccessfulGenerations => _successfulGenerations;
        public long FailedGenerations => _failedGenerations;
        public long TotalLinesGenerated => _totalLinesGenerated;
        public long CurrentMemoryUsage => _currentMemoryUsage;
        public DateTime LastGenerationTime => _lastGenerationTime;

        public TimeSpan AverageGenerationTime
        {
            get
            {
                if (_totalGenerations == 0) return TimeSpan.Zero;
                return TimeSpan.FromMilliseconds((double)_totalExecutionTimeMs / _totalGenerations);
            }
        }

        public double CacheHitRatio
        {
            get
            {
                var totalCacheRequests = _cacheHits + _cacheMisses;
                return totalCacheRequests > 0 ? (double)_cacheHits / totalCacheRequests : 0;
            }
        }

        public void IncrementTotalGenerations() => Interlocked.Increment(ref _totalGenerations);
        public void IncrementSuccessfulGenerations() => Interlocked.Increment(ref _successfulGenerations);
        public void IncrementFailedGenerations() => Interlocked.Increment(ref _failedGenerations);
        public void AddLinesGenerated(long lines) => Interlocked.Add(ref _totalLinesGenerated, lines);
        public void AddExecutionTime(long milliseconds) => Interlocked.Add(ref _totalExecutionTimeMs, milliseconds);
        public void IncrementCacheHits() => Interlocked.Increment(ref _cacheHits);
        public void IncrementCacheMisses() => Interlocked.Increment(ref _cacheMisses);
        public void SetLastGenerationTime(DateTime time) => _lastGenerationTime = time;
        public void SetCurrentMemoryUsage(long bytes) => Interlocked.Exchange(ref _currentMemoryUsage, bytes);
        
        public void RecordEntityGeneration(TimeSpan elapsed)
        {
            IncrementTotalGenerations();
            IncrementSuccessfulGenerations();
            AddExecutionTime(elapsed.Milliseconds);
            SetLastGenerationTime(DateTime.UtcNow);
        }
        
        public void RecordCompilation(TimeSpan elapsed)
        {
            AddExecutionTime(elapsed.Milliseconds);
        }

        public void Initialize()
        {
            // Initialize performance tracking
            Reset();
        }

        public void Reset()
        {
            Interlocked.Exchange(ref _totalGenerations, 0);
            Interlocked.Exchange(ref _successfulGenerations, 0);
            Interlocked.Exchange(ref _failedGenerations, 0);
            Interlocked.Exchange(ref _totalLinesGenerated, 0);
            Interlocked.Exchange(ref _totalExecutionTimeMs, 0);
            Interlocked.Exchange(ref _cacheHits, 0);
            Interlocked.Exchange(ref _cacheMisses, 0);
            Interlocked.Exchange(ref _currentMemoryUsage, 0);
            _lastGenerationTime = DateTime.MinValue;
        }
    }
    
    /// <summary>
    /// Performance metrics data
    /// </summary>
    public sealed class PerformanceMetrics
    {
        public long TotalGenerations { get; set; }
        public long TotalCompilations { get; set; }
        public TimeSpan AverageGenerationTime { get; set; }
        public TimeSpan AverageCompilationTime { get; set; }
        public long TotalMemoryAllocated { get; set; }
        public long CurrentMemoryUsage { get; set; }
        
        public double GenerationsPerSecond => 
            AverageGenerationTime.TotalSeconds > 0 ? 1.0 / AverageGenerationTime.TotalSeconds : 0;
        
        public double CompilationsPerSecond => 
            AverageCompilationTime.TotalSeconds > 0 ? 1.0 / AverageCompilationTime.TotalSeconds : 0;
    }
    
    /// <summary>
    /// Object pool policy for CSharpSyntaxRewriter instances
    /// </summary>
    internal sealed class SyntaxRewriterPoolPolicy : IPooledObjectPolicy<CSharpSyntaxRewriter>
    {
        public CSharpSyntaxRewriter Create()
        {
            return new OptimizedSyntaxRewriter();
        }
        
        public bool Return(CSharpSyntaxRewriter obj)
        {
            // Reset the rewriter state if needed
            if (obj is OptimizedSyntaxRewriter optimized)
            {
                optimized.Reset();
                return true;
            }
            
            return false;
        }
    }
    
    /// <summary>
    /// Optimized syntax rewriter for code transformations
    /// </summary>
    internal sealed class OptimizedSyntaxRewriter : CSharpSyntaxRewriter
    {
        private int _transformationCount;
        
        public override Microsoft.CodeAnalysis.SyntaxNode? Visit(Microsoft.CodeAnalysis.SyntaxNode? node)
        {
            if (node != null)
            {
                _transformationCount++;
            }
            
            return base.Visit(node);
        }
        
        public void Reset()
        {
            _transformationCount = 0;
        }
        
        public int TransformationCount => _transformationCount;
    }
    
    /// <summary>
    /// High-performance stopwatch wrapper for precise timing
    /// </summary>
    public readonly struct PrecisionTimer : IDisposable
    {
        private readonly Stopwatch _stopwatch;
        private readonly Action<TimeSpan> _onComplete;
        
        public PrecisionTimer(Action<TimeSpan> onComplete)
        {
            _stopwatch = Stopwatch.StartNew();
            _onComplete = onComplete;
        }
        
        public TimeSpan Elapsed => _stopwatch.Elapsed;
        
        public void Dispose()
        {
            _stopwatch.Stop();
            _onComplete?.Invoke(_stopwatch.Elapsed);
        }
    }
    
    /// <summary>
    /// Memory usage tracker for optimization
    /// </summary>
    public sealed class MemoryTracker
    {
        private readonly long _initialMemory;
        private readonly Stopwatch _stopwatch;
        
        public MemoryTracker()
        {
            // Force garbage collection to get accurate baseline
            GC.Collect();
            GC.WaitForPendingFinalizers();
            GC.Collect();
            
            _initialMemory = GC.GetTotalMemory(false);
            _stopwatch = Stopwatch.StartNew();
        }
        
        public MemoryUsage GetCurrentUsage()
        {
            var currentMemory = GC.GetTotalMemory(false);
            
            return new MemoryUsage
            {
                InitialMemory = _initialMemory,
                CurrentMemory = currentMemory,
                MemoryDelta = currentMemory - _initialMemory,
                ElapsedTime = _stopwatch.Elapsed,
                Gen0Collections = GC.CollectionCount(0),
                Gen1Collections = GC.CollectionCount(1),
                Gen2Collections = GC.CollectionCount(2)
            };
        }
    }
    
    /// <summary>
    /// Memory usage information
    /// </summary>
    public sealed class MemoryUsage
    {
        public long InitialMemory { get; set; }
        public long CurrentMemory { get; set; }
        public long MemoryDelta { get; set; }
        public TimeSpan ElapsedTime { get; set; }
        public int Gen0Collections { get; set; }
        public int Gen1Collections { get; set; }
        public int Gen2Collections { get; set; }
        
        public double MemoryPerSecond => 
            ElapsedTime.TotalSeconds > 0 ? MemoryDelta / ElapsedTime.TotalSeconds : 0;
    }
}