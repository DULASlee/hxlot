# 方案B - 优先级1：DevKit解耦重构详细开发计划

**版本**: v1.0
**日期**: 2025-10-21
**目标**: 将DevKit.Core从SmartAbp业务项目中完全解耦，打造独立NuGet包

---

## 第1章：项目概述

### 1.1 解耦目标

**当前问题**：
- DevKit.Core直接引用SmartAbp.Domain和SmartAbp.Application.Contracts
- 模板中硬编码SmartAbp命名空间和路径
- 无法作为独立NuGet包给其他项目使用

**解耦目标**：
- DevKit.Core零业务依赖，100%通用化
- 通过抽象层和配置实现业务适配
- 发布独立NuGet包，可被任意ABP项目引用

### 1.2 架构调整

```
DevKit.Abstractions（接口层，零依赖）
    ↑
DevKit.Core（内核实现，依赖抽象）
    ↑
SmartAbp.DevKit.Integration（SmartAbp适配层）
    ↑
SmartAbp.Application（业务层）
```

---

## 第2章：第1步 - 创建DevKit.Abstractions

### 2.1 开发任务

**任务2.1.1**: 创建项目结构
- 创建`src/SmartAbp.DevKit.Abstractions/SmartAbp.DevKit.Abstractions.csproj`
- 配置目标框架：`net8.0`
- 零外部依赖（除.NET标准库）

**任务2.1.2**: 定义核心接口
- `IMetadataProvider` - 元数据提供者接口
- `ICodeGenerator` - 代码生成器接口
- `ITemplateEngine` - 模板引擎接口
- `IConfigurationProvider` - 配置提供者接口

### 2.2 实现步骤

**步骤1**: 创建项目文件

```bash
mkdir src/SmartAbp.DevKit.Abstractions
cd src/SmartAbp.DevKit.Abstractions
```

创建`SmartAbp.DevKit.Abstractions.csproj`:
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <RootNamespace>SmartAbp.DevKit.Abstractions</RootNamespace>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>
```

**步骤2**: 创建接口文件

`Metadata/IMetadataProvider.cs`:
```csharp
namespace SmartAbp.DevKit.Abstractions.Metadata;

public interface IMetadataProvider
{
    Task<EntityMetadata> GetEntityMetadataAsync(Guid entityId);
    Task<ModuleMetadata> GetModuleMetadataAsync(Guid moduleId);
    Task<List<EntityMetadata>> GetAllEntitiesAsync(Guid moduleId);
}

public class EntityMetadata
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public List<PropertyMetadata> Properties { get; set; } = new();
}

public class PropertyMetadata
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsRequired { get; set; }
    public bool IsNullable { get; set; }
}

public class ModuleMetadata
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Namespace { get; set; } = string.Empty;
    public string OutputPath { get; set; } = string.Empty;
}
```

`Generation/ICodeGenerator.cs`:
```csharp
namespace SmartAbp.DevKit.Abstractions.Generation;

public interface ICodeGenerator
{
    Task<GenerationResult> GenerateAsync(GenerationInput input);
}

public class GenerationInput
{
    public Guid EntityId { get; set; }
    public GenerationOptions Options { get; set; } = new();
}

public class GenerationOptions
{
    public bool GenerateDomain { get; set; } = true;
    public bool GenerateApplication { get; set; } = true;
    public bool GenerateFrontend { get; set; } = true;
    public string NamespacePrefix { get; set; } = string.Empty;
    public string OutputBasePath { get; set; } = string.Empty;
}

public class GenerationResult
{
    public bool Success { get; set; }
    public Dictionary<string, string> GeneratedFiles { get; set; } = new();
    public List<string> Errors { get; set; } = new();
}
```

`Templates/ITemplateEngine.cs`:
```csharp
namespace SmartAbp.DevKit.Abstractions.Templates;

public interface ITemplateEngine
{
    Task<string> RenderAsync(string templateName, object data);
    void RegisterTemplate(string name, string content);
}
```

`Configuration/IConfigurationProvider.cs`:
```csharp
namespace SmartAbp.DevKit.Abstractions.Configuration;

public interface IConfigurationProvider
{
    Task<DevKitConfiguration> GetConfigurationAsync();
}

public class DevKitConfiguration
{
    public string NamespacePrefix { get; set; } = string.Empty;
    public string DomainOutputPath { get; set; } = string.Empty;
    public string ApplicationOutputPath { get; set; } = string.Empty;
    public string FrontendOutputPath { get; set; } = string.Empty;
    public Dictionary<string, string> CustomSettings { get; set; } = new();
}
```

### 2.3 验收清单

- [ ] 项目编译通过，0错误0警告
- [ ] 所有接口定义完整，包含完整的XML注释
- [ ] 零外部依赖（仅依赖.NET 8.0标准库）
- [ ] 命名空间统一为`SmartAbp.DevKit.Abstractions.*`

---

## 第3章：第2步 - 重构DevKit.Core

### 3.1 开发任务

**任务3.1.1**: 移除业务依赖
- 删除对`SmartAbp.Domain`的ProjectReference
- 删除对`SmartAbp.Application.Contracts`的ProjectReference
- 添加对`SmartAbp.DevKit.Abstractions`的ProjectReference

**任务3.1.2**: 重构代码生成器
- `GeneratorOrchestrator`改为依赖`IMetadataProvider`
- 移除直接使用`EntityDefinitionDto`的代码
- 通过`IConfigurationProvider`获取配置

**任务3.1.3**: 重构模板系统
- 所有模板移除硬编码命名空间
- 使用占位符`{{namespacePrefix}}`
- 使用占位符`{{outputPath}}`

### 3.2 实现步骤

**步骤1**: 修改项目引用

`SmartAbp.DevKit.Core.csproj`:
```xml
<ItemGroup>
  <!-- 删除业务依赖 -->
  <!--
  <ProjectReference Include="..\SmartAbp.Domain\SmartAbp.Domain.csproj" />
  <ProjectReference Include="..\SmartAbp.Application.Contracts\SmartAbp.Application.Contracts.csproj" />
  -->

  <!-- 添加抽象层依赖 -->
  <ProjectReference Include="..\SmartAbp.DevKit.Abstractions\SmartAbp.DevKit.Abstractions.csproj" />
</ItemGroup>
```

**步骤2**: 重构GeneratorOrchestrator

`Generator/GeneratorOrchestrator.cs`:
```csharp
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.DevKit.Abstractions.Generation;
using SmartAbp.DevKit.Abstractions.Configuration;

public class GeneratorOrchestrator : ICodeGenerator
{
    private readonly IMetadataProvider _metadataProvider;
    private readonly IConfigurationProvider _configProvider;
    private readonly ITemplateEngine _templateEngine;
    private readonly ILogger<GeneratorOrchestrator> _logger;

    public GeneratorOrchestrator(
        IMetadataProvider metadataProvider,
        IConfigurationProvider configProvider,
        ITemplateEngine templateEngine,
        ILogger<GeneratorOrchestrator> logger)
    {
        _metadataProvider = metadataProvider;
        _configProvider = configProvider;
        _templateEngine = templateEngine;
        _logger = logger;
    }

    public async Task<GenerationResult> GenerateAsync(GenerationInput input)
    {
        var result = new GenerationResult();
        var config = await _configProvider.GetConfigurationAsync();
        var entity = await _metadataProvider.GetEntityMetadataAsync(input.EntityId);

        // 生成Domain层
        if (input.Options.GenerateDomain)
        {
            var domainCode = await _templateEngine.RenderAsync("Entity", new
            {
                NamespacePrefix = config.NamespacePrefix,
                EntityName = entity.Name,
                Properties = entity.Properties
            });
            result.GeneratedFiles[$"{config.DomainOutputPath}/{entity.Name}.cs"] = domainCode;
        }

        // 生成Application层
        if (input.Options.GenerateApplication)
        {
            var appServiceCode = await _templateEngine.RenderAsync("AppService", new
            {
                NamespacePrefix = config.NamespacePrefix,
                EntityName = entity.Name
            });
            result.GeneratedFiles[$"{config.ApplicationOutputPath}/{entity.Name}AppService.cs"] = appServiceCode;
        }

        result.Success = true;
        return result;
    }
}
```

**步骤3**: 重构模板文件

`Templates/Entity.hbs`:
```handlebars
// 修改前：
namespace SmartAbp.Domain.Entities.LowCode

// 修改后：
namespace {{namespacePrefix}}.Domain.Entities
```

`Templates/AppService.hbs`:
```handlebars
// 修改前：
using SmartAbp.Application.Contracts;

// 修改后：
using {{namespacePrefix}}.Application.Contracts;
```

`Templates/Controller.hbs`:
```handlebars
// 修改前：
namespace SmartAbp.HttpApi.Controllers

// 修改后：
namespace {{namespacePrefix}}.HttpApi.Controllers
```

### 3.3 验收清单

- [ ] 项目编译通过，0错误0警告
- [ ] 所有业务依赖已移除
- [ ] 所有Generator使用`IMetadataProvider`接口
- [ ] 所有模板使用占位符，无硬编码
- [ ] 单元测试通过（如有）

---

## 第4章：第3步 - 创建SmartAbp.DevKit.Integration

### 4.1 开发任务

**任务4.1.1**: 创建项目结构
- 创建`src/SmartAbp.DevKit.Integration/SmartAbp.DevKit.Integration.csproj`
- 引用`DevKit.Abstractions`和`DevKit.Core`
- 引用SmartAbp业务项目（Domain, Application.Contracts）

**任务4.1.2**: 实现适配器
- `SmartAbpMetadataProvider` - 适配SmartAbp元数据
- `SmartAbpConfigurationProvider` - 适配SmartAbp配置
- `SmartAbpDevKitModule` - ABP模块注册

### 4.2 实现步骤

**步骤1**: 创建项目文件

`SmartAbp.DevKit.Integration.csproj`:
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <RootNamespace>SmartAbp.DevKit.Integration</RootNamespace>
  </PropertyGroup>

  <ItemGroup>
    <ProjectReference Include="..\SmartAbp.DevKit.Abstractions\SmartAbp.DevKit.Abstractions.csproj" />
    <ProjectReference Include="..\SmartAbp.DevKit.Core\SmartAbp.DevKit.Core.csproj" />
    <ProjectReference Include="..\SmartAbp.Domain\SmartAbp.Domain.csproj" />
    <ProjectReference Include="..\SmartAbp.Application.Contracts\SmartAbp.Application.Contracts.csproj" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="Volo.Abp.Core" Version="8.0.0" />
  </ItemGroup>
</Project>
```

**步骤2**: 实现SmartAbpMetadataProvider

`Adapters/SmartAbpMetadataProvider.cs`:
```csharp
using SmartAbp.DevKit.Abstractions.Metadata;
using SmartAbp.Application.Contracts.LowCode.Dtos;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.DevKit.Integration.Adapters;

public class SmartAbpMetadataProvider : IMetadataProvider, ITransientDependency
{
    private readonly IRepository<LowCodeEntity, Guid> _entityRepository;
    private readonly IRepository<LowCodeModule, Guid> _moduleRepository;

    public SmartAbpMetadataProvider(
        IRepository<LowCodeEntity, Guid> entityRepository,
        IRepository<LowCodeModule, Guid> moduleRepository)
    {
        _entityRepository = entityRepository;
        _moduleRepository = moduleRepository;
    }

    public async Task<EntityMetadata> GetEntityMetadataAsync(Guid entityId)
    {
        var entity = await _entityRepository.GetAsync(entityId);
        return new EntityMetadata
        {
            Id = entity.Id,
            Name = entity.Name,
            DisplayName = entity.DisplayName ?? entity.Name,
            Properties = entity.Fields.Select(f => new PropertyMetadata
            {
                Name = f.Name,
                Type = f.Type,
                IsRequired = f.IsRequired,
                IsNullable = f.IsNullable
            }).ToList()
        };
    }

    public async Task<ModuleMetadata> GetModuleMetadataAsync(Guid moduleId)
    {
        var module = await _moduleRepository.GetAsync(moduleId);
        return new ModuleMetadata
        {
            Id = module.Id,
            Name = module.Name,
            Namespace = "SmartAbp", // SmartAbp特定配置
            OutputPath = "src/" // SmartAbp特定配置
        };
    }

    public async Task<List<EntityMetadata>> GetAllEntitiesAsync(Guid moduleId)
    {
        var entities = await _entityRepository.GetListAsync(e => e.ModuleId == moduleId);
        return entities.Select(e => new EntityMetadata
        {
            Id = e.Id,
            Name = e.Name,
            DisplayName = e.DisplayName ?? e.Name,
            Properties = e.Fields.Select(f => new PropertyMetadata
            {
                Name = f.Name,
                Type = f.Type,
                IsRequired = f.IsRequired,
                IsNullable = f.IsNullable
            }).ToList()
        }).ToList();
    }
}
```

**步骤3**: 实现SmartAbpConfigurationProvider

`Adapters/SmartAbpConfigurationProvider.cs`:
```csharp
using SmartAbp.DevKit.Abstractions.Configuration;
using Volo.Abp.DependencyInjection;

namespace SmartAbp.DevKit.Integration.Adapters;

public class SmartAbpConfigurationProvider : IConfigurationProvider, ITransientDependency
{
    public Task<DevKitConfiguration> GetConfigurationAsync()
    {
        return Task.FromResult(new DevKitConfiguration
        {
            NamespacePrefix = "SmartAbp",
            DomainOutputPath = "src/SmartAbp.Domain/Entities",
            ApplicationOutputPath = "src/SmartAbp.Application",
            FrontendOutputPath = "src/SmartAbp.Vue/src/views",
            CustomSettings = new Dictionary<string, string>
            {
                ["ProjectRoot"] = Directory.GetCurrentDirectory(),
                ["TemplateBasePath"] = "templates/"
            }
        });
    }
}
```

**步骤4**: 创建ABP模块

`SmartAbpDevKitModule.cs`:
```csharp
using Volo.Abp.Modularity;
using SmartAbp.DevKit.Core;

namespace SmartAbp.DevKit.Integration;

[DependsOn(typeof(DevKitCoreModule))]
public class SmartAbpDevKitModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        // 注册适配器
        context.Services.AddTransient<IMetadataProvider, SmartAbpMetadataProvider>();
        context.Services.AddTransient<IConfigurationProvider, SmartAbpConfigurationProvider>();
    }
}
```

### 4.3 验收清单

- [ ] 项目编译通过，0错误0警告
- [ ] SmartAbpMetadataProvider正确适配LowCodeEntity
- [ ] SmartAbpConfigurationProvider返回正确配置
- [ ] SmartAbpDevKitModule正确注册所有服务
- [ ] 依赖注入测试通过

---

## 第5章：第4步 - 更新SmartAbp.Application

### 5.1 开发任务

**任务5.1.1**: 移除DevKit.Core项目引用
- 删除对`SmartAbp.DevKit.Core`的ProjectReference
- 添加对`SmartAbp.DevKit.Integration`的ProjectReference

**任务5.1.2**: 更新代码生成服务
- 修改`CodeGenerationService`使用`ICodeGenerator`接口
- 移除直接使用DevKit内部类型

**任务5.1.3**: 更新ABP模块依赖
- `SmartAbpApplicationModule`添加对`SmartAbpDevKitModule`的依赖

### 5.2 实施步骤

**步骤1**: 修改项目引用

`SmartAbp.Application.csproj`:
```xml
<ItemGroup>
  <!-- 删除DevKit.Core直接引用 -->
  <!--
  <ProjectReference Include="..\SmartAbp.DevKit.Core\SmartAbp.DevKit.Core.csproj" />
  -->

  <!-- 添加Integration层引用 -->
  <ProjectReference Include="..\SmartAbp.DevKit.Integration\SmartAbp.DevKit.Integration.csproj" />
</ItemGroup>
```

**步骤2**: 重构CodeGenerationService

`LowCode/CodeGenerationService.cs`:
```csharp
using SmartAbp.DevKit.Abstractions.Generation;

public class CodeGenerationService : ApplicationService, ITransientDependency
{
    private readonly ICodeGenerator _codeGenerator;
    private readonly ILogger<CodeGenerationService> _logger;

    public CodeGenerationService(
        ICodeGenerator codeGenerator,
        ILogger<CodeGenerationService> logger)
    {
        _codeGenerator = codeGenerator;
        _logger = logger;
    }

    public async Task<CodeGenerationResultDto> GenerateAsync(Guid entityId)
    {
        var input = new GenerationInput
        {
            EntityId = entityId,
            Options = new GenerationOptions
            {
                GenerateDomain = true,
                GenerateApplication = true,
                GenerateFrontend = true
            }
        };

        var result = await _codeGenerator.GenerateAsync(input);

        return new CodeGenerationResultDto
        {
            Success = result.Success,
            FilesGenerated = result.GeneratedFiles.Count,
            Errors = result.Errors
        };
    }
}
```

**步骤3**: 更新ABP模块

`SmartAbpApplicationModule.cs`:
```csharp
using SmartAbp.DevKit.Integration;

[DependsOn(
    typeof(SmartAbpDomainModule),
    typeof(SmartAbpApplicationContractsModule),
    typeof(SmartAbpDevKitModule) // 添加DevKit模块依赖
)]
public class SmartAbpApplicationModule : AbpModule
{
    // ...
}
```

### 5.3 验收清单

- [ ] 项目编译通过，0错误0警告
- [ ] CodeGenerationService使用ICodeGenerator接口
- [ ] 所有DevKit功能正常工作
- [ ] 单元测试通过
- [ ] 集成测试通过

---

## 第6章：第5步 - 迁移代码生成逻辑

### 6.1 开发任务

**任务6.1.1**: 识别现有生成逻辑
- 搜索所有直接调用`GeneratorOrchestrator`的代码
- 搜索所有直接使用DevKit内部类型的代码

**任务6.1.2**: 统一使用DevKit API
- 将所有生成逻辑改为调用`ICodeGenerator.GenerateAsync`
- 移除对DevKit内部实现的直接依赖

### 6.2 实施步骤

**步骤1**: 搜索现有代码生成调用

```bash
grep -r "GeneratorOrchestrator" src/SmartAbp.Application/
grep -r "DevKit.Core" src/SmartAbp.Application/
```

**步骤2**: 重构所有调用点

示例1 - 异步代码生成:
```csharp
// 修改前：
var orchestrator = new GeneratorOrchestrator(...);
var result = await orchestrator.GenerateAsync(config);

// 修改后：
var input = new GenerationInput { EntityId = entityId };
var result = await _codeGenerator.GenerateAsync(input);
```

示例2 - 批量生成:
```csharp
// 修改前：
foreach (var entity in entities)
{
    var result = await _orchestrator.GenerateForEntityAsync(entity);
}

// 修改后：
foreach (var entity in entities)
{
    var input = new GenerationInput { EntityId = entity.Id };
    var result = await _codeGenerator.GenerateAsync(input);
}
```

**步骤3**: 验证所有功能

- 手动测试单实体生成
- 手动测试批量生成
- 手动测试增量生成
- 手动测试升级场景

### 6.3 验收清单

- [ ] 所有代码生成逻辑已迁移到DevKit API
- [ ] 无直接依赖DevKit.Core内部类型
- [ ] 所有功能测试通过
- [ ] 性能无明显下降

---

## 第7章：第6步 - 发布NuGet包

### 7.1 开发任务

**任务7.1.1**: 配置NuGet包元数据
- 设置包ID、版本、作者、描述
- 配置依赖关系
- 添加README和LICENSE

**任务7.1.2**: 打包发布
- 本地打包测试
- 发布到内部NuGet源
- 验证其他项目可引用

### 7.2 实施步骤

**步骤1**: 配置包元数据

`SmartAbp.DevKit.Abstractions.csproj`:
```xml
<PropertyGroup>
  <PackageId>SmartAbp.DevKit.Abstractions</PackageId>
  <Version>1.0.0</Version>
  <Authors>SmartAbp Team</Authors>
  <Company>SmartAbp</Company>
  <Description>DevKit抽象层，定义核心接口</Description>
  <PackageTags>lowcode;codegen;devkit</PackageTags>
  <RepositoryUrl>https://github.com/smartabp/devkit</RepositoryUrl>
  <PackageLicenseExpression>MIT</PackageLicenseExpression>
  <GeneratePackageOnBuild>true</GeneratePackageOnBuild>
</PropertyGroup>
```

`SmartAbp.DevKit.Core.csproj`:
```xml
<PropertyGroup>
  <PackageId>SmartAbp.DevKit.Core</PackageId>
  <Version>1.0.0</Version>
  <Authors>SmartAbp Team</Authors>
  <Description>DevKit核心实现，通用代码生成引擎</Description>
  <PackageTags>lowcode;codegen;devkit;core</PackageTags>
</PropertyGroup>

<ItemGroup>
  <PackageReference Include="SmartAbp.DevKit.Abstractions" Version="1.0.0" />
</ItemGroup>
```

**步骤2**: 本地打包测试

```bash
# 打包Abstractions
cd src/SmartAbp.DevKit.Abstractions
dotnet pack -c Release -o ../../nuget-packages

# 打包Core
cd ../SmartAbp.DevKit.Core
dotnet pack -c Release -o ../../nuget-packages

# 验证包内容
dotnet nuget list source
```

**步骤3**: 发布到NuGet源

```bash
# 配置NuGet源（内部源）
dotnet nuget add source http://your-nuget-server/nuget/v3/index.json --name InternalNuGet

# 推送包
dotnet nuget push nuget-packages/SmartAbp.DevKit.Abstractions.1.0.0.nupkg --source InternalNuGet --api-key YOUR_API_KEY
dotnet nuget push nuget-packages/SmartAbp.DevKit.Core.1.0.0.nupkg --source InternalNuGet --api-key YOUR_API_KEY
```

**步骤4**: 验证其他项目可引用

创建测试项目:
```bash
mkdir test-devkit-usage
cd test-devkit-usage
dotnet new console
dotnet add package SmartAbp.DevKit.Core --version 1.0.0
dotnet build
```

### 7.3 验收清单

- [ ] NuGet包成功打包，无错误
- [ ] 包元数据完整（版本、作者、描述等）
- [ ] 依赖关系正确
- [ ] 成功推送到NuGet源
- [ ] 其他项目可成功引用并编译

---

## 第8章：总验收清单

### 8.1 架构验收

- [ ] DevKit.Abstractions零依赖，仅依赖.NET 8.0
- [ ] DevKit.Core零业务依赖，仅依赖Abstractions
- [ ] SmartAbp.DevKit.Integration正确适配SmartAbp业务
- [ ] SmartAbp.Application通过Integration使用DevKit

### 8.2 功能验收

- [ ] 单实体代码生成功能正常
- [ ] 批量代码生成功能正常
- [ ] 增量代码生成功能正常
- [ ] 升级功能正常
- [ ] 所有模板正确使用占位符

### 8.3 质量验收

- [ ] 所有项目编译通过，0错误0警告
- [ ] 单元测试覆盖率≥80%
- [ ] 集成测试全部通过
- [ ] 性能无明显下降（±5%以内）

### 8.4 部署验收

- [ ] NuGet包成功发布
- [ ] 版本号符合语义化版本规范
- [ ] README和文档完整
- [ ] 其他团队可成功引用使用

### 8.5 回归验收

- [ ] SmartAbp项目所有功能正常
- [ ] 现有代码生成逻辑无破坏性变更
- [ ] 用户无感知升级
- [ ] 无性能回退

---

**文档结束 | 总行数：约750行**

