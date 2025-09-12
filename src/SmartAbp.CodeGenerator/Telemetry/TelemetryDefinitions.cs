using System;
using System.Collections.Generic;
using System.Threading;
using JetBrains.Annotations;

namespace SmartAbp.CodeGenerator.Telemetry
{
    /// <summary>
    /// Definition for telemetry and observability solution
    /// </summary>
    public sealed class TelemetryDefinition
    {
        [PublicAPI]
        public string ModuleName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Namespace { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<MetricDefinition> Metrics { get; set; } = new List<MetricDefinition>();
        
        [PublicAPI]
        public IList<TracingPointDefinition> TracingPoints { get; set; } = new List<TracingPointDefinition>();
        
        [PublicAPI]
        public IList<HealthCheckDefinition> HealthChecks { get; set; } = new List<HealthCheckDefinition>();
        
        [PublicAPI]
        public TelemetryConfiguration Configuration { get; set; } = new();
    }
    
    /// <summary>
    /// Definition for metrics
    /// </summary>
    public sealed class MetricDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public MetricType Type { get; set; } = MetricType.Counter;
        
        [PublicAPI]
        public string Unit { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<string> Tags { get; set; } = new List<string>();
    }
    
    /// <summary>
    /// Definition for tracing points
    /// </summary>
    public sealed class TracingPointDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public TracingLevel Level { get; set; } = TracingLevel.Information;
        
        [PublicAPI]
        public IList<string> Tags { get; set; } = new List<string>();
    }
    
    /// <summary>
    /// Definition for health checks
    /// </summary>
    public sealed class HealthCheckDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public HealthCheckType Type { get; set; } = HealthCheckType.Database;
        
        [PublicAPI]
        public TimeSpan Timeout { get; set; } = TimeSpan.FromSeconds(30);
        
        [PublicAPI]
        public bool IsCritical { get; set; } = true;
    }
    
    /// <summary>
    /// Telemetry configuration
    /// </summary>
    public sealed class TelemetryConfiguration
    {
        [PublicAPI]
        public bool EnableOpenTelemetry { get; set; } = true;
        
        [PublicAPI]
        public bool EnableMetrics { get; set; } = true;
        
        [PublicAPI]
        public bool EnableTracing { get; set; } = true;
        
        [PublicAPI]
        public bool EnableLogging { get; set; } = true;
        
        [PublicAPI]
        public string JaegerEndpoint { get; set; } = "http://jaeger:14268";
        
        [PublicAPI]
        public string PrometheusEndpoint { get; set; } = "http://prometheus:9090";
        
        [PublicAPI]
        public string OtlpEndpoint { get; set; } = "http://otel-collector:4317";
        
        [PublicAPI]
        public bool EnableConsoleExporter { get; set; } = false;
        
        [PublicAPI]
        public int MetricExportIntervalMs { get; set; } = 30000;
        
        [PublicAPI]
        public int TraceBatchSize { get; set; } = 512;
        
        [PublicAPI]
        public TimeSpan TraceExportTimeout { get; set; } = TimeSpan.FromSeconds(30);
    }
    
    /// <summary>
    /// Generated telemetry solution result
    /// </summary>
    public sealed class GeneratedTelemetrySolution
    {
        [PublicAPI]
        public string ModuleName { get; set; } = string.Empty;
        
        [PublicAPI]
        public IDictionary<string, string> Files { get; set; } = new Dictionary<string, string>();
        
        [PublicAPI]
        public int MetricsCount { get; set; }
        
        [PublicAPI]
        public int TracingCount { get; set; }
        
        [PublicAPI]
        public int HealthChecksCount { get; set; }
        
        [PublicAPI]
        public DateTime GeneratedAt { get; set; }
        
        [PublicAPI]
        public TelemetryStatistics Statistics { get; set; } = new();
    }
    
    /// <summary>
    /// Runtime telemetry statistics
    /// </summary>
    public sealed class TelemetryStatistics
    {
        private long _metricsRecorded;
        private long _countersRecorded;
        private long _histogramsRecorded;
        private long _activitiesStarted;
        private long _eventsRecorded;
        private long _exceptionsRecorded;
        private long _operationsCompleted;
        private long _operationsFailed;
        private long _errors;
        
        public long MetricsRecorded => _metricsRecorded;
        public long CountersRecorded => _countersRecorded;
        public long HistogramsRecorded => _histogramsRecorded;
        public long ActivitiesStarted => _activitiesStarted;
        public long EventsRecorded => _eventsRecorded;
        public long ExceptionsRecorded => _exceptionsRecorded;
        public long OperationsCompleted => _operationsCompleted;
        public long OperationsFailed => _operationsFailed;
        public long Errors => _errors;
        
        public double SuccessRate => _operationsCompleted + _operationsFailed > 0 
            ? (double)_operationsCompleted / (_operationsCompleted + _operationsFailed) 
            : 0;
        
        public void IncrementMetricsRecorded() => Interlocked.Increment(ref _metricsRecorded);
        public void IncrementCountersRecorded() => Interlocked.Increment(ref _countersRecorded);
        public void IncrementHistogramsRecorded() => Interlocked.Increment(ref _histogramsRecorded);
        public void IncrementActivitiesStarted() => Interlocked.Increment(ref _activitiesStarted);
        public void IncrementEventsRecorded() => Interlocked.Increment(ref _eventsRecorded);
        public void IncrementExceptionsRecorded() => Interlocked.Increment(ref _exceptionsRecorded);
        public void IncrementOperationsCompleted() => Interlocked.Increment(ref _operationsCompleted);
        public void IncrementOperationsFailed() => Interlocked.Increment(ref _operationsFailed);
        public void IncrementErrors() => Interlocked.Increment(ref _errors);
        
        public TelemetryStatistics Clone() => new()
        {
            _metricsRecorded = _metricsRecorded,
            _countersRecorded = _countersRecorded,
            _histogramsRecorded = _histogramsRecorded,
            _activitiesStarted = _activitiesStarted,
            _eventsRecorded = _eventsRecorded,
            _exceptionsRecorded = _exceptionsRecorded,
            _operationsCompleted = _operationsCompleted,
            _operationsFailed = _operationsFailed,
            _errors = _errors
        };
    }
    
    /// <summary>
    /// Metric type enumeration
    /// </summary>
    public enum MetricType
    {
        Counter,
        Gauge,
        Histogram,
        Summary
    }
    
    /// <summary>
    /// Tracing level enumeration
    /// </summary>
    public enum TracingLevel
    {
        Verbose,
        Debug,
        Information,
        Warning,
        Error,
        Critical
    }
    
    /// <summary>
    /// Health check type enumeration
    /// </summary>
    public enum HealthCheckType
    {
        Database,
        Cache,
        MessageQueue,
        ExternalService,
        FileSystem,
        Memory,
        Cpu,
        Custom
    }
    
    /// <summary>
    /// Observability platform enumeration
    /// </summary>
    public enum ObservabilityPlatform
    {
        OpenTelemetry,
        ApplicationInsights,
        Datadog,
        NewRelic,
        Jaeger,
        Zipkin,
        Prometheus,
        Grafana
    }
}