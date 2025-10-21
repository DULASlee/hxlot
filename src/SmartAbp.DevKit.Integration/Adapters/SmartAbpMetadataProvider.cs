using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.Domain.Entities.LowCode;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Microsoft.Extensions.Logging;

namespace SmartAbp.DevKit.Integration.Adapters;

/// <summary>
/// SmartAbp元数据提供者，适配SmartAbp业务实体到DevKit抽象层
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
                IsNullable = p.IsNullable
            }).ToList()
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
            OutputPath = "src/" // SmartAbp特定配置
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
                    IsNullable = p.IsNullable
                }).ToList()
            });
        }

        _logger.LogDebug("获取模块实体完成: ModuleId={ModuleId}, 实体数={EntityCount}",
            moduleId, result.Count);

        return result;
    }

    /// <summary>
    /// 映射SmartAbp数据类型到DevKit标准类型
    /// </summary>
    private string MapPropertyType(string smartAbpDataType)
    {
        return smartAbpDataType?.ToLowerInvariant() switch
        {
            "string" => "string",
            "int" => "int",
            "long" => "long",
            "decimal" => "decimal",
            "double" => "double",
            "float" => "float",
            "bool" => "bool",
            "boolean" => "bool",
            "datetime" => "DateTime",
            "date" => "DateTime",
            "guid" => "Guid",
            "uuid" => "Guid",
            _ => smartAbpDataType ?? "string"
        };
    }
}
