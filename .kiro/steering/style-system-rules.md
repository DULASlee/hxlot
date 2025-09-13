---
inclusion: always
---

# 🎨 SmartAbp样式系统强制规则

## 🚨 样式系统铁律

### 1. 设计系统强制使用
**🔴 必须使用统一设计系统：**

```css
/* ✅ 强制使用：设计系统变量 */
.user-card {
  background: var(--theme-bg-component);
  border: 1px solid var(--theme-border-base);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  color: var(--theme-text-primary);
  font-size: var(--font-size-base);
  box-shadow: var(--shadow-sm);
}

/* ❌ 严禁使用：硬编码样式值 */
.user-card {
  background: #ffffff;      /* ❌ 禁止硬编码颜色 */
  border: 1px solid #e5e7eb; /* ❌ 禁止硬编码边框 */
  padding: 16px;            /* ❌ 禁止硬编码间距 */
  border-radius: 6px;       /* ❌ 禁止硬编码圆角 */
  color: #111827;           /* ❌ 禁止硬编码文字颜色 */
}
```

### 2. 主题系统约束
**🔴 只允许使用预定义主题：**

```typescript
///* ✅ 允许的主题类型 (基于Element Plus 2.8.8)
type ThemeType = 'tech-blue' | 'deep-green' | 'light-purple' | 'dark'

// ✅ 正确的主题切换 (基于项目路径别名配置)
import { useDesignSystem } from '@/composables/useDesignSystem'
const { setTheme } = useDesignSystem()
setTheme('tech-blue')  // 使用预定义主题

// ❌ 严禁：自定义主题变量
document.documentElement.style.setProperty('--custom-color', '#ff0000')  // ❌ 禁止
```

## 📁 样式文件结构强制规范

### 统一的样式目录结构
```
src/SmartAbp.Vue/src/styles/
├── design-system/              # ✅ 统一设计系统（唯一主题系统）
│   ├── tokens/                # ✅ 设计令牌
│   │   ├── colors.css         # 颜色变量
│   │   ├── spacing.css        # 间距变量
│   │   ├── typography.css     # 字体变量
│   │   └── index.css          # 令牌入口
│   ├── themes/                # ✅ 主题变量
│   │   ├── theme-base.css     # 基础主题
│   │   ├── theme-aliases.css  # 主题别名
│   │   └── index.css          # 主题入口
│   ├── components/            # ✅ 组件样式
│   └── index.css              # ✅ 设计系统入口
├── base/                      # ✅ 基础样式
│   ├── reset.css              # CSS重置
│   └── variables.css          # 基础变量
├── layouts/                   # ✅ 布局样式
│   ├── responsive.css         # 响应式布局
│   └── admin.css              # 管理后台布局
├── components/                # ✅ 页面级组件样式
└── main.css                   # ✅ 主样式入口
```

### 严禁的样式目录结构
```
src/SmartAbp.Vue/src/styles/
├── themes.css                 # ❌ 严禁：冗余主题文件
├── enterprise-theme.css       # ❌ 严禁：独立企业主题
├── simple-themes.css          # ❌ 严禁：简单主题系统
├── layout/                    # ❌ 严禁：重复的布局目录
└── custom-styles/             # ❌ 严禁：自定义样式目录
```

## 🎯 CSS变量使用规范

### 设计令牌层级
```css
/* ✅ 第一层：基础设计令牌 */
:root {
  /* 颜色令牌 */
  --color-primary-500: #0ea5e9;
  --color-gray-100: #f3f4f6;
  
  /* 间距令牌 */
  --spacing-1: 0.25rem;
  --spacing-4: 1rem;
  
  /* 字体令牌 */
  --font-size-base: 1rem;
  --font-weight-medium: 500;
}
```css
/* ✅ 第二层：主题语义变量 (基于Element Plus 2.8.8主题系统) */
.theme-tech-blue {
  --theme-brand-primary: var(--color-primary-500);
  --theme-bg-component: var(--color-gray-100);
  --theme-text-primary: var(--color-gray-900);
  --el-color-primary: var(--color-primary-500);  /* Element Plus主题变量 */
}

/* ✅ 第三层：组件使用 */
.button-primary {
  background: var(--theme-brand-primary);
  color: var(--theme-text-inverse);
  padding: var(--spacing-2) var(--spacing-4);
}
```

### 禁止的CSS变量用法
```css
/* ❌ 严禁：跳过设计系统直接定义 */
.custom-component {
  --my-custom-color: #ff0000;     /* ❌ 禁止自定义变量 */
  background: var(--my-custom-color);
}

/* ❌ 严禁：使用已废弃的变量 */
.old-component {
  background: var(--color-bgPrimary);  /* ❌ 旧格式变量已禁用 */
  color: var(--color-textPrimary);     /* ❌ 旧格式变量已禁用 */
}
```

## 🖌️ 组件样式规范

### Vue组件样式约束
```vue
<template>
  <div class="user-management">
    <header class="user-management__header">
      <h1 class="user-management__title">用户管理</h1>
    </header>
    <main class="user-management__content">
      <!-- 内容 -->
    </main>
  </div>
</template>

<style scoped>
/* ✅ 强制使用：BEM命名规范 + 设计系统变量 */
.user-management {
  padding: var(--spacing-6);
  background: var(--theme-bg-component);
  border-radius: var(--radius-lg);
}

.user-management__header {
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--theme-border-base);
}

.user-management__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--theme-text-primary);
  margin: 0;
}

.user-management__content {
  /* 内容样式 */
}

/* ❌ 严禁：混乱的命名 + 硬编码值 */
.userMgmt {                          /* ❌ 驼峰命名 */
  padding: 24px;                     /* ❌ 硬编码间距 */
  background: #fff;                  /* ❌ 硬编码颜色 */
}

.header {                            /* ❌ 通用类名 */
  color: #333;                       /* ❌ 硬编码颜色 */
}
</style>
```

### 全局样式约束
```css
/* ✅ 允许的全局样式：工具类 */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }

.text-primary { color: var(--theme-text-primary); }
.text-secondary { color: var(--theme-text-secondary); }
.bg-component { background: var(--theme-bg-component); }

/* ❌ 严禁：全局样式覆盖组件 */
.el-button {                         /* ❌ 禁止全局覆盖UI库 */
  background: #custom !important;
}

div {                                /* ❌ 禁止标签选择器全局样式 */
  box-sizing: border-box;
}
```

## 📱 响应式设计强制要求

### 断点系统约束
```css
/* ✅ 强制使用：设计系统预定义断点 */
@media (min-width: 640px) {          /* sm */
  .user-card {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {          /* md */
  .user-card {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {         /* lg */
  .user-card {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* ❌ 严禁：自定义断点 */
@media (min-width: 750px) {          /* ❌ 非标准断点 */
  .custom-layout {
    /* 自定义布局 */
  }
}
```

### 移动端优先约束
```css
/* ✅ 强制使用：移动端优先设计 */
.navigation {
  /* 移动端基础样式 */
  display: flex;
  flex-direction: column;
  padding: var(--spacing-2);
}

@media (min-width: 768px) {
  .navigation {
    /* 桌面端增强样式 */
    flex-direction: row;
    padding: var(--spacing-4);
  }
}

/* ❌ 严禁：桌面端优先设计 */
.navigation {
  /* ❌ 桌面端样式作为基础 */
  display: flex;
  flex-direction: row;
  padding: var(--spacing-4);
}

@media (max-width: 767px) {
  .navigation {
    /* ❌ 移动端样式作为特例 */
    flex-direction: column;
    padding: var(--spacing-2);
  }
}
```

## 🚫 样式系统禁令

### 绝对禁止的样式用法
```css
/* ❌ 严禁：内联样式 */
<div style="color: red; margin: 10px;">  <!-- 严禁 -->

/* ❌ 严禁：!important 滥用 */
.override {
  color: red !important;              /* ❌ 除非绝对必要 */
}

/* ❌ 严禁：魔法数字 */
.spacing {
  margin: 13px;                       /* ❌ 使用 var(--spacing-3) */
  padding: 27px;                      /* ❌ 使用设计令牌 */
}

/* ❌ 严禁：浏览器前缀手写 */
.animation {
  -webkit-transform: scale(1.1);      /* ❌ 使用autoprefixer */
  -moz-transform: scale(1.1);
  transform: scale(1.1);
}
```

### 样式组织禁令
```css
/* ❌ 严禁：样式文件巨型化 */
/* single-file.css 超过500行 = 必须拆分 */

/* ❌ 严禁：样式嵌套过深 */
.component {
  .header {
    .title {
      .icon {
        .svg {                        /* ❌ 嵌套超过3层 */
          /* 样式 */
        }
      }
    }
  }
}
```

## 🔍 样式质量检查

### 自动样式检查
```bash
# 强制执行的样式检查
1. npm run stylelint              # CSS代码规范 (基于项目package.json)
2. postcss --config postcss.config   # CSS处理和优化
3. 设计系统变量使用率检查            # 确保使用率>95%
4. 硬编码值检测                      # 检测并禁止硬编码
5. 样式重复度检查                    # 重复样式<5%
```

### 性能要求
```css
/* ✅ 必须满足的样式性能指标 */
/* CSS文件大小: <200KB (压缩后) */
/* 首次绘制时间: <1.5s */
/* 样式计算时间: <10ms */
/* 重排重绘次数: 最小化 */

/* ✅ 强制使用：性能优化技术 */
.animated-element {
  /* 使用transform代替position变化 */
  transform: translateX(100px);       /* ✅ GPU加速 */
  /* transform: translate3d(100px, 0, 0); */
}

.avoid-layout-thrashing {
  /* 避免引起重排的属性变化 */
  /* width: 200px; */                 /* ❌ 引起重排 */
  transform: scaleX(1.2);             /* ✅ 不引起重排 */
}
```

---

**🎨 统一的设计系统是用户体验和开发效率的基石，样式混乱是产品灾难的开始！**