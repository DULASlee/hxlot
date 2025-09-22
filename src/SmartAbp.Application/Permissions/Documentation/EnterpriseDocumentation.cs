using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.Json;
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
using SmartAbp.Permissions.Testing;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.Permissions.Documentation
{
    /// <summary>
    /// 企业级文档选项
    /// </summary>
    public class EnterpriseDocumentationOptions
    {
        /// <summary>
        /// 是否启用API文档生成
        /// </summary>
        public bool EnableApiDocumentation { get; set; } = true;

        /// <summary>
        /// 是否启用架构文档生成
        /// </summary>
        public bool EnableArchitectureDocumentation { get; set; } = true;

        /// <summary>
        /// 是否启用性能文档生成
        /// </summary>
        public bool EnablePerformanceDocumentation { get; set; } = true;

        /// <summary>
        /// 是否启用监控文档生成
        /// </summary>
        public bool EnableMonitoringDocumentation { get; set; } = true;

        /// <summary>
        /// 是否启用部署文档生成
        /// </summary>
        public bool EnableDeploymentDocumentation { get; set; } = true;

        /// <summary>
        /// 文档输出路径
        /// </summary>
        public string DocumentationOutputPath { get; set; } = "./docs";

        /// <summary>
        /// 文档格式
        /// </summary>
        public DocumentationFormat Format { get; set; } = DocumentationFormat.Markdown;

        /// <summary>
        /// 是否包含私有成员
        /// </summary>
        public bool IncludePrivateMembers { get; set; } = false;

        /// <summary>
        /// 是否包含内部成员
        /// </summary>
        public bool IncludeInternalMembers { get; set; } = true;

        /// <summary>
        /// 是否包含示例代码
        /// </summary>
        public bool IncludeExamples { get; set; } = true;

        /// <summary>
        /// 是否包含性能基准
        /// </summary>
        public bool IncludePerformanceBenchmarks { get; set; } = true;

        /// <summary>
        /// 文档生成间隔（小时）
        /// </summary>
        public int GenerationIntervalHours { get; set; } = 24;

        /// <summary>
        /// 是否自动生成
        /// </summary>
        public bool AutoGenerate { get; set; } = true;

        /// <summary>
        /// 是否发送通知
        /// </summary>
        public bool SendNotification { get; set; } = true;
    }

    /// <summary>
    /// 文档格式枚举
    /// </summary>
    public enum DocumentationFormat
    {
        /// <summary>
        /// Markdown格式
        /// </summary>
        Markdown,
        /// <summary>
        /// HTML格式
        /// </summary>
        Html,
        /// <summary>
        /// JSON格式
        /// </summary>
        Json,
        /// <summary>
        /// XML格式
        /// </summary>
        Xml
    }

    /// <summary>
    /// 文档信息模型
    /// </summary>
    public class DocumentationInfo
    {
        /// <summary>
        /// 文档ID
        /// </summary>
        public string DocumentId { get; set; }

        /// <summary>
        /// 文档标题
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// 文档类型
        /// </summary>
        public string DocumentType { get; set; }

        /// <summary>
        /// 生成时间
        /// </summary>
        public DateTime GeneratedAt { get; set; }

        /// <summary>
        /// 文件路径
        /// </summary>
        public string FilePath { get; set; }

        /// <summary>
        /// 文件大小（字节）
        /// </summary>
        public long FileSize { get; set; }

        /// <summary>
        /// 版本信息
        /// </summary>
        public string Version { get; set; }

        /// <summary>
        /// 包含的服务数量
        /// </summary>
        public int ServiceCount { get; set; }

        /// <summary>
        /// 包含的接口数量
        /// </summary>
        public int InterfaceCount { get; set; }

        /// <summary>
        /// 包含的方法数量
        /// </summary>
        public int MethodCount { get; set; }
    }

    /// <summary>
    /// 服务文档模型
    /// </summary>
    public class ServiceDocumentation
    {
        /// <summary>
        /// 服务名称
        /// </summary>
        public string ServiceName { get; set; }

        /// <summary>
        /// 服务描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 服务类型
        /// </summary>
        public string ServiceType { get; set; }

        /// <summary>
        /// 生命周期
        /// </summary>
        public string Lifetime { get; set; }

        /// <summary>
        /// 实现的接口
        /// </summary>
        public List<string> ImplementedInterfaces { get; set; } = new List<string>();

        /// <summary>
        /// 依赖的服务
        /// </summary>
        public List<string> Dependencies { get; set; } = new List<string>();

        /// <summary>
        /// 配置选项
        /// </summary>
        public List<ConfigurationOption> ConfigurationOptions { get; set; } = new List<ConfigurationOption>();

        /// <summary>
        /// 性能特征
        /// </summary>
        public PerformanceCharacteristics Performance { get; set; }

        /// <summary>
        /// 使用示例
        /// </summary>
        public List<string> UsageExamples { get; set; } = new List<string>();
    }

    /// <summary>
    /// 配置选项模型
    /// </summary>
    public class ConfigurationOption
    {
        /// <summary>
        /// 选项名称
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 选项类型
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// 默认值
        /// </summary>
        public object DefaultValue { get; set; }

        /// <summary>
        /// 描述
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// 是否必需
        /// </summary>
        public bool IsRequired { get; set; }
    }

    /// <summary>
    /// 性能特征模型
    /// </summary>
    public class PerformanceCharacteristics
    {
        /// <summary>
        /// 平均响应时间（毫秒）
        /// </summary>
        public double AverageResponseTimeMs { get; set; }

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
        /// 吞吐量（请求/秒）
        /// </summary>
        public double ThroughputRPS { get; set; }

        /// <summary>
        /// 错误率（%）
        /// </summary>
        public double ErrorRate { get; set; }

        /// <summary>
        /// 缓存命中率（%）
        /// </summary>
        public double CacheHitRate { get; set; }
    }

    /// <summary>
    /// 企业级文档生成器接口
    /// </summary>
    public interface IEnterpriseDocumentationGenerator
    {
        /// <summary>
        /// 生成所有文档
        /// </summary>
        /// <returns>文档信息列表</returns>
        Task<List<DocumentationInfo>> GenerateAllDocumentationAsync();

        /// <summary>
        /// 生成API文档
        /// </summary>
        /// <returns>文档信息</returns>
        Task<DocumentationInfo> GenerateApiDocumentationAsync();

        /// <summary>
        /// 生成架构文档
        /// </summary>
        /// <returns>文档信息</returns>
        Task<DocumentationInfo> GenerateArchitectureDocumentationAsync();

        /// <summary>
        /// 生成性能文档
        /// </summary>
        /// <returns>文档信息</returns>
        Task<DocumentationInfo> GeneratePerformanceDocumentationAsync();

        /// <summary>
        /// 生成监控文档
        /// </summary>
        /// <returns>文档信息</returns>
        Task<DocumentationInfo> GenerateMonitoringDocumentationAsync();

        /// <summary>
        /// 生成部署文档
        /// </summary>
        /// <returns>文档信息</returns>
        Task<DocumentationInfo> GenerateDeploymentDocumentationAsync();

        /// <summary>
        /// 获取服务文档
        /// </summary>
        /// <param name="serviceType">服务类型</param>
        /// <returns>服务文档</returns>
        Task<ServiceDocumentation> GetServiceDocumentationAsync(Type serviceType);

        /// <summary>
        /// 获取性能基准
        /// </summary>
        /// <returns>性能基准数据</returns>
        Task<PerformanceCharacteristics> GetPerformanceBenchmarksAsync();
    }

    /// <summary>
    /// 企业级文档生成器实现
    /// </summary>
    public class EnterpriseDocumentationGenerator : IEnterpriseDocumentationGenerator, ISingletonDependency
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<EnterpriseDocumentationGenerator> _logger;
        private readonly EnterpriseDocumentationOptions _options;
        private readonly IPermissionPerformanceMonitor _performanceMonitor;
        private readonly IMemoryManagementService _memoryService;
        private readonly IPermissionAlertingService _alertingService;
        private readonly IEnterpriseIntegrationService _integrationService;

        public EnterpriseDocumentationGenerator(
            IServiceProvider serviceProvider,
            ILogger<EnterpriseDocumentationGenerator> logger,
            IOptions<EnterpriseDocumentationOptions> options,
            IPermissionPerformanceMonitor performanceMonitor,
            IMemoryManagementService memoryService,
            IPermissionAlertingService alertingService,
            IEnterpriseIntegrationService integrationService)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _options = options?.Value ?? new EnterpriseDocumentationOptions();
            _performanceMonitor = performanceMonitor;
            _memoryService = memoryService;
            _alertingService = alertingService;
            _integrationService = integrationService;
        }

        public async Task<List<DocumentationInfo>> GenerateAllDocumentationAsync()
        {
            var documents = new List<DocumentationInfo>();
            
            try
            {
                _logger.LogInformation("Starting enterprise documentation generation");
                
                if (_options.EnableApiDocumentation)
                {
                    var apiDoc = await GenerateApiDocumentationAsync();
                    documents.Add(apiDoc);
                }
                
                if (_options.EnableArchitectureDocumentation)
                {
                    var archDoc = await GenerateArchitectureDocumentationAsync();
                    documents.Add(archDoc);
                }
                
                if (_options.EnablePerformanceDocumentation)
                {
                    var perfDoc = await GeneratePerformanceDocumentationAsync();
                    documents.Add(perfDoc);
                }
                
                if (_options.EnableMonitoringDocumentation)
                {
                    var monDoc = await GenerateMonitoringDocumentationAsync();
                    documents.Add(monDoc);
                }
                
                if (_options.EnableDeploymentDocumentation)
                {
                    var deployDoc = await GenerateDeploymentDocumentationAsync();
                    documents.Add(deployDoc);
                }
                
                _logger.LogInformation("Enterprise documentation generation completed: {Count} documents generated", documents.Count);
                
                // 发送通知
                if (_options.SendNotification)
                {
                    await _alertingService.CreateAlertAsync(
                        AlertLevel.Info,
                        AlertType.Documentation,
                        "Documentation Generated",
                        $"Generated {documents.Count} enterprise documentation files",
                        "EnterpriseDocumentationGenerator",
                        new Dictionary<string, object>
                        {
                            ["DocumentCount"] = documents.Count,
                            ["GeneratedAt"] = DateTime.UtcNow,
                            ["DocumentTypes"] = documents.Select(d => d.DocumentType).ToList()
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating enterprise documentation");
                
                await _alertingService.CreateAlertAsync(
                    AlertLevel.Error,
                    AlertType.Documentation,
                    "Documentation Generation Error",
                    $"Error generating enterprise documentation: {ex.Message}",
                    "EnterpriseDocumentationGenerator",
                    new Dictionary<string, object>
                    {
                        ["Error"] = ex.Message,
                        ["StackTrace"] = ex.StackTrace
                    }
                );
            }
            
            return documents;
        }

        public async Task<DocumentationInfo> GenerateApiDocumentationAsync()
        {
            var documentId = Guid.NewGuid().ToString();
            var title = "SmartAbp Enterprise Permission Services API Documentation";
            var fileName = $"api-documentation-{DateTime.UtcNow:yyyyMMdd-HHmmss}";
            var filePath = Path.Combine(_options.DocumentationOutputPath, $"{fileName}.md");
            
            try
            {
                var services = new List<ServiceDocumentation>();
                
                // 收集所有企业级服务
                var serviceTypes = new[]
                {
                    typeof(IDistributedPermissionCacheLock),
                    typeof(IAbpDistributedPermissionCacheLock),
                    typeof(IPermissionPerformanceMonitor),
                    typeof(IMemoryManagementService),
                    typeof(IPermissionAlertingService),
                    typeof(IEnterpriseIntegrationService),
                    typeof(IPermissionConfigurationService),
                    typeof(IEnterpriseTestingFramework)
                };
                
                foreach (var serviceType in serviceTypes)
                {
                    var serviceDoc = await GetServiceDocumentationAsync(serviceType);
                    services.Add(serviceDoc);
                }
                
                var content = GenerateApiDocumentationContent(title, services);
                await WriteDocumentationFile(filePath, content);
                
                var info = new DocumentationInfo
                {
                    DocumentId = documentId,
                    Title = title,
                    DocumentType = "API",
                    GeneratedAt = DateTime.UtcNow,
                    FilePath = filePath,
                    FileSize = new FileInfo(filePath).Length,
                    Version = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "1.0.0",
                    ServiceCount = services.Count,
                    InterfaceCount = services.SelectMany(s => s.ImplementedInterfaces).Distinct().Count(),
                    MethodCount = services.Sum(s => s.UsageExamples.Count)
                };
                
                _logger.LogInformation("API documentation generated: {FilePath}", filePath);
                return info;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating API documentation");
                throw;
            }
        }

        public async Task<DocumentationInfo> GenerateArchitectureDocumentationAsync()
        {
            var documentId = Guid.NewGuid().ToString();
            var title = "SmartAbp Enterprise Permission Services Architecture Documentation";
            var fileName = $"architecture-documentation-{DateTime.UtcNow:yyyyMMdd-HHmmss}";
            var filePath = Path.Combine(_options.DocumentationOutputPath, $"{fileName}.md");
            
            try
            {
                var content = GenerateArchitectureDocumentationContent(title);
                await WriteDocumentationFile(filePath, content);
                
                var info = new DocumentationInfo
                {
                    DocumentId = documentId,
                    Title = title,
                    DocumentType = "Architecture",
                    GeneratedAt = DateTime.UtcNow,
                    FilePath = filePath,
                    FileSize = new FileInfo(filePath).Length,
                    Version = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "1.0.0",
                    ServiceCount = 8, // 估算的企业级服务数量
                    InterfaceCount = 15,
                    MethodCount = 50
                };
                
                _logger.LogInformation("Architecture documentation generated: {FilePath}", filePath);
                return info;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating architecture documentation");
                throw;
            }
        }

        public async Task<DocumentationInfo> GeneratePerformanceDocumentationAsync()
        {
            var documentId = Guid.NewGuid().ToString();
            var title = "SmartAbp Enterprise Permission Services Performance Documentation";
            var fileName = $"performance-documentation-{DateTime.UtcNow:yyyyMMdd-HHmmss}";
            var filePath = Path.Combine(_options.DocumentationOutputPath, $"{fileName}.md");
            
            try
            {
                var benchmarks = await GetPerformanceBenchmarksAsync();
                var content = GeneratePerformanceDocumentationContent(title, benchmarks);
                await WriteDocumentationFile(filePath, content);
                
                var info = new DocumentationInfo
                {
                    DocumentId = documentId,
                    Title = title,
                    DocumentType = "Performance",
                    GeneratedAt = DateTime.UtcNow,
                    FilePath = filePath,
                    FileSize = new FileInfo(filePath).Length,
                    Version = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "1.0.0",
                    ServiceCount = 8,
                    InterfaceCount = 15,
                    MethodCount = 50
                };
                
                _logger.LogInformation("Performance documentation generated: {FilePath}", filePath);
                return info;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating performance documentation");
                throw;
            }
        }

        public async Task<DocumentationInfo> GenerateMonitoringDocumentationAsync()
        {
            var documentId = Guid.NewGuid().ToString();
            var title = "SmartAbp Enterprise Permission Services Monitoring Documentation";
            var fileName = $"monitoring-documentation-{DateTime.UtcNow:yyyyMMdd-HHmmss}";
            var filePath = Path.Combine(_options.DocumentationOutputPath, $"{fileName}.md");
            
            try
            {
                var content = GenerateMonitoringDocumentationContent(title);
                await WriteDocumentationFile(filePath, content);
                
                var info = new DocumentationInfo
                {
                    DocumentId = documentId,
                    Title = title,
                    DocumentType = "Monitoring",
                    GeneratedAt = DateTime.UtcNow,
                    FilePath = filePath,
                    FileSize = new FileInfo(filePath).Length,
                    Version = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "1.0.0",
                    ServiceCount = 8,
                    InterfaceCount = 15,
                    MethodCount = 50
                };
                
                _logger.LogInformation("Monitoring documentation generated: {FilePath}", filePath);
                return info;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating monitoring documentation");
                throw;
            }
        }

        public async Task<DocumentationInfo> GenerateDeploymentDocumentationAsync()
        {
            var documentId = Guid.NewGuid().ToString();
            var title = "SmartAbp Enterprise Permission Services Deployment Documentation";
            var fileName = $"deployment-documentation-{DateTime.UtcNow:yyyyMMdd-HHmmss}";
            var filePath = Path.Combine(_options.DocumentationOutputPath, $"{fileName}.md");
            
            try
            {
                var content = GenerateDeploymentDocumentationContent(title);
                await WriteDocumentationFile(filePath, content);
                
                var info = new DocumentationInfo
                {
                    DocumentId = documentId,
                    Title = title,
                    DocumentType = "Deployment",
                    GeneratedAt = DateTime.UtcNow,
                    FilePath = filePath,
                    FileSize = new FileInfo(filePath).Length,
                    Version = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "1.0.0",
                    ServiceCount = 8,
                    InterfaceCount = 15,
                    MethodCount = 50
                };
                
                _logger.LogInformation("Deployment documentation generated: {FilePath}", filePath);
                return info;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating deployment documentation");
                throw;
            }
        }

        public async Task<ServiceDocumentation> GetServiceDocumentationAsync(Type serviceType)
        {
            try
            {
                var serviceDoc = new ServiceDocumentation
                {
                    ServiceName = serviceType.Name,
                    Description = GetTypeDescription(serviceType),
                    ServiceType = serviceType.FullName,
                    Lifetime = "Singleton", // 假设大部分企业级服务都是单例
                    ImplementedInterfaces = serviceType.GetInterfaces().Select(i => i.Name).ToList(),
                    Dependencies = GetServiceDependencies(serviceType),
                    ConfigurationOptions = GetConfigurationOptions(serviceType),
                    // TODO: GetPerformanceCharacteristicsAsync 方法不存在
                    // Performance = await GetPerformanceCharacteristicsAsync(),
                    UsageExamples = GetUsageExamples(serviceType)
                };
                
                return serviceDoc;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting service documentation for {ServiceType}", serviceType.Name);
                throw;
            }
        }

        public async Task<PerformanceCharacteristics> GetPerformanceBenchmarksAsync()
        {
            try
            {
                var metrics = _performanceMonitor.GetCurrentMetrics();
                var memoryInfo = _memoryService.GetMemoryInfo();
                
                return new PerformanceCharacteristics
                {
                    AverageResponseTimeMs = metrics.AverageResponseTimeMs,
                    P95ResponseTimeMs = metrics.P95ResponseTimeMs,
                    P99ResponseTimeMs = metrics.P99ResponseTimeMs,
                    PeakMemoryUsageMB = memoryInfo.UsedMemoryMB,
                    ThroughputRPS = metrics.TotalRequests / Math.Max(metrics.TotalRequests, 1), // 简化计算
                    ErrorRate = metrics.ErrorRate,
                    CacheHitRate = metrics.CacheHitRate
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance benchmarks");
                return new PerformanceCharacteristics();
            }
        }

        private string GenerateApiDocumentationContent(string title, List<ServiceDocumentation> services)
        {
            var content = new StringBuilder();
            content.AppendLine($"# {title}");
            content.AppendLine();
            content.AppendLine($"Generated at: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
            content.AppendLine($"Version: {Assembly.GetExecutingAssembly().GetName().Version}");
            content.AppendLine();
            content.AppendLine("## Overview");
            content.AppendLine();
            content.AppendLine("This document provides comprehensive API documentation for SmartAbp Enterprise Permission Services.");
            content.AppendLine("It includes detailed information about all available services, their interfaces, configuration options, and usage examples.");
            content.AppendLine();
            content.AppendLine($"## Services ({services.Count})");
            content.AppendLine();
            
            foreach (var service in services)
            {
                content.AppendLine($"### {service.ServiceName}");
                content.AppendLine();
                content.AppendLine($"**Type:** `{service.ServiceType}`");
                content.AppendLine($"**Description:** {service.Description}");
                content.AppendLine($"**Lifetime:** {service.Lifetime}");
                content.AppendLine();
                
                if (service.ImplementedInterfaces.Any())
                {
                    content.AppendLine("**Implemented Interfaces:**");
                    foreach (var iface in service.ImplementedInterfaces)
                    {
                        content.AppendLine($"- `{iface}`");
                    }
                    content.AppendLine();
                }
                
                if (service.ConfigurationOptions.Any())
                {
                    content.AppendLine("**Configuration Options:**");
                    content.AppendLine("| Option | Type | Default | Required | Description |");
                    content.AppendLine("|--------|------|---------|----------|-------------|");
                    foreach (var option in service.ConfigurationOptions)
                    {
                        content.AppendLine($"| {option.Name} | {option.Type} | {option.DefaultValue} | {(option.IsRequired ? "Yes" : "No")} | {option.Description} |");
                    }
                    content.AppendLine();
                }
                
                if (_options.IncludePerformanceBenchmarks && service.Performance != null)
                {
                    content.AppendLine("**Performance Characteristics:**");
                    content.AppendLine($"- Average Response Time: {service.Performance.AverageResponseTimeMs:F2}ms");
                    content.AppendLine($"- P95 Response Time: {service.Performance.P95ResponseTimeMs:F2}ms");
                    content.AppendLine($"- P99 Response Time: {service.Performance.P99ResponseTimeMs:F2}ms");
                    content.AppendLine($"- Peak Memory Usage: {service.Performance.PeakMemoryUsageMB:F2}MB");
                    content.AppendLine($"- Throughput: {service.Performance.ThroughputRPS:F2} RPS");
                    content.AppendLine($"- Error Rate: {service.Performance.ErrorRate:F2}%");
                    content.AppendLine($"- Cache Hit Rate: {service.Performance.CacheHitRate:F2}%");
                    content.AppendLine();
                }
                
                if (_options.IncludeExamples && service.UsageExamples.Any())
                {
                    content.AppendLine("**Usage Examples:**");
                    foreach (var example in service.UsageExamples)
                    {
                        content.AppendLine("```csharp");
                        content.AppendLine(example);
                        content.AppendLine("```");
                        content.AppendLine();
                    }
                }
                
                content.AppendLine("---");
                content.AppendLine();
            }
            
            return content.ToString();
        }

        private string GenerateArchitectureDocumentationContent(string title)
        {
            var content = new StringBuilder();
            content.AppendLine($"# {title}");
            content.AppendLine();
            content.AppendLine($"Generated at: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
            content.AppendLine($"Version: {Assembly.GetExecutingAssembly().GetName().Version}");
            content.AppendLine();
            content.AppendLine("## System Architecture");
            content.AppendLine();
            content.AppendLine("SmartAbp Enterprise Permission Services follows a layered architecture pattern:");
            content.AppendLine();
            content.AppendLine("### Core Components");
            content.AppendLine();
            content.AppendLine("1. **Distributed Lock Services** - Redis-based distributed locking");
            content.AppendLine("2. **Performance Monitoring** - Real-time performance metrics and alerting");
            content.AppendLine("3. **Memory Management** - Automated memory optimization and leak detection");
            content.AppendLine("4. **Alerting System** - Multi-level alerting with notification support");
            content.AppendLine("5. **Integration Services** - External system integration (Redis, Elasticsearch, Prometheus)");
            content.AppendLine("6. **Configuration Management** - Dynamic configuration with validation");
            content.AppendLine("7. **Testing Framework** - Enterprise-grade testing capabilities");
            content.AppendLine("8. **Background Services** - Automated health checks and monitoring");
            content.AppendLine();
            content.AppendLine("### Technology Stack");
            content.AppendLine();
            content.AppendLine("- **Framework**: ABP Framework 9.x");
            content.AppendLine("- **Language**: C# .NET 8.0+");
            content.AppendLine("- **Caching**: Redis with distributed locking");
            content.AppendLine("- **Monitoring**: Custom performance monitoring");
            content.AppendLine("- **Configuration**: Options pattern with validation");
            content.AppendLine("- **Testing**: xUnit/NUnit with custom enterprise testing framework");
            content.AppendLine();
            content.AppendLine("### Deployment Architecture");
            content.AppendLine();
            content.AppendLine("The system supports multiple deployment scenarios:");
            content.AppendLine("- Single instance with local Redis");
            content.AppendLine("- Multi-instance with distributed Redis cluster");
            content.AppendLine("- Containerized deployment with Docker/Kubernetes");
            content.AppendLine("- Cloud-native deployment with auto-scaling");
            
            return content.ToString();
        }

        private string GeneratePerformanceDocumentationContent(string title, PerformanceCharacteristics benchmarks)
        {
            var content = new StringBuilder();
            content.AppendLine($"# {title}");
            content.AppendLine();
            content.AppendLine($"Generated at: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
            content.AppendLine($"Version: {Assembly.GetExecutingAssembly().GetName().Version}");
            content.AppendLine();
            content.AppendLine("## Performance Benchmarks");
            content.AppendLine();
            content.AppendLine("### Current Performance Metrics");
            content.AppendLine();
            content.AppendLine($"- **Average Response Time**: {benchmarks.AverageResponseTimeMs:F2}ms");
            content.AppendLine($"- **P95 Response Time**: {benchmarks.P95ResponseTimeMs:F2}ms");
            content.AppendLine($"- **P99 Response Time**: {benchmarks.P99ResponseTimeMs:F2}ms");
            content.AppendLine($"- **Peak Memory Usage**: {benchmarks.PeakMemoryUsageMB:F2}MB");
            content.AppendLine($"- **Throughput**: {benchmarks.ThroughputRPS:F2} RPS");
            content.AppendLine($"- **Error Rate**: {benchmarks.ErrorRate:F2}%");
            content.AppendLine($"- **Cache Hit Rate**: {benchmarks.CacheHitRate:F2}%");
            content.AppendLine();
            content.AppendLine("### Performance Targets");
            content.AppendLine();
            content.AppendLine("- **Response Time**: < 100ms average, < 200ms P95, < 500ms P99");
            content.AppendLine("- **Memory Usage**: < 512MB peak per service instance");
            content.AppendLine("- **Throughput**: > 1000 RPS per service instance");
            content.AppendLine("- **Error Rate**: < 1% overall");
            content.AppendLine("- **Cache Hit Rate**: > 95% for permission checks");
            content.AppendLine();
            content.AppendLine("### Optimization Recommendations");
            content.AppendLine();
            content.AppendLine("1. **Memory Management**: Enable automatic memory optimization");
            content.AppendLine("2. **Caching Strategy**: Implement multi-level caching");
            content.AppendLine("3. **Connection Pooling**: Optimize database and Redis connections");
            content.AppendLine("4. **Async Operations**: Ensure all I/O operations are asynchronous");
            content.AppendLine("5. **Resource Monitoring**: Enable detailed performance monitoring");
            
            return content.ToString();
        }

        private string GenerateMonitoringDocumentationContent(string title)
        {
            var content = new StringBuilder();
            content.AppendLine($"# {title}");
            content.AppendLine();
            content.AppendLine($"Generated at: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
            content.AppendLine($"Version: {Assembly.GetExecutingAssembly().GetName().Version}");
            content.AppendLine();
            content.AppendLine("## Monitoring Overview");
            content.AppendLine();
            content.AppendLine("SmartAbp Enterprise Permission Services provides comprehensive monitoring capabilities:");
            content.AppendLine();
            content.AppendLine("### Health Checks");
            content.AppendLine();
            content.AppendLine("- **Interval**: 60 seconds");
            content.AppendLine("- **Timeout**: 30 seconds");
            content.AppendLine("- **Retry Count**: 3");
            content.AppendLine("- **Monitored Services**: Redis, Elasticsearch, Prometheus");
            content.AppendLine();
            content.AppendLine("### Performance Monitoring");
            content.AppendLine();
            content.AppendLine("- **Monitoring Interval**: 5 minutes");
            content.AppendLine("- **Trend Analysis**: 24-hour window");
            content.AppendLine("- **Report Threshold**: 1000ms response time");
            content.AppendLine("- **Metrics**: Response time, cache hit rate, error rate");
            content.AppendLine();
            content.AppendLine("### Memory Management");
            content.AppendLine();
            content.AppendLine("- **Check Interval**: 5 minutes");
            content.AppendLine("- **Optimization Interval**: 1 hour");
            content.AppendLine("- **GC Interval**: 6 hours");
            content.AppendLine("- **Warning Threshold**: 512MB");
            content.AppendLine("- **Critical Threshold**: 1024MB");
            content.AppendLine();
            content.AppendLine("### Alerting System");
            content.AppendLine();
            content.AppendLine("- **Alert Levels**: Info, Warning, Error, Critical");
            content.AppendLine("- **Alert Types**: Performance, Memory, Configuration, System");
            content.AppendLine("- **Notification Channels**: Email, Slack, Webhook");
            content.AppendLine("- **Escalation**: Automatic escalation for critical alerts");
            
            return content.ToString();
        }

        private string GenerateDeploymentDocumentationContent(string title)
        {
            var content = new StringBuilder();
            content.AppendLine($"# {title}");
            content.AppendLine();
            content.AppendLine($"Generated at: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
            content.AppendLine($"Version: {Assembly.GetExecutingAssembly().GetName().Version}");
            content.AppendLine();
            content.AppendLine("## Deployment Requirements");
            content.AppendLine();
            content.AppendLine("### System Requirements");
            content.AppendLine();
            content.AppendLine("- **.NET Runtime**: 8.0 or higher");
            content.AppendLine("- **Memory**: Minimum 2GB, Recommended 4GB+");
            content.AppendLine("- **CPU**: 2 cores minimum, 4+ cores recommended");
            content.AppendLine("- **Storage**: 10GB+ available space");
            content.AppendLine("- **Network**: Stable network connection for distributed features");
            content.AppendLine();
            content.AppendLine("### External Dependencies");
            content.AppendLine();
            content.AppendLine("- **Redis**: 6.0+ for distributed locking and caching");
            content.AppendLine("- **Elasticsearch**: 7.x+ for log aggregation (optional)");
            content.AppendLine("- **Prometheus**: 2.x+ for metrics collection (optional)");
            content.AppendLine();
            content.AppendLine("### Configuration Steps");
            content.AppendLine();
            content.AppendLine("1. **Install Dependencies**: Redis, Elasticsearch, Prometheus");
            content.AppendLine("2. **Configure Services**: Update appsettings.json with connection strings");
            content.AppendLine("3. **Deploy Application**: Use Docker or direct deployment");
            content.AppendLine("4. **Verify Health**: Check health endpoints and monitoring dashboards");
            content.AppendLine("5. **Configure Alerts**: Set up notification channels");
            content.AppendLine();
            content.AppendLine("### Docker Deployment");
            content.AppendLine();
            content.AppendLine("```yaml");
            content.AppendLine("version: '3.8'");
            content.AppendLine("services:");
            content.AppendLine("  smartabp:");
            content.AppendLine("    image: smartabp/enterprise-permission:latest");
            content.AppendLine("    ports:");
            content.AppendLine("      - '5000:5000'");
            content.AppendLine("    environment:");
            content.AppendLine("      - Redis__Configuration=redis:6379");
            content.AppendLine("      - Elasticsearch__Url=http://elasticsearch:9200");
            content.AppendLine("    depends_on:");
            content.AppendLine("      - redis");
            content.AppendLine("      - elasticsearch");
            content.AppendLine("  redis:");
            content.AppendLine("    image: redis:7-alpine");
            content.AppendLine("    ports:");
            content.AppendLine("      - '6379:6379'");
            content.AppendLine("  elasticsearch:");
            content.AppendLine("    image: elasticsearch:7.17.0");
            content.AppendLine("    ports:");
            content.AppendLine("      - '9200:9200'");
            content.AppendLine("    environment:");
            content.AppendLine("      - discovery.type=single-node");
            content.AppendLine("```");
            
            return content.ToString();
        }

        private async Task WriteDocumentationFile(string filePath, string content)
        {
            var directory = Path.GetDirectoryName(filePath);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            
            await File.WriteAllTextAsync(filePath, content, Encoding.UTF8);
        }

        private string GetTypeDescription(Type type)
        {
            var attribute = type.GetCustomAttribute<System.ComponentModel.DescriptionAttribute>();
            return attribute?.Description ?? $"Provides {type.Name} functionality";
        }

        private List<string> GetServiceDependencies(Type serviceType)
        {
            var dependencies = new List<string>();
            
            // 获取构造函数参数
            var constructors = serviceType.GetConstructors();
            if (constructors.Any())
            {
                var constructor = constructors[0];
                foreach (var parameter in constructor.GetParameters())
                {
                    dependencies.Add(parameter.ParameterType.Name);
                }
            }
            
            return dependencies.Distinct().ToList();
        }

        private List<ConfigurationOption> GetConfigurationOptions(Type serviceType)
        {
            var options = new List<ConfigurationOption>();
            
            // 基于服务类型添加常见的配置选项
            if (serviceType.Name.Contains("Cache"))
            {
                options.Add(new ConfigurationOption
                {
                    Name = "CacheTimeout",
                    Type = "TimeSpan",
                    DefaultValue = "00:05:00",
                    Description = "Cache timeout duration",
                    IsRequired = false
                });
            }
            
            if (serviceType.Name.Contains("Performance"))
            {
                options.Add(new ConfigurationOption
                {
                    Name = "MonitoringInterval",
                    Type = "int",
                    DefaultValue = "300",
                    Description = "Monitoring interval in seconds",
                    IsRequired = false
                });
            }
            
            if (serviceType.Name.Contains("Memory"))
            {
                options.Add(new ConfigurationOption
                {
                    Name = "MemoryThresholdMB",
                    Type = "long",
                    DefaultValue = "512",
                    Description = "Memory warning threshold in MB",
                    IsRequired = false
                });
            }
            
            return options;
        }

        private List<string> GetUsageExamples(Type serviceType)
        {
            var examples = new List<string>();
            
            if (serviceType == typeof(IDistributedPermissionCacheLock))
            {
                examples.Add(@"// Acquire distributed lock
var lockResult = await distributedLock.AcquireAsync(""resource-key"", TimeSpan.FromSeconds(30));
if (lockResult.IsAcquired)
{
    try
    {
        // Critical section
        await ProcessResourceAsync();
    }
    finally
    {
        await lockResult.ReleaseAsync();
    }
}");
            }
            
            if (serviceType == typeof(IPermissionPerformanceMonitor))
            {
                examples.Add(@"// Record performance metrics
performanceMonitor.RecordPermissionCheck(true, 15.5, true);

// Get current metrics
var metrics = performanceMonitor.GetCurrentMetrics();
Console.WriteLine($""Cache hit rate: {metrics.CacheHitRate:F2}%"");");
            }
            
            if (serviceType == typeof(IMemoryManagementService))
            {
                examples.Add(@"// Get memory information
var memoryInfo = memoryService.GetMemoryInfo();
Console.WriteLine($""Used memory: {memoryInfo.UsedMemoryMB}MB"");

// Optimize memory
var result = await memoryService.OptimizeMemoryAsync();
Console.WriteLine($""Freed {result.FreedMemoryMB}MB of memory"");");
            }
            
            return examples;
        }
    }

    /// <summary>
    /// 企业级文档生成器扩展
    /// </summary>
    public static class EnterpriseDocumentationGeneratorExtensions
    {
        /// <summary>
        /// 添加企业级文档生成器
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <returns>服务集合</returns>
        public static IServiceCollection AddEnterpriseDocumentationGenerator(this IServiceCollection services)
        {
            services.Configure<EnterpriseDocumentationOptions>(options =>
            {
                options.EnableApiDocumentation = true;
                options.EnableArchitectureDocumentation = true;
                options.EnablePerformanceDocumentation = true;
                options.EnableMonitoringDocumentation = true;
                options.EnableDeploymentDocumentation = true;
                options.DocumentationOutputPath = "./docs";
                options.Format = DocumentationFormat.Markdown;
                options.IncludeExamples = true;
                options.IncludePerformanceBenchmarks = true;
                options.AutoGenerate = true;
                options.SendNotification = true;
            });
            
            services.AddSingleton<IEnterpriseDocumentationGenerator, EnterpriseDocumentationGenerator>();
            return services;
        }

        /// <summary>
        /// 添加企业级文档生成器（带配置）
        /// </summary>
        /// <param name="services">服务集合</param>
        /// <param name="configure">配置操作</param>
        /// <returns>服务集合</returns>
        public static IServiceCollection AddEnterpriseDocumentationGenerator(
            this IServiceCollection services,
            Action<EnterpriseDocumentationOptions> configure)
        {
            services.Configure(configure);
            services.AddSingleton<IEnterpriseDocumentationGenerator, EnterpriseDocumentationGenerator>();
            return services;
        }
    }
}