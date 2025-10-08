# Quality Guardian - 快速参考

## 🚀 常用命令

```bash
# 快速检查
npm run quality

# 质量门禁（推荐）
npm run quality:gate

# 生成报告
npm run quality:report

# CI模式
npm run quality:gate -- --ci-mode
```

## 🎯 质量标准

### P0 - 阻断性（0违规）
- ❌ TypeScript编译错误
- ❌ `as any` / `@ts-ignore`
- ❌ packages相对路径（`../`）
- ❌ packages引用主应用（`@/`）
- ❌ Mock代码
- ❌ 硬编码密码

### P1 - 严重（建议0违规）
- ⚠️ 硬编码URL
- ⚠️ 空实现
- ⚠️ 循环依赖

### P2 - 一般（≤10个）
- ℹ️ TODO标记
- ℹ️ console.log

## 📊 评分公式

```
分数 = 100 - (P0 × 10) - (P1 × 5) - (P2 × 1)
```

## 🏆 评分等级

- **95-100**: 优秀 🏆
- **90-94**: 良好 ✅
- **85-89**: 可接受 ⚠️
- **<85**: 需改进 ❌

## 🚦 门禁模式

| 模式 | 命令 | 通过条件 |
|------|------|---------|
| 严格 | `npm run quality:gate` | P0=0, P1=0 |
| 适中 | `npm run quality:gate -- --moderate` | P0=0 |
| 宽松 | `npm run quality:gate -- --lenient` | 分数≥90 |

## 📁 报告位置

```
reports/quality/
├── quality-report-{timestamp}.json
├── quality-report-{timestamp}.md
├── quality-report-{timestamp}.html
└── quality-report-latest.json  # 最新版本
```

## 🔧 配置文件

```
config/
├── quality-config.json   # 全局配置
├── quality-rules.json    # 规则配置
└── quality-gate.json     # 门禁配置
```

## ✅ 正确示例

```typescript
// TypeScript类型安全
interface User {
  id: string;
  name: string;
}
const user: User = await api.getUser(id);

// packages引用
import { ComponentRegistry } from '@smartabp/lowcode-shared'
```

## ❌ 错误示例

```typescript
// 禁止 as any
const data: any = response;

// 禁止相对路径（在packages中）
import { xxx } from '../../../shared'

// 禁止主应用引用（在packages中）
import { xxx } from '@/services/xxx'
```

## 🆘 常见问题

**Q: 如何跳过某个检查？**
A: 修改`config/quality-rules.json`，设置`enabled: false`

**Q: 如何调整评分权重？**
A: 修改`config/quality-gate.json`的`breakdown`配置

**Q: 检查太慢怎么办？**
A: 使用`--no-fail-fast`参数或调整扫描范围

---

**💡 提示**: 详细文档请查看 [使用指南](../../docs/quality/SmartAbp-Quality-Guardian-使用指南.md)

