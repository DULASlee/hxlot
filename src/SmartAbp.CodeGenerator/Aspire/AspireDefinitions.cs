using System;
using System.Collections.Generic;
using JetBrains.Annotations;

namespace SmartAbp.CodeGenerator.Aspire
{
    /// <summary>
    /// Complete definition for Aspire-based microservices solution
    /// </summary>
    public sealed class AspireSolutionDefinition
    {
        [PublicAPI]
        public string SolutionName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string RootNamespace { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public IList<MicroserviceDefinition> Microservices { get; set; } = new List<MicroserviceDefinition>();
        
        [PublicAPI]
        public bool IncludeApiGateway { get; set; } = true;
        
        [PublicAPI]
        public string DatabaseName { get; set; } = "AppDatabase";
        
        // Infrastructure Services
        [PublicAPI]
        public bool UsePostgreSQL { get; set; } = true;
        
        [PublicAPI]
        public bool UseRedis { get; set; } = true;
        
        [PublicAPI]
        public bool UseRabbitMQ { get; set; } = true;
        
        [PublicAPI]
        public bool UseElasticsearch { get; set; } = true;
        
        [PublicAPI]
        public bool UseSeq { get; set; } = true;
        
        [PublicAPI]
        public bool UseDapr { get; set; } = false;
        
        [PublicAPI]
        public bool UseServiceMesh { get; set; } = false;
        
        // Development Configuration
        [PublicAPI]
        public AspireEnvironmentConfig DevelopmentConfig { get; set; } = new();
        
        [PublicAPI]
        public AspireEnvironmentConfig ProductionConfig { get; set; } = new();
        
        // Security Configuration
        [PublicAPI]
        public SecurityConfiguration Security { get; set; } = new();
        
        // Observability Configuration
        [PublicAPI]
        public ObservabilityConfiguration Observability { get; set; } = new();
    }
    
    /// <summary>
    /// Definition for individual microservice
    /// </summary>
    public sealed class MicroserviceDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string ProjectName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string DisplayName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public string BaseNamespace { get; set; } = string.Empty;
        
        [PublicAPI]
        public int Replicas { get; set; } = 1;
        
        [PublicAPI]
        public bool UseDapr { get; set; } = false;
        
        [PublicAPI]
        public bool UseServiceDiscovery { get; set; } = true;
        
        [PublicAPI]
        public bool UseHealthChecks { get; set; } = true;
        
        [PublicAPI]
        public bool UseOpenTelemetry { get; set; } = true;
        
        [PublicAPI]
        public bool UseAuthentication { get; set; } = true;
        
        [PublicAPI]
        public bool UseAuthorization { get; set; } = true;
        
        [PublicAPI]
        public IList<string> Dependencies { get; set; } = new List<string>();
        
        [PublicAPI]
        public IList<ExposedEndpoint> Endpoints { get; set; } = new List<ExposedEndpoint>();
        
        [PublicAPI]
        public IDictionary<string, string> EnvironmentVariables { get; set; } = new Dictionary<string, string>();
        
        [PublicAPI]
        public ResourceLimits Resources { get; set; } = new();
        
        [PublicAPI]
        public ServiceType Type { get; set; } = ServiceType.WebApi;
    }
    
    /// <summary>
    /// Exposed endpoint configuration
    /// </summary>
    public sealed class ExposedEndpoint
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public int Port { get; set; }
        
        [PublicAPI]
        public string Protocol { get; set; } = "HTTP";
        
        [PublicAPI]
        public bool IsExternal { get; set; } = false;
        
        [PublicAPI]
        public string? Path { get; set; }
    }
    
    /// <summary>
    /// Resource limits for microservices
    /// </summary>
    public sealed class ResourceLimits
    {
        [PublicAPI]
        public string CpuLimit { get; set; } = "1000m";
        
        [PublicAPI]
        public string MemoryLimit { get; set; } = "512Mi";
        
        [PublicAPI]
        public string CpuRequest { get; set; } = "100m";
        
        [PublicAPI]
        public string MemoryRequest { get; set; } = "128Mi";
    }
    
    /// <summary>
    /// Environment-specific configuration
    /// </summary>
    public sealed class AspireEnvironmentConfig
    {
        [PublicAPI]
        public string Environment { get; set; } = "Development";
        
        [PublicAPI]
        public LogLevel LogLevel { get; set; } = LogLevel.Information;
        
        [PublicAPI]
        public IDictionary<string, string> ConnectionStrings { get; set; } = new Dictionary<string, string>();
        
        [PublicAPI]
        public IDictionary<string, object> Settings { get; set; } = new Dictionary<string, object>();
        
        [PublicAPI]
        public bool EnableDetailedErrors { get; set; } = true;
        
        [PublicAPI]
        public bool EnableSensitiveDataLogging { get; set; } = false;
    }
    
    /// <summary>
    /// Security configuration for the solution
    /// </summary>
    public sealed class SecurityConfiguration
    {
        [PublicAPI]
        public bool UseHttpsRedirection { get; set; } = true;
        
        [PublicAPI]
        public bool UseHsts { get; set; } = true;
        
        [PublicAPI]
        public string IdentityServerUrl { get; set; } = string.Empty;
        
        [PublicAPI]
        public string JwtIssuer { get; set; } = string.Empty;
        
        [PublicAPI]
        public string JwtAudience { get; set; } = string.Empty;
        
        [PublicAPI]
        public bool UseApiKeys { get; set; } = false;
        
        [PublicAPI]
        public bool UseCors { get; set; } = true;
        
        [PublicAPI]
        public IList<string> AllowedOrigins { get; set; } = new List<string>();
    }
    
    /// <summary>
    /// Observability configuration
    /// </summary>
    public sealed class ObservabilityConfiguration
    {
        [PublicAPI]
        public bool UseOpenTelemetry { get; set; } = true;
        
        [PublicAPI]
        public bool UsePrometheus { get; set; } = true;
        
        [PublicAPI]
        public bool UseJaeger { get; set; } = true;
        
        [PublicAPI]
        public bool UseSeq { get; set; } = true;
        
        [PublicAPI]
        public string SeqUrl { get; set; } = "http://seq:5341";
        
        [PublicAPI]
        public string JaegerUrl { get; set; } = "http://jaeger:14268";
        
        [PublicAPI]
        public string PrometheusUrl { get; set; } = "http://prometheus:9090";
        
        [PublicAPI]
        public IDictionary<string, string> CustomMetrics { get; set; } = new Dictionary<string, string>();
    }
    
    /// <summary>
    /// Result of Aspire solution generation
    /// </summary>
    public sealed class GeneratedAspireSolution
    {
        [PublicAPI]
        public string SolutionName { get; set; } = string.Empty;
        
        [PublicAPI]
        public IDictionary<string, string> Files { get; set; } = new Dictionary<string, string>();
        
        [PublicAPI]
        public int MicroserviceCount { get; set; }
        
        [PublicAPI]
        public DateTime GeneratedAt { get; set; }
        
        [PublicAPI]
        public AspireSolutionStatistics Statistics { get; set; } = new();
    }
    
    /// <summary>
    /// Statistics about generated Aspire solution
    /// </summary>
    public sealed class AspireSolutionStatistics
    {
        [PublicAPI]
        public int TotalProjects { get; set; }
        
        [PublicAPI]
        public int TotalConfigFiles { get; set; }
        
        [PublicAPI]
        public int TotalDockerFiles { get; set; }
        
        [PublicAPI]
        public int TotalInfrastructureServices { get; set; }
        
        [PublicAPI]
        public bool HasApiGateway { get; set; }
        
        [PublicAPI]
        public bool HasServiceDiscovery { get; set; }
        
        [PublicAPI]
        public bool HasLoadBalancing { get; set; }
        
        [PublicAPI]
        public bool HasDistributedTracing { get; set; }
        
        [PublicAPI]
        public bool HasHealthChecks { get; set; }
    }
    
    /// <summary>
    /// Service type enumeration
    /// </summary>
    public enum ServiceType
    {
        WebApi,
        GrpcService,
        BackgroundService,
        WebApp,
        GraphQL,
        SignalR,
        MinimalApi
    }
    
    /// <summary>
    /// Log level enumeration
    /// </summary>
    public enum LogLevel
    {
        Trace,
        Debug,
        Information,
        Warning,
        Error,
        Critical,
        None
    }
    
    /// <summary>
    /// Deployment target enumeration
    /// </summary>
    public enum DeploymentTarget
    {
        Docker,
        Kubernetes,
        AzureContainerApps,
        AzureAppService,
        AzureKubernetesService,
        AwsEcs,
        AwsEks,
        GoogleCloudRun,
        GoogleKubernetesEngine
    }
    
    /// <summary>
    /// Service mesh configuration
    /// </summary>
    public sealed class ServiceMeshConfiguration
    {
        [PublicAPI]
        public bool UseServiceMesh { get; set; } = false;
        
        [PublicAPI]
        public ServiceMeshType Type { get; set; } = ServiceMeshType.Istio;
        
        [PublicAPI]
        public bool UseMutualTls { get; set; } = true;
        
        [PublicAPI]
        public bool UseRateLimiting { get; set; } = true;
        
        [PublicAPI]
        public bool UseCircuitBreaker { get; set; } = true;
        
        [PublicAPI]
        public bool UseRetryPolicy { get; set; } = true;
    }
    
    /// <summary>
    /// Service mesh type enumeration
    /// </summary>
    public enum ServiceMeshType
    {
        Istio,
        Linkerd,
        ConsulConnect,
        AwsAppMesh,
        Kuma
    }
}