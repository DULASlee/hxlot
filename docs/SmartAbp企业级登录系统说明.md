# SmartAbp 企业级用户登录系统

## 🎯 项目概述

SmartAbp是一个基于ABP Framework构建的企业级用户登录系统，提供完整的多租户支持、JWT认证、自动Token刷新等企业级功能。

## 🏗️ 技术架构

### 后端技术栈
- **框架**: ABP Framework 8.x
- **认证**: OpenIddict + JWT
- **数据库**: SQL Server + Entity Framework Core
- **多租户**: ABP多租户架构
- **API**: RESTful API + Swagger

### 前端技术栈
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI组件**: 原生CSS + 响应式设计
- **状态管理**: Vue Composition API
- **HTTP客户端**: Fetch API

## 🚀 快速启动

### 方式一：使用批处理文件
```bash
# 双击运行
启动开发环境.bat
```

### 方式二：手动启动
```bash
# 启动后端
cd src/SmartAbp.Web
dotnet run --urls="https://localhost:44379"

# 启动前端 (新终端)
cd src/SmartAbp.Vue
npm install
npm run dev
```

## 🔑 默认登录信息

- **租户**: 留空 (主机租户)
- **用户名**: admin
- **密码**: 1q2w3E*

## 🌟 核心功能

### 1. 企业级认证
- ✅ JWT Token认证
- ✅ 自动Token刷新 (过期前5分钟)
- ✅ 安全的密码验证
- ✅ 跨域请求支持 (CORS)

### 2. 多租户支持
- ✅ 租户隔离
- ✅ 租户选择登录
- ✅ 租户信息在Token中
- ✅ 动态租户解析

### 3. 用户管理
- ✅ 扩展用户属性 (部门、职位、头像等)
- ✅ 用户信息在Token Claims中
- ✅ 自定义ProfileService
- ✅ 动态Claims处理

### 4. 前端特性
- ✅ 响应式登录界面
- ✅ 实时表单验证
- ✅ 加载状态提示
- ✅ 错误信息显示
- ✅ 自动认证状态管理

## 📁 项目结构

```
SmartAbp/
├── src/
│   ├── SmartAbp.Web/              # 后端Web项目
│   │   ├── Controllers/           # API控制器
│   │   ├── Views/                 # MVC视图
│   │   └── SmartAbpWebModule.cs   # 模块配置
│   ├── SmartAbp.Domain/           # 领域层
│   │   ├── Identity/              # 身份认证
│   │   └── OpenIddict/            # OpenIddict配置
│   ├── SmartAbp.Application/      # 应用服务层
│   ├── SmartAbp.EntityFrameworkCore/ # 数据访问层
│   └── SmartAbp.Vue/              # Vue前端项目
│       ├── src/
│       │   ├── components/        # Vue组件
│       │   ├── utils/             # 工具类
│       │   └── App.vue            # 主应用
│       └── vite.config.ts         # Vite配置
├── 启动开发环境.bat               # 快速启动脚本
└── README.md                      # 项目说明
```

## 🔧 配置说明

### 后端配置 (appsettings.json)
```json
{
  "App": {
    "SelfUrl": "https://localhost:44379",
    "CorsOrigins": "http://localhost:11369,https://localhost:11369"
  },
  "AuthServer": {
    "Authority": "https://localhost:44379",
    "RequireHttpsMetadata": "false"
  }
}
```

### 前端配置 (.env)
```env
VITE_API_BASE_URL=https://localhost:44379
VITE_CLIENT_ID=SmartAbp_App
VITE_SCOPE=SmartAbp
```

## 🛡️ 安全特性

1. **HTTPS支持**: 开发环境使用自签名证书
2. **CORS配置**: 严格的跨域访问控制
3. **JWT安全**: 使用RS256算法签名
4. **Token过期**: 1小时过期时间，自动刷新
5. **输入验证**: 前后端双重验证

## 🔄 认证流程

1. **用户登录**: 输入租户、用户名、密码
2. **后端验证**: ABP Identity验证用户凭据
3. **Token生成**: OpenIddict生成JWT Token
4. **Claims扩展**: 自定义Claims处理器添加企业信息
5. **前端存储**: Token存储在localStorage
6. **自动刷新**: 过期前自动刷新Token
7. **API调用**: 自动在请求头中添加Authorization

## 📊 Token Claims结构

```json
{
  "sub": "用户ID",
  "preferred_username": "用户名",
  "email": "邮箱",
  "role": "角色",
  "tenant_id": "租户ID",
  "tenant_name": "租户名称",
  "display_name": "显示名称",
  "department": "部门",
  "position": "职位",
  "avatar": "头像URL"
}
```

## 🚨 常见问题

### 1. "Failed to fetch" 错误
- 确保后端服务正在运行
- 检查CORS配置
- 信任HTTPS开发证书: `dotnet dev-certs https --trust`

### 2. 登录失败
- 检查用户名密码是否正确
- 确认数据库连接正常
- 查看后端日志获取详细错误信息

### 3. Token过期
- 系统会自动刷新Token
- 如果刷新失败，会自动跳转到登录页面

## 🔮 扩展功能

### 已实现
- [x] 基础登录认证
- [x] 多租户支持
- [x] Token自动刷新
- [x] 自定义Claims
- [x] 响应式UI

### 可扩展
- [ ] 双因素认证 (2FA)
- [ ] 社交登录 (Google, Microsoft)
- [ ] 密码重置功能
- [ ] 用户注册功能
- [ ] 角色权限管理
- [ ] 审计日志
- [ ] 单点登录 (SSO)

## 📞 技术支持

如有问题，请检查：
1. 后端服务是否正常启动
2. 前端开发服务器是否运行
3. 数据库连接是否正常
4. 网络端口是否被占用

---

**SmartAbp企业级用户登录系统** - 为现代企业应用提供安全、可靠的认证解决方案。