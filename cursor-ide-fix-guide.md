# Cursor IDE 终端卡住问题解决指南

## 🚨 问题症状
- Cursor IDE 中运行终端命令时卡住不响应
- `dotnet run` 或 `npm run dev` 命令执行后无输出
- 终端显示"正在执行"但长时间无反应
- 多个dotnet/node进程占用大量内存

## 🔍 根本原因分析

### 1. **进程冲突**
- 多个dotnet.exe进程同时运行（发现8个进程）
- 端口44379和11369被多个进程占用
- 进程间资源竞争导致响应缓慢

### 2. **Cursor IDE 特定问题**
- Cursor的终端集成可能与长时间运行的进程冲突
- PowerShell执行策略限制
- 内存使用过高导致IDE响应缓慢

### 3. **Vite配置问题**
- `strictPort: true` 导致端口冲突时直接失败
- 文件监听配置过于激进，消耗大量资源
- 网络配置不当导致代理超时

## 🛠️ 解决方案

### 立即修复步骤

#### 第1步：运行修复脚本
```powershell
# 在项目根目录执行
.\fix-cursor-terminal.ps1
```

#### 第2步：重启Cursor IDE
完全关闭Cursor IDE，然后重新打开项目。

#### 第3步：使用安全启动脚本
```powershell
# 清理模式启动（推荐首次使用）
.\start-dev-safe.ps1 -Clean -Verbose

# 正常启动
.\start-dev-safe.ps1
```

### 长期优化配置

#### 1. **Cursor IDE 设置优化**

在Cursor IDE中添加以下设置（Settings → Open Settings JSON）：

```json
{
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "terminal.integrated.profiles.windows": {
    "PowerShell": {
      "source": "PowerShell",
      "args": ["-NoLogo", "-ExecutionPolicy", "Bypass"]
    }
  },
  "terminal.integrated.enablePersistentSessions": false,
  "terminal.integrated.scrollback": 1000,
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/build/**": true,
    "**/bin/**": true,
    "**/obj/**": true,
    "**/.git/**": true
  }
}
```

#### 2. **PowerShell 执行策略**
```powershell
# 设置当前用户执行策略（管理员权限）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 3. **Windows 防火墙配置**
确保以下端口在防火墙中允许：
- 44379 (后端API)
- 11369 (前端开发服务器)
- 5000-5001 (备用端口)

## 🔧 故障排除

### 问题1：脚本执行被阻止
**解决方案：**
```powershell
# 临时绕过执行策略
PowerShell -ExecutionPolicy Bypass -File .\fix-cursor-terminal.ps1
```

### 问题2：端口仍然被占用
**解决方案：**
```powershell
# 查找占用进程
netstat -ano | findstr ":44379"
# 强制结束进程
taskkill /PID <进程ID> /F
```

### 问题3：Vite 启动失败
**解决方案：**
```powershell
# 清理缓存
cd src/SmartAbp.Vue
rm -rf node_modules/.cache
rm -rf node_modules/.vite
npm install
```

### 问题4：数据库连接问题
**解决方案：**
```powershell
# 检查SQL Server LocalDB
sqllocaldb info
sqllocaldb start MSSQLLocalDB
```

## 📋 预防措施

### 1. **定期清理**
每天开发结束后运行：
```powershell
.\fix-cursor-terminal.ps1
```

### 2. **监控资源使用**
```powershell
# 检查进程资源使用
Get-Process dotnet,node | Select-Object Name,Id,CPU,WorkingSet | Sort-Object WorkingSet -Descending
```

### 3. **使用任务管理器**
定期检查并结束不必要的dotnet/node进程。

## 🎯 最佳实践

### 开发工作流
1. **启动前检查**：运行 `fix-cursor-terminal.ps1`
2. **安全启动**：使用 `start-dev-safe.ps1 -Clean`
3. **开发过程**：避免同时运行多个开发服务器
4. **结束工作**：正确停止所有服务（Ctrl+C）

### Cursor IDE 使用建议
1. **分离终端**：为前端和后端使用不同的终端窗口
2. **资源监控**：定期检查内存使用情况
3. **重启策略**：每2-3小时重启一次IDE
4. **扩展管理**：禁用不必要的扩展

## 🚀 性能优化

### 系统级优化
```powershell
# 增加虚拟内存
# 控制面板 → 系统 → 高级系统设置 → 性能设置 → 虚拟内存

# 清理系统临时文件
cleanmgr /sagerun:1
```

### 项目级优化
- 定期清理 `bin/obj` 目录
- 使用 `.cursorindexingignore` 排除大文件
- 配置合理的文件监听规则

## 📞 技术支持

如果问题仍然存在，请提供以下信息：
1. Cursor IDE 版本
2. Windows 版本和内存配置
3. 错误日志（`log/web/` 目录）
4. 进程列表截图

---

**最后更新：** 2025年1月21日
**适用版本：** SmartAbp v1.0+, Cursor IDE v0.40+
