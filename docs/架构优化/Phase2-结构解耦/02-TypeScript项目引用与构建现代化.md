# SmartAbp 架构优化方案 - Phase 2: 结构性解耦与构建现代化

##  优化目标
- 实现源码与产物的彻底分离
- 建立现代化的构建体系
- 优化TypeScript项目结构
- 提升Tree Shaking效果

##  实施步骤 (1-2周)

### 1. TypeScript项目引用配置

#### 配置根目录 	sconfig.json
`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext", 
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/SmartAbp.Vue/src/*"],
      "@smartabp/*": ["src/SmartAbp.Vue/packages/*/src"]
    }
  },
  "files": [],
  "references": [
    {"path": "src/SmartAbp.Vue/packages/lowcode-core"},
    {"path": "src/SmartAbp.Vue/packages/lowcode-designer"},
    {"path": "src/SmartAbp.Vue/packages/lowcode-api"},
    {"path": "src/SmartAbp.Vue/packages/lowcode-tools"},
    {"path": "src/SmartAbp.Vue/packages/lowcode-ui-vue"}
  ]
}
`

#### 配置package级别的 	sconfig.json
`json
// packages/lowcode-core/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "declarationDir": "./dist/types",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "**/__tests__/**"]
}
`

### 2. Vite Library模式配置

#### 配置package构建
`javascript
// packages/lowcode-core/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LowCodeCore',
      fileName: (format) => lowcode-core.\.js
    },
    rollupOptions: {
      external: ['vue', '@vue/composition-api'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
`

#### 主应用引用构建产物
`javascript
// src/SmartAbp.Vue/vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  // 修改resolve.alias，引用构建产物而非源码
  resolve: {
    alias: {
      '@smartabp/lowcode-core': resolve(__dirname, 'packages/lowcode-core/dist'),
      '@smartabp/lowcode-designer': resolve(__dirname, 'packages/lowcode-designer/dist')
    }
  }
})
`

### 3. pnpm Workspace极致运用

#### 优化 pnpm-workspace.yaml
`yaml
packages:
  - 'src/SmartAbp.Vue/packages/*'
  - '!**/test/**'
  - '!**/dist/**' 
  - '!**/node_modules/**'
  - '!**/generated/**'
`

#### 创建分模块开发脚本
`json
// package.json scripts
{
  "scripts": {
    "dev:core": "pnpm --filter lowcode-core dev",
    "dev:designer": "pnpm --filter lowcode-designer dev",
    "dev:main": "pnpm --filter SmartAbp.Vue dev",
    "build:core": "pnpm --filter lowcode-core build",
    "build:all": "pnpm -r build"
  }
}
`

### 4. Tree Shaking验证与优化

#### 安装打包分析工具
`ash
pnpm add -D rollup-plugin-visualizer
`

#### 配置打包分析
`javascript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
})
`

#### 优化Barrel Exports
`	ypescript
// 避免全量导出，按需导出
// packages/lowcode-core/src/index.ts
export { default as ErrorBoundary } from './components/ErrorBoundary.vue'
export { useCodeGenerationProgress } from './composables/useCodeGenerationProgress'
export { useDragDrop } from './composables/useDragDrop'
// 明确导出，避免 import *
`

### 5. 开发者体验守护体系

#### 创建性能预算脚本
`javascript
// scripts/check-file-budget.js
const fs = require('fs')
const path = require('path')

const MAX_FILES_PER_PACKAGE = 500
const packages = ['lowcode-core', 'lowcode-designer', 'lowcode-api']

packages.forEach(pkg => {
  const dir = path.join(__dirname, '../src/SmartAbp.Vue/packages', pkg, 'src')
  const files = getAllFiles(dir)
  if (files.length > MAX_FILES_PER_PACKAGE) {
    console.error(  文件数量超标: /)
    process.exit(1)
  }
})

function getAllFiles(dir) {
  // 文件统计逻辑
}
`

#### 添加到CI/CD流水线
`yaml
# .github/workflows/ci.yml
jobs:
  check-budget:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: node scripts/check-file-budget.js
`

##  预期效果

- **构建性能**: 编译时间减少40-60%
- **内存使用**: 进一步降低20-30% 
- **开发体验**: 模块化开发，专注当前模块
- **代码质量**: 更好的Tree Shaking和类型检查

##  验证指标

1. 构建产物分析报告生成
2. 各package文件数量统计
3. Tree Shaking效果验证
4. 类型检查性能对比

##  注意事项

1. TypeScript项目引用需要仔细配置路径
2. Vite Library模式需要测试兼容性
3. Barrel Exports优化需要验证Tree Shaking
4. CI/CD流水线需要适配新的检查脚本

---

**下一阶段**: Phase 3 - 架构演进与未来规划
