using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using SmartAbp.Application.Contracts.LowCode;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using SmartAbp.Domain.Entities.LowCode;
using SmartAbp.Domain.Repositories.LowCode;
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
        private readonly IModuleRepository _moduleRepository;
        private readonly IEntityDefinitionRepository _entityDefinitionRepository;
        private readonly IRepository<EntityField, Guid> _entityFieldRepository;
        private readonly ICodeGenerationService _codeGenerationService;

        public SmartStudioLiteAppService(
            IModuleRepository moduleRepository,
            IEntityDefinitionRepository entityDefinitionRepository,
            IRepository<EntityField, Guid> entityFieldRepository,
            ICodeGenerationService codeGenerationService)
        {
            _moduleRepository = moduleRepository;
            _entityDefinitionRepository = entityDefinitionRepository;
            _entityFieldRepository = entityFieldRepository;
            _codeGenerationService = codeGenerationService;
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
                var module = new Module
                {
                    ModuleName = input.ModuleName,
                    DisplayName = input.DisplayName,
                    Description = input.Description,
                    SystemName = input.SystemName,
                    Namespace = $"{input.SystemName}.{input.ModuleName}",
                    Version = "1.0.0",
                    CreationTime = DateTime.UtcNow,
                    LastModificationTime = DateTime.UtcNow
                };

                await _moduleRepository.InsertAsync(module, autoSave: true);

                // 3. 创建实体定义
                var entity = new EntityDefinition
                {
                    Name = input.EntityName,
                    DisplayName = input.EntityDisplayName,
                    ModuleId = module.Id,
                    TableName = $"App{input.EntityName}s", // 默认表名规则
                    Schema = "dbo",
                    IsAggregateRoot = true,
                    IsAudited = true,
                    IsSoftDelete = true,
                    BaseClass = "AuditedAggregateRoot",
                    CreationTime = DateTime.UtcNow,
                    LastModificationTime = DateTime.UtcNow
                };

                await _entityDefinitionRepository.InsertAsync(entity, autoSave: true);

                // 4. 创建字段
                var fieldOrder = 0;
                foreach (var fieldConfig in input.Fields.OrderBy(f => f.Order))
                {
                    var field = new EntityField
                    {
                        EntityDefinitionId = entity.Id,
                        Name = fieldConfig.Name,
                        DisplayName = fieldConfig.DisplayName,
                        Type = fieldConfig.Type,
                        Length = fieldConfig.MaxLength,
                        MinLength = fieldConfig.MinLength,
                        IsRequired = fieldConfig.IsRequired,
                        IsUnique = false,
                        IsIndexed = false,
                        DefaultValue = fieldConfig.DefaultValue,
                        Comment = fieldConfig.Comment,
                        Order = fieldOrder++,
                        Precision = fieldConfig.Precision,
                        Scale = fieldConfig.Scale,
                        MinValue = fieldConfig.MinValue,
                        MaxValue = fieldConfig.MaxValue,
                        Pattern = fieldConfig.Pattern,
                        ColumnName = fieldConfig.Name,
                        ColumnType = fieldConfig.Type,
                        IsAuditField = false,
                        IsSoftDeleteField = false,
                        IsTenantField = false
                    };

                    // 设置UI配置
                    field.UIConfig = new PropertyUIConfig
                    {
                        ControlType = fieldConfig.UIControl,
                        IsVisible = true,
                        IsReadonly = false,
                        IsSearchable = true,
                        IsSortable = true,
                        IsFilterable = true,
                        DisplayOrder = fieldOrder,
                        ListColumnWidth = 150
                    };

                    await _entityFieldRepository.InsertAsync(field, autoSave: true);
                }

                // 5. 触发代码生成（异步）
                var sessionId = Guid.NewGuid().ToString();

                Logger.LogInformation(
                    "Layer2 模块创建成功: Module={ModuleName}, Entity={EntityName}, FieldCount={FieldCount}",
                    input.ModuleName,
                    input.EntityName,
                    input.Fields.Count
                );

                // 6. 调用代码生成服务
                await _codeGenerationService.GenerateCodeForModuleAsync(module.Id, sessionId);

                // 7. 返回结果
                return new SimplifiedModuleCreationResultDto
                {
                    Success = true,
                    ModuleId = module.Id,
                    EntityId = entity.Id,
                    SessionId = sessionId,
                    Message = "模块创建成功，代码生成已启动",
                    GeneratedFiles = await PreviewGeneratedFiles(input)
                };
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
            var existingModule = await _moduleRepository.FindByNameAsync(input.ModuleName);
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
        /// </summary>
        private async Task<List<string>> PreviewGeneratedFiles(SimplifiedModuleCreationDto input)
        {
            var files = new List<string>
            {
                // 后端文件
                $"Domain/{input.EntityName}.cs",
                $"Application/{input.EntityName}AppService.cs",
                $"Application.Contracts/Dtos/{input.EntityName}Dto.cs",
                $"Application.Contracts/Dtos/Create{input.EntityName}Dto.cs",
                $"Application.Contracts/Dtos/Update{input.EntityName}Dto.cs",
                $"Application.Contracts/I{input.EntityName}AppService.cs",
                $"HttpApi/Controllers/{input.EntityName}Controller.cs",
                $"EntityFrameworkCore/Migrations/xxx_Add{input.EntityName}Table.cs",

                // 前端文件
                $"Vue/views/{input.EntityName.ToLower()}/{input.EntityName}List.vue",
                $"Vue/views/{input.EntityName.ToLower()}/{input.EntityName}Form.vue",
                $"Vue/stores/{input.EntityName.ToLower()}/use{input.EntityName}Store.ts",
                $"Vue/api/{input.EntityName.ToLower()}/{input.EntityName.ToLower()}-api.ts",
                $"Vue/types/{input.EntityName.ToLower()}/{input.EntityName.ToLower()}.types.ts"
            };

            return await Task.FromResult(files);
        }
    }
}

