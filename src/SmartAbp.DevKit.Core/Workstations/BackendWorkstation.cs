using System;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Templates;
using SmartAbp.DevKit.Core.Types;

namespace SmartAbp.DevKit.Core.Workstations;

/// <summary>
/// 后端代码生成工位
/// 职责：根据元数据和模板生成后端代码（实体、应用服务、控制器、DTO等）
/// </summary>
public class BackendWorkstation
{
    private readonly ILogger<BackendWorkstation> _logger;
    private readonly TemplateManager _templateManager;
    private readonly UnifiedMetadataSDK _metadataSDK;

    public BackendWorkstation(
        ILogger<BackendWorkstation> logger,
        TemplateManager templateManager,
        UnifiedMetadataSDK metadataSDK)
    {
        _logger = logger;
        _templateManager = templateManager;
        _metadataSDK = metadataSDK;
    }

    /// <summary>
    /// 执行后端代码生成
    /// </summary>
    /// <param name="input">工位输入，包含GenerationContext</param>
    /// <param name="cancellationToken"></param>
    /// <returns>工位输出，包含生成的代码</returns>
    public async Task<WorkstationOutput> ExecuteAsync(WorkstationInput input, CancellationToken cancellationToken)
    {
        var startTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        _logger.LogInformation("🚀 后端工位启动: {WorkstationId}", "backend");

        var entity = input.Context?.EntitySchema ?? input.Metadata;

        if (entity == null || string.IsNullOrEmpty(entity.Name))
        {
            _logger.LogError("❌ 后端工位失败: 缺少实体元数据");
            return new WorkstationOutput
            {
                WorkstationId = "backend",
                Code = string.Empty,
                Metadata = new EntitySchema(),
                ExecutionTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - startTime,
                AdditionalData = new()
                {
                    ["errors"] = new[] { "缺少实体元数据" }
                }
            };
        }

        var generatedCode = new StringBuilder();

        try
        {
            // 注册Handlebars Helpers
            _templateManager.RegisterHelpers();

            // 1. 生成Entity类（使用内联模板）
            var entityTemplate = GetEntityTemplate();
            var compiledEntityTemplate = _templateManager.CompileTemplate(entityTemplate);
            var entityCode = compiledEntityTemplate.Invoke(entity);
            generatedCode.AppendLine(entityCode);
            generatedCode.AppendLine();
            _logger.LogDebug("✅ 生成实体类: {EntityName}", entity.Name);

            // 2. 生成AppService类（使用内联模板）
            var appServiceTemplate = GetAppServiceTemplate();
            var compiledAppServiceTemplate = _templateManager.CompileTemplate(appServiceTemplate);
            var appServiceCode = compiledAppServiceTemplate.Invoke(entity);
            generatedCode.AppendLine(appServiceCode);
            generatedCode.AppendLine();
            _logger.LogDebug("✅ 生成应用服务: {EntityName}AppService", entity.Name);

            // TODO: 根据实际需求，集成更多的后端代码生成逻辑
            // 例如：Controller, DTOs, Repository Interfaces, etc.

            _logger.LogInformation("✅ 后端工位完成: {WorkstationId}", "backend");

            return new WorkstationOutput
            {
                WorkstationId = "backend",
                Code = generatedCode.ToString(),
                Metadata = entity,
                ExecutionTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - startTime,
                AdditionalData = new()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ 后端工位执行失败: {WorkstationId} - {Message}", "backend", ex.Message);
            return new WorkstationOutput
            {
                WorkstationId = "backend",
                Code = string.Empty,
                Metadata = entity,
                ExecutionTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - startTime,
                AdditionalData = new()
                {
                    ["errors"] = new[] { ex.Message }
                }
            };
        }
    }

    /// <summary>
    /// 获取Entity模板（内联）
    /// </summary>
    private static string GetEntityTemplate()
    {
        return @"
// Generated Entity: {{Name}}
// Display Name: {{DisplayName}}
// Properties Count: {{Properties.Count}}

namespace SmartAbp.Domain.Entities
{
    /// <summary>
    /// {{DisplayName}}
    /// </summary>
    public class {{Name}}
    {
        {{#each Properties}}
        /// <summary>
        /// {{DisplayName}}
        /// </summary>
        public {{Type}} {{Name}} { get; set; }
        {{/each}}
    }
}";
    }

    /// <summary>
    /// 获取AppService模板（内联）
    /// </summary>
    private static string GetAppServiceTemplate()
    {
        return @"
// Generated AppService: {{Name}}AppService
// Display Name: {{DisplayName}} 应用服务

namespace SmartAbp.Application
{
    /// <summary>
    /// {{DisplayName}}应用服务
    /// </summary>
    public class {{Name}}AppService
    {
        // TODO: Implement CRUD methods
    }
}";
    }
}
