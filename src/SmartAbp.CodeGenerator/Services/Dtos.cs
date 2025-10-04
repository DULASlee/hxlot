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
            
            // 🔥 企业级扩展：添加模板系统所需属性（遵循BUG修复铁律 - 完善类型定义）
            public string Namespace { get; set; } = default!; // 命名空间，如 "SmartAbp.ProjectManagement"
            public string Author { get; set; } = "SmartAbp Generator"; // 代码生成作者信息
            
            public DatabaseConfigDto DatabaseInfo { get; set; } = new();
            public FeatureManagementDto FeatureManagement { get; set; } = new();
            public FrontendConfigDto Frontend { get; set; } = new(); // 新增前端配置
            public bool GenerateMobilePages { get; set; } // 新增移动端开关
            public List<string> Dependencies { get; set; } = new(); // List of dependent module names
            public List<EnhancedEntityModelDto> Entities { get; set; } = new();
            public List<MenuConfigDto> MenuConfig { get; set; } = new();
            public PermissionConfigDto PermissionConfig { get; set; } = default!;
        }

        // 🔥 重复代码检查修复：ConflictResolutionStrategy已在FileOperations命名空间中定义
        // 遵循第十三重爆雷规则 - 严禁重复定义同名枚举
        // 请使用: SmartAbp.CodeGenerator.Core.FileOperations.ConflictResolutionStrategy

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
            public string ParentId { get; set; } = default!;
            public string RoutePrefix { get; set; } = default!;
        }

        public class FeatureManagementDto
        {
            public bool IsEnabled { get; set; }
            public string DefaultPolicy { get; set; } = default!;
        }

        public class MenuItemDto
        {
            public string Id { get; set; } = default!;
            public string Label { get; set; } = default!;
            public List<MenuItemDto> Children { get; set; } = new List<MenuItemDto>();
        }

        // ================= Database Introspection DTOs =================
        public class DatabaseConnectionRequestDto
        {
            public string Provider { get; set; } = "SqlServer"; // SqlServer | PostgreSql | MySql | Oracle
            public string ConnectionString { get; set; } = default!;
            public string? Schema { get; set; }
        }

        public class DatabaseConnectionTestResultDto
        {
            public bool Success { get; set; }
            public string Message { get; set; } = default!;
            public string? ServerVersion { get; set; }
            public string? DatabaseName { get; set; }
            public int? SchemaCount { get; set; }
            public int? TableCount { get; set; }
        }

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
        public string? DisplayName { get; set; }
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
        public bool IsPrivateSetter { get; set; }
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
        public bool IsVirtual { get; set; }
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

        // Additional properties used by CodeGenerationAppService
        public bool Success { get; set; } = true;
        public string EntityName { get; set; } = string.Empty;
        public List<GeneratedFileDto> GeneratedFiles { get; set; } = new();
        public string GenerationReport { get; set; } = string.Empty;
    }

    public class GeneratedFileDto
    {
        public string Name { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public string RelativePath { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty; // e.g., "CSharp", "TypeScript", "Vue"
        public string Type { get; set; } = string.Empty; // e.g., "Entity", "AppService", "Dto", etc.
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
        public List<RepositoryDefinitionDto> Repositories { get; set; } = new();
        public bool UseMultiTenancy { get; set; }
        public bool UseSoftDelete { get; set; }
        public bool UseAuditing { get; set; }
        public bool UseExtraProperties { get; set; }
        public string DefaultKeyType { get; set; } = "Guid";
    }

    public class AggregateDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string KeyType { get; set; } = "Guid";
        public bool IsMultiTenant { get; set; }
        public bool IsSoftDelete { get; set; }
        public bool HasExtraProperties { get; set; }
        public List<PropertyDefinitionDto> Properties { get; set; } = new();
        public List<DomainMethodDefinitionDto> DomainMethods { get; set; } = new();
        public List<BusinessRuleDefinitionDto> BusinessRules { get; set; } = new();
        public List<DomainEventDefinitionDto> DomainEvents { get; set; } = new();
    }

    public class ValueObjectDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<PropertyDefinitionDto> Properties { get; set; } = new();
        public bool IsImmutable { get; set; } = true;
        public bool ImplementsEquality { get; set; } = true;
    }

    public class DomainEventDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string AggregateType { get; set; } = string.Empty;
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
        public List<string> Dependencies { get; set; } = new();
        public bool IsStateless { get; set; } = true;
    }

    public class BusinessRuleDefinitionDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Condition { get; set; } = string.Empty;
        public string Expression { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
        public List<string> Parameters { get; set; } = new();
    }

    public class GeneratedDddSolutionDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public List<GeneratedFileDto> Files { get; set; } = new();
        public int AggregateCount { get; set; }
        public int EntityCount { get; set; }
        public int ValueObjectCount { get; set; }
        public int DomainEventCount { get; set; }
        public int RepositoryCount { get; set; }
        public int DomainServiceCount { get; set; }
        public int SpecificationCount { get; set; }
        public DateTime GeneratedAt { get; set; }
        public int GenerationTimeMs { get; set; }
        public int TotalLinesOfCode { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
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
        public string Name { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public string AggregateType { get; set; } = string.Empty;
        public string KeyType { get; set; } = "Guid";
        public string DbContextName { get; set; } = string.Empty;
        public bool ImplementsStandardMethods { get; set; } = true;
        public bool SupportsSpecifications { get; set; } = true;
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

        // Additional properties used by CodeGenerationAppService
        public int TotalModulesGenerated { get; set; }
        public int TotalEntitiesGenerated { get; set; }
        public int TotalFilesGenerated { get; set; }
        public int TotalLinesOfCodeGenerated { get; set; }
        public DateTime? LastGenerationDate { get; set; }
        public string GenerationEngineVersion { get; set; } = "1.0.0";
        public int QualityScore { get; set; } = 95;
        public CodeGenerationPerformanceDto Performance { get; set; } = new();
    }

    public class CodeGenerationPerformanceDto
    {
        public double AverageGenerationTimeMs { get; set; }
        public double AverageFilesPerSecond { get; set; }
        public double AverageLinesPerSecond { get; set; }
        public long PeakMemoryUsageMB { get; set; }
        public long MemoryUsageMB { get; set; }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Day 10: 多环境配置管理 DTOs
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 环境类型枚举 - Dev/Staging/Prod
    /// </summary>
    public enum EnvironmentType
    {
        Development,
        Staging,
        Production
    }

    /// <summary>
    /// 部署策略类型
    /// </summary>
    public enum DeploymentStrategyType
    {
        RollingUpdate,   // 滚动更新
        BlueGreen,       // 蓝绿部署
        Canary           // 金丝雀发布
    }

    /// <summary>
    /// 环境配置DTO - 核心配置
    /// </summary>
    public class EnvironmentConfigDto
    {
        public string Environment { get; set; } = "Development";
        public int DefaultReplicas { get; set; } = 1;
        public ResourceLimitsDto Resources { get; set; } = new();
        public Dictionary<string, string> EnvironmentVariables { get; set; } = new();
        public FeatureFlagsDto Features { get; set; } = new();
        public DeploymentStrategyConfigDto DeploymentStrategy { get; set; } = new();
        public bool EnableAutoScaling { get; set; } = false;
        public AutoScalingConfigDto? AutoScaling { get; set; }
    }

    /// <summary>
    /// 资源限制配置
    /// </summary>
    public class ResourceLimitsDto
    {
        public string CpuRequest { get; set; } = "100m";
        public string CpuLimit { get; set; } = "500m";
        public string MemoryRequest { get; set; } = "128Mi";
        public string MemoryLimit { get; set; } = "512Mi";
        public string StorageRequest { get; set; } = "1Gi";
        public string StorageLimit { get; set; } = "10Gi";
    }

    /// <summary>
    /// 特性开关配置
    /// </summary>
    public class FeatureFlagsDto
    {
        public bool EnableTelemetry { get; set; } = true;
        public bool EnableMetrics { get; set; } = true;
        public bool EnableTracing { get; set; } = true;
        public bool EnableLogging { get; set; } = true;
        public bool EnableHealthChecks { get; set; } = true;
        public bool EnableSwagger { get; set; } = true;
        public Dictionary<string, bool> CustomFlags { get; set; } = new();
    }

    /// <summary>
    /// 部署策略配置
    /// </summary>
    public class DeploymentStrategyConfigDto
    {
        public string Type { get; set; } = "RollingUpdate";
        public string MaxSurge { get; set; } = "25%";
        public string MaxUnavailable { get; set; } = "0";
        public int MinReadySeconds { get; set; } = 5;
        public int ProgressDeadlineSeconds { get; set; } = 600;
    }

    /// <summary>
    /// 自动扩缩容配置
    /// </summary>
    public class AutoScalingConfigDto
    {
        public int MinReplicas { get; set; } = 1;
        public int MaxReplicas { get; set; } = 10;
        public int TargetCPUUtilization { get; set; } = 70;
        public int TargetMemoryUtilization { get; set; } = 80;
        public List<CustomMetricDto> CustomMetrics { get; set; } = new();
    }

    /// <summary>
    /// 自定义指标配置
    /// </summary>
    public class CustomMetricDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = "Pods";
        public string TargetType { get; set; } = "AverageValue";
        public string TargetValue { get; set; } = "1k";
    }

    /// <summary>
    /// 环境对比结果DTO
    /// </summary>
    public class EnvironmentComparisonDto
    {
        public string Environment1 { get; set; } = string.Empty;
        public string Environment2 { get; set; } = string.Empty;
        public List<ConfigDifferenceDto> Differences { get; set; } = new();
        public int TotalDifferences { get; set; }
        public DateTime ComparedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 配置差异项
    /// </summary>
    public class ConfigDifferenceDto
    {
        public string Path { get; set; } = string.Empty;
        public string Property { get; set; } = string.Empty;
        public string? Value1 { get; set; }
        public string? Value2 { get; set; }
        public string DifferenceType { get; set; } = "Modified"; // Added, Removed, Modified
    }

    /// <summary>
    /// Kubernetes Manifest生成结果
    /// </summary>
    public class GeneratedKubernetesManifestDto
    {
        public string Environment { get; set; } = string.Empty;
        public Dictionary<string, string> Manifests { get; set; } = new(); // Key: filename, Value: YAML content
        public int ResourceCount { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Helm Chart生成结果
    /// </summary>
    public class GeneratedHelmChartDto
    {
        public string ChartName { get; set; } = string.Empty;
        public string ChartVersion { get; set; } = "1.0.0";
        public Dictionary<string, string> Files { get; set; } = new(); // Key: path, Value: content
        public int TemplateCount { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Day 12: 安全策略配置 DTOs
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 安全策略配置DTO - 完整的安全配置
    /// </summary>
    public class SecurityPolicyDto
    {
        public NetworkPolicyDto NetworkPolicy { get; set; } = new();
        public AuthenticationDto Authentication { get; set; } = new();
        public AuthorizationDto Authorization { get; set; } = new();
        public SecretsManagementDto Secrets { get; set; } = new();
        public ApiSecurityDto ApiSecurity { get; set; } = new();
    }

    /// <summary>
    /// 网络策略DTO
    /// </summary>
    public class NetworkPolicyDto
    {
        public string PolicyType { get; set; } = "Allow"; // Allow/Deny
        public List<NetworkRuleDto> IngressRules { get; set; } = new();
        public List<NetworkRuleDto> EgressRules { get; set; } = new();
        public bool EnablePodSelector { get; set; } = true;
        public Dictionary<string, string> PodSelector { get; set; } = new();
    }

    /// <summary>
    /// 网络规则DTO
    /// </summary>
    public class NetworkRuleDto
    {
        public string Name { get; set; } = string.Empty;
        public List<string> Ports { get; set; } = new();
        public string Protocol { get; set; } = "TCP"; // TCP/UDP/SCTP
        public List<string> FromCIDR { get; set; } = new();
        public List<string> ToCIDR { get; set; } = new();
        public Dictionary<string, string> FromPodSelector { get; set; } = new();
        public Dictionary<string, string> ToPodSelector { get; set; } = new();
    }

    /// <summary>
    /// 身份认证DTO
    /// </summary>
    public class AuthenticationDto
    {
        public string Type { get; set; } = "JWT"; // JWT/OAuth2/OIDC
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public string Authority { get; set; } = string.Empty;
        public int TokenExpirationMinutes { get; set; } = 60;
        public bool RequireHttpsMetadata { get; set; } = true;
        public List<string> ValidIssuers { get; set; } = new();
        public List<string> ValidAudiences { get; set; } = new();
    }

    /// <summary>
    /// 授权策略DTO
    /// </summary>
    public class AuthorizationDto
    {
        public string Type { get; set; } = "RBAC"; // RBAC/ABAC
        public List<RoleDto> Roles { get; set; } = new();
        public List<RoleBindingDto> RoleBindings { get; set; } = new();
        public List<PolicyDto> Policies { get; set; } = new();
    }

    /// <summary>
    /// 角色DTO
    /// </summary>
    public class RoleDto
    {
        public string Name { get; set; } = string.Empty;
        public List<string> Permissions { get; set; } = new();
        public Dictionary<string, string> Labels { get; set; } = new();
    }

    /// <summary>
    /// 角色绑定DTO
    /// </summary>
    public class RoleBindingDto
    {
        public string Name { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public List<string> Subjects { get; set; } = new();
        public string SubjectType { get; set; } = "ServiceAccount"; // User/Group/ServiceAccount
    }

    /// <summary>
    /// 策略DTO
    /// </summary>
    public class PolicyDto
    {
        public string Name { get; set; } = string.Empty;
        public string Effect { get; set; } = "Allow"; // Allow/Deny
        public List<string> Actions { get; set; } = new();
        public List<string> Resources { get; set; } = new();
        public Dictionary<string, string> Conditions { get; set; } = new();
    }

    /// <summary>
    /// 密钥管理DTO
    /// </summary>
    public class SecretsManagementDto
    {
        public string Provider { get; set; } = "Kubernetes"; // Kubernetes/AzureKeyVault/HashiCorpVault
        public string KeyVaultName { get; set; } = string.Empty;
        public string KeyVaultUri { get; set; } = string.Empty;
        public bool UseSystemManagedIdentity { get; set; } = true;
        public List<SecretDto> Secrets { get; set; } = new();
    }

    /// <summary>
    /// 密钥DTO
    /// </summary>
    public class SecretDto
    {
        public string Name { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
        public string? Value { get; set; }
        public string Type { get; set; } = "Opaque"; // Opaque/TLS/DockerConfigJson
    }

    /// <summary>
    /// API安全DTO
    /// </summary>
    public class ApiSecurityDto
    {
        public bool EnableRateLimiting { get; set; } = true;
        public int RateLimitPerMinute { get; set; } = 100;
        public bool EnableCORS { get; set; } = true;
        public List<string> AllowedOrigins { get; set; } = new();
        public List<string> AllowedMethods { get; set; } = new() { "GET", "POST", "PUT", "DELETE" };
        public List<string> AllowedHeaders { get; set; } = new();
        public bool EnableApiKey { get; set; } = false;
        public string ApiKeyHeaderName { get; set; } = "X-API-Key";
    }

    /// <summary>
    /// 安全扫描报告DTO
    /// </summary>
    public class SecurityScanReportDto
    {
        public string ScanType { get; set; } = string.Empty; // Image/Dependency/Configuration
        public DateTime ScanTime { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Completed"; // Running/Completed/Failed
        public int TotalVulnerabilities { get; set; }
        public int CriticalCount { get; set; }
        public int HighCount { get; set; }
        public int MediumCount { get; set; }
        public int LowCount { get; set; }
        public List<VulnerabilityDto> Vulnerabilities { get; set; } = new();
    }

    /// <summary>
    /// 漏洞DTO
    /// </summary>
    public class VulnerabilityDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = "Low"; // Critical/High/Medium/Low
        public string PackageName { get; set; } = string.Empty;
        public string InstalledVersion { get; set; } = string.Empty;
        public string FixedVersion { get; set; } = string.Empty;
        public List<string> References { get; set; } = new();
    }

    /// <summary>
    /// 网络策略生成结果DTO
    /// </summary>
    public class GeneratedNetworkPolicyDto
    {
        public string PolicyName { get; set; } = string.Empty;
        public string YamlContent { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// RBAC配置生成结果DTO
    /// </summary>
    public class GeneratedRBACManifestDto
    {
        public Dictionary<string, string> Manifests { get; set; } = new(); // Key: filename, Value: YAML content
        public int RoleCount { get; set; }
        public int RoleBindingCount { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Day 14: 基础可观测性配置 DTOs
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 可观测性配置DTO - 完整的可观测性配置
    /// </summary>
    public class ObservabilityConfigDto
    {
        public PrometheusConfigDto Prometheus { get; set; } = new();
        public GrafanaDashboardDto Grafana { get; set; } = new();
        public JaegerConfigDto Tracing { get; set; } = new();
        public LokiConfigDto Logging { get; set; } = new();
    }

    /// <summary>
    /// Prometheus配置DTO
    /// </summary>
    public class PrometheusConfigDto
    {
        public string ScrapeInterval { get; set; } = "15s";
        public string EvaluationInterval { get; set; } = "15s";
        public List<ScrapeConfigDto> ScrapeConfigs { get; set; } = new();
        public List<AlertRuleDto> AlertRules { get; set; } = new();
        public bool EnableServiceMonitor { get; set; } = true;
    }

    /// <summary>
    /// 抓取配置DTO
    /// </summary>
    public class ScrapeConfigDto
    {
        public string JobName { get; set; } = string.Empty;
        public List<string> StaticTargets { get; set; } = new();
        public string MetricsPath { get; set; } = "/metrics";
        public Dictionary<string, string> Labels { get; set; } = new();
    }

    /// <summary>
    /// 告警规则DTO
    /// </summary>
    public class AlertRuleDto
    {
        public string Name { get; set; } = string.Empty;
        public string Expression { get; set; } = string.Empty;
        public string Duration { get; set; } = "5m";
        public string Severity { get; set; } = "warning"; // critical/warning/info
        public Dictionary<string, string> Labels { get; set; } = new();
        public Dictionary<string, string> Annotations { get; set; } = new();
    }

    /// <summary>
    /// Grafana仪表板DTO
    /// </summary>
    public class GrafanaDashboardDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<PanelDto> Panels { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public int RefreshInterval { get; set; } = 5; // 秒
    }

    /// <summary>
    /// 面板DTO
    /// </summary>
    public class PanelDto
    {
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = "graph"; // graph/singlestat/table/heatmap
        public List<MetricQueryDto> Queries { get; set; } = new();
        public int GridX { get; set; }
        public int GridY { get; set; }
        public int GridWidth { get; set; } = 12;
        public int GridHeight { get; set; } = 8;
    }

    /// <summary>
    /// 指标查询DTO
    /// </summary>
    public class MetricQueryDto
    {
        public string Expression { get; set; } = string.Empty;
        public string Legend { get; set; } = string.Empty;
        public string RefId { get; set; } = "A";
    }

    /// <summary>
    /// Jaeger追踪配置DTO
    /// </summary>
    public class JaegerConfigDto
    {
        public string SamplingType { get; set; } = "probabilistic"; // const/probabilistic/ratelimiting
        public double SamplingRate { get; set; } = 0.1;
        public string AgentHost { get; set; } = "jaeger-agent";
        public int AgentPort { get; set; } = 6831;
        public bool EnableBaggage { get; set; } = true;
    }

    /// <summary>
    /// Loki日志配置DTO
    /// </summary>
    public class LokiConfigDto
    {
        public string Url { get; set; } = "http://loki:3100";
        public List<string> Labels { get; set; } = new();
        public string RetentionPeriod { get; set; } = "30d";
        public bool EnableMultiTenancy { get; set; } = false;
    }

    /// <summary>
    /// 黄金指标DTO
    /// </summary>
    public class GoldenSignalsDto
    {
        public MetricQueryDto Latency { get; set; } = new(); // P50/P95/P99
        public MetricQueryDto Traffic { get; set; } = new(); // RPS
        public MetricQueryDto Errors { get; set; } = new(); // Error Rate
        public MetricQueryDto Saturation { get; set; } = new(); // Resource Usage
    }

    /// <summary>
    /// RED指标DTO (Rate, Errors, Duration)
    /// </summary>
    public class REDMetricsDto
    {
        public MetricQueryDto Rate { get; set; } = new();
        public MetricQueryDto Errors { get; set; } = new();
        public MetricQueryDto Duration { get; set; } = new();
    }

    /// <summary>
    /// 生成的Prometheus配置结果
    /// </summary>
    public class GeneratedPrometheusConfigDto
    {
        public string ConfigYaml { get; set; } = string.Empty;
        public string ServiceMonitorYaml { get; set; } = string.Empty;
        public string AlertRulesYaml { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 生成的Grafana仪表板结果
    /// </summary>
    public class GeneratedGrafanaDashboardDto
    {
        public string DashboardJson { get; set; } = string.Empty;
        public int PanelCount { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Day 20: 弹性策略配置 DTOs - Phase 2 弹性工程
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 弹性策略配置DTO - 完整的弹性模式配置
    /// </summary>
    public class ResiliencePolicyDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public RetryPolicyDto Retry { get; set; } = new();
        public CircuitBreakerDto CircuitBreaker { get; set; } = new();
        public TimeoutDto Timeout { get; set; } = new();
        public BulkheadDto Bulkhead { get; set; } = new();
        public RateLimitDto RateLimit { get; set; } = new();
        public FallbackDto Fallback { get; set; } = new();
    }

    /// <summary>
    /// 重试策略DTO - Retry Pattern
    /// </summary>
    public class RetryPolicyDto
    {
        public bool Enabled { get; set; } = true;
        public int MaxAttempts { get; set; } = 3;
        public string BackoffStrategy { get; set; } = "Exponential"; // Exponential, Linear, Fixed
        public int InitialDelayMs { get; set; } = 100;
        public int MaxDelayMs { get; set; } = 5000;
        public List<string> RetryableExceptions { get; set; } = new()
        {
            "HttpRequestException",
            "TimeoutException",
            "SocketException"
        };
        public List<int> RetryableStatusCodes { get; set; } = new() { 408, 429, 502, 503, 504 };
    }

    /// <summary>
    /// 断路器DTO - Circuit Breaker Pattern
    /// </summary>
    public class CircuitBreakerDto
    {
        public bool Enabled { get; set; } = true;
        public double FailureThreshold { get; set; } = 0.5; // 50% failure rate
        public int SamplingDurationMs { get; set; } = 10000; // 10 seconds
        public int MinimumThroughput { get; set; } = 10; // Minimum requests in sampling period
        public int BreakDurationMs { get; set; } = 30000; // 30 seconds
        public int HalfOpenMaxAttempts { get; set; } = 3; // Half-open state试探请求数
    }

    /// <summary>
    /// 超时控制DTO - Timeout Pattern
    /// </summary>
    public class TimeoutDto
    {
        public bool Enabled { get; set; } = true;
        public int TimeoutMs { get; set; } = 5000; // 5 seconds
        public bool ThrowOnTimeout { get; set; } = true;
    }

    /// <summary>
    /// 舱壁隔离DTO - Bulkhead Pattern
    /// </summary>
    public class BulkheadDto
    {
        public bool Enabled { get; set; } = false;
        public int MaxParallelization { get; set; } = 10; // 最大并发数
        public int MaxQueuingActions { get; set; } = 5; // 队列大小
        public string BulkheadType { get; set; } = "Semaphore"; // Semaphore, FixedThreadPool
    }

    /// <summary>
    /// 限流策略DTO - Rate Limit Pattern
    /// </summary>
    public class RateLimitDto
    {
        public bool Enabled { get; set; } = true;
        public int MaxRequests { get; set; } = 100; // 最大请求数
        public int WindowSizeMs { get; set; } = 1000; // 时间窗口（毫秒）
        public string Algorithm { get; set; } = "SlidingWindow"; // SlidingWindow, FixedWindow, TokenBucket
        public int QueueLimit { get; set; } = 10; // 排队限制
    }

    /// <summary>
    /// 回退策略DTO - Fallback Pattern
    /// </summary>
    public class FallbackDto
    {
        public bool Enabled { get; set; } = false;
        public string FallbackType { get; set; } = "Default"; // Default, Cache, AlternativeService
        public string FallbackValue { get; set; } = string.Empty; // 默认返回值（JSON）
        public string AlternativeServiceUrl { get; set; } = string.Empty; // 备用服务URL
        public bool EnableCache { get; set; } = false;
        public int CacheDurationMs { get; set; } = 60000; // 缓存时长
    }

    /// <summary>
    /// 生成的Polly策略代码结果
    /// </summary>
    public class GeneratedPollyCodeDto
    {
        public string CSharpCode { get; set; } = string.Empty;
        public List<string> RequiredNugetPackages { get; set; } = new()
        {
            "Polly",
            "Polly.Extensions.Http"
        };
        public string ConfigurationMethod { get; set; } = string.Empty; // AddHttpClient配置方法
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 生成的Istio策略结果
    /// </summary>
    public class GeneratedIstioPolicyDto
    {
        public string VirtualServiceYaml { get; set; } = string.Empty; // VirtualService YAML
        public string DestinationRuleYaml { get; set; } = string.Empty; // DestinationRule YAML
        public string FaultInjectionYaml { get; set; } = string.Empty; // 故障注入 YAML
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 弹性策略验证结果
    /// </summary>
    public class ResiliencePolicyValidationResultDto
    {
        public bool IsValid { get; set; }
        public List<string> Warnings { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public Dictionary<string, string> Suggestions { get; set; } = new();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Day 24: 混沌工程实验 DTOs - Phase 2 弹性工程
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 混沌实验配置DTO - Chaos Engineering Experiment
    /// </summary>
    public class ChaosExperimentDto
    {
        public string ExperimentName { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public FaultInjectionDto FaultInjection { get; set; } = new();
        public ExperimentScheduleDto Schedule { get; set; } = new();
        public ExperimentMetricsDto Metrics { get; set; } = new();
    }

    /// <summary>
    /// 故障注入配置DTO - Fault Injection Configuration
    /// </summary>
    public class FaultInjectionDto
    {
        public DelayFaultDto Delay { get; set; } = new();
        public AbortFaultDto Abort { get; set; } = new();
        public string TargetEndpoint { get; set; } = string.Empty; // 目标端点
        public double InjectionPercentage { get; set; } = 10.0; // 注入比例（0-100）
    }

    /// <summary>
    /// 延迟故障DTO - Delay Fault
    /// </summary>
    public class DelayFaultDto
    {
        public bool Enabled { get; set; } = true;
        public int FixedDelayMs { get; set; } = 5000; // 固定延迟（毫秒）
        public double Percentage { get; set; } = 100.0; // 延迟注入比例
    }

    /// <summary>
    /// 中止故障DTO - Abort Fault
    /// </summary>
    public class AbortFaultDto
    {
        public bool Enabled { get; set; } = false;
        public int HttpStatusCode { get; set; } = 500; // HTTP状态码
        public double Percentage { get; set; } = 100.0; // 中止注入比例
    }

    /// <summary>
    /// 实验调度配置DTO - Experiment Schedule
    /// </summary>
    public class ExperimentScheduleDto
    {
        public string ScheduleType { get; set; } = "Manual"; // Manual, Scheduled, Continuous
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int DurationMinutes { get; set; } = 10; // 实验持续时间
        public string CronExpression { get; set; } = string.Empty; // Cron表达式
    }

    /// <summary>
    /// 实验指标配置DTO - Experiment Metrics
    /// </summary>
    public class ExperimentMetricsDto
    {
        public List<string> MonitoredMetrics { get; set; } = new()
        {
            "ResponseTime",
            "ErrorRate",
            "Throughput"
        };
        public Dictionary<string, double> Thresholds { get; set; } = new()
        {
            { "MaxResponseTimeMs", 5000 },
            { "MaxErrorRate", 0.05 }
        };
        public bool EnableRollback { get; set; } = true; // 超过阈值时自动回滚
    }

    /// <summary>
    /// 混沌实验执行结果DTO - Chaos Experiment Result
    /// </summary>
    public class ChaosExperimentResultDto
    {
        public string ExperimentId { get; set; } = string.Empty;
        public string ExperimentName { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, Running, Completed, Failed, Aborted
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public Dictionary<string, double> ObservedMetrics { get; set; } = new();
        public List<string> Incidents { get; set; } = new(); // 事件列表
        public bool ThresholdExceeded { get; set; } = false;
        public string Report { get; set; } = string.Empty;
    }

    /// <summary>
    /// 生成的混沌实验配置DTO - Generated Chaos Configuration
    /// </summary>
    public class GeneratedChaosConfigDto
    {
        public string IstioFaultInjectionYaml { get; set; } = string.Empty; // Istio故障注入YAML
        public string KubernetesChaosYaml { get; set; } = string.Empty; // Kubernetes Chaos Mesh YAML
        public string PrometheusAlertsYaml { get; set; } = string.Empty; // Prometheus告警规则
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 混沌实验验证结果DTO - Chaos Experiment Validation
    /// </summary>
    public class ChaosExperimentValidationResultDto
    {
        public bool IsValid { get; set; }
        public List<string> Warnings { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public Dictionary<string, string> Suggestions { get; set; } = new();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Day 25: Git工作流集成 DTOs - Phase 3 开发者体验
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// Git仓库初始化配置DTO - Git Repository Initialization Configuration
    /// </summary>
    public class GitRepositoryInitDto
    {
        public string ProjectName { get; set; } = string.Empty;
        public string ProjectPath { get; set; } = string.Empty;
        public string DefaultBranch { get; set; } = "main";
        public bool InitializeWithReadme { get; set; } = true;
        public bool GenerateGitignore { get; set; } = true;
        public string GitignoreTemplate { get; set; } = "dotnet-vue"; // dotnet, vue, dotnet-vue
        public bool SetupGitHooks { get; set; } = true;
        public bool GeneratePullRequestTemplate { get; set; } = true;
    }

    /// <summary>
    /// Git分支管理DTO - Git Branch Management
    /// </summary>
    public class GitBranchDto
    {
        public string BranchName { get; set; } = string.Empty;
        public string BaseBranch { get; set; } = "main";
        public string BranchType { get; set; } = "feature"; // feature, bugfix, hotfix, release
        public string Description { get; set; } = string.Empty;
        public bool CheckoutAfterCreate { get; set; } = true;
    }

    /// <summary>
    /// Git提交配置DTO - Git Commit Configuration
    /// </summary>
    public class GitCommitDto
    {
        public string CommitMessage { get; set; } = string.Empty;
        public string CommitType { get; set; } = "feat"; // feat, fix, docs, style, refactor, test, chore
        public string Scope { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public List<string> FilesToCommit { get; set; } = new();
        public bool RunPreCommitHooks { get; set; } = true;
    }

    /// <summary>
    /// Git钩子配置DTO - Git Hook Configuration
    /// </summary>
    public class GitHookConfigDto
    {
        public string HookType { get; set; } = "pre-commit"; // pre-commit, pre-push, commit-msg
        public bool EnableCodeFormatCheck { get; set; } = true;
        public bool EnableLintCheck { get; set; } = true;
        public bool EnableTestExecution { get; set; } = false;
        public bool EnableCommitMsgValidation { get; set; } = true;
        public List<string> CustomScripts { get; set; } = new();
    }

    /// <summary>
    /// .gitignore配置DTO - .gitignore Configuration
    /// </summary>
    public class GitignoreConfigDto
    {
        public List<string> DotNetPatterns { get; set; } = new()
        {
            "bin/",
            "obj/",
            "*.user",
            "*.suo",
            ".vs/",
            "*.DotSettings.user"
        };
        public List<string> VuePatterns { get; set; } = new()
        {
            "node_modules/",
            "dist/",
            ".DS_Store",
            "*.local",
            ".vscode/"
        };
        public List<string> CommonPatterns { get; set; } = new()
        {
            "*.log",
            "*.tmp",
            ".env",
            ".generated/"
        };
        public List<string> CustomPatterns { get; set; } = new();
    }

    /// <summary>
    /// PR模板配置DTO - Pull Request Template Configuration
    /// </summary>
    public class PullRequestTemplateDto
    {
        public string TemplateName { get; set; } = "default";
        public List<string> Sections { get; set; } = new()
        {
            "## 变更说明",
            "## 变更类型",
            "## 测试情况",
            "## 检查清单"
        };
        public List<string> ChangeTypes { get; set; } = new()
        {
            "- [ ] 新功能",
            "- [ ] Bug修复",
            "- [ ] 重构",
            "- [ ] 文档更新"
        };
        public List<string> Checklist { get; set; } = new()
        {
            "- [ ] 代码已通过编译",
            "- [ ] 代码已通过Lint检查",
            "- [ ] 代码已添加单元测试",
            "- [ ] 文档已更新"
        };
    }

    /// <summary>
    /// Git工作流操作结果DTO - Git Workflow Operation Result
    /// </summary>
    public class GitWorkflowResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string RepositoryPath { get; set; } = string.Empty;
        public string CurrentBranch { get; set; } = string.Empty;
        public List<string> CreatedFiles { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public List<string> Errors { get; set; } = new();
    }

    /// <summary>
    /// 生成的Git配置文件DTO - Generated Git Configuration Files
    /// </summary>
    public class GeneratedGitConfigDto
    {
        public string GitignoreContent { get; set; } = string.Empty;
        public string PreCommitHookContent { get; set; } = string.Empty;
        public string PrePushHookContent { get; set; } = string.Empty;
        public string CommitMsgHookContent { get; set; } = string.Empty;
        public string PullRequestTemplate { get; set; } = string.Empty;
        public string ReadmeTemplate { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Day 27: CI/CD模板生成 DTOs - Phase 3 开发者体验
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// CI/CD平台配置DTO - CI/CD Platform Configuration
    /// </summary>
    public class CICDPlatformConfigDto
    {
        public string Platform { get; set; } = "github"; // github, gitlab, azuredevops, jenkins
        public string ProjectName { get; set; } = string.Empty;
        public string RepositoryUrl { get; set; } = string.Empty;
        public bool EnableDotnetBuild { get; set; } = true;
        public bool EnableVueBuild { get; set; } = true;
        public bool EnableTests { get; set; } = true;
        public bool EnableDockerBuild { get; set; } = true;
        public bool EnableDeployment { get; set; } = false;
        public string DotnetVersion { get; set; } = "8.0";
        public string NodeVersion { get; set; } = "20";
    }

    /// <summary>
    /// 构建阶段配置DTO - Build Stage Configuration
    /// </summary>
    public class BuildStageConfigDto
    {
        public string StageName { get; set; } = string.Empty;
        public int Order { get; set; }
        public List<string> Commands { get; set; } = new();
        public List<string> DependsOn { get; set; } = new();
        public Dictionary<string, string> Environment { get; set; } = new();
        public bool RunOnlyOnBranches { get; set; } = false;
        public List<string> Branches { get; set; } = new() { "main", "develop" };
    }

    /// <summary>
    /// GitHub Actions配置DTO - GitHub Actions Configuration
    /// </summary>
    public class GitHubActionsConfigDto
    {
        public string WorkflowName { get; set; } = "CI/CD Pipeline";
        public List<string> TriggerBranches { get; set; } = new() { "main", "develop" };
        public List<string> TriggerEvents { get; set; } = new() { "push", "pull_request" };
        public List<BuildStageConfigDto> Jobs { get; set; } = new();
        public Dictionary<string, string> Secrets { get; set; } = new();
    }

    /// <summary>
    /// GitLab CI配置DTO - GitLab CI Configuration
    /// </summary>
    public class GitLabCIConfigDto
    {
        public string Image { get; set; } = "mcr.microsoft.com/dotnet/sdk:8.0";
        public List<string> Stages { get; set; } = new() { "build", "test", "deploy" };
        public List<BuildStageConfigDto> Jobs { get; set; } = new();
        public Dictionary<string, string> Variables { get; set; } = new();
        public List<string> BeforeScript { get; set; } = new();
    }

    /// <summary>
    /// Azure DevOps配置DTO - Azure DevOps Configuration
    /// </summary>
    public class AzureDevOpsConfigDto
    {
        public string PipelineName { get; set; } = string.Empty;
        public List<string> TriggerBranches { get; set; } = new() { "main" };
        public string VmImage { get; set; } = "ubuntu-latest";
        public List<BuildStageConfigDto> Stages { get; set; } = new();
        public Dictionary<string, string> Variables { get; set; } = new();
    }

    /// <summary>
    /// Jenkinsfile配置DTO - Jenkinsfile Configuration
    /// </summary>
    public class JenkinsfileConfigDto
    {
        public string Agent { get; set; } = "any";
        public List<BuildStageConfigDto> Stages { get; set; } = new();
        public Dictionary<string, string> Environment { get; set; } = new();
        public List<string> Tools { get; set; } = new() { "dotnet", "nodejs" };
    }

    /// <summary>
    /// 生成的CI/CD配置DTO - Generated CI/CD Configuration
    /// </summary>
    public class GeneratedCICDConfigDto
    {
        public string Platform { get; set; } = string.Empty;
        public string YamlContent { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public List<string> Instructions { get; set; } = new();
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// CI/CD模板验证结果DTO - CI/CD Template Validation Result
    /// </summary>
    public class CICDTemplateValidationResultDto
    {
        public bool IsValid { get; set; }
        public List<string> Warnings { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public Dictionary<string, string> Suggestions { get; set; } = new();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Day 29: 本地开发环境自动化 DTOs - Phase 3 开发者体验
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// 开发环境配置DTO - Development Environment Configuration
    /// </summary>
    public class DevEnvironmentConfigDto
    {
        public string ProjectName { get; set; } = string.Empty;
        public string ProjectPath { get; set; } = string.Empty;
        public List<string> Services { get; set; } = new();
        public Dictionary<string, string> EnvironmentVariables { get; set; } = new();
        public bool EnableHotReload { get; set; } = true;
        public bool EnableDebugMode { get; set; } = true;
        public bool EnableHealthCheck { get; set; } = true;
    }

    /// <summary>
    /// Docker Compose服务配置DTO - Docker Compose Service Configuration
    /// </summary>
    public class DockerComposeServiceDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public List<string> Ports { get; set; } = new();
        public Dictionary<string, string> Environment { get; set; } = new();
        public List<string> Volumes { get; set; } = new();
        public List<string> DependsOn { get; set; } = new();
        public Dictionary<string, object> HealthCheck { get; set; } = new();
    }

    /// <summary>
    /// 生成的Docker Compose配置DTO - Generated Docker Compose Configuration
    /// </summary>
    public class GeneratedDockerComposeDto
    {
        public string YamlContent { get; set; } = string.Empty;
        public string FileName { get; set; } = "docker-compose.dev.yml";
        public List<DockerComposeServiceDto> Services { get; set; } = new();
        public List<string> Instructions { get; set; } = new();
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 启动脚本配置DTO - Startup Script Configuration
    /// </summary>
    public class StartupScriptConfigDto
    {
        public string ScriptType { get; set; } = "bash"; // bash, powershell, batch
        public List<string> PreStartCommands { get; set; } = new();
        public List<string> StartCommands { get; set; } = new();
        public List<string> PostStartCommands { get; set; } = new();
        public int HealthCheckTimeout { get; set; } = 60;
    }

    /// <summary>
    /// 生成的启动脚本DTO - Generated Startup Script
    /// </summary>
    public class GeneratedStartupScriptDto
    {
        public string ScriptContent { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string ScriptType { get; set; } = string.Empty;
        public List<string> Instructions { get; set; } = new();
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 环境变量配置DTO - Environment Variables Configuration
    /// </summary>
    public class EnvironmentVariablesDto
    {
        public Dictionary<string, string> Development { get; set; } = new();
        public Dictionary<string, string> Staging { get; set; } = new();
        public Dictionary<string, string> Production { get; set; } = new();
        public List<string> SecretKeys { get; set; } = new(); // 需要保密的key列表
    }

    /// <summary>
    /// 生成的环境变量文件DTO - Generated Environment Variables File
    /// </summary>
    public class GeneratedEnvFileDto
    {
        public string Content { get; set; } = string.Empty;
        public string FileName { get; set; } = ".env.development";
        public string Environment { get; set; } = "development";
        public List<string> Instructions { get; set; } = new();
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 服务健康检查配置DTO - Service Health Check Configuration
    /// </summary>
    public class ServiceHealthCheckDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public string HealthCheckUrl { get; set; } = string.Empty;
        public int TimeoutSeconds { get; set; } = 30;
        public int RetryCount { get; set; } = 3;
        public int IntervalSeconds { get; set; } = 5;
    }

    /// <summary>
    /// 开发环境验证结果DTO - Development Environment Validation Result
    /// </summary>
    public class DevEnvironmentValidationResultDto
    {
        public bool IsValid { get; set; }
        public List<string> Warnings { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public Dictionary<string, string> Suggestions { get; set; } = new();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Day 31: 调试测试工具 DTOs - Debug & Testing Tools
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// <summary>
    /// API测试请求DTO - API Test Request
    /// </summary>
    public class ApiTestRequestDto
    {
        public string Method { get; set; } = "GET"; // GET, POST, PUT, DELETE, PATCH
        public string Url { get; set; } = string.Empty;
        public Dictionary<string, string> Headers { get; set; } = new();
        public Dictionary<string, string> QueryParameters { get; set; } = new();
        public string? Body { get; set; }
        public string ContentType { get; set; } = "application/json";
        public int TimeoutSeconds { get; set; } = 30;
        public bool FollowRedirects { get; set; } = true;
        public bool ValidateSsl { get; set; } = true;
    }

    /// <summary>
    /// API测试响应DTO - API Test Response
    /// </summary>
    public class ApiTestResponseDto
    {
        public int StatusCode { get; set; }
        public string StatusText { get; set; } = string.Empty;
        public Dictionary<string, string> Headers { get; set; } = new();
        public string Body { get; set; } = string.Empty;
        public long ResponseTimeMs { get; set; }
        public long ContentLength { get; set; }
        public bool IsSuccess { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime TestedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 日志查询DTO - Log Query
    /// </summary>
    public class LogQueryDto
    {
        public string Level { get; set; } = "All"; // All, Trace, Debug, Information, Warning, Error, Critical
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? SearchText { get; set; }
        public string? Source { get; set; }
        public int PageSize { get; set; } = 100;
        public int PageNumber { get; set; } = 1;
    }

    /// <summary>
    /// 日志条目DTO - Log Entry
    /// </summary>
    public class LogEntryDto
    {
        public DateTime Timestamp { get; set; }
        public string Level { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Exception { get; set; }
        public string? Source { get; set; }
        public Dictionary<string, string> Properties { get; set; } = new();
        public string TraceId { get; set; } = string.Empty;
    }

    /// <summary>
    /// 日志查询结果DTO - Log Query Result
    /// </summary>
    public class LogQueryResultDto
    {
        public List<LogEntryDto> Logs { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageSize { get; set; }
        public int PageNumber { get; set; }
        public int TotalPages { get; set; }
    }

    /// <summary>
    /// 性能指标DTO - Performance Metrics
    /// </summary>
    public class PerformanceMetricsDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public double CpuUsagePercent { get; set; }
        public long MemoryUsageMb { get; set; }
        public long TotalMemoryMb { get; set; }
        public int ActiveConnections { get; set; }
        public long RequestsPerSecond { get; set; }
        public double AverageResponseTimeMs { get; set; }
        public double P95ResponseTimeMs { get; set; }
        public double P99ResponseTimeMs { get; set; }
        public long ErrorCount { get; set; }
        public double ErrorRate { get; set; }
        public DateTime CollectedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 健康检查结果DTO - Health Check Result
    /// </summary>
    public class HealthCheckResultDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty; // Healthy, Degraded, Unhealthy
        public string? Description { get; set; }
        public Dictionary<string, HealthCheckItemDto> Checks { get; set; } = new();
        public long TotalDurationMs { get; set; }
        public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// 健康检查项DTO - Health Check Item
    /// </summary>
    public class HealthCheckItemDto
    {
        public string Status { get; set; } = string.Empty; // Healthy, Degraded, Unhealthy
        public string? Description { get; set; }
        public Dictionary<string, string> Data { get; set; } = new();
        public long DurationMs { get; set; }
        public string? Exception { get; set; }
    }

    /// <summary>
    /// 性能测试配置DTO - Performance Test Configuration
    /// </summary>
    public class PerformanceTestConfigDto
    {
        public string TestName { get; set; } = string.Empty;
        public string TargetUrl { get; set; } = string.Empty;
        public int ConcurrentUsers { get; set; } = 10;
        public int DurationSeconds { get; set; } = 60;
        public int RampUpSeconds { get; set; } = 10;
        public string HttpMethod { get; set; } = "GET";
        public string? RequestBody { get; set; }
        public Dictionary<string, string> Headers { get; set; } = new();
    }

    /// <summary>
    /// 性能测试结果DTO - Performance Test Result
    /// </summary>
    public class PerformanceTestResultDto
    {
        public string TestName { get; set; } = string.Empty;
        public int TotalRequests { get; set; }
        public int SuccessfulRequests { get; set; }
        public int FailedRequests { get; set; }
        public double SuccessRate { get; set; }
        public double AverageResponseTimeMs { get; set; }
        public double MinResponseTimeMs { get; set; }
        public double MaxResponseTimeMs { get; set; }
        public double MedianResponseTimeMs { get; set; }
        public double P95ResponseTimeMs { get; set; }
        public double P99ResponseTimeMs { get; set; }
        public double RequestsPerSecond { get; set; }
        public long TotalDataTransferredBytes { get; set; }
        public DateTime TestStartTime { get; set; }
        public DateTime TestEndTime { get; set; }
        public int TestDurationSeconds { get; set; }
    }
}
