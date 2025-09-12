using System;
using System.Collections.Generic;
using JetBrains.Annotations;

namespace SmartAbp.CodeGenerator.DDD
{
    /// <summary>
    /// Main DDD domain definition containing all domain elements
    /// </summary>
    [PublicAPI]
    public sealed class DddDefinition
    {
        [PublicAPI]
        public string ModuleName { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Namespace { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public IList<AggregateDefinition> Aggregates { get; set; } = new List<AggregateDefinition>();
        
        [PublicAPI]
        public IList<ValueObjectDefinition> ValueObjects { get; set; } = new List<ValueObjectDefinition>();
        
        [PublicAPI]
        public IList<DomainEventDefinition> DomainEvents { get; set; } = new List<DomainEventDefinition>();
        
        [PublicAPI]
        public IList<SpecificationDefinition> Specifications { get; set; } = new List<SpecificationDefinition>();
        
        [PublicAPI]
        public IList<DomainServiceDefinition> DomainServices { get; set; } = new List<DomainServiceDefinition>();
        
        [PublicAPI]
        public IList<RepositoryDefinition> Repositories { get; set; } = new List<RepositoryDefinition>();
        
        [PublicAPI]
        public bool UseMultiTenancy { get; set; } = true;
        
        [PublicAPI]
        public bool UseSoftDelete { get; set; } = true;
        
        [PublicAPI]
        public bool UseAuditing { get; set; } = true;
        
        [PublicAPI]
        public bool UseExtraProperties { get; set; } = true;
        
        [PublicAPI]
        public string DefaultKeyType { get; set; } = "Guid";
    }
    
    /// <summary>
    /// Aggregate root definition with entities and domain logic
    /// </summary>
    [PublicAPI]
    public sealed class AggregateDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public string KeyType { get; set; } = "Guid";
        
        [PublicAPI]
        public bool IsMultiTenant { get; set; } = true;
        
        [PublicAPI]
        public bool IsSoftDelete { get; set; } = true;
        
        [PublicAPI]
        public bool HasExtraProperties { get; set; } = true;
        
        [PublicAPI]
        public IList<PropertyDefinition> Properties { get; set; } = new List<PropertyDefinition>();
        
        [PublicAPI]
        public IList<EntityDefinition> ChildEntities { get; set; } = new List<EntityDefinition>();
        
        [PublicAPI]
        public IList<DomainMethodDefinition> DomainMethods { get; set; } = new List<DomainMethodDefinition>();
        
        [PublicAPI]
        public IList<BusinessRuleDefinition> BusinessRules { get; set; } = new List<BusinessRuleDefinition>();
        
        [PublicAPI]
        public IList<DomainEventDefinition> DomainEvents { get; set; } = new List<DomainEventDefinition>();
        
        [PublicAPI]
        public IList<NavigationPropertyDefinition> NavigationProperties { get; set; } = new List<NavigationPropertyDefinition>();
    }
    
    /// <summary>
    /// Child entity definition within an aggregate
    /// </summary>
    [PublicAPI]
    public sealed class EntityDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public string KeyType { get; set; } = "Guid";
        
        [PublicAPI]
        public bool IsAggregateRoot { get; set; } = false;
        
        [PublicAPI]
        public IList<PropertyDefinition> Properties { get; set; } = new List<PropertyDefinition>();
        
        [PublicAPI]
        public IList<DomainMethodDefinition> DomainMethods { get; set; } = new List<DomainMethodDefinition>();
        
        [PublicAPI]
        public IList<NavigationPropertyDefinition> NavigationProperties { get; set; } = new List<NavigationPropertyDefinition>();
    }
    
    /// <summary>
    /// Value object definition for immutable domain concepts
    /// </summary>
    [PublicAPI]
    public sealed class ValueObjectDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public IList<PropertyDefinition> Properties { get; set; } = new List<PropertyDefinition>();
        
        [PublicAPI]
        public IList<DomainMethodDefinition> Methods { get; set; } = new List<DomainMethodDefinition>();
        
        [PublicAPI]
        public bool IsImmutable { get; set; } = true;
        
        [PublicAPI]
        public bool ImplementsEquality { get; set; } = true;
        
        [PublicAPI]
        public bool ImplementsComparable { get; set; } = false;
    }
    
    /// <summary>
    /// Domain event definition for aggregate state changes
    /// </summary>
    [PublicAPI]
    public sealed class DomainEventDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public string AggregateType { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<PropertyDefinition> Properties { get; set; } = new List<PropertyDefinition>();
        
        [PublicAPI]
        public EventType Type { get; set; } = EventType.DomainEvent;
        
        [PublicAPI]
        public bool IsIntegrationEvent { get; set; } = false;
    }
    
    /// <summary>
    /// Specification pattern definition for complex business rules
    /// </summary>
    [PublicAPI]
    public sealed class SpecificationDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public string TargetEntity { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Expression { get; set; } = string.Empty;
        
        [PublicAPI]
        public IList<ParameterDefinition> Parameters { get; set; } = new List<ParameterDefinition>();
        
        [PublicAPI]
        public SpecificationType Type { get; set; } = SpecificationType.Simple;
    }
    
    /// <summary>
    /// Domain service definition for complex domain operations
    /// </summary>
    [PublicAPI]
    public sealed class DomainServiceDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public IList<DomainMethodDefinition> Methods { get; set; } = new List<DomainMethodDefinition>();
        
        [PublicAPI]
        public IList<string> Dependencies { get; set; } = new List<string>();
        
        [PublicAPI]
        public bool IsStateless { get; set; } = true;
    }
    
    /// <summary>
    /// Repository definition for aggregate persistence
    /// </summary>
    [PublicAPI]
    public sealed class RepositoryDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string AggregateType { get; set; } = string.Empty;
        
        [PublicAPI]
        public string KeyType { get; set; } = "Guid";
        
        [PublicAPI]
        public IList<RepositoryMethodDefinition> CustomMethods { get; set; } = new List<RepositoryMethodDefinition>();
        
        [PublicAPI]
        public bool ImplementsStandardMethods { get; set; } = true;
        
        [PublicAPI]
        public bool SupportsSpecifications { get; set; } = true;
    }
    
    /// <summary>
    /// Property definition for entities and value objects
    /// </summary>
    [PublicAPI]
    public sealed class PropertyDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Type { get; set; } = string.Empty;
        
        [PublicAPI]
        public bool IsRequired { get; set; } = false;
        
        [PublicAPI]
        public int? MaxLength { get; set; }
        
        [PublicAPI]
        public int? MinLength { get; set; }
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public string? DefaultValue { get; set; }
        
        [PublicAPI]
        public IList<ValidationAttributeDefinition> ValidationAttributes { get; set; } = new List<ValidationAttributeDefinition>();
        
        [PublicAPI]
        public bool IsReadOnly { get; set; } = false;
        
        [PublicAPI]
        public bool IsPrivateSetter { get; set; } = false;
    }
    
    /// <summary>
    /// Navigation property definition for entity relationships
    /// </summary>
    [PublicAPI]
    public sealed class NavigationPropertyDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string TargetType { get; set; } = string.Empty;
        
        [PublicAPI]
        public NavigationType Type { get; set; } = NavigationType.OneToOne;
        
        [PublicAPI]
        public string? ForeignKeyProperty { get; set; }
        
        [PublicAPI]
        public bool IsRequired { get; set; } = false;
        
        [PublicAPI]
        public bool IsCollection { get; set; } = false;
        
        [PublicAPI]
        public string? Description { get; set; }
    }
    
    /// <summary>
    /// Domain method definition for business operations
    /// </summary>
    [PublicAPI]
    public sealed class DomainMethodDefinition
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
        public MethodType Type { get; set; } = MethodType.BusinessMethod;
        
        [PublicAPI]
        public bool IsAsync { get; set; } = false;
        
        [PublicAPI]
        public bool IsVirtual { get; set; } = false;
        
        [PublicAPI]
        public AccessModifier AccessModifier { get; set; } = AccessModifier.Public;
        
        [PublicAPI]
        public IList<string> BusinessRules { get; set; } = new List<string>();
        
        [PublicAPI]
        public IList<string> DomainEvents { get; set; } = new List<string>();
    }
    
    /// <summary>
    /// Business rule definition for domain constraints
    /// </summary>
    [PublicAPI]
    public sealed class BusinessRuleDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public string Expression { get; set; } = string.Empty;
        
        [PublicAPI]
        public string ErrorMessage { get; set; } = string.Empty;
        
        [PublicAPI]
        public BusinessRuleType Type { get; set; } = BusinessRuleType.Validation;
        
        [PublicAPI]
        public BusinessRuleSeverity Severity { get; set; } = BusinessRuleSeverity.Error;
    }
    
    /// <summary>
    /// Parameter definition for methods and specifications
    /// </summary>
    [PublicAPI]
    public sealed class ParameterDefinition
    {
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        [PublicAPI]
        public string Type { get; set; } = string.Empty;
        
        [PublicAPI]
        public bool IsRequired { get; set; } = true;
        
        [PublicAPI]
        public string? DefaultValue { get; set; }
        
        [PublicAPI]
        public string? Description { get; set; }
        
        [PublicAPI]
        public ParameterDirection Direction { get; set; } = ParameterDirection.In;
    }
    
    /// <summary>
    /// Validation attribute definition for properties
    /// </summary>
    [PublicAPI]
    public sealed class ValidationAttributeDefinition
    {
        [PublicAPI]
        public string AttributeType { get; set; } = string.Empty;
        
        [PublicAPI]
        public Dictionary<string, object> Parameters { get; set; } = new Dictionary<string, object>();
        
        [PublicAPI]
        public string? ErrorMessage { get; set; }
    }
    
    /// <summary>
    /// Repository method definition for custom data access
    /// </summary>
    [PublicAPI]
    public sealed class RepositoryMethodDefinition
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
        public bool IsAsync { get; set; } = true;
        
        [PublicAPI]
        public RepositoryMethodType Type { get; set; } = RepositoryMethodType.Query;
        
        [PublicAPI]
        public string? QueryExpression { get; set; }
    }
    
    // Enumerations
    
    [PublicAPI]
    public enum EventType
    {
        DomainEvent,
        IntegrationEvent,
        NotificationEvent
    }
    
    [PublicAPI]
    public enum SpecificationType
    {
        Simple,
        Composite,
        Parameterized
    }
    
    [PublicAPI]
    public enum NavigationType
    {
        OneToOne,
        OneToMany,
        ManyToOne,
        ManyToMany
    }
    
    [PublicAPI]
    public enum MethodType
    {
        BusinessMethod,
        Factory,
        Validator,
        Helper,
        Constructor
    }
    
    [PublicAPI]
    public enum AccessModifier
    {
        Public,
        Protected,
        Internal,
        Private
    }
    
    [PublicAPI]
    public enum BusinessRuleType
    {
        Validation,
        Invariant,
        Specification,
        Policy
    }
    
    [PublicAPI]
    public enum BusinessRuleSeverity
    {
        Info,
        Warning,
        Error,
        Critical
    }
    
    [PublicAPI]
    public enum ParameterDirection
    {
        In,
        Out,
        Ref,
        Params
    }
    
    [PublicAPI]
    public enum RepositoryMethodType
    {
        Query,
        Command,
        Specification,
        Custom
    }
    
    /// <summary>
    /// Generated DDD solution result
    /// </summary>
    [PublicAPI]
    public sealed class GeneratedDddSolution
    {
        [PublicAPI]
        public string ModuleName { get; set; } = string.Empty;
        
        [PublicAPI]
        public Dictionary<string, string> Files { get; set; } = new Dictionary<string, string>();
        
        [PublicAPI]
        public int AggregateCount { get; set; }
        
        [PublicAPI]
        public int EntityCount { get; set; }
        
        [PublicAPI]
        public int ValueObjectCount { get; set; }
        
        [PublicAPI]
        public int DomainEventCount { get; set; }
        
        [PublicAPI]
        public int RepositoryCount { get; set; }
        
        [PublicAPI]
        public int DomainServiceCount { get; set; }
        
        [PublicAPI]
        public int SpecificationCount { get; set; }
        
        [PublicAPI]
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        
        [PublicAPI]
        public TimeSpan GenerationTime { get; set; }
        
        [PublicAPI]
        public int TotalLinesOfCode { get; set; }
    }
}