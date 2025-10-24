using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.Application.Contracts.LowCode;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using Volo.Abp.Application.Services;

namespace SmartAbp.Application.LowCode
{
    /// <summary>
    /// 权限管理系统生成器
    /// "吃自己的狗粮"：使用极简代码生成通道生成完整的权限管理系统
    /// </summary>
    public class PermissionSystemGenerator : ApplicationService
    {
        private readonly ISmartStudioLiteAppService _smartStudioLiteAppService;

        public PermissionSystemGenerator(ISmartStudioLiteAppService smartStudioLiteAppService)
        {
            _smartStudioLiteAppService = smartStudioLiteAppService;
        }

        /// <summary>
        /// 从JSON配置文件生成完整的权限管理系统
        /// </summary>
        public async Task<PermissionSystemGenerationResult> GenerateFromConfigFileAsync(string configFilePath)
        {
            try
            {
                Logger.LogInformation("开始从配置文件生成权限管理系统: {ConfigFilePath}", configFilePath);

                // 1. 读取JSON配置文件
                var jsonContent = await File.ReadAllTextAsync(configFilePath);
                var config = JsonSerializer.Deserialize<ModuleConfiguration>(jsonContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (config == null || config.Entities == null || !config.Entities.Any())
                {
                    return new PermissionSystemGenerationResult
                    {
                        Success = false,
                        ErrorMessage = "配置文件格式错误或没有实体定义"
                    };
                }

                Logger.LogInformation(
                    "配置文件解析成功: SystemName={SystemName}, ModuleName={ModuleName}, EntityCount={EntityCount}",
                    config.SystemName,
                    config.ModuleName,
                    config.Entities.Count
                );

                // 2. 为每个实体生成代码
                var results = new List<EntityGenerationResult>();
                var totalFiles = 0;

                foreach (var entity in config.Entities)
                {
                    Logger.LogInformation("开始生成实体: {EntityName}", entity.Name);

                    // 转换为SimplifiedModuleCreationDto
                    var dto = ConvertToSimplifiedDto(config, entity);

                    // 调用极简通道生成代码
                    var result = await _smartStudioLiteAppService.CreateModuleAsync(dto);

                    results.Add(new EntityGenerationResult
                    {
                        EntityName = entity.Name,
                        Success = result.Success,
                        Message = result.Message,
                        FileCount = result.GeneratedFiles?.Count ?? 0,
                        GeneratedFiles = result.GeneratedFiles ?? new List<string>()
                    });

                    if (result.Success)
                    {
                        totalFiles += result.GeneratedFiles?.Count ?? 0;
                        Logger.LogInformation(
                            "✅ 实体生成成功: {EntityName}, 文件数: {FileCount}",
                            entity.Name,
                            result.GeneratedFiles?.Count ?? 0
                        );
                    }
                    else
                    {
                        Logger.LogError(
                            "❌ 实体生成失败: {EntityName}, 错误: {Error}",
                            entity.Name,
                            result.Message
                        );
                    }
                }

                // 3. 汇总结果
                var successCount = results.Count(r => r.Success);
                var failureCount = results.Count(r => !r.Success);

                Logger.LogInformation(
                    "权限管理系统生成完成: 成功={SuccessCount}, 失败={FailureCount}, 总文件数={TotalFiles}",
                    successCount,
                    failureCount,
                    totalFiles
                );

                return new PermissionSystemGenerationResult
                {
                    Success = failureCount == 0,
                    TotalEntities = config.Entities.Count,
                    SuccessCount = successCount,
                    FailureCount = failureCount,
                    TotalFiles = totalFiles,
                    EntityResults = results,
                    ErrorMessage = failureCount > 0 ? $"有{failureCount}个实体生成失败" : null
                };
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "从配置文件生成权限管理系统失败: {Error}", ex.Message);
                return new PermissionSystemGenerationResult
                {
                    Success = false,
                    ErrorMessage = $"生成失败：{ex.Message}"
                };
            }
        }

        /// <summary>
        /// 将JSON配置转换为SimplifiedModuleCreationDto
        /// </summary>
        private SimplifiedModuleCreationDto ConvertToSimplifiedDto(
            ModuleConfiguration config,
            EntityConfiguration entity)
        {
            return new SimplifiedModuleCreationDto
            {
                SystemName = config.SystemName,
                ModuleName = config.ModuleName,
                DisplayName = config.DisplayName,
                Description = config.Description,
                EntityName = entity.Name,
                EntityDisplayName = entity.DisplayName,
                Fields = entity.Fields?.Select(f => new SimplifiedFieldConfigDto
                {
                    Name = f.Name,
                    DisplayName = f.DisplayName,
                    Type = f.Type,
                    MaxLength = f.MaxLength,
                    MinLength = f.MinLength,
                    IsRequired = f.Required,
                    DefaultValue = f.DefaultValue,
                    Comment = f.Description,
                    Order = f.DisplayOrder ?? 0,
                    Precision = f.Precision,
                    Scale = f.Scale,
                    MinValue = f.MinValue,
                    MaxValue = f.MaxValue,
                    Pattern = f.Pattern
                }).ToList() ?? new List<SimplifiedFieldConfigDto>()
            };
        }
    }

    #region 配置模型（用于JSON反序列化）

    public class ModuleConfiguration
    {
        public string SystemName { get; set; } = default!;
        public string ModuleName { get; set; } = default!;
        public string DisplayName { get; set; } = default!;
        public string? Description { get; set; }
        public string? DatabaseProvider { get; set; }
        public List<EntityConfiguration> Entities { get; set; } = new();
    }

    public class EntityConfiguration
    {
        public string Name { get; set; } = default!;
        public string DisplayName { get; set; } = default!;
        public string? Description { get; set; }
        public string? TableName { get; set; }
        public bool HasAuditFields { get; set; }
        public bool HasMultiTenant { get; set; }
        public bool HasSoftDelete { get; set; }
        public List<FieldConfiguration>? Fields { get; set; }
    }

    public class FieldConfiguration
    {
        public string Name { get; set; } = default!;
        public string DisplayName { get; set; } = default!;
        public string Type { get; set; } = default!;
        public int? MaxLength { get; set; }
        public int? MinLength { get; set; }
        public bool Required { get; set; }
        public string? DefaultValue { get; set; }
        public string? Description { get; set; }
        public int? DisplayOrder { get; set; }
        public int? Precision { get; set; }
        public int? Scale { get; set; }
        public decimal? MinValue { get; set; }
        public decimal? MaxValue { get; set; }
        public string? Pattern { get; set; }
    }

    #endregion

    #region 生成结果模型

    public class PermissionSystemGenerationResult
    {
        public bool Success { get; set; }
        public int TotalEntities { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public int TotalFiles { get; set; }
        public List<EntityGenerationResult> EntityResults { get; set; } = new();
        public string? ErrorMessage { get; set; }
    }

    public class EntityGenerationResult
    {
        public string EntityName { get; set; } = default!;
        public bool Success { get; set; }
        public string? Message { get; set; }
        public int FileCount { get; set; }
        public List<string> GeneratedFiles { get; set; } = new();
    }

    #endregion
}

