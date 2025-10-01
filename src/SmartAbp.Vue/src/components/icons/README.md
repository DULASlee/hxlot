# 🎨 SmartAbp 图标系统使用指南

## 📋 概述

SmartAbp 提供了多种图标使用方式，支持 Carbon、Material Design、Element Plus 和 FontAwesome 图标库。

## 🚀 快速开始

### 1. 使用 unplugin-icons（推荐）

```vue
<template>
  <!-- Carbon 图标 -->
  <IconCarbonUser />
  <IconCarbonDashboard />
  <IconCarbonSettings />
  
  <!-- Material Design 图标 -->
  <IconMdiAccount />
  <IconMdiViewDashboard />
  <IconMdiCog />
  
  <!-- Element Plus 图标 -->
  <IconEpUser />
  <IconEpSetting />
  <IconEpDocument />
</template>

<script setup>
// 图标会自动导入，无需手动 import
</script>
```

### 2. 使用企业级图标系统

```vue
<template>
  <EnterpriseIconSystem 
    name="dashboard" 
    size="lg" 
    color="primary"
    clickable
    @click="handleClick"
  />
</template>

<script setup>
import EnterpriseIconSystem from '@/components/icons/EnterpriseIconSystem.vue'

const handleClick = () => {
  console.log('图标被点击')
}
</script>
```

### 3. 使用图标风格管理

```vue
<template>
  <div>
    <!-- 当前风格: {{ iconStyleStore.styleConfig.name }} -->
    <i :class="iconStyleStore.getIcon('dashboard')"></i>
    <i :class="iconStyleStore.getIcon('user')"></i>
  </div>
</template>

<script setup>
import { useIconStyleStore } from '@/stores/modules/iconStyle'

const iconStyleStore = useIconStyleStore()

// 切换图标风格
const switchToCarbon = () => {
  iconStyleStore.setIconStyle('carbon')
}
</script>
```

## 🎯 图标命名规则

### Carbon 图标
- 前缀：`IconCarbon`
- 格式：`IconCarbon + PascalCase图标名`
- 示例：
  - `user` → `IconCarbonUser`
  - `dashboard` → `IconCarbonDashboard`
  - `user-multiple` → `IconCarbonUserMultiple`

### Material Design 图标
- 前缀：`IconMdi`
- 格式：`IconMdi + PascalCase图标名`
- 示例：
  - `account` → `IconMdiAccount`
  - `view-dashboard` → `IconMdiViewDashboard`
  - `code-tags` → `IconMdiCodeTags`

### Element Plus 图标
- 前缀：`IconEp`
- 格式：`IconEp + PascalCase图标名`
- 示例：
  - `user` → `IconEpUser`
  - `setting` → `IconEpSetting`
  - `document` → `IconEpDocument`

## 🔧 配置说明

### Vite 配置

```typescript
// vite.config.ts
Icons({
  autoInstall: true,
  compiler: "vue3",
  collections: {
    carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
    mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
    ep: () => import('@iconify-json/ep/icons.json').then(i => i.default),
  },
})

Components({
  resolvers: [
    IconsResolver({
      prefix: 'Icon',
      enabledCollections: ['ep', 'carbon', 'mdi', 'fa'],
    }),
  ],
})
```

### 依赖包

```json
{
  "dependencies": {
    "@iconify/vue": "^5.0.0"
  },
  "devDependencies": {
    "@iconify-json/carbon": "^1.2.13",
    "@iconify-json/mdi": "^1.2.3",
    "@iconify-json/ep": "^1.2.3",
    "unplugin-icons": "^22.2.0"
  }
}
```

## 🎨 图标风格

支持的图标风格：

1. **FontAwesome** - 经典专业的企业级图标库（推荐）
2. **Element Plus** - Element UI 配套企业级图标
3. **Carbon** - IBM 企业级设计图标
4. **Material Design** - Google Material Design 企业级图标

## 🧪 测试页面

访问 `/Test/icons` 查看图标系统测试页面，可以：

- 查看所有图标的显示效果
- 测试图标风格切换
- 运行图标系统诊断
- 导出测试报告

## ❓ 常见问题

### Q: 为什么 Carbon 或 Material 图标不显示？

A: 请检查：
1. 依赖包是否正确安装：`@iconify-json/carbon` 和 `@iconify-json/mdi`
2. Vite 配置是否正确
3. 图标名称是否正确（使用 PascalCase）
4. 访问测试页面进行诊断

### Q: 如何添加新的图标？

A: 有两种方式：
1. 使用 unplugin-icons：直接使用 `IconCarbonXxx` 或 `IconMdiXxx` 格式
2. 在企业级图标系统中添加映射：修改 `iconStyle.ts` 中的 `ICON_MAPPINGS`

### Q: 如何自定义图标风格？

A: 修改 `iconStyle.ts` 中的配置，或使用 `iconStyleStore.setIconStyle()` 方法。

## 📚 参考资源

- [Carbon Design System Icons](https://carbondesignsystem.com/guidelines/icons/library/)
- [Material Design Icons](https://materialdesignicons.com/)
- [Element Plus Icons](https://element-plus.org/zh-CN/component/icon.html)
- [unplugin-icons 文档](https://github.com/antfu/unplugin-icons)