using System;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using SmartAbp.DevKit.Abstractions.Models;
using SmartAbp.DevKit.Core.Abstractions;
using SmartAbp.DevKit.Core.Models;

namespace SmartAbp.DevKit.Core.Config;

/// <summary>
/// 默认配置提供器 - DevKit v2.0核心组件
/// 负责提供默认配置值，合并用户配置和默认配置
/// </summary>
public class DefaultConfigProvider
{
    private readonly ILogger<DefaultConfigProvider> _logger;

    public DefaultConfigProvider(ILogger<DefaultConfigProvider> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// 获取默认配置
    /// </summary>
    public LowCodeConfig GetDefaultConfig()
    {
        return new LowCodeConfig
        {
            ModuleName = "SampleModule",
            Namespace = "SmartAbp",
            CurrentLayer = TargetLayer.Layer1,
            OutputPaths = GetDefaultOutputPaths(),
            TemplateConfig = GetDefaultTemplateConfig(),
            Entities = new List<GeneralEntityDefinition>()
        };
    }

    /// <summary>
    /// 合并用户配置和默认配置
    /// </summary>
    /// <param name="userConfig">用户配置</param>
    /// <returns>合并后的配置</returns>
    public LowCodeConfig MergeWithDefaults(LowCodeConfig userConfig)
    {
        if (userConfig == null)
        {
            _logger.LogWarning("⚠️  用户配置为空，返回默认配置");
            return GetDefaultConfig();
        }

        var mergedConfig = userConfig;

        // 合并Namespace
        if (string.IsNullOrWhiteSpace(mergedConfig.Namespace))
        {
            mergedConfig.Namespace = "SmartAbp";
            _logger.LogDebug("使用默认Namespace: {Namespace}", mergedConfig.Namespace);
        }

        // 合并OutputPaths
        if (mergedConfig.OutputPaths == null)
        {
            mergedConfig.OutputPaths = GetDefaultOutputPaths();
            _logger.LogDebug("使用默认OutputPaths");
        }
        else
        {
            MergeOutputPaths(mergedConfig.OutputPaths);
        }

        // 合并TemplateConfig
        if (mergedConfig.TemplateConfig == null)
        {
            mergedConfig.TemplateConfig = GetDefaultTemplateConfig();
            _logger.LogDebug("使用默认TemplateConfig");
        }
        else
        {
            MergeTemplateConfig(mergedConfig.TemplateConfig);
        }

        // 合并实体配置
        if (mergedConfig.Entities != null)
        {
            foreach (var entity in mergedConfig.Entities)
            {
                MergeEntityDefaults(entity);
            }
        }

        _logger.LogInformation("✅ 配置合并完成");
        return mergedConfig;
    }

    /// <summary>
    /// 获取默认输出路径
    /// </summary>
    private OutputPathConfig GetDefaultOutputPaths()
    {
        return new OutputPathConfig
        {
            DomainPath = "src/SmartAbp.Domain",
            ApplicationPath = "src/SmartAbp.Application",
            HttpApiPath = "src/SmartAbp.HttpApi",
            FrontendPath = "src/SmartAbp.Vue/src/views"
        };
    }

    /// <summary>
    /// 获取默认模板配置
    /// </summary>
    private Models.TemplateConfig GetDefaultTemplateConfig()
    {
        return new Models.TemplateConfig
        {
            BackendTemplatePath = "templates/backend",
            FrontendTemplatePath = "templates/frontend"
        };
    }

    /// <summary>
    /// 合并输出路径配置
    /// </summary>
    private void MergeOutputPaths(OutputPathConfig outputPaths)
    {
        var defaults = GetDefaultOutputPaths();

        if (string.IsNullOrWhiteSpace(outputPaths.DomainPath))
        {
            outputPaths.DomainPath = defaults.DomainPath;
        }

        if (string.IsNullOrWhiteSpace(outputPaths.ApplicationPath))
        {
            outputPaths.ApplicationPath = defaults.ApplicationPath;
        }

        if (string.IsNullOrWhiteSpace(outputPaths.HttpApiPath))
        {
            outputPaths.HttpApiPath = defaults.HttpApiPath;
        }

        if (string.IsNullOrWhiteSpace(outputPaths.FrontendPath))
        {
            outputPaths.FrontendPath = defaults.FrontendPath;
        }

        if (string.IsNullOrWhiteSpace(outputPaths.TestsPath))
        {
            outputPaths.TestsPath = defaults.TestsPath;
        }
    }

    /// <summary>
    /// 合并模板配置
    /// </summary>
    private void MergeTemplateConfig(Models.TemplateConfig templateConfig)
    {
        var defaults = GetDefaultTemplateConfig();

        if (string.IsNullOrWhiteSpace(templateConfig.TemplateDirectory))
        {
            templateConfig.TemplateDirectory = defaults.TemplateDirectory;
        }

        if (string.IsNullOrWhiteSpace(templateConfig.TemplateExtension))
        {
            templateConfig.TemplateExtension = defaults.TemplateExtension;
        }
    }

    /// <summary>
    /// 合并实体默认配置（⭐ SSOT: 使用后端DTO）
    /// </summary>
    private void MergeEntityDefaults(GeneralEntityDefinition entity)
    {
        // TableName默认值
        if (string.IsNullOrWhiteSpace(entity.TableName))
        {
            // 默认使用实体名称的复数形式
            entity.TableName = $"{entity.Name}s";
        }

        // DisplayName默认值
        if (string.IsNullOrWhiteSpace(entity.DisplayName))
        {
            entity.DisplayName = entity.Name;
        }

        // 合并字段默认配置
        if (entity.Fields != null)
        {
            foreach (var field in entity.Fields)
            {
                MergeFieldDefaults(field);
            }
        }
    }

    /// <summary>
    /// 合并字段默认配置（⭐ SSOT: 使用后端DTO）
    /// </summary>
    private void MergeFieldDefaults(GeneralEntityField field)
    {
        // DisplayName默认值
        if (string.IsNullOrWhiteSpace(field.DisplayName))
        {
            field.DisplayName = field.Name;
        }

        // 根据DataType设置默认Length（GeneralEntityField使用Length）
        if (field.DataType?.ToLowerInvariant() == "string" && field.Length <= 0)
        {
            field.Length = 200; // 默认字符串长度200
        }
    }

    /// <summary>
    /// 创建示例配置（⭐ SSOT: 使用后端DTO）
    /// </summary>
    /// <param name="moduleName">模块名称</param>
    /// <returns>示例配置</returns>
    public LowCodeConfig CreateSampleConfig(string moduleName = "Product")
    {
        return new LowCodeConfig
        {
            ModuleName = moduleName,
            Namespace = "SmartAbp",
            CurrentLayer = TargetLayer.Layer1,
            OutputPaths = GetDefaultOutputPaths(),
            TemplateConfig = GetDefaultTemplateConfig(),
            Entities = new List<GeneralEntityDefinition>
            {
                new GeneralEntityDefinition
                {
                    Name = moduleName,
                    DisplayName = $"{moduleName}（产品）",
                    TableName = $"{moduleName}s",
                    Fields = new List<GeneralEntityField>
                    {
                        new GeneralEntityField
                        {
                            Name = "Name",
                            DisplayName = $"{moduleName}名称",
                            DataType = "string",
                            IsRequired = true,
                            Length = 100
                        },
                        new GeneralEntityField
                        {
                            Name = "Description",
                            DisplayName = "描述",
                            DataType = "string",
                            IsRequired = false,
                            Length = 500
                        },
                        new GeneralEntityField
                        {
                            Name = "Price",
                            DisplayName = "价格",
                            DataType = "decimal",
                            IsRequired = true
                        },
                        new GeneralEntityField
                        {
                            Name = "Stock",
                            DisplayName = "库存",
                            DataType = "int",
                            IsRequired = true
                        },
                        new GeneralEntityField
                        {
                            Name = "IsActive",
                            DisplayName = "是否启用",
                            DataType = "bool",
                            IsRequired = true
                        }
                    }
                }
            }
        };
    }
}
