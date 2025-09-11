# AI模板库使用指南

## 🎯 AI自动识别和使用模板库的机制

### 1. 强制性模板检查流程

AI在生成任何代码前，必须执行以下步骤：

#### 步骤1：模板发现
```bash
# 根据用户需求搜索相关模板
glob "templates/**/*{keyword}*.template.*"
```

#### 步骤2：模板元数据加载
```bash
# 读取模板的元数据文件
read_file "templates/{category}/{template}.template.meta.yml"
```

#### 步骤3：模板应用
- 解析模板参数
- 替换占位符
- 生成符合项目规范的代码

### 2. AI触发词映射表

| 用户输入 | 搜索模式 | 对应模板 |
|---------|----------|----------|
| "创建应用服务" | `templates/**/*service*.template.*` | CrudAppService.template.cs |
| "管理页面" | `templates/**/*management*.template.vue` | CrudManagement.template.vue |
| "状态管理" | `templates/**/*store*.template.ts` | EntityStore.template.ts |
| "DTO对象" | `templates/**/*dto*.template.cs` | EntityDto.template.cs |
| "CRUD操作" | `templates/**/*crud*.template.*` | 多个CRUD相关模板 |

### 3. AI响应模式

AI必须按照以下格式响应：

```
🔍 **模板搜索**: 正在查找 {需求类型} 相关模板...
📋 **模板发现**: 找到模板 `templates/{path}/{template}.template.{ext}`
⚙️ **参数映射**: 
   - EntityName: {实体名称}
   - ModuleName: {模块名称}
   - entityName: {实体名称小写}
🏗️ **代码生成**: 基于模板生成代码
✅ **合规检查**: 代码符合模板约束和项目规范
```

### 4. 模板参数标准化

#### 后端模板参数
- `EntityName`: 实体名称（PascalCase），如：Product、User
- `entityName`: 实体名称（camelCase），如：product、user
- `ModuleName`: 模块名称（PascalCase），如：Catalog、Identity

#### 前端模板参数
- `EntityName`: 实体名称（PascalCase）
- `entityName`: 实体名称（camelCase）
- `entityDisplayName`: 实体显示名称，如：产品、用户
- `kebab-case-name`: 短横线命名，如：product-management

### 5. 质量保证机制

#### 模板使用验证
- 生成的代码必须包含模板来源注释
- 必须遵循模板定义的约束和规范
- 偏离模板的修改需要明确说明原因

#### 错误处理
- 如果模板不存在，AI必须说明并建议创建新模板
- 如果参数不匹配，AI必须提示正确的参数格式
- 如果生成失败，AI必须回退到项目约定的手动编写

### 6. 模板库维护

#### 新增模板
当AI发现重复的代码模式时，应建议：
```
建议将此代码模式添加到模板库:
- 路径: templates/{category}/{type}.template.{ext}
- 元数据: templates/{category}/{type}.template.meta.yml
- 用途: {使用场景描述}
```

#### 模板更新
当项目规范变更时，AI应：
1. 识别受影响的模板
2. 建议更新模板内容
3. 验证现有代码的兼容性

## 🚀 实施检查清单

### AI开发者检查项
- [ ] 是否在代码生成前搜索了模板？
- [ ] 是否使用了最匹配的模板？
- [ ] 是否正确映射了所有参数？
- [ ] 是否验证了生成代码的合规性？
- [ ] 是否在响应中说明了模板使用情况？

### 用户验收检查项
- [ ] 生成的代码是否符合项目架构？
- [ ] 是否遵循了命名约定？
- [ ] 是否包含了必要的权限检查？
- [ ] 是否通过了质量门禁？
- [ ] 是否可以直接运行？

## 📈 效果评估

### 成功指标
- 模板使用率 > 80%
- 代码质量评分 > 90%
- 生成代码的可运行率 > 95%
- 用户满意度 > 85%

### 持续改进
- 收集模板使用统计
- 分析生成代码质量
- 优化模板结构和内容
- 扩展模板库覆盖范围