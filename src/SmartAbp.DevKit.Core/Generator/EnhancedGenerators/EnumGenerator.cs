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
/// 🔥 P0-1: 枚举类型生成器（DevKit版本）
///
/// 职责：
/// - 从实体元数据中提取枚举定义
/// - 生成后端C#枚举代码（含Description特性）
/// - 生成前端TypeScript枚举代码（含Helper工具类）
/// - 支持批量生成和索引文件
/// </summary>
public class EnumGenerator : LayerGeneratorBase
{
    public EnumGenerator(
        UnifiedMetadataSDK metadataSDK,
        ILogger<EnumGenerator> logger)
        : base(metadataSDK, logger)
    {
    }

    public override string Name => "EnumGenerator";

    public override TargetLayer Layer => TargetLayer.Domain; // 枚举属于领域层

    public override int Priority => 50; // 最先生成（其他生成器可能依赖枚举）

    protected override async Task GenerateCoreAsync(
        GenerationInput input,
        EntityMetadata entityMetadata,
        LayerGenerationResult result)
    {
        try
        {
            var namespacePrefix = input.Options.NamespacePrefix ?? "SmartAbp";

            // 从实体属性中提取枚举
            var enums = ExtractEnumsFromEntity(entityMetadata);

            if (!enums.Any())
            {
                Logger.LogInformation("  ℹ️  实体无枚举属性，跳过枚举生成");
                return;
            }

            // 生成后端C#枚举
            await GenerateCSharpEnumsAsync(enums, namespacePrefix, input, result);

            // 生成前端TypeScript枚举
            await GenerateTypeScriptEnumsAsync(enums, input, result);

            Logger.LogInformation("  ✅ 生成{Count}个枚举（C# + TypeScript + Helper）", enums.Count);

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            result.Errors.Add($"枚举生成失败: {ex.Message}");
            Logger.LogError(ex, "枚举生成异常");
        }
    }

    /// <summary>
    /// 从实体元数据中提取枚举定义
    /// </summary>
    private List<EnumDefinition> ExtractEnumsFromEntity(EntityMetadata entity)
    {
        var enums = new List<EnumDefinition>();
        var processedEnumNames = new HashSet<string>();

        // 从ExtensionData中查找枚举定义
        if (entity.ExtensionData.TryGetValue("Enums", out var enumsData))
        {
            if (enumsData is List<EnumDefinition> enumList)
            {
                return enumList;
            }
        }

        // 从属性中推断枚举（如果属性有EnumValues）
        foreach (var property in entity.Properties)
        {
            if (property.ExtensionData.TryGetValue("EnumValues", out var enumValuesData))
            {
                if (enumValuesData is List<EnumValue> enumValues && enumValues.Any())
                {
                    var enumName = property.Type;

                    if (processedEnumNames.Contains(enumName))
                        continue;

                    processedEnumNames.Add(enumName);

                    var enumDef = new EnumDefinition
                    {
                        Name = enumName,
                        DisplayName = property.ExtensionData.TryGetValue("DisplayName", out var displayName)
                            ? displayName?.ToString() ?? enumName
                            : enumName,
                        Description = $"{property.Name}枚举",
                        Values = enumValues
                    };

                    enums.Add(enumDef);
                }
            }
        }

        return enums;
    }

    /// <summary>
    /// 生成C#枚举文件
    /// </summary>
    private async Task GenerateCSharpEnumsAsync(
        List<EnumDefinition> enums,
        string namespacePrefix,
        GenerationInput input,
        LayerGenerationResult result)
    {
        var baseOutputPath = $"{input.Options.OutputBasePath}/SmartAbp.Domain/Enums";

        foreach (var enumDef in enums)
        {
            // 生成枚举文件
            var enumCode = GenerateCSharpEnum(enumDef, $"{namespacePrefix}.Domain.Enums");
            result.GeneratedFiles[$"{baseOutputPath}/{enumDef.Name}.cs"] = enumCode;

            // 生成扩展方法文件
            var extensionsCode = GenerateCSharpEnumExtensions(enumDef, $"{namespacePrefix}.Domain.Enums");
            result.GeneratedFiles[$"{baseOutputPath}/{enumDef.Name}Extensions.cs"] = extensionsCode;
        }

        await Task.CompletedTask;
    }

    /// <summary>
    /// 生成TypeScript枚举文件
    /// </summary>
    private async Task GenerateTypeScriptEnumsAsync(
        List<EnumDefinition> enums,
        GenerationInput input,
        LayerGenerationResult result)
    {
        var baseOutputPath = $"{input.Options.OutputBasePath}/frontend/src/types/enums";

        foreach (var enumDef in enums)
        {
            var tsCode = GenerateTypeScriptEnum(enumDef);
            var fileName = ToKebabCase(enumDef.Name);
            result.GeneratedFiles[$"{baseOutputPath}/{fileName}.enum.ts"] = tsCode;
        }

        // 生成index.ts汇总文件
        var indexCode = GenerateTypeScriptEnumIndex(enums);
        result.GeneratedFiles[$"{baseOutputPath}/index.ts"] = indexCode;

        await Task.CompletedTask;
    }

    /// <summary>
    /// 生成C#枚举代码
    /// </summary>
    private string GenerateCSharpEnum(EnumDefinition enumDef, string namespaceName)
    {
        var sb = new StringBuilder();

        sb.AppendLine("using System.ComponentModel;");
        sb.AppendLine();
        sb.AppendLine($"namespace {namespaceName}");
        sb.AppendLine("{");
        sb.AppendLine("    /// <summary>");
        sb.AppendLine($"    /// {enumDef.DisplayName}");
        if (!string.IsNullOrEmpty(enumDef.Description))
        {
            sb.AppendLine($"    /// {enumDef.Description}");
        }
        sb.AppendLine("    /// </summary>");
        sb.AppendLine($"    public enum {enumDef.Name}");
        sb.AppendLine("    {");

        for (int i = 0; i < enumDef.Values.Count; i++)
        {
            var value = enumDef.Values[i];

            if (!string.IsNullOrEmpty(value.Description))
            {
                sb.AppendLine("        /// <summary>");
                sb.AppendLine($"        /// {value.Description}");
                sb.AppendLine("        /// </summary>");
            }

            if (!string.IsNullOrEmpty(value.DisplayName))
            {
                sb.AppendLine($"        [Description(\"{value.DisplayName}\")]");
            }

            var intValue = ConvertToInt(value.Value);
            sb.Append($"        {value.Name} = {intValue}");

            if (i < enumDef.Values.Count - 1)
            {
                sb.AppendLine(",");
                sb.AppendLine();
            }
            else
            {
                sb.AppendLine();
            }
        }

        sb.AppendLine("    }");
        sb.AppendLine("}");

        return sb.ToString();
    }

    /// <summary>
    /// 生成C#枚举扩展方法
    /// </summary>
    private string GenerateCSharpEnumExtensions(EnumDefinition enumDef, string namespaceName)
    {
        var sb = new StringBuilder();

        sb.AppendLine("using System;");
        sb.AppendLine("using System.ComponentModel;");
        sb.AppendLine("using System.Linq;");
        sb.AppendLine("using System.Reflection;");
        sb.AppendLine();
        sb.AppendLine($"namespace {namespaceName}");
        sb.AppendLine("{");
        sb.AppendLine("    /// <summary>");
        sb.AppendLine($"    /// {enumDef.Name}扩展方法");
        sb.AppendLine("    /// </summary>");
        sb.AppendLine($"    public static class {enumDef.Name}Extensions");
        sb.AppendLine("    {");
        sb.AppendLine("        /// <summary>");
        sb.AppendLine("        /// 获取枚举值的显示名称");
        sb.AppendLine("        /// </summary>");
        sb.AppendLine($"        public static string GetDisplayName(this {enumDef.Name} value)");
        sb.AppendLine("        {");
        sb.AppendLine("            var field = value.GetType().GetField(value.ToString());");
        sb.AppendLine("            if (field == null) return value.ToString();");
        sb.AppendLine();
        sb.AppendLine("            var attribute = field.GetCustomAttribute<DescriptionAttribute>();");
        sb.AppendLine("            return attribute?.Description ?? value.ToString();");
        sb.AppendLine("        }");
        sb.AppendLine("    }");
        sb.AppendLine("}");

        return sb.ToString();
    }

    /// <summary>
    /// 生成TypeScript枚举代码
    /// </summary>
    private string GenerateTypeScriptEnum(EnumDefinition enumDef)
    {
        var sb = new StringBuilder();

        sb.AppendLine("/**");
        sb.AppendLine($" * {enumDef.DisplayName}");
        if (!string.IsNullOrEmpty(enumDef.Description))
        {
            sb.AppendLine($" * {enumDef.Description}");
        }
        sb.AppendLine(" */");
        sb.AppendLine($"export enum {enumDef.Name} {{");

        for (int i = 0; i < enumDef.Values.Count; i++)
        {
            var value = enumDef.Values[i];
            if (!string.IsNullOrEmpty(value.Description) || !string.IsNullOrEmpty(value.DisplayName))
            {
                var comment = !string.IsNullOrEmpty(value.Description)
                    ? value.Description
                    : value.DisplayName;
                sb.AppendLine($"  /** {comment} */");
            }

            var intValue = ConvertToInt(value.Value);
            sb.Append($"  {value.Name} = {intValue}");

            if (i < enumDef.Values.Count - 1)
            {
                sb.AppendLine(",");
            }
            else
            {
                sb.AppendLine();
            }
        }

        sb.AppendLine("}");
        sb.AppendLine();

        // 生成Helper类
        sb.Append(GenerateTypeScriptEnumHelper(enumDef));

        return sb.ToString();
    }

    /// <summary>
    /// 生成TypeScript枚举Helper类
    /// </summary>
    private string GenerateTypeScriptEnumHelper(EnumDefinition enumDef)
    {
        var sb = new StringBuilder();

        sb.AppendLine("/**");
        sb.AppendLine($" * {enumDef.Name}工具类");
        sb.AppendLine(" */");
        sb.AppendLine($"export class {enumDef.Name}Helper {{");
        sb.AppendLine("  static getLabel(value: " + enumDef.Name + "): string {");
        sb.AppendLine("    const labels: Record<" + enumDef.Name + ", string> = {");

        foreach (var value in enumDef.Values)
        {
            var displayName = value.DisplayName ?? value.Name;
            sb.AppendLine($"      [{enumDef.Name}.{value.Name}]: '{displayName}',");
        }

        sb.AppendLine("    }");
        sb.AppendLine("    return labels[value] || String(value)");
        sb.AppendLine("  }");
        sb.AppendLine();
        sb.AppendLine("  static getOptions() {");
        sb.AppendLine("    return [");

        foreach (var value in enumDef.Values)
        {
            var displayName = value.DisplayName ?? value.Name;
            sb.AppendLine($"      {{ label: '{displayName}', value: {enumDef.Name}.{value.Name} }},");
        }

        sb.AppendLine("    ]");
        sb.AppendLine("  }");
        sb.AppendLine("}");

        return sb.ToString();
    }

    /// <summary>
    /// 生成TypeScript索引文件
    /// </summary>
    private string GenerateTypeScriptEnumIndex(List<EnumDefinition> enums)
    {
        var sb = new StringBuilder();

        sb.AppendLine("/**");
        sb.AppendLine(" * 枚举类型汇总");
        sb.AppendLine(" * 自动生成，请勿手动修改");
        sb.AppendLine(" */");
        sb.AppendLine();

        foreach (var enumDef in enums)
        {
            var fileName = ToKebabCase(enumDef.Name);
            sb.AppendLine($"export * from './{fileName}.enum'");
        }

        return sb.ToString();
    }

    private int ConvertToInt(object value)
    {
        if (value == null) return 0;

        try
        {
            return Convert.ToInt32(value);
        }
        catch
        {
            return 0;
        }
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

/// <summary>
/// 枚举定义
/// </summary>
public class EnumDefinition
{
    public string Name { get; set; } = default!;
    public string DisplayName { get; set; } = default!;
    public string Description { get; set; } = default!;
    public List<EnumValue> Values { get; set; } = new();
}

/// <summary>
/// 枚举值
/// </summary>
public class EnumValue
{
    public string Name { get; set; } = default!;
    public object Value { get; set; } = default!;
    public string DisplayName { get; set; } = default!;
    public string Description { get; set; } = default!;
}

