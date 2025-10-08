# SmartAbp Quality Guardian - 使用指南

> **企业级全栈代码质量检测系统**
> 
> Version: 1.0.0  
> Last Updated: 2025-10-08

---

## 📋 目录

- [快速开始](#快速开始)
- [核心功能](#核心功能)
- [使用方法](#使用方法)
- [质量门禁](#质量门禁)
- [配置说明](#配置说明)
- [CI/CD集成](#cicd集成)
- [常见问题](#常见问题)

---

## 🚀 快速开始

### 环境要求

- **Node.js**: ≥20.19.0
- **npm**: ≥10.0.0
- **.NET SDK**: ≥8.0（后端检查需要）
- **Git**: 任意版本

### 安装

Quality Guardian已集成到SmartAbp项目中，无需额外安装。

### 第一次运行

```bash
# 1. 环境检查
npm run quality

# 2. 运行质量门禁
npm run quality:gate

# 3. 生成质量报告
npm run quality:report
```

---

## 🎯 核心功能

### 1. TypeScript类型安全检查（P0）

**检查项**：
- ✅ TypeScript编译检查（0错误）
- ✅ 禁止`as any`（100%类型安全）
- ✅ 禁止`@ts-ignore`
- ✅ 严格null检查配置

**标准**：
```typescript
// ❌ 错误
const data: any = response;
const user = data as any;

// ✅ 正确
interface User {
  id: string;
  name: string;
}
const user: User = response.data;
```

### 2. 架构合规性检查（P0）

**检查项**：
- ✅ packages相对路径引用（禁止`../`）
- ✅ packages引用主应用（禁止`@/`）
- ✅ packages逆向依赖检查
- ✅ 循环依赖检测

**标准**：
```typescript
// ❌ 错误（在packages中）
import { ComponentRegistry } from '../../../lowcode-shared'
import { UserService } from '@/services/UserService'

// ✅ 正确
import { ComponentRegistry } from '@smartabp/lowcode-shared'
import { ApiService } from '@smartabp/lowcode-api'
```

### 3. SmartAbp特定规则（P0/P1/P2）

**检查项**：
- 🔴 P0: Mock代码检测
- 🔴 P0: 硬编码密码/密钥
- 🟡 P1: 硬编码URL
- 🟡 P1: 空实现检测
- 🔵 P2: TODO标记
- 🔵 P2: console.log

---

## 💻 使用方法

### 命令行工具

#### 1. 完整质量检查

```bash
npm run quality
```

**输出**：
- 环境检查结果
- 文件扫描统计
- 质量检查报告
- 质量评分

#### 2. 质量门禁（推荐）

```bash
# 严格模式（默认）：P0和P1零违规
npm run quality:gate

# 适中模式：仅P0零违规
npm run quality:gate -- --moderate

# 宽松模式：评分≥90即可
npm run quality:gate -- --lenient
```

**退出码**：
- `0`: 门禁通过
- `1`: 门禁失败

#### 3. 单独检查器

```bash
# TypeScript检查
node scripts/quality/checkers/typescript-checker.js

# 架构检查
node scripts/quality/checkers/architecture-checker.js

# SmartAbp规则检查
node scripts/quality/checkers/smartabp-checker.js
```

#### 4. 生成报告

```bash
# 生成所有格式（JSON + Markdown + HTML）
npm run quality:report

# 仅生成JSON
node scripts/quality/reporters/report-generator.js
```

**报告位置**：
- JSON: `reports/quality/quality-report-{timestamp}.json`
- Markdown: `reports/quality/quality-report-{timestamp}.md`
- HTML: `reports/quality/quality-report-{timestamp}.html`

---

## 🚦 质量门禁

### 门禁级别

#### P0 - 阻断性问题（必须解决）

**定义**：严重影响代码质量、架构完整性、类型安全的问题

**规则**：
- TypeScript编译错误
- `as any` / `@ts-ignore`
- packages相对路径引用
- packages引用主应用
- packages逆向依赖
- Mock代码（生产环境）
- 硬编码密码/密钥

**阈值**：**0违规**（零容忍）

#### P1 - 严重问题（强烈建议解决）

**定义**：影响代码可维护性、安全性的问题

**规则**：
- 硬编码URL
- 空实现
- 循环依赖

**阈值**：**0违规**（严格模式）

#### P2 - 一般问题（建议解决）

**定义**：影响代码规范性、可读性的问题

**规则**：
- TODO/FIXME标记
- console.log
- 魔法数字

**阈值**：≤10个（可接受）

### 门禁模式

#### 严格模式（Strict）- 默认

```bash
npm run quality:gate
```

**通过条件**：
- P0违规 = 0
- P1违规 = 0
- P2违规 ≤ 10

#### 适中模式（Moderate）

```bash
npm run quality:gate -- --moderate
```

**通过条件**：
- P0违规 = 0
- P1违规 < ∞（允许）
- P2违规 < ∞（允许）

#### 宽松模式（Lenient）

```bash
npm run quality:gate -- --lenient
```

**通过条件**：
- 质量评分 ≥ 90

**评分公式**：
```javascript
score = 100 - (P0违规 × 10) - (P1违规 × 5) - (P2违规 × 1)
```

---

## ⚙️ 配置说明

### 质量配置

**文件**：`config/quality-config.json`

```json
{
  "global": {
    "autoFix": false,
    "failOnError": true,
    "failOnWarning": false,
    "maxWarnings": 10
  },
  "scoring": {
    "thresholds": {
      "excellent": 95,
      "good": 90,
      "acceptable": 85,
      "poor": 70
    }
  }
}
```

### 规则配置

**文件**：`config/quality-rules.json`

```json
{
  "frontend": {
    "typescript": {
      "no-any": { "level": "P0", "enabled": true },
      "no-ts-ignore": { "level": "P0", "enabled": true }
    }
  },
  "smartabp": {
    "no-mock-code-in-production": { "level": "P0", "enabled": true },
    "no-hardcoded-credentials": { "level": "P0", "enabled": true }
  }
}
```

### 门禁配置

**文件**：`config/quality-gate.json`

```json
{
  "strategy": {
    "mode": "strict",
    "failFast": false,
    "generateReport": true
  },
  "scoring": {
    "minScore": 90,
    "breakdown": {
      "P0violations": -10,
      "P1violations": -5,
      "P2violations": -1
    }
  }
}
```

---

## 🔄 CI/CD集成

### GitHub Actions

**文件**：`.github/workflows/quality-check.yml`

```yaml
name: Quality Check

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0'
      
      - name: Install Dependencies
        run: npm install
      
      - name: Run Quality Gate
        run: npm run quality:gate -- --ci-mode
      
      - name: Upload Reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: quality-reports
          path: reports/quality/
```

### GitLab CI

**文件**：`.gitlab-ci.yml`

```yaml
quality-check:
  stage: test
  image: node:20
  before_script:
    - npm install
  script:
    - npm run quality:gate -- --ci-mode
  artifacts:
    when: always
    paths:
      - reports/quality/
  only:
    - merge_requests
    - main
```

### 本地Git钩子

**文件**：`.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 运行质量门禁（快速模式）
npm run quality:gate -- --no-fail-fast

if [ $? -ne 0 ]; then
  echo "❌ 质量门禁失败！请修复后再提交。"
  exit 1
fi
```

---

## ❓ 常见问题

### Q1: 如何跳过某个检查？

**A**: 修改`config/quality-rules.json`，设置`enabled: false`

```json
{
  "frontend": {
    "typescript": {
      "no-console": { "level": "P2", "enabled": false }
    }
  }
}
```

### Q2: 如何调整评分权重？

**A**: 修改`config/quality-gate.json`的`breakdown`配置

```json
{
  "scoring": {
    "breakdown": {
      "P0violations": -20,  // 加重P0惩罚
      "P1violations": -3,   // 减轻P1惩罚
      "P2violations": -0.5  // 减轻P2惩罚
    }
  }
}
```

### Q3: 检查速度太慢怎么办？

**A**: 使用快速模式或调整扫描范围

```bash
# 快速模式（跳过TypeScript编译检查）
npm run quality:gate -- --no-fail-fast

# 或者修改 config/quality-config.json 的 paths.include
```

### Q4: 如何在特定文件中临时禁用检查？

**A**: 不建议禁用，应该修复问题。如必须禁用：

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = legacyApi();
```

### Q5: 报告文件太大怎么办？

**A**: 报告会自动压缩历史记录，只保留最新10份

```bash
# 手动清理旧报告
rm reports/quality/quality-report-2025-*.json
```

---

## 📞 技术支持

**项目地址**: `/scripts/quality/`

**核心文件**：
- `index.js` - 主入口
- `gate.js` - 质量门禁
- `checkers/` - 检查器
- `reporters/` - 报告生成器
- `utils/` - 工具函数

**问题反馈**: 请联系SmartAbp团队

---

**© 2025 SmartAbp Team. All Rights Reserved.**

