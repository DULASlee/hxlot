using System.Threading.Tasks;
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
        /// Gets generation statistics and performance metrics
        /// </summary>
        Task<CodeGenerationStatisticsDto> GetStatisticsAsync();
    }
}