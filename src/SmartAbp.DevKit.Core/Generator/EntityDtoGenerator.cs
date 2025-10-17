using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.Domain.Entities.LowCode;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// EntityDto生成器
/// Phase 2第一个迁移的生成器
/// </summary>
public class EntityDtoGenerator : CodeGeneratorFramework
{
    private readonly UnifiedMetadataSDK _metadataSDK;

    public EntityDtoGenerator(UnifiedMetadataSDK metadataSDK, ILogger<EntityDtoGenerator> logger) 
        : base(logger)
    {
        _metadataSDK = metadataSDK;
        InitializeTemplate();
    }

    private void InitializeTemplate()
    {
        var templateSource = @"using System;
using Volo.Abp.Application.Dtos;

namespace {{Namespace}}
{
    public class {{EntityName}}Dto : EntityDto<{{PrimaryKeyType}}>
    {
{{#each Properties}}
        public {{Type}} {{Name}} { get; set; }
{{/each}}
    }
}";
        CompileTemplate(templateSource);
    }

    public override async Task<string> GenerateAsync(object metadata)
    {
        if (metadata is not Guid entityId)
            throw new ArgumentException("metadata must be Guid (entityId)");

        var entity = _metadataSDK.GetEntity(entityId);
        if (entity == null)
            throw new InvalidOperationException($"Entity {entityId} not found");

        var properties = _metadataSDK.GetProperties(entityId);
        var primaryKeyType = _metadataSDK.GetPrimaryKeyType(entityId);

        var data = new
        {
            Namespace = "SmartAbp.Application.Dtos",
            EntityName = entity.Name,
            PrimaryKeyType = primaryKeyType,
            Properties = properties.Select(p => new
            {
                Type = p.Type,
                Name = p.Name
            }).ToList()
        };

        var code = Template!(data);
        
        if (!Validate(code))
            throw new InvalidOperationException("Generated code validation failed");

        Logger.LogInformation("EntityDto generated for {EntityName}", entity.Name);
        
        return await Task.FromResult(code);
    }
}

