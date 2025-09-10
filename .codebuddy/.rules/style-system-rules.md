# 🎨 样式系统强制规则

## 设计系统强制使用
- 统一使用 CSS 变量（--theme-*, --spacing-*, --radius-*）
- 禁止硬编码颜色/间距/圆角/阴影等

## 样式目录结构
```
src/SmartAbp.Vue/src/styles/
├── design-system/
│   ├── tokens/ (colors.css/spacing.css/typography.css)
│   ├── themes/ (theme-base.css/theme-aliases.css)
│   └── index.css
├── base/
├── layouts/
├── components/
└── main.css
```

## 组件样式（BEM + scoped）
- 类名示例：.user-management、.user-management__header
- 禁止通用类名和魔法数字；限制嵌套层级

## 响应式与性能
- 使用预定义断点（sm/md/lg）；移动端优先
- 避免全局覆盖 UI 库；避免内联样式与 !important 滥用