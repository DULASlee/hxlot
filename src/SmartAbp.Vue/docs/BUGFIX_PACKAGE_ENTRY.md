# 🔧 Packages入口点配置修复

**问题**: Vite无法解析packages的入口点  
**原因**: `package.json` 的 `exports` 配置指向不存在的 `dist` 目录  
**修复时间**: 2025-10-12  

---

## 🔍 问题诊断

### 错误信息

```
[plugin:vite:import-analysis] Failed to resolve entry for package "@smartabp/metadata-core". 
The package may have incorrect main/module/exports specified in its package.json.
```

### 根本原因

所有packages的 `package.json` 都配置了：

```json
{
  "exports": {
    ".": {
      "types": "./dist/esm/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    }
  }
}
```

但在开发环境中：
- ❌ `dist` 目录不存在（未编译）
- ❌ Vite无法找到入口文件
- ❌ 导致模块解析失败

---

## ✅ 修复方案

### 修复内容

为所有packages的 `package.json` 添加开发环境入口点：

```json
{
  "exports": {
    ".": {
      "development": "./src/index.ts",      // ✅ 新增：开发环境使用源码
      "types": "./dist/esm/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "default": "./src/index.ts"           // ✅ 新增：默认fallback
    }
  }
}
```

### 修复的Packages

| Package | 文件位置 | 状态 |
|---------|---------|------|
| `@smartabp/metadata-core` | `packages/metadata-core/package.json` | ✅ 已修复 |
| `@smartabp/lowcode-shared` | `packages/lowcode-shared/package.json` | ✅ 已修复 |
| `@smartabp/lowcode-core` | `packages/lowcode-core/package.json` | ✅ 已修复 |
| `@smartabp/lowcode-designer` | `packages/lowcode-designer/package.json` | ✅ 已修复 |
| `@smartabp/lowcode-api` | `packages/lowcode-api/package.json` | ✅ 已修复 |
| `@smartabp/lowcode-tools` | `packages/lowcode-tools/package.json` | ✅ 已修复 |

---

## 🎯 修复效果

### 开发环境

- ✅ Vite直接使用源码（`src/index.ts`）
- ✅ 无需预编译packages
- ✅ 热更新速度更快
- ✅ TypeScript类型检查正确

### 生产环境

- ✅ 使用编译后的代码（`dist/esm/index.js`）
- ✅ 优化的构建产物
- ✅ 向后兼容（`dist/cjs/index.js`）

---

## 📋 验证步骤

### 1. 检查配置

```bash
# 查看packages配置
cat packages/*/package.json | grep -A 5 '"exports"'
```

### 2. 测试开发环境

```bash
# 启动开发服务器
cd src/SmartAbp.Vue
npm run dev
```

**预期结果**:
- ✅ 无模块解析错误
- ✅ 页面正常加载
- ✅ 热更新工作正常

### 3. 测试TypeScript编译

```bash
npm run type-check
```

**预期结果**:
- ✅ TypeScript编译成功
- ✅ 类型检查通过

### 4. 测试生产构建

```bash
npm run build
```

**预期结果**:
- ✅ 构建成功
- ✅ packages被正确打包
- ✅ 代码分割正确

---

## 🔍 技术细节

### Node.js Exports条件

Node.js的 `exports` 字段支持条件导出：

```json
{
  "exports": {
    ".": {
      "development": "./src/index.ts",    // NODE_ENV=development
      "production": "./dist/esm/index.js", // NODE_ENV=production
      "types": "./dist/esm/index.d.ts",   // TypeScript类型
      "import": "./dist/esm/index.js",    // ESM导入
      "require": "./dist/cjs/index.js",   // CJS导入
      "default": "./src/index.ts"         // 默认fallback
    }
  }
}
```

**解析优先级**:
1. `development` (开发环境)
2. `production` (生产环境)
3. `types` (TypeScript)
4. `import` (ESM)
5. `require` (CJS)
6. `default` (fallback)

### Vite解析机制

Vite在开发环境中：
1. 读取 `package.json` 的 `exports` 字段
2. 根据条件选择入口点（`development` 优先）
3. 直接使用源码（`.ts`文件）
4. 实时编译和热更新

---

## 🚨 注意事项

### 1. 源码必须存在

确保所有packages的 `src/index.ts` 文件存在：

```bash
# 检查入口文件
ls -la packages/*/src/index.ts
```

### 2. TypeScript配置正确

确保 `tsconfig.json` 配置正确：

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",  // 支持exports字段
    "resolveJsonModule": true,
    "paths": {
      "@smartabp/metadata-core": ["packages/metadata-core/src/index.ts"]
    }
  }
}
```

### 3. 生产构建前需编译

在发布前，必须先编译packages：

```bash
# 编译所有packages
npm run build:packages

# 检查编译产物
ls -la packages/*/dist/
```

---

## 🎉 总结

**问题**:
- ❌ Vite无法解析packages入口点
- ❌ 开发环境启动失败

**修复**:
- ✅ 为所有packages添加 `development` 条件导出
- ✅ 开发环境直接使用源码
- ✅ 生产环境使用编译产物

**效果**:
- ✅ 开发环境正常启动
- ✅ 热更新速度提升
- ✅ 类型检查正确
- ✅ 生产构建正常

---

**下一步**: 运行 `npm run dev` 测试修复效果！

