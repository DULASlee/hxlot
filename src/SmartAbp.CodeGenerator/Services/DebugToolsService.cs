using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Services.V9;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// 调试测试工具服务 - Debug and Testing Tools Service
    /// Provides API testing, log querying, performance monitoring, and health check capabilities
    /// </summary>
    public class DebugToolsService
    {
        private readonly ILogger<DebugToolsService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;

        public DebugToolsService(
            ILogger<DebugToolsService> logger,
            IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // API测试 - API Testing
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 执行API测试
        /// </summary>
        public async Task<ApiTestResponseDto> ExecuteApiTestAsync(ApiTestRequestDto request)
        {
            var stopwatch = Stopwatch.StartNew();
            var response = new ApiTestResponseDto
            {
                TestedAt = DateTime.UtcNow
            };

            try
            {
                using var httpClient = _httpClientFactory.CreateClient();
                httpClient.Timeout = TimeSpan.FromSeconds(request.TimeoutSeconds);

                // 构建请求
                var httpRequest = new HttpRequestMessage
                {
                    Method = new HttpMethod(request.Method),
                    RequestUri = new Uri(BuildUrlWithQueryParams(request.Url, request.QueryParameters))
                };

                // 添加请求头
                foreach (var header in request.Headers)
                {
                    httpRequest.Headers.TryAddWithoutValidation(header.Key, header.Value);
                }

                // 添加请求体
                if (!string.IsNullOrEmpty(request.Body))
                {
                    httpRequest.Content = new StringContent(
                        request.Body,
                        Encoding.UTF8,
                        request.ContentType
                    );
                }

                // 执行请求
                var httpResponse = await httpClient.SendAsync(httpRequest);
                stopwatch.Stop();

                // 构建响应
                response.StatusCode = (int)httpResponse.StatusCode;
                response.StatusText = httpResponse.ReasonPhrase ?? string.Empty;
                response.Body = await httpResponse.Content.ReadAsStringAsync();
                response.ContentLength = response.Body.Length;
                response.ResponseTimeMs = stopwatch.ElapsedMilliseconds;
                response.IsSuccess = httpResponse.IsSuccessStatusCode;

                // 添加响应头
                foreach (var header in httpResponse.Headers)
                {
                    response.Headers[header.Key] = string.Join(", ", header.Value);
                }

                _logger.LogInformation(
                    "API测试完成: {Method} {Url} => {StatusCode} ({ResponseTime}ms)",
                    request.Method, request.Url, response.StatusCode, response.ResponseTimeMs
                );
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                response.IsSuccess = false;
                response.ErrorMessage = ex.Message;
                response.ResponseTimeMs = stopwatch.ElapsedMilliseconds;

                _logger.LogError(ex, "API测试失败: {Method} {Url}", request.Method, request.Url);
            }

            return response;
        }

        private string BuildUrlWithQueryParams(string baseUrl, Dictionary<string, string> queryParams)
        {
            if (queryParams == null || queryParams.Count == 0)
            {
                return baseUrl;
            }

            var queryString = string.Join("&", queryParams.Select(kvp => 
                $"{Uri.EscapeDataString(kvp.Key)}={Uri.EscapeDataString(kvp.Value)}"
            ));

            return baseUrl.Contains('?') 
                ? $"{baseUrl}&{queryString}" 
                : $"{baseUrl}?{queryString}";
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 日志查询 - Log Querying
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 查询日志
        /// </summary>
        public Task<LogQueryResultDto> QueryLogsAsync(LogQueryDto query)
        {
            // 模拟日志查询（实际应该从日志存储中查询，如Seq、Elasticsearch等）
            var logs = GenerateMockLogs(query);

            var totalCount = logs.Count;
            var skip = (query.PageNumber - 1) * query.PageSize;
            var pagedLogs = logs.Skip(skip).Take(query.PageSize).ToList();

            var result = new LogQueryResultDto
            {
                Logs = pagedLogs,
                TotalCount = totalCount,
                PageSize = query.PageSize,
                PageNumber = query.PageNumber,
                TotalPages = (int)Math.Ceiling((double)totalCount / query.PageSize)
            };

            _logger.LogInformation(
                "日志查询完成: Level={Level}, TotalCount={Count}, Page={Page}/{TotalPages}",
                query.Level, totalCount, query.PageNumber, result.TotalPages
            );

            return Task.FromResult(result);
        }

        private List<LogEntryDto> GenerateMockLogs(LogQueryDto query)
        {
            // 生成模拟日志数据（实际应该从日志系统中查询）
            var logs = new List<LogEntryDto>();
            var levels = new[] { "Information", "Warning", "Error", "Debug", "Trace" };
            var sources = new[] { "API", "Database", "Service", "Worker", "Background" };

            var startTime = query.StartTime ?? DateTime.UtcNow.AddHours(-1);
            var endTime = query.EndTime ?? DateTime.UtcNow;

            for (int i = 0; i < 50; i++)
            {
                var level = levels[Random.Shared.Next(levels.Length)];
                
                // 级别过滤
                if (query.Level != "All" && level != query.Level)
                {
                    continue;
                }

                var log = new LogEntryDto
                {
                    Timestamp = startTime.AddMinutes(Random.Shared.Next(0, 60)),
                    Level = level,
                    Message = $"模拟日志消息 {i}: {level} from {sources[Random.Shared.Next(sources.Length)]}",
                    Source = sources[Random.Shared.Next(sources.Length)],
                    TraceId = Guid.NewGuid().ToString("N")[..16],
                    Properties = new Dictionary<string, string>
                    {
                        ["UserId"] = Random.Shared.Next(1, 1000).ToString(),
                        ["RequestPath"] = $"/api/test/{Random.Shared.Next(1, 10)}",
                        ["Duration"] = $"{Random.Shared.Next(10, 500)}ms"
                    }
                };

                // 搜索文本过滤
                if (!string.IsNullOrEmpty(query.SearchText) && 
                    !log.Message.Contains(query.SearchText, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                // 来源过滤
                if (!string.IsNullOrEmpty(query.Source) && log.Source != query.Source)
                {
                    continue;
                }

                logs.Add(log);
            }

            return logs.OrderByDescending(l => l.Timestamp).ToList();
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 性能监控 - Performance Monitoring
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 获取性能指标
        /// </summary>
        public Task<PerformanceMetricsDto> GetPerformanceMetricsAsync(string serviceName)
        {
            // 获取当前进程的性能指标
            var process = Process.GetCurrentProcess();

            var metrics = new PerformanceMetricsDto
            {
                ServiceName = serviceName,
                CpuUsagePercent = GetCpuUsage(process),
                MemoryUsageMb = process.WorkingSet64 / 1024 / 1024,
                TotalMemoryMb = GC.GetTotalMemory(false) / 1024 / 1024,
                ActiveConnections = Random.Shared.Next(10, 100), // 模拟数据
                RequestsPerSecond = Random.Shared.Next(100, 1000),
                AverageResponseTimeMs = Random.Shared.Next(50, 200),
                P95ResponseTimeMs = Random.Shared.Next(200, 500),
                P99ResponseTimeMs = Random.Shared.Next(500, 1000),
                ErrorCount = Random.Shared.Next(0, 10),
                ErrorRate = Random.Shared.NextDouble() * 0.05, // 0-5%
                CollectedAt = DateTime.UtcNow
            };

            _logger.LogInformation(
                "性能指标收集完成: Service={Service}, CPU={Cpu:F2}%, Memory={Memory}MB",
                serviceName, metrics.CpuUsagePercent, metrics.MemoryUsageMb
            );

            return Task.FromResult(metrics);
        }

        private double GetCpuUsage(Process process)
        {
            // 简化的CPU使用率计算（实际应该使用性能计数器）
            try
            {
                var startTime = DateTime.UtcNow;
                var startCpuUsage = process.TotalProcessorTime;
                
                System.Threading.Thread.Sleep(100);
                
                var endTime = DateTime.UtcNow;
                var endCpuUsage = process.TotalProcessorTime;
                
                var cpuUsedMs = (endCpuUsage - startCpuUsage).TotalMilliseconds;
                var totalMsPassed = (endTime - startTime).TotalMilliseconds;
                var cpuUsageTotal = cpuUsedMs / (Environment.ProcessorCount * totalMsPassed);
                
                return cpuUsageTotal * 100;
            }
            catch
            {
                return 0;
            }
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 健康检查 - Health Check
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        /// <summary>
        /// 执行健康检查
        /// </summary>
        public Task<HealthCheckResultDto> PerformHealthCheckAsync(string serviceName)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = new HealthCheckResultDto
            {
                ServiceName = serviceName,
                CheckedAt = DateTime.UtcNow,
                Checks = new Dictionary<string, HealthCheckItemDto>()
            };

            // 数据库健康检查
            result.Checks["Database"] = CheckDatabaseHealth();

            // Redis健康检查
            result.Checks["Redis"] = CheckRedisHealth();

            // RabbitMQ健康检查
            result.Checks["RabbitMQ"] = CheckRabbitMQHealth();

            // 文件系统健康检查
            result.Checks["FileSystem"] = CheckFileSystemHealth();

            // 内存健康检查
            result.Checks["Memory"] = CheckMemoryHealth();

            stopwatch.Stop();
            result.TotalDurationMs = stopwatch.ElapsedMilliseconds;

            // 确定总体状态
            var unhealthyCount = result.Checks.Count(c => c.Value.Status == "Unhealthy");
            var degradedCount = result.Checks.Count(c => c.Value.Status == "Degraded");

            result.Status = unhealthyCount > 0 ? "Unhealthy" :
                            degradedCount > 0 ? "Degraded" :
                            "Healthy";

            result.Description = unhealthyCount > 0 
                ? $"{unhealthyCount} 个检查项不健康"
                : degradedCount > 0 
                    ? $"{degradedCount} 个检查项降级" 
                    : "所有检查项健康";

            _logger.LogInformation(
                "健康检查完成: Service={Service}, Status={Status}, Duration={Duration}ms",
                serviceName, result.Status, result.TotalDurationMs
            );

            return Task.FromResult(result);
        }

        private HealthCheckItemDto CheckDatabaseHealth()
        {
            // 模拟数据库健康检查
            var duration = Random.Shared.Next(10, 50);
            return new HealthCheckItemDto
            {
                Status = "Healthy",
                Description = "数据库连接正常",
                DurationMs = duration,
                Data = new Dictionary<string, string>
                {
                    ["ConnectionString"] = "Server=localhost;Database=SmartAbp;",
                    ["ResponseTime"] = $"{duration}ms"
                }
            };
        }

        private HealthCheckItemDto CheckRedisHealth()
        {
            // 模拟Redis健康检查
            var duration = Random.Shared.Next(5, 20);
            return new HealthCheckItemDto
            {
                Status = "Healthy",
                Description = "Redis缓存正常",
                DurationMs = duration,
                Data = new Dictionary<string, string>
                {
                    ["Host"] = "localhost:6379",
                    ["ResponseTime"] = $"{duration}ms"
                }
            };
        }

        private HealthCheckItemDto CheckRabbitMQHealth()
        {
            // 模拟RabbitMQ健康检查
            var duration = Random.Shared.Next(10, 30);
            return new HealthCheckItemDto
            {
                Status = "Healthy",
                Description = "消息队列正常",
                DurationMs = duration,
                Data = new Dictionary<string, string>
                {
                    ["Host"] = "localhost:5672",
                    ["ResponseTime"] = $"{duration}ms"
                }
            };
        }

        private HealthCheckItemDto CheckFileSystemHealth()
        {
            // 检查磁盘空间
            try
            {
                var drive = DriveInfo.GetDrives().FirstOrDefault(d => d.IsReady);
                if (drive != null)
                {
                    var freeSpaceGb = drive.AvailableFreeSpace / 1024 / 1024 / 1024;
                    var totalSpaceGb = drive.TotalSize / 1024 / 1024 / 1024;
                    var usagePercent = (double)(totalSpaceGb - freeSpaceGb) / totalSpaceGb * 100;

                    return new HealthCheckItemDto
                    {
                        Status = freeSpaceGb < 1 ? "Unhealthy" : freeSpaceGb < 10 ? "Degraded" : "Healthy",
                        Description = $"磁盘可用空间: {freeSpaceGb}GB / {totalSpaceGb}GB",
                        DurationMs = 5,
                        Data = new Dictionary<string, string>
                        {
                            ["FreeSpace"] = $"{freeSpaceGb}GB",
                            ["TotalSpace"] = $"{totalSpaceGb}GB",
                            ["UsagePercent"] = $"{usagePercent:F2}%"
                        }
                    };
                }
            }
            catch (Exception ex)
            {
                return new HealthCheckItemDto
                {
                    Status = "Unhealthy",
                    Description = "文件系统检查失败",
                    Exception = ex.Message,
                    DurationMs = 0
                };
            }

            return new HealthCheckItemDto
            {
                Status = "Degraded",
                Description = "无法获取磁盘信息",
                DurationMs = 0
            };
        }

        private HealthCheckItemDto CheckMemoryHealth()
        {
            // 检查内存使用
            var process = Process.GetCurrentProcess();
            var memoryUsageMb = process.WorkingSet64 / 1024 / 1024;
            var gcMemoryMb = GC.GetTotalMemory(false) / 1024 / 1024;

            return new HealthCheckItemDto
            {
                Status = memoryUsageMb > 1024 ? "Degraded" : "Healthy",
                Description = $"内存使用: {memoryUsageMb}MB",
                DurationMs = 2,
                Data = new Dictionary<string, string>
                {
                    ["WorkingSet"] = $"{memoryUsageMb}MB",
                    ["GCMemory"] = $"{gcMemoryMb}MB",
                    ["Gen0Collections"] = GC.CollectionCount(0).ToString(),
                    ["Gen1Collections"] = GC.CollectionCount(1).ToString(),
                    ["Gen2Collections"] = GC.CollectionCount(2).ToString()
                }
            };
        }
    }
}

