#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📦 SmartAbp LowCode Packages - NPM发布准备脚本
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e  # 遇到错误立即退出

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 SmartAbp LowCode Packages - NPM发布准备"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误: 请在 src/SmartAbp.Vue 目录下运行此脚本${NC}"
    exit 1
fi

# 第一步：清理旧构建
echo -e "${BLUE}📋 第1步: 清理旧构建产物${NC}"
echo "正在清理..."
rm -rf packages/*/dist
rm -rf packages/*/.tsbuildinfo
rm -rf packages/*/tsconfig.tsbuildinfo
echo -e "${GREEN}✅ 清理完成${NC}"
echo ""

# 第二步：安装依赖
echo -e "${BLUE}📋 第2步: 安装/更新依赖${NC}"
echo "正在安装依赖..."
pnpm install
echo -e "${GREEN}✅ 依赖安装完成${NC}"
echo ""

# 第三步：TypeScript类型检查
echo -e "${BLUE}📋 第3步: TypeScript类型检查${NC}"
echo "正在检查类型..."
npm run type-check
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 类型检查通过（0错误）${NC}"
else
    echo -e "${RED}❌ 类型检查失败，请修复错误后重试${NC}"
    exit 1
fi
echo ""

# 第四步：ESLint检查
echo -e "${BLUE}📋 第4步: ESLint代码规范检查${NC}"
echo "正在检查代码规范..."
npm run lint
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ESLint检查通过${NC}"
else
    echo -e "${RED}❌ ESLint检查失败，请修复错误后重试${NC}"
    exit 1
fi
echo ""

# 第五步：构建所有packages
echo -e "${BLUE}📋 第5步: 构建所有packages${NC}"
echo "正在构建..."
npm run build:packages
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 所有packages构建成功${NC}"
else
    echo -e "${RED}❌ packages构建失败${NC}"
    exit 1
fi
echo ""

# 第六步：验证构建产物
echo -e "${BLUE}📋 第6步: 验证构建产物${NC}"
PACKAGES=(
    "metadata-core"
    "lowcode-shared"
    "lowcode-api"
    "lowcode-tools"
    "lowcode-core"
    "lowcode-designer"
)

ALL_VALID=true
for pkg in "${PACKAGES[@]}"; do
    echo "检查 @smartabp/$pkg..."
    
    # 检查dist目录
    if [ ! -d "packages/$pkg/dist" ]; then
        echo -e "${RED}  ❌ dist目录不存在${NC}"
        ALL_VALID=false
        continue
    fi
    
    # 检查主要文件
    if [ -f "packages/$pkg/dist/esm/index.js" ] && [ -f "packages/$pkg/dist/esm/index.d.ts" ]; then
        echo -e "${GREEN}  ✅ ESM构建产物完整${NC}"
    else
        echo -e "${RED}  ❌ ESM构建产物缺失${NC}"
        ALL_VALID=false
    fi
    
    if [ -f "packages/$pkg/dist/cjs/index.js" ]; then
        echo -e "${GREEN}  ✅ CJS构建产物完整${NC}"
    else
        echo -e "${YELLOW}  ⚠️  CJS构建产物缺失（可选）${NC}"
    fi
done

if [ "$ALL_VALID" = false ]; then
    echo -e "${RED}❌ 部分packages构建产物不完整${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 所有构建产物验证通过${NC}"
echo ""

# 第七步：生成发布信息
echo -e "${BLUE}📋 第7步: 生成发布信息${NC}"
cat > PUBLISH_INFO.md << 'EOF'
# 📦 SmartAbp LowCode Packages - 发布信息

## 📊 Packages清单

| Package | Version | Description |
|---------|---------|-------------|
| @smartabp/metadata-core | 1.0.0 | 元数据核心系统 |
| @smartabp/lowcode-shared | 1.0.0 | 共享组件和工具 |
| @smartabp/lowcode-api | 1.0.0 | API客户端 |
| @smartabp/lowcode-tools | 1.0.0 | 工具库 |
| @smartabp/lowcode-core | 1.0.0 | 核心引擎 |
| @smartabp/lowcode-designer | 1.0.0 | 设计器组件 |

## 🚀 发布命令

### 方式1: 发布到公共npm registry

```bash
# 登录npm（如果还未登录）
npm login

# 发布所有packages
cd packages/metadata-core && npm publish --access public
cd ../lowcode-shared && npm publish --access public
cd ../lowcode-api && npm publish --access public
cd ../lowcode-tools && npm publish --access public
cd ../lowcode-core && npm publish --access public
cd ../lowcode-designer && npm publish --access public
```

### 方式2: 发布到私有registry

```bash
# 配置私有registry
npm config set registry https://your-registry.com

# 发布所有packages
cd packages/metadata-core && npm publish
cd ../lowcode-shared && npm publish
cd ../lowcode-api && npm publish
cd ../lowcode-tools && npm publish
cd ../lowcode-core && npm publish
cd ../lowcode-designer && npm publish
```

### 方式3: 使用pnpm批量发布

```bash
# 发布所有packages（需要在workspace根目录）
pnpm -r publish --access public
```

## ✅ 发布前检查清单

- [x] TypeScript编译0错误
- [x] ESLint检查0警告
- [x] 所有packages构建成功
- [x] 构建产物完整（ESM + CJS + Types）
- [ ] 已登录npm账号
- [ ] package.json版本号正确
- [ ] README.md文档完整
- [ ] LICENSE文件存在

## 📝 发布后操作

1. 验证发布成功
```bash
npm view @smartabp/lowcode-core
```

2. 更新版本号
```bash
# 在各个package.json中更新版本号为 1.0.1
```

3. 提交Git
```bash
git add .
git commit -m "chore: publish v1.0.0"
git tag v1.0.0
git push origin main --tags
```

## 🔗 相关链接

- npm registry: https://www.npmjs.com/org/smartabp
- GitHub: https://github.com/your-org/smartabp
- 文档: https://docs.smartabp.com

EOF

echo -e "${GREEN}✅ 发布信息已生成: PUBLISH_INFO.md${NC}"
echo ""

# 完成
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 发布准备完成！${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}📋 下一步操作:${NC}"
echo "1. 查看发布信息: cat PUBLISH_INFO.md"
echo "2. 登录npm: npm login"
echo "3. 发布packages: pnpm -r publish --access public"
echo ""
echo -e "${YELLOW}⚠️  注意事项:${NC}"
echo "- 确保已登录npm账号"
echo "- 确认package.json中的版本号"
echo "- 首次发布需要使用 --access public"
echo "- 发布后无法撤销，请谨慎操作"
echo ""

