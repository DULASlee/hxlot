# SmartAbp NPM 发布脚本

本目录包含用于发布SmartAbp packages到NPM公共仓库的自动化脚本。

## 📋 脚本列表

### 1. `check-before-publish.sh` - 发布前检查

**功能**: 检查包是否准备好发布

**用法**:
```bash
# 检查当前目录的包
./scripts/publish/check-before-publish.sh

# 检查指定目录的包
./scripts/publish/check-before-publish.sh src/SmartAbp.Vue/packages/lowcode-core
```

**检查项**:
- ✅ package.json 存在性和完整性
- ✅ 必要字段（name, version, description, main, types）
- ✅ dist 构建产物
- ✅ .npmignore 或 files 配置
- ✅ README.md 文档
- ✅ LICENSE 许可证
- ✅ NPM登录状态
- ✅ 包名可用性
- ✅ 版本号冲突检查
- ✅ publishConfig 配置
- ✅ 发布内容预览

### 2. `publish-all-packages.sh` - 批量发布

**功能**: 按依赖关系顺序发布所有packages

**用法**:
```bash
# 试运行（不实际发布）
./scripts/publish/publish-all-packages.sh --dry-run

# 实际发布
./scripts/publish/publish-all-packages.sh
```

**特性**:
- 🔄 按依赖关系自动排序
- ✅ 自动跳过已存在的版本
- 📊 发布统计报告
- 🔐 自动检查登录状态
- 🎨 彩色输出，易读

**发布顺序**:
1. metadata-core（零依赖）
2. lowcode-shared（依赖metadata-core）
3. lowcode-api（依赖shared）
4. lowcode-tools（依赖shared）
5. lowcode-core（依赖shared）
6. lowcode-designer（依赖shared+core）

## 🚀 快速开始

### 前置准备

1. **注册NPM账号**
   ```bash
   # 访问 https://www.npmjs.com/signup 注册
   ```

2. **登录NPM**
   ```bash
   npm login
   # 输入用户名、密码、邮箱
   ```

3. **构建所有packages**
   ```bash
   cd src/SmartAbp.Vue
   npm run build:packages
   ```

### 发布流程

#### 方式一：单个包发布

```bash
# 1. 检查包是否就绪
./scripts/publish/check-before-publish.sh src/SmartAbp.Vue/packages/lowcode-core

# 2. 如果检查通过，发布
cd src/SmartAbp.Vue/packages/lowcode-core
npm publish --access public
```

#### 方式二：批量发布（推荐）

```bash
# 1. 试运行（查看将要发布的内容）
./scripts/publish/publish-all-packages.sh --dry-run

# 2. 确认无误后，实际发布
./scripts/publish/publish-all-packages.sh
```

## 📖 详细文档

完整的NPM发布指南请参考：[NPM公共仓库发布指南.md](../../docs/代码质量检查/NPM公共仓库发布指南.md)

包含内容：
- 📦 NPM账号注册与配置
- ✅ 包发布前检查清单
- 🚀 详细发布流程
- 📈 版本管理最佳实践
- ❓ 常见问题解答
- 🤖 CI/CD自动化发布

## 🔧 脚本权限

首次使用前需要添加执行权限：

```bash
chmod +x scripts/publish/*.sh
```

## 📝 版本升级

在发布前升级版本号：

```bash
cd src/SmartAbp.Vue/packages/lowcode-core

# 修订版本（bug修复）: 1.0.0 → 1.0.1
npm version patch

# 次版本（新功能）: 1.0.0 → 1.1.0
npm version minor

# 主版本（破坏性更新）: 1.0.0 → 2.0.0
npm version major

# 预发布版本: 1.0.0 → 1.0.1-beta.0
npm version prerelease --preid=beta
```

## 🎯 发布检查清单

发布前请确认：

- [ ] ✅ 已登录NPM: `npm whoami`
- [ ] ✅ 代码已构建: `npm run build:packages`
- [ ] ✅ TypeScript编译通过: `npm run type-check`
- [ ] ✅ 所有测试通过: `npm test`
- [ ] ✅ 版本号已更新: `npm version ...`
- [ ] ✅ CHANGELOG已更新
- [ ] ✅ 执行检查脚本: `./scripts/publish/check-before-publish.sh`
- [ ] ✅ 试运行成功: `./scripts/publish/publish-all-packages.sh --dry-run`

## 🔗 相关链接

- **NPM官网**: https://www.npmjs.com/
- **SmartAbp组织**: https://www.npmjs.com/settings/smartabp/packages
- **语义化版本**: https://semver.org/
- **NPM文档**: https://docs.npmjs.com/

## ❓ 常见问题

### Q: 如何撤销发布？

```bash
# 撤销指定版本（24小时内）
npm unpublish @smartabp/lowcode@1.0.0

# 弃用版本（推荐）
npm deprecate @smartabp/lowcode@1.0.0 "请升级到1.1.0"
```

### Q: 发布失败怎么办？

1. 检查网络连接
2. 确认登录状态: `npm whoami`
3. 确认版本号未冲突
4. 检查publishConfig配置
5. 查看详细错误信息

### Q: 如何发布预发布版本？

```bash
# 升级为beta版本
npm version prerelease --preid=beta

# 发布到beta标签
npm publish --tag beta

# 用户安装beta版本
npm install @smartabp/lowcode@beta
```

## 📞 获取帮助

如果遇到问题，请：
1. 查看完整文档：`docs/代码质量检查/NPM公共仓库发布指南.md`
2. 访问NPM官方文档：https://docs.npmjs.com/
3. 联系SmartAbp团队

---

**最后更新**: 2025-10-11  
**维护者**: SmartAbp Team

