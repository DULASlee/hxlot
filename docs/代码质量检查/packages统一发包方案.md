# SmartAbp Packages 统一发包方案

**方案版本**: v1.0  
**制定日期**: 2025-10-11  
**架构师**: AI Assistant

---

## 🎯 方案概述

将所有6个packages作为一个统一的大包发布到NPM，采用**Monorepo统一发包**策略。

---

## 📦 方案对比

### 方案A: 多包独立发布（当前状态）

**优点**:
- ✅ 按需安装，包体积小
- ✅ 版本独立管理
- ✅ 灵活组合使用

**缺点**:
- ❌ 管理复杂，需要协调6个包的版本
- ❌ 用户需要手动安装多个依赖
- ❌ 版本兼容性问题

### 方案B: 统一大包发布（推荐）⭐

**优点**:
- ✅ 一键安装，使用简单
- ✅ 版本统一，无兼容性问题
- ✅ 更新同步，维护方便
- ✅ 用户体验好

**缺点**:
- ❌ 包体积较大（但现代打包工具支持tree-shaking）
- ❌ 无法按需引入单个子包（可通过子路径导出解决）

---

## 🏗️ 推荐方案：Monorepo统一大包

### 包结构设计

```
@smartabp/lowcode
├── metadata-core       (内部模块)
├── lowcode-shared      (内部模块)
├── lowcode-api         (内部模块)
├── lowcode-core        (内部模块)
├── lowcode-designer    (内部模块)
└── lowcode-tools       (内部模块)
```

### 统一入口设计

```typescript
// 用户安装
npm install @smartabp/lowcode

// 使用方式1: 统一导入
import { 
  // 从 metadata-core
  ModuleMetadataSchema,
  validateModuleMetadata,
  
  // 从 lowcode-shared
  ComponentRegistry,
  ValidationManager,
  
  // 从 lowcode-api
  HttpClient,
  CodeGenerator,
  
  // 从 lowcode-core
  useEntityModelingStore,
  useEnhancedThemeStore,
  SmartFormDesigner,
  
  // 从 lowcode-designer
  VisualDesignCanvas,
  CodeGenerationWizard,
  
  // 从 lowcode-tools
  ArchitectureChecker
} from '@smartabp/lowcode'

// 使用方式2: 子路径导入（支持tree-shaking）
import { ComponentRegistry } from '@smartabp/lowcode/shared'
import { useEntityModelingStore } from '@smartabp/lowcode/core'
import { VisualDesignCanvas } from '@smartabp/lowcode/designer'
import { HttpClient } from '@smartabp/lowcode/api'
import { validateModuleMetadata } from '@smartabp/lowcode/metadata'
import { ArchitectureChecker } from '@smartabp/lowcode/tools'
```

---

## 📋 实施步骤

### 第一步：创建统一包结构

在 `packages/` 目录下创建新的统一包：

```bash
packages/
├── lowcode/                    # 新建：统一大包
│   ├── package.json           # 统一配置
│   ├── README.md              # 统一文档
│   ├── tsconfig.json          # 统一TypeScript配置
│   ├── tsup.config.ts         # 统一构建配置
│   ├── src/
│   │   ├── index.ts           # 主入口：导出所有模块
│   │   ├── metadata.ts        # 子入口：metadata-core
│   │   ├── shared.ts          # 子入口：lowcode-shared
│   │   ├── api.ts             # 子入口：lowcode-api
│   │   ├── core.ts            # 子入口：lowcode-core
│   │   ├── designer.ts        # 子入口：lowcode-designer
│   │   └── tools.ts           # 子入口：lowcode-tools
│   └── dist/                  # 编译输出
├── metadata-core/             # 保留：作为内部包
├── lowcode-shared/            # 保留：作为内部包
├── lowcode-api/               # 保留：作为内部包
├── lowcode-core/              # 保留：作为内部包
├── lowcode-designer/          # 保留：作为内部包
└── lowcode-tools/             # 保留：作为内部包
```

### 第二步：配置统一包的 package.json

```json
{
  "name": "@smartabp/lowcode",
  "version": "1.0.0",
  "description": "SmartAbp 企业级低代码平台 - 统一发布版",
  "keywords": [
    "smartabp",
    "lowcode",
    "low-code",
    "visual-design",
    "code-generation",
    "metadata",
    "enterprise"
  ],
  "author": "SmartAbp Team <team@smartabp.io>",
  "homepage": "https://github.com/smartabp/smartabp",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./metadata": {
      "types": "./dist/metadata.d.ts",
      "import": "./dist/metadata.mjs",
      "require": "./dist/metadata.js"
    },
    "./shared": {
      "types": "./dist/shared.d.ts",
      "import": "./dist/shared.mjs",
      "require": "./dist/shared.js"
    },
    "./api": {
      "types": "./dist/api.d.ts",
      "import": "./dist/api.mjs",
      "require": "./dist/api.js"
    },
    "./core": {
      "types": "./dist/core.d.ts",
      "import": "./dist/core.mjs",
      "require": "./dist/core.js"
    },
    "./designer": {
      "types": "./dist/designer.d.ts",
      "import": "./dist/designer.mjs",
      "require": "./dist/designer.js"
    },
    "./tools": {
      "types": "./dist/tools.d.ts",
      "import": "./dist/tools.mjs",
      "require": "./dist/tools.js"
    },
    "./package.json": "./package.json"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "sideEffects": false,
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/smartabp/smartabp.git",
    "directory": "src/SmartAbp.Vue/packages/lowcode"
  },
  "bugs": {
    "url": "https://github.com/smartabp/smartabp/issues"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "clean": "rm -rf dist",
    "prepublishOnly": "npm run type-check && npm run test && npm run build"
  },
  "dependencies": {
    "@smartabp/metadata-core": "workspace:*",
    "@smartabp/lowcode-shared": "workspace:*",
    "@smartabp/lowcode-api": "workspace:*",
    "@smartabp/lowcode-core": "workspace:*",
    "@smartabp/lowcode-designer": "workspace:*",
    "@smartabp/lowcode-tools": "workspace:*"
  },
  "peerDependencies": {
    "vue": "^3.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "tsup": "^8.0.0",
    "vitest": "^1.2.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 第三步：创建统一入口文件

#### `src/index.ts` - 主入口

```typescript
/**
 * @smartabp/lowcode - 企业级低代码平台统一入口
 * 
 * 包含所有核心模块的导出
 */

// ===== Metadata Core =====
export * from './metadata'

// ===== Lowcode Shared =====
export * from './shared'

// ===== Lowcode API =====
export * from './api'

// ===== Lowcode Core =====
export * from './core'

// ===== Lowcode Designer =====
export * from './designer'

// ===== Lowcode Tools =====
export * from './tools'

// ===== 版本信息 =====
export const VERSION = '1.0.0'
export const PACKAGE_NAME = '@smartabp/lowcode'
```

#### `src/metadata.ts` - Metadata子入口

```typescript
/**
 * Metadata Core 模块
 * 元数据Schema定义、验证和版本管理
 */

// 从内部包导出
export * from '@smartabp/metadata-core'

// 重新导出常用类型
export type {
  ModuleMetadata,
  EntityMetadata,
  FieldMetadata,
  ValidationResult
} from '@smartabp/metadata-core'
```

#### `src/shared.ts` - Shared子入口

```typescript
/**
 * Lowcode Shared 模块
 * 共享基础库、组件注册、验证管理
 */

export * from '@smartabp/lowcode-shared'

export type {
  ComponentMetadata,
  ComponentCategory,
  ValidationRule,
  ThemeConfig
} from '@smartabp/lowcode-shared'
```

#### `src/api.ts` - API子入口

```typescript
/**
 * Lowcode API 模块
 * HTTP客户端、代码生成器API
 */

export * from '@smartabp/lowcode-api'

export type {
  HttpClientConfig,
  ApiResponse,
  GenerationConfig,
  TemplateConfig
} from '@smartabp/lowcode-api'
```

#### `src/core.ts` - Core子入口

```typescript
/**
 * Lowcode Core 模块
 * 核心引擎、状态管理、生成器
 */

export * from '@smartabp/lowcode-core'

// 导出常用Stores
export {
  useEntityModelingStore,
  useEnhancedThemeStore,
  useEnhancedStateMachineStore,
  usePageDesignStore
} from '@smartabp/lowcode-core'

// 导出常用组件
export {
  SmartFormDesigner,
  BusinessRuleDesigner,
  ErrorBoundary
} from '@smartabp/lowcode-core'
```

#### `src/designer.ts` - Designer子入口

```typescript
/**
 * Lowcode Designer 模块
 * 可视化设计器、代码生成向导
 */

export * from '@smartabp/lowcode-designer'

// 导出核心设计器组件
export {
  VisualDesignCanvas,
  CodeGenerationWizard,
  PropertyInspector,
  ComponentPropertyPanel
} from '@smartabp/lowcode-designer'
```

#### `src/tools.ts` - Tools子入口

```typescript
/**
 * Lowcode Tools 模块
 * 开发工具、架构检查
 */

export * from '@smartabp/lowcode-tools'

export {
  ArchitectureChecker,
  DependencyAnalyzer
} from '@smartabp/lowcode-tools'
```

### 第四步：配置 tsup.config.ts

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    metadata: 'src/metadata.ts',
    shared: 'src/shared.ts',
    api: 'src/api.ts',
    core: 'src/core.ts',
    designer: 'src/designer.ts',
    tools: 'src/tools.ts'
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [
    'vue',
    'vue-router',
    'pinia',
    'element-plus',
    '@smartabp/metadata-core',
    '@smartabp/lowcode-shared',
    '@smartabp/lowcode-api',
    '@smartabp/lowcode-core',
    '@smartabp/lowcode-designer',
    '@smartabp/lowcode-tools'
  ]
})
```

### 第五步：创建统一 README.md

```markdown
# @smartabp/lowcode

> SmartAbp 企业级低代码平台 - 统一发布版

## 🚀 快速开始

### 安装

\`\`\`bash
npm install @smartabp/lowcode
# 或
pnpm add @smartabp/lowcode
# 或
yarn add @smartabp/lowcode
\`\`\`

### 基础使用

\`\`\`typescript
// 方式1: 从主入口导入（推荐）
import {
  // Metadata
  validateModuleMetadata,
  
  // Shared
  ComponentRegistry,
  
  // Core
  useEntityModelingStore,
  SmartFormDesigner,
  
  // Designer
  VisualDesignCanvas,
  CodeGenerationWizard,
  
  // API
  HttpClient,
  
  // Tools
  ArchitectureChecker
} from '@smartabp/lowcode'

// 方式2: 从子路径导入（支持tree-shaking）
import { ComponentRegistry } from '@smartabp/lowcode/shared'
import { useEntityModelingStore } from '@smartabp/lowcode/core'
import { VisualDesignCanvas } from '@smartabp/lowcode/designer'
\`\`\`

## 📦 包含模块

本包包含以下6个核心模块：

### 1. Metadata Core
元数据Schema定义、验证和版本管理

### 2. Lowcode Shared
共享基础库、组件注册、验证管理

### 3. Lowcode API
HTTP客户端、代码生成器API

### 4. Lowcode Core
核心引擎、状态管理、生成器

### 5. Lowcode Designer
可视化设计器、代码生成向导

### 6. Lowcode Tools
开发工具、架构检查

## 📖 完整文档

访问 [SmartAbp 文档中心](https://docs.smartabp.io)

## 📄 License

MIT License
\`\`\`

### 第六步：配置 tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../metadata-core" },
    { "path": "../lowcode-shared" },
    { "path": "../lowcode-api" },
    { "path": "../lowcode-core" },
    { "path": "../lowcode-designer" },
    { "path": "../lowcode-tools" }
  ]
}
```

---

## 🎯 发布流程

### 1. 构建所有子包

```bash
cd src/SmartAbp.Vue
npm run build:packages
```

### 2. 构建统一包

```bash
cd packages/lowcode
npm run build
```

### 3. 测试

```bash
npm run test
```

### 4. 发布到NPM

```bash
npm publish --access public
```

---

## 📊 包大小估算

| 模块 | 估算大小 | 说明 |
|------|---------|------|
| metadata-core | ~50KB | Schema验证 |
| lowcode-shared | ~200KB | 共享组件 |
| lowcode-api | ~100KB | API层 |
| lowcode-core | ~300KB | 核心引擎 |
| lowcode-designer | ~400KB | 设计器 |
| lowcode-tools | ~80KB | 工具集 |
| **总计** | **~1.1MB** | 经过tree-shaking后实际更小 |

---

## ✅ 优势总结

### 对用户

1. **一键安装**: 只需 `npm install @smartabp/lowcode`
2. **版本统一**: 无需担心版本兼容性问题
3. **使用简单**: 统一入口，文档清晰
4. **按需导入**: 支持子路径导入和tree-shaking

### 对开发团队

1. **维护简单**: 统一版本管理
2. **发布方便**: 一次发布，所有模块同步
3. **测试容易**: 统一测试流程
4. **文档集中**: 统一文档维护

### 技术优势

1. **符合Monorepo最佳实践**: 使用workspace管理内部依赖
2. **支持Tree-shaking**: 通过子路径导出，用户可按需引入
3. **TypeScript友好**: 完整的类型定义
4. **构建优化**: 使用tsup统一构建

---

## 🔄 迁移指南

### 从独立包迁移到统一包

**之前（独立包）**:
```typescript
import { ComponentRegistry } from '@smartabp/lowcode-shared'
import { useEntityModelingStore } from '@smartabp/lowcode-core'
import { VisualDesignCanvas } from '@smartabp/lowcode-designer'
```

**之后（统一包）**:
```typescript
// 方式1: 主入口（推荐新项目）
import { 
  ComponentRegistry,
  useEntityModelingStore,
  VisualDesignCanvas 
} from '@smartabp/lowcode'

// 方式2: 子路径（兼容旧项目）
import { ComponentRegistry } from '@smartabp/lowcode/shared'
import { useEntityModelingStore } from '@smartabp/lowcode/core'
import { VisualDesignCanvas } from '@smartabp/lowcode/designer'
```

---

## 🚦 推荐策略

### 短期（立即实施）

✅ **采用统一大包策略**
- 用户体验最好
- 维护成本最低
- 符合主流实践

### 长期（可选优化）

如果未来包体积成为问题（>5MB），可以考虑：
- 拆分为核心包 + 插件包
- 提供轻量版和完整版

---

## 📋 实施检查清单

- [ ] 创建 `packages/lowcode/` 目录
- [ ] 配置 `package.json`
- [ ] 创建所有入口文件（index.ts, metadata.ts等）
- [ ] 配置 `tsup.config.ts`
- [ ] 配置 `tsconfig.json`
- [ ] 编写 `README.md`
- [ ] 运行 `npm run build` 验证构建
- [ ] 运行 `npm run type-check` 验证类型
- [ ] 本地测试统一包导入
- [ ] 发布到NPM

---

## 🎊 结论

**强烈推荐采用统一大包发布策略！**

这是当前最适合SmartAbp的发布方案，既保持了模块化架构的优势，又提供了最佳的用户体验。

---

**方案制定人**: 首席架构师 AI Assistant  
**审核日期**: 2025-10-11  
**状态**: ✅ 可立即实施

