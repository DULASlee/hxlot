# ts-morph技术调研大纲

**文档版本**: v1.0  
**创建日期**: 2025-10-17  
**目标阶段**: Phase 1.5 Day 2  
**调研时间**: 2小时  
**负责人**: 前端开发  

---

## 📋 调研目标

### 核心问题

```yaml
1. ts-morph是什么？有什么优势？
2. 如何安装和配置？
3. 核心API和使用方式有哪些？
4. AST操作的准确性如何？
5. 增量更新是否可行（保护手动代码）？
6. 性能表现如何？
7. Vue SFC支持如何？
8. 是否满足DevKit的需求？
```

---

## 🔍 调研清单

### 1. 基础调研（30分钟）

```yaml
☑️ 官方文档阅读:
  - 官网: https://ts-morph.com/
  - GitHub: https://github.com/dsherret/ts-morph
  - npm包: https://www.npmjs.com/package/ts-morph
  
☑️ 核心概念了解:
  - Project（项目）
  - SourceFile（源文件）
  - Node（AST节点）
  - SyntaxKind（语法类型）
  
☑️ 版本信息:
  - 最新版本号
  - TypeScript兼容性（TS 4.x/5.x）
  - 活跃度（最近更新时间、Star数）
```

### 2. 实践调研（60分钟）

```yaml
☑️ 安装和配置（10分钟）:
  ```bash
  npm install ts-morph
  ```
  
☑️ HelloWorld示例（10分钟）:
  ```typescript
  import { Project } from 'ts-morph'
  
  const project = new Project()
  const sourceFile = project.createSourceFile('test.ts', 'const a = 1')
  
  // 添加函数
  sourceFile.addFunction({
    name: 'hello',
    statements: 'console.log("Hello")'
  })
  
  console.log(sourceFile.getFullText())
  ```
  
☑️ Vue组件增量更新示例（20分钟）:
  - 解析Vue SFC的<script setup>
  - 添加新方法（保护已存在方法）
  - 添加新属性（保护已存在属性）
  - 合并导入语句
  - 验证手动代码100%保留
  
☑️ 复杂操作示例（20分钟）:
  - 查找特定函数
  - 修改函数参数
  - 添加类型注解
  - 重命名变量
```

### 3. 性能调研（20分钟）

```yaml
☑️ 性能测试:
  - 解析时间（100行文件）: <50ms
  - 修改时间（添加1个方法）: <10ms
  - 保存时间（写入文件）: <20ms
  
☑️ 增量更新性能:
  - 单个方法更新: <50ms ⭐ 关键指标
  - 10个方法批量更新: <200ms
  - 复杂组件（300行）更新: <150ms
  
☑️ 内存占用:
  - 小型文件（<100行）: <10MB
  - 大型文件（>1000行）: <50MB
```

### 4. 核心能力验证（20分钟）

```yaml
☑️ AST准确性:
  - 解析TypeScript: ✅
  - 解析JSX/TSX: ✅
  - 保留格式（缩进、空行）: ✅
  - 保留注释: ✅
  
☑️ 增量更新能力（⭐ 最关键）:
  - 检测已存在方法: ✅
  - 跳过已存在方法（不覆盖）: ✅
  - 保护手动代码: ✅
  - 合并导入（不重复）: ✅
  
☑️ Vue SFC支持:
  - 配合@vue/compiler-sfc: ✅
  - 解析<script setup>: ✅
  - 保留<template>和<style>: ✅
```

---

## 📊 调研报告模板

```markdown
# ts-morph技术调研报告

## 1. 技术概述
- 版本: [版本号]
- Star数: [数量]
- 最近更新: [日期]
- 评价: ⭐⭐⭐⭐⭐

## 2. 核心API
- Project: [说明]
- SourceFile: [说明]
- Node操作: [说明]
- 查询API: [说明]

## 3. 性能表现
- 解析时间: [数值]ms
- 修改时间: [数值]ms
- 增量更新: [数值]ms ⭐
- 结论: [优/良/中/差]

## 4. 增量更新验证（⭐ 最重要）
- 手动代码保护: [是/否]
- 测试场景:
  - 场景1: 添加方法时保护已存在方法 [✅/❌]
  - 场景2: 添加属性时保护已存在属性 [✅/❌]
  - 场景3: 合并导入时不重复 [✅/❌]
  - 场景4: 保留注释和格式 [✅/❌]
- 结论: [可用/不可用]

## 5. Vue SFC支持
- 解析<script setup>: [✅/❌]
- 保留<template>: [✅/❌]
- 保留<style>: [✅/❌]
- 结论: [完美/良好/有问题]

## 6. 优势
- ✅ [优势1]
- ✅ [优势2]
- ...

## 7. 劣势
- ❌ [劣势1]（如有）
- ❌ [劣势2]（如有）

## 8. 结论
- 是否推荐: [是/否]
- 推荐理由: [说明]
- 风险评估: [低/中/高]
- 增量更新可行性: [高/中/低] ⭐
```

---

## 🔬 关键验证代码示例

### 验证1: 增量更新（保护手动代码）

```typescript
// test-incremental-update.ts

import { Project } from 'ts-morph'
import { parse as parseSFC } from '@vue/compiler-sfc'

async function testIncrementalUpdate() {
  const vueContent = `
<template>
  <div>Test</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 手动编写的函数（应该被保留）⭐
function manualFunction() {
  console.log('This is manual code')
}

const count = ref(0)
</script>
`

  // 解析Vue SFC
  const { descriptor } = parseSFC(vueContent)
  const scriptContent = descriptor.scriptSetup?.content || ''

  // 使用ts-morph
  const project = new Project()
  const sourceFile = project.createSourceFile('temp.ts', scriptContent)

  // 尝试添加已存在的函数
  const existingFunc = sourceFile.getFunction('manualFunction')
  if (!existingFunc) {
    sourceFile.addFunction({
      name: 'manualFunction',
      statements: 'console.log("This should be ignored")'
    })
  } else {
    console.log('✅ 检测到已存在的函数，跳过（保护手动代码）')
  }

  // 添加新函数
  sourceFile.addFunction({
    name: 'newFunction',
    statements: 'console.log("New function")'
  })

  const result = sourceFile.getFullText()
  
  // ⭐ 关键验证：手动代码应该完全保留
  console.assert(
    result.includes('This is manual code'),
    '❌ 手动代码被破坏！'
  )
  console.assert(
    !result.includes('This should be ignored'),
    '❌ 已存在函数被覆盖！'
  )
  console.assert(
    result.includes('New function'),
    '❌ 新函数未添加！'
  )
  
  console.log('✅ 增量更新测试通过！')
}

testIncrementalUpdate()
```

### 验证2: 性能测试

```typescript
// test-performance.ts

import { Project } from 'ts-morph'

async function testPerformance() {
  const project = new Project()
  const sourceFile = project.createSourceFile(
    'test.ts',
    'const a = 1\nconst b = 2'
  )

  // 测试单个方法更新性能
  const start = performance.now()
  
  sourceFile.addFunction({
    name: 'testFunction',
    statements: 'console.log("test")'
  })
  
  const end = performance.now()
  const duration = end - start

  console.log(`更新时间: ${duration.toFixed(2)}ms`)
  
  // ⭐ 关键指标：应该<50ms
  console.assert(
    duration < 50,
    `❌ 性能不达标：${duration}ms > 50ms`
  )
  
  console.log('✅ 性能测试通过！')
}

testPerformance()
```

---

## ✅ 调研成功标准

```yaml
☑️ 完成所有调研清单
☑️ 生成调研报告（包含数据和结论）
☑️ 运行HelloWorld示例成功
☑️ 运行增量更新示例成功（⭐ 最关键）
☑️ 验证手动代码100%保留
☑️ 性能测试数据完整（<50ms）
☑️ Vue SFC支持验证通过
☑️ 明确结论（推荐/不推荐）
```

---

## 🎯 关键成功因素

```yaml
⭐⭐⭐ 增量更新能力（生死线）:
  - 必须能检测已存在的函数/变量
  - 必须能跳过已存在的代码（不覆盖）
  - 必须能保护手动编写的代码
  - 必须能保留注释和格式

如果增量更新不可行 → ts-morph不可用 → 考虑替代方案
```

---

**ts-morph技术调研大纲完成！** ✅

**Phase 1.5所有支持文档全部完成！** ✅✅✅

