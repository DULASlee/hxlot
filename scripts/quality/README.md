# SmartAbp Quality Guardian

> 🛡️ **企业级全栈代码质量检测系统**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/smartabp/quality-guardian)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.19.0-brightgreen.svg)](https://nodejs.org)

---

## 📖 简介

SmartAbp Quality Guardian是一个**零配置、开箱即用**的企业级代码质量检测系统，专为SmartAbp项目设计。

### ✨ 核心特性

- 🎯 **P0/P1/P2三级质量门禁** - 确保代码质量达到企业级标准
- 🔍 **100%类型安全** - TypeScript编译零错误，禁止`as any`
- 🏗️ **架构完整性保护** - packages黑盒独立，严格依赖管理
- 🚀 **零配置启动** - 自动环境检测，智能配置生成
- 📊 **多格式报告** - JSON/Markdown/HTML三种格式
- 🔄 **CI/CD就绪** - GitHub Actions/GitLab CI集成

---

## 🚀 快速开始

### 一分钟上手

```bash
# 1. 运行质量检查
npm run quality

# 2. 运行质量门禁（推荐）
npm run quality:gate

# 3. 查看报告
open reports/quality/quality-report-latest.html
```

### 环境要求

- Node.js ≥ 20.19.0
- npm ≥ 10.0.0
- .NET SDK ≥ 8.0（后端检查）
- Git

---

## 📦 系统架构

```
scripts/quality/
├── index.js                    # 主入口
├── gate.js                     # 质量门禁
├── checkers/                   # 检查器
│   ├── typescript-checker.js  # TypeScript检查
│   ├── architecture-checker.js # 架构检查
│   └── smartabp-checker.js    # SmartAbp规则检查
├── reporters/                  # 报告生成器
│   └── report-generator.js
└── utils/                      # 工具函数
    ├── environment-checker.js
    ├── config-generator.js
    └── file-scanner.js
```

---

## 🎯 检查项目清单

### TypeScript类型安全（P0）

| 检查项 | 级别 | 描述 |
|--------|------|------|
| TypeScript编译 | P0 | 0错误 |
| 禁止`as any` | P0 | 100%类型安全 |
| 禁止`@ts-ignore` | P0 | 不绕过类型检查 |
| 严格null检查 | P1 | 建议启用 |

### 架构合规性（P0）

| 检查项 | 级别 | 描述 |
|--------|------|------|
| packages相对路径 | P0 | 禁止`../` |
| packages引用主应用 | P0 | 禁止`@/` |
| 逆向依赖 | P0 | 分层正确 |
| 循环依赖 | P1 | 检测循环引用 |

### SmartAbp特定规则

| 检查项 | 级别 | 描述 |
|--------|------|------|
| Mock代码 | P0 | 生产环境禁用 |
| 硬编码密码 | P0 | 安全检查 |
| 硬编码URL | P1 | 使用配置 |
| 空实现 | P1 | 完整实现 |
| TODO标记 | P2 | 建议完成 |
| console.log | P2 | 使用日志系统 |

---

## 💻 使用方法

### 基础命令

```bash
# 完整质量检查
npm run quality

# 质量门禁（严格模式）
npm run quality:gate

# 质量门禁（适中模式）
npm run quality:gate -- --moderate

# 质量门禁（宽松模式）
npm run quality:gate -- --lenient

# CI模式（失败时exit 1）
npm run quality:gate -- --ci-mode
```

### 单独检查器

```bash
# TypeScript检查
node scripts/quality/checkers/typescript-checker.js

# 架构检查
node scripts/quality/checkers/architecture-checker.js

# SmartAbp规则检查
node scripts/quality/checkers/smartabp-checker.js

# 环境检查
node scripts/quality/utils/environment-checker.js
```

### 报告生成

```bash
# 生成所有格式报告
npm run quality:report

# 查看JSON报告
cat reports/quality/quality-report-latest.json | jq

# 打开HTML报告
open reports/quality/quality-report-*.html
```

---

## 🚦 质量门禁

### 门禁模式对比

| 模式 | P0 | P1 | P2 | 评分 |
|------|----|----|----|----|
| 严格（默认） | = 0 | = 0 | ≤ 10 | - |
| 适中 | = 0 | - | - | - |
| 宽松 | - | - | - | ≥ 90 |

### 评分公式

```
质量评分 = 100 - (P0违规 × 10) - (P1违规 × 5) - (P2违规 × 1)
```

### 评分等级

- 🏆 **优秀**: ≥ 95分
- ✅ **良好**: 90-94分
- ⚠️ **可接受**: 85-89分
- ❌ **需改进**: < 85分

---

## 📊 报告格式

### JSON报告

```json
{
  "version": "1.0.0",
  "timestamp": "2025-10-08T10:00:00.000Z",
  "summary": {
    "totalScore": 95,
    "gateResult": "PASS",
    "violations": {
      "P0": 0,
      "P1": 2,
      "P2": 5
    }
  },
  "checkers": {
    "typescript": { "passed": true },
    "architecture": { "passed": true },
    "smartabp": { "passed": true }
  }
}
```

### Markdown报告

- 质量评分
- 检查结果表格
- 问题统计
- 改进建议

### HTML报告

- 可视化仪表板
- 交互式图表
- 详细违规列表
- 美观的UI界面

---

## 🔄 CI/CD集成

### GitHub Actions

```yaml
- name: Quality Gate
  run: npm run quality:gate -- --ci-mode
```

### GitLab CI

```yaml
quality:
  script:
    - npm run quality:gate -- --ci-mode
```

### Pre-commit Hook

```bash
npm run quality:gate -- --no-fail-fast
```

---

## ⚙️ 配置文件

### 自动生成配置

首次运行时会自动生成以下配置文件：

```
config/
├── quality-config.json   # 质量配置
├── quality-rules.json    # 规则配置
└── quality-gate.json     # 门禁配置
```

### 自定义配置

编辑配置文件可调整：
- 检查规则开关
- 违规阈值
- 评分权重
- 扫描路径

---

## 📈 最佳实践

### 1. 开发阶段

```bash
# 提交前检查
npm run quality:gate
```

### 2. Code Review

```bash
# 生成报告供评审
npm run quality:report
```

### 3. CI/CD流水线

```yaml
# 自动质量门禁
npm run quality:gate -- --ci-mode
```

### 4. 定期质量审计

```bash
# 完整检查 + 报告
npm run quality
npm run quality:report
```

---

## 🛠️ 开发指南

### 添加新检查器

1. 创建检查器：`scripts/quality/checkers/my-checker.js`
2. 实现`check()`方法
3. 返回标准结果格式
4. 集成到`gate.js`

### 检查器模板

```javascript
class MyChecker {
  async check() {
    return {
      passed: true,
      violations: {
        P0: [],
        P1: [],
        P2: []
      }
    };
  }
}
```

---

## 📚 文档

- [使用指南](../../docs/quality/SmartAbp-Quality-Guardian-使用指南.md)
- [技术设计](../../docs/代码质量检查/SmartAbp全栈代码质量检查系统-深度分析与实施方案.md)
- [开发计划](../../docs/代码质量检查/SmartAbp代码质量检查系统-详细开发计划.md)

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

## 📄 License

MIT License

---

## 📞 技术支持

**SmartAbp Team**

- GitHub: https://github.com/smartabp
- Email: support@smartabp.com

---

**🎯 让代码质量成为习惯，而不是负担！**
