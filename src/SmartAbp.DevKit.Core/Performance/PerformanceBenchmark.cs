using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace SmartAbp.DevKit.Core.Performance;

/// <summary>
/// 性能基准测试工具
/// DevKit v2.0性能优化 - 验证优化效果
/// </summary>
public class PerformanceBenchmark
{
    private readonly ILogger<PerformanceBenchmark> _logger;
    private readonly List<BenchmarkResult> _results = new();

    public PerformanceBenchmark(ILogger<PerformanceBenchmark> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// 运行基准测试
    /// </summary>
    /// <param name="name">测试名称</param>
    /// <param name="action">要测试的操作</param>
    /// <param name="iterations">迭代次数</param>
    /// <param name="warmupIterations">预热迭代次数</param>
    /// <returns>基准测试结果</returns>
    public async Task<BenchmarkResult> RunAsync(
        string name,
        Func<Task> action,
        int iterations = 100,
        int warmupIterations = 10)
    {
        _logger.LogInformation("🔬 开始基准测试: {Name} (预热={Warmup}, 迭代={Iterations})",
            name, warmupIterations, iterations);

        // 预热（避免JIT编译影响）
        for (int i = 0; i < warmupIterations; i++)
        {
            await action();
        }

        // 强制GC（统一起点）
        GC.Collect();
        GC.WaitForPendingFinalizers();
        GC.Collect();

        var startMemory = GC.GetTotalMemory(false);
        var elapsedTimes = new List<long>();
        var stopwatch = new Stopwatch();

        // 正式测试
        for (int i = 0; i < iterations; i++)
        {
            stopwatch.Restart();
            await action();
            stopwatch.Stop();
            elapsedTimes.Add(stopwatch.ElapsedMilliseconds);
        }

        var endMemory = GC.GetTotalMemory(false);
        var memoryDelta = endMemory - startMemory;

        var result = new BenchmarkResult
        {
            Name = name,
            Iterations = iterations,
            TotalElapsedMs = elapsedTimes.Sum(),
            AverageElapsedMs = elapsedTimes.Average(),
            MinElapsedMs = elapsedTimes.Min(),
            MaxElapsedMs = elapsedTimes.Max(),
            P50ElapsedMs = Percentile(elapsedTimes, 0.5),
            P95ElapsedMs = Percentile(elapsedTimes, 0.95),
            P99ElapsedMs = Percentile(elapsedTimes, 0.99),
            MemoryDeltaBytes = memoryDelta,
            Gen0Collections = GC.CollectionCount(0),
            Gen1Collections = GC.CollectionCount(1),
            Gen2Collections = GC.CollectionCount(2)
        };

        _results.Add(result);

        _logger.LogInformation(
            "✅ 基准测试完成: {Name}\n" +
            "   平均耗时: {Avg}ms\n" +
            "   P95耗时: {P95}ms\n" +
            "   P99耗时: {P99}ms\n" +
            "   内存变化: {Memory:N0} bytes\n" +
            "   GC次数: Gen0={Gen0}, Gen1={Gen1}, Gen2={Gen2}",
            name,
            result.AverageElapsedMs,
            result.P95ElapsedMs,
            result.P99ElapsedMs,
            result.MemoryDeltaBytes,
            result.Gen0Collections,
            result.Gen1Collections,
            result.Gen2Collections);

        return result;
    }

    /// <summary>
    /// 比较两个基准测试结果
    /// </summary>
    /// <param name="baseline">基线结果</param>
    /// <param name="optimized">优化后结果</param>
    /// <returns>比较报告</returns>
    public string Compare(BenchmarkResult baseline, BenchmarkResult optimized)
    {
        var speedup = baseline.AverageElapsedMs / optimized.AverageElapsedMs;
        var memoryReduction = (baseline.MemoryDeltaBytes - optimized.MemoryDeltaBytes) /
                              (double)baseline.MemoryDeltaBytes;
        var gcReduction = (baseline.Gen0Collections - optimized.Gen0Collections) /
                         (double)baseline.Gen0Collections;

        var sb = new StringBuilder();
        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        sb.AppendLine($"📊 性能对比: {baseline.Name} vs {optimized.Name}");
        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        sb.AppendLine();
        sb.AppendLine($"⏱️  平均耗时:");
        sb.AppendLine($"   基线: {baseline.AverageElapsedMs:F2}ms");
        sb.AppendLine($"   优化: {optimized.AverageElapsedMs:F2}ms");
        sb.AppendLine($"   提升: {speedup:F2}x ({(speedup - 1) * 100:F0}% faster)");
        sb.AppendLine();
        sb.AppendLine($"💾 内存占用:");
        sb.AppendLine($"   基线: {baseline.MemoryDeltaBytes:N0} bytes");
        sb.AppendLine($"   优化: {optimized.MemoryDeltaBytes:N0} bytes");
        sb.AppendLine($"   降低: {memoryReduction:P0}");
        sb.AppendLine();
        sb.AppendLine($"🗑️  GC次数 (Gen0):");
        sb.AppendLine($"   基线: {baseline.Gen0Collections}次");
        sb.AppendLine($"   优化: {optimized.Gen0Collections}次");
        sb.AppendLine($"   降低: {gcReduction:P0}");
        sb.AppendLine();
        sb.AppendLine($"📈 P95延迟:");
        sb.AppendLine($"   基线: {baseline.P95ElapsedMs}ms");
        sb.AppendLine($"   优化: {optimized.P95ElapsedMs}ms");
        sb.AppendLine($"   改善: {(baseline.P95ElapsedMs - optimized.P95ElapsedMs):F2}ms");
        sb.AppendLine();
        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        return sb.ToString();
    }

    /// <summary>
    /// 生成完整报告
    /// </summary>
    /// <returns>性能报告</returns>
    public string GenerateReport()
    {
        if (_results.Count == 0)
        {
            return "暂无基准测试结果";
        }

        var sb = new StringBuilder();
        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        sb.AppendLine("📊 DevKit v2.0 性能基准测试报告");
        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        sb.AppendLine();

        foreach (var result in _results)
        {
            sb.AppendLine($"🔬 {result.Name}");
            sb.AppendLine($"   迭代次数: {result.Iterations}");
            sb.AppendLine($"   总耗时: {result.TotalElapsedMs}ms");
            sb.AppendLine($"   平均耗时: {result.AverageElapsedMs:F2}ms");
            sb.AppendLine($"   P50延迟: {result.P50ElapsedMs}ms");
            sb.AppendLine($"   P95延迟: {result.P95ElapsedMs}ms");
            sb.AppendLine($"   P99延迟: {result.P99ElapsedMs}ms");
            sb.AppendLine($"   内存变化: {result.MemoryDeltaBytes:N0} bytes");
            sb.AppendLine($"   GC次数: Gen0={result.Gen0Collections}, Gen1={result.Gen1Collections}, Gen2={result.Gen2Collections}");
            sb.AppendLine();
        }

        sb.AppendLine("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        return sb.ToString();
    }

    /// <summary>
    /// 计算百分位数
    /// </summary>
    private static double Percentile(List<long> sequence, double percentile)
    {
        var sorted = sequence.OrderBy(x => x).ToArray();
        var index = (int)Math.Ceiling(percentile * sorted.Length) - 1;
        return sorted[Math.Max(0, Math.Min(index, sorted.Length - 1))];
    }
}

/// <summary>
/// 基准测试结果
/// </summary>
public class BenchmarkResult
{
    public string Name { get; set; } = string.Empty;
    public int Iterations { get; set; }
    public long TotalElapsedMs { get; set; }
    public double AverageElapsedMs { get; set; }
    public long MinElapsedMs { get; set; }
    public long MaxElapsedMs { get; set; }
    public double P50ElapsedMs { get; set; }
    public double P95ElapsedMs { get; set; }
    public double P99ElapsedMs { get; set; }
    public long MemoryDeltaBytes { get; set; }
    public int Gen0Collections { get; set; }
    public int Gen1Collections { get; set; }
    public int Gen2Collections { get; set; }
}

