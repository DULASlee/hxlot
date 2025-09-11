# SmartAbp 代码模板库

## 📋 概述

这是SmartAbp项目的代码模板库，旨在为AI大模型提供标准化的代码生成模板，确保生成的代码符合项目架构和编程规范。

## 🏗️ 目录结构

```
templates/
├── backend/                    # 后端模板
│   ├── application/           # 应用服务层模板
│   ├── contracts/            # 契约层模板
│   ├── domain/               # 领域层模板
│   ├── httpapi/              # API控制器模板
│   └── entityframework/      # 数据访问层模板
├── frontend/                  # 前端模板
│   ├── components/           # Vue组件模板
│   ├── views/                # 页面视图模板
│   ├── stores/               # Pinia状态管理模板
│   ├── services/             # API服务模板
│   └── composables/          # 组合式函数模板
├── lowcode/                   # 低代码引擎模板
│   ├── plugins/              # 插件开发模板
│   ├── generators/           # 代码生成器模板
│   └── runtime/              # 运行时模板
└── docs/                      # 模板使用文档
```

## 🎯 使用原则

### AI大模型使用指南

1. **强制性模板检查**：在生成任何代码前，必须先搜索相关模板
2. **模板优先原则**：优先使用现有模板，而非从头编写
3. **参数化生成**：使用模板参数进行个性化定制
4. **合规性验证**：确保生成的代码符合模板约束

### 模板命名规范

- 模板文件：`{TemplateName}.template.{ext}`
- 元数据文件：`{TemplateName}.template.meta.yml`
- 示例文件：`{TemplateName}.example.{ext}`

## 🔍 AI搜索模式

### 搜索触发词

| 触发词 | 对应模板类别 | 示例 |
|--------|-------------|------|
| "CRUD服务" | backend/application | CrudAppService.template.cs |
| "管理页面" | frontend/views | CrudManagement.template.vue |
| "状态管理" | frontend/stores | EntityStore.template.ts |
| "权限定义" | backend/contracts | Permissions.template.cs |

### 搜索命令示例

```bash
# 搜索CRUD相关模板
glob "templates/**/*crud*.template.*"

# 搜索Vue组件模板
glob "templates/frontend/components/*.template.vue"

# 搜索应用服务模板
glob "templates/backend/application/*.template.cs"
```

## 📊 模板质量标准

- ✅ 语法正确性
- ✅ 项目规范一致性
- ✅ 依赖项完整性
- ✅ 权限定义完整性
- ✅ 测试覆盖率要求

## 🚀 快速开始

1. 确定需要生成的代码类型
2. 搜索相关模板：`glob "templates/**/*{keyword}*.template.*"`
3. 读取模板元数据文件
4. 应用模板参数
5. 生成并验证代码

## 📝 贡献指南

添加新模板时请：
1. 遵循命名规范
2. 提供完整的元数据文件
3. 包含使用示例
4. 确保代码质量