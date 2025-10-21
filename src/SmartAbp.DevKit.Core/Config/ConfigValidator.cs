using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core.Config;

/// <summary>
/// 配置验证器 - DevKit v2.0核心组件
/// 负责验证LowCodeConfig的正确性和完整性
/// </summary>
public class ConfigValidator
{
    private readonly ILogger<ConfigValidator> _logger;

    public ConfigValidator(ILogger<ConfigValidator> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// 验证配置
    /// </summary>
    /// <param name="config">配置对象</param>
    /// <returns>验证结果</returns>
    public async Task<ValidationResult> ValidateAsync(LowCodeConfig config)
    {
        if (config == null)
        {
            return ValidationResult.Fail("配置对象不能为空");
        }

        var errors = new List<ValidationError>();

        // 验证模块名称
        ValidateModuleName(config, errors);

        // 验证命名空间
        ValidateNamespace(config, errors);

        // 验证实体列表
        ValidateEntities(config, errors);

        // 验证输出路径
        ValidateOutputPaths(config, errors);

        // 验证模板配置
        ValidateTemplateConfig(config, errors);

        await Task.CompletedTask;

        var result = new ValidationResult
        {
            IsValid = errors.Count == 0,
            Errors = errors
        };

        if (result.IsValid)
        {
            _logger.LogInformation("✅ 配置验证通过");
        }
        else
        {
            _logger.LogError("❌ 配置验证失败，发现 {ErrorCount} 个错误", errors.Count);
            foreach (var error in errors)
            {
                _logger.LogError("  - {PropertyName}: {Message}", error.PropertyName, error.Message);
            }
        }

        return result;
    }

    /// <summary>
    /// 验证模块名称
    /// </summary>
    private void ValidateModuleName(LowCodeConfig config, List<ValidationError> errors)
    {
        if (string.IsNullOrWhiteSpace(config.ModuleName))
        {
            errors.Add(new ValidationError
            {
                PropertyName = nameof(config.ModuleName),
                Message = "ModuleName不能为空"
            });
        }
        else if (config.ModuleName.Length < 2)
        {
            errors.Add(new ValidationError
            {
                PropertyName = nameof(config.ModuleName),
                Message = "ModuleName长度至少为2个字符"
            });
        }
        else if (!char.IsUpper(config.ModuleName[0]))
        {
            errors.Add(new ValidationError
            {
                PropertyName = nameof(config.ModuleName),
                Message = "ModuleName必须以大写字母开头"
            });
        }
    }

    /// <summary>
    /// 验证命名空间
    /// </summary>
    private void ValidateNamespace(LowCodeConfig config, List<ValidationError> errors)
    {
        if (string.IsNullOrWhiteSpace(config.Namespace))
        {
            // Namespace可以为空，将使用默认值
            _logger.LogWarning("⚠️  Namespace为空，将使用默认值");
        }
    }

    /// <summary>
    /// 验证实体列表
    /// </summary>
    private void ValidateEntities(LowCodeConfig config, List<ValidationError> errors)
    {
        if (config.Entities == null || config.Entities.Count == 0)
        {
            errors.Add(new ValidationError
            {
                PropertyName = nameof(config.Entities),
                Message = "Entities列表不能为空，至少需要一个实体"
            });
            return;
        }

        // 验证每个实体
        for (int i = 0; i < config.Entities.Count; i++)
        {
            var entity = config.Entities[i];
            ValidateEntity(entity, i, errors);
        }

        // 检查实体名称重复
        var duplicateNames = config.Entities
            .GroupBy(e => e.EntityName)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicateNames.Any())
        {
            errors.Add(new ValidationError
            {
                PropertyName = nameof(config.Entities),
                Message = $"发现重复的实体名称: {string.Join(", ", duplicateNames)}"
            });
        }
    }

    /// <summary>
    /// 验证单个实体（⭐ SSOT: 使用后端DTO）
    /// </summary>
    private void ValidateEntity(EntityDefinitionDto entity, int index, List<ValidationError> errors)
    {
        var prefix = $"Entities[{index}]";

        if (string.IsNullOrWhiteSpace(entity.Name))
        {
            errors.Add(new ValidationError
            {
                PropertyName = $"{prefix}.Name",
                Message = "实体名称不能为空"
            });
        }

        if (entity.Fields == null || entity.Fields.Count == 0)
        {
            errors.Add(new ValidationError
            {
                PropertyName = $"{prefix}.Fields",
                Message = $"实体 {entity.Name} 至少需要一个字段"
            });
        }
        else
        {
            // 验证字段
            for (int i = 0; i < entity.Fields.Count; i++)
            {
                var field = entity.Fields[i];
                ValidateField(field, entity.Name, i, errors);
            }

            // 检查字段名称重复
            var duplicateFields = entity.Fields
                .GroupBy(f => f.Name)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicateFields.Any())
            {
                errors.Add(new ValidationError
                {
                    PropertyName = $"{prefix}.Fields",
                    Message = $"实体 {entity.Name} 存在重复字段: {string.Join(", ", duplicateFields)}"
                });
            }
        }
    }

    /// <summary>
    /// 验证字段（⭐ SSOT: 使用后端DTO）
    /// </summary>
    private void ValidateField(EntityFieldDto field, string entityName, int index, List<ValidationError> errors)
    {
        var prefix = $"Entity[{entityName}].Fields[{index}]";

        if (string.IsNullOrWhiteSpace(field.Name))
        {
            errors.Add(new ValidationError
            {
                PropertyName = $"{prefix}.Name",
                Message = "字段名称不能为空"
            });
        }

        if (string.IsNullOrWhiteSpace(field.Type))
        {
            errors.Add(new ValidationError
            {
                PropertyName = $"{prefix}.Type",
                Message = $"字段 {field.Name} 的数据类型不能为空"
            });
        }
        else
        {
            // 验证数据类型有效性
            var validTypes = new[] { "string", "int", "long", "decimal", "bool", "datetime", "guid" };
            if (!validTypes.Contains(field.Type.ToLowerInvariant()))
            {
                errors.Add(new ValidationError
                {
                    PropertyName = $"{prefix}.Type",
                    Message = $"字段 {field.Name} 的数据类型 '{field.Type}' 无效，有效类型: {string.Join(", ", validTypes)}"
                });
            }
        }

        // 验证Length（对于string类型）- EntityFieldDto使用Length而不是MaxLength
        if (field.Type?.ToLowerInvariant() == "string" && field.Length.HasValue)
        {
            if (field.Length.Value <= 0)
            {
                errors.Add(new ValidationError
                {
                    PropertyName = $"{prefix}.Length",
                    Message = $"字段 {field.Name} 的Length必须大于0"
                });
            }
        }
    }

    /// <summary>
    /// 使用JSON Schema验证配置（可选，需要安装NJsonSchema）
    /// </summary>
    /// <param name="configJson">配置JSON字符串</param>
    /// <param name="schemaPath">Schema文件路径</param>
    /// <returns>验证结果</returns>
    public async Task<ValidationResult> ValidateWithSchemaAsync(string configJson, string schemaPath)
    {
        try
        {
            if (!File.Exists(schemaPath))
            {
                _logger.LogWarning("JSON Schema文件不存在，跳过Schema验证: {SchemaPath}", schemaPath);
                return ValidationResult.Success();
            }

            // TODO: 集成NJsonSchema库进行验证
            // 当前简化实现：只做基本的JSON格式验证
            try
            {
                System.Text.Json.JsonDocument.Parse(configJson);
                _logger.LogDebug("✅ JSON格式验证通过");
                return ValidationResult.Success();
            }
            catch (System.Text.Json.JsonException ex)
            {
                return ValidationResult.Fail($"JSON格式错误: {ex.Message}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Schema验证失败");
            return ValidationResult.Fail($"Schema验证异常: {ex.Message}");
        }
    }

    /// <summary>
    /// 验证输出路径
    /// </summary>
    private void ValidateOutputPaths(LowCodeConfig config, List<ValidationError> errors)
    {
        if (config.OutputPaths == null)
        {
            // OutputPaths可以为空，将使用默认值
            _logger.LogWarning("⚠️  OutputPaths为空，将使用默认路径");
            return;
        }

        // 验证路径格式（不要求路径存在，因为可能还未创建）
        if (!string.IsNullOrWhiteSpace(config.OutputPaths.DomainPath))
        {
            if (Path.IsPathRooted(config.OutputPaths.DomainPath) &&
                !config.OutputPaths.DomainPath.Contains("src"))
            {
                _logger.LogWarning("⚠️  DomainPath看起来不像正常的项目路径: {Path}",
                    config.OutputPaths.DomainPath);
            }
        }
    }

    /// <summary>
    /// 验证模板配置
    /// </summary>
    private void ValidateTemplateConfig(LowCodeConfig config, List<ValidationError> errors)
    {
        if (config.TemplateConfig == null)
        {
            // TemplateConfig可以为空，将使用默认值
            _logger.LogWarning("⚠️  TemplateConfig为空，将使用默认模板配置");
            return;
        }

        // 验证模板路径存在性（如果指定了自定义路径）
        if (!string.IsNullOrWhiteSpace(config.TemplateConfig.TemplateDirectory))
        {
            var templateDir = config.TemplateConfig.TemplateDirectory;
            if (!Directory.Exists(templateDir))
            {
                _logger.LogWarning("⚠️  自定义模板目录不存在: {TemplateDir}", templateDir);
            }
        }
    }
}

/// <summary>
/// 验证结果
/// </summary>
public class ValidationResult
{
    /// <summary>
    /// 是否验证通过
    /// </summary>
    public bool IsValid { get; set; }

    /// <summary>
    /// 错误列表
    /// </summary>
    public List<ValidationError> Errors { get; set; } = new();

    /// <summary>
    /// 创建成功的验证结果
    /// </summary>
    public static ValidationResult Success() => new ValidationResult { IsValid = true };

    /// <summary>
    /// 创建失败的验证结果
    /// </summary>
    public static ValidationResult Fail(string error) => new ValidationResult
    {
        IsValid = false,
        Errors = new List<ValidationError>
        {
            new ValidationError { PropertyName = "General", Message = error }
        }
    };

    /// <summary>
    /// 创建失败的验证结果（多个错误）
    /// </summary>
    public static ValidationResult Fail(params string[] errors) => new ValidationResult
    {
        IsValid = false,
        Errors = errors.Select(e => new ValidationError { PropertyName = "General", Message = e }).ToList()
    };
}

/// <summary>
/// 验证错误
/// </summary>
public class ValidationError
{
    /// <summary>
    /// 属性名称
    /// </summary>
    public string PropertyName { get; set; } = string.Empty;

    /// <summary>
    /// 错误消息
    /// </summary>
    public string Message { get; set; } = string.Empty;
}
