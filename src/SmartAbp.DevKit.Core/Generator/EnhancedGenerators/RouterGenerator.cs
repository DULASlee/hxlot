using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Core.Metadata;

namespace SmartAbp.DevKit.Core.Generator.EnhancedGenerators;

/// <summary>
/// 🛣️ 路由生成器（DevKit版本）
///
/// 职责：
/// - 生成Vue Router模块路由配置
/// - 自动注册路由到主路由文件
/// - 支持懒加载和权限控制
/// </summary>
public class RouterGenerator : LayerGeneratorBase
{
    private readonly string _templatesPath;

    public RouterGenerator(
        UnifiedMetadataSDK metadataSDK,
        ILogger<RouterGenerator> logger)
        : base(metadataSDK, logger)
    {
        // 获取templates目录路径
        var projectRoot = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "..");
        _templatesPath = Path.GetFullPath(Path.Combine(projectRoot, "templates"));
    }

    public override string Name => "RouterGenerator";

    public override TargetLayer Layer => TargetLayer.Frontend;

    public override int Priority => 190; // 在Vue组件和Store之后生成

    protected override async Task GenerateCoreAsync(
        GenerationInput input,
        EntityMetadata entityMetadata,
        LayerGenerationResult result)
    {
        try
        {
            var entityName = entityMetadata.Name;
            var moduleName = ToCamelCase(entityName); // 使用实体名作为模块名
            var baseOutputPath = $"{input.Options.OutputBasePath}/frontend/src/router/modules";

            // 生成路由文件
            var routeCode = await GenerateRouteFileAsync(entityMetadata, moduleName);
            var routeFilePath = $"{baseOutputPath}/{moduleName}.ts";
            result.GeneratedFiles[routeFilePath] = routeCode;

            Logger.LogInformation("  ✅ 生成路由文件: {FileName}", $"{moduleName}.ts");

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            result.Errors.Add($"路由生成失败: {ex.Message}");
            Logger.LogError(ex, "路由生成异常");
        }
    }

    /// <summary>
    /// 生成路由文件（使用模板或内置生成）
    /// </summary>
    private async Task<string> GenerateRouteFileAsync(EntityMetadata entity, string moduleName)
    {
        // 尝试使用Handlebars模板
        var templatePath = Path.Combine(_templatesPath, "frontend", "router", "ModuleRoutes.template.ts");

        if (File.Exists(templatePath))
        {
            // 使用模板生成
            return await GenerateFromTemplateAsync(templatePath, entity, moduleName);
        }
        else
        {
            // 使用内置生成器（fallback）
            Logger.LogWarning("  ⚠️ 路由模板未找到，使用内置生成器: {TemplatePath}", templatePath);
            return GenerateRouteContentBuiltin(entity, moduleName);
        }
    }

    /// <summary>
    /// 从Handlebars模板生成路由文件
    /// </summary>
    private async Task<string> GenerateFromTemplateAsync(string templatePath, EntityMetadata entity, string moduleName)
    {
        try
        {
            var templateContent = await File.ReadAllTextAsync(templatePath);

            // 简单变量替换（如果需要更复杂的逻辑，使用HandlebarsTemplateEngine）
            var result = templateContent
                .Replace("{{moduleName}}", ToCamelCase(moduleName))
                .Replace("{{ModuleName}}", ToPascalCase(moduleName))
                .Replace("{{DisplayName}}", entity.DisplayName ?? entity.Name)
                .Replace("{{EntityName}}", entity.Name)
                .Replace("{{entityName}}", ToCamelCase(entity.Name));

            return result;
        }
        catch (Exception ex)
        {
            Logger.LogWarning(ex, "  ⚠️ 模板渲染失败，使用内置生成器");
            return GenerateRouteContentBuiltin(entity, moduleName);
        }
    }

    /// <summary>
    /// 内置路由内容生成器
    /// </summary>
    private string GenerateRouteContentBuiltin(EntityMetadata entity, string moduleName)
    {
        var entityName = entity.Name;
        var entityNameLower = ToCamelCase(entityName);
        var moduleNameLower = ToCamelCase(moduleName);
        var displayName = entity.DisplayName ?? entityName;

        var sb = new StringBuilder();

        sb.AppendLine("// 🔥 自动生成的路由配置 - " + moduleName + "模块");
        sb.AppendLine("// 支持懒加载和权限控制");
        sb.AppendLine();
        sb.AppendLine("import type { RouteRecordRaw } from 'vue-router'");
        sb.AppendLine("import SmartAbpLayout from '@/components/layout/SmartAbpLayout.vue'");
        sb.AppendLine();
        sb.AppendLine("const routes: RouteRecordRaw[] = [");
        sb.AppendLine("  {");
        sb.AppendLine($"    path: '/{moduleNameLower}',");
        sb.AppendLine("    component: SmartAbpLayout,");
        sb.AppendLine($"    name: '{ToPascalCase(moduleName)}Module',");
        sb.AppendLine("    meta: {");
        sb.AppendLine($"      title: '{displayName}',");
        sb.AppendLine("      icon: 'mdi:cube-outline',");
        sb.AppendLine("      requiresAuth: true,");
        sb.AppendLine("      requiredRoles: ['admin'],");
        sb.AppendLine("    },");
        sb.AppendLine("    children: [");
        sb.AppendLine("      {");
        sb.AppendLine($"        path: '{entityNameLower}',");
        sb.AppendLine($"        name: '{entityName}Management',");
        sb.AppendLine($"        component: () => import('@/views/{moduleNameLower}/{entityName}Management.vue'),");
        sb.AppendLine("        meta: {");
        sb.AppendLine($"          title: '{displayName}',");
        sb.AppendLine("          icon: 'mdi:cube-outline',");
        sb.AppendLine("          requiresAuth: true,");
        sb.AppendLine("          requiredRoles: ['admin'],");
        sb.AppendLine("        },");
        sb.AppendLine("      },");
        sb.AppendLine("    ],");
        sb.AppendLine("  },");
        sb.AppendLine("]");
        sb.AppendLine();
        sb.AppendLine("export default routes");
        sb.AppendLine();

        return sb.ToString();
    }

    // Helper方法
    private string ToCamelCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        return char.ToLowerInvariant(input[0]) + input.Substring(1);
    }

    private string ToPascalCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        return char.ToUpperInvariant(input[0]) + input.Substring(1);
    }

    private string ToKebabCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        return string.Concat(input.Select((x, i) => i > 0 && char.IsUpper(x) ? "-" + x.ToString() : x.ToString())).ToLower();
    }
}

