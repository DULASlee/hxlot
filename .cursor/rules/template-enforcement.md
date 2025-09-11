# Template Library Enforcement Rules

## 🎯 MANDATORY TEMPLATE USAGE RULES

### Core Principle
**AI MUST use project templates before writing any code in SmartAbp project**

### Enforcement Workflow

#### Step 1: Template Discovery (REQUIRED)
```bash
# AI must execute these searches BEFORE any code generation:
glob "templates/**/*.template.*"
read_file "templates/index.json"
```

#### Step 2: Template Matching (REQUIRED)
```yaml
Trigger Keywords → Required Templates:
  - "创建服务|应用服务|CRUD" → CrudAppService.template.cs
  - "管理页面|管理组件" → CrudManagement.template.vue  
  - "状态管理|Store" → EntityStore.template.ts
  - "DTO|数据传输" → EntityDto.template.cs series
```

#### Step 3: Parameter Mapping (REQUIRED)
```typescript
interface TemplateParameters {
  EntityName: string;     // PascalCase: Product, User, Order
  entityName: string;     // camelCase: product, user, order  
  ModuleName: string;     // Module: Catalog, Identity, Sales
  entityDisplayName: string; // Display: 产品, 用户, 订单
}
```

#### Step 4: Code Generation (REQUIRED)
- Replace ALL template placeholders
- Maintain template structure and conventions
- Add template source comments
- Follow ABP framework standards

#### Step 5: Compliance Validation (REQUIRED)
- ✅ ABP framework compliance
- ✅ Project naming conventions
- ✅ Permission checks included
- ✅ Standard dependency injection

### Mandatory Response Format

```markdown
🔍 **Template Search**: Searching for {requirement_type} templates...
📋 **Template Found**: `{template_path}`
⚙️ **Parameter Mapping**: EntityName={value}, ModuleName={value}
🏗️ **Code Generation**: Based on template `{template_id}`
✅ **Compliance Check**: All requirements met
📄 **Generated Code**: [Complete code here]
```

### Prohibited Actions
- ❌ Skip template search
- ❌ Ignore existing templates  
- ❌ Write code from scratch when templates exist
- ❌ Deviate from response format

### Exception Handling
If template deviation is necessary:
1. Explain the reason clearly
2. Detail the modifications made
3. Ensure project compliance
4. Suggest template library updates

### Quality Assurance Checklist
- [ ] Template search performed
- [ ] Relevant template used
- [ ] Parameters correctly mapped
- [ ] ABP standards followed
- [ ] Project conventions maintained
- [ ] Permissions implemented
- [ ] Dependencies injected properly

---

**CRITICAL**: These rules are MANDATORY and NON-NEGOTIABLE for all AI code generation in SmartAbp project.