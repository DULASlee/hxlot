using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SmartAbp.CodeGenerator.Services.V9;

namespace SmartAbp.CodeGenerator.Services.Generators
{
    /// <summary>
    /// 🔥 P0-1: 枚举类型生成器
    /// 支持从元数据自动生成后端C#枚举和前端TypeScript枚举
    /// </summary>
    public class EnumGenerator
    {
        /// <summary>
        /// 从实体模型中提取所有枚举类型
        /// </summary>
        public List<EnumDefinitionDto> ExtractEnumsFromEntity(EnhancedEntityModelDto entity)
        {
            var enums = new List<EnumDefinitionDto>();
            var processedEnumNames = new HashSet<string>();

            // 遍历所有属性，查找枚举类型
            foreach (var property in entity.Properties)
            {
                if (property.EnumValues != null && property.EnumValues.Any())
                {
                    // 使用Type属性作为枚举名称（通常是枚举类型名）
                    var enumName = property.Type;

                    // 避免重复添加相同的枚举
                    if (processedEnumNames.Contains(enumName))
                        continue;

                    processedEnumNames.Add(enumName);

                    var enumDef = new EnumDefinitionDto
                    {
                        Name = enumName,
                        DisplayName = property.DisplayName ?? enumName,
                        Description = property.Description ?? $"{property.DisplayName}枚举",
                        Values = property.EnumValues.Select(ev => new EnumValueDto
                        {
                            Id = ev.Id,
                            Name = ev.Name,
                            Value = ev.Value,
                            DisplayName = ev.DisplayName,
                            Description = ev.Description,
                            IsDefault = ev.IsDefault
                        }).ToList()
                    };

                    enums.Add(enumDef);
                }
            }

            return enums;
        }

        /// <summary>
        /// 生成后端C#枚举代码
        /// </summary>
        public string GenerateCSharpEnum(EnumDefinitionDto enumDef, string namespaceName = "SmartAbp.Domain.Enums")
        {
            var sb = new StringBuilder();

            // Using语句
            sb.AppendLine("using System.ComponentModel;");
            sb.AppendLine();

            // 命名空间
            sb.AppendLine($"namespace {namespaceName}");
            sb.AppendLine("{");

            // 枚举注释
            sb.AppendLine("    /// <summary>");
            sb.AppendLine($"    /// {enumDef.DisplayName ?? enumDef.Name}");
            if (!string.IsNullOrEmpty(enumDef.Description))
            {
                sb.AppendLine($"    /// {enumDef.Description}");
            }
            sb.AppendLine("    /// </summary>");

            // 枚举定义
            sb.AppendLine($"    public enum {enumDef.Name}");
            sb.AppendLine("    {");

            // 枚举值
            for (int i = 0; i < enumDef.Values.Count; i++)
            {
                var value = enumDef.Values[i];

                // 值注释
                if (!string.IsNullOrEmpty(value.Description))
                {
                    sb.AppendLine("        /// <summary>");
                    sb.AppendLine($"        /// {value.Description}");
                    sb.AppendLine("        /// </summary>");
                }

                // Description特性（用于显示名称）
                if (!string.IsNullOrEmpty(value.DisplayName))
                {
                    sb.AppendLine($"        [Description(\"{value.DisplayName}\")]");
                }

                // 枚举值定义
                var intValue = ConvertToInt(value.Value);
                sb.Append($"        {value.Name} = {intValue}");

                // 添加逗号（除了最后一个）
                if (i < enumDef.Values.Count - 1)
                {
                    sb.AppendLine(",");
                }
                else
                {
                    sb.AppendLine();
                }

                // 空行（最后一个值除外）
                if (i < enumDef.Values.Count - 1)
                {
                    sb.AppendLine();
                }
            }

            sb.AppendLine("    }");
            sb.AppendLine("}");

            return sb.ToString();
        }

        /// <summary>
        /// 生成前端TypeScript枚举代码（包含Helper工具类）
        /// </summary>
        public string GenerateTypeScriptEnum(EnumDefinitionDto enumDef)
        {
            var sb = new StringBuilder();

            // 枚举注释
            sb.AppendLine("/**");
            sb.AppendLine($" * {enumDef.DisplayName ?? enumDef.Name}");
            if (!string.IsNullOrEmpty(enumDef.Description))
            {
                sb.AppendLine($" * {enumDef.Description}");
            }
            sb.AppendLine(" */");

            // 枚举定义
            sb.AppendLine($"export enum {enumDef.Name} {{");

            // 枚举值
            for (int i = 0; i < enumDef.Values.Count; i++)
            {
                var value = enumDef.Values[i];

                // 值注释
                if (!string.IsNullOrEmpty(value.Description) || !string.IsNullOrEmpty(value.DisplayName))
                {
                    var comment = !string.IsNullOrEmpty(value.Description)
                        ? value.Description
                        : value.DisplayName;
                    sb.AppendLine($"  /** {comment} */");
                }

                // 枚举值定义
                var intValue = ConvertToInt(value.Value);
                sb.Append($"  {value.Name} = {intValue}");

                // 添加逗号
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

            // 生成Helper工具类
            sb.Append(GenerateTypeScriptEnumHelper(enumDef));

            return sb.ToString();
        }

        /// <summary>
        /// 生成TypeScript枚举Helper工具类
        /// </summary>
        private string GenerateTypeScriptEnumHelper(EnumDefinitionDto enumDef)
        {
            var sb = new StringBuilder();

            // Helper类注释
            sb.AppendLine("/**");
            sb.AppendLine($" * {enumDef.Name}工具类");
            sb.AppendLine(" * 提供枚举值的显示名称和下拉选项");
            sb.AppendLine(" */");

            // Helper类定义
            sb.AppendLine($"export class {enumDef.Name}Helper {{");

            // 生成getLabel方法
            sb.AppendLine("  /**");
            sb.AppendLine("   * 获取枚举值的显示名称");
            sb.AppendLine($"   * @param value {enumDef.Name}枚举值");
            sb.AppendLine("   * @returns 显示名称");
            sb.AppendLine("   */");
            sb.AppendLine($"  static getLabel(value: {enumDef.Name}): string {{");
            sb.AppendLine($"    const labels: Record<{enumDef.Name}, string> = {{");

            // 映射表
            foreach (var value in enumDef.Values)
            {
                var displayName = value.DisplayName ?? value.Name;
                sb.AppendLine($"      [{enumDef.Name}.{value.Name}]: '{displayName}',");
            }

            sb.AppendLine("    }");
            sb.AppendLine("    return labels[value] || String(value)");
            sb.AppendLine("  }");
            sb.AppendLine();

            // 生成getOptions方法
            sb.AppendLine("  /**");
            sb.AppendLine("   * 获取下拉选项列表");
            sb.AppendLine("   * @returns 下拉选项数组 { label: string, value: number }[]");
            sb.AppendLine("   */");
            sb.AppendLine("  static getOptions() {{");
            sb.AppendLine("    return [");

            // 选项列表
            foreach (var value in enumDef.Values)
            {
                var displayName = value.DisplayName ?? value.Name;
                sb.AppendLine($"      {{ label: '{displayName}', value: {enumDef.Name}.{value.Name} }},");
            }

            sb.AppendLine("    ]");
            sb.AppendLine("  }");
            sb.AppendLine();

            // 生成getColor方法（如果需要）
            sb.AppendLine("  /**");
            sb.AppendLine("   * 获取枚举值对应的颜色（用于徽章显示）");
            sb.AppendLine($"   * @param value {enumDef.Name}枚举值");
            sb.AppendLine("   * @returns Element Plus颜色类型");
            sb.AppendLine("   */");
            sb.AppendLine($"  static getColor(value: {enumDef.Name}): 'primary' | 'success' | 'warning' | 'danger' | 'info' {{");
            sb.AppendLine("    // 默认颜色映射（可根据实际业务调整）");
            sb.AppendLine("    const colors = {");

            // 默认颜色映射（第一个值primary，最后一个danger，其他默认info）
            for (int i = 0; i < enumDef.Values.Count; i++)
            {
                var value = enumDef.Values[i];
                var color = i == 0 ? "primary"
                    : i == enumDef.Values.Count - 1 ? "danger"
                    : "info";
                sb.AppendLine($"      [{enumDef.Name}.{value.Name}]: '{color}' as const,");
            }

            sb.AppendLine("    }");
            sb.AppendLine("    return colors[value] || 'info'");
            sb.AppendLine("  }");

            sb.AppendLine("}");

            return sb.ToString();
        }

        /// <summary>
        /// 生成后端枚举扩展方法类
        /// </summary>
        public string GenerateCSharpEnumExtensions(EnumDefinitionDto enumDef, string namespaceName = "SmartAbp.Domain.Enums")
        {
            var sb = new StringBuilder();

            // Using语句
            sb.AppendLine("using System;");
            sb.AppendLine("using System.ComponentModel;");
            sb.AppendLine("using System.Linq;");
            sb.AppendLine("using System.Reflection;");
            sb.AppendLine();

            // 命名空间
            sb.AppendLine($"namespace {namespaceName}");
            sb.AppendLine("{");

            // 扩展类注释
            sb.AppendLine("    /// <summary>");
            sb.AppendLine($"    /// {enumDef.Name}扩展方法");
            sb.AppendLine("    /// </summary>");

            // 扩展类定义
            sb.AppendLine($"    public static class {enumDef.Name}Extensions");
            sb.AppendLine("    {");

            // GetDisplayName方法
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
        /// 批量生成所有枚举的C#代码文件
        /// </summary>
        public Dictionary<string, string> GenerateAllCSharpEnums(List<EnumDefinitionDto> enums, string namespaceName = "SmartAbp.Domain.Enums")
        {
            var files = new Dictionary<string, string>();

            foreach (var enumDef in enums)
            {
                var fileName = $"{enumDef.Name}.cs";
                var code = GenerateCSharpEnum(enumDef, namespaceName);
                files[fileName] = code;

                // 也生成扩展方法（可选）
                var extensionsFileName = $"{enumDef.Name}Extensions.cs";
                var extensionsCode = GenerateCSharpEnumExtensions(enumDef, namespaceName);
                files[extensionsFileName] = extensionsCode;
            }

            return files;
        }

        /// <summary>
        /// 批量生成所有枚举的TypeScript代码文件
        /// </summary>
        public Dictionary<string, string> GenerateAllTypeScriptEnums(List<EnumDefinitionDto> enums)
        {
            var files = new Dictionary<string, string>();

            // 方案1: 每个枚举一个文件
            foreach (var enumDef in enums)
            {
                var fileName = $"{ToKebabCase(enumDef.Name)}.enum.ts";
                var code = GenerateTypeScriptEnum(enumDef);
                files[fileName] = code;
            }

            // 方案2: 也可以生成一个汇总的index.ts文件
            var indexCode = GenerateTypeScriptEnumIndex(enums);
            files["index.ts"] = indexCode;

            return files;
        }

        /// <summary>
        /// 生成TypeScript枚举的index.ts汇总文件
        /// </summary>
        private string GenerateTypeScriptEnumIndex(List<EnumDefinitionDto> enums)
        {
            var sb = new StringBuilder();

            sb.AppendLine("/**");
            sb.AppendLine(" * 枚举类型汇总");
            sb.AppendLine(" * 自动生成，请勿手动修改");
            sb.AppendLine(" */");
            sb.AppendLine();

            // 导出所有枚举
            foreach (var enumDef in enums)
            {
                var fileName = ToKebabCase(enumDef.Name);
                sb.AppendLine($"export * from './{fileName}.enum'");
            }

            return sb.ToString();
        }

        /// <summary>
        /// 将值转换为int（兼容多种类型）
        /// </summary>
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

        /// <summary>
        /// 将PascalCase转换为kebab-case
        /// </summary>
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
    /// 枚举定义DTO（新增）
    /// </summary>
    public class EnumDefinitionDto
    {
        public string Name { get; set; } = default!;
        public string DisplayName { get; set; } = default!;
        public string Description { get; set; } = default!;
        public List<EnumValueDto> Values { get; set; } = new();
    }
}

