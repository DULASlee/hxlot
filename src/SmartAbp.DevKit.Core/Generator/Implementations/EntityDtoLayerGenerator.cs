using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Templates;

namespace SmartAbp.DevKit.Core.Generator.Implementations;

/// <summary>
/// Entity DTO代码生成器（重构版）
///
/// 职责：
/// - 生成EntityDto（查询DTO）
/// - 生成CreateEntityDto（创建DTO）
/// - 生成UpdateEntityDto（更新DTO）
/// </summary>
public class EntityDtoLayerGenerator : LayerGeneratorBase
{
    private readonly TemplateManager _templateManager;

    public EntityDtoLayerGenerator(
        UnifiedMetadataSDK metadataSDK,
        TemplateManager templateManager,
        ILogger<EntityDtoLayerGenerator> logger)
        : base(metadataSDK, logger)
    {
        _templateManager = templateManager ?? throw new ArgumentNullException(nameof(templateManager));
        _templateManager.RegisterHelpers();
    }

    public override string Name => "EntityDtoGenerator";

    public override TargetLayer Layer => TargetLayer.Application;

    public override int Priority => 190; // 在AppService之前生成

    protected override async Task GenerateCoreAsync(
        GenerationInput input,
        EntityMetadata entityMetadata,
        LayerGenerationResult result)
    {
        try
        {
            var namespacePrefix = input.Options.NamespacePrefix ?? "SmartAbp";
            var entityName = entityMetadata.Name;
            var baseOutputPath = $"{input.Options.OutputBasePath}/SmartAbp.Application.Contracts/{entityName}";

            // 1. 生成EntityDto
            var dtoCode = GenerateEntityDto(entityMetadata, namespacePrefix);
            result.GeneratedFiles[$"{baseOutputPath}/{entityName}Dto.cs"] = dtoCode;

            // 2. 生成CreateDto
            var createDtoCode = GenerateCreateDto(entityMetadata, namespacePrefix);
            result.GeneratedFiles[$"{baseOutputPath}/Create{entityName}Dto.cs"] = createDtoCode;

            // 3. 生成UpdateDto
            var updateDtoCode = GenerateUpdateDto(entityMetadata, namespacePrefix);
            result.GeneratedFiles[$"{baseOutputPath}/Update{entityName}Dto.cs"] = updateDtoCode;

            Logger.LogInformation("  ✅ 生成DTO: EntityDto + CreateDto + UpdateDto");

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            result.Errors.Add($"DTO生成失败: {ex.Message}");
            Logger.LogError(ex, "DTO生成异常");
        }
    }

    private string GenerateEntityDto(EntityMetadata entity, string namespacePrefix)
    {
        var properties = string.Join("\n    ", entity.Properties.Select(p =>
            $"public {p.Type} {p.Name} {{ get; set; }}"));

        return $@"using System;
using Volo.Abp.Application.Dtos;

namespace {namespacePrefix}.Application.Contracts.{entity.Name};

/// <summary>
/// {entity.DisplayName}数据传输对象
/// </summary>
public class {entity.Name}Dto : EntityDto<Guid>
{{
    {properties}
}}
";
    }

    private string GenerateCreateDto(EntityMetadata entity, string namespacePrefix)
    {
        var properties = string.Join("\n    ", entity.Properties
            .Where(p => !p.Name.Equals("Id", StringComparison.OrdinalIgnoreCase))
            .Select(p =>
            {
                var requiredAttr = p.IsRequired ? "[Required]\n    " : "";
                return $"{requiredAttr}public {p.Type}{(p.IsNullable ? "?" : "")} {p.Name} {{ get; set; }}";
            }));

        return $@"using System;
using System.ComponentModel.DataAnnotations;

namespace {namespacePrefix}.Application.Contracts.{entity.Name};

/// <summary>
/// 创建{entity.DisplayName}输入DTO
/// </summary>
public class Create{entity.Name}Dto
{{
    {properties}
}}
";
    }

    private string GenerateUpdateDto(EntityMetadata entity, string namespacePrefix)
    {
        var properties = string.Join("\n    ", entity.Properties
            .Where(p => !p.Name.Equals("Id", StringComparison.OrdinalIgnoreCase))
            .Select(p =>
            {
                var requiredAttr = p.IsRequired ? "[Required]\n    " : "";
                return $"{requiredAttr}public {p.Type}{(p.IsNullable ? "?" : "")} {p.Name} {{ get; set; }}";
            }));

        return $@"using System;
using System.ComponentModel.DataAnnotations;

namespace {namespacePrefix}.Application.Contracts.{entity.Name};

/// <summary>
/// 更新{entity.DisplayName}输入DTO
/// </summary>
public class Update{entity.Name}Dto
{{
    {properties}
}}
";
    }
}

