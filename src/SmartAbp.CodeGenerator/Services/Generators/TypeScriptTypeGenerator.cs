using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SmartAbp.CodeGenerator.Services.V9;

namespace SmartAbp.CodeGenerator.Services.Generators
{
    /// <summary>
    /// 🔥 P0-3.1: TypeScript类型生成器
    /// 生成前端TypeScript接口、类型定义、DTO等
    /// </summary>
    public class TypeScriptTypeGenerator
    {
        private readonly NavigationPropertyGenerator _navGenerator;

        public TypeScriptTypeGenerator()
        {
            _navGenerator = new NavigationPropertyGenerator();
        }

        /// <summary>
        /// 生成实体DTO接口
        /// </summary>
        public string GenerateEntityDto(EnhancedEntityModelDto entity)
        {
            var sb = new StringBuilder();

            // 导入语句
            GenerateImports(entity, sb);
            sb.AppendLine();

            // 接口注释
            sb.AppendLine("/**");
            sb.AppendLine($" * {entity.DisplayName ?? entity.Name} DTO");
            if (!string.IsNullOrEmpty(entity.Description))
            {
                sb.AppendLine($" * {entity.Description}");
            }
            sb.AppendLine(" */");

            // 接口定义
            sb.AppendLine($"export interface {entity.Name}Dto {{");

            // ID属性（审计实体的基础属性）
            if (entity.IsAudited)
            {
                sb.AppendLine("  /** 主键ID */");
                sb.AppendLine("  id: string");
                sb.AppendLine();
            }

            // 实体属性
            foreach (var property in entity.Properties)
            {
                if (property.Name == "Id") continue; // 已在上面处理

                // 属性注释
                if (!string.IsNullOrEmpty(property.Description) || !string.IsNullOrEmpty(property.DisplayName))
                {
                    var comment = !string.IsNullOrEmpty(property.Description)
                        ? property.Description
                        : property.DisplayName;
                    sb.AppendLine($"  /** {comment} */");
                }

                // 属性定义
                var tsType = MapCSharpTypeToTypeScript(property);
                var optionalSymbol = property.IsRequired ? "" : "?";
                sb.AppendLine($"  {ToCamelCase(property.Name)}{optionalSymbol}: {tsType}");
                sb.AppendLine();
            }

            // 导航属性
            if (entity.Relationships != null && entity.Relationships.Any())
            {
                sb.AppendLine("  // 导航属性");
                foreach (var relationship in entity.Relationships)
                {
                    var navProperty = _navGenerator.GenerateTypeScriptNavigationProperty(relationship, "  ");
                    sb.AppendLine(navProperty);
                    sb.AppendLine();
                }
            }

            // 审计属性
            if (entity.IsAudited)
            {
                sb.AppendLine("  // 审计字段");
                sb.AppendLine("  /** 创建时间 */");
                sb.AppendLine("  creationTime?: string");
                sb.AppendLine();
                sb.AppendLine("  /** 创建人ID */");
                sb.AppendLine("  creatorId?: string");
                sb.AppendLine();
                sb.AppendLine("  /** 最后修改时间 */");
                sb.AppendLine("  lastModificationTime?: string");
                sb.AppendLine();
                sb.AppendLine("  /** 最后修改人ID */");
                sb.AppendLine("  lastModifierId?: string");
                sb.AppendLine();
            }

            // 软删除属性
            if (entity.IsSoftDelete)
            {
                sb.AppendLine("  /** 是否已删除 */");
                sb.AppendLine("  isDeleted?: boolean");
                sb.AppendLine();
                sb.AppendLine("  /** 删除时间 */");
                sb.AppendLine("  deletionTime?: string");
                sb.AppendLine();
                sb.AppendLine("  /** 删除人ID */");
                sb.AppendLine("  deleterId?: string");
                sb.AppendLine();
            }

            // 多租户属性
            if (entity.IsMultiTenant)
            {
                sb.AppendLine("  /** 租户ID */");
                sb.AppendLine("  tenantId?: string");
                sb.AppendLine();
            }

            sb.AppendLine("}");

            return sb.ToString();
        }

        /// <summary>
        /// 生成CreateDto（用于新增）
        /// </summary>
        public string GenerateCreateDto(EnhancedEntityModelDto entity)
        {
            var sb = new StringBuilder();

            // 导入语句
            GenerateImports(entity, sb, isCreate: true);
            sb.AppendLine();

            // 接口注释
            sb.AppendLine("/**");
            sb.AppendLine($" * 创建{entity.DisplayName ?? entity.Name}输入");
            sb.AppendLine(" */");

            // 接口定义
            sb.AppendLine($"export interface Create{entity.Name}Dto {{");

            // 只包含必需和非只读属性
            foreach (var property in entity.Properties)
            {
                if (property.Name == "Id") continue; // 创建时不需要ID
                if (IsAuditProperty(property.Name)) continue; // 跳过审计属性
                if (IsSoftDeleteProperty(property.Name)) continue; // 跳过软删除属性

                // 属性注释
                if (!string.IsNullOrEmpty(property.Description) || !string.IsNullOrEmpty(property.DisplayName))
                {
                    var comment = !string.IsNullOrEmpty(property.Description)
                        ? property.Description
                        : property.DisplayName;
                    sb.AppendLine($"  /** {comment} */");
                }

                // 属性定义
                var tsType = MapCSharpTypeToTypeScript(property);
                var optionalSymbol = property.IsRequired ? "" : "?";
                sb.AppendLine($"  {ToCamelCase(property.Name)}{optionalSymbol}: {tsType}");
                sb.AppendLine();
            }

            // 外键属性（来自关系）
            if (entity.Relationships != null && entity.Relationships.Any())
            {
                foreach (var relationship in entity.Relationships.Where(r => !string.IsNullOrEmpty(r.ForeignKeyProperty)))
                {
                    sb.AppendLine($"  /** {relationship.DisplayName ?? relationship.Name}ID */");
                    var optionalSymbol = relationship.IsRequired ? "" : "?";
                    sb.AppendLine($"  {ToCamelCase(relationship.ForeignKeyProperty)}{optionalSymbol}: string");
                    sb.AppendLine();
                }
            }

            sb.AppendLine("}");

            return sb.ToString();
        }

        /// <summary>
        /// 生成UpdateDto（用于更新）
        /// </summary>
        public string GenerateUpdateDto(EnhancedEntityModelDto entity)
        {
            var sb = new StringBuilder();

            // 导入语句
            GenerateImports(entity, sb, isUpdate: true);
            sb.AppendLine();

            // 接口注释
            sb.AppendLine("/**");
            sb.AppendLine($" * 更新{entity.DisplayName ?? entity.Name}输入");
            sb.AppendLine(" */");

            // 接口定义
            sb.AppendLine($"export interface Update{entity.Name}Dto {{");

            // 所有属性都是可选的（部分更新）
            foreach (var property in entity.Properties)
            {
                if (property.Name == "Id") continue;
                if (IsAuditProperty(property.Name)) continue;
                if (IsSoftDeleteProperty(property.Name)) continue;

                // 属性注释
                if (!string.IsNullOrEmpty(property.Description) || !string.IsNullOrEmpty(property.DisplayName))
                {
                    var comment = !string.IsNullOrEmpty(property.Description)
                        ? property.Description
                        : property.DisplayName;
                    sb.AppendLine($"  /** {comment} */");
                }

                // 属性定义（全部可选）
                var tsType = MapCSharpTypeToTypeScript(property);
                sb.AppendLine($"  {ToCamelCase(property.Name)}?: {tsType}");
                sb.AppendLine();
            }

            // 外键属性（来自关系）
            if (entity.Relationships != null && entity.Relationships.Any())
            {
                foreach (var relationship in entity.Relationships.Where(r => !string.IsNullOrEmpty(r.ForeignKeyProperty)))
                {
                    sb.AppendLine($"  /** {relationship.DisplayName ?? relationship.Name}ID */");
                    sb.AppendLine($"  {ToCamelCase(relationship.ForeignKeyProperty)}?: string");
                    sb.AppendLine();
                }
            }

            sb.AppendLine("}");

            return sb.ToString();
        }

        /// <summary>
        /// 生成查询参数DTO
        /// </summary>
        public string GenerateQueryDto(EnhancedEntityModelDto entity)
        {
            var sb = new StringBuilder();

            // 接口注释
            sb.AppendLine("/**");
            sb.AppendLine($" * {entity.DisplayName ?? entity.Name}查询参数");
            sb.AppendLine(" */");

            // 接口定义
            sb.AppendLine($"export interface {entity.Name}QueryDto {{");
            sb.AppendLine("  /** 搜索关键词 */");
            sb.AppendLine("  keyword?: string");
            sb.AppendLine();

            // 常用字符串字段作为查询条件
            var stringProps = entity.Properties.Where(p =>
                p.Type == "string" &&
                !IsAuditProperty(p.Name) &&
                !IsSoftDeleteProperty(p.Name)
            ).Take(5); // 最多5个

            foreach (var prop in stringProps)
            {
                sb.AppendLine($"  /** {prop.DisplayName ?? prop.Name} */");
                sb.AppendLine($"  {ToCamelCase(prop.Name)}?: string");
                sb.AppendLine();
            }

            // 分页参数
            sb.AppendLine("  /** 跳过数量 */");
            sb.AppendLine("  skipCount?: number");
            sb.AppendLine();
            sb.AppendLine("  /** 最大结果数 */");
            sb.AppendLine("  maxResultCount?: number");
            sb.AppendLine();
            sb.AppendLine("  /** 排序字段 */");
            sb.AppendLine("  sorting?: string");
            sb.AppendLine();

            sb.AppendLine("}");

            return sb.ToString();
        }

        /// <summary>
        /// 生成完整的TypeScript类型文件（包含所有DTO）
        /// </summary>
        public string GenerateCompleteTypeFile(EnhancedEntityModelDto entity)
        {
            var sb = new StringBuilder();

            // 文件头注释
            sb.AppendLine("/**");
            sb.AppendLine($" * {entity.DisplayName ?? entity.Name} 类型定义");
            sb.AppendLine(" * 自动生成，请勿手动修改");
            sb.AppendLine(" */");
            sb.AppendLine();

            // 导入枚举（如果有）
            var enumProperties = entity.Properties.Where(p => p.EnumValues != null && p.EnumValues.Any()).ToList();
            if (enumProperties.Any())
            {
                foreach (var prop in enumProperties)
                {
                    sb.AppendLine($"import {{ {prop.Type}, {prop.Type}Helper }} from '../enums/{ToKebabCase(prop.Type)}.enum'");
                }
                sb.AppendLine();
            }

            // 生成主DTO
            sb.AppendLine(GenerateEntityDto(entity));
            sb.AppendLine();

            // 生成CreateDto
            sb.AppendLine(GenerateCreateDto(entity));
            sb.AppendLine();

            // 生成UpdateDto
            sb.AppendLine(GenerateUpdateDto(entity));
            sb.AppendLine();

            // 生成QueryDto
            sb.AppendLine(GenerateQueryDto(entity));

            return sb.ToString();
        }

        /// <summary>
        /// 批量生成所有实体的TypeScript类型文件
        /// </summary>
        public Dictionary<string, string> GenerateAllTypeFiles(List<EnhancedEntityModelDto> entities)
        {
            var files = new Dictionary<string, string>();

            foreach (var entity in entities)
            {
                var fileName = $"{ToKebabCase(entity.Name)}.types.ts";
                var code = GenerateCompleteTypeFile(entity);
                files[fileName] = code;
            }

            // 生成index.ts汇总文件
            var indexCode = GenerateTypeIndexFile(entities);
            files["index.ts"] = indexCode;

            return files;
        }

        /// <summary>
        /// 生成index.ts汇总文件
        /// </summary>
        private string GenerateTypeIndexFile(List<EnhancedEntityModelDto> entities)
        {
            var sb = new StringBuilder();

            sb.AppendLine("/**");
            sb.AppendLine(" * 类型定义汇总");
            sb.AppendLine(" * 自动生成，请勿手动修改");
            sb.AppendLine(" */");
            sb.AppendLine();

            // 导出所有实体类型
            foreach (var entity in entities)
            {
                var fileName = ToKebabCase(entity.Name);
                sb.AppendLine($"export * from './{fileName}.types'");
            }

            return sb.ToString();
        }

        /// <summary>
        /// 生成导入语句
        /// </summary>
        private void GenerateImports(EnhancedEntityModelDto entity, StringBuilder sb, bool isCreate = false, bool isUpdate = false)
        {
            // 导入枚举类型
            var enumProperties = entity.Properties.Where(p => p.EnumValues != null && p.EnumValues.Any()).ToList();
            if (enumProperties.Any())
            {
                foreach (var prop in enumProperties)
                {
                    sb.AppendLine($"import {{ {prop.Type} }} from '../enums/{ToKebabCase(prop.Type)}.enum'");
                }
            }
        }

        /// <summary>
        /// 将C#类型映射到TypeScript类型
        /// </summary>
        private string MapCSharpTypeToTypeScript(EntityPropertyDto property)
        {
            // 如果有枚举值，使用枚举类型
            if (property.EnumValues != null && property.EnumValues.Any())
            {
                return property.Type;
            }

            // 基础类型映射
            return property.Type switch
            {
                "string" => "string",
                "int" => "number",
                "long" => "number",
                "decimal" => "number",
                "double" => "number",
                "float" => "number",
                "bool" => "boolean",
                "DateTime" => "string", // ISO 8601字符串
                "DateTimeOffset" => "string",
                "Guid" => "string",
                "byte[]" => "string", // Base64字符串
                _ => "any" // 未知类型使用any
            };
        }

        /// <summary>
        /// 判断是否为审计属性
        /// </summary>
        private bool IsAuditProperty(string name)
        {
            var auditProps = new[] { "CreationTime", "CreatorId", "LastModificationTime", "LastModifierId" };
            return auditProps.Contains(name);
        }

        /// <summary>
        /// 判断是否为软删除属性
        /// </summary>
        private bool IsSoftDeleteProperty(string name)
        {
            var softDeleteProps = new[] { "IsDeleted", "DeletionTime", "DeleterId" };
            return softDeleteProps.Contains(name);
        }

        /// <summary>
        /// 将PascalCase转换为camelCase
        /// </summary>
        private string ToCamelCase(string text)
        {
            if (string.IsNullOrEmpty(text))
                return text;

            return char.ToLower(text[0]) + text.Substring(1);
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
}

