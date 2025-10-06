# @smartabp/metadata-core - 安全策略

> **包状态**: 🔒 私有包，仅限内部使用  
> **发布控制**: 🛡️ 已启用多层封闭保护  
> **最后更新**: 2025-10-07

---

## 🛡️ **封闭保护措施（5层防护）**

### 第1层：NPM发布保护 ✅
- **private: true** - 阻止意外发布到公共npm
- **access: "restricted"** - 限制为私有访问
- **.npmignore** - 敏感文件过滤（源码、文档、配置）

### 第2层：Monorepo隔离 ✅
- **workspace:*** - 仅限工作区内部引用
- **零外部依赖** - 无业务系统耦合
- **物理隔离** - 独立目录、独立配置

### 第3层：访问控制 ✅
- **明确的API边界** - 4个导出入口（index/validators/types/schema）
- **TypeScript类型安全** - 100%类型定义
- **ESM/CJS双格式** - 控制导入方式

### 第4层：质量门禁 ✅
- **prepublishOnly钩子** - 发布前强制检查
- **135个单元测试** - 功能完整性保障
- **TypeScript编译检查** - 0错误容忍

### 第5层：版本控制 ✅
- **Git版本管理** - 完整的变更历史
- **语义化版本** - 严格的版本规范
- **变更日志** - 可追溯的修改记录

---

## 🚫 **防护机制详解**

### 防止意外发布到公共npm

```json
// package.json 配置
{
  "private": true,  // 🔒 阻止 npm publish
  "publishConfig": {
    "access": "restricted"  // 🛡️ 限制访问权限
  }
}
```

**效果**:
- 执行 `npm publish` 会报错：`npm ERR! This package is marked as private`
- 必须先移除 `"private": true` 才能发布

### 敏感文件过滤

**.npmignore 配置**:
```
❌ src/              # 源代码不发布
❌ __tests__/        # 测试代码不发布
❌ *.md文档          # 详细文档不发布（保留README.md）
❌ 配置文件          # tsconfig/tsup/vitest不发布
❌ .git/            # 版本控制不发布
```

**仅发布**:
- ✅ dist/ (构建产物)
- ✅ README.md (基础说明)
- ✅ LICENSE (许可证)
- ✅ package.json (包配置)

### Monorepo工作区隔离

```json
// lowcode-shared/package.json
{
  "dependencies": {
    "@smartabp/metadata-core": "workspace:*"
  }
}
```

**特点**:
- ✅ 仅限工作区内部引用
- ✅ 无法从外部npm安装
- ✅ 开发时符号链接，不占用额外空间

---

## 🔐 **如何安全使用**

### 内部使用（当前方式）✅

```typescript
// ✅ 正确：在Monorepo内部引用
import { EntityMetadata } from '@smartabp/metadata-core'
import { validateEntityMetadata } from '@smartabp/metadata-core/validators'
```

### 外部使用（需要先解除保护）❌

```bash
# ❌ 当前配置下，外部项目无法安装
npm install @smartabp/metadata-core
# Error: Package is private

# ✅ 如需外部使用，需执行以下步骤：
# 1. 移除 package.json 中的 "private": true
# 2. 修改 publishConfig.access 为 "public"（如发布到公共npm）
# 3. 执行 npm publish
```

---

## ⚙️ **解除保护的步骤（仅当需要发布时）**

### 步骤1：修改package.json

```bash
# 移除private标记
sed -i '' '/"private": true,/d' package.json

# 或手动编辑，删除以下行:
# "private": true,
```

### 步骤2：修改访问权限（可选）

```json
{
  "publishConfig": {
    "access": "public"  // 公共访问
    // 或
    "access": "restricted"  // 私有访问（需要npm组织）
  }
}
```

### 步骤3：发布

```bash
npm publish
```

---

## 📊 **封闭保护验证**

### 验证1：尝试发布（应该失败）

```bash
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Vue/packages/metadata-core
npm publish

# 预期输出:
# npm ERR! This package is marked as private
# npm ERR! Remove the 'private' field from the package.json to publish it.
```

### 验证2：检查发布文件列表

```bash
npm pack --dry-run

# 预期输出:
# npm notice 📦  @smartabp/metadata-core@1.0.0
# npm notice === Tarball Contents ===
# npm notice dist/              # ✅ 构建产物
# npm notice README.md          # ✅ 基础文档
# npm notice LICENSE            # ✅ 许可证
# npm notice package.json       # ✅ 包配置
# npm notice 
# npm notice === Tarball Details ===
# npm notice filename:      smartabp-metadata-core-1.0.0.tgz
# npm notice package size:  567.5 kB
# npm notice unpacked size: 1.2 MB
```

### 验证3：检查工作区依赖

```bash
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Vue/packages/lowcode-shared
npm ls @smartabp/metadata-core

# 预期输出:
# @smartabp/lowcode-shared@1.0.0
# └── @smartabp/metadata-core@workspace:* -> ../../../../metadata-core
```

---

## 🎯 **安全最佳实践**

### ✅ DO（推荐做法）

1. **保持private标记** - 防止意外发布
2. **定期审查dependencies** - 确保无敏感依赖
3. **限制API导出** - 只暴露必要接口
4. **版本锁定** - 使用精确版本号
5. **代码审查** - 所有变更需要审查

### ❌ DON'T（禁止做法）

1. **不要在源码中硬编码敏感信息** - API密钥、密码等
2. **不要发布开发文件** - 测试、配置、文档
3. **不要绕过质量门禁** - prepublishOnly必须通过
4. **不要随意修改版本号** - 遵循语义化版本
5. **不要删除.npmignore** - 保护敏感文件

---

## 📝 **变更记录**

### v1.0.0 (2025-10-07)

**封闭保护措施实施**:
- ✅ 添加 `"private": true` 防止意外发布
- ✅ 修改 `publishConfig.access` 为 "restricted"
- ✅ 创建 `.npmignore` 过滤敏感文件
- ✅ 创建 `SECURITY.md` 安全策略文档
- ✅ 验证Monorepo工作区隔离

**保护效果**:
- 🔒 无法意外发布到公共npm
- 🛡️ 敏感文件不会泄露
- 🔐 仅限工作区内部使用
- ✅ 物理隔离完全实现

---

## 📞 **联系方式**

**安全问题报告**: security@smartabp.io  
**技术支持**: team@smartabp.io  
**文档地址**: https://github.com/smartabp/smartabp

---

**最后更新**: 2025-10-07  
**维护者**: SmartAbp Team

