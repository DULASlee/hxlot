# SmartAbp 模板标准化设计规范 (V1.0)

## 1. 核心理念：模板即产品

每一份代码模板都应被视为一个独立、高质量的产品。它必须是：
- **可立即执行 (Runnable)**: 生成的代码在填充占位符后不应有编译或语法错误。
- **易于理解 (Understandable)**: 命名、结构和注释都应清晰明了。
- **高度一致 (Consistent)**: 遵循统一的编码和设计规范。
- **智能友好 (AI-Friendly)**: 包含丰富的元数据，便于AI理解和自动化应用。

---

## 2. 模板文件结构与元数据

### 2.1 目录结构
所有模板必须存放在 `/templates` 目录下，并按 `端/类别` 的结构组织。
```
/templates
├── backend/
│   ├── application/
│   ├── contracts/
│   └── domain/
├── frontend/
│   ├── components/
│   ├── services/
│   └── stores/
└── lowcode/
    └── plugins/
```

### 2.2 强制元数据文件 (`template.json`)
每个模板**必须**在同级目录下配有一个 `template.json` 文件，用于描述其元数据。这对于AI的智能推荐至关重要。

**示例**: `templates/backend/application/template.json`
```json
{
  "$schema": "../../template.schema.json",
  "id": "CrudAppService",
  "version": "1.1.0",
  "name": "CRUD Application Service",
  "description": "生成一个标准的、符合DDD分层架构的ABP应用服务，包含完整的增删改查、分页查询和启用/禁用功能。",
  "tags": ["Backend", "ApplicationService", "CRUD", "ABP"],
  "author": "SmartAbp Core Team",
  "type": "C#",
  "placeholders": [
    {
      "name": "{{ entityName }}",
      "description": "实体名称 (PascalCase)，例如：'Product'。",
      "required": true
    },
    {
      "name": "{{ entityNamePlural }}",
      "description": "实体名称的复数形式 (PascalCase)，例如：'Products'。",
      "required": true
    },
    {
      "name": "{{ permissionGroupName }}",
      "description": "权限组名称，通常是模块名。",
      "required": true
    },
    {
      "name": "{{ primaryKeyType }}",
      "description": "实体主键类型，例如：'Guid' 或 'long'。",
      "defaultValue": "Guid",
      "required": false
    }
  ],
  "relatedTemplates": [
    "EntityDto",
    "CrudManagement",
    "EntityStore"
  ]
}
```

---

## 3. 模板内容规范

### 3.1 占位符规范 (Placeholder Convention)
- **格式**: 所有占位符必须使用双花括号 `{{ placeholderName }}`。
- **命名**: 使用清晰的小驼峰命名法 (camelCase)，例如 `{{ entityName }}`。
- **一致性**: 占位符的名称必须与 `template.json` 中定义的完全一致。

### 3.2 AI元信息块 (AI Meta Block)
每个模板文件的**顶部**必须包含一个 `AI_TEMPLATE_INFO` 注释块，为AI提供快速上下文。

**C# 示例**:
```csharp
/*
 * AI_TEMPLATE_INFO: {"version":"1.1","type":"C#","handler":"Handlebars"}
 * TEMPLATE_DESCRIPTION: 生成标准的ABP应用服务，包含CRUD、分页、排序和权限控制。
 * USAGE_GUIDE:
 * 1. 替换 {{ entityName }} 为实体名 (如 'Product')。
 * 2. 替换 {{ entityNamePlural }} 为实体复数名 (如 'Products')。
 * 3. 替换 {{ permissionGroupName }} 为权限组名 (如 'ProductManagement')。
 */
```

**Vue/TypeScript 示例**:
```typescript
/*
 * AI_TEMPLATE_INFO: {"version":"1.1","type":"Vue","handler":"Handlebars"}
 * TEMPLATE_DESCRIPTION: 生成标准的前端CRUD管理页面，包含搜索、表格、分页和弹窗表单。
 * USAGE_GUIDE:
 * 1. 替换 {{ entityName }} 为实体名 (如 'Product')。
 * 2. 替换 {{ entityStore }} 为对应的Pinia Store (如 'useProductStore')。
 * 3. 替换 {{ apiService }} 为对应的API服务 (如 'productService')。
 */
```

### 3.3 代码风格与注释
- **代码风格**: 必须严格遵守根目录下的 `.prettierrc` 和 `.eslintrc.js` (前端) 以及 `.editorconfig` (后端) 规范。AI在生成代码时必须产出格式化后的代码。
- **注释**:
    - **功能注释**: 解释复杂逻辑、业务规则或“为什么”这样实现。
    - **占位符注释**: 在复杂的占位符旁边，可以添加简短行内注释说明其用途。
      ```csharp
      // 示例: 解释为什么需要复数形式
      public const string GetListPolicyName = "{{ permissionGroupName }}.{{ entityNamePlural }}"; // 用于获取列表权限
      ```

---

## 4. 模板设计原则

### 4.1 单一职责原则 (Single Responsibility)
- 每个模板文件应专注于一个核心功能。例如，`CrudAppService` 模板只负责生成应用服务类，而不应包含DTO定义。
- 复杂的模板应拆分为多个相互关联的小模板。`template.json` 中的 `relatedTemplates` 字段就是为此设计的。

### 4.2 高内聚、低耦合 (High Cohesion, Low Coupling)
- 模板应尽可能独立，减少对外部特定实现的硬编码依赖。
- 优先使用占位符来注入依赖（如 Service 名称、Store 名称），而不是在模板中写死。

---

## 5. 最佳实践

- **提供默认值**: 对于非核心的可选占位符（如 `{{ primaryKeyType }}`），在 `template.json` 中提供一个合理的 `defaultValue`。
- **逻辑处理**: 模板应专注于代码结构。复杂的条件或循环逻辑应由代码生成器本身处理，而不是在模板中使用复杂的模板语法。
- **版本控制**: `template.json` 中的 `version` 字段非常重要。当模板发生重大变更时，应更新其版本号。
