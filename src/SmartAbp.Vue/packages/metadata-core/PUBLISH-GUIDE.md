# @smartabp/metadata-core - NPM包发布操作指南

> **版本**: 1.0.0  
> **发布前检查**: ✅ 所有质量门禁通过  
> **准备状态**: 🟢 立即可发布

---

## 🚀 **快速开始（3步发布）**

### 方案A：发布到私有npm仓库（推荐）

```bash
# 步骤1：进入包目录
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Vue/packages/metadata-core

# 步骤2：登录私有npm仓库
npm login --registry=https://your-private-registry.com
# 输入用户名、密码、邮箱

# 步骤3：发布包
npm publish
```

### 方案B：发布到公共npm仓库

```bash
# 步骤1：进入包目录
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Vue/packages/metadata-core

# 步骤2：登录npm（首次）
npm login
# 输入npm账号、密码、邮箱
# 验证：输入npm发送的OTP验证码

# 步骤3：检查包名是否可用
npm view @smartabp/metadata-core
# 如果显示404，说明包名可用

# 步骤4：发布包
npm publish
```

### 方案C：Monorepo内部引用（当前方式，无需操作）

```json
// lowcode-shared/package.json
{
  "dependencies": {
    "@smartabp/metadata-core": "workspace:*"
  }
}
```

---

## ✅ **发布前自动检查（已配置）**

执行 `npm publish` 时，`prepublishOnly` 钩子会自动运行：

```bash
✅ 1. TypeScript类型检查: npm run type-check
✅ 2. ESLint代码规范: npm run lint
✅ 3. 单元测试: npm run test (135个测试用例)
✅ 4. 构建产物: npm run build
```

**任何一项失败，发布将自动中止！**

---

## 📦 **发布后验证**

### 验证包是否发布成功

```bash
# 查看包信息
npm view @smartabp/metadata-core

# 查看包版本
npm view @smartabp/metadata-core version

# 查看包详情
npm info @smartabp/metadata-core
```

### 在其他项目中安装测试

```bash
# 创建测试项目
mkdir test-metadata-core && cd test-metadata-core
npm init -y

# 安装包
npm install @smartabp/metadata-core

# 测试引用
node -e "console.log(require('@smartabp/metadata-core'))"
```

---

## 🔧 **私有仓库配置（如使用方案A）**

### 1. 配置私有仓库地址

**方式一：全局配置**
```bash
npm config set registry https://your-private-registry.com
```

**方式二：项目级配置**（推荐）
```bash
# 在 metadata-core/目录下创建 .npmrc
echo "registry=https://your-private-registry.com" > .npmrc
```

**方式三：只为 @smartabp scope 配置**
```bash
npm config set @smartabp:registry https://your-private-registry.com
```

### 2. 常见私有仓库

**Verdaccio（开源）**:
```bash
registry=http://localhost:4873
```

**GitLab Package Registry**:
```bash
@smartabp:registry=https://gitlab.com/api/v4/projects/PROJECT_ID/packages/npm/
//gitlab.com/api/v4/projects/PROJECT_ID/packages/npm/:_authToken=${GITLAB_TOKEN}
```

**GitHub Package Registry**:
```bash
@smartabp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**Azure Artifacts**:
```bash
registry=https://pkgs.dev.azure.com/ORGANIZATION/_packaging/FEED/npm/registry/
```

### 3. 身份认证

**方式一：交互式登录**
```bash
npm login --registry=https://your-private-registry.com
```

**方式二：使用Token（CI/CD）**
```bash
# .npmrc
//your-private-registry.com/:_authToken=${NPM_TOKEN}
```

---

## 📝 **package.json 发布配置说明**

当前配置已优化，无需修改：

```json
{
  "name": "@smartabp/metadata-core",
  "version": "1.0.0",
  
  // ✅ 发布配置
  "publishConfig": {
    "access": "public",  // 如果是私有包，改为 "restricted"
    "registry": "https://registry.npmjs.org/"  // 可修改为私有仓库地址
  },
  
  // ✅ 发布文件白名单
  "files": [
    "dist",       // 构建产物
    "README.md",  // 说明文档
    "LICENSE"     // 许可证
  ],
  
  // ✅ 发布前自动检查
  "scripts": {
    "prepublishOnly": "npm run type-check && npm run lint && npm run test && npm run build"
  }
}
```

---

## 🔄 **版本管理最佳实践**

### 语义化版本（Semantic Versioning）

```
主版本号.次版本号.修订号
  Major . Minor . Patch
```

**版本升级规则**:
- **Patch (1.0.X)**: Bug修复，向后兼容
  ```bash
  npm version patch  # 1.0.0 → 1.0.1
  ```

- **Minor (1.X.0)**: 新功能，向后兼容
  ```bash
  npm version minor  # 1.0.0 → 1.1.0
  ```

- **Major (X.0.0)**: 破坏性变更
  ```bash
  npm version major  # 1.0.0 → 2.0.0
  ```

### 自动版本升级 + 发布

```bash
# 升级版本并发布
npm version patch && npm publish

# 或使用 npm-version-up 工具
npx npm-version-up patch
npm publish
```

---

## 🛡️ **安全建议**

### 1. 发布前检查清单

```bash
☑️ 确认无敏感信息（API密钥、密码等）
☑️ 确认LICENSE文件存在
☑️ 确认README.md完整
☑️ 确认.npmignore或files配置正确
☑️ 确认所有测试通过
☑️ 确认TypeScript编译无错误
```

### 2. 使用 npm-check 检查

```bash
# 安装检查工具
npm install -g npm-check

# 检查包信息
npm-check

# 检查依赖安全性
npm audit
```

### 3. 使用 .npmignore 排除文件

如果需要更精细的控制，创建 `.npmignore`:

```bash
# .npmignore
src/
__tests__/
*.test.ts
*.spec.ts
tsconfig.json
tsup.config.ts
vitest.config.ts
.gitignore
.eslintrc.*
```

---

## 🔥 **常见问题与解决方案**

### Q1: 发布时提示 "You do not have permission to publish"

**解决方案**:
```bash
# 检查登录状态
npm whoami

# 重新登录
npm logout
npm login

# 检查包名是否被占用
npm view @smartabp/metadata-core
```

### Q2: 发布时提示 "Package name too similar to existing package"

**解决方案**:
```bash
# 修改包名，在 package.json 中
{
  "name": "@smartabp/metadata-core-v2"  // 或其他名称
}
```

### Q3: 如何撤销已发布的版本？

**解决方案**:
```bash
# 撤销指定版本（发布后24小时内）
npm unpublish @smartabp/metadata-core@1.0.0

# 撤销整个包（慎用！）
npm unpublish @smartabp/metadata-core --force
```

### Q4: 如何发布预发布版本（beta/alpha）？

**解决方案**:
```bash
# 修改版本号
npm version prerelease --preid=beta  # 1.0.0 → 1.0.1-beta.0

# 发布到beta标签
npm publish --tag beta

# 用户安装
npm install @smartabp/metadata-core@beta
```

### Q5: 如何更新已发布包的README？

**解决方案**:
```bash
# 方式一：发布新版本（推荐）
npm version patch
npm publish

# 方式二：只更新README（不推荐，某些仓库支持）
npm publish --tag latest --access public
```

---

## 🚀 **CI/CD自动发布（高级）**

### GitHub Actions示例

创建 `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
        working-directory: src/SmartAbp.Vue/packages/metadata-core
      
      - name: Publish to npm
        run: npm publish
        working-directory: src/SmartAbp.Vue/packages/metadata-core
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 使用方法

```bash
# 创建Git标签
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions自动发布
```

---

## 📊 **发布后监控**

### 1. npm包下载统计

访问：https://www.npmjs.com/package/@smartabp/metadata-core

### 2. 使用 npm-stat 查看下载量

```bash
npx npm-stat @smartabp/metadata-core
```

### 3. 使用 bundlephobia 查看包体积

访问：https://bundlephobia.com/package/@smartabp/metadata-core

---

## ✅ **立即执行命令（完整流程）**

### 发布到公共npm仓库（3分钟完成）

```bash
# 1. 进入包目录
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Vue/packages/metadata-core

# 2. 最终检查
npm run type-check && npm run test && npm run build

# 3. 登录npm（首次）
npm login

# 4. 发布包
npm publish

# 5. 验证发布
npm view @smartabp/metadata-core
```

### 发布到私有仓库（需要先配置）

```bash
# 1. 进入包目录
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Vue/packages/metadata-core

# 2. 配置私有仓库（二选一）
# 方式一：全局配置
npm config set registry https://your-private-registry.com

# 方式二：创建.npmrc文件
echo "registry=https://your-private-registry.com" > .npmrc

# 3. 登录
npm login

# 4. 发布
npm publish

# 5. 验证
npm view @smartabp/metadata-core
```

---

## 🎯 **下一步建议**

### 立即执行（高优先级）
1. ✅ 选择发布方案（私有仓库/公共仓库）
2. ✅ 执行发布命令
3. ✅ 验证发布成功

### 后续优化（中优先级）
1. 📝 完善CHANGELOG.md
2. 🔄 配置CI/CD自动发布
3. 📊 监控包使用情况

### 其他子包（低优先级）
1. @smartabp/lowcode-shared
2. @smartabp/lowcode-core
3. @smartabp/lowcode-designer

---

**准备就绪！立即开始发布！** 🚀

