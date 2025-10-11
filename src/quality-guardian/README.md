# @smartabp/quality-guardian

> 🛡️ **独立的企业级代码质量检测工具** - 支持任何TypeScript/Vue/C#项目的全方位质量检查

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](./package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

## ✨ 特性

- 🎯 **多维度质量评分** - 从正确性、安全性、可维护性等6个维度评估代码质量
- 🔥 **三级质量门禁** - P0/P1/P2分级管理，灵活控制质量标准
- 🏗️ **架构守护者** - 强制执行架构规则，防止架构腐化
- 🧩 **模块化检查器** - 15+专业检查器，支持插件扩展
- 📊 **多格式报告** - JSON/HTML/Markdown/SARIF多种报告格式
- ⚡ **高性能执行** - 并行检查，快速响应
- 🎨 **精美可视化** - HTML报告支持交互式查看

## 📦 安装

### 全局安装（推荐）

```bash
npm install -g @smartabp/quality-guardian
```

### 项目内安装

```bash
npm install @smartabp/quality-guardian --save-dev
```

### 从源码构建

```bash
cd src/quality-guardian
npm install
npm run build

# 全局安装
npm link
```

## 🚀 快速开始

### 命令行使用

```bash
# 基本使用（严格模式）
quality-guardian check

# 适中模式（只检查P0问题）
quality-guardian check --mode moderate

# 宽松模式（评分>=85即通过）
quality-guardian check --mode lenient

# CI模式（失败时自动exit 1）
quality-guardian check --ci-mode

# 指定检查器
quality-guardian check --checkers typescript,architecture

# 自定义报告目录
quality-guardian check --output-dir ./quality-reports

# 指定项目根目录
quality-guardian check --project-root /path/to/project
```

### 编程式使用

```typescript
import { QualityGuardian } from '@smartabp/quality-guardian'

const guardian = new QualityGuardian({
  projectRoot: process.cwd(),
  mode: 'strict',
  outputDir: './reports/quality'
})

const result = await guardian.check()

console.log(`质量评分: ${result.score}/100`)
console.log(`检查通过: ${result.passed ? '✅' : '❌'}`)
```

## 🔍 检查器列表

### 核心检查器

| 检查器 | 说明 | 权重 |
|-------|------|------|
| `typescript` | TypeScript类型检查 | 20% |
| `architecture` | 架构完整性检查 | 15% |
| `dependency` | 依赖关系检查 | 10% |
| `security` | 安全漏洞扫描 | 15% |
| `performance` | 性能指标检查 | 10% |
| `code-defect` | 代码缺陷检测 | 10% |
| `code-smell` | 代码坏味道检测 | 10% |
| `memory` | 内存泄漏检测 | 10% |

### 专项检查器

| 检查器 | 说明 |
|-------|------|
| `smartabp` | SmartAbp架构规范 |
| `lowcode` | 低代码平台专项 |
| `codegen` | 代码生成器质量 |

## 📊 报告格式

### HTML报告

```bash
quality-guardian check --output-format html
# 生成: reports/quality/quality-report-YYYY-MM-DD.html
```

- 交互式仪表盘
- 问题分类统计
- 趋势图表
- 详细问题列表

### JSON报告

```bash
quality-guardian check --output-format json
# 生成: reports/quality/quality-report-YYYY-MM-DD.json
```

适合集成到CI/CD或其他工具。

### Markdown报告

```bash
quality-guardian check --output-format markdown
# 生成: reports/quality/quality-report-YYYY-MM-DD.md
```

适合嵌入文档或PR评论。

## ⚙️ 配置文件

在项目根目录创建 `.quality-guardian.json`:

```json
{
  "mode": "strict",
  "checkers": {
    "typescript": { "enabled": true, "weight": 20 },
    "architecture": { "enabled": true, "weight": 15 },
    "security": { "enabled": true, "weight": 15 }
  },
  "thresholds": {
    "strict": 95,
    "moderate": 85,
    "lenient": 75
  },
  "excludes": [
    "**/node_modules/**",
    "**/dist/**",
    "**/*.spec.ts"
  ]
}
```

## 🎯 质量门禁

### P0级别（阻断发布）

- TypeScript编译错误
- 架构违规
- 严重安全漏洞
- 循环依赖

### P1级别（警告但不阻断）

- ESLint错误
- 代码重复
- 性能问题
- 内存泄漏风险

### P2级别（建议）

- 代码坏味道
- 文档缺失
- 测试覆盖率
- 技术债务

## 🔧 集成

### GitHub Actions

```yaml
name: Code Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g @smartabp/quality-guardian
      - run: quality-guardian check --ci-mode
```

### GitLab CI

```yaml
quality-check:
  stage: test
  script:
    - npm install -g @smartabp/quality-guardian
    - quality-guardian check --ci-mode
  artifacts:
    reports:
      junit: reports/quality/*.xml
```

### package.json scripts

```json
{
  "scripts": {
    "quality": "quality-guardian check",
    "quality:strict": "quality-guardian check --mode strict",
    "quality:ci": "quality-guardian check --ci-mode"
  }
}
```

## 📈 性能优化

Quality Guardian 内置了多项性能优化：

- 🚀 并行检查器执行
- 💾 智能缓存机制
- 🎯 增量检查（仅检查变更文件）
- ⚡ Worker线程池

典型性能指标：

- 小型项目（<100文件）: ~10秒
- 中型项目（100-500文件）: ~30秒
- 大型项目（>500文件）: ~60秒

## 🛠️ 开发指南

### 项目结构

```
src/quality-guardian/
├── src/
│   ├── checkers/        # 检查器实现
│   ├── core/            # 核心引擎
│   ├── reporters/       # 报告生成器
│   ├── utils/           # 工具函数
│   ├── cli.ts           # CLI入口
│   └── index.ts         # API入口
├── test/                # 测试文件
├── reports/             # 报告输出
└── package.json
```

### 添加自定义检查器

```typescript
import { BaseChecker, CheckResult } from '@smartabp/quality-guardian'

export class MyCustomChecker extends BaseChecker {
  name = 'my-custom'
  description = 'My custom quality checker'
  
  async check(): Promise<CheckResult> {
    // 实现检查逻辑
    return {
      passed: true,
      score: 100,
      issues: []
    }
  }
}
```

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

- 📧 Email: support@smartabp.com
- 📖 文档: https://docs.smartabp.com/quality-guardian
- 🐛 Issues: https://github.com/smartabp/quality-guardian/issues

---

**Quality Guardian** - 守护代码质量，保障项目成功 🛡️
