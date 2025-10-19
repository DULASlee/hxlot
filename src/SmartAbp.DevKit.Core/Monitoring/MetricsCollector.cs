using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using SmartAbp.DevKit.Core.Types;

namespace SmartAbp.DevKit.Core.Monitoring;

/// <summary>
/// 指标收集器
/// ⭐ D爷建议：增强监控和可观测性
/// </summary>
public class MetricsCollector
{
    private readonly Dictionary<string, WorkstationMetrics> _workstationMetrics = new();
    private readonly Dictionary<string, Stopwatch> _workstationStopwatches = new();
    private readonly object _lock = new();
    private readonly Stopwatch _globalStopwatch = Stopwatch.StartNew();

    /// <summary>
    /// 启动流水线监控
    /// </summary>
    public void StartFlow()
    {
        _globalStopwatch.Restart();
        Console.WriteLine("🏭 [Metrics] AI流水线监控启动");
    }

    /// <summary>
    /// 结束流水线监控
    /// </summary>
    public void EndFlow()
    {
        _globalStopwatch.Stop();
        Console.WriteLine($"🏁 [Metrics] AI流水线监控完成 (总时长: {_globalStopwatch.ElapsedMilliseconds}ms)");
    }

    /// <summary>
    /// 启动工位监控
    /// </summary>
    public void StartWorkstation(string workstationId, object? input = null)
    {
        lock (_lock)
        {
            if (!_workstationStopwatches.ContainsKey(workstationId))
            {
                _workstationStopwatches[workstationId] = new Stopwatch();
            }
            _workstationStopwatches[workstationId].Restart();

            if (!_workstationMetrics.ContainsKey(workstationId))
            {
                _workstationMetrics[workstationId] = new WorkstationMetrics
                {
                    WorkstationId = workstationId
                };
            }

            var metrics = _workstationMetrics[workstationId];
            metrics.ExecutionCount++;
            metrics.LastStartTime = DateTime.Now;
            metrics.IsRunning = true;

            Console.WriteLine($"📊 [Metrics] 工位开始: {workstationId} (第{metrics.ExecutionCount}次)");
        }
    }

    /// <summary>
    /// 结束工位监控
    /// </summary>
    public void EndWorkstation(string workstationId, object? output = null)
    {
        lock (_lock)
        {
            if (!_workstationStopwatches.ContainsKey(workstationId) || !_workstationMetrics.ContainsKey(workstationId))
            {
                return;
            }

            var stopwatch = _workstationStopwatches[workstationId];
            stopwatch.Stop();
            var durationMs = stopwatch.ElapsedMilliseconds;

            var metrics = _workstationMetrics[workstationId];
            metrics.IsRunning = false;
            metrics.TotalExecutionTime += durationMs;
            metrics.LastEndTime = DateTime.Now;
            metrics.LastDurationMs = durationMs;

            // 更新最小/最大执行时间
            if (metrics.MinDurationMs == 0 || durationMs < metrics.MinDurationMs)
            {
                metrics.MinDurationMs = durationMs;
            }

            if (durationMs > metrics.MaxDurationMs)
            {
                metrics.MaxDurationMs = durationMs;
            }

            // 计算平均执行时间
            metrics.AvgDurationMs = metrics.TotalExecutionTime / metrics.ExecutionCount;

            Console.WriteLine($"📊 [Metrics] 工位完成: {workstationId} ({durationMs}ms, 平均{metrics.AvgDurationMs}ms)");
        }
    }

    /// <summary>
    /// 获取性能指标
    /// </summary>
    public PerformanceMetrics GetPerformanceMetrics()
    {
        lock (_lock)
        {
            var workstationTimes = new Dictionary<string, long>();
            foreach (var entry in _workstationMetrics)
            {
                workstationTimes[entry.Key] = entry.Value.TotalExecutionTime;
            }

            return new PerformanceMetrics
            {
                TotalTime = _globalStopwatch.ElapsedMilliseconds,
                WorkstationTimes = workstationTimes
            };
        }
    }

    /// <summary>
    /// 记录工位开始
    /// </summary>
    public void RecordWorkstationStart(string workstationId, object? input = null)
    {
        lock (_lock)
        {
            if (!_workstationMetrics.ContainsKey(workstationId))
            {
                _workstationMetrics[workstationId] = new WorkstationMetrics
                {
                    WorkstationId = workstationId
                };
            }

            var metrics = _workstationMetrics[workstationId];
            metrics.ExecutionCount++;
            metrics.LastStartTime = DateTime.Now;
            metrics.IsRunning = true;

            Console.WriteLine($"📊 [Metrics] 工位开始: {workstationId} (第{metrics.ExecutionCount}次)");
        }
    }

    /// <summary>
    /// 记录工位结束
    /// </summary>
    public void RecordWorkstationEnd(string workstationId, object? output = null, long durationMs = 0)
    {
        lock (_lock)
        {
            if (!_workstationMetrics.ContainsKey(workstationId))
            {
                return;
            }

            var metrics = _workstationMetrics[workstationId];
            metrics.IsRunning = false;
            metrics.TotalExecutionTime += durationMs;
            metrics.LastEndTime = DateTime.Now;
            metrics.LastDurationMs = durationMs;

            // 更新最小/最大执行时间
            if (metrics.MinDurationMs == 0 || durationMs < metrics.MinDurationMs)
            {
                metrics.MinDurationMs = durationMs;
            }

            if (durationMs > metrics.MaxDurationMs)
            {
                metrics.MaxDurationMs = durationMs;
            }

            // 计算平均执行时间
            metrics.AvgDurationMs = metrics.TotalExecutionTime / metrics.ExecutionCount;

            Console.WriteLine($"📊 [Metrics] 工位完成: {workstationId} ({durationMs}ms, 平均{metrics.AvgDurationMs}ms)");
        }
    }

    /// <summary>
    /// 记录错误
    /// </summary>
    public void RecordError(string workstationId, Exception error)
    {
        lock (_lock)
        {
            if (!_workstationMetrics.ContainsKey(workstationId))
            {
                _workstationMetrics[workstationId] = new WorkstationMetrics
                {
                    WorkstationId = workstationId
                };
            }

            var metrics = _workstationMetrics[workstationId];
            metrics.ErrorCount++;
            metrics.LastError = error.Message;
            metrics.LastErrorTime = DateTime.Now;

            Console.WriteLine($"❌ [Metrics] 工位错误: {workstationId} (总错误{metrics.ErrorCount}次) - {error.Message}");
        }
    }

    /// <summary>
    /// 记录质量检查
    /// </summary>
    public void RecordQualityCheck(string checkName, bool passed, List<string>? errors = null)
    {
        Console.WriteLine(passed
            ? $"✅ [Metrics] 质量检查通过: {checkName}"
            : $"❌ [Metrics] 质量检查失败: {checkName} - {string.Join(", ", errors ?? new List<string>())}");
    }

    /// <summary>
    /// 记录质量检查（重载：接受QualityCheckResult）
    /// </summary>
    public void RecordQualityCheck(string workstationId, QualityCheckResult result)
    {
        Console.WriteLine(result.Passed
            ? $"✅ [Metrics] 工位质检通过: {workstationId}"
            : $"❌ [Metrics] 工位质检失败: {workstationId} - {string.Join(", ", result.Errors)}");
    }

    /// <summary>
    /// 获取工位指标
    /// </summary>
    public WorkstationMetrics? GetWorkstationMetrics(string workstationId)
    {
        lock (_lock)
        {
            return _workstationMetrics.ContainsKey(workstationId)
                ? _workstationMetrics[workstationId]
                : null;
        }
    }

    /// <summary>
    /// 获取所有指标
    /// </summary>
    public Dictionary<string, WorkstationMetrics> GetAllMetrics()
    {
        lock (_lock)
        {
            return new Dictionary<string, WorkstationMetrics>(_workstationMetrics);
        }
    }

    /// <summary>
    /// 生成指标报告
    /// </summary>
    public MetricsReport GenerateReport()
    {
        lock (_lock)
        {
            return new MetricsReport
            {
                GeneratedAt = DateTime.Now,
                TotalExecutionTime = _globalStopwatch.ElapsedMilliseconds,
                WorkstationMetrics = _workstationMetrics.Values.ToList(),
                TotalWorkstations = _workstationMetrics.Count,
                TotalExecutions = _workstationMetrics.Values.Sum(m => m.ExecutionCount),
                TotalErrors = _workstationMetrics.Values.Sum(m => m.ErrorCount),
                AvgWorkstationDuration = _workstationMetrics.Values.Any()
                    ? _workstationMetrics.Values.Average(m => m.AvgDurationMs)
                    : 0
            };
        }
    }

    /// <summary>
    /// 打印指标报告
    /// </summary>
    public void PrintReport()
    {
        var report = GenerateReport();

        Console.WriteLine("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine("📊 DevKit性能指标报告");
        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Console.WriteLine($"生成时间: {report.GeneratedAt:yyyy-MM-dd HH:mm:ss}");
        Console.WriteLine($"总执行时间: {report.TotalExecutionTime}ms");
        Console.WriteLine($"工位数量: {report.TotalWorkstations}");
        Console.WriteLine($"总执行次数: {report.TotalExecutions}");
        Console.WriteLine($"总错误次数: {report.TotalErrors}");
        Console.WriteLine($"平均工位时长: {report.AvgWorkstationDuration:F2}ms");
        Console.WriteLine("\n工位详细指标:");

        foreach (var metrics in report.WorkstationMetrics.OrderByDescending(m => m.TotalExecutionTime))
        {
            Console.WriteLine($"\n  📍 {metrics.WorkstationId}");
            Console.WriteLine($"     执行次数: {metrics.ExecutionCount}");
            Console.WriteLine($"     总时长: {metrics.TotalExecutionTime}ms");
            Console.WriteLine($"     平均时长: {metrics.AvgDurationMs:F2}ms");
            Console.WriteLine($"     最短时长: {metrics.MinDurationMs}ms");
            Console.WriteLine($"     最长时长: {metrics.MaxDurationMs}ms");
            Console.WriteLine($"     错误次数: {metrics.ErrorCount}");

            if (metrics.ErrorCount > 0)
            {
                Console.WriteLine($"     最后错误: {metrics.LastError}");
            }
        }

        Console.WriteLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    }

    /// <summary>
    /// 重置所有指标
    /// </summary>
    public void Reset()
    {
        lock (_lock)
        {
            _workstationMetrics.Clear();
            _globalStopwatch.Restart();
            Console.WriteLine("🔄 [Metrics] 指标已重置");
        }
    }
}

/// <summary>
/// 工位指标
/// </summary>
public class WorkstationMetrics
{
    public string WorkstationId { get; set; } = string.Empty;
    public int ExecutionCount { get; set; }
    public long TotalExecutionTime { get; set; }
    public long AvgDurationMs { get; set; }
    public long MinDurationMs { get; set; }
    public long MaxDurationMs { get; set; }
    public long LastDurationMs { get; set; }
    public int ErrorCount { get; set; }
    public string? LastError { get; set; }
    public DateTime? LastStartTime { get; set; }
    public DateTime? LastEndTime { get; set; }
    public DateTime? LastErrorTime { get; set; }
    public bool IsRunning { get; set; }
}

/// <summary>
/// 指标报告
/// </summary>
public class MetricsReport
{
    public DateTime GeneratedAt { get; set; }
    public long TotalExecutionTime { get; set; }
    public List<WorkstationMetrics> WorkstationMetrics { get; set; } = new();
    public int TotalWorkstations { get; set; }
    public int TotalExecutions { get; set; }
    public int TotalErrors { get; set; }
    public double AvgWorkstationDuration { get; set; }
}

