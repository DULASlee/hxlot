using Microsoft.Extensions.Logging;
using SmartAbp.CodeGenerator.Dto;
using SmartAbp.CodeGenerator.Core.Types;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;

namespace SmartAbp.CodeGenerator.Core.Templates;

/// <summary>
/// 简单可靠的变量替换器
/// 专注于务实可靠，不追求复杂的表达式解析
/// </summary>
public class SimpleVariableReplacer
{
    private readonly ILogger<SimpleVariableReplacer> _logger;
    private readonly CompleteTypeMapper _typeMapper;

    public SimpleVariableReplacer(
        ILogger<SimpleVariableReplacer> logger,
        CompleteTypeMapper typeMapper)
    {
        _logger = logger;
        _typeMapper = typeMapper;
    }

    /// <summary>
    /// 替换模板中的变量
    /// </summary>
    /// <param name="template">模板内容</param>
    /// <param name="metadata">模块元数据</param>
    /// <param name="entity">实体数据（可选）</param>
    /// <returns>替换后的内容</returns>
    public string ReplaceVariables(string template, ModuleMetadataDto metadata, EntityModelDto? entity = null)
    {
        if (string.IsNullOrEmpty(template))
        {
            return string.Empty;
        }

        try
        {
            var result = template;

            // 1. 替换模块级变量
            result = ReplaceModuleVariables(result, metadata);

            // 2. 替换实体级变量（如果有）
            if (entity != null)
            {
                result = ReplaceEntityVariables(result, entity);
            }

            // 3. 替换属性相关变量（如果有实体）
            if (entity?.Properties != null && entity.Properties.Any())
            {
                result = ReplacePropertyVariables(result, entity.Properties);
            }

            // 4. 替换常用格式化变量
            result = ReplaceFormattingVariables(result);

            // 5. 验证是否还有未替换的变量
            ValidateNoUnresolvedVariables(result);

            _logger.LogDebug("变量替换完成，模板长度: {Length}", result.Length);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "变量替换失败，模板前100字符: {TemplatePreview}", 
                template.Length > 100 ? template.Substring(0, 100) + "..." : template);
            throw new TemplateException($"模板变量替换失败: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// 替换模块级变量
    /// </summary>
    private string ReplaceModuleVariables(string template, ModuleMetadataDto metadata)
    {
        var replacements = new Dictionary<string, string>
        {
            ["{{ModuleName}}"] = metadata.Name ?? "DefaultModule",
            ["{{ModuleNameLower}}"] = (metadata.Name ?? "DefaultModule").ToLowerInvariant(),
            ["{{ModuleNameCamel}}"] = ToCamelCase(metadata.Name ?? "DefaultModule"),
            ["{{ModuleNamespace}}"] = metadata.Namespace ?? "SmartAbp",
            ["{{ModuleDescription}}"] = metadata.Description ?? $"{metadata.Name} 模块",
            ["{{ModuleDisplayName}}"] = metadata.DisplayName ?? metadata.Name ?? "Default Module",
            ["{{Author}}"] = metadata.Author ?? "SmartAbp",
            ["{{CreateDate}}"] = DateTime.Now.ToString("yyyy-MM-dd"),
            ["{{CreateDateTime}}"] = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            ["{{Year}}"] = DateTime.Now.Year.ToString(),
        };

        return ApplyReplacements(template, replacements);
    }

    /// <summary>
    /// 替换实体级变量
    /// </summary>
    private string ReplaceEntityVariables(string template, EntityModelDto entity)
    {
        var replacements = new Dictionary<string, string>
        {
            ["{{EntityName}}"] = entity.Name,
            ["{{EntityNameLower}}"] = entity.Name.ToLowerInvariant(),
            ["{{EntityNameCamel}}"] = ToCamelCase(entity.Name),
            ["{{EntityNamePlural}}"] = GetPluralName(entity.Name),
            ["{{EntityNamePluralLower}}"] = GetPluralName(entity.Name).ToLowerInvariant(),
            ["{{EntityNamePluralCamel}}"] = ToCamelCase(GetPluralName(entity.Name)),
            ["{{EntityDescription}}"] = entity.Description ?? $"{entity.Name} 实体",
            ["{{EntityDisplayName}}"] = entity.DisplayName ?? entity.Name,
            ["{{EntityTableName}}"] = entity.TableName ?? entity.Name,
            ["{{EntityPrimaryKey}}"] = GetPrimaryKeyProperty(entity.Properties)?.Name ?? "Id",
            ["{{EntityPrimaryKeyType}}"] = GetCSharpType(GetPrimaryKeyProperty(entity.Properties)?.Type ?? "Guid"),
        };

        return ApplyReplacements(template, replacements);
    }

    /// <summary>
    /// 替换属性相关变量
    /// </summary>
    private string ReplacePropertyVariables(string template, List<PropertyModelDto> properties)
    {
        var sb = new StringBuilder();

        // 生成属性声明
        var propertyDeclarations = GeneratePropertyDeclarations(properties);
        template = template.Replace("{{PropertyDeclarations}}", propertyDeclarations);

        // 生成构造函数参数
        var constructorParams = GenerateConstructorParameters(properties);
        template = template.Replace("{{ConstructorParameters}}", constructorParams);

        // 生成构造函数赋值
        var constructorAssignments = GenerateConstructorAssignments(properties);
        template = template.Replace("{{ConstructorAssignments}}", constructorAssignments);

        // 生成 DTO 属性
        var dtoProperties = GenerateDtoProperties(properties);
        template = template.Replace("{{DtoProperties}}", dtoProperties);

        // 生成创建 DTO 属性
        var createDtoProperties = GenerateCreateDtoProperties(properties);
        template = template.Replace("{{CreateDtoProperties}}", createDtoProperties);

        // 生成更新 DTO 属性
        var updateDtoProperties = GenerateUpdateDtoProperties(properties);
        template = template.Replace("{{UpdateDtoProperties}}", updateDtoProperties);

        return template;
    }

    /// <summary>
    /// 生成属性声明
    /// </summary>
    private string GeneratePropertyDeclarations(List<PropertyModelDto> properties)
    {
        var declarations = properties.Select(p => 
        {
            var dataAnnotations = GenerateDataAnnotations(p);
            var propertyType = GetCSharpType(p.Type);
            
            return $"{dataAnnotations}    public {propertyType} {p.Name} {{ get; set; }}";
        });

        return string.Join("\n\n", declarations);
    }

    /// <summary>
    /// 生成数据注解
    /// </summary>
    private string GenerateDataAnnotations(PropertyModelDto property)
    {
        var annotations = new List<string>();

        if (property.IsRequired && !IsValueType(property.Type))
        {
            annotations.Add("    [Required]");
        }

        if (!string.IsNullOrEmpty(property.MaxLength) && int.TryParse(property.MaxLength, out var maxLength))
        {
            annotations.Add($"    [MaxLength({maxLength})]");
        }

        if (!string.IsNullOrEmpty(property.DisplayName))
        {
            annotations.Add($"    [Display(Name = \"{property.DisplayName}\")]");
        }

        if (!string.IsNullOrEmpty(property.Description))
        {
            annotations.Add($"    /// <summary>");
            annotations.Add($"    /// {property.Description}");
            annotations.Add($"    /// </summary>");
        }

        return annotations.Any() ? string.Join("\n", annotations) + "\n" : "";
    }

    /// <summary>
    /// 生成构造函数参数
    /// </summary>
    private string GenerateConstructorParameters(List<PropertyModelDto> properties)
    {
        var requiredProps = properties.Where(p => p.IsRequired && !IsKeyProperty(p)).ToList();
        
        if (!requiredProps.Any())
        {
            return "";
        }

        var parameters = requiredProps.Select(p => 
            $"{GetCSharpType(p.Type)} {ToCamelCase(p.Name)}");

        return string.Join(", ", parameters);
    }

    /// <summary>
    /// 生成构造函数赋值
    /// </summary>
    private string GenerateConstructorAssignments(List<PropertyModelDto> properties)
    {
        var requiredProps = properties.Where(p => p.IsRequired && !IsKeyProperty(p)).ToList();
        
        if (!requiredProps.Any())
        {
            return "";
        }

        var assignments = requiredProps.Select(p => 
            $"        {p.Name} = {ToCamelCase(p.Name)};");

        return string.Join("\n", assignments);
    }

    /// <summary>
    /// 生成 DTO 属性
    /// </summary>
    private string GenerateDtoProperties(List<PropertyModelDto> properties)
    {
        var dtoProps = properties.Select(p => 
            $"    public {GetCSharpType(p.Type)} {p.Name} {{ get; set; }}");

        return string.Join("\n", dtoProps);
    }

    /// <summary>
    /// 生成创建 DTO 属性（排除 Id 和自动属性）
    /// </summary>
    private string GenerateCreateDtoProperties(List<PropertyModelDto> properties)
    {
        var createProps = properties
            .Where(p => !IsKeyProperty(p) && !IsAuditProperty(p.Name))
            .Select(p => 
            {
                var dataAnnotations = GenerateDataAnnotations(p);
                return $"{dataAnnotations}    public {GetCSharpType(p.Type)} {p.Name} {{ get; set; }}";
            });

        return string.Join("\n\n", createProps);
    }

    /// <summary>
    /// 生成更新 DTO 属性（排除 Id 和创建时间）
    /// </summary>
    private string GenerateUpdateDtoProperties(List<PropertyModelDto> properties)
    {
        var updateProps = properties
            .Where(p => !IsKeyProperty(p) && !IsCreationAuditProperty(p.Name))
            .Select(p => 
            {
                var dataAnnotations = GenerateDataAnnotations(p);
                return $"{dataAnnotations}    public {GetCSharpType(p.Type)} {p.Name} {{ get; set; }}";
            });

        return string.Join("\n\n", updateProps);
    }

    /// <summary>
    /// 替换常用格式化变量
    /// </summary>
    private string ReplaceFormattingVariables(string template)
    {
        // 处理一些常用的格式化占位符
        template = template.Replace("{{NewGuid}}", "Guid.NewGuid()");
        template = template.Replace("{{UtcNow}}", "DateTime.UtcNow");
        template = template.Replace("{{Now}}", "DateTime.Now");
        
        return template;
    }

    /// <summary>
    /// 应用替换字典
    /// </summary>
    private string ApplyReplacements(string template, Dictionary<string, string> replacements)
    {
        var result = template;

        foreach (var replacement in replacements)
        {
            result = result.Replace(replacement.Key, replacement.Value);
        }

        return result;
    }

    /// <summary>
    /// 验证没有未解析的变量
    /// </summary>
    private void ValidateNoUnresolvedVariables(string result)
    {
        var unresolvedMatches = Regex.Matches(result, @"\{\{([^}]+)\}\}");
        
        if (unresolvedMatches.Count > 0)
        {
            var unresolvedList = unresolvedMatches.Cast<Match>()
                .Select(m => m.Value)
                .Distinct()
                .ToList();

            var errorMessage = $"模板包含未解析的变量: {string.Join(", ", unresolvedList)}。" +
                              $"请检查变量名是否正确，或联系开发人员添加支持。";

            throw new TemplateException(errorMessage);
        }
    }

    #region 辅助方法

    /// <summary>
    /// 转换为驼峰命名
    /// </summary>
    private static string ToCamelCase(string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        if (input.Length == 1)
            return input.ToLowerInvariant();

        return char.ToLowerInvariant(input[0]) + input.Substring(1);
    }

    /// <summary>
    /// 获取复数形式（简单实现）
    /// </summary>
    private static string GetPluralName(string name)
    {
        if (string.IsNullOrEmpty(name))
            return name;

        // 简单的复数规则
        if (name.EndsWith("y", StringComparison.OrdinalIgnoreCase))
        {
            return name.Substring(0, name.Length - 1) + "ies";
        }
        else if (name.EndsWith("s", StringComparison.OrdinalIgnoreCase) ||
                 name.EndsWith("sh", StringComparison.OrdinalIgnoreCase) ||
                 name.EndsWith("ch", StringComparison.OrdinalIgnoreCase) ||
                 name.EndsWith("x", StringComparison.OrdinalIgnoreCase) ||
                 name.EndsWith("z", StringComparison.OrdinalIgnoreCase))
        {
            return name + "es";
        }
        else
        {
            return name + "s";
        }
    }

    /// <summary>
    /// 获取主键属性
    /// </summary>
    private PropertyModelDto? GetPrimaryKeyProperty(List<PropertyModelDto> properties)
    {
        return properties?.FirstOrDefault(p => p.IsKey) ?? 
               properties?.FirstOrDefault(p => p.Name.Equals("Id", StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// 获取 C# 类型 - 使用完整的类型映射器
    /// </summary>
    private string GetCSharpType(string? inputType)
    {
        try
        {
            var mappingResult = _typeMapper.GetCSharpTypeMapping(inputType);
            
            if (mappingResult.HasWarning)
            {
                _logger.LogWarning("类型映射警告: {Warning}", mappingResult.WarningMessage);
            }
            
            if (!mappingResult.IsSuccess)
            {
                _logger.LogError("类型映射失败: {Error}", mappingResult.ErrorMessage);
            }
            
            return mappingResult.TypeInfo.CSharpType;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "获取C#类型映射时发生异常: {InputType}", inputType);
            return "string"; // 兜底返回string类型
        }
    }

    /// <summary>
    /// 判断是否为值类型 - 使用完整的类型映射器
    /// </summary>
    private bool IsValueType(string? type)
    {
        try
        {
            var mappingResult = _typeMapper.GetCSharpTypeMapping(type);
            return mappingResult.IsSuccess && mappingResult.TypeInfo.IsValueType;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "判断值类型时发生异常: {Type}", type);
            return false;
        }
    }

    /// <summary>
    /// 判断是否为主键属性
    /// </summary>
    private bool IsKeyProperty(PropertyModelDto property)
    {
        return property.IsKey || property.Name.Equals("Id", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// 判断是否为审计属性
    /// </summary>
    private bool IsAuditProperty(string propertyName)
    {
        var auditProps = new[] { "CreationTime", "CreatorId", "LastModificationTime", "LastModifierId", "IsDeleted", "DeletionTime", "DeleterId" };
        return auditProps.Contains(propertyName);
    }

    /// <summary>
    /// 判断是否为创建审计属性
    /// </summary>
    private bool IsCreationAuditProperty(string propertyName)
    {
        var creationProps = new[] { "CreationTime", "CreatorId" };
        return creationProps.Contains(propertyName);
    }

    #endregion
}

/// <summary>
/// 模板异常
/// </summary>
public class TemplateException : Exception
{
    public TemplateException(string message) : base(message)
    {
    }

    public TemplateException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
