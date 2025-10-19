using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Logging.Models;
using SmartAbp.DevKit.Core.Logging.Storage;

namespace SmartAbp.DevKit.Core.Logging;

/// <summary>
/// 异步日志通道（基于Channel<T>，高性能无阻塞写入）
/// </summary>
public class LogChannel : IDisposable
{
    private readonly Channel<LogEntry> _channel;
    private readonly ILogStorage _storage;
    private readonly ILogger<LogChannel> _logger;
    private readonly CancellationTokenSource _cts;
    private readonly Task _processingTask;
    private bool _disposed;

    public LogChannel(
        ILogStorage storage,
        ILogger<LogChannel> logger,
        int channelCapacity = 10000)
    {
        _storage = storage ?? throw new ArgumentNullException(nameof(storage));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _cts = new CancellationTokenSource();

        // 创建无界通道（支持多写入者，单读取者）
        _channel = Channel.CreateUnbounded<LogEntry>(new UnboundedChannelOptions
        {
            SingleReader = true,     // 只有一个后台任务读取
            SingleWriter = false,    // 支持多线程并发写入
            AllowSynchronousContinuations = false  // 避免阻塞
        });

        // 启动后台处理任务
        _processingTask = Task.Run(ProcessLogsAsync, _cts.Token);

        _logger.LogInformation("LogChannel initialized with capacity: {Capacity}", channelCapacity);
    }

    /// <summary>
    /// 写入日志（异步非阻塞）
    /// </summary>
    /// <param name="entry">日志条目</param>
    /// <returns>是否成功写入通道</returns>
    public bool Write(LogEntry entry)
    {
        if (_disposed)
        {
            return false;
        }

        try
        {
            // 非阻塞写入（如果通道满了会返回false，但我们用的是无界通道所以总是返回true）
            return _channel.Writer.TryWrite(entry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write log entry to channel");
            return false;
        }
    }

    /// <summary>
    /// 后台日志处理任务（批量写入数据库）
    /// </summary>
    private async Task ProcessLogsAsync()
    {
        var reader = _channel.Reader;
        var batch = new List<LogEntry>(100);  // 批量大小：100条

        _logger.LogInformation("Log processing task started");

        try
        {
            while (!_cts.Token.IsCancellationRequested)
            {
                try
                {
                    // 等待有数据可读
                    if (await reader.WaitToReadAsync(_cts.Token))
                    {
                        // 批量读取（最多100条或1秒超时）
                        var readTimeout = DateTime.UtcNow.AddSeconds(1);

                        while (batch.Count < 100 &&
                               DateTime.UtcNow < readTimeout &&
                               reader.TryRead(out var entry))
                        {
                            batch.Add(entry);
                        }

                        // 批量写入数据库
                        if (batch.Count > 0)
                        {
                            await WriteBatchToStorageAsync(batch);
                            batch.Clear();
                        }
                    }
                }
                catch (OperationCanceledException)
                {
                    // 正常取消，退出循环
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing log batch");
                    batch.Clear();  // 清空失败的批次
                    await Task.Delay(1000, _cts.Token);  // 等待1秒后重试
                }
            }

            // 处理剩余的日志
            await ProcessRemainingLogsAsync(reader, batch);
        }
        catch (OperationCanceledException)
        {
            // 正常取消
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fatal error in log processing task");
        }

        _logger.LogInformation("Log processing task stopped");
    }

    /// <summary>
    /// 处理剩余的日志（在关闭时）
    /// </summary>
    private async Task ProcessRemainingLogsAsync(
        ChannelReader<LogEntry> reader,
        List<LogEntry> batch)
    {
        try
        {
            // 读取所有剩余的日志
            while (reader.TryRead(out var entry))
            {
                batch.Add(entry);

                // 每100条写入一次
                if (batch.Count >= 100)
                {
                    await WriteBatchToStorageAsync(batch);
                    batch.Clear();
                }
            }

            // 写入最后一批
            if (batch.Count > 0)
            {
                await WriteBatchToStorageAsync(batch);
            }

            _logger.LogInformation("Processed all remaining logs");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing remaining logs");
        }
    }

    /// <summary>
    /// 批量写入存储
    /// </summary>
    private async Task WriteBatchToStorageAsync(List<LogEntry> batch)
    {
        try
        {
            await _storage.WriteBatchAsync(batch);

            _logger.LogDebug(
                "Wrote {Count} log entries to storage",
                batch.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to write {Count} log entries to storage",
                batch.Count);
        }
    }

    /// <summary>
    /// 刷新所有待处理的日志（确保所有日志都已写入）
    /// </summary>
    public async Task FlushAsync(TimeSpan timeout)
    {
        // 标记完成写入
        _channel.Writer.Complete();

        // 等待处理完成
        await Task.WhenAny(
            _processingTask,
            Task.Delay(timeout));

        _logger.LogInformation("Log channel flushed");
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
            // 停止接受新的日志
            _channel.Writer.Complete();

            // 等待处理完成（最多等待5秒）
            _processingTask.Wait(TimeSpan.FromSeconds(5));

            // 取消处理任务
            _cts.Cancel();
            _cts.Dispose();

            _logger.LogInformation("LogChannel disposed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disposing LogChannel");
        }
    }
}

