using System;
using System.Collections.Generic;

namespace SmartAbp.CodeGenerator.Services
{
    // Entity Generation DTOs
    public class EntityDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public string Aggregate { get; set; } = string.Empty;
        public string KeyType { get; set; } = "Guid";
        public string? Description { get; set; }
        public bool IsAggregateRoot { get; set; } = true;
        public bool IsMultiTenant { get; set; } = true;
        public bool IsSoftDelete { get; set; } = true;
        public bool HasExtraProperties { get; set; } = true;
        public List<PropertyDefinitionDto> Properties { get; set; } = new();
        public List<NavigationPropertyDefinitionDto> NavigationProperties { get; set; } = new();
        public List<CollectionDefinitionDto> Collections { get; set; } = new();
        public List<DomainMethodDefinitionDto> DomainMethods { get; set; } = new();
    }
    
    public class PropertyDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public bool IsReadOnly { get; set; }
        public bool IsUnique { get; set; }
        public int? MaxLength { get; set; }
        public int? MinLength { get; set; }
        public string? DefaultValue { get; set; }
        public string? Description { get; set; }
    }
    
    public class NavigationPropertyDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string RelationType { get; set; } = string.Empty;
        public bool IsLazyLoaded { get; set; } = true;
        public string? ForeignKey { get; set; }
        public string? InverseProperty { get; set; }
    }
    
    public class CollectionDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty;
        public bool IsReadOnly { get; set; } = true;
        public string? Description { get; set; }
    }
    
    public class DomainMethodDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string ReturnType { get; set; } = "void";
        public bool IsAsync { get; set; }
        public string? Description { get; set; }
        public List<ParameterDefinitionDto> Parameters { get; set; } = new();
        public string? MethodBody { get; set; }
    }
    
    public class ParameterDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsOptional { get; set; }
        public string? DefaultValue { get; set; }
    }
    
    public class GeneratedCodeDto
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string SourceCode { get; set; } = string.Empty;
        public CodeMetadataDto Metadata { get; set; } = new();
        public TimeSpan GenerationTime { get; set; }
        public string? SessionId { get; set; }
    }
    
    public class CodeMetadataDto
    {
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        public string GeneratorVersion { get; set; } = "1.0.0";
        public int LinesOfCode { get; set; }
        public Dictionary<string, object> AdditionalProperties { get; set; } = new();
    }
    
    // DDD Generation DTOs
    public class DddDefinitionDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<AggregateDefinitionDto> Aggregates { get; set; } = new();
        public List<ValueObjectDefinitionDto> ValueObjects { get; set; } = new();
        public List<DomainEventDefinitionDto> DomainEvents { get; set; } = new();
        public List<SpecificationDefinitionDto> Specifications { get; set; } = new();
        public List<DomainServiceDefinitionDto> DomainServices { get; set; } = new();
    }
    
    public class AggregateDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<PropertyDefinitionDto> Properties { get; set; } = new();
        public List<BusinessRuleDefinitionDto> BusinessRules { get; set; } = new();
        public List<DomainEventDefinitionDto> Events { get; set; } = new();
    }
    
    public class ValueObjectDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<PropertyDefinitionDto> Properties { get; set; } = new();
    }
    
    public class DomainEventDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<PropertyDefinitionDto> Properties { get; set; } = new();
    }
    
    public class SpecificationDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string TargetEntity { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
    }
    
    public class DomainServiceDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<DomainMethodDefinitionDto> Methods { get; set; } = new();
    }
    
    public class BusinessRuleDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Condition { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
        public List<string> Parameters { get; set; } = new();
    }
    
    public class GeneratedDddSolutionDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public Dictionary<string, string> Files { get; set; } = new();
        public int AggregateCount { get; set; }
        public int ValueObjectCount { get; set; }
        public int DomainEventCount { get; set; }
        public DateTime GeneratedAt { get; set; }
        public string SessionId { get; set; } = string.Empty;
    }
    
    // CQRS Generation DTOs
    public class CqrsDefinitionDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public List<CommandDefinitionDto> Commands { get; set; } = new();
        public List<QueryDefinitionDto> Queries { get; set; } = new();
        public List<EventDefinitionDto> Events { get; set; } = new();
    }
    
    public class CommandDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ReturnType { get; set; } = "void";
        public List<PropertyDefinitionDto> Properties { get; set; } = new();
        public bool RequiresTransaction { get; set; } = true;
        public bool RequiresAuthorization { get; set; } = true;
    }
    
    public class QueryDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ReturnType { get; set; } = string.Empty;
        public List<ParameterDefinitionDto> Parameters { get; set; } = new();
        public bool IsPaged { get; set; } = false;
        public bool IsCacheable { get; set; } = true;
    }
    
    public class EventDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<PropertyDefinitionDto> Properties { get; set; } = new();
        public bool IsIntegrationEvent { get; set; } = false;
    }
    
    public class GeneratedCqrsSolutionDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public Dictionary<string, string> Files { get; set; } = new();
        public int CommandCount { get; set; }
        public int QueryCount { get; set; }
        public int EventCount { get; set; }
        public DateTime GeneratedAt { get; set; }
        public string SessionId { get; set; } = string.Empty;
    }
    
    // Application Services DTOs
    public class ApplicationServiceDefinitionDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool SupportsCrud { get; set; } = true;
        public bool RequiresAuthorization { get; set; } = true;
        public string AuthorizationPolicy { get; set; } = string.Empty;
        public bool UseAutoMapper { get; set; } = true;
        public bool UseFluentValidation { get; set; } = true;
        public bool UseCaching { get; set; } = true;
        public bool UseAuditLogging { get; set; } = true;
    }
    
    public class GeneratedApplicationLayerDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public Dictionary<string, string> Files { get; set; } = new();
        public int DtoCount { get; set; }
        public int ValidatorCount { get; set; }
        public int AuthHandlerCount { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
    
    // Infrastructure DTOs
    public class InfrastructureDefinitionDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public List<EntityDefinitionDto> Entities { get; set; } = new();
        public List<RepositoryDefinitionDto> Repositories { get; set; } = new();
    }
    
    public class RepositoryDefinitionDto
    {
        public string EntityName { get; set; } = string.Empty;
        public string DbContextName { get; set; } = string.Empty;
        public List<RepositoryMethodDefinitionDto> CustomMethods { get; set; } = new();
    }
    
    public class RepositoryMethodDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string ReturnType { get; set; } = string.Empty;
        public List<ParameterDefinitionDto> Parameters { get; set; } = new();
    }
    
    public class GeneratedInfrastructureLayerDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public Dictionary<string, string> Files { get; set; } = new();
        public int EntityCount { get; set; }
        public int RepositoryCount { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
    
    // Aspire DTOs
    public class AspireSolutionDefinitionDto
    {
        public string SolutionName { get; set; } = string.Empty;
        public string RootNamespace { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<MicroserviceDefinitionDto> Microservices { get; set; } = new();
        public bool IncludeApiGateway { get; set; } = true;
        public string DatabaseName { get; set; } = "AppDatabase";
        public bool UsePostgreSQL { get; set; } = true;
        public bool UseRedis { get; set; } = true;
        public bool UseRabbitMQ { get; set; } = true;
        public bool UseElasticsearch { get; set; } = true;
        public bool UseSeq { get; set; } = true;
    }
    
    public class MicroserviceDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string ProjectName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Replicas { get; set; } = 1;
        public bool UseDapr { get; set; } = false;
        public bool UseServiceDiscovery { get; set; } = true;
        public bool UseHealthChecks { get; set; } = true;
        public bool UseOpenTelemetry { get; set; } = true;
    }
    
    public class GeneratedAspireSolutionDto
    {
        public string SolutionName { get; set; } = string.Empty;
        public Dictionary<string, string> Files { get; set; } = new();
        public int MicroserviceCount { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
    
    // Caching DTOs
    public class CachingDefinitionDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public List<CacheStrategyDefinitionDto> CacheStrategies { get; set; } = new();
    }
    
    public class CacheStrategyDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = "Redis";
        public TimeSpan DefaultExpiry { get; set; } = TimeSpan.FromMinutes(30);
    }
    
    public class GeneratedCachingSolutionDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public Dictionary<string, string> Files { get; set; } = new();
        public int CacheStrategyCount { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
    
    // Messaging DTOs
    public class MessagingDefinitionDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public List<MessageDefinitionDto> Messages { get; set; } = new();
        public List<EventDefinitionDto> IntegrationEvents { get; set; } = new();
    }
    
    public class MessageDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Type { get; set; } = "Command";
        public List<PropertyDefinitionDto> Properties { get; set; } = new();
    }
    
    public class GeneratedMessagingSolutionDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public Dictionary<string, string> Files { get; set; } = new();
        public int MessageCount { get; set; }
        public int EventCount { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
    
    // Testing DTOs
    public class TestSuiteDefinitionDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public List<EntityTestDefinitionDto> Entities { get; set; } = new();
        public List<ServiceTestDefinitionDto> ApplicationServices { get; set; } = new();
    }
    
    public class EntityTestDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public List<PropertyDefinitionDto> Properties { get; set; } = new();
        public List<BusinessMethodDefinitionDto> BusinessMethods { get; set; } = new();
    }
    
    public class ServiceTestDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public bool HasCrud { get; set; } = true;
        public bool HasAuthorization { get; set; } = true;
    }
    
    public class BusinessMethodDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string ReturnType { get; set; } = "void";
        public List<ParameterDefinitionDto> Parameters { get; set; } = new();
    }
    
    public class GeneratedTestSuiteDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public Dictionary<string, string> Files { get; set; } = new();
        public int TestClassCount { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
    
    // Telemetry DTOs
    public class TelemetryDefinitionDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public List<MetricDefinitionDto> Metrics { get; set; } = new();
        public List<TracingPointDefinitionDto> TracingPoints { get; set; } = new();
    }
    
    public class MetricDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Type { get; set; } = "Counter";
        public string Unit { get; set; } = string.Empty;
    }
    
    public class TracingPointDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Level { get; set; } = "Information";
    }
    
    public class GeneratedTelemetrySolutionDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public Dictionary<string, string> Files { get; set; } = new();
        public int MetricsCount { get; set; }
        public int TracingCount { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
    
    // Quality DTOs
    public class QualityDefinitionDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public string Namespace { get; set; } = string.Empty;
        public List<QualityRuleDto> Rules { get; set; } = new();
        public List<QualityMetricDto> Metrics { get; set; } = new();
    }
    
    public class QualityRuleDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = "CodeQuality";
        public string Severity { get; set; } = "Warning";
        public bool IsEnabled { get; set; } = true;
    }
    
    public class QualityMetricDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Type { get; set; } = "Count";
        public double? MinValue { get; set; }
        public double? MaxValue { get; set; }
        public double? TargetValue { get; set; }
    }
    
    public class GeneratedQualitySolutionDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public Dictionary<string, string> Files { get; set; } = new();
        public int RuleCount { get; set; }
        public int MetricCount { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
    
    // Enterprise Solution DTOs
    public class EnterpriseSolutionDefinitionDto
    {
        public string SolutionName { get; set; } = string.Empty;
        public bool IncludeDdd { get; set; } = true;
        public bool IncludeCqrs { get; set; } = true;
        public bool IncludeApplicationServices { get; set; } = true;
        public bool IncludeInfrastructure { get; set; } = true;
        public bool IncludeAspire { get; set; } = true;
        public bool IncludeCaching { get; set; } = true;
        public bool IncludeMessaging { get; set; } = true;
        public bool IncludeTests { get; set; } = true;
        public bool IncludeTelemetry { get; set; } = true;
        public bool IncludeQuality { get; set; } = true;
        
        public DddDefinitionDto DddDefinition { get; set; } = new();
        public CqrsDefinitionDto CqrsDefinition { get; set; } = new();
        public ApplicationServiceDefinitionDto ApplicationServiceDefinition { get; set; } = new();
        public InfrastructureDefinitionDto InfrastructureDefinition { get; set; } = new();
        public AspireSolutionDefinitionDto AspireDefinition { get; set; } = new();
        public CachingDefinitionDto CachingDefinition { get; set; } = new();
        public MessagingDefinitionDto MessagingDefinition { get; set; } = new();
        public TestSuiteDefinitionDto TestDefinition { get; set; } = new();
        public TelemetryDefinitionDto TelemetryDefinition { get; set; } = new();
        public QualityDefinitionDto QualityDefinition { get; set; } = new();
    }
    
    public class EnterpriseSolutionDto
    {
        public string SolutionName { get; set; } = string.Empty;
        public Dictionary<string, object> Components { get; set; } = new();
        public int ComponentCount { get; set; }
        public bool IsSuccess { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
    
    // Statistics DTO
    public class CodeGenerationStatisticsDto
    {
        public long TotalGenerations { get; set; }
        public long SuccessfulGenerations { get; set; }
        public long FailedGenerations { get; set; }
        public TimeSpan AverageGenerationTime { get; set; }
        public long TotalLinesGenerated { get; set; }
        public long MemoryUsage { get; set; }
        public double CacheHitRatio { get; set; }
        public DateTime? LastGenerationTime { get; set; }
    }
}