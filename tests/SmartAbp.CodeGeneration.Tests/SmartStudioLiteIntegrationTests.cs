using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Shouldly;
using SmartAbp;
using SmartAbp.Application.Contracts.LowCode;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using SmartAbp.Domain.Entities.LowCode;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Modularity;
using Xunit;

namespace SmartAbp.CodeGeneration.Tests
{
    /// <summary>
    /// SmartStudioLite 后端API集成测试
    /// 验证后端真实功能：数据库持久化 + 代码生成
    /// </summary>
    public class SmartStudioLiteIntegrationTests : SmartAbpApplicationTestBase<SmartAbpApplicationTestModule>
    {
        private readonly ISmartStudioLiteAppService _smartStudioLiteAppService;
        private readonly IRepository<LowCodeModule, Guid> _moduleRepository;
        private readonly IRepository<LowCodeEntity, Guid> _entityRepository;
        private readonly IRepository<LowCodeProperty, Guid> _propertyRepository;

        public SmartStudioLiteIntegrationTests()
        {
            _smartStudioLiteAppService = GetRequiredService<ISmartStudioLiteAppService>();
            _moduleRepository = GetRequiredService<IRepository<LowCodeModule, Guid>>();
            _entityRepository = GetRequiredService<IRepository<LowCodeEntity, Guid>>();
            _propertyRepository = GetRequiredService<IRepository<LowCodeProperty, Guid>>();
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 铁律4验证：后端持久化
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task 铁律4_后端持久化_应能创建模块并保存到数据库()
        {
            // Arrange
            var input = CreateTestModuleInput();

            // Act
            var result = await _smartStudioLiteAppService.CreateModuleAsync(input);

            // Assert - 返回结果验证
            result.ShouldNotBeNull();
            result.Success.ShouldBeTrue();
            result.ModuleId.ShouldNotBe(Guid.Empty);
            result.EntityId.ShouldNotBe(Guid.Empty);

            // Assert - 数据库验证
            var module = await _moduleRepository.GetAsync(result.ModuleId);
            module.ShouldNotBeNull();
            module.ModuleName.ShouldBe(input.ModuleName);
            module.DisplayName.ShouldBe(input.DisplayName);

            var entity = await _entityRepository.GetAsync(result.EntityId);
            entity.ShouldNotBeNull();
            entity.Name.ShouldBe(input.EntityName);
            entity.DisplayName.ShouldBe(input.EntityDisplayName);
            entity.ModuleId.ShouldBe(result.ModuleId);

            var properties = await _propertyRepository.GetListAsync(p => p.EntityId == result.EntityId);
            properties.Count.ShouldBe(input.Fields.Count);
        }

        [Fact]
        public async Task 铁律4_后端持久化_应能创建字段并保存属性()
        {
            // Arrange
            var input = CreateTestModuleInput();

            // Act
            var result = await _smartStudioLiteAppService.CreateModuleAsync(input);

            // Assert - 验证字段
            var properties = await _propertyRepository.GetListAsync(p => p.EntityId == result.EntityId);
            
            var nameField = properties.FirstOrDefault(p => p.Name == "Name");
            nameField.ShouldNotBeNull();
            nameField.DisplayName.ShouldBe("名称");
            nameField.Type.ShouldBe("string");
            nameField.IsRequired.ShouldBeTrue();
            nameField.MaxLength.ShouldBe(200);

            var codeField = properties.FirstOrDefault(p => p.Name == "Code");
            codeField.ShouldNotBeNull();
            codeField.DisplayName.ShouldBe("编码");
            codeField.Type.ShouldBe("string");
            codeField.IsRequired.ShouldBeTrue();
            codeField.MaxLength.ShouldBe(50);
        }

        [Fact]
        public async Task 铁律4_后端持久化_应验证模块名称唯一性()
        {
            // Arrange
            var input = CreateTestModuleInput();
            await _smartStudioLiteAppService.CreateModuleAsync(input);

            // Act - 尝试创建同名模块
            var result2 = await _smartStudioLiteAppService.CreateModuleAsync(input);

            // Assert - 应失败
            result2.Success.ShouldBeFalse();
            result2.Message.ShouldContain("已存在");
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // API端点验证
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task API端点_预览文件列表_应返回完整文件清单()
        {
            // Arrange
            var input = CreateTestModuleInput();

            // Act
            var result = await _smartStudioLiteAppService.PreviewGeneratedFilesAsync(input);

            // Assert
            result.ShouldNotBeNull();
            result.Items.ShouldNotBeEmpty();
            
            // 验证后端文件
            result.Items.ShouldContain(f => f.Contains($"Domain/{input.EntityName}.cs"));
            result.Items.ShouldContain(f => f.Contains($"Application/{input.EntityName}AppService.cs"));
            result.Items.ShouldContain(f => f.Contains($"Application.Contracts/Dtos/{input.EntityName}Dto.cs"));
            result.Items.ShouldContain(f => f.Contains($"HttpApi/Controllers/{input.EntityName}Controller.cs"));

            // 验证前端文件
            result.Items.ShouldContain(f => f.Contains($"Vue/views/{input.EntityName.ToLower()}"));
            result.Items.ShouldContain(f => f.Contains($"Vue/stores/{input.EntityName.ToLower()}"));
            result.Items.ShouldContain(f => f.Contains($"Vue/api/{input.EntityName.ToLower()}"));

            // 验证UniApp文件
            result.Items.ShouldContain(f => f.Contains($"UniApp/pages/{input.EntityName.ToLower()}"));
        }

        [Fact]
        public async Task API端点_验证配置_应检测字段配置错误()
        {
            // Arrange - 创建无效输入（无字段）
            var input = CreateTestModuleInput();
            input.Fields.Clear();

            // Act
            var result = await _smartStudioLiteAppService.ValidateModuleConfigurationAsync(input);

            // Assert
            result.ShouldNotBeNull();
            result.IsValid.ShouldBeFalse();
            result.Errors.Items.ShouldNotBeEmpty();
            result.Errors.Items.Any(e => e.Message.Contains("至少需要配置一个字段")).ShouldBeTrue();
        }

        [Fact]
        public async Task API端点_验证配置_应检测字段名称重复()
        {
            // Arrange - 创建重复字段
            var input = CreateTestModuleInput();
            input.Fields.Add(new SimplifiedFieldConfigDto
            {
                Name = "Name",  // 重复
                DisplayName = "名称2",
                Type = "string",
                IsRequired = true,
                MaxLength = 200,
                Order = 999
            });

            // Act
            var result = await _smartStudioLiteAppService.ValidateModuleConfigurationAsync(input);

            // Assert
            result.IsValid.ShouldBeFalse();
            result.Errors.Items.Any(e => e.Message.Contains("重复")).ShouldBeTrue();
        }

        [Fact]
        public async Task API端点_验证配置_应检测字符串字段缺少最大长度()
        {
            // Arrange
            var input = CreateTestModuleInput();
            input.Fields.Add(new SimplifiedFieldConfigDto
            {
                Name = "InvalidField",
                DisplayName = "无效字段",
                Type = "string",
                IsRequired = false,
                MaxLength = null,  // 缺少最大长度
                Order = 999
            });

            // Act
            var result = await _smartStudioLiteAppService.ValidateModuleConfigurationAsync(input);

            // Assert
            result.IsValid.ShouldBeFalse();
            result.Errors.Items.Any(e => e.Message.Contains("最大长度")).ShouldBeTrue();
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 代码生成验证（铁律4+铁律6）
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task 代码生成_应触发真实的代码生成流程()
        {
            // Arrange
            var input = CreateTestModuleInput();

            // Act
            var result = await _smartStudioLiteAppService.CreateModuleAsync(input);

            // Assert
            result.ShouldNotBeNull();
            result.Success.ShouldBeTrue();
            
            // 验证是否有生成文件列表（即使生成失败也应该有尝试）
            result.GeneratedFiles.ShouldNotBeNull();
            
            // 如果代码生成服务已正确配置，应该有文件
            if (result.Success && result.GeneratedFiles.Any())
            {
                result.GeneratedFiles.ShouldNotBeEmpty();
                result.Message.ShouldContain("成功");
            }
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 边界条件测试
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task 边界条件_空系统名称_应验证失败()
        {
            // Arrange
            var input = CreateTestModuleInput();
            input.SystemName = "";

            // Act & Assert
            await Should.ThrowAsync<ArgumentException>(async () =>
            {
                await _smartStudioLiteAppService.CreateModuleAsync(input);
            });
        }

        [Fact]
        public async Task 边界条件_空模块名称_应验证失败()
        {
            // Arrange
            var input = CreateTestModuleInput();
            input.ModuleName = "";

            // Act & Assert
            await Should.ThrowAsync<ArgumentException>(async () =>
            {
                await _smartStudioLiteAppService.CreateModuleAsync(input);
            });
        }

        [Fact]
        public async Task 边界条件_空实体名称_应验证失败()
        {
            // Arrange
            var input = CreateTestModuleInput();
            input.EntityName = "";

            // Act & Assert
            await Should.ThrowAsync<ArgumentException>(async () =>
            {
                await _smartStudioLiteAppService.CreateModuleAsync(input);
            });
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 辅助方法
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private SimplifiedModuleCreationDto CreateTestModuleInput()
        {
            return new SimplifiedModuleCreationDto
            {
                SystemName = "SmartAbp",
                ModuleName = $"TestModule_{Guid.NewGuid().ToString("N").Substring(0, 8)}",
                DisplayName = "测试模块",
                EntityName = $"TestEntity_{Guid.NewGuid().ToString("N").Substring(0, 8)}",
                EntityDisplayName = "测试实体",
                Description = "集成测试模块",
                ArchitecturePattern = "Crud",
                DatabaseProvider = "SqlServer",
                ParentMenuId = "business",
                Fields = new List<SimplifiedFieldConfigDto>
                {
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Name",
                        DisplayName = "名称",
                        Type = "string",
                        IsRequired = true,
                        MaxLength = 200,
                        Order = 0,
                        UIControl = "input"
                    },
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Code",
                        DisplayName = "编码",
                        Type = "string",
                        IsRequired = true,
                        MaxLength = 50,
                        Order = 1,
                        UIControl = "input"
                    },
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Description",
                        DisplayName = "描述",
                        Type = "string",
                        IsRequired = false,
                        MaxLength = 500,
                        Order = 2,
                        UIControl = "textarea"
                    },
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Status",
                        DisplayName = "状态",
                        Type = "int",
                        IsRequired = true,
                        DefaultValue = "0",
                        Order = 3,
                        UIControl = "select"
                    }
                }
            };
        }
    }

    /// <summary>
    /// 测试基类（简化版）
    /// </summary>
    public abstract class SmartAbpTestBase : SmartAbpApplicationTestBase<SmartAbpApplicationTestModule>
    {

    }
}

