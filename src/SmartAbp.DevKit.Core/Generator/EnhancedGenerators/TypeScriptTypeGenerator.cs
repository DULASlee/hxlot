using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Core.Metadata;

namespace SmartAbp.DevKit.Core.Generator.EnhancedGenerators;

/// <summary>
/// 🔥 P0-3.1: TypeScript类型生成器（DevKit版本）
///
/// 职责：
/// - 生成实体DTO接口
/// - 生成CreateDto/UpdateDto
/// - 生成QueryDto（查询参数）
/// - 支持枚举、导航属性、审计字段
/// </summary>
public class TypeScriptTypeGenerator : LayerGeneratorBase
{
    public TypeScriptTypeGenerator(
        UnifiedMetadataSDK metadataSDK,
        ILogger<TypeScriptTypeGenerator> logger)
        : base(metadataSDK, logger)
    {
    }

    public override string Name => "TypeScriptTypeGenerator";

    public override TargetLayer Layer => TargetLayer.Application;

    public override int Priority => 150; // 在后端DTO之后生成

    protected override async Task GenerateCoreAsync(
        GenerationInput input,
        EntityMetadata entityMetadata,
        LayerGenerationResult result)
    {
        try
        {
            var entityName = entityMetadata.Name;
            var baseOutputPath = $"{input.Options.OutputBasePath}/frontend/src/types/{ToKebabCase(entityName)}";

            // 生成EntityDto
            var dtoCode = GenerateEntityDto(entityMetadata);
            result.GeneratedFiles[$"{baseOutputPath}/{ToKebabCase(entityName)}.dto.ts"] = dtoCode;

            // 生成CreateDto
            var createDtoCode = GenerateCreateDto(entityMetadata);
            result.GeneratedFiles[$"{baseOutputPath}/create-{ToKebabCase(entityName)}.dto.ts"] = createDtoCode;

            // 生成UpdateDto
            var updateDtoCode = GenerateUpdateDto(entityMetadata);
            result.GeneratedFiles[$"{baseOutputPath}/update-{ToKebabCase(entityName)}.dto.ts"] = updateDtoCode;

            Logger.LogInformation("  ✅ 生成TypeScript类型: EntityDto + CreateDto + UpdateDto");

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            result.Errors.Add($"TypeScript类型生成失败: {ex.Message}");
            Logger.LogError(ex, "TypeScript类型生成异常");
        }
    }

    private string GenerateEntityDto(EntityMetadata entity)
    {
        var sb = new StringBuilder();

        sb.AppendLine("/**");
        sb.AppendLine($" * {entity.DisplayName} DTO");
        sb.AppendLine(" * 自动生成，请勿手动修改");
        sb.AppendLine(" */");
        sb.AppendLine($"export interface {entity.Name}Dto {{");
        sb.AppendLine("  /** 主键ID */");
        sb.AppendLine("  id: string");
        sb.AppendLine();

        foreach (var property in entity.Properties)
        {
            if (property.Name == "Id") continue;

            var tsType = MapCSharpTypeToTypeScript(property.Type);
            var optionalSymbol = property.IsRequired ? "" : "?";

            sb.AppendLine($"  /** {property.Name} */");
            sb.AppendLine($"  {ToCamelCase(property.Name)}{optionalSymbol}: {tsType}");
            sb.AppendLine();
        }

        sb.AppendLine("  // 审计字段");
        sb.AppendLine("  creationTime?: string");
        sb.AppendLine("  lastModificationTime?: string");
        sb.AppendLine("}");

        return sb.ToString();
    }

    private string GenerateCreateDto(EntityMetadata entity)
    {
        var sb = new StringBuilder();

        sb.AppendLine("/**");
        sb.AppendLine($" * 创建{entity.DisplayName}输入");
        sb.AppendLine(" */");
        sb.AppendLine($"export interface Create{entity.Name}Dto {{");

        foreach (var property in entity.Properties.Where(p => p.Name != "Id"))
        {
            var tsType = MapCSharpTypeToTypeScript(property.Type);
            var optionalSymbol = property.IsRequired ? "" : "?";

            sb.AppendLine($"  /** {property.Name} */");
            sb.AppendLine($"  {ToCamelCase(property.Name)}{optionalSymbol}: {tsType}");
            sb.AppendLine();
        }

        sb.AppendLine("}");

        return sb.ToString();
    }

    private string GenerateUpdateDto(EntityMetadata entity)
    {
        var sb = new StringBuilder();

        sb.AppendLine("/**");
        sb.AppendLine($" * 更新{entity.DisplayName}输入");
        sb.AppendLine(" */");
        sb.AppendLine($"export interface Update{entity.Name}Dto {{");

        foreach (var property in entity.Properties.Where(p => p.Name != "Id"))
        {
            var tsType = MapCSharpTypeToTypeScript(property.Type);

            sb.AppendLine($"  /** {property.Name} */");
            sb.AppendLine($"  {ToCamelCase(property.Name)}?: {tsType}"); // 全部可选
            sb.AppendLine();
        }

        sb.AppendLine("}");

        return sb.ToString();
    }

    private string MapCSharpTypeToTypeScript(string csharpType)
    {
        return csharpType switch
        {
            "string" => "string",
            "int" => "number",
            "long" => "number",
            "decimal" => "number",
            "double" => "number",
            "float" => "number",
            "bool" => "boolean",
            "DateTime" => "string",
            "DateTimeOffset" => "string",
            "Guid" => "string",
            _ => "any"
        };
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

