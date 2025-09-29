# SmartAbp 开发脚本目录

## 📁 脚本说明

### 🚀 主要开发脚本

#### `start-dev.bat` - 开发环境启动器
**主要开发启动脚本**，提供完整的环境检查和服务启动功能。

**功能特性**：
- ✅ 自动检测项目路径
- ✅ 验证 .NET 和 Node.js 环境
- ✅ 检查并安装前端依赖
- ✅ 启动后端和前端服务
- ✅ 友好的错误提示和解决方案

**使用方法**：
```bash
# 直接双击运行，或在命令行中执行
scripts\dev\start-dev.bat
```

#### `start-dev-simple.bat` - 简化启动器
**轻量级启动脚本**，提供基础的环境检查和快速启动。

**功能特性**：
- ✅ 基础环境检查
- ✅ 快速启动服务
- ✅ 简洁的用户界面

**使用方法**：
```bash
scripts\dev\start-dev-simple.bat
```

#### `dev-performance-boost.bat` - 性能优化工具
**开发性能提升工具**，清理缓存和优化开发环境。

**功能特性**：
- 🧹 清理 Vite 缓存
- 🧹 清理 TypeScript 缓存
- 🧹 清理依赖缓存
- 🧹 清理构建产物
- 🧹 清理 Packages 缓存
- 🚀 设置性能优化环境变量

**使用时机**：
- 开发服务器启动缓慢
- TypeScript 编译错误
- Vite 热重载异常
- 前端依赖问题

**使用方法**：
```bash
scripts\dev\dev-performance-boost.bat
```

## 🔧 服务地址

- **后端API**: https://localhost:44379
- **前端页面**: http://localhost:11369

## 👤 默认登录信息

- **租户**: 留空 (主机租户)
- **用户名**: admin
- **密码**: 1q2w3E*

## 🛠️ 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 检查端口占用
   netstat -ano | findstr :44379
   netstat -ano | findstr :11369
   ```

2. **依赖安装失败**
   ```bash
   # 清理缓存后重新安装
   scripts\dev\dev-performance-boost.bat
   cd src\SmartAbp.Vue
   npm install
   ```

3. **服务启动失败**
   - 检查 .NET 版本是否为 9.0+
   - 检查 Node.js 版本是否为 18.0+
   - 确保防火墙允许端口访问

### 性能优化建议

1. **系统配置**
   - 使用 SSD 硬盘
   - 内存建议 16GB+
   - 关闭不必要的杀毒实时监控

2. **开发环境**
   - 定期运行 `dev-performance-boost.bat`
   - 避免在项目目录下存放大文件
   - 使用现代化的终端工具

## 📚 相关文档

- [前端框架优化开发计划](../../docs/架构优化/前端框架优化9-29开发计划.md)
- [项目开发规范总览](../../docs/项目开发规范总览.md)

---

**维护者**: AI首席架构师 (专家模式)
**最后更新**: 2025年9月29日
