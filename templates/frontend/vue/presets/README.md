# 🎨 Vue管理页面模板预设

**版本**: v1.0
**更新日期**: 2025-10-25
**作者**: SmartAbp DevKit团队

---

## 📋 模板清单

### 1️⃣ Standard（标准企业级）✅

**文件**: `standard/VueManagement.template.hbs`

**适用场景**:
- 中小型企业应用
- 常规CRUD管理页面
- 标准数据管理需求

**核心特性**:
```yaml
UI设计:
  ✅ SmartComponents封装
  ✅ 设计令牌（Design Tokens）
  ✅ 响应式布局（移动端适配）

功能模块:
  ✅ 完整CRUD（增删改查）
  ✅ 基础搜索（表单式）
  ✅ 分页（10/20/50/100条）
  ✅ 权限控制（RBAC）
  ✅ 加载状态
  ✅ 错误处理

代码质量:
  ✅ TypeScript 100%类型安全
  ✅ Vue 3 Composition API
  ✅ Pinia状态管理
  ✅ 企业级注释

性能:
  • 首次渲染: <100ms
  • 表单验证: <50ms
  • 数据加载: <500ms
```

**代码量**: ~400行
**学习成本**: ⭐⭐（2/5）
**推荐指数**: ⭐⭐⭐⭐⭐ (5/5)

---

### 2️⃣ Pro（专业增强版）🚀

**文件**: `pro/VueManagement.template.hbs`

**适用场景**:
- 大型企业应用
- 复杂数据管理
- 高级功能需求

**核心特性**:
```yaml
Standard基础上增强:

高级筛选:
  ✅ 抽屉式高级搜索
  ✅ 多条件组合筛选
  ✅ 筛选条件计数显示

批量操作:
  ✅ 批量删除
  ✅ 批量导入（Excel）
  ✅ 批量导出（Excel/PDF）
  ✅ 批量编辑

列配置:
  ✅ 显示/隐藏列
  ✅ 列排序
  ✅ 列宽调整
  ✅ 配置持久化

数据可视化:
  ✅ 快速统计卡片
    - 总记录数
    - 今日新增
    - 今日更新
    - 今日删除
  ✅ 图表展示（可选）

导出打印:
  ✅ 导出Excel
  ✅ 导出PDF
  ✅ 打印预览

详情查看:
  ✅ 抽屉式详情页
  ✅ 历史记录（可选）
  ✅ 操作日志（可选）

性能优化:
  ✅ 虚拟滚动（大数据集）
  ✅ 懒加载
  ✅ 防抖/节流
```

**代码量**: ~800行
**学习成本**: ⭐⭐⭐⭐ (4/5)
**推荐指数**: ⭐⭐⭐⭐⭐ (5/5)

---

### 3️⃣ Minimal（极简版）⚡

**文件**: `minimal/VueManagement.template.hbs`

**适用场景**:
- 快速原型开发
- 简单数据管理
- 学习和演示

**核心特性**:
```yaml
极简设计:
  ✅ 零配置
  ✅ 快速上手
  ✅ 代码简洁

基础功能:
  ✅ 简单CRUD
  ✅ 快速搜索
  ✅ 基础分页
  ✅ 简单对话框

适用场景:
  • 快速原型验证
  • 后台管理工具
  • 内部系统
  • 学习示例
```

**代码量**: <200行
**学习成本**: ⭐ (1/5)
**推荐指数**: ⭐⭐⭐ (3/5)

---

## 🎯 使用指南

### 1. 模板选择建议

```yaml
Standard:
  场景: 80%的企业应用场景
  团队: 中小团队（2-10人）
  周期: 短期项目（1-3月）

Pro:
  场景: 20%的复杂企业应用
  团队: 大型团队（10+人）
  周期: 长期项目（3月+）

Minimal:
  场景: 快速原型/内部工具
  团队: 个人开发
  周期: 1周快速验证
```

### 2. 模板变量说明

所有模板支持以下Handlebars变量：

```handlebars
{{!-- 实体信息 --}}
{{entityName}}           // 实体名称（PascalCase）：SmartTenant
{{camelCase entityName}} // 驼峰命名：smartTenant
{{pascalCase entityName}}// Pascal命名：SmartTenant
{{entityDisplayName}}    // 显示名称：租户管理
{{entityDescription}}    // 实体描述

{{!-- 模块信息 --}}
{{moduleName}}           // 模块名称：TenantManagement

{{!-- 属性列表 --}}
{{#each displayProperties}}
  {{this.name}}          // 属性名
  {{this.displayName}}   // 显示名称
  {{this.type}}          // 类型：string/number/boolean/DateTime
  {{this.sortable}}      // 是否可排序
  {{this.filterable}}    // 是否可筛选
  {{this.width}}         // 列宽
{{/each}}

{{#each editableProperties}}
  {{this.name}}          // 可编辑属性
  {{this.displayName}}
  {{this.type}}
  {{this.maxLength}}     // 最大长度（string）
{{/each}}

{{#each searchableProperties}}
  {{this.name}}          // 可搜索属性
  {{this.displayName}}
  {{this.type}}
{{/each}}

{{#each requiredProperties}}
  {{this.name}}          // 必填属性
  {{this.displayName}}
{{/each}}

{{!-- 辅助函数 --}}
{{eq a b}}               // 相等判断
{{ne a b}}               // 不等判断
{{gt a b}}               // 大于判断
{{lt a b}}               // 小于判断
```

### 3. DevKit集成

**方式1: 直接指定模板**

```typescript
const config: GenerationOptions = {
  outputBasePath: './src/SmartAbp.Vue',
  templatePreset: 'standard', // 'standard' | 'pro' | 'minimal'
  // ...
}

await generator.generateAsync(config)
```

**方式2: 用户选择（推荐）**

```vue
<template>
  <el-radio-group v-model="preset">
    <el-radio label="standard">标准企业级</el-radio>
    <el-radio label="pro">专业增强版</el-radio>
    <el-radio label="minimal">极简版</el-radio>
  </el-radio-group>
</template>
```

---

## 📊 模板对比表

| 特性 | Standard | Pro | Minimal |
|------|----------|-----|---------|
| **代码量** | ~400行 | ~800行 | <200行 |
| **学习成本** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| **功能完整度** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **性能** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **可扩展性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **基础CRUD** | ✅ | ✅ | ✅ |
| **搜索筛选** | ✅ 基础 | ✅ 高级 | ✅ 简单 |
| **批量操作** | ❌ | ✅ | ❌ |
| **导入导出** | ❌ | ✅ | ❌ |
| **列配置** | ❌ | ✅ | ❌ |
| **数据可视化** | ❌ | ✅ | ❌ |
| **详情查看** | ❌ | ✅ | ❌ |
| **权限控制** | ✅ | ✅ | ❌ |
| **响应式设计** | ✅ | ✅ | ❌ |
| **TypeScript** | ✅ 100% | ✅ 100% | ✅ 100% |
| **Design Tokens** | ✅ | ✅ | ❌ |

---

## 🚀 快速开始

### Step 1: 选择模板

```bash
# 查看可用模板
ls templates/frontend/vue/presets/

# 输出:
# standard/  - 标准企业级（推荐）
# pro/       - 专业增强版
# minimal/   - 极简版
```

### Step 2: 使用DevKit生成

```csharp
// 后端C# - DevKit
var options = new GenerationOptions
{
    OutputBasePath = "./src/SmartAbp.Vue",
    TemplatePreset = "standard", // 选择模板
    // ...
};

await _devKitGenerator.GenerateAsync(options);
```

### Step 3: 验证生成结果

```bash
# 生成的文件
src/SmartAbp.Vue/src/views/tenant/TenantManagement.vue  ✅
src/SmartAbp.Vue/src/stores/modules/tenant/tenant.ts     ✅
src/SmartAbp.Vue/src/api/tenant/tenant-api.ts            ✅
src/SmartAbp.Vue/src/types/tenant/tenant.types.ts        ✅
src/SmartAbp.Vue/src/router/modules/tenant.ts            ✅
```

---

## 📚 最佳实践

### 1. 团队协作

```yaml
小团队（2-5人）:
  推荐: Standard
  原因: 代码简洁，易维护，学习成本低

中型团队（5-15人）:
  推荐: Pro
  原因: 功能完善，支持复杂业务

大型团队（15+人）:
  推荐: Pro + 自定义扩展
  原因: 需要高级功能和定制化
```

### 2. 项目类型

```yaml
企业内部系统:
  推荐: Standard
  原因: 功能够用，开发快速

SaaS产品:
  推荐: Pro
  原因: 需要高级功能和数据导出

快速原型:
  推荐: Minimal
  原因: 快速验证，迭代灵活
```

### 3. 性能优化

```yaml
Standard/Pro模板已包含:
  ✅ 防抖搜索（300ms）
  ✅ 虚拟滚动（大数据集）
  ✅ 懒加载（按需加载）
  ✅ 缓存策略（Pinia持久化）

需要手动优化:
  • 图片懒加载
  • 分页缓存
  • WebSocket（实时更新）
```

---

## 🔧 自定义扩展

### 扩展Standard模板

```bash
# 1. 复制模板
cp -r templates/frontend/vue/presets/standard templates/frontend/vue/presets/custom

# 2. 修改模板
vi templates/frontend/vue/presets/custom/VueManagement.template.hbs

# 3. 使用自定义模板
TemplatePreset = "custom"
```

### 添加自定义Helper

```typescript
// 在DevKit中注册自定义Handlebars Helper
Handlebars.RegisterHelper("upperCase", (text: string) => text.toUpperCase());

// 在模板中使用
{{upperCase entityName}}
```

---

## 📞 技术支持

**问题反馈**: GitHub Issues
**文档维护**: SmartAbp DevKit团队
**版本更新**: 每月15日发布新版本

---

**🎉 祝您使用愉快！**

