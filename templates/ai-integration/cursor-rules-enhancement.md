# Cursor Rules 增强指南

## 🎯 AI模板库自动识别机制

### 1. .cursorrules 文件增强

已在 `.cursorrules` 文件中添加了以下关键规则：

#### 强制性模板检查流程
```markdown
## 🎯 TEMPLATE LIBRARY ENFORCEMENT (MANDATORY)

### Template-First Code Generation Rules
- **BEFORE writing ANY code, AI MUST search for relevant templates in templates/ directory**
- **Template usage is MANDATORY for standard scenarios (CRUD, components, services)**
- **AI must explain which template was used and why**
```

#### AI响应模式
```markdown
### AI Response Pattern for Template Usage
When generating code, AI MUST follow this response pattern:

🔍 **模板搜索**: 正在查找 {code_type} 相关模板...
📋 **模板发现**: 找到模板 `{template_path}`
⚙️ **参数映射**: 
   - EntityName: {value}
   - ModuleName: {value}
   - 其他参数...
🏗️ **代码生成**: 基于模板生成代码
✅ **合规检查**: 代码符合模板约束和项目规范
```

### 2. AI触发词映射机制

#### 自动触发模板搜索的关键词
- "创建/新增/添加" + "服务/组件/页面/实体" → 搜索 templates/
- "CRUD操作" → 使用 CrudAppService.template.cs
- "管理页面" → 使用 CrudManagement.template.vue
- "状态管理" → 使用 EntityStore.template.ts

#### 搜索命令映射
```bash
# CRUD服务
glob "templates/**/*crud*service*.template.*"

# 管理页面
glob "templates/**/components/*management*.template.vue"

# 状态管理
glob "templates/**/stores/*store*.template.ts"

# DTO对象
glob "templates/**/contracts/*dto*.template.cs"
```

### 3. 模板使用验证机制

#### 强制性检查点
1. **模板发现阶段**：AI必须先搜索相关模板
2. **模板应用阶段**：必须使用找到的模板
3. **参数映射阶段**：正确映射所有占位符
4. **合规检查阶段**：验证生成代码符合项目规范

#### 违规处理
- 未使用可用模板的代码将被拒绝
- AI必须重新生成并使用正确的模板
- 偏离模板的修改需要明确说明原因

### 4. 实施效果监控

#### 成功指标
- ✅ AI在代码生成前自动搜索模板
- ✅ 使用模板生成的代码符合项目规范
- ✅ 生成代码包含模板来源注释
- ✅ 参数映射正确无误

#### 质量保证
- 🔍 模板使用率 > 80%
- 📊 代码质量评分 > 90%
- 🚀 生成代码可运行率 > 95%
- 😊 用户满意度 > 85%

## 🚀 使用示例

### 示例1：创建用户管理服务

**用户输入**：创建用户管理的应用服务

**AI响应**：
```
🔍 **模板搜索**: 正在查找应用服务相关模板...
📋 **模板发现**: 找到模板 `templates/backend/application/CrudAppService.template.cs`
⚙️ **参数映射**: 
   - EntityName: User
   - entityName: user
   - ModuleName: Identity
🏗️ **代码生成**: 基于模板生成代码
✅ **合规检查**: 代码符合ABP框架规范和项目约定
```

### 示例2：创建产品管理页面

**用户输入**：需要一个产品管理页面

**AI响应**：
```
🔍 **模板搜索**: 正在查找管理页面相关模板...
📋 **模板发现**: 找到模板 `templates/frontend/components/CrudManagement.template.vue`
⚙️ **参数映射**: 
   - EntityName: Product
   - entityName: product
   - entityDisplayName: 产品
   - ModuleName: Catalog
   - kebab-case-name: product-management
🏗️ **代码生成**: 基于模板生成Vue组件
✅ **合规检查**: 代码符合Vue3 + Element Plus规范
```

## 📋 检查清单

### AI开发者自检
- [ ] 是否在代码生成前搜索了模板？
- [ ] 是否使用了最匹配的模板？
- [ ] 是否正确映射了所有参数？
- [ ] 是否验证了生成代码的合规性？
- [ ] 是否在响应中说明了模板使用情况？

### 用户验收检查
- [ ] 生成的代码是否符合项目架构？
- [ ] 是否遵循了命名约定？
- [ ] 是否包含了必要的权限检查？
- [ ] 是否通过了质量门禁？
- [ ] 是否可以直接运行？

## 🔧 故障排除

### 常见问题

#### Q: AI没有使用模板怎么办？
A: 检查 `.cursorrules` 文件是否正确配置，确保包含模板强制使用规则。

#### Q: 模板参数映射错误怎么办？
A: 检查模板的 `.meta.yml` 文件，确保参数定义正确。

#### Q: 生成的代码不符合项目规范怎么办？
A: 更新模板内容，确保模板本身符合最新的项目规范。

### 调试命令
```bash
# 验证模板库
npm run template:validate

# 搜索模板
npm run template:search search "CRUD"

# 查看模板详情
npm run template:search show abp-crud-service

# 重建索引
npm run template:index