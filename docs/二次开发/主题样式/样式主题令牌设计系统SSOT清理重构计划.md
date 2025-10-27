# SmartAbp 样式主题令牌设计系统 SSOT 清理重构计划

**版本**: v1.0  
**执行周期**: 2周  
**优先级**: P0（最高）

---

## 📊 现状诊断

```yaml
核心问题:
  ✗ 4套独立令牌系统并存
  ✗ 主色有7种不同定义
  ✗ 总冗余率350%
  ✗ TS与CSS不同步

健康度: 45/100分（不及格）
```

**废弃文件（4个）**:
- ❌ `src/styles/main-theme.css`
- ❌ `src/styles/base/variables.css`
- ❌ `src/styles/design-system/tokens/modern-colors.css`
- ❌ `src/styles/design-system/themes/theme-aliases.css`

**保留核心**:
- ✅ `src/styles/design-system/`（唯一SSOT）

---

## 🎯 重构目标

| 指标 | 当前 | 目标 |
|---|---|---|
| 令牌系统 | 4套 | 1套 |
| 冗余度 | 350% | 0% |
| 健康度 | 45分 | 95分 |

**统一规范**: `--theme-*` 前缀

```css
✅ --theme-brand-primary: #0ea5e9;
❌ --primary-color, --color-primary-500
```

---

## 📅 分阶段执行计划

### 阶段1：准备与备份（第1天）

```bash
git checkout -b refactor/design-system-ssot
cp -r src/SmartAbp.Vue/src/styles src/SmartAbp.Vue/src/styles.backup
grep -r "--primary-color\|--color-primary-500" src/ > variable-usage.txt
```

---

### 阶段2：合并冗余文件（第2-3天）

**操作**:
```bash
# 合并modern-colors.css到colors.css
# 删除重复定义，保留最新值
git rm src/styles/design-system/tokens/modern-colors.css
```

**验收**: colors.css无重复，theme-base.css完整

---

### 阶段3：创建兼容层（第4天）

创建 `src/styles/migration-aliases.css`:

```css
/* 临时兼容 - 2025-11-15删除 */
:root {
  --primary-color: var(--theme-brand-primary);
  --bg-color: var(--theme-bg-body);
  --text-color: var(--theme-text-primary);
  /* ...其他映射 */
}
```

在 `design-system/index.css` 导入兼容层

**验收**: 所有页面正常，主题切换正常

---

### 阶段4：废弃旧文件（第5天）

```bash
# 重命名旧文件（先不删）
mv src/styles/main-theme.css src/styles/main-theme.css.deprecated
mv src/styles/base/variables.css src/styles/base/variables.css.deprecated

# 全面测试
npm run dev
```

**测试**: 所有页面、4个主题、暗色模式全部正常

---

### 阶段5：TypeScript同步（第6-7天）

重写 `packages/lowcode-shared/src/theme/tokens.ts`:

```typescript
// 与CSS 100%同步
export const DesignTokens = {
  colors: {
    brandPrimary: '#0ea5e9',  // = theme-base.css
    success: '#10b981',
    bgBody: '#f8fafc',
    textPrimary: '#0f172a',
    // ...
  }
} as const
```

**验收**: TS编译通过，值与CSS一致

---

### 阶段6：全局变量替换（第8-10天）

创建替换脚本 `scripts/replace-css-variables.sh`:

```bash
#!/bin/bash
# 自动替换所有旧变量
find src/ \( -name "*.vue" -o -name "*.css" \) -exec sed -i '' \
  -e 's/--primary-color/--theme-brand-primary/g' \
  -e 's/--bg-color\([^-]\)/--theme-bg-body\1/g' \
  -e 's/--text-color\([^-]\)/--theme-text-primary\1/g' \
  {} \;
```

执行并测试:
```bash
bash scripts/replace-css-variables.sh
git diff src/ | less
npm run dev
```

**验收**: 旧变量全部替换，无新增错误

---

### 阶段7：移除兼容层（第11天）

```bash
# 删除兼容文件
rm src/styles/migration-aliases.css
rm src/styles/main-theme.css.deprecated
rm src/styles/base/variables.css.deprecated

# 最终测试
npm run clean && npm run build && npm run preview
```

**验收**: 构建成功，生产版本正常

---

### 阶段8：文档与规范（第12-14天）

1. 创建 `设计系统使用指南.md`
2. 在 `index.css` 添加SSOT注释
3. 配置ESLint禁止硬编码颜色

```javascript
// .eslintrc.js
rules: {
  'no-restricted-syntax': ['error', {
    selector: 'Literal[value=/#[0-9A-Fa-f]{3,8}/]',
    message: '禁止硬编码颜色，使用--theme-*变量'
  }]
}
```

---

## ✅ 验收标准

```yaml
代码质量:
  ☑ TS编译0错误、ESLint 0警告
  ☑ 构建成功、生产版正常

样式系统:
  ☑ 1套令牌系统
  ☑ 变量100%符合--theme-*规范
  ☑ 4个主题+暗色模式全部正常
  ☑ TS与CSS 100%同步

功能性能:
  ☑ 所有页面正常、主题切换流畅
  ☑ CSS大小减少>60%
  ☑ 无控制台错误

文档规范:
  ☑ 使用指南已创建
  ☑ ESLint规则已配置
```

**健康度目标**: ≥95分

---

## 🔄 回滚方案

**触发条件**: 生产异常、关键页面无法访问、主题切换失败

```bash
# 完全回滚
git checkout main
cp -r src/styles.backup/* src/styles/
npm run clean && npm run build

# 部分回滚
git checkout HEAD -- src/styles/design-system/
```

---

## 📊 进度追踪

```
第1天:   准备与备份
第2-3天: 合并冗余文件
第4天:   创建兼容层
第5天:   废弃旧文件
第6-7天: TypeScript同步
第8-10天:全局变量替换
第11天:  移除兼容层
第12-14天:文档与规范
```

**每日检查**: 代码已提交、测试通过、进度更新

---

## 📝 附录

### A. 变量映射表

```yaml
旧变量 → 新变量:
  --primary-color → --theme-brand-primary
  --bg-color → --theme-bg-body
  --text-color → --theme-text-primary
  --border-color → --theme-border-base
  --success-color → --theme-success
```

### B. 快速命令

```bash
# 统计进度
grep -r "--theme-" src/ | wc -l

# 查找遗留
grep -r "--primary-color\|--bg-color" src/

# 验证
npm run type-check && npm run lint
```

---

## ✅ 最终交付物

```yaml
代码:
  ✅ 清理后的design-system目录
  ✅ 同步的TS令牌文件
  ✅ ESLint配置

文档:
  ✅ 设计系统使用指南
  ✅ 重构总结报告
```

**完成标志**: 健康度≥95分  
**结束日期**: 2025-11-10

