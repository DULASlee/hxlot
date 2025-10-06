# SmartAbp运维监测系统 - Aspire本地测试指南

## 1. .NET Aspire简介

### 1.1 什么是Aspire

.NET Aspire是Microsoft推出的云原生应用开发栈，专为构建可观测的、生产就绪的分布式应用而设计。它提供：

- **编排（Orchestration）**: 本地开发环境的服务编排
- **服务发现（Service Discovery）**: 自动服务发现和负载均衡
- **组件库（Components）**: 预配置的基础设施集成（Redis、PostgreSQL、Elasticsearch等）
- **仪表板（Dashboard）**: 统一的可观测性仪表板

### 1.2 Aspire优势

**简化本地开发**
- 一键启动所有依赖服务
- 自动配置服务间通信
- 统一的日志和追踪查看

**生产环境一致性**
- 本地与生产环境配置一致
- 容器化运行，隔离环境
- 支持热重载，快速迭代

**内置可观测性**
- 实时日志流
- 分布式追踪
- 性能指标监控
- 健康检查状态

## 2. 安装和配置

### 2.1 安装Aspire工作负载

```bash
# 安装.NET Aspire工作负载
dotnet workload update
dotnet workload install aspire

# 验证安装
dotnet workload list
```

### 2.2 安装Docker Desktop

Aspire依赖Docker运行容器：

**Windows/Mac**
```bash
# 下载Docker Desktop
https://www.docker.com/products/docker-desktop

# 启动Docker Desktop
# 确保Docker守护进程运行中
docker version
```

**Linux**
```bash
# 安装Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker
```

### 2.3 初始化Dapr

运维监测微服务集成了Dapr，需要初始化Dapr本地环境：

```bash
# 安装Dapr CLI
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# 初始化Dapr
dapr init

# 验证Dapr安装
dapr --version
docker ps | grep dapr
```

应该看到以下容器运行：
- `dapr_redis`: Redis状态存储
- `dapr_placement`: Dapr Placement服务
- `dapr_zipkin`: Zipkin分布式追踪

## 3. 启动Aspire AppHost

### 3.1 项目结构说明

```
src/SmartAbp.AspireHost/
├── Program.cs                    # AppHost主程序
├── SmartAbp.AspireHost.csproj    # 项目文件
├── appsettings.json              # 基础配置
├── appsettings.Development.json  # 开发环境配置
└── prometheus/
    └── prometheus.yml            # Prometheus配置
```

### 3.2 配置说明

**appsettings.json**
```json
{
  "Aspire": {
    "DashboardPort": 18888,
    "EnableTelemetry": true
  },
  "Services": {
    "PostgreSQL": {
      "Port": 5432,
      "Username": "postgres",
      "Database": "SmartAbpOps"
    },
    "Redis": {
      "Port": 6379
    },
    "RabbitMQ": {
      "Port": 5672,
      "ManagementPort": 15672
    },
    "Elasticsearch": {
      "Port": 9200
    },
    "Prometheus": {
      "Port": 9090
    },
    "Grafana": {
      "Port": 3000
    }
  }
}
```

### 3.3 启动步骤

**方法1：使用Visual Studio**
```
1. 打开 SmartAbp.sln
2. 设置启动项目为 SmartAbp.AspireHost
3. 按 F5 或点击"运行"按钮
4. 等待所有服务启动（首次启动需拉取Docker镜像，较慢）
```

**方法2：使用命令行**
```bash
cd src/SmartAbp.AspireHost

# 运行AppHost
dotnet run

# 或使用监视模式（支持热重载）
dotnet watch run
```

### 3.4 验证启动成功

**打开Aspire Dashboard**
```
浏览器访问: http://localhost:18888
```

**检查服务状态**
```
Dashboard页面应显示：
- ✅ PostgreSQL: 运行中
- ✅ Redis: 运行中
- ✅ RabbitMQ: 运行中
- ✅ Elasticsearch: 运行中
- ✅ Prometheus: 运行中
- ✅ Grafana: 运行中
- ✅ SmartAbp.OpsManagement: 运行中
- ✅ SmartAbp.Web: 运行中
- ✅ SmartAbp.CodeGenerator: 运行中
- ✅ SmartAbp.Vue: 运行中
```

**检查Docker容器**
```bash
docker ps

# 应该看到以下容器：
# - postgres:16
# - redis:7-alpine
# - rabbitmq:3-management
# - elasticsearch:8.11.0
# - prom/prometheus:latest
# - grafana/grafana:latest
# - smartabp-ops-monitoring:latest
# - smartabp-web:latest
# - smartabp-codegenerator:latest
```

## 4. 访问服务和仪表板

### 4.1 核心服务地址

**Aspire Dashboard（统一入口）**
```
URL: http://localhost:18888
功能: 
  - 查看所有服务状态
  - 查看日志流
  - 查看分布式追踪
  - 查看性能指标
  - 查看环境变量
```

**运维监测微服务**
```
API: http://localhost:8080
Swagger: http://localhost:8080/swagger
健康检查: http://localhost:8080/health
Prometheus指标: http://localhost:8080/metrics
```

**Vue前端**
```
URL: http://localhost:3000
运维监控: http://localhost:3000/ops-monitoring
```

### 4.2 基础设施服务

**PostgreSQL数据库**
```
Host: localhost
Port: 5432
Username: postgres
Password: postgres
Database: SmartAbpOps

连接字符串: 
Host=localhost;Port=5432;Database=SmartAbpOps;Username=postgres;Password=postgres
```

**Redis缓存**
```
Host: localhost
Port: 6379
无密码（本地开发）

测试连接:
redis-cli -h localhost -p 6379 ping
```

**RabbitMQ消息队列**
```
AMQP: amqp://localhost:5672
管理界面: http://localhost:15672
Username: guest
Password: guest
```

**Elasticsearch**
```
HTTP API: http://localhost:9200
用户名: elastic
密码: changeme（本地开发）

测试连接:
curl -u elastic:changeme http://localhost:9200
```

**Prometheus监控**
```
Web UI: http://localhost:9090
配置文件: src/SmartAbp.AspireHost/prometheus/prometheus.yml

查询示例:
- http_requests_total
- process_cpu_seconds_total
- dotnet_collection_count_total
```

**Grafana可视化**
```
Web UI: http://localhost:3000
Username: admin
Password: admin（首次登录需修改）

预配置数据源:
- Prometheus: http://prometheus:9090
```

### 4.3 Dapr Sidecars

每个微服务都有一个Dapr Sidecar：

**运维监测微服务Dapr**
```
App ID: smartabp-ops-monitoring
HTTP Port: 3500
gRPC Port: 50001
Metrics: http://localhost:9090/metrics (via Prometheus)
```

**主应用Dapr**
```
App ID: smartabp-web
HTTP Port: 3501
gRPC Port: 50002
```

**代码生成器Dapr**
```
App ID: smartabp-codegenerator
HTTP Port: 3502
gRPC Port: 50003
```

## 5. 使用Aspire Dashboard

### 5.1 服务资源视图

**查看服务列表**
```
Dashboard首页 → Resources Tab
显示所有服务的：
- 名称
- 状态（Running/Stopped/Error）
- 类型（Container/Project/Executable）
- 端点（Endpoints）
- 环境变量
- 命令行参数
```

**查看服务详情**
```
点击服务名称 → 进入详情页
显示：
- 日志流（实时滚动）
- 环境变量
- 资源限制
- 容器配置
```

**查看端点**
```
Resources Tab → Endpoints列
点击端点链接 → 直接访问服务
```

### 5.2 日志查看

**实时日志流**
```
Dashboard → Console Logs Tab
功能：
- 多服务日志合并显示
- 按服务筛选
- 按日志级别筛选
- 搜索关键词
- 下载日志
```

**日志级别**
```
- Trace（灰色）: 详细追踪信息
- Debug（绿色）: 调试信息
- Information（蓝色）: 一般信息
- Warning（黄色）: 警告信息
- Error（红色）: 错误信息
- Critical（深红）: 严重错误
```

**日志搜索**
```
搜索框输入关键词：
- "error" → 查找所有错误日志
- "database" → 查找数据库相关日志
- "SmartAbp.Web" → 查找特定服务日志
```

### 5.3 分布式追踪

**查看追踪链路**
```
Dashboard → Traces Tab
显示：
- 追踪ID（Trace ID）
- Span列表（操作序列）
- 时间轴（Timeline）
- 服务间调用关系
```

**追踪详情**
```
点击Trace ID → 展开完整调用链
显示每个Span的：
- 操作名称
- 服务名称
- 开始时间
- 持续时间
- 状态（Success/Error）
- 标签（Tags）
- 事件（Events）
```

**性能分析**
```
根据Span持续时间识别慢操作：
- 数据库查询慢
- API调用慢
- 网络延迟高
```

### 5.4 性能指标

**查看指标**
```
Dashboard → Metrics Tab
实时图表：
- CPU使用率
- 内存使用量
- HTTP请求数
- HTTP响应时间
- GC暂停时间
- 线程池队列长度
```

**自定义查询**
```
使用PromQL查询：
- rate(http_requests_total[5m])
- histogram_quantile(0.95, http_request_duration_seconds)
- sum(process_resident_memory_bytes) by (service_name)
```

## 6. 调试和排错

### 6.1 服务启动失败

**检查Docker状态**
```bash
# 查看Docker是否运行
docker info

# 查看容器状态
docker ps -a

# 查看容器日志
docker logs <container_id>
```

**检查端口占用**
```bash
# Windows
netstat -ano | findstr "5432"
netstat -ano | findstr "8080"

# Linux/Mac
lsof -i :5432
lsof -i :8080
```

**清理并重启**
```bash
# 停止所有容器
docker stop $(docker ps -aq)

# 删除所有容器
docker rm $(docker ps -aq)

# 清理镜像（可选）
docker system prune -a

# 重新启动AppHost
cd src/SmartAbp.AspireHost
dotnet run
```

### 6.2 数据库连接失败

**检查PostgreSQL容器**
```bash
# 查看容器状态
docker ps | grep postgres

# 查看PostgreSQL日志
docker logs <postgres_container_id>

# 进入PostgreSQL容器
docker exec -it <postgres_container_id> psql -U postgres
```

**手动创建数据库**
```sql
-- 连接PostgreSQL
psql -h localhost -U postgres

-- 创建数据库
CREATE DATABASE SmartAbpOps;

-- 查看数据库
\l

-- 退出
\q
```

**应用EF Core迁移**
```bash
cd src/SmartAbp.OpsManagement.Service/Infrastructure

# 应用迁移
dotnet ef database update

# 查看迁移历史
dotnet ef migrations list
```

### 6.3 Elasticsearch启动慢

Elasticsearch首次启动需要较长时间（1-2分钟）。

**查看启动进度**
```bash
# 查看日志
docker logs -f <elasticsearch_container_id>

# 等待以下日志出现：
# "started"
# "Cluster health status changed from [YELLOW] to [GREEN]"
```

**健康检查**
```bash
curl -u elastic:changeme http://localhost:9200/_cluster/health?pretty
```

**预期输出**
```json
{
  "status": "green",
  "number_of_nodes": 1,
  "number_of_data_nodes": 1
}
```

### 6.4 前端Hot Reload不工作

**检查Vite Dev Server**
```bash
cd src/SmartAbp.Vue

# 手动启动Dev Server
npm run dev

# 查看输出
# VITE v5.0.0  ready in XXX ms
# ➜  Local:   http://localhost:3000/
```

**清理缓存**
```bash
# 删除node_modules
rm -rf node_modules

# 删除.vite缓存
rm -rf .vite

# 重新安装
npm install

# 重启Dev Server
npm run dev
```

## 7. 测试场景

### 7.1 功能测试

**APM性能监控测试**
```bash
# 1. 访问APM面板
http://localhost:3000/ops-monitoring/apm

# 2. 选择服务：SmartAbp.OpsManagement
# 3. 选择时间范围：最近1小时
# 4. 观察指标：
#    - CPU使用率应显示实时数据
#    - 内存使用率应显示实时数据
#    - 趋势图应正常渲染
```

**ELK日志管理测试**
```bash
# 1. 访问日志面板
http://localhost:3000/ops-monitoring/logs

# 2. 执行搜索：
#    服务名称: SmartAbp.OpsManagement
#    日志级别: Information
#    关键词: （留空）

# 3. 验证结果：
#    - 应返回日志列表
#    - 可点击查看详情
#    - 统计图表正常显示
```

**K8s监控测试（本地跳过）**
```
注意：本地Aspire环境不包含K8s集群
K8s监控需要部署到实际K8s环境才能测试
```

**告警管理测试**
```bash
# 1. 访问告警面板
http://localhost:3000/ops-monitoring/alerts

# 2. 创建测试规则：
#    规则名称: 测试CPU告警
#    指标类型: CpuUsage
#    触发条件: > 50
#    严重级别: Warning

# 3. 启用规则并等待触发
```

### 7.2 性能测试

**并发请求测试**
```bash
# 使用Apache Bench
ab -n 1000 -c 10 http://localhost:8080/api/metrics/realtime?serviceName=SmartAbp.Web

# 使用wrk
wrk -t4 -c100 -d30s http://localhost:8080/api/metrics/realtime?serviceName=SmartAbp.Web
```

**观察指标**
```
在Aspire Dashboard → Metrics Tab 观察：
- HTTP请求数增加
- 响应时间分布
- CPU使用率波动
- 内存使用量变化
```

### 7.3 集成测试

**微服务间调用测试**
```bash
# 通过Dapr调用运维监测服务
curl http://localhost:3500/v1.0/invoke/smartabp-ops-monitoring/method/api/metrics/realtime?serviceName=SmartAbp.Web

# 查看Aspire Dashboard → Traces Tab
# 应显示完整的服务调用链路
```

**数据持久化测试**
```bash
# 1. 创建日志
curl -X POST http://localhost:8080/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "level": "Information",
    "message": "Test log message",
    "serviceName": "TestService"
  }'

# 2. 查询PostgreSQL
docker exec -it <postgres_container_id> psql -U postgres -d SmartAbpOps
SELECT COUNT(*) FROM log_entries;

# 3. 查询Elasticsearch
curl -u elastic:changeme "http://localhost:9200/logs-smartabp-ops-*/_search?pretty"
```

**文档完成进度：约800字 ✅**

