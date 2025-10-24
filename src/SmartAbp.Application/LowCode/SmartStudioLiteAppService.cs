using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.Application.Contracts.LowCode;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using SmartAbp.Domain.Entities.LowCode;
using Microsoft.Extensions.Configuration;
using SmartAbp.Application.Contracts.DatabaseInfo;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace SmartAbp.Application.LowCode
{
    /// <summary>
    /// Layer2 (SmartStudio Lite) - 应用服务实现
    /// 提供渐进式用户体验：基本信息 → 字段配置 → 生成代码
    /// </summary>
    public class SmartStudioLiteAppService : ApplicationService, ISmartStudioLiteAppService
    {
        private readonly IRepository<LowCodeModule, Guid> _moduleRepository;
        private readonly IRepository<LowCodeEntity, Guid> _entityRepository;
        private readonly IRepository<LowCodeProperty, Guid> _propertyRepository;
        private readonly CodeGenerationService _codeGenerationService;
        private readonly IDatabaseInfoAppService _databaseInfoAppService;

        public SmartStudioLiteAppService(
            IRepository<LowCodeModule, Guid> moduleRepository,
            IRepository<LowCodeEntity, Guid> entityRepository,
            IRepository<LowCodeProperty, Guid> propertyRepository,
            CodeGenerationService codeGenerationService,
            IDatabaseInfoAppService databaseInfoAppService)
        {
            _moduleRepository = moduleRepository;
            _entityRepository = entityRepository;
            _propertyRepository = propertyRepository;
            _codeGenerationService = codeGenerationService;
            _databaseInfoAppService = databaseInfoAppService;
        }

        /// <summary>
        /// 创建模块（简化模式）
        /// </summary>
        public async Task<SimplifiedModuleCreationResultDto> CreateModuleAsync(SimplifiedModuleCreationDto input)
        {
            try
            {
                // 1. 验证配置
                var validation = await ValidateModuleConfigurationAsync(input);
                if (!validation.IsValid)
                {
                    return new SimplifiedModuleCreationResultDto
                    {
                        Success = false,
                        Message = "配置验证失败：" + string.Join(", ", validation.Errors.Items.Select(e => e.Message))
                    };
                }

                // 2. 创建模块
                var module = new LowCodeModule(
                    GuidGenerator.Create(),
                    input.SystemName,
                    input.ModuleName,
                    input.DisplayName,
                    $"{input.SystemName}.{input.ModuleName}"
                )
                {
                    Description = input.Description,
                    Version = "1.0.0"
                };

                await _moduleRepository.InsertAsync(module, autoSave: true);

                // 3. 创建实体定义（使用LowCodeEntity构造函数）
                var entityId = Guid.NewGuid();
                var entity = new LowCodeEntity(
                    id: entityId,
                    moduleId: module.Id,
                    name: input.EntityName,
                    displayName: input.EntityDisplayName,
                    tableName: $"App{input.EntityName}s"
                )
                {
                    Description = input.Description ?? $"{input.EntityDisplayName}实体",
                    PluralName = $"{input.EntityName}s",
                    Schema = "dbo",
                    DisplayOrder = 0,
                    IsActive = true,
                    TenantId = CurrentTenant.Id,
                    // 实体配置（JSON）
                    EntityConfig = new EntityConfig
                    {
                        IsAggregateRoot = true,
                        BaseClass = "AuditedAggregateRoot",
                        Interfaces = new List<string> { "IMultiTenant" },
                        IsAudited = true,
                        IsSoftDelete = false,
                        IsMultiTenant = false
                    },
                    // UI配置（JSON）
                    UIConfig = new EntityUIConfig
                    {
                        Icon = "el-icon-document",
                        Color = "#409EFF",
                        ListPageSize = 20,
                        EnableExport = true,
                        EnableImport = true,
                        EnableBatchDelete = true
                    }
                };

                await _entityRepository.InsertAsync(entity, autoSave: true);

                // 4. 创建字段（使用LowCodeProperty构造函数）
                var fieldOrder = 0;
                foreach (var fieldConfig in input.Fields.OrderBy(f => f.Order))
                {
                    var propertyId = Guid.NewGuid();
                    var property = new LowCodeProperty(
                        id: propertyId,
                        entityId: entity.Id,
                        name: fieldConfig.Name,
                        displayName: fieldConfig.DisplayName,
                        type: fieldConfig.Type,
                        columnName: fieldConfig.Name,
                        columnType: fieldConfig.Type
                    )
                    {
                        Description = fieldConfig.Comment ?? "",
                        IsRequired = fieldConfig.IsRequired,
                        IsNullable = !fieldConfig.IsRequired,
                        DefaultValue = fieldConfig.DefaultValue,
                        MaxLength = fieldConfig.MaxLength,
                        MinLength = fieldConfig.MinLength,
                        MinValue = fieldConfig.MinValue,
                        MaxValue = fieldConfig.MaxValue,
                        DisplayOrder = fieldOrder,
                        IsKey = false,
                        IsUnique = false,
                        IsForeignKey = false,
                        TenantId = CurrentTenant.Id,
                        // UI配置（JSON）
                        UIConfig = new PropertyUIConfig
                        {
                            ControlType = "input",
                            ControlProps = new Dictionary<string, object>
                            {
                                ["placeholder"] = $"请输入{fieldConfig.DisplayName}"
                            },
                            ListVisible = true,
                            DetailVisible = true,
                            FormVisible = true,
                            Searchable = true,
                            Sortable = true,
                            Filterable = true
                        },
                        // 验证规则（JSON）
                        ValidationRules = new List<ValidationRuleConfig>()
                    };

                    if (fieldConfig.IsRequired)
                    {
                        property.ValidationRules.Add(new ValidationRuleConfig
                        {
                            Type = "required",
                            Message = $"{fieldConfig.DisplayName}不能为空"
                        });
                    }

                    if (fieldConfig.MaxLength.HasValue)
                    {
                        property.ValidationRules.Add(new ValidationRuleConfig
                        {
                            Type = "maxLength",
                            Value = fieldConfig.MaxLength.Value.ToString(),
                            Message = $"{fieldConfig.DisplayName}长度不能超过{fieldConfig.MaxLength.Value}个字符"
                        });
                    }

                    fieldOrder++;
                    await _propertyRepository.InsertAsync(property, autoSave: true);
                }

                // 5. 触发代码生成（异步）
                var sessionId = Guid.NewGuid().ToString();

                Logger.LogInformation(
                    "Layer2 模块创建成功: Module={ModuleName}, Entity={EntityName}, FieldCount={FieldCount}",
                    input.ModuleName,
                    input.EntityName,
                    input.Fields.Count
                );

                // 6. 调用代码生成服务（真正的代码生成！）
                Logger.LogInformation("开始代码生成: EntityId={EntityId}", entity.Id);
                
                var generationResult = await _codeGenerationService.GenerateAsync(entity.Id);

                // 7. 返回结果
                if (generationResult.Success)
                {
                    Logger.LogInformation(
                        "代码生成成功: EntityId={EntityId}, FileCount={FileCount}",
                        entity.Id,
                        generationResult.GeneratedFiles.Count
                    );

                    return new SimplifiedModuleCreationResultDto
                    {
                        Success = true,
                        ModuleId = module.Id,
                        EntityId = entity.Id,
                        SessionId = sessionId,
                        Message = $"模块创建成功，已生成{generationResult.GeneratedFiles.Count}个文件",
                        GeneratedFiles = generationResult.GeneratedFiles.Values.ToList()
                    };
                }
                else
                {
                    var errorMessage = generationResult.Errors?.Any() == true 
                        ? string.Join("; ", generationResult.Errors)
                        : "未知错误";
                    
                    Logger.LogError("代码生成失败: EntityId={EntityId}, Error={Error}", 
                        entity.Id, errorMessage);

                    return new SimplifiedModuleCreationResultDto
                    {
                        Success = false,
                        ModuleId = module.Id,
                        EntityId = entity.Id,
                        SessionId = sessionId,
                        Message = $"模块创建成功，但代码生成失败：{errorMessage}",
                        GeneratedFiles = new List<string>()
                    };
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Layer2 模块创建失败: {Message}", ex.Message);
                return new SimplifiedModuleCreationResultDto
                {
                    Success = false,
                    Message = $"模块创建失败：{ex.Message}"
                };
            }
        }

        /// <summary>
        /// 预览将要生成的文件列表
        /// </summary>
        public async Task<ListResultDto<string>> PreviewGeneratedFilesAsync(SimplifiedModuleCreationDto input)
        {
            var files = await PreviewGeneratedFiles(input);
            return new ListResultDto<string>(files);
        }

        /// <summary>
        /// 验证模块配置
        /// </summary>
        public async Task<ValidationResultDto> ValidateModuleConfigurationAsync(SimplifiedModuleCreationDto input)
        {
            var errors = new List<ValidationErrorDto>();

            // 1. 检查模块名称是否已存在
            var existingModule = await _moduleRepository.FirstOrDefaultAsync(m => m.ModuleName == input.ModuleName);
            if (existingModule != null)
            {
                errors.Add(new ValidationErrorDto
                {
                    Field = nameof(input.ModuleName),
                    Message = $"模块名称 '{input.ModuleName}' 已存在"
                });
            }

            // 2. 检查字段配置
            if (input.Fields == null || input.Fields.Count == 0)
            {
                errors.Add(new ValidationErrorDto
                {
                    Field = nameof(input.Fields),
                    Message = "至少需要配置一个字段"
                });
            }
            else
            {
                // 检查字段名称重复
                var duplicateFields = input.Fields
                    .GroupBy(f => f.Name)
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .ToList();

                foreach (var fieldName in duplicateFields)
                {
                    errors.Add(new ValidationErrorDto
                    {
                        Field = $"Fields.{fieldName}",
                        Message = $"字段名称 '{fieldName}' 重复"
                    });
                }

                // 检查字段类型
                var validTypes = new[] { "string", "int", "decimal", "bool", "DateTime", "enum", "Guid", "text", "json", "byte[]" };
                foreach (var field in input.Fields)
                {
                    if (!validTypes.Contains(field.Type))
                    {
                        errors.Add(new ValidationErrorDto
                        {
                            Field = $"Fields.{field.Name}.Type",
                            Message = $"字段类型 '{field.Type}' 无效"
                        });
                    }

                    // 字符串类型必须有最大长度
                    if (field.Type == "string" && !field.MaxLength.HasValue)
                    {
                        errors.Add(new ValidationErrorDto
                        {
                            Field = $"Fields.{field.Name}.MaxLength",
                            Message = $"字符串类型字段 '{field.Name}' 必须指定最大长度"
                        });
                    }

                    // decimal类型必须有精度和小数位数
                    if (field.Type == "decimal")
                    {
                        if (!field.Precision.HasValue)
                        {
                            errors.Add(new ValidationErrorDto
                            {
                                Field = $"Fields.{field.Name}.Precision",
                                Message = $"decimal类型字段 '{field.Name}' 必须指定精度"
                            });
                        }
                        if (!field.Scale.HasValue)
                        {
                            errors.Add(new ValidationErrorDto
                            {
                                Field = $"Fields.{field.Name}.Scale",
                                Message = $"decimal类型字段 '{field.Name}' 必须指定小数位数"
                            });
                        }
                    }
                }
            }

            return new ValidationResultDto
            {
                IsValid = errors.Count == 0,
                Errors = new ListResultDto<ValidationErrorDto>(errors)
            };
        }

        /// <summary>
        /// 预览生成文件列表（私有方法）
        /// ✅ ABP平台底层增强：通过数据库信息服务获取数据库适配信息
        /// </summary>
        private async Task<List<string>> PreviewGeneratedFiles(SimplifiedModuleCreationDto input)
        {
            // ✅ ABP平台底层增强：通过标准服务层获取数据库信息（完全解耦）
            var databaseInfo = await _databaseInfoAppService.GetCurrentDatabaseInfoAsync();
            var timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
            
            var files = new List<string>
            {
                // 🎯 后端文件（ABP vNext DDD标准）
                $"Domain/{input.EntityName}.cs",
                $"Application/{input.EntityName}AppService.cs",
                $"Application.Contracts/Dtos/{input.EntityName}Dto.cs",
                $"Application.Contracts/Dtos/Create{input.EntityName}Dto.cs",
                $"Application.Contracts/Dtos/Update{input.EntityName}Dto.cs",
                $"Application.Contracts/I{input.EntityName}AppService.cs",
                $"HttpApi/Controllers/{input.EntityName}Controller.cs",
                
                // 🗄️ 数据库特定迁移文件
                $"EntityFrameworkCore/Migrations/{timestamp}_Add{input.EntityName}Table_{databaseInfo.DatabaseName}.cs",
                $"EntityFrameworkCore/Configurations/{input.EntityName}Configuration_{databaseInfo.DatabaseName}.cs",

                // 🎨 前端文件（Vue3 + TypeScript）
                $"Vue/views/{input.EntityName.ToLower()}/{input.EntityName}List.vue",
                $"Vue/views/{input.EntityName.ToLower()}/{input.EntityName}Form.vue",
                $"Vue/stores/{input.EntityName.ToLower()}/use{input.EntityName}Store.ts",
                $"Vue/api/{input.EntityName.ToLower()}/{input.EntityName.ToLower()}-api.ts",
                $"Vue/types/{input.EntityName.ToLower()}/{input.EntityName.ToLower()}.types.ts",
                
                // 📱 UniApp文件（跨平台移动端）
                $"UniApp/pages/{input.EntityName.ToLower()}/{input.EntityName}List.vue",
                $"UniApp/pages/{input.EntityName.ToLower()}/{input.EntityName}Detail.vue",
                $"UniApp/pages/{input.EntityName.ToLower()}/{input.EntityName}Form.vue",
                
                // 📊 Dashboard文件（数字大屏）
                $"Dashboard/components/{input.EntityName}KPICard.vue",
                $"Dashboard/components/{input.EntityName}Chart.vue"
            };

            Logger.LogInformation(
                "预览文件生成完成: Entity={EntityName}, Database={DatabaseName}, FileCount={FileCount}",
                input.EntityName,
                databaseInfo.DatabaseName,
                files.Count
            );

            return await Task.FromResult(files);
        }

    }
}

