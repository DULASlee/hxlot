using System;
using System.Collections.Generic;

namespace SmartAbp.CodeGenerator.Services
{
    // =================================================================
    // == V9 Plan - Full-Stack, Unified Metadata DTOs
    // =================================================================
    namespace V9
    {
        public class ValidationIssueDto
        {
            public string Severity { get; set; } = "warning"; // "error" | "warning"
            public string Message { get; set; } = string.Empty;
            public string? Path { get; set; }
        }

        public class ValidationReportDto
        {
            public bool IsValid { get; set; }
            public List<ValidationIssueDto> Issues { get; set; } = new();
            public int EntitiesCount { get; set; }
            public int PropertiesCount { get; set; }
        }

        public class GenerationDryRunResultDto
        {
            public bool Success { get; set; }
            public string ModuleName { get; set; } = string.Empty;
            public int TotalFiles { get; set; }
            public int TotalLines { get; set; }
            public List<string> Files { get; set; } = new();
            public string GenerationReport { get; set; } = string.Empty;
            public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        }

        public class SchemaVersionManifestDto
        {
            public string CurrentVersion { get; set; } = "1.0.0";
            public int CurrentMajor { get; set; } = 1;
            public int MinSupportedMajor { get; set; } = 1;
            public int MaxSupportedMajor { get; set; } = 1;
        }

        /// <summary>
        /// 权限点定义
        /// </summary>
        public class PermissionDefinitionDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!; // e.g., 'SmartAbp.Construction.Project.Create'
            public string DisplayName { get; set; } = default!;
            public string Description { get; set; } = default!;
            public string ParentName { get; set; } = default!;
        }

        /// <summary>
        /// 权限组定义
        /// </summary>
        public class PermissionGroupDefinitionDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!; // e.g., 'SmartAbp.Construction'
            public string DisplayName { get; set; } = default!;
            public List<PermissionDefinitionDto> Permissions { get; set; } = new();
        }

        /// <summary>
        /// 权限配置 (聚合根)
        /// </summary>
        public class PermissionConfigDto
        {
            public List<PermissionGroupDefinitionDto> Groups { get; set; } = new();
            public List<CustomPermissionActionDto> CustomActions { get; set; } = new();
        }

        public class CustomPermissionActionDto
        {
            public string EntityName { get; set; } = default!; // e.g., Project
            public string ActionKey { get; set; } = default!;  // e.g., Approve
            public string DisplayName { get; set; } = default!; // e.g., 审核
        }

        /// <summary>
        /// 菜单项定义
        /// </summary>
        public class MenuConfigDto
        {
            public string Id { get; set; } = default!;
            public string Title { get; set; } = default!;
            public string Path { get; set; } = default!;
            public string Icon { get; set; } = default!;
            public string ComponentPath { get; set; } = default!;
            public string RequiredPermission { get; set; } = default!;
            public List<MenuConfigDto> Children { get; set; } = new();
        }

        /// <summary>
        /// 全链路模块元数据 (聚合根)
        /// 这是驱动整个低代码引擎的单一事实来源
        /// </summary>
        public class ModuleMetadataDto
        {
            public string Id { get; set; } = default!;
            public string SystemName { get; set; } = default!; // e.g., 'SmartConstruction', 'MES'
            public string Name { get; set; } = default!; // This is now ModuleName, e.g., 'ProjectManagement', 'Device'
            public string DisplayName { get; set; } = default!;
            public string Description { get; set; } = default!; // 模块用途描述
            public string Version { get; set; } = "1.0.0";
            public string ArchitecturePattern { get; set; } = "Crud"; // "Crud", "DDD", "CQRS"
            public DatabaseConfigDto DatabaseInfo { get; set; } = new();
            public FeatureManagementDto FeatureManagement { get; set; } = new();
            public FrontendConfigDto Frontend { get; set; } = new(); // 新增前端配置
            public bool GenerateMobilePages { get; set; } // 新增移动端开关
            public List<string> Dependencies { get; set; } = new(); // List of dependent module names
            public List<EnhancedEntityModelDto> Entities { get; set; } = new();
            public List<MenuConfigDto> MenuConfig { get; set; } = new();
            public PermissionConfigDto PermissionConfig { get; set; } = default!;
        }

        // --- All nested types required by ModuleMetadataDto ---

        #region Nested DTOs for EnhancedEntityModelDto

        public class DatabaseConfigDto
        {
            public string ConnectionStringName { get; set; } = "Default";
            public string Schema { get; set; } = default!;
            public string Provider { get; set; } = "SqlServer"; // SqlServer | PostgreSql | MySql | Oracle
        }

        public class FrontendConfigDto // 新增DTO
        {
            public string ParentId { get; set; }
            public string RoutePrefix { get; set; }
        }

        public class FeatureManagementDto
        {
            public bool IsEnabled { get; set; }
            public string DefaultPolicy { get; set; } = default!;
        }

        public class MenuItemDto
        {
            public string Id { get; set; }
            public string Label { get; set; }
            public List<MenuItemDto> Children { get; set; }
        }

        // ================= Database Introspection DTOs =================
        public class DatabaseIntrospectionRequestDto
        {
            public string ConnectionStringName { get; set; } = default!; // e.g. "Default"
            public string Provider { get; set; } = "SqlServer"; // SqlServer | PostgreSql | MySql | Oracle
            public string? Schema { get; set; } // optional filter
            public List<string>? Tables { get; set; } // optional filter
        }

        public class DatabaseSchemaDto
        {
            public List<TableSchemaDto> Tables { get; set; } = new();
        }

        public class TableSchemaDto
        {
            public string Schema { get; set; } = default!;
            public string Name { get; set; } = default!;
            public List<ColumnSchemaDto> Columns { get; set; } = new();
            public List<ForeignKeySchemaDto> ForeignKeys { get; set; } = new();
        }

        public class ColumnSchemaDto
        {
            public string Name { get; set; } = default!;
            public string DataType { get; set; } = default!; // provider-specific type name
            public bool IsNullable { get; set; }
            public int? MaxLength { get; set; }
            public bool IsPrimaryKey { get; set; }
        }

        public class ForeignKeySchemaDto
        {
            public string Column { get; set; } = default!;
            public string ReferencedSchema { get; set; } = default!;
            public string ReferencedTable { get; set; } = default!;
            public string ReferencedColumn { get; set; } = default!;
        }

        public class EnhancedEntityModelDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string DisplayName { get; set; } = default!;
            public string Description { get; set; } = default!;
            public string Module { get; set; } = default!;
            public string Namespace { get; set; } = default!;
            public bool IsAggregateRoot { get; set; }
            public bool IsAudited { get; set; }
            public bool IsSoftDelete { get; set; }
            public bool IsMultiTenant { get; set; }
            public string BaseClass { get; set; } = default!;
            public List<string> Interfaces { get; set; } = new();
            public List<EntityPropertyDto> Properties { get; set; } = new();
            public List<EntityRelationshipDto> Relationships { get; set; } = new();
            public string TableName { get; set; } = default!;
            public string Schema { get; set; } = default!;
            public List<EntityIndexDto> Indexes { get; set; } = new();
            public List<EntityConstraintDto> Constraints { get; set; } = new();
            public List<BusinessRuleDto> BusinessRules { get; set; } = new();
            public List<EntityPermissionDto> Permissions { get; set; } = new();
            public CodeGenerationConfigDto CodeGeneration { get; set; } = default!;
            public EntityUIConfigDto UiConfig { get; set; } = default!;
            public DateTime CreatedAt { get; set; }
            public DateTime UpdatedAt { get; set; }
            public string Version { get; set; } = default!;
            public List<string> Tags { get; set; } = new();
        }

        public class EntityPropertyDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string DisplayName { get; set; } = default!;
            public string Type { get; set; } = default!; // PropertyType enum as string
            public bool IsRequired { get; set; }
            public bool IsKey { get; set; }
            public bool IsUnique { get; set; }
            public bool IsIndexed { get; set; }
            public object DefaultValue { get; set; } = default!;
            public string Description { get; set; } = default!;
            public string HelpText { get; set; } = default!;
            public int? MaxLength { get; set; }
            public int? MinLength { get; set; }
            public string Pattern { get; set; } = default!;
            public int? Precision { get; set; }
            public int? Scale { get; set; }
            public double? MinValue { get; set; }
            public double? MaxValue { get; set; }
            public List<EnumValueDto> EnumValues { get; set; } = new();
            public List<ValidationRuleDto> ValidationRules { get; set; } = new();
            public int DisplayOrder { get; set; }
            public string GroupName { get; set; } = default!;
            public bool IsVisible { get; set; }
            public bool IsReadonly { get; set; }
            public string ColumnName { get; set; } = default!;
            public string ColumnType { get; set; } = default!;
            public bool IsAuditField { get; set; }
            public bool IsSoftDeleteField { get; set; }
            public bool Searchable { get; set; }
            public bool Disabled { get; set; }
            public bool ListVisible { get; set; }
            public bool DetailVisible { get; set; }
            public bool FormVisible { get; set; }
            public bool Sortable { get; set; }
            public bool Filterable { get; set; }
            public bool IsTenantField { get; set; }
        }

        public class EntityRelationshipDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string DisplayName { get; set; } = default!;
            public string SourceEntityId { get; set; } = default!;
            public string TargetEntityId { get; set; } = default!;
            public string TargetEntity { get; set; } = default!;
            public string Type { get; set; } = default!;
            public string SourceProperty { get; set; } = default!;
            public string TargetProperty { get; set; } = default!;
            public string SourceNavigationProperty { get; set; } = default!;
            public string TargetNavigationProperty { get; set; } = default!;
            public bool CascadeDelete { get; set; }
            public bool IsRequired { get; set; }
            public string ForeignKeyProperty { get; set; } = default!;
            public string JoinTableName { get; set; } = default!;
            public string OnDeleteAction { get; set; } = default!;
            // V4.2 扩展
            public bool IsForeignKeyRequired { get; set; } = true;
            public RelationshipDeleteBehavior OnDeleteBehavior { get; set; } = RelationshipDeleteBehavior.Cascade;
            public EnhancedEntityModelDto JoinEntity { get; set; } = default!;
        }

        public enum RelationshipDeleteBehavior
        {
            Cascade,
            Restrict,
            NoAction,
            SetNull
        }

        public class ValidationRuleDto
        {
            public string Id { get; set; } = default!;
            public string Type { get; set; } = default!;
            public object Value { get; set; } = default!;
            public string Message { get; set; } = default!;
            public string Condition { get; set; } = default!;
        }

        public class EnumValueDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!;
            public object Value { get; set; } = default!;
            public string DisplayName { get; set; } = default!;
            public string Description { get; set; } = default!;
            public bool IsDefault { get; set; }
        }

        public class EntityIndexDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!;
            public List<string> Columns { get; set; } = new();
            public bool IsUnique { get; set; }
            public bool IsClustered { get; set; }
            public List<string> IncludeColumns { get; set; } = new();
            public string FilterCondition { get; set; } = default!;
            public string Description { get; set; } = default!;
        }

        public class EntityConstraintDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string Type { get; set; } = default!;
            public List<string> Columns { get; set; } = new();
            public string Expression { get; set; } = default!;
            public string ReferencedTable { get; set; } = default!;
            public List<string> ReferencedColumns { get; set; } = new();
            public string OnDelete { get; set; } = default!;
            public string OnUpdate { get; set; } = default!;
        }

        public class BusinessRuleDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string Description { get; set; } = default!;
            public string Type { get; set; } = default!;
            public string Condition { get; set; } = default!;
            public string Action { get; set; } = default!;
            public int Priority { get; set; }
            public bool IsActive { get; set; }
            public string ErrorMessage { get; set; } = default!;
        }

        public class EntityPermissionDto
        {
            public string Id { get; set; } = default!;
            public string Operation { get; set; } = default!;
            public List<string> Roles { get; set; } = new();
            public string Condition { get; set; } = default!;
            public List<FieldPermissionDto> FieldLevelPermissions { get; set; } = new();
        }

        public class FieldPermissionDto
        {
            public string PropertyName { get; set; } = default!;
            public string Operation { get; set; } = default!;
            public List<string> Roles { get; set; } = new();
            public string Condition { get; set; } = default!;
        }

        public class CodeGenerationConfigDto
        {
            public bool GenerateEntity { get; set; }
            public bool GenerateRepository { get; set; }
            public bool GenerateService { get; set; }
            public bool GenerateController { get; set; }
            public bool GenerateDto { get; set; }
            public bool GenerateTests { get; set; }
            public Dictionary<string, string> CustomTemplates { get; set; } = new();
            public CodeGenerationOptionsDto Options { get; set; } = default!;
        }

        public class CodeGenerationOptionsDto
        {
            public bool UseAutoMapper { get; set; }
            public bool GenerateValidation { get; set; }
            public bool GenerateSwaggerDoc { get; set; }
            public bool GeneratePermissions { get; set; }
            public bool GenerateAuditLog { get; set; }
        }

        // ================= Unified Module Schema (Frontend -> Backend single source) =================
        public class UnifiedModuleSchemaDto
        {
            public string Id { get; set; } = default!;
            public string SystemName { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string DisplayName { get; set; } = default!;
            public string Description { get; set; } = string.Empty;
            public string Version { get; set; } = "1.0.0";
            public string ArchitecturePattern { get; set; } = "Crud";
            public UnifiedDatabaseConfigDto DatabaseInfo { get; set; } = new();
            public UnifiedFeatureManagementDto FeatureManagement { get; set; } = new();
            public UnifiedFrontendConfigDto Frontend { get; set; } = new();
            public bool GenerateMobilePages { get; set; }
            public List<string> Dependencies { get; set; } = new();
            public List<UnifiedEntitySchemaDto> Entities { get; set; } = new();
            public UnifiedPermissionConfigDto PermissionConfig { get; set; } = new();
        }

        public class UnifiedDatabaseConfigDto
        {
            public string ConnectionStringName { get; set; } = "Default";
            public string Provider { get; set; } = "SqlServer";
            public string Schema { get; set; } = "dbo";
        }

        public class UnifiedFeatureManagementDto
        {
            public bool IsEnabled { get; set; }
            public string DefaultPolicy { get; set; } = string.Empty;
        }

        public class UnifiedFrontendConfigDto
        {
            public string? ParentId { get; set; }
            public string? RoutePrefix { get; set; }
        }

        public class UnifiedEntitySchemaDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string? DisplayName { get; set; }
            public string Description { get; set; } = string.Empty;
            public string Module { get; set; } = default!;
            public string Namespace { get; set; } = default!;
            public string TableName { get; set; } = default!;
            public string Schema { get; set; } = "dbo";
            public bool IsAggregateRoot { get; set; } = true;
            public bool IsMultiTenant { get; set; }
            public bool IsSoftDelete { get; set; }
            public string BaseClass { get; set; } = "FullAuditedAggregateRoot";
            public List<UnifiedPropertySchemaDto> Properties { get; set; } = new();
            public List<UnifiedRelationshipSchemaDto> Relationships { get; set; } = new();
        }

        public class UnifiedPropertySchemaDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string Type { get; set; } = "string";
            public bool IsRequired { get; set; }
            public bool IsPrimaryKey { get; set; }
            public bool IsUnique { get; set; }
            public int? MaxLength { get; set; }
            public int? MinLength { get; set; }
            public object? DefaultValue { get; set; }
            public string? Description { get; set; }
        }

        public class UnifiedRelationshipSchemaDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string Type { get; set; } = "ManyToOne";
            public string SourceEntityId { get; set; } = default!;
            public string TargetEntityId { get; set; } = default!;
            public string? SourcePropertyName { get; set; }
            public string? TargetPropertyName { get; set; }
            public bool CascadeDelete { get; set; }
            public bool IsRequired { get; set; }
        }

        public class UnifiedPermissionConfigDto
        {
            public List<UnifiedCustomPermissionActionDto> CustomActions { get; set; } = new();
            public List<string> InheritedPermissions { get; set; } = new();
            public Dictionary<string, string[]> RoleBasedAccess { get; set; } = new();
        }

        public class UnifiedCustomPermissionActionDto
        {
            public string EntityName { get; set; } = default!;
            public string ActionKey { get; set; } = default!;
            public string DisplayName { get; set; } = default!;
        }

        public class EntityUIConfigDto
        {
            public ListConfigDto ListConfig { get; set; } = default!;
            public FormConfigDto FormConfig { get; set; } = default!;
            public DetailConfigDto DetailConfig { get; set; } = default!;
        }

        public class ListConfigDto
        {
            public int DefaultPageSize { get; set; }
            public List<string> SortableColumns { get; set; } = new();
            public List<string> FilterableColumns { get; set; } = new();
            public List<string> SearchableColumns { get; set; } = new();
            public List<string> DisplayColumns { get; set; } = new();
            public List<UIActionDto> Actions { get; set; } = new();
        }

        public class FormConfigDto
        {
            public string Layout { get; set; } = default!;
            public int ColumnCount { get; set; }
            public List<FieldGroupDto> FieldGroups { get; set; } = new();
            public string ValidationStrategy { get; set; } = default!;
        }

        public class DetailConfigDto
        {
            public string Layout { get; set; } = default!;
            public List<DetailSectionDto> Sections { get; set; } = new();
            public List<UIActionDto> Actions { get; set; } = new();
        }

        public class UIActionDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string Type { get; set; } = default!;
            public string Icon { get; set; } = default!;
            public string Color { get; set; } = default!;
            public string Size { get; set; } = default!;
            public string Position { get; set; } = default!;
            public string Action { get; set; } = default!;
            public string Condition { get; set; } = default!;
            public List<string> Permissions { get; set; } = new();
        }

        public class FieldGroupDto
        {
            public string Id { get; set; } = default!;
            public string Name { get; set; } = default!;
            public string Title { get; set; } = default!;
            public string Description { get; set; } = default!;
            public bool Collapsible { get; set; }
            public bool Collapsed { get; set; }
            public int Columns { get; set; }
            public List<string> Fields { get; set; } = new();
        }

        public class DetailSectionDto
        {
            public string Id { get; set; } = default!;
            public string Title { get; set; } = default!;
            public string Type { get; set; } = default!;
            public List<string> Properties { get; set; } = new();
            public List<string> Relationships { get; set; } = new();
            public string CustomComponent { get; set; } = default!;
            public bool Collapsible { get; set; }
            public bool Collapsed { get; set; }
        }

        #endregion
    }

    #region Page Schema DTOs for Frontend Renderer
    
    public class PageSchemaDto
    {
        public string PageType { get; set; } = default!;
        public string Title { get; set; } = default!;
    }

    public class ListPageSchemaDto : PageSchemaDto
    {
        public List<ColumnDefinition> Columns { get; set; } = new();
    }

    public class FormPageSchemaDto : PageSchemaDto
    {
        public List<FieldDefinition> Fields { get; set; } = new();
    }

    public class ColumnDefinition
    {
        public string Prop { get; set; } = default!;
        public string Label { get; set; } = default!;
    }

    public class FieldDefinition
    {
        public string Name { get; set; } = default!;
        public string Label { get; set; } = default!;
    }

    #endregion


    // =================================================================
    // == Existing DTOs (for backward compatibility)
    // =================================================================
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