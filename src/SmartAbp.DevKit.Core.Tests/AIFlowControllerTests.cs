using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using SmartAbp.DevKit.Core.Flow;
using SmartAbp.DevKit.Core.Monitoring;
using SmartAbp.DevKit.Core.Types;
using Xunit;

namespace SmartAbp.DevKit.Core.Tests;

/// <summary>
/// AIFlowController集成测试
///
/// 测试目标：
/// - 流水线完整执行
/// - 监控指标收集
/// - 错误处理机制
/// </summary>
public class AIFlowControllerTests
{
    private readonly Mock<ILogger<AIFlowController>> _mockLogger;

    public AIFlowControllerTests()
    {
        _mockLogger = new Mock<ILogger<AIFlowController>>();
    }

    /// <summary>
    /// 测试：基础流水线执行（无监控）
    /// </summary>
    [Fact]
    public async Task StartFlowAsync_WithoutMetrics_ShouldExecuteSuccessfully()
    {
        // Arrange
        var controller = new AIFlowController(_mockLogger.Object);
        var context = CreateTestContext();

        // Act
        var result = await controller.StartFlowAsync(context);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Performance.Should().NotBeNull();
        result.Performance.TotalTime.Should().BeGreaterThan(0);
    }

    /// <summary>
    /// 测试：流水线执行 + 监控集成
    /// </summary>
    [Fact]
    public async Task StartFlowAsync_WithMetrics_ShouldCollectPerformanceData()
    {
        // Arrange
        var metricsCollector = new MetricsCollector();
        var controller = new AIFlowController(_mockLogger.Object, metricsCollector);
        var context = CreateTestContext();

        // Act
        var result = await controller.StartFlowAsync(context);

        // Assert
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();

        // 验证性能指标
        var metrics = metricsCollector.GetPerformanceMetrics();
        metrics.Should().NotBeNull();
        metrics.TotalTime.Should().BeGreaterThan(0);

        // 验证报告
        var report = metricsCollector.GenerateReport();
        report.TotalWorkstations.Should().BeGreaterThan(0);
        report.TotalExecutions.Should().BeGreaterThan(0);
    }

    /// <summary>
    /// 测试：监控系统独立功能
    /// </summary>
    [Fact]
    public async Task MetricsCollector_StartAndEndWorkstation_ShouldRecordMetrics()
    {
        // Arrange
        var collector = new MetricsCollector();

        // Act
        collector.StartWorkstation("test-workstation", new { test = true });
        await Task.Delay(100); // 模拟执行
        collector.EndWorkstation("test-workstation", new { result = "success" });

        // Assert
        var metrics = collector.GetWorkstationMetrics("test-workstation");
        metrics.Should().NotBeNull();
        metrics!.ExecutionCount.Should().Be(1);
        metrics.TotalExecutionTime.Should().BeGreaterThanOrEqualTo(100);
        metrics.AvgDurationMs.Should().BeGreaterThanOrEqualTo(100);
        metrics.IsRunning.Should().BeFalse();
    }

    /// <summary>
    /// 测试：监控系统错误跟踪
    /// </summary>
    [Fact]
    public void MetricsCollector_RecordError_ShouldIncrementErrorCount()
    {
        // Arrange
        var collector = new MetricsCollector();
        var testException = new InvalidOperationException("Test error");

        // Act
        collector.RecordError("test-workstation", testException);
        collector.RecordError("test-workstation", new ArgumentException("Another error"));

        // Assert
        var metrics = collector.GetWorkstationMetrics("test-workstation");
        metrics.Should().NotBeNull();
        metrics!.ErrorCount.Should().Be(2);
        metrics.LastError.Should().Be("Another error");
        metrics.LastErrorTime.Should().BeCloseTo(DateTime.Now, TimeSpan.FromSeconds(5));
    }

    /// <summary>
    /// 测试：监控系统报告生成
    /// </summary>
    [Fact]
    public async Task MetricsCollector_GenerateReport_ShouldContainAllMetrics()
    {
        // Arrange
        var collector = new MetricsCollector();

        collector.StartWorkstation("ws1", null);
        await Task.Delay(50);
        collector.EndWorkstation("ws1", null);

        collector.StartWorkstation("ws2", null);
        await Task.Delay(30);
        collector.EndWorkstation("ws2", null);

        collector.RecordError("ws1", new Exception("Test error"));

        // Act
        var report = collector.GenerateReport();

        // Assert
        report.Should().NotBeNull();
        report.TotalWorkstations.Should().Be(2);
        report.TotalExecutions.Should().Be(2);
        report.TotalErrors.Should().Be(1);
        report.WorkstationMetrics.Should().HaveCount(2);
        report.AvgWorkstationDuration.Should().BeGreaterThan(0);
        report.GeneratedAt.Should().BeCloseTo(DateTime.Now, TimeSpan.FromSeconds(5));
    }

    /// <summary>
    /// 测试：多次执行统计
    /// </summary>
    [Fact]
    public async Task MetricsCollector_MultipleExecutions_ShouldCalculateAverages()
    {
        // Arrange
        var collector = new MetricsCollector();

        // Act - 执行3次
        for (int i = 0; i < 3; i++)
        {
            collector.StartWorkstation("test-ws", null);
            await Task.Delay(50 + i * 10); // 50ms, 60ms, 70ms
            collector.EndWorkstation("test-ws", null);
        }

        // Assert
        var metrics = collector.GetWorkstationMetrics("test-ws");
        metrics.Should().NotBeNull();
        metrics!.ExecutionCount.Should().Be(3);
        metrics.MinDurationMs.Should().BeGreaterThanOrEqualTo(45); // 放宽容差
        metrics.MaxDurationMs.Should().BeGreaterThanOrEqualTo(65); // 放宽容差
        metrics.AvgDurationMs.Should().BeGreaterThanOrEqualTo(45); // 放宽容差
        metrics.AvgDurationMs.Should().BeLessThanOrEqualTo(120); // 放宽容差
    }

    /// <summary>
    /// 测试：监控系统重置功能
    /// </summary>
    [Fact]
    public async Task MetricsCollector_Reset_ShouldClearAllMetrics()
    {
        // Arrange
        var collector = new MetricsCollector();

        collector.StartWorkstation("ws1", null);
        await Task.Delay(50);
        collector.EndWorkstation("ws1", null);

        var reportBefore = collector.GenerateReport();
        reportBefore.TotalWorkstations.Should().BeGreaterThan(0);

        // Act
        collector.Reset();

        // Assert
        var reportAfter = collector.GenerateReport();
        reportAfter.TotalWorkstations.Should().Be(0);
        reportAfter.TotalExecutions.Should().Be(0);
        reportAfter.TotalErrors.Should().Be(0);
    }

    /// <summary>
    /// 测试：完整的AI流水线执行链路（集成测试）⭐
    /// </summary>
    [Fact]
    public async Task FullIntegration_AIFlowWithMetrics_ShouldWorkEndToEnd()
    {
        // Arrange
        var metricsCollector = new MetricsCollector();
        var controller = new AIFlowController(_mockLogger.Object, metricsCollector);
        var context = CreateTestContext();

        // Act
        var result = await controller.StartFlowAsync(context);

        // Assert - 流水线执行结果
        result.Should().NotBeNull();
        result.Success.Should().BeTrue();
        result.Code.Should().NotBeNullOrEmpty();
        result.Errors.Should().BeEmpty();

        // Assert - 性能指标
        var metrics = metricsCollector.GetPerformanceMetrics();
        metrics.TotalTime.Should().BeGreaterThan(0);

        // Assert - 工位指标
        var report = metricsCollector.GenerateReport();
        report.TotalWorkstations.Should().BeGreaterThan(0);
        report.TotalExecutions.Should().BeGreaterThan(0);
        report.TotalErrors.Should().Be(0);

        // 打印报告（验证）
        metricsCollector.PrintReport();
    }

    /// <summary>
    /// 创建测试上下文
    /// </summary>
    private GenerationContext CreateTestContext()
    {
        return new GenerationContext
        {
            EntitySchema = new EntitySchema
            {
                Name = "TestEntity",
                DisplayName = "测试实体",
                Properties = new List<PropertySchema>
                {
                    new()
                    {
                        Name = "Id",
                        DisplayName = "主键",
                        Type = "Guid",
                        IsKey = true,
                        IsRequired = true
                    },
                    new()
                    {
                        Name = "Name",
                        DisplayName = "名称",
                        Type = "string",
                        IsRequired = true
                    }
                }
            }
        };
    }
}
