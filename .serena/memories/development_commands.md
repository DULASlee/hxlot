# SmartAbp 开发命令清单

## 前端开发命令 (Vue项目)

### 开发与构建
```bash
npm run dev         # 启动开发服务器
npm run build       # 构建生产版本
npm run preview     # 预览构建结果
npm run build-only  # 仅构建，不进行类型检查
```

### 代码质量检查
```bash
npm run type-check  # TypeScript类型检查
npm run lint        # ESLint代码检查和修复
npm run format      # Prettier代码格式化
```

### 测试
```bash
npm run test          # 运行单元测试 (Vitest)
npm run test:ui       # 运行测试UI界面
npm run test:run      # 运行测试(一次性)
npm run test:coverage # 运行测试并生成覆盖率报告
npm run cypress:open  # 打开Cypress测试界面
npm run cypress:run   # 运行Cypress测试
```

### Git钩子
```bash
npm run prepare     # 安装Husky Git钩子
```

## 后端开发命令 (.NET)

### 运行和构建
```bash
dotnet run          # 运行项目
dotnet build        # 构建项目
dotnet test         # 运行测试
```

### 数据库迁移
```bash
dotnet ef migrations add <MigrationName>    # 添加迁移
dotnet ef database update                  # 更新数据库
```

## 项目开发铁律命令序列

### 每次代码修改后必须执行
```bash
npm run build        # 1. 构建验证
npm run type-check   # 2. 类型检查
npm run lint --fix   # 3. 代码规范检查和修复
npm run dev          # 4. 启动开发服务器手动测试
```