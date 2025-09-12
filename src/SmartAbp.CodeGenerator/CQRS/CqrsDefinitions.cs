using System;
using System.Collections.Generic;
using System.Linq;
using JetBrains.Annotations;
using SmartAbp.CodeGenerator.Core;

namespace SmartAbp.CodeGenerator.CQRS
{
    /// <summary>
    /// Complete CQRS definition for an aggregate
    /// </summary>
    public sealed class CqrsDefinition
    {
        [PublicAPI]
        public string AggregateName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Namespace { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public IList<CommandDefinition> Commands { get; set; } = new List<CommandDefinition>();
        
        [PublicAPI]
        public IList<QueryDefinition> Queries { get; set; } = new List<QueryDefinition>();
        
        [PublicAPI]
        public IList<DtoDefinition> DTOs { get; set; } = new List<DtoDefinition>();
        
        [PublicAPI]
        public bool UseCaching { get; set; } = true;
        
        [PublicAPI]
        public bool UseValidation { get; set; } = true;
        
        [PublicAPI]
        public bool UseAutoMapper { get; set; } = true;
        
        [PublicAPI]
        public bool UsePerformanceLogging { get; set; } = true;
        
        [PublicAPI]
        public string? DatabaseProvider { get; set; } = "EntityFramework";
    }
    
    /// <summary>
    /// Definition for CQRS commands
    /// </summary>
    public sealed class CommandDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public string? ReturnType { get; set; } // null for void/Unit commands
        
        [PublicAPI]
        public IList<PropertyDefinition> Properties { get; set; } = new List<PropertyDefinition>();
        
        [PublicAPI]
        public bool RequiresTransaction { get; set; } = true;
        
        [PublicAPI]
        public bool RequiresAuthorization { get; set; } = true;
        
        [PublicAPI]
        public string? AuthorizePolicy { get; set; }
        
        [PublicAPI]
        public bool PublishEvents { get; set; } = true;
        
        [PublicAPI]
        public int TimeoutSeconds { get; set; } = 30;
        
        [PublicAPI]
        public CommandType Type { get; set; } = CommandType.Create;
    }
    
    /// <summary>
    /// Definition for CQRS queries
    /// </summary>
    public sealed class QueryDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public string ReturnType { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<ParameterDefinition> Parameters { get; set; } = new List<ParameterDefinition>();
        
        [PublicAPI]
        public bool IsPaged { get; set; } = false;
        
        [PublicAPI]
        public bool IsCacheable { get; set; } = false;
        
        [PublicAPI]
        public int CacheExpirationMinutes { get; set; } = 5;
        
        [PublicAPI]
        public bool HasValidator { get; set; } = false;
        
        [PublicAPI]
        public bool RequiresAuthorization { get; set; } = true;
        
        [PublicAPI]
        public string? AuthorizePolicy { get; set; }
        
        [PublicAPI]
        public int TimeoutSeconds { get; set; } = 30;
        
        [PublicAPI]
        public QueryType Type { get; set; } = QueryType.Single;
        
        [PublicAPI]
        public IList<string> Includes { get; set; } = new List<string>();
        
        [PublicAPI]
        public IList<FilterDefinition> Filters { get; set; } = new List<FilterDefinition>();
    }
    
    /// <summary>
    /// Definition for DTOs (Data Transfer Objects)
    /// </summary>
    public sealed class DtoDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public IList<PropertyDefinition> Properties { get; set; } = new List<PropertyDefinition>();
        
        [PublicAPI]
        public bool IsPagedResult { get; set; } = false;
        
        [PublicAPI]
        public string? ParentDto { get; set; }
        
        [PublicAPI]
        public DtoType Type { get; set; } = DtoType.Regular;
        
        [PublicAPI]
        public bool UseValidation { get; set; } = true;
        
        [PublicAPI]
        public bool GenerateMapper { get; set; } = true;
    }
    
    /// <summary>
    /// Definition for query filters
    /// </summary>
    public sealed class FilterDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Property { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Type { get; set; } = string.Empty;
        
        [PublicAPI]
        public FilterOperator Operator { get; set; } = FilterOperator.Equal;
        
        [PublicAPI]
        public bool IsOptional { get; set; } = true;
        
        [PublicAPI]
        public bool IsRange { get; set; } = false;
        
        [PublicAPI]
        public bool IsContains { get; set; } = false;
    }
    
    /// <summary>
    /// Result of CQRS layer generation
    /// </summary>
    public sealed class GeneratedCqrsLayer
    {
        [PublicAPI]
        public string AggregateName { get; set; } = string.Empty;
        
        [PublicAPI]
        public IDictionary<string, string> Files { get; set; } = new Dictionary<string, string>();
        
        [PublicAPI]
        public int CommandCount { get; set; }
        
        [PublicAPI]
        public int QueryCount { get; set; }
        
        [PublicAPI]
        public int DtoCount { get; set; }
        
        [PublicAPI]
        public DateTime GeneratedAt { get; set; }
        
        [PublicAPI]
        public int TotalLinesOfCode => Files.Values.Sum(content => content.Split('\n').Length);
    }
    
    /// <summary>
    /// CQRS configuration options
    /// </summary>
    public sealed class CqrsOptions
    {
        [PublicAPI]
        public bool UseMediatr { get; set; } = true;
        
        [PublicAPI]
        public bool UseFluentValidation { get; set; } = true;
        
        [PublicAPI]
        public bool UseAutoMapper { get; set; } = true;
        
        [PublicAPI]
        public bool GeneratePipelineBehaviors { get; set; } = true;
        
        [PublicAPI]
        public bool UseDistributedCaching { get; set; } = true;
        
        [PublicAPI]
        public bool GenerateApplicationServices { get; set; } = true;
        
        [PublicAPI]
        public bool UseCorrelationIds { get; set; } = true;
        
        [PublicAPI]
        public bool GeneratePerformanceLogging { get; set; } = true;
        
        [PublicAPI]
        public bool UseRetryPolicies { get; set; } = true;
        
        [PublicAPI]
        public string DefaultCacheProvider { get; set; } = "Redis";
        
        [PublicAPI]
        public int DefaultCacheExpirationMinutes { get; set; } = 5;
        
        [PublicAPI]
        public int DefaultCommandTimeoutSeconds { get; set; } = 30;
        
        [PublicAPI]
        public int DefaultQueryTimeoutSeconds { get; set; } = 30;
    }
    
    /// <summary>
    /// Command types enumeration
    /// </summary>
    public enum CommandType
    {
        Create,
        Update,
        Delete,
        Custom
    }
    
    /// <summary>
    /// Query types enumeration
    /// </summary>
    public enum QueryType
    {
        Single,
        List,
        Paged,
        Count,
        Exists,
        Custom
    }
    
    /// <summary>
    /// DTO types enumeration
    /// </summary>
    public enum DtoType
    {
        Regular,
        Input,
        Output,
        Lookup,
        Summary,
        Detail
    }
    
    /// <summary>
    /// Filter operators enumeration
    /// </summary>
    public enum FilterOperator
    {
        Equal,
        NotEqual,
        GreaterThan,
        GreaterThanOrEqual,
        LessThan,
        LessThanOrEqual,
        Contains,
        StartsWith,
        EndsWith,
        In,
        NotIn,
        Between
    }
    
    /// <summary>
    /// Pipeline behavior types
    /// </summary>
    public enum PipelineBehaviorType
    {
        Validation,
        Logging,
        Performance,
        Caching,
        Transaction,
        Authorization,
        Retry,
        CircuitBreaker
    }
    
    /// <summary>
    /// CQRS layer statistics
    /// </summary>
    public sealed class CqrsStatistics
    {
        [PublicAPI]
        public int TotalCommands { get; set; }
        
        [PublicAPI]
        public int TotalQueries { get; set; }
        
        [PublicAPI]
        public int TotalDtos { get; set; }
        
        [PublicAPI]
        public int TotalValidators { get; set; }
        
        [PublicAPI]
        public int TotalHandlers { get; set; }
        
        [PublicAPI]
        public int TotalBehaviors { get; set; }
        
        [PublicAPI]
        public int TotalFilesGenerated { get; set; }
        
        [PublicAPI]
        public int TotalLinesOfCode { get; set; }
        
        [PublicAPI]
        public TimeSpan GenerationTime { get; set; }
    }
}