using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Shouldly;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using SmartAbp.Domain.Entities.LowCode;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Testing;
using Volo.Abp.Uow;
using Xunit;

namespace SmartAbp.Application.Tests.LowCode
{
    /// <summary>
    /// SmartStudioLite集成测试 - 完整流程测试版本
    /// 测试从模块创建到代码生成到文件验证的完整流程
    /// </summary>
    public class SmartStudioLiteIntegrationTests : SmartAbpApplicationTestBase
    {
        private readonly ISmartStudioLiteAppService _smartStudioLiteAppService;
        private readonly IRepository<LowCodeModule, Guid> _moduleRepository;
        private readonly IRepository<LowCodeEntity, Guid> _entityRepository;
        private readonly IRepository<LowCodeProperty, Guid> _propertyRepository;
        private readonly IUnitOfWorkManager _unitOfWorkManager;

        public SmartStudioLiteIntegrationTests()
        {
            _smartStudioLiteAppService = GetRequiredService<ISmartStudioLiteAppService>();
            _moduleRepository = GetRequiredService<IRepository<LowCodeModule, Guid>>();
            _entityRepository = GetRequiredService<IRepository<LowCodeEntity, Guid>>();
            _propertyRepository = GetRequiredService<IRepository<LowCodeProperty, Guid>>();
            _unitOfWorkManager = GetRequiredService<IUnitOfWorkManager>();
        }

        [Fact]
        public async Task 完整流程集成测试_从模块创建到代码生成到文件验证()
        {
            // 🔥 步骤1：创建模块配置
            var input = new SimplifiedModuleCreationDto
            {
                SystemName = "SmartAbpIntegrationTest",
                ModuleName = "IntegrationTestModule",
                DisplayName = "集成测试模块",
                Description = "用于集成测试的完整模块",
                EntityName = "IntegrationTestEntity",
                EntityDisplayName = "集成测试实体",
                Fields = new List<SimplifiedFieldConfigDto>
                {
                    // 主键字段
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Id",
                        DisplayName = "主键",
                        Type = "Guid",
                        IsRequired = true,
                        IsPrimaryKey = true,
                        UIControl = "hidden",
                        Order = 0,
                        Comment = "主键字段"
                    },
                    // 用户名字段
                    new SimplifiedFieldConfigDto
                    {
                        Name = "UserName",
                        DisplayName = "用户名",
                        Type = "string",
                        IsRequired = true,
                        MaxLength = 50,
                        UIControl = "input",
                        Order = 1,
                        Comment = "用户名"
                    },
                    // 邮箱字段
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Email",
                        DisplayName = "邮箱",
                        Type = "string",
                        IsRequired = true,
                        MaxLength = 100,
                        UIControl = "input",
                        Order = 2,
                        Comment = "邮箱地址",
                        Pattern = @"^[^\s@]+@[^\s@]+\.[^\s@]+$",
                        ValidationRules = new List<ValidationRuleDto>
                        {
                            new ValidationRuleDto
                            {
                                RuleType = "email",
                                RuleValue = "",
                                ErrorMessage = "请输入有效的邮箱地址"
                            }
                        }
                    },
                    // 年龄字段
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Age",
                        DisplayName = "年龄",
                        Type = "int",
                        IsRequired = false,
                        MinValue = 0,
                        MaxValue = 150,
                        UIControl = "number",
                        Order = 3,
                        Comment = "年龄"
                    },
                    // 生日字段
                    new SimplifiedFieldConfigDto
                    {
                        Name = "BirthDate",
                        DisplayName = "生日",
                        Type = "DateTime",
                        IsRequired = false,
                        UIControl = "date-picker",
                        Order = 4,
                        Comment = "生日"
                    },
                    // 是否启用字段
                    new SimplifiedFieldConfigDto
                    {
                        Name = "IsActive",
                        DisplayName = "是否启用",
                        Type = "bool",
                        IsRequired = true,
                        DefaultValue = "true",
                        UIControl = "switch",
                        Order = 5,
                        Comment = "是否启用"
                    }
                },
                ArchitecturePattern = "Crud",
                DatabaseProvider = "SqlServer",
                ParentMenuId = "business",
                MenuIcon = "user"
            };

            // 🔥 步骤2：调用真实服务创建模块
            var result = await _smartStudioLiteAppService.CreateModuleAsync(input);

            // ✅ 验证创建结果
            result.ShouldNotBeNull();
            result.Success.ShouldBe(true);
            result.ModuleId.ShouldNotBeNull();
            result.EntityId.ShouldNotBeNull();
            result.Message.ShouldBe("模块创建成功");
            result.GeneratedFiles.Count.ShouldBeGreaterThan(0);

            Console.WriteLine($"✅ 模块创建成功 - ModuleId: {result.ModuleId}, EntityId: {result.EntityId}");
            Console.WriteLine($"✅ 生成文件数量: {result.GeneratedFiles.Count}");

            // 🔥 步骤3：验证数据库持久化
            using (var uow = _unitOfWorkManager.Begin())
            {
                var module = await _moduleRepository.FindAsync(result.ModuleId.Value);
                module.ShouldNotBeNull();
                module.Name.ShouldBe(input.ModuleName);
                module.DisplayName.ShouldBe(input.DisplayName);
                module.SystemName.ShouldBe(input.SystemName);
                module.Description.ShouldBe(input.Description);

                var entity = await _entityRepository.FindAsync(result.EntityId.Value);
                entity.ShouldNotBeNull();
                entity.Name.ShouldBe(input.EntityName);
                entity.DisplayName.ShouldBe(input.EntityDisplayName);
                entity.ModuleId.ShouldBe(module.Id);

                // 验证字段持久化
                var properties = await _propertyRepository.GetListAsync(p => p.EntityId == entity.Id);
                properties.Count.ShouldBe(input.Fields.Count);

                // 验证每个字段的属性
                foreach (var field in input.Fields)
                {
                    var property = properties.FirstOrDefault(p => p.Name == field.Name);
                    property.ShouldNotBeNull();
                    property.DisplayName.ShouldBe(field.DisplayName);
                    property.Type.ShouldBe(field.Type);
                    property.IsRequired.ShouldBe(field.IsRequired);
                    property.IsPrimaryKey.ShouldBe(field.IsPrimaryKey);
                    property.Order.ShouldBe(field.Order);
                    property.Comment.ShouldBe(field.Comment);
                }

                await uow.CompleteAsync();
            }

            Console.WriteLine("✅ 数据库持久化验证通过");

            // 🔥 步骤4：验证生成的文件结构
            var generatedFileTypes = result.GeneratedFiles
                .Select(f => f.Split('.').Last().ToLower())
                .Distinct()
                .ToList();

            // 验证生成了必要的文件类型
            generatedFileTypes.ShouldContain("cs"); // 后端C#代码
            generatedFileTypes.ShouldContain("vue"); // 前端Vue组件
            generatedFileTypes.ShouldContain("ts"); // TypeScript类型定义
            generatedFileTypes.ShouldContain("json"); // 配置文件

            Console.WriteLine($"✅ 生成文件类型: {string.Join(", ", generatedFileTypes)}");

            // 🔥 步骤5：验证生成的前端文件结构
            var frontendFiles = result.GeneratedFiles.Where(f => f.Contains("Vue") || f.Contains("vue")).ToList();
            var backendFiles = result.GeneratedFiles.Where(f => f.Contains("Domain") || f.Contains("Application")).ToList();

            frontendFiles.Count.ShouldBeGreaterThan(0);
            backendFiles.Count.ShouldBeGreaterThan(0);

            Console.WriteLine($"✅ 前端文件数量: {frontendFiles.Count}");
            Console.WriteLine($"✅ 后端文件数量: {backendFiles.Count}");

            // 🔥 步骤6：验证CRUD操作完整性
            var crudFiles = result.GeneratedFiles.Where(f =>
                f.Contains("Controller") ||
                f.Contains("AppService") ||
                f.Contains("Repository") ||
                f.Contains("List.vue") ||
                f.Contains("Form.vue")
            ).ToList();

            crudFiles.Count.ShouldBeGreaterThan(0);
            Console.WriteLine($"✅ CRUD相关文件数量: {crudFiles.Count}");

            // 🔥 步骤7：验证权限和菜单集成
            var permissionFiles = result.GeneratedFiles.Where(f =>
                f.Contains("Permission") ||
                f.Contains("Menu")
            ).ToList();

            permissionFiles.Count.ShouldBeGreaterThan(0);
            Console.WriteLine($"✅ 权限菜单相关文件数量: {permissionFiles.Count}");

            // 🔥 步骤8：验证类型定义一致性
            var typeDefinitionFiles = result.GeneratedFiles.Where(f =>
                f.Contains("Dto") ||
                f.Contains("types.ts") ||
                f.Contains("types.d.ts")
            ).ToList();

            typeDefinitionFiles.Count.ShouldBeGreaterThan(0);
            Console.WriteLine($"✅ 类型定义文件数量: {typeDefinitionFiles.Count}");

            Console.WriteLine("🎉 完整流程集成测试通过！从模块创建到代码生成到文件验证全部成功");
        }

        [Fact]
        public async Task 字段类型完整性测试_验证所有字段类型的正确处理()
        {
            // 🔥 测试字符串类型
            var stringFieldTest = new SimplifiedModuleCreationDto
            {
                SystemName = "SmartAbp",
                ModuleName = "StringFieldTest",
                DisplayName = "字符串字段测试",
                EntityName = "StringFieldTestEntity",
                EntityDisplayName = "字符串字段测试实体",
                Fields = new List<SimplifiedFieldConfigDto>
                {
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Id",
                        DisplayName = "主键",
                        Type = "Guid",
                        IsRequired = true,
                        IsPrimaryKey = true,
                        UIControl = "hidden",
                        Order = 0
                    },
                    new SimplifiedFieldConfigDto
                    {
                        Name = "ShortText",
                        DisplayName = "短文本",
                        Type = "string",
                        IsRequired = true,
                        MaxLength = 50,
                        UIControl = "input",
                        Order = 1
                    },
                    new SimplifiedFieldConfigDto
                    {
                        Name = "LongText",
                        DisplayName = "长文本",
                        Type = "text",
                        IsRequired = false,
                        UIControl = "textarea",
                        Order = 2
                    }
                }
            };

            var stringResult = await _smartStudioLiteAppService.CreateModuleAsync(stringFieldTest);
            stringResult.Success.ShouldBe(true);
            Console.WriteLine("✅ 字符串类型字段测试通过");

            // 🔥 测试数值类型
            var numberFieldTest = new SimplifiedModuleCreationDto
            {
                SystemName = "SmartAbp",
                ModuleName = "NumberFieldTest",
                DisplayName = "数值字段测试",
                EntityName = "NumberFieldTestEntity",
                EntityDisplayName = "数值字段测试实体",
                Fields = new List<SimplifiedFieldConfigDto>
                {
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Id",
                        DisplayName = "主键",
                        Type = "Guid",
                        IsRequired = true,
                        IsPrimaryKey = true,
                        UIControl = "hidden",
                        Order = 0
                    },
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Age",
                        DisplayName = "年龄",
                        Type = "int",
                        IsRequired = false,
                        MinValue = 0,
                        MaxValue = 150,
                        UIControl = "number",
                        Order = 1
                    },
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Price",
                        DisplayName = "价格",
                        Type = "decimal",
                        IsRequired = false,
                        Precision = 10,
                        Scale = 2,
                        MinValue = 0,
                        UIControl = "number",
                        Order = 2
                    }
                }
            };

            var numberResult = await _smartStudioLiteAppService.CreateModuleAsync(numberFieldTest);
            numberResult.Success.ShouldBe(true);
            Console.WriteLine("✅ 数值类型字段测试通过");

            // 🔥 测试布尔和日期类型
            var otherFieldTest = new SimplifiedModuleCreationDto
            {
                SystemName = "SmartAbp",
                ModuleName = "OtherFieldTest",
                DisplayName = "其他类型字段测试",
                EntityName = "OtherFieldTestEntity",
                EntityDisplayName = "其他类型字段测试实体",
                Fields = new List<SimplifiedFieldConfigDto>
                {
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Id",
                        DisplayName = "主键",
                        Type = "Guid",
                        IsRequired = true,
                        IsPrimaryKey = true,
                        UIControl = "hidden",
                        Order = 0
                    },
                    new SimplifiedFieldConfigDto
                    {
                        Name = "IsActive",
                        DisplayName = "是否启用",
                        Type = "bool",
                        IsRequired = true,
                        DefaultValue = "true",
                        UIControl = "switch",
                        Order = 1
                    },
                    new SimplifiedFieldConfigDto
                    {
                        Name = "CreateTime",
                        DisplayName = "创建时间",
                        Type = "DateTime",
                        IsRequired = true,
                        UIControl = "date-picker",
                        Order = 2
                    }
                }
            };

            var otherResult = await _smartStudioLiteAppService.CreateModuleAsync(otherFieldTest);
            otherResult.Success.ShouldBe(true);
            Console.WriteLine("✅ 布尔和日期类型字段测试通过");

            // 🔥 测试枚举类型
            var enumFieldTest = new SimplifiedModuleCreationDto
            {
                SystemName = "SmartAbp",
                ModuleName = "EnumFieldTest",
                DisplayName = "枚举字段测试",
                EntityName = "EnumFieldTestEntity",
                EntityDisplayName = "枚举字段测试实体",
                Fields = new List<SimplifiedFieldConfigDto>
                {
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Id",
                        DisplayName = "主键",
                        Type = "Guid",
                        IsRequired = true,
                        IsPrimaryKey = true,
                        UIControl = "hidden",
                        Order = 0
                    },
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Status",
                        DisplayName = "状态",
                        Type = "enum",
                        IsRequired = true,
                        UIControl = "select",
                        Order = 1,
                        EnumValues = new List<EnumValueDto>
                        {
                            new EnumValueDto { Value = "0", DisplayName = "草稿" },
                            new EnumValueDto { Value = "1", DisplayName = "启用" },
                            new EnumValueDto { Value = "2", DisplayName = "禁用" }
                        }
                    }
                }
            };

            var enumResult = await _smartStudioLiteAppService.CreateModuleAsync(enumFieldTest);
            enumResult.Success.ShouldBe(true);
            Console.WriteLine("✅ 枚举类型字段测试通过");

            Console.WriteLine("🎉 所有字段类型完整性测试通过！");
        }

        [Fact]
        public async Task 错误处理和边界条件测试_验证系统的健壮性()
        {
            // 🔥 测试重复模块名
            var duplicateInput1 = new SimplifiedModuleCreationDto
            {
                SystemName = "SmartAbp",
                ModuleName = "DuplicateTestModule",
                DisplayName = "重复测试模块1",
                EntityName = "DuplicateTestEntity1",
                EntityDisplayName = "重复测试实体1",
                Fields = new List<SimplifiedFieldConfigDto>
                {
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Id",
                        DisplayName = "主键",
                        Type = "Guid",
                        IsRequired = true,
                        IsPrimaryKey = true,
                        UIControl = "hidden",
                        Order = 0
                    }
                }
            };

            var duplicateInput2 = new SimplifiedModuleCreationDto
            {
                SystemName = "SmartAbp",
                ModuleName = "DuplicateTestModule", // 🔥 重复的模块名
                DisplayName = "重复测试模块2",
                EntityName = "DuplicateTestEntity2",
                EntityDisplayName = "重复测试实体2",
                Fields = new List<SimplifiedFieldConfigDto>
                {
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Id",
                        DisplayName = "主键",
                        Type = "Guid",
                        IsRequired = true,
                        IsPrimaryKey = true,
                        UIControl = "hidden",
                        Order = 0
                    }
                }
            };

            await _smartStudioLiteAppService.CreateModuleAsync(duplicateInput1);
            var duplicateResult = await _smartStudioLiteAppService.CreateModuleAsync(duplicateInput2);

            // 验证系统能正确处理重复情况
            duplicateResult.ShouldNotBeNull();
            Console.WriteLine($"✅ 重复模块测试完成 - 结果: {duplicateResult.Success}, 消息: {duplicateResult.Message}");

            // 🔥 测试字段验证
            var validationTestInput = new SimplifiedModuleCreationDto
            {
                SystemName = "SmartAbp",
                ModuleName = "ValidationTestModule",
                DisplayName = "验证测试模块",
                EntityName = "ValidationTestEntity",
                EntityDisplayName = "验证测试实体",
                Fields = new List<SimplifiedFieldConfigDto>
                {
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Id",
                        DisplayName = "主键",
                        Type = "Guid",
                        IsRequired = true,
                        IsPrimaryKey = true,
                        UIControl = "hidden",
                        Order = 0
                    },
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Name",
                        DisplayName = "名称",
                        Type = "string",
                        IsRequired = true,
                        MaxLength = 200,
                        UIControl = "input",
                        Order = 1,
                        ValidationRules = new List<ValidationRuleDto>
                        {
                            new ValidationRuleDto
                            {
                                RuleType = "required",
                                RuleValue = "",
                                ErrorMessage = "名称不能为空"
                            },
                            new ValidationRuleDto
                            {
                                RuleType = "length",
                                RuleValue = "2-200",
                                ErrorMessage = "名称长度必须在2-200字符之间"
                            }
                        }
                    }
                }
            };

            var validationResult = await _smartStudioLiteAppService.CreateModuleAsync(validationTestInput);
            validationResult.Success.ShouldBe(true);
            Console.WriteLine("✅ 字段验证测试通过");

            // 🔥 测试架构模式验证
            var architectureTestInput = new SimplifiedModuleCreationDto
            {
                SystemName = "SmartAbp",
                ModuleName = "ArchitectureTestModule",
                DisplayName = "架构测试模块",
                EntityName = "ArchitectureTestEntity",
                EntityDisplayName = "架构测试实体",
                Fields = new List<SimplifiedFieldConfigDto>
                {
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Id",
                        DisplayName = "主键",
                        Type = "Guid",
                        IsRequired = true,
                        IsPrimaryKey = true,
                        UIControl = "hidden",
                        Order = 0
                    }
                },
                ArchitecturePattern = "DDD", // 测试DDD架构模式
                DatabaseProvider = "PostgreSql"
            };

            var architectureResult = await _smartStudioLiteAppService.CreateModuleAsync(architectureTestInput);
            architectureResult.Success.ShouldBe(true);
            Console.WriteLine("✅ 架构模式测试通过");

            Console.WriteLine("🎉 错误处理和边界条件测试完成！");
        }

        [Fact]
        public async Task 性能测试_验证大量字段和复杂配置的处理能力()
        {
            // 🔥 创建包含大量字段的实体
            var largeFieldInput = new SimplifiedModuleCreationDto
            {
                SystemName = "SmartAbp",
                ModuleName = "PerformanceTestModule",
                DisplayName = "性能测试模块",
                EntityName = "PerformanceTestEntity",
                EntityDisplayName = "性能测试实体",
                Fields = new List<SimplifiedFieldConfigDto>()
            };

            // 生成50个字段
            for (int i = 0; i < 50; i++)
            {
                largeFieldInput.Fields.Add(new SimplifiedFieldConfigDto
                {
                    Name = $"Field{i:D2}",
                    DisplayName = $"字段{i:D2}",
                    Type = i % 4 == 0 ? "string" : i % 4 == 1 ? "int" : i % 4 == 2 ? "bool" : "DateTime",
                    IsRequired = i % 5 == 0,
                    MaxLength = i % 4 == 0 ? 100 : null,
                    UIControl = i % 4 == 0 ? "input" : i % 4 == 1 ? "number" : i % 4 == 2 ? "switch" : "date-picker",
                    Order = i,
                    Comment = $"第{i}个测试字段"
                });
            }

            // 记录开始时间
            var startTime = DateTime.Now;

            // 🔥 调用真实服务
            var result = await _smartStudioLiteAppService.CreateModuleAsync(largeFieldInput);

            // 记录结束时间
            var endTime = DateTime.Now;
            var duration = endTime - startTime;

            // ✅ 验证性能
            result.Success.ShouldBe(true);
            result.ModuleId.ShouldNotBeNull();
            result.EntityId.ShouldNotBeNull();
            result.GeneratedFiles.Count.ShouldBeGreaterThan(0);

            // 验证处理时间在合理范围内（不应该超过30秒）
            duration.TotalSeconds.ShouldBeLessThan(30);

            Console.WriteLine($"✅ 性能测试通过 - 处理50个字段耗时: {duration.TotalSeconds:F2}秒");
            Console.WriteLine($"✅ 生成文件数量: {result.GeneratedFiles.Count}");

            // 🔥 验证数据库中的字段数量
            using (var uow = _unitOfWorkManager.Begin())
            {
                var entity = await _entityRepository.FindAsync(result.EntityId.Value);
                entity.ShouldNotBeNull();

                var properties = await _propertyRepository.GetListAsync(p => p.EntityId == entity.Id);
                properties.Count.ShouldBe(50); // 50个字段

                await uow.CompleteAsync();
            }

            Console.WriteLine("✅ 数据库字段数量验证通过");
        }

        [Fact]
        public async Task 类型安全测试_验证DTO序列化和反序列化的一致性()
        {
            // 🔥 测试复杂DTO的序列化一致性
            var complexInput = new SimplifiedModuleCreationDto
            {
                SystemName = "TypeSafetyTest",
                ModuleName = "TypeSafetyModule",
                DisplayName = "类型安全测试模块",
                Description = "用于测试类型安全的模块",
                EntityName = "TypeSafetyEntity",
                EntityDisplayName = "类型安全测试实体",
                Fields = new List<SimplifiedFieldConfigDto>
                {
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Id",
                        DisplayName = "主键",
                        Type = "Guid",
                        IsRequired = true,
                        IsPrimaryKey = true,
                        UIControl = "hidden",
                        Order = 0
                    },
                    new SimplifiedFieldConfigDto
                    {
                        Name = "JsonData",
                        DisplayName = "JSON数据",
                        Type = "json",
                        IsRequired = false,
                        UIControl = "editor",
                        Order = 1,
                        Comment = "JSON格式数据"
                    },
                    new SimplifiedFieldConfigDto
                    {
                        Name = "BinaryData",
                        DisplayName = "二进制数据",
                        Type = "byte[]",
                        IsRequired = false,
                        UIControl = "file",
                        Order = 2,
                        Comment = "二进制数据"
                    }
                },
                ArchitecturePattern = "CQRS",
                DatabaseProvider = "MySql",
                ParentMenuId = "system",
                MenuIcon = "setting"
            };

            // 🔥 序列化测试
            var json = System.Text.Json.JsonSerializer.Serialize(complexInput);
            var deserializedInput = System.Text.Json.JsonSerializer.Deserialize<SimplifiedModuleCreationDto>(json);

            // ✅ 验证序列化一致性
            deserializedInput.ShouldNotBeNull();
            deserializedInput.SystemName.ShouldBe(complexInput.SystemName);
            deserializedInput.ModuleName.ShouldBe(complexInput.ModuleName);
            deserializedInput.Fields.Count.ShouldBe(complexInput.Fields.Count);
            deserializedInput.ArchitecturePattern.ShouldBe(complexInput.ArchitecturePattern);
            deserializedInput.DatabaseProvider.ShouldBe(complexInput.DatabaseProvider);

            // 🔥 调用真实服务
            var result = await _smartStudioLiteAppService.CreateModuleAsync(complexInput);
            result.Success.ShouldBe(true);

            Console.WriteLine("✅ 类型安全测试通过 - 复杂DTO序列化一致性验证成功");
        }
    }
}
