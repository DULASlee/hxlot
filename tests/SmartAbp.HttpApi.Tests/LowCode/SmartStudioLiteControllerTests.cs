using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Shouldly;
using SmartAbp.Application.Contracts.LowCode;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using SmartAbp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Modularity;
using Xunit;

namespace SmartAbp.HttpApi.Tests.LowCode
{
    /// <summary>
    /// SmartStudioLite 控制器API测试
    /// 遵循"从花瓶到神器"六大铁律
    ///
    /// 铁律1: 页面完整性 - 路由、菜单、布局、权限、状态
    /// 铁律2: 控件完整性 - 事件绑定、数据来源、禁用状态、验证规则
    /// 铁律3: 前端API真实性 - 真实HTTP调用、禁止假数据、类型定义、错误处理
    /// 铁律4: 后端持久化 - Repository注入、数据库操作、事务管理
    /// 铁律5: DTO一致性 - 单一事实源、类型字段匹配、AutoMapper
    /// 铁律6: 代码复用 - DRY原则、模板检索
    /// </summary>
    public class SmartStudioLiteControllerTests : SmartAbpApplicationTestBase<SmartAbpApplicationTestModule>
    {
        private readonly ISmartStudioLiteAppService _appService;

        public SmartStudioLiteControllerTests()
        {
            _appService = GetRequiredService<ISmartStudioLiteAppService>();
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 铁律3：前端API真实性测试
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task API端点_创建模块_应返回成功结果()
        {
            // Arrange
            var input = CreateTestModuleInput("TestModule_Api1", "TestEntity_Api1");

            // Act
            var result = await _appService.CreateModuleAsync(input);

            // Assert
            result.ShouldNotBeNull();
            result.Success.ShouldBeTrue();
            result.Message.ShouldContain("成功");
            result.ModuleId.ShouldNotBe(Guid.Empty);
            result.EntityId.ShouldNotBe(Guid.Empty);
        }

        [Fact]
        public async Task API端点_预览文件_应返回文件列表()
        {
            // Arrange
            var input = CreateTestModuleInput("TestModule_Api2", "TestEntity_Api2");

            // Act
            var result = await _appService.PreviewGeneratedFilesAsync(input);

            // Assert
            result.ShouldNotBeNull();
            result.Items.ShouldNotBeEmpty();
            result.Items.Count.ShouldBeGreaterThan(10);

            // 验证包含必要的文件类型
            result.Items.ShouldContain(f => f.Contains("Domain"));
            result.Items.ShouldContain(f => f.Contains("Application"));
            result.Items.ShouldContain(f => f.Contains("HttpApi"));
            result.Items.ShouldContain(f => f.Contains("Vue"));
            result.Items.ShouldContain(f => f.Contains("UniApp"));
        }

        [Fact]
        public async Task API端点_验证配置_应检测配置错误()
        {
            // Arrange - 创建无效输入
            var input = CreateTestModuleInput("TestModule_Api3", "TestEntity_Api3");
            input.Fields.Clear(); // 清空字段

            // Act
            var result = await _appService.ValidateModuleConfigurationAsync(input);

            // Assert
            result.ShouldNotBeNull();
            result.IsValid.ShouldBeFalse();
            result.Errors.Items.ShouldNotBeEmpty();
            result.Errors.Items.Any(e => e.Message.Contains("至少需要配置一个字段")).ShouldBeTrue();
        }

        [Fact]
        public async Task API端点_创建模块_应正确处理请求数据()
        {
            // Arrange
            var input = CreateTestModuleInput("TestModule_Api4", "TestEntity_Api4");

            // Act
            var result = await _appService.CreateModuleAsync(input);

            // Assert
            result.ShouldNotBeNull();
            result.Success.ShouldBeTrue();
            result.SystemName.ShouldBe(input.SystemName);
            result.ModuleName.ShouldBe(input.ModuleName);
            result.EntityName.ShouldBe(input.EntityName);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 铁律5：DTO一致性测试
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task DTO一致性_请求数据_应正确映射到DTO()
        {
            // Arrange
            var input = CreateTestModuleInput("TestModule_Api5", "TestEntity_Api5");

            // Act
            var result = await _appService.CreateModuleAsync(input);

            // Assert
            result.ShouldNotBeNull();
            result.Success.ShouldBeTrue();

            // 验证DTO字段映射
            result.ModuleId.ShouldNotBeNull();
            result.EntityId.ShouldNotBeNull();
            result.SessionId.ShouldNotBeNull();
            result.Message.ShouldNotBeNull();
            result.GeneratedFiles.ShouldNotBeNull();
        }

        [Fact]
        public async Task DTO一致性_响应数据_应包含完整的响应字段()
        {
            // Arrange
            var input = CreateTestModuleInput("TestModule_Api6", "TestEntity_Api6");

            // Act
            var result = await _appService.PreviewGeneratedFilesAsync(input);

            // Assert
            result.ShouldNotBeNull();
            result.Items.ShouldNotBeNull();

            // 验证每个文件路径的格式
            foreach (var file in result.Items)
            {
                file.ShouldNotBeNull();
                file.ShouldNotBeEmpty();
                // 文件路径应包含目录结构
                file.ShouldContain("/");
            }
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 错误处理测试
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task 错误处理_缺少必需字段_应返回验证错误()
        {
            // Arrange - 创建缺少必需字段的输入
            var input = new SimplifiedModuleCreationDto
            {
                SystemName = "", // 空值
                ModuleName = "TestModule_Api7",
                DisplayName = "测试模块",
                EntityName = "TestEntity_Api7",
                EntityDisplayName = "测试实体"
            };

            // Act & Assert
            await Should.ThrowAsync<ArgumentException>(async () =>
            {
                await _appService.CreateModuleAsync(input);
            });
        }

        [Fact]
        public async Task 错误处理_重复模块名称_应返回验证错误()
        {
            // Arrange - 先创建一个模块
            var input1 = CreateTestModuleInput("DuplicateModule", "TestEntity_Api7");
            await _appService.CreateModuleAsync(input1);

            // Arrange - 尝试创建同名模块
            var input2 = CreateTestModuleInput("DuplicateModule", "TestEntity_Api8");

            // Act
            var result = await _appService.CreateModuleAsync(input2);

            // Assert
            result.Success.ShouldBeFalse();
            result.Message.ShouldContain("已存在");
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 性能测试
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task 性能测试_大量字段_应能处理复杂配置()
        {
            // Arrange - 创建包含大量字段的输入
            var input = CreateTestModuleInput("TestModule_Api9", "TestEntity_Api9");
            for (int i = 0; i < 20; i++)
            {
                input.Fields.Add(new SimplifiedFieldConfigDto
                {
                    Name = $"Field{i:D2}",
                    DisplayName = $"字段{i:D2}",
                    Type = i % 2 == 0 ? "string" : "int",
                    IsRequired = i % 3 == 0,
                    MaxLength = i % 2 == 0 ? 200 : null,
                    Order = i + 4,
                    Comment = $"字段{i:D2}的注释"
                });
            }

            // Act
            var result = await _appService.PreviewGeneratedFilesAsync(input);

            // Assert
            result.ShouldNotBeNull();
            result.Items.ShouldNotBeEmpty();
            // 应包含所有必要的文件类型
            result.Items.Count.ShouldBeGreaterThan(15);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 辅助方法
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private SimplifiedModuleCreationDto CreateTestModuleInput(string moduleName, string entityName)
        {
            return new SimplifiedModuleCreationDto
            {
                SystemName = "SmartAbp",
                ModuleName = moduleName,
                DisplayName = "测试模块",
                EntityName = entityName,
                EntityDisplayName = "测试实体",
                Description = "API测试模块",
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
                        MaxLength = 100,
                        Order = 1,
                        UIControl = "input"
                    },
                    new SimplifiedFieldConfigDto
                    {
                        Name = "Description",
                        DisplayName = "描述",
                        Type = "text",
                        IsRequired = false,
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
}
