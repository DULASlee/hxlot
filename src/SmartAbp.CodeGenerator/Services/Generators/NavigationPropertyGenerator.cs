using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SmartAbp.CodeGenerator.Services.V9;

namespace SmartAbp.CodeGenerator.Services.Generators
{
    /// <summary>
    /// 🔥 P0-2: 导航属性生成器
    /// 支持生成实体间的导航属性（Parent/Children/SubscriptionPlan等）
    /// </summary>
    public class NavigationPropertyGenerator
    {
        /// <summary>
        /// 生成导航属性代码（C#）
        /// </summary>
        public string GenerateNavigationProperty(EntityRelationshipDto relationship, string indent = "        ")
        {
            var sb = new StringBuilder();

            // 生成注释
            sb.AppendLine($"{indent}/// <summary>");
            sb.AppendLine($"{indent}/// {relationship.DisplayName ?? relationship.Name}");
            sb.AppendLine($"{indent}/// </summary>");

            // 生成ForeignKey特性（如果有外键）
            if (!string.IsNullOrEmpty(relationship.ForeignKeyProperty))
            {
                sb.AppendLine($"{indent}[ForeignKey(nameof({relationship.ForeignKeyProperty}))]");
            }

            // 根据关系类型生成属性
            switch (relationship.Type)
            {
                case "OneToMany":
                    // 一对多关系（如：Tenant.Children）
                    sb.AppendLine($"{indent}public virtual List<{relationship.TargetEntity}> {relationship.TargetNavigationProperty} {{ get; set; }} = new();");
                    break;

                case "ManyToOne":
                    // 多对一关系（如：Tenant.Parent）
                    var isRequired = relationship.IsRequired || relationship.IsForeignKeyRequired;
                    var nullableSymbol = isRequired ? "" : "?";
                    sb.AppendLine($"{indent}public virtual {relationship.TargetEntity}{nullableSymbol} {relationship.SourceNavigationProperty} {{ get; set; }}");
                    break;

                case "OneToOne":
                    // 一对一关系
                    var isOneToOneRequired = relationship.IsRequired;
                    var oneToOneNullable = isOneToOneRequired ? "" : "?";
                    sb.AppendLine($"{indent}public virtual {relationship.TargetEntity}{oneToOneNullable} {relationship.SourceNavigationProperty} {{ get; set; }}");
                    break;

                case "ManyToMany":
                    // 多对多关系
                    sb.AppendLine($"{indent}public virtual List<{relationship.TargetEntity}> {relationship.TargetNavigationProperty} {{ get; set; }} = new();");
                    break;

                default:
                    throw new NotSupportedException($"不支持的关系类型: {relationship.Type}");
            }

            return sb.ToString();
        }

        /// <summary>
        /// 生成外键属性代码（C#）
        /// </summary>
        public string GenerateForeignKeyProperty(EntityRelationshipDto relationship, string indent = "        ")
        {
            if (string.IsNullOrEmpty(relationship.ForeignKeyProperty))
                return string.Empty;

            var sb = new StringBuilder();

            // 生成注释
            sb.AppendLine($"{indent}/// <summary>");
            sb.AppendLine($"{indent}/// 外键：{relationship.DisplayName ?? relationship.Name}");
            sb.AppendLine($"{indent}/// </summary>");

            // 生成属性
            var isRequired = relationship.IsRequired || relationship.IsForeignKeyRequired;
            var nullableSymbol = isRequired ? "" : "?";
            sb.AppendLine($"{indent}public Guid{nullableSymbol} {relationship.ForeignKeyProperty} {{ get; set; }}");

            return sb.ToString();
        }

        /// <summary>
        /// 生成InverseProperty特性（用于反向导航）
        /// </summary>
        public string GenerateInversePropertyAttribute(string propertyName, string indent = "        ")
        {
            return $"{indent}[InverseProperty(nameof({propertyName}))]";
        }

        /// <summary>
        /// 为实体生成所有导航属性
        /// </summary>
        public EntityNavigationCode GenerateEntityNavigationProperties(EnhancedEntityModelDto entity)
        {
            var result = new EntityNavigationCode
            {
                EntityName = entity.Name
            };

            if (entity.Relationships == null || !entity.Relationships.Any())
                return result;

            // 分组处理关系
            foreach (var relationship in entity.Relationships)
            {
                // 生成外键属性
                if (!string.IsNullOrEmpty(relationship.ForeignKeyProperty))
                {
                    var fkCode = GenerateForeignKeyProperty(relationship);
                    if (!string.IsNullOrEmpty(fkCode))
                    {
                        result.ForeignKeyProperties.Add(fkCode);
                    }
                }

                // 生成导航属性
                var navCode = GenerateNavigationProperty(relationship);
                if (!string.IsNullOrEmpty(navCode))
                {
                    result.NavigationProperties.Add(navCode);
                }

                // 记录需要的Using语句
                if (relationship.Type == "ManyToMany" && !string.IsNullOrEmpty(relationship.JoinTableName))
                {
                    result.RequiredUsings.Add("System.ComponentModel.DataAnnotations.Schema");
                }
            }

            // 确保有ForeignKey Attribute就需要Using
            if (result.NavigationProperties.Any(p => p.Contains("[ForeignKey")))
            {
                result.RequiredUsings.Add("System.ComponentModel.DataAnnotations.Schema");
            }

            return result;
        }

        /// <summary>
        /// 生成EF Core Fluent API配置（用于复杂关系）
        /// </summary>
        public string GenerateFluentApiConfiguration(EntityRelationshipDto relationship, string entityName)
        {
            var sb = new StringBuilder();

            switch (relationship.Type)
            {
                case "OneToMany":
                    sb.AppendLine($"            builder.HasMany(e => e.{relationship.TargetNavigationProperty})");
                    sb.AppendLine($"                   .WithOne(e => e.{relationship.SourceNavigationProperty})");

                    if (!string.IsNullOrEmpty(relationship.ForeignKeyProperty))
                    {
                        sb.AppendLine($"                   .HasForeignKey(e => e.{relationship.ForeignKeyProperty})");
                    }

                    sb.AppendLine($"                   .OnDelete(DeleteBehavior.{GetDeleteBehavior(relationship)});");
                    break;

                case "ManyToOne":
                    sb.AppendLine($"            builder.HasOne(e => e.{relationship.SourceNavigationProperty})");
                    sb.AppendLine($"                   .WithMany()");

                    if (!string.IsNullOrEmpty(relationship.ForeignKeyProperty))
                    {
                        sb.AppendLine($"                   .HasForeignKey(e => e.{relationship.ForeignKeyProperty})");
                    }

                    sb.AppendLine($"                   .OnDelete(DeleteBehavior.{GetDeleteBehavior(relationship)});");
                    break;

                case "OneToOne":
                    sb.AppendLine($"            builder.HasOne(e => e.{relationship.SourceNavigationProperty})");
                    sb.AppendLine($"                   .WithOne()");

                    if (!string.IsNullOrEmpty(relationship.ForeignKeyProperty))
                    {
                        sb.AppendLine($"                   .HasForeignKey<{entityName}>(e => e.{relationship.ForeignKeyProperty})");
                    }

                    sb.AppendLine($"                   .OnDelete(DeleteBehavior.{GetDeleteBehavior(relationship)});");
                    break;

                case "ManyToMany":
                    sb.AppendLine($"            builder.HasMany(e => e.{relationship.TargetNavigationProperty})");
                    sb.AppendLine($"                   .WithMany()");

                    if (!string.IsNullOrEmpty(relationship.JoinTableName))
                    {
                        sb.AppendLine($"                   .UsingEntity(j => j.ToTable(\"{relationship.JoinTableName}\"));");
                    }
                    break;
            }

            return sb.ToString();
        }

        /// <summary>
        /// 生成完整的EF Core EntityTypeConfiguration类
        /// </summary>
        public string GenerateEntityTypeConfiguration(EnhancedEntityModelDto entity, string namespaceName = "SmartAbp.EntityFrameworkCore.Configurations")
        {
            if (entity.Relationships == null || !entity.Relationships.Any())
                return string.Empty;

            var sb = new StringBuilder();

            // Using语句
            sb.AppendLine("using System;");
            sb.AppendLine("using Microsoft.EntityFrameworkCore;");
            sb.AppendLine("using Microsoft.EntityFrameworkCore.Metadata.Builders;");
            sb.AppendLine($"using SmartAbp.Domain;");
            sb.AppendLine();

            // 命名空间
            sb.AppendLine($"namespace {namespaceName}");
            sb.AppendLine("{");

            // 配置类
            sb.AppendLine($"    /// <summary>");
            sb.AppendLine($"    /// {entity.DisplayName ?? entity.Name} EF Core配置");
            sb.AppendLine($"    /// </summary>");
            sb.AppendLine($"    public class {entity.Name}Configuration : IEntityTypeConfiguration<{entity.Name}>");
            sb.AppendLine("    {");
            sb.AppendLine($"        public void Configure(EntityTypeBuilder<{entity.Name}> builder)");
            sb.AppendLine("        {");

            // 表名配置
            if (!string.IsNullOrEmpty(entity.TableName))
            {
                sb.AppendLine($"            builder.ToTable(\"{entity.TableName}\");");
                sb.AppendLine();
            }

            // 生成所有关系配置
            foreach (var relationship in entity.Relationships)
            {
                var config = GenerateFluentApiConfiguration(relationship, entity.Name);
                if (!string.IsNullOrEmpty(config))
                {
                    sb.AppendLine(config);
                    sb.AppendLine();
                }
            }

            sb.AppendLine("        }");
            sb.AppendLine("    }");
            sb.AppendLine("}");

            return sb.ToString();
        }

        /// <summary>
        /// 生成TypeScript导航属性类型
        /// </summary>
        public string GenerateTypeScriptNavigationProperty(EntityRelationshipDto relationship, string indent = "  ")
        {
            var sb = new StringBuilder();

            // 生成注释
            sb.AppendLine($"{indent}/** {relationship.DisplayName ?? relationship.Name} */");

            // 根据关系类型生成属性
            var propertyName = ToCamelCase(relationship.SourceNavigationProperty ?? relationship.TargetNavigationProperty);

            switch (relationship.Type)
            {
                case "OneToMany":
                    sb.Append($"{indent}{propertyName}?: {relationship.TargetEntity}Dto[]");
                    break;

                case "ManyToOne":
                case "OneToOne":
                    var isRequired = relationship.IsRequired || relationship.IsForeignKeyRequired;
                    var optionalSymbol = isRequired ? "" : "?";
                    sb.Append($"{indent}{propertyName}{optionalSymbol}: {relationship.TargetEntity}Dto");
                    break;

                case "ManyToMany":
                    sb.Append($"{indent}{propertyName}?: {relationship.TargetEntity}Dto[]");
                    break;
            }

            return sb.ToString();
        }

        /// <summary>
        /// 获取EF Core DeleteBehavior
        /// </summary>
        private string GetDeleteBehavior(EntityRelationshipDto relationship)
        {
            if (relationship.OnDeleteBehavior == RelationshipDeleteBehavior.Cascade)
                return "Cascade";
            if (relationship.OnDeleteBehavior == RelationshipDeleteBehavior.Restrict)
                return "Restrict";
            if (relationship.OnDeleteBehavior == RelationshipDeleteBehavior.SetNull)
                return "SetNull";
            if (relationship.OnDeleteBehavior == RelationshipDeleteBehavior.NoAction)
                return "NoAction";

            // 默认：如果级联删除开启则Cascade，否则Restrict
            return relationship.CascadeDelete ? "Cascade" : "Restrict";
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
    }

    /// <summary>
    /// 实体导航属性代码结果
    /// </summary>
    public class EntityNavigationCode
    {
        public string EntityName { get; set; } = default!;
        public List<string> ForeignKeyProperties { get; set; } = new();
        public List<string> NavigationProperties { get; set; } = new();
        public List<string> RequiredUsings { get; set; } = new();
    }
}

