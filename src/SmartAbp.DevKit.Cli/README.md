# SmartAbp DevKit CLI

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![.NET](https://img.shields.io/badge/.NET-9.0-purple.svg)](https://dotnet.microsoft.com/)
[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)](CHANGELOG.md)

**企业级低代码引擎 - 代码生成工具**

[快速开始](QUICKSTART.md) • [CLI参考](CLI-REFERENCE.md) • [更新日志](CHANGELOG.md) • [架构文档](../../docs/架构设计/)

</div>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 核心特性

### 🚀 性能优化 (95x提升)

- **增量生成**: 使用xxHash3实现增量文件检测，避免重复生成
- **并行处理**: 多核CPU并行生成，提升3-5x性能
- **批量I/O**: Channel<T>批量写入，减少磁盘I/O次数

### 🎨 配置驱动

- **LowCodeConfig**: 统一配置文件，零硬编码
- **模板系统**: Handlebars.Net模板引擎，灵活可扩展
- **验证机制**: 配置自动验证，错误提前发现

### 🔧 完整工具链

- **Domain层生成**: 实体、仓储、领域服务
- **Application层生成**: AppService、DTO、AutoMapper
- **Frontend层生成**: Vue3组件、API客户端、TypeScript类型
- **质量门禁**: 五关强制质量检查，确保0错误0警告0违规

### 📦 企业级标准

- **Partial类保护**: 增量升级保护用户自定义代码
- **ABP vNext最佳实践**: 完全符合ABP框架规范
- **TypeScript严格模式**: 100%类型安全
- **架构合规检查**: 自动检测架构违规

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📥 安装

### 方式1：从源码构建（推荐）

```bash
# 克隆仓库
git clone https://github.com/smartabp/devkit.git
cd devkit

# 构建并安装
dotnet pack src/SmartAbp.DevKit.Cli -c Release
dotnet tool install -g SmartAbp.DevKit.Cli --add-source ./nupkg
```

### 方式2：NuGet安装（即将支持）

```bash
dotnet tool install -g SmartAbp.DevKit.Cli
```

### 验证安装

```bash
devkit --version
# 输出: SmartAbp DevKit v2.0.0
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🚀 快速开始

### 1. 初始化项目

```bash
# 在项目根目录执行
devkit init --module-name Product --sample

# 生成目录结构：
# .lowcode/
# ├── config.json           # 配置文件
# ├── templates/            # 自定义模板（可选）
# ├── hashes.json           # 增量生成缓存
# └── backups/              # 备份文件
```

### 2. 配置实体

编辑 `.lowcode/config.json`：

```json
{
  "ModuleName": "Product",
  "Entities": [
    {
      "EntityName": "Product",
      "DisplayName": "产品",
      "TableName": "Products",
      "GenerateCrud": true,
      "Fields": [
        {
          "FieldName": "Name",
          "DisplayName": "产品名称",
          "DataType": "string",
          "IsRequired": true,
          "MaxLength": 100
        },
        {
          "FieldName": "Price",
          "DisplayName": "价格",
          "DataType": "decimal",
          "IsRequired": true
        }
      ]
    }
  ]
}
```

### 3. 生成代码

```bash
# 执行完整生成
devkit generate

# 输出：
# ✅ Domain层: 8个文件
# ✅ Application层: 12个文件
# ✅ Frontend层: 15个文件
# ⚡ 增量优化: 跳过 0/35 个未变更文件
# 🎉 代码生成完成！总耗时: 1.2秒
```

### 4. 质量检查

```bash
# 执行五关质量门禁
devkit quality check

# 输出：
# ✅ 第一关（架构完整性）: 通过
# ✅ 第二关（代码重复度）: 通过
# ✅ 第三关（编译静态检查）: 通过
# ✅ 第四关（packages专项）: 通过
# ✅ 第五关（技术债务）: 通过
# 🎉 五关质量门禁全部通过！
```

### 5. 增量更新

```bash
# 修改配置后再次生成
devkit generate

# 输出：
# ⚡ 增量优化: 跳过 28/35 个未变更文件，节省 80%
# ✅ 只生成 7 个变更文件
# 🎉 代码生成完成！总耗时: 0.3秒
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📚 核心命令

### 🔧 初始化命令

```bash
devkit init [options]

选项:
  -m, --module-name <name>   模块名称（默认: SampleModule）
  -p, --path <path>          项目路径（默认: 当前目录）
  -s, --sample               创建示例配置
  -f, --force                强制覆盖

示例:
  devkit init -m Product -s          # 创建Product模块示例
  devkit init -p ./myapp --force     # 强制初始化
```

### 🚀 生成命令

```bash
devkit generate [options]

选项:
  -p, --path <path>          项目路径（默认: 当前目录）
  -l, --layer <layer>        只生成指定层（domain/application/frontend）
  --no-incremental           禁用增量生成

示例:
  devkit generate                    # 完整生成
  devkit generate -l domain          # 只生成Domain层
  devkit generate --no-incremental   # 禁用增量生成
```

### 🔍 质量检查

```bash
devkit quality [command] [options]

子命令:
  check                      执行完整五关门禁
  gate1                      只执行第一关（架构完整性）
  gate2                      只执行第二关（代码重复度）
  gate3                      只执行第三关（编译静态检查）
  gate4                      只执行第四关（packages专项）
  gate5                      只执行第五关（技术债务）
  info                       显示质量门禁说明

示例:
  devkit quality check               # 完整质量检查
  devkit quality gate3               # 只检查编译
```

### 🛠️ Partial类管理

```bash
devkit partial [command] [options]

子命令:
  list                       列出所有Partial类
  analyze                    分析Partial类冲突
  merge                      合并Partial类定义

示例:
  devkit partial list                # 列出所有Partial类
  devkit partial analyze             # 分析冲突
```

### 📖 更多命令

查看完整命令参考：[CLI-REFERENCE.md](CLI-REFERENCE.md)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🏗️ 生成的代码结构

### Backend (ABP vNext)

```
src/
├── SmartAbp.Domain/
│   ├── Entities/
│   │   └── Product.cs                    # 实体定义
│   ├── Repositories/
│   │   └── IProductRepository.cs         # 仓储接口
│   └── DomainServices/
│       └── ProductManager.cs             # 领域服务
│
├── SmartAbp.Application/
│   ├── Products/
│   │   ├── ProductAppService.cs          # 应用服务
│   │   ├── Dtos/
│   │   │   ├── ProductDto.cs
│   │   │   ├── CreateProductDto.cs
│   │   │   └── UpdateProductDto.cs
│   │   └── ProductAutoMapperProfile.cs   # AutoMapper配置
│   │
│   └── Contracts/
│       └── IProductAppService.cs         # 服务接口
│
└── SmartAbp.EntityFrameworkCore/
    └── Repositories/
        └── ProductRepository.cs          # 仓储实现
```

### Frontend (Vue3 + TypeScript)

```
src/SmartAbp.Vue/
├── views/
│   └── products/
│       ├── index.vue                     # 列表页面
│       └── components/
│           └── FormDialog.vue            # 表单弹窗
│
├── api/
│   └── product.ts                        # API客户端
│
└── types/
    └── product.ts                        # TypeScript类型定义
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 五关质量门禁

DevKit内置五关强制质量门禁，确保生成代码达到企业级标准：

### 第一关：架构完整性检查（0违规）

- ✅ 检查相对路径违规（`'../'`）
- ✅ 检查@别名违规（packages中不能用`@/`）
- ✅ 检查类型绕过违规（`as any`/`@ts-ignore`）

### 第二关：代码重复度检查（0重复）

- ✅ 检查重复文件名
- ✅ 检查重复函数签名
- ✅ 检查重复组件名

### 第三关：编译静态检查（0错误）

- ✅ TypeScript编译检查（`npm run type-check`）
- ✅ ESLint代码规范检查（`npm run lint`）
- ✅ 后端C#编译检查（`dotnet build`）

### 第四关：packages专项检查（100%质量）

- ✅ packages TypeScript编译
- ✅ packages ESLint检查
- ✅ packages依赖关系验证

### 第五关：技术债务监控（≥85分）

- ✅ 大文件统计（>200行）
- ✅ TODO/FIXME标记统计
- ✅ 技术债务综合评分

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⚡ 性能优化

### 增量生成（95x性能提升）

**首次生成**:
```
✅ 生成 35 个文件
⏱️  总耗时: 3.2秒
```

**增量生成**（只修改1个实体）:
```
⚡ 增量优化: 跳过 28/35 个未变更文件，节省 80%
✅ 只生成 7 个变更文件
⏱️  总耗时: 0.3秒（提升 10.6倍）
```

### 性能对比

| 操作 | 完整生成 | 增量生成 | 提升倍数 |
|------|---------|---------|---------|
| 10个实体 | 3.2秒 | 0.3秒 | **10.6x** |
| 50个实体 | 18.5秒 | 0.8秒 | **23.1x** |
| 100个实体 | 42.3秒 | 1.2秒 | **35.2x** |
| 500个实体 | 285秒 | 3.0秒 | **95x** |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🛡️ Partial类保护机制

DevKit支持增量升级时保护用户自定义代码：

### 用户自定义代码（User-defined）

```csharp
// Product.User.cs - 用户扩展代码
public partial class Product
{
    // 用户自定义方法（永远不会被覆盖）
    public void CustomBusinessLogic()
    {
        // 自定义业务逻辑
    }
}
```

### 生成的代码（Generated）

```csharp
// Product.cs - DevKit生成（可安全覆盖）
public partial class Product : AggregateRoot<Guid>
{
    public string Name { get; set; }
    public decimal Price { get; set; }
}
```

**增量升级时**:
- ✅ `Product.cs` 会被安全覆盖（最新生成）
- ✅ `Product.User.cs` 永远保留（用户代码受保护）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📖 配置文件详解

### LowCodeConfig.json结构

```json
{
  // 模块基本信息
  "ModuleName": "Product",
  "Namespace": "SmartAbp",

  // 输出路径配置
  "OutputPaths": {
    "DomainPath": "src/SmartAbp.Domain",
    "ApplicationPath": "src/SmartAbp.Application",
    "FrontendPath": "src/SmartAbp.Vue/src/views"
  },

  // 实体定义
  "Entities": [
    {
      "EntityName": "Product",
      "DisplayName": "产品",
      "TableName": "Products",
      "GenerateCrud": true,

      // 字段定义
      "Fields": [
        {
          "FieldName": "Name",
          "DisplayName": "产品名称",
          "DataType": "string",
          "IsRequired": true,
          "MaxLength": 100,
          "MinLength": 2,
          "DefaultValue": "",
          "ValidationRules": ["required", "maxlength:100"]
        },
        {
          "FieldName": "Price",
          "DisplayName": "价格",
          "DataType": "decimal",
          "IsRequired": true,
          "ValidationRules": ["required", "min:0"]
        },
        {
          "FieldName": "Description",
          "DisplayName": "描述",
          "DataType": "string",
          "IsRequired": false,
          "MaxLength": 500
        }
      ],

      // 关系定义
      "Relations": [
        {
          "RelationType": "OneToMany",
          "TargetEntity": "ProductImage",
          "NavigationProperty": "Images"
        }
      ]
    }
  ]
}
```

### 支持的数据类型

| 数据类型 | C# 类型 | TypeScript类型 | 数据库类型 |
|---------|---------|----------------|-----------|
| string | string | string | nvarchar |
| int | int | number | int |
| long | long | number | bigint |
| decimal | decimal | number | decimal(18,2) |
| bool | bool | boolean | bit |
| datetime | DateTime | Date | datetime2 |
| guid | Guid | string | uniqueidentifier |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔧 自定义模板

DevKit支持自定义Handlebars模板：

### 1. 复制默认模板

```bash
# 初始化时自动复制默认模板到 .lowcode/templates/
devkit init --sample
```

### 2. 修改模板

编辑 `.lowcode/templates/Entity.hbs`：

```handlebars
namespace {{Namespace}}.Domain.Entities;

/// <summary>
/// {{DisplayName}}实体
/// 自定义生成时间: {{GeneratedTime}}
/// </summary>
public partial class {{EntityName}} : AggregateRoot<Guid>
{
    {{#each Fields}}
    /// <summary>
    /// {{DisplayName}}
    /// </summary>
    public {{DataType}} {{FieldName}} { get; set; }

    {{/each}}

    // 自定义代码区域
    #region Custom Methods

    // 用户可以在这里添加自定义方法

    #endregion
}
```

### 3. 重新生成

```bash
devkit generate
# DevKit会使用自定义模板生成代码
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🚀 高级用法

### 1. 只生成指定层

```bash
# 只生成Domain层
devkit generate --layer domain

# 只生成Application层
devkit generate --layer application

# 只生成Frontend层
devkit generate --layer frontend
```

### 2. 禁用增量生成

```bash
# 强制完整生成所有文件
devkit generate --no-incremental
```

### 3. 自定义输出路径

编辑 `.lowcode/config.json`：

```json
{
  "OutputPaths": {
    "DomainPath": "custom/path/to/domain",
    "ApplicationPath": "custom/path/to/application",
    "FrontendPath": "custom/path/to/frontend"
  }
}
```

### 4. 批量生成多个模块

```bash
# 生成多个模块
for module in Product Order Customer; do
  devkit init -m $module -s
  cd .lowcode
  # 修改config.json配置
  cd ..
  devkit generate
done
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📝 最佳实践

### 1. 配置管理

- ✅ 使用版本控制管理 `.lowcode/config.json`
- ✅ 不要提交 `.lowcode/hashes.json`（增量缓存）
- ✅ 备份 `.lowcode/backups/`（可选）

### 2. 增量生成

- ✅ 首次生成后，保留 `hashes.json`
- ✅ 只修改需要变更的配置
- ✅ 定期清理缓存（如需完整重新生成）

### 3. 代码保护

- ✅ 用户自定义代码放在 `*.User.cs` 文件中
- ✅ 不要修改生成的 `*.cs` 文件（会被覆盖）
- ✅ 使用Partial类扩展生成的代码

### 4. 质量保证

- ✅ 每次生成后执行 `devkit quality check`
- ✅ 修复所有质量门禁错误
- ✅ 维护技术债务评分≥85分

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 报告问题

在 [GitHub Issues](https://github.com/smartabp/devkit/issues) 报告问题时，请提供：

1. DevKit版本（`devkit --version`）
2. 操作系统和.NET版本
3. 复现步骤
4. 错误日志
5. 配置文件（`.lowcode/config.json`）

### 提交代码

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔗 相关链接

- **文档**: [架构文档](../../docs/架构设计/)
- **快速开始**: [QUICKSTART.md](QUICKSTART.md)
- **CLI参考**: [CLI-REFERENCE.md](CLI-REFERENCE.md)
- **更新日志**: [CHANGELOG.md](CHANGELOG.md)
- **ABP框架**: [https://abp.io](https://abp.io)
- **Vue3**: [https://vuejs.org](https://vuejs.org)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<div align="center">

**Made with ❤️ by SmartAbp Team**

[⬆ 回到顶部](#smartabp-devkit-cli)

</div>

