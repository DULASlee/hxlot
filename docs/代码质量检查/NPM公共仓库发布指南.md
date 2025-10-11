# NPM 公共仓库发布完整指南

**版本**: v1.0  
**更新日期**: 2025-10-11  
**适用于**: @smartabp/lowcode 及所有子包

---

## 📋 目录

1. [前置准备](#前置准备)
2. [NPM账号注册与配置](#npm账号注册与配置)
3. [包发布前检查](#包发布前检查)
4. [发布流程](#发布流程)
5. [发布后验证](#发布后验证)
6. [版本管理](#版本管理)
7. [常见问题](#常见问题)
8. [自动化发布](#自动化发布)

---

## 🎯 前置准备

### 1. 确认Node.js和npm版本

```bash
node --version   # 需要 >= 18.0.0
npm --version    # 需要 >= 9.0.0
```

如果版本过低，请升级：
```bash
# 使用nvm升级Node.js
nvm install 18
nvm use 18

# 或直接从官网下载
# https://nodejs.org/
```

### 2. 确认包已构建

```bash
cd src/SmartAbp.Vue

# 构建所有packages
npm run build:packages

# 验证构建产物
ls packages/*/dist/
```

### 3. 确认所有测试通过

```bash
# TypeScript类型检查
npm run type-check

# 单元测试（如果有）
npm test

# ESLint检查
npm run lint
```

---

## 🔐 NPM账号注册与配置

### 第一步：注册NPM账号

#### 方式A：通过官网注册（推荐）

1. 访问 https://www.npmjs.com/signup
2. 填写信息：
   - **Username**: 选择用户名（如：smartabp-team）
   - **Email**: 邮箱地址
   - **Password**: 密码
3. 验证邮箱
4. 启用 **2FA双因素认证**（强烈推荐）

#### 方式B：通过命令行注册

```bash
npm adduser
# 按提示输入：
# - Username
# - Password
# - Email
```

### 第二步：登录NPM

```bash
# 登录到NPM公共仓库
npm login

# 输入：
# - Username: 你的用户名
# - Password: 你的密码
# - Email: 你的邮箱
# - OTP (如果启用了2FA): 双因素认证码
```

验证登录状态：
```bash
npm whoami
# 应该显示你的用户名
```

### 第三步：配置NPM访问令牌（可选但推荐）

为了安全和自动化，建议使用访问令牌：

1. 登录 https://www.npmjs.com/
2. 点击头像 → **Access Tokens**
3. 点击 **Generate New Token**
4. 选择类型：
   - **Publish**: 允许发布包
   - **Automation**: 用于CI/CD（推荐）
5. 复制生成的令牌

配置令牌到本地：
```bash
# 方式1: 通过npm login使用令牌
npm login --auth-type=legacy

# 方式2: 手动配置.npmrc
echo "//registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE" >> ~/.npmrc
```

### 第四步：配置组织（如果使用@smartabp scope）

如果包名是 `@smartabp/lowcode`，需要：

1. 在NPM上创建组织：
   - 访问 https://www.npmjs.com/org/create
   - 输入组织名：`smartabp`
   - 选择类型：**Free**（公开包）或 **Paid**（私有包）

2. 邀请团队成员（可选）：
   - 进入组织页面
   - 点击 **Members** → **Invite**

---

## ✅ 包发布前检查

### 检查清单

使用以下脚本快速检查：

```bash
#!/bin/bash
# check-before-publish.sh

echo "=== NPM发布前检查 ==="
echo ""

# 1. 检查package.json
echo "📦 检查 package.json..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json 不存在"
    exit 1
fi

# 2. 检查必要字段
echo "📋 检查必要字段..."
for field in name version description main types; do
    value=$(node -p "require('./package.json').$field")
    if [ "$value" = "undefined" ]; then
        echo "❌ 缺少字段: $field"
        exit 1
    else
        echo "✅ $field: $value"
    fi
done

# 3. 检查dist目录
echo ""
echo "📁 检查构建产物..."
if [ ! -d "dist" ]; then
    echo "❌ dist 目录不存在，请先运行 npm run build"
    exit 1
else
    echo "✅ dist 目录存在"
fi

# 4. 检查.npmignore或files字段
echo ""
echo "📝 检查发布文件配置..."
if [ -f ".npmignore" ]; then
    echo "✅ .npmignore 存在"
elif grep -q '"files"' package.json; then
    echo "✅ package.json 中配置了 files 字段"
else
    echo "⚠️  建议配置 .npmignore 或 files 字段"
fi

# 5. 检查README
echo ""
echo "📖 检查文档..."
if [ ! -f "README.md" ]; then
    echo "⚠️  README.md 不存在，建议添加"
else
    echo "✅ README.md 存在"
fi

# 6. 检查LICENSE
echo ""
echo "⚖️  检查许可证..."
if [ ! -f "LICENSE" ]; then
    echo "⚠️  LICENSE 文件不存在，建议添加"
else
    echo "✅ LICENSE 文件存在"
fi

# 7. 检查是否已登录
echo ""
echo "🔐 检查NPM登录状态..."
if npm whoami &>/dev/null; then
    username=$(npm whoami)
    echo "✅ 已登录，用户名: $username"
else
    echo "❌ 未登录，请先执行: npm login"
    exit 1
fi

# 8. 检查包名是否已存在
echo ""
echo "🔍 检查包名是否可用..."
package_name=$(node -p "require('./package.json').name")
if npm view "$package_name" &>/dev/null; then
    current_version=$(npm view "$package_name" version)
    local_version=$(node -p "require('./package.json').version")
    echo "⚠️  包 $package_name 已存在，当前版本: $current_version"
    echo "   本地版本: $local_version"
    if [ "$current_version" = "$local_version" ]; then
        echo "❌ 版本号相同，无法发布！请先升级版本"
        exit 1
    fi
else
    echo "✅ 包名 $package_name 可用"
fi

echo ""
echo "=== 检查完成！可以发布 ==="
```

保存为 `scripts/check-before-publish.sh`，然后运行：

```bash
chmod +x scripts/check-before-publish.sh
./scripts/check-before-publish.sh
```

### 手动检查要点

#### 1. package.json 必填字段

```json
{
  "name": "@smartabp/lowcode",           // ✅ 必须
  "version": "1.0.0",                    // ✅ 必须
  "description": "描述信息",              // ✅ 必须
  "main": "./dist/index.js",             // ✅ 必须
  "module": "./dist/index.mjs",          // ✅ 推荐
  "types": "./dist/index.d.ts",          // ✅ 必须（TypeScript项目）
  "author": "SmartAbp Team",             // ✅ 推荐
  "license": "MIT",                      // ✅ 必须
  "keywords": ["lowcode", "smartabp"],   // ✅ 推荐
  "repository": {                        // ✅ 推荐
    "type": "git",
    "url": "https://github.com/..."
  },
  "bugs": {                              // ✅ 推荐
    "url": "https://github.com/.../issues"
  },
  "homepage": "https://smartabp.io",     // ✅ 推荐
  "files": [                             // ✅ 必须
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

#### 2. 检查.npmignore（如果不使用files字段）

创建 `.npmignore` 文件：

```
# 源代码
src/
*.ts
!*.d.ts

# 测试
test/
tests/
__tests__/
*.test.js
*.spec.js

# 配置文件
tsconfig.json
tsup.config.ts
.eslintrc.*
.prettierrc.*
vitest.config.ts

# 构建文件
node_modules/
.turbo/
*.log

# 开发文件
.vscode/
.idea/
.DS_Store
*.swp

# CI/CD
.github/
.gitlab-ci.yml
```

#### 3. 确认 publishConfig

```json
{
  "publishConfig": {
    "access": "public",                    // ✅ 公开包必须
    "registry": "https://registry.npmjs.org/"
  }
}
```

---

## 🚀 发布流程

### 方式一：手动发布（推荐新手）

#### 第一步：切换到包目录

```bash
cd src/SmartAbp.Vue/packages/lowcode
```

#### 第二步：最后检查

```bash
# 查看将要发布的文件
npm pack --dry-run

# 这会列出所有将要包含在包中的文件
```

#### 第三步：发布

```bash
# 发布到公共NPM仓库
npm publish --access public

# 如果启用了2FA，会提示输入OTP
```

**发布输出示例**：
```
npm notice 
npm notice 📦  @smartabp/lowcode@1.0.0
npm notice === Tarball Contents === 
npm notice 1.2kB  package.json
npm notice 15.4kB README.md
npm notice 1.1kB  LICENSE
npm notice 245kB  dist/index.js
npm notice === Tarball Details === 
npm notice name:          @smartabp/lowcode
npm notice version:       1.0.0
npm notice package size:  89.2 kB
npm notice unpacked size: 262.7 kB
npm notice shasum:        abc123...
npm notice integrity:     sha512-xyz789...
npm notice total files:   25
npm notice 
+ @smartabp/lowcode@1.0.0
```

#### 第四步：验证发布

```bash
# 在NPM官网查看
open https://www.npmjs.com/package/@smartabp/lowcode

# 或通过命令行查看
npm view @smartabp/lowcode
```

### 方式二：使用脚本自动发布

创建发布脚本 `scripts/publish-packages.sh`：

```bash
#!/bin/bash
# publish-packages.sh - 自动发布所有packages

set -e  # 遇到错误立即退出

echo "🚀 开始发布 SmartAbp Packages..."
echo ""

# 发布顺序（按依赖关系）
PACKAGES=(
    "metadata-core"
    "lowcode-shared"
    "lowcode-api"
    "lowcode-core"
    "lowcode-designer"
    "lowcode-tools"
)

# 切换到packages目录
cd "$(dirname "$0")/../src/SmartAbp.Vue/packages"

# 检查登录状态
if ! npm whoami &>/dev/null; then
    echo "❌ 未登录NPM，请先执行: npm login"
    exit 1
fi

echo "✅ NPM登录用户: $(npm whoami)"
echo ""

# 依次发布每个包
for pkg in "${PACKAGES[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 发布: @smartabp/$pkg"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd "$pkg"
    
    # 检查dist目录
    if [ ! -d "dist" ]; then
        echo "❌ dist目录不存在，请先运行构建"
        exit 1
    fi
    
    # 获取包信息
    pkg_name=$(node -p "require('./package.json').name")
    pkg_version=$(node -p "require('./package.json').version")
    
    echo "包名: $pkg_name"
    echo "版本: $pkg_version"
    echo ""
    
    # 检查版本是否已存在
    if npm view "$pkg_name@$pkg_version" &>/dev/null; then
        echo "⚠️  版本 $pkg_version 已存在，跳过发布"
    else
        # 发布
        echo "📤 开始发布..."
        npm publish --access public
        echo "✅ 发布成功！"
    fi
    
    echo ""
    cd ..
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 所有包发布完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

使用脚本：

```bash
chmod +x scripts/publish-packages.sh
./scripts/publish-packages.sh
```

### 方式三：使用统一包发布

如果采用统一大包方案：

```bash
cd src/SmartAbp.Vue/packages/lowcode

# 确保所有依赖包已发布或使用workspace
npm publish --access public
```

---

## ✅ 发布后验证

### 1. 在NPM官网查看

访问包页面：
- https://www.npmjs.com/package/@smartabp/lowcode
- 检查版本号、文件列表、README显示

### 2. 安装测试

在新目录测试安装：

```bash
# 创建测试目录
mkdir /tmp/test-smartabp
cd /tmp/test-smartabp

# 初始化项目
npm init -y

# 安装刚发布的包
npm install @smartabp/lowcode

# 测试导入
node -e "const pkg = require('@smartabp/lowcode'); console.log('✅ 导入成功', Object.keys(pkg))"
```

### 3. TypeScript类型检查

```bash
# 创建测试文件
cat > test.ts << 'EOF'
import { ComponentRegistry, useEntityModelingStore } from '@smartabp/lowcode'

const registry = ComponentRegistry.getInstance()
console.log('✅ TypeScript类型正常')
EOF

# 类型检查
npx tsc --noEmit test.ts
```

### 4. 检查包大小

```bash
# 查看包信息
npm view @smartabp/lowcode

# 查看包大小
npm view @smartabp/lowcode dist.unpackedSize
```

---

## 📈 版本管理

### 语义化版本（Semantic Versioning）

格式：`MAJOR.MINOR.PATCH`

- **MAJOR（主版本）**: 不兼容的API修改
- **MINOR（次版本）**: 向下兼容的功能新增
- **PATCH（修订版）**: 向下兼容的问题修正

示例：
- `1.0.0` → `1.0.1` - 修复bug
- `1.0.0` → `1.1.0` - 新增功能
- `1.0.0` → `2.0.0` - 破坏性更新

### 使用npm version命令升级版本

```bash
# 升级修订版本（1.0.0 → 1.0.1）
npm version patch

# 升级次版本（1.0.0 → 1.1.0）
npm version minor

# 升级主版本（1.0.0 → 2.0.0）
npm version major

# 设置预发布版本（1.0.0 → 1.0.1-beta.0）
npm version prerelease --preid=beta

# 自定义版本
npm version 1.2.3
```

### 发布预发布版本

```bash
# 发布beta版本
npm version prerelease --preid=beta
npm publish --tag beta

# 用户安装beta版本
npm install @smartabp/lowcode@beta

# 发布alpha版本
npm version prerelease --preid=alpha
npm publish --tag alpha

# 发布RC版本
npm version prerelease --preid=rc
npm publish --tag rc
```

### 查看所有版本

```bash
# 查看所有已发布的版本
npm view @smartabp/lowcode versions

# 查看最新版本
npm view @smartabp/lowcode version

# 查看版本详情
npm view @smartabp/lowcode@1.0.0
```

---

## ❓ 常见问题

### Q1: 发布时提示 "You do not have permission to publish"

**原因**: 没有权限发布到该scope

**解决方案**:
```bash
# 1. 确认已登录
npm whoami

# 2. 确认package.json中的publishConfig
{
  "publishConfig": {
    "access": "public"  // 必须是public
  }
}

# 3. 如果是组织包，确认你在组织中
# 访问 https://www.npmjs.com/settings/smartabp/members
```

### Q2: 发布时提示 "package already exists"

**原因**: 包名已被占用

**解决方案**:
```bash
# 1. 更改包名
# 在package.json中修改name字段

# 2. 或者使用scope
{
  "name": "@your-username/lowcode"
}
```

### Q3: 发布时提示版本号错误

**原因**: 版本号格式不正确或已存在

**解决方案**:
```bash
# 1. 检查当前远程版本
npm view @smartabp/lowcode version

# 2. 升级版本号
npm version patch

# 3. 重新发布
npm publish --access public
```

### Q4: 如何撤销发布？

**警告**: 发布后24小时内可以撤销，之后不可撤销！

```bash
# 撤销指定版本
npm unpublish @smartabp/lowcode@1.0.0

# 撤销整个包（慎用！）
npm unpublish @smartabp/lowcode --force
```

### Q5: 如何弃用某个版本？

```bash
# 标记版本为已弃用
npm deprecate @smartabp/lowcode@1.0.0 "请升级到1.1.0"

# 用户安装时会看到警告
npm WARN deprecated @smartabp/lowcode@1.0.0: 请升级到1.1.0
```

### Q6: 如何发布私有包？

```bash
# 1. 修改publishConfig
{
  "publishConfig": {
    "access": "restricted"  // 私有包
  }
}

# 2. 需要付费账号
# 访问 https://www.npmjs.com/products

# 3. 发布
npm publish
```

---

## 🤖 自动化发布

### 使用GitHub Actions自动发布

创建 `.github/workflows/publish.yml`：

```yaml
name: Publish to NPM

on:
  push:
    tags:
      - 'v*'  # 当推送标签 v1.0.0 时触发

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Build packages
        run: npm run build:packages

      - name: Publish packages
        run: |
          cd src/SmartAbp.Vue/packages
          for pkg in metadata-core lowcode-shared lowcode-api lowcode-core lowcode-designer lowcode-tools; do
            cd $pkg
            npm publish --access public
            cd ..
          done
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

配置NPM Token：
1. 在NPM生成访问令牌
2. 在GitHub仓库设置中添加Secret：`NPM_TOKEN`

使用方式：
```bash
# 1. 升级版本并打标签
npm version patch
git push --follow-tags

# 2. GitHub Actions自动发布
```

### 使用Changesets管理版本（推荐）

安装Changesets：
```bash
npm install @changesets/cli -D
npx changeset init
```

使用流程：
```bash
# 1. 创建changeset
npx changeset
# 选择要升级的包和版本类型

# 2. 提交changeset
git add .
git commit -m "chore: add changeset"

# 3. 发布（会自动升级版本并发布）
npx changeset version
npx changeset publish
```

---

## 📋 发布检查清单

发布前请确认：

- [ ] ✅ 已注册并登录NPM账号
- [ ] ✅ package.json配置完整
- [ ] ✅ 代码已构建（dist目录存在）
- [ ] ✅ 所有测试通过
- [ ] ✅ TypeScript编译0错误
- [ ] ✅ README.md完善
- [ ] ✅ LICENSE文件存在
- [ ] ✅ 版本号已更新
- [ ] ✅ publishConfig设置为public
- [ ] ✅ 使用npm pack验证文件列表
- [ ] ✅ CHANGELOG.md已更新（推荐）

发布后请验证：

- [ ] ✅ NPM官网显示正常
- [ ] ✅ 新项目可以正常安装
- [ ] ✅ TypeScript类型正常
- [ ] ✅ 功能测试通过

---

## 🎯 快速命令参考

```bash
# 登录NPM
npm login

# 查看登录状态
npm whoami

# 查看包信息
npm view @smartabp/lowcode

# 测试发布（不实际发布）
npm pack --dry-run

# 发布包
npm publish --access public

# 升级版本
npm version patch   # 修订版
npm version minor   # 次版本
npm version major   # 主版本

# 撤销发布
npm unpublish @smartabp/lowcode@1.0.0

# 弃用版本
npm deprecate @smartabp/lowcode@1.0.0 "消息"
```

---

## 📞 获取帮助

- **NPM官方文档**: https://docs.npmjs.com/
- **语义化版本规范**: https://semver.org/
- **NPM支持**: https://www.npmjs.com/support

---

**文档版本**: v1.0  
**最后更新**: 2025-10-11  
**维护者**: SmartAbp Team

