<!--
  TypeScript类型支持示例
  
  展示微AI 2.0阶段2的核心功能：
  1. 自动类型生成
  2. VSCode智能提示
  3. TypeScript类型检查
  4. Vue模板类型支持
-->

<template>
  <div class="type-support-example">
    <h1>🎯 TypeScript类型支持示例</h1>
    
    <!-- 示例1：基础类型支持 -->
    <section class="example-section">
      <h2>示例1：基础类型支持</h2>
      <p>Components对象有完整的TypeScript类型定义</p>
      
      <div class="code-demo">
        <pre><code>{{ example1Code }}</code></pre>
      </div>
      
      <div class="component-demo">
        <!-- ✅ TypeScript知道BaseButton的类型 -->
        <component v-if="BaseButton" :is="BaseButton">
          类型安全的按钮
        </component>
      </div>
    </section>

    <!-- 示例2：智能提示 -->
    <section class="example-section">
      <h2>示例2：VSCode智能提示</h2>
      <p>输入 Components. 会自动显示所有可用组件</p>
      
      <div class="intellisense-demo">
        <img src="/images/intellisense-demo.png" alt="智能提示演示" />
        <p class="caption">VSCode会自动提示所有注册的组件</p>
      </div>
      
      <div class="code-demo">
        <pre><code>{{ example2Code }}</code></pre>
      </div>
    </section>

    <!-- 示例3：类型检查 -->
    <section class="example-section">
      <h2>示例3：TypeScript类型检查</h2>
      <p>访问不存在的组件会报TypeScript错误</p>
      
      <div class="type-check-demo">
        <div class="check-item">
          <span class="status success">✅</span>
          <code>const button = Components.BaseButton</code>
          <span class="result">类型: Component</span>
        </div>
        
        <div class="check-item">
          <span class="status error">❌</span>
          <code>const invalid = Components.NonExistent</code>
          <span class="result">TS错误: 属性不存在</span>
        </div>
      </div>
      
      <div class="code-demo">
        <pre><code>{{ example3Code }}</code></pre>
      </div>
    </section>

    <!-- 示例4：动态组件类型 -->
    <section class="example-section">
      <h2>示例4：动态组件类型推导</h2>
      <p>TypeScript能正确推导动态组件的类型</p>
      
      <div class="component-selector">
        <select v-model="selectedComponent">
          <option value="BaseButton">BaseButton</option>
          <option value="BaseInput">BaseInput</option>
          <option value="BaseSelect">BaseSelect</option>
        </select>
      </div>
      
      <div class="component-demo">
        <!-- TypeScript知道DynamicComp的类型 -->
        <component v-if="DynamicComp" :is="DynamicComp" />
      </div>
      
      <div class="code-demo">
        <pre><code>{{ example4Code }}</code></pre>
      </div>
    </section>

    <!-- 示例5：Vue模板支持 -->
    <section class="example-section">
      <h2>示例5：Vue模板全局组件</h2>
      <p>Vue模板中可以直接使用组件名（无需import）</p>
      
      <div class="template-demo">
        <pre><code>{{ example5Template }}</code></pre>
      </div>
      
      <div class="component-demo">
        <!-- 直接使用（已通过declare module增强） -->
        <!-- 注意：需要组件实际注册到全局才能用 -->
        <p class="note">
          💡 提示：通过 declare module '@vue/runtime-core' 
          可以让Vue模板识别组件
        </p>
      </div>
    </section>

    <!-- 示例6：类型生成器API -->
    <section class="example-section">
      <h2>示例6：手动触发类型生成</h2>
      <p>可以通过API手动触发类型生成</p>
      
      <div class="api-demo">
        <button @click="generateTypes" :disabled="isGenerating">
          {{ isGenerating ? '生成中...' : '手动生成类型' }}
        </button>
        
        <div v-if="generationResult" class="result-display">
          <h4>生成结果：</h4>
          <ul>
            <li>组件数量: {{ generationResult.componentCount }}</li>
            <li>输出路径: {{ generationResult.outputPath }}</li>
            <li>生成时间: {{ generationResult.generatedAt.toLocaleString() }}</li>
            <li>文件大小: {{ (generationResult.content.length / 1024).toFixed(2) }} KB</li>
          </ul>
        </div>
      </div>
      
      <div class="code-demo">
        <pre><code>{{ example6Code }}</code></pre>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Components } from '@smartabp/lowcode-shared'
import { 
  generateTypes, 
  globalComponentRegistry,
  type GeneratedTypeDefinition
} from '@smartabp/lowcode-shared'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例1：基础类型支持
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BaseButton = Components.BaseButton
// TypeScript知道：BaseButton的类型是 Component

const example1Code = `import { Components } from '@smartabp/lowcode-shared'

// ✅ TypeScript自动推导类型
const BaseButton = Components.BaseButton
//    ^
//    类型: Component

// ✅ 类型检查
const button: Component = Components.BaseButton  // 正确`

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例2：智能提示
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const example2Code = `import { Components } from '@smartabp/lowcode-shared'

// 输入 Components. 会显示：
// - BaseButton
// - BaseInput
// - BaseSelect
// - BaseForm
// - BaseTable
// ... 所有注册的组件

const form = Components.SmartF...
//                      ↑
//               自动补全: SmartForm`

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例3：类型检查
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const example3Code = `import { Components } from '@smartabp/lowcode-shared'

// ✅ 正确：组件存在
const button = Components.BaseButton

// ❌ 错误：组件不存在
const invalid = Components.NonExistent
//              ~~~~~~~~~~
// TypeScript错误: 属性 'NonExistent' 不存在于类型 'GlobalComponents' 上

// ✅ 正确：类型守卫
const name = 'BaseButton'
if (name in Components) {
  const comp = Components[name]
}`

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例4：动态组件类型推导
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const selectedComponent = ref('BaseButton')

const DynamicComp = computed(() => {
  return Components[selectedComponent.value]
})
// TypeScript知道：DynamicComp的类型是 Component | undefined

const example4Code = `const componentName = ref('BaseButton')

const DynamicComponent = computed(() => {
  return Components[componentName.value]
})
//     ^
//     类型: ComputedRef<Component | undefined>

<template>
  <component :is="DynamicComponent" />
</template>`

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例5：Vue模板支持
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const example5Template = `<template>
  <!-- ✅ 直接使用组件名，有智能提示 -->
  <BaseButton>按钮</BaseButton>
  <BaseInput v-model="value" />
  <BaseSelect :options="options" />
</template>

<script setup lang="ts">
// 无需import，类型声明已全局注册
// 通过 declare module '@vue/runtime-core' 实现
</script>`

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 示例6：类型生成器API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const isGenerating = ref(false)
const generationResult = ref<GeneratedTypeDefinition | null>(null)

const generateTypes = async () => {
  isGenerating.value = true
  generationResult.value = null
  
  try {
    const result = await generateTypes(
      globalComponentRegistry,
      'types/components.d.ts'
    )
    
    generationResult.value = result
    
    alert(`类型生成成功！\n组件数: ${result.componentCount}`)
  } catch (error) {
    console.error('类型生成失败:', error)
    alert('类型生成失败，请查看控制台')
  } finally {
    isGenerating.value = false
  }
}

const example6Code = `import { generateTypes, globalComponentRegistry } from '@smartabp/lowcode-shared'

// 手动生成类型
const result = await generateTypes(
  globalComponentRegistry,
  'types/components.d.ts'
)

console.log('组件数量:', result.componentCount)
console.log('输出路径:', result.outputPath)

// 或使用TypeDefinitionGenerator
import { TypeDefinitionGenerator } from '@smartabp/lowcode-shared'

const generator = new TypeDefinitionGenerator(globalComponentRegistry, {
  outputPath: 'types/components.d.ts',
  includeComments: true,
  includeExamples: true
})

const result = await generator.generateFile()`
</script>

<style scoped>
.type-support-example {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.example-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.example-section h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #34495e;
}

.example-section p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
}

.code-demo {
  margin: 1rem 0;
}

.code-demo pre {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
}

.component-demo {
  padding: 1.5rem;
  background: white;
  border-radius: 4px;
  margin: 1rem 0;
}

.type-check-demo {
  background: white;
  padding: 1.5rem;
  border-radius: 4px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.status {
  font-size: 1.25rem;
}

.status.success {
  color: #27ae60;
}

.status.error {
  color: #e74c3c;
}

.check-item code {
  flex: 1;
  background: #2c3e50;
  color: #ecf0f1;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.result {
  color: #7f8c8d;
  font-size: 0.875rem;
}

.component-selector select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.intellisense-demo {
  background: white;
  padding: 1.5rem;
  border-radius: 4px;
  text-align: center;
}

.intellisense-demo img {
  max-width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.caption {
  margin-top: 0.5rem;
  color: #7f8c8d;
  font-size: 0.875rem;
}

.template-demo pre {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
}

.note {
  background: #e3f2fd;
  color: #1976d2;
  padding: 1rem;
  border-left: 4px solid #1976d2;
  border-radius: 4px;
}

.api-demo {
  background: white;
  padding: 1.5rem;
  border-radius: 4px;
}

.api-demo button {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.api-demo button:hover:not(:disabled) {
  background: #2980b9;
}

.api-demo button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result-display {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.result-display h4 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.result-display ul {
  list-style: none;
  padding: 0;
}

.result-display li {
  padding: 0.25rem 0;
  color: #7f8c8d;
}
</style>

