using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Templates;
using SmartAbp.DevKit.Core.Helpers;

namespace SmartAbp.DevKit.Core.Generator.Implementations;

/// <summary>
/// Controller层代码生成器（重构版 - 符合架构原则）
///
/// 职责：
/// - 生成ASP.NET Core Web API Controller
/// - 提供RESTful API端点
/// - 集成ABP框架特性
/// </summary>
public class ControllerLayerGenerator : LayerGeneratorBase
{
    private readonly TemplateManager _templateManager;

    public ControllerLayerGenerator(
        UnifiedMetadataSDK metadataSDK,
        TemplateManager templateManager,
        ILogger<ControllerLayerGenerator> logger)
        : base(metadataSDK, logger)
    {
        _templateManager = templateManager ?? throw new ArgumentNullException(nameof(templateManager));
        _templateManager.RegisterHelpers();
    }

    public override string Name => "ControllerGenerator";

    public override TargetLayer Layer => TargetLayer.Application;

    public override int Priority => 210; // 在AppService之后

    protected override async Task GenerateCoreAsync(
        GenerationInput input,
        EntityMetadata entityMetadata,
        LayerGenerationResult result)
    {
        try
        {
            // 1. 准备模板数据
            var templateData = PrepareTemplateData(entityMetadata, input.Options);

            // 2. 生成Controller代码
            var controllerCode = await GenerateControllerCodeAsync(templateData);
            var controllerPath = $"{input.Options.OutputBasePath}/SmartAbp.HttpApi/Controllers/{entityMetadata.Name}Controller.cs";
            result.GeneratedFiles[controllerPath] = controllerCode;

            Logger.LogInformation("  ✅ 生成Controller: {ControllerName}", $"{entityMetadata.Name}Controller");
        }
        catch (Exception ex)
        {
            result.Errors.Add($"Controller生成失败: {ex.Message}");
            Logger.LogError(ex, "Controller生成异常");
        }
    }

    private object PrepareTemplateData(EntityMetadata entity, GenerationOptions options)
    {
        var entityName = entity.Name;
        var entityNamePlural = StringHelper.Pluralize(entityName);
        var namespacePrefix = options.NamespacePrefix ?? "SmartAbp";

        return new
        {
            // ⭐ 添加NamespacePrefix支持模板引擎
            NamespacePrefix = namespacePrefix,

            EntityName = entityName,
            EntityNamePlural = entityNamePlural,
            ControllerName = $"{entityName}Controller",
            RoutePrefix = $"api/app/{entityNamePlural.ToLowerInvariant()}",
            Namespace = $"{namespacePrefix}.HttpApi.Controllers",
            ContractsNamespace = $"{namespacePrefix}.Application.Contracts.{entityName}",
            Description = entity.DisplayName ?? entityName,
            PrimaryKeyType = "Guid"
        };
    }

    private async Task<string> GenerateControllerCodeAsync(dynamic data)
    {
        // TODO: 使用模板引擎生成（待模板系统完善后）
        // 当前使用StringBuilder内联生成

        // 内联模板（使用StringBuilder避免复杂的字符串转义）
        var sb = new System.Text.StringBuilder();
        sb.AppendLine("using System;");
        sb.AppendLine("using Microsoft.AspNetCore.Mvc;");
        sb.AppendLine("using Volo.Abp;");
        sb.AppendLine("using Volo.Abp.AspNetCore.Mvc;");
        sb.AppendLine($"using {data.ContractsNamespace};");
        sb.AppendLine();
        sb.AppendLine($"namespace {data.Namespace};");
        sb.AppendLine();
        sb.AppendLine("/// <summary>");
        sb.AppendLine($"/// {data.Description} API控制器");
        sb.AppendLine("/// </summary>");
        sb.AppendLine("[Area(\"app\")]");
        sb.AppendLine("[RemoteService(Name = \"Default\")]");
        sb.AppendLine($"[Route(\"{data.RoutePrefix}\")]");
        sb.AppendLine($"public class {data.ControllerName} : AbpController");
        sb.AppendLine("{");
        sb.AppendLine($"    private readonly I{data.EntityName}AppService _appService;");
        sb.AppendLine();
        sb.AppendLine($"    public {data.ControllerName}(I{data.EntityName}AppService appService)");
        sb.AppendLine("    {");
        sb.AppendLine("        _appService = appService;");
        sb.AppendLine("    }");
        sb.AppendLine();
        sb.AppendLine("    [HttpGet]");
        sb.AppendLine("    [HttpGet(\"{id}\")]");
        sb.AppendLine($"    public virtual Task<{data.EntityName}Dto> GetAsync({data.PrimaryKeyType} id)");
        sb.AppendLine("    {");
        sb.AppendLine("        return _appService.GetAsync(id);");
        sb.AppendLine("    }");
        sb.AppendLine();
        sb.AppendLine("    [HttpGet]");
        sb.AppendLine($"    public virtual Task<PagedResultDto<{data.EntityName}Dto>> GetListAsync(PagedAndSortedResultRequestDto input)");
        sb.AppendLine("    {");
        sb.AppendLine("        return _appService.GetListAsync(input);");
        sb.AppendLine("    }");
        sb.AppendLine();
        sb.AppendLine("    [HttpPost]");
        sb.AppendLine($"    public virtual Task<{data.EntityName}Dto> CreateAsync(Create{data.EntityName}Dto input)");
        sb.AppendLine("    {");
        sb.AppendLine("        return _appService.CreateAsync(input);");
        sb.AppendLine("    }");
        sb.AppendLine();
        sb.AppendLine("    [HttpPut(\"{id}\")]");
        sb.AppendLine($"    public virtual Task<{data.EntityName}Dto> UpdateAsync({data.PrimaryKeyType} id, Update{data.EntityName}Dto input)");
        sb.AppendLine("    {");
        sb.AppendLine("        return _appService.UpdateAsync(id, input);");
        sb.AppendLine("    }");
        sb.AppendLine();
        sb.AppendLine("    [HttpDelete(\"{id}\")]");
        sb.AppendLine($"    public virtual Task DeleteAsync({data.PrimaryKeyType} id)");
        sb.AppendLine("    {");
        sb.AppendLine("        return _appService.DeleteAsync(id);");
        sb.AppendLine("    }");
        sb.AppendLine("}");

        return await Task.FromResult(sb.ToString());
    }
}

