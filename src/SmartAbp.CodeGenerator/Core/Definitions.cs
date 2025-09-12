using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using JetBrains.Annotations;

namespace SmartAbp.CodeGenerator.Core
{
    /// <summary>
    /// Represents a complete entity definition for code generation
    /// </summary>
    public sealed class EntityDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Module { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Aggregate { get; set; } = string.Empty;
        
        [PublicAPI]
        public string KeyType { get; set; } = "Guid";
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public bool IsAggregateRoot { get; set; } = true;
        
        [PublicAPI]
        public bool IsMultiTenant { get; set; } = true;
        
        [PublicAPI]
        public bool IsSoftDelete { get; set; } = true;
        
        [PublicAPI]
        public bool HasExtraProperties { get; set; } = true;
        
        [PublicAPI]
        public IList<ConstantDefinition> Constants { get; set; } = new List<ConstantDefinition>();
        
        [PublicAPI]
        public IList<PropertyDefinition> Properties { get; set; } = new List<PropertyDefinition>();
        
        [PublicAPI]
        public IList<NavigationPropertyDefinition> NavigationProperties { get; set; } = new List<NavigationPropertyDefinition>();
        
        [PublicAPI]
        public IList<CollectionDefinition> Collections { get; set; } = new List<CollectionDefinition>();
        
        [PublicAPI]
        public IList<DomainMethodDefinition> DomainMethods { get; set; } = new List<DomainMethodDefinition>();
        
        [PublicAPI]
        public IList<IndexDefinition> Indexes { get; set; } = new List<IndexDefinition>();
    }
    
    /// <summary>
    /// Defines a property within an entity
    /// </summary>
    public sealed class PropertyDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Type { get; set; } = string.Empty;
        
        [PublicAPI]
        public bool IsRequired { get; set; }
        
        [PublicAPI]
        public bool IsReadOnly { get; set; }
        
        [PublicAPI]
        public bool IsUnique { get; set; }
        
        [PublicAPI]
        public int? MaxLength { get; set; }
        
        [PublicAPI]
        public int? MinLength { get; set; }
        
        [PublicAPI]
        public string? DefaultValue { get; set; }
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public IList<ValidationRule> ValidationRules { get; set; } = new List<ValidationRule>();
    }
    
    /// <summary>
    /// Defines a navigation property for entity relationships
    /// </summary>
    public sealed class NavigationPropertyDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Type { get; set; } = string.Empty;
        
        [PublicAPI]
        public string RelationType { get; set; } = string.Empty; // OneToOne, OneToMany, ManyToMany
        
        [PublicAPI]
        public bool IsLazyLoaded { get; set; } = true;
        
        [PublicAPI]
        public string? ForeignKey { get; set; }
        
        [PublicAPI]
        public string? InverseProperty { get; set; }
    }
    
    /// <summary>
    /// Defines a collection property within an entity
    /// </summary>
    public sealed class CollectionDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string ItemType { get; set; } = string.Empty;
        
        [PublicAPI]
        public bool IsReadOnly { get; set; } = true;
        
        [PublicAPI]
        public string? Description { get; set; }
    }
    
    /// <summary>
    /// Defines a constant within an entity
    /// </summary>
    public sealed class ConstantDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Type { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Value { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
    }
    
    /// <summary>
    /// Defines a domain method within an entity
    /// </summary>
    public sealed class DomainMethodDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string ReturnType { get; set; } = "void";
        
        [PublicAPI]
        public bool IsAsync { get; set; }
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public IList<ParameterDefinition> Parameters { get; set; } = new List<ParameterDefinition>();
        
        [PublicAPI]
        public string? MethodBody { get; set; }
    }
    
    /// <summary>
    /// Defines a parameter for methods
    /// </summary>
    public sealed class ParameterDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Type { get; set; } = string.Empty;
        
        [PublicAPI]
        public bool IsOptional { get; set; }
        
        [PublicAPI]
        public string? DefaultValue { get; set; }
    }
    
    /// <summary>
    /// Defines validation rules for properties
    /// </summary>
    public sealed class ValidationRule
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Condition { get; set; } = string.Empty;
        
        [PublicAPI]
        public string ErrorMessage { get; set; } = string.Empty;
    }
    
    /// <summary>
    /// Represents the result of code generation
    /// </summary>
    public sealed class GeneratedCode
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string SourceCode { get; set; } = string.Empty;
        
        [PublicAPI]
        public byte[]? CompiledAssembly { get; set; }
        
        [PublicAPI]
        public CodeMetadata Metadata { get; set; } = new();
        
        [PublicAPI]
        public TimeSpan GenerationTime { get; set; }
    }
    
    /// <summary>
    /// Metadata about generated code
    /// </summary>
    public sealed class CodeMetadata
    {
        [PublicAPI]
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        
        [PublicAPI]
        public string GeneratorVersion { get; set; } = "1.0.0";
        
        [PublicAPI]
        public int LinesOfCode { get; set; }
        
        [PublicAPI]
        public IDictionary<string, object> AdditionalProperties { get; set; } = new Dictionary<string, object>();
    }
    
    /// <summary>
    /// Task for background processing
    /// </summary>
    internal sealed class GenerationTask
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public EntityDefinition Definition { get; set; } = new();
        public TaskCompletionSource<GeneratedCode> CompletionSource { get; set; } = new();
    }
    
    /// <summary>
    /// Defines an index for entity properties
    /// </summary>
    public sealed class IndexDefinition
    {
        [PublicAPI]
        public string PropertyName { get; set; } = string.Empty;
        
        [PublicAPI]
        public bool IsUnique { get; set; } = false;
        
        [PublicAPI]
        public string? Name { get; set; }
    }
    
    /// <summary>
    /// Exception thrown during compilation errors
    /// </summary>
    public sealed class CompilationException : Exception
    {
        public CompilationException(string message) : base(message) { }
        public CompilationException(string message, Exception innerException) : base(message, innerException) { }
    }
}