# SmartAbp 架构监控指南

## 📋 文档信息

**版本**: 1.0.0  
**日期**: 2025-10-05  
**作者**: AI编程铁律执行引擎 v9.0  
**状态**: ✅ 已启用

## 🎯 架构监控目标

确保SmartAbp低代码引擎的packages架构健康，防止技术债务积累，维持≥85分的架构健康评分。

## 🏛️ 核心架构原则

### 1. Packages黑盒原则

**定义**: 每个package都是独立的、可复用的单元，包与包之间通过统一别名通信。

**强制规则**:
- ❌ **禁止**: 包之间通过相对路径 (`../`) 互相引用
- ❌ **禁止**: 包内部引用主应用 `@/` 别名
- ✅ **正确**: 使用 `@smartabp/*` 别名进行包间通信
- ✅ **正确**: 使用相对路径进行包内引用

### 2. 依赖层级规范

**包依赖层级**（只能向下依赖）:
```
层级0: lowcode-shared (零依赖)
层级1: lowcode-core, lowcode-api, lowcode-tools (只依赖shared)
层级2: lowcode-designer (依赖shared+core)
```

**规则**:
- ✅ 允许：层级2 → 层级1 → 层级0
- ❌ 禁止：层级0 → 任何
- ❌ 禁止：层级1 → 层级2
- ❌ 禁止：同层级相互依赖

### 3. 类型安全强制

**规则**:
- ❌ **禁止**: 使用 `as any` 绕过类型检查
- ❌ **禁止**: 使用 `@ts-ignore` 忽略类型错误
- ✅ **正确**: 使用正确的类型定义、接口声明或类型守卫

## 🔍 架构检查工具

### 自动化检查脚本

**Bash版本** (Linux/Mac):
```bash
bash scripts/quality/architecture-check.sh
```

**PowerShell版本** (Windows):
```powershell
pwsh -File scripts/quality/architecture-check.ps1
```

### 检查项目（五关）

#### 第一关：跨包相对路径检查 🔴 CRITICAL
- **检查内容**: 检测packages中是否有跨越3层以上的相对路径
- **标准**: 0违规
- **修复建议**: 使用 `@smartabp/*` 别名代替相对路径

#### 第二关：主应用别名引用检查 🔴 CRITICAL
- **检查内容**: packages是否引用主应用 `@/` 别名
- **标准**: 0违规
- **修复建议**: 使用 `@smartabp/*` 别名或通过props/依赖注入传递

#### 第三关：类型安全检查 🔴 CRITICAL
- **检查内容**: 检测 `as any` 和 `@ts-ignore` 使用
- **标准**: 0违规
- **修复建议**: 使用正确的类型定义

#### 第四关：循环依赖监控 🟡 WARNING
- **检查内容**: 包内循环依赖监控
- **当前状态**: 4个包内循环依赖（可接受）
- **改进建议**: 后续优化包内模块设计

#### 第五关：包依赖层级检查 🔴 CRITICAL
- **检查内容**: 检查逆向依赖和跨层级依赖
- **标准**: 0违规
- **重点检查**:
  - lowcode-shared不应依赖任何其他lowcode包
  - lowcode-core不应依赖lowcode-designer

## 🚀 CI/CD集成

### GitHub Actions

**工作流文件**: `.github/workflows/architecture-quality-check.yml`

**触发条件**:
- Pull Request到main/develop分支
- Push到main/develop分支
- 手动触发

**检查内容**:
1. 架构合规性检查（五关）
2. 依赖关系分析
3. 质量汇总报告

### Pre-commit钩子

**钩子文件**: `.husky/pre-commit`

**功能**:
- 检测packages目录修改
- 自动执行架构检查
- 发现违规时阻止提交

**跳过检查** (不推荐):
```bash
git commit --no-verify
```

## 📊 架构健康评分标准

### 评分公式

```typescript
架构健康评分 = (
  跨包依赖管理 * 0.30 +    // 30%权重
  包独立性 * 0.30 +         // 30%权重
  类型安全 * 0.25 +         // 25%权重
  包内模块设计 * 0.15       // 15%权重
)
```

### 评分等级

| 评分 | 等级 | 状态 | 说明 |
|-----|------|------|------|
| 95-100 | ⭐⭐⭐⭐⭐ | 卓越 | 架构完美，符合业界最佳实践 |
| 85-94 | ⭐⭐⭐⭐ | 健康 | 架构良好，符合项目标准 |
| 70-84 | ⭐⭐⭐ | 合格 | 需要改进，存在技术债务 |
| <70 | 💥 | 危险 | 严重违规，必须立即修复 |

### 当前评分

**SmartAbp 架构健康评分**: ≥95/100 ⭐⭐⭐⭐⭐

**明细**:
- ✅ 跨包依赖管理: 100分（无违规）
- ✅ 包独立性: 100分（完全独立）
- ✅ 类型安全: 100分（无绕过）
- 🟡 包内模块设计: 85分（有循环依赖，但可接受）

## 🛠️ 常见问题与修复

### 问题1：跨包相对路径违规

**错误示例**:
```typescript
// ❌ 错误：跨越包边界
import { EntityType } from '../../../lowcode-shared/src/types/entity'
```

**修复方案**:
```typescript
// ✅ 正确：使用@smartabp别名
import { EntityType } from '@smartabp/lowcode-shared'
```

### 问题2：主应用别名引用

**错误示例**:
```typescript
// ❌ 错误：packages引用主应用
import { api } from '@/utils/request'
```

**修复方案**:
```typescript
// ✅ 方案1：使用@smartabp别名
import { request } from '@smartabp/lowcode-shared/utils'

// ✅ 方案2：通过props传递
defineProps<{
  onApiCall: (url: string, data: any) => Promise<any>
}>()
```

### 问题3：类型安全绕过

**错误示例**:
```typescript
// ❌ 错误：使用as any
const data = response as any

// ❌ 错误：使用@ts-ignore
// @ts-ignore
const config = getConfig()
```

**修复方案**:
```typescript
// ✅ 正确：定义接口
interface ApiResponse {
  success: boolean
  data: EntityDto
  message?: string
}
const data: ApiResponse = response

// ✅ 正确：使用类型守卫
function isConfig(value: unknown): value is Config {
  return typeof value === 'object' && value !== null && 'key' in value
}
```

### 问题4：逆向依赖

**错误示例**:
```typescript
// ❌ 错误：lowcode-core依赖lowcode-designer（逆向）
import { DesignerLayout } from '@smartabp/lowcode-designer'
```

**修复方案**:
```typescript
// ✅ 正确：调整依赖方向，或提取到shared
// 将DesignerLayout接口提取到lowcode-shared
import { DesignerLayout } from '@smartabp/lowcode-shared'
```

## 📈 持续改进

### 短期目标（1-3个月）

- [x] 建立自动化架构检查（已完成）
- [x] 集成到CI/CD（已完成）
- [x] 添加pre-commit钩子（已完成）
- [ ] 100% TypeScript类型覆盖
- [ ] 补充单元测试覆盖率≥80%

### 中期目标（3-6个月）

- [ ] 优化包内循环依赖
- [ ] 建立架构决策记录(ADR)自动更新
- [ ] 实现架构健康趋势图
- [ ] 建立包版本管理机制

### 长期目标（6-12个月）

- [ ] 实现包独立发布
- [ ] 建立包市场
- [ ] 实现热更新机制
- [ ] 达到业界顶级架构水平

## 📚 参考资料

- [SmartAbp企业级低代码引擎系统架构说明书](./SmartAbp企业级低代码引擎系统架构说明书v18.0.md)
- [AI编程铁律自动执行引擎 v9.0](../../.cursor/rules/00_执行引擎.mdc)
- [代码标准规范](../../.cursor/rules/01_code_standards.mdc)
- [质量守护规范](../../.cursor/rules/03_quality_guardian.mdc)

## 💡 最佳实践

### 1. 开发前

- ✅ 执行架构检查确认无违规
- ✅ 查阅相关ADR架构决策
- ✅ 检索现有组件避免重复

### 2. 开发中

- ✅ 使用@smartabp/*别名通信
- ✅ 保持包的独立性
- ✅ 遵循类型安全原则
- ✅ 每300行代码执行质量检查

### 3. 提交前

- ✅ 执行架构检查脚本
- ✅ 确认所有检查通过
- ✅ 更新相关文档
- ✅ Git提交触发pre-commit检查

---

**维护者**: SmartAbp Architecture Team  
**最后更新**: 2025-10-05  
**联系方式**: architecture@smartabp.com
