using System.Collections.Generic;
using System.Linq;
using SmartAbp.CodeGenerator.Services.Generators;
using SmartAbp.CodeGenerator.Services.V9;
using Xunit;
using Xunit.Abstractions;
using Shouldly;

namespace SmartAbp.Application.Tests.CodeGeneration
{
    /// <summary>
    /// 🧪 P0-1: 枚举生成器单元测试
    /// </summary>
    public class EnumGeneratorTests
    {
        private readonly ITestOutputHelper _output;
        private readonly EnumGenerator _generator;

        public EnumGeneratorTests(ITestOutputHelper output)
        {
            _output = output;
            _generator = new EnumGenerator();
        }

        [Fact]
        public void Should_Extract_Enums_From_Entity()
        {
            // Arrange
            var entity = CreateTenantEntity();

            // Act
            var enums = _generator.ExtractEnumsFromEntity(entity);

            // Assert
            enums.ShouldNotBeNull();
            enums.Count.ShouldBe(2); // TenantType和TenantStatus

            var tenantTypeEnum = enums.FirstOrDefault(e => e.Name == "TenantType");
            tenantTypeEnum.ShouldNotBeNull();
            tenantTypeEnum.Values.Count.ShouldBe(3);
            tenantTypeEnum.Values[0].Name.ShouldBe("Enterprise");
            tenantTypeEnum.Values[0].DisplayName.ShouldBe("企业租户");

            _output.WriteLine($"✅ 成功提取{enums.Count}个枚举");
        }

        [Fact]
        public void Should_Generate_CSharp_Enum_Code()
        {
            // Arrange
            var enumDef = CreateTenantStatusEnum();

            // Act
            var code = _generator.GenerateCSharpEnum(enumDef, "SmartAbp.Domain.Enums");

            // Assert
            code.ShouldNotBeNull();
            code.ShouldContain("namespace SmartAbp.Domain.Enums");
            code.ShouldContain("public enum TenantStatus");
            code.ShouldContain("Pending = 1");
            code.ShouldContain("Active = 2");
            code.ShouldContain("[Description(\"待审核\")]");
            code.ShouldContain("[Description(\"正常\")]");

            _output.WriteLine("✅ C#枚举代码生成成功:");
            _output.WriteLine(code);
        }

        [Fact]
        public void Should_Generate_TypeScript_Enum_Code()
        {
            // Arrange
            var enumDef = CreateTenantStatusEnum();

            // Act
            var code = _generator.GenerateTypeScriptEnum(enumDef);

            // Assert
            code.ShouldNotBeNull();
            code.ShouldContain("export enum TenantStatus {");
            code.ShouldContain("Pending = 1");
            code.ShouldContain("Active = 2");
            code.ShouldContain("export class TenantStatusHelper {");
            code.ShouldContain("static getLabel");
            code.ShouldContain("static getOptions");
            code.ShouldContain("static getColor");

            _output.WriteLine("✅ TypeScript枚举代码生成成功:");
            _output.WriteLine(code);
        }

        [Fact]
        public void Should_Generate_CSharp_Enum_Extensions()
        {
            // Arrange
            var enumDef = CreateTenantStatusEnum();

            // Act
            var code = _generator.GenerateCSharpEnumExtensions(enumDef, "SmartAbp.Domain.Enums");

            // Assert
            code.ShouldNotBeNull();
            code.ShouldContain("public static class TenantStatusExtensions");
            code.ShouldContain("public static string GetDisplayName(this TenantStatus value)");
            code.ShouldContain("GetCustomAttribute<DescriptionAttribute>");

            _output.WriteLine("✅ C#枚举扩展方法生成成功");
        }

        [Fact]
        public void Should_Generate_All_CSharp_Enums()
        {
            // Arrange
            var enums = new List<EnumDefinitionDto>
            {
                CreateTenantTypeEnum(),
                CreateTenantStatusEnum()
            };

            // Act
            var files = _generator.GenerateAllCSharpEnums(enums, "SmartAbp.Domain.Enums");

            // Assert
            files.ShouldNotBeNull();
            files.Count.ShouldBe(4); // 2个枚举 + 2个扩展类
            files.ShouldContainKey("TenantType.cs");
            files.ShouldContainKey("TenantTypeExtensions.cs");
            files.ShouldContainKey("TenantStatus.cs");
            files.ShouldContainKey("TenantStatusExtensions.cs");

            _output.WriteLine($"✅ 批量生成{files.Count}个C#文件:");
            foreach (var file in files)
            {
                _output.WriteLine($"  - {file.Key}");
            }
        }

        [Fact]
        public void Should_Generate_All_TypeScript_Enums()
        {
            // Arrange
            var enums = new List<EnumDefinitionDto>
            {
                CreateTenantTypeEnum(),
                CreateTenantStatusEnum()
            };

            // Act
            var files = _generator.GenerateAllTypeScriptEnums(enums);

            // Assert
            files.ShouldNotBeNull();
            files.Count.ShouldBe(3); // 2个枚举文件 + 1个index.ts
            files.ShouldContainKey("tenant-type.enum.ts");
            files.ShouldContainKey("tenant-status.enum.ts");
            files.ShouldContainKey("index.ts");

            var indexContent = files["index.ts"];
            indexContent.ShouldContain("export * from './tenant-type.enum'");
            indexContent.ShouldContain("export * from './tenant-status.enum'");

            _output.WriteLine($"✅ 批量生成{files.Count}个TypeScript文件:");
            foreach (var file in files)
            {
                _output.WriteLine($"  - {file.Key}");
            }
        }

        #region Test Data Helpers

        private EnhancedEntityModelDto CreateTenantEntity()
        {
            return new EnhancedEntityModelDto
            {
                Name = "Tenant",
                DisplayName = "租户",
                Properties = new List<EntityPropertyDto>
                {
                    new()
                    {
                        Name = "Type",
                        Type = "TenantType",
                        DisplayName = "租户类型",
                        EnumValues = new List<EnumValueDto>
                        {
                            new() { Name = "Enterprise", Value = 1, DisplayName = "企业租户" },
                            new() { Name = "Individual", Value = 2, DisplayName = "个人租户" },
                            new() { Name = "Trial", Value = 3, DisplayName = "试用租户" }
                        }
                    },
                    new()
                    {
                        Name = "Status",
                        Type = "TenantStatus",
                        DisplayName = "租户状态",
                        EnumValues = new List<EnumValueDto>
                        {
                            new() { Name = "Pending", Value = 1, DisplayName = "待审核" },
                            new() { Name = "Active", Value = 2, DisplayName = "正常" },
                            new() { Name = "Suspended", Value = 3, DisplayName = "已暂停" }
                        }
                    }
                }
            };
        }

        private EnumDefinitionDto CreateTenantTypeEnum()
        {
            return new EnumDefinitionDto
            {
                Name = "TenantType",
                DisplayName = "租户类型",
                Description = "多租户系统的租户类型分类",
                Values = new List<EnumValueDto>
                {
                    new() { Id = "1", Name = "Enterprise", Value = 1, DisplayName = "企业租户", Description = "正式企业客户" },
                    new() { Id = "2", Name = "Individual", Value = 2, DisplayName = "个人租户", Description = "个人用户" },
                    new() { Id = "3", Name = "Trial", Value = 3, DisplayName = "试用租户", Description = "试用期客户" }
                }
            };
        }

        private EnumDefinitionDto CreateTenantStatusEnum()
        {
            return new EnumDefinitionDto
            {
                Name = "TenantStatus",
                DisplayName = "租户状态",
                Description = "租户的生命周期状态",
                Values = new List<EnumValueDto>
                {
                    new() { Id = "1", Name = "Pending", Value = 1, DisplayName = "待审核", Description = "新创建，等待审核" },
                    new() { Id = "2", Name = "Active", Value = 2, DisplayName = "正常", Description = "正常使用中" }
                }
            };
        }

        #endregion
    }
}

