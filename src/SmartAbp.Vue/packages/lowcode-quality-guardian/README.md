# @smartabp/lowcode-quality-guardian

> 🛡️ **企业级代码质量保障工具** - 为SmartAbp低代码平台和生成的代码提供全方位质量检查

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](./package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.19.0-brightgreen.svg)](https://nodejs.org/)

## ✨ 特性

- 🎯 **多维度质量评分** - 从正确性、安全性、可维护性等6个维度评估代码质量
- 🔥 **三级质量门禁** - P0/P1/P2分级管理，灵活控制质量标准
- 🏗️ **架构守护者** - 强制执行SmartAbp架构三大铁律，防止架构腐化
- 🧩 **模块化检查器** - 8个专业检查器，支持插件扩展
- 📊 **多格式报告** - JSON/HTML/Markdown/SARIF多种报告格式
- ⚡ **高性能执行** - 并行检查，快速响应
- 🎨 **精美可视化** - HTML报告支持交互式查看

## 📦 安装

```bash
# 在SmartAbp项目中
cd src/SmartAbp.Vue
npm install

# 或单独安装
npm install @smartabp/lowcode-quality-guardian --save-dev
```

## 🚀 快速开始

### 命令行使用

```bash
# 基本使用（严格模式）
npx quality-guardian check

# 适中模式（只检查P0问题）
npx quality-guardian check --mode moderate

# 宽松模式（评分>=85即通过）
npx quality-guardian check --mode lenient

# CI模式（失败时自动exit 1）
npx quality-guardian check --ci-mode

# 指定检查器
npx quality-guardian check --checkers typescript,architecture,smartabp

# 自定义报告目录
npx quality-guardian check --report-dir ./custom-reports
```

### 编程方式使用

```typescript
import { QualityGuardian } from '@smartabp/lowcode-quality-guardian';

const guardian = new QualityGuardian({
  projectRoot: process.cwd(),
  mode: 'strict',
  ciMode: false,
  failFast: true,
  generateReport: true,
  reportDir: './reports/quality'
});

const report = await guardian.run();

console.log(`质量评分: ${report.scores.overall}/100`);
console.log(`门禁状态: ${report.gate.passed ? '✅ 通过' : '❌ 失败'}`);
```

## 🔍 内置检查器

### 1. TypeScript类型检查器 ✅
- 检查TypeScript编译错误
- 确保100%类型安全
- 禁止`as any`和`@ts-ignore`

### 2. 架构合规性检查器 🏗️
- 检查packages依赖层级
- 防止逆向依赖和循环依赖
- 验证模块独立性

### 3. SmartAbp专用检查器 🎯
- 检查ABP最佳实践
- Mock代码检测（P0重点）
- 空实现检测
- 硬编码检测
- 代码重复度检查

### 4. 低代码引擎检查器 🧩
- 组件注册完整性检查
- 类型系统统一性验证
- 包导出完整性检查
- 架构三大铁律强制执行

### 5. 代码生成检查器 ⚙️
- 模板质量检查
- 生成代码质量验证
- 占位符完整性检查

### 6. 性能检查器 ⚡
- 大文件检测（>500行）
- 复杂函数检测
- Bundle大小分析

### 7. 安全检查器 🔒
- 敏感信息泄露检测
- SQL注入风险扫描
- 硬编码密码/密钥检查

### 8. 依赖检查器 📦
- npm包安全漏洞扫描
- 过时依赖检测
- 版本兼容性检查

## 📊 质量评分体系

### 评分维度（6个维度）

```yaml
正确性 (Correctness):
  - TypeScript编译错误
  - Mock代码检测
  - 空实现检测
  
安全性 (Security):
  - 安全漏洞
  - 敏感信息泄露
  - 硬编码密钥

可维护性 (Maintainability):
  - 代码重复度
  - 魔法数字
  - 代码复杂度

架构合规 (Architecture):
  - packages架构层级
  - 依赖方向正确性
  - 模块独立性

代码风格 (Style):
  - ESLint规范
  - console.log检测
  - TODO标记

性能 (Performance):
  - 大文件
  - 复杂函数
  - Bundle大小
```

### 扣分规则

- **P0违规**: 每个扣10分（阻断性问题）
- **P1违规**: 每个扣5分（严重问题）
- **P2违规**: 每个扣1分（一般问题）

### 质量等级

- **🏆 优秀** (95-100分): 企业级标准
- **✅ 良好** (90-94分): 可接受
- **⚠️ 需改进** (85-89分): 有优化空间
- **❌ 较差** (<85分): 需要重构

## 🚦 质量门禁模式

### Strict模式（严格）
```bash
# P0和P1都必须为0
npx quality-guardian check --mode strict
```

### Moderate模式（适中）
```bash
# 只要求P0为0
npx quality-guardian check --mode moderate
```

### Lenient模式（宽松）
```bash
# 综合评分>=85即可
npx quality-guardian check --mode lenient
```

## 📄 报告格式

### JSON报告
```bash
# 机器可读，适合CI/CD集成
reports/quality/quality-report-latest.json
```

### HTML报告
```bash
# 可视化报告，支持浏览器查看
reports/quality/quality-report-2025-10-09.html
```

### Markdown报告
```bash
# 文档友好，可直接查看
reports/quality/quality-report-2025-10-09.md
```

### SARIF报告
```bash
# 静态分析标准格式，IDE集成
reports/quality/quality-report-2025-10-09.sarif
```

## 🔧 自定义检查器

### 创建自定义检查器

```typescript
import { BaseChecker } from '@smartabp/lowcode-quality-guardian';

export class MyCustomChecker extends BaseChecker {
  public readonly name = '我的自定义检查器';
  public readonly description = '检查自定义规则';
  public readonly version = '1.0.0';

  protected async doCheck(): Promise<void> {
    // 实现检查逻辑
    const files = await this.findFiles('**/*.ts');
    
    for (const file of files) {
      const content = await this.readFile(file);
      
      if (content.includes('badPattern')) {
        this.addViolation({
          rule: 'custom.bad-pattern',
          level: 'P1',
          file,
          message: '发现不良模式',
          suggestion: '使用推荐的模式'
        });
      }
    }
  }
}

// 注册检查器
const guardian = new QualityGuardian(config);
guardian.registerChecker(new MyCustomChecker());
```

## 🎯 SmartAbp架构三大铁律

### 铁律一：统一类型系统
```typescript
// ✅ 正确：在lowcode-shared中定义
// packages/lowcode-shared/src/types/index.ts
export interface DependencyGraph { ... }

// ❌ 错误：在主应用中定义
// src/core/types.ts
interface DependencyGraph { ... }
```

### 铁律二：组件注册系统
```typescript
// ✅ 正确：注册组件
import { registerComponent } from '@smartabp/lowcode-shared';

registerComponent({
  name: 'MyComponent',
  displayName: '我的组件',
  category: 'form',
  // ...
});

// ❌ 错误：不注册直接使用
import MyComponent from './MyComponent.vue';
```

### 铁律三：架构层级
```
Layer 2: lowcode-designer
    ↓ 只能向下依赖
Layer 1: lowcode-core, lowcode-api, lowcode-tools
    ↓ 只能向下依赖
Layer 0: lowcode-shared
    ↓ 只能向下依赖
Layer -1: metadata-core
```

## 💡 最佳实践

### 1. 在Git Hooks中集成

```bash
# .husky/pre-commit
#!/bin/sh
npx quality-guardian check --mode moderate --no-report || exit 1
```

### 2. 在CI/CD中集成

```yaml
# .github/workflows/quality-check.yml
- name: Quality Check
  run: npx quality-guardian check --ci-mode --mode strict
```

### 3. 定期质量报告

```bash
# 每日定时生成质量报告
npx quality-guardian check --mode lenient
```

## 📈 路线图

- [x] v2.0: 完整重构TypeScript版本
- [ ] v2.1: 支持配置文件(.qualityrc.json)
- [ ] v2.2: 自动修复功能
- [ ] v2.3: VSCode插件集成
- [ ] v2.4: 实时监控模式
- [ ] v2.5: AI辅助代码审查

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 许可证

MIT © SmartAbp Team

## 🔗 相关链接

- [SmartAbp官方文档](https://github.com/SmartAbp)
- [问题反馈](https://github.com/SmartAbp/issues)
- [更新日志](./CHANGELOG.md)

---

**🛡️ Quality Guardian - 守护你的代码质量！**

