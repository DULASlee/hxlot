using System;
using System.Linq;
using System.Threading.Tasks;
using HandlebarsDotNet;
using SmartAbp.DevKit.Core.Metadata;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// EntityDto生成器
/// Phase 2第一个迁移的生成器
/// </summary>
public class EntityDtoGenerator : CodeGeneratorFramework<Guid, string>
{
    private readonly UnifiedMetadataSDK _metadataSDK;
    private readonly HandlebarsTemplate<object, object> _template;

    public EntityDtoGenerator(UnifiedMetadataSDK metadataSDK)
    {
        _metadataSDK = metadataSDK;
        _template = InitializeTemplate();
    }

    private HandlebarsTemplate<object, object> InitializeTemplate()
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
        return Handlebars.Compile(templateSource);
    }

    public override Task<string> GenerateAsync(Guid entityId)
    {
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

        var code = _template(data);
        
        return Task.FromResult(code);
    }

    public override Task<ValidationResult> ValidateInputAsync(Guid entityId)
    {
        if (_metadataSDK.GetEntity(entityId) == null)
        {
            return Task.FromResult(ValidationResult.Fail($"Entity with ID {entityId} not found."));
        }
        return Task.FromResult(ValidationResult.Success());
    }
}

