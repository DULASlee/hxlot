# SmartAbp 运维监测系统 Aspire 本地测试详细规划

**文档版本**: v1.0  
**制定时间**: 2025-10-01  
**制定人**: AI Chief Architect  
**任务代号**: P0-2  
**预计时间**: 2-3小时  
**难度等级**: ⭐⭐⭐⭐ (高挑战性)

---

## 🎯 测试目标

### 核心目标
- ✅ 验证运维监测微服务在Aspire环境下完整运行
- ✅ 验证前端4个监控面板功能正常
- ✅ 验证基础设施服务集成（PostgreSQL/Redis/Elasticsearch/Prometheus）
- ✅ 验证Dapr集成和服务间通信
- ✅ 记录完整测试报告和问题清单

### 成功标准
- 🎯 Aspire AppHost成功启动所有11个服务
- 🎯 前端可以正常访问运维监控菜单和4个面板
- 🎯 APM性能监控显示实时数据
- 🎯 ELK日志管理可以查询和展示日志
- 🎯 K8s监控显示集群信息（模拟数据）
- 🎯 告警管理可以创建和查看告警规则

---

## 📋 前置条件检查

### 1. 前端访问路径确认

**✅ 已配置的访问路径**:
```
主路径: http://localhost:5173/ops-monitoring
默认重定向: /ops-monitoring/apm

子路径:
- 性能监控: /ops-monitoring/apm
- 日志管理: /ops-monitoring/logs
- K8s监控: /ops-monitoring/k8s
- 告警管理: /ops-monitoring/alerts
```

**路由配置位置**:
- `src/SmartAbp.Vue/src/router/modules/ops-monitoring.ts` ✅
- `src/SmartAbp.Vue/src/router/index.ts` (已集成) ✅

**菜单配置状态**:
- ⚠️ **需要确认**: 主菜单是否显示"运维监控"入口
- ⚠️ **需要验证**: 菜单权限配置是否正确

**当前问题**:
- 🔍 需要检查主菜单配置文件
- 🔍 需要确认是否需要手动添加菜单项
- 🔍 需要验证权限配置

### 2. 开发环境要求

#### 必需软件
```bash
# .NET 9.0 SDK
dotnet --version  # 应输出 9.0.x

# Node.js 18+
node --version    # 应输出 v18.x 或更高

# Docker Desktop (用于基础设施服务)
docker --version  # 应输出 Docker version 24.x+
docker ps        # 确认Docker运行正常

# .NET Aspire Workload
dotnet workload list | grep aspire
```

#### 可选软件
```bash
# pgAdmin (PostgreSQL管理工具)
# RedisInsight (Redis管理工具)
# Kibana (Elasticsearch管理工具，Aspire会自动启动)
```

### 3. 端口占用检查

**需要确保以下端口未被占用**:
```
前端服务:
- 5173 (Vue Dev Server)

后端服务:
- 5000 (SmartAbp.Web API)
- 5001 (SmartAbp.OpsManagement.Service)

基础设施:
- 5432 (PostgreSQL)
- 6379 (Redis)
- 9200 (Elasticsearch)
- 5601 (Kibana)
- 9090 (Prometheus)
- 3000 (Grafana)
- 15672 (RabbitMQ Management)

Aspire Dashboard:
- 18888 (Aspire Dashboard)
- 4317 (OTLP Endpoint)
```

**端口检查命令**:
```bash
# macOS/Linux
lsof -i :5173
lsof -i :5000
lsof -i :5001
lsof -i :5432

# 如果端口被占用，可以选择：
# 1. 停止占用端口的进程
# 2. 修改Aspire配置使用其他端口
```

---

## 🚀 测试执行计划

### Phase 0: 前期准备（15分钟）

#### 步骤0.1: 检查和修复前端菜单配置
**目标**: 确保运维监控菜单在前端主界面可见

**执行步骤**:
1. 查找主菜单配置文件
   ```bash
   find src/SmartAbp.Vue/src -name "*menu*" -o -name "*nav*"
   ```

2. 检查是否需要手动添加运维监控菜单项
   - 如果使用静态菜单配置，需要添加菜单项
   - 如果使用路由自动生成菜单，需要验证meta配置

3. 验证菜单权限配置
   - 检查`requiresAuth`是否正确
   - 确认当前用户是否有访问权限

**期望结果**:
- ✅ 主菜单显示"运维监控"入口
- ✅ 点击后可以展开4个子菜单

#### 步骤0.2: 检查开发环境
```bash
# 1. 验证.NET 9.0
dotnet --version

# 2. 验证Node.js
node --version
npm --version

# 3. 验证Docker
docker --version
docker ps

# 4. 验证.NET Aspire Workload
dotnet workload list
```

**期望结果**:
- ✅ 所有必需软件已安装
- ✅ Docker Desktop正在运行

#### 步骤0.3: 清理端口占用
```bash
# 检查关键端口
lsof -i :5173
lsof -i :5000
lsof -i :5001
lsof -i :18888

# 如果有占用，停止相关进程
# kill -9 <PID>
```

**期望结果**:
- ✅ 所有关键端口空闲

---

### Phase 1: 启动基础设施服务（20分钟）

#### 步骤1.1: 启动Aspire AppHost
```bash
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.AspireHost

# 清理并重新构建
dotnet clean
dotnet build

# 启动Aspire
dotnet run
```

**期望输出**:
```
info: Aspire.Hosting.DistributedApplication[0]
      Aspire version: 9.0.0
      This version of the Aspire Static Web Assets integration is using preview features.
info: Aspire.Hosting.DistributedApplication[0]
      Dashboard is running at: https://localhost:18888
```

#### 步骤1.2: 访问Aspire Dashboard
1. 打开浏览器访问: `https://localhost:18888`
2. 查看Dashboard界面，应该看到：
   - Resources (资源列表)
   - Console Logs (控制台日志)
   - Structured Logs (结构化日志)
   - Traces (分布式追踪)
   - Metrics (性能指标)

#### 步骤1.3: 验证基础设施服务启动
在Aspire Dashboard的"Resources"标签页，检查以下服务状态：

**基础设施服务（6个）**:
```
✅ postgres        - PostgreSQL数据库 (端口5432)
✅ redis           - Redis缓存 (端口6379)
✅ rabbitmq        - RabbitMQ消息队列 (端口5672/15672)
✅ elasticsearch   - Elasticsearch搜索引擎 (端口9200)
✅ prometheus      - Prometheus监控 (端口9090)
✅ grafana         - Grafana可视化 (端口3000)
```

**检查方法**:
- 状态列显示"Running"（绿色）
- Health列显示"Healthy"
- Endpoints列显示正确的URL

**如果服务未启动**:
1. 查看Console Logs查找错误信息
2. 检查Docker Desktop是否正常
3. 检查端口是否被占用

#### 步骤1.4: 验证数据库初始化
```bash
# 连接PostgreSQL
docker exec -it <postgres-container-id> psql -U postgres

# 查看数据库
\l

# 应该看到：
# - smartabp_main (主数据库)
# - smartabp_ops (运维监测数据库)

# 连接运维监测数据库
\c smartabp_ops

# 查看表
\dt

# 应该看到：
# - performance_metrics
# - log_entries
# - k8s_resource_snapshots
# - alert_rules
```

**期望结果**:
- ✅ 所有6个基础设施服务正常运行
- ✅ PostgreSQL数据库已创建并初始化

---

### Phase 2: 启动后端微服务（20分钟）

#### 步骤2.1: 验证SmartAbp主API服务
在Aspire Dashboard检查：
```
✅ smartabp-web    - 主API服务 (端口5000)
   状态: Running
   Health: Healthy
   Endpoints: https://localhost:5000
```

**测试API可访问性**:
```bash
# 测试健康检查端点
curl https://localhost:5000/health

# 期望返回:
{
  "status": "Healthy",
  "checks": [
    {
      "name": "database",
      "status": "Healthy"
    },
    {
      "name": "redis",
      "status": "Healthy"
    }
  ]
}
```

#### 步骤2.2: 验证运维监测微服务
在Aspire Dashboard检查：
```
✅ ops-monitoring  - 运维监测微服务 (端口5001)
   状态: Running
   Health: Healthy
   Endpoints: https://localhost:5001
   Dapr Sidecar: Running (端口3500)
```

**测试API可访问性**:
```bash
# 测试健康检查
curl https://localhost:5001/health

# 测试APM性能指标API
curl https://localhost:5001/api/metrics/apm/summary

# 测试日志查询API
curl https://localhost:5001/api/logs/search \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"level":"All","limit":10}'

# 测试K8s监控API
curl https://localhost:5001/api/k8s/cluster/summary

# 测试告警管理API
curl https://localhost:5001/api/alerts/rules
```

**期望结果**:
- ✅ 所有API端点返回正常响应
- ✅ 无401/403权限错误（开发环境可能暂时跳过认证）
- ✅ Dapr Sidecar正常运行

#### 步骤2.3: 验证Dapr集成
```bash
# 检查Dapr组件状态
curl http://localhost:3500/v1.0/components

# 期望看到：
# - statestore (State Store)
# - pubsub (Pub/Sub)
# - bindings (Bindings)
```

**期望结果**:
- ✅ 主API服务正常运行
- ✅ 运维监测微服务正常运行
- ✅ Dapr Sidecar集成成功

---

### Phase 3: 启动前端服务并测试（30分钟）

#### 步骤3.1: 启动前端开发服务器
```bash
cd /Users/huanyuan/SmartAbp/hxlot/src/SmartAbp.Vue

# 安装依赖（如果需要）
npm install

# 启动开发服务器
npm run dev
```

**期望输出**:
```
VITE v5.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
➜  press h to show help
```

#### 步骤3.2: 访问前端并登录
1. 打开浏览器访问: `http://localhost:5173`
2. 登录系统（使用测试账号）
   - 用户名: `admin`
   - 密码: `1q2w3E*`

#### 步骤3.3: 验证运维监控菜单显示
**检查清单**:
- [ ] 左侧主菜单显示"运维监控"入口（图标：Monitor）
- [ ] 点击"运维监控"展开子菜单
- [ ] 子菜单显示4个选项：
  - [ ] 性能监控 (TrendCharts图标)
  - [ ] 日志管理 (Document图标)
  - [ ] K8s监控 (Grid图标)
  - [ ] 告警管理 (Bell图标)

**如果菜单不显示**:
- 🔍 检查路由配置是否正确
- 🔍 检查权限配置
- 🔍 检查浏览器控制台是否有错误
- 🔍 可能需要手动添加菜单配置

#### 步骤3.4: 测试APM性能监控面板
**操作步骤**:
1. 点击"性能监控"菜单
2. 页面应该跳转到 `/ops-monitoring/apm`
3. 等待5-10秒加载数据

**验证内容**:
- [ ] **顶部统计卡片**（4个）:
  - [ ] CPU使用率 (显示百分比和趋势图)
  - [ ] 内存使用 (显示GB和趋势图)
  - [ ] 请求总数 (显示数量和趋势图)
  - [ ] 平均响应时间 (显示ms和趋势图)

- [ ] **CPU与内存使用趋势图**:
  - [ ] 双Y轴折线图显示
  - [ ] 时间轴显示最近1小时数据
  - [ ] 图例正确显示

- [ ] **请求数与响应时间趋势图**:
  - [ ] 柱状图+折线图组合
  - [ ] 数据实时刷新（每30秒）

- [ ] **服务列表**:
  - [ ] 显示各微服务状态
  - [ ] 显示CPU/内存/请求数
  - [ ] 健康状态标识（绿色/红色）

**测试API调用**:
```javascript
// 打开浏览器开发者工具 -> Network
// 应该看到以下API请求:

GET /api/metrics/apm/summary
Response: {
  cpu: 45.2,
  memory: 2.3,
  requestCount: 1234,
  avgResponseTime: 156
}

GET /api/metrics/apm/trends?period=1h
Response: [
  { timestamp: "...", cpu: 45, memory: 2.3, requests: 120, responseTime: 150 },
  ...
]
```

**常见问题排查**:
- ❌ 如果显示"加载失败": 检查后端API是否启动
- ❌ 如果显示"无数据": 可能是后端还没有收集到数据，等待1-2分钟
- ❌ 如果CORS错误: 检查后端CORS配置

#### 步骤3.5: 测试ELK日志管理面板
**操作步骤**:
1. 点击"日志管理"菜单
2. 页面应该跳转到 `/ops-monitoring/logs`

**验证内容**:
- [ ] **顶部统计卡片**（4个）:
  - [ ] 总日志数
  - [ ] 今日新增
  - [ ] 错误日志数
  - [ ] 警告日志数

- [ ] **日志级别分布饼图**:
  - [ ] 显示Info/Warning/Error/Debug分布

- [ ] **日志趋势图**:
  - [ ] 折线图显示最近24小时趋势
  - [ ] 按小时分组

- [ ] **高级搜索功能**:
  - [ ] 日志级别筛选下拉框
  - [ ] 服务名称筛选
  - [ ] 时间范围选择器
  - [ ] 关键词搜索输入框
  - [ ] 搜索按钮

- [ ] **日志列表表格**:
  - [ ] 显示时间、级别、服务、消息
  - [ ] 分页功能
  - [ ] 每行可展开查看详情

**测试搜索功能**:
1. 选择日志级别"Error"
2. 点击"搜索"按钮
3. 验证表格只显示错误日志
4. 尝试输入关键词搜索
5. 验证时间范围筛选

**测试API调用**:
```javascript
GET /api/logs/statistics
Response: {
  totalLogs: 10234,
  todayLogs: 1234,
  errorLogs: 56,
  warningLogs: 234
}

POST /api/logs/search
Request: {
  level: "Error",
  service: "OpsManagement",
  startTime: "2025-10-01T00:00:00Z",
  endTime: "2025-10-01T23:59:59Z",
  keyword: "exception",
  page: 1,
  pageSize: 20
}
Response: {
  items: [...],
  total: 56
}
```

#### 步骤3.6: 测试K8s监控面板
**操作步骤**:
1. 点击"K8s监控"菜单
2. 页面应该跳转到 `/ops-monitoring/k8s`

**验证内容**:
- [ ] **集群概览卡片**（4个）:
  - [ ] 节点总数
  - [ ] Pod总数
  - [ ] 运行中Pod
  - [ ] 集群健康状态

- [ ] **资源标签页**:
  - [ ] Pods标签
  - [ ] Deployments标签
  - [ ] Services标签

- [ ] **Pods列表**:
  - [ ] 显示Pod名称、命名空间、状态、重启次数
  - [ ] 状态标签（Running/Pending/Failed）
  - [ ] 操作按钮：查看日志

- [ ] **Deployments列表**:
  - [ ] 显示Deployment名称、副本数、可用副本
  - [ ] 健康状态指示

- [ ] **Services列表**:
  - [ ] 显示Service名称、类型、端口

**测试查看Pod日志**:
1. 点击某个Pod的"查看日志"按钮
2. 弹出对话框显示Pod日志
3. 验证日志内容显示正确

**测试API调用**:
```javascript
GET /api/k8s/cluster/summary
Response: {
  totalNodes: 3,
  totalPods: 45,
  runningPods: 42,
  clusterHealth: "Healthy"
}

GET /api/k8s/pods
Response: [
  {
    name: "smartabp-ops-monitoring-xxx",
    namespace: "default",
    status: "Running",
    restarts: 0
  },
  ...
]
```

**注意**: K8s监控在本地测试时可能显示模拟数据，这是正常的。

#### 步骤3.7: 测试告警管理面板
**操作步骤**:
1. 点击"告警管理"菜单
2. 页面应该跳转到 `/ops-monitoring/alerts`

**验证内容**:
- [ ] **顶部统计卡片**（4个）:
  - [ ] 活跃告警数
  - [ ] 今日触发数
  - [ ] 告警规则数
  - [ ] 已处理数

- [ ] **告警规则列表**:
  - [ ] 显示规则名称、类型、阈值
  - [ ] 严重程度标签（High/Medium/Low）
  - [ ] 状态开关（启用/禁用）
  - [ ] 操作按钮：编辑、删除

- [ ] **创建告警规则按钮**:
  - [ ] 点击弹出对话框
  - [ ] 表单字段：
    - [ ] 规则名称
    - [ ] 指标类型下拉框（CPU/内存/请求数等）
    - [ ] 运算符（>/</=）
    - [ ] 阈值输入框
    - [ ] 严重程度选择
    - [ ] 目标资源
    - [ ] 通知渠道（邮件/钉钉/短信）

- [ ] **告警历史标签页**:
  - [ ] 显示历史告警记录
  - [ ] 时间、规则、严重程度、状态

**测试创建告警规则**:
1. 点击"创建告警规则"按钮
2. 填写表单：
   - 规则名称：CPU使用率过高
   - 指标类型：CPU使用率
   - 运算符：>
   - 阈值：80
   - 严重程度：High
   - 目标资源：*（所有服务）
   - 通知渠道：邮件
3. 点击"保存"
4. 验证规则出现在列表中

**测试编辑和删除**:
1. 点击某个规则的"编辑"按钮
2. 修改阈值
3. 保存并验证修改成功
4. 点击"删除"按钮
5. 确认删除并验证规则被移除

**测试API调用**:
```javascript
GET /api/alerts/statistics
Response: {
  activeAlerts: 3,
  todayTriggered: 12,
  totalRules: 8,
  resolvedAlerts: 9
}

GET /api/alerts/rules
Response: [
  {
    id: "1",
    ruleName: "CPU使用率过高",
    metricType: "cpu",
    operator: ">",
    threshold: 80,
    severity: "High",
    isEnabled: true
  },
  ...
]

POST /api/alerts/rules
Request: {
  ruleName: "...",
  metricType: "cpu",
  operator: ">",
  threshold: 80,
  severity: "High",
  targetResource: "*",
  notificationChannels: ["email"]
}
```

---

### Phase 4: 性能和压力测试（30分钟）

#### 步骤4.1: APM性能数据生成测试
**目标**: 验证系统能否持续收集和展示性能数据

**操作步骤**:
1. 保持APM监控面板打开
2. 在另一个终端执行压力测试：
   ```bash
   # 使用Apache Bench进行压力测试
   ab -n 1000 -c 10 https://localhost:5000/health
   
   # 或者使用curl循环
   for i in {1..100}; do
     curl https://localhost:5000/health
     sleep 1
   done
   ```
3. 观察APM面板数据变化：
   - CPU/内存使用率是否上升
   - 请求总数是否增加
   - 响应时间是否波动
   - 趋势图是否实时更新

**期望结果**:
- ✅ 性能指标实时更新
- ✅ 趋势图正确反映变化
- ✅ 无明显延迟或卡顿

#### 步骤4.2: 日志写入和查询测试
**目标**: 验证日志双写架构（PostgreSQL + Elasticsearch）

**操作步骤**:
1. 使用API批量写入日志：
   ```bash
   # 批量索引日志
   curl -X POST https://localhost:5001/api/logs/bulk-index \
     -H "Content-Type: application/json" \
     -d '[
       {
         "level": "Info",
         "message": "Test log 1",
         "timestamp": "2025-10-01T10:00:00Z",
         "service": "TestService"
       },
       {
         "level": "Error",
         "message": "Test error log",
         "timestamp": "2025-10-01T10:01:00Z",
         "service": "TestService"
       }
     ]'
   ```

2. 在日志管理面板搜索刚才写入的日志
3. 验证日志在表格中显示
4. 验证日志详情可以展开查看

**验证数据一致性**:
```bash
# 连接PostgreSQL查看日志
docker exec -it <postgres-container-id> psql -U postgres -d smartabp_ops
SELECT COUNT(*) FROM log_entries WHERE service = 'TestService';

# 查询Elasticsearch
curl -X GET http://localhost:9200/logs/_count \
  -H "Content-Type: application/json" \
  -d '{"query": {"term": {"service.keyword": "TestService"}}}'
```

**期望结果**:
- ✅ 日志成功写入PostgreSQL
- ✅ 日志成功索引到Elasticsearch
- ✅ 前端可以查询并显示日志
- ✅ 两个数据源数据一致

#### 步骤4.3: 长时间稳定性测试（可选）
**目标**: 验证系统长时间运行的稳定性

**操作步骤**:
1. 保持所有服务运行
2. 每隔1分钟自动刷新APM和日志面板
3. 观察30分钟，记录：
   - 内存使用是否持续增长（内存泄漏）
   - API响应时间是否稳定
   - 是否有错误日志产生
   - Aspire Dashboard是否报告异常

**期望结果**:
- ✅ 内存使用稳定（无明显泄漏）
- ✅ API响应时间稳定
- ✅ 无异常错误

---

### Phase 5: 问题排查和优化（30分钟）

#### 步骤5.1: 收集和分析日志
**Aspire Dashboard日志检查**:
1. 打开Aspire Dashboard → Structured Logs
2. 筛选`ops-monitoring`服务的日志
3. 查找Error和Warning级别的日志
4. 记录所有异常和警告

**前端浏览器控制台检查**:
1. 打开浏览器开发者工具
2. 查看Console标签页
3. 查找红色错误信息
4. 查看Network标签页，检查失败的API请求

**常见问题和解决方案**:

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| API返回401/403 | 未配置认证或权限不足 | 检查JWT配置或临时禁用认证 |
| CORS错误 | 跨域配置不正确 | 检查后端CORS策略 |
| 数据库连接失败 | 连接字符串错误 | 检查appsettings.json |
| Elasticsearch连接失败 | ES未启动或端口错误 | 检查Docker容器状态 |
| Prometheus无数据 | 未配置scrape target | 检查prometheus.yml |
| 菜单不显示 | 路由未集成或权限配置错误 | 检查菜单配置 |

#### 步骤5.2: 性能瓶颈分析
**使用Aspire Dashboard Metrics**:
1. 打开Metrics标签页
2. 选择`ops-monitoring`服务
3. 查看关键指标：
   - HTTP请求响应时间
   - 数据库查询时间
   - CPU和内存使用率
   - GC频率和时长

**性能优化建议**:
- 如果数据库查询慢：添加索引
- 如果API响应慢：启用缓存（Redis）
- 如果内存使用高：检查是否有内存泄漏
- 如果CPU使用高：优化算法或启用并发

#### 步骤5.3: 文档问题清单
**记录所有发现的问题**:
```markdown
## 测试发现问题清单

### 高优先级（必须修复）
- [ ] 问题1: 描述...
  - 影响: ...
  - 重现步骤: ...
  - 建议修复: ...

### 中优先级（建议修复）
- [ ] 问题2: ...

### 低优先级（可以延后）
- [ ] 问题3: ...

### 功能改进建议
- [ ] 建议1: ...
```

---

## 📊 测试报告模板

### 测试环境信息
```
操作系统: macOS 14.x
.NET SDK: 9.0.x
Node.js: v18.x
Docker: 24.x
Aspire: 9.0.0
```

### 测试结果总结

#### Phase 1: 基础设施服务
| 服务 | 状态 | 端口 | 备注 |
|------|------|------|------|
| PostgreSQL | ✅ | 5432 | 正常 |
| Redis | ✅ | 6379 | 正常 |
| RabbitMQ | ✅ | 5672 | 正常 |
| Elasticsearch | ✅ | 9200 | 正常 |
| Prometheus | ✅ | 9090 | 正常 |
| Grafana | ✅ | 3000 | 正常 |

#### Phase 2: 后端微服务
| 服务 | 状态 | 端口 | 健康检查 | 备注 |
|------|------|------|---------|------|
| SmartAbp.Web | ✅ | 5000 | Healthy | 正常 |
| OpsManagement | ✅ | 5001 | Healthy | 正常 |
| Dapr Sidecar | ✅ | 3500 | Running | 正常 |

#### Phase 3: 前端功能
| 功能 | 状态 | 备注 |
|------|------|------|
| 运维监控菜单 | ✅/❌ | 是否显示 |
| APM性能监控 | ✅/❌ | 数据是否正常 |
| ELK日志管理 | ✅/❌ | 搜索是否正常 |
| K8s监控 | ✅/❌ | 数据是否显示 |
| 告警管理 | ✅/❌ | CRUD是否正常 |

#### Phase 4: 性能测试
| 指标 | 结果 | 备注 |
|------|------|------|
| API响应时间 | xxx ms | P95 |
| 日志写入速度 | xxx条/秒 | |
| 内存使用 | xxx MB | 稳定性 |
| CPU使用率 | xx% | 平均值 |

### 发现的问题
1. **问题描述**: ...
   - **严重程度**: High/Medium/Low
   - **影响范围**: ...
   - **重现步骤**: ...
   - **建议修复**: ...

### 改进建议
1. **建议1**: ...
2. **建议2**: ...

### 总体评价
- **整体状态**: ✅ 良好 / ⚠️ 部分问题 / ❌ 需要修复
- **可用性**: xx% (功能正常比例)
- **稳定性**: 稳定 / 一般 / 不稳定
- **推荐**: 是否可以进入下一阶段（K8S部署）

---

## 🚀 下一步行动计划

### 如果测试全部通过
✅ 进入P1阶段：后端优化
  - P1-3: 后端健康检查系统集成
  - P1-4: 处理后端关键TODO
  - P1-5: 后端编译警告清理

✅ 准备K8S生产部署
  - 构建Docker镜像
  - 配置K8S YAML
  - 部署到K8S集群

### 如果发现严重问题
❌ 立即修复关键问题
  - 数据库连接问题
  - API认证问题
  - 前端菜单配置问题

⚠️ 记录非关键问题
  - 性能优化建议
  - UI体验改进
  - 功能增强建议

---

## 🎯 关键成功因素

### 必须完成
1. ✅ Aspire成功启动所有11个服务
2. ✅ 前端可以访问运维监控菜单
3. ✅ 至少3个监控面板功能正常（APM/Logs/Alerts）
4. ✅ API调用正常，数据正确展示

### 建议完成
1. ⭐ 所有4个监控面板完全正常
2. ⭐ 性能测试通过，无明显瓶颈
3. ⭐ 长时间稳定性测试通过
4. ⭐ 完整的测试报告和问题清单

---

## 💡 注意事项和最佳实践

### 1. 开发环境配置
- 确保Docker Desktop有足够的资源分配（至少8GB内存）
- 建议关闭其他占用端口的服务
- 使用最新版本的.NET SDK和Aspire Workload

### 2. 调试技巧
- 使用Aspire Dashboard的Structured Logs进行问题排查
- 使用浏览器开发者工具查看网络请求
- 使用Postman或curl直接测试API
- 检查后端日志文件（如果有）

### 3. 性能优化
- 开发环境可以禁用某些监控功能以提升性能
- 使用Redis缓存减少数据库查询
- 启用HTTP/2以提升并发性能
- 考虑使用连接池优化数据库连接

### 4. 安全注意事项
- 开发环境可以临时禁用认证，但要记录
- 不要在生产环境使用默认密码
- 确保敏感信息（连接字符串）不要提交到Git

---

## 📞 遇到问题时的联系方式

### 常见问题FAQ
1. **Q: Aspire启动失败？**
   A: 检查Docker是否运行，端口是否被占用，.NET Aspire Workload是否安装

2. **Q: 前端菜单不显示？**
   A: 检查路由配置，可能需要手动添加菜单项配置

3. **Q: API返回401错误？**
   A: 检查JWT配置，或在开发环境临时禁用认证

4. **Q: Elasticsearch连接失败？**
   A: 检查Docker容器状态，确认端口9200可访问

5. **Q: 数据不刷新？**
   A: 检查定时器配置，确认API调用成功，查看浏览器控制台错误

---

**🎊 测试规划制定完成！让我们开始执行吧！**

**建议执行顺序**: Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

**预计总时间**: 2-3小时（取决于遇到的问题数量）

**🚀 准备好了吗？让我们开始Phase 0的前期准备工作！**

