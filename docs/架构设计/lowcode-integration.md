# 低代码引擎集成指南

## 📦 package.json 更新

在现有的 package.json 中添加以下内容：

### 新增脚本

```json
{
  "scripts": {
    // 现有脚本...
    "lowcode:example": "tsx src/lowcode/examples/basic-usage.ts",
    "lowcode:dev": "vite --mode lowcode",
    "lowcode:build": "tsc --project tsconfig.lowcode.json"
  }
}
```

### 新增依赖（可选，用于高级功能）

```json
{
  "dependencies": {
    // 现有依赖...
    "events": "^3.3.0"
  },
  "devDependencies": {
    // 现有依赖...
    "tsx": "^4.6.0"
  }
}
```

## 🔧 TypeScript 配置

创建 `tsconfig.lowcode.json`：

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist/lowcode",
    "rootDir": "./src/lowcode",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/lowcode/**/*"],
  "exclude": ["src/lowcode/**/*.test.ts", "src/lowcode/examples/**/*"]
}
```

## 🚀 集成到现有 Vue 项目

### 1. 在 main.ts 中初始化（可选）

```typescript
// src/SmartAbp.Vue/src/main.ts
import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import { createPinia } from "pinia"

// 引入低代码引擎（仅在需要时）
// import { LowCodeKernel } from './lowcode'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 全局注册低代码引擎（可选）
// app.provide('lowcodeKernel', new LowCodeKernel())

app.mount("#app")
```

### 2. 在组件中使用

```vue
<!-- src/SmartAbp.Vue/src/views/lowcode/CodeGenerator.vue -->
<template>
  <div class="code-generator">
    <h1>代码生成器</h1>
    <el-button @click="generateCode">生成Vue组件</el-button>
    <el-card v-if="generatedCode">
      <pre><code>{{ generatedCode }}</code></pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { LowCodeKernel } from "@/lowcode"
import { Vue3Plugin } from "@/lowcode/plugins/vue3"

const generatedCode = ref("")

const generateCode = async () => {
  const kernel = new LowCodeKernel()
  await kernel.initialize()
  await kernel.registerPlugin(new Vue3Plugin())

  const result = await kernel.generate({
    id: "sample-component",
    version: "1.0.0",
    type: "component",
    metadata: { name: "SampleComponent" },
    template: {
      type: "template",
      content: {
        tag: "div",
        props: { class: "sample" },
        children: ["Hello from LowCode!"],
      },
    },
  })

  if (result.success) {
    generatedCode.value = result.result?.code || ""
  }
}
</script>
```

### 3. 路由配置

```typescript
// src/SmartAbp.Vue/src/router/index.ts
import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 现有路由...
    {
      path: "/lowcode",
      name: "LowCode",
      component: () => import("@/views/lowcode/CodeGenerator.vue"),
      meta: {
        title: "低代码生成器",
        requiresAuth: true,
      },
    },
  ],
})

export default router
```

## 🔨 Vite 配置更新

在 `vite.config.ts` 中添加路径别名：

```typescript
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { resolve } from "path"

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@lowcode": resolve(__dirname, "src/lowcode"),
    },
  },
})
```

## 📝 导入路径示例

在项目中使用时的导入路径：

```typescript
// 导入核心内核
import { LowCodeKernel } from "@/lowcode"
import { LowCodeKernel } from "@/lowcode/kernel"

// 导入插件
import { Vue3Plugin } from "@/lowcode/plugins/vue3"

// 导入类型
import type { Schema, GeneratedCode } from "@/lowcode/kernel/types"
```

## 🧪 测试集成

创建测试文件验证集成：

```typescript
// src/SmartAbp.Vue/src/lowcode/examples/integration-test.ts
import { LowCodeKernel } from "../kernel"
import { Vue3Plugin } from "../plugins/vue3"

export async function testIntegration() {
  console.log("🚀 开始集成测试...")

  const kernel = new LowCodeKernel()
  await kernel.initialize()
  await kernel.registerPlugin(new Vue3Plugin())

  const health = kernel.getHealthInfo()
  console.log("内核健康状态：", health)

  console.log("✅ 集成测试完成！")

  await kernel.shutdown()
}

// 可在开发环境中运行
if (import.meta.env.DEV) {
  testIntegration().catch(console.error)
}
```

## 📋 迁移检查清单

- [ ] 创建 `src/lowcode/` 目录结构
- [ ] 迁移所有核心文件到 `src/lowcode/kernel/`
- [ ] 迁移插件文件到 `src/lowcode/plugins/`
- [ ] 更新所有文件中的import路径
- [ ] 添加 TypeScript 配置文件
- [ ] 更新 Vite 配置中的路径别名
- [ ] 测试基础功能是否正常
- [ ] 创建示例页面验证集成

## 🎯 集成后的优势

1. **无缝集成**：与现有Vue项目完美融合
2. **类型安全**：完整的TypeScript支持
3. **开发体验**：热重载、调试支持
4. **生产就绪**：企业级架构和性能
5. **可扩展**：插件化架构，易于扩展新功能

迁移完成后，您就可以在SmartAbp.Vue项目中使用强大的低代码生成功能了！
