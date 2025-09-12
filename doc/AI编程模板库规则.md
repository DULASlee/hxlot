# AI编程模板库使用规则

## 📋 概述

本文档定义了AI在使用SmartAbp项目代码模板库时必须遵循的规则和工作流程，确保AI能够自动识别、选择和使用合适的代码模板。

## 🎯 核心原则

### 1. 模板优先原则
- **强制要求**: AI在编写任何代码之前，必须首先检查是否存在相关的代码模板
- **检查顺序**: 
  1. 检查 `templates/` 目录下的模板索引
  2. 根据用户需求匹配最合适的模板
  3. 如果找到匹配模板，必须使用模板生成代码
  4. 如果没有找到模板，才可以从零开始编写

### 2. 自动识别机制
- AI必须能够识别用户请求中的关键词和上下文
- 根据关键词自动匹配相应的模板类别
- 支持模糊匹配和语义理解

### 3. 模板完整性
- 使用模板时必须保持模板的完整结构
- 不得随意删除或修改模板的核心框架
- 只能替换模板中的占位符变量

## 🔍 模板识别工作流程

### 步骤1: 需求分析
```
用户请求 → 关键词提取 → 场景识别 → 模板匹配
```

### 步骤2: 模板检索
1. **检查模板索引**: 读取 `templates/index.json`
2. **关键词匹配**: 匹配 `aiTriggers` 字段
3. **场景匹配**: 匹配 `scenarios` 字段
4. **依赖检查**: 验证项目是否满足模板依赖

### 步骤3: 模板选择
- 如果找到多个匹配模板，选择最具体的模板
- 优先选择完全匹配的模板
- 考虑模板的适用场景和复杂度

### 步骤4: 参数收集
- 根据模板的 `parameters` 定义收集必要参数
- 如果用户未提供必要参数，主动询问
- 为可选参数提供合理的默认值

### 步骤5: 代码生成
- 使用模板生成基础代码结构
- 替换所有占位符变量
- 根据具体需求进行必要的定制

## 📚 模板库结构

### 当前可用模板类别

#### 1. 后端开发模板 (`templates/backend/`)
- **应用服务**: `application/CrudAppService.template.cs`
- **数据传输对象**: `dtos/EntityDto.template.cs`
- **接口定义**: `interfaces/IAppService.template.cs`
- **领域实体**: `entities/Entity.template.cs`
- **仓储接口**: `repositories/IRepository.template.cs`

**AI触发关键词**:
```
- "创建服务"、"应用服务"、"CRUD服务"
- "创建DTO"、"数据传输对象"
- "创建实体"、"领域实体"
- "创建接口"、"服务接口"
- "创建仓储"、"数据仓储"
```

#### 2. 前端开发模板 (`templates/frontend/`)
- **Vue组件**: `components/CrudManagement.template.vue`
- **Pinia状态管理**: `stores/EntityStore.template.ts`
- **API服务**: `services/ApiService.template.ts`
- **类型定义**: `types/EntityTypes.template.ts`

**AI触发关键词**:
```
- "创建组件"、"Vue组件"、"管理页面"
- "创建Store"、"状态管理"、"Pinia"
- "创建API"、"接口服务"
- "创建类型"、"TypeScript类型"
```

#### 3. 低代码引擎模板 (`templates/lowcode/`)
- **引擎插件**: `plugins/LowCodePlugin.template.ts`
- **代码生成器**: `generators/CodeGenerator.template.ts`
- **运行时组件**: `runtime/RuntimeComponent.template.vue`

**AI触发关键词**:
```
- "创建插件"、"低代码插件"、"引擎插件"
- "创建生成器"、"代码生成器"
- "创建运行时组件"、"低代码组件"
```

## 🤖 AI行为规范

### 必须执行的检查

#### 1. 模板存在性检查
```typescript
// AI内部逻辑示例
function checkTemplateAvailability(userRequest: string): Template | null {
  const keywords = extractKeywords(userRequest)
  const matchedTemplates = searchTemplates(keywords)
  return selectBestMatch(matchedTemplates)
}
```

#### 2. 强制模板使用
```typescript
// 如果找到匹配模板，必须使用
if (template) {
  return generateCodeFromTemplate(template, parameters)
} else {
  // 只有在没有模板时才从零开始
  return generateCodeFromScratch(userRequest)
}
```

### 参数处理规范

#### 1. 必需参数验证
- 检查所有 `required: true` 的参数
- 如果缺少必需参数，主动询问用户
- 不得使用空值或占位符作为必需参数

#### 2. 默认值处理
- 为可选参数提供合理的默认值
- 默认值应符合项目的命名规范
- 考虑上下文信息生成智能默认值

#### 3. 参数验证
- 验证参数格式（如PascalCase、camelCase）
- 检查参数的合理性和一致性
- 确保参数符合模板的验证规则

### 代码生成规范

#### 1. 占位符替换
```typescript
// 正确的占位符替换示例
const code = template.content
  .replace(/\{\{EntityName\}\}/g, entityName)
  .replace(/\{\{entityName\}\}/g, camelCase(entityName))
  .replace(/\{\{ENTITY_NAME\}\}/g, upperCase(entityName))
```

#### 2. 结构完整性
- 保持模板的完整结构和注释
- 不得删除模板中的重要方法或属性
- 保留所有的错误处理和日志记录

#### 3. 项目适配
- 根据项目的现有结构调整导入路径
- 使用项目的编码规范和样式
- 集成项目的公共组件和工具类

## 🔧 实际应用示例

### 示例1: 创建CRUD服务

**用户请求**: "创建一个产品管理的CRUD服务"

**AI处理流程**:
1. **关键词识别**: "CRUD服务" → 匹配后端应用服务模板
2. **模板选择**: `templates/backend/application/CrudAppService.template.cs`
3. **参数收集**: 
   - EntityName: "Product"
   - entityName: "product"
   - EntityDescription: "产品"
4. **代码生成**: 使用模板生成完整的ProductAppService

### 示例2: 创建Vue管理页面

**用户请求**: "创建订单管理页面"

**AI处理流程**:
1. **关键词识别**: "管理页面" → 匹配前端组件模板
2. **模板选择**: `templates/frontend/components/CrudManagement.template.vue`
3. **参数收集**:
   - EntityName: "Order"
   - entityName: "order"
   - EntityDescription: "订单"
4. **代码生成**: 生成完整的订单管理组件

### 示例3: 创建低代码插件

**用户请求**: "创建一个数据可视化插件"

**AI处理流程**:
1. **关键词识别**: "插件" → 匹配低代码插件模板
2. **模板选择**: `templates/lowcode/plugins/LowCodePlugin.template.ts`
3. **参数收集**:
   - PluginName: "DataVisualization"
   - pluginName: "dataVisualization"
   - PluginDescription: "数据可视化插件"
4. **代码生成**: 生成完整的插件代码

## 📋 质量保证

### 代码审查检查点
1. **模板使用**: 确认使用了正确的模板
2. **参数完整**: 所有占位符都已正确替换
3. **结构完整**: 保持了模板的完整结构
4. **项目适配**: 符合项目的编码规范
5. **功能完整**: 包含了必要的业务逻辑

### 错误处理
- 如果模板不存在，明确告知用户并提供替代方案
- 如果参数不足，主动询问而不是猜测
- 如果生成失败，提供详细的错误信息

## 🚀 持续改进

### 模板反馈机制
- 收集AI使用模板的频率和效果
- 根据实际使用情况优化模板内容
- 定期更新模板以适应新的技术栈

### 新模板开发
- 根据项目需求识别新的模板需求
- 遵循现有模板的结构和规范
- 确保新模板与现有模板的一致性

## 📖 相关文档

- [代码模板库完整指南](../templates/README.md)
- [SmartAbp项目架构文档](./architecture/README.md)
- [前端开发规范](./frontend-standards.md)
- [后端开发规范](./backend-standards.md)

---

**重要提醒**: 本规则文档是AI编程的强制性指导文档，所有AI在处理SmartAbp项目的编程任务时都必须严格遵循这些规则。