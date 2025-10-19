using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Logging.Models;
using SmartAbp.DevKit.Core.Logging.Storage;

namespace SmartAbp.DevKit.Core.Logging;

/// <summary>
/// 性能分析器实现（高性能，异步记录）
/// </summary>
public class PerformanceProfiler : IPerformanceProfiler, IDisposable
{
    private readonly Channel<PerformanceLogEntry> _channel;
    private readonly IPerformanceLogStorage _storage;
    private readonly ILogger<PerformanceProfiler> _logger;
    private readonly ConcurrentBag<PerformanceMetric> _metrics;
    private readonly CancellationTokenSource _cts;
    private readonly Task _processingTask;
    private readonly string _operationId;
    private bool _disposed;

    public PerformanceProfiler(
        IPerformanceLogStorage storage,
        ILogger<PerformanceProfiler> logger,
        string? operationId = null)
    {
        _storage = storage ?? throw new ArgumentNullException(nameof(storage));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _operationId = operationId ?? Guid.NewGuid().ToString("N");
        _metrics = new ConcurrentBag<PerformanceMetric>();
        _cts = new CancellationTokenSource();

        // 创建异步通道
        _channel = Channel.CreateUnbounded<PerformanceLogEntry>(new UnboundedChannelOptions
        {
            SingleReader = true,
            SingleWriter = false
        });

        // 启动后台处理任务
        _processingTask = Task.Run(ProcessPerformanceLogsAsync, _cts.Token);
    }

    /// <summary>
    /// 开始性能追踪作用域
    /// </summary>
    /// <param name="operationName">操作名称</param>
    /// <returns>性能作用域（Dispose时自动记录性能）</returns>
    public IDisposable BeginScope(string operationName)
    {
        return new PerformanceScope(this, operationName, _operationId);
    }

    /// <summary>
    /// 记录性能指标
    /// </summary>
    /// <param name="operationName">操作名称</param>
    /// <param name="durationMs">耗时（毫秒）</param>
    /// <param name="metadata">额外元数据</param>
    public void RecordMetrics(string operationName, long durationMs, object? metadata = null)
    {
        // 添加到内存指标（用于实时报告）
        var metric = new PerformanceMetric
        {
            OperationName = operationName,
            DurationMs = durationMs,
            Timestamp = DateTime.UtcNow
        };

        if (metadata != null)
        {
            // 简单序列化元数据
            foreach (var prop in metadata.GetType().GetProperties())
            {
                metric.Metadata[prop.Name] = prop.GetValue(metadata) ?? string.Empty;
            }
        }

        _metrics.Add(metric);

        // 异步写入数据库
        var logEntry = new PerformanceLogEntry
        {
            OperationName = operationName,
            DurationMs = durationMs,
            Timestamp = DateTime.UtcNow,
            OperationId = _operationId,
            MemoryUsageBytes = GC.GetTotalMemory(false),
            Status = "Success",
            Metadata = metadata != null ? System.Text.Json.JsonSerializer.Serialize(metadata) : null
        };

        _channel.Writer.TryWrite(logEntry);

        _logger.LogDebug(
            "Performance metric recorded: {OperationName} took {DurationMs}ms",
            operationName,
            durationMs);
    }

    /// <summary>
    /// 获取性能报告
    /// </summary>
    /// <returns>性能报告</returns>
    public PerformanceReport GetReport()
    {
        var metrics = _metrics.ToArray();

        var report = new PerformanceReport
        {
            TotalOperations = metrics.Length,
            TotalDurationMs = metrics.Sum(m => m.DurationMs),
            Metrics = new List<PerformanceMetric>(metrics)
        };

        return report;
    }

    /// <summary>
    /// 后台性能日志处理任务
    /// </summary>
    private async Task ProcessPerformanceLogsAsync()
    {
        var reader = _channel.Reader;
        var batch = new List<PerformanceLogEntry>(50);  // 批量大小：50条

        try
        {
            while (!_cts.Token.IsCancellationRequested)
            {
                try
                {
                    if (await reader.WaitToReadAsync(_cts.Token))
                    {
                        var readTimeout = DateTime.UtcNow.AddSeconds(1);

                        while (batch.Count < 50 &&
                               DateTime.UtcNow < readTimeout &&
                               reader.TryRead(out var entry))
                        {
                            batch.Add(entry);
                        }

                        if (batch.Count > 0)
                        {
                            await _storage.WriteBatchAsync(batch);
                            batch.Clear();
                        }
                    }
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing performance log batch");
                    batch.Clear();
                    await Task.Delay(1000, _cts.Token);
                }
            }

            // 处理剩余的日志
            while (reader.TryRead(out var entry))
            {
                batch.Add(entry);
                if (batch.Count >= 50)
                {
                    await _storage.WriteBatchAsync(batch);
                    batch.Clear();
                }
            }

            if (batch.Count > 0)
            {
                await _storage.WriteBatchAsync(batch);
            }
        }
        catch (OperationCanceledException)
        {
            // 正常取消
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fatal error in performance log processing task");
        }
    }

    /// <summary>
    /// 性能追踪作用域（自动计时）
    /// </summary>
    private class PerformanceScope : IDisposable
    {
        private readonly PerformanceProfiler _profiler;
        private readonly string _operationName;
        private readonly string _operationId;
        private readonly Stopwatch _stopwatch;
        private readonly long _startMemory;
        private bool _disposed;

        public PerformanceScope(
            PerformanceProfiler profiler,
            string operationName,
            string operationId)
        {
            _profiler = profiler;
            _operationName = operationName;
            _operationId = operationId;
            _startMemory = GC.GetTotalMemory(false);
            _stopwatch = Stopwatch.StartNew();
        }

        public void Dispose()
        {
            if (_disposed)
            {
                return;
            }

            _disposed = true;
            _stopwatch.Stop();

            var endMemory = GC.GetTotalMemory(false);
            var memoryDelta = endMemory - _startMemory;

            // 记录性能指标
            _profiler.RecordMetrics(
                _operationName,
                _stopwatch.ElapsedMilliseconds,
                new
                {
                    StartMemory = _startMemory,
                    EndMemory = endMemory,
                    MemoryDelta = memoryDelta,
                    OperationId = _operationId
                });
        }
    }

    /// <summary>
    /// 释放资源
    /// </summary>
    public void Dispose()
    {
        if (_disposed)
        {
            return;
        }

        _disposed = true;

        try
        {
            _channel.Writer.Complete();
            _processingTask.Wait(TimeSpan.FromSeconds(5));
            _cts.Cancel();
            _cts.Dispose();

            _logger.LogInformation(
                "PerformanceProfiler disposed. Total operations: {Count}",
                _metrics.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disposing PerformanceProfiler");
        }
    }
}

