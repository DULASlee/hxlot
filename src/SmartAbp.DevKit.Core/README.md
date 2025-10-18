# SmartAbp DevKit Core

## 📦 简介

SmartAbp DevKit Core是一个专为SmartAbp项目设计的全栈代码自动生成工具包，提供企业级的代码生成能力。

## ✨ 核心功能

### 6个代码生成器

1. **AppServiceGenerator** - 应用服务生成器
   - 生成ABP标准的CRUD服务接口和实现
   - 支持分页、排序、筛选

2. **ControllerGenerator** - 控制器生成器
   - 生成RESTful API控制器
   - 自动路由配置

3. **AutoMapperGenerator** - 映射配置生成器
   - 生成AutoMapper Profile
   - Entity ↔ DTO自动映射

4. **DbMigrationGenerator** - 数据库迁移生成器
   - 生成EF Core实体配置
   - DbContext配置片段

5. **UnitTestGenerator** - 单元测试生成器
   - AppService单元测试
   - Controller单元测试

6. **VueCrudPageGenerator** - Vue页面生成器
   - Vue 3列表页面
   - 表单弹窗组件
   - TypeScript API客户端
   - 类型定义文件

### 3大辅助工具类

- **StringHelper** - 字符串转换工具（PascalCase, camelCase, snake_case等）
- **TypeMapper** - 类型映射工具（C# → TypeScript, C# → SQL等）
- **ValidationHelper** - 验证规则生成工具

## 🚀 快速开始

### 安装

```bash
dotnet add package SmartAbp.DevKit.Core --version 0.1.0
```

### 配置

在项目根目录创建`devkit.config.json`：

```json
{
  "namespacePrefix": "YourProject",
  "backend": {
    "applicationNamespace": "Application",
    "contractsNamespace": "Application.Contracts"
  },
  "frontend": {
    "rootPath": "src/YourProject.Vue",
    "apiBaseUrl": "/api/app"
  }
}
```

### 使用示例

```csharp
// 1. 初始化SDK和生成器
var metadataSDK = new UnifiedMetadataSDK();
var templateManager = new TemplateManager();
var appServiceGenerator = new AppServiceGenerator(metadataSDK, templateManager);

// 2. 生成代码
var entityId = Guid.Parse("your-entity-id");
var result = await appServiceGenerator.GenerateAsync(entityId);

// 3. 输出代码
Console.WriteLine(result.InterfaceCode);
Console.WriteLine(result.ImplementationCode);
```

## 📋 系统要求

- .NET 9.0或更高版本
- Handlebars.Net 2.1.6
- Microsoft.CodeAnalysis.CSharp 4.14.0

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📧 联系方式

- 项目地址：https://github.com/SmartAbp/hxlot
- 文档：https://smartabp.com/docs

