using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using SmartAbp.CodeGenerator.Services.V9;
using Volo.Abp.Application.Services;

namespace SmartAbp.CodeGenerator.Services
{
    /// <summary>
    /// Interface for Code Generation Application Service
    /// </summary>
    public interface ICodeGenerationAppService : IApplicationService
    {
        /// <summary>
        /// Generates a simple entity using the core Roslyn engine
        /// </summary>
        Task<GeneratedCodeDto> GenerateEntityAsync(EntityDefinitionDto input);
        
        /// <summary>
        /// Generates complete DDD domain layer
        /// </summary>
        Task<GeneratedDddSolutionDto> GenerateDddDomainAsync(DddDefinitionDto input);
        
        /// <summary>
        /// Generates CQRS pattern implementation
        /// </summary>
        Task<GeneratedCqrsSolutionDto> GenerateCqrsAsync(CqrsDefinitionDto input);
        
        /// <summary>
        /// Generates application services layer
        /// </summary>
        Task<GeneratedApplicationLayerDto> GenerateApplicationServicesAsync(ApplicationServiceDefinitionDto input);
        
        /// <summary>
        /// Generates infrastructure layer with EF Core
        /// </summary>
        Task<GeneratedInfrastructureLayerDto> GenerateInfrastructureAsync(InfrastructureDefinitionDto input);
        
        /// <summary>
        /// Generates Aspire microservices solution
        /// </summary>
        Task<GeneratedAspireSolutionDto> GenerateAspireSolutionAsync(AspireSolutionDefinitionDto input);
        
        /// <summary>
        /// Generates distributed caching solution
        /// </summary>
        Task<GeneratedCachingSolutionDto> GenerateCachingSolutionAsync(CachingDefinitionDto input);
        
        /// <summary>
        /// Generates messaging solution with RabbitMQ
        /// </summary>
        Task<GeneratedMessagingSolutionDto> GenerateMessagingSolutionAsync(MessagingDefinitionDto input);
        
        /// <summary>
        /// Generates comprehensive test suite
        /// </summary>
        Task<GeneratedTestSuiteDto> GenerateTestSuiteAsync(TestSuiteDefinitionDto input);
        
        /// <summary>
        /// Generates telemetry and monitoring solution
        /// </summary>
        Task<GeneratedTelemetrySolutionDto> GenerateTelemetrySolutionAsync(TelemetryDefinitionDto input);
        
        /// <summary>
        /// Generates code quality assurance solution
        /// </summary>
        Task<GeneratedQualitySolutionDto> GenerateQualitySolutionAsync(QualityDefinitionDto input);
        
        /// <summary>
        /// Generates complete enterprise solution with all patterns
        /// </summary>
        Task<EnterpriseSolutionDto> GenerateEnterpriseSolutionAsync(EnterpriseSolutionDefinitionDto input);
        
        /// <summary>
        /// Generates a module based on the provided metadata
        /// </summary>
        Task<GeneratedModuleDto> GenerateModuleAsync(ModuleMetadataDto input);

        /// <summary>
        /// Generates a module from unified frontend schema, converting to internal DTOs.
        /// </summary>
        Task<GeneratedModuleDto> GenerateFromUnifiedSchemaAsync(SmartAbp.CodeGenerator.Services.V9.UnifiedModuleSchemaDto unified);
        
        /// <summary>
        /// Returns available connection string names from configuration
        /// </summary>
        Task<System.Collections.Generic.List<string>> GetConnectionStringNamesAsync();
        
        /// <summary>
        /// Returns menu tree items used by the module wizard
        /// </summary>
        Task<System.Collections.Generic.List<MenuItemDto>> GetMenuTreeAsync();

        /// <summary>
        /// Gets UI configuration for a specific module/entity
        /// </summary>
        Task<EntityUIConfigDto> GetUiConfigAsync(string moduleName, string entityName);

        /// <summary>
        /// Saves UI configuration for a specific module/entity
        /// </summary>
        Task SaveUiConfigAsync(string moduleName, string entityName, EntityUIConfigDto config);
        
        /// <summary>
        /// Gets generation statistics and performance metrics
        /// </summary>
        Task<CodeGenerationStatisticsDto> GetStatisticsAsync();

        /// <summary>
        /// Introspects a database via configured connection string and provider, returning schema tables/columns/relationships.
        /// Supports SqlServer, PostgreSql, MySql, Oracle.
        /// </summary>
        Task<DatabaseSchemaDto> IntrospectDatabaseAsync(DatabaseIntrospectionRequestDto request);

        /// <summary>
        /// Validates module metadata and returns aggregated issues for UX surfacing.
        /// </summary>
        Task<SmartAbp.CodeGenerator.Services.V9.ValidationReportDto> ValidateModuleAsync(ModuleMetadataDto input);

        /// <summary>
        /// Performs a dry-run generation without writing files: returns file list and summary for preview.
        /// </summary>
        Task<SmartAbp.CodeGenerator.Services.V9.GenerationDryRunResultDto> DryRunGenerateAsync(ModuleMetadataDto input);

        /// <summary>
        /// Validates unified schema (frontend single source) after conversion.
        /// </summary>
        Task<SmartAbp.CodeGenerator.Services.V9.ValidationReportDto> ValidateUnifiedAsync(SmartAbp.CodeGenerator.Services.V9.UnifiedModuleSchemaDto unified);

        /// <summary>
        /// Performs dry-run based on unified schema.
        /// </summary>
        Task<SmartAbp.CodeGenerator.Services.V9.GenerationDryRunResultDto> DryRunUnifiedAsync(SmartAbp.CodeGenerator.Services.V9.UnifiedModuleSchemaDto unified);

        /// <summary>
        /// Returns backend-supported schema version manifest for preflight checks.
        /// </summary>
        Task<SmartAbp.CodeGenerator.Services.V9.SchemaVersionManifestDto> GetSchemaVersionManifestAsync();
    }
}

namespace SmartAbp.CodeGenerator.Services.V9
{
    public class GeneratedModuleDto
    {
        public string ModuleName { get; set; } = default!;
        public List<string> GeneratedFiles { get; set; } = new();
        public string GenerationReport { get; set; } = default!;
    }
}