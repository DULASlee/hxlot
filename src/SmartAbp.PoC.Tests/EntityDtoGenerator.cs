using System;
using System.Collections.Generic;
using HandlebarsDotNet;

namespace SmartAbp.PoC.Tests;

public class EntityDtoGenerator
{
    private readonly HandlebarsTemplate<object, object> _template;

    public EntityDtoGenerator()
    {
        var templateSource = @"using System;
using Volo.Abp.Application.Dtos;

namespace {{Namespace}}
{
    /// <summary>
    /// {{EntityName}} DTO
    /// </summary>
    public class {{EntityName}}Dto : EntityDto<{{PrimaryKeyType}}>
    {
{{#each Properties}}
        public {{Type}} {{Name}} { get; set; }{{#if DefaultValue}} = {{DefaultValue}};{{/if}}
{{/each}}
    }
}";
        
        _template = HandlebarsDotNet.Handlebars.Compile(templateSource);
    }

    public string Generate(EntityMetadata metadata)
    {
        return _template(new
        {
            metadata.Namespace,
            metadata.EntityName,
            metadata.PrimaryKeyType,
            metadata.Properties
        });
    }
}

public class EntityMetadata
{
    public string Namespace { get; set; } = "";
    public string EntityName { get; set; } = "";
    public string PrimaryKeyType { get; set; } = "Guid";
    public List<PropertyMetadata> Properties { get; set; } = new();
}

public class PropertyMetadata
{
    public string Type { get; set; } = "";
    public string Name { get; set; } = "";
    public string? DefaultValue { get; set; }
}
