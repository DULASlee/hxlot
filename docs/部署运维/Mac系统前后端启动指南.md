# SmartAbp Mac系统前后端启动与验证指南

**系统**: macOS  
**目标**: 启动前后端系统并验证运维监控菜单  
**预计时间**: 15-20分钟  

---

## 🎯 启动目标

1. ✅ 启动后端API服务（SmartAbp.Web）
2. ✅ 启动前端开发服务器（SmartAbp.Vue）
3. ✅ 在浏览器中登录系统
4. ✅ 验证运维监控菜单显示和功能

---

## 📋 前置检查

### 1. 检查Node.js版本

**当前问题**: 
```
You are using Node.js 21.7.2. 
Vite requires Node.js version 20.19+ or 22.12+. 
Please upgrade your Node.js version.
```

**解决方案**:
```bash
# 方法1: 使用nvm安装Node.js 22.x（推荐）
# 如果没有nvm，先安装：
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装Node.js 22.x
nvm install 22

# 切换到Node.js 22
nvm use 22

# 验证版本
node --version  # 应该显示 v22.x.x

# 方法2: 使用Homebrew
brew install node@22
brew link --overwrite node@22

# 验证
node --version
```

### 2. 检查.NET SDK版本

```bash
# 检查.NET版本
dotnet --version

# 应该显示 9.0.x
# 如果没有，安装.NET 9.0:
# brew install dotnet@9
```

### 3. 检查端口占用

```bash
# 检查前端端口（可能是5173或11369）
lsof -i :5173
lsof -i :11369

# 检查后端端口
lsof -i :5000

# 如果端口被占用，可以杀掉进程
# kill -9 <PID>
```

---

## 🚀 启动步骤

### Step 1: 修复前端导出错误（必须先做）

**问题**: `lowcode-core`包缺少stores导出

**解决方案**: 更新`lowcode-core/src/index.ts`

```typescript
// 在文件末尾添加stores导出
export * from './stores'

// 或者明确导出特定stores
export { useEntityModelingStore } from './stores/entityModeling'
export { usePageDesignStore } from './stores/pageDesign'
export { useEnhancedThemeStore } from './stores/enhancedTheme'
export { useWorkspaceStore } from './stores/workspace'
export { useCodeGenerationStore } from './stores/codeGeneration'
export { useTemplatesStore } from './stores/templates'
```

### Step 2: 启动后端API服务

**打开第1个终端窗口**:

```bash
# 进入后端项目目录
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Web

# 清理并构建
dotnet clean
dotnet build

# 启动后端服务
dotnet run

# 等待启动完成，应该看到：
# Now listening on: http://localhost:5000
# Now listening on: https://localhost:5001
```

**验证后端启动成功**:

打开新终端测试：
```bash
# 测试健康检查端点
curl http://localhost:5000/health

# 或在浏览器中访问：
# http://localhost:5000/health
# http://localhost:5000/swagger
```

### Step 3: 启动前端开发服务器

**打开第2个终端窗口**:

```bash
# 进入前端项目目录
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Vue

# 清理node_modules和重新安装（如果有导出错误）
rm -rf node_modules package-lock.json
npm install

# 启动前端开发服务器
npm run dev

# 应该看到：
# VITE v7.x ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: http://192.168.x.x:5173/
```

**注意**: 
- 如果端口是11369而不是5173，使用11369即可
- 如果看到依赖扫描错误，但服务器已启动，可以先尝试访问浏览器

---

## 🌐 浏览器验证

### Step 4: 访问前端应用

1. **打开浏览器** (推荐Chrome或Safari)
   ```
   访问: http://localhost:5173
   或: http://localhost:11369
   ```

2. **登录系统**
   - 用户名: `admin`
   - 密码: `1q2w3E*`

### Step 5: 验证运维监控菜单

**验证清单**:

#### ✅ 主菜单显示
- [ ] 左侧菜单栏显示完整
- [ ] 能看到"运维监控"菜单项（带仪表盘图标）
- [ ] 菜单位于"低代码引擎"下方

#### ✅ 展开子菜单
- [ ] 点击"运维监控"能够展开
- [ ] 显示4个子菜单：
  - [ ] 性能监控(APM) - 折线图图标
  - [ ] 日志管理(ELK) - 文档图标
  - [ ] K8s监控 - 服务器图标
  - [ ] 告警管理 - 铃铛图标

#### ✅ 页面跳转
- [ ] 点击"性能监控" → 跳转到 `/ops-monitoring/apm`
- [ ] 点击"日志管理" → 跳转到 `/ops-monitoring/logs`
- [ ] 点击"K8s监控" → 跳转到 `/ops-monitoring/k8s`
- [ ] 点击"告警管理" → 跳转到 `/ops-monitoring/alerts`

#### ✅ 页面内容
- [ ] APM页面显示（可能显示"正在加载"或空数据）
- [ ] 日志页面显示（可能显示"正在加载"或空数据）
- [ ] K8s页面显示（可能显示"正在加载"或空数据）
- [ ] 告警页面显示（可能显示"正在加载"或空数据）

**注意**: 
- 页面可能显示"无数据"或"连接失败"是正常的
- 因为运维监测微服务还没有启动
- 我们只是验证菜单和路由工作正常

---

## 🔧 常见问题排查

### 问题1: 前端启动失败（导出错误）

**症状**:
```
✘ [ERROR] No matching export in "packages/lowcode-core/src/index.ts" 
for import "useEntityModelingStore"
```

**解决方案**:
```bash
# 1. 检查lowcode-core/src/index.ts是否导出stores
cat src/SmartAbp.Vue/packages/lowcode-core/src/index.ts | grep stores

# 2. 如果没有，手动添加导出
# 编辑 packages/lowcode-core/src/index.ts，添加：
# export * from './stores'

# 3. 重启前端服务器
cd src/SmartAbp.Vue
npm run dev
```

### 问题2: 后端启动失败（端口占用）

**症状**:
```
Address already in use: 'http://localhost:5000'
```

**解决方案**:
```bash
# 查找占用端口的进程
lsof -i :5000

# 杀掉进程
kill -9 <PID>

# 重新启动后端
cd src/SmartAbp.Web && dotnet run
```

### 问题3: 菜单不显示

**可能原因**:
1. 用户角色不是管理员
2. 菜单配置未生效
3. 浏览器缓存问题

**解决方案**:
```bash
# 1. 确认使用admin账号登录

# 2. 强制刷新浏览器
# macOS: Cmd + Shift + R

# 3. 清除浏览器缓存
# 打开开发者工具 (Cmd + Option + I)
# 右键刷新按钮 → 选择"清空缓存并硬性重新加载"

# 4. 检查浏览器控制台错误
# 打开开发者工具 → Console标签
# 查看是否有红色错误信息
```

### 问题4: 页面显示404

**症状**: 点击菜单后显示"页面未找到"

**解决方案**:
```bash
# 1. 检查路由文件是否存在
ls -la src/SmartAbp.Vue/src/router/modules/ops-monitoring.ts

# 2. 检查组件文件是否存在
ls -la src/SmartAbp.Vue/src/views/ops/
# 应该看到：
# ApmDashboard.vue
# LogsDashboard.vue
# K8sDashboard.vue
# AlertDashboard.vue

# 3. 重启前端服务器
cd src/SmartAbp.Vue
npm run dev
```

### 问题5: API连接失败

**症状**: 页面显示"无法连接到服务器"

**解决方案**:
```bash
# 1. 检查后端是否运行
curl http://localhost:5000/health

# 2. 检查前端API配置
cat src/SmartAbp.Vue/.env.development
# 应该包含：
# VITE_API_BASE_URL=http://localhost:5000

# 3. 检查CORS配置
# 确保后端允许前端域名的跨域请求
```

---

## 📊 预期结果截图说明

### 1. 菜单显示效果
```
左侧菜单栏：
┌─────────────────────┐
│ 🏠 工作台          │
│ ━━━━━━━━━━━━━━━━━  │
│ 👥 用户管理        │
│ 📊 项目管理        │
│ 📝 日志管理        │
│ ━━━━━━━━━━━━━━━━━  │
│ ⚙️  系统管理       │
│ 🧪 测试功能        │
│ 🔧 低代码引擎      │
│ 📡 运维监控 ←新增  │ ✅
│   ├ 📊 性能监控    │
│   ├ 📄 日志管理    │
│   ├ 🖥️  K8s监控    │
│   └ 🔔 告警管理    │
│ ━━━━━━━━━━━━━━━━━  │
│ 👤 个人中心        │
│ ❓ 帮助中心        │
└─────────────────────┘
```

### 2. APM页面（空数据状态）
```
性能监控(APM) 页面
┌────────────────────────────┐
│ 📊 CPU使用率  💾 内存使用  │
│ ⏱️  请求总数  ⚡ 平均响应  │
├────────────────────────────┤
│                            │
│  ⚠️ 暂无数据              │
│  运维监测微服务未启动      │
│                            │
└────────────────────────────┘
```

---

## ✅ 成功标志

**菜单验证成功的标志**:
1. ✅ "运维监控"菜单在左侧菜单栏显示
2. ✅ 点击后能展开4个子菜单
3. ✅ 点击子菜单能跳转到对应页面
4. ✅ URL地址栏正确显示路径（如`/ops-monitoring/apm`）
5. ✅ 页面标题正确显示（如"性能监控(APM)"）
6. ✅ 浏览器控制台无严重错误

**即使页面显示"无数据"或"连接失败"也是成功的**，因为：
- 菜单和路由已经正常工作
- 后端运维监测微服务还没启动（这是Phase 1-2的任务）
- 我们现在只是验证前端菜单配置

---

## 🚀 验证完成后的下一步

### 如果验证成功
**恭喜！Phase 0.1完全成功！**

**下一步选项**:
1. **Phase 1**: 启动Aspire和基础设施服务
2. **Phase 2**: 启动运维监测微服务
3. **Phase 3**: 完整功能测试

### 如果验证失败
**不要担心！我们一起排查**

**排查步骤**:
1. 截图发给我，让我看看具体问题
2. 复制浏览器控制台的错误信息
3. 检查前后端服务器的启动日志
4. 我会帮您逐步解决问题

---

## 💡 Mac专用技巧

### 快捷操作

**打开多个终端窗口**:
```bash
# 方法1: 使用iTerm2（推荐）
# Cmd + D: 垂直分屏
# Cmd + Shift + D: 水平分屏

# 方法2: 使用系统终端
# Cmd + N: 新建窗口
# Cmd + T: 新建标签页
```

**快速停止服务**:
```bash
# 在运行服务的终端中按：
Ctrl + C  # 停止当前进程
```

**查看日志**:
```bash
# 后端日志（如果写入文件）
tail -f src/SmartAbp.Web/logs/app.log

# 前端日志（在终端中直接显示）
# 无需额外操作
```

---

## 📝 启动检查清单

**使用此清单逐项验证**:

### 前置准备
- [ ] Node.js版本正确（≥20.19或≥22.12）
- [ ] .NET SDK版本正确（9.0.x）
- [ ] 端口5000/5173未被占用
- [ ] 前端导出错误已修复

### 后端启动
- [ ] 后端编译成功（dotnet build）
- [ ] 后端服务启动（显示listening on localhost:5000）
- [ ] 健康检查端点可访问（/health返回200）

### 前端启动
- [ ] 前端依赖安装成功（npm install）
- [ ] 前端服务器启动（Vite显示ready）
- [ ] 浏览器可访问（http://localhost:5173）

### 菜单验证
- [ ] 成功登录系统（admin账号）
- [ ] 左侧菜单栏显示完整
- [ ] "运维监控"菜单可见
- [ ] 展开后显示4个子菜单
- [ ] 点击子菜单正确跳转
- [ ] 页面标题正确显示

---

**🎊 准备好了吗？让我们开始启动系统！**

**建议执行顺序**:
1. 先修复前端导出错误
2. 启动后端API服务
3. 启动前端开发服务器
4. 浏览器验证菜单

**预计总时间**: 15-20分钟

**遇到问题随时告诉我，我会立即帮您解决！** 🚀✨

