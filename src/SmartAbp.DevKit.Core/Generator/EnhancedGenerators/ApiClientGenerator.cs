using System;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Core.Metadata;

namespace SmartAbp.DevKit.Core.Generator.EnhancedGenerators;

/// <summary>
/// 🔥 P0-3.2: API Client生成器（DevKit版本）
///
/// 职责：
/// - 生成前端API调用服务
/// - 封装HTTP请求（GET/POST/PUT/DELETE）
/// - 类型安全的API调用
/// </summary>
public class ApiClientGenerator : LayerGeneratorBase
{
    public ApiClientGenerator(
        UnifiedMetadataSDK metadataSDK,
        ILogger<ApiClientGenerator> logger)
        : base(metadataSDK, logger)
    {
    }

    public override string Name => "ApiClientGenerator";

    public override TargetLayer Layer => TargetLayer.Application;

    public override int Priority => 160; // 在TS类型之后生成

    protected override async Task GenerateCoreAsync(
        GenerationInput input,
        EntityMetadata entityMetadata,
        LayerGenerationResult result)
    {
        try
        {
            var entityName = entityMetadata.Name;
            var baseOutputPath = $"{input.Options.OutputBasePath}/frontend/src/api";

            var apiCode = GenerateApiClient(entityMetadata);
            result.GeneratedFiles[$"{baseOutputPath}/{ToKebabCase(entityName)}.api.ts"] = apiCode;

            Logger.LogInformation("  ✅ 生成API Client: {EntityName}Api", entityName);

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            result.Errors.Add($"API Client生成失败: {ex.Message}");
            Logger.LogError(ex, "API Client生成异常");
        }
    }

    private string GenerateApiClient(EntityMetadata entity)
    {
        var entityName = entity.Name;
        var entityNameLower = ToCamelCase(entityName);
        var entityNameKebab = ToKebabCase(entityName);

        var sb = new StringBuilder();

        sb.AppendLine("import request from '@/utils/request'");
        sb.AppendLine($"import type {{ {entityName}Dto, Create{entityName}Dto, Update{entityName}Dto }} from '@/types/{entityNameKebab}'");
        sb.AppendLine();
        sb.AppendLine("/**");
        sb.AppendLine($" * {entity.DisplayName} API服务");
        sb.AppendLine(" * 自动生成，请勿手动修改");
        sb.AppendLine(" */");
        sb.AppendLine($"export const {entityNameLower}Api = {{");
        sb.AppendLine("  /**");
        sb.AppendLine("   * 获取列表");
        sb.AppendLine("   */");
        sb.AppendLine($"  getList(params?: any) {{");
        sb.AppendLine($"    return request.get<PagedResultDto<{entityName}Dto>>('/api/app/{entityNameKebab}', {{ params }})");
        sb.AppendLine("  },");
        sb.AppendLine();
        sb.AppendLine("  /**");
        sb.AppendLine("   * 根据ID获取");
        sb.AppendLine("   */");
        sb.AppendLine($"  get(id: string) {{");
        sb.AppendLine($"    return request.get<{entityName}Dto>(`/api/app/{entityNameKebab}/${{id}}`)");
        sb.AppendLine("  },");
        sb.AppendLine();
        sb.AppendLine("  /**");
        sb.AppendLine("   * 创建");
        sb.AppendLine("   */");
        sb.AppendLine($"  create(data: Create{entityName}Dto) {{");
        sb.AppendLine($"    return request.post<{entityName}Dto>('/api/app/{entityNameKebab}', data)");
        sb.AppendLine("  },");
        sb.AppendLine();
        sb.AppendLine("  /**");
        sb.AppendLine("   * 更新");
        sb.AppendLine("   */");
        sb.AppendLine($"  update(id: string, data: Update{entityName}Dto) {{");
        sb.AppendLine($"    return request.put<{entityName}Dto>(`/api/app/{entityNameKebab}/${{id}}`, data)");
        sb.AppendLine("  },");
        sb.AppendLine();
        sb.AppendLine("  /**");
        sb.AppendLine("   * 删除");
        sb.AppendLine("   */");
        sb.AppendLine($"  delete(id: string) {{");
        sb.AppendLine($"    return request.delete(`/api/app/{entityNameKebab}/${{id}}`)");
        sb.AppendLine("  }");
        sb.AppendLine("}");
        sb.AppendLine();
        sb.AppendLine("/** 分页结果DTO */");
        sb.AppendLine("interface PagedResultDto<T> {");
        sb.AppendLine("  items: T[]");
        sb.AppendLine("  totalCount: number");
        sb.AppendLine("}");

        return sb.ToString();
    }

    private string ToCamelCase(string text)
    {
        if (string.IsNullOrEmpty(text))
            return text;

        return char.ToLower(text[0]) + text.Substring(1);
    }

    private string ToKebabCase(string text)
    {
        if (string.IsNullOrEmpty(text))
            return text;

        var sb = new StringBuilder();
        sb.Append(char.ToLower(text[0]));

        for (int i = 1; i < text.Length; i++)
        {
            if (char.IsUpper(text[i]))
            {
                sb.Append('-');
                sb.Append(char.ToLower(text[i]));
            }
            else
            {
                sb.Append(text[i]);
            }
        }

        return sb.ToString();
    }
}

