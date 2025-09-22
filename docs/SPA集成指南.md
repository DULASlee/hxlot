# SmartAbp SPA 集成说明

本文档说明如何在 ABP vNext 项目中集成 Vue.js 单页应用程序 (SPA)。

## 集成内容

### 1. 后端修改

#### 添加的 NuGet 包
- `Microsoft.AspNetCore.SpaServices.Extensions` - 提供 SPA 中间件支持

#### 修改的文件
- `SmartAbp.Web.csproj` - 添加了 SPA 服务扩展包
- `SmartAbpWebModule.cs` - 添加了 SPA 配置和中间件

#### 新增的文件
- `Controllers/HomeController.cs` - 默认 MVC 控制器
- `Views/Home/Index.cshtml` - 默认视图页面

### 2. 前端修改

#### 修改的文件
- `vite.config.ts` - 配置开发服务器端口和构建输出目录

### 3. 开发工具

#### 启动脚本
- `start-dev.bat` - Windows 批处理启动脚本
- `start-dev.ps1` - PowerShell 启动脚本

## 工作原理

### 开发环境
1. 后端 ASP.NET Core 应用运行在默认端口（通常是 https://localhost:44300）
2. 前端 Vue 应用运行在端口 11369
3. SPA 中间件将前端请求代理到 Vue 开发服务器
4. API 请求直接由后端处理

### 生产环境
1. Vue 应用构建后的文件放在 `wwwroot/dist` 目录
2. SPA 中间件直接提供静态文件
3. 所有路由首先尝试匹配 MVC 控制器和 Razor 页面
4. 未匹配的路由由 SPA 处理

## 使用方法

### 开发环境启动

#### 方法 1: 使用启动脚本
```bash
# Windows 批处理
./start-dev.bat

# PowerShell
./start-dev.ps1
```

#### 方法 2: 手动启动
```bash
# 启动后端
cd src/SmartAbp.Web
dotnet run

# 启动前端（新终端窗口）
cd src/SmartAbp.Vue
npm run dev
```

### 生产环境部署

1. 构建 Vue 应用：
```bash
cd src/SmartAbp.Vue
npm run build
```

2. 构建并发布 .NET 应用：
```bash
cd src/SmartAbp.Web
dotnet publish -c Release
```

## 路由配置

### MVC 路由
- 默认路由: `{controller=Home}/{action=Index}/{id?}`
- API 路由: `/api/*`
- Razor 页面路由

### SPA 路由
- 所有未被 MVC/API 匹配的路由都会被 SPA 处理
- Vue Router 负责前端路由

## 注意事项

1. **端口配置**: 确保 Vue 开发服务器端口 (11369) 与 `SmartAbpWebModule.cs` 中的配置一致

2. **CORS 配置**: 如果需要跨域访问，请在 ABP 配置中添加 CORS 设置

3. **认证集成**: SPA 可以使用 ABP 的 OpenIddict 认证系统

4. **API 调用**: 前端可以直接调用后端的 ABP API 接口

## 故障排除

### 常见问题

1. **前端无法访问**: 检查 Vue 开发服务器是否在端口 11369 运行
2. **API 调用失败**: 检查后端服务是否正常运行
3. **路由冲突**: 确保 SPA 路由不与 MVC 路由冲突

### 调试建议

1. 检查浏览器开发者工具的网络选项卡
2. 查看后端和前端的控制台输出
3. 确认所有依赖包都已正确安装

## 扩展开发

现在您可以：

1. 在 `src/SmartAbp.Vue` 中开发 Vue.js 前端应用
2. 在后端添加新的 API 控制器和服务
3. 使用 ABP 的模块化架构扩展功能
4. 集成 ABP 的认证、授权、多租户等功能

## 相关文档

- [ABP vNext 官方文档](https://docs.abp.io/)
- [Vue.js 官方文档](https://vuejs.org/)
- [ASP.NET Core SPA 服务](https://docs.microsoft.com/en-us/aspnet/core/client-side/spa-services)