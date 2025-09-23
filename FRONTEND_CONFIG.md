# 前端配置说明

## 环境变量配置

### 创建环境配置文件
在 `src/SmartAbp.Vue/` 目录下创建 `.env` 文件：

```bash
# 后端 API 基础地址
VITE_API_BASE_URL=https://localhost:44379

# OpenIddict 客户端配置
VITE_CLIENT_ID=SmartAbp_App
VITE_SCOPE=offline_access roles email profile SmartAbp

# 日志级别
VITE_LOG_LEVEL=debug
```

### 开发环境配置
创建 `.env.development` 文件（可选）：

```bash
# 开发环境专用配置
VITE_API_BASE_URL=https://localhost:44379
VITE_CLIENT_ID=SmartAbp_App
VITE_SCOPE=offline_access roles email profile SmartAbp
VITE_LOG_LEVEL=debug
VITE_USE_MOCK=false
```

## 修复的问题

### 1. API_BASE_URL 不一致
- **问题**: 多个文件中的 API_BASE_URL 指向不同端口 (44397, 44379)
- **修复**: 统一所有配置文件指向 `https://localhost:44379`

### 2. 认证端点错误
- **问题**: 前端向 `:11369/connect/token` 请求（错误端口）
- **修复**: 正确指向后端 `https://localhost:44379/connect/token`

### 3. 环境变量缺失
- **问题**: 缺少 `.env` 配置文件
- **修复**: 提供配置模板和说明

## 验证配置

1. 确保后端在 `https://localhost:44379` 运行
2. 前端应能正常连接到后端认证服务
3. 登录时不再出现 "Failed to load resource: net::ERR_CONNECTION_REFUSED" 错误

## 注意事项

- `.env` 文件通常被 gitignore，需要手动创建
- 确保后端服务已启动且监听 44379 端口
- 如果端口冲突，需要同时修改前后端配置保持一致
