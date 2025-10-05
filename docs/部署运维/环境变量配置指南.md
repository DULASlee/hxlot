# SmartAbp 环境变量配置指南

## 📋 概述

本文档提供 SmartAbp 项目的环境变量配置指南，帮助开发者正确配置不同环境下的应用参数。

## 🚀 快速开始

### 1. 创建环境变量文件

```bash
# 在项目根目录创建 .env 文件
cp .env.template .env
```

### 2. 配置基础参数

```env
# 基础环境配置
ASPNETCORE_ENVIRONMENT=Development
NODE_ENV=development

# API配置
VITE_API_BASE_URL=https://localhost:44379
```

## 🌍 环境配置分类

### 🔗 后端API配置

```env
# API基础地址
VITE_API_BASE_URL=https://localhost:44379
API_BASE_URL=https://localhost:44379

# SignalR Hub地址
VITE_SIGNALR_HUB_URL=https://localhost:44379/signalr-hubs
```

### 💾 数据库配置

```env
# 主数据库连接
CONNECTION_STRING=Server=localhost;Database=SmartAbp;Trusted_Connection=true;MultipleActiveResultSets=true

# Redis缓存
REDIS_CONNECTION_STRING=localhost:6379

# 测试数据库
TEST_CONNECTION_STRING=Server=localhost;Database=SmartAbp_Test;Trusted_Connection=true;MultipleActiveResultSets=true
```

### 🔐 认证配置

```env
# JWT配置
JWT_SECRET_KEY=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRATION_HOURS=24

# 管理员默认密码
ADMIN_DEFAULT_PASSWORD=1q2w3E*
```

### 🎯 低代码引擎配置

```env
# 代码生成配置
CODEGEN_OUTPUT_PATH=./generated
TEMPLATE_STORAGE_PATH=./templates

# 设计器配置
DESIGNER_CACHE_ENABLED=true
DESIGNER_CACHE_SIZE=100
```

### 🚀 前端开发配置

```env
# 开发服务器
VITE_DEV_PORT=11369
VITE_HMR_ENABLED=true
VITE_DEVTOOLS_ENABLED=true
```

### 🔧 开发工具配置

```env
# 调试工具
VERBOSE_LOGGING=true
PERFORMANCE_PROFILING=false
SWAGGER_ENABLED=true
MINI_PROFILER_ENABLED=true
```

## 📁 环境文件结构

```
项目根目录/
├── .env.template          # 环境变量模板
├── .env                   # 本地开发环境 (不提交)
├── .env.development       # 开发环境
├── .env.staging          # 测试环境
├── .env.production       # 生产环境
└── docs/
    └── environment-variables.md  # 本文档
```

## 🔒 安全最佳实践

### 1. 密钥管理

```env
# ❌ 不安全的密钥
JWT_SECRET_KEY=123456

# ✅ 安全的密钥 (32字符以上)
JWT_SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

### 2. 生产环境配置

```env
# 生产环境必须配置项
ASPNETCORE_ENVIRONMENT=Production
JWT_SECRET_KEY=${SECRET_FROM_AZURE_KEY_VAULT}
CONNECTION_STRING=${DB_CONNECTION_FROM_AZURE_KEY_VAULT}
```

### 3. 敏感信息处理

- 使用 Azure Key Vault 存储敏感信息
- 定期更新密钥和密码
- 启用访问日志审计

## 🌐 不同环境配置

### 开发环境 (.env.development)

```env
ASPNETCORE_ENVIRONMENT=Development
VITE_API_BASE_URL=https://localhost:44379
VERBOSE_LOGGING=true
SWAGGER_ENABLED=true
```

### 测试环境 (.env.staging)

```env
ASPNETCORE_ENVIRONMENT=Staging
VITE_API_BASE_URL=https://staging-api.smartabp.com
VERBOSE_LOGGING=false
SWAGGER_ENABLED=true
```

### 生产环境 (.env.production)

```env
ASPNETCORE_ENVIRONMENT=Production
VITE_API_BASE_URL=https://api.smartabp.com
VERBOSE_LOGGING=false
SWAGGER_ENABLED=false
```

## 🔧 配置验证

### 1. 配置检查脚本

```bash
# 检查必需的环境变量
npm run validate-env
```

### 2. 启动时验证

```typescript
// 前端环境变量验证
const requiredEnvVars = [
  'VITE_API_BASE_URL',
  'VITE_SIGNALR_HUB_URL'
];

requiredEnvVars.forEach(varName => {
  if (!import.meta.env[varName]) {
    throw new Error(`缺少必需的环境变量: ${varName}`);
  }
});
```

## 📊 功能开关配置

### 特性开关

```env
# 核心功能
FEATURE_CODE_GENERATOR=true
FEATURE_VISUAL_DESIGNER=true

# 高级功能
FEATURE_ADVANCED_PERMISSIONS=false
FEATURE_MULTI_TENANCY=false

# 实验性功能
FEATURE_AI_ASSISTANT=false
FEATURE_COLLABORATION=false
```

### 性能配置

```env
# 缓存配置
CACHING_ENABLED=true
CACHE_EXPIRATION_MINUTES=30

# 压缩配置
COMPRESSION_ENABLED=true

# 日志配置
LOG_LEVEL=Information
LOG_FILE_SIZE_LIMIT=10
```

## 🐳 Docker 环境配置

### docker-compose.yml

```yaml
version: '3.8'
services:
  smartabp-web:
    environment:
      - ASPNETCORE_ENVIRONMENT=${ASPNETCORE_ENVIRONMENT}
      - CONNECTION_STRING=${CONNECTION_STRING}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
    env_file:
      - .env
```

## 🧪 测试环境配置

### 单元测试

```env
# 测试专用配置
TEST_CONNECTION_STRING=Server=localhost;Database=SmartAbp_Test;Trusted_Connection=true
TEST_API_BASE_URL=https://localhost:44380
```

### 集成测试

```env
# 集成测试环境
INTEGRATION_TEST_ENABLED=true
TEST_DATABASE_RESET=true
```

## 📝 配置文档维护

### 1. 更新流程

1. 修改环境变量时更新此文档
2. 更新 `.env.template` 文件
3. 通知团队成员更新本地配置

### 2. 版本控制

- `.env.template` 提交到版本控制
- `.env` 文件不提交到版本控制
- 环境特定配置文件可选择性提交

## 🚨 故障排除

### 常见问题

1. **API连接失败**
   ```bash
   # 检查API地址配置
   echo $VITE_API_BASE_URL
   ```

2. **数据库连接失败**
   ```bash
   # 检查连接字符串
   echo $CONNECTION_STRING
   ```

3. **认证失败**
   ```bash
   # 检查JWT配置
   echo $JWT_SECRET_KEY
   ```

### 调试技巧

```typescript
// 前端环境变量调试
console.log('环境变量:', import.meta.env);

// 后端环境变量调试
Console.WriteLine($"API地址: {Configuration["API_BASE_URL"]}");
```

## 📞 支持和反馈

如有配置问题或建议，请：

1. 检查此文档
2. 查看项目 README
3. 联系开发团队
4. 提交 Issue

---

**注意**: 请确保所有敏感信息都通过安全的方式管理，避免在代码中硬编码密钥和密码。
