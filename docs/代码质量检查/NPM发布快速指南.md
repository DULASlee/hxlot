# NPM 发布快速指南 ⚡

> 5分钟快速上手，立即发布到NPM！

---

## 🎯 前置条件

```bash
# 1. 已注册NPM账号
# 访问: https://www.npmjs.com/signup

# 2. 已登录NPM
npm login
# 输入用户名、密码、邮箱

# 3. 验证登录
npm whoami
# 应该显示你的用户名
```

---

## 🚀 三步发布

### 第一步：构建所有包

```bash
cd src/SmartAbp.Vue
npm run build:packages
```

### 第二步：发布前检查（推荐）

```bash
# 检查单个包
./scripts/publish/check-before-publish.sh src/SmartAbp.Vue/packages/lowcode-core

# 或者直接试运行批量发布
./scripts/publish/publish-all-packages.sh --dry-run
```

### 第三步：发布

#### 方式A：批量发布（推荐）

```bash
# 发布所有6个包（按依赖关系自动排序）
./scripts/publish/publish-all-packages.sh
```

#### 方式B：单个包发布

```bash
cd src/SmartAbp.Vue/packages/lowcode-core
npm publish --access public
```

---

## 📋 发布顺序

脚本会自动按以下顺序发布（从低到高）：

```
1. metadata-core      # 零依赖
2. lowcode-shared     # 依赖metadata-core
3. lowcode-api        # 依赖shared
4. lowcode-tools      # 依赖shared
5. lowcode-core       # 依赖shared
6. lowcode-designer   # 依赖shared+core
```

---

## ✅ 发布后验证

### 在NPM官网查看

```bash
# 浏览器打开
open https://www.npmjs.com/package/@smartabp/lowcode-core

# 或命令行查看
npm view @smartabp/lowcode-core
```

### 测试安装

```bash
# 新建测试目录
mkdir /tmp/test-smartabp && cd /tmp/test-smartabp

# 初始化
npm init -y

# 安装刚发布的包
npm install @smartabp/lowcode-core

# 测试导入
node -e "const pkg = require('@smartabp/lowcode-core'); console.log('✅ 安装成功')"
```

---

## 🔄 版本管理

### 升级版本号

```bash
cd src/SmartAbp.Vue/packages/lowcode-core

# 修订版本（bug修复）: 1.0.0 → 1.0.1
npm version patch

# 次版本（新功能）: 1.0.0 → 1.1.0
npm version minor

# 主版本（破坏性更新）: 1.0.0 → 2.0.0
npm version major
```

### 发布预发布版本

```bash
# 升级为beta版本
npm version prerelease --preid=beta

# 发布到beta标签
npm publish --tag beta

# 用户安装beta版本
npm install @smartabp/lowcode-core@beta
```

---

## 🛠️ 常用命令

### 检查命令

```bash
# 检查登录状态
npm whoami

# 查看包信息
npm view @smartabp/lowcode-core

# 查看所有版本
npm view @smartabp/lowcode-core versions

# 预览发布内容
npm pack --dry-run
```

### 发布命令

```bash
# 发布公开包
npm publish --access public

# 发布到指定标签
npm publish --tag beta

# 发布并绕过2FA（不推荐）
npm publish --otp=123456
```

### 管理命令

```bash
# 弃用版本
npm deprecate @smartabp/lowcode-core@1.0.0 "请升级到1.1.0"

# 撤销发布（24小时内）
npm unpublish @smartabp/lowcode-core@1.0.0

# 更新包描述
npm owner add username @smartabp/lowcode-core
```

---

## ❓ 常见问题

### Q1: 提示"You do not have permission to publish"

**解决**:
```bash
# 1. 确认已登录
npm whoami

# 2. 确认package.json中有
{
  "publishConfig": {
    "access": "public"
  }
}

# 3. 如果是组织包，确认你在组织中
# 访问: https://www.npmjs.com/settings/smartabp/members
```

### Q2: 提示版本号已存在

**解决**:
```bash
# 升级版本号
npm version patch

# 再次发布
npm publish --access public
```

### Q3: 发布失败，如何回滚？

**解决**:
```bash
# 24小时内可以撤销
npm unpublish @smartabp/lowcode-core@1.0.0

# 或者标记为弃用
npm deprecate @smartabp/lowcode-core@1.0.0 "版本有问题，请使用1.0.1"
```

---

## 📞 获取帮助

- **完整指南**: [NPM公共仓库发布指南.md](./NPM公共仓库发布指南.md)
- **脚本文档**: [scripts/publish/README.md](../../scripts/publish/README.md)
- **NPM官方文档**: https://docs.npmjs.com/

---

## 🎯 快速命令参考卡

```bash
# === 准备 ===
npm login                    # 登录NPM
npm run build:packages       # 构建所有包

# === 检查 ===
./scripts/publish/check-before-publish.sh src/SmartAbp.Vue/packages/lowcode-core
./scripts/publish/publish-all-packages.sh --dry-run

# === 发布 ===
./scripts/publish/publish-all-packages.sh                # 批量发布（推荐）
cd packages/lowcode-core && npm publish --access public  # 单个发布

# === 验证 ===
npm view @smartabp/lowcode-core              # 查看包信息
npm install @smartabp/lowcode-core           # 测试安装

# === 版本 ===
npm version patch     # 1.0.0 → 1.0.1（bug修复）
npm version minor     # 1.0.0 → 1.1.0（新功能）
npm version major     # 1.0.0 → 2.0.0（破坏性更新）
```

---

**最后更新**: 2025-10-11  
**维护者**: SmartAbp Team  
**难度**: ⭐⭐☆☆☆（简单）

