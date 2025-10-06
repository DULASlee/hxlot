# 📂 元数据目录

这个目录用于存放所有的元数据定义文件（EntityMetadata, ModuleMetadata等）。

## 📁 目录结构

```
metadata/
├── entities/           # 实体元数据
│   ├── library/       # 按模块分类
│   │   ├── book.metadata.ts
│   │   └── reader.metadata.ts
│   └── sales/
│       └── order.metadata.ts
├── modules/           # 模块元数据
│   ├── library.module.metadata.ts
│   └── sales.module.metadata.ts
└── README.md          # 本文件
```

## 🚀 快速开始

### 1. 定义实体元数据

```typescript
// entities/library/book.metadata.ts
import type { EntityMetadata } from '../../src/SmartAbp.Vue/packages/metadata-core/src/types'

export const BookMetadata: EntityMetadata = {
  name: "Book",
  module: "Library",
  keyType: "Guid",
  properties: [
    {
      name: "title",
      type: "string",
      isRequired: true,
      maxLength: 200,
      displayName: "书名"
    }
  ]
}

export default BookMetadata
```

### 2. 生成前端代码

```bash
cd src/SmartAbp.Vue

# 生成前端代码
npm run codegen:frontend -- --entity=Book

# 生成的文件：
# ✅ src/views/library/book/book.types.ts
# ✅ src/views/library/book/book-api.ts
# ✅ src/views/library/book/BookList.vue
# ✅ src/views/library/book/BookForm.vue
# ✅ src/views/library/book/BookDetail.vue
# ✅ src/stores/library/useBookStore.ts
```

### 3. 生成后端代码（占位符）

```bash
# 生成后端代码（需要集成后端API）
npm run codegen:backend -- --entity=Book

# 预览将要生成的文件
npm run codegen:backend -- --entity=Book --dry-run
```

### 4. 一键生成全部

```bash
# 同时生成前后端代码
npm run codegen:all -- --entity=Book
```

## 🎯 命令参数

```bash
# 基础命令
npm run codegen:entity -- --entity=EntityName

# 指定类型
npm run codegen:frontend -- --entity=EntityName  # 仅前端
npm run codegen:backend -- --entity=EntityName   # 仅后端
npm run codegen:all -- --entity=EntityName       # 前后端

# 高级选项
npm run codegen:entity -- --entity=Book --dry-run      # Dry-run模式
npm run codegen:entity -- --entity=Book --verbose      # 详细输出
npm run codegen:entity -- --entity=Book --output=/path # 自定义输出路径
```

## 📖 元数据规范

详见：[元数据新手培训手册](../docs/架构设计/@metadata-core新手培训手册.md)

### 必需字段

```typescript
{
  name: "EntityName",     // 实体名（PascalCase）
  module: "ModuleName",   // 模块名
  keyType: "Guid",        // 主键类型
  isAggregateRoot: true,
  isMultiTenant: true,
  isSoftDelete: true,
  hasExtraProperties: true,
  properties: [           // 至少一个属性
    {
      name: "name",       // 属性名（camelCase）
      type: "string",
      isRequired: true,
      isReadOnly: false,
      isUnique: false
    }
  ]
}
```

### 常用类型

- `string` → `string` (TypeScript)
- `int` → `number`
- `long` → `number`
- `decimal` → `number`
- `bool` → `boolean`
- `DateTime` → `string` (ISO格式)
- `Guid` → `string`

## ✅ 验证元数据

```bash
cd src/SmartAbp.Vue/packages/metadata-core

# 运行测试验证元数据规范
npm run test

# 构建metadata-core包
npm run build
```

## 📚 更多文档

- [新手培训手册](../docs/架构设计/@metadata-core新手培训手册.md)
- [快速参考卡](../docs/架构设计/@metadata-core快速参考卡.md)
- [实战演练案例](../docs/架构设计/@metadata-core实战演练案例.md)
- [文档索引](../docs/架构设计/@metadata-core文档索引.md)

## 💡 最佳实践

1. ✅ 实体名使用 **PascalCase**（首字母大写）
2. ✅ 属性名使用 **camelCase**（首字母小写）
3. ✅ 字符串类型指定 **maxLength**
4. ✅ 必填字段标记 **isRequired: true**
5. ✅ 添加 **displayName**（中文名）
6. ✅ 关键字段添加 **description**
7. ✅ 使用 **schemaVersion** 追踪版本

## 🐛 常见问题

### Q: 找不到元数据文件？

A: 确保文件路径正确：
```
metadata/entities/{module}/{entity}.metadata.ts
```

### Q: 验证失败？

A: 检查元数据规范，参考[常见错误速查](../docs/架构设计/@metadata-core快速参考卡.md#🐛-常见错误速查)

### Q: 生成的代码在哪里？

A: 
- 前端：`src/views/{module}/{entity}/`
- Store：`src/stores/{module}/use{Entity}Store.ts`
- 后端：`src/SmartAbp.*/{module}/`

---

**Happy Coding with Metadata! 🚀**

