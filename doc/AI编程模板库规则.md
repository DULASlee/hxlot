# AI编程模板库规则

## 🎯 核心原则

**AI在SmartAbp项目中进行任何代码生成时，必须遵循"模板优先"原则**

### 强制性规则

1. **模板检查优先级**: 在编写任何代码之前，AI必须首先搜索并检查项目模板库
2. **模板使用强制性**: 如果存在相关模板，必须使用模板而不是从头编写
3. **偏离说明义务**: 如果需要偏离模板，必须明确说明原因和修改内容

## 📋 AI编程工作流程

### 第一步：模板发现（MANDATORY）
```
🔍 执行模板搜索：
- 使用 glob 搜索: templates/**/*.template.*
- 根据用户需求匹配相关模板
- 检查 templates/index.json 获取模板信息
```

### 第二步：模板选择（MANDATORY）
```
📋 模板匹配规则：
- CRUD操作 → CrudAppService.template.cs + CrudManagement.template.vue
- 实体DTO → EntityDto.template.cs, CreateEntityDto.template.cs, UpdateEntityDto.template.cs
- 状态管理 → EntityStore.template.ts
- 应用服务接口 → CrudAppServiceInterface.template.cs
```

### 第三步：参数映射（MANDATORY）
```
⚙️ 标准参数映射：
- {{EntityName}}: 实体名称（PascalCase，如：Product, User, Order）
- {{entityName}}: 实体名称（camelCase，如：product, user, order）
- {{ModuleName}}: 模块名称（如：Catalog, Identity, Sales）
- {{entityDisplayName}}: 实体显示名称（如：产品, 用户, 订单）
```

### 第四步：代码生成（MANDATORY）
```
🏗️ 基于模板生成代码：
- 替换所有模板占位符
- 保持模板的结构和约定
- 添加模板来源注释
```

### 第五步：合规验证（MANDATORY）
```
✅ 验证生成的代码：
- 符合ABP框架规范
- 遵循项目命名约定
- 包含必要的权限检查
- 使用项目标准的依赖注入
```

## 🎯 AI触发词映射表

| 用户输入关键词 | 必须使用的模板 | 模板路径 |
|---|---|---|
| "创建/新增/添加" + "服务/应用服务" | CrudAppService | templates/backend/application/CrudAppService.template.cs |
| "CRUD操作/增删改查" | CrudAppService + CrudManagement | backend/application/ + frontend/components/ |
| "管理页面/管理组件" | CrudManagement | templates/frontend/components/CrudManagement.template.vue |
| "状态管理/Store" | EntityStore | templates/frontend/stores/EntityStore.template.ts |
| "DTO/数据传输对象" | EntityDto系列 | templates/backend/contracts/*Dto.template.cs |
| "服务接口/应用服务接口" | CrudAppServiceInterface | templates/backend/contracts/CrudAppServiceInterface.template.cs |

## 📝 AI标准响应格式

AI必须按照以下格式响应用户的编程请求：

```markdown
🔍 **模板搜索**: 正在查找 {需求类型} 相关模板...

📋 **模板发现**: 
- 找到模板: `{template_path}`
- 模板类型: {template_type}
- 适用场景: {scenarios}

⚙️ **参数映射**: 
- EntityName: {实体名称}
- entityName: {实体名称小写}
- ModuleName: {模块名称}
- entityDisplayName: {显示名称}

🏗️ **代码生成**: 基于模板 `{template_id}` 生成代码

✅ **合规检查**: 
- [x] 符合ABP框架规范
- [x] 遵循项目命名约定
- [x] 包含权限检查
- [x] 使用标准依赖注入

📄 **生成的代码**:
[在此处输出基于模板生成的完整代码]
```

## 🚫 禁止行为

### 严格禁止的操作
1. **跳过模板搜索**: 不允许直接编写代码而不检查模板
2. **忽略现有模板**: 如果存在相关模板，不允许从头编写
3. **随意修改模板结构**: 不允许大幅偏离模板的基本结构
4. **省略响应格式**: 必须按照标准格式响应

### 例外情况处理
如果确实需要偏离模板，必须：
1. 明确说明偏离的原因
2. 详细描述修改的内容
3. 确保修改后仍符合项目规范
4. 建议是否需要更新模板库

## 🔧 模板库维护规则

### AI发现模板缺失时
```markdown
⚠️ **模板缺失**: 未找到 {需求类型} 相关模板

🏗️ **临时方案**: 将基于项目现有代码规范生成代码

💡 **建议**: 建议将此代码模式添加到模板库:
- 建议路径: templates/{category}/{type}.template.{ext}
- 建议元数据: {metadata_suggestions}
```

### 模板改进建议
AI在使用模板过程中，如果发现可以改进的地方，应该：
1. 记录改进建议
2. 说明改进的理由
3. 提供具体的修改方案

## 📊 质量保证机制

### 代码生成质量检查清单
- [ ] 使用了相关的项目模板
- [ ] 正确映射了所有参数
- [ ] 符合ABP框架规范
- [ ] 遵循项目命名约定
- [ ] 包含必要的权限检查
- [ ] 使用了正确的依赖注入
- [ ] 添加了适当的注释和文档
- [ ] 包含了错误处理逻辑

### 模板使用统计
AI应该在每次使用模板后报告：
- 使用的模板ID
- 参数映射情况
- 生成代码的质量评估
- 用户满意度反馈

## 🎯 实施验证

### 测试场景
为验证AI是否正确使用模板库，可以使用以下测试场景：

1. **场景1**: "我需要创建一个产品管理模块"
   - 预期: AI搜索CRUD相关模板
   - 预期: 使用CrudAppService.template.cs
   - 预期: 正确映射EntityName=Product

2. **场景2**: "创建用户管理页面"
   - 预期: AI搜索管理页面模板
   - 预期: 使用CrudManagement.template.vue
   - 预期: 正确映射entityDisplayName=用户

3. **场景3**: "需要订单状态管理"
   - 预期: AI搜索状态管理模板
   - 预期: 使用EntityStore.template.ts
   - 预期: 正确映射EntityName=Order

## 📈 成功指标

### 技术指标
- 模板使用率 ≥ 90%
- 代码规范符合率 ≥ 95%
- 首次生成可运行率 ≥ 90%

### 用户体验指标
- 代码生成速度提升 ≥ 60%
- 用户满意度 ≥ 85%
- 代码维护成本降低 ≥ 40%

## 🔄 持续改进

### 模板库更新机制
1. 定期收集AI使用反馈
2. 分析常见的代码生成需求
3. 更新和扩展模板库
4. 优化AI识别和使用机制

### 规则优化
1. 监控AI遵循规则的情况
2. 收集用户对生成代码的反馈
3. 持续优化触发词映射
4. 改进响应格式和质量检查

---

**重要提醒**: 这些规则是强制性的，AI必须严格遵循。任何违反这些规则的行为都将被视为不符合项目要求。