using System.Text.Json;
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.Domain.Entities.LowCode;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Microsoft.Extensions.Logging;

namespace SmartAbp.DevKit.Integration.Adapters;

/// <summary>
/// SmartAbp元数据提供者，适配SmartAbp业务实体到DevKit抽象层
///
/// 功能增强版本：
/// - 完整映射SmartAbp实体属性到DevKit元数据
/// - 支持ExtensionData扩展数据存储
/// - 增强的数据类型映射支持
/// - 完整的JSON配置序列化
/// - 企业级错误处理和日志记录
/// </summary>
public class SmartAbpMetadataProvider : IMetadataProvider, ITransientDependency
{
    private readonly IRepository<LowCodeEntity, Guid> _entityRepository;
    private readonly IRepository<LowCodeModule, Guid> _moduleRepository;
    private readonly IRepository<LowCodeProperty, Guid> _propertyRepository;
    private readonly ILogger<SmartAbpMetadataProvider> _logger;

    public SmartAbpMetadataProvider(
        IRepository<LowCodeEntity, Guid> entityRepository,
        IRepository<LowCodeModule, Guid> moduleRepository,
        IRepository<LowCodeProperty, Guid> propertyRepository,
        ILogger<SmartAbpMetadataProvider> logger)
    {
        _entityRepository = entityRepository;
        _moduleRepository = moduleRepository;
        _propertyRepository = propertyRepository;
        _logger = logger;
    }

    public async Task<EntityMetadata> GetEntityMetadataAsync(Guid entityId)
    {
        _logger.LogDebug("获取实体元数据: EntityId={EntityId}", entityId);

        var entity = await _entityRepository.GetAsync(entityId);
        var properties = await _propertyRepository.GetListAsync(p => p.EntityId == entityId);

        var entityMetadata = new EntityMetadata
        {
            Id = entity.Id,
            Name = entity.Name,
            DisplayName = entity.DisplayName ?? entity.Name,
            Properties = properties.Select(p => new PropertyMetadata
            {
                Name = p.Name,
                Type = MapPropertyType(p.Type),
                IsRequired = p.IsRequired,
                IsNullable = p.IsNullable,
                // 增强：添加ExtensionData支持，保存SmartAbp完整属性信息
                ExtensionData = CreatePropertyExtensionData(p)
            }).ToList(),
            // 增强：添加ExtensionData支持，保存SmartAbp完整实体信息
            ExtensionData = CreateEntityExtensionData(entity)
        };

        _logger.LogDebug("实体元数据获取成功: {EntityName}, 属性数={PropertyCount}",
            entityMetadata.Name, entityMetadata.Properties.Count);

        return entityMetadata;
    }

    public async Task<ModuleMetadata> GetModuleMetadataAsync(Guid moduleId)
    {
        _logger.LogDebug("获取模块元数据: ModuleId={ModuleId}", moduleId);

        var module = await _moduleRepository.GetAsync(moduleId);

        var moduleMetadata = new ModuleMetadata
        {
            Id = module.Id,
            Name = module.ModuleName,
            Namespace = "SmartAbp", // SmartAbp特定配置
            OutputPath = "src/", // SmartAbp特定配置
            // 增强：添加ExtensionData支持，保存SmartAbp完整模块信息
            ExtensionData = CreateModuleExtensionData(module)
        };

        _logger.LogDebug("模块元数据获取成功: {ModuleName}", moduleMetadata.Name);

        return moduleMetadata;
    }

    public async Task<List<EntityMetadata>> GetAllEntitiesAsync(Guid moduleId)
    {
        _logger.LogDebug("获取模块下所有实体: ModuleId={ModuleId}", moduleId);

        var entities = await _entityRepository.GetListAsync(e => e.ModuleId == moduleId);
        var result = new List<EntityMetadata>();

        foreach (var entity in entities)
        {
            var properties = await _propertyRepository.GetListAsync(p => p.EntityId == entity.Id);

            result.Add(new EntityMetadata
            {
                Id = entity.Id,
                Name = entity.Name,
                DisplayName = entity.DisplayName ?? entity.Name,
                Properties = properties.Select(p => new PropertyMetadata
                {
                    Name = p.Name,
                    Type = MapPropertyType(p.Type),
                    IsRequired = p.IsRequired,
                    IsNullable = p.IsNullable,
                    // 增强：添加ExtensionData支持，保存SmartAbp完整属性信息
                    ExtensionData = CreatePropertyExtensionData(p)
                }).ToList(),
                // 增强：添加ExtensionData支持，保存SmartAbp完整实体信息
                ExtensionData = CreateEntityExtensionData(entity)
            });
        }

        _logger.LogDebug("获取模块实体完成: ModuleId={ModuleId}, 实体数={EntityCount}",
            moduleId, result.Count);

        return result;
    }

    /// <summary>
    /// 映射SmartAbp数据类型到DevKit标准类型（增强版）
    /// 支持更多数据类型和边界情况处理
    /// </summary>
    private string MapPropertyType(string smartAbpDataType)
    {
        var mappedType = smartAbpDataType?.ToLowerInvariant() switch
        {
            // 基础类型
            "string" => "string",
            "int" => "int",
            "int32" => "int",
            "long" => "long",
            "int64" => "long",
            "decimal" => "decimal",
            "double" => "double",
            "float" => "float",
            "bool" => "bool",
            "boolean" => "bool",

            // 日期时间类型（增强）
            "datetime" => "DateTime",
            "datetimeoffset" => "DateTimeOffset",
            "date" => "DateTime",
            "time" => "TimeSpan",

            // 唯一标识符
            "guid" => "Guid",
            "uuid" => "Guid",

            // 字节数组（增强）
            "byte[]" => "byte[]",
            "bytearray" => "byte[]",

            // 枚举和引用类型（增强）
            "enum" => "enum",
            "object" => "object",
            "json" => "object",

            // 默认处理
            _ => smartAbpDataType ?? "string"
        };

        _logger.LogTrace("类型映射: {SmartAbpType} → {DevKitType}", smartAbpDataType, mappedType);
        return mappedType;
    }

    #region ExtensionData辅助方法（增强功能）

    /// <summary>
    /// 创建实体扩展数据，保存SmartAbp完整实体信息
    /// </summary>
    private Dictionary<string, object> CreateEntityExtensionData(LowCodeEntity entity)
    {
        return new Dictionary<string, object>
        {
            ["SmartAbp.Description"] = entity.Description ?? string.Empty,
            ["SmartAbp.TableName"] = entity.TableName ?? string.Empty,
            ["SmartAbp.PluralName"] = entity.PluralName ?? string.Empty,
            ["SmartAbp.Schema"] = entity.Schema ?? "dbo",
            ["SmartAbp.ModuleId"] = entity.ModuleId,
            ["SmartAbp.IsActive"] = entity.IsActive,
            ["SmartAbp.DisplayOrder"] = entity.DisplayOrder,
            ["SmartAbp.GroupName"] = entity.GroupName ?? string.Empty,
            ["SmartAbp.TenantId"] = entity.TenantId,
            ["SmartAbp.CreationTime"] = entity.CreationTime,
            ["SmartAbp.LastModificationTime"] = entity.LastModificationTime,
            ["SmartAbp.CreatorId"] = entity.CreatorId,
            ["SmartAbp.LastModifierId"] = entity.LastModifierId,
            // JSON配置（如果存在的话）
            ["SmartAbp.EntityConfigJson"] = SerializeToJson(entity.EntityConfig),
            ["SmartAbp.UIConfigJson"] = SerializeToJson(entity.UIConfig)
        };
    }

    /// <summary>
    /// 创建属性扩展数据，保存SmartAbp完整属性信息
    /// </summary>
    private Dictionary<string, object> CreatePropertyExtensionData(LowCodeProperty property)
    {
        return new Dictionary<string, object>
        {
            ["SmartAbp.Description"] = property.Description ?? string.Empty,
            ["SmartAbp.DefaultValue"] = property.DefaultValue ?? string.Empty,
            ["SmartAbp.ColumnName"] = property.ColumnName ?? property.Name,
            ["SmartAbp.ColumnType"] = property.ColumnType ?? string.Empty,
            ["SmartAbp.IsKey"] = property.IsKey,
            ["SmartAbp.IsUnique"] = property.IsUnique,
            ["SmartAbp.IsForeignKey"] = property.IsForeignKey,
            ["SmartAbp.MaxLength"] = property.MaxLength,
            ["SmartAbp.MinLength"] = property.MinLength,
            ["SmartAbp.MinValue"] = property.MinValue,
            ["SmartAbp.MaxValue"] = property.MaxValue,
            ["SmartAbp.DisplayOrder"] = property.DisplayOrder,
            ["SmartAbp.CreationTime"] = property.CreationTime,
            ["SmartAbp.LastModificationTime"] = property.LastModificationTime,
            ["SmartAbp.CreatorId"] = property.CreatorId,
            ["SmartAbp.LastModifierId"] = property.LastModifierId,
            // JSON配置（如果存在的话）
            ["SmartAbp.UIConfigJson"] = SerializeToJson(property.UIConfig),
            ["SmartAbp.ValidationRulesJson"] = SerializeToJson(property.ValidationRules)
        };
    }

    /// <summary>
    /// 创建模块扩展数据，保存SmartAbp完整模块信息
    /// </summary>
    private Dictionary<string, object> CreateModuleExtensionData(LowCodeModule module)
    {
        return new Dictionary<string, object>
        {
            ["SmartAbp.Description"] = module.Description ?? string.Empty,
            ["SmartAbp.Version"] = module.Version ?? "1.0.0",
            ["SmartAbp.Namespace"] = module.Namespace ?? "SmartAbp",
            ["SmartAbp.IsActive"] = module.IsActive,
            ["SmartAbp.TenantId"] = module.TenantId,
            ["SmartAbp.CreationTime"] = module.CreationTime,
            ["SmartAbp.LastModificationTime"] = module.LastModificationTime,
            ["SmartAbp.CreatorId"] = module.CreatorId,
            ["SmartAbp.LastModifierId"] = module.LastModifierId
        };
    }

    /// <summary>
    /// 安全序列化对象为JSON字符串
    /// </summary>
    private string? SerializeToJson(object? obj)
    {
        if (obj == null) return null;

        try
        {
            return JsonSerializer.Serialize(obj, new JsonSerializerOptions
            {
                WriteIndented = false,
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            });
        }
        catch (Exception ex)
        {
            _logger.LogWarning("JSON序列化失败: {Error}", ex.Message);
            return obj.ToString();
        }
    }

    #endregion
}
