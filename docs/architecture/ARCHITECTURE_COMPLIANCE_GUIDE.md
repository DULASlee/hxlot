# 🏛️ SmartAbp架构合规修复指南

**版本**: v1.0  
**创建日期**: 2025-10-09  
**优先级**: P0 最高  
**强制执行**: 所有代码修改必须遵循本指南  

---

## 📋 核心原则

### 三大架构铁律（零容忍）

本指南的所有规范都基于三大架构铁律，任何修复都必须严格遵守：

#### 铁律一：强制使用统一类型系统
```yaml
规则:
  ✅ 所有共享类型必须在 @smartabp/lowcode-shared/types 定义
  ✅ 元数据类型必须在 @smartabp/metadata-core 定义
  ✅ Package内部类型可以在package内定义
  ❌ 严禁在主应用src/定义底层类型
  ❌ 严禁在组件文件中定义跨文件使用的类型
  ❌ 严禁使用相对路径 import '../types'
```

#### 铁律二：强制使用组件注册系统
```yaml
规则:
  ✅ 所有组件必须注册到 ComponentRegistry
  ✅ 提供完整的 ComponentMetadata
  ✅ 声明所有依赖关系
  ❌ 严禁跳过注册直接使用
  ❌ 严禁硬编码组件路径
```

#### 铁律三：严格遵循架构层级
```yaml
规则:
  ✅ 只能向下依赖（Layer 2→1→0→-1）
  ✅ 使用 @smartabp/* 别名
  ❌ 严禁逆向依赖
  ❌ 严禁跨层级引用
  ❌ 严禁主应用定义底层类型

架构层级:
  Layer 2: lowcode-designer
  Layer 1: lowcode-core, lowcode-api, lowcode-tools
  Layer 0: lowcode-shared
  Layer -1: metadata-core
  主应用 (src/): 只使用，不定义底层类型
```

---

## 🎯 修复标准化流程

### 阶段一：相对路径引用修复（Week 1）

#### 1.1 修复前检查清单

```bash
# ✅ 执行前必须确认
☑️ 确认目标文件所在的package
☑️ 确认被引用的模块属于哪个package
☑️ 确认被引用的内容是否已在目标package的index.ts导出
☑️ 备份原始代码
```

#### 1.2 标准修复模式

**模式A: 跨Package引用（最常见）**

```typescript
// ❌ 错误：使用相对路径跨package引用
// 文件: packages/lowcode-core/src/engines/actionExecutor.ts
import { ComponentRegistry } from '../../../lowcode-shared/components/ComponentRegistry'
import type { EntityMetadata } from '../../../metadata-core/src/types'

// ✅ 正确：使用@smartabp别名
import { ComponentRegistry } from '@smartabp/lowcode-shared'
import type { EntityMetadata } from '@smartabp/metadata-core'
```

**模式B: Package内部引用（允许相对路径）**

```typescript
// ✅ 正确：package内部可以使用相对路径
// 文件: packages/lowcode-core/src/engines/actionExecutor.ts
import { RuleEngine } from './ruleExecutionEngine'
import { Validator } from '../utils/validator'
```

**模式C: 主应用引用Package（标准）**

```typescript
// ✅ 正确：主应用使用@smartabp别名
// 文件: src/views/lowcode/GenerationView.vue
import { useCodeGenerationStore } from '@smartabp/lowcode-core'
import type { EntityMetadata } from '@smartabp/metadata-core'
```

#### 1.3 修复验证步骤

```bash
# Step 1: 修复单个文件后立即验证
npm run type-check

# Step 2: 确认修复正确
grep -r "'\.\./.*" packages/lowcode-xxx/src/  # 应无结果

# Step 3: 确保package构建正常
cd packages/lowcode-xxx && npm run build

# Step 4: 更新修复记录
# 在 docs/architecture/fix-progress.json 中标记完成
```

#### 1.4 批量修复策略

**优先级顺序（必须按此顺序）:**

1. **lowcode-shared** (Layer 0) - 被所有package依赖
2. **metadata-core** (Layer -1) - 零依赖，独立模块
3. **lowcode-core** (Layer 1) - 核心引擎
4. **lowcode-api** (Layer 1) - API层
5. **lowcode-tools** (Layer 1) - 工具层
6. **lowcode-designer** (Layer 2) - 最上层

**原因**: 必须自底向上修复，确保依赖关系正确。

---

### 阶段二：主应用引用修复（Week 2）

#### 2.1 问题模式识别

```typescript
// ❌ 错误：在package中引用主应用
// 文件: packages/lowcode-tools/src/execution/guardian-check.ts
import { config } from '@/config'  // ❌ packages不能引用主应用

// ✅ 正确：将共享配置移到lowcode-shared
// 1. 在 packages/lowcode-shared/src/config.ts 中定义
export const defaultConfig = { ... }

// 2. package中引用
import { defaultConfig } from '@smartabp/lowcode-shared'
```

#### 2.2 重构策略

**策略1: 配置/常量下沉**
```
主应用配置 → lowcode-shared/src/config
主应用常量 → lowcode-shared/src/constants
```

**策略2: 工具函数下沉**
```
主应用工具 → lowcode-shared/src/utils
```

**策略3: 类型定义下沉**
```
主应用类型 → lowcode-shared/src/types
```

---

### 阶段三：类型安全修复（Week 3）

#### 3.1 类型安全标准

```typescript
// ❌ 严禁模式
const data = response.data as any          // ❌ 绕过类型检查
const result: any = await api.call()       // ❌ any类型

// @ts-ignore                               // ❌ 忽略错误
const value = obj.unknownProperty

// ✅ 正确模式
interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

interface UserData {
  id: string
  name: string
  email: string
}

const response = await api.get<ApiResponse<UserData>>('/user')
const data: UserData = response.data
```

#### 3.2 类型定义位置规范

| 类型分类 | 定义位置 | 示例 |
|---------|---------|------|
| 元数据Schema | `@smartabp/metadata-core/src/types` | EntityMetadata, PropertyMetadata |
| 共享业务类型 | `@smartabp/lowcode-shared/src/types` | ComponentMetadata, ValidationRule |
| API响应类型 | `@smartabp/lowcode-api/src/types` | ApiResponse, PagedResult |
| Package内部类型 | `packages/xxx/src/types` | 仅在package内使用的类型 |
| 主应用业务类型 | `src/types` | UserDto, OrderDto等业务DTO |

#### 3.3 类型导出规范

**每个package的index.ts必须导出所有公共类型:**

```typescript
// packages/lowcode-shared/src/index.ts
export * from './types'
export * from './types/component'
export * from './types/validation'
export type { ComponentMetadata, ComponentCategory } from './components/ComponentRegistry'
```

---

## 🔧 工具和自动化

### 1. 架构合规检查脚本

```bash
# scripts/check-architecture-compliance.sh
#!/bin/bash

echo "🔍 执行架构三大铁律检查..."

# 检查一：相对路径引用
echo "检查相对路径引用..."
RELATIVE_IMPORTS=$(grep -r "from.*'\.\./'" packages/*/src --include="*.ts" --include="*.vue" | wc -l)
if [ $RELATIVE_IMPORTS -gt 0 ]; then
  echo "❌ 发现 $RELATIVE_IMPORTS 处相对路径违规"
  exit 1
fi

# 检查二：主应用引用
echo "检查主应用引用..."
MAIN_APP_REFS=$(grep -r "@/" packages/*/src --include="*.ts" --include="*.vue" | grep -v node_modules | wc -l)
if [ $MAIN_APP_REFS -gt 0 ]; then
  echo "❌ 发现 $MAIN_APP_REFS 处主应用引用违规"
  exit 1
fi

# 检查三：类型安全
echo "检查类型安全..."
AS_ANY_COUNT=$(grep -r "as any" src packages --include="*.ts" --include="*.vue" | wc -l)
if [ $AS_ANY_COUNT -gt 50 ]; then
  echo "⚠️  警告：发现 $AS_ANY_COUNT 处 'as any' 使用（目标<50）"
fi

echo "✅ 架构检查完成"
```

### 2. Git Pre-commit Hook

```bash
#!/bin/bash
# .husky/pre-commit

echo "🔒 执行Git pre-commit检查..."

# 1. 架构合规检查
npm run check:architecture || {
  echo "❌ 架构合规检查失败"
  echo "请修复架构违规后再提交"
  exit 1
}

# 2. 类型检查
npm run type-check || {
  echo "❌ TypeScript类型检查失败"
  exit 1
}

# 3. Lint检查
npm run lint -- --max-warnings 0 || {
  echo "❌ ESLint检查失败"
  exit 1
}

echo "✅ 所有检查通过，允许提交"
```

### 3. VSCode配置（强制规范）

```json
// .vscode/settings.json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  
  // 强制使用项目ESLint配置
  "eslint.validate": [
    "javascript",
    "typescript",
    "vue"
  ],
  
  // 保存时自动修复
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  
  // 显示相对路径违规警告
  "path-intellisense.showHiddenFiles": true,
  
  // TypeScript严格模式
  "typescript.preferences.strictNullChecks": true,
  "typescript.preferences.noImplicitAny": true
}
```

---

## 📊 进度追踪

### 修复进度记录模板

```json
// docs/architecture/fix-progress.json
{
  "version": "1.0",
  "lastUpdate": "2025-10-09",
  "phases": {
    "week1": {
      "title": "相对路径引用修复",
      "status": "in_progress",
      "packages": {
        "lowcode-shared": {
          "violations": 15,
          "fixed": 0,
          "status": "pending"
        },
        "metadata-core": {
          "violations": 8,
          "fixed": 0,
          "status": "pending"
        }
      }
    }
  }
}
```

---

## ✅ 质量验收标准

### Week 1 完成标准

```bash
✅ grep -r "'\.\./'" packages/*/src | wc -l  # 结果必须为 0
✅ npm run type-check                         # 必须0错误
✅ npm run build:packages                     # 必须100%成功
✅ npm run check:architecture                 # 必须通过
```

### Week 2 完成标准

```bash
✅ grep -r "@/" packages/*/src | wc -l       # 结果必须为 0
✅ 所有Git Hooks已配置并测试
✅ pre-commit自动检查正常工作
```

### Week 3 完成标准

```bash
✅ as any 使用量 < 50 处（从289降到50）
✅ @ts-ignore 使用量 = 0
✅ npm run type-check --strict               # 必须0错误
```

---

## 🚫 禁止事项（零容忍）

```yaml
禁止行为:
  ❌ 修复时引入新的架构违规
  ❌ 为了通过编译而使用 as any
  ❌ 为了快速修复而使用 @ts-ignore
  ❌ 修复时不更新进度记录
  ❌ 跳过架构合规检查
  ❌ 不遵循本指南的标准化流程
  ❌ "临时性"的变通方案
  ❌ 不一致的修复方式
```

---

## 💡 最佳实践

### 1. 每次修复后立即验证

```bash
# 修复一个文件后
npm run type-check
npm run check:architecture
git add <file>
git commit -m "fix(architecture): 修复 <package> 相对路径引用"
```

### 2. 保持修复一致性

所有相同类型的问题使用相同的修复模式，不要今天这样改，明天那样改。

### 3. 文档更新同步

每完成一个package的修复，立即更新 `fix-progress.json`。

### 4. 问题前置预防

修复完成后，配置自动化检查，防止问题再次出现。

---

## 📞 疑问解答

**Q: 什么时候可以使用相对路径？**  
A: 仅在package内部，引用同级或子级模块时可以使用相对路径。

**Q: 如何判断类型应该定义在哪里？**  
A: 参考 "类型定义位置规范" 表格，优先考虑复用性。

**Q: 发现新的架构违规怎么办？**  
A: 立即停止，报告问题，按本指南标准修复。

---

**🔥 核心思想：一次修复，永久合规！**

**让每一次修复都成为架构的加固，而不是临时的补丁！**

