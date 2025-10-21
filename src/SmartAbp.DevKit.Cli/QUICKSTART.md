# 快速开始指南

**SmartAbp DevKit v2.0** - 5分钟快速上手

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📋 前提条件

- ✅ .NET 9.0 SDK
- ✅ Node.js 20+ (如需生成前端代码)
- ✅ 已有ABP vNext项目（或创建新项目）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 步骤1: 安装DevKit

### 从源码安装

```bash
# 克隆仓库
git clone https://github.com/smartabp/devkit.git
cd devkit

# 构建并安装
dotnet pack src/SmartAbp.DevKit.Cli -c Release
dotnet tool install -g SmartAbp.DevKit.Cli --add-source ./nupkg

# 验证安装
devkit --version
# 输出: SmartAbp DevKit v2.0.0
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 步骤2: 初始化项目

进入你的ABP项目根目录：

```bash
cd /path/to/your/abp-project

# 初始化DevKit项目（创建示例配置）
devkit init --module-name Product --sample

# 生成的目录结构：
# .lowcode/
# ├── config.json           # ✅ 配置文件
# ├── templates/            # ✅ 自定义模板（可选）
# ├── hashes.json           # ✅ 增量生成缓存
# └── backups/              # ✅ 备份文件
```

**输出示例**:
```
🚀 DevKit项目初始化启动...
✅ 创建目录: .lowcode
✅ 创建示例配置: config.json
✅ 复制默认模板: templates/
✅ DevKit项目初始化成功: /path/to/your/abp-project
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 步骤3: 配置实体定义

编辑 `.lowcode/config.json`：

```json
{
  "ModuleName": "Product",
  "Namespace": "SmartAbp",
  "OutputPaths": {
    "DomainPath": "src/SmartAbp.Domain",
    "ApplicationPath": "src/SmartAbp.Application",
    "FrontendPath": "src/SmartAbp.Vue/src/views"
  },
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
        },
        {
          "FieldName": "Description",
          "DisplayName": "描述",
          "DataType": "string",
          "IsRequired": false,
          "MaxLength": 500
        },
        {
          "FieldName": "Stock",
          "DisplayName": "库存",
          "DataType": "int",
          "IsRequired": true
        }
      ]
    }
  ]
}
```

**配置说明**:
- `ModuleName`: 模块名称（如：Product, Order）
- `Namespace`: 项目命名空间（如：SmartAbp）
- `OutputPaths`: 代码生成输出路径
- `Entities`: 实体定义列表

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 步骤4: 生成代码

### 执行完整生成

```bash
devkit generate
```

**输出示例**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 开始执行AI工作流...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 开始代码生成: /path/to/your/abp-project (增量模式: ✅)
✅ 配置加载成功: 模块=Product, 实体数=1

🔨 正在生成Domain层代码...
✅ Domain层生成完成: 8个文件

🔨 正在生成Application层代码...
✅ Application层生成完成: 12个文件

🔨 正在生成Frontend层代码...
✅ Frontend层生成完成: 15个文件

🎉 代码生成完成！总文件=35, 写入=35, 跳过=0, 耗时=3200ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ AI工作流执行成功！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 生成的文件清单

**Domain层 (8个文件)**:
```
src/SmartAbp.Domain/
├── Entities/
│   └── Product.cs                    # 实体定义
├── Repositories/
│   └── IProductRepository.cs         # 仓储接口
└── DomainServices/
    └── ProductManager.cs             # 领域服务
```

**Application层 (12个文件)**:
```
src/SmartAbp.Application/
├── Products/
│   ├── ProductAppService.cs          # 应用服务
│   ├── Dtos/
│   │   ├── ProductDto.cs
│   │   ├── CreateProductDto.cs
│   │   ├── UpdateProductDto.cs
│   │   └── GetProductListDto.cs
│   └── ProductAutoMapperProfile.cs   # AutoMapper配置
└── Contracts/
    └── IProductAppService.cs         # 服务接口
```

**Frontend层 (15个文件)**:
```
src/SmartAbp.Vue/src/
├── views/
│   └── products/
│       ├── index.vue                 # 列表页面（含增删改查）
│       └── components/
│           └── FormDialog.vue        # 表单弹窗
├── api/
│   └── product.ts                    # API客户端
├── types/
│   └── product.ts                    # TypeScript类型定义
└── stores/
    └── product.ts                    # Pinia状态管理
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 步骤5: 质量检查

```bash
devkit quality check
```

**输出示例**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 开始执行五关质量门禁
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏗️  第一关：架构完整性检查
   ✅ 第一关: 通过

🔄 第二关：代码重复度检查
   ✅ 第二关: 通过

⚡ 第三关：编译静态检查
   ✅ 第三关: 通过

🎯 第四关：packages专项检查
   ✅ 第四关: 通过

🚀 第五关：技术债务监控
   ✅ 第五关: 通过

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 五关质量门禁全部通过！耗时: 8500ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 步骤6: 运行项目

### 后端启动

```bash
cd src/SmartAbp.DbMigrator
dotnet run  # 执行数据库迁移

cd ../SmartAbp.HttpApi.Host
dotnet run  # 启动API服务
```

### 前端启动

```bash
cd src/SmartAbp.Vue
npm install
npm run dev
```

### 访问应用

- 前端：http://localhost:5173
- 后端API：http://localhost:5000/swagger

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 步骤7: 增量更新（可选）

假设你需要给Product实体添加新字段`Category`：

### 1. 修改配置

编辑 `.lowcode/config.json`，添加新字段：

```json
{
  "Fields": [
    ...
    {
      "FieldName": "Category",
      "DisplayName": "分类",
      "DataType": "string",
      "IsRequired": false,
      "MaxLength": 50
    }
  ]
}
```

### 2. 重新生成

```bash
devkit generate
```

**输出示例**（增量优化）:
```
📦 开始代码生成: /path/to/your/abp-project (增量模式: ✅)
✅ 配置加载成功: 模块=Product, 实体数=1

🔨 正在生成Domain层代码...
✅ Domain层生成完成: 8个文件

🔨 正在生成Application层代码...
✅ Application层生成完成: 12个文件

🔨 正在生成Frontend层代码...
✅ Frontend层生成完成: 15个文件

🔍 开始增量检查...
⚡ 增量优化: 跳过 28/35 个未变更文件，节省 80%

🎉 代码生成完成！总文件=35, 写入=7, 跳过=28, 耗时=850ms
```

**性能对比**:
- 首次生成：3200ms（35个文件）
- 增量生成：850ms（7个变更文件）
- **提升**: 3.76倍

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 常见场景

### 场景1: 只生成后端代码

```bash
# 只生成Domain层
devkit generate --layer domain

# 只生成Application层
devkit generate --layer application
```

### 场景2: 禁用增量生成

```bash
# 强制完整生成所有文件
devkit generate --no-incremental
```

### 场景3: 批量生成多个实体

编辑 `.lowcode/config.json`：

```json
{
  "Entities": [
    {
      "EntityName": "Product",
      "DisplayName": "产品",
      ...
    },
    {
      "EntityName": "Category",
      "DisplayName": "分类",
      ...
    },
    {
      "EntityName": "Order",
      "DisplayName": "订单",
      ...
    }
  ]
}
```

然后执行：

```bash
devkit generate
# 一次性生成3个实体的所有代码
```

### 场景4: 自定义代码保护

创建用户自定义文件 `Product.User.cs`：

```csharp
// src/SmartAbp.Domain/Entities/Product.User.cs
namespace SmartAbp.Domain.Entities;

/// <summary>
/// Product实体 - 用户自定义扩展
/// </summary>
public partial class Product
{
    /// <summary>
    /// 自定义业务方法（不会被覆盖）
    /// </summary>
    public decimal CalculateDiscountedPrice(decimal discountRate)
    {
        return Price * (1 - discountRate);
    }

    /// <summary>
    /// 自定义验证逻辑
    /// </summary>
    public bool IsLowStock()
    {
        return Stock < 10;
    }
}
```

**增量生成时**:
- ✅ `Product.cs` 会被更新（生成的代码）
- ✅ `Product.User.cs` 永远保留（用户代码受保护）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🐛 故障排除

### 问题1: devkit命令未找到

**解决方案**:
```bash
# 重新安装
dotnet tool uninstall -g SmartAbp.DevKit.Cli
dotnet tool install -g SmartAbp.DevKit.Cli --add-source ./nupkg
```

### 问题2: 配置验证失败

**错误信息**: `配置验证失败: ModuleName不能为空`

**解决方案**:
检查 `.lowcode/config.json`，确保：
- `ModuleName` 不为空
- `Entities` 数组不为空
- 每个字段的 `DataType` 有效

### 问题3: 生成的代码编译错误

**解决方案**:
```bash
# 执行质量检查
devkit quality check

# 查看具体错误
devkit quality gate3  # 只检查编译
```

### 问题4: 增量生成未生效

**解决方案**:
```bash
# 清理缓存，强制完整生成
rm .lowcode/hashes.json
devkit generate
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📚 下一步

恭喜！你已经掌握了DevKit的基本用法。

**推荐阅读**:

1. [CLI命令参考](CLI-REFERENCE.md) - 完整的命令文档
2. [配置文件详解](README.md#配置文件详解) - 深入理解配置选项
3. [自定义模板](README.md#自定义模板) - 定制你的代码生成模板
4. [最佳实践](README.md#最佳实践) - 生产环境使用建议

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**需要帮助？**

- 📖 [完整文档](README.md)
- 🐛 [报告问题](https://github.com/smartabp/devkit/issues)
- 💬 [讨论交流](https://github.com/smartabp/devkit/discussions)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

