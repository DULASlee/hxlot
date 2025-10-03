# 🛡️ 核心功能保护 - 快速参考卡片

**给所有AI大模型的紧急提醒** 🚨

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ⚠️ 在修复任何类型错误或代码问题前，必须阅读此文件！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🚫 绝对禁止的操作

| 禁止操作 | 说明 | 后果 |
|---------|------|------|
| ❌ **删除代码** | 删除任何业务逻辑代码 | 核心功能丢失 |
| ❌ **简化逻辑** | 用简单实现替代复杂逻辑 | 功能降级 |
| ❌ **注释代码** | 注释掉核心功能代码 | 等同于删除 |
| ❌ **空实现** | 用throw Error或{}替代 | 严重违规 |
| ❌ **使用any** | 用any绕过类型检查 | 失去类型安全 |

## ✅ 正确的修复方式

| 优先级 | 修复方式 | 示例 |
|-------|---------|------|
| **P0** | 添加缺失的import | `import type { EntityDto } from '@smartabp/lowcode-shared'` |
| **P1** | 定义缺失的interface | `interface UserConfig { id: string; name: string }` |
| **P2** | 修复类型注解 | `const getData = (id: string): Promise<Data>` |
| **P3** | 添加类型守卫 | `if (typeof value === 'string')` |

## 🔥 核心文件清单（严禁简化）

### 前端核心 (4000+行)

```
src/SmartAbp.Vue/packages/lowcode-core/src/stores/
├── enhancedStateMachine.ts  (874行)  🔥🔥🔥🔥🔥
├── codeGeneration.ts        (1176行) 🔥🔥🔥🔥🔥
├── entityModeling.ts                 🔥🔥🔥🔥
└── pageDesign.ts                     🔥🔥🔥🔥
```

### 后端核心 (1973+行)

```
src/SmartAbp.CodeGenerator/Services/
└── CodeGenerationAppService.cs (1973行) 🔥🔥🔥🔥🔥
```

## 📋 修复前强制检查清单

在修复任何代码前，AI必须回答：

- [ ] ❓ 这个文件是否包含核心业务功能？
- [ ] ❓ 我的修复是否会删除或简化任何业务逻辑？
- [ ] ❓ 是否可以只修复类型定义而不改变实现？
- [ ] ❓ 修复后的代码功能是否与修复前完全一致？
- [ ] ❓ 我是否需要查看完整的文件内容？
- [ ] ❓ 是否存在更好的类型定义方式而非简化代码？

**如果第2个问题的答案是"是"，必须立即停止！**

## 💡 实际案例对比

### ❌ 错误案例1：删除复杂逻辑

**修复前**（有类型错误）:
```typescript
const executeBusinessRules = async (context: any) => {
  const sortedRules = rules.sort((a, b) => b.priority - a.priority)
  const results = []
  for (const rule of sortedRules) {
    if (await evaluateCondition(rule.condition, context)) {
      const result = await executeAction(rule.action, context)
      results.push(result)
    }
  }
  return results
}
```

**错误的修复**:
```typescript
const executeBusinessRules = async (context: any) => {
  return [] // ❌ 删除了所有业务逻辑！
}
```

**正确的修复**:
```typescript
interface RuleContext {
  entity: Record<string, any>
  user?: any
}

interface RuleResult {
  ruleId: string
  success: boolean
  result: any
}

const executeBusinessRules = async (
  context: RuleContext
): Promise<RuleResult[]> => {
  // ✅ 保留所有业务逻辑
  const sortedRules = rules.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
  const results: RuleResult[] = []
  for (const rule of sortedRules) {
    if (await evaluateCondition(rule.condition, context)) {
      const result = await executeAction(rule.action, context)
      results.push(result)
    }
  }
  return results
}
```

### ❌ 错误案例2：用any绕过

**修复前**（缺少类型定义）:
```typescript
const generateCode = (config) => {
  const files = processTemplates(config.templates)
  const validated = validateGeneration(files)
  return buildOutput(validated)
}
```

**错误的修复**:
```typescript
const generateCode = (config: any): any => {
  // ❌ 用any绕过类型检查
  const files = processTemplates(config.templates)
  const validated = validateGeneration(files)
  return buildOutput(validated)
}
```

**正确的修复**:
```typescript
interface GenerationConfig {
  templates: TemplateDefinition[]
  outputPath: string
  options: GenerationOptions
}

interface GeneratedFile {
  path: string
  content: string
  type: 'ts' | 'cs' | 'vue'
}

interface GenerationOutput {
  files: GeneratedFile[]
  success: boolean
  errors: string[]
}

const generateCode = (config: GenerationConfig): GenerationOutput => {
  // ✅ 完整的类型定义 + 保留所有逻辑
  const files = processTemplates(config.templates)
  const validated = validateGeneration(files)
  return buildOutput(validated)
}
```

## 🔍 验证修复结果

### 自动检查

修复完成后，AI必须验证：

```bash
# 1. 代码行数检查
新代码行数 >= 旧代码行数 * 0.9  # 不能减少超过10%

# 2. TypeScript编译
npm run type-check  # 必须0错误

# 3. ESLint检查
npm run lint  # 必须0错误0警告

# 4. 关键方法存在性
grep "generateCode\|executeRules\|validateWorkflow" 文件  # 必须都存在
```

### 手动检查

- ✅ 所有核心方法仍然存在？
- ✅ 所有核心状态仍然存在？
- ✅ 所有导出仍然存在？
- ✅ 业务逻辑完全保留？
- ✅ 只修复了类型定义？

## 📞 遇到困难时怎么办

### AI应该做的

✅ **向用户说明**: "这个类型错误涉及核心功能，我需要更多信息才能安全修复"

✅ **提供方案**: "我发现3种修复方式：
   1. 添加类型定义（推荐）
   2. 重构类型结构（需要确认）
   3. 暂时跳过这个错误（不推荐）
   请选择最合适的方案"

✅ **保守修复**: "我只添加了类型定义，没有改变任何业务逻辑"

### AI不应该做的

❌ **擅自删除**: "这段代码看起来不需要，我删掉了"  
❌ **简化逻辑**: "这个函数太复杂了，我简化了"  
❌ **注释代码**: "这段代码有问题，我先注释掉"  
❌ **使用any**: "用any先绕过，以后再说"  

## 🎯 记住这个口诀

```
修复类型错误时：
1. 只改类型，不改逻辑
2. 只加定义，不删代码
3. 保留功能，消除错误
4. 严禁简化，严禁绕过
```

---

**详细规则**: 参见 `.cursor/rules/05_核心功能保护铁律.mdc`

**紧急程度**: 🔥🔥🔥 最高优先级

**执行原则**: 核心功能保护 > 代码质量 > 代码优雅
