# Quality Guardian 迁移说明

## 📍 迁移信息

**迁移日期**: 2025-10-11  
**旧位置**: `src/SmartAbp.Vue/packages/lowcode-quality-guardian/`  
**新位置**: `src/quality-guardian/`  
**包名变更**: `@smartabp/lowcode-quality-guardian` → `@smartabp/quality-guardian`

## 🎯 迁移原因

Quality Guardian 是一个独立的代码质量检测工具，不应该作为低代码平台的一部分：

1. ✅ **职责单一**: 专注于代码质量检测
2. ✅ **独立部署**: 可独立发布和使用
3. ✅ **通用工具**: 适用于任何TypeScript/Vue/C#项目
4. ✅ **清晰架构**: 工具层与业务层分离

## 🔄 变更清单

### 1. 包名变更

```json
// 旧
"@smartabp/lowcode-quality-guardian"

// 新
"@smartabp/quality-guardian"
```

### 2. 目录结构

```
旧:
src/SmartAbp.Vue/packages/lowcode-quality-guardian/
├── src/
├── package.json
└── README.md

新:
src/quality-guardian/
├── src/
├── bin/
│   └── quality-guardian
├── package.json
├── README.md
├── INSTALL.md
└── MIGRATION.md
```

### 3. 依赖配置

Quality Guardian 现在是完全独立的，不依赖任何项目内部包。

### 4. 使用方式

#### 旧方式（项目内）

```bash
cd src/SmartAbp.Vue
npx quality-guardian check
```

#### 新方式（独立工具）

```bash
# 全局安装
cd src/quality-guardian
npm link
quality-guardian check --project-root /path/to/any/project

# 或本地使用
cd src/quality-guardian
npm run dev
```

## 📦 如何更新现有引用

### package.json

```json
// 如果您的项目依赖了 quality-guardian
{
  "devDependencies": {
    "@smartabp/quality-guardian": "file:../quality-guardian"
  }
}
```

### CI/CD脚本

```bash
# 旧
cd src/SmartAbp.Vue/packages/lowcode-quality-guardian
npm install && npm run build

# 新
cd src/quality-guardian
npm install && npm run build
```

### npm scripts

```json
{
  "scripts": {
    "quality": "node ../quality-guardian/dist/cli.js check"
  }
}
```

## ✅ 迁移完成检查清单

- [x] 文件已迁移到 `src/quality-guardian/`
- [x] 包名已更新为 `@smartabp/quality-guardian`
- [x] tsconfig.json 已更新（移除对其他包的引用）
- [x] 构建成功
- [x] 旧位置文件已删除
- [x] 文档已更新

## 🆕 新功能

迁移后的 Quality Guardian 支持：

- ✅ 全局安装，任何项目可用
- ✅ 检测任何TypeScript/Vue/C#项目
- ✅ 更清晰的CLI界面
- ✅ 独立版本管理

## 📞 问题反馈

如果迁移过程中遇到问题，请联系开发团队。

