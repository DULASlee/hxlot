using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SmartAbp.Permissions.Alerting;
using SmartAbp.Permissions.Cache;
using SmartAbp.Permissions.Configuration;
using SmartAbp.Permissions.Integration;
using SmartAbp.Permissions.Memory;
using SmartAbp.Permissions.Performance;
using Volo.Abp.DependencyInjection;
using static SmartAbp.Permissions.Alerting.AlertType;

namespace SmartAbp.Permissions.Testing
{
    /// <summary>
    /// 企业级测试选项
    /// </summary>
    public class EnterpriseTestingOptions
    {
        /// <summary>
        /// 是否启用性能测试
        /// </summary>
        public bool EnablePerformanceTesting { get; set; } = true;

        /// <summary>
        /// 是否启用压力测试
        /// </summary>
        public bool EnableStressTesting { get; set; } = true;

        /// <summary>
        /// 是否启用内存泄漏检测
        /// </summary>
        public bool EnableMemoryLeakDetection { get; set; } = true;

        /// <summary>
        /// 是否启用分布式锁测试
        /// </summary>
        public bool EnableDistributedLockTesting { get; set; } = true;

        /// <summary>
        /// 是否启用集成测试
        /// </summary>
        public bool EnableIntegrationTesting { get; set; } = true;

        /// <summary>
        /// 测试报告路径
        /// </summary>
        public string TestReportPath { get; set; } = "./test-reports";

        /// <summary>
        /// 并发用户数
        /// </summary>
        public int ConcurrentUsers { get; set; } = 100;

        /// <summary>
        /// 测试持续时间（秒）
        /// </summary>
        public int TestDurationSeconds { get; set; } = 300; // 5分钟

        /// <summary>
        /// 性能基准阈值（毫秒）
        /// </summary>
        public double PerformanceBaselineMs { get; set; } = 100;

        /// <summary>
        /// 内存泄漏阈值（MB）
        /// </summary>
        public double MemoryLeakThresholdMB { get; set; } = 50;

        /// <summary>
        /// 错误率阈值（%）
        /// </summary>
        public double ErrorRateThreshold { get; set; } = 1.0; // 1%

        /// <summary>
        /// 是否生成详细报告
        /// </summary>
        public bool GenerateDetailedReport { get; set; } = true;

        /// <summary>
        /// 是否发送测试报告
        /// </summary>
        public bool SendTestReport { get; set; } = true;
    }

    /// <summary>
    /// 测试结果模型
    /// </summary>
    public class EnterpriseTestResult
    {
        /// <summary>
        /// 测试名称
        /// </summary>
        public string TestName { get; set; }

        /// <summary>
        /// 测试类型
        /// </summary>
        public string TestType { get; set; }

        /// <summary>
        /// 开始时间
        /// </summary>
        public DateTime StartTime { get; set; }

        /// <summary>
        /// 结束时间
        /// </summary>
        public DateTime EndTime { get; set; }

        /// <summary>
        /// 持续时间
        /// </summary>
        public TimeSpan Duration { get; set; }

        /// <summary>
        /// 总请求数
        /// </summary>
        public long TotalRequests { get; set; }

        /// <summary>
        /// 成功请求数
        /// </summary>
        public long SuccessfulRequests { get; set; }

        /// <summary>
        /// 失败请求数
        /// </summary>
        public long FailedRequests { get; set; }

        /// <summary>
        /// 错误率
        /// </summary>
        public double ErrorRate { get; set; }

        /// <summary>
        /// 平均响应时间（毫秒）
        /// </summary>
        public double AverageResponseTimeMs { get; set; }

        /// <summary>
        /// 最小响应时间（毫秒）
        /// </summary>
        public double MinResponseTimeMs { get; set; }

        /// <summary>
        /// 最大响应时间（毫秒）
        /// </summary>
        public double MaxResponseTimeMs { get; set; }

        /// <summary>
        /// P50响应时间（毫秒）
        /// </summary>
        public double P50ResponseTimeMs { get; set; }

        /// <summary>
        /// P95响应时间（毫秒）
        /// </summary>
        public double P95ResponseTimeMs { get; set; }

        /// <summary>
        /// P99响应时间（毫秒）
        /// </summary>
        public double P99ResponseTimeMs { get; set; }

        /// <summary>
        /// 内存使用峰值（MB）
        /// </summary>
        public double PeakMemoryUsageMB { get; set; }

        /// <summary>
        /// 内存使用开始（MB）
        /// </summary>
        public double StartMemoryUsageMB { get; set; }

        /// <summary>
        /// 内存使用结束（MB）
        /// </summary>
        public double EndMemoryUsageMB { get; set; }

        /// <summary>
        /// 内存泄漏（MB）
        /// </summary>
        public double MemoryLeakMB { get; set; }

        /// <summary>
        /// 是否通过
        /// </summary>
        public bool IsPassed { get; set; }

        /// <summary>
        /// 失败原因
        /// </summary>
        public List<string> FailureReasons { get; set; } = new List<string>();

        /// <summary>
        /// 详细日志
        /// </summary>
        public List<string> DetailedLogs { get; set; } = new List<string>();

        /// <summary>
        /// 附加数据
        /// </summary>
        public Dictionary<string, object> AdditionalData { get; set; } = new Dictionary<string, object>();
    }

    /// <summary>
    /// 企业级测试框架接口
    /// </summary>
    public interface IEnterpriseTestingFramework
    {
        /// <summary>
        /// 运行所有测试
        /// </summary>
        /// <returns>测试结果列表</returns>
        Task<List<EnterpriseTestResult>> RunAllTestsAsync();

        /// <summary>
        /// 运行性能测试
        /// </summary>
        /// <returns>测试结果</returns>
        Task<EnterpriseTestResult> RunPerformanceTestAsync();

        /// <summary>
        /// 运行压力测试
        /// </summary>
        /// <returns>测试结果</returns>
        Task<EnterpriseTestResult> RunStressTestAsync();

        /// <summary>
        /// 运行内存泄漏检测
        /// </summary>
        /// <returns>测试结果</returns>
        Task<EnterpriseTestResult> RunMemoryLeakDetectionAsync();

        /// <summary>
        /// 运行分布式锁测试
        /// </summary>
        /// <returns>测试结果</returns>
        Task<EnterpriseTestResult> RunDistributedLockTestAsync();

        /// <summary>
        /// 运行集成测试
        /// </summary>
        /// <returns>测试结果</returns>
        Task<EnterpriseTestResult> RunIntegrationTestAsync();

        /// <summary>
        /// 生成测试报告
        /// </summary>
        /// <param name="results">测试结果</param>
        /// <returns>报告路径</returns>
        Task<string> GenerateTestReportAsync(List<EnterpriseTestResult> results);

        /// <summary>
        /// 发送测试报告
        /// </summary>
        /// <param name="reportPath">报告路径</param>
        /// <returns>是否成功</returns>
        Task<bool> SendTestReportAsync(string reportPath);
    }

    /// <summary>
    /// 企业级测试框架实现
    /// </summary>
    public class EnterpriseTestingFramework : IEnterpriseTestingFramework, ISingletonDependency
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<EnterpriseTestingFramework> _logger;
        private readonly EnterpriseTestingOptions _options;
        private readonly IPermissionPerformanceMonitor _performanceMonitor;
        private readonly IMemoryManagementService _memoryService;
        private readonly IPermissionAlertingService _alertingService;
        private readonly IEnterpriseIntegrationService _integrationService;

        public EnterpriseTestingFramework(
            IServiceProvider serviceProvider,
            ILogger<EnterpriseTestingFramework> logger,
            IOptions<EnterpriseTestingOptions> options,
            IPermissionPerformanceMonitor performanceMonitor,
            IMemoryManagementService memoryService,
            IPermissionAlertingService alertingService,
            IEnterpriseIntegrationService integrationService)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _options = options?.Value ?? new EnterpriseTestingOptions();
            _performanceMonitor = performanceMonitor;
            _memoryService = memoryService;
            _alertingService = alertingService;
            _integrationService = integrationService;
        }

        public async Task<List<EnterpriseTestResult>> RunAllTestsAsync()
        {
            var results = new List<EnterpriseTestResult>();
            
            try
            {
                _logger.LogInformation("Starting enterprise testing framework");
                
                if (_options.EnablePerformanceTesting)
                {
                    var performanceResult = await RunPerformanceTestAsync();
                    results.Add(performanceResult);
                }
                
                if (_options.EnableStressTesting)
                {
                    var stressResult = await RunStressTestAsync();
                    results.Add(stressResult);
                }
                
                if (_options.EnableMemoryLeakDetection)
                {
                    var memoryLeakResult = await RunMemoryLeakDetectionAsync();
                    results.Add(memoryLeakResult);
                }
                
                if (_options.EnableDistributedLockTesting)
                {
                    var distributedLockResult = await RunDistributedLockTestAsync();
                    results.Add(distributedLockResult);
                }
                
                if (_options.EnableIntegrationTesting)
                {
                    var integrationResult = await RunIntegrationTestAsync();
                    results.Add(integrationResult);
                }
                
                _logger.LogInformation("Enterprise testing framework completed: {Count} tests run", results.Count);
                
                // 生成测试报告
                if (_options.GenerateDetailedReport)
                {
                    var reportPath = await GenerateTestReportAsync(results);
                    _logger.LogInformation("Test report generated: {ReportPath}", reportPath);
                    
                    if (_options.SendTestReport)
                    {
                        await SendTestReportAsync(reportPath);
                    }
                }
                
                // 发送告警
                var failedTests = results.Where(r => !r.IsPassed).ToList();
                if (failedTests.Any())
                {
                    await _alertingService.CreateAlertAsync(
                        AlertLevel.Warning,
                        AlertType.Testing,
                        "Enterprise Tests Failed",
                        $"{failedTests.Count} out of {results.Count} enterprise tests failed",
                        "EnterpriseTestingFramework",
                        new Dictionary<string, object>
                        {
                            ["TotalTests"] = results.Count,
                            ["FailedTests"] = failedTests.Count,
                            ["PassedTests"] = results.Count - failedTests.Count,
                            ["FailedTestNames"] = failedTests.Select(t => t.TestName).ToList()
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running enterprise tests");
                
                await _alertingService.CreateAlertAsync(
                    AlertLevel.Error,
                    AlertType.Testing,
                    "Enterprise Testing Framework Error",
                    $"Error running enterprise tests: {ex.Message}",
                    "EnterpriseTestingFramework",
                    new Dictionary<string, object>
                    {
                        ["Error"] = ex.Message,
                        ["StackTrace"] = ex.StackTrace
                    }
                );
            }
            
            return results;
        }

        public async Task<EnterpriseTestResult> RunPerformanceTestAsync()
        {
            var result = new EnterpriseTestResult
            {
                TestName = "Performance Test",
                TestType = "Performance",
                StartTime = DateTime.UtcNow,
                StartMemoryUsageMB = GC.GetTotalMemory(false) / (1024.0 * 1024.0)
            };

            try
            {
                _logger.LogInformation("Starting performance test");
                
                var responseTimes = new List<double>();
                var stopwatch = Stopwatch.StartNew();
                var tasks = new List<Task>();
                var semaphore = new SemaphoreSlim(_options.ConcurrentUsers);
                var cancellationTokenSource = new CancellationTokenSource(TimeSpan.FromSeconds(_options.TestDurationSeconds));
                var successfulRequests = 0;
                var failedRequests = 0;
                
                // 模拟并发请求
                while (!cancellationTokenSource.IsCancellationRequested)
                {
                    await semaphore.WaitAsync(cancellationTokenSource.Token);
                    
                    var task = Task.Run(async () =>
                    {
                        try
                        {
                            var requestStopwatch = Stopwatch.StartNew();
                            
                            // 模拟权限检查操作
                            using var scope = _serviceProvider.CreateScope();
                            var distributedLock = scope.ServiceProvider.GetService<IDistributedPermissionCacheLock>();
                            
                            if (distributedLock != null)
                            {
                                var lockKey = $"test_lock_{Guid.NewGuid()}";
                                var lockTimeout = TimeSpan.FromSeconds(5);
                                
                                var lockResult = await distributedLock.AcquireAsync(lockKey, lockTimeout);
                                if (lockResult.IsAcquired)
                                {
                                    await Task.Delay(TimeSpan.FromMilliseconds(10)); // 模拟处理时间
                                    await lockResult.ReleaseAsync();
                                    successfulRequests++;
                                }
                                else
                                {
                                    failedRequests++;
                                }
                            }
                            
                            requestStopwatch.Stop();
                            lock (responseTimes)
                            {
                                responseTimes.Add(requestStopwatch.Elapsed.TotalMilliseconds);
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Error in performance test request");
                            failedRequests++;
                        }
                        finally
                        {
                            semaphore.Release();
                        }
                    }, cancellationTokenSource.Token);
                    
                    tasks.Add(task);
                    
                    // 控制请求速率
                    await Task.Delay(TimeSpan.FromMilliseconds(10));
                }
                
                await Task.WhenAll(tasks);
                stopwatch.Stop();
                
                // 计算结果
                result.EndTime = DateTime.UtcNow;
                result.Duration = stopwatch.Elapsed;
                result.TotalRequests = responseTimes.Count;
                result.SuccessfulRequests = successfulRequests;
                result.FailedRequests = failedRequests;
                result.ErrorRate = result.TotalRequests > 0 ? (double)result.FailedRequests / result.TotalRequests * 100 : 0;
                
                if (responseTimes.Any())
                {
                    responseTimes.Sort();
                    result.MinResponseTimeMs = responseTimes.First();
                    result.MaxResponseTimeMs = responseTimes.Last();
                    result.AverageResponseTimeMs = responseTimes.Average();
                    result.P50ResponseTimeMs = responseTimes[responseTimes.Count / 2];
                    result.P95ResponseTimeMs = responseTimes[(int)(responseTimes.Count * 0.95)];
                    result.P99ResponseTimeMs = responseTimes[(int)(responseTimes.Count * 0.99)];
                }
                
                result.EndMemoryUsageMB = GC.GetTotalMemory(false) / (1024.0 * 1024.0);
                result.MemoryLeakMB = result.EndMemoryUsageMB - result.StartMemoryUsageMB;
                result.PeakMemoryUsageMB = result.EndMemoryUsageMB;
                
                // 检查是否通过
                result.IsPassed = result.ErrorRate <= _options.ErrorRateThreshold &&
                                result.AverageResponseTimeMs <= _options.PerformanceBaselineMs &&
                                result.MemoryLeakMB <= _options.MemoryLeakThresholdMB;
                
                if (!result.IsPassed)
                {
                    if (result.ErrorRate > _options.ErrorRateThreshold)
                        result.FailureReasons.Add($"Error rate {result.ErrorRate:F2}% exceeds threshold {_options.ErrorRateThreshold}%");
                    if (result.AverageResponseTimeMs > _options.PerformanceBaselineMs)
                        result.FailureReasons.Add($"Average response time {result.AverageResponseTimeMs:F2}ms exceeds baseline {_options.PerformanceBaselineMs}ms");
                    if (result.MemoryLeakMB > _options.MemoryLeakThresholdMB)
                        result.FailureReasons.Add($"Memory leak {result.MemoryLeakMB:F2}MB exceeds threshold {_options.MemoryLeakThresholdMB}MB");
                }
                
                _logger.LogInformation("Performance test completed: Total={TotalRequests}, Success={SuccessfulRequests}, Failed={FailedRequests}, AvgTime={AvgTime:F2}ms, ErrorRate={ErrorRate:F2}%",
                    result.TotalRequests, result.SuccessfulRequests, result.FailedRequests, result.AverageResponseTimeMs, result.ErrorRate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running performance test");
                result.FailureReasons.Add($"Exception: {ex.Message}");
            }
            
            return result;
        }

        public async Task<EnterpriseTestResult> RunStressTestAsync()
        {
            var result = new EnterpriseTestResult
            {
                TestName = "Stress Test",
                TestType = "Stress",
                StartTime = DateTime.UtcNow,
                StartMemoryUsageMB = GC.GetTotalMemory(false) / (1024.0 * 1024.0)
            };

            try
            {
                _logger.LogInformation("Starting stress test");
                
                // 运行更高强度的测试
                var stressOptions = new EnterpriseTestingOptions
                {
                    ConcurrentUsers = _options.ConcurrentUsers * 2,
                    TestDurationSeconds = _options.TestDurationSeconds / 2,
                    PerformanceBaselineMs = _options.PerformanceBaselineMs * 2,
                    ErrorRateThreshold = _options.ErrorRateThreshold * 2
                };
                
                var stressFramework = new EnterpriseTestingFramework(
                    _serviceProvider,
                    _logger,
                    Options.Create(stressOptions),
                    _performanceMonitor,
                    _memoryService,
                    _alertingService,
                    _integrationService
                );
                
                result = await stressFramework.RunPerformanceTestAsync();
                result.TestName = "Stress Test";
                result.TestType = "Stress";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running stress test");
                result.FailureReasons.Add($"Exception: {ex.Message}");
            }
            
            return result;
        }

        public async Task<EnterpriseTestResult> RunMemoryLeakDetectionAsync()
        {
            var result = new EnterpriseTestResult
            {
                TestName = "Memory Leak Detection",
                TestType = "MemoryLeak",
                StartTime = DateTime.UtcNow,
                StartMemoryUsageMB = GC.GetTotalMemory(false) / (1024.0 * 1024.0)
            };

            try
            {
                _logger.LogInformation("Starting memory leak detection");
                
                var memoryBefore = GC.GetTotalMemory(false);
                
                // 运行多次操作以检测内存泄漏
                for (int i = 0; i < 1000; i++)
                {
                    using var scope = _serviceProvider.CreateScope();
                    var distributedLock = scope.ServiceProvider.GetService<IDistributedPermissionCacheLock>();
                    
                    if (distributedLock != null)
                    {
                        var lockKey = $"memory_test_lock_{i}";
                        var lockTimeout = TimeSpan.FromSeconds(1);
                        
                        var lockResult = await distributedLock.AcquireAsync(lockKey, lockTimeout);
                        if (lockResult.IsAcquired)
                        {
                            await lockResult.ReleaseAsync();
                        }
                    }
                    
                    if (i % 100 == 0)
                    {
                        GC.Collect();
                        GC.WaitForPendingFinalizers();
                        GC.Collect();
                    }
                }
                
                var memoryAfter = GC.GetTotalMemory(false);
                var memoryLeak = (memoryAfter - memoryBefore) / (1024.0 * 1024.0);
                
                result.EndTime = DateTime.UtcNow;
                result.Duration = result.EndTime - result.StartTime;
                result.StartMemoryUsageMB = memoryBefore / (1024.0 * 1024.0);
                result.EndMemoryUsageMB = memoryAfter / (1024.0 * 1024.0);
                result.MemoryLeakMB = memoryLeak;
                result.PeakMemoryUsageMB = result.EndMemoryUsageMB;
                result.IsPassed = memoryLeak <= _options.MemoryLeakThresholdMB;
                
                if (!result.IsPassed)
                {
                    result.FailureReasons.Add($"Memory leak detected: {memoryLeak:F2}MB exceeds threshold {_options.MemoryLeakThresholdMB}MB");
                }
                
                _logger.LogInformation("Memory leak detection completed: MemoryLeak={MemoryLeak:F2}MB, Threshold={Threshold}MB",
                    memoryLeak, _options.MemoryLeakThresholdMB);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running memory leak detection");
                result.FailureReasons.Add($"Exception: {ex.Message}");
            }
            
            return result;
        }

        public async Task<EnterpriseTestResult> RunDistributedLockTestAsync()
        {
            var result = new EnterpriseTestResult
            {
                TestName = "Distributed Lock Test",
                TestType = "DistributedLock",
                StartTime = DateTime.UtcNow,
                StartMemoryUsageMB = GC.GetTotalMemory(false) / (1024.0 * 1024.0)
            };

            try
            {
                _logger.LogInformation("Starting distributed lock test");
                
                var lockKey = $"test_distributed_lock_{Guid.NewGuid()}";
                var lockTimeout = TimeSpan.FromSeconds(10);
                var tasks = new List<Task<bool>>();
                var successfulLocks = 0;
                var failedLocks = 0;
                
                // 模拟多个并发客户端尝试获取同一个锁
                for (int i = 0; i < 10; i++)
                {
                    var task = Task.Run(async () =>
                    {
                        try
                        {
                            using var scope = _serviceProvider.CreateScope();
                            var distributedLock = scope.ServiceProvider.GetRequiredService<IDistributedPermissionCacheLock>();
                            
                            var lockResult = await distributedLock.AcquireAsync(lockKey, lockTimeout);
                            if (lockResult.IsAcquired)
                            {
                                await Task.Delay(TimeSpan.FromSeconds(1)); // 模拟持有锁的时间
                                await lockResult.ReleaseAsync();
                                return true;
                            }
                            return false;
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Error in distributed lock test");
                            return false;
                        }
                    });
                    
                    tasks.Add(task);
                }
                
                var results = await Task.WhenAll(tasks);
                successfulLocks = results.Count(r => r);
                failedLocks = results.Count(r => !r);
                
                result.EndTime = DateTime.UtcNow;
                result.Duration = result.EndTime - result.StartTime;
                result.TotalRequests = tasks.Count;
                result.SuccessfulRequests = successfulLocks;
                result.FailedRequests = failedLocks;
                result.ErrorRate = (double)failedLocks / tasks.Count * 100;
                result.EndMemoryUsageMB = GC.GetTotalMemory(false) / (1024.0 * 1024.0);
                result.MemoryLeakMB = result.EndMemoryUsageMB - result.StartMemoryUsageMB;
                result.PeakMemoryUsageMB = result.EndMemoryUsageMB;
                
                // 分布式锁测试应该只有1个成功，其他都失败
                result.IsPassed = successfulLocks == 1 && failedLocks == tasks.Count - 1;
                
                if (!result.IsPassed)
                {
                    result.FailureReasons.Add($"Expected 1 successful lock, got {successfulLocks}");
                }
                
                _logger.LogInformation("Distributed lock test completed: Successful={SuccessfulLocks}, Failed={FailedLocks}, Expected=1",
                    successfulLocks, failedLocks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running distributed lock test");
                result.FailureReasons.Add($"Exception: {ex.Message}");
            }
            
            return result;
        }

        public async Task<EnterpriseTestResult> RunIntegrationTestAsync()
        {
            var result = new EnterpriseTestResult
            {
                TestName = "Integration Test",
                TestType = "Integration",
                StartTime = DateTime.UtcNow,
                StartMemoryUsageMB = GC.GetTotalMemory(false) / (1024.0 * 1024.0)
            };

            try
            {
                _logger.LogInformation("Starting integration test");
                
                // 测试各个集成服务的连接
                var healthCheckResults = await _integrationService.HealthCheckAllAsync();
                var successfulChecks = healthCheckResults.Count(r => r.IsHealthy);
                var failedChecks = healthCheckResults.Count(r => !r.IsHealthy);
                
                result.EndTime = DateTime.UtcNow;
                result.Duration = result.EndTime - result.StartTime;
                result.TotalRequests = healthCheckResults.Count;
                result.SuccessfulRequests = successfulChecks;
                result.FailedRequests = failedChecks;
                result.ErrorRate = (double)failedChecks / healthCheckResults.Count * 100;
                result.EndMemoryUsageMB = GC.GetTotalMemory(false) / (1024.0 * 1024.0);
                result.MemoryLeakMB = result.EndMemoryUsageMB - result.StartMemoryUsageMB;
                result.PeakMemoryUsageMB = result.EndMemoryUsageMB;
                result.IsPassed = failedChecks == 0;
                
                if (!result.IsPassed)
                {
                    var failedServices = healthCheckResults.Where(r => !r.IsHealthy).Select(r => r.ServiceType.ToString());
                    result.FailureReasons.Add($"Failed services: {string.Join(", ", failedServices)}");
                }
                
                _logger.LogInformation("Integration test completed: Total={Total}, Successful={Successful}, Failed={Failed}",
                    result.TotalRequests, result.SuccessfulRequests, result.FailedRequests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running integration test");
                result.FailureReasons.Add($"Exception: {ex.Message}");
            }
            
            return result;
        }

        public async Task<string> GenerateTestReportAsync(List<EnterpriseTestResult> results)
        {
            try
            {
                var reportPath = System.IO.Path.Combine(_options.TestReportPath, $"test-report-{DateTime.UtcNow:yyyyMMdd-HHmmss}.json");
                var reportDirectory = System.IO.Path.GetDirectoryName(reportPath);
                
                if (!System.IO.Directory.Exists(reportDirectory))
                {
                    System.IO.Directory.CreateDirectory(reportDirectory);
                }
                
                var report = new
                {
                    ReportId = Guid.NewGuid(),
                    GeneratedAt = DateTime.UtcNow,
                    TotalTests = results.Count,
                    PassedTests = results.Count(r => r.IsPassed),
                    FailedTests = results.Count(r => !r.IsPassed),
                    Results = results,
                    Summary = new
                    {
                        OverallStatus = results.All(r => r.IsPassed) ? "PASSED" : "FAILED",
                        AverageResponseTimeMs = results.Average(r => r.AverageResponseTimeMs),
                        AverageErrorRate = results.Average(r => r.ErrorRate),
                        TotalMemoryLeakMB = results.Sum(r => r.MemoryLeakMB)
                    }
                };
                
                var json = System.Text.Json.JsonSerializer.Serialize(report, new System.Text.Json.JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
                });
                
                await System.IO.File.WriteAllTextAsync(reportPath, json);
                
                _logger.LogInformation("Test report generated: {ReportPath}", reportPath);
                return reportPath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating test report");
                throw;
            }
        }

        public async Task<bool> SendTestReportAsync(string reportPath)
        {
            try
            {
                if (!System.IO.File.Exists(reportPath))
                {
                    _logger.LogWarning("Test report not found: {ReportPath}", reportPath);
                    return false;
                }
                
                var reportContent = await System.IO.File.ReadAllTextAsync(reportPath);
                var reportData = System.Text.Json.JsonSerializer.Deserialize<dynamic>(reportContent);
                
                // 发送测试报告到集成服务
                var metricsData = new List<Integration.IntegrationMetricsData>
                {
                    new Integration.IntegrationMetricsData
                    {
                        MetricName = "enterprise_tests_total",
                        Value = reportData.GetProperty("TotalTests").GetInt32(),
                        MetricType = "gauge",
                        Labels = new Dictionary<string, string> { ["type"] = "total" }
                    },
                    new Integration.IntegrationMetricsData
                    {
                        MetricName = "enterprise_tests_passed",
                        Value = reportData.GetProperty("PassedTests").GetInt32(),
                        MetricType = "gauge",
                        Labels = new Dictionary<string, string> { ["type"] = "passed" }
                    },
                    new Integration.IntegrationMetricsData
                    {
                        MetricName = "enterprise_tests_failed",
                        Value = reportData.GetProperty("FailedTests").GetInt32(),
                        MetricType = "gauge",
                        Labels = new Dictionary<string, string> { ["type"] = "failed" }
                    }
                };
                
                await _integrationService.SendMetricsAsync(Integration.IntegrationServiceType.Prometheus, metricsData);
                
                _logger.LogInformation("Test report sent successfully");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending test report");
                return false;
            }
        }
    }

    /// <summary>
    /// 企业级测试框架扩展
    /// </summary>
    public static class EnterpriseTestingFrameworkExtensions
    {
        /// <summary>
        /// 添加企业级测试框架
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <returns>服务集合</returns>
        public static IServiceCollection AddEnterpriseTestingFramework(this IServiceCollection services)
        {
            services.Configure<EnterpriseTestingOptions>(options =>
            {
                options.EnablePerformanceTesting = true;
                options.EnableStressTesting = true;
                options.EnableMemoryLeakDetection = true;
                options.EnableDistributedLockTesting = true;
                options.EnableIntegrationTesting = true;
                options.ConcurrentUsers = 100;
                options.TestDurationSeconds = 300;
                options.PerformanceBaselineMs = 100;
                options.MemoryLeakThresholdMB = 50;
                options.ErrorRateThreshold = 1.0;
                options.GenerateDetailedReport = true;
                options.SendTestReport = true;
            });
            
            services.AddSingleton<IEnterpriseTestingFramework, EnterpriseTestingFramework>();
            return services;
        }

        /// <summary>
        /// 添加企业级测试框架（带配置）
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <param name="configure">配置操作</param>
        /// <returns>服务集合</returns>
        public static IServiceCollection AddEnterpriseTestingFramework(
            this IServiceCollection services,
            Action<EnterpriseTestingOptions> configure)
        {
            services.Configure(configure);
            services.AddSingleton<IEnterpriseTestingFramework, EnterpriseTestingFramework>();
            return services;
        }
    }
}