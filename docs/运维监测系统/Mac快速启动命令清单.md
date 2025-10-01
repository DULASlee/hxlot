# Mac系统快速启动命令清单

**一键复制粘贴执行** 🚀

---

## 🎯 启动前端（新终端窗口 #1）

```bash
# 进入前端目录
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Vue

# 启动前端开发服务器
npm run dev
```

**期望输出**:
```
VITE v7.x ready in xxx ms
➜  Local:   http://localhost:5173/
或: http://localhost:11369/
```

**访问地址**: http://localhost:5173 (或终端显示的端口)

---

## 🎯 启动后端（新终端窗口 #2）

```bash
# 进入后端目录
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Web

# 启动后端API服务
dotnet run
```

**期望输出**:
```
Now listening on: http://localhost:5000
Now listening on: https://localhost:5001
```

**测试后端**:
```bash
# 新开一个终端测试
curl http://localhost:5000/health
```

---

## 🌐 浏览器验证菜单

### 1. 打开浏览器
```
访问: http://localhost:5173
(或前端终端显示的端口号)
```

### 2. 登录系统
```
用户名: admin
密码: 1q2w3E*
```

### 3. 验证运维监控菜单

**查看左侧菜单栏**:
- ✅ 能看到"运维监控"菜单项（仪表盘图标）
- ✅ 点击展开，显示4个子菜单：
  - 📊 性能监控(APM)
  - 📄 日志管理(ELK)
  - 🖥️  K8s监控
  - 🔔 告警管理

**点击测试**:
1. 点击"性能监控" → 地址栏显示 `/ops-monitoring/apm`
2. 点击"日志管理" → 地址栏显示 `/ops-monitoring/logs`
3. 点击"K8s监控" → 地址栏显示 `/ops-monitoring/k8s`
4. 点击"告警管理" → 地址栏显示 `/ops-monitoring/alerts`

**注意**: 
- 页面可能显示"无数据"或"连接失败"是**正常的**
- 运维监测微服务还没启动（Phase 1-2任务）
- 只要菜单显示和跳转正常就算成功 ✅

---

## 🔧 如果遇到问题

### 问题1: 前端端口不是5173

**现象**: 终端显示端口是11369
```
➜  Local:   http://localhost:11369/
```

**解决**: 使用显示的端口号访问
```
访问: http://localhost:11369
```

### 问题2: 前端依赖扫描错误（但服务器已启动）

**现象**:
```
✘ [ERROR] No matching export in "packages/lowcode-core/src/index.ts"
但下面还是显示：
VITE v7.x ready in xxx ms
```

**解决**: 
1. 错误已修复（刚才的Git提交）
2. 停止前端服务器（Ctrl + C）
3. 重新启动：
```bash
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Vue
npm run dev
```

### 问题3: Node.js版本警告

**现象**:
```
You are using Node.js 21.7.2. 
Vite requires Node.js version 20.19+ or 22.12+.
```

**解决** (可选，不影响功能):
```bash
# 安装nvm（如果没有）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新打开终端，然后：
nvm install 22
nvm use 22

# 重启前端
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Vue
npm run dev
```

### 问题4: 后端端口占用

**现象**:
```
Address already in use: 'http://localhost:5000'
```

**解决**:
```bash
# 查找占用进程
lsof -i :5000

# 杀掉进程（替换<PID>为实际进程ID）
kill -9 <PID>

# 重启后端
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Web
dotnet run
```

### 问题5: 菜单不显示

**可能原因和解决方案**:

1. **用户角色不对**
   - 确保使用`admin`账号登录
   - 不要使用`user`或`guest`账号

2. **浏览器缓存**
   - macOS: 按 `Cmd + Shift + R` 强制刷新
   - 或清空缓存后刷新

3. **菜单配置未加载**
   - 打开浏览器开发者工具: `Cmd + Option + I`
   - 查看Console标签是否有错误
   - 截图发给我排查

---

## 📸 成功验证截图参考

### 1. 前端启动成功
```
✔️ 终端显示：
  VITE v7.x ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

### 2. 后端启动成功
```
✔️ 终端显示：
  Now listening on: http://localhost:5000
  Application started. Press Ctrl+C to shut down.
```

### 3. 菜单显示成功
```
✔️ 浏览器左侧菜单：
  📡 运维监控 (可展开)
    ├ 📊 性能监控(APM)
    ├ 📄 日志管理(ELK)
    ├ 🖥️  K8s监控
    └ 🔔 告警管理
```

### 4. 页面跳转成功
```
✔️ 点击"性能监控"后：
  - URL: http://localhost:5173/ops-monitoring/apm
  - 页面标题: 性能监控(APM)
  - Tab页: 可关闭
```

---

## ✅ 验证成功标志

**满足以下条件即为成功**:
- [x] 前端开发服务器成功启动
- [x] 后端API服务成功启动
- [x] 浏览器可以访问并登录
- [x] "运维监控"菜单在左侧显示
- [x] 点击菜单能展开4个子菜单
- [x] 点击子菜单能跳转到对应页面
- [x] URL地址栏正确显示路径

**即使页面内容显示"无数据"也算成功** ✅
- 因为运维监测微服务还没启动
- 我们只验证菜单和路由功能
- 这是Phase 0.1的目标

---

## 🎊 验证成功后

**恭喜！Phase 0.1圆满完成！** 🎉

**告诉我验证结果**:
- ✅ 成功：继续Phase 1（启动Aspire和基础设施）
- ❌ 失败：截图或复制错误信息，我立即帮您解决

**Phase 1预览**:
- 启动Aspire AppHost
- 启动6个基础设施服务（PostgreSQL/Redis/ES等）
- 启动运维监测微服务
- 实现4个监控面板的真实数据展示

---

**🚀 准备好了吗？开始启动系统！**

**执行顺序**:
1. 打开终端窗口 #1 → 启动前端
2. 打开终端窗口 #2 → 启动后端
3. 打开浏览器 → 验证菜单

**预计时间**: 5-10分钟

