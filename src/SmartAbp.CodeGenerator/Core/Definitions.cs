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
        /// <summary>
        /// Gets or sets the entity name
        /// </summary>
        /// <summary>
        /// 获取或设置属性名称。
        /// </summary>
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the module name
        /// </summary>
        [PublicAPI]
        public string Module { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the aggregate name
        /// </summary>
        [PublicAPI]
        public string Aggregate { get; set; } = string.Empty;
        
        /// <summary>
        /// Gets or sets the key type
        /// </summary>
        [PublicAPI]
        public string KeyType { get; set; } = "Guid";
        
        /// <summary>
        /// Gets or sets the entity description
        /// </summary>
        /// <summary>
        /// 获取或设置属性的描述信息。
        /// </summary>
        [PublicAPI]
        public string? Description { get; set; }
        
        /// <summary>
        /// Gets or sets a value indicating whether this entity is an aggregate root
        /// </summary>
        [PublicAPI]
        public bool IsAggregateRoot { get; set; } = true;
        
        /// <summary>
        /// Gets or sets a value indicating whether this entity is multi-tenant
        /// </summary>
        [PublicAPI]
        public bool IsMultiTenant { get; set; } = true;
        
        /// <summary>
        /// 获取或设置一个值，指示实体是否支持软删除。
        /// </summary>
        [PublicAPI]
        public bool IsSoftDelete { get; set; } = true;
        
        /// <summary>
        /// 获取或设置一个值，指示实体是否包含额外属性。
        /// </summary>
        [PublicAPI]
        public bool HasExtraProperties { get; set; } = true;
        
        /// <summary>
        /// 获取或设置常量定义列表。
        /// </summary>
        [PublicAPI]
        public IList<ConstantDefinition> Constants { get; set; } = new List<ConstantDefinition>();
        
        /// <summary>
        /// 获取或设置属性定义列表。
        /// </summary>
        [PublicAPI]
        public IList<PropertyDefinition> Properties { get; set; } = new List<PropertyDefinition>();
        
        /// <summary>
        /// 获取或设置导航属性定义列表。
        /// </summary>
        [PublicAPI]
        public IList<NavigationPropertyDefinition> NavigationProperties { get; set; } = new List<NavigationPropertyDefinition>();
        
        /// <summary>
        /// 获取或设置集合定义列表。
        /// </summary>
        [PublicAPI]
        public IList<CollectionDefinition> Collections { get; set; } = new List<CollectionDefinition>();
        
        /// <summary>
        /// 获取或设置领域方法定义列表。
        /// </summary>
        [PublicAPI]
        public IList<DomainMethodDefinition> DomainMethods { get; set; } = new List<DomainMethodDefinition>();
        
        /// <summary>
        /// 获取或设置索引定义列表。
        /// </summary>
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
        
        /// <summary>
        /// 获取或设置属性类型。
        /// </summary>
        [PublicAPI]
        public string Type { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置一个值，指示属性是否为必需。
        /// </summary>
        [PublicAPI]
        public bool IsRequired { get; set; }
        
        /// <summary>
        /// 获取或设置一个值，指示属性是否为只读。
        /// </summary>
        [PublicAPI]
        public bool IsReadOnly { get; set; }
        
        /// <summary>
        /// 获取或设置一个值，指示属性是否为唯一。
        /// </summary>
        [PublicAPI]
        public bool IsUnique { get; set; }
        
        /// <summary>
        /// 获取或设置属性的最大长度限制。
        /// </summary>
        [PublicAPI]
        public int? MaxLength { get; set; }
        
        /// <summary>
        /// 获取或设置属性的最小长度限制。
        /// </summary>
        [PublicAPI]
        public int? MinLength { get; set; }
        
        /// <summary>
        /// 获取或设置属性的默认值。
        /// </summary>
        [PublicAPI]
        public string? DefaultValue { get; set; }
        
        [PublicAPI]
        public string? Description { get; set; }
        
        /// <summary>
        /// 获取或设置属性的验证规则列表。
        /// </summary>
        [PublicAPI]
        public IList<ValidationRule> ValidationRules { get; set; } = new List<ValidationRule>();
    }
    
    /// <summary>
    /// Defines a navigation property for entity relationships
    /// </summary>
    public sealed class NavigationPropertyDefinition
    {
        /// <summary>
        /// 获取或设置导航属性名称。
        /// </summary>
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置导航属性类型。
        /// </summary>
        [PublicAPI]
        public string Type { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置关系类型（OneToOne, OneToMany, ManyToMany）。
        /// </summary>
        [PublicAPI]
        public string RelationType { get; set; } = string.Empty; // OneToOne, OneToMany, ManyToMany
        
        /// <summary>
        /// 获取或设置一个值，指示是否启用延迟加载。
        /// </summary>
        [PublicAPI]
        public bool IsLazyLoaded { get; set; } = true;
        
        /// <summary>
        /// 获取或设置外键属性名称。
        /// </summary>
        [PublicAPI]
        public string? ForeignKey { get; set; }
        
        /// <summary>
        /// 获取或设置反向导航属性名称。
        /// </summary>
        [PublicAPI]
        public string? InverseProperty { get; set; }
    }
    
    /// <summary>
    /// Defines a collection property within an entity
    /// </summary>
    public sealed class CollectionDefinition
    {
        /// <summary>
        /// 获取或设置集合属性名称。
        /// </summary>
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置集合项类型。
        /// </summary>
        [PublicAPI]
        public string ItemType { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置一个值，指示集合是否为只读。
        /// </summary>
        [PublicAPI]
        public bool IsReadOnly { get; set; } = true;
        
        /// <summary>
        /// 获取或设置集合的描述信息。
        /// </summary>
        [PublicAPI]
        public string? Description { get; set; }
    }
    
    /// <summary>
    /// Defines a constant within an entity
    /// </summary>
    public sealed class ConstantDefinition
    {
        /// <summary>
        /// 获取或设置常量名称。
        /// </summary>
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置常量类型。
        /// </summary>
        [PublicAPI]
        public string Type { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置常量值。
        /// </summary>
        [PublicAPI]
        public string Value { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置常量的描述信息。
        /// </summary>
        [PublicAPI]
        public string? Description { get; set; }
    }
    
    /// <summary>
    /// Defines a domain method within an entity
    /// </summary>
    public sealed class DomainMethodDefinition
    {
        /// <summary>
        /// 获取或设置领域方法名称。
        /// </summary>
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置方法返回类型。
        /// </summary>
        [PublicAPI]
        public string ReturnType { get; set; } = "void";
        
        /// <summary>
        /// 获取或设置一个值，指示方法是否为异步。
        /// </summary>
        [PublicAPI]
        public bool IsAsync { get; set; }
        
        /// <summary>
        /// 获取或设置方法的描述信息。
        /// </summary>
        [PublicAPI]
        public string? Description { get; set; }
        
        /// <summary>
        /// 获取或设置方法参数列表。
        /// </summary>
        [PublicAPI]
        public IList<ParameterDefinition> Parameters { get; set; } = new List<ParameterDefinition>();
        
        /// <summary>
        /// 获取或设置方法体代码。
        /// </summary>
        [PublicAPI]
        public string? MethodBody { get; set; }
    }
    
    /// <summary>
    /// Defines a parameter for methods
    /// </summary>
    public sealed class ParameterDefinition
    {
        /// <summary>
        /// 获取或设置参数名称。
        /// </summary>
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置参数类型。
        /// </summary>
        [PublicAPI]
        public string Type { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置一个值，指示参数是否为可选。
        /// </summary>
        [PublicAPI]
        public bool IsOptional { get; set; }
        
        /// <summary>
        /// 获取或设置参数的默认值。
        /// </summary>
        [PublicAPI]
        public string? DefaultValue { get; set; }
    }
    
    /// <summary>
    /// Defines validation rules for properties
    /// </summary>
    public sealed class ValidationRule
    {
        /// <summary>
        /// 获取或设置验证规则名称。
        /// </summary>
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置验证条件表达式。
        /// </summary>
        [PublicAPI]
        public string Condition { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置验证失败时的错误消息。
        /// </summary>
        [PublicAPI]
        public string ErrorMessage { get; set; } = string.Empty;
    }
    
    /// <summary>
    /// Represents the result of code generation
    /// </summary>
    public sealed class GeneratedCode
    {
        /// <summary>
        /// 获取或设置生成的代码名称。
        /// </summary>
        [PublicAPI]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置生成的源代码内容。
        /// </summary>
        [PublicAPI]
        public string SourceCode { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置编译后的程序集字节数组。
        /// </summary>
        [PublicAPI]
        public byte[]? CompiledAssembly { get; set; }
        
        /// <summary>
        /// 获取或设置代码元数据信息。
        /// </summary>
        [PublicAPI]
        public CodeMetadata Metadata { get; set; } = new();
        
        /// <summary>
        /// 获取或设置代码生成耗时。
        /// </summary>
        [PublicAPI]
        public TimeSpan GenerationTime { get; set; }
    }
    
    /// <summary>
    /// Metadata about generated code
    /// </summary>
    public sealed class CodeMetadata
    {
        /// <summary>
        /// 获取或设置代码生成时间。
        /// </summary>
        [PublicAPI]
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// 获取或设置代码生成器版本。
        /// </summary>
        [PublicAPI]
        public string GeneratorVersion { get; set; } = "1.0.0";
        
        /// <summary>
        /// 获取或设置生成的代码行数。
        /// </summary>
        [PublicAPI]
        public int LinesOfCode { get; set; }
        
        /// <summary>
        /// 获取或设置附加属性字典。
        /// </summary>
        [PublicAPI]
        public IDictionary<string, object> AdditionalProperties { get; set; } = new Dictionary<string, object>();
    }
    
    /// <summary>
    /// Task for background processing
    /// </summary>
    internal sealed class GenerationTask
    {
        /// <summary>
        /// 获取或设置生成任务ID。
        /// </summary>
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        /// <summary>
        /// 获取或设置实体定义。
        /// </summary>
        public EntityDefinition Definition { get; set; } = new();
        
        /// <summary>
        /// 获取或设置任务完成源。
        /// </summary>
        public TaskCompletionSource<GeneratedCode> CompletionSource { get; set; } = new();
    }
    
    /// <summary>
    /// Defines an index for entity properties
    /// </summary>
    public sealed class IndexDefinition
    {
        /// <summary>
        /// 获取或设置索引属性名称。
        /// </summary>
        [PublicAPI]
        public string PropertyName { get; set; } = string.Empty;
        
        /// <summary>
        /// 获取或设置一个值，指示索引是否为唯一索引。
        /// </summary>
        [PublicAPI]
        public bool IsUnique { get; set; } = false;
        
        /// <summary>
        /// 获取或设置索引名称。
        /// </summary>
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