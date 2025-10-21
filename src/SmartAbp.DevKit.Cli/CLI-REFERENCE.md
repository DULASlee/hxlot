# CLI命令参考

**SmartAbp DevKit v2.0** - 完整命令行接口文档

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📋 目录

- [全局选项](#全局选项)
- [init 命令](#init-命令)
- [generate 命令](#generate-命令)
- [quality 命令](#quality-命令)
- [partial 命令](#partial-命令)
- [version 命令](#version-命令)
- [help 命令](#help-命令)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 全局选项

所有命令都支持以下全局选项：

| 选项 | 说明 | 示例 |
|------|------|------|
| `--help`, `-h` | 显示帮助信息 | `devkit --help` |
| `--version` | 显示版本信息 | `devkit --version` |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## init 命令

初始化DevKit项目，创建 `.lowcode/` 目录和配置文件。

### 语法

```bash
devkit init [选项]
```

### 选项

| 选项 | 别名 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--module-name` | `-m` | string | `SampleModule` | 模块名称 |
| `--path` | `-p` | string | `.` | 项目路径 |
| `--sample` | `-s` | bool | `false` | 创建示例配置 |
| `--force` | `-f` | bool | `false` | 强制覆盖已有配置 |

### 示例

#### 基本初始化
```bash
# 使用默认配置初始化
devkit init

# 生成的目录结构：
# .lowcode/
# ├── config.json
# ├── templates/
# ├── hashes.json
# └── backups/
```

#### 创建示例配置
```bash
# 创建带示例实体的配置
devkit init --module-name Product --sample

# config.json 包含完整的Product实体示例
```

#### 强制覆盖
```bash
# 强制覆盖已有配置（慎用！）
devkit init --force

# ⚠️  警告：会覆盖现有 .lowcode/config.json
```

#### 指定项目路径
```bash
# 在指定路径初始化
devkit init --path /path/to/your/project --module-name Order --sample
```

### 输出示例

```
🚀 DevKit项目初始化启动...
✅ 创建目录: .lowcode
✅ 创建配置文件: config.json
✅ 复制默认模板: templates/
✅ DevKit项目初始化成功: /path/to/your/project
```

### 生成的文件

| 文件/目录 | 说明 |
|----------|------|
| `.lowcode/config.json` | 主配置文件 |
| `.lowcode/templates/` | 自定义模板目录 |
| `.lowcode/hashes.json` | 增量生成哈希缓存 |
| `.lowcode/backups/` | 代码备份目录 |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## generate 命令

执行代码生成，根据 `.lowcode/config.json` 生成完整的代码。

### 语法

```bash
devkit generate [选项]
```

### 选项

| 选项 | 别名 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--path` | `-p` | string | `.` | 项目路径 |
| `--layer` | `-l` | string | `all` | 指定生成层（domain/application/frontend/all） |
| `--no-incremental` | - | bool | `false` | 禁用增量生成 |

### 示例

#### 完整生成
```bash
# 生成所有层（Domain + Application + Frontend）
devkit generate

# 输出：
# 🔨 正在生成Domain层代码...
# ✅ Domain层生成完成: 8个文件
# 🔨 正在生成Application层代码...
# ✅ Application层生成完成: 12个文件
# 🔨 正在生成Frontend层代码...
# ✅ Frontend层生成完成: 15个文件
# 🎉 代码生成完成！总文件=35, 耗时=3200ms
```

#### 只生成指定层
```bash
# 只生成Domain层
devkit generate --layer domain

# 只生成Application层
devkit generate --layer application

# 只生成Frontend层
devkit generate --layer frontend
```

#### 禁用增量生成
```bash
# 强制完整生成所有文件（不跳过未变更文件）
devkit generate --no-incremental

# 输出：
# 🎉 代码生成完成！总文件=35, 写入=35, 跳过=0
```

#### 指定项目路径
```bash
# 在指定路径执行生成
devkit generate --path /path/to/your/project
```

### 增量生成示例

**首次生成**:
```bash
devkit generate
# 🎉 代码生成完成！总文件=35, 写入=35, 跳过=0, 耗时=3200ms
```

**修改配置后再次生成**（增量优化）:
```bash
devkit generate
# ⚡ 增量优化: 跳过 28/35 个未变更文件，节省 80%
# 🎉 代码生成完成！总文件=35, 写入=7, 跳过=28, 耗时=850ms
```

### 生成的代码结构

#### Domain层 (8个文件)
```
src/SmartAbp.Domain/
├── Entities/
│   └── {Entity}.cs
├── Repositories/
│   └── I{Entity}Repository.cs
└── DomainServices/
    └── {Entity}Manager.cs
```

#### Application层 (12个文件)
```
src/SmartAbp.Application/
├── {Module}/
│   ├── {Entity}AppService.cs
│   ├── Dtos/
│   │   ├── {Entity}Dto.cs
│   │   ├── Create{Entity}Dto.cs
│   │   └── Update{Entity}Dto.cs
│   └── {Entity}AutoMapperProfile.cs
└── Contracts/
    └── I{Entity}AppService.cs
```

#### Frontend层 (15个文件)
```
src/SmartAbp.Vue/src/
├── views/{entity}/
│   ├── index.vue
│   └── components/
│       └── FormDialog.vue
├── api/{entity}.ts
└── types/{entity}.ts
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## quality 命令

执行五关质量门禁检查，确保生成的代码符合企业级标准。

### 语法

```bash
devkit quality [子命令] [选项]
```

### 子命令

| 子命令 | 说明 |
|--------|------|
| `check` | 执行完整五关门禁 |
| `gate1` | 只执行第一关（架构完整性检查） |
| `gate2` | 只执行第二关（代码重复度检查） |
| `gate3` | 只执行第三关（编译静态检查） |
| `gate4` | 只执行第四关（packages专项检查） |
| `gate5` | 只执行第五关（技术债务监控） |
| `info` | 显示质量门禁说明 |

### 选项

| 选项 | 别名 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--path` | `-p` | string | `.` | 项目路径 |

### 示例

#### 执行完整五关门禁
```bash
devkit quality check

# 输出：
# 🏗️  第一关：架构完整性检查
#    ✅ 第一关: 通过
# 🔄 第二关：代码重复度检查
#    ✅ 第二关: 通过
# ⚡ 第三关：编译静态检查
#    ✅ 第三关: 通过
# 🎯 第四关：packages专项检查
#    ✅ 第四关: 通过
# 🚀 第五关：技术债务监控
#    ✅ 第五关: 通过
# 🎉 五关质量门禁全部通过！
```

#### 只执行单个门禁
```bash
# 只检查架构完整性
devkit quality gate1

# 只检查编译
devkit quality gate3

# 只检查技术债务
devkit quality gate5
```

#### 查看质量门禁说明
```bash
devkit quality info

# 输出：
# 📚 DevKit 五关质量门禁说明
#
# 核心理念:
#   • 五关强制质量门禁，确保生成代码0错误0警告0违规
#   • 自动化质量检查，无需人工干预
#   • 企业级质量标准，代码质量≥95分
# ...
```

### 五关门禁详解

#### 第一关：架构完整性检查（0违规）
- ✅ 检查相对路径违规（`'../'`）
- ✅ 检查@别名违规（packages中不能用`@/`）
- ✅ 检查类型绕过违规（`as any`/`@ts-ignore`）

**通过标准**: 0个架构违规

#### 第二关：代码重复度检查（0重复）
- ✅ 检查重复文件名
- ✅ 检查重复函数签名
- ✅ 检查重复组件名

**通过标准**: 0个重复问题

#### 第三关：编译静态检查（0错误）
- ✅ TypeScript编译检查（`npm run type-check`）
- ✅ ESLint代码规范检查（`npm run lint`）
- ✅ 后端C#编译检查（`dotnet build`）

**通过标准**: 0个编译错误

#### 第四关：packages专项检查（100%质量）
- ✅ packages TypeScript项目引用编译
- ✅ packages ESLint专项检查
- ✅ packages依赖关系验证

**通过标准**: 0个packages问题

#### 第五关：技术债务监控（≥85分）
- ✅ 大文件统计（>200行，建议<10个）
- ✅ TODO/FIXME标记统计（建议<50个）
- ✅ 技术债务综合评分

**通过标准**: 评分≥85分

### 失败示例

```bash
devkit quality check

# 输出：
# ❌ 质量门禁检查失败！
#
# ❌ 第一关（架构完整性）: 失败
#    发现 5 个架构违规
#    - 发现 3 处相对路径违规（'../'）
#    - 发现 2 处@别名违规
#
# ✅ 第二关（代码重复度）: 通过
# ❌ 第三关（编译静态检查）: 失败
#    发现 12 个编译错误
#    - TypeScript编译失败: 8个错误
#    - ESLint检查失败: 4个错误
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## partial 命令

管理Partial类，支持增量升级时保护用户自定义代码。

### 语法

```bash
devkit partial [子命令] [选项]
```

### 子命令

| 子命令 | 说明 |
|--------|------|
| `list` | 列出所有Partial类 |
| `analyze` | 分析Partial类冲突 |
| `merge` | 合并Partial类定义 |

### 选项

| 选项 | 别名 | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--path` | `-p` | string | `.` | 项目路径 |

### 示例

#### 列出所有Partial类
```bash
devkit partial list

# 输出：
# 📋 Partial类列表:
#
# 1. Product.cs (生成的)
#    文件: src/SmartAbp.Domain/Entities/Product.cs
#    行数: 45
#    最后修改: 2025-10-20 10:30:25
#
# 2. Product.User.cs (用户自定义)
#    文件: src/SmartAbp.Domain/Entities/Product.User.cs
#    行数: 28
#    最后修改: 2025-10-20 14:52:10
```

#### 分析Partial类冲突
```bash
devkit partial analyze

# 输出：
# 🔍 Partial类冲突分析:
#
# ✅ 无冲突: Product
#    - Product.cs: 生成的代码
#    - Product.User.cs: 用户自定义代码
#
# ⚠️  有冲突: Order
#    - Order.cs: 生成的代码（定义了方法 CalculateTotal）
#    - Order.User.cs: 用户代码（也定义了方法 CalculateTotal）
#    建议: 重命名用户代码中的方法
```

#### 合并Partial类定义
```bash
devkit partial merge

# 输出：
# 🔧 合并Partial类定义...
# ✅ 成功合并: Product
# ✅ 成功合并: Order
# 🎉 合并完成！
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## version 命令

显示DevKit CLI版本信息。

### 语法

```bash
devkit version
devkit --version
```

### 示例

```bash
devkit version

# 输出：
# SmartAbp DevKit v2.0.0
# 企业级代码生成工具
# https://github.com/smartabp/devkit
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## help 命令

显示帮助信息。

### 语法

```bash
devkit --help
devkit [command] --help
```

### 示例

#### 查看全局帮助
```bash
devkit --help

# 输出：
# Description:
#   SmartAbp DevKit - 企业级代码生成工具
#
# Usage:
#   devkit [command] [options]
#
# Options:
#   --version    显示版本信息
#   -h, --help   显示帮助信息
#
# Commands:
#   init         初始化DevKit项目
#   generate     生成代码
#   quality      质量门禁检查
#   partial      Partial类管理
#   version      显示版本信息
```

#### 查看特定命令帮助
```bash
# 查看init命令帮助
devkit init --help

# 查看generate命令帮助
devkit generate --help

# 查看quality命令帮助
devkit quality --help
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 常见命令组合

### 完整工作流

```bash
# 1. 初始化项目
devkit init --module-name Product --sample

# 2. 编辑配置
vim .lowcode/config.json

# 3. 生成代码
devkit generate

# 4. 质量检查
devkit quality check

# 5. 如果质量检查失败，只检查编译
devkit quality gate3

# 6. 修复错误后重新生成
devkit generate

# 7. 再次质量检查
devkit quality check
```

### 增量开发工作流

```bash
# 1. 首次生成
devkit generate

# 2. 修改配置（添加新字段）
vim .lowcode/config.json

# 3. 增量生成（只生成变更文件）
devkit generate

# 4. 质量检查
devkit quality check
```

### 只生成后端代码

```bash
# 1. 生成Domain层
devkit generate --layer domain

# 2. 生成Application层
devkit generate --layer application

# 3. 质量检查
devkit quality gate3  # 只检查编译
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🐛 故障排除

### 命令未找到

```bash
# 错误: devkit: command not found

# 解决方案：
# 1. 确认已安装
dotnet tool list -g | grep SmartAbp.DevKit.Cli

# 2. 如果未安装，重新安装
dotnet tool install -g SmartAbp.DevKit.Cli --add-source ./nupkg

# 3. 重启终端
```

### 配置验证失败

```bash
# 错误: 配置验证失败: ModuleName不能为空

# 解决方案：
# 检查 .lowcode/config.json
cat .lowcode/config.json

# 确保包含必要字段
{
  "ModuleName": "Product",  // ✅ 不能为空
  "Entities": [...]         // ✅ 不能为空
}
```

### 质量检查失败

```bash
# 错误: ❌ 第三关（编译静态检查）: 失败

# 解决方案：
# 1. 只检查编译
devkit quality gate3

# 2. 查看详细错误
cd src/SmartAbp.Vue
npm run type-check
npm run lint

# 3. 修复错误后重新生成
devkit generate

# 4. 再次质量检查
devkit quality check
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📚 相关文档

- [快速开始指南](QUICKSTART.md)
- [主文档](README.md)
- [更新日志](CHANGELOG.md)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**需要更多帮助？**

- 📖 [完整文档](README.md)
- 🐛 [报告问题](https://github.com/smartabp/devkit/issues)
- 💬 [讨论交流](https://github.com/smartabp/devkit/discussions)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

