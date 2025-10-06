# 🎴 @smartabp/metadata-core 快速参考卡

> **一页纸掌握核心要点** | 打印贴在工位上 📌

---

## 🚀 5分钟快速开始

```bash
# 1. 安装
npm install @smartabp/metadata-core

# 2. 定义元数据
cat > book.metadata.ts << 'EOF'
export const BookMetadata = {
  name: "Book",
  module: "Library",
  keyType: "Guid",
  properties: [
    { name: "title", type: "string", isRequired: true, maxLength: 200 }
  ]
}
EOF

# 3. 生成代码
npm run codegen:entity -- --name=Book

# ✅ 完成！
```

---

## 📋 元数据模板

### 最小化实体

```typescript
export const MinimalEntity: EntityMetadata = {
  name: "Entity",           // ← PascalCase
  module: "Module",         // ← 模块名
  keyType: "Guid",          // ← 主键类型
  isAggregateRoot: true,
  isMultiTenant: true,
  isSoftDelete: true,
  hasExtraProperties: true,
  properties: [             // ← 至少1个属性
    {
      name: "name",         // ← camelCase
      type: "string",
      isRequired: true,
      isReadOnly: false,
      isUnique: false
    }
  ]
}
```

### 完整实体（复制粘贴）

```typescript
import { EntityMetadata } from '@smartabp/metadata-core'

export const ${EntityName}Metadata: EntityMetadata = {
  schemaVersion: "1.0.0",
  name: "${EntityName}",
  module: "${ModuleName}",
  description: "${描述}",
  aggregate: "${聚合根名称}",
  keyType: "Guid",
  isAggregateRoot: true,
  isMultiTenant: true,
  isSoftDelete: true,
  hasExtraProperties: true,
  
  properties: [
    {
      name: "${属性名}",
      type: "string",
      isRequired: true,
      isReadOnly: false,
      isUnique: false,
      maxLength: 200,
      minLength: 1,
      regex: "^[a-zA-Z0-9]+$",
      defaultValue: "",
      displayName: "${显示名}",
      description: "${描述}",
      validationRules: [
        {
          name: "custom",
          condition: "expression",
          errorMessage: "错误消息"
        }
      ]
    }
  ],
  
  navigationProperties: [
    {
      name: "${导航属性名}",
      targetEntity: "${目标实体}",
      relationType: "ManyToOne",
      foreignKey: "${外键名}",
      inverseName: "${反向属性名}"
    }
  ],
  
  xUiConfig: {
    listColumns: ["id", "name"],
    formFields: ["name"],
    searchFields: ["name"],
    defaultSort: "createdAt",
    pageSize: 20
  }
}
```

---

## 🎯 常用类型速查

### 基础类型

| 类型 | 说明 | C# | TypeScript |
|------|------|----|----|
| `string` | 字符串 | `string` | `string` |
| `int` | 整数 | `int` | `number` |
| `long` | 长整数 | `long` | `number` |
| `decimal` | 小数 | `decimal` | `number` |
| `bool` | 布尔 | `bool` | `boolean` |
| `DateTime` | 日期时间 | `DateTime` | `Date` |
| `Guid` | GUID | `Guid` | `string` |

### 关系类型

```typescript
// OneToOne (1:1)
{ name: "profile", targetEntity: "UserProfile", relationType: "OneToOne" }

// OneToMany (1:N)
{ name: "orders", targetEntity: "Order", relationType: "OneToMany", inverseName: "user" }

// ManyToOne (N:1)
{ name: "user", targetEntity: "User", relationType: "ManyToOne", foreignKey: "userId" }

// ManyToMany (N:N)
{ name: "roles", targetEntity: "Role", relationType: "ManyToMany" }
```

---

## ✅ 验证规则速查

```typescript
properties: [
  {
    name: "email",
    type: "string",
    isRequired: true,              // ✅ 必填
    maxLength: 100,                // ✅ 最大长度
    minLength: 5,                  // ✅ 最小长度
    regex: "^[\\w-\\.]+@[\\w-]+", // ✅ 正则验证
    isUnique: true,                // ✅ 唯一性
    validationRules: [             // ✅ 自定义规则
      {
        name: "email",
        condition: "isEmail",
        errorMessage: "邮箱格式不正确"
      }
    ]
  }
]
```

---

## 🔧 常用命令

```bash
# 生成单个实体
npm run codegen:entity -- --name=Book

# 生成整个模块
npm run codegen:module -- --name=Library

# 验证元数据
npm run validate:metadata

# 生成所有
npm run codegen:all

# 运行测试
npm run test:metadata
```

---

## 🐛 常见错误速查

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `实体名称不能为空` | name字段缺失 | 添加 `name: "EntityName"` |
| `实体名称必须是PascalCase` | 小写开头 | 改为大写：`Book` 而非 `book` |
| `属性名称必须是camelCase` | 大写开头 | 改为小写：`userName` 而非 `UserName` |
| `实体必须至少有一个属性` | properties为空 | 至少添加1个属性 |
| `foreignKey引用的属性不存在` | 外键属性未定义 | 在properties中添加外键属性 |
| `路由名称不能重复` | 路由名称冲突 | 确保每个路由name唯一 |

---

## 📐 命名规范

```typescript
// ✅ 正确
name: "Book"              // 实体：PascalCase
module: "Library"         // 模块：PascalCase
properties: [
  { name: "bookTitle" }   // 属性：camelCase
]
navigationProperties: [
  { name: "author" }      // 导航：camelCase
]

// ❌ 错误
name: "book"              // 小写
module: "lib"             // 缩写
properties: [
  { name: "BookTitle" }   // 大写开头
]
```

---

## 🎨 最佳实践清单

- [ ] 实体名使用**PascalCase**（首字母大写）
- [ ] 属性名使用**camelCase**（首字母小写）
- [ ] 字符串类型指定**maxLength**
- [ ] 必填字段标记**isRequired: true**
- [ ] 添加**displayName**（中文名）
- [ ] 关键字段添加**description**
- [ ] 使用**schemaVersion**追踪版本
- [ ] 编写**单元测试**验证元数据
- [ ] 提交前运行**验证命令**
- [ ] 生成的代码**不要手动修改**

---

## 🔄 开发流程

```
1. 定义元数据 (30分钟)
   └─ 编写 *.metadata.ts

2. 验证元数据 (1分钟)
   └─ npm run validate:metadata

3. 生成代码 (1分钟)
   └─ npm run codegen:entity

4. 补充业务逻辑 (1小时)
   └─ 编写 *.business.ts

5. 测试 (30分钟)
   └─ npm run test

6. 提交 (1分钟)
   └─ git add . && git commit
```

---

## 💡 一句话技巧

| 场景 | 技巧 |
|------|------|
| **快速定义** | 复制模板，全局替换`${EntityName}` |
| **调试验证** | 用`try-catch`包裹`validateEntityMetadata()` |
| **避免冲突** | 生成代码放`.generated.ts`，自定义代码放`.business.ts` |
| **版本管理** | 每次结构变更递增`schemaVersion` |
| **团队协作** | 元数据放共享包，独立版本 |
| **快速测试** | `npm run codegen:entity -- --name=Test --dry-run` |

---

## 📞 获取帮助

```bash
# 查看文档
open docs/架构设计/@metadata-core新手培训手册.md

# 查看示例
ls src/metadata/entities/

# 运行测试
npm run test:metadata

# 提Issue
git issue create --title "元数据问题"
```

---

## 🎓 学习路径

```
初级 (2小时)
  ✅ 理解元数据概念
  ✅ 会用模板定义实体
  ✅ 会运行生成命令
  
中级 (1天)
  ✅ 定义复杂关系
  ✅ 添加验证规则
  ✅ 自定义业务逻辑
  
高级 (1周)
  ✅ 设计模块元数据
  ✅ 优化生成模板
  ✅ 指导团队使用
```

---

## 📊 效率对比

| 任务 | 传统开发 | 使用元数据 | 提升 |
|------|---------|-----------|------|
| 定义实体 | 30分钟 | 5分钟 | 6x ⚡ |
| 前端类型 | 20分钟 | 自动 | ∞ 🚀 |
| 表单组件 | 1小时 | 自动 | ∞ 🚀 |
| API函数 | 30分钟 | 自动 | ∞ 🚀 |
| 后端实体 | 20分钟 | 自动 | ∞ 🚀 |
| DTO类 | 30分钟 | 自动 | ∞ 🚀 |
| 接口文档 | 20分钟 | 自动 | ∞ 🚀 |
| **总计** | **3小时** | **5分钟** | **36x** 🎯 |

---

**💾 保存本页 | 📌 打印贴工位 | 🔄 每月更新**

---

最后更新：2025-10-06 | v1.0.0

