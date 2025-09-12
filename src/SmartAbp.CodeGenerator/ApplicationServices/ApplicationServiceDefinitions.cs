using System;
using System.Collections.Generic;
using System.Linq;
using JetBrains.Annotations;
using SmartAbp.CodeGenerator.Core;

namespace SmartAbp.CodeGenerator.ApplicationServices
{
    /// <summary>
    /// Complete definition for Application Services layer
    /// </summary>
    public sealed class ApplicationServiceDefinition
    {
        [PublicAPI]
        public string ServiceName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string EntityName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Namespace { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public bool SupportsCrud { get; set; } = true;
        
        [PublicAPI]
        public bool RequiresAuthorization { get; set; } = true;
        
        [PublicAPI]
        public string AuthorizationPolicy { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<ApplicationDtoDefinition> DTOs { get; set; } = new List<ApplicationDtoDefinition>();
        
        [PublicAPI]
        public IList<ApplicationDtoDefinition> InputDTOs { get; set; } = new List<ApplicationDtoDefinition>();
        
        [PublicAPI]
        public IList<ApplicationDtoDefinition> OutputDTOs { get; set; } = new List<ApplicationDtoDefinition>();
        
        [PublicAPI]
        public IList<ValidatorDefinition> Validators { get; set; } = new List<ValidatorDefinition>();
        
        [PublicAPI]
        public IList<AuthorizationHandlerDefinition> AuthorizationHandlers { get; set; } = new List<AuthorizationHandlerDefinition>();
        
        [PublicAPI]
        public IList<CustomMethodDefinition> CustomMethods { get; set; } = new List<CustomMethodDefinition>();
        
        [PublicAPI]
        public bool UseAutoMapper { get; set; } = true;
        
        [PublicAPI]
        public bool UseFluentValidation { get; set; } = true;
        
        [PublicAPI]
        public bool UseCaching { get; set; } = true;
        
        [PublicAPI]
        public bool UseAuditLogging { get; set; } = true;
    }
    
    /// <summary>
    /// Definition for Application DTOs
    /// </summary>
    public sealed class ApplicationDtoDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public DtoType Type { get; set; } = DtoType.Regular;
        
        [PublicAPI]
        public bool IsEntity { get; set; } = true;
        
        [PublicAPI]
        public IList<PropertyDefinition> Properties { get; set; } = new List<PropertyDefinition>();
        
        [PublicAPI]
        public bool UseValidation { get; set; } = true;
        
        [PublicAPI]
        public bool UseAutoMapper { get; set; } = true;
        
        [PublicAPI]
        public string? BaseClass { get; set; }
        
        [PublicAPI]
        public IList<string> Interfaces { get; set; } = new List<string>();
        
        [PublicAPI]
        public bool IsPagedInput { get; set; } = false;
        
        [PublicAPI]
        public bool IsFilteredInput { get; set; } = false;
    }
    
    /// <summary>
    /// Definition for FluentValidation validators
    /// </summary>
    public sealed class ValidatorDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string TargetType { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public IList<ValidationRuleDefinition> Rules { get; set; } = new List<ValidationRuleDefinition>();
        
        [PublicAPI]
        public IList<CustomValidationRuleDefinition> CustomRules { get; set; } = new List<CustomValidationRuleDefinition>();
        
        [PublicAPI]
        public bool UseLocalization { get; set; } = true;
        
        [PublicAPI]
        public bool UseAsync { get; set; } = false;
    }
    
    /// <summary>
    /// Definition for validation rules
    /// </summary>
    public sealed class ValidationRuleDefinition
    {
        [PublicAPI]
        public string PropertyName { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<string> Conditions { get; set; } = new List<string>();
        
        [PublicAPI]
        public string? ErrorMessage { get; set; }
        
        [PublicAPI]
        public string? ErrorMessageResourceName { get; set; }
        
        [PublicAPI]
        public ValidationSeverity Severity { get; set; } = ValidationSeverity.Error;
        
        [PublicAPI]
        public bool IsConditional { get; set; } = false;
        
        [PublicAPI]
        public string? Condition { get; set; }
    }
    
    /// <summary>
    /// Definition for custom validation rules
    /// </summary>
    public sealed class CustomValidationRuleDefinition
    {
        [PublicAPI]
        public string MethodName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string ParameterType { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public bool IsAsync { get; set; } = false;
        
        [PublicAPI]
        public string? ErrorMessage { get; set; }
    }
    
    /// <summary>
    /// Definition for authorization handlers
    /// </summary>
    public sealed class AuthorizationHandlerDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string RequirementType { get; set; } = string.Empty;
        
        [PublicAPI]
        public string ResourceType { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public IList<string> Dependencies { get; set; } = new List<string>();
        
        [PublicAPI]
        public bool IsResourceBased { get; set; } = true;
        
        [PublicAPI]
        public bool UseCache { get; set; } = true;
    }
    
    /// <summary>
    /// Definition for custom methods in application services
    /// </summary>
    public sealed class CustomMethodDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public string ReturnType { get; set; } = "void";
        
        [PublicAPI]
        public IList<ParameterDefinition> Parameters { get; set; } = new List<ParameterDefinition>();
        
        [PublicAPI]
        public bool IsAsync { get; set; } = true;
        
        [PublicAPI]
        public string? AuthorizePolicy { get; set; }
        
        [PublicAPI]
        public bool UseValidation { get; set; } = true;
        
        [PublicAPI]
        public bool UseTransaction { get; set; } = false;
        
        [PublicAPI]
        public bool UseAuditLogging { get; set; } = true;
        
        [PublicAPI]
        public string? Implementation { get; set; }
    }
    
    /// <summary>
    /// Result of application layer generation
    /// </summary>
    public sealed class GeneratedApplicationLayer
    {
        [PublicAPI]
        public string ServiceName { get; set; } = string.Empty;
        
        [PublicAPI]
        public IDictionary<string, string> Files { get; set; } = new Dictionary<string, string>();
        
        [PublicAPI]
        public int DtoCount { get; set; }
        
        [PublicAPI]
        public int ValidatorCount { get; set; }
        
        [PublicAPI]
        public int AuthHandlerCount { get; set; }
        
        [PublicAPI]
        public DateTime GeneratedAt { get; set; }
        
        [PublicAPI]
        public int TotalLinesOfCode => Files.Values.Sum(content => content.Split('\n').Length);
    }
    
    /// <summary>
    /// Application layer configuration options
    /// </summary>
    public sealed class ApplicationLayerOptions
    {
        [PublicAPI]
        public bool GenerateAutoMapperProfiles { get; set; } = true;
        
        [PublicAPI]
        public bool GenerateFluentValidators { get; set; } = true;
        
        [PublicAPI]
        public bool GenerateAuthorizationHandlers { get; set; } = true;
        
        [PublicAPI]
        public bool UseAbpFramework { get; set; } = true;
        
        [PublicAPI]
        public bool UseDistributedCaching { get; set; } = true;
        
        [PublicAPI]
        public bool UseAuditLogging { get; set; } = true;
        
        [PublicAPI]
        public bool UseLocalization { get; set; } = true;
        
        [PublicAPI]
        public bool GeneratePermissionDefinitions { get; set; } = true;
        
        [PublicAPI]
        public bool UseUnitOfWork { get; set; } = true;
        
        [PublicAPI]
        public string DefaultAuthorizationPolicy { get; set; } = "Default";
        
        [PublicAPI]
        public int DefaultPageSize { get; set; } = 10;
        
        [PublicAPI]
        public int MaxPageSize { get; set; } = 1000;
    }
    
    /// <summary>
    /// DTO types enumeration
    /// </summary>
    public enum DtoType
    {
        Regular,
        Input,
        Output,
        Create,
        Update,
        List,
        Lookup,
        Summary,
        Detail
    }
    
    /// <summary>
    /// Validation severity levels
    /// </summary>
    public enum ValidationSeverity
    {
        Info,
        Warning,
        Error
    }
    
    /// <summary>
    /// Authorization requirement types
    /// </summary>
    public enum AuthorizationRequirementType
    {
        Simple,
        ResourceBased,
        RoleBased,
        PolicyBased,
        Custom
    }
    
    /// <summary>
    /// Application service patterns
    /// </summary>
    public enum ApplicationServicePattern
    {
        StandardCrud,
        ReadOnly,
        CommandOnly,
        Custom
    }
    
    /// <summary>
    /// Cache strategies for application services
    /// </summary>
    public enum CacheStrategy
    {
        None,
        Memory,
        Distributed,
        Hybrid
    }
    
    /// <summary>
    /// Application layer statistics
    /// </summary>
    public sealed class ApplicationLayerStatistics
    {
        [PublicAPI]
        public int TotalServices { get; set; }
        
        [PublicAPI]
        public int TotalDtos { get; set; }
        
        [PublicAPI]
        public int TotalValidators { get; set; }
        
        [PublicAPI]
        public int TotalAuthHandlers { get; set; }
        
        [PublicAPI]
        public int TotalCustomMethods { get; set; }
        
        [PublicAPI]
        public int TotalFilesGenerated { get; set; }
        
        [PublicAPI]
        public int TotalLinesOfCode { get; set; }
        
        [PublicAPI]
        public TimeSpan GenerationTime { get; set; }
        
        [PublicAPI]
        public bool HasCrudOperations { get; set; }
        
        [PublicAPI]
        public bool HasCustomOperations { get; set; }
        
        [PublicAPI]
        public bool HasAuthorization { get; set; }
        
        [PublicAPI]
        public bool HasValidation { get; set; }
    }
}