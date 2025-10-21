using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Templates;
using SmartAbp.DevKit.Core.Helpers;

namespace SmartAbp.DevKit.Core.Generator.Implementations;

/// <summary>
/// AppService层代码生成器（重构版 - 符合架构原则）
///
/// 职责：
/// - 生成IXxxAppService接口
/// - 生成XxxAppService实现类
/// - 生成完整的CRUD应用服务代码
/// </summary>
public class AppServiceLayerGenerator : LayerGeneratorBase
{
    private readonly TemplateManager _templateManager;

    public AppServiceLayerGenerator(
        UnifiedMetadataSDK metadataSDK,
        TemplateManager templateManager,
        ILogger<AppServiceLayerGenerator> logger)
        : base(metadataSDK, logger)
    {
        _templateManager = templateManager ?? throw new ArgumentNullException(nameof(templateManager));

        // 注册自定义Helpers
        _templateManager.RegisterHelpers();
    }

    public override string Name => "AppServiceGenerator";

    public override TargetLayer Layer => TargetLayer.Application;

    public override int Priority => 200; // Application层优先级200

    protected override async Task GenerateCoreAsync(
        GenerationInput input,
        EntityMetadata entityMetadata,
        LayerGenerationResult result)
    {
        try
        {
            // 1. 准备模板数据
            var templateData = PrepareTemplateData(entityMetadata, input.Options);

            // 2. 生成接口文件
            var interfaceCode = await GenerateInterfaceAsync(templateData);
            var interfacePath = $"{input.Options.OutputBasePath}/SmartAbp.Application.Contracts/{entityMetadata.Name}/I{entityMetadata.Name}AppService.cs";
            result.GeneratedFiles[interfacePath] = interfaceCode;

            // 3. 生成实现类文件
            var implementationCode = await GenerateImplementationAsync(templateData);
            var implementationPath = $"{input.Options.OutputBasePath}/SmartAbp.Application/{entityMetadata.Name}/{entityMetadata.Name}AppService.cs";
            result.GeneratedFiles[implementationPath] = implementationCode;

            Logger.LogInformation("  ✅ 生成AppService: 接口 + 实现类");
        }
        catch (Exception ex)
        {
            result.Errors.Add($"AppService生成失败: {ex.Message}");
            Logger.LogError(ex, "AppService生成异常");
        }
    }

    /// <summary>
    /// 准备模板数据
    /// </summary>
    private object PrepareTemplateData(EntityMetadata entity, GenerationOptions options)
    {
        var entityName = entity.Name;
        var entityNamePlural = StringHelper.Pluralize(entityName);
        var entityNameCamel = StringHelper.ToCamelCase(entityName);
        var namespacePrefix = options.NamespacePrefix ?? "SmartAbp";

        return new
        {
            // ⭐ 添加NamespacePrefix支持模板引擎
            NamespacePrefix = namespacePrefix,

            EntityName = entityName,
            EntityNamePlural = entityNamePlural,
            EntityNameCamel = entityNameCamel,
            PrimaryKeyType = "Guid", // 从ExtensionData获取
            Namespace = $"{namespacePrefix}.Application.{entityName}",
            ContractsNamespace = $"{namespacePrefix}.Application.Contracts.{entityName}",
            DomainNamespace = $"{namespacePrefix}.Domain.Entities.{entityName}",
            Description = entity.DisplayName ?? $"{entityName}应用服务",
            Properties = entity.Properties,

            // DTO命名
            DtoName = $"{entityName}Dto",
            CreateDtoName = $"Create{entityName}Dto",
            UpdateDtoName = $"Update{entityName}Dto",
            GetListInputName = $"Get{entityNamePlural}Input",

            // CRUD方法名
            GetMethodName = "GetAsync",
            GetListMethodName = "GetListAsync",
            CreateMethodName = "CreateAsync",
            UpdateMethodName = "UpdateAsync",
            DeleteMethodName = "DeleteAsync"
        };
    }

    /// <summary>
    /// 生成接口代码
    /// </summary>
    private async Task<string> GenerateInterfaceAsync(object templateData)
    {
        // TODO: 使用模板引擎生成（待模板系统完善后）
        // 当前使用内联生成
        return await Task.FromResult(GenerateInterfaceCodeInline(templateData));
    }

    /// <summary>
    /// 生成实现类代码
    /// </summary>
    private async Task<string> GenerateImplementationAsync(object templateData)
    {
        // TODO: 使用模板引擎生成（待模板系统完善后）
        // 当前使用内联生成
        return await Task.FromResult(GenerateImplementationCodeInline(templateData));
    }

    /// <summary>
    /// 内联生成接口代码（备用方案）
    /// </summary>
    private string GenerateInterfaceCodeInline(dynamic data)
    {
        return $@"using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace {data.ContractsNamespace};

/// <summary>
/// {data.Description}接口
/// </summary>
public interface I{data.EntityName}AppService : ICrudAppService<
    {data.DtoName},
    {data.PrimaryKeyType},
    PagedAndSortedResultRequestDto,
    {data.CreateDtoName},
    {data.UpdateDtoName}>
{{
}}
";
    }

    /// <summary>
    /// 内联生成实现类代码（备用方案）
    /// </summary>
    private string GenerateImplementationCodeInline(dynamic data)
    {
        return $@"using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using {data.DomainNamespace};
using {data.ContractsNamespace};

namespace {data.Namespace};

/// <summary>
/// {data.Description}实现
/// </summary>
public class {data.EntityName}AppService : CrudAppService<
    {data.EntityName},
    {data.DtoName},
    {data.PrimaryKeyType},
    PagedAndSortedResultRequestDto,
    {data.CreateDtoName},
    {data.UpdateDtoName}>,
    I{data.EntityName}AppService
{{
    public {data.EntityName}AppService(IRepository<{data.EntityName}, {data.PrimaryKeyType}> repository)
        : base(repository)
    {{
    }}
}}
";
    }
}

