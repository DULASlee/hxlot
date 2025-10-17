# PoC Demo 2: ts-morph增量更新设计文档

**文档版本**: v1.0  
**创建日期**: 2025-10-17  
**目标阶段**: Phase 1.5 Day 4  
**执行时间**: 4小时  
**负责人**: 前端开发  

---

## 📋 PoC目标

### 验证目标

```yaml
核心验证点:
  1. ✅ ts-morph能否正确解析Vue SFC和TypeScript
  2. ✅ 增量更新是否可行（不破坏手动代码）
  3. ✅ 性能是否满足要求（<50ms/方法）
  4. ✅ AST操作的准确性和稳定性

技术可行性验证:
  - ts-morph安装和配置无障碍
  - Vue SFC解析和修改无问题
  - 增量更新不破坏手动代码
  - 错误处理和调试友好

成功标准:
  - Vue组件成功增量更新
  - 手动代码100%保留
  - 性能<50ms/方法
  - TypeScript编译0错误
```

---

## 🎯 技术实现方案

### 实现步骤

#### 步骤1: 创建ts-morph增量更新器

```typescript
// PoC/TsMorph/VueComponentUpdater.ts

import { Project, SourceFile, SyntaxKind, Node } from 'ts-morph'
import { parse as parseSFC, SFCDescriptor } from '@vue/compiler-sfc'

/**
 * Vue组件增量更新器（ts-morph实现）
 * PoC Demo 2: 验证ts-morph的可行性和增量更新能力
 */
export class VueComponentUpdater {
  private project: Project

  constructor() {
    this.project = new Project({
      compilerOptions: {
        target: 99, // ESNext
        module: 99, // ESNext
        strict: true
      }
    })
  }

  /**
   * 增量更新Vue组件
   * @param filePath - Vue文件路径
   * @param updates - 更新配置
   * @returns 更新后的代码
   */
  async updateVueComponent(
    filePath: string,
    updates: ComponentUpdates
  ): Promise<string> {
    // 1. 解析Vue SFC
    const sfc = await this.parseSFC(filePath)
    
    // 2. 提取<script setup>内容
    const scriptContent = sfc.descriptor.scriptSetup?.content || ''
    
    // 3. 使用ts-morph解析TypeScript
    const sourceFile = this.project.createSourceFile(
      'temp.ts',
      scriptContent,
      { overwrite: true }
    )

    // 4. 执行增量更新
    if (updates.addMethods) {
      await this.addMethods(sourceFile, updates.addMethods)
    }

    if (updates.addProperties) {
      await this.addProperties(sourceFile, updates.addProperties)
    }

    if (updates.addImports) {
      await this.addImports(sourceFile, updates.addImports)
    }

    // 5. 获取更新后的脚本内容
    const updatedScript = sourceFile.getFullText()

    // 6. 重新组装SFC
    const updatedSFC = this.assembleSFC(sfc.descriptor, updatedScript)

    // 7. 清理
    this.project.removeSourceFile(sourceFile)

    return updatedSFC
  }

  /**
   * 添加方法（增量）
   */
  private async addMethods(
    sourceFile: SourceFile,
    methods: MethodDefinition[]
  ): Promise<void> {
    for (const method of methods) {
      // 检查方法是否已存在
      const existingMethod = sourceFile
        .getFunctions()
        .find(f => f.getName() === method.name)

      if (existingMethod) {
        // 方法已存在，跳过（保护手动代码）⭐
        console.log(`方法${method.name}已存在，跳过`)
        continue
      }

      // 添加新方法
      sourceFile.addFunction({
        name: method.name,
        parameters: method.parameters || [],
        returnType: method.returnType,
        isAsync: method.isAsync,
        statements: method.body
      })
    }
  }

  /**
   * 添加属性（增量）
   */
  private async addProperties(
    sourceFile: SourceFile,
    properties: PropertyDefinition[]
  ): Promise<void> {
    for (const prop of properties) {
      // 检查变量是否已存在
      const existingVar = sourceFile
        .getVariableDeclarations()
        .find(v => v.getName() === prop.name)

      if (existingVar) {
        // 变量已存在，跳过（保护手动代码）⭐
        console.log(`属性${prop.name}已存在，跳过`)
        continue
      }

      // 添加新变量声明
      sourceFile.addVariableStatement({
        declarationKind: 'const',
        declarations: [
          {
            name: prop.name,
            initializer: prop.initializer,
            type: prop.type
          }
        ]
      })
    }
  }

  /**
   * 添加导入（增量）
   */
  private async addImports(
    sourceFile: SourceFile,
    imports: ImportDefinition[]
  ): Promise<void> {
    for (const imp of imports) {
      // 检查导入是否已存在
      const existingImport = sourceFile
        .getImportDeclarations()
        .find(i => i.getModuleSpecifierValue() === imp.moduleSpecifier)

      if (existingImport) {
        // 导入已存在，合并named imports
        const existingNamed = new Set(
          existingImport
            .getNamedImports()
            .map(n => n.getName())
        )

        const newNamed = imp.namedImports.filter(
          n => !existingNamed.has(n)
        )

        if (newNamed.length > 0) {
          existingImport.addNamedImports(
            newNamed.map(n => ({ name: n }))
          )
        }
      } else {
        // 添加新导入
        sourceFile.addImportDeclaration({
          moduleSpecifier: imp.moduleSpecifier,
          namedImports: imp.namedImports.map(n => ({ name: n }))
        })
      }
    }
  }

  /**
   * 解析Vue SFC
   */
  private async parseSFC(filePath: string): Promise<SFCParseResult> {
    const fs = await import('fs/promises')
    const content = await fs.readFile(filePath, 'utf-8')
    const { descriptor, errors } = parseSFC(content)

    if (errors.length > 0) {
      throw new Error(
        `解析Vue SFC失败: ${errors.map(e => e.message).join(', ')}`
      )
    }

    return { descriptor, content }
  }

  /**
   * 重新组装SFC
   */
  private assembleSFC(
    descriptor: SFCDescriptor,
    updatedScript: string
  ): string {
    let result = ''

    // <template>
    if (descriptor.template) {
      result += `<template>\n${descriptor.template.content}\n</template>\n\n`
    }

    // <script setup>
    result += `<script setup lang="ts">\n${updatedScript}\n</script>\n\n`

    // <style>
    if (descriptor.styles && descriptor.styles.length > 0) {
      descriptor.styles.forEach(style => {
        const scoped = style.scoped ? ' scoped' : ''
        result += `<style${scoped}>\n${style.content}\n</style>\n`
      })
    }

    return result.trim()
  }
}

/**
 * 组件更新配置
 */
export interface ComponentUpdates {
  addMethods?: MethodDefinition[]
  addProperties?: PropertyDefinition[]
  addImports?: ImportDefinition[]
}

export interface MethodDefinition {
  name: string
  parameters?: { name: string; type?: string }[]
  returnType?: string
  isAsync?: boolean
  body: string
}

export interface PropertyDefinition {
  name: string
  type?: string
  initializer: string
}

export interface ImportDefinition {
  moduleSpecifier: string
  namedImports: string[]
}

interface SFCParseResult {
  descriptor: SFCDescriptor
  content: string
}
```

#### 步骤2: 创建测试用例

```typescript
// PoC/TsMorph/VueComponentUpdaterTests.spec.ts

import { describe, it, expect, beforeEach } from 'vitest'
import { VueComponentUpdater } from './VueComponentUpdater'
import fs from 'fs/promises'
import path from 'path'

describe('VueComponentUpdater', () => {
  let updater: VueComponentUpdater
  let testFilePath: string

  beforeEach(async () => {
    updater = new VueComponentUpdater()
    testFilePath = path.join(__dirname, 'test.vue')

    // 创建测试用的Vue组件
    const initialContent = `
<template>
  <div class="product-list">
    <h1>Product List</h1>
    <!-- 手动添加的HTML注释 -->
    <div v-for="product in products" :key="product.id">
      {{ product.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Product } from '@/types/product'

// 手动添加的注释
const products = ref<Product[]>([])

// 手动编写的函数（应该被保留）
function handleCustomAction() {
  console.log('This is a custom action added manually')
}
</script>

<style scoped>
.product-list {
  padding: 20px;
}
/* 手动添加的样式注释 */
</style>
`
    await fs.writeFile(testFilePath, initialContent, 'utf-8')
  })

  it('应该成功添加新方法', async () => {
    // Arrange
    const updates: ComponentUpdates = {
      addMethods: [
        {
          name: 'loadProducts',
          isAsync: true,
          returnType: 'Promise<void>',
          body: `
  const response = await fetch('/api/products')
  products.value = await response.json()
`
        }
      ]
    }

    // Act
    const result = await updater.updateVueComponent(testFilePath, updates)

    // Assert
    expect(result).toContain('async function loadProducts()')
    expect(result).toContain('const response = await fetch')
    
    // ⭐ 关键验证：手动代码应该被保留
    expect(result).toContain('function handleCustomAction()')
    expect(result).toContain('This is a custom action added manually')
  })

  it('应该保护已存在的手动代码', async () => {
    // Arrange
    const updates: ComponentUpdates = {
      addMethods: [
        {
          name: 'handleCustomAction', // 已存在的方法
          body: `console.log('This should be ignored')`
        }
      ]
    }

    // Act
    const result = await updater.updateVueComponent(testFilePath, updates)

    // Assert
    // ⭐ 关键验证：手动代码应该被100%保留
    expect(result).toContain('This is a custom action added manually')
    expect(result).not.toContain('This should be ignored')
  })

  it('应该增量添加导入', async () => {
    // Arrange
    const updates: ComponentUpdates = {
      addImports: [
        {
          moduleSpecifier: 'vue',
          namedImports: ['computed', 'watch'] // 新增导入
        },
        {
          moduleSpecifier: '@/api/product',
          namedImports: ['getProducts', 'deleteProduct']
        }
      ]
    }

    // Act
    const result = await updater.updateVueComponent(testFilePath, updates)

    // Assert
    // 验证新增导入
    expect(result).toContain("import { ref, computed, watch } from 'vue'")
    expect(result).toContain("import { getProducts, deleteProduct } from '@/api/product'")
    
    // ⭐ 验证原有导入被保留
    expect(result).toContain("import type { Product } from '@/types/product'")
  })

  it('性能测试：单个方法更新应该<50ms', async () => {
    // Arrange
    const updates: ComponentUpdates = {
      addMethods: [
        {
          name: 'newMethod',
          body: 'console.log("test")'
        }
      ]
    }

    // Act
    const start = performance.now()
    await updater.updateVueComponent(testFilePath, updates)
    const end = performance.now()
    const duration = end - start

    // Assert
    expect(duration).toBeLessThan(50) // <50ms
    console.log(`更新耗时: ${duration.toFixed(2)}ms`)
  })

  it('应该保留模板和样式', async () => {
    // Arrange
    const updates: ComponentUpdates = {
      addMethods: [
        {
          name: 'newMethod',
          body: 'console.log("test")'
        }
      ]
    }

    // Act
    const result = await updater.updateVueComponent(testFilePath, updates)

    // Assert
    // ⭐ 验证模板被完整保留
    expect(result).toContain('<template>')
    expect(result).toContain('Product List')
    expect(result).toContain('手动添加的HTML注释')
    expect(result).toContain('v-for="product in products"')
    
    // ⭐ 验证样式被完整保留
    expect(result).toContain('<style scoped>')
    expect(result).toContain('.product-list')
    expect(result).toContain('手动添加的样式注释')
  })

  it('应该正确处理复杂类型', async () => {
    // Arrange
    const updates: ComponentUpdates = {
      addProperties: [
        {
          name: 'pagination',
          type: 'Ref<PaginationConfig>',
          initializer: `ref<PaginationConfig>({ page: 1, pageSize: 10 })`
        }
      ],
      addMethods: [
        {
          name: 'handlePageChange',
          parameters: [{ name: 'page', type: 'number' }],
          returnType: 'void',
          body: 'pagination.value.page = page'
        }
      ]
    }

    // Act
    const result = await updater.updateVueComponent(testFilePath, updates)

    // Assert
    expect(result).toContain('const pagination: Ref<PaginationConfig>')
    expect(result).toContain('function handlePageChange(page: number): void')
  })

  afterEach(async () => {
    // 清理测试文件
    try {
      await fs.unlink(testFilePath)
    } catch (error) {
      // 忽略删除错误
    }
  })
})
```

---

## ✅ 验收标准

### 功能验收

```yaml
✅ 基础功能:
  - Vue SFC成功解析（模板+脚本+样式）
  - 方法成功增量添加
  - 属性成功增量添加
  - 导入成功增量合并
  
✅ 核心功能（最重要）⭐:
  - 手动代码100%保留（方法、注释、逻辑）
  - 已存在方法/属性不被覆盖
  - 模板和样式完整保留
  - 增量更新不破坏代码结构
```

### 性能验收

```yaml
✅ 性能指标:
  - 单个方法更新: <50ms ⭐
  - 10个方法批量更新: <200ms
  - 复杂组件（100+行）更新: <100ms
  - 内存占用稳定（无泄漏）
```

### 代码质量验收

```yaml
✅ 更新后的代码质量:
  - TypeScript编译通过（0错误）
  - ESLint检查通过（0警告）
  - 代码格式正确（缩进、空行）
  - 手动代码完全保留
  
✅ 更新器代码质量:
  - 单元测试覆盖率≥80%
  - 所有测试通过
  - 无代码警告
```

---

## 📊 预期输出示例

### 更新后的Vue组件

```vue
<template>
  <div class="product-list">
    <h1>Product List</h1>
    <!-- 手动添加的HTML注释 -->
    <div v-for="product in products" :key="product.id">
      {{ product.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Product } from '@/types/product'
import { getProducts, deleteProduct } from '@/api/product'

// 手动添加的注释
const products = ref<Product[]>([])

// ⭐ 手动编写的函数（完全保留）
function handleCustomAction() {
  console.log('This is a custom action added manually')
}

// ⭐ 新增的函数（ts-morph添加）
async function loadProducts(): Promise<void> {
  const response = await fetch('/api/products')
  products.value = await response.json()
}
</script>

<style scoped>
.product-list {
  padding: 20px;
}
/* 手动添加的样式注释 */
</style>
```

**关键点**:
- ✅ 手动函数`handleCustomAction`完全保留
- ✅ 新函数`loadProducts`成功添加
- ✅ 导入自动合并（ref + computed + watch）
- ✅ 模板和样式100%保留
- ✅ 所有注释都保留

---

## 🎯 PoC成功标准总结

```yaml
✅ PoC Demo 2验收清单:
  ☑️ ts-morph成功安装和配置
  ☑️ Vue SFC成功解析和修改
  ☑️ 增量更新功能正常工作
  ☑️ 手动代码100%保留（⭐ 最关键）
  ☑️ 性能测试通过（<50ms/方法）
  ☑️ 单元测试通过（≥80%覆盖率）
  ☑️ TypeScript编译0错误
  ☑️ 验证报告完成（功能验证、性能测试）
```

**核心价值**:
> **增量更新是DevKit的关键能力！**  
> **保护手动代码是生产环境的生死线！**

**下一步**: 编写PoC Demo 3（AIConstraintLayer）

---

**PoC Demo 2设计文档完成！** ✅

