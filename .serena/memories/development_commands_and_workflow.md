# SmartAbp开发命令和工作流程

## 项目启动命令

### 前端开发 (src/SmartAbp.Vue/)
```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

### 后端开发 (src/SmartAbp.Web/)
```bash
# 运行Web应用
dotnet run

# 开发模式运行
dotnet watch run

# 构建项目
dotnet build

# 清理构建
dotnet clean
```

## 质量保证命令

### 前端质量检查
```bash
# TypeScript类型检查
npm run type-check

# ESLint代码检查和修复
npm run lint

# Prettier代码格式化
npm run format

# 单元测试
npm run test

# 测试覆盖率
npm run test:coverage

# E2E测试
npm run cypress:open
npm run cypress:run

# 完整质量检查
npm run qa:check
```

### 后端质量检查
```bash
# 运行所有测试
dotnet test

# 测试覆盖率
dotnet test --collect:"XPlat Code Coverage"

# 代码分析
dotnet build --verbosity normal
```

## 代码生成命令

### 模板和代码生成
```bash
# 验证模板
npm run template:validate

# 构建模板索引
npm run template:index

# 搜索模板
npm run template:search

# 运行代码生成
npm run codegen

# 检查代码生成
npm run codegen:check

# 添加新模块
npm run module:add

# 添加模块并生成代码
npm run module:add:codegen
```

## 专家模式命令

### 质量保证和专家验证
```bash
# 专家模式预检
npm run expert:preflight

# 自动专家模式
npm run expert:auto

# 专家模式最终验证
npm run expert:finalize

# 完整专家验证
npm run expert:verify
```

## 性能分析命令

### 前端性能分析
```bash
# 完整性能分析
npm run perf:analyze

# Bundle分析
npm run perf:bundle

# 构建性能分析
npm run perf:build

# Lighthouse分析
npm run perf:lighthouse

# Bundle可视化
npm run bundle:visualize

# 分析模式构建
npm run build:analyze
```

## 安全检查命令

### 安全验证
```bash
# 安全检查
npm run security-check

# 输入验证检查
npm run validate-inputs

# 危险模式检查
npm run dangerous-patterns
```

## Storybook开发

### 组件文档和测试
```bash
# 启动Storybook
npm run storybook

# 构建Storybook
npm run storybook:build

# 运行Storybook测试
npm run storybook:test

# 部署到Chromatic
npm run chromatic
```

## API生成命令

### API客户端生成
```bash
# 生成API客户端 (Windows)
npm run gen:api

# 生成API客户端 (CI)
npm run gen:api:ci

# 检查API客户端漂移
npm run gen:api:check
```

## 部署命令

### 部署准备
```bash
# 最终验证
npm run validate:final

# 部署准备
npm run deploy:prepare
```

## Git工作流

### 提交前检查
```bash
# 预提交检查
npm run precommit-check

# Husky会自动运行:
# - TypeScript类型检查
# - ESLint检查
# - 测试覆盖率
# - Prettier格式化
```

## 开发环境要求

### Node.js版本
- Node.js: ^20.19.0 || >=22.12.0
- npm: 最新版本

### .NET版本
- .NET: 8.0 SDK
- Visual Studio 2022 或 VS Code

## 常用开发工作流

### 1. 新功能开发
```bash
# 1. 创建功能分支
git checkout -b feature/new-feature

# 2. 前端开发
cd src/SmartAbp.Vue
npm run dev

# 3. 后端开发 (新终端)
cd src/SmartAbp.Web
dotnet watch run

# 4. 质量检查
npm run qa:check

# 5. 提交代码
git add .
git commit -m "feat: add new feature"
```

### 2. Bug修复
```bash
# 1. 运行测试定位问题
npm run test
dotnet test

# 2. 修复代码

# 3. 验证修复
npm run test:coverage
npm run cypress:run

# 4. 提交修复
git commit -m "fix: resolve issue"
```

### 3. 代码生成开发
```bash
# 1. 验证模板
npm run template:validate

# 2. 生成代码
npm run codegen

# 3. 测试生成的代码
npm run test
dotnet test

# 4. 专家模式验证
npm run expert:verify
```

## 环境变量配置

### 前端环境变量 (.env)
```bash
VITE_API_BASE_URL=https://localhost:7001
VITE_APP_TITLE=SmartAbp
VITE_APP_VERSION=1.0.0
```

### 后端配置 (appsettings.json)
```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Database=SmartAbp;Trusted_Connection=true;"
  },
  "CodeGenerator": {
    "OutputPath": "./Generated",
    "TemplatesPath": "./templates",
    "EnableOptimizations": true
  }
}
```