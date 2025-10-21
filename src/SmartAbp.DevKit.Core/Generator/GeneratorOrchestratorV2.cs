using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Abstractions.Configuration;
using SmartAbp.DevKit.Abstractions.Templates;
using Microsoft.Extensions.Logging;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// 重构后的代码生成器编排器，实现ICodeGenerator接口
/// DevKit v2.0 - 完全解耦版本
/// </summary>
public class GeneratorOrchestratorV2 : ICodeGenerator
{
    private readonly IMetadataProvider _metadataProvider;
    private readonly IConfigurationProvider _configProvider;
    private readonly ITemplateEngine _templateEngine;
    private readonly ILogger<GeneratorOrchestratorV2> _logger;

    public GeneratorOrchestratorV2(
        IMetadataProvider metadataProvider,
        IConfigurationProvider configProvider,
        ITemplateEngine templateEngine,
        ILogger<GeneratorOrchestratorV2> logger)
    {
        _metadataProvider = metadataProvider;
        _configProvider = configProvider;
        _templateEngine = templateEngine;
        _logger = logger;
    }

    public async Task<GenerationResult> GenerateAsync(GenerationInput input)
    {
        try
        {
            _logger.LogInformation("📦 开始代码生成: EntityId={EntityId}", input.EntityId);

            var result = new GenerationResult();
            var config = await _configProvider.GetConfigurationAsync();
            var entity = await _metadataProvider.GetEntityMetadataAsync(input.EntityId);

            // 生成Domain层
            if (input.Options.GenerateDomain)
            {
                await GenerateDomainLayer(entity, config, result);
            }

            // 生成Application层
            if (input.Options.GenerateApplication)
            {
                await GenerateApplicationLayer(entity, config, result);
            }

            // 生成Frontend层
            if (input.Options.GenerateFrontend)
            {
                await GenerateFrontendLayer(entity, config, result);
            }

            result.Success = true;
            _logger.LogInformation("🎉 代码生成完成: EntityId={EntityId}, 文件数={FileCount}",
                input.EntityId, result.GeneratedFiles.Count);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 代码生成失败: EntityId={EntityId}", input.EntityId);

            return new GenerationResult
            {
                Success = false,
                Errors = { ex.Message }
            };
        }
    }

    private async Task GenerateDomainLayer(EntityMetadata entity, DevKitConfiguration config, GenerationResult result)
    {
        _logger.LogInformation("🔨 正在生成Domain层代码: {EntityName}", entity.Name);

        // 生成实体类
        var entityCode = await _templateEngine.RenderAsync("Entity", new
        {
            NamespacePrefix = config.NamespacePrefix,
            EntityName = entity.Name,
            DisplayName = entity.DisplayName,
            Properties = entity.Properties
        });

        var entityPath = $"{config.DomainOutputPath}/{entity.Name}.cs";
        result.GeneratedFiles[entityPath] = entityCode;

        _logger.LogDebug("✅ Domain实体生成完成: {EntityName}", entity.Name);
    }

    private async Task GenerateApplicationLayer(EntityMetadata entity, DevKitConfiguration config, GenerationResult result)
    {
        _logger.LogInformation("🔨 正在生成Application层代码: {EntityName}", entity.Name);

        // 生成DTO
        var dtoCode = await _templateEngine.RenderAsync("Dto", new
        {
            NamespacePrefix = config.NamespacePrefix,
            EntityName = entity.Name,
            Properties = entity.Properties
        });

        var dtoPath = $"{config.ApplicationOutputPath}/Contracts/{entity.Name}Dto.cs";
        result.GeneratedFiles[dtoPath] = dtoCode;

        // 生成应用服务
        var appServiceCode = await _templateEngine.RenderAsync("AppService", new
        {
            NamespacePrefix = config.NamespacePrefix,
            EntityName = entity.Name
        });

        var appServicePath = $"{config.ApplicationOutputPath}/Services/{entity.Name}AppService.cs";
        result.GeneratedFiles[appServicePath] = appServiceCode;

        _logger.LogDebug("✅ Application层生成完成: {EntityName}", entity.Name);
    }

    private async Task GenerateFrontendLayer(EntityMetadata entity, DevKitConfiguration config, GenerationResult result)
    {
        _logger.LogInformation("🔨 正在生成Frontend层代码: {EntityName}", entity.Name);

        // 生成Vue列表页面
        var listPageCode = await _templateEngine.RenderAsync("VueListPage", new
        {
            EntityName = entity.Name,
            DisplayName = entity.DisplayName,
            Properties = entity.Properties
        });

        var listPagePath = $"{config.FrontendOutputPath}/{entity.Name}/index.vue";
        result.GeneratedFiles[listPagePath] = listPageCode;

        // 生成Vue表单组件
        var formCode = await _templateEngine.RenderAsync("VueForm", new
        {
            EntityName = entity.Name,
            Properties = entity.Properties
        });

        var formPath = $"{config.FrontendOutputPath}/{entity.Name}/components/FormDialog.vue";
        result.GeneratedFiles[formPath] = formCode;

        // 生成TypeScript API客户端
        var apiCode = await _templateEngine.RenderAsync("TypeScriptApi", new
        {
            EntityName = entity.Name,
            Properties = entity.Properties
        });

        var apiPath = $"{config.FrontendOutputPath}/../api/{entity.Name.ToLowerInvariant()}.ts";
        result.GeneratedFiles[apiPath] = apiCode;

        _logger.LogDebug("✅ Frontend层生成完成: {EntityName}", entity.Name);
    }
}
