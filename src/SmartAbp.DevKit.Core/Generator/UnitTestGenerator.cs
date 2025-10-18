using System;
using System.Linq;
using System.Threading.Task;
using HandlebarsDotNet;
using SmartAbp.DevKit.Core.Metadata;
using SmartAbp.DevKit.Core.Templates;
using SmartAbp.DevKit.Core.Helpers;

namespace SmartAbp.DevKit.Core.Generator;

/// <summary>
/// 单元测试生成器
/// Phase 2核心组件 - 生成完整的单元测试代码
/// </summary>
public class UnitTestGenerator : CodeGeneratorFramework<Guid, UnitTestGeneratorOutput>
{
    private readonly UnifiedMetadataSDK _metadataSDK;
    private readonly TemplateManager _templateManager;

    public UnitTestGenerator(
        UnifiedMetadataSDK metadataSDK,
        TemplateManager templateManager)
    {
        _metadataSDK = metadataSDK;
        _templateManager = templateManager;
        
        // 注册自定义Helpers
        _templateManager.RegisterHelpers();
    }

    public override async Task<UnitTestGeneratorOutput> GenerateAsync(Guid entityId)
    {
        // 1. 验证输入
        var validation = await ValidateInputAsync(entityId);
        if (!validation.IsValid)
        {
            throw new InvalidOperationException($"输入验证失败: {validation.ErrorMessage}");
        }

        // 2. 获取元数据
        var entity = _metadataSDK.GetEntity(entityId);
        if (entity == null)
            throw new InvalidOperationException($"Entity {entityId} not found");

        var properties = _metadataSDK.GetProperties(entityId);
        var primaryKeyType = _metadataSDK.GetPrimaryKeyType(entityId);

        // 3. 准备模板数据
        var templateData = PrepareTemplateData(entity, properties, primaryKeyType);

        // 4. 生成测试代码
        var appServiceTest = GenerateAppServiceTest(templateData);
        var controllerTest = GenerateControllerTest(templateData);

        return new UnitTestGeneratorOutput
        {
            AppServiceTestCode = appServiceTest,
            ControllerTestCode = controllerTest,
            EntityName = entity.Name
        };
    }

    public override Task<ValidationResult> ValidateInputAsync(Guid entityId)
    {
        if (_metadataSDK.GetEntity(entityId) == null)
        {
            return Task.FromResult(ValidationResult.Fail($"Entity with ID {entityId} not found."));
        }
        return Task.FromResult(ValidationResult.Success());
    }

    /// <summary>
    /// 准备模板数据
    /// </summary>
    private object PrepareTemplateData(dynamic entity, dynamic properties, string primaryKeyType)
    {
        var entityName = entity.Name;
        var entityNamePlural = StringHelper.Pluralize(entityName);
        var entityNameCamel = StringHelper.ToCamelCase(entityName);

        // 获取第一个字符串属性作为测试示例
        var sampleProperty = properties.FirstOrDefault(p => TypeMapper.IsStringType(p.Type));
        var samplePropertyName = sampleProperty?.Name ?? "Name";
        var samplePropertyCamel = StringHelper.ToCamelCase(samplePropertyName);

        return new
        {
            EntityName = entityName,
            EntityNamePlural = entityNamePlural,
            EntityNameCamel = entityNameCamel,
            PrimaryKeyType = primaryKeyType,
            
            // 示例属性
            SamplePropertyName = samplePropertyName,
            SamplePropertyCamel = samplePropertyCamel,
            
            // 命名空间
            TestNamespace = $"SmartAbp.Application.Tests.{entityName}",
            AppNamespace = $"SmartAbp.Application.{entityName}",
            ContractsNamespace = $"SmartAbp.Application.Contracts.{entityName}",
            DomainNamespace = $"SmartAbp.Domain.Entities.{entityName}",
            
            // DTO命名
            DtoName = $"{entityName}Dto",
            CreateDtoName = $"Create{entityName}Dto",
            UpdateDtoName = $"Update{entityName}Dto",
            GetListInputName = $"Get{entityNamePlural}Input",
            
            // 时间戳
            GeneratedTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            Year = DateTime.Now.Year
        };
    }

    /// <summary>
    /// 生成AppService测试代码
    /// </summary>
    private string GenerateAppServiceTest(object templateData)
    {
        var templateSource = @"using System;
using System.Threading.Tasks;
using Shouldly;
using Xunit;
using {{AppNamespace}};
using {{ContractsNamespace}}.Dtos;
using {{DomainNamespace}};
using Volo.Abp.Domain.Repositories;

namespace {{TestNamespace}}
{
    /// <summary>
    /// {{EntityName}}AppService单元测试
    /// 生成时间: {{GeneratedTime}}
    /// </summary>
    public class {{EntityName}}AppServiceTests : SmartAbpApplicationTestBase
    {
        private readonly I{{EntityName}}AppService _{{EntityNameCamel}}AppService;
        private readonly IRepository<{{EntityName}}, {{PrimaryKeyType}}> _{{EntityNameCamel}}Repository;

        public {{EntityName}}AppServiceTests()
        {
            _{{EntityNameCamel}}AppService = GetRequiredService<I{{EntityName}}AppService>();
            _{{EntityNameCamel}}Repository = GetRequiredService<IRepository<{{EntityName}}, {{PrimaryKeyType}}>>();
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Create 测试
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task Should_Create_{{EntityName}}()
        {
            // Arrange
            var createDto = new {{CreateDtoName}}
            {
                {{SamplePropertyName}} = ""Test {{EntityName}}""
                // 添加其他必填属性...
            };

            // Act
            var result = await _{{EntityNameCamel}}AppService.CreateAsync(createDto);

            // Assert
            result.ShouldNotBeNull();
            result.Id.ShouldNotBe(default({{PrimaryKeyType}}));
            result.{{SamplePropertyName}}.ShouldBe(createDto.{{SamplePropertyName}});

            // 验证数据库
            var entity = await _{{EntityNameCamel}}Repository.GetAsync(result.Id);
            entity.ShouldNotBeNull();
            entity.{{SamplePropertyName}}.ShouldBe(createDto.{{SamplePropertyName}});
        }

        [Fact]
        public async Task Should_Not_Create_{{EntityName}}_With_Invalid_Data()
        {
            // Arrange
            var createDto = new {{CreateDtoName}}
            {
                // 故意留空必填字段
            };

            // Act & Assert
            await Should.ThrowAsync<Exception>(async () =>
            {
                await _{{EntityNameCamel}}AppService.CreateAsync(createDto);
            });
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Update 测试
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task Should_Update_{{EntityName}}()
        {
            // Arrange
            var entity = await Create{{EntityName}}Async();
            var updateDto = new {{UpdateDtoName}}
            {
                {{SamplePropertyName}} = ""Updated {{EntityName}}""
                // 更新其他属性...
            };

            // Act
            var result = await _{{EntityNameCamel}}AppService.UpdateAsync(entity.Id, updateDto);

            // Assert
            result.ShouldNotBeNull();
            result.{{SamplePropertyName}}.ShouldBe(updateDto.{{SamplePropertyName}});

            // 验证数据库
            var updatedEntity = await _{{EntityNameCamel}}Repository.GetAsync(entity.Id);
            updatedEntity.{{SamplePropertyName}}.ShouldBe(updateDto.{{SamplePropertyName}});
        }

        [Fact]
        public async Task Should_Not_Update_NonExistent_{{EntityName}}()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();
            var updateDto = new {{UpdateDtoName}}
            {
                {{SamplePropertyName}} = ""Updated {{EntityName}}""
            };

            // Act & Assert
            await Should.ThrowAsync<Exception>(async () =>
            {
                await _{{EntityNameCamel}}AppService.UpdateAsync(nonExistentId, updateDto);
            });
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Get 测试
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task Should_Get_{{EntityName}}_By_Id()
        {
            // Arrange
            var entity = await Create{{EntityName}}Async();

            // Act
            var result = await _{{EntityNameCamel}}AppService.GetAsync(entity.Id);

            // Assert
            result.ShouldNotBeNull();
            result.Id.ShouldBe(entity.Id);
            result.{{SamplePropertyName}}.ShouldBe(entity.{{SamplePropertyName}});
        }

        [Fact]
        public async Task Should_Not_Get_NonExistent_{{EntityName}}()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();

            // Act & Assert
            await Should.ThrowAsync<Exception>(async () =>
            {
                await _{{EntityNameCamel}}AppService.GetAsync(nonExistentId);
            });
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // GetList 测试
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task Should_Get_List_Of_{{EntityNamePlural}}()
        {
            // Arrange
            await Create{{EntityName}}Async();
            await Create{{EntityName}}Async();
            var input = new {{GetListInputName}}
            {
                SkipCount = 0,
                MaxResultCount = 10
            };

            // Act
            var result = await _{{EntityNameCamel}}AppService.GetListAsync(input);

            // Assert
            result.ShouldNotBeNull();
            result.TotalCount.ShouldBeGreaterThanOrEqualTo(2);
            result.Items.Count.ShouldBeGreaterThanOrEqualTo(2);
        }

        [Fact]
        public async Task Should_Filter_{{EntityNamePlural}}_By_SearchTerm()
        {
            // Arrange
            await Create{{EntityName}}Async(""Test Search"");
            await Create{{EntityName}}Async(""Another {{EntityName}}"");
            var input = new {{GetListInputName}}
            {
                Filter = ""Test"",
                SkipCount = 0,
                MaxResultCount = 10
            };

            // Act
            var result = await _{{EntityNameCamel}}AppService.GetListAsync(input);

            // Assert
            result.ShouldNotBeNull();
            result.TotalCount.ShouldBeGreaterThanOrEqualTo(1);
            result.Items.ShouldContain(x => x.{{SamplePropertyName}}.Contains(""Test""));
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Delete 测试
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task Should_Delete_{{EntityName}}()
        {
            // Arrange
            var entity = await Create{{EntityName}}Async();

            // Act
            await _{{EntityNameCamel}}AppService.DeleteAsync(entity.Id);

            // Assert
            var deletedEntity = await _{{EntityNameCamel}}Repository.FindAsync(entity.Id);
            deletedEntity.ShouldBeNull();
        }

        [Fact]
        public async Task Should_Not_Delete_NonExistent_{{EntityName}}()
        {
            // Arrange
            var nonExistentId = Guid.NewGuid();

            // Act & Assert
            await Should.ThrowAsync<Exception>(async () =>
            {
                await _{{EntityNameCamel}}AppService.DeleteAsync(nonExistentId);
            });
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Helper 方法
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        private async Task<{{EntityName}}> Create{{EntityName}}Async(string {{SamplePropertyCamel}} = ""Test {{EntityName}}"")
        {
            var entity = new {{EntityName}}(
                Guid.NewGuid(),
                {{SamplePropertyCamel}}
                // 添加其他必填参数...
            );

            await _{{EntityNameCamel}}Repository.InsertAsync(entity, autoSave: true);
            return entity;
        }
    }
}
";

        var template = _templateManager.CompileTemplate(templateSource);
        return template(templateData);
    }

    /// <summary>
    /// 生成Controller测试代码
    /// </summary>
    private string GenerateControllerTest(object templateData)
    {
        var templateSource = @"using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Shouldly;
using Xunit;
using {{AppNamespace}};
using {{ContractsNamespace}};
using {{ContractsNamespace}}.Dtos;
using SmartAbp.HttpApi.Controllers.{{EntityName}};
using Volo.Abp.Application.Dtos;

namespace {{TestNamespace}}
{
    /// <summary>
    /// {{EntityName}}Controller单元测试
    /// 生成时间: {{GeneratedTime}}
    /// </summary>
    public class {{EntityName}}ControllerTests
    {
        private readonly I{{EntityName}}AppService _mockAppService;
        private readonly {{EntityName}}Controller _controller;

        public {{EntityName}}ControllerTests()
        {
            _mockAppService = Substitute.For<I{{EntityName}}AppService>();
            _controller = new {{EntityName}}Controller(_mockAppService);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // GetList 测试
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task GetList_Should_Return_Paged_Result()
        {
            // Arrange
            var input = new {{GetListInputName}} { SkipCount = 0, MaxResultCount = 10 };
            var expectedResult = new PagedResultDto<{{DtoName}}>(2, new[]
            {
                new {{DtoName}} { Id = Guid.NewGuid(), {{SamplePropertyName}} = ""Test1"" },
                new {{DtoName}} { Id = Guid.NewGuid(), {{SamplePropertyName}} = ""Test2"" }
            });

            _mockAppService.GetListAsync(input).Returns(expectedResult);

            // Act
            var result = await _controller.GetListAsync(input);

            // Assert
            result.ShouldNotBeNull();
            result.TotalCount.ShouldBe(2);
            result.Items.Count.ShouldBe(2);

            await _mockAppService.Received(1).GetListAsync(input);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Get 测试
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task Get_Should_Return_{{EntityName}}()
        {
            // Arrange
            var id = Guid.NewGuid();
            var expectedResult = new {{DtoName}} { Id = id, {{SamplePropertyName}} = ""Test"" };

            _mockAppService.GetAsync(id).Returns(expectedResult);

            // Act
            var result = await _controller.GetAsync(id);

            // Assert
            result.ShouldNotBeNull();
            result.Id.ShouldBe(id);
            result.{{SamplePropertyName}}.ShouldBe(""Test"");

            await _mockAppService.Received(1).GetAsync(id);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Create 测试
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task Create_Should_Return_Created_{{EntityName}}()
        {
            // Arrange
            var createDto = new {{CreateDtoName}} { {{SamplePropertyName}} = ""New {{EntityName}}"" };
            var expectedResult = new {{DtoName}} { Id = Guid.NewGuid(), {{SamplePropertyName}} = createDto.{{SamplePropertyName}} };

            _mockAppService.CreateAsync(createDto).Returns(expectedResult);

            // Act
            var result = await _controller.CreateAsync(createDto);

            // Assert
            result.ShouldNotBeNull();
            result.{{SamplePropertyName}}.ShouldBe(createDto.{{SamplePropertyName}});

            await _mockAppService.Received(1).CreateAsync(createDto);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Update 测试
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task Update_Should_Return_Updated_{{EntityName}}()
        {
            // Arrange
            var id = Guid.NewGuid();
            var updateDto = new {{UpdateDtoName}} { {{SamplePropertyName}} = ""Updated {{EntityName}}"" };
            var expectedResult = new {{DtoName}} { Id = id, {{SamplePropertyName}} = updateDto.{{SamplePropertyName}} };

            _mockAppService.UpdateAsync(id, updateDto).Returns(expectedResult);

            // Act
            var result = await _controller.UpdateAsync(id, updateDto);

            // Assert
            result.ShouldNotBeNull();
            result.Id.ShouldBe(id);
            result.{{SamplePropertyName}}.ShouldBe(updateDto.{{SamplePropertyName}});

            await _mockAppService.Received(1).UpdateAsync(id, updateDto);
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // Delete 测试
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        [Fact]
        public async Task Delete_Should_Call_AppService()
        {
            // Arrange
            var id = Guid.NewGuid();

            // Act
            await _controller.DeleteAsync(id);

            // Assert
            await _mockAppService.Received(1).DeleteAsync(id);
        }
    }
}
";

        var template = _templateManager.CompileTemplate(templateSource);
        return template(templateData);
    }
}

/// <summary>
/// 单元测试生成器输出
/// </summary>
public class UnitTestGeneratorOutput
{
    /// <summary>
    /// AppService测试代码
    /// </summary>
    public string AppServiceTestCode { get; set; } = default!;

    /// <summary>
    /// Controller测试代码
    /// </summary>
    public string ControllerTestCode { get; set; } = default!;

    /// <summary>
    /// 实体名称
    /// </summary>
    public string EntityName { get; set; } = default!;
}

